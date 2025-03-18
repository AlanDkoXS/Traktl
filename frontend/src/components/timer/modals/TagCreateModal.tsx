import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../../ui/Modal'
import { useTagStore } from '../../../store/tagStore'

interface TagCreateModalProps {
	isOpen: boolean
	onClose: () => void
	onTagCreated: (tagId: string) => void
}

export const TagCreateModal = ({
	isOpen,
	onClose,
	onTagCreated,
}: TagCreateModalProps) => {
	const { t } = useTranslation()
	const { createTag } = useTagStore()

	const [name, setName] = useState('')
	const [color, setColor] = useState('#2ecc71')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!name) {
			setError(t('errors.required'))
			return
		}

		setIsSubmitting(true)
		setError('')

		try {
			const newTag = await createTag({
				name,
				color,
			})

			// Reset form
			setName('')
			setColor('#2ecc71')

			// Close modal and notify parent
			onTagCreated(newTag.id)
			onClose()
		} catch (err: any) {
			console.error('Tag creation error:', err)
			setError(err.message || t('errors.serverError'))
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={t('tags.new')}>
			<form onSubmit={handleSubmit} className="space-y-4">
				{error && (
					<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md text-sm">
						{error}
					</div>
				)}

				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						{t('tags.name')} *
					</label>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="mt-1 mb-0 block w-full rounded-md border-gray-300 shadow-sm focus:dynamic-border focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
						required
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						{t('tags.color')}
					</label>
					<div className="mt-1 flex items-center">
						<input
							type="color"
							value={color}
							onChange={(e) => setColor(e.target.value)}
							className="h-8 w-8 p-0 rounded-md border border-gray-300 dark:border-gray-600"
						/>
						<input
							type="text"
							value={color}
							onChange={(e) => setColor(e.target.value)}
							className="ml-2 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:dynamic-border focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
						/>
					</div>
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
