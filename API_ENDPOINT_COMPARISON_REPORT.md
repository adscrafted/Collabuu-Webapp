# Campaign API Endpoints: iOS vs Web App Comparison Report

**Generated:** October 23, 2025
**Purpose:** Ensure API consistency between iOS app and web application for campaign detail functionality

---

## Executive Summary

This report compares the API endpoints used by the iOS app (Swift) and the web app (TypeScript/React) for campaign detail functionality. The analysis reveals good overall alignment with some minor discrepancies in endpoint naming, data access patterns, and a few platform-specific features.

**Key Findings:**
- ✅ **Core endpoints are well-aligned** - Both platforms use the same base endpoints for campaigns, applications, and participants
- ⚠️ **Endpoint path inconsistencies** - Minor differences in accept/reject application endpoint patterns
- ⚠️ **Content submission approach differs** - iOS uses Supabase direct access, web uses dedicated API endpoint
- ✅ **Data structures are compatible** - Campaign models share core fields with platform-specific extensions
- 📌 **Web-only features identified** - Activity timeline and duplicate campaign endpoints

---

## 1. Endpoint Comparison Table

### 1.1 Campaign Core Data

| Feature | iOS Endpoint | Web App Endpoint | Status | Notes |
|---------|--------------|------------------|--------|-------|
| **Get Campaign Details** | `GET /api/business/campaigns/:id` | `GET /api/business/campaigns/:id` | ✅ Match | Returns Campaign object |
| **Get Campaign List** | `GET /api/business/campaigns` | `GET /api/business/campaigns` | ✅ Match | Returns Campaign[] |
| **Create Campaign** | `POST /api/business/campaigns` | `POST /api/business/campaigns` | ✅ Match | Accepts iOS-formatted payload |
| **Update Campaign** | `PUT /api/business/campaigns/:id` | `PATCH /api/business/campaigns/:id` | ⚠️ Method Diff | iOS uses PUT, Web uses PATCH |
| **Delete Campaign** | `DELETE /api/business/campaigns/:id` | `DELETE /api/business/campaigns/:id` | ✅ Match | - |
| **Update Status** | `PUT /api/business/campaigns/:id/status` | `PATCH /api/business/campaigns/:id/status` | ⚠️ Method Diff | iOS uses PUT, Web uses PATCH |

### 1.2 Campaign Metrics & Analytics

| Feature | iOS Endpoint | Web App Endpoint | Status | Notes |
|---------|--------------|------------------|--------|-------|
| **Campaign Metrics** | `GET /api/business/campaigns/:id/metrics` | `GET /api/business/campaigns/:id/metrics` | ✅ Match | Returns CampaignMetrics |
| **Visitor Data** | ❌ Not Implemented | `GET /api/business/campaigns/:id/visits` | 📌 Web Only | iOS has placeholder, returns mock data |
| **Activity Timeline** | `GET /api/business/campaigns/:id/activity` | `GET /api/business/campaigns/:id/activity` | ⚠️ Partial | iOS falls back to mock data if endpoint unavailable |

### 1.3 Influencer Applications

| Feature | iOS Endpoint | Web App Endpoint | Status | Notes |
|---------|--------------|------------------|--------|-------|
| **Get Applications** | `GET /api/business/campaigns/:id/applications` | `GET /api/business/campaigns/:id/applications` | ✅ Match | Returns CampaignApplication[] |
| **Accept Application** | `POST /api/business/campaigns/:campaignId/applications/:applicationId/accept` | `POST /api/business/campaigns/:campaignId/applications/:applicationId/approve` | ⚠️ Path Diff | iOS uses `/accept`, Web uses `/approve` |
| **Reject Application** | `POST /api/business/campaigns/:campaignId/applications/:applicationId/reject` | `POST /api/business/campaigns/:campaignId/applications/:applicationId/reject` | ✅ Match | - |

### 1.4 Campaign Participants

| Feature | iOS Endpoint | Web App Endpoint | Status | Notes |
|---------|--------------|------------------|--------|-------|
| **Get Participants** | `GET /api/business/campaigns/:id/participants` | `GET /api/business/campaigns/:id/participants` | ✅ Match | Returns CampaignParticipant[] with visit/customer counts |
| **Remove Participant** | ❌ Not Found | `DELETE /api/business/campaigns/:id/participants/:participantId` | 📌 Web Only | iOS doesn't have this endpoint |
| **Invite Influencer** | `POST /api/business/influencers/:influencerId/campaigns/:campaignId/invite` | ❌ Not Found | 📌 iOS Only | Different endpoint structure |

### 1.5 Content Submissions

| Feature | iOS Endpoint | Web App Endpoint | Status | Notes |
|---------|--------------|------------------|--------|-------|
| **Get Content** | 🔵 Supabase Direct Query | `GET /api/business/campaigns/:id/content-submissions` | ⚠️ Different Approach | iOS queries `content_submissions` table directly |
| **Mark as Viewed** | `POST /api/business/campaigns/:campaignId/content/:contentId/mark-viewed` | `PATCH /api/business/campaigns/:campaignId/content-submissions/:contentId/view` | ⚠️ Path Diff | Different endpoint patterns |
| **Approve Content** | 🔵 Supabase Direct Update | ❌ Not explicitly found | ⚠️ Different Approach | iOS updates status in Supabase directly |
| **Get Campaign Posts** | `GET /api/business/campaigns/:id/posts` | ❌ Not Found | 📌 iOS Only | Separate from content submissions |

### 1.6 Web-Only Features

| Feature | Web App Endpoint | Status | Notes |
|---------|------------------|--------|-------|
| **Duplicate Campaign** | `POST /api/business/campaigns/:id/duplicate` | 📌 Web Only | Not found in iOS codebase |
| **Get Visits History** | `GET /api/business/campaigns/:id/visits` | 📌 Web Only | iOS has placeholder returning mock data |

---

## 2. Data Structure Comparison

### 2.1 Campaign Model

#### iOS Campaign Model (Swift)
**Location:** `/Users/anthony/Documents/Projects/Collabuu/Shared/Services/APIService.swift` (line 2375)

```swift
struct Campaign: Codable, Identifiable, Sendable {
    let id: String
    let businessId: String?
    let title: String
    let subtitle: String?
    let paymentType: String?              // Maps to campaign_type
    var influencerCount: Int?
    var pendingApplicationsCount: Int?
    var status: String
    let periodStart: Date?                // period_start
    let periodEnd: Date?                  // period_end
    let visits: Int?
    let credits: Int?
    let imageURL: String?                 // Note: Capital URL
    let imageUrl: String?                 // Also accepts lowercase
    let createdAt: Date?
    let updatedAt: Date?

    // Notification badges
    var unreadNotificationCount: Int?
    var hasNewContentSubmissions: Bool?
    var hasNewInfluencerActivity: Bool?

    // Additional properties
    let description: String?
    let shareLink: String?
    let category: String?
    let tags: [String]?
    let visibility: String?
    let requirements: String?
    let influencerSpots: Int?
    let creditsPerAction: Int?
    let creditsPerCustomer: Int?
    let totalCredits: Int?
    var visitCount: Int?
    var influencerVisitorCount: Int?      // Influencer-attributed visits
    var directAppVisitorCount: Int?       // Platform-attributed visits
    let totalCreditsTransferred: Double?
    let usedCredits: Int?
    let commissionRate: Double?
    let isExpired: Bool?
    let businessProfiles: BusinessProfile?
}
```

#### Web App Campaign Model (TypeScript)
**Location:** `/Users/anthony/Documents/Projects/Collabuu-Webapp/lib/types/campaign.ts`

```typescript
export interface Campaign {
  id: string;
  businessId: string;
  type: CampaignType;                    // enum: PAY_PER_CUSTOMER | MEDIA_EVENT | REWARDS
  status: CampaignStatus;                // enum: DRAFT | ACTIVE | PAUSED | COMPLETED | CANCELLED
  title: string;
  description: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
  startDate: string;                     // Maps to period_start
  endDate: string;                       // Maps to period_end
  eventDate?: string;
  budget: CampaignBudget;                // Structured object (see below)
  requirements: string;                  // Required string
  visibility: 'public' | 'private';      // Required
  shareLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignBudget {
  creditsPerCustomer?: number;
  creditsPerAction?: number;
  maxVisits?: number;
  influencerSpots?: number;
  influencerSpotsFilled?: number;
  rewardValue?: number;
  maxRedemptionsPerCustomer?: number;
  totalCredits: number;
}

export interface CampaignWithStats extends Campaign {
  stats: CampaignStats;
}

export interface CampaignStats {
  participantsCount: number;
  visitsCount: number;
  creditsSpent: number;
}
```

#### Key Differences

| Field | iOS | Web | Notes |
|-------|-----|-----|-------|
| **Type Field** | `paymentType: String?` | `type: CampaignType` | iOS uses string, Web uses enum |
| **Status** | `status: String` | `status: CampaignStatus` | iOS uses string, Web uses enum |
| **Dates** | `periodStart/End: Date?` | `startDate/endDate: string` | iOS uses Date objects, Web uses ISO strings |
| **Budget** | Flat properties | `budget: CampaignBudget` | Web groups budget fields into nested object |
| **Image URL** | `imageURL` and `imageUrl` | `imageUrl` | iOS accepts both (legacy support) |
| **Visitor Attribution** | `influencerVisitorCount`, `directAppVisitorCount` | Embedded in metrics | iOS tracks at campaign level |
| **Notifications** | `hasNewContentSubmissions`, `hasNewInfluencerActivity` | Not present | iOS-specific UI features |
| **Stats** | Flat properties | `CampaignWithStats` extension | Web uses separate stats interface |

---

### 2.2 CampaignApplication Model

#### iOS CampaignApplication
**Location:** `/Users/anthony/Documents/Projects/Collabuu/Shared/Models/CampaignApplication.swift`

```swift
struct CampaignApplication: Codable, Identifiable, Sendable {
    let id: String
    let campaignId: String
    let influencerId: String
    let status: String                    // "pending" | "accepted" | "rejected"
    let applicationMessage: String?
    let appliedAt: Date
    let reviewedAt: Date?
    let reviewerNotes: String?
    let message: String?
    let applicationData: [String: AnyCodableValue]
    let respondedAt: Date?
    let applicationType: String
    var influencer: UserProfile?          // Populated from API
}
```

#### Web App InfluencerApplication
**Location:** `/Users/anthony/Documents/Projects/Collabuu-Webapp/lib/types/campaign.ts`

```typescript
export interface InfluencerApplication {
  id: string;
  campaignId: string;
  influencerId: string;
  influencerName: string;
  influencerAvatar?: string;
  followerCount: number;
  engagementRate: number;
  applicationMessage: string;
  portfolioImages?: string[];
  socialMediaLinks: {
    platform: string;
    url: string;
    followers: number;
  }[];
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  reviewedAt?: string;
}
```

#### Key Differences

- **Denormalized Data:** Web app expects influencer data embedded in application (name, avatar, followerCount), while iOS loads it separately via `UserProfile`
- **Status Values:** iOS uses `"accepted"`, Web uses `"approved"`
- **Additional Fields:** Web includes `engagementRate`, `portfolioImages`, `socialMediaLinks` that iOS doesn't have in the model

---

### 2.3 CampaignParticipant Model

#### iOS CampaignParticipant
**Location:** Referenced in APIService.swift line 1611

```swift
// Inferred from API endpoint usage
struct CampaignParticipant {
    // Similar structure expected
}
```

#### Web App CampaignParticipant
**Location:** `/Users/anthony/Documents/Projects/Collabuu-Webapp/lib/types/campaign.ts`

```typescript
export interface CampaignParticipant {
  id: string;
  campaignId: string;
  influencerId: string;
  influencerName: string;
  influencerAvatar?: string;
  followerCount: number;
  joinedAt: string;
  visitsGenerated: number;
  conversions: number;
  creditsEarned: number;
  conversionRate: number;
  lastActivityAt?: string;
  visitCount?: number;                   // Number of visits generated
  customerCount?: number;                // Number of unique customers
}
```

**Note:** iOS code doesn't have a defined `CampaignParticipant` struct in the provided files, suggesting it may be defined elsewhere or the endpoint is used but the model is not strongly typed.

---

### 2.4 CampaignMetrics Model

#### iOS CampaignMetrics
**Location:** Referenced in APIService.swift line 1603

```swift
// Inferred from endpoint - exact structure not provided
struct CampaignMetrics {
    // Expected to contain metrics data
}
```

#### Web App CampaignMetrics
**Location:** `/Users/anthony/Documents/Projects/Collabuu-Webapp/lib/types/campaign.ts`

```typescript
export interface CampaignMetrics {
  totalVisits: number;
  influencerVisitorCount: number;        // Visitors from influencer referrals
  directAppVisitorCount: number;         // Visitors from direct app
  totalParticipants: number;
  creditsSpent: number;
  totalBudget: number;
  conversionRate: number;
  averageCostPerVisit: number;
  totalViews: number;
  clickThroughRate: number;
  averageSessionDuration: number;
}
```

---

### 2.5 ContentSubmission Model

#### iOS Approach
iOS accesses `content_submissions` table directly via Supabase:
```swift
// Direct Supabase query (no dedicated model found in provided files)
// Updates status to "viewed" or "approved" directly in database
```

#### Web App ContentSubmission
**Location:** `/Users/anthony/Documents/Projects/Collabuu-Webapp/lib/types/campaign.ts`

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

---

## 3. Missing Endpoint Identification

### 3.1 Endpoints Used by iOS but Missing in Web App

1. **Invite Influencer to Campaign**
   - iOS: `POST /api/business/influencers/:influencerId/campaigns/:campaignId/invite`
   - Web: ❌ Not found
   - **Impact:** Web app may not support direct influencer invitations from business side

2. **Get Campaign Posts** (distinct from content submissions)
   - iOS: `GET /api/business/campaigns/:id/posts`
   - Web: ❌ Not found
   - **Impact:** Unclear - may be legacy endpoint or different feature

3. **Upload Campaign Image**
   - iOS: `POST /api/business/campaigns/upload-image` (inferred from line 1547)
   - Web: `POST /api/upload/campaign-image`
   - **Impact:** Different endpoint paths - should be standardized

### 3.2 Endpoints Used by Web App but Missing/Not Implemented in iOS

1. **Duplicate Campaign**
   - Web: `POST /api/business/campaigns/:id/duplicate`
   - iOS: ❌ Not found
   - **Impact:** Web-specific feature - iOS users cannot duplicate campaigns

2. **Remove Participant**
   - Web: `DELETE /api/business/campaigns/:id/participants/:participantId`
   - iOS: ❌ Not found
   - **Impact:** Web can remove participants, iOS cannot

3. **Get Visit History** (implemented)
   - Web: `GET /api/business/campaigns/:id/visits`
   - iOS: Has placeholder function returning mock data (line 1947)
   - **Impact:** iOS shows mock data instead of real visit history

4. **Content Submission API Endpoint**
   - Web: `GET /api/business/campaigns/:id/content-submissions`
   - iOS: Uses direct Supabase query
   - **Impact:** Different data access patterns - should be unified

---

## 4. Unified API Specification

### 4.1 Recommended Standard Endpoints

Based on the analysis, here's the recommended unified API specification:

#### Campaign Management

```
GET    /api/business/campaigns                    - List all campaigns
GET    /api/business/campaigns/:id                - Get campaign details
POST   /api/business/campaigns                    - Create new campaign
PATCH  /api/business/campaigns/:id                - Update campaign (use PATCH for partial updates)
DELETE /api/business/campaigns/:id                - Delete campaign
PATCH  /api/business/campaigns/:id/status         - Update campaign status
POST   /api/business/campaigns/:id/duplicate      - Duplicate campaign
```

#### Campaign Analytics

```
GET    /api/business/campaigns/:id/metrics        - Get campaign metrics
GET    /api/business/campaigns/:id/visits         - Get visit history
GET    /api/business/campaigns/:id/activity       - Get activity timeline
```

#### Influencer Applications

```
GET    /api/business/campaigns/:id/applications                      - Get all applications
POST   /api/business/campaigns/:id/applications/:appId/approve       - Approve application (standardize on 'approve')
POST   /api/business/campaigns/:id/applications/:appId/reject        - Reject application
```

#### Campaign Participants

```
GET    /api/business/campaigns/:id/participants                      - Get all participants
DELETE /api/business/campaigns/:id/participants/:participantId       - Remove participant
```

#### Content Submissions

```
GET    /api/business/campaigns/:id/content-submissions               - Get all content submissions
PATCH  /api/business/campaigns/:id/content-submissions/:id/view      - Mark as viewed
PATCH  /api/business/campaigns/:id/content-submissions/:id/approve   - Approve content
```

#### Influencer Invitations

```
POST   /api/business/campaigns/:id/invitations                       - Invite influencers to campaign
       Body: { influencerIds: string[] }
```

#### File Uploads

```
POST   /api/business/campaigns/upload-image       - Upload campaign image (standardize path)
```

---

## 5. Recommendations for Synchronization

### 5.1 Critical Issues to Address

#### 1. **Standardize Accept/Approve Application Endpoint** 🔴 HIGH PRIORITY
- **Problem:** iOS uses `/accept`, Web uses `/approve`
- **Recommendation:** Standardize on `/approve` and update iOS code
- **Backend Action:** Support both endpoints during transition, then deprecate `/accept`

#### 2. **Unify Content Submission Access Pattern** 🔴 HIGH PRIORITY
- **Problem:** iOS uses direct Supabase queries, Web uses dedicated API endpoint
- **Recommendation:** Both platforms should use API endpoint `/api/business/campaigns/:id/content-submissions`
- **Backend Action:** Ensure endpoint exists and handles all content submission operations
- **iOS Action:** Migrate from Supabase direct queries to API endpoint

#### 3. **Implement Missing Endpoints on Both Platforms** 🟡 MEDIUM PRIORITY

**For iOS:**
- Add `POST /api/business/campaigns/:id/duplicate` support
- Add `DELETE /api/business/campaigns/:id/participants/:participantId` support
- Implement real visit history endpoint (replace mock data)

**For Web:**
- Add influencer invitation endpoint support
- Consider if campaign posts endpoint is needed

#### 4. **Standardize HTTP Methods** 🟡 MEDIUM PRIORITY
- **Problem:** iOS uses PUT for updates, Web uses PATCH
- **Recommendation:** Use PATCH for partial updates (Web approach is correct)
- **iOS Action:** Update APIService to use PATCH instead of PUT

### 5.2 Data Structure Recommendations

#### 1. **Campaign Model Alignment** 🟡 MEDIUM PRIORITY
- Standardize type field: Use enum-like values consistently
- Align date handling: Backend should accept both Date objects and ISO strings
- Consider budget object: Web's grouped approach is cleaner - iOS could adopt this

#### 2. **Application Status Values** 🟡 MEDIUM PRIORITY
- **Problem:** iOS uses "accepted", Web expects "approved"
- **Recommendation:** Standardize on "approved" status
- **Backend Action:** Accept both values, normalize to "approved"

#### 3. **Visitor Attribution Fields** 🟢 LOW PRIORITY
- iOS tracks `influencerVisitorCount` and `directAppVisitorCount` at campaign level
- Web embeds this in metrics endpoint
- **Recommendation:** Include in both Campaign object AND metrics for consistency

### 5.3 Platform-Specific Features to Address

#### 1. **Activity Timeline** 🟢 LOW PRIORITY
- iOS falls back to mock data if endpoint unavailable
- Web expects real data
- **Recommendation:** Ensure backend endpoint is fully implemented for both platforms

#### 2. **Notification Badges** 🟢 LOW PRIORITY
- iOS has `hasNewContentSubmissions`, `hasNewInfluencerActivity`
- Web doesn't use these
- **Recommendation:** Keep as iOS-specific fields, don't require on Web

#### 3. **Campaign Duplication** 🟡 MEDIUM PRIORITY
- Web-only feature currently
- **Recommendation:** Implement in iOS for feature parity

### 5.4 API Documentation Needs

#### 1. **Create OpenAPI/Swagger Specification**
- Document all campaign-related endpoints
- Include request/response schemas
- Specify platform-specific fields

#### 2. **Document Visitor Attribution Logic**
- Clarify how `influencerVisitorCount` vs `directAppVisitorCount` is calculated
- Document when these fields are populated

#### 3. **Content Submission Workflow**
- Document the full lifecycle: submission → viewed → approved
- Clarify Supabase vs API endpoint usage

---

## 6. Migration Checklist

### Phase 1: Critical Fixes (Week 1-2)

- [ ] **Backend:** Support both `/accept` and `/approve` for application responses
- [ ] **Backend:** Implement `/api/business/campaigns/:id/content-submissions` endpoint
- [ ] **iOS:** Migrate content submissions from Supabase direct to API endpoint
- [ ] **Backend:** Standardize on PATCH for partial updates (support PUT during transition)

### Phase 2: Feature Parity (Week 3-4)

- [ ] **Backend:** Implement campaign duplication endpoint (if not exists)
- [ ] **iOS:** Add duplicate campaign feature
- [ ] **Backend:** Implement participant removal endpoint (if not exists)
- [ ] **iOS:** Add remove participant feature
- [ ] **Backend:** Implement real visit history endpoint
- [ ] **iOS:** Replace mock visit data with real endpoint

### Phase 3: Standardization (Week 5-6)

- [ ] **Backend:** Deprecate `/accept` endpoint (keep `/approve`)
- [ ] **iOS:** Update all PUT requests to PATCH
- [ ] **Backend:** Standardize application status to "approved" (accept "accepted" as alias)
- [ ] **Both:** Update documentation with final endpoint specifications

### Phase 4: Enhancement (Week 7-8)

- [ ] **Backend:** Create OpenAPI specification
- [ ] **Backend:** Add visitor attribution fields to Campaign model consistently
- [ ] **Both:** Align Campaign type enums
- [ ] **Both:** Consider budget object restructuring (align with Web approach)

---

## 7. API Endpoint Reference (Complete)

### Campaign Core

| Method | Endpoint | iOS | Web | Status |
|--------|----------|-----|-----|--------|
| GET | `/api/business/campaigns` | ✅ | ✅ | Aligned |
| GET | `/api/business/campaigns/:id` | ✅ | ✅ | Aligned |
| POST | `/api/business/campaigns` | ✅ | ✅ | Aligned |
| PATCH | `/api/business/campaigns/:id` | 🔄 (PUT) | ✅ | Needs alignment |
| DELETE | `/api/business/campaigns/:id` | ✅ | ✅ | Aligned |
| PATCH | `/api/business/campaigns/:id/status` | 🔄 (PUT) | ✅ | Needs alignment |
| POST | `/api/business/campaigns/:id/duplicate` | ❌ | ✅ | iOS missing |

### Metrics & Analytics

| Method | Endpoint | iOS | Web | Status |
|--------|----------|-----|-----|--------|
| GET | `/api/business/campaigns/:id/metrics` | ✅ | ✅ | Aligned |
| GET | `/api/business/campaigns/:id/visits` | 🔄 (Mock) | ✅ | iOS not implemented |
| GET | `/api/business/campaigns/:id/activity` | 🔄 (Fallback) | ✅ | iOS partial |

### Applications

| Method | Endpoint | iOS | Web | Status |
|--------|----------|-----|-----|--------|
| GET | `/api/business/campaigns/:id/applications` | ✅ | ✅ | Aligned |
| POST | `/api/business/campaigns/:id/applications/:appId/approve` | 🔄 (/accept) | ✅ | Needs alignment |
| POST | `/api/business/campaigns/:id/applications/:appId/reject` | ✅ | ✅ | Aligned |

### Participants

| Method | Endpoint | iOS | Web | Status |
|--------|----------|-----|-----|--------|
| GET | `/api/business/campaigns/:id/participants` | ✅ | ✅ | Aligned |
| DELETE | `/api/business/campaigns/:id/participants/:id` | ❌ | ✅ | iOS missing |

### Content Submissions

| Method | Endpoint | iOS | Web | Status |
|--------|----------|-----|-----|--------|
| GET | `/api/business/campaigns/:id/content-submissions` | 🔵 (Supabase) | ✅ | Different approach |
| PATCH | `/api/business/campaigns/:id/content-submissions/:id/view` | 🔄 (Different) | ✅ | Needs alignment |
| PATCH | `/api/business/campaigns/:id/content-submissions/:id/approve` | 🔵 (Supabase) | ❌ | Both need work |

### iOS-Specific

| Method | Endpoint | iOS | Web | Status |
|--------|----------|-----|-----|--------|
| POST | `/api/business/influencers/:id/campaigns/:campaignId/invite` | ✅ | ❌ | Web missing |
| GET | `/api/business/campaigns/:id/posts` | ✅ | ❌ | Unclear purpose |

---

## 8. Conclusion

The iOS app and web app are **well-aligned on core campaign functionality**, with both using the same base endpoints for campaign CRUD operations, metrics, applications, and participants. However, there are **key areas requiring synchronization**:

### Immediate Actions Required:
1. Unify content submission access (move iOS from Supabase to API)
2. Standardize accept/approve endpoint naming
3. Implement missing endpoints on both platforms
4. Align HTTP methods (use PATCH for updates)

### Long-term Improvements:
1. Create comprehensive API documentation (OpenAPI spec)
2. Align data models (especially Campaign type/status enums)
3. Ensure feature parity (duplication, participant removal, visit history)
4. Consider adopting web's budget object structure for cleaner data modeling

By addressing these recommendations, both platforms will have consistent, reliable access to campaign functionality through a unified API specification.

---

## Appendix: File Locations

### iOS Files Analyzed:
- `/Users/anthony/Documents/Projects/Collabuu/Shared/Services/APIService.swift`
- `/Users/anthony/Documents/Projects/Collabuu/Shared/Models/CampaignApplication.swift`
- `/Users/anthony/Documents/Projects/Collabuu/Shared/Models/SharedModels.swift`

### Web App Files Analyzed:
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/lib/api/campaigns.ts`
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/lib/types/campaign.ts`
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/lib/hooks/use-campaign-detail.ts`
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/app/(app)/campaigns/[id]/page.tsx`
