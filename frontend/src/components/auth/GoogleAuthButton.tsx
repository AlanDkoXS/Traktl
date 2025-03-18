import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'

interface GoogleAuthButtonProps {
	isLogin?: boolean
}

export const GoogleAuthButton = ({ isLogin = true }: GoogleAuthButtonProps) => {
	const { t } = useTranslation()
	const { loginWithGoogle } = useAuthStore()
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Handle Google Login
	const handleGoogleLogin = async () => {
		setIsLoading(true)
		setError(null)

		try {
			// Load the Google Identity Services script
			await loadGoogleScript()

			// Initialize Google Identity Services
			window.google.accounts.id.initialize({
				client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
				callback: handleGoogleResponse,
				auto_select: false,
				cancel_on_tap_outside: true,
			})

			// Prompt the Google One Tap UI
			window.google.accounts.id.prompt((notification: any) => {
				if (
					notification.isNotDisplayed() ||
					notification.isSkippedMoment()
				) {
					// Try manual prompt
					console.log(
						'One Tap was skipped or not displayed, falling back to manual prompt',
					)
					window.google.accounts.id.renderButton(
						document.getElementById('google-login-button')!,
						{ theme: 'outline', size: 'large', width: '100%' },
					)
				}
			})
		} catch (error) {
			console.error('Error initializing Google Sign-In:', error)
			setError('Error setting up Google authentication')
			setIsLoading(false)
		}
	}

	const handleGoogleResponse = async (response: any) => {
		console.log(
			'Google response received with credential:',
			response.credential
				? `${response.credential.substring(0, 20)}...`
				: 'none',
		)
		try {
			// Call your backend with the token - be sure to use the correct parameter name
			await loginWithGoogle(response.credential)
			console.log('Google login successful')
		} catch (error) {
			console.error('Error with Google authentication:', error)
			setError('Failed to authenticate with Google')
		} finally {
			setIsLoading(false)
		}
	}

	// Function to load Google Identity Services script
	const loadGoogleScript = () => {
		return new Promise<void>((resolve, reject) => {
			if (document.getElementById('google-identity-script')) {
				resolve()
				return
			}

			const script = document.createElement('script')
			script.src = 'https://accounts.google.com/gsi/client'
			script.id = 'google-identity-script'
			script.async = true
			script.defer = true
			script.onload = () => resolve()
			script.onerror = () =>
				reject(new Error('Failed to load Google script'))
			document.body.appendChild(script)
		})
	}

	return (
		<div className="w-full">
			{error && (
				<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md text-sm mb-3">
					{error}
				</div>
			)}

			<button
				type="button"
				className="w-full flex justify-center items-center gap-3 py-2.5 px-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
				onClick={handleGoogleLogin}
				disabled={isLoading}
				id="google-login-button"
			>
				{isLoading ? (
					<div className="w-5 h-5 border-2 border-t-2 border-transparent border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin" />
				) : (
					<svg
						className="w-5 h-5"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill="#4285F4"
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						/>
						<path
							fill="#34A853"
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						/>
						<path
							fill="#FBBC05"
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
						/>
						<path
							fill="#EA4335"
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						/>
					</svg>
				)}
				<span className="flex-1 text-center">
					{isLoading
						? t('common.loading')
						: isLogin
							? t('auth.signInWithGoogle')
							: t('auth.signUpWithGoogle')}
				</span>
			</button>
		</div>
	)
}
