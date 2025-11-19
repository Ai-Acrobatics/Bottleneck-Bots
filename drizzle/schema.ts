import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// TODO: Add your tables here

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  status: varchar("status", { length: 50 }).default("new"), // new, contacted, qualified, closed
  campaignId: varchar("campaignId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: serial("userId").references(() => users.id),
  name: text("name").notNull(),
  url: text("url").notNull(), // S3 URL
  type: varchar("type", { length: 50 }), // pdf, docx, txt
  size: varchar("size", { length: 20 }),
  embeddingId: varchar("embeddingId", { length: 128 }), // Vector DB ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // email_sync, voice_call, seo_audit
  status: varchar("status", { length: 50 }).default("pending"), // pending, processing, completed, failed
  payload: text("payload"), // JSON string of job data
  result: text("result"), // JSON string of result
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  userId: serial("userId").references(() => users.id),
  service: varchar("service", { length: 50 }).notNull(), // gmail, outlook, twilio, stripe, etc.
  accessToken: text("accessToken"), // Encrypted OAuth access token
  refreshToken: text("refreshToken"), // Encrypted OAuth refresh token
  expiresAt: timestamp("expiresAt"), // Token expiration
  metadata: text("metadata"), // JSON string for service-specific data
  isActive: varchar("isActive", { length: 10 }).default("true"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;
export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = typeof integrations.$inferInsert;