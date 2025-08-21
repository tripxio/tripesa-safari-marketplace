/**
 * Request deduplication and intelligent caching
 * Prevents duplicate API calls and optimizes request patterns
 */

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

class RequestDeduplicator {
  private pendingRequests = new Map<string, PendingRequest>();
  private requestCounts = new Map<string, number>();

  /**
   * Deduplicate identical requests that are made within a short time window
   */
  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if we already have a pending request for this key
    const existing = this.pendingRequests.get(key);

    if (existing) {
      // If the request is recent (within 5 seconds), reuse it
      if (Date.now() - existing.timestamp < 5000) {
        console.debug(`🔄 Deduplicating request: ${key}`);
        return existing.promise as Promise<T>;
      } else {
        // Clean up old request
        this.pendingRequests.delete(key);
      }
    }

    // Track request frequency
    const count = this.requestCounts.get(key) || 0;
    this.requestCounts.set(key, count + 1);

    // Create new request
    const promise = requestFn();
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    try {
      const result = await promise;

      // Clean up completed request
      this.pendingRequests.delete(key);

      return result;
    } catch (error) {
      // Clean up failed request
      this.pendingRequests.delete(key);
      throw error;
    }
  }

  /**
   * Get request statistics for monitoring
   */
  getStats() {
    return {
      pendingRequests: this.pendingRequests.size,
      requestCounts: Object.fromEntries(this.requestCounts.entries()),
      totalRequests: Array.from(this.requestCounts.values()).reduce(
        (sum, count) => sum + count,
        0
      ),
    };
  }

  /**
   * Clear old data to prevent memory leaks
   */
  cleanup() {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    // Clean up old pending requests
    for (const [key, request] of this.pendingRequests.entries()) {
      if (request.timestamp < fiveMinutesAgo) {
        this.pendingRequests.delete(key);
      }
    }

    // Reset request counts periodically
    if (this.requestCounts.size > 100) {
      this.requestCounts.clear();
    }
  }
}

// Global deduplicator instance
export const requestDeduplicator = new RequestDeduplicator();

// Cleanup every 5 minutes
if (typeof window !== "undefined") {
  setInterval(() => {
    requestDeduplicator.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Create a cache key for request deduplication
 */
export function createRequestKey(
  endpoint: string,
  params?: Record<string, any>
): string {
  if (!params || Object.keys(params).length === 0) {
    return endpoint;
  }

  // Sort parameters for consistent keys
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      if (params[key] !== undefined && params[key] !== null) {
        result[key] = params[key];
      }
      return result;
    }, {} as Record<string, any>);

  return `${endpoint}:${JSON.stringify(sortedParams)}`;
}

/**
 * Intelligent request batching
 * Groups similar requests together for better performance
 */
export class RequestBatcher {
  private batches = new Map<
    string,
    {
      requests: Array<{ resolve: Function; reject: Function; params: any }>;
      timer: NodeJS.Timeout;
    }
  >();

  private batchDelay = 50; // 50ms batching window

  /**
   * Add a request to a batch
   */
  async batch<T>(
    batchKey: string,
    params: any,
    batchedRequestFn: (allParams: any[]) => Promise<T[]>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      let batch = this.batches.get(batchKey);

      if (!batch) {
        // Create new batch
        batch = {
          requests: [],
          timer: setTimeout(async () => {
            const currentBatch = this.batches.get(batchKey);
            if (!currentBatch) return;

            this.batches.delete(batchKey);

            try {
              const allParams = currentBatch.requests.map((req) => req.params);
              const results = await batchedRequestFn(allParams);

              // Resolve all requests in the batch
              currentBatch.requests.forEach((req, index) => {
                req.resolve(results[index]);
              });
            } catch (error) {
              // Reject all requests in the batch
              currentBatch.requests.forEach((req) => {
                req.reject(error);
              });
            }
          }, this.batchDelay),
        };

        this.batches.set(batchKey, batch);
      }

      // Add request to batch
      batch.requests.push({ resolve, reject, params });
    });
  }
}

export const requestBatcher = new RequestBatcher();
