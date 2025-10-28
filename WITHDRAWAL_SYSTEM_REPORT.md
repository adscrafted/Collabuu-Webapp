# Collabuu iOS App Withdrawal System - Comprehensive Report

## Executive Summary

The Collabuu platform implements a complete withdrawal/payout system for influencers. The system allows influencers to request withdrawals of their earned credits via Interac e-Transfer (Canada). The infrastructure includes a database table, iOS UI components, backend API endpoints, and admin management capabilities.

---

## 1. DATABASE TABLE SCHEMA

### Table: `withdrawal_requests`

**Location**: Supabase PostgreSQL database

**Purpose**: Stores all withdrawal requests from influencers with complete transaction history and status tracking.

#### Field Definitions

| Field Name | Type | Nullable | Description |
|---|---|---|---|
| `id` | UUID | NO | Primary key, auto-generated |
| `influencer_id` | UUID | NO | Foreign key to users table (influencer) |
| `amount` | DECIMAL(10,2) | NO | Dollar amount (CAD) of withdrawal |
| `credits` | INTEGER | NO | Number of credits being withdrawn (1 credit = $0.01 CAD) |
| `method` | VARCHAR | NO | Withdrawal method (currently only "etransfer") |
| `etransfer_email` | VARCHAR | NO | Email address where e-Transfer will be sent |
| `status` | VARCHAR | NO | Current status of withdrawal request |
| `requested_at` | TIMESTAMP | NO | When the withdrawal was requested |
| `processed_at` | TIMESTAMP | YES | When the withdrawal was processed (approved/rejected) |
| `transaction_id` | VARCHAR | YES | E-Transfer transaction ID (set when completed) |
| `rejection_reason` | TEXT | YES | Reason for rejection (if rejected) |
| `notes` | TEXT | YES | Admin notes about the request |

#### Calculated/Referenced Fields

The system also tracks credit balances in the `influencer_profiles` table:

| Field Name | Type | Description |
|---|---|---|
| `credits_available` | INTEGER | Credits available for withdrawal (not pending) |
| `credits_earned` | INTEGER | Total credits earned from campaigns |
| `credits_withdrawn` | INTEGER | Total credits successfully withdrawn |

---

## 2. STATUS VALUES & WORKFLOW

### Withdrawal Status Enum

```swift
enum WithdrawalStatus: String, CaseIterable, Codable, Sendable {
    case pending = "pending"        // Initial state when submitted
    case approved = "approved"      // Admin approved the request
    case processing = "processing"  // Being processed for payment
    case completed = "completed"    // Successfully paid via e-Transfer
    case rejected = "rejected"      // Admin rejected the request
    case cancelled = "cancelled"    // User or system cancelled
}
```

#### Status Transition Diagram

```
[Submitted] → pending
                  ↓
            [Admin Review]
           ↙           ↘
    approved       rejected (with reason)
        ↓
    processing
        ↓
    completed (with transaction_id)
```

---

## 3. WITHDRAWAL FLOW & CURRENT WORKFLOW

### 3.1 User-Facing Flow (Influencer)

**Step 1: View Available Balance**
- Location: iOS `WithdrawCreditsView`
- Displays:
  - Total available credits for withdrawal
  - Approximate CAD value ($0.01 per credit)
  - Pending withdrawal requests (if any)
  - Total balance breakdown

**Step 2: Initiate Withdrawal Request**
- Location: iOS `WithdrawalSubmissionView`
- User provides:
  - Amount in credits (minimum 10 credits = $0.10)
  - E-Transfer email address
- Validation:
  - Amount must be ≥ 10 credits
  - Amount cannot exceed available balance
  - Valid email format required
  - Cannot exceed currently available credits (accounting for pending withdrawals)

**Step 3: Submit Request**
- API Call: `POST /influencer/credits/withdraw`
- Request Body:
  ```json
  {
    "amount": 100,              // credits
    "method": "etransfer",
    "etransferEmail": "user@example.com"
  }
  ```
- Response on Success:
  ```json
  {
    "success": true,
    "message": "Withdrawal request submitted successfully",
    "withdrawalId": "uuid"
  }
  ```

**Step 4: View History**
- API Call: `GET /influencer/credits/withdrawal-history`
- Returns array of `WithdrawalRecord` objects with full history
- Can view pending and completed withdrawals

### 3.2 Admin Flow (Business User)

**Location**: iOS `WithdrawalRequestsView` (Admin panel)

**Available Actions**:

1. **View All Requests** (with filtering)
   - Filter by status: All, Pending, Approved, Processing, Completed, Rejected

2. **Approve Request** (pending → approved)
   - Admin can approve withdrawal
   - Status changes to "approved"
   - `processed_at` timestamp is set

3. **Reject Request** (pending → rejected)
   - Admin provides rejection reason
   - Status changes to "rejected"
   - Reason is stored in `rejection_reason` field
   - Influencer is notified (future feature)

4. **Mark as Completed** (approved/processing → completed)
   - Admin enters e-Transfer transaction ID
   - Status changes to "completed"
   - Transaction ID stored for audit trail

---

## 4. KEY FILES & IMPLEMENTATION DETAILS

### iOS Application Files

#### UI Views
- **`/Users/anthony/Documents/Projects/Collabuu/Influencer/Pages/Profile/Views/WithdrawCreditsView.swift`**
  - Main withdrawal request interface
  - Shows balance, pending requests, minimum requirements
  - Displays info about processing timeline (1-5 business days)

- **`/Users/anthony/Documents/Projects/Collabuu/Influencer/Pages/Profile/Views/WithdrawalSubmissionView.swift`**
  - Form for submitting withdrawal requests
  - Amount input (in credits) with live validation
  - E-Transfer email input with validation
  - Shows processing information and requirements
  - Success/error alerts

- **`/Users/anthony/Documents/Projects/Collabuu/Business/Pages/Admin/Views/WithdrawalRequestsView.swift`**
  - Admin panel for managing withdrawal requests
  - Displays list with status filtering
  - Action buttons for approve, reject, mark completed
  - Shows detailed withdrawal information

#### ViewModels (Business Logic)
- **`/Users/anthony/Documents/Projects/Collabuu/Influencer/Pages/Profile/ViewModels/WithdrawCreditsViewModel.swift`**
  - Manages credit balance display
  - Loads profile and withdrawal history
  - Calculates pending vs available credits
  - Properties:
    - `availableCredits`: Current balance available for withdrawal
    - `totalCredits`: Total balance including pending
    - `pendingCredits`: Sum of pending withdrawal amounts
    - `pendingWithdrawals`: Array of `WithdrawalRecord` with status `.pending`

- **`/Users/anthony/Documents/Projects/Collabuu/Influencer/Pages/Profile/ViewModels/WithdrawalSubmissionViewModel.swift`**
  - Handles form submission and validation
  - Validates amount (≥10 credits, ≤ available)
  - Validates email format
  - Calls API to submit withdrawal request
  - Detailed error handling for backend responses
  - Properties:
    - `amountText`: User input amount
    - `etransferEmail`: User input email
    - `isFormValid`: Computed property for submit button state
    - `amountError`, `emailError`: Validation error messages

- **`/Users/anthony/Documents/Projects/Collabuu/Business/Pages/Admin/ViewModels/WithdrawalRequestsViewModel.swift`**
  - Currently uses mock data (not yet connected to real API)
  - Manages list of withdrawal requests
  - Handles approve, reject, mark completed actions
  - Filters by status

#### Data Models
- **`/Users/anthony/Documents/Projects/Collabuu/Shared/Services/APIService.swift`**
  - Contains `WithdrawalRecord` struct (Codable)
  - Contains `WithdrawalStatus` enum (6 cases)
  - Contains `WithdrawalMethod` enum (etransfer only)
  - API functions:
    - `requestWithdrawal(amount, method, etransferEmail)`
    - `getWithdrawalHistory()`

**WithdrawalRecord Structure**:
```swift
struct WithdrawalRecord: Codable, Identifiable {
    let id: String
    let amount: Double                    // Dollar amount
    let credits: Int                      // Credit count
    let method: WithdrawalMethod
    let status: WithdrawalStatus
    let etransferEmail: String
    let requestedDate: Date
    let processedDate: Date?
    let transactionId: String?
    let notes: String?
    let rejectionReason: String?
    
    // Commission fields (optional)
    let grossCredits: Int?
    let commissionCredits: Int?
    let netCredits: Int?
    let commissionRate: Double?
}
```

### Backend API Files

#### Routes & Endpoints
- **`/Users/anthony/Documents/Projects/Collabuu/src/api/routes/influencer.ts`** (Lines 3551-3700)

**Endpoints Implemented**:

1. **POST `/influencer/credits/withdraw`**
   - Handler: `withdrawCredits()`
   - Validates:
     - User authentication
     - Amount > 0
     - Method is "etransfer"
     - Valid email format
     - Amount ≥ 10 credits (minimum)
     - Sufficient available credits (accounting for pending)
   - Creates withdrawal request in `withdrawal_requests` table
   - Returns success message with withdrawal ID

2. **GET `/influencer/credits/withdrawal-history`**
   - Handler: `getWithdrawalHistory()`
   - Returns array of withdrawal records for authenticated user
   - Sorted by requested_at descending
   - Transforms database format to API format

3. **GET `/influencer/credits/balance`**
   - Returns current credit balance with pending calculations
   - Response:
     ```json
     {
       "availableCredits": 500,
       "totalEarned": 1000,
       "totalWithdrawn": 500,
       "pendingCredits": 150
     }
     ```

#### Validation Rules

**Withdrawal Amount Validation**:
- Must be ≥ 10 credits ($0.10 CAD)
- Cannot exceed available balance
- Available balance = credits_available - (sum of pending withdrawal credits)

**Email Validation**:
- Uses regex pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Database Constraints**:
- Credits stored as integers (whole numbers)
- Amount (in dollars) calculated as: `credits * 0.01`
- Floored to 2 decimal places

---

## 5. DATA MODEL - API RESPONSES

### Credit Balance Response
```json
{
  "availableCredits": 500,
  "totalEarned": 1000,
  "totalWithdrawn": 500,
  "pendingCredits": 150
}
```

### Withdrawal History Response
```json
[
  {
    "id": "uuid",
    "amount": 10.00,
    "credits": 1000,
    "method": "etransfer",
    "status": "completed",
    "etransferEmail": "user@example.com",
    "requestedDate": "2024-10-20T15:30:00Z",
    "processedDate": "2024-10-21T10:00:00Z",
    "transactionId": "ET123456789",
    "notes": null,
    "rejectionReason": null
  },
  {
    "id": "uuid",
    "amount": 5.00,
    "credits": 500,
    "method": "etransfer",
    "status": "pending",
    "etransferEmail": "user@example.com",
    "requestedDate": "2024-10-26T12:45:00Z",
    "processedDate": null,
    "transactionId": null,
    "notes": null,
    "rejectionReason": null
  }
]
```

---

## 6. WITHDRAWAL REQUEST SUBMISSION

### Frontend Submission Logic (iOS)

**File**: `WithdrawalSubmissionViewModel.swift`

**Process**:
1. User enters amount (in credits) and e-transfer email
2. Form validates in real-time with 300ms debounce on amount, 500ms on email
3. Submit button enabled when:
   - Amount is valid integer
   - Amount ≥ 10 credits
   - Amount ≤ available credits
   - Email is valid format
4. On submit:
   - Calls `APIService.shared.requestWithdrawal()`
   - Shows loading state
   - On success: Shows success alert, dismisses form
   - On error: Parses error and shows detailed message

**Error Handling**:
- Insufficient balance errors
- Invalid amount errors
- Network errors
- Server errors (500, 400, etc.)
- Unauthorized/session expired

### Backend Processing (Node.js/Express)

**File**: `src/api/routes/influencer.ts` - `withdrawCredits()` function

**Process**:
1. Extract and validate input (amount, method, email)
2. Verify user authentication
3. Fetch influencer profile (credits_available)
4. Fetch pending withdrawals for this influencer
5. Calculate available balance = credits_available - pending
6. Validate sufficient balance
7. Insert new record in withdrawal_requests table:
   ```sql
   INSERT INTO withdrawal_requests (
     influencer_id,
     amount,
     credits,
     method,
     etransfer_email,
     status
   ) VALUES (...)
   ```
8. Return success response with withdrawal ID

**Important Note**: Credits are NOT deducted immediately. They remain in the influencer's account but are tracked as "pending" through the withdrawal request status.

---

## 7. CREDIT BALANCE CALCULATION

### Fields Used

From `influencer_profiles` table:
- `credits_available`: Available for withdrawal (remaining after pending requests)
- `credits_earned`: Cumulative credits earned from all campaigns
- `credits_withdrawn`: Cumulative credits successfully withdrawn

### Balance Formula

```
Total Balance = credits_available + pending_withdrawal_credits
Available for Withdrawal = credits_available
Pending = SUM(withdrawal_requests.credits WHERE status = 'pending')
Total Earned = credits_earned
Total Withdrawn = credits_withdrawn + (completed withdrawal credits)
```

---

## 8. EMAIL & NOTIFICATION PATTERNS

### Current Implementation Status

**Email Service Available**: YES
- Using Resend email service
- File: `/Users/anthony/Documents/Projects/Collabuu/src/services/emailService.ts`
- Supports sending templated emails

**Withdrawal-Specific Emails**: NOT YET IMPLEMENTED
- Service infrastructure exists but no withdrawal email templates
- Would need to add templates for:
  - Withdrawal request confirmation (to influencer)
  - Withdrawal approved notification (to influencer)
  - Withdrawal rejected notification (to influencer)
  - Withdrawal completed notification (to influencer)

### Email Service Details

- **Service**: Resend (https://resend.com)
- **Configuration**: Uses `process.env.RESEND_API_KEY`
- **From Address**: `process.env.EMAIL_FROM` (default: "onboarding@resend.dev")
- **Test Mode**: Restricts sending to verified email addresses
- **Available Methods**:
  - `sendTeamInvitation()` - template example
  - Can be extended for withdrawal emails

---

## 9. ADMIN MANAGEMENT INTERFACE

### Location
`/Users/anthony/Documents/Projects/Collabuu/Business/Pages/Admin/Views/WithdrawalRequestsView.swift`

### Current Features

**Display**:
- List view of all withdrawal requests
- Status badges with color coding:
  - Pending: Orange
  - Approved: Blue
  - Processing: Purple
  - Completed: Green
  - Rejected: Red
  - Cancelled: Gray

**Filtering**:
- Filter by status (All, Pending, Approved, Processing, Completed, Rejected)
- Chips at top of view for easy access

**Information Displayed per Request**:
- Influencer name
- Request ID (first 8 characters of UUID)
- Amount in dollars
- Credits count
- E-Transfer email
- Requested date
- Processed date (if applicable)
- Transaction ID (if applicable)
- Notes (if any)
- Rejection reason (if rejected)

**Actions** (based on status):

**For Pending Requests**:
- "Approve" button (green) → changes status to approved
- "Reject" button (red) → opens dialog to enter rejection reason

**For Approved/Processing Requests**:
- "Mark as Completed" button (blue) → opens dialog to enter transaction ID

### Admin View Models

**File**: `/Users/anthony/Documents/Projects/Collabuu/Business/Pages/Admin/ViewModels/WithdrawalRequestsViewModel.swift`

**Note**: Currently uses mock data. Needs integration with real API endpoints:
- `GET /admin/withdrawal-requests` (not yet implemented)
- `POST /admin/withdrawal-requests/:id/approve` (not yet implemented)
- `POST /admin/withdrawal-requests/:id/reject` (not yet implemented)
- `POST /admin/withdrawal-requests/:id/complete` (not yet implemented)

---

## 10. WITHDRAWAL REQUEST DATA MODEL

### WithdrawalRequest (Admin Model)

```swift
struct WithdrawalRequest: Identifiable {
    let id: String
    let influencerId: String
    let influencerName: String
    let amount: Double              // CAD
    let credits: Int
    let method: WithdrawalMethod
    let status: WithdrawalStatus
    let etransferEmail: String
    let requestedDate: Date
    let processedDate: Date?
    let transactionId: String?
    let notes: String?
    let rejectionReason: String?
}
```

---

## 11. CONSTRAINTS & VALIDATION RULES

### User-Level Constraints

| Constraint | Value | Notes |
|---|---|---|
| Minimum withdrawal | 10 credits ($0.10) | Hard limit in code |
| Withdrawal method | etransfer only | Canadian e-Transfer only |
| Email validation | RFC-compatible regex | Must be valid email format |
| Credit precision | Integers only | No fractional credits |
| Minimum credit value | 1 credit = $0.01 CAD | Fixed exchange rate |

### Business Rules

| Rule | Implementation |
|---|---|
| Cannot withdraw pending credits | Check against pending withdrawals before allowing request |
| Cannot withdraw more than available | Compare requested amount to available balance |
| Credits not deducted until completion | Credits remain available, tracked via request status |
| One request at a time per user | No technical limit, but could be added |
| No refunds after completion | Completed status is final |

---

## 12. COMMISSION FIELDS (Optional)

The `WithdrawalRecord` struct includes commission tracking fields:

```swift
let grossCredits: Int?           // Total credits before commission
let commissionCredits: Int?      // Commission deducted
let netCredits: Int?             // Credits after commission
let commissionRate: Double?      // Commission percentage
```

These fields are marked as optional and appear to be prepared for future commission functionality. Currently not used in withdrawal processing.

---

## 13. API ENDPOINT MAPPING

### Influencer Endpoints

| Method | Endpoint | Handler | Status |
|---|---|---|---|
| GET | `/influencer/credits/balance` | getCreditBalance() | Implemented |
| GET | `/influencer/credits/withdrawal-history` | getWithdrawalHistory() | Implemented |
| POST | `/influencer/credits/withdraw` | withdrawCredits() | Implemented |
| GET | `/influencer/credits/history` | getCreditHistory() | Implemented (includes withdrawals) |

### Admin Endpoints (NOT YET IMPLEMENTED)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/business/withdrawals` | Get all pending withdrawal requests |
| POST | `/business/withdrawals/:id/approve` | Approve withdrawal request |
| POST | `/business/withdrawals/:id/reject` | Reject withdrawal request |
| POST | `/business/withdrawals/:id/complete` | Mark as completed with transaction ID |
| GET | `/business/withdrawals/pending` | Get only pending requests |

---

## 14. FUTURE ENHANCEMENTS NEEDED

### Backend
1. **Admin API Endpoints** - Implement approval, rejection, completion endpoints
2. **Email Notifications** - Add email templates for withdrawal lifecycle events
3. **Webhook Support** - For e-Transfer completion notifications
4. **Reporting/Analytics** - Withdrawal metrics and trends
5. **Batch Processing** - Automated processing of approved withdrawals
6. **Commission Support** - Implement commission deduction logic

### Frontend (Webapp)
1. **Withdrawal Management UI** - Create web-based withdrawal request interface
2. **Admin Dashboard** - Implement web-based admin panel for managing requests
3. **Email Notifications** - Add notification badges and real-time updates

### Compliance & Security
1. **Audit Logging** - Log all withdrawal actions with timestamps
2. **Verification Workflow** - Multi-step verification for large amounts
3. **Rate Limiting** - Prevent abuse of withdrawal requests
4. **Encryption** - Encrypt e-transfer email addresses at rest

---

## 15. KEY CODE SNIPPETS

### Withdrawal Request Submission
```swift
// From WithdrawalSubmissionViewModel
try await APIService.shared.requestWithdrawal(
    amount: Double(amount),
    method: .etransfer,
    etransferEmail: etransferEmail.trimmingCharacters(in: .whitespaces)
)
```

### Backend Validation
```typescript
// Minimum withdrawal is 10 credits ($0.10)
if (credits < 10) {
    return res.status(400).json({ 
        error: "Minimum withdrawal is 10 credits ($0.10)" 
    });
}

// Check available credits
const availableForWithdrawal = profile.credits_available - totalPendingCredits;
if (availableForWithdrawal < credits) {
    return res.status(400).json({ 
        error: `Insufficient credits. You have ${profile.credits_available} credits total...` 
    });
}
```

### Database Insertion
```typescript
const { data: withdrawal, error: withdrawalError } = await this.supabaseAdmin
    .from("withdrawal_requests")
    .insert({
        influencer_id: influencerId,
        amount: (credits * 0.01).toFixed(2),
        credits: credits,
        method: method,
        etransfer_email: etransferEmail,
        status: "pending"
    })
    .select()
    .single();
```

---

## 16. TESTING CONSIDERATIONS

### Test Cases to Implement

1. **Validation Tests**
   - Minimum amount (9 vs 10 credits)
   - Maximum amount (more than available)
   - Invalid email format
   - Missing fields

2. **Business Logic Tests**
   - Pending credits reduce available balance
   - Status transitions
   - Balance calculations

3. **Integration Tests**
   - End-to-end withdrawal submission
   - Admin approval workflow
   - Rejection workflow
   - Completion workflow

4. **Edge Cases**
   - Concurrent withdrawal requests
   - Exact balance withdrawal
   - Network failures during submission
   - Admin actions on already-completed requests

---

## Summary

The Collabuu withdrawal system is a comprehensive infrastructure for influencers to cash out earned credits. The iOS implementation is feature-complete with user-facing interfaces and admin management tools. The backend API properly validates requests and stores withdrawal data. Email notifications and admin API endpoints require implementation to complete the system.

**Current Status**: ~70% complete
- Core withdrawal submission: ✓ Complete
- Balance calculations: ✓ Complete  
- Withdrawal history: ✓ Complete
- Admin UI: ✓ Complete (with mock data)
- Admin API endpoints: ✗ Not implemented
- Email notifications: ✗ Not implemented
- Webapp integration: ✗ Not implemented
