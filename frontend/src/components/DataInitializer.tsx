import { useEffect, useState, useRef } from 'react'
import { useTimerPresetStore } from '../store/timerPresetStore'
import { useProjectStore } from '../store/projectStore'
import { useTimerStore } from '../store/timerStore'
import { useAuthStore } from '../store/authStore'
import { Project, TimerPreset } from '../types'

/**
 * Component responsible for initializing application data
 * after user authentication. Loads projects, timer presets,
 * and sets up default selections for new users.
 */
const DataInitializer = () => {
	const { isAuthenticated, user } = useAuthStore()
	const { fetchProjects, createProject } = useProjectStore()

	const { fetchTimerPresets, selectTimerPreset, createTimerPreset } =
		useTimerPresetStore()

	const {
		setWorkDuration,
		setBreakDuration,
		setRepetitions,
		setProjectId,
		projectId: currentProjectId, // Get current projectId
	} = useTimerStore()

	// Flag to track first-time initialization
	const [initialized, setInitialized] = useState(false)
	// Ref to track if default creation is in progress
	const isCreatingDefaults = useRef(false)

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

					// Fetch projects and timer presets
					const [projectsData, presetsData] = await Promise.all([
						fetchProjects(),
						fetchTimerPresets(),
					])

					console.log('Initial data loaded:', {
						projects: projectsData.length,
						presets: presetsData.length,
					})

					// Handle timer presets first
					await handleTimerPresets(presetsData)

					// Then handle projects
					await handleProjects(projectsData)

					setInitialized(true)
					isCreatingDefaults.current = false
				} catch (error) {
					console.error('Error loading initial data:', error)
					isCreatingDefaults.current = false
				}
			}
		}

		const handleTimerPresets = async (presetsData: TimerPreset[]) => {
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
						selectedPreset = presetsData.find(
							(preset: TimerPreset) =>
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
			} else if (presetsData.length === 0) {
				// No presets found, create default ones (only if none exist)
				try {
					console.log('No timer presets found. Creating defaults...')

					// Create default presets only if we don't have any
					const pomodoroPreset = await createTimerPreset({
						name: '🍅 Pomodoro',
						workDuration: 25,
						breakDuration: 5,
						repetitions: 4,
					})

					if (pomodoroPreset) {
						selectTimerPreset(pomodoroPreset)
						setWorkDuration(pomodoroPreset.workDuration)
						setBreakDuration(pomodoroPreset.breakDuration)
						setRepetitions(pomodoroPreset.repetitions)
					}

					// Also create the 52/17 preset
					await createTimerPreset({
						name: '💻 52/17',
						workDuration: 52,
						breakDuration: 17,
						repetitions: 4,
					})

					console.log('Default timer presets created successfully')
				} catch (createError) {
					console.error(
						'Error creating default timer presets:',
						createError,
					)
				}
			}
		}

		const handleProjects = async (projectsData: Project[]) => {
			// Check if we already have a project selected - if so, keep that selection
			if (currentProjectId) {
				console.log(
					'User already has a project selected:',
					currentProjectId,
				)

				// Verify the selected project still exists
				const projectExists = projectsData.some(
					(project: Project) => project.id === currentProjectId,
				)

				if (projectExists) {
					console.log('Keeping current project selection')
					return // Keep the current selection
				} else {
					console.log(
						'Selected project no longer exists, will select a new default',
					)
				}
			}

			// First, check if there's already a Focus project
			const focusProject = projectsData.find(
				(project: Project) => project.name === 'Focus',
			)

			if (focusProject) {
				console.log(
					'Focus project exists, using it as default:',
					focusProject.id,
				)
				setProjectId(focusProject.id)
				return // Exit early - no need to create a project
			}

			// No Focus project and no projects at all, create one
			if (projectsData.length === 0) {
				try {
					console.log(
						'No projects found. Creating default Focus project...',
					)
					const newFocusProject = await createProject({
						name: 'Focus',
						description:
							'Default project for focused work sessions',
						color: '#33d17a',
						status: 'active',
					})

					console.log(
						'Focus project created successfully:',
						newFocusProject?.id,
					)

					if (newFocusProject) {
						setProjectId(newFocusProject.id)
					}
				} catch (createError) {
					console.error('Error creating Focus project:', createError)
				}
			} else if (projectsData.length > 0) {
				// No Focus project but we have other projects, use the first one
				console.log(
					'Using first available project as default:',
					projectsData[0].name,
				)
				setProjectId(projectsData[0].id)
			}
		}

		loadInitialData()
	}, [
		isAuthenticated,
		initialized,
		user,
		currentProjectId,
		fetchProjects,
		createProject,
		fetchTimerPresets,
		createTimerPreset,
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
