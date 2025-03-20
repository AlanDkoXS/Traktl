import { useTranslation } from 'react-i18next'

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

	const handleWorkDurationChange = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const value = parseInt(e.target.value)
		if (!isNaN(value) && value >= 1 && value <= 60) {
			setWorkDuration(value)
		}
	}

	const handleBreakDurationChange = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const value = parseInt(e.target.value)
		if (!isNaN(value) && value >= 0 && value <= 30) {
			setBreakDuration(value)
		}
	}

	const handleRepetitionsChange = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const value = parseInt(e.target.value)
		if (!isNaN(value) && value >= 1 && value <= 10) {
			setRepetitions(value)
		}
	}

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
							onChange={(e) =>
								setWorkDuration(parseInt(e.target.value))
							}
							disabled={status !== 'idle'}
							className="w-full"
						/>
					</div>
					<div className="flex items-center">
						<input
							type="number"
							min="1"
							max="60"
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
							onChange={(e) =>
								setBreakDuration(parseInt(e.target.value))
							}
							disabled={status !== 'idle'}
							className="w-full"
						/>
					</div>
					<div className="flex items-center">
						<input
							type="number"
							min="0"
							max="30"
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
							onChange={(e) =>
								setRepetitions(parseInt(e.target.value))
							}
							disabled={status !== 'idle'}
							className="w-full"
						/>
					</div>
					<div className="flex items-center">
						<input
							type="number"
							min="1"
							max="10"
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
