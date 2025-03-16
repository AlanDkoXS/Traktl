import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { ChangePasswordModal } from '../components/auth/ChangePasswordModal';
import { emailVerificationService } from '../services/emailVerificationService';

export const Settings = () => {
	const { t, i18n } = useTranslation();
	const { setTheme } = useTheme();
	const { user, updateUser, error } = useAuthStore();

	const [name, setName] = useState(user?.name || '');
	const [email, setEmail] = useState(user?.email || '');
	const [preferredLanguage, setPreferredLanguage] = useState<'es' | 'en' | 'tr'>(
		(user?.preferredLanguage as 'es' | 'en' | 'tr') || 'en'
	);
	const [userTheme, setUserTheme] = useState<'light' | 'dark'>(
		(user?.theme as 'light' | 'dark') || 'light'
	);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');
	const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
	const [isEmailVerified, setIsEmailVerified] = useState(false);
	const [isVerificationLoading, setIsVerificationLoading] = useState(false);

	// Check email verification status
	useEffect(() => {
		const checkVerificationStatus = async () => {
			try {
				const verified = await emailVerificationService.checkVerificationStatus();
				setIsEmailVerified(verified);
			} catch (err) {
				console.error('Error checking verification status:', err);
			}
		};

		checkVerificationStatus();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsSubmitting(true);
		setSuccessMessage('');

		try {
			// Update user settings with valid theme value
			await updateUser({
				name,
				email,
				preferredLanguage,
				theme: userTheme,
			});

			// Apply changes to app UI
			setTheme(userTheme === 'light' ? 'light' : 'dark');
			i18n.changeLanguage(preferredLanguage);

			setSuccessMessage(t('settings.saved'));
		} catch (err) {
			console.error('Failed to save settings:', err);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newLang = e.target.value as 'es' | 'en' | 'tr';
		setPreferredLanguage(newLang);
		i18n.changeLanguage(newLang);
	};

	const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newTheme = e.target.value as 'light' | 'dark';
		setUserTheme(newTheme);
		setTheme(newTheme);
	};

	const handlePasswordChangeSuccess = () => {
		setSuccessMessage(t('settings.passwordChanged'));
	};

	const handleRequestVerification = async () => {
		setIsVerificationLoading(true);
		try {
			await emailVerificationService.requestVerification();
			setSuccessMessage(t('auth.emailVerificationSent'));
		} catch (err) {
			console.error('Error requesting verification:', err);
		} finally {
			setIsVerificationLoading(false);
		}
	};

	return (
		<div>
			<h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 dynamic-color">
				{t('nav.settings')}
			</h1>

			<div className="bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{error && (
						<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-md">
							{error}
						</div>
					)}

					{successMessage && (
						<div className="bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-4 rounded-md">
							{successMessage}
						</div>
					)}

					<div>
						<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 dynamic-color">
							{t('settings.profile')}
						</h2>

						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
							<div>
								<label
									htmlFor="name"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									{t('auth.name')}
								</label>
								<input
									type="text"
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:dynamic-border focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
								/>
								<button
									type="button"
									onClick={() => setShowChangePasswordModal(true)}
									className="btn btn-primary dynamic-bg text-white hover:brightness-110"
								>
									{t('settings.changePassword')}
								</button>
							</div>

							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									{t('auth.email')}
								</label>
								<input
									type="email"
									id="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:dynamic-border focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
								/>
								<div className="mt-1 flex items-center">
									<span className="text-xs mr-2">
										{t('settings.emailVerificationStatus')}:
									</span>
									{isEmailVerified ? (
										<span className="text-xs text-green-600 dark:text-green-400 flex items-center">
											<svg
												className="w-4 h-4 mr-1"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
													clipRule="evenodd"
												/>
											</svg>
											{t('settings.verified')}
										</span>
									) : (
										<div className="flex items-center">
											<span className="text-xs text-yellow-600 dark:text-yellow-400 mr-2">
												{t('settings.notVerified')}
											</span>
											<button
												type="button"
												onClick={handleRequestVerification}
												disabled={isVerificationLoading}
												className="btn btn-primary dynamic-bg text-white hover:brightness-110"
											>
												{isVerificationLoading
													? t('common.loading')
													: t('settings.requestVerification')}
											</button>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>

					<div>
						<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 dynamic-color">
							{t('settings.appearance')}
						</h2>

						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
							<div>
								<label
									htmlFor="language"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									{t('settings.language')}
								</label>
								<select
									id="language"
									value={preferredLanguage}
									onChange={handleLanguageChange}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:dynamic-border focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
								>
									<option value="en">{t('languages.english')}</option>
									<option value="es">{t('languages.spanish')}</option>
									<option value="tr">{t('languages.turkish')}</option>
								</select>
							</div>

							<div>
								<label
									htmlFor="theme"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									{t('settings.theme')}
								</label>
								<select
									id="theme"
									value={userTheme}
									onChange={handleThemeChange}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:dynamic-border focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
								>
									<option value="light">{t('theme.light')}</option>
									<option value="dark">{t('theme.dark')}</option>
								</select>
							</div>
						</div>
					</div>

					<div className="flex justify-end">
						<button
							type="submit"
							disabled={isSubmitting}
							className="btn btn-primary dynamic-bg text-white hover:brightness-110"
						>
							{isSubmitting ? t('common.loading') : t('common.save')}
						</button>
					</div>
				</form>
			</div>

			{/* Change Password Modal */}
			<ChangePasswordModal
				isOpen={showChangePasswordModal}
				onClose={() => setShowChangePasswordModal(false)}
				onSuccess={handlePasswordChangeSuccess}
			/>
		</div>
	);
};
