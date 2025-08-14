"use client";

import { Suspense } from "react";
import AdminSkeleton from "@/components/admin/AdminSkeleton";
import FeaturedDestinationsManager from "@/components/admin/FeaturedDestinationsManager";

export default function FeaturedDestinationsPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <FeaturedDestinationsManager />
    </Suspense>
  );
}
