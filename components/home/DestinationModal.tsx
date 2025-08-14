"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import { FeaturedDestination } from "@/lib/firebase/config-service";
import { Button } from "@/components/ui/button";

interface DestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: FeaturedDestination | null;
}

export default function DestinationModal({
  isOpen,
  onClose,
  destination,
}: DestinationModalProps) {
  if (!destination) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{destination.title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="relative h-64 w-full mb-4 overflow-hidden rounded-lg">
            <Image
              src={destination.imageUrl || "/placeholder.jpg"}
              alt={destination.title}
              layout="fill"
              objectFit="cover"
            />
          </div>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-400">
            {destination.description}
          </DialogDescription>
        </div>
        {destination.link && (
          <div className="mt-6 flex justify-end">
            <Button asChild>
              <Link
                href={destination.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn More
              </Link>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
