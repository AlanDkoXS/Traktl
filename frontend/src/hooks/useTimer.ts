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
		isInfiniteMode,

		tick,
		start,
		pause,
		resume,
		stop,
		reset,
		switchToNext,
		setInfiniteMode,

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

	// Calculate remaining time - Si estamos en modo infinito, no hay tiempo restante
	const remainingTime = isInfiniteMode && mode === 'work' 
		? elapsed
		: mode === 'work'
			? Math.max(0, workDuration * 60 * 1000 - elapsed)
			: Math.max(0, breakDuration * 60 * 1000 - elapsed);

	// Format time for display (mm:ss)
	const formatTime = (milliseconds: number): string => {
		// En modo infinito, mostrar el tiempo transcurrido
		if (isInfiniteMode && mode === 'work') {
			const totalSeconds = Math.floor(milliseconds / 1000);
			const minutes = Math.floor(totalSeconds / 60);
			const seconds = totalSeconds % 60;
			return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
		}
		
		// Normal mode - formato tiempo restante
		const totalSeconds = Math.floor(milliseconds / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	};

	// Progress percentage
	const progress =
		mode === 'work'
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
		formattedTime: formatTime(isInfiniteMode && mode === 'work' ? elapsed : remainingTime),
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
		isInfiniteMode,

		start,
		pause,
		resume,
		stop,
		reset,
		skipToNext,
		createTimeEntryOnCompletion: createTimeEntryFromWorkSession,
		setInfiniteMode,

		setWorkDuration,
		setBreakDuration,
		setRepetitions,
		setProjectId,
		setTaskId,
		setNotes,
		setTags,
	};
};
