import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { emailVerificationService } from '../services/emailVerificationService'
import { useAuthStore } from '../store/authStore'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

const VerifyEmail = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const location = useLocation()
	const [isVerifying, setIsVerifying] = useState(true)
	const [isSuccess, setIsSuccess] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const { checkVerificationStatus } = useAuthStore()

	useEffect(() => {
		const verifyEmail = async () => {
			const searchParams = new URLSearchParams(location.search)
			const token = searchParams.get('token')

			if (!token) {
				setIsVerifying(false)
				setErrorMessage(t('auth.noVerificationToken'))
				return
			}

			try {
				await emailVerificationService.verifyEmail(token)
				setIsSuccess(true)

				// Update verification status in the auth store
				await checkVerificationStatus()
			} catch (err: unknown) {
				setIsSuccess(false)
				const error = err as {
					response?: { data?: { message?: string } }
				}
				setErrorMessage(
					error.response?.data?.message ||
						t('auth.emailVerificationFailed'),
				)
			} finally {
				setIsVerifying(false)
			}
		}

		verifyEmail()
	}, [location.search, t, checkVerificationStatus])

	const handleContinue = () => {
		navigate('/dashboard')
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-4">
			<div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow">
				<div className="flex flex-col items-center">
					<h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white text-center dynamic-color">
						{t('auth.emailVerification')}
					</h2>
				</div>

				<div className="mt-8 space-y-6">
					{isVerifying ? (
						<div className="flex flex-col items-center">
							<svg
								className="animate-spin h-10 w-10 text-primary-500 dark:text-primary-400"
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
							<p className="mt-4 text-center text-gray-600 dark:text-gray-300">
								{t('auth.verifying')}
							</p>
						</div>
					) : isSuccess ? (
						<div className="flex flex-col items-center">
							<div className="h-20 w-20 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
								<CheckCircleIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
							</div>
							<h3 className="text-xl font-medium text-gray-900 dark:text-white dynamic-color">
								{t('auth.emailVerified')}
							</h3>
							<p className="mt-2 text-center text-gray-600 dark:text-gray-300">
								{t('auth.emailVerifiedDesc')}
							</p>
							<div className="mt-6">
								<button
									onClick={handleContinue}
									className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white dynamic-bg hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
								>
									{t('common.continue')}
								</button>
							</div>
						</div>
					) : (
						<div className="flex flex-col items-center">
							<div className="h-20 w-20 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
								<XCircleIcon className="h-12 w-12 text-red-600 dark:text-red-400" />
							</div>
							<h3 className="text-xl font-medium text-gray-900 dark:text-white dynamic-color">
								{t('auth.verificationFailed')}
							</h3>
							<p className="mt-2 text-center text-red-600 dark:text-red-400">
								{errorMessage}
							</p>
							<div className="mt-6">
								<button
									onClick={handleContinue}
									className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white dynamic-bg hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
								>
									{t('common.goToDashboard')}
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default VerifyEmail
