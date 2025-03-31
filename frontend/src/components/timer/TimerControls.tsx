import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmModal } from '../ui/ConfirmModal'
import { useTimerStore } from '../../store/timerStore'

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
	const [showShortSessionModal, setShowShortSessionModal] = useState(false)
	const [showStopConfirmationModal, setShowStopConfirmationModal] =
		useState(false)
	const [showProjectRequiredModal, setShowProjectRequiredModal] =
		useState(false)
	const [modalAction, setModalAction] = useState<'next' | 'stop'>('next')

	// Check if project is selected when component mounts or when projectId changes
	useEffect(() => {
		if (status === 'idle' && !projectId) {
			setShowProjectRequiredModal(true)
		}
	}, [status, projectId])

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

	const handleSkipToNext = () => {
		if (
			elapsed < 60 &&
			!infiniteMode &&
			mode === 'work' &&
			(status === 'running' || status === 'paused')
		) {
			setModalAction('next')
			setShowShortSessionModal(true)
			return
		}

		skipToNext()
	}

	const handleStop = () => {
		if (elapsed > 0) {
			setShowStopConfirmationModal(true)
		} else {
			stop()
		}
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

	const handleConfirmShortSession = () => {
		if (modalAction === 'next') {
			skipToNext()
		} else {
			stop()
		}
		setShowShortSessionModal(false)
	}

	const handleDontSaveShortSession = () => {
		if (modalAction === 'next') {
			// Don't save but still advance to next phase
			skipToNext()
		} else {
			// Don't save and stop timer
			stop()
		}
		setShowShortSessionModal(false)
	}

	const handleCancelShortSession = () => {
		// Just close the modal without any action
		setShowShortSessionModal(false)
	}

	const handleCloseProjectRequiredModal = () => {
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

						{/* Only show skip button if not in infinite mode */}
						{!infiniteMode && (
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
						)}

						{/* Show infinite icon instead of skip when in infinite mode */}
						{infiniteMode && (
							<div
								className="w-14 h-14 flex items-center justify-center rounded-full dynamic-bg-subtle shadow-sm"
								title={t('timer.infiniteMode')}
							>
								{/* Simple Infinity Icon */}
								<svg
									className="w-7 h-7 dynamic-color"
									fill="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L7.8 14.39c-.64.64-1.49.99-2.4.99-1.87 0-3.39-1.51-3.39-3.38S3.53 8.62 5.4 8.62c.91 0 1.76.35 2.44 1.03l1.13 1 1.51-1.34L9.22 8.2C8.2 7.18 6.84 6.62 5.4 6.62 2.42 6.62 0 9.04 0 12s2.42 5.38 5.4 5.38c1.44 0 2.8-.56 3.77-1.53l7.03-6.24c.64-.64 1.49-.99 2.4-.99 1.87 0 3.39 1.51 3.39 3.38s-1.52 3.38-3.39 3.38c-.9 0-1.76-.35-2.44-1.03l-1.14-1.01-1.51 1.34 1.27 1.12c1.02 1.01 2.37 1.57 3.82 1.57 2.98 0 5.4-2.41 5.4-5.38s-2.42-5.37-5.4-5.37z" />
								</svg>
							</div>
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

						{/* Only show skip button if not in infinite mode */}
						{!infiniteMode && (
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
						)}

						{/* Show infinite icon instead of skip when in infinite mode */}
						{infiniteMode && (
							<div
								className="w-14 h-14 flex items-center justify-center rounded-full dynamic-bg-subtle shadow-sm"
								title={t('timer.infiniteMode')}
							>
								{/* Simple Infinity Icon */}
								<svg
									className="w-7 h-7 dynamic-color"
									fill="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L7.8 14.39c-.64.64-1.49.99-2.4.99-1.87 0-3.39-1.51-3.39-3.38S3.53 8.62 5.4 8.62c.91 0 1.76.35 2.44 1.03l1.13 1 1.51-1.34L9.22 8.2C8.2 7.18 6.84 6.62 5.4 6.62 2.42 6.62 0 9.04 0 12s2.42 5.38 5.4 5.38c1.44 0 2.8-.56 3.77-1.53l7.03-6.24c.64-.64 1.49-.99 2.4-.99 1.87 0 3.39 1.51 3.39 3.38s-1.52 3.38-3.39 3.38c-.9 0-1.76-.35-2.44-1.03l-1.14-1.01-1.51 1.34 1.27 1.12c1.02 1.01 2.37 1.57 3.82 1.57 2.98 0 5.4-2.41 5.4-5.38s-2.42-5.37-5.4-5.37z" />
								</svg>
							</div>
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
							className="w-14 h-14 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 hover:opacity-90 transition-opacity shadow-sm"
							title={t('timer.pause')}
						>
							{/* Simple Pause Icon */}
							<svg
								className="w-7 h-7 text-green-600 dark:text-green-400"
								fill="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
							</svg>
						</button>

						<button
							onClick={skipToNext}
							className="w-14 h-14 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 hover:opacity-90 transition-opacity shadow-sm"
							title={t('timer.skipToNext')}
						>
							{/* Simple Skip Icon */}
							<svg
								className="w-7 h-7 text-green-600 dark:text-green-400"
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

			{/* Project Required Modal */}
			<ConfirmModal
				isOpen={showProjectRequiredModal}
				title={t('timer.projectRequired', 'Project Required')}
				message={t(
					'timer.projectRequiredMessage',
					'Please select a project before starting the timer.',
				)}
				confirmButtonText={t('common.ok')} // TODO: Need translation
				cancelButtonText=""
				onConfirm={handleCloseProjectRequiredModal}
				onCancel={() => setShowProjectRequiredModal(false)}
				isLoading={false}
				danger={false}
				showCancelButton={false}
			/>

			{/* Short session modal for Next/Skip button */}
			<ConfirmModal
				isOpen={showShortSessionModal}
				title={t('timeEntries.shortTimeTitle', 'Short Session')}
				message={t(
					'timeEntries.shortTimeMessage',
					'This session is less than a minute. Do you still want to save it?',
				)}
				confirmButtonText={t('common.yes')}
				cancelButtonText={t('common.no')}
				onConfirm={handleConfirmShortSession}
				onCancel={handleDontSaveShortSession}
				isLoading={false}
				danger={false}
				showCancelButton={true}
				onCancelButtonClick={handleCancelShortSession}
			/>

			{/* Stop confirmation modal */}
			<ConfirmModal
				isOpen={showStopConfirmationModal}
				title={t('timer.saveSessionTitle', 'Save Session')}
				message={t(
					'timer.stopSessionMessage',
					'Do you want to save this timer session? This will reset the timer and return to Session 1.',
				)}
				confirmButtonText={t('common.yes')} // Botón "Sí" - Guardar y detener
				cancelButtonText={t('common.no')} // Botón "No" - No guardar pero detener
				onConfirm={handleConfirmSave} // Sí - Guardar entry y detener timer
				onCancel={handleDontSave} // No - No guardar pero detener timer
				isLoading={false}
				danger={false}
				showCancelButton={true} // Mostrar tercer botón "Cancelar"
				onCancelButtonClick={handleCancelStopModal} // Cancelar - No detener el timer
			/>
		</>
	)
}
