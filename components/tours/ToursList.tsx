import { getTours } from "@/lib/services/api";
import TourGridClient from "@/components/tours/TourGridClient";
import PaginationControls from "@/components/tours/PaginationControls";
import { TourPackage } from "@/lib/types";

interface ToursListProps {
  category: string | null;
  page: number;
  viewMode: "grid" | "list";
}

export default async function ToursList({
  category,
  page,
  viewMode,
}: ToursListProps) {
  try {
    const response = await getTours({ category }, page);
    const tours: TourPackage[] = response.data || [];
    const paginationMeta = response.meta;

    if (tours.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-2xl font-bold">No Tours Found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your filters or search criteria.
          </p>
        </div>
      );
    }

    return (
      <div>
        <TourGridClient tours={tours} viewMode={viewMode} />
        {paginationMeta && paginationMeta.last_page > 1 && (
          <PaginationControls
            lastPage={paginationMeta.last_page}
            currentPage={paginationMeta.current_page}
          />
        )}
      </div>
    );
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
