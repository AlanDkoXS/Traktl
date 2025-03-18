import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LanguageSelector } from '../components/LanguageSelector'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuthStore } from '../store/authStore'
import { checkCurrentToken } from '../utils/tokenHelper'
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton'

export const Login = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const location = useLocation()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	// Use the login method from the auth store
	const { login, isAuthenticated, token } = useAuthStore()

	// Check token on mount for debugging
	useEffect(() => {
		console.log('Login component mounted, checking token...')
		checkCurrentToken()

		console.log('Auth state:', { isAuthenticated, token })

		// If already authenticated, redirect to dashboard
		if (isAuthenticated && token) {
			console.log('Already authenticated, redirecting to dashboard')
			navigate('/')
		}
	}, [isAuthenticated, token, navigate])

	// Redirect to the previous location after login
	const from = location.state?.from?.pathname || '/'

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!email || !password) {
			setError(t('errors.required'))
			return
		}

		try {
			setLoading(true)
			setError('')

			console.log('Attempting login with email:', email)

			// Call the login method from the auth store
			await login(email, password)

			console.log('Login successful, checking token after login')
			checkCurrentToken()

			// Login successful, redirect to the previous location
			console.log('Redirecting to:', from)
			navigate(from, { replace: true })
		} catch (err: any) {
			console.error('Login error:', err)
			setError(err.message || t('errors.serverError'))
		} finally {
			setLoading(false)
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
						{t('auth.signIn')}
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
						{t('auth.noAccount')}{' '}
						<Link
							to="/register"
							className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
						>
							{t('auth.signUp')}
						</Link>
					</p>
				</div>

				<GoogleAuthButton isLogin={true} />

				<div className="mt-6 flex items-center justify-center">
					<div className="border-t flex-grow border-gray-300 dark:border-gray-700"></div>
					<div className="mx-4 text-sm text-gray-500 dark:text-gray-400">
						{t('auth.orSignInWith')}
					</div>
					<div className="border-t flex-grow border-gray-300 dark:border-gray-700"></div>
				</div>

				<form className="mt-6 space-y-6" onSubmit={handleLogin}>
					{error && (
						<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md text-sm">
							{error}
						</div>
					)}

					<div className="rounded-md shadow-sm -space-y-px">
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
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
								placeholder={t('auth.email')}
							/>
						</div>
						<div>
							<label htmlFor="password" className="sr-only">
								{t('auth.password')}
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
								placeholder={t('auth.password')}
							/>
						</div>
					</div>

					<div className="flex items-center justify-between">
						<div className="text-sm">
							<Link
								to="/forgot-password"
								className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
							>
								{t('auth.forgotPassword')}
							</Link>
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={loading}
							className="btn btn-primary w-full py-2 justify-center"
						>
							{loading ? t('common.loading') : t('auth.signIn')}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
