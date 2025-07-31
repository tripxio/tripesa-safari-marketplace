"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FilterState } from "@/lib/types";

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  userLocation?: {
    country: string;
    countryCode: string;
    city?: string;
  } | null;
  onManualDestinationSelect?: (destination: string) => void;
  onDestinationsCleared?: () => void;
  autoSelectedDestinations?: string[]; // Track which destinations were auto-selected
}

export default function FilterSidebar({
  filters,
  onFiltersChange,
  userLocation,
  onManualDestinationSelect,
  onDestinationsCleared,
  autoSelectedDestinations = [],
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    destinations: true,
    duration: true,
    price: true,
    // tourTypes: true, // Commented out - Tour Types filter removed
  });

  // Local state for sliders to prevent jumping
  const [localDuration, setLocalDuration] = useState(filters.duration);
  const [localPriceRange, setLocalPriceRange] = useState(filters.priceRange);

  // Update local state when filters change externally
  useEffect(() => {
    setLocalDuration(filters.duration);
  }, [filters.duration]);

  useEffect(() => {
    setLocalPriceRange(filters.priceRange);
  }, [filters.priceRange]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  // Handle duration input changes
  const handleDurationChange = useCallback(
    (type: "min" | "max", value: string) => {
      const numValue = parseInt(value) || 0;
      const newDuration: [number, number] =
        type === "min"
          ? [
              Math.max(1, Math.min(numValue, localDuration[1])),
              localDuration[1],
            ]
          : [
              localDuration[0],
              Math.max(localDuration[0], Math.min(numValue, 30)),
            ];

      setLocalDuration(newDuration);
      updateFilter("duration", newDuration);
    },
    [localDuration, filters]
  );

  // Handle price range input changes
  const handlePriceRangeChange = useCallback(
    (type: "min" | "max", value: string) => {
      const numValue = parseInt(value) || 0;
      const newPriceRange: [number, number] =
        type === "min"
          ? [
              Math.max(0, Math.min(numValue, localPriceRange[1])),
              localPriceRange[1],
            ]
          : [
              localPriceRange[0],
              Math.max(localPriceRange[0], Math.min(numValue, 10000)),
            ];

      setLocalPriceRange(newPriceRange);
      updateFilter("priceRange", newPriceRange);
    },
    [localPriceRange, filters]
  );

  // Handle duration filter checkbox
  const handleDurationFilterToggle = useCallback(
    (checked: boolean) => {
      updateFilter("useDurationFilter", checked);
    },
    [filters]
  );

  // Handle price range filter checkbox
  const handlePriceRangeFilterToggle = useCallback(
    (checked: boolean) => {
      updateFilter("usePriceRangeFilter", checked);
    },
    [filters]
  );

  const clearAllFilters = () => {
    setLocalDuration([1, 30]);
    setLocalPriceRange([0, 10000]);

    onFiltersChange({
      searchQuery: "",
      destinations: [],
      duration: [1, 30],
      priceRange: [0, 10000],
      useDurationFilter: false,
      usePriceRangeFilter: false,
      tourTypes: [],
      accommodationTypes: [],
      groupSizes: [],
      difficulty: [],
      rating: 0,
    });
    // Notify parent that destinations were cleared
    if (onDestinationsCleared) {
      onDestinationsCleared();
    }
  };

  const destinations = [
    "Uganda",
    "Tanzania",
    "Kenya",
    "Rwanda",
    "Botswana",
    "South Africa",
  ];

  // Auto-add user's location to destinations if detected
  useEffect(() => {
    // REMOVED: Duplicate logic that conflicts with useLocationBasedFilters hook
    // This was causing the auto-selected destination to be re-added even after clearing
    // The useLocationBasedFilters hook should handle all location-based preselection
  }, [userLocation, filters.destinations]);

  // const tourTypes = ["Wildlife", "Gorilla trekking", "Cultural", "Adventure"]; // Commented out - Tour Types filter removed

  const FilterSection = ({
    title,
    section,
    children,
  }: {
    title: string;
    section: keyof typeof expandedSections;
    children: React.ReactNode;
  }) => (
    <Card className="mb-4">
      <CardHeader
        className="pb-3 cursor-pointer"
        onClick={() => toggleSection(section)}
      >
        <CardTitle className="flex items-center justify-between text-base">
          {title}
          {expandedSections[section] ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </CardTitle>
      </CardHeader>
      {expandedSections[section] && (
        <CardContent className="pt-0">{children}</CardContent>
      )}
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      </div>

      <FilterSection title="Destinations" section="destinations">
        <div className="space-y-3">
          {userLocation && (
            <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">
                📍 Your Location
              </div>
              <div className="text-sm text-muted-foreground">
                {userLocation.city ? `${userLocation.city}, ` : ""}
                {userLocation.country}
              </div>
            </div>
          )}
          {destinations.map((destination) => {
            const isAutoSelected =
              autoSelectedDestinations.includes(destination);
            const isChecked = filters.destinations.includes(destination);

            return (
              <div
                key={destination}
                className={`flex items-center space-x-2 ${
                  isAutoSelected
                    ? "bg-orange-50 dark:bg-orange-900/10 p-2 rounded border border-orange-200 dark:border-orange-800"
                    : ""
                }`}
              >
                <Checkbox
                  id={destination}
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFilter("destinations", [
                        ...filters.destinations,
                        destination,
                      ]);
                      // Notify that user manually selected a destination
                      if (onManualDestinationSelect) {
                        onManualDestinationSelect(destination);
                      }
                    } else {
                      const newDestinations = filters.destinations.filter(
                        (d) => d !== destination
                      );
                      updateFilter("destinations", newDestinations);

                      // If user unchecked an auto-selected destination or all destinations, reset location-based state
                      if (
                        isAutoSelected ||
                        (newDestinations.length === 0 && onDestinationsCleared)
                      ) {
                        onDestinationsCleared?.();
                      }
                    }
                  }}
                />
                <Label htmlFor={destination} className="text-sm flex-1">
                  {destination}
                  {isAutoSelected && (
                    <span className="ml-2 text-xs text-orange-600 dark:text-orange-400 font-medium">
                      📍 Auto-selected
                    </span>
                  )}
                </Label>
              </div>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Duration" section="duration">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <Checkbox
              id="use-duration-filter"
              checked={filters.useDurationFilter}
              onCheckedChange={handleDurationFilterToggle}
            />
            <Label
              htmlFor="use-duration-filter"
              className="text-sm font-medium"
            >
              Filter by duration
            </Label>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={localDuration[0]}
                onChange={(e) => handleDurationChange("min", e.target.value)}
                onBlur={() => updateFilter("duration", localDuration)}
                min="1"
                max={localDuration[1]}
                className="w-20 text-center"
                disabled={!filters.useDurationFilter}
                placeholder="Min"
              />
              <span className="text-sm text-muted-foreground">to</span>
              <Input
                type="number"
                value={localDuration[1]}
                onChange={(e) => handleDurationChange("max", e.target.value)}
                onBlur={() => updateFilter("duration", localDuration)}
                min={localDuration[0]}
                max="30"
                className="w-20 text-center"
                disabled={!filters.useDurationFilter}
                placeholder="Max"
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Price Range" section="price">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <Checkbox
              id="use-price-filter"
              checked={filters.usePriceRangeFilter}
              onCheckedChange={handlePriceRangeFilterToggle}
            />
            <Label htmlFor="use-price-filter" className="text-sm font-medium">
              Filter by price range
            </Label>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={localPriceRange[0]}
                onChange={(e) => handlePriceRangeChange("min", e.target.value)}
                onBlur={() => updateFilter("priceRange", localPriceRange)}
                min="0"
                max={localPriceRange[1]}
                className="w-24 text-center"
                disabled={!filters.usePriceRangeFilter}
                placeholder="Min"
              />
              <span className="text-sm text-muted-foreground">to</span>
              <Input
                type="number"
                value={localPriceRange[1]}
                onChange={(e) => handlePriceRangeChange("max", e.target.value)}
                onBlur={() => updateFilter("priceRange", localPriceRange)}
                min={localPriceRange[0]}
                max="10000"
                className="w-24 text-center"
                disabled={!filters.usePriceRangeFilter}
                placeholder="Max"
              />
              <span className="text-sm text-muted-foreground">USD</span>
            </div>
          </div>
        </div>
      </FilterSection>

      {/* 
      COMMENTED OUT - Tour Types filter removed based on feedback
      May be needed in the future, so keeping the code here
      
      <FilterSection title="Tour Types" section="tourTypes">
        <div className="space-y-3">
          {tourTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={filters.tourTypes.includes(type)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFilter("tourTypes", [...filters.tourTypes, type]);
                  } else {
                    updateFilter(
                      "tourTypes",
                      filters.tourTypes.filter((t) => t !== type)
                    );
                  }
                }}
              />
              <Label htmlFor={type} className="text-sm">
                {type}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>
      */}
    </div>
  );
}
