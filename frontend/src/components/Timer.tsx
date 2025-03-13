import { useEffect, useState } from 'react';
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
import { PresetSelector } from './timer/PresetSelector';
import { ActivityHeatmap } from './timer/ActivityHeatmap';
import { NotificationManager } from './timer/NotificationManager';
import { TimerPreset } from '../types';
import React from 'react';

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

  // Notification state
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Request notification permission once
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Load projects and tags only once
  useEffect(() => {
    Promise.all([
      fetchProjects(),
      fetchTags()
    ]);
  }, [fetchProjects, fetchTags]);

  // Load tasks when project changes
  useEffect(() => {
    if (projectId) {
      fetchTasks(projectId);
    }
  }, [projectId, fetchTasks]);

  // Play sound and show notification when timer completes
  useEffect(() => {
    if (progress >= 100) {
      // Show in-app notification
      setShowNotification(true);
    }
  }, [mode, progress]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  // Close notification handler
  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  // Set up time entries display
  const { timeEntries, fetchTimeEntries, isLoading: isLoadingTimeEntries } = useTimeEntryStore();
  // Extend the date range to match the heatmap display
  const [startDate] = useState(subDays(new Date(), 140)); // Match the 20 weeks in the heatmap
  const [endDate] = useState(new Date());
  const [hasLoadedEntries, setHasLoadedEntries] = useState(false);

  // Fetch time entries with better retry mechanism
  useEffect(() => {
    const loadTimeEntries = async () => {
      try {
        console.log("Fetching time entries from", format(startDate, 'yyyy-MM-dd'), "to", format(endDate, 'yyyy-MM-dd'));
        const entries = await fetchTimeEntries(undefined, undefined, startDate, endDate);
        console.log("Fetched time entries:", entries?.length);
        setHasLoadedEntries(true);
      } catch (error) {
        console.error("Error fetching time entries:", error);
        // Add a retry after 2 seconds
        setTimeout(() => {
          if (!hasLoadedEntries) {
            console.log("Retrying time entries fetch...");
            fetchTimeEntries(undefined, undefined, startDate, endDate);
          }
        }, 2000);
      }
    };
    
    loadTimeEntries();
  }, [fetchTimeEntries, startDate, endDate, hasLoadedEntries]);

  // Handle preset selection
  const handlePresetSelect = (preset: TimerPreset) => {
    setWorkDuration(preset.workDuration);
    setBreakDuration(preset.breakDuration);
    setRepetitions(preset.repetitions);
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 w-full mx-auto">
        {/* Notification Manager */}
        <NotificationManager 
          showNotification={showNotification}
          mode={mode}
          onRequestPermission={requestNotificationPermission}
          notificationPermission={notificationPermission}
          onCloseNotification={handleCloseNotification}
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

        {/* Timer Controls */}
        <TimerControls
          status={status}
          start={start}
          pause={pause}
          resume={resume}
          stop={stop}
          skipToNext={skipToNext}
          projectId={projectId}
        />

        {/* Project & Task Selection (only visible when idle) */}
        {status === 'idle' && (
          <div className="mt-6">
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
            
            {/* Timer Presets */}
            <PresetSelector onSelectPreset={handlePresetSelect} />
          </div>
        )}

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
        
        {isLoadingTimeEntries ? (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            <span className="ml-2">{t('common.loading')}</span>
          </div>
        ) : (
          <>
            {timeEntries && timeEntries.length > 0 ? (
              <ActivityHeatmap timeEntries={timeEntries} />
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                {t('timeEntries.noEntries')}
              </div>
            )}
          </>
        )}
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
