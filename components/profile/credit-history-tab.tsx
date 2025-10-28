'use client';

import { Clock, ArrowUp, ArrowDown, Loader2, AlertCircle, Coins } from 'lucide-react';
import { useCreditHistory } from '@/lib/hooks/use-credit-history';
import { useAuth } from '@/lib/hooks/use-auth';
import { BusinessCreditTransaction, getTransactionTypeInfo } from '@/lib/types/credit-history';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function CreditHistoryTab() {
  const { token } = useAuth();
  const { data, isLoading, error } = useCreditHistory(token);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load credit history. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const transactions = data?.transactions || [];
  const currentBalance = data?.currentBalance || 0;

  return (
    <div className="space-y-6">
      {/* Current Balance Header */}
      <div className="p-6 border rounded-lg bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Credit Balance</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-bold text-gray-900">
                {currentBalance.toLocaleString()}
              </h2>
              <span className="text-lg text-gray-500">credits</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="h-8 w-8 text-pink-500" />
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
          <p className="text-sm text-gray-600">
            View all credit purchases, campaign creations, and adjustments
          </p>
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Credit History</h3>
            <p className="text-sm text-gray-500">
              Your credit transactions will appear here
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance After
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction: BusinessCreditTransaction) => {
                    const typeInfo = getTransactionTypeInfo(transaction.type);
                    const isPositive = transaction.amount > 0;
                    const date = new Date(transaction.createdAt);

                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {isPositive ? (
                              <ArrowDown className={cn(
                                "h-4 w-4",
                                typeInfo.color === 'success' && "text-green-600",
                                typeInfo.color === 'error' && "text-red-600",
                                typeInfo.color === 'warning' && "text-yellow-600"
                              )} />
                            ) : (
                              <ArrowUp className={cn(
                                "h-4 w-4",
                                typeInfo.color === 'success' && "text-green-600",
                                typeInfo.color === 'error' && "text-red-600",
                                typeInfo.color === 'warning' && "text-yellow-600"
                              )} />
                            )}
                            <span className={cn(
                              "text-sm font-medium",
                              typeInfo.color === 'success' && "text-green-700",
                              typeInfo.color === 'error' && "text-red-700",
                              typeInfo.color === 'warning' && "text-yellow-700"
                            )}>
                              {typeInfo.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{transaction.description}</span>
                        </td>
                        <td className="px-6 py-4">
                          {transaction.campaignName ? (
                            <span className="text-sm text-gray-600">{transaction.campaignName}</span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {date.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={cn(
                            "text-sm font-semibold",
                            isPositive ? "text-green-600" : "text-red-600"
                          )}>
                            {isPositive ? '+' : ''}{transaction.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {transaction.balanceAfter !== null && transaction.balanceAfter !== undefined ? (
                            <span className="text-sm text-gray-900">
                              {transaction.balanceAfter.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
