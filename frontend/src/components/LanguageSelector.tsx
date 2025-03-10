import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu } from '@headlessui/react';
import { LanguageIcon } from '@heroicons/react/24/outline';

export const LanguageSelector = () => {
	const { i18n } = useTranslation();
	const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

	useEffect(() => {
		// Update state when language changes
		setCurrentLanguage(i18n.language);
	}, [i18n.language]);

	const languages = [
		{ code: 'en', name: 'English' },
		{ code: 'es', name: 'Español' },
	];

	const changeLanguage = (lng: string) => {
		i18n.changeLanguage(lng);
		setCurrentLanguage(lng);
	};

	return (
		<Menu as="div" className="relative">
			<Menu.Button className="flex items-center p-3 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
				<LanguageIcon className="h-5 w-5 mr-1" />
				<span>{languages.find((l) => l.code === currentLanguage)?.name || 'Language'}</span>
			</Menu.Button>
			<Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
				<div className="py-1">
					{languages.map((language) => (
						<Menu.Item key={language.code}>
							{({ active }) => (
								<button
									onClick={() => changeLanguage(language.code)}
									className={`${
										active
											? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
											: 'text-gray-700 dark:text-gray-200'
									} ${
										currentLanguage === language.code ? 'font-bold' : ''
									} block w-full text-left p-4 text-sm`}
								>
									{language.name}
								</button>
							)}
						</Menu.Item>
					))}
				</div>
			</Menu.Items>
		</Menu>
	);
};
