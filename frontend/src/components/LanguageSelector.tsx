import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu } from '@headlessui/react'
import { LanguageIcon } from '@heroicons/react/24/outline'

export const LanguageSelector = () => {
	const { i18n, t } = useTranslation()
	const [currentLanguage, setCurrentLanguage] = useState(i18n.language)

	useEffect(() => {
		setCurrentLanguage(i18n.language)
	}, [i18n.language])

	const languages = [
		{ code: 'en', name: t('languages.english', 'English') },
		{ code: 'es', name: t('languages.spanish', 'Español') },
		{ code: 'tr', name: t('languages.turkish', 'Türkçe') },
	]

	const changeLanguage = (lng: string) => {
		localStorage.setItem('i18nextLng', lng)
		i18n.changeLanguage(lng)
	}

	return (
		<Menu as="div" className="relative">
			<Menu.Button className="flex items-center p-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
				<LanguageIcon className="h-5 w-5 mr-1" />
				<span>
					{languages.find((l) => l.code === currentLanguage)?.name ||
						t('settings.language')}
				</span>
			</Menu.Button>
			<Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
				<div className="py-1">
					{languages.map((language) => (
						<Menu.Item key={language.code}>
							{({ active }) => (
								<button
									type="button"
									onClick={() =>
										changeLanguage(language.code)
									}
									className={`${
										active
											? 'bg-gray-100 dark:bg-gray-700'
											: ''
									} ${
										currentLanguage === language.code
											? 'font-bold'
											: ''
									} block w-full text-left px-4 py-2 text-sm`}
								>
									{language.name}
								</button>
							)}
						</Menu.Item>
					))}
				</div>
			</Menu.Items>
		</Menu>
	)
}
