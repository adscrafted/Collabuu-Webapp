/**
 * Environment Configuration Validator
 * Validates required environment variables at runtime
 * Helps catch configuration issues early
 */

interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate client-side environment variables
 * Call this in app initialization to catch issues early
 */
export function validateClientEnv(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Critical: Backend API URL
  if (!process.env.NEXT_PUBLIC_API_URL) {
    errors.push('NEXT_PUBLIC_API_URL is not configured. Backend API calls will fail.');
  } else {
    try {
      const url = new URL(process.env.NEXT_PUBLIC_API_URL);
      if (!url.protocol.startsWith('http')) {
        errors.push('NEXT_PUBLIC_API_URL must use http or https protocol');
      }
    } catch {
      errors.push('NEXT_PUBLIC_API_URL is not a valid URL');
    }
  }

  // Critical: Supabase configuration
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not configured. Authentication will fail.');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured. Authentication will fail.');
  }

  // Critical: Stripe publishable key
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured. Credit purchases will fail.');
  } else {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key.startsWith('pk_test_') && !key.startsWith('pk_live_')) {
      errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY appears to be invalid (must start with pk_test_ or pk_live_)');
    }
  }

  // Optional but recommended
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    warnings.push('NEXT_PUBLIC_APP_URL is not configured. Using fallback URLs for redirects.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate server-side environment variables
 * Call this in API routes or server components
 */
export function validateServerEnv(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Critical: Stripe secret key
  if (!process.env.STRIPE_SECRET_KEY) {
    errors.push('STRIPE_SECRET_KEY is not configured. Credit purchases will fail.');
  } else {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key.startsWith('sk_test_') && !key.startsWith('sk_live_')) {
      errors.push('STRIPE_SECRET_KEY appears to be invalid (must start with sk_test_ or sk_live_)');
    }
  }

  // Critical: Stripe webhook secret
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    errors.push('STRIPE_WEBHOOK_SECRET is not configured. Webhook verification will fail.');
  } else {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret.startsWith('whsec_')) {
      errors.push('STRIPE_WEBHOOK_SECRET appears to be invalid (must start with whsec_)');
    }
  }

  // Critical: Supabase service role key
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    warnings.push('SUPABASE_SERVICE_ROLE_KEY is not configured. Admin operations may fail.');
  }

  // Optional: Email configuration
  if (!process.env.RESEND_API_KEY) {
    warnings.push('RESEND_API_KEY is not configured. Email notifications will not be sent.');
  }

  if (!process.env.EMAIL_FROM) {
    warnings.push('EMAIL_FROM is not configured. Using default sender address.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Log validation results to console
 */
export function logValidationResults(results: EnvValidationResult, context: string): void {
  if (results.errors.length > 0) {
    console.error(`\n❌ Environment Configuration Errors (${context}):`);
    results.errors.forEach((error) => console.error(`  - ${error}`));
  }

  if (results.warnings.length > 0) {
    console.warn(`\n⚠️  Environment Configuration Warnings (${context}):`);
    results.warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  if (results.isValid && results.warnings.length === 0) {
    console.log(`✅ Environment configuration valid (${context})`);
  }
}

/**
 * Assert that environment is valid, throw error if not
 * Use this in critical paths where invalid config should prevent execution
 */
export function assertValidEnv(results: EnvValidationResult, context: string): void {
  if (!results.isValid) {
    const errorMessage = `Environment configuration invalid (${context}):\n${results.errors.join('\n')}`;
    throw new Error(errorMessage);
  }
}
