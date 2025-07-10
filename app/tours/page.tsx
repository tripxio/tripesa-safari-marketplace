"use client";

import { useState, useEffect } from "react";
import { Search, Grid, List, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FilterSidebar from "@/components/tours/FilterSidebar";
import TourGrid from "@/components/tours/TourGrid";
import { sampleTours } from "@/lib/sample-data";
import type { TourPackage, FilterState } from "@/lib/types";

export default function ToursPage() {
  const [tours, setTours] = useState<TourPackage[]>(sampleTours);
  const [filteredTours, setFilteredTours] =
    useState<TourPackage[]>(sampleTours);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [filters, setFilters] = useState<FilterState>({
    destinations: [],
    duration: [1, 30],
    priceRange: [0, 10000],
    tourTypes: [],
    accommodationTypes: [],
    groupSizes: [],
    difficulty: [],
    rating: 0,
  });

  useEffect(() => {
    let filtered = tours;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (tour) =>
          tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tour.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tour.highlights.some((highlight) =>
            highlight.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Apply filters
    if (filters.destinations.length > 0) {
      filtered = filtered.filter((tour) =>
        filters.destinations.includes(tour.destination)
      );
    }

    if (filters.tourTypes.length > 0) {
      filtered = filtered.filter((tour) =>
        filters.tourTypes.includes(tour.category)
      );
    }

    if (filters.accommodationTypes.length > 0) {
      filtered = filtered.filter((tour) =>
        filters.accommodationTypes.includes(tour.accommodationType)
      );
    }

    if (filters.groupSizes.length > 0) {
      filtered = filtered.filter((tour) =>
        filters.groupSizes.includes(tour.groupSize)
      );
    }

    if (filters.difficulty.length > 0) {
      filtered = filtered.filter((tour) =>
        filters.difficulty.includes(tour.difficulty)
      );
    }

    filtered = filtered.filter(
      (tour) =>
        tour.duration >= filters.duration[0] &&
        tour.duration <= filters.duration[1]
    );

    filtered = filtered.filter(
      (tour) =>
        tour.price >= filters.priceRange[0] &&
        tour.price <= filters.priceRange[1]
    );

    filtered = filtered.filter((tour) => tour.rating >= filters.rating);

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "duration":
        filtered.sort((a, b) => a.duration - b.duration);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // popularity - keep original order
        break;
    }

    setFilteredTours(filtered);
  }, [tours, searchQuery, filters, sortBy]);

  return (
    <div className="min-h-screen bg-background safari-texture pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Search and Controls */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search safaris, destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
                aria-label="Sort tours by"
              >
                <option value="popularity">Sort by Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="duration">Duration</option>
                <option value="rating">Rating</option>
              </select>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="text-muted-foreground">
            Showing {filteredTours.length} of {tours.length} safari packages
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block w-full lg:w-80 flex-shrink-0`}
          >
            <FilterSidebar filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <TourGrid tours={filteredTours} viewMode={viewMode} />
          </div>
        </div>
      </div>
    </div>
  );
}
