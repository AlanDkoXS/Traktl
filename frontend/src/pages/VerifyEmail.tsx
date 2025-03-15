import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';
import { emailVerificationService } from '../services/emailVerificationService';

export const VerifyEmail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setMessage(t('auth.emailVerificationExpired'));
        return;
      }

      setIsVerifying(true);
      try {
        await emailVerificationService.verifyEmail(token);
        setSuccess(true);
        setMessage(t('auth.emailVerified'));
      } catch (err: any) {
        setSuccess(false);
        setMessage(err.message || t('auth.emailVerificationExpired'));
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4 flex space-x-4">
        <LanguageSelector />
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('app.name')}
          </h1>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
            {t('auth.emailVerification')}
          </h2>
        </div>

        {isVerifying ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 dynamic-border"></div>
            <span className="ml-2">{t('common.loading')}</span>
          </div>
        ) : (
          <div className={success ? "bg-green-50 dark:bg-green-900/30 p-4 rounded-md" : "bg-red-50 dark:bg-red-900/30 p-4 rounded-md"}>
            <p className={success ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}>
              {message}
            </p>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
          >
            {t('auth.backToLogin')}
          </button>
        </div>
      </div>
    </div>
  );
};
