export interface TourPackage {
  id: string
  title: string
  destination: string
  duration: number
  price: number
  currency: string
  rating: number
  reviewCount: number
  images: string[]
  highlights: string[]
  tourOperator: {
    name: string
    logo: string
  }
  accommodationType: "Budget" | "Mid-range" | "Luxury"
  groupSize: "Private" | "Small group" | "Large group"
  difficulty: "Easy" | "Moderate" | "Challenging"
  category: "Wildlife" | "Gorilla trekking" | "Cultural" | "Adventure"
}

export interface FilterState {
  destinations: string[]
  duration: [number, number]
  priceRange: [number, number]
  tourTypes: string[]
  accommodationTypes: string[]
  groupSizes: string[]
  difficulty: string[]
  rating: number
}
