import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useTimer } from '../../hooks/useTimer'
import { useLocation } from 'react-router-dom'
import { ConfirmModal } from '../ui/ConfirmModal'
import { InfiniteMode } from './InfiniteMode'

export const StickyTimer = () => {
	const { t } = useTranslation()
	const location = useLocation()
	const {
		status,
		mode,
		formattedTime,
		progress,
		pause,
		resume,
		stop,
		infiniteMode,
		skipToNext,
	} = useTimer()

	const [isVisible, setIsVisible] = useState(false)
	const [animateIn, setAnimateIn] = useState(false)
	const [showStopConfirmationModal, setShowStopConfirmationModal] =
		useState(false)
	
	// Referencias para el modo infinito
	const [elapsedTime, setElapsedTime] = useState(0)
	const requestRef = useRef<number>()
	const previousTimeRef = useRef<number>()
	const startTimeRef = useRef<number | null>(null)

	// Función para animar el tiempo en modo infinito
	const animate = (time: number) => {
		if (previousTimeRef.current !== undefined) {
			const deltaTime = time - previousTimeRef.current
			
			// Actualizar tiempo transcurrido para modo infinito
			if (infiniteMode && startTimeRef.current !== null) {
				const elapsedSeconds = Math.floor(
					(time - startTimeRef.current) / 1000,
				)
				setElapsedTime(elapsedSeconds)
			}
		}

		previousTimeRef.current = time
		requestRef.current = requestAnimationFrame(animate)
	}

	// Iniciar animación cuando cambia el modo infinito
	useEffect(() => {
		if (infiniteMode && startTimeRef.current === null) {
			startTimeRef.current = performance.now()
		} else if (!infiniteMode) {
			// Reiniciar tiempo transcurrido cuando se desactiva el modo infinito
			startTimeRef.current = null
			setElapsedTime(0)
		}
		requestRef.current = requestAnimationFrame(animate)
		return () => {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current)
			}
		}
	}, [infiniteMode])

	// Formatear tiempo para modo infinito
	const formatInfiniteTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60)
		const remainingSeconds = seconds % 60
		return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
			.toString()
			.padStart(2, '0')}`
	}

	// Usar tiempo de modo infinito o tiempo formateado normal
	const displayTime = infiniteMode
		? formatInfiniteTime(elapsedTime)
		: formattedTime

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
		// Solo mostrar el modal de confirmación si no estamos en modo break
		if (mode === 'break') {
			stop(false)
			return
		}
		setShowStopConfirmationModal(true)
	}

	const handleConfirmSave = () => {
		stop(true)
		setShowStopConfirmationModal(false)
	}

	const handleDontSave = () => {
		stop(false)
		setShowStopConfirmationModal(false)
	}

	const handleCancelStopModal = () => {
		setShowStopConfirmationModal(false)
	}

	// Early return if not visible at all
	if (!isVisible) return null

	// Get button color classes based on mode
	const getButtonClasses = (
		buttonType: 'play' | 'pause' | 'stop' | 'next',
	) => {
		if (buttonType === 'stop') {
			return 'w-12 h-12 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 hover:opacity-90 transition-opacity shadow-sm'
		}

		if (mode === 'break') {
			return 'w-12 h-12 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 hover:opacity-90 transition-opacity shadow-sm'
		}

		// Use dynamic colors for work mode
		return 'w-12 h-12 flex items-center justify-center rounded-full dynamic-bg-subtle hover:opacity-90 transition-opacity shadow-sm'
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
								{displayTime}
							</span>
						</div>

						{/* Controls - using same style as TimerControls */}
						<div className="flex items-center mr-3 space-x-3">
							{status === 'running' ? (
								<button
									onClick={pause}
									className={getButtonClasses('pause')}
									title={t('timer.pause')}
								>
									{/* Simple Pause Icon */}
									<svg
										className={`w-7 h-7 ${mode === 'break' ? '' : 'dynamic-color'}`}
										fill="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
									</svg>
								</button>
							) : (
								<button
									onClick={resume}
									className={getButtonClasses('play')}
									title={t('timer.resume')}
								>
									{/* Simple Play Icon */}
									<svg
										className={`w-7 h-7 ${mode === 'break' ? '' : 'dynamic-color'}`}
										fill="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M8 5v14l11-7z" />
									</svg>
								</button>
							)}

							{!infiniteMode ? (
								<button
									onClick={skipToNext}
									className={getButtonClasses('next')}
									title={t('timer.skipToNext')}
								>
									{/* Simple Skip Icon */}
									<svg
										className={`w-7 h-7 ${mode === 'break' ? '' : 'dynamic-color'}`}
										fill="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
									</svg>
								</button>
							) : (
								<InfiniteMode isInfiniteMode={infiniteMode} />
							)}

							<button
								onClick={handleStop}
								className={getButtonClasses('stop')}
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
