import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TimeEntryForm } from './TimeEntryForm'
import { useTimeEntryStore } from '../store/timeEntryStore'
import { TrashIcon } from '@heroicons/react/24/outline'
import { ConfirmModal } from './ui/ConfirmModal'
import { Modal } from './ui/Modal'

interface TimeEntryEditModalProps {
	isOpen: boolean
	onClose: () => void
	timeEntryId: string | null
}

export const TimeEntryEditModal = ({
	isOpen,
	onClose,
	timeEntryId,
}: TimeEntryEditModalProps) => {
	const { t } = useTranslation()
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
		if (isOpen && timeEntryId) {
			fetchTimeEntry(timeEntryId)
		}
	}, [isOpen, timeEntryId, fetchTimeEntry])

	const handleDelete = async () => {
		if (!timeEntryId) return

		setDeleteLoading(true)
		try {
			await deleteTimeEntry(timeEntryId)
			onClose()
		} catch (err) {
			console.error('Error deleting time entry:', err)
		} finally {
			setDeleteLoading(false)
			setShowDeleteModal(false)
		}
	}

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				title={t('timeEntries.edit')}
			>
				<div className="flex justify-end mb-4">
					{selectedTimeEntry && (
						<button
							type="button"
							onClick={() => setShowDeleteModal(true)}
							className="inline-flex items-center rounded-md border border-transparent bg-red-100 px-2 py-1 text-sm font-medium text-red-700 hover:bg-red-200 focus:outline-none dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
						>
							<TrashIcon className="h-4 w-4 mr-1" />
							{t('common.delete')}
						</button>
					)}
				</div>

				{isLoading ? (
					<div className="flex justify-center items-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 dynamic-border"></div>
						<span className="ml-2">{t('common.loading')}</span>
					</div>
				) : error ? (
					<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-md">
						{error}
					</div>
				) : !selectedTimeEntry ? (
					<div className="text-center py-8">
						<p className="text-gray-500 dark:text-gray-400 mb-4">
							{t('timeEntries.notFound')}
						</p>
					</div>
				) : (
					<TimeEntryForm
						timeEntry={selectedTimeEntry}
						isEditing={true}
						onSuccess={onClose}
					/>
				)}
			</Modal>

			<ConfirmModal
				isOpen={showDeleteModal}
				title={t('common.confirmDelete')}
				message={t('timeEntries.deleteConfirmation')}
				confirmButtonText={t('common.delete')}
				cancelButtonText={t('common.cancel')}
				onConfirm={handleDelete}
				onCancel={() => setShowDeleteModal(false)}
				isLoading={deleteLoading}
				danger={true}
			/>
		</>
	)
}
