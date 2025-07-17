import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'

interface GoogleNotification {
	isNotDisplayed: () => boolean
	isSkippedMoment: () => boolean
	isDismissedMoment: () => boolean
	getMomentType: () => string
}

interface GoogleCredentialResponse {
	credential: string
	select_by: string
	client_id: string
}

declare global {
	interface Window {
		google?: {
			accounts?: {
				id: {
					initialize: (config: {
						client_id: string
						callback: (response: GoogleCredentialResponse) => void
						auto_select: boolean
						cancel_on_tap_outside: boolean
					}) => void
					prompt: (
						callback: (notification: GoogleNotification) => void,
					) => void
					renderButton: (
						element: HTMLElement,
						options: {
							theme: string
							size: string
							width: string
						},
					) => void
				}
			}
		}
	}
}

interface GoogleAuthButtonProps {
	isLogin?: boolean
}

export const GoogleAuthButton = ({ isLogin = true }: GoogleAuthButtonProps) => {
	const { t } = useTranslation()
	const { loginWithGoogle } = useAuthStore()
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [isGoogleReady, setIsGoogleReady] = useState(false)
	const googleButtonRef = useRef<HTMLDivElement>(null)
	const isInitialized = useRef(false)

	useEffect(() => {
		const initializeGoogle = async () => {
			if (isInitialized.current) return

			try {
				await loadGoogleScript()

				if (!window.google?.accounts?.id) {
					throw new Error('Google Identity Services not available')
				}

				window.google.accounts.id.initialize({
					client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
					callback: handleGoogleResponse,
					auto_select: false,
					cancel_on_tap_outside: true,
				})

				setIsGoogleReady(true)
				isInitialized.current = true

				// No renderizamos automáticamente el botón de Google
				// para mantener la apariencia consistente
			} catch (error) {
				console.error('Error initializing Google Sign-In:', error)
				setError('Error setting up Google authentication')
			}
		}

		initializeGoogle()

		// Cleanup function
		return () => {
			if (googleButtonRef.current) {
				googleButtonRef.current.innerHTML = ''
			}
		}
	}, [])

	const handleGoogleResponse = async (response: GoogleCredentialResponse) => {
		console.log(
			'Google response received with credential:',
			response.credential
				? `${response.credential.substring(0, 20)}...`
				: 'none',
		)

		setIsLoading(true)
		setError(null)

		try {
			await loginWithGoogle(response.credential)
			console.log('Google login successful')
		} catch (error) {
			console.error('Error with Google authentication:', error)
			setError('Failed to authenticate with Google')
		} finally {
			setIsLoading(false)
		}
	}

	const loadGoogleScript = () => {
		return new Promise<void>((resolve, reject) => {
			// Si ya existe el script y la API está disponible
			if (document.getElementById('google-identity-script')) {
				if (window.google?.accounts?.id) {
					resolve()
				} else {
					// Esperar un poco más para que la API se cargue
					setTimeout(() => {
						if (window.google?.accounts?.id) {
							resolve()
						} else {
							reject(
								new Error(
									'Google script loaded but API not available',
								),
							)
						}
					}, 1000)
				}
				return
			}

			const script = document.createElement('script')
			script.src = 'https://accounts.google.com/gsi/client'
			script.id = 'google-identity-script'
			script.async = true
			script.defer = true
			script.onload = () => {
				// Esperar un poco para que la API se inicialice completamente
				setTimeout(() => {
					if (window.google?.accounts?.id) {
						resolve()
					} else {
						reject(
							new Error(
								'Google script loaded but API not available',
							),
						)
					}
				}, 500)
			}
			script.onerror = () =>
				reject(new Error('Failed to load Google script'))
			document.head.appendChild(script)
		})
	}

	const handleGoogleAuth = () => {
		if (!isGoogleReady || !window.google?.accounts?.id) {
			setError('Google authentication not ready. Please try again.')
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			window.google.accounts.id.prompt(
				(notification: GoogleNotification) => {
					if (
						notification.isNotDisplayed() ||
						notification.isSkippedMoment()
					) {
						setError(
							'Google authentication was cancelled or not available',
						)
						setIsLoading(false)
					}
				},
			)
		} catch (error) {
			console.error('Error with Google prompt:', error)
			setError('Error with Google authentication')
			setIsLoading(false)
		}
	}

	return (
		<div className="w-full">
			{error && (
				<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md text-sm mb-3">
					{error}
				</div>
			)}

			{/* Botón personalizado consistente */}
			<button
				type="button"
				className="w-full flex justify-center items-center gap-3 py-2.5 px-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
				onClick={handleGoogleAuth}
				disabled={isLoading}
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

			{/* Contenedor oculto para el botón de Google (necesario para la API) */}
			<div ref={googleButtonRef} className="hidden" />
		</div>
	)
}
