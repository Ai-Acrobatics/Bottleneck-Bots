# Background Jobs & Workers

This directory contains the BullMQ worker implementations for processing background jobs. The queue system uses Redis for reliable job processing with retry logic, progress tracking, and graceful shutdown.

## Architecture

```
server/
├── _core/
│   └── queue.ts          # Queue configuration and job types
└── workers/
    ├── index.ts          # Production worker entry point
    ├── dev.ts            # Development worker helper
    ├── utils.ts          # Shared worker utilities
    ├── emailWorker.ts    # Email processing (sync, drafts)
    ├── voiceWorker.ts    # Voice call processing (Vapi)
    ├── enrichmentWorker.ts # Lead enrichment (Appify)
    └── workflowWorker.ts # Workflow execution
```

## Prerequisites

### Redis Setup

The queue system requires Redis. You have two options:

#### Option 1: Local Redis (Development)

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:latest
```

#### Option 2: Upstash (Production/Serverless)

1. Create a free account at [Upstash](https://upstash.com)
2. Create a Redis database
3. Copy the Redis URL (starts with `rediss://`)
4. Add to your `.env`:

```env
REDIS_URL=rediss://default:YOUR_PASSWORD@YOUR_HOST:6379
```

## Configuration

Add to your `.env` file:

```env
# Option 1: Redis URL (recommended)
REDIS_URL=redis://localhost:6379

# Option 2: Individual settings (fallback)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_USERNAME=default
REDIS_TLS=false
```

## Running Workers

### Development Mode

#### Option 1: Integrated with Server
Start the server with workers enabled:

```bash
npm run dev:workers
# or
START_WORKERS=true npm run dev
```

#### Option 2: Separate Process (Recommended)
Run workers in a separate terminal:

```bash
npm run workers
```

### Production Mode

Workers should **always** run as separate processes in production:

```bash
# Terminal 1: Main application
npm run start

# Terminal 2: Workers
npm run workers
```

## Available Job Types

### 1. Email Jobs (Email Queue)

#### EMAIL_SYNC
Syncs emails from Gmail/Outlook API.

```typescript
import { addEmailSyncJob } from '../_core/queue';

await addEmailSyncJob({
  userId: 'user_123',
  accountId: 'acc_456',
  emailProvider: 'gmail',
  syncSince: new Date('2024-01-01'),
});
```

#### EMAIL_DRAFT
Generates AI-powered email draft responses.

```typescript
import { addEmailDraftJob } from '../_core/queue';

await addEmailDraftJob({
  userId: 'user_123',
  threadId: 'thread_789',
  context: 'Customer inquiry about pricing',
  tone: 'professional',
});
```

### 2. Voice Jobs (Voice Queue)

#### VOICE_CALL
Initiates and manages voice calls via Vapi.

```typescript
import { addVoiceCallJob } from '../_core/queue';

await addVoiceCallJob({
  userId: 'user_123',
  callId: 'call_456',
  phoneNumber: '+1234567890',
  assistantId: 'assistant_789',
  metadata: {
    campaign: 'outbound_sales',
  },
});
```

### 3. Enrichment Jobs (Enrichment Queue)

#### LEAD_ENRICHMENT
Enriches lead data using Appify API with batch processing.

```typescript
import { addLeadEnrichmentJob } from '../_core/queue';

await addLeadEnrichmentJob({
  userId: 'user_123',
  leads: [
    {
      id: 'lead_1',
      email: 'john@example.com',
      company: 'Acme Corp',
    },
    {
      id: 'lead_2',
      email: 'jane@example.com',
      phone: '+1234567890',
    },
  ],
  batchSize: 5,
});
```

### 4. Workflow Jobs (Workflow Queue)

#### WORKFLOW_EXECUTION
Executes automated workflows with multiple steps.

```typescript
import { addWorkflowExecutionJob } from '../_core/queue';

await addWorkflowExecutionJob({
  userId: 'user_123',
  workflowId: 'wf_456',
  triggerId: 'trigger_789',
  context: {
    leadId: 'lead_123',
    source: 'webhook',
  },
});
```

### 5. SEO Jobs (SEO Queue)

#### SEO_AUDIT
Performs comprehensive SEO audits.

```typescript
import { addSeoAuditJob } from '../_core/queue';

await addSeoAuditJob({
  userId: 'user_123',
  websiteUrl: 'https://example.com',
  depth: 3,
  includeCompetitors: true,
});
```

### 6. Ad Jobs (Ads Queue)

#### AD_ANALYSIS
Analyzes advertising campaign performance.

```typescript
import { addAdAnalysisJob } from '../_core/queue';

await addAdAnalysisJob({
  userId: 'user_123',
  platform: 'google',
  accountId: 'acc_456',
  dateRange: {
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31'),
  },
});
```

## Job Options

All job creation functions accept optional parameters:

```typescript
await addEmailSyncJob(data, {
  delay: 5000,        // Delay job by 5 seconds
  priority: 1,        // Higher priority (1-10, lower is higher priority)
  attempts: 5,        // Override default retry attempts
  jobId: 'unique_id', // Custom job ID (prevents duplicates)
});
```

## Monitoring Jobs

### Queue Statistics

```typescript
import { getQueueStats, getAllQueueStats } from '../_core/queue';

// Get stats for a specific queue
const stats = await getQueueStats('email');
console.log(stats);
// {
//   waiting: 5,
//   active: 2,
//   completed: 100,
//   failed: 3,
//   delayed: 1,
//   paused: false,
// }

// Get stats for all queues
const allStats = await getAllQueueStats();
```

### Worker Events

Workers emit events that you can monitor:

```typescript
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

worker.on('active', (job) => {
  console.log(`Processing job ${job.id}`);
});

worker.on('progress', (job, progress) => {
  console.log(`Job ${job.id} progress: ${progress}%`);
});
```

## Worker Configuration

Each worker has its own configuration:

```typescript
// Email Worker
concurrency: 5,        // Process 5 jobs concurrently
limiter: {
  max: 10,            // Max 10 jobs per second
  duration: 1000,
}

// Voice Worker
concurrency: 3,        // Process 3 calls concurrently
limiter: {
  max: 5,             // Max 5 calls per second
  duration: 1000,
}

// Enrichment Worker
concurrency: 2,        // Process 2 enrichment jobs concurrently
limiter: {
  max: 10,            // Max 10 API calls per second
  duration: 1000,
}

// Workflow Worker
concurrency: 5,        // Process 5 workflows concurrently
limiter: {
  max: 20,            // Max 20 jobs per second
  duration: 1000,
}
```

## Error Handling

Jobs are automatically retried with exponential backoff:

- Default attempts: 3
- Backoff strategy: Exponential
- Initial delay: 2000ms (doubles with each retry)

Failed jobs are kept for 7 days for debugging.

## Graceful Shutdown

Workers handle graceful shutdown automatically:

```bash
# Press Ctrl+C to stop workers
^C
Shutting down workers...
All workers closed
Closing all queues...
All queues closed
Graceful shutdown complete
```

## Best Practices

1. **Separate Processes in Production**: Always run workers separately from the main application
2. **Monitor Queue Depth**: Watch for growing queue sizes that indicate processing issues
3. **Set Appropriate Concurrency**: Balance between throughput and resource usage
4. **Use Job IDs**: Prevent duplicate jobs by using custom job IDs
5. **Handle Failures**: Implement proper error handling and alerting
6. **Clean Up Old Jobs**: Jobs are automatically cleaned up, but monitor storage usage
7. **Rate Limiting**: Respect external API rate limits using worker limiters

## Troubleshooting

### Workers won't start

1. Check Redis connection:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

2. Verify REDIS_URL in .env:
   ```bash
   echo $REDIS_URL
   ```

3. Check Redis credentials for Upstash

### Jobs not processing

1. Verify workers are running:
   ```bash
   npm run workers
   ```

2. Check queue stats for errors:
   ```typescript
   const stats = await getQueueStats('email');
   console.log('Failed:', stats.failed);
   ```

3. Monitor worker logs for errors

### High memory usage

1. Reduce worker concurrency
2. Increase job cleanup frequency
3. Check for memory leaks in job processors

## Production Deployment

### Docker

```dockerfile
# Dockerfile.workers
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
CMD ["npm", "run", "workers"]
```

### Environment Variables

```env
NODE_ENV=production
REDIS_URL=rediss://your-redis-url
REDIS_TLS=true

# Worker-specific settings
WORKER_CONCURRENCY=5
WORKER_MAX_JOBS_PER_SECOND=10
```

### Process Managers

#### PM2

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'workers',
      script: 'server/workers/index.ts',
      interpreter: 'tsx',
      instances: 1,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

```bash
pm2 start ecosystem.config.js
```

## Next Steps

1. Set up Redis (local or Upstash)
2. Configure REDIS_URL in .env
3. Start workers: `npm run workers`
4. Add jobs from your application code
5. Monitor queue statistics
6. Deploy workers separately in production

## Support

For issues or questions about the queue system:
- Check Redis connection
- Review worker logs
- Monitor queue statistics
- Check BullMQ documentation: https://docs.bullmq.io
