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
}

export const TimerControls = ({ 
  status, 
  elapsed,
  start, 
  pause, 
  resume, 
  stop, 
  skipToNext,
  projectId
}: TimerControlsProps) => {
  const { t } = useTranslation();
  const [showShortSessionModal, setShowShortSessionModal] = useState(false);
  const [showShortStopModal, setShowShortStopModal] = useState(false);
  const [modalAction, setModalAction] = useState<'next' | 'stop'>('next');

  const handleSkipToNext = () => {
    // If session is shorter than a minute, show confirmation modal
    if (status === 'running' && elapsed < 60000) {
      setModalAction('next');
      setShowShortSessionModal(true);
      return;
    }
    
    // Otherwise proceed normally
    skipToNext();
  };

  const handleStop = () => {
    // If session is shorter than a minute, show confirmation modal
    if (status === 'running' && elapsed < 60000) {
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

      {/* Short session modal for Next button */}
      <ConfirmModal
        isOpen={showShortSessionModal}
        title={t('timeEntries.shortTimeTitle', 'Short Session')}
        message={t('timeEntries.shortTimeMessage', 'This session is less than a minute long. Do you still want to save it?')}
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
        message={t('timeEntries.shortTimeMessage', 'This session is less than a minute long. Do you still want to save it?')}
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
