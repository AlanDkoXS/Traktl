import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTaskStore } from '../store/taskStore';
import { Link } from 'react-router-dom';

interface TaskListProps {
  projectId?: string;
}

export const TaskList = ({ projectId }: TaskListProps) => {
  const { t } = useTranslation();
  const { tasks, isLoading, error, fetchTasks } = useTaskStore();
  
  useEffect(() => {
    fetchTasks(projectId);
  }, [fetchTasks, projectId]);
  
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
  
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {t('tasks.noTasks')}
        </p>
        <Link
          to={projectId ? `/tasks/new?projectId=${projectId}` : '/tasks/new'}
          className="btn btn-primary"
        >
          {t('tasks.new')}
        </Link>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {tasks.map((task) => (
          <li key={task.id}>
            <Link
              to={`/tasks/${task.id}`}
              className="block hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 flex items-center">
                  <div className="min-w-0 flex-1">
                    <div>
                      <p className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate">
                        {task.name}
                      </p>
                      {task.description && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : task.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {task.status === 'pending' 
                      ? t('tasks.status.pending') 
                      : task.status === 'in-progress'
                      ? t('tasks.status.inProgress')
                      : t('tasks.status.completed')}
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
