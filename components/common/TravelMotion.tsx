"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Plane, Car, Bike } from "lucide-react";
import { useEffect, useState } from "react";

type AnimationType = "plane" | "car" | "bicycle";

interface TravelMotionProps {
  type?: AnimationType;
  size?: "small" | "medium" | "large";
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export default function TravelMotion({
  type = "plane",
  size = "medium",
  position = "bottom-right",
}: TravelMotionProps) {
  const pathname = usePathname();
  const [key, setKey] = useState(0);

  // Reset animation when path changes
  useEffect(() => {
    setKey((prev) => prev + 1);
  }, [pathname]);

  // Get size class
  const getSizeClass = () => {
    switch (size) {
      case "small":
        return "w-8 h-8";
      case "large":
        return "w-24 h-24"; // Much larger
      case "medium":
      default:
        return "w-16 h-16"; // Larger
    }
  };

  // Get position class
  const getPositionClass = () => {
    switch (position) {
      case "top-left":
        return "top-20 left-20";
      case "top-right":
        return "top-20 right-20";
      case "bottom-left":
        return "bottom-20 left-20";
      case "bottom-right":
      default:
        return "bottom-20 right-20";
    }
  };

  // Get icon and animation based on type
  const getIconAndAnimation = () => {
    switch (type) {
      case "plane":
        return (
          <motion.div
            className="bg-orange-500/20 p-4 rounded-full"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 15, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Plane className={`${getSizeClass()} text-orange-500`} />
          </motion.div>
        );
      case "car":
        return (
          <motion.div
            className="bg-orange-500/20 p-4 rounded-full"
            animate={{
              x: [-50, 50, -50],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Car className={`${getSizeClass()} text-orange-500`} />
          </motion.div>
        );
      case "bicycle":
        return (
          <motion.div
            className="bg-orange-500/20 p-4 rounded-full"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Bike className={`${getSizeClass()} text-orange-500`} />
          </motion.div>
        );
    }
  };

  return (
    <div key={key} className={`fixed z-50 ${getPositionClass()}`}>
      {getIconAndAnimation()}
    </div>
  );
}
