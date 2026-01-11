# PRD-009: Ad Manager

**Document Version:** 1.0
**Status:** Draft
**Author:** Development Team
**Last Updated:** January 11, 2026
**Feature Location:** `server/api/routers/ads.ts`, `server/services/ads.service.ts`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Stories](#4-user-stories)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Technical Architecture](#7-technical-architecture)
8. [Dependencies](#8-dependencies)
9. [Out of Scope](#9-out-of-scope)
10. [Risks & Mitigations](#10-risks--mitigations)
11. [Milestones & Timeline](#11-milestones--timeline)
12. [Acceptance Criteria](#12-acceptance-criteria)

---

## 1. Overview

The Ad Manager feature provides AI-powered Meta Ads analysis and optimization capabilities for marketing agencies and businesses. Using GPT-4 Vision for screenshot analysis, the system extracts ad performance metrics, generates actionable recommendations, creates optimized ad copy variations, and enables browser-based automation to apply changes directly in Meta Ads Manager.

### 1.1 Feature Summary

- **Screenshot Analysis with GPT-4 Vision**: Upload ad screenshots for AI-powered metric extraction and performance analysis
- **Performance Metrics Extraction**: Automatically identify impressions, clicks, CTR, CPC, spend, conversions, and ROAS from screenshots
- **AI-Powered Recommendations**: Generate data-driven suggestions for copy, targeting, budget, creative, and scheduling improvements
- **Ad Copy Variation Generation**: Create multiple A/B test variations with different tones, angles, and objectives
- **Browser Automation**: Apply recommendations directly to Meta Ads Manager via Stagehand/Browserbase integration
- **Automation History Tracking**: Complete audit trail of all automated changes with session recordings
- **Meta API Integration**: Direct access to Meta Graph API for real-time campaign, ad set, and ad data

### 1.2 Target Users

- Marketing Agencies managing multiple client ad accounts
- E-commerce Business Owners running Meta advertising campaigns
- Performance Marketers optimizing ad spend and ROAS
- Creative Teams generating and testing ad copy variations
- Media Buyers seeking AI-assisted optimization insights

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Manual Performance Analysis**: Marketers spend hours manually reviewing ad dashboards and screenshots to identify trends
2. **Inconsistent Optimization**: Ad optimization depends heavily on individual expertise, leading to inconsistent results
3. **Slow Iteration Cycles**: Creating and testing ad copy variations is time-consuming and limits experimentation
4. **Limited AI Integration**: Existing tools don't leverage vision AI for screenshot analysis or LLMs for copy generation
5. **Manual Change Application**: Applying optimizations requires tedious manual work in Meta Ads Manager
6. **Poor Audit Trails**: Difficult to track what changes were made, when, and their impact on performance

### 2.2 User Pain Points

- "I spend 3+ hours daily just reviewing ad performance across client accounts"
- "I know my ads need better copy, but I don't have time to brainstorm variations"
- "When a team member makes changes, I have no record of what was modified"
- "I can see metrics in screenshots but extracting them for analysis is tedious"
- "Applying recommendations across dozens of ads takes forever"

### 2.3 Business Impact

| Problem | Impact |
|---------|--------|
| Manual ad analysis | 15+ hours/week per marketer on performance review |
| Suboptimal ad copy | 20-40% lower CTR vs. optimized variants |
| Slow optimization cycles | $5K-50K monthly wasted ad spend per account |
| No automation audit trail | Compliance risks and inability to measure change impact |
| Fragmented tool ecosystem | $500+/month on multiple point solutions |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Description | Priority |
|------|-------------|----------|
| **G1** | Enable AI-powered screenshot analysis with 85%+ accuracy | P0 |
| **G2** | Generate actionable ad recommendations with measurable impact | P0 |
| **G3** | Automate ad copy generation with high-converting variations | P1 |
| **G4** | Provide browser automation for direct Meta Ads changes | P1 |
| **G5** | Track all automation actions with complete audit history | P1 |
| **G6** | Integrate seamlessly with Meta Graph API for real-time data | P2 |

### 3.2 Success Metrics (KPIs)

#### Analysis Quality Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Screenshot Analysis Accuracy | >= 85% | Manual validation of extracted metrics |
| Recommendation Relevance Score | >= 4.0/5.0 | User feedback ratings |
| Metric Extraction Completeness | >= 90% | Fields extracted / fields visible |
| Analysis Response Time | < 10 seconds | API latency measurement |

#### Optimization Impact Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| CTR Improvement from Recommendations | >= 15% | A/B test performance delta |
| ROAS Improvement | >= 10% | Before/after comparison |
| Successful Copy Variations | >= 80% | Variations meeting quality threshold |
| Recommendation Implementation Rate | >= 60% | Applied / Total recommendations |

#### User Experience Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Time Saved per Analysis | >= 30 minutes | User surveys |
| Feature Adoption Rate | >= 70% | Active users / Total users |
| Automation Success Rate | >= 85% | Successful / Total automation attempts |
| User Satisfaction (NPS) | >= 45 | Net Promoter Score survey |

#### Business Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Ad Accounts Connected | 500+ in 6 months | Integration count |
| Screenshots Analyzed Monthly | 10,000+ | API usage logs |
| Copy Variations Generated | 50,000+ monthly | Generation count |
| Automation Actions Executed | 5,000+ monthly | Automation logs |

---

## 4. User Stories

### 4.1 Core User Stories

#### US-001: Screenshot Performance Analysis
**As a** marketing manager
**I want to** upload an ad screenshot and get instant performance analysis
**So that** I can quickly understand how my ads are performing without manual data entry

**Acceptance Criteria:**
- User can upload screenshot via URL
- GPT-4 Vision extracts visible metrics (impressions, clicks, CTR, CPC, spend, conversions, ROAS)
- Analysis includes qualitative insights and improvement suggestions
- Sentiment assessment indicates overall ad health
- Confidence score reflects analysis reliability
- Results are persisted for historical tracking

#### US-002: AI-Powered Recommendations
**As a** performance marketer
**I want to** receive prioritized recommendations based on my ad metrics
**So that** I can focus on the highest-impact optimizations first

**Acceptance Criteria:**
- Recommendations are categorized (copy, targeting, budget, creative, schedule)
- Each recommendation has priority level (high, medium, low)
- Clear title and detailed description provided
- Expected impact is quantified or qualified
- Actionable flag indicates immediate implementability
- Recommendations are stored for tracking implementation

#### US-003: Ad Copy Variation Generation
**As a** creative director
**I want to** generate multiple ad copy variations from existing copy
**So that** I can run A/B tests without spending hours on copywriting

**Acceptance Criteria:**
- User inputs current copy and optional parameters (audience, tone, objective)
- System generates 1-10 variations (configurable)
- Each variation includes headline, primary text, description, and CTA
- Reasoning explains the strategic angle of each variation
- Variations use distinct approaches (emotional, logical, urgency, social proof)
- All variations stored for selection and testing

#### US-004: Meta Account Connection
**As an** agency owner
**I want to** connect client Meta ad accounts via OAuth
**So that** I can access their campaign data and apply optimizations

**Acceptance Criteria:**
- OAuth flow securely stores access and refresh tokens
- Token expiration is tracked and handled
- Connected accounts are listed for selection
- Integration status is clearly displayed
- Disconnection option available

#### US-005: Browser-Based Automation
**As a** media buyer
**I want to** apply recommended changes directly to Meta Ads Manager
**So that** I don't have to manually copy-paste optimizations

**Acceptance Criteria:**
- User can trigger automation for specific recommendations
- Browserbase session is created with proper credentials
- Stagehand navigates to correct ad in Ads Manager
- Changes are applied (headline, primary text, description)
- Session recording is saved for audit
- Success/failure status is reported with details

### 4.2 Advanced User Stories

#### US-006: Campaign Performance Dashboard
**As a** marketing analyst
**I want to** view aggregated campaign performance from Meta API
**So that** I can monitor all campaigns in one place

**Acceptance Criteria:**
- User can list all connected ad accounts
- Campaigns, ad sets, and ads are hierarchically navigable
- Performance metrics are fetched with configurable date ranges
- Data refreshes on demand or automatically
- Export options for reporting

#### US-007: Automation History Review
**As an** account manager
**I want to** review all automation actions taken on client accounts
**So that** I can audit changes and measure their impact

**Acceptance Criteria:**
- Complete log of all automation actions
- Filter by account, campaign, date range, action type
- Each entry shows: what changed, when, who triggered, result
- Session recordings accessible when available
- Performance metrics before/after (when tracked)

#### US-008: Bulk Analysis Mode
**As a** large agency operator
**I want to** analyze multiple ads in batch
**So that** I can efficiently review entire campaigns

**Acceptance Criteria:**
- Upload multiple screenshots at once
- Parallel processing with progress indication
- Aggregated insights across all analyzed ads
- Individual results accessible
- Batch recommendations generated

#### US-009: Copy Performance Tracking
**As a** data-driven marketer
**I want to** track performance of generated copy variations
**So that** I can learn which styles work best for my audience

**Acceptance Criteria:**
- Variations can be marked as "deployed" with Meta ad ID
- Performance metrics synced from Meta API
- Comparison view shows relative performance
- Best-performing variations highlighted
- Historical patterns inform future generation

#### US-010: Scheduled Automation
**As a** busy marketer
**I want to** schedule optimizations to run at specific times
**So that** changes are applied during optimal hours

**Acceptance Criteria:**
- Queue automation actions for future execution
- Specify date/time or trigger conditions
- View scheduled queue with edit/cancel options
- Email notification on completion
- Retry logic for failed scheduled actions

---

## 5. Functional Requirements

### 5.1 Screenshot Analysis

#### FR-001: Image Upload and Processing
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Accept screenshot URL for analysis (publicly accessible or pre-signed) | P0 |
| FR-001.2 | Validate image URL is accessible before processing | P0 |
| FR-001.3 | Support common image formats (PNG, JPG, WEBP) | P0 |
| FR-001.4 | Pass image to GPT-4 Vision API with structured analysis prompt | P0 |
| FR-001.5 | Parse JSON response from GPT-4 Vision | P0 |
| FR-001.6 | Handle partial metric extraction gracefully | P1 |

#### FR-002: Metric Extraction
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Extract impressions count when visible | P0 |
| FR-002.2 | Extract click count when visible | P0 |
| FR-002.3 | Calculate/extract CTR (Click-Through Rate) | P0 |
| FR-002.4 | Extract CPC (Cost Per Click) when visible | P0 |
| FR-002.5 | Extract total spend amount when visible | P0 |
| FR-002.6 | Extract conversion count when visible | P0 |
| FR-002.7 | Calculate/extract ROAS (Return on Ad Spend) | P0 |
| FR-002.8 | Store null for metrics not visible in screenshot | P0 |

#### FR-003: Analysis Results
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Generate array of performance insights | P0 |
| FR-003.2 | Generate array of improvement suggestions | P0 |
| FR-003.3 | Classify overall sentiment (positive/neutral/negative) | P0 |
| FR-003.4 | Provide confidence score (0.0-1.0) for analysis reliability | P0 |
| FR-003.5 | Store raw GPT-4 Vision response for debugging | P1 |
| FR-003.6 | Associate analysis with optional Meta ad ID | P1 |

### 5.2 Recommendation Engine

#### FR-004: Recommendation Generation
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Accept performance metrics as input | P0 |
| FR-004.2 | Accept ad content (headline, primary text, description, target audience) | P0 |
| FR-004.3 | Generate 5-7 actionable recommendations | P0 |
| FR-004.4 | Categorize each recommendation by type (copy/targeting/budget/creative/schedule) | P0 |
| FR-004.5 | Assign priority level (high/medium/low) based on potential impact | P0 |
| FR-004.6 | Provide clear title and detailed description for each | P0 |
| FR-004.7 | Include expected impact estimate | P0 |
| FR-004.8 | Flag whether recommendation is immediately actionable | P0 |

#### FR-005: Recommendation Persistence
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Store recommendations in database with user association | P0 |
| FR-005.2 | Link recommendations to source ad ID when provided | P0 |
| FR-005.3 | Track recommendation status (pending/applied/dismissed/failed) | P0 |
| FR-005.4 | Record who applied recommendation and when | P1 |
| FR-005.5 | Store result metrics after recommendation application | P2 |

### 5.3 Ad Copy Generation

#### FR-006: Copy Variation Generation
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | Accept current ad copy as input | P0 |
| FR-006.2 | Accept optional target audience description | P0 |
| FR-006.3 | Accept optional tone preference | P0 |
| FR-006.4 | Accept optional campaign objective | P0 |
| FR-006.5 | Configure number of variations (1-10, default 5) | P0 |
| FR-006.6 | Generate headline (max 40 characters) | P0 |
| FR-006.7 | Generate primary text (125-150 characters) | P0 |
| FR-006.8 | Generate optional description (max 30 characters) | P0 |
| FR-006.9 | Suggest call-to-action | P0 |
| FR-006.10 | Provide reasoning for each variation's strategic angle | P0 |

#### FR-007: Variation Quality
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | Ensure variations are distinct from each other | P0 |
| FR-007.2 | Use different psychological angles (emotional, logical, urgency, social proof) | P0 |
| FR-007.3 | Maintain brand voice consistency based on input | P1 |
| FR-007.4 | Optimize for mobile display length | P1 |
| FR-007.5 | Avoid prohibited/restricted content per Meta policies | P1 |

#### FR-008: Variation Persistence
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | Store all generated variations with user association | P0 |
| FR-008.2 | Track variation number within generation batch | P0 |
| FR-008.3 | Store generation parameters (audience, tone, objective) | P0 |
| FR-008.4 | Track variation status (draft/testing/active/archived) | P1 |
| FR-008.5 | Link to deployed Meta ad ID when applicable | P2 |
| FR-008.6 | Store performance metrics when available | P2 |

### 5.4 Meta API Integration

#### FR-009: OAuth Connection
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009.1 | Accept OAuth access token from client | P0 |
| FR-009.2 | Store access token securely in integrations table | P0 |
| FR-009.3 | Store optional refresh token for token renewal | P0 |
| FR-009.4 | Track token expiration timestamp | P0 |
| FR-009.5 | Update existing integration on reconnection | P0 |
| FR-009.6 | Validate token by testing API access | P1 |

#### FR-010: Account Access
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-010.1 | List all ad accounts accessible to connected user | P0 |
| FR-010.2 | Return account ID, name, status, and currency | P0 |
| FR-010.3 | Handle Meta API errors gracefully | P0 |
| FR-010.4 | Cache account data to reduce API calls | P2 |

#### FR-011: Campaign Data Access
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-011.1 | List campaigns for specified ad account | P0 |
| FR-011.2 | Return campaign ID, name, status, objective, budgets | P0 |
| FR-011.3 | List ad sets for specified campaign | P0 |
| FR-011.4 | Return ad set ID, name, status, budgets, targeting summary | P0 |
| FR-011.5 | List ads for specified ad set | P0 |
| FR-011.6 | Return ad ID, name, status, and creative details | P0 |

#### FR-012: Metrics Retrieval
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-012.1 | Fetch performance insights for specified ad | P0 |
| FR-012.2 | Support configurable date range (since/until) | P0 |
| FR-012.3 | Return impressions, clicks, CTR, CPC, spend | P0 |
| FR-012.4 | Extract conversion count from actions array | P0 |
| FR-012.5 | Calculate ROAS from spend and conversions | P0 |
| FR-012.6 | Return empty object if no data available | P0 |

### 5.5 Browser Automation

#### FR-013: Session Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-013.1 | Create Browserbase session for automation | P0 |
| FR-013.2 | Initialize Stagehand with session credentials | P0 |
| FR-013.3 | Navigate to Meta Ads Manager | P0 |
| FR-013.4 | Detect login state and handle accordingly | P0 |
| FR-013.5 | Return session ID for manual login completion if needed | P0 |
| FR-013.6 | Close session properly after completion/failure | P0 |

#### FR-014: Ad Modification
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-014.1 | Search for specific ad by ID in Ads Manager | P0 |
| FR-014.2 | Navigate to ad edit interface | P0 |
| FR-014.3 | Modify headline text when specified | P0 |
| FR-014.4 | Modify primary text when specified | P0 |
| FR-014.5 | Modify description when specified | P0 |
| FR-014.6 | Save/publish changes | P0 |
| FR-014.7 | Wait for confirmation before closing | P0 |

#### FR-015: Automation Tracking
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-015.1 | Create job record for tracking automation | P0 |
| FR-015.2 | Update job status through lifecycle (processing/completed/failed) | P0 |
| FR-015.3 | Store automation in history table | P0 |
| FR-015.4 | Record action type and changes applied | P0 |
| FR-015.5 | Store Browserbase session ID and debug URL | P1 |
| FR-015.6 | Capture error messages on failure | P0 |

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-001 | Screenshot analysis response time | < 15 seconds | P0 |
| NFR-002 | Recommendation generation response time | < 10 seconds | P0 |
| NFR-003 | Copy variation generation response time | < 20 seconds | P0 |
| NFR-004 | Meta API query response time | < 5 seconds | P0 |
| NFR-005 | Browser automation session startup | < 10 seconds | P1 |
| NFR-006 | API endpoint latency (P95) | < 500ms (excluding AI calls) | P0 |
| NFR-007 | Concurrent analysis capacity | 50 simultaneous requests | P1 |

### 6.2 Scalability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-008 | Daily screenshot analyses | 10,000+ | P1 |
| NFR-009 | Daily copy generations | 50,000+ variations | P1 |
| NFR-010 | Connected Meta accounts | 1,000+ | P1 |
| NFR-011 | Horizontal scaling | Support 10x traffic increase | P2 |
| NFR-012 | Database connection pooling | Max 50 connections per instance | P1 |

### 6.3 Reliability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-013 | System uptime | 99.9% availability | P0 |
| NFR-014 | Data durability | 99.99% (database replicated) | P0 |
| NFR-015 | GPT-4 Vision fallback | Graceful degradation on API failure | P1 |
| NFR-016 | Meta API error handling | Retry with exponential backoff | P1 |
| NFR-017 | Automation recovery | Resume or report failure within 60 seconds | P1 |

### 6.4 Security Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-018 | All endpoints require user authentication | P0 |
| NFR-019 | Meta OAuth tokens encrypted at rest | P0 |
| NFR-020 | User data isolation (all queries scoped to user) | P0 |
| NFR-021 | Input validation via Zod schemas | P0 |
| NFR-022 | Screenshot URLs validated before processing | P0 |
| NFR-023 | API rate limiting per user | P0 |
| NFR-024 | Audit logging for all automation actions | P0 |
| NFR-025 | No credential logging in application logs | P0 |

### 6.5 Observability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-026 | Structured logging for all operations | P0 |
| NFR-027 | Error tracking with context (user ID, ad ID, action) | P0 |
| NFR-028 | GPT-4 API usage metrics (tokens, costs) | P1 |
| NFR-029 | Meta API call tracking | P1 |
| NFR-030 | Automation success/failure metrics | P1 |
| NFR-031 | Alerting for error rate > 5% | P1 |

### 6.6 Maintainability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-032 | TypeScript strict mode enabled | P0 |
| NFR-033 | Zod schema validation for all inputs | P0 |
| NFR-034 | Test coverage >= 80% | P1 |
| NFR-035 | Modular service architecture | P0 |
| NFR-036 | API documentation for all endpoints | P1 |

---

## 7. Technical Architecture

### 7.1 System Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           Client Application                                   │
│  (React/Next.js Frontend with tRPC Client)                                    │
└─────────────────────────────────────┬────────────────────────────────────────┘
                                      │ tRPC
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            API Layer (adsRouter)                               │
│  ┌─────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐ │
│  │ Analysis Endpoints  │  │ Management Endpoints │  │ Automation Endpoints │ │
│  │ - analyzeAdScreenshot│ │ - listAdAccounts    │  │ - connectMetaAccount │ │
│  │ - getAdRecommendations││ - getAdCampaigns    │  │ - applyRecommendation│ │
│  │ - generateAdCopy     │ │ - getAdSets         │  │                      │ │
│  │                      │ │ - getAds            │  │                      │ │
│  │                      │ │ - getAdMetrics      │  │                      │ │
│  └─────────────────────┘  └──────────────────────┘  └──────────────────────┘ │
└─────────────────────────────────────┬────────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│    AdsService       │    │   Meta Graph API    │    │ Browser Automation  │
│                     │    │                     │    │                     │
│ - analyzeAdScreenshot│   │ - /me/adaccounts   │    │ - Browserbase SDK   │
│ - getAdRecommendations│  │ - /campaigns       │    │ - Stagehand AI      │
│ - generateAdCopy    │    │ - /adsets          │    │ - Session Recording │
│ - applyRecommendation│   │ - /ads             │    │                     │
│                     │    │ - /insights        │    │                     │
└─────────┬───────────┘    └──────────┬──────────┘    └──────────┬──────────┘
          │                           │                           │
          ▼                           ▼                           ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   OpenAI API        │    │   Meta Platform     │    │   Browserbase       │
│                     │    │                     │    │                     │
│ - GPT-4 Vision      │    │ - OAuth Provider    │    │ - Remote Browsers   │
│ - GPT-4o (Text)     │    │ - Ads API v18.0     │    │ - Session Replay    │
│                     │    │                     │    │ - Live View         │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                        Database (PostgreSQL + Drizzle)                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐   │
│  │  ad_analyses    │  │ad_recommendations│  │    ad_copy_variations      │   │
│  │  - metrics      │  │ - type/priority │  │ - headline/primaryText     │   │
│  │  - insights     │  │ - title/desc    │  │ - description/cta          │   │
│  │  - suggestions  │  │ - expectedImpact│  │ - reasoning                │   │
│  │  - sentiment    │  │ - status        │  │ - variationNumber          │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐   │
│  │ad_automation_   │  │ meta_ad_accounts│  │meta_campaigns/ad_sets/ads  │   │
│  │  history        │  │ - accountId     │  │ - campaign hierarchy cache │   │
│  │ - actionType    │  │ - accountName   │  │ - performance metrics      │   │
│  │ - changes       │  │ - currency      │  │ - targeting data           │   │
│  │ - sessionId     │  │ - lastSyncedAt  │  │                            │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Component Details

#### 7.2.1 Ads Router (`ads.ts`)
Primary API interface for ad management operations.

**Endpoints:**
- `analyzeAdScreenshot`: Upload screenshot URL, receive AI analysis
- `getAdRecommendations`: Get optimization recommendations from metrics
- `generateAdCopy`: Create ad copy variations
- `listAdAccounts`: List connected Meta ad accounts
- `getAdCampaigns`: Get campaigns for an ad account
- `getAdSets`: Get ad sets for a campaign
- `getAds`: Get ads for an ad set
- `getAdMetrics`: Get performance metrics for an ad
- `connectMetaAccount`: Store OAuth credentials
- `applyRecommendation`: Execute browser automation

#### 7.2.2 Ads Service (`ads.service.ts`)
Business logic layer for ad operations.

**Key Methods:**
- `analyzeAdScreenshot()`: GPT-4 Vision integration for screenshot analysis
- `getAdRecommendations()`: GPT-4o integration for recommendation generation
- `generateAdCopy()`: GPT-4o integration for copy variation generation
- `listAdAccounts()`: Meta Graph API for account listing
- `getAdCampaigns()`: Meta Graph API for campaign data
- `getAdMetrics()`: Meta Graph API for performance insights
- `applyRecommendation()`: Stagehand/Browserbase automation

#### 7.2.3 GPT-4 Vision Integration
```typescript
// Screenshot analysis prompt structure
{
  model: 'gpt-4o',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Structured analysis prompt...' },
      { type: 'image_url', image_url: { url: screenshotUrl } }
    ]
  }],
  max_tokens: 2000
}

// Response structure
{
  metrics: { impressions, clicks, ctr, cpc, spend, conversions, roas },
  insights: string[],
  suggestions: string[],
  sentiment: 'positive' | 'neutral' | 'negative',
  confidence: 0.0-1.0
}
```

#### 7.2.4 Browser Automation Flow
```
1. Create Browserbase session
         ↓
2. Initialize Stagehand with session
         ↓
3. Navigate to Meta Ads Manager
         ↓
4. Check login state
         ↓
   ┌─────┴─────┐
   │           │
 Logged In  Not Logged In
   │           │
   ↓           ↓
 Continue   Return session
 automation  for manual login
   │
   ↓
5. Search for ad by ID
         ↓
6. Click to edit ad
         ↓
7. Apply changes (headline, text, description)
         ↓
8. Save/Publish changes
         ↓
9. Close session, record result
```

### 7.3 Database Schema

```sql
-- Ad Analyses (GPT-4 Vision results)
CREATE TABLE ad_analyses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  ad_id VARCHAR(128),
  screenshot_url TEXT NOT NULL,
  impressions INTEGER,
  clicks INTEGER,
  ctr DECIMAL(5,2),
  cpc DECIMAL(10,2),
  spend DECIMAL(10,2),
  conversions INTEGER,
  roas DECIMAL(10,2),
  insights JSONB,
  suggestions JSONB,
  sentiment VARCHAR(20),
  confidence DECIMAL(3,2),
  raw_analysis JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ad Recommendations
CREATE TABLE ad_recommendations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  analysis_id INTEGER REFERENCES ad_analyses(id),
  ad_id VARCHAR(128),
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  expected_impact TEXT,
  actionable VARCHAR(10) DEFAULT 'true',
  status VARCHAR(20) DEFAULT 'pending',
  applied_at TIMESTAMP,
  applied_by INTEGER REFERENCES users(id),
  result_metrics JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ad Copy Variations
CREATE TABLE ad_copy_variations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  original_ad_id VARCHAR(128),
  headline TEXT NOT NULL,
  primary_text TEXT NOT NULL,
  description TEXT,
  call_to_action VARCHAR(50),
  reasoning TEXT,
  variation_number INTEGER NOT NULL,
  target_audience TEXT,
  tone VARCHAR(50),
  objective VARCHAR(50),
  status VARCHAR(20) DEFAULT 'draft',
  test_ad_id VARCHAR(128),
  performance_metrics JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Automation History
CREATE TABLE ad_automation_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  job_id INTEGER,
  action_type VARCHAR(50) NOT NULL,
  ad_id VARCHAR(128),
  ad_set_id VARCHAR(128),
  campaign_id VARCHAR(128),
  changes JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  session_id VARCHAR(128),
  debug_url TEXT,
  recording_url TEXT,
  result JSONB,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 7.4 API Reference

#### Analysis Endpoints

| Endpoint | Method | Input | Response |
|----------|--------|-------|----------|
| `ads.analyzeAdScreenshot` | mutation | `{ screenshotUrl, adId? }` | `{ success, analysis }` |
| `ads.getAdRecommendations` | mutation | `{ metrics, adContent?, adId? }` | `{ success, recommendations }` |
| `ads.generateAdCopy` | mutation | `{ currentCopy, targetAudience?, tone?, objective?, variationCount?, adId? }` | `{ success, variations }` |

#### Management Endpoints

| Endpoint | Method | Input | Response |
|----------|--------|-------|----------|
| `ads.listAdAccounts` | query | - | `{ success, accounts }` |
| `ads.getAdCampaigns` | query | `{ adAccountId }` | `{ success, campaigns }` |
| `ads.getAdSets` | query | `{ campaignId }` | `{ success, adSets }` |
| `ads.getAds` | query | `{ adSetId }` | `{ success, ads }` |
| `ads.getAdMetrics` | query | `{ adId, dateRange? }` | `{ success, metrics }` |

#### Automation Endpoints

| Endpoint | Method | Input | Response |
|----------|--------|-------|----------|
| `ads.connectMetaAccount` | mutation | `{ accessToken, refreshToken?, expiresIn? }` | `{ success, message }` |
| `ads.applyRecommendation` | mutation | `{ adId, changes }` | `{ success, message, sessionId? }` |

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| tRPC Core | `server/_core/trpc.ts` | API router framework |
| Database | `server/db/index.ts` | Drizzle ORM connection |
| Browserbase SDK | `server/_core/browserbaseSDK.ts` | Session creation for automation |
| Integrations Schema | `drizzle/schema.ts` | Meta OAuth credential storage |
| Jobs Schema | `drizzle/schema.ts` | Automation job tracking |
| Meta Ads Schema | `drizzle/schema-meta-ads.ts` | Ad-specific database tables |

### 8.2 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| openai | ^4.x | GPT-4 Vision and GPT-4o access |
| @browserbasehq/stagehand | ^3.x | AI browser automation |
| @trpc/server | ^11.x | API framework |
| zod | ^3.x | Schema validation |
| drizzle-orm | ^0.30.x | Database ORM |

### 8.3 External Services

| Service | Purpose | Required |
|---------|---------|----------|
| OpenAI API | GPT-4 Vision analysis, GPT-4o recommendations/copy | Yes |
| Meta Graph API | Ad account data, campaigns, metrics | Yes |
| Browserbase | Remote browser sessions for automation | Yes (for automation) |
| PostgreSQL | Data persistence | Yes |

### 8.4 Environment Variables

```bash
# Required for AI Analysis
OPENAI_API_KEY=           # OpenAI API access for GPT-4 Vision and GPT-4o

# Required for Browser Automation
BROWSERBASE_API_KEY=      # Browserbase authentication
BROWSERBASE_PROJECT_ID=   # Browserbase project

# Required for Database
DATABASE_URL=             # PostgreSQL connection string

# Meta API (stored per-user in database via OAuth)
# Access tokens are stored in integrations table, not in env vars
```

---

## 9. Out of Scope

### 9.1 Excluded from Current Release

| Item | Reason | Future Consideration |
|------|--------|---------------------|
| Google Ads integration | Focus on Meta first | v2.0 |
| TikTok Ads integration | Platform complexity | v2.0 |
| LinkedIn Ads integration | Smaller market | v3.0 |
| Automated A/B test deployment | Requires Meta Marketing API v2 | v1.5 |
| Budget optimization automation | High risk, requires safeguards | v2.0 |
| Audience targeting automation | Complex, needs AI refinement | v2.0 |
| Creative asset generation | Requires image AI models | v2.0 |
| Video ad analysis | Different AI model requirements | v1.5 |
| Scheduled report generation | Separate reporting feature | Separate PRD |
| Multi-user collaboration | Agency team features | Separate PRD |

### 9.2 Technical Limitations

| Limitation | Description | Workaround |
|------------|-------------|------------|
| Screenshot quality | Low-res images may reduce accuracy | Request high-resolution screenshots |
| OCR accuracy | Metrics may be misread in some layouts | Manual verification recommended |
| Meta login persistence | OAuth may expire or require 2FA | Token refresh and session handoff |
| Automation speed | Browser automation slower than API | Use API for data, automation for changes |
| Rate limits | Meta API has strict rate limits | Caching and request queuing |

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| GPT-4 Vision accuracy variance | Medium | Medium | Confidence scoring, manual verification option |
| Meta API deprecation/changes | Medium | High | API version monitoring, abstraction layer |
| Browser automation failures | Medium | Medium | Retry logic, session recording for debugging |
| OpenAI API rate limits | Low | Medium | Request queuing, model selection fallback |
| Token expiration handling | Medium | Medium | Refresh token rotation, user notification |

### 10.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| OpenAI cost overruns | Medium | High | Token budgeting, usage monitoring, user limits |
| Meta ToS compliance | Low | Critical | Regular policy review, conservative automation |
| User adoption challenges | Medium | Medium | Onboarding tutorials, example analyses |
| Competitor features | Medium | Medium | Continuous feature parity analysis |

### 10.3 Security Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| OAuth token exposure | Low | Critical | Encryption at rest, no logging |
| Unauthorized account access | Low | High | User-scoped queries, authentication required |
| Screenshot data leakage | Low | Medium | Secure storage, access controls |
| Automation misuse | Low | Medium | Action logging, rate limiting |

### 10.4 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Service degradation during high load | Medium | Medium | Auto-scaling, request queuing |
| Database performance issues | Low | High | Query optimization, indexing, connection pooling |
| Third-party service outages | Medium | Medium | Graceful degradation, status monitoring |

---

## 11. Milestones & Timeline

### 11.1 Phase 1: Core Analysis (Weeks 1-4)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M1.1 | Screenshot analysis with GPT-4 Vision | Week 1 |
| M1.2 | Metric extraction and storage | Week 2 |
| M1.3 | Recommendation generation | Week 3 |
| M1.4 | Copy variation generation | Week 4 |

**Exit Criteria:**
- [ ] Screenshots can be analyzed with 85%+ accuracy
- [ ] Metrics are extracted and stored in database
- [ ] 5-7 recommendations generated per request
- [ ] 5 copy variations generated with distinct angles

### 11.2 Phase 2: Meta Integration (Weeks 5-8)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M2.1 | OAuth connection flow | Week 5 |
| M2.2 | Ad account listing | Week 6 |
| M2.3 | Campaign/ad set/ad hierarchy | Week 7 |
| M2.4 | Performance metrics retrieval | Week 8 |

**Exit Criteria:**
- [ ] Users can connect Meta accounts via OAuth
- [ ] All ad accounts listed correctly
- [ ] Campaign hierarchy navigable
- [ ] Real-time metrics retrieved from Meta API

### 11.3 Phase 3: Browser Automation (Weeks 9-12)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M3.1 | Browserbase session creation | Week 9 |
| M3.2 | Meta Ads Manager navigation | Week 10 |
| M3.3 | Ad modification automation | Week 11 |
| M3.4 | Automation history tracking | Week 12 |

**Exit Criteria:**
- [ ] Automation sessions created successfully
- [ ] Navigation to specific ads works
- [ ] Copy changes applied and saved
- [ ] Complete audit trail of all actions

### 11.4 Phase 4: Polish & Optimization (Weeks 13-16)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M4.1 | Error handling improvements | Week 13 |
| M4.2 | Performance optimization | Week 14 |
| M4.3 | Monitoring and alerting | Week 15 |
| M4.4 | Documentation and testing | Week 16 |

**Exit Criteria:**
- [ ] Error handling covers all edge cases
- [ ] Response times meet NFR targets
- [ ] Alerts configured for critical metrics
- [ ] Test coverage >= 80%

---

## 12. Acceptance Criteria

### 12.1 Feature-Level Acceptance

#### AC-001: Screenshot Analysis
- [ ] User can submit screenshot URL via API
- [ ] GPT-4 Vision extracts visible metrics
- [ ] Response includes insights and suggestions arrays
- [ ] Sentiment classification is accurate
- [ ] Confidence score reflects analysis quality
- [ ] Analysis stored in database with user association

#### AC-002: Recommendation Generation
- [ ] User can submit metrics and content for recommendations
- [ ] 5-7 recommendations generated per request
- [ ] Each recommendation has type, priority, title, description
- [ ] Expected impact provided for each
- [ ] Recommendations stored for tracking

#### AC-003: Copy Variation Generation
- [ ] User can submit copy with optional parameters
- [ ] Configurable number of variations (1-10)
- [ ] Each variation has headline, primary text, description, CTA
- [ ] Reasoning explains strategic angle
- [ ] Variations are distinct and use different approaches
- [ ] All variations stored in database

#### AC-004: Meta OAuth Connection
- [ ] User can submit OAuth tokens
- [ ] Tokens stored securely in database
- [ ] Existing integrations updated on reconnection
- [ ] Token expiration tracked
- [ ] Connection status queryable

#### AC-005: Meta Data Access
- [ ] Ad accounts listed correctly
- [ ] Campaigns accessible per account
- [ ] Ad sets accessible per campaign
- [ ] Ads accessible per ad set
- [ ] Performance metrics retrievable with date range

#### AC-006: Browser Automation
- [ ] Automation creates Browserbase session
- [ ] Navigation to Meta Ads Manager works
- [ ] Login state detection accurate
- [ ] Copy changes applied successfully
- [ ] Session recorded for audit
- [ ] Success/failure reported with details

#### AC-007: Automation History
- [ ] All automation actions logged
- [ ] Action type and changes recorded
- [ ] Session ID and debug URL stored
- [ ] Status updates through lifecycle
- [ ] Error messages captured on failure

### 12.2 Integration Acceptance

- [ ] All endpoints respond within SLA
- [ ] Authentication enforced on all endpoints
- [ ] User data isolation verified
- [ ] Database operations use proper connection handling
- [ ] Error responses include actionable messages

### 12.3 Quality Acceptance

- [ ] Unit test coverage >= 80%
- [ ] Integration tests pass for all endpoints
- [ ] No critical security vulnerabilities
- [ ] Performance benchmarks meet targets
- [ ] API documentation complete and accurate

---

## Appendix A: GPT-4 Vision Prompt Template

```text
Analyze this Facebook/Meta ad screenshot. Extract and analyze:

1. Metrics (if visible): impressions, clicks, CTR, CPC, spend, conversions, ROAS
2. Visual Quality: image/video quality, brand consistency, attention-grabbing elements
3. Copy Analysis: headline effectiveness, primary text clarity, call-to-action strength
4. Audience Engagement: comments sentiment, reactions, shares
5. Performance Insights: what's working, what could be improved
6. Specific Recommendations: actionable improvements ranked by priority

Format your response as JSON with this structure:
{
  "metrics": {
    "impressions": number or null,
    "clicks": number or null,
    "ctr": number or null,
    "cpc": number or null,
    "spend": number or null,
    "conversions": number or null,
    "roas": number or null
  },
  "insights": ["insight 1", "insight 2", ...],
  "suggestions": ["suggestion 1", "suggestion 2", ...],
  "sentiment": "positive" | "neutral" | "negative",
  "confidence": 0.0-1.0
}
```

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Ad Set** | A group of ads within a campaign that share the same budget, schedule, and targeting |
| **Browserbase** | Cloud browser infrastructure for remote automation sessions |
| **Campaign** | A collection of ad sets organized around a single advertising objective |
| **CPC** | Cost Per Click - average cost for each click on an ad |
| **CTR** | Click-Through Rate - percentage of impressions that result in clicks |
| **GPT-4 Vision** | OpenAI's multimodal model capable of analyzing images |
| **Meta Graph API** | Facebook/Meta's API for accessing ad account data programmatically |
| **OAuth** | Open Authorization protocol for secure token-based access |
| **ROAS** | Return on Ad Spend - revenue generated per dollar spent on ads |
| **Stagehand** | AI-powered browser automation library by Browserbase |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Development Team | Initial PRD creation |

---

**Document Status:** Ready for Review
**Next Review:** 2026-01-18
**Stakeholders:** Engineering, Product, Marketing, Design
