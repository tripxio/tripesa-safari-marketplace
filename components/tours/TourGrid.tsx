import TourCard from "./TourCard";
import TourCardSkeleton from "./TourCardSkeleton";
import type { TourPackage } from "@/lib/types";

interface TourGridProps {
  tours: TourPackage[];
  viewMode: "grid" | "list";
  isLoading?: boolean;
  showSkeletons?: boolean;
}

export default function TourGrid({
  tours,
  viewMode,
  isLoading = false,
  showSkeletons = false,
}: TourGridProps) {
  const gridClasses =
    viewMode === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      : "space-y-6";

  // Show skeletons while loading
  if (isLoading || showSkeletons) {
    return (
      <div className={gridClasses}>
        {Array.from({ length: 6 }).map((_, index) => (
          <TourCardSkeleton key={`skeleton-${index}`} viewMode={viewMode} />
        ))}
      </div>
    );
  }

  // Show empty state
  if (tours.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🦁</div>
        <h3 className="text-xl font-semibold mb-2">No tours found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or search terms to find more safari
          adventures.
        </p>
      </div>
    );
  }

  // Show tours with optional loading overlay
  return (
    <div className="relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-start justify-center pt-8">
          <div className="bg-background border border-border rounded-lg px-4 py-3 shadow-lg flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Loading tours...</span>
          </div>
        </div>
      )}

      <div className={gridClasses}>
        {tours.map((tour) => (
          <TourCard key={tour.id} tour={tour} viewMode={viewMode} />
        ))}
      </div>
    </div>
  );
}
