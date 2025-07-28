import { NextRequest, NextResponse } from "next/server";
import { getBannerConfig } from "@/lib/firebase/config-service";

export async function GET(request: NextRequest) {
  try {
    const config = await getBannerConfig();

    if (!config) {
      return NextResponse.json(
        { error: "No banner configuration found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Error fetching banner config:", error);
    return NextResponse.json(
      { error: "Failed to fetch banner configuration" },
      { status: 500 }
    );
  }
}
