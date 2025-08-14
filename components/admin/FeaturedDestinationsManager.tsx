"use client";

import { useState, useEffect, useRef } from "react";
import {
  getFeaturedDestinations,
  saveFeaturedDestinations,
  uploadFeaturedDestinationImage,
  deleteFeaturedDestinationImage,
  FeaturedDestination,
} from "@/lib/firebase/config-service";
import { useAuth } from "@/components/common/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Trash2, Link as LinkIcon } from "lucide-react";

const MAX_DESTINATIONS = 3;

export default function FeaturedDestinationsManager() {
  const { adminUser } = useAuth();
  const [destinations, setDestinations] = useState<FeaturedDestination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const loadDestinations = async () => {
      setIsLoading(true);
      try {
        const fetchedDestinations = await getFeaturedDestinations();
        if (fetchedDestinations && fetchedDestinations.length > 0) {
          setDestinations(
            fetchedDestinations.sort((a, b) => a.order - b.order)
          );
        } else {
          // Initialize with empty destinations if none are found
          setDestinations(
            Array.from({ length: MAX_DESTINATIONS }, (_, i) => ({
              id: `dest-${i + 1}`,
              title: "",
              description: "",
              imageUrl: "",
              link: "",
              order: i + 1,
            }))
          );
        }
      } catch (error) {
        toast.error("Failed to load featured destinations.");
        console.error(error);
      }
      setIsLoading(false);
    };

    loadDestinations();
  }, []);

  const handleInputChange = (
    index: number,
    field: keyof FeaturedDestination,
    value: string
  ) => {
    const newDestinations = [...destinations];
    newDestinations[index] = { ...newDestinations[index], [field]: value };
    setDestinations(newDestinations);
  };

  const handleImageUpload = async (
    index: number,
    file: File
  ): Promise<void> => {
    if (!adminUser) {
      toast.error("You must be logged in to upload images.");
      return;
    }

    const originalDestination = destinations[index];
    // Optimistically update the UI
    const tempUrl = URL.createObjectURL(file);
    handleInputChange(index, "imageUrl", tempUrl);

    try {
      // Delete the old image if it exists and was uploaded
      if (originalDestination.isUploaded && originalDestination.storagePath) {
        await deleteFeaturedDestinationImage(originalDestination.storagePath);
      }

      const { url, storagePath } = await uploadFeaturedDestinationImage(file);
      const newDestinations = [...destinations];
      newDestinations[index] = {
        ...newDestinations[index],
        imageUrl: url,
        isUploaded: true,
        storagePath: storagePath,
      };
      setDestinations(newDestinations);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Image upload failed.");
      // Revert on failure
      setDestinations((prev) => {
        const reverted = [...prev];
        reverted[index] = originalDestination;
        return reverted;
      });
      console.error(error);
    } finally {
      if (tempUrl) {
        URL.revokeObjectURL(tempUrl);
      }
    }
  };

  const handleSave = async () => {
    if (!adminUser) {
      toast.error("You must be logged in to save.");
      return;
    }

    setIsLoading(true);
    try {
      await saveFeaturedDestinations(destinations, adminUser.uid);
      toast.success("Featured destinations saved successfully!");
    } catch (error) {
      toast.error("Failed to save featured destinations.");
      console.error(error);
    }
    setIsLoading(false);
  };

  if (isLoading && destinations.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Featured Destinations</h1>
          <p className="text-gray-500">
            Configure the top 3 trending destinations for the homepage.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {destinations.map((dest, index) => (
          <Card key={dest.id}>
            <CardHeader>
              <CardTitle>Destination {index + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                {dest.imageUrl && (
                  <div className="mb-2">
                    <img
                      src={dest.imageUrl}
                      alt={dest.title}
                      className="w-full h-40 object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Image URL"
                    value={dest.imageUrl}
                    onChange={(e) =>
                      handleInputChange(index, "imageUrl", e.target.value)
                    }
                    className="flex-grow"
                  />
                  <label
                    htmlFor={`image-upload-${index}`}
                    className="cursor-pointer p-2 border rounded-md hover:bg-gray-100 flex items-center justify-center"
                    title="Upload image"
                  >
                    <Upload className="h-5 w-5" />
                    <input
                      id={`image-upload-${index}`}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files &&
                        handleImageUpload(index, e.target.files[0])
                      }
                      title="Upload an image for the destination"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={dest.title}
                  onChange={(e) =>
                    handleInputChange(index, "title", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  value={dest.description}
                  onChange={(e) =>
                    handleInputChange(index, "description", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Link</label>
                <Input
                  value={dest.link}
                  onChange={(e) =>
                    handleInputChange(index, "link", e.target.value)
                  }
                  placeholder="e.g., /tours/kidepo-valley"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
