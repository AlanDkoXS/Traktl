import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTimer } from '../hooks/useTimer';
import { PlayIcon, PauseIcon, StopIcon, ForwardIcon } from '@heroicons/react/24/solid';

export const Timer = () => {
  const { t } = useTranslation();
  const {
    status,
    mode,
    formattedTime,
    progress,
    workDuration,
    breakDuration,
    repetitions,
    currentRepetition,
    
    start,
    pause,
    resume,
    stop,
    skipToNext,
    
    setWorkDuration,
    setBreakDuration,
    setRepetitions,
  } = useTimer();
  
  // Notification permission
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  
  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);
  
  // Play sound and show notification when timer completes
  useEffect(() => {
    if (progress >= 100) {
      // Play sound
      const audio = new Audio(mode === 'work' ? '/sounds/break.mp3' : '/sounds/work.mp3');
      audio.play().catch(e => console.error('Error playing sound:', e));
      
      // Show notification if permission granted
      if (notificationPermission === 'granted') {
        const title = mode === 'work' 
          ? t('timer.breakTime') 
          : t('timer.workTime');
        
        new Notification(title, {
          body: mode === 'work' 
            ? t('timer.workCompleted') 
            : t('timer.breakCompleted'),
          icon: '/favicon.ico'
        });
      }
    }
  }, [mode, progress, notificationPermission, t]);
  
  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  // Dynamic color based on mode
  const getTimerColor = () => {
    return mode === 'work' ? 'rgb(59, 130, 246)' : 'rgb(16, 185, 129)';
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {mode === 'work' ? t('timer.workTime') : t('timer.breakTime')}
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {t('timer.session')} {currentRepetition}/{repetitions}
        </div>
      </div>
      
      {/* Timer Display */}
      <div className="relative h-48 w-48 mx-auto mb-8">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
            className="dark:stroke-gray-700"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getTimerColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * progress) / 100}
            className="transform origin-center -rotate-90"
            initial={{ strokeDashoffset: 283 }}
            animate={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        
        {/* Timer text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            {formattedTime}
          </span>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex justify-center space-x-4 mb-8">
        {status === 'idle' && (
          <button
            onClick={() => start()}
            className="flex items-center justify-center p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <PlayIcon className="h-8 w-8" />
            <span className="sr-only">{t('timer.start')}</span>
          </button>
        )}
        
        {status === 'running' && (
          <>
            <button
              onClick={() => pause()}
              className="flex items-center justify-center p-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <PauseIcon className="h-8 w-8" />
              <span className="sr-only">{t('timer.pause')}</span>
            </button>
            
            <button
              onClick={() => skipToNext()}
              className="flex items-center justify-center p-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              title={t('timer.skipToNext')}
            >
              <ForwardIcon className="h-8 w-8" />
              <span className="sr-only">{t('timer.skipToNext')}</span>
            </button>
          </>
        )}
        
        {status === 'paused' && (
          <>
            <button
              onClick={() => resume()}
              className="flex items-center justify-center p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <PlayIcon className="h-8 w-8" />
              <span className="sr-only">{t('timer.resume')}</span>
            </button>
            
            <button
              onClick={() => skipToNext()}
              className="flex items-center justify-center p-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              title={t('timer.skipToNext')}
            >
              <ForwardIcon className="h-8 w-8" />
              <span className="sr-only">{t('timer.skipToNext')}</span>
            </button>
          </>
        )}
        
        {(status === 'running' || status === 'paused') && (
          <button
            onClick={() => stop()}
            className="flex items-center justify-center p-3 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <StopIcon className="h-8 w-8" />
            <span className="sr-only">{t('timer.stop')}</span>
          </button>
        )}
      </div>
      
      {/* Settings */}
      <div className="space-y-4">
        <div>
          <label htmlFor="work-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('timer.workDuration')} ({workDuration} min)
          </label>
          <input
            id="work-duration"
            type="range"
            min="1"
            max="60"
            value={workDuration}
            onChange={(e) => setWorkDuration(parseInt(e.target.value))}
            disabled={status !== 'idle'}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <div>
          <label htmlFor="break-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('timer.breakDuration')} ({breakDuration} min)
          </label>
          <input
            id="break-duration"
            type="range"
            min="1"
            max="30"
            value={breakDuration}
            onChange={(e) => setBreakDuration(parseInt(e.target.value))}
            disabled={status !== 'idle'}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <div>
          <label htmlFor="repetitions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('timer.repetitions')} ({repetitions})
          </label>
          <input
            id="repetitions"
            type="range"
            min="1"
            max="10"
            value={repetitions}
            onChange={(e) => setRepetitions(parseInt(e.target.value))}
            disabled={status !== 'idle'}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      
      {/* Notification permission */}
      {notificationPermission !== 'granted' && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {t('timer.enableNotifications')}
          </p>
          <button
            onClick={requestNotificationPermission}
            className="mt-2 text-sm bg-yellow-200 dark:bg-yellow-800 px-3 py-1 rounded-md hover:bg-yellow-300 dark:hover:bg-yellow-700"
          >
            {t('timer.allowNotifications')}
          </button>
        </div>
      )}
    </div>
  );
};
