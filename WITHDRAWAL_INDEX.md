# Collabuu Withdrawal System - Documentation Index

This directory contains comprehensive documentation about the Collabuu withdrawal/payout system for influencers.

## Documentation Files

### 1. **WITHDRAWAL_SYSTEM_REPORT.md** (Main Reference)
   - **Size**: 691 lines, 21KB
   - **Purpose**: Comprehensive technical documentation
   - **Contents**:
     - Executive summary
     - Database table schema (withdrawal_requests)
     - Status values and workflow
     - Complete withdrawal flow with diagrams
     - Key files and implementation details
     - Data model structures
     - Email and notification patterns
     - Admin management interface
     - Constraints and validation rules
     - Commission fields
     - API endpoint mapping
     - Future enhancements
     - Code snippets
     - Testing considerations
   - **Best For**: Understanding the complete system

### 2. **WITHDRAWAL_QUICK_REFERENCE.md** (Quick Lookup)
   - **Size**: 199 lines, 5KB
   - **Purpose**: Quick reference guide
   - **Contents**:
     - Database table fields
     - Status values (flow diagram)
     - API endpoints (with implementation status)
     - Validation rules
     - Key files (organized by component)
     - Data models
     - Workflow diagrams
     - Exchange rate reference
     - Email integration status
     - Common issues and solutions
     - Implementation checklist
   - **Best For**: Quick lookup during development

### 3. **WITHDRAWAL_FILE_PATHS.md** (Code Navigation)
   - **Size**: 217 lines, 7.3KB
   - **Purpose**: Complete file path reference
   - **Contents**:
     - All iOS app files with descriptions
     - Backend files with line numbers
     - Database table details
     - Documentation files
     - Navigation guides for specific tasks
     - Summary statistics
   - **Best For**: Finding and understanding code locations

## Quick Start Guide

### I need to understand the withdrawal system...
Read: **WITHDRAWAL_SYSTEM_REPORT.md** (Sections 1-5)

### I need specific details about...
- **Status values**: WITHDRAWAL_QUICK_REFERENCE.md
- **API endpoints**: WITHDRAWAL_SYSTEM_REPORT.md (Section 13)
- **File locations**: WITHDRAWAL_FILE_PATHS.md
- **Data structures**: WITHDRAWAL_SYSTEM_REPORT.md (Section 4)

### I need to implement...

**Admin API endpoints**: 
- Start: WITHDRAWAL_FILE_PATHS.md (Backend section)
- Reference: WITHDRAWAL_SYSTEM_REPORT.md (Sections 9, 13)
- Files: `/Users/anthony/Documents/Projects/Collabuu/src/api/routes/influencer.ts`

**Email notifications**:
- Start: WITHDRAWAL_SYSTEM_REPORT.md (Section 8)
- File: `/Users/anthony/Documents/Projects/Collabuu/src/services/emailService.ts`

**Webapp integration**:
- Reference: WITHDRAWAL_QUICK_REFERENCE.md
- Example: `/Users/anthony/Documents/Projects/Collabuu/Influencer/Pages/Profile/Views/WithdrawalSubmissionView.swift`

### I need to debug...
- **Balance calculation**: WITHDRAWAL_FILE_PATHS.md (How to Navigate section)
- **Validation issues**: WITHDRAWAL_SYSTEM_REPORT.md (Section 11)
- **API problems**: WITHDRAWAL_SYSTEM_REPORT.md (Section 13)

---

## System Status Summary

**Completion Level**: ~70%

### Implemented (✓)
- Database schema and tables
- iOS user UI (balance view, submission form)
- iOS admin UI (with mock data)
- Backend withdrawal endpoint (POST /influencer/credits/withdraw)
- Backend history endpoint (GET /influencer/credits/withdrawal-history)
- Credit balance calculations
- Real-time form validation
- Error handling

### Not Yet Implemented (✗)
- Admin API endpoints (4 endpoints)
- Email notification templates (4 templates)
- Webapp (React/Next.js) integration
- Audit logging
- Rate limiting
- Commission deduction logic

---

## Key Facts at a Glance

| Item | Details |
|------|---------|
| **Database Table** | `withdrawal_requests` (11 fields) |
| **Exchange Rate** | 1 credit = $0.01 CAD |
| **Minimum Withdrawal** | 10 credits ($0.10) |
| **Payment Method** | Interac e-Transfer (Canada only) |
| **Status Values** | 6 states (pending, approved, processing, completed, rejected, cancelled) |
| **Validation** | Amount ≥10, ≤available, valid email |
| **Email Service** | Resend (infrastructure ready) |
| **Admin Actions** | Approve, Reject, Mark Complete |
| **iOS Views** | 3 views + 3 view models |
| **Backend Endpoints** | 3 implemented, 4 pending |

---

## File Organization

```
iOS App
├── Influencer/Pages/Profile/
│   ├── Views/
│   │   ├── WithdrawCreditsView.swift (balance display)
│   │   └── WithdrawalSubmissionView.swift (form)
│   └── ViewModels/
│       ├── WithdrawCreditsViewModel.swift
│       └── WithdrawalSubmissionViewModel.swift
├── Business/Pages/Admin/
│   ├── Views/
│   │   └── WithdrawalRequestsView.swift (admin panel)
│   └── ViewModels/
│       └── WithdrawalRequestsViewModel.swift (mock data)
└── Shared/Services/
    └── APIService.swift (models + API calls)

Backend
├── src/api/routes/
│   └── influencer.ts (withdrawal endpoints, lines 3551-3700)
└── src/services/
    └── emailService.ts (email infrastructure)

Database
├── withdrawal_requests (primary table)
└── influencer_profiles (balance tracking)
```

---

## Common Tasks

### View Withdrawal Code
- UI Views: WITHDRAWAL_FILE_PATHS.md (Influencer User Interface)
- ViewModels: WITHDRAWAL_FILE_PATHS.md (Influencer Business Logic)
- API Code: `/Users/anthony/Documents/Projects/Collabuu/src/api/routes/influencer.ts` (lines 3551-3700)

### Understand Status Flow
- Visual: WITHDRAWAL_QUICK_REFERENCE.md (Status Values section)
- Detailed: WITHDRAWAL_SYSTEM_REPORT.md (Section 2-3)

### Check Validation Rules
- Quick: WITHDRAWAL_QUICK_REFERENCE.md (Validation Rules)
- Detailed: WITHDRAWAL_SYSTEM_REPORT.md (Section 11)

### Find API Endpoints
- Summary: WITHDRAWAL_QUICK_REFERENCE.md (API Endpoints)
- Detailed: WITHDRAWAL_SYSTEM_REPORT.md (Section 13)
- Implementation: WITHDRAWAL_FILE_PATHS.md (Backend section)

### Review Data Models
- Quick: WITHDRAWAL_QUICK_REFERENCE.md (Data Models)
- Detailed: WITHDRAWAL_SYSTEM_REPORT.md (Section 4-5)

---

## Next Steps for Developers

1. **Read the overview**: Start with this file and WITHDRAWAL_QUICK_REFERENCE.md
2. **Understand the flow**: Read WITHDRAWAL_SYSTEM_REPORT.md sections 2-3
3. **Find the code**: Use WITHDRAWAL_FILE_PATHS.md to locate files
4. **Deep dive**: Read detailed sections in WITHDRAWAL_SYSTEM_REPORT.md
5. **Implement**: Use code snippets from WITHDRAWAL_SYSTEM_REPORT.md section 15

---

## Documentation Statistics

| Document | Lines | Size | Focus |
|----------|-------|------|-------|
| WITHDRAWAL_SYSTEM_REPORT.md | 691 | 21KB | Complete technical reference |
| WITHDRAWAL_QUICK_REFERENCE.md | 199 | 5KB | Quick lookup tables |
| WITHDRAWAL_FILE_PATHS.md | 217 | 7.3KB | Code file navigation |
| WITHDRAWAL_INDEX.md | 180 | 5KB | This file - orientation guide |
| **Total** | **1,287** | **38.3KB** | **Complete documentation** |

---

## Questions?

Refer to the appropriate document:
- **"How does the withdrawal system work?"** → WITHDRAWAL_SYSTEM_REPORT.md
- **"What's the status of [feature]?"** → WITHDRAWAL_QUICK_REFERENCE.md (checklist)
- **"Where is the code for [feature]?"** → WITHDRAWAL_FILE_PATHS.md
- **"I need to [implement/fix] [something]"** → Section 14 of WITHDRAWAL_SYSTEM_REPORT.md

---

**Last Updated**: October 27, 2025
**Status**: Documentation Complete - System ~70% Implementation Complete
**Maintainer**: Code exploration performed by Claude Code
