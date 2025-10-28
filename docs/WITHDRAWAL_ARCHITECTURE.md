# Withdrawal Management System Architecture

## System Overview

The withdrawal management system allows administrators to process influencer withdrawal requests through a secure, auditable backend API.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Frontend Layer                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Admin Dashboard (Future)                                            │
│  └─ Withdrawal List Component                                        │
│  └─ Withdrawal Detail Component                                      │
│  └─ Action Buttons (Approve/Complete/Reject)                         │
│                                                                       │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ HTTP Requests (Bearer Token)
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│                      Client API Layer                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  /lib/api/withdrawals.ts                                             │
│  ├─ getWithdrawals(filters)                                          │
│  ├─ getWithdrawal(id)                                                │
│  ├─ approveWithdrawal(id, data)                                      │
│  ├─ completeWithdrawal(id, data)                                     │
│  └─ rejectWithdrawal(id, data)                                       │
│                                                                       │
│  /lib/api/client.ts (axios instance with auth interceptors)          │
│                                                                       │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ REST API Calls
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│                      API Route Layer                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  /app/api/admin/withdrawals/                                         │
│                                                                       │
│  GET    /                     → List withdrawals with filters        │
│  GET    /[id]                 → Get withdrawal details               │
│  PATCH  /[id]/approve         → Approve withdrawal                   │
│  PATCH  /[id]/complete        → Complete with transaction ID         │
│  PATCH  /[id]/reject          → Reject with reason                   │
│                                                                       │
│  Each endpoint:                                                       │
│  ├─ Validates JWT token                                              │
│  ├─ Verifies admin permissions (TODO)                                │
│  ├─ Validates request data                                           │
│  ├─ Processes business logic                                         │
│  └─ Returns transformed response                                     │
│                                                                       │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ Supabase Client (Service Role)
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│                      Database Layer                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Supabase PostgreSQL                                                 │
│                                                                       │
│  withdrawal_requests                                                 │
│  ├─ id (uuid, PK)                                                    │
│  ├─ influencer_id (uuid, FK → users)                                 │
│  ├─ amount (decimal)                                                 │
│  ├─ credits (integer)                                                │
│  ├─ method (varchar)                                                 │
│  ├─ etransfer_email (varchar)                                        │
│  ├─ status (varchar)                                                 │
│  ├─ requested_at (timestamp)                                         │
│  ├─ processed_at (timestamp)                                         │
│  ├─ transaction_id (varchar)                                         │
│  ├─ rejection_reason (text)                                          │
│  └─ notes (text)                                                     │
│                                                                       │
│  users (influencers)                                                 │
│  ├─ id (uuid, PK)                                                    │
│  ├─ name (varchar)                                                   │
│  ├─ email (varchar)                                                  │
│  └─ avatar_url (varchar)                                             │
│                                                                       │
│  RPC Functions:                                                       │
│  └─ increment_influencer_credits(p_influencer_id, p_credits)         │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. List Withdrawals Flow

```
User → Client API → GET /api/admin/withdrawals?status=pending
                    ├─ Verify JWT token
                    ├─ Parse query filters
                    ├─ Build Supabase query
                    ├─ Join with users table
                    ├─ Apply filters & pagination
                    ├─ Calculate aggregate stats
                    ├─ Transform to camelCase
                    └─ Return paginated response

Response: {
  withdrawals: [...],
  total, page, limit, totalPages,
  totalPendingAmount, totalProcessedAmount
}
```

### 2. Approve Withdrawal Flow

```
Admin → Client API → PATCH /api/admin/withdrawals/{id}/approve
                     ├─ Verify JWT token
                     ├─ Verify admin role (TODO)
                     ├─ Fetch current withdrawal
                     ├─ Validate status = 'pending'
                     ├─ Update status to 'approved'
                     ├─ Set processed_at timestamp
                     ├─ Add optional notes
                     ├─ Fetch updated with influencer data
                     ├─ Transform to camelCase
                     ├─ Send notification (TODO)
                     └─ Return updated withdrawal

Status: pending → approved
```

### 3. Complete Withdrawal Flow

```
Admin → Client API → PATCH /api/admin/withdrawals/{id}/complete
                     ├─ Verify JWT token
                     ├─ Verify admin role (TODO)
                     ├─ Validate transactionId (required)
                     ├─ Fetch current withdrawal
                     ├─ Validate status = 'approved' | 'processing'
                     ├─ Update status to 'completed'
                     ├─ Set transaction_id
                     ├─ Update processed_at timestamp
                     ├─ Add optional notes
                     ├─ Fetch updated with influencer data
                     ├─ Transform to camelCase
                     ├─ Send notification (TODO)
                     └─ Return updated withdrawal

Status: approved/processing → completed
```

### 4. Reject Withdrawal Flow

```
Admin → Client API → PATCH /api/admin/withdrawals/{id}/reject
                     ├─ Verify JWT token
                     ├─ Verify admin role (TODO)
                     ├─ Validate reason (required)
                     ├─ Fetch current withdrawal
                     ├─ Validate status = 'pending'
                     ├─ Update status to 'rejected'
                     ├─ Set rejection_reason
                     ├─ Set processed_at timestamp
                     ├─ Add optional notes
                     ├─ Refund credits to influencer
                     │  └─ Call RPC: increment_influencer_credits()
                     ├─ Fetch updated with influencer data
                     ├─ Transform to camelCase
                     ├─ Send notification (TODO)
                     └─ Return updated withdrawal

Status: pending → rejected
Credits: Refunded to influencer balance
```

## Security Model

### Authentication

```typescript
// All endpoints verify JWT token
const authHeader = request.headers.get('authorization');
const token = authHeader.substring(7); // Remove "Bearer "
const { data: { user }, error } = await supabase.auth.getUser(token);
```

### Authorization (TODO)

```typescript
// Admin role verification needed
if (user.user_metadata.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Data Access

- Service role key used for database access
- Row-level security policies (if implemented)
- Audit logging for admin actions (TODO)

## Error Handling Strategy

### Client-Side Errors (400-499)

- `400 Bad Request`: Validation errors, invalid state transitions
- `401 Unauthorized`: Missing/invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found

### Server-Side Errors (500-599)

- `500 Internal Server Error`: Database errors, unexpected failures
- Detailed error logging to console
- User-friendly error messages in response

## Scaling Considerations

### Current Implementation

- Direct database queries via Supabase client
- Synchronous request processing
- No caching layer
- No rate limiting

### Future Optimizations

1. **Caching**: Redis for frequently accessed data
2. **Batch Processing**: Queue system for bulk operations
3. **Rate Limiting**: Prevent abuse of admin endpoints
4. **Database Indexing**:
   - Index on `status` column
   - Index on `requested_at` for date filtering
   - Composite index on `influencer_id + status`

## Type System

### TypeScript Types

```typescript
// /lib/types/withdrawal.ts
export enum WithdrawalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export interface WithdrawalRequest {
  id: string;
  influencerId: string;
  influencerName?: string;
  influencerEmail?: string;
  amount: number; // CAD
  credits: number;
  method: WithdrawalMethod;
  etransferEmail: string;
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
  transactionId?: string;
  rejectionReason?: string;
  notes?: string;
}
```

### Validation Schemas

```typescript
// /lib/validation/withdrawal-schema.ts
export const completeWithdrawalSchema = z.object({
  transactionId: z.string().min(1).max(255),
  notes: z.string().optional(),
});

export const rejectWithdrawalSchema = z.object({
  reason: z.string().min(1).max(500),
  notes: z.string().optional(),
});
```

## Key Transformations

### Database → API Response

```typescript
// Snake case → Camel case transformation
const transformed = transformKeysToCamelCase(withdrawal);

// Enrich with joined user data
const enriched = {
  ...transformed,
  influencerName: withdrawal.influencer?.name,
  influencerEmail: withdrawal.influencer?.email,
  influencerAvatar: withdrawal.influencer?.avatar_url,
};
```

## Integration Points

### Notification System (TODO)

```typescript
// After approval
await notificationService.send({
  userId: withdrawal.influencerId,
  type: 'withdrawal_approved',
  data: { withdrawalId: withdrawal.id },
});

// After completion
await notificationService.send({
  userId: withdrawal.influencerId,
  type: 'withdrawal_completed',
  data: {
    withdrawalId: withdrawal.id,
    transactionId: withdrawal.transactionId,
  },
});

// After rejection
await notificationService.send({
  userId: withdrawal.influencerId,
  type: 'withdrawal_rejected',
  data: {
    withdrawalId: withdrawal.id,
    reason: withdrawal.rejectionReason,
  },
});
```

### Audit Logging (TODO)

```typescript
await auditLog.create({
  actor: user.id,
  action: 'withdrawal.approved',
  resource: 'withdrawal',
  resourceId: withdrawal.id,
  metadata: {
    previousStatus: 'pending',
    newStatus: 'approved',
    notes: data.notes,
  },
});
```

## Testing Strategy

### Unit Tests

- Validate business logic in isolation
- Mock Supabase client responses
- Test error handling paths

### Integration Tests

- Test full API endpoint flow
- Verify database state changes
- Test authentication/authorization

### Manual Testing

- Admin dashboard UI testing
- E2E workflow testing
- Edge case validation

## Deployment Considerations

1. **Environment Variables**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **Database Migrations**
   - Ensure `withdrawal_requests` table exists
   - Create necessary indexes
   - Set up RPC functions

3. **Monitoring**
   - Track API response times
   - Monitor error rates
   - Alert on failed withdrawals

4. **Rollback Plan**
   - Database backups before deployment
   - API versioning for breaking changes
   - Feature flags for gradual rollout
