import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '../store/projectStore'
import { useTimeEntryStore } from '../store/timeEntryStore'
import { format, subDays, differenceInDays } from 'date-fns'
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from 'recharts'

export const Reports = () => {
	const { t } = useTranslation()
	const { projects, fetchProjects } = useProjectStore()
	const { timeEntries, fetchTimeEntries, isLoading, error } =
		useTimeEntryStore()

	const [startDate, setStartDate] = useState(
		format(subDays(new Date(), 30), 'yyyy-MM-dd'),
	)
	const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
	const [projectId, setProjectId] = useState('')
	const [filterKey, setFilterKey] = useState(0)

	// Load initial data
	useEffect(() => {
		const loadData = async () => {
			try {
				await fetchProjects()
				await fetchTimeEntries(
					projectId || undefined,
					undefined,
					startDate ? new Date(startDate + 'T00:00:00') : undefined,
					endDate ? new Date(endDate + 'T23:59:59.999') : undefined,
				)
			} catch (err) {
				console.error('Error loading reports data:', err)
			}
		}

		loadData()
	}, [
		fetchProjects,
		fetchTimeEntries,
		projectId,
		startDate,
		endDate,
		filterKey,
	])

	// Apply filters
	const applyFilters = () => {
		setFilterKey((prev) => prev + 1)
	}

	// Calculate total time spent
	const totalTime = timeEntries.reduce(
		(acc, entry) => acc + entry.duration,
		0,
	)

	// Format time (milliseconds to hours and minutes)
	const formatTime = (milliseconds: number) => {
		const hours = Math.floor(milliseconds / (1000 * 60 * 60))
		const minutes = Math.floor(
			(milliseconds % (1000 * 60 * 60)) / (1000 * 60),
		)
		return `${hours}h ${minutes}m`
	}

	// Group time entries by project for pie chart
	const timeByProjectData = useMemo(() => {
		// Group by project
		const groupedByProject = timeEntries.reduce(
			(acc: Record<string, number>, entry) => {
				const projectId = entry.project
				if (!acc[projectId]) {
					acc[projectId] = 0
				}
				acc[projectId] += entry.duration
				return acc
			},
			{},
		)

		// Convert to chart data format
		return Object.entries(groupedByProject)
			.map(([projectId, duration]) => {
				const project = projects.find((p) => p.id === projectId)
				return {
					name: project?.name || 'Unknown Project',
					value: duration,
					color: project?.color || '#cccccc',
				}
			})
			.sort((a, b) => b.value - a.value) // Sort by duration (descending)
	}, [timeEntries, projects])

	// Group time entries by day and project for line chart
	const timeByDayAndProjectData = useMemo(() => {
		if (!startDate || !endDate) return { dayData: [], projectsData: [] }

		const start = new Date(startDate + 'T00:00:00')
		const end = new Date(endDate + 'T23:59:59')
		const days = differenceInDays(end, start) + 1

		// Initialize day data structure
		const daysArray = []
		for (let i = 0; i < days; i++) {
			const currentDate = new Date(start)
			currentDate.setDate(start.getDate() + i)
			const dateString = format(currentDate, 'yyyy-MM-dd')
			const displayDate = format(currentDate, 'MMM dd')

			daysArray.push({
				date: dateString,
				displayDate,
				// We'll add project data here later
			})
		}

		// Track projects and their time per day
		const projectTimeByDay: Record<string, Record<string, number>> = {}
		const projectInfo: Record<string, { name: string; color: string }> = {}

		// Group time entries by project and day
		timeEntries.forEach((entry) => {
			const projectId = entry.project
			const day = format(new Date(entry.startTime), 'yyyy-MM-dd')
			const project = projects.find((p) => p.id === projectId)

			// Store project info for later use
			if (project && !projectInfo[projectId]) {
				projectInfo[projectId] = {
					name: project.name,
					color: project.color,
				}
			}

			// Initialize project object if needed
			if (!projectTimeByDay[projectId]) {
				projectTimeByDay[projectId] = {}
			}

			// Add time to the appropriate day
			if (!projectTimeByDay[projectId][day]) {
				projectTimeByDay[projectId][day] = 0
			}

			projectTimeByDay[projectId][day] += entry.duration
		})

		// For each day, add all project data
		const result = daysArray.map((day) => {
			const dayData: { [key: string]: number | string } = {
				date: day.date,
				displayDate: day.displayDate,
				// For total minutes across all projects
				totalMinutes: 0 as number,
			}

			// Add data for each project
			Object.entries(projectTimeByDay).forEach(
				([projectId, projectDays]) => {
					const projectMinutes = Math.round(
						(projectDays[day.date] || 0) / (1000 * 60),
					)
					dayData[projectId] = projectMinutes
					dayData.totalMinutes =
						(dayData.totalMinutes as number) + projectMinutes
				},
			)

			return dayData
		})

		// Create project metadata for creating lines
		const projectsData = Object.entries(projectInfo).map(([id, info]) => ({
			id,
			name: info.name,
			color: info.color,
		}))

		return {
			dayData: result,
			projectsData,
		}
	}, [timeEntries, startDate, endDate, projects])

	// Create a fallback color for the line chart
	const getDefaultLineColor = () => {
		return 'hsl(var(--color-project-hue), var(--color-project-saturation), var(--color-project-lightness))'
	}

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
							<option value="">
								{t('timeEntries.allProjects')}
							</option>
							{projects.map((project) => (
								<option key={project.id} value={project.id}>
									{project.name}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="mt-4 flex justify-end">
					<button
						onClick={applyFilters}
						className="btn btn-primary dynamic-bg text-white"
					>
						{t('common.filter')}
					</button>
				</div>
			</div>

			{isLoading ? (
				<div className="flex justify-center items-center py-4 bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] rounded-lg p-6 border border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
					<div className="animate-spin rounded-full h-6 w-6 border-b-2 dynamic-border"></div>
					<span className="ml-2 dynamic-color">
						{t('common.loading')}
					</span>
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
									{timeByDayAndProjectData.dayData.length > 0
										? formatTime(
												totalTime /
													timeByDayAndProjectData
														.dayData.length,
											)
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
									<ResponsiveContainer
										width="100%"
										height="100%"
									>
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
												paddingAngle={3}
												stroke="none"
											>
												{timeByProjectData.map(
													(entry, index) => (
														<Cell
															key={`cell-${index}`}
															fill={entry.color}
														/>
													),
												)}
											</Pie>
											<Tooltip
												formatter={(value) =>
													formatTime(Number(value))
												}
											/>
										</PieChart>
									</ResponsiveContainer>
								</div>

								{/* Table */}
								<div className="overflow-x-auto rounded-lg shadow-sm">
									<table className="shadow-sm min-w-full divide-y divide-gray-200 dark:divide-gray-700">
										<thead className="dynamic-bg-subtle dark:dynamic-bg-subtle">
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
											{timeByProjectData.map(
												(entry, index) => {
													const percentage =
														totalTime > 0
															? (
																	(entry.value /
																		totalTime) *
																	100
																).toFixed(1)
															: '0'

													return (
														<tr key={index}>
															<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
																<div className="flex items-center">
																	<div
																		className={`w-3 h-3 rounded-full mr-2 ${entry.color}`}
																	/>
																	{entry.name}
																</div>
															</td>
															<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
																{formatTime(
																	entry.value,
																)}
															</td>
															<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
																{percentage}%
															</td>
														</tr>
													)
												},
											)}
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
						{timeByDayAndProjectData.dayData.length > 0 ? (
							<div className="h-80">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart
										data={timeByDayAndProjectData.dayData}
										margin={{
											top: 20,
											right: 30,
											left: 0,
											bottom: 60,
										}}
									>
										<XAxis
											dataKey="displayDate"
											angle={-45}
											textAnchor="end"
											height={60}
											interval={0}
											axisLine={false}
											tickLine={false}
										/>
										<YAxis
											axisLine={false}
											tickLine={false}
											label={{
												value: 'Minutes',
												angle: -90,
												position: 'insideLeft',
												style: { textAnchor: 'middle' },
											}}
										/>
										<Tooltip
											formatter={(value, name) => {
												if (name === 'totalMinutes')
													return [
														`${value} min`,
														'Total',
													]
												// Find project name for this id
												const project =
													timeByDayAndProjectData.projectsData.find(
														(p) => p.id === name,
													)
												return [
													`${value} min`,
													project?.name || name,
												]
											}}
											labelFormatter={(label) =>
												`Date: ${label}`
											}
										/>
										<Legend
											verticalAlign="top"
											formatter={(value) => {
												if (value === 'totalMinutes')
													return 'Total'
												// Find project name for this dataKey
												const project =
													timeByDayAndProjectData.projectsData.find(
														(p) => p.id === value,
													)
												return project?.name || value
											}}
										/>

										{/* First show total line if not filtering by project */}
										{!projectId && (
											<Line
												name="totalMinutes"
												type="monotone"
												dataKey="totalMinutes"
												stroke={getDefaultLineColor()}
												strokeWidth={3}
												dot={{
													stroke: getDefaultLineColor(),
													strokeWidth: 2,
													r: 4,
												}}
												activeDot={{ r: 6 }}
											/>
										)}

										{/* Then show individual project lines */}
										{timeByDayAndProjectData.projectsData
											.filter(
												(project) =>
													!projectId ||
													project.id === projectId,
											)
											.map((project) => (
												<Line
													key={project.id}
													name={project.id}
													type="monotone"
													dataKey={project.id}
													stroke={project.color}
													strokeWidth={2}
													dot={{
														stroke: project.color,
														strokeWidth: 2,
														r: 3,
													}}
													activeDot={{ r: 5 }}
												/>
											))}
									</LineChart>
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
	)
}
