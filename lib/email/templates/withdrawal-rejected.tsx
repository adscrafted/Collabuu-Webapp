import { Section, Text, Link } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './layout';

interface WithdrawalRejectedEmailProps {
  influencerName: string;
  amount: number;
  credits: number;
  requestedAt: string;
  rejectedAt: string;
  rejectionReason: string;
  etransferEmail: string;
  supportEmail?: string;
}

export const WithdrawalRejectedEmail = ({
  influencerName,
  amount,
  credits,
  requestedAt,
  rejectedAt,
  rejectionReason,
  etransferEmail,
  supportEmail = 'support@collabuu.com',
}: WithdrawalRejectedEmailProps) => {
  const formattedAmount = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);

  const formattedRequestDate = new Date(requestedAt).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedRejectedDate = new Date(rejectedAt).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <EmailLayout
      preview={`Your withdrawal request of ${formattedAmount} has been declined`}
      heading="Withdrawal Request Declined"
      supportEmail={supportEmail}
    >
      <Text style={paragraph}>Hi {influencerName},</Text>

      <Text style={paragraph}>
        We regret to inform you that your withdrawal request has been declined. We understand this
        may be disappointing, and we want to provide clarity on why this decision was made.
      </Text>

      <Section style={box}>
        <Text style={boxTitle}>Withdrawal Details</Text>
        <table style={table}>
          <tbody>
            <tr>
              <td style={tableLabel}>Amount:</td>
              <td style={tableValue}>{formattedAmount}</td>
            </tr>
            <tr>
              <td style={tableLabel}>Credits:</td>
              <td style={tableValue}>{credits.toLocaleString()} credits</td>
            </tr>
            <tr>
              <td style={tableLabel}>Payment Method:</td>
              <td style={tableValue}>E-Transfer</td>
            </tr>
            <tr>
              <td style={tableLabel}>E-Transfer Email:</td>
              <td style={tableValue}>{etransferEmail}</td>
            </tr>
            <tr>
              <td style={tableLabel}>Requested:</td>
              <td style={tableValue}>{formattedRequestDate}</td>
            </tr>
            <tr>
              <td style={tableLabel}>Declined:</td>
              <td style={tableValue}>{formattedRejectedDate}</td>
            </tr>
            <tr>
              <td style={tableLabel}>Status:</td>
              <td style={tableValue}>
                <span style={statusRejected}>Declined</span>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section style={reasonBox}>
        <Text style={reasonTitle}>Reason for Decline</Text>
        <Text style={reasonText}>{rejectionReason}</Text>
      </Section>

      <Section style={infoBox}>
        <Text style={infoTitle}>Your Credits Have Been Restored</Text>
        <Text style={infoText}>
          The <strong>{credits.toLocaleString()} credits</strong> ({formattedAmount}) from this
          withdrawal request have been automatically returned to your account balance. You can use
          them immediately or submit a new withdrawal request once any issues are resolved.
        </Text>
      </Section>

      <Text style={paragraph}>
        <strong>What You Can Do Next:</strong>
      </Text>
      <ul style={list}>
        <li style={listItem}>Review the reason for decline above</li>
        <li style={listItem}>
          Update your account information if needed (e.g., verify your e-transfer email)
        </li>
        <li style={listItem}>Contact support if you need clarification or assistance</li>
        <li style={listItem}>Submit a new withdrawal request once the issue is resolved</li>
      </ul>

      <Text style={paragraph}>
        If you believe this was declined in error or have questions about the reason, please don't
        hesitate to reach out to our support team at{' '}
        <Link href={`mailto:${supportEmail}`} style={link}>
          {supportEmail}
        </Link>
        . We're here to help resolve any issues and get you paid.
      </Text>

      <Section style={supportBox}>
        <Text style={supportTitle}>Need Help?</Text>
        <Text style={supportText}>
          Our support team is available to assist you with:
        </Text>
        <ul style={supportList}>
          <li>Clarifying the decline reason</li>
          <li>Updating your payment information</li>
          <li>Verifying your account details</li>
          <li>Submitting a new withdrawal request</li>
        </ul>
      </Section>

      <Text style={signature}>
        We appreciate your understanding,
        <br />
        <br />
        Best regards,
        <br />
        The Collabuu Team
      </Text>
    </EmailLayout>
  );
};

// Styles
const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const box = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  padding: '24px',
  margin: '24px 0',
};

const boxTitle = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const tableLabel = {
  color: '#6b7280',
  fontSize: '14px',
  padding: '8px 0',
  verticalAlign: 'top' as const,
  width: '45%',
};

const tableValue = {
  color: '#1f2937',
  fontSize: '14px',
  fontWeight: '500',
  padding: '8px 0',
  verticalAlign: 'top' as const,
};

const statusRejected = {
  backgroundColor: '#fee2e2',
  color: '#991b1b',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 'bold',
  display: 'inline-block',
};

const reasonBox = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  border: '1px solid #fecaca',
  padding: '20px',
  margin: '24px 0',
};

const reasonTitle = {
  color: '#991b1b',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const reasonText = {
  color: '#7f1d1d',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0',
  fontStyle: 'italic',
};

const infoBox = {
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  border: '1px solid #bfdbfe',
  padding: '16px',
  margin: '24px 0',
};

const infoTitle = {
  color: '#1e40af',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const infoText = {
  color: '#1e40af',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const list = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
  paddingLeft: '24px',
};

const listItem = {
  margin: '8px 0',
};

const supportBox = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  border: '1px solid #bbf7d0',
  padding: '20px',
  margin: '24px 0',
};

const supportTitle = {
  color: '#166534',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const supportText = {
  color: '#166534',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
};

const supportList = {
  color: '#166534',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
  paddingLeft: '20px',
};

const link = {
  color: '#6366f1',
  textDecoration: 'underline',
};

const signature = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '32px 0 0',
};

export default WithdrawalRejectedEmail;
