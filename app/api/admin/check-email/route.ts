import { NextRequest, NextResponse } from "next/server";
import { validateEmail } from "@/lib/utils/email-validation";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Use Firebase Admin SDK for server-side operations
    try {
      const { getFirebaseAdminDB } = await import("@/lib/firebase/admin");
      const db = getFirebaseAdminDB();

      const emailSnapshot = await db
        .collection("admin-users")
        .where("email", "==", email.toLowerCase())
        .get();

      const exists = !emailSnapshot.empty;

      return NextResponse.json({ exists }, { status: 200 });
    } catch (error) {
      console.error("Firebase Admin SDK error:", error);

      // Fallback to client SDK
      try {
        const { getFirebaseDB } = await import("@/lib/firebase/init");
        const db = getFirebaseDB();

        const emailSnapshot = await db
          .collection("admin-users")
          .where("email", "==", email.toLowerCase())
          .get();

        const exists = !emailSnapshot.empty;

        return NextResponse.json({ exists }, { status: 200 });
      } catch (fallbackError) {
        console.error("Client SDK fallback error:", fallbackError);
        return NextResponse.json(
          { error: "Failed to check email availability" },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error("Error checking email:", error);
    return NextResponse.json(
      { error: "Failed to check email availability" },
      { status: 500 }
    );
  }
}
