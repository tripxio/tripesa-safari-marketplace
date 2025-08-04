"use client";

import {
  useState,
  useMemo,
  Suspense,
  useEffect,
  createContext,
  useContext,
  useRef,
  useCallback,
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
  viewMode: "grid" | "list";
  setFilters: (filters: FilterState) => void;
  setSortBy: (sortBy: string) => void;
  setViewMode: (viewMode: "grid" | "list") => void;
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
  const [sortBy, setSortBy] = useState(searchParams.get("order") || "latest");
  const [autoSelectedDestinations, setAutoSelectedDestinations] = useState<
    string[]
  >([]);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: searchParams.get("query") || "",
    destinations: [],
    duration: [1, 30],
    priceRange: [0, 50000],
    useDurationFilter: false,
    usePriceRangeFilter: false,
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
    clearLocationPreselection: originalClearLocationPreselection,
    manuallyPreselectDestination,
  } = useLocationBasedFilters({
    initialFilters: filters,
    onFiltersChange: (newFilters) => {
      setFilters(newFilters);
      // Track auto-selected destinations when they're applied by location detection
      if (
        newFilters.destinations.length > 0 &&
        autoSelectedDestinations.length === 0
      ) {
        setAutoSelectedDestinations([...newFilters.destinations]);
      }
    },
  });

  // Enhanced clear function that also clears auto-selected tracking
  const clearLocationPreselection = () => {
    originalClearLocationPreselection();
    setAutoSelectedDestinations([]);
  };

  // Handle destination parameter from URL (e.g., from destinations page)
  useEffect(() => {
    const destinationParam = searchParams.get("destination");
    if (destinationParam && filters.destinations.length === 0) {
      // Preselect the destination from URL parameter
      manuallyPreselectDestination(destinationParam);
    }
  }, [searchParams, manuallyPreselectDestination, filters.destinations.length]);

  // Debounced URL updates to prevent excessive API calls
  const urlUpdateTimeoutRef = useRef<any>(undefined);

  // Update URL when search parameters change (debounced)
  const updateURL = useCallback(
    (newParams: Record<string, string>) => {
      // Clear existing timeout
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current);
      }

      // Debounce URL updates to prevent rapid API calls
      urlUpdateTimeoutRef.current = setTimeout(() => {
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
      }, 3000); // Increased to 3 seconds to match slider debounce
    },
    [router, searchParams]
  );

  // Handle search query changes (debounced)
  const searchTimeoutRef = useRef<any>(undefined);
  const handleSearchChange = useCallback(
    (query: string) => {
      setFilters((prev) => ({
        ...prev,
        searchQuery: query,
      }));

      // Debounce search to prevent API spam
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        // Only trigger search if query has 3+ characters or is empty (to clear results)
        if (query.length >= 3 || query.length === 0) {
          updateURL({ query });
        }
      }, 1000); // Increased to 1 second debounce for search
    },
    [updateURL]
  );

  // Handle sort changes
  const handleSortChange = useCallback(
    (order: string) => {
      setSortBy(order);
      updateURL({ order });
    },
    [updateURL]
  );

  // Handle filter changes
  const handleFiltersChange = useCallback(
    (newFilters: FilterState) => {
      const prevDestinations = filters.destinations;
      setFilters(newFilters);

      // Clear auto-selected tracking if destinations were manually changed
      if (
        JSON.stringify(newFilters.destinations) !==
        JSON.stringify(prevDestinations)
      ) {
        // If destinations are now empty, clear auto-selected tracking
        if (newFilters.destinations.length === 0) {
          setAutoSelectedDestinations([]);
        } else {
          // If destinations changed but aren't empty, check if auto-selected ones are still there
          const hasAutoSelected = autoSelectedDestinations.some((dest) =>
            newFilters.destinations.includes(dest)
          );
          if (!hasAutoSelected) {
            setAutoSelectedDestinations([]);
          }
        }
      }

      // Update URL with search query from filters
      updateURL({ query: newFilters.searchQuery });
    },
    [updateURL, filters.destinations, autoSelectedDestinations]
  );

  // Prefetch popular tours on mount
  useEffect(() => {
    const prefetchData = async () => {
      // Import the prefetch function dynamically to avoid SSR issues
      const { prefetchPopularTours } = await import("@/lib/services/api");
      prefetchPopularTours();
    };

    // Prefetch after a short delay to not block initial render
    const timer = setTimeout(prefetchData, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current);
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const contextValue = {
    filters,
    sortBy,
    viewMode,
    setFilters: handleFiltersChange,
    setSortBy: handleSortChange,
    setViewMode,
  };

  return (
    <ToursContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background safari-texture pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Location Detection Status */}
          {isDetectingLocation && (
            <div className="mb-4 p-3 bg-muted/50 border border-border rounded-lg">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Globe className="h-4 w-4 animate-spin" />
                <span className="text-sm">
                  Detecting your location to show relevant tours...
                </span>
              </div>
            </div>
          )}

          {/* Location-Based Filter Notification */}
          {locationDetected && userLocation && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {filters.destinations.length > 0 ? (
                      <>
                        Showing tours in{" "}
                        <strong>{filters.destinations[0]}</strong> based on your
                        location ({userLocation.country})
                      </>
                    ) : (
                      <>
                        Location detected: {userLocation.country}.
                        <span className="ml-1 text-green-600 dark:text-green-400">
                          Browse all destinations or filter by your location.
                        </span>
                      </>
                    )}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearLocationPreselection}
                  className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                  title={
                    filters.destinations.length > 0
                      ? "Clear location filter"
                      : "Dismiss location notification"
                  }
                >
                  {filters.destinations.length > 0 ? "Clear" : "×"}
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
                  value={filters.searchQuery}
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

                <div className="flex items-center gap-3">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                    aria-label="Sort tours by"
                  >
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                    <option value="name_desc">Name: Z to A</option>
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
                onDestinationsCleared={clearLocationPreselection}
                autoSelectedDestinations={autoSelectedDestinations}
              />
            </div>

            <div className="flex-1">{children}</div>
          </div>
        </div>
      </div>
    </ToursContext.Provider>
  );
}
