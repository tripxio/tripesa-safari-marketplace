"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useTheme } from "@/components/common/ThemeProvider";
import { Palette, Sun, Moon, Eye, Code } from "lucide-react";
import { ThemeColors } from "@/lib/firebase/config-service";

export default function ThemeDemoPage() {
  const { mode, config, isLoading } = useTheme();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading theme...
          </p>
        </div>
      </div>
    );
  }

  const currentColors: ThemeColors =
    config?.[mode] ||
    (mode === "dark"
      ? {
          primary: "#fafafa", // 0 0% 98% - matches --primary in dark mode
          secondary: "#262626", // 0 0% 14.9% - matches --secondary in dark mode
          accent: "#262626", // 0 0% 14.9% - matches --accent in dark mode
          background: "#0a0a0a", // 0 0% 3.9% - matches --background in dark mode
          text: "#fafafa", // 0 0% 98% - matches --foreground in dark mode
          muted: "#a3a3a3", // 0 0% 63.9% - matches --muted-foreground in dark mode
        }
      : {
          primary: "#171717", // 0 0% 9% - matches --primary in light mode
          secondary: "#f5f5f5", // 0 0% 96.1% - matches --secondary in light mode
          accent: "#f5f5f5", // 0 0% 96.1% - matches --accent in light mode
          background: "#F4F3F2", // Updated from pure white to warm off-white
          text: "#0a0a0a", // 0 0% 3.9% - matches --foreground in light mode
          muted: "#737373", // 0 0% 45.1% - matches --muted-foreground in light mode
        });

  return (
    <div
      className="min-h-screen p-8 transition-colors duration-300"
      style={{
        backgroundColor: currentColors.background,
        color: currentColors.text,
      }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Theme System Demo</h1>
            <p className="text-lg" style={{ color: currentColors.muted }}>
              Showcasing the comprehensive theme color management system
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="flex items-center space-x-2">
              {mode === "light" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="capitalize">{mode} Mode</span>
            </Badge>
            <ThemeToggle showLabel={true} />
          </div>
        </div>

        {/* Color Palette */}
        <Card
          style={{
            backgroundColor: currentColors.background,
            borderColor: currentColors.muted,
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Current Color Palette
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(currentColors).map(([key, color]) => (
                <div key={key} className="text-center">
                  <div
                    className="w-full h-20 rounded-lg mb-2 border-2 border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: color as string }}
                  />
                  <p className="text-sm font-medium capitalize">{key}</p>
                  <p className="text-xs" style={{ color: currentColors.muted }}>
                    {color}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interactive Elements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card
            style={{
              backgroundColor: currentColors.background,
              borderColor: currentColors.muted,
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Interactive Elements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                style={{
                  backgroundColor: currentColors.primary,
                  color: "#ffffff",
                }}
                className="w-full"
              >
                Primary Button
              </Button>

              <Button
                variant="outline"
                style={{
                  borderColor: currentColors.secondary,
                  color: currentColors.secondary,
                }}
                className="w-full"
              >
                Secondary Button
              </Button>

              <div
                className="p-4 rounded-lg text-center"
                style={{
                  backgroundColor: currentColors.accent,
                  color: "#ffffff",
                }}
              >
                Accent Element
              </div>

              <div
                className="p-4 rounded-lg border"
                style={{
                  borderColor: currentColors.muted,
                  color: currentColors.muted,
                }}
              >
                Muted Text Element
              </div>
            </CardContent>
          </Card>

          {/* CSS Variables */}
          <Card
            style={{
              backgroundColor: currentColors.background,
              borderColor: currentColors.muted,
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="h-5 w-5 mr-2" />
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

        {/* Feature Showcase */}
        <Card
          style={{
            backgroundColor: currentColors.background,
            borderColor: currentColors.muted,
          }}
        >
          <CardHeader>
            <CardTitle>Theme System Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">🎨 Dual Mode Support</h3>
                <p className="text-sm" style={{ color: currentColors.muted }}>
                  Complete light and dark mode themes with automatic switching
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">📊 Version History</h3>
                <p className="text-sm" style={{ color: currentColors.muted }}>
                  Complete audit trail of all theme changes with rollback
                  capability
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">👤 User Tracking</h3>
                <p className="text-sm" style={{ color: currentColors.muted }}>
                  Track who made changes and when with full attribution
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">🔐 Secure Storage</h3>
                <p className="text-sm" style={{ color: currentColors.muted }}>
                  Firebase-backed storage with authentication and security rules
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">⚡ Real-time Preview</h3>
                <p className="text-sm" style={{ color: currentColors.muted }}>
                  Live preview of color changes before saving
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">🎯 Preset Themes</h3>
                <p className="text-sm" style={{ color: currentColors.muted }}>
                  Quick application of professionally designed theme presets
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Access */}
        <Card
          style={{
            backgroundColor: currentColors.background,
            borderColor: currentColors.muted,
          }}
        >
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4" style={{ color: currentColors.muted }}>
              To manage themes, access the admin dashboard:
            </p>
            <Button
              asChild
              style={{
                backgroundColor: currentColors.primary,
                color: "#ffffff",
              }}
            >
              <a href="/admin/theme">Go to Theme Manager</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
