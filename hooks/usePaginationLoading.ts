import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Hook to track pagination loading states
 * Automatically detects when pagination is occurring and manages loading states
 */
export function usePaginationLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState<number | null>(null);
  const searchParams = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Clear loading state when page actually changes
  useEffect(() => {
    setIsLoading(false);
    setLoadingPage(null);
  }, [currentPage]);

  // Function to start loading for a specific page
  const startPageLoading = (page: number) => {
    setLoadingPage(page);
    setIsLoading(true);

    // Fallback: clear loading after 3 seconds if something goes wrong
    setTimeout(() => {
      setIsLoading(false);
      setLoadingPage(null);
    }, 3000);
  };

  // Function to manually clear loading state
  const clearLoading = () => {
    setIsLoading(false);
    setLoadingPage(null);
  };

  return {
    isLoading,
    loadingPage,
    currentPage,
    startPageLoading,
    clearLoading,
  };
}
