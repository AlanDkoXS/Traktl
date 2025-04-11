import { useTranslation } from 'react-i18next'
import { useTimerStore } from '../../store/timerStore'
import { timerPresetService } from '../../services/timerPresetService'
import { useEffect } from 'react'

interface TimerSettingsProps {
	workDuration: number
	breakDuration: number
	repetitions: number
	status: 'idle' | 'running' | 'paused' | 'break'
	setWorkDuration: (minutes: number) => void
	setBreakDuration: (minutes: number) => void
	setRepetitions: (repetitions: number) => void
}

export const TimerSettings = ({
	workDuration,
	breakDuration,
	repetitions,
	status,
	setWorkDuration,
	setBreakDuration,
	setRepetitions,
}: TimerSettingsProps) => {
	const { t } = useTranslation()
	const { setSelectedPresetId } = useTimerStore()

	const handleWorkDurationChange = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const value = parseInt(e.target.value)
		if (!isNaN(value) && value >= 1 && value <= 60) {
			setWorkDuration(value)
			setSelectedPresetId(null)
			timerPresetService
				.syncCurrentSettings({
					workDuration: value,
					breakDuration,
					repetitions,
				})
				.catch((error) =>
					console.error('Error syncing settings:', error),
				)
		}
	}

	const handleBreakDurationChange = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const value = parseInt(e.target.value)
		if (!isNaN(value) && value >= 0 && value <= 30) {
			setBreakDuration(value)
			setSelectedPresetId(null)
			timerPresetService
				.syncCurrentSettings({
					workDuration,
					breakDuration: value,
					repetitions,
				})
				.catch((error) =>
					console.error('Error syncing settings:', error),
				)
		}
	}

	const handleRepetitionsChange = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const value = parseInt(e.target.value)
		if (!isNaN(value) && value >= 1 && value <= 10) {
			setRepetitions(value)
			setSelectedPresetId(null)
			timerPresetService
				.syncCurrentSettings({
					workDuration,
					breakDuration,
					repetitions: value,
				})
				.catch((error) =>
					console.error('Error syncing settings:', error),
				)
		}
	}

	useEffect(() => {
		const syncSettings = async () => {
			try {
				console.log('Syncing initial settings:', {
					workDuration,
					breakDuration,
					repetitions,
				})
				await timerPresetService.syncCurrentSettings({
					workDuration,
					breakDuration,
					repetitions,
				})
				console.log('Initial settings synced successfully')
			} catch (error) {
				console.error('Error syncing initial settings:', error)
			}
		}
		if (workDuration !== 52 || breakDuration !== 17 || repetitions !== 4) {
			syncSettings()
		}
	}, [workDuration, breakDuration, repetitions])

	return (
		<div className="mt-8 rounded-lg shadow-sm">
			<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 dynamic-color">
				{t('timer.settings')}
			</h3>

			<div className="space-y-4">
				{/* Work Duration */}
				<div className="flex items-center gap-3">
					<label
						htmlFor="work-duration-slider"
						className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						{t('timer.workDuration')}
					</label>
					<div className="flex-1">
						<input
							id="work-duration-slider"
							type="range"
							min="1"
							max="60"
							step="1"
							value={workDuration}
							onChange={(e) => {
								setWorkDuration(parseInt(e.target.value))
								setSelectedPresetId(null)
							}}
							disabled={status !== 'idle'}
							className="w-full"
						/>
					</div>
					<div className="flex items-center">
						<input
							id="work-duration-number"
							type="number"
							min="1"
							max="60"
							aria-label={t('timer.workDuration')}
							value={workDuration}
							onChange={handleWorkDurationChange}
							disabled={status !== 'idle'}
							className="w-16 h-8 text-center rounded-md shadow-sm text-gray-900 dark:text-white text-sm timer-input bg-white dark:bg-[rgb(var(--color-bg-inset))] focus:dynamic-border focus:ring-0"
						/>
					</div>
				</div>

				{/* Break Duration - Modificado el mínimo a 0 */}
				<div className="flex items-center gap-3">
					<label
						htmlFor="break-duration-slider"
						className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						{t('timer.breakDuration')}
					</label>
					<div className="flex-1">
						<input
							id="break-duration-slider"
							type="range"
							min="0"
							max="30"
							step="1"
							value={breakDuration}
							onChange={(e) => {
								setBreakDuration(parseInt(e.target.value))
								setSelectedPresetId(null)
							}}
							disabled={status !== 'idle'}
							className="w-full"
						/>
					</div>
					<div className="flex items-center">
						<input
							id="break-duration-number"
							type="number"
							min="0"
							max="30"
							aria-label={t('timer.breakDuration')}
							value={breakDuration}
							onChange={handleBreakDurationChange}
							disabled={status !== 'idle'}
							className="w-16 h-8 text-center rounded-md shadow-sm text-gray-900 dark:text-white text-sm timer-input bg-white dark:bg-[rgb(var(--color-bg-inset))] focus:dynamic-border focus:ring-0"
						/>
					</div>
				</div>

				{/* Repetitions */}
				<div className="flex items-center gap-3">
					<label
						htmlFor="repetitions-slider"
						className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						{t('timer.repetitions')}
					</label>
					<div className="flex-1">
						<input
							id="repetitions-slider"
							type="range"
							min="1"
							max="10"
							step="1"
							value={repetitions}
							onChange={(e) => {
								setRepetitions(parseInt(e.target.value))
								setSelectedPresetId(null)
							}}
							disabled={status !== 'idle'}
							className="w-full"
						/>
					</div>
					<div className="flex items-center">
						<input
							type="number"
							min="1"
							max="10"
							id="repetitions-number"
							aria-label={t('timer.repetitions')}
							value={repetitions}
							onChange={handleRepetitionsChange}
							disabled={status !== 'idle'}
							className="w-16 h-8 text-center rounded-md shadow-sm text-gray-900 dark:text-white text-sm timer-input bg-white dark:bg-[rgb(var(--color-bg-inset))] focus:dynamic-border focus:ring-0"
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
