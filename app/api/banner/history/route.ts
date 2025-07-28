import { NextRequest, NextResponse } from "next/server";
import { getBannerVersions } from "@/lib/firebase/config-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const versions = await getBannerVersions(limit);

    return NextResponse.json({
      success: true,
      data: versions,
      count: versions.length,
    });
  } catch (error) {
    console.error("Error fetching banner versions:", error);
    return NextResponse.json(
      { error: "Failed to fetch banner version history" },
      { status: 500 }
    );
  }
}
