import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../ui/Modal';
import { useProjectStore } from '../../../store/projectStore';
import { toObjectIdOrUndefined } from '../../../utils/validationHelpers';
import { useClientStore } from '../../../store/clientStore';
import { useEffect } from 'react';

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (projectId: string) => void;
}

export const ProjectCreateModal = ({ isOpen, onClose, onProjectCreated }: ProjectCreateModalProps) => {
  const { t } = useTranslation();
  const { createProject } = useProjectStore();
  const { clients, fetchClients } = useClientStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [clientId, setClientId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch clients when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen, fetchClients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      setError(t('errors.required'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Convert clientId to a valid ObjectId or undefined to prevent the error
      const validClientId = toObjectIdOrUndefined(clientId);

      const newProject = await createProject({
        name,
        description,
        color,
        client: validClientId,
        status: 'active',
      });

      // Reset form
      setName('');
      setDescription('');
      setColor('#3b82f6');
      setClientId('');

      // Close modal and notify parent
      onProjectCreated(newProject.id);
      onClose();
    } catch (err: any) {
      console.error('Project creation error:', err);
      setError(err.message || t('errors.serverError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('projects.new')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('projects.name')} *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 mb-0 block w-full rounded-md border-gray-300 shadow-sm focus:border-[hsl(var(--color-project-hue),var(--color-project-saturation),var(--color-project-lightness))] focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('projects.description')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 mb-0 block w-full rounded-md border-gray-300 shadow-sm focus:border-[hsl(var(--color-project-hue),var(--color-project-saturation),var(--color-project-lightness))] focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('projects.color')}
          </label>
          <div className="mt-1 mb-0 flex items-center">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-8 w-8 p-0 rounded-md"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="ml-2 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-[hsl(var(--color-project-hue),var(--color-project-saturation),var(--color-project-lightness))] focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('projects.client')}
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="mt-1 mb-0 block w-full rounded-md border-gray-300 shadow-sm focus:border-[hsl(var(--color-project-hue),var(--color-project-saturation),var(--color-project-lightness))] focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
          >
            <option value="">{t('projects.noClient')}</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary dynamic-bg text-white"
          >
            {isSubmitting ? t('common.loading') : t('common.create')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
