export interface TourPackage {
  id: number;
  title: string;
  slug: string;
  short_description: string | null;
  description: string;
  experience_duration: string | null;
  display_price: string | null;
  city: string;
  country_code: string;
  featured: boolean;
  gallery: {
    url: string;
    thumbnail_url: string;
  }[];
  first_media: {
    url: string;
    thumbnail_url: string;
  } | null;
  currency: {
    code: string;
    symbol: string;
  };
  unit: {
    name: string;
  };
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
  destinations: string[];
  duration: [number, number];
  priceRange: [number, number];
  tourTypes: string[];
  accommodationTypes: string[];
  groupSizes: string[];
  difficulty: string[];
  rating: number;
}
