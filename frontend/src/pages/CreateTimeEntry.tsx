import { useTranslation } from 'react-i18next'
import { TimeEntryForm } from '../components/TimeEntryForm'

const CreateTimeEntry = () => {
	const { t } = useTranslation()

	return (
		<div>
			<h1 className="text-2xl font-semibold text-gray-900 dark:text-white dynamic-color mb-6">
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

export default CreateTimeEntry
