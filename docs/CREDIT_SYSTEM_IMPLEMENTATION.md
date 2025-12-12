# Credit System Implementation Guide

## Overview

This document describes the complete implementation of the credit system with Stripe payment integration. The system manages credit balances, transactions, and payment processing for enrichment, calling, and scraping credits.

## Architecture

### Database Schema

The credit system uses three main tables defined in `/drizzle/schema-lead-enrichment.ts`:

#### 1. user_credits
Tracks current credit balances for each user and credit type.

```typescript
{
  id: serial (primary key)
  userId: integer (foreign key to users)
  creditType: varchar (enrichment | calling | scraping)
  balance: integer (current available credits)
  totalPurchased: integer (lifetime purchases)
  totalUsed: integer (lifetime usage)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 2. credit_packages
Defines available credit packages for purchase.

```typescript
{
  id: serial (primary key)
  name: varchar (package name)
  description: text
  creditAmount: integer (number of credits)
  price: integer (price in cents)
  creditType: varchar (enrichment | calling | scraping)
  isActive: boolean
  sortOrder: integer
  metadata: jsonb (additional package info)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 3. credit_transactions
Logs all credit transactions (purchases, usage, refunds, adjustments).

```typescript
{
  id: serial (primary key)
  userId: integer (foreign key to users)
  creditType: varchar
  transactionType: varchar (purchase | usage | refund | adjustment)
  amount: integer (positive or negative)
  balanceAfter: integer (balance after transaction)
  description: text
  referenceId: varchar (optional reference to related entity)
  referenceType: varchar (type of reference)
  metadata: jsonb (transaction details)
  createdAt: timestamp
}
```

## Implementation Files

### 1. Credit Service (`/server/services/credit.service.ts`)

Core business logic for credit management.

#### Key Methods:

**Balance Operations:**
- `getAllBalances(userId)` - Get all credit balances for a user
- `getBalance(userId, creditType)` - Get balance for specific credit type (cached)
- `checkBalance(userId, creditType, required)` - Check if user has sufficient credits

**Transaction Operations:**
- `addCredits(userId, amount, creditType, description, transactionType, metadata)` - Add credits with transaction logging
- `deductCredits(userId, amount, creditType, description, referenceId, referenceType, metadata)` - Deduct credits with validation
- `refundCredits(transactionId)` - Reverse a transaction and restore credits
- `adjustCredits(userId, amount, creditType, description, metadata)` - Admin function for manual adjustments

**History & Analytics:**
- `getTransactionHistory(userId, creditType, limit, offset)` - Paginated transaction history
- `getUsageStats(userId, creditType, startDate, endDate)` - Aggregate usage statistics

#### Features:
- Database transactions for atomicity
- Automatic cache invalidation on balance changes
- Input validation (positive amounts, sufficient balance)
- Comprehensive error handling
- Metadata support for transaction tracking

### 2. Credits Router (`/server/api/routers/credits.ts`)

tRPC API endpoints for credit operations.

#### Endpoints:

**Public Procedures:**
- `getBalances` - Get user credit balances
- `getBalance` - Get specific credit type balance
- `getPackages` - List available credit packages
- `purchaseCredits` - Purchase a credit package
- `getTransactionHistory` - Get transaction history with pagination
- `getUsageStats` - Get usage statistics
- `checkBalance` - Check if user has sufficient credits

**Admin Procedures:**
- `createPackage` - Create new credit package
- `updatePackage` - Update existing package
- `adjustCredits` - Manually adjust user credits

### 3. Marketplace Router (`/server/api/routers/marketplace.ts`)

Stripe integration for payment processing.

#### Endpoints:

**getProducts**
- Returns available credit packages from database
- Groups packages by credit type
- Includes legacy product format for compatibility

**createCheckout**
- Creates Stripe Checkout session
- Input: `{ packageId, successUrl?, cancelUrl? }`
- Returns: `{ success, checkoutUrl, sessionId }`
- Validates package exists and is active
- Embeds metadata in session (userId, packageId, creditType, creditAmount)

**verifyCheckout**
- Verifies completed checkout session
- Input: `{ sessionId }`
- Returns: `{ success, status, metadata }`
- Used on success page to confirm payment

### 4. Stripe Webhook Router (`/server/api/routers/stripe-webhook.ts`)

Handles Stripe webhook events for automated credit fulfillment.

#### Events Handled:

**checkout.session.completed**
- Triggered when payment is successful
- Extracts metadata (userId, packageId, creditType, creditAmount)
- Validates package still exists
- Calls `creditService.addCredits()` with transaction metadata
- Logs Stripe session and payment intent IDs

**payment_intent.succeeded**
- Additional payment confirmation
- Used for logging and analytics

**payment_intent.payment_failed**
- Logs failed payments
- Can trigger user notifications

**charge.refunded**
- Handles Stripe refunds
- Retrieves original checkout session
- Deducts credits back using `creditService.deductCredits()`
- Logs refund transaction with Stripe charge ID

#### Endpoints:

**handleWebhook**
- Main webhook handler
- Input: `{ event, signature? }`
- Note: Signature verification requires raw request body (implement in dedicated API route)

**fulfillCheckoutSession**
- Manual credit fulfillment
- Input: `{ sessionId }`
- Useful for testing or handling failed webhooks

## Setup Instructions

### 1. Install Stripe SDK

```bash
npm install stripe
```

### 2. Environment Variables

Add to `.env.local`:

```bash
# Stripe Payment Integration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
APP_URL=http://localhost:3000
```

Get your keys from:
- API Keys: https://dashboard.stripe.com/apikeys
- Webhook Secret: https://dashboard.stripe.com/webhooks

### 3. Database Setup

Run migrations to create credit tables:

```bash
npm run db:push
# or
npm run db:migrate
```

### 4. Create Credit Packages

Use the admin endpoint to create packages:

```typescript
await trpc.credits.createPackage.mutate({
  name: "Starter Pack - 100 Enrichment Credits",
  description: "Perfect for getting started",
  creditAmount: 100,
  price: 999, // $9.99 in cents
  creditType: "enrichment",
  isActive: true,
  sortOrder: 1,
});
```

### 5. Configure Stripe Webhooks

#### Local Development (Stripe CLI):

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/trpc/stripeWebhook.handleWebhook

# Copy webhook signing secret to .env
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Production:

1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://yourdomain.com/api/trpc/stripeWebhook.handleWebhook`
3. Select events: `checkout.session.completed`, `charge.refunded`
4. Copy signing secret to production environment variables

## Usage Examples

### Client-Side: Purchase Credits

```typescript
import { trpc } from "@/lib/trpc";

// Get available packages
const { data: products } = await trpc.marketplace.getProducts.useQuery();

// Create checkout session
const { data } = await trpc.marketplace.createCheckout.useMutation({
  packageId: 1,
  successUrl: "https://myapp.com/success",
  cancelUrl: "https://myapp.com/marketplace",
});

// Redirect to Stripe Checkout
window.location.href = data.checkoutUrl;
```

### Client-Side: Check Balance

```typescript
// Get all balances
const { data: balances } = await trpc.credits.getBalances.useQuery();
console.log(balances.enrichment.balance); // 100

// Check if user has enough credits
const { data: check } = await trpc.credits.checkBalance.useQuery({
  creditType: "enrichment",
  required: 50,
});

if (!check.hasSufficient) {
  alert(`Need ${check.shortfall} more credits`);
}
```

### Server-Side: Deduct Credits

```typescript
import { CreditService } from "@/server/services/credit.service";

const creditService = new CreditService();

// Deduct credits for enrichment
await creditService.deductCredits(
  userId,
  10, // amount
  "enrichment",
  "Enriched 10 leads from list #123",
  "123", // referenceId (lead list ID)
  "lead_list",
  {
    leadListId: 123,
    leadsProcessed: 10,
  }
);
```

### Server-Side: Refund Credits

```typescript
// Refund a specific transaction
await creditService.refundCredits(transactionId);

// This will:
// 1. Check if transaction can be refunded
// 2. Add credits back to user account
// 3. Create refund transaction record
// 4. Invalidate cache
```

### Admin: Manual Adjustment

```typescript
// Add bonus credits
await trpc.credits.adjustCredits.mutate({
  userId: 123,
  amount: 100,
  creditType: "enrichment",
  description: "Bonus credits for feedback",
  metadata: { reason: "user_feedback" },
});

// Deduct credits (negative amount)
await trpc.credits.adjustCredits.mutate({
  userId: 123,
  amount: -50,
  creditType: "calling",
  description: "Refund for failed calls",
});
```

## Testing

### Test Credit Operations

```typescript
import { CreditService } from "@/server/services/credit.service";

const creditService = new CreditService();
const userId = 1;

// Add credits
await creditService.addCredits(
  userId,
  100,
  "enrichment",
  "Test purchase",
  "purchase"
);

// Check balance
const balance = await creditService.getBalance(userId, "enrichment");
console.log(`Balance: ${balance}`); // 100

// Deduct credits
await creditService.deductCredits(
  userId,
  10,
  "enrichment",
  "Test usage"
);

// Get transaction history
const history = await creditService.getTransactionHistory(userId);
console.log(history);

// Get usage stats
const stats = await creditService.getUsageStats(
  userId,
  "enrichment",
  new Date("2025-01-01"),
  new Date()
);
console.log(stats);
```

### Test Stripe Integration

```bash
# Use Stripe test mode
STRIPE_SECRET_KEY=sk_test_...

# Use test cards
# Success: 4242 4242 4242 4242
# Decline: 4000 0000 0000 0002

# Trigger webhook events
stripe trigger checkout.session.completed
```

## Error Handling

The system handles various error cases:

### Insufficient Credits
```typescript
try {
  await creditService.deductCredits(userId, 100, "enrichment", "test");
} catch (error) {
  // Error: "Insufficient credits. Required: 100, Available: 50"
}
```

### Invalid Amounts
```typescript
try {
  await creditService.addCredits(userId, -10, "enrichment", "test", "purchase");
} catch (error) {
  // Error: "Amount must be positive"
}
```

### Package Not Found
```typescript
try {
  await trpc.marketplace.createCheckout.mutate({ packageId: 999 });
} catch (error) {
  // TRPCError: "Package not found"
}
```

### Duplicate Refund
```typescript
try {
  await creditService.refundCredits(transactionId);
  await creditService.refundCredits(transactionId); // Second attempt
} catch (error) {
  // Error: "Transaction has already been refunded"
}
```

## Caching

Credit balances are cached with 60-second TTL for performance:

- Cache key format: `user_credits:{userId}:{creditType}`
- Automatic invalidation on balance changes
- Uses Redis via cache service
- Reduces database load for frequent balance checks

## Security Considerations

1. **Webhook Verification**: Implement Stripe signature verification in production
2. **Auth Guards**: Add authentication checks to all endpoints (currently uses placeholder userId)
3. **Admin Endpoints**: Restrict package creation and credit adjustments to admin users
4. **Input Validation**: All inputs validated via Zod schemas
5. **Database Transactions**: Ensures atomicity of credit operations
6. **Idempotency**: Prevent duplicate refunds and transactions

## Monitoring & Analytics

Track key metrics:

- Total credits purchased
- Total credits used
- Average daily usage per user
- Transaction volume
- Refund rate
- Popular packages

Query transaction history for insights:

```typescript
const stats = await creditService.getUsageStats(
  userId,
  "enrichment",
  startDate,
  endDate
);

console.log({
  totalUsed: stats.totalUsed,
  totalPurchased: stats.totalPurchased,
  currentBalance: stats.balance,
  averageDaily: stats.averageDaily,
  transactionCount: stats.transactions,
});
```

## Next Steps

1. **Authentication**: Replace hardcoded userId with actual auth context
2. **Admin UI**: Build admin panel for package management
3. **User Dashboard**: Create credit balance and history views
4. **Notifications**: Email alerts for low balance, purchases, refunds
5. **Webhooks**: Implement proper Stripe webhook signature verification
6. **Testing**: Add comprehensive unit and integration tests
7. **Subscriptions**: Implement recurring credit subscriptions
8. **Usage Limits**: Add rate limiting per credit type

## Troubleshooting

### Credits Not Awarded After Payment

1. Check webhook delivery in Stripe Dashboard
2. Verify webhook secret is correct
3. Check server logs for errors
4. Manually fulfill using `fulfillCheckoutSession` endpoint

### Cache Issues

```typescript
// Manually invalidate cache
import { cacheService } from "@/server/services/cache.service";
await cacheService.invalidate(`user_credits:${userId}:enrichment`);
```

### Database Transaction Failures

Check server logs for:
- Database connection issues
- Constraint violations
- Timeout errors

## Support

For issues or questions:
- Check server logs in `/logs`
- Review Stripe Dashboard for payment details
- Check database for transaction records
- Contact development team
