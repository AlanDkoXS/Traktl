import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTimer } from '../../hooks/useTimer';
import { useLocation } from 'react-router-dom';
import { PlayIcon, PauseIcon, StopIcon } from '@heroicons/react/24/solid';

export const StickyTimer = () => {
	const { t } = useTranslation();
	const location = useLocation();
	const { status, mode, formattedTime, progress, pause, resume, stop } = useTimer();

	const [isVisible, setIsVisible] = useState(false);
	const [animateIn, setAnimateIn] = useState(false);
	const prevPathRef = useRef(location.pathname);

	// Handle visibility based on route changes and timer status
	useEffect(() => {
		const isTimerActive = status === 'running' || status === 'paused' || status === 'break';
		const isDashboard = location.pathname === '/';
		const wasOnDashboard = prevPathRef.current === '/';
		const routeChanged = prevPathRef.current !== location.pathname;

		// Update prev path ref
		prevPathRef.current = location.pathname;

		// Case 1: Timer is not active - always hide
		if (!isTimerActive) {
			setAnimateIn(false);
			setTimeout(() => setIsVisible(false), 500);
			return;
		}

		// Case 2: Just navigated to dashboard - hide with animation
		if (isDashboard && routeChanged) {
			setAnimateIn(false);
			setTimeout(() => setIsVisible(false), 500);
			return;
		}

		// Case 3: On non-dashboard page with active timer - show
		if (!isDashboard && isTimerActive) {
			setIsVisible(true);
			// Only trigger animation if newly visible
			setTimeout(() => setAnimateIn(true), 50);
			return;
		}

		// Case 4: Just left dashboard with active timer - show
		if (!isDashboard && wasOnDashboard && isTimerActive) {
			setIsVisible(true);
			setTimeout(() => setAnimateIn(true), 50);
			return;
		}
	}, [status, location.pathname]);

	if (!isVisible) return null;

	return (
		<div
			className={`fixed left-1/2 z-50 shadow-xl rounded-lg overflow-hidden transition-all duration-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${animateIn ? 'opacity-100 translate-y-[50px]' : 'opacity-0 -translate-y-full'}`}
			style={{
				transform: 'translateX(-50%)',
				width: 'min(800px, 90vw)',
				top: '10vh',
			}}
		>
			<div className="flex flex-col w-full">
				<div className="flex w-full">
					{/* Timer Status */}
					<div className="px-5 py-3 flex-1 flex items-center bg-white dark:bg-gray-800">
						<span className="font-medium text-lg text-gray-800 dark:text-white">
							{mode === 'work'
								? status === 'running'
									? t('timer.workTime')
									: t('timer.paused')
								: t('timer.breakTime')}
						</span>
						<span className="text-2xl font-mono font-bold ml-6 text-gray-800 dark:text-white">
							{formattedTime}
						</span>
					</div>

					{/* Controls */}
					<div className="flex border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
						{status === 'running' ? (
							<button
								onClick={pause}
								className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-yellow-500"
								title={t('timer.pause')}
							>
								<PauseIcon className="h-6 w-6" />
							</button>
						) : (
							<button
								onClick={resume}
								className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-green-500"
								title={t('timer.resume')}
							>
								<PlayIcon className="h-6 w-6" />
							</button>
						)}

						<button
							onClick={stop}
							className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
							title={t('timer.stop')}
						>
							<StopIcon className="h-6 w-6" />
						</button>
					</div>
				</div>

				{/* Progress bar */}
				<div className="h-2 w-full bg-gray-200 dark:bg-gray-700">
					<div
						className={`h-full transition-all duration-300 ${
							mode === 'work'
								? status === 'running'
									? 'bg-green-500'
									: 'bg-yellow-500'
								: 'bg-blue-500'
						}`}
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>
		</div>
	);
};
