import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/projectStore';
import { Link } from 'react-router-dom';

export const ProjectList = () => {
  const { t } = useTranslation();
  const { projects, isLoading, error, fetchProjects } = useProjectStore();
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        await fetchProjects();
      } catch (err) {
        console.error('Error loading projects:', err);
      }
    };
    
    loadProjects();
  }, [fetchProjects, retryCount]);

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

  if (projects.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {t('projects.noProjects')}
        </p>
        <Link to="/projects/new" className="btn btn-primary">
          {t('projects.new')}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              to={`/projects/${project.id}`}
              className="block hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 flex items-center">
                  <div
                    className="flex-shrink-0 h-4 w-4 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <div className="min-w-0 flex-1 px-4">
                    <div>
                      <p className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate">
                        {project.name}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {project.status === 'active'
                      ? t('projects.status.active')
                      : t('projects.status.archived')}
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
