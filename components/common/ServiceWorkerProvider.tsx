"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
// Button, Download, X are no longer needed as the banner is removed.

interface ServiceWorkerMessage {
  type: string;
  message: string;
  animal?: string;
}

// Add this type definition to fix the 'workbox' error
interface CustomWindow extends Window {
  workbox?: any;
}

declare const window: CustomWindow;

export default function ServiceWorkerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOnline, setIsOnline] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [showOfflineToast, setShowOfflineToast] = useState(false);
  const toastIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);

      if ("serviceWorker" in navigator && window.workbox !== undefined) {
        const wb = window.workbox;

        wb.addEventListener("installed", (event: { isUpdate: boolean }) => {
          if (event.isUpdate) {
            toast.success("New version available!", {
              description: "App has been updated. Please refresh.",
              action: {
                label: "Refresh",
                onClick: () => window.location.reload(),
              },
              duration: Infinity,
            });
          }
        });
      }
    }
  }, []);

  const dismissInstallPrompt = useCallback(
    (duration: "session" | "week" | "permanent" = "week") => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
      const now = new Date().getTime();
      let expiryTime: number;

      switch (duration) {
        case "week":
          expiryTime = now + 7 * 24 * 60 * 60 * 1000; // 1 week
          break;
        case "permanent":
          expiryTime = Infinity; // Dismiss permanently
          break;
        default: // session
          expiryTime = -1; // -1 indicates session storage
          break;
      }

      if (expiryTime === -1) {
        sessionStorage.setItem("installPromptDismissed", "true");
      } else {
        localStorage.setItem(
          "installPromptDismissed",
          JSON.stringify({ expiry: expiryTime })
        );
      }
    },
    []
  );

  const handleInstallClick = useCallback(async () => {
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }

    if (installPrompt && (installPrompt as any).prompt) {
      (installPrompt as any).prompt();
      const { outcome } = await (installPrompt as any).userChoice;
      if (outcome === "accepted") {
        toast.success("Installation successful!", {
          description: "Tripesa Safari is now installed on your device.",
        });
        setIsInstallable(false);
        setInstallPrompt(null);
        dismissInstallPrompt("permanent");
      } else {
        toast.info("Installation cancelled.", {
          description: "You can install the app later from the address bar.",
        });
      }
    }
  }, [installPrompt, dismissInstallPrompt]);

  const showCustomInstallPrompt = useCallback(() => {
    if (sessionStorage.getItem("installPromptDismissed")) return;

    const dismissedData = localStorage.getItem("installPromptDismissed");
    if (dismissedData) {
      try {
        const { expiry } = JSON.parse(dismissedData);
        if (new Date().getTime() < expiry) {
          return;
        }
      } catch (e) {
        console.error("Error parsing installPromptDismissed data", e);
      }
    }

    if (toastIdRef.current) return;

    setTimeout(() => {
      if (toastIdRef.current) return;

      toastIdRef.current = toast.message("Install Tripesa Safari App?", {
        description:
          "Get a faster, more reliable experience by installing our app.",
        position: "bottom-right",
        duration: Infinity,
        action: {
          label: "Install",
          onClick: () => handleInstallClick(),
        },
        cancel: {
          label: "Not Now",
          onClick: () => dismissInstallPrompt("week"),
        },
      });
    }, 8000); // Show prompt after 8 seconds
  }, [handleInstallClick, dismissInstallPrompt]);

  useEffect(() => {
    const checkPwaInstalled = async () => {
      let isInstalled = false;
      if (window.matchMedia("(display-mode: standalone)").matches) {
        isInstalled = true;
      } else if ((navigator as any).getInstalledRelatedApps) {
        const relatedApps = await (navigator as any).getInstalledRelatedApps();
        if (relatedApps.length > 0) {
          isInstalled = true;
        }
      }
      setIsPwaInstalled(isInstalled);
    };

    checkPwaInstalled();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  useEffect(() => {
    if (isInstallable && !isPwaInstalled) {
      showCustomInstallPrompt();
    }
  }, [isInstallable, isPwaInstalled, showCustomInstallPrompt]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (showOfflineToast) {
        toast.success("You are back online!", {
          position: "top-center",
          duration: 3000,
        });
        setShowOfflineToast(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineToast(true);
      toast.warning("You are currently offline.", {
        description: "Some features may not be available.",
        position: "top-center",
        duration: 5000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [showOfflineToast]);

  return <>{children}</>;
}
