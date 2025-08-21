"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
  const [loadingPage, setLoadingPage] = useState<number | null>(null);

  // Clear loading state when currentPage changes (navigation completed)
  useEffect(() => {
    setLoadingPage(null);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    // Set loading state for the specific page
    setLoadingPage(newPage);

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);

    // Fallback: Clear loading state after 2 seconds if something goes wrong
    setTimeout(() => {
      setLoadingPage(null);
    }, 2000);
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
        disabled={currentPage <= 1 || loadingPage !== null}
        variant="outline"
        size="sm"
        className="min-w-[80px]"
      >
        {loadingPage === currentPage - 1 ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading
          </>
        ) : (
          "Previous"
        )}
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
                disabled={loadingPage !== null}
              >
                {loadingPage === page ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  page
                )}
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= lastPage || loadingPage !== null}
        variant="outline"
        size="sm"
        className="min-w-[80px]"
      >
        {loadingPage === currentPage + 1 ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading
          </>
        ) : (
          "Next"
        )}
      </Button>
    </div>
  );
}
