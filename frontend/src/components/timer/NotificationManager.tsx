import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
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
  onCloseNotification
}: NotificationManagerProps) => {
  const { t } = useTranslation();
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  // Handle sound effects
  useEffect(() => {
    // Create audio elements for work and break sounds
    const workSound = new Audio('/sounds/work.mp3');
    const breakSound = new Audio('/sounds/break.mp3');
    
    // Preload sounds
    workSound.load();
    breakSound.load();
    
    // Set the appropriate sound based on mode
    setAudioElement(mode === 'work' ? breakSound : workSound);
    
    // Cleanup
    return () => {
      if (workSound) {
        workSound.pause();
        workSound.currentTime = 0;
      }
      if (breakSound) {
        breakSound.pause();
        breakSound.currentTime = 0;
      }
    };
  }, [mode]);
  
  // Play sound when notification shows
  useEffect(() => {
    if (showNotification && audioElement) {
      audioElement.currentTime = 0;
      audioElement.play().catch(e => console.error('Error playing sound:', e));
      
      const timeout = setTimeout(() => {
        if (audioElement) {
          audioElement.pause();
          audioElement.currentTime = 0;
        }
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [showNotification, audioElement]);

  return (
    <>
      {/* No in-app toast notification anymore */}
      
      {/* Alert modal */}
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
