"use client"

import { useState } from "react"
import { Heart, Star, Users, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { sampleTours } from "@/lib/sample-data"
import Link from "next/link"

export default function PopularTours() {
  const [wishlist, setWishlist] = useState<string[]>([])
  const popularTours = sampleTours.slice(0, 6)

  const toggleWishlist = (tourId: string) => {
    setWishlist((prev) => (prev.includes(tourId) ? prev.filter((id) => id !== tourId) : [...prev, tourId]))
  }

  return (
    <section className="py-16 bg-background safari-texture">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Popular Safari Tours</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our most loved safari experiences, handpicked by travelers and curated by our expert team
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularTours.map((tour) => (
            <Card
              key={tour.id}
              className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative">
                <div
                  className="h-64 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${tour.images[0]}')`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Wishlist Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur hover:bg-white/30"
                  onClick={() => toggleWishlist(tour.id)}
                >
                  <Heart
                    className={`h-5 w-5 ${wishlist.includes(tour.id) ? "fill-red-500 text-red-500" : "text-white"}`}
                  />
                </Button>

                {/* Price Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-orange-500 text-white">${tour.price.toLocaleString()}</Badge>
                </div>

                {/* Tour Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center space-x-4 text-sm mb-2">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{tour.duration} days</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{tour.groupSize}</span>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-muted-foreground">{tour.destination}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{tour.rating}</span>
                    <span className="text-sm text-muted-foreground">({tour.reviewCount})</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-3 group-hover:text-orange-500 transition-colors">{tour.title}</h3>

                <div className="space-y-2 mb-4">
                  {tour.highlights.slice(0, 3).map((highlight, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={tour.tourOperator.logo || "/placeholder.svg"}
                      alt={tour.tourOperator.name}
                      className="w-6 h-6 rounded"
                    />
                    <span className="text-sm text-muted-foreground">{tour.tourOperator.name}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                      Book Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/tours">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8">
              View All Tours
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
