import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { authService } from '../../services/authService';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangePasswordModal = ({ isOpen, onClose, onSuccess }: ChangePasswordModalProps) => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  // Reset form state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setPasswordError('');
      setConfirmError('');
    }
  }, [isOpen]);

  // Password validation
  useEffect(() => {
    if (newPassword) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        setPasswordError(t('auth.passwordRequirements'));
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordError('');
    }
  }, [newPassword, t]);

  // Confirm password validation
  useEffect(() => {
    if (confirmPassword && newPassword !== confirmPassword) {
      setConfirmError(t('auth.passwordMismatch'));
    } else {
      setConfirmError('');
    }
  }, [newPassword, confirmPassword, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t('errors.required'));
      return;
    }

    // Check password validation
    if (passwordError) {
      return;
    }

    // Check password match
    if (newPassword !== confirmPassword) {
      setConfirmError(t('auth.passwordMismatch'));
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // Call API to change password
      await authService.changePassword(currentPassword, newPassword);

      // Success! Reset form and notify parent
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || t('errors.serverError');
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.changePassword')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('settings.currentPassword')}
          </label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 mb-0 block w-full rounded-md border-gray-300 shadow-sm focus:dynamic-border focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('settings.newPassword')}
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 mb-0 block w-full rounded-md border-gray-300 shadow-sm focus:dynamic-border focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
            required
          />
          {passwordError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {passwordError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('auth.passwordConfirm')}
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 mb-0 block w-full rounded-md border-gray-300 shadow-sm focus:dynamic-border focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
            required
          />
          {confirmError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {confirmError}
            </p>
          )}
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
            disabled={isSubmitting || !!passwordError || !!confirmError}
            className="btn btn-primary dynamic-bg text-white"
          >
            {isSubmitting ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
