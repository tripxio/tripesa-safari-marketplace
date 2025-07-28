"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";

interface ThemeContextType {
  mode: "light" | "dark";
  setMode: (mode: "light" | "dark") => void;
  config: any;
  isLoading: boolean;
  error: string | null;
  refreshTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const { config, isLoading, error, applyCurrentTheme, refreshTheme } =
    useThemeColors();

  // Initialize theme mode from localStorage or system preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("theme-mode") as "light" | "dark";
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      if (savedMode) {
        setMode(savedMode);
      } else if (systemPrefersDark) {
        setMode("dark");
      }
    }
  }, []);

  // Apply theme when config changes or mode changes
  useEffect(() => {
    if (config && !isLoading) {
      applyCurrentTheme(mode);
    }
  }, [config, mode, applyCurrentTheme, isLoading]);

  // Handle Tailwind CSS dark mode class
  useEffect(() => {
    if (typeof document !== "undefined") {
      const html = document.documentElement;
      console.log("ThemeProvider: Setting dark mode class, mode:", mode);
      if (mode === "dark") {
        html.classList.add("dark");
        console.log("ThemeProvider: Added 'dark' class to HTML");
      } else {
        html.classList.remove("dark");
        console.log("ThemeProvider: Removed 'dark' class from HTML");
      }
    }
  }, [mode]);

  // Save mode to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme-mode", mode);
    }
  }, [mode]);

  const handleSetMode = (newMode: "light" | "dark") => {
    setMode(newMode);
  };

  const value: ThemeContextType = {
    mode,
    setMode: handleSetMode,
    config,
    isLoading,
    error,
    refreshTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
 