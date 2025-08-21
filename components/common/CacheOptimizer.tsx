"use client";

import { useEffect, useCallback } from "react";
import {
  prefetchPopularTours,
  warmCacheForUser,
  backgroundRevalidate,
} from "@/lib/services/api";

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
  // Intelligent cache warming based on user behavior patterns
  const warmCache = useCallback(async () => {
    try {
      // Use the API service functions for cache warming
      await prefetchPopularTours();

      if (userLocation) {
        await warmCacheForUser(userLocation);
      }

      if (aggressive) {
        await backgroundRevalidate();
      }
    } catch (error) {
      console.warn("Cache warming failed:", error);
    }
  }, [aggressive, userLocation]);

  // Handle cache invalidation when data might be stale
  const handleCacheInvalidation = useCallback(async () => {
    // Background revalidation handles cache invalidation
    await backgroundRevalidate();
  }, []);

  // Initialize cache warming when component mounts
  useEffect(() => {
    // Delay cache warming to not interfere with initial page load
    const warmTimer = setTimeout(warmCache, 1000);

    return () => {
      clearTimeout(warmTimer);
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

  // This component doesn't render anything, it just manages cache optimization
  return null;
}
