import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import { useClientStore } from '../store/clientStore'
import { useTimerStore } from '../store/timerStore'
import { Project } from '../types'

interface ProjectFormProps {
	project: Project | null
	isEditing?: boolean
}

export const ProjectForm = ({
	project,
	isEditing = false,
}: ProjectFormProps) => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const {
		createProject,
		updateProject,
		setProjectColor,
		selectProject,
		clearSelectedProject,
		selectedProject,
	} = useProjectStore()
	const { setProjectId } = useTimerStore()
	const { clients, fetchClients } = useClientStore()

	const [name, setName] = useState(project?.name || '')
	const [description, setDescription] = useState(project?.description || '')
	const [color, setColor] = useState(project?.color || '#3b82f6')
	const [clientId, setClientId] = useState(project?.client || '')
	const [status, setStatus] = useState<'active' | 'archived'>(
		project?.status || 'active',
	)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		fetchClients()
	}, [fetchClients])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!name) {
			setError(t('errors.required'))
			return
		}

		setIsSubmitting(true)
		setError('')

		try {
			if (isEditing && project) {
				const updatedProject = await updateProject(project.id, {
					name,
					description,
					color,
					client: clientId || null,
					status,
				})

				// Si el proyecto está activo, actualizar el color y seleccionarlo
				if (status === 'active') {
					setProjectColor(color)
					selectProject(updatedProject)
					setProjectId(updatedProject.id)
				} else {
					// Si el proyecto se archiva, deseleccionarlo si estaba seleccionado
					if (selectedProject?.id === project.id) {
						clearSelectedProject()
						setProjectId(null)
					}
				}

				// No navegar a otra página, permanecer en el formulario
			} else {
				await createProject({
					name,
					description,
					color,
					client: clientId || null,
					status,
				})
				navigate('/projects')
			}
		} catch (err: unknown) {
			console.error('Error al enviar el proyecto:', err)
			if (err instanceof Error) {
				setError(err.message || t('errors.serverError'))
			} else {
				setError(t('errors.serverError'))
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{error && (
				<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-md">
					{error}
				</div>
			)}

			<div>
				<label
					htmlFor="name"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					{t('projects.name')} *
				</label>
				<input
					type="text"
					id="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[hsl(var(--color-project-hue),var(--color-project-saturation),var(--color-project-lightness))] focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
					required
				/>
			</div>

			<div>
				<label
					htmlFor="description"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					{t('projects.description')}
				</label>
				<textarea
					id="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					rows={3}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[hsl(var(--color-project-hue),var(--color-project-saturation),var(--color-project-lightness))] focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
				/>
			</div>

			<div>
				<label
					htmlFor="color"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					{t('projects.color')}
				</label>
				<div className="mt-1 flex items-center">
					<input
						type="color"
						id="color"
						value={color}
						onChange={(e) => setColor(e.target.value)}
						className="h-8 w-8 p-0 rounded-md"
					/>
					<input
						title="color"
						type="text"
						value={color}
						onChange={(e) => setColor(e.target.value)}
						className="ml-2 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-[hsl(var(--color-project-hue),var(--color-project-saturation),var(--color-project-lightness))] focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
					/>
				</div>
			</div>

			<div>
				<label
					htmlFor="client"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					{t('projects.client')}
				</label>
				<select
					id="client"
					value={clientId}
					onChange={(e) => setClientId(e.target.value)}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[hsl(var(--color-project-hue),var(--color-project-saturation),var(--color-project-lightness))] focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
				>
					<option value="">{t('projects.noClient')}</option>
					{clients.map((client) => (
						<option key={client.id} value={client.id}>
							{client.name}
						</option>
					))}
				</select>
			</div>

			<div>
				<label
					htmlFor="status"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					{t('projects.status.title')}
				</label>
				<select
					id="status"
					value={status}
					onChange={(e) =>
						setStatus(e.target.value as 'active' | 'archived')
					}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[hsl(var(--color-project-hue),var(--color-project-saturation),var(--color-project-lightness))] focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
				>
					<option value="active">
						{t('projects.status.active')}
					</option>
					<option value="archived">
						{t('projects.status.archived')}
					</option>
				</select>
			</div>

			<div className="flex justify-end space-x-3">
				<button
					type="button"
					onClick={() => navigate('/projects')}
					className="btn btn-secondary"
				>
					{t('common.cancel')}
				</button>
				<button
					type="submit"
					disabled={isSubmitting}
					className="btn btn-primary"
				>
					{isSubmitting
						? t('common.loading')
						: isEditing
							? t('common.update')
							: t('common.create')}
				</button>
			</div>
		</form>
	)
}
