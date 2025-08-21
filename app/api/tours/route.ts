import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get the external API base URL
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!API_BASE_URL) {
      return NextResponse.json(
        { error: "API base URL not configured" },
        { status: 500 }
      );
    }

    // Forward all search parameters to the external API
    const externalUrl = `${API_BASE_URL}/tours?${searchParams.toString()}`;

    // Determine cache duration based on request type
    const hasQuery = searchParams.has("query");
    const hasLocation =
      searchParams.has("location[lat]") && searchParams.has("location[lng]");
    const page = parseInt(searchParams.get("page") || "1");

    let cacheMaxAge = 1800; // 30 minutes default

    // Shorter cache for search results (more dynamic)
    if (hasQuery || hasLocation) {
      cacheMaxAge = 900; // 15 minutes
    }

    // Longer cache for first page with no filters (most common)
    if (
      page === 1 &&
      !hasQuery &&
      !hasLocation &&
      !searchParams.has("category")
    ) {
      cacheMaxAge = 3600; // 1 hour
    }

    const response = await fetch(externalUrl, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      next: {
        revalidate: cacheMaxAge,
        tags: [
          "tours",
          `tours-page-${page}`,
          searchParams.get("category")
            ? `category-${searchParams.get("category")}`
            : "all-categories",
          hasQuery ? `search-${searchParams.get("query")}` : "no-search",
        ],
      },
    });

    if (!response.ok) {
      console.error(
        "External API error:",
        response.status,
        response.statusText
      );
      return NextResponse.json(
        { error: "Failed to fetch tours from external API" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Create response with optimized cache headers
    const apiResponse = NextResponse.json(data);

    // Set cache headers
    apiResponse.headers.set(
      "Cache-Control",
      `public, s-maxage=${cacheMaxAge}, max-age=${Math.floor(
        cacheMaxAge / 2
      )}, stale-while-revalidate=120`
    );

    // CDN cache headers
    apiResponse.headers.set(
      "CDN-Cache-Control",
      `public, s-maxage=${cacheMaxAge * 2}`
    );

    // Enable compression
    apiResponse.headers.set("Vary", "Accept-Encoding, Accept");

    // Add cache status for monitoring
    apiResponse.headers.set("X-Cache-Status", "MISS");

    return apiResponse;
  } catch (error) {
    console.error("Tours API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
