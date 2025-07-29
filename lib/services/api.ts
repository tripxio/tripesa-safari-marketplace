import type {
  ApiResponse,
  Agency,
  TourPackage,
  InquiryRequest,
  InquiryResponse,
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface TourFilters {
  query?: string;
  location?: {
    lat: number;
    lng: number;
  };
  order?:
    | "oldest"
    | "latest"
    | "price_asc"
    | "price_desc"
    | "name_asc"
    | "name_desc";
  category?: string;
  page?: number;
}

// In-memory cache for frequently accessed data
const memoryCache = new Map<
  string,
  { data: any; timestamp: number; ttl: number }
>();

// Cache utility functions
const getCacheKey = (prefix: string, params: any): string => {
  return `${prefix}_${JSON.stringify(params)}`;
};

const isValidCache = (cacheEntry: { timestamp: number; ttl: number }) => {
  return Date.now() - cacheEntry.timestamp < cacheEntry.ttl;
};

const setMemoryCache = (key: string, data: any, ttlMs: number) => {
  memoryCache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
};

const getMemoryCache = (key: string) => {
  const cached = memoryCache.get(key);
  if (cached && isValidCache(cached)) {
    return cached.data;
  }
  memoryCache.delete(key);
  return null;
};

export const getTours = async (
  filters: TourFilters = {},
  page: number = 1
): Promise<ApiResponse> => {
  // Create cache key for this specific request
  const cacheKey = getCacheKey("tours", { ...filters, page });

  // Check memory cache first (5 minutes for tours data)
  const cachedData = getMemoryCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const params = new URLSearchParams();

  // Add query parameter for text search
  if (filters.query) {
    params.append("query", filters.query);
  }

  // Add location parameters for geographic search
  if (filters.location) {
    params.append("location[lat]", filters.location.lat.toString());
    params.append("location[lng]", filters.location.lng.toString());
  }

  // Add order parameter for sorting
  if (filters.order) {
    params.append("order", filters.order);
  }

  // Add category parameter
  if (filters.category) {
    params.append("category", filters.category);
  }

  // Add page parameter
  params.append("page", page.toString());

  // Dynamic cache timing based on request type
  let revalidateTime = 1800; // 30 minutes default

  // More aggressive caching for static-like requests
  if (!filters.query && !filters.location && page === 1) {
    revalidateTime = 3600; // 1 hour for landing page data
  }

  // Shorter cache for search results (more dynamic)
  if (filters.query) {
    revalidateTime = 900; // 15 minutes for search results
  }

  const response = await fetch(`${API_BASE_URL}/tours?${params.toString()}`, {
    next: {
      revalidate: revalidateTime,
      tags: [
        "tours",
        `tours-page-${page}`,
        filters.category ? `category-${filters.category}` : "all-categories",
      ],
    },
    headers: {
      "Cache-Control": `s-maxage=${revalidateTime}, stale-while-revalidate=60`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tours");
  }

  const data = await response.json();

  // Cache in memory for quick subsequent access
  setMemoryCache(cacheKey, data, 300000); // 5 minutes in memory

  return data;
};

export const getAgency = async (
  agencyId: number
): Promise<{ data: Agency }> => {
  const cacheKey = getCacheKey("agency", { agencyId });

  // Check memory cache first (longer cache for agency data - 15 minutes)
  const cachedData = getMemoryCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const response = await fetch(`${API_BASE_URL}/agencies/${agencyId}/show`, {
    next: {
      revalidate: 7200, // 2 hours for agency data (changes less frequently)
      tags: ["agencies", `agency-${agencyId}`],
    },
    headers: {
      "Cache-Control": "s-maxage=7200, stale-while-revalidate=120",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch agency");
  }

  const data = await response.json();

  // Cache in memory for 15 minutes
  setMemoryCache(cacheKey, data, 900000);

  return data;
};

export const getTour = async (slug: string): Promise<{ data: TourPackage }> => {
  // Create cache key for this specific tour
  const cacheKey = getCacheKey("tour", { slug });

  // Check memory cache first (30 minutes for individual tour data)
  const cachedData = getMemoryCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const response = await fetch(`${API_BASE_URL}/tours/${slug}/show`, {
    next: {
      revalidate: 1800, // 30 minutes
      tags: ["tours", `tour-${slug}`],
    },
    headers: {
      "Cache-Control": "s-maxage=1800, stale-while-revalidate=120",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tour");
  }

  const data = await response.json();

  // Cache in memory for 30 minutes
  setMemoryCache(cacheKey, data, 1800000);

  return data;
};

// Inquiry API
export const submitInquiry = async (
  agencySlug: string,
  inquiryData: InquiryRequest
): Promise<InquiryResponse> => {
  // Use the base URL without /search for agency endpoints
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/search", "/api");

  const response = await fetch(`${baseUrl}/agency/${agencySlug}/inquiry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(inquiryData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Cache cleanup utility - call periodically to prevent memory leaks
export const cleanupCache = () => {
  const now = Date.now();
  for (const [key, value] of memoryCache.entries()) {
    if (!isValidCache(value)) {
      memoryCache.delete(key);
    }
  }
};

// Prefetch popular data
export const prefetchPopularTours = async () => {
  try {
    // Prefetch first page with no filters (most common request)
    await getTours({}, 1);

    // Prefetch common categories if you have them
    const popularCategories = ["wildlife", "adventure", "cultural"];
    popularCategories.forEach(async (category) => {
      await getTours({ category }, 1);
    });
  } catch (error) {
    console.warn("Prefetch failed:", error);
  }
};

// Run cleanup every 10 minutes
if (typeof window !== "undefined") {
  setInterval(cleanupCache, 600000);
}
