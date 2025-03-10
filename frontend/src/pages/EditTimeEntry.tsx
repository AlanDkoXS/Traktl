import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TimeEntryForm } from '../components/TimeEntryForm';
import { useTimeEntryStore } from '../store/timeEntryStore';

export const EditTimeEntry = () => {
	const { t } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { selectedTimeEntry, fetchTimeEntry, isLoading, error } = useTimeEntryStore();

	useEffect(() => {
		if (id) {
			fetchTimeEntry(id);
		}
	}, [id, fetchTimeEntry]);

	if (isLoading) {
		return <div className="text-center padding-y-4">{t('common.loading')}</div>;
	}

	if (error) {
		return (
			<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 padding-4 rounded-md">
				{error}
			</div>
		);
	}

	if (!selectedTimeEntry) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500 dark:text-gray-400 margin-bottom-4">
					{t('timeEntries.notFound')}
				</p>
				<button onClick={() => navigate('/time-entries')} className="btn btn-primary">
					{t('common.goBack')}
				</button>
			</div>
		);
	}

	return (
		<div>
			<h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
				{t('timeEntries.edit')}
			</h1>

			<div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
				<div className="padding-x-4 py-5 sm:p-6">
					<TimeEntryForm timeEntry={selectedTimeEntry} isEditing />
				</div>
			</div>
		</div>
	);
};
