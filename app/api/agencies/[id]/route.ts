import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const agencyId = parseInt(id);

    if (isNaN(agencyId)) {
      return NextResponse.json({ error: "Invalid agency ID" }, { status: 400 });
    }

    // Get the external API base URL
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!API_BASE_URL) {
      return NextResponse.json(
        { error: "API base URL not configured" },
        { status: 500 }
      );
    }

    // Construct the external API URL
    const baseUrl = API_BASE_URL.replace("/api/search", "/api");
    const externalUrl = `${baseUrl}/agencies/${agencyId}/show`;

    const response = await fetch(externalUrl, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 7200, // 2 hours for agencies (they change less frequently)
        tags: ["agencies", `agency-${agencyId}`, "agency-details"],
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Agency not found" },
          { status: 404 }
        );
      }

      console.error(
        "External API error:",
        response.status,
        response.statusText
      );
      return NextResponse.json(
        { error: "Failed to fetch agency from external API" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Create response with optimized cache headers
    const apiResponse = NextResponse.json(data);

    // Set cache headers - longest cache for agencies
    apiResponse.headers.set(
      "Cache-Control",
      "public, s-maxage=7200, max-age=3600, stale-while-revalidate=600"
    );

    // CDN cache headers - very long for agencies
    apiResponse.headers.set("CDN-Cache-Control", "public, s-maxage=14400");

    // Enable compression
    apiResponse.headers.set("Vary", "Accept-Encoding, Accept");

    // Add cache status for monitoring
    apiResponse.headers.set("X-Cache-Status", "MISS");

    return apiResponse;
  } catch (error) {
    console.error("Agency API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
