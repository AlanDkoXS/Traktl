import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Project, Task, Tag } from '../../types';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useProjectStore } from '../../store/projectStore';
import { useTaskStore } from '../../store/taskStore';
import { useTagStore } from '../../store/tagStore';

interface ProjectTaskSelectorProps {
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
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  // Get data from stores
  const { projects, fetchProjects, isLoading: projectsLoading } = useProjectStore();
  const { tasks, fetchTasks, isLoading: tasksLoading } = useTaskStore();
  const { tags, fetchTags, isLoading: tagsLoading } = useTagStore();
  
  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      await fetchProjects();
      await fetchTags();
      if (projectId) {
        await fetchTasks(projectId);
      }
    };
    
    loadData();
  }, [fetchProjects, fetchTags, fetchTasks, projectId]);

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProjectId = e.target.value || null;
    setProjectId(newProjectId);
    setTaskId(null); // Reset task when project changes
    
    if (newProjectId) {
      fetchTasks(newProjectId);
    }
  };

  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  // Find selected project and task names
  const selectedProject = projects.find(p => p.id === projectId);
  const selectedTask = tasks.find(t => t.id === taskId);

  const isLoading = projectsLoading || tagsLoading || (projectId && tasksLoading);

  return (
    <>
      <button
        onClick={openModal}
        className="w-full p-3 text-left flex justify-between items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <div>
          <div className="font-medium text-gray-800 dark:text-white">
            {selectedProject ? selectedProject.name : t('timeEntries.selectProject')}
          </div>
          {selectedTask && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {selectedTask.name}
            </div>
          )}
        </div>
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 dark:bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
                  >
                    {t('timeEntries.details')}
                  </Dialog.Title>
                  
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="project-select"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          {t('timeEntries.project')} *
                        </label>
                        <div className="mt-1 flex">
                          <select
                            id="project-select"
                            value={projectId || ''}
                            onChange={handleProjectChange}
                            className="flex-1 rounded-md border-gray-300 bg-gray-50 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:bg-white dark:focus:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
                          >
                            <option value="">{t('timeEntries.selectProject')}</option>
                            {projects.map(project => (
                              <option key={project.id} value={project.id}>{project.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              closeModal();
                              navigate('/projects/new');
                            }}
                            className="ml-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                            title={t('projects.new')}
                          >
                            <PlusIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label
                          htmlFor="task-select"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          {t('timeEntries.task')}
                        </label>
                        <div className="mt-1 flex">
                          <select
                            id="task-select"
                            value={taskId || ''}
                            onChange={(e) => setTaskId(e.target.value || null)}
                            className="flex-1 rounded-md border-gray-300 bg-gray-50 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:bg-white dark:focus:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
                            disabled={!projectId}
                          >
                            <option value="">{t('timeEntries.selectTask')}</option>
                            {tasks.map(task => (
                              <option key={task.id} value={task.id}>{task.name}</option>
                            ))}
                          </select>
                          {projectId && (
                            <button
                              onClick={() => {
                                closeModal();
                                navigate(`/tasks/new?projectId=${projectId}`);
                              }}
                              className="ml-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                              title={t('tasks.new')}
                            >
                              <PlusIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </button>
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
                          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:bg-white dark:focus:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
                          placeholder={t('timeEntries.notes')}
                          rows={2}
                        />
                      </div>
                      
                      <div>
                        <label
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          {t('timeEntries.tags')}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {tags.map(tag => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => handleTagToggle(tag.id)}
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                selectedTags.includes(tag.id)
                                  ? 'bg-opacity-20 border-opacity-60'
                                  : 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                              }`}
                              style={{
                                backgroundColor: selectedTags.includes(tag.id) ? `${tag.color}20` : undefined,
                                color: selectedTags.includes(tag.id) ? tag.color : undefined,
                                borderColor: selectedTags.includes(tag.id) ? tag.color : undefined
                              }}
                            >
                              <div
                                className="w-2 h-2 rounded-full mr-1.5"
                                style={{ backgroundColor: tag.color }}
                              />
                              {tag.name}
                            </button>
                          ))}
                          <button
                            onClick={() => {
                              closeModal();
                              navigate('/tags/new');
                            }}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800 text-primary-600 dark:text-primary-400"
                          >
                            <PlusIcon className="h-3 w-3 mr-1" />
                            {t('tags.new')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="bg-primary-600 dark:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      onClick={closeModal}
                    >
                      {t('common.done')}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
