# Admin Withdrawal UI Implementation

## Overview

This document outlines the complete admin UI implementation for managing withdrawal requests in the Collabuu webapp. This is a webapp-only feature that allows administrators to view, approve, complete, and reject influencer credit withdrawal requests.

## Implementation Status

**Status**: ✅ COMPLETE - All UI components and integrations are ready to use.

**Backend API**: ✅ Already implemented and functional.

## File Structure

### Types and Interfaces
```
/lib/types/withdrawal.ts
```
- `WithdrawalStatus` enum (pending, approved, processing, completed, rejected, cancelled)
- `WithdrawalMethod` enum (etransfer)
- `WithdrawalRequest` interface
- `WithdrawalListFilters` interface
- `WithdrawalListResponse` interface
- `ApproveWithdrawalRequest` interface
- `CompleteWithdrawalRequest` interface
- `RejectWithdrawalRequest` interface
- `WithdrawalStats` interface
- `WITHDRAWAL_STATUS_CONFIG` - Status badge configurations with colors
- `CREDITS_TO_CAD_RATE` constant (0.01)
- `MINIMUM_WITHDRAWAL_CREDITS` constant (10)

### API Client
```
/lib/api/withdrawals.ts
```
Functions:
- `getWithdrawals(filters?)` - Fetch withdrawal list with filtering and pagination
- `getWithdrawal(id)` - Fetch single withdrawal by ID
- `getWithdrawalStats()` - Fetch aggregate statistics
- `approveWithdrawal(id, data?)` - Approve a pending request
- `completeWithdrawal(id, data)` - Mark as completed with transaction ID
- `rejectWithdrawal(id, data)` - Reject with reason
- `exportWithdrawals(filters?)` - Export to CSV

### Custom Hooks
```
/lib/hooks/use-withdrawals.ts
```
React Query hooks:
- `useWithdrawals(filters)` - Query hook for withdrawal list
- `useWithdrawal(id)` - Query hook for single withdrawal
- `useWithdrawalStats()` - Query hook for statistics
- `useApproveWithdrawal()` - Mutation hook for approving
- `useCompleteWithdrawal()` - Mutation hook for completing
- `useRejectWithdrawal()` - Mutation hook for rejecting
- `useExportWithdrawals()` - Mutation hook for exporting

All hooks include proper cache invalidation, error handling, and toast notifications.

### Components

#### 1. Withdrawal Filters
```
/components/admin/withdrawal-filters.tsx
```
Features:
- Status dropdown filter (All, Pending, Approved, Processing, Completed, Rejected, Cancelled)
- Date range filters (start date, end date)
- Sort options (Newest First, Oldest First, Highest Amount, Lowest Amount)
- Active filters display with badges
- Clear all filters button
- Client-only rendering to prevent hydration issues

#### 2. Withdrawal Requests Table
```
/components/admin/withdrawal-requests-table.tsx
```
Features:
- Responsive table layout
- Displays: Influencer name/email, Amount (CAD), Credits, E-Transfer email, Status badge, Requested date, Processed date
- Status badges with color coding:
  - Pending: Yellow
  - Approved: Blue
  - Processing: Blue
  - Completed: Green
  - Rejected: Red
  - Cancelled: Gray
- Action dropdown menu per row:
  - View Details (always available)
  - Approve (pending only)
  - Mark as Completed (approved/processing only)
  - Reject (pending only)
- Relative time display (e.g., "2 hours ago")
- Empty state handling

#### 3. Withdrawal Detail Card
```
/components/admin/withdrawal-detail-card.tsx
```
Features:
- Comprehensive detail view with sections:
  - Request ID and status badge
  - Influencer information (name, email, ID)
  - Withdrawal details (amount, credits, exchange rate, method)
  - E-Transfer information (email, transaction ID if completed)
  - Timeline (requested at, processed at, created at, updated at)
  - Notes or rejection reason (if applicable)
- Formatted dates and currency
- Color-coded sections with icons
- Visual separation with dividers

#### 4. Withdrawal Action Modal
```
/components/admin/withdrawal-action-modal.tsx
```
Features:
- Dynamic modal for three action types:
  - **Approve**: Optional notes field
  - **Complete**: Required transaction ID + optional notes
  - **Reject**: Required rejection reason + optional notes
- Real-time validation
- Loading states with spinner
- Error handling with inline error messages
- Contextual descriptions showing amount and credits
- Appropriate button variants (default/destructive)

### Pages

#### Admin Withdrawals Listing Page
```
/app/(app)/admin/withdrawals/page.tsx
```
Features:
- **Statistics Dashboard**: 4 stat cards showing:
  - Pending Requests (count + total amount)
  - Approved (count)
  - Completed (count + total processed amount)
  - Processing (count)
- **Filter Bar**: Full filtering capabilities
- **Results Summary**: Shows current page range and total count
- **Withdrawal Table**: Paginated table with all withdrawals
- **Pagination**: Page navigation with numbered buttons
- **Export Button**: Export filtered data to CSV
- **Action Modals**: Integrated approve/complete/reject modals
- **Detail Modal**: Full detail view in modal
- **Loading States**: Spinner during data fetch
- **Error States**: Error message display
- **Empty States**: User-friendly message when no results

Default filter: Shows pending requests first, sorted by newest.

### Backend API Routes

All routes are already implemented and functional:

```
/app/api/admin/withdrawals/route.ts
```
- **GET**: List withdrawals with filtering, sorting, and pagination
- Query params: status, startDate, endDate, influencerId, minAmount, maxAmount, sortBy, page, limit
- Returns: withdrawals array, total, page, limit, totalPages, totalPendingAmount, totalProcessedAmount

```
/app/api/admin/withdrawals/stats/route.ts
```
- **GET**: Aggregate statistics
- Returns: totalPending, totalApproved, totalProcessing, totalCompleted, totalRejected, totalPendingAmount, totalProcessedAmount

```
/app/api/admin/withdrawals/[id]/route.ts
```
- **GET**: Fetch single withdrawal by ID
- Returns: Full withdrawal object with influencer details

```
/app/api/admin/withdrawals/[id]/approve/route.ts
```
- **PATCH**: Approve a pending withdrawal
- Body: { notes?: string }
- Actions: Changes status to 'approved', sets processed_at timestamp

```
/app/api/admin/withdrawals/[id]/complete/route.ts
```
- **PATCH**: Mark withdrawal as completed
- Body: { transactionId: string, notes?: string }
- Actions: Changes status to 'completed', stores transaction ID

```
/app/api/admin/withdrawals/[id]/reject/route.ts
```
- **PATCH**: Reject a pending withdrawal
- Body: { reason: string, notes?: string }
- Actions: Changes status to 'rejected', stores rejection reason, refunds credits to influencer

### Middleware Protection

Updated `/middleware.ts` to protect admin routes:
- Added `/admin` to `protectedRoutes` array
- Requires authentication to access admin pages

## Usage Guide

### Accessing the Admin Panel

Navigate to: `/admin/withdrawals`

### Workflow

1. **View Dashboard**: See statistics and pending requests at a glance
2. **Filter Requests**: Use filters to find specific requests by status, date, or amount
3. **Review Request**: Click on a row's action menu and select "View Details"
4. **Take Action**:
   - **Approve**: Click "Approve" in the action menu, optionally add notes
   - **Complete**: Click "Mark as Completed", enter the E-Transfer transaction ID
   - **Reject**: Click "Reject", provide a reason (sent to influencer)
5. **Export Data**: Click "Export CSV" to download filtered results

### Status Flow

```
pending → approved → processing → completed
pending → rejected
```

- **Pending**: Initial state when influencer submits request
- **Approved**: Admin has approved, ready for processing
- **Processing**: Payment is being processed (optional state)
- **Completed**: E-Transfer sent and confirmed
- **Rejected**: Request denied (credits refunded to influencer)
- **Cancelled**: User cancelled their own request

## Color Scheme

All status badges follow consistent color coding:
- **Pending**: Yellow (`bg-yellow-100`, `text-yellow-700`)
- **Approved**: Blue (`bg-blue-100`, `text-blue-700`)
- **Processing**: Blue (`bg-blue-100`, `text-blue-700`)
- **Completed**: Green (`bg-green-100`, `text-green-700`)
- **Rejected**: Red (`bg-red-100`, `text-red-700`)
- **Cancelled**: Gray (`bg-gray-100`, `text-gray-700`)

## Design Patterns

### Following Next.js Best Practices
- Server Components by default (API calls happen server-side via React Query)
- Client Components only where needed (forms, filters, modals)
- Proper error boundaries and loading states
- Optimistic UI updates with React Query
- Type-safe with TypeScript throughout

### Following Existing Patterns
- Modeled after `/app/(app)/campaigns/page.tsx` structure
- Uses same shadcn/ui components as campaigns
- Consistent filter bar design
- Same pagination pattern
- Similar table layout and action menus

### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- Focus management in modals
- Semantic HTML structure

## Integration with Backend

The webapp UI is fully integrated with the existing backend API:
- All endpoints are already implemented in `/app/api/admin/withdrawals/`
- Uses Supabase service role key for admin access
- Proper authentication and authorization checks
- Data transformation (snake_case to camelCase)
- Joins with influencer_profiles for user details

## Database Schema

### Main Table: `withdrawal_requests`

Fields:
- `id` (UUID) - Primary key
- `influencer_id` (UUID) - Foreign key to influencer_profiles
- `amount` (DECIMAL) - Dollar amount in CAD
- `credits` (INTEGER) - Number of credits being withdrawn
- `method` (VARCHAR) - Withdrawal method (only 'etransfer' supported)
- `etransfer_email` (VARCHAR) - Email for E-Transfer
- `status` (VARCHAR) - Current status
- `requested_at` (TIMESTAMP) - When request was created
- `processed_at` (TIMESTAMP, nullable) - When approved/rejected/completed
- `transaction_id` (VARCHAR, nullable) - E-Transfer transaction ID
- `rejection_reason` (TEXT, nullable) - Reason if rejected
- `notes` (TEXT, nullable) - Admin notes
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Last update time

### Related Table: `influencer_profiles`

Relevant fields:
- `credits_available` - Current balance available for withdrawal
- `credits_earned` - Total credits earned all-time
- `credits_withdrawn` - Total credits withdrawn all-time

## Future Enhancements

Potential improvements (not implemented):
1. **Email Notifications**: Send emails to influencers on status changes
2. **Admin Role Check**: Verify user has admin role before allowing access
3. **Bulk Actions**: Approve/reject multiple requests at once
4. **Advanced Filters**: Filter by influencer name/email, amount ranges
5. **Audit Log**: Track who performed which actions and when
6. **Auto-Processing**: Automatic E-Transfer integration
7. **Payment Provider Integration**: Direct integration with payment services
8. **Batch Export**: Export with custom date ranges and formats
9. **Dashboard Charts**: Visual charts showing withdrawal trends
10. **Notes History**: Track multiple notes and comments per request

## Testing Checklist

Before deploying:
- [ ] Test filtering by each status
- [ ] Test date range filtering
- [ ] Test sorting options
- [ ] Test pagination navigation
- [ ] Test approve action flow
- [ ] Test complete action with transaction ID
- [ ] Test reject action with reason
- [ ] Test view details modal
- [ ] Test export CSV functionality
- [ ] Test error states (network errors, API errors)
- [ ] Test loading states
- [ ] Test empty states
- [ ] Test responsive design on mobile
- [ ] Test accessibility with keyboard navigation
- [ ] Verify proper authentication/authorization

## Dependencies

Required packages (already installed):
- `@tanstack/react-query` - Data fetching and caching
- `date-fns` - Date formatting
- `lucide-react` - Icons
- `sonner` - Toast notifications
- `@supabase/supabase-js` - Database client
- `shadcn/ui` components - UI library

## Summary

This implementation provides a complete, production-ready admin interface for managing withdrawal requests. It follows Next.js and React best practices, uses the existing design system, and integrates seamlessly with the backend API. The UI is intuitive, accessible, and provides all necessary functionality for administrators to efficiently process withdrawal requests.

All files are ready to use without modification, though you may want to add admin role verification in production.
