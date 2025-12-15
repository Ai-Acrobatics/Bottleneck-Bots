# Development Setup Guide

A comprehensive guide to setting up the GHL Agency AI development environment. This guide covers everything from initial prerequisites through running the application locally.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Development Workflow](#development-workflow)
6. [Project Structure](#project-structure)
7. [Common Development Tasks](#common-development-tasks)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)
10. [Additional Resources](#additional-resources)

---

## Prerequisites

Before starting, ensure you have the following installed and configured:

### Required Software

**Node.js**
- **Version**: 20.x (LTS recommended)
- **Check version**: `node --version`
- **Installation**: Download from [nodejs.org](https://nodejs.org/) or use [nvm](https://github.com/nvm-sh/nvm)

```bash
# Using nvm (recommended)
nvm install 20
nvm use 20
```

**pnpm Package Manager**
- **Version**: 10.4.1+ (project uses 10.4.1)
- **Check version**: `pnpm --version`
- **Installation**:

```bash
# Via npm
npm install -g pnpm@10.4.1

# Via Homebrew (macOS)
brew install pnpm

# Via standalone script
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

**PostgreSQL Database**
- **Recommended**: [Neon](https://neon.tech) serverless PostgreSQL (free tier available)
- **Alternative**: Local PostgreSQL 14+ installation
- **Why Neon**: Serverless, auto-scaling, built-in connection pooling

### Required Accounts

1. **GitHub Account**
   - For repository access and version control
   - Set up SSH keys for seamless authentication

2. **Vercel Account** (for deployment)
   - Sign up at [vercel.com](https://vercel.com)
   - Connect your GitHub account

3. **Neon Database Account**
   - Sign up at [neon.tech](https://neon.tech)
   - Create a project and database

4. **AI API Keys** (at least one required)
   - **Google Gemini**: [Get API key](https://makersuite.google.com/app/apikey)
   - **OpenAI**: [Get API key](https://platform.openai.com/api-keys)
   - **Anthropic**: [Get API key](https://console.anthropic.com/)

5. **Browserbase Account** (for browser automation)
   - Sign up at [browserbase.com](https://www.browserbase.com/)
   - Create a project and get API credentials

### Optional but Recommended

- **Git** (for version control)
- **Visual Studio Code** (recommended IDE)
  - Install extensions: ESLint, Prettier, Tailwind CSS IntelliSense
- **Redis** (for local caching - optional, can use remote)
- **Stripe Account** (for payment integration testing)

---

## Initial Setup

### 1. Clone the Repository

```bash
# Using HTTPS
git clone https://github.com/Julianb233/ghl-agency-ai.git
cd ghl-agency-ai

# Using SSH (recommended)
git clone git@github.com:Julianb233/ghl-agency-ai.git
cd ghl-agency-ai
```

### 2. Install Dependencies

The project uses pnpm for dependency management and includes workspace configuration.

```bash
# Install all dependencies
pnpm install

# This will:
# - Install production dependencies
# - Install development dependencies
# - Run postinstall script (stub pino-pretty)
# - Set up git hooks (if configured)
```

**Expected output:**
```
Packages: +XXX
Progress: resolving XXX, reused XXX, downloaded XXX, added XXX, done
```

**Installation time**: ~2-5 minutes depending on your internet speed

### 3. Verify Installation

```bash
# Check Node.js version
node --version
# Should output: v20.x.x

# Check pnpm version
pnpm --version
# Should output: 10.4.1 or higher

# Verify dependencies
pnpm list --depth=0
# Should list all top-level packages
```

---

## Environment Configuration

### 1. Create Environment File

```bash
# Copy the example environment file
cp .env.example .env
```

### 2. Configure Required Variables

Open `.env` in your editor and configure the following **required** variables:

#### Database Configuration
```env
# Neon PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# Format: postgresql://[user]:[password]@[host]/[database]?[options]
```

**Getting your Neon connection string:**
1. Log into [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to "Connection Details"
4. Copy the "Connection string" (select Node.js/Drizzle)
5. Paste into your `.env` file

#### Authentication
```env
# Generate a secure random string for JWT
# Use: openssl rand -hex 32
JWT_SECRET=your-secure-random-string-here
```

#### AI Model Configuration
```env
# Choose your primary AI model
# Required for agent intelligence
GEMINI_API_KEY=your-gemini-api-key
# Or
OPENAI_API_KEY=your-openai-api-key
# Or
ANTHROPIC_API_KEY=your-anthropic-api-key

# Model selection for Stagehand (browser automation)
STAGEHAND_MODEL=google/gemini-2.0-flash
# Options: google/gemini-2.0-flash, openai/gpt-4o, anthropic/claude-3-sonnet

# Fallback AI model
AI_MODEL=google/gemini-2.0-flash
```

#### Browser Automation (Browserbase)
```env
BROWSERBASE_API_KEY=your-browserbase-api-key
BROWSERBASE_PROJECT_ID=your-project-id
BROWSERBASE_REGION=us-west-2

# Required for Vercel deployment
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
```

### 3. Optional Configuration

#### Redis Cache (Recommended for Production)
```env
# Local Redis
REDIS_URL=redis://localhost:6379

# Or remote Redis (Upstash, Redis Cloud, etc.)
REDIS_URL=redis://username:password@host:port
```

#### Stripe Payment Integration
```env
# Get keys from https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your_test_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Application URL for redirects
APP_URL=http://localhost:3000
```

#### Email Integration (Gmail/Outlook OAuth)
```env
# Gmail OAuth
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REDIRECT_URI=http://localhost:3000/api/oauth/gmail/callback

# Outlook OAuth
OUTLOOK_CLIENT_ID=your_outlook_client_id
OUTLOOK_CLIENT_SECRET=your_outlook_client_secret
OUTLOOK_REDIRECT_URI=http://localhost:3000/api/oauth/outlook/callback

# Token encryption key (generate with: openssl rand -hex 32)
ENCRYPTION_KEY=your_64_character_hex_key
```

#### Error Tracking (Sentry)
```env
SENTRY_DSN=your_sentry_dsn_here
VITE_SENTRY_DSN=your_sentry_dsn_here
```

#### GoHighLevel Integration
```env
GHL_API_KEY=your-gohighlevel-api-key
GHL_LOCATION_ID=your-default-location-id
```

### 4. Environment Variables Quick Reference

| Variable | Required | Purpose | Default |
|----------|----------|---------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection | None |
| `JWT_SECRET` | Yes | Session authentication | None |
| `GEMINI_API_KEY` | Yes* | AI model access | None |
| `BROWSERBASE_API_KEY` | Yes | Browser automation | None |
| `BROWSERBASE_PROJECT_ID` | Yes | Browser automation | None |
| `REDIS_URL` | No | Caching layer | None |
| `PORT` | No | Server port | 3000 |
| `NODE_ENV` | No | Environment mode | development |

*At least one AI model API key required (Gemini, OpenAI, or Anthropic)

---

## Database Setup

### 1. Verify Database Connection

```bash
# Test connection (requires DATABASE_URL)
pnpm db:push
```

### 2. Generate Database Schema

The project uses Drizzle ORM with multiple schema files:

```bash
# Generate migrations from schema files
pnpm db:generate
```

**Schema files:**
- `/drizzle/schema.ts` - Core application tables
- `/drizzle/schema-scheduled-tasks.ts` - Task scheduler
- `/drizzle/schema-rag.ts` - RAG system for documentation
- `/drizzle/schema-webhooks.ts` - Webhook management
- `/drizzle/schema-agent.ts` - Agent and execution data
- `/drizzle/relations.ts` - Table relationships

### 3. Push Schema to Database

```bash
# Push schema directly to database (dev environment)
pnpm db:push

# This will:
# - Create all tables
# - Set up indexes
# - Configure constraints
# - Apply any schema changes
```

### 4. Run Migrations (Production)

```bash
# Run migrations (recommended for production)
pnpm db:migrate
```

### Database Schema Overview

**Core Tables:**
- `users` - User accounts and authentication
- `sessions` - Active user sessions
- `tenants` - Multi-tenant organization data
- `browser_sessions` - Browserbase session tracking
- `task_executions` - Agent task execution logs
- `webhooks` - Webhook configurations
- `scheduled_tasks` - Cron job scheduling
- `audit_logs` - System audit trail

**View existing tables:**
```sql
-- Connect to your Neon database using psql or GUI tool
\dt
```

---

## Development Workflow

### Starting the Development Server

#### Standard Development Mode

```bash
# Start frontend + backend (default)
pnpm dev
```

**What happens:**
- Vite dev server starts on `http://localhost:3000`
- Express backend starts (embedded in same process)
- Hot Module Replacement (HMR) enabled for frontend
- tsx watch mode for backend auto-reload
- API available at `/api/trpc`

**Expected output:**
```
> NODE_ENV=development tsx watch server/_core/index.ts

Server starting...
Database connected
Server listening on http://localhost:3000
```

#### Development with Background Workers

```bash
# Start server + background job workers
pnpm dev:workers
```

Use this when testing:
- Scheduled tasks
- BullMQ job processing
- Background automation workflows
- Email processing queues

#### Production Simulation

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `pnpm dev` | Development server | Run app with HMR |
| `pnpm dev:workers` | Dev with workers | Include background jobs |
| `pnpm workers` | Workers only | Run job workers standalone |
| `pnpm build` | Build production | Compile frontend + backend |
| `pnpm start` | Production server | Run built application |
| `pnpm check` | TypeScript check | Validate types (no emit) |
| `pnpm test` | Run tests | Execute Vitest test suite |
| `pnpm test:e2e` | E2E tests | Run Playwright tests |
| `pnpm lint` | Lint code | Run ESLint checks |
| `pnpm format` | Format code | Run Prettier formatting |
| `pnpm db:push` | Push schema | Update database schema |
| `pnpm db:generate` | Generate migrations | Create migration files |
| `pnpm db:migrate` | Run migrations | Apply pending migrations |

### Development Server Features

**Hot Module Replacement (HMR)**
- Frontend changes auto-reload browser
- No manual refresh needed
- Preserves component state when possible

**Backend Auto-Reload**
- tsx watch mode monitors server files
- Automatic process restart on changes
- Preserves database connections

**Type Safety**
- tRPC provides end-to-end type safety
- Changes to API automatically update frontend types
- Real-time TypeScript error checking

---

## Project Structure

### Overview

```
ghl-agency-ai/
├── client/                 # React frontend application
├── server/                 # Express + tRPC backend
├── drizzle/                # Database schema and migrations
├── shared/                 # Shared types and utilities
├── docs/                   # Documentation
├── tests/                  # E2E and integration tests
├── n8n-workflows/          # Automation workflow definitions
└── scripts/                # Build and deployment scripts
```

### Frontend Structure (`/client`)

```
client/
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui base components
│   │   ├── browser/       # Browser automation UI
│   │   ├── dashboard/     # Dashboard components
│   │   ├── agents/        # Agent management UI
│   │   └── workflows/     # Workflow builder
│   ├── pages/             # Page-level components
│   │   ├── Dashboard.tsx
│   │   ├── AgentBoard.tsx
│   │   ├── Workflows.tsx
│   │   └── Settings.tsx
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── types/             # TypeScript type definitions
│   ├── stores/            # Zustand state management
│   ├── App.tsx            # Root application component
│   └── main.tsx           # Application entry point
└── public/                # Static assets
    ├── logo.png
    └── favicon.ico
```

**Key Frontend Technologies:**
- **React 19** - UI library with latest features
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **Wouter** - Lightweight routing
- **@tanstack/react-query** - Server state management
- **Zustand** - Client state management
- **React Hook Form** - Form handling with validation

### Backend Structure (`/server`)

```
server/
├── _core/                  # Framework and core services
│   ├── index.ts           # Server entry point
│   ├── trpc.ts            # tRPC configuration
│   ├── browserbase.ts     # Browser automation
│   ├── llm.ts             # AI model integration
│   ├── queue.ts           # BullMQ job queue
│   ├── sse-manager.ts     # Server-Sent Events
│   └── google-auth.ts     # OAuth implementation
├── api/                    # API route handlers
│   ├── rest/              # REST endpoints (legacy)
│   └── webhooks/          # Webhook handlers
├── routers.ts              # tRPC API router definitions
├── db.ts                   # Database queries (Drizzle)
├── services/               # Business logic
│   ├── browser/           # Browser session management
│   ├── agents/            # Agent orchestration
│   ├── webhooks/          # Webhook processing
│   └── notifications/     # Notification system
├── lib/                    # Utility functions
├── workers/                # Background job workers
│   └── index.ts           # Worker process entry
└── types/                  # Backend TypeScript types
```

**Key Backend Technologies:**
- **Express 4** - HTTP server framework
- **tRPC 11** - Type-safe API layer
- **Drizzle ORM** - Type-safe database ORM
- **BullMQ** - Redis-based job queue
- **Zod** - Runtime type validation
- **Pino** - High-performance logging

### Database Schema (`/drizzle`)

```
drizzle/
├── schema.ts                      # Core tables
├── schema-scheduled-tasks.ts      # Task scheduler tables
├── schema-rag.ts                  # RAG system tables
├── schema-webhooks.ts             # Webhook tables
├── schema-agent.ts                # Agent execution tables
├── relations.ts                   # Table relationships
├── 0001_*.sql                     # Migration files
└── meta/                          # Drizzle metadata
```

### Important Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `vite.config.ts` | Vite build configuration |
| `vitest.config.ts` | Test runner configuration |
| `drizzle.config.ts` | Database ORM configuration |
| `playwright.config.ts` | E2E test configuration |
| `.eslintrc.json` | Code linting rules |
| `.prettierrc` | Code formatting rules |
| `vercel.json` | Vercel deployment config |

---

## Common Development Tasks

### 1. Adding a New tRPC API Endpoint

**Step 1: Define the procedure in `/server/routers.ts`**

```typescript
import { z } from 'zod';
import { protectedProcedure, router } from './server/_core/trpc';

export const appRouter = router({
  // ... existing routers

  // Add your new router
  myFeature: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        // ctx.user available from authentication
        return db.query.items.findMany({
          where: eq(items.userId, ctx.user.id),
        });
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.insert(items).values({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.delete(items).where(
          and(
            eq(items.id, input.id),
            eq(items.userId, ctx.user.id)
          )
        );
      }),
  }),
});
```

**Step 2: Use in frontend**

```typescript
// In a React component
import { trpc } from '@/lib/trpc';

function MyFeatureList() {
  // Queries
  const { data, isLoading } = trpc.myFeature.list.useQuery();

  // Mutations
  const createMutation = trpc.myFeature.create.useMutation({
    onSuccess: () => {
      // Invalidate cache to refetch
      trpc.useContext().myFeature.list.invalidate();
    },
  });

  const handleCreate = (name: string) => {
    createMutation.mutate({ name });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
      <button onClick={() => handleCreate('New Item')}>
        Create
      </button>
    </div>
  );
}
```

### 2. Adding a New Frontend Page

**Step 1: Create page component in `/client/src/pages`**

```typescript
// client/src/pages/MyNewPage.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MyNewPage() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>My New Feature</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Feature content goes here</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 2: Add route in `/client/src/App.tsx`**

```typescript
import { Route, Switch } from 'wouter';
import MyNewPage from './pages/MyNewPage';

function App() {
  return (
    <Switch>
      {/* Existing routes */}
      <Route path="/my-new-page" component={MyNewPage} />
    </Switch>
  );
}
```

**Step 3: Add navigation link (if needed)**

```typescript
// In your navigation component
<Link href="/my-new-page">
  <a className="nav-link">My New Feature</a>
</Link>
```

### 3. Creating Database Migrations

**Step 1: Modify schema file**

```typescript
// drizzle/schema.ts
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const myNewTable = pgTable('my_new_table', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Step 2: Generate migration**

```bash
pnpm db:generate
```

This creates a new SQL file in `/drizzle` with your schema changes.

**Step 3: Apply migration**

```bash
# Development
pnpm db:push

# Production
pnpm db:migrate
```

### 4. Running Database Queries

**Using Drizzle ORM in server code:**

```typescript
import { db } from './db';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

// Select query
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
});

// Insert
const newUser = await db.insert(users).values({
  email: 'user@example.com',
  name: 'John Doe',
}).returning();

// Update
await db.update(users)
  .set({ name: 'Jane Doe' })
  .where(eq(users.id, userId));

// Delete
await db.delete(users)
  .where(eq(users.id, userId));
```

### 5. Adding UI Components

The project uses shadcn/ui components. To add new components:

```bash
# Example: adding a new dialog component
npx shadcn-ui@latest add dialog

# This will:
# - Download the component source
# - Add to /client/src/components/ui
# - Configure for your project
```

**Using the component:**

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

function MyComponent() {
  return (
    <Dialog>
      <DialogTrigger>Open Dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogHeader>
        {/* Dialog content */}
      </DialogContent>
    </Dialog>
  );
}
```

---

## Testing

### Unit and Integration Tests (Vitest)

**Run all tests:**
```bash
pnpm test
```

**Run specific test file:**
```bash
pnpm test server/auth.logout.test.ts
```

**Run tests in watch mode:**
```bash
pnpm test --watch
```

**Run tests with coverage:**
```bash
pnpm test --coverage
```

### End-to-End Tests (Playwright)

**Run E2E tests:**
```bash
pnpm test:e2e
```

**Run smoke tests only:**
```bash
pnpm test:e2e:smoke
```

**Run with UI mode:**
```bash
pnpm test:e2e:ui
```

**View test report:**
```bash
pnpm test:e2e:report
```

### Writing Tests

**Example unit test (Vitest):**

```typescript
// server/myFeature.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from './myFeature';

describe('myFunction', () => {
  it('should return expected value', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });

  it('should handle edge cases', () => {
    expect(myFunction('')).toBe('');
    expect(myFunction(null)).toBeNull();
  });
});
```

**Example E2E test (Playwright):**

```typescript
// tests/e2e/myFeature.spec.ts
import { test, expect } from '@playwright/test';

test('user can create new item', async ({ page }) => {
  await page.goto('http://localhost:3000/my-feature');

  await page.fill('[name="itemName"]', 'Test Item');
  await page.click('button[type="submit"]');

  await expect(page.locator('.item-list')).toContainText('Test Item');
});
```

### Test Configuration

Tests are configured in `vitest.config.ts`:
- Server tests use Node environment
- Client tests use jsdom environment
- Automatic environment detection based on file path

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Database connection failed"

**Symptoms:**
```
Error: Database connection failed
connect ECONNREFUSED
```

**Solutions:**
1. Verify `DATABASE_URL` in `.env`
2. Check Neon database is active (not paused)
3. Ensure connection string includes `?sslmode=require`
4. Test connection:
   ```bash
   # Using psql
   psql "postgresql://user:pass@host/db?sslmode=require"
   ```

#### Issue: "Port 3000 already in use"

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 pnpm dev
```

#### Issue: "Module not found" errors

**Symptoms:**
```
Error: Cannot find module '@/components/ui/button'
```

**Solutions:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Clear Vite cache
rm -rf node_modules/.vite
```

#### Issue: TypeScript errors after updating dependencies

**Solutions:**
```bash
# Regenerate types
pnpm check

# Clear TypeScript cache
rm -rf node_modules/.cache

# Restart TypeScript server in VS Code
# CMD+Shift+P -> "TypeScript: Restart TS Server"
```

#### Issue: Build fails with memory errors

**Symptoms:**
```
FATAL ERROR: Reached heap limit
```

**Solutions:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

#### Issue: Playwright browser download fails

**Note:** This is expected in production (Vercel). For local development:

```bash
# Install Playwright browsers
npx playwright install

# Or specific browser
npx playwright install chromium
```

For Vercel deployment, ensure:
```env
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
```

#### Issue: Environment variables not loading

**Solutions:**
1. Restart dev server after changing `.env`
2. Ensure no trailing spaces in `.env` file
3. Check variable naming (no `VITE_` prefix for server-side vars)
4. For client-side access, use `VITE_` prefix

#### Issue: Hot reload not working

**Solutions:**
```bash
# Check file watcher limits (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Restart dev server
pnpm dev
```

### Getting Help

If you encounter issues not covered here:

1. Check the [documentation](/docs)
2. Search [GitHub Issues](https://github.com/Julianb233/ghl-agency-ai/issues)
3. Review error logs in `/logs` directory
4. Enable debug logging:
   ```env
   LOG_LEVEL=debug
   ```

---

## Additional Resources

### Documentation

- [System Architecture](./ARCHITECTURE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [API Reference](./TRPC_ENDPOINTS_REFERENCE.md)
- [Deployment Guide](./7_DAY_LAUNCH_PLAYBOOK.md)
- [Agent Permissions](./PERMISSIONS_QUICK_REFERENCE.md)

### External Resources

- [React Documentation](https://react.dev)
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Vercel Deployment](https://vercel.com/docs)
- [Neon Database](https://neon.tech/docs)

### Development Tools

- **VS Code Extensions:**
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features
  - Playwright Test for VSCode

- **Browser Extensions:**
  - React Developer Tools
  - Redux DevTools (for debugging Zustand)

### Quick Commands Reference

```bash
# Development
pnpm dev                    # Start dev server
pnpm dev:workers           # Start with background workers
pnpm check                 # Type check without build

# Building
pnpm build                 # Production build
pnpm start                 # Run production build

# Database
pnpm db:push               # Push schema to database
pnpm db:generate           # Generate migration files
pnpm db:migrate            # Run pending migrations

# Testing
pnpm test                  # Run unit tests
pnpm test:e2e             # Run E2E tests
pnpm test:e2e:ui          # E2E with UI mode

# Code Quality
pnpm lint                  # Run ESLint
pnpm format                # Run Prettier

# Deployment
pnpm deploy:check          # Verify deployment config
```

---

## Next Steps

After completing this setup:

1. **Read the Architecture Guide**: Understand system design in [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Review Database Schema**: Familiarize yourself with data models in [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
3. **Explore API Endpoints**: Learn available APIs in [TRPC_ENDPOINTS_REFERENCE.md](./TRPC_ENDPOINTS_REFERENCE.md)
4. **Try Example Workflows**: Test pre-built automation in `/n8n-workflows`
5. **Build a Feature**: Follow the common tasks section to add your first feature

---

**Welcome to GHL Agency AI development!** If you have questions or need assistance, don't hesitate to reach out to the team or consult the documentation.
