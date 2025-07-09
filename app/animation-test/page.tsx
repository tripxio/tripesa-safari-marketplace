"use client";

import { motion } from "framer-motion";

export default function AnimationTestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-10">Animation Test Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Test 1: Simple Box */}
        <div className="border p-10 rounded-lg">
          <h2 className="text-xl font-bold mb-5">Simple Box</h2>
          <motion.div
            className="w-20 h-20 bg-orange-500 rounded-md"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Test 2: Bouncing Ball */}
        <div className="border p-10 rounded-lg">
          <h2 className="text-xl font-bold mb-5">Bouncing Ball</h2>
          <motion.div
            className="w-20 h-20 bg-blue-500 rounded-full"
            animate={{ y: [0, -50, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Test 3: Growing Circle */}
        <div className="border p-10 rounded-lg">
          <h2 className="text-xl font-bold mb-5">Growing Circle</h2>
          <motion.div
            className="w-20 h-20 bg-green-500 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>

      <div className="mt-10">
        <p className="text-gray-600">
          If you can see the animations above, Framer Motion is working
          correctly. Check the browser console for any errors.
        </p>
      </div>
    </div>
  );
}
