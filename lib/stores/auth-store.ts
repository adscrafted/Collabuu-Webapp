import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'business' | 'influencer';
  businessId?: string;
  businessName?: string;
  phone?: string;
  avatar?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  businessId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setBusinessId: (businessId: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (token: string, user: User, businessId?: string) => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      businessId: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set({ user, isAuthenticated: user !== null }),

      setToken: (token) => {
        set({ token });
        // Update API client authorization header
        if (token) {
          localStorage.setItem('auth_token', token);
        } else {
          localStorage.removeItem('auth_token');
        }
      },

      setBusinessId: (businessId) => set({ businessId }),

      setLoading: (isLoading) => set({ isLoading }),

      login: (token, user, businessId) => {
        set({
          token,
          user,
          businessId: businessId || user.businessId || null,
          isAuthenticated: true,
          isLoading: false,
        });
        // Store token in localStorage for API client
        localStorage.setItem('auth_token', token);
        if (businessId || user.businessId) {
          localStorage.setItem('business_id', businessId || user.businessId!);
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          businessId: null,
          isAuthenticated: false,
          isLoading: false,
        });
        // Clear localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('business_id');
      },

      refreshToken: async () => {
        // Token refresh is handled automatically by Supabase
        // This function is kept for compatibility but does nothing
        // Supabase auto-refresh is enabled in lib/supabase/client.ts
        return;
      },

      updateUser: (updates) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        businessId: state.businessId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
