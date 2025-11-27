-- Migration: Add Performance Indexes
-- Created: 2025-11-27
-- Description: Add critical database indexes to improve query performance
--              Addresses N+1 query issues and slow list operations

-- ============================================================================
-- CAMPAIGNS TABLE INDEXES
-- ============================================================================

-- Index for fetching campaigns by business and status (most common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_business_id_status
  ON campaigns(business_id, status)
  WHERE deleted_at IS NULL;

-- Index for sorting campaigns by creation date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_business_id_created_at
  ON campaigns(business_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Index for campaign period queries (finding active campaigns)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_period_dates
  ON campaigns(period_start, period_end)
  WHERE deleted_at IS NULL AND status = 'active';

-- Composite index for common campaign list queries with included columns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_lookup
  ON campaigns(business_id, status, created_at DESC)
  INCLUDE (id, title, campaign_type, total_credits)
  WHERE deleted_at IS NULL;

-- ============================================================================
-- CAMPAIGN APPLICATIONS TABLE INDEXES
-- ============================================================================

-- Index for fetching applications by campaign and status (critical for N+1 fix)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaign_applications_campaign_id_status
  ON campaign_applications(campaign_id, status);

-- Index for counting accepted participants
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaign_applications_campaign_accepted
  ON campaign_applications(campaign_id, status, reviewed_at DESC)
  WHERE status = 'accepted';

-- Index for counting pending applications
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaign_applications_campaign_pending
  ON campaign_applications(campaign_id, status)
  WHERE status = 'pending';

-- Index for influencer lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaign_applications_influencer_id
  ON campaign_applications(influencer_id, status);

-- ============================================================================
-- QR CODE REDEMPTIONS TABLE INDEXES
-- ============================================================================

-- Critical index for visitor count queries (used in campaign stats)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_qr_redemptions_campaign_influencer
  ON qr_code_redemptions(campaign_id, influencer_id, customer_id)
  WHERE customer_id IS NOT NULL;

-- Index for unique customer counting
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_qr_redemptions_campaign_customer
  ON qr_code_redemptions(campaign_id, customer_id)
  WHERE customer_id IS NOT NULL;

-- Index for influencer performance lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_qr_redemptions_influencer
  ON qr_code_redemptions(influencer_id, campaign_id, scanned_at DESC);

-- ============================================================================
-- CONTENT SUBMISSIONS TABLE INDEXES
-- ============================================================================

-- Index for campaign content counts (N+1 fix)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_submissions_campaign_id
  ON content_submissions(campaign_id);

-- Index for influencer content submissions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_submissions_influencer
  ON content_submissions(campaign_id, influencer_id);

-- Index for filtering by submission status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_submissions_status
  ON content_submissions(campaign_id, status, submitted_at DESC);

-- ============================================================================
-- CREDIT TRANSACTIONS TABLE INDEXES
-- ============================================================================

-- Index for credit balance calculations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_transactions_business_balance
  ON credit_transactions(business_id, status)
  WHERE status = 'completed';

-- Index for transaction type filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_transactions_business_type
  ON credit_transactions(business_id, transaction_type, created_at DESC);

-- Index for finding related transactions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_transactions_related
  ON credit_transactions(related_table, related_id)
  WHERE related_id IS NOT NULL;

-- Index for transaction history queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_transactions_history
  ON credit_transactions(business_id, created_at DESC)
  INCLUDE (id, amount, transaction_type, status);

-- ============================================================================
-- USER PROFILES TABLE INDEXES
-- ============================================================================

-- Index for username lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_username
  ON user_profiles(username)
  WHERE username IS NOT NULL;

-- Index for email lookups (case-insensitive)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_email
  ON user_profiles(LOWER(email));

-- ============================================================================
-- INFLUENCER PROFILES TABLE INDEXES
-- ============================================================================

-- Index for social media handles (JSON field)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_influencer_profiles_user_id
  ON influencer_profiles(user_id);

-- ============================================================================
-- WITHDRAWAL REQUESTS TABLE INDEXES
-- ============================================================================

-- Index for business withdrawal requests
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_withdrawal_requests_business_status
  ON withdrawal_requests(business_id, status, requested_at DESC);

-- Index for admin review (pending withdrawals)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_withdrawal_requests_pending
  ON withdrawal_requests(status, requested_at ASC)
  WHERE status = 'pending';

-- ============================================================================
-- ANALYZE TABLES TO UPDATE STATISTICS
-- ============================================================================

-- Update table statistics for query planner
ANALYZE campaigns;
ANALYZE campaign_applications;
ANALYZE qr_code_redemptions;
ANALYZE content_submissions;
ANALYZE credit_transactions;
ANALYZE user_profiles;
ANALYZE influencer_profiles;
ANALYZE withdrawal_requests;
