"use client";

import { motion } from "framer-motion";
import { Phone, Mail, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
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
            <Mail className="w-24 h-24 text-orange-400 mx-auto" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto">
            Our contact form is coming soon! In the meantime, you can reach us
            at:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
            <div className="flex flex-col items-center p-6 border border-orange-200 rounded-lg bg-orange-50/50">
              <Phone className="h-10 w-10 text-orange-500 mb-3" />
              <h3 className="font-medium mb-1">Phone</h3>
              <p className="text-muted-foreground">+256 200 948 137</p>
              <p className="text-muted-foreground">+254 702 024627</p>
            </div>

            <div className="flex flex-col items-center p-6 border border-orange-200 rounded-lg bg-orange-50/50">
              <Mail className="h-10 w-10 text-orange-500 mb-3" />
              <h3 className="font-medium mb-1">Email</h3>
              <p className="text-muted-foreground">hello@tripesa.co</p>
            </div>

            <div className="flex flex-col items-center p-6 border border-orange-200 rounded-lg bg-orange-50/50">
              <Clock className="h-10 w-10 text-orange-500 mb-3" />
              <h3 className="font-medium mb-1">Working Hours</h3>
              <p className="text-muted-foreground">Mon-Fri: 9AM - 5PM</p>
              <p className="text-muted-foreground">Weekend: 10AM - 2PM</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg rounded-xl"
              >
                Return to Homepage
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
