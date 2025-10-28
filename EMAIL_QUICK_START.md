# Email Notification System - Quick Start Guide

## Quick Setup (5 minutes)

### 1. Get Resend API Key

1. Go to https://resend.com and sign up
2. Navigate to **API Keys**
3. Create a new API key
4. Copy the key (starts with `re_`)

### 2. Add to Environment Variables

Create or update `.env.local`:

```bash
# For Development (no domain verification needed)
RESEND_API_KEY=re_your_actual_key_here
EMAIL_FROM=onboarding@resend.dev
SUPPORT_EMAIL=support@collabuu.com
```

### 3. Restart Your Dev Server

```bash
npm run dev
```

That's it! Emails will now be sent automatically when withdrawal statuses are updated.

## Testing

### Test with cURL

```bash
# 1. Approve a withdrawal
curl -X PATCH http://localhost:3000/api/admin/withdrawals/YOUR_WITHDRAWAL_ID/approve \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Approved for processing"}'

# 2. Complete a withdrawal
curl -X PATCH http://localhost:3000/api/admin/withdrawals/YOUR_WITHDRAWAL_ID/complete \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"transactionId": "ETRANSFER-123456", "notes": "Payment sent"}'

# 3. Reject a withdrawal
curl -X PATCH http://localhost:3000/api/admin/withdrawals/YOUR_WITHDRAWAL_ID/reject \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Invalid bank information provided", "notes": "Please update your profile"}'
```

### Check Email Delivery

1. Go to https://resend.com/emails
2. View sent emails
3. Check delivery status
4. Preview rendered HTML

## What Gets Sent

### Withdrawal Approved
- **Subject:** "Withdrawal Approved - Payment Processing"
- **To:** Influencer's email
- **Contains:** Amount, credits, e-transfer email, next steps

### Withdrawal Completed
- **Subject:** "Payment Sent! - E-Transfer on Its Way"
- **To:** Influencer's email
- **Contains:** Amount, transaction ID, e-transfer details, acceptance instructions

### Withdrawal Rejected
- **Subject:** "Withdrawal Request Declined - Credits Restored"
- **To:** Influencer's email
- **Contains:** Amount, rejection reason, credits restored notice, next steps

## Files Created

```
lib/
  email/
    service.ts                        # Email sending service
    templates/
      index.tsx                       # Template exports
      layout.tsx                      # Base email layout
      withdrawal-approved.tsx         # Approval email
      withdrawal-completed.tsx        # Completion email
      withdrawal-rejected.tsx         # Rejection email

app/
  api/
    admin/
      withdrawals/
        [id]/
          approve/route.ts            # ✅ Email integrated
          complete/route.ts           # ✅ Email integrated
          reject/route.ts             # ✅ Email integrated

.env.example                          # ✅ Updated with email config
EMAIL_NOTIFICATION_SYSTEM.md          # Full documentation
EMAIL_QUICK_START.md                  # This file
```

## Production Setup

When deploying to production:

1. **Verify Your Domain:**
   - Add domain in Resend Dashboard
   - Configure DNS records (SPF, DKIM, DMARC)
   - Wait for verification

2. **Update Environment Variables:**
   ```bash
   RESEND_API_KEY=re_your_production_key
   EMAIL_FROM=noreply@yourdomain.com
   SUPPORT_EMAIL=support@yourdomain.com
   ```

3. **Deploy:**
   - Add variables to your hosting platform (Vercel, Railway, etc.)
   - Deploy your application

## Troubleshooting

### Emails Not Sending

**Check server logs:**
```
# Success
Email sent successfully: re_abc123

# Not configured
RESEND_API_KEY not configured. Email not sent.

# Error
Failed to send approval email: [error details]
```

**Common Fixes:**
1. Verify `RESEND_API_KEY` is set in `.env.local`
2. Restart dev server after adding env variables
3. Check Resend API key is active in dashboard
4. Ensure influencer has valid email address

### Emails in Spam

**Development:**
- This is normal when using `onboarding@resend.dev`
- Check spam folder

**Production:**
- Verify domain in Resend
- Configure SPF/DKIM/DMARC records
- Use consistent "From" address

## Cost

**Resend Free Tier:**
- 100 emails per day
- 3,000 emails per month
- Perfect for development and small-scale production

**Paid Plans:**
- Pro: $20/month for 50,000 emails
- Scales with your needs

## Next Steps

1. ✅ Set up Resend API key
2. ✅ Test email sending locally
3. 📖 Read full documentation: `EMAIL_NOTIFICATION_SYSTEM.md`
4. 🚀 Deploy to production with verified domain

## Support

**Issues?**
- Full documentation: See `EMAIL_NOTIFICATION_SYSTEM.md`
- Resend docs: https://resend.com/docs
- React Email: https://react.email/docs

**Questions?**
- Check server logs for email sending status
- View sent emails in Resend Dashboard
- Ensure environment variables are set correctly
