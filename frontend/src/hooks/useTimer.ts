import { useState, useEffect, useRef } from 'react';
import { useTimerStore } from '../store/timerStore';
import { useTranslation } from 'react-i18next';
import { showTimerNotification } from '../utils/notifications/TimerNotifications';

export const useTimer = () => {
	const { t } = useTranslation();
	const {
		status,
		mode,
		workDuration,
		breakDuration,
		repetitions,
		currentRepetition,
		projectId,
		taskId,
		notes,
		tags,
		workStartTime,
		showCompletionModal,
		closeCompletionModal,
		infiniteMode,
		selectedEntryId,

		start: storeStart,
		pause: storePause,
		resume: storeResume,
		stop: storeStop,
		reset: storeReset,
		switchToNext: storeSwitchToNext,

		setWorkDuration,
		setBreakDuration,
		setRepetitions,
		setProjectId,
		setTaskId,
		setNotes,
		setTags,
		createTimeEntryFromWorkSession,
	} = useTimerStore();

	// Mantener nuestro propio conteo de tiempo transcurrido
	const [localElapsed, setLocalElapsed] = useState(0);
	const startTimeRef = useRef<number | null>(null);
	const intervalRef = useRef<number | null>(null);

	// Sincronizar local elapsed con el estado del temporizador cuando cambia el estado
	useEffect(() => {
		if (status === 'running') {
			if (!startTimeRef.current) {
				startTimeRef.current = Date.now() - (localElapsed * 1000);
			}

			// Iniciar el intervalo solo si no existe
			if (!intervalRef.current) {
				intervalRef.current = window.setInterval(() => {
					if (startTimeRef.current) {
						const now = Date.now();
						const newElapsed = Math.floor((now - startTimeRef.current) / 1000);
						setLocalElapsed(newElapsed);
					}
				}, 100); // Actualizar más frecuentemente para mayor precisión
			}
		} else {
			// Detener el intervalo si el temporizador no está en ejecución
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}

			// Si está pausado, mantener el tiempo actual
			if (status === 'paused') {
				startTimeRef.current = null;
			}

			// Si está inactivo, reiniciar el contador
			if (status === 'idle') {
				startTimeRef.current = null;
				setLocalElapsed(0);
			}
		}

		// Limpieza
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [status, localElapsed]);

	// Comprobar si debemos cambiar al siguiente modo o detener el temporizador
	useEffect(() => {
		if (status === 'running' && !infiniteMode) {
			const totalDuration = mode === 'work' ? workDuration * 60 : breakDuration * 60;

			if (localElapsed >= totalDuration) {
				// Cambiar al siguiente modo o detener
				if (mode === 'work') {
					// Crear entrada de tiempo y cambiar a descanso
					if (projectId) {
						createTimeEntryFromWorkSession();
					}

					if (breakDuration === 0) {
						// Si la duración del descanso es 0, ir directamente al siguiente período de trabajo
						if (currentRepetition < repetitions) {
							storeSwitchToNext();
							startTimeRef.current = Date.now(); // Reiniciar el contador
							setLocalElapsed(0);
						} else {
							// Todas las repeticiones completadas
							storeStop();
							showTimerNotification('complete', {
								title: 'All Sessions Completed',
								body: "Great job! You've completed all your work sessions.",
								persistent: true,
							});
						}
					} else {
						// Cambiar a modo descanso
						storeSwitchToNext();
						startTimeRef.current = Date.now(); // Reiniciar el contador
						setLocalElapsed(0);

						showTimerNotification('break', {
							title: 'Break Time',
							body: 'Work session completed! Time for a break.',
							persistent: false,
						});
					}
				} else {
					// Fin del descanso, iniciar nuevo trabajo o terminar
					if (currentRepetition < repetitions) {
						// Iniciar nuevo período de trabajo
						storeSwitchToNext();
						startTimeRef.current = Date.now(); // Reiniciar el contador
						setLocalElapsed(0);

						showTimerNotification('work', {
							title: 'Work Time',
							body: 'Break completed! Back to work.',
							persistent: false,
						});
					} else {
						// Todas las repeticiones completadas
						storeStop();
						startTimeRef.current = null;
						setLocalElapsed(0);

						showTimerNotification('complete', {
							title: 'All Sessions Completed',
							body: "Great job! You've completed all your work sessions.",
							persistent: true,
						});
					}
				}
			}
		}
	}, [localElapsed, status, mode, workDuration, breakDuration, repetitions, currentRepetition, infiniteMode, projectId]);

	// Crear wrapped functions para manipular el timer
	const start = () => {
		storeStart();
		startTimeRef.current = Date.now();
		setLocalElapsed(0);
	};

	const pause = () => {
		storePause();
	};

	const resume = () => {
		storeResume();
		// Ajustar el tiempo de inicio para mantener el tiempo transcurrido
		startTimeRef.current = Date.now() - (localElapsed * 1000);
	};

	const stop = () => {
		storeStop();
		startTimeRef.current = null;
		setLocalElapsed(0);
	};

	const reset = () => {
		storeReset();
		startTimeRef.current = null;
		setLocalElapsed(0);
	};

	const skipToNext = () => {
		// Gestionar la notificación localmente
		const notificationType = mode === 'work' ? 'break' : 'work';
		const title = mode === 'work' ? t('timer.breakTime') : t('timer.workTime');
		const body = mode === 'work' ? t('timer.workCompleted') : t('timer.breakCompleted');

		showTimerNotification(notificationType, {
			title,
			body,
			persistent: false
		});

		// Usar la función del store
		storeSwitchToNext();

		// Reiniciar el contador local
		startTimeRef.current = Date.now();
		setLocalElapsed(0);
	};

	// Calcular el tiempo restante con nuestro contador local
	const remainingTime =
		mode === 'work'
			? infiniteMode
				? 0
				: Math.max(0, workDuration * 60 - localElapsed)
			: Math.max(0, breakDuration * 60 - localElapsed);

	// Formatear el tiempo
	const formatTime = (seconds: number): string => {
		if (infiniteMode && mode === 'work') {
			// Para el modo infinito, mostrar el tiempo transcurrido
			const hours = Math.floor(localElapsed / 3600);
			const minutes = Math.floor((localElapsed % 3600) / 60);
			const secs = localElapsed % 60;
			return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
		} else {
			// Para el modo normal, mostrar el tiempo restante
			const minutes = Math.floor(seconds / 60);
			const secs = seconds % 60;
			return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
		}
	};

	// Calcular el progreso
	const progress = infiniteMode && mode === 'work'
		? 50
		: mode === 'work'
			? (localElapsed / (workDuration * 60)) * 100
			: (localElapsed / (breakDuration * 60)) * 100;

	return {
		status,
		mode,
		elapsed: localElapsed,
		remainingTime,
		formattedTime: infiniteMode && mode === 'work'
			? formatTime(localElapsed)
			: formatTime(remainingTime),
		progress,
		workDuration,
		breakDuration,
		repetitions,
		currentRepetition,
		projectId,
		taskId,
		notes,
		tags,
		workStartTime,
		showCompletionModal,
		closeCompletionModal,
		infiniteMode,
		selectedEntryId,

		start,
		pause,
		resume,
		stop,
		reset,
		skipToNext,
		createTimeEntryOnCompletion: createTimeEntryFromWorkSession,
		infiniteMode,
		selectedEntryId,

		setWorkDuration,
		setBreakDuration,
		setRepetitions,
		setProjectId,
		setTaskId,
		setNotes,
		setTags,
	};
};
