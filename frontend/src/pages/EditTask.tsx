import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TaskForm } from '../components/TaskForm'
import { useTaskStore } from '../store/taskStore'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { TrashIcon } from '@heroicons/react/24/outline'

export const EditTask = () => {
	const { t } = useTranslation()
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const { selectedTask, fetchTask, deleteTask, isLoading, error } =
		useTaskStore()
	const [notFound, setNotFound] = useState(false)
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const [deleteLoading, setDeleteLoading] = useState(false)

	useEffect(() => {
		// Check if id is undefined or invalid
		if (!id || id === 'undefined') {
			console.error('Invalid task ID:', id)
			setNotFound(true)
			return
		}

		// Add a loading indicator
		const loadTask = async () => {
			try {
				await fetchTask(id)
			} catch (err) {
				console.error('Error fetching task:', err)
				setNotFound(true)
			}
		}

		loadTask()
	}, [id, fetchTask])

	// Handle task deletion
	const handleDelete = async () => {
		if (!id) return

		setDeleteLoading(true)
		try {
			await deleteTask(id)
			navigate('/tasks')
		} catch (err) {
			console.error('Error deleting task:', err)
		} finally {
			setDeleteLoading(false)
			setShowDeleteModal(false)
		}
	}

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 dynamic-border"></div>
				<span className="ml-2">{t('common.loading')}</span>
			</div>
		)
	}

	if (error || notFound || !selectedTask) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500 dark:text-gray-400 mb-4">
					{t('tasks.notFound')}
				</p>
				<button
					onClick={() => navigate('/tasks')}
					className="btn btn-primary"
				>
					{t('common.goBack')}
				</button>
			</div>
		)
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-white dynamic-color">
					{t('tasks.edit')}
				</h1>
				<button
					onClick={() => setShowDeleteModal(true)}
					className="btn btn-secondary bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-800/50"
				>
					<TrashIcon className="h-5 w-5 mr-1" />
					{t('common.delete')}
				</button>
			</div>

			<div className="bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
				<div className="px-4 py-5 sm:p-6">
					<TaskForm task={selectedTask} isEditing />
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={showDeleteModal}
				title={t('common.confirmDelete')}
				message={t('tasks.deleteConfirmation', {
					name: selectedTask.name,
					defaultValue: `Are you sure you want to delete the task "${selectedTask.name}"? This action cannot be undone.`,
				})}
				confirmButtonText={t('common.delete')}
				cancelButtonText={t('common.cancel')}
				onConfirm={handleDelete}
				onCancel={() => setShowDeleteModal(false)}
				isLoading={deleteLoading}
				danger={true}
			/>
		</div>
	)
}
