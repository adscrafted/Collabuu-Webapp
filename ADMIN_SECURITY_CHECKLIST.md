# Admin Security Checklist

This checklist ensures your admin authentication system is properly secured according to OWASP security standards.

## Pre-Deployment Checklist

### Database Security

- [ ] **Migration executed successfully**
  - Run `/supabase/migrations/20251027_admin_role_system.sql`
  - Verify all tables created: `admin_users`, `admin_audit_log`
  - Verify all functions created: Check with `SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE '%admin%'`

- [ ] **Row Level Security (RLS) enabled**
  - `admin_users` table: ✓ RLS enabled with service role policy
  - `admin_audit_log` table: ✓ RLS enabled with admin view policy
  - Test: Non-admin users cannot access these tables

- [ ] **Database permissions correct**
  - Service role has full access to admin tables
  - Authenticated role can execute admin functions
  - Anon role has no access to admin tables

### Authentication Setup

- [ ] **First admin user created**
  - User exists in `auth.users`
  - User has `role: "admin"` in `user_metadata`
  - Entry exists in `admin_users` table
  - Account is active (`is_active = true`)
  - Test login at `/admin/login`

- [ ] **Environment variables configured**
  - `NEXT_PUBLIC_SUPABASE_URL` set
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
  - `SUPABASE_SERVICE_ROLE_KEY` set (NEVER in client code)
  - `.env.local` added to `.gitignore`

- [ ] **Service role key protected**
  - Not committed to version control
  - Only used in server-side code
  - Stored securely in production environment

### Access Control

- [ ] **Role-based permissions working**
  - Viewer can only read data
  - Moderator can approve/reject
  - Super admin has full access
  - Test each role level

- [ ] **Middleware protection active**
  - `/admin/*` routes redirect to `/admin/login` if not authenticated
  - Admin token validated on each request
  - Regular users cannot access admin routes

- [ ] **API endpoint protection**
  - All admin API routes use `authenticateAdmin()`
  - Required admin level enforced
  - Non-admin API calls return 403 Forbidden

### Security Features

- [ ] **Account lockout working**
  - Account locks after 5 failed login attempts
  - Lock duration is 30 minutes
  - Test failed login behavior
  - Verify lock can be manually cleared

- [ ] **Audit logging enabled**
  - Login attempts logged
  - All admin actions logged
  - IP addresses captured
  - User agents captured
  - Test: Check `admin_audit_log` table after actions

- [ ] **Rate limiting configured**
  - API endpoints have rate limits
  - Excessive requests return 429
  - Test rate limiting on high-frequency actions

- [ ] **Session management secure**
  - Sessions expire after 24 hours
  - Cookies use `SameSite=Strict`
  - Cookies use `Secure` flag (production)
  - Logout clears all session data

### Input Validation

- [ ] **Email validation**
  - Email format validated on login
  - SQL injection prevented
  - XSS prevention in place

- [ ] **Password requirements**
  - Minimum 8 characters enforced
  - Consider complexity requirements
  - No password in logs or audit trail

- [ ] **SQL injection prevention**
  - All queries use parameterized statements
  - No string concatenation in SQL
  - Input sanitization applied

## Production Deployment Checklist

### Pre-Production

- [ ] **Security review completed**
  - Code reviewed for vulnerabilities
  - No hardcoded credentials
  - No console.log with sensitive data
  - Error messages don't leak information

- [ ] **HTTPS enforced**
  - SSL/TLS certificate installed
  - All HTTP redirects to HTTPS
  - Cookies set with `Secure` flag

- [ ] **Environment variables in production**
  - Set in deployment platform (Vercel, etc.)
  - Service role key never exposed
  - Production Supabase project used

- [ ] **Admin accounts reviewed**
  - Remove test accounts
  - Verify all admins are authorized
  - Check admin levels appropriate
  - Deactivate unused accounts

### Post-Deployment

- [ ] **Monitoring setup**
  - Failed login alerts configured
  - Audit log monitoring active
  - Unusual activity detection
  - Error tracking (Sentry, etc.)

- [ ] **Backup and recovery**
  - Database backups enabled
  - Audit logs backed up regularly
  - Recovery procedures documented
  - Tested restore process

- [ ] **Admin access logged**
  - First production login successful
  - Audit trail verified
  - IP addresses logged correctly
  - All actions tracked

## Ongoing Security Maintenance

### Weekly

- [ ] **Review audit logs**
  - Check for suspicious activity
  - Verify all admin actions legitimate
  - Review failed login attempts
  - Check for unauthorized access attempts

```sql
-- Weekly audit log review
SELECT
  admin_email,
  action,
  resource_type,
  created_at,
  ip_address,
  success
FROM public.admin_audit_log
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Failed login attempts this week
SELECT
  admin_email,
  COUNT(*) as failed_attempts,
  MAX(created_at) as last_attempt
FROM public.admin_audit_log
WHERE action = 'admin.login'
  AND success = false
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY admin_email
ORDER BY failed_attempts DESC;
```

### Monthly

- [ ] **Review admin accounts**
  - Verify all active admins still need access
  - Deactivate departing admins immediately
  - Check admin levels still appropriate
  - Remove unused accounts

```sql
-- Review all admin accounts
SELECT
  u.email,
  au.admin_level,
  au.is_active,
  au.last_login_at,
  au.created_at
FROM auth.users u
JOIN public.admin_users au ON au.id = u.id
ORDER BY au.last_login_at DESC NULLS LAST;

-- Admins who haven't logged in for 30+ days
SELECT
  u.email,
  au.admin_level,
  au.last_login_at,
  NOW() - au.last_login_at as days_since_login
FROM auth.users u
JOIN public.admin_users au ON au.id = u.id
WHERE au.is_active = true
  AND (au.last_login_at < NOW() - INTERVAL '30 days' OR au.last_login_at IS NULL);
```

- [ ] **Security updates**
  - Update npm dependencies
  - Check for Supabase updates
  - Review security advisories
  - Test after updates

### Quarterly

- [ ] **Comprehensive security audit**
  - Review all admin permissions
  - Test authentication flows
  - Verify audit logging complete
  - Check rate limiting effectiveness
  - Review failed access attempts

- [ ] **Password rotation**
  - Rotate admin passwords
  - Update service role key if compromised
  - Review session duration settings

- [ ] **Penetration testing**
  - Test authentication bypass attempts
  - Verify SQL injection prevention
  - Check XSS vulnerabilities
  - Test rate limiting

## Incident Response

### If Admin Account Compromised

1. **Immediate actions**
   ```sql
   -- Deactivate compromised account
   UPDATE public.admin_users
   SET is_active = false, updated_at = NOW()
   WHERE id = (SELECT id FROM auth.users WHERE email = 'compromised@example.com');

   -- Revoke all sessions for this user
   DELETE FROM auth.sessions
   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'compromised@example.com');
   ```

2. **Investigation**
   - Review audit logs for unauthorized actions
   - Check IP addresses and locations
   - Identify any data access or modifications
   - Document timeline of events

3. **Recovery**
   - Reset password for compromised account
   - Review and revert any unauthorized changes
   - Notify affected parties if data exposed
   - Update security measures to prevent recurrence

### If Unauthorized Access Detected

1. **Lock down**
   - Deactivate suspicious accounts
   - Review all recent admin actions
   - Check for new unauthorized admins

2. **Audit**
   ```sql
   -- Recent admin creations
   SELECT * FROM public.admin_audit_log
   WHERE action = 'admin.create'
   ORDER BY created_at DESC;

   -- Recent permission changes
   SELECT * FROM public.admin_audit_log
   WHERE action LIKE 'admin.%'
   ORDER BY created_at DESC;
   ```

3. **Remediate**
   - Remove unauthorized access
   - Patch security vulnerability
   - Reset all admin passwords
   - Review and update security policies

## OWASP Top 10 Coverage

This implementation addresses:

- **A01:2021 - Broken Access Control**
  - ✓ Role-based access control (RBAC)
  - ✓ Middleware protection for admin routes
  - ✓ API endpoint authorization
  - ✓ Principle of least privilege

- **A02:2021 - Cryptographic Failures**
  - ✓ Passwords hashed with bcrypt (Supabase)
  - ✓ HTTPS enforced in production
  - ✓ Secure cookie flags

- **A03:2021 - Injection**
  - ✓ Parameterized SQL queries
  - ✓ Input validation
  - ✓ ORM usage (Supabase client)

- **A04:2021 - Insecure Design**
  - ✓ Secure architecture with defense in depth
  - ✓ Threat modeling for admin access
  - ✓ Account lockout mechanism

- **A05:2021 - Security Misconfiguration**
  - ✓ Environment variables properly configured
  - ✓ Service role key protected
  - ✓ RLS policies enabled

- **A07:2021 - Identification and Authentication Failures**
  - ✓ Strong password requirements
  - ✓ Account lockout after failed attempts
  - ✓ Secure session management
  - ✓ Multi-layer authentication

- **A09:2021 - Security Logging and Monitoring Failures**
  - ✓ Comprehensive audit logging
  - ✓ IP address tracking
  - ✓ Failed login monitoring
  - ✓ All admin actions logged

## Compliance

- [ ] **GDPR Considerations**
  - Audit logs contain personal data (email, IP)
  - Retention policy documented
  - Data deletion procedures in place

- [ ] **SOC 2 Considerations**
  - Access controls documented
  - Audit trails maintained
  - Change management logged
  - Security monitoring active

---

**Last Updated:** 2025-10-27
**Review Frequency:** Quarterly
**Next Review:** 2026-01-27
