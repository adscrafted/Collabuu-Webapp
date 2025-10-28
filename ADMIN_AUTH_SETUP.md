# Admin Authentication Setup Guide

## Overview

This guide explains how to set up secure admin authentication for the Collabuu withdrawal admin area using Supabase.

**Security Implementation:** This system implements multiple OWASP security best practices:
- **A01:2021** - Broken Access Control: Role-based access control (RBAC)
- **A07:2021** - Authentication Failures: Account lockout, secure sessions
- **A09:2021** - Security Logging: Comprehensive audit trail

---

## Table of Contents

1. [Database Setup](#1-database-setup)
2. [Environment Configuration](#2-environment-configuration)
3. [Creating First Admin User](#3-creating-first-admin-user)
4. [Testing Authentication](#4-testing-authentication)
5. [API Integration](#5-api-integration)
6. [Security Features](#6-security-features)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Database Setup

### Step 1.1: Run the Migration SQL

Execute the SQL migration to create the admin role system:

```bash
# Location of migration file
/supabase/migrations/20251027_admin_role_system.sql
```

**Execute in Supabase:**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the entire contents of the migration file
5. Click **Run** to execute

**What this creates:**
- `admin_users` table - Stores admin-specific metadata and security tracking
- `admin_audit_log` table - Immutable audit trail for all admin actions
- Helper functions for login tracking, account locking, and audit logging
- Row Level Security (RLS) policies for data protection

### Step 1.2: Verify Migration

Check that tables were created successfully:

```sql
-- Verify admin_users table
SELECT * FROM admin_users LIMIT 1;

-- Verify admin_audit_log table
SELECT * FROM admin_audit_log LIMIT 1;

-- Verify functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%admin%';
```

---

## 2. Environment Configuration

### Required Environment Variables

Ensure these are set in your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application URLs
NEXT_PUBLIC_API_URL=your_backend_api_url
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Security Note:** Never commit `.env.local` to version control. The `SUPABASE_SERVICE_ROLE_KEY` provides full database access and must be kept secret.

---

## 3. Creating First Admin User

### Step 3.1: Create User via Supabase Auth

There are two methods to create the initial admin user:

#### Method A: Via Supabase Dashboard (Recommended)

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **Add User** → **Create new user**
3. Enter:
   - Email: `admin@collabuu.com` (or your admin email)
   - Password: (secure password - minimum 8 characters)
   - Auto Confirm User: **Yes** ✓
4. Click **Create User**

#### Method B: Via SQL

```sql
-- Create admin user programmatically
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@collabuu.com',
  crypt('YourSecurePassword123!', gen_salt('bf')),
  NOW(),
  '{"role": "admin"}'::jsonb,
  NOW(),
  NOW()
);
```

### Step 3.2: Add Admin Role to User Metadata

Update the user's metadata to include the admin role:

```sql
-- Update user metadata to add admin role
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@collabuu.com';
```

### Step 3.3: Create Admin User Entry

Insert a record into the `admin_users` table:

```sql
-- Create admin_users entry for the user
INSERT INTO public.admin_users (
  id,
  admin_level,
  created_by,
  notes,
  is_active
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@collabuu.com'),
  'super_admin', -- Options: 'viewer', 'moderator', 'super_admin'
  (SELECT id FROM auth.users WHERE email = 'admin@collabuu.com'),
  'Initial super admin account created during setup',
  true
);
```

### Step 3.4: Verify Admin User

Check that the admin user was created correctly:

```sql
-- Verify admin user
SELECT
  u.email,
  u.raw_user_meta_data->>'role' as role,
  au.admin_level,
  au.is_active,
  au.created_at
FROM auth.users u
JOIN public.admin_users au ON au.id = u.id
WHERE u.email = 'admin@collabuu.com';
```

Expected result:
```
email                | role  | admin_level  | is_active | created_at
---------------------|-------|--------------|-----------|------------------
admin@collabuu.com   | admin | super_admin  | true      | 2025-10-27 ...
```

---

## 4. Testing Authentication

### Step 4.1: Start Development Server

```bash
npm run dev
```

### Step 4.2: Navigate to Admin Login

Open your browser and go to:
```
http://localhost:3000/admin/login
```

### Step 4.3: Login with Admin Credentials

- **Email:** `admin@collabuu.com` (or the email you created)
- **Password:** The password you set

### Step 4.4: Verify Successful Login

After successful login:
1. You should be redirected to `/admin/withdrawals`
2. Check browser cookies - you should see:
   - `admin_token` - JWT authentication token
   - `admin_role` - Admin level (super_admin, moderator, or viewer)

### Step 4.5: Verify Audit Logging

Check that login was logged:

```sql
-- View recent admin login events
SELECT
  admin_email,
  action,
  created_at,
  ip_address,
  success
FROM public.admin_audit_log
WHERE action = 'admin.login'
ORDER BY created_at DESC
LIMIT 5;
```

---

## 5. API Integration

### Protecting Admin API Endpoints

Update your admin API routes to use the new authentication system:

#### Example: Withdrawal Approval Endpoint

```typescript
// app/api/admin/withdrawals/[id]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, logAdminApiAction } from '@/lib/auth/admin-middleware';
import { AdminLevel } from '@/lib/auth/admin';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Authenticate admin - requires MODERATOR level to approve
  const authResult = await authenticateAdmin(request, {
    requiredLevel: AdminLevel.MODERATOR,
    action: 'withdrawal.approve',
    rateLimitPerMinute: 30,
  });

  if (!authResult.authorized || !authResult.context) {
    return authResult.response!;
  }

  try {
    // Your approval logic here
    const withdrawalId = params.id;

    // ... perform approval ...

    // Log the action
    await logAdminApiAction(
      authResult.context,
      'withdrawal.approve',
      'withdrawal',
      withdrawalId,
      { status: 'approved' }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    // Error handling
    return NextResponse.json(
      { error: 'Failed to approve withdrawal' },
      { status: 500 }
    );
  }
}
```

### Available Admin Helpers

#### 1. `authenticateAdmin(request, options)`

Authenticates and authorizes admin users.

**Options:**
- `requiredLevel`: Minimum admin level required (VIEWER, MODERATOR, SUPER_ADMIN)
- `action`: Action identifier for rate limiting and logging
- `rateLimitPerMinute`: Maximum requests per minute (optional)

**Returns:**
```typescript
{
  authorized: boolean;
  context?: {
    adminUser: AdminUser;
    ipAddress: string | null;
    userAgent: string | null;
    token: string;
  };
  response?: NextResponse; // Error response if not authorized
}
```

#### 2. `logAdminApiAction(context, action, resourceType, resourceId?, details?)`

Logs admin actions to audit trail.

**Example:**
```typescript
await logAdminApiAction(
  authResult.context,
  'withdrawal.approve',
  'withdrawal',
  'withdrawal-id-123',
  { amount: 500, reason: 'Verified' }
);
```

---

## 6. Security Features

### 6.1 Role-Based Access Control (RBAC)

Three admin levels with hierarchical permissions:

| Level | Permissions | Use Case |
|-------|-------------|----------|
| **viewer** | Read-only access | Viewing reports, monitoring |
| **moderator** | Approve/reject actions | Processing withdrawals |
| **super_admin** | Full access including admin management | System administration |

### 6.2 Account Lockout Protection

**Brute Force Prevention:**
- Account locks after **5 failed login attempts**
- Lock duration: **30 minutes**
- Counter resets on successful login

**Check lock status:**
```sql
SELECT
  email,
  failed_login_attempts,
  locked_until
FROM auth.users u
JOIN public.admin_users au ON au.id = u.id
WHERE locked_until > NOW();
```

**Manually unlock account:**
```sql
UPDATE public.admin_users
SET
  failed_login_attempts = 0,
  locked_until = NULL,
  updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
```

### 6.3 Audit Logging

All admin actions are logged with:
- Admin ID and email
- Action performed (e.g., `withdrawal.approve`)
- Resource type and ID
- Old and new values (for updates)
- IP address and User-Agent
- Success/failure status
- Timestamp

**View audit logs:**
```sql
-- Recent admin actions
SELECT
  admin_email,
  action,
  resource_type,
  resource_id,
  details,
  created_at,
  success
FROM public.admin_audit_log
ORDER BY created_at DESC
LIMIT 20;

-- Failed actions
SELECT *
FROM public.admin_audit_log
WHERE success = false
ORDER BY created_at DESC;

-- Actions by specific admin
SELECT *
FROM public.admin_audit_log
WHERE admin_email = 'admin@collabuu.com'
ORDER BY created_at DESC;
```

### 6.4 Rate Limiting

API endpoints can enforce rate limits:
- Configurable per endpoint
- Tracked in audit log
- Returns `429 Too Many Requests` when exceeded

### 6.5 Session Management

**Admin sessions:**
- Expire after **24 hours** of inactivity
- Secure cookie flags: `SameSite=Strict; Secure`
- Separate from regular user sessions

**Clear all admin sessions (emergency):**
```sql
-- Revoke all admin sessions
DELETE FROM auth.sessions
WHERE user_id IN (
  SELECT id FROM public.admin_users
);
```

---

## 7. Troubleshooting

### Issue: Cannot login - "Access denied"

**Possible causes:**
1. User doesn't have admin role in metadata
2. No entry in `admin_users` table
3. Account is not active

**Solution:**
```sql
-- Check user role
SELECT email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'your-email@example.com';

-- Check admin_users entry
SELECT * FROM public.admin_users
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- Fix: Add admin role
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';

-- Fix: Activate account
UPDATE public.admin_users
SET is_active = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

### Issue: Account locked

**Check lock status:**
```sql
SELECT
  email,
  failed_login_attempts,
  locked_until
FROM auth.users u
JOIN public.admin_users au ON au.id = u.id
WHERE email = 'your-email@example.com';
```

**Unlock manually:**
```sql
UPDATE public.admin_users
SET
  failed_login_attempts = 0,
  locked_until = NULL
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

### Issue: "Invalid token" errors

**Possible causes:**
1. Token expired (24 hour limit)
2. User signed out
3. Session revoked

**Solution:**
- Clear browser cookies
- Login again
- Check Supabase session in browser console:
```javascript
const supabase = createClient();
const { data: { session } } = await supabase.auth.getSession();
console.log(session);
```

### Issue: Audit logs not appearing

**Check:**
1. Database function exists:
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'log_admin_action';
```

2. Check function permissions:
```sql
GRANT EXECUTE ON FUNCTION public.log_admin_action TO authenticated;
```

3. Test function directly:
```sql
SELECT public.log_admin_action(
  (SELECT id FROM auth.users WHERE email = 'admin@collabuu.com'),
  'admin@collabuu.com',
  'test.action',
  'test',
  gen_random_uuid(),
  '{}'::jsonb
);
```

---

## Additional Admin Users

To create additional admin users:

### Step 1: Create User in Supabase Auth
Follow [Step 3.1](#step-31-create-user-via-supabase-auth)

### Step 2: Add Admin Role and Entry
```sql
-- Add admin role to metadata
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'new-admin@example.com';

-- Create admin_users entry
INSERT INTO public.admin_users (
  id,
  admin_level,
  created_by,
  notes,
  is_active
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'new-admin@example.com'),
  'moderator', -- or 'viewer' for read-only
  (SELECT id FROM auth.users WHERE email = 'admin@collabuu.com'), -- Creating admin
  'Created for withdrawal processing',
  true
);
```

---

## Security Best Practices

1. **Strong Passwords**: Enforce minimum 12 characters with complexity
2. **Regular Audits**: Review audit logs weekly for suspicious activity
3. **Principle of Least Privilege**: Grant minimum required admin level
4. **IP Whitelisting**: Consider restricting admin access to specific IPs (production)
5. **2FA**: Consider adding two-factor authentication (future enhancement)
6. **Regular Updates**: Review and update admin permissions quarterly
7. **Offboarding**: Immediately deactivate accounts when admins leave

---

## Files Created

### Database
- `/supabase/migrations/20251027_admin_role_system.sql` - Database schema and functions

### Authentication
- `/lib/supabase/server.ts` - Server-side Supabase clients
- `/lib/auth/admin.ts` - Admin authentication helpers
- `/lib/auth/admin-middleware.ts` - API middleware for admin routes

### API Routes
- `/app/api/admin/auth/verify/route.ts` - Admin role verification
- `/app/api/admin/auth/failed-login/route.ts` - Failed login tracking
- `/app/api/admin/auth/update-login/route.ts` - Update last login
- `/app/api/admin/auth/log-login/route.ts` - Login audit logging
- `/app/api/admin/auth/logout/route.ts` - Admin logout

### UI Components
- `/app/(auth)/admin/login/page.tsx` - Admin login page
- `/lib/hooks/use-admin-login.ts` - Admin login React hook
- `/lib/hooks/use-admin-logout.ts` - Admin logout React hook

### Middleware
- `/middleware.ts` - Updated with admin route protection

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#7-troubleshooting) section
2. Review audit logs for error details
3. Check Supabase logs in dashboard
4. Contact system administrator

---

**Last Updated:** 2025-10-27
**Version:** 1.0.0
