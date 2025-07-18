import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../hooks/useTheme'
import { useAuthStore } from '../store/authStore'
import { ChangePasswordModal } from '../components/auth/ChangePasswordModal'
import { emailVerificationService } from '../services/emailVerificationService'
import { Modal } from '../components/ui/Modal'
import {
	CheckCircleIcon,
	XCircleIcon,
	EnvelopeIcon,
	TrashIcon,
	ClockIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'

const Settings = () => {
	const { t, i18n } = useTranslation()
	const { setTheme } = useTheme()
	const {
		user,
		updateUser,
		error,
		isEmailVerified,
		checkVerificationStatus,
		deleteUser,
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
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [countdown, setCountdown] = useState(0)

	useEffect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => {
				setCountdown((prev) => prev - 1)
			}, 1000)
			return () => clearTimeout(timer)
		}
	}, [countdown])

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

			window.location.href = '/'
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
		if (isVerificationLoading || countdown > 0) {
			return
		}

		setIsVerificationLoading(true)
		setVerificationError('')
		setSuccessMessage('')

		try {
			setCountdown(60)

			const response =
				await emailVerificationService.requestVerification()
			console.log('Verification response:', response)

			if (response.success) {
				setSuccessMessage(t('settings.verificationEmailSent'))
				await checkVerificationStatus()
			} else {
				setCountdown(0)
				setVerificationError(
					response.message || t('errors.verificationRequestFailed'),
				)
			}
		} catch (err: unknown) {
			setCountdown(0)
			console.error('Error requesting verification:', err)

			if (err instanceof Error) {
				setVerificationError(err.message)
			} else {
				setVerificationError(t('errors.verificationRequestFailed'))
			}
		} finally {
			setIsVerificationLoading(false)
		}
	}

	useEffect(() => {
		if (successMessage) {
			const timer = setTimeout(() => {
				setSuccessMessage('')
			}, 5000)
			return () => clearTimeout(timer)
		}
	}, [successMessage])

	const handleDeleteAccount = async () => {
		setIsDeleting(true)
		try {
			await deleteUser()
		} catch (err) {
			console.error('Failed to delete account:', err)
		} finally {
			setIsDeleting(false)
			setShowDeleteModal(false)
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
				<div className="flex flex-col space-y-3">
					<div className="flex flex-wrap items-center gap-3">
						<div className="text-sm text-red-600 dark:text-red-400 flex items-center bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-md">
							<XCircleIcon className="w-5 h-5 mr-1" />
							{t('settings.notVerified')}
						</div>
						<button
							type="button"
							onClick={handleRequestVerification}
							disabled={isVerificationLoading || countdown > 0}
							className={`btn transition-all min-w-[160px] ${
								countdown > 0 || isVerificationLoading
									? 'bg-gray-400 dark:bg-gray-600 text-white opacity-50 pointer-events-none'
									: 'btn-primary dynamic-bg text-white hover:brightness-110'
							}`}
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
							) : countdown > 0 ? (
								<span className="flex items-center">
									<ClockIcon className="w-4 h-4 mr-1" />
									{t('settings.waitSeconds', {
										seconds: countdown,
									})}
								</span>
							) : (
								<span className="flex items-center">
									<EnvelopeIcon className="w-4 h-4 mr-1" />
									{t('settings.requestVerification')}
								</span>
							)}
						</button>
					</div>
					{successMessage && (
						<div className="text-sm text-green-600 dark:text-green-400 flex items-center mt-2">
							<CheckCircleIcon className="w-4 h-4 mr-1" />
							{successMessage}
						</div>
					)}
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

					{/* El mensaje de éxito global se muestra aquí */}

					<div>
						<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 dynamic-color">
							{t('settings.profile')}
						</h2>

						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
							<div>
								<label
									htmlFor="name"
									className="form-label"
								>
									{t('auth.name')}
								</label>
								<input
									type="text"
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="form-input"
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
									className="form-label"
								>
									{t('auth.email')}
								</label>
								<input
									type="email"
									id="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="form-input"
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
									className="form-label"
								>
									{t('settings.language')}
								</label>
								<select
									id="language"
									value={preferredLanguage}
									onChange={handleLanguageChange}
									className="form-input"
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
									className="form-label"
								>
									{t('settings.theme')}
								</label>
								<select
									id="theme"
									value={userTheme}
									onChange={handleThemeChange}
									className="form-input"
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

					<div className="mt-8">
						<h2 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">
							{t('settings.dangerZone')}
						</h2>
						<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
								<div>
									<h3 className="text-base font-medium text-red-800 dark:text-red-200">
										{t('settings.deleteAccount')}
									</h3>
									<p className="mt-1 text-sm text-red-700 dark:text-red-300">
										{t('settings.deleteAccountDescription')}
									</p>
								</div>
								<button
									type="button"
									onClick={() => setShowDeleteModal(true)}
									className="btn bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors duration-200 flex items-center gap-2"
								>
									<TrashIcon className="w-5 h-5" />
									{t('settings.deleteAccount')}
								</button>
							</div>
						</div>
					</div>

					<div className="flex justify-end gap-3">
						<button
							type="button"
							onClick={() => window.history.back()}
							className="btn btn-secondary text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
						>
							{t('common.cancel')}
						</button>
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

			{/* Delete Account Confirmation Modal */}
			<Modal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				title={t('settings.deleteAccount')}
			>
				<div className="mt-4">
					<p className="text-sm text-gray-700 dark:text-gray-300">
						{t('settings.deleteAccountConfirmation')}
					</p>
				</div>
				<div className="mt-6 flex justify-end gap-3">
					<button
						type="button"
						onClick={() => setShowDeleteModal(false)}
						className="btn btn-secondary"
					>
						{t('common.cancel')}
					</button>
					<button
						type="button"
						onClick={handleDeleteAccount}
						disabled={isDeleting}
						className="btn bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors duration-200 flex items-center gap-2"
					>
						{isDeleting ? (
							<>
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
							</>
						) : (
							<>
								<TrashIcon className="w-5 h-5" />
								{t('settings.deleteAccount')}
							</>
						)}
					</button>
				</div>
			</Modal>

			<ChangePasswordModal
				isOpen={showChangePasswordModal}
				onClose={() => setShowChangePasswordModal(false)}
				onSuccess={handlePasswordChangeSuccess}
			/>

			{/* Email Verification Modal */}
			<Modal
				isOpen={showVerificationModal}
				onClose={() => setShowVerificationModal(false)}
				title={t('settings.verifyEmail')}
			>
				<div className="p-6">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						{t('settings.verificationEmailSent')}
					</p>
				</div>
			</Modal>
		</div>
	)
}

export default Settings
