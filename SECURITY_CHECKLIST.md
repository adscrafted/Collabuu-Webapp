# Production Security Checklist

Quick reference for securing the Collabuu web application before full production deployment.

## Critical (Do Immediately) 🔴

- [ ] **Remove console.log statements with sensitive data**
  - 149 console.log statements found
  - Especially in `/app/api/stripe/webhook/route.ts` (lines 30-37, 142-151)
  - Logs contain: user IDs, payment amounts, business IDs, credits
  - **Action:** Implement structured logging (see PRODUCTION_SECURITY_AUDIT.md section 6)

- [ ] **Implement production-grade rate limiting**
  - Current in-memory rate limiting won't work with multiple Railway instances
  - **Action:** Implement Redis-based rate limiting with Upstash
  - **Files to update:** `/app/api/stripe/create-checkout-session/route.ts`

- [ ] **Configure CORS for API routes**
  - Currently allows all origins (default Next.js behavior)
  - **Action:** Add CORS headers to `next.config.js`
  - Restrict to your production domain only

## High Priority (This Week) ⚠️

- [ ] **Move security headers to next.config.js**
  - Headers in `vercel.json` won't apply on Railway
  - **Action:** Copy headers to `next.config.js` → `async headers()` function
  - Add Content-Security-Policy header

- [ ] **Verify cookie security settings**
  - Ensure `httpOnly`, `secure`, and `sameSite` flags are set
  - **Files to check:** Cookie setting code (likely in auth library)
  - Remove redundant `admin_role` cookie

- [ ] **Add CSRF protection for state-changing operations**
  - POST/PUT/DELETE endpoints need CSRF token validation
  - **Action:** Implement CSRF token generation and validation

## Medium Priority (This Month) 📋

- [ ] **Enhance file upload security**
  - Add magic byte validation (not just MIME type)
  - Add image dimension validation
  - **Files:** `/app/api/upload/campaign-image/route.ts`, `/app/api/business/profile/logo/route.ts`

- [ ] **Implement monitoring and alerting**
  - Set up Sentry or similar error tracking
  - Add alerts for failed logins, payment failures, 500 errors
  - Monitor rate limit violations

- [ ] **Add MFA for admin accounts**
  - Implement TOTP-based two-factor authentication
  - Make it required for super_admin role

- [ ] **Run security audit on dependencies**
  ```bash
  npm audit --production
  npm audit fix
  ```

- [ ] **Add session timeout for inactive users**
  - Implement automatic logout after 30 minutes of inactivity

## Verification Tests

Before going live, test:

- [ ] **Authentication**
  - [ ] Can't access protected routes without token
  - [ ] Admin routes require admin token
  - [ ] Account locks after 5 failed login attempts
  - [ ] Tokens expire appropriately

- [ ] **Rate Limiting**
  - [ ] Get 429 error after exceeding rate limit
  - [ ] Rate limit resets after time window
  - [ ] Works across multiple requests from same IP

- [ ] **CORS**
  - [ ] API requests from unknown origins are blocked
  - [ ] Requests from your domain work correctly
  - [ ] Stripe webhook endpoint accepts Stripe requests

- [ ] **File Uploads**
  - [ ] Rejects files over size limit
  - [ ] Rejects invalid file types
  - [ ] Handles malicious file names safely

- [ ] **Payment Security**
  - [ ] Webhook signature validation works
  - [ ] Invalid webhook signatures rejected
  - [ ] Duplicate payments prevented

- [ ] **Headers**
  - [ ] Check with https://securityheaders.com/
  - [ ] All security headers present
  - [ ] CSP policy doesn't break functionality

## Environment Variables (Railway)

Verify these are set in Railway dashboard:

### Required (Server-only)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (never expose to client!)
- [ ] `STRIPE_SECRET_KEY` (sk_live_...)
- [ ] `STRIPE_WEBHOOK_SECRET` (whsec_...)
- [ ] `RESEND_API_KEY`

### Required (Client-safe)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live_...)
- [ ] `NEXT_PUBLIC_API_URL`
- [ ] `NEXT_PUBLIC_APP_URL`

### Optional
- [ ] `EMAIL_FROM`
- [ ] `SUPPORT_EMAIL`
- [ ] `NODE_ENV=production`

## Post-Deployment

After deploying:

1. [ ] **Test all critical flows**
   - [ ] User registration and login
   - [ ] Campaign creation
   - [ ] Credit purchase (with test card)
   - [ ] Admin login
   - [ ] File uploads

2. [ ] **Monitor logs for errors**
   - Check Railway logs for unexpected errors
   - Verify no sensitive data in logs

3. [ ] **Test security headers**
   - Visit https://securityheaders.com/
   - Should get A or A+ rating

4. [ ] **Test rate limiting**
   - Make rapid requests to checkout endpoint
   - Should get 429 after limit

5. [ ] **Verify HTTPS**
   - All pages load over HTTPS
   - No mixed content warnings

## Quick Fixes (Code Snippets)

### 1. Remove Production Logs

Add to `next.config.js`:
```javascript
webpack: (config, { isServer, dev }) => {
  if (!dev && isServer) {
    config.optimization.minimize = true;
  }
  return config;
},
```

Or manually replace console.log statements with conditional logging:
```typescript
if (process.env.NODE_ENV !== 'production') {
  console.log('Debug info');
}
```

### 2. Add CORS Headers

In `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL },
        { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
      ],
    },
  ];
}
```

### 3. Add Rate Limiting

Install Upstash:
```bash
npm install @upstash/redis
```

Create `lib/rate-limit.ts`:
```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function rateLimit(identifier: string, limit = 10, windowSec = 60) {
  const key = `rate-limit:${identifier}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, windowSec);
  return { success: count <= limit, remaining: Math.max(0, limit - count) };
}
```

## Security Contacts

- **OWASP Top 10:** https://owasp.org/Top10/
- **Security Headers Checker:** https://securityheaders.com/
- **Railway Security:** https://docs.railway.app/reference/security
- **Next.js Security:** https://nextjs.org/docs/app/building-your-application/configuring/security-headers
- **Stripe Security:** https://stripe.com/docs/security

## Notes

- **Current Security Rating:** B+ (Good)
- **Target Rating:** A (Excellent)
- **Estimated Time to Fix Critical Issues:** 4-8 hours
- **Last Audit:** 2025-10-30

---

For detailed recommendations and code examples, see `PRODUCTION_SECURITY_AUDIT.md`.
