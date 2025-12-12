/**
 * Credit Service
 * Manages credit balances, transactions, and credit operations
 *
 * TODO: Implement actual credit management logic
 */

import { getDb } from "../db";
import { user_credits, credit_transactions } from "../../drizzle/schema-lead-enrichment";
import { eq, and, desc, sql } from "drizzle-orm";
import { cacheService, CACHE_TTL } from "./cache.service";
import { cacheKeys } from "../lib/cacheKeys";

export type CreditType = "enrichment" | "calling" | "scraping";
export type TransactionType = "purchase" | "usage" | "refund" | "adjustment";

export interface CreditBalance {
  balance: number;
  totalPurchased: number;
  totalUsed: number;
}

export interface CreditTransaction {
  id: number;
  userId: number;
  creditType: CreditType;
  transactionType: TransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export class CreditService {
  /**
   * Get all credit balances for a user
   */
  async getAllBalances(userId: number): Promise<Record<CreditType, CreditBalance>> {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const creditTypes: CreditType[] = ["enrichment", "calling", "scraping"];
    const balances: Record<string, CreditBalance> = {};

    for (const creditType of creditTypes) {
      const result = await db
        .select()
        .from(user_credits)
        .where(and(eq(user_credits.userId, userId), eq(user_credits.creditType, creditType)))
        .limit(1);

      if (result.length > 0) {
        balances[creditType] = {
          balance: result[0].balance || 0,
          totalPurchased: result[0].totalPurchased || 0,
          totalUsed: result[0].totalUsed || 0,
        };
      } else {
        // Initialize credit record if it doesn't exist
        await db.insert(user_credits).values({
          userId,
          creditType,
          balance: 0,
          totalPurchased: 0,
          totalUsed: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        balances[creditType] = {
          balance: 0,
          totalPurchased: 0,
          totalUsed: 0,
        };
      }
    }

    return balances as Record<CreditType, CreditBalance>;
  }

  /**
   * Get balance for a specific credit type
   * Cached with 60 second TTL
   */
  async getBalance(userId: number, creditType: CreditType): Promise<number> {
    const cacheKey = `${cacheKeys.userCredits(userId.toString())}:${creditType}`;

    // Try to get from cache first
    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        const result = await db
          .select()
          .from(user_credits)
          .where(and(eq(user_credits.userId, userId), eq(user_credits.creditType, creditType)))
          .limit(1);

        if (result.length > 0) {
          return result[0].balance || 0;
        }

        // Initialize credit record if it doesn't exist
        await db.insert(user_credits).values({
          userId,
          creditType,
          balance: 0,
          totalPurchased: 0,
          totalUsed: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return 0;
      },
      CACHE_TTL.SHORT // 60 seconds
    );
  }

  /**
   * Check if user has sufficient credits
   * TODO: Implement actual balance check
   */
  async checkBalance(userId: number, creditType: CreditType, required: number): Promise<boolean> {
    const balance = await this.getBalance(userId, creditType);
    return balance >= required;
  }

  /**
   * Add credits to user account
   */
  async addCredits(
    userId: number,
    amount: number,
    creditType: CreditType,
    description: string,
    transactionType: TransactionType,
    metadata?: Record<string, any>
  ): Promise<void> {
    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Use database transaction for atomicity
    await db.transaction(async (tx) => {
      // Get or create user credit record
      const existingCredit = await tx
        .select()
        .from(user_credits)
        .where(and(eq(user_credits.userId, userId), eq(user_credits.creditType, creditType)))
        .limit(1);

      let newBalance: number;

      if (existingCredit.length > 0) {
        const current = existingCredit[0];
        newBalance = (current.balance || 0) + amount;
        const newTotalPurchased = transactionType === "purchase"
          ? (current.totalPurchased || 0) + amount
          : current.totalPurchased || 0;

        // Update existing record
        await tx
          .update(user_credits)
          .set({
            balance: newBalance,
            totalPurchased: newTotalPurchased,
            updatedAt: new Date(),
          })
          .where(eq(user_credits.id, current.id));
      } else {
        // Create new record
        newBalance = amount;
        await tx.insert(user_credits).values({
          userId,
          creditType,
          balance: newBalance,
          totalPurchased: transactionType === "purchase" ? amount : 0,
          totalUsed: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Create transaction record
      await tx.insert(credit_transactions).values({
        userId,
        creditType,
        transactionType,
        amount,
        balanceAfter: newBalance,
        description,
        metadata,
        createdAt: new Date(),
      });
    });

    // Invalidate cache after adding credits
    const cacheKey = `${cacheKeys.userCredits(userId.toString())}:${creditType}`;
    await cacheService.delete(cacheKey);
  }

  /**
   * Deduct credits from user account
   */
  async deductCredits(
    userId: number,
    amount: number,
    creditType: CreditType,
    description: string,
    referenceId?: string,
    referenceType?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Use database transaction for atomicity
    await db.transaction(async (tx) => {
      // Get user credit record
      const existingCredit = await tx
        .select()
        .from(user_credits)
        .where(and(eq(user_credits.userId, userId), eq(user_credits.creditType, creditType)))
        .limit(1);

      if (existingCredit.length === 0) {
        throw new Error(`No credits found for user ${userId} and type ${creditType}`);
      }

      const current = existingCredit[0];
      const currentBalance = current.balance || 0;

      // Check sufficient balance
      if (currentBalance < amount) {
        throw new Error(
          `Insufficient credits. Required: ${amount}, Available: ${currentBalance}`
        );
      }

      const newBalance = currentBalance - amount;
      const newTotalUsed = (current.totalUsed || 0) + amount;

      // Update balance
      await tx
        .update(user_credits)
        .set({
          balance: newBalance,
          totalUsed: newTotalUsed,
          updatedAt: new Date(),
        })
        .where(eq(user_credits.id, current.id));

      // Create transaction record (negative amount for deduction)
      await tx.insert(credit_transactions).values({
        userId,
        creditType,
        transactionType: "usage",
        amount: -amount, // Negative for deduction
        balanceAfter: newBalance,
        description,
        referenceId,
        referenceType,
        metadata,
        createdAt: new Date(),
      });
    });

    // Invalidate cache after deducting credits
    const cacheKey = `${cacheKeys.userCredits(userId.toString())}:${creditType}`;
    await cacheService.delete(cacheKey);
  }

  /**
   * Refund credits by reversing a transaction
   */
  async refundCredits(transactionId: number): Promise<void> {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Get the original transaction
    const originalTransaction = await db
      .select()
      .from(credit_transactions)
      .where(eq(credit_transactions.id, transactionId))
      .limit(1);

    if (originalTransaction.length === 0) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    const original = originalTransaction[0];

    // Check if this was a deduction (usage) transaction
    if (original.transactionType !== "usage" && original.transactionType !== "purchase") {
      throw new Error("Can only refund usage or purchase transactions");
    }

    // Check if already refunded
    const existingRefund = await db
      .select()
      .from(credit_transactions)
      .where(
        and(
          eq(credit_transactions.userId, original.userId),
          eq(credit_transactions.transactionType, "refund"),
          sql`${credit_transactions.metadata}->>'originalTransactionId' = ${transactionId.toString()}`
        )
      )
      .limit(1);

    if (existingRefund.length > 0) {
      throw new Error("Transaction has already been refunded");
    }

    // Refund by adding back the credits (reverse the amount)
    const refundAmount = Math.abs(original.amount);
    await this.addCredits(
      original.userId,
      refundAmount,
      original.creditType as CreditType,
      `Refund for transaction ${transactionId}: ${original.description}`,
      "refund",
      {
        originalTransactionId: transactionId,
        originalAmount: original.amount,
        originalType: original.transactionType,
      }
    );
  }

  /**
   * Adjust credits (admin function)
   */
  async adjustCredits(
    userId: number,
    amount: number,
    creditType: CreditType,
    description: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    // For adjustments, we can add or remove credits
    if (amount > 0) {
      await this.addCredits(userId, amount, creditType, description, "adjustment", metadata);
    } else if (amount < 0) {
      // For negative adjustments, deduct credits
      await this.deductCredits(
        userId,
        Math.abs(amount),
        creditType,
        description,
        undefined,
        "adjustment",
        metadata
      );
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    userId: number,
    creditType?: CreditType,
    limit: number = 50,
    offset: number = 0
  ): Promise<CreditTransaction[]> {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    let query = db
      .select()
      .from(credit_transactions)
      .where(eq(credit_transactions.userId, userId))
      .orderBy(desc(credit_transactions.createdAt))
      .limit(limit)
      .offset(offset);

    if (creditType) {
      query = db
        .select()
        .from(credit_transactions)
        .where(
          and(
            eq(credit_transactions.userId, userId),
            eq(credit_transactions.creditType, creditType)
          )
        )
        .orderBy(desc(credit_transactions.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const results = await query;

    return results.map((tx) => ({
      id: tx.id,
      userId: tx.userId,
      creditType: tx.creditType as CreditType,
      transactionType: tx.transactionType as TransactionType,
      amount: tx.amount,
      balanceAfter: tx.balanceAfter,
      description: tx.description,
      referenceId: tx.referenceId || undefined,
      referenceType: tx.referenceType || undefined,
      metadata: tx.metadata as Record<string, any> | undefined,
      createdAt: tx.createdAt,
    }));
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(
    userId: number,
    creditType: CreditType,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalUsed: number;
    totalPurchased: number;
    balance: number;
    averageDaily: number;
    transactions: number;
  }> {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Get current balance and totals from user_credits
    const creditRecord = await db
      .select()
      .from(user_credits)
      .where(and(eq(user_credits.userId, userId), eq(user_credits.creditType, creditType)))
      .limit(1);

    const balance = creditRecord.length > 0 ? creditRecord[0].balance || 0 : 0;
    const totalPurchased = creditRecord.length > 0 ? creditRecord[0].totalPurchased || 0 : 0;
    const totalUsed = creditRecord.length > 0 ? creditRecord[0].totalUsed || 0 : 0;

    // Build query for transactions within date range
    let conditions = [
      eq(credit_transactions.userId, userId),
      eq(credit_transactions.creditType, creditType),
    ];

    if (startDate) {
      conditions.push(sql`${credit_transactions.createdAt} >= ${startDate}`);
    }

    if (endDate) {
      conditions.push(sql`${credit_transactions.createdAt} <= ${endDate}`);
    }

    const transactions = await db
      .select()
      .from(credit_transactions)
      .where(and(...conditions));

    const transactionCount = transactions.length;

    // Calculate average daily usage
    let averageDaily = 0;
    if (startDate && endDate && transactionCount > 0) {
      const daysDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      const usageInPeriod = transactions
        .filter((tx) => tx.transactionType === "usage")
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      averageDaily = usageInPeriod / daysDiff;
    }

    return {
      totalUsed,
      totalPurchased,
      balance,
      averageDaily: Math.round(averageDaily * 100) / 100,
      transactions: transactionCount,
    };
  }
}
