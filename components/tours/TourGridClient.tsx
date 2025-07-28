"use client";

import TourCard from "./TourCard";
import type { TourPackage } from "@/lib/types";

interface TourGridClientProps {
  tours: TourPackage[];
  viewMode: "grid" | "list";
}

export default function TourGridClient({
  tours,
  viewMode,
}: TourGridClientProps) {
  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-6"
      }
    >
      {tours.map((tour) => (
        <TourCard key={tour.id} tour={tour} viewMode={viewMode} />
      ))}
    </div>
  );
}
