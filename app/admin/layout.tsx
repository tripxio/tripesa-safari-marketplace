"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Head from "next/head";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/components/common/AuthProvider";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, adminUser, loading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Skip authentication for login page
  const isLoginPage = pathname === "/admin/login";

  // Add SEO protection meta tags for all admin pages
  useEffect(() => {
    // Create meta tags to prevent indexing
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) {
      metaRobots.setAttribute(
        "content",
        "noindex, nofollow, noarchive, nosnippet, noimageindex"
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "robots";
      meta.content = "noindex, nofollow, noarchive, nosnippet, noimageindex";
      document.head.appendChild(meta);
    }

    // Add additional meta tags
    const metaGooglebot = document.querySelector('meta[name="googlebot"]');
    if (metaGooglebot) {
      metaGooglebot.setAttribute(
        "content",
        "noindex, nofollow, noarchive, nosnippet, noimageindex"
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "googlebot";
      meta.content = "noindex, nofollow, noarchive, nosnippet, noimageindex";
      document.head.appendChild(meta);
    }

    // Update page title to indicate private area
    document.title = isLoginPage
      ? "Admin Login - Tripesa Safari"
      : "Admin Dashboard - Tripesa Safari";

    return () => {
      // Cleanup meta tags if needed (though admin pages should not be publicly accessible)
    };
  }, [pathname, isLoginPage]);

  // Handle authentication state changes
  useEffect(() => {
    if (isLoginPage) {
      return;
    }

    if (!loading) {
      if (!user || !adminUser) {
        setAuthError("Authentication required. Please log in.");
        router.replace("/admin/login");
      } else {
        setAuthError(null);
      }
    }
  }, [user, adminUser, loading, isLoginPage, router]);

  // For login page, render without AdminLayout wrapper
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading admin panel...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (authError || !user || !adminUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-8 w-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5C3.544 20.333 4.506 22 6.046 22z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {authError || "Please log in to access the admin panel"}
          </p>
          <button
            onClick={() => (window.location.href = "/admin/login")}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Render with AdminLayout wrapper
  return <AdminLayout currentUser={adminUser}>{children}</AdminLayout>;
}
