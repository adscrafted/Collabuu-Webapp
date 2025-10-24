# Testing Guide

This document outlines the testing strategy, tools, and best practices for the Collabuu web application.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Testing Stack](#testing-stack)
- [Running Tests](#running-tests)
- [Testing Strategy](#testing-strategy)
- [Writing Tests](#writing-tests)
- [Test Coverage](#test-coverage)
- [Future Testing Enhancements](#future-testing-enhancements)

## Testing Philosophy

### Testing Pyramid

We follow the testing pyramid approach:

```
        /\
       /  \      E2E Tests (10%)
      /----\     Integration Tests (30%)
     /------\    Unit Tests (60%)
    /--------\
```

**Principles**:
1. Write tests that give confidence
2. Test behavior, not implementation
3. Write tests that resemble how users interact with the app
4. Avoid testing implementation details
5. Maintain test independence

## Testing Stack

### Current Status

The project currently uses manual testing. Automated testing infrastructure is planned.

### Planned Testing Tools

| Tool | Purpose | Status |
|------|---------|--------|
| **Jest** | Unit testing framework | Planned |
| **React Testing Library** | Component testing | Planned |
| **Playwright** | E2E testing | Planned |
| **MSW** | API mocking | Planned |
| **Testing Library User Event** | User interaction simulation | Planned |

## Running Tests

### Current Testing Process

Since automated tests are not yet implemented, follow this manual testing checklist:

#### Before Each PR

- [ ] Test all modified features manually
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile viewport
- [ ] Test keyboard navigation
- [ ] Test with screen reader (if applicable)
- [ ] Verify no console errors
- [ ] Check Network tab for failed requests

#### Regression Testing

- [ ] User registration flow
- [ ] User login flow
- [ ] Campaign creation flow
- [ ] Credit purchase flow
- [ ] Profile updates

### Future Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/test.test.ts

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui
```

## Testing Strategy

### Unit Tests (60%)

**What to test**:
- Utility functions
- Helper functions
- Custom hooks
- Business logic
- Validation schemas
- Type guards

**Example**:
```typescript
// lib/utils/credits.test.ts
describe('calculateCreditsRequired', () => {
  it('calculates credits correctly', () => {
    const result = calculateCreditsRequired(10);
    expect(result).toBe(100);
  });

  it('returns 0 when quantity is 0', () => {
    const result = calculateCreditsRequired(0);
    expect(result).toBe(0);
  });
});
```

### Integration Tests (30%)

**What to test**:
- Component integration with API
- Form submission flows
- Navigation flows
- State management
- API client functions

**Example**:
```typescript
// lib/hooks/use-campaigns.test.ts
describe('useCampaigns', () => {
  it('fetches campaigns successfully', async () => {
    const { result } = renderHook(() => useCampaigns(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(5);
  });
});
```

### E2E Tests (10%)

**What to test**:
- Critical user journeys
- Multi-page flows
- Authentication flows
- Payment flows

**Example**:
```typescript
// e2e/campaign-creation.spec.ts
test('user can create a campaign', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'password123');
  await page.click('button[type=submit]');

  await page.waitForURL('/dashboard');

  await page.click('text=Create Campaign');
  await page.click('text=Pay Per Customer');
  await page.fill('[name=title]', 'Test Campaign');
  await page.fill('[name=description]', 'Test Description');

  await page.click('text=Continue');
  // ... more steps

  await expect(page).toHaveURL(/\/campaigns\/.+/);
});
```

## Writing Tests

### Component Testing Best Practices

#### 1. Test User Behavior, Not Implementation

**Good**:
```typescript
test('displays error when email is invalid', async () => {
  render(<LoginForm />);

  const emailInput = screen.getByLabelText(/email/i);
  const submitButton = screen.getByRole('button', { name: /log in/i });

  await user.type(emailInput, 'invalid-email');
  await user.click(submitButton);

  expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
});
```

**Bad**:
```typescript
test('calls setError when email is invalid', () => {
  const setError = jest.fn();
  render(<LoginForm setError={setError} />);

  // Testing implementation details
  expect(setError).toHaveBeenCalled();
});
```

#### 2. Use Accessible Queries

**Query Priority**:
1. `getByRole`
2. `getByLabelText`
3. `getByPlaceholderText`
4. `getByText`
5. `getByTestId` (last resort)

**Example**:
```typescript
// Good
const button = screen.getByRole('button', { name: /submit/i });
const input = screen.getByLabelText(/email/i);

// Avoid
const button = screen.getByTestId('submit-button');
```

#### 3. Test Loading and Error States

```typescript
test('displays loading state', () => {
  render(<CampaignList />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

test('displays error message on fetch failure', async () => {
  server.use(
    http.get('/api/campaigns', () => {
      return HttpResponse.error();
    })
  );

  render(<CampaignList />);

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

#### 4. Mock API Calls with MSW

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/campaigns', () => {
    return HttpResponse.json({
      campaigns: [
        { id: '1', title: 'Campaign 1' },
        { id: '2', title: 'Campaign 2' },
      ],
    });
  }),
];

// tests/setup.ts
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Hook Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

test('useCampaigns fetches data', async () => {
  const { result } = renderHook(() => useCampaigns(), {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });

  expect(result.current.data).toBeDefined();
});
```

### Form Testing

```typescript
test('validates form fields', async () => {
  const user = userEvent.setup();
  render(<CampaignForm />);

  const titleInput = screen.getByLabelText(/title/i);
  const submitButton = screen.getByRole('button', { name: /submit/i });

  // Submit empty form
  await user.click(submitButton);
  expect(screen.getByText(/title is required/i)).toBeInTheDocument();

  // Fill and submit
  await user.type(titleInput, 'My Campaign');
  await user.click(submitButton);

  await waitFor(() => {
    expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument();
  });
});
```

### Navigation Testing

```typescript
test('navigates to campaign detail on click', async () => {
  const user = userEvent.setup();
  const router = createMemoryRouter([
    { path: '/campaigns', element: <CampaignList /> },
    { path: '/campaigns/:id', element: <CampaignDetail /> },
  ], {
    initialEntries: ['/campaigns'],
  });

  render(<RouterProvider router={router} />);

  const campaignCard = screen.getByText('My Campaign');
  await user.click(campaignCard);

  expect(router.state.location.pathname).toMatch(/\/campaigns\/.+/);
});
```

## Test Coverage

### Coverage Goals

| Type | Goal |
|------|------|
| Overall | 80% |
| Statements | 80% |
| Branches | 75% |
| Functions | 80% |
| Lines | 80% |

### Critical Areas (>90% Coverage)

- Authentication logic
- Payment processing
- Form validation
- API client
- Custom hooks
- Utility functions

### View Coverage Report

```bash
# Generate coverage report
npm test -- --coverage

# Open HTML report
open coverage/lcov-report/index.html
```

## Future Testing Enhancements

### Planned Additions

#### 1. Jest Setup

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**jest.config.js**:
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};
```

#### 2. React Testing Library Setup

**jest.setup.js**:
```javascript
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));
```

#### 3. Playwright E2E Setup

```bash
npm install --save-dev @playwright/test
```

**playwright.config.ts**:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

#### 4. Visual Regression Testing

Consider adding:
- Chromatic for Storybook
- Percy for visual diffs
- Playwright screenshots

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test -- --coverage
      - run: npm run test:e2e
```

## Testing Checklist

### Before Pushing Code

- [ ] All tests pass
- [ ] New features have tests
- [ ] Bug fixes have regression tests
- [ ] Coverage meets minimum threshold
- [ ] No skipped tests without reason
- [ ] Tests are deterministic (not flaky)

### Code Review

- [ ] Tests cover happy path
- [ ] Tests cover error cases
- [ ] Tests cover edge cases
- [ ] Tests are readable
- [ ] Tests follow naming conventions
- [ ] No unnecessary mocking
- [ ] Tests are maintainable

## Resources

- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [Playwright Docs](https://playwright.dev/docs/intro)
- [MSW Docs](https://mswjs.io/docs/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated**: October 2024
