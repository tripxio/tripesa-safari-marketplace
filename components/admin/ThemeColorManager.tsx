"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Palette,
  Save,
  RotateCcw,
  Eye,
  History,
  Moon,
  Sun,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import {
  getThemeConfig,
  saveThemeConfig,
  getThemeVersions,
  rollbackToVersion,
  getDefaultColors,
  getDefaultDarkColors,
  ThemeConfig,
  ThemeVersion,
  ThemeColors,
} from "@/lib/firebase/config-service";
import { logConfigUpdate } from "@/lib/firebase/analytics";
import { useAuth } from "@/components/common/AuthProvider";

const defaultLightColors = getDefaultColors();
const defaultDarkColors = getDefaultDarkColors();

export default function ThemeColorManager() {
  const { adminUser } = useAuth();
  const [config, setConfig] = useState<ThemeConfig | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentMode, setCurrentMode] = useState<"light" | "dark">("light");
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<ThemeVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadThemeConfig();
  }, []);

  const loadThemeConfig = async () => {
    try {
      setIsLoading(true);
      const savedConfig = await getThemeConfig();
      if (savedConfig) {
        setConfig(savedConfig);
      } else {
        // Initialize with defaults if no config exists
        const defaultConfig: ThemeConfig = {
          light: defaultLightColors,
          dark: defaultDarkColors,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: adminUser?.uid || "system",
          version: 1,
        };
        setConfig(defaultConfig);
      }
    } catch (error) {
      console.error("Error loading theme config:", error);
      toast.error("Failed to load theme configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const loadVersions = async () => {
    try {
      setIsLoadingVersions(true);
      const versionHistory = await getThemeVersions(20);
      setVersions(versionHistory);
    } catch (error) {
      console.error("Error loading versions:", error);
      toast.error("Failed to load version history");
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    if (!config) return;

    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [currentMode]: {
          ...prev[currentMode],
          [key]: value,
        },
      };
    });
  };

  const handleSave = async () => {
    if (!config || !adminUser) return;

    try {
      setIsSaving(true);
      await saveThemeConfig(
        {
          light: config.light,
          dark: config.dark,
          isActive: true,
          createdBy: adminUser.uid,
        },
        adminUser.uid,
        adminUser.name,
        description || undefined
      );

      logConfigUpdate("theme", "colors");
      toast.success("Theme configuration saved successfully!");
      setDescription("");

      // Reload config to get updated version
      await loadThemeConfig();
    } catch (error) {
      console.error("Error saving theme config:", error);
      toast.error("Failed to save theme configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!adminUser) return;

    try {
      setIsSaving(true);
      const defaultConfig = {
        light: defaultLightColors,
        dark: defaultDarkColors,
        isActive: true,
        createdBy: adminUser.uid,
      };

      await saveThemeConfig(
        defaultConfig,
        adminUser.uid,
        adminUser.name,
        "Reset to default colors"
      );

      setConfig((prev) =>
        prev
          ? {
              ...prev,
              light: defaultLightColors,
              dark: defaultDarkColors,
            }
          : null
      );

      logConfigUpdate("theme", "reset");
      toast.info("Theme colors reset to default");
    } catch (error) {
      console.error("Error resetting theme colors:", error);
      toast.error("Failed to reset theme colors");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRollback = async (versionId: string) => {
    if (!adminUser) return;

    try {
      setIsSaving(true);
      await rollbackToVersion(versionId, adminUser.uid, adminUser.name);
      await loadThemeConfig();
      toast.success("Successfully rolled back to previous version");
    } catch (error) {
      console.error("Error rolling back:", error);
      toast.error("Failed to rollback theme version");
    } finally {
      setIsSaving(false);
    }
  };

  const colorFields = [
    {
      key: "primary",
      label: "Primary Color",
      description: "Main brand color for buttons and highlights",
    },
    {
      key: "secondary",
      label: "Secondary Color",
      description: "Secondary brand color for accents",
    },
    {
      key: "accent",
      label: "Accent Color",
      description: "Accent color for special elements",
    },
    {
      key: "background",
      label: "Background Color",
      description: "Main background color",
    },
    { key: "text", label: "Text Color", description: "Primary text color" },
    {
      key: "muted",
      label: "Muted Color",
      description: "Muted text and border colors",
    },
  ] as const;

  const currentColors = config?.[currentMode] || defaultLightColors;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Theme Colors
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Loading theme configuration...
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                    <div className="flex space-x-3">
                      <div className="w-16 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Theme Colors
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Customize the color scheme for both light and dark modes.
          </p>
          {config && (
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Version {config.version}</span>
              <span>•</span>
              <span>Last updated: {config.updatedAt.toLocaleDateString()}</span>
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
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Mode Toggle */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant={currentMode === "light" ? "default" : "outline"}
              onClick={() => setCurrentMode("light")}
              className="flex items-center space-x-2"
            >
              <Sun className="h-4 w-4" />
              <span>Light Mode</span>
            </Button>
            <Button
              variant={currentMode === "dark" ? "default" : "outline"}
              onClick={() => setCurrentMode("dark")}
              className="flex items-center space-x-2"
            >
              <Moon className="h-4 w-4" />
              <span>Dark Mode</span>
            </Button>
          </div>
        </CardContent>
      </Card>

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
        {/* Color Configuration */}
        <div className="space-y-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <Palette className="h-5 w-5 mr-2" />
                {currentMode === "light" ? "Light Mode" : "Dark Mode"} Colors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {colorFields.map(({ key, label, description }) => (
                <div key={key} className="space-y-2">
                  <Label
                    htmlFor={key}
                    className="text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {label}
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {description}
                  </p>
                  <div className="flex items-center space-x-3">
                    <Input
                      id={key}
                      type="color"
                      value={currentColors[key]}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="w-16 h-10 p-1 border rounded dark:border-gray-600"
                    />
                    <Input
                      type="text"
                      value={currentColors[key]}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      placeholder="#000000"
                      className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Color Palette Preview */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                {currentMode === "light" ? "Light Mode" : "Dark Mode"} Palette
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(currentColors).map(([key, color]) => (
                  <div key={key} className="text-center">
                    <div
                      className="w-full h-16 rounded-lg mb-2 border dark:border-gray-600"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs font-medium capitalize text-gray-900 dark:text-white">
                      {key}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {color}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        {isPreviewMode && (
          <div className="space-y-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Live Preview -{" "}
                  {currentMode === "light" ? "Light Mode" : "Dark Mode"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="p-6 rounded-lg border dark:border-gray-600"
                  style={{ backgroundColor: currentColors.background }}
                >
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: currentColors.text }}
                  >
                    Sample Content
                  </h3>
                  <p className="mb-4" style={{ color: currentColors.muted }}>
                    This is how your content will look with the selected colors.
                  </p>
                  <div className="space-y-3">
                    <Button
                      style={{
                        backgroundColor: currentColors.primary,
                        color: "#ffffff",
                      }}
                    >
                      Primary Button
                    </Button>
                    <Button
                      variant="outline"
                      style={{
                        borderColor: currentColors.secondary,
                        color: currentColors.secondary,
                      }}
                    >
                      Secondary Button
                    </Button>
                    <div
                      className="p-3 rounded"
                      style={{
                        backgroundColor: currentColors.accent,
                        color: "#ffffff",
                      }}
                    >
                      Accent Element
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CSS Variables */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  CSS Variables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`:root {
  --primary: ${currentColors.primary};
  --secondary: ${currentColors.secondary};
  --accent: ${currentColors.accent};
  --background: ${currentColors.background};
  --text: ${currentColors.text};
  --muted: ${currentColors.muted};
}`}</pre>
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
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: version.light.primary }}
                        />
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: version.dark.primary }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            Version {version.version}
                          </span>
                          {version.isActive && (
                            <Badge variant="secondary">Current</Badge>
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
                        </div>
                        {version.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {version.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {!version.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRollback(version.id)}
                        disabled={isSaving}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Rollback
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preset Themes */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Preset Themes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setConfig((prev) =>
                  prev
                    ? {
                        ...prev,
                        light: {
                          primary: "#f97316",
                          secondary: "#64748b",
                          accent: "#8b5cf6",
                          background: "#ffffff",
                          text: "#1f2937",
                          muted: "#6b7280",
                        },
                        dark: {
                          primary: "#f97316",
                          secondary: "#94a3b8",
                          accent: "#a78bfa",
                          background: "#0f172a",
                          text: "#f1f5f9",
                          muted: "#64748b",
                        },
                      }
                    : null
                );
              }}
              className="h-20 flex-col dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              <div className="flex space-x-1 mb-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <div className="w-4 h-4 bg-slate-500 rounded"></div>
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
              </div>
              Safari Orange
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setConfig((prev) =>
                  prev
                    ? {
                        ...prev,
                        light: {
                          primary: "#059669",
                          secondary: "#475569",
                          accent: "#7c3aed",
                          background: "#ffffff",
                          text: "#1f2937",
                          muted: "#6b7280",
                        },
                        dark: {
                          primary: "#10b981",
                          secondary: "#64748b",
                          accent: "#8b5cf6",
                          background: "#0f172a",
                          text: "#f1f5f9",
                          muted: "#64748b",
                        },
                      }
                    : null
                );
              }}
              className="h-20 flex-col dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              <div className="flex space-x-1 mb-2">
                <div className="w-4 h-4 bg-emerald-600 rounded"></div>
                <div className="w-4 h-4 bg-slate-600 rounded"></div>
                <div className="w-4 h-4 bg-violet-600 rounded"></div>
              </div>
              Forest Green
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setConfig((prev) =>
                  prev
                    ? {
                        ...prev,
                        light: {
                          primary: "#dc2626",
                          secondary: "#374151",
                          accent: "#9333ea",
                          background: "#ffffff",
                          text: "#1f2937",
                          muted: "#6b7280",
                        },
                        dark: {
                          primary: "#ef4444",
                          secondary: "#6b7280",
                          accent: "#a855f7",
                          background: "#0f172a",
                          text: "#f1f5f9",
                          muted: "#64748b",
                        },
                      }
                    : null
                );
              }}
              className="h-20 flex-col dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              <div className="flex space-x-1 mb-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <div className="w-4 h-4 bg-gray-700 rounded"></div>
                <div className="w-4 h-4 bg-purple-600 rounded"></div>
              </div>
              Sunset Red
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
