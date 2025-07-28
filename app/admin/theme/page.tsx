"use client";

import { Suspense } from "react";
import UnderConstructionModal from "@/components/admin/UnderConstructionModal";
import AdminSkeleton from "@/components/admin/AdminSkeleton";

export default function ThemePage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <UnderConstructionModal />
    </Suspense>
  );
}
