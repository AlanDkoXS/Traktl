import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../ui/Modal';
import { useTimerPresetStore } from '../../../store/timerPresetStore';

interface PresetCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPresetCreated: (presetId: string) => void;
  initialValues?: {
    workDuration: number;
    breakDuration: number;
    repetitions: number;
  };
}

export const PresetCreateModal = ({
  isOpen,
  onClose,
  onPresetCreated,
  initialValues
}: PresetCreateModalProps) => {
  const { t } = useTranslation();
  const { createTimerPreset } = useTimerPresetStore();

  const [name, setName] = useState('');
  const [workDuration, setWorkDuration] = useState(initialValues?.workDuration || 25);
  const [breakDuration, setBreakDuration] = useState(initialValues?.breakDuration || 5);
  const [repetitions, setRepetitions] = useState(initialValues?.repetitions || 4);
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
      const newPreset = await createTimerPreset({
        name,
        workDuration,
        breakDuration,
        repetitions,
      });

      // Reset form
      setName('');

      // Close modal and notify parent
      onPresetCreated(newPreset.id);
      onClose();
    } catch (err: any) {
      console.error('Preset creation error:', err);
      setError(err.message || t('errors.serverError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('timerPresets.new')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('timerPresets.name')} *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 mb-0 block w-full rounded-md border-gray-300 shadow-sm focus:dynamic-border focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('timerPresets.workDuration')} *
          </label>
          <input
            type="number"
            value={workDuration}
            onChange={(e) => setWorkDuration(parseInt(e.target.value))}
            min={1}
            className="mt-1 mb-0 block w-full rounded-md border-gray-300 shadow-sm focus:dynamic-border focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('timerPresets.breakDuration')} *
          </label>
          <input
            type="number"
            value={breakDuration}
            onChange={(e) => setBreakDuration(parseInt(e.target.value))}
            min={0}
            className="mt-1 mb-0 block w-full rounded-md border-gray-300 shadow-sm focus:dynamic-border focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('timerPresets.repetitions')} *
          </label>
          <input
            type="number"
            value={repetitions}
            onChange={(e) => setRepetitions(parseInt(e.target.value))}
            min={1}
            className="mt-1 mb-0 block w-full rounded-md border-gray-300 shadow-sm focus:dynamic-border focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
            required
          />
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
