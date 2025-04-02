import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ProjectList } from '../components/ProjectList'
import { PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useProjectStore } from '../store/projectStore'

const Projects = () => {
	const { t } = useTranslation()
	const { clearSelectedProject } = useProjectStore()

	// Clear selected project when entering the projects list
	useEffect(() => {
		clearSelectedProject()
	}, [clearSelectedProject])

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-white dynamic-color">
					{t('projects.title')}
				</h1>
				<div className="flex space-x-2">
					<Link to="/" className="btn btn-secondary">
						<ArrowLeftIcon className="h-5 w-5 mr-1" />
						{t('common.back')}
					</Link>
					<Link to="/projects/new" className="btn btn-primary">
						<PlusIcon className="h-5 w-5 mr-1" />
						{t('projects.new')}
					</Link>
				</div>
			</div>

			<ProjectList />
		</div>
	)
}

export default Projects
