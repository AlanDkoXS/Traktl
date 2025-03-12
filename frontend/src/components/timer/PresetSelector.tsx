import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTimerPresetStore } from '../../store/timerPresetStore';
import { TimerPreset } from '../../types';

interface PresetSelectorProps {
  onSelectPreset: (preset: TimerPreset) => void;
}

export const PresetSelector = ({ onSelectPreset }: PresetSelectorProps) => {
  const { t } = useTranslation();
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
      <div className="flex overflow-x-auto pb-2 space-x-2">
        {timerPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-sm whitespace-nowrap flex-shrink-0"
          >
            <span className="font-medium">{preset.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 block">
              {preset.workDuration}m/{preset.breakDuration}m · {preset.repetitions}x
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
