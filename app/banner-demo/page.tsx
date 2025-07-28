"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBannerConfig, BannerConfig } from "@/lib/firebase/config-service";
import { useState, useEffect } from "react";
import { Image, Type, Settings, Eye, Globe, Upload } from "lucide-react";

export default function BannerDemoPage() {
  const [bannerConfig, setBannerConfig] = useState<BannerConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadBannerConfig = async () => {
      try {
        setIsLoading(true);
        const config = await getBannerConfig();
        setBannerConfig(config);
      } catch (error) {
        console.error("Error loading banner config:", error);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading banner configuration...
          </p>
        </div>
      </div>
    );
  }

  const images = bannerConfig?.images || [];
  const text = bannerConfig?.text || {
    mainTitle: "Discover Africa's",
    subtitle: "Greatest Adventures",
    description:
      "AI-powered safari discovery that connects you to unforgettable experiences across the African continent",
  };
  const settings = bannerConfig?.settings || {
    transitionDuration: 5,
    autoplay: true,
    autoplayInterval: 5,
    showIndicators: true,
    showArrows: true,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Banner Management System Demo
          </h1>
          <p className="text-lg text-muted-foreground">
            Showcasing the comprehensive banner management system with dynamic
            content and settings
          </p>
        </div>

        {/* Live Banner Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Live Banner Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-96 bg-gray-900 rounded-lg overflow-hidden">
              {images.length > 0 && (
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
                  style={{
                    backgroundImage: `url('${images[currentImageIndex].url}')`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h2 className="text-3xl font-bold mb-4">
                        {text.mainTitle} {text.subtitle}
                      </h2>
                      <p className="text-xl max-w-2xl mx-auto">
                        {text.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="h-5 w-5 mr-2" />
                Images ({images.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {images.slice(0, 3).map((image, index) => (
                  <div key={image.id} className="flex items-center space-x-2">
                    <div
                      className="w-8 h-8 rounded bg-cover bg-center"
                      style={{ backgroundImage: `url('${image.url}')` }}
                    />
                    <span className="text-sm truncate">{image.alt}</span>
                    {image.isUploaded && (
                      <Badge variant="secondary" className="text-xs">
                        Uploaded
                      </Badge>
                    )}
                  </div>
                ))}
                {images.length > 3 && (
                  <p className="text-sm text-muted-foreground">
                    +{images.length - 3} more images
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Text Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Type className="h-5 w-5 mr-2" />
                Text Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Main Title</p>
                  <p className="text-sm text-muted-foreground">
                    {text.mainTitle}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Subtitle</p>
                  <p className="text-sm text-muted-foreground">
                    {text.subtitle}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {text.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Autoplay</span>
                  <Badge variant={settings.autoplay ? "default" : "secondary"}>
                    {settings.autoplay ? "On" : "Off"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Interval</span>
                  <span className="text-sm">{settings.autoplayInterval}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Transition</span>
                  <span className="text-sm">
                    {settings.transitionDuration}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Indicators</span>
                  <Badge
                    variant={settings.showIndicators ? "default" : "secondary"}
                  >
                    {settings.showIndicators ? "On" : "Off"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Arrows</span>
                  <Badge
                    variant={settings.showArrows ? "default" : "secondary"}
                  >
                    {settings.showArrows ? "On" : "Off"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Banner System Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Image Management
                </h3>
                <p className="text-sm text-muted-foreground">
                  Upload images to Firebase Storage or add external image links
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold flex items-center">
                  <Type className="h-4 w-4 mr-2" />
                  Dynamic Text
                </h3>
                <p className="text-sm text-muted-foreground">
                  Customize main title, subtitle, and description content
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Advanced Settings
                </h3>
                <p className="text-sm text-muted-foreground">
                  Control autoplay, transition duration, indicators, and arrows
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  External Links
                </h3>
                <p className="text-sm text-muted-foreground">
                  Support for both uploaded images and external image URLs
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Live Preview
                </h3>
                <p className="text-sm text-muted-foreground">
                  Real-time preview of banner changes before saving
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold flex items-center">
                  <Badge className="h-4 w-4 mr-2" />
                  Version Control
                </h3>
                <p className="text-sm text-muted-foreground">
                  Complete version history with rollback capabilities
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Access */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              To manage banners, access the admin dashboard:
            </p>
            <Button asChild>
              <a href="/admin/banner">Go to Banner Manager</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
