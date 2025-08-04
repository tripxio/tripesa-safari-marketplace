import { Suspense } from "react";
import ToursList from "@/components/tours/ToursList";
import ToursPageClient from "./ToursPageClient";
import TourCardSkeleton from "@/components/tours/TourCardSkeleton";

interface ToursPageProps {
  searchParams: Promise<{
    query?: string;
    location?: string;
    destination?: string;
    order?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function ToursPage({ searchParams }: ToursPageProps) {
  const params = await searchParams;

  // Parse search parameters
  const query = params.query || null;
  const category = params.category || null;
  const order = params.order || null;
  const page = parseInt(params.page || "1", 10);

  // Parse location if provided (format: "lat,lng")
  let location = null;
  if (params.location) {
    const [lat, lng] = params.location.split(",").map(Number);
    if (!isNaN(lat) && !isNaN(lng)) {
      location = { lat, lng };
    }
  }

  const suspenseKey = `${query}-${category}-${order}-${params.location}-${page}`;

  return (
    <ToursPageClient>
      <Suspense
        key={suspenseKey}
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <TourCardSkeleton key={index} viewMode="grid" />
            ))}
          </div>
        }
      >
        <ToursList
          query={query}
          category={category}
          order={order}
          location={location}
          page={page}
        />
      </Suspense>
      {/* Pagination will be handled in a future step */}
    </ToursPageClient>
  );
}
