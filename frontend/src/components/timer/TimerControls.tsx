import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmModal } from '../ui/ConfirmModal'
import { useProjectStore } from '../../store/projectStore'
import { useDataInitializer } from '../DataInitializer'

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

		await skipToNext()
	}

	const handleStop = () => {
		// Solo mostrar el modal de confirmación si no estamos en modo break
		if (mode === 'break') {
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

			{/* Eliminé el StatusIndicator que estaba aquí */}

			{/* Confirmation Modals */}
			<ConfirmModal
				isOpen={showStopConfirmationModal}
				title={t('timer.stopSessionTitle')}
				message={t('timer.stopSessionMessage')}
				confirmButtonText={t('timer.save')}
				cancelButtonText={t('timer.dontSave')}
				onConfirm={handleConfirmSave}
				onCancel={handleDontSave}
				isLoading={false}
				danger={false}
				showCancelButton={true}
				onCancelButtonClick={handleCancelStopModal}
			/>

			<ConfirmModal
				isOpen={showShortSessionModal}
				title={t('timer.shortSessionTitle')}
				message={t('timer.shortSessionMessage')}
				confirmButtonText={t('timer.save')}
				cancelButtonText={t('timer.dontSave')}
				onConfirm={handleConfirmShortSession}
				onCancel={handleDontSaveShortSession}
				isLoading={false}
				danger={false}
				showCancelButton={true}
				onCancelButtonClick={handleCancelShortSession}
			/>

			<ConfirmModal
				isOpen={showProjectRequiredModal}
				title={t('timer.projectRequired')}
				message={t('timer.projectRequiredMessage')}
				confirmButtonText={t('common.ok')}
				cancelButtonText={t('common.cancel')}
				onConfirm={handleCloseProjectRequiredModal}
				onCancel={handleCloseProjectRequiredModal}
				isLoading={false}
				danger={false}
				showCancelButton={false}
			/>
		</>
	)
}
