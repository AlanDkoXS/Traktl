import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';
import api from '../services/api';

export const ForgotPassword = () => {
	const { t } = useTranslation();
	const [email, setEmail] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email) {
			setError(t('errors.required'));
			return;
		}

		try {
			setIsSubmitting(true);
			setError('');
			setSuccessMessage('');

			// API call to request password reset
			await api.post('/users/forgot-password', { email });

			// Show success message even if the email doesn't exist for security reasons
			setSuccessMessage(
				t(
					'auth.passwordResetSent',
					'If an account with that email exists, we have sent password reset instructions.'
				)
			);
			setEmail('');
		} catch (err: any) {
			// For security, we don't want to reveal if the email exists or not
			setSuccessMessage(
				t(
					'auth.passwordResetSent',
					'If an account with that email exists, we have sent password reset instructions.'
				)
			);
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

			<div className="max-w-md w-full space-y-8">
				<div>
					<h1 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
						{t('app.name')}
					</h1>
					<h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
						{t('auth.forgotPassword')}
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
						{t('auth.forgotPasswordInstructions', 'Enter your email to receive password reset instructions.')}
					</p>
				</div>

				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					{error && (
						<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md text-sm">
							{error}
						</div>
					)}

					{successMessage && (
						<div className="bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-3 rounded-md text-sm">
							{successMessage}
						</div>
					)}

					<div>
						<label htmlFor="email-address" className="sr-only">
							{t('auth.email')}
						</label>
						<input
							id="email-address"
							name="email"
							type="email"
							autoComplete="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
							placeholder={t('auth.email')}
						/>
					</div>

					<div>
						<button
							type="submit"
							disabled={isSubmitting}
							className="btn btn-primary w-full py-2 justify-center"
						>
							{isSubmitting ? t('common.loading') : t('auth.resetPassword', 'Reset Password')}
						</button>
					</div>
					
					<div className="flex items-center justify-between mt-4">
						<Link
							to="/login"
							className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
						>
							{t('auth.backToLogin', 'Back to Login')}
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
};
