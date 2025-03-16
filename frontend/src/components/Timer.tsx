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
import {
	requestNotificationPermission,
	checkNotificationPermission,
} from '../utils/soundNotifications';
import { ConfirmModal } from './ui/ConfirmModal';
import { useTimerStore } from '../store/timerStore';
import { setProjectColor } from '../utils/dynamicColors';

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
		infiniteMode,

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
	const { projects } = useProjectStore();
	const { fetchTimeEntries } = useTimeEntryStore(); // Import fetchTimeEntries

	// State hooks
	const [notificationPermission, setNotificationPermission] =
		useState<NotificationPermission | null>(null);
	const [showNotification, setShowNotification] = useState(false);

	// Request notification permission once
	useEffect(() => {
		const checkPermission = async () => {
			const permission = checkNotificationPermission();
			setNotificationPermission(permission);
		};

		checkPermission();
	}, []);

	// Apply project color when project changes
	useEffect(() => {
		if (projectId) {
			const project = projects.find((p) => p.id === projectId);
			if (project?.color) {
				setProjectColor(project.color);
			}
		}
	}, [projectId, projects]);

	// Listen for time entry creation event to refresh the list
	useEffect(() => {
		const handleTimeEntryCreated = () => {
			fetchTimeEntries();
		};

		window.addEventListener('time-entry-created', handleTimeEntryCreated);
		return () => {
			window.removeEventListener('time-entry-created', handleTimeEntryCreated);
		};
	}, [fetchTimeEntries]);

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

	// Current timer settings to pass to preset creator
	const currentSettings = {
		workDuration,
		breakDuration,
		repetitions,
	};

	return (
		<div className="flex flex-col space-y-6 dashboard-timer">
			<div className="bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
				{/* Notification Manager */}
				<NotificationManager
					showNotification={showNotification}
					mode={mode}
					onRequestPermission={handleRequestPermission}
					notificationPermission={notificationPermission}
					onCloseNotification={handleCloseNotification}
				/>

				<div className="text-center mb-4">
					<h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white dynamic-color">
						{mode === 'work' ? t('timer.workTime') : t('timer.breakTime')}
					</h2>
					<div className="text-sm text-gray-500 dark:text-gray-400">
						{infiniteMode ? (
							<span className="flex items-center justify-center">
								{t('timer.infiniteMode')}
							</span>
						) : (
							<>
								{t('timer.session')} {currentRepetition}/{repetitions}
							</>
						)}
					</div>
				</div>

				{/* Timer Display */}
				<TimerDisplay
					progress={progress}
					formattedTime={formattedTime}
					mode={mode}
					isInfiniteMode={infiniteMode}
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
					infiniteMode={infiniteMode}
					mode={mode}
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
						<PresetSelector
							onSelectPreset={handlePresetSelect}
							currentSettings={currentSettings}
						/>
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
			<div className="bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
				<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 dynamic-color">
					{t('dashboard.activityHeatmap')}
				</h3>
				<ActivityHeatmap />
			</div>

			{/* Recent Time Entries */}
			<div className="bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
				<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 dynamic-color">
					{t('dashboard.recentEntries')}
				</h3>
				<TimeEntryList limit={5} />
			</div>

			{/* Sessions completed modal */}
			<ConfirmModal
				isOpen={showCompletionModal}
				title={t('timer.sessionsCompleted', 'Sessions Completed')}
				message={t(
					'timer.allSessionsCompleted',
					"Great job! You've completed all your work sessions."
				)}
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
