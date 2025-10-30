import axios from 'axios';

// Dynamically determine base URL
// - In browser: use current origin (works on any port)
// - In server/build: use env variable (for production or SSR)
const getBaseURL = () => {
  // Client-side: use current origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Server-side: require env variable
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error(
      'NEXT_PUBLIC_API_URL is not configured. Please add it to your environment variables.'
    );
  }
  return process.env.NEXT_PUBLIC_API_URL;
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
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
        // Clear all auth data and redirect to login
        // Token refresh is handled automatically by Supabase
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

    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
      // You can add custom handling here (e.g., show a toast notification)
    }

    return Promise.reject(error);
  }
);

export { apiClient };
