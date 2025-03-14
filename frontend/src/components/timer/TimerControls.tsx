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
  isInfiniteMode: boolean;
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
  isInfiniteMode
}: TimerControlsProps) => {
  const { t } = useTranslation();
  const [showShortStopModal, setShowShortStopModal] = useState(false);

  const handleStop = () => {
    // Si estamos en modo infinito o si la sesión es más larga que un minuto,
    // detenemos directamente sin mostrar confirmación
    if (isInfiniteMode || elapsed >= 60000) {
      stop();
      return;
    }
    
    // Solo mostrar confirmación para sesiones cortas (no en modo infinito)
    setShowShortStopModal(true);
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

            {/* Mostrar el botón de "Siguiente" solo si NO estamos en modo infinito */}
            {!isInfiniteMode && (
              <button
                onClick={skipToNext}
                className="w-14 h-14 flex items-center justify-center rounded-full dynamic-bg-subtle hover:opacity-90 transition-opacity shadow-sm"
                title={t('timer.skipToNext')}
              >
                {/* Simple Skip Icon */}
                <svg className="w-7 h-7 dynamic-color" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
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

            {/* Mostrar el botón de "Siguiente" solo si NO estamos en modo infinito */}
            {!isInfiniteMode && (
              <button
                onClick={skipToNext}
                className="w-14 h-14 flex items-center justify-center rounded-full dynamic-bg-subtle hover:opacity-90 transition-opacity shadow-sm"
                title={t('timer.skipToNext')}
              >
                {/* Simple Skip Icon */}
                <svg className="w-7 h-7 dynamic-color" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
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

            {/* Siempre mostrar el botón de "Siguiente" en modo break */}
            <button
              onClick={skipToNext}
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
