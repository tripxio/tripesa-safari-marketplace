import { Suspense } from "react";
import HeroSection from "@/components/home/HeroSection";
import PopularTours from "@/components/home/PopularTours";
import TourCardSkeleton from "@/components/tours/TourCardSkeleton";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Suspense
        fallback={
          <section className="py-16 bg-background safari-texture">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Popular Safari Tours
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Discover our most loved safari experiences, handpicked by
                  travelers and curated by our expert team
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <TourCardSkeleton key={i} viewMode="grid" />
                ))}
              </div>
            </div>
          </section>
        }
      >
        <PopularTours />
      </Suspense>
    </>
  );
}
