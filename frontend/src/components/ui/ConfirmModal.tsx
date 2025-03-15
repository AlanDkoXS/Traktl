import { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

interface ConfirmModalProps {
	isOpen: boolean;
	title: string;
	message: string;
	confirmButtonText: string;
	cancelButtonText: string;
	onConfirm: () => void;
	onCancel: () => void;
	isLoading?: boolean;
	danger?: boolean;
	showCancelButton?: boolean;
	onCancelButtonClick?: () => void;
}

export const ConfirmModal = ({
	isOpen,
	title,
	message,
	confirmButtonText,
	cancelButtonText,
	onConfirm,
	onCancel,
	isLoading = false,
	danger = true,
	showCancelButton = false,
	onCancelButtonClick,
}: ConfirmModalProps) => {
	const { t } = useTranslation();
	const cancelButtonRef = useRef(null);

	return (
		<Transition.Root show={isOpen} as={Fragment}>
			<Dialog
				as="div"
				className="relative z-50"
				initialFocus={cancelButtonRef}
				onClose={onCancelButtonClick || onCancel}
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
					<div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity" />
				</Transition.Child>

				<div className="fixed inset-0 z-10 overflow-y-auto">
					<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
							enterTo="opacity-100 translate-y-0 sm:scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 translate-y-0 sm:scale-100"
							leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
						>
							<Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gradient-to-br from-white to-[hsla(var(--color-project-hue),var(--color-project-saturation),96%,0.5)] dark:from-[rgb(var(--color-bg-inset))] dark:to-[hsla(var(--color-project-hue),calc(var(--color-project-saturation)*0.6),15%,0.3)] px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 w-full sm:max-w-lg sm:p-6 border border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
								<div className="sm:flex sm:items-start">
									{danger ? (
										<div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
											<ExclamationTriangleIcon
												className="h-6 w-6 text-red-600 dark:text-red-400"
												aria-hidden="true"
											/>
										</div>
									) : (
										<div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full dynamic-bg-subtle sm:mx-0 sm:h-10 sm:w-10">
											<InformationCircleIcon
												className="h-6 w-6 dynamic-color"
												aria-hidden="true"
											/>
										</div>
									)}
									<div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
										<Dialog.Title
											as="h3"
											className="text-lg font-medium leading-6 text-gray-900 dark:text-white dynamic-color"
										>
											{title}
										</Dialog.Title>
										<div className="mt-2">
											<p className="text-sm text-gray-500 dark:text-gray-400">
												{message}
											</p>
										</div>
									</div>
								</div>
								<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
									<button
										type="button"
										className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm sm:ml-3 sm:w-auto sm:text-sm ${
											danger
												? 'bg-red-600 hover:bg-red-700 focus:bg-red-700'
												: 'dynamic-bg hover:brightness-110 focus:brightness-110'
										} focus:outline-none`}
										onClick={onConfirm}
										disabled={isLoading}
									>
										{isLoading ? 'Loading...' : confirmButtonText}
									</button>
									{cancelButtonText && (
										<button
											type="button"
											className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-[rgb(var(--color-border-secondary))] bg-white dark:bg-[rgb(var(--color-bg-overlay))] px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-[rgb(var(--color-border-primary))] focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
											onClick={onCancel}
											ref={cancelButtonRef}
											disabled={isLoading}
										>
											{cancelButtonText}
										</button>
									)}
									{showCancelButton && onCancelButtonClick && (
										<button
											type="button"
											className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-[rgb(var(--color-border-secondary))] bg-white dark:bg-[rgb(var(--color-bg-overlay))] px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-[rgb(var(--color-border-primary))] focus:outline-none sm:mt-0 sm:mx-3 sm:w-auto sm:text-sm"
											onClick={onCancelButtonClick}
											disabled={isLoading}
										>
											{t('common.cancel')}
										</button>
									)}
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition.Root>
	);
};
