# Production Monitoring Setup Guide

**Project:** bottleneck-bots
**Last Updated:** 2026-01-02
**Otto-Observer Analysis**

---

## 📊 Executive Summary

This is a **SPA (Vite + React) + Express API** application for browser automation, AI agent workflows, and task execution. The architecture includes:

- **Frontend:** Vite React SPA with tRPC client
- **Backend:** Express server with tRPC, BullMQ workers, Drizzle ORM
- **Key Features:** Browser automation (Browserbase/Stagehand), AI workflows, task scheduling
- **Deployment:** Vercel (serverless functions + static hosting)

**Current State:**
- ✅ Sentry configured (client + server)
- ✅ Vercel Analytics integrated
- ⚠️ Server-side monitoring incomplete
- ❌ No worker queue monitoring
- ❌ No browser session tracking
- ❌ No cost monitoring for Browserbase

**Critical Gaps:**
1. **Worker Monitoring:** BullMQ jobs have no observability
2. **Browser Sessions:** Browserbase sessions not tracked
3. **AI Cost Tracking:** No monitoring of Gemini/OpenAI/Anthropic usage
4. **Database Performance:** PostgreSQL query monitoring needed

---

## 🎯 Monitoring Strategy

### 1. Error Tracking (Sentry) - **Needs Enhancement**

**Current Configuration:**

```typescript
// Client: @sentry/react in Vite app
// Server: @sentry/node in Express

// CURRENT ISSUE: No worker monitoring
```

**Enhanced Server Configuration:**

```typescript
// server/_core/sentry.ts
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export function initializeSentry() {
  if (!process.env.SENTRY_DSN) {
    console.warn('Sentry DSN not configured - monitoring disabled');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: 0.1,

    integrations: [
      // Express integration
      Sentry.expressIntegration(),

      // Node profiling
      nodeProfilingIntegration(),

      // PostgreSQL integration
      Sentry.postgresIntegration(),

      // Redis integration (for BullMQ)
      Sentry.redisIntegration(),
    ],

    beforeSend(event, hint) {
      // Skip in development
      if (process.env.NODE_ENV === 'development') {
        return null;
      }

      // Filter noisy errors
      const error = hint.originalException;

      // Skip known browser automation flakiness
      if (error?.message?.includes('Target closed')) {
        return null;
      }

      // Skip rate limit errors (tracked separately)
      if (error?.message?.includes('429')) {
        // Track as metric instead
        Sentry.metrics.increment('rate_limit.hit');
        return null;
      }

      return event;
    },
  });
}

// Express middleware
export function setupSentryMiddleware(app: Express) {
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  // Error handler (must be last)
  app.use(Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Only send 5xx errors
      return error.statusCode >= 500;
    },
  }));
}
```

**Worker Monitoring:**

```typescript
// server/workers/sentry-worker.ts
import * as Sentry from '@sentry/node';
import { Worker, Job } from 'bullmq';

export function createMonitoredWorker(
  queueName: string,
  processor: (job: Job) => Promise<void>
) {
  return new Worker(
    queueName,
    async (job) => {
      const transaction = Sentry.startTransaction({
        name: `queue.${queueName}.${job.name}`,
        op: 'queue.task',
        data: {
          jobId: job.id,
          jobName: job.name,
          attemptsMade: job.attemptsMade,
        },
      });

      try {
        await processor(job);

        transaction.setStatus('ok');

        // Track successful job
        Sentry.metrics.increment('worker.job.success', {
          tags: {
            queue: queueName,
            jobType: job.name,
          },
        });

      } catch (error) {
        transaction.setStatus('internal_error');

        Sentry.withScope((scope) => {
          scope.setContext('job', {
            id: job.id,
            name: job.name,
            data: job.data,
            attemptsMade: job.attemptsMade,
          });

          scope.setTag('queue', queueName);
          scope.setTag('job_type', job.name);

          Sentry.captureException(error);
        });

        throw error;
      } finally {
        transaction.finish();
      }
    },
    {
      connection: {
        host: process.env.REDIS_URL,
      },
      limiter: {
        max: 10,
        duration: 1000,
      },
    }
  );
}

// Usage
const browserWorker = createMonitoredWorker(
  'browser-automation',
  async (job) => {
    // Your browser automation logic
  }
);
```

---

### 2. Browser Automation Monitoring

**Critical: Track Browserbase Sessions**

```typescript
// server/_core/browserbase-monitoring.ts
import * as Sentry from '@sentry/node';
import Browserbase from '@browserbasehq/sdk';

interface BrowserSession {
  sessionId: string;
  startTime: number;
  projectId: string;
  status: 'running' | 'completed' | 'failed' | 'timeout';
}

const activeSessions = new Map<string, BrowserSession>();

export async function monitoredBrowserSession<T>(
  operation: string,
  callback: (browser: any) => Promise<T>
): Promise<T> {
  const bb = new Browserbase({
    apiKey: process.env.BROWSERBASE_API_KEY,
  });

  const sessionStart = Date.now();
  let session: any;

  const transaction = Sentry.startTransaction({
    name: `browser.${operation}`,
    op: 'browser.automation',
  });

  try {
    // Create session
    session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID,
      keepAlive: true,
    });

    activeSessions.set(session.id, {
      sessionId: session.id,
      startTime: sessionStart,
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      status: 'running',
    });

    // Track active sessions gauge
    Sentry.metrics.gauge(
      'browserbase.active_sessions',
      activeSessions.size
    );

    // Execute operation
    const result = await callback(session);

    // Success metrics
    const duration = Date.now() - sessionStart;
    Sentry.metrics.distribution('browser.session.duration', duration, {
      tags: {
        operation,
        status: 'success',
      },
    });

    // Cost tracking (estimate: $0.002/minute)
    const estimatedCost = (duration / 60000) * 0.002;
    Sentry.metrics.distribution('browserbase.cost', estimatedCost, {
      tags: { operation },
    });

    activeSessions.get(session.id)!.status = 'completed';
    transaction.setStatus('ok');

    return result;

  } catch (error) {
    // Error tracking
    transaction.setStatus('internal_error');

    Sentry.withScope((scope) => {
      scope.setContext('browserbase', {
        sessionId: session?.id,
        operation,
        duration: Date.now() - sessionStart,
      });

      scope.setTag('browser_operation', operation);
      scope.setLevel('error');

      Sentry.captureException(error);
    });

    if (session?.id) {
      activeSessions.get(session.id)!.status = 'failed';
    }

    throw error;

  } finally {
    // Cleanup
    if (session?.id) {
      try {
        await bb.sessions.complete(session.id);
      } catch (cleanupError) {
        // Log but don't throw
        console.error('Failed to cleanup session:', cleanupError);
      }

      activeSessions.delete(session.id);

      // Update gauge
      Sentry.metrics.gauge(
        'browserbase.active_sessions',
        activeSessions.size
      );
    }

    transaction.finish();
  }
}

// Periodic session audit
setInterval(() => {
  const now = Date.now();
  const stuckSessions: string[] = [];

  activeSessions.forEach((session, sessionId) => {
    // Sessions running > 10 minutes are likely stuck
    if (now - session.startTime > 10 * 60 * 1000) {
      stuckSessions.push(sessionId);

      Sentry.captureMessage('Browser session timeout', {
        level: 'warning',
        tags: {
          sessionId,
          duration: Math.floor((now - session.startTime) / 1000),
        },
      });
    }
  });

  // Cleanup stuck sessions
  stuckSessions.forEach((id) => {
    activeSessions.delete(id);
  });

}, 60000); // Check every minute
```

**Stagehand Monitoring:**

```typescript
// server/_core/stagehand-monitoring.ts
import { Stagehand } from '@browserbasehq/stagehand';
import * as Sentry from '@sentry/node';

export async function monitoredStagehand<T>(
  operation: string,
  callback: (stagehand: Stagehand) => Promise<T>
): Promise<T> {
  const stagehand = new Stagehand({
    apiKey: process.env.BROWSERBASE_API_KEY,
    projectId: process.env.BROWSERBASE_PROJECT_ID,
    env: 'BROWSERBASE',
    modelName: process.env.STAGEHAND_MODEL || 'google/gemini-2.0-flash',
  });

  const transaction = Sentry.startTransaction({
    name: `stagehand.${operation}`,
    op: 'ai.browser',
  });

  const startTime = Date.now();
  let aiTokensUsed = 0;

  try {
    await stagehand.init();

    // Wrap AI calls to track token usage
    const originalAct = stagehand.act.bind(stagehand);
    stagehand.act = async (...args: any[]) => {
      const actStart = Date.now();
      const result = await originalAct(...args);

      // Estimate tokens (rough approximation)
      const estimatedTokens = JSON.stringify(args).length / 4;
      aiTokensUsed += estimatedTokens;

      Sentry.metrics.distribution('ai.tokens.used', estimatedTokens, {
        tags: {
          model: process.env.STAGEHAND_MODEL || 'gemini',
          operation: 'act',
        },
      });

      Sentry.metrics.distribution('stagehand.act.duration', Date.now() - actStart);

      return result;
    };

    const result = await callback(stagehand);

    // Success metrics
    const totalDuration = Date.now() - startTime;
    Sentry.metrics.distribution('stagehand.operation.duration', totalDuration, {
      tags: { operation },
    });

    // Cost estimation
    const estimatedCost = calculateStagehandCost(
      totalDuration,
      aiTokensUsed,
      process.env.STAGEHAND_MODEL
    );

    Sentry.metrics.distribution('stagehand.cost', estimatedCost, {
      tags: { operation, model: process.env.STAGEHAND_MODEL || 'gemini' },
    });

    transaction.setStatus('ok');
    return result;

  } catch (error) {
    transaction.setStatus('internal_error');

    Sentry.withScope((scope) => {
      scope.setContext('stagehand', {
        operation,
        model: process.env.STAGEHAND_MODEL,
        tokensUsed: aiTokensUsed,
        duration: Date.now() - startTime,
      });

      scope.setTag('ai_operation', operation);
      Sentry.captureException(error);
    });

    throw error;

  } finally {
    try {
      await stagehand.close();
    } catch (closeError) {
      console.error('Failed to close Stagehand:', closeError);
    }

    transaction.finish();
  }
}

function calculateStagehandCost(
  durationMs: number,
  tokens: number,
  model?: string
): number {
  // Browserbase: ~$0.002/minute
  const browserCost = (durationMs / 60000) * 0.002;

  // AI costs (approximate)
  const tokenCosts: Record<string, number> = {
    'google/gemini-2.0-flash': 0.000001, // $1/M tokens
    'openai/gpt-4o': 0.000005,           // $5/M tokens
    'anthropic/claude-3-sonnet': 0.000003, // $3/M tokens
  };

  const tokenCost = (tokens / 1000000) * (tokenCosts[model || 'google/gemini-2.0-flash'] || 0.000001);

  return browserCost + tokenCost;
}
```

---

### 3. Database Performance Monitoring

**PostgreSQL Query Tracking:**

```typescript
// server/_core/db-monitoring.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as Sentry from '@sentry/node';

export function createMonitoredDb() {
  const sql = neon(process.env.DATABASE_URL!);

  // Wrap queries with monitoring
  const monitoredSql = new Proxy(sql, {
    apply(target, thisArg, args) {
      const query = args[0];
      const startTime = Date.now();

      const transaction = Sentry.startTransaction({
        name: 'db.query',
        op: 'db',
        data: {
          query: typeof query === 'string' ? query.substring(0, 200) : 'Template query',
        },
      });

      return Reflect.apply(target, thisArg, args)
        .then((result) => {
          const duration = Date.now() - startTime;

          // Track query performance
          Sentry.metrics.distribution('db.query.duration', duration, {
            tags: {
              success: 'true',
            },
          });

          // Alert on slow queries
          if (duration > 1000) {
            Sentry.captureMessage('Slow database query', {
              level: 'warning',
              tags: {
                duration: duration.toString(),
                query: typeof query === 'string' ? query.substring(0, 100) : 'template',
              },
            });
          }

          transaction.setStatus('ok');
          transaction.finish();

          return result;
        })
        .catch((error) => {
          transaction.setStatus('internal_error');

          Sentry.withScope((scope) => {
            scope.setContext('database', {
              query: typeof query === 'string' ? query.substring(0, 200) : 'template',
              duration: Date.now() - startTime,
            });

            scope.setTag('db_error', 'true');
            Sentry.captureException(error);
          });

          transaction.finish();
          throw error;
        });
    },
  });

  return drizzle(monitoredSql);
}
```

---

### 4. AI API Cost Monitoring

**Track OpenAI/Gemini/Anthropic Usage:**

```typescript
// server/_core/ai-monitoring.ts
import * as Sentry from '@sentry/node';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';

// OpenAI Monitoring
export function createMonitoredOpenAI() {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Wrap completions
  const originalCreate = openai.chat.completions.create.bind(openai.chat.completions);
  openai.chat.completions.create = async (params: any) => {
    const startTime = Date.now();

    try {
      const response = await originalCreate(params);

      // Track usage
      const { prompt_tokens, completion_tokens, total_tokens } = response.usage || {};

      Sentry.metrics.distribution('ai.openai.tokens', total_tokens || 0, {
        tags: {
          model: params.model,
          type: 'total',
        },
      });

      // Cost calculation (approximate)
      const cost = calculateOpenAICost(params.model, prompt_tokens || 0, completion_tokens || 0);
      Sentry.metrics.distribution('ai.openai.cost', cost, {
        tags: { model: params.model },
      });

      Sentry.metrics.distribution('ai.openai.latency', Date.now() - startTime, {
        tags: { model: params.model },
      });

      return response;
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          ai_provider: 'openai',
          model: params.model,
        },
      });
      throw error;
    }
  };

  return openai;
}

// Gemini Monitoring
export function createMonitoredGemini() {
  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  return {
    getGenerativeModel: (modelName: string) => {
      const model = genai.getGenerativeModel({ model: modelName });
      const originalGenerate = model.generateContent.bind(model);

      model.generateContent = async (request: any) => {
        const startTime = Date.now();

        try {
          const response = await originalGenerate(request);

          // Gemini doesn't provide token counts in response
          // Estimate based on input/output
          const estimatedInputTokens = JSON.stringify(request).length / 4;
          const estimatedOutputTokens = JSON.stringify(response.response.text()).length / 4;

          Sentry.metrics.distribution('ai.gemini.tokens', estimatedInputTokens + estimatedOutputTokens, {
            tags: { model: modelName },
          });

          // Cost: ~$1/M tokens for Gemini Flash
          const cost = ((estimatedInputTokens + estimatedOutputTokens) / 1000000) * 1.0;
          Sentry.metrics.distribution('ai.gemini.cost', cost, {
            tags: { model: modelName },
          });

          Sentry.metrics.distribution('ai.gemini.latency', Date.now() - startTime, {
            tags: { model: modelName },
          });

          return response;
        } catch (error) {
          Sentry.captureException(error, {
            tags: {
              ai_provider: 'gemini',
              model: modelName,
            },
          });
          throw error;
        }
      };

      return model;
    },
  };
}

function calculateOpenAICost(model: string, promptTokens: number, completionTokens: number): number {
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 5 / 1000000, output: 15 / 1000000 },
    'gpt-4o-mini': { input: 0.15 / 1000000, output: 0.6 / 1000000 },
    'gpt-4-turbo': { input: 10 / 1000000, output: 30 / 1000000 },
  };

  const modelPricing = pricing[model] || pricing['gpt-4o'];
  return (promptTokens * modelPricing.input) + (completionTokens * modelPricing.output);
}
```

---

### 5. tRPC Monitoring

**Monitor All API Calls:**

```typescript
// server/_core/trpc.ts
import { initTRPC } from '@trpc/server';
import * as Sentry from '@sentry/node';
import superjson from 'superjson';

const t = initTRPC.create({
  transformer: superjson,
});

// Monitoring middleware
const sentryMiddleware = t.middleware(async ({ path, type, next, rawInput }) => {
  const transaction = Sentry.startTransaction({
    name: `trpc.${type}.${path}`,
    op: 'trpc',
    data: {
      path,
      type,
      input: rawInput,
    },
  });

  const startTime = Date.now();

  try {
    const result = await next();

    const duration = Date.now() - startTime;

    // Success metrics
    Sentry.metrics.distribution('trpc.request.duration', duration, {
      tags: {
        path,
        type,
        success: 'true',
      },
    });

    transaction.setStatus('ok');

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Error metrics
    Sentry.metrics.increment('trpc.request.error', {
      tags: {
        path,
        type,
      },
    });

    Sentry.metrics.distribution('trpc.request.duration', duration, {
      tags: {
        path,
        type,
        success: 'false',
      },
    });

    transaction.setStatus('internal_error');

    Sentry.withScope((scope) => {
      scope.setContext('trpc', {
        path,
        type,
        input: rawInput,
      });

      scope.setTag('trpc_path', path);
      scope.setTag('trpc_type', type);

      Sentry.captureException(error);
    });

    throw error;
  } finally {
    transaction.finish();
  }
});

export const publicProcedure = t.procedure.use(sentryMiddleware);
export const router = t.router;
```

---

## 🚨 Critical Alerts

### Sentry Alert Configuration

**1. Browser Automation Failures**

```yaml
Alert: Browser Session Failures
Condition: Error count > 5 in 10 minutes
Filters:
  - tags.browser_operation exists
  - environment = "production"
Action:
  - Slack: #automation channel
  - Email: automation-team@bottleneckbot.com
```

**2. Cost Overruns**

```yaml
Alert: High AI Costs
Condition: Sum of ai.*.cost > $100 in 1 hour
Filters:
  - metric contains "ai." AND contains ".cost"
Action:
  - PagerDuty: High severity
  - Slack: #finance channel
  - Email: cto@bottleneckbot.com
```

**3. Worker Queue Backlog**

```yaml
Alert: Worker Queue Backlog
Condition: Queue depth > 100 jobs for 5 minutes
Filters:
  - tags.queue exists
Action:
  - Slack: #infrastructure channel
```

**4. Database Performance**

```yaml
Alert: Slow Database Queries
Condition: p95(db.query.duration) > 1000ms
Filters:
  - environment = "production"
Action:
  - Slack: #engineering channel
```

---

## 📊 Business Metrics Dashboard

**Key Metrics to Track:**

```typescript
// Track these in your code

// User engagement
Sentry.metrics.increment('user.workflow_created');
Sentry.metrics.increment('user.task_executed');
Sentry.metrics.gauge('workflows.active', activeWorkflowCount);

// Browser automation
Sentry.metrics.distribution('browser.session.duration', durationMs);
Sentry.metrics.increment('browser.session.success');
Sentry.metrics.increment('browser.session.failed');

// AI usage
Sentry.metrics.distribution('ai.cost.daily', dailyAiCost);
Sentry.metrics.distribution('ai.tokens.daily', dailyTokens);

// Task execution
Sentry.metrics.distribution('task.execution.duration', taskDurationMs, {
  tags: { taskType: 'browser_action' }
});
Sentry.metrics.increment('task.execution.success', {
  tags: { taskType: 'browser_action' }
});

// Revenue/usage
Sentry.metrics.increment('subscription.created');
Sentry.metrics.gauge('mrr', monthlyRecurringRevenue);
Sentry.metrics.increment('stripe.payment.success');
```

---

## 🔧 Implementation Checklist

### Phase 1: Core Monitoring (Week 1)

- [ ] **Initialize Sentry** in server/workers
  - Create `server/_core/sentry.ts`
  - Add to Express app
  - Add to worker processes

- [ ] **Add browser monitoring**
  - Wrap Browserbase SDK calls
  - Track session costs
  - Monitor stuck sessions

- [ ] **Configure Sentry alerts**
  - Browser automation failures
  - Cost overruns
  - Database performance

### Phase 2: Worker Monitoring (Week 2)

- [ ] **Monitor BullMQ workers**
  - Wrap worker processors
  - Track job success/failure
  - Monitor queue depth

- [ ] **Add AI cost tracking**
  - Wrap OpenAI/Gemini/Anthropic
  - Track token usage
  - Calculate costs

### Phase 3: Advanced Monitoring (Week 3)

- [ ] **Database performance**
  - Monitor query duration
  - Track slow queries
  - Alert on timeouts

- [ ] **tRPC monitoring**
  - Add Sentry middleware
  - Track request duration
  - Monitor error rates

### Phase 4: Business Intelligence (Week 4)

- [ ] **Custom dashboards**
  - User engagement metrics
  - Revenue metrics
  - Cost analysis

- [ ] **Uptime monitoring**
  - Health check endpoint
  - External monitoring (UptimeRobot)
  - SSL certificate tracking

---

## 💰 Cost Estimation

**Monthly Monitoring Costs:**

| Service | Tier | Cost | Notes |
|---------|------|------|-------|
| Sentry | Team | $26/month | 100K errors, 500K transactions |
| Vercel Analytics | Included | $0 | With Vercel Pro plan |
| UptimeRobot | Free | $0 | 50 monitors, 5-min checks |
| **Total** | | **$26/month** | |

**Cost Breakdown by Volume:**

- 10K browser sessions/month: ~$20 Browserbase cost
- 1M AI tokens/month: ~$1-5 AI provider cost
- Sentry monitoring: $26/month
- **Total operations cost: ~$50/month**

---

## 🔗 Quick Links

- [Sentry Dashboard](https://sentry.io/)
- [Browserbase Dashboard](https://browserbase.com/dashboard)
- [Vercel Analytics](https://vercel.com/dashboard/analytics)
- [BullMQ Monitoring](https://docs.bullmq.io/guide/metrics)

---

## 📚 Additional Resources

**Internal Docs:**
- `/docs/IMPLEMENTATION_GUIDE.md` - Setup guide
- `/docs/DEPLOYMENT_ARCHITECTURE.md` - System architecture
- `.env.example` - Environment variables

**External:**
- [Sentry Node.js Setup](https://docs.sentry.io/platforms/node/)
- [tRPC Error Handling](https://trpc.io/docs/error-handling)
- [BullMQ Best Practices](https://docs.bullmq.io/guide/best-practices)

---

**Questions?** Review this guide during sprint planning or contact the engineering team.
