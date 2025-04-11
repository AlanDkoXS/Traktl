import { ReactNode, useState, useEffect } from 'react'
import { UserMenu } from '../components/UserMenu'
import { AppIcon } from '../components/AppIcon'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import {
	HomeIcon,
	ClipboardDocumentListIcon,
	UserGroupIcon,
	ClockIcon,
	ChartBarIcon,
	Cog6ToothIcon,
	Bars3Icon,
	XMarkIcon,
	TagIcon,
	ClockIcon as TimerIcon,
} from '@heroicons/react/24/outline'
import { StickyTimer } from '../components/timer/StickyTimer'

interface MainLayoutProps {
	children: ReactNode
}

export const MainLayout = ({ children }: MainLayoutProps) => {
	const { t } = useTranslation()
	const location = useLocation()
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	useEffect(() => {
		setIsMobileMenuOpen(false)
	}, [location.pathname])

	useEffect(() => {
		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsMobileMenuOpen(false)
			}
		}

		window.addEventListener('keydown', handleEsc)
		return () => window.removeEventListener('keydown', handleEsc)
	}, [])

	useEffect(() => {
		if (isMobileMenuOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}

		return () => {
			document.body.style.overflow = ''
		}
	}, [isMobileMenuOpen])

	const navigation = [
		{ name: t('nav.dashboard'), href: '/', icon: HomeIcon },
		{
			name: t('nav.projects'),
			href: '/projects',
			icon: ClipboardDocumentListIcon,
		},
		{ name: t('nav.clients'), href: '/clients', icon: UserGroupIcon },
		{ name: t('nav.tasks'), href: '/tasks', icon: ClockIcon },
		{ name: t('tags.title'), href: '/tags', icon: TagIcon },
		{
			name: t('timerPresets.title'),
			href: '/timer-presets',
			icon: TimerIcon,
		},
		{ name: t('nav.reports'), href: '/reports', icon: ChartBarIcon },
		{ name: t('nav.settings'), href: '/settings', icon: Cog6ToothIcon },
	]

	return (
		<div className="flex h-full bg-gray-50 dark:bg-[rgb(var(--color-bg-canvas))]">
			{isMobileMenuOpen && (
				<div
					className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}

			{/* Mobile header */}
			<header className="fixed top-0 left-0 right-0 z-10 md:hidden bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),98%,0.3)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.2)] shadow-sm border-b border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
				<div className="flex items-center justify-between h-14 px-4">
					<button
						onClick={() => setIsMobileMenuOpen(true)}
						className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-[rgb(var(--color-fg-muted))] dark:hover:text-[rgb(var(--color-fg-default))] dark:hover:bg-[rgb(var(--color-bg-overlay))]"
						aria-label="Open menu"
					>
						<Bars3Icon className="h-6 w-6" />
					</button>

					<div className="flex items-center text-xl font-bold dynamic-color">
						<AppIcon className="w-12 h-12 mr-2" />
						{t('app.name')}
					</div>

					<UserMenu />
				</div>
			</header>

			{/* Sidebar */}
			<aside
				className={`fixed inset-y-0 left-0 z-30 md:flex md:flex-col w-64 transform transition-transform duration-300 ease-in-out
					${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
					md:translate-x-0 md:relative
					bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),98%,0.3)]
					dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.2)]
					shadow-lg border-r border-gray-200 dark:border-[rgb(var(--color-border-primary))]`}
			>
				<div className="h-16 flex items-center justify-between p-4 border-b border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
					<div className="flex items-center text-xl font-bold dynamic-color">
						<AppIcon className="w-12 h-12 mr-2" />
						{t('app.name')}
					</div>
					<div className="flex items-center">
						<button
							onClick={() => setIsMobileMenuOpen(false)}
							className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-[rgb(var(--color-fg-muted))] dark:hover:text-[rgb(var(--color-fg-default))] dark:hover:bg-[rgb(var(--color-bg-overlay))]"
							aria-label="Close menu"
						>
							<XMarkIcon className="h-5 w-5" />
						</button>
						<div className="hidden md:block">
							<UserMenu />
						</div>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto p-3 mt-6">
					<div className="space-y-1">
						{navigation.map((item) => {
							const isActive = location.pathname === item.href
							return (
								<Link
									key={item.name}
									to={item.href}
									className={`group flex items-center p-3 text-sm font-medium rounded-md transition-colors ${
										isActive
											? 'bg-[hsla(var(--color-project-hue),var(--color-project-saturation),var(--color-project-lightness),0.15)] text-[hsl(var(--color-project-hue),var(--color-project-saturation),35%)] dark:text-[hsl(var(--color-project-hue),calc(var(--color-project-saturation)*0.8),70%)]'
											: 'text-gray-700 hover:bg-[hsla(var(--color-project-hue),var(--color-project-saturation),var(--color-project-lightness),0.08)] hover:text-[hsl(var(--color-project-hue),var(--color-project-saturation),45%)] dark:text-[rgb(var(--color-fg-default))] dark:hover:text-[hsl(var(--color-project-hue),calc(var(--color-project-saturation)*0.8),65%)]'
									}`}
								>
									<item.icon
										className={`mr-3 h-5 w-5 ${
											isActive
												? 'text-[hsl(var(--color-project-hue),var(--color-project-saturation),var(--color-project-lightness))]'
												: 'text-gray-400 group-hover:text-[hsl(var(--color-project-hue),var(--color-project-saturation),var(--color-project-lightness))] dark:text-[rgb(var(--color-fg-muted))]'
										}`}
										aria-hidden="true"
									/>
									{item.name}
								</Link>
							)
						})}
					</div>
				</div>
			</aside>

			{/* Main content area */}
			<div className="flex-1 flex flex-col min-h-screen pt-14 md:pt-0 overflow-x-hidden">
				{/* Main content */}
				<main className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 w-full">
					{children}
				</main>

				{/* Footer */}
				<footer className="py-4 px-6 text-center text-xs text-gray-500 dark:text-gray-400">
					<p>
						{t('app.name')} © {new Date().getFullYear()}
					</p>
				</footer>
			</div>

			{/* Sticky Timer */}
			<StickyTimer />
		</div>
	)
}
