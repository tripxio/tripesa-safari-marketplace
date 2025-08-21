/**
 * Parallel data fetching utilities for improved performance
 * Fetches multiple related data sources simultaneously
 */

import { getTours, getAgency } from "./api";
import type { ApiResponse, Agency, TourPackage } from "@/lib/types";

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

interface ParallelFetchResult {
  tours: ApiResponse;
  relatedData?: {
    popularCategories?: ApiResponse[];
    nearbyTours?: ApiResponse;
    agencies?: { [key: number]: Agency };
  };
  performance: {
    totalTime: number;
    parallelTime: number;
    savedTime: number;
  };
}

/**
 * Fetch tours with parallel related data loading
 * This reduces total loading time by fetching multiple things at once
 */
export async function fetchToursWithRelatedData(
  filters: TourFilters = {},
  page: number = 1,
  options: {
    fetchPopularCategories?: boolean;
    fetchNearbyTours?: boolean;
    fetchAgencies?: boolean;
    maxParallelRequests?: number;
  } = {}
): Promise<ParallelFetchResult> {
  const startTime = Date.now();

  const {
    fetchPopularCategories = true,
    fetchNearbyTours = false,
    fetchAgencies = false,
    maxParallelRequests = 5,
  } = options;

  // Always fetch main tours data
  const promises: Promise<any>[] = [getTours(filters, page)];
  const promiseLabels = ["main-tours"];

  // Add parallel requests based on options
  if (fetchPopularCategories && !filters.category) {
    // Fetch popular categories in parallel
    const popularCategories = ["wildlife", "adventure", "cultural"];
    popularCategories
      .slice(0, Math.min(2, maxParallelRequests - 1))
      .forEach((category) => {
        promises.push(getTours({ ...filters, category }, 1));
        promiseLabels.push(`category-${category}`);
      });
  }

  if (fetchNearbyTours && filters.location && !filters.query) {
    // Fetch nearby tours if location is available
    promises.push(getTours({ location: filters.location }, 1));
    promiseLabels.push("nearby-tours");
  }

  try {
    // Execute all requests in parallel
    const parallelStartTime = Date.now();
    const results = await Promise.allSettled(promises);
    const parallelEndTime = Date.now();

    // Process results
    const mainTours =
      results[0].status === "fulfilled" ? results[0].value : null;
    if (!mainTours) {
      throw new Error("Failed to fetch main tours data");
    }

    const relatedData: any = {};

    // Process category data
    if (fetchPopularCategories) {
      relatedData.popularCategories = results
        .slice(1, promiseLabels.length)
        .filter(
          (result, index) =>
            promiseLabels[index + 1]?.startsWith("category-") &&
            result.status === "fulfilled"
        )
        .map((result: any) => result.value);
    }

    // Process nearby tours
    if (fetchNearbyTours) {
      const nearbyIndex = promiseLabels.indexOf("nearby-tours");
      if (nearbyIndex > 0 && results[nearbyIndex]?.status === "fulfilled") {
        relatedData.nearbyTours = (results[nearbyIndex] as any).value;
      }
    }

    const totalTime = Date.now() - startTime;
    const parallelTime = parallelEndTime - parallelStartTime;

    // Estimate time saved by parallel execution
    const savedTime = Math.max(
      0,
      (promises.length - 1) * (parallelTime / promises.length)
    );

    return {
      tours: mainTours,
      relatedData:
        Object.keys(relatedData).length > 0 ? relatedData : undefined,
      performance: {
        totalTime,
        parallelTime,
        savedTime,
      },
    };
  } catch (error) {
    console.error("Parallel fetch error:", error);
    // Fallback to just main tours
    const fallbackTours = await getTours(filters, page);
    return {
      tours: fallbackTours,
      performance: {
        totalTime: Date.now() - startTime,
        parallelTime: 0,
        savedTime: 0,
      },
    };
  }
}

/**
 * Prefetch critical data in the background
 * This warms up the cache for faster subsequent loads
 */
export async function prefetchCriticalData() {
  const prefetchPromises = [
    // Prefetch first page (most common)
    getTours({}, 1),
    // Prefetch popular categories
    getTours({ category: "wildlife" }, 1),
    getTours({ category: "adventure" }, 1),
    // Prefetch common sort orders
    getTours({ order: "price_asc" }, 1),
  ];

  try {
    await Promise.allSettled(prefetchPromises);
    console.debug("✅ Critical data prefetched successfully");
  } catch (error) {
    console.warn("⚠️ Prefetch failed:", error);
  }
}

/**
 * Smart data fetching based on user context
 * Uses parallel fetching and intelligent prefetching
 */
export async function smartFetchTours(
  filters: TourFilters = {},
  page: number = 1,
  userContext?: {
    location?: { lat: number; lng: number };
    previousSearches?: string[];
    preferredCategories?: string[];
  }
): Promise<ParallelFetchResult> {
  const isFirstLoad = page === 1 && !filters.query && !filters.category;

  const options = {
    fetchPopularCategories: isFirstLoad,
    fetchNearbyTours: !!userContext?.location && isFirstLoad,
    fetchAgencies: false, // Can be enabled if needed
    maxParallelRequests: isFirstLoad ? 4 : 2,
  };

  return fetchToursWithRelatedData(filters, page, options);
}
