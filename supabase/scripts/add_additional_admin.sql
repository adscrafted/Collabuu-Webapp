-- ============================================================================
-- Add Additional Admin User Script
-- ============================================================================
-- This script adds additional admin users to the Collabuu admin portal.
--
-- INSTRUCTIONS:
-- 1. Create the user via Supabase Dashboard (Authentication -> Users)
-- 2. Replace the email and admin level below
-- 3. Run this script to grant admin privileges
-- ============================================================================

-- Configuration - UPDATE THESE VALUES
\set NEW_ADMIN_EMAIL 'new-admin@example.com'
\set ADMIN_LEVEL 'moderator'  -- Options: 'viewer', 'moderator', 'super_admin'
\set CREATING_ADMIN_EMAIL 'admin@collabuu.com' -- The admin creating this user

-- ============================================================================
-- Step 1: Verify new user exists
-- ============================================================================
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = :'NEW_ADMIN_EMAIL';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User % does not exist. Create the user in Supabase Dashboard first.', :'NEW_ADMIN_EMAIL';
  END IF;
END $$;

-- ============================================================================
-- Step 2: Add admin role to user metadata
-- ============================================================================
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = :'NEW_ADMIN_EMAIL';

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
  new_user.id,
  :'ADMIN_LEVEL',
  creating_user.id,
  'Admin account created by ' || :'CREATING_ADMIN_EMAIL' || ' on ' || NOW()::date,
  true,
  '[]'::jsonb
FROM
  (SELECT id FROM auth.users WHERE email = :'NEW_ADMIN_EMAIL') as new_user,
  (SELECT id FROM auth.users WHERE email = :'CREATING_ADMIN_EMAIL') as creating_user
ON CONFLICT (id) DO UPDATE
SET
  admin_level = EXCLUDED.admin_level,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ============================================================================
-- Step 4: Verify new admin
-- ============================================================================
SELECT
  u.email,
  u.raw_user_meta_data->>'role' as role,
  au.admin_level,
  au.is_active,
  creator.email as created_by_email,
  au.created_at
FROM auth.users u
JOIN public.admin_users au ON au.id = u.id
LEFT JOIN auth.users creator ON creator.id = au.created_by
WHERE u.email = :'NEW_ADMIN_EMAIL';

-- ============================================================================
-- Log this action in audit trail
-- ============================================================================
SELECT public.log_admin_action(
  (SELECT id FROM auth.users WHERE email = :'CREATING_ADMIN_EMAIL'),
  :'CREATING_ADMIN_EMAIL',
  'admin.create',
  'admin',
  (SELECT id FROM auth.users WHERE email = :'NEW_ADMIN_EMAIL'),
  jsonb_build_object(
    'new_admin_email', :'NEW_ADMIN_EMAIL',
    'admin_level', :'ADMIN_LEVEL'
  )
);

-- ============================================================================
-- Success Message
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✓ Admin user created successfully!';
  RAISE NOTICE 'Email: %', :'NEW_ADMIN_EMAIL';
  RAISE NOTICE 'Admin Level: %', :'ADMIN_LEVEL';
  RAISE NOTICE '';
  RAISE NOTICE 'The new admin can now login at /admin/login';
END $$;
