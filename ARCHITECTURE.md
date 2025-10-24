# Architecture Documentation

This document provides a comprehensive overview of the Collabuu web application architecture, design decisions, and technical implementation details.

## Table of Contents

- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Application Architecture](#application-architecture)
- [State Management](#state-management)
- [Data Flow](#data-flow)
- [Routing Strategy](#routing-strategy)
- [API Integration](#api-integration)
- [Authentication Flow](#authentication-flow)
- [Component Architecture](#component-architecture)
- [Design System](#design-system)
- [Performance Considerations](#performance-considerations)
- [Security](#security)

## System Overview

Collabuu is a modern, full-stack web application built with Next.js 14 using the App Router architecture. The application follows a client-server model with clear separation of concerns.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │             Next.js 14 (App Router)                   │  │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────────────┐ │  │
│  │  │  Server  │  │  Client  │  │   API Routes        │ │  │
│  │  │Components│  │Components│  │  (Stripe webhooks)  │ │  │
│  │  └──────────┘  └──────────┘  └─────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ REST API / HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend Services                        │
│  ┌─────────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │   Backend   │  │ Supabase │  │  Stripe  │  │ Storage │ │
│  │  API (Node) │  │   Auth   │  │ Payments │  │ (Images)│ │
│  └─────────────┘  └──────────┘  └──────────┘  └─────────┘ │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────┐                                           │
│  │  PostgreSQL │                                           │
│  │  Database   │                                           │
│  └─────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend Core

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.33 | React framework with App Router |
| React | 18.3.1 | UI library |
| TypeScript | 5.9.3 | Type safety and developer experience |
| Tailwind CSS | 3.4.18 | Utility-first CSS framework |

### State & Data

| Technology | Purpose | Why We Chose It |
|------------|---------|-----------------|
| TanStack React Query | Server state management | Caching, automatic refetching, optimistic updates |
| Zustand | Global client state | Lightweight, simple API, no boilerplate |
| React Hook Form | Form state | Performance, validation, DX |
| Zod | Schema validation | Type-safe validation, inference |

### UI & Components

| Technology | Purpose |
|------------|---------|
| shadcn/ui | Component library foundation |
| Radix UI | Accessible primitives |
| Lucide React | Icon library |
| Recharts | Data visualization |
| Sonner | Toast notifications |

### Backend Services

| Service | Purpose |
|---------|---------|
| Supabase | Authentication & Storage |
| Stripe | Payment processing |
| Vercel | Hosting & Deployment |
| Railway | Backend API hosting |

## Project Structure

### Directory Organization

```
collabuu-webapp/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Route group: Authentication
│   │   ├── login/page.tsx       # Login page
│   │   ├── register/page.tsx    # Registration page
│   │   └── layout.tsx           # Auth layout (minimal)
│   │
│   ├── (dashboard)/             # Route group: Protected routes
│   │   ├── campaigns/
│   │   │   ├── [id]/
│   │   │   │   ├── edit/page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── page.tsx
│   │   ├── credits/
│   │   ├── profile/
│   │   ├── layout.tsx           # Dashboard layout (sidebar + header)
│   │   └── page.tsx
│   │
│   ├── api/                     # API Routes (Next.js)
│   │   └── stripe/
│   │       ├── create-checkout-session/route.ts
│   │       └── webhook/route.ts
│   │
│   ├── layout.tsx               # Root layout (providers, fonts)
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles & Tailwind
│
├── components/                  # React components
│   ├── ui/                      # shadcn/ui base components
│   ├── campaigns/               # Campaign-specific components
│   ├── credits/                 # Credit system components
│   ├── profile/                 # Profile management
│   ├── auth/                    # Auth providers and guards
│   ├── layout/                  # Layout components
│   └── providers.tsx            # App-level providers
│
├── lib/                         # Utilities & configurations
│   ├── api/                     # API client modules
│   │   ├── client.ts           # Axios instance with interceptors
│   │   ├── campaigns.ts        # Campaign API functions
│   │   ├── profile.ts          # Profile API functions
│   │   └── supabase.ts         # Supabase client
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-campaigns.ts
│   │   └── ...
│   │
│   ├── stores/                  # Zustand stores
│   │   └── auth-store.ts
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── campaign.ts
│   │   └── profile.ts
│   │
│   ├── validation/              # Zod validation schemas
│   │   ├── campaign-schema.ts
│   │   └── profile-schema.ts
│   │
│   ├── constants/               # App constants
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── spacing.ts
│   │
│   ├── stripe/                  # Stripe configuration
│   ├── supabase/                # Supabase configuration
│   └── utils/                   # Utility functions
│
├── public/                      # Static assets
└── ...config files              # Configuration files
```

### Folder Naming Conventions

- **Route groups**: `(group-name)` - Don't affect URL structure
- **Dynamic routes**: `[param]` - Create dynamic segments
- **Components**: `kebab-case.tsx` - Lowercase with hyphens
- **Utilities**: `kebab-case.ts` - Lowercase with hyphens
- **Types**: `PascalCase` - Type and interface names

## Application Architecture

### Next.js App Router

The application uses Next.js 14's App Router with the following patterns:

#### Route Groups

Route groups organize routes without affecting the URL structure:

```
(auth)     → /login, /register    # Public auth pages
(dashboard) → /campaigns, /credits # Protected app pages
```

#### Layouts

Nested layouts provide shared UI:

```typescript
app/layout.tsx                 // Root: Providers, fonts, metadata
  ├── (auth)/layout.tsx       // Minimal layout for auth
  └── (dashboard)/layout.tsx  // Full dashboard with sidebar
```

#### Server vs Client Components

**Server Components** (default):
- Fetch data on server
- No JavaScript sent to client
- Can use async/await directly
- Cannot use hooks or browser APIs

**Client Components** (`'use client'`):
- Interactive UI
- Use React hooks
- Access browser APIs
- Event handlers

**Decision Tree**:
```
Need interactivity? ────Yes──→ Client Component
       │
       No
       │
       ▼
Fetch data on server? ──Yes──→ Server Component
       │
       No
       │
       ▼
       Server Component (default)
```

## State Management

### Three-Tier State Approach

```
┌─────────────────────────────────────────────┐
│        Server State (React Query)           │
│  ┌────────────────────────────────────┐    │
│  │ • Campaigns                         │    │
│  │ • User profile                      │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│      Global Client State (Zustand)          │
│  ┌────────────────────────────────────┐    │
│  │ • Auth state                        │    │
│  │ • UI preferences                    │    │
│  │ • Theme                             │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│       Local State (useState/useReducer)     │
│  ┌────────────────────────────────────┐    │
│  │ • Form inputs                       │    │
│  │ • Modal open/close                  │    │
│  │ • Temporary UI state                │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### Server State (React Query)

**Purpose**: Manage data from backend API

**Configuration**:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      cacheTime: 10 * 60 * 1000,     // 10 minutes
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});
```

**Usage Pattern**:
```typescript
// lib/hooks/use-campaigns.ts
export function useCampaigns(filters?: CampaignFilters) {
  return useQuery({
    queryKey: ['campaigns', filters],
    queryFn: () => campaignsApi.getCampaigns(filters),
    staleTime: 5 * 60 * 1000,
  });
}

// In component
const { data, isLoading, error } = useCampaigns({ status: 'ACTIVE' });
```

### Global Client State (Zustand)

**Purpose**: Lightweight global state for UI and auth

**Implementation**:
```typescript
// lib/stores/auth-store.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

### Form State (React Hook Form)

**Purpose**: Performant form handling with validation

**Pattern**:
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { ... },
});

const onSubmit = form.handleSubmit(async (data) => {
  // Handle submission
});
```

## Data Flow

### Typical Data Flow

```
┌──────────┐
│   User   │
└────┬─────┘
     │ 1. Action (click, type, etc.)
     ▼
┌──────────────────┐
│   Component      │
└────┬─────────────┘
     │ 2. Triggers mutation/query
     ▼
┌──────────────────┐
│  React Query     │
└────┬─────────────┘
     │ 3. API call
     ▼
┌──────────────────┐
│  Axios Client    │
│  + Interceptors  │
└────┬─────────────┘
     │ 4. HTTP request
     ▼
┌──────────────────┐
│  Backend API     │
└────┬─────────────┘
     │ 5. Response
     ▼
┌──────────────────┐
│  React Query     │
│  Cache Update    │
└────┬─────────────┘
     │ 6. Re-render
     ▼
┌──────────────────┐
│   Component      │
│   (Updated UI)   │
└──────────────────┘
```

### Optimistic Updates

For better UX, we use optimistic updates:

```typescript
const updateCampaign = useMutation({
  mutationFn: campaignsApi.updateCampaign,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['campaigns', id]);

    // Snapshot previous value
    const previous = queryClient.getQueryData(['campaigns', id]);

    // Optimistically update
    queryClient.setQueryData(['campaigns', id], newData);

    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['campaigns', id], context.previous);
  },
  onSettled: () => {
    // Refetch after mutation
    queryClient.invalidateQueries(['campaigns']);
  },
});
```

## Routing Strategy

### File-Based Routing

Next.js uses file-system routing:

```
app/
  (dashboard)/
    campaigns/
      page.tsx           → /campaigns
      new/
        page.tsx         → /campaigns/new
      [id]/
        page.tsx         → /campaigns/123
        edit/
          page.tsx       → /campaigns/123/edit
```

### Route Protection

Protected routes use middleware:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/campaigns/:path*', '/credits/:path*', '/profile/:path*'],
};
```

### Navigation

Client-side navigation with Next.js Link:

```typescript
import Link from 'next/link';

<Link href="/campaigns/new">
  Create Campaign
</Link>

// Programmatic navigation
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/campaigns');
```

## API Integration

### API Client Architecture

```typescript
// lib/api/client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle 401, refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      // Retry request
      // Or redirect to login
    }
    return Promise.reject(error);
  }
);
```

### API Module Organization

```typescript
// lib/api/campaigns.ts
export const campaignsApi = {
  getCampaigns: async (filters?: CampaignFilters) => {
    const response = await apiClient.get('/campaigns', { params: filters });
    return response.data;
  },

  getCampaign: async (id: string) => {
    const response = await apiClient.get(`/campaigns/${id}`);
    return response.data;
  },

  createCampaign: async (data: CreateCampaignRequest) => {
    const response = await apiClient.post('/campaigns', data);
    return response.data;
  },

  // ... more methods
};
```

## Authentication Flow

### Login Flow

```
1. User submits credentials
   ↓
2. Supabase Authentication
   ↓
3. Get JWT tokens (access + refresh)
   ↓
4. Store tokens in localStorage
   ↓
5. Fetch user profile from backend
   ↓
6. Update Zustand auth store
   ↓
7. Redirect to dashboard
```

### Token Management

```typescript
// Automatic token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const { accessToken } = await authApi.refreshToken(refreshToken);
          localStorage.setItem('auth_token', accessToken);

          // Retry original request
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(error.config);
        } catch (refreshError) {
          // Refresh failed, logout
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);
```

## Component Architecture

### Component Hierarchy

```
Page (Server Component)
└── Layout Components
    ├── Header
    └── Content
        ├── Feature Components (Client)
        │   ├── Data Container
        │   ├── Presentation Components
        │   └── UI Components (shadcn/ui)
        └── Shared Components
```

### Component Patterns

#### Container/Presentational Pattern

```typescript
// Container: Handles data fetching and logic
export function CampaignListContainer() {
  const { data, isLoading } = useCampaigns();

  if (isLoading) return <CampaignSkeleton />;

  return <CampaignList campaigns={data} />;
}

// Presentational: Pure UI component
interface CampaignListProps {
  campaigns: Campaign[];
}

export function CampaignList({ campaigns }: CampaignListProps) {
  return (
    <div className="grid gap-4">
      {campaigns.map(campaign => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
```

#### Composition Pattern

```typescript
// Flexible, composable components
<Card>
  <CardHeader>
    <CardTitle>Campaign Statistics</CardTitle>
  </CardHeader>
  <CardContent>
    <CampaignStats data={stats} />
  </CardContent>
</Card>
```

## Design System

### Color System

Defined in `tailwind.config.ts`:

```javascript
colors: {
  brand: {
    50: '#f0f9ff',
    // ... other shades
    900: '#0c4a6e',
  },
  // Semantic colors
  success: {...},
  warning: {...},
  error: {...},
}
```

### Typography Scale

```javascript
fontSize: {
  xs: ['0.75rem', { lineHeight: '1rem' }],
  sm: ['0.875rem', { lineHeight: '1.25rem' }],
  base: ['1rem', { lineHeight: '1.5rem' }],
  lg: ['1.125rem', { lineHeight: '1.75rem' }],
  // ... more sizes
}
```

### Spacing System

Consistent spacing using Tailwind's spacing scale:
- `space-y-4` for vertical spacing
- `gap-4` for grid/flex gaps
- Padding: `p-4`, `px-6`, `py-8`

## Performance Considerations

### Code Splitting

Dynamic imports can be used for heavy components to improve initial page load performance.

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="/campaign.jpg"
  alt="Campaign"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

### React Query Caching

```typescript
// Configure stale times based on data freshness needs
queryKey: ['campaigns'],
staleTime: 5 * 60 * 1000,  // 5 minutes for campaigns
cacheTime: 10 * 60 * 1000, // 10 minutes cache
```

## Security

### XSS Prevention

- React escapes all values by default
- Use `dangerouslySetInnerHTML` only when absolutely necessary
- Sanitize user input before rendering

### CSRF Protection

- Stripe webhook signature verification
- Token-based authentication
- SameSite cookies

### Environment Variables

```
NEXT_PUBLIC_* → Public (client-side)
Without prefix → Server-only
```

### API Security

- HTTPS only in production
- JWT token authentication
- Token refresh mechanism
- Rate limiting (backend)

---

**Last Updated**: October 2024
