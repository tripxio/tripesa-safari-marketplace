"use client";

import { motion } from "framer-motion";

export default function AnimationTest() {
  return (
    <motion.div
      className="fixed bottom-4 right-4 w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center z-50"
      initial={{ scale: 0 }}
      animate={{
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 260,
          damping: 20,
        },
      }}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
    >
      <span className="text-white font-bold">Animate!</span>
    </motion.div>
  );
}
