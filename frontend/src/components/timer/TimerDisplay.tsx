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
	const requestRef = useRef<number>()
	const previousTimeRef = useRef<number>()

	// Smooth animation using requestAnimationFrame
	const animate = (time: number) => {
		if (previousTimeRef.current !== undefined) {
			// Determine how much to animate in this frame
			const deltaTime = time - previousTimeRef.current

			// Update progress smoothly
			// The value 0.05 determines animation speed (lower = smoother but slower)
			setDisplayProgress((prevProgress) => {
				const diff = progress - prevProgress
				const step = diff * Math.min(deltaTime / 200, 0.05) // Limit step size for very large animations
				return prevProgress + step
			})
		}

		previousTimeRef.current = time
		requestRef.current = requestAnimationFrame(animate)
	}

	// Set up animation with requestAnimationFrame
	useEffect(() => {
		requestRef.current = requestAnimationFrame(animate)
		return () => {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current)
			}
		}
	}, [progress]) // Depend on progress to restart animation when it changes

	// For infinite mode, we show a 50% static circle
	// Otherwise we calculate it normally
	const progressOffset = isInfiniteMode
		? circleLength / 2 // Always show half circle for infinite mode
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
					strokeDasharray={circleLength} // 2 * PI * 42
					strokeDashoffset={progressOffset}
					className={`transform origin-center -rotate-90`}
					stroke={
						mode === 'work'
							? 'url(#progressGradient)'
							: 'url(#breakGradient)'
					}
				/>

				{/* Special gradient for break mode */}
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
					{formattedTime}
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
