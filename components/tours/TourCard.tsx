"use client"

import { Heart, Star, Users, Clock, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TourPackage } from "@/lib/types"

interface TourCardProps {
  tour: TourPackage
  viewMode: "grid" | "list"
  isWishlisted: boolean
  onToggleWishlist: () => void
}

export default function TourCard({ tour, viewMode, isWishlisted, onToggleWishlist }: TourCardProps) {
  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-80 h-64 md:h-auto">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url('${tour.images[0]}')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-white/20 backdrop-blur hover:bg-white/30"
              onClick={onToggleWishlist}
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-white"}`} />
            </Button>

            <div className="absolute top-4 left-4">
              <Badge className="bg-orange-500 text-white">${tour.price.toLocaleString()}</Badge>
            </div>
          </div>

          <CardContent className="flex-1 p-6">
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

            <h3 className="text-xl font-bold mb-3 hover:text-orange-500 transition-colors cursor-pointer">
              {tour.title}
            </h3>

            <div className="flex items-center space-x-6 mb-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{tour.duration} days</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{tour.groupSize}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{tour.difficulty}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {tour.highlights.slice(0, 4).map((highlight, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0" />
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
        </div>
      </Card>
    )
  }

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
      <div className="relative">
        <div
          className="h-64 bg-cover bg-center"
          style={{
            backgroundImage: `url('${tour.images[0]}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-white/20 backdrop-blur hover:bg-white/30"
          onClick={onToggleWishlist}
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-white"}`} />
        </Button>

        <div className="absolute top-4 left-4">
          <Badge className="bg-orange-500 text-white">${tour.price.toLocaleString()}</Badge>
        </div>

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
  )
}
