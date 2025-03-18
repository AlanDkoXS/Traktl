import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { TimerPresetList } from '../components/timerPreset/TimerPresetList'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useTimerPresetStore } from '../store/timerPresetStore'

export const TimerPresets = () => {
	const { t } = useTranslation()
	const { clearSelectedTimerPreset } = useTimerPresetStore()

	useEffect(() => {
		clearSelectedTimerPreset()
	}, [clearSelectedTimerPreset])

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
					{t('timerPresets.title')}
				</h1>
				<Link to="/timer-presets/new" className="btn btn-primary">
					<PlusIcon className="h-5 w-5 mr-1" />
					{t('timerPresets.new')}
				</Link>
			</div>

			<TimerPresetList />
		</div>
	)
}
