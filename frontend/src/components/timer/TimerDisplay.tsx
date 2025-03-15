import { useEffect, useState, useRef } from 'react';

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
	const [displayProgress, setDisplayProgress] = useState(progress);
	const requestRef = useRef<number>();
	const previousTimeRef = useRef<number>();

	// Animación fluida usando requestAnimationFrame
	const animate = (time: number) => {
		if (previousTimeRef.current !== undefined) {
			// Determinar cuánto debemos animar en esta frame
			const deltaTime = time - previousTimeRef.current;

			// Actualizar el progreso de manera suave
			// El valor 0.1 determina la velocidad de la animación (menor = más suave pero más lento)
			setDisplayProgress(prevProgress => {
				const diff = progress - prevProgress;
				const step = diff * Math.min(deltaTime / 100, 0.2); // Limitar el paso para animaciones muy largas
				return prevProgress + step;
			});
		}

		previousTimeRef.current = time;
		requestRef.current = requestAnimationFrame(animate);
	};

	// Configurar la animación con requestAnimationFrame
	useEffect(() => {
		requestRef.current = requestAnimationFrame(animate);
		return () => {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
			}
		};
	}, [progress]); // Depende de progress para reiniciar la animación cuando cambia

	// Calcular el desplazamiento del círculo basado en el progreso
	const progressOffset = isInfiniteMode
		? circleLength / 2 // Siempre mostrar medio círculo para el modo infinito
		: circleLength - (circleLength * displayProgress) / 100;

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
							: 'stroke-[hsl(var(--color-project-hue),var(--color-project-saturation),50%)]'
					}`}
				/>
			</svg>

			{/* Texto del temporizador */}
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span className={`text-4xl sm:text-5xl font-bold ${
					mode === 'work'
						? 'dynamic-color'
						: 'text-[hsl(var(--color-project-hue),var(--color-project-saturation),50%)]'
				}`}>
					{formattedTime}
				</span>
				{isInfiniteMode && <span className="text-2xl dynamic-color mt-2">∞</span>}
			</div>
		</div>
	);
};
