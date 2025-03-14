import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ProjectList } from '../components/ProjectList';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useProjectStore } from '../store/projectStore';
import { setProjectColor } from '../utils/dynamicColors';

export const Projects = () => {
  const { t } = useTranslation();
  const { clearSelectedProject, projects } = useProjectStore();
  
  // Clear selected project when entering the projects list
  useEffect(() => {
    clearSelectedProject();
    
    // Set default project color - don't reset it
    if (projects.length > 0) {
      // Use first project color as default for this page
      setProjectColor(projects[0].color);
    } else {
      setProjectColor('#0284c7'); // Default blue
    }
  }, [clearSelectedProject, projects]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {t('projects.title')}
        </h1>
        <Link to="/projects/new" className="btn btn-primary">
          <PlusIcon className="h-5 w-5 mr-1" />
          {t('projects.new')}
        </Link>
      </div>

      <ProjectList />
    </div>
  );
};
