import api from './api'
import { TimerPreset } from '../types'

type RawTimerPreset = {
	_id?: string
	id?: string
	name: string
	workDuration: number
	breakDuration: number
	repetitions?: number
	user?: string | { _id?: string }
	createdAt?: string | Date
	updatedAt?: string | Date
}

type ApiResponse<T> =
	| {
			data?: T | T[]
	  }
	| T
	| T[]

const formatTimerPreset = (
	preset: RawTimerPreset | null,
): TimerPreset | null => {
	if (!preset) return null

	return {
		id: preset._id || preset.id || '',
		name: preset.name,
		workDuration: preset.workDuration,
		breakDuration: preset.breakDuration,
		repetitions: preset.repetitions || 1,
		user:
			typeof preset.user === 'object'
				? preset.user._id || ''
				: preset.user || '',
		createdAt: preset.createdAt ? new Date(preset.createdAt) : new Date(),
		updatedAt: preset.updatedAt ? new Date(preset.updatedAt) : new Date(),
	}
}

export const timerPresetService = {
	getTimerPresets: async (): Promise<TimerPreset[]> => {
		try {
			console.log('Fetching timer presets...')
			const response =
				await api.get<ApiResponse<RawTimerPreset>>('/timer-presets')
			console.log('Timer presets response:', response.data)

			let presets: RawTimerPreset[] = []
			if (Array.isArray(response.data)) {
				presets = response.data
			} else if (
				response.data &&
				typeof response.data === 'object' &&
				'data' in response.data &&
				Array.isArray(response.data.data)
			) {
				presets = response.data.data as RawTimerPreset[]
			} else {
				console.error(
					'Unexpected timer presets response format:',
					response.data,
				)
				return []
			}

			return presets
				.map((preset) => formatTimerPreset(preset))
				.filter((preset): preset is TimerPreset => preset !== null)
		} catch (error: unknown) {
			console.error('Error fetching timer presets:', error)
			throw error
		}
	},

	getTimerPreset: async (id: string): Promise<TimerPreset> => {
		try {
			console.log(`Fetching timer preset with id: ${id}`)
			const response = await api.get<ApiResponse<RawTimerPreset>>(
				`/timer-presets/${id}`,
			)
			console.log('Timer preset response:', response.data)

			let preset: RawTimerPreset | null = null
			if (
				response.data &&
				typeof response.data === 'object' &&
				'data' in response.data
			) {
				preset = response.data.data as RawTimerPreset
			} else {
				preset = response.data as RawTimerPreset
			}

			const formattedPreset = formatTimerPreset(preset)
			if (!formattedPreset) {
				throw new Error(
					`Timer preset with id ${id} not found or invalid format`,
				)
			}

			return formattedPreset
		} catch (error: unknown) {
			console.error('Error fetching timer preset:', error)
			throw error
		}
	},

	createTimerPreset: async (
		timerPreset: Omit<
			TimerPreset,
			'id' | 'user' | 'createdAt' | 'updatedAt'
		>,
	): Promise<TimerPreset> => {
		try {
			console.log('Creating timer preset with data:', timerPreset)
			const response = await api.post<ApiResponse<RawTimerPreset>>(
				'/timer-presets',
				timerPreset,
			)

			let newPreset: RawTimerPreset | null = null
			if (
				response.data &&
				typeof response.data === 'object' &&
				'data' in response.data
			) {
				newPreset = response.data.data as RawTimerPreset
			} else {
				newPreset = response.data as RawTimerPreset
			}

			const formattedPreset = formatTimerPreset(newPreset)
			if (!formattedPreset) {
				throw new Error(
					'Failed to create timer preset or invalid format returned',
				)
			}

			return formattedPreset
		} catch (error: unknown) {
			console.error('Error creating timer preset:', error)
			throw error
		}
	},

	updateTimerPreset: async (
		id: string,
		timerPreset: Partial<
			Omit<TimerPreset, 'id' | 'user' | 'createdAt' | 'updatedAt'>
		>,
	): Promise<TimerPreset> => {
		try {
			console.log(`Updating timer preset ${id} with data:`, timerPreset)
			const response = await api.put<ApiResponse<RawTimerPreset>>(
				`/timer-presets/${id}`,
				timerPreset,
			)

			let updatedPreset: RawTimerPreset | null = null
			if (
				response.data &&
				typeof response.data === 'object' &&
				'data' in response.data
			) {
				updatedPreset = response.data.data as RawTimerPreset
			} else {
				updatedPreset = response.data as RawTimerPreset
			}

			const formattedPreset = formatTimerPreset(updatedPreset)
			if (!formattedPreset) {
				throw new Error(
					`Failed to update timer preset with id ${id} or invalid format returned`,
				)
			}

			return formattedPreset
		} catch (error: unknown) {
			console.error('Error updating timer preset:', error)
			throw error
		}
	},

	deleteTimerPreset: async (id: string): Promise<void> => {
		try {
			console.log(`Deleting timer preset with id: ${id}`)
			await api.delete(`/timer-presets/${id}`)
		} catch (error: unknown) {
			console.error('Error deleting timer preset:', error)
			throw error
		}
	},

	syncCurrentSettings: async (settings: {
		workDuration: number
		breakDuration: number
		repetitions: number
	}): Promise<unknown> => {
		try {
			console.log(
				'[TimerPresetService] Iniciando sincronización de configuraciones:',
				settings,
			)

			const token = localStorage.getItem('auth-token')
			if (!token) {
				console.error(
					'[TimerPresetService] No se encontró token de autenticación',
				)
				throw new Error('No hay token de autenticación')
			}

			console.log('[TimerPresetService] Enviando solicitud al backend...')
			const response = await api.post(
				'/timer-presets/sync-settings',
				settings,
			)

			console.log(
				'[TimerPresetService] Respuesta del backend:',
				response.data,
			)
			return response.data
		} catch (error: unknown) {
			console.error(
				'[TimerPresetService] Error al sincronizar configuraciones:',
				error,
			)
			if (error && typeof error === 'object' && 'response' in error) {
				const axiosError = error as {
					response: { status: number; data: unknown }
				}
				console.error(
					'[TimerPresetService] Detalles del error del servidor:',
					{
						status: axiosError.response.status,
						data: axiosError.response.data,
					},
				)
			}
			throw error
		}
	},
}
