import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useClientStore } from '../store/clientStore';
import { Link } from 'react-router-dom';
import { PencilIcon } from '@heroicons/react/24/outline';
import { setProjectColor, resetProjectColor } from '../utils/dynamicColors';

export const ClientList = () => {
	const { t } = useTranslation();
	const { clients, isLoading, error, fetchClients } = useClientStore();
	const [retryCount, setRetryCount] = useState(0);
	const [hoveredClientId, setHoveredClientId] = useState<string | null>(null);

	useEffect(() => {
		const loadClients = async () => {
			try {
				await fetchClients();
			} catch (err) {
				console.error('Error loading clients:', err);
			}
		};

		loadClients();
	}, [fetchClients, retryCount]);

	const handleRetry = () => {
		setRetryCount((prev) => prev + 1);
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-4">
				<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
				<span className="ml-2">{t('common.loading')}</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-md">
				<p className="mb-2">{error}</p>
				<button
					onClick={handleRetry}
					className="text-sm underline hover:text-red-600 dark:hover:text-red-300"
				>
					{t('common.retry')}
				</button>
			</div>
		);
	}

	if (clients.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500 dark:text-gray-400 mb-4">{t('clients.noClients')}</p>
				<Link to="/clients/new" className="btn btn-primary">
					{t('clients.new')}
				</Link>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{clients.map((client) => (
				<Link
					key={client.id}
					to={`/clients/${client.id}`}
					className="block transition-all duration-200 hover:shadow-md group"
					onMouseEnter={() => setHoveredClientId(client.id)}
					onMouseLeave={() => setHoveredClientId(null)}
				>
					<div className="card h-full border border-gray-200 dark:border-[rgb(var(--color-border-primary))] flex flex-col">
						<div
							className="h-3 w-full rounded-t-lg"
							style={{ backgroundColor: client.color }}
						></div>
						<div className="p-4 flex-1 flex flex-col">
							<div className="flex items-start justify-between">
								<h3
									className={`text-lg font-medium ${hoveredClientId === client.id ? 'dynamic-color' : 'text-gray-900 dark:text-white'}`}
								>
									{client.name}
								</h3>
								<div className="opacity-0 group-hover:opacity-100 transition-opacity">
									<PencilIcon className="h-4 w-4 text-gray-400" />
								</div>
							</div>
							{client.contactInfo && (
								<p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex-1">
									{client.contactInfo.length > 100
										? client.contactInfo.substring(0, 97) + '...'
										: client.contactInfo}
								</p>
							)}
							<div className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-700">
								<div className="text-xs text-gray-500 dark:text-gray-400">
									{t('projects.title')}: {client.projects?.length || 0}
								</div>
							</div>
						</div>
					</div>
				</Link>
			))}
		</div>
	);
};
