"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  RefreshCw,
  Users,
  Eye,
  TrendingUp,
  Clock,
  BarChart3,
  AlertCircle,
  Globe,
  Smartphone,
  Monitor,
  MapPin,
  Activity,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import type { GoogleAnalyticsData } from "@/lib/firebase/google-analytics-service";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export default function SimpleAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] =
    useState<GoogleAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("7daysAgo");
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Function to fetch real analytics data from Google Analytics Data API
  const fetchGoogleAnalytics = async (): Promise<GoogleAnalyticsData> => {
    try {
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      if (!projectId) {
        throw new Error("Firebase project ID not configured");
      }

      const response = await fetch(
        `/api/analytics?projectId=${projectId}&startDate=${dateRange}&endDate=today`,
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
      console.error("Error fetching Google Analytics data:", error);
      throw new Error("Unable to fetch analytics data");
    }
  };

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchGoogleAnalytics();
      setAnalyticsData(data);
      setLastUpdateTime(new Date());
    } catch (error) {
      console.error("Error loading analytics:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load analytics"
      );
      toast.error("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadAnalytics();
      toast.success("Analytics data refreshed");
    } catch (error) {
      toast.error("Failed to refresh analytics");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && !isRefreshing) {
        loadAnalytics();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isLoading, isRefreshing]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <Badge variant="secondary" className="animate-pulse">
            <Activity className="h-3 w-3 mr-1 animate-spin" />
            Loading...
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card
              key={i}
              className="animate-pulse dark:bg-gray-800 dark:border-gray-700"
            >
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <Badge variant="destructive">Error</Badge>
        </div>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span>Error: {error}</span>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please check your Google Analytics configuration and try again.
            </p>
            <Button onClick={loadAnalytics} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <Badge variant="secondary">No Data</Badge>
        </div>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <p className="text-gray-600 dark:text-gray-400">
              No analytics data available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: "Active Users",
      value: analyticsData.activeUsers,
      icon: Activity,
      description: "Currently online",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      pulse: analyticsData.activeUsers > 0,
    },
    {
      title: "Total Users",
      value: analyticsData.totalUsers,
      icon: Users,
      description: "All time users",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      pulse: false,
    },
    {
      title: "Page Views",
      value: analyticsData.pageViews,
      icon: Eye,
      description: "Total page views",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      pulse: false,
    },
    {
      title: "Sessions",
      value: analyticsData.sessions,
      icon: Clock,
      description: "User sessions",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      pulse: false,
    },
  ];

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  // Prepare chart data
  const topPagesData = analyticsData.topPages
    .slice(0, 8)
    .map((page, index) => ({
      name:
        page.pagePath.length > 20
          ? page.pagePath.substring(0, 20) + "..."
          : page.pagePath,
      views: page.pageViews,
      fullName: page.pagePath,
    }));

  const deviceData = analyticsData.deviceCategories.map((device) => ({
    name:
      device.deviceCategory.charAt(0).toUpperCase() +
      device.deviceCategory.slice(1),
    users: device.users,
    color:
      device.deviceCategory === "mobile"
        ? "#3B82F6"
        : device.deviceCategory === "desktop"
        ? "#10B981"
        : "#6B7280",
  }));

  const trafficData = analyticsData.trafficSources
    .slice(0, 6)
    .map((source, index) => ({
      name: source.source.charAt(0).toUpperCase() + source.source.slice(1),
      users: source.users,
    }));

  const engagementData = [
    {
      name: "Session Duration",
      value: analyticsData.userEngagement.averageSessionDuration,
      unit: "s",
      color: "#3B82F6",
    },
    {
      name: "Bounce Rate",
      value: analyticsData.userEngagement.bounceRate * 100,
      unit: "%",
      color: "#EF4444",
    },
    {
      name: "Pages/Session",
      value: analyticsData.userEngagement.pagesPerSession,
      unit: "",
      color: "#10B981",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Real-time data from Google Analytics • Last updated:{" "}
            {lastUpdateTime ? formatTimeAgo(lastUpdateTime) : "Never"}
            {analyticsData.activeUsers > 0 && (
              <span className="ml-2 inline-flex items-center text-green-600 dark:text-green-400">
                <Zap className="h-3 w-3 mr-1 animate-pulse" />
                Live
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            aria-label="Select date range"
          >
            <option value="1daysAgo">Last 24 hours</option>
            <option value="7daysAgo">Last 7 days</option>
            <option value="30daysAgo">Last 30 days</option>
            <option value="90daysAgo">Last 90 days</option>
          </select>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button asChild variant="outline">
            <a
              href="https://console.firebase.google.com/project/tripesa-marketplace/analytics"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Firebase Console
            </a>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {stat.description}
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
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages Chart */}
        <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.topPages.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={topPagesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="name"
                    className="text-xs"
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                  />
                  <YAxis className="text-xs" tick={{ fill: "#6B7280" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "6px",
                      color: "#F9FAFB",
                    }}
                  />
                  <Bar dataKey="views" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No page data available yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Device Categories Pie Chart */}
        <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Device Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.deviceCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="users"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "6px",
                      color: "#F9FAFB",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No device data available yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Clock className="h-5 w-5" />
              <span>Session Duration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatDuration(
                analyticsData.userEngagement.averageSessionDuration
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Average session duration
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <BarChart3 className="h-5 w-5" />
              <span>Bounce Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPercentage(analyticsData.userEngagement.bounceRate)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Single-page sessions
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <TrendingUp className="h-5 w-5" />
              <span>Pages/Session</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {analyticsData.userEngagement.pagesPerSession.toFixed(1)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Average pages per session
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources Chart */}
      <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Top Traffic Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsData.trafficSources.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={trafficData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="name"
                  className="text-xs"
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                />
                <YAxis className="text-xs" tick={{ fill: "#6B7280" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    color: "#F9FAFB",
                  }}
                />
                <Bar dataKey="users" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No traffic source data available yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top Countries */}
      {analyticsData.topCountries.length > 0 && (
        <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <MapPin className="h-5 w-5" />
              <span>Top Countries</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analyticsData.topCountries.slice(0, 6).map((country, index) => (
                <div
                  key={country.country}
                  className="flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {country.country}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {country.users.toLocaleString()} users
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
