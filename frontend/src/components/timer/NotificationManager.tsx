import { useTranslation } from 'react-i18next';
import { useRef, useEffect } from 'react';
import { TimerAlertModal } from './TimerAlertModal';

interface NotificationManagerProps {
  showNotification: boolean;
  mode: 'work' | 'break';
  onRequestPermission: () => void;
  notificationPermission: NotificationPermission | null;
  onCloseNotification: () => void;
}

export const NotificationManager = ({ 
  showNotification, 
  mode, 
  onRequestPermission,
  notificationPermission,
  onCloseNotification
}: NotificationManagerProps) => {
  const { t } = useTranslation();
  const workAudioRef = useRef<HTMLAudioElement | null>(null);
  const breakAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio elements
  useEffect(() => {
    workAudioRef.current = new Audio('/sounds/work.mp3');
    breakAudioRef.current = new Audio('/sounds/break.mp3');
    
    return () => {
      if (workAudioRef.current) {
        workAudioRef.current.pause();
        workAudioRef.current = null;
      }
      if (breakAudioRef.current) {
        breakAudioRef.current.pause();
        breakAudioRef.current = null;
      }
    };
  }, []);
  
  // Play sound when notification shows
  useEffect(() => {
    if (showNotification) {
      if (mode === 'work' && breakAudioRef.current) {
        breakAudioRef.current.currentTime = 0;
        breakAudioRef.current.play().catch(e => console.error('Error playing break sound:', e));
      } else if (mode === 'break' && workAudioRef.current) {
        workAudioRef.current.currentTime = 0;
        workAudioRef.current.play().catch(e => console.error('Error playing work sound:', e));
      }
      
      // Stop audio after 4 seconds
      const timeout = setTimeout(() => {
        if (breakAudioRef.current) breakAudioRef.current.pause();
        if (workAudioRef.current) workAudioRef.current.pause();
      }, 4000);
      
      return () => clearTimeout(timeout);
    }
  }, [showNotification, mode]);

  return (
    <>
      {/* In-app notification alert */}
      {showNotification && (
        <div className={`mb-4 p-3 rounded-md text-white text-center transition-all ${
          mode === 'work' 
            ? 'bg-green-500' 
            : 'bg-blue-500'
        }`}>
          <p className="font-medium">
            {mode === 'work' 
              ? t('timer.workCompleted') 
              : t('timer.breakCompleted')}
          </p>
        </div>
      )}

      {/* Notification permission */}
      {notificationPermission !== 'granted' && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {t('timer.enableNotifications')}
          </p>
          <button
            onClick={onRequestPermission}
            className="mt-2 text-sm bg-yellow-200 dark:bg-yellow-800 px-3 py-1 rounded-md hover:bg-yellow-300 dark:hover:bg-yellow-700"
          >
            {t('timer.allowNotifications')}
          </button>
        </div>
      )}
      
      {/* Modal notification */}
      <TimerAlertModal
        isOpen={showNotification}
        message={mode === 'work' ? t('timer.workCompleted') : t('timer.breakCompleted')}
        type={mode}
        onClose={onCloseNotification}
        autoCloseDelay={4000}
      />
    </>
  );
};
