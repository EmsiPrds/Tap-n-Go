import axios from 'axios';

// Create axios instance with default configuration
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true, // Enable cookies for httpOnly tokens
    timeout: 15000, // 15 second timeout
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Request Interceptor
 * Automatically attaches access token to requests
 */
API.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('authToken');
        
        // Add token to Authorization header if available
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 * Handles token refresh and error responses
 */
API.interceptors.response.use(
    (response) => {
        // Return successful responses as-is
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized errors (token expired or invalid)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Check if it's a token expiration error
            const isTokenExpired = error.response?.data?.code === 'TOKEN_EXPIRED' ||
                                   error.response?.data?.code === 'REFRESH_TOKEN_EXPIRED';

            // Try to refresh token if we have a refresh token
            const refreshToken = localStorage.getItem('refreshToken');
            
            if (refreshToken && !isTokenExpired) {
                try {
                    // Attempt to refresh the access token
                    const response = await axios.post(
                        `${API.defaults.baseURL}/auth/refresh`,
                        { refreshToken },
                        {
                            withCredentials: true,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (response.data.success) {
                        const { accessToken } = response.data.data;
                        
                        // Update stored access token
                        localStorage.setItem('authToken', accessToken);
                        
                        // Retry original request with new token
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        return API(originalRequest);
                    }
                } catch (refreshError) {
                    // Refresh failed - clear tokens and redirect to login
                    console.error('Token refresh failed:', refreshError);
                    handleAuthFailure();
                    return Promise.reject(refreshError);
                }
            }

            // No refresh token or refresh failed - clear auth and redirect
            if (isTokenExpired || !refreshToken) {
                handleAuthFailure();
            }
        }

        // Handle network errors
        if (!error.response) {
            error.message = 'Network error. Please check your connection.';
        }

        return Promise.reject(error);
    }
);

/**
 * Handle authentication failure
 * Clears tokens and redirects to login
 */
const handleAuthFailure = () => {
    // Clear all auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    
    // Redirect to login page
    if (window.location.pathname !== '/') {
        window.location.href = '/';
    }
};

export default API;
