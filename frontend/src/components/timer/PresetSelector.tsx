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
			<div className="text-lg font-medium text-gray-900 dark:text-white mb-4 dynamic-color">
				{t('timer.presets')}
			</div>
			<div className="flex flex-wrap justify-center gap-2">
				{timerPresets.map((preset) => (
					<button
						key={preset.id}
						onClick={() => onSelectPreset(preset)}
						className="px-5 py-4 dynamic-bg-subtle hover:brightness-95 dark:hover:brightness-110 rounded-md text-base font-semibold whitespace-nowrap flex-shrink-0 dynamic-color"
					>
						{preset.name}
					</button>
				))}
				<button
					title="Create new timer preset"
					onClick={() => navigate('/timer-presets/new')}
					className="px-5 py-4 dynamic-bg-subtle hover:brightness-95 dark:hover:brightness-110 rounded-md text-base font-semibold whitespace-nowrap flex-shrink-0 dynamic-color"
				>
					<PlusIcon className="h-5 w-5" />
				</button>
			</div>
		</div>
	);
};
