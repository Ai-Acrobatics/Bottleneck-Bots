-- Enhanced Cost Tracking Migration
-- Adds Gemini API tracking, S3/R2 storage tracking, and updates daily summaries
-- Run: pnpm drizzle-kit push

-- ==========================================
-- GEMINI API TOKEN USAGE TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS "gemini_token_usage" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "executionId" INTEGER REFERENCES "task_executions"("id") ON DELETE CASCADE,

  -- API call identity
  "requestId" VARCHAR(255),
  "model" VARCHAR(100) NOT NULL,

  -- Token counts
  "inputTokens" INTEGER NOT NULL DEFAULT 0,
  "outputTokens" INTEGER NOT NULL DEFAULT 0,
  "totalTokens" INTEGER NOT NULL,

  -- Cost calculation (higher precision for Gemini's lower costs)
  "inputCost" DECIMAL(10, 6) NOT NULL,
  "outputCost" DECIMAL(10, 6) NOT NULL,
  "totalCost" DECIMAL(10, 6) NOT NULL,

  -- Request metadata
  "promptType" VARCHAR(100),
  "toolsUsed" JSONB,

  -- Performance metrics
  "responseTime" INTEGER,
  "finishReason" VARCHAR(50),

  -- Timestamps
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for Gemini token usage
CREATE INDEX IF NOT EXISTS "gemini_token_usage_user_id_idx" ON "gemini_token_usage" ("userId");
CREATE INDEX IF NOT EXISTS "gemini_token_usage_execution_id_idx" ON "gemini_token_usage" ("executionId");
CREATE INDEX IF NOT EXISTS "gemini_token_usage_model_idx" ON "gemini_token_usage" ("model");
CREATE INDEX IF NOT EXISTS "gemini_token_usage_created_at_idx" ON "gemini_token_usage" ("createdAt");
CREATE INDEX IF NOT EXISTS "gemini_token_usage_user_created_idx" ON "gemini_token_usage" ("userId", "createdAt");

-- ==========================================
-- STORAGE COSTS TABLE (S3/R2)
-- ==========================================

CREATE TABLE IF NOT EXISTS "storage_costs" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "executionId" INTEGER REFERENCES "task_executions"("id") ON DELETE CASCADE,

  -- Operation identity
  "operationId" VARCHAR(255),
  "provider" VARCHAR(50) NOT NULL,
  "bucket" VARCHAR(255) NOT NULL,

  -- Operation type
  "operationType" VARCHAR(50) NOT NULL,
  "objectKey" VARCHAR(1000),

  -- Size metrics
  "sizeBytes" INTEGER NOT NULL DEFAULT 0,
  "sizeMb" DECIMAL(10, 4) NOT NULL DEFAULT 0,

  -- Cost calculation
  "storageCostPerGb" DECIMAL(10, 6) NOT NULL DEFAULT 0.023,
  "transferCostPerGb" DECIMAL(10, 6) NOT NULL DEFAULT 0.09,
  "requestCost" DECIMAL(10, 8) NOT NULL DEFAULT 0,
  "totalCost" DECIMAL(10, 6) NOT NULL,

  -- Content type
  "contentType" VARCHAR(255),

  -- Status
  "status" VARCHAR(50) NOT NULL,

  -- Timestamps
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for storage costs
CREATE INDEX IF NOT EXISTS "storage_costs_user_id_idx" ON "storage_costs" ("userId");
CREATE INDEX IF NOT EXISTS "storage_costs_execution_id_idx" ON "storage_costs" ("executionId");
CREATE INDEX IF NOT EXISTS "storage_costs_provider_idx" ON "storage_costs" ("provider");
CREATE INDEX IF NOT EXISTS "storage_costs_operation_type_idx" ON "storage_costs" ("operationType");
CREATE INDEX IF NOT EXISTS "storage_costs_created_at_idx" ON "storage_costs" ("createdAt");
CREATE INDEX IF NOT EXISTS "storage_costs_user_created_idx" ON "storage_costs" ("userId", "createdAt");

-- ==========================================
-- UPDATE DAILY COST SUMMARIES TABLE
-- ==========================================

-- Add Gemini API columns
ALTER TABLE "daily_cost_summaries"
  ADD COLUMN IF NOT EXISTS "totalGeminiCalls" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "daily_cost_summaries"
  ADD COLUMN IF NOT EXISTS "totalGeminiInputTokens" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "daily_cost_summaries"
  ADD COLUMN IF NOT EXISTS "totalGeminiOutputTokens" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "daily_cost_summaries"
  ADD COLUMN IF NOT EXISTS "geminiCostUsd" DECIMAL(10, 6) NOT NULL DEFAULT 0;

-- Add Storage columns
ALTER TABLE "daily_cost_summaries"
  ADD COLUMN IF NOT EXISTS "totalStorageOperations" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "daily_cost_summaries"
  ADD COLUMN IF NOT EXISTS "totalStorageMb" DECIMAL(10, 4) NOT NULL DEFAULT 0;
ALTER TABLE "daily_cost_summaries"
  ADD COLUMN IF NOT EXISTS "storageCostUsd" DECIMAL(10, 6) NOT NULL DEFAULT 0;

-- Add cost by provider breakdown
ALTER TABLE "daily_cost_summaries"
  ADD COLUMN IF NOT EXISTS "costByProvider" JSONB;

-- ==========================================
-- COMMENT DOCUMENTATION
-- ==========================================

COMMENT ON TABLE "gemini_token_usage" IS 'Tracks token consumption for each Gemini API call';
COMMENT ON COLUMN "gemini_token_usage"."model" IS 'Gemini model (gemini-2.0-flash, gemini-1.5-pro, etc.)';
COMMENT ON COLUMN "gemini_token_usage"."totalCost" IS 'Total cost in USD with high precision for low-cost models';
COMMENT ON COLUMN "gemini_token_usage"."finishReason" IS 'stop, length, safety, etc.';

COMMENT ON TABLE "storage_costs" IS 'Tracks S3/R2/GCS storage operation costs';
COMMENT ON COLUMN "storage_costs"."provider" IS 's3, r2, or gcs';
COMMENT ON COLUMN "storage_costs"."operationType" IS 'upload, download, delete, list';
COMMENT ON COLUMN "storage_costs"."storageCostPerGb" IS 'Storage cost per GB per month';
COMMENT ON COLUMN "storage_costs"."transferCostPerGb" IS 'Egress transfer cost per GB';

COMMENT ON COLUMN "daily_cost_summaries"."costByProvider" IS 'JSON breakdown: { "anthropic": 1.23, "google": 0.05, "browserbase": 0.10, "storage": 0.02 }';
