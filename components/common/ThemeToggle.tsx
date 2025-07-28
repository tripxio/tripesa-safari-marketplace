"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({
  className = "",
  showLabel = false,
}: ThemeToggleProps) {
  const { mode, setMode } = useTheme();

  const toggleMode = () => {
    console.log("ThemeToggle: Current mode:", mode);
    const newMode = mode === "light" ? "dark" : "light";
    console.log("ThemeToggle: Switching to:", newMode);
    setMode(newMode);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleMode}
      className={className}
      aria-label={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
    >
      {mode === "light" ? (
        <>
          <Moon className="h-4 w-4" />
          {showLabel && <span className="ml-2">Dark</span>}
        </>
      ) : (
        <>
          <Sun className="h-4 w-4" />
          {showLabel && <span className="ml-2">Light</span>}
        </>
      )}
    </Button>
  );
}
