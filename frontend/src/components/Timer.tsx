import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTimer } from '../hooks/useTimer';
import { useTimeEntryStore } from '../store/timeEntryStore';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { useTagStore } from '../store/tagStore';
import { format, subDays } from 'date-fns';
import { TimeEntryList } from './TimeEntryList';
import { TimerDisplay } from './timer/TimerDisplay';
import { TimerControls } from './timer/TimerControls';
import { TimerSettings } from './timer/TimerSettings';
import { ProjectTaskSelector } from './timer/ProjectTaskSelector';
import { ActivityHeatmap } from './timer/ActivityHeatmap';
import { NotificationManager } from './timer/NotificationManager';

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
    projectId,
    taskId,
    notes,
    tags: selectedTags,

    start,
    pause,
    resume,
    stop,
    skipToNext,

    setWorkDuration,
    setBreakDuration,
    setRepetitions,
    setProjectId,
    setTaskId,
    setNotes,
    setTags,
  } = useTimer();

  // Get projects, tasks and tags
  const { projects, fetchProjects } = useProjectStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { tags, fetchTags } = useTagStore();

  // Load projects and tags only once
  useEffect(() => {
    Promise.all([
      fetchProjects(),
      fetchTags()
    ]);
    // Dependency array incluye fetchProjects y fetchTags, que no deberían cambiar
  }, [fetchProjects, fetchTags]);

  // Load tasks when project changes
  useEffect(() => {
    if (projectId) {
      fetchTasks(projectId);
    }
  }, [projectId, fetchTasks]); // Solo se ejecuta cuando projectId cambia

  // Audio references
  const workAudioRef = useRef<HTMLAudioElement | null>(null);
  const breakAudioRef = useRef<HTMLAudioElement | null>(null);

  // Notification state
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Initialize audio elements once
  useEffect(() => {
    workAudioRef.current = new Audio('/sounds/work.mp3');
    breakAudioRef.current = new Audio('/sounds/break.mp3');
    
    return () => {
      workAudioRef.current = null;
      breakAudioRef.current = null;
    };
  }, []); // Solo se ejecuta una vez

  // Request notification permission once
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []); // Solo se ejecuta una vez

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
  }, [mode, progress, notificationPermission, t]); // Dependencias correctas

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  // Set up time entries display
  const { timeEntries, fetchTimeEntries } = useTimeEntryStore();
  const [startDate] = useState(subDays(new Date(), 28));
  const [endDate] = useState(new Date());

  // Fetch time entries only once
  useEffect(() => {
    const controller = new AbortController();
    fetchTimeEntries(undefined, undefined, startDate, endDate);
    return () => controller.abort();
  }, [fetchTimeEntries, startDate, endDate]); // Dependencias correctas

  return (
    <div className="flex flex-col space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 w-full mx-auto">
        {/* Notification Manager */}
        <NotificationManager 
          showNotification={showNotification}
          mode={mode}
          onRequestPermission={requestNotificationPermission}
          notificationPermission={notificationPermission}
        />

        <div className="text-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'work' ? t('timer.workTime') : t('timer.breakTime')}
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('timer.session')} {currentRepetition}/{repetitions}
          </div>
        </div>

        {/* Timer Display */}
        <TimerDisplay 
          progress={progress} 
          formattedTime={formattedTime} 
          mode={mode} 
        />

        {/* Project & Task Selection (only visible when idle) */}
        {status === 'idle' && (
          <div className="mb-6">
            <ProjectTaskSelector
              projects={projects}
              tasks={tasks}
              tags={tags}
              projectId={projectId}
              taskId={taskId}
              notes={notes}
              selectedTags={selectedTags}
              setProjectId={setProjectId}
              setTaskId={setTaskId}
              setNotes={setNotes}
              setSelectedTags={setTags}
            />
          </div>
        )}

        {/* Controls */}
        <TimerControls
          status={status}
          start={start}
          pause={pause}
          resume={resume}
          stop={stop}
          skipToNext={skipToNext}
          projectId={projectId}
        />

        {/* Settings */}
        <TimerSettings
          workDuration={workDuration}
          breakDuration={breakDuration}
          repetitions={repetitions}
          status={status}
          setWorkDuration={setWorkDuration}
          setBreakDuration={setBreakDuration}
          setRepetitions={setRepetitions}
        />
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('dashboard.activityHeatmap')}
        </h3>
        <ActivityHeatmap timeEntries={timeEntries || []} />
      </div>

      {/* Recent Time Entries */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('dashboard.recentEntries')}
        </h3>
        <TimeEntryList 
          limit={5}
        />
      </div>
    </div>
  );
};
