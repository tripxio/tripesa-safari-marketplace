import { NextRequest, NextResponse } from "next/server";
import { getThemeConfig } from "@/lib/firebase/config-service";

export async function GET(request: NextRequest) {
  try {
    const config = await getThemeConfig();

    if (!config) {
      return NextResponse.json(
        { error: "No theme configuration found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Error fetching theme config:", error);
    return NextResponse.json(
      { error: "Failed to fetch theme configuration" },
      { status: 500 }
    );
  }
}
