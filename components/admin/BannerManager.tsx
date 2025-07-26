"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Image, Upload, Trash2, Save, Eye, Plus } from "lucide-react";
import { toast } from "sonner";

interface BannerImage {
  id: string;
  url: string;
  alt: string;
  title?: string;
  description?: string;
  order: number;
}

const defaultBannerImages: BannerImage[] = [
  {
    id: "1",
    url: "https://ik.imagekit.io/54hg3nvcfg/zdenek-machacek-UxHol6SwLyM-unsplash.jpg?updatedAt=1752094873385",
    alt: "Safari landscape",
    title: "Discover Africa's Greatest Adventures",
    description:
      "AI-powered safari discovery that connects you to unforgettable experiences",
    order: 1,
  },
  {
    id: "2",
    url: "https://ik.imagekit.io/54hg3nvcfg/redcharlie-xtvo0ffGKlI-unsplash.jpg?updatedAt=1752094873358",
    alt: "Wildlife photography",
    title: "Unforgettable Wildlife Encounters",
    description:
      "Experience the magic of African wildlife in their natural habitat",
    order: 2,
  },
];

export default function BannerManager() {
  const [bannerImages, setBannerImages] =
    useState<BannerImage[]>(defaultBannerImages);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<BannerImage | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real app, you would upload to your server/cloud storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const newImage: BannerImage = {
        id: Date.now().toString(),
        url: e.target?.result as string,
        alt: file.name,
        title: "",
        description: "",
        order: bannerImages.length + 1,
      };
      setBannerImages((prev) => [...prev, newImage]);
      toast.success("Image uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteImage = (id: string) => {
    setBannerImages((prev) => prev.filter((img) => img.id !== id));
    toast.success("Image deleted successfully!");
  };

  const handleUpdateImage = (id: string, updates: Partial<BannerImage>) => {
    setBannerImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...updates } : img))
    );
  };

  const handleSave = async () => {
    try {
      // Here you would save to your backend
      toast.success("Banner configuration saved successfully!");
    } catch (error) {
      toast.error("Failed to save banner configuration");
    }
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newImages = [...bannerImages];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);

    // Update order numbers
    const reorderedImages = newImages.map((img, index) => ({
      ...img,
      order: index + 1,
    }));

    setBannerImages(reorderedImages);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Home Banner Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage the hero banner images and content for your homepage.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? "Hide Preview" : "Show Preview"}
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Banner Images Management */}
        <div className="space-y-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <Image className="h-5 w-5 mr-2" />
                Banner Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload New Image */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500 block mt-1">
                    PNG, JPG, GIF up to 10MB
                  </span>
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Image List */}
              <div className="space-y-4">
                {bannerImages.map((image, index) => (
                  <Card
                    key={image.id}
                    className="relative dark:bg-gray-700 dark:border-gray-600"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={image.url}
                            alt={image.alt}
                            className="w-20 h-16 object-cover rounded"
                          />
                          <div className="absolute -top-2 -left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                            {image.order}
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Image alt text"
                            value={image.alt}
                            onChange={(e) =>
                              handleUpdateImage(image.id, {
                                alt: e.target.value,
                              })
                            }
                            className="text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          />
                          <Input
                            placeholder="Title (optional)"
                            value={image.title || ""}
                            onChange={(e) =>
                              handleUpdateImage(image.id, {
                                title: e.target.value,
                              })
                            }
                            className="text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          />
                          <Textarea
                            placeholder="Description (optional)"
                            value={image.description || ""}
                            onChange={(e) =>
                              handleUpdateImage(image.id, {
                                description: e.target.value,
                              })
                            }
                            className="text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            rows={2}
                          />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedImage(image)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteImage(image.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Banner Settings */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Banner Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  Transition Duration (seconds)
                </Label>
                <Input
                  type="number"
                  defaultValue={5}
                  min={1}
                  max={10}
                  className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  Auto-play
                </Label>
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto-play"
                      defaultChecked
                      aria-label="Enable automatic image rotation"
                    />
                    <Label
                      htmlFor="auto-play"
                      className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                    >
                      Enable automatic image rotation
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        {isPreviewMode && (
          <div className="space-y-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Banner Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-96 bg-gray-900 rounded-lg overflow-hidden">
                  {bannerImages.length > 0 && (
                    <div
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat banner-preview-image"
                      style={{
                        backgroundImage: `url('${bannerImages[0].url}')`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <h2 className="text-3xl font-bold mb-4">
                            {bannerImages[0].title ||
                              "Discover Africa's Greatest Adventures"}
                          </h2>
                          <p className="text-xl max-w-2xl mx-auto">
                            {bannerImages[0].description ||
                              "AI-powered safari discovery that connects you to unforgettable experiences"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Image Details */}
            {selectedImage && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">
                    Selected Image Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.alt}
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        Alt Text
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {selectedImage.alt}
                      </p>
                    </div>
                    {selectedImage.title && (
                      <div>
                        <Label className="text-sm font-medium text-gray-900 dark:text-white">
                          Title
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {selectedImage.title}
                        </p>
                      </div>
                    )}
                    {selectedImage.description && (
                      <div>
                        <Label className="text-sm font-medium text-gray-900 dark:text-white">
                          Description
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {selectedImage.description}
                        </p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        Order
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {selectedImage.order}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
