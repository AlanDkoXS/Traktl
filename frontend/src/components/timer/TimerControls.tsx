import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmModal } from '../ui/ConfirmModal';

interface TimerControlsProps {
  status: 'idle' | 'running' | 'paused' | 'break';
  elapsed: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  skipToNext: () => void;
  projectId: string | null;
  infiniteMode: boolean;
  mode: 'work' | 'break';
}

export const TimerControls = ({ 
  status, 
  elapsed,
  start, 
  pause, 
  resume, 
  stop, 
  skipToNext,
  projectId,
  infiniteMode,
  mode
}: TimerControlsProps) => {
  const { t } = useTranslation();
  const [showShortSessionModal, setShowShortSessionModal] = useState(false);
  const [showShortStopModal, setShowShortStopModal] = useState(false);
  const [modalAction, setModalAction] = useState<'next' | 'stop'>('next');

  const handleSkipToNext = () => {
    // When in infinite mode or in break mode, don't show the warning modal
    if ((status === 'running' && elapsed < 60 && !infiniteMode && mode === 'work') ||
        (status === 'paused' && elapsed < 60 && !infiniteMode && mode === 'work')) {
      setModalAction('next');
      setShowShortSessionModal(true);
      return;
    }
    
    // Otherwise proceed normally
    skipToNext();
  };

  const handleStop = () => {
    // If session is shorter than a minute and in work mode, show confirmation modal
    if ((status === 'running' && elapsed < 60 && mode === 'work') || 
        (status === 'paused' && elapsed < 60 && mode === 'work')) {
      setModalAction('stop');
      setShowShortStopModal(true);
      return;
    }
    
    // Otherwise proceed normally
    stop();
  };

  const handleConfirmShortSession = () => {
    if (modalAction === 'next') {
      skipToNext();
    } else {
      stop();
    }
    setShowShortSessionModal(false);
  };

  const handleCancelShortSession = () => {
    if (modalAction === 'next') {
      // If cancel on next, stop the timer
      stop();
    }
    setShowShortSessionModal(false);
  };

  const handleConfirmShortStop = () => {
    stop();
    setShowShortStopModal(false);
  };

  return (
    <>
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
            className="w-14 h-14 flex items-center justify-center rounded-full dynamic-bg-subtle hover:opacity-90 transition-opacity shadow-sm"
            title={t('timer.start')}
          >
            {/* Simple Play Icon */}
            <svg className="w-7 h-7 dynamic-color" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}

        {status === 'running' && (
          <>
            <button
              onClick={() => pause()}
              className="w-14 h-14 flex items-center justify-center rounded-full dynamic-bg-subtle hover:opacity-90 transition-opacity shadow-sm"
              title={t('timer.pause')}
            >
              {/* Simple Pause Icon */}
              <svg className="w-7 h-7 dynamic-color" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            </button>

            {/* Only show skip button if not in infinite mode */}
            {!infiniteMode && (
              <button
                onClick={handleSkipToNext}
                className="w-14 h-14 flex items-center justify-center rounded-full dynamic-bg-subtle hover:opacity-90 transition-opacity shadow-sm"
                title={t('timer.skipToNext')}
              >
                {/* Simple Skip Icon */}
                <svg className="w-7 h-7 dynamic-color" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            )}
            
            {/* Show infinite icon instead of skip when in infinite mode */}
            {infiniteMode && (
              <div
                className="w-14 h-14 flex items-center justify-center rounded-full dynamic-bg-subtle shadow-sm opacity-70"
                title={t('timer.infiniteMode')}
              >
                {/* Simple Infinity Icon */}
                <svg className="w-7 h-7 dynamic-color" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L7.8 14.39c-.64.64-1.49.99-2.4.99-1.87 0-3.39-1.51-3.39-3.38S3.53 8.62 5.4 8.62c.91 0 1.76.35 2.44 1.03l1.13 1 1.51-1.34L9.22 8.2C8.2 7.18 6.84 6.62 5.4 6.62 2.42 6.62 0 9.04 0 12s2.42 5.38 5.4 5.38c1.44 0 2.8-.56 3.77-1.53l7.03-6.24c.64-.64 1.49-.99 2.4-.99 1.87 0 3.39 1.51 3.39 3.38s-1.52 3.38-3.39 3.38c-.9 0-1.76-.35-2.44-1.03l-1.14-1.01-1.51 1.34 1.27 1.12c1.02 1.01 2.37 1.57 3.82 1.57 2.98 0 5.4-2.41 5.4-5.38s-2.42-5.37-5.4-5.37z" />
                </svg>
              </div>
            )}
            
            <button
              onClick={handleStop}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 hover:opacity-90 transition-opacity shadow-sm"
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
              className="w-14 h-14 flex items-center justify-center rounded-full dynamic-bg-subtle hover:opacity-90 transition-opacity shadow-sm"
              title={t('timer.resume')}
            >
              {/* Simple Play Icon */}
              <svg className="w-7 h-7 dynamic-color" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>

            {/* Only show skip button if not in infinite mode */}
            {!infiniteMode && (
              <button
                onClick={handleSkipToNext}
                className="w-14 h-14 flex items-center justify-center rounded-full dynamic-bg-subtle hover:opacity-90 transition-opacity shadow-sm"
                title={t('timer.skipToNext')}
              >
                {/* Simple Skip Icon */}
                <svg className="w-7 h-7 dynamic-color" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            )}
            
            {/* Show infinite icon instead of skip when in infinite mode */}
            {infiniteMode && (
              <div
                className="w-14 h-14 flex items-center justify-center rounded-full dynamic-bg-subtle shadow-sm opacity-70"
                title={t('timer.infiniteMode')}
              >
                {/* Simple Infinity Icon */}
                <svg className="w-7 h-7 dynamic-color" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L7.8 14.39c-.64.64-1.49.99-2.4.99-1.87 0-3.39-1.51-3.39-3.38S3.53 8.62 5.4 8.62c.91 0 1.76.35 2.44 1.03l1.13 1 1.51-1.34L9.22 8.2C8.2 7.18 6.84 6.62 5.4 6.62 2.42 6.62 0 9.04 0 12s2.42 5.38 5.4 5.38c1.44 0 2.8-.56 3.77-1.53l7.03-6.24c.64-.64 1.49-.99 2.4-.99 1.87 0 3.39 1.51 3.39 3.38s-1.52 3.38-3.39 3.38c-.9 0-1.76-.35-2.44-1.03l-1.14-1.01-1.51 1.34 1.27 1.12c1.02 1.01 2.37 1.57 3.82 1.57 2.98 0 5.4-2.41 5.4-5.38s-2.42-5.37-5.4-5.37z" />
                </svg>
              </div>
            )}
            
            <button
              onClick={handleStop}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 hover:opacity-90 transition-opacity shadow-sm"
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
              className="w-14 h-14 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 hover:opacity-90 transition-opacity shadow-sm"
              title={t('timer.pause')}
            >
              {/* Simple Pause Icon */}
              <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            </button>

            <button
              onClick={handleSkipToNext}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 hover:opacity-90 transition-opacity shadow-sm"
              title={t('timer.skipToNext')}
            >
              {/* Simple Skip Icon */}
              <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
            
            <button
              onClick={handleStop}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 hover:opacity-90 transition-opacity shadow-sm"
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

      {/* Short session modal for Next button (only for work mode) */}
      <ConfirmModal
        isOpen={showShortSessionModal}
        title={t('timeEntries.shortTimeTitle', 'Short Session')}
        message={t('timeEntries.shortTimeMessage', 'This session is less than a minute. Do you still want to save it?')}
        confirmButtonText={t('common.yes')}
        cancelButtonText={t('common.no')}
        onConfirm={handleConfirmShortSession}
        onCancel={handleCancelShortSession}
        isLoading={false}
        danger={false}
      />

      {/* Short session modal for Stop button */}
      <ConfirmModal
        isOpen={showShortStopModal}
        title={t('timeEntries.shortTimeTitle', 'Short Session')}
        message={t('timeEntries.shortTimeMessage', 'This session is less than a minute. Do you still want to save it?')}
        confirmButtonText={t('common.yes')}
        cancelButtonText={t('common.no')}
        onConfirm={handleConfirmShortStop}
        onCancel={() => setShowShortStopModal(false)}
        isLoading={false}
        danger={false}
      />
    </>
  );
};
