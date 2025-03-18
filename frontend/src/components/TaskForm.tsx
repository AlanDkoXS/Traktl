import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTaskStore } from '../store/taskStore'
import { useProjectStore } from '../store/projectStore'
import { Task } from '../types'

interface TaskFormProps {
	task?: Task
	isEditing?: boolean
}

export const TaskForm = ({ task, isEditing = false }: TaskFormProps) => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const location = useLocation()
	const { createTask, updateTask } = useTaskStore()
	const { projects, fetchProjects } = useProjectStore()

	// Get projectId from query params if available
	const queryParams = new URLSearchParams(location.search)
	const queryProjectId = queryParams.get('projectId')

	const [name, setName] = useState(task?.name || '')
	const [description, setDescription] = useState(task?.description || '')
	const [projectId, setProjectId] = useState(
		task?.project || queryProjectId || '',
	)
	const [status, setStatus] = useState<
		'pending' | 'in-progress' | 'completed'
	>(task?.status || 'pending')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		fetchProjects()
	}, [fetchProjects])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!name || !projectId) {
			setError(t('errors.required'))
			return
		}

		setIsSubmitting(true)
		setError('')

		try {
			if (isEditing && task) {
				await updateTask(task.id, {
					name,
					description,
					project: projectId,
					status,
				})
			} else {
				await createTask({
					name,
					description,
					project: projectId,
					status,
				})
			}

			navigate('/tasks')
		} catch (err: any) {
			setError(err.message || t('errors.serverError'))
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{error && (
				<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-md">
					{error}
				</div>
			)}

			<div>
				<label
					htmlFor="name"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					{t('tasks.name')} *
				</label>
				<input
					type="text"
					id="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
					required
				/>
			</div>

			<div>
				<label
					htmlFor="description"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					{t('tasks.description')}
				</label>
				<textarea
					id="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					rows={3}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
				/>
			</div>

			<div>
				<label
					htmlFor="project"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					{t('tasks.project')} *
				</label>
				<select
					id="project"
					value={projectId}
					onChange={(e) => setProjectId(e.target.value)}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
					required
				>
					<option value="">{t('tasks.selectProject')}</option>
					{projects.map((project) => (
						<option key={project.id} value={project.id}>
							{project.name}
						</option>
					))}
				</select>
			</div>

			<div>
				<label
					htmlFor="status"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					{t('tasks.status.title')}
				</label>
				<select
					id="status"
					value={status}
					onChange={(e) =>
						setStatus(
							e.target.value as
								| 'pending'
								| 'in-progress'
								| 'completed',
						)
					}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
				>
					<option value="pending">{t('tasks.status.pending')}</option>
					<option value="in-progress">
						{t('tasks.status.inProgress')}
					</option>
					<option value="completed">
						{t('tasks.status.completed')}
					</option>
				</select>
			</div>

			<div className="flex justify-end space-x-3">
				<button
					type="button"
					onClick={() => navigate('/tasks')}
					className="btn btn-secondary"
				>
					{t('common.cancel')}
				</button>
				<button
					type="submit"
					disabled={isSubmitting}
					className="btn btn-primary"
				>
					{isSubmitting
						? t('common.loading')
						: isEditing
							? t('common.update')
							: t('common.create')}
				</button>
			</div>
		</form>
	)
}
