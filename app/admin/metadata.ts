import type { Metadata } from "next";

// Shared metadata for admin pages to prevent SEO indexing
export const adminMetadata: Metadata = {
  title: "Admin Dashboard - Tripesa Safari",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      "max-video-preview": -1,
      "max-image-preview": "none",
      "max-snippet": -1,
    },
  },
  other: {
    "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
  },
};

export const getAdminPageMetadata = (pageTitle: string): Metadata => ({
  ...adminMetadata,
  title: `${pageTitle} - Admin Dashboard - Tripesa Safari`,
});
