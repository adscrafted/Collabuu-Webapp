import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@collabuu.com';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@collabuu.com';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
}

/**
 * Send an email using Resend
 * @param options Email options including recipient, subject, and React component
 * @returns Promise with email ID or error
 */
export async function sendEmail(options: SendEmailOptions) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured. Email not sent.');
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      react: options.react,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get the support email address
 */
export function getSupportEmail(): string {
  return SUPPORT_EMAIL;
}

/**
 * Get the from email address
 */
export function getFromEmail(): string {
  return EMAIL_FROM;
}

// Export email service status
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}
