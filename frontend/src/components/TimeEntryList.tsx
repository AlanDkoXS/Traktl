import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useTimeEntryStore } from '../store/timeEntryStore';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { useTagStore } from '../store/tagStore';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { ConfirmModal } from './ui/ConfirmModal';

interface TimeEntryListProps {
  projectId?: string;
  taskId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export const TimeEntryList = ({ projectId, taskId, startDate, endDate, limit }: TimeEntryListProps) => {
  const { t } = useTranslation();
  const { timeEntries, fetchTimeEntries, deleteTimeEntry, isLoading, error } = useTimeEntryStore();
  const { projects, fetchProjects } = useProjectStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { tags, fetchTags } = useTagStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dataInitialized, setDataInitialized] = useState(false);

  // Only load data once
  useEffect(() => {
    if (!dataInitialized) {
      const loadData = async () => {
        try {
          // Load data in sequence to avoid infinite loops
          await fetchTimeEntries(projectId, taskId, startDate, endDate);
          await fetchProjects();
          await fetchTasks();
          await fetchTags();
          setDataInitialized(true);
        } catch (err) {
          console.error("Error loading data:", err);
          setDataInitialized(true); // Still mark as initialized to prevent loops
        }
      };
      
      loadData();
    }
  }, [refreshKey, projectId, taskId, startDate, endDate]);

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };

  const getTaskName = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task ? task.name : "Unknown Task";
  };

  const getTagsForEntry = (tagIds: string[]) => {
    return tags.filter(tag => tagIds.includes(tag.id));
  };

  const handleDeleteClick = (entryId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEntryToDelete(entryId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteTimeEntry(entryToDelete);
    } catch (error) {
      console.error("Failed to delete time entry:", error);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setEntryToDelete(null);
    }
  };

  const handleRetry = () => {
    setDataInitialized(false);
    setRefreshKey(prev => prev + 1);
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
      <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md text-sm flex flex-col">
        <p>{error}</p>
        <button onClick={handleRetry} className="mt-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 underline">
          {t('common.retry')}
        </button>
      </div>
    );
  }

  if (!timeEntries.length) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 dark:text-gray-400">{t('timeEntries.noEntries')}</p>
        <Link to="/time-entries/new" className="btn btn-primary mt-2 inline-flex">
          {t('timeEntries.new')}
        </Link>
      </div>
    );
  }

  const displayEntries = limit ? timeEntries.slice(0, limit) : timeEntries;

  return (
    <>
      <div className="space-y-2">
        {displayEntries.map((entry) => (
          <div key={entry.id} className="relative block bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors">
            <Link to={`/time-entries/${entry.id}`} className="block">
              <div className="flex items-center justify-between pr-16">
                <div className="flex items-center min-w-0">
                  <div className={`flex-shrink-0 h-7 w-7 ${entry.isRunning ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'} rounded-full flex items-center justify-center mr-2`}>
                    <svg className={`h-3.5 w-3.5 ${entry.isRunning ? 'text-green-600 dark:text-green-300' : 'text-gray-600 dark:text-gray-300'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm truncate">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {getProjectName(entry.project)}
                      </span>
                      {entry.task && (
                        <span className="text-gray-600 dark:text-gray-400">
                          : {getTaskName(entry.task)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {format(new Date(entry.startTime), 'MMM d, h:mm a')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${entry.isRunning ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                    {entry.isRunning ? t('timeEntries.running') : formatDuration(entry.duration)}
                  </div>
                </div>
              </div>
              
              {entry.tags && entry.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1 ml-9">
                  {getTagsForEntry(entry.tags).map(tag => (
                    <span 
                      key={tag.id} 
                      className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs"
                      style={{ 
                        backgroundColor: `${tag.color}20`, 
                        color: tag.color,
                        border: `1px solid ${tag.color}`
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </Link>

            <div className="absolute top-2 right-2 flex space-x-1">
              <Link to={`/time-entries/${entry.id}`} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-white dark:bg-gray-800 rounded" title={t('common.edit')}>
                <PencilIcon className="h-4 w-4" />
              </Link>
              <button onClick={(e) => handleDeleteClick(entry.id, e)} className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-gray-800 rounded" title={t('common.delete')}>
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        
        {limit && timeEntries.length > limit && (
          <Link to="/time-entries" className="block text-center text-sm text-primary-600 dark:text-primary-400 hover:underline p-2">
            {t('common.viewAll')} ({timeEntries.length})
          </Link>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title={t('common.confirmDelete')}
        message={t('timeEntries.deleteConfirmation', {
          name: entryToDelete ? format(new Date(timeEntries.find(e => e.id === entryToDelete)?.startTime || Date.now()), 'MMM d, h:mm a') : '',
          defaultValue: "Are you sure you want to delete this time entry? This action cannot be undone."
        })}
        confirmButtonText={t('common.delete')}
        cancelButtonText={t('common.cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={deleteLoading}
        danger={true}
      />
    </>
  );
};
