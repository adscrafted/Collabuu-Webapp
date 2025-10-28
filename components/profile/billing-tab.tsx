'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditCard, Loader2, Coins, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCreditBalance } from '@/lib/hooks/use-credit-balance';
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { calculateCreditPricing, SUGGESTED_AMOUNTS, PRICING_TIERS } from '@/lib/stripe/config';

export function BillingTab() {
  const searchParams = useSearchParams();

  // Get user data from auth context
  const { user, token } = useAuth();
  const userId = user?.id;
  const userEmail = user?.email;

  const { data: creditBalance, refetch } = useCreditBalance(token);
  const { toast } = useToast();

  const [creditAmount, setCreditAmount] = useState(1000);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCanceled, setShowCanceled] = useState(false);

  // Handle success/cancel from Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      setShowSuccess(true);
      // Refetch balance
      refetch();
      // Clear success message after 10 seconds
      setTimeout(() => setShowSuccess(false), 10000);
    }

    if (canceled === 'true') {
      setShowCanceled(true);
      // Clear cancel message after 5 seconds
      setTimeout(() => setShowCanceled(false), 5000);
    }
  }, [searchParams, refetch]);

  // Calculate pricing based on current slider value
  const pricing = calculateCreditPricing(creditAmount);

  const handlePurchaseCredits = async () => {
    try {
      setIsPurchasing(true);

      // Create Stripe checkout session with dynamic amount
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credits: pricing.credits,
          amount: pricing.price,
          userId,
          businessId: userId, // Backend uses userId as businessId
          userEmail,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Checkout session creation failed:', responseData);
        throw new Error(responseData.message || 'Failed to create checkout session');
      }

      const { url } = responseData;

      if (!url) {
        throw new Error('No checkout URL returned from server');
      }

      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to initiate purchase. Please try again.',
        variant: 'destructive',
      });
      setIsPurchasing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Success Alert */}
      {showSuccess && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-900">Payment Successful!</AlertTitle>
          <AlertDescription className="text-green-800">
            Your credits have been added to your account. Thank you for your purchase!
          </AlertDescription>
        </Alert>
      )}

      {/* Canceled Alert */}
      {showCanceled && (
        <Alert className="border-orange-500 bg-orange-50">
          <XCircle className="h-5 w-5 text-orange-600" />
          <AlertTitle className="text-orange-900">Payment Canceled</AlertTitle>
          <AlertDescription className="text-orange-800">
            Your payment was canceled. No charges were made.
          </AlertDescription>
        </Alert>
      )}

      {/* Credit Balance */}
      <div className="p-6 border rounded-lg bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Credit Balance</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-bold text-gray-900">
                {(creditBalance?.credits || 0).toLocaleString()}
              </h2>
              <span className="text-lg text-gray-500">credits</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="h-8 w-8 text-pink-500" />
          </div>
        </div>
      </div>

      {/* Credit Purchase with Slider */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Purchase Credits</h3>
          <p className="text-sm text-gray-600">
            Select the amount of credits you need. Credits never expire. Higher volumes get better rates!
          </p>
        </div>

        {/* Main Purchase Card */}
        <div className="border rounded-lg p-8 bg-white shadow-sm">
          {/* Credit Amount Display */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-5xl font-bold text-gray-900 tabular-nums">
                {pricing.credits.toLocaleString()}
              </span>
              <span className="text-2xl text-gray-500">credits</span>
            </div>
            {pricing.discount > 0 && (
              <Badge
                className="bg-green-500 hover:bg-green-600 text-white font-semibold transition-all duration-500"
                style={{
                  boxShadow: `0 0 ${Math.min(pricing.discount, 30)}px rgba(34, 197, 94, ${0.3 + (pricing.discount / 100)})`,
                }}
              >
                {pricing.tier.label}
              </Badge>
            )}
          </div>

          {/* Slider */}
          <div className="mb-8 px-4">
            <Slider
              value={[creditAmount]}
              onValueChange={(value) => setCreditAmount(value[0])}
              min={100}
              max={10000}
              step={50}
              className="w-full"
            />
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Credits</span>
              <span className="font-semibold">{pricing.credits.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Price per credit</span>
              <span className="font-semibold">${pricing.perCreditPrice.toFixed(2)}</span>
            </div>
            {pricing.discount > 0 && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 line-through">Base price</span>
                  <span className="text-gray-400 line-through">
                    ${pricing.baselinePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-green-600">
                  <span className="font-medium flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    You save ({pricing.discount}%)
                  </span>
                  <span
                    className="font-bold transition-all duration-500"
                    style={{
                      textShadow: `0 0 ${Math.min(pricing.discount / 2, 15)}px rgba(34, 197, 94, ${0.4 + (pricing.discount / 80)})`,
                    }}
                  >${pricing.savings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </>
            )}
            <div className="border-t pt-3 flex items-center justify-between">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-3xl font-bold text-gray-900 tabular-nums">
                ${pricing.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Purchase Button */}
          <Button
            onClick={handlePurchaseCredits}
            disabled={isPurchasing}
            className="w-full bg-pink-500 hover:bg-pink-600 text-lg py-6"
          >
            {isPurchasing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Purchase {pricing.credits.toLocaleString()} Credits for ${pricing.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
