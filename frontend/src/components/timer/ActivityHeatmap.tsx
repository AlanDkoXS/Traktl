import React, { useEffect, useState, useMemo } from 'react';
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

	// Generate calendar grid
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
		const entriesToUse = timeEntries.length > 0 ? timeEntries : storeTimeEntries;

		entriesToUse.forEach((entry) => {
			try {
				const dateString = format(new Date(entry.startTime), 'yyyy-MM-dd');
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
	}, [timeEntries, storeTimeEntries]);

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

	// Get today's pie data
	const todaysPieData = useMemo(() => {
		const today = new Date().toISOString().split('T')[0];
		const entriesToUse = timeEntries.length > 0 ? timeEntries : storeTimeEntries;
		const todayEntries = entriesToUse.filter(
			(entry) => format(new Date(entry.startTime), 'yyyy-MM-dd') === today
		);

		const projectTimeMap: Record<string, number> = {};

		todayEntries.forEach((entry) => {
			if (!projectTimeMap[entry.project]) {
				projectTimeMap[entry.project] = 0;
			}
			projectTimeMap[entry.project] += entry.duration / (1000 * 60);
		});

		// Calculate total to determine percentages
		const total = Object.values(projectTimeMap).reduce((sum, mins) => sum + mins, 0);

		const result = Object.entries(projectTimeMap).map(([projectId, duration]) => {
			const project = projects.find((p) => p.id === projectId);
			const percent = total > 0 ? duration / total : 0;

			return {
				id: projectId,
				name: project?.name || 'Unknown Project',
				value: Math.round(duration),
				percent: percent,
				color: project?.color || '#ccc',
			};
		});

		// Sort by percentage (highest first to assign colors)
		return result.sort((a, b) => b.percent - a.percent);
	}, [timeEntries, storeTimeEntries, projects]);

	const totalMinutesToday = todaysPieData.reduce((sum, item) => sum + item.value, 0);

	// GitHub-style activity colors
	const getGitHubActivityColor = (minutes: number, isHovered: boolean) => {
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
	};

	// Get GitHub-style colors for pie chart (grayscale to green)
	const getGitHubPieColor = (index: number, totalItems: number) => {
		// GitHub-inspired color palette for the pie chart
		const GITHUB_COLORS = [
			'#216e39', // darkest green
			'#30a14e',
			'#40c463',
			'#9be9a8', // lightest green
			'#ebedf0', // gray
		];

		// For less important slices (low percentage), use gray
		if (index >= 4) return '#ebedf0';
		return GITHUB_COLORS[index];
	};

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
	const renderTooltip = (day: any) => {
		if (!day) return null;
		const date = format(day.date, 'MMM d, yyyy');
		const minutes = Math.round(day.activity);

		// Find projects for this day
		const dayProjects: Record<string, number> = {};
		const entriesToUse = timeEntries.length > 0 ? timeEntries : storeTimeEntries;

		entriesToUse.forEach((entry) => {
			const entryDate = format(new Date(entry.startTime), 'yyyy-MM-dd');
			if (entryDate === day.dateString) {
				const projectId = entry.project;
				const project = projects.find((p) => p.id === projectId);
				const projectName = project?.name || 'Unknown Project';

				if (!dayProjects[projectName]) {
					dayProjects[projectName] = 0;
				}
				dayProjects[projectName] += entry.duration / (1000 * 60);
			}
		});

		return (
			<div className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-md text-xs">
				<div className="font-medium">{date}</div>
				<div className="text-gray-700 dark:text-gray-300">{minutes} min total</div>
				{Object.entries(dayProjects).length > 0 && (
					<div className="mt-1 pt-1">
						{Object.entries(dayProjects).map(([project, mins]) => (
							<div key={project} className="flex justify-between">
								<span>{project}:</span>
								<span className="ml-2 font-medium">{Math.round(mins)} min</span>
							</div>
						))}
					</div>
				)}
			</div>
		);
	};

	// Custom tooltip for pie chart
	const CustomTooltip = ({ active, payload }: any) => {
		if ((active && payload && payload.length) || hoveredLabel || tooltipData) {
			const data = hoveredLabel
				? todaysPieData.find((item) => item.id === hoveredLabel)
				: tooltipData
					? tooltipData.data
					: payload?.[0]?.payload;

			if (!data) return null;

			const style = tooltipData
				? ({
						position: 'absolute',
						left: `${tooltipData.x}px`,
						top: `${tooltipData.y}px`,
						transform: 'translate(-50%, -100%)',
						zIndex: 100,
					} as React.CSSProperties)
				: {};

			return (
				<div
					className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-md text-xs"
					style={style}
				>
					<p className="font-medium text-gray-900 dark:text-white">{data.name}</p>
					<p className="text-gray-700 dark:text-gray-300">
						{data.value} min ({Math.round(data.percent * 100)}%)
					</p>
				</div>
			);
		}
		return null;
	};

	// Custom label for pie chart
	const renderCustomizedLabel = ({
		cx,
		cy,
		midAngle,
		innerRadius,
		outerRadius,
		percent,
		index,
		name,
		value,
		payload,
	}) => {
		const RADIAN = Math.PI / 180;
		const radius = outerRadius * 1.3;
		const x = cx + radius * Math.cos(-midAngle * RADIAN);
		const y = cy + radius * Math.sin(-midAngle * RADIAN);

		// Truncate to 5 characters
		const shortName = name.length > 5 ? name.substring(0, 5) + '...' : name;

		const handleMouseMove = (e: React.MouseEvent) => {
			setTooltipData({
				x: e.clientX,
				y: e.clientY,
				data: payload,
			});
		};

		const handleMouseLeave = () => {
			setTooltipData(null);
		};

		return (
			<g
				onMouseEnter={() => setHoveredLabel(payload.id)}
				onMouseLeave={() => setHoveredLabel(null)}
				onMouseMove={handleMouseMove}
				onMouseOut={handleMouseLeave}
				style={{ cursor: 'pointer' }}
			>
				<text
					x={x}
					y={y}
					fill="#666"
					textAnchor={x > cx ? 'start' : 'end'}
					dominantBaseline="central"
					style={{ fontSize: '8px' }}
				>
					{shortName}
				</text>
				<text
					x={x}
					y={y + 10}
					fill="#666"
					textAnchor={x > cx ? 'start' : 'end'}
					dominantBaseline="central"
					style={{ fontSize: '8px', fontWeight: 'bold' }}
				>
					{(percent * 100).toFixed(0)}%
				</text>
			</g>
		);
	};

	return (
		<div className="w-full">
			<div className="flex flex-col sm:flex-row gap-6">
				{/* Today's Projects Pie Chart - Now first */}
				<div className="w-full sm:w-1/3">
					<h3 className="text-xs font-medium text-gray-900 dark:text-white mb-1 text-center">
						{format(new Date(), 'MMM d')}
					</h3>

					{todaysPieData.length > 0 ? (
						<>
							<div className="relative">
								<ResponsiveContainer width="100%" height={180}>
									<PieChart>
										<Pie
											data={todaysPieData}
											cx="50%"
											cy="50%"
											innerRadius={25}
											outerRadius={45}
											paddingAngle={2}
											dataKey="value"
											nameKey="name"
											stroke="none"
											strokeWidth={0}
											label={renderCustomizedLabel}
											labelLine={true}
										>
											{todaysPieData.map((entry, index) => (
												<Cell
													key={`cell-${index}`}
													fill={getGitHubPieColor(
														index,
														todaysPieData.length
													)}
													stroke="none"
												/>
											))}
										</Pie>
										<Tooltip content={<CustomTooltip />} />
									</PieChart>
								</ResponsiveContainer>
								{tooltipData && <CustomTooltip active={true} />}
							</div>

							<div className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">
								{totalMinutesToday > 0 ? `${totalMinutesToday} min total` : ''}
							</div>
						</>
					) : (
						<div className="flex items-center justify-center h-32 w-full bg-gray-50 dark:bg-gray-800 rounded-md">
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
