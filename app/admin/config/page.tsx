"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Palette, Image } from "lucide-react";
import Link from "next/link";

export default function ConfigPage() {
  const configOptions = [
    {
      title: "Theme Colors",
      description: "Customize website color scheme and branding",
      icon: Palette,
      href: "/admin/theme",
      color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "Home Banner",
      description: "Manage hero section images and content",
      icon: Image,
      href: "/admin/banner",
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Site Configuration
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your website settings and appearance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configOptions.map((option) => (
          <Link key={option.href} href={option.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg ${option.color} flex items-center justify-center mb-4`}
                >
                  <option.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">
                  {option.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  {option.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
