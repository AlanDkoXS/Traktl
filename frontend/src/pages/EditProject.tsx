import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ProjectForm } from '../components/ProjectForm';
import { useProjectStore } from '../store/projectStore';

export const EditProject = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedProject, fetchProject, isLoading, error } = useProjectStore();
  
  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id, fetchProject]);
  
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
  
  if (!selectedProject) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {t('projects.notFound')}
        </p>
        <button
          onClick={() => navigate('/projects')}
          className="btn btn-primary"
        >
          {t('common.goBack')}
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {t('projects.edit')}
      </h1>
      
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <ProjectForm project={selectedProject} isEditing />
        </div>
      </div>
    </div>
  );
};
