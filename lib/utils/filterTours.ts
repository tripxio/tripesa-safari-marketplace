import type { TourPackage } from "@/lib/types";
import type { FilterState } from "@/lib/types";

export function filterTours(
  tours: TourPackage[],
  filters: FilterState
): TourPackage[] {
  return tours.filter((tour) => {
    // Filter by search query
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      const searchFields = [
        tour.title || "",
        tour.short_description || "",
        tour.city || "",
      ]
        .join(" ")
        .toLowerCase();

      if (!searchFields.includes(query)) {
        return false;
      }
    }

    // Filter by destinations (using country codes)
    if (filters.destinations.length > 0) {
      const tourCountry = tour.country_code?.toLowerCase() || "";
      const hasMatchingDestination = filters.destinations.some(
        (destination) => {
          // Map destination names to country codes
          const destinationMap: Record<string, string> = {
            uganda: "ug",
            tanzania: "tz",
            kenya: "ke",
            rwanda: "rw",
            botswana: "bw",
            "south africa": "za",
          };
          const countryCode = destinationMap[destination.toLowerCase()];
          return countryCode && tourCountry === countryCode;
        }
      );
      if (!hasMatchingDestination) return false;
    }

    // Filter by duration (only if checkbox is checked)
    if (filters.useDurationFilter && filters.duration) {
      // Handle both string and number experience_duration
      let tourDuration = 0;
      if (typeof tour.experience_duration === "string") {
        tourDuration = parseInt(tour.experience_duration.split(" ")[0] || "0");
      } else if (typeof tour.experience_duration === "number") {
        tourDuration = tour.experience_duration;
      }

      if (
        tourDuration < filters.duration[0] ||
        tourDuration > filters.duration[1]
      ) {
        return false;
      }
    }

    // Filter by price range (only if checkbox is checked)
    if (
      filters.usePriceRangeFilter &&
      filters.priceRange &&
      tour.display_price
    ) {
      const tourPrice = parseFloat(tour.display_price);
      if (
        tourPrice < filters.priceRange[0] ||
        tourPrice > filters.priceRange[1]
      ) {
        return false;
      }
    }

    // Filter by tour types (based on title keywords)
    if (filters.tourTypes.length > 0) {
      const tourTitle = tour.title?.toLowerCase() || "";
      const hasMatchingType = filters.tourTypes.some((type) =>
        tourTitle.includes(type.toLowerCase())
      );
      if (!hasMatchingType) return false;
    }

    // Filter by rating (if we had rating data)
    if (filters.rating > 0) {
      // This would need actual rating data from the tour
      // For now, we'll skip this filter
    }

    return true;
  });
}

export function sortTours(tours: TourPackage[], sortBy: string): TourPackage[] {
  const sortedTours = [...tours];

  switch (sortBy) {
    case "price_asc":
      return sortedTours.sort((a, b) => {
        const priceA = parseFloat(a.display_price || "0");
        const priceB = parseFloat(b.display_price || "0");
        return priceA - priceB;
      });

    case "price_desc":
      return sortedTours.sort((a, b) => {
        const priceA = parseFloat(a.display_price || "0");
        const priceB = parseFloat(b.display_price || "0");
        return priceB - priceA;
      });

    case "name_asc":
      return sortedTours.sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      );

    case "name_desc":
      return sortedTours.sort((a, b) =>
        (b.title || "").localeCompare(a.title || "")
      );

    case "latest":
      return sortedTours.sort((a, b) => {
        const dateA = new Date(a.created_at || "");
        const dateB = new Date(b.created_at || "");
        return dateB.getTime() - dateA.getTime();
      });

    case "oldest":
      return sortedTours.sort((a, b) => {
        const dateA = new Date(a.created_at || "");
        const dateB = new Date(b.created_at || "");
        return dateA.getTime() - dateB.getTime();
      });

    default:
      return sortedTours;
  }
}
