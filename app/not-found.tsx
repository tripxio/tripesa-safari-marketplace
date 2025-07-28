"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen pt-16 flex flex-col items-center justify-center bg-background safari-texture">
      <div className="container max-w-3xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-9xl font-bold text-orange-500">404</h1>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="my-8"
          >
            <Compass className="w-24 h-24 text-orange-400 mx-auto" />
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Safari Path Not Found
          </h2>

          <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto">
            Looks like you've ventured off the beaten track! This part of the
            safari is still being developed by our rangers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg rounded-xl"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Base Camp
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

          <motion.div
            className="mt-12 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <p>
              Looking for something specific? Try one of these popular
              destinations:
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              <Link href="/tours" className="text-orange-500 hover:underline">
                Safari Tours
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/" className="text-orange-500 hover:underline">
                Home
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/tours" className="text-orange-500 hover:underline">
                Uganda Adventures
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
