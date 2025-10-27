/**
 * Stripe Configuration
 * Credit package definitions matching iOS In-App Purchase system
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe client-side (singleton pattern)
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!key) {
      console.error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
      throw new Error('Stripe publishable key is not configured');
    }

    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

// Pricing tier definition for volume discounts
export interface PricingTier {
  minCredits: number;
  maxCredits?: number;
  perCreditPrice: number;
  discount: number;
  label: string;
}

// Volume-based pricing tiers (baseline: $0.99 per credit)
export const PRICING_TIERS: PricingTier[] = [
  {
    minCredits: 100,
    maxCredits: 499,
    perCreditPrice: 0.99,
    discount: 0,
    label: 'Starter',
  },
  {
    minCredits: 500,
    maxCredits: 999,
    perCreditPrice: 0.89,
    discount: 10,
    label: 'Save 10%',
  },
  {
    minCredits: 1000,
    maxCredits: 2499,
    perCreditPrice: 0.84,
    discount: 15,
    label: 'Save 15%',
  },
  {
    minCredits: 2500,
    maxCredits: 4999,
    perCreditPrice: 0.79,
    discount: 20,
    label: 'Save 20%',
  },
  {
    minCredits: 5000,
    perCreditPrice: 0.74,
    discount: 25,
    label: 'Save 25%',
  },
];

// Calculate pricing for a given credit amount
export interface CreditPricing {
  credits: number;
  price: number;
  perCreditPrice: number;
  discount: number;
  baselinePrice: number; // What they would pay at baseline
  savings: number;
  tier: PricingTier;
}

export const calculateCreditPricing = (credits: number): CreditPricing => {
  // Ensure minimum of 100 credits
  const normalizedCredits = Math.max(100, credits);

  // Find the applicable tier
  const tier = PRICING_TIERS.find(
    (t) => normalizedCredits >= t.minCredits && (!t.maxCredits || normalizedCredits <= t.maxCredits)
  ) || PRICING_TIERS[PRICING_TIERS.length - 1]; // Default to highest tier if over max

  const price = normalizedCredits * tier.perCreditPrice;
  const baselinePrice = normalizedCredits * 0.99;
  const savings = baselinePrice - price;

  return {
    credits: normalizedCredits,
    price: Math.round(price * 100) / 100, // Round to 2 decimals
    perCreditPrice: tier.perCreditPrice,
    discount: tier.discount,
    baselinePrice: Math.round(baselinePrice * 100) / 100,
    savings: Math.round(savings * 100) / 100,
    tier,
  };
};

// Suggested credit amounts for quick selection
export const SUGGESTED_AMOUNTS = [100, 500, 1000, 2500, 5000, 10000];

// Legacy credit package type for backward compatibility
export interface CreditPackage {
  id: string;
  productId: string;
  credits: number;
  price: number;
  priceId?: string;
  testPriceId?: string;
  livePriceId?: string;
  displayPrice: string;
  perCreditPrice: number;
  discount?: number;
  recommended?: boolean;
}

// Legacy credit packages for backward compatibility (deprecated - use slider with calculateCreditPricing instead)
export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: '100credits',
    productId: '100credits',
    credits: 100,
    price: 99,
    testPriceId: 'price_1SMbYPQ9ffGKoXMhcaHpsha4',
    livePriceId: 'price_1SMb79LcpseE8lIqQBB81a0N',
    displayPrice: '$99',
    perCreditPrice: 0.99,
    discount: 0,
  },
  {
    id: '500credits',
    productId: '500credits',
    credits: 500,
    price: 445,
    testPriceId: 'price_1SMbdZQ9ffGKoXMhQ21BA3oA',
    livePriceId: 'price_1SMbDjLcpseE8lIqg73UrIsJ',
    displayPrice: '$445',
    perCreditPrice: 0.89,
    discount: 10,
  },
  {
    id: '1000credits',
    productId: '1000credits',
    credits: 1000,
    price: 840,
    testPriceId: 'price_1SMbdcQ9ffGKoXMhnVC9FVHD',
    livePriceId: 'price_1SMbG6LcpseE8lIqnttgJcUe',
    displayPrice: '$840',
    perCreditPrice: 0.84,
    discount: 15,
    recommended: true,
  },
  {
    id: '2500credits',
    productId: '2500credits',
    credits: 2500,
    price: 1975,
    testPriceId: 'price_1SMbgwQ9ffGKoXMhyYsyF1FK',
    livePriceId: 'price_1SMbGQLcpseE8lIqFgUVQorx',
    displayPrice: '$1,975',
    perCreditPrice: 0.79,
    discount: 20,
  },
  {
    id: '5000credits',
    productId: '5000credits',
    credits: 5000,
    price: 3700,
    testPriceId: 'price_1SMbiIQ9ffGKoXMhEzj5aqHI',
    livePriceId: 'price_1SMbKDLcpseE8lIq6bOOdOx4',
    displayPrice: '$3,700',
    perCreditPrice: 0.74,
    discount: 25,
  },
].map(pkg => ({
  ...pkg,
  priceId: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_')
    ? pkg.testPriceId
    : pkg.livePriceId
}));

// Helper function to get package by ID (legacy)
export const getCreditPackageById = (packageId: string): CreditPackage | undefined => {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === packageId);
};

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Helper function to format per-credit price
export const formatPerCreditPrice = (perCreditPrice: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(perCreditPrice);
};
