'use client';

import { useState } from 'react';
import { CreditCard, Loader2, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCreditBalance } from '@/lib/hooks/use-credit-balance';
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { CREDIT_PACKAGES } from '@/lib/stripe/config';

export function BillingTab() {
  // Get user data from auth context
  const { user, token } = useAuth();
  const userId = user?.id;
  const userEmail = user?.email;

  const { data: creditBalance } = useCreditBalance(token);
  const { toast } = useToast();

  const [purchasingPlanId, setPurchasingPlanId] = useState<string | null>(null);

  const handlePurchaseCredits = async (packageId: string) => {
    try {
      setPurchasingPlanId(packageId);

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId,
          userId,
          businessId: userId, // Backend uses userId as businessId
          userEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to initiate purchase. Please try again.',
        variant: 'destructive',
      });
      setPurchasingPlanId(null);
    }
  };

  return (
    <div className="space-y-8">
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

      {/* Credit Plans */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Purchase Credits</h3>
          <p className="text-sm text-gray-600">
            Choose a credit plan that fits your needs. Credits never expire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                'relative p-6 border rounded-lg transition-all hover:shadow-lg flex flex-col',
                pkg.recommended
                  ? 'border-pink-500 shadow-md bg-pink-50/50'
                  : 'border-gray-200 bg-white hover:border-pink-300'
              )}
            >
              {pkg.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-pink-500 hover:bg-pink-600">Recommended</Badge>
                </div>
              )}

              {pkg.discount && pkg.discount > 0 && (
                <div className={cn(
                  "absolute",
                  pkg.recommended ? "-top-3 -right-3" : "-top-2 right-4"
                )}>
                  <Badge className="bg-green-500 hover:bg-green-600 text-white font-semibold px-2.5 py-0.5">
                    Save {pkg.discount}%
                  </Badge>
                </div>
              )}

              <div className="flex-1 space-y-4">
                {/* Credits */}
                <div className="py-4 border-b">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-gray-900 tabular-nums">
                      {pkg.credits.toLocaleString()}
                    </span>
                    <span className="text-gray-500">credits</span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-center">
                  {pkg.discount && pkg.discount > 0 && (
                    <p className="text-sm text-gray-400 line-through mb-1">
                      ${pkg.credits.toLocaleString()}
                    </p>
                  )}
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-bold text-gray-900 tabular-nums">
                      ${Math.floor(pkg.price).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ${pkg.perCreditPrice.toFixed(2)} per credit
                  </p>
                </div>
              </div>

              {/* Purchase Button */}
              <Button
                onClick={() => handlePurchaseCredits(pkg.id)}
                disabled={purchasingPlanId === pkg.id}
                className={cn(
                  'w-full mt-4',
                  pkg.recommended
                    ? 'bg-pink-500 hover:bg-pink-600'
                    : 'bg-gray-900 hover:bg-gray-800'
                )}
              >
                {purchasingPlanId === pkg.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Purchase Now
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
