import { useEffect, useRef, useCallback } from 'react'
import { useTimerStore } from '../store/timerStore'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'break'
export type TimerMode = 'work' | 'break'

export const useTimer = () => {
	// Use the timer store
	const store = useTimerStore()
	const {
		status,
		mode,
		workDuration,
		breakDuration,
		repetitions,
		currentRepetition,
		elapsed,
		projectId,
		taskId,
		notes,
		tags,
		infiniteMode,

		// Methods
		start: startTimer,
		pause: pauseTimer,
		resume: resumeTimer,
		stop: stopTimer,

		setWorkDuration,
		setBreakDuration,
		setRepetitions,
		setProjectId,
		setTaskId,
		setNotes,
		setTags,

		switchToNext,
		closeCompletionModal,
		setInfiniteMode,

		showCompletionModal,
	} = store

	const startTimeRef = useRef<Date | null>(null)
	const pausedTimeRef = useRef<number>(0)

	const getProgress = useCallback(() => {
		const totalTime =
			mode === 'break' ? breakDuration * 60 : workDuration * 60
		return ((totalTime - (totalTime - elapsed)) / totalTime) * 100
	}, [elapsed, workDuration, breakDuration, mode])

	const formatTime = useCallback(() => {
		const totalTime =
			mode === 'break' ? breakDuration * 60 : workDuration * 60
		const remaining = totalTime - elapsed

		const minutes = Math.floor(remaining / 60)
		const seconds = remaining % 60
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
	}, [elapsed, workDuration, breakDuration, mode])

	const getStatus = useCallback((): TimerStatus => {
		return status
	}, [status])

	const getMode = useCallback((): TimerMode => {
		return mode
	}, [mode])

	const start = useCallback(() => {
		if (!projectId) {
			console.error('Cannot start timer without a project')
			return
		}

		startTimer(projectId, taskId || null)

		startTimeRef.current = new Date()
		pausedTimeRef.current = 0
	}, [projectId, taskId, startTimer])

	const pause = useCallback(() => {
		pauseTimer()
		pausedTimeRef.current = elapsed
	}, [pauseTimer, elapsed])

	const resume = useCallback(() => {
		if (!projectId) {
			console.error('Cannot resume timer without a project')
			return
		}

		resumeTimer()
	}, [projectId, resumeTimer])

	const skipToNext = useCallback(() => {
		switchToNext()
	}, [switchToNext])

	const stop = useCallback(
		(shouldSave?: boolean) => {
			console.log('useTimer.stop llamado con shouldSave:', shouldSave)
			stopTimer(shouldSave)
		},
		[stopTimer],
	)

	useEffect(() => {
		if (!projectId && (status === 'running' || status === 'paused')) {
			console.log(
				'No project selected while timer is active - stopping timer',
			)
			stop()
		}
	}, [projectId, status, stop])

	return {
		status: getStatus(),
		mode: getMode(),
		progress: getProgress(),
		formattedTime: formatTime(),
		elapsed,
		infiniteElapsedTime: store.infiniteElapsedTime,

		// Timer settings
		workDuration,
		breakDuration,
		repetitions,
		currentRepetition,

		// Project related
		projectId,
		taskId,
		notes,
		tags,
		infiniteMode,
		showCompletionModal,
		closeCompletionModal,

		// Actions
		start,
		pause,
		resume,
		stop,
		skipToNext,

		// Setters
		setWorkDuration,
		setBreakDuration,
		setRepetitions,
		setProjectId,
		setTaskId,
		setNotes,
		setTags,
		setInfiniteMode,
	}
}
