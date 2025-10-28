import { Section, Text, Link } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './layout';

interface WithdrawalApprovedEmailProps {
  influencerName: string;
  amount: number;
  credits: number;
  requestedAt: string;
  etransferEmail: string;
  supportEmail?: string;
}

export const WithdrawalApprovedEmail = ({
  influencerName,
  amount,
  credits,
  requestedAt,
  etransferEmail,
  supportEmail = 'support@collabuu.com',
}: WithdrawalApprovedEmailProps) => {
  const formattedAmount = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);

  const formattedDate = new Date(requestedAt).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <EmailLayout
      preview={`Your withdrawal of ${formattedAmount} has been approved`}
      heading="Withdrawal Approved"
      supportEmail={supportEmail}
    >
      <Text style={paragraph}>Hi {influencerName},</Text>

      <Text style={paragraph}>
        Great news! Your withdrawal request has been approved and is being processed.
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
              <td style={tableValue}>{formattedDate}</td>
            </tr>
            <tr>
              <td style={tableLabel}>Status:</td>
              <td style={tableValue}>
                <span style={statusApproved}>Approved</span>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Text style={paragraph}>
        Your payment is now being processed. You will receive another email once the e-transfer
        has been sent to <strong>{etransferEmail}</strong>.
      </Text>

      <Text style={paragraph}>
        <strong>What's Next?</strong>
      </Text>
      <ul style={list}>
        <li style={listItem}>Your e-transfer will be sent within 1-2 business days</li>
        <li style={listItem}>You'll receive a notification when the transfer is completed</li>
        <li style={listItem}>Accept the e-transfer in your email to receive the funds</li>
      </ul>

      <Text style={paragraph}>
        If you have any questions or concerns, please don't hesitate to contact our support team
        at{' '}
        <Link href={`mailto:${supportEmail}`} style={link}>
          {supportEmail}
        </Link>
        .
      </Text>

      <Text style={signature}>
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

const statusApproved = {
  backgroundColor: '#dbeafe',
  color: '#1e40af',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 'bold',
  display: 'inline-block',
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

export default WithdrawalApprovedEmail;
