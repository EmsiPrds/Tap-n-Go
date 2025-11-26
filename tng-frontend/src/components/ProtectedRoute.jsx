import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import API from '../services/api';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * Verifies token validity before rendering children
 */
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('authToken');
      
      // No token, not authenticated
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Verify token is still valid
        const response = await API.get('/auth/verify');
        
        if (response.data.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          // Clear invalid tokens
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
        }
      } catch (error) {
        // Token invalid or expired
        setIsAuthenticated(false);
        // Clear invalid tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [location.pathname]); // Re-verify on route change

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c417b]"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Render protected content
  return children;
}

export default ProtectedRoute;
