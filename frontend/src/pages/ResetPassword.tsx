import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';
import api from '../services/api';

export const ResetPassword = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { token } = useParams<{ token: string }>();
	const location = useLocation();
	
	// Get email from query params if available
	const queryParams = new URLSearchParams(location.search);
	const email = queryParams.get('email') || '';
	
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [confirmError, setConfirmError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	// Password validation
	useEffect(() => {
		if (password) {
			const passwordRegex =
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
			if (!passwordRegex.test(password)) {
				setPasswordError(t('auth.passwordRequirements'));
			} else {
				setPasswordError('');
			}
		} else {
			setPasswordError('');
		}
	}, [password, t]);

	// Confirm password validation
	useEffect(() => {
		if (confirmPassword && password !== confirmPassword) {
			setConfirmError(t('auth.passwordMismatch'));
		} else {
			setConfirmError('');
		}
	}, [password, confirmPassword, t]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate required fields
		if (!password || !confirmPassword) {
			setError(t('errors.required'));
			return;
		}

		// Check password validation
		if (passwordError) {
			return;
		}

		// Check password match
		if (password !== confirmPassword) {
			setConfirmError(t('auth.passwordMismatch'));
			return;
		}

		try {
			setIsSubmitting(true);
			setError('');

			// Send password reset request
			await api.post('/users/reset-password', { token, password });

			// Show success message and redirect to login after a delay
			setSuccessMessage(
				t(
					'auth.passwordResetSuccess',
					'Your password has been reset successfully. You can now login with your new password.'
				)
			);
			
			setTimeout(() => {
				navigate('/login');
			}, 3000);
		} catch (err: any) {
			const errorMessage = err.response?.data?.message || t('errors.serverError');
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

			<div className="max-w-md w-full space-y-8">
				<div>
					<h1 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
						{t('app.name')}
					</h1>
					<h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
						{t('auth.resetPassword', 'Reset Password')}
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
						{t('auth.resetPasswordInstructions', 'Enter your new password below.')}
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

					<div className="rounded-md shadow-sm space-y-4">
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								{t('auth.password')}
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="new-password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm mt-1"
								placeholder={t('auth.password')}
							/>
							{passwordError && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">
									{passwordError}
								</p>
							)}
						</div>
						<div>
							<label
								htmlFor="confirm-password"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								{t('auth.passwordConfirm')}
							</label>
							<input
								id="confirm-password"
								name="confirm-password"
								type="password"
								autoComplete="new-password"
								required
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm mt-1"
								placeholder={t('auth.passwordConfirm')}
							/>
							{confirmError && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">
									{confirmError}
								</p>
							)}
						</div>
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
