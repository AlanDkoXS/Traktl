import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import type { InitOptions } from 'i18next'

// Import translations
import enTranslation from './locales/en.json'
import esTranslation from './locales/es.json'
import trTranslation from './locales/tr.json'

// Initialize i18next with improved language detection
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
		// Order of language detection methods
		order: ['localStorage', 'navigator', 'htmlTag', 'path'],
		// Cache detected language in localStorage
		caches: ['localStorage'],
		// Look for language info in HTML
		lookupFromPathIndex: 0,
		lookupFromSubdomainIndex: 0,
		// Don't use cookies to avoid unnecessary headers
		lookupCookie: 'i18next',
		// HTML lang attribute
		htmlTag: document.documentElement,
	},
	// Supported languages
	supportedLngs: ['en', 'es', 'tr'],
	debug: process.env.NODE_ENV === 'development',
	interpolation: {
		escapeValue: false, // React already escapes by default
	},
	// Ensure translations are loaded before initial render
	initImmediate: false,
}

i18n.use(LanguageDetector)
	.use(initReactI18next)
	.init(i18nConfig)

export default i18n
