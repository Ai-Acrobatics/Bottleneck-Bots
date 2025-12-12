import { pgTable, serial, text, timestamp, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { users } from "./schema";

/**
 * Admin Dashboard Schema
 * Tables for system administration, security, and support
 */

/**
 * Audit logs
 * Tracks all admin actions for compliance and security auditing
 */
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  action: varchar("action", { length: 100 }).notNull(), // create, update, delete, login, etc.
  entityType: varchar("entityType", { length: 100 }).notNull(), // user, feature_flag, system_config, etc.
  entityId: varchar("entityId", { length: 100 }), // ID of affected entity
  oldValues: jsonb("oldValues"), // Previous state before change
  newValues: jsonb("newValues"), // New state after change
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Feature flags
 * Feature toggle system for gradual rollout and A/B testing
 */
export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(), // Unique feature identifier
  description: text("description"),
  enabled: boolean("enabled").default(false).notNull(), // Global on/off switch
  rolloutPercentage: integer("rolloutPercentage").default(0).notNull(), // 0-100 percentage for gradual rollout
  userWhitelist: jsonb("userWhitelist"), // Array of user IDs with explicit access
  metadata: jsonb("metadata"), // Additional configuration (targeting rules, variants, etc.)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = typeof featureFlags.$inferInsert;

/**
 * System configuration
 * Runtime configuration values for dynamic system settings
 */
export const systemConfig = pgTable("system_config", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(), // Unique config key
  value: jsonb("value").notNull(), // Configuration value (can be any JSON structure)
  description: text("description"),
  updatedBy: integer("updatedBy").references(() => users.id),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertSystemConfig = typeof systemConfig.$inferInsert;

/**
 * Support tickets
 * Customer support ticketing system
 */
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 20 }).default("open").notNull(), // open, in_progress, waiting_customer, resolved, closed
  priority: varchar("priority", { length: 20 }).default("medium").notNull(), // low, medium, high, urgent
  assignedTo: integer("assignedTo").references(() => users.id), // Admin user assigned to ticket
  category: varchar("category", { length: 50 }), // billing, technical, feature_request, etc.
  tags: jsonb("tags"), // Array of tags for organization
  metadata: jsonb("metadata"), // Additional context (browser, device, error logs, etc.)
  resolvedAt: timestamp("resolvedAt"),
  closedAt: timestamp("closedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

/**
 * Ticket messages
 * Messages/replies within support tickets
 */
export const ticketMessages = pgTable("ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticketId").references(() => supportTickets.id).notNull(),
  senderId: integer("senderId").references(() => users.id).notNull(),
  message: text("message").notNull(),
  isInternal: boolean("isInternal").default(false).notNull(), // Internal notes vs customer-visible messages
  attachments: jsonb("attachments"), // Array of attachment metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TicketMessage = typeof ticketMessages.$inferSelect;
export type InsertTicketMessage = typeof ticketMessages.$inferInsert;

/**
 * Announcements
 * System-wide or targeted in-app announcements
 */
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 20 }).default("info").notNull(), // info, warning, success, error, maintenance
  targetRoles: jsonb("targetRoles"), // Array of roles that should see this announcement (null = all users)
  targetUsers: jsonb("targetUsers"), // Array of specific user IDs (null = all users)
  startsAt: timestamp("startsAt").notNull(), // When announcement becomes visible
  endsAt: timestamp("endsAt"), // When announcement stops showing (null = indefinite)
  isDismissible: boolean("isDismissible").default(true).notNull(), // Can users dismiss it
  priority: integer("priority").default(0).notNull(), // Higher priority shows first
  linkUrl: text("linkUrl"), // Optional CTA link
  linkText: varchar("linkText", { length: 100 }), // CTA button text
  createdBy: integer("createdBy").references(() => users.id).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

/**
 * Security events
 * Security monitoring and threat detection
 */
export const securityEvents = pgTable("security_events", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id), // May be null for unauthenticated events
  eventType: varchar("eventType", { length: 50 }).notNull(), // failed_login, brute_force, suspicious_activity, etc.
  severity: varchar("severity", { length: 20 }).default("low").notNull(), // low, medium, high, critical
  description: text("description").notNull(),
  metadata: jsonb("metadata"), // Event-specific data (failed attempts, affected resources, etc.)
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  geoLocation: jsonb("geoLocation"), // Country, region, city from IP lookup
  resolved: boolean("resolved").default(false).notNull(),
  resolvedBy: integer("resolvedBy").references(() => users.id),
  resolvedAt: timestamp("resolvedAt"),
  notes: text("notes"), // Admin notes on resolution
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SecurityEvent = typeof securityEvents.$inferSelect;
export type InsertSecurityEvent = typeof securityEvents.$inferInsert;
