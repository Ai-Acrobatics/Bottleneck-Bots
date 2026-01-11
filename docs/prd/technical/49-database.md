# PRD: Database Layer

## Overview
Implement a robust, type-safe database layer using Drizzle ORM with PostgreSQL as the primary database. This includes comprehensive schema definitions covering all application entities, migrations management, transaction support, and optimized query patterns for the 18+ schema files required by Bottleneck-Bots.

## Problem Statement
A poorly designed database layer leads to:
- Runtime errors from schema mismatches
- SQL injection vulnerabilities from raw queries
- Performance issues from unoptimized queries
- Difficult migrations and schema evolution
- Inconsistent data access patterns across the codebase
- Data integrity issues from missing constraints

## Goals & Objectives
- **Primary Goals**
  - Implement type-safe database queries with Drizzle ORM
  - Design normalized schema covering all application domains
  - Enable safe, versioned migrations with rollback capability
  - Optimize common query patterns for performance
  - Ensure data integrity through constraints and validations

- **Success Metrics**
  - Zero runtime type errors from database queries
  - Query response time < 50ms for 95% of operations
  - Successful migration rollback in < 30 seconds
  - 100% test coverage for critical data operations

## User Stories
- As a developer, I want type-safe queries so that I catch errors at compile time
- As a developer, I want readable ORM syntax so that I can understand queries easily
- As a DBA, I want migration versioning so that I can track and rollback schema changes
- As a developer, I want transaction support so that I can ensure data consistency
- As an operator, I want query performance monitoring so that I can optimize slow queries
- As a security engineer, I want parameterized queries so that SQL injection is prevented

## Functional Requirements

### Must Have (P0)
- **Drizzle ORM Setup**: Full TypeScript integration with PostgreSQL
- **Schema Definitions**: Type-safe table definitions for all entities
- **Migrations**: Version-controlled schema migrations with CLI support
- **Relationships**: Proper foreign keys and relation definitions
- **CRUD Operations**: Standard create, read, update, delete operations
- **Transactions**: ACID-compliant transaction support
- **Connection Pooling**: Efficient database connection management
- **Query Builders**: Composable, type-safe query construction
- **Indexes**: Optimized indexes for common query patterns

### Should Have (P1)
- **Soft Deletes**: Logical deletion with `deletedAt` timestamps
- **Audit Columns**: Automatic `createdAt`, `updatedAt` tracking
- **Full-Text Search**: PostgreSQL full-text search integration
- **JSON Columns**: Type-safe JSONB column handling
- **Enums**: PostgreSQL enum types with TypeScript enums
- **Migration Rollback**: Safe schema rollback procedures
- **Seeding**: Development and test data seeding scripts
- **Query Logging**: Detailed logging for debugging and monitoring

### Nice to Have (P2)
- **Read Replicas**: Query routing for read scalability
- **Row-Level Security**: PostgreSQL RLS for multi-tenancy
- **Database Branching**: Development environment isolation
- **Time-Travel Queries**: Temporal data access for audit
- **Stored Procedures**: Complex business logic in database
- **Partitioning**: Table partitioning for large datasets
- **Database Metrics**: Connection pool and query analytics

## Non-Functional Requirements

### Performance
- Connection pool: 10-50 connections based on load
- Query latency: < 50ms for 95th percentile
- Batch insert: 10,000 rows/second
- Transaction overhead: < 5ms
- Index size: Optimized for query patterns

### Security
- All queries parameterized (no string concatenation)
- Credentials in environment variables
- Connection encryption (SSL/TLS)
- Principle of least privilege for DB users
- Sensitive data encryption at rest

### Scalability
- Support 100,000+ rows per major table
- Handle 1,000+ concurrent connections (with pooling)
- Horizontal read scaling with replicas (future)

### Reliability
- Automatic reconnection on connection loss
- Transaction retry for transient failures
- Point-in-time recovery capability (PITR)
- Regular automated backups

## Technical Requirements

### Architecture
```
/src/db/
  ├── index.ts                    # Database client initialization
  ├── config.ts                   # Database configuration
  ├── client.ts                   # Drizzle client instance
  ├── schema/
  │   ├── index.ts                # Schema barrel export
  │   ├── users.ts                # User accounts
  │   ├── organizations.ts        # Organizations/tenants
  │   ├── organization-members.ts # Org membership
  │   ├── roles.ts                # RBAC roles
  │   ├── permissions.ts          # Permission definitions
  │   ├── bots.ts                 # Bot configurations
  │   ├── bot-runs.ts             # Bot execution history
  │   ├── bot-logs.ts             # Bot execution logs
  │   ├── workflows.ts            # Workflow definitions
  │   ├── workflow-runs.ts        # Workflow execution history
  │   ├── tasks.ts                # Task assignments
  │   ├── credentials.ts          # Encrypted credentials
  │   ├── sessions.ts             # User sessions
  │   ├── session-recordings.ts   # RRWeb recordings
  │   ├── notifications.ts        # In-app notifications
  │   ├── activity-logs.ts        # Audit trail
  │   ├── api-keys.ts             # API key management
  │   └── settings.ts             # User/org settings
  ├── migrations/
  │   ├── 0000_initial.sql
  │   ├── 0001_add_bots.sql
  │   └── ...
  ├── queries/
  │   ├── users.ts                # User query helpers
  │   ├── bots.ts                 # Bot query helpers
  │   └── ...
  └── utils/
      ├── pagination.ts           # Pagination utilities
      ├── soft-delete.ts          # Soft delete helpers
      └── transactions.ts         # Transaction wrapper
```

### Schema Definition Pattern
```typescript
// src/db/schema/bots.ts
import { pgTable, uuid, text, timestamp, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations';
import { users } from './users';
import { botRuns } from './bot-runs';

export const bots = pgTable('bots', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  createdById: uuid('created_by_id')
    .notNull()
    .references(() => users.id),

  name: text('name').notNull(),
  description: text('description'),
  slug: text('slug').notNull(),

  isActive: boolean('is_active').notNull().default(true),
  schedule: text('schedule'), // Cron expression

  config: jsonb('config').notNull().$type<BotConfig>(),

  lastRunAt: timestamp('last_run_at', { withTimezone: true }),
  nextRunAt: timestamp('next_run_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  orgIdIdx: index('bots_org_id_idx').on(table.organizationId),
  slugIdx: index('bots_slug_idx').on(table.organizationId, table.slug),
  activeIdx: index('bots_active_idx').on(table.isActive).where(eq(table.deletedAt, null)),
  nextRunIdx: index('bots_next_run_idx').on(table.nextRunAt),
}));

export const botsRelations = relations(bots, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [bots.organizationId],
    references: [organizations.id],
  }),
  createdBy: one(users, {
    fields: [bots.createdById],
    references: [users.id],
  }),
  runs: many(botRuns),
}));

// Type inference
export type Bot = typeof bots.$inferSelect;
export type NewBot = typeof bots.$inferInsert;
```

### Database Client Setup
```typescript
// src/db/client.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Connection for queries (pooled)
const queryClient = postgres(connectionString, {
  max: 20,                    // Max connections
  idle_timeout: 20,           // Idle connection timeout (seconds)
  connect_timeout: 10,        // Connection timeout (seconds)
  prepare: true,              // Enable prepared statements
});

// Connection for migrations (single)
export const migrationClient = postgres(connectionString, { max: 1 });

export const db = drizzle(queryClient, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});

export type Database = typeof db;
```

### Query Patterns
```typescript
// src/db/queries/bots.ts
import { db } from '../client';
import { bots, botRuns } from '../schema';
import { eq, and, isNull, desc, sql } from 'drizzle-orm';

// Simple select with relations
export async function getBotWithRuns(botId: string) {
  return db.query.bots.findFirst({
    where: and(eq(bots.id, botId), isNull(bots.deletedAt)),
    with: {
      runs: {
        limit: 10,
        orderBy: [desc(botRuns.startedAt)],
      },
      createdBy: {
        columns: { id: true, name: true, email: true },
      },
    },
  });
}

// Paginated query
export async function listBots(
  orgId: string,
  { page = 1, pageSize = 20 }: PaginationOptions
) {
  const offset = (page - 1) * pageSize;

  const [data, [{ count }]] = await Promise.all([
    db.query.bots.findMany({
      where: and(
        eq(bots.organizationId, orgId),
        isNull(bots.deletedAt)
      ),
      limit: pageSize,
      offset,
      orderBy: [desc(bots.createdAt)],
    }),
    db.select({ count: sql<number>`count(*)` })
      .from(bots)
      .where(and(
        eq(bots.organizationId, orgId),
        isNull(bots.deletedAt)
      )),
  ]);

  return {
    data,
    pagination: {
      page,
      pageSize,
      totalCount: Number(count),
      totalPages: Math.ceil(Number(count) / pageSize),
    },
  };
}

// Transaction example
export async function createBotWithInitialRun(
  botData: NewBot,
  runData: NewBotRun
) {
  return db.transaction(async (tx) => {
    const [bot] = await tx.insert(bots).values(botData).returning();
    const [run] = await tx.insert(botRuns)
      .values({ ...runData, botId: bot.id })
      .returning();
    return { bot, run };
  });
}

// Soft delete
export async function softDeleteBot(botId: string) {
  return db.update(bots)
    .set({ deletedAt: new Date() })
    .where(eq(bots.id, botId))
    .returning();
}
```

### Migration Management
```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema/*',
  out: './src/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;

// CLI Commands
// npx drizzle-kit generate:pg  - Generate migration
// npx drizzle-kit push:pg      - Push schema to dev DB
// npx drizzle-kit studio       - Open Drizzle Studio
```

### Dependencies
- `drizzle-orm` - TypeScript ORM
- `drizzle-kit` - Migration CLI
- `postgres` (or `@neondatabase/serverless`) - PostgreSQL driver
- `pg` - PostgreSQL protocol (type definitions)
- `zod` - Schema validation (shared with API)

### Database Services
```typescript
// PostgreSQL providers supported:
// - Neon (serverless, branching)
// - Supabase (managed, auth integration)
// - Railway (simple managed)
// - Self-hosted (Docker, bare metal)

// Connection string format:
// postgres://user:password@host:5432/database?sslmode=require
```

## Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Query latency (p95) | < 50ms | Database monitoring |
| Type errors | Zero | TypeScript compilation |
| Migration rollback time | < 30s | Deployment metrics |
| Test coverage | 100% critical ops | Jest coverage |
| Connection efficiency | < 20 idle connections | Pool monitoring |

## Dependencies
- PostgreSQL database instance
- Environment variable management
- CI/CD for migration execution
- Monitoring infrastructure

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Schema drift between environments | High - Data issues | Strict migration workflow; CI checks |
| Connection pool exhaustion | High - Service outage | Pool limits; query timeouts; monitoring alerts |
| Slow migrations on large tables | Medium - Downtime | Zero-downtime migration patterns; testing on prod-like data |
| ORM learning curve | Medium - Dev velocity | Thorough documentation; training; escape hatch to raw SQL |
| Data loss from migration errors | Critical - Unrecoverable | Backup before migration; transaction wrapping; staging test |
| N+1 query problems | Medium - Performance | Query monitoring; relation loading patterns; code review |
