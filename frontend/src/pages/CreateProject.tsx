import { useTranslation } from 'react-i18next'
import { ProjectForm } from '../components/ProjectForm'

const CreateProject = () => {
	const { t } = useTranslation()

	return (
		<div>
			<h1 className="text-2xl font-semibold text-gray-900 dark:text-white dynamic-color mb-6">
				{t('projects.new')}
			</h1>

			<div className="card-project">
				<div className="px-4 py-5 sm:p-6">
					<ProjectForm project={null} />
				</div>
			</div>
		</div>
	)
}

export default CreateProject
