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
const resultCache = new Map<string, TourPackage[]>();

const createCacheKey = (
  tours: TourPackage[],
  filters: FilterState,
  sortBy: string
) => {
  return `${tours.length}-${JSON.stringify(filters)}-${sortBy}`;
};

const getCachedResult = (cacheKey: string) => {
  return resultCache.get(cacheKey);
};

const setCachedResult = (cacheKey: string, result: TourPackage[]) => {
  // Limit cache size to prevent memory issues
  if (resultCache.size > 100) {
    const firstKey = resultCache.keys().next().value;
    if (firstKey) {
      resultCache.delete(firstKey);
    }
  }
  resultCache.set(cacheKey, result);
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

  // Check if any client-side filters are active
  const hasClientSideFilters = useMemo(() => {
    return (
      filters.destinations.length > 0 ||
      filters.duration[0] !== 1 ||
      filters.duration[1] !== 30 ||
      filters.priceRange[0] !== 0 ||
      filters.priceRange[1] !== 10000 ||
      filters.tourTypes.length > 0
    );
  }, [filters]);

  // Calculate pagination based on filtered results when client-side filters are active
  const calculatedPaginationMeta = useMemo(() => {
    if (!hasClientSideFilters && paginationMeta) {
      // Use server pagination when no client-side filters are active
      return paginationMeta;
    }

    // Calculate pagination for filtered results
    const totalFilteredTours = filteredAndSortedTours.length;
    const toursPerPage = 12; // Assuming 12 tours per page, adjust as needed
    const totalPages = Math.ceil(totalFilteredTours / toursPerPage);

    return {
      last_page: totalPages,
      current_page: 1, // Reset to page 1 when filters are applied
      total: totalFilteredTours,
      from: 1,
      to: Math.min(toursPerPage, totalFilteredTours),
    };
  }, [hasClientSideFilters, paginationMeta, filteredAndSortedTours.length]);

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
    if (!calculatedPaginationMeta || calculatedPaginationMeta.last_page <= 1)
      return null;

    return (
      <PaginationControls
        lastPage={calculatedPaginationMeta.last_page}
        currentPage={calculatedPaginationMeta.current_page}
      />
    );
  }, [
    calculatedPaginationMeta?.last_page,
    calculatedPaginationMeta?.current_page,
  ]);

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

    if (!hasActiveFilters) {
      return null;
    }

    const total = filteredAndSortedTours.length;
    const originalTotal = tours.length;

    return (
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <span className="font-medium">
            {total} tour{total !== 1 ? "s" : ""} found
          </span>
          {total !== originalTotal && (
            <span className="text-blue-600 dark:text-blue-400 ml-1">
              (filtered from {originalTotal} total tours)
            </span>
          )}
        </div>
      </div>
    );
  }, [
    filteredAndSortedTours.length,
    tours.length,
    filters.searchQuery,
    filters.destinations.length,
    filters.duration,
    filters.priceRange,
    filters.tourTypes.length,
  ]);

  return (
    <>
      {resultsCountDisplay}
      {filteredAndSortedTours.length === 0 ? (
        emptyState
      ) : (
        <>
          <TourGridClient tours={filteredAndSortedTours} viewMode={viewMode} />
          {paginationComponent}
        </>
      )}
    </>
  );
}
