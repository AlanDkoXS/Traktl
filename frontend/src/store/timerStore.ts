import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

	// Actions
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
	switchToWork: () => void;
}

export const useTimerStore = create<TimerState>()(
	persist(
		(set) => ({
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

			start: (projectId = null, taskId = null) =>
				set((state) => {
					if (state.status === 'idle' || state.status === 'paused') {
						return {
							status: 'running',
							projectId: projectId || state.projectId,
							taskId: taskId || state.taskId,
							elapsed: state.status === 'paused' ? state.elapsed : 0,
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

			stop: () =>
				set(() => ({
					status: 'idle',
					elapsed: 0,
				})),

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
				})),

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
							// If we're in work mode, switch to break mode
							if (state.mode === 'work') {
								return {
									mode: 'break',
									status: 'running',
									elapsed: 0,
								};
							}
							// If we're in break mode
							else {
								// If we haven't completed all repetitions, start a new work period
								if (state.currentRepetition < state.repetitions) {
									return {
										mode: 'work',
										status: 'running',
										elapsed: 0,
										currentRepetition: state.currentRepetition + 1,
									};
								}
								// If we've completed all repetitions, stop the timer
								else {
									return {
										mode: 'work',
										status: 'idle',
										elapsed: 0,
										currentRepetition: 1,
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

			// New function to manually switch to the next phase (work -> break or break -> work)
			switchToNext: () =>
				set((state) => {
					// If we're in work mode, switch to break mode
					if (state.mode === 'work') {
						return {
							mode: 'break',
							status: 'running',
							elapsed: 0,
						};
					}
					// If we're in break mode
					else {
						// If we haven't completed all repetitions, start a new work period
						if (state.currentRepetition < state.repetitions) {
							return {
								mode: 'work',
								status: 'running',
								elapsed: 0,
								currentRepetition: state.currentRepetition + 1,
							};
						}
						// If we've completed all repetitions, start over
						else {
							return {
								mode: 'work',
								status: 'running',
								elapsed: 0,
								currentRepetition: 1,
							};
						}
					}
				}),

			switchToBreak: () =>
				set(() => ({
					mode: 'break',
					elapsed: 0,
				})),

			switchToWork: () =>
				set(() => ({
					mode: 'work',
					elapsed: 0,
				})),
		}),
		{
			name: 'timer-storage',
		}
	)
);
