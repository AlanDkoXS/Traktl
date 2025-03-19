import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in ms

// Types
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PendingRequest {
  controller: AbortController;
  timestamp: number;
}

interface RequestManagerOptions {
  cacheTime?: number;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

class RequestManager {
  private cache: Map<string, CacheItem<unknown>> = new Map();
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private defaultOptions: RequestManagerOptions = {
    cacheTime: CACHE_DURATION,
    retries: MAX_RETRIES,
    retryDelay: RETRY_DELAY,
    timeout: 30000, // 30 seconds
  };

  // Generate a cache key from request details
  private generateCacheKey(url: string, params?: Record<string, unknown>): string {
    const queryString = params ? JSON.stringify(params) : '';
    return `${url}${queryString ? `_${queryString}` : ''}`;
  }

  // Check if data is still valid in cache
  private isDataValid<T>(cacheItem: CacheItem<T> | undefined): boolean {
    if (!cacheItem) return false;
    return Date.now() < cacheItem.expiresAt;
  }

  // Get data from cache if valid
  private getFromCache<T>(cacheKey: string): T | null {
    const cacheItem = this.cache.get(cacheKey) as CacheItem<T> | undefined;
    return this.isDataValid(cacheItem) ? cacheItem!.data : null;
  }

  // Save data to cache
  private saveToCache<T>(cacheKey: string, data: T, cacheTime: number): void {
    const now = Date.now();
    this.cache.set(cacheKey, {
      data,
      timestamp: now,
      expiresAt: now + cacheTime,
    });
  }

  // Clean up expired cache items (called periodically)
  public cleanCache(): void {
    const now = Date.now();
    this.cache.forEach((item, key) => {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    });
  }

  // Clean up stale pending requests
  private cleanPendingRequests(): void {
    const now = Date.now();
    // Abort requests older than 45 seconds
    const maxAge = 45000;

    this.pendingRequests.forEach((request, key) => {
      if (now - request.timestamp > maxAge) {
        request.controller.abort();
        this.pendingRequests.delete(key);
      }
    });
  }

  // Execute a request with retries
  public async request<T>(
    config: AxiosRequestConfig,
    options?: RequestManagerOptions
  ): Promise<T> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const {
      cacheTime = CACHE_DURATION,
      retries = MAX_RETRIES,
      retryDelay = RETRY_DELAY,
      timeout = 30000,
    } = mergedOptions;

    // Clean up resources
    this.cleanPendingRequests();
    if (Math.random() < 0.1) this.cleanCache(); // 10% chance to clean cache on each request

    // Generate cache key
    const cacheKey = this.generateCacheKey(
      config.url || '',
      config.params as Record<string, unknown> || (config.data as Record<string, unknown>)
    );

    // Return cached data if available and valid
    if (config.method?.toLowerCase() === 'get') {
      const cachedData = this.getFromCache<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    // Check if a similar request is already in progress
    if (this.pendingRequests.has(cacheKey)) {
      // Abort the previous request if it's taking too long
      const pending = this.pendingRequests.get(cacheKey)!;
      if (Date.now() - pending.timestamp > 10000) { // 10 seconds
        pending.controller.abort();
        this.pendingRequests.delete(cacheKey);
      } else {
        // Wait for the first request to complete
        return new Promise<T>((resolve, reject) => {
          const checkCache = () => {
            const cachedData = this.getFromCache<T>(cacheKey);
            if (cachedData) {
              resolve(cachedData);
            } else if (!this.pendingRequests.has(cacheKey)) {
              reject(new Error('Request failed or was cancelled'));
            } else {
              setTimeout(checkCache, 100);
            }
          };
          setTimeout(checkCache, 100);
        });
      }
    }

    // Create a new abort controller for this request
    const controller = new AbortController();

    // Set up the pending request
    this.pendingRequests.set(cacheKey, {
      controller,
      timestamp: Date.now(),
    });

    // Execute the request with retries
    let attempts = 0;
    let lastError: Error | AxiosError | unknown;

    while (attempts <= retries) {
      try {
        const requestConfig = {
          ...config,
          signal: controller.signal,
          timeout: timeout,
        };

        const response: AxiosResponse<T> = await axios(requestConfig);

        // Cache successful GET responses
        if (config.method?.toLowerCase() === 'get') {
          this.saveToCache<T>(cacheKey, response.data, cacheTime);
        }

        // Clean up the pending request
        this.pendingRequests.delete(cacheKey);

        return response.data;
      } catch (error) {
        lastError = error;
        attempts++;

        const axiosError = error as AxiosError;

        // Don't retry if the request was deliberately aborted
        if (axiosError.name === 'AbortError' || axiosError.name === 'CanceledError') {
          break;
        }

        // Don't retry on certain status codes
        if (axiosError.response && [400, 401, 403, 404].includes(axiosError.response.status)) {
          break;
        }

        // If we have more retries to go, wait and then try again
        if (attempts <= retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
        }
      }
    }

    // Clean up the pending request
    this.pendingRequests.delete(cacheKey);

    throw lastError;
  }

  // Wrapper for GET requests
  public async get<T>(
    url: string,
    params?: Record<string, unknown>,
    options?: RequestManagerOptions
  ): Promise<T> {
    return this.request<T>({
      method: 'get',
      url,
      params,
    }, options);
  }

  // Wrapper for POST requests
  public async post<T>(
    url: string,
    data?: unknown,
    options?: RequestManagerOptions
  ): Promise<T> {
    return this.request<T>({
      method: 'post',
      url,
      data,
    }, options);
  }

  // Wrapper for PUT requests
  public async put<T>(
    url: string,
    data?: unknown,
    options?: RequestManagerOptions
  ): Promise<T> {
    return this.request<T>({
      method: 'put',
      url,
      data,
    }, options);
  }

  // Wrapper for DELETE requests
  public async delete<T>(
    url: string,
    options?: RequestManagerOptions
  ): Promise<T> {
    return this.request<T>({
      method: 'delete',
      url,
    }, options);
  }

  // Invalidate cache for specific endpoint
  public invalidateCache(url: string, params?: Record<string, unknown>): void {
    const cacheKey = this.generateCacheKey(url, params);
    this.cache.delete(cacheKey);
  }

  // Clear all cache
  public clearCache(): void {
    this.cache.clear();
  }

  // Abort all pending requests
  public abortAllRequests(): void {
    this.pendingRequests.forEach(request => {
      request.controller.abort();
    });
    this.pendingRequests.clear();
  }
}

// Create singleton instance
const requestManager = new RequestManager();

export default requestManager;
