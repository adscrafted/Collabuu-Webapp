# Collabuu Web Application

A modern, full-stack influencer marketing platform built with Next.js 14, connecting businesses with influencers for authentic collaborations and measurable results.

## Overview

Collabuu is a comprehensive web application that enables businesses to create and manage influencer marketing campaigns, communicate with influencers, and manage their credit-based payment system. The platform features a robust campaign management system and Stripe-powered payment processing.

## Key Features

- **Campaign Management**: Create, manage, and track influencer marketing campaigns with three campaign types (Pay Per Customer, Media Event, Loyalty Reward)
- **Credit System**: Stripe-integrated payment system with credit packages and transaction history
- **User Profiles**: Complete business profile management with team member invitations
- **Authentication**: Secure authentication powered by Supabase with JWT tokens
- **Responsive Design**: Mobile-first design with full desktop support

## Tech Stack

### Core Framework
- **Next.js 14.2** - React framework with App Router and Server Components
- **React 18.3** - Modern React with hooks and concurrent features
- **TypeScript 5.9** - Full type safety across the application
- **Tailwind CSS 3.4** - Utility-first CSS framework with custom design system

### State Management & Data Fetching
- **TanStack React Query 5.90** - Powerful data synchronization and caching
- **Zustand 5.0** - Lightweight state management for client-side state
- **Axios 1.12** - HTTP client with interceptors for authentication

### UI Components & Libraries
- **shadcn/ui** - High-quality, accessible component library built on Radix UI
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Beautiful, consistent icon library
- **date-fns 4.1** - Modern date manipulation library

### Forms & Validation
- **React Hook Form 7.65** - Performant form state management
- **Zod 4.1** - TypeScript-first schema validation
- **@hookform/resolvers** - Validation library integrations

### Backend & Services
- **Supabase** - Authentication, database, and storage
- **Stripe** - Payment processing and subscription management
- **Railway** - Backend API hosting (Node.js/Express)

### Development Tools
- **ESLint 9.38** - Code quality and consistency
- **Prettier 3.6** - Code formatting
- **TypeScript ESLint** - TypeScript-specific linting rules

## Project Structure

```
collabuu-webapp/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Authentication route group
│   │   ├── login/                # Login page
│   │   ├── register/             # Registration page
│   │   └── layout.tsx            # Auth layout wrapper
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── campaigns/            # Campaign management
│   │   │   ├── [id]/             # Campaign detail view
│   │   │   │   ├── edit/         # Campaign edit page
│   │   │   │   └── page.tsx      # Campaign overview
│   │   │   ├── new/              # Create campaign wizard
│   │   │   └── page.tsx          # Campaigns list
│   │   ├── credits/              # Credit purchase & history
│   │   ├── dashboard/            # Main dashboard
│   │   ├── profile/              # User profile & settings
│   │   ├── layout.tsx            # Dashboard layout with navigation
│   │   └── page.tsx              # Dashboard redirect
│   ├── api/                      # API route handlers
│   │   └── stripe/               # Stripe webhooks & sessions
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles & Tailwind
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx            # Button component
│   │   ├── card.tsx              # Card component
│   │   ├── dialog.tsx            # Modal/dialog component
│   │   ├── form.tsx              # Form wrapper components
│   │   ├── input.tsx             # Input component
│   │   ├── select.tsx            # Select dropdown
│   │   ├── table.tsx             # Table components
│   │   └── ...                   # 25+ UI components
│   │
│   ├── campaigns/                # Campaign-related components
│   │   ├── campaign-card.tsx     # Campaign list card
│   │   ├── campaign-filters.tsx  # Filter controls
│   │   ├── detail/               # Campaign detail tabs
│   │   ├── form/                 # Campaign creation forms
│   │   └── steps/                # Multi-step wizard
│   │
│   ├── profile/                  # Profile & settings components
│   │   ├── business-profile-tab.tsx
│   │   ├── billing-tab.tsx       # Billing & subscriptions
│   │   ├── settings-tab.tsx      # Account settings
│   │   └── team-members-tab.tsx  # Team management
│   │
│   ├── credits/                  # Credit system components
│   │   ├── credit-package-card.tsx
│   │   └── transaction-history.tsx
│   │
│   ├── auth/                     # Authentication components
│   │   ├── auth-provider.tsx     # Auth context provider
│   │   └── protected-route.tsx   # Route protection HOC
│   │
│   ├── layout/                   # Layout components
│   │   ├── dashboard-header.tsx  # Dashboard header
│   │   ├── dashboard-nav.tsx     # Sidebar navigation
│   │   └── Sidebar.tsx           # Main sidebar
│   │
│   └── providers.tsx             # App-level providers
│
├── lib/                          # Utilities & configurations
│   ├── api/                      # API client modules
│   │   ├── client.ts             # Axios instance with interceptors
│   │   ├── campaigns.ts          # Campaign API calls
│   │   ├── profile.ts            # Profile API calls
│   │   └── supabase.ts           # Supabase client
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-auth.ts           # Authentication hook
│   │   ├── use-campaigns.ts      # Campaign data fetching
│   │   └── ...                   # 10+ custom hooks
│   │
│   ├── stores/                   # Zustand state stores
│   │   └── auth-store.ts         # Auth state management
│   │
│   ├── types/                    # TypeScript type definitions
│   │   ├── auth.ts               # Auth types
│   │   ├── campaign.ts           # Campaign types
│   │   └── profile.ts            # Profile types
│   │
│   ├── validation/               # Zod validation schemas
│   │   ├── campaign-schema.ts    # Campaign form validation
│   │   └── profile-schema.ts     # Profile form validation
│   │
│   ├── constants/                # App constants
│   │   ├── colors.ts             # Color palette
│   │   ├── typography.ts         # Typography scales
│   │   └── spacing.ts            # Spacing system
│   │
│   ├── stripe/                   # Stripe configuration
│   │   ├── config.ts             # Stripe client config
│   │   └── server.ts             # Server-side Stripe
│   │
│   ├── supabase/                 # Supabase configuration
│   │   └── client.ts             # Supabase client
│   │
│   └── utils/                    # Utility functions
│       └── cn.ts                 # Class name utility
│
├── public/                       # Static assets
│
├── .env.example                  # Environment variables template
├── .env.local                    # Local environment variables
├── .eslintrc.json                # ESLint configuration
├── .gitignore                    # Git ignore rules
├── .prettierrc                   # Prettier configuration
├── components.json               # shadcn/ui configuration
├── middleware.ts                 # Next.js middleware (auth)
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies & scripts
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

## Getting Started

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher (or **yarn** 1.22+)
- **Git** for version control
- **Supabase account** (free tier available)
- **Stripe account** (test mode for development)
- **Backend API** running (see BACKEND_INTEGRATION.md)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd collabuu-webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your credentials (see [Environment Variables](#environment-variables) section)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

For detailed setup instructions, see [SETUP.md](./SETUP.md)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Backend API
NEXT_PUBLIC_API_URL=https://your-backend-api.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

See [.env.example](./.env.example) for a complete list with descriptions.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server at http://localhost:3000 |
| `npm run build` | Build optimized production bundle |
| `npm start` | Start production server (requires build first) |
| `npm run lint` | Run ESLint to check code quality |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check if code is formatted correctly |
| `npm run type-check` | Run TypeScript compiler checks |

## Key Features in Detail

### 1. Campaign Management
- **Three Campaign Types**:
  - Pay Per Customer: Variable pricing based on customer visits
  - Media Event: Fixed pricing for event coverage
  - Loyalty Reward: Reward-based campaigns for repeat customers
- **Multi-step Creation Wizard**: Guided campaign creation process
- **Image Upload**: Supabase-powered image hosting
- **Status Management**: Draft, Active, Paused, Completed, Cancelled

### 2. Credit System
- **Stripe Integration**: Secure payment processing
- **Multiple Packages**: 100, 500, 1000, 2500+ credit options
- **Transaction History**: Complete payment records
- **Auto-deduction**: Credits automatically deducted on campaign visits

### 3. Profile Management
- **Business Profile**: Company information and branding
- **Team Members**: Invite and manage team access
- **Billing Settings**: Payment methods and invoices
- **Account Settings**: Email, password, privacy preferences

## Architecture Highlights

### Authentication Flow
1. User credentials submitted to Supabase
2. JWT tokens returned and stored in localStorage
3. Tokens attached to API requests via Axios interceptors
4. Automatic token refresh on 401 responses
5. Middleware protects dashboard routes

### Data Fetching Strategy
- **React Query** for server state management
- **Automatic caching** with configurable stale times
- **Optimistic updates** for better UX
- **Background refetching** for fresh data
- **Error handling** with retry logic

### Component Architecture
- **Server Components** for static content and SEO
- **Client Components** for interactivity
- **Composition pattern** for reusability
- **shadcn/ui** for accessible, customizable UI
- **Type-safe props** with TypeScript interfaces

## Development Guidelines

### Code Style
- Follow TypeScript strict mode rules
- Use functional components with hooks
- Implement proper error boundaries
- Add JSDoc comments for complex functions
- Follow Prettier formatting rules

### Component Guidelines
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use composition over prop drilling
- Implement proper loading and error states
- Ensure accessibility (ARIA labels, keyboard navigation)

### State Management
- Use React Query for server state
- Use Zustand for global client state
- Use useState/useReducer for local state
- Avoid prop drilling with proper composition

### API Integration
- All API calls go through `lib/api/` modules
- Use TypeScript interfaces for request/response types
- Implement proper error handling
- Add loading states for async operations

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository

3. **Configure Environment Variables**
   - Add all variables from `.env.local`
   - Use production values for Stripe, Supabase

4. **Deploy**
   - Vercel will automatically build and deploy
   - Every push triggers a new deployment

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Testing

Currently, the application uses manual testing. Future enhancements include:

- Jest for unit testing
- React Testing Library for component testing
- Playwright for E2E testing
- Cypress for integration testing

See [TESTING.md](./TESTING.md) for testing guidelines.

## Documentation

- [Setup Guide](./SETUP.md) - Detailed installation and configuration
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment instructions
- [Backend Integration](./BACKEND_INTEGRATION.md) - API requirements and endpoints
- [Architecture](./ARCHITECTURE.md) - System architecture and design decisions
- [Features](./FEATURES.md) - Complete feature documentation
- [Onboarding](./ONBOARDING.md) - New developer onboarding guide
- [Contributing](./CONTRIBUTING.md) - How to contribute to the project

## Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**API Connection Issues**
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check backend API is running
- Verify CORS settings on backend
- Check browser console for errors

**Authentication Issues**
- Clear localStorage and try again
- Verify Supabase credentials
- Check token expiration
- Ensure middleware.ts is configured correctly

**Stripe Issues**
- Use test mode keys for development
- Verify webhook secret matches Stripe dashboard
- Check Stripe dashboard for payment events
- Ensure webhook endpoint is publicly accessible

For more troubleshooting, see [SETUP.md](./SETUP.md#troubleshooting)

## Performance Optimization

- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Dynamic imports for heavy components
- **Bundle Analysis**: Use `@next/bundle-analyzer`
- **Caching**: React Query caching + Next.js caching strategies
- **Server Components**: Reduced client-side JavaScript
- **Font Optimization**: Next.js font optimization

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## License

Proprietary - All rights reserved

Copyright 2024 Collabuu. This software and associated documentation files are the proprietary property of Collabuu and may not be copied, modified, or distributed without explicit permission.

## Support

For questions, issues, or feature requests:

- Create an issue in the repository
- Contact the development team
- Check existing documentation

## Roadmap

- [ ] Automated testing suite
- [ ] Performance monitoring (Sentry)
- [ ] Mobile app integration
- [ ] API rate limiting
- [ ] Internationalization (i18n)
- [ ] Dark mode support
- [ ] Real-time notifications
- [ ] Advanced search functionality
- [ ] Campaign templates

## Contributors

Built with by the Collabuu development team.

---

**Last Updated**: October 2024
**Version**: 1.0.0
