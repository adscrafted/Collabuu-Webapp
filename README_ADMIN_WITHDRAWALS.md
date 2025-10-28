# Admin Withdrawal Management - README

## Overview

Secure admin portal for managing influencer withdrawal requests in the Collabuu platform.

**Current Status:** Fully implemented with secure authentication
**Access URL:** `/admin/withdrawals`
**Login URL:** `/admin/login`

---

## Features

### Withdrawal Management
- View all withdrawal requests with filtering
- Approve/reject withdrawal requests
- Mark withdrawals as completed
- View detailed withdrawal history
- Track payment status
- Export withdrawal reports

### Security Features
- ✅ Role-based access control (RBAC)
- ✅ Account lockout after 5 failed login attempts
- ✅ Comprehensive audit logging of all actions
- ✅ IP address and User-Agent tracking
- ✅ Rate limiting on API endpoints
- ✅ Secure session management (24-hour expiry)

### Admin Roles

| Role | Capabilities |
|------|--------------|
| **Viewer** | View withdrawal requests and reports (read-only) |
| **Moderator** | Approve, reject, and complete withdrawals |
| **Super Admin** | Full access including admin user management |

---

## Authentication Setup

### First Time Setup

1. **Run Database Migration**
   ```bash
   # Execute in Supabase SQL Editor
   /supabase/migrations/20251027_admin_role_system.sql
   ```

2. **Create First Admin User**
   - Go to Supabase Dashboard → Authentication → Users
   - Click "Add User" → "Create new user"
   - Enter email and password
   - Auto confirm user: Yes ✓

3. **Grant Admin Privileges**
   ```sql
   -- Execute in Supabase SQL Editor
   -- Replace email with your admin email

   -- Add admin role
   UPDATE auth.users
   SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
   WHERE email = 'admin@collabuu.com';

   -- Create admin_users entry
   INSERT INTO public.admin_users (
     id,
     admin_level,
     created_by,
     notes,
     is_active
   ) VALUES (
     (SELECT id FROM auth.users WHERE email = 'admin@collabuu.com'),
     'super_admin',
     (SELECT id FROM auth.users WHERE email = 'admin@collabuu.com'),
     'Initial super admin account',
     true
   );
   ```

4. **Test Login**
   - Navigate to: `http://localhost:3000/admin/login`
   - Login with your admin credentials
   - You should be redirected to `/admin/withdrawals`

**See full setup guide:** `ADMIN_AUTH_SETUP.md`

---

## Using the Admin Portal

### Login Process

1. Navigate to `/admin/login`
2. Enter admin email and password
3. System validates:
   - User exists in Supabase Auth
   - User has admin role in metadata
   - Account is active and not locked
   - Account has entry in admin_users table
4. On success, redirects to `/admin/withdrawals`
5. Session expires after 24 hours

### Account Lockout

**Security Feature:** Prevents brute force attacks

- Account locks after **5 failed login attempts**
- Lock duration: **30 minutes**
- To unlock manually:
  ```sql
  UPDATE public.admin_users
  SET failed_login_attempts = 0, locked_until = NULL
  WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
  ```

### Withdrawal Operations

#### View Withdrawals
```
GET /admin/withdrawals
```
**Required:** Viewer role or higher

**Filters:**
- Status (pending, approved, rejected, completed)
- Date range
- Influencer ID
- Amount range
- Sort by (newest, oldest, amount)

#### Approve Withdrawal
```
POST /admin/withdrawals/[id]/approve
```
**Required:** Moderator role or higher

**Actions:**
- Updates status to 'approved'
- Logs action to audit trail
- Sends notification to influencer (if configured)

#### Reject Withdrawal
```
POST /admin/withdrawals/[id]/reject
```
**Required:** Moderator role or higher

**Body:**
```json
{
  "reason": "Reason for rejection"
}
```

#### Complete Withdrawal
```
POST /admin/withdrawals/[id]/complete
```
**Required:** Moderator role or higher

**Actions:**
- Marks withdrawal as completed
- Records completion timestamp
- Updates payment status

### Audit Trail

All admin actions are automatically logged to `admin_audit_log` table.

**View recent actions:**
```sql
SELECT
  admin_email,
  action,
  resource_type,
  resource_id,
  created_at,
  ip_address,
  success
FROM public.admin_audit_log
ORDER BY created_at DESC
LIMIT 20;
```

**View actions for specific withdrawal:**
```sql
SELECT *
FROM public.admin_audit_log
WHERE resource_id = 'withdrawal-id-here'
ORDER BY created_at DESC;
```

---

## API Endpoints

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/auth/verify` | POST | Verify admin role after login |
| `/api/admin/auth/failed-login` | POST | Track failed login attempts |
| `/api/admin/auth/update-login` | POST | Update last login timestamp |
| `/api/admin/auth/log-login` | POST | Log successful login |
| `/api/admin/auth/logout` | POST | Admin logout with audit logging |

### Withdrawal Endpoints

| Endpoint | Method | Required Role | Description |
|----------|--------|---------------|-------------|
| `/api/admin/withdrawals` | GET | Viewer | List all withdrawals with filtering |
| `/api/admin/withdrawals/stats` | GET | Viewer | Get withdrawal statistics |
| `/api/admin/withdrawals/[id]` | GET | Viewer | Get single withdrawal details |
| `/api/admin/withdrawals/[id]/approve` | POST | Moderator | Approve withdrawal request |
| `/api/admin/withdrawals/[id]/reject` | POST | Moderator | Reject withdrawal request |
| `/api/admin/withdrawals/[id]/complete` | POST | Moderator | Mark withdrawal as completed |

**All endpoints require:**
- Valid admin authentication token
- Appropriate admin role level
- Respect rate limits

---

## Security Best Practices

### For Administrators

1. **Strong Passwords**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Don't reuse passwords

2. **Session Management**
   - Always logout when finished
   - Don't share admin accounts
   - Report suspicious activity immediately

3. **Access Review**
   - Review your actions in audit log regularly
   - Report any actions you didn't perform

### For System Administrators

1. **Account Management**
   - Review admin accounts monthly
   - Deactivate departing admins immediately
   - Use least privilege principle

2. **Monitoring**
   - Review audit logs weekly
   - Monitor failed login attempts
   - Set up alerts for suspicious activity

3. **Maintenance**
   - Update dependencies regularly
   - Rotate admin passwords quarterly
   - Test backup and recovery procedures

**Full checklist:** `ADMIN_SECURITY_CHECKLIST.md`

---

## Troubleshooting

### Cannot Login

**Symptom:** "Access denied" error

**Possible Causes:**
1. User doesn't have admin role
2. No entry in admin_users table
3. Account is deactivated

**Solution:**
```sql
-- Check admin status
SELECT
  u.email,
  u.raw_user_meta_data->>'role' as role,
  au.admin_level,
  au.is_active
FROM auth.users u
LEFT JOIN public.admin_users au ON au.id = u.id
WHERE u.email = 'your-email@example.com';

-- Fix: Add admin role if missing
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';

-- Fix: Activate account if inactive
UPDATE public.admin_users
SET is_active = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

### Account Locked

**Symptom:** "Account locked" message after multiple failed attempts

**Solution:**
```sql
-- Check lock status
SELECT
  failed_login_attempts,
  locked_until
FROM public.admin_users
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- Unlock account
UPDATE public.admin_users
SET failed_login_attempts = 0, locked_until = NULL
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

### Session Expired

**Symptom:** Redirected to login page unexpectedly

**Cause:** Admin sessions expire after 24 hours

**Solution:** Simply login again

### API Returns 403 Forbidden

**Symptom:** "Insufficient permissions" error

**Cause:** Your admin role doesn't have permission for this action

**Solution:** Contact super admin to upgrade your role if needed

---

## Adding New Admins

### Step 1: Create User in Supabase
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Enter email and password
4. Auto confirm user: Yes ✓

### Step 2: Grant Admin Privileges
```sql
-- Add admin role
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
  (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
  'Created for withdrawal management',
  true
);
```

**Helper script:** `/supabase/scripts/add_additional_admin.sql`

---

## Removing Admin Access

### Deactivate (Recommended)
```sql
-- Deactivate admin account (preserves audit trail)
UPDATE public.admin_users
SET is_active = false
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
```

### Revoke Sessions
```sql
-- Revoke all active sessions
DELETE FROM auth.sessions
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
```

### Complete Removal (Not Recommended)
```sql
-- Remove admin privileges
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'role'
WHERE email = 'admin@example.com';

-- Remove admin_users entry
DELETE FROM public.admin_users
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
```

**Note:** Deactivation is preferred as it maintains audit trail and can be reversed.

---

## Monitoring & Reporting

### View Admin Activity
```sql
-- Recent admin logins
SELECT
  admin_email,
  created_at,
  ip_address,
  success
FROM public.admin_audit_log
WHERE action = 'admin.login'
ORDER BY created_at DESC
LIMIT 20;

-- Failed login attempts
SELECT
  admin_email,
  COUNT(*) as attempts,
  MAX(created_at) as last_attempt
FROM public.admin_audit_log
WHERE action = 'admin.login' AND success = false
  AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY admin_email
ORDER BY attempts DESC;
```

### View Withdrawal Actions
```sql
-- Recent withdrawal approvals
SELECT
  admin_email,
  resource_id,
  created_at,
  details
FROM public.admin_audit_log
WHERE action = 'withdrawal.approve'
ORDER BY created_at DESC
LIMIT 20;

-- Withdrawal statistics by admin
SELECT
  admin_email,
  COUNT(*) as total_actions,
  COUNT(*) FILTER (WHERE action = 'withdrawal.approve') as approvals,
  COUNT(*) FILTER (WHERE action = 'withdrawal.reject') as rejections,
  COUNT(*) FILTER (WHERE action = 'withdrawal.complete') as completions
FROM public.admin_audit_log
WHERE action LIKE 'withdrawal.%'
GROUP BY admin_email
ORDER BY total_actions DESC;
```

---

## Related Documentation

- **Setup Guide:** `ADMIN_AUTH_SETUP.md` - Complete setup instructions
- **Security Checklist:** `ADMIN_SECURITY_CHECKLIST.md` - Security audit checklist
- **Implementation Summary:** `ADMIN_AUTH_IMPLEMENTATION_SUMMARY.md` - Technical overview

---

## Support

**For technical issues:**
1. Check troubleshooting section above
2. Review audit logs for error details
3. Check Supabase logs in dashboard
4. Contact system administrator

**For security incidents:**
1. Report immediately to super admin
2. Document what occurred
3. Preserve audit logs
4. Follow incident response procedures in `ADMIN_SECURITY_CHECKLIST.md`

---

**Last Updated:** 2025-10-27
**Version:** 1.0.0
**Maintained By:** Collabuu Development Team
