"use client";

import { useMemo } from "react";
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

export default function ToursListClient({
  tours,
  viewMode,
  paginationMeta,
}: ToursListClientProps) {
  const { filters, sortBy } = useToursContext();

  // Apply frontend filtering and sorting
  const filteredAndSortedTours = useMemo(() => {
    let result = [...tours];

    // Apply frontend filters
    result = filterTours(result, filters);

    // Apply frontend sorting
    result = sortTours(result, sortBy);

    return result;
  }, [tours, filters, sortBy]);

  if (filteredAndSortedTours.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-2xl font-bold">No Tours Found</h3>
        <p className="text-muted-foreground mt-2">
          Try adjusting your filters or search criteria.
        </p>
      </div>
    );
  }

  return (
    <div>
      <TourGridClient tours={filteredAndSortedTours} viewMode={viewMode} />
      {paginationMeta && paginationMeta.last_page > 1 && (
        <PaginationControls
          lastPage={paginationMeta.last_page}
          currentPage={paginationMeta.current_page}
        />
      )}
    </div>
  );
}
