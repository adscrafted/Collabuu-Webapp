# Collabuu Authentication - Quick Start Guide

## Installation Complete ✅

The authentication system is fully implemented and ready to use!

## What's Been Built

### 1. Authentication Pages
- **Login Page**: `/login` - Email/password login with validation
- **Register Page**: `/register` - Business account registration
- **Dashboard**: `/dashboard` - Protected example page

### 2. State Management
- Zustand store for auth state
- LocalStorage persistence
- React Query for API calls

### 3. API Integration
- Axios client with auto token refresh
- Business-id header support
- Error handling and retries

### 4. Route Protection
- Middleware for route guarding
- Protected route component
- Role-based access control

## Quick Test (Development)

### 1. Start the Development Server
```bash
cd /Users/anthony/Documents/Projects/Collabuu-Webapp
npm run dev
```

### 2. Visit the Auth Pages
- Login: http://localhost:3000/login
- Register: http://localhost:3000/register
- Dashboard: http://localhost:3000/dashboard (redirects to login if not authenticated)

### 3. Test the Flow

#### Registration
1. Go to http://localhost:3000/register
2. Fill out the business registration form:
   - Business Name: "Test Business"
   - Email: "test@example.com"
   - Phone: "+1234567890"
   - Business Type: Select any
   - Password: "Test123456" (must have uppercase, lowercase, number)
   - Confirm Password: "Test123456"
   - Accept Terms: Check the box
3. Click "Create Business Account"
4. Should redirect to dashboard on success

#### Login
1. Go to http://localhost:3000/login
2. Enter credentials:
   - Email: "test@example.com"
   - Password: "Test123456"
3. Optionally check "Remember me"
4. Click "Sign In"
5. Should redirect to dashboard on success

#### Protected Routes
1. Try to access http://localhost:3000/dashboard without logging in
2. Should redirect to http://localhost:3000/login
3. After logging in, dashboard should be accessible

## Environment Setup

Your `.env.local` should have:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Backend Integration

The frontend expects these API endpoints:

### POST /auth/register
```json
// Request
{
  "businessName": "Test Business",
  "email": "test@example.com",
  "password": "Test123456",
  "phone": "+1234567890",
  "businessType": "restaurant"
}

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "test@example.com",
    "name": "Test Business",
    "role": "business",
    "businessId": "456",
    "businessName": "Test Business",
    "phone": "+1234567890"
  },
  "businessId": "456"
}
```

### POST /auth/login
```json
// Request
{
  "email": "test@example.com",
  "password": "Test123456",
  "rememberMe": true
}

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "test@example.com",
    "name": "Test Business",
    "role": "business",
    "businessId": "456",
    "businessName": "Test Business"
  },
  "businessId": "456"
}
```

### POST /auth/refresh
```json
// Request
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

## Code Examples

### Using Authentication in a Component

```tsx
'use client';

import { useAuth } from '@/lib/hooks/use-auth';

export function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protecting a Page

```tsx
'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';

export default function MyPage() {
  return (
    <ProtectedRoute requireBusiness>
      <div>Protected Content</div>
    </ProtectedRoute>
  );
}
```

### Making an API Call

```tsx
import { apiClient } from '@/lib/api/client';

async function fetchCampaigns() {
  const response = await apiClient.get('/campaigns');
  return response.data;
}

// Token and business-id are automatically added to headers!
```

## Testing Without Backend

If you don't have a backend yet, you can mock the API responses:

### Option 1: Use MSW (Mock Service Worker)
```bash
npm install msw --save-dev
```

### Option 2: Create Mock API Routes

Create `/Users/anthony/Documents/Projects/Collabuu-Webapp/app/api/auth/login/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  // Mock successful login
  if (body.email === 'test@example.com' && body.password === 'Test123456') {
    return NextResponse.json({
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      user: {
        id: '1',
        email: body.email,
        name: 'Test User',
        role: 'business',
        businessId: '1',
        businessName: 'Test Business',
      },
      businessId: '1',
    });
  }

  return NextResponse.json(
    { message: 'Invalid credentials' },
    { status: 401 }
  );
}
```

Create `/Users/anthony/Documents/Projects/Collabuu-Webapp/app/api/auth/register/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  return NextResponse.json({
    accessToken: 'mock_access_token',
    refreshToken: 'mock_refresh_token',
    user: {
      id: '1',
      email: body.email,
      name: body.businessName,
      role: 'business',
      businessId: '1',
      businessName: body.businessName,
      phone: body.phone,
    },
    businessId: '1',
  });
}
```

Then update your `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## File Structure

```
/Users/anthony/Documents/Projects/Collabuu-Webapp/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx              # Auth layout with branding
│   │   ├── login/page.tsx          # Login page
│   │   └── register/page.tsx       # Register page
│   └── (dashboard)/
│       └── dashboard/page.tsx      # Example protected page
├── lib/
│   ├── api/
│   │   └── client.ts               # Axios client
│   ├── auth/
│   │   └── cookies.ts              # Cookie management
│   ├── hooks/
│   │   ├── use-auth.ts             # Main auth hook
│   │   ├── use-login.ts            # Login hook
│   │   └── use-register.ts         # Register hook
│   ├── stores/
│   │   └── auth-store.ts           # Zustand store
│   ├── supabase/
│   │   └── client.ts               # Supabase client
│   └── types/
│       └── auth.ts                 # TypeScript types
├── components/
│   └── auth/
│       ├── auth-provider.tsx       # Context provider
│       └── protected-route.tsx     # Route wrapper
└── middleware.ts                   # Route protection
```

## Next Steps

1. **Set up your backend API** with the required endpoints
2. **Test the complete flow** from registration to dashboard
3. **Customize the design** to match your brand
4. **Add more features**:
   - Password reset
   - Email verification
   - Profile editing
   - Team member management

## Documentation

- [Authentication Guide](/Users/anthony/Documents/Projects/Collabuu-Webapp/AUTHENTICATION_GUIDE.md) - Comprehensive usage guide
- [Implementation Summary](/Users/anthony/Documents/Projects/Collabuu-Webapp/AUTHENTICATION_SUMMARY.md) - What was built
- [Flow Diagrams](/Users/anthony/Documents/Projects/Collabuu-Webapp/AUTH_FLOW_DIAGRAM.md) - Visual flow charts

## Troubleshooting

### "Network Error"
- Check that `NEXT_PUBLIC_API_URL` is set correctly
- Ensure your backend is running
- Check browser console for CORS errors

### "Unauthorized" on every request
- Clear localStorage: `localStorage.clear()`
- Check that tokens are being stored
- Verify backend JWT configuration

### Build errors
- Run `npm run type-check` to find TypeScript errors
- Run `npm run build` to test production build
- Check for missing environment variables

## Support

For issues or questions:
1. Check the [Authentication Guide](/Users/anthony/Documents/Projects/Collabuu-Webapp/AUTHENTICATION_GUIDE.md)
2. Review the [Flow Diagrams](/Users/anthony/Documents/Projects/Collabuu-Webapp/AUTH_FLOW_DIAGRAM.md)
3. Look at example implementations in `/app/(auth)/` and `/app/(dashboard)/`

---

**Status**: ✅ Ready for development and testing
**Build Status**: ✅ Passing
**Type Check**: ✅ Passing
**Last Updated**: October 22, 2025
