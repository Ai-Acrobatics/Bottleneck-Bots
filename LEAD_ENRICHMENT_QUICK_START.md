# Lead Enrichment Quick Start Guide

Quick reference for implementing and using the Apify Lead Enrichment feature.

## Setup (5 minutes)

### 1. Environment Variables

Add to `.env`:
```bash
APIFY_API_KEY=apify_api_YOUR_TOKEN_HERE
APIFY_TASK_ID=YOUR_TASK_ID_HERE
REDIS_URL=redis://localhost:6379
```

### 2. Start Redis (if not running)

```bash
# macOS (Homebrew)
brew services start redis

# Docker
docker run -d -p 6379:6379 redis:latest

# Linux
sudo systemctl start redis
```

### 3. Initialize User Credits

```typescript
import { CreditService } from './server/services/credit.service';

const creditService = new CreditService();
await creditService.addCredits(
  userId,
  1000,           // amount
  'enrichment',   // type
  'Initial credits',
  'purchase'
);
```

## Basic Usage

### Upload and Enrich Leads

```typescript
// 1. Create a lead list
const list = await trpc.leadEnrichment.createList.mutate({
  name: "Q4 Prospects",
  description: "Fourth quarter lead generation campaign"
});

// 2. Upload leads
await trpc.leadEnrichment.uploadLeads.mutate({
  listId: list.id,
  leads: [
    {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      company: "Acme Corp"
    }
  ]
});

// 3. Start batch enrichment
const result = await trpc.leadEnrichment.enrichList.mutate({
  listId: list.id,
  batchSize: 5
});

console.log(`Enriched: ${result.enriched}, Failed: ${result.failed}`);
```

### Check Status

```typescript
const status = await trpc.leadEnrichment.getEnrichmentStatus.query({
  listId: list.id
});

console.log(`Progress: ${status.progress}%`);
console.log(`Status: ${status.status}`);
```

### Get Enriched Data

```typescript
const { leads } = await trpc.leadEnrichment.getLeads.query({
  listId: list.id,
  enrichmentStatus: "enriched"
});

leads.forEach(lead => {
  const enriched = lead.enrichedData;
  console.log(`${enriched.fullName} - ${enriched.title} at ${enriched.company}`);
  console.log(`Confidence: ${enriched.confidence}%`);
});
```

## Common Operations

### Enrich Single Lead

```typescript
const result = await trpc.leadEnrichment.enrichLead.mutate({
  leadId: 123
});
```

### Re-Enrich Failed Leads

```typescript
await trpc.leadEnrichment.reEnrichFailed.mutate({
  listId: list.id
});
```

### Check Credits

```typescript
const stats = await trpc.leadEnrichment.getEnrichmentStats.query();
console.log(`Available credits: ${stats.creditsAvailable}`);
```

### Export Data

```typescript
const { list, leads } = await trpc.leadEnrichment.exportLeads.query({
  listId: list.id
});

// Convert to CSV or JSON
const csv = leads.map(lead => ({
  ...lead.rawData,
  ...lead.enrichedData
}));
```

## API Endpoints Summary

### Lead Lists
- `createList` - Create new lead list
- `getLists` - Get all lists
- `getList` - Get single list
- `deleteList` - Delete list

### Leads
- `uploadLeads` - Upload leads to list
- `getLeads` - Get leads from list
- `exportLeads` - Export enriched leads

### Enrichment
- `enrichLead` - Enrich single lead
- `enrichList` - Batch enrich list
- `reEnrichFailed` - Retry failed leads

### Status & Analytics
- `getEnrichmentStatus` - Get list status
- `getEnrichmentHistory` - Get all enrichment history
- `getEnrichmentStats` - Get overall statistics
- `estimateEnrichmentCost` - Estimate credit cost
- `validateApifyConfig` - Check Apify setup

## Enriched Data Structure

```typescript
interface EnrichedLead {
  // Original data
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;

  // Enriched data
  fullName?: string;
  title?: string;
  location?: string;

  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };

  companyInfo?: {
    name?: string;
    domain?: string;
    industry?: string;
    size?: string;
    location?: string;
  };

  contactInfo?: {
    email?: string;
    phone?: string;
    mobilePhone?: string;
  };

  // Metadata
  enrichmentSource: "apify";
  enrichmentDate: Date;
  confidence: number; // 0-100
}
```

## Error Handling

```typescript
try {
  await trpc.leadEnrichment.enrichList.mutate({ listId });
} catch (error) {
  if (error.code === 'PRECONDITION_FAILED') {
    // Insufficient credits
    console.error('Not enough credits');
  } else if (error.code === 'NOT_FOUND') {
    // List not found
    console.error('List does not exist');
  } else {
    // Other errors
    console.error(error.message);
  }
}
```

## Cost Management

```typescript
// Check before enriching
const estimate = await trpc.leadEnrichment.estimateEnrichmentCost.query({
  leadCount: 100
});

const stats = await trpc.leadEnrichment.getEnrichmentStats.query();

if (stats.creditsAvailable >= estimate.estimatedCredits) {
  // Proceed with enrichment
  await trpc.leadEnrichment.enrichList.mutate({ listId });
} else {
  console.log('Insufficient credits. Need to purchase more.');
}
```

## Configuration Validation

```typescript
// Verify Apify is configured correctly
const config = await trpc.leadEnrichment.validateApifyConfig.query();

if (!config.valid) {
  console.error('Apify not configured:', config.message);
  // Show setup instructions to user
} else {
  console.log('Apify configured. Credits:', config.creditsBalance);
}
```

## Tips & Best Practices

1. **Batch Size**: Use 3-5 for optimal performance
2. **Data Quality**: Provide email or LinkedIn URL for best results
3. **Credit Management**: Check balance before large jobs
4. **Error Recovery**: Use `reEnrichFailed` to retry errors
5. **Monitoring**: Check `getEnrichmentStatus` for long-running jobs

## Troubleshooting

**Problem: "Apify API key not configured"**
- Solution: Add `APIFY_API_KEY` to `.env` file

**Problem: "Insufficient credits"**
- Solution: Add credits using `CreditService.addCredits()`

**Problem: Enrichment is slow**
- Solution: Reduce `batchSize` parameter

**Problem: Low confidence scores**
- Solution: Provide more initial lead data (email, LinkedIn, company)

## Next Steps

- Read full documentation: `LEAD_ENRICHMENT_APIFY.md`
- Configure Apify actors for your use case
- Set up credit packages for users
- Integrate with your UI/frontend
- Configure webhooks for notifications
