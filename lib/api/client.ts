import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available (check both cookies and localStorage)
    if (typeof window !== 'undefined') {
      const token = getCookie('auth_token') || localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add business-id header if available (check both cookies and localStorage)
      const businessId = getCookie('business_id') || localStorage.getItem('business_id');
      if (businessId) {
        config.headers['X-Business-Id'] = businessId;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
              { refreshToken }
            );

            const { accessToken } = response.data;
            localStorage.setItem('auth_token', accessToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear all auth data
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('business_id');
            localStorage.removeItem('auth-storage'); // Clear Zustand persisted state

            // Clear cookies
            document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'business_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

            // Redirect to login
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        } else {
          // No refresh token available, clear all auth data
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('business_id');
          localStorage.removeItem('auth-storage'); // Clear Zustand persisted state

          // Clear cookies
          document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'business_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

          // Redirect to login
          window.location.href = '/login';
        }
      }
    }

    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
      // You can add custom handling here (e.g., show a toast notification)
    }

    return Promise.reject(error);
  }
);

export { apiClient };
