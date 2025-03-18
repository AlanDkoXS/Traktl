import {
	SunIcon,
	MoonIcon,
	ComputerDesktopIcon,
} from '@heroicons/react/24/outline'
import { useTheme } from '../hooks/useTheme'
import { useTranslation } from 'react-i18next'

export const ThemeToggle = () => {
	const { theme, setTheme } = useTheme()
	const { t } = useTranslation()

	return (
		<div className="flex items-center space-x-3 p-2">
			<button
				onClick={() => setTheme('light')}
				className={`p-2 rounded-md ${theme === 'light' ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
				aria-label={t('theme.light')}
				title={t('theme.light')}
			>
				<SunIcon className="h-5 w-5" />
			</button>
			<button
				onClick={() => setTheme('dark')}
				className={`p-2 rounded-md ${theme === 'dark' ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
				aria-label={t('theme.dark')}
				title={t('theme.dark')}
			>
				<MoonIcon className="h-5 w-5" />
			</button>
			<button
				onClick={() => setTheme('system')}
				className={`p-2 rounded-md ${theme === 'system' ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
				aria-label={t('theme.system')}
				title={t('theme.system')}
			>
				<ComputerDesktopIcon className="h-5 w-5" />
			</button>
		</div>
	)
}
