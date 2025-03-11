import { useTranslation } from 'react-i18next';

interface TimerSettingsProps {
  workDuration: number;
  breakDuration: number;
  repetitions: number;
  status: 'idle' | 'running' | 'paused' | 'break';
  setWorkDuration: (minutes: number) => void;
  setBreakDuration: (minutes: number) => void;
  setRepetitions: (repetitions: number) => void;
}

export const TimerSettings = ({ 
  workDuration, 
  breakDuration, 
  repetitions, 
  status,
  setWorkDuration, 
  setBreakDuration, 
  setRepetitions
}: TimerSettingsProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 mt-6">
      <div>
        <label
          htmlFor="work-duration"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('timer.workDuration')} ({workDuration} min)
        </label>
        <input
          id="work-duration"
          type="range"
          min="1"
          max="60"
          value={workDuration}
          onChange={(e) => setWorkDuration(parseInt(e.target.value))}
          disabled={status !== 'idle'}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div>
        <label
          htmlFor="break-duration"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('timer.breakDuration')} ({breakDuration} min)
        </label>
        <input
          id="break-duration"
          type="range"
          min="1"
          max="30"
          value={breakDuration}
          onChange={(e) => setBreakDuration(parseInt(e.target.value))}
          disabled={status !== 'idle'}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div>
        <label
          htmlFor="repetitions"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('timer.repetitions')} ({repetitions})
        </label>
        <input
          id="repetitions"
          type="range"
          min="1"
          max="10"
          value={repetitions}
          onChange={(e) => setRepetitions(parseInt(e.target.value))}
          disabled={status !== 'idle'}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};
