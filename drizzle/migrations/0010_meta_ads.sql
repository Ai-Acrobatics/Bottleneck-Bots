-- Meta Ads Integration Tables
-- Created: 2025-12-11

-- Ad analyses table
CREATE TABLE IF NOT EXISTS "ad_analyses" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "users"("id"),
  "adId" VARCHAR(128),
  "screenshotUrl" TEXT NOT NULL,

  -- Extracted metrics
  "impressions" INTEGER,
  "clicks" INTEGER,
  "ctr" DECIMAL(5, 2),
  "cpc" DECIMAL(10, 2),
  "spend" DECIMAL(10, 2),
  "conversions" INTEGER,
  "roas" DECIMAL(10, 2),

  -- Analysis results
  "insights" JSONB,
  "suggestions" JSONB,
  "sentiment" VARCHAR(20),
  "confidence" DECIMAL(3, 2),
  "rawAnalysis" JSONB,

  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_ad_analyses_user ON "ad_analyses"("userId");
CREATE INDEX idx_ad_analyses_ad ON "ad_analyses"("adId");

-- Ad recommendations table
CREATE TABLE IF NOT EXISTS "ad_recommendations" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "users"("id"),
  "analysisId" INTEGER REFERENCES "ad_analyses"("id"),
  "adId" VARCHAR(128),

  "type" VARCHAR(50) NOT NULL,
  "priority" VARCHAR(20) NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "expectedImpact" TEXT,
  "actionable" VARCHAR(10) DEFAULT 'true' NOT NULL,

  -- Status tracking
  "status" VARCHAR(20) DEFAULT 'pending' NOT NULL,
  "appliedAt" TIMESTAMP,
  "appliedBy" INTEGER REFERENCES "users"("id"),
  "resultMetrics" JSONB,

  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_ad_recommendations_user ON "ad_recommendations"("userId");
CREATE INDEX idx_ad_recommendations_analysis ON "ad_recommendations"("analysisId");
CREATE INDEX idx_ad_recommendations_status ON "ad_recommendations"("status");

-- Ad copy variations table
CREATE TABLE IF NOT EXISTS "ad_copy_variations" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "users"("id"),
  "originalAdId" VARCHAR(128),

  "headline" TEXT NOT NULL,
  "primaryText" TEXT NOT NULL,
  "description" TEXT,
  "callToAction" VARCHAR(50),
  "reasoning" TEXT,

  -- Variation metadata
  "variationNumber" INTEGER NOT NULL,
  "targetAudience" TEXT,
  "tone" VARCHAR(50),
  "objective" VARCHAR(50),

  -- Testing status
  "status" VARCHAR(20) DEFAULT 'draft' NOT NULL,
  "testAdId" VARCHAR(128),
  "performanceMetrics" JSONB,

  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_ad_copy_variations_user ON "ad_copy_variations"("userId");
CREATE INDEX idx_ad_copy_variations_original ON "ad_copy_variations"("originalAdId");
CREATE INDEX idx_ad_copy_variations_status ON "ad_copy_variations"("status");

-- Ad automation history table
CREATE TABLE IF NOT EXISTS "ad_automation_history" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "users"("id"),
  "jobId" INTEGER,

  "actionType" VARCHAR(50) NOT NULL,
  "adId" VARCHAR(128),
  "adSetId" VARCHAR(128),
  "campaignId" VARCHAR(128),

  "changes" JSONB NOT NULL,

  -- Execution details
  "status" VARCHAR(20) DEFAULT 'pending' NOT NULL,
  "sessionId" VARCHAR(128),
  "debugUrl" TEXT,
  "recordingUrl" TEXT,

  "result" JSONB,
  "errorMessage" TEXT,

  "startedAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_ad_automation_user ON "ad_automation_history"("userId");
CREATE INDEX idx_ad_automation_status ON "ad_automation_history"("status");
CREATE INDEX idx_ad_automation_session ON "ad_automation_history"("sessionId");

-- Meta ad accounts table
CREATE TABLE IF NOT EXISTS "meta_ad_accounts" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "users"("id"),

  "accountId" VARCHAR(128) NOT NULL UNIQUE,
  "accountName" TEXT NOT NULL,
  "accountStatus" VARCHAR(50),
  "currency" VARCHAR(10),

  "metadata" JSONB,

  "lastSyncedAt" TIMESTAMP,
  "isActive" VARCHAR(10) DEFAULT 'true' NOT NULL,

  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_meta_ad_accounts_user ON "meta_ad_accounts"("userId");
CREATE INDEX idx_meta_ad_accounts_account ON "meta_ad_accounts"("accountId");

-- Meta campaigns table
CREATE TABLE IF NOT EXISTS "meta_campaigns" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "users"("id"),
  "accountId" INTEGER NOT NULL REFERENCES "meta_ad_accounts"("id"),

  "campaignId" VARCHAR(128) NOT NULL UNIQUE,
  "campaignName" TEXT NOT NULL,
  "status" VARCHAR(50),
  "objective" VARCHAR(100),

  "dailyBudget" DECIMAL(10, 2),
  "lifetimeBudget" DECIMAL(10, 2),

  "metadata" JSONB,

  "lastSyncedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_meta_campaigns_user ON "meta_campaigns"("userId");
CREATE INDEX idx_meta_campaigns_account ON "meta_campaigns"("accountId");
CREATE INDEX idx_meta_campaigns_campaign ON "meta_campaigns"("campaignId");

-- Meta ad sets table
CREATE TABLE IF NOT EXISTS "meta_ad_sets" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "users"("id"),
  "campaignId" INTEGER NOT NULL REFERENCES "meta_campaigns"("id"),

  "adSetId" VARCHAR(128) NOT NULL UNIQUE,
  "adSetName" TEXT NOT NULL,
  "status" VARCHAR(50),

  "dailyBudget" DECIMAL(10, 2),
  "lifetimeBudget" DECIMAL(10, 2),

  "targetingDescription" TEXT,
  "targeting" JSONB,

  "metadata" JSONB,

  "lastSyncedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_meta_ad_sets_user ON "meta_ad_sets"("userId");
CREATE INDEX idx_meta_ad_sets_campaign ON "meta_ad_sets"("campaignId");
CREATE INDEX idx_meta_ad_sets_adset ON "meta_ad_sets"("adSetId");

-- Meta ads table
CREATE TABLE IF NOT EXISTS "meta_ads" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "users"("id"),
  "adSetId" INTEGER NOT NULL REFERENCES "meta_ad_sets"("id"),

  "adId" VARCHAR(128) NOT NULL UNIQUE,
  "adName" TEXT NOT NULL,
  "status" VARCHAR(50),

  "headline" TEXT,
  "primaryText" TEXT,
  "description" TEXT,
  "imageUrl" TEXT,
  "videoUrl" TEXT,
  "callToAction" VARCHAR(50),

  "creative" JSONB,
  "latestMetrics" JSONB,

  "lastSyncedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_meta_ads_user ON "meta_ads"("userId");
CREATE INDEX idx_meta_ads_adset ON "meta_ads"("adSetId");
CREATE INDEX idx_meta_ads_ad ON "meta_ads"("adId");

-- Add comments for documentation
COMMENT ON TABLE "ad_analyses" IS 'Stores GPT-4 Vision analysis results for ad screenshots';
COMMENT ON TABLE "ad_recommendations" IS 'AI-generated recommendations for ad improvements';
COMMENT ON TABLE "ad_copy_variations" IS 'Generated ad copy variations for A/B testing';
COMMENT ON TABLE "ad_automation_history" IS 'Tracks all automation actions performed via Stagehand/Browserbase';
COMMENT ON TABLE "meta_ad_accounts" IS 'Cached Meta ad account information';
COMMENT ON TABLE "meta_campaigns" IS 'Cached campaign information from Meta';
COMMENT ON TABLE "meta_ad_sets" IS 'Cached ad set information from Meta';
COMMENT ON TABLE "meta_ads" IS 'Cached individual ad information from Meta';
