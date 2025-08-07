"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { DestinationCarousel } from "@/components/destinations/DestinationCarousel";
import { Destination } from "@/components/destinations/DestinationTile";

const topDestinations: Destination[] = [
  {
    name: "Uganda",
    country: "Uganda",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/keith-kasaija-wrM9TOVDSrs-unsplash.jpg?updatedAt=1754337056510",
    filterValue: "Uganda",
  },
  {
    name: "Kenya",
    country: "Kenya",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/sergey-pesterev-DWXR-nAbxCk-unsplash.jpg?updatedAt=1754337054962",
    filterValue: "Kenya",
  },
  {
    name: "Tanzania",
    country: "Tanzania",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/hendrik-cornelissen-qs4E9t0hJc0-unsplash.jpg?updatedAt=1754337055680",
    filterValue: "Tanzania",
  },
  {
    name: "Rwanda",
    country: "Rwanda",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/reagan-m-d-eWGvLCZfQ-unsplash.jpg?updatedAt=1754337057512",
    filterValue: "Rwanda",
  },
];

const comingSoonDestinations: Destination[] = [
  {
    name: "Botswana",
    country: "Botswana",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/wynand-uys-4ZCA3xukIso-unsplash%20(1).jpg?updatedAt=1754337416507",
    filterValue: "Botswana",
  },
  {
    name: "South Africa",
    country: "South Africa",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/lina-loos-04-C1NZk1hE-unsplash.jpg?updatedAt=1754337558469",
    filterValue: "South Africa",
  },
  {
    name: "Ethiopia",
    country: "Ethiopia",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/erik-hathaway-eRFC0_U0hGE-unsplash.jpg",
    filterValue: "Ethiopia",
  },
  {
    name: "Namibia",
    country: "Namibia",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/sergi-ferrete-pWshkmAH4qA-unsplash.jpg",
    filterValue: "Namibia",
  },
  {
    name: "Zambia",
    country: "Zambia",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/henning-borgersen-aTAcckKiphI-unsplash.jpg",
    filterValue: "Zambia",
  },
  {
    name: "Zimbabwe",
    country: "Zimbabwe",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/tanner-marquis-xsypL99HP3Q-unsplash.jpg",
    filterValue: "Zimbabwe",
  },
  {
    name: "Malawi",
    country: "Malawi",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/maria-zardoya-f8Vkuc6fXQA-unsplash.jpg",
    filterValue: "Malawi",
  },
  {
    name: "Mozambique",
    country: "Mozambique",
    imageUrl:
      "https://ik.imagekit.io/54hg3nvcfg/destinations/redcharlie-aexdWGJu7Gs-unsplash.jpg",
    filterValue: "Mozambique",
  },
];

export default function DestinationsPage() {
  return (
    <div className="min-h-screen bg-background safari-texture pt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Explore Africa
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
            Discover the most stunning destinations across Africa. From wildlife
            safaris to cultural experiences, find your perfect adventure.
          </p>
        </motion.div>

        <DestinationCarousel
          title="Top Destinations"
          destinations={topDestinations}
          isAvailable={true}
          useAutoplay={true}
        />

        <DestinationCarousel
          title="Coming Soon"
          destinations={comingSoonDestinations}
          isAvailable={false}
        />

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="rounded-2xl bg-orange-50 p-8 text-center dark:bg-orange-950/20"
        >
          <h3 className="mb-4 text-2xl font-bold">
            Ready to Start Your Adventure?
          </h3>
          <p className="mb-6 text-muted-foreground">
            Browse all available tours or get in touch with our experts to plan
            your perfect safari experience.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/tours"
              className="rounded-xl bg-orange-500 px-8 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
            >
              Browse All Tours
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-orange-500 px-8 py-3 font-semibold text-orange-500 transition-colors hover:bg-orange-500/10"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
