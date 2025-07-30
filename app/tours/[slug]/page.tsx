import { notFound } from "next/navigation";
import { getTour } from "@/lib/services/api";
import TourDetailClient from "./TourDetailClient";
import type { Metadata } from "next";

interface TourDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: TourDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const { data: tour } = await getTour(slug);

    // Prepare images for prefetching (first 3 images)
    const imagesToPrefetch =
      tour.gallery?.length > 0
        ? tour.gallery.slice(0, 3).map((img) => img.url)
        : tour.first_media
        ? [tour.first_media.url]
        : [];

    return {
      title: `${tour.title} | Tripesa Safari Marketplace`,
      description:
        tour.short_description ||
        tour.description?.replace(/<[^>]*>/g, "").substring(0, 160),
      openGraph: {
        title: tour.title,
        description:
          tour.short_description ||
          tour.description?.replace(/<[^>]*>/g, "").substring(0, 160),
        images: tour.first_media?.url ? [tour.first_media.url] : [],
      },
      other: {
        // Prefetch the first few gallery images
        ...imagesToPrefetch.reduce((acc, url, index) => {
          acc[
            `prefetch-image-${index}`
          ] = `<link rel="prefetch" href="${url}" as="image">`;
          return acc;
        }, {} as Record<string, string>),
      },
    };
  } catch {
    return {
      title: "Tour Not Found | Tripesa Safari Marketplace",
    };
  }
}

export default async function TourDetailPage({ params }: TourDetailPageProps) {
  const { slug } = await params;

  try {
    const { data: tour } = await getTour(slug);
    return <TourDetailClient tour={tour} />;
  } catch (error) {
    notFound();
  }
}
