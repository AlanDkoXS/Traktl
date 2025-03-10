import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';

export const UserMenu = () => {
	const { t } = useTranslation();
	const { user, logout } = useAuthStore();

	return (
		<Menu as="div" className="relative ml-3">
			<div>
				<Menu.Button className="flex max-w-xs items-center rounded-full bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
					<span className="sr-only">Open user menu</span>
					{user?.picture ? (
						<img className="h-8 w-8 rounded-full" src={user.picture} alt={user.name} />
					) : (
						<UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
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
				<Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
					<div className="border-b border-gray-200 dark:border-gray-700 p-4">
						<p className="text-sm font-medium text-gray-700 dark:text-gray-200">
							{user?.name}
						</p>
						<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
							{user?.email}
						</p>
					</div>
					<Menu.Item>
						{({ active }) => (
							<button
								onClick={() => logout()}
								className={`${
									active ? 'bg-gray-100 dark:bg-gray-700' : ''
								} block w-full text-left p-4 text-sm text-gray-700 dark:text-gray-200`}
							>
								{t('auth.signOut')}
							</button>
						)}
					</Menu.Item>
				</Menu.Items>
			</Transition>
		</Menu>
	);
};
