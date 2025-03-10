import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClientForm } from '../components/ClientForm';
import { useClientStore } from '../store/clientStore';

export const EditClient = () => {
	const { t } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { selectedClient, fetchClient, isLoading, error } = useClientStore();

	useEffect(() => {
		if (id) {
			fetchClient(id);
		}
	}, [id, fetchClient]);

	if (isLoading) {
		return <div className="text-center py-4">{t('common.loading')}</div>;
	}

	if (error) {
		return (
			<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-md">
				{error}
			</div>
		);
	}

	if (!selectedClient) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500 dark:text-gray-400 mb-4">
					{t('clients.notFound')}
				</p>
				<button onClick={() => navigate('/clients')} className="btn btn-primary">
					{t('common.goBack')}
				</button>
			</div>
		);
	}

	return (
		<div>
			<h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
				{t('clients.edit')}
			</h1>

			<div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
				<div className="px-4 py-5 sm:p-6">
					<ClientForm client={selectedClient} isEditing />
				</div>
			</div>
		</div>
	);
};
