import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminAuth, getFirebaseAdminDB } from "@/lib/firebase/admin";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDB } from "@/lib/firebase/init";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ exists: false, error: "Email is required" });
  }

  try {
    const adminDb = getFirebaseAdminDB();
    const adminQuery = adminDb
      .collection("admin-users")
      .where("email", "==", email.toLowerCase());
    const adminSnapshot = await adminQuery.get();

    if (!adminSnapshot.empty) {
      return NextResponse.json({ exists: true });
    }

    return NextResponse.json({ exists: false });
  } catch (adminError) {
    console.warn(
      "Admin SDK check failed, falling back to client SDK:",
      adminError
    );
    try {
      const db = getFirebaseDB();
      const usersCollection = collection(db, "admin-users");
      const q = query(
        usersCollection,
        where("email", "==", email.toLowerCase())
      );
      const emailSnapshot = await getDocs(q);

      if (!emailSnapshot.empty) {
        return NextResponse.json({ exists: true });
      }
      return NextResponse.json({ exists: false });
    } catch (clientError) {
      console.error("Client SDK check also failed:", clientError);
      return NextResponse.json({
        exists: false,
        error: "Failed to check email existence",
      });
    }
  }
}
