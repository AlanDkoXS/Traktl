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
    <div className="flex justify-center space-x-6 mt-8 mb-6">
      {status === 'idle' && (
        <button
          onClick={() => {
            if (!projectId) {
              alert(t('timeEntries.selectProject'));
              return;
            }
            start();
          }}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
          title={t('timer.start')}
        >
          {/* Simple Play Icon */}
          <svg className="w-7 h-7 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}

      {status === 'running' && (
        <>
          <button
            onClick={() => pause()}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
            title={t('timer.pause')}
          >
            {/* Simple Pause Icon */}
            <svg className="w-7 h-7 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          </button>

          <button
            onClick={() => skipToNext()}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
            title={t('timer.skipToNext')}
          >
            {/* Simple Skip Icon */}
            <svg className="w-7 h-7 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
          
          <button
            onClick={() => stop()}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            title={t('timer.stop')}
          >
            {/* Simple Stop Icon */}
            <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6h12v12H6z" />
            </svg>
          </button>
        </>
      )}

      {status === 'paused' && (
        <>
          <button
            onClick={() => resume()}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
            title={t('timer.resume')}
          >
            {/* Simple Play Icon */}
            <svg className="w-7 h-7 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>

          <button
            onClick={() => skipToNext()}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
            title={t('timer.skipToNext')}
          >
            {/* Simple Skip Icon */}
            <svg className="w-7 h-7 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
          
          <button
            onClick={() => stop()}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            title={t('timer.stop')}
          >
            {/* Simple Stop Icon */}
            <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6h12v12H6z" />
            </svg>
          </button>
        </>
      )}

      {status === 'break' && (
        <>
          <button
            onClick={() => pause()}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
            title={t('timer.pause')}
          >
            {/* Simple Pause Icon */}
            <svg className="w-7 h-7 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          </button>

          <button
            onClick={() => skipToNext()}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
            title={t('timer.skipToNext')}
          >
            {/* Simple Skip Icon */}
            <svg className="w-7 h-7 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
          
          <button
            onClick={() => stop()}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            title={t('timer.stop')}
          >
            {/* Simple Stop Icon */}
            <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6h12v12H6z" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};
