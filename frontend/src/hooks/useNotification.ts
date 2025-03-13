import { useState, useEffect, useCallback } from 'react';
import soundPlayer from '../utils/soundPlayer';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  soundUrl?: string;
}

export const useNotification = () => {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  
  // Check permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);
  
  // Request permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setPermission(result);
        return result;
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'denied' as NotificationPermission;
      }
    }
    return 'denied' as NotificationPermission;
  }, []);
  
  // Show notification
  const showNotification = useCallback(
    async ({ title, body, icon = '/favicon.ico', soundUrl }: NotificationOptions) => {
      // Play sound if provided (limited to 4 seconds)
      if (soundUrl) {
        soundPlayer.play(soundUrl, 4);
      }
      
      // Show browser notification if permission granted
      if (permission === 'granted') {
        try {
          const notification = new Notification(title, {
            body,
            icon,
            silent: !!soundUrl, // Silent if we're playing our own sound
          });
          
          notification.onclick = () => {
            window.focus();
            notification.close();
          };
          
          // Auto-close after 4 seconds
          setTimeout(() => notification.close(), 4000);
          
          return true;
        } catch (error) {
          console.error('Error showing notification:', error);
          return false;
        }
      }
      
      return false;
    },
    [permission]
  );
  
  return {
    permission,
    requestPermission,
    showNotification,
  };
};
