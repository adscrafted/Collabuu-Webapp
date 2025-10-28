# Withdrawal System - Complete File Paths

## iOS Application Files

### Influencer User Interface

- `/Users/anthony/Documents/Projects/Collabuu/Influencer/Pages/Profile/Views/WithdrawCreditsView.swift`
  - Main view showing available balance, pending requests, and withdrawal request button
  - Shows total balance breakdown (total, available, pending)
  - Displays list of pending withdrawal requests
  - Navigation to withdrawal form

- `/Users/anthony/Documents/Projects/Collabuu/Influencer/Pages/Profile/Views/WithdrawalSubmissionView.swift`
  - Form for submitting new withdrawal request
  - Amount input field (in credits)
  - E-Transfer email input field
  - Real-time validation with error messages
  - Processing information and requirements display
  - Success/error alert handling

### Influencer Business Logic

- `/Users/anthony/Documents/Projects/Collabuu/Influencer/Pages/Profile/ViewModels/WithdrawCreditsViewModel.swift`
  - Manages credit balance state
  - Loads influencer profile data
  - Loads withdrawal history
  - Calculates pending vs available credits
  - Published properties:
    - `availableCredits`: Balance available for withdrawal
    - `totalCredits`: Total including pending
    - `pendingCredits`: Sum of pending withdrawals
    - `pendingWithdrawals`: Array of pending WithdrawalRecord objects

- `/Users/anthony/Documents/Projects/Collabuu/Influencer/Pages/Profile/ViewModels/WithdrawalSubmissionViewModel.swift`
  - Handles form validation
  - Validates amount (≥10, ≤available)
  - Validates email format
  - Calls API to submit withdrawal request
  - Handles success/error responses
  - Detailed error parsing for backend messages
  - Published properties:
    - `amountText`: User input amount
    - `etransferEmail`: User input email
    - `isFormValid`: Computed validation state
    - `amountError`, `emailError`: Validation messages

### Admin User Interface

- `/Users/anthony/Documents/Projects/Collabuu/Business/Pages/Admin/Views/WithdrawalRequestsView.swift`
  - Admin panel for managing withdrawal requests
  - Status filtering (All, Pending, Approved, Processing, Completed, Rejected)
  - List view with request details
  - Cards showing:
    - Influencer name & request ID
    - Amount and credits
    - E-Transfer email
    - Request date and processed date
    - Transaction ID (if applicable)
    - Notes and rejection reason
  - Action buttons based on status
  - Dialog for entering rejection reasons and transaction IDs

### Admin Business Logic

- `/Users/anthony/Documents/Projects/Collabuu/Business/Pages/Admin/ViewModels/WithdrawalRequestsViewModel.swift`
  - NOTE: Currently uses mock data
  - Manages list of withdrawal requests
  - Handles filtering by status
  - Implements approve action (pending → approved)
  - Implements reject action (pending → rejected)
  - Implements mark completed action (approved/processing → completed)
  - Needs integration with real API endpoints

### Shared Models and Services

- `/Users/anthony/Documents/Projects/Collabuu/Shared/Services/APIService.swift`
  - Contains WithdrawalRecord struct (Codable)
  - Contains WithdrawalStatus enum (6 cases: pending, approved, processing, completed, rejected, cancelled)
  - Contains WithdrawalMethod enum (etransfer only)
  - Implements `requestWithdrawal()` function
  - Implements `getWithdrawalHistory()` function
  - Handles API communication for withdrawal operations

## Backend Files

### API Routes

- `/Users/anthony/Documents/Projects/Collabuu/src/api/routes/influencer.ts` (Lines 3551-3700+)
  
  **Key Functions**:
  
  - `withdrawCredits()` (Lines 3551-3649)
    - POST /influencer/credits/withdraw
    - Validates amount, email, method
    - Checks available balance
    - Creates withdrawal request
    - Returns success with withdrawal ID
  
  - `getWithdrawalHistory()` (Lines 3651-3684)
    - GET /influencer/credits/withdrawal-history
    - Returns array of WithdrawalRecord
    - Transforms database format to API format
    - Sorted by requested_at descending
  
  - Related function: `getCreditBalance()` (Lines 3400-3438)
    - GET /influencer/credits/balance
    - Returns available, earned, withdrawn, pending credits
    - Calculates pending from withdrawal_requests table

  - `isValidEmail()` helper function (Lines 3645-3650)
    - Email validation using regex

### Email Services

- `/Users/anthony/Documents/Projects/Collabuu/src/services/emailService.ts`
  - Resend email service integration
  - `sendTeamInvitation()` method (example template)
  - Test mode handling for Resend API
  - NOTE: No withdrawal email templates yet
  - Ready for implementation of:
    - Withdrawal request confirmation
    - Approval notification
    - Rejection notification
    - Completion notification

### Related Models

- `/Users/anthony/Documents/Projects/Collabuu/src/models/transaction.ts`
  - Contains transaction models
  - References credit balance updates
  - Uses influencer_profiles.credits_available

## Database (Supabase)

### Tables

- `withdrawal_requests`
  - Primary table for withdrawal tracking
  - Fields: id, influencer_id, amount, credits, method, etransfer_email, status, requested_at, processed_at, transaction_id, rejection_reason, notes

- `influencer_profiles`
  - Related table with credit balances
  - Fields: credits_available, credits_earned, credits_withdrawn

## Documentation Files

- `/Users/anthony/Documents/Projects/Collabuu-Webapp/WITHDRAWAL_SYSTEM_REPORT.md`
  - Comprehensive 16-section report covering:
    - Database schema
    - Status values and workflow
    - Complete withdrawal flow
    - Key files and implementation details
    - Data models and API responses
    - Email and notification patterns
    - Admin management interface
    - Constraints and validation rules
    - Commission fields
    - API endpoint mapping
    - Future enhancements
    - Code snippets
    - Testing considerations

- `/Users/anthony/Documents/Projects/Collabuu-Webapp/WITHDRAWAL_QUICK_REFERENCE.md`
  - Quick lookup guide with tables and checklists
  - API endpoints summary
  - Validation rules
  - Data models
  - File purposes
  - Implementation checklist

- `/Users/anthony/Documents/Projects/Collabuu-Webapp/WITHDRAWAL_FILE_PATHS.md` (This file)
  - Complete file paths for all withdrawal-related code
  - Organized by component and function

## Summary Statistics

Total Withdrawal-Related Files:

**iOS App**:
- 2 User Views
- 2 User ViewModels
- 1 Admin View
- 1 Admin ViewModel
- 1 Shared Service

**Backend**:
- 1 Routes file (influencer.ts)
- 1 Email Service file

**Database**:
- 2 Tables (withdrawal_requests, influencer_profiles)

**Documentation**:
- 3 Markdown files

---

## How to Navigate

### For Implementing Admin API Endpoints
Start with: `/Users/anthony/Documents/Projects/Collabuu/src/api/routes/influencer.ts`
Add routes in: `business.ts` or new file

### For Adding Email Notifications
Modify: `/Users/anthony/Documents/Projects/Collabuu/src/services/emailService.ts`
Reference: `WithdrawalSubmissionView.swift` for user-facing messages

### For Understanding Data Flow
1. Read: `WITHDRAWAL_SYSTEM_REPORT.md` (Sections 3, 5, 6)
2. Check: `WithdrawalSubmissionViewModel.swift` (frontend logic)
3. Review: `influencer.ts` `withdrawCredits()` function (backend logic)

### For Debugging Issues
1. Check the admin VM: `WithdrawalRequestsViewModel.swift`
2. Review balance calculation: `influencer.ts` `getCreditBalance()`
3. Validate form logic: `WithdrawalSubmissionViewModel.swift`

