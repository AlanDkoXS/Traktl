import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmModal } from '../ui/ConfirmModal'
import { useProjectStore } from '../../store/projectStore'
import { useDataInitializer } from '../DataInitializer'
import { InfiniteMode } from './InfiniteMode'

interface TimerControlsProps {
	status: 'idle' | 'running' | 'paused' | 'break'
	elapsed: number
	start: () => void
	pause: () => void
	resume: () => void
	stop: (shouldSave?: boolean) => void
	skipToNext: () => void
	projectId: string | null
	infiniteMode: boolean
	mode: 'work' | 'break'
}

export const TimerControls = ({
	status,
	elapsed,
	start,
	pause,
	resume,
	stop,
	skipToNext,
	projectId,
	infiniteMode,
	mode,
}: TimerControlsProps) => {
	const { t } = useTranslation()
	const { isLoading: projectsLoading } = useProjectStore()
	const { isInitialized, isLoading: dataLoading } = useDataInitializer()
	const [showShortSessionModal, setShowShortSessionModal] = useState(false)
	const [showStopConfirmationModal, setShowStopConfirmationModal] =
		useState(false)
	const [showProjectRequiredModal, setShowProjectRequiredModal] =
		useState(false)
	const [modalAction, setModalAction] = useState<'next' | 'stop'>('next')

	// Check if project is selected when component mounts or when projectId changes
	useEffect(() => {
		// Only show project required modal when:
		// 1. In idle status
		// 2. No project is selected
		// 3. Projects have finished loading
		// 4. Data initialization is complete
		if (
			status === 'idle' &&
			!projectId &&
			!projectsLoading &&
			!dataLoading &&
			isInitialized
		) {
			setShowProjectRequiredModal(true)
		}
	}, [status, projectId, projectsLoading, dataLoading, isInitialized])

	const handleStart = () => {
		if (!projectId) {
			setShowProjectRequiredModal(true)
			return
		}
		start()
	}

	const handleResume = () => {
		if (!projectId) {
			setShowProjectRequiredModal(true)
			return
		}
		resume()
	}

	const handleSkipToNext = async () => {
		// En modo infinito, no necesitamos verificar la duración mínima
		if (
			!infiniteMode &&
			elapsed < 60 &&
			mode === 'work' &&
			(status === 'running' || status === 'paused')
		) {
			setModalAction('next')
			setShowShortSessionModal(true)
			return
		}

		await skipToNext()
	}

	const handleStop = () => {
		// En modo infinito o break, no mostrar confirmación
		if (mode === 'break' || infiniteMode) {
			stop(false)
			return
		}
		setShowStopConfirmationModal(true)
	}

	const handleConfirmSave = () => {
		// Save and stop the timer
		console.log('handleConfirmSave: Guardando timer (shouldSave=true)')
		stop(true) // Explícitamente pasando true
		setShowStopConfirmationModal(false)
	}

	const handleDontSave = () => {
		console.log(
			'handleDontSave: Deteniendo timer sin guardar (shouldSave=false)',
		)

		// Enfoque simple: usar directamente stop(false)
		console.log('Usando stop(false) explícitamente')
		stop(false)
		setShowStopConfirmationModal(false)
	}

	const handleCancelStopModal = () => {
		// Solo cierra el modal sin detener el timer
		console.log(
			'handleCancelStopModal: Solo cerrar modal sin detener timer',
		)
		setShowStopConfirmationModal(false)
	}

	const handleConfirmShortSession = async () => {
		if (modalAction === 'next') {
			await skipToNext()
		} else {
			stop(true) // Explícitamente pasar true para guardar
		}
		setShowShortSessionModal(false)
	}

	const handleDontSaveShortSession = async () => {
		if (modalAction === 'next') {
			// Don't save but still advance to next phase
			await skipToNext()
		} else {
			// Don't save and stop timer
			stop(false) // Explícitamente pasar false para no guardar
		}
		setShowShortSessionModal(false)
	}

	const handleCancelShortSession = () => {
		// Just close the modal without any action
		setShowShortSessionModal(false)
	}

	const handleProjectRequiredConfirm = () => {
		setShowProjectRequiredModal(false)
	}

	return (
		<>
			<div className="flex justify-center space-x-6 mt-8 mb-6">
				{status === 'idle' && (
					<button
						onClick={handleStart}
						className="w-14 h-14 flex items-center justify-center rounded-full dynamic-bg-subtle hover:opacity-90 transition-opacity shadow-sm"
						title={t('timer.start')}
					>
						{/* Simple Play Icon */}
						<svg
							className="w-7 h-7 dynamic-color"
							fill="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M8 5v14l11-7z" />
						</svg>
					</button>
				)}

				{status === 'running' && (
					<>
						<button
							onClick={() => pause()}
							className="w-14 h-14 flex items-center justify-center rounded-full dynamic-bg-subtle hover:opacity-90 transition-opacity shadow-sm"
							title={t('timer.pause')}
						>
							{/* Simple Pause Icon */}
							<svg
								className="w-7 h-7 dynamic-color"
								fill="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
							</svg>
						</button>

						{/* Show skip button or infinite mode */}
						{!infiniteMode ? (
							<button
								onClick={handleSkipToNext}
								className="w-14 h-14 flex items-center justify-center rounded-full dynamic-bg-subtle hover:opacity-90 transition-opacity shadow-sm"
								title={t('timer.skipToNext')}
							>
								{/* Simple Skip Icon */}
								<svg
									className="w-7 h-7 dynamic-color"
									fill="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
								</svg>
							</button>
						) : (
							<InfiniteMode />
						)}

						<button
							onClick={handleStop}
							className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 hover:opacity-90 transition-opacity shadow-sm"
							title={t('timer.stop')}
						>
							{/* Simple Stop Icon */}
							<svg
								className="w-7 h-7 text-red-600 dark:text-red-400"
								fill="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M6 6h12v12H6z" />
							</svg>
						</button>
					</>
				)}

				{status === 'paused' && (
					<>
						<button
							onClick={handleResume}
							className="w-14 h-14 flex items-center justify-center rounded-full dynamic-bg-subtle hover:opacity-90 transition-opacity shadow-sm"
							title={t('timer.resume')}
						>
							{/* Simple Play Icon */}
							<svg
								className="w-7 h-7 dynamic-color"
								fill="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M8 5v14l11-7z" />
							</svg>
						</button>

						{/* Show skip button or infinite mode */}
						{!infiniteMode ? (
							<button
								onClick={handleSkipToNext}
								className="w-14 h-14 flex items-center justify-center rounded-full dynamic-bg-subtle hover:opacity-90 transition-opacity shadow-sm"
								title={t('timer.skipToNext')}
							>
								{/* Simple Skip Icon */}
								<svg
									className="w-7 h-7 dynamic-color"
									fill="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
								</svg>
							</button>
						) : (
							<InfiniteMode />
						)}

						<button
							onClick={handleStop}
							className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 hover:opacity-90 transition-opacity shadow-sm"
							title={t('timer.stop')}
						>
							{/* Simple Stop Icon */}
							<svg
								className="w-7 h-7 text-red-600 dark:text-red-400"
								fill="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M6 6h12v12H6z" />
							</svg>
						</button>
					</>
				)}

				{status === 'break' && (
					<>
						<button
							onClick={() => pause()}
							className="w-14 h-14 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 hover:opacity-90 transition-opacity shadow-sm"
							title={t('timer.pause')}
						>
							{/* Simple Pause Icon */}
							<svg
								className="w-7 h-7"
								fill="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
							</svg>
						</button>

						<button
							onClick={handleSkipToNext}
							className="w-14 h-14 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 hover:opacity-90 transition-opacity shadow-sm"
							title={t('timer.skipToWork')}
						>
							{/* Skip to Work Icon */}
							<svg
								className="w-7 h-7"
								fill="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
							</svg>
						</button>

						<button
							onClick={handleStop}
							className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 hover:opacity-90 transition-opacity shadow-sm"
							title={t('timer.stop')}
						>
							{/* Simple Stop Icon */}
							<svg
								className="w-7 h-7 text-red-600 dark:text-red-400"
								fill="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M6 6h12v12H6z" />
							</svg>
						</button>
					</>
				)}
			</div>

			{/* Confirmation Modals */}
			<ConfirmModal
				isOpen={showShortSessionModal}
				title={t('timer.shortSessionTitle')}
				message={t('timer.shortSessionMessage')}
				confirmButtonText={t('common.yes')}
				cancelButtonText={t('common.no')}
				onConfirm={handleConfirmShortSession}
				onCancel={handleDontSaveShortSession}
				isLoading={false}
				danger={false}
				showCancelButton={true}
				onCancelButtonClick={handleCancelShortSession}
			/>

			<ConfirmModal
				isOpen={showStopConfirmationModal}
				title={t('timer.saveSessionTitle')}
				message={t('timer.stopSessionMessage')}
				confirmButtonText={t('common.yes')}
				cancelButtonText={t('common.no')}
				onConfirm={handleConfirmSave}
				onCancel={handleDontSave}
				isLoading={false}
				danger={false}
				showCancelButton={true}
				onCancelButtonClick={handleCancelStopModal}
			/>

			<ConfirmModal
				isOpen={showProjectRequiredModal}
				title={t('timer.projectRequired')}
				message={t('timer.projectRequiredMessage')}
				confirmButtonText={t('common.ok')}
				cancelButtonText={t('common.cancel')}
				onConfirm={handleProjectRequiredConfirm}
				onCancel={handleProjectRequiredConfirm}
				isLoading={false}
				danger={false}
				showCancelButton={false}
			/>
		</>
	)
}
