import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import { GoogleLogo } from './GoogleLogo'

interface GoogleLoginButtonProps {
	isLogin?: boolean
}

export const GoogleLoginButton = ({
	isLogin = true,
}: GoogleLoginButtonProps) => {
	const { t } = useTranslation()
	const { loginWithGoogle } = useAuthStore()
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const googleButtonRef = useRef<HTMLDivElement>(null)
	const scriptLoaded = useRef(false)

	useEffect(() => {
		// Load the Google Identity Services script
		const loadGoogleScript = () => {
			if (scriptLoaded.current) return

			const script = document.createElement('script')
			script.src = 'https://accounts.google.com/gsi/client'
			script.id = 'google-identity-script'
			script.async = true
			script.defer = true
			script.onload = () => {
				scriptLoaded.current = true
				initializeGoogleSignIn()
			}
			script.onerror = () => {
				console.error('Failed to load Google script')
				setError('Failed to load Google authentication')
				setIsLoading(false)
			}
			document.body.appendChild(script)
		}

		loadGoogleScript()

		// Cleanup function
		return () => {
			// Clean up any Google-specific listeners or DOM elements if needed
			if (googleButtonRef.current) {
				googleButtonRef.current.innerHTML = ''
			}
		}
	}, [])

	const initializeGoogleSignIn = () => {
		if (!window.google || !scriptLoaded.current || !googleButtonRef.current)
			return

		try {
			// Initialize Google Identity Services
			window.google.accounts.id.initialize({
				client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
				callback: handleGoogleResponse,
				auto_select: false,
				cancel_on_tap_outside: true,
			})

			// Render the Google Sign-In button
			window.google.accounts.id.renderButton(googleButtonRef.current, {
				theme: 'outline',
				size: 'large',
				width: '100%',
				text: isLogin ? 'signin_with' : 'signup_with',
			})
		} catch (err) {
			console.error('Error initializing Google Sign-In:', err)
			setError('Error initializing Google Sign-In')
			setIsLoading(false)
		}
	}

	const handleGoogleResponse = async (response: any) => {
		console.log('Google response received')
		setIsLoading(true)
		try {
			// Call your backend with the token
			await loginWithGoogle(response.credential)
			console.log('Google login successful')
		} catch (error) {
			console.error('Error with Google authentication:', error)
			setError(t('auth.googleAuthError'))
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="w-full">
			{error && (
				<div className="mb-3 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-2 rounded-md text-sm">
					{error}
				</div>
			)}
			{isLoading ? (
				<div className="w-full flex justify-center items-center gap-2 py-3 bg-white border border-gray-300 text-gray-700 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200">
					<div className="w-5 h-5 border-2 border-t-2 border-transparent border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin" />
					<span>{t('common.loading')}</span>
				</div>
			) : (
				<div
					ref={googleButtonRef}
					className="w-full flex justify-center"
					id="google-login-button"
				></div>
			)}
		</div>
	)
}
