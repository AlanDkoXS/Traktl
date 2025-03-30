import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

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
						className={`text-sm mt-1 font-medium ${
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
			</div>
		</div>
	)
}
