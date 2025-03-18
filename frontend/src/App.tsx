import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom'
import { useEffect } from 'react'
import { MainLayout } from './layouts/MainLayout'
import { Dashboard } from './pages/Dashboard'
import { Projects } from './pages/Projects'
import { CreateProject } from './pages/CreateProject'
import { EditProject } from './pages/EditProject'
import { Clients } from './pages/Clients'
import { CreateClient } from './pages/CreateClient'
import { EditClient } from './pages/EditClient'
import { Tasks } from './pages/Tasks'
import { CreateTask } from './pages/CreateTask'
import { EditTask } from './pages/EditTask'
import { TimeEntries } from './pages/TimeEntries'
import { CreateTimeEntry } from './pages/CreateTimeEntry'
import { EditTimeEntry } from './pages/EditTimeEntry'
import { Reports } from './pages/Reports'
import { Settings } from './pages/Settings'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { VerifyEmail } from './pages/VerifyEmail'
import { Tags } from './pages/Tags'
import { CreateTag } from './pages/CreateTag'
import { EditTag } from './pages/EditTag'
import { TimerPresets } from './pages/TimerPresets'
import { CreateTimerPreset } from './pages/CreateTimerPreset'
import { EditTimerPreset } from './pages/EditTimerPreset'
import { useTheme } from './hooks/useTheme'
import { useAuthStore } from './store/authStore'
import { ProtectedRoute } from './components/ProtectedRoute'
import { checkCurrentToken } from './utils/tokenHelper'
import {
	setProjectColor,
	setDefaultColorForSection,
} from './utils/dynamicColors'

function App() {
	// Initialize theme
	useTheme()
	const { loadUser } = useAuthStore()

	// Set up default colors for different sections
	useEffect(() => {
		// Configuración de colores por defecto para cada sección
		setDefaultColorForSection('app', '#0284c7') // Azul por defecto para la app en general
		setDefaultColorForSection('project', '#0284c7') // Azul para la sección de proyectos
		setDefaultColorForSection('client', '#0284c7') // Azul para clientes
		setDefaultColorForSection('task', '#0284c7') // Azul para tareas
		setDefaultColorForSection('timer', '#0284c7') // Azul para temporizador
		setDefaultColorForSection('tag', '#0284c7') // Azul para etiquetas

		// Establecer color inicial de la aplicación
		const defaultAppColor =
			localStorage.getItem('default-app-color') || '#0284c7'
		setProjectColor(defaultAppColor)
	}, [])

	useEffect(() => {
		console.log('App mounted, checking token and loading user...')
		const tokenInfo = checkCurrentToken()

		if (tokenInfo.valid) {
			console.log('Token valid, loading user...')
			loadUser()
		} else {
			console.log('Token invalid or expired:', tokenInfo.message)
		}
	}, [loadUser])

	return (
		<Router>
			<Routes>
				{/* Public routes */}
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/forgot-password" element={<ForgotPassword />} />
				<Route
					path="/reset-password/:token"
					element={<ResetPassword />}
				/>
				<Route path="/verify-email/:token" element={<VerifyEmail />} />

				{/* Protected routes */}
				<Route
					path="/"
					element={
						<ProtectedRoute>
							<MainLayout>
								<Dashboard />
							</MainLayout>
						</ProtectedRoute>
					}
				/>

				{/* Projects */}
				<Route
					path="/projects"
					element={
						<ProtectedRoute>
							<MainLayout>
								<Projects />
							</MainLayout>
						</ProtectedRoute>
					}
				/>

				<Route
					path="/projects/new"
					element={
						<ProtectedRoute>
							<MainLayout>
								<CreateProject />
							</MainLayout>
						</ProtectedRoute>
					}
				/>

				<Route
					path="/projects/:id"
					element={
						<ProtectedRoute>
							<MainLayout>
								<EditProject />
							</MainLayout>
						</ProtectedRoute>
					}
				/>

				{/* Clients */}
				<Route
					path="/clients"
					element={
						<ProtectedRoute>
							<MainLayout>
								<Clients />
							</MainLayout>
						</ProtectedRoute>
					}
				/>

				<Route
					path="/clients/new"
					element={
						<ProtectedRoute>
							<MainLayout>
								<CreateClient />
							</MainLayout>
						</ProtectedRoute>
					}
				/>

				<Route
					path="/clients/:id"
					element={
						<ProtectedRoute>
							<MainLayout>
								<EditClient />
							</MainLayout>
						</ProtectedRoute>
					}
				/>

				{/* Tasks */}
				<Route
					path="/tasks"
					element={
						<ProtectedRoute>
							<MainLayout>
								<Tasks />
							</MainLayout>
						</ProtectedRoute>
					}
				/>

				<Route
					path="/tasks/new"
					element={
						<ProtectedRoute>
							<MainLayout>
								<CreateTask />
							</MainLayout>
						</ProtectedRoute>
					}
				/>

				<Route
					path="/tasks/:id"
					element={
						<ProtectedRoute>
							<MainLayout>
								<EditTask />
							</MainLayout>
						</ProtectedRoute>
					}
				/>

				{/* Time Entries */}
				<Route
					path="/time-entries"
					element={
						<ProtectedRoute>
							<MainLayout>
								<TimeEntries />
							</MainLayout>
						</ProtectedRoute>
					}
				/>

				<Route
					path="/time-entries/new"
					element={
						<ProtectedRoute>
							<MainLayout>
								<CreateTimeEntry />
							</MainLayout>
						</ProtectedRoute>
					}
				/>

				<Route
					path="/time-entries/:id"
					element={
						<ProtectedRoute>
							<MainLayout>
								<EditTimeEntry />
							</MainLayout>
						</ProtectedRoute>
					}
				/>

				{/* Tags */}
				<Route
					path="/tags"
					element={
						<ProtectedRoute>
							<MainLayout>
								<Tags />
							</MainLayout>
						</ProtectedRoute>
					}
				/>

				<Route
					path="/tags/new"
					element={
						<ProtectedRoute>
							<MainLayout>
								<CreateTag />
							</MainLayout>
						</ProtectedRoute>
					}
				/>

				<Route
					path="/tags/:id"
					element={
						<ProtectedRoute>
							<MainLayout>
								<EditTag />
							</MainLayout>
						</ProtectedRoute>
					}
				/>

				{/* Timer Presets */}
				<Route
					path="/timer-presets"
					element={
						<ProtectedRoute>
							<MainLayout>
								<TimerPresets />
							</MainLayout>
						</ProtectedRoute>
					}
				/>

				<Route
					path="/timer-presets/new"
					element={
						<ProtectedRoute>
							<MainLayout>
								<CreateTimerPreset />
							</MainLayout>
						</ProtectedRoute>
					}
				/>

				<Route
					path="/timer-presets/:id"
					element={
						<ProtectedRoute>
							<MainLayout>
								<EditTimerPreset />
							</MainLayout>
						</ProtectedRoute>
					}
				/>

				{/* Reports */}
				<Route
					path="/reports"
					element={
						<ProtectedRoute>
							<MainLayout>
								<Reports />
							</MainLayout>
						</ProtectedRoute>
					}
				/>

				{/* Settings */}
				<Route
					path="/settings"
					element={
						<ProtectedRoute>
							<MainLayout>
								<Settings />
							</MainLayout>
						</ProtectedRoute>
					}
				/>

				{/* Fallback route */}
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</Router>
	)
}

export default App
