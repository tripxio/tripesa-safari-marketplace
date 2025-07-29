import { useState, useEffect, useRef } from "react";
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

  // Use ref to track if location detection has been attempted to prevent re-runs
  const hasAttemptedDetection = useRef(false);
  // Track if user has manually cleared destinations
  const userHasClearedDestinations = useRef(false);

  useEffect(() => {
    const detectAndPreselectFilters = async () => {
      // Skip if we've already attempted detection, if filters are already set, or if user has manually cleared
      if (
        hasAttemptedDetection.current ||
        initialFilters.destinations.length > 0 ||
        userHasClearedDestinations.current
      ) {
        return;
      }

      // Mark that we've attempted detection
      hasAttemptedDetection.current = true;
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
  }, []); // Remove dependencies to prevent re-runs

  const clearLocationPreselection = () => {
    // Mark that user has manually cleared destinations
    userHasClearedDestinations.current = true;

    // Reset to the initial filter state with empty destinations
    const updatedFilters = {
      ...initialFilters,
      destinations: [],
    };
    onFiltersChange(updatedFilters);

    // Reset location detection state so notification can be dismissed
    setLocationDetected(false);
    setUserLocation(null);
    // Reset the attempted detection flag so location can be detected again if needed
    hasAttemptedDetection.current = false;
  };

  const manuallyPreselectDestination = (destination: string) => {
    // Reset the cleared flag since user is now manually selecting
    userHasClearedDestinations.current = false;

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
