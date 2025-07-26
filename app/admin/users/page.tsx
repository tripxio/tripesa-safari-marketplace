"use client";

import { Suspense } from "react";
import AdminUserManager from "@/components/admin/AdminUserManager";
import AdminSkeleton from "@/components/admin/AdminSkeleton";

export default function UsersPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <AdminUserManager />
    </Suspense>
  );
}
