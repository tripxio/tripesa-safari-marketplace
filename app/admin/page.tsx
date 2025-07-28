"use client";

import { Suspense } from "react";
import DashboardOverview from "@/components/admin/DashboardOverview";
import AdminSkeleton from "@/components/admin/AdminSkeleton";

// Note: This is a client component, so metadata is handled in the layout
// The layout already includes proper noindex meta tags

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <DashboardOverview />
    </Suspense>
  );
}
