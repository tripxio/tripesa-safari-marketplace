"use client";

import { Suspense } from "react";
import TwoFactorSetup from "@/components/admin/TwoFactorSetup";
import AdminSkeleton from "@/components/admin/AdminSkeleton";

export default function TwoFactorSetupPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <TwoFactorSetup />
    </Suspense>
  );
}
