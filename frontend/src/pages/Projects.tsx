import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ProjectList } from '../components/ProjectList';
import { PlusIcon } from '@heroicons/react/24/outline';

export const Projects = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {t('projects.title')}
        </h1>
        <Link 
          to="/projects/new" 
          className="btn btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          {t('projects.new')}
        </Link>
      </div>
      
      <ProjectList />
    </div>
  );
};
