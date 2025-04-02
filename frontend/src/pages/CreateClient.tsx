import { useTranslation } from 'react-i18next'
import { ClientForm } from '../components/ClientForm'

const CreateClient = () => {
	const { t } = useTranslation()

	return (
		<div>
			<h1 className="text-2xl font-semibold text-gray-900 dark:text-white dynamic-color mb-6">
				{t('clients.new')}
			</h1>

			<div className="card-project">
				<div className="px-4 py-5 sm:p-6">
					<ClientForm />
				</div>
			</div>
		</div>
	)
}

export default CreateClient
