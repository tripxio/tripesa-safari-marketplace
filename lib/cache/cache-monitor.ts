"use client";

// Cache performance monitoring utilities
interface CacheMetrics {
  hits: number;
  misses: number;
  totalRequests: number;
  avgResponseTime: number;
  lastUpdated: Date;
}

class CacheMonitor {
  private metrics: Map<string, CacheMetrics> = new Map();
  private requestTimes: Map<string, number> = new Map();

  // Track cache hit
  recordHit(cacheKey: string, responseTime: number = 0) {
    const existing = this.metrics.get(cacheKey) || {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      avgResponseTime: 0,
      lastUpdated: new Date(),
    };

    existing.hits++;
    existing.totalRequests++;
    existing.avgResponseTime =
      (existing.avgResponseTime * (existing.totalRequests - 1) + responseTime) /
      existing.totalRequests;
    existing.lastUpdated = new Date();

    this.metrics.set(cacheKey, existing);

    if (process.env.NODE_ENV === "development") {
      console.debug(
        `📊 Cache HIT for ${cacheKey} (${responseTime}ms) - Hit rate: ${(
          (existing.hits / existing.totalRequests) *
          100
        ).toFixed(1)}%`
      );
    }
  }

  // Track cache miss
  recordMiss(cacheKey: string, responseTime: number = 0) {
    const existing = this.metrics.get(cacheKey) || {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      avgResponseTime: 0,
      lastUpdated: new Date(),
    };

    existing.misses++;
    existing.totalRequests++;
    existing.avgResponseTime =
      (existing.avgResponseTime * (existing.totalRequests - 1) + responseTime) /
      existing.totalRequests;
    existing.lastUpdated = new Date();

    this.metrics.set(cacheKey, existing);

    if (process.env.NODE_ENV === "development") {
      console.debug(
        `📊 Cache MISS for ${cacheKey} (${responseTime}ms) - Hit rate: ${(
          (existing.hits / existing.totalRequests) *
          100
        ).toFixed(1)}%`
      );
    }
  }

  // Start timing a request
  startTiming(requestId: string) {
    this.requestTimes.set(requestId, Date.now());
  }

  // End timing and get duration
  endTiming(requestId: string): number {
    const startTime = this.requestTimes.get(requestId);
    if (!startTime) return 0;

    const duration = Date.now() - startTime;
    this.requestTimes.delete(requestId);
    return duration;
  }

  // Get cache statistics
  getStats(cacheKey?: string) {
    if (cacheKey) {
      return this.metrics.get(cacheKey);
    }

    // Aggregate stats for all cache keys
    const allMetrics = Array.from(this.metrics.values());
    if (allMetrics.length === 0) {
      return null;
    }

    const totalHits = allMetrics.reduce((sum, m) => sum + m.hits, 0);
    const totalMisses = allMetrics.reduce((sum, m) => sum + m.misses, 0);
    const totalRequests = totalHits + totalMisses;
    const avgResponseTime =
      allMetrics.reduce((sum, m) => sum + m.avgResponseTime, 0) /
      allMetrics.length;

    return {
      hits: totalHits,
      misses: totalMisses,
      totalRequests,
      hitRate: totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0,
      avgResponseTime,
      cacheKeys: allMetrics.length,
    };
  }

  // Log performance summary
  logPerformanceSummary() {
    const stats = this.getStats();
    if (!stats) {
      console.log("📊 No cache metrics available");
      return;
    }

    console.group("📊 Cache Performance Summary");
    console.log(`Hit Rate: ${stats.hitRate.toFixed(1)}%`);
    console.log(`Total Requests: ${stats.totalRequests}`);
    console.log(`Cache Hits: ${stats.hits}`);
    console.log(`Cache Misses: ${stats.misses}`);
    console.log(`Avg Response Time: ${stats.avgResponseTime.toFixed(1)}ms`);
    console.log(`Active Cache Keys: ${stats.cacheKeys}`);
    console.groupEnd();
  }

  // Clear old metrics to prevent memory leaks
  cleanup() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    for (const [key, metrics] of this.metrics.entries()) {
      if (metrics.lastUpdated < oneHourAgo) {
        this.metrics.delete(key);
      }
    }
  }
}

// Global cache monitor instance
export const cacheMonitor = new CacheMonitor();

// Enhanced fetch wrapper with cache monitoring
export async function monitoredFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const requestId = `${url}-${Date.now()}`;
  cacheMonitor.startTiming(requestId);

  try {
    const response = await fetch(url, options);
    const responseTime = cacheMonitor.endTiming(requestId);

    // Determine if this was a cache hit based on response headers
    const cacheStatus =
      response.headers.get("cf-cache-status") ||
      response.headers.get("x-cache") ||
      response.headers.get("cache-control");

    const wasCacheHit =
      cacheStatus?.includes("HIT") ||
      response.headers.get("x-cache-hit") === "true";

    if (wasCacheHit) {
      cacheMonitor.recordHit(url, responseTime);
    } else {
      cacheMonitor.recordMiss(url, responseTime);
    }

    return response;
  } catch (error) {
    cacheMonitor.endTiming(requestId);
    throw error;
  }
}

// Cleanup old metrics every 30 minutes
if (typeof window !== "undefined") {
  setInterval(() => {
    cacheMonitor.cleanup();
  }, 30 * 60 * 1000);

  // Log performance summary every 5 minutes in development
  if (process.env.NODE_ENV === "development") {
    setInterval(() => {
      cacheMonitor.logPerformanceSummary();
    }, 5 * 60 * 1000);
  }
}
