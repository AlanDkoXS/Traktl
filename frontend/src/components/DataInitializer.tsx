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
	const { isAuthenticated, user, defaultTimerPreset } = useAuthStore()
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

					// First check the authStore for defaultTimerPreset (which is persisted across sessions)
					if (defaultTimerPreset && presetsData.length > 0) {
						console.log(
							'Using persisted default timer preset:',
							defaultTimerPreset,
						)
						const defaultPreset = presetsData.find(
							(preset) => preset.id === defaultTimerPreset,
						)

						if (defaultPreset) {
							console.log(
								'Setting default timer preset from authStore:',
								defaultPreset.name,
							)
							selectTimerPreset(defaultPreset)
							// Apply preset settings to timer
							setWorkDuration(defaultPreset.workDuration)
							setBreakDuration(defaultPreset.breakDuration)
							setRepetitions(defaultPreset.repetitions)
							return // Exit early as we've found and set the preset
						}
					}

					// If no defaultTimerPreset in authStore, check the user object
					if (user?.defaultTimerPreset && presetsData.length > 0) {
						const defaultPreset = presetsData.find(
							(preset) => preset.id === user.defaultTimerPreset,
						)

						if (defaultPreset) {
							console.log(
								'Setting default timer preset from user profile:',
								defaultPreset.name,
							)
							selectTimerPreset(defaultPreset)
							// Apply preset settings to timer
							setWorkDuration(defaultPreset.workDuration)
							setBreakDuration(defaultPreset.breakDuration)
							setRepetitions(defaultPreset.repetitions)
							return // Exit early as we've found and set the preset
						}
					}

					// Fallback: If no default preset is set but we have presets,
					// try to use a specific preset like 52/17 or Pomodoro
					if (presetsData.length > 0) {
						// Try to find presets in order of preference
						const preferredPresets = [
							{ name: '52/17', keyword: '52/17' }, // First choice
							{ name: 'Pomodoro', keyword: 'Pomodoro' }, // Second choice
							{ name: 'Any preset', keyword: '' }, // Last resort - use first available
						]

						let selectedPreset = null

						for (const preference of preferredPresets) {
							if (preference.keyword) {
								selectedPreset = presetsData.find((preset) =>
									preset.name.includes(preference.keyword),
								)
							} else {
								selectedPreset = presetsData[0] // Just use the first one
							}

							if (selectedPreset) break
						}

						if (selectedPreset) {
							console.log(
								`Automatically selecting ${selectedPreset.name} preset`,
							)
							selectTimerPreset(selectedPreset)
							setWorkDuration(selectedPreset.workDuration)
							setBreakDuration(selectedPreset.breakDuration)
							setRepetitions(selectedPreset.repetitions)
						}
					}

					// Set default project if available
					if (projectsData.length > 0) {
						const focusProject = projectsData.find(
							(project) => project.name === 'Focus',
						)

						if (focusProject) {
							console.log('Setting default project to Focus')
							setProjectId(focusProject.id)
						} else {
							// If no "Focus" project, use the first project
							console.log(
								'Setting default project to first available project:',
								projectsData[0].name,
							)
							setProjectId(projectsData[0].id)
						}
					}
				} catch (error) {
					console.error('Error loading initial data:', error)
				}
			}
		}

		loadInitialData()
	}, [
		isAuthenticated,
		user,
		defaultTimerPreset,
		fetchProjects,
		fetchTimerPresets,
		selectTimerPreset,
		setWorkDuration,
		setBreakDuration,
		setRepetitions,
		setProjectId,
	])

	// This component doesn't render anything
	return null
}

export default DataInitializer
