"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Mic, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AISearchInterface from "./AISearchInterface";
import { logButtonClick } from "@/lib/firebase/analytics";
import { getBannerConfig, BannerConfig } from "@/lib/firebase/config-service";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAISearch, setShowAISearch] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bannerConfig, setBannerConfig] = useState<BannerConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load banner configuration
  useEffect(() => {
    const loadBannerConfig = async () => {
      try {
        setIsLoading(true);
        const config = await getBannerConfig();
        setBannerConfig(config);
      } catch (error) {
        console.error("Error loading banner config:", error);
        // Fallback to default values if loading fails
      } finally {
        setIsLoading(false);
      }
    };

    loadBannerConfig();
  }, []);

  // Image rotation effect
  useEffect(() => {
    if (!bannerConfig?.images || bannerConfig.images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % bannerConfig.images.length
      );
    }, (bannerConfig.settings?.autoplayInterval || 5) * 1000);

    return () => clearInterval(interval);
  }, [bannerConfig?.images, bannerConfig?.settings?.autoplayInterval]);

  const quickSuggestions = [
    { id: "gorilla", text: "Best gorilla trekking" },
    { id: "luxury", text: "Luxury safari packages" },
    { id: "budget", text: "Budget-friendly tours" },
    { id: "tanzania", text: "Tanzania wildlife" },
    { id: "uganda", text: "Uganda adventures" },
  ];

  const handleSuggestionClick = useCallback((text: string) => {
    setSearchQuery(text);
    setShowAISearch(true);
  }, []);

  // Fallback values if config is not loaded
  const images = bannerConfig?.images || [
    "https://ik.imagekit.io/54hg3nvcfg/zdenek-machacek-UxHol6SwLyM-unsplash.jpg?updatedAt=1752094873385",
    "https://ik.imagekit.io/54hg3nvcfg/redcharlie-xtvo0ffGKlI-unsplash.jpg?updatedAt=1752094873358",
  ];

  const mainTitle = bannerConfig?.text?.mainTitle || "Discover Africa's";
  const subtitle = bannerConfig?.text?.subtitle || "Greatest Adventures";
  const description =
    bannerConfig?.text?.description ||
    "AI-powered safari discovery that connects you to unforgettable experiences across the African continent";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images */}
      {images.map((image, index) => (
        <div
          key={`bg-image-${index}`}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
          style={{
            backgroundImage: `url('${
              typeof image === "string" ? image : image.url
            }')`,
            opacity: currentImageIndex === index ? 1 : 0,
          }}
        />
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 pt-16">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          {mainTitle}
          <span className="block text-orange-400">{subtitle}</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto">
          {description}
        </p>

        {/* AI Search Interface */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <div className="flex items-center bg-white/95 backdrop-blur rounded-2xl p-2 shadow-2xl">
              <Sparkles className="h-6 w-6 text-orange-500 ml-4 mr-3" />
              <Input
                placeholder="Ask me anything about safaris, tours, or destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-none bg-transparent text-lg placeholder:text-gray-500 focus-visible:ring-0"
                onFocus={() => setShowAISearch(true)}
              />
              <Button size="icon" variant="ghost" className="mr-2">
                <Mic className="h-5 w-5 text-gray-500" />
              </Button>
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 rounded-xl"
                onClick={() => setShowAISearch(true)}
              >
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Suggestions */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {quickSuggestions.map((suggestion) => (
            <Badge
              key={suggestion.id}
              variant="secondary"
              className="bg-white/20 text-white hover:bg-white/30 cursor-pointer px-4 py-2 text-sm transition-all duration-200 hover:scale-105"
              onClick={() => handleSuggestionClick(suggestion.text)}
            >
              {suggestion.text}
            </Badge>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/tours">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg rounded-xl"
              onClick={() => logButtonClick("Explore Tours", "hero_section")}
            >
              Explore Tours
            </Button>
          </Link>
          <Link href="/tours?category=day-trips">
            <Button
              size="lg"
              className="bg-white/20 backdrop-blur text-white hover:bg-white/30 border border-white/30 px-8 py-3 text-lg rounded-xl"
              onClick={() =>
                logButtonClick("Explore Day Trips", "hero_section")
              }
            >
              Explore Day Trips
            </Button>
          </Link>
          <Link href="/tours?category=special-offers">
            <Button
              size="lg"
              className="bg-white/20 backdrop-blur text-white hover:bg-white/30 border border-white/30 px-8 py-3 text-lg rounded-xl"
              onClick={() =>
                logButtonClick("Explore Special Offers", "hero_section")
              }
            >
              Explore Special Offers
            </Button>
          </Link>
        </div>
      </div>

      {/* AI Search Modal */}
      {showAISearch && (
        <AISearchInterface
          query={searchQuery}
          onClose={() => setShowAISearch(false)}
        />
      )}
    </section>
  );
}
