# Lead Enrichment with Apify Integration

This document describes the Lead Enrichment feature using the Apify service for data enrichment.

## Overview

The Lead Enrichment system allows users to upload CSV files containing leads and enrich them with additional data from Apify. The system handles batch processing, credit management, rate limiting, and provides comprehensive status tracking.

## Architecture

### Components

1. **Apify Service** (`server/services/appify.service.ts`)
   - Handles communication with Apify API
   - Manages individual and batch enrichment
   - Implements rate limiting and retry logic
   - Calculates confidence scores

2. **Lead Enrichment Router** (`server/api/routers/leadEnrichment.ts`)
   - Provides tRPC endpoints for lead management
   - Handles CSV upload and parsing
   - Manages enrichment workflows
   - Tracks enrichment status and history

3. **Credit Service** (`server/services/credit.service.ts`)
   - Manages user credit balances
   - Tracks credit transactions
   - Enforces credit limits

4. **Queue System** (`server/_core/queue.ts`)
   - BullMQ-based job queue for batch processing
   - Handles background enrichment jobs
   - Provides job status tracking

5. **Database Schema** (`drizzle/schema-lead-enrichment.ts`)
   - Lead lists and individual leads
   - Credit management tables
   - Enrichment status tracking

## Environment Variables

### Required

```bash
# Apify API Configuration
APIFY_API_KEY=your_apify_api_token_here
APIFY_TASK_ID=your_apify_task_id_here

# Redis Configuration (for queue)
REDIS_URL=redis://localhost:6379
# OR
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional_password
REDIS_TLS=false
```

### Optional

```bash
# Apify Configuration
APIFY_TASK_ID=your_actor_task_id  # Specific actor task to run
```

## Setup Instructions

### 1. Configure Apify

1. Sign up for an Apify account at https://apify.com
2. Create or select an actor for lead enrichment
3. Create a task for the actor with your desired configuration
4. Copy the API token from your Apify account settings
5. Copy the task ID from the task details page

### 2. Set Environment Variables

Add the following to your `.env` file:

```bash
APIFY_API_KEY=apify_api_YOUR_TOKEN_HERE
APIFY_TASK_ID=YOUR_TASK_ID_HERE
REDIS_URL=redis://localhost:6379
```

### 3. Initialize Credits

Users need enrichment credits to use the service. Credits can be added via:

```typescript
const creditService = new CreditService();
await creditService.addCredits(
  userId,
  1000, // amount
  'enrichment',
  'Initial credit package',
  'purchase'
);
```

## API Endpoints

### Lead List Management

#### Create Lead List
```typescript
leadEnrichment.createList({
  name: "My Lead List",
  description: "Q4 2024 Prospects",
  fileName: "leads.csv",
  fileSize: 1024000
})
```

#### Get All Lists
```typescript
leadEnrichment.getLists({
  limit: 50,
  offset: 0,
  status: "completed" // optional
})
```

#### Get Single List
```typescript
leadEnrichment.getList({ listId: 1 })
```

#### Delete List
```typescript
leadEnrichment.deleteList({ listId: 1 })
```

### Lead Management

#### Upload Leads
```typescript
leadEnrichment.uploadLeads({
  listId: 1,
  leads: [
    {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      company: "Acme Corp"
    }
  ]
})
```

#### Get Leads
```typescript
leadEnrichment.getLeads({
  listId: 1,
  limit: 50,
  offset: 0,
  enrichmentStatus: "enriched" // optional: pending, enriched, failed, skipped
})
```

### Enrichment Operations

#### Enrich Single Lead
```typescript
leadEnrichment.enrichLead({ leadId: 1 })
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fullName": "John Doe",
    "title": "CEO",
    "company": "Acme Corp",
    "location": "San Francisco, CA",
    "socialProfiles": {
      "linkedin": "https://linkedin.com/in/johndoe"
    },
    "contactInfo": {
      "email": "john@example.com",
      "phone": "+1-555-0123"
    },
    "confidence": 85
  }
}
```

#### Batch Enrich List
```typescript
leadEnrichment.enrichList({
  listId: 1,
  batchSize: 5 // concurrent enrichments
})
```

**Response:**
```json
{
  "success": true,
  "enriched": 45,
  "failed": 5,
  "total": 50
}
```

#### Re-Enrich Failed Leads
```typescript
leadEnrichment.reEnrichFailed({ listId: 1 })
```

### Status and Analytics

#### Get Enrichment Status
```typescript
leadEnrichment.getEnrichmentStatus({ listId: 1 })
```

**Response:**
```json
{
  "listId": 1,
  "listName": "My Lead List",
  "status": "completed",
  "totalLeads": 100,
  "enrichedLeads": 95,
  "failedLeads": 5,
  "pendingLeads": 0,
  "progress": 95,
  "costInCredits": 95
}
```

#### Get Enrichment History
```typescript
leadEnrichment.getEnrichmentHistory({
  limit: 20,
  offset: 0
})
```

**Response:**
```json
{
  "history": [...],
  "summary": {
    "totalLeads": 1000,
    "totalEnriched": 950,
    "totalFailed": 50,
    "totalCreditsUsed": 950
  },
  "total": 10,
  "hasMore": false
}
```

#### Get Enrichment Statistics
```typescript
leadEnrichment.getEnrichmentStats()
```

**Response:**
```json
{
  "creditsAvailable": 500,
  "totalLists": 10,
  "totalLeads": 1000,
  "totalEnriched": 950,
  "totalFailed": 50,
  "totalCreditsUsed": 950,
  "activeEnrichmentJobs": 2,
  "successRate": 95
}
```

### Utility Endpoints

#### Estimate Enrichment Cost
```typescript
leadEnrichment.estimateEnrichmentCost({ leadCount: 100 })
```

**Response:**
```json
{
  "leadCount": 100,
  "estimatedCredits": 100,
  "costPerLead": 1
}
```

#### Validate Apify Configuration
```typescript
leadEnrichment.validateApifyConfig()
```

**Response:**
```json
{
  "configured": true,
  "valid": true,
  "message": "Apify API is configured and valid",
  "creditsBalance": 10000
}
```

#### Export Enriched Leads
```typescript
leadEnrichment.exportLeads({ listId: 1 })
```

## Data Flow

### Upload and Enrichment Workflow

1. **Create List**: User creates a lead list container
2. **Upload Leads**: CSV data is parsed and stored as raw lead records
3. **Initiate Enrichment**: User triggers enrichment for the list
4. **Credit Check**: System verifies sufficient credits
5. **Batch Processing**: Leads are processed in configurable batches
6. **Apify Enrichment**: Each lead is sent to Apify for enrichment
7. **Result Processing**: Enriched data is stored with confidence scores
8. **Credit Deduction**: Credits are deducted for successful enrichments
9. **Status Update**: List status is updated to "completed"

### Enrichment Process Detail

For each lead:
1. Check if already enriched (skip if yes)
2. Verify credit availability
3. Start Apify actor task with lead data
4. Poll task status every 5 seconds (max 5 minutes)
5. Retrieve enriched data from Apify dataset
6. Calculate confidence score
7. Store enriched data
8. Deduct credits
9. Update lead and list statistics

## Rate Limiting

The system implements rate limiting to comply with Apify API limits:

- **Batch Size**: Configurable concurrent enrichments (default: 5)
- **Delay Between Batches**: 2 seconds between batches
- **Timeout**: 5 minutes max per enrichment
- **Retry Logic**: Automatic retries via BullMQ queue

## Confidence Scoring

Enrichment results include a confidence score (0-100) based on data completeness:

- Email: 20 points
- Phone: 15 points
- Full Name: 15 points
- Job Title: 10 points
- Company: 15 points
- Location: 5 points
- LinkedIn URL: 10 points

Higher scores indicate more complete enrichment data.

## Credit Management

### Credit Types
- `enrichment`: Credits for lead enrichment
- `calling`: Credits for AI calls (future)
- `scraping`: Credits for web scraping (future)

### Credit Operations

**Add Credits:**
```typescript
const creditService = new CreditService();
await creditService.addCredits(userId, 1000, 'enrichment', 'Purchase', 'purchase');
```

**Deduct Credits:**
```typescript
await creditService.deductCredits(
  userId,
  1,
  'enrichment',
  'Lead enrichment',
  leadId.toString(),
  'lead'
);
```

**Check Balance:**
```typescript
const hasCredits = await creditService.checkBalance(userId, 'enrichment', 100);
const balance = await creditService.getBalance(userId, 'enrichment');
```

**Transaction History:**
```typescript
const history = await creditService.getTransactionHistory(
  userId,
  'enrichment',
  50, // limit
  0   // offset
);
```

## Error Handling

### Common Errors

**Insufficient Credits:**
```json
{
  "code": "PRECONDITION_FAILED",
  "message": "Insufficient credits. Need 100, have 50"
}
```

**Apify Configuration Error:**
```json
{
  "code": "INTERNAL_SERVER_ERROR",
  "message": "Apify API key not configured. Set APIFY_API_KEY environment variable."
}
```

**Enrichment Timeout:**
```json
{
  "success": false,
  "error": "Apify actor run timed out"
}
```

### Failed Lead Handling

Failed leads are:
- Marked with status "failed"
- Store error messages in the `error` field
- Count toward the list's `failedLeads` metric
- Can be re-enriched using `reEnrichFailed` endpoint

## Queue Integration

For batch enrichment, jobs can be queued for background processing:

```typescript
import { addLeadEnrichmentJob } from 'server/_core/queue';

await addLeadEnrichmentJob({
  userId: '1',
  leads: [
    { id: '1', email: 'john@example.com' }
  ],
  batchSize: 5
});
```

## Database Schema

### Lead Lists Table
```sql
CREATE TABLE lead_lists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name VARCHAR(500) NOT NULL,
  description TEXT,
  file_name VARCHAR(500),
  file_size INTEGER,
  status VARCHAR(50) DEFAULT 'uploading',
  total_leads INTEGER DEFAULT 0,
  enriched_leads INTEGER DEFAULT 0,
  failed_leads INTEGER DEFAULT 0,
  cost_in_credits INTEGER DEFAULT 0,
  metadata JSONB,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  processing_started_at TIMESTAMP,
  processed_at TIMESTAMP
);
```

### Leads Table
```sql
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  list_id INTEGER NOT NULL REFERENCES lead_lists(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  raw_data JSONB NOT NULL,
  enriched_data JSONB,
  enrichment_status VARCHAR(50) DEFAULT 'pending',
  credits_used INTEGER DEFAULT 0,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  enriched_at TIMESTAMP
);
```

## Best Practices

1. **Batch Size**: Use 3-5 concurrent enrichments to balance speed and rate limits
2. **Credit Monitoring**: Check credit balance before large enrichment jobs
3. **Error Handling**: Review failed leads and retry with corrected data
4. **Data Quality**: Provide as much lead data as possible for better enrichment
5. **Cost Optimization**: Use `estimateEnrichmentCost` before processing large lists

## Troubleshooting

### Enrichment Fails Immediately

**Check:**
- Apify API key is valid
- Task ID is correct
- Redis is running for queue processing
- Sufficient credits available

### Slow Enrichment

**Solutions:**
- Reduce batch size to avoid rate limiting
- Check Apify actor performance
- Monitor Redis queue backlog

### Low Confidence Scores

**Improvements:**
- Provide more initial lead data
- Use higher quality data sources
- Configure Apify actor for deeper enrichment

## Performance Metrics

Typical performance:
- **Enrichment Speed**: 3-5 leads per batch (every 7-10 seconds)
- **Success Rate**: 90-95% for well-formed data
- **Confidence Score**: 70-90 for complete enrichments

## Future Enhancements

- [ ] Webhook notifications for batch completion
- [ ] Advanced filtering and search
- [ ] Custom field mapping
- [ ] Duplicate detection and merging
- [ ] Integration with CRM systems
- [ ] Scheduled enrichment jobs
- [ ] Cost optimization algorithms
- [ ] Enhanced analytics and reporting
