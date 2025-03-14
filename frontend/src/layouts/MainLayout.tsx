import { ReactNode, useState, useEffect } from 'react';
import { UserMenu } from '../components/UserMenu';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
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
} from '@heroicons/react/24/outline';
import { StickyTimer } from '../components/timer/StickyTimer';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSelector } from '../components/LanguageSelector';

interface MainLayoutProps {
	children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
	const { t } = useTranslation();
	const location = useLocation();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// No resetear los colores aquí - cada página debe manejar sus propios colores

	// Close mobile menu when location changes
	useEffect(() => {
		setIsMobileMenuOpen(false);
	}, [location.pathname]);

	// Close mobile menu when Escape key is pressed
	useEffect(() => {
		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsMobileMenuOpen(false);
			}
		};

		window.addEventListener('keydown', handleEsc);
		return () => window.removeEventListener('keydown', handleEsc);
	}, []);

	// Prevent scrolling when mobile menu is open
	useEffect(() => {
		if (isMobileMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	}, [isMobileMenuOpen]);

	const navigation = [
		{ name: t('nav.dashboard'), href: '/', icon: HomeIcon },
		{ name: t('nav.projects'), href: '/projects', icon: ClipboardDocumentListIcon },
		{ name: t('nav.clients'), href: '/clients', icon: UserGroupIcon },
		{ name: t('nav.tasks'), href: '/tasks', icon: ClockIcon },
		{ name: t('tags.title'), href: '/tags', icon: TagIcon },
		{ name: t('timerPresets.title'), href: '/timer-presets', icon: TimerIcon },
		{ name: t('nav.reports'), href: '/reports', icon: ChartBarIcon },
		{ name: t('nav.settings'), href: '/settings', icon: Cog6ToothIcon },
	];

	return (
		<div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[rgb(var(--color-bg-canvas))]">
			{/* Mobile menu overlay */}
			{isMobileMenuOpen && (
				<div
					className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}

			{/* Mobile header */}
			<header className="md:hidden bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),98%,0.3)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.2)] shadow-sm sticky top-0 z-20 px-4 py-2 border-b border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
				<div className="flex items-center justify-between h-12">
					<button
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-[rgb(var(--color-fg-muted))] dark:hover:text-[rgb(var(--color-fg-default))] dark:hover:bg-[rgb(var(--color-bg-overlay))]"
						aria-label="Open menu"
					>
						<Bars3Icon className="h-6 w-6" />
					</button>

					<div className="text-xl font-bold dynamic-color">{t('app.name')}</div>

					<UserMenu />
				</div>
			</header>

			{/* Sidebar for mobile */}
			<div
				className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),98%,0.3)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.2)] shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
					isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
				} border-r border-gray-200 dark:border-[rgb(var(--color-border-primary))]`}
			>
				<div className="h-16 flex items-center justify-between p-4 border-b border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
					<h1 className="text-xl font-bold dynamic-color">{t('app.name')}</h1>
					<button
						onClick={() => setIsMobileMenuOpen(false)}
						className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-[rgb(var(--color-fg-muted))] dark:hover:text-[rgb(var(--color-fg-default))] dark:hover:bg-[rgb(var(--color-bg-overlay))]"
						aria-label="Close menu"
					>
						<XMarkIcon className="h-5 w-5" />
					</button>
				</div>

				{/* Navigation links */}
				<nav className="p-3 mt-2">
					<div className="space-y-1">
						{navigation.map((item) => {
							const isActive = location.pathname === item.href;
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
							);
						})}
					</div>
				</nav>

				{/* Theme and language toggles in mobile menu */}
				<div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-[rgb(var(--color-border-primary))] flex items-center justify-between">
					<ThemeToggle />
					<LanguageSelector />
				</div>
			</div>

			{/* Desktop sidebar */}
			<div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:w-64 md:bg-gradient-to-br md:from-white md:to-[hsla(var(--color-project-hue),var(--color-project-saturation),98%,0.3)] md:dark:from-[rgb(var(--color-bg-inset))] md:dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.2)] md:shadow-md md:flex md:flex-col md:border-r md:border-gray-200 md:dark:border-[rgb(var(--color-border-primary))]">
				<div className="h-16 flex items-center justify-between p-4 border-b border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
					<h1 className="text-xl font-bold dynamic-color">{t('app.name')}</h1>
					<div className="flex items-center">
						<ThemeToggle />
						<UserMenu />
					</div>
				</div>
				<nav className="p-3 mt-6 flex-1">
					<div className="space-y-1">
						{navigation.map((item) => {
							const isActive = location.pathname === item.href;
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
										className={`mr-3 h-6 w-6 ${
											isActive
												? 'text-[hsl(var(--color-project-hue),var(--color-project-saturation),var(--color-project-lightness))]'
												: 'text-gray-400 group-hover:text-[hsl(var(--color-project-hue),var(--color-project-saturation),var(--color-project-lightness))] dark:text-[rgb(var(--color-fg-muted))]'
										}`}
										aria-hidden="true"
									/>
									{item.name}
								</Link>
							);
						})}
					</div>
				</nav>

				{/* Language selector in desktop sidebar footer */}
				<div className="p-4 border-t border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
					<LanguageSelector />
				</div>
			</div>

			{/* Main content */}
			<div className="flex-1 md:ml-64">
				{/* Desktop header */}
				<header className="hidden md:block bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),98%,0.3)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.2)] shadow-sm sticky top-0 z-10 border-b border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
					<div className="h-12 px-6 flex items-center justify-end">
						{/* Podríamos poner algunos elementos aquí si se necesitan */}
					</div>
				</header>

				{/* Page content */}
				<main className="max-w-7xl mx-auto p-4 sm:p-6">{children}</main>

				{/* Footer con información adicional */}
				<footer className="mt-auto py-4 px-6 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
					<p>{t('app.name')} © {new Date().getFullYear()}</p>
				</footer>
			</div>

			{/* Sticky Timer */}
			<StickyTimer />
		</div>
	);
};
