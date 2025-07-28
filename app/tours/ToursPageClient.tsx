"use client";

import {
  useState,
  useMemo,
  Suspense,
  useEffect,
  createContext,
  useContext,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Grid,
  List,
  SlidersHorizontal,
  MapPin,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FilterSidebar from "@/components/tours/FilterSidebar";
import TourCardSkeleton from "@/components/tours/TourCardSkeleton";
import { useLocationBasedFilters } from "@/hooks/useLocationBasedFilters";
import type { FilterState, TourPackage } from "@/lib/types";

interface ToursPageClientProps {
  children: React.ReactNode;
}

// Create context for filters and sort state
interface ToursContextType {
  filters: FilterState;
  sortBy: string;
  setFilters: (filters: FilterState) => void;
  setSortBy: (sortBy: string) => void;
}

const ToursContext = createContext<ToursContextType | undefined>(undefined);

export const useToursContext = () => {
  const context = useContext(ToursContext);
  if (!context) {
    throw new Error("useToursContext must be used within a ToursPageClient");
  }
  return context;
};

export default function ToursPageClient({ children }: ToursPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("query") || ""
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("order") || "popularity"
  );
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

  // Location-based filter preselection
  const {
    isDetectingLocation,
    locationDetected,
    userLocation,
    clearLocationPreselection,
    manuallyPreselectDestination,
  } = useLocationBasedFilters({
    initialFilters: filters,
    onFiltersChange: setFilters,
  });

  // Update URL when search parameters change
  const updateURL = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    params.set("page", "1");

    router.push(`?${params.toString()}`);
  };

  // Handle search query changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateURL({ query });
  };

  // Handle sort changes
  const handleSortChange = (order: string) => {
    setSortBy(order);
    updateURL({ order });
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // For now, we'll implement frontend filtering as fallback
    // In the future, you could add more API parameters for these filters
  };

  const contextValue = {
    filters,
    sortBy,
    setFilters: handleFiltersChange,
    setSortBy: handleSortChange,
  };

  return (
    <ToursContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background safari-texture pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Location Detection Status */}
          {isDetectingLocation && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                <Globe className="h-4 w-4 animate-spin" />
                <span className="text-sm">
                  Detecting your location to show relevant tours...
                </span>
              </div>
            </div>
          )}

          {/* Location-Based Filter Notification */}
          {locationDetected &&
            userLocation &&
            filters.destinations.length > 0 && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">
                      Showing tours in{" "}
                      <strong>{filters.destinations[0]}</strong> based on your
                      location ({userLocation.country})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearLocationPreselection}
                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}

          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search safaris, destinations..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
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
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                  aria-label="Sort tours by"
                >
                  <option value="popularity">Sort by Popularity</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
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
          </div>

          <div className="flex gap-8">
            <div
              className={`${
                showFilters ? "block" : "hidden"
              } lg:block w-full lg:w-80 flex-shrink-0`}
            >
              <FilterSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                userLocation={userLocation}
                onManualDestinationSelect={manuallyPreselectDestination}
              />
            </div>

            <div className="flex-1">{children}</div>
          </div>
        </div>
      </div>
    </ToursContext.Provider>
  );
}
