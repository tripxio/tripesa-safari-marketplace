import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { getStorage } from "firebase-admin/storage";

// Initialize the admin app to access storage
getFirebaseAdminApp();
const bucket = getStorage().bucket(
  `gs://${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}`
);

async function uploadImageFromURL(
  imageUrl: string
): Promise<{ url: string; storagePath: string }> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const fileName = `site-assets/featured-destinations/${Date.now()}-${
    imageUrl.split("/").pop()?.split("?")[0] || "image.jpg"
  }`;
  const file = bucket.file(fileName);

  await file.save(buffer, {
    metadata: {
      contentType: response.headers.get("content-type") || "image/jpeg",
    },
  });

  await file.makePublic();
  const downloadURL = file.publicUrl();

  return { url: downloadURL, storagePath: fileName };
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();
    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    const { url, storagePath } = await uploadImageFromURL(imageUrl);

    return NextResponse.json({
      success: true,
      url,
      storagePath,
    });
  } catch (error: any) {
    console.error("Error processing image from URL:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process image" },
      { status: 500 }
    );
  }
}
