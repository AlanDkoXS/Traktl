import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/projectStore';
import { useTimeEntryStore } from '../store/timeEntryStore';
import { format, subDays, parseISO, differenceInDays } from 'date-fns';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from 'recharts';

export const Reports = () => {
	const { t } = useTranslation();
	const { projects, fetchProjects } = useProjectStore();
	const { timeEntries, fetchTimeEntries, isLoading, error } = useTimeEntryStore();

	const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
	const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
	const [projectId, setProjectId] = useState('');
	const [filterKey, setFilterKey] = useState(0);

	// Load initial data
	useEffect(() => {
		const loadData = async () => {
			try {
				await fetchProjects();
				await fetchTimeEntries(
					projectId || undefined,
					undefined,
					startDate ? new Date(startDate + 'T00:00:00') : undefined,
					endDate ? new Date(endDate + 'T23:59:59.999') : undefined
				);
			} catch (err) {
				console.error('Error loading reports data:', err);
			}
		};

		loadData();
	}, [fetchProjects, fetchTimeEntries, projectId, startDate, endDate, filterKey]);

	// Apply filters
	const applyFilters = () => {
		setFilterKey((prev) => prev + 1);
	};

	// Calculate total time spent
	const totalTime = timeEntries.reduce((acc, entry) => acc + entry.duration, 0);

	// Format time (milliseconds to hours and minutes)
	const formatTime = (milliseconds: number) => {
		const hours = Math.floor(milliseconds / (1000 * 60 * 60));
		const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
		return `${hours}h ${minutes}m`;
	};

	// Group time entries by project for pie chart
	const timeByProjectData = useMemo(() => {
		// Group by project
		const groupedByProject = timeEntries.reduce((acc: Record<string, number>, entry) => {
			const projectId = entry.project;
			if (!acc[projectId]) {
				acc[projectId] = 0;
			}
			acc[projectId] += entry.duration;
			return acc;
		}, {});

		// Convert to chart data format
		return Object.entries(groupedByProject)
			.map(([projectId, duration]) => {
				const project = projects.find((p) => p.id === projectId);
				return {
					name: project?.name || 'Unknown Project',
					value: duration,
					color: project?.color || '#cccccc',
				};
			})
			.sort((a, b) => b.value - a.value); // Sort by duration (descending)
	}, [timeEntries, projects]);

	// Group time entries by day for bar chart
	const timeByDayData = useMemo(() => {
		if (!startDate || !endDate) return [];

		const start = new Date(startDate);
		const end = new Date(endDate);
		const days = differenceInDays(end, start) + 1;
		const result = [];

		// Group by day
		const timeByDay = timeEntries.reduce((acc: Record<string, number>, entry) => {
			const day = format(new Date(entry.startTime), 'yyyy-MM-dd');
			if (!acc[day]) {
				acc[day] = 0;
			}
			acc[day] += entry.duration;
			return acc;
		}, {});

		// Create array of dates with values
		for (let i = 0; i < days; i++) {
			const currentDate = new Date(start);
			currentDate.setDate(start.getDate() + i);
			const dateString = format(currentDate, 'yyyy-MM-dd');
			const displayDate = format(currentDate, 'MMM dd');

			result.push({
				date: dateString,
				displayDate: displayDate,
				minutes: Math.round((timeByDay[dateString] || 0) / (1000 * 60)), // Convert to minutes
			});
		}

		return result;
	}, [timeEntries, startDate, endDate]);

	// Use the project colors for pie chart where available
	const getPieColors = () => {
		return timeByProjectData.map(entry => entry.color || '#cccccc');
	};

	return (
		<div>
			<h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 dynamic-color">
				{t('reports.title')}
			</h1>

			{/* Filters */}
			<div className="bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] p-4 rounded-md shadow-sm mb-6 border border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div>
						<label
							htmlFor="startDate"
							className="block text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							{t('timeEntries.startDate')}
						</label>
						<input
							type="date"
							id="startDate"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
						/>
					</div>

					<div>
						<label
							htmlFor="endDate"
							className="block text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							{t('timeEntries.endDate')}
						</label>
						<input
							type="date"
							id="endDate"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
						/>
					</div>

					<div>
						<label
							htmlFor="project"
							className="block text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							{t('timeEntries.project')}
						</label>
						<select
							id="project"
							value={projectId}
							onChange={(e) => setProjectId(e.target.value)}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
						>
							<option value="">{t('timeEntries.allProjects')}</option>
							{projects.map((project) => (
								<option key={project.id} value={project.id}>
									{project.name}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="mt-4 flex justify-end">
					<button onClick={applyFilters} className="btn btn-primary dynamic-bg text-white">
						{t('common.filter')}
					</button>
				</div>
			</div>

			{isLoading ? (
				<div className="flex justify-center items-center py-4 bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] rounded-lg p-6 border border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
					<div className="animate-spin rounded-full h-6 w-6 border-b-2 dynamic-border"></div>
					<span className="ml-2 dynamic-color">{t('common.loading')}</span>
				</div>
			) : error ? (
				<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-md">
					{error}
				</div>
			) : (
				<div className="space-y-6">
					{/* Summary */}
					<div className="bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
						<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 dynamic-color">
							{t('reports.summary')}
						</h2>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<div className="dynamic-bg-subtle p-4 rounded-md">
								<p className="text-sm text-gray-500 dark:text-gray-400">
									{t('reports.totalTime')}
								</p>
								<p className="text-2xl font-semibold text-gray-900 dark:text-white dynamic-color">
									{formatTime(totalTime)}
								</p>
							</div>
							<div className="dynamic-bg-subtle p-4 rounded-md">
								<p className="text-sm text-gray-500 dark:text-gray-400">
									{t('reports.entries')}
								</p>
								<p className="text-2xl font-semibold text-gray-900 dark:text-white dynamic-color">
									{timeEntries.length}
								</p>
							</div>
							<div className="dynamic-bg-subtle p-4 rounded-md">
								<p className="text-sm text-gray-500 dark:text-gray-400">
									{t('reports.avgDaily')}
								</p>
								<p className="text-2xl font-semibold text-gray-900 dark:text-white dynamic-color">
									{timeByDayData.length > 0
										? formatTime(totalTime / timeByDayData.length)
										: '0h 0m'}
								</p>
							</div>
						</div>
					</div>

					{/* Time by Project Chart */}
					<div className="bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
						<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 dynamic-color">
							{t('reports.timeByProject')}
						</h2>
						{timeByProjectData.length > 0 ? (
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								{/* Pie Chart */}
								<div className="h-64">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={timeByProjectData}
												cx="50%"
												cy="50%"
												labelLine={false}
												label={({ name, percent }) =>
													`${name}: ${(percent * 100).toFixed(0)}%`
												}
												outerRadius={80}
												fill="#8884d8"
												dataKey="value"
											>
												{timeByProjectData.map((entry, index) => (
													<Cell
														key={`cell-${index}`}
														fill={entry.color}
													/>
												))}
											</Pie>
											<Tooltip
												formatter={(value) => formatTime(Number(value))}
											/>
										</PieChart>
									</ResponsiveContainer>
								</div>

								{/* Table */}
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
										<thead className="bg-gray-50 dark:bg-gray-700">
											<tr>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
													{t('reports.project')}
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
													{t('reports.time')}
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
													{t('reports.percentage')}
												</th>
											</tr>
										</thead>
										<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
											{timeByProjectData.map((entry, index) => {
												const percentage =
													totalTime > 0
														? ((entry.value / totalTime) * 100).toFixed(
																1
															)
														: '0';

												return (
													<tr key={index}>
														<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
															<div className="flex items-center">
																<div
																	className="w-3 h-3 rounded-full mr-2"
																	style={{
																		backgroundColor:
																			entry.color
																	}}
																/>
																{entry.name}
															</div>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
															{formatTime(entry.value)}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
															{percentage}%
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							</div>
						) : (
							<p className="text-center text-gray-500 dark:text-gray-400 py-6">
								{t('common.noResults')}
							</p>
						)}
					</div>

					{/* Time by Day Chart */}
					<div className="bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
						<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 dynamic-color">
							{t('reports.timeByDay')}
						</h2>
						{timeByDayData.length > 0 ? (
							<div className="h-80">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={timeByDayData}
										margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis
											dataKey="displayDate"
											angle={-45}
											textAnchor="end"
											height={60}
											interval={0}
										/>
										<YAxis
											label={{
												value: 'Minutes',
												angle: -90,
												position: 'insideLeft',
											}}
										/>
										<Tooltip
											formatter={(value) => [`${value} min`, 'Time']}
											labelFormatter={(label) => `Date: ${label}`}
										/>
										<Legend />
										<Bar
											dataKey="minutes"
											name="Time (minutes)"
											fill="hsl(var(--color-project-hue), var(--color-project-saturation), var(--color-project-lightness))"
											radius={[4, 4, 0, 0]}
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						) : (
							<p className="text-center text-gray-500 dark:text-gray-400 py-6">
								{t('common.noResults')}
							</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
};
