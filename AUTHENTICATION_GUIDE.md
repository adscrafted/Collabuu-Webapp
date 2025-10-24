# Collabuu Authentication System

A complete, production-ready authentication system built with Next.js 14, TypeScript, Zustand, and React Query.

## Features

- **Secure Authentication**: JWT-based authentication with automatic token refresh
- **Form Validation**: Client-side validation with react-hook-form and Zod
- **State Management**: Zustand for auth state with persistence
- **API Integration**: Axios client with automatic token injection
- **Protected Routes**: Middleware for route protection and redirects
- **Business Context**: Multi-tenant support with business-id headers
- **Type Safety**: Full TypeScript support throughout
- **Modern UI**: Collabuu design system with Tailwind CSS
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Directory Structure

```
/Users/anthony/Documents/Projects/Collabuu-Webapp/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx              # Auth layout with branding
│   │   ├── login/
│   │   │   └── page.tsx            # Login page with validation
│   │   └── register/
│   │       └── page.tsx            # Registration page
│   └── (dashboard)/
│       └── dashboard/
│           └── page.tsx            # Protected dashboard example
├── lib/
│   ├── api/
│   │   ├── client.ts               # Axios client with interceptors
│   │   └── supabase.ts             # Supabase client (existing)
│   ├── auth/
│   │   └── cookies.ts              # Server-side cookie management
│   ├── hooks/
│   │   ├── use-auth.ts             # Main auth hook
│   │   ├── use-login.ts            # Login mutation hook
│   │   └── use-register.ts         # Registration mutation hook
│   ├── stores/
│   │   └── auth-store.ts           # Zustand auth store
│   ├── supabase/
│   │   └── client.ts               # Supabase browser/server clients
│   └── types/
│       └── auth.ts                 # Auth TypeScript types
├── components/
│   ├── auth/
│   │   ├── auth-provider.tsx       # Auth context provider
│   │   └── protected-route.tsx     # Protected route wrapper
│   └── providers.tsx               # React Query provider
└── middleware.ts                   # Route protection middleware
```

## Setup

### 1. Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Install Dependencies

All required dependencies are already installed:
- `@supabase/supabase-js` - Supabase client
- `@tanstack/react-query` - Data fetching and caching
- `zustand` - State management
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `axios` - HTTP client

## Usage

### Authentication Hook

The main authentication hook provides access to auth state and actions:

```tsx
'use client';

import { useAuth } from '@/lib/hooks/use-auth';

export function MyComponent() {
  const {
    user,
    token,
    businessId,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
    hasBusiness,
  } = useAuth();

  // Use auth state and actions
}
```

### Login

```tsx
'use client';

import { useLogin } from '@/lib/hooks/use-login';
import { useForm } from 'react-hook-form';

export function LoginForm() {
  const { mutate: login, isPending, error } = useLogin();
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    login({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### Registration

```tsx
'use client';

import { useRegister } from '@/lib/hooks/use-register';
import { useForm } from 'react-hook-form';

export function RegisterForm() {
  const { mutate: register, isPending, error } = useRegister();
  const { register: formRegister, handleSubmit } = useForm();

  const onSubmit = (data) => {
    register({
      businessName: data.businessName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      phone: data.phone,
      businessType: data.businessType,
      acceptTerms: data.acceptTerms,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### Protected Routes

#### Method 1: Using the ProtectedRoute Component

```tsx
'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';

export default function DashboardPage() {
  return (
    <ProtectedRoute requireBusiness>
      {/* Protected content */}
    </ProtectedRoute>
  );
}
```

#### Method 2: Using the useAuth Hook

```tsx
'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  return <div>{/* Protected content */}</div>;
}
```

### Middleware Protection

The middleware automatically protects routes. Configure protected routes in `/Users/anthony/Documents/Projects/Collabuu-Webapp/middleware.ts`:

```typescript
const protectedRoutes = [
  '/dashboard',
  '/campaigns',
  '/influencers',
  '/settings',
];
```

## API Integration

### Making Authenticated Requests

The API client automatically includes the auth token and business-id:

```typescript
import { apiClient } from '@/lib/api/client';

// GET request
const response = await apiClient.get('/campaigns');

// POST request
const response = await apiClient.post('/campaigns', {
  name: 'New Campaign',
});

// The Authorization header and X-Business-Id are automatically added
```

### Token Refresh

Token refresh is handled automatically:
- On 401 responses, the client attempts to refresh the token
- If refresh succeeds, the original request is retried
- If refresh fails, the user is redirected to login
- Tokens are also refreshed on mount and every 15 minutes

## State Management

### Auth Store (Zustand)

The auth store persists to localStorage:

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  businessId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User, businessId?: string) => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}
```

### Accessing Auth State

```typescript
import { useAuthStore } from '@/lib/stores/auth-store';

// In a component
const user = useAuthStore((state) => state.user);
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

// Or get the entire store
const auth = useAuthStore();
```

## Security Features

### 1. Token Storage
- Tokens stored in localStorage and HTTP-only cookies
- Automatic cleanup on logout
- Secure cookie options in production

### 2. Route Protection
- Middleware checks authentication on every request
- Redirects to login for protected routes
- Prevents authenticated users from accessing auth pages

### 3. Business Context
- Multi-tenant support with business-id headers
- Automatic injection in API requests
- Server-side cookie management

### 4. Error Handling
- User-friendly error messages
- Field-specific validation errors
- Network error handling
- Automatic token refresh on expiration

## Form Validation

Login and registration forms use Zod schemas:

```typescript
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z
  .object({
    businessName: z.string().min(2, 'Business name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
    confirmPassword: z.string(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
    businessType: z.string().min(1, 'Please select a business type'),
    acceptTerms: z.literal(true),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
```

## Design System Integration

The authentication pages use the Collabuu design system:

- **Colors**: Pink primary (#EC4899), blue accents (#3B82F6)
- **Typography**: Clean, modern font hierarchy
- **Components**: Custom input fields, buttons, and cards
- **Spacing**: Consistent 8px grid system
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design

## TypeScript Types

All authentication types are defined in `/Users/anthony/Documents/Projects/Collabuu-Webapp/lib/types/auth.ts`:

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'business' | 'influencer';
  businessId?: string;
  businessName?: string;
  phone?: string;
  avatar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
  businessId?: string;
}
```

## Testing

### Manual Testing Checklist

- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new business account
- [ ] Form validation errors display correctly
- [ ] Token refresh works automatically
- [ ] Logout clears all auth data
- [ ] Protected routes redirect to login
- [ ] Authenticated users can't access /login or /register
- [ ] Business-id header is sent in API requests
- [ ] Loading states display correctly

## Troubleshooting

### "Unauthorized" errors
- Check that the API URL is correct in `.env.local`
- Verify the token is being stored in localStorage
- Check browser console for token refresh errors

### Protected routes not working
- Ensure middleware is running (check Next.js logs)
- Verify the route is listed in `protectedRoutes`
- Check that the token exists in localStorage

### Form validation not working
- Verify react-hook-form and zod are installed
- Check for TypeScript errors in the console
- Ensure form fields have proper `register` bindings

## Next Steps

1. **Password Reset**: Implement forgot password flow
2. **Email Verification**: Add email verification for new accounts
3. **Two-Factor Auth**: Add 2FA support
4. **Social Login**: Integrate OAuth providers (Google, Facebook)
5. **Session Management**: Add session timeout and multiple device support
6. **Audit Logging**: Track login attempts and auth events

## API Endpoints Expected

The authentication system expects these API endpoints:

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout (optional)
- `GET /auth/me` - Get current user (optional)

Example request/response formats are defined in `/Users/anthony/Documents/Projects/Collabuu-Webapp/lib/types/auth.ts`.
