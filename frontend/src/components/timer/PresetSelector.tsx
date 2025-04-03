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
	const { selectedPresetId, setSelectedPresetId, status } = useTimerStore()
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
			// Limpiar cualquier selección previa
			setSelectedPresetId(null)
			initialSelectionMade.current = true
		}
	}, [timerPresets, setSelectedPresetId])

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
		if (status === 'running') return
		onSelectPreset(preset)
		setSelectedPresetId(preset.id)
	}

	if (isLoading || timerPresets.length === 0) {
		return (
			<div className="mt-2 mb-6 flex justify-center">
				<button
					onClick={() => setShowCreatePresetModal(true)}
					className={`px-5 py-4 dynamic-bg-subtle rounded-md text-base font-semibold whitespace-nowrap flex-shrink-0 dynamic-color ${
						status === 'running'
							? 'opacity-50'
							: 'hover:brightness-95 dark:hover:brightness-110'
					}`}
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
				{timerPresets
					.filter((preset) => preset.name !== 'Default Settings')
					.map((preset) => (
						<button
							key={preset.id}
							onClick={() => handlePresetSelect(preset)}
							disabled={status === 'running'}
							className={`px-5 py-4 rounded-md text-base font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
								selectedPresetId === preset.id
									? `dynamic-bg text-white shadow-md scale-105 ${
											status === 'running'
												? 'opacity-50'
												: ''
										}`
									: `dynamic-bg-subtle dynamic-color ${
											status === 'running'
												? 'opacity-50'
												: 'hover:brightness-95 dark:hover:brightness-110 hover:scale-105 hover:shadow-sm'
										}`
							}`}
						>
							{preset.name}
						</button>
					))}
				<button
					title={t('timerPresets.new')}
					onClick={() => setShowCreatePresetModal(true)}
					disabled={status === 'running'}
					className={`px-5 py-4 dynamic-bg-subtle rounded-md text-base font-semibold whitespace-nowrap flex-shrink-0 dynamic-color ${
						status === 'running'
							? 'opacity-50'
							: 'hover:brightness-95 dark:hover:brightness-110'
					}`}
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
