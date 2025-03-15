import { useState, useEffect, useRef } from 'react';
import { useTimerStore } from '../store/timerStore';
import { useTranslation } from 'react-i18next';
import { showTimerNotification } from '../utils/notifications/TimerNotifications';

export const useTimer = () => {
	const { t } = useTranslation();
	const {
		status,
		mode,
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

		start: storeStart,
		pause: storePause,
		resume: storeResume,
		stop: storeStop,
		reset: storeReset,
		switchToNext: storeSwitchToNext,

		setWorkDuration,
		setBreakDuration,
		setRepetitions,
		setProjectId,
		setTaskId,
		setNotes,
		setTags,
		setInfiniteMode,
		createTimeEntryFromWorkSession,
	} = useTimerStore();

	// Track our own elapsed time
	const [localElapsed, setLocalElapsed] = useState(0);
	const startTimeRef = useRef<number | null>(null);
	const intervalRef = useRef<number | null>(null);

	// Synchronize local elapsed with timer state when state changes
	useEffect(() => {
		if (status === 'running') {
			if (!startTimeRef.current) {
				startTimeRef.current = Date.now() - (localElapsed * 1000);
			}

			// Start the interval only if it doesn't exist
			if (!intervalRef.current) {
				intervalRef.current = window.setInterval(() => {
					if (startTimeRef.current) {
						const now = Date.now();
						const newElapsed = Math.floor((now - startTimeRef.current) / 1000);
						setLocalElapsed(newElapsed);
					}
				}, 100); // Update more frequently for better precision
			}
		} else {
			// Stop the interval if timer is not running
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}

			// If paused, keep the current time
			if (status === 'paused') {
				startTimeRef.current = null;
			}

			// If idle, reset the counter
			if (status === 'idle') {
				startTimeRef.current = null;
				setLocalElapsed(0);
			}
		}

		// Cleanup
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [status, localElapsed]);

	// Check if we should move to the next mode or stop the timer
	useEffect(() => {
		if (status === 'running' && !infiniteMode) {
			const totalDuration = mode === 'work' ? workDuration * 60 : breakDuration * 60;

			if (localElapsed >= totalDuration) {
				// Change to next mode or stop
				if (mode === 'work') {
					// Create time entry and switch to break
					if (projectId) {
						createTimeEntryFromWorkSession();
					}

					if (breakDuration === 0) {
						// If break duration is 0, go directly to the next work period
						if (currentRepetition < repetitions) {
							storeSwitchToNext();
							startTimeRef.current = Date.now(); // Reset the counter
							setLocalElapsed(0);
						} else {
							// All repetitions completed
							storeStop();
							showTimerNotification('complete', {
								title: 'All Sessions Completed',
								body: "Great job! You've completed all your work sessions.",
								persistent: true,
							});
						}
					} else {
						// Switch to break mode
						storeSwitchToNext();
						startTimeRef.current = Date.now(); // Reset the counter
						setLocalElapsed(0);

						showTimerNotification('break', {
							title: 'Break Time',
							body: 'Work session completed! Time for a break.',
							persistent: false,
						});
					}
				} else {
					// End of break, start new work or end
					if (currentRepetition < repetitions) {
						// Start new work period
						storeSwitchToNext();
						startTimeRef.current = Date.now(); // Reset the counter
						setLocalElapsed(0);

						showTimerNotification('work', {
							title: 'Work Time',
							body: 'Break completed! Back to work.',
							persistent: false,
						});
					} else {
						// All repetitions completed
						storeStop();
						startTimeRef.current = null;
						setLocalElapsed(0);

						showTimerNotification('complete', {
							title: 'All Sessions Completed',
							body: "Great job! You've completed all your work sessions.",
							persistent: true,
						});
					}
				}
			}
		}
	}, [localElapsed, status, mode, workDuration, breakDuration, repetitions, currentRepetition, infiniteMode, projectId, createTimeEntryFromWorkSession, storeStop, storeSwitchToNext]);

	// Wrapped functions to manipulate the timer
	const start = () => {
		storeStart();
		startTimeRef.current = Date.now();
		setLocalElapsed(0);
	};

	const pause = () => {
		storePause();
	};

	const resume = () => {
		storeResume();
		// Adjust the start time to maintain the elapsed time
		startTimeRef.current = Date.now() - (localElapsed * 1000);
	};

	const stop = () => {
		storeStop();
		startTimeRef.current = null;
		setLocalElapsed(0);
	};

	const reset = () => {
		storeReset();
		startTimeRef.current = null;
		setLocalElapsed(0);
	};

	const skipToNext = () => {
		// Handle notification locally
		const notificationType = mode === 'work' ? 'break' : 'work';
		const title = mode === 'work' ? t('timer.breakTime') : t('timer.workTime');
		const body = mode === 'work' ? t('timer.workCompleted') : t('timer.breakCompleted');

		showTimerNotification(notificationType, {
			title,
			body,
			persistent: false
		});

		// Use the store function
		storeSwitchToNext();

		// Reset the local counter
		startTimeRef.current = Date.now();
		setLocalElapsed(0);
	};

	// Calculate the remaining time or elapsed time for infinite mode
	const remainingTime =
		mode === 'work' && infiniteMode
			? 0 // For infinite mode in work mode, there's no remaining time
			: Math.max(0, (mode === 'work' ? workDuration : breakDuration) * 60 - localElapsed);

	// Format the time
	const formatTime = (seconds: number): string => {
		if (infiniteMode && mode === 'work') {
			// For infinite mode, show the elapsed time
			const hours = Math.floor(localElapsed / 3600);
			const minutes = Math.floor((localElapsed % 3600) / 60);
			const secs = localElapsed % 60;
			return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
		} else {
			// For normal mode, show the remaining time
			const minutes = Math.floor(seconds / 60);
			const secs = seconds % 60;
			return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
		}
	};

	// Calculate the progress percentage
	const progress = 
		infiniteMode && mode === 'work'
			? 50 // Fixed 50% for infinite mode to display half circle
			: Math.min(100, (localElapsed / ((mode === 'work' ? workDuration : breakDuration) * 60)) * 100);

	return {
		status,
		mode,
		elapsed: localElapsed,
		remainingTime,
		formattedTime: infiniteMode && mode === 'work'
			? formatTime(localElapsed)
			: formatTime(remainingTime),
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
		
		setWorkDuration,
		setBreakDuration,
		setRepetitions,
		setProjectId,
		setTaskId,
		setNotes,
		setTags,
	};
};
