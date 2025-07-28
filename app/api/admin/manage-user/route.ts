import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { action, userId } = await request.json();

    if (!action || !userId) {
      return NextResponse.json(
        { error: "Action and userId are required" },
        { status: 400 }
      );
    }

    // Use Firebase Admin SDK for server-side operations
    try {
      const { getFirebaseAdminDB } = await import("@/lib/firebase/admin");
      const db = getFirebaseAdminDB();

      switch (action) {
        case "deactivate":
          await db.collection("admin-users").doc(userId).update({
            isActive: false,
          });
          break;
        case "activate":
          await db.collection("admin-users").doc(userId).update({
            isActive: true,
          });
          break;
        default:
          return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
          );
      }

      return NextResponse.json(
        {
          message: `User ${
            action === "deactivate" ? "deactivated" : "activated"
          } successfully`,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      return NextResponse.json(
        { error: `Failed to ${action} user` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in manage-user API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
