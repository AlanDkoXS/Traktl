import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { CreateProject } from './pages/CreateProject';
import { EditProject } from './pages/EditProject';
import { Clients } from './pages/Clients';
import { CreateClient } from './pages/CreateClient';
import { EditClient } from './pages/EditClient';
import { Tasks } from './pages/Tasks';
import { CreateTask } from './pages/CreateTask';
import { EditTask } from './pages/EditTask';
import { TimeEntries } from './pages/TimeEntries';
import { CreateTimeEntry } from './pages/CreateTimeEntry';
import { EditTimeEntry } from './pages/EditTimeEntry';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { useTheme } from './hooks/useTheme';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  // Initialize theme
  useTheme();
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
  );
}

export default App;
