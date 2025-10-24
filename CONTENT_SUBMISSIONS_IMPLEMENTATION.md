# Content Submissions Feature - Implementation Guide

## Overview
This document provides a comprehensive guide to the Content Submissions feature that has been added to the Collabuu web app campaign detail page. This feature matches the iOS app functionality and allows businesses to view, manage, and track content submitted by influencers.

---

## Files Created

### 1. `/Users/anthony/Documents/Projects/Collabuu-Webapp/components/campaigns/content-submission-card.tsx`
A reusable card component that displays individual content submissions with:
- Thumbnail preview
- Influencer profile information
- Platform badges (Instagram, YouTube, TikTok)
- "New" badge for unviewed content
- Click-to-expand modal with embedded content player
- Support for various platforms (Instagram, YouTube, TikTok)
- Mark as viewed functionality

### 2. `/Users/anthony/Documents/Projects/Collabuu-Webapp/components/campaigns/detail/content-tab.tsx`
The main tab component that displays all content submissions with:
- Statistics cards (Total, New, Approved)
- Filter options (All, New, Viewed, Approved)
- Sort options (Recent, Oldest, Platform)
- Bulk actions (Mark All Viewed, Export)
- Empty state handling
- Grid layout for content cards

---

## Files Modified

### 1. `/Users/anthony/Documents/Projects/Collabuu-Webapp/lib/types/campaign.ts`
Added new type definition:

```typescript
export interface ContentSubmission {
  id: string;
  campaignId: string;
  influencerId: string;
  influencerName: string;
  influencerAvatar?: string;
  influencerUsername?: string;
  contentType: 'video' | 'image' | 'post';
  platform: 'instagram' | 'youtube' | 'tiktok' | 'other';
  contentUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  status: 'new' | 'viewed' | 'approved';
  createdAt: string;
  viewedAt?: string;
}
```

### 2. `/Users/anthony/Documents/Projects/Collabuu-Webapp/lib/hooks/use-campaign-detail.ts`
Added React Query hooks:

```typescript
// Query key
contentSubmissions: (id: string) => [...campaignKeys.all, 'content-submissions', id] as const

// Fetch content submissions
export function useContentSubmissions(id: string) {
  return useQuery({
    queryKey: campaignKeys.contentSubmissions(id),
    queryFn: async () => {
      const response = await apiClient.get<ContentSubmission[]>(
        `/api/business/campaigns/${id}/content-submissions`
      );
      return response.data;
    },
    enabled: !!id,
  });
}

// Mark content as viewed
export function useMarkContentViewed(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentId: string) => {
      const response = await apiClient.patch(
        `/api/business/campaigns/${campaignId}/content-submissions/${contentId}/view`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.contentSubmissions(campaignId) });
    },
  });
}
```

### 3. `/Users/anthony/Documents/Projects/Collabuu-Webapp/app/(app)/campaigns/[id]/page.tsx`
Updated to include:
- Import of ContentTab component
- Import of useContentSubmissions hook
- New "Content" tab in the tabs list
- Badge showing count of new content submissions
- TabsContent for the content tab

---

## API Endpoints Required

The following API endpoints need to be implemented on the backend:

### 1. GET `/api/business/campaigns/:campaignId/content-submissions`
Fetch all content submissions for a campaign.

**Request:**
```http
GET /api/business/campaigns/abc123/content-submissions
Authorization: Bearer {token}
X-Business-Id: {businessId}
```

**Response:**
```json
{
  "data": [
    {
      "id": "sub_123",
      "campaignId": "abc123",
      "influencerId": "inf_456",
      "influencerName": "Jane Doe",
      "influencerAvatar": "https://example.com/avatar.jpg",
      "influencerUsername": "janedoe",
      "contentType": "video",
      "platform": "instagram",
      "contentUrl": "https://www.instagram.com/p/ABC123",
      "thumbnailUrl": "https://example.com/thumbnail.jpg",
      "caption": "Check out this amazing campaign!",
      "status": "new",
      "createdAt": "2025-01-23T10:00:00Z",
      "viewedAt": null
    }
  ]
}
```

### 2. PATCH `/api/business/campaigns/:campaignId/content-submissions/:contentId/view`
Mark a content submission as viewed.

**Request:**
```http
PATCH /api/business/campaigns/abc123/content-submissions/sub_123/view
Authorization: Bearer {token}
X-Business-Id: {businessId}
```

**Response:**
```json
{
  "data": {
    "id": "sub_123",
    "status": "viewed",
    "viewedAt": "2025-01-23T11:30:00Z"
  }
}
```

---

## Database Schema (Supabase)

### Table: `content_submissions`

```sql
CREATE TABLE content_submissions (
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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_content_submissions_campaign_id ON content_submissions(campaign_id);
CREATE INDEX idx_content_submissions_influencer_id ON content_submissions(influencer_id);
CREATE INDEX idx_content_submissions_status ON content_submissions(status);
CREATE INDEX idx_content_submissions_created_at ON content_submissions(created_at DESC);

-- RLS Policies
ALTER TABLE content_submissions ENABLE ROW LEVEL SECURITY;

-- Business can view content submissions for their campaigns
CREATE POLICY "Businesses can view their campaign content"
  ON content_submissions
  FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE business_id = auth.uid()
    )
  );

-- Business can update content submissions for their campaigns
CREATE POLICY "Businesses can update their campaign content"
  ON content_submissions
  FOR UPDATE
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE business_id = auth.uid()
    )
  );

-- Influencers can insert content for campaigns they're participating in
CREATE POLICY "Influencers can submit content"
  ON content_submissions
  FOR INSERT
  WITH CHECK (
    influencer_id = auth.uid() AND
    campaign_id IN (
      SELECT campaign_id FROM campaign_participants WHERE influencer_id = auth.uid()
    )
  );
```

### Supabase Query Examples

#### Fetch content submissions with influencer details:
```javascript
const { data, error } = await supabase
  .from('content_submissions')
  .select(`
    *,
    influencer:influencers(id, name, avatar, username)
  `)
  .eq('campaign_id', campaignId)
  .order('created_at', { ascending: false });
```

#### Mark content as viewed:
```javascript
const { data, error } = await supabase
  .from('content_submissions')
  .update({
    status: 'viewed',
    viewed_at: new Date().toISOString(),
  })
  .eq('id', contentId)
  .eq('campaign_id', campaignId)
  .select()
  .single();
```

#### Count new submissions:
```javascript
const { count, error } = await supabase
  .from('content_submissions')
  .select('*', { count: 'exact', head: true })
  .eq('campaign_id', campaignId)
  .eq('status', 'new');
```

---

## Feature Capabilities

### 1. **Content Display**
- Grid layout with responsive design (1-4 columns)
- Thumbnail preview for all content types
- Platform-specific icons (Instagram, YouTube, TikTok)
- "New" badge for unviewed content
- Influencer profile (avatar, name, username)
- Caption preview (2-line clamp)
- Timestamp display

### 2. **Filtering & Sorting**
- **Filter by status:**
  - All submissions
  - New (unviewed)
  - Viewed
  - Approved
- **Sort options:**
  - Most Recent
  - Oldest First
  - By Platform

### 3. **Content Viewing**
- Click to open full-screen modal
- Embedded content player for:
  - Instagram posts/reels
  - YouTube videos
  - TikTok videos
- Full caption display
- Metadata (platform, content type, dates)
- "View Original" button to open in new tab

### 4. **Status Management**
- Auto-mark as "viewed" when opened
- Bulk "Mark All Viewed" action
- Status badge display

### 5. **Statistics**
- Total submissions count
- New content count (with red badge)
- Approved content count
- Empty state handling

### 6. **Export**
- Export button for content list (CSV format)

---

## Component Architecture

```
CampaignDetailPage
├── Tabs
│   ├── Overview Tab
│   ├── Influencers Tab
│   └── Content Tab ✨ NEW
│       ├── Stats Cards (Total, New, Approved)
│       ├── Filters & Actions Bar
│       │   ├── Status Filter
│       │   ├── Sort Dropdown
│       │   ├── Mark All Viewed Button
│       │   └── Export Button
│       └── Content Grid
│           └── ContentSubmissionCard (multiple)
│               ├── Thumbnail
│               ├── Badges (New, Platform)
│               ├── Influencer Info
│               ├── Caption Preview
│               └── Modal (on click)
│                   ├── Embedded Content Player
│                   ├── Full Caption
│                   ├── Metadata
│                   └── Action Buttons
```

---

## Testing Instructions

### 1. **Prerequisites**
- Ensure backend API endpoints are implemented
- Add sample content submissions to the database
- Have at least one campaign with content submissions

### 2. **Manual Testing Steps**

#### Test Case 1: View Content Tab
1. Navigate to a campaign detail page
2. Click on the "Content" tab
3. Verify that the tab displays correctly
4. Check that statistics cards show accurate counts

#### Test Case 2: New Content Badge
1. Ensure there are content submissions with status "new"
2. Verify that the Content tab shows a red badge with count
3. Click on the tab and verify badge count matches displayed content

#### Test Case 3: Content Display
1. Verify all content cards display correctly in grid layout
2. Check that thumbnails load properly
3. Verify platform icons appear correctly
4. Check "New" badge on unviewed content
5. Verify influencer information displays correctly

#### Test Case 4: Filtering
1. Click filter dropdown
2. Select "New" - verify only new content shows
3. Select "Viewed" - verify only viewed content shows
4. Select "Approved" - verify only approved content shows
5. Select "All" - verify all content shows

#### Test Case 5: Sorting
1. Select "Most Recent" - verify content ordered by newest first
2. Select "Oldest First" - verify content ordered by oldest first
3. Select "By Platform" - verify content grouped by platform

#### Test Case 6: View Content Modal
1. Click on a content card
2. Verify modal opens with full content
3. Check embedded content player works (for supported platforms)
4. Verify caption displays fully
5. Check metadata displays correctly
6. If content was "new", verify status changes to "viewed"

#### Test Case 7: Mark as Viewed
1. Have content with status "new"
2. Click on the content card
3. Close modal
4. Verify "New" badge is removed from card
5. Verify badge count on tab decreases

#### Test Case 8: Mark All Viewed
1. Have multiple content submissions with status "new"
2. Click "Mark All Viewed" button
3. Verify all content status changes to "viewed"
4. Verify badge count on tab becomes 0
5. Verify "New" badges removed from all cards

#### Test Case 9: Platform Embeds
1. **Instagram:**
   - Add Instagram post URL
   - Verify Instagram embed displays correctly
2. **YouTube:**
   - Add YouTube video URL
   - Verify YouTube player embeds and plays
3. **TikTok:**
   - Add TikTok video URL
   - Verify TikTok embed displays correctly

#### Test Case 10: Empty State
1. Create a campaign with no content submissions
2. Navigate to Content tab
3. Verify empty state displays:
   - Camera/video icon
   - "No content submissions yet" message
   - Helpful subtitle text

#### Test Case 11: Responsive Design
1. View on desktop (1920px) - verify 4 columns
2. View on laptop (1280px) - verify 3 columns
3. View on tablet (768px) - verify 2 columns
4. View on mobile (375px) - verify 1 column

#### Test Case 12: Performance
1. Add 50+ content submissions
2. Navigate to Content tab
3. Verify page loads within 2 seconds
4. Check smooth scrolling
5. Verify no UI lag when filtering/sorting

### 3. **API Testing**

#### Test GET endpoint:
```bash
curl -X GET \
  'http://localhost:3000/api/business/campaigns/{campaignId}/content-submissions' \
  -H 'Authorization: Bearer {token}' \
  -H 'X-Business-Id: {businessId}'
```

#### Test PATCH endpoint:
```bash
curl -X PATCH \
  'http://localhost:3000/api/business/campaigns/{campaignId}/content-submissions/{contentId}/view' \
  -H 'Authorization: Bearer {token}' \
  -H 'X-Business-Id: {businessId}'
```

### 4. **Database Testing**

#### Insert test data:
```sql
INSERT INTO content_submissions (
  campaign_id,
  influencer_id,
  influencer_name,
  influencer_username,
  content_type,
  platform,
  content_url,
  thumbnail_url,
  caption,
  status
) VALUES (
  '{campaign_id}',
  '{influencer_id}',
  'Test Influencer',
  'testinfluencer',
  'video',
  'instagram',
  'https://www.instagram.com/p/TEST123',
  'https://example.com/thumb.jpg',
  'Amazing campaign content!',
  'new'
);
```

#### Query content by campaign:
```sql
SELECT * FROM content_submissions
WHERE campaign_id = '{campaign_id}'
ORDER BY created_at DESC;
```

#### Count new submissions:
```sql
SELECT COUNT(*) FROM content_submissions
WHERE campaign_id = '{campaign_id}'
AND status = 'new';
```

---

## Known Limitations

1. **Platform Support:**
   - Instagram, YouTube, and TikTok embeds supported
   - Other platforms show thumbnail or placeholder
   - Some embed URLs may require specific format

2. **Content Types:**
   - Currently supports video, image, and post types
   - Stories and ephemeral content not supported

3. **Embed Restrictions:**
   - Instagram embeds may require public posts
   - Private or restricted content may not display
   - Some platforms may block iframe embedding

---

## Future Enhancements

1. **Content Approval Workflow:**
   - Add approval/rejection actions
   - Add comment/feedback on submissions
   - Notification system for influencers

2. **Analytics:**
   - Track engagement metrics per submission
   - View performance analytics
   - Compare influencer content performance

3. **Bulk Actions:**
   - Bulk approve/reject
   - Bulk download
   - Bulk share

4. **Content Search:**
   - Search by influencer name
   - Search by caption
   - Advanced filters (date range, platform)

5. **Rich Media:**
   - Support for multiple images (carousels)
   - Story highlights
   - Live content

---

## Support & Troubleshooting

### Common Issues

**Issue:** Content not loading
- **Solution:** Check API endpoint is correctly implemented
- **Solution:** Verify authentication headers are being sent
- **Solution:** Check browser console for errors

**Issue:** Embeds not displaying
- **Solution:** Verify content URL format is correct
- **Solution:** Check if content is public/accessible
- **Solution:** Try opening URL in new tab to verify it works

**Issue:** "New" badge not updating
- **Solution:** Check PATCH endpoint is working correctly
- **Solution:** Verify React Query cache is invalidating
- **Solution:** Check browser network tab for API calls

**Issue:** Empty state showing when content exists
- **Solution:** Check campaign ID is correct
- **Solution:** Verify data is being returned from API
- **Solution:** Check filter/sort settings

---

## Deployment Checklist

- [ ] Backend API endpoints implemented and tested
- [ ] Database tables created with proper indexes
- [ ] RLS policies configured
- [ ] Sample data added for testing
- [ ] Frontend components tested in development
- [ ] API integration tested end-to-end
- [ ] Responsive design verified on all devices
- [ ] Performance testing completed
- [ ] Error handling implemented
- [ ] Loading states working correctly
- [ ] Empty states displaying properly
- [ ] Documentation updated
- [ ] Team trained on new feature

---

## Contact

For questions or issues with this implementation, please contact the development team or refer to the project documentation.
