-- ============================================================================
-- Content Submissions Table Setup for Supabase
-- ============================================================================
-- This SQL script creates the content_submissions table with proper indexes,
-- constraints, and Row Level Security (RLS) policies.
-- ============================================================================

-- Create the content_submissions table
CREATE TABLE IF NOT EXISTS content_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  influencer_name VARCHAR(255) NOT NULL,
  influencer_avatar TEXT,
  influencer_username VARCHAR(255),
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('video', 'image', 'post')),
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('instagram', 'youtube', 'tiktok', 'other')),
  content_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'approved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Optional metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Index for fetching submissions by campaign
CREATE INDEX IF NOT EXISTS idx_content_submissions_campaign_id
  ON content_submissions(campaign_id);

-- Index for fetching submissions by influencer
CREATE INDEX IF NOT EXISTS idx_content_submissions_influencer_id
  ON content_submissions(influencer_id);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_content_submissions_status
  ON content_submissions(status);

-- Index for sorting by creation date (descending)
CREATE INDEX IF NOT EXISTS idx_content_submissions_created_at
  ON content_submissions(created_at DESC);

-- Composite index for campaign + status queries
CREATE INDEX IF NOT EXISTS idx_content_submissions_campaign_status
  ON content_submissions(campaign_id, status);

-- ============================================================================
-- Trigger for Auto-updating updated_at Timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_submissions_updated_at
  BEFORE UPDATE ON content_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE content_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Businesses can view content submissions for their campaigns
CREATE POLICY "Businesses can view their campaign content"
  ON content_submissions
  FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE business_id = auth.uid()
    )
  );

-- Policy: Businesses can update content submissions for their campaigns
CREATE POLICY "Businesses can update their campaign content"
  ON content_submissions
  FOR UPDATE
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE business_id = auth.uid()
    )
  );

-- Policy: Influencers can insert content for campaigns they're participating in
CREATE POLICY "Influencers can submit content"
  ON content_submissions
  FOR INSERT
  WITH CHECK (
    influencer_id = auth.uid() AND
    campaign_id IN (
      SELECT campaign_id FROM campaign_participants
      WHERE influencer_id = auth.uid() AND status = 'active'
    )
  );

-- Policy: Influencers can view their own submissions
CREATE POLICY "Influencers can view their own submissions"
  ON content_submissions
  FOR SELECT
  USING (influencer_id = auth.uid());

-- Policy: Influencers can update their own submissions (before approval)
CREATE POLICY "Influencers can update their own submissions"
  ON content_submissions
  FOR UPDATE
  USING (
    influencer_id = auth.uid() AND
    status != 'approved'
  );

-- ============================================================================
-- Sample Data for Testing (Optional)
-- ============================================================================

-- Insert sample content submissions
-- NOTE: Replace UUIDs with actual IDs from your database

/*
INSERT INTO content_submissions (
  campaign_id,
  influencer_id,
  influencer_name,
  influencer_avatar,
  influencer_username,
  content_type,
  platform,
  content_url,
  thumbnail_url,
  caption,
  status
) VALUES
(
  'CAMPAIGN_UUID_HERE',
  'INFLUENCER_UUID_HERE',
  'Jane Doe',
  'https://i.pravatar.cc/150?u=jane',
  'janedoe',
  'video',
  'instagram',
  'https://www.instagram.com/reel/ABC123',
  'https://picsum.photos/seed/content1/640/360',
  'Just tried this amazing new product! @brandname #sponsored',
  'new'
),
(
  'CAMPAIGN_UUID_HERE',
  'INFLUENCER_UUID_HERE',
  'John Smith',
  'https://i.pravatar.cc/150?u=john',
  'johnsmith',
  'video',
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://picsum.photos/seed/content2/640/360',
  'Check out my review of this fantastic campaign!',
  'new'
),
(
  'CAMPAIGN_UUID_HERE',
  'INFLUENCER_UUID_HERE',
  'Sarah Johnson',
  'https://i.pravatar.cc/150?u=sarah',
  'sarahjohnson',
  'video',
  'tiktok',
  'https://www.tiktok.com/@username/video/1234567890',
  'https://picsum.photos/seed/content3/640/360',
  'OMG you have to try this! #viral #trending',
  'viewed'
),
(
  'CAMPAIGN_UUID_HERE',
  'INFLUENCER_UUID_HERE',
  'Mike Williams',
  'https://i.pravatar.cc/150?u=mike',
  'mikewilliams',
  'image',
  'instagram',
  'https://www.instagram.com/p/DEF456',
  'https://picsum.photos/seed/content4/640/360',
  'Beautiful product photography from today''s shoot!',
  'approved'
);
*/

-- ============================================================================
-- Useful Queries for Testing and Administration
-- ============================================================================

-- Count submissions by status for a campaign
-- SELECT
--   status,
--   COUNT(*) as count
-- FROM content_submissions
-- WHERE campaign_id = 'YOUR_CAMPAIGN_ID'
-- GROUP BY status;

-- Get recent submissions for a campaign
-- SELECT
--   cs.*,
--   i.name as influencer_full_name,
--   i.avatar as influencer_avatar_url
-- FROM content_submissions cs
-- JOIN influencers i ON i.id = cs.influencer_id
-- WHERE cs.campaign_id = 'YOUR_CAMPAIGN_ID'
-- ORDER BY cs.created_at DESC
-- LIMIT 20;

-- Get submissions by platform
-- SELECT
--   platform,
--   COUNT(*) as count,
--   COUNT(*) FILTER (WHERE status = 'new') as new_count,
--   COUNT(*) FILTER (WHERE status = 'viewed') as viewed_count,
--   COUNT(*) FILTER (WHERE status = 'approved') as approved_count
-- FROM content_submissions
-- WHERE campaign_id = 'YOUR_CAMPAIGN_ID'
-- GROUP BY platform;

-- Find unviewed submissions older than 7 days
-- SELECT
--   cs.id,
--   cs.influencer_name,
--   cs.platform,
--   cs.created_at,
--   AGE(NOW(), cs.created_at) as age
-- FROM content_submissions cs
-- WHERE cs.status = 'new'
--   AND cs.created_at < NOW() - INTERVAL '7 days'
-- ORDER BY cs.created_at;

-- ============================================================================
-- Cleanup (Use with caution!)
-- ============================================================================

-- To drop all policies (for re-creation):
-- DROP POLICY IF EXISTS "Businesses can view their campaign content" ON content_submissions;
-- DROP POLICY IF EXISTS "Businesses can update their campaign content" ON content_submissions;
-- DROP POLICY IF EXISTS "Influencers can submit content" ON content_submissions;
-- DROP POLICY IF EXISTS "Influencers can view their own submissions" ON content_submissions;
-- DROP POLICY IF EXISTS "Influencers can update their own submissions" ON content_submissions;

-- To drop the table (WARNING: This will delete all data):
-- DROP TABLE IF EXISTS content_submissions CASCADE;
