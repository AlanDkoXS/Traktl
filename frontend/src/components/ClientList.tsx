import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useClientStore } from '../store/clientStore';
import { Link } from 'react-router-dom';

export const ClientList = () => {
  const { t } = useTranslation();
  const { clients, isLoading, error, fetchClients } = useClientStore();
  const [retryCount, setRetryCount] = useState(0);

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
    setRetryCount(prev => prev + 1);
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
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {t('clients.noClients')}
        </p>
        <Link to="/clients/new" className="btn btn-primary">
          {t('clients.new')}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {clients.map((client) => (
          <li key={client.id}>
            <Link
              to={`/clients/${client.id}`}
              className="block hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 flex items-center">
                  <div
                    className="flex-shrink-0 h-4 w-4 rounded-full"
                    style={{ backgroundColor: client.color }}
                  />
                  <div className="min-w-0 flex-1 px-4">
                    <div>
                      <p className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate">
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
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
