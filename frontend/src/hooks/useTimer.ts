import { useState, useEffect, useRef } from 'react'
import { useTimerStore } from '../store/timerStore'
import { useTranslation } from 'react-i18next'
import { showTimerNotification } from '../utils/soundNotifications'

export const useTimer = () => {
	const { t } = useTranslation()
	const {
		status,
		mode,
		elapsed: storeElapsed,
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
	} = useTimerStore()

	// Use elapsed time directly from the store without local state
	const elapsed = storeElapsed

	// Calculate the remaining time or elapsed time for infinite mode
	const remainingTime =
		mode === 'work' && infiniteMode
			? 0 // For infinite mode in work mode, there's no remaining time
			: Math.max(
					0,
					(mode === 'work' ? workDuration : breakDuration) * 60 -
						elapsed,
				)

	// Format the time
	const formatTime = (seconds: number): string => {
		if (infiniteMode && mode === 'work') {
			// For infinite mode, show the elapsed time
			const hours = Math.floor(elapsed / 3600)
			const minutes = Math.floor((elapsed % 3600) / 60)
			const secs = elapsed % 60
			return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
		} else {
			// For normal mode, show the remaining time
			const minutes = Math.floor(seconds / 60)
			const secs = seconds % 60
			return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
		}
	}

	// Calculate the progress percentage
	const progress =
		infiniteMode && mode === 'work'
			? 50 // Fixed 50% for infinite mode to display half circle
			: Math.min(
					100,
					(elapsed /
						((mode === 'work' ? workDuration : breakDuration) *
							60)) *
						100,
				)

	return {
		status,
		mode,
		elapsed,
		remainingTime,
		formattedTime:
			infiniteMode && mode === 'work'
				? formatTime(elapsed)
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

		start: storeStart,
		pause: storePause,
		resume: storeResume,
		stop: storeStop,
		reset: storeReset,
		skipToNext: storeSwitchToNext,
		createTimeEntryOnCompletion: createTimeEntryFromWorkSession,

		setWorkDuration,
		setBreakDuration,
		setRepetitions,
		setProjectId,
		setTaskId,
		setNotes,
		setTags,
	}
}
