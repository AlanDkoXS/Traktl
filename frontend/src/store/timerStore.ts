import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { showTimerNotification } from '../utils/soundNotifications'
import { timeEntryService } from '../services/timeEntryService'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'break'
export type TimerMode = 'work' | 'break'

// Global interval reference
let globalTimerInterval: number | null = null

// Type for timer action data
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
	socketConnected: boolean // Track socket connection status
	isSyncEnabled: boolean // Flag to enable/disable syncing
	lastSyncTime: Date | null // Track when the timer was last synced

	// New methods for sync
	setSyncEnabled: (enabled: boolean) => void
	setSocketConnected: (connected: boolean) => void
	syncTimerState: () => void
	handleRemoteTimerAction: (action: string, data: TimerActionData) => void
	toggleEntrySelection: (entryId: string | null) => void

	// Actions
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

	switchToNext: () => Promise<void>
	switchToBreak: () => void
	switchToWork: (nextRepetition?: number) => void

	// Helper to create time entries
	createTimeEntryFromWorkSession: () => Promise<void>
}

// Helper to manage the global interval
const setupGlobalInterval = (tick: () => void, status: TimerStatus) => {
	// Clear any existing interval
	if (globalTimerInterval !== null) {
		clearInterval(globalTimerInterval)
		globalTimerInterval = null
	}

	// Set up new interval if timer is running
	if (status === 'running' || status === 'break') {
		globalTimerInterval = window.setInterval(() => {
			tick()
		}, 1000) // Update every second
	}
}

export const useTimerStore = create<TimerState>()(
	persist(
		(set, get) => ({
			status: 'idle',
			mode: 'work',
			elapsed: 0,
			workDuration: 25, // Default 25 minutes
			breakDuration: 5, // Default 5 minutes
			repetitions: 4, // Default 4 repetitions
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
			isSyncEnabled: true, // Enable sync by default
			lastSyncTime: null,

			// Track socket connection status
			setSocketConnected: (connected: boolean) => set({ socketConnected: connected }),

			// Enable/disable sync
			setSyncEnabled: (enabled: boolean) => set({ isSyncEnabled: enabled }),

			// Send current timer state to all connected devices
			syncTimerState: () => {
				const state = get()

				// If sync is disabled or socket is not connected, don't sync
				if (!state.isSyncEnabled || !state.socketConnected) return

				// Get socket from window
				const socket = window.socket
				if (!socket) return

				// Create sync object with important timer state
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

				// Emit timer tick event to sync with other devices
				socket.emit('timer:tick', syncData)

				// Update last sync time
				set({ lastSyncTime: new Date() })
			},

			// Handle timer actions from other devices
			handleRemoteTimerAction: (action: string, data: TimerActionData) => {
				const state = get()

				// If sync is disabled, don't handle remote actions
				if (!state.isSyncEnabled) return

				console.log(`Received remote timer action: ${action}`, data)

				switch (action) {
					case 'timer:start':
						// Don't restart if already running
						if (state.status !== 'running') {
							set({
								status: 'running',
								mode: data.mode || 'work',
								elapsed: data.elapsed || 0,
								projectId: data.projectId || state.projectId,
								taskId: data.taskId || state.taskId,
								workStartTime: data.workStartTime ? new Date(data.workStartTime as string) : new Date(),
								infiniteMode: data.infiniteMode || false,
							})

							// Setup interval
							setupGlobalInterval(get().tick, 'running')
						}
						break

					case 'timer:pause':
						if (state.status === 'running') {
							set({
								status: 'paused',
								elapsed: data.elapsed || state.elapsed
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
						// Just reset the timer state without saving
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
						// Only update if the timestamp is newer than our last update
						const remoteTimestamp = new Date(data.timestamp as string)
						if (!state.lastSyncTime || remoteTimestamp > state.lastSyncTime) {
							set({
								status: data.status as TimerStatus,
								mode: data.mode as TimerMode,
								elapsed: data.elapsed as number,
								currentRepetition: data.currentRepetition as number,
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
					// Check if we have a project ID either from parameters or state
					const selectedProjectId = projectId || state.projectId;

					// Don't start the timer if no project is selected
					if (!selectedProjectId) {
						console.error('Cannot start timer without a project');
						return state;
					}

					if (state.status === 'idle' || state.status === 'paused') {
						// Ensure infiniteMode is properly set based on selectedEntryId
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

						// Setup the interval after the state update
						setTimeout(() => {
							setupGlobalInterval(get().tick, 'running')
						}, 0)

						// Sync timer state to other devices
						if (state.isSyncEnabled && state.socketConnected) {
							const socket = window.socket
							if (socket) {
								socket.emit('timer:start', {
									...newState,
									timestamp: new Date(),
								})
							}
						}

						return newState
					}
					return state
				}),

			pause: () =>
				set((state) => {
					if (state.status === 'running') {
						// Clear the interval when pausing
						setupGlobalInterval(get().tick, 'paused')

						// Sync pause action to other devices
						if (state.isSyncEnabled && state.socketConnected) {
							const socket = window.socket
							if (socket) {
								socket.emit('timer:pause', {
									elapsed: state.elapsed,
									timestamp: new Date(),
								})
							}
						}

						return { status: 'paused' }
					}
					return state
				}),

			resume: () =>
				set((state) => {
					if (state.status === 'paused') {
						// Restart the interval when resuming
						setTimeout(() => {
							setupGlobalInterval(get().tick, 'running')
						}, 0)

						// Sync resume action to other devices
						if (state.isSyncEnabled && state.socketConnected) {
							const socket = window.socket
							if (socket) {
								socket.emit('timer:resume', {
									elapsed: state.elapsed,
									timestamp: new Date(),
								})
							}
						}

						return { status: 'running' }
					}
					return state
				}),

			stop: async (shouldSave = true) => {
				console.log('Ejecutando stop con shouldSave:', shouldSave, 'typeof:', typeof shouldSave)

				// Verificación estricta para asegurar que shouldSave sea un booleano
				const shouldSaveFinal = shouldSave === true;
				console.log('shouldSaveFinal:', shouldSaveFinal);

				// Sync stop action to other devices
				const state = get()
				if (state.isSyncEnabled && state.socketConnected) {
					const socket = window.socket
					if (socket) {
						socket.emit('timer:stop', {
							shouldSave: shouldSaveFinal,
							timestamp: new Date(),
						})
					}
				}

				// Si shouldSave es explícitamente false, simplemente reseteamos el timer sin guardar
				if (shouldSaveFinal === false) {
					console.log('shouldSave es false, NO se guardará la entrada');

					// Reproducir sonido de finalización aunque no se guarde
					showTimerNotification('complete', {
						title: 'Timer Stopped',
						body: 'The timer has been stopped without saving.',
						persistent: false,
					});

					// Limpiar el intervalo
					setupGlobalInterval(get().tick, 'idle');

					// Resetear estado
					set({
						status: 'idle',
						mode: 'work',
						elapsed: 0,
						currentRepetition: 1,
						workStartTime: null,
						infiniteMode: false,
						selectedEntryId: null,
					});

					return; // Salir temprano
				}

				// Solo crear entrada si es modo trabajo, con proyecto seleccionado y tiempo > 1s
				console.log('Condiciones para guardar:', {
					shouldSave,
					shouldSaveFinal,
					mode: state.mode,
					projectId: state.projectId,
					elapsed: state.elapsed,
					willSave: shouldSaveFinal && state.mode === 'work' && state.projectId && state.elapsed >= 1
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
						elapsedTime: state.elapsed
					})
				}

				// Limpiar intervalo
				setupGlobalInterval(get().tick, 'idle')

				// Resetear estado - SIEMPRE RESETEAR A SESIÓN 1 AL DETENER
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
				// Clear the interval when resetting
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
					// If the same entry is already selected, deselect it
					if (state.selectedEntryId === entryId) {
						return {
							selectedEntryId: null,
							infiniteMode: false,
						}
					}

					// Otherwise, select the new entry
					return {
						selectedEntryId: entryId,
						infiniteMode: !!entryId, // Set infinite mode if an entry is selected
					}
				}),

			setInfiniteMode: (value) => set({ infiniteMode: value }),
			setSelectedEntryId: (id) => set({ selectedEntryId: id }),

			tick: () => {
				set((state) => {
					const newElapsed = state.elapsed + 1
					const totalSeconds = state.mode === 'work'
						? state.workDuration * 60
						: state.breakDuration * 60

					// In infinite mode, just increment the timer
					if (state.infiniteMode && state.mode === 'work') {
						// If sync is enabled and connected, sync every 5 seconds
						if (state.isSyncEnabled && state.socketConnected && newElapsed % 5 === 0) {
							state.syncTimerState()
						}

						return { elapsed: newElapsed }
					}

					// Check if timer completed
					if (!state.infiniteMode && newElapsed >= totalSeconds) {
						if (state.mode === 'work') {
							// Work session completed
							state.switchToBreak()
						} else {
							// Break session completed
							state.switchToWork(
								state.currentRepetition < state.repetitions
									? state.currentRepetition + 1
									: 1
							)
						}
						return {} // State already updated in switchToBreak/switchToWork
					}

					// If sync is enabled and connected, sync every 5 seconds
					if (state.isSyncEnabled && state.socketConnected && newElapsed % 5 === 0) {
						state.syncTimerState()
					}

					// Regular tick, just update elapsed time
					return { elapsed: newElapsed }
				})
			},

			setWorkDuration: (minutes) =>
				set(() => ({ workDuration: minutes })),
			setBreakDuration: (minutes) =>
				set(() => ({ breakDuration: minutes })),
			setRepetitions: (repetitions) => set(() => ({ repetitions })),
			setProjectId: (projectId) => set(() => ({ projectId })),
			setTaskId: (taskId) => set(() => ({ taskId })),
			setNotes: (notes) => set(() => ({ notes })),
			setTags: (tags) => set(() => ({ tags })),

			createTimeEntryFromWorkSession: async () => {
				const state = get()

				// Skip if no project selected
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

					// Only create entries longer than 1 second
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
						title: 'Zaman Girişi Oluşturuldu',
						body: `${durationMinutes} dakikalık bir zaman girişi kaydedildi`,
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

			switchToNext: async () => {
				const state = get();

				// Determinar si es el final de un ciclo de trabajo o descanso
				if (state.mode === 'work') {
					// Guardar la sesión actual si es modo trabajo y hay tiempo transcurrido
					if (state.projectId && state.elapsed >= 1) {
						await state.createTimeEntryFromWorkSession();
					}

					// Reproducir sonido de finalización de ciclo de trabajo
					showTimerNotification('complete', {
						title: 'Work Session Complete',
						body: 'Time to take a break!',
						persistent: false
					});

					return state.switchToBreak();
				} else {
					// Estamos en break
					if (state.currentRepetition < state.repetitions) {
						// Reproducir sonido de finalización de descanso
						showTimerNotification('complete', {
							title: 'Break Complete',
							body: 'Ready for the next work session!',
							persistent: false
						});

						return state.switchToWork(state.currentRepetition + 1);
					} else {
						// Hemos completado todas las repeticiones
						showTimerNotification('complete', {
							title: 'All Sessions Completed',
							body: "Great job! You've completed all your work sessions.",
							persistent: true
						});

						// Resetear el timer y mostrar modal
						setupGlobalInterval(get().tick, 'idle');

						set({
							mode: 'work',
							status: 'idle',
							elapsed: 0,
							currentRepetition: 1,
							workStartTime: null,
							showCompletionModal: true,
							infiniteMode: false,
							selectedEntryId: null
						});
					}
				}
			},

			switchToBreak: () =>
				set((state) => {
					// If in infinite mode, don't switch to break
					if (state.infiniteMode) {
						return state
					}

					// Reproducir sonido de finalización de trabajo
					showTimerNotification('break', {
						title: 'Mola Zamanı',
						body: 'Çalışma oturumu tamamlandı! Mola zamanı.',
						persistent: false,
					});

					// Create time entry if switching from work mode with a project
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

			switchToWork: (nextRepetition) => {
				// Reproducir sonido de inicio de trabajo si venimos de descanso
				if (get().mode === 'break') {
					showTimerNotification('work', {
						title: 'Çalışma Zamanı',
						body: 'Mola bitti! Çalışmaya geri dönelim.',
						persistent: false,
					});
				}

				// Setup interval for work mode
				setTimeout(() => {
					setupGlobalInterval(get().tick, 'running')
				}, 0)

				return set(() => ({
					mode: 'work',
					elapsed: 0,
					currentRepetition: nextRepetition || 1,
					workStartTime: new Date(),
				}))
			},
		}),
		{
			name: 'timer-storage',
			// Only persist the timer settings, not the current state
			partialize: (state) => ({
				workDuration: state.workDuration,
				breakDuration: state.breakDuration,
				repetitions: state.repetitions,
				isSyncEnabled: state.isSyncEnabled,
			}),
		},
	),
)

// Initialize the global interval after the store is created
setTimeout(() => {
	const state = useTimerStore.getState()
	if (state.status === 'running' || state.status === 'break') {
		setupGlobalInterval(state.tick, state.status)
	}
}, 0)
