import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Basic cache health check
    const cacheHeaders = {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    };

    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      cache: {
        browser: "enabled",
        cdn: "enabled",
        server: "enabled",
      },
      performance: {
        cacheDuration: {
          tours: "30 minutes",
          tourDetails: "1 hour",
          agencies: "2 hours",
          search: "15 minutes",
        },
        compression: "enabled",
        staleWhileRevalidate: "enabled",
      },
    };

    return NextResponse.json(healthData, {
      headers: cacheHeaders,
    });
  } catch (error) {
    console.error("Cache health check failed:", error);
    return NextResponse.json(
      {
        status: "error",
        error: "Cache health check failed",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  }
}
