# Withdrawal Management API Documentation

This document describes the backend API endpoints for the admin withdrawal management system.

## Base URL

All endpoints are prefixed with `/api/admin/withdrawals`

## Authentication

All endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### 1. List Withdrawal Requests

**GET** `/api/admin/withdrawals`

Retrieve a paginated list of withdrawal requests with optional filtering.

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `status` | string | Filter by status (comma-separated for multiple) | all |
| `startDate` | string | Filter by requested_at >= startDate (ISO string) | - |
| `endDate` | string | Filter by requested_at <= endDate (ISO string) | - |
| `influencerId` | string | Filter by specific influencer UUID | - |
| `minAmount` | number | Minimum amount filter (CAD) | - |
| `maxAmount` | number | Maximum amount filter (CAD) | - |
| `sortBy` | string | Sort order: `newest`, `oldest`, `amount_high`, `amount_low` | newest |
| `page` | number | Page number | 1 |
| `limit` | number | Results per page | 20 |

#### Response

```json
{
  "withdrawals": [
    {
      "id": "uuid",
      "influencerId": "uuid",
      "influencerName": "John Doe",
      "influencerEmail": "john@example.com",
      "influencerAvatar": "https://...",
      "amount": 25.50,
      "credits": 2550,
      "method": "etransfer",
      "etransferEmail": "john@example.com",
      "status": "pending",
      "requestedAt": "2025-01-15T10:30:00Z",
      "processedAt": null,
      "transactionId": null,
      "rejectionReason": null,
      "notes": null,
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3,
  "totalPendingAmount": 1250.75,
  "totalProcessedAmount": 8540.00
}
```

---

### 2. Get Withdrawal Details

**GET** `/api/admin/withdrawals/[id]`

Retrieve details of a specific withdrawal request.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Withdrawal request UUID |

#### Response

```json
{
  "id": "uuid",
  "influencerId": "uuid",
  "influencerName": "John Doe",
  "influencerEmail": "john@example.com",
  "influencerAvatar": "https://...",
  "amount": 25.50,
  "credits": 2550,
  "method": "etransfer",
  "etransferEmail": "john@example.com",
  "status": "pending",
  "requestedAt": "2025-01-15T10:30:00Z",
  "processedAt": null,
  "transactionId": null,
  "rejectionReason": null,
  "notes": null,
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

#### Error Responses

- `404 Not Found` - Withdrawal request not found
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Server error

---

### 3. Approve Withdrawal

**PATCH** `/api/admin/withdrawals/[id]/approve`

Approve a pending withdrawal request.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Withdrawal request UUID |

#### Request Body

```json
{
  "notes": "Approved for processing" // optional
}
```

#### Response

```json
{
  "id": "uuid",
  "status": "approved",
  "processedAt": "2025-01-15T11:00:00Z",
  "notes": "Approved for processing",
  // ... other fields
}
```

#### Validation Rules

- Withdrawal must be in `pending` status
- Only pending withdrawals can be approved

#### Error Responses

- `400 Bad Request` - Cannot approve withdrawal with current status
- `404 Not Found` - Withdrawal request not found
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Server error

---

### 4. Complete Withdrawal

**PATCH** `/api/admin/withdrawals/[id]/complete`

Mark a withdrawal as completed with transaction ID.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Withdrawal request UUID |

#### Request Body

```json
{
  "transactionId": "TXN123456789", // required
  "notes": "E-transfer sent successfully" // optional
}
```

#### Response

```json
{
  "id": "uuid",
  "status": "completed",
  "transactionId": "TXN123456789",
  "processedAt": "2025-01-15T11:30:00Z",
  "notes": "E-transfer sent successfully",
  // ... other fields
}
```

#### Validation Rules

- Withdrawal must be in `approved` or `processing` status
- `transactionId` is required and cannot be empty
- Transaction ID is typically the e-transfer confirmation number

#### Error Responses

- `400 Bad Request` - Missing transaction ID or invalid status
- `404 Not Found` - Withdrawal request not found
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Server error

---

### 5. Reject Withdrawal

**PATCH** `/api/admin/withdrawals/[id]/reject`

Reject a pending withdrawal request with a reason.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Withdrawal request UUID |

#### Request Body

```json
{
  "reason": "Insufficient verification", // required
  "notes": "Please complete profile verification" // optional
}
```

#### Response

```json
{
  "id": "uuid",
  "status": "rejected",
  "rejectionReason": "Insufficient verification",
  "processedAt": "2025-01-15T11:00:00Z",
  "notes": "Please complete profile verification",
  // ... other fields
}
```

#### Validation Rules

- Withdrawal must be in `pending` status
- `reason` is required and cannot be empty
- Credits are automatically refunded to the influencer's balance

#### Error Responses

- `400 Bad Request` - Missing reason or invalid status
- `404 Not Found` - Withdrawal request not found
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Server error

---

## Withdrawal Status Flow

```
pending → approved → processing → completed
   ↓
rejected
```

### Status Definitions

- **pending**: Initial status when withdrawal is requested
- **approved**: Admin has approved the withdrawal
- **processing**: Payment is being processed (optional intermediate state)
- **completed**: Payment has been sent and transaction ID recorded
- **rejected**: Withdrawal was rejected (credits refunded)
- **cancelled**: User cancelled the withdrawal (not used in admin API)

---

## Database Schema

### Table: `withdrawal_requests`

```sql
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  credits INTEGER NOT NULL,
  method VARCHAR(50) NOT NULL DEFAULT 'etransfer',
  etransfer_email VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  transaction_id VARCHAR(255),
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "error": "Error message",
  "details": "Detailed error description (optional)"
}
```

### HTTP Status Codes

- `200 OK` - Request successful
- `400 Bad Request` - Invalid request parameters or validation error
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions (admin role required)
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Implementation Details

### Supabase Integration

- Uses service role key for admin-level access
- JWT token verification for authentication
- Joins with user table to fetch influencer details
- Uses RPC function `increment_influencer_credits` for credit refunds

### Key Transformations

- Database fields (snake_case) are transformed to camelCase for frontend
- Influencer details are enriched from joined user table
- Aggregate statistics are calculated for list view

### TODO Items

1. **Admin Role Verification**: Currently allows all authenticated users. Add role-based access control:
   ```typescript
   if (user.user_metadata.role !== 'admin') {
     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
   }
   ```

2. **Notifications**: Implement notification system for:
   - Approval notifications
   - Completion notifications with transaction ID
   - Rejection notifications with reason

3. **Audit Logging**: Add audit trail for admin actions

4. **Rate Limiting**: Implement rate limiting for API endpoints

---

## Example Usage

### Using the Client API

```typescript
import { withdrawalsApi } from '@/lib/api/withdrawals';

// List withdrawals with filters
const response = await withdrawalsApi.getWithdrawals({
  status: ['pending', 'approved'],
  sortBy: 'newest',
  page: 1,
  limit: 20,
});

// Get specific withdrawal
const withdrawal = await withdrawalsApi.getWithdrawal('uuid');

// Approve withdrawal
const approved = await withdrawalsApi.approveWithdrawal('uuid', {
  notes: 'Approved for processing',
});

// Complete withdrawal
const completed = await withdrawalsApi.completeWithdrawal('uuid', {
  transactionId: 'TXN123456789',
  notes: 'E-transfer sent',
});

// Reject withdrawal
const rejected = await withdrawalsApi.rejectWithdrawal('uuid', {
  reason: 'Insufficient verification',
  notes: 'Please complete KYC',
});
```

---

## Testing

### Manual Testing with cURL

```bash
# List withdrawals
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/admin/withdrawals?status=pending&page=1&limit=10"

# Get withdrawal details
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/admin/withdrawals/<id>"

# Approve withdrawal
curl -X PATCH \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"notes":"Approved"}' \
  "http://localhost:3000/api/admin/withdrawals/<id>/approve"

# Complete withdrawal
curl -X PATCH \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"transactionId":"TXN123","notes":"Sent"}' \
  "http://localhost:3000/api/admin/withdrawals/<id>/complete"

# Reject withdrawal
curl -X PATCH \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Invalid account","notes":"Check details"}' \
  "http://localhost:3000/api/admin/withdrawals/<id>/reject"
```
