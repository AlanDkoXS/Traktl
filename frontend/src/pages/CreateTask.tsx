import { useTranslation } from 'react-i18next';
import { TaskForm } from '../components/TaskForm';

export const CreateTask = () => {
	const { t } = useTranslation();

	return (
		<div>
			<h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 dynamic-color">
				{t('tasks.new')}
			</h1>

			<div className="card-project">
				<div className="px-4 py-5 sm:p-6">
					<TaskForm />
				</div>
			</div>
		</div>
	);
};
