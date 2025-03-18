import { useTranslation } from 'react-i18next'
import { TimeEntryForm } from '../components/TimeEntryForm'

export const CreateTimeEntry = () => {
	const { t } = useTranslation()

	return (
		<div>
			<h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 dynamic-color">
				{t('timeEntries.new')}
			</h1>

			<div className="card-project">
				<div className="px-4 py-5 sm:p-6">
					<TimeEntryForm />
				</div>
			</div>
		</div>
	)
}
