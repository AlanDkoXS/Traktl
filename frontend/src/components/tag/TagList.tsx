import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTagStore } from '../../store/tagStore';
import { Link } from 'react-router-dom';

export const TagList = () => {
	const { t } = useTranslation();
	const { tags, isLoading, error, fetchTags } = useTagStore();
	const [retryCount, setRetryCount] = useState(0);

	useEffect(() => {
		fetchTags();
	}, [fetchTags, retryCount]);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-4">
				<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
				<span className="ml-2">{t('common.loading')}</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-md">
				<p className="mb-2">{error}</p>
				<button
					onClick={() => setRetryCount((prev) => prev + 1)}
					className="text-sm underline hover:text-red-600 dark:hover:text-red-300"
				>
					{t('common.retry')}
				</button>
			</div>
		);
	}

	if (tags.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500 dark:text-gray-400 mb-4">{t('tags.noTags')}</p>
				<Link to="/tags/new" className="btn btn-primary">
					{t('tags.new')}
				</Link>
			</div>
		);
	}

	return (
		<div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
			<ul className="divide-y divide-gray-200 dark:divide-gray-700">
				{tags.map((tag) => (
					<li key={tag.id}>
						<Link
							to={`/tags/${tag.id}`}
							className="block hover:bg-gray-50 dark:hover:bg-gray-700"
						>
							<div className="px-4 py-4 flex items-center sm:px-6">
								<div className="min-w-0 flex-1 flex items-center">
									<div
										className="flex-shrink-0 h-6 w-6 rounded-md"
										style={{ backgroundColor: tag.color }}
									/>
									<div className="min-w-0 flex-1 px-4">
										<div>
											<p className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate">
												{tag.name}
											</p>
										</div>
									</div>
								</div>
							</div>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
};
