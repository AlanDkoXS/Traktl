import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom'
import { useEffect, Suspense, lazy } from 'react'
import { MainLayout } from './layouts/MainLayout'
import { useTheme } from './hooks/useTheme'
import { useAuthStore } from './store/authStore'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SocketProvider } from './context/SocketContext'
import { ErrorProvider } from './context/ErrorContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { GlobalError } from './components/ErrorBoundary'
import { checkCurrentToken } from './utils/tokenHelper'
import {
	setProjectColor,
	setDefaultColorForSection,
} from './utils/dynamicColors'
import DataInitializer from './components/DataInitializer'
import ServerLoadingModal from './components/ServerLoadingModal'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Projects = lazy(() => import('./pages/Projects'))
const CreateProject = lazy(() => import('./pages/CreateProject'))
const EditProject = lazy(() => import('./pages/EditProject'))
const Clients = lazy(() => import('./pages/Clients'))
const CreateClient = lazy(() => import('./pages/CreateClient'))
const EditClient = lazy(() => import('./pages/EditClient'))
const Tasks = lazy(() => import('./pages/Tasks'))
const CreateTask = lazy(() => import('./pages/CreateTask'))
const EditTask = lazy(() => import('./pages/EditTask'))
const TimeEntries = lazy(() => import('./pages/TimeEntries'))
const CreateTimeEntry = lazy(() => import('./pages/CreateTimeEntry'))
const Reports = lazy(() => import('./pages/Reports'))
const Settings = lazy(() => import('./pages/Settings'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const Tags = lazy(() => import('./pages/Tags'))
const CreateTag = lazy(() => import('./pages/CreateTag'))
const EditTag = lazy(() => import('./pages/EditTag'))
const TimerPresets = lazy(() => import('./pages/TimerPresets'))
const CreateTimerPreset = lazy(() => import('./pages/CreateTimerPreset'))
const EditTimerPreset = lazy(() => import('./pages/EditTimerPreset'))

const LoadingFallback = () => (
	<div className="min-h-screen flex items-center justify-center">
		<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
	</div>
)

function App() {
	useTheme()
	const { loadUser } = useAuthStore()

	useEffect(() => {
		setDefaultColorForSection('app', '#0284c7')
		setDefaultColorForSection('client', '#0284c7')
		setDefaultColorForSection('task', '#0284c7')
		setDefaultColorForSection('tag', '#0284c7')

		const defaultAppColor =
			localStorage.getItem('default-app-color') || '#0284c7'
		const projectColor = localStorage.getItem('project-color')
		if (!projectColor) {
			setProjectColor(defaultAppColor)
		}
	}, [])

	useEffect(() => {
		const tokenInfo = checkCurrentToken()
		if (tokenInfo.valid) {
			loadUser()
		}
	}, [loadUser])

	return (
		<ErrorBoundary>
			<ErrorProvider>
				<Router>
					<SocketProvider>
						<ServerLoadingModal />
						<GlobalError />
						<DataInitializer />
						<Suspense fallback={<LoadingFallback />}>
							<Routes>
								{/* Public routes */}
								<Route path="/login" element={<Login />} />
								<Route
									path="/register"
									element={<Register />}
								/>
								<Route
									path="/forgot-password"
									element={<ForgotPassword />}
								/>
								<Route
									path="/reset-password/:token"
									element={<ResetPassword />}
								/>
								<Route
									path="/reset-password"
									element={<ResetPassword />}
								/>
								<Route
									path="/verify-email/:token"
									element={<VerifyEmail />}
								/>
								<Route
									path="/verify-email"
									element={<VerifyEmail />}
								/>

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

								{/* Catch all route */}
								<Route
									path="*"
									element={<Navigate to="/" replace />}
								/>
							</Routes>
						</Suspense>
					</SocketProvider>
				</Router>
			</ErrorProvider>
		</ErrorBoundary>
	)
}

export default App
