import { pgTable, serial, text, timestamp, varchar, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { users } from "./schema";

/**
 * SEO Reports
 * Stores SEO audit reports and analyses
 */
export const seoReports = pgTable("seo_reports", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  url: text("url").notNull(),
  title: text("title"),
  score: integer("score").notNull(), // Overall SEO score 0-100
  status: varchar("status", { length: 20 }).default("completed").notNull(), // pending, processing, completed, failed

  // SEO Data
  metaDescription: text("metaDescription"),
  metaKeywords: text("metaKeywords"),
  headings: jsonb("headings"), // { h1: [], h2: [], h3: [] }
  images: jsonb("images"), // { total, withAlt, withoutAlt, issues }
  links: jsonb("links"), // { internal, external, broken }
  performance: jsonb("performance"), // { loadTime, pageSize, requests }
  technicalSEO: jsonb("technicalSEO"), // { hasRobotsTxt, hasSitemap, isResponsive, hasSSL, etc }
  contentAnalysis: jsonb("contentAnalysis"), // { wordCount, readabilityScore, keywordDensity }

  // AI Analysis
  aiInsights: text("aiInsights"),
  recommendations: jsonb("recommendations"), // Array of recommendation strings

  // Report metadata
  pdfUrl: text("pdfUrl"), // URL to generated PDF report
  reportType: varchar("reportType", { length: 20 }).default("full"), // technical, content, full

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SeoReport = typeof seoReports.$inferSelect;
export type InsertSeoReport = typeof seoReports.$inferInsert;

/**
 * Keyword Research
 * Stores keyword research data and suggestions
 */
export const keywordResearch = pgTable("keyword_research", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  topic: text("topic").notNull(),
  keyword: text("keyword").notNull(),
  searchVolume: integer("searchVolume").default(0),
  difficulty: integer("difficulty").default(50), // 0-100
  cpc: integer("cpc").default(0), // Cost per click in cents
  trend: varchar("trend", { length: 10 }).default("stable"), // up, down, stable
  relatedKeywords: jsonb("relatedKeywords"), // Array of related keyword strings

  // Metadata
  source: varchar("source", { length: 50 }).default("ai"), // ai, semrush, ahrefs, manual
  metadata: jsonb("metadata"), // Additional keyword data

  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type KeywordResearch = typeof keywordResearch.$inferSelect;
export type InsertKeywordResearch = typeof keywordResearch.$inferInsert;

/**
 * Keyword Rankings
 * Tracks keyword rankings over time
 */
export const keywordRankings = pgTable("keyword_rankings", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  url: text("url").notNull(),
  keyword: text("keyword").notNull(),
  position: integer("position"), // Ranking position (null if not ranked in top 100)
  previousPosition: integer("previousPosition"),
  change: integer("change").default(0), // Position change since last check

  // Search Engine
  searchEngine: varchar("searchEngine", { length: 20 }).default("google"), // google, bing
  location: varchar("location", { length: 100 }).default("United States"),

  // Metadata
  pageTitle: text("pageTitle"),
  pageUrl: text("pageUrl"), // Actual ranking URL (may differ from monitored URL)
  snippet: text("snippet"),

  checkedAt: timestamp("checkedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type KeywordRanking = typeof keywordRankings.$inferSelect;
export type InsertKeywordRanking = typeof keywordRankings.$inferInsert;

/**
 * Backlinks
 * Stores backlink data for tracked URLs
 */
export const backlinks = pgTable("backlinks", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  targetUrl: text("targetUrl").notNull(), // The URL being linked to
  sourceUrl: text("sourceUrl").notNull(), // The URL containing the backlink
  sourceDomain: text("sourceDomain").notNull(),

  // Link attributes
  anchorText: text("anchorText"),
  isDoFollow: boolean("isDoFollow").default(true),
  isActive: boolean("isActive").default(true), // Still exists

  // Quality metrics
  domainRating: integer("domainRating").default(0), // 0-100
  domainAuthority: integer("domainAuthority").default(0), // 0-100
  pageAuthority: integer("pageAuthority").default(0), // 0-100
  isToxic: boolean("isToxic").default(false),

  // Metadata
  firstSeen: timestamp("firstSeen").defaultNow().notNull(),
  lastSeen: timestamp("lastSeen").defaultNow().notNull(),
  lastChecked: timestamp("lastChecked").defaultNow().notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Backlink = typeof backlinks.$inferSelect;
export type InsertBacklink = typeof backlinks.$inferInsert;

/**
 * Heatmap Sessions
 * Stores heatmap tracking sessions
 */
export const heatmapSessions = pgTable("heatmap_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  url: text("url").notNull(),
  trackingId: varchar("trackingId", { length: 100 }).notNull().unique(),

  // Analytics
  totalClicks: integer("totalClicks").default(0),
  totalSessions: integer("totalSessions").default(0),
  averageScrollDepth: integer("averageScrollDepth").default(0), // Percentage
  bounceRate: integer("bounceRate").default(0), // Percentage
  averageTimeOnPage: integer("averageTimeOnPage").default(0), // Seconds

  // Status
  isActive: boolean("isActive").default(true),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type HeatmapSession = typeof heatmapSessions.$inferSelect;
export type InsertHeatmapSession = typeof heatmapSessions.$inferInsert;

/**
 * Heatmap Events
 * Stores individual click and scroll events
 */
export const heatmapEvents = pgTable("heatmap_events", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").references(() => heatmapSessions.id).notNull(),
  eventType: varchar("eventType", { length: 20 }).notNull(), // click, scroll

  // Event data
  x: integer("x"), // X coordinate for clicks
  y: integer("y"), // Y coordinate for clicks
  element: text("element"), // Element tag name or selector
  scrollDepth: integer("scrollDepth"), // Scroll depth in pixels
  scrollPercentage: integer("scrollPercentage"), // Scroll percentage

  // Session info
  visitorId: varchar("visitorId", { length: 100 }), // Anonymous visitor ID
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6

  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HeatmapEvent = typeof heatmapEvents.$inferSelect;
export type InsertHeatmapEvent = typeof heatmapEvents.$inferInsert;

/**
 * Scheduled SEO Reports
 * Stores recurring report schedules
 */
export const scheduledSeoReports = pgTable("scheduled_seo_reports", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  url: text("url").notNull(),

  // Schedule
  frequency: varchar("frequency", { length: 20 }).notNull(), // daily, weekly, monthly
  nextRunAt: timestamp("nextRunAt").notNull(),
  lastRunAt: timestamp("lastRunAt"),

  // Report options
  reportOptions: jsonb("reportOptions"), // PDF generation options
  recipients: jsonb("recipients"), // Array of email addresses

  // Status
  isActive: boolean("isActive").default(true).notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ScheduledSeoReport = typeof scheduledSeoReports.$inferSelect;
export type InsertScheduledSeoReport = typeof scheduledSeoReports.$inferInsert;

/**
 * SEO Competitors
 * Track competitor websites for comparison
 */
export const seoCompetitors = pgTable("seo_competitors", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  userUrl: text("userUrl").notNull(), // User's website
  competitorUrl: text("competitorUrl").notNull(), // Competitor's website
  competitorName: text("competitorName"),

  // Latest metrics
  lastScore: integer("lastScore"),
  lastDomainAuthority: integer("lastDomainAuthority"),
  lastBacklinkCount: integer("lastBacklinkCount"),
  lastKeywordCount: integer("lastKeywordCount"),

  // Status
  isActive: boolean("isActive").default(true).notNull(),

  lastChecked: timestamp("lastChecked"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SeoCompetitor = typeof seoCompetitors.$inferSelect;
export type InsertSeoCompetitor = typeof seoCompetitors.$inferInsert;
