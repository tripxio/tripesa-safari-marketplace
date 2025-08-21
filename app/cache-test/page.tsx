"use client";

import { useState, useEffect } from "react";
import { useTours, usePrefetchTours } from "@/hooks/useTours";
import { cacheMonitor } from "@/lib/cache/cache-monitor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Zap, Database } from "lucide-react";

export default function CacheTestPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const { prefetchTours } = usePrefetchTours();

  // Test basic tours fetching
  const { tours, isLoading, isError, mutate } = useTours({}, 1);

  // Test search results
  const { tours: searchTours, isLoading: isSearchLoading } = useTours(
    { query: "safari" },
    1
  );

  // Test category filtering
  const { tours: categoryTours, isLoading: isCategoryLoading } = useTours(
    { category: "wildlife" },
    1
  );

  const runCachePerformanceTest = async () => {
    setIsRunningTest(true);
    const results: any = {};

    try {
      // Test 1: Cold cache performance
      const startTime = Date.now();
      await fetch("/api/cache/health");
      results.healthCheck = Date.now() - startTime;

      // Test 2: Prefetch performance
      const prefetchStart = Date.now();
      await prefetchTours({}, 1);
      await prefetchTours({ category: "wildlife" }, 1);
      await prefetchTours({ query: "safari" }, 1);
      results.prefetchTime = Date.now() - prefetchStart;

      // Test 3: Get cache statistics
      results.cacheStats = cacheMonitor.getStats();

      // Test 4: Memory cache simulation
      const cacheTestStart = Date.now();
      for (let i = 0; i < 5; i++) {
        await mutate();
      }
      results.cacheRevalidationTime = Date.now() - cacheTestStart;

      setTestResults(results);
    } catch (error) {
      console.error("Cache test failed:", error);
      setTestResults({ error: error.message });
    } finally {
      setIsRunningTest(false);
    }
  };

  // Log cache performance on mount
  useEffect(() => {
    setTimeout(() => {
      cacheMonitor.logPerformanceSummary();
    }, 2000);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Cache Performance Test</h1>
        <p className="text-muted-foreground mb-6">
          This page tests the performance and effectiveness of our multi-layer
          caching system.
        </p>

        <Button
          onClick={runCachePerformanceTest}
          disabled={isRunningTest}
          className="mb-6"
        >
          {isRunningTest ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Run Cache Performance Test
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Basic Tours Loading Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Basic Tours Loading
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading tours...
              </div>
            ) : isError ? (
              <Badge variant="destructive">Error loading tours</Badge>
            ) : (
              <div>
                <Badge variant="default" className="mb-2">
                  Loaded {tours.length} tours
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => mutate()}
                  className="ml-2"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Refresh
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Results Test */}
        <Card>
          <CardHeader>
            <CardTitle>Search Results Cache</CardTitle>
          </CardHeader>
          <CardContent>
            {isSearchLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading search results...
              </div>
            ) : (
              <Badge variant="secondary">
                Search: {searchTours.length} safari tours
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Category Filter Test */}
        <Card>
          <CardHeader>
            <CardTitle>Category Filter Cache</CardTitle>
          </CardHeader>
          <CardContent>
            {isCategoryLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading category results...
              </div>
            ) : (
              <Badge variant="outline">
                Wildlife: {categoryTours.length} tours
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Performance Results */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults ? (
              testResults.error ? (
                <Badge variant="destructive">{testResults.error}</Badge>
              ) : (
                <div className="space-y-2">
                  <div>Health Check: {testResults.healthCheck}ms</div>
                  <div>Prefetch Time: {testResults.prefetchTime}ms</div>
                  <div>
                    Cache Revalidation: {testResults.cacheRevalidationTime}ms
                  </div>
                  {testResults.cacheStats && (
                    <div>
                      Hit Rate: {testResults.cacheStats.hitRate?.toFixed(1)}%
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="text-muted-foreground">
                Run performance test to see metrics
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cache Strategy Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Browser Cache</h4>
              <ul className="text-sm space-y-1">
                <li>• SWR client-side caching</li>
                <li>• In-memory cache (5-30 min)</li>
                <li>• Background revalidation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">CDN Cache</h4>
              <ul className="text-sm space-y-1">
                <li>• Static assets (1 year)</li>
                <li>• API responses (30 min - 2 hours)</li>
                <li>• Stale-while-revalidate</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Server Cache</h4>
              <ul className="text-sm space-y-1">
                <li>• Next.js fetch cache</li>
                <li>• Intelligent revalidation</li>
                <li>• Cache tags for invalidation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
