"use client";

import { Suspense } from "react";
import AdminSkeleton from "@/components/admin/AdminSkeleton";
import PasswordChangeForm from "@/components/admin/PasswordChangeForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Mail, Calendar, Lock } from "lucide-react";
import { useAuth } from "@/components/common/AuthProvider";

function SettingsContent() {
  const { adminUser } = useAuth();

  if (!adminUser) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading user settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account settings and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-white">
              <User className="h-5 w-5 mr-2" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Name
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {adminUser.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Email
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {adminUser.email}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Role
              </span>
              <Badge
                variant={
                  adminUser.role === "super-admin" ? "default" : "secondary"
                }
              >
                {adminUser.role}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Status
              </span>
              <Badge variant={adminUser.isActive ? "default" : "destructive"}>
                {adminUser.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                2FA Status
              </span>
              <Badge
                variant={adminUser.twoFactorEnabled ? "default" : "secondary"}
              >
                {adminUser.twoFactorEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Last Login
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {adminUser.lastLogin
                  ? new Date(adminUser.lastLogin).toLocaleDateString()
                  : "Never"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Security Information */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-white">
              <Shield className="h-5 w-5 mr-2" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    adminUser.isActive ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-sm text-gray-900 dark:text-white">
                  Account Status: {adminUser.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    adminUser.twoFactorEnabled
                      ? "bg-green-500"
                      : "bg-yellow-500"
                  }`}
                />
                <span className="text-sm text-gray-900 dark:text-white">
                  Two-Factor Authentication:{" "}
                  {adminUser.twoFactorEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-900 dark:text-white">
                  Password: Last changed recently
                </span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Security Recommendations
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                {!adminUser.twoFactorEnabled && (
                  <li>
                    • Enable two-factor authentication for enhanced security
                  </li>
                )}
                <li>• Use a strong, unique password</li>
                <li>• Never share your credentials</li>
                <li>• Log out when using shared devices</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Change Form */}
      <PasswordChangeForm />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}
