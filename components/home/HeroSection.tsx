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
  const [error, setError] = useState<string | null>(null);

  // Load banner configuration
  useEffect(() => {
    const loadBannerConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const config = await getBannerConfig();

        if (!config) {
          throw new Error("No banner configuration found");
        }

        setBannerConfig(config);
      } catch (error) {
        console.error("Error loading banner config:", error);
        setError("Failed to load banner configuration");
      } finally {
        setIsLoading(false);
      }
    };

    loadBannerConfig();
  }, []);

  // Image rotation effect
  useEffect(() => {
    if (!bannerConfig?.images || bannerConfig.images.length === 0) return;
    if (!bannerConfig.settings?.autoplay) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % bannerConfig.images.length
      );
    }, (bannerConfig.settings?.autoplayInterval || 5) * 1000);

    return () => clearInterval(interval);
  }, [
    bannerConfig?.images,
    bannerConfig?.settings?.autoplay,
    bannerConfig?.settings?.autoplayInterval,
  ]);

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

  // Show loading state
  if (isLoading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </section>
    );
  }

  // Show error state
  if (error || !bannerConfig) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-r from-red-500 to-red-600">
        <div className="text-center text-white max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4">Unable to Load Banner</h1>
          <p className="mb-4">{error || "Banner configuration not found"}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-white text-red-600 hover:bg-gray-100"
          >
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  // Validate banner data
  const images = bannerConfig.images?.filter((img) => img.url) || [];
  const mainTitle = bannerConfig.text?.mainTitle || "";
  const subtitle = bannerConfig.text?.subtitle || "";
  const description = bannerConfig.text?.description || "";

  if (images.length === 0) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="text-center text-white max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4">No Banner Images</h1>
          <p className="mb-4">
            Please configure banner images in the admin panel
          </p>
          <Link href="/admin/banner">
            <Button className="bg-white text-orange-600 hover:bg-gray-100">
              Configure Banner
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images */}
      {images.map((image, index) => (
        <div
          key={`bg-image-${image.id || index}`}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
          style={{
            backgroundImage: `url('${image.url}')`,
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
          {subtitle && (
            <span className="block text-orange-400">{subtitle}</span>
          )}
        </h1>

        {description && (
          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto">
            {description}
          </p>
        )}

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
                onKeyPress={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    setShowAISearch(true);
                  }
                }}
                onFocus={() => setShowAISearch(true)}
              />
              <Button size="icon" variant="ghost" className="mr-2">
                <Mic className="h-5 w-5 text-gray-500" />
              </Button>
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 rounded-xl"
                onClick={() => {
                  setShowAISearch(true);
                  logButtonClick("ai_search", "hero_section");
                }}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Ask AI
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

        {/* CTA Button */}
        <div className="flex justify-center">
          <Link href="/tours">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-4 text-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold"
              onClick={() => logButtonClick("Explore Tours", "hero_section")}
            >
              <MapPin className="h-6 w-6 mr-3" />
              Explore Tours
            </Button>
          </Link>
        </div>
      </div>

      {/* AI Search Modal */}
      {showAISearch && (
        <AISearchInterface
          query={searchQuery}
          onClose={() => {
            setShowAISearch(false);
            setSearchQuery("");
          }}
        />
      )}
    </section>
  );
}
