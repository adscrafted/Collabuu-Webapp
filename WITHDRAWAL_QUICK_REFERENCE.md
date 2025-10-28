# Withdrawal System - Quick Reference

## Database Table

**Table Name**: `withdrawal_requests`

**Key Fields**:
- `id` (UUID) - Primary key
- `influencer_id` (UUID) - User making request
- `amount` (DECIMAL) - Dollar amount in CAD
- `credits` (INTEGER) - Number of credits
- `method` (VARCHAR) - "etransfer" only
- `etransfer_email` (VARCHAR) - Where e-Transfer is sent
- `status` (VARCHAR) - pending, approved, processing, completed, rejected, cancelled
- `requested_at` (TIMESTAMP) - Request time
- `processed_at` (TIMESTAMP, nullable) - When approved/rejected
- `transaction_id` (VARCHAR, nullable) - E-Transfer ID
- `rejection_reason` (TEXT, nullable) - If rejected

**Related Table**: `influencer_profiles`
- `credits_available` - Can withdraw
- `credits_earned` - Total earned
- `credits_withdrawn` - Total withdrawn

---

## Status Values

```
pending    → Initial submission
approved   → Admin approved
processing → Being processed
completed  → Successfully paid
rejected   → Admin rejected
cancelled  → User cancelled
```

---

## API Endpoints

### Influencer (Implemented ✓)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/influencer/credits/withdraw` | Submit withdrawal request |
| GET | `/influencer/credits/withdrawal-history` | Get all withdrawals |
| GET | `/influencer/credits/balance` | Get credit balance |

### Admin (NOT Implemented ✗)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/business/withdrawals` | List requests |
| POST | `/business/withdrawals/:id/approve` | Approve |
| POST | `/business/withdrawals/:id/reject` | Reject |
| POST | `/business/withdrawals/:id/complete` | Mark complete |

---

## Validation Rules

- Minimum: 10 credits ($0.10 CAD)
- Maximum: Available balance
- Email: Valid format required
- Credits not deducted until approved
- Pending withdrawals reduce available balance

---

## Key Files

### iOS App

| File | Purpose |
|------|---------|
| `Influencer/Pages/Profile/Views/WithdrawCreditsView.swift` | Balance display |
| `Influencer/Pages/Profile/Views/WithdrawalSubmissionView.swift` | Form |
| `Influencer/Pages/Profile/ViewModels/WithdrawCreditsViewModel.swift` | Balance logic |
| `Influencer/Pages/Profile/ViewModels/WithdrawalSubmissionViewModel.swift` | Form logic |
| `Business/Pages/Admin/Views/WithdrawalRequestsView.swift` | Admin UI |
| `Business/Pages/Admin/ViewModels/WithdrawalRequestsViewModel.swift` | Admin logic (mock) |

### Backend

| File | Purpose |
|------|---------|
| `src/api/routes/influencer.ts` (lines 3551-3700) | Withdrawal endpoints |
| `src/services/emailService.ts` | Email service (needs withdrawal templates) |

### Shared

| File | Purpose |
|------|---------|
| `Shared/Services/APIService.swift` | Withdrawal models & API calls |

---

## Data Models

### WithdrawalRecord (Frontend)
```swift
struct WithdrawalRecord {
    let id: String
    let amount: Double           // CAD
    let credits: Int
    let method: WithdrawalMethod // enum: etransfer
    let status: WithdrawalStatus // enum
    let etransferEmail: String
    let requestedDate: Date
    let processedDate: Date?
    let transactionId: String?
    let notes: String?
    let rejectionReason: String?
}
```

### WithdrawalRequest (Admin)
```swift
struct WithdrawalRequest {
    let id: String
    let influencerId: String
    let influencerName: String
    let amount: Double
    let credits: Int
    let status: WithdrawalStatus
    let etransferEmail: String
    let requestedDate: Date
    let processedDate: Date?
    let transactionId: String?
    let rejectionReason: String?
}
```

---

## Workflow

### User Flow
1. User views balance in `WithdrawCreditsView`
2. Clicks "Request Withdrawal"
3. Enters amount & email in `WithdrawalSubmissionView`
4. Form validates (real-time)
5. Submits via `POST /influencer/credits/withdraw`
6. View history in `WithdrawCreditsView`

### Admin Flow (Not implemented)
1. Admin sees pending requests
2. Can approve, reject, or mark complete
3. Sends e-Transfer with transaction ID
4. Updates status to "completed"

---

## Exchange Rate

- 1 credit = $0.01 CAD (fixed)
- 10 credits = $0.10 CAD (minimum)
- 1000 credits = $10.00 CAD

---

## Email Integration

**Service**: Resend
**Status**: Infrastructure ready, withdrawal templates needed
**Templates Needed**:
- Request confirmation
- Approval notification
- Rejection notification  
- Completion notification

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Admin endpoints missing | Need to implement 4 endpoints in business.ts |
| No email notifications | Add templates to emailService.ts |
| Admin UI shows mock data | Connect to real API when implemented |
| No audit trail | Add logging to admin endpoints |

---

## Implementation Checklist

- [x] Database table
- [x] iOS user UI
- [x] iOS user ViewModel
- [x] Backend withdrawal endpoint
- [x] Backend history endpoint
- [x] Balance calculations
- [x] iOS admin UI (with mock data)
- [ ] Admin API endpoints
- [ ] Email notifications
- [ ] Webapp integration
- [ ] Audit logging

