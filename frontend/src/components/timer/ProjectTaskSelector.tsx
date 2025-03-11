import { useTranslation } from 'react-i18next';
import { Project, Task } from '../../types';

interface ProjectTaskSelectorProps {
  projects: Project[];
  tasks: Task[];
  projectId: string | null;
  taskId: string | null;
  notes: string;
  setProjectId: (id: string | null) => void;
  setTaskId: (id: string | null) => void;
  setNotes: (notes: string) => void;
}

export const ProjectTaskSelector = ({
  projects,
  tasks,
  projectId,
  taskId,
  notes,
  setProjectId,
  setTaskId,
  setNotes
}: ProjectTaskSelectorProps) => {
  const { t } = useTranslation();

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProjectId = e.target.value;
    setProjectId(newProjectId || null);
    setTaskId(null); // Reset task when project changes
  };

  const handleTaskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTaskId = e.target.value;
    setTaskId(newTaskId || null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="project-select"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('timeEntries.project')} *
        </label>
        <select
          id="project-select"
          value={projectId || ''}
          onChange={handleProjectChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
        >
          <option value="">{t('timeEntries.selectProject')}</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label
          htmlFor="task-select"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('timeEntries.task')}
        </label>
        <select
          id="task-select"
          value={taskId || ''}
          onChange={handleTaskChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
          disabled={!projectId}
        >
          <option value="">{t('timeEntries.selectTask')}</option>
          {tasks.map(task => (
            <option key={task.id} value={task.id}>{task.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('timeEntries.notes')}
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
          placeholder={t('timeEntries.notes')}
          rows={2}
        />
      </div>
    </div>
  );
};
