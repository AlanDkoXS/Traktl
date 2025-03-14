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

	const lastTickTimeRef = useRef<number | null>(null);

	// Handle the timer tick using requestAnimationFrame
	useEffect(() => {
		let animationFrameId: number;

		const updateTimer = (currentTime: number) => {
			if (status === 'running') {
				if (lastTickTimeRef.current) {
					const delta = currentTime - lastTickTimeRef.current;
					tick(delta);
				}
				lastTickTimeRef.current = currentTime;
				animationFrameId = requestAnimationFrame(updateTimer);
			} else {
				lastTickTimeRef.current = null;
			}
		};

		if (status === 'running') {
			animationFrameId = requestAnimationFrame(updateTimer);
		}

		return () => {
			cancelAnimationFrame(animationFrameId);
		};
	}, [status, tick]);

	// Calculate remaining time
	const remainingTime =
		mode === 'work'
			? infiniteMode 
				? elapsed // For infinite mode, just show elapsed time
				: Math.max(0, workDuration * 60 * 1000 - elapsed)
			: Math.max(0, breakDuration * 60 * 1000 - elapsed);

	// Format time for display (mm:ss or hh:mm:ss for longer times)
	const formatTime = (milliseconds: number): string => {
		if (infiniteMode && mode === 'work') {
			// For infinite mode, format elapsed time as hh:mm:ss
			const totalSeconds = Math.floor(milliseconds / 1000);
			const hours = Math.floor(totalSeconds / 3600);
			const minutes = Math.floor((totalSeconds % 3600) / 60);
			const seconds = totalSeconds % 60;
			return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
		} else {
			// For normal mode, format remaining time
			const totalSeconds = Math.floor(milliseconds / 1000);
			const minutes = Math.floor(totalSeconds / 60);
			const seconds = totalSeconds % 60;
			return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
		}
	};

	// Progress percentage - for infinite mode, keep it at 50%
	const progress = infiniteMode && mode === 'work'
		? 50 // Keep at middle for infinite
		: mode === 'work'
			? (elapsed / (workDuration * 60 * 1000)) * 100
			: (elapsed / (breakDuration * 60 * 1000)) * 100;

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
