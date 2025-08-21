"use client";

import { useEffect, useCallback } from "react";
import { usePrefetchTours, useToursCache } from "@/hooks/useTours";
import { cacheMonitor } from "@/lib/cache/cache-monitor";

interface CacheOptimizerProps {
  // Whether to enable aggressive cache warming
  aggressive?: boolean;
  // User's detected location for location-based caching
  userLocation?: { lat: number; lng: number };
  // Categories to prioritize for caching
  priorityCategories?: string[];
}

export default function CacheOptimizer({
  aggressive = false,
  userLocation,
  priorityCategories = ["wildlife", "adventure", "cultural"],
}: CacheOptimizerProps) {
  const { prefetchTours } = usePrefetchTours();
  const { invalidateToursCache } = useToursCache();

  // Intelligent cache warming based on user behavior patterns
  const warmCache = useCallback(async () => {
    try {
      // 1. Warm most common requests first (highest priority)
      await prefetchTours({}, 1); // First page, no filters

      // 2. Warm location-based results if available
      if (userLocation) {
        setTimeout(() => {
          prefetchTours({ location: userLocation }, 1);
        }, 100);
      }

      // 3. Warm priority categories
      priorityCategories.forEach((category, index) => {
        setTimeout(() => {
          prefetchTours({ category }, 1);
        }, 200 + index * 50);
      });

      // 4. If aggressive caching is enabled, warm more data
      if (aggressive) {
        // Warm second page
        setTimeout(() => prefetchTours({}, 2), 500);

        // Warm popular sorting options
        const popularSorts: Array<
          "price_asc" | "price_desc" | "latest" | "name_asc"
        > = ["price_asc", "latest"];
        popularSorts.forEach((order, index) => {
          setTimeout(() => {
            prefetchTours({ order }, 1);
          }, 700 + index * 100);
        });

        // Warm location + category combinations if location is available
        if (userLocation) {
          priorityCategories.slice(0, 2).forEach((category, index) => {
            setTimeout(() => {
              prefetchTours({ location: userLocation, category }, 1);
            }, 1000 + index * 150);
          });
        }
      }
    } catch (error) {
      console.warn("Cache warming failed:", error);
    }
  }, [aggressive, userLocation, priorityCategories, prefetchTours]);

  // Handle cache invalidation when data might be stale
  const handleCacheInvalidation = useCallback(async () => {
    // Invalidate cache for search results (they change more frequently)
    await invalidateToursCache({ query: "" });

    // Log cache performance before invalidation
    if (process.env.NODE_ENV === "development") {
      cacheMonitor.logPerformanceSummary();
    }
  }, [invalidateToursCache]);

  // Initialize cache warming when component mounts
  useEffect(() => {
    // Delay cache warming to not interfere with initial page load
    const warmTimer = setTimeout(warmCache, 1000);

    // Set up periodic cache performance monitoring
    let monitorTimer: NodeJS.Timeout;
    if (process.env.NODE_ENV === "development") {
      monitorTimer = setInterval(() => {
        cacheMonitor.logPerformanceSummary();
      }, 10 * 60 * 1000); // Every 10 minutes
    }

    return () => {
      clearTimeout(warmTimer);
      if (monitorTimer) {
        clearInterval(monitorTimer);
      }
    };
  }, [warmCache]);

  // Handle visibility change to warm cache when user returns
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // User returned to the tab, refresh cache intelligently
        setTimeout(warmCache, 500);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [warmCache]);

  // Handle online/offline status for cache management
  useEffect(() => {
    const handleOnline = () => {
      // When back online, invalidate potentially stale cache and rewarm
      setTimeout(async () => {
        await handleCacheInvalidation();
        await warmCache();
      }, 1000);
    };

    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [handleCacheInvalidation, warmCache]);

  // Handle memory pressure by cleaning up cache
  useEffect(() => {
    const handleMemoryPressure = () => {
      // Clean up non-essential cache entries
      cacheMonitor.cleanup();
    };

    // Listen for memory pressure events (if supported)
    if ("memory" in performance && "onmemory" in performance) {
      (performance as any).addEventListener("memory", handleMemoryPressure);
      return () => {
        (performance as any).removeEventListener(
          "memory",
          handleMemoryPressure
        );
      };
    }
  }, []);

  // This component doesn't render anything, it just manages cache optimization
  return null;
}
