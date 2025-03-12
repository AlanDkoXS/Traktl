import { useTranslation } from 'react-i18next';

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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          <span className="sr-only">{t('timer.start')}</span>
        </button>
      )}

      {status === 'running' && (
        <>
          <button
            onClick={() => pause()}
            className="flex items-center justify-center p-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-md m-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="sr-only">{t('timer.pause')}</span>
          </button>

          <button
            onClick={() => skipToNext()}
            className="flex items-center justify-center p-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-md m-2"
            title={t('timer.skipToNext')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7.858 5.485a1 1 0 00-1.715 1.03L7.633 9H7a1 1 0 100 2h1.834l-1.626 2.715a1 1 0 001.715 1.03l2.392-3.985a1 1 0 00.009-1.03L8.932 5.485a1 1 0 00-.063-.013A1 1 0 007.858 5.485zM12 9a1 1 0 100 2h.01a1 1 0 100-2H12z" clipRule="evenodd" />
            </svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span className="sr-only">{t('timer.resume')}</span>
          </button>

          <button
            onClick={() => skipToNext()}
            className="flex items-center justify-center p-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-md m-2"
            title={t('timer.skipToNext')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7.858 5.485a1 1 0 00-1.715 1.03L7.633 9H7a1 1 0 100 2h1.834l-1.626 2.715a1 1 0 001.715 1.03l2.392-3.985a1 1 0 00.009-1.03L8.932 5.485a1 1 0 00-.063-.013A1 1 0 007.858 5.485zM12 9a1 1 0 100 2h.01a1 1 0 100-2H12z" clipRule="evenodd" />
            </svg>
            <span className="sr-only">{t('timer.skipToNext')}</span>
          </button>
        </>
      )}

      {(status === 'running' || status === 'paused') && (
        <button
          onClick={() => stop()}
          className="flex items-center justify-center p-3 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md m-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
          </svg>
          <span className="sr-only">{t('timer.stop')}</span>
        </button>
      )}
    </div>
  );
};
