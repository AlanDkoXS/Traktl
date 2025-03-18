import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useTimerPresetStore } from '../../store/timerPresetStore'
import { TimerPreset } from '../../types'

interface TimerPresetFormProps {
	timerPreset?: TimerPreset
	isEditing?: boolean
}

export const TimerPresetForm = ({
	timerPreset,
	isEditing = false,
}: TimerPresetFormProps) => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const { createTimerPreset, updateTimerPreset } = useTimerPresetStore()

	const [name, setName] = useState(timerPreset?.name || '')
	const [workDuration, setWorkDuration] = useState(
		timerPreset?.workDuration || 25,
	)
	const [breakDuration, setBreakDuration] = useState(
		timerPreset?.breakDuration || 5,
	)
	const [repetitions, setRepetitions] = useState(
		timerPreset?.repetitions || 4,
	)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!name) {
			setError(t('errors.required'))
			return
		}

		setIsSubmitting(true)
		setError('')

		try {
			if (isEditing && timerPreset) {
				await updateTimerPreset(timerPreset.id, {
					name,
					workDuration,
					breakDuration,
					repetitions,
				})
			} else {
				await createTimerPreset({
					name,
					workDuration,
					breakDuration,
					repetitions,
				})
			}

			navigate('/timer-presets')
		} catch (err: any) {
			setError(err.message || t('errors.serverError'))
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{error && (
				<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-md">
					{error}
				</div>
			)}

			<div>
				<label
					htmlFor="name"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					{t('timerPresets.name')} *
				</label>
				<input
					type="text"
					id="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:dynamic-border focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
					required
				/>
			</div>

			<div>
				<label
					htmlFor="workDuration"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					{t('timerPresets.workDuration')} *
				</label>
				<input
					type="number"
					id="workDuration"
					value={workDuration}
					onChange={(e) => setWorkDuration(parseInt(e.target.value))}
					min={1}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:dynamic-border focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
					required
				/>
			</div>

			<div>
				<label
					htmlFor="breakDuration"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					{t('timerPresets.breakDuration')} *
				</label>
				<input
					type="number"
					id="breakDuration"
					value={breakDuration}
					onChange={(e) => setBreakDuration(parseInt(e.target.value))}
					min={0}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:dynamic-border focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
					required
				/>
			</div>

			<div>
				<label
					htmlFor="repetitions"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					{t('timerPresets.repetitions')} *
				</label>
				<input
					type="number"
					id="repetitions"
					value={repetitions}
					onChange={(e) => setRepetitions(parseInt(e.target.value))}
					min={1}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:dynamic-border focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
					required
				/>
			</div>

			<div className="flex justify-end space-x-3">
				<button
					type="button"
					onClick={() => navigate('/timer-presets')}
					className="btn btn-secondary"
				>
					{t('common.cancel')}
				</button>
				<button
					type="submit"
					disabled={isSubmitting}
					className="btn btn-primary dynamic-bg text-white"
				>
					{isSubmitting
						? t('common.loading')
						: isEditing
							? t('common.update')
							: t('common.create')}
				</button>
			</div>
		</form>
	)
}
