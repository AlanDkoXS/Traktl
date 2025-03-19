import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { showTimerNotification } from '../utils/soundNotifications'
import { timeEntryService } from '../services/timeEntryService'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'break'
export type TimerMode = 'work' | 'break'

// Global interval reference
let globalTimerInterval: number | null = null

// Reference to store currently active time entry ID (outside of the store state)
let activeTimeEntryId: string | null = null

interface TimerState {
	status: TimerStatus
	mode: TimerMode
	elapsed: number // Time elapsed in seconds
	workDuration: number // Duration in minutes
	breakDuration: number // Duration in minutes
	repetitions: number
	currentRepetition: number
	projectId: string | null
	taskId: string | null
	notes: string
	tags: string[]
	workStartTime: Date | null // Track when the work period started
	showCompletionModal: boolean // Flag for completion modal
	infiniteMode: boolean // Flag for infinite timer mode
	selectedEntryId: string | null // Track which entry is selected for infinite mode

	// Actions
	start: (projectId?: string | null, taskId?: string | null) => void
	pause: () => void
	resume: () => void
	stop: () => void
	reset: () => void
	closeCompletionModal: () => void
	setInfiniteMode: (value: boolean) => void
	setSelectedEntryId: (id: string | null) => void

	tick: () => void
	setWorkDuration: (minutes: number) => void
	setBreakDuration: (minutes: number) => void
	setRepetitions: (repetitions: number) => void
	setProjectId: (projectId: string | null) => void
	setTaskId: (taskId: string | null) => void
	setNotes: (notes: string) => void
	setTags: (tags: string[]) => void

	switchToNext: () => void
	switchToBreak: () => void
	switchToWork: (nextRepetition?: number) => void

	// Helper to create time entries
	createTimeEntryFromWorkSession: () => Promise<void>
}

// Helper to manage the global interval
const setupGlobalInterval = (tick: () => void, status: TimerStatus) => {
	if (globalTimerInterval !== null) {
		clearInterval(globalTimerInterval)
		globalTimerInterval = null
	}

	if (status === 'running' || status === 'break') {
		globalTimerInterval = window.setInterval(() => {
			tick()
		}, 1000)
	}
}

// Internal helper function to start a time entry
const startTimeEntryHelper = async (
	state: TimerState,
): Promise<string | null> => {
	if (!state.projectId) {
		console.log('No project selected, skipping time entry creation')
		return null
	}

	try {
		const timeEntryData = {
			project: state.projectId,
			task: state.taskId || undefined,
			tags: state.tags,
			notes:
				state.notes ||
				`Work session ${state.currentRepetition}/${state.repetitions}`,
		}

		console.log('Starting new time entry:', timeEntryData)

		const newTimeEntry =
			await timeEntryService.startTimeEntry(timeEntryData)
		console.log('Time entry started successfully:', newTimeEntry)

		return newTimeEntry.id
	} catch (error) {
		console.error('Error starting time entry:', error)
		return null
	}
}

// Internal helper function to stop a time entry
const stopTimeEntryHelper = async (state: TimerState): Promise<void> => {
	if (!activeTimeEntryId) {
		console.log('No active time entry to stop')
		return
	}

	try {
		const additionalData = {
			notes:
				state.notes ||
				`Work session ${state.currentRepetition}/${state.repetitions}`,
			tags: state.tags,
		}

		console.log('Stopping time entry:', activeTimeEntryId)
		const stoppedEntry =
			await timeEntryService.stopTimeEntry(additionalData)

		console.log('Time entry stopped successfully:', stoppedEntry)

		const durationMinutes = Math.floor(stoppedEntry.duration / 60000)

		showTimerNotification('timeEntry', {
			title: 'Time Entry Saved',
			body: `Time entry of ${durationMinutes} minutes has been recorded`,
			persistent: false,
		})

		activeTimeEntryId = null

		window.dispatchEvent(new CustomEvent('time-entry-created'))
	} catch (error) {
		console.error('Error stopping time entry:', error)
	}
}

export const useTimerStore = create<TimerState>()(
	persist(
		(set, get) => ({
			status: 'idle',
			mode: 'work',
			elapsed: 0,
			workDuration: 25,
			breakDuration: 5,
			repetitions: 4,
			currentRepetition: 1,
			projectId: null,
			taskId: null,
			notes: '',
			tags: [],
			workStartTime: null,
			showCompletionModal: false,
			infiniteMode: false,
			selectedEntryId: null,

			start: async (projectId = null, taskId = null) => {
				const state = get()

				if (state.status === 'idle' || state.status === 'paused') {
					const updatedInfiniteMode = !!state.selectedEntryId

					if (state.status === 'idle' && state.mode === 'work') {
						const newEntryId = await startTimeEntryHelper({
							...state,
							projectId: projectId || state.projectId,
							taskId: taskId || state.taskId,
						})
						activeTimeEntryId = newEntryId
					}

					set({
						status: 'running',
						projectId: projectId || state.projectId,
						taskId: taskId || state.taskId,
						elapsed: state.status === 'paused' ? state.elapsed : 0,
						workStartTime:
							state.mode === 'work'
								? new Date()
								: state.workStartTime,
						showCompletionModal: false,
						infiniteMode: updatedInfiniteMode,
					})

					setTimeout(() => {
						setupGlobalInterval(get().tick, 'running')
					}, 0)
				}
			},

			pause: () => {
				const state = get()
				if (state.status === 'running') {
					setupGlobalInterval(get().tick, 'paused')
					set({ status: 'paused' })
				}
			},

			resume: () => {
				const state = get()
				if (state.status === 'paused') {
					set({ status: 'running' })
					setTimeout(() => {
						setupGlobalInterval(get().tick, 'running')
					}, 0)
				}
			},

			stop: async () => {
				const state = get()

				if (state.mode === 'work' && activeTimeEntryId) {
					await stopTimeEntryHelper(state)
				} else if (
					state.mode === 'work' &&
					state.projectId &&
					state.elapsed >= 1
				) {
					await state.createTimeEntryFromWorkSession()
				}

				setupGlobalInterval(get().tick, 'idle')

				set({
					status: 'idle',
					mode: 'work',
					elapsed: 0,
					currentRepetition: 1,
					workStartTime: null,
					infiniteMode: false,
					selectedEntryId: null,
				})

				activeTimeEntryId = null
			},

			reset: () => {
				const state = get()

				if (activeTimeEntryId && state.mode === 'work') {
					stopTimeEntryHelper(state)
				}

				setupGlobalInterval(get().tick, 'idle')
				activeTimeEntryId = null

				set({
					status: 'idle',
					mode: 'work',
					elapsed: 0,
					currentRepetition: 1,
					projectId: null,
					taskId: null,
					notes: '',
					tags: [],
					workStartTime: null,
					showCompletionModal: false,
					infiniteMode: false,
					selectedEntryId: null,
				})
			},

			closeCompletionModal: () => set({ showCompletionModal: false }),

			setInfiniteMode: (value) =>
				set({
					infiniteMode: value,
					selectedEntryId: value ? get().selectedEntryId : null,
				}),

			setSelectedEntryId: (id) =>
				set({
					selectedEntryId: id,
					infiniteMode: id !== null,
				}),

			tick: () => {
				set((state) => {
					if (state.status !== 'running') return state

					const newElapsed = state.elapsed + 1
					const totalDuration =
						state.mode === 'work'
							? state.workDuration * 60
							: state.breakDuration * 60

					if (!state.infiniteMode && newElapsed >= totalDuration) {
						if (state.mode === 'work') {
							setTimeout(async () => {
								if (activeTimeEntryId) {
									await stopTimeEntryHelper(state)
								} else if (state.projectId) {
									await get().createTimeEntryFromWorkSession()
								}

								if (state.breakDuration === 0) {
									if (
										state.currentRepetition <
										state.repetitions
									) {
										get().switchToWork(
											state.currentRepetition + 1,
										)
									} else {
										setTimeout(() => {
											showTimerNotification('complete', {
												title: 'All Sessions Completed',
												body: "Great job! You've completed all your work sessions.",
												persistent: true,
											})
										}, 0)
										get().reset()
										set({ showCompletionModal: true })
									}
								} else {
									showTimerNotification('break', {
										title: 'Break Time',
										body: 'Work session completed! Time for a break.',
										persistent: false,
									})
								}
							}, 0)

							if (state.breakDuration === 0) return state

							setupGlobalInterval(get().tick, 'running')
							activeTimeEntryId = null

							return {
								mode: 'break',
								status: 'running',
								elapsed: 0,
								workStartTime: null,
							}
						} else {
							if (state.currentRepetition < state.repetitions) {
								setTimeout(() => {
									showTimerNotification('work', {
										title: 'Work Time',
										body: 'Break completed! Back to work.',
										persistent: false,
									})
								}, 0)

								setTimeout(async () => {
									const newEntryId =
										await startTimeEntryHelper(get())
									activeTimeEntryId = newEntryId
								}, 0)

								setupGlobalInterval(get().tick, 'running')

								return {
									mode: 'work',
									status: 'running',
									elapsed: 0,
									currentRepetition:
										state.currentRepetition + 1,
									workStartTime: new Date(),
								}
							} else {
								setTimeout(() => {
									showTimerNotification('complete', {
										title: 'All Sessions Completed',
										body: "Great job! You've completed all your work sessions.",
										persistent: true,
									})
								}, 0)

								setupGlobalInterval(get().tick, 'idle')
								activeTimeEntryId = null

								return {
									mode: 'work',
									status: 'idle',
									elapsed: 0,
									currentRepetition: 1,
									workStartTime: null,
									showCompletionModal: true,
									infiniteMode: false,
									selectedEntryId: null,
								}
							}
						}
					}

					return { elapsed: newElapsed }
				})
			},

			setWorkDuration: (minutes: number) =>
				set({ workDuration: minutes }),
			setBreakDuration: (minutes: number) =>
				set({ breakDuration: minutes }),
			setRepetitions: (repetitions: number) => set({ repetitions }),
			setProjectId: (projectId: string | null) => set({ projectId }),
			setTaskId: (taskId: string | null) => set({ taskId }),
			setNotes: (notes: string) => set({ notes }),
			setTags: (tags: string[]) => set({ tags }),

			createTimeEntryFromWorkSession: async () => {
				const state = get()

				if (!state.projectId) {
					console.log(
						'No project selected, skipping time entry creation',
					)
					return
				}

				try {
					const startTime =
						state.workStartTime ||
						new Date(Date.now() - state.elapsed * 1000)
					const endTime = new Date()
					const duration = endTime.getTime() - startTime.getTime()

					if (duration < 1000) {
						console.log(
							'Session too short, skipping time entry creation',
						)
						return
					}

					const durationMinutes = Math.floor(duration / 60000)

					console.log('Creating time entry from work session:', {
						project: state.projectId,
						task: state.taskId,
						startTime,
						endTime,
						duration,
						notes: state.notes,
						tags: state.tags,
					})

					await timeEntryService.createTimeEntry({
						project: state.projectId,
						task: state.taskId || undefined,
						startTime,
						endTime,
						duration,
						notes:
							state.notes ||
							`Work session ${state.currentRepetition}/${state.repetitions}`,
						tags: state.tags,
						isRunning: false,
					})

					showTimerNotification('timeEntry', {
						title: 'Time Entry Created',
						body: `Time entry of ${durationMinutes} minutes has been recorded`,
						persistent: false,
					})

					console.log('Time entry created successfully')

					window.dispatchEvent(new CustomEvent('time-entry-created'))
				} catch (error) {
					console.error(
						'Error creating time entry from work session:',
						error,
					)
				}
			},

			switchToNext: () => {
				set((state) => {
					if (state.infiniteMode) return state

					if (state.mode === 'work') {
						setTimeout(async () => {
							if (activeTimeEntryId) {
								await stopTimeEntryHelper(state)
							} else if (state.projectId && state.elapsed >= 1) {
								await get().createTimeEntryFromWorkSession()
							}

							showTimerNotification('break', {
								title: 'Break Time',
								body: 'Work session completed! Time for a break.',
								persistent: false,
							})
						}, 0)

						if (state.breakDuration === 0) {
							const nextRepetition =
								state.currentRepetition < state.repetitions
									? state.currentRepetition + 1
									: 1

							setTimeout(async () => {
								const newEntryId = await startTimeEntryHelper({
									...state,
									currentRepetition: nextRepetition,
								})
								activeTimeEntryId = newEntryId
							}, 0)

							return {
								mode: 'work',
								status: 'running',
								elapsed: 0,
								currentRepetition: nextRepetition,
								workStartTime: new Date(),
							}
						}

						setupGlobalInterval(get().tick, 'running')
						activeTimeEntryId = null

						return {
							mode: 'break',
							status: 'running',
							elapsed: 0,
							workStartTime: null,
						}
					} else {
						setTimeout(() => {
							showTimerNotification('work', {
								title: 'Work Time',
								body: 'Break completed! Back to work.',
								persistent: false,
							})
						}, 0)

						if (state.currentRepetition < state.repetitions) {
							setTimeout(async () => {
								const newEntryId = await startTimeEntryHelper({
									...state,
									currentRepetition:
										state.currentRepetition + 1,
								})
								activeTimeEntryId = newEntryId
							}, 0)

							setupGlobalInterval(get().tick, 'running')

							return {
								mode: 'work',
								status: 'running',
								elapsed: 0,
								currentRepetition: state.currentRepetition + 1,
								workStartTime: new Date(),
							}
						} else {
							setTimeout(() => {
								showTimerNotification('complete', {
									title: 'All Sessions Completed',
									body: "Great job! You've completed all your work sessions.",
									persistent: true,
								})
							}, 0)

							setupGlobalInterval(get().tick, 'idle')
							activeTimeEntryId = null

							return {
								mode: 'work',
								status: 'idle',
								elapsed: 0,
								currentRepetition: 1,
								workStartTime: null,
								showCompletionModal: true,
								infiniteMode: false,
								selectedEntryId: null,
							}
						}
					}
				})
			},

			switchToBreak: () => {
				set((state) => {
					if (state.infiniteMode) return state

					if (state.mode === 'work') {
						setTimeout(async () => {
							if (activeTimeEntryId) {
								await stopTimeEntryHelper(state)
							} else if (state.projectId && state.elapsed >= 1) {
								await get().createTimeEntryFromWorkSession()
							}
						}, 0)
					}

					activeTimeEntryId = null

					return {
						mode: 'break',
						elapsed: 0,
						workStartTime: null,
					}
				})
			},

			switchToWork: (nextRepetition?: number) => {
				setTimeout(() => {
					setupGlobalInterval(get().tick, 'running')
				}, 0)

				setTimeout(async () => {
					const newEntryId = await startTimeEntryHelper({
						...get(),
						currentRepetition: nextRepetition || 1,
					})
					activeTimeEntryId = newEntryId
				}, 0)

				set({
					mode: 'work',
					elapsed: 0,
					currentRepetition: nextRepetition || 1,
					workStartTime: new Date(),
				})
			},
		}),
		{
			name: 'timer-storage',
			partialize: (state) => ({
				status: state.status,
				mode: state.mode,
				elapsed: state.elapsed,
				workDuration: state.workDuration,
				breakDuration: state.breakDuration,
				repetitions: state.repetitions,
				currentRepetition: state.currentRepetition,
				projectId: state.projectId,
				taskId: state.taskId,
				notes: state.notes,
				tags: state.tags,
				workStartTime: state.workStartTime
					? state.workStartTime.toISOString()
					: null,
				infiniteMode: state.infiniteMode,
				selectedEntryId: state.selectedEntryId,
			}),
			version: 1,
			onRehydrateStorage: () => (state) => {
				if (state && state.workStartTime) {
					try {
						state.workStartTime = new Date(state.workStartTime)
					} catch (e) {
						console.error('Error parsing workStartTime:', e)
						state.workStartTime = null
					}
				}

				if (
					state &&
					(state.status === 'running' || state.status === 'break')
				) {
					setupGlobalInterval(state.tick, state.status)
				}
			},
		},
	),
)

setTimeout(() => {
	const state = useTimerStore.getState()
	if (state.status === 'running' || state.status === 'break') {
		setupGlobalInterval(state.tick, state.status)
	}
}, 0)
