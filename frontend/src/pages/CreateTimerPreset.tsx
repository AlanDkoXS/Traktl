import { useTranslation } from 'react-i18next'
import { TimerPresetForm } from '../components/timerPreset/TimerPresetForm'

const CreateTimerPreset = () => {
	const { t } = useTranslation()

	return (
		<div>
			<h1 className="text-2xl font-semibold text-gray-900 dark:text-white dynamic-color mb-6">
				{t('timerPresets.new')}
			</h1>

			<div className="card-project">
				<div className="px-4 py-5 sm:p-6">
					<TimerPresetForm />
				</div>
			</div>
		</div>
	)
}

export default CreateTimerPreset
