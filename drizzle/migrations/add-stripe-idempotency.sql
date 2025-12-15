-- Migration: Add Stripe Event Idempotency Table
-- Purpose: Track processed Stripe webhook events to prevent duplicate credit awards
-- Date: 2025-12-15

-- Create table to track processed Stripe events
CREATE TABLE IF NOT EXISTS stripe_processed_events (
  id BIGSERIAL PRIMARY KEY,

  -- Stripe event ID (must be unique to prevent duplicates)
  stripe_event_id VARCHAR(255) NOT NULL UNIQUE,

  -- Type of event (checkout.session.completed, payment_intent.succeeded, etc.)
  event_type VARCHAR(100) NOT NULL,

  -- Processing status
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- Values: 'pending', 'completed', 'failed'

  -- Error message if processing failed
  error_message TEXT,

  -- When the event was processed
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- When the record was created
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- When the record was last updated
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for quick lookup by event ID
CREATE INDEX IF NOT EXISTS idx_stripe_event_id
  ON stripe_processed_events(stripe_event_id);

-- Index for finding unprocessed or failed events
CREATE INDEX IF NOT EXISTS idx_stripe_status
  ON stripe_processed_events(status);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_stripe_processed_at
  ON stripe_processed_events(processed_at DESC);

-- Index for cleanup queries (finding old events)
CREATE INDEX IF NOT EXISTS idx_stripe_created_at
  ON stripe_processed_events(created_at DESC);

-- Comment on table
COMMENT ON TABLE stripe_processed_events IS
  'Tracks processed Stripe webhook events to prevent duplicate processing on retries';

COMMENT ON COLUMN stripe_processed_events.stripe_event_id IS
  'Unique Stripe event ID - used to identify duplicate webhook attempts';

COMMENT ON COLUMN stripe_processed_events.event_type IS
  'Type of Stripe event (e.g., checkout.session.completed, charge.refunded)';

COMMENT ON COLUMN stripe_processed_events.status IS
  'Processing status: pending (being processed), completed (success), failed (error occurred)';

COMMENT ON COLUMN stripe_processed_events.error_message IS
  'Error message if processing failed - helps with debugging';
