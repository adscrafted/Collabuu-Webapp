# EXHAUSTIVE API COMPARISON: iOS vs Web

## Campaign Detail Screen - Complete API Operation Breakdown

---

## INITIAL DATA LOAD OPERATIONS

### 1. LOAD CAMPAIGN DETAILS

| OPERATION | iOS FILE:LINE | iOS METHOD/QUERY | WEB FILE:LINE | WEB HOOK/METHOD | MATCH? | NOTES |
|-----------|---------------|------------------|---------------|-----------------|--------|-------|
| **Get Campaign Details** | BusinessCampaignDetailViewModel.swift:75, 111 | `apiService.getBusinessCampaignDetails(campaignId)` → Backend API `/business/campaigns/{id}` | use-campaign-detail.ts:32-40 | `useCampaign(id)` → Backend API `/api/business/campaigns/{id}` | ✅ MATCH | Both use same backend endpoint |

**iOS Trigger:** `onAppear` via `loadCampaignDetails(campaign:)` at line 91
**iOS Parameters:** `campaignId: String`
**iOS Response:** `Campaign` object with all fields including `visitCount`, `influencerVisitorCount`, `directAppVisitorCount`
**iOS Success:** Updates `self.campaign` at line 119
**iOS Error:** Sets `errorMessage` at line 279
**iOS Caching:** 5-minute cache (lines 96-102)
**iOS Auto-refresh:** No automatic refresh, manual via `refreshCampaignDetails()`

**Web Trigger:** Component mount via `useQuery` hook
**Web Parameters:** `id: string`
**Web Response:** `Campaign` object from API
**Web Success:** React Query updates cache automatically
**Web Error:** React Query error handling
**Web Caching:** React Query default caching
**Web Auto-refresh:** No auto-refresh by default

---

### 2. LOAD CAMPAIGN METRICS

| OPERATION | iOS FILE:LINE | iOS METHOD/QUERY | WEB FILE:LINE | WEB HOOK/METHOD | MATCH? | NOTES |
|-----------|---------------|------------------|---------------|-----------------|--------|-------|
| **Get Campaign Metrics** | BusinessCampaignDetailViewModel.swift:80, 127 | `loadCampaignMetrics(campaignId)` → **Returns MOCK DATA** (line 288-318) | use-campaign-detail.ts:44-54 | `useCampaignMetrics(id)` → Backend API `/api/business/campaigns/{id}/metrics` | ❌ MISMATCH | iOS returns mock data, Web calls real API |

**iOS Trigger:** Part of parallel `withTaskGroup` load at line 125
**iOS Parameters:** `campaignId: String`
**iOS Response:** Mock `CampaignMetrics` with all values set to 0
**iOS Success:** Sets `self.campaignMetrics` and `self.visitorChartData` at lines 129-132
**iOS Error:** Logs warning at line 135
**iOS Caching:** Cached with main campaign (5 minutes)
**iOS Auto-refresh:** Via manual `refreshCampaignData()` at line 80

**Web Trigger:** Component mount via `useQuery` hook
**Web Parameters:** `id: string`
**Web Response:** Real `CampaignMetrics` from backend
**Web Success:** React Query cache update
**Web Error:** React Query error state
**Web Caching:** React Query caching
**Web Auto-refresh:** YES - **30 second refetch interval** (line 52)

**CRITICAL DIFFERENCE:** iOS uses mock data while Web fetches real metrics from API!

---

### 3. LOAD PARTICIPATING INFLUENCERS

| OPERATION | iOS FILE:LINE | iOS METHOD/QUERY | WEB FILE:LINE | WEB HOOK/METHOD | MATCH? | NOTES |
|-----------|---------------|------------------|---------------|-----------------|--------|-------|
| **Get Participants** | BusinessCampaignDetailViewModel.swift:142, 321 | **Supabase Direct Query** `campaign_applications` table with `user_profiles` join (lines 326-332) | use-campaign-detail.ts:71-100 | `useCampaignParticipants(id)` → Backend API `/api/business/campaigns/{id}/participants` | ❌ MAJOR MISMATCH | iOS queries Supabase directly, Web uses backend API |

**iOS Trigger:** Part of parallel `withTaskGroup` load at line 140
**iOS Parameters:** `campaignId: String`
**iOS Query:**
```swift
supabaseService.client
  .from("campaign_applications")
  .select("*, user_profiles(*)")
  .eq("campaign_id", value: campaignId)
  .eq("status", value: "accepted")
```
**iOS Response:** Array of `CampaignApplication` with nested `user_profiles`
**iOS Success:** Maps to `CampaignParticipant`, sets `self.participatingInfluencers` and `self.participants` at lines 144-145
**iOS Error:** Logs error and sets empty arrays at lines 147-152
**iOS Field Mapping:**
- `userId`: from `app.influencerId`
- `name`: from `"\(influencer.firstName) \(influencer.lastName)"`
- `email`: from `influencer.email`
- `username`: from `influencer.username`
- `profileImageUrl`: from `influencer.profileImageUrl`
- `joinedAt`: from `app.appliedAt`
- `totalVisits`: hardcoded to 0
- `totalCreditsEarned`: hardcoded to 0

**Web Trigger:** Component mount via `useQuery` hook
**Web Parameters:** `id: string`
**Web Endpoint:** `/api/business/campaigns/{id}/participants`
**Web Response:** Transformed participant array from backend
**Web Success:** React Query cache
**Web Field Mapping (lines 80-96):**
- `userId`: from `user_id || userId || influencer_id || influencerId`
- `influencerName`: from `influencer_name || influencerName || 'Unknown'`
- `influencerAvatar`: from `influencer_avatar || influencerAvatar`
- `followerCount`: from `follower_count || followerCount || 0`
- `joinedAt`: from `joined_at || joinedAt || created_at || createdAt`
- `visitsGenerated`: from `visits_generated || visitsGenerated || visit_count || visitCount || 0`
- `conversions`: from `conversions || 0`
- `creditsEarned`: from `credits_earned || creditsEarned || 0`
- `visitCount`: from `visit_count || visitCount || visits_generated || visitsGenerated || 0`
- `customerCount`: from `customer_count || customerCount || unique_customers || uniqueCustomers`

**CRITICAL DIFFERENCES:**
1. iOS queries Supabase directly, Web uses backend API
2. iOS gets basic user info only, Web gets visit/conversion metrics
3. iOS hardcodes `totalVisits` to 0, Web gets actual counts from API
4. Field names differ significantly between platforms

---

### 4. LOAD SUBMITTED CONTENT (Internal Method)

| OPERATION | iOS FILE:LINE | iOS METHOD/QUERY | WEB FILE:LINE | WEB HOOK/METHOD | MATCH? | NOTES |
|-----------|---------------|------------------|---------------|-----------------|--------|-------|
| **Get Content Submissions (Internal)** | BusinessCampaignDetailViewModel.swift:159, 371 | **Supabase Direct Query** `content_submissions` table (lines 373-378) | N/A | Not used (see Content Posts below) | ⚠️ PARTIAL | iOS has internal method, not directly comparable |

**iOS Trigger:** Part of parallel `withTaskGroup` load at line 157
**iOS Query:**
```swift
supabaseService.client
  .from("content_submissions")
  .select()
  .eq("campaign_id", value: campaignId)
```
**iOS Response:** Array of `BusinessContentSubmission`
**iOS Success:** Mapped to `InfluencerContent` and sets `self.submittedContent` at line 161
**iOS Error:** Logs error at line 163, sets empty array at line 166

---

### 5. LOAD CONTENT POSTS

| OPERATION | iOS FILE:LINE | iOS METHOD/QUERY | WEB FILE:LINE | WEB HOOK/METHOD | MATCH? | NOTES |
|-----------|---------------|------------------|---------------|-----------------|--------|-------|
| **Get Content Posts** | BusinessCampaignDetailViewModel.swift:172, 394 | **Supabase Direct Queries** (3 queries: content_submissions, influencer_profiles, user_profiles) | use-campaign-detail.ts:244-255 | `useContentSubmissions(id)` → Backend API `/api/business/campaigns/{id}/content-submissions` | ❌ MAJOR MISMATCH | iOS makes 3 Supabase queries, Web uses single backend API |

**iOS Trigger:** Part of parallel `withTaskGroup` load at line 171
**iOS Queries:**
1. **Query 1:** `content_submissions` (lines 445-450)
```swift
supabaseService.client
  .from("content_submissions")
  .select("*")
  .eq("campaign_id", value: campaignId)
```
2. **Query 2:** `influencer_profiles` (lines 458-463) - for display_name, username
```swift
supabaseService.client
  .from("influencer_profiles")
  .select("user_id, display_name, username")
  .in("user_id", values: influencerIds)
```
3. **Query 3:** `user_profiles` (lines 473-478) - for email, first_name, last_name
```swift
supabaseService.client
  .from("user_profiles")
  .select("id, email, first_name, last_name")
  .in("id", values: influencerIds)
```

**iOS Response:** Merged data from 3 tables into `BusinessContentPost` array
**iOS Success:** Sets `self.contentPosts` and calculates `self.newContentSubmissionsCount` (filters by status=="new") at lines 176-180
**iOS Error:** Logs error at line 183, sets empty array and count to 0 at lines 185-187
**iOS Field Mapping (lines 486-536):**
- `id`: from submission.id
- `influencerName`: Priority: display_name → "firstName lastName" → email prefix → username → "Unknown Influencer"
- `influencerUsername`: "@" + (username ?? email prefix ?? "influencer")
- `platform`: hardcoded "instagram"
- `postType`: from contentType
- `imageUrl`: from contentUrl
- `status`: from status
- `postedAt`: from submittedAt

**Web Trigger:** Component mount via `useQuery` hook
**Web Parameters:** `id: string`
**Web Endpoint:** `/api/business/campaigns/{id}/content-submissions`
**Web Response:** Array of `ContentSubmission` from backend (pre-joined)
**Web Success:** React Query cache
**Web Error:** React Query error state

**CRITICAL DIFFERENCES:**
1. iOS makes 3 separate Supabase queries and joins in-memory
2. Web makes single backend API call (backend handles joins)
3. iOS has complex name resolution logic (5 fallback levels)
4. Different field structures in response

---

### 6. LOAD CAMPAIGN APPLICATIONS

| OPERATION | iOS FILE:LINE | iOS METHOD/QUERY | WEB FILE:LINE | WEB HOOK/METHOD | MATCH? | NOTES |
|-----------|---------------|------------------|---------------|-----------------|--------|-------|
| **Get Applications** | BusinessCampaignDetailViewModel.swift:192, 540 | `apiService.getCampaignApplications(campaignId)` → Backend API `/business/campaigns/{id}/applications` | use-campaign-detail.ts:57-68 | `useCampaignApplications(id)` → Backend API `/api/business/campaigns/{id}/applications` | ✅ MATCH | Both use same backend endpoint |

**iOS Trigger:** Part of parallel `withTaskGroup` load at line 192 (highest priority comment at line 191)
**iOS Parameters:** `campaignId: String`
**iOS Endpoint:** `/business/campaigns/{campaignId}/applications` (APIService.swift:1628)
**iOS Response:** Array of `CampaignApplication` with nested influencer data
**iOS Success:** Sets `self.applications` at line 196, extensive debug logging at lines 546-575
**iOS Error:** Logs error at line 204, sets empty array at line 206
**iOS Debug Logging:** Prints each application's status, isPending, influencer details

**Web Trigger:** Component mount via `useQuery` hook
**Web Parameters:** `id: string`
**Web Endpoint:** `/api/business/campaigns/{id}/applications`
**Web Response:** Array of `InfluencerApplication`
**Web Success:** React Query cache
**Web Error:** React Query error state

**MATCH CONFIRMED:** Both platforms use identical backend endpoint

---

### 7. LOAD VISIT COUNTS (Attribution Data)

| OPERATION | iOS FILE:LINE | iOS METHOD/QUERY | WEB FILE:LINE | WEB HOOK/METHOD | MATCH? | NOTES |
|-----------|---------------|------------------|---------------|-----------------|--------|-------|
| **Get Visit Attribution** | BusinessCampaignDetailViewModel.swift:212-235 | Uses backend-calculated attribution from campaign object (influencerVisitorCount, directAppVisitorCount) | use-campaign-detail.ts:32-40 | Included in `useCampaign(id)` response | ✅ MATCH | Both use backend-calculated attribution |

**iOS Trigger:** Part of parallel `withTaskGroup` load at line 212
**iOS Data Source:** From `fullCampaign` object returned by `getBusinessCampaignDetails` at line 111
**iOS Fields Used:**
- `fullCampaign.influencerVisitorCount` (optional Int)
- `fullCampaign.directAppVisitorCount` (optional Int)
- `fullCampaign.visitCount` (optional Int)
**iOS Logic (lines 216-232):**
- If both attribution counts exist: Use them and sum for total
- If no attribution data: Use visitCount, default to 0 for influencer, all to direct
**iOS Success:** Sets `self.influencerVisitorCount`, `self.directAppVisitorCount`, `self.actualVisitorCount`
**iOS Debug Logging:** Extensive at lines 215, 223-224, 231, 233

**Web Trigger:** Automatic via `useCampaign` hook
**Web Data Source:** Campaign object from API
**Web Fields:** Same fields available in Campaign type

**MATCH CONFIRMED:** Both use backend-calculated attribution data from Campaign object

---

### 8. LOAD INFLUENCER CUSTOMER COUNTS

| OPERATION | iOS FILE:LINE | iOS METHOD/QUERY | WEB FILE:LINE | WEB HOOK/METHOD | MATCH? | NOTES |
|-----------|---------------|------------------|---------------|-----------------|--------|-------|
| **Get Per-Influencer Visitor Counts** | BusinessCampaignDetailViewModel.swift:238, 868 | **Supabase Direct Query** `visits` table (lines 877-883) | use-campaign-detail.ts:71-100 | Included in `useCampaignParticipants` response field `visitCount` | ⚠️ DIFFERENT APPROACH | iOS queries visits table directly, Web gets pre-calculated from participants API |

**iOS Trigger:** Part of parallel `withTaskGroup` load at line 238
**iOS Query:**
```swift
supabaseService.client
  .from("visits")
  .select("id, influencer_id, customer_id")
  .eq("campaign_id", value: campaignId)
  .not("influencer_id", operator: .is, value: "null")
```
**iOS Response:** Array of visit records
**iOS Processing:** Counts visits per influencer_id (lines 886-893)
**iOS Success:** Sets `self.influencerCustomerCounts` dictionary at line 242
**iOS Error:** Logs error at line 246, sets empty dict at line 248

**Web Trigger:** Via `useCampaignParticipants` hook
**Web Data Source:** `visitCount` field in participant object (line 94)
**Web Processing:** Pre-calculated by backend

**DIFFERENCE:** iOS manually queries and aggregates visit counts, Web receives pre-calculated counts

---

### 9. LOAD CAMPAIGN ACTIVITY

| OPERATION | iOS FILE:LINE | iOS METHOD/QUERY | WEB FILE:LINE | WEB HOOK/METHOD | MATCH? | NOTES |
|-----------|---------------|------------------|---------------|-----------------|--------|-------|
| **Get Activity Timeline** | BusinessCampaignDetailViewModel.swift:254, 256 | `apiService.getCampaignActivity(campaignId)` → Backend API `/business/campaigns/{id}/activity` | use-campaign-detail.ts:115-124 | `useCampaignActivity(id)` → Backend API `/api/business/campaigns/{id}/activity` | ✅ MATCH | Both use same backend endpoint |

**iOS Trigger:** Part of parallel `withTaskGroup` load at line 254
**iOS Parameters:** `campaignId: String`
**iOS Endpoint:** `/business/campaigns/{campaignId}/activity` (APIService.swift:982)
**iOS Response:** Array of `CampaignActivity`
**iOS Success:** Sorts by `createdAt` descending and sets `self.activities` at line 258
**iOS Error:** Logs error at line 262, sets empty array at line 264
**iOS Note:** APIService falls back to mock data if endpoint doesn't exist (APIService.swift:987-990)

**Web Trigger:** Component mount via `useQuery` hook
**Web Parameters:** `id: string`
**Web Endpoint:** `/api/business/campaigns/{id}/activity`
**Web Response:** Array of `CampaignActivity`
**Web Success:** React Query cache
**Web Error:** React Query error state

**MATCH CONFIRMED:** Both use same backend endpoint

---

## MUTATION OPERATIONS

### 10. UPDATE CAMPAIGN STATUS

| OPERATION | iOS FILE:LINE | iOS METHOD/QUERY | WEB FILE:LINE | WEB HOOK/METHOD | MATCH? | NOTES |
|-----------|---------------|------------------|---------------|-----------------|--------|-------|
| **Update Campaign Status** | BusinessCampaignDetailViewModel.swift:607, 613 | **Supabase Direct Update** `campaigns` table (lines 613-617) | use-campaign-detail.ts:143-156 | `useUpdateCampaignStatus(id)` → Backend API `/api/business/campaigns/{id}/status` | ❌ MAJOR MISMATCH | iOS updates Supabase directly, Web uses backend API |

**iOS Trigger:** Manual via `updateCampaignStatus(_:)` function
**iOS Parameters:** `status: String`
**iOS Query:**
```swift
supabaseService.client
  .from("campaigns")
  .update(["status": status])
  .eq("id", value: campaign.id)
```
**iOS Success:** Updates local `self.campaign?.status` at line 620
**iOS Error:** Sets `errorMessage` at line 624

**Web Trigger:** Via mutation hook, invalidates cache on success
**Web Parameters:** `status: CampaignStatus`
**Web Endpoint:** `/api/business/campaigns/{id}/status`
**Web Method:** PATCH
**Web Success:** Invalidates campaign detail and list queries (lines 151-153)
**Web Error:** React Query error handling

**CRITICAL DIFFERENCE:** iOS bypasses backend and updates database directly!

---

### 11. APPROVE CONTENT SUBMISSION

| OPERATION | iOS FILE:LINE | iOS METHOD/QUERY | WEB FILE:LINE | WEB HOOK/METHOD | MATCH? | NOTES |
|-----------|---------------|------------------|---------------|-----------------|--------|-------|
| **Approve Content** | BusinessCampaignDetailViewModel.swift:630, 634 | **Supabase Direct Update** `content_submissions` table (lines 634-638) | use-campaign-detail.ts:275-289 | `useApproveContent(campaignId)` → Backend API `/api/business/campaigns/{id}/content-submissions/{contentId}/approve` | ❌ MAJOR MISMATCH | iOS updates Supabase directly, Web uses backend API |

**iOS Trigger:** Manual via `approveCampaignContent(_:)` function
**iOS Parameters:** `contentId: String`
**iOS Query:**
```swift
supabaseService.client
  .from("content_submissions")
  .update(["status": "approved"])
  .eq("id", value: contentId)
```
**iOS Success:** Calls `refreshCampaignDetails()` at line 641
**iOS Error:** Sets `errorMessage` at line 644

**Web Trigger:** Via mutation hook
**Web Parameters:** `contentId: string`
**Web Endpoint:** `/api/business/campaigns/{campaignId}/content-submissions/{contentId}/approve`
**Web Method:** PATCH
**Web Success:** Invalidates content submissions query (line 286)
**Web Error:** React Query error handling

**CRITICAL DIFFERENCE:** iOS bypasses backend and updates database directly!

---

### 12. MARK CONTENT AS VIEWED

| OPERATION | iOS FILE:LINE | iOS METHOD/QUERY | WEB FILE:LINE | WEB HOOK/METHOD | MATCH? | NOTES |
|-----------|---------------|------------------|---------------|-----------------|--------|-------|
| **Mark Content Viewed** | BusinessCampaignDetailViewModel.swift:650, 658 | **Supabase Direct Update** `content_submissions` table (lines 658-662) | use-campaign-detail.ts:258-272 | `useMarkContentViewed(campaignId)` → Backend API `/api/business/campaigns/{id}/content-submissions/{contentId}/view` | ❌ MAJOR MISMATCH | iOS updates Supabase directly, Web uses backend API |

**iOS Trigger:** Manual via `markContentAsViewed(contentId:)` function
**iOS Parameters:** `contentId: String`
**iOS Query:**
```swift
supabaseService.client
  .from("content_submissions")
  .update(["status": "viewed"])
  .eq("id", value: contentId)
```
**iOS Success:** Immediately updates local `contentPosts` array and `newContentSubmissionsCount` (lines 665-691), then calls `refreshCampaignDetails()`
**iOS Error:** Sets `errorMessage` at line 697

**Web Trigger:** Via mutation hook
**Web Parameters:** `contentId: string`
**Web Endpoint:** `/api/business/campaigns/{campaignId}/content-submissions/{contentId}/view`
**Web Method:** PATCH
**Web Success:** Invalidates content submissions query (line 269)
**Web Error:** React Query error handling

**CRITICAL DIFFERENCE:** iOS bypasses backend and updates database directly, plus optimistic local update!

---

### 13. ACCEPT APPLICATION

| OPERATION | iOS FILE:LINE | iOS METHOD/QUERY | WEB FILE:LINE | WEB HOOK/METHOD | MATCH? | NOTES |
|-----------|---------------|------------------|---------------|-----------------|--------|-------|
| **Accept Application** | BusinessCampaignDetailViewModel.swift:703, 721 | `apiService.acceptCampaignApplication(campaignId, applicationId)` → Backend API `/business/campaigns/{id}/applications/{appId}/accept` | use-campaign-detail.ts:173-189 | `useAcceptApplication(campaignId)` → Backend API `/api/business/campaigns/{id}/applications/{appId}/accept` | ✅ MATCH | Both use same backend endpoint |

**iOS Trigger:** Manual via `acceptApplication(_:)` async function
**iOS Parameters:** `application: CampaignApplication`
**iOS Pre-checks:**
- Media event date validation (lines 707-712)
- Adds to `processingApplicationIds` set (line 716)
**iOS Endpoint:** `/business/campaigns/{campaignId}/applications/{applicationId}/accept` (APIService.swift:1665)
**iOS Method:** POST with empty body
**iOS Success:** Calls `refreshCampaignDetails()` at line 727
**iOS Error:** Sets `errorMessage` at line 730
**iOS Cleanup:** Removes from `processingApplicationIds` at line 736

**Web Trigger:** Via mutation hook
**Web Parameters:** `data: AcceptApplicationRequest` (contains applicationId)
**Web Endpoint:** `/api/business/campaigns/{campaignId}/applications/{applicationId}/accept`
**Web Method:** POST
**Web Success:** Invalidates applications, participants, and metrics queries (lines 184-187)
**Web Error:** React Query error handling

**MATCH CONFIRMED:** Both use same backend endpoint. iOS has additional media event validation.

---

### 14. REJECT APPLICATION

| OPERATION | iOS FILE:LINE | iOS METHOD/QUERY | WEB FILE:LINE | WEB HOOK/METHOD | MATCH? | NOTES |
|-----------|---------------|------------------|---------------|-----------------|--------|-------|
| **Reject Application** | BusinessCampaignDetailViewModel.swift:740, 758 | `apiService.rejectCampaignApplication(campaignId, applicationId)` → Backend API `/business/campaigns/{id}/applications/{appId}/reject` | use-campaign-detail.ts:192-207 | `useRejectApplication(campaignId)` → Backend API `/api/business/campaigns/{id}/applications/{appId}/reject` | ✅ MATCH | Both use same backend endpoint |

**iOS Trigger:** Manual via `rejectApplication(_:)` async function
**iOS Parameters:** `application: CampaignApplication`
**iOS Pre-checks:**
- Media event date validation (lines 744-749)
- Adds to `processingApplicationIds` set (line 753)
**iOS Endpoint:** `/business/campaigns/{campaignId}/applications/{applicationId}/reject` (APIService.swift:1681)
**iOS Method:** POST with empty body
**iOS Success:** Calls `refreshCampaignDetails()` at line 764
**iOS Error:** Sets `errorMessage` at line 767
**iOS Cleanup:** Removes from `processingApplicationIds` at line 773

**Web Trigger:** Via mutation hook
**Web Parameters:** `data: RejectApplicationRequest` (contains applicationId, reason)
**Web Endpoint:** `/api/business/campaigns/{campaignId}/applications/{applicationId}/reject`
**Web Method:** POST with `{ reason }` body
**Web Success:** Invalidates applications query (line 204)
**Web Error:** React Query error handling

**MATCH CONFIRMED:** Both use same backend endpoint. iOS doesn't send reason, Web does.

---

### 15. REFRESH CAMPAIGN DATA

| OPERATION | iOS FILE:LINE | iOS METHOD/QUERY | WEB FILE:LINE | WEB HOOK/METHOD | MATCH? | NOTES |
|-----------|---------------|------------------|---------------|-----------------|--------|-------|
| **Refresh on Notification** | BusinessCampaignDetailViewModel.swift:56, 69 | Listens for `.campaignDataUpdated` notification, calls `refreshCampaignData()` | N/A | React Query handles via cache invalidation | ⚠️ DIFFERENT PATTERN | iOS uses NotificationCenter, Web uses React Query |

**iOS Trigger:** NotificationCenter observer for `.campaignDataUpdated` with `campaignId` in userInfo
**iOS Setup:** In `setupNotificationObservers()` at line 54
**iOS Action:** Calls `refreshCampaignData()` which re-fetches campaign details and metrics (lines 75-81)
**iOS Pattern:** Push-based notification system

**Web Trigger:** Mutations invalidate queries via `queryClient.invalidateQueries()`
**Web Pattern:** Cache invalidation pattern

**DIFFERENCE:** Different refresh mechanisms - iOS uses pub/sub, Web uses cache invalidation

---

### 16. MANUAL REFRESH

| OPERATION | iOS FILE:LINE | iOS METHOD/QUERY | WEB FILE:LINE | WEB HOOK/METHOD | MATCH? | NOTES |
|-----------|---------------|------------------|---------------|-----------------|--------|-------|
| **Manual Refresh** | BusinessCampaignDetailViewModel.swift:590 | `refreshCampaignDetails()` - clears cache, re-calls `loadCampaignDetails` | N/A | `refetch()` on query hooks | ✅ SIMILAR | Both support manual refresh |

**iOS Trigger:** Manual via `refreshCampaignDetails()` function
**iOS Implementation:**
- Debounces with 100ms delay (lines 598-599)
- Clears cache (`lastDataLoadTime = nil`) at line 601
- Re-calls `loadCampaignDetails(campaign:)` at line 603
**iOS Debounce:** Cancels existing task to prevent multiple simultaneous refreshes (line 594)

**Web Trigger:** Call `.refetch()` on any useQuery hook
**Web Implementation:** React Query's built-in refetch mechanism

**SIMILAR FUNCTIONALITY:** Both support manual refresh with different implementations

---

## UNUSED OPERATIONS

### 17. LOAD VISIT COUNT (Deprecated iOS Method)

| OPERATION | iOS FILE:LINE | iOS METHOD/QUERY | WEB FILE:LINE | WEB HOOK/METHOD | MATCH? | NOTES |
|-----------|---------------|------------------|---------------|-----------------|--------|-------|
| **Legacy Visit Count Query** | BusinessCampaignDetailViewModel.swift:795 | **NOT USED** - Supabase query to `visits` table with manual attribution logic | use-campaign-detail.ts:103-112 | `useCampaignVisits(id)` → Backend API `/api/business/campaigns/{id}/visits` | ⚠️ N/A | iOS method exists but not called, Web hook available but may not be used in UI |

**iOS Status:** Private method exists but NOT called in `loadCampaignDetails`. Comment at line 211 says "Use backend attribution data only (not visits table)"
**iOS Query (if called):**
```swift
supabaseService.client
  .from("visits")
  .select("customer_id, influencer_id")
  .eq("campaign_id", value: campaignId)
  .not("customer_id", operator: .is, value: "null")
```
**iOS Processing:** Complex attribution logic separating influencer vs direct visits (lines 814-836)

**Web Status:** Hook exists but usage unknown
**Web Endpoint:** `/api/business/campaigns/{id}/visits`

**DEPRECATION:** iOS moved to backend-calculated attribution, this method kept for reference

---

## SUMMARY OF CRITICAL MISMATCHES

### Data Fetching Architecture Differences

1. **CAMPAIGN METRICS** ❌
   - iOS: Returns mock data (all zeros)
   - Web: Calls real backend API `/api/business/campaigns/{id}/metrics`
   - Web auto-refreshes every 30 seconds
   - **Impact:** iOS shows no real metrics, Web shows live data

2. **PARTICIPATING INFLUENCERS** ❌
   - iOS: Direct Supabase query to `campaign_applications` + `user_profiles` tables
   - Web: Backend API `/api/business/campaigns/{id}/participants` with full metrics
   - **Impact:** Different data structures, iOS missing visit/conversion metrics

3. **CONTENT POSTS** ❌
   - iOS: 3 separate Supabase queries (`content_submissions`, `influencer_profiles`, `user_profiles`) with in-memory join
   - Web: Single backend API `/api/business/campaigns/{id}/content-submissions`
   - **Impact:** More network overhead on iOS, complex client-side logic

4. **INFLUENCER VISITOR COUNTS** ⚠️
   - iOS: Direct Supabase query to `visits` table with aggregation
   - Web: Pre-calculated in participants API response
   - **Impact:** iOS does client-side aggregation, Web gets server-calculated

### Mutation Architecture Differences

5. **UPDATE CAMPAIGN STATUS** ❌ CRITICAL
   - iOS: Direct Supabase update to `campaigns` table
   - Web: Backend API `/api/business/campaigns/{id}/status`
   - **Impact:** iOS bypasses business logic, validation, and audit trails

6. **APPROVE CONTENT** ❌ CRITICAL
   - iOS: Direct Supabase update to `content_submissions` table
   - Web: Backend API `/content-submissions/{id}/approve`
   - **Impact:** iOS bypasses business logic (notifications, analytics)

7. **MARK CONTENT VIEWED** ❌ CRITICAL
   - iOS: Direct Supabase update to `content_submissions` table
   - Web: Backend API `/content-submissions/{id}/view`
   - **Impact:** iOS bypasses business logic, but has optimistic UI update

### Field Name Inconsistencies

8. **PARTICIPANT FIELDS**
   - iOS: `totalVisits`, `totalCreditsEarned`, `influencerId`
   - Web: `visitsGenerated`, `creditsEarned`, `userId`, `visitCount`, `customerCount`
   - **Impact:** Different property names, iOS missing some fields

### Matching Operations ✅

These operations correctly use the same backend API:
- Get Campaign Details
- Get Campaign Applications
- Get Campaign Activity
- Accept Application
- Reject Application

---

## CACHING BEHAVIOR

### iOS Caching
- **Campaign Details:** 5-minute cache at ViewModel level (lines 96-102)
- **All Data:** Cached together when campaign loads
- **Cache Key:** `lastLoadedCampaignId` + `lastDataLoadTime`
- **Cache Invalidation:** Manual via `refreshCampaignDetails()` or notification
- **API Level Cache:** Customer deals cached at APIService level (line 260)

### Web Caching
- **All Queries:** React Query automatic caching
- **Metrics:** 30-second auto-refresh (line 52)
- **Cache Invalidation:** Automatic via `queryClient.invalidateQueries()` after mutations
- **Stale Time:** React Query defaults
- **Cache Keys:** Structured keys via `campaignKeys` object (lines 20-29)

---

## AUTO-REFRESH BEHAVIOR

### iOS Auto-Refresh
- **None** by default
- Manual refresh via pull-to-refresh gesture (if implemented in View)
- Notification-based refresh on `.campaignDataUpdated` event
- No polling or intervals

### Web Auto-Refresh
- **Metrics Query:** 30-second polling (line 52)
- **Other Queries:** No auto-refresh unless window focus triggers refetch
- React Query's default stale-while-revalidate behavior

---

## ERROR HANDLING

### iOS Error Handling
- Sets `@Published var errorMessage: String?`
- Logs errors to console with extensive debug output
- Non-critical errors don't block other parallel loads (TaskGroup continues)
- Failed loads set empty arrays/defaults

### Web Error Handling
- React Query error states
- Each hook has independent error state
- No automatic error display (must be handled in components)

---

## PERFORMANCE CHARACTERISTICS

### iOS Performance
- **Parallel Loading:** Uses `withTaskGroup` to load all data concurrently (lines 122-268)
- **7 Parallel Tasks:** Campaign details, metrics, participants, content, posts, applications, visit counts, customer counts, activity
- **Network Calls:** Mix of backend API (4 calls) and direct Supabase (5+ queries)
- **Data Processing:** Client-side joins for content posts (3 queries merged)
- **Debouncing:** 100ms debounce on manual refresh (line 598)
- **Token Management:** Fresh token fetched before each API call

### Web Performance
- **Independent Queries:** Each hook loads separately
- **Network Calls:** All backend API, no direct Supabase
- **Parallel Loading:** React Query handles automatic parallelization
- **Auto-refresh:** Metrics refreshed every 30 seconds
- **Cache First:** React Query shows cached data immediately, then refetches

---

## ARCHITECTURAL RECOMMENDATIONS

### Critical Issues to Address

1. **iOS Metrics Must Use Real API**
   - Replace mock data at line 288 with actual API call
   - iOS users see no metrics currently

2. **Standardize Mutation Paths**
   - iOS should use backend APIs for: status updates, content approval, content viewed
   - Bypassing backend skips business logic, notifications, analytics

3. **Consolidate Data Fetching**
   - iOS should use participants API instead of direct Supabase query
   - iOS should use single content API instead of 3 separate queries
   - Reduces complexity and network overhead

4. **Align Field Names**
   - Standardize on either snake_case or camelCase across both platforms
   - Document canonical field names in TypeScript types

5. **Backend Should Calculate Aggregations**
   - Move influencer visitor count aggregation to backend
   - iOS shouldn't manually query and aggregate visits table

### Architecture Patterns to Adopt

1. **Backend API as Single Source of Truth**
   - All data mutations through backend
   - All complex queries through backend
   - Direct Supabase only for auth and real-time subscriptions

2. **Consistent Response Structures**
   - Same field names across platforms
   - Same nested structure
   - Backend handles all joins and calculations

3. **Caching Strategy**
   - Consider React Query equivalent for iOS (Apollo, Relay, custom)
   - Consistent cache invalidation rules
   - Document stale times and refetch policies

---

## ENDPOINT MAPPING TABLE

| Operation | iOS Endpoint | Web Endpoint | Match |
|-----------|-------------|--------------|-------|
| Get Campaign | `/business/campaigns/{id}` | `/api/business/campaigns/{id}` | ✅ |
| Get Metrics | MOCK DATA | `/api/business/campaigns/{id}/metrics` | ❌ |
| Get Applications | `/business/campaigns/{id}/applications` | `/api/business/campaigns/{id}/applications` | ✅ |
| Get Participants | Supabase: `campaign_applications` | `/api/business/campaigns/{id}/participants` | ❌ |
| Get Content | Supabase: `content_submissions` (3 queries) | `/api/business/campaigns/{id}/content-submissions` | ❌ |
| Get Activity | `/business/campaigns/{id}/activity` | `/api/business/campaigns/{id}/activity` | ✅ |
| Get Visits | Not Used (backend data) | `/api/business/campaigns/{id}/visits` | ⚠️ |
| Accept Application | `/business/campaigns/{id}/applications/{appId}/accept` | `/api/business/campaigns/{id}/applications/{appId}/accept` | ✅ |
| Reject Application | `/business/campaigns/{id}/applications/{appId}/reject` | `/api/business/campaigns/{id}/applications/{appId}/reject` | ✅ |
| Update Status | Supabase: `campaigns` table | `/api/business/campaigns/{id}/status` | ❌ |
| Approve Content | Supabase: `content_submissions` table | `/api/business/campaigns/{id}/content-submissions/{id}/approve` | ❌ |
| Mark Viewed | Supabase: `content_submissions` table | `/api/business/campaigns/{id}/content-submissions/{id}/view` | ❌ |

---

## FILES ANALYZED

### iOS Files
- `/Users/anthony/Documents/Projects/Collabuu/Business/Pages/Campaigns/ViewModels/BusinessCampaignDetailViewModel.swift` (996 lines)
- `/Users/anthony/Documents/Projects/Collabuu/Shared/Services/APIService.swift` (specific methods: getBusinessCampaignDetails, getCampaignApplications, getCampaignActivity, acceptCampaignApplication, rejectCampaignApplication)

### Web Files
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/lib/hooks/use-campaign-detail.ts` (290 lines)
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/lib/api/campaigns.ts` (160 lines)

---

**Analysis Date:** 2025-10-23
**Total Operations Documented:** 17
**Critical Mismatches:** 7
**Matching Operations:** 5
**Different Approaches:** 5
