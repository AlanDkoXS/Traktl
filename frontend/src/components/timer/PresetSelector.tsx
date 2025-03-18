import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTimerPresetStore } from '../../store/timerPresetStore'
import { TimerPreset } from '../../types'
import { PlusIcon } from '@heroicons/react/24/outline'
import { PresetCreateModal } from './modals/PresetCreateModal'

interface PresetSelectorProps {
	onSelectPreset: (preset: TimerPreset) => void
	currentSettings?: {
		workDuration: number
		breakDuration: number
		repetitions: number
	}
}

export const PresetSelector = ({
	onSelectPreset,
	currentSettings,
}: PresetSelectorProps) => {
	const { t } = useTranslation()
	const { timerPresets, fetchTimerPresets, isLoading } = useTimerPresetStore()
	const [showCreatePresetModal, setShowCreatePresetModal] = useState(false)

	useEffect(() => {
		fetchTimerPresets()
	}, [fetchTimerPresets])

	const handlePresetCreated = (presetId: string) => {
		// Find the newly created preset and select it
		const newPreset = timerPresets.find((preset) => preset.id === presetId)
		if (newPreset) {
			onSelectPreset(newPreset)
		}
		// Re-fetch presets to ensure we have the latest list
		fetchTimerPresets()
	}

	if (isLoading || timerPresets.length === 0) {
		return (
			<div className="mt-2 mb-6 flex justify-center">
				<button
					onClick={() => setShowCreatePresetModal(true)}
					className="px-5 py-4 dynamic-bg-subtle hover:brightness-95 dark:hover:brightness-110 rounded-md text-base font-semibold whitespace-nowrap flex-shrink-0 dynamic-color"
				>
					<PlusIcon className="h-5 w-5" />
					<span className="ml-1">{t('timerPresets.new')}</span>
				</button>
			</div>
		)
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
					title={t('timerPresets.new')}
					onClick={() => setShowCreatePresetModal(true)}
					className="px-5 py-4 dynamic-bg-subtle hover:brightness-95 dark:hover:brightness-110 rounded-md text-base font-semibold whitespace-nowrap flex-shrink-0 dynamic-color"
				>
					<PlusIcon className="h-5 w-5" />
				</button>
			</div>

			{/* Save current settings as preset modal */}
			<PresetCreateModal
				isOpen={showCreatePresetModal}
				onClose={() => setShowCreatePresetModal(false)}
				onPresetCreated={handlePresetCreated}
				initialValues={currentSettings}
			/>
		</div>
	)
}
