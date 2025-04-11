import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { timeEntryService } from '../services/timeEntryService'
import { timerPresetService } from '../services/timerPresetService'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'break'
export type TimerMode = 'work' | 'break'

let globalTimerInterval: number | null = null

interface TimerActionData {
	status?: TimerStatus
	mode?: TimerMode
	elapsed?: number
	projectId?: string | null
	taskId?: string | null
	workStartTime?: Date | string
	infiniteMode?: boolean
	workDuration?: number
	breakDuration?: number
	repetitions?: number
	currentRepetition?: number
	timestamp?: Date | string
	shouldSave?: boolean
}

interface TimerState {
	status: TimerStatus
	mode: TimerMode
	elapsed: number
	workDuration: number
	breakDuration: number
	repetitions: number
	currentRepetition: number
	projectId: string | null
	taskId: string | null
	notes: string
	tags: string[]
	workStartTime: Date | null
	showCompletionModal: boolean
	infiniteMode: boolean
	selectedEntryId: string | null
	socketConnected: boolean
	isSyncEnabled: boolean
	lastSyncTime: Date | null
	selectedPresetId: string | null
	infiniteElapsedTime: number

	setSyncEnabled: (enabled: boolean) => void
	setSocketConnected: (connected: boolean) => void
	syncTimerState: () => void
	handleRemoteTimerAction: (action: string, data: TimerActionData) => void
	toggleEntrySelection: (entryId: string | null) => void

	start: (projectId?: string | null, taskId?: string | null) => void
	pause: () => void
	resume: () => void
	stop: (shouldSave?: boolean) => Promise<void>
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

	createTimeEntryFromWorkSession: (
		showNotification?: boolean,
	) => Promise<void>

	showNotification: (type: 'work' | 'break' | 'complete') => void

	setSelectedPresetId: (id: string | null) => void
}

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

const syncTimerAction = (
	action: string,
	data: TimerActionData,
	state: TimerState,
) => {
	if (!state.isSyncEnabled || !state.socketConnected) return

	const socket = window.socket
	if (!socket) return

	socket.emit(action, {
		...data,
		timestamp: new Date(),
	})

	return new Date()
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
			socketConnected: false,
			isSyncEnabled: true,
			lastSyncTime: null,
			selectedPresetId: null,
			infiniteElapsedTime: 0,

			setSocketConnected: (connected: boolean) =>
				set({ socketConnected: connected }),

			setSyncEnabled: (enabled: boolean) =>
				set({ isSyncEnabled: enabled }),

			syncTimerState: () => {
				const state = get()

				if (!state.isSyncEnabled || !state.socketConnected) return

				const socket = window.socket
				if (!socket) return

				const syncData: TimerActionData = {
					status: state.status,
					mode: state.mode,
					elapsed: state.elapsed,
					workDuration: state.workDuration,
					breakDuration: state.breakDuration,
					repetitions: state.repetitions,
					currentRepetition: state.currentRepetition,
					projectId: state.projectId,
					taskId: state.taskId,
					infiniteMode: state.infiniteMode,
					timestamp: new Date(),
				}

				socket.emit('timer:tick', syncData)

				set({ lastSyncTime: new Date() })
			},

			handleRemoteTimerAction: (
				action: string,
				data: TimerActionData,
			) => {
				const state = get()

				if (!state.isSyncEnabled) return

				console.log(`Received remote timer action: ${action}`, data)

				switch (action) {
					case 'timer:start':
						if (state.status !== 'running') {
							set({
								status: 'running',
								mode: data.mode || 'work',
								elapsed: data.elapsed || 0,
								projectId: data.projectId || state.projectId,
								taskId: data.taskId || state.taskId,
								workStartTime: data.workStartTime
									? new Date(data.workStartTime as string)
									: new Date(),
								infiniteMode: data.infiniteMode || false,
							})

							setupGlobalInterval(get().tick, 'running')
						}
						break

					case 'timer:pause':
						if (state.status === 'running') {
							set({
								status: 'paused',
								elapsed: data.elapsed || state.elapsed,
							})
							setupGlobalInterval(get().tick, 'paused')
						}
						break

					case 'timer:resume':
						if (state.status === 'paused') {
							set({ status: 'running' })
							setupGlobalInterval(get().tick, 'running')
						}
						break

					case 'timer:stop':
						set({
							status: 'idle',
							mode: 'work',
							elapsed: 0,
							currentRepetition: 1,
							workStartTime: null,
							infiniteMode: false,
							selectedEntryId: null,
						})
						setupGlobalInterval(get().tick, 'idle')
						break

					case 'timer:tick': {
						const remoteTimestamp = new Date(
							data.timestamp as string,
						)
						if (
							!state.lastSyncTime ||
							remoteTimestamp > state.lastSyncTime
						) {
							set({
								status: data.status as TimerStatus,
								mode: data.mode as TimerMode,
								elapsed: data.elapsed as number,
								currentRepetition:
									data.currentRepetition as number,
								lastSyncTime: new Date(),
							})
						}
						break
					}

					default:
						console.warn(`Unknown remote timer action: ${action}`)
				}
			},

			start: (projectId = null, taskId = null) =>
				set((state) => {
					const selectedProjectId = projectId || state.projectId

					if (!selectedProjectId) {
						console.error('Cannot start timer without a project')
						return state
					}

					if (state.status === 'idle' || state.status === 'paused') {
						const updatedInfiniteMode = !!state.selectedEntryId

						const newState = {
							status: 'running' as TimerStatus,
							projectId: selectedProjectId,
							taskId: taskId || state.taskId,
							elapsed:
								state.status === 'paused' && !state.infiniteMode
									? state.elapsed
									: 0,
							workStartTime:
								state.mode === 'work'
									? new Date()
									: state.workStartTime,
							showCompletionModal: false,
							infiniteMode: updatedInfiniteMode,
						}

						setTimeout(() => {
							setupGlobalInterval(get().tick, 'running')
						}, 0)

						const lastSyncTime = syncTimerAction(
							'timer:start',
							{
								status: newState.status,
								mode: state.mode,
								elapsed: newState.elapsed,
								projectId: newState.projectId,
								taskId: newState.taskId,
								workStartTime:
									newState.workStartTime || undefined,
								infiniteMode: newState.infiniteMode,
							},
							state,
						)
						if (lastSyncTime) {
							set({ lastSyncTime })
						}

						return newState
					}
					return state
				}),

			pause: () =>
				set((state) => {
					if (state.status === 'running') {
						if (globalTimerInterval !== null) {
							clearInterval(globalTimerInterval)
							globalTimerInterval = null
						}

						if (state.infiniteMode) {
							const now = new Date()
							const startTime = state.workStartTime
								? new Date(state.workStartTime)
								: now
							const elapsedSeconds = Math.floor(
								(now.getTime() - startTime.getTime()) / 1000,
							)

							return {
								status: 'paused',
								infiniteElapsedTime: elapsedSeconds,
								workStartTime: new Date(
									now.getTime() - elapsedSeconds * 1000,
								),
							}
						}

						const lastSyncTime = syncTimerAction(
							'timer:pause',
							{
								elapsed: state.elapsed,
							},
							state,
						)
						if (lastSyncTime) {
							set({ lastSyncTime })
						}

						return { status: 'paused' }
					}
					return state
				}),

			resume: () =>
				set((state) => {
					if (state.status === 'paused') {
						setTimeout(() => {
							setupGlobalInterval(get().tick, 'running')
						}, 0)

						if (state.infiniteMode) {
							const now = new Date()

							const elapsedSeconds = state.infiniteElapsedTime

							const newWorkStartTime = new Date(
								now.getTime() - elapsedSeconds * 1000,
							)

							return {
								status: 'running',
								workStartTime: newWorkStartTime,
							}
						}

						const lastSyncTime = syncTimerAction(
							'timer:resume',
							{
								elapsed: state.elapsed,
							},
							state,
						)
						if (lastSyncTime) {
							set({ lastSyncTime })
						}

						return { status: 'running' }
					}
					return state
				}),

			stop: async (shouldSave = true) => {
				const state = get()
				const shouldSaveFinal = shouldSave && state.mode === 'work'

				console.log('Timer stop called with:', {
					shouldSave,
					shouldSaveFinal,
					mode: state.mode,
					projectId: state.projectId,
					elapsed: state.infiniteMode
						? state.infiniteElapsedTime
						: state.elapsed,
					workStartTime: state.workStartTime,
				})

				if (state.infiniteMode) {
					setupGlobalInterval(get().tick, 'idle')

					if (
						shouldSaveFinal &&
						state.projectId &&
						state.infiniteElapsedTime >= 1
					) {
						await state.createTimeEntryFromWorkSession(false)
					}

					state.showNotification('work')

					set({
						status: 'idle',
						mode: 'work',
						elapsed: 0,
						currentRepetition: 1,
						workStartTime: null,
						infiniteMode: false,
						selectedEntryId: null,
						infiniteElapsedTime: 0,
					})

					return
				}

				const lastSyncTime = syncTimerAction(
					'timer:stop',
					{
						shouldSave: shouldSaveFinal,
					},
					state,
				)
				if (lastSyncTime) {
					set({ lastSyncTime })
				}

				if (state.mode === 'break' || shouldSaveFinal === false) {
					console.log(
						'Modo break o shouldSave es false, NO se guardará la entrada',
					)

					state.showNotification('work')

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

					return
				}

				console.log('Condiciones para guardar:', {
					shouldSave,
					shouldSaveFinal,
					mode: state.mode,
					projectId: state.projectId,
					elapsed: state.elapsed,
					workStartTime: state.workStartTime,
					willSave:
						shouldSaveFinal &&
						state.mode === 'work' &&
						state.projectId &&
						state.elapsed >= 1,
				})

				if (
					shouldSaveFinal &&
					state.mode === 'work' &&
					state.projectId &&
					state.elapsed >= 1
				) {
					console.log('Creando entrada de tiempo')
					await state.createTimeEntryFromWorkSession()
				} else {
					console.log('NO se crea entrada de tiempo porque:', {
						shouldSave,
						shouldSaveFinal,
						modeIsWork: state.mode === 'work',
						hasProject: !!state.projectId,
						elapsedTime: state.elapsed,
						workStartTime: state.workStartTime,
					})
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
			},

			reset: () => {
				setupGlobalInterval(get().tick, 'idle')

				return set({
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

			toggleEntrySelection: (entryId: string | null) =>
				set((state) => {
					if (state.selectedEntryId === entryId) {
						return {
							selectedEntryId: null,
							infiniteMode: false,
						}
					}

					return {
						selectedEntryId: entryId,
						infiniteMode: !!entryId,
					}
				}),

			setInfiniteMode: (value: boolean) => {
				const state = get()
				if (value && !state.infiniteElapsedTime) {
					set({
						infiniteMode: true,
						infiniteElapsedTime: 0,
						workStartTime: new Date(),
					})
				} else if (!value) {
					set({
						infiniteMode: false,
						infiniteElapsedTime: 0,
						workStartTime: null,
					})
				}
			},
			setSelectedEntryId: (id) => set({ selectedEntryId: id }),

			tick: () => {
				const state = get()
				if (state.status === 'running') {
					if (state.infiniteMode) {
						const now = new Date()
						const startTime = state.workStartTime
							? new Date(state.workStartTime)
							: now
						const elapsedSeconds = Math.floor(
							(now.getTime() - startTime.getTime()) / 1000,
						)

						if (elapsedSeconds !== state.infiniteElapsedTime) {
							set({ infiniteElapsedTime: elapsedSeconds })
						}
					} else {
						const newElapsed = state.elapsed + 1
						const totalTime =
							state.mode === 'break'
								? state.breakDuration * 60
								: state.workDuration * 60

						if (newElapsed <= totalTime) {
							set({ elapsed: newElapsed })

							if (newElapsed === totalTime) {
								if (globalTimerInterval !== null) {
									clearInterval(globalTimerInterval)
									globalTimerInterval = null
								}

								state.showNotification(state.mode)

								state.switchToNext()
							}
						}
					}
				}
			},

			setWorkDuration: (minutes) =>
				set((state) => {
					timerPresetService
						.syncCurrentSettings({
							workDuration: minutes,
							breakDuration: state.breakDuration,
							repetitions: state.repetitions,
						})
						.catch((error) => {
							console.error('Error syncing work duration:', error)
						})
					return { workDuration: minutes }
				}),
			setBreakDuration: (minutes) =>
				set((state) => {
					timerPresetService
						.syncCurrentSettings({
							workDuration: state.workDuration,
							breakDuration: minutes,
							repetitions: state.repetitions,
						})
						.catch((error) => {
							console.error(
								'Error syncing break duration:',
								error,
							)
						})
					return { breakDuration: minutes }
				}),
			setRepetitions: (repetitions) =>
				set((state) => {
					timerPresetService
						.syncCurrentSettings({
							workDuration: state.workDuration,
							breakDuration: state.breakDuration,
							repetitions,
						})
						.catch((error) => {
							console.error('Error syncing repetitions:', error)
						})
					return { repetitions }
				}),
			setProjectId: (projectId) => set(() => ({ projectId })),
			setTaskId: (taskId) => set(() => ({ taskId })),
			setNotes: (notes) => set(() => ({ notes })),
			setTags: (tags) => set(() => ({ tags })),

			createTimeEntryFromWorkSession: async (showNotification = true) => {
				const state = get()
				if (!state.projectId) return

				try {
					let startTime: Date
					if (state.workStartTime instanceof Date) {
						startTime = state.workStartTime
					} else if (typeof state.workStartTime === 'number') {
						startTime = new Date(state.workStartTime)
					} else {
						startTime = new Date(
							Date.now() -
								(state.infiniteMode
									? state.infiniteElapsedTime
									: state.elapsed) *
									1000,
						)
					}

					const elapsedTime = state.infiniteMode
						? state.infiniteElapsedTime
						: state.elapsed
					const endTime = new Date(
						startTime.getTime() + elapsedTime * 1000,
					)

					if (elapsedTime > 1) {
						const timeEntry = {
							project: state.projectId,
							task: state.taskId || undefined,
							startTime,
							endTime,
							duration: elapsedTime * 1000,
							notes:
								state.notes ||
								`Work session ${state.currentRepetition}/${state.repetitions}`,
							tags: state.tags,
							isRunning: false,
						}

						await timeEntryService.createTimeEntry(timeEntry)

						if (showNotification && !state.infiniteMode) {
							state.showNotification('work')
						}

						window.dispatchEvent(
							new CustomEvent('time-entry-created'),
						)
					}
				} catch (error) {
					console.error('Error creating time entry:', error)
				}
			},

			switchToNext: () => {
				const state = get()

				if (state.infiniteMode) {
					return
				}

				if (state.mode === 'work') {
					if (state.projectId) {
						state
							.createTimeEntryFromWorkSession(false)
							.catch((error) => {
								console.error(
									'Error creating time entry:',
									error,
								)
							})
					}

					if (state.breakDuration > 0) {
						set({
							mode: 'break',
							status: 'running',
							elapsed: 0,
							workStartTime: null,
						})
						setupGlobalInterval(get().tick, 'running')

						setTimeout(() => {
							get().showNotification('break')
						}, 100)
					} else {
						if (state.currentRepetition < state.repetitions) {
							const nextRepetition = state.currentRepetition + 1
							set({
								mode: 'work',
								status: 'running',
								elapsed: 0,
								currentRepetition: nextRepetition,
								workStartTime: new Date(),
							})
							setupGlobalInterval(get().tick, 'running')

							setTimeout(() => {
								get().showNotification('work')
							}, 100)
						} else {
							set({
								mode: 'work',
								status: 'idle',
								elapsed: 0,
								currentRepetition: 1,
								workStartTime: null,
								showCompletionModal: true,
							})

							setTimeout(() => {
								get().showNotification('complete')
							}, 100)
						}
					}
				} else {
					if (state.currentRepetition < state.repetitions) {
						const nextRepetition = state.currentRepetition + 1
						set({
							mode: 'work',
							status: 'running',
							elapsed: 0,
							currentRepetition: nextRepetition,
							workStartTime: new Date(),
						})
						setupGlobalInterval(get().tick, 'running')

						setTimeout(() => {
							get().showNotification('work')
						}, 100)
					} else {
						set({
							mode: 'work',
							status: 'idle',
							elapsed: 0,
							currentRepetition: 1,
							workStartTime: null,
							showCompletionModal: true,
						})

						setTimeout(() => {
							get().showNotification('complete')
						}, 100)
					}
				}
			},

			switchToBreak: () =>
				set((state) => {
					if (state.infiniteMode) {
						return state
					}

					state.showNotification('work')

					if (
						state.mode === 'work' &&
						state.projectId &&
						state.elapsed >= 1
					) {
						setTimeout(() => {
							get().createTimeEntryFromWorkSession()
						}, 0)
					}

					return {
						mode: 'break',
						elapsed: 0,
						workStartTime: null,
					}
				}),

			switchToWork: (nextRepetition?: number) => {
				const state = get()
				const newRepetition =
					nextRepetition || state.currentRepetition + 1

				set({
					status: 'idle',
					mode: 'work',
					elapsed: 0,
					currentRepetition: newRepetition,
					workStartTime: null,
				})

				get().showNotification('work')

				syncTimerAction(
					'timer:switch',
					{
						status: 'idle',
						mode: 'work',
						elapsed: 0,
						currentRepetition: newRepetition,
					},
					state,
				)
			},

			showNotification: (type: 'work' | 'break' | 'complete') => {
				const state = get()

				if (state.status === 'idle') return

				import('../services/notificationService').then(
					({ useNotificationStore }) => {
						const notificationStore =
							useNotificationStore.getState()
						notificationStore.showNotification(type)
					},
				)

				if (
					'Notification' in window &&
					Notification.permission === 'granted'
				) {
					let title = ''
					let message = ''

					switch (type) {
						case 'work':
							title = '¡Tiempo de trabajo!'
							message = `Comienza tu sesión de trabajo #${state.currentRepetition}`
							break
						case 'break':
							title = '¡Tiempo de descanso!'
							message = 'Toma un descanso bien merecido'
							break
						case 'complete':
							title = '¡Sesión completada!'
							message = 'Has completado todas las repeticiones'
							break
					}

					new Notification(title, {
						body: message,
						icon: '/icon.png',
					})
				}
			},

			setSelectedPresetId: (id: string | null) =>
				set({ selectedPresetId: id }),
		}),
		{
			name: 'timer-storage',

			partialize: (state) => ({
				workDuration: state.workDuration,
				breakDuration: state.breakDuration,
				repetitions: state.repetitions,
				isSyncEnabled: state.isSyncEnabled,
				status: state.status,
				mode: state.mode,
				elapsed: state.elapsed,
				currentRepetition: state.currentRepetition,
				projectId: state.projectId,
				taskId: state.taskId,
				workStartTime: state.workStartTime,
				infiniteMode: state.infiniteMode,
				selectedEntryId: state.selectedEntryId,
				selectedPresetId: state.selectedPresetId,
			}),
		},
	),
)

setTimeout(() => {
	const state = useTimerStore.getState()
	if (state.status === 'running' || state.status === 'break') {
		setupGlobalInterval(state.tick, state.status)
	}
}, 0)
