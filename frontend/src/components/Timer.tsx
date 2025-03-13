import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTimer } from '../hooks/useTimer';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { useTagStore } from '../store/tagStore';
import { TimeEntryList } from './TimeEntryList';
import { TimerDisplay } from './timer/TimerDisplay';
import { TimerControls } from './timer/TimerControls';
import { TimerSettings } from './timer/TimerSettings';
import { ProjectTaskSelector } from './timer/ProjectTaskSelector';
import { PresetSelector } from './timer/PresetSelector';
import { ActivityHeatmap } from './timer/ActivityHeatmap';
import { NotificationManager } from './timer/NotificationManager';
import { TimerPreset } from '../types';
import { useTimeEntryStore } from '../store/timeEntryStore';
import { requestNotificationPermission, checkNotificationPermission } from '../utils/notifications/TimerNotifications';
import { ConfirmModal } from './ui/ConfirmModal';
import { useTimerStore } from '../store/timerStore';

export const Timer = () => {
  const { t } = useTranslation();
  const {
    status,
    mode,
    formattedTime,
    progress,
    elapsed,
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
  
  const { showCompletionModal, closeCompletionModal } = useTimerStore();

  // State hooks
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  
  // Request notification permission once
  useEffect(() => {
    const checkPermission = async () => {
      const permission = checkNotificationPermission();
      setNotificationPermission(permission);
    };
    
    checkPermission();
  }, []);

  // Play sound and show notification when timer completes
  useEffect(() => {
    if (progress >= 100) {
      // Show in-app notification
      setShowNotification(true);
    }
  }, [mode, progress]);

  // Request notification permission
  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
  };

  // Close notification handler
  const handleCloseNotification = () => {
    setShowNotification(false);
  };

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
          onRequestPermission={handleRequestPermission}
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
          elapsed={elapsed}
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
        <ActivityHeatmap />
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

      {/* Sessions completed modal */}
      <ConfirmModal
        isOpen={showCompletionModal}
        title={t('timer.sessionsCompleted', 'Sessions Completed')}
        message={t('timer.allSessionsCompleted', "Great job! You've completed all your work sessions.")}
        confirmButtonText={t('common.done')}
        cancelButtonText=""
        onConfirm={closeCompletionModal}
        onCancel={closeCompletionModal}
        isLoading={false}
        danger={false}
      />
    </div>
  );
};
