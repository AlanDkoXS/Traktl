import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTagStore } from '../../store/tagStore';
import { Tag } from '../../types';

interface TagFormProps {
	tag?: Tag;
	isEditing?: boolean;
}

export const TagForm = ({ tag, isEditing = false }: TagFormProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { createTag, updateTag } = useTagStore();

	const [name, setName] = useState(tag?.name || '');
	const [color, setColor] = useState(tag?.color || '#2ecc71');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name) {
			setError(t('errors.required'));
			return;
		}

		setIsSubmitting(true);
		setError('');

		try {
			if (isEditing && tag) {
				await updateTag(tag.id, { name, color });
			} else {
				await createTag({ name, color });
			}

			navigate('/tags');
		} catch (err: any) {
			setError(err.message || t('errors.serverError'));
		} finally {
			setIsSubmitting(false);
		}
	};

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
					{t('tags.name')} *
				</label>
				<input
					type="text"
					id="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:dynamic-border focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
					required
				/>
			</div>

			<div>
				<label
					htmlFor="color"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					{t('tags.color')}
				</label>
				<div className="mt-1 flex items-center">
					<input
						type="color"
						id="color"
						value={color}
						onChange={(e) => setColor(e.target.value)}
						className="h-8 w-8 p-0 rounded-md"
					/>
					<input
						title="color"
						type="text"
						value={color}
						onChange={(e) => setColor(e.target.value)}
						className="ml-2 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:dynamic-border focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
					/>
				</div>
			</div>

			<div className="flex justify-end space-x-3">
				<button
					type="button"
					onClick={() => navigate('/tags')}
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
