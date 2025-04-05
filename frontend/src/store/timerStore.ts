import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { timeEntryService } from '../services/timeEntryService'
import { useNotificationStore } from '../services/notificationService'
import { timerPresetService } from '../services/timerPresetService'

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
	selectedPresetId: string | null
	infiniteElapsedTime: number // Nuevo campo para trackear el tiempo en modo infinito

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

	switchToNext: () => void
	switchToBreak: () => void
	switchToWork: (nextRepetition?: number) => void

	// Helper to create time entries
	createTimeEntryFromWorkSession: (showNotification?: boolean) => Promise<void>

	showNotification: (type: 'work' | 'break' | 'complete') => void

	setSelectedPresetId: (id: string | null) => void
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

// Helper to sync timer actions
const syncTimerAction = (action: string, data: TimerActionData, state: TimerState) => {
	// If sync is disabled or socket is not connected, don't sync
	if (!state.isSyncEnabled || !state.socketConnected) return

	// Get socket from window
	const socket = window.socket
	if (!socket) return

	// Emit timer action with timestamp
	socket.emit(action, {
		...data,
		timestamp: new Date()
	})

	// Update last sync time
	return new Date()
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
			selectedPresetId: null,
			infiniteElapsedTime: 0,

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
						const lastSyncTime = syncTimerAction('timer:start', {
							status: newState.status,
							mode: state.mode,
							elapsed: newState.elapsed,
							projectId: newState.projectId,
							taskId: newState.taskId,
							workStartTime: newState.workStartTime || undefined,
							infiniteMode: newState.infiniteMode
						}, state)
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
						// Clear the interval when pausing
						if (globalTimerInterval !== null) {
							clearInterval(globalTimerInterval)
							globalTimerInterval = null
						}

						// Si estamos en modo infinito, guardar el tiempo transcurrido
						if (state.infiniteMode) {
							const now = new Date()
							const startTime = state.workStartTime ? new Date(state.workStartTime) : now
							const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000)
							
							// Guardar el tiempo transcurrido y actualizar workStartTime para que al reanudar
							// se calcule correctamente el tiempo transcurrido
							return { 
								status: 'paused',
								infiniteElapsedTime: elapsedSeconds,
								workStartTime: new Date(now.getTime() - elapsedSeconds * 1000)
							}
						}

						// Sync pause action to other devices
						const lastSyncTime = syncTimerAction('timer:pause', {
							elapsed: state.elapsed
						}, state)
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
						// Restart the interval when resuming
						setTimeout(() => {
							setupGlobalInterval(get().tick, 'running')
						}, 0)

						// Si estamos en modo infinito, actualizar workStartTime para que el tiempo
						// continúe desde donde se pausó
						if (state.infiniteMode) {
							const now = new Date()
							// Calcular el tiempo transcurrido hasta ahora
							const elapsedSeconds = state.infiniteElapsedTime
							// Establecer workStartTime para que al calcular el tiempo transcurrido
							// se obtenga el valor correcto
							const newWorkStartTime = new Date(now.getTime() - elapsedSeconds * 1000)
							
							return { 
								status: 'running',
								workStartTime: newWorkStartTime
							}
						}

						// Sync resume action to other devices
						const lastSyncTime = syncTimerAction('timer:resume', {
							elapsed: state.elapsed
						}, state)
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
					elapsed: state.elapsed,
					workStartTime: state.workStartTime
				})

				// Si estamos en modo infinito, mostrar modal de confirmación y guardar si se confirma
				if (state.infiniteMode) {
					// Limpiar el intervalo
					setupGlobalInterval(get().tick, 'idle')

					// Si se confirma el guardado, crear la entrada de tiempo
					if (shouldSaveFinal && state.projectId && state.elapsed >= 1) {
						await state.createTimeEntryFromWorkSession(false) // Pasamos false para no mostrar notificación
					}

					// Mostrar notificación de finalización
					state.showNotification('work')

					// Resetear estado
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

				// Emitir evento de stop a otros dispositivos si hay socket
				const lastSyncTime = syncTimerAction('timer:stop', {
					shouldSave: shouldSaveFinal
				}, state)
				if (lastSyncTime) {
					set({ lastSyncTime })
				}

				// Si estamos en modo break o shouldSave es explícitamente false, simplemente reseteamos el timer sin guardar
				if (state.mode === 'break' || shouldSaveFinal === false) {
					console.log('Modo break o shouldSave es false, NO se guardará la entrada')

					// Mostrar notificación de finalización
					state.showNotification('work')

					// Limpiar el intervalo
					setupGlobalInterval(get().tick, 'idle')

					// Resetear estado
					set({
						status: 'idle',
						mode: 'work',
						elapsed: 0,
						currentRepetition: 1,
						workStartTime: null,
						infiniteMode: false,
						selectedEntryId: null,
					})

					return // Salir temprano
				}

				// Solo crear entrada si es modo trabajo, con proyecto seleccionado y tiempo > 1s
				console.log('Condiciones para guardar:', {
					shouldSave,
					shouldSaveFinal,
					mode: state.mode,
					projectId: state.projectId,
					elapsed: state.elapsed,
					workStartTime: state.workStartTime,
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
						elapsedTime: state.elapsed,
						workStartTime: state.workStartTime
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

			setInfiniteMode: (value: boolean) => {
				const state = get()
				if (value && !state.infiniteElapsedTime) {
					// Iniciar el tiempo cuando se activa el modo infinito
					set({ 
						infiniteMode: true,
						infiniteElapsedTime: 0,
						workStartTime: new Date()
					})
				} else if (!value) {
					// Reiniciar el tiempo cuando se desactiva
					set({ 
						infiniteMode: false,
						infiniteElapsedTime: 0,
						workStartTime: null
					})
				}
			},
			setSelectedEntryId: (id) => set({ selectedEntryId: id }),

			tick: () => {
				const state = get()
				if (state.status === 'running') {
					if (state.infiniteMode) {
						// Actualizar tiempo infinito
						const now = new Date()
						const startTime = state.workStartTime ? new Date(state.workStartTime) : now
						const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000)
						
						// Solo actualizar si el tiempo ha cambiado
						if (elapsedSeconds !== state.infiniteElapsedTime) {
							set({ infiniteElapsedTime: elapsedSeconds })
						}
					} else {
						// Lógica existente para modo normal
						const newElapsed = state.elapsed + 1
						const totalTime = state.mode === 'break' ? state.breakDuration * 60 : state.workDuration * 60
						
						// Solo actualizar si no hemos alcanzado el tiempo total
						if (newElapsed <= totalTime) {
							set({ elapsed: newElapsed })
							
							// Si alcanzamos el tiempo total, detener el timer y mostrar notificación
							if (newElapsed === totalTime) {
								// Detener el intervalo inmediatamente
								if (globalTimerInterval !== null) {
									clearInterval(globalTimerInterval)
									globalTimerInterval = null
								}
								
								// Mostrar notificación y reproducir sonido
								state.showNotification(state.mode)
								
								// Cambiar al siguiente estado
								state.switchToNext()
							}
						}
					}
				}
			},

			setWorkDuration: (minutes) =>
				set((state) => {
					// Sync with backend
					timerPresetService.syncCurrentSettings({
						workDuration: minutes,
						breakDuration: state.breakDuration,
						repetitions: state.repetitions
					}).catch(error => {
						console.error('Error syncing work duration:', error)
					})
					return { workDuration: minutes }
				}),
			setBreakDuration: (minutes) =>
				set((state) => {
					// Sync with backend
					timerPresetService.syncCurrentSettings({
						workDuration: state.workDuration,
						breakDuration: minutes,
						repetitions: state.repetitions
					}).catch(error => {
						console.error('Error syncing break duration:', error)
					})
					return { breakDuration: minutes }
				}),
			setRepetitions: (repetitions) =>
				set((state) => {
					// Sync with backend
					timerPresetService.syncCurrentSettings({
						workDuration: state.workDuration,
						breakDuration: state.breakDuration,
						repetitions
					}).catch(error => {
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
					// Asegurarnos de que startTime sea un objeto Date
					let startTime: Date
					if (state.workStartTime instanceof Date) {
						startTime = state.workStartTime
					} else if (typeof state.workStartTime === 'number') {
						startTime = new Date(state.workStartTime)
					} else {
						// Si no hay workStartTime, calcular basado en elapsed
						startTime = new Date(Date.now() - state.elapsed * 1000)
					}

					// Calcular endTime exactamente basado en startTime y elapsed
					const endTime = new Date(startTime.getTime() + state.elapsed * 1000)

					// Solo crear la entrada si la duración es mayor a 1 segundo
					if (state.elapsed > 1) {
						const timeEntry = {
							project: state.projectId,
							task: state.taskId || undefined,
							startTime,
							endTime,
							duration: state.elapsed * 1000, // Convertir a milisegundos
							notes: state.notes || `Work session ${state.currentRepetition}/${state.repetitions}`,
							tags: state.tags,
							isRunning: false
						}

						// Crear la entrada de tiempo
						await timeEntryService.createTimeEntry(timeEntry)

						// Mostrar notificación solo si se solicita y no estamos en modo infinito
						if (showNotification && !state.infiniteMode) {
							state.showNotification('work')
						}

						window.dispatchEvent(new CustomEvent('time-entry-created'))
					}
				} catch (error) {
					console.error('Error creating time entry:', error)
				}
			},

			switchToNext: () => {
				const state = get()
				
				// Si estamos en modo infinito, no hacer nada
				if (state.infiniteMode) {
					return
				}

				if (state.mode === 'work') {
					// Guardar la entrada de tiempo antes de cambiar al modo break
					if (state.projectId) {
						state.createTimeEntryFromWorkSession(false).catch(error => {
							console.error('Error creating time entry:', error)
						})
					}

					if (state.breakDuration > 0) {
						// Cambiar a modo descanso
						set({
							mode: 'break',
							status: 'running',
							elapsed: 0,
							workStartTime: null
						})
						setupGlobalInterval(get().tick, 'running')
						
						// Mostrar notificación después de cambiar el estado
						setTimeout(() => {
							get().showNotification('break')
						}, 100)
					} else {
						// Si no hay descanso configurado, pasar directamente a la siguiente sesión de trabajo
						if (state.currentRepetition < state.repetitions) {
							const nextRepetition = state.currentRepetition + 1
							set({
								mode: 'work',
								status: 'running',
								elapsed: 0,
								currentRepetition: nextRepetition,
								workStartTime: new Date()
							})
							setupGlobalInterval(get().tick, 'running')
							
							// Mostrar notificación después de cambiar el estado
							setTimeout(() => {
								get().showNotification('work')
							}, 100)
						} else {
							// Hemos completado todas las repeticiones
							set({
								mode: 'work',
								status: 'idle',
								elapsed: 0,
								currentRepetition: 1,
								workStartTime: null,
								showCompletionModal: true
							})
							
							// Mostrar notificación después de cambiar el estado
							setTimeout(() => {
								get().showNotification('complete')
							}, 100)
						}
					}
				} else {
					// Estamos en break
					if (state.currentRepetition < state.repetitions) {
						// Cambiar a la siguiente sesión de trabajo
						const nextRepetition = state.currentRepetition + 1
						set({
							mode: 'work',
							status: 'running',
							elapsed: 0,
							currentRepetition: nextRepetition,
							workStartTime: new Date()
						})
						setupGlobalInterval(get().tick, 'running')
						
						// Mostrar notificación después de cambiar el estado
						setTimeout(() => {
							get().showNotification('work')
						}, 100)
					} else {
						// Hemos completado todas las repeticiones
						set({
							mode: 'work',
							status: 'idle',
							elapsed: 0,
							currentRepetition: 1,
							workStartTime: null,
							showCompletionModal: true
						})
						
						// Mostrar notificación después de cambiar el estado
						setTimeout(() => {
							get().showNotification('complete')
						}, 100)
					}
				}
			},

			switchToBreak: () =>
				set((state) => {
					// If in infinite mode, don't switch to break
					if (state.infiniteMode) {
						return state
					}

					// Mostrar notificación de finalización de trabajo
					state.showNotification('work')

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

			switchToWork: (nextRepetition?: number) => {
				const state = get()
				const newRepetition = nextRepetition || state.currentRepetition + 1

				// Reset elapsed time and update state
				set({
					status: 'idle',
					mode: 'work',
					elapsed: 0,
					currentRepetition: newRepetition,
					workStartTime: null
				})

				// Show notification for work session
				get().showNotification('work')

				// Sync the timer state
				syncTimerAction('timer:switch', {
					status: 'idle',
					mode: 'work',
					elapsed: 0,
					currentRepetition: newRepetition
				}, state)
			},

			showNotification: (type: 'work' | 'break' | 'complete') => {
				const state = get()
				// Evitar mostrar notificaciones si el timer está en estado idle
				if (state.status === 'idle') return

				// Usar el servicio de notificación para mostrar el toast y reproducir el sonido
				import('../services/notificationService').then(({ useNotificationStore }) => {
					const notificationStore = useNotificationStore.getState()
					notificationStore.showNotification(type)
				})

				// Mostrar notificación del sistema si está disponible
				if ('Notification' in window && Notification.permission === 'granted') {
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
						icon: '/icon.png'
					})
				}
			},

			setSelectedPresetId: (id: string | null) => set({ selectedPresetId: id }),
		}),
		{
			name: 'timer-storage',
			// Only persist the timer settings, not the current state
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

// Initialize the global interval after the store is created
setTimeout(() => {
	const state = useTimerStore.getState()
	if (state.status === 'running' || state.status === 'break') {
		setupGlobalInterval(state.tick, state.status)
	}
}, 0)
