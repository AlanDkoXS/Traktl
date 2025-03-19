import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useTranslation } from 'react-i18next';
import axios, { AxiosError } from 'axios';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';

interface ErrorResponse {
  error?: string;
  message?: string;
}

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const params = useParams<{ token: string }>();
  const location = useLocation();
  const { t } = useTranslation();
  const [tokenValue, setTokenValue] = useState<string | null>(null);
  
  // Extraer token de parámetros URL o query params
  useEffect(() => {
    // Primero intentar obtener desde parámetros de ruta
    const pathToken = params.token;
    
    // Si no está en los parámetros, intentar query params
    const searchParams = new URLSearchParams(location.search);
    const queryToken = searchParams.get('token');
    
    // Usar el que encontremos
    const effectiveToken = pathToken || queryToken || null;
    console.log('ResetPassword mounted with token:', effectiveToken);
    setTokenValue(effectiveToken);
  }, [params.token, location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch', 'Passwords do not match'));
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError(t('auth.passwordTooShort', 'Password must be at least 6 characters long'));
      return;
    }

    // Validate token exists
    if (!tokenValue) {
      setError(t('auth.invalidResetLink', 'Invalid or expired password reset link'));
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.resetPassword(tokenValue, password);
      setMessage(t('auth.passwordResetSuccess', 'Your password has been reset successfully'));
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Error resetting password:', err);
      
      let errorMessage = t('auth.errorResettingPassword', 'An error occurred while resetting your password');
      
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ErrorResponse>;
        if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4 flex space-x-4">
        <LanguageSelector />
        <ThemeToggle />
      </div>
      
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('app.name')}
          </h1>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
            {t('auth.resetPassword', 'Reset Password')}
          </h2>
          {tokenValue && <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('auth.enterNewPassword', 'Enter your new password below')}
          </p>}
        </div>
        
        {message && (
          <div className="bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-3 rounded-md text-sm">
            {message}
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {tokenValue ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="password" className="sr-only">
                  {t('auth.newPassword', 'New Password')}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder={t('auth.newPassword', 'New Password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  {t('auth.confirmPassword', 'Confirm Password')}
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder={t('auth.confirmPassword', 'Confirm Password')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full py-2 justify-center"
              >
                {isSubmitting ? t('common.loading', 'Loading...') : t('auth.resetPassword', 'Reset Password')}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.invalidResetLink', 'Invalid or expired password reset link')}
            </p>
            <Link to="/login" className="mt-4 inline-block font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              {t('auth.backToLogin', 'Back to login')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
