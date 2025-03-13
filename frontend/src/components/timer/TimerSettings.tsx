import { useTranslation } from 'react-i18next';

interface TimerSettingsProps {
	workDuration: number;
	breakDuration: number;
	repetitions: number;
	status: 'idle' | 'running' | 'paused' | 'break';
	setWorkDuration: (minutes: number) => void;
	setBreakDuration: (minutes: number) => void;
	setRepetitions: (repetitions: number) => void;
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
	const { t } = useTranslation();

	const handleWorkDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value);
		if (!isNaN(value) && value >= 1 && value <= 60) {
			setWorkDuration(value);
		}
	};

	const handleBreakDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value);
		// Modificado para permitir 0 minutos
		if (!isNaN(value) && value >= 0 && value <= 30) {
			setBreakDuration(value);
		}
	};

	const handleRepetitionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value);
		if (!isNaN(value) && value >= 1 && value <= 10) {
			setRepetitions(value);
		}
	};

	return (
		<div className="mt-8 p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
			<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
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
							onChange={(e) => setWorkDuration(parseInt(e.target.value))}
							disabled={status !== 'idle'}
							className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
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
							className="w-16 h-8 text-center rounded-md border-gray-300 bg-gray-50 dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white text-sm timer-input"
						/>
						<span className="ml-2 text-sm text-gray-500 dark:text-gray-400">min</span>
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
							onChange={(e) => setBreakDuration(parseInt(e.target.value))}
							disabled={status !== 'idle'}
							className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
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
							className="w-16 h-8 text-center rounded-md border-gray-300 bg-gray-50 dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white text-sm timer-input"
						/>
						<span className="ml-2 text-sm text-gray-500 dark:text-gray-400">min</span>
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
							onChange={(e) => setRepetitions(parseInt(e.target.value))}
							disabled={status !== 'idle'}
							className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
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
							className="w-16 h-8 text-center rounded-md border-gray-300 bg-gray-50 dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white text-sm timer-input"
						/>
						<span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
							{t('timerPresets.cycles')}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};
