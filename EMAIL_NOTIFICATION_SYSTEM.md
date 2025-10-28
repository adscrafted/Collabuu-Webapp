# Email Notification System - Implementation Guide

## Overview

This document describes the email notification system implemented for withdrawal status updates. The system uses **Resend** for email delivery and **React Email** for templating, providing influencers with professional, transactional emails when their withdrawal requests are processed.

## Architecture

### Components

1. **Email Service** (`/lib/email/service.ts`)
   - Wrapper around Resend API
   - Handles email sending with error handling
   - Configuration management

2. **Email Templates** (`/lib/email/templates/`)
   - React-based email components
   - Responsive HTML emails
   - Consistent branding and styling

3. **API Integrations**
   - Integrated into withdrawal status update endpoints
   - Graceful error handling (doesn't block operations)

## Setup Instructions

### 1. Install Dependencies

Already installed (via npm):
```bash
npm install resend react-email @react-email/components
```

### 2. Configure Environment Variables

Add these variables to your `.env.local` file:

```bash
# Resend API Key (get from https://resend.com/api-keys)
RESEND_API_KEY=re_your_actual_api_key_here

# Email addresses
EMAIL_FROM=noreply@collabuu.com
SUPPORT_EMAIL=support@collabuu.com
```

**For Development:**
- Use `onboarding@resend.dev` as `EMAIL_FROM` (no domain verification needed)
- Sign up at https://resend.com to get your API key
- Free tier: 100 emails/day, 3,000 emails/month

**For Production:**
1. Add your domain in Resend Dashboard
2. Verify domain ownership via DNS records
3. Update `EMAIL_FROM` to use your verified domain

### 3. Resend Setup Steps

1. Go to https://resend.com and sign up
2. Navigate to **API Keys** section
3. Click **Create API Key**
4. Copy the key (starts with `re_`)
5. Add to your `.env.local`:
   ```
   RESEND_API_KEY=re_your_actual_key_here
   ```

### 4. Domain Verification (Production)

1. In Resend Dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `collabuu.com`)
4. Add the provided DNS records to your domain registrar:
   - SPF record
   - DKIM records
   - DMARC record (optional but recommended)
5. Wait for verification (usually 5-10 minutes)
6. Update `EMAIL_FROM` to use verified domain

## Email Templates

### 1. Withdrawal Approved Email

**File:** `/lib/email/templates/withdrawal-approved.tsx`

**Sent When:** Admin approves a withdrawal request

**Content Includes:**
- Amount and credits
- E-transfer email address
- Request timestamp
- Approval status badge
- Next steps information
- Support contact

**Subject:** "Withdrawal Approved - Payment Processing"

### 2. Withdrawal Completed Email

**File:** `/lib/email/templates/withdrawal-completed.tsx`

**Sent When:** Admin marks withdrawal as completed with transaction ID

**Content Includes:**
- Amount and credits
- Transaction ID
- E-transfer email address
- Request and completion timestamps
- Success indicator
- Instructions to accept e-transfer
- Keep for records notice
- Support contact

**Subject:** "Payment Sent! - E-Transfer on Its Way"

### 3. Withdrawal Rejected Email

**File:** `/lib/email/templates/withdrawal-rejected.tsx`

**Sent When:** Admin rejects a withdrawal request

**Content Includes:**
- Amount and credits
- Rejection reason (from admin)
- E-transfer email address
- Request and rejection timestamps
- Credits restored notification
- Next steps and guidance
- Support contact and assistance options

**Subject:** "Withdrawal Request Declined - Credits Restored"

## API Integration Points

### 1. Approve Endpoint

**File:** `/app/api/admin/withdrawals/[id]/approve/route.ts`

**Integration:**
```typescript
import { sendEmail } from '@/lib/email/service';
import { WithdrawalApprovedEmail } from '@/lib/email/templates';

// After database update success
if (influencerData?.email) {
  try {
    await sendEmail({
      to: influencerData.email,
      subject: 'Withdrawal Approved - Payment Processing',
      react: WithdrawalApprovedEmail({
        influencerName: influencerData.name || 'Influencer',
        amount: updatedWithdrawal.amount,
        credits: updatedWithdrawal.credits,
        requestedAt: updatedWithdrawal.requested_at,
        etransferEmail: updatedWithdrawal.etransfer_email,
      }),
    });
  } catch (emailError) {
    console.error('Failed to send approval email:', emailError);
  }
}
```

### 2. Complete Endpoint

**File:** `/app/api/admin/withdrawals/[id]/complete/route.ts`

**Integration:**
```typescript
import { sendEmail } from '@/lib/email/service';
import { WithdrawalCompletedEmail } from '@/lib/email/templates';

// After database update success
if (influencerData?.email) {
  try {
    await sendEmail({
      to: influencerData.email,
      subject: 'Payment Sent! - E-Transfer on Its Way',
      react: WithdrawalCompletedEmail({
        influencerName: influencerData.name || 'Influencer',
        amount: updatedWithdrawal.amount,
        credits: updatedWithdrawal.credits,
        requestedAt: updatedWithdrawal.requested_at,
        completedAt: updatedWithdrawal.processed_at,
        transactionId: updatedWithdrawal.transaction_id,
        etransferEmail: updatedWithdrawal.etransfer_email,
      }),
    });
  } catch (emailError) {
    console.error('Failed to send completion email:', emailError);
  }
}
```

### 3. Reject Endpoint

**File:** `/app/api/admin/withdrawals/[id]/reject/route.ts`

**Integration:**
```typescript
import { sendEmail } from '@/lib/email/service';
import { WithdrawalRejectedEmail } from '@/lib/email/templates';

// After database update success
if (influencerData?.email) {
  try {
    await sendEmail({
      to: influencerData.email,
      subject: 'Withdrawal Request Declined - Credits Restored',
      react: WithdrawalRejectedEmail({
        influencerName: influencerData.name || 'Influencer',
        amount: updatedWithdrawal.amount,
        credits: updatedWithdrawal.credits,
        requestedAt: updatedWithdrawal.requested_at,
        rejectedAt: updatedWithdrawal.processed_at,
        rejectionReason: updatedWithdrawal.rejection_reason,
        etransferEmail: updatedWithdrawal.etransfer_email,
      }),
    });
  } catch (emailError) {
    console.error('Failed to send rejection email:', emailError);
  }
}
```

## Error Handling

The email system is designed with graceful error handling:

1. **Missing Configuration:**
   - If `RESEND_API_KEY` is not set, emails won't be sent
   - Warning logged to console: "Email service not configured"
   - API operations continue normally

2. **Send Failures:**
   - Errors are caught and logged
   - API operations are NOT blocked
   - Withdrawal status updates complete successfully
   - Admin can see errors in server logs

3. **Validation:**
   - Email only sent if influencer email exists
   - Empty/invalid emails are skipped

## Testing

### Development Testing

1. **Using Resend's Test Email:**
   ```bash
   EMAIL_FROM=onboarding@resend.dev
   RESEND_API_KEY=re_your_test_key
   ```

2. **Test the endpoints:**
   ```bash
   # Approve withdrawal
   curl -X PATCH http://localhost:3000/api/admin/withdrawals/[id]/approve \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"notes": "Test approval"}'

   # Complete withdrawal
   curl -X PATCH http://localhost:3000/api/admin/withdrawals/[id]/complete \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"transactionId": "TEST-123456", "notes": "Test completion"}'

   # Reject withdrawal
   curl -X PATCH http://localhost:3000/api/admin/withdrawals/[id]/reject \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"reason": "Invalid bank information", "notes": "Test rejection"}'
   ```

3. **Check Resend Dashboard:**
   - Go to **Emails** section
   - View sent emails
   - Preview rendered HTML
   - Check delivery status

### Preview Templates Locally

You can preview email templates using React Email's dev server:

```bash
# Install React Email CLI (optional)
npm install -g react-email

# Start preview server
cd lib/email/templates
react-email preview
```

This opens a browser at `http://localhost:3000` with live previews.

## Email Template Structure

All templates use a consistent layout:

```
┌─────────────────────────────┐
│        Header (Purple)       │
│         "Collabuu"          │
├─────────────────────────────┤
│                             │
│    Heading (H2)             │
│                             │
│    Greeting                 │
│    Main Message             │
│                             │
│  ┌─────────────────────┐   │
│  │  Details Box        │   │
│  │  (Key Info Table)   │   │
│  └─────────────────────┘   │
│                             │
│    Additional Info          │
│    Next Steps (List)        │
│                             │
│  ┌─────────────────────┐   │
│  │  Info/Alert Box     │   │
│  └─────────────────────┘   │
│                             │
│    Signature                │
│                             │
├─────────────────────────────┤
│         Footer              │
│    Support Email Link       │
│    Copyright Notice         │
└─────────────────────────────┘
```

## Customization

### Updating Email Content

Edit the template files in `/lib/email/templates/`:

```typescript
// Example: Change subject line
// In /app/api/admin/withdrawals/[id]/approve/route.ts
subject: 'Your Custom Subject Line'

// Example: Add custom field to template
// In /lib/email/templates/withdrawal-approved.tsx
interface WithdrawalApprovedEmailProps {
  // ... existing props
  customField?: string; // Add new prop
}
```

### Styling

Email styles are defined inline using React Email conventions:

```typescript
const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};
```

**Color Scheme:**
- Primary: `#6366f1` (Indigo)
- Success: `#10b981` (Green)
- Error: `#ef4444` (Red)
- Warning: `#f59e0b` (Amber)
- Text: `#374151` (Gray)

### Adding New Email Templates

1. Create new template in `/lib/email/templates/your-template.tsx`
2. Export from `/lib/email/templates/index.tsx`
3. Import and use in API routes
4. Update this documentation

## Monitoring & Debugging

### View Email Logs

**Server Logs:**
```
# Success
Email sent successfully: re_abc123xyz

# Configuration warning
RESEND_API_KEY not configured. Email not sent.

# Send failure
Failed to send approval email: [error details]
```

**Resend Dashboard:**
- View all sent emails
- Check delivery status
- See open/click rates
- Monitor API usage

### Common Issues

1. **Emails not sending:**
   - Check `RESEND_API_KEY` is set correctly
   - Verify API key is active in Resend Dashboard
   - Check server logs for errors

2. **Emails in spam:**
   - Verify domain (production)
   - Add SPF/DKIM/DMARC records
   - Use consistent "From" address

3. **Template rendering issues:**
   - Test with React Email preview server
   - Check for TypeScript errors
   - Verify all required props are passed

## Production Checklist

Before deploying to production:

- [ ] Domain verified in Resend
- [ ] DNS records configured (SPF, DKIM, DMARC)
- [ ] `EMAIL_FROM` uses verified domain
- [ ] `RESEND_API_KEY` is production key (not test key)
- [ ] Support email address is monitored
- [ ] Email templates tested with real data
- [ ] Error logging configured
- [ ] Resend Dashboard notifications enabled

## Cost & Limits

**Resend Pricing (as of 2024):**
- **Free Tier:** 100 emails/day, 3,000 emails/month
- **Pro Tier:** $20/month for 50,000 emails
- **Business Tier:** Custom pricing

**Rate Limits:**
- Free: 10 requests/second
- Pro: 50 requests/second
- Business: Custom

Monitor usage in Resend Dashboard to avoid hitting limits.

## Support & Resources

**Resend Documentation:**
- API Docs: https://resend.com/docs/api-reference/introduction
- Domain Verification: https://resend.com/docs/dashboard/domains/introduction
- Rate Limits: https://resend.com/docs/api-reference/rate-limits

**React Email:**
- Components: https://react.email/docs/components/button
- Examples: https://react.email/examples

**Internal Support:**
- Email Service: `/lib/email/service.ts`
- Templates: `/lib/email/templates/`
- API Integration: `/app/api/admin/withdrawals/[id]/*/route.ts`

## Summary

The email notification system is fully integrated and ready to use. Key features:

- Professional, branded email templates
- Automatic notifications for all withdrawal status changes
- Graceful error handling (doesn't block operations)
- Easy to customize and extend
- Production-ready with proper configuration

Influencers will now receive timely email notifications when their withdrawal requests are approved, completed, or rejected, improving transparency and user experience.
