-- ============================================================================
-- Admin Role System Migration
-- Created: 2025-10-27
-- Purpose: Implement secure role-based access control for admin users
-- Security: OWASP A01:2021 - Broken Access Control mitigation
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Add role column to auth.users metadata
-- ----------------------------------------------------------------------------
-- Using user_metadata for role storage provides:
-- - Native Supabase JWT claim integration
-- - Automatic token refresh with role changes
-- - No additional table joins for role checks
-- ----------------------------------------------------------------------------

-- Note: Supabase stores custom user data in user_metadata JSONB column
-- We'll use this to store role information and admin-specific data

-- Add role to existing users (default to 'business')
-- This is informational - actual implementation uses user_metadata

-- ----------------------------------------------------------------------------
-- 2. Create admin users table for additional admin-specific data
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Admin metadata
  admin_level VARCHAR(50) NOT NULL DEFAULT 'viewer' CHECK (admin_level IN ('viewer', 'moderator', 'super_admin')),
  permissions JSONB DEFAULT '[]'::jsonb,

  -- Security tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_login_ip INET,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,

  -- Metadata
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_admin_level ON public.admin_users(admin_level);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON public.admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_users_locked_until ON public.admin_users(locked_until) WHERE locked_until IS NOT NULL;

-- Enable RLS (Row Level Security)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access admin_users table
CREATE POLICY "Service role only access" ON public.admin_users
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE public.admin_users IS 'Stores admin-specific metadata and security tracking. Access via service role only.';
COMMENT ON COLUMN public.admin_users.admin_level IS 'Admin permission level: viewer (read-only), moderator (approve/reject), super_admin (full access)';
COMMENT ON COLUMN public.admin_users.permissions IS 'Additional granular permissions as JSON array';
COMMENT ON COLUMN public.admin_users.failed_login_attempts IS 'Counter for rate limiting and account locking';
COMMENT ON COLUMN public.admin_users.locked_until IS 'Account lock expiry timestamp for brute force protection';

-- ----------------------------------------------------------------------------
-- 3. Create admin audit log table
-- ----------------------------------------------------------------------------
-- OWASP A09:2021 - Security Logging and Monitoring
-- Track all admin actions for security auditing
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who performed the action
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  admin_email VARCHAR(255) NOT NULL,

  -- What action was performed
  action VARCHAR(100) NOT NULL, -- e.g., 'withdrawal.approve', 'withdrawal.reject', 'admin.create'
  resource_type VARCHAR(50) NOT NULL, -- e.g., 'withdrawal', 'user', 'admin'
  resource_id UUID,

  -- Action details
  details JSONB DEFAULT '{}'::jsonb,
  old_values JSONB,
  new_values JSONB,

  -- Request metadata for security
  ip_address INET,
  user_agent TEXT,
  request_id VARCHAR(100),

  -- Result
  success BOOLEAN DEFAULT true,
  error_message TEXT,

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON public.admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_resource ON public.admin_audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_ip ON public.admin_audit_log(ip_address);

-- Enable RLS
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Only service role can insert audit logs
CREATE POLICY "Service role can insert audit logs" ON public.admin_audit_log
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Add comments
COMMENT ON TABLE public.admin_audit_log IS 'Security audit log for all admin actions. Immutable after creation.';
COMMENT ON COLUMN public.admin_audit_log.action IS 'Action identifier in format: resource.action (e.g., withdrawal.approve)';
COMMENT ON COLUMN public.admin_audit_log.ip_address IS 'IP address of the request for security tracking';

-- ----------------------------------------------------------------------------
-- 4. Create function to log admin actions
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_admin_id UUID,
  p_admin_email VARCHAR,
  p_action VARCHAR,
  p_resource_type VARCHAR,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Run with elevated privileges
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_id,
    admin_email,
    action,
    resource_type,
    resource_id,
    details,
    old_values,
    new_values,
    ip_address,
    user_agent,
    success,
    error_message
  ) VALUES (
    p_admin_id,
    p_admin_email,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_old_values,
    p_new_values,
    p_ip_address,
    p_user_agent,
    p_success,
    p_error_message
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- Add comment
COMMENT ON FUNCTION public.log_admin_action IS 'Logs admin actions to audit log table. Called from API routes.';

-- ----------------------------------------------------------------------------
-- 5. Create function to update admin last login
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_admin_last_login(
  p_admin_id UUID,
  p_ip_address INET DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.admin_users
  SET
    last_login_at = NOW(),
    last_login_ip = COALESCE(p_ip_address, last_login_ip),
    failed_login_attempts = 0, -- Reset on successful login
    updated_at = NOW()
  WHERE id = p_admin_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- 6. Create function to handle failed login attempts
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_admin_failed_login(
  p_email VARCHAR
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempts INTEGER;
  v_admin_id UUID;
BEGIN
  -- Find admin by email
  SELECT au.id INTO v_admin_id
  FROM auth.users u
  JOIN public.admin_users au ON au.id = u.id
  WHERE u.email = p_email;

  IF v_admin_id IS NULL THEN
    RETURN 0;
  END IF;

  -- Increment failed attempts
  UPDATE public.admin_users
  SET
    failed_login_attempts = failed_login_attempts + 1,
    -- Lock account for 30 minutes after 5 failed attempts
    locked_until = CASE
      WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL '30 minutes'
      ELSE locked_until
    END,
    updated_at = NOW()
  WHERE id = v_admin_id
  RETURNING failed_login_attempts INTO v_attempts;

  RETURN v_attempts;
END;
$$;

-- Add comment
COMMENT ON FUNCTION public.increment_admin_failed_login IS 'Tracks failed login attempts and locks account after 5 failures';

-- ----------------------------------------------------------------------------
-- 7. Create function to check if admin is locked
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin_locked(
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_locked_until TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT locked_until INTO v_locked_until
  FROM public.admin_users
  WHERE id = p_user_id;

  IF v_locked_until IS NULL THEN
    RETURN false;
  END IF;

  IF v_locked_until > NOW() THEN
    RETURN true;
  ELSE
    -- Clear lock if expired
    UPDATE public.admin_users
    SET locked_until = NULL, updated_at = NOW()
    WHERE id = p_user_id;
    RETURN false;
  END IF;
END;
$$;

-- ----------------------------------------------------------------------------
-- 8. Create initial super admin (MANUAL STEP REQUIRED)
-- ----------------------------------------------------------------------------
-- IMPORTANT: After running this migration, you need to:
-- 1. Create a user via Supabase Auth Dashboard or signInWithPassword
-- 2. Get the user ID from auth.users table
-- 3. Run the following SQL to make them an admin:
--
-- Example:
-- UPDATE auth.users
-- SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
-- WHERE email = 'admin@collabuu.com';
--
-- INSERT INTO public.admin_users (id, admin_level, created_by, notes)
-- VALUES (
--   (SELECT id FROM auth.users WHERE email = 'admin@collabuu.com'),
--   'super_admin',
--   (SELECT id FROM auth.users WHERE email = 'admin@collabuu.com'),
--   'Initial super admin account'
-- );

-- ----------------------------------------------------------------------------
-- 9. Grant necessary permissions
-- ----------------------------------------------------------------------------
-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION public.log_admin_action TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_admin_last_login TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_admin_failed_login TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_locked TO authenticated;

-- Grant access to service role
GRANT ALL ON public.admin_users TO service_role;
GRANT ALL ON public.admin_audit_log TO service_role;

-- ----------------------------------------------------------------------------
-- Migration Complete
-- ----------------------------------------------------------------------------
-- Next Steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Create your first admin user via Supabase Auth
-- 3. Update user metadata to add admin role
-- 4. Insert record into admin_users table
-- 5. Test admin login and verify role-based access
-- ============================================================================
