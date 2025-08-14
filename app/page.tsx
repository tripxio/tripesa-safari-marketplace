import { Suspense } from "react";
import HeroSection from "@/components/home/HeroSection";
import FeaturedDestinations from "@/components/home/FeaturedDestinations";
import PopularTours from "@/components/home/PopularTours";
import TourCardSkeleton from "@/components/tours/TourCardSkeleton";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <TourCardSkeleton key={i} viewMode="grid" />
            ))}
          </div>
        }
      >
        <PopularTours />
      </Suspense>
      <FeaturedDestinations />
    </main>
  );
}
