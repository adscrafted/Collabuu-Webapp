# API Synchronization Quick Reference

**One-page summary of iOS vs Web App API differences**

---

## 🔴 Critical Issues

### 1. Accept/Approve Endpoint Mismatch
- **iOS:** `POST /campaigns/:id/applications/:appId/accept`
- **Web:** `POST /campaigns/:id/applications/:appId/approve`
- **Action:** Standardize on `/approve`, update iOS code

### 2. Content Submission Access Pattern
- **iOS:** Direct Supabase queries to `content_submissions` table
- **Web:** `GET /campaigns/:id/content-submissions` API endpoint
- **Action:** iOS must migrate to API endpoint

### 3. HTTP Method Inconsistency
- **iOS:** Uses `PUT` for updates
- **Web:** Uses `PATCH` for partial updates
- **Action:** iOS should switch to `PATCH`

---

## 🟡 Feature Parity Gaps

### Missing in iOS
- ❌ `POST /campaigns/:id/duplicate` - Campaign duplication
- ❌ `DELETE /campaigns/:id/participants/:id` - Remove participant
- ❌ `GET /campaigns/:id/visits` - Real visit history (has mock data)

### Missing in Web
- ❌ `POST /influencers/:id/campaigns/:id/invite` - Direct invite
- ❌ `GET /campaigns/:id/posts` - Campaign posts (unclear purpose)

---

## 📊 Data Structure Differences

### Campaign Model
| Field | iOS | Web | Issue |
|-------|-----|-----|-------|
| Status | `String` | `Enum` | iOS uses string values |
| Type | `paymentType: String?` | `type: CampaignType` | Different field names |
| Budget | Flat properties | `budget: CampaignBudget` object | Web groups budget fields |
| Dates | `Date?` | `string` (ISO) | Different types |

### Application Status
- **iOS:** Uses `"accepted"` status
- **Web:** Uses `"approved"` status
- **Action:** Align on `"approved"`

---

## ✅ Well-Aligned Endpoints

These work consistently across both platforms:
- ✅ `GET /business/campaigns` - List campaigns
- ✅ `GET /business/campaigns/:id` - Campaign details
- ✅ `POST /business/campaigns` - Create campaign
- ✅ `DELETE /business/campaigns/:id` - Delete campaign
- ✅ `GET /business/campaigns/:id/metrics` - Metrics
- ✅ `GET /business/campaigns/:id/applications` - Applications
- ✅ `POST /business/campaigns/:id/applications/:id/reject` - Reject
- ✅ `GET /business/campaigns/:id/participants` - Participants

---

## 📋 Priority Action Items

### Week 1-2: Critical Fixes
1. Backend: Support both `/accept` and `/approve` endpoints
2. Backend: Ensure content submissions API endpoint exists
3. iOS: Migrate from Supabase to content submissions API

### Week 3-4: Feature Parity
4. iOS: Add duplicate campaign feature
5. iOS: Implement real visit history (remove mock data)
6. iOS: Add remove participant feature

### Week 5+: Standardization
7. iOS: Switch from PUT to PATCH
8. Both: Align status values ("approved" not "accepted")
9. Backend: Create OpenAPI specification
10. Both: Consider standardizing budget object structure

---

## 🎯 Recommended Endpoint Standard

```
GET    /api/business/campaigns
GET    /api/business/campaigns/:id
POST   /api/business/campaigns
PATCH  /api/business/campaigns/:id
DELETE /api/business/campaigns/:id
PATCH  /api/business/campaigns/:id/status

GET    /api/business/campaigns/:id/metrics
GET    /api/business/campaigns/:id/visits
GET    /api/business/campaigns/:id/activity

GET    /api/business/campaigns/:id/applications
POST   /api/business/campaigns/:id/applications/:id/approve
POST   /api/business/campaigns/:id/applications/:id/reject

GET    /api/business/campaigns/:id/participants
DELETE /api/business/campaigns/:id/participants/:id

GET    /api/business/campaigns/:id/content-submissions
PATCH  /api/business/campaigns/:id/content-submissions/:id/view
PATCH  /api/business/campaigns/:id/content-submissions/:id/approve

POST   /api/business/campaigns/:id/duplicate
POST   /api/business/campaigns/:id/invitations
```

---

## 📁 File References

**iOS:**
- APIService.swift (line 973+) - Campaign endpoints
- CampaignApplication.swift - Application model

**Web:**
- lib/api/campaigns.ts - Campaign API client
- lib/types/campaign.ts - TypeScript types
- lib/hooks/use-campaign-detail.ts - React Query hooks

**Full Report:** See `API_ENDPOINT_COMPARISON_REPORT.md` for detailed analysis
