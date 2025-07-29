import { getTours } from "@/lib/services/api";
import ToursListClient from "@/components/tours/ToursListClient";
import type { TourPackage } from "@/lib/types";

interface ToursListProps {
  query: string | null;
  category: string | null;
  order: string | null;
  location: { lat: number; lng: number } | null;
  page: number;
}

export default async function ToursList({
  query,
  category,
  order,
  location,
  page,
}: ToursListProps) {
  try {
    // Prepare filters for API call
    const filters: any = {};
    if (query) filters.query = query;
    if (category) filters.category = category;
    if (order) filters.order = order;
    if (location) filters.location = location;

    const response = await getTours(filters, page);
    const tours: TourPackage[] = response.data || [];
    const paginationMeta = response.meta;

    return <ToursListClient tours={tours} paginationMeta={paginationMeta} />;
  } catch (error) {
    console.error("Error fetching tours:", error);
    return (
      <div className="text-center py-12 text-red-500">
        <h3 className="text-2xl font-bold">Something Went Wrong</h3>
        <p className="mt-2">
          We couldn't load the tours. Please try again later.
        </p>
      </div>
    );
  }
}
