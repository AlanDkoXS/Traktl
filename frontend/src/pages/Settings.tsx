import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { useTimerPresetStore } from '../store/timerPresetStore';

export const Settings = () => {
	const { t, i18n } = useTranslation();
	const { theme, setTheme } = useTheme();
	const { user, updateUser, isLoading, error } = useAuthStore();
	const { timerPresets, fetchTimerPresets } = useTimerPresetStore();

	const [name, setName] = useState(user?.name || '');
	const [email, setEmail] = useState(user?.email || '');
	const [preferredLanguage, setPreferredLanguage] = useState<'es' | 'en' | 'tr'>(
		(user?.preferredLanguage as 'es' | 'en' | 'tr') || 'en'
	);
	const [userTheme, setUserTheme] = useState<'light' | 'dark'>(
		(user?.theme as 'light' | 'dark') || 'light'
	);
	const [defaultTimerPreset, setDefaultTimerPreset] = useState<string>(
		user?.defaultTimerPreset || ''
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');

	// Load timer presets
	useEffect(() => {
		fetchTimerPresets();
	}, [fetchTimerPresets]);

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
				defaultTimerPreset,
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
		</div>
	);
};
