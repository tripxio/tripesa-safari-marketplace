import { NextRequest, NextResponse } from "next/server";
import { googleAnalyticsService } from "@/lib/firebase/google-analytics-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const startDate = searchParams.get("startDate") || "7daysAgo";
    const endDate = searchParams.get("endDate") || "today";

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Fetch real analytics data from Google Analytics Data API
    const analyticsData = await googleAnalyticsService.getAnalyticsData(
      startDate,
      endDate
    );

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Error fetching Google Analytics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}

// POST endpoint is no longer needed since we're not storing custom data
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: "Analytics data is now fetched from Google Analytics Data API" },
    { status: 200 }
  );
}
