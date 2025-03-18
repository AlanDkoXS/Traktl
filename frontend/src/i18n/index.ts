import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translations
import enTranslation from './locales/en.json'
import esTranslation from './locales/es.json'
import trTranslation from './locales/tr.json'

// Initialize i18next with improved language detection
i18n.use(LanguageDetector)
	.use(initReactI18next)
	.init({
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
			order: ['navigator', 'htmlTag', 'path', 'localStorage'],
			// Cache detected language in localStorage
			caches: ['localStorage'],
			// Look for language info in HTML
			lookupFromPathIndex: 0,
			lookupFromSubdomainIndex: 0,
			// Don't use cookies to avoid unnecessary headers
			lookupCookie: 'i18next',
			cookieExpirationDate: new Date(
				Date.now() + 2 * 365 * 24 * 60 * 60 * 1000,
			), // 2 years
			// HTML lang attribute
			htmlTag: document.documentElement,
		},
		debug: process.env.NODE_ENV === 'development',
		interpolation: {
			escapeValue: false, // React already escapes by default
		},
		// Ensure translations are loaded before initial render
		initImmediate: false,
	})

export default i18n
