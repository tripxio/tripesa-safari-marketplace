import TourCard from "./TourCard";
import type { TourPackage } from "@/lib/types";

interface TourGridProps {
  tours: TourPackage[];
  viewMode: "grid" | "list";
}

export default function TourGrid({ tours, viewMode }: TourGridProps) {
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

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-6"
      }
    >
      {tours.map((tour) => (
        <TourCard
          key={tour.id}
          tour={tour}
          viewMode={viewMode}
          isWishlisted={false}
          onToggleWishlist={() => {}}
        />
      ))}
    </div>
  );
}
