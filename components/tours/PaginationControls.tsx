"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  lastPage: number;
  currentPage: number;
}

export default function PaginationControls({
  lastPage,
  currentPage,
}: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Show max 5 page numbers

    if (lastPage <= maxVisible) {
      // Show all pages if total is 5 or less
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i);
      }
    } else {
      // Show current page with 2 pages on each side
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(lastPage, currentPage + 2);

      // Always show first page
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }

      // Show pages around current page
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Always show last page
      if (end < lastPage) {
        if (end < lastPage - 1) pages.push("...");
        pages.push(lastPage);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center items-center mt-8 space-x-2">
      <Button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        variant="outline"
        size="sm"
      >
        Previous
      </Button>

      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, index) => (
          <div key={index}>
            {page === "..." ? (
              <span className="px-3 py-2 text-muted-foreground">...</span>
            ) : (
              <Button
                onClick={() => handlePageChange(page as number)}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className="w-10 h-10"
              >
                {page}
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= lastPage}
        variant="outline"
        size="sm"
      >
        Next
      </Button>
    </div>
  );
}
