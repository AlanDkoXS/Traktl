import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ClientList } from '../components/ClientList'
import { PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useClientStore } from '../store/clientStore'

const Clients = () => {
	const { t } = useTranslation()
	const { clearSelectedClient } = useClientStore()

	useEffect(() => {
		clearSelectedClient()
	}, [clearSelectedClient])

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-white dynamic-color">
					{t('clients.title')}
				</h1>
				<div className="flex space-x-2">
					<Link to="/" className="btn btn-secondary">
						<ArrowLeftIcon className="h-5 w-5 mr-1" />
						{t('common.back')}
					</Link>
					<Link to="/clients/new" className="btn btn-primary">
						<PlusIcon className="h-5 w-5 mr-1" />
						{t('clients.new')}
					</Link>
				</div>
			</div>

			<ClientList />
		</div>
	)
}

export default Clients
