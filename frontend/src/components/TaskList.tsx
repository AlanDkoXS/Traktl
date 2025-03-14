import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTaskStore } from '../store/taskStore';
import { Link } from 'react-router-dom';

interface TaskListProps {
	projectId?: string;
}

export const TaskList = ({ projectId }: TaskListProps) => {
	const { t } = useTranslation();
	const { tasks, isLoading, error, fetchTasks } = useTaskStore();
	const [retryCount, setRetryCount] = useState(0);
	const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

	useEffect(() => {
		const loadTasks = async () => {
			try {
				await fetchTasks(projectId);
			} catch (err) {
				console.error('Error loading tasks:', err);
			}
		};

		loadTasks();
	}, [fetchTasks, projectId, retryCount]);

	const handleRetry = () => {
		setRetryCount((prev) => prev + 1);
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-4">
				<div className="animate-spin rounded-full h-6 w-6 border-b-2 dynamic-border"></div>
				<span className="ml-2 dynamic-color">{t('common.loading')}</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-md">
				<p className="mb-2">{error}</p>
				<button
					onClick={handleRetry}
					className="text-sm underline hover:text-red-600 dark:hover:text-red-300"
				>
					{t('common.retry')}
				</button>
			</div>
		);
	}

	if (tasks.length === 0) {
		return (
			<div className="text-center py-8 bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] rounded-lg p-6 border border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
				<p className="text-gray-500 dark:text-gray-400 mb-4">{t('tasks.noTasks')}</p>
				<Link
					to={projectId ? `/tasks/new?projectId=${projectId}` : '/tasks/new'}
					className="btn btn-primary dynamic-bg text-white"
				>
					{t('tasks.new')}
				</Link>
			</div>
		);
	}

	return (
		<div className="bg-white dark:bg-[rgb(var(--color-bg-inset))] shadow-sm overflow-hidden rounded-lg border border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
			<ul className="divide-y divide-gray-200 dark:divide-[rgb(var(--color-border-primary))]">
				{tasks.map((task) => (
					<li key={task.id}>
						<Link
							to={`/tasks/${task.id}`}
							className={`block hover:bg-gray-50 dark:hover:bg-[rgb(var(--color-bg-overlay))] transition-colors ${
								hoveredTaskId === task.id
									? 'bg-gray-50 dark:bg-[rgb(var(--color-bg-overlay))]'
									: ''
							}`}
							onMouseEnter={() => setHoveredTaskId(task.id)}
							onMouseLeave={() => setHoveredTaskId(null)}
						>
							<div className="px-4 py-4 flex items-center sm:px-6">
								<div className="min-w-0 flex-1 flex items-center">
									<div className="min-w-0 flex-1">
										<div>
											<p
												className={`text-sm font-medium truncate ${
													hoveredTaskId === task.id
														? 'dynamic-color'
														: 'text-gray-700 dark:text-gray-300'
												}`}
											>
												{task.name}
											</p>
											{task.description && (
												<p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
													{task.description}
												</p>
											)}
										</div>
									</div>
								</div>
								<div>
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
											task.status === 'completed'
												? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
												: task.status === 'in-progress'
													? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
													: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
										}`}
									>
										{task.status === 'pending'
											? t('tasks.status.pending')
											: task.status === 'in-progress'
												? t('tasks.status.inProgress')
												: t('tasks.status.completed')}
									</span>
								</div>
							</div>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
};
