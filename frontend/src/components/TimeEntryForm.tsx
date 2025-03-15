import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTimeEntryStore } from '../store/timeEntryStore';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { useTagStore } from '../store/tagStore';
import { TimeEntry } from '../types';
import { format } from 'date-fns';

interface TimeEntryFormProps {
	timeEntry?: TimeEntry;
	isEditing?: boolean;
}

export const TimeEntryForm = ({ timeEntry, isEditing = false }: TimeEntryFormProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const { createTimeEntry, updateTimeEntry } = useTimeEntryStore();
	const { projects, fetchProjects } = useProjectStore();
	const { tasks, fetchTasks } = useTaskStore();
	const { tags, fetchTags } = useTagStore();

	// Get projectId from query params if available
	const queryParams = new URLSearchParams(location.search);
	const queryProjectId = queryParams.get('projectId');
	const queryTaskId = queryParams.get('taskId');

	// Initialize with either existing time entry, query params, or defaults
	const [projectId, setProjectId] = useState(timeEntry?.project || queryProjectId || '');
	const [taskId, setTaskId] = useState(timeEntry?.task || queryTaskId || '');
	const [selectedTags, setSelectedTags] = useState<string[]>(timeEntry?.tags || []);
	const [startTime, setStartTime] = useState(
		timeEntry?.startTime
			? format(new Date(timeEntry.startTime), "yyyy-MM-dd'T'HH:mm")
			: format(new Date(), "yyyy-MM-dd'T'HH:mm")
	);
	const [endTime, setEndTime] = useState(
		timeEntry?.endTime && !timeEntry.isRunning
			? format(new Date(timeEntry.endTime), "yyyy-MM-dd'T'HH:mm")
			: ''
	);
	const [notes, setNotes] = useState(timeEntry?.notes || '');
	const [isRunning, setIsRunning] = useState(timeEntry?.isRunning || false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		// Load projects, tasks, and tags
		fetchProjects();
		fetchTags();

		// If we have a project ID, fetch tasks for that project
		if (projectId) {
			fetchTasks(projectId);
		}
	}, [fetchProjects, fetchTags, fetchTasks, projectId]);

	const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newProjectId = e.target.value;
		setProjectId(newProjectId);
		setTaskId(''); // Reset task when project changes

		// If this project changes, fetch tasks for the new project
		if (newProjectId) {
			fetchTasks(newProjectId);
		}
	};

	const handleTagToggle = (tagId: string) => {
		setSelectedTags((prev) =>
			prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
		);
	};

	const calculateDuration = () => {
		if (isRunning || !endTime) return 0;

		const start = new Date(startTime).getTime();
		const end = new Date(endTime).getTime();

		return end > start ? end - start : 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!projectId || !startTime) {
			setError(t('errors.required'));
			return;
		}

		if (!isRunning && !endTime) {
			setError(t('timeEntries.endTimeRequired'));
			return;
		}

		const duration = calculateDuration();

		setIsSubmitting(true);
		setError('');

		try {
			console.log('Preparing time entry data...');
			const timeEntryData = {
				project: projectId,
				task: taskId || undefined,
				startTime: new Date(startTime),
				endTime: endTime ? new Date(endTime) : undefined,
				duration: isRunning ? 0 : duration,
				notes,
				isRunning,
				tags: selectedTags,
			};

			console.log('Time entry data:', timeEntryData);

			if (isEditing && timeEntry) {
				console.log(`Updating time entry ${timeEntry.id}`);
				await updateTimeEntry(timeEntry.id, timeEntryData);
				console.log('Time entry updated successfully');
			} else {
				console.log('Creating new time entry');
				await createTimeEntry(timeEntryData);
				console.log('Time entry created successfully');
			}

			navigate('/time-entries');
		} catch (err: any) {
			console.error('Error submitting time entry:', err);
			setError(err.message || t('errors.serverError'));
		} finally {
			setIsSubmitting(false);
		}
	};

	// Update the end time field when isRunning changes
	useEffect(() => {
		if (isRunning) {
			setEndTime('');
		} else if (!endTime) {
			setEndTime(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
		}
	}, [isRunning, endTime]);

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{error && (
				<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-md">
					{error}
				</div>
			)}

			<div>
				<label
					htmlFor="project"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					{t('timeEntries.project')} *
				</label>
				<select
					id="project"
					value={projectId}
					onChange={handleProjectChange}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
					required
				>
					<option value="">{t('timeEntries.selectProject')}</option>
					{projects.map((project) => (
						<option key={project.id} value={project.id}>
							{project.name}
						</option>
					))}
				</select>
			</div>

			<div>
				<label
					htmlFor="task"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					{t('timeEntries.task')}
				</label>
				<select
					id="task"
					value={taskId}
					onChange={(e) => setTaskId(e.target.value)}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
					disabled={!projectId || tasks.length === 0}
				>
					<option value="">{t('timeEntries.selectTask')}</option>
					{tasks.map((task) => (
						<option key={task.id} value={task.id}>
							{task.name}
						</option>
					))}
				</select>
			</div>

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
				<div>
					<label
						htmlFor="startTime"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						{t('timeEntries.startTime')} *
					</label>
					<input
						type="datetime-local"
						id="startTime"
						value={startTime}
						onChange={(e) => setStartTime(e.target.value)}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
						required
					/>
				</div>

				<div>
					<label
						htmlFor="endTime"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						{t('timeEntries.endTime')} {isRunning ? '' : '*'}
					</label>
					<input
						type="datetime-local"
						id="endTime"
						value={endTime}
						onChange={(e) => setEndTime(e.target.value)}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
						disabled={isRunning}
						required={!isRunning}
					/>
				</div>
			</div>

			<div>
				<div className="flex items-center">
					<input
						id="isRunning"
						type="checkbox"
						checked={isRunning}
						onChange={(e) => setIsRunning(e.target.checked)}
						className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:border-gray-600"
					/>
					<label
						htmlFor="isRunning"
						className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
					>
						{t('timeEntries.isRunning')}
					</label>
				</div>
				<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
					{t('timeEntries.runningHelp')}
				</p>
			</div>

			<div>
				<label
					htmlFor="notes"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					{t('timeEntries.notes')}
				</label>
				<textarea
					id="notes"
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					rows={3}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
					{t('timeEntries.tags')}
				</label>
				<div className="mt-2 flex flex-wrap gap-2">
					{tags.map((tag) => (
						<button
							key={tag.id}
							type="button"
							onClick={() => handleTagToggle(tag.id)}
							className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
								selectedTags.includes(tag.id)
									? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300'
									: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
							}`}
						>
							<div
								className="w-2 h-2 rounded-full mr-1.5"
								style={{ backgroundColor: tag.color }}
							/>
							{tag.name}
						</button>
					))}
					{tags.length === 0 && (
						<span className="text-sm text-gray-500 dark:text-gray-400">
							{t('tags.noTags')}{' '}
							<Link
								to="/tags/new"
								className="text-primary-600 dark:text-primary-400 underline"
							>
								{t('tags.new')}
							</Link>
						</span>
					)}
				</div>
			</div>

			<div className="flex justify-end space-x-3">
				<button
					type="button"
					onClick={() => navigate('/time-entries')}
					className="btn btn-secondary"
				>
					{t('common.cancel')}
				</button>
				<button type="submit" disabled={isSubmitting} className="btn btn-primary">
					{isSubmitting
						? t('common.loading')
						: isEditing
							? t('common.update')
							: t('common.create')}
				</button>
			</div>
		</form>
	);
};
