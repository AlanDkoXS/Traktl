import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TimeEntry } from '../../types';
import {
	format,
	subDays,
	addDays,
	getDay,
	eachDayOfInterval,
	startOfWeek,
	endOfWeek,
	isSameDay,
	parseISO,
} from 'date-fns';
import { useTimeEntryStore } from '../../store/timeEntryStore';
import { useProjectStore } from '../../store/projectStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ActivityHeatmapProps {
	timeEntries?: TimeEntry[];
}

export const ActivityHeatmap = ({ timeEntries = [] }: ActivityHeatmapProps) => {
	const { t } = useTranslation();
	const { timeEntries: storeTimeEntries } = useTimeEntryStore();
	const { projects } = useProjectStore();
	const [cellSize, setCellSize] = useState(10);
	const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
	const [tooltipData, setTooltipData] = useState<{ x: number; y: number; data: any } | null>(
		null
	);
	const [hoveredDay, setHoveredDay] = useState<string | null>(null);

	// Use entries from props if provided, otherwise use store
	const entriesToUse = useMemo(() => {
		return timeEntries.length > 0 ? timeEntries : storeTimeEntries;
	}, [timeEntries, storeTimeEntries]);

	// Handle responsive behavior
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 1280) setCellSize(16);
			else if (window.innerWidth >= 1024) setCellSize(14);
			else setCellSize(10);
		};

		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// Generate calendar grid - memoized to prevent recalculations
	const calendarData = useMemo(() => {
		const today = new Date();
		const weeksToShow = 21;

		const halfWeeks = Math.floor(weeksToShow / 2);
		const startDate = subDays(today, halfWeeks * 7);
		const endDate = addDays(today, halfWeeks * 7);

		const gridStartDate = startOfWeek(startDate);
		const gridEndDate = endOfWeek(endDate);

		const days = eachDayOfInterval({ start: gridStartDate, end: gridEndDate });

		const activityByDate: Record<string, number> = {};

		// Process entries only once per useMemo calculation
		entriesToUse.forEach((entry) => {
			try {
				// Ensure startTime is properly parsed to a Date object
				const startTimeDate = entry.startTime instanceof Date
					? entry.startTime
					: parseISO(entry.startTime.toString());

				const dateString = format(startTimeDate, 'yyyy-MM-dd');
				if (!activityByDate[dateString]) activityByDate[dateString] = 0;
				if (entry.duration) activityByDate[dateString] += entry.duration / (1000 * 60);
			} catch (error) {
				console.error('Error processing entry:', error);
			}
		});

		const daysByWeekday: Record<number, any[]> = {
			0: [],
			1: [],
			2: [],
			3: [],
			4: [],
			5: [],
			6: [],
		};

		days.forEach((date) => {
			const dayOfWeek = getDay(date);
			const dateString = format(date, 'yyyy-MM-dd');
			daysByWeekday[dayOfWeek].push({
				date,
				dateString,
				activity: activityByDate[dateString] || 0,
				isToday: isSameDay(date, today),
			});
		});

		return daysByWeekday;
	}, [entriesToUse]); // Only depend on entries array reference

	// Calculate max activity
	const maxActivity = useMemo(() => {
		const allActivities = Object.values(calendarData)
			.flat()
			.map((day) => day.activity);
		return Math.max(...allActivities, 60);
	}, [calendarData]);

	// Calculate number of columns
	const numCols = useMemo(() => {
		return Object.values(calendarData)[0]?.length || 21;
	}, [calendarData]);

	// GitHub-style colors (from gray to green)
	const GITHUB_COLORS = useMemo(() => [
		'#ebedf0', // light gray
		'#9be9a8', // light green
		'#40c463', // medium green
		'#30a14e', // darker green
		'#216e39'  // darkest green
	], []);

	// Dark mode GitHub-style colors
	const GITHUB_COLORS_DARK = useMemo(() => [
		'#161b22', // darkest background
		'#0e4429', // dark green
		'#006d32', // medium green
		'#26a641', // lighter green
		'#39d353'  // lightest green
	], []);

	// Get today's pie data - completely rewritten to ensure correctness
	const todaysPieData = useMemo(() => {
		// Get today's date in YYYY-MM-DD format
		const todayStr = format(new Date(), 'yyyy-MM-dd');

		// Filter entries for today only
		const todayEntries = entriesToUse.filter(entry => {
			try {
				const startDate = entry.startTime instanceof Date
					? entry.startTime
					: new Date(entry.startTime);

				const entryDateStr = format(startDate, 'yyyy-MM-dd');
				return entryDateStr === todayStr;
			} catch (error) {
				console.error('Error processing entry date:', error, entry);
				return false;
			}
		});

		// Group entries by project
		const projectMap: Record<string, {
			id: string,
			duration: number,
			name: string
		}> = {};

		// Process each entry to accumulate time by project
		todayEntries.forEach(entry => {
			const projectId = entry.project;

			if (!projectMap[projectId]) {
				// Find the project details
				const project = projects.find(p => p.id === projectId);

				projectMap[projectId] = {
					id: projectId,
					duration: 0,
					name: project?.name || 'Unknown Project',
				};
			}

			// Add this entry's duration to the project total
			projectMap[projectId].duration += entry.duration / (1000 * 60);
		});

		// Convert the map to an array for the pie chart
		const projectTimeArray = Object.values(projectMap);

		// Calculate total duration for percentages
		const totalDuration = projectTimeArray.reduce((sum, project) => sum + project.duration, 0);

		// Format the data for the pie chart
		const formattedData = projectTimeArray.map(project => ({
			id: project.id,
			name: project.name,
			value: Math.round(project.duration), // Round to nearest minute
			percent: totalDuration > 0 ? project.duration / totalDuration : 0,
		}));

		// Sort by duration (highest first)
		return formattedData.sort((a, b) => b.value - a.value);
	}, [entriesToUse, projects]);

	const totalMinutesToday = useMemo(() => {
		return todaysPieData.reduce((sum, item) => sum + item.value, 0);
	}, [todaysPieData]);

	// GitHub-style activity colors - converted to memoized function
	const getGitHubActivityColor = useCallback((minutes: number, isHovered: boolean) => {
		if (minutes === 0)
			return isHovered ? 'bg-gray-200 dark:bg-gray-600' : 'bg-gray-100 dark:bg-gray-700';

		// GitHub color palette
		if (minutes <= maxActivity * 0.15)
			return isHovered ? 'bg-[#9be9a8] dark:bg-[#0e4429]' : 'bg-[#ebedf0] dark:bg-[#0e4429]';

		if (minutes <= maxActivity * 0.4)
			return isHovered ? 'bg-[#40c463] dark:bg-[#006d32]' : 'bg-[#9be9a8] dark:bg-[#006d32]';

		if (minutes <= maxActivity * 0.7)
			return isHovered ? 'bg-[#30a14e] dark:bg-[#26a641]' : 'bg-[#40c463] dark:bg-[#26a641]';

		return isHovered ? 'bg-[#216e39] dark:bg-[#39d353]' : 'bg-[#30a14e] dark:bg-[#39d353]';
	}, [maxActivity]);

	// Get GitHub-style color for pie chart slice based on index
	// CORREGIDO: Invertir los colores para que el mayor porcentaje tenga el verde más claro
	const getPieChartColor = useCallback((index: number, totalItems: number, isDarkMode: boolean) => {
		const colors = isDarkMode ? GITHUB_COLORS_DARK : GITHUB_COLORS;

		// Invertir el orden para que el elemento con mayor índice (menor porcentaje)
		// obtenga el color más oscuro (o menos brillante en modo oscuro)
		// y el elemento con menor índice (mayor porcentaje) obtenga el verde más claro

		// Calcular el índice inverso
		let invertedIndex;
		if (totalItems <= 1) {
			// Si solo hay un elemento, usar el color verde más claro
			invertedIndex = isDarkMode ? colors.length - 1 : 1;
		} else {
			// Escalar el índice para que se distribuya por el array de colores
			const maxIndex = Math.min(totalItems - 1, colors.length - 1);
			invertedIndex = Math.max(0, maxIndex - index);
		}

		return colors[invertedIndex];
	}, [GITHUB_COLORS, GITHUB_COLORS_DARK]);

	const daysTranslation = {
		0: t('dashboard.days.sun'),
		1: t('dashboard.days.mon'),
		2: t('dashboard.days.tue'),
		3: t('dashboard.days.wed'),
		4: t('dashboard.days.thu'),
		5: t('dashboard.days.fri'),
		6: t('dashboard.days.sat'),
	};

	// Custom tooltip for heatmap
	const renderTooltip = useCallback((day: any) => {
		if (!day) return null;
		const date = format(day.date, 'MMM d, yyyy');
		const minutes = Math.round(day.activity);

		// Find projects for this day
		const dayProjects: Record<string, number> = {};

		entriesToUse.forEach((entry) => {
			try {
				const entryStartTime = entry.startTime instanceof Date
					? entry.startTime
					: parseISO(entry.startTime.toString());

				const entryDate = format(entryStartTime, 'yyyy-MM-dd');

				if (entryDate === day.dateString) {
					const projectId = entry.project;
					const project = projects.find((p) => p.id === projectId);
					const projectName = project?.name || 'Unknown Project';

					if (!dayProjects[projectName]) {
						dayProjects[projectName] = 0;
					}
					dayProjects[projectName] += entry.duration / (1000 * 60);
				}
			} catch (error) {
				console.error('Error processing entry for tooltip:', error);
			}
		});

		return (
			<div className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-md text-xs">
				<div className="font-medium">{date}</div>
				<div className="text-gray-700 dark:text-gray-300">{minutes} min total</div>
				{Object.entries(dayProjects).length > 0 && (
					<div className="mt-1 pt-1 border-t border-gray-100 dark:border-gray-700">
						{Object.entries(dayProjects).map(([project, mins]) => (
							<div key={project} className="flex justify-between">
								<span className="mr-2">{project}:</span>
								<span className="font-medium">{Math.round(mins)} min</span>
							</div>
						))}
					</div>
				)}
			</div>
		);
	}, [entriesToUse, projects]);

	// Custom tooltip for pie chart
	const CustomTooltip = useCallback(({ active, payload }: any) => {
		if (!active || !payload || !payload.length) return null;

		const data = payload[0].payload;

		return (
			<div className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-md text-xs">
				<p className="font-medium text-gray-900 dark:text-white">{data.name}</p>
				<p className="text-gray-700 dark:text-gray-300">
					{data.value} min ({Math.round(data.percent * 100)}%)
				</p>
			</div>
		);
	}, []);

	// Format time for better display
	const formatTime = useCallback((milliseconds: number) => {
		const minutes = Math.round(milliseconds);
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;

		if (hours > 0) {
			return `${hours}h ${remainingMinutes}m`;
		}
		return `${minutes}m`;
	}, []);

	// Detect dark mode for pie chart colors
	const isDarkMode = typeof window !== 'undefined'
		? document.documentElement.classList.contains('dark')
		: false;

	return (
		<div className="w-full">
			<div className="flex flex-col sm:flex-row gap-6">
				{/* Today's Projects Pie Chart - AUMENTADO DE TAMAÑO */}
				<div className="w-full sm:w-1/3">
					<h3 className="text-xs font-medium text-gray-900 dark:text-white mb-1 text-center">
						{format(new Date(), 'MMM d')}
					</h3>

					{todaysPieData.length > 0 ? (
						<>
							<div className="h-44">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={todaysPieData}
											dataKey="value"
											h-6eKey="name"
											cx="50%"
											cy="50%"
											innerRadius={45}
											outerRadius={65}
											paddingAngle={1}
											isAnimationActive={false}
										>
											{todaysPieData.map((entry, index) => (
												<Cell
													key={`cell-${entry.id}`}
													fill={getPieChartColor(index, todaysPieData.length, isDarkMode)}
													stroke="none"
												/>
											))}
										</Pie>
										<Tooltip content={<CustomTooltip />} />
									</PieChart>
								</ResponsiveContainer>
							</div>

							<div className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">
								{totalMinutesToday > 0 ? formatTime(totalMinutesToday) : 'No time recorded'}
							</div>

							{/* Simple legend */}
							<div className="mt-2 text-xs space-y-1 max-h-40 overflow-y-auto">
								{todaysPieData.map((entry, index) => (
									<div key={entry.id} className="flex items-center justify-between">
										<div className="flex items-center truncate max-w-[70%]">
											<div
												className="w-2 h-2 rounded-full mr-1 flex-shrink-0"
												style={{ backgroundColor: getPieChartColor(index, todaysPieData.length, isDarkMode) }}
											/>
											<span className="truncate">{entry.name}</span>
										</div>
										<span className="flex-shrink-0">{formatTime(entry.value)}</span>
									</div>
								))}
							</div>
						</>
					) : (
						<div className="flex items-center justify-center h-64 w-full bg-gray-50 dark:bg-gray-800 rounded-md">
							<p className="text-xs text-gray-500 dark:text-gray-400 text-center">
								{t('dashboard.noDataToday')}
							</p>
						</div>
					)}
				</div>

				{/* Activity Heatmap */}
				<div className="w-full sm:w-2/3">
					<div className="flex flex-col items-center">
						<div className="overflow-x-auto pb-4 max-w-full">
							<div
								className="inline-grid"
								style={{
									gridTemplateColumns: `auto repeat(${numCols}, ${cellSize}px)`,
									gridTemplateRows: `auto repeat(7, ${cellSize}px)`,
									gap: '2px',
								}}
							>
								{/* Top left empty cell */}
								<div className="w-6"></div>

								{/* Date labels at top */}
								{Array.from({ length: numCols }).map((_, colIndex) => {
									if (
										colIndex % 4 === 0 &&
										calendarData[1] &&
										calendarData[1][colIndex]
									) {
										return (
											<div
												key={`date-${colIndex}`}
												className="text-center text-gray-500 dark:text-gray-400 mb-1"
												style={{ fontSize: '9px' }}
											>
												{format(calendarData[1][colIndex].date, 'MMM d')}
											</div>
										);
									}
									return <div key={`date-${colIndex}`}></div>;
								})}

								{/* Day rows with labels */}
								{[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => (
									<React.Fragment key={`row-${dayOfWeek}`}>
										<div
											className="flex items-center justify-end pr-1 text-gray-500 dark:text-gray-400"
											style={{ fontSize: '9px' }}
										>
											{daysTranslation[dayOfWeek]}
										</div>

										{Array.from({ length: numCols }).map((_, colIndex) => {
											const day =
												calendarData[dayOfWeek] &&
												calendarData[dayOfWeek][colIndex];

											if (!day)
												return (
													<div
														key={`cell-${dayOfWeek}-${colIndex}`}
														className="bg-transparent"
														style={{
															width: `${cellSize}px`,
															height: `${cellSize}px`,
														}}
													/>
												);

											const isHovered =
												hoveredDay === `${dayOfWeek}-${colIndex}`;
											return (
												<div
													key={`cell-${dayOfWeek}-${colIndex}`}
													className={`${getGitHubActivityColor(day.activity, isHovered)} rounded-sm relative group transition-colors`}
													style={{
														width: `${cellSize}px`,
														height: `${cellSize}px`,
													}}
													onMouseEnter={() =>
														setHoveredDay(`${dayOfWeek}-${colIndex}`)
													}
													onMouseLeave={() => setHoveredDay(null)}
												>
													<div className="hidden group-hover:block absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
														{renderTooltip(day)}
													</div>
												</div>
											);
										})}
									</React.Fragment>
								))}
							</div>
						</div>

						{/* Legend - GitHub style */}
						<div
							className="flex items-center mt-4 justify-center text-gray-500 dark:text-gray-400"
							style={{ fontSize: '9px' }}
						>
							<span>{t('dashboard.less')}</span>
							<div className="flex mx-2 space-x-1 items-center">
								<div className="h-2 w-2 bg-gray-100 dark:bg-gray-700 rounded-sm"></div>
								<div className="h-2.5 w-2.5 bg-[#ebedf0] dark:bg-[#0e4429] rounded-sm"></div>
								<div className="h-3 w-3 bg-[#9be9a8] dark:bg-[#006d32] rounded-sm"></div>
								<div className="h-3.5 w-3.5 bg-[#40c463] dark:bg-[#26a641] rounded-sm"></div>
								<div className="h-4 w-4 bg-[#30a14e] dark:bg-[#39d353] rounded-sm"></div>
							</div>
							<span>{t('dashboard.more')}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
