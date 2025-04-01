import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import {
	UserCircleIcon,
	InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../store/authStore'
import { ThemeToggle } from './ThemeToggle'
import { LanguageSelector } from './LanguageSelector'
import { Dialog } from '@headlessui/react'
import AQLogo from '../assets/aq-logo'

export const UserMenu = () => {
	const { t } = useTranslation()
	const { user, logout } = useAuthStore()
	const [aboutModalOpen, setAboutModalOpen] = useState(false)

	return (
		<>
			<Menu as="div" className="relative ml-3">
				<div>
					<Menu.Button className="flex max-w-xs items-center rounded-full bg-white dark:bg-[rgb(var(--color-bg-inset))] text-sm focus:outline-none focus:ring-2 focus:dynamic-border focus:ring-offset-2">
						<span className="sr-only">Open user menu</span>
						{user?.picture ? (
							<img
								className="h-8 w-8 rounded-full"
								src={user.picture}
								alt={user.name}
							/>
						) : (
							<UserCircleIcon
								className="h-8 w-8 text-gray-400"
								aria-hidden="true"
							/>
						)}
					</Menu.Button>
				</div>
				<Transition
					as={Fragment}
					enter="transition ease-out duration-100"
					enterFrom="transform opacity-0 scale-95"
					enterTo="transform opacity-100 scale-100"
					leave="transition ease-in duration-75"
					leaveFrom="transform opacity-100 scale-100"
					leaveTo="transform opacity-0 scale-95"
				>
					<Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-[rgb(var(--color-bg-inset))] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border dark:border-[rgb(var(--color-border-primary))]">
						<div className="border-b border-gray-200 dark:border-[rgb(var(--color-border-primary))] p-4">
							<p className="text-sm font-medium text-gray-700 dark:text-[rgb(var(--color-fg-default))]">
								{user?.name}
							</p>
							<p className="text-xs text-gray-500 dark:text-[rgb(var(--color-fg-muted))] truncate">
								{user?.email}
							</p>
						</div>

						{/* Tema */}
						<div className="border-b border-gray-200 dark:border-[rgb(var(--color-border-primary))] p-2">
							<div className="px-2 py-1 text-xs text-gray-500 dark:text-[rgb(var(--color-fg-muted))]">
								{t('theme.title', 'Theme')}
							</div>
							<div className="flex justify-center my-1">
								<ThemeToggle />
							</div>
						</div>

						{/* Idioma */}
						<div className="border-b border-gray-200 dark:border-[rgb(var(--color-border-primary))] p-2">
							<div className="px-2 py-1 text-xs text-gray-500 dark:text-[rgb(var(--color-fg-muted))]">
								{t('settings.language')}
							</div>
							<div className="my-1">
								<LanguageSelector />
							</div>
						</div>

						{/* Acerca de */}
						<Menu.Item>
							{({ active }) => (
								<button
									onClick={() => setAboutModalOpen(true)}
									className={`${
										active
											? 'bg-gray-100 dark:bg-[rgb(var(--color-bg-overlay))]'
											: ''
									} block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-[rgb(var(--color-fg-default))]`}
								>
									<div className="flex items-center">
										<InformationCircleIcon className="h-5 w-5 mr-2" />
										{t('about.title', 'About')}
									</div>
								</button>
							)}
						</Menu.Item>

						{/* Cerrar sesión */}
						<Menu.Item>
							{({ active }) => (
								<button
									onClick={() => logout()}
									className={`${
										active
											? 'bg-gray-100 dark:bg-[rgb(var(--color-bg-overlay))]'
											: ''
									} block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-[rgb(var(--color-fg-default))]`}
								>
									{t('auth.signOut')}
								</button>
							)}
						</Menu.Item>
					</Menu.Items>
				</Transition>
			</Menu>

			{/* Modal de Acerca de */}
			<Dialog
				open={aboutModalOpen}
				onClose={() => setAboutModalOpen(false)}
				className="relative z-50"
			>
				<div
					className="fixed inset-0 bg-black/50 backdrop-blur-[2px]"
					aria-hidden="true"
				/>

				<div className="fixed inset-0 flex items-center justify-center p-4">
					<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg border border-gray-200 dark:border-[rgb(var(--color-border-primary))] bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] p-6 text-left align-middle shadow-xl transition-all">
						<Dialog.Title
							as="h3"
							className="text-lg font-medium leading-6 text-gray-900 dark:text-white dynamic-color"
						>
							{t('about.title', 'About Traktl')}
						</Dialog.Title>

						<div className="mt-4 flex flex-col items-center">
							<div className="w-24 h-24 flex items-center justify-center mb-6">
								<AQLogo />
							</div>

							<div className="text-sm text-gray-500 dark:text-gray-400">
								<p className="mb-1">Traktl</p>
								<p className="mb-1">
									{t('about.version', 'Version')} 0.1.b
								</p>
								<p className="mb-1">
									{t('about.createdBy', 'Created by')} Alan
									Quintana
								</p>
								<p className="mb-1">
									{t('about.contact', 'Contact')}:
									<a
										href="mailto:hello@alanquintana.pro"
										className="ml-1 text-primary-600 dark:text-primary-400 hover:underline"
									>
										hello@alanquintana.pro
									</a>
								</p>
								<p>
									Web:{' '}
									<a
										href="https://www.alanquinana.pro"
										target="_blank"
										rel="noopener noreferrer"
										className="ml-1 text-primary-600 dark:text-primary-400 hover:underline"
									>
										www.alanquinana.pro
									</a>
								</p>
							</div>
						</div>

						<div className="mt-6 flex justify-end">
							<button
								type="button"
								className="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white dynamic-bg focus:outline-none"
								onClick={() => setAboutModalOpen(false)}
							>
								{t('common.close', 'Close')}
							</button>
						</div>
					</Dialog.Panel>
				</div>
			</Dialog>
		</>
	)
}
