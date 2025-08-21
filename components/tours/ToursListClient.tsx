"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import TourGrid from "./TourGrid";
import PaginationControls from "./PaginationControls";
import { useToursContext } from "@/app/tours/ToursPageClient";
import { filterTours, sortTours } from "@/lib/utils/filterTours";
import { getTours } from "@/lib/services/api";
import type { TourPackage, FilterState } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface ToursListClientProps {
  tours: TourPackage[];
  paginationMeta?: {
    last_page: number;
    current_page: number;
    total: number;
    from: number;
    to: number;
  };
}

// Country code to destination mapping
const COUNTRY_MAPPING = {
  UG: "Uganda",
  TZ: "Tanzania",
  KE: "Kenya",
  RW: "Rwanda",
  BW: "Botswana",
  ZA: "South Africa",
  ET: "Ethiopia",
  NA: "Namibia",
  ZM: "Zambia",
  ZW: "Zimbabwe",
  MW: "Malawi",
  MZ: "Mozambique",
};

// Create cache key for API requests
const createCacheKey = (filters: FilterState, sortBy: string, page: number) => {
  return JSON.stringify({ filters, sortBy, page });
};

// Simple in-memory cache
const cache = new Map<
  string,
  {
    data: TourPackage[];
    timestamp: number;
    meta?: any;
    allData?: TourPackage[];
  }
>();
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes for faster updates

const getCachedResult = (cacheKey: string) => {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached;
  }
  return null;
};

const setCachedResult = (
  cacheKey: string,
  data: TourPackage[],
  meta?: any,
  allData?: TourPackage[]
) => {
  cache.set(cacheKey, { data, timestamp: Date.now(), meta, allData });

  // Clean up old cache entries
  if (cache.size > 30) {
    const entries = Array.from(cache.entries());
    const oldEntries = entries
      .filter(([, value]) => Date.now() - value.timestamp > CACHE_DURATION)
      .slice(0, 10);
    oldEntries.forEach(([key]) => cache.delete(key));
  }
};

export default function ToursListClient({
  tours: initialTours,
  paginationMeta: initialPaginationMeta,
}: ToursListClientProps) {
  const { filters, sortBy, viewMode } = useToursContext();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [allTours, setAllTours] = useState<TourPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Improved destination filtering function
  const filterByDestination = useCallback(
    (tours: TourPackage[], destinations: string[]) => {
      if (destinations.length === 0) return tours;

      return tours.filter((tour) => {
        return destinations.some((dest) => {
          const destLower = dest.toLowerCase();

          // Check country code mapping
          const countryName =
            COUNTRY_MAPPING[tour.country_code as keyof typeof COUNTRY_MAPPING];
          if (countryName && countryName.toLowerCase() === destLower) {
            return true;
          }

          // Check direct country code match
          if (
            tour.country_code &&
            tour.country_code.toLowerCase() === destLower.substring(0, 2)
          ) {
            return true;
          }

          // Check city match
          if (tour.city && tour.city.toLowerCase().includes(destLower)) {
            return true;
          }

          // Check package tags
          if (tour.package_tags && Array.isArray(tour.package_tags)) {
            return tour.package_tags.some(
              (tag) =>
                tag.toLowerCase().includes(destLower) ||
                destLower.includes(tag.toLowerCase())
            );
          }

          return false;
        });
      });
    },
    []
  );

  // Get filtered and sorted tours
  const processedTours = useMemo(() => {
    let filtered = [...allTours];

    // Apply destination filter first
    if (filters.destinations.length > 0) {
      filtered = filterByDestination(filtered, filters.destinations);
    }

    // Apply other filters
    filtered = filterTours(filtered, filters);

    // Apply sorting
    filtered = sortTours(filtered, sortBy);

    return filtered;
  }, [allTours, filters, sortBy, filterByDestination]);

  // Calculate pagination for filtered results
  const paginationData = useMemo(() => {
    const itemsPerPage = 20; // Increased from 10
    const totalItems = processedTours.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    const currentPageTours = processedTours.slice(startIndex, endIndex);

    return {
      tours: currentPageTours,
      meta: {
        current_page: currentPage,
        last_page: totalPages,
        total: totalItems,
        from: totalItems > 0 ? startIndex + 1 : 0,
        to: endIndex,
        per_page: itemsPerPage,
      },
    };
  }, [processedTours, currentPage]);

  // Generate count display for active filters
  const filterCounts = useMemo(() => {
    if (filters.destinations.length === 0) return null;

    const counts = filters.destinations
      .map((dest) => {
        const destTours = filterByDestination(allTours, [dest]);
        const finalCount = filterTours(destTours, {
          ...filters,
          destinations: [dest],
        }).length;
        return { destination: dest, count: finalCount };
      })
      .filter((item) => item.count > 0);

    return counts;
  }, [allTours, filters, filterByDestination]);

  const fetchAllTours = useCallback(async () => {
    const baseFilters: any = {};

    if (filters.searchQuery) {
      baseFilters.query = filters.searchQuery;
    }

    if (sortBy && sortBy !== "latest") {
      baseFilters.order = sortBy;
    }

    const cacheKey = createCacheKey(baseFilters, sortBy, 1);

    // Check cache first
    const cached = getCachedResult(cacheKey);
    if (cached && cached.allData) {
      setAllTours(cached.allData);
      setHasInitialLoad(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, get the first page to understand total pages
      const firstResponse = await getTours(baseFilters, 1);
      const allFetchedTours: TourPackage[] = [...(firstResponse.data || [])];

      // Get total pages from API response
      const totalPages = firstResponse.meta?.last_page || 1;

      // Fetch remaining pages if there are more than 1 page
      if (totalPages > 1) {
        // Limit to reasonable number for performance (max 20 pages = ~300 tours)
        const maxPagesToFetch = Math.min(totalPages, 20);

        // Fetch remaining pages in parallel for better performance
        const pagePromises = [];
        for (let page = 2; page <= maxPagesToFetch; page++) {
          pagePromises.push(getTours(baseFilters, page));
        }

        const responses = await Promise.all(pagePromises);

        // Combine all tour data
        responses.forEach((response: any) => {
          if (response.data) {
            allFetchedTours.push(...response.data);
          }
        });
      }

      setAllTours(allFetchedTours);
      setHasInitialLoad(true);

      // Cache the result
      setCachedResult(cacheKey, [], firstResponse.meta, allFetchedTours);
    } catch (err) {
      console.error("Error fetching tours:", err);
      setError("Failed to load tours. Please try again.");

      // Use initial tours as fallback
      if (initialTours.length > 0 && !hasInitialLoad) {
        setAllTours(initialTours);
        setHasInitialLoad(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters.searchQuery, sortBy, initialTours, hasInitialLoad]);

  // Fetch tours when dependencies change
  useEffect(() => {
    if (!hasInitialLoad) {
      setAllTours(initialTours);
      setHasInitialLoad(true);
    }

    // Always fetch fresh data when filters change
    fetchAllTours();
  }, [fetchAllTours, initialTours, hasInitialLoad]);

  // Reset to page 1 only when filters change (not when manually navigating)
  const previousFiltersRef = useRef<string>("");

  useEffect(() => {
    const currentFiltersString = JSON.stringify({
      destinations: filters.destinations,
      searchQuery: filters.searchQuery,
      useDurationFilter: filters.useDurationFilter,
      duration: filters.duration,
      usePriceRangeFilter: filters.usePriceRangeFilter,
      priceRange: filters.priceRange,
    });

    // Only reset to page 1 if filters actually changed
    if (
      previousFiltersRef.current &&
      previousFiltersRef.current !== currentFiltersString &&
      currentPage > 1
    ) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      window.history.replaceState({}, "", `?${params.toString()}`);
    }

    previousFiltersRef.current = currentFiltersString;
  }, [
    filters.destinations,
    filters.searchQuery,
    filters.useDurationFilter,
    filters.duration,
    filters.usePriceRangeFilter,
    filters.priceRange,
    currentPage,
    searchParams,
  ]);

  if (error && !hasInitialLoad) {
    return (
      <div className="text-center py-12 text-red-500">
        <h3 className="text-2xl font-bold">Something Went Wrong</h3>
        <p className="mt-2">{error}</p>
        <button
          onClick={fetchAllTours}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <span className="ml-2 text-muted-foreground">Loading tours...</span>
        </div>
      )}

      {/* Results Summary */}
      {!isLoading && hasInitialLoad && (
        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground space-y-2">
            {filterCounts && filterCounts.length > 0 ? (
              <div>
                <span className="font-semibold text-foreground">
                  {paginationData.meta.total} tours found
                </span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {filterCounts.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium"
                    >
                      {item.count} in {item.destination}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <span className="font-semibold text-foreground">
                {paginationData.meta.total} tours available
              </span>
            )}

            {paginationData.meta.total > 0 && (
              <div className="text-xs">
                Showing {paginationData.meta.from}-{paginationData.meta.to} of{" "}
                {paginationData.meta.total} tours
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tour Grid */}
      {!isLoading && hasInitialLoad && paginationData.tours.length > 0 && (
        <TourGrid tours={paginationData.tours} viewMode={viewMode} />
      )}

      {/* No Results */}
      {!isLoading && hasInitialLoad && paginationData.tours.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-2xl font-bold mb-4">No Tours Found</h3>
          <p className="text-muted-foreground">
            {filters.destinations.length > 0
              ? `No tours found for ${filters.destinations.join(
                  ", "
                )}. Try removing some filters to see more results.`
              : "Try adjusting your filters to see more results."}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && hasInitialLoad && paginationData.meta.last_page > 1 && (
        <PaginationControls
          lastPage={paginationData.meta.last_page}
          currentPage={paginationData.meta.current_page}
        />
      )}
    </div>
  );
}
