/**
 * Credits Purchase Page
 * Allows users to buy credit packages via Stripe
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CreditPackageCard } from '@/components/credits/credit-package-card';
import { TransactionHistory } from '@/components/credits/transaction-history';
import { useCreditBalance } from '@/lib/hooks/use-credit-balance';
import { usePurchaseCredits } from '@/lib/hooks/use-purchase-credits';
import { useAuth } from '@/lib/hooks/use-auth';
import { CREDIT_PACKAGES } from '@/lib/stripe/config';
import { CheckCircle2, XCircle, Coins, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

function CreditsPageContent() {
  const searchParams = useSearchParams();
  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCanceled, setShowCanceled] = useState(false);

  // Get user data from auth context
  const { user, token } = useAuth();
  const userId = user?.id;
  const userEmail = user?.email;

  // Fetch credit balance
  const { data: creditData, isLoading: isLoadingBalance, refetch } = useCreditBalance(token);

  // Purchase mutation
  const purchaseMutation = usePurchaseCredits();

  // Handle success/cancel from Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      setShowSuccess(true);
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
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

  const handlePurchase = (packageId: string) => {
    const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);

    if (!pkg || !userId || !userEmail) {
      return;
    }

    setPurchasingPackageId(packageId);

    purchaseMutation.mutate(
      {
        packageId: pkg.id,
        credits: pkg.credits,
        price: pkg.price,
        userId,
        businessId: userId, // Backend uses userId as businessId
        userEmail,
      },
      {
        onError: () => {
          setPurchasingPackageId(null);
        },
        onSettled: () => {
          // Don't reset purchasingPackageId here as it will redirect
        },
      }
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Buy Credits</h1>
        <p className="mt-2 text-gray-600">
          Purchase credits to run influencer campaigns
        </p>
      </div>

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

      {/* Current Balance */}
      <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-pink-100">Current Balance</p>
              {isLoadingBalance ? (
                <div className="mt-2 flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-2xl font-bold">Loading...</span>
                </div>
              ) : (
                <p className="mt-2 text-4xl font-bold">
                  {creditData?.credits?.toLocaleString() || 0} Credits
                </p>
              )}
              <p className="mt-1 text-sm text-pink-100">
                Available for campaigns
              </p>
            </div>
            <div className="rounded-full bg-white/20 p-4">
              <Coins className="h-12 w-12" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Packages */}
      <div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Choose a Package</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {CREDIT_PACKAGES.map((pkg) => (
            <CreditPackageCard
              key={pkg.id}
              package={pkg}
              onPurchase={handlePurchase}
              isLoading={purchasingPackageId === pkg.id}
              disabled={!!purchasingPackageId}
            />
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>How do credits work?</AccordionTrigger>
            <AccordionContent>
              Credits are used to run influencer campaigns on Collabuu. Each campaign requires
              a certain number of credits based on the number of influencers, reach, and other
              factors. You can purchase credits in packages and use them whenever you need to
              launch a campaign.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>What happens to unused credits?</AccordionTrigger>
            <AccordionContent>
              Unused credits never expire! They remain in your account indefinitely and can be
              used for any future campaigns. You can always check your current balance at the
              top of this page.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Can I get a refund?</AccordionTrigger>
            <AccordionContent>
              We offer refunds within 7 days of purchase if you haven't used any of the credits.
              Once credits have been used for campaigns, they cannot be refunded. Please contact
              our support team if you need assistance with a refund.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Is my payment information secure?</AccordionTrigger>
            <AccordionContent>
              Absolutely! We use Stripe, a PCI-compliant payment processor trusted by millions
              of businesses worldwide. We never store your credit card information on our servers.
              All payment data is encrypted and handled securely by Stripe.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>Do you offer bulk or enterprise pricing?</AccordionTrigger>
            <AccordionContent>
              Yes! If you need more than 5,000 credits or run campaigns regularly, please contact
              our sales team for custom pricing and enterprise plans. We offer volume discounts
              and dedicated support for high-volume users.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Transaction History */}
      {userId && <TransactionHistory businessId={userId} />}
    </div>
  );
}

export default function CreditsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <CreditsPageContent />
    </Suspense>
  );
}
