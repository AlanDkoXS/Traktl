import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TimerAlertModalProps {
  isOpen: boolean;
  message: string;
  type: 'work' | 'break';
  onClose: () => void;
  autoCloseDelay?: number;
}

export const TimerAlertModal = ({
  isOpen,
  message,
  type,
  onClose,
  autoCloseDelay = 4000
}: TimerAlertModalProps) => {
  const { t } = useTranslation();
  const [isClosing, setIsClosing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Handle auto-close and progress bar
  useEffect(() => {
    if (!isOpen) return;
    
    const startTime = Date.now();
    const endTime = startTime + autoCloseDelay;
    
    // Update progress every 50ms
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const newProgress = Math.min((elapsed / autoCloseDelay) * 100, 100);
      setProgress(newProgress);
      
      // Start closing animation when time is almost up
      if (now >= endTime - 500 && !isClosing) {
        setIsClosing(true);
        setTimeout(onClose, 500); // Allow time for closing animation
        clearInterval(interval);
      }
    }, 50);
    
    // Auto-close after delay
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, autoCloseDelay);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isOpen, autoCloseDelay, onClose, isClosing]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full transform transition-all duration-300 
          ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
          ${type === 'work' ? 'border-l-4 border-green-500' : 'border-l-4 border-blue-500'}`}
      >
        <div className="mb-4">
          <h3 className={`text-lg font-medium ${type === 'work' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
            {type === 'work' ? t('timer.breakTime') : t('timer.workTime')}
          </h3>
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            {message}
          </p>
        </div>
        
        <div className="mt-5">
          <button
            type="button"
            className={`inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium text-white ${
              type === 'work' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={onClose}
          >
            {t('common.done')}
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1">
          <div 
            className={`h-full ${type === 'work' ? 'bg-green-500' : 'bg-blue-500'}`}
            style={{ width: `${100 - progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
