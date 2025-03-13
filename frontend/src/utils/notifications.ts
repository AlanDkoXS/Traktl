// Utility for managing browser notifications

/**
 * Check if browser notifications are supported
 */
export const notificationsSupported = (): boolean => {
  return 'Notification' in window;
};

/**
 * Get current notification permission
 */
export const getNotificationPermission = (): NotificationPermission | null => {
  if (!notificationsSupported()) return null;
  return Notification.permission;
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!notificationsSupported()) {
    console.warn('Notifications not supported in this browser');
    return 'denied';
  }
  
  try {
    return await Notification.requestPermission();
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

/**
 * Show a notification with sound
 */
export const showNotification = (
  title: string, 
  options: NotificationOptions & { sound?: string } = {}
): boolean => {
  if (!notificationsSupported() || Notification.permission !== 'granted') {
    return false;
  }
  
  try {
    // Extract sound from options
    const { sound, ...notificationOptions } = options;
    
    // Create notification
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      silent: !!sound, // Set to silent if we're playing our own sound
      ...notificationOptions
    });
    
    // Add click handler to focus window
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);
    
    // Play sound if provided
    if (sound) {
      try {
        const audio = new Audio(sound);
        audio.play().catch(e => console.warn('Could not play notification sound:', e));
      } catch (e) {
        console.warn('Error playing notification sound:', e);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error showing notification:', error);
    return false;
  }
};

export default {
  supported: notificationsSupported,
  getPermission: getNotificationPermission,
  requestPermission: requestNotificationPermission,
  show: showNotification
};
