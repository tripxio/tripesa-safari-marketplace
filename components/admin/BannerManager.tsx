"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Image,
  Upload,
  Trash2,
  Save,
  Eye,
  Plus,
  History,
  ArrowLeft,
  Link as LinkIcon,
  Globe,
  Settings,
  Type,
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import { logAdminAction } from "@/lib/firebase/analytics";
import { useAuth } from "@/components/common/AuthProvider";
import {
  getBannerConfig,
  saveBannerConfig,
  getBannerVersions,
  rollbackBannerToVersion,
  uploadBannerImage,
  deleteBannerImage,
  createAdminUser,
  BannerConfig,
  BannerVersion,
  BannerImage,
  BannerText,
  BannerSettings,
} from "@/lib/firebase/config-service";
import Link from "next/link";

export default function BannerManager() {
  const { adminUser } = useAuth();
  const [config, setConfig] = useState<BannerConfig | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<BannerVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState<"images" | "text" | "settings">(
    "images"
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadBannerConfig();
  }, []);

  const loadBannerConfig = async () => {
    try {
      setIsLoading(true);
      const bannerConfig = await getBannerConfig();
      if (bannerConfig) {
        // Ensure images are properly ordered
        const configWithOrderedImages = {
          ...bannerConfig,
          images: reorderImages(bannerConfig.images),
        };
        setConfig(configWithOrderedImages);
      } else {
        toast.error(
          "No banner configuration found. Please contact administrator."
        );
        setConfig(null);
      }
    } catch (error) {
      console.error("Error loading banner config:", error);
      toast.error("Failed to load banner configuration");
      setConfig(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVersions = async () => {
    try {
      setIsLoadingVersions(true);
      const versionHistory = await getBannerVersions(20);
      setVersions(versionHistory);
    } catch (error) {
      console.error("Error loading versions:", error);
      toast.error("Failed to load version history");
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const handleSave = async () => {
    if (!config || !adminUser) {
      console.error("Save failed: config or adminUser is null", {
        config: !!config,
        adminUser: !!adminUser,
      });
      toast.error("Missing configuration or user authentication");
      return;
    }

    try {
      setIsSaving(true);
      setSaveSuccess(false);
      console.log(
        "Attempting to save banner config with user:",
        adminUser.uid,
        adminUser.name
      );

      // Ensure admin user exists in Firebase
      await createAdminUser(adminUser.uid, adminUser.name);

      await saveBannerConfig(
        {
          images: config.images,
          text: config.text,
          settings: config.settings,
          isActive: true,
          createdBy: adminUser.uid,
        },
        adminUser.uid,
        adminUser.name,
        description || undefined
      );

      logAdminAction("save", "banner_configuration");

      // Show success state
      setSaveSuccess(true);
      setHasUnsavedChanges(false);
      toast.success("Banner configuration saved successfully!", {
        description: "Your changes have been applied to the homepage.",
        duration: 4000,
      });

      // Clear description after successful save
      setDescription("");

      // Reload config to get updated version
      await loadBannerConfig();

      // Hide success state after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error("Error saving banner config:", error);
      console.error("Error details:", {
        errorMessage: error.message,
        errorCode: error.code,
        adminUser: adminUser,
        configExists: !!config,
      });
      toast.error(`Failed to save banner configuration: ${error.message}`, {
        description: "Please try again or check your connection.",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { url, storagePath } = await uploadBannerImage(file);
      const newImage: BannerImage = {
        id: Date.now().toString(),
        url,
        alt: file.name,
        title: "",
        description: "",
        order: (config?.images.length || 0) + 1,
        createdAt: new Date(),
        isUploaded: true,
        storagePath,
      };

      setConfig((prev) =>
        prev
          ? {
              ...prev,
              images: reorderImages([...prev.images, newImage]),
            }
          : null
      );
      setHasUnsavedChanges(true);

      logAdminAction("upload", "banner_image");
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    }
  };

  const handleAddExternalImage = () => {
    const url = prompt("Enter image URL:");
    if (!url) return;

    const newImage: BannerImage = {
      id: Date.now().toString(),
      url,
      alt: "External image",
      title: "",
      description: "",
      order: (config?.images.length || 0) + 1,
      createdAt: new Date(),
      isUploaded: false,
    };

    setConfig((prev) =>
      prev
        ? {
            ...prev,
            images: reorderImages([...prev.images, newImage]),
          }
        : null
    );
    setHasUnsavedChanges(true);

    toast.success("External image added successfully!");
  };

  const handleDeleteImage = async (id: string) => {
    if (!config) return;

    const image = config.images.find((img) => img.id === id);
    if (!image) return;

    try {
      if (image.isUploaded && image.storagePath) {
        await deleteBannerImage(image.url, image.storagePath);
      }

      // Filter out the deleted image and reorder remaining images
      const remainingImages = config.images
        .filter((img) => img.id !== id)
        .sort((a, b) => a.order - b.order) // Ensure proper order before reordering
        .map((img, index) => ({
          ...img,
          order: index + 1, // Reorder starting from 1
        }));

      setConfig((prev) =>
        prev
          ? {
              ...prev,
              images: remainingImages,
            }
          : null
      );
      setHasUnsavedChanges(true);

      logAdminAction("delete", "banner_image");
      toast.success("Image deleted successfully!");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  // Helper function to reorder images
  const reorderImages = (images: BannerImage[]): BannerImage[] => {
    return images
      .sort((a, b) => a.order - b.order)
      .map((img, index) => ({
        ...img,
        order: index + 1,
      }));
  };

  // Enhanced function to move image up/down
  const handleMoveImage = (id: string, direction: "up" | "down") => {
    if (!config) return;

    const currentImages = [...config.images].sort((a, b) => a.order - b.order);
    const currentIndex = currentImages.findIndex((img) => img.id === id);

    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    // Check bounds
    if (newIndex < 0 || newIndex >= currentImages.length) return;

    // Swap positions
    [currentImages[currentIndex], currentImages[newIndex]] = [
      currentImages[newIndex],
      currentImages[currentIndex],
    ];

    // Reorder all images to ensure continuous ordering
    const reorderedImages = reorderImages(currentImages);

    setConfig((prev) =>
      prev
        ? {
            ...prev,
            images: reorderedImages,
          }
        : null
    );
    setHasUnsavedChanges(true);
  };

  const handleUpdateImage = (id: string, updates: Partial<BannerImage>) => {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            images: prev.images.map((img) =>
              img.id === id ? { ...img, ...updates } : img
            ),
          }
        : null
    );
    setHasUnsavedChanges(true);
  };

  const handleUpdateText = (field: keyof BannerText, value: string) => {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            text: { ...prev.text, [field]: value },
          }
        : null
    );
    setHasUnsavedChanges(true);
  };

  const handleUpdateSettings = (field: keyof BannerSettings, value: any) => {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            settings: { ...prev.settings, [field]: value },
          }
        : null
    );
    setHasUnsavedChanges(true);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (!config) return;

    const newImages = [...config.images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);

    // Update order numbers
    const reorderedImages = newImages.map((img, index) => ({
      ...img,
      order: index + 1,
    }));

    setConfig({
      ...config,
      images: reorderedImages,
    });
    setHasUnsavedChanges(true);
  };

  const handleRollback = async (versionId: string) => {
    if (!adminUser) return;

    try {
      setIsSaving(true);
      await rollbackBannerToVersion(versionId, adminUser.uid, adminUser.name);
      await loadBannerConfig();
      toast.success("Successfully rolled back to previous version", {
        description: "The banner has been restored to the selected version.",
        duration: 4000,
      });
    } catch (error) {
      console.error("Error rolling back:", error);
      toast.error("Failed to rollback banner version", {
        description: "Please try again or check your connection.",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Banner Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Loading banner configuration...
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Handle case where config is null
  if (!config) {
    return (
      <div className="space-y-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Banner Configuration Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The banner configuration could not be loaded. This might be a
              temporary issue.
            </p>
            <Button onClick={loadBannerConfig} className="mr-2">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Link href="/admin">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Banner Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage the hero banner images, text content, and settings for your
            homepage.
          </p>
          {config && (
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Version {config.version}</span>
              <span>•</span>
              <span>Last updated: {config.updatedAt.toLocaleDateString()}</span>
              {hasUnsavedChanges && (
                <>
                  <span>•</span>
                  <span className="flex items-center text-orange-600 dark:text-orange-400">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Unsaved changes
                  </span>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setShowVersions(!showVersions);
              if (!showVersions && versions.length === 0) {
                loadVersions();
              }
            }}
          >
            <History className="h-4 w-4 mr-2" />
            {showVersions ? "Hide History" : "Show History"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? "Hide Preview" : "Show Preview"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className={
              saveSuccess
                ? "bg-green-600 hover:bg-green-700"
                : hasUnsavedChanges
                ? "bg-orange-600 hover:bg-orange-700"
                : ""
            }
          >
            {saveSuccess ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : hasUnsavedChanges ? (
              <AlertCircle className="h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving
              ? "Saving..."
              : saveSuccess
              ? "Saved!"
              : hasUnsavedChanges
              ? "Save Changes*"
              : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Description Input */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Change Description (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Describe what changes you're making..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <Button
              variant={activeTab === "images" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("images")}
              className="flex items-center space-x-2"
            >
              <Image className="h-4 w-4" />
              <span>Images</span>
            </Button>
            <Button
              variant={activeTab === "text" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("text")}
              className="flex items-center space-x-2"
            >
              <Type className="h-4 w-4" />
              <span>Text</span>
            </Button>
            <Button
              variant={activeTab === "settings" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("settings")}
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
          </div>

          {/* Images Tab */}
          {activeTab === "images" && (
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <Image className="h-5 w-5 mr-2" />
                  Banner Images
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Options */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                    <Upload className="h-6 w-6 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Upload Image
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
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                    <Globe className="h-6 w-6 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAddExternalImage}
                      className="text-sm font-medium text-gray-600 dark:text-gray-400"
                    >
                      Add External Link
                    </Button>
                  </div>
                </div>

                {/* Image List */}
                <div className="space-y-4">
                  {config?.images
                    .sort((a, b) => a.order - b.order)
                    .map((image, index) => (
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
                              {image.isUploaded && (
                                <Badge
                                  variant="secondary"
                                  className="absolute -top-2 -right-2 text-xs"
                                >
                                  Uploaded
                                </Badge>
                              )}
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
                                onClick={() => handleDeleteImage(image.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMoveImage(image.id, "up")}
                                disabled={index === 0}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleMoveImage(image.id, "down")
                                }
                                disabled={
                                  index ===
                                  config.images.sort(
                                    (a, b) => a.order - b.order
                                  ).length -
                                    1
                                }
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Text Tab */}
          {activeTab === "text" && (
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <Type className="h-5 w-5 mr-2" />
                  Banner Text Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Main Title
                  </Label>
                  <Input
                    value={config?.text.mainTitle || ""}
                    onChange={(e) =>
                      handleUpdateText("mainTitle", e.target.value)
                    }
                    placeholder="Discover Africa's"
                    className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Subtitle
                  </Label>
                  <Input
                    value={config?.text.subtitle || ""}
                    onChange={(e) =>
                      handleUpdateText("subtitle", e.target.value)
                    }
                    placeholder="Greatest Adventures"
                    className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Description
                  </Label>
                  <Textarea
                    value={config?.text.description || ""}
                    onChange={(e) =>
                      handleUpdateText("description", e.target.value)
                    }
                    placeholder="AI-powered safari discovery that connects you to unforgettable experiences across the African continent"
                    className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <Settings className="h-5 w-5 mr-2" />
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
                    value={config?.settings.transitionDuration || 5}
                    onChange={(e) =>
                      handleUpdateSettings(
                        "transitionDuration",
                        parseInt(e.target.value)
                      )
                    }
                    min={1}
                    max={10}
                    className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Autoplay Interval (seconds)
                  </Label>
                  <Input
                    type="number"
                    value={config?.settings.autoplayInterval || 5}
                    onChange={(e) =>
                      handleUpdateSettings(
                        "autoplayInterval",
                        parseInt(e.target.value)
                      )
                    }
                    min={1}
                    max={30}
                    className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-900 dark:text-white">
                      Enable Autoplay
                    </Label>
                    <Switch
                      checked={config?.settings.autoplay || false}
                      onCheckedChange={(checked) =>
                        handleUpdateSettings("autoplay", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-900 dark:text-white">
                      Show Indicators
                    </Label>
                    <Switch
                      checked={config?.settings.showIndicators || false}
                      onCheckedChange={(checked) =>
                        handleUpdateSettings("showIndicators", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-900 dark:text-white">
                      Show Arrows
                    </Label>
                    <Switch
                      checked={config?.settings.showArrows || false}
                      onCheckedChange={(checked) =>
                        handleUpdateSettings("showArrows", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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
                  {config?.images && config.images.length > 0 && (
                    <div
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                      style={{
                        backgroundImage: `url('${config.images[0].url}')`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <h2 className="text-3xl font-bold mb-4">
                            {config?.text?.mainTitle} {config?.text?.subtitle}
                          </h2>
                          <p className="text-xl max-w-2xl mx-auto">
                            {config?.text?.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Version History */}
      {showVersions && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Version History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingVersions ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : versions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No version history available
              </p>
            ) : (
              <div className="space-y-4">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-600"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex space-x-1">
                        {version.images.slice(0, 3).map((img, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded bg-cover bg-center"
                            style={{ backgroundImage: `url('${img.url}')` }}
                          />
                        ))}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            Version {version.version}
                          </span>
                          {version.isActive && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {version.createdByName}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {version.createdAt.toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {version.createdAt.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {version.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {version.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {!version.isActive && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isSaving}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Rollback
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Confirm Rollback
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to rollback to Version{" "}
                              {version.version}? This will replace the current
                              banner configuration with the selected version.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRollback(version.id)}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Rollback to Version {version.version}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
