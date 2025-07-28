"use client";

import { useEffect } from "react";
import { initializeAnalytics } from "@/lib/firebase/analytics";

export default function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize Firebase Analytics only
    // Google Analytics will automatically track page views and events
    initializeAnalytics();
  }, []);

  return <>{children}</>;
}
