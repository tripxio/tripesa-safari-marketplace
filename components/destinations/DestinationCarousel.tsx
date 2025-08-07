"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@/components/ui/carousel";
import { Destination, DestinationTile } from "./DestinationTile";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { motion } from "framer-motion";

interface DestinationCarouselProps {
  title: string;
  destinations: Destination[];
  isAvailable: boolean;
  useAutoplay?: boolean;
}

function ConditionalCarouselPrevious() {
  const { canScrollPrev } = useCarousel();
  if (!canScrollPrev) {
    return null;
  }
  return <CarouselPrevious className="left-[-50px] hidden md:flex" />;
}

function ConditionalCarouselNext() {
  const { canScrollNext } = useCarousel();
  if (!canScrollNext) {
    return null;
  }
  return <CarouselNext className="right-[-50px] hidden md:flex" />;
}

export function DestinationCarousel({
  title,
  destinations,
  isAvailable,
  useAutoplay = false,
}: DestinationCarouselProps) {
  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="mb-16 relative"
    >
      <h2 className="mb-8 text-center text-3xl font-bold">{title}</h2>
      <Carousel
        plugins={useAutoplay ? [plugin.current] : []}
        onMouseEnter={useAutoplay ? plugin.current.stop : undefined}
        onMouseLeave={useAutoplay ? plugin.current.reset : undefined}
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {destinations.map((destination, index) => (
            <CarouselItem
              key={index}
              className="basis-full pl-2 sm:basis-1/2 md:pl-4 lg:basis-1/3 xl:basis-1/4"
            >
              <DestinationTile
                destination={destination}
                isAvailable={isAvailable}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <ConditionalCarouselPrevious />
        <ConditionalCarouselNext />
      </Carousel>
    </motion.section>
  );
}
