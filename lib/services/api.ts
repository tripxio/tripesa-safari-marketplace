import type { ApiResponse, Agency } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface TourFilters {
  query?: string;
  location?: {
    lat: number;
    lng: number;
  };
  order?:
    | "oldest"
    | "latest"
    | "price_asc"
    | "price_desc"
    | "name_asc"
    | "name_desc";
  category?: string;
  page?: number;
}

export const getTours = async (
  filters: TourFilters = {},
  page: number = 1
): Promise<ApiResponse> => {
  const params = new URLSearchParams();

  // Add query parameter for text search
  if (filters.query) {
    params.append("query", filters.query);
  }

  // Add location parameters for geographic search
  if (filters.location) {
    params.append("location[lat]", filters.location.lat.toString());
    params.append("location[lng]", filters.location.lng.toString());
  }

  // Add order parameter for sorting
  if (filters.order) {
    params.append("order", filters.order);
  }

  // Add category parameter
  if (filters.category) {
    params.append("category", filters.category);
  }

  // Add page parameter
  params.append("page", page.toString());

  const response = await fetch(`${API_BASE_URL}/tours?${params.toString()}`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    // You might want to handle errors more gracefully
    throw new Error("Failed to fetch tours");
  }

  return response.json();
};

export const getAgency = async (
  agencyId: number
): Promise<{ data: Agency }> => {
  const response = await fetch(`${API_BASE_URL}/agencies/${agencyId}/show`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error("Failed to fetch agency");
  }

  return response.json();
};

// You can add other API functions here, e.g., getTourById, getRooms, etc.
