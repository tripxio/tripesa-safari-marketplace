"use client";

import { useState, useEffect } from "react";
import { MapPin, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TourPackage } from "@/lib/types";
import TourOperatorInfo from "./TourOperatorInfo";
import { logTourView, logTourBookingClick } from "@/lib/firebase/analytics";

interface TourCardProps {
  tour: TourPackage;
  viewMode: "grid" | "list";
}

export default function TourCard({ tour, viewMode }: TourCardProps) {
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const imageUrl =
    tour.first_media?.url ||
    "https://placehold.co/600x400?text=No+Image+Available";
  const price = tour.display_price
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: tour.currency?.code || "USD",
        minimumFractionDigits: 0,
      }).format(parseFloat(tour.display_price))
    : "On Request";
  const tourUrl = `/tours/${tour.slug}`;

  const originalDescription = tour.short_description || "";
  const plainTextDescription = originalDescription.replace(/<[^>]*>?/gm, "");
  const TRUNCATE_LENGTH = 100;
  const isLongDescription = plainTextDescription.length > TRUNCATE_LENGTH;

  const openDescriptionModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDescriptionModalOpen(true);
  };

  const handleViewDetails = async () => {
    setIsNavigating(true);

    // Log the booking click
    logTourBookingClick(
      tour.id.toString(),
      tour.title,
      tour.display_price || undefined,
      viewMode === "grid" ? "tour_card_grid" : "tour_card_list"
    );

    // Navigate to tour details
    router.push(tourUrl);
  };

  const descriptionElement = tour.short_description && (
    <div className="prose prose-sm text-muted-foreground mb-4">
      <p>{`${plainTextDescription.substring(0, TRUNCATE_LENGTH)}${
        isLongDescription ? "..." : ""
      }`}</p>
      {isLongDescription && (
        <button
          onClick={openDescriptionModal}
          className="text-orange-500 hover:underline font-bold mt-1 inline-block bg-transparent border-none p-0 cursor-pointer"
        >
          View More
        </button>
      )}
    </div>
  );

  useEffect(() => {
    // Track tour view when component mounts
    logTourView(tour.id.toString(), tour.title);
  }, [tour.id, tour.title]);

  // Description Modal - renders for both grid and list views
  return (
    <>
      {viewMode === "list" ? (
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="flex flex-col md:flex-row">
            <div className="relative md:w-80 h-64 md:h-auto">
              <Link href={tourUrl}>
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${imageUrl}')` }}
                />
              </Link>
            </div>
            <CardContent className="flex-1 p-6">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Link href={tourUrl}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-orange-500 transition-colors mb-2">
                          {tour.title}
                        </h3>
                      </Link>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{tour.city}</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {price}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        per {tour.unit?.name?.toLowerCase() || "person"}
                      </div>
                    </div>
                  </div>

                  {descriptionElement}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {/* Commented out tags until they become global variables
                    {tour.package_tags &&
                      tour.package_tags.length > 0 &&
                      tour.package_tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                        >
                          {tag}
                        </Badge>
                      ))}
                    */}
                    {tour.featured && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <TourOperatorInfo agencyId={tour.agency_id} />
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={handleViewDetails}
                    disabled={isNavigating}
                  >
                    {isNavigating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "View Details"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      ) : (
        <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col">
          <div className="relative">
            <Link href={tourUrl}>
              <div
                className="h-64 bg-cover bg-center"
                style={{ backgroundImage: `url('${imageUrl}')` }}
              />
            </Link>
          </div>

          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Link href={tourUrl}>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white hover:text-orange-500 transition-colors mb-2">
                      {tour.title}
                    </h3>
                  </Link>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{tour.city}</span>
                  </div>
                </div>
              </div>

              {descriptionElement}

              <div className="flex flex-wrap gap-2 mb-4">
                {/* Commented out tags until they become global variables
                {tour.package_tags &&
                  tour.package_tags.length > 0 &&
                  tour.package_tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                */}
                {tour.featured && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    Featured
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {price}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  per {tour.unit?.name?.toLowerCase() || "person"}
                </div>
              </div>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleViewDetails}
                disabled={isNavigating}
              >
                {isNavigating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "View Details"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description Modal */}
      <Dialog
        open={isDescriptionModalOpen}
        onOpenChange={setIsDescriptionModalOpen}
      >
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{tour.title}</DialogTitle>
            <DialogDescription>Complete tour description</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: originalDescription }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
