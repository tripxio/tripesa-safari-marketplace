import type { ApiResponse, Agency } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getTours = async (
  filters: any = {},
  page: number = 1
): Promise<ApiResponse> => {
  const params = new URLSearchParams();

  if (filters.category) {
    params.append("category", filters.category);
  }
  if (filters.location) {
    params.append("location", filters.location);
  }
  params.append("page", page.toString());
  // Add other filters as needed

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
