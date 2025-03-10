import { useTranslation } from 'react-i18next';
import { TaskForm } from '../components/TaskForm';

export const CreateTask = () => {
	const { t } = useTranslation();

	return (
		<div>
			<h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
				{t('tasks.new')}
			</h1>

			<div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
				<div className="padding-x-4 py-5 sm:p-6">
					<TaskForm />
				</div>
			</div>
		</div>
	);
};
