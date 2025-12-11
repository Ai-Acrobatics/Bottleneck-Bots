-- Migration: Add client_profiles table for mission context
-- Created: 2025-12-11
-- Description: Stores detailed client information used by AI agents for context-aware operations

CREATE TABLE IF NOT EXISTS "client_profiles" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "subaccountName" TEXT,
  "subaccountId" TEXT,
  "brandVoice" TEXT,
  "primaryGoal" TEXT,
  "website" TEXT,
  "seoConfig" JSONB,
  "assets" JSONB,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index on userId for faster lookups
CREATE INDEX IF NOT EXISTS "idx_client_profiles_user_id" ON "client_profiles"("userId");

-- Create index on isActive for filtering active profiles
CREATE INDEX IF NOT EXISTS "idx_client_profiles_is_active" ON "client_profiles"("isActive");

-- Create composite index on userId and isActive for common query pattern
CREATE INDEX IF NOT EXISTS "idx_client_profiles_user_active" ON "client_profiles"("userId", "isActive");
