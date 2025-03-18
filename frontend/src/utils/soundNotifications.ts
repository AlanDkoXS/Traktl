/**
 * Utility for managing timer notifications with improved performance
 */

// Audio player singleton to ensure only one sound plays at a time
class AudioPlayerSingleton {
	private static instance: AudioPlayerSingleton
	private currentAudio: HTMLAudioElement | null = null
	private audioElements: Record<string, HTMLAudioElement> = {}

	private constructor() {
		// Initialize sounds
		this.audioElements = {
			work: new Audio('/sounds/work.mp3'),
			break: new Audio('/sounds/break.mp3'),
			complete: new Audio('/sounds/complete.mp3'),
		}

		// Preload sounds
		Object.values(this.audioElements).forEach((audio) => {
			audio.load()
			audio.volume = 0.7
		})
	}

	public static getInstance(): AudioPlayerSingleton {
		if (!AudioPlayerSingleton.instance) {
			AudioPlayerSingleton.instance = new AudioPlayerSingleton()
		}
		return AudioPlayerSingleton.instance
	}

	public play(type: string): void {
		// Stop any currently playing audio
		this.stop()

		if (this.audioElements[type]) {
			this.currentAudio = this.audioElements[type]
			this.currentAudio.currentTime = 0

			// Play safely
			const playPromise = this.currentAudio.play()
			if (playPromise !== undefined) {
				playPromise.catch((error) => {
					console.warn('Error playing audio:', error)
				})
			}
		}
	}

	public stop(): void {
		if (this.currentAudio) {
			this.currentAudio.pause()
			this.currentAudio.currentTime = 0
			this.currentAudio = null
		}
	}

	// Clean up resources when page closes
	public cleanup(): void {
		this.stop()
		this.audioElements = {}
	}
}

// Ensure cleanup when page closes
window.addEventListener('beforeunload', () => {
	AudioPlayerSingleton.getInstance().cleanup()
})

// Notification cache
let notificationCache: Notification | null = null

// Custom notification options interface
interface TimerNotificationOptions {
	title: string
	body: string
	icon?: string
	tag?: string
	persistent?: boolean
}

/**
 * Check if notifications are supported and permission is granted
 */
export const checkNotificationPermission =
	(): NotificationPermission | null => {
		if (!('Notification' in window)) {
			console.log('This browser does not support notifications')
			return null
		}
		return Notification.permission
	}

/**
 * Request notification permission
 */
export const requestNotificationPermission =
	async (): Promise<NotificationPermission> => {
		if (!('Notification' in window)) {
			console.log('This browser does not support notifications')
			return 'denied'
		}

		try {
			const permission = await Notification.requestPermission()
			return permission
		} catch (error) {
			console.error('Error requesting notification permission:', error)
			return 'denied'
		}
	}

/**
 * Show a notification with optimization to prevent UI blocking
 */
export const showTimerNotification = (
	type: 'work' | 'break' | 'complete' | 'timeEntry',
	options: TimerNotificationOptions,
): void => {
	// Close any existing notification first (unless current is persistent)
	if (notificationCache && !options.persistent) {
		notificationCache.close()
		notificationCache = null
	}

	// Play the appropriate sound using our singleton
	const soundType = type === 'timeEntry' ? 'complete' : type
	// Use requestAnimationFrame to prevent UI blocking
	window.requestAnimationFrame(() => {
		AudioPlayerSingleton.getInstance().play(soundType)
	})

	// Show browser notification if permission is granted
	if (checkNotificationPermission() === 'granted') {
		try {
			// Using setTimeout to avoid UI thread blocking
			setTimeout(() => {
				const notification = new Notification(options.title, {
					body: options.body,
					icon: options.icon || '/favicon.ico',
					tag: options.tag || 'timer-notification',
					// No renotify property as it's not in standard NotificationOptions
					silent: true, // We're playing our own sounds
				})

				notification.onclick = () => {
					window.focus()
					notification.close()
				}

				// Auto-close after 5 seconds to prevent notification buildup
				// Unless it's a persistent notification
				if (!options.persistent) {
					setTimeout(() => {
						notification.close()
					}, 5000)
				}

				// Store notification reference for cleanup
				notificationCache = notification
			}, 0)
		} catch (error) {
			console.error('Error showing notification:', error)
		}
	}
}

export default {
	checkNotificationPermission,
	requestNotificationPermission,
	showTimerNotification,
}
