import useSWR from "swr";
import type { ApiResponse, TourPackage, Agency } from "@/lib/types";
import {
  createCacheKey,
  getSWRConfig,
  CACHE_DURATIONS,
} from "@/lib/cache/swr-config";

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

// Custom fetcher that uses our enhanced API service
const apiBaseFetcher = async (url: string) => {
  // Extract the endpoint and filters from the SWR key
  const [endpoint, ...params] = url.split("?");

  if (endpoint.includes("/tours") && !endpoint.includes("/tours/")) {
    // This is a tours list request
    const urlParams = new URLSearchParams(params.join("?"));
    const filters: TourFilters = {};

    if (urlParams.get("query")) filters.query = urlParams.get("query")!;
    if (urlParams.get("category"))
      filters.category = urlParams.get("category")!;
    if (urlParams.get("order")) filters.order = urlParams.get("order") as any;
    if (urlParams.get("location[lat]") && urlParams.get("location[lng]")) {
      filters.location = {
        lat: parseFloat(urlParams.get("location[lat]")!),
        lng: parseFloat(urlParams.get("location[lng]")!),
      };
    }

    const page = urlParams.get("page") ? parseInt(urlParams.get("page")!) : 1;

    // Import getTours dynamically to avoid circular imports
    const { getTours } = await import("@/lib/services/api");
    return getTours(filters, page);
  }

  if (endpoint.includes("/tours/") && endpoint.includes("/show")) {
    // This is a single tour request
    const slug = endpoint.split("/tours/")[1].split("/show")[0];
    const { getTour } = await import("@/lib/services/api");
    return getTour(slug);
  }

  if (endpoint.includes("/agency/")) {
    // This is an agency request
    const agencyId = parseInt(endpoint.split("/agency/")[1]);
    const { getAgency } = await import("@/lib/services/api");
    return getAgency(agencyId);
  }

  // Fallback to regular fetch for other endpoints
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Hook for fetching tours with enhanced caching
export const useTours = (filters: TourFilters = {}, page: number = 1) => {
  // Determine cache duration based on request type
  let cacheConfig = getSWRConfig("TOURS_LIST");

  // Use longer cache for static-like requests (first page, no search)
  if (!filters.query && !filters.location && page === 1) {
    cacheConfig = getSWRConfig("STATIC_DATA");
  }

  // Shorter cache for search results
  if (filters.query || filters.location) {
    cacheConfig = getSWRConfig("SEARCH_RESULTS");
  }

  const params = new URLSearchParams();
  if (filters.query) params.append("query", filters.query);
  if (filters.category) params.append("category", filters.category);
  if (filters.order) params.append("order", filters.order);
  if (filters.location) {
    params.append("location[lat]", filters.location.lat.toString());
    params.append("location[lng]", filters.location.lng.toString());
  }
  params.append("page", page.toString());

  const cacheKey = createCacheKey("/tours", Object.fromEntries(params));

  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    cacheKey,
    apiBaseFetcher,
    {
      ...cacheConfig,
      // Enable background revalidation for better UX
      revalidateOnMount: true,
      // Keep previous data while loading new data
      keepPreviousData: true,
    }
  );

  return {
    tours: data?.data || [],
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || page,
    totalTours: data?.total || 0,
    isLoading,
    isError: error,
    mutate, // For manual cache invalidation
  };
};

// Hook for fetching a single tour
export const useTour = (slug: string) => {
  const cacheKey = createCacheKey(`/tours/${slug}/show`);

  const { data, error, isLoading, mutate } = useSWR<{ data: TourPackage }>(
    slug ? cacheKey : null, // Only fetch if slug is provided
    apiBaseFetcher,
    getSWRConfig("TOUR_DETAIL")
  );

  return {
    tour: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for fetching agency data
export const useAgency = (agencyId: number) => {
  const cacheKey = createCacheKey(`/agency/${agencyId}`);

  const { data, error, isLoading, mutate } = useSWR<{ data: Agency }>(
    agencyId ? cacheKey : null, // Only fetch if agencyId is provided
    apiBaseFetcher,
    getSWRConfig("AGENCY_DATA")
  );

  return {
    agency: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for prefetching tours (useful for predictive loading)
export const usePrefetchTours = () => {
  const { mutate: globalMutate } = useSWR();

  const prefetchTours = async (filters: TourFilters = {}, page: number = 1) => {
    const params = new URLSearchParams();
    if (filters.query) params.append("query", filters.query);
    if (filters.category) params.append("category", filters.category);
    if (filters.order) params.append("order", filters.order);
    if (filters.location) {
      params.append("location[lat]", filters.location.lat.toString());
      params.append("location[lng]", filters.location.lng.toString());
    }
    params.append("page", page.toString());

    const cacheKey = createCacheKey("/tours", Object.fromEntries(params));

    // Pre-populate the cache
    await globalMutate(cacheKey, apiBaseFetcher(cacheKey));
  };

  const prefetchTour = async (slug: string) => {
    const cacheKey = createCacheKey(`/tours/${slug}/show`);
    await globalMutate(cacheKey, apiBaseFetcher(cacheKey));
  };

  const prefetchAgency = async (agencyId: number) => {
    const cacheKey = createCacheKey(`/agency/${agencyId}`);
    await globalMutate(cacheKey, apiBaseFetcher(cacheKey));
  };

  return {
    prefetchTours,
    prefetchTour,
    prefetchAgency,
  };
};

// Cache invalidation utilities
export const useToursCache = () => {
  const { mutate: globalMutate } = useSWR();

  const invalidateToursCache = async (filters?: TourFilters) => {
    if (filters) {
      // Invalidate specific filters
      const params = new URLSearchParams();
      if (filters.query) params.append("query", filters.query);
      if (filters.category) params.append("category", filters.category);
      if (filters.order) params.append("order", filters.order);
      if (filters.location) {
        params.append("location[lat]", filters.location.lat.toString());
        params.append("location[lng]", filters.location.lng.toString());
      }

      const cacheKey = createCacheKey("/tours", Object.fromEntries(params));
      await globalMutate(cacheKey);
    } else {
      // Invalidate all tours cache entries
      await globalMutate(
        (key) => typeof key === "string" && key.includes("/tours")
      );
    }
  };

  const invalidateTourCache = async (slug: string) => {
    const cacheKey = createCacheKey(`/tours/${slug}/show`);
    await globalMutate(cacheKey);
  };

  const invalidateAgencyCache = async (agencyId: number) => {
    const cacheKey = createCacheKey(`/agency/${agencyId}`);
    await globalMutate(cacheKey);
  };

  return {
    invalidateToursCache,
    invalidateTourCache,
    invalidateAgencyCache,
  };
};
