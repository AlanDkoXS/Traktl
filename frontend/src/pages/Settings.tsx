import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../hooks/useTheme'
import { useAuthStore } from '../store/authStore'
import { ChangePasswordModal } from '../components/auth/ChangePasswordModal'
import { emailVerificationService } from '../services/emailVerificationService'
import { Modal } from '../components/ui/Modal'
import { XCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'

export const Settings = () => {
	const { t, i18n } = useTranslation()
	const { setTheme } = useTheme()
	const {
		user,
		updateUser,
		error,
		isEmailVerified,
		checkVerificationStatus,
	} = useAuthStore()

	const [name, setName] = useState(user?.name || '')
	const [email, setEmail] = useState(user?.email || '')
	const [preferredLanguage, setPreferredLanguage] = useState<
		'es' | 'en' | 'tr'
	>((user?.preferredLanguage as 'es' | 'en' | 'tr') || 'en')
	const [userTheme, setUserTheme] = useState<'light' | 'dark'>(
		(user?.theme as 'light' | 'dark') || 'light',
	)

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [successMessage, setSuccessMessage] = useState('')
	const [showChangePasswordModal, setShowChangePasswordModal] =
		useState(false)
	const [isVerificationLoading, setIsVerificationLoading] = useState(false)
	const [showVerificationModal, setShowVerificationModal] = useState(false)
	const [verificationError, setVerificationError] = useState('')

	useEffect(() => {
		const refreshVerificationStatus = async () => {
			try {
				console.log('⚪ Settings: Refreshing verification status...')
				const result = await checkVerificationStatus()
				console.log(
					'🟢 Settings: Verification status refreshed:',
					result.isVerified,
				)
			} catch (err) {
				console.error(
					'🔴 Settings: Error refreshing verification status:',
					err,
				)
			}
		}

		refreshVerificationStatus()

		const intervalId = setInterval(() => {
			console.log('⚪ Settings: Periodic verification status check')
			refreshVerificationStatus()
		}, 30000)

		return () => {
			console.log('🔵 Settings: Component unmounting, clearing interval')
			clearInterval(intervalId)
		}
	}, [checkVerificationStatus])

	useEffect(() => {
		if (user) {
			console.log(
				'🔵 Settings: User data changed, updating form fields:',
				user,
			)
			setName(user.name || '')
			setEmail(user.email || '')
			setPreferredLanguage(
				(user.preferredLanguage as 'es' | 'en' | 'tr') || 'en',
			)
			setUserTheme((user.theme as 'light' | 'dark') || 'light')
		}
	}, [user])

	useEffect(() => {
		console.log('🔵 Settings: Verification state changed:', {
			isEmailVerified,
			hasUser: !!user,
			userId: user?.id,
			userVerified: user?.isVerified,
			hasToken: !!user?.emailVerificationToken?.token,
		})
	}, [isEmailVerified, user])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)
		setSuccessMessage('')

		try {
			await updateUser({
				name,
				email,
				preferredLanguage,
				theme: userTheme,
			})

			setTheme(userTheme === 'light' ? 'light' : 'dark')
			i18n.changeLanguage(preferredLanguage)
			setSuccessMessage(t('settings.saved'))

			await checkVerificationStatus()
		} catch (err) {
			console.error('🔴 Settings: Failed to save settings:', err)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newLang = e.target.value as 'es' | 'en' | 'tr'
		setPreferredLanguage(newLang)
		i18n.changeLanguage(newLang)
	}

	const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newTheme = e.target.value as 'light' | 'dark'
		setUserTheme(newTheme)
		setTheme(newTheme)
	}

	const handlePasswordChangeSuccess = () => {
		setSuccessMessage(t('settings.passwordChanged'))
	}

	const handleRequestVerification = async () => {
		setIsVerificationLoading(true)
		setVerificationError('')
		try {
			await emailVerificationService.requestVerification()
			setShowVerificationModal(true)
			await checkVerificationStatus()
		} catch (err: unknown) {
			setVerificationError(
				err instanceof Error
					? err.message
					: 'Error requesting verification email',
			)
		} finally {
			setIsVerificationLoading(false)
		}
	}

	const renderVerificationStatus = () => {
		const verificationStatus = isEmailVerified

		console.log('Render verification status:', {
			storeValue: isEmailVerified,
			computed: verificationStatus,
		})

		if (verificationStatus) {
			return (
				<div className="text-sm text-green-600 dark:text-green-400 flex items-center bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
					<CheckCircleSolid className="w-5 h-5 mr-1" />
					{t('settings.verified')}
				</div>
			)
		} else {
			return (
				<div className="flex flex-col">
					<div className="flex items-center">
						<div className="text-sm text-red-600 dark:text-red-400 flex items-center bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-full mr-3">
							<XCircleIcon className="w-5 h-5 mr-1" />
							{t('settings.notVerified')}
						</div>
						<button
							type="button"
							onClick={handleRequestVerification}
							disabled={isVerificationLoading}
							className="btn btn-primary dynamic-bg text-white hover:brightness-110 text-sm px-3 py-1.5 rounded-full"
						>
							{isVerificationLoading ? (
								<span className="flex items-center">
									<svg
										className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									{t('common.loading')}
								</span>
							) : (
								<span className="flex items-center">
									<EnvelopeIcon className="w-4 h-4 mr-1" />
									{t('settings.requestVerification')}
								</span>
							)}
						</button>
					</div>
					{verificationError && (
						<span className="text-sm text-red-600 dark:text-red-400 mt-1">
							{verificationError}
						</span>
					)}
				</div>
			)
		}
	}

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
									onClick={() =>
										setShowChangePasswordModal(true)
									}
									className="mt-4 btn btn-primary dynamic-bg text-white hover:brightness-110"
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
								<div className="mt-4 flex items-center">
									<span className="text-sm mr-2">
										{t('settings.emailVerificationStatus')}:
									</span>
									{renderVerificationStatus()}
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
									<option value="en">
										{t('languages.english')}
									</option>
									<option value="es">
										{t('languages.spanish')}
									</option>
									<option value="tr">
										{t('languages.turkish')}
									</option>
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
									<option value="light">
										{t('theme.light')}
									</option>
									<option value="dark">
										{t('theme.dark')}
									</option>
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
							{isSubmitting
								? t('common.loading')
								: t('common.save')}
						</button>
					</div>
				</form>
			</div>

			<ChangePasswordModal
				isOpen={showChangePasswordModal}
				onClose={() => setShowChangePasswordModal(false)}
				onSuccess={handlePasswordChangeSuccess}
			/>

			<Modal
				isOpen={showVerificationModal}
				onClose={() => setShowVerificationModal(false)}
				title={t('auth.emailVerification')}
			>
				<div className="flex flex-col items-center">
					<div className="h-16 w-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
						<EnvelopeIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
					</div>
					<p className="text-center text-gray-800 dark:text-gray-200 mb-6">
						{t('auth.emailVerificationSent')}
					</p>
					<button
						className="btn btn-primary dynamic-bg text-white"
						onClick={() => setShowVerificationModal(false)}
					>
						{t('common.close')}
					</button>
				</div>
			</Modal>
		</div>
	)
}
