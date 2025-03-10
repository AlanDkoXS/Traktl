import { useEffect, useRef } from 'react';
import { useTimerStore } from '../store/timerStore';

export const useTimer = () => {
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
			? Math.max(0, workDuration * 60 * 1000 - elapsed)
			: Math.max(0, breakDuration * 60 * 1000 - elapsed);

	// Format time for display (mm:ss)
	const formatTime = (milliseconds: number): string => {
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
		switchToNext();
	};

	return {
		status,
		mode,
		elapsed,
		remainingTime,
		formattedTime: formatTime(remainingTime),
		progress,
		workDuration,
		breakDuration,
		repetitions,
		currentRepetition,
		projectId,
		taskId,
		notes,
		tags,

		start,
		pause,
		resume,
		stop,
		reset,
		skipToNext,

		setWorkDuration,
		setBreakDuration,
		setRepetitions,
		setProjectId,
		setTaskId,
		setNotes,
		setTags,
	};
};
