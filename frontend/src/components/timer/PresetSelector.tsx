import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTimerPresetStore } from '../../store/timerPresetStore';
import { TimerPreset } from '../../types';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface PresetSelectorProps {
  onSelectPreset: (preset: TimerPreset) => void;
}

export const PresetSelector = ({ onSelectPreset }: PresetSelectorProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { timerPresets, fetchTimerPresets, isLoading } = useTimerPresetStore();

  useEffect(() => {
    fetchTimerPresets();
  }, [fetchTimerPresets]);

  if (isLoading || timerPresets.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 mb-6">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {t('timer.presets')}:
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {timerPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset)}
            className="px-3 py-2 bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-md text-sm whitespace-nowrap flex-shrink-0 text-primary-600 dark:text-primary-400"
          >
            {preset.name}
          </button>
        ))}
        <button
          onClick={() => navigate('/timer-presets/new')}
          className="px-3 py-2 bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-md text-sm whitespace-nowrap flex-shrink-0 text-primary-600 dark:text-primary-400"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
