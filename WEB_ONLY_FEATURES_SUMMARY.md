# Web-Only Features - Quick Reference

## Summary
The web app has **8 advanced features** that iOS does NOT have. All have been documented with inline code comments.

## Features List

### 1. Activity Timeline
- **File:** `components/campaigns/detail/overview-tab.tsx` (Lines 491-531)
- **Status:** Fully implemented (iOS has placeholder only)
- **Value:** High - Campaign history tracking

### 2. Charts (5 Types)
- **File:** `components/campaigns/detail/overview-tab.tsx` (Lines 258-343)
- **Types:** Attribution Pie, Visitor Traffic Line, Visits by Day Bar, Performance Bar, Hourly Activity
- **Status:** Fully implemented (iOS has none)
- **Value:** Very High - Data visualization

### 3. Top Performers Section
- **File:** `components/campaigns/detail/influencers-tab.tsx` (Lines 312-358)
- **Status:** Fully implemented (iOS has basic list only)
- **Value:** High - Ranked top 3 with medals

### 4. Export Participants
- **File:** `components/campaigns/detail/influencers-tab.tsx` (Lines 132-140, 385-390)
- **Status:** Partial (toast notification, needs full CSV)
- **Value:** Medium - Data export

### 5. Export Content
- **File:** `components/campaigns/detail/content-tab.tsx` (Lines 111-119, 268-277)
- **Status:** Partial (toast notification, needs full CSV)
- **Value:** Medium - Data export

### 6. Duplicate Campaign
- **File:** `app/(app)/campaigns/[id]/page.tsx` (Lines 96-113, 248-251)
- **Status:** Fully implemented
- **Value:** High - Power user feature

### 7. Pause/Resume Campaign
- **File:** `app/(app)/campaigns/[id]/page.tsx` (Lines 63-79, 236-247)
- **Status:** Fully implemented
- **Value:** High - Campaign lifecycle management

### 8. Archive Campaign
- **File:** `app/(app)/campaigns/[id]/page.tsx` (Lines 63-79, 253-257)
- **Status:** Fully implemented
- **Value:** Medium - Data organization

## Recommendation

**KEEP ALL FEATURES** - They are valuable and appropriate for the web platform.

- Document as "Web Premium Features"
- Add "Web Only" badges in UI
- Update user documentation
- Use as competitive advantage

## Code Documentation

All features marked with comments:
```typescript
/* WEB-ONLY FEATURE: [Feature Name] */
/* iOS does not have this feature - [explanation] */
```

## Files Modified

1. `/app/(app)/campaigns/[id]/page.tsx` - Duplicate, Pause/Resume, Archive
2. `/components/campaigns/detail/overview-tab.tsx` - Charts, Activity Timeline
3. `/components/campaigns/detail/influencers-tab.tsx` - Top Performers, Export
4. `/components/campaigns/detail/content-tab.tsx` - Export

## Philosophy

**Core features = Parity**
**Power user features = Can be platform-specific**

Web applications are EXPECTED to have more advanced features than mobile apps.

---

See `FEATURE_PARITY_ANALYSIS.md` for complete details.
