import { Section, Text, Link } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './layout';

interface WithdrawalCompletedEmailProps {
  influencerName: string;
  amount: number;
  credits: number;
  requestedAt: string;
  completedAt: string;
  transactionId: string;
  etransferEmail: string;
  supportEmail?: string;
}

export const WithdrawalCompletedEmail = ({
  influencerName,
  amount,
  credits,
  requestedAt,
  completedAt,
  transactionId,
  etransferEmail,
  supportEmail = 'support@collabuu.com',
}: WithdrawalCompletedEmailProps) => {
  const formattedAmount = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);

  const formattedRequestDate = new Date(requestedAt).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedCompletedDate = new Date(completedAt).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <EmailLayout
      preview={`Your withdrawal of ${formattedAmount} has been completed`}
      heading="Payment Sent!"
      supportEmail={supportEmail}
    >
      <Text style={paragraph}>Hi {influencerName},</Text>

      <Text style={paragraph}>
        Excellent news! Your withdrawal has been completed and the e-transfer has been sent to
        your email address.
      </Text>

      <Section style={successBox}>
        <Text style={successIcon}>✓</Text>
        <Text style={successText}>
          <strong>{formattedAmount}</strong> has been sent via e-Transfer
        </Text>
      </Section>

      <Section style={box}>
        <Text style={boxTitle}>Transaction Details</Text>
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
              <td style={tableLabel}>Transaction ID:</td>
              <td style={tableValue}>
                <code style={code}>{transactionId}</code>
              </td>
            </tr>
            <tr>
              <td style={tableLabel}>Requested:</td>
              <td style={tableValue}>{formattedRequestDate}</td>
            </tr>
            <tr>
              <td style={tableLabel}>Completed:</td>
              <td style={tableValue}>{formattedCompletedDate}</td>
            </tr>
            <tr>
              <td style={tableLabel}>Status:</td>
              <td style={tableValue}>
                <span style={statusCompleted}>Completed</span>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Text style={paragraph}>
        <strong>Next Steps:</strong>
      </Text>
      <ol style={list}>
        <li style={listItem}>
          Check your email inbox at <strong>{etransferEmail}</strong>
        </li>
        <li style={listItem}>Look for an e-transfer notification from Interac</li>
        <li style={listItem}>Follow the instructions to accept and deposit the transfer</li>
        <li style={listItem}>Funds typically arrive within 30 minutes of accepting</li>
      </ol>

      <Section style={infoBox}>
        <Text style={infoTitle}>Keep This Information</Text>
        <Text style={infoText}>
          Save this email for your records. The transaction ID above can be used to track your
          payment if needed.
        </Text>
      </Section>

      <Text style={paragraph}>
        If you don't receive the e-transfer within a few hours, please check your spam folder
        first. If you still can't find it, contact us at{' '}
        <Link href={`mailto:${supportEmail}`} style={link}>
          {supportEmail}
        </Link>{' '}
        with your transaction ID.
      </Text>

      <Text style={signature}>
        Thank you for being part of Collabuu!
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

const successBox = {
  backgroundColor: '#d1fae5',
  borderRadius: '8px',
  border: '2px solid #10b981',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const successIcon = {
  fontSize: '48px',
  color: '#10b981',
  margin: '0 0 8px',
};

const successText = {
  color: '#065f46',
  fontSize: '20px',
  lineHeight: '28px',
  margin: '0',
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

const code = {
  backgroundColor: '#f3f4f6',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '13px',
  fontFamily: 'monospace',
};

const statusCompleted = {
  backgroundColor: '#d1fae5',
  color: '#065f46',
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

export default WithdrawalCompletedEmail;
