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
		const weeksToShow = 21; // Increased from 13 to 21 (4 more on each side)

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

		return Object.entries(projectTimeMap).map(([projectId, duration]) => {
			const project = projects.find((p) => p.id === projectId);
			return {
				name: project?.name || 'Unknown Project',
				value: Math.round(duration),
				color: project?.color || '#ccc',
			};
		});
	}, [timeEntries, storeTimeEntries, projects]);

	const totalMinutesToday = todaysPieData.reduce((sum, item) => sum + item.value, 0);

	// Get color based on activity level (GitHub style)
	const getActivityColor = (minutes: number) => {
		if (minutes === 0) return 'bg-gray-100 dark:bg-gray-700';

		if (minutes <= maxActivity * 0.15) return 'bg-green-100 dark:bg-green-900';
		if (minutes <= maxActivity * 0.4) return 'bg-green-300 dark:bg-green-700';
		if (minutes <= maxActivity * 0.7) return 'bg-green-500 dark:bg-green-500';
		return 'bg-green-700 dark:bg-green-300';
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
		
		entriesToUse.forEach(entry => {
			const entryDate = format(new Date(entry.startTime), 'yyyy-MM-dd');
			if (entryDate === day.dateString) {
				const projectId = entry.project;
				const project = projects.find(p => p.id === projectId);
				const projectName = project?.name || 'Unknown Project';
				
				if (!dayProjects[projectName]) {
					dayProjects[projectName] = 0;
				}
				dayProjects[projectName] += entry.duration / (1000 * 60);
			}
		});
		
		return (
			<div className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-md border border-gray-200 dark:border-gray-700 text-xs">
				<div className="font-medium">{date}</div>
				<div className="text-gray-700 dark:text-gray-300">{minutes} min total</div>
				{Object.entries(dayProjects).length > 0 && (
					<div className="mt-1 border-t border-gray-200 dark:border-gray-700 pt-1">
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
		if (active && payload && payload.length) {
			return (
				<div className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-md border border-gray-200 dark:border-gray-700 text-xs">
					<p className="font-medium">{payload[0].name}</p>
					<p className="text-gray-700 dark:text-gray-300">
						{payload[0].value} min ({Math.round((payload[0].value / totalMinutesToday) * 100)}%)
					</p>
				</div>
			);
		}
		return null;
	};

	// Custom label for pie chart
	const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
		const RADIAN = Math.PI / 180;
		const radius = outerRadius * 1.4;
		const x = cx + radius * Math.cos(-midAngle * RADIAN);
		const y = cy + radius * Math.sin(-midAngle * RADIAN);
		
		return (
			<text 
				x={x} 
				y={y} 
				fill="#888"
				textAnchor={x > cx ? 'start' : 'end'} 
				dominantBaseline="central"
				className="text-xs"
			>
				{name} ({(percent * 100).toFixed(0)}%)
			</text>
		);
	};

	return (
		<div className="w-full">
			<div className="flex flex-col-reverse sm:flex-row gap-6">
				{/* Activity Heatmap */}
				<div className="w-full sm:w-2/3">
					<div className="flex flex-col items-center">
						<div
							style={{
								display: 'grid',
								gridTemplateColumns: `auto repeat(${numCols}, ${cellSize}px)`,
								gap: '2px',
							}}
							className="overflow-x-auto pb-4 max-w-full"
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
											className="text-xs text-center text-gray-500 dark:text-gray-400 mb-1"
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
									<div className="text-xs flex items-center justify-end pr-1 text-gray-500 dark:text-gray-400">
										{daysTranslation[dayOfWeek]}
									</div>

									{Array.from({ length: numCols }).map((_, colIndex) => {
										const day =
											calendarData[dayOfWeek] &&
											calendarData[dayOfWeek][colIndex];
											
										if (!day) return <div key={`cell-${dayOfWeek}-${colIndex}`} className="bg-transparent" style={{ width: `${cellSize}px`, height: `${cellSize}px` }} />;
										
										return (
											<div
												key={`cell-${dayOfWeek}-${colIndex}`}
												className={`${getActivityColor(day.activity)} rounded-sm relative group`}
												style={{
													width: `${cellSize}px`,
													height: `${cellSize}px`,
												}}
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

						{/* Legend - Centered horizontally */}
						<div className="flex items-center mt-4 justify-center text-xs text-gray-500 dark:text-gray-400">
							<span>{t('dashboard.less')}</span>
							<div className="flex mx-2 space-x-1 items-center">
								<div className="h-2 w-2 bg-gray-100 dark:bg-gray-700 rounded-sm"></div>
								<div className="h-2.5 w-2.5 bg-green-100 dark:bg-green-900 rounded-sm"></div>
								<div className="h-3 w-3 bg-green-300 dark:bg-green-700 rounded-sm"></div>
								<div className="h-3.5 w-3.5 bg-green-500 dark:bg-green-500 rounded-sm"></div>
								<div className="h-4 w-4 bg-green-700 dark:bg-green-300 rounded-sm"></div>
							</div>
							<span>{t('dashboard.more')}</span>
						</div>
					</div>
				</div>

				{/* Today's Projects Pie Chart - Now first on mobile */}
				<div className="w-full sm:w-1/3">
					<h3 className="text-xs font-medium text-gray-900 dark:text-white mb-1 text-center">
						{format(new Date(), 'MMM d')}
					</h3>

					{todaysPieData.length > 0 ? (
						<>
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
										strokeWidth={0}
										label={renderCustomizedLabel}
										labelLine={true}
									>
										{todaysPieData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip content={<CustomTooltip />} />
								</PieChart>
							</ResponsiveContainer>
							
							<div className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">
								{totalMinutesToday > 0 ? `${totalMinutesToday} min` : ''}
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
			</div>
		</div>
	);
};
