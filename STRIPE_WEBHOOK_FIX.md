# Stripe Webhook Security Fix

## Overview

The current Stripe webhook implementation (`server/api/routers/stripe-webhook.ts`) has critical security vulnerabilities:

1. **Missing signature verification** - Unverified webhooks can be forged
2. **No idempotency** - Webhook retries cause duplicate credit awards
3. **Publicly accessible endpoint** - Anyone can call the webhook handler

This document explains how to fix these issues.

## What Was Fixed

### New File: `server/api/webhooks/stripe.ts`

A complete, production-ready Stripe webhook handler with:

- ✓ Proper signature verification using official Stripe SDK
- ✓ Idempotency checks to prevent duplicate processing
- ✓ Proper error handling and logging
- ✓ Express route (not tRPC) to preserve raw request body
- ✓ Event processing status tracking
- ✓ Comprehensive documentation

### New File: `drizzle/migrations/add-stripe-idempotency.sql`

Database migration to create `stripe_processed_events` table for tracking:

- ✓ Event ID and type
- ✓ Processing status
- ✓ Error messages
- ✓ Timestamps for monitoring and cleanup

## Implementation Steps

### Step 1: Run Database Migration

```bash
# Apply the migration to create the stripe_processed_events table
pnpm drizzle-kit up
# or
npm run migrate
```

The migration creates a table with proper indexes for:
- Fast event lookup by stripe_event_id
- Status filtering (pending/completed/failed)
- Time-based cleanup queries

### Step 2: Update Express App Configuration

Add the Stripe webhook route to your Express app initialization.

**File:** `server/main.ts` or `server/api/server.ts` (wherever you initialize Express)

```typescript
import stripeWebhookRouter from "./webhooks/stripe";
import bodyParser from "body-parser";

const app = express();

// IMPORTANT: Raw body parser MUST come before the route
// The Stripe webhook endpoint uses raw({ type: "application/json" }) internally,
// but you may want to add it here for the entire app
// app.use('/api/webhooks/stripe', bodyParser.raw({ type: 'application/json' }));

// Add Stripe webhook route BEFORE other body parsers
app.use("/api/webhooks/stripe", stripeWebhookRouter);

// Add other routes after
app.use("/api/trpc", trpcHandler);
app.use("/api/webhooks/inbound", webhookEndpointsRouter);
// ... other routes
```

### Step 3: Disable Old tRPC Webhook Handler

The old handler in `server/api/routers/stripe-webhook.ts` is now insecure and should be disabled.

**Option A: Remove it completely**
```bash
rm server/api/routers/stripe-webhook.ts
```

**Option B: Keep it for backwards compatibility but mark as deprecated**

If you need to keep it for some reason, update it to:

```typescript
import { publicProcedure, router } from "../../_core/trpc";
import { TRPCError } from "@trpc/server";

/**
 * DEPRECATED: This endpoint is no longer used
 * Use Express route at /api/webhooks/stripe instead
 *
 * The tRPC endpoint cannot properly verify Stripe signatures because
 * it receives parsed JSON instead of the raw request body
 */
export const stripeWebhookRouter = router({
  handleWebhook: publicProcedure.mutation(async () => {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "This endpoint is deprecated. Use /api/webhooks/stripe instead.",
    });
  }),

  fulfillCheckoutSession: publicProcedure.mutation(async () => {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "This endpoint is deprecated. Use /api/webhooks/stripe instead.",
    });
  }),
});
```

### Step 4: Update Stripe Dashboard Configuration

Configure the webhook endpoint in Stripe:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL to: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to receive:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click "Add endpoint"
6. Copy the webhook signing secret
7. Add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`

### Step 5: Verify Environment Variables

Ensure your `.env` file has:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe dashboard)
APP_URL=http://localhost:3000 (or your production URL)
```

### Step 6: Test the Implementation

#### Local Testing with Stripe CLI

```bash
# Install Stripe CLI if not already installed
# https://stripe.com/docs/stripe-cli

# Forward Stripe webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This will output a webhook signing secret
# Copy this and add to .env.local
# STRIPE_WEBHOOK_SECRET=whsec_test_...

# In another terminal, trigger a test event
stripe trigger checkout.session.completed

# Check your logs - should see: "[Stripe Webhook] Received event: checkout.session.completed"
```

#### Testing with Postman

1. Create a test Stripe event object
2. Sign it with your webhook secret
3. Send POST to `http://localhost:3000/api/webhooks/stripe`
4. Verify 200 response with `{"received": true}`

#### Testing Idempotency

Send the same webhook event twice with the same ID:

```bash
# First request: should process event
# Response: {"received": true, "eventId": "evt_...", "eventType": "..."}

# Second request (same event ID): should be skipped
# Response: {"received": true, "alreadyProcessed": true}
```

### Step 7: Deploy to Production

```bash
# 1. Run migrations in production
pnpm drizzle-kit up --prod

# 2. Update environment variables in your hosting provider
# - Set STRIPE_WEBHOOK_SECRET to the production webhook secret
# - Ensure STRIPE_SECRET_KEY is the production secret key

# 3. Deploy the code
git add server/api/webhooks/stripe.ts drizzle/migrations/
git commit -m "fix: implement proper Stripe webhook signature verification and idempotency"
git push

# 4. Update Stripe webhook URL in dashboard
# https://dashboard.stripe.com/webhooks
# Change endpoint URL from test to production URL

# 5. Verify webhook is receiving events
# Check Stripe dashboard webhook logs
```

## Verification Checklist

After implementation, verify:

- [ ] Database migration applied successfully
- [ ] `stripe_processed_events` table created
- [ ] Express route registered at `/api/webhooks/stripe`
- [ ] Old tRPC handler disabled or deprecated
- [ ] Environment variables configured
- [ ] Local testing with Stripe CLI passes
- [ ] Webhook signed correctly in Stripe SDK
- [ ] Idempotency check prevents duplicate processing
- [ ] Error handling returns 500 for Stripe retries
- [ ] Stripe dashboard shows webhook endpoint as active
- [ ] Credit awards only happen after signature verification
- [ ] Refunds properly deduct credits

## Security Verification

This implementation provides:

- ✓ **Signature Verification**: Uses `stripe.webhooks.constructEvent()` to verify HMAC signature
- ✓ **Idempotency**: Checks `stripe_processed_events` before processing
- ✓ **Integrity**: Raw body preserved for signature calculation
- ✓ **Error Handling**: Returns 500 on errors so Stripe retries
- ✓ **Logging**: Full request/event logging for debugging
- ✓ **PCI Compliance**: No card data handled directly
- ✓ **Rate Limiting**: Can be added at infrastructure level
- ✓ **Timeout Handling**: Transactions complete quickly

## Common Issues and Solutions

### Issue: "Invalid signature" error

**Cause**: Raw body not preserved, JSON parsed before signature check

**Solution**: Ensure Express middleware order:
```typescript
// WRONG: JSON parsed before webhook route
app.use(express.json());
app.use("/api/webhooks/stripe", stripeWebhookRouter);

// CORRECT: Stripe webhook route before JSON parsing
app.use("/api/webhooks/stripe", stripeWebhookRouter);
app.use(express.json());
```

### Issue: Duplicate credit awards

**Cause**: Idempotency table not migrated

**Solution**: Run migration
```bash
pnpm drizzle-kit up
```

### Issue: Credits not awarded

**Cause**: Old tRPC handler still being called

**Solution**: Verify Stripe webhook points to Express route, not tRPC

### Issue: Events marked as "pending" forever

**Cause**: Handler failed but wasn't marked as completed

**Solution**: Check logs for error messages, fix root cause, retry manually

## Monitoring and Maintenance

### Monitor Webhook Health

```sql
-- Check webhook delivery status
SELECT
  event_type,
  status,
  COUNT(*) as count,
  MAX(processed_at) as last_processed
FROM stripe_processed_events
GROUP BY event_type, status
ORDER BY last_processed DESC;

-- Check failed events
SELECT * FROM stripe_processed_events
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 20;

-- Check for old events (cleanup candidates)
SELECT * FROM stripe_processed_events
WHERE created_at < NOW() - INTERVAL '90 days'
ORDER BY created_at DESC;
```

### Cleanup Old Records

```sql
-- Delete processed events older than 90 days (keep for audit trail)
DELETE FROM stripe_processed_events
WHERE created_at < NOW() - INTERVAL '90 days'
  AND status = 'completed';
```

### Alert on Failed Events

Set up alerts for:
- Any event with status = 'failed'
- Multiple failed events from same session
- Refund failures (credits not deducted)

## References

- Stripe Webhook Docs: https://stripe.com/docs/webhooks
- Signature Verification: https://stripe.com/docs/webhooks/signatures
- Best Practices: https://stripe.com/docs/webhooks/best-practices
- Testing: https://stripe.com/docs/stripe-cli

## Questions?

Refer to the main verification report: `INTEGRATION_VERIFICATION_REPORT.md`
