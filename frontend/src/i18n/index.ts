import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import type { InitOptions } from 'i18next'

import enTranslation from './locales/en.json'
import esTranslation from './locales/es.json'
import trTranslation from './locales/tr.json'

const i18nConfig: InitOptions = {
	resources: {
		en: {
			translation: enTranslation,
		},
		es: {
			translation: esTranslation,
		},
		tr: {
			translation: trTranslation,
		},
	},
	fallbackLng: 'en',
	detection: {
		order: ['localStorage', 'navigator', 'htmlTag', 'path'],
		caches: ['localStorage'],
		lookupFromPathIndex: 0,
		lookupFromSubdomainIndex: 0,
		lookupCookie: 'i18next',
		htmlTag: document.documentElement,
	},
	// Supported languages
	supportedLngs: ['en', 'es', 'tr'],
	debug: process.env.NODE_ENV === 'development',
	interpolation: {
		escapeValue: false,
	},
	initImmediate: false,
}

i18n.use(LanguageDetector).use(initReactI18next).init(i18nConfig)

export default i18n
