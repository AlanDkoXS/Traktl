import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { showTimerNotification } from '../utils/notifications/TimerNotifications';
import { timeEntryService } from '../services/timeEntryService';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'break';
export type TimerMode = 'work' | 'break';

interface TimerState {
	status: TimerStatus;
	mode: TimerMode;
	elapsed: number; // Time elapsed in milliseconds
	workDuration: number; // Duration in minutes
	breakDuration: number; // Duration in minutes
	repetitions: number;
	currentRepetition: number;
	projectId: string | null;
	taskId: string | null;
	notes: string;
	tags: string[];
	workStartTime: Date | null; // Track when the work period started
	showCompletionModal: boolean; // Flag for completion modal

	// Actions
	start: (projectId?: string | null, taskId?: string | null) => void;
	pause: () => void;
	resume: () => void;
	stop: () => void;
	reset: () => void;
	closeCompletionModal: () => void;

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
	switchToWork: (nextRepetition?: number) => void; // Modified function

	// Helper to create time entries
	createTimeEntryFromWorkSession: () => Promise<void>;
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

			start: (projectId = null, taskId = null) =>
				set((state) => {
					if (state.status === 'idle' || state.status === 'paused') {
						return {
							status: 'running',
							projectId: projectId || state.projectId,
							taskId: taskId || state.taskId,
							elapsed: state.status === 'paused' ? state.elapsed : 0,
							workStartTime: state.mode === 'work' ? new Date() : state.workStartTime,
							showCompletionModal: false
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
				// Access current state in the callback
				const state = get();

				// Only create a time entry if in work mode with a project selected
				// and elapsed time is at least 1 second
				if (state.mode === 'work' && state.projectId && state.elapsed >= 1000) {
					await state.createTimeEntryFromWorkSession();
				}

				// Reset timer state
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
					showCompletionModal: false
				})),

			closeCompletionModal: () => set({ showCompletionModal: false }),

			tick: (delta) =>
				set((state) => {
					if (state.status === 'running') {
						const newElapsed = state.elapsed + delta;
						const totalDuration =
							state.mode === 'work'
								? state.workDuration * 60 * 1000
								: state.breakDuration * 60 * 1000;

						// If the timer has finished its current phase
						if (newElapsed >= totalDuration) {
							// If we're in work mode, create time entry and switch to break
							if (state.mode === 'work') {
								// We'll handle the time entry creation in the next tick
								// to avoid async operations here
								setTimeout(() => {
									if (state.projectId) {
										get().createTimeEntryFromWorkSession();
									}

									// If break duration is 0, switch directly to the next work session
									if (state.breakDuration === 0) {
										// If we haven't completed all repetitions, start a new work period
										if (state.currentRepetition < state.repetitions) {
											get().switchToWork(state.currentRepetition + 1);
										} else {
											// If we've completed all repetitions, stop the timer and show modal
											setTimeout(() => {
												showTimerNotification('complete', {
													title: 'All Sessions Completed',
													body: "Great job! You've completed all your work sessions.",
													persistent: true,
												});
											}, 0);

											get().reset();
											set({ showCompletionModal: true });
										}
									} else {
										// Show notification for switching to break
										showTimerNotification('break', {
											title: 'Break Time',
											body: 'Work session completed! Time for a break.',
											persistent: false,
										});
									}
								}, 0);

								// If break duration is 0, don't change to break state
								if (state.breakDuration === 0) {
									return state; // State will change in setTimeout
								}

								return {
									mode: 'break',
									status: 'running',
									elapsed: 0,
									workStartTime: null,
								};
							}
							// If we're in break mode
							else {
								// If we haven't completed all repetitions, start a new work period
								if (state.currentRepetition < state.repetitions) {
									// Show notification for completed break
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
								// If we've completed all repetitions, stop the timer and show modal
								else {
									// Show notification for all sessions completed
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
										showCompletionModal: true
									};
								}
							}
						}

						// Otherwise, just update the elapsed time
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

			// Function to create a time entry from the current work session
			createTimeEntryFromWorkSession: async () => {
				const state = get();

				// Skip if not in work mode or no project selected
				if (!state.projectId) {
					console.log('No project selected, skipping time entry creation');
					return;
				}

				try {
					const startTime = state.workStartTime || new Date(Date.now() - state.elapsed);
					const endTime = new Date();
					let duration = endTime.getTime() - startTime.getTime();
					
					// Round up to a full minute if between 59-60 seconds
					const seconds = Math.floor(duration / 1000);
					if (seconds >= 59 && seconds < 60) {
						duration = 60000; // Exactly one minute in milliseconds
					}
					
					const durationMinutes = Math.floor(duration / 60000);

					// Only create entries longer than 1 second
					if (duration < 1000) {
						console.log('Session too short, skipping time entry creation');
						return;
					}

					console.log('Creating time entry from work session:', {
						project: state.projectId,
						task: state.taskId,
						startTime,
						endTime,
						duration,
						notes: state.notes,
						tags: state.tags,
					});

					// Use the time entry store directly
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
					});

					// Show notification for created time entry
					showTimerNotification('timeEntry', {
						title: 'Time Entry Created',
						body: `Time entry of ${durationMinutes} minutes has been recorded`,
						persistent: false,
					});

					console.log('Time entry created successfully');
				} catch (error) {
					console.error('Error creating time entry from work session:', error);
				}
			},

			// Function to manually switch to the next phase (work -> break or break -> work)
			switchToNext: () =>
				set((state) => {
					// If we're in work mode, create time entry and switch to break
					if (state.mode === 'work' && state.projectId) {
						// Create time entry in the next tick
						setTimeout(() => {
							// Only create entry if at least 1 second has passed
							if (state.elapsed >= 1000) {
								get().createTimeEntryFromWorkSession();
							}

							// Show notification for switching to break
							showTimerNotification('break', {
								title: 'Break Time',
								body: 'Work session completed! Time for a break.',
								persistent: false,
							});
						}, 0);

						// If break duration is 0, switch directly to work
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
					// If we're in break mode
					else {
						// Show notification for switching to work
						setTimeout(() => {
							showTimerNotification('work', {
								title: 'Work Time',
								body: 'Break completed! Back to work.',
								persistent: false,
							});
						}, 0);

						// If we haven't completed all repetitions, start a new work period
						if (state.currentRepetition < state.repetitions) {
							return {
								mode: 'work',
								status: 'running',
								elapsed: 0,
								currentRepetition: state.currentRepetition + 1,
								workStartTime: new Date(),
							};
						}
						// If we've completed all repetitions, stop and show modal
						else {
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
								showCompletionModal: true
							};
						}
					}
				}),

			switchToBreak: () =>
				set((state) => {
					// Create time entry if switching from work mode with a project
					if (state.mode === 'work' && state.projectId && state.elapsed >= 1000) {
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

			// Modified to allow setting the repetition
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
