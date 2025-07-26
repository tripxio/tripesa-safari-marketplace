"use client";

import { Suspense } from "react";
import BannerManager from "@/components/admin/BannerManager";
import AdminSkeleton from "@/components/admin/AdminSkeleton";

export default function BannerPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <BannerManager />
    </Suspense>
  );
}
