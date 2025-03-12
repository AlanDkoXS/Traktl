import { useTranslation } from 'react-i18next';
import { Project, Task, Tag } from '../../types';

interface ProjectTaskSelectorProps {
  projects: Project[];
  tasks: Task[];
  tags: Tag[];
  projectId: string | null;
  taskId: string | null;
  notes: string;
  selectedTags: string[];
  setProjectId: (id: string | null) => void;
  setTaskId: (id: string | null) => void;
  setNotes: (notes: string) => void;
  setSelectedTags: (tags: string[]) => void;
}

export const ProjectTaskSelector = ({
  projects,
  tasks,
  tags,
  projectId,
  taskId,
  notes,
  selectedTags,
  setProjectId,
  setTaskId,
  setNotes,
  setSelectedTags
}: ProjectTaskSelectorProps) => {
  const { t } = useTranslation();

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProjectId = e.target.value;
    setProjectId(newProjectId || null);
    setTaskId(null); // Reset task when project changes
  };

  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
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
          onChange={(e) => setTaskId(e.target.value || null)}
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
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('timeEntries.tags')}
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleTagToggle(tag.id)}
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                selectedTags.includes(tag.id)
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
              style={{
                backgroundColor: selectedTags.includes(tag.id) ? `${tag.color}30` : undefined,
                color: selectedTags.includes(tag.id) ? tag.color : undefined,
                borderWidth: '1px',
                borderStyle: 'solid', 
                borderColor: selectedTags.includes(tag.id) ? tag.color : 'transparent'
              }}
            >
              <div
                className="w-2 h-2 rounded-full mr-1.5"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </button>
          ))}
          {tags.length === 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t('tags.noTags')}
            </span>
          )}
        </div>
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
