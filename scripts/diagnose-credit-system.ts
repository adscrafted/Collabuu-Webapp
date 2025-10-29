/**
 * Credit System Diagnostic Script
 * Run this to diagnose issues with the credit purchase flow
 *
 * Usage:
 *   npx ts-node scripts/diagnose-credit-system.ts
 */

import axios from 'axios';

interface DiagnosticResult {
  category: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

const results: DiagnosticResult[] = [];

function addResult(category: string, status: 'pass' | 'fail' | 'warning', message: string, details?: any) {
  results.push({ category, status, message, details });
}

async function checkEnvironmentVariables() {
  console.log('\n🔍 Checking Environment Variables...\n');

  // Check client-side env vars
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    addResult('Environment', 'fail', 'NEXT_PUBLIC_API_URL is not set', {
      fix: 'Add NEXT_PUBLIC_API_URL to .env.local',
      example: 'NEXT_PUBLIC_API_URL=https://collabuu-production.up.railway.app',
    });
  } else {
    try {
      new URL(apiUrl);
      addResult('Environment', 'pass', `NEXT_PUBLIC_API_URL is set: ${apiUrl}`);
    } catch {
      addResult('Environment', 'fail', 'NEXT_PUBLIC_API_URL is not a valid URL', { value: apiUrl });
    }
  }

  // Check Supabase
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    addResult('Environment', 'fail', 'NEXT_PUBLIC_SUPABASE_URL is not set');
  } else {
    addResult('Environment', 'pass', 'NEXT_PUBLIC_SUPABASE_URL is set');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    addResult('Environment', 'fail', 'NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  } else {
    addResult('Environment', 'pass', 'NEXT_PUBLIC_SUPABASE_ANON_KEY is set');
  }

  // Check Stripe
  const stripePublishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!stripePublishable) {
    addResult('Environment', 'fail', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
  } else if (stripePublishable.startsWith('pk_test_')) {
    addResult('Environment', 'warning', 'Using Stripe TEST mode', { key: stripePublishable.substring(0, 20) + '...' });
  } else if (stripePublishable.startsWith('pk_live_')) {
    addResult('Environment', 'pass', 'Using Stripe LIVE mode', { key: stripePublishable.substring(0, 20) + '...' });
  } else {
    addResult('Environment', 'fail', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY appears invalid');
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    addResult('Environment', 'fail', 'STRIPE_SECRET_KEY is not set');
  } else if (stripeSecret.startsWith('sk_test_')) {
    addResult('Environment', 'warning', 'Using Stripe TEST secret key');
  } else if (stripeSecret.startsWith('sk_live_')) {
    addResult('Environment', 'pass', 'Using Stripe LIVE secret key');
  } else {
    addResult('Environment', 'fail', 'STRIPE_SECRET_KEY appears invalid');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    addResult('Environment', 'fail', 'STRIPE_WEBHOOK_SECRET is not set', {
      fix: 'For local: Run `stripe listen --forward-to localhost:3000/api/stripe/webhook`',
      note: 'Copy the webhook secret from CLI output',
    });
  } else if (webhookSecret.startsWith('whsec_')) {
    addResult('Environment', 'pass', 'STRIPE_WEBHOOK_SECRET is set');
  } else {
    addResult('Environment', 'fail', 'STRIPE_WEBHOOK_SECRET appears invalid (must start with whsec_)');
  }
}

async function checkBackendConnection() {
  console.log('\n🔍 Checking Backend Connection...\n');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    addResult('Backend', 'fail', 'Cannot check backend - API URL not configured');
    return;
  }

  // Check if backend is reachable
  try {
    const response = await axios.get(`${apiUrl}/health`, { timeout: 5000 });
    addResult('Backend', 'pass', 'Backend is reachable', {
      status: response.status,
      url: apiUrl,
    });
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      addResult('Backend', 'fail', 'Backend is not running or unreachable', {
        url: apiUrl,
        error: 'Connection refused',
        fix: 'Start your backend server or verify the URL is correct',
      });
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      addResult('Backend', 'fail', 'Backend connection timed out', {
        url: apiUrl,
        error: error.code,
        fix: 'Check if the backend URL is correct and accessible',
      });
    } else if (error.response?.status === 404) {
      addResult('Backend', 'warning', 'Backend reachable but /health endpoint not found', {
        url: apiUrl,
        note: 'This is okay if your backend does not have a /health endpoint',
      });
    } else {
      addResult('Backend', 'warning', 'Backend check failed', {
        url: apiUrl,
        error: error.message,
      });
    }
  }

  // Check if payment verification endpoint exists
  // Note: This requires authentication, so we expect 401 if endpoint exists
  try {
    await axios.post(`${apiUrl}/api/business/stripe/verify-payment`, {}, { timeout: 5000 });
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      addResult('Backend', 'pass', 'Payment verification endpoint exists (requires auth)', {
        endpoint: '/api/business/stripe/verify-payment',
      });
    } else if (error.response?.status === 404) {
      addResult('Backend', 'fail', 'Payment verification endpoint NOT FOUND', {
        endpoint: '/api/business/stripe/verify-payment',
        fix: 'Implement this endpoint in your backend',
      });
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      // Already reported above
    } else {
      addResult('Backend', 'warning', 'Could not verify payment endpoint', {
        endpoint: '/api/business/stripe/verify-payment',
        error: error.message,
      });
    }
  }
}

async function checkStripeConfiguration() {
  console.log('\n🔍 Checking Stripe Configuration...\n');

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    addResult('Stripe', 'fail', 'Cannot check Stripe - secret key not configured');
    return;
  }

  try {
    // Try to initialize Stripe and check if key is valid
    const Stripe = require('stripe');
    const stripe = new Stripe(stripeSecret, { apiVersion: '2025-09-30.clover' });

    // Test API connection
    await stripe.balance.retrieve();
    addResult('Stripe', 'pass', 'Stripe API key is valid and working');
  } catch (error: any) {
    if (error.type === 'StripeAuthenticationError') {
      addResult('Stripe', 'fail', 'Stripe API key is invalid', {
        error: error.message,
        fix: 'Check your STRIPE_SECRET_KEY in .env.local',
      });
    } else {
      addResult('Stripe', 'warning', 'Could not verify Stripe connection', {
        error: error.message,
      });
    }
  }
}

function printResults() {
  console.log('\n' + '='.repeat(80));
  console.log('DIAGNOSTIC RESULTS');
  console.log('='.repeat(80) + '\n');

  const grouped = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, DiagnosticResult[]>);

  for (const [category, categoryResults] of Object.entries(grouped)) {
    console.log(`\n📋 ${category}:\n`);

    for (const result of categoryResults) {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
      console.log(`  ${icon} ${result.message}`);

      if (result.details) {
        for (const [key, value] of Object.entries(result.details)) {
          if (typeof value === 'string') {
            console.log(`     ${key}: ${value}`);
          } else {
            console.log(`     ${key}:`, value);
          }
        }
      }
    }
  }

  // Summary
  const passCount = results.filter((r) => r.status === 'pass').length;
  const failCount = results.filter((r) => r.status === 'fail').length;
  const warnCount = results.filter((r) => r.status === 'warning').length;

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`⚠️  Warnings: ${warnCount}`);

  if (failCount > 0) {
    console.log('\n⚠️  CRITICAL: Fix failed checks before attempting credit purchases');
  } else if (warnCount > 0) {
    console.log('\n⚠️  System may work but warnings should be addressed');
  } else {
    console.log('\n✅ All checks passed! Credit system should work correctly');
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('CREDIT SYSTEM DIAGNOSTICS');
  console.log('='.repeat(80));

  await checkEnvironmentVariables();
  await checkBackendConnection();
  await checkStripeConfiguration();

  printResults();
}

// Run diagnostics
main().catch((error) => {
  console.error('\n❌ Diagnostic script failed:', error);
  process.exit(1);
});
