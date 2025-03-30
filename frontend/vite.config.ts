import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd())

	return {
		plugins: [react()],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url)),
			},
		},
		server: {
			port: 3000,
			open: true,
			host: true, // Permite que la app sea accesible desde la red local
			origin: 'https://miscellaneous-plus-organisations-jobs.trycloudflare.com', // Añade el origen permitido
			proxy: {
				'/api': {
					target: env.VITE_API_URL || 'http://localhost:4000',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, ''),
				},
			},
		},
		build: {
			outDir: 'dist',
			sourcemap: true,
		},
	}
})
