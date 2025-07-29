"use client";

import { useState, useEffect } from "react";
import { MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TourPackage } from "@/lib/types";
import TourOperatorInfo from "./TourOperatorInfo";
import { logTourView, logTourBookingClick } from "@/lib/firebase/analytics";

interface TourCardProps {
  tour: TourPackage;
  viewMode: "grid" | "list";
}

export default function TourCard({ tour, viewMode }: TourCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Mock data for fields not in API response
  const difficulty = "Moderate";

  const originalDescription = tour.short_description || "";
  const plainTextDescription = originalDescription.replace(/<[^>]*>?/gm, "");
  const TRUNCATE_LENGTH = 100;
  const isLongDescription = plainTextDescription.length > TRUNCATE_LENGTH;

  const toggleExpansion = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const descriptionElement = tour.short_description && (
    <div className="prose prose-sm text-muted-foreground mb-4">
      {isExpanded ? (
        <div dangerouslySetInnerHTML={{ __html: originalDescription }} />
      ) : (
        <p>{`${plainTextDescription.substring(0, TRUNCATE_LENGTH)}${
          isLongDescription ? "..." : ""
        }`}</p>
      )}
      {isLongDescription && (
        <button
          onClick={toggleExpansion}
          className="text-orange-500 hover:underline font-bold mt-1 inline-block bg-transparent border-none p-0 cursor-pointer"
        >
          {isExpanded ? "View Less" : "View More"}
        </button>
      )}
    </div>
  );

  useEffect(() => {
    // Track tour view when component mounts
    logTourView(tour.id.toString(), tour.title);
  }, [tour.id, tour.title]);

  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-80 h-64 md:h-auto">
            <Link href={tourUrl}>
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url('${imageUrl}')` }}
              />
            </Link>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-4 left-4">
              <Badge className="bg-orange-500 text-white">{price}</Badge>
            </div>
          </div>
          <CardContent className="flex-1 p-6 flex flex-col">
            <div className="flex-grow">
              <div className="flex items-center mb-2">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-muted-foreground">
                    {tour.city}
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 hover:text-orange-500 transition-colors">
                <Link href={tourUrl}>{tour.title}</Link>
              </h3>
              {descriptionElement}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{difficulty}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <TourOperatorInfo agencyId={tour.agency_id} />
              </div>
              <div className="flex space-x-2">
                <Button
                  asChild
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => {
                    logTourBookingClick(
                      tour.id.toString(),
                      tour.title,
                      tour.display_price || undefined,
                      "tour_card_list"
                    );
                  }}
                >
                  <Link href={tourUrl}>Book Now</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col">
      <div className="relative">
        <Link href={tourUrl}>
          <div
            className="h-64 bg-cover bg-center"
            style={{ backgroundImage: `url('${imageUrl}')` }}
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-4 left-4">
          <Badge className="bg-orange-500 text-white">{price}</Badge>
        </div>
      </div>
      <CardContent className="p-6 flex flex-col flex-grow">
        <div className="flex-grow">
          <div className="flex items-center mb-2">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">{tour.city}</span>
            </div>
          </div>
          <h3 className="text-xl font-bold mb-3 group-hover:text-orange-500 transition-colors">
            <Link href={tourUrl}>{tour.title}</Link>
          </h3>
          {descriptionElement}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TourOperatorInfo agencyId={tour.agency_id} />
          </div>
          <div className="flex space-x-2">
            <Button
              asChild
              size="sm"
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => {
                logTourBookingClick(
                  tour.id.toString(),
                  tour.title,
                  tour.display_price || undefined,
                  "tour_card_grid"
                );
              }}
            >
              <Link href={tourUrl}>Book Now</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
