/**
 * Alternative API service that uses internal API routes for better caching
 * This is optional - the external API calls in api.ts also work with caching
 */

import type {
  ApiResponse,
  Agency,
  TourPackage,
  InquiryRequest,
  InquiryResponse,
  BookingRequest,
  BookingResponse,
} from "@/lib/types";

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

// Alternative implementation using internal API routes for better caching
export const getToursInternal = async (
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

  const response = await fetch(`/api/tours?${params.toString()}`, {
    headers: {
      "Content-Type": "application/json",
    },
    // Let the browser handle caching with our optimized headers
    cache: "default",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tours");
  }

  return response.json();
};

export const getTourInternal = async (
  slug: string
): Promise<{ data: TourPackage }> => {
  const response = await fetch(`/api/tours/${slug}`, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "default",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tour");
  }

  return response.json();
};

export const getAgencyInternal = async (
  agencyId: number
): Promise<{ data: Agency }> => {
  const response = await fetch(`/api/agencies/${agencyId}`, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "default",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch agency");
  }

  return response.json();
};

// Re-export the other functions from the main API service
export {
  submitInquiry,
  submitBooking,
  submitMobileMoneyPayment,
  submitCardPayment,
  createPaymentPayload,
  getPaymentFees,
  cleanupCache,
  prefetchPopularTours,
  warmCacheForUser,
  backgroundRevalidate,
} from "./api";
