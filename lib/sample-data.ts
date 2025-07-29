import type { TourPackage } from "./types";

export const sampleTours: TourPackage[] = [
  {
    id: 1,
    title: "Gorilla Trekking Adventure",
    slug: "gorilla-trekking-adventure",
    short_description:
      "Experience the thrill of encountering mountain gorillas in their natural habitat",
    description:
      "Embark on an unforgettable journey to Bwindi Impenetrable National Park, home to nearly half of the world's remaining mountain gorillas. This guided trek takes you through dense rainforest where you'll spend precious moments observing these magnificent creatures in their natural environment.",
    experience_duration: "1 day",
    display_price: "1500",
    city: "Bwindi",
    country_code: "UG",
    featured: true,
    agency_id: 1,
    gallery: [
      {
        url: "/images/gorilla-trekking-1.jpg",
        thumbnail_url: "/images/gorilla-trekking-1-thumb.jpg",
        name: "Mountain Gorilla Family",
      },
      {
        url: "/images/gorilla-trekking-2.jpg",
        thumbnail_url: "/images/gorilla-trekking-2-thumb.jpg",
        name: "Bwindi Forest Trek",
      },
    ],
    first_media: {
      url: "/images/gorilla-trekking-1.jpg",
      thumbnail_url: "/images/gorilla-trekking-1-thumb.jpg",
      name: "Mountain Gorilla Family",
    },
    currency: {
      id: 1,
      name: "US Dollar",
      code: "USD",
      symbol: "$",
    },
    unit: {
      id: 1,
      name: "per person",
      description: "Pricing is per person",
    },
  },
  {
    id: 2,
    title: "Serengeti Wildlife Safari",
    slug: "serengeti-wildlife-safari",
    short_description:
      "Witness the great migration and diverse wildlife of the Serengeti",
    description:
      "Experience the magic of the Serengeti, one of Africa's most iconic wildlife destinations. This safari takes you through vast plains teeming with wildlife, including the famous Big Five. Witness the annual wildebeest migration and enjoy luxury accommodations under the African sky.",
    experience_duration: "5 days",
    display_price: "2800",
    city: "Serengeti",
    country_code: "TZ",
    featured: true,
    agency_id: 2,
    gallery: [
      {
        url: "/images/serengeti-safari-1.jpg",
        thumbnail_url: "/images/serengeti-safari-1-thumb.jpg",
        name: "Serengeti Migration",
      },
      {
        url: "/images/serengeti-safari-2.jpg",
        thumbnail_url: "/images/serengeti-safari-2-thumb.jpg",
        name: "African Wildlife",
      },
    ],
    first_media: {
      url: "/images/serengeti-safari-1.jpg",
      thumbnail_url: "/images/serengeti-safari-1-thumb.jpg",
      name: "Serengeti Migration",
    },
    currency: {
      id: 1,
      name: "US Dollar",
      code: "USD",
      symbol: "$",
    },
    unit: {
      id: 1,
      name: "per person",
      description: "Pricing is per person",
    },
  },
  {
    id: 3,
    title: "Kilimanjaro Summit Trek",
    slug: "kilimanjaro-summit-trek",
    short_description:
      "Conquer Africa's highest peak on this challenging mountain expedition",
    description:
      "Challenge yourself to reach the summit of Mount Kilimanjaro, Africa's highest peak at 5,895 meters. This carefully planned trek takes you through diverse ecosystems, from rainforest to alpine desert, culminating in a sunrise summit experience you'll never forget.",
    experience_duration: "8 days",
    display_price: "3200",
    city: "Kilimanjaro",
    country_code: "TZ",
    featured: false,
    agency_id: 3,
    gallery: [
      {
        url: "/images/kilimanjaro-trek-1.jpg",
        thumbnail_url: "/images/kilimanjaro-trek-1-thumb.jpg",
        name: "Kilimanjaro Summit",
      },
      {
        url: "/images/kilimanjaro-trek-2.jpg",
        thumbnail_url: "/images/kilimanjaro-trek-2-thumb.jpg",
        name: "Mountain Trek Route",
      },
    ],
    first_media: {
      url: "/images/kilimanjaro-trek-1.jpg",
      thumbnail_url: "/images/kilimanjaro-trek-1-thumb.jpg",
      name: "Kilimanjaro Summit",
    },
    currency: {
      id: 1,
      name: "US Dollar",
      code: "USD",
      symbol: "$",
    },
    unit: {
      id: 1,
      name: "per person",
      description: "Pricing is per person",
    },
  },
  {
    id: 4,
    title: "Zanzibar Beach Paradise",
    slug: "zanzibar-beach-paradise",
    short_description:
      "Relax on pristine beaches and explore the historic Stone Town",
    description:
      "Discover the tropical paradise of Zanzibar, where pristine white-sand beaches meet crystal-clear waters. Explore the historic Stone Town, a UNESCO World Heritage site, and immerse yourself in the island's rich culture and history.",
    experience_duration: "7 days",
    display_price: "1800",
    city: "Zanzibar",
    country_code: "TZ",
    featured: false,
    agency_id: 4,
    gallery: [
      {
        url: "/images/zanzibar-beach-1.jpg",
        thumbnail_url: "/images/zanzibar-beach-1-thumb.jpg",
        name: "Zanzibar Beach Paradise",
      },
      {
        url: "/images/zanzibar-beach-2.jpg",
        thumbnail_url: "/images/zanzibar-beach-2-thumb.jpg",
        name: "Stone Town Historic",
      },
    ],
    first_media: {
      url: "/images/zanzibar-beach-1.jpg",
      thumbnail_url: "/images/zanzibar-beach-1-thumb.jpg",
      name: "Zanzibar Beach Paradise",
    },
    currency: {
      id: 1,
      name: "US Dollar",
      code: "USD",
      symbol: "$",
    },
    unit: {
      id: 1,
      name: "per person",
      description: "Pricing is per person",
    },
  },
  {
    id: 5,
    title: "Masai Mara Adventure",
    slug: "masai-mara-adventure",
    short_description: "Experience the best of Kenya's wildlife and culture",
    description:
      "Journey to the Masai Mara, Kenya's most famous wildlife reserve. This adventure combines thrilling game drives with cultural experiences, including visits to traditional Masai villages. Witness the incredible biodiversity and learn about local conservation efforts.",
    experience_duration: "6 days",
    display_price: "2200",
    city: "Masai Mara",
    country_code: "KE",
    featured: true,
    agency_id: 5,
    gallery: [
      {
        url: "/images/masai-mara-1.jpg",
        thumbnail_url: "/images/masai-mara-1-thumb.jpg",
        name: "Masai Mara Wildlife",
      },
      {
        url: "/images/masai-mara-2.jpg",
        thumbnail_url: "/images/masai-mara-2-thumb.jpg",
        name: "Masai Cultural Village",
      },
    ],
    first_media: {
      url: "/images/masai-mara-1.jpg",
      thumbnail_url: "/images/masai-mara-1-thumb.jpg",
      name: "Masai Mara Wildlife",
    },
    currency: {
      id: 1,
      name: "US Dollar",
      code: "USD",
      symbol: "$",
    },
    unit: {
      id: 1,
      name: "per person",
      description: "Pricing is per person",
    },
  },
  {
    id: 6,
    title: "Victoria Falls Explorer",
    slug: "victoria-falls-explorer",
    short_description:
      "Marvel at one of the world's most spectacular waterfalls",
    description:
      "Experience the awe-inspiring Victoria Falls, known locally as 'The Smoke That Thunders'. This adventure includes guided tours of the falls, thrilling activities like white-water rafting, and opportunities to spot wildlife in the surrounding national parks.",
    experience_duration: "4 days",
    display_price: "1600",
    city: "Victoria Falls",
    country_code: "ZW",
    featured: false,
    agency_id: 6,
    gallery: [
      {
        url: "/images/victoria-falls-1.jpg",
        thumbnail_url: "/images/victoria-falls-1-thumb.jpg",
        name: "Victoria Falls Waterfall",
      },
      {
        url: "/images/victoria-falls-2.jpg",
        thumbnail_url: "/images/victoria-falls-2-thumb.jpg",
        name: "White Water Rafting",
      },
    ],
    first_media: {
      url: "/images/victoria-falls-1.jpg",
      thumbnail_url: "/images/victoria-falls-1-thumb.jpg",
      name: "Victoria Falls Waterfall",
    },
    currency: {
      id: 1,
      name: "US Dollar",
      code: "USD",
      symbol: "$",
    },
    unit: {
      id: 1,
      name: "per person",
      description: "Pricing is per person",
    },
  },
  {
    id: 7,
    title: "Cape Town City & Wine Tour",
    slug: "cape-town-city-wine-tour",
    short_description:
      "Discover South Africa's most beautiful city and its famous wine regions",
    description:
      "Explore the vibrant city of Cape Town, from the iconic Table Mountain to the historic Robben Island. Then journey to the nearby wine regions of Stellenbosch and Franschhoek for wine tastings and gourmet dining experiences.",
    experience_duration: "5 days",
    display_price: "1900",
    city: "Cape Town",
    country_code: "ZA",
    featured: false,
    agency_id: 7,
    gallery: [
      {
        url: "/images/cape-town-1.jpg",
        thumbnail_url: "/images/cape-town-1-thumb.jpg",
        name: "Table Mountain View",
      },
      {
        url: "/images/cape-town-2.jpg",
        thumbnail_url: "/images/cape-town-2-thumb.jpg",
        name: "Wine Country Vineyards",
      },
    ],
    first_media: {
      url: "/images/cape-town-1.jpg",
      thumbnail_url: "/images/cape-town-1-thumb.jpg",
      name: "Table Mountain View",
    },
    currency: {
      id: 1,
      name: "US Dollar",
      code: "USD",
      symbol: "$",
    },
    unit: {
      id: 1,
      name: "per person",
      description: "Pricing is per person",
    },
  },
  {
    id: 8,
    title: "Namib Desert Adventure",
    slug: "namib-desert-adventure",
    short_description:
      "Explore the world's oldest desert and its towering sand dunes",
    description:
      "Venture into the Namib Desert, home to some of the world's highest sand dunes. This adventure includes guided walks through the desert, visits to the famous Sossusvlei dunes, and opportunities to spot unique desert wildlife and plants.",
    experience_duration: "6 days",
    display_price: "2100",
    city: "Namib Desert",
    country_code: "NA",
    featured: false,
    agency_id: 8,
    gallery: [
      {
        url: "/images/namib-desert-1.jpg",
        thumbnail_url: "/images/namib-desert-1-thumb.jpg",
        name: "Sossusvlei Sand Dunes",
      },
      {
        url: "/images/namib-desert-2.jpg",
        thumbnail_url: "/images/namib-desert-2-thumb.jpg",
        name: "Desert Wildlife",
      },
    ],
    first_media: {
      url: "/images/namib-desert-1.jpg",
      thumbnail_url: "/images/namib-desert-1-thumb.jpg",
      name: "Sossusvlei Sand Dunes",
    },
    currency: {
      id: 1,
      name: "US Dollar",
      code: "USD",
      symbol: "$",
    },
    unit: {
      id: 1,
      name: "per person",
      description: "Pricing is per person",
    },
  },
];
