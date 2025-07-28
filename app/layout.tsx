import type React from "react";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/common/ThemeProvider";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import AnimationController from "@/components/common/AnimationController";
import AnalyticsProvider from "@/components/common/AnalyticsProvider";
import AuthProvider from "@/components/common/AuthProvider";

const openSans = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tripesa Safari - Explore Africa's Finest Safaris",
  description:
    "Discover the best safari experiences in Africa with Tripesa. From gorilla trekking to Serengeti adventures, book your dream safari today.",
  keywords: [
    "safari",
    "Africa",
    "travel",
    "adventure",
    "wildlife",
    "gorilla trekking",
    "Serengeti",
    "Kilimanjaro",
    "Zanzibar",
    "Tanzania",
    "Kenya",
    "Uganda",
  ],
  authors: [{ name: "Tripesa Safari" }],
  creator: "Tripesa Safari",
  publisher: "Tripesa Safari",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://tripesa.co"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Tripesa Safari - Explore Africa's Finest Safaris",
    description:
      "Discover the best safari experiences in Africa with Tripesa. From gorilla trekking to Serengeti adventures, book your dream safari today.",
    url: "https://tripesa.co",
    siteName: "Tripesa Safari",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tripesa Safari - Explore Africa's Finest Safaris",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tripesa Safari - Explore Africa's Finest Safaris",
    description:
      "Discover the best safari experiences in Africa with Tripesa. From gorilla trekking to Serengeti adventures, book your dream safari today.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={openSans.className}>
        <AuthProvider>
          <ThemeProvider>
            <AnalyticsProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
              <AnimationController />
            </AnalyticsProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
