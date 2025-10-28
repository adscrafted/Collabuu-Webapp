-- ============================================================================
-- Create First Admin User Script
-- ============================================================================
-- This script creates your first admin user for the Collabuu admin portal.
--
-- INSTRUCTIONS:
-- 1. Replace 'admin@collabuu.com' with your desired admin email
-- 2. The user will be created via Supabase Auth UI (recommended)
-- 3. Run this script AFTER creating the user in Supabase Dashboard
-- 4. This adds the admin role and creates the admin_users entry
-- ============================================================================

-- IMPORTANT: Replace this email with your admin user's email
-- The user must already exist in auth.users (create via Supabase Dashboard)
\set ADMIN_EMAIL 'admin@collabuu.com'

-- ============================================================================
-- Step 1: Verify user exists
-- ============================================================================
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = :'ADMIN_EMAIL';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % does not exist. Please create the user in Supabase Dashboard first.', :'ADMIN_EMAIL';
  ELSE
    RAISE NOTICE 'User found with ID: %', v_user_id;
  END IF;
END $$;

-- ============================================================================
-- Step 2: Add admin role to user metadata
-- ============================================================================
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = :'ADMIN_EMAIL';

-- Verify
SELECT
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = :'ADMIN_EMAIL';

-- ============================================================================
-- Step 3: Create admin_users entry
-- ============================================================================
INSERT INTO public.admin_users (
  id,
  admin_level,
  created_by,
  notes,
  is_active,
  permissions
)
SELECT
  id,
  'super_admin', -- Options: 'viewer', 'moderator', 'super_admin'
  id, -- Self-created
  'Initial super admin account created on ' || NOW()::date,
  true,
  '[]'::jsonb -- No additional granular permissions needed for super_admin
FROM auth.users
WHERE email = :'ADMIN_EMAIL'
ON CONFLICT (id) DO UPDATE
SET
  admin_level = 'super_admin',
  is_active = true,
  updated_at = NOW();

-- ============================================================================
-- Step 4: Verify admin user setup
-- ============================================================================
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  u.raw_user_meta_data->>'role' as role,
  au.admin_level,
  au.is_active,
  au.failed_login_attempts,
  au.locked_until,
  au.created_at
FROM auth.users u
LEFT JOIN public.admin_users au ON au.id = u.id
WHERE u.email = :'ADMIN_EMAIL';

-- ============================================================================
-- Expected Output:
-- ============================================================================
-- id                                   | user-uuid-here
-- email                                | admin@collabuu.com
-- email_confirmed_at                   | 2025-10-27 ...
-- role                                 | admin
-- admin_level                          | super_admin
-- is_active                            | true
-- failed_login_attempts                | 0
-- locked_until                         | NULL
-- created_at                           | 2025-10-27 ...
-- ============================================================================

-- ============================================================================
-- Success!
-- ============================================================================
-- Your admin user is now ready to use.
--
-- Next Steps:
-- 1. Go to http://localhost:3000/admin/login
-- 2. Login with the email and password you set in Supabase Dashboard
-- 3. You should be redirected to /admin/withdrawals
-- 4. Check the audit log to confirm your login was recorded:
--    SELECT * FROM public.admin_audit_log ORDER BY created_at DESC LIMIT 5;
-- ============================================================================
