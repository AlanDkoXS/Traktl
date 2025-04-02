import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid'
import { useTranslation } from 'react-i18next'
import { useNotificationStore } from '../../services/notificationService'

export const TimerAlertModal = () => {
	const { t } = useTranslation()
	const { showModal, modalMessage, modalType, closeNotification } =
		useNotificationStore()

	// Determine icon based on type
	const getIcon = () => {
		switch (modalType) {
			case 'work':
				return <PlayIcon className="h-8 w-8 dynamic-color" />
			case 'break':
				return <PauseIcon className="h-8 w-8 dynamic-color" />
			case 'complete':
				return (
					<svg
						className="h-8 w-8 dynamic-color"
						fill="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
					</svg>
				)
			default:
				return <PlayIcon className="h-8 w-8 dynamic-color" />
		}
	}

	return (
		<Transition show={showModal} as={Fragment}>
			<Dialog
				as="div"
				className="relative z-50"
				onClose={closeNotification}
			>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black/50 backdrop-blur-[2px]" />
				</Transition.Child>

				<div className="fixed inset-0 z-10 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4 text-center">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] p-6 text-left align-middle shadow-xl transition-all border border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
								<div className="flex items-center">
									<div className="flex-shrink-0 dynamic-bg-subtle rounded-full p-2 mr-3">
										{getIcon()}
									</div>
									<Dialog.Title
										as="h3"
										className="text-lg font-medium leading-6 dynamic-color"
									>
										{modalType === 'work'
											? t('timer.workTime')
											: modalType === 'break'
												? t('timer.breakTime')
												: t('timer.sessionsCompleted')}
									</Dialog.Title>
								</div>

								<div className="mt-3">
									<p className="text-gray-600 dark:text-gray-300">
										{modalMessage}
									</p>
								</div>

								<div className="mt-4 flex justify-end">
									<button
										type="button"
										className="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium dynamic-bg text-white hover:brightness-110 focus:outline-none"
										onClick={closeNotification}
									>
										{t('common.done')}
									</button>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	)
}
