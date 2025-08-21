import { NextRequest, NextResponse } from "next/server";

// Cache durations in seconds
const CACHE_DURATIONS = {
  STATIC_ASSETS: 31536000, // 1 year for static assets
  API_TOURS: 1800, // 30 minutes for tours API
  API_SEARCH: 900, // 15 minutes for search results
  API_DETAILS: 3600, // 1 hour for individual tour/agency details
  PAGES_STATIC: 3600, // 1 hour for static pages
  PAGES_DYNAMIC: 300, // 5 minutes for dynamic pages
} as const;

export function addCacheHeaders(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const url = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  // Static assets (images, fonts, etc.)
  if (
    url.match(/\.(jpg|jpeg|png|gif|ico|svg|webp|woff|woff2|ttf|eot|css|js)$/)
  ) {
    response.headers.set(
      "Cache-Control",
      `public, max-age=${CACHE_DURATIONS.STATIC_ASSETS}, immutable`
    );
    return response;
  }

  // API routes
  if (url.startsWith("/api/")) {
    let cacheControl = "";

    // Tours API with search parameters
    if (url.includes("/tours") && searchParams.has("query")) {
      cacheControl = `public, s-maxage=${
        CACHE_DURATIONS.API_SEARCH
      }, max-age=${Math.floor(
        CACHE_DURATIONS.API_SEARCH / 2
      )}, stale-while-revalidate=60`;
    }
    // Regular tours API
    else if (url.includes("/tours")) {
      cacheControl = `public, s-maxage=${
        CACHE_DURATIONS.API_TOURS
      }, max-age=${Math.floor(
        CACHE_DURATIONS.API_TOURS / 2
      )}, stale-while-revalidate=120`;
    }
    // Individual tour or agency details
    else if (url.match(/\/(tour|agency)\/[^\/]+$/)) {
      cacheControl = `public, s-maxage=${
        CACHE_DURATIONS.API_DETAILS
      }, max-age=${Math.floor(
        CACHE_DURATIONS.API_DETAILS / 2
      )}, stale-while-revalidate=300`;
    }
    // Other API routes
    else {
      cacheControl = `public, s-maxage=${CACHE_DURATIONS.API_TOURS}, max-age=300, stale-while-revalidate=60`;
    }

    if (cacheControl) {
      response.headers.set("Cache-Control", cacheControl);
      response.headers.set(
        "CDN-Cache-Control",
        `public, s-maxage=${CACHE_DURATIONS.API_TOURS * 2}`
      );
      response.headers.set("Vary", "Accept-Encoding, Accept");
    }

    return response;
  }

  // Page routes
  if (url.startsWith("/tours/")) {
    // Individual tour pages
    response.headers.set(
      "Cache-Control",
      `public, s-maxage=${CACHE_DURATIONS.PAGES_STATIC}, max-age=${Math.floor(
        CACHE_DURATIONS.PAGES_STATIC / 2
      )}, stale-while-revalidate=300`
    );
  } else if (url === "/tours") {
    // Tours listing page - shorter cache due to pagination and filtering
    const hasFilters = searchParams.size > 0;
    const duration = hasFilters
      ? CACHE_DURATIONS.PAGES_DYNAMIC
      : CACHE_DURATIONS.PAGES_STATIC;

    response.headers.set(
      "Cache-Control",
      `public, s-maxage=${duration}, max-age=${Math.floor(
        duration / 2
      )}, stale-while-revalidate=120`
    );
  } else if (url === "/" || url.match(/^\/(about|contact|destinations)$/)) {
    // Static pages
    response.headers.set(
      "Cache-Control",
      `public, s-maxage=${CACHE_DURATIONS.PAGES_STATIC}, max-age=${Math.floor(
        CACHE_DURATIONS.PAGES_STATIC / 2
      )}, stale-while-revalidate=300`
    );
  }

  // Add security headers for better performance
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

// Utility to determine if a request should be cached based on user agent, headers, etc.
export function shouldCache(request: NextRequest): boolean {
  // Don't cache requests from crawlers that might have different expectations
  const userAgent = request.headers.get("user-agent")?.toLowerCase() || "";

  // Cache for regular browsers
  if (
    userAgent.includes("mozilla") ||
    userAgent.includes("chrome") ||
    userAgent.includes("safari")
  ) {
    return true;
  }

  // Don't cache for unknown or bot user agents
  if (
    userAgent.includes("bot") ||
    userAgent.includes("crawler") ||
    userAgent.includes("spider")
  ) {
    return false;
  }

  return true;
}

// Add ETag for better cache validation
export function addETag(content: string): string {
  // Simple hash function for ETag
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `"${Math.abs(hash).toString(36)}"`;
}
