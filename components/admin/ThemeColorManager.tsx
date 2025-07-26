"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Save, RotateCcw, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  getThemeColors,
  saveThemeColors,
  ThemeColors,
} from "@/lib/firebase/config-service";
import { logConfigUpdate } from "@/lib/firebase/analytics";

const defaultColors: ThemeColors = {
  primary: "#f97316", // Orange
  secondary: "#64748b", // Slate
  accent: "#8b5cf6", // Purple
  background: "#ffffff", // White
  text: "#1f2937", // Gray-800
  muted: "#6b7280", // Gray-500
};

export default function ThemeColorManager() {
  const [colors, setColors] = useState<ThemeColors>(defaultColors);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadThemeColors();
  }, []);

  const loadThemeColors = async () => {
    try {
      setIsLoading(true);
      const savedColors = await getThemeColors();
      if (savedColors) {
        setColors(savedColors);
      }
    } catch (error) {
      console.error("Error loading theme colors:", error);
      toast.error("Failed to load theme colors");
    } finally {
      setIsLoading(false);
    }
  };

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveThemeColors(colors);
      logConfigUpdate("theme", "colors");
      toast.success("Theme colors saved successfully!");
    } catch (error) {
      console.error("Error saving theme colors:", error);
      toast.error("Failed to save theme colors");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsSaving(true);
      await saveThemeColors(defaultColors);
      setColors(defaultColors);
      logConfigUpdate("theme", "reset");
      toast.info("Theme colors reset to default");
    } catch (error) {
      console.error("Error resetting theme colors:", error);
      toast.error("Failed to reset theme colors");
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
            Customize the color scheme of your Tripesa Safari website.
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Configuration */}
        <div className="space-y-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <Palette className="h-5 w-5 mr-2" />
                Color Configuration
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
                      value={colors[key]}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="w-16 h-10 p-1 border rounded dark:border-gray-600"
                    />
                    <Input
                      type="text"
                      value={colors[key]}
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
                Color Palette
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(colors).map(([key, color]) => (
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
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="p-6 rounded-lg border dark:border-gray-600"
                  style={{ backgroundColor: colors.background }}
                >
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: colors.text }}
                  >
                    Sample Content
                  </h3>
                  <p className="mb-4" style={{ color: colors.muted }}>
                    This is how your content will look with the selected colors.
                  </p>
                  <div className="space-y-3">
                    <Button
                      style={{
                        backgroundColor: colors.primary,
                        color: "#ffffff",
                      }}
                    >
                      Primary Button
                    </Button>
                    <Button
                      variant="outline"
                      style={{
                        borderColor: colors.secondary,
                        color: colors.secondary,
                      }}
                    >
                      Secondary Button
                    </Button>
                    <div
                      className="p-3 rounded"
                      style={{
                        backgroundColor: colors.accent,
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
  --primary: ${colors.primary};
  --secondary: ${colors.secondary};
  --accent: ${colors.accent};
  --background: ${colors.background};
  --text: ${colors.text};
  --muted: ${colors.muted};
}`}</pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

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
              onClick={() =>
                setColors({
                  primary: "#f97316",
                  secondary: "#64748b",
                  accent: "#8b5cf6",
                  background: "#ffffff",
                  text: "#1f2937",
                  muted: "#6b7280",
                })
              }
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
              onClick={() =>
                setColors({
                  primary: "#059669",
                  secondary: "#475569",
                  accent: "#7c3aed",
                  background: "#ffffff",
                  text: "#1f2937",
                  muted: "#6b7280",
                })
              }
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
              onClick={() =>
                setColors({
                  primary: "#dc2626",
                  secondary: "#374151",
                  accent: "#9333ea",
                  background: "#ffffff",
                  text: "#1f2937",
                  muted: "#6b7280",
                })
              }
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
