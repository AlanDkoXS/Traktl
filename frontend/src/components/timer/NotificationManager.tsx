import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface NotificationManagerProps {
  showNotification: boolean;
  mode: 'work' | 'break';
  onRequestPermission: () => void;
  notificationPermission: NotificationPermission | null;
}

export const NotificationManager = ({ 
  showNotification, 
  mode, 
  onRequestPermission,
  notificationPermission 
}: NotificationManagerProps) => {
  const { t } = useTranslation();

  return (
    <>
      {/* In-app notification */}
      {showNotification && (
        <div className={`mb-4 p-3 rounded-md text-white text-center transition-all ${
          mode === 'work' 
            ? 'bg-green-500' 
            : 'bg-blue-500'
        }`}>
          <p className="font-medium">
            {mode === 'work' 
              ? t('timer.workCompleted') 
              : t('timer.breakCompleted')}
          </p>
        </div>
      )}

      {/* Notification permission */}
      {notificationPermission !== 'granted' && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {t('timer.enableNotifications')}
          </p>
          <button
            onClick={onRequestPermission}
            className="mt-2 text-sm bg-yellow-200 dark:bg-yellow-800 px-3 py-1 rounded-md hover:bg-yellow-300 dark:hover:bg-yellow-700"
          >
            {t('timer.allowNotifications')}
          </button>
        </div>
      )}
    </>
  );
};
