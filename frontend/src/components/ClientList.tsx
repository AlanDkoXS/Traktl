import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useClientStore } from '../store/clientStore';
import { Link } from 'react-router-dom';

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
		
		// No resetear colores aquí
	}, [fetchClients, retryCount]);

	const handleRetry = () => {
		setRetryCount((prev) => prev + 1);
	};

	// Esta función ya no cambia el color, solo registra cuál está siendo hover
	const handleClientHover = (clientId: string | null) => {
		setHoveredClientId(clientId);
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-4">
				<div className="animate-spin rounded-full h-6 w-6 border-b-2 dynamic-border"></div>
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
		<div className="bg-white dark:bg-[rgb(var(--color-bg-inset))] shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
			<ul className="divide-y divide-gray-200 dark:divide-[rgb(var(--color-border-primary))]">
				{clients.map((client) => (
					<li key={client.id}>
						<Link
							to={`/clients/${client.id}`}
							className={`block hover:bg-gray-50 dark:hover:bg-[rgb(var(--color-bg-overlay))] transition-colors ${
								hoveredClientId === client.id
									? 'bg-gray-50 dark:bg-[rgb(var(--color-bg-overlay))]'
									: ''
							}`}
							onMouseEnter={() => handleClientHover(client.id)}
							onMouseLeave={() => handleClientHover(null)}
						>
							<div className="px-4 py-4 flex items-center sm:px-6">
								<div className="min-w-0 flex-1 flex items-center">
									<div
										className="flex-shrink-0 h-6 w-6 rounded-md"
										style={{ backgroundColor: client.color }}
									/>
									<div className="min-w-0 flex-1 px-4">
										<div>
											<p className="text-sm font-medium truncate text-gray-700 dark:text-gray-300">
												{client.name}
											</p>
											{client.contactInfo && (
												<p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
													{client.contactInfo}
												</p>
											)}
										</div>
									</div>
								</div>
								<div>
									<span className="text-xs text-gray-500 dark:text-gray-400">
										{t('projects.title')}: {client.projects?.length || 0}
									</span>
								</div>
							</div>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
};
