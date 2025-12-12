# Queue System Usage Examples

This document provides practical examples of how to use the background job queue system in your application code.

## Basic Job Scheduling

### Email Synchronization

```typescript
import { addEmailSyncJob } from '../_core/queue';

// In your email sync endpoint or cron job
export async function scheduleEmailSync(userId: string, accountId: string) {
  const job = await addEmailSyncJob({
    userId,
    accountId,
    emailProvider: 'gmail',
    syncSince: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
  });

  return {
    jobId: job.id,
    status: 'queued',
  };
}
```

### AI Email Draft Generation

```typescript
import { addEmailDraftJob } from '../_core/queue';

// In your email response endpoint
export async function generateEmailDraft(threadId: string, userId: string) {
  const job = await addEmailDraftJob({
    userId,
    threadId,
    context: 'Customer support inquiry',
    tone: 'professional',
  });

  return {
    jobId: job.id,
    message: 'Draft generation started',
  };
}
```

## Advanced Usage

### Delayed Jobs

Schedule a job to run in the future:

```typescript
import { addVoiceCallJob } from '../_core/queue';

// Schedule a call for 1 hour from now
const job = await addVoiceCallJob(
  {
    userId: 'user_123',
    callId: 'call_456',
    phoneNumber: '+1234567890',
    assistantId: 'sales_assistant',
  },
  {
    delay: 60 * 60 * 1000, // 1 hour delay
  }
);
```

### High Priority Jobs

```typescript
import { addWorkflowExecutionJob } from '../_core/queue';

// Critical workflow that needs to run ASAP
const job = await addWorkflowExecutionJob(
  {
    userId: 'user_123',
    workflowId: 'critical_workflow',
    context: { urgency: 'high' },
  },
  {
    priority: 1, // Highest priority
  }
);
```

### Idempotent Jobs

Prevent duplicate jobs using custom job IDs:

```typescript
import { addLeadEnrichmentJob } from '../_core/queue';

// Only one enrichment job per batch
const batchId = 'batch_20240101';
const job = await addLeadEnrichmentJob(
  {
    userId: 'user_123',
    leads: [...],
  },
  {
    jobId: `enrichment_${batchId}`, // Prevents duplicates
  }
);
```

## Real-World Integration Examples

### 1. tRPC Endpoint with Queue

```typescript
// server/api/routers/email.ts
import { z } from 'zod';
import { publicProcedure } from '../trpc';
import { addEmailSyncJob } from '../../_core/queue';

export const emailRouter = {
  syncEmails: publicProcedure
    .input(z.object({
      accountId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.userId) {
        throw new Error('Unauthorized');
      }

      // Queue the sync job instead of running it synchronously
      const job = await addEmailSyncJob({
        userId: ctx.session.userId,
        accountId: input.accountId,
        emailProvider: 'gmail',
      });

      return {
        success: true,
        jobId: job.id,
        message: 'Email sync started',
      };
    }),
};
```

### 2. Webhook Handler with Queue

```typescript
// server/api/webhooks/ghl.ts
import { Request, Response } from 'express';
import { addWorkflowExecutionJob } from '../../_core/queue';

export async function handleGHLWebhook(req: Request, res: Response) {
  const { type, data } = req.body;

  if (type === 'contact.created') {
    // Queue workflow execution instead of blocking
    await addWorkflowExecutionJob({
      userId: data.userId,
      workflowId: 'new_contact_workflow',
      context: {
        contactId: data.contactId,
        source: 'ghl_webhook',
      },
    });

    res.json({ success: true, queued: true });
  }
}
```

### 3. Scheduled Cron Job with Queue

```typescript
// server/jobs/daily-enrichment.ts
import { addLeadEnrichmentJob } from '../_core/queue';
import { getDb } from '../db';
import { leads } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export async function scheduleDailyEnrichment() {
  const db = await getDb();

  // Get all leads that need enrichment
  const leadsToEnrich = await db
    .select()
    .from(leads)
    .where(eq(leads.enrichmentStatus, 'pending'))
    .limit(100);

  if (leadsToEnrich.length === 0) {
    console.log('No leads to enrich');
    return;
  }

  // Queue enrichment job
  const job = await addLeadEnrichmentJob({
    userId: 'system',
    leads: leadsToEnrich.map(lead => ({
      id: lead.id,
      email: lead.email,
      company: lead.company,
    })),
    batchSize: 10,
  });

  console.log(`Queued enrichment for ${leadsToEnrich.length} leads (Job: ${job.id})`);
}
```

### 4. Workflow Trigger with Queue

```typescript
// server/services/workflow-trigger.service.ts
import { addWorkflowExecutionJob } from '../_core/queue';

export class WorkflowTriggerService {
  async triggerOnLeadCreated(leadId: string, userId: string) {
    // Find active workflows with "lead_created" trigger
    const workflows = await this.getActiveWorkflows(userId, 'lead_created');

    // Queue execution for each workflow
    const jobs = await Promise.all(
      workflows.map(workflow =>
        addWorkflowExecutionJob({
          userId,
          workflowId: workflow.id,
          triggerId: 'lead_created',
          context: { leadId },
        })
      )
    );

    return {
      triggered: workflows.length,
      jobIds: jobs.map(j => j.id),
    };
  }

  private async getActiveWorkflows(userId: string, trigger: string) {
    // Implementation to fetch workflows from DB
    return [];
  }
}
```

## Batch Processing

### Process Large Datasets in Chunks

```typescript
import { addLeadEnrichmentJob } from '../_core/queue';

export async function enrichLeadsBatch(leads: any[], userId: string) {
  const BATCH_SIZE = 50;
  const jobs = [];

  // Split into batches and queue each
  for (let i = 0; i < leads.length; i += BATCH_SIZE) {
    const batch = leads.slice(i, i + BATCH_SIZE);

    const job = await addLeadEnrichmentJob(
      {
        userId,
        leads: batch,
        batchSize: 10, // Internal batch size for API calls
      },
      {
        jobId: `batch_${userId}_${i}`, // Prevent duplicates
      }
    );

    jobs.push(job);
  }

  return {
    totalLeads: leads.length,
    batches: jobs.length,
    jobIds: jobs.map(j => j.id),
  };
}
```

## Monitoring & Status Tracking

### Check Job Status

```typescript
import { emailQueue } from '../_core/queue';

export async function checkJobStatus(jobId: string) {
  const job = await emailQueue.getJob(jobId);

  if (!job) {
    return { status: 'not_found' };
  }

  const state = await job.getState();
  const progress = job.progress;

  return {
    id: job.id,
    status: state,
    progress,
    data: job.data,
    returnvalue: job.returnvalue,
    failedReason: job.failedReason,
  };
}
```

### Queue Dashboard Data

```typescript
import { getAllQueueStats } from '../_core/queue';

export async function getQueueDashboard() {
  const stats = await getAllQueueStats();

  return {
    queues: {
      email: {
        ...stats.email,
        health: stats.email.failed / (stats.email.completed + 1) < 0.05 ? 'healthy' : 'degraded',
      },
      voice: {
        ...stats.voice,
        health: stats.voice.failed / (stats.voice.completed + 1) < 0.05 ? 'healthy' : 'degraded',
      },
      // ... other queues
    },
    totalJobs: Object.values(stats).reduce((acc, q) => acc + q.waiting + q.active, 0),
  };
}
```

## Error Handling

### Custom Retry Logic

```typescript
import { addEmailSyncJob } from '../_core/queue';

export async function syncEmailsWithRetry(userId: string, accountId: string) {
  try {
    const job = await addEmailSyncJob(
      {
        userId,
        accountId,
        emailProvider: 'gmail',
      },
      {
        attempts: 5, // Override default 3 attempts
      }
    );

    return { success: true, jobId: job.id };
  } catch (error) {
    console.error('Failed to queue email sync:', error);
    return { success: false, error: error.message };
  }
}
```

### Job Failure Notifications

```typescript
import { emailQueueEvents } from '../_core/queue';

// Listen for failed jobs and notify admin
emailQueueEvents.on('failed', async ({ jobId, failedReason }) => {
  const job = await emailQueue.getJob(jobId);

  if (job && job.attemptsMade >= job.opts.attempts) {
    // Job has exhausted all retries
    console.error(`Job ${jobId} permanently failed:`, failedReason);

    // TODO: Send notification to admin
    // await sendAdminAlert({
    //   type: 'job_failure',
    //   jobId,
    //   reason: failedReason,
    //   data: job.data,
    // });
  }
});
```

## Best Practices

### 1. Always Handle Queue Errors

```typescript
try {
  await addEmailSyncJob({ ... });
} catch (error) {
  // Log error, notify user, fallback to sync processing
  console.error('Failed to queue job:', error);
  // Optionally: process synchronously as fallback
}
```

### 2. Use Meaningful Job IDs

```typescript
// Good: Prevents duplicates, easy to track
const jobId = `email_sync_${userId}_${accountId}_${Date.now()}`;

// Bad: Random, hard to track
const jobId = Math.random().toString();
```

### 3. Monitor Queue Health

```typescript
// Regular health check (run every 5 minutes)
setInterval(async () => {
  const stats = await getAllQueueStats();

  for (const [queueName, queueStats] of Object.entries(stats)) {
    if (queueStats.waiting > 1000) {
      console.warn(`Queue ${queueName} has ${queueStats.waiting} waiting jobs`);
    }

    if (queueStats.failed > 100) {
      console.error(`Queue ${queueName} has ${queueStats.failed} failed jobs`);
    }
  }
}, 5 * 60 * 1000);
```

### 4. Clean Up Completed Jobs

Jobs are automatically cleaned up based on the configuration in `/Users/julianbradley/ghl-agency-ai/server/_core/queue.ts`:

- Completed jobs: kept for 24 hours, max 1000 jobs
- Failed jobs: kept for 7 days

No manual cleanup needed!

## Testing

### Testing Jobs Locally

```typescript
// test/queue.test.ts
import { addEmailSyncJob } from '../server/_core/queue';
import { emailQueue } from '../server/_core/queue';

describe('Email Queue', () => {
  it('should queue email sync job', async () => {
    const job = await addEmailSyncJob({
      userId: 'test_user',
      accountId: 'test_account',
      emailProvider: 'gmail',
    });

    expect(job.id).toBeDefined();
    expect(job.data.userId).toBe('test_user');

    // Clean up
    await job.remove();
  });
});
```

## Common Patterns

### Pattern 1: Queue + Polling

```typescript
// 1. Queue the job
const job = await addEmailSyncJob({ ... });

// 2. Return job ID to client
return { jobId: job.id };

// 3. Client polls for status
const status = await checkJobStatus(job.id);
```

### Pattern 2: Queue + Webhook

```typescript
// 1. Queue the job with webhook URL
const job = await addEmailSyncJob({
  userId: 'user_123',
  accountId: 'acc_456',
  emailProvider: 'gmail',
  webhookUrl: 'https://myapp.com/webhooks/email-sync-complete',
});

// 2. Worker calls webhook when complete
// (implement in emailWorker.ts)
```

### Pattern 3: Queue + WebSocket

```typescript
// 1. Queue the job
const job = await addEmailSyncJob({ ... });

// 2. Subscribe to job events
emailQueueEvents.on('completed', ({ jobId }) => {
  if (jobId === job.id) {
    // Emit to WebSocket
    io.to(userId).emit('email:sync:complete', { jobId });
  }
});
```
