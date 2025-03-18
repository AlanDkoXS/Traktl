import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';

/** @type {import('eslint').Linter.Config[]} */
export default [
	{ files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
	{ files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
	{ languageOptions: { globals: globals.browser } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	pluginReact.configs.flat.recommended,
	// Añade esta configuración para desactivar la regla react/react-in-jsx-scope
	{
		files: ['**/*.{jsx,tsx}'],
		rules: {
			'react/react-in-jsx-scope': 'off',
		},
		settings: {
			react: {
				version: 'detect', // Detecta automáticamente la versión de React
			},
		},
	},
];
