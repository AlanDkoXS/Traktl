import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { showTimerNotification } from '../utils/soundNotifications'
import { timeEntryService } from '../services/timeEntryService'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'break'
export type TimerMode = 'work' | 'break'

// Global interval reference
let globalTimerInterval: number | null = null

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

	switchToNext: () => void
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

						return newState
					}
					return state
				}),

			pause: () =>
				set((state) => {
					if (state.status === 'running') {
						// Clear the interval when pausing
						setupGlobalInterval(get().tick, 'paused')
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
						return { status: 'running' }
					}
					return state
				}),

			stop: async (shouldSave = true) => {
				console.log('Ejecutando stop con shouldSave:', shouldSave, 'typeof:', typeof shouldSave)

				// Verificación estricta para asegurar que shouldSave sea un booleano
				const shouldSaveFinal = shouldSave === true;
				console.log('shouldSaveFinal:', shouldSaveFinal);

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

				const state = get()

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
					if (state.selectedEntryId === entryId) {
						return {
							selectedEntryId: null,
							infiniteMode: false,
						}
					}
					return {
						selectedEntryId: entryId,
						infiniteMode: entryId !== null,
					}
				}),

			setInfiniteMode: (value) => set({ infiniteMode: value }),
			setSelectedEntryId: (id) => set({ selectedEntryId: id }),

			tick: () => {
				set((state) => {
					const newElapsed = state.elapsed + 1;
					const currentDuration = state.mode === 'break'
						? state.breakDuration * 60
						: state.workDuration * 60;

					// Verificar si el timer está por completarse
					// const remainingTime = currentDuration - newElapsed;
					// const progress = (newElapsed / currentDuration) * 100;

					// Si el timer ha llegado al final o lo ha sobrepasado
					if (newElapsed >= currentDuration) {
						// Reproducir sonido de finalización en el momento exacto
						if (state.mode === 'work') {
							showTimerNotification('complete', {
								title: 'Work Session Complete',
								body: 'Time to take a break!',
							});
						} else {
							showTimerNotification('complete', {
								title: 'Break Complete',
								body: 'Ready for the next work session?',
							});
						}

						// Call switchToNext separately to avoid return issues
						setTimeout(() => {
							state.switchToNext();
						}, 0);

						// Return just the updated elapsed time
						return { elapsed: newElapsed };
					}

					return { elapsed: newElapsed };
				});
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
				const state = get();

				// Determinar si es el final de un ciclo de trabajo o descanso
				if (state.mode === 'work') {
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
						title: 'Break Time',
						body: 'Work session completed! Time for a break.',
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
						title: 'Work Time',
						body: 'Break completed! Back to work.',
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
			// Transform the rehydrated state
			onRehydrateStorage: () => (state) => {
				if (state && state.workStartTime) {
					try {
						state.workStartTime = new Date(state.workStartTime)
					} catch (e) {
						console.error('Error parsing workStartTime:', e)
						state.workStartTime = null
					}
				}

				// Restart the global interval if the timer was running
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

// Initialize the global interval after the store is created
setTimeout(() => {
	const state = useTimerStore.getState()
	if (state.status === 'running' || state.status === 'break') {
		setupGlobalInterval(state.tick, state.status)
	}
}, 0)
