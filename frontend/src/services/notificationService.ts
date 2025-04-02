import { create } from 'zustand'

interface NotificationState {
  showModal: boolean
  modalMessage: string
  modalType: 'work' | 'break' | 'complete'
  setShowModal: (show: boolean) => void
  setModalMessage: (message: string) => void
  setModalType: (type: 'work' | 'break' | 'complete') => void
  showNotification: (type: 'work' | 'break' | 'complete', message: string) => void
  closeNotification: () => void
}

// Audio player singleton
class AudioPlayer {
  private static instance: AudioPlayer
  private currentAudio: HTMLAudioElement | null = null
  private audioElements: Record<string, HTMLAudioElement> = {}
  private autoCloseTimeout: NodeJS.Timeout | null = null

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

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => this.cleanup())
  }

  public static getInstance(): AudioPlayer {
    if (!AudioPlayer.instance) {
      AudioPlayer.instance = new AudioPlayer()
    }
    return AudioPlayer.instance
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

// Create notification store
export const useNotificationStore = create<NotificationState>((set) => ({
  showModal: false,
  modalMessage: '',
  modalType: 'work',
  setShowModal: (show) => set({ showModal: show }),
  setModalMessage: (message) => set({ modalMessage: message }),
  setModalType: (type) => set({ modalType: type }),
  showNotification: (type, message) => {
    // Play sound
    AudioPlayer.getInstance().play(type)

    // Show modal
    set({
      showModal: true,
      modalMessage: message,
      modalType: type,
    })

    // Auto-close after 4 seconds
    AudioPlayer.getInstance().setAutoClose(() => {
      set({ showModal: false })
    }, 4000)
  },
  closeNotification: () => {
    AudioPlayer.getInstance().stop()
    set({ showModal: false })
  },
}))
