import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { getStorage } from "firebase-admin/storage";

export async function POST(request: NextRequest) {
  try {
    getFirebaseAdminApp();
    const bucket = getStorage().bucket(
      `gs://${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}`
    );

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const oldStoragePath = formData.get("oldStoragePath") as string | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (oldStoragePath) {
      try {
        await bucket.file(oldStoragePath).delete();
      } catch (deleteError: any) {
        console.warn("Failed to delete old image:", deleteError.message);
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const path = "site-assets/featured-destinations";
    const fileName = `${path}/${Date.now()}-${file.name.replace(/\s/g, "_")}`;
    const fileUpload = bucket.file(fileName);

    await fileUpload.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    await fileUpload.makePublic();
    const downloadURL = fileUpload.publicUrl();

    return NextResponse.json({
      success: true,
      url: downloadURL,
      storagePath: fileName,
    });
  } catch (error: any) {
    console.error("Error uploading image:", error);
    let errorMessage = "Failed to upload image";
    if (error.message.includes("Firebase Admin SDK is not initialized")) {
      errorMessage =
        "Firebase Admin SDK is not configured on the server. Please set the FIREBASE_SERVICE_ACCOUNT_KEY environment variable.";
    } else if (
      error.code === "storage/unauthorized" ||
      error.message.includes("permission")
    ) {
      errorMessage =
        "The server does not have permission to upload to Firebase Storage. Please check IAM roles for the service account.";
    } else {
      errorMessage =
        error.message || "An unknown error occurred during upload.";
    }
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
