import { useEffect } from 'react'
import { useTimerPresetStore } from '../store/timerPresetStore'
import { useProjectStore } from '../store/projectStore'
import { useTimerStore } from '../store/timerStore'
import { useAuthStore } from '../store/authStore'

/**
 * Component responsible for initializing application data
 * after user authentication. Loads projects, timer presets,
 * and sets up default selections for new users.
 */
const DataInitializer = () => {
	const { isAuthenticated, user } = useAuthStore()
	const { fetchProjects } = useProjectStore()
	const { fetchTimerPresets, selectTimerPreset } = useTimerPresetStore()
	const { setWorkDuration, setBreakDuration, setRepetitions, setProjectId } =
		useTimerStore()

	// Load initial data when user is authenticated
	useEffect(() => {
		const loadInitialData = async () => {
			if (isAuthenticated) {
				try {
					// Fetch projects and timer presets
					const [projectsData, presetsData] = await Promise.all([
						fetchProjects(),
						fetchTimerPresets(),
					])

					console.log('Initial data loaded:', {
						projects: projectsData.length,
						presets: presetsData.length,
					})

					// Set default timer preset if user has one configured
					if (user?.defaultTimerPreset && presetsData.length > 0) {
						const defaultPreset = presetsData.find(
							(preset) => preset.id === user.defaultTimerPreset,
						)

						if (defaultPreset) {
							console.log(
								'Setting default timer preset:',
								defaultPreset.name,
							)
							selectTimerPreset(defaultPreset)

							// Apply preset settings to timer
							setWorkDuration(defaultPreset.workDuration)
							setBreakDuration(defaultPreset.breakDuration)
							setRepetitions(defaultPreset.repetitions)
						}
					} else if (presetsData.length > 0) {
						// If no default preset is set but we have presets, use the first one (likely Pomodoro)
						const pomodoroPreset = presetsData.find((preset) =>
							preset.name.includes('Pomodoro'),
						)
						if (pomodoroPreset) {
							console.log('Using Pomodoro preset by default')
							selectTimerPreset(pomodoroPreset)

							setWorkDuration(pomodoroPreset.workDuration)
							setBreakDuration(pomodoroPreset.breakDuration)
							setRepetitions(pomodoroPreset.repetitions)
						}
					}

					// Set default project to Focus if it exists (created automatically for new users)
					if (projectsData.length > 0) {
						const focusProject = projectsData.find(
							(project) => project.name === 'Focus',
						)

						if (focusProject) {
							console.log('Setting default project to Focus')
							setProjectId(focusProject.id)
						}
					}
				} catch (error) {
					console.error('Error loading initial data:', error)
				}
			}
		}

		loadInitialData()
	}, [isAuthenticated, user])

	// This component doesn't render anything
	return null
}

export default DataInitializer
