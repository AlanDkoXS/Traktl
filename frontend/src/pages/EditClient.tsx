import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClientForm } from '../components/ClientForm';
import { useClientStore } from '../store/clientStore';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { TrashIcon } from '@heroicons/react/24/outline';
import { setProjectColor, resetProjectColor } from '../utils/dynamicColors';

export const EditClient = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedClient, fetchClient, deleteClient, isLoading, error } = useClientStore();
  const [notFound, setNotFound] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    // Check if id is undefined or invalid
    if (!id || id === 'undefined') {
      console.error('Invalid client ID:', id);
      setNotFound(true);
      return;
    }
    
    // Add a loading indicator
    const loadClient = async () => {
      try {
        await fetchClient(id);
      } catch (err) {
        console.error('Error fetching client:', err);
        setNotFound(true);
      }
    };
    
    loadClient();
    
    // Cleanup on unmount
    return () => {
      resetProjectColor();
    };
  }, [id, fetchClient]);

  // Set client color when selected client changes
  useEffect(() => {
    if (selectedClient?.color) {
      setProjectColor(selectedClient.color);
    }
  }, [selectedClient]);

  // Handle client deletion
  const handleDelete = async () => {
    if (!id) return;
    
    setDeleteLoading(true);
    try {
      await deleteClient(id);
      navigate('/clients');
    } catch (err) {
      console.error('Error deleting client:', err);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 dynamic-border"></div>
        <span className="ml-2">{t('common.loading')}</span>
      </div>
    );
  }

  if (error || notFound || !selectedClient) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {t('clients.notFound')}
        </p>
        <button onClick={() => navigate('/clients')} className="btn btn-primary">
          {t('common.goBack')}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white dynamic-color">
          {t('clients.edit')}
        </h1>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="btn btn-secondary bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
        >
          <TrashIcon className="h-5 w-5 mr-1" />
          {t('common.delete')}
        </button>
      </div>

      <div className="card-project">
        <div className="px-4 py-5 sm:p-6">
          <ClientForm client={selectedClient} isEditing />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title={t('common.confirmDelete')}
        message={t('clients.deleteConfirmation', {
          name: selectedClient.name,
          defaultValue: `Are you sure you want to delete the client "${selectedClient.name}"? This action cannot be undone.`
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
