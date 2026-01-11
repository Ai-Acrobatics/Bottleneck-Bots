# PRD: Meta Ads Manager

## Overview
The Meta Ads Manager integrates Facebook and Instagram advertising capabilities into Bottleneck-Bots, enabling AI-powered ad analysis, performance tracking, and campaign optimization. It uses GPT-4 Vision to analyze ad creatives, extracts performance metrics, generates AI-driven recommendations, creates optimized ad copy, and automates campaign management.

## Problem Statement
Managing Meta (Facebook/Instagram) advertising effectively is challenging:
- Analyzing ad creative performance requires manual review
- Performance metrics are scattered across multiple dashboards
- Optimization decisions rely on intuition rather than data
- Ad copy creation is time-consuming and inconsistent
- Scaling campaigns across multiple accounts is complex
- Real-time performance monitoring is difficult

## Goals & Objectives

### Primary Goals
- Automate ad creative analysis using AI vision capabilities
- Centralize performance metrics across accounts
- Generate data-driven optimization recommendations
- Accelerate ad copy creation with AI assistance
- Enable automated campaign management and optimization

### Success Metrics
- Ad analysis accuracy: >90%
- Recommendation adoption rate: >50%
- ROAS improvement: >20% for optimized campaigns
- Ad copy generation time: <30 seconds
- Campaign automation coverage: >70%

## User Stories

### Agency Owner
- As an agency owner, I want to manage multiple client ad accounts from one dashboard so that I can scale my operations
- As an agency owner, I want AI to analyze why certain ads perform better so that I can apply learnings across clients

### Media Buyer
- As a media buyer, I want to see ad screenshots with performance overlay so that I can quickly identify winners and losers
- As a media buyer, I want AI-generated ad copy variations so that I can test more creative concepts faster

### Marketing Manager
- As a marketing manager, I want automated recommendations for budget allocation so that I spend money more effectively
- As a marketing manager, I want alerts when ad performance drops so that I can react quickly

### Creative Director
- As a creative director, I want AI analysis of what elements make ads successful so that I can brief my team better
- As a creative director, I want to compare competitor ad creatives so that I can find inspiration

## Functional Requirements

### Must Have (P0)

1. **Meta API Integration**
   - Facebook Marketing API connection
   - OAuth authentication flow
   - Multi-account management
   - Ad account selection
   - API rate limit handling
   - Token refresh management

2. **Ad Screenshot Analysis (GPT-4 Vision)**
   - Automatic ad creative capture
   - Visual element identification
   - Text extraction from images
   - Brand color analysis
   - Creative format detection
   - A/B test visual comparison
   - Performance correlation analysis

3. **Performance Metrics Extraction**
   - Impressions and reach
   - Click-through rate (CTR)
   - Cost per click (CPC)
   - Cost per mille (CPM)
   - Cost per acquisition (CPA)
   - Return on ad spend (ROAS)
   - Conversion metrics
   - Audience insights
   - Placement breakdown

4. **AI Recommendations Engine**
   - Budget reallocation suggestions
   - Audience targeting improvements
   - Creative optimization tips
   - Bid strategy recommendations
   - Schedule optimization
   - Ad fatigue detection
   - Scaling opportunities

5. **Ad Copy Generation**
   - Primary text generation
   - Headline variations
   - Description options
   - Call-to-action suggestions
   - Tone and style matching
   - Character limit compliance
   - Multi-language support
   - A/B test copy sets

6. **Campaign Dashboard**
   - Account performance overview
   - Campaign comparison view
   - Ad set performance table
   - Ad-level metrics grid
   - Time-series charts
   - Budget pacing tracker
   - Goal progress visualization

### Should Have (P1)

1. **Campaign Automation**
   - Automated budget adjustment
   - Rule-based optimizations
   - Pause underperforming ads
   - Scale winning ads
   - Dayparting automation
   - Audience expansion triggers
   - Creative rotation

2. **Competitor Analysis**
   - Facebook Ad Library integration
   - Competitor ad tracking
   - Creative trend analysis
   - Spending estimation
   - New ad alerts
   - Industry benchmarking

3. **Creative Library**
   - Asset organization
   - Performance tagging
   - Template management
   - Version history
   - Cross-account sharing
   - Usage tracking

### Nice to Have (P2)

1. **Predictive Analytics**
   - Performance forecasting
   - Budget optimization modeling
   - Audience saturation prediction
   - Seasonal trend analysis
   - Campaign outcome simulation

2. **Creative Testing Framework**
   - Automated A/B test setup
   - Statistical significance tracking
   - Winner auto-promotion
   - Test result documentation
   - Learning database

3. **Video Analysis**
   - Video hook analysis
   - Scene breakdown
   - Retention curve correlation
   - Thumbnail optimization
   - Audio analysis

## Non-Functional Requirements

### Performance
- Dashboard load: <3 seconds
- Ad analysis: <10 seconds per ad
- Copy generation: <30 seconds
- Metrics sync: Every 15 minutes
- Screenshot capture: <5 seconds
- Recommendation refresh: Hourly

### Security
- OAuth token encryption
- Account-level access control
- Audit logging for changes
- PII handling compliance
- Data retention policies
- SOC 2 compliance

### Scalability
- 100+ ad accounts per user
- 10,000+ ads analyzed per day
- Real-time metric updates
- Parallel screenshot processing
- Distributed analysis workers

### Reliability
- 99.9% dashboard uptime
- Retry logic for API failures
- Metric consistency checks
- Analysis job queuing
- Graceful degradation

## Technical Requirements

### Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Ads Dashboard │────▶│  Ads API         │────▶│  PostgreSQL     │
│   (React)       │◀────│  (Next.js)       │◀────│  (Campaigns)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │  Meta      │   │  GPT-4     │   │  Screenshot│
       │  Marketing │   │  Vision    │   │  Service   │
       │  API       │   │  Analysis  │   │            │
       └────────────┘   └────────────┘   └────────────┘
              │                │                │
              ▼                ▼                ▼
       ┌────────────────────────────────────────────┐
       │           Recommendation Engine            │
       │  - Budget allocation                       │
       │  - Targeting suggestions                   │
       │  - Creative insights                       │
       └────────────────────────────────────────────┘
                               │
                               ▼
                        ┌────────────┐
                        │   Redis    │
                        │   (Cache)  │
                        └────────────┘
```

### Dependencies
- **External Services**
  - Facebook Marketing API
  - OpenAI GPT-4 Vision API
  - Browserbase (screenshots)
  - Facebook Ad Library API

- **Internal Services**
  - Browser automation system
  - AI orchestration layer
  - Storage service (S3)
  - Notification service

### API Specifications

#### Connect Ad Account
```typescript
POST /api/meta/accounts/connect
Request:
{
  accessToken: string; // from OAuth flow
}
Response:
{
  accounts: {
    id: string;
    name: string;
    currency: string;
    timezone: string;
    status: 'active' | 'disabled';
  }[];
}
```

#### Get Campaign Performance
```typescript
GET /api/meta/accounts/{accountId}/campaigns
Query:
{
  dateRange: {
    start: string;
    end: string;
  };
  status?: 'active' | 'paused' | 'all';
  metrics?: string[];
}
Response:
{
  campaigns: {
    id: string;
    name: string;
    status: string;
    objective: string;
    budget: {
      type: 'daily' | 'lifetime';
      amount: number;
      spent: number;
    };
    metrics: {
      impressions: number;
      reach: number;
      clicks: number;
      ctr: number;
      cpc: number;
      cpm: number;
      conversions: number;
      cpa: number;
      roas: number;
      spend: number;
    };
    dateBreakdown?: MetricsByDate[];
  }[];
  summary: SummaryMetrics;
}
```

#### Analyze Ad Creative
```typescript
POST /api/meta/ads/{adId}/analyze
Request:
{
  includeScreenshot: boolean;
  analysisTypes: ('visual' | 'copy' | 'performance' | 'comparison')[];
}
Response:
{
  adId: string;
  screenshot: {
    url: string;
    capturedAt: string;
  };
  visualAnalysis: {
    format: string;
    dominantColors: string[];
    hasText: boolean;
    textContent?: string;
    hasFaces: boolean;
    hasLogo: boolean;
    composition: string;
    creativeTips: string[];
  };
  copyAnalysis: {
    primaryText: string;
    headline: string;
    description?: string;
    cta: string;
    sentiment: string;
    readabilityScore: number;
    improvements: string[];
  };
  performanceInsights: {
    performanceScore: number; // 0-100
    strengths: string[];
    weaknesses: string[];
    benchmarkComparison: {
      ctr: { value: number; benchmark: number; status: string };
      cpc: { value: number; benchmark: number; status: string };
      cpm: { value: number; benchmark: number; status: string };
    };
  };
}
```

#### Generate Ad Recommendations
```typescript
POST /api/meta/accounts/{accountId}/recommendations
Request:
{
  scope: 'account' | 'campaign' | 'adset' | 'ad';
  targetId?: string;
  categories?: ('budget' | 'targeting' | 'creative' | 'bidding')[];
}
Response:
{
  recommendations: {
    id: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: {
      metric: string;
      estimatedChange: string;
      confidence: number;
    };
    action: {
      type: string;
      parameters: Record<string, any>;
    };
    appliedAt?: string;
  }[];
  lastAnalyzedAt: string;
}
```

#### Generate Ad Copy
```typescript
POST /api/meta/copy/generate
Request:
{
  product: {
    name: string;
    description: string;
    features: string[];
    targetAudience: string;
  };
  style: {
    tone: 'professional' | 'casual' | 'urgent' | 'friendly';
    length: 'short' | 'medium' | 'long';
    includeEmojis: boolean;
  };
  variations: number;
  existingCopy?: string; // for improvement
}
Response:
{
  variations: {
    primaryText: string;
    headline: string;
    description: string;
    suggestedCta: string;
    estimatedCtr?: number;
  }[];
  bestPractices: string[];
}
```

#### Apply Automation Rule
```typescript
POST /api/meta/automation/rules
Request:
{
  accountId: string;
  name: string;
  scope: 'campaign' | 'adset' | 'ad';
  conditions: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    value: number;
    timeframe: string;
  }[];
  action: {
    type: 'pause' | 'enable' | 'adjust_budget' | 'adjust_bid' | 'notify';
    parameters: Record<string, any>;
  };
  schedule: {
    frequency: 'hourly' | 'daily' | 'weekly';
    timezone: string;
  };
}
Response:
{
  ruleId: string;
  status: 'active';
  nextEvaluation: string;
}
```

## Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Ad Analysis Accuracy | >90% | Manual validation sampling |
| Recommendation Adoption | >50% | Applied / Generated recommendations |
| ROAS Improvement | >20% | Before/after comparison |
| Copy Generation Time | <30s | API response time |
| Automation Coverage | >70% | Automated / Total optimizations |
| Dashboard Load Time | <3s | Performance monitoring |
| User Satisfaction | >4.5/5 | In-app surveys |

## Dependencies

### Internal Dependencies
- AI Agent Orchestration (for GPT-4 Vision)
- Browser Automation (for screenshots)
- Storage service (for creatives)
- Notification service (for alerts)

### External Dependencies
- Facebook Marketing API
- OpenAI GPT-4 Vision API
- Facebook Ad Library API
- Browserbase (screenshots)

### Blocking Dependencies
- Facebook Marketing API access
- OpenAI API access with Vision
- OAuth app approval

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Meta API rate limits | High | High | Request batching, caching, exponential backoff |
| GPT-4 Vision costs | High | High | Selective analysis, caching, usage quotas |
| API policy changes | High | Medium | Abstraction layer, version monitoring |
| Inaccurate recommendations | Medium | Medium | Confidence scores, A/B testing, user feedback |
| Screenshot blocking | Medium | Medium | Multiple capture methods, fallback to API data |
| Automation errors | High | Low | Dry run mode, limits, approval workflows |
| Data freshness | Medium | Medium | Real-time sync options, last-updated indicators |

## Timeline & Milestones

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Meta Integration | 3 weeks | OAuth, API client, account management |
| Phase 2: Metrics Dashboard | 3 weeks | Performance display, filtering, charts |
| Phase 3: Ad Analysis | 3 weeks | GPT-4 Vision integration, visual analysis |
| Phase 4: Recommendations | 2 weeks | Recommendation engine, action buttons |
| Phase 5: Copy Generation | 2 weeks | AI copy writer, variations, templates |
| Phase 6: Automation | 3 weeks | Rules engine, automated actions |
| Phase 7: Testing | 2 weeks | Integration testing, accuracy validation |

## Open Questions
1. Should we support Google Ads alongside Meta?
2. What is the maximum number of ad accounts per user?
3. How do we handle automated budget increases (safety limits)?
4. Should we store historical ad creatives for trend analysis?
5. How do we handle multi-currency accounts in reporting?
