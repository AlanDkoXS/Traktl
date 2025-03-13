/**
 * Utility for managing timer notifications with improved performance
 */

// Cache for notification objects to prevent memory leaks
let notificationCache: Notification | null = null;

// Cache for audio elements to improve performance
const audioCache: Record<string, HTMLAudioElement> = {
  work: new Audio('/sounds/work.mp3'),
  break: new Audio('/sounds/break.mp3'),
  complete: new Audio('/sounds/complete.mp3')
};

// Pre-load audio files
Object.values(audioCache).forEach(audio => {
  audio.load();
  // Set to low volume by default to prevent loud surprises
  audio.volume = 0.7;
});

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  renotify?: boolean;
  persistent?: boolean; // For notifications that should stay until user interaction
}

/**
 * Check if notifications are supported and permission is granted
 */
export const checkNotificationPermission = (): NotificationPermission | null => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return null;
  }
  return Notification.permission;
};

/**
 * Request notification permission 
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return 'denied';
  }
  
  try {
    const permission = await Notification.permission;
    // Only request if not determined yet
    if (permission !== 'granted' && permission !== 'denied') {
      return await Notification.requestPermission();
    }
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

/**
 * Show a notification with optimization to prevent UI blocking
 */
export const showTimerNotification = (
  type: 'work' | 'break' | 'complete' | 'timeEntry',
  options: NotificationOptions
): void => {
  // Close any existing notification first (unless current is persistent)
  if (notificationCache && !options.persistent) {
    notificationCache.close();
    notificationCache = null;
  }

  // Play the appropriate sound using the cached audio element
  const audio = audioCache[type === 'timeEntry' ? 'complete' : type];
  if (audio) {
    // Reset audio to beginning if it was already playing
    audio.pause();
    audio.currentTime = 0;
    
    // Using requestAnimationFrame to prevent UI blocking
    window.requestAnimationFrame(() => {
      const playPromise = audio.play();
      // Handle promise to prevent uncaught promise errors
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Audio play failed:', error);
        });
      }
    });
  }

  // Show browser notification if permission is granted
  if (checkNotificationPermission() === 'granted') {
    try {
      // Using setTimeout to avoid UI thread blocking
      setTimeout(() => {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/favicon.ico',
          tag: options.tag || 'timer-notification',
          renotify: options.renotify || true,
          silent: true // We're playing our own sounds
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Auto-close after 5 seconds to prevent notification buildup
        // Unless it's a persistent notification
        if (!options.persistent) {
          setTimeout(() => {
            notification.close();
          }, 5000);
        }

        // Store notification reference for cleanup
        notificationCache = notification;
      }, 0);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
};

export default {
  checkNotificationPermission,
  requestNotificationPermission,
  showTimerNotification
};
