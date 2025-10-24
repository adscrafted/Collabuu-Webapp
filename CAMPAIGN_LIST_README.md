# Campaign List Page Implementation

This document outlines the comprehensive campaign list page implementation for the Collabuu webapp, matching the iOS app design exactly.

## Files Created

### 1. Types & Interfaces
**`/lib/types/campaign.ts`** (Enhanced)
- Added `CampaignStats` interface for list view metrics
- Added `CampaignWithStats` interface extending Campaign
- Added `CampaignFilters` interface for filtering/sorting
- Added `CampaignListResponse` interface for API responses

### 2. API Client
**`/lib/api/campaigns.ts`**
- `getCampaigns(filters?)` - Fetch campaigns with filters
- `getCampaign(id)` - Get single campaign
- `createCampaign(data)` - Create new campaign
- `updateCampaign(id, data)` - Update campaign
- `updateCampaignStatus(id, status)` - Update status only
- `deleteCampaign(id)` - Delete campaign
- `duplicateCampaign(id)` - Duplicate campaign

### 3. React Query Hooks
**`/lib/hooks/use-campaigns.ts`**
- `useCampaigns(filters)` - Query campaigns with filters
- `useCampaign(id)` - Query single campaign
- `useCreateCampaign()` - Create campaign mutation
- `useUpdateCampaign()` - Update campaign mutation
- `useUpdateCampaignStatus()` - Update status with optimistic updates
- `useDeleteCampaign()` - Delete campaign mutation
- `useDuplicateCampaign()` - Duplicate campaign mutation

### 4. Campaign Card Component
**`/components/campaigns/campaign-card.tsx`**
Features:
- Campaign image with fallback
- Campaign title (2-line truncation)
- Type badge (color-coded: Blue for Pay Per Customer, Green for Media Event, Amber for Loyalty)
- Status badge (Active, Paused, Draft, Completed, Cancelled)
- Expired indicator
- Metrics row (Participants, Visits, Credits)
- Credits progress bar with color coding
- Date range display
- Hover effect (lift with shadow)
- Click to navigate to campaign detail

### 5. Campaign Skeleton
**`/components/campaigns/campaign-skeleton.tsx`**
- Skeleton card matching campaign card layout
- Shimmer animation effect
- `CampaignListSkeleton` for multiple skeletons

### 6. Empty State Component
**`/components/campaigns/empty-state.tsx`**
- Two states: No campaigns vs No filtered results
- "Create Your First Campaign" CTA
- "Clear Filters" button for filtered state

### 7. Date Range Picker
**`/components/campaigns/date-range-picker.tsx`**
- Popover-based date range selector
- Uses react-day-picker Calendar component
- 2-month calendar view
- Displays selected range in button

### 8. Campaign Filters Bar
**`/components/campaigns/campaign-filters.tsx`**
Features:
- Search input with debounce (300ms)
- Status dropdown (All, Active, Paused, Draft, Completed, Cancelled)
- Type dropdown (All Types, Pay Per Customer, Media Event, Loyalty Reward)
- Sort dropdown (Newest, Oldest, Most Visits, End Date)
- Advanced filters toggle button with active count badge
- Collapsible date range picker
- Active filters display with individual remove buttons
- Clear all filters button

### 9. Campaign List Page
**`/app/(dashboard)/campaigns/page.tsx`**
Features:
- Page header with title, subtitle, and "Create Campaign" button
- Campaign filters bar
- Results summary showing count
- Campaign grid (3 columns on desktop, 2 on tablet, 1 on mobile)
- Loading skeleton states
- Empty state (filtered vs no campaigns)
- Pagination with page numbers
- Error state handling
- Smooth scroll to top on page change

### 10. Index Export
**`/components/campaigns/index.ts`**
- Centralized exports for easy importing

## Design System

### Color Scheme

#### Campaign Type Badges
- **Pay Per Customer**: Blue (#3B82F6) - `bg-blue-100 text-blue-700 border-blue-200`
- **Media Event**: Green (#10B981) - `bg-green-100 text-green-700 border-green-200`
- **Loyalty Reward**: Amber (#F59E0B) - `bg-amber-100 text-amber-700 border-amber-200`

#### Status Badges
- **Active**: Green (#10B981) - `bg-green-100 text-green-700 border-green-200`
- **Paused**: Amber (#F59E0B) - `bg-amber-100 text-amber-700 border-amber-200`
- **Draft**: Gray (#6B7280) - `bg-gray-100 text-gray-700 border-gray-200`
- **Completed**: Blue (#3B82F6) - `bg-blue-100 text-blue-700 border-blue-200`
- **Cancelled**: Red (#EF4444) - `bg-red-100 text-red-700 border-red-200`
- **Expired**: Red (#EF4444) - `bg-red-500 text-white border-red-600`

#### Progress Bar Colors
- 0-69%: Blue (#3B82F6)
- 70-89%: Amber (#F59E0B)
- 90-100%: Red (#EF4444)

### Responsive Breakpoints
- **Mobile**: < 768px (1 column)
- **Tablet**: 768px - 1024px (2 columns)
- **Desktop**: > 1024px (3 columns)

### Animations & Transitions
- Card hover: `-translate-y-1` with shadow elevation
- Image hover: `scale-105` transform
- Progress bar: `transition-all duration-300`
- Smooth scroll on pagination

## Features

### Filtering & Sorting
- **Status Filter**: Multi-select status filtering
- **Type Filter**: Single campaign type selection
- **Search**: Debounced search by title/description
- **Date Range**: Filter by campaign date range
- **Sort Options**: Newest, Oldest, Most Visits, End Date

### Pagination
- 20 items per page
- Smart page number display (max 5 buttons)
- Previous/Next navigation
- Disabled state for first/last pages
- Smooth scroll to top on page change

### Performance
- React Query for data fetching and caching
- 30-second stale time for campaign data
- Optimistic updates for status changes
- Automatic cache invalidation
- Loading skeletons for better UX

### User Experience
- Empty states with helpful CTAs
- Active filter badges with individual remove
- Results count display
- Expired campaign indicator
- Error state handling
- Responsive mobile-first design

## Usage

```tsx
import CampaignsPage from '@/app/(dashboard)/campaigns/page';

// The page is self-contained and requires no props
// It uses React Query to fetch data and manage state
```

## API Integration

The page expects the following API endpoints:

```typescript
GET /campaigns?status=ACTIVE,DRAFT&type=PAY_PER_CUSTOMER&search=keyword&startDate=2024-01-01&endDate=2024-12-31&sortBy=newest&page=1&limit=20

Response:
{
  campaigns: CampaignWithStats[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

## Dependencies

All dependencies are already included in package.json:
- `@tanstack/react-query` - Data fetching and state management
- `date-fns` - Date formatting and manipulation
- `react-day-picker` - Calendar component
- `lucide-react` - Icons
- `next` - Framework and routing
- `@radix-ui/*` - UI primitives (via shadcn/ui)

## Next Steps

To complete the campaign feature, you may want to add:
1. Campaign detail page (`/campaigns/[id]`)
2. Campaign creation flow (`/campaigns/create`)
3. Campaign edit functionality
4. Campaign duplicate functionality

## Notes

- All colors match the iOS app design exactly
- Component structure follows Next.js 14+ App Router conventions
- Uses shadcn/ui components for consistency
- Fully typed with TypeScript
- Responsive and accessible
- Production-ready code
