import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TimeEntryForm } from '../components/TimeEntryForm'
import { useTimeEntryStore } from '../store/timeEntryStore'
import { TrashIcon } from '@heroicons/react/24/outline'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { useState } from 'react'

const EditTimeEntry = () => {
	const { t } = useTranslation()
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const {
		selectedTimeEntry,
		fetchTimeEntry,
		deleteTimeEntry,
		isLoading,
		error,
	} = useTimeEntryStore()
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const [deleteLoading, setDeleteLoading] = useState(false)

	useEffect(() => {
		if (id) {
			fetchTimeEntry(id)
		}
	}, [id, fetchTimeEntry])

	const handleDelete = async () => {
		if (!id) return

		setDeleteLoading(true)
		try {
			await deleteTimeEntry(id)
			navigate('/time-entries')
		} catch (err) {
			console.error('Error deleting time entry:', err)
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

	if (error) {
		return (
			<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-md">
				{error}
			</div>
		)
	}

	if (!selectedTimeEntry) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500 dark:text-gray-400 mb-4">
					{t('timeEntries.notFound')}
				</p>
				<button
					onClick={() => navigate('/time-entries')}
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
					{t('timeEntries.edit')}
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
					<TimeEntryForm timeEntry={selectedTimeEntry} isEditing />
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={showDeleteModal}
				title={t('common.confirmDelete')}
				message={t('timeEntries.deleteConfirmation', {
					defaultValue:
						'Are you sure you want to delete this time entry? This action cannot be undone.',
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

export default EditTimeEntry
