import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTimer } from '../../hooks/useTimer'
import { useLocation } from 'react-router-dom'
import { PlayIcon, PauseIcon, StopIcon } from '@heroicons/react/24/solid'
import { ConfirmModal } from '../ui/ConfirmModal'

export const StickyTimer = () => {
	const { t } = useTranslation()
	const location = useLocation()
	const {
		status,
		mode,
		formattedTime,
		progress,
		elapsed,
		pause,
		resume,
		stop,
		projectId,
		infiniteMode,
	} = useTimer()

	const [isVisible, setIsVisible] = useState(false)
	const [animateIn, setAnimateIn] = useState(false)
	const [showStopConfirmationModal, setShowStopConfirmationModal] =
		useState(false)

	// Simplified logic for visibility
	useEffect(() => {
		const isTimerActive =
			status === 'running' || status === 'paused' || status === 'break'
		const isDashboard = location.pathname === '/'

		// Simple rule: show if timer is active and not on dashboard
		if (isTimerActive && !isDashboard) {
			setIsVisible(true)
			// Add slight delay for animation
			const animTimeout = setTimeout(() => {
				setAnimateIn(true)
			}, 50)
			return () => clearTimeout(animTimeout)
		} else {
			// Hide with animation
			setAnimateIn(false)
			const hideTimeout = setTimeout(() => {
				setIsVisible(false)
			}, 500) // Match the transition duration in the className
			return () => clearTimeout(hideTimeout)
		}
	}, [status, location.pathname])

	// Handle stop confirmation
	const handleStop = () => {
		if (elapsed > 0) {
			// Always show confirmation when stopping with time recorded (work or break)
			setShowStopConfirmationModal(true)
		} else {
			// For empty timer, just stop and reset
			stop()
		}
	}

	const handleConfirmSave = () => {
		stop()
		setShowStopConfirmationModal(false)
	}

	const handleDontSave = () => {
		stop()
		setShowStopConfirmationModal(false)
	}

	const handleCancelStopModal = () => {
		setShowStopConfirmationModal(false)
	}

	// Early return if not visible at all
	if (!isVisible) return null

	// Get button color classes based on mode
	const getButtonClasses = (buttonType: 'play' | 'pause' | 'stop') => {
		if (buttonType === 'stop') {
			return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50'
		}

		if (mode === 'break') {
			return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/50'
		}

		// Use dynamic colors for work mode
		return 'dynamic-bg-subtle dynamic-color hover:brightness-110 dark:hover:brightness-125'
	}

	return (
		<>
			<div
				className={`fixed left-1/2 bottom-20 z-50 rounded-lg overflow-hidden transition-all duration-500 bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] shadow-lg border border-gray-200 dark:border-[rgb(var(--color-border-primary))] ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
				style={{
					transform: 'translateX(-50%)',
					width: 'min(800px, 90vw)',
				}}
			>
				<div className="flex flex-col w-full">
					<div className="flex w-full items-center">
						{/* Timer Status */}
						<div className="px-5 py-3 flex-1 flex items-center">
							<span className="font-medium text-lg text-gray-800 dark:text-white dynamic-color">
								{mode === 'work'
									? status === 'running'
										? t('timer.workTime')
										: t('timer.paused')
									: t('timer.breakTime')}
							</span>
							<span className="text-2xl font-mono font-bold ml-6 dynamic-color">
								{formattedTime}
							</span>
						</div>

						{/* Controls - using same style as dashboard */}
						<div className="flex items-center mr-3 space-x-3">
							{status === 'running' ? (
								<button
									onClick={pause}
									className={`w-12 h-12 flex items-center justify-center rounded-full ${getButtonClasses('pause')} transition-colors shadow-sm`}
									title={t('timer.pause')}
								>
									<PauseIcon className="h-6 w-6" />
								</button>
							) : (
								<button
									onClick={resume}
									className={`w-12 h-12 flex items-center justify-center rounded-full ${getButtonClasses('play')} transition-colors shadow-sm`}
									title={t('timer.resume')}
								>
									<PlayIcon className="h-6 w-6" />
								</button>
							)}

							<button
								onClick={handleStop}
								className={`w-12 h-12 flex items-center justify-center rounded-full ${getButtonClasses('stop')} transition-colors shadow-sm`}
								title={t('timer.stop')}
							>
								<StopIcon className="h-6 w-6" />
							</button>
						</div>
					</div>

					{/* Progress bar */}
					<div className="h-2 w-full bg-gray-200 dark:bg-[rgb(var(--color-border-primary))]">
						<div
							className={`h-full transition-all duration-300 ${
								mode === 'work'
									? status === 'running'
										? 'dynamic-bg'
										: 'bg-yellow-500'
									: 'bg-green-500'
							}`}
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>
			</div>

			{/* Stop confirmation modal */}
			<ConfirmModal
				isOpen={showStopConfirmationModal}
				title={t('timer.saveSessionTitle', 'Save Session')}
				message={t(
					'timer.stopSessionMessage',
					'Do you want to save this timer session? This will reset the timer and return to Session 1.',
				)}
				confirmButtonText={t('common.yes')}
				cancelButtonText={t('common.no')}
				onConfirm={handleConfirmSave}
				onCancel={handleDontSave}
				isLoading={false}
				danger={false}
				showCancelButton={true}
				onCancelButtonClick={handleCancelStopModal}
			/>
		</>
	)
}
