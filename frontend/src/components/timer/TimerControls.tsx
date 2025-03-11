import { useTranslation } from 'react-i18next';
import { PlayIcon, PauseIcon, StopIcon, ForwardIcon } from '@heroicons/react/24/solid';

interface TimerControlsProps {
  status: 'idle' | 'running' | 'paused' | 'break';
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  skipToNext: () => void;
  projectId: string | null;
}

export const TimerControls = ({ 
  status, 
  start, 
  pause, 
  resume, 
  stop, 
  skipToNext,
  projectId
}: TimerControlsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center space-x-4 mb-6">
      {status === 'idle' && (
        <button
          onClick={() => {
            if (!projectId) {
              alert(t('timeEntries.selectProject'));
              return;
            }
            start();
          }}
          className="flex items-center justify-center p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md m-2"
        >
          <PlayIcon className="h-8 w-8" />
          <span className="sr-only">{t('timer.start')}</span>
        </button>
      )}

      {status === 'running' && (
        <>
          <button
            onClick={() => pause()}
            className="flex items-center justify-center p-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-md m-2"
          >
            <PauseIcon className="h-8 w-8" />
            <span className="sr-only">{t('timer.pause')}</span>
          </button>

          <button
            onClick={() => skipToNext()}
            className="flex items-center justify-center p-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-md m-2"
            title={t('timer.skipToNext')}
          >
            <ForwardIcon className="h-8 w-8" />
            <span className="sr-only">{t('timer.skipToNext')}</span>
          </button>
        </>
      )}

      {status === 'paused' && (
        <>
          <button
            onClick={() => resume()}
            className="flex items-center justify-center p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md m-2"
          >
            <PlayIcon className="h-8 w-8" />
            <span className="sr-only">{t('timer.resume')}</span>
          </button>

          <button
            onClick={() => skipToNext()}
            className="flex items-center justify-center p-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-md m-2"
            title={t('timer.skipToNext')}
          >
            <ForwardIcon className="h-8 w-8" />
            <span className="sr-only">{t('timer.skipToNext')}</span>
          </button>
        </>
      )}

      {(status === 'running' || status === 'paused') && (
        <button
          onClick={() => stop()}
          className="flex items-center justify-center p-3 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md m-2"
        >
          <StopIcon className="h-8 w-8" />
          <span className="sr-only">{t('timer.stop')}</span>
        </button>
      )}
    </div>
  );
};
