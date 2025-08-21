"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getFeaturedDestinations,
  FeaturedDestination,
} from "@/lib/firebase/config-service";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import DestinationModal from "./DestinationModal";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/common/ThemeProvider";

const DESCRIPTION_TRUNCATE_LENGTH = 120;

export default function FeaturedDestinations() {
  const [destinations, setDestinations] = useState<FeaturedDestination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] =
    useState<FeaturedDestination | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mode, config } = useTheme();

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        setIsLoading(true);
        const fetchedDestinations = await getFeaturedDestinations();
        if (fetchedDestinations && fetchedDestinations.length > 0) {
          setDestinations(fetchedDestinations);
        } else {
          setDestinations([]);
        }
      } catch (err) {
        console.error("Failed to load featured destinations:", err);
        setError("Could not load trending destinations at the moment.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDestinations();
  }, []);

  const openModal = (destination: FeaturedDestination) => {
    setSelectedDestination(destination);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDestination(null);
  };

  const primaryColor = config?.[mode]?.primary;

  if (isLoading) {
    return <FeaturedDestinationsSkeleton />;
  }

  if (error || destinations.length === 0) {
    return null;
  }

  return (
    <>
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ color: primaryColor }}
            >
              Featured Destinations
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Top Trending Places to Visit Now
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {destinations.map((destination) => (
              <Card
                key={destination.id}
                className="flex flex-col overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 group"
              >
                <Link
                  href={destination.link || "#"}
                  className="block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="relative h-64 w-full">
                    <Image
                      src={destination.imageUrl || "/placeholder.jpg"}
                      alt={destination.title}
                      layout="fill"
                      objectFit="cover"
                      className="group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                <CardContent className="p-6 bg-white dark:bg-gray-800 flex flex-col flex-grow">
                  <h3
                    className="text-xl font-semibold mb-2"
                    style={{ color: primaryColor }}
                  >
                    {destination.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-base flex-grow">
                    {destination.description.length >
                    DESCRIPTION_TRUNCATE_LENGTH
                      ? `${destination.description.substring(
                          0,
                          DESCRIPTION_TRUNCATE_LENGTH
                        )}...`
                      : destination.description}
                  </p>
                  {destination.description.length >
                    DESCRIPTION_TRUNCATE_LENGTH && (
                    <Button
                      variant="link"
                      className="px-0 mt-2 self-start"
                      onClick={() => openModal(destination)}
                    >
                      View More
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <DestinationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        destination={selectedDestination}
      />
    </>
  );
}

// Skeleton component for loading state
const FeaturedDestinationsSkeleton = () => {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-3/5 mx-auto" />
          <Skeleton className="h-6 w-2/5 mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden rounded-2xl shadow-lg">
              <Skeleton className="h-64 w-full" />
              <CardContent className="p-6">
                <Skeleton className="h-6 w-4/5 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
