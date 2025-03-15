import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useTimeEntryStore } from '../store/timeEntryStore';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { useTagStore } from '../store/tagStore';
import { TrashIcon, PencilIcon, ClockIcon, PlayIcon } from '@heroicons/react/24/outline';
import { ConfirmModal } from './ui/ConfirmModal';
import { useTimerStore } from '../store/timerStore';
import { TimeEntry } from '../types';

interface TimeEntryListProps {
	projectId?: string;
	taskId?: string;
	startDate?: Date;
	endDate?: Date;
	limit?: number;
}

export const TimeEntryList = ({
	projectId,
	taskId,
	startDate,
	endDate,
	limit,
}: TimeEntryListProps) => {
	const { t } = useTranslation();
	const { timeEntries, fetchTimeEntries, deleteTimeEntry, error } = useTimeEntryStore();
	const { projects, fetchProjects } = useProjectStore();
	const { tasks, fetchTasks } = useTaskStore();
	const { tags, fetchTags } = useTagStore();
	const {
		start,
		setProjectId,
		setTaskId,
		setNotes,
		setTags,
		status: timerStatus,
		workStartTime,
		setInfiniteMode,
		selectedEntryId,
		setSelectedEntryId,
	} = useTimerStore();

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [dataInitialized, setDataInitialized] = useState(false);
	const [hoveredEntryId, setHoveredEntryId] = useState<string | null>(null);

	// Initial data load
	useEffect(() => {
		if (!dataInitialized) {
			const loadData = async () => {
				try {
					setDataInitialized(true); // Set this first to prevent loops
					// Load data in sequence
					await fetchTimeEntries(projectId, taskId, startDate, endDate);
					await fetchProjects();
					await fetchTasks();
					await fetchTags();
				} catch (err) {
					console.error('Error loading data:', err);
				}
			};

			loadData();
		}
	}, [projectId, taskId, startDate, endDate, dataInitialized]);

	// Refresh time entries when timer stops
	useEffect(() => {
		if (timerStatus === 'idle' && workStartTime === null) {
			// This means the timer has been stopped - refresh entries
			const refreshData = async () => {
				try {
					await fetchTimeEntries(projectId, taskId, startDate, endDate);
				} catch (err) {
					console.error('Error refreshing time entries:', err);
				}
			};

			refreshData();
		}
	}, [timerStatus, workStartTime]);

	// Format duration with hours, minutes, and seconds
	const formatDuration = (milliseconds: number) => {
		if (milliseconds === 0) return '00:00:00';

		const seconds = Math.floor(milliseconds / 1000);
		// Round up to a minute if between 59-60 seconds
		if (seconds >= 59 && seconds < 60) {
			const hours = 0;
			const minutes = 1;
			const remainingSeconds = 0;
			return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
		}

		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = seconds % 60;

		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
	};

	const getProjectName = (projectId: string) => {
		const project = projects.find((p) => p.id === projectId);
		return project ? project.name : 'Unknown Project';
	};

	const getTaskName = (taskId: string) => {
		const task = tasks.find((t) => t.id === taskId);
		return task ? task.name : 'Unknown Task';
	};

	const getTagsForEntry = (tagIds: string[]) => {
		return tags.filter((tag) => tagIds.includes(tag.id));
	};

	const getProjectColor = (projectId: string) => {
		const project = projects.find((p) => p.id === projectId);
		return project?.color || '#3b82f6';
	};

	const handleDeleteClick = (entryId: string, e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setEntryToDelete(entryId);
		setShowDeleteModal(true);
	};

	const handleConfirmDelete = async () => {
		if (!entryToDelete) return;
		setDeleteLoading(true);
		try {
			await deleteTimeEntry(entryToDelete);

			// If we're deleting the selected entry, clear selection
			if (selectedEntryId === entryToDelete) {
				setSelectedEntryId(null);
				setInfiniteMode(false);
			}
		} catch (error) {
			console.error('Failed to delete time entry:', error);
		} finally {
			setDeleteLoading(false);
			setShowDeleteModal(false);
			setEntryToDelete(null);
		}
	};

	const handleEntryClick = (entry: TimeEntry, e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		console.log('Entry clicked:', entry.id, 'current selectedEntryId:', selectedEntryId);

		// If we're clicking the currently selected entry, unselect it and turn off infinite mode
		if (selectedEntryId === entry.id) {
			console.log('Unselecting entry');
			setSelectedEntryId(null);
			setInfiniteMode(false);
		} else {
			console.log('Selecting entry');
			setSelectedEntryId(entry.id);
			setInfiniteMode(true); // Enable infinite mode when selecting an entry
		}
	};

	// Handle click on the play button specifically
	const handlePlayClick = (entry: TimeEntry, e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		console.log('Play clicked, setting up timer with entry:', entry.id);

		// Set up timer with the entry data
		setProjectId(entry.project);
		if (entry.task) setTaskId(entry.task);
		if (entry.notes) setNotes(entry.notes);
		if (entry.tags) setTags(entry.tags);

		// Make sure this entry is selected for infinite mode
		setSelectedEntryId(entry.id);

		// Explicitly set infinite mode to true before starting
		setInfiniteMode(true);

		// Start timer with infinite mode
		start();
	};

	const handleRetry = () => {
		setDataInitialized(false);
	};

	if (error) {
		return (
			<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md text-sm flex flex-col">
				<p>{error}</p>
				<button
					onClick={handleRetry}
					className="mt-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 underline"
				>
					{t('common.retry')}
				</button>
			</div>
		);
	}

	if (!timeEntries.length) {
		return (
			<div className="text-center py-4">
				<p className="text-gray-500 dark:text-gray-400">{t('timeEntries.noEntries')}</p>
				<Link to="/time-entries/new" className="btn btn-primary mt-2 inline-flex">
					{t('timeEntries.new')}
				</Link>
			</div>
		);
	}

	// Sort entries by date (newest first)
	const sortedEntries = [...timeEntries].sort(
		(a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
	);

	// Limit the number of entries if specified
	const displayEntries = limit ? sortedEntries.slice(0, limit) : sortedEntries;

	// Check if timer is active
	const isTimerActive =
		timerStatus === 'running' || timerStatus === 'paused' || timerStatus === 'break';

	return (
		<>
			<div className="space-y-2">
				{displayEntries.map((entry) => {
					const isSelected = selectedEntryId === entry.id;
					const isHovered = hoveredEntryId === entry.id;
					const projectColor = getProjectColor(entry.project);

					// Create darker and lighter variants of project color for selected state
					const getDarkerColor = (hexColor: string, factor = 0.85) => {
						// Convert hex to RGB
						const r = parseInt(hexColor.slice(1, 3), 16);
						const g = parseInt(hexColor.slice(3, 5), 16);
						const b = parseInt(hexColor.slice(5, 7), 16);

						// Apply darkening factor
						const darkerR = Math.floor(r * factor);
						const darkerG = Math.floor(g * factor);
						const darkerB = Math.floor(b * factor);

						// Convert back to hex
						return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
					};

					const darkerProjectColor = getDarkerColor(projectColor);

					// Create entry background style that adapts to project colors
					let entryBgStyle = {};
					if (isSelected) {
						// Use a subtle background based on project color
						entryBgStyle = {
							background: `linear-gradient(to right, ${projectColor}15, ${projectColor}05)`,
							borderLeft: `3px solid ${projectColor}`,
						};
					}

					return (
						<div
							key={entry.id}
							className={`relative block bg-white dark:bg-[rgb(var(--color-bg-inset))] rounded-lg p-2 shadow-sm transition-all ${isTimerActive && !isSelected ? 'opacity-60 pointer-events-none' : ''} ${isSelected ? 'shadow-md' : ''} ${isHovered && !isSelected ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
							onMouseEnter={() => setHoveredEntryId(entry.id)}
							onMouseLeave={() => setHoveredEntryId(null)}
							style={entryBgStyle}
						>
							<div
								className="block cursor-pointer"
								onClick={(e) => handleEntryClick(entry, e)}
							>
								<div className="flex items-center justify-between pr-16">
									<div className="flex items-center min-w-0">
										<div
											className={`flex-shrink-0 h-7 w-7 ${isSelected ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'} rounded-full flex items-center justify-center mr-2 cursor-pointer transition-colors`}
											onClick={(e) => handlePlayClick(entry, e)}
											style={
												isSelected
													? {}
													: { backgroundColor: `${projectColor}20` }
											}
										>
											{isSelected ? (
												<PlayIcon className="h-3.5 w-3.5 text-green-600 dark:text-green-300" />
											) : (
												<ClockIcon
													className="h-3.5 w-3.5"
													style={{ color: projectColor }}
												/>
											)}
										</div>
										<div className="min-w-0 flex-1">
											<div className="text-sm truncate">
												<span
													className="font-bold dynamic-color"
													style={{
														color: isSelected
															? darkerProjectColor
															: isHovered
																? projectColor
																: '',
													}}
												>
													{getProjectName(entry.project)}
												</span>
												{entry.task && (
													<span className="text-gray-600 dark:text-gray-400">
														: {getTaskName(entry.task)}
													</span>
												)}
											</div>
											<div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
												{format(new Date(entry.startTime), 'MMM d, h:mm a')}
											</div>
										</div>
									</div>
									<div className="text-right">
										<div
											className={`text-lg font-bold dynamic-color ${isSelected ? 'flex items-center flex-col' : ''}`}
											style={{
												color: isSelected
													? darkerProjectColor
													: isHovered
														? projectColor
														: '',
											}}
										>
											{formatDuration(entry.duration)}
										</div>
									</div>
								</div>

								{entry.tags && entry.tags.length > 0 && (
									<div className="mt-1 flex flex-wrap gap-1 ml-9">
										{getTagsForEntry(entry.tags).map((tag) => (
											<span
												key={tag.id}
												className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs"
												style={{
													backgroundColor: `${tag.color}20`,
													color: tag.color,
													border: `1px solid ${tag.color}`,
												}}
											>
												{tag.name}
											</span>
										))}
									</div>
								)}
							</div>

							<div className="absolute top-2 right-2 flex space-x-1">
								<Link
									to={`/time-entries/${entry.id}`}
									className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-white dark:bg-gray-800 rounded"
									title={t('common.edit')}
									onClick={(e) => e.stopPropagation()}
								>
									<PencilIcon className="h-4 w-4" />
								</Link>
								<button
									onClick={(e) => handleDeleteClick(entry.id, e)}
									className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-gray-800 rounded"
									title={t('common.delete')}
								>
									<TrashIcon className="h-4 w-4" />
								</button>
							</div>
						</div>
					);
				})}

				{limit && timeEntries.length > limit && (
					<Link
						to="/time-entries"
						className="block text-center text-sm dynamic-color hover:underline p-2"
					>
						{t('common.viewAll')} ({timeEntries.length})
					</Link>
				)}
			</div>

			{/* Delete confirmation modal */}
			<ConfirmModal
				isOpen={showDeleteModal}
				title={t('common.confirmDelete')}
				message={t('timeEntries.deleteConfirmation', {
					name: entryToDelete
						? format(
								new Date(
									timeEntries.find((e) => e.id === entryToDelete)?.startTime ||
										Date.now()
								),
								'MMM d, h:mm a'
							)
						: '',
					defaultValue:
						'Are you sure you want to delete this time entry? This action cannot be undone.',
				})}
				confirmButtonText={t('common.delete')}
				cancelButtonText={t('common.cancel')}
				onConfirm={handleConfirmDelete}
				onCancel={() => setShowDeleteModal(false)}
				isLoading={deleteLoading}
				danger={true}
			/>
		</>
	);
};
