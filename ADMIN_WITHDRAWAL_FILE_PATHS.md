# Admin Withdrawal UI - File Paths Reference

## Complete List of Created/Modified Files

### Types and Data Models
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/lib/types/withdrawal.ts`

### API Integration
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/lib/api/withdrawals.ts`

### Custom React Hooks
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/lib/hooks/use-withdrawals.ts`

### UI Components
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/components/admin/withdrawal-filters.tsx`
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/components/admin/withdrawal-requests-table.tsx`
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/components/admin/withdrawal-detail-card.tsx`
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/components/admin/withdrawal-action-modal.tsx`

### Pages
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/app/(app)/admin/withdrawals/page.tsx`

### Backend API Routes (Already Existed)
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/app/api/admin/withdrawals/route.ts`
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/app/api/admin/withdrawals/stats/route.ts` (NEW)
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/app/api/admin/withdrawals/[id]/route.ts`
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/app/api/admin/withdrawals/[id]/approve/route.ts`
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/app/api/admin/withdrawals/[id]/complete/route.ts`
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/app/api/admin/withdrawals/[id]/reject/route.ts`

### Configuration
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/middleware.ts` (MODIFIED - added /admin to protected routes)

### Documentation
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/ADMIN_WITHDRAWAL_UI_IMPLEMENTATION.md`
- `/Users/anthony/Documents/Projects/Collabuu-Webapp/ADMIN_WITHDRAWAL_FILE_PATHS.md` (this file)

## Component Structure

```
components/admin/
├── withdrawal-filters.tsx           (Filter bar with status, date, sort)
├── withdrawal-requests-table.tsx    (Main table with actions)
├── withdrawal-detail-card.tsx       (Detail view card)
└── withdrawal-action-modal.tsx      (Approve/Complete/Reject modal)
```

## Page Structure

```
app/(app)/admin/withdrawals/
└── page.tsx                         (Main admin page with stats cards)
```

## API Structure

```
app/api/admin/withdrawals/
├── route.ts                         (GET list)
├── stats/
│   └── route.ts                     (GET stats)
└── [id]/
    ├── route.ts                     (GET single)
    ├── approve/
    │   └── route.ts                 (PATCH approve)
    ├── complete/
    │   └── route.ts                 (PATCH complete)
    └── reject/
        └── route.ts                 (PATCH reject)
```

## Quick Navigation

### To modify UI layout:
- Main page: `app/(app)/admin/withdrawals/page.tsx`
- Table component: `components/admin/withdrawal-requests-table.tsx`

### To modify filters:
- Filter component: `components/admin/withdrawal-filters.tsx`

### To modify action modals:
- Action modal: `components/admin/withdrawal-action-modal.tsx`

### To modify data types:
- Types file: `lib/types/withdrawal.ts`

### To modify API calls:
- API client: `lib/api/withdrawals.ts`
- React hooks: `lib/hooks/use-withdrawals.ts`

### To modify backend logic:
- List endpoint: `app/api/admin/withdrawals/route.ts`
- Stats endpoint: `app/api/admin/withdrawals/stats/route.ts`
- Action endpoints: `app/api/admin/withdrawals/[id]/{approve,complete,reject}/route.ts`

## Total File Count

- **Created**: 10 new files
- **Modified**: 2 existing files (middleware.ts, withdrawal types)
- **Backend APIs**: 7 route files (6 existed, 1 new stats endpoint)

## Access URL

Admin withdrawal management page: `http://localhost:3000/admin/withdrawals`

Production URL: `https://yourdomain.com/admin/withdrawals`
