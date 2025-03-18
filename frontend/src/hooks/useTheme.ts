import { useEffect } from 'react'
import { useThemeStore } from '../store/themeStore'
import { useAuthStore } from '../store/authStore'

export const useTheme = () => {
	const { theme, setTheme, toggleTheme } = useThemeStore()
	const { theme: userTheme, isAuthenticated } = useAuthStore()

	// Initialize theme from user preference when authenticated
	useEffect(() => {
		if (
			isAuthenticated &&
			userTheme &&
			(userTheme === 'light' || userTheme === 'dark')
		) {
			console.log(
				'🔵 useTheme: Setting theme from user preference:',
				userTheme,
			)
			setTheme(userTheme)
		}
	}, [userTheme, setTheme, isAuthenticated])

	// Apply theme to document
	useEffect(() => {
		if (theme === 'system' || !theme) {
			const isSystemDark = window.matchMedia(
				'(prefers-color-scheme: dark)',
			).matches
			document.documentElement.classList.toggle('dark', isSystemDark)
		} else if (theme === 'dark') {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}
	}, [theme])

	// Listen for system preference change
	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		const handleChange = () => {
			if (theme === 'system') {
				document.documentElement.classList.toggle(
					'dark',
					mediaQuery.matches,
				)
			}
		}
		mediaQuery.addEventListener('change', handleChange)
		return () => mediaQuery.removeEventListener('change', handleChange)
	}, [theme])

	return { theme, setTheme, toggleTheme }
}
