import { SWRConfiguration } from "swr";

// Global SWR configuration for optimal performance
export const swrConfig: SWRConfiguration = {
  // Revalidate data in the background when the window regains focus
  revalidateOnFocus: false,

  // Automatically revalidate when the user reconnects to the internet
  revalidateOnReconnect: true,

  // Retry failed requests up to 3 times
  errorRetryCount: 3,

  // Use exponential backoff for retry delays
  errorRetryInterval: 5000,

  // Keep data fresh for 5 minutes (300 seconds)
  dedupingInterval: 300000,

  // Cache data for 10 minutes by default
  refreshInterval: 600000,

  // Don't revalidate on mount if data is fresh (within 5 minutes)
  revalidateIfStale: false,

  // Custom cache provider for better performance
  provider: () => new Map(),

  // Custom fetcher that handles caching headers
  fetcher: async (url: string) => {
    const response = await fetch(url, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
      },
    });

    if (!response.ok) {
      const error = new Error("An error occurred while fetching the data.");
      // Attach extra info to the error object
      (error as any).info = await response.json();
      (error as any).status = response.status;
      throw error;
    }

    return response.json();
  },

  // Handle errors gracefully
  onError: (error, key) => {
    console.warn(`SWR Error for key ${key}:`, error);

    // Don't retry for 4xx errors (client errors)
    if (error.status >= 400 && error.status < 500) {
      return false;
    }
  },

  // Log successful data loads in development
  onSuccess: (data, key) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`SWR Success for key ${key}:`, {
        dataLength: Array.isArray(data?.data) ? data.data.length : "N/A",
        timestamp: new Date().toISOString(),
      });
    }
  },
};

// Create cache keys with consistent formatting
export const createCacheKey = (
  endpoint: string,
  params?: Record<string, any>
) => {
  if (!params || Object.keys(params).length === 0) {
    return endpoint;
  }

  // Sort params to ensure consistent cache keys
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ""
      ) {
        result[key] = params[key];
      }
      return result;
    }, {} as Record<string, any>);

  const queryString = new URLSearchParams(sortedParams).toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
};

// Cache duration constants (in milliseconds)
export const CACHE_DURATIONS = {
  TOURS_LIST: 5 * 60 * 1000, // 5 minutes for tours list
  TOUR_DETAIL: 30 * 60 * 1000, // 30 minutes for individual tour
  AGENCY_DATA: 15 * 60 * 1000, // 15 minutes for agency data
  SEARCH_RESULTS: 2 * 60 * 1000, // 2 minutes for search results
  STATIC_DATA: 60 * 60 * 1000, // 1 hour for static content
} as const;

// SWR hooks for different data types with optimized caching
export const getSWRConfig = (
  dataType: keyof typeof CACHE_DURATIONS
): SWRConfiguration => ({
  ...swrConfig,
  refreshInterval: CACHE_DURATIONS[dataType],
  dedupingInterval: Math.min(CACHE_DURATIONS[dataType] / 2, 300000), // Half the refresh interval, max 5 minutes
});
