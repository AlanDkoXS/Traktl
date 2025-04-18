import { useTranslation } from 'react-i18next'
import { Timer } from '../components/Timer'
import { useProjectStore } from '../store/projectStore'
import { useClientStore } from '../store/clientStore'
import { useTaskStore } from '../store/taskStore'
import { useTimeEntryStore } from '../store/timeEntryStore'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, PlusIcon } from '@heroicons/react/24/outline'

const Dashboard = () => {
	const { t } = useTranslation()
	const { projects, fetchProjects } = useProjectStore()
	const { clients, fetchClients } = useClientStore()
	const { tasks, fetchTasks } = useTaskStore()
	const { timeEntries, fetchTimeEntries } = useTimeEntryStore()

	const [isLoading, setIsLoading] = useState(true)
	const [dataInitialized, setDataInitialized] = useState(false)

	useEffect(() => {
		if (!dataInitialized) {
			const loadData = async () => {
				setIsLoading(true)
				try {
					await fetchProjects()
					await fetchClients()
					await fetchTasks()
					// Load only the last 10 time entries
					await fetchTimeEntries(
						undefined,
						undefined,
						undefined,
						undefined,
						10,
					)
					setDataInitialized(true)
				} catch (err) {
					console.error('Error loading dashboard data:', err)
				} finally {
					setIsLoading(false)
				}
			}

			loadData()
		}
	}, [dataInitialized])

	return (
		<div className="max-w-7xl mx-auto">
			<h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 dynamic-color">
				{t('nav.dashboard')}
			</h1>

			{/* Main dashboard content */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				{/* Left column - Timer */}
				<div className="lg:col-span-8">
					<Timer />
				</div>

				{/* Right column - Stats */}
				<div className="lg:col-span-4 space-y-6">
					{isLoading ? (
						<div className="flex items-center justify-center h-32 bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] rounded-lg shadow-sm border border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
							<div className="animate-spin rounded-full h-8 w-8 dynamic-border"></div>
						</div>
					) : (
						<>
							{/* Stats */}
							<div className="grid grid-cols-2 gap-4">
								<StatsCard
									title={t('projects.title')}
									count={
										projects.filter(
											(p) => p.status === 'active',
										).length
									}
									link="/projects"
								/>
								<StatsCard
									title={t('clients.title')}
									count={clients.length}
									link="/clients"
								/>
								<StatsCard
									title={t('tasks.title')}
									count={tasks.length}
									link="/tasks"
								/>
								<StatsCard
									title={t('timeEntries.title')}
									count={timeEntries.length}
									link="/time-entries"
								/>
							</div>

							{/* Quick links */}
							<div className="bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] rounded-lg shadow-sm p-4 border border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
								<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 dynamic-color">
									{t('dashboard.quickLinks')}
								</h3>
								<nav className="space-y-2">
									<QuickLink
										href="/time-entries/new"
										title={t('timeEntries.new')}
									/>
									<QuickLink
										href="/projects/new"
										title={t('projects.new')}
									/>
									<QuickLink
										href="/tasks/new"
										title={t('tasks.new')}
									/>
									<QuickLink
										href="/clients/new"
										title={t('clients.new')}
									/>
									<QuickLink
										href="/reports"
										title={t('reports.title')}
									/>
								</nav>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	)
}

interface StatsCardProps {
	title: string
	count: number
	link: string
}

const StatsCard = ({ title, count, link }: StatsCardProps) => {
	const { t } = useTranslation()

	return (
		<Link
			to={link}
			className="bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] p-4 hover:shadow-md transition-shadow flex flex-col h-full group rounded-lg shadow-sm border border-gray-200 dark:border-[rgb(var(--color-border-primary))]"
		>
			<div className="flex flex-col h-full">
				<div className="font-medium text-gray-500 dark:text-gray-400 text-sm">
					{title}
				</div>
				<div className="mt-2 text-3xl font-semibold dynamic-color">
					{count}
				</div>
				<div className="mt-auto pt-2 text-xs dynamic-color flex items-center">
					{t('common.viewAll')}
					<ArrowRightIcon className="ml-1 h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
				</div>
			</div>
		</Link>
	)
}

interface QuickLinkProps {
	href: string
	title: string
}

const QuickLink = ({ href, title }: QuickLinkProps) => {
	return (
		<Link
			to={href}
			className="flex utems-center py-2 px-3 rounded-md text-sm font-medium text-gray-500 dark:text-gray-400 hover:dynamic-bg-subtle hover:dynamic-color transition-colors group"
		>
			<PlusIcon className="h-5 w-5 mr-2" />
			<span>{title}</span>
			<ArrowRightIcon className="ml-auto h-4 w-4 text-gray-400 group-hover:dynamic-color group-hover:translate-x-0.5 transition-transform" />
		</Link>
	)
}

export default Dashboard
