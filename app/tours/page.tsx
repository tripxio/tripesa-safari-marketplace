import { Suspense } from "react";
import ToursList from "@/components/tours/ToursList";
import ToursPageClient from "./ToursPageClient";
import TourCardSkeleton from "@/components/tours/TourCardSkeleton";

interface ToursPageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
  }>;
}

export default async function ToursPage({ searchParams }: ToursPageProps) {
  const params = await searchParams;
  const category = params.category || null;
  const page = parseInt(params.page || "1", 10);
  const suspenseKey = `${category}-${page}`;

  // This is a placeholder for viewMode. In a real app, you might get this
  // from searchParams as well, but that would require client-side navigation
  // to update the URL. For now, we'll keep it simple.
  const viewMode = "grid";

  return (
    <ToursPageClient>
      <Suspense
        key={suspenseKey}
        fallback={
          <div
            className={`grid ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                : "grid-cols-1 gap-6"
            }`}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <TourCardSkeleton key={index} viewMode={viewMode} />
            ))}
          </div>
        }
      >
        <ToursList category={category} page={page} viewMode={viewMode} />
      </Suspense>
      {/* Pagination will be handled in a future step */}
    </ToursPageClient>
  );
}
