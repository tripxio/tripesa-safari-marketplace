"use client";

import { useState, useEffect } from "react";
import TourGrid from "./TourGrid";
import TourCardSkeleton from "./TourCardSkeleton";
import { smartFetchTours } from "@/lib/services/parallel-fetcher";
import type { TourPackage } from "@/lib/types";

interface FastTourLoaderProps {
  initialFilters?: any;
  initialPage?: number;
  viewMode: "grid" | "list";
  onDataLoaded?: (tours: TourPackage[], totalPages: number) => void;
}

export default function FastTourLoader({
  initialFilters = {},
  initialPage = 1,
  viewMode,
  onDataLoaded,
}: FastTourLoaderProps) {
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState<string>("Connecting...");

  useEffect(() => {
    let isCancelled = false;

    const loadTours = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setLoadingStage("Connecting...");

        // Start loading with progress updates
        const progressTimer = setTimeout(() => {
          if (!isCancelled) setLoadingStage("Fetching tours...");
        }, 500);

        const progressTimer2 = setTimeout(() => {
          if (!isCancelled) setLoadingStage("Processing data...");
        }, 1500);

        try {
          // Use smart parallel fetching
          const result = await smartFetchTours(initialFilters, initialPage, {
            location: undefined, // Could be passed from user context
          });

          clearTimeout(progressTimer);
          clearTimeout(progressTimer2);

          if (!isCancelled) {
            setTours(result.tours.data || []);
            setIsLoading(false);

            // Log performance metrics
            if (process.env.NODE_ENV === "development") {
              console.log("🚀 Fast loading metrics:", {
                totalTime: result.performance.totalTime,
                savedTime: result.performance.savedTime,
                toursCount: result.tours.data?.length || 0,
              });
            }

            // Notify parent component
            if (onDataLoaded) {
              onDataLoaded(
                result.tours.data || [],
                result.tours.meta?.last_page || 1
              );
            }
          }
        } catch (innerErr) {
          clearTimeout(progressTimer);
          clearTimeout(progressTimer2);
          throw innerErr;
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Fast tour loading failed:", err);
          setError("Failed to load tours. Please try again.");
          setIsLoading(false);
        }
      }
    };

    loadTours();

    return () => {
      isCancelled = true;
    };
  }, [initialFilters, initialPage, onDataLoaded]);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold mb-2 text-red-600">
          Loading Error
        </h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Progress indicator */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-3 bg-background border rounded-lg px-4 py-3 shadow-sm">
            <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">{loadingStage}</span>
          </div>
        </div>

        {/* Show skeleton cards */}
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-6"
          }
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <TourCardSkeleton
              key={`fast-skeleton-${index}`}
              viewMode={viewMode}
            />
          ))}
        </div>
      </div>
    );
  }

  return <TourGrid tours={tours} viewMode={viewMode} />;
}
