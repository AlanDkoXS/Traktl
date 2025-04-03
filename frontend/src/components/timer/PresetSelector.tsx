import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useTimerPresetStore } from '../../store/timerPresetStore'
import { useTimerStore } from '../../store/timerStore'
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
	const { selectedPresetId, setSelectedPresetId } = useTimerStore()
	const [showCreatePresetModal, setShowCreatePresetModal] = useState(false)
	const initialSelectionMade = useRef(false)

	useEffect(() => {
		const loadPresets = async () => {
			await fetchTimerPresets()
		}

		loadPresets()
	}, [fetchTimerPresets])

	// Automatically select preset when presets are loaded (but only once)
	useEffect(() => {
		if (timerPresets.length > 0 && !initialSelectionMade.current) {
			// Try to find the previously selected preset
			const selectedPreset = selectedPresetId
				? timerPresets.find((preset) => preset.id === selectedPresetId)
				: null

			if (selectedPreset) {
				console.log(
					'Selecting previously selected preset:',
					selectedPreset.name,
				)
				onSelectPreset(selectedPreset)
			} else {
				// Try to find the Pomodoro preset first (created by default for new users)
				const pomodoroPreset = timerPresets.find((preset) =>
					preset.name.includes('Pomodoro'),
				)

				if (pomodoroPreset) {
					console.log('Automatically selecting Pomodoro preset')
					onSelectPreset(pomodoroPreset)
					setSelectedPresetId(pomodoroPreset.id)
				} else {
					// If Pomodoro preset doesn't exist, select the first available preset
					console.log(
						'Pomodoro preset not found, selecting first available preset',
					)
					onSelectPreset(timerPresets[0])
					setSelectedPresetId(timerPresets[0].id)
				}
			}

			// Mark that we've made the initial selection
			initialSelectionMade.current = true
		}
	}, [timerPresets, onSelectPreset, selectedPresetId, setSelectedPresetId])

	const handlePresetCreated = (presetId: string) => {
		// Find the newly created preset and select it
		const newPreset = timerPresets.find((preset) => preset.id === presetId)
		if (newPreset) {
			onSelectPreset(newPreset)
			setSelectedPresetId(newPreset.id)
		}
		// Re-fetch presets to ensure we have the latest list
		fetchTimerPresets()
	}

	const handlePresetSelect = (preset: TimerPreset) => {
		onSelectPreset(preset)
		setSelectedPresetId(preset.id)
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
						onClick={() => handlePresetSelect(preset)}
						className={`px-5 py-4 rounded-md text-base font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
							selectedPresetId === preset.id
								? 'dynamic-bg text-white shadow-md scale-105'
								: 'dynamic-bg-subtle dynamic-color hover:brightness-95 dark:hover:brightness-110 hover:scale-105 hover:shadow-sm'
						}`}
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
