"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
// import TravelMotion from "./TravelMotion";

export default function AnimationController() {
  const pathname = usePathname();

  // Define on which pages the animations should be shown
  const isHomePage = pathname === "/";
  const isToursPage = pathname.startsWith("/tours");
  const isDestinationsPage = pathname.startsWith("/destinations");

  // A simple function to decide if animations should be shown on the current page
  const showAnimations = () => {
    return isHomePage || isToursPage || isDestinationsPage;
  };

  if (!showAnimations()) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      {/* The TravelMotion component is now removed to disable the animation */}
      {/* <TravelMotion
        type={isHomePage ? "plane" : isToursPage ? "car" : "bicycle"}
        position={
          isHomePage
            ? "bottom-right"
            : isToursPage
            ? "bottom-left"
            : "top-right"
        }
      /> */}
    </Suspense>
  );
}
