import { useEffect, useState } from 'react';

interface TimerDisplayProps {
	progress: number;
	formattedTime: string;
	mode: 'work' | 'break';
	isInfiniteMode?: boolean;
}

export const TimerDisplay = ({
	progress,
	formattedTime,
	mode,
	isInfiniteMode = false,
}: TimerDisplayProps) => {
	const circleLength = 263.89; // 2 * PI * 42, el perímetro del círculo
	const [adjustedProgress, setAdjustedProgress] = useState(progress);

	// Actualización suave del progreso (si es necesario, ajusta esto)
	useEffect(() => {
		const progressInterval = setInterval(() => {
			setAdjustedProgress((prevProgress) => {
				if (prevProgress < progress) {
					return prevProgress + 100; // Aumentar el progreso de uno en uno para evitar saltos
				}
				clearInterval(progressInterval); // Detener la actualización si ya se alcanzó el progreso final
				return prevProgress;
			});
		}, 1000); // Actualización cada segundo

		return () => clearInterval(progressInterval); // Limpiar intervalo cuando el componente se desmonte
	}, [progress]);

	const progressOffset = isInfiniteMode
		? circleLength / 2 // Siempre mostrar medio círculo para el modo infinito
		: circleLength - (circleLength * adjustedProgress) / 100;

	return (
		<div className="relative h-48 w-48 sm:h-64 sm:w-64 mx-auto mb-4">
			<svg className="w-full h-full" viewBox="0 0 100 100">
				{/* Círculo de fondo */}
				<circle
					cx="50"
					cy="50"
					r="42"
					fill="none"
					stroke="currentColor"
					strokeWidth="7"
					className="text-gray-200 dark:text-[rgb(var(--color-border-primary))]"
				/>

				{/* Círculo de progreso */}
				<circle
					cx="50"
					cy="50"
					r="42"
					fill="none"
					strokeWidth="7"
					strokeLinecap="round"
					strokeDasharray={circleLength} // 2 * PI * 42
					strokeDashoffset={progressOffset}
					className={`transform origin-center -rotate-90 ${
						mode === 'work'
							? 'stroke-[hsl(var(--color-project-hue),var(--color-project-saturation),var(--color-project-lightness))]'
							: 'text-green-500 dark:text-green-400'
					}`}
				/>
			</svg>

			{/* Texto del temporizador */}
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span className="text-4xl sm:text-5xl font-bold dynamic-color">
					{formattedTime}
				</span>
				{isInfiniteMode && <span className="text-2xl dynamic-color mt-2">∞</span>}
			</div>
		</div>
	);
};
