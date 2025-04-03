import { useEffect, useState, useRef, createContext, useContext } from 'react'
import { useTimerPresetStore } from '../store/timerPresetStore'
import { useProjectStore } from '../store/projectStore'
import { useTimerStore } from '../store/timerStore'
import { useAuthStore } from '../store/authStore'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '../store/themeStore'
import SocketHandler from './SocketHandler'
import { setProjectColor } from '../utils/dynamicColors'
import { TimerPreset } from '../types'

// Create a context to expose initialization state
interface DataInitializerContextType {
	isInitialized: boolean
	isLoading: boolean
}

export const DataInitializerContext = createContext<DataInitializerContextType>(
	{
		isInitialized: false,
		isLoading: false,
	},
)

// Custom hook to use the context
export const useDataInitializer = () => useContext(DataInitializerContext)

/**
 * Component responsible for initializing application data
 * after user authentication. Loads projects, timer presets,
 * and sets up default selections for new users.
 */
const DataInitializer = () => {
	const {
		isAuthenticated,
		user,
		preferredLanguage,
		theme: userTheme,
		updateUser,
	} = useAuthStore()
	const { fetchProjects, createProject } = useProjectStore()
	const { i18n } = useTranslation()
	const { theme, setTheme } = useThemeStore()

	const { fetchTimerPresets, selectTimerPreset, createTimerPreset } =
		useTimerPresetStore()

	const {
		setWorkDuration,
		setBreakDuration,
		setRepetitions,
		setProjectId,
		projectId: currentProjectId,
	} = useTimerStore()

	// Flag to track initialization
	const [initialized, setInitialized] = useState(false)
	// Flag to track loading state
	const [isLoading, setIsLoading] = useState(false)
	// Refs to track processes
	const isCreatingDefaults = useRef(false)
	const isSyncingLanguage = useRef(false)
	const isSyncingTheme = useRef(false)
	const hasSetInitialPreferences = useRef(false)

	// Reset initialization state when authentication changes
	useEffect(() => {
		// When user logs out (isAuthenticated changes to false), reset initialization state
		if (!isAuthenticated) {
			console.log('User logged out, resetting DataInitializer state')
			setInitialized(false)
			hasSetInitialPreferences.current = false
			isCreatingDefaults.current = false
		}
	}, [isAuthenticated])

	// Set initial preferences (language/theme) from system on first load
	useEffect(() => {
		if (isAuthenticated && !hasSetInitialPreferences.current) {
			hasSetInitialPreferences.current = true

			const systemLanguage = navigator.language.startsWith('es')
				? 'es'
				: 'en'
			const systemTheme = window.matchMedia(
				'(prefers-color-scheme: dark)',
			).matches
				? 'dark'
				: 'light'

			// Set initial i18n language if not already set
			if (i18n.language !== systemLanguage && !preferredLanguage) {
				console.log(
					'Setting initial language from system:',
					systemLanguage,
				)
				i18n.changeLanguage(systemLanguage)
			}

			// Set initial theme if not already set
			if (theme === 'system' && !userTheme) {
				console.log('Setting initial theme from system:', systemTheme)
				setTheme(systemTheme)
			}

			// Save preferences to backend for new user
			if (user && (!user.preferredLanguage || !user.theme)) {
				console.log('Saving initial preferences to backend')
				const updates: Record<string, string> = {}

				if (!user.preferredLanguage) {
					updates.preferredLanguage = systemLanguage
				}

				if (!user.theme) {
					updates.theme = systemTheme
				}

				if (Object.keys(updates).length > 0) {
					updateUser(updates)
				}
			}
		}
	}, [
		isAuthenticated,
		user,
		i18n,
		theme,
		preferredLanguage,
		userTheme,
		setTheme,
		updateUser,
	])

	// Synchronize language from user preferences
	useEffect(() => {
		if (
			preferredLanguage &&
			i18n.language !== preferredLanguage &&
			!isSyncingLanguage.current
		) {
			console.log(
				'Setting language from user preference:',
				preferredLanguage,
			)
			i18n.changeLanguage(preferredLanguage)
		}
	}, [preferredLanguage, i18n])

	// Sync language changes to backend
	useEffect(() => {
		if (
			isAuthenticated &&
			user?.preferredLanguage !== i18n.language &&
			!isSyncingLanguage.current
		) {
			isSyncingLanguage.current = true
			console.log('Syncing language to backend:', i18n.language)
			updateUser({
				preferredLanguage: i18n.language as 'es' | 'en' | 'tr',
			}).finally(() => {
				isSyncingLanguage.current = false
			})
		}
	}, [i18n.language, user, updateUser, isAuthenticated])

	// Synchronize theme from user preferences
	useEffect(() => {
		if (
			isAuthenticated &&
			userTheme &&
			(userTheme === 'light' || userTheme === 'dark') &&
			theme !== userTheme &&
			theme !== 'system'
		) {
			console.log('Setting theme from user preference:', userTheme)
			setTheme(userTheme)
		}
	}, [isAuthenticated, userTheme, theme, setTheme])

	// Sync theme changes to backend
	useEffect(() => {
		if (
			isAuthenticated &&
			user &&
			theme !== 'system' &&
			theme !== user.theme &&
			!isSyncingTheme.current
		) {
			isSyncingTheme.current = true
			console.log('Syncing theme to backend:', theme)
			updateUser({ theme }).finally(() => {
				isSyncingTheme.current = false
			})
		}
	}, [theme, user, updateUser, isAuthenticated])

	// Load initial data when user is authenticated
	useEffect(() => {
		const loadInitialData = async () => {
			if (
				isAuthenticated &&
				!initialized &&
				!isCreatingDefaults.current
			) {
				try {
					console.log('Loading initial data for user')
					isCreatingDefaults.current = true
					setIsLoading(true)

					// Fetch projects and timer presets
					const [projectsData, presetsData] = await Promise.all([
						fetchProjects(),
						fetchTimerPresets(),
					])

					console.log('Initial data loaded:', {
						projects: projectsData.length,
						presets: presetsData.length,
					})

					// Always create presets if none exist
					if (presetsData.length === 0) {
						await createDefaultPresets()
					} else {
						selectDefaultPreset(presetsData)
					}

					// Handle project selection or creation
					if (projectsData.length === 0) {
						await createDefaultProject()
					} else {
						handleExistingProjects(projectsData)
					}

					// Restore project color if exists
					const projectColor = localStorage.getItem('project-color')
					if (projectColor) {
						setProjectColor(projectColor)
					}

					setInitialized(true)
				} catch (error) {
					console.error('Error loading initial data:', error)
				} finally {
					isCreatingDefaults.current = false
					setIsLoading(false)
				}
			}
		}

		const createDefaultPresets = async () => {
			try {
				console.log('Creating default timer presets...')

				// Create Pomodoro preset
				const pomodoroPreset = await createTimerPreset({
					name: '🍅 Pomodoro',
					workDuration: 25,
					breakDuration: 5,
					repetitions: 4,
				})

				// Create 52/17 preset
				await createTimerPreset({
					name: '💻 52/17',
					workDuration: 52,
					breakDuration: 17,
					repetitions: 4,
				})

				// Select Pomodoro as default
				if (pomodoroPreset) {
					selectTimerPreset(pomodoroPreset)
					setWorkDuration(pomodoroPreset.workDuration)
					setBreakDuration(pomodoroPreset.breakDuration)
					setRepetitions(pomodoroPreset.repetitions)
				}

				console.log('Default timer presets created successfully')
			} catch (error) {
				console.error('Error creating default timer presets:', error)
			}
		}

		const selectDefaultPreset = (presets: TimerPreset[]) => {
			// Primero buscar el preset Default Settings
			const defaultSettingsPreset = presets.find(
				(preset) => preset.name === 'Default Settings',
			)

			if (defaultSettingsPreset) {
				console.log('Found Default Settings preset, selecting it')
				selectTimerPreset(defaultSettingsPreset)
				setWorkDuration(defaultSettingsPreset.workDuration)
				setBreakDuration(defaultSettingsPreset.breakDuration)
				setRepetitions(defaultSettingsPreset.repetitions)
				return
			}

			// Si no hay Default Settings, buscar otros presets preferidos
			const preferredPresets = [
				{ name: '52/17', keyword: '52/17' },
				{ name: 'Pomodoro', keyword: 'Pomodoro' },
			]

			let selectedPreset = null

			for (const preference of preferredPresets) {
				selectedPreset = presets.find((preset) =>
					preset.name.includes(preference.keyword),
				)
				if (selectedPreset) break
			}

			// Si no hay preset preferido, usar el primero
			if (!selectedPreset && presets.length > 0) {
				selectedPreset = presets[0]
			}

			if (selectedPreset) {
				console.log(`Selected preset: ${selectedPreset.name}`)
				selectTimerPreset(selectedPreset)
				setWorkDuration(selectedPreset.workDuration)
				setBreakDuration(selectedPreset.breakDuration)
				setRepetitions(selectedPreset.repetitions)
			}
		}

		const createDefaultProject = async () => {
			try {
				console.log('Creating default Focus project...')
				const newProject = await createProject({
					name: 'Focus',
					description: 'Default project for focused work sessions',
					color: '#33d17a',
					status: 'active',
				})

				if (newProject) {
					console.log(
						'Focus project created successfully:',
						newProject.id,
					)
					setProjectId(newProject.id)
				}
			} catch (error) {
				console.error('Error creating Focus project:', error)
			}
		}

		const handleExistingProjects = (
			projects: { id: string; name: string }[],
		) => {
			// Check if we already have a project selected
			if (currentProjectId) {
				const projectExists = projects.some(
					(project) => project.id === currentProjectId,
				)

				if (projectExists) {
					console.log(
						'Keeping current project selection:',
						currentProjectId,
					)
					return
				}
			}

			// Select first project as default
			console.log('Selecting first project as default:', projects[0].name)
			setProjectId(projects[0].id)
		}

		loadInitialData()
	}, [
		isAuthenticated,
		initialized,
		fetchProjects,
		createProject,
		fetchTimerPresets,
		createTimerPreset,
		selectTimerPreset,
		setWorkDuration,
		setBreakDuration,
		setRepetitions,
		setProjectId,
		currentProjectId,
	])

	// Cargar ajustes por defecto
	useEffect(() => {
		const loadDefaultSettings = async () => {
			if (!isAuthenticated || initialized) return

			try {
				const presets = await fetchTimerPresets()
				const defaultPreset = presets.find(
					(preset) => preset.name === 'Default Settings',
				)

				if (defaultPreset) {
					setWorkDuration(defaultPreset.workDuration)
					setBreakDuration(defaultPreset.breakDuration)
					setRepetitions(defaultPreset.repetitions)
				}
			} catch (error) {
				console.error('Error loading default settings:', error)
			}
		}

		loadDefaultSettings()
	}, [
		isAuthenticated,
		initialized,
		fetchTimerPresets,
		setWorkDuration,
		setBreakDuration,
		setRepetitions,
	])

	// Provide initialization state to the context and render the SocketHandler
	return (
		<DataInitializerContext.Provider
			value={{ isInitialized: initialized, isLoading }}
		>
			{/* Socket handler manages WebSocket connections */}
			{isAuthenticated && <SocketHandler />}
		</DataInitializerContext.Provider>
	)
}

export default DataInitializer
