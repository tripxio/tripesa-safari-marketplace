"use client";

import type React from "react";

import { useState } from "react";
import { ChevronDown, ChevronUp, X, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
}

export default function FilterSidebar({
  filters,
  onFiltersChange,
  userLocation,
  onManualDestinationSelect,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    destinations: true,
    duration: true,
    price: true,
    // tourTypes: true, // Commented out - Tour Types filter removed
  });

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

  const clearAllFilters = () => {
    onFiltersChange({
      destinations: [],
      duration: [1, 30],
      priceRange: [0, 10000],
      tourTypes: [],
      accommodationTypes: [],
      groupSizes: [],
      difficulty: [],
      rating: 0,
    });
  };

  const destinations = [
    "Uganda",
    "Tanzania",
    "Kenya",
    "Rwanda",
    "Botswana",
    "South Africa",
  ];
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

      {/* Location-based quick selection */}
      {userLocation && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Globe className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span>Near You</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{userLocation.city || userLocation.country}</span>
              </div>
              {onManualDestinationSelect && (
                <div className="space-y-2">
                  {destinations.map((destination) => (
                    <Button
                      key={destination}
                      variant="ghost"
                      size="sm"
                      onClick={() => onManualDestinationSelect(destination)}
                      className="w-full justify-start text-sm h-auto py-2 px-3 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span>{destination}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <FilterSection title="Destinations" section="destinations">
        <div className="space-y-3">
          {destinations.map((destination) => (
            <div key={destination} className="flex items-center space-x-2">
              <Checkbox
                id={destination}
                checked={filters.destinations.includes(destination)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFilter("destinations", [
                      ...filters.destinations,
                      destination,
                    ]);
                  } else {
                    updateFilter(
                      "destinations",
                      filters.destinations.filter((d) => d !== destination)
                    );
                  }
                }}
              />
              <Label htmlFor={destination} className="text-sm">
                {destination}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Duration" section="duration">
        <div className="space-y-4">
          <div className="px-2">
            <Slider
              value={filters.duration}
              onValueChange={(value) => updateFilter("duration", value)}
              max={30}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {filters.duration[0]} day{filters.duration[0] !== 1 ? "s" : ""}
            </span>
            <span>
              {filters.duration[1]} day{filters.duration[1] !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Price Range" section="price">
        <div className="space-y-4">
          <div className="px-2">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilter("priceRange", value)}
              max={10000}
              min={0}
              step={100}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${filters.priceRange[0].toLocaleString()}</span>
            <span>${filters.priceRange[1].toLocaleString()}</span>
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
