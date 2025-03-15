import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
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
  
  // Use refs to keep stable references to audio objects across renders
  const workSoundRef = useRef<HTMLAudioElement | null>(null);
  const breakSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio elements only once
  useEffect(() => {
    // Create audio elements only if they don't exist yet
    if (!workSoundRef.current) {
      workSoundRef.current = new Audio('/sounds/work.mp3');
      workSoundRef.current.load();
    }
    
    if (!breakSoundRef.current) {
      breakSoundRef.current = new Audio('/sounds/break.mp3');
      breakSoundRef.current.load();
    }
    
    // Cleanup function
    return () => {
      // Pause and reset audio when component unmounts
      if (workSoundRef.current) {
        workSoundRef.current.pause();
        workSoundRef.current.currentTime = 0;
      }
      if (breakSoundRef.current) {
        breakSoundRef.current.pause();
        breakSoundRef.current.currentTime = 0;
      }
    };
  }, []); // Empty dependency array ensures this only runs once
  
  // Play sound when notification shows
  useEffect(() => {
    if (showNotification) {
      // Select the appropriate sound based on mode
      const audioToPlay = mode === 'work' ? breakSoundRef.current : workSoundRef.current;
      
      if (audioToPlay) {
        audioToPlay.currentTime = 0;
        audioToPlay.play().catch(e => console.error('Error playing sound:', e));
      
        const timeout = setTimeout(() => {
          if (audioToPlay) {
            audioToPlay.pause();
            audioToPlay.currentTime = 0;
          }
        }, 3000);
      
        return () => clearTimeout(timeout);
      }
    }
  }, [showNotification, mode]);

  return (
    <>
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
