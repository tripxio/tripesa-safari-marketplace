"use client";

import { useEffect } from "react";

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  apiTime: number;
  cacheHitRate: number;
}

export default function PerformanceMonitor() {
  useEffect(() => {
    // Monitor performance in development only
    if (process.env.NODE_ENV !== "development") return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        if (entry.entryType === "navigation") {
          const navEntry = entry as PerformanceNavigationTiming;
          console.group("🏁 Navigation Performance");
          console.log(
            "DNS Lookup:",
            navEntry.domainLookupEnd - navEntry.domainLookupStart,
            "ms"
          );
          console.log(
            "TCP Connection:",
            navEntry.connectEnd - navEntry.connectStart,
            "ms"
          );
          console.log(
            "Request:",
            navEntry.responseStart - navEntry.requestStart,
            "ms"
          );
          console.log(
            "Response:",
            navEntry.responseEnd - navEntry.responseStart,
            "ms"
          );
          console.log(
            "DOM Processing:",
            navEntry.domContentLoadedEventEnd -
              navEntry.domContentLoadedEventStart,
            "ms"
          );
          console.log(
            "Total Load Time:",
            navEntry.loadEventEnd - navEntry.navigationStart,
            "ms"
          );
          console.groupEnd();
        }

        if (entry.entryType === "resource" && entry.name.includes("/api/")) {
          console.log(
            `🌐 API Request: ${
              entry.name.split("/api/")[1]
            } - ${entry.duration.toFixed(2)}ms`
          );
        }

        if (entry.entryType === "measure") {
          console.log(
            `📏 Custom Metric: ${entry.name} - ${entry.duration.toFixed(2)}ms`
          );
        }
      });
    });

    observer.observe({
      entryTypes: ["navigation", "resource", "measure"],
    });

    // Custom timing for tours loading
    const markToursStart = () => {
      performance.mark("tours-loading-start");
    };

    const markToursEnd = () => {
      performance.mark("tours-loading-end");
      performance.measure(
        "tours-total-time",
        "tours-loading-start",
        "tours-loading-end"
      );
    };

    // Listen for tours loading events
    window.addEventListener("tours-loading-start", markToursStart);
    window.addEventListener("tours-loading-end", markToursEnd);

    // Performance summary every 30 seconds
    const performanceInterval = setInterval(() => {
      const resourceEntries = performance.getEntriesByType("resource");
      const apiCalls = resourceEntries.filter((entry) =>
        entry.name.includes("/api/")
      );

      if (apiCalls.length > 0) {
        const avgApiTime =
          apiCalls.reduce((sum, entry) => sum + entry.duration, 0) /
          apiCalls.length;
        console.log(
          `📊 Average API Response Time: ${avgApiTime.toFixed(2)}ms (${
            apiCalls.length
          } calls)`
        );
      }
    }, 30000);

    return () => {
      observer.disconnect();
      window.removeEventListener("tours-loading-start", markToursStart);
      window.removeEventListener("tours-loading-end", markToursEnd);
      clearInterval(performanceInterval);
    };
  }, []);

  return null; // This component doesn't render anything
}

// Helper functions to trigger performance events
export const markToursLoadingStart = () => {
  if (typeof window !== "undefined") {
    performance.mark("tours-loading-start");
    window.dispatchEvent(new CustomEvent("tours-loading-start"));
  }
};

export const markToursLoadingEnd = () => {
  if (typeof window !== "undefined") {
    performance.mark("tours-loading-end");
    performance.measure(
      "tours-total-time",
      "tours-loading-start",
      "tours-loading-end"
    );
    window.dispatchEvent(new CustomEvent("tours-loading-end"));
  }
};
