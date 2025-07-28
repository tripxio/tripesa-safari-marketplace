import { useState, useEffect } from "react";
import { locationService } from "@/lib/services/locationService";
import type { FilterState } from "@/lib/types";

interface UseLocationBasedFiltersProps {
  initialFilters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function useLocationBasedFilters({
  initialFilters,
  onFiltersChange,
}: UseLocationBasedFiltersProps) {
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    country: string;
    countryCode: string;
    city?: string;
  } | null>(null);

  useEffect(() => {
    const detectAndPreselectFilters = async () => {
      // Skip if we've already detected location or if filters are already set
      if (locationDetected || initialFilters.destinations.length > 0) {
        return;
      }

      setIsDetectingLocation(true);

      try {
        const location = await locationService.detectLocation();

        if (location) {
          setUserLocation({
            country: location.country,
            countryCode: location.countryCode,
            city: location.city,
          });

          // Check if user's country matches any of our destinations
          const destination = locationService.getDestinationFromCountry(
            location.countryCode
          );

          if (destination) {
            // Preselect the destination filter
            const updatedFilters = {
              ...initialFilters,
              destinations: [destination],
            };

            onFiltersChange(updatedFilters);

            console.log(
              `📍 Location detected: ${location.country} (${location.countryCode})`
            );
            console.log(`🎯 Preselected destination: ${destination}`);
          } else {
            console.log(
              `📍 Location detected: ${location.country} (${location.countryCode}) - no matching destination`
            );
          }

          setLocationDetected(true);
        } else {
          console.log("📍 Location detection failed - no filters preselected");
          setLocationDetected(true);
        }
      } catch (error) {
        console.warn("Location-based filter preselection failed:", error);
        setLocationDetected(true);
      } finally {
        setIsDetectingLocation(false);
      }
    };

    // Add a small delay to avoid blocking the initial page load
    const timer = setTimeout(detectAndPreselectFilters, 1000);

    return () => clearTimeout(timer);
  }, [initialFilters, onFiltersChange, locationDetected]);

  const clearLocationPreselection = () => {
    const updatedFilters = {
      ...initialFilters,
      destinations: [],
    };
    onFiltersChange(updatedFilters);
    setLocationDetected(false);
    setUserLocation(null);
  };

  const manuallyPreselectDestination = (destination: string) => {
    const updatedFilters = {
      ...initialFilters,
      destinations: [destination],
    };
    onFiltersChange(updatedFilters);
  };

  return {
    isDetectingLocation,
    locationDetected,
    userLocation,
    clearLocationPreselection,
    manuallyPreselectDestination,
  };
}
