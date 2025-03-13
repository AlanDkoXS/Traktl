import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { showTimerNotification } from '../utils/notifications/TimerNotifications';
import { timeEntryService } from '../services/timeEntryService';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'break';
export type TimerMode = 'work' | 'break';

interface TimerState {
	status: TimerStatus;
	mode: TimerMode;
	elapsed: number; // Tiempo transcurrido en milisegundos
	workDuration: number; // Duración en minutos
	breakDuration: number; // Duración en minutos
	repetitions: number;
	currentRepetition: number;
	projectId: string | null;
	taskId: string | null;
	notes: string;
	tags: string[];
	workStartTime: Date | null; // Seguimiento de cuándo comenzó el período de trabajo

	// Acciones
	start: (projectId?: string | null, taskId?: string | null) => void;
	pause: () => void;
	resume: () => void;
	stop: () => void;
	reset: () => void;

	tick: (delta: number) => void;
	setWorkDuration: (minutes: number) => void;
	setBreakDuration: (minutes: number) => void;
	setRepetitions: (repetitions: number) => void;
	setProjectId: (projectId: string | null) => void;
	setTaskId: (taskId: string | null) => void;
	setNotes: (notes: string) => void;
	setTags: (tags: string[]) => void;

	switchToNext: () => void;
	switchToBreak: () => void;
	switchToWork: (nextRepetition?: number) => void; // Función modificada

	// Helper para crear entradas de tiempo
	createTimeEntryFromWorkSession: () => Promise<void>;
}

export const useTimerStore = create<TimerState>()(
	persist(
		(set, get) => ({
			status: 'idle',
			mode: 'work',
			elapsed: 0,
			workDuration: 25, // Por defecto 25 minutos
			breakDuration: 5, // Por defecto 5 minutos
			repetitions: 4, // Por defecto 4 repeticiones
			currentRepetition: 1,
			projectId: null,
			taskId: null,
			notes: '',
			tags: [],
			workStartTime: null,

			start: (projectId = null, taskId = null) =>
				set((state) => {
					if (state.status === 'idle' || state.status === 'paused') {
						return {
							status: 'running',
							projectId: projectId || state.projectId,
							taskId: taskId || state.taskId,
							elapsed: state.status === 'paused' ? state.elapsed : 0,
							workStartTime: state.mode === 'work' ? new Date() : state.workStartTime,
						};
					}
					return state;
				}),

			pause: () =>
				set((state) => {
					if (state.status === 'running') {
						return { status: 'paused' };
					}
					return state;
				}),

			resume: () =>
				set((state) => {
					if (state.status === 'paused') {
						return { status: 'running' };
					}
					return state;
				}),

			stop: async () => {
				// Acceder al estado actual en la devolución de llamada set
				const state = get();

				// Crear una entrada de tiempo si está en modo trabajo y tiene un proyecto seleccionado
				if (state.mode === 'work' && state.projectId) {
					await state.createTimeEntryFromWorkSession();
				}

				// Restablecer el estado del temporizador
				set({
					status: 'idle',
					elapsed: 0,
					workStartTime: null,
				});
			},

			reset: () =>
				set(() => ({
					status: 'idle',
					mode: 'work',
					elapsed: 0,
					currentRepetition: 1,
					projectId: null,
					taskId: null,
					notes: '',
					tags: [],
					workStartTime: null,
				})),

			tick: (delta) =>
				set((state) => {
					if (state.status === 'running') {
						const newElapsed = state.elapsed + delta;
						const totalDuration =
							state.mode === 'work'
								? state.workDuration * 60 * 1000
								: state.breakDuration * 60 * 1000;

						// Si el temporizador ha finalizado su fase actual
						if (newElapsed >= totalDuration) {
							// Si estamos en modo trabajo, crear entrada de tiempo y cambiar a descanso
							if (state.mode === 'work') {
								// Manejaremos la creación de entrada de tiempo en el siguiente tick
								// para evitar operaciones asíncronas aquí
								setTimeout(() => {
									get().createTimeEntryFromWorkSession();

									// Si el tiempo de descanso es 0, pasar directamente a la siguiente sesión de trabajo
									if (state.breakDuration === 0) {
										// Si no hemos completado todas las repeticiones, comenzar un nuevo período de trabajo
										if (state.currentRepetition < state.repetitions) {
											get().switchToWork(state.currentRepetition + 1);
										} else {
											// Si hemos completado todas las repeticiones, detener el temporizador
											setTimeout(() => {
												showTimerNotification('complete', {
													title: 'All Sessions Completed',
													body: "Great job! You've completed all your work sessions.",
													persistent: true,
												});
											}, 0);

											get().reset();
										}
									} else {
										// Mostrar notificación para cambiar a descanso
										showTimerNotification('break', {
											title: 'Break Time',
											body: 'Work session completed! Time for a break.',
											persistent: false,
										});
									}
								}, 0);

								// Si el tiempo de descanso es 0, no cambiamos a estado de descanso
								if (state.breakDuration === 0) {
									return state; // El estado cambiará en el setTimeout
								}

								return {
									mode: 'break',
									status: 'running',
									elapsed: 0,
									workStartTime: null,
								};
							}
							// Si estamos en modo descanso
							else {
								// Si no hemos completado todas las repeticiones, comenzar un nuevo período de trabajo
								if (state.currentRepetition < state.repetitions) {
									// Mostrar notificación para descanso completado
									setTimeout(() => {
										showTimerNotification('work', {
											title: 'Work Time',
											body: 'Break completed! Back to work.',
											persistent: false,
										});
									}, 0);

									return {
										mode: 'work',
										status: 'running',
										elapsed: 0,
										currentRepetition: state.currentRepetition + 1,
										workStartTime: new Date(),
									};
								}
								// Si hemos completado todas las repeticiones, detener el temporizador
								else {
									// Mostrar notificación para todas las sesiones completadas
									setTimeout(() => {
										showTimerNotification('complete', {
											title: 'All Sessions Completed',
											body: "Great job! You've completed all your work sessions.",
											persistent: true,
										});
									}, 0);

									return {
										mode: 'work',
										status: 'idle',
										elapsed: 0,
										currentRepetition: 1,
										workStartTime: null,
									};
								}
							}
						}

						// De lo contrario, solo actualizar el tiempo transcurrido
						return { elapsed: newElapsed };
					}
					return state;
				}),

			setWorkDuration: (minutes) => set(() => ({ workDuration: minutes })),
			setBreakDuration: (minutes) => set(() => ({ breakDuration: minutes })),
			setRepetitions: (repetitions) => set(() => ({ repetitions })),
			setProjectId: (projectId) => set(() => ({ projectId })),
			setTaskId: (taskId) => set(() => ({ taskId })),
			setNotes: (notes) => set(() => ({ notes })),
			setTags: (tags) => set(() => ({ tags })),

			// Función para crear una entrada de tiempo a partir de la sesión de trabajo actual
			createTimeEntryFromWorkSession: async () => {
				const state = get();

				// Omitir si no está en modo trabajo o no hay proyecto seleccionado
				if (!state.projectId) {
					console.log(
						'No hay proyecto seleccionado, omitiendo la creación de entrada de tiempo'
					);
					return;
				}

				try {
					const startTime = state.workStartTime || new Date(Date.now() - state.elapsed);
					const endTime = new Date();
					const duration = endTime.getTime() - startTime.getTime();
					const durationMinutes = Math.floor(duration / 60000);

					console.log('Creando entrada de tiempo a partir de la sesión de trabajo:', {
						project: state.projectId,
						task: state.taskId,
						startTime,
						endTime,
						duration,
						notes: state.notes,
						tags: state.tags,
					});

					// Usar el servicio de entrada de tiempo directamente
					await timeEntryService.createTimeEntry({
						project: state.projectId,
						task: state.taskId || undefined,
						startTime,
						endTime,
						duration,
						notes:
							state.notes ||
							`Sesión de trabajo ${state.currentRepetition}/${state.repetitions}`,
						tags: state.tags,
						isRunning: false,
					});

					// Mostrar notificación para entrada de tiempo creada
					showTimerNotification('timeEntry', {
						title: 'Time Entry Created',
						body: `Time entry of ${durationMinutes} minutes has been recorded`,
						persistent: false,
					});

					console.log('Entrada de tiempo creada con éxito');
				} catch (error) {
					console.error(
						'Error al crear entrada de tiempo desde la sesión de trabajo:',
						error
					);
				}
			},

			// Nueva función para cambiar manualmente a la siguiente fase (trabajo -> descanso o descanso -> trabajo)
			switchToNext: () =>
				set((state) => {
					// Si estamos en modo trabajo, crear entrada de tiempo y cambiar a descanso
					if (state.mode === 'work' && state.projectId) {
						// Crear entrada de tiempo en el siguiente tick
						setTimeout(() => {
							get().createTimeEntryFromWorkSession();

							// Mostrar notificación para cambiar a descanso
							showTimerNotification('break', {
								title: 'Break Time',
								body: 'Work session completed! Time for a break.',
								persistent: false,
							});
						}, 0);

						// Si el tiempo de descanso es 0, cambiamos directamente a trabajo
						if (state.breakDuration === 0) {
							const nextRepetition =
								state.currentRepetition < state.repetitions
									? state.currentRepetition + 1
									: 1;

							return {
								mode: 'work',
								status: 'running',
								elapsed: 0,
								currentRepetition: nextRepetition,
								workStartTime: new Date(),
							};
						}

						return {
							mode: 'break',
							status: 'running',
							elapsed: 0,
							workStartTime: null,
						};
					}
					// Si estamos en modo descanso
					else {
						// Mostrar notificación para cambiar a trabajo
						setTimeout(() => {
							showTimerNotification('work', {
								title: 'Work Time',
								body: 'Break completed! Back to work.',
								persistent: false,
							});
						}, 0);

						// Si no hemos completado todas las repeticiones, comenzar un nuevo período de trabajo
						if (state.currentRepetition < state.repetitions) {
							return {
								mode: 'work',
								status: 'running',
								elapsed: 0,
								currentRepetition: state.currentRepetition + 1,
								workStartTime: new Date(),
							};
						}
						// Si hemos completado todas las repeticiones, comenzar de nuevo
						else {
							return {
								mode: 'work',
								status: 'running',
								elapsed: 0,
								currentRepetition: 1,
								workStartTime: new Date(),
							};
						}
					}
				}),

			switchToBreak: () =>
				set((state) => {
					// Crear entrada de tiempo si se cambia del modo trabajo con un proyecto
					if (state.mode === 'work' && state.projectId) {
						setTimeout(() => {
							get().createTimeEntryFromWorkSession();
						}, 0);
					}

					return {
						mode: 'break',
						elapsed: 0,
						workStartTime: null,
					};
				}),

			// Modificado para permitir establecer la repetición
			switchToWork: (nextRepetition) =>
				set(() => ({
					mode: 'work',
					elapsed: 0,
					currentRepetition: nextRepetition || 1,
					workStartTime: new Date(),
				})),
		}),
		{
			name: 'timer-storage',
			partialize: (state) => ({
				workDuration: state.workDuration,
				breakDuration: state.breakDuration,
				repetitions: state.repetitions,
				projectId: state.projectId,
				taskId: state.taskId,
				notes: state.notes,
				tags: state.tags,
			}),
		}
	)
);
