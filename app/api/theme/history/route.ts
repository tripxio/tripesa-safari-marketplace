import { NextRequest, NextResponse } from "next/server";
import { getThemeVersions } from "@/lib/firebase/config-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const versions = await getThemeVersions(limit);

    return NextResponse.json({
      success: true,
      data: versions,
      count: versions.length,
    });
  } catch (error) {
    console.error("Error fetching theme versions:", error);
    return NextResponse.json(
      { error: "Failed to fetch theme version history" },
      { status: 500 }
    );
  }
}
