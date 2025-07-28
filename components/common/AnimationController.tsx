"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import TravelMotion from "./TravelMotion";

export default function AnimationController() {
  const pathname = usePathname();
  const [animationType, setAnimationType] = useState<
    "plane" | "car" | "bicycle"
  >("plane");

  // Change animation type based on the current path
  useEffect(() => {
    // Set specific animations for specific pages
    if (pathname.includes("/tours")) {
      // setAnimationType("car"); // Car animation commented out for tours
      setAnimationType("plane"); // Using plane animation instead
    } else if (pathname.includes("/destinations")) {
      setAnimationType("bicycle");
    } else {
      // Use plane for home page and others
      setAnimationType("plane");
    }
  }, [pathname]);

  // Don't render any animation on tours page or admin pages
  if (pathname.includes("/tours") || pathname.includes("/admin")) {
    return null;
  }

  return (
    <TravelMotion
      type={animationType}
      position={pathname === "/" ? "bottom-right" : "top-right"}
      size={pathname === "/" ? "large" : "medium"}
    />
  );
}
