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
      setAnimationType("car");
    } else if (pathname.includes("/destinations")) {
      setAnimationType("bicycle");
    } else {
      // Use plane for home page and others
      setAnimationType("plane");
    }
  }, [pathname]);

  return (
    <TravelMotion
      type={animationType}
      position={pathname === "/" ? "bottom-right" : "top-right"}
      size={pathname === "/" ? "large" : "medium"}
    />
  );
}
