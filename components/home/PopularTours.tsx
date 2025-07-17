import { getTours } from "@/lib/services/api";
import TourGridClient from "@/components/tours/TourGridClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TourPackage } from "@/lib/types";

export default async function PopularTours() {
  const response = await getTours({}, 1); // Fetch first page
  const popularTours: TourPackage[] = response.data.slice(0, 6);

  return (
    <section className="py-16 bg-background safari-texture">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Popular Safari Tours
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our most loved safari experiences, handpicked by travelers
            and curated by our expert team
          </p>
        </div>

        <TourGridClient tours={popularTours} viewMode="grid" />

        <div className="text-center mt-12">
          <Link href="/tours">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8"
            >
              View All Tours
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
