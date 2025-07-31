import { useState, useEffect } from "react";
import {
  getThemeConfig,
  ThemeColors,
  getDefaultColors,
  getDefaultDarkColors,
} from "@/lib/firebase/config-service";

export interface ThemeConfig {
  light: ThemeColors;
  dark: ThemeColors;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

// Helper function to convert hex to HSL
const hexToHsl = (hex: string): string => {
  // Remove the # if present
  hex = hex.replace("#", "");

  // Parse the hex values
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  // Convert to degrees and percentages
  const hue = Math.round(h * 360);
  const saturation = Math.round(s * 100);
  const lightness = Math.round(l * 100);

  return `${hue} ${saturation}% ${lightness}%`;
};

export const useThemeColors = () => {
  const [config, setConfig] = useState<ThemeConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadThemeConfig();
  }, []);

  const loadThemeConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const themeConfig = await getThemeConfig();
      setConfig(themeConfig);
    } catch (err) {
      console.error("Error loading theme config:", err);
      setError("Failed to load theme configuration");
      // Set fallback config if loading fails
      const fallbackConfig: ThemeConfig = {
        light: getDefaultColors(),
        dark: getDefaultDarkColors(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "system",
        version: 1,
      };
      setConfig(fallbackConfig);
    } finally {
      setIsLoading(false);
    }
  };

  const applyThemeColors = (
    colors: ThemeColors,
    mode: "light" | "dark" = "light"
  ) => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    // Convert hex colors to HSL and apply CSS custom properties
    // Map to the variables defined in globals.css
    root.style.setProperty("--primary", hexToHsl(colors.primary));
    root.style.setProperty(
      "--primary-foreground",
      mode === "light" ? "0 0% 98%" : "0 0% 9%"
    );
    root.style.setProperty("--secondary", hexToHsl(colors.secondary));
    root.style.setProperty(
      "--secondary-foreground",
      mode === "light" ? "0 0% 9%" : "0 0% 98%"
    );
    root.style.setProperty("--accent", hexToHsl(colors.accent));
    root.style.setProperty(
      "--accent-foreground",
      mode === "light" ? "0 0% 9%" : "0 0% 98%"
    );
    root.style.setProperty("--background", hexToHsl(colors.background));
    root.style.setProperty("--foreground", hexToHsl(colors.text));
    root.style.setProperty("--muted", hexToHsl(colors.muted));
    root.style.setProperty("--muted-foreground", hexToHsl(colors.muted));
    root.style.setProperty("--card", hexToHsl(colors.background));
    root.style.setProperty("--card-foreground", hexToHsl(colors.text));
    root.style.setProperty("--popover", hexToHsl(colors.background));
    root.style.setProperty("--popover-foreground", hexToHsl(colors.text));
    root.style.setProperty(
      "--border",
      mode === "light" ? "0 0% 89.8%" : "0 0% 14.9%"
    );
    root.style.setProperty(
      "--input",
      mode === "light" ? "0 0% 89.8%" : "0 0% 14.9%"
    );
    root.style.setProperty("--ring", hexToHsl(colors.primary));
    root.style.setProperty(
      "--destructive",
      mode === "light" ? "0 84.2% 60.2%" : "0 62.8% 30.6%"
    );
    root.style.setProperty(
      "--destructive-foreground",
      mode === "light" ? "0 0% 98%" : "0 0% 98%"
    );

    // Add mode-specific class
    root.classList.remove("theme-light", "theme-dark");
    root.classList.add(`theme-${mode}`);
  };

  const applyCurrentTheme = (mode: "light" | "dark" = "light") => {
    console.log("useThemeColors: applyCurrentTheme called with mode:", mode);
    console.log("useThemeColors: config available:", !!config);

    if (!config) {
      // Apply fallback colors if no config
      console.log("useThemeColors: Using fallback colors");
      const fallbackColors =
        mode === "light" ? getDefaultColors() : getDefaultDarkColors();
      applyThemeColors(fallbackColors, mode);
      return;
    }

    const colors = config[mode];
    console.log("useThemeColors: Applying colors for mode:", mode, colors);
    applyThemeColors(colors, mode);
  };

  const refreshTheme = () => {
    loadThemeConfig();
  };

  return {
    config,
    isLoading,
    error,
    applyThemeColors,
    applyCurrentTheme,
    refreshTheme,
  };
};
