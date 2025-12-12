import { pgTable, serial, text, timestamp, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { users } from "./schema";

/**
 * Email Integration Schema
 *
 * Tables for managing email OAuth connections, synced emails, and AI-generated drafts.
 * Supports Gmail and Outlook OAuth flows with encrypted token storage.
 */

/**
 * Email connections
 * Stores OAuth tokens and metadata for connected email accounts
 */
export const emailConnections = pgTable("email_connections", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  provider: varchar("provider", { length: 20 }).notNull(), // gmail, outlook
  email: varchar("email", { length: 320 }).notNull(), // Email address of the connected account
  accessToken: text("accessToken").notNull(), // Encrypted OAuth access token
  refreshToken: text("refreshToken").notNull(), // Encrypted OAuth refresh token
  expiresAt: timestamp("expiresAt").notNull(), // Token expiration timestamp
  scope: text("scope").notNull(), // OAuth scopes granted
  metadata: jsonb("metadata"), // Provider-specific metadata (user info, etc.)
  isActive: boolean("isActive").default(true).notNull(),
  lastSyncedAt: timestamp("lastSyncedAt"), // Last time emails were synced
  syncCursor: text("syncCursor"), // Provider-specific sync cursor/token
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type EmailConnection = typeof emailConnections.$inferSelect;
export type InsertEmailConnection = typeof emailConnections.$inferInsert;

/**
 * Synced emails
 * Stores emails fetched from connected email accounts
 */
export const syncedEmails = pgTable("synced_emails", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  connectionId: integer("connectionId").references(() => emailConnections.id).notNull(),
  messageId: text("messageId").notNull().unique(), // Provider's unique message ID
  threadId: text("threadId"), // Provider's thread ID for conversation grouping
  subject: text("subject"),
  from: jsonb("from").notNull(), // { name: string, email: string }
  to: jsonb("to").notNull(), // Array of { name: string, email: string }
  cc: jsonb("cc"), // Array of { name: string, email: string }
  bcc: jsonb("bcc"), // Array of { name: string, email: string }
  replyTo: jsonb("replyTo"), // Array of { name: string, email: string }
  date: timestamp("date").notNull(), // Email send date
  body: text("body"), // Email body (HTML or plain text)
  bodyType: varchar("bodyType", { length: 10 }), // html, text
  snippet: text("snippet"), // Short preview/snippet of email
  labels: jsonb("labels"), // Array of label names/IDs
  isRead: boolean("isRead").default(false).notNull(),
  isStarred: boolean("isStarred").default(false).notNull(),
  hasAttachments: boolean("hasAttachments").default(false).notNull(),
  attachments: jsonb("attachments"), // Array of attachment metadata
  headers: jsonb("headers"), // Important email headers
  rawData: jsonb("rawData"), // Complete raw response from provider
  sentiment: varchar("sentiment", { length: 20 }), // positive, negative, neutral, mixed (from AI)
  sentimentScore: integer("sentimentScore"), // -100 to 100 sentiment score
  importance: varchar("importance", { length: 20 }), // high, medium, low (from AI)
  category: varchar("category", { length: 50 }), // AI-detected category (sales, support, etc.)
  requiresResponse: boolean("requiresResponse"), // AI-detected if response needed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SyncedEmail = typeof syncedEmails.$inferSelect;
export type InsertSyncedEmail = typeof syncedEmails.$inferInsert;

/**
 * Email drafts
 * Stores AI-generated draft responses
 */
export const emailDrafts = pgTable("email_drafts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  emailId: integer("emailId").references(() => syncedEmails.id).notNull(),
  connectionId: integer("connectionId").references(() => emailConnections.id).notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(), // Generated draft content
  bodyType: varchar("bodyType", { length: 10 }).default("html").notNull(), // html, text
  tone: varchar("tone", { length: 20 }), // professional, casual, friendly, etc.
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, approved, sent, discarded
  model: varchar("model", { length: 50 }), // AI model used (gpt-4, claude-3, etc.)
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  sentAt: timestamp("sentAt"), // When the draft was sent
  providerId: text("providerId"), // Provider's message ID after sending
  metadata: jsonb("metadata"), // Generation params, context, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type EmailDraft = typeof emailDrafts.$inferSelect;
export type InsertEmailDraft = typeof emailDrafts.$inferInsert;

/**
 * Email sync history
 * Tracks email sync job execution and results
 */
export const emailSyncHistory = pgTable("email_sync_history", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  connectionId: integer("connectionId").references(() => emailConnections.id).notNull(),
  jobId: text("jobId"), // BullMQ job ID
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, running, completed, failed
  emailsFetched: integer("emailsFetched").default(0).notNull(),
  emailsProcessed: integer("emailsProcessed").default(0).notNull(),
  draftsGenerated: integer("draftsGenerated").default(0).notNull(),
  error: text("error"), // Error message if failed
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  duration: integer("duration"), // Duration in milliseconds
  metadata: jsonb("metadata"), // Additional sync details
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type EmailSyncHistory = typeof emailSyncHistory.$inferSelect;
export type InsertEmailSyncHistory = typeof emailSyncHistory.$inferInsert;
