"use client";

import { useMemo, useCallback, useRef } from "react";
import TourGridClient from "./TourGridClient";
import PaginationControls from "./PaginationControls";
import { filterTours, sortTours } from "@/lib/utils/filterTours";
import { useToursContext } from "@/app/tours/ToursPageClient";
import type { TourPackage, FilterState } from "@/lib/types";

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

// Advanced caching for processed results
const resultCache = new Map<
  string,
  { result: TourPackage[]; timestamp: number }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const createCacheKey = (
  tours: TourPackage[],
  filters: FilterState,
  sortBy: string
): string => {
  // Create a hash-like key from tours data and filters
  const toursHash =
    tours.length + (tours[0]?.id || 0) + (tours[tours.length - 1]?.id || 0);
  const filtersStr = JSON.stringify({
    searchQuery: filters.searchQuery,
    destinations: filters.destinations.sort(),
    duration: filters.duration,
    priceRange: filters.priceRange,
    tourTypes: filters.tourTypes.sort(),
  });
  return `${toursHash}_${btoa(filtersStr)}_${sortBy}`;
};

const getCachedResult = (key: string): TourPackage[] | null => {
  const cached = resultCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }
  resultCache.delete(key);
  return null;
};

const setCachedResult = (key: string, result: TourPackage[]) => {
  resultCache.set(key, { result: [...result], timestamp: Date.now() });

  // Cleanup old entries to prevent memory leaks
  if (resultCache.size > 50) {
    const now = Date.now();
    for (const [k, v] of resultCache.entries()) {
      if (now - v.timestamp > CACHE_TTL) {
        resultCache.delete(k);
      }
    }
  }
};

export default function ToursListClient({
  tours,
  paginationMeta,
}: ToursListClientProps) {
  const { filters, sortBy, viewMode } = useToursContext();
  const lastProcessedRef = useRef<{
    tours: TourPackage[];
    filters: FilterState;
    sortBy: string;
  } | null>(null);

  // Optimized filtering with aggressive caching
  const filteredAndSortedTours = useMemo(() => {
    // Generate cache key
    const cacheKey = createCacheKey(tours, filters, sortBy);

    // Check cache first
    const cachedResult = getCachedResult(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Check if we can reuse the last computation with incremental updates
    const lastProcessed = lastProcessedRef.current;
    let result: TourPackage[];

    if (
      lastProcessed &&
      lastProcessed.tours === tours &&
      lastProcessed.sortBy === sortBy &&
      JSON.stringify(lastProcessed.filters) === JSON.stringify(filters)
    ) {
      // Exact same computation, this shouldn't happen but just in case
      result = filteredAndSortedTours;
    } else {
      // Process tours with optimizations
      result = [...tours];

      // Apply filters efficiently
      if (
        filters.searchQuery ||
        filters.destinations.length > 0 ||
        filters.duration[0] !== 1 ||
        filters.duration[1] !== 30 ||
        filters.priceRange[0] !== 0 ||
        filters.priceRange[1] !== 10000 ||
        filters.tourTypes.length > 0
      ) {
        result = filterTours(result, filters);
      }

      // Apply sorting if needed
      if (sortBy && sortBy !== "latest") {
        result = sortTours(result, sortBy);
      }
    }

    // Cache the result
    setCachedResult(cacheKey, result);

    // Update ref for next comparison
    lastProcessedRef.current = { tours, filters, sortBy };

    return result;
  }, [tours, filters, sortBy]);

  // Memoize the empty state to prevent unnecessary re-renders
  const emptyState = useMemo(
    () => (
      <div className="text-center py-12">
        <h3 className="text-2xl font-bold">No Tours Found</h3>
        <p className="text-muted-foreground mt-2">
          Try adjusting your filters or search criteria.
        </p>
      </div>
    ),
    []
  );

  // Memoize pagination to prevent re-renders when tours change but pagination doesn't
  const paginationComponent = useMemo(() => {
    if (!paginationMeta || paginationMeta.last_page <= 1) return null;

    return (
      <PaginationControls
        lastPage={paginationMeta.last_page}
        currentPage={paginationMeta.current_page}
      />
    );
  }, [paginationMeta?.last_page, paginationMeta?.current_page]);

  // Memoize the results count display
  const resultsCountDisplay = useMemo(() => {
    const hasActiveFilters =
      filters.searchQuery ||
      filters.destinations.length > 0 ||
      filters.duration[0] !== 1 ||
      filters.duration[1] !== 30 ||
      filters.priceRange[0] !== 0 ||
      filters.priceRange[1] !== 10000 ||
      filters.tourTypes.length > 0;

    // Use filtered count when filters are active, total count when no filters
    const count = hasActiveFilters
      ? filteredAndSortedTours.length
      : paginationMeta?.total ?? filteredAndSortedTours.length;

    return (
      <div
        key={`count-${hasActiveFilters}-${filteredAndSortedTours.length}-${paginationMeta?.total}`}
        className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4 mb-6 border border-orange-100 dark:border-slate-600"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {count.toLocaleString()}
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {count === 1 ? "Tour Package" : "Tour Packages"}
                  {hasActiveFilters ? " Found" : " Available"}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {hasActiveFilters
                    ? "Showing filtered results"
                    : "Browse all available tours"}
                  {!hasActiveFilters &&
                    paginationMeta &&
                    paginationMeta.total > filteredAndSortedTours.length && (
                      <div className="mt-1">
                        Showing {paginationMeta.from}-{paginationMeta.to} of{" "}
                        {paginationMeta.total.toLocaleString()}
                        (Page {paginationMeta.current_page} of{" "}
                        {paginationMeta.last_page})
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center space-x-2 bg-orange-100 dark:bg-orange-900/30 px-3 py-2 rounded-full">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Filtered
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }, [
    paginationMeta?.total,
    filteredAndSortedTours.length,
    filters.searchQuery,
    filters.destinations,
    filters.duration,
    filters.priceRange,
    filters.tourTypes,
  ]);

  if (filteredAndSortedTours.length === 0) {
    return emptyState;
  }

  return (
    <div>
      {resultsCountDisplay}
      <TourGridClient tours={filteredAndSortedTours} viewMode={viewMode} />
      {paginationComponent}
    </div>
  );
}
