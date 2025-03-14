import { useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';

interface TimerAlertModalProps {
  isOpen: boolean;
  message: string;
  type: 'work' | 'break' | 'complete';
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
  
  // Auto-close timer
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  // Determine colors based on type
  const getColors = () => {
    switch (type) {
      case 'work':
        return {
          icon: <PlayIcon className="h-8 w-8 text-green-500 dark:text-green-400" />,
          bg: 'bg-green-50 dark:bg-green-900/30',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-800 dark:text-green-200',
          button: 'bg-green-500 hover:bg-green-600 text-white'
        };
      case 'break':
        return {
          icon: <PauseIcon className="h-8 w-8 text-blue-500 dark:text-blue-400" />,
          bg: 'bg-blue-50 dark:bg-blue-900/30',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-200',
          button: 'bg-blue-500 hover:bg-blue-600 text-white'
        };
      case 'complete':
        return {
          icon: <svg className="h-8 w-8 dynamic-color" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>,
          bg: 'dynamic-bg-subtle',
          border: 'dynamic-border',
          text: 'dynamic-color',
          button: 'dynamic-bg hover:brightness-110 text-white'
        };
      default:
        return {
          icon: <PlayIcon className="h-8 w-8 dynamic-color" />,
          bg: 'dynamic-bg-subtle',
          border: 'dynamic-border',
          text: 'dynamic-color',
          button: 'dynamic-bg hover:brightness-110 text-white'
        };
    }
  };
  
  const colors = getColors();

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px]" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-[rgb(var(--color-bg-overlay))] p-6 text-left align-middle shadow-xl transition-all border ${colors.border}`}>
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${colors.bg} rounded-full p-2 mr-3`}>
                    {colors.icon}
                  </div>
                  <Dialog.Title
                    as="h3"
                    className={`text-lg font-medium leading-6 ${colors.text}`}
                  >
                    {type === 'work' 
                      ? t('timer.workTime') 
                      : type === 'break'
                      ? t('timer.breakTime')
                      : t('timer.sessionsCompleted')}
                  </Dialog.Title>
                </div>
                
                <div className="mt-3">
                  <p className="text-gray-600 dark:text-gray-300">
                    {message}
                  </p>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium ${colors.button} focus:outline-none`}
                    onClick={onClose}
                  >
                    {t('common.done')}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
