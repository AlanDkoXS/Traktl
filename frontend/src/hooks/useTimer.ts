import { useEffect, useRef, useCallback } from 'react'
import { useTimerStore } from '../store/timerStore'

// Define specific types for timer states
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

	// Get the TimeEntryStore

	// Local refs to track timer state
	const startTimeRef = useRef<Date | null>(null)
	const pausedTimeRef = useRef<number>(0)

	// Calculate progress percentage
	const getProgress = useCallback(() => {
		const totalTime =
			mode === 'break' ? breakDuration * 60 : workDuration * 60
		return ((totalTime - (totalTime - elapsed)) / totalTime) * 100
	}, [elapsed, workDuration, breakDuration, mode])

	// Format time for display
	const formatTime = useCallback(() => {
		const totalTime =
			mode === 'break' ? breakDuration * 60 : workDuration * 60
		const remaining = totalTime - elapsed

		const minutes = Math.floor(remaining / 60)
		const seconds = remaining % 60
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
	}, [elapsed, workDuration, breakDuration, mode])

	// Get current status
	const getStatus = useCallback((): TimerStatus => {
		return status
	}, [status])

	// Get current mode
	const getMode = useCallback((): TimerMode => {
		return mode
	}, [mode])

	// Start the timer
	const start = useCallback(() => {
		// Cannot start without a project
		if (!projectId) {
			console.error('Cannot start timer without a project')
			return
		}

		// Start the timer in the store
		startTimer(projectId, taskId || null)

		startTimeRef.current = new Date()
		pausedTimeRef.current = 0
	}, [projectId, taskId, startTimer])

	// Pause the timer
	const pause = useCallback(() => {
		pauseTimer()
		pausedTimeRef.current = elapsed
	}, [pauseTimer, elapsed])

	// Resume the timer
	const resume = useCallback(() => {
		// Cannot resume without a project
		if (!projectId) {
			console.error('Cannot resume timer without a project')
			return
		}

		resumeTimer()
	}, [projectId, resumeTimer])

	// Skip to next session
	const skipToNext = useCallback(() => {
		switchToNext()
	}, [switchToNext])

	// Stop and reset the timer
	const stop = useCallback((shouldSave?: boolean) => {
		console.log('useTimer.stop llamado con shouldSave:', shouldSave)
		// Explícitamente pasamos el parámetro shouldSave al store
		stopTimer(shouldSave)

		// Play complete sound - CORRECCIÓN: Esto se maneja en el store timerStore
		// para evitar redundancia y asegurar que suene correctamente
	}, [stopTimer])

	// Additional safeguard: if projectId is removed while timer is active, stop timer
	useEffect(() => {
		if (!projectId && (status === 'running' || status === 'paused')) {
			console.log(
				'No project selected while timer is active - stopping timer',
			)
			stop()
		}
	}, [projectId, status, stop])

	return {
		// Timer state
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
