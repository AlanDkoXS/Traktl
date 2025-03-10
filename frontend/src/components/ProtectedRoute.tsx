import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { checkCurrentToken } from '../utils/tokenHelper';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, token, loadUser, isLoading } = useAuthStore();
  const location = useLocation();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    console.log('ProtectedRoute - Current state:', {
      isAuthenticated,
      hasToken: !!token,
      isLoading,
      path: location.pathname,
    });

    const checkAuth = async () => {
      const tokenInfo = checkCurrentToken();
      console.log('Token check result:', tokenInfo);

      if (tokenInfo.valid && !isAuthenticated && !isLoading) {
        console.log('ProtectedRoute - Valid token found, loading user...');
        try {
          await loadUser();
        } catch (error) {
          console.error('Error loading user in ProtectedRoute:', error);
        }
      }

      setAuthCheckComplete(true);
    };

    checkAuth();
  }, [token, isAuthenticated, isLoading, loadUser, location.pathname]);

  if (isLoading || !authCheckComplete) {
    console.log('ProtectedRoute - Loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login');
    // Save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('ProtectedRoute - Authenticated, rendering children');
  return <>{children}</>;
};
