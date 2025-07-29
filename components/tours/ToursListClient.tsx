"use client";

import { useMemo, useCallback, useRef } from "react";
import TourGridClient from "./TourGridClient";
import PaginationControls from "./PaginationControls";
import { filterTours, sortTours } from "@/lib/utils/filterTours";
import { useToursContext } from "@/app/tours/ToursPageClient";
import type { TourPackage, FilterState } from "@/lib/types";

interface ToursListClientProps {
  tours: TourPackage[];
  viewMode: "grid" | "list";
  paginationMeta?: {
    last_page: number;
    current_page: number;
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
  viewMode,
  paginationMeta,
}: ToursListClientProps) {
  const { filters, sortBy } = useToursContext();
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

  if (filteredAndSortedTours.length === 0) {
    return emptyState;
  }

  return (
    <div>
      <TourGridClient tours={filteredAndSortedTours} viewMode={viewMode} />
      {paginationComponent}
    </div>
  );
}
