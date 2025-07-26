"use client";

import { Suspense } from "react";
import ThemeColorManager from "@/components/admin/ThemeColorManager";
import AdminSkeleton from "@/components/admin/AdminSkeleton";

export default function ThemePage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <ThemeColorManager />
    </Suspense>
  );
}
