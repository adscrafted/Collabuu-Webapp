# Developer Onboarding Guide

Welcome to the Collabuu team! This guide will help you get up to speed quickly and become a productive member of the development team.

## Table of Contents

- [Welcome](#welcome)
- [First Day Checklist](#first-day-checklist)
- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Codebase Tour](#codebase-tour)
- [Development Workflow](#development-workflow)
- [Common Tasks](#common-tasks)
- [Best Practices](#best-practices)
- [Resources](#resources)

## Welcome

Welcome to Collabuu! We're excited to have you on the team. This guide will help you understand our codebase, development practices, and how to contribute effectively.

### What is Collabuu?

Collabuu is an influencer marketing platform that connects businesses with influencers for authentic collaborations. Our web application enables businesses to:

- Create and manage marketing campaigns
- Manage credits and payments through Stripe
- Monitor campaign performance and visitor metrics

## First Day Checklist

### Prerequisites

- [ ] GitHub account with repository access
- [ ] Slack workspace invitation (for team communication)
- [ ] Email added to team distribution list
- [ ] Access to project management tools (Jira/Linear/etc.)
- [ ] Access to design files (Figma)

### Setup

- [ ] Clone the repository
- [ ] Follow [SETUP.md](./SETUP.md) to install dependencies
- [ ] Set up development environment
- [ ] Create Supabase account and project
- [ ] Create Stripe test account
- [ ] Verify application runs locally
- [ ] Read [README.md](./README.md)
- [ ] Review [ARCHITECTURE.md](./ARCHITECTURE.md)
- [ ] Understand [CONTRIBUTING.md](./CONTRIBUTING.md)

### First Tasks

- [ ] Fix a "good first issue" from GitHub
- [ ] Submit your first pull request
- [ ] Review someone else's PR
- [ ] Attend daily standup
- [ ] Meet the team!

## Project Overview

### High-Level Architecture

```
┌─────────────────┐
│   Next.js App   │ ← You are here
│  (Frontend)     │
└────────┬────────┘
         │
         │ REST API
         ▼
┌─────────────────┐
│   Backend API   │
│  (Node.js)      │
└────────┬────────┘
         │
    ┌────┴────┬────────┬─────────┐
    ▼         ▼        ▼         ▼
┌────────┐ ┌──────┐ ┌──────┐ ┌────────┐
│Postgres│ │Stripe│ │Supabase Auth│
└────────┘ └──────┘ └────────┘ └────────┘
```

### Key User Flows

**1. Business Registration**
```
Register → Email Verification → Dashboard → Add Credits → Create Campaign
```

**2. Campaign Creation**
```
Choose Type → Basic Info → Campaign Details → Review → Publish
```

## Technology Stack

### Frontend (This Repository)

| Technology | Purpose | Why We Use It |
|------------|---------|---------------|
| **Next.js 14** | React framework | App Router, Server Components, Optimizations |
| **TypeScript** | Type safety | Catch errors early, better DX |
| **Tailwind CSS** | Styling | Utility-first, consistent design |
| **shadcn/ui** | Component library | Accessible, customizable, beautiful |
| **React Query** | Data fetching | Caching, synchronization, DevTools |
| **Zustand** | State management | Simple, lightweight, no boilerplate |
| **React Hook Form** | Form management | Performant, validation, great DX |
| **Zod** | Schema validation | Type-safe validation, errors |

### Services

| Service | Purpose |
|---------|---------|
| **Supabase** | Authentication & Storage |
| **Stripe** | Payment processing |
| **Vercel** | Hosting & Deployment |
| **Railway** | Backend API hosting |

## Codebase Tour

### Directory Structure

```
collabuu-webapp/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login & Registration
│   ├── (dashboard)/       # Protected routes
│   ├── api/               # API routes (Stripe webhooks)
│   └── globals.css        # Global styles
│
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── campaigns/        # Campaign features
│   ├── credits/          # Credit system
│   ├── profile/          # Profile management
│   ├── auth/             # Auth components
│   └── layout/           # Layout components
│
├── lib/                  # Utilities & configurations
│   ├── api/             # API client functions
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript types
│   ├── stores/          # Zustand stores
│   ├── validation/      # Zod schemas
│   ├── utils/           # Helper functions
│   └── constants/       # App constants
│
└── public/              # Static assets
```

### Key Files

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout with providers |
| `app/(dashboard)/layout.tsx` | Dashboard layout with sidebar |
| `middleware.ts` | Auth protection middleware |
| `lib/api/client.ts` | Axios instance with interceptors |
| `components/providers.tsx` | React Query provider |
| `tailwind.config.ts` | Tailwind configuration |

## Development Workflow

### Daily Workflow

1. **Start the day**
   ```bash
   # Pull latest changes
   git checkout main
   git pull origin main

   # Create feature branch
   git checkout -b feature/your-feature
   ```

2. **During development**
   ```bash
   # Run dev server
   npm run dev

   # In another terminal, run type check
   npm run type-check -- --watch
   ```

3. **Before committing**
   ```bash
   # Format code
   npm run format

   # Check types
   npm run type-check

   # Lint
   npm run lint

   # Build
   npm run build
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature
   ```

5. **Create PR**
   - Go to GitHub
   - Create Pull Request
   - Fill in PR template
   - Request review

### Code Review Process

1. **Self-review** - Review your own code first
2. **Submit PR** - Assign reviewers
3. **Address feedback** - Make requested changes
4. **Approval** - Get at least 1 approval
5. **Merge** - Squash and merge to main

## Common Tasks

### Adding a New Page

```typescript
// 1. Create page file
// app/(dashboard)/new-feature/page.tsx
export default function NewFeaturePage() {
  return <div>New Feature</div>;
}

// 2. Add to navigation
// components/layout/dashboard-nav.tsx
const navItems = [
  // ... existing items
  {
    title: 'New Feature',
    href: '/new-feature',
    icon: IconName,
  },
];
```

### Adding a New API Endpoint

```typescript
// lib/api/new-feature.ts
import { apiClient } from './client';

export const newFeatureApi = {
  getData: async () => {
    const response = await apiClient.get('/api/new-feature');
    return response.data;
  },
};

// Create custom hook
// lib/hooks/use-new-feature.ts
import { useQuery } from '@tanstack/react-query';
import { newFeatureApi } from '@/lib/api/new-feature';

export function useNewFeature() {
  return useQuery({
    queryKey: ['new-feature'],
    queryFn: newFeatureApi.getData,
  });
}
```

### Adding a New Component

```typescript
// components/new-feature/feature-card.tsx
import { Card } from '@/components/ui/card';

interface FeatureCardProps {
  title: string;
  description: string;
}

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <Card>
      <h3>{title}</h3>
      <p>{description}</p>
    </Card>
  );
}

// Export from index
// components/new-feature/index.ts
export { FeatureCard } from './feature-card';
```

### Using shadcn/ui Components

```bash
# Add a new component
npx shadcn-ui@latest add button

# Use in your code
import { Button } from '@/components/ui/button';

<Button variant="default" size="lg">
  Click me
</Button>
```

### Working with Forms

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Define schema
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof formSchema>;

// 2. Use in component
export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

## Best Practices

### Code Organization

- One component per file
- Keep components under 200 lines
- Extract reusable logic into hooks
- Use proper TypeScript types
- Follow file naming conventions

### Performance

- Use React.memo for expensive components
- Implement proper loading states
- Use Next.js Image component for images
- Optimize bundle size with dynamic imports
- Use React Query caching effectively

### State Management

- Server state → React Query
- Global client state → Zustand
- Local state → useState
- Form state → React Hook Form
- URL state → searchParams

### Error Handling

```typescript
// API calls
try {
  const data = await apiClient.get('/endpoint');
  return data;
} catch (error) {
  console.error('Failed to fetch data:', error);
  throw error; // Let React Query handle it
}

// Components
import { toast } from 'sonner';

const handleError = (error: Error) => {
  toast.error(error.message);
};
```

### Accessibility

- Use semantic HTML
- Add ARIA labels
- Ensure keyboard navigation
- Test with screen readers
- Maintain color contrast ratios

## Resources

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Internal Resources

- [README.md](./README.md) - Project overview
- [SETUP.md](./SETUP.md) - Setup instructions
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture details
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) - API documentation

### Tools

- **VS Code Extensions**:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

- **Chrome Extensions**:
  - React Developer Tools
  - Redux DevTools (for Zustand)
  - TanStack Query DevTools

### Getting Help

1. **Check documentation first**
2. **Search existing issues**
3. **Ask in Slack**
4. **Pair with team member**
5. **Create GitHub discussion**

## Your First Week Goals

### Week 1

- [ ] Complete all setup steps
- [ ] Understand project architecture
- [ ] Read all documentation
- [ ] Fix 1-2 "good first issues"
- [ ] Submit 1-2 pull requests
- [ ] Review 2-3 PRs from teammates
- [ ] Attend all team meetings

### By End of Month

- [ ] Comfortable with codebase
- [ ] Contributing regularly
- [ ] Understanding team workflow
- [ ] Helping review PRs
- [ ] Taking on larger tasks

## Welcome to the Team!

We're excited to have you here. Don't hesitate to ask questions - everyone was new once! The team is here to help you succeed.

**Remember**:
- There are no stupid questions
- Mistakes are learning opportunities
- Ask for help when stuck
- Share your knowledge with others

Happy coding! 🚀

---

**Questions?** Reach out to your team lead or post in the #engineering Slack channel.
