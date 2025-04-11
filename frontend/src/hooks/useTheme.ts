import { useEffect } from 'react'
import { useThemeStore } from '../store/themeStore'

export const useTheme = () => {
	const { theme, setTheme, toggleTheme } = useThemeStore()

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
