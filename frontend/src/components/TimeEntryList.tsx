import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTimeEntryStore } from '../store/timeEntryStore';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ClockIcon } from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';

interface TimeEntryListProps {
	projectId?: string;
	taskId?: string;
	startDate?: Date;
	endDate?: Date;
	limit?: number;
}

export const TimeEntryList = ({ projectId, taskId, startDate, endDate, limit }: TimeEntryListProps) => {
	const { t } = useTranslation();
	const { timeEntries, isLoading, error, fetchTimeEntries } = useTimeEntryStore();

	useEffect(() => {
		fetchTimeEntries(projectId, taskId, startDate, endDate);
	}, [fetchTimeEntries, projectId, taskId, startDate, endDate]);

	// Helper function to format duration (milliseconds to human-readable)
	const formatDuration = (milliseconds: number) => {
		const seconds = Math.floor(milliseconds / 1000);
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		
		if (hours === 0) {
			return `${minutes}m`;
		}
		return `${hours}h ${minutes}m`;
	};

	if (isLoading) {
		return (
			<div className="text-center py-4 flex justify-center">
				<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
				<span className="ml-2">{t('common.loading')}</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md text-sm">
				{error}
			</div>
		);
	}

	if (timeEntries.length === 0) {
		return (
			<div className="text-center py-4">
				<p className="text-gray-500 dark:text-gray-400">
					{t('timeEntries.noEntries')}
				</p>
				<Link to="/time-entries/new" className="btn btn-primary mt-2 inline-flex">
					{t('timeEntries.new')}
				</Link>
			</div>
		);
	}

	// Limit the number of entries if specified
	const displayEntries = limit ? timeEntries.slice(0, limit) : timeEntries;

	return (
		<div className="space-y-2">
			{displayEntries.map((entry) => (
				<Link
					key={entry.id}
					to={`/time-entries/${entry.id}`}
					className="block bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-3 transition-colors"
				>
					<div className="flex items-center justify-between">
						<div className="flex items-center">
							{entry.isRunning ? (
								<div className="flex-shrink-0 h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
									<PlayIcon className="h-4 w-4 text-green-600 dark:text-green-300" />
								</div>
							) : (
								<div className="flex-shrink-0 h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
									<ClockIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
								</div>
							)}
							<div>
								<div className="font-medium text-gray-900 dark:text-white">
									{entry.project}
								</div>
								{entry.task && (
									<div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
										{entry.task}
									</div>
								)}
							</div>
						</div>
						<div className="text-right">
							<div className={`font-medium ${entry.isRunning ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
								{entry.isRunning ? (
									t('timeEntries.running')
								) : (
									formatDuration(entry.duration)
								)}
							</div>
							<div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
								{format(new Date(entry.startTime), 'MMM d, h:mm a')}
							</div>
						</div>
					</div>
					{entry.notes && (
						<div className="mt-2 text-sm text-gray-500 dark:text-gray-400 truncate">
							{entry.notes}
						</div>
					)}
				</Link>
			))}
			
			{limit && timeEntries.length > limit && (
				<Link 
					to="/time-entries" 
					className="block text-center text-sm text-primary-600 dark:text-primary-400 hover:underline p-2"
				>
					{t('common.viewAll')} ({timeEntries.length})
				</Link>
			)}
		</div>
	);
};
