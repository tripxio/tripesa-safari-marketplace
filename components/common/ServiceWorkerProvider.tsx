"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Wifi, WifiOff, Download, RefreshCw } from "lucide-react";

interface ServiceWorkerMessage {
  type: string;
  message: string;
  animal?: string;
}

export default function ServiceWorkerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // PWA install handler - moved outside useEffect
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        toast.success("🎉 Welcome to Safari Adventures!", {
          description: "Tripesa is now installed on your device",
          icon: "🦁",
        });
      }

      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "🦁 Safari Service Worker registered successfully:",
            registration
          );

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  toast.success("🚀 New safari features available!", {
                    description: "Refresh to get the latest updates",
                    action: {
                      label: "Refresh",
                      onClick: () => window.location.reload(),
                    },
                  });
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("❌ Safari Service Worker registration failed:", error);
        });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener("message", (event) => {
        const data: ServiceWorkerMessage = event.data;

        switch (data.type) {
          case "TOURS_UPDATED":
            toast.success(data.message, {
              description: "Fresh safari data loaded",
              icon: data.animal,
              style: {
                background: "#16a34a",
                color: "#ffffff",
                border: "2px solid #22c55e",
                fontWeight: "600",
              },
            });
            break;

          case "OFFLINE_MODE":
            toast.info(data.message, {
              description: "Using cached content",
              icon: data.animal,
              style: {
                background: "#ea580c", // Safari orange
                color: "#ffffff",
                border: "3px solid #fb923c",
                fontWeight: "600",
                fontSize: "16px",
              },
              duration: 6000,
            });
            break;

          case "BACK_ONLINE":
            toast.success(data.message, {
              description: "All features restored",
              icon: data.animal,
              style: {
                background: "#059669",
                color: "#ffffff",
                border: "2px solid #10b981",
                fontWeight: "600",
              },
            });
            break;
        }
      });
    }

    // Handle online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("🌐 Connection restored!", {
        description: "Safari adventures are fully available",
        icon: "🦁",
        style: {
          background: "#065f46", // Dark green background
          color: "#ffffff",
          border: "2px solid #10b981",
          fontWeight: "600",
        },
        duration: 4000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("📶 You're offline", {
        description: "Don't worry, cached safaris are still available",
        icon: "🏕️",
        style: {
          background: "#dc2626", // Strong red background
          color: "#ffffff",
          border: "3px solid #f87171",
          fontWeight: "600",
          fontSize: "16px",
        },
        duration: 8000, // Longer duration
      });
    };

    // PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);

      toast.info("📱 Install Tripesa Safari", {
        description: "Get the full safari experience on your device",
        action: {
          label: "Install",
          onClick: handleInstallClick,
        },
        style: {
          background: "#1e40af", // Strong blue background
          color: "#ffffff",
          border: "2px solid #3b82f6",
          fontWeight: "600",
        },
        duration: 10000,
      });
    };

    // Event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Initial online status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, [deferredPrompt, handleInstallClick]);

  return (
    <>
      {children}

      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center space-x-3 animate-pulse border-2 border-red-400">
            <WifiOff className="h-5 w-5" />
            <div>
              <div className="text-sm font-bold">Offline Mode</div>
              <div className="text-xs opacity-90">Showing cached content</div>
            </div>
          </div>
        </div>
      )}

      {/* Install prompt */}
      {isInstallable && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={handleInstallClick}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 hover:scale-105 transition-transform"
          >
            <Download className="h-4 w-4" />
            <span className="text-sm font-medium">Install Safari App</span>
          </button>
        </div>
      )}
    </>
  );
}
