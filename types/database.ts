/**
 * Database Schema Type Definitions
 *
 * This file contains TypeScript interfaces for database tables with comprehensive
 * documentation to prevent schema misunderstandings and bugs.
 */

/**
 * Credit Transaction Record
 *
 * Tracks all credit-related transactions (purchases, campaign deductions, refunds).
 *
 * CRITICAL: FIELD SEMANTICS THAT CAUSED BUGS
 * ============================================
 *
 * The `amount` and `credits` fields have DIFFERENT meanings depending on transaction type:
 *
 * ## `amount` field:
 * - For `purchase` transactions: **Price paid in cents** (e.g., 1875 = $18.75 paid)
 * - For `campaign_create`: **Negative credit quantity** deducted (e.g., -1000 credits)
 * - For `refund`: **Positive credit quantity** returned (e.g., +500 credits)
 * - For `bonus`: **Credit quantity** added (e.g., +100 credits)
 *
 * ## `credits` field:
 * - **ALWAYS represents the actual number of credits** involved in the transaction
 * - For `purchase`: Number of credits purchased (e.g., 2500 credits)
 * - For `campaign_create`: Negative credits deducted (e.g., -1000 credits)
 * - For `refund`: Positive credits returned (e.g., +500 credits)
 * - For `bonus`: Positive credits added (e.g., +100 credits)
 * - May be `null` for older/legacy transactions (see backward compatibility below)
 *
 * ## CONCRETE EXAMPLE:
 * ```typescript
 * // Purchase: User pays $18.75 to buy 2500 credits
 * {
 *   transaction_type: 'purchase',
 *   amount: 1875,        // Price: $18.75 in cents
 *   credits: 2500,       // Credits: 2500 credits purchased
 * }
 *
 * // Campaign: User creates campaign costing 1000 credits
 * {
 *   transaction_type: 'campaign_create',
 *   amount: -1000,       // -1000 credits deducted
 *   credits: -1000,      // -1000 credits deducted (same as amount)
 * }
 *
 * // Refund: Campaign cancelled, return 1000 credits
 * {
 *   transaction_type: 'refund',
 *   amount: 1000,        // +1000 credits returned
 *   credits: 1000,       // +1000 credits returned (same as amount)
 * }
 * ```
 *
 * ## USAGE GUIDELINES:
 *
 * ### For Credit Balance Calculations:
 * ```typescript
 * // ALWAYS use the `credits` field with fallback to `amount` for legacy records
 * const creditChange = transaction.credits ?? transaction.amount;
 * const newBalance = currentBalance + creditChange;
 * ```
 *
 * ### For Financial Reporting (Revenue):
 * ```typescript
 * // ONLY use `amount` for purchase transactions
 * if (transaction.transaction_type === 'purchase') {
 *   const revenueCents = transaction.amount;
 *   const revenueDollars = revenueCents / 100;
 * }
 * ```
 *
 * ### For Display to Users:
 * ```typescript
 * // Use `credits` to show credit impact
 * const displayCredits = transaction.credits ?? transaction.amount;
 * const sign = displayCredits >= 0 ? '+' : '';
 * console.log(`${sign}${displayCredits} credits`);
 *
 * // For purchases, also show price paid
 * if (transaction.transaction_type === 'purchase') {
 *   const priceDollars = (transaction.amount / 100).toFixed(2);
 *   console.log(`Purchased ${displayCredits} credits for $${priceDollars}`);
 * }
 * ```
 *
 * ## BACKWARD COMPATIBILITY:
 * The `credits` field may be `null` for older transactions created before the field was added.
 * For these legacy records, the `amount` field contains the credit quantity for all transaction types.
 * Always use the pattern: `credits ?? amount` for safe access.
 *
 * ## WHY THIS CONFUSION EXISTS:
 * Originally, only the `amount` field existed and it served dual purposes:
 * 1. For purchases: stored the price in cents
 * 2. For other types: stored the credit quantity
 *
 * The `credits` field was added later to disambiguate purchases, where price ≠ credits.
 * This led to the bug where developers confused "amount paid" with "credits received".
 */
export interface CreditTransaction {
  /** Unique identifier for the transaction */
  id: string;

  /** Business/organization that owns this transaction */
  business_id: string;

  /**
   * Type of credit transaction
   * - `purchase`: User bought credits with money
   * - `campaign_create`: Credits deducted to create/run a campaign
   * - `refund`: Credits returned (e.g., campaign cancelled)
   * - `bonus`: Free credits awarded (e.g., promotional bonus)
   */
  transaction_type: 'purchase' | 'campaign_create' | 'refund' | 'bonus';

  /**
   * PRICE PAID in cents (for purchases) OR CREDIT QUANTITY (for other types)
   *
   * **For `purchase` transactions:**
   * - Represents the **dollar amount paid × 100** (e.g., 1875 = $18.75)
   * - This is NOT the number of credits purchased
   * - Use this for financial/revenue reporting
   *
   * **For other transaction types (campaign_create, refund, bonus):**
   * - Represents the **credit quantity** (may be negative)
   * - For credit calculations, prefer the `credits` field instead
   *
   * @example
   * // Purchase: User pays $18.75
   * amount: 1875  // $18.75 in cents
   *
   * // Campaign: Deduct 1000 credits
   * amount: -1000  // -1000 credits
   *
   * // Refund: Return 500 credits
   * amount: 500  // +500 credits
   */
  amount: number;

  /**
   * ACTUAL CREDITS involved in this transaction
   *
   * **ALWAYS use this field for credit balance calculations.**
   * This field explicitly represents the credit quantity for all transaction types.
   *
   * - For `purchase`: Positive number of credits purchased (e.g., 2500)
   * - For `campaign_create`: Negative number of credits deducted (e.g., -1000)
   * - For `refund`: Positive number of credits returned (e.g., +500)
   * - For `bonus`: Positive number of credits awarded (e.g., +100)
   *
   * **May be `null` for legacy transactions** created before this field existed.
   * Use fallback pattern: `credits ?? amount` for backward compatibility.
   *
   * @example
   * // Purchase: Buy 2500 credits for $18.75
   * credits: 2500  // Number of credits purchased
   * amount: 1875   // Price paid in cents
   *
   * // Calculate balance change safely
   * const creditChange = transaction.credits ?? transaction.amount;
   */
  credits: number | null;

  /**
   * Transaction status
   * - `pending`: Transaction initiated but not completed
   * - `completed`: Transaction successfully processed
   * - `failed`: Transaction failed (e.g., payment declined)
   * - `cancelled`: Transaction was cancelled
   */
  status: 'pending' | 'completed' | 'failed' | 'cancelled';

  /**
   * Human-readable description of the transaction
   * Useful for displaying to users or debugging
   *
   * @example "Purchased 2500 credits for $18.75"
   * @example "Campaign 'Summer Sale' created (-1000 credits)"
   */
  description: string | null;

  /**
   * Related database table name (if this transaction is linked to another record)
   *
   * @example "campaigns" - Transaction relates to a campaign
   * @example "payment_intents" - Transaction relates to a Stripe payment
   */
  related_table: string | null;

  /**
   * ID of the related record in the related_table
   * Use with `related_table` to look up the associated record
   *
   * @example If related_table is "campaigns", this is the campaign_id
   */
  related_id: string | null;

  /** Timestamp when the transaction was created (ISO 8601 format) */
  created_at: string;

  /** Timestamp when the transaction was last updated (ISO 8601 format) */
  updated_at: string;
}

/**
 * Helper type for calculating credit balance from transactions
 * This type makes the usage pattern explicit
 */
export type CreditBalanceCalculation = {
  /**
   * Get the credit change for a transaction, handling legacy records
   *
   * @param transaction - The credit transaction
   * @returns The number of credits to add/subtract from balance
   *
   * @example
   * const balance = transactions.reduce((sum, txn) => {
   *   return sum + (txn.credits ?? txn.amount);
   * }, 0);
   */
  getCreditChange: (transaction: CreditTransaction) => number;
};

/**
 * Helper type for filtering purchase transactions for revenue reporting
 */
export type PurchaseTransaction = CreditTransaction & {
  transaction_type: 'purchase';
  /**
   * For purchase transactions, `amount` is always the price in cents
   * Use this for revenue calculations
   */
  amount: number;
};

/**
 * Type guard to check if a transaction is a purchase (for revenue reporting)
 *
 * @example
 * if (isPurchaseTransaction(transaction)) {
 *   const revenue = transaction.amount / 100; // Safe to treat as price
 * }
 */
export function isPurchaseTransaction(
  transaction: CreditTransaction
): transaction is PurchaseTransaction {
  return transaction.transaction_type === 'purchase';
}
