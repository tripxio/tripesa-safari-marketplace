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
