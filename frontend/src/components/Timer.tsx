import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTimer } from '../hooks/useTimer';
import { PlayIcon, PauseIcon, StopIcon, ForwardIcon } from '@heroicons/react/24/solid';
import { TimeEntryList } from './TimeEntryList';
import { useTimeEntryStore } from '../store/timeEntryStore';
import { format, subDays, parseISO, addDays, startOfWeek, startOfMonth, getDay } from 'date-fns';

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

  // Audio references
  const workAudioRef = useRef<HTMLAudioElement | null>(null);
  const breakAudioRef = useRef<HTMLAudioElement | null>(null);

  // Notification state
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Initialize audio elements
  useEffect(() => {
    workAudioRef.current = new Audio('/sounds/work.mp3');
    breakAudioRef.current = new Audio('/sounds/break.mp3');
    
    return () => {
      workAudioRef.current = null;
      breakAudioRef.current = null;
    };
  }, []);

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
      if (mode === 'work') {
        breakAudioRef.current?.play().catch(e => console.error('Error playing break sound:', e));
      } else {
        workAudioRef.current?.play().catch(e => console.error('Error playing work sound:', e));
      }

      // Show notification if permission granted
      if (notificationPermission === 'granted') {
        const title = mode === 'work' ? t('timer.breakTime') : t('timer.workTime');
        const body = mode === 'work' ? t('timer.workCompleted') : t('timer.breakCompleted');

        try {
          const notification = new Notification(title, {
            body,
            icon: '/favicon.ico',
            silent: true, // We're playing our own sounds
          });

          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        } catch (e) {
          console.error('Notification error:', e);
        }
      }

      // Show in-app notification
      setShowNotification(true);
      
      // Auto-hide notification after 5 seconds
      const timeout = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      
      return () => clearTimeout(timeout);
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

  // Set up time entries display
  const { timeEntries, fetchTimeEntries } = useTimeEntryStore();
  const [startDate] = useState<string>(format(subDays(new Date(), 28), 'yyyy-MM-dd'));
  const [endDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    fetchTimeEntries(
      undefined, 
      undefined, 
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
  }, [fetchTimeEntries, startDate, endDate]);

  return (
    <div className="flex flex-col space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 w-full mx-auto">
        {/* In-app notification */}
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

        <div className="text-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'work' ? t('timer.workTime') : t('timer.breakTime')}
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('timer.session')} {currentRepetition}/{repetitions}
          </div>
        </div>

        {/* Timer Display */}
        <div className="relative h-36 w-36 sm:h-48 sm:w-48 mx-auto mb-6">
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
            <span className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {formattedTime}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4 mb-6">
          {status === 'idle' && (
            <button
              onClick={() => start()}
              className="flex items-center justify-center p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md m-2"
            >
              <PlayIcon className="h-8 w-8" />
              <span className="sr-only">{t('timer.start')}</span>
            </button>
          )}

          {status === 'running' && (
            <>
              <button
                onClick={() => pause()}
                className="flex items-center justify-center p-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-md m-2"
              >
                <PauseIcon className="h-8 w-8" />
                <span className="sr-only">{t('timer.pause')}</span>
              </button>

              <button
                onClick={() => skipToNext()}
                className="flex items-center justify-center p-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-md m-2"
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
                className="flex items-center justify-center p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md m-2"
              >
                <PlayIcon className="h-8 w-8" />
                <span className="sr-only">{t('timer.resume')}</span>
              </button>

              <button
                onClick={() => skipToNext()}
                className="flex items-center justify-center p-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-md m-2"
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
              className="flex items-center justify-center p-3 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md m-2"
            >
              <StopIcon className="h-8 w-8" />
              <span className="sr-only">{t('timer.stop')}</span>
            </button>
          )}
        </div>

        {/* Settings */}
        <div className="space-y-4 mt-6">
          <div>
            <label
              htmlFor="work-duration"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
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
            <label
              htmlFor="break-duration"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
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
            <label
              htmlFor="repetitions"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
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

      {/* Activity Heatmap */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('dashboard.activityHeatmap')}
        </h3>
        <ActivityHeatmap timeEntries={timeEntries} />
      </div>

      {/* Recent Time Entries */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('dashboard.recentEntries')}
        </h3>
        {timeEntries.length > 0 ? (
          <TimeEntryList 
            startDate={startDate ? new Date(startDate) : undefined}
            endDate={endDate ? new Date(endDate) : undefined} 
          />
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            {t('timeEntries.noEntries')}
          </p>
        )}
      </div>
    </div>
  );
};

// Activity Heatmap component (similar to GitHub's contribution graph)
const ActivityHeatmap = ({ timeEntries }) => {
  const { t } = useTranslation();
  const daysTranslation = {
    0: t('dashboard.days.sun'),
    1: t('dashboard.days.mon'),
    2: t('dashboard.days.tue'),
    3: t('dashboard.days.wed'),
    4: t('dashboard.days.thu'),
    5: t('dashboard.days.fri'),
    6: t('dashboard.days.sat')
  };
  
  // Generate 4 weeks of calendar grid (28 days)
  const generateCalendarGrid = () => {
    const today = new Date();
    const result = [];
    
    // Start from 4 weeks ago, aligned to the start of the week
    const start = startOfWeek(subDays(today, 28));
    
    // Generate 4 weeks (28 days)
    for (let i = 0; i < 28; i++) {
      const date = addDays(start, i);
      result.push({
        date,
        dateString: format(date, 'yyyy-MM-dd'),
        dayOfWeek: getDay(date),
        activity: 0
      });
    }
    
    return result;
  };
  
  // Calculate activity data
  const getActivityData = () => {
    const calendarGrid = generateCalendarGrid();
    
    // Map timeEntries to days
    timeEntries.forEach(entry => {
      const entryDate = format(new Date(entry.startTime), 'yyyy-MM-dd');
      const day = calendarGrid.find(d => d.dateString === entryDate);
      
      if (day) {
        day.activity += entry.duration / (1000 * 60); // Convert ms to minutes
      }
    });
    
    return calendarGrid;
  };
  
  const calendarData = getActivityData();
  
  // Get maximum activity for scaling
  const maxActivity = Math.max(...calendarData.map(d => d.activity), 60); // Minimum max of 60 min
  
  // Get color based on activity level
  const getActivityColor = (minutes) => {
    if (minutes === 0) return 'bg-gray-100 dark:bg-gray-700';
    
    const level = Math.min(Math.floor((minutes / maxActivity) * 4), 3);
    
    const colors = [
      'bg-green-100 dark:bg-green-900',
      'bg-green-300 dark:bg-green-700',
      'bg-green-500 dark:bg-green-500',
      'bg-green-700 dark:bg-green-300'
    ];
    
    return colors[level];
  };
  
  // Group by weeks
  const weeks = [];
  for (let i = 0; i < 4; i++) {
    weeks.push(calendarData.slice(i * 7, (i + 1) * 7));
  }
  
  return (
    <div>
      {/* Day headers */}
      <div className="flex mb-1">
        {[0, 1, 2, 3, 4, 5, 6].map(day => (
          <div key={day} className="w-8 h-8 flex-shrink-0 text-xs text-center text-gray-500 dark:text-gray-400">
            {daysTranslation[day]}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={`week-${weekIndex}`} className="flex">
            {week.map((day) => (
              <div 
                key={day.dateString}
                className={`w-8 h-8 flex-shrink-0 m-0.5 rounded ${getActivityColor(day.activity)}`}
                title={`${format(day.date, 'MMM d')}: ${Math.round(day.activity)} min`}
              />
            ))}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end mt-4 text-xs text-gray-500 dark:text-gray-400">
        <span>{t('dashboard.less')}</span>
        <div className="flex mx-2 space-x-1">
          <div className="h-3 w-3 bg-gray-100 dark:bg-gray-700 rounded"></div>
          <div className="h-3 w-3 bg-green-100 dark:bg-green-900 rounded"></div>
          <div className="h-3 w-3 bg-green-300 dark:bg-green-700 rounded"></div>
          <div className="h-3 w-3 bg-green-500 dark:bg-green-500 rounded"></div>
          <div className="h-3 w-3 bg-green-700 dark:bg-green-300 rounded"></div>
        </div>
        <span>{t('dashboard.more')}</span>
      </div>
    </div>
  );
};
