import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { TimeEntryList } from '../components/TimeEntryList'
import {
	PlusIcon,
	FunnelIcon,
	ArrowLeftIcon,
} from '@heroicons/react/24/outline'
import { useProjectStore } from '../store/projectStore'
import { format, subDays } from 'date-fns'
import { es, enUS, tr } from 'date-fns/locale'

const TimeEntries = () => {
	const { t, i18n } = useTranslation()
	const { projects, fetchProjects } = useProjectStore()

	const getLocale = () => {
		switch (i18n.language) {
			case 'es':
				return es
			case 'tr':
				return tr
			default:
				return enUS
		}
	}

	const [projectId, setProjectId] = useState<string>('')
	const [startDate, setStartDate] = useState<string>(
		format(subDays(new Date(), 7), 'yyyy-MM-dd', { locale: getLocale() }),
	)
	const [endDate, setEndDate] = useState<string>(
		format(new Date(), 'yyyy-MM-dd', { locale: getLocale() }),
	)
	const [showFilters, setShowFilters] = useState(false)
	const [filterKey, setFilterKey] = useState(0)

	useEffect(() => {
		fetchProjects()
	}, [fetchProjects])

	const applyFilters = () => {
		setFilterKey((prev) => prev + 1)
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
					{t('timeEntries.title')}
				</h1>
				<div className="flex space-x-2">
					<Link to="/" className="btn btn-secondary">
						<ArrowLeftIcon className="h-5 w-5 mr-1" />
						{t('common.back')}
					</Link>
					<button
						onClick={() => setShowFilters(!showFilters)}
						className="btn btn-secondary"
					>
						<FunnelIcon className="h-5 w-5 mr-1" />
						{t('common.filter')}
					</button>
					<Link to="/time-entries/new" className="btn btn-primary">
						<PlusIcon className="h-5 w-5 mr-1" />
						{t('timeEntries.new')}
					</Link>
				</div>
			</div>

			{showFilters && (
				<div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow mb-6">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<div>
							<label
								htmlFor="projectFilter"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								{t('timeEntries.project')}
							</label>
							<select
								id="projectFilter"
								value={projectId}
								onChange={(e) => setProjectId(e.target.value)}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
							>
								<option value="">
									{t('timeEntries.allProjects')}
								</option>
								{projects.map((project) => (
									<option key={project.id} value={project.id}>
										{project.name}
									</option>
								))}
							</select>
						</div>

						<div>
							<label
								htmlFor="startDateFilter"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								{t('timeEntries.startDate')}
							</label>
							<input
								type="date"
								id="startDateFilter"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
							/>
						</div>

						<div>
							<label
								htmlFor="endDateFilter"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								{t('timeEntries.endDate')}
							</label>
							<input
								type="date"
								id="endDateFilter"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
							/>
						</div>
					</div>

					<div className="mt-4 flex justify-end">
						<button
							onClick={applyFilters}
							className="btn btn-primary"
						>
							{t('common.filter')}
						</button>
					</div>
				</div>
			)}

			<TimeEntryList
				key={filterKey}
				projectId={projectId || undefined}
				startDate={
					startDate ? new Date(startDate + 'T00:00:00') : undefined
				}
				endDate={
					endDate ? new Date(endDate + 'T23:59:59.999') : undefined
				}
			/>
		</div>
	)
}

export default TimeEntries
