import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTimerPresetStore } from '../../store/timerPresetStore';
import { Link } from 'react-router-dom';

export const TimerPresetList = () => {
  const { t } = useTranslation();
  const { timerPresets, isLoading, error, fetchTimerPresets } = useTimerPresetStore();
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchTimerPresets();
  }, [fetchTimerPresets, retryCount]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
        <span className="ml-2">{t('common.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-md">
        <p className="mb-2">{error}</p>
        <button 
          onClick={() => setRetryCount(prev => prev + 1)}
          className="text-sm underline hover:text-red-600 dark:hover:text-red-300"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  if (timerPresets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {t('timerPresets.noPresets')}
        </p>
        <Link to="/timer-presets/new" className="btn btn-primary">
          {t('timerPresets.new')}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {timerPresets.map((preset) => (
          <li key={preset.id}>
            <Link
              to={`/timer-presets/${preset.id}`}
              className="block hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 flex items-center">
                  <div className="min-w-0 flex-1 px-4">
                    <div>
                      <p className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate">
                        {preset.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {preset.workDuration}m work / {preset.breakDuration}m break / {preset.repetitions} {t('timerPresets.cycles')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
