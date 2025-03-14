import { useEffect, useRef } from 'react';
import { useTimerStore } from '../store/timerStore';
import { useTranslation } from 'react-i18next';
import { showTimerNotification } from '../utils/notifications/TimerNotifications';

export const useTimer = () => {
	const { t } = useTranslation();
	const {
		status,
		mode,
		elapsed,
		workDuration,
		breakDuration,
		repetitions,
		currentRepetition,
		projectId,
		taskId,
		notes,
		tags,
		workStartTime,
		showCompletionModal,
		closeCompletionModal,
		infiniteMode,
		selectedEntryId,
		setInfiniteMode,
		setSelectedEntryId,

		tick,
		start,
		pause,
		resume,
		stop,
		reset,
		switchToNext,

		setWorkDuration,
		setBreakDuration,
		setRepetitions,
		setProjectId,
		setTaskId,
		setNotes,
		setTags,
		createTimeEntryFromWorkSession,
	} = useTimerStore();

	const timerIntervalRef = useRef<number | null>(null);

	// Handle the timer tick using setInterval
	useEffect(() => {
		if (status === 'running') {
			// Clear any existing interval
			if (timerIntervalRef.current) {
				clearInterval(timerIntervalRef.current);
			}

			// Set up 1-second interval for the timer
			timerIntervalRef.current = window.setInterval(() => {
				tick();
			}, 1000);
		} else if (timerIntervalRef.current) {
			// Clear interval when not running
			clearInterval(timerIntervalRef.current);
			timerIntervalRef.current = null;
		}

		// Cleanup on unmount
		return () => {
			if (timerIntervalRef.current) {
				clearInterval(timerIntervalRef.current);
			}
		};
	}, [status, tick]);

	// Calculate remaining time in seconds
	const remainingTime =
		mode === 'work'
			? infiniteMode
				? 0 // For infinite mode, no remaining time
				: Math.max(0, workDuration * 60 - elapsed)
			: Math.max(0, breakDuration * 60 - elapsed);

	// Format time as mm:ss or hh:mm:ss for longer times
	const formatTime = (seconds: number): string => {
		if (infiniteMode && mode === 'work') {
			// For infinite mode, format elapsed time as hh:mm:ss
			const hours = Math.floor(seconds / 3600);
			const minutes = Math.floor((seconds % 3600) / 60);
			const secs = seconds % 60;
			return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
		} else {
			// For normal mode, format remaining time
			const minutes = Math.floor(seconds / 60);
			const secs = seconds % 60;
			return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
		}
	};

	// Progress percentage - for infinite mode, keep it at 50%
	const progress = infiniteMode && mode === 'work'
		? 50 // Keep at middle for infinite
		: mode === 'work'
			? (elapsed / (workDuration * 60)) * 100
			: (elapsed / (breakDuration * 60)) * 100;

	// Skip to next function (work -> break or break -> work)
	const skipToNext = () => {
		// Show notification before changing phase
		const notificationType = mode === 'work' ? 'break' : 'work';
		const title = mode === 'work' ? t('timer.breakTime') : t('timer.workTime');
		const body = mode === 'work' ? t('timer.workCompleted') : t('timer.breakCompleted');

		showTimerNotification(notificationType, {
			title,
			body,
			persistent: false
		});

		switchToNext();
	};

	return {
		status,
		mode,
		elapsed,
		remainingTime,
		formattedTime: infiniteMode && mode === 'work'
			? formatTime(elapsed) // Show elapsed time for infinite mode
			: formatTime(remainingTime), // Show remaining time for regular mode
		progress,
		workDuration,
		breakDuration,
		repetitions,
		currentRepetition,
		projectId,
		taskId,
		notes,
		tags,
		workStartTime,
		showCompletionModal,
		closeCompletionModal,
		infiniteMode,
		selectedEntryId,

		start,
		pause,
		resume,
		stop,
		reset,
		skipToNext,
		createTimeEntryOnCompletion: createTimeEntryFromWorkSession,
		setInfiniteMode,
		setSelectedEntryId,

		setWorkDuration,
		setBreakDuration,
		setRepetitions,
		setProjectId,
		setTaskId,
		setNotes,
		setTags,
	};
};
