import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../../ui/Modal'
import { useTaskStore } from '../../../store/taskStore'
import { useProjectStore } from '../../../store/projectStore'

interface TaskCreateModalProps {
	isOpen: boolean
	onClose: () => void
	onTaskCreated: (taskId: string) => void
	projectId: string | null
}

export const TaskCreateModal = ({
	isOpen,
	onClose,
	onTaskCreated,
	projectId,
}: TaskCreateModalProps) => {
	const { t } = useTranslation()
	const { createTask } = useTaskStore()
	const { projects, fetchProjects } = useProjectStore()

	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
		null,
	)
	const [status, setStatus] = useState<
		'pending' | 'in-progress' | 'completed'
	>('pending')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState('')

	// Set default project ID when modal opens
	useEffect(() => {
		if (isOpen) {
			setSelectedProjectId(projectId)
			fetchProjects()
		}
	}, [isOpen, projectId, fetchProjects])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!name || !selectedProjectId) {
			setError(t('errors.required'))
			return
		}

		setIsSubmitting(true)
		setError('')

		try {
			const newTask = await createTask({
				name,
				description,
				project: selectedProjectId,
				status,
			})

			// Reset form
			setName('')
			setDescription('')
			setStatus('pending')

			// Close modal and notify parent
			onTaskCreated(newTask.id)
			onClose()
		} catch (err: Error | unknown) {
			console.error('Task creation error:', err)
			const errorMessage =
				err instanceof Error ? err.message : t('errors.serverError')
			setError(errorMessage)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={t('tasks.new')}>
			<form onSubmit={handleSubmit} className="space-y-4">
				{error && (
					<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md text-sm">
						{error}
					</div>
				)}

				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						{t('tasks.name')} *
					</label>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="mt-1 mb-0 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
						required
						aria-label={t('tasks.name')}
						placeholder={t('tasks.name')}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						{t('tasks.description')}
					</label>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={2}
						className="mt-1 mb-0 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
						aria-label={t('tasks.description')}
						placeholder={t('tasks.description')}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						{t('tasks.project')} *
					</label>
					<select
						value={selectedProjectId || ''}
						onChange={(e) => setSelectedProjectId(e.target.value)}
						className="mt-1 mb-0 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
						required
						aria-label={t('tasks.project')}
						title={t('tasks.project')}
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
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						{t('tasks.status.title')}
					</label>
					<select
						value={status}
						onChange={(e) =>
							setStatus(
								e.target.value as
									| 'pending'
									| 'in-progress'
									| 'completed',
							)
						}
						className="mt-1 mb-0 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
						aria-label={t('tasks.status.title')}
						title={t('tasks.status.title')}
					>
						<option value="pending">
							{t('tasks.status.pending')}
						</option>
						<option value="in-progress">
							{t('tasks.status.inProgress')}
						</option>
						<option value="completed">
							{t('tasks.status.completed')}
						</option>
					</select>
				</div>

				<div className="mt-6 flex justify-end space-x-3">
					<button
						type="button"
						onClick={onClose}
						className="btn btn-secondary"
					>
						{t('common.cancel')}
					</button>
					<button
						type="submit"
						disabled={isSubmitting}
						className="btn btn-primary dynamic-bg text-white"
					>
						{isSubmitting
							? t('common.loading')
							: t('common.create')}
					</button>
				</div>
			</form>
		</Modal>
	)
}
