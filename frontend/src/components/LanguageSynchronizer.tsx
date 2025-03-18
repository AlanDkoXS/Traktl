import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../store/authStore'

/**
 * Component that synchronizes the application language with the user's preferences.
 * It ensures that:
 * 1. When a user logs in, their preferred language is applied
 * 2. When a user changes the language, it's saved to their profile
 */
export const LanguageSynchronizer: React.FC = () => {
	const { i18n } = useTranslation()
	const { user, updateUser, isAuthenticated, preferredLanguage } =
		useAuthStore()

	// Initialize language from user preference when user logs in
	useEffect(() => {
		if (preferredLanguage && i18n.language !== preferredLanguage) {
			console.log(
				'🔵 LanguageSynchronizer: Setting language from user preference:',
				preferredLanguage,
			)
			i18n.changeLanguage(preferredLanguage).catch((error) => {
				console.error('Error changing language:', error)
			})
		}
	}, [preferredLanguage, i18n])

	// Sync language with backend whenever it changes and user is authenticated
	useEffect(() => {
		if (
			isAuthenticated &&
			user &&
			i18n.language !== user.preferredLanguage
		) {
			console.log(
				'🔵 LanguageSynchronizer: Syncing language with backend:',
				i18n.language,
			)
			updateUser({
				preferredLanguage: i18n.language as 'es' | 'en' | 'tr',
			})
		}
	}, [i18n.language, user, updateUser, isAuthenticated])

	// This is a utility component that doesn't render anything
	return null
}
