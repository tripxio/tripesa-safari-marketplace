"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

interface Destination {
  name: string;
  country: string;
  imageUrl: string;
  filterValue: string;
}

const topDestinations: Destination[] = [
  {
    name: "Uganda",
    country: "Uganda",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/keith-kasaija-wrM9TOVDSrs-unsplash.jpg?updatedAt=1754337056510",
    filterValue: "Uganda",
  },
  {
    name: "Kenya",
    country: "Kenya",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/sergey-pesterev-DWXR-nAbxCk-unsplash.jpg?updatedAt=1754337054962",
    filterValue: "Kenya",
  },
  {
    name: "Tanzania",
    country: "Tanzania",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/hendrik-cornelissen-qs4E9t0hJc0-unsplash.jpg?updatedAt=1754337055680",
    filterValue: "Tanzania",
  },
  {
    name: "Rwanda",
    country: "Rwanda",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/reagan-m-d-eWGvLCZfQ-unsplash.jpg?updatedAt=1754337057512",
    filterValue: "Rwanda",
  },
];

const comingSoonDestinations: Destination[] = [
  {
    name: "Botswana",
    country: "Botswana",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/wynand-uys-4ZCA3xukIso-unsplash%20(1).jpg?updatedAt=1754337416507",
    filterValue: "Botswana",
  },
  {
    name: "South Africa",
    country: "South Africa",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/lina-loos-04-C1NZk1hE-unsplash.jpg?updatedAt=1754337558469",
    filterValue: "South Africa",
  },
  {
    name: "Ethiopia",
    country: "Ethiopia",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/erik-hathaway-eRFC0_U0hGE-unsplash.jpg",
    filterValue: "Ethiopia",
  },
  {
    name: "Namibia",
    country: "Namibia",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/sergi-ferrete-pWshkmAH4qA-unsplash.jpg",
    filterValue: "Namibia",
  },
  {
    name: "Zambia",
    country: "Zambia",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/henning-borgersen-aTAcckKiphI-unsplash.jpg",
    filterValue: "Zambia",
  },
  {
    name: "Zimbabwe",
    country: "Zimbabwe",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/tanner-marquis-xsypL99HP3Q-unsplash.jpg",
    filterValue: "Zimbabwe",
  },
  {
    name: "Malawi",
    country: "Malawi",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/maria-zardoya-f8Vkuc6fXQA-unsplash.jpg",
    filterValue: "Malawi",
  },
  {
    name: "Mozambique",
    country: "Mozambique",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/redcharlie-aexdWGJu7Gs-unsplash.jpg",
    filterValue: "Mozambique",
  },
];

interface DestinationTileProps {
  destination: Destination;
  isAvailable: boolean;
}

function DestinationTile({ destination, isAvailable }: DestinationTileProps) {
  const content = (
    <Card
      className={`group overflow-hidden hover:shadow-xl transition-all duration-300 h-48 relative ${
        isAvailable ? "hover:-translate-y-2 cursor-pointer" : "opacity-75"
      }`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${destination.imageUrl}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {!isAvailable && (
        <div className="absolute top-2 right-2">
          <div className="bg-orange-500/95 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
            Coming Soon
          </div>
        </div>
      )}

      <CardContent className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <div className="flex items-center gap-1 mb-1">
          <MapPin className="h-4 w-4" />
          <span className="text-sm font-medium">{destination.country}</span>
        </div>
        <h3 className="text-lg font-bold">{destination.name}</h3>
        {isAvailable && (
          <p className="text-xs text-white/80 mt-1 group-hover:text-white transition-colors">
            View Tours
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (!isAvailable) {
    return content;
  }

  return (
    <Link
      href={`/tours?destination=${encodeURIComponent(destination.filterValue)}`}
    >
      {content}
    </Link>
  );
}

export default function DestinationsPage() {
  return (
    <div className="min-h-screen pt-16 bg-background safari-texture">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Explore Africa
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the most stunning destinations across Africa. From wildlife
            safaris to cultural experiences, find your perfect adventure.
          </p>
        </motion.div>

        {/* Top Destinations Carousel */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">
            Top Destinations
          </h2>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {topDestinations.map((destination, index) => (
                <CarouselItem
                  key={index}
                  className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <DestinationTile
                    destination={destination}
                    isAvailable={true}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </motion.section>

        {/* Coming Soon Destinations Carousel */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">Coming Soon</h2>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {comingSoonDestinations.map((destination, index) => (
                <CarouselItem
                  key={index}
                  className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <DestinationTile
                    destination={destination}
                    isAvailable={false}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </motion.section>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center bg-orange-50 dark:bg-orange-950/20 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold mb-4">
            Ready to Start Your Adventure?
          </h3>
          <p className="text-muted-foreground mb-6">
            Browse all available tours or get in touch with our experts to plan
            your perfect safari experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tours"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              Browse All Tours
            </Link>
            <Link
              href="/contact"
              className="border border-orange-500 text-orange-500 hover:bg-orange-500/10 px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
