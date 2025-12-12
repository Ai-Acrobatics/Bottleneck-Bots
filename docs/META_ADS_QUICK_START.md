# Meta Ads Manager - Quick Start Guide

## 5-Minute Setup

### 1. Configure Environment (2 min)

Add to `.env.local`:

```bash
# Required
OPENAI_API_KEY=sk-proj-...
META_APP_ID=123456789
META_APP_SECRET=abc123def456...

# Already configured
BROWSERBASE_API_KEY=...
BROWSERBASE_PROJECT_ID=...
```

### 2. Run Migration (1 min)

```bash
pnpm db:push
```

### 3. Test Integration (2 min)

```typescript
// Test Vision Analysis
const result = await trpc.ads.analyzeAdScreenshot.mutate({
  screenshotUrl: "https://example.com/screenshot.png",
});

console.log(result.analysis.metrics); // { ctr: 2.5, cpc: 0.45, ... }
console.log(result.analysis.insights); // ["Strong headline...", ...]
console.log(result.analysis.suggestions); // ["Test headline variation...", ...]
```

## Common Use Cases

### Analyze Ad Performance

```typescript
const analyze = trpc.ads.analyzeAdScreenshot.useMutation();

// Upload screenshot and analyze
const { analysis } = await analyze.mutateAsync({
  screenshotUrl: uploadedImageUrl,
  adId: "123456789", // optional
});

// Results stored in database automatically
console.log(analysis.metrics.roas); // 3.2
console.log(analysis.sentiment); // "positive"
console.log(analysis.suggestions); // Array of improvements
```

### Generate Copy Variations

```typescript
const generate = trpc.ads.generateAdCopy.useMutation();

const { variations } = await generate.mutateAsync({
  currentCopy: "Limited time offer - 50% off!",
  targetAudience: "Busy professionals aged 25-45",
  tone: "Urgent and professional",
  objective: "conversions",
  variationCount: 5,
});

variations.forEach(v => {
  console.log(v.headline);
  console.log(v.primaryText);
  console.log(v.reasoning);
});
```

### Get AI Recommendations

```typescript
const recommend = trpc.ads.getAdRecommendations.useMutation();

const { recommendations } = await recommend.mutateAsync({
  metrics: {
    ctr: 1.2,
    cpc: 2.5,
    roas: 1.8,
    spend: 500,
  },
  adContent: {
    headline: "Current headline",
    primaryText: "Current ad copy",
    targetAudience: "Small business owners",
  },
});

recommendations.forEach(rec => {
  console.log(`[${rec.priority}] ${rec.title}`);
  console.log(rec.description);
  console.log(`Expected: ${rec.expectedImpact}`);
});
```

### Fetch Ad Data from Meta

```typescript
// List ad accounts
const { accounts } = await trpc.ads.listAdAccounts.useQuery();

// Get campaigns
const { campaigns } = await trpc.ads.getAdCampaigns.useQuery({
  adAccountId: accounts[0].id,
});

// Get ad sets
const { adSets } = await trpc.ads.getAdSets.useQuery({
  campaignId: campaigns[0].id,
});

// Get ads
const { ads } = await trpc.ads.getAds.useQuery({
  adSetId: adSets[0].id,
});

// Get metrics
const { metrics } = await trpc.ads.getAdMetrics.useQuery({
  adId: ads[0].id,
  dateRange: {
    since: "2025-12-01",
    until: "2025-12-11",
  },
});
```

### Apply Changes via Automation

```typescript
const apply = trpc.ads.applyRecommendation.useMutation();

const result = await apply.mutateAsync({
  adId: "123456789",
  changes: {
    headline: "New AI-optimized headline",
    primaryText: "Improved copy from GPT-4",
  },
});

if (result.success) {
  console.log("Changes applied!");
} else if (result.sessionId) {
  console.log("Manual login required");
  console.log("Session URL:", result.sessionId);
}
```

## Frontend Components Example

### Ad Analysis Dashboard

```typescript
import { trpc } from '@/lib/trpc';
import { useState } from 'react';

export function AdAnalysisDashboard() {
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const analyze = trpc.ads.analyzeAdScreenshot.useMutation();

  const handleAnalyze = async () => {
    const result = await analyze.mutateAsync({ screenshotUrl });

    if (result.success) {
      alert(`Analysis complete!
        CTR: ${result.analysis.metrics.ctr}%
        CPC: $${result.analysis.metrics.cpc}
        ROAS: ${result.analysis.metrics.roas}x
      `);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={screenshotUrl}
        onChange={(e) => setScreenshotUrl(e.target.value)}
        placeholder="Enter screenshot URL"
      />
      <button onClick={handleAnalyze} disabled={analyze.isLoading}>
        {analyze.isLoading ? 'Analyzing...' : 'Analyze Ad'}
      </button>

      {analyze.data?.analysis && (
        <div>
          <h3>Metrics</h3>
          <pre>{JSON.stringify(analyze.data.analysis.metrics, null, 2)}</pre>

          <h3>Insights</h3>
          <ul>
            {analyze.data.analysis.insights.map((insight, i) => (
              <li key={i}>{insight}</li>
            ))}
          </ul>

          <h3>Suggestions</h3>
          <ul>
            {analyze.data.analysis.suggestions.map((suggestion, i) => (
              <li key={i}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Copy Generator Component

```typescript
export function AdCopyGenerator() {
  const [currentCopy, setCurrentCopy] = useState('');
  const generate = trpc.ads.generateAdCopy.useMutation();

  const handleGenerate = async () => {
    const result = await generate.mutateAsync({
      currentCopy,
      targetAudience: "Small business owners",
      tone: "Professional and friendly",
      variationCount: 5,
    });

    console.log('Generated variations:', result.variations);
  };

  return (
    <div>
      <textarea
        value={currentCopy}
        onChange={(e) => setCurrentCopy(e.target.value)}
        placeholder="Enter current ad copy"
      />
      <button onClick={handleGenerate} disabled={generate.isLoading}>
        {generate.isLoading ? 'Generating...' : 'Generate Variations'}
      </button>

      {generate.data?.variations && (
        <div>
          {generate.data.variations.map((v, i) => (
            <div key={i} style={{ border: '1px solid #ccc', padding: 10, margin: 10 }}>
              <h4>Variation {i + 1}</h4>
              <p><strong>Headline:</strong> {v.headline}</p>
              <p><strong>Primary Text:</strong> {v.primaryText}</p>
              <p><strong>CTA:</strong> {v.callToAction}</p>
              <p><em>Strategy: {v.reasoning}</em></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Campaign Browser Component

```typescript
export function CampaignBrowser() {
  const { data: accounts } = trpc.ads.listAdAccounts.useQuery();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const { data: campaigns } = trpc.ads.getAdCampaigns.useQuery(
    { adAccountId: selectedAccount! },
    { enabled: !!selectedAccount }
  );

  return (
    <div>
      <h3>Select Ad Account</h3>
      <select onChange={(e) => setSelectedAccount(e.target.value)}>
        <option value="">Select account...</option>
        {accounts?.accounts.map(acc => (
          <option key={acc.id} value={acc.id}>{acc.name}</option>
        ))}
      </select>

      {campaigns && (
        <div>
          <h3>Campaigns</h3>
          {campaigns.campaigns.map(c => (
            <div key={c.id}>
              <h4>{c.name}</h4>
              <p>Status: {c.status}</p>
              <p>Objective: {c.objective}</p>
              {c.dailyBudget && <p>Daily Budget: ${c.dailyBudget}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## API Response Examples

### Analysis Response

```json
{
  "success": true,
  "analysis": {
    "metrics": {
      "impressions": 15420,
      "clicks": 387,
      "ctr": 2.51,
      "cpc": 0.45,
      "spend": 174.15,
      "conversions": 23,
      "roas": 3.2
    },
    "insights": [
      "Strong click-through rate at 2.51% (above 2% benchmark)",
      "Cost per click is competitive at $0.45",
      "ROAS of 3.2x indicates profitable campaign",
      "Conversion rate of 5.9% is excellent"
    ],
    "suggestions": [
      "Test headline variations emphasizing value proposition",
      "Consider expanding audience to similar demographics",
      "Increase budget by 20% to scale successful campaign",
      "Test video creative to potentially improve engagement"
    ],
    "sentiment": "positive",
    "confidence": 0.92
  }
}
```

### Recommendations Response

```json
{
  "success": true,
  "recommendations": [
    {
      "type": "copy",
      "priority": "high",
      "title": "Test Headline Variations",
      "description": "Create 3-5 headline variations focusing on specific benefits...",
      "expectedImpact": "10-15% CTR increase",
      "actionable": true
    },
    {
      "type": "budget",
      "priority": "high",
      "title": "Scale Successful Campaign",
      "description": "Increase daily budget by 20% given strong ROAS...",
      "expectedImpact": "20% more conversions at similar ROAS",
      "actionable": true
    },
    {
      "type": "creative",
      "priority": "medium",
      "title": "Test Video Creative",
      "description": "Video ads often get 2-3x engagement...",
      "expectedImpact": "2x engagement increase",
      "actionable": true
    }
  ]
}
```

### Copy Variations Response

```json
{
  "success": true,
  "variations": [
    {
      "headline": "Save 50% Today Only",
      "primaryText": "Limited time offer for serious business owners...",
      "description": "Don't miss out",
      "callToAction": "Shop Now",
      "reasoning": "Uses urgency and scarcity to drive immediate action"
    },
    {
      "headline": "Trusted by 10,000+ Businesses",
      "primaryText": "Join thousands of successful companies...",
      "description": "See why they chose us",
      "callToAction": "Learn More",
      "reasoning": "Leverages social proof to build credibility"
    }
  ]
}
```

## Troubleshooting

### OpenAI API Errors

```typescript
// Error: Insufficient quota
// Solution: Check OpenAI billing and add credits

// Error: Invalid API key
// Solution: Verify OPENAI_API_KEY in .env.local
```

### Meta API Errors

```typescript
// Error: "Meta account not connected"
// Solution: Connect Meta account first via OAuth

// Error: "Access token expired"
// Solution: Implement token refresh (TODO)

// Error: "Invalid ad account ID"
// Solution: Use format "act_123456789"
```

### Database Errors

```typescript
// Error: Table doesn't exist
// Solution: Run pnpm db:push

// Error: Column doesn't exist
// Solution: Re-run migration
```

## Performance Tips

1. **Cache Meta API responses** - Store campaigns/ad sets in database
2. **Batch analysis requests** - Analyze multiple ads together
3. **Use webhooks** - Subscribe to Meta webhook events for real-time updates
4. **Implement rate limiting** - Prevent excessive API calls
5. **Queue automation jobs** - Use BullMQ for long-running automations

## Cost Estimates

| Feature | Cost per Request | Monthly (1000 req) |
|---------|-----------------|-------------------|
| Screenshot Analysis | $0.01-0.03 | $10-30 |
| Copy Generation | $0.03-0.06 | $30-60 |
| Recommendations | $0.02-0.04 | $20-40 |
| Browser Automation | $0.02-0.05 | $20-50 |
| **Total** | **$0.08-0.18** | **$80-180** |

Meta API calls are free (within rate limits).

## Support

- **Documentation:** `/docs/META_ADS_INTEGRATION.md`
- **API Reference:** See tRPC router
- **Issues:** Check server logs for detailed errors
