import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

console.log('API_URL:', API_URL)

const api = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
})

api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('auth-token')
		console.log('Using token:', token)

		if (token) {
			config.headers.Authorization = `Bearer ${token}`
			config.headers['x-auth-token'] = token
		}

		console.log(
			'Request config:',
			`${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
			'Headers:',
			JSON.stringify(config.headers, null, 2),
		)
		return config
	},
	(error) => Promise.reject(error),
)

api.interceptors.response.use(
	(response) => {
		console.log('Response received:', response.status)
		console.log('Response data:', JSON.stringify(response.data, null, 2))
		return response
	},
	(error) => {
		console.error(
			'API Error response:',
			error.response
				? {
						status: error.response.status,
						statusText: error.response.statusText,
						data: error.response.data,
					}
				: error.message,
		)

		if (error.response && error.response.status === 401) {
			console.log(
				'401 error detected, removing token and redirecting to login',
			)
			localStorage.removeItem('auth-token')
			if (!window.location.pathname.includes('/login')) {
				window.location.href = '/login'
			}
		}

		if (error.response) {
			error.message =
				error.response.data?.message || 'Error en la petición'
		} else if (error.request) {
			error.message =
				'No se recibió respuesta del servidor. Verifica tu conexión a internet.'
		}

		return Promise.reject(error)
	},
)

export default api
