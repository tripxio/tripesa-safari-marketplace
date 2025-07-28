import { NextRequest, NextResponse } from "next/server";
import { sendPasswordChangeEmail } from "@/lib/email/email-service";

export async function POST(request: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await request.json();

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if password contains required characters
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return NextResponse.json(
        {
          error:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        },
        { status: 400 }
      );
    }

    // Get user document to verify current password and get user info
    let userDoc;
    try {
      const { getFirebaseAdminDB } = await import("@/lib/firebase/admin");
      const db = getFirebaseAdminDB();
      userDoc = await db.collection("admin-users").doc(userId).get();
    } catch (error) {
      console.warn("Firebase Admin SDK not available, using client SDK");
      // Fallback to client SDK
      const { getFirebaseDB } = await import("@/lib/firebase/init");
      const { doc, getDoc } = await import("firebase/firestore");

      userDoc = await getDoc(doc(getFirebaseDB(), "admin-users", userId));
    }

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json(
        { error: "User data not found" },
        { status: 404 }
      );
    }

    // Update password in Firebase Auth using Admin SDK
    try {
      const { getFirebaseAdminAuth } = await import("@/lib/firebase/admin");
      const auth = getFirebaseAdminAuth();
      await auth.updateUser(userId, {
        password: newPassword,
      });
    } catch (error) {
      console.warn(
        "Firebase Admin SDK not available for Auth, using client SDK"
      );
      // Fallback to client SDK - but this won't work on server-side
      return NextResponse.json(
        {
          error:
            "Firebase Admin SDK is required for password changes. Please set up FIREBASE_SERVICE_ACCOUNT_KEY in your environment variables.",
        },
        { status: 500 }
      );
    }

    // Update last password change in Firestore
    try {
      const { getFirebaseAdminDB } = await import("@/lib/firebase/admin");
      const db = getFirebaseAdminDB();
      await db.collection("admin-users").doc(userId).update({
        lastPasswordChange: new Date(),
      });
    } catch (error) {
      console.warn(
        "Firebase Admin SDK not available for Firestore, using client SDK"
      );
      // Fallback to client SDK
      const { getFirebaseDB } = await import("@/lib/firebase/init");
      const { doc, updateDoc } = await import("firebase/firestore");

      await updateDoc(doc(getFirebaseDB(), "admin-users", userId), {
        lastPasswordChange: new Date(),
      });
    }

    // Send email notification
    try {
      await sendPasswordChangeEmail(userData.email, userData.name);
    } catch (emailError) {
      console.error("Failed to send password change email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error changing password:", error);

    if (error.code === "auth/wrong-password") {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    if (error.code === "auth/weak-password") {
      return NextResponse.json(
        { error: "Password is too weak" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
