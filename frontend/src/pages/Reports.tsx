import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/projectStore';
import { useTimeEntryStore } from '../store/timeEntryStore';
import { format, subDays, parseISO, differenceInDays } from 'date-fns';

export const Reports = () => {
	const { t } = useTranslation();
	const { projects, fetchProjects } = useProjectStore();
	const { timeEntries, fetchTimeEntries } = useTimeEntryStore();

	const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
	const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
	const [projectId, setProjectId] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		fetchProjects();
	}, [fetchProjects]);

	useEffect(() => {
		const loadData = async () => {
			setIsLoading(true);
			try {
				await fetchTimeEntries(
					projectId || undefined,
					undefined,
					startDate ? new Date(startDate) : undefined,
					endDate ? new Date(endDate) : undefined
				);
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [fetchTimeEntries, startDate, endDate, projectId]);

	// Calculate total time spent
	const totalTime = timeEntries.reduce((acc, entry) => acc + entry.duration, 0);

	// Format time (milliseconds to hours and minutes)
	const formatTime = (milliseconds: number) => {
		const hours = Math.floor(milliseconds / (1000 * 60 * 60));
		const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
		return `${hours}h ${minutes}m`;
	};

	// Group time entries by project
	const timeByProject = timeEntries.reduce((acc: Record<string, number>, entry) => {
		const projectId = entry.project;
		if (!acc[projectId]) {
			acc[projectId] = 0;
		}
		acc[projectId] += entry.duration;
		return acc;
	}, {});

	// Group time entries by day
	const timeByDay = timeEntries.reduce((acc: Record<string, number>, entry) => {
		const day = format(new Date(entry.startTime), 'yyyy-MM-dd');
		if (!acc[day]) {
			acc[day] = 0;
		}
		acc[day] += entry.duration;
		return acc;
	}, {});

	// Fill in missing days with zero values
	const fillMissingDays = () => {
		if (!startDate || !endDate) return {};

		const start = new Date(startDate);
		const end = new Date(endDate);
		const days = differenceInDays(end, start) + 1;
		const result: Record<string, number> = {};

		for (let i = 0; i < days; i++) {
			const day = format(new Date(start.getTime() + i * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
			result[day] = timeByDay[day] || 0;
		}

		return result;
	};

	const filledTimeByDay = fillMissingDays();

	return (
		<div>
			<h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
				{t('nav.reports')}
			</h1>

			{/* Filters */}
			<div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow mb-6">
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
			</div>

			{isLoading ? (
				<div className="text-center py-4">{t('common.loading')}</div>
			) : (
				<div className="space-y-6">
					{/* Summary */}
					<div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
						<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
							{t('reports.summary')}
						</h2>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
								<p className="text-sm text-gray-500 dark:text-gray-400">
									{t('reports.totalTime')}
								</p>
								<p className="text-2xl font-semibold text-gray-900 dark:text-white">
									{formatTime(totalTime)}
								</p>
							</div>
							<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
								<p className="text-sm text-gray-500 dark:text-gray-400">
									{t('reports.entries')}
								</p>
								<p className="text-2xl font-semibold text-gray-900 dark:text-white">
									{timeEntries.length}
								</p>
							</div>
							<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
								<p className="text-sm text-gray-500 dark:text-gray-400">
									{t('reports.avgDaily')}
								</p>
								<p className="text-2xl font-semibold text-gray-900 dark:text-white">
									{Object.keys(filledTimeByDay).length > 0
										? formatTime(
												totalTime / Object.keys(filledTimeByDay).length
											)
										: '0h 0m'}
								</p>
							</div>
						</div>
					</div>

					{/* Time by Project */}
					<div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
						<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
							{t('reports.timeByProject')}
						</h2>
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
									{Object.entries(timeByProject).map(([projId, time]) => {
										const project = projects.find((p) => p.id === projId);
										const percentage =
											totalTime > 0
												? ((time / totalTime) * 100).toFixed(1)
												: '0';

										return (
											<tr key={projId}>
												<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
													{project?.name || projId}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
													{formatTime(time)}
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

					{/* Time by Day */}
					<div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
						<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
							{t('reports.timeByDay')}
						</h2>
						<div className="h-64">
							<div className="flex h-full items-end space-x-2">
								{Object.entries(filledTimeByDay).map(([day, time]) => {
									const maxHeight = Math.max(...Object.values(filledTimeByDay));
									const height = maxHeight > 0 ? (time / maxHeight) * 100 : 0;

									return (
										<div
											key={day}
											className="flex-1 flex flex-col items-center"
										>
											<div
												className="w-full bg-primary-500 dark:bg-primary-600 rounded-t"
												style={{ height: `${Math.max(height, 1)}%` }}
											/>
											<div className="text-xs text-gray-500 dark:text-gray-400 mt-1 transform -rotate-45 origin-top-left">
												{format(parseISO(day), 'MMM dd')}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
