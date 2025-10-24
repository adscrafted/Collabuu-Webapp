# Deployment Guide

This guide provides comprehensive instructions for deploying the Collabuu web application to production environments, with a focus on Vercel deployment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables Configuration](#environment-variables-configuration)
- [Backend API Setup](#backend-api-setup)
- [Supabase Configuration](#supabase-configuration)
- [Stripe Setup for Production](#stripe-setup-for-production)
- [Domain Configuration](#domain-configuration)
- [SSL Certificates](#ssl-certificates)
- [Monitoring and Error Tracking](#monitoring-and-error-tracking)
- [Performance Optimization](#performance-optimization)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying to production, ensure you have:

- [x] GitHub account with repository access
- [x] Vercel account (free tier available)
- [x] Production Supabase project
- [x] Stripe account with production API keys
- [x] Backend API deployed and accessible
- [x] Domain name (optional, but recommended)
- [x] All environment variables documented
- [x] Application tested locally

## Vercel Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended)

#### Step 1: Push Code to GitHub

```bash
# Initialize git repository if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - ready for deployment"

# Add remote repository
git remote add origin https://github.com/your-username/collabuu-webapp.git

# Push to GitHub
git push -u origin main
```

#### Step 2: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub account and authorize Vercel
5. Find and select the `collabuu-webapp` repository
6. Click **"Import"**

#### Step 3: Configure Project Settings

**Framework Preset**: Next.js (auto-detected)

**Build Settings**:
- Build Command: `npm run build`
- Output Directory: `.next` (default)
- Install Command: `npm install`
- Development Command: `npm run dev`

**Root Directory**: `./` (default)

#### Step 4: Configure Environment Variables

Click **"Environment Variables"** and add all required variables (see [Environment Variables Configuration](#environment-variables-configuration) section below).

#### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (typically 2-5 minutes)
3. View deployment at the provided URL

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts to configure project
```

### Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every pull request

To disable automatic deployments:
1. Go to Project Settings → Git
2. Configure deployment branches

## Environment Variables Configuration

### Required Environment Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

#### Backend API

```env
NEXT_PUBLIC_API_URL=https://your-production-api.com
```

**Important**:
- Must be a public, accessible URL
- Should use HTTPS in production
- Do NOT include trailing slash

#### Supabase Configuration

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key_here
```

**To get Supabase credentials**:
1. Go to [supabase.com](https://supabase.com)
2. Select your production project
3. Go to Settings → API
4. Copy Project URL and anon/public key

#### Stripe Configuration

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Important**:
- Use `pk_live_` and `sk_live_` for production
- Never commit secret keys to git
- Webhook secret is different from test mode

### Optional Environment Variables

```env
# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Node Environment
NODE_ENV=production
```

### Environment Variable Scopes

Configure variables for different environments:

- **Production**: Main branch deployments
- **Preview**: Pull request deployments
- **Development**: Local development

Set scope in Vercel Dashboard when adding each variable.

## Backend API Setup

### Requirements

Your backend API must be:

1. **Publicly accessible** via HTTPS
2. **CORS enabled** for your Vercel domain
3. **Health check endpoint** at `/health` or `/api/health`

### CORS Configuration

Backend must allow requests from:
- `https://your-domain.com`
- `https://your-project.vercel.app`
- `https://*.vercel.app` (for preview deployments)

Example CORS configuration (Express.js):

```javascript
const cors = require('cors');

const allowedOrigins = [
  'https://your-domain.com',
  'https://your-project.vercel.app',
  /\.vercel\.app$/  // All Vercel preview deployments
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.some(allowed => {
      return typeof allowed === 'string'
        ? allowed === origin
        : allowed.test(origin);
    })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### API Health Check

Create a health check endpoint:

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});
```

Test health check after deployment:
```bash
curl https://your-api-url.com/health
```

## Supabase Configuration

### Production Project Setup

1. **Create Production Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose a strong database password
   - Select a region close to your users

2. **Database Setup**
   - Run your database migrations
   - Set up Row Level Security (RLS) policies
   - Create necessary tables and indexes

3. **Authentication Configuration**
   - Go to Authentication → Settings
   - Configure redirect URLs:
     ```
     https://your-domain.com/*
     https://your-project.vercel.app/*
     ```
   - Enable email confirmation (recommended)
   - Configure email templates

4. **Storage Configuration**
   - Go to Storage → Policies
   - Create bucket for campaign images: `campaign-images`
   - Set up storage policies for authenticated users
   - Configure CORS for your domain

5. **API Keys**
   - Go to Settings → API
   - Copy `anon/public` key (safe to expose)
   - Copy `service_role` key (keep secret, server-side only)

### Supabase Storage Bucket

Create storage bucket for images:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-images', 'campaign-images', true);

-- Set up storage policy
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'campaign-images');

CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'campaign-images');
```

## Stripe Setup for Production

### Switch to Live Mode

1. **Get Live API Keys**
   - Go to [dashboard.stripe.com](https://dashboard.stripe.com)
   - Toggle to "Live mode" (top right)
   - Go to Developers → API Keys
   - Copy Publishable key (`pk_live_...`)
   - Copy Secret key (`sk_live_...`)

2. **Configure Webhook Endpoint**
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://your-domain.com/api/stripe/webhook`
   - Events to send:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Copy Webhook signing secret

3. **Test Webhook**
   ```bash
   # Use Stripe CLI to test
   stripe listen --forward-to https://your-domain.com/api/stripe/webhook
   ```

4. **Create Products**
   - Go to Products → Add Product
   - Create credit packages:
     - 100 Credits - $10
     - 500 Credits - $45
     - 1000 Credits - $80
     - 2500 Credits - $180
   - Copy Product IDs for your application

5. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Stripe Testing in Production

Test with Stripe test cards (before going fully live):
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

## Domain Configuration

### Option 1: Use Vercel Domain

Vercel provides a free domain:
- `your-project.vercel.app`
- Automatic SSL certificate
- Global CDN

### Option 2: Custom Domain

#### Add Custom Domain

1. Go to Project Settings → Domains
2. Enter your domain: `www.yourdomain.com`
3. Follow DNS configuration instructions

#### DNS Configuration

Add these DNS records at your domain registrar:

**For apex domain (yourdomain.com)**:
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### Verify Domain

```bash
# Check DNS propagation
nslookup www.yourdomain.com

# Should return Vercel's IP
```

## SSL Certificates

### Automatic SSL (Vercel)

Vercel automatically provides:
- Free SSL certificates via Let's Encrypt
- Automatic renewal
- HTTPS redirect
- HTTP/2 and HTTP/3 support

### Force HTTPS

Add to `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ];
  }
};
```

## Monitoring and Error Tracking

### Setup Sentry (Recommended)

1. **Create Sentry Account**
   - Go to [sentry.io](https://sentry.io)
   - Create new project (Next.js)

2. **Install Sentry SDK**
   ```bash
   npm install @sentry/nextjs
   ```

3. **Configure Sentry**
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

4. **Add Sentry DSN**
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
   ```

5. **Test Error Tracking**
   ```javascript
   // Trigger test error
   Sentry.captureException(new Error('Test error'));
   ```

### Vercel Analytics

Enable in Project Settings → Analytics:
- Web Vitals monitoring
- Audience insights
- Real-time analytics

### Logging

Use Vercel's built-in logging:
```bash
# View logs
vercel logs your-deployment-url

# Follow logs in real-time
vercel logs your-deployment-url --follow
```

## Performance Optimization

### Pre-Deployment Checklist

- [ ] Enable Next.js Image Optimization
- [ ] Configure caching headers
- [ ] Enable compression
- [ ] Optimize bundle size
- [ ] Remove unused dependencies
- [ ] Configure ISR/SSG where appropriate

### Bundle Analysis

```bash
# Install bundle analyzer
npm install @next/bundle-analyzer

# Analyze bundle
ANALYZE=true npm run build
```

Add to `next.config.js`:
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... other config
});
```

### Caching Strategy

Configure in `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};
```

### Image Optimization

Ensure all images use Next.js Image component:

```tsx
import Image from 'next/image';

<Image
  src="/campaign-image.jpg"
  alt="Campaign"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

## Post-Deployment Checklist

After deploying, verify:

### Functionality Tests

- [ ] Homepage loads correctly
- [ ] Authentication works (login/register)
- [ ] Protected routes require authentication
- [ ] Campaigns can be created and viewed
- [ ] Credit purchases complete successfully
- [ ] Profile updates save correctly

### Performance Tests

- [ ] Lighthouse score > 90
- [ ] Time to First Byte < 600ms
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1

### Security Checks

- [ ] All API calls use HTTPS
- [ ] Environment variables not exposed
- [ ] CORS configured correctly
- [ ] CSP headers configured
- [ ] Authentication tokens secure
- [ ] No sensitive data in client-side code

### Monitoring Setup

- [ ] Sentry receiving errors
- [ ] Vercel Analytics enabled
- [ ] Uptime monitoring configured
- [ ] Log aggregation working

## Troubleshooting

### Build Fails

**Error**: Module not found
```bash
# Solution: Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Error**: TypeScript errors
```bash
# Solution: Run type check locally
npm run type-check

# Fix all type errors before deploying
```

### Runtime Errors

**Error**: API calls fail
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify CORS configuration on backend
- Check API is accessible from Vercel
- Review Vercel function logs

**Error**: Authentication fails
- Verify Supabase URL and keys
- Check redirect URLs in Supabase
- Clear browser cache and cookies
- Check localStorage persistence

### Stripe Issues

**Error**: Webhook not receiving events
- Verify webhook URL is correct
- Check webhook signing secret
- Test webhook with Stripe CLI
- Review webhook logs in Stripe Dashboard

**Error**: Payment fails
- Use live API keys in production
- Test with real credit card
- Check Stripe account status
- Review Stripe logs

### Performance Issues

**Slow page loads**
- Enable Next.js caching
- Optimize images
- Reduce bundle size
- Enable CDN caching

**High Time to First Byte**
- Move to faster region
- Optimize API response times
- Use ISR or SSG where possible
- Enable edge caching

## Rollback Procedure

If deployment has critical issues:

### Via Vercel Dashboard

1. Go to Deployments
2. Find previous working deployment
3. Click three dots → Promote to Production

### Via Vercel CLI

```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

## Scaling Considerations

### Vercel Limits (Free Tier)

- 100GB bandwidth/month
- 100 deployments/day
- 1000 image optimizations/month

### Upgrade to Pro when:

- Traffic exceeds free tier limits
- Need team collaboration
- Require custom deployment settings
- Need advanced analytics

## Support

For deployment issues:

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- GitHub Issues: Create issue in repository
- Internal Team: Contact DevOps team

---

**Last Updated**: October 2024
