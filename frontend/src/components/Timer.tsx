import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTimer } from '../hooks/useTimer'
import { useProjectStore } from '../store/projectStore'
import { TimeEntryList } from './TimeEntryList'
import { TimerDisplay } from './timer/TimerDisplay'
import { TimerControls } from './timer/TimerControls'
import { TimerSettings } from './timer/TimerSettings'
import { ProjectTaskSelector } from './timer/ProjectTaskSelector'
import { PresetSelector } from './timer/PresetSelector'
import { ActivityHeatmap } from './timer/ActivityHeatmap'
import { TimerAlertModal } from './timer/TimerAlertModal'
import { useTimeEntryStore } from '../store/timeEntryStore'
import { ConfirmModal } from './ui/ConfirmModal'
import { useTimerStore } from '../store/timerStore'
import { setProjectColor } from '../utils/dynamicColors'

type TimerStatus = 'idle' | 'running' | 'paused' | 'break'
type TimerMode = 'work' | 'break'

export const Timer = () => {
	const { t } = useTranslation()
	const {
		status,
		mode,
		formattedTime,
		progress,
		workDuration,
		breakDuration,
		repetitions,
		currentRepetition,
		projectId,
		taskId,
		infiniteMode,

		start,
		pause,
		resume,
		stop,
		skipToNext,

		setWorkDuration,
		setBreakDuration,
		setRepetitions,
		setProjectId,
		setTaskId,
		setNotes: setTimerNotes,
		setTags,
	} = useTimer()

	const { showCompletionModal, closeCompletionModal, setSelectedPresetId } =
		useTimerStore()
	const { projects } = useProjectStore()
	const { fetchTimeEntries } = useTimeEntryStore()

	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const [localNotes, setLocalNotes] = useState('')

	useEffect(() => {
		setTags(selectedTags)
	}, [selectedTags, setTags])

	useEffect(() => {
		setTimerNotes(localNotes)
	}, [localNotes, setTimerNotes])

	useEffect(() => {
		if (projectId) {
			const project = projects.find((p) => p.id === projectId)
			if (project?.color) {
				setProjectColor(project.color)
			}
		}
	}, [projectId, projects])

	useEffect(() => {
		const handleTimeEntryCreated = () => {
			fetchTimeEntries()
		}

		window.addEventListener('time-entry-created', handleTimeEntryCreated)
		return () => {
			window.removeEventListener(
				'time-entry-created',
				handleTimeEntryCreated,
			)
		}
	}, [fetchTimeEntries])

	useEffect(() => {
		if (progress >= 100 && status === 'running') {
			// Notifications handle now in the store
		}
	}, [mode, progress, status])

	const handlePresetSelect = (preset: {
		workDuration: number
		breakDuration: number
		repetitions: number
		id: string
	}) => {
		setWorkDuration(preset.workDuration)
		setBreakDuration(preset.breakDuration)
		setRepetitions(preset.repetitions)
		setSelectedPresetId(preset.id)
	}

	const timerMode = mode as TimerMode
	const timerStatus = status as TimerStatus

	return (
		<div className="flex flex-col space-y-6 dashboard-timer">
			<div className="bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
				{/* Timer Alert Modal */}
				<TimerAlertModal />

				<div className="text-center mb-4">
					<h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white dynamic-color">
						{mode === 'work'
							? t('timer.workTime')
							: t('timer.breakTime')}
					</h2>
					<div className="text-sm text-gray-500 dark:text-gray-400">
						{infiniteMode ? (
							<span className="flex items-center justify-center">
								{t('timer.infiniteMode')}
							</span>
						) : (
							<>
								{t('timer.session')} {currentRepetition}/
								{repetitions}
							</>
						)}
					</div>
				</div>

				{/* Timer Display */}
				<TimerDisplay
					formattedTime={formattedTime}
					progress={progress}
					mode={timerMode}
					isInfiniteMode={infiniteMode}
				/>

				{/* Timer Controls */}
				<TimerControls
					status={timerStatus}
					mode={timerMode}
					elapsed={0}
					start={start}
					pause={pause}
					resume={resume}
					stop={stop}
					skipToNext={skipToNext}
					projectId={projectId}
					infiniteMode={infiniteMode}
				/>

				{/* Project and Task Selection */}
				<ProjectTaskSelector
					projectId={projectId}
					taskId={taskId}
					notes={localNotes}
					selectedTags={selectedTags}
					setProjectId={setProjectId}
					setTaskId={setTaskId}
					setNotes={setLocalNotes}
					setSelectedTags={setSelectedTags}
					isDisabled={
						status === 'running' ||
						status === 'paused' ||
						status === 'break'
					}
				/>

				{/* Timer Settings */}
				<TimerSettings
					workDuration={workDuration}
					breakDuration={breakDuration}
					repetitions={repetitions}
					status={timerStatus}
					setWorkDuration={setWorkDuration}
					setBreakDuration={setBreakDuration}
					setRepetitions={setRepetitions}
				/>

				{/* Preset Selector */}
				<PresetSelector onSelectPreset={handlePresetSelect} />
			</div>

			{/* Activity Heatmap */}
			<ActivityHeatmap />

			{/* Time Entry List */}
			<TimeEntryList limit={5} />

			{/* Completion Modal */}
			<ConfirmModal
				isOpen={showCompletionModal}
				title={t('timer.saveSessionTitle')}
				message={t('timer.saveSessionMessage')}
				confirmButtonText={t('timer.save')}
				cancelButtonText={t('timer.dontSave')}
				onConfirm={() => {
					stop(true)
					closeCompletionModal()
				}}
				onCancel={() => {
					stop(false)
					closeCompletionModal()
				}}
				isLoading={false}
				danger={false}
				showCancelButton={false}
			/>
		</div>
	)
}
