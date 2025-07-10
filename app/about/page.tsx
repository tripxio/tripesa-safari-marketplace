"use client";

import { motion } from "framer-motion";
import { Construction } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
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
            <Construction className="w-24 h-24 text-orange-400 mx-auto" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">About Us</h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto">
            This page is currently under construction. Our team of safari
            experts is working hard to bring you amazing content about who we
            are and our mission.
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
                Explore Tours
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
