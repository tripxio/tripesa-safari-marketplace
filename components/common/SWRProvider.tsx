"use client";

import { SWRConfig } from "swr";
import { swrConfig } from "@/lib/cache/swr-config";
import { ReactNode, useEffect } from "react";
import {
  prefetchPopularTours,
  backgroundRevalidate,
  warmCacheForUser,
} from "@/lib/services/api";

interface SWRProviderProps {
  children: ReactNode;
}

export default function SWRProvider({ children }: SWRProviderProps) {
  useEffect(() => {
    // Initialize cache warming when the app loads
    const initCache = async () => {
      try {
        // Get user location for cache warming (if available)
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              warmCacheForUser(userLocation);
            },
            (error) => {
              console.debug("Geolocation not available:", error);
              // Warm cache without location
              warmCacheForUser();
            },
            { timeout: 5000, enableHighAccuracy: false }
          );
        } else {
          // Warm cache without location
          warmCacheForUser();
        }

        // Start background revalidation
        backgroundRevalidate();

        // Initial prefetch of popular content
        setTimeout(prefetchPopularTours, 1000);
      } catch (error) {
        console.warn("Cache initialization failed:", error);
      }
    };

    initCache();
  }, []);

  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
}
