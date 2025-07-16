import { Fragment, ReactNode, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'

interface ModalProps {
	isOpen: boolean
	onClose: () => void
	title: string
	children: ReactNode
	maxWidth?: string
}

export const Modal = ({
	isOpen,
	onClose,
	title,
	children,
	maxWidth = 'max-w-lg',
}: ModalProps) => {
	useEffect(() => {
		if (isOpen) {
			const originalStyle = window.getComputedStyle(
				document.body,
			).overflow
			document.body.style.overflow = 'hidden'
			return () => {
				document.body.style.overflow = originalStyle
			}
		}
	}, [isOpen])

	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog
				as="div"
				className="relative z-50 modal-stacked"
				onClose={onClose}
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
					<div className="fixed inset-0 bg-black/50 overlay-blur-global modal-stacked-backdrop" />
				</Transition.Child>

				<div className="fixed inset-0 overflow-y-auto">
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
							<Dialog.Panel
								className={`${maxWidth} w-full transform overflow-hidden rounded-lg border border-gray-200 dark:border-[rgb(var(--color-border-primary))] bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] p-6 text-left align-middle shadow-xl transition-all backdrop-blur-global`}
							>
								<Dialog.Title
									as="h3"
									className="text-lg font-medium leading-6 text-gray-900 dark:text-white dynamic-color"
								>
									{title}
								</Dialog.Title>
								<div className="mt-4">{children}</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	)
}
