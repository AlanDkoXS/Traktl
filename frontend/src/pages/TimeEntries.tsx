import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TimeEntryList } from '../components/TimeEntryList';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useProjectStore } from '../store/projectStore';
import { format, subDays } from 'date-fns';
import { useTimeEntryStore } from '../store/timeEntryStore';

export const TimeEntries = () => {
	const { t } = useTranslation();
	const { projects, fetchProjects } = useProjectStore();
	const { fetchTimeEntries } = useTimeEntryStore();

	const [projectId, setProjectId] = useState<string>('');
	const [startDate, setStartDate] = useState<string>(
		format(subDays(new Date(), 7), 'yyyy-MM-dd')
	);
	const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
	const [showFilters, setShowFilters] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);

	// Load projects on mount
	useEffect(() => {
		fetchProjects();
	}, [fetchProjects]);

	// Initial load of time entries
	useEffect(() => {
		console.log('TimeEntries: Initial load');
		const loadInitialData = async () => {
			try {
				await fetchTimeEntries(
					projectId || undefined,
					undefined,
					startDate ? new Date(startDate) : undefined,
					endDate ? new Date(endDate) : undefined
				);
			} catch (error) {
				console.error('Error loading initial time entries:', error);
			}
		};
		
		loadInitialData();
	}, [fetchTimeEntries, refreshKey]);

	// Handle filter changes
	const applyFilters = () => {
		console.log('Applying filters:', { projectId, startDate, endDate });
		setRefreshKey(prevKey => prevKey + 1);
	};

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
					{t('timeEntries.title')}
				</h1>
				<div className="flex space-x-2">
					<button
						onClick={() => setShowFilters(!showFilters)}
						className="btn btn-secondary"
					>
						<FunnelIcon className="h-5 w-5 mr-1" />
						{t('common.filter')}
					</button>
					<Link to="/time-entries/new" className="btn btn-primary">
						<PlusIcon className="h-5 w-5 mr-1" />
						{t('timeEntries.new')}
					</Link>
				</div>
			</div>

			{showFilters && (
				<div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow mb-6">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<div>
							<label
								htmlFor="projectFilter"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								{t('timeEntries.project')}
							</label>
							<select
								id="projectFilter"
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

						<div>
							<label
								htmlFor="startDateFilter"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								{t('timeEntries.startDate')}
							</label>
							<input
								type="date"
								id="startDateFilter"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
							/>
						</div>

						<div>
							<label
								htmlFor="endDateFilter"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								{t('timeEntries.endDate')}
							</label>
							<input
								type="date"
								id="endDateFilter"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
							/>
						</div>
					</div>
					
					<div className="mt-4 flex justify-end">
						<button 
							onClick={applyFilters}
							className="btn btn-primary"
						>
							{t('common.filter')}
						</button>
					</div>
				</div>
			)}

			<TimeEntryList
				key={refreshKey}
				projectId={projectId || undefined}
				startDate={startDate ? new Date(startDate) : undefined}
				endDate={endDate ? new Date(endDate) : undefined}
			/>
		</div>
	);
};
