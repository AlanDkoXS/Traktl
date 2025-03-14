import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTimerPresetStore } from '../../store/timerPresetStore';
import { Link } from 'react-router-dom';

export const TimerPresetList = () => {
  const { t } = useTranslation();
  const { timerPresets, isLoading, error, fetchTimerPresets } = useTimerPresetStore();
  const [retryCount, setRetryCount] = useState(0);
  const [hoveredPresetId, setHoveredPresetId] = useState<string | null>(null);

  useEffect(() => {
    fetchTimerPresets();
  }, [fetchTimerPresets, retryCount]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 dynamic-border"></div>
        <span className="ml-2 dynamic-color">{t('common.loading')}</span>
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
      <div className="text-center py-8 bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] rounded-lg p-6 border border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {t('timerPresets.noPresets')}
        </p>
        <Link to="/timer-presets/new" className="btn btn-primary dynamic-bg text-white">
          {t('timerPresets.new')}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[rgb(var(--color-bg-inset))] shadow-sm overflow-hidden rounded-lg border border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
      <ul className="divide-y divide-gray-200 dark:divide-[rgb(var(--color-border-primary))]">
        {timerPresets.map((preset) => (
          <li key={preset.id}>
            <Link
              to={`/timer-presets/${preset.id}`}
              className="block hover:bg-gray-50 dark:hover:bg-[rgb(var(--color-bg-overlay))] transition-colors"
              onMouseEnter={() => setHoveredPresetId(preset.id)}
              onMouseLeave={() => setHoveredPresetId(null)}
            >
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-md dynamic-bg-subtle flex items-center justify-center">
                    <span className={`font-medium text-lg ${
                      hoveredPresetId === preset.id ? 'dynamic-color' : 'text-gray-600 dark:text-gray-300'
                    }`}>
                      {preset.workDuration}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 px-4">
                    <div>
                      <p className={`text-sm font-medium truncate ${
                        hoveredPresetId === preset.id ? 'dynamic-color' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {preset.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {preset.workDuration}m {t('timer.workTime').toLowerCase()} / {preset.breakDuration}m {t('timer.breakTime').toLowerCase()} / {preset.repetitions} {t('timerPresets.cycles')}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <svg 
                    className={`h-5 w-5 ${
                      hoveredPresetId === preset.id ? 'dynamic-color' : 'text-gray-400'
                    }`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
