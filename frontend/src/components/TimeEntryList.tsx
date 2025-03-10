import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTimeEntryStore } from '../store/timeEntryStore';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface TimeEntryListProps {
	projectId?: string;
	taskId?: string;
	startDate?: Date;
	endDate?: Date;
}

export const TimeEntryList = ({ projectId, taskId, startDate, endDate }: TimeEntryListProps) => {
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
		const remainingSeconds = seconds % 60;

		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
	};

	if (isLoading) {
		return <div className="text-center py-4">{t('common.loading')}</div>;
	}

	if (error) {
		return (
			<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-md">
				{error}
			</div>
		);
	}

	if (timeEntries.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500 dark:text-gray-400 mb-4">
					{t('timeEntries.noEntries')}
				</p>
				<Link to="/time-entries/new" className="btn btn-primary">
					{t('timeEntries.new')}
				</Link>
			</div>
		);
	}

	return (
		<div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
			<ul className="divide-y divide-gray-200 dark:divide-gray-700">
				{timeEntries.map((entry) => (
					<li key={entry.id}>
						<Link
							to={`/time-entries/${entry.id}`}
							className="block hover:bg-gray-50 dark:hover:bg-gray-700"
						>
							<div className="px-4 py-4 flex items-center sm:px-6">
								<div className="min-w-0 flex-1">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-primary-600 dark:text-primary-400">
												{entry.project}
											</p>
											{entry.task && (
												<p className="text-xs text-gray-500 dark:text-gray-400">
													{entry.task}
												</p>
											)}
										</div>
										<div className="ml-2 flex-shrink-0 flex">
											{entry.isRunning ? (
												<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
													{t('timeEntries.running')}
												</span>
											) : (
												<span className="text-sm text-gray-700 dark:text-gray-300">
													{formatDuration(entry.duration)}
												</span>
											)}
										</div>
									</div>
									<div className="mt-2 flex justify-between">
										<div className="text-sm text-gray-500 dark:text-gray-400">
											<span>
												{format(
													new Date(entry.startTime),
													'MMM dd, yyyy HH:mm'
												)}
											</span>
											{entry.endTime && !entry.isRunning && (
												<span>
													{' '}
													- {format(new Date(entry.endTime), 'HH:mm')}
												</span>
											)}
										</div>

										{entry.notes && (
											<div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
												{entry.notes}
											</div>
										)}
									</div>
								</div>
							</div>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
};
