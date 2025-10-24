# Setup Instructions

This guide provides step-by-step instructions for setting up the Collabuu web application on your local development environment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)
- [Environment Configuration](#environment-configuration)
- [Supabase Setup](#supabase-setup)
- [Stripe Setup](#stripe-setup)
- [Backend API Connection](#backend-api-connection)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Common Issues and Troubleshooting](#common-issues-and-troubleshooting)

## Prerequisites

### Required Software

Ensure you have the following installed on your system:

| Software | Minimum Version | Download Link |
|----------|----------------|---------------|
| Node.js  | 18.0.0 | [nodejs.org](https://nodejs.org) |
| npm      | 9.0.0 | Included with Node.js |
| Git      | 2.30.0 | [git-scm.com](https://git-scm.com) |

### Verify Installation

```bash
# Check Node.js version
node --version
# Expected: v18.0.0 or higher

# Check npm version
npm --version
# Expected: 9.0.0 or higher

# Check Git version
git --version
# Expected: 2.30.0 or higher
```

### Required Accounts

You'll need accounts for the following services:

- [x] **Supabase** - [supabase.com](https://supabase.com) (Free tier available)
- [x] **Stripe** - [stripe.com](https://stripe.com) (Test mode for development)
- [x] **GitHub** (optional, for version control)

## Installation Steps

### Step 1: Clone the Repository

```bash
# Using HTTPS
git clone https://github.com/your-org/collabuu-webapp.git

# Or using SSH
git clone git@github.com:your-org/collabuu-webapp.git

# Navigate to project directory
cd collabuu-webapp
```

### Step 2: Install Dependencies

```bash
# Install all npm packages
npm install

# This will install:
# - Next.js and React
# - TypeScript
# - Tailwind CSS
# - shadcn/ui components
# - All other dependencies listed in package.json
```

**Expected output**: Installation should complete without errors. If you encounter errors, see [Troubleshooting](#common-issues-and-troubleshooting).

### Step 3: Verify Installation

```bash
# Check if node_modules directory was created
ls -la | grep node_modules

# Verify critical packages
npm list next react typescript
```

## Environment Configuration

### Step 1: Create Environment File

```bash
# Copy the example environment file
cp .env.example .env.local
```

The `.env.local` file will contain your local environment variables and is **not committed to git** (it's in `.gitignore`).

### Step 2: Basic Environment Variables

Open `.env.local` in your text editor and configure the following variables:

```env
# Backend API (we'll configure this later)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase (we'll get these values in the next section)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Stripe (we'll configure this in the Stripe section)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

**Note**: Leave the Supabase and Stripe values empty for now. We'll fill them in the following sections.

## Supabase Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click **"New Project"**
4. Fill in project details:
   - **Name**: `collabuu-dev` (or your preferred name)
   - **Database Password**: Create a strong password (save it securely)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is sufficient for development
5. Click **"Create new project"**
6. Wait 2-3 minutes for project to initialize

### Step 2: Get API Credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon in sidebar)
2. Navigate to **API** section
3. Copy the following values:

```env
# Project URL (under "Project URL")
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Anon/Public key (under "Project API keys" → "anon public")
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Paste these values into your `.env.local` file

### Step 3: Configure Authentication

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Add these Site URLs:
   ```
   http://localhost:3000
   http://localhost:3000/*
   ```
3. Add these Redirect URLs:
   ```
   http://localhost:3000/dashboard
   http://localhost:3000/login
   ```

### Step 4: Set Up Storage

1. Go to **Storage** in Supabase Dashboard
2. Click **"Create a new bucket"**
3. Bucket details:
   - **Name**: `campaign-images`
   - **Public bucket**: Yes (check the box)
4. Click **"Create bucket"**

5. Set up storage policies:
   - Click on the `campaign-images` bucket
   - Go to **Policies** tab
   - Click **"New Policy"** → **"Create a policy from scratch"**

   **Upload Policy** (allow authenticated users to upload):
   ```sql
   CREATE POLICY "Allow authenticated users to upload"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'campaign-images');
   ```

   **Read Policy** (allow everyone to read):
   ```sql
   CREATE POLICY "Allow public read access"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'campaign-images');
   ```

### Step 5: Verify Supabase Connection

```bash
# Run a quick test
npm run dev

# Open browser to http://localhost:3000
# Try to access the register page
# You should see the registration form without errors
```

## Stripe Setup

### Step 1: Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up for a new account
3. Complete account verification (you can skip some steps for test mode)

### Step 2: Get Test API Keys

1. In Stripe Dashboard, ensure you're in **Test mode** (toggle in top right)
2. Go to **Developers** → **API keys**
3. Copy the following keys:

```env
# Publishable key (starts with pk_test_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...

# Secret key (starts with sk_test_) - click "Reveal test key"
STRIPE_SECRET_KEY=sk_test_51...
```

4. Paste these values into your `.env.local` file

### Step 3: Create Test Products

1. Go to **Products** in Stripe Dashboard
2. Click **"Add product"** and create the following credit packages:

   **100 Credits Package**
   - Name: `100 Credits`
   - Description: `Starter package - 100 Collabuu credits`
   - Price: $10.00 USD (One-time payment)

   **500 Credits Package**
   - Name: `500 Credits`
   - Description: `Popular package - 500 Collabuu credits`
   - Price: $45.00 USD (One-time payment)

   **1000 Credits Package**
   - Name: `1000 Credits`
   - Description: `Professional package - 1000 Collabuu credits`
   - Price: $80.00 USD (One-time payment)

   **2500 Credits Package**
   - Name: `2500 Credits`
   - Description: `Enterprise package - 2500 Collabuu credits`
   - Price: $180.00 USD (One-time payment)

3. Save the Product IDs for later use in your application

### Step 4: Set Up Webhook Locally

For local development, we'll use Stripe CLI to forward webhook events:

1. **Install Stripe CLI**:

   **macOS** (using Homebrew):
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

   **Windows** (using Scoop):
   ```bash
   scoop install stripe
   ```

   **Linux**:
   ```bash
   # Download from https://github.com/stripe/stripe-cli/releases
   ```

2. **Login to Stripe CLI**:
   ```bash
   stripe login
   ```

3. **Forward webhooks** (run this in a separate terminal):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copy webhook signing secret** from the output:
   ```
   > Ready! Your webhook signing secret is whsec_... (^C to quit)
   ```

5. Add to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

**Note**: Keep the `stripe listen` command running while testing payment functionality.

### Step 5: Test Stripe Integration

Use these test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

All test cards:
- Use any future expiration date
- Use any 3-digit CVC
- Use any ZIP code

## Backend API Connection

The Collabuu frontend requires a backend API for full functionality.

### Option 1: Use Production API (Quick Start)

For quick testing, you can use the production API:

```env
NEXT_PUBLIC_API_URL=https://collabuu-production.up.railway.app
```

**Note**: This is suitable for testing but you should set up your own backend for development.

### Option 2: Run Backend Locally (Recommended)

1. Clone the backend repository:
   ```bash
   git clone https://github.com/your-org/collabuu-backend.git
   cd collabuu-backend
   ```

2. Follow the backend setup instructions (see backend README)

3. Start the backend server (typically on port 3001)

4. Configure frontend to use local backend:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

### Verify API Connection

```bash
# Test API health endpoint
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"..."}

# Or if using production API
curl https://collabuu-production.up.railway.app/health
```

For detailed API requirements, see [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md).

## Running the Application

### Development Mode

```bash
# Start development server
npm run dev
```

The application will be available at: [http://localhost:3000](http://localhost:3000)

**Development features**:
- Hot reload - changes appear instantly
- Fast Refresh - preserves component state
- Error overlay - displays errors in browser
- Source maps - for easy debugging

### Verify Everything Works

1. **Homepage**: Visit [http://localhost:3000](http://localhost:3000)
   - Should load without errors
   - Navigation should work

2. **Registration**: Visit [http://localhost:3000/register](http://localhost:3000/register)
   - Fill in the form
   - Submit registration
   - Should redirect to dashboard

3. **Login**: Visit [http://localhost:3000/login](http://localhost:3000/login)
   - Login with created account
   - Should redirect to dashboard

4. **Dashboard**: After login
   - Should see dashboard layout
   - Sidebar navigation works
   - Can access all pages

5. **Create Campaign**: Visit campaigns → New Campaign
   - Should see multi-step wizard
   - Can upload images
   - Form validation works

### Other Available Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Code formatting
npm run format

# Format check (without modifying files)
npm run format:check
```

## Building for Production

### Create Production Build

```bash
# Build the application
npm run build
```

This command:
- Compiles TypeScript
- Bundles JavaScript
- Optimizes images
- Generates static pages
- Creates optimized production build

**Expected output**:
```
✓ Creating an optimized production build
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    1.2 kB         85.3 kB
├ ○ /login                               2.3 kB         87.4 kB
├ ○ /register                            2.5 kB         87.6 kB
└ ƒ /dashboard/*                         ...            ...
```

### Test Production Build Locally

```bash
# Start production server
npm start
```

Application will run at: [http://localhost:3000](http://localhost:3000)

### Build Troubleshooting

**Error**: Type errors during build
```bash
# Run type check to see all errors
npm run type-check

# Fix all TypeScript errors before building
```

**Error**: Out of memory
```bash
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

## Common Issues and Troubleshooting

### Installation Issues

#### Problem: `npm install` fails

**Error**: `EACCES: permission denied`
```bash
# Solution: Fix npm permissions
sudo chown -R $USER /usr/local/lib/node_modules
```

**Error**: `ERESOLVE unable to resolve dependency tree`
```bash
# Solution: Use legacy peer deps
npm install --legacy-peer-deps
```

**Error**: Network timeout
```bash
# Solution: Increase timeout
npm install --fetch-timeout=60000
```

### Environment Variable Issues

#### Problem: Environment variables not loading

```bash
# 1. Verify file exists
ls -la .env.local

# 2. Check file contents
cat .env.local

# 3. Restart development server
# Stop server (Ctrl+C) and run again
npm run dev
```

**Important**: Environment variables are loaded when the server starts. You must restart after changing `.env.local`.

### Supabase Connection Issues

#### Problem: Authentication fails

```bash
# Check Supabase credentials are correct
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Solution**:
1. Verify credentials in Supabase Dashboard → Settings → API
2. Ensure no extra spaces in `.env.local`
3. Verify redirect URLs are configured
4. Clear browser localStorage and try again

#### Problem: Image upload fails

**Solution**:
1. Verify storage bucket `campaign-images` exists
2. Check bucket is public
3. Verify storage policies are created
4. Test by manually uploading in Supabase Dashboard

### Stripe Issues

#### Problem: Webhook not receiving events

**Solution**:
1. Ensure `stripe listen` is running
2. Verify webhook secret in `.env.local`
3. Check webhook endpoint at `/api/stripe/webhook`
4. Review Stripe CLI output for errors

#### Problem: Payment fails

**Solution**:
1. Use test mode API keys
2. Use test card numbers
3. Check Stripe Dashboard → Logs for errors
4. Verify publishable key is in `.env.local`

### API Connection Issues

#### Problem: API calls fail with CORS error

**Solution**:
1. Verify backend CORS allows `http://localhost:3000`
2. Check `NEXT_PUBLIC_API_URL` is correct
3. Ensure backend is running
4. Test API health endpoint directly

#### Problem: 401 Unauthorized errors

**Solution**:
1. Verify you're logged in
2. Check auth token in localStorage
3. Clear localStorage and login again
4. Verify backend auth configuration

### Port Already in Use

#### Problem: Port 3000 is already in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or use different port
PORT=3001 npm run dev
```

### Build Errors

#### Problem: Build fails with memory error

```bash
# Increase memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

#### Problem: Module not found errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

## Development Tips

### VS Code Setup

Recommended extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

`.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Hot Reload Not Working

```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

### Debugging

Use VS Code debugger:

`.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    }
  ]
}
```

## Next Steps

After successful setup:

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the codebase structure
2. Review [FEATURES.md](./FEATURES.md) to see all implemented features
3. Check [ONBOARDING.md](./ONBOARDING.md) for developer onboarding
4. See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines

## Getting Help

If you encounter issues not covered here:

1. Check existing [GitHub Issues](https://github.com/your-org/collabuu-webapp/issues)
2. Review [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) for API-related issues
3. Contact the development team
4. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)

---

**Last Updated**: October 2024
