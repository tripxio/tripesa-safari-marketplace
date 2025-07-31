"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { TourPackage } from "@/lib/types";
import InquiryModal from "@/components/tours/InquiryModal";

interface TourDetailClientProps {
  tour: TourPackage;
}

export default function TourDetailClient({ tour }: TourDetailClientProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [imageLoadingStates, setImageLoadingStates] = useState<
    Record<number, boolean>
  >({});
  // const [isWishlisted, setIsWishlisted] = useState(false); // Commented out for future use

  const images =
    tour.gallery?.length > 0
      ? tour.gallery
      : tour.first_media
      ? [tour.first_media]
      : [];

  // Preload adjacent images for smooth navigation
  useEffect(() => {
    if (images.length <= 1) return;

    const preloadImage = (index: number) => {
      if (index >= 0 && index < images.length && !imageLoadingStates[index]) {
        const img = new window.Image();
        img.src = images[index].url;
        img.onload = () => {
          setImageLoadingStates((prev) => ({ ...prev, [index]: true }));
        };
      }
    };

    // Preload current, next, and previous images
    preloadImage(currentImageIndex);
    preloadImage(currentImageIndex + 1);
    preloadImage(currentImageIndex - 1);

    // Preload first few images on initial load
    if (currentImageIndex === 0) {
      for (let i = 0; i < Math.min(3, images.length); i++) {
        preloadImage(i);
      }
    }
  }, [currentImageIndex, images, imageLoadingStates]);

  const price = tour.display_price
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: tour.currency?.code || "USD",
        minimumFractionDigits: 0,
      }).format(parseFloat(tour.display_price))
    : "On Request";

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Lightbox navigation functions
  const openLightbox = (index: number) => {
    setLightboxImageIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = "unset"; // Restore scrolling
  };

  const nextLightboxImage = () => {
    setLightboxImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevLightboxImage = () => {
    setLightboxImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isLightboxOpen) return;

      switch (event.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          prevLightboxImage();
          break;
        case "ArrowRight":
          nextLightboxImage();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, images.length]);

  const handleBookNow = () => {
    // Add booking logic here
    console.log("Book Now clicked for tour:", tour.slug);
  };

  const handleInquire = () => {
    setIsInquiryModalOpen(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tour.title,
          text:
            tour.short_description ||
            tour.description?.replace(/<[^>]*>/g, "").substring(0, 100),
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Wishlist handler commented out for future use
  // const handleWishlist = () => {
  //   setIsWishlisted(!isWishlisted);
  //   // Add wishlist logic here
  // };

  // Generate agency slug from agency_id (temporary solution)
  const agencySlug = tour.agency_id
    ? `agency-${tour.agency_id}`
    : "default-agency";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Image Gallery */}
      <div className="relative h-[60vh] md:h-[70vh] bg-gray-900">
        {images.length > 0 && (
          <>
            {/* Loading skeleton */}
            {!imageLoadingStates[currentImageIndex] && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse">
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-400 dark:text-gray-500">
                    <svg
                      className="w-12 h-12 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            )}

            <Image
              src={images[currentImageIndex]?.url || "/fallback-image.jpg"}
              alt={images[currentImageIndex]?.name || tour.title}
              fill
              className={`object-cover transition-opacity duration-300 cursor-pointer ${
                imageLoadingStates[currentImageIndex]
                  ? "opacity-100"
                  : "opacity-0"
              }`}
              priority={currentImageIndex === 0}
              sizes="100vw"
              onLoad={() => {
                setImageLoadingStates((prev) => ({
                  ...prev,
                  [currentImageIndex]: true,
                }));
              }}
              onClick={() => openLightbox(currentImageIndex)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              </>
            )}

            {/* Image indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Tour Title and Actions Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-5 w-5 text-orange-400" />
                  <span className="text-white/90">{tour.city}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  {tour.title}
                </h1>
                <div className="flex items-center space-x-4 text-white/90">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{tour.experience_duration} days</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>Per {tour.unit?.name || "Person"}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleShare}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all"
                    aria-label="Share tour"
                  >
                    <Share2 className="h-5 w-5 text-white" />
                  </button>
                  {/* Wishlist button commented out for future use
                  <button
                    onClick={handleWishlist}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all"
                    aria-label="Add to wishlist"
                  >
                    <Heart className="h-5 w-5 text-white" />
                  </button>
                  */}
                </div>
                <div className="text-right">
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    {price}
                  </div>
                  <div className="text-white/90 text-sm">
                    per {tour.unit?.name?.toLowerCase() || "person"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tour Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                  <div className="font-semibold">
                    {tour.experience_duration} Days
                  </div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </CardContent>
              </Card>
              {/* Group Size card commented out - backend doesn't have this input yet
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                  <div className="font-semibold">Any Size</div>
                  <div className="text-sm text-muted-foreground">
                    Group Size
                  </div>
                </CardContent>
              </Card>
              */}
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                  <div className="font-semibold">Year Round</div>
                  <div className="text-sm text-muted-foreground">Available</div>
                </CardContent>
              </Card>
            </div>

            {/* Tour Details Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800 h-12">
                <TabsTrigger
                  value="overview"
                  className="text-gray-700 dark:text-gray-300 font-semibold data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="itinerary"
                  className="text-gray-700 dark:text-gray-300 font-semibold data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  Itinerary
                </TabsTrigger>
                <TabsTrigger
                  value="included"
                  className="text-gray-700 dark:text-gray-300 font-semibold data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  Included
                </TabsTrigger>
                <TabsTrigger
                  value="gallery"
                  className="text-gray-700 dark:text-gray-300 font-semibold data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  Gallery
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tour Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="prose prose-gray dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html:
                          tour.description ||
                          tour.short_description ||
                          "No description available.",
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Tour Tags */}
                {tour.package_tags && tour.package_tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tour Highlights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {tour.package_tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="itinerary" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Day by Day Itinerary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tour.itineraries && tour.itineraries.length > 0 ? (
                      <div className="space-y-6">
                        {tour.itineraries.map((itinerary, index) => (
                          <div
                            key={itinerary.id}
                            className="border-l-4 border-orange-500 dark:border-orange-400 pl-4 py-2"
                          >
                            <h4 className="font-semibold text-lg mb-2">
                              Day {index + 1}
                              {itinerary.title &&
                                itinerary.title !== itinerary.description && (
                                  <span className="text-orange-600 dark:text-orange-400 ml-2">
                                    - {itinerary.title}
                                  </span>
                                )}
                            </h4>
                            {itinerary.description ? (
                              <div
                                className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{
                                  __html: itinerary.description,
                                }}
                              />
                            ) : itinerary.title ? (
                              <div
                                className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{
                                  __html: itinerary.title,
                                }}
                              />
                            ) : itinerary.name ? (
                              <p className="text-muted-foreground dark:text-gray-400">
                                {itinerary.name}
                              </p>
                            ) : (
                              <p className="text-muted-foreground dark:text-gray-400 italic">
                                Detailed itinerary will be provided upon
                                booking.
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        Detailed itinerary will be provided upon booking.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="included" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>What's Included</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {tour.is_included ? (
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: tour.is_included }}
                        />
                      ) : (
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center space-x-2">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>Professional guide</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>Transportation</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>Park fees</span>
                          </li>
                        </ul>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <X className="h-5 w-5 text-red-500" />
                        <span>What's Not Included</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {tour.is_not_included ? (
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: tour.is_not_included,
                          }}
                        />
                      ) : (
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center space-x-2">
                            <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                            <span>International flights</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                            <span>Travel insurance</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                            <span>Personal expenses</span>
                          </li>
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="gallery" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Photo Gallery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {images.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((image, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                            onClick={() => openLightbox(index)}
                          >
                            {/* Loading skeleton for gallery images */}
                            {!imageLoadingStates[index] && (
                              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                                <div className="w-8 h-8 text-gray-400">
                                  <svg
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                              </div>
                            )}

                            <Image
                              src={image.url}
                              alt={image.name || `Gallery image ${index + 1}`}
                              fill
                              className={`object-cover group-hover:scale-105 transition-all duration-300 ${
                                imageLoadingStates[index]
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                              sizes="(max-width: 768px) 50vw, 33vw"
                              loading={index < 6 ? "eager" : "lazy"} // Load first 6 images eagerly
                              onLoad={() => {
                                setImageLoadingStates((prev) => ({
                                  ...prev,
                                  [index]: true,
                                }));
                              }}
                            />

                            {/* Current image indicator */}
                            {index === currentImageIndex && (
                              <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                Current
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground dark:text-gray-400">
                        No gallery images available.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {price}
                      </div>
                      <div className="text-muted-foreground">
                        per {tour.unit?.name?.toLowerCase() || "person"}
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Available
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Separator />

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleBookNow}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3"
                      size="lg"
                      disabled={tour.disable_booking}
                    >
                      {tour.disable_booking
                        ? "Booking Unavailable"
                        : "Book Now"}
                    </Button>

                    <Button
                      onClick={handleInquire}
                      variant="outline"
                      className="w-full border-orange-500 text-orange-500 hover:bg-orange-50 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-900/20 font-semibold py-3"
                      size="lg"
                    >
                      Send Inquiry
                    </Button>
                  </div>

                  <Separator />

                  {/* Tour Operator Info */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Tour Operator</h4>
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-orange-500" />
                      </div>
                      <div>
                        <div className="font-medium dark:text-white">
                          Safari Expert
                        </div>
                        <div className="text-sm text-muted-foreground dark:text-gray-400">
                          Verified Operator
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Safety & Policies */}
                  <div className="space-y-2 text-sm text-muted-foreground dark:text-gray-400">
                    <p>✓ Free cancellation up to 24 hours</p>
                    <p>✓ Secure payment processing</p>
                    <p>✓ 24/7 customer support</p>
                    <p>✓ Best price guarantee</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        tour={tour}
        agencySlug={agencySlug}
      />

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
            aria-label="Close lightbox"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 z-10 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
            {lightboxImageIndex + 1} / {images.length}
          </div>

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevLightboxImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextLightboxImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 transition-all"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Main image */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <div className="relative max-w-full max-h-full">
              <Image
                src={images[lightboxImageIndex]?.url || "/fallback-image.jpg"}
                alt={
                  images[lightboxImageIndex]?.name ||
                  `Gallery image ${lightboxImageIndex + 1}`
                }
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain"
                priority
              />
            </div>
          </div>

          {/* Image info */}
          {images[lightboxImageIndex]?.name && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg text-center max-w-md">
              <p className="text-sm">{images[lightboxImageIndex].name}</p>
            </div>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 max-w-screen-lg overflow-x-auto p-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setLightboxImageIndex(index)}
                  className={`relative w-16 h-16 flex-shrink-0 rounded overflow-hidden transition-all ${
                    index === lightboxImageIndex
                      ? "ring-2 ring-orange-500 opacity-100"
                      : "opacity-60 hover:opacity-80"
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image
                    src={image.url}
                    alt={image.name || `Thumbnail ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
