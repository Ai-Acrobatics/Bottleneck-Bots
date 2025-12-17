/**
 * Cost Tracking Schema
 * Database tables for API token usage and cost monitoring
 *
 * This schema supports:
 * - Claude API token usage tracking (input, output, cache tokens)
 * - Browserbase session cost tracking (duration, bandwidth)
 * - Per-user/tenant cost aggregation
 * - Cost analysis and budgeting
 */

import {
  pgTable,
  serial,
  integer,
  timestamp,
  varchar,
  jsonb,
  index,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { users } from "./schema";
import { taskExecutions } from "./schema-webhooks";

// ========================================
// API TOKEN USAGE TRACKING
// ========================================

/**
 * Claude API call token usage
 * Tracks token consumption for each Claude API call
 */
export const apiTokenUsage = pgTable("api_token_usage", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id, { onDelete: "cascade" }).notNull(),
  executionId: integer("executionId").references(() => taskExecutions.id, { onDelete: "cascade" }),

  // API call identity
  requestId: varchar("requestId", { length: 255 }), // Claude API request ID
  model: varchar("model", { length: 100 }).notNull(), // claude-opus-4-5-20251101, etc.

  // Token counts
  inputTokens: integer("inputTokens").notNull().default(0),
  outputTokens: integer("outputTokens").notNull().default(0),
  cacheCreationTokens: integer("cacheCreationTokens").default(0).notNull(), // Tokens used to create cache
  cacheReadTokens: integer("cacheReadTokens").default(0).notNull(), // Tokens read from cache
  totalTokens: integer("totalTokens").notNull(), // Sum of all tokens

  // Cost calculation (in USD cents for precision)
  inputCost: decimal("inputCost", { precision: 10, scale: 4 }).notNull(), // Cost in USD
  outputCost: decimal("outputCost", { precision: 10, scale: 4 }).notNull(),
  cacheCost: decimal("cacheCost", { precision: 10, scale: 4 }).default("0").notNull(),
  totalCost: decimal("totalCost", { precision: 10, scale: 4 }).notNull(), // Total cost in USD

  // Request metadata
  promptType: varchar("promptType", { length: 100 }), // system, task, observation, error_recovery
  toolsUsed: jsonb("toolsUsed"), // Array of tool names called

  // Performance metrics
  responseTime: integer("responseTime"), // Response time in milliseconds
  stopReason: varchar("stopReason", { length: 50 }), // end_turn, max_tokens, tool_use, etc.

  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // Indexes for common queries
  userIdIdx: index("api_token_usage_user_id_idx").on(table.userId),
  executionIdIdx: index("api_token_usage_execution_id_idx").on(table.executionId),
  modelIdx: index("api_token_usage_model_idx").on(table.model),
  createdAtIdx: index("api_token_usage_created_at_idx").on(table.createdAt),
  userCreatedIdx: index("api_token_usage_user_created_idx").on(table.userId, table.createdAt),
}));

// ========================================
// GEMINI API TOKEN USAGE TRACKING
// ========================================

/**
 * Gemini API call token usage
 * Tracks token consumption for each Gemini API call
 */
export const geminiTokenUsage = pgTable("gemini_token_usage", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id, { onDelete: "cascade" }).notNull(),
  executionId: integer("executionId").references(() => taskExecutions.id, { onDelete: "cascade" }),

  // API call identity
  requestId: varchar("requestId", { length: 255 }), // Gemini API request ID
  model: varchar("model", { length: 100 }).notNull(), // gemini-2.0-flash, gemini-1.5-pro, etc.

  // Token counts
  inputTokens: integer("inputTokens").notNull().default(0),
  outputTokens: integer("outputTokens").notNull().default(0),
  totalTokens: integer("totalTokens").notNull(), // Sum of all tokens

  // Cost calculation (in USD - higher precision for Gemini's lower costs)
  inputCost: decimal("inputCost", { precision: 10, scale: 6 }).notNull(), // Cost in USD
  outputCost: decimal("outputCost", { precision: 10, scale: 6 }).notNull(),
  totalCost: decimal("totalCost", { precision: 10, scale: 6 }).notNull(), // Total cost in USD

  // Request metadata
  promptType: varchar("promptType", { length: 100 }), // system, task, observation, error_recovery
  toolsUsed: jsonb("toolsUsed"), // Array of tool names called

  // Performance metrics
  responseTime: integer("responseTime"), // Response time in milliseconds
  finishReason: varchar("finishReason", { length: 50 }), // stop, length, safety, etc.

  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // Indexes for common queries
  userIdIdx: index("gemini_token_usage_user_id_idx").on(table.userId),
  executionIdIdx: index("gemini_token_usage_execution_id_idx").on(table.executionId),
  modelIdx: index("gemini_token_usage_model_idx").on(table.model),
  createdAtIdx: index("gemini_token_usage_created_at_idx").on(table.createdAt),
  userCreatedIdx: index("gemini_token_usage_user_created_idx").on(table.userId, table.createdAt),
}));

// ========================================
// BROWSERBASE SESSION COSTS
// ========================================

/**
 * Browserbase session cost tracking
 * Tracks duration and estimated costs for Browserbase sessions
 */
export const browserbaseCosts = pgTable("browserbase_costs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id, { onDelete: "cascade" }).notNull(),
  executionId: integer("executionId").references(() => taskExecutions.id, { onDelete: "cascade" }),

  // Session identity
  sessionId: varchar("sessionId", { length: 255 }).notNull().unique(),
  projectId: varchar("projectId", { length: 255 }),

  // Session metrics
  durationMs: integer("durationMs").notNull(), // Session duration in milliseconds
  durationMinutes: decimal("durationMinutes", { precision: 10, scale: 2 }).notNull(), // Duration in minutes

  // Cost calculation (in USD)
  costPerMinute: decimal("costPerMinute", { precision: 10, scale: 4 }).notNull().default("0.01"), // ~$0.01/min
  totalCost: decimal("totalCost", { precision: 10, scale: 4 }).notNull(), // Total session cost in USD

  // Session details
  debugUrl: varchar("debugUrl", { length: 500 }),
  recordingUrl: varchar("recordingUrl", { length: 500 }),
  hasRecording: boolean("hasRecording").default(false).notNull(),

  // Additional charges
  recordingCost: decimal("recordingCost", { precision: 10, scale: 4 }).default("0").notNull(),
  screenshotCount: integer("screenshotCount").default(0).notNull(),
  screenshotCost: decimal("screenshotCost", { precision: 10, scale: 4 }).default("0").notNull(),

  // Status
  status: varchar("status", { length: 50 }).notNull(), // active, completed, failed, timeout

  // Timestamps
  startedAt: timestamp("startedAt").notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // Indexes for common queries
  userIdIdx: index("browserbase_costs_user_id_idx").on(table.userId),
  executionIdIdx: index("browserbase_costs_execution_id_idx").on(table.executionId),
  sessionIdIdx: index("browserbase_costs_session_id_idx").on(table.sessionId),
  statusIdx: index("browserbase_costs_status_idx").on(table.status),
  createdAtIdx: index("browserbase_costs_created_at_idx").on(table.createdAt),
  userCreatedIdx: index("browserbase_costs_user_created_idx").on(table.userId, table.createdAt),
}));

// ========================================
// STORAGE COSTS (S3/R2)
// ========================================

/**
 * Storage operation cost tracking
 * Tracks S3/R2 storage usage and costs
 */
export const storageCosts = pgTable("storage_costs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id, { onDelete: "cascade" }).notNull(),
  executionId: integer("executionId").references(() => taskExecutions.id, { onDelete: "cascade" }),

  // Operation identity
  operationId: varchar("operationId", { length: 255 }), // Unique operation ID
  provider: varchar("provider", { length: 50 }).notNull(), // s3, r2, gcs
  bucket: varchar("bucket", { length: 255 }).notNull(),

  // Operation type
  operationType: varchar("operationType", { length: 50 }).notNull(), // upload, download, delete, list
  objectKey: varchar("objectKey", { length: 1000 }), // S3 object key

  // Size metrics
  sizeBytes: integer("sizeBytes").default(0).notNull(), // Size in bytes
  sizeMb: decimal("sizeMb", { precision: 10, scale: 4 }).default("0").notNull(), // Size in MB

  // Cost calculation (in USD - very granular for storage)
  storageCostPerGb: decimal("storageCostPerGb", { precision: 10, scale: 6 }).default("0.023").notNull(), // ~$0.023/GB/month
  transferCostPerGb: decimal("transferCostPerGb", { precision: 10, scale: 6 }).default("0.09").notNull(), // ~$0.09/GB egress
  requestCost: decimal("requestCost", { precision: 10, scale: 8 }).default("0").notNull(), // Per-request cost
  totalCost: decimal("totalCost", { precision: 10, scale: 6 }).notNull(), // Total operation cost in USD

  // Content type
  contentType: varchar("contentType", { length: 255 }), // image/png, application/json, etc.

  // Status
  status: varchar("status", { length: 50 }).notNull(), // success, failed, pending

  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // Indexes for common queries
  userIdIdx: index("storage_costs_user_id_idx").on(table.userId),
  executionIdIdx: index("storage_costs_execution_id_idx").on(table.executionId),
  providerIdx: index("storage_costs_provider_idx").on(table.provider),
  operationTypeIdx: index("storage_costs_operation_type_idx").on(table.operationType),
  createdAtIdx: index("storage_costs_created_at_idx").on(table.createdAt),
  userCreatedIdx: index("storage_costs_user_created_idx").on(table.userId, table.createdAt),
}));

// ========================================
// AGGREGATED COST SUMMARIES
// ========================================

/**
 * Daily cost summaries per user
 * Aggregated cost data for faster queries and reporting
 */
export const dailyCostSummaries = pgTable("daily_cost_summaries", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id, { onDelete: "cascade" }).notNull(),

  // Time period
  date: timestamp("date").notNull(), // Date of the summary (truncated to day)

  // Claude API token costs
  totalApiCalls: integer("totalApiCalls").default(0).notNull(),
  totalInputTokens: integer("totalInputTokens").default(0).notNull(),
  totalOutputTokens: integer("totalOutputTokens").default(0).notNull(),
  totalCacheTokens: integer("totalCacheTokens").default(0).notNull(),
  apiCostUsd: decimal("apiCostUsd", { precision: 10, scale: 4 }).default("0").notNull(),

  // Gemini API token costs
  totalGeminiCalls: integer("totalGeminiCalls").default(0).notNull(),
  totalGeminiInputTokens: integer("totalGeminiInputTokens").default(0).notNull(),
  totalGeminiOutputTokens: integer("totalGeminiOutputTokens").default(0).notNull(),
  geminiCostUsd: decimal("geminiCostUsd", { precision: 10, scale: 6 }).default("0").notNull(),

  // Browserbase costs
  totalSessions: integer("totalSessions").default(0).notNull(),
  totalSessionMinutes: decimal("totalSessionMinutes", { precision: 10, scale: 2 }).default("0").notNull(),
  browserbaseCostUsd: decimal("browserbaseCostUsd", { precision: 10, scale: 4 }).default("0").notNull(),

  // Storage costs (S3/R2)
  totalStorageOperations: integer("totalStorageOperations").default(0).notNull(),
  totalStorageMb: decimal("totalStorageMb", { precision: 10, scale: 4 }).default("0").notNull(),
  storageCostUsd: decimal("storageCostUsd", { precision: 10, scale: 6 }).default("0").notNull(),

  // Total costs
  totalCostUsd: decimal("totalCostUsd", { precision: 10, scale: 4 }).notNull(),

  // Breakdown by model/provider
  costByModel: jsonb("costByModel"), // { "claude-opus-4-5": 1.23, "gemini-2.0-flash": 0.01, ... }
  costByProvider: jsonb("costByProvider"), // { "anthropic": 1.23, "google": 0.05, "browserbase": 0.10, "s3": 0.02 }

  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  // Indexes for common queries
  userIdIdx: index("daily_cost_summaries_user_id_idx").on(table.userId),
  dateIdx: index("daily_cost_summaries_date_idx").on(table.date),
  userDateIdx: index("daily_cost_summaries_user_date_idx").on(table.userId, table.date),
}));

// ========================================
// COST BUDGETS & ALERTS
// ========================================

/**
 * User cost budgets
 * Define spending limits and alert thresholds
 */
export const costBudgets = pgTable("cost_budgets", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),

  // Budget limits (in USD)
  dailyBudget: decimal("dailyBudget", { precision: 10, scale: 2 }),
  weeklyBudget: decimal("weeklyBudget", { precision: 10, scale: 2 }),
  monthlyBudget: decimal("monthlyBudget", { precision: 10, scale: 2 }),

  // Alert thresholds (percentage of budget)
  alertThreshold: integer("alertThreshold").default(80).notNull(), // Alert at 80% of budget

  // Current period spending
  currentDailySpend: decimal("currentDailySpend", { precision: 10, scale: 4 }).default("0").notNull(),
  currentWeeklySpend: decimal("currentWeeklySpend", { precision: 10, scale: 4 }).default("0").notNull(),
  currentMonthlySpend: decimal("currentMonthlySpend", { precision: 10, scale: 4 }).default("0").notNull(),

  // Budget status
  isActive: boolean("isActive").default(true).notNull(),
  autoStopOnLimit: boolean("autoStopOnLimit").default(false).notNull(), // Stop executions when limit reached

  // Alert tracking
  lastAlertSent: timestamp("lastAlertSent"),
  alertsSentToday: integer("alertsSentToday").default(0).notNull(),

  // Period tracking
  dailyPeriodStart: timestamp("dailyPeriodStart").defaultNow().notNull(),
  weeklyPeriodStart: timestamp("weeklyPeriodStart").defaultNow().notNull(),
  monthlyPeriodStart: timestamp("monthlyPeriodStart").defaultNow().notNull(),

  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  // Indexes for common queries
  userIdIdx: index("cost_budgets_user_id_idx").on(table.userId),
  isActiveIdx: index("cost_budgets_is_active_idx").on(table.isActive),
}));

// ========================================
// TYPE EXPORTS
// ========================================

export type ApiTokenUsage = typeof apiTokenUsage.$inferSelect;
export type InsertApiTokenUsage = typeof apiTokenUsage.$inferInsert;

export type GeminiTokenUsage = typeof geminiTokenUsage.$inferSelect;
export type InsertGeminiTokenUsage = typeof geminiTokenUsage.$inferInsert;

export type BrowserbaseCost = typeof browserbaseCosts.$inferSelect;
export type InsertBrowserbaseCost = typeof browserbaseCosts.$inferInsert;

export type StorageCost = typeof storageCosts.$inferSelect;
export type InsertStorageCost = typeof storageCosts.$inferInsert;

export type DailyCostSummary = typeof dailyCostSummaries.$inferSelect;
export type InsertDailyCostSummary = typeof dailyCostSummaries.$inferInsert;

export type CostBudget = typeof costBudgets.$inferSelect;
export type InsertCostBudget = typeof costBudgets.$inferInsert;
