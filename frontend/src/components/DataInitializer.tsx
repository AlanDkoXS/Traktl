import { useEffect, useState } from 'react';
import { useTimerPresetStore } from '../store/timerPresetStore';
import { useProjectStore } from '../store/projectStore';
import { useTimerStore } from '../store/timerStore';
import { useAuthStore } from '../store/authStore';
import { Project, TimerPreset } from '../types';

/**
 * Component responsible for initializing application data
 * after user authentication. Loads projects, timer presets,
 * and sets up default selections for new users.
 */
const DataInitializer = () => {
	const { isAuthenticated, user, defaultTimerPreset } = useAuthStore();
	const { 
		fetchProjects, 
		createProject 
	} = useProjectStore();
	
	const { 
		fetchTimerPresets, 
		selectTimerPreset, 
		createTimerPreset
	} = useTimerPresetStore();
	
	const { 
		setWorkDuration, 
		setBreakDuration, 
		setRepetitions, 
		setProjectId 
	} = useTimerStore();

	// Flag to track first-time initialization
	const [initialized, setInitialized] = useState(false);

	// Load initial data when user is authenticated
	useEffect(() => {
		const loadInitialData = async () => {
			if (isAuthenticated && !initialized) {
				try {
					console.log('Loading initial data for user');
					
					// Fetch projects and timer presets
					const [projectsData, presetsData] = await Promise.all([
						fetchProjects(),
						fetchTimerPresets(),
					]);

					console.log('Initial data loaded:', {
						projects: projectsData.length,
						presets: presetsData.length,
					});

					// Check if this is a new user (no projects and no presets)
					const isNewUser = projectsData.length === 0 && presetsData.length === 0;
					
					if (isNewUser) {
						console.log('Detected new user - creating default settings');
						await createDefaultSettings();
					} else {
						// Handle existing user data
						await handleTimerPresets(presetsData);
						await handleProjects(projectsData);
					}
					
					setInitialized(true);
				} catch (error) {
					console.error('Error loading initial data:', error);
				}
			}
		};

		// Create default settings for new user
		const createDefaultSettings = async () => {
			try {
				console.log('Creating default settings for new user');
				
				// Create default timer presets
				const pomodoroPreset = await createTimerPreset({
					name: '🍅 Pomodoro',
					workDuration: 25,
					breakDuration: 5,
					repetitions: 4
				});
				
				const workBreakPreset = await createTimerPreset({
					name: '💻 52/17',
					workDuration: 52,
					breakDuration: 17,
					repetitions: 4
				});
				
				console.log('Created default timer presets:', {
					pomodoro: pomodoroPreset?.id,
					workBreak: workBreakPreset?.id
				});
				
				// Create default Focus project
				const focusProject = await createProject({
					name: 'Focus',
					description: 'Default project for focused work sessions',
					color: '#33d17a',
					status: 'active' // Added required status field
				});
				
				console.log('Created default Focus project:', focusProject?.id);
				
				// Apply default settings
				if (pomodoroPreset) {
					selectTimerPreset(pomodoroPreset);
					setWorkDuration(pomodoroPreset.workDuration);
					setBreakDuration(pomodoroPreset.breakDuration);
					setRepetitions(pomodoroPreset.repetitions);
				}
				
				if (focusProject) {
					setProjectId(focusProject.id);
				}
			} catch (error) {
				console.error('Error creating default settings:', error);
			}
		};

		const handleTimerPresets = async (presetsData: TimerPreset[]) => {
			// First check the authStore for defaultTimerPreset (which is persisted across sessions)
			if (defaultTimerPreset && presetsData.length > 0) {
				console.log(
					'Using persisted default timer preset:',
					defaultTimerPreset,
				);
				const defaultPreset = presetsData.find(
					(preset: TimerPreset) => preset.id === defaultTimerPreset,
				);

				if (defaultPreset) {
					console.log(
						'Setting default timer preset from authStore:',
						defaultPreset.name,
					);
					selectTimerPreset(defaultPreset);
					// Apply preset settings to timer
					setWorkDuration(defaultPreset.workDuration);
					setBreakDuration(defaultPreset.breakDuration);
					setRepetitions(defaultPreset.repetitions);
					return; // Exit early as we've found and set the preset
				}
			}

			// If no defaultTimerPreset in authStore, check the user object
			if (user?.defaultTimerPreset && presetsData.length > 0) {
				const defaultPreset = presetsData.find(
					(preset: TimerPreset) => preset.id === user.defaultTimerPreset,
				);

				if (defaultPreset) {
					console.log(
						'Setting default timer preset from user profile:',
						defaultPreset.name,
					);
					selectTimerPreset(defaultPreset);
					// Apply preset settings to timer
					setWorkDuration(defaultPreset.workDuration);
					setBreakDuration(defaultPreset.breakDuration);
					setRepetitions(defaultPreset.repetitions);
					return; // Exit early as we've found and set the preset
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
				];

				let selectedPreset = null;

				for (const preference of preferredPresets) {
					if (preference.keyword) {
						selectedPreset = presetsData.find((preset: TimerPreset) =>
							preset.name.includes(preference.keyword),
						);
					} else {
						selectedPreset = presetsData[0]; // Just use the first one
					}

					if (selectedPreset) break;
				}

				if (selectedPreset) {
					console.log(
						`Automatically selecting ${selectedPreset.name} preset`,
					);
					selectTimerPreset(selectedPreset);
					setWorkDuration(selectedPreset.workDuration);
					setBreakDuration(selectedPreset.breakDuration);
					setRepetitions(selectedPreset.repetitions);
				}
			} else if (presetsData.length === 0) {
				// No presets found, create default ones
				try {
					console.log('No timer presets found. Creating defaults...');
					const pomodoroPreset = await createTimerPreset({
						name: '🍅 Pomodoro',
						workDuration: 25,
						breakDuration: 5,
						repetitions: 4
					});
					
					if (pomodoroPreset) {
						selectTimerPreset(pomodoroPreset);
						setWorkDuration(pomodoroPreset.workDuration);
						setBreakDuration(pomodoroPreset.breakDuration);
						setRepetitions(pomodoroPreset.repetitions);
					}
					
					// Also create the 52/17 preset
					await createTimerPreset({
						name: '💻 52/17',
						workDuration: 52,
						breakDuration: 17,
						repetitions: 4
					});
					
					console.log('Default timer presets created successfully');
				} catch (createError) {
					console.error('Error creating default timer presets:', createError);
				}
			}
		};

		const handleProjects = async (projectsData: Project[]) => {
			// Check if we have any projects
			if (projectsData.length > 0) {
				// Look for the Focus project
				const focusProject = projectsData.find(
					(project: Project) => project.name === 'Focus',
				);

				if (focusProject) {
					console.log('Setting default project to Focus');
					setProjectId(focusProject.id);
				} else {
					// If 'Focus' project doesn't exist, try to create it
					try {
						console.log('Creating default Focus project...');
						const newFocusProject = await createProject({
							name: 'Focus',
							description: 'Default project for focused work sessions',
							color: '#33d17a',
							status: 'active' // Added required status field
						});
						
						console.log('Focus project created successfully:', newFocusProject);
						setProjectId(newFocusProject.id);
					} catch (createError) {
						console.error('Error creating Focus project:', createError);
						// Fallback to the first available project
						console.log(
							'Setting default project to first available project:',
							projectsData[0].name,
						);
						setProjectId(projectsData[0].id);
					}
				}
			} else {
				// No projects exist, create the Focus project
				try {
					console.log('No projects found. Creating default Focus project...');
					const newFocusProject = await createProject({
						name: 'Focus',
						description: 'Default project for focused work sessions',
						color: '#33d17a',
						status: 'active' // Added required status field
					});
					
					console.log('Focus project created successfully:', newFocusProject);
					setProjectId(newFocusProject.id);
				} catch (createError) {
					console.error('Error creating Focus project when no projects exist:', createError);
				}
			}
		};

		loadInitialData();
	}, [
		isAuthenticated,
		initialized,
		user,
		defaultTimerPreset,
		fetchProjects,
		createProject,
		fetchTimerPresets,
		createTimerPreset,
		selectTimerPreset,
		setWorkDuration,
		setBreakDuration,
		setRepetitions,
		setProjectId,
	]);

	// This component doesn't render anything
	return null;
};

export default DataInitializer;
