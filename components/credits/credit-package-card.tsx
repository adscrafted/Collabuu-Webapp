/**
 * Credit Package Card Component
 * Displays a credit package with pricing and purchase button
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditPackage, formatCurrency, formatPerCreditPrice } from '@/lib/stripe/config';
import { Loader2, Sparkles } from 'lucide-react';

interface CreditPackageCardProps {
  package: CreditPackage;
  onPurchase: (packageId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function CreditPackageCard({
  package: pkg,
  onPurchase,
  isLoading = false,
  disabled = false,
}: CreditPackageCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handlePurchase = () => {
    if (!disabled && !isLoading) {
      onPurchase(pkg.id);
    }
  };

  return (
    <Card
      className={`relative transition-all duration-300 ${
        pkg.recommended
          ? 'border-pink-500 shadow-lg shadow-pink-500/20'
          : 'border-gray-200 hover:border-pink-300'
      } ${isHovered && !disabled ? 'transform scale-105' : ''} ${disabled ? 'opacity-50' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Best Value Badge */}
      {pkg.recommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-green-500 text-white px-4 py-1 text-sm font-semibold shadow-md">
            <Sparkles className="w-3 h-3 mr-1 inline" />
            Best Value
          </Badge>
        </div>
      )}

      {/* Discount Badge */}
      {pkg.discount && pkg.discount > 0 && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-pink-500 text-white px-3 py-1 text-xs font-semibold">
            {pkg.discount}% OFF
          </Badge>
        </div>
      )}

      <CardHeader className={pkg.recommended ? 'pt-6' : ''}>
        <CardTitle className="text-2xl font-bold text-center">
          {pkg.credits.toLocaleString()} Credits
        </CardTitle>
        <CardDescription className="text-center text-sm text-gray-500">
          {formatPerCreditPrice(pkg.perCreditPrice)} per credit
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center space-y-4">
        {/* Price */}
        <div className="space-y-1">
          <div className="text-4xl font-bold text-pink-600">
            {formatCurrency(pkg.price)}
          </div>
          <div className="text-sm text-gray-500">
            One-time payment
          </div>
        </div>

        {/* Features or Benefits */}
        <div className="space-y-2 text-sm text-gray-600">
          {pkg.credits >= 1000 && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Perfect for multiple campaigns</span>
            </div>
          )}
          {pkg.discount && pkg.discount >= 20 && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Maximum savings</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handlePurchase}
          disabled={disabled || isLoading}
          className={`w-full ${
            pkg.recommended
              ? 'bg-pink-600 hover:bg-pink-700'
              : 'bg-pink-500 hover:bg-pink-600'
          } text-white font-semibold py-6 text-lg transition-all`}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            'Buy Now'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
