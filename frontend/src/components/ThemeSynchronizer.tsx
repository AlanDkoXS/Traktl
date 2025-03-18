import { useEffect } from 'react'
import { useThemeStore } from '../store/themeStore'
import { useAuthStore } from '../store/authStore'

/**
 * Component that synchronizes the application theme with the user's preferences.
 * It ensures that:
 * 1. When a user logs in, their preferred theme is applied
 * 2. When a user changes the theme, it's saved to their profile
 */
export const ThemeSynchronizer: React.FC = () => {
	const { theme } = useThemeStore()
	const {
		user,
		updateUser,
		isAuthenticated,
		theme: userTheme,
	} = useAuthStore()

	// Apply theme from user preferences when user logs in
	useEffect(() => {
		if (
			isAuthenticated &&
			userTheme &&
			(userTheme === 'light' || userTheme === 'dark')
		) {
			console.log(
				'🔵 ThemeSynchronizer: Using theme from user preferences:',
				userTheme,
			)

			// Only update theme store if it's different from current theme
			if (theme !== userTheme && theme !== 'system') {
				const themeStore = useThemeStore.getState()
				themeStore.setTheme(userTheme)
			}
		}
	}, [isAuthenticated, userTheme])

	// Sync theme with backend whenever it changes and user is authenticated
	useEffect(() => {
		if (
			isAuthenticated &&
			user &&
			theme !== 'system' &&
			theme !== user.theme
		) {
			console.log(
				'🔵 ThemeSynchronizer: Syncing theme with backend:',
				theme,
			)
			updateUser({ theme })
		}
	}, [theme, user, updateUser, isAuthenticated])

	// This is a utility component that doesn't render anything
	return null
}
