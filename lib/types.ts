export interface Agency {
  id: number;
  name: string;
  description: string;
  slug: string;
  address: string;
  city: string;
  country: string;
  email_address: string;
  phone_number: string;
  logo: string;
  url: string;
}

export interface TourPackage {
  id: number;
  title: string;
  slug: string;
  short_description: string | null;
  description: string;
  experience_duration: string | number | null;
  display_price: string | null;
  city: string;
  country_code: string;
  featured: boolean;
  agency_id?: number;
  agent_id?: number;
  currency_id?: number;
  unit_id?: number;
  is_included?: string | null;
  is_not_included?: string | null;
  is_offered?: number;
  valid_from?: string | null;
  valid_to?: string | null;
  allows_installments?: boolean;
  is_booking_deadline?: boolean;
  booking_deadline?: string | null;
  is_price_options?: number;
  price_options?: string;
  country_id?: number | null;
  is_custom?: number;
  unit_label?: string;
  disable_booking?: boolean;
  gallery: {
    url: string;
    thumbnail_url: string;
    name: string;
  }[];
  first_media: {
    url: string;
    thumbnail_url: string;
    name?: string;
  } | null;
  currency: {
    id: number;
    name: string;
    code: string;
    symbol: string;
  } | null;
  unit: {
    id: number;
    name: string;
    description: string;
  };
  package_tags?: string[];
  allowed_meta?: Array<{
    key: string;
    value: string;
  }>;
  services?: any[];
  options?: any[];
  itineraries?: Array<{
    id: number;
    package_id: number;
    title: string | null;
    name: string | null;
    image: string | null;
    description: string | null;
    gallery: any[];
    first_media: any;
    images: any[];
  }>;
  instalment_settings?: any;
  discounts?: any[];
  meta?: any[];
  images?: any[];
  package_images?: any[];
  created_at?: string;
}

export interface ApiResponse {
  data: TourPackage[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    to: number;
    total: number;
  };
}

export interface FilterState {
  searchQuery: string;
  destinations: string[];
  duration: [number, number];
  priceRange: [number, number];
  tourTypes: string[];
  accommodationTypes: string[];
  groupSizes: string[];
  difficulty: string[];
  rating: number;
}
