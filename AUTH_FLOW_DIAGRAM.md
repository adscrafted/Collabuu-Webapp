# Collabuu Authentication Flow Diagram

## User Login Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Navigate to /login
       ▼
┌─────────────────────────────────────────────────────────┐
│                   Login Page                             │
│  ┌────────────────────────────────────────────────┐    │
│  │  Email: [________________]                      │    │
│  │  Password: [____________]                       │    │
│  │  ☐ Remember me                                  │    │
│  │  [Sign In]                                      │    │
│  └────────────────────────────────────────────────┘    │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 2. Form submission with validation
           ▼
┌─────────────────────────────────────────────────────────┐
│              useLogin Hook (React Query)                 │
│  - Validates credentials                                 │
│  - Calls API via apiClient                               │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 3. POST /auth/login
           ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend API                             │
│  - Validates credentials                                 │
│  - Generates JWT tokens                                  │
│  - Returns user data                                     │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 4. { accessToken, user, businessId }
           ▼
┌─────────────────────────────────────────────────────────┐
│              Auth Store (Zustand)                        │
│  - Stores token in localStorage                          │
│  - Stores user data                                      │
│  - Sets isAuthenticated = true                           │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 5. Navigate to /dashboard
           ▼
┌─────────────────────────────────────────────────────────┐
│                   Middleware                             │
│  - Checks token exists                                   │
│  - Allows access to protected route                      │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 6. Render dashboard
           ▼
┌─────────────────────────────────────────────────────────┐
│               Dashboard Page                             │
│  - Protected by ProtectedRoute component                 │
│  - Displays user information                             │
└─────────────────────────────────────────────────────────┘
```

## User Registration Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Navigate to /register
       ▼
┌─────────────────────────────────────────────────────────┐
│                Registration Page                         │
│  ┌────────────────────────────────────────────────┐    │
│  │  Business Name: [________________]              │    │
│  │  Email: [________________]                      │    │
│  │  Phone: [________________]                      │    │
│  │  Business Type: [Dropdown ▼]                    │    │
│  │  Password: [____________]                       │    │
│  │  Confirm Password: [____________]               │    │
│  │  ☑ I agree to Terms & Conditions               │    │
│  │  [Create Business Account]                      │    │
│  └────────────────────────────────────────────────┘    │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 2. Form submission with Zod validation
           ▼
┌─────────────────────────────────────────────────────────┐
│            useRegister Hook (React Query)                │
│  - Validates all fields                                  │
│  - Checks password match                                 │
│  - Calls API via apiClient                               │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 3. POST /auth/register
           ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend API                             │
│  - Creates business account                              │
│  - Creates user account                                  │
│  - Generates JWT tokens                                  │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 4. { accessToken, user, businessId }
           ▼
┌─────────────────────────────────────────────────────────┐
│              Auth Store (Zustand)                        │
│  - Stores token & business ID                            │
│  - Auto-login user                                       │
│  - Navigate to dashboard                                 │
└─────────────────────────────────────────────────────────┘
```

## Token Refresh Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. User makes API request
       ▼
┌─────────────────────────────────────────────────────────┐
│              API Client (Axios)                          │
│  - Adds Authorization header                             │
│  - Adds X-Business-Id header                             │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 2. Request with expired token
           ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend API                             │
│  - Returns 401 Unauthorized                              │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 3. 401 Response
           ▼
┌─────────────────────────────────────────────────────────┐
│          Response Interceptor (Axios)                    │
│  - Detects 401 error                                     │
│  - Attempts token refresh                                │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 4. POST /auth/refresh
           ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend API                             │
│  - Validates refresh token                               │
│  - Issues new access token                               │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 5. { accessToken }
           ▼
┌─────────────────────────────────────────────────────────┐
│          Response Interceptor (Axios)                    │
│  - Updates token in localStorage                         │
│  - Retries original request                              │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 6. Retry with new token
           ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend API                             │
│  - Processes request successfully                        │
│  - Returns data                                          │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 7. Success response
           ▼
┌─────────────┐
│   Browser   │
│ (No error!) │
└─────────────┘
```

## Auto-Refresh on Mount

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. User opens app
       ▼
┌─────────────────────────────────────────────────────────┐
│              useAuth Hook                                │
│  - useEffect runs on mount                               │
│  - Checks if token exists                                │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 2. Token exists
           ▼
┌─────────────────────────────────────────────────────────┐
│              Auth Store                                  │
│  - Calls refreshToken()                                  │
│  - POST /auth/refresh                                    │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 3. Success or failure
           ▼
┌─────────────────────────────────────────────────────────┐
│          Token Refresh Result                            │
│                                                           │
│  Success:                      Failure:                  │
│  - Update token                - Clear auth state        │
│  - Continue session            - Redirect to login       │
└─────────────────────────────────────────────────────────┘
```

## Protected Route Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Navigate to /dashboard
       ▼
┌─────────────────────────────────────────────────────────┐
│                   Middleware                             │
│  ┌────────────────────────────────────────────────┐    │
│  │  Check: Is route protected?                    │    │
│  │  ✓ Yes: /dashboard is protected                │    │
│  └────────────────────────────────────────────────┘    │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 2. Check authentication
           ▼
┌─────────────────────────────────────────────────────────┐
│                   Middleware                             │
│  ┌────────────────────────────────────────────────┐    │
│  │  Check: Token in cookies or headers?          │    │
│  │                                                 │    │
│  │  YES:                      NO:                 │    │
│  │  → Allow access            → Redirect to       │    │
│  │  → Add business-id header     /login           │    │
│  └────────────────────────────────────────────────┘    │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 3. Authenticated
           ▼
┌─────────────────────────────────────────────────────────┐
│            ProtectedRoute Component                      │
│  - Double-checks authentication                          │
│  - Shows loading state                                   │
│  - Checks role requirements                              │
│  - Checks business requirements                          │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 4. All checks pass
           ▼
┌─────────────────────────────────────────────────────────┐
│               Dashboard Page                             │
│  - Renders protected content                             │
│  - Access to user data                                   │
└─────────────────────────────────────────────────────────┘
```

## Logout Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. User clicks Logout
       ▼
┌─────────────────────────────────────────────────────────┐
│              useAuth Hook                                │
│  - Calls logout()                                        │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 2. Clear auth data
           ▼
┌─────────────────────────────────────────────────────────┐
│              Auth Store                                  │
│  - Set user = null                                       │
│  - Set token = null                                      │
│  - Set businessId = null                                 │
│  - Set isAuthenticated = false                           │
│  - Clear localStorage                                    │
│    • auth_token                                          │
│    • refresh_token                                       │
│    • business_id                                         │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 3. Navigate to /login
           ▼
┌─────────────────────────────────────────────────────────┐
│                   Login Page                             │
│  - User is logged out                                    │
│  - Ready for new login                                   │
└─────────────────────────────────────────────────────────┘
```

## API Request Flow with Headers

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Component calls API
       │    apiClient.get('/campaigns')
       ▼
┌─────────────────────────────────────────────────────────┐
│          Request Interceptor (Axios)                     │
│  ┌────────────────────────────────────────────────┐    │
│  │  Get from localStorage:                        │    │
│  │  • auth_token                                  │    │
│  │  • business_id                                 │    │
│  │                                                 │    │
│  │  Add headers:                                  │    │
│  │  • Authorization: Bearer <token>              │    │
│  │  • X-Business-Id: <businessId>                │    │
│  │  • Content-Type: application/json             │    │
│  └────────────────────────────────────────────────┘    │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 2. Request with headers
           ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend API                             │
│  - Validates token                                       │
│  - Uses business-id for tenant isolation                 │
│  - Processes request                                     │
│  - Returns data                                          │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 3. Response
           ▼
┌─────────────────────────────────────────────────────────┐
│          Response Interceptor (Axios)                    │
│  - Checks for errors                                     │
│  - Handles 401 (refresh token)                           │
│  - Handles 403 (forbidden)                               │
│  - Returns data to component                             │
└──────────┬──────────────────────────────────────────────┘
           │
           │ 4. Data
           ▼
┌─────────────┐
│  Component  │
│  Updates UI │
└─────────────┘
```

## State Management Flow

```
┌────────────────────────────────────────────────────────────────┐
│                     Auth State (Zustand)                        │
│                                                                  │
│  State:                                                         │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  user: User | null                                    │     │
│  │  token: string | null                                 │     │
│  │  businessId: string | null                            │     │
│  │  isAuthenticated: boolean                             │     │
│  │  isLoading: boolean                                   │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                  │
│  Actions:                                                       │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  login(token, user, businessId)                       │     │
│  │  logout()                                             │     │
│  │  refreshToken()                                       │     │
│  │  updateUser(updates)                                  │     │
│  │  setLoading(boolean)                                  │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                  │
│  Persistence:                                                   │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  LocalStorage: auth-storage                           │     │
│  │  {                                                     │     │
│  │    state: {                                           │     │
│  │      user: {...},                                     │     │
│  │      token: "...",                                    │     │
│  │      businessId: "...",                               │     │
│  │      isAuthenticated: true                            │     │
│  │    }                                                   │     │
│  │  }                                                     │     │
│  └──────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────┘
           │
           │ Consumed by
           ▼
┌────────────────────────────────────────────────────────────────┐
│                     useAuth Hook                                │
│  - Subscribes to auth state changes                             │
│  - Provides actions to components                               │
│  - Auto-refreshes token on mount                                │
│  - Sets up refresh interval (15 min)                            │
└────────────────────────────────────────────────────────────────┘
           │
           │ Used by
           ▼
┌────────────────────────────────────────────────────────────────┐
│                    React Components                             │
│  - Login/Register pages                                         │
│  - Protected routes                                             │
│  - Dashboard pages                                              │
│  - Navigation components                                        │
└────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── Providers (React Query)
│   └── AuthProvider (Optional Context)
│
├── (auth) Layout
│   ├── Login Page
│   │   └── useLogin Hook
│   │       └── React Query Mutation
│   │           └── API Client
│   │
│   └── Register Page
│       └── useRegister Hook
│           └── React Query Mutation
│               └── API Client
│
└── (dashboard) Layout
    ├── ProtectedRoute Wrapper
    │   └── useAuth Hook
    │       └── Auth Store
    │
    └── Dashboard Pages
        └── useAuth Hook
            └── Auth Store
```

## Security Layers

```
┌────────────────────────────────────────────────────────────────┐
│                      Layer 1: Middleware                        │
│  - Runs on every request                                        │
│  - Checks token in cookies                                      │
│  - Redirects unauthenticated users                              │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│                 Layer 2: ProtectedRoute Component               │
│  - Client-side check                                            │
│  - Verifies auth state                                          │
│  - Shows loading states                                         │
│  - Enforces role requirements                                   │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│                  Layer 3: API Authorization                     │
│  - Token sent in Authorization header                           │
│  - Backend validates token                                      │
│  - Returns 401 if invalid                                       │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│                  Layer 4: Business Context                      │
│  - X-Business-Id header                                         │
│  - Multi-tenant isolation                                       │
│  - Data access control                                          │
└────────────────────────────────────────────────────────────────┘
```
