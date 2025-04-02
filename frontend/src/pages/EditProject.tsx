import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ProjectForm } from '../components/ProjectForm'
import { useProjectStore } from '../store/projectStore'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { TrashIcon } from '@heroicons/react/24/outline'
import { setProjectColor } from '../utils/dynamicColors'

const EditProject = () => {
	const { t } = useTranslation()
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const { selectedProject, fetchProject, deleteProject, isLoading, error } =
		useProjectStore()
	const [notFound, setNotFound] = useState(false)
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const [deleteLoading, setDeleteLoading] = useState(false)

	useEffect(() => {
		// Check if id is undefined or invalid
		if (!id || id === 'undefined') {
			console.error('Invalid project ID:', id)
			setNotFound(true)
			return
		}

		// Add a loading indicator
		const loadProject = async () => {
			try {
				await fetchProject(id)
			} catch (err) {
				console.error('Error fetching project:', err)
				setNotFound(true)
			}
		}

		loadProject()
	}, [id, fetchProject])

	// Set project color when selected project changes (solo en dashboard)
	useEffect(() => {
		if (selectedProject?.color && window.location.pathname === '/') {
			setProjectColor(selectedProject.color)
		}
	}, [selectedProject])

	// Handle project deletion
	const handleDelete = async () => {
		if (!id) return

		setDeleteLoading(true)
		try {
			await deleteProject(id)
			navigate('/projects')
		} catch (err) {
			console.error('Error deleting project:', err)
		} finally {
			setDeleteLoading(false)
			setShowDeleteModal(false)
		}
	}

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
				<span className="ml-2">{t('common.loading')}</span>
			</div>
		)
	}

	if (error || notFound || !selectedProject) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500 dark:text-gray-400 mb-4">
					{t('projects.notFound')}
				</p>
				<button
					onClick={() => navigate('/projects')}
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
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
					{t('projects.edit')}
				</h1>
				<button
					onClick={() => setShowDeleteModal(true)}
					className="btn btn-secondary bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-800/50"
				>
					<TrashIcon className="h-5 w-5 mr-1" />
					{t('common.delete')}
				</button>
			</div>

			<div className="card-project">
				<div className="px-4 py-5 sm:p-6">
					<ProjectForm project={selectedProject} isEditing />
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={showDeleteModal}
				title={t('common.confirmDelete')}
				message={t('projects.deleteConfirmation', {
					name: selectedProject.name,
					defaultValue: `Are you sure you want to delete the project "${selectedProject.name}"? This action cannot be undone.`,
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

export default EditProject
