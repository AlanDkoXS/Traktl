import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'

const MAX_RETRIES = 3
const RETRY_DELAY = 1000
const CACHE_DURATION = 5 * 60 * 1000

interface CacheItem<T> {
	data: T
	timestamp: number
	expiresAt: number
}

interface PendingRequest {
	controller: AbortController
	timestamp: number
}

interface RequestManagerOptions {
	cacheTime?: number
	retries?: number
	retryDelay?: number
	timeout?: number
}

class RequestManager {
	private cache: Map<string, CacheItem<unknown>> = new Map()
	private pendingRequests: Map<string, PendingRequest> = new Map()
	private defaultOptions: RequestManagerOptions = {
		cacheTime: CACHE_DURATION,
		retries: MAX_RETRIES,
		retryDelay: RETRY_DELAY,
		timeout: 30000,
	}

	private generateCacheKey(
		url: string,
		params?: Record<string, unknown>,
	): string {
		const queryString = params ? JSON.stringify(params) : ''
		return `${url}${queryString ? `_${queryString}` : ''}`
	}

	private isDataValid<T>(cacheItem: CacheItem<T> | undefined): boolean {
		if (!cacheItem) return false
		return Date.now() < cacheItem.expiresAt
	}

	private getFromCache<T>(cacheKey: string): T | null {
		const cacheItem = this.cache.get(cacheKey) as CacheItem<T> | undefined
		return this.isDataValid(cacheItem) ? cacheItem!.data : null
	}

	private saveToCache<T>(cacheKey: string, data: T, cacheTime: number): void {
		const now = Date.now()
		this.cache.set(cacheKey, {
			data,
			timestamp: now,
			expiresAt: now + cacheTime,
		})
	}

	public cleanCache(): void {
		const now = Date.now()
		this.cache.forEach((item, key) => {
			if (now > item.expiresAt) {
				this.cache.delete(key)
			}
		})
	}

	private cleanPendingRequests(): void {
		const now = Date.now()
		const maxAge = 45000

		this.pendingRequests.forEach((request, key) => {
			if (now - request.timestamp > maxAge) {
				request.controller.abort()
				this.pendingRequests.delete(key)
			}
		})
	}

	public async request<T>(
		config: AxiosRequestConfig,
		options?: RequestManagerOptions,
	): Promise<T> {
		const mergedOptions = { ...this.defaultOptions, ...options }
		const {
			cacheTime = CACHE_DURATION,
			retries = MAX_RETRIES,
			retryDelay = RETRY_DELAY,
			timeout = 30000,
		} = mergedOptions

		this.cleanPendingRequests()
		if (Math.random() < 0.1) this.cleanCache()

		const cacheKey = this.generateCacheKey(
			config.url || '',
			(config.params as Record<string, unknown>) ||
				(config.data as Record<string, unknown>),
		)

		if (config.method?.toLowerCase() === 'get') {
			const cachedData = this.getFromCache<T>(cacheKey)
			if (cachedData) {
				return cachedData
			}
		}

		if (this.pendingRequests.has(cacheKey)) {
			const pending = this.pendingRequests.get(cacheKey)!
			if (Date.now() - pending.timestamp > 10000) {
				pending.controller.abort()
				this.pendingRequests.delete(cacheKey)
			} else {
				return new Promise<T>((resolve, reject) => {
					const checkCache = () => {
						const cachedData = this.getFromCache<T>(cacheKey)
						if (cachedData) {
							resolve(cachedData)
						} else if (!this.pendingRequests.has(cacheKey)) {
							reject(new Error('Request failed or was cancelled'))
						} else {
							setTimeout(checkCache, 100)
						}
					}
					setTimeout(checkCache, 100)
				})
			}
		}

		const controller = new AbortController()

		this.pendingRequests.set(cacheKey, {
			controller,
			timestamp: Date.now(),
		})

		let attempts = 0
		let lastError: Error | AxiosError | unknown

		while (attempts <= retries) {
			try {
				const requestConfig = {
					...config,
					signal: controller.signal,
					timeout: timeout,
				}

				const response: AxiosResponse<T> = await axios(requestConfig)

				if (config.method?.toLowerCase() === 'get') {
					this.saveToCache<T>(cacheKey, response.data, cacheTime)
				}

				this.pendingRequests.delete(cacheKey)

				return response.data
			} catch (error) {
				lastError = error
				attempts++

				const axiosError = error as AxiosError

				if (
					axiosError.name === 'AbortError' ||
					axiosError.name === 'CanceledError'
				) {
					break
				}

				if (
					axiosError.response &&
					[400, 401, 403, 404].includes(axiosError.response.status)
				) {
					break
				}

				if (attempts <= retries) {
					await new Promise((resolve) =>
						setTimeout(resolve, retryDelay * attempts),
					)
				}
			}
		}

		this.pendingRequests.delete(cacheKey)

		throw lastError
	}

	public async get<T>(
		url: string,
		params?: Record<string, unknown>,
		options?: RequestManagerOptions,
	): Promise<T> {
		return this.request<T>(
			{
				method: 'get',
				url,
				params,
			},
			options,
		)
	}

	public async post<T>(
		url: string,
		data?: unknown,
		options?: RequestManagerOptions,
	): Promise<T> {
		return this.request<T>(
			{
				method: 'post',
				url,
				data,
			},
			options,
		)
	}

	public async put<T>(
		url: string,
		data?: unknown,
		options?: RequestManagerOptions,
	): Promise<T> {
		return this.request<T>(
			{
				method: 'put',
				url,
				data,
			},
			options,
		)
	}

	public async delete<T>(
		url: string,
		options?: RequestManagerOptions,
	): Promise<T> {
		return this.request<T>(
			{
				method: 'delete',
				url,
			},
			options,
		)
	}

	public invalidateCache(
		url: string,
		params?: Record<string, unknown>,
	): void {
		const cacheKey = this.generateCacheKey(url, params)
		this.cache.delete(cacheKey)
	}

	public clearCache(): void {
		this.cache.clear()
	}

	public abortAllRequests(): void {
		this.pendingRequests.forEach((request) => {
			request.controller.abort()
		})
		this.pendingRequests.clear()
	}
}

const requestManager = new RequestManager()

export default requestManager
