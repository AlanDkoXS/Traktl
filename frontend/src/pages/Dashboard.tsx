import { useTranslation } from 'react-i18next';
import { Timer } from '../components/Timer';
import { useProjectStore } from '../store/projectStore';
import { useClientStore } from '../store/clientStore';
import { useTaskStore } from '../store/taskStore';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export const Dashboard = () => {
	const { t } = useTranslation();
	const { projects, fetchProjects } = useProjectStore();
	const { clients, fetchClients } = useClientStore();
	const { tasks, fetchTasks } = useTaskStore();
	
	const [isLoading, setIsLoading] = useState(true);
	const [refreshCounter, setRefreshCounter] = useState(0);

	// Set up an interval to refresh the data periodically
	useEffect(() => {
		const interval = setInterval(() => {
			setRefreshCounter(prev => prev + 1);
		}, 30000); // Refresh every 30 seconds
		
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			await Promise.all([
				fetchProjects(),
				fetchClients(),
				fetchTasks()
			]);
			setIsLoading(false);
		};
		
		fetchData();
	}, [fetchProjects, fetchClients, fetchTasks, refreshCounter]);

	return (
		<div className="max-w-7xl mx-auto">
			<h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
				{t('nav.dashboard')}
			</h1>

			{/* Main dashboard content */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				{/* Left column - Timer */}
				<div className="lg:col-span-8">
					<Timer />
				</div>

				{/* Right column - Stats */}
				<div className="lg:col-span-4 space-y-6">
					{isLoading ? (
						<div className="flex items-center justify-center h-32">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
						</div>
					) : (
						<>
							{/* Stats */}
							<div className="grid grid-cols-2 gap-4">
								<StatsCard
									title={t('projects.title')}
									count={projects.length}
									link="/projects"
								/>
								<StatsCard
									title={t('clients.title')}
									count={clients.length}
									link="/clients"
								/>
								<StatsCard
									title={t('tasks.title')}
									count={tasks.length}
									link="/tasks"
								/>
								<StatsCard
									title={t('timeEntries.title')}
									count={0} // This would come from your time entries store
									link="/time-entries"
								/>
							</div>

							{/* Quick links */}
							<div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
								<div className="px-4 py-5 sm:p-6">
									<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
										{t('dashboard.quickLinks')}
									</h3>
									<nav className="space-y-1">
										<QuickLink
											href="/time-entries/new"
											title={t('timeEntries.new')}
										/>
										<QuickLink
											href="/projects/new"
											title={t('projects.new')}
										/>
										<QuickLink
											href="/tasks/new"
											title={t('tasks.new')}
										/>
										<QuickLink
											href="/clients/new"
											title={t('clients.new')}
										/>
										<QuickLink
											href="/reports"
											title={t('reports.title')}
										/>
									</nav>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

// Stats Card Component
const StatsCard = ({ title, count, link }) => {
	const { t } = useTranslation();
	
	return (
		<Link 
			to={link} 
			className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
		>
			<div className="flex flex-col h-full">
				<div className="font-medium text-gray-500 dark:text-gray-400 text-sm">
					{title}
				</div>
				<div className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
					{count}
				</div>
				<div className="mt-auto pt-2 text-xs text-primary-600 dark:text-primary-400 flex items-center">
					{t('common.viewAll')}
					<ArrowRightIcon className="ml-1 h-3 w-3" />
				</div>
			</div>
		</Link>
	);
};

// Quick Link Component
const QuickLink = ({ href, title }) => {
	return (
		<Link
			to={href}
			className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
		>
			<span>{title}</span>
			<ArrowRightIcon className="ml-auto h-4 w-4 text-gray-400" />
		</Link>
	);
};
