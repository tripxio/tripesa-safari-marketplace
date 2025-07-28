"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Plus, Filter, Search } from "lucide-react";

export default function ToursPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tours Management
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage tour packages, pricing, and availability.
        </p>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
          🚧 Coming Soon
        </h3>
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Tour management features are currently in development. This will
          include:
        </p>
        <ul className="text-sm text-yellow-800 dark:text-yellow-200 mt-2 space-y-1">
          <li>• Create and edit tour packages</li>
          <li>• Manage pricing and availability</li>
          <li>• Upload tour images and descriptions</li>
          <li>• Set booking parameters</li>
          <li>• Manage tour categories and tags</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-gray-900 dark:text-white">
              Add New Tour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Create new tour packages with detailed information and pricing.
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-gray-900 dark:text-white">
              Manage Tours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Edit existing tours, update pricing, and manage availability.
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
              <Filter className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-gray-900 dark:text-white">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Organize tours by categories, destinations, and difficulty levels.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
