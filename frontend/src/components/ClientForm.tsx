import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useClientStore } from '../store/clientStore';
import { Client } from '../types';

interface ClientFormProps {
  client?: Client;
  isEditing?: boolean;
}

export const ClientForm = ({ client, isEditing = false }: ClientFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createClient, updateClient } = useClientStore();

  const [name, setName] = useState(client?.name || '');
  const [contactInfo, setContactInfo] = useState(client?.contactInfo || '');
  const [color, setColor] = useState(client?.color || '#3b82f6');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      setError(t('errors.required'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (isEditing && client) {
        await updateClient(client.id, {
          name,
          contactInfo,
          color,
        });
      } else {
        await createClient({
          name,
          contactInfo,
          color,
        });
      }

      navigate('/clients');
    } catch (err: any) {
      setError(err.message || t('errors.serverError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('clients.name')} *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
          required
        />
      </div>

      <div>
        <label
          htmlFor="contactInfo"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('clients.contact')}
        </label>
        <textarea
          id="contactInfo"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="color"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('clients.color')}
        </label>
        <div className="mt-1 flex items-center">
          <input
            type="color"
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-8 w-8 rounded-md border-gray-300 dark:border-gray-600"
          />
          <input
            title="color"
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="ml-2 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate('/clients')}
          className="btn btn-secondary"
        >
          {t('common.cancel')}
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting
            ? t('common.loading')
            : isEditing
              ? t('common.update')
              : t('common.create')}
        </button>
      </div>
    </form>
  );
};
