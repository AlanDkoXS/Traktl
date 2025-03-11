import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TimerPresetForm } from '../components/timerPreset/TimerPresetForm';
import { useTimerPresetStore } from '../store/timerPresetStore';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { TrashIcon } from '@heroicons/react/24/outline';

export const EditTimerPreset = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedTimerPreset, fetchTimerPreset, deleteTimerPreset, isLoading, error } = useTimerPresetStore();
  const [notFound, setNotFound] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!id) return setNotFound(true);
    
    const loadTimerPreset = async () => {
      try {
        await fetchTimerPreset(id);
      } catch (err) {
        setNotFound(true);
      }
    };
    
    loadTimerPreset();
  }, [id, fetchTimerPreset]);

  const handleDelete = async () => {
    if (!id) return;
    
    setDeleteLoading(true);
    try {
      await deleteTimerPreset(id);
      navigate('/timer-presets');
    } catch (err) {
      console.error('Error deleting timer preset:', err);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <span className="ml-2">{t('common.loading')}</span>
      </div>
    );
  }

  if (error || notFound || !selectedTimerPreset) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400 mb-4">{t('timerPresets.notFound')}</p>
        <button onClick={() => navigate('/timer-presets')} className="btn btn-primary">{t('common.goBack')}</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('timerPresets.edit')}</h1>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="btn btn-secondary bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
        >
          <TrashIcon className="h-5 w-5 mr-1" />
          {t('common.delete')}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <TimerPresetForm timerPreset={selectedTimerPreset} isEditing />
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title={t('common.confirmDelete')}
        message={t('timerPresets.deleteConfirmation', {
          name: selectedTimerPreset.name,
          defaultValue: `Are you sure you want to delete the timer preset "${selectedTimerPreset.name}"? This action cannot be undone.`
        })}
        confirmButtonText={t('common.delete')}
        cancelButtonText={t('common.cancel')}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={deleteLoading}
        danger={true}
      />
    </div>
  );
};
