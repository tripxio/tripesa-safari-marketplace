import { NextRequest, NextResponse } from "next/server";
import {
  generateSecurePassword,
  sendAccountCreationEmail,
  validateEmail,
} from "@/lib/email/email-service";

export async function POST(request: NextRequest) {
  try {
    const { email, name, role = "admin" } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Check if email already exists in admin-users collection
    let emailSnapshot;
    try {
      const { getFirebaseAdminDB } = await import("@/lib/firebase/admin");
      const db = getFirebaseAdminDB();
      emailSnapshot = await db
        .collection("admin-users")
        .where("email", "==", email.toLowerCase())
        .get();
    } catch (error) {
      console.warn("Firebase Admin SDK not available, using client SDK");
      // Fallback to client SDK
      const { getFirebaseDB } = await import("@/lib/firebase/init");
      const { collection, query, where, getDocs } = await import(
        "firebase/firestore"
      );

      const q = query(
        collection(getFirebaseDB(), "admin-users"),
        where("email", "==", email.toLowerCase())
      );
      emailSnapshot = await getDocs(q);
    }

    if (!emailSnapshot.empty) {
      return NextResponse.json(
        { error: "An admin user with this email address already exists" },
        { status: 400 }
      );
    }

    // Generate a secure password
    const password = generateSecurePassword();

    // Create user in Firebase Auth
    let userRecord;
    try {
      const { getFirebaseAdminAuth } = await import("@/lib/firebase/admin");
      const auth = getFirebaseAdminAuth();
      userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });
    } catch (error) {
      console.warn(
        "Firebase Admin SDK not available for Auth, using client SDK"
      );
      // Fallback to client SDK - but this won't work on server-side
      // We need to return an error instead
      return NextResponse.json(
        {
          error:
            "Firebase Admin SDK is required for user creation. Please set up FIREBASE_SERVICE_ACCOUNT_KEY in your environment variables.",
        },
        { status: 500 }
      );
    }

    // Create admin user document
    const adminUser = {
      email: email.toLowerCase(), // Store email in lowercase for consistency
      role,
      name,
      twoFactorEnabled: false,
      createdAt: new Date(),
      isActive: true,
    };

    try {
      const { getFirebaseAdminDB } = await import("@/lib/firebase/admin");
      const db = getFirebaseAdminDB();
      await db.collection("admin-users").doc(userRecord.uid).set(adminUser);
    } catch (error) {
      console.warn(
        "Firebase Admin SDK not available for Firestore, using client SDK"
      );
      // Fallback to client SDK
      const { getFirebaseDB } = await import("@/lib/firebase/init");
      const { doc, setDoc } = await import("firebase/firestore");

      await setDoc(
        doc(getFirebaseDB(), "admin-users", userRecord.uid),
        adminUser
      );
    }

    // Send email notification with credentials
    try {
      await sendAccountCreationEmail(email, name, password);
    } catch (emailError) {
      console.error("Failed to send account creation email:", emailError);
      // Don't fail the user creation if email fails
    }

    return NextResponse.json(
      {
        message: "Admin user created successfully",
        uid: userRecord.uid,
        emailSent: true,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error creating admin user:", error);

    if (error.code === "auth/email-already-in-use") {
      return NextResponse.json(
        { error: "Email is already registered in Firebase Auth" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create admin user" },
      { status: 500 }
    );
  }
}
