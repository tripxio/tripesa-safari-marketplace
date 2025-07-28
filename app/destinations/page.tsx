"use client";

import { motion } from "framer-motion";
import { Map } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DestinationsPage() {
  return (
    <div className="min-h-screen pt-16 flex flex-col items-center justify-center bg-background safari-texture">
      <div className="container max-w-3xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="my-8"
          >
            <Map className="w-24 h-24 text-orange-400 mx-auto" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">Destinations</h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto">
            Our team is currently mapping out the most beautiful destinations
            across Africa. Check back soon to discover the wonders of Uganda,
            Tanzania, Kenya, and more!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg rounded-xl"
              >
                Return to Homepage
              </Button>
            </Link>

            <Link href="/tours">
              <Button
                size="lg"
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-500/10 px-8 py-3 text-lg rounded-xl"
              >
                Browse Available Tours
              </Button>
            </Link>
          </div>

          <motion.div
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="p-6 border border-orange-200 rounded-lg bg-orange-50/50">
              <h3 className="text-xl font-medium mb-2">Coming Soon</h3>
              <ul className="text-muted-foreground text-left space-y-2">
                <li>• Uganda</li>
                <li>• Kenya</li>
                <li>• Tanzania</li>
                <li>• Rwanda</li>
              </ul>
            </div>

            <div className="p-6 border border-orange-200 rounded-lg bg-orange-50/50">
              <h3 className="text-xl font-medium mb-2">Also Exploring</h3>
              <ul className="text-muted-foreground text-left space-y-2">
                <li>• Botswana</li>
                <li>• South Africa</li>
                <li>• Namibia</li>
                <li>• Zambia</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
