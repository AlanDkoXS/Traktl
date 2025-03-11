import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useTimeEntryStore } from './timeEntryStore';

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
  
  // Helper for creating time entries
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
        // First save the state to use it for time entry creation
        const state = get();
        
        // Create a time entry if in work mode and have a project selected
        if (state.mode === 'work' && state.projectId) {
          await get().createTimeEntryFromWorkSession();
        }
        
        // Then reset the timer state
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

            // If the timer has finished its current phase
            if (newElapsed >= totalDuration) {
              // If we're in work mode, create time entry and switch to break
              if (state.mode === 'work') {
                // We'll handle the time entry creation in the next tick
                // to avoid async operations here
                setTimeout(() => {
                  get().createTimeEntryFromWorkSession();
                }, 0);
                
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
                  return {
                    mode: 'work',
                    status: 'running',
                    elapsed: 0,
                    currentRepetition: state.currentRepetition + 1,
                    workStartTime: new Date(),
                  };
                }
                // If we've completed all repetitions, stop the timer
                else {
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

      // Function to create a time entry from current work session
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
          const duration = endTime.getTime() - startTime.getTime();
          
          console.log('Creating time entry from work session:', {
            project: state.projectId,
            task: state.taskId,
            startTime,
            endTime,
            duration,
            notes: state.notes,
            tags: state.tags,
          });
          
          // Use the time entry store to create the entry
          const timeEntryStore = useTimeEntryStore.getState();
          
          await timeEntryStore.createTimeEntry({
            project: state.projectId,
            task: state.taskId || undefined,
            startTime,
            endTime,
            duration,
            notes: state.notes || `Work session ${state.currentRepetition}/${state.repetitions}`,
            tags: state.tags,
            isRunning: false,
          });
          
          console.log('Time entry created successfully');
        } catch (error) {
          console.error('Error creating time entry from work session:', error);
        }
      },

      // New function to manually switch to the next phase (work -> break or break -> work)
      switchToNext: () =>
        set((state) => {
          // If we're in work mode, create time entry and switch to break
          if (state.mode === 'work' && state.projectId) {
            // Create time entry in the next tick
            setTimeout(() => {
              get().createTimeEntryFromWorkSession();
            }, 0);
            
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
              return {
                mode: 'work',
                status: 'running',
                elapsed: 0,
                currentRepetition: state.currentRepetition + 1,
                workStartTime: new Date(),
              };
            }
            // If we've completed all repetitions, start over
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
          // Create time entry if switching from work mode with a project
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

      switchToWork: () =>
        set(() => ({
          mode: 'work',
          elapsed: 0,
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
