# Contributing to Collabuu

Thank you for your interest in contributing to Collabuu! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, trolling, or discriminatory comments
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

## Getting Started

### Prerequisites

Before you begin contributing, ensure you have:

1. Read the [README.md](./README.md)
2. Followed [SETUP.md](./SETUP.md) to set up your development environment
3. Read [ONBOARDING.md](./ONBOARDING.md) for project overview
4. Reviewed [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the codebase

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork locally**:
   ```bash
   git clone https://github.com/your-username/collabuu-webapp.git
   cd collabuu-webapp
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-org/collabuu-webapp.git
   ```

4. **Verify remotes**:
   ```bash
   git remote -v
   # origin    https://github.com/your-username/collabuu-webapp.git (fetch)
   # origin    https://github.com/your-username/collabuu-webapp.git (push)
   # upstream  https://github.com/original-org/collabuu-webapp.git (fetch)
   # upstream  https://github.com/original-org/collabuu-webapp.git (push)
   ```

## Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
# Sync with upstream first
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

**Branch Naming Conventions**:
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code following our [Coding Standards](#coding-standards)
- Add comments for complex logic
- Update documentation if needed
- Write/update tests for your changes

### 3. Test Your Changes

Before committing, ensure:

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format

# Build
npm run build

# Test locally
npm run dev
```

### 4. Commit Your Changes

Follow our [Commit Message Guidelines](#commit-message-guidelines):

```bash
git add .
git commit -m "feat: add campaign duplication feature"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

Go to GitHub and create a Pull Request from your fork to the main repository.

## Pull Request Process

### Before Submitting

- [ ] Code follows the project's coding standards
- [ ] All tests pass (`npm run type-check`, `npm run lint`)
- [ ] Build completes successfully (`npm run build`)
- [ ] Documentation is updated (if applicable)
- [ ] Commit messages follow guidelines
- [ ] Branch is up to date with main

### PR Title Format

Use conventional commit format:

```
<type>(<scope>): <description>

Examples:
feat(campaigns): add campaign duplication feature
fix(auth): resolve token refresh issue
docs(readme): update installation instructions
refactor(api): simplify error handling
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
Describe the tests you ran and how to reproduce them

## Screenshots (if applicable)
Add screenshots to demonstrate changes

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested my changes locally
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Code Review**: At least one team member reviews your code
3. **Address Feedback**: Make requested changes
4. **Approval**: PR must be approved before merging
5. **Merge**: Maintainer merges your PR

### After Merge

```bash
# Sync your fork
git checkout main
git pull upstream main
git push origin main

# Delete feature branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Define interfaces for all props and data structures
- Avoid `any` type - use `unknown` if type is truly unknown
- Use type inference where possible

**Good**:
```typescript
interface CampaignProps {
  campaign: Campaign;
  onUpdate: (campaign: Campaign) => void;
}

export function CampaignCard({ campaign, onUpdate }: CampaignProps) {
  // ...
}
```

**Bad**:
```typescript
export function CampaignCard(props: any) {
  // ...
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused (< 200 lines)
- Extract reusable logic into custom hooks
- Use proper prop types with TypeScript

**Component Structure**:
```typescript
'use client'; // If client component

import { useState } from 'react';
import { Card } from '@/components/ui/card';

interface ComponentProps {
  title: string;
  onAction: () => void;
}

export function Component({ title, onAction }: ComponentProps) {
  // 1. Hooks
  const [state, setState] = useState<string>('');

  // 2. Event handlers
  const handleClick = () => {
    // ...
  };

  // 3. Render
  return (
    <Card>
      {/* JSX */}
    </Card>
  );
}
```

### File Organization

- One component per file
- Co-locate related files (styles, tests, types)
- Use index files for cleaner imports

```
components/
  campaigns/
    campaign-card.tsx
    campaign-filters.tsx
    index.ts  // Re-exports
```

### Naming Conventions

- **Components**: PascalCase (`CampaignCard.tsx`)
- **Files**: kebab-case (`use-campaigns.ts`)
- **Variables/Functions**: camelCase (`getCampaigns`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`Campaign`, `CampaignFilters`)

### Code Formatting

We use Prettier for automatic formatting:

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

**Prettier Configuration** (`.prettierrc`):
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### ESLint Rules

- No unused variables
- No console.log in production code (use proper logging)
- Consistent import order
- Prefer const over let
- No var declarations

### Comments

- Use JSDoc for functions and complex components
- Explain "why" not "what"
- Keep comments up-to-date

**Good**:
```typescript
/**
 * Calculates the total cost of a campaign based on budget configuration.
 * For MEDIA_EVENT type, uses fixed credit amount.
 * For PAY_PER_CUSTOMER, multiplies credits per visit by max visits.
 */
function calculateCampaignCost(campaign: Campaign): number {
  // ...
}
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Must be one of:

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, missing semi-colons, etc)
- **refactor**: Code refactoring without feature changes
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build process or auxiliary tool changes

### Scope (optional)

The scope should be the name of the affected module:

- `auth` - Authentication
- `campaigns` - Campaign management
- `credits` - Credit system
- `profile` - Profile management
- `ui` - UI components

### Subject

- Use imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize first letter
- No period (.) at the end

### Examples

```bash
# Feature
feat(campaigns): add campaign duplication functionality

# Bug fix
fix(auth): resolve token refresh infinite loop

# Documentation
docs(readme): update setup instructions for M1 Macs

# Refactor
refactor(api): simplify error handling with custom hook

# Performance
perf(campaigns): optimize campaign list rendering with virtualization
```

## Issue Reporting

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check documentation** - the answer might already exist
3. **Test with latest version** - bug might be already fixed

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. macOS 14.0]
 - Browser: [e.g. chrome, safari]
 - Version: [e.g. 22]
 - Node version: [e.g. 18.17.0]

**Additional context**
Add any other context about the problem here.
```

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## Questions?

If you have questions about contributing:

- Check existing documentation
- Ask in GitHub Discussions
- Reach out to maintainers
- Create an issue with the "question" label

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Collabuu! 🎉
