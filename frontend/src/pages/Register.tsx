import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { LanguageSelector } from '../components/LanguageSelector'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuthStore } from '../store/authStore'
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton'

export const Register = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const { register, isAuthenticated } = useAuthStore()
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState('')
	const [passwordError, setPasswordError] = useState('')
	const [confirmError, setConfirmError] = useState('')
	const [loading, setIsSubmitting] = useState(false)

	// Check if already authenticated
	useEffect(() => {
		if (isAuthenticated) {
			navigate('/')
		}
	}, [isAuthenticated, navigate])

	// Password validation
	useEffect(() => {
		if (password) {
			const passwordRegex =
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
			if (!passwordRegex.test(password)) {
				setPasswordError(t('auth.passwordRequirements'))
			} else {
				setPasswordError('')
			}
		} else {
			setPasswordError('')
		}
	}, [password, t])

	// Confirm password validation
	useEffect(() => {
		if (confirmPassword && password !== confirmPassword) {
			setConfirmError(t('auth.passwordMismatch'))
		} else {
			setConfirmError('')
		}
	}, [password, confirmPassword, t])

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault()

		// Validate required fields
		if (!name || !email || !password || !confirmPassword) {
			setError(t('errors.required'))
			return
		}

		// Check password validation
		if (passwordError) {
			return
		}

		// Check password match
		if (password !== confirmPassword) {
			setConfirmError(t('auth.passwordMismatch'))
			return
		}

		try {
			setIsSubmitting(true)
			setError('')

			// Note: changed 'system' to 'light' here to match backend validation
			await register(name, email, password, 'en', 'light')

			navigate('/')
		} catch (err: any) {
			setError(err.message || t('errors.serverError'))
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

			<div className="max-w-md w-full space-y-8">
				<div>
					<h1 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
						{t('app.name')}
					</h1>
					<h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
						{t('auth.signUp')}
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
						{t('auth.alreadyHaveAccount')}{' '}
						<Link
							to="/login"
							className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
						>
							{t('auth.signIn')}
						</Link>
					</p>
				</div>

				<GoogleAuthButton isLogin={false} />

				<div className="mt-6 flex items-center justify-center">
					<div className="border-t flex-grow border-gray-300 dark:border-gray-700"></div>
					<div className="mx-4 text-sm text-gray-500 dark:text-gray-400">
						{t('auth.orSignUpWith')}
					</div>
					<div className="border-t flex-grow border-gray-300 dark:border-gray-700"></div>
				</div>

				<form className="mt-6 space-y-6" onSubmit={handleRegister}>
					{error && (
						<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md text-sm">
							{error}
						</div>
					)}

					<div className="rounded-md shadow-sm space-y-4">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								{t('auth.name')}
							</label>
							<input
								id="name"
								name="name"
								type="text"
								autoComplete="name"
								required
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm mt-1"
								placeholder={t('auth.name')}
							/>
						</div>
						<div>
							<label
								htmlFor="email-address"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
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
								className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm mt-1"
								placeholder={t('auth.email')}
							/>
						</div>
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
								onChange={(e) =>
									setConfirmPassword(e.target.value)
								}
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
							disabled={
								loading || !!passwordError || !!confirmError
							}
							className="btn btn-primary w-full py-2 justify-center"
						>
							{loading ? t('common.loading') : t('auth.signUp')}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
