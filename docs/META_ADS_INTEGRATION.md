# Meta Ads Manager Integration

Complete implementation of Meta Ads analysis and automation using GPT-4 Vision and Browserbase.

## Overview

This integration provides:
- **AI-Powered Ad Analysis** using GPT-4 Vision to analyze ad screenshots
- **Ad Copy Generation** with multiple variations for A/B testing
- **Performance Recommendations** based on metrics and ad content
- **Browser Automation** via Browserbase/Stagehand for applying changes
- **Meta Graph API Integration** for fetching campaigns, ad sets, and metrics

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────┐
│                    Client Application                   │
│              (React + tRPC + TanStack Query)             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ tRPC API Calls
                   │
┌──────────────────▼──────────────────────────────────────┐
│              server/api/routers/ads.ts                   │
│                   (tRPC Router)                          │
│  - analyzeAdScreenshot                                   │
│  - getAdRecommendations                                  │
│  - generateAdCopy                                        │
│  - listAdAccounts / getAdCampaigns / getAdSets / getAds │
│  - getAdMetrics                                          │
│  - connectMetaAccount                                    │
│  - applyRecommendation                                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Service Layer
                   │
┌──────────────────▼──────────────────────────────────────┐
│            server/services/ads.service.ts                │
│                  (Business Logic)                        │
│                                                          │
│  ┌────────────────────────────────────────────┐        │
│  │ Vision Analysis (GPT-4 Vision)              │        │
│  │ - analyzeAdScreenshot()                     │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  ┌────────────────────────────────────────────┐        │
│  │ Copy Generation (GPT-4)                     │        │
│  │ - generateAdCopy()                          │        │
│  │ - getAdRecommendations()                    │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  ┌────────────────────────────────────────────┐        │
│  │ Meta Graph API                              │        │
│  │ - listAdAccounts()                          │        │
│  │ - getAdCampaigns()                          │        │
│  │ - getAdSets()                               │        │
│  │ - getAds()                                  │        │
│  │ - getAdMetrics()                            │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  ┌────────────────────────────────────────────┐        │
│  │ Browser Automation (Stagehand)              │        │
│  │ - applyRecommendation()                     │        │
│  └────────────────────────────────────────────┘        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Database Operations
                   │
┌──────────────────▼──────────────────────────────────────┐
│           drizzle/schema-meta-ads.ts                     │
│                 (Database Schema)                        │
│  - adAnalyses                                            │
│  - adRecommendations                                     │
│  - adCopyVariations                                      │
│  - adAutomationHistory                                   │
│  - metaAdAccounts                                        │
│  - metaCampaigns                                         │
│  - metaAdSets                                            │
│  - metaAds                                               │
└──────────────────────────────────────────────────────────┘
```

## Database Schema

### Ad Analyses
Stores GPT-4 Vision analysis results for ad screenshots.

```typescript
adAnalyses {
  id: serial
  userId: integer (ref: users.id)
  adId: varchar(128) // Meta ad ID (optional)
  screenshotUrl: text // URL to screenshot

  // Extracted metrics
  impressions: integer
  clicks: integer
  ctr: decimal(5,2)
  cpc: decimal(10,2)
  spend: decimal(10,2)
  conversions: integer
  roas: decimal(10,2)

  // Analysis results
  insights: jsonb // Array of insights
  suggestions: jsonb // Array of suggestions
  sentiment: varchar(20) // positive, neutral, negative
  confidence: decimal(3,2) // 0.00-1.00
  rawAnalysis: jsonb // Full GPT-4 response

  createdAt: timestamp
}
```

### Ad Recommendations
AI-generated recommendations for ad improvements.

```typescript
adRecommendations {
  id: serial
  userId: integer (ref: users.id)
  analysisId: integer (ref: adAnalyses.id)
  adId: varchar(128)

  type: varchar(50) // copy, targeting, budget, creative, schedule
  priority: varchar(20) // high, medium, low
  title: text
  description: text
  expectedImpact: text
  actionable: varchar(10) // true/false

  status: varchar(20) // pending, applied, dismissed, failed
  appliedAt: timestamp
  appliedBy: integer (ref: users.id)
  resultMetrics: jsonb

  createdAt: timestamp
  updatedAt: timestamp
}
```

### Ad Copy Variations
Generated ad copy variations for A/B testing.

```typescript
adCopyVariations {
  id: serial
  userId: integer (ref: users.id)
  originalAdId: varchar(128)

  headline: text
  primaryText: text
  description: text
  callToAction: varchar(50)
  reasoning: text

  variationNumber: integer
  targetAudience: text
  tone: varchar(50)
  objective: varchar(50)

  status: varchar(20) // draft, testing, active, archived
  testAdId: varchar(128) // Meta ad ID if created
  performanceMetrics: jsonb

  createdAt: timestamp
  updatedAt: timestamp
}
```

## API Endpoints

### Analysis Endpoints

#### `analyzeAdScreenshot`
Analyze ad screenshot using GPT-4 Vision.

```typescript
// Request
{
  screenshotUrl: string;  // URL to ad screenshot
  adId?: string;          // Optional Meta ad ID
}

// Response
{
  success: boolean;
  analysis?: {
    metrics: {
      impressions?: number;
      clicks?: number;
      ctr?: number;
      cpc?: number;
      spend?: number;
      conversions?: number;
      roas?: number;
    };
    insights: string[];
    suggestions: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
  };
  message?: string;
}
```

#### `getAdRecommendations`
Get AI-generated recommendations for ad improvements.

```typescript
// Request
{
  metrics: {
    impressions?: number;
    clicks?: number;
    ctr?: number;
    cpc?: number;
    spend?: number;
    conversions?: number;
    roas?: number;
  };
  adContent?: {
    headline?: string;
    primaryText?: string;
    description?: string;
    targetAudience?: string;
  };
  adId?: string;
}

// Response
{
  success: boolean;
  recommendations?: Array<{
    type: 'copy' | 'targeting' | 'budget' | 'creative' | 'schedule';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    expectedImpact: string;
    actionable: boolean;
  }>;
  message?: string;
}
```

#### `generateAdCopy`
Generate ad copy variations using LLM.

```typescript
// Request
{
  currentCopy: string;
  targetAudience?: string;
  tone?: string;
  objective?: string;
  variationCount?: number; // 1-10, default 5
  adId?: string;
}

// Response
{
  success: boolean;
  variations?: Array<{
    headline: string;
    primaryText: string;
    description?: string;
    callToAction?: string;
    reasoning: string;
  }>;
  message?: string;
}
```

### Ad Management Endpoints

#### `listAdAccounts`
List connected Meta ad accounts.

```typescript
// Response
{
  success: boolean;
  accounts: Array<{
    id: string;
    name: string;
    accountStatus: string;
    currency: string;
  }>;
  message?: string;
}
```

#### `getAdCampaigns`
Get campaigns from Meta.

```typescript
// Request
{
  adAccountId: string;
}

// Response
{
  success: boolean;
  campaigns: Array<{
    id: string;
    name: string;
    status: string;
    objective: string;
    dailyBudget?: number;
    lifetimeBudget?: number;
  }>;
  message?: string;
}
```

#### `getAdSets`
Get ad sets from Meta.

```typescript
// Request
{
  campaignId: string;
}

// Response
{
  success: boolean;
  adSets: Array<{
    id: string;
    name: string;
    status: string;
    campaignId: string;
    dailyBudget?: number;
    lifetimeBudget?: number;
    targetingDescription?: string;
  }>;
  message?: string;
}
```

#### `getAds`
Get individual ads from Meta.

```typescript
// Request
{
  adSetId: string;
}

// Response
{
  success: boolean;
  ads: Array<{
    id: string;
    name: string;
    status: string;
    adsetId: string;
    creative?: {
      headline?: string;
      primaryText?: string;
      imageUrl?: string;
      videoUrl?: string;
    };
  }>;
  message?: string;
}
```

#### `getAdMetrics`
Get ad performance metrics from Meta.

```typescript
// Request
{
  adId: string;
  dateRange?: {
    since: string; // YYYY-MM-DD
    until: string; // YYYY-MM-DD
  };
}

// Response
{
  success: boolean;
  metrics: {
    impressions?: number;
    clicks?: number;
    ctr?: number;
    cpc?: number;
    spend?: number;
    conversions?: number;
    roas?: number;
  };
  message?: string;
}
```

### Automation Endpoints

#### `connectMetaAccount`
Connect Meta account via OAuth.

```typescript
// Request
{
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

// Response
{
  success: boolean;
  message: string;
}
```

#### `applyRecommendation`
Apply recommendation via browser automation.

```typescript
// Request
{
  adId: string;
  changes: {
    headline?: string;
    primaryText?: string;
    description?: string;
  };
}

// Response
{
  success: boolean;
  message: string;
  sessionId?: string; // Browserbase session ID for manual login
}
```

## Setup Instructions

### 1. Environment Variables

Add to your `.env.local`:

```bash
# OpenAI API (for GPT-4 Vision and copy generation)
OPENAI_API_KEY=your-openai-api-key

# Meta Ads API
META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
META_REDIRECT_URI=http://localhost:3000/oauth/meta/callback

# Browserbase (for automation)
BROWSERBASE_API_KEY=your-browserbase-api-key
BROWSERBASE_PROJECT_ID=your-browserbase-project-id
```

### 2. Database Migration

Run the migration to create the Meta Ads tables:

```bash
pnpm db:generate
pnpm db:push
```

### 3. Meta App Setup

1. Go to [Meta for Developers](https://developers.facebook.com/apps)
2. Create a new app or use existing app
3. Add "Marketing API" product
4. Configure OAuth redirect URI
5. Get App ID and App Secret
6. Request required permissions:
   - `ads_management`
   - `ads_read`
   - `business_management`

### 4. Meta OAuth Flow

Implement OAuth callback handler:

```typescript
// server/api/routers/oauth.ts
export const oauthRouter = router({
  metaCallback: publicProcedure
    .input(z.object({
      code: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Exchange code for access token
      const response = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `client_id=${process.env.META_APP_ID}&` +
        `client_secret=${process.env.META_APP_SECRET}&` +
        `redirect_uri=${process.env.META_REDIRECT_URI}&` +
        `code=${input.code}`
      );

      const data = await response.json();

      // Store in database via adsService
      await adsService.connectMetaAccount(
        ctx.user.id,
        data.access_token,
        data.refresh_token,
        data.expires_in
      );

      return { success: true };
    }),
});
```

## Usage Examples

### Analyze Ad Screenshot

```typescript
import { trpc } from '@/lib/trpc';

function AnalyzeAd() {
  const analyze = trpc.ads.analyzeAdScreenshot.useMutation();

  const handleAnalyze = async (screenshotUrl: string) => {
    const result = await analyze.mutateAsync({
      screenshotUrl,
      adId: 'optional-ad-id',
    });

    if (result.success) {
      console.log('Metrics:', result.analysis.metrics);
      console.log('Insights:', result.analysis.insights);
      console.log('Suggestions:', result.analysis.suggestions);
    }
  };

  return <button onClick={() => handleAnalyze('https://...')}>
    Analyze Ad
  </button>;
}
```

### Generate Ad Copy Variations

```typescript
function GenerateCopy() {
  const generate = trpc.ads.generateAdCopy.useMutation();

  const handleGenerate = async () => {
    const result = await generate.mutateAsync({
      currentCopy: "Your current ad copy here",
      targetAudience: "Small business owners",
      tone: "Professional and friendly",
      objective: "conversions",
      variationCount: 5,
    });

    if (result.success) {
      result.variations.forEach((v, i) => {
        console.log(`Variation ${i + 1}:`);
        console.log('Headline:', v.headline);
        console.log('Primary Text:', v.primaryText);
        console.log('Reasoning:', v.reasoning);
      });
    }
  };

  return <button onClick={handleGenerate}>
    Generate Copy Variations
  </button>;
}
```

### Fetch Ad Campaigns

```typescript
function AdCampaigns({ adAccountId }: { adAccountId: string }) {
  const { data } = trpc.ads.getAdCampaigns.useQuery({
    adAccountId,
  });

  return (
    <div>
      {data?.campaigns.map(campaign => (
        <div key={campaign.id}>
          <h3>{campaign.name}</h3>
          <p>Status: {campaign.status}</p>
          <p>Objective: {campaign.objective}</p>
          {campaign.dailyBudget && (
            <p>Daily Budget: ${campaign.dailyBudget}</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Apply Recommendation with Automation

```typescript
function ApplyChanges() {
  const apply = trpc.ads.applyRecommendation.useMutation();

  const handleApply = async () => {
    const result = await apply.mutateAsync({
      adId: '123456789',
      changes: {
        headline: "New improved headline",
        primaryText: "New primary text that converts better",
      },
    });

    if (result.success) {
      console.log('Changes applied successfully!');
    } else if (result.sessionId) {
      // Manual login required
      console.log('Please log in to Meta Ads Manager');
      console.log('Session ID:', result.sessionId);
    }
  };

  return <button onClick={handleApply}>
    Apply Changes
  </button>;
}
```

## Testing

### Test Vision Analysis

```bash
# Test screenshot analysis
curl -X POST http://localhost:3000/api/trpc/ads.analyzeAdScreenshot \
  -H "Content-Type: application/json" \
  -d '{
    "screenshotUrl": "https://example.com/ad-screenshot.png",
    "adId": "123456789"
  }'
```

### Test Copy Generation

```bash
# Test copy generation
curl -X POST http://localhost:3000/api/trpc/ads.generateAdCopy \
  -H "Content-Type: application/json" \
  -d '{
    "currentCopy": "Buy now and save 20%!",
    "targetAudience": "Small business owners",
    "tone": "Professional",
    "variationCount": 3
  }'
```

## Best Practices

### 1. Screenshot Analysis
- Use high-resolution screenshots (minimum 1920x1080)
- Include full ad metrics panel in the screenshot
- Ensure text is clearly readable
- Capture both creative and performance metrics

### 2. Copy Generation
- Provide detailed target audience information
- Specify clear objectives (awareness, conversions, engagement)
- Test multiple variations (5-7 recommended)
- A/B test variations systematically

### 3. Browser Automation
- Always test automation in development first
- Handle manual login gracefully (provide session URL)
- Monitor automation jobs in the `jobs` table
- Set appropriate timeouts for long-running operations

### 4. Meta API Integration
- Implement token refresh logic for long-lived tokens
- Cache ad account/campaign data to reduce API calls
- Respect Meta API rate limits
- Handle API errors gracefully with retry logic

## Troubleshooting

### GPT-4 Vision Not Working
- Verify `OPENAI_API_KEY` is set correctly
- Check that you have GPT-4 Vision API access
- Ensure screenshot URL is publicly accessible
- Review OpenAI API logs for errors

### Meta API Errors
- Verify access token is valid and not expired
- Check required permissions are granted
- Ensure ad account ID format is correct (act_123456789)
- Review Meta API error responses

### Browser Automation Failing
- Check Browserbase credentials
- Verify session is created successfully
- Review debug URL for session playback
- Check if manual login is required

### Database Errors
- Run migrations: `pnpm db:push`
- Verify database connection
- Check for schema conflicts
- Review database logs

## Future Enhancements

1. **Advanced Analytics**
   - Historical trend analysis
   - Competitor benchmarking
   - Predictive performance modeling

2. **Automated A/B Testing**
   - Automatic variation creation
   - Performance monitoring
   - Winner selection and scaling

3. **Multi-Platform Support**
   - Google Ads integration
   - TikTok Ads support
   - LinkedIn Ads support

4. **Enhanced Automation**
   - Budget optimization
   - Bid strategy adjustments
   - Automated pause/resume based on performance

5. **Reporting**
   - Custom dashboard templates
   - Automated performance reports
   - Client-facing reports

## Support

For issues or questions:
- Check the troubleshooting section above
- Review server logs for detailed error messages
- Consult Meta Marketing API documentation
- Test with Meta Graph API Explorer

## License

Internal use only.
