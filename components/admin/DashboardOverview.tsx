"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Package,
  Image,
  Palette,
  TrendingUp,
  Eye,
  Activity,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { GoogleAnalyticsData } from "@/lib/firebase/google-analytics-service";

export default function DashboardOverview() {
  const [analyticsData, setAnalyticsData] =
    useState<GoogleAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to fetch real analytics data
  const fetchAnalytics = async () => {
    try {
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      if (!projectId) {
        throw new Error("Firebase project ID not configured");
      }

      const response = await fetch(
        `/api/analytics?projectId=${projectId}&startDate=7daysAgo&endDate=today`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      return null;
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAnalytics();
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadData();
      toast.success("Dashboard data refreshed");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = [
    {
      title: "Active Users",
      value: analyticsData?.activeUsers
        ? analyticsData.activeUsers.toLocaleString()
        : "0",
      change: "+12%",
      icon: Activity,
      href: "/admin/analytics",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      pulse: analyticsData?.activeUsers && analyticsData.activeUsers > 0,
    },
    {
      title: "Total Users",
      value: analyticsData?.totalUsers
        ? analyticsData.totalUsers.toLocaleString()
        : "0",
      change: "+5%",
      icon: Users,
      href: "/admin/analytics",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      pulse: false,
    },
    {
      title: "Page Views",
      value: analyticsData?.pageViews
        ? analyticsData.pageViews.toLocaleString()
        : "0",
      change: "+23%",
      icon: Eye,
      href: "/admin/analytics",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      pulse: false,
    },
    {
      title: "Sessions",
      value: analyticsData?.sessions
        ? analyticsData.sessions.toLocaleString()
        : "0",
      change: "+18%",
      icon: TrendingUp,
      href: "/admin/analytics",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      pulse: false,
    },
  ];

  const quickActions = [
    {
      title: "Manage Theme Colors",
      description: "Update the site's color scheme and branding",
      icon: Palette,
      href: "/admin/theme",
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      title: "Update Home Banner",
      description: "Change the main hero banner image and content",
      icon: Image,
      href: "/admin/banner",
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome to your Tripesa Safari admin dashboard. Manage your site
            configuration and content.
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {isLoading ? "..." : stat.value}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                    <stat.icon
                      className={`h-6 w-6 ${stat.color} ${
                        stat.pulse ? "animate-pulse" : ""
                      }`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-lg ${action.color} text-white`}
                    >
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Analytics dashboard updated with real-time data
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Just now
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Google Analytics integration completed
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  1 hour ago
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Dashboard dark mode styling updated
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  2 hours ago
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
