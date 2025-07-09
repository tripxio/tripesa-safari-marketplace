"use client";

import { useState, useEffect } from "react";
import { Search, Mic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AISearchInterface from "./AISearchInterface";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAISearch, setShowAISearch] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const backgroundImages = [
    "https://ik.imagekit.io/54hg3nvcfg/zdenek-machacek-UxHol6SwLyM-unsplash.jpg?updatedAt=1752094873385",
    "https://ik.imagekit.io/54hg3nvcfg/redcharlie-xtvo0ffGKlI-unsplash.jpg?updatedAt=1752094873358",
    "https://ik.imagekit.io/54hg3nvcfg/max-christian-sMjVNtvYkD0-unsplash.jpg?updatedAt=1752095287325",
    "https://ik.imagekit.io/54hg3nvcfg/photos-by-beks-B3fLaAAy6nU-unsplash.jpg?updatedAt=1752095287350",
    "https://ik.imagekit.io/54hg3nvcfg/deon-de-villiers-7HRHhcueqZ8-unsplash.jpg?updatedAt=1752095287743",
    "https://ik.imagekit.io/54hg3nvcfg/sutirta-budiman-PdiOj8kRy28-unsplash.jpg?updatedAt=1752095287980",
    "https://ik.imagekit.io/54hg3nvcfg/clinton-mwebaze-bFDRtkC9Hmw-unsplash.jpg?updatedAt=1752095582636",
    "https://ik.imagekit.io/54hg3nvcfg/nathan-cima-k3iU3W5QkBQ-unsplash.jpg?updatedAt=1752095583994",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      // Get a random index different from the current one
      const getRandomIndex = () => {
        if (backgroundImages.length <= 1) return 0;

        const randomIndex = Math.floor(Math.random() * backgroundImages.length);
        // Make sure we don't show the same image twice in a row
        return randomIndex !== currentImageIndex
          ? randomIndex
          : (randomIndex + 1) % backgroundImages.length;
      };

      setCurrentImageIndex(getRandomIndex());
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [currentImageIndex, backgroundImages.length]);

  const quickSuggestions = [
    "Best gorilla trekking",
    "Luxury safari packages",
    "Budget-friendly tours",
    "Tanzania wildlife",
    "Uganda adventures",
  ];

  return (
    <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Images */}
      {backgroundImages.map((image, index) => (
        <div
          key={index}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
          style={{
            backgroundImage: `url('${image}')`,
            opacity: currentImageIndex === index ? 1 : 0,
          }}
        />
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Discover Africa's
          <span className="block text-orange-400">Greatest Adventures</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto">
          AI-powered safari discovery that connects you to unforgettable
          experiences across the African continent
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
          {quickSuggestions.map((suggestion, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-white/20 text-white hover:bg-white/30 cursor-pointer px-4 py-2 text-sm transition-all duration-200 hover:scale-105"
              onClick={() => {
                setSearchQuery(suggestion);
                setShowAISearch(true);
              }}
            >
              {suggestion}
            </Badge>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg rounded-xl"
          >
            Explore Tours
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg rounded-xl bg-transparent"
          >
            Watch Video
          </Button>
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
