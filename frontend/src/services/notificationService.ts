import { create } from 'zustand'

interface NotificationState {
	showToast: boolean
	toastType: 'work' | 'break' | 'complete'
	setShowToast: (show: boolean) => void
	setToastType: (type: 'work' | 'break' | 'complete') => void
	showNotification: (type: 'work' | 'break' | 'complete') => void
	closeNotification: () => void
}

class AudioPlayer {
	private static instance: AudioPlayer
	private currentAudio: HTMLAudioElement | null = null
	private audioElements: Record<string, HTMLAudioElement> = {}
	private autoCloseTimeout: NodeJS.Timeout | null = null

	private constructor() {
		this.audioElements = {
			work: new Audio('/sounds/work.mp3'),
			break: new Audio('/sounds/break.mp3'),
			complete: new Audio('/sounds/complete.mp3'),
		}

		Object.values(this.audioElements).forEach((audio) => {
			audio.load()
			audio.volume = 0.7
		})

		window.addEventListener('beforeunload', () => this.cleanup())
	}

	public static getInstance(): AudioPlayer {
		if (!AudioPlayer.instance) {
			AudioPlayer.instance = new AudioPlayer()
		}
		return AudioPlayer.instance
	}

	public play(type: string): void {
		this.stop()

		if (this.audioElements[type]) {
			this.currentAudio = this.audioElements[type]
			this.currentAudio.currentTime = 0

			const playPromise = this.currentAudio.play()
			if (playPromise !== undefined) {
				playPromise.catch((error) => {
					console.warn('Error playing audio:', error)
				})
			}
		} else {
			console.warn(`Audio type "${type}" not found`)
		}
	}

	public stop(): void {
		if (this.currentAudio) {
			this.currentAudio.pause()
			this.currentAudio.currentTime = 0
			this.currentAudio = null
		}
	}

	public cleanup(): void {
		this.stop()
		if (this.autoCloseTimeout) {
			clearTimeout(this.autoCloseTimeout)
			this.autoCloseTimeout = null
		}
		this.audioElements = {}
	}

	public setAutoClose(callback: () => void, delay: number): void {
		if (this.autoCloseTimeout) {
			clearTimeout(this.autoCloseTimeout)
		}
		this.autoCloseTimeout = setTimeout(callback, delay)
	}
}

export const useNotificationStore = create<NotificationState>((set) => ({
	showToast: false,
	toastType: 'work',
	setShowToast: (show) => set({ showToast: show }),
	setToastType: (type) => set({ toastType: type }),
	showNotification: (type) => {
		AudioPlayer.getInstance().play(type)

		set({
			showToast: true,
			toastType: type,
		})

		AudioPlayer.getInstance().setAutoClose(() => {
			set({ showToast: false })
		}, 5000)
	},
	closeNotification: () => set({ showToast: false }),
}))
