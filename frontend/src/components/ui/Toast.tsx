import { Fragment } from 'react'
import { Transition } from '@headlessui/react'
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid'
import { useTranslation } from 'react-i18next'

interface ToastProps {
	show: boolean
	type: 'work' | 'break' | 'complete'
}

export const Toast = ({ show, type }: ToastProps) => {
	const { t } = useTranslation()

	// Determine icon based on type
	const getIcon = () => {
		switch (type) {
			case 'work':
				return <PlayIcon className="h-5 w-5 dynamic-color" />
			case 'break':
				return <PauseIcon className="h-5 w-5 dynamic-color" />
			case 'complete':
				return (
					<svg
						className="h-5 w-5 dynamic-color"
						fill="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
					</svg>
				)
			default:
				return <PlayIcon className="h-5 w-5 dynamic-color" />
		}
	}

	// Get translated message based on type
	const getMessage = () => {
		switch (type) {
			case 'work':
				return t('timer.workSessionComplete')
			case 'break':
				return t('timer.breakSessionComplete')
			case 'complete':
				return t('timer.allSessionsComplete')
			default:
				return ''
		}
	}

	return (
		<Transition
			show={show}
			as={Fragment}
			enter="transform ease-out duration-300 transition"
			enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
			enterTo="translate-y-0 opacity-100 sm:translate-x-0"
			leave="transition ease-in duration-100"
			leaveFrom="opacity-100"
			leaveTo="opacity-0"
		>
			<div className="fixed inset-x-0 top-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:items-start sm:justify-end sm:p-6">
				<div className="w-full max-w-sm bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
					<div className="p-4">
						<div className="flex items-start">
							<div className="flex-shrink-0 dynamic-bg-subtle rounded-full p-1.5 mr-3">
								{getIcon()}
							</div>
							<div className="flex-1 w-0 pt-0.5">
								<p className="text-sm font-medium dynamic-color">
									{type === 'work'
										? t('timer.workTime')
										: type === 'break'
											? t('timer.breakTime')
											: t('timer.sessionsCompleted')}
								</p>
								<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
									{getMessage()}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Transition>
	)
}
