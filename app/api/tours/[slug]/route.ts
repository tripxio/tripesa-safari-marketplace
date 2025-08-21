import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;

    // Get the external API base URL
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!API_BASE_URL) {
      return NextResponse.json(
        { error: "API base URL not configured" },
        { status: 500 }
      );
    }

    // Construct the external API URL
    const externalUrl = `${API_BASE_URL}/tours/${slug}/show`;

    const response = await fetch(externalUrl, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 1800, // 30 minutes for individual tours
        tags: ["tours", `tour-${slug}`, "tour-details"],
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Tour not found" }, { status: 404 });
      }

      console.error(
        "External API error:",
        response.status,
        response.statusText
      );
      return NextResponse.json(
        { error: "Failed to fetch tour from external API" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Create response with optimized cache headers
    const apiResponse = NextResponse.json(data);

    // Set cache headers - longer cache for individual tours
    apiResponse.headers.set(
      "Cache-Control",
      "public, s-maxage=1800, max-age=900, stale-while-revalidate=300"
    );

    // CDN cache headers - even longer for individual tours
    apiResponse.headers.set("CDN-Cache-Control", "public, s-maxage=3600");

    // Enable compression
    apiResponse.headers.set("Vary", "Accept-Encoding, Accept");

    // Add cache status for monitoring
    apiResponse.headers.set("X-Cache-Status", "MISS");

    return apiResponse;
  } catch (error) {
    console.error("Tour detail API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
