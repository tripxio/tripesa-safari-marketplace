"use client";

import { useState, useEffect, useRef } from "react";
import type { FilterState } from "@/lib/types";
import { LocationService } from "@/lib/services/locationService";

interface UseLocationBasedFiltersProps {
  initialFilters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function useLocationBasedFilters({
  initialFilters,
  onFiltersChange,
}: UseLocationBasedFiltersProps) {
  const [isDetectingLocation, setIsDetectingLocation] = useState(true);
  const [locationDetected, setLocationDetected] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    country: string;
    countryCode: string;
    city?: string;
  } | null>(null);
  const userHasClearedDestinations = useRef(false);
  const hasAttemptedDetection = useRef(false);

  useEffect(() => {
    const detectAndPreselectFilters = async () => {
      if (
        hasAttemptedDetection.current ||
        userHasClearedDestinations.current ||
        initialFilters.destinations.length > 0
      ) {
        setIsDetectingLocation(false);
        return;
      }

      hasAttemptedDetection.current = true;
      const locationService = LocationService.getInstance();
      const location = await locationService.detectLocation();
      setUserLocation(location);

      if (location) {
        const destination = locationService.getDestinationFromCountry(
          location.countryCode
        );

        if (destination && !userHasClearedDestinations.current) {
          const updatedFilters: FilterState = {
            ...initialFilters,
            destinations: [destination],
          };
          onFiltersChange(updatedFilters);
          setLocationDetected(true);
        }
      }
      setIsDetectingLocation(false);
    };

    detectAndPreselectFilters();
  }, []);

  const clearLocationPreselection = () => {
    userHasClearedDestinations.current = true;
    setLocationDetected(false); // Hide the notification
    onFiltersChange({
      ...initialFilters,
      destinations: [],
    });
  };

  const manuallyPreselectDestination = () => {
    userHasClearedDestinations.current = true;
    setLocationDetected(false);
  };

  return {
    isDetectingLocation,
    locationDetected,
    userLocation,
    clearLocationPreselection,
    manuallyPreselectDestination,
  };
}
