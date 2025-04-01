import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useSocket } from '../../context/SocketContext' // Importamos el contexto del socket

interface TimerDisplayProps {
	progress: number
	formattedTime: string
	mode: 'work' | 'break'
	isInfiniteMode?: boolean
}

export const TimerDisplay = ({
	progress,
	formattedTime,
	mode,
	isInfiniteMode = false,
}: TimerDisplayProps) => {
	const { t } = useTranslation()
	const { isConnected } = useSocket() // Obtener el estado de conexión del socket
	const circleLength = 263.89 // 2 * PI * 42, circle perimeter
	const [displayProgress, setDisplayProgress] = useState(progress)
	const [elapsedTime, setElapsedTime] = useState(0) // For infinite mode
	const requestRef = useRef<number>()
	const previousTimeRef = useRef<number>()
	const startTimeRef = useRef<number | null>(null)

	// Smooth animation for progress circle
	const animate = (time: number) => {
		if (previousTimeRef.current !== undefined) {
			const deltaTime = time - previousTimeRef.current
			setDisplayProgress((prevProgress) => {
				const diff = progress - prevProgress
				const step = diff * Math.min(deltaTime / 200, 0.05)
				return prevProgress + step
			})

			// Update elapsed time for infinite mode
			if (isInfiniteMode && startTimeRef.current !== null) {
				const elapsedSeconds = Math.floor(
					(time - startTimeRef.current) / 1000,
				)
				setElapsedTime(elapsedSeconds)
			}
		}

		previousTimeRef.current = time
		requestRef.current = requestAnimationFrame(animate)
	}

	// Start animation and timer
	useEffect(() => {
		if (isInfiniteMode && startTimeRef.current === null) {
			startTimeRef.current = performance.now()
		}
		requestRef.current = requestAnimationFrame(animate)
		return () => {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current)
			}
		}
	}, [progress, isInfiniteMode])

	// Format elapsed time for infinite mode (e.g., MM:SS)
	const formatInfiniteTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60)
		const remainingSeconds = seconds % 60
		return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
			.toString()
			.padStart(2, '0')}`
	}

	// Use infinite mode time or prop-provided formattedTime
	const displayTime = isInfiniteMode
		? formatInfiniteTime(elapsedTime)
		: formattedTime

	// Progress circle: 100% for infinite mode, animated otherwise
	const progressOffset = isInfiniteMode
		? 0 // Full circle (100%)
		: circleLength - (circleLength * displayProgress) / 100

	return (
		<div className="relative h-48 w-48 sm:h-64 sm:w-64 mx-auto mb-4">
			<svg className="w-full h-full" viewBox="0 0 100 100">
				{/* Background circle */}
				<circle
					cx="50"
					cy="50"
					r="42"
					fill="none"
					stroke="currentColor"
					strokeWidth="7"
					className="text-gray-200 dark:text-[rgb(var(--color-border-primary))]"
				/>

				{/* Progress circle with gradient */}
				<defs>
					<linearGradient
						id="progressGradient"
						x1="0%"
						y1="0%"
						x2="100%"
						y2="100%"
					>
						<stop
							offset="0%"
							stopColor="hsl(var(--color-project-hue),var(--color-project-saturation),var(--color-project-lightness))"
						/>
						<stop
							offset="100%"
							stopColor="hsl(var(--color-project-hue),var(--color-project-saturation),calc(var(--color-project-lightness) - 15%))"
						/>
					</linearGradient>
				</defs>
				<circle
					cx="50"
					cy="50"
					r="42"
					fill="none"
					strokeWidth="7"
					strokeLinecap="round"
					strokeDasharray={circleLength}
					strokeDashoffset={progressOffset}
					className="transform origin-center -rotate-90"
					stroke={
						mode === 'work'
							? 'url(#progressGradient)'
							: 'url(#breakGradient)'
					}
				/>

				{/* Break mode gradient */}
				<defs>
					<linearGradient
						id="breakGradient"
						x1="0%"
						y1="0%"
						x2="100%"
						y2="100%"
					>
						<stop
							offset="0%"
							stopColor="hsl(var(--color-project-hue),var(--color-project-saturation),50%)"
						/>
						<stop
							offset="100%"
							stopColor="hsl(var(--color-project-hue),var(--color-project-saturation),35%)"
						/>
					</linearGradient>
				</defs>
			</svg>

			{/* Timer text */}
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span
					className={`text-4xl sm:text-5xl font-bold ${
						mode === 'work'
							? 'dynamic-color'
							: 'text-[hsl(var(--color-project-hue),var(--color-project-saturation),50%)]'
					}`}
				>
					{displayTime}
				</span>

				{!isInfiniteMode && (
					<span
						className={`text-sm mt-1 mb-1 font-medium ${
							mode === 'work'
								? 'dynamic-color'
								: 'text-[hsl(var(--color-project-hue),var(--color-project-saturation),50%)]'
						}`}
					>
						{mode === 'work'
							? t('timer.workTime')
							: t('timer.breakTime')}
					</span>
				)}

				{/* Indicador de conexión dentro del círculo */}
				<div className="mt-1">
					{isConnected ? (
						<div className="group relative inline-block">
							<svg
								className="w-4 h-4 text-green-500"
								fill="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2c-3.9-3.9-10.1-3.9-14 0z" />
							</svg>
							<span className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded px-2 py-1 absolute -top-8 left-1/2 transform -translate-x-1/2 pointer-events-none whitespace-nowrap">
								{t('status.connected')}
							</span>
						</div>
					) : (
						<div className="group relative inline-block">
							<svg
								className="w-4 h-4 text-red-500"
								fill="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.48L18.18 13.8 23.64 7zm-6.6 8.22L3.27 1.44 2 2.72l2.05 2.06C1.91 5.76.59 6.82.36 7l11.63 14.49.01.01.01-.01 3.9-4.86 3.32 3.32 1.27-1.27-3.46-3.46z" />
							</svg>
							<span className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded px-2 py-1 absolute -top-8 left-1/2 transform -translate-x-1/2 pointer-events-none whitespace-nowrap">
								{t('status.disconnected')}
							</span>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
