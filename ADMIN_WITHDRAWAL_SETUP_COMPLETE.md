# Admin Withdrawal Management System - Complete Setup Guide

## Overview

A complete admin portal for managing influencer withdrawal requests has been implemented as a **webapp-only feature**. This system allows administrators to:

- Login securely with Supabase authentication
- View all withdrawal requests with filtering and sorting
- Approve, complete, or reject withdrawal requests
- Send automated email notifications to influencers
- Track all admin actions via audit logging
- Export withdrawal data to CSV

---

## Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
cd /Users/anthony/Documents/Projects/Collabuu-Webapp
npm install
```

New packages installed:
- `resend` - Email delivery service
- `react-email` & `@react-email/components` - Email templates

### 2. Set Up Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Execute the migration file
-- Location: /Users/anthony/Documents/Projects/Collabuu-Webapp/supabase/migrations/20251027_admin_role_system.sql
```

This creates:
- `admin_users` table for admin accounts
- `admin_audit_log` table for tracking actions
- Security policies and RLS
- Helper functions

### 3. Create Your First Admin User

**Step A:** Create a user in Supabase Dashboard
- Go to Authentication → Users → Add User
- Email: `admin@collabuu.com` (or your choice)
- Password: Choose a secure password
- Email Confirm: ✅ (auto-confirm)

**Step B:** Promote user to admin (run in SQL Editor):

```sql
-- Update user metadata to include admin role
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@collabuu.com';

-- Add admin record
INSERT INTO public.admin_users (id, admin_level, created_by, notes, is_active)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@collabuu.com'),
  'super_admin',
  (SELECT id FROM auth.users WHERE email = 'admin@collabuu.com'),
  'Initial super admin account',
  true
);
```

### 4. Configure Email Service

Add to `.env.local`:

```bash
# Resend Email Service
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@collabuu.com
SUPPORT_EMAIL=support@collabuu.com
```

**For Development:**
- Sign up at https://resend.com (free: 3,000 emails/month)
- Get API key from dashboard
- Use `onboarding@resend.dev` as EMAIL_FROM for testing

**For Production:**
- Verify your domain in Resend
- Use your domain email (e.g., `noreply@collabuu.com`)

### 5. Start the Application

```bash
npm run dev
```

### 6. Access Admin Portal

Navigate to: **http://localhost:3000/admin/login**

Login with your admin credentials created in Step 3.

---

## System Architecture

### Components Created

#### Backend API (7 routes)
```
/app/api/admin/
├── auth/
│   ├── verify/route.ts          - Role verification
│   ├── failed-login/route.ts    - Failed login tracking
│   ├── update-login/route.ts    - Login timestamp updates
│   ├── log-login/route.ts       - Login audit logging
│   └── logout/route.ts          - Secure logout
└── withdrawals/
    ├── route.ts                 - List withdrawals (GET)
    ├── stats/route.ts           - Dashboard statistics (GET)
    └── [id]/
        ├── route.ts             - Get withdrawal details (GET)
        ├── approve/route.ts     - Approve withdrawal (PATCH)
        ├── complete/route.ts    - Complete withdrawal (PATCH)
        └── reject/route.ts      - Reject withdrawal (PATCH)
```

#### Frontend Pages & Components (11 files)
```
/app/(auth)/admin/login/page.tsx              - Admin login page
/app/(app)/admin/withdrawals/page.tsx         - Main dashboard

/components/admin/
├── withdrawal-filters.tsx                    - Filter controls
├── withdrawal-requests-table.tsx             - Data table
├── withdrawal-detail-card.tsx                - Detail view modal
└── withdrawal-action-modal.tsx               - Action dialogs
```

#### Library & Utilities (8 files)
```
/lib/
├── types/withdrawal.ts                       - TypeScript definitions
├── api/withdrawals.ts                        - API client
├── validation/withdrawal-schema.ts           - Zod schemas
├── hooks/
│   ├── use-withdrawals.ts                    - Data fetching hooks
│   ├── use-admin-login.ts                    - Login hook
│   └── use-admin-logout.ts                   - Logout hook
├── auth/
│   ├── admin.ts                              - Admin auth helpers
│   └── admin-middleware.ts                   - API protection
└── email/
    ├── service.ts                            - Email sender
    └── templates/
        ├── layout.tsx                        - Email base layout
        ├── withdrawal-approved.tsx           - Approval email
        ├── withdrawal-completed.tsx          - Completion email
        └── withdrawal-rejected.tsx           - Rejection email
```

#### Database (2 tables + migration)
```
/supabase/
├── migrations/20251027_admin_role_system.sql
└── scripts/
    ├── create_first_admin.sql
    └── add_additional_admin.sql

Tables:
- admin_users (id, admin_level, is_active, last_login, etc.)
- admin_audit_log (action, ip_address, user_agent, etc.)
```

---

## Features

### 1. Dashboard & Statistics
- **Total Pending:** Count and amount of pending withdrawals
- **Approved:** Withdrawals awaiting completion
- **Completed:** Successfully processed withdrawals
- **Processing:** Currently being processed
- Real-time updates with React Query

### 2. Withdrawal Table
- **Columns:** Influencer, Amount (CAD), Credits, E-Transfer Email, Status, Requested Date
- **Status Badges:**
  - 🟡 Pending (yellow)
  - 🔵 Approved (blue)
  - 🟢 Completed (green)
  - 🔴 Rejected (red)
  - ⚪ Cancelled (gray)
- **Actions:** View Details, Approve, Complete, Reject

### 3. Filtering & Sorting
- **Filter by Status:** All, Pending, Approved, Completed, Rejected
- **Date Range:** Start/End date pickers
- **Sort Options:**
  - Newest First
  - Oldest First
  - Amount: High to Low
  - Amount: Low to High
- **Active Filters:** Visual badges with remove buttons

### 4. Actions

#### Approve Withdrawal
- Changes status: `pending` → `approved`
- Optional admin notes
- Sends "Withdrawal Approved" email
- Logs action in audit trail

#### Complete Withdrawal
- Changes status: `approved/processing` → `completed`
- **Required:** Transaction ID
- Optional admin notes
- Sends "Payment Sent" email with:
  - Transaction ID
  - E-transfer details
  - Payment amount
  - Instructions for acceptance
- Logs action in audit trail

#### Reject Withdrawal
- Changes status: `pending` → `rejected`
- **Required:** Rejection reason
- Optional admin notes
- **Refunds credits** to influencer balance
- Sends "Withdrawal Declined" email with:
  - Rejection reason
  - Credits restored notification
  - Next steps
- Logs action in audit trail

### 5. Email Notifications

Professional branded emails sent automatically:

**Approval Email:**
```
Subject: Withdrawal Request Approved

Hi [Name],

Your withdrawal request has been approved!

Amount: $X.XX CAD
Credits: X credits
E-Transfer Email: [email]

Your payment will be processed within 24-48 hours.
```

**Completion Email:**
```
Subject: Payment Sent - Withdrawal Complete

Hi [Name],

Your payment has been sent via e-Transfer!

Amount: $X.XX CAD
Transaction ID: [id]
E-Transfer Email: [email]

Check your email to accept the transfer.
```

**Rejection Email:**
```
Subject: Withdrawal Request Update

Hi [Name],

Your withdrawal request has been declined.

Reason: [reason]

Your X credits have been restored to your account.
Contact support if you have questions.
```

### 6. Security Features

- **Role-Based Access Control (RBAC):**
  - Viewer: Read-only access
  - Moderator: Can approve/reject/complete
  - Super Admin: Full access + admin management

- **Account Protection:**
  - 5 failed login attempts = 30-minute lockout
  - Failed login tracking
  - Active/inactive account status

- **Audit Logging:**
  - All admin actions logged
  - IP address and User-Agent tracking
  - Immutable audit trail
  - Success/failure recording

- **Session Management:**
  - 24-hour session expiry
  - Secure cookies (SameSite=Strict; Secure)
  - Separate from regular user sessions

- **Rate Limiting:**
  - Configurable per endpoint
  - Prevents API abuse

### 7. Export to CSV
- Download filtered withdrawal data
- Includes all visible columns
- Formatted dates and currency
- Perfect for accounting/reporting

---

## Admin Workflow

### Standard Workflow

1. **Influencer submits withdrawal request** (iOS app)
   - Status: `pending`
   - Credits marked as "pending" (not deducted yet)

2. **Admin reviews request** (webapp)
   - Login at `/admin/login`
   - View dashboard at `/admin/withdrawals`
   - Filter to see pending requests

3. **Admin approves request**
   - Click "Approve" on request
   - Add optional notes
   - Status: `pending` → `approved`
   - Email sent to influencer

4. **Admin sends e-transfer manually**
   - Use bank/financial service
   - Send to influencer's e-transfer email
   - Copy transaction ID

5. **Admin marks as completed**
   - Click "Complete" on request
   - Enter transaction ID
   - Add optional notes
   - Status: `approved` → `completed`
   - **Credits deducted from influencer balance**
   - Email sent with transaction details

### Rejection Workflow

1. **Admin reviews request**
2. **Admin rejects request**
   - Click "Reject" on request
   - Enter rejection reason (required)
   - Add optional notes
   - Status: `pending` → `rejected`
   - **Credits refunded to influencer balance**
   - Email sent with reason

---

## Testing

### Test the Complete Flow

#### 1. Test Admin Login
```bash
# Navigate to admin login
open http://localhost:3000/admin/login

# Login with admin credentials
# Should redirect to /admin/withdrawals
```

#### 2. Test API Endpoints (cURL)

**Get all withdrawals:**
```bash
curl -X GET http://localhost:3000/api/admin/withdrawals \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Approve withdrawal:**
```bash
curl -X PATCH http://localhost:3000/api/admin/withdrawals/WITHDRAWAL_ID/approve \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"adminNotes": "Approved for processing"}'
```

**Complete withdrawal:**
```bash
curl -X PATCH http://localhost:3000/api/admin/withdrawals/WITHDRAWAL_ID/complete \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TXN123456789",
    "adminNotes": "E-transfer sent successfully"
  }'
```

**Reject withdrawal:**
```bash
curl -X PATCH http://localhost:3000/api/admin/withdrawals/WITHDRAWAL_ID/reject \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rejectionReason": "Invalid e-transfer email",
    "adminNotes": "Requested to resubmit"
  }'
```

#### 3. Test Email Notifications

**Method 1: UI Testing**
- Perform actions in admin UI
- Check Resend Dashboard → Emails → Recent Sends
- View email content and delivery status

**Method 2: API Testing**
```bash
# Test email service directly
npx tsx -e "
import { sendWithdrawalCompletedEmail } from './lib/email/service';
await sendWithdrawalCompletedEmail({
  influencerEmail: 'test@example.com',
  influencerName: 'John Doe',
  amount: 50.00,
  credits: 5000,
  transactionId: 'TEST123',
  etransferEmail: 'john@example.com',
  processedAt: new Date()
});
console.log('Email sent!');
"
```

#### 4. Test Audit Logging

```sql
-- View recent admin actions
SELECT * FROM admin_audit_log
ORDER BY created_at DESC
LIMIT 10;

-- View failed login attempts
SELECT * FROM admin_users
WHERE failed_login_attempts > 0;
```

### Testing Checklist

- [ ] Database migration runs successfully
- [ ] First admin user created and can login
- [ ] Non-admin users redirected to login page
- [ ] Failed login increments counter
- [ ] Account locks after 5 failed attempts
- [ ] Dashboard statistics display correctly
- [ ] Withdrawal table shows all requests
- [ ] Filtering and sorting works
- [ ] Approve action changes status and sends email
- [ ] Complete action requires transaction ID and sends email
- [ ] Reject action refunds credits and sends email
- [ ] Audit log records all actions
- [ ] Export to CSV downloads correctly
- [ ] Logout clears session

---

## Environment Variables

Add to `.env.local`:

```bash
# Admin Authentication (automatically handled by Supabase)
# No additional variables needed for auth

# Email Service (Resend)
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@collabuu.com        # Development: onboarding@resend.dev
SUPPORT_EMAIL=support@collabuu.com

# Supabase (should already exist)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Run migration in production Supabase
- [ ] Create production admin users
- [ ] Set environment variables in Vercel/deployment platform
- [ ] Verify domain in Resend for production emails
- [ ] Update EMAIL_FROM to your domain
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set up monitoring for audit logs
- [ ] Enable database backups
- [ ] Test complete workflow in production
- [ ] Document admin credentials securely

### Vercel Deployment

```bash
# Set environment variables
vercel env add RESEND_API_KEY
vercel env add EMAIL_FROM
vercel env add SUPPORT_EMAIL

# Deploy
vercel --prod
```

### Post-Deployment

1. **Test admin login** at `https://yourdomain.com/admin/login`
2. **Verify emails** are being sent (check Resend dashboard)
3. **Monitor audit logs** for suspicious activity
4. **Set up alerts** for failed login attempts
5. **Document admin access** for team members

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor audit log for suspicious activity
- Check failed login attempts

**Weekly:**
- Review completed withdrawals
- Export data for accounting

**Monthly:**
- Audit admin user access
- Review security logs
- Update admin passwords

### Adding New Admins

Use the helper script:

```sql
-- File: /supabase/scripts/add_additional_admin.sql

-- 1. Create user in Supabase Dashboard
-- 2. Run this script with their email and desired level
```

### Removing Admin Access

```sql
-- Deactivate admin
UPDATE admin_users
SET is_active = false
WHERE id = 'user_id_here';

-- Remove admin metadata
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'role'
WHERE id = 'user_id_here';
```

---

## Troubleshooting

### Cannot Login to Admin Portal

**Issue:** Redirected to login page after entering credentials

**Solutions:**
1. Verify user has admin role:
   ```sql
   SELECT raw_user_meta_data FROM auth.users WHERE email = 'admin@collabuu.com';
   ```
   Should show: `{"role": "admin"}`

2. Check admin_users record exists:
   ```sql
   SELECT * FROM admin_users WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@collabuu.com');
   ```

3. Verify account is active:
   ```sql
   UPDATE admin_users SET is_active = true WHERE id = 'user_id';
   ```

4. Clear failed login attempts:
   ```sql
   UPDATE admin_users SET failed_login_attempts = 0, locked_until = NULL WHERE id = 'user_id';
   ```

### Emails Not Sending

**Issue:** No emails received after actions

**Solutions:**
1. Check RESEND_API_KEY is set in `.env.local`
2. Verify Resend dashboard for error logs
3. For development, use `onboarding@resend.dev` as EMAIL_FROM
4. For production, verify your domain in Resend
5. Check Next.js server logs for email errors

### API Endpoints Return 401/403

**Issue:** Unauthorized or Forbidden errors

**Solutions:**
1. Verify admin token cookie is set (check browser DevTools → Application → Cookies)
2. Check middleware is protecting routes correctly
3. Verify Supabase service role key is set
4. Check admin_level in admin_users table

### Statistics Not Loading

**Issue:** Dashboard shows 0 for all stats

**Solutions:**
1. Check if withdrawal_requests table has data
2. Verify API endpoint `/api/admin/withdrawals/stats` is accessible
3. Check browser console for errors
4. Verify Supabase RLS policies allow admin access

---

## Documentation Index

Comprehensive documentation has been created:

### Getting Started
- **This file** - Complete setup guide
- `ADMIN_AUTH_SETUP.md` - Authentication setup details
- `EMAIL_QUICK_START.md` - 5-minute email setup

### Technical Documentation
- `WITHDRAWAL_SYSTEM_REPORT.md` - Complete system overview (691 lines)
- `WITHDRAWAL_API.md` - API endpoint documentation
- `WITHDRAWAL_ARCHITECTURE.md` - System architecture
- `EMAIL_NOTIFICATION_SYSTEM.md` - Email system details

### Quick References
- `WITHDRAWAL_QUICK_REFERENCE.md` - Quick lookup tables
- `ADMIN_AUTH_IMPLEMENTATION_SUMMARY.md` - Auth implementation
- `EMAIL_IMPLEMENTATION_SUMMARY.md` - Email implementation
- `WITHDRAWAL_FILE_PATHS.md` - All file locations

### Admin Guides
- `README_ADMIN_WITHDRAWALS.md` - Admin portal user guide
- `ADMIN_SECURITY_CHECKLIST.md` - Security checklist
- `EMAIL_EXAMPLES.md` - Email template previews

### Indexes
- `WITHDRAWAL_INDEX.md` - Navigation index
- `EMAIL_SYSTEM_INDEX.md` - Email docs index

---

## Support

### File Locations

All code is located at:
```
/Users/anthony/Documents/Projects/Collabuu-Webapp/
```

### Key Directories
```
app/(app)/admin/                 - Admin UI pages
app/(auth)/admin/                - Admin login page
app/api/admin/                   - Admin API routes
components/admin/                - Admin UI components
lib/auth/                        - Authentication helpers
lib/email/                       - Email service & templates
lib/types/withdrawal.ts          - TypeScript definitions
supabase/migrations/             - Database migrations
```

### Getting Help

**Database Issues:**
- Check Supabase Dashboard → Database → Tables
- View migration status in SQL Editor
- Review RLS policies

**API Issues:**
- Check Next.js server logs
- Use browser DevTools → Network tab
- Test with cURL commands

**Email Issues:**
- Check Resend Dashboard → Logs
- Verify environment variables
- Test email templates locally

**Security Issues:**
- Review audit log: `SELECT * FROM admin_audit_log`
- Check failed logins: `SELECT * FROM admin_users WHERE failed_login_attempts > 0`
- Verify middleware protection

---

## Summary

You now have a complete, production-ready admin portal for managing withdrawal requests with:

✅ Secure authentication with Supabase
✅ Role-based access control
✅ Comprehensive withdrawal management UI
✅ Automated email notifications
✅ Full audit logging
✅ Export capabilities
✅ Account protection (lockout, rate limiting)
✅ Professional documentation

**Next Steps:**
1. Run database migration
2. Create first admin user
3. Configure email service
4. Test workflow end-to-end
5. Deploy to production

**Access URL:** http://localhost:3000/admin/login

Happy managing! 🎉
