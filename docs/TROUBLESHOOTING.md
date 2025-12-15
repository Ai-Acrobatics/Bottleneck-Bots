# GHL Agency AI - Troubleshooting Guide

**Last Updated**: 2025-12-15

This comprehensive troubleshooting guide covers common issues encountered during development, deployment, and runtime of the GHL Agency AI platform. Each issue includes symptoms, root causes, solutions, and prevention strategies.

---

## Table of Contents

1. [Development Issues](#development-issues)
2. [Runtime Issues](#runtime-issues)
3. [Browser Automation Issues](#browser-automation-issues)
4. [Agent Execution Issues](#agent-execution-issues)
5. [Deployment Issues](#deployment-issues)
6. [Performance Issues](#performance-issues)
7. [Database Issues](#database-issues)
8. [Authentication Issues](#authentication-issues)

---

## Development Issues

### 1.1 TypeScript Compilation Errors

#### Issue: "Cannot find module '@shared/types'"

**Symptoms:**
```
error TS2307: Cannot find module '@shared/types' or its corresponding type declarations.
```

**Cause:**
- Path mapping in `tsconfig.json` not properly configured
- TypeScript compiler not resolving module paths correctly

**Solution:**
```bash
# 1. Verify tsconfig.json has correct paths
cat tsconfig.json | grep -A 5 "paths"

# 2. Clear TypeScript cache
rm -rf node_modules/.cache
rm -rf dist/

# 3. Restart TypeScript server (in VS Code: Cmd+Shift+P -> "TypeScript: Restart TS Server")

# 4. Rebuild
pnpm build
```

**Prevention:**
- Always use path aliases defined in `tsconfig.json`
- Use `@/` for client files, `@shared/` for shared files
- Run `pnpm check` before committing

---

#### Issue: "Type 'X' is not assignable to type 'Y'"

**Symptoms:**
```
error TS2322: Type 'string | undefined' is not assignable to type 'string'.
```

**Cause:**
- Strict null checks enabled (`strictNullChecks: true`)
- Not handling undefined/null cases properly

**Solution:**
```typescript
// ❌ Bad
const apiKey = process.env.BROWSERBASE_API_KEY;
someFunction(apiKey); // Error: might be undefined

// ✅ Good - Option 1: Non-null assertion (when you're sure it exists)
const apiKey = process.env.BROWSERBASE_API_KEY!;

// ✅ Good - Option 2: Default value
const apiKey = process.env.BROWSERBASE_API_KEY || 'default';

// ✅ Good - Option 3: Explicit check
const apiKey = process.env.BROWSERBASE_API_KEY;
if (!apiKey) {
  throw new Error('BROWSERBASE_API_KEY is required');
}
someFunction(apiKey); // Now TypeScript knows it's defined
```

**Prevention:**
- Always validate environment variables at startup
- Use type guards for optional values
- Leverage TypeScript's strict mode for early error detection

---

#### Issue: Module resolution errors after adding new dependencies

**Symptoms:**
```
Module not found: Can't resolve '@browserbasehq/stagehand'
```

**Cause:**
- Package not installed
- Package in devDependencies instead of dependencies
- Node modules cache corrupted

**Solution:**
```bash
# 1. Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 2. Verify package is in dependencies (not devDependencies)
cat package.json | grep -A 2 "dependencies"

# 3. Move package if needed
pnpm remove @browserbasehq/stagehand
pnpm add @browserbasehq/stagehand

# 4. Rebuild
pnpm build
```

**Prevention:**
- Use `pnpm add` (not `pnpm add -D`) for runtime dependencies
- Commit `pnpm-lock.yaml` to version control
- Run `pnpm install` after pulling changes

---

### 1.2 Database Connection Issues (Development)

#### Issue: "DATABASE_URL not set, database operations will fail"

**Symptoms:**
```
[Database] DATABASE_URL not set, database operations will fail
```

**Cause:**
- `.env` file missing or not loaded
- Environment variable not set

**Solution:**
```bash
# 1. Create .env file from example
cp .env.example .env

# 2. Add your database URL
echo "DATABASE_URL=postgresql://user:password@localhost:5432/ghl_agency_ai" >> .env

# 3. For Neon (recommended):
# Get URL from: https://console.neon.tech
echo "DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require" >> .env

# 4. Test connection
pnpm tsx scripts/test-db.ts
```

**Prevention:**
- Always create `.env` file when cloning repo
- Add `.env` to `.gitignore` (already done)
- Document required environment variables in README

---

#### Issue: "Connection test failed: SSL/TLS required"

**Symptoms:**
```
[Database] Connection failed!
Error: The server does not support SSL connections
```

**Cause:**
- PostgreSQL server requires SSL but client not configured
- Common with Neon, Supabase, Railway databases

**Solution:**
Update connection config in `/root/github-repos/active/ghl-agency-ai/server/db.ts`:

```typescript
// Already configured correctly:
_pool = new Pool({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false,  // Allows self-signed certificates
  },
});
```

**Prevention:**
- Use cloud PostgreSQL providers that include SSL by default
- Always test database connection after changing providers

---

### 1.3 Build Failures

#### Issue: "Build failed with exit code 1"

**Symptoms:**
```
vite build failed
error during build:
RollupError: Could not resolve entry module
```

**Cause:**
- Entry point file missing or moved
- Vite configuration incorrect
- Import path errors

**Solution:**
```bash
# 1. Check entry point exists
ls -la client/src/main.tsx

# 2. Check vite.config.ts
cat vite.config.ts

# 3. Clear build cache
rm -rf dist/
rm -rf client/dist/
rm -rf .vite/

# 4. Rebuild
pnpm build
```

**Prevention:**
- Don't move or rename entry files without updating config
- Run `pnpm build` locally before deploying
- Use CI/CD to catch build errors early

---

### 1.4 Test Failures

#### Issue: Tests fail with "Cannot find module"

**Symptoms:**
```
Error: Cannot find module '../server/db'
```

**Cause:**
- Test environment not configured properly
- Module resolution different in test context

**Solution:**
```bash
# 1. Check vitest config
cat vitest.config.ts

# 2. Ensure test files use correct imports
# Use absolute imports with path aliases

# 3. Run tests with debug
pnpm test --reporter=verbose

# 4. If specific test fails, run in isolation
pnpm test path/to/test.ts
```

**Prevention:**
- Use path aliases (`@/`, `@shared/`) consistently
- Mock external dependencies in tests
- Isolate test database from development database

---

### 1.5 Environment Variable Issues

#### Issue: Environment variables not loading in development

**Symptoms:**
```
[BrowserbaseSDK] BROWSERBASE_API_KEY not found in environment variables
```

**Cause:**
- `.env` file not in project root
- Using wrong environment variable prefix
- Not restarting dev server after changes

**Solution:**
```bash
# 1. Verify .env file location and contents
cat .env | grep BROWSERBASE

# 2. For client-side variables, use VITE_ prefix
# ❌ Wrong
GOOGLE_CLIENT_ID=xxx

# ✅ Correct
VITE_GOOGLE_CLIENT_ID=xxx

# 3. Restart dev server
pnpm dev

# 4. Verify loading with debug
node -e "require('dotenv').config(); console.log(process.env.BROWSERBASE_API_KEY)"
```

**Prevention:**
- Use `VITE_` prefix for client-side variables
- No prefix needed for server-side variables
- Always restart dev server after `.env` changes
- Document all required variables in `.env.example`

---

## Runtime Issues

### 2.1 Server Startup Errors

#### Issue: "Port 3000 already in use"

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Cause:**
- Another process using port 3000
- Previous server instance not killed

**Solution:**
```bash
# Option 1: Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Option 2: Use different port
PORT=3001 pnpm dev

# Option 3: Find and kill node processes
pkill -f "node.*server"
```

**Prevention:**
- Use process manager (PM2) in production
- Gracefully shutdown servers (Ctrl+C, not kill -9)
- Auto-find available port (already implemented in code)

---

#### Issue: "Failed to initialize Browserbase SDK"

**Symptoms:**
```
[BrowserbaseSDK] Failed to initialize: INIT_ERROR
```

**Cause:**
- Invalid API key format
- Missing BROWSERBASE_API_KEY
- Network connectivity issues

**Solution:**
```bash
# 1. Verify API key format (should start with 'bb_')
echo $BROWSERBASE_API_KEY

# 2. Get new API key from Browserbase dashboard
# https://www.browserbase.com/dashboard/settings

# 3. Test API key
curl -H "Authorization: Bearer $BROWSERBASE_API_KEY" \
  https://api.browserbase.com/v1/projects

# 4. Update .env
echo "BROWSERBASE_API_KEY=bb_live_your_key_here" >> .env

# 5. Restart server
```

**Prevention:**
- Store API keys in environment variables, never in code
- Use `.env.example` template for new developers
- Rotate API keys regularly

---

### 2.2 API Errors and Debugging

#### Issue: "TRPC ERROR: UNAUTHORIZED"

**Symptoms:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You must be logged in to access this resource"
  }
}
```

**Cause:**
- Missing or invalid JWT token
- Session expired
- Cookie not sent with request

**Solution:**
```bash
# 1. Check if user is logged in
# Open browser DevTools -> Application -> Cookies
# Look for auth cookie

# 2. Re-authenticate
# Navigate to /login

# 3. Check cookie settings in server/_core/context.ts
# Ensure cookie domain and path match your deployment

# 4. For API testing, include auth header
curl -X POST https://your-domain.com/api/trpc/browser.createSession \
  -H "Cookie: auth_token=your_token_here" \
  -H "Content-Type: application/json" \
  -d '{"geolocation": {}}'
```

**Prevention:**
- Implement token refresh logic
- Set appropriate cookie expiration times
- Use secure cookies in production (`sameSite: 'strict'`)

---

#### Issue: "TRPCClientError: Failed to fetch"

**Symptoms:**
```
TRPCClientError: Failed to fetch
  at <anonymous>
```

**Cause:**
- CORS issues
- Server not running
- Network connectivity problems
- Incorrect API endpoint URL

**Solution:**
```typescript
// 1. Check server is running
// Visit http://localhost:3000/health

// 2. Verify TRPC endpoint in client
// File: client/src/lib/trpc.ts
const trpc = createTRPCClient({
  url: '/api/trpc', // Should be relative path, not absolute
});

// 3. Check CORS headers (if using different domains)
// File: server/_core/index.ts
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});
```

**Prevention:**
- Use relative URLs for same-origin requests
- Configure CORS properly for cross-origin requests
- Test API endpoints with curl before frontend integration

---

#### Issue: API returns 500 Internal Server Error

**Symptoms:**
```json
{
  "error": "Internal Server Error",
  "message": "An error occurred"
}
```

**Cause:**
- Unhandled exception in API handler
- Database query error
- Missing required parameters

**Solution:**
```bash
# 1. Check server logs
tail -f logs/app.log

# 2. Enable debug mode (development only)
NODE_ENV=development DEBUG=* pnpm dev

# 3. Check Sentry dashboard for error details
# https://sentry.io/organizations/your-org/issues/

# 4. Add try-catch to handler
```

```typescript
// Example: Adding error handling
export const myProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    try {
      const result = await someOperation(input.id);
      return result;
    } catch (error) {
      console.error('Operation failed:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
```

**Prevention:**
- Wrap async operations in try-catch
- Use Sentry for error tracking
- Log errors with context (user ID, request ID)
- Validate inputs with Zod schemas

---

### 2.3 Authentication Failures

#### Issue: "Login failed: Invalid credentials"

**Symptoms:**
- User enters correct email/password but login fails
- Error message: "Invalid credentials"

**Cause:**
- Password hash mismatch
- User not found in database
- Database connection issue

**Solution:**
```bash
# 1. Verify user exists
psql $DATABASE_URL -c "SELECT email, \"loginMethod\" FROM users WHERE email = 'user@example.com';"

# 2. Check password hash (server/_core/email-auth.ts)
# Ensure bcrypt.compare is used correctly

# 3. Reset user password
psql $DATABASE_URL -c "
  UPDATE users
  SET password = '$2a$10$...' -- Generate new hash
  WHERE email = 'user@example.com';
"

# 4. Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "newpassword"}'
```

**Prevention:**
- Use bcrypt with salt rounds >= 10
- Store hashed passwords, never plaintext
- Implement account lockout after failed attempts
- Add logging for authentication attempts

---

### 2.4 Rate Limiting Issues

#### Issue: "Too many requests, please try again later"

**Symptoms:**
```json
{
  "error": "TOO_MANY_REQUESTS",
  "message": "Rate limit exceeded. Try again in 60 seconds."
}
```

**Cause:**
- Hitting rate limits (100 req/15min default)
- Multiple clients from same IP
- Aggressive polling/refresh

**Solution:**
```bash
# 1. Check rate limit config
# File: server/api/rest/middleware/rateLimitMiddleware.ts

# 2. Temporarily increase limit for testing
# .env file
RATE_LIMIT_MAX=500

# 3. Clear rate limit cache (Redis)
redis-cli FLUSHDB

# 4. Implement backoff on client
```

```typescript
// Client-side retry with exponential backoff
async function apiCallWithRetry(fn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.code === 'TOO_MANY_REQUESTS' && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

**Prevention:**
- Implement client-side caching
- Use polling intervals >= 5 seconds
- Add rate limit warnings in UI
- Monitor rate limit metrics

---

## Browser Automation Issues

### 3.1 Browserbase Connection Issues

#### Issue: "Failed to create Browserbase session: NOT_INITIALIZED"

**Symptoms:**
```
BrowserbaseSDKError: Browserbase SDK is not initialized.
Check BROWSERBASE_API_KEY environment variable.
```

**Cause:**
- Missing BROWSERBASE_API_KEY
- Invalid API key
- SDK initialization failed

**Solution:**
```bash
# 1. Verify environment variable
echo "BROWSERBASE_API_KEY: ${BROWSERBASE_API_KEY:0:10}..."

# 2. Get API key from Browserbase
# https://www.browserbase.com/dashboard/settings

# 3. Update .env
BROWSERBASE_API_KEY=bb_live_xxxxxxxxxxxxxxxxxx
BROWSERBASE_PROJECT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# 4. Restart server
pnpm dev

# 5. Test SDK initialization
pnpm tsx -e "
  process.env.BROWSERBASE_API_KEY='your_key';
  import('./server/_core/browserbaseSDK.js').then(m => {
    console.log('SDK loaded:', !!m.browserbaseSDK);
  });
"
```

**Prevention:**
- Set environment variables in deployment platform
- Use secrets management for production (Vercel, AWS Secrets Manager)
- Test SDK initialization on startup

---

#### Issue: "Session creation timeout"

**Symptoms:**
```
Error: Session creation timed out after 60000ms
```

**Cause:**
- Browserbase API slow to respond
- Network latency
- High load on Browserbase infrastructure

**Solution:**
```typescript
// Increase timeout in createSession call
const session = await browserbaseSDK.createSession({
  timeout: 120000, // 2 minutes instead of default 60s
  keepAlive: true,
});

// Or use retry logic (already implemented)
// File: server/_core/browserbaseSDK.ts uses withRetry()
```

**Prevention:**
- Set realistic timeouts (90-120s)
- Implement retry logic with exponential backoff
- Monitor Browserbase status page
- Use circuit breaker pattern (already implemented)

---

### 3.2 Session Timeout Issues

#### Issue: "Session expired: Session not found"

**Symptoms:**
```
Error: Session xxx not found or has expired
```

**Cause:**
- Session exceeded timeout duration (default 1 hour)
- Session manually closed
- Browserbase infrastructure issue

**Solution:**
```bash
# 1. Check session status
curl -H "Authorization: Bearer $BROWSERBASE_API_KEY" \
  https://api.browserbase.com/v1/sessions/$SESSION_ID

# 2. Create new session
# Can't recover expired sessions, must create new one

# 3. Increase session timeout
```

```typescript
const session = await browserbaseSDK.createSession({
  timeout: 7200, // 2 hours (max allowed)
  keepAlive: true, // Prevent idle timeout
});
```

**Prevention:**
- Set `keepAlive: true` for long-running sessions
- Implement session heartbeat/ping
- Clean up sessions after completion
- Monitor session duration metrics

---

### 3.3 Element Selector Failures

#### Issue: "Element not found: selector 'button.submit' not found on page"

**Symptoms:**
```
Error: Could not find element matching selector: button.submit
```

**Cause:**
- Incorrect selector
- Element not rendered yet (dynamic content)
- Element inside iframe/shadow DOM
- Page not fully loaded

**Solution:**
```typescript
// Option 1: Use AI instruction instead of selector
await stagehand.act({
  action: 'Click the submit button', // Natural language
  // No selector needed
});

// Option 2: Wait for element
await page.waitForSelector('button.submit', { timeout: 10000 });
await stagehand.act({
  action: 'click',
  selector: 'button.submit',
});

// Option 3: Use more specific selector
await stagehand.act({
  action: 'click',
  selector: 'form#login button[type="submit"]',
});

// Option 4: Enable self-healing
const stagehand = new Stagehand({
  selfHeal: true, // Adapts to page changes
});
```

**Prevention:**
- Use stable selectors (data-testid, aria-label)
- Add wait conditions before interactions
- Use AI instructions for resilient automation
- Enable self-healing mode for dynamic pages

---

### 3.4 Page Navigation Problems

#### Issue: "Navigation timeout: Page did not load within 30s"

**Symptoms:**
```
Error: Navigation timeout of 30000ms exceeded
```

**Cause:**
- Slow page load
- Network issues
- Page redirects
- JavaScript taking too long

**Solution:**
```typescript
// Option 1: Increase timeout
await page.goto('https://example.com', {
  timeout: 60000, // 60 seconds
  waitUntil: 'networkidle', // Wait for network to be idle
});

// Option 2: Use different waitUntil strategy
await page.goto('https://example.com', {
  waitUntil: 'domcontentloaded', // Don't wait for all resources
});

// Option 3: Navigate and wait separately
await page.goto('https://example.com', { waitUntil: 'commit' });
await page.waitForLoadState('networkidle', { timeout: 30000 });
```

**Prevention:**
- Use appropriate `waitUntil` strategy:
  - `load` - full page load (default)
  - `domcontentloaded` - HTML parsed
  - `networkidle` - no network activity for 500ms
- Handle slow networks with longer timeouts
- Add loading indicators in UI

---

## Agent Execution Issues

### 4.1 Agent Startup Failures

#### Issue: "Failed to initialize Stagehand: Model API key not configured"

**Symptoms:**
```
Error: No AI model API key configured.
Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY
```

**Cause:**
- Missing AI model API key
- Invalid key format
- Wrong model selected

**Solution:**
```bash
# 1. Choose and configure AI model

# Option A: Anthropic Claude (recommended)
echo "ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxx" >> .env

# Option B: OpenAI GPT-4
echo "OPENAI_API_KEY=sk-xxxxxxxxxx" >> .env

# Option C: Google Gemini (cheapest)
echo "GEMINI_API_KEY=AIzaSyxxxxxxxxxx" >> .env

# 2. Select model in config
echo "STAGEHAND_MODEL=anthropic/claude-sonnet-4-20250514" >> .env
# OR
echo "STAGEHAND_MODEL=openai/gpt-4o" >> .env
# OR
echo "STAGEHAND_MODEL=google/gemini-2.0-flash" >> .env

# 3. Restart server
pnpm dev
```

**Prevention:**
- Set at least one model API key
- Document which model to use in README
- Validate API keys on startup

---

### 4.2 Tool Execution Errors

#### Issue: "Tool execution failed: Permission denied"

**Symptoms:**
```
Error: Permission denied: Cannot access file /system/file.txt
```

**Cause:**
- Insufficient permissions
- Security sandbox restrictions
- File doesn't exist

**Solution:**
```typescript
// Check file exists before accessing
import fs from 'fs';

try {
  if (fs.existsSync('/path/to/file.txt')) {
    const content = fs.readFileSync('/path/to/file.txt', 'utf-8');
  } else {
    console.error('File not found');
  }
} catch (error) {
  console.error('Permission denied:', error);
}

// Use allowed directories only
const allowedPaths = [
  './stagehand-cache',
  './uploads',
  './temp',
];
```

**Prevention:**
- Validate file paths before access
- Use relative paths, not absolute
- Implement permission checks
- Sandbox file operations

---

### 4.3 Memory/Context Issues

#### Issue: "AI context window exceeded"

**Symptoms:**
```
Error: Token limit exceeded (max 128k tokens)
```

**Cause:**
- Too much context sent to AI
- Long conversation history
- Large page content

**Solution:**
```typescript
// Truncate conversation history
const MAX_MESSAGES = 20;
const recentMessages = messages.slice(-MAX_MESSAGES);

// Summarize page content
const pageText = await page.textContent('body');
const summary = pageText.slice(0, 10000); // First 10k chars

// Use streaming for long responses
const stream = await ai.chat({
  messages: recentMessages,
  stream: true,
});
```

**Prevention:**
- Limit conversation history (keep last 10-20 messages)
- Summarize page content before sending to AI
- Use models with larger context windows (Claude: 200k)
- Implement conversation summarization

---

## Deployment Issues

### 5.1 Vercel Deployment Failures

#### Issue: "Build failed: Command 'pnpm build' exited with 1"

**Symptoms:**
```
[Error] Build failed with exit code 1
```

**Cause:**
- TypeScript errors
- Missing dependencies
- Environment variables not set
- Build timeout

**Solution:**
```bash
# 1. Test build locally first
pnpm build

# 2. Check Vercel build logs
vercel logs

# 3. Add environment variables in Vercel dashboard
# Settings -> Environment Variables

# 4. Increase build timeout (if needed)
# vercel.json:
{
  "builds": [{
    "src": "package.json",
    "use": "@vercel/node",
    "config": { "maxDuration": 300 }
  }]
}

# 5. Redeploy
git push origin main
```

**Prevention:**
- Run `pnpm build` before pushing
- Set up CI/CD checks
- Keep build under 5 minutes
- Use build cache in Vercel

---

#### Issue: "Function invocation timeout (10s limit)"

**Symptoms:**
```
Error: Task timed out after 10.00 seconds
```

**Cause:**
- Vercel Hobby plan has 10s timeout
- Long-running operations
- Slow external API calls

**Solution:**
```bash
# Option 1: Upgrade to Vercel Pro (60s timeout)
# https://vercel.com/pricing

# Option 2: Move to background job
# Use webhook + async processing

# Option 3: Optimize code
```

```typescript
// Split long operations into chunks
async function processInChunks(items: any[]) {
  const CHUNK_SIZE = 10;
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    await processChunk(chunk);
    // Return response before timeout
    if (Date.now() - startTime > 8000) {
      return { status: 'partial', processed: i + CHUNK_SIZE };
    }
  }
}
```

**Prevention:**
- Keep serverless functions under 5s
- Use background jobs for long operations
- Implement pagination for large datasets
- Consider upgrading Vercel plan

---

### 5.2 Environment Variable Configuration

#### Issue: "Environment variable not found in production"

**Symptoms:**
```
[Production] BROWSERBASE_API_KEY not found
```

**Cause:**
- Variable not set in deployment platform
- Wrong variable name
- Not redeployed after adding variable

**Solution:**
```bash
# For Vercel:
# 1. Go to dashboard.vercel.com
# 2. Select project
# 3. Settings -> Environment Variables
# 4. Add variable for Production environment
# 5. Redeploy (or enable auto-redeploy)

# Using Vercel CLI:
vercel env add BROWSERBASE_API_KEY production
# Paste value when prompted

# Verify
vercel env ls
```

**Prevention:**
- Document all required variables in `.env.example`
- Use deployment checklist
- Enable auto-redeploy on env changes
- Test in staging before production

---

### 5.3 Database Migration Issues

#### Issue: "Table 'browser_sessions' does not exist"

**Symptoms:**
```sql
ERROR: relation "browser_sessions" does not exist
```

**Cause:**
- Database migrations not run
- Wrong database connected
- Schema out of sync

**Solution:**
```bash
# 1. Verify connected to correct database
echo $DATABASE_URL

# 2. Run migrations
pnpm db:push

# 3. Verify tables exist
psql $DATABASE_URL -c "\dt"

# 4. If tables missing, regenerate schema
pnpm db:generate
pnpm db:push

# 5. Redeploy
git push origin main
```

**Prevention:**
- Run migrations as part of deployment
- Use database migration tools (Drizzle Kit)
- Test migrations in staging first
- Backup database before migrations

---

## Performance Issues

### 6.1 Slow API Responses

#### Issue: "API responses taking > 10 seconds"

**Symptoms:**
- Long loading times
- Timeout errors
- Poor user experience

**Cause:**
- Unoptimized database queries
- N+1 query problem
- Large response payloads
- No caching

**Solution:**
```typescript
// 1. Add database indexes
// drizzle/schema.ts
export const browserSessions = pgTable("browser_sessions", {
  // ...
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  sessionIdIdx: uniqueIndex("session_id_idx").on(table.sessionId),
  statusIdx: index("status_idx").on(table.status),
}));

// 2. Use select() to limit columns
const sessions = await db
  .select({
    id: browserSessions.id,
    sessionId: browserSessions.sessionId,
    status: browserSessions.status,
    // Don't fetch metadata, recordingUrl, etc.
  })
  .from(browserSessions)
  .where(eq(browserSessions.userId, userId));

// 3. Implement caching
import { cacheService } from './cache.service';

const cached = await cacheService.get(`sessions:${userId}`);
if (cached) return cached;

const sessions = await fetchSessions(userId);
await cacheService.set(`sessions:${userId}`, sessions, 60); // 60s TTL
```

**Prevention:**
- Add indexes to frequently queried columns
- Use database query analysis tools
- Implement caching layer (Redis)
- Paginate large result sets
- Use `select()` to limit returned fields

---

### 6.2 High Memory Usage

#### Issue: "Server running out of memory (OOM)"

**Symptoms:**
```
<--- Last few GCs --->
[1234:0x5] JavaScript heap out of memory
```

**Cause:**
- Memory leaks
- Large file uploads
- Too many concurrent sessions
- Unbounded caching

**Solution:**
```bash
# 1. Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" pnpm start

# 2. Find memory leaks
npm install -g clinic
clinic doctor -- node dist/index.js

# 3. Limit concurrent operations
```

```typescript
// Implement connection pooling
const pool = new Pool({
  max: 10, // Max 10 concurrent connections
  idleTimeoutMillis: 30000,
});

// Clean up old sessions
async function cleanupSessions() {
  const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h ago
  await db.delete(browserSessions)
    .where(and(
      eq(browserSessions.status, 'completed'),
      lt(browserSessions.completedAt, threshold)
    ));
}

// Schedule cleanup
setInterval(cleanupSessions, 60 * 60 * 1000); // Every hour
```

**Prevention:**
- Implement resource cleanup (close connections, free memory)
- Use streaming for large files
- Set memory limits in production
- Monitor memory usage (PM2, DataDog)
- Schedule periodic cleanup jobs

---

### 6.3 Database Query Optimization

#### Issue: "Slow database queries (> 1 second)"

**Symptoms:**
```
[Query] SELECT * FROM browser_sessions ... (1234ms)
```

**Cause:**
- Missing indexes
- Full table scans
- Complex joins
- Large result sets

**Solution:**
```sql
-- 1. Analyze slow queries
EXPLAIN ANALYZE
SELECT * FROM browser_sessions
WHERE user_id = 123 AND status = 'active';

-- 2. Add indexes
CREATE INDEX idx_browser_sessions_user_status
ON browser_sessions(user_id, status);

-- 3. Optimize query
-- ❌ Bad: Fetches all columns
SELECT * FROM browser_sessions;

-- ✅ Good: Fetch only needed columns
SELECT id, session_id, status, created_at
FROM browser_sessions;

-- 4. Use pagination
SELECT id, session_id FROM browser_sessions
LIMIT 50 OFFSET 0;
```

```bash
# Push indexes to database
pnpm db:push

# Monitor query performance
psql $DATABASE_URL -c "
  SELECT query, calls, total_time, mean_time
  FROM pg_stat_statements
  ORDER BY mean_time DESC
  LIMIT 10;
"
```

**Prevention:**
- Add indexes to foreign keys and WHERE clauses
- Use EXPLAIN ANALYZE for complex queries
- Implement query result caching
- Monitor slow query logs
- Use database query profiling tools

---

## Database Issues

### 7.1 Connection Pool Exhaustion

#### Issue: "Error: Connection pool exhausted"

**Symptoms:**
```
Error: Timeout acquiring client from pool
```

**Cause:**
- Too many concurrent connections
- Connections not released
- Pool size too small

**Solution:**
```typescript
// File: server/db.ts
_pool = new Pool({
  connectionString: dbUrl,
  max: 20, // Increase from 10
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Always release connections
const client = await pool.connect();
try {
  const result = await client.query('SELECT * FROM users');
  return result.rows;
} finally {
  client.release(); // CRITICAL: Always release
}
```

**Prevention:**
- Use connection pooling (already implemented)
- Always release connections in `finally` block
- Use ORM (Drizzle) instead of raw queries
- Monitor active connections

---

### 7.2 Migration Conflicts

#### Issue: "Migration failed: Column already exists"

**Symptoms:**
```
ERROR: column "new_column" of relation "users" already exists
```

**Cause:**
- Migration run multiple times
- Schema out of sync with database

**Solution:**
```bash
# 1. Check migration history
psql $DATABASE_URL -c "SELECT * FROM drizzle_migrations;"

# 2. Manually fix schema
psql $DATABASE_URL -c "
  ALTER TABLE users DROP COLUMN IF EXISTS new_column;
"

# 3. Regenerate migrations
rm -rf drizzle/migrations/*
pnpm db:generate

# 4. Re-run migrations
pnpm db:push
```

**Prevention:**
- Use migration tools (Drizzle Kit) consistently
- Test migrations in staging first
- Never manually edit production schema
- Keep migration history in version control

---

## Authentication Issues

### 8.1 OAuth Callback Failures

#### Issue: "OAuth callback error: Invalid state parameter"

**Symptoms:**
```
Error: State parameter mismatch
```

**Cause:**
- CSRF protection failing
- Cookie not persisted
- Session expired during OAuth flow

**Solution:**
```typescript
// File: server/_core/oauth.ts

// Ensure state is stored in session
app.get('/oauth/google', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state; // Store in session

  const authUrl = buildAuthUrl({ state });
  res.redirect(authUrl);
});

// Verify state on callback
app.get('/oauth/google/callback', (req, res) => {
  const { state } = req.query;
  if (state !== req.session.oauthState) {
    throw new Error('Invalid state parameter');
  }
  // Continue OAuth flow...
});
```

**Prevention:**
- Use secure session storage
- Set proper cookie attributes (httpOnly, secure, sameSite)
- Implement CSRF protection
- Handle OAuth errors gracefully

---

### 8.2 Session Expiration

#### Issue: "Session expired, please login again"

**Symptoms:**
- Users logged out unexpectedly
- "Session not found" errors

**Cause:**
- Short session expiration time
- Session store cleared
- Cookie not persisted

**Solution:**
```typescript
// Increase session duration
// File: server/_core/context.ts

const sessionExpiry = new Date();
sessionExpiry.setDate(sessionExpiry.getDate() + 30); // 30 days

await db.insert(sessions).values({
  id: sessionId,
  userId: user.id,
  expiresAt: sessionExpiry,
});

// Set cookie with same expiry
res.cookie('session_id', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
});
```

**Prevention:**
- Set reasonable session expiration (7-30 days)
- Implement "Remember Me" option
- Refresh sessions on activity
- Clear expired sessions periodically

---

## General Debugging Tips

### Enable Debug Logging

```bash
# Development
DEBUG=* pnpm dev

# Production (specific namespaces)
DEBUG=browserbase:*,stagehand:* pnpm start

# Database queries
DEBUG=drizzle:* pnpm dev
```

### Check Application Health

```bash
# Health endpoint
curl http://localhost:3000/health

# Database connectivity
psql $DATABASE_URL -c "SELECT 1;"

# Redis connectivity
redis-cli ping
```

### Monitor Logs

```bash
# Vercel
vercel logs --follow

# PM2
pm2 logs

# System
journalctl -u ghl-agency-ai -f
```

---

## Getting Help

If you're still experiencing issues:

1. **Check Documentation**
   - `/docs` folder in repository
   - README.md for setup instructions

2. **Search GitHub Issues**
   - https://github.com/Julianb233/ghl-agency-ai/issues

3. **Review Error Logs**
   - Server logs
   - Browser console (F12 DevTools)
   - Sentry dashboard

4. **Contact Support**
   - Email: support@ghl-agent-ai.com
   - GitHub: Open new issue with error details

---

## Troubleshooting Checklist

Before reporting an issue, verify:

- [ ] All environment variables set correctly
- [ ] Database connection working (`psql $DATABASE_URL`)
- [ ] Dependencies installed (`pnpm install`)
- [ ] Build succeeds locally (`pnpm build`)
- [ ] Tests pass (`pnpm test`)
- [ ] Server starts without errors (`pnpm dev`)
- [ ] Browser console has no errors (F12)
- [ ] Checked recent changes in git history
- [ ] Read error message completely
- [ ] Searched this document for similar issue

---

**Last Updated**: 2025-12-15
**Version**: 1.0.0
