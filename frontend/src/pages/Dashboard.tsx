import { useTranslation } from 'react-i18next';
import { Timer } from '../components/Timer';

export const Dashboard = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {t('nav.dashboard')}
      </h1>
      
      {/* Timer */}
      <div className="mb-8">
        <Timer />
      </div>
      
      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('projects.title')}
            </h3>
            <div className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              0
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('clients.title')}
            </h3>
            <div className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              0
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('tasks.title')}
            </h3>
            <div className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
