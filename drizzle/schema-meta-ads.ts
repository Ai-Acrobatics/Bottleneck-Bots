/**
 * Meta Ads Schema
 * Tables for storing Meta Ads analysis, recommendations, and automation history
 */

import { pgTable, serial, text, timestamp, varchar, integer, jsonb, decimal } from "drizzle-orm/pg-core";
import { users } from "./schema";

// ========================================
// META ADS TABLES
// ========================================

/**
 * Ad analyses
 * Stores GPT-4 Vision analysis results for ad screenshots
 */
export const adAnalyses = pgTable("ad_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  adId: varchar("adId", { length: 128 }), // Meta ad ID (optional, may not always be known)
  screenshotUrl: text("screenshotUrl").notNull(), // URL to screenshot stored in S3/storage

  // Extracted metrics from vision analysis
  impressions: integer("impressions"),
  clicks: integer("clicks"),
  ctr: decimal("ctr", { precision: 5, scale: 2 }), // Click-through rate as percentage
  cpc: decimal("cpc", { precision: 10, scale: 2 }), // Cost per click in dollars
  spend: decimal("spend", { precision: 10, scale: 2 }), // Total spend in dollars
  conversions: integer("conversions"),
  roas: decimal("roas", { precision: 10, scale: 2 }), // Return on ad spend

  // Analysis results
  insights: jsonb("insights"), // Array of insights from GPT-4 Vision
  suggestions: jsonb("suggestions"), // Array of improvement suggestions
  sentiment: varchar("sentiment", { length: 20 }), // positive, neutral, negative
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // 0.00-1.00

  // Raw analysis data
  rawAnalysis: jsonb("rawAnalysis"), // Full GPT-4 Vision response

  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdAnalysis = typeof adAnalyses.$inferSelect;
export type InsertAdAnalysis = typeof adAnalyses.$inferInsert;

/**
 * Ad recommendations
 * Stores AI-generated recommendations for ad improvements
 */
export const adRecommendations = pgTable("ad_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  analysisId: integer("analysisId").references(() => adAnalyses.id), // Optional link to analysis
  adId: varchar("adId", { length: 128 }), // Meta ad ID

  type: varchar("type", { length: 50 }).notNull(), // copy, targeting, budget, creative, schedule
  priority: varchar("priority", { length: 20 }).notNull(), // high, medium, low
  title: text("title").notNull(),
  description: text("description").notNull(),
  expectedImpact: text("expectedImpact"), // Estimated impact description
  actionable: varchar("actionable", { length: 10 }).default("true").notNull(), // true/false

  // Recommendation status
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, applied, dismissed, failed
  appliedAt: timestamp("appliedAt"),
  appliedBy: integer("appliedBy").references(() => users.id), // User who applied the recommendation

  // Results after application (if available)
  resultMetrics: jsonb("resultMetrics"), // Performance metrics after applying recommendation

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AdRecommendation = typeof adRecommendations.$inferSelect;
export type InsertAdRecommendation = typeof adRecommendations.$inferInsert;

/**
 * Ad copy variations
 * Stores generated ad copy variations for A/B testing
 */
export const adCopyVariations = pgTable("ad_copy_variations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  originalAdId: varchar("originalAdId", { length: 128 }), // Original Meta ad ID

  headline: text("headline").notNull(),
  primaryText: text("primaryText").notNull(),
  description: text("description"),
  callToAction: varchar("callToAction", { length: 50 }),
  reasoning: text("reasoning"), // Strategy/reasoning behind the variation

  // Variation metadata
  variationNumber: integer("variationNumber").notNull(), // 1, 2, 3, etc.
  targetAudience: text("targetAudience"),
  tone: varchar("tone", { length: 50 }),
  objective: varchar("objective", { length: 50 }),

  // Testing status
  status: varchar("status", { length: 20 }).default("draft").notNull(), // draft, testing, active, archived
  testAdId: varchar("testAdId", { length: 128 }), // Meta ad ID if variation was created as test ad

  // Performance metrics (if tested)
  performanceMetrics: jsonb("performanceMetrics"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AdCopyVariation = typeof adCopyVariations.$inferSelect;
export type InsertAdCopyVariation = typeof adCopyVariations.$inferInsert;

/**
 * Ad automation history
 * Tracks all automation actions performed via Stagehand/Browserbase
 */
export const adAutomationHistory = pgTable("ad_automation_history", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  jobId: integer("jobId"), // Reference to jobs table for tracking

  actionType: varchar("actionType", { length: 50 }).notNull(), // apply_changes, create_ad, pause_ad, etc.
  adId: varchar("adId", { length: 128 }), // Meta ad ID
  adSetId: varchar("adSetId", { length: 128 }), // Meta ad set ID
  campaignId: varchar("campaignId", { length: 128 }), // Meta campaign ID

  // Changes made
  changes: jsonb("changes").notNull(), // Details of changes applied

  // Execution details
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, processing, completed, failed
  sessionId: varchar("sessionId", { length: 128 }), // Browserbase session ID
  debugUrl: text("debugUrl"), // Browserbase session debug URL
  recordingUrl: text("recordingUrl"), // Browserbase session recording URL

  // Results
  result: jsonb("result"), // Success/failure details
  errorMessage: text("errorMessage"),

  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AdAutomationHistory = typeof adAutomationHistory.$inferSelect;
export type InsertAdAutomationHistory = typeof adAutomationHistory.$inferInsert;

/**
 * Meta ad accounts
 * Cached Meta ad account information
 */
export const metaAdAccounts = pgTable("meta_ad_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),

  accountId: varchar("accountId", { length: 128 }).notNull().unique(), // Meta ad account ID
  accountName: text("accountName").notNull(),
  accountStatus: varchar("accountStatus", { length: 50 }),
  currency: varchar("currency", { length: 10 }),

  // Account metadata
  metadata: jsonb("metadata"), // Additional account info from Meta API

  // Sync status
  lastSyncedAt: timestamp("lastSyncedAt"),
  isActive: varchar("isActive", { length: 10 }).default("true").notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MetaAdAccount = typeof metaAdAccounts.$inferSelect;
export type InsertMetaAdAccount = typeof metaAdAccounts.$inferInsert;

/**
 * Meta campaigns
 * Cached campaign information from Meta
 */
export const metaCampaigns = pgTable("meta_campaigns", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  accountId: integer("accountId").references(() => metaAdAccounts.id).notNull(),

  campaignId: varchar("campaignId", { length: 128 }).notNull().unique(), // Meta campaign ID
  campaignName: text("campaignName").notNull(),
  status: varchar("status", { length: 50 }),
  objective: varchar("objective", { length: 100 }),

  // Budget info
  dailyBudget: decimal("dailyBudget", { precision: 10, scale: 2 }),
  lifetimeBudget: decimal("lifetimeBudget", { precision: 10, scale: 2 }),

  // Campaign metadata
  metadata: jsonb("metadata"),

  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MetaCampaign = typeof metaCampaigns.$inferSelect;
export type InsertMetaCampaign = typeof metaCampaigns.$inferInsert;

/**
 * Meta ad sets
 * Cached ad set information from Meta
 */
export const metaAdSets = pgTable("meta_ad_sets", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  campaignId: integer("campaignId").references(() => metaCampaigns.id).notNull(),

  adSetId: varchar("adSetId", { length: 128 }).notNull().unique(), // Meta ad set ID
  adSetName: text("adSetName").notNull(),
  status: varchar("status", { length: 50 }),

  // Budget info
  dailyBudget: decimal("dailyBudget", { precision: 10, scale: 2 }),
  lifetimeBudget: decimal("lifetimeBudget", { precision: 10, scale: 2 }),

  // Targeting info
  targetingDescription: text("targetingDescription"),
  targeting: jsonb("targeting"), // Full targeting configuration

  // Ad set metadata
  metadata: jsonb("metadata"),

  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MetaAdSet = typeof metaAdSets.$inferSelect;
export type InsertMetaAdSet = typeof metaAdSets.$inferInsert;

/**
 * Meta ads
 * Cached individual ad information from Meta
 */
export const metaAds = pgTable("meta_ads", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  adSetId: integer("adSetId").references(() => metaAdSets.id).notNull(),

  adId: varchar("adId", { length: 128 }).notNull().unique(), // Meta ad ID
  adName: text("adName").notNull(),
  status: varchar("status", { length: 50 }),

  // Creative content
  headline: text("headline"),
  primaryText: text("primaryText"),
  description: text("description"),
  imageUrl: text("imageUrl"),
  videoUrl: text("videoUrl"),
  callToAction: varchar("callToAction", { length: 50 }),

  // Ad creative metadata
  creative: jsonb("creative"), // Full creative configuration

  // Performance metrics (latest)
  latestMetrics: jsonb("latestMetrics"),

  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MetaAd = typeof metaAds.$inferSelect;
export type InsertMetaAd = typeof metaAds.$inferInsert;
