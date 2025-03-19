import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../services/authService'
import { useTranslation } from 'react-i18next'
import { LanguageSelector } from '../components/LanguageSelector'
import { ThemeToggle } from '../components/ThemeToggle'

const ForgotPassword: React.FC = () => {
	const [email, setEmail] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [message, setMessage] = useState('')
	const [error, setError] = useState('')
	const { t } = useTranslation()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setMessage('')

		// Simple email validation
		if (!email || !email.includes('@')) {
			setError(
				t('auth.invalidEmail', 'Please enter a valid email address'),
			)
			return
		}

		setIsSubmitting(true)

		try {
			await authService.requestPasswordReset(email)
			setMessage(
				t(
					'auth.resetEmailSent',
					'If your email exists in our system, you will receive password reset instructions',
				),
			)
			// Clear the form
			setEmail('')
		} catch (error) {
			console.error('Error requesting password reset:', error)
			// We don't show specific errors from the server for security reasons
			setError(
				t(
					'auth.errorRequestingReset',
					'An error occurred while processing your request',
				),
			)
		} finally {
			setIsSubmitting(false)
		}
	}

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
						{t('auth.forgotPassword', 'Forgot Password')}
					</h2>
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

				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<label htmlFor="email-address" className="sr-only">
								{t('auth.emailAddress', 'Email address')}
							</label>
							<input
								id="email-address"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
								placeholder={t(
									'auth.emailAddress',
									'Email address',
								)}
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
					</div>

					<div className="flex items-center justify-between">
						<div className="text-sm">
							<Link
								to="/login"
								className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
							>
								{t('auth.backToLogin', 'Back to login')}
							</Link>
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={isSubmitting}
							className="btn btn-primary w-full py-2 justify-center"
						>
							{isSubmitting
								? t('common.loading', 'Loading...')
								: t('auth.sendResetLink', 'Send Reset Link')}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default ForgotPassword
