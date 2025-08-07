"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import Link from "next/link";

export interface Destination {
  name: string;
  country: string;
  imageUrl: string;
  filterValue: string;
}

interface DestinationTileProps {
  destination: Destination;
  isAvailable: boolean;
}

export function DestinationTile({
  destination,
  isAvailable,
}: DestinationTileProps) {
  const content = (
    <Card
      className={`group relative h-48 overflow-hidden transition-all duration-300 hover:shadow-xl ${
        isAvailable ? "cursor-pointer hover:-translate-y-2" : "opacity-75"
      }`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-110"
        style={{ backgroundImage: `url('${destination.imageUrl}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {!isAvailable && (
        <div className="absolute right-2 top-2">
          <div className="rounded-full bg-orange-500/95 px-2 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
            Coming Soon
          </div>
        </div>
      )}

      <CardContent className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <div className="mb-1 flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span className="text-sm font-medium">{destination.country}</span>
        </div>
        <h3 className="text-lg font-bold">{destination.name}</h3>
        {isAvailable && (
          <p className="mt-1 text-xs text-white/80 transition-colors group-hover:text-white">
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
