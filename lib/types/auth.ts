// Note: User type is defined in @/lib/stores/auth-store
// Import from there if needed
import type { User } from '@/lib/stores/auth-store';

// Auth request types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  businessName: string;
  email: string;
  password: string;
  phone: string;
  businessType: string;
  acceptTerms: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

// Auth response types
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
  businessId?: string;
  expiresIn?: number;
}

export interface LoginResponse extends AuthResponse {}

export interface RegisterResponse extends AuthResponse {
  businessId: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

// Auth error types
export interface AuthError {
  message: string;
  field?: string;
  code?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// Token payload type (for JWT decoding)
export interface TokenPayload {
  userId: string;
  email: string;
  role: 'business' | 'influencer';
  businessId?: string;
  iat: number;
  exp: number;
}

// Auth state type (also defined in auth-store with actions)
export interface AuthState {
  user: User | null;
  token: string | null;
  businessId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
