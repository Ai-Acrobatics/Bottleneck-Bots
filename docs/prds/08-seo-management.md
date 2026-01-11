# PRD-08: SEO Management & Audits

**Product Requirements Document**

| Field | Value |
|-------|-------|
| **Document ID** | PRD-08 |
| **Feature Name** | SEO Management & Audits |
| **Version** | 1.0 |
| **Status** | Draft |
| **Author** | Engineering Team |
| **Created** | 2026-01-11 |
| **Last Updated** | 2026-01-11 |
| **Priority** | High |
| **Target Release** | v2.1 |

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

### 1.1 Executive Summary

The SEO Management & Audits feature provides comprehensive search engine optimization capabilities for Bottleneck-Bots users. This feature enables website SEO analysis using Browserbase/Puppeteer with AI-powered insights, LLM-driven keyword research, multi-search-engine ranking tracking, backlink analysis, heatmap analytics for user behavior, and professional PDF report generation with scheduled delivery options.

### 1.2 Feature Summary

| Capability | Description |
|------------|-------------|
| **Website SEO Analysis** | Deep website audits using Browserbase/Puppeteer with AI-powered insights and recommendations |
| **Keyword Research** | LLM-powered keyword suggestions with volume, difficulty, CPC, and trend analysis |
| **Ranking Tracking** | Monitor Google and Bing rankings with location-based tracking and historical data |
| **Backlink Analysis** | Comprehensive backlink profiling including domain authority, toxic link detection, and anchor text analysis |
| **Heatmap Analytics** | Click tracking, scroll depth analysis, and user behavior visualization |
| **PDF Reports** | Professional branded reports with customizable templates |
| **Scheduled Reports** | Automated report generation and delivery (daily, weekly, monthly) |

### 1.3 Credit System

| Operation | Credit Cost |
|-----------|-------------|
| SEO Analysis | 1 credit |
| Keyword Research | 1 credit |
| Ranking Check (per keyword) | 1 credit |
| Backlink Analysis | 1 credit |
| Heatmap Session Analysis | 1 credit |
| PDF Report Generation | 2 credits |

### 1.4 Target Users

- **Marketing Agencies**: Managing SEO for multiple client websites
- **SEO Specialists**: Conducting audits and tracking performance
- **Small Business Owners**: Understanding and improving their web presence
- **Content Marketers**: Optimizing content for search visibility
- **E-commerce Managers**: Improving product page rankings
- **Digital Consultants**: Providing data-driven SEO recommendations

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Fragmented SEO Tools**: Users need multiple expensive subscriptions (Ahrefs, SEMrush, Moz, Screaming Frog) for comprehensive SEO management
2. **Manual Analysis**: SEO audits require manual inspection and technical expertise
3. **Lack of AI Insights**: Traditional tools provide data but not actionable recommendations
4. **Expensive Reporting**: Professional SEO reports require specialized tools or manual creation
5. **No User Behavior Data**: Missing connection between SEO efforts and actual user behavior
6. **Tracking Complexity**: Monitoring rankings across multiple search engines and locations is time-consuming
7. **Backlink Blind Spots**: Identifying toxic backlinks and link-building opportunities requires specialized knowledge

### 2.2 Impact

| Pain Point | Business Impact | Affected Users |
|------------|-----------------|----------------|
| **Multiple Tool Subscriptions** | $500-2000+/month in combined costs | All users |
| **Manual SEO Audits** | 4-8 hours per comprehensive audit | SEO specialists |
| **Report Generation** | 2-4 hours per client report | Marketing agencies |
| **Ranking Volatility Blindness** | Missed ranking drops, lost traffic | All users |
| **Toxic Backlink Damage** | Google penalties, ranking losses | All users |
| **No UX Correlation** | Disconnect between SEO and conversion | E-commerce managers |

### 2.3 User Needs

1. **Agency Owners** need unified SEO tooling with white-label client reports
2. **SEO Specialists** need technical audits with AI-powered recommendations
3. **Marketing Managers** need keyword research with competitive insights
4. **Business Owners** need simple, actionable SEO guidance without technical jargon
5. **Content Teams** need content optimization recommendations based on ranking factors

### 2.4 Business Drivers

- **Market Opportunity**: SEO tools market valued at $1.4B, growing 14% annually
- **Customer Demand**: Top requested feature category in user surveys
- **Competitive Advantage**: AI-powered insights differentiate from traditional tools
- **Revenue Generation**: High-value credit consumption through regular audits and reports
- **Customer Stickiness**: SEO tracking creates long-term engagement patterns

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Description | Target |
|------|-------------|--------|
| **G1** | Provide comprehensive website SEO analysis with AI insights | 50+ audit checks per analysis |
| **G2** | Deliver accurate keyword research with competitive metrics | 100+ keyword suggestions per query |
| **G3** | Enable multi-location ranking tracking for Google and Bing | 99% accuracy vs manual checks |
| **G4** | Identify backlink opportunities and toxic links | >90% accuracy on toxicity detection |
| **G5** | Visualize user behavior through heatmap analytics | <24hr data availability |
| **G6** | Generate professional PDF reports automatically | <30 seconds generation time |

### 3.2 Success Metrics

#### 3.2.1 Quantitative Metrics

| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| **SEO Audits Completed** | N/A | 5,000/month | Database tracking |
| **Keywords Tracked** | N/A | 100,000/month | Database tracking |
| **PDF Reports Generated** | N/A | 2,000/month | Database tracking |
| **Analysis Accuracy** | N/A | >95% | Manual validation sample |
| **User Feature Adoption** | N/A | 40% of active users | Analytics |
| **Credit Revenue from SEO** | N/A | $30,000/month | Financial tracking |

#### 3.2.2 Qualitative Metrics

- User satisfaction with AI-generated recommendations
- Agency feedback on client report quality
- Reduction in manual SEO audit time
- Improvement in user SEO knowledge

### 3.3 Key Performance Indicators (KPIs)

1. **Daily Active SEO Users**: Users accessing SEO features daily
2. **Audit Completion Rate**: Started audits that complete successfully
3. **Report Download Rate**: Generated reports that are downloaded/shared
4. **Ranking Tracking Retention**: Users maintaining active keyword tracking
5. **Insight Action Rate**: AI recommendations marked as implemented
6. **Credits Consumed**: Daily SEO feature credit consumption

---

## 4. User Stories

### 4.1 Website SEO Analysis

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-01 | SEO Specialist | As an SEO specialist, I want to analyze a website's technical SEO so that I can identify issues affecting rankings | P0 |
| US-02 | User | As a user, I want AI-powered insights on my audit results so that I understand how to fix issues | P0 |
| US-03 | User | As a user, I want to see my SEO score compared to competitors so that I understand my relative position | P1 |
| US-04 | User | As a user, I want to track SEO improvements over time so that I can measure progress | P1 |
| US-05 | User | As a user, I want to audit specific pages (not just homepage) so that I can optimize key landing pages | P0 |
| US-06 | User | As a user, I want mobile vs desktop analysis so that I can ensure mobile-first optimization | P1 |

### 4.2 Keyword Research

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-07 | Content Marketer | As a content marketer, I want keyword suggestions based on my seed keyword so that I can plan content | P0 |
| US-08 | User | As a user, I want to see search volume, difficulty, and CPC for keywords so that I can prioritize efforts | P0 |
| US-09 | User | As a user, I want to see keyword trends over time so that I can identify seasonal opportunities | P1 |
| US-10 | User | As a user, I want related questions (PAA) for keywords so that I can create FAQ content | P1 |
| US-11 | User | As a user, I want competitor keyword analysis so that I can find keyword gaps | P1 |
| US-12 | User | As a user, I want to save keyword lists for campaigns so that I can organize my research | P1 |

### 4.3 Ranking Tracking

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-13 | SEO Specialist | As an SEO specialist, I want to track my keywords on Google and Bing so that I monitor visibility | P0 |
| US-14 | User | As a user, I want location-based ranking tracking so that I can track local SEO performance | P0 |
| US-15 | User | As a user, I want historical ranking data so that I can analyze trends | P0 |
| US-16 | User | As a user, I want ranking change alerts so that I'm notified of significant movements | P1 |
| US-17 | User | As a user, I want to compare my rankings vs competitors so that I understand competitive position | P2 |
| US-18 | User | As a user, I want SERP feature tracking (featured snippets, local pack) so that I optimize for rich results | P2 |

### 4.4 Backlink Analysis

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-19 | SEO Specialist | As an SEO specialist, I want to analyze my backlink profile so that I understand my link authority | P0 |
| US-20 | User | As a user, I want to identify toxic backlinks so that I can disavow them before penalties | P0 |
| US-21 | User | As a user, I want to see domain authority of linking domains so that I prioritize high-value links | P0 |
| US-22 | User | As a user, I want anchor text distribution analysis so that I avoid over-optimization penalties | P1 |
| US-23 | User | As a user, I want new/lost backlink tracking so that I monitor link acquisition velocity | P1 |
| US-24 | User | As a user, I want competitor backlink analysis so that I find link-building opportunities | P2 |

### 4.5 Heatmap Analytics

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-25 | UX Designer | As a UX designer, I want click heatmaps so that I understand where users click on pages | P0 |
| US-26 | User | As a user, I want scroll depth analysis so that I optimize content placement | P0 |
| US-27 | User | As a user, I want session recordings so that I can watch user behavior | P1 |
| US-28 | User | As a user, I want attention heatmaps so that I optimize above-the-fold content | P1 |
| US-29 | User | As a user, I want device-specific heatmaps so that I optimize for mobile vs desktop | P1 |
| US-30 | Marketer | As a marketer, I want conversion funnel analysis so that I identify drop-off points | P2 |

### 4.6 PDF Reports

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-31 | Agency Owner | As an agency owner, I want branded PDF reports so that I can share professional documents with clients | P0 |
| US-32 | User | As a user, I want customizable report sections so that I include only relevant data | P1 |
| US-33 | User | As a user, I want to add my logo and brand colors to reports so that they match my brand | P1 |
| US-34 | User | As a user, I want executive summary sections so that stakeholders get quick insights | P1 |
| US-35 | User | As a user, I want historical comparison in reports so that I show progress over time | P1 |
| US-36 | User | As a user, I want to download reports in multiple formats (PDF, PNG, CSV) so that I can use them flexibly | P2 |

### 4.7 Scheduled Reports

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-37 | Agency Owner | As an agency owner, I want automated weekly client reports so that I save time on reporting | P0 |
| US-38 | User | As a user, I want to schedule daily, weekly, or monthly reports so that I stay informed automatically | P0 |
| US-39 | User | As a user, I want reports emailed to me and my team so that everyone stays informed | P1 |
| US-40 | User | As a user, I want to pause/resume scheduled reports so that I control delivery | P1 |
| US-41 | User | As a user, I want to customize report recipients per schedule so that different stakeholders get different reports | P2 |

---

## 5. Functional Requirements

### 5.1 Website SEO Analysis

#### FR-01: Website Crawling
- **Description**: Crawl websites using Browserbase/Puppeteer for comprehensive analysis
- **Input**: Target URL, crawl depth (1-5), crawl limit (1-500 pages)
- **Output**: Crawl data including HTML, headers, performance metrics
- **Business Rules**:
  - Use Browserbase for reliable headless browser automation
  - Respect robots.txt unless override enabled
  - Rate limit requests to avoid target server overload (1 req/second)
  - Timeout after 30 seconds per page
  - Support JavaScript-rendered content

#### FR-02: Technical SEO Audit
- **Description**: Analyze technical SEO factors across crawled pages
- **Checks**:

| Category | Checks |
|----------|--------|
| **Meta Tags** | Title tag presence/length, meta description, canonical tags, robots directives |
| **Headings** | H1 presence/uniqueness, heading hierarchy, keyword usage |
| **Content** | Word count, keyword density, duplicate content detection |
| **Images** | Alt text presence, image size optimization, lazy loading |
| **Links** | Broken links, redirect chains, internal linking depth |
| **Performance** | Page speed, Core Web Vitals (LCP, FID, CLS), render-blocking resources |
| **Mobile** | Viewport configuration, mobile usability, touch element spacing |
| **Security** | HTTPS, mixed content, security headers |
| **Structured Data** | Schema.org markup, JSON-LD validation, rich result eligibility |
| **Crawlability** | Robots.txt, XML sitemap, crawl depth |

#### FR-03: AI-Powered Insights
- **Description**: Generate actionable recommendations using LLM analysis
- **Input**: Audit results, industry context, competition data
- **Output**: Prioritized recommendations with implementation guidance
- **Features**:
  - Issue severity scoring (critical, high, medium, low)
  - Estimated impact scoring (1-10)
  - Step-by-step fix instructions
  - Code snippets for technical fixes
  - Competitive benchmarking insights

#### FR-04: SEO Score Calculation
- **Description**: Calculate overall SEO health score (0-100)
- **Weighting**:

| Factor | Weight |
|--------|--------|
| Technical SEO | 30% |
| On-Page SEO | 25% |
| Performance | 20% |
| Mobile Optimization | 15% |
| Security | 10% |

### 5.2 Keyword Research

#### FR-05: Keyword Suggestions
- **Description**: Generate keyword ideas using LLM and data APIs
- **Input**: Seed keyword, language, location, filters
- **Output**: List of related keywords with metrics
- **Metrics Per Keyword**:
  - Search volume (monthly average)
  - Keyword difficulty (0-100)
  - CPC (cost per click estimate)
  - Competition level (low/medium/high)
  - Trend direction (rising/stable/declining)
  - Search intent (informational/commercial/transactional/navigational)

#### FR-06: SERP Analysis
- **Description**: Analyze search engine results page for keyword
- **Output**:
  - Top 10 ranking pages
  - SERP features present (featured snippet, PAA, local pack, images, videos)
  - Content length analysis of ranking pages
  - Domain authority distribution
  - Content gap opportunities

#### FR-07: Keyword Lists
- **Description**: Save and organize keywords into lists
- **Features**:
  - Create/edit/delete keyword lists
  - Add keywords from research or manually
  - Export lists (CSV, XLSX)
  - Bulk operations (add to tracking, delete)
  - Tags and categories for organization

### 5.3 Ranking Tracking

#### FR-08: Rank Monitoring
- **Description**: Track keyword rankings on Google and Bing
- **Configuration**:
  - Target URL (domain or specific page)
  - Keywords (up to 500 per project)
  - Search engine (Google, Bing, or both)
  - Location (country, state/region, city)
  - Device type (desktop, mobile)
  - Language

#### FR-09: Ranking Data Collection
- **Description**: Collect ranking positions via SERP API
- **Data Points**:
  - Current position (1-100, or "Not ranked")
  - Position change (vs previous check)
  - Ranking URL (which page ranks)
  - Featured snippet status
  - SERP features present
  - Competitor positions (optional)

#### FR-10: Historical Data
- **Description**: Store and display ranking history
- **Features**:
  - Daily ranking snapshots
  - 12-month data retention
  - Trend visualization (charts)
  - Average position calculation
  - Visibility score (weighted by position and volume)

#### FR-11: Ranking Alerts
- **Description**: Notify users of significant ranking changes
- **Triggers**:
  - Position change > threshold (default: 5 positions)
  - Dropped out of top 10/20/50/100
  - Entered top 10/3/1
  - Featured snippet gained/lost

### 5.4 Backlink Analysis

#### FR-12: Backlink Discovery
- **Description**: Discover and catalog backlinks to target domain
- **Data Per Backlink**:
  - Source URL and domain
  - Target URL
  - Anchor text
  - Link type (dofollow/nofollow/ugc/sponsored)
  - First seen date
  - Last verified date
  - Status (live/lost)

#### FR-13: Domain Metrics
- **Description**: Calculate and display domain authority metrics
- **Metrics**:
  - Domain Authority (0-100)
  - Domain Trust (0-100)
  - Referring domains count
  - Total backlinks count
  - Linking root domains
  - Domain age
  - IP diversity

#### FR-14: Toxic Link Detection
- **Description**: Identify potentially harmful backlinks
- **Toxicity Signals**:
  - Spammy anchor text patterns
  - Link farm/PBN indicators
  - Excessive reciprocal linking
  - Low-quality source domains
  - Sudden link velocity spikes
  - Foreign language link spam
  - Paid link indicators

#### FR-15: Anchor Text Analysis
- **Description**: Analyze anchor text distribution
- **Categories**:
  - Branded anchors
  - Exact match keywords
  - Partial match keywords
  - Generic anchors (click here, etc.)
  - URL anchors
  - Image anchors (no text)

### 5.5 Heatmap Analytics

#### FR-16: Tracking Script
- **Description**: Lightweight JavaScript tracking snippet for user sites
- **Features**:
  - Click tracking (x, y coordinates, element)
  - Scroll depth tracking (25%, 50%, 75%, 100%)
  - Mouse movement tracking (optional, high-data)
  - Session duration
  - Device/browser detection
  - Async loading (non-blocking)
  - GDPR consent integration

#### FR-17: Click Heatmaps
- **Description**: Visualize where users click on pages
- **Features**:
  - Color-coded density visualization
  - Click count per element
  - Dead click detection (clicks on non-interactive elements)
  - Rage click detection (repeated clicks)
  - Filter by device, date range, user segment

#### FR-18: Scroll Depth Analysis
- **Description**: Visualize how far users scroll
- **Features**:
  - Average scroll depth percentage
  - Fold visibility analysis
  - Content engagement zones
  - Drop-off point identification
  - Comparison across devices

#### FR-19: Session Recording (Future)
- **Description**: Record and playback user sessions
- **Features**:
  - DOM snapshot recording
  - Mouse movement replay
  - Click/scroll event replay
  - Session filtering and search
  - Privacy controls (field masking)

### 5.6 PDF Reports

#### FR-20: Report Generation
- **Description**: Generate professional PDF reports from analysis data
- **Report Types**:

| Report Type | Contents |
|-------------|----------|
| **SEO Audit Report** | Full audit results, recommendations, scores |
| **Keyword Research Report** | Keywords, metrics, SERP analysis |
| **Ranking Report** | Position tracking, trends, visibility |
| **Backlink Report** | Profile analysis, toxic links, opportunities |
| **Heatmap Report** | Click/scroll visualizations, insights |
| **Executive Summary** | High-level metrics, key wins, priorities |

#### FR-21: Report Customization
- **Description**: Customize report appearance and content
- **Options**:
  - Logo upload (PNG, JPG, SVG)
  - Brand colors (primary, secondary, accent)
  - Company name and contact info
  - Section selection (include/exclude)
  - Custom cover page text
  - White-label option (remove Bottleneck-Bots branding)

#### FR-22: Report Sections
- **Standard Sections**:
  - Cover page with branding
  - Executive summary
  - Detailed findings by category
  - Charts and visualizations
  - Recommendation priority matrix
  - Competitor comparison (if available)
  - Historical trends
  - Glossary of terms
  - Next steps / action items

### 5.7 Scheduled Reports

#### FR-23: Schedule Configuration
- **Description**: Configure automated report generation
- **Options**:
  - Frequency: Daily, Weekly (select day), Monthly (select date)
  - Time: Hour of day (user's timezone)
  - Report type: Select from available report types
  - Data range: Last 7/14/30/90 days
  - Recipients: Email addresses (up to 10)

#### FR-24: Schedule Management
- **Description**: Manage active report schedules
- **Features**:
  - List all schedules with status
  - Pause/resume schedules
  - Edit schedule configuration
  - Delete schedules
  - View schedule history/logs
  - Manual trigger (run now)

#### FR-25: Delivery
- **Description**: Deliver scheduled reports
- **Features**:
  - Email delivery with PDF attachment
  - Download link (expires after 7 days)
  - Optional cloud storage integration (future)
  - Delivery confirmation logging
  - Retry on failed delivery (3 attempts)

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| **NFR-01**: SEO Analysis completion | < 60 seconds for single page | APM metrics |
| **NFR-02**: Full site crawl (100 pages) | < 10 minutes | Job duration |
| **NFR-03**: Keyword research response | < 5 seconds | API latency |
| **NFR-04**: Ranking check (single keyword) | < 3 seconds | SERP API latency |
| **NFR-05**: PDF generation | < 30 seconds | Job duration |
| **NFR-06**: Heatmap data aggregation | < 10 seconds | Query time |
| **NFR-07**: API endpoint response time | < 500ms P95 | APM metrics |

### 6.2 Scalability

| Requirement | Target | Approach |
|-------------|--------|----------|
| **NFR-08**: Concurrent crawls | 50 simultaneous | Worker pool scaling |
| **NFR-09**: Daily ranking checks | 500,000 keywords | Distributed job processing |
| **NFR-10**: Heatmap event ingestion | 10M events/day | Event streaming (Kafka/Redis) |
| **NFR-11**: Report storage | 1M reports | S3/R2 object storage |
| **NFR-12**: Database performance | 10K queries/second | Read replicas, caching |

### 6.3 Reliability

| Requirement | Target | Implementation |
|-------------|--------|----------------|
| **NFR-13**: Feature uptime | 99.9% | Multi-AZ deployment |
| **NFR-14**: Data durability | 99.999999% | Replicated storage |
| **NFR-15**: Crawl completion rate | > 98% | Retry logic, fallbacks |
| **NFR-16**: Report delivery rate | > 99.5% | Retry queue, monitoring |
| **NFR-17**: Zero data loss | 100% | Transactional processing |

### 6.4 Security

| Requirement | Description | Implementation |
|-------------|-------------|----------------|
| **NFR-18**: Data encryption at rest | Encrypt all stored data | AES-256 encryption |
| **NFR-19**: Data encryption in transit | All API calls over HTTPS | TLS 1.3 |
| **NFR-20**: User data isolation | Users only access own data | Row-level security |
| **NFR-21**: API authentication | All endpoints require auth | JWT tokens |
| **NFR-22**: Crawl authorization | Only crawl authorized domains | Domain verification |
| **NFR-23**: Heatmap privacy | Mask sensitive form fields | Configurable masking |
| **NFR-24**: GDPR compliance | Support data deletion | Cascade delete |

### 6.5 Compliance

| Requirement | Description |
|-------------|-------------|
| **NFR-25**: GDPR compliance | Data export, deletion, consent |
| **NFR-26**: CCPA compliance | California privacy requirements |
| **NFR-27**: Cookie consent | Heatmap tracking consent |
| **NFR-28**: Terms of service | User agreement on crawling |
| **NFR-29**: Rate limiting | Respect target site limits |

### 6.6 Observability

| Requirement | Target | Tools |
|-------------|--------|-------|
| **NFR-30**: Structured logging | All operations logged | Pino/Winston |
| **NFR-31**: Metrics collection | Key metrics exported | Prometheus/Datadog |
| **NFR-32**: Distributed tracing | End-to-end traces | OpenTelemetry |
| **NFR-33**: Alerting | < 5 min detection | PagerDuty/Slack |
| **NFR-34**: Dashboard | Real-time visibility | Grafana |

---

## 7. Technical Architecture

### 7.1 System Components

```
+------------------+     +-------------------+     +------------------+
|  Web Frontend    |---->|  tRPC API Server  |---->|  SEO Router      |
|  (React/Next.js) |     |  (seo.ts)         |     |  (Analysis/KW)   |
+------------------+     +-------------------+     +--------+---------+
                                                           |
                    +--------------------------------------+
                    |                   |                   |
                    v                   v                   v
            +---------------+   +---------------+   +---------------+
            | Browserbase   |   | SERP API      |   | AI Service    |
            | (Puppeteer)   |   | (Rankings)    |   | (Claude/GPT)  |
            +---------------+   +---------------+   +---------------+
                    |                   |                   |
                    v                   v                   v
            +---------------+   +---------------+   +---------------+
            | Crawl Worker  |   | Ranking Worker|   | Analysis Worker|
            | (BullMQ)      |   | (BullMQ)      |   | (BullMQ)       |
            +---------------+   +---------------+   +---------------+
                    |                   |                   |
                    +---------+---------+---------+---------+
                              |
                              v
                    +-------------------+
                    |    PostgreSQL     |
                    | (Drizzle ORM)     |
                    +-------------------+
                              |
                              v
                    +-------------------+
                    |    S3/R2 Storage  |
                    | (PDFs, Heatmaps)  |
                    +-------------------+
```

### 7.2 Database Schema

#### 7.2.1 seo_projects Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| userId | INTEGER | Foreign key to users |
| name | VARCHAR(255) | Project name |
| domain | VARCHAR(255) | Target domain |
| isVerified | BOOLEAN | Domain ownership verified |
| settings | JSONB | Project settings (locations, devices) |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

#### 7.2.2 seo_audits Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| projectId | INTEGER | Foreign key to seo_projects |
| userId | INTEGER | Foreign key to users |
| url | TEXT | Audited URL |
| score | INTEGER | Overall SEO score (0-100) |
| technicalScore | INTEGER | Technical SEO score |
| contentScore | INTEGER | Content score |
| performanceScore | INTEGER | Performance score |
| mobileScore | INTEGER | Mobile optimization score |
| securityScore | INTEGER | Security score |
| issues | JSONB | Discovered issues array |
| recommendations | JSONB | AI recommendations array |
| rawData | JSONB | Complete audit data |
| creditsUsed | INTEGER | Credits consumed |
| status | VARCHAR(50) | pending, processing, completed, failed |
| error | TEXT | Error message if failed |
| startedAt | TIMESTAMP | Audit start time |
| completedAt | TIMESTAMP | Audit completion time |
| createdAt | TIMESTAMP | Record creation time |

#### 7.2.3 seo_keywords Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| projectId | INTEGER | Foreign key to seo_projects |
| userId | INTEGER | Foreign key to users |
| keyword | VARCHAR(500) | Keyword phrase |
| searchVolume | INTEGER | Monthly search volume |
| difficulty | INTEGER | Keyword difficulty (0-100) |
| cpc | DECIMAL(10,2) | Cost per click |
| competition | VARCHAR(20) | low, medium, high |
| trend | VARCHAR(20) | rising, stable, declining |
| intent | VARCHAR(50) | informational, commercial, transactional, navigational |
| serpFeatures | JSONB | SERP features present |
| listId | INTEGER | Optional keyword list FK |
| createdAt | TIMESTAMP | Record creation time |
| updatedAt | TIMESTAMP | Last update time |

#### 7.2.4 seo_keyword_lists Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| projectId | INTEGER | Foreign key to seo_projects |
| userId | INTEGER | Foreign key to users |
| name | VARCHAR(255) | List name |
| description | TEXT | List description |
| keywordCount | INTEGER | Number of keywords |
| tags | JSONB | Tags array |
| createdAt | TIMESTAMP | Record creation time |
| updatedAt | TIMESTAMP | Last update time |

#### 7.2.5 seo_rankings Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| projectId | INTEGER | Foreign key to seo_projects |
| keywordId | INTEGER | Foreign key to seo_keywords |
| userId | INTEGER | Foreign key to users |
| searchEngine | VARCHAR(20) | google, bing |
| location | VARCHAR(100) | Location code |
| device | VARCHAR(20) | desktop, mobile |
| position | INTEGER | Current ranking position |
| previousPosition | INTEGER | Previous position |
| change | INTEGER | Position change |
| rankingUrl | TEXT | URL that ranks |
| featuredSnippet | BOOLEAN | Has featured snippet |
| serpFeatures | JSONB | SERP features present |
| competitors | JSONB | Competitor positions |
| checkedAt | TIMESTAMP | When ranking was checked |
| createdAt | TIMESTAMP | Record creation time |

#### 7.2.6 seo_backlinks Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| projectId | INTEGER | Foreign key to seo_projects |
| userId | INTEGER | Foreign key to users |
| sourceUrl | TEXT | Linking page URL |
| sourceDomain | VARCHAR(255) | Linking domain |
| targetUrl | TEXT | Target page URL |
| anchorText | TEXT | Link anchor text |
| linkType | VARCHAR(20) | dofollow, nofollow, ugc, sponsored |
| domainAuthority | INTEGER | Source domain authority |
| domainTrust | INTEGER | Source domain trust |
| toxicityScore | INTEGER | Toxicity level (0-100) |
| toxicityReasons | JSONB | Toxicity signals detected |
| isLive | BOOLEAN | Link currently active |
| firstSeenAt | TIMESTAMP | When link was discovered |
| lastSeenAt | TIMESTAMP | When link was verified |
| lostAt | TIMESTAMP | When link was lost |
| createdAt | TIMESTAMP | Record creation time |
| updatedAt | TIMESTAMP | Last update time |

#### 7.2.7 seo_heatmaps Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| projectId | INTEGER | Foreign key to seo_projects |
| userId | INTEGER | Foreign key to users |
| pageUrl | TEXT | Page URL being tracked |
| pageHash | VARCHAR(64) | URL hash for indexing |
| device | VARCHAR(20) | desktop, mobile, tablet |
| sessionCount | INTEGER | Total sessions tracked |
| clickData | JSONB | Aggregated click data |
| scrollData | JSONB | Aggregated scroll data |
| dateRange | JSONB | Start and end dates |
| createdAt | TIMESTAMP | Record creation time |
| updatedAt | TIMESTAMP | Last aggregation time |

#### 7.2.8 seo_heatmap_events Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| projectId | INTEGER | Foreign key to seo_projects |
| sessionId | VARCHAR(64) | Session identifier |
| eventType | VARCHAR(20) | click, scroll, move |
| pageUrl | TEXT | Page URL |
| x | INTEGER | X coordinate (clicks) |
| y | INTEGER | Y coordinate (clicks) |
| element | VARCHAR(255) | Element selector |
| scrollDepth | INTEGER | Scroll percentage |
| device | VARCHAR(20) | Device type |
| timestamp | TIMESTAMP | Event timestamp |
| metadata | JSONB | Additional event data |

#### 7.2.9 seo_reports Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| projectId | INTEGER | Foreign key to seo_projects |
| userId | INTEGER | Foreign key to users |
| reportType | VARCHAR(50) | Report type |
| title | VARCHAR(255) | Report title |
| dataRange | JSONB | Date range covered |
| sections | JSONB | Selected sections |
| branding | JSONB | Brand customization |
| status | VARCHAR(20) | generating, completed, failed |
| fileUrl | TEXT | S3/R2 file URL |
| fileSize | INTEGER | File size in bytes |
| creditsUsed | INTEGER | Credits consumed |
| generatedAt | TIMESTAMP | Generation time |
| expiresAt | TIMESTAMP | Download link expiry |
| createdAt | TIMESTAMP | Record creation time |

#### 7.2.10 seo_report_schedules Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| projectId | INTEGER | Foreign key to seo_projects |
| userId | INTEGER | Foreign key to users |
| reportType | VARCHAR(50) | Report type to generate |
| frequency | VARCHAR(20) | daily, weekly, monthly |
| dayOfWeek | INTEGER | Day for weekly (0-6) |
| dayOfMonth | INTEGER | Day for monthly (1-31) |
| hour | INTEGER | Hour of day (0-23) |
| timezone | VARCHAR(50) | User timezone |
| recipients | JSONB | Email addresses array |
| dataRange | INTEGER | Days of data to include |
| sections | JSONB | Selected sections |
| branding | JSONB | Brand customization |
| isActive | BOOLEAN | Schedule active status |
| lastRunAt | TIMESTAMP | Last execution time |
| nextRunAt | TIMESTAMP | Next scheduled time |
| createdAt | TIMESTAMP | Record creation time |
| updatedAt | TIMESTAMP | Last update time |

### 7.3 API Endpoints (tRPC Router)

#### 7.3.1 Project Management

| Endpoint | Type | Description |
|----------|------|-------------|
| `seo.createProject` | Mutation | Create new SEO project |
| `seo.getProjects` | Query | List user's SEO projects |
| `seo.getProject` | Query | Get project details |
| `seo.updateProject` | Mutation | Update project settings |
| `seo.deleteProject` | Mutation | Delete project |
| `seo.verifyDomain` | Mutation | Verify domain ownership |

#### 7.3.2 SEO Analysis

| Endpoint | Type | Description |
|----------|------|-------------|
| `seo.startAudit` | Mutation | Start SEO audit (1 credit) |
| `seo.getAudit` | Query | Get audit results |
| `seo.getAudits` | Query | List project audits |
| `seo.getAuditStatus` | Query | Check audit progress |
| `seo.compareAudits` | Query | Compare two audits |

#### 7.3.3 Keyword Research

| Endpoint | Type | Description |
|----------|------|-------------|
| `seo.researchKeywords` | Mutation | Get keyword suggestions (1 credit) |
| `seo.analyzeSerp` | Query | Analyze SERP for keyword |
| `seo.saveKeywords` | Mutation | Save keywords to list |
| `seo.getKeywordLists` | Query | Get user's keyword lists |
| `seo.getKeywords` | Query | Get keywords in list |
| `seo.deleteKeywordList` | Mutation | Delete keyword list |

#### 7.3.4 Ranking Tracking

| Endpoint | Type | Description |
|----------|------|-------------|
| `seo.addKeywordsToTracking` | Mutation | Start tracking keywords |
| `seo.checkRankings` | Mutation | Manual ranking check (1 credit/keyword) |
| `seo.getRankings` | Query | Get current rankings |
| `seo.getRankingHistory` | Query | Get historical rankings |
| `seo.removeFromTracking` | Mutation | Stop tracking keyword |
| `seo.configureAlerts` | Mutation | Set ranking alerts |

#### 7.3.5 Backlink Analysis

| Endpoint | Type | Description |
|----------|------|-------------|
| `seo.analyzeBacklinks` | Mutation | Run backlink analysis (1 credit) |
| `seo.getBacklinks` | Query | Get backlink list |
| `seo.getBacklinkMetrics` | Query | Get domain metrics |
| `seo.getToxicLinks` | Query | Get toxic backlinks |
| `seo.getAnchorTextDistribution` | Query | Get anchor analysis |
| `seo.exportBacklinks` | Query | Export backlinks CSV |

#### 7.3.6 Heatmap Analytics

| Endpoint | Type | Description |
|----------|------|-------------|
| `seo.getTrackingScript` | Query | Get heatmap tracking code |
| `seo.getHeatmapData` | Query | Get heatmap visualization data |
| `seo.getScrollDepth` | Query | Get scroll analytics |
| `seo.getClickAnalytics` | Query | Get click analytics |
| `seo.analyzeSession` | Mutation | Analyze session data (1 credit) |

#### 7.3.7 Reports

| Endpoint | Type | Description |
|----------|------|-------------|
| `seo.generateReport` | Mutation | Generate PDF report (2 credits) |
| `seo.getReports` | Query | List generated reports |
| `seo.getReport` | Query | Get report details/download |
| `seo.deleteReport` | Mutation | Delete report |
| `seo.scheduleReport` | Mutation | Create report schedule |
| `seo.getSchedules` | Query | List report schedules |
| `seo.updateSchedule` | Mutation | Update schedule |
| `seo.deleteSchedule` | Mutation | Delete schedule |
| `seo.triggerSchedule` | Mutation | Run schedule now |

### 7.4 Background Workers

#### 7.4.1 SEO Crawl Worker

| Setting | Value |
|---------|-------|
| Queue Name | `seo-crawl` |
| Concurrency | 10 workers |
| Rate Limit | 10 jobs/second |
| Max Attempts | 3 |
| Timeout | 600 seconds (10 min) |
| Job Retention | 24 hours completed, 7 days failed |

#### 7.4.2 Ranking Worker

| Setting | Value |
|---------|-------|
| Queue Name | `seo-rankings` |
| Concurrency | 20 workers |
| Rate Limit | 50 jobs/second |
| Max Attempts | 3 |
| Timeout | 30 seconds |
| Scheduled | Daily at 6 AM UTC |

#### 7.4.3 Report Worker

| Setting | Value |
|---------|-------|
| Queue Name | `seo-reports` |
| Concurrency | 5 workers |
| Rate Limit | 10 jobs/second |
| Max Attempts | 2 |
| Timeout | 120 seconds |
| Job Retention | 7 days |

#### 7.4.4 Heatmap Aggregation Worker

| Setting | Value |
|---------|-------|
| Queue Name | `seo-heatmap` |
| Concurrency | 3 workers |
| Scheduled | Hourly |
| Timeout | 300 seconds |

### 7.5 Service Layer

#### 7.5.1 Browserbase Service

```typescript
class BrowserbaseService {
  // Browserbase integration for web crawling
  createSession(): Promise<BrowserSession>
  navigateTo(url: string): Promise<PageData>
  extractSeoData(): Promise<SeoAnalysis>
  screenshot(): Promise<Buffer>
  close(): Promise<void>
}
```

#### 7.5.2 SERP Service

```typescript
class SerpService {
  // SERP API integration for rankings
  checkRanking(keyword: string, location: string, device: string): Promise<RankingResult>
  getSerpFeatures(keyword: string): Promise<SerpFeatures>
  getCompetitorRankings(keyword: string, competitors: string[]): Promise<CompetitorRankings>
}
```

#### 7.5.3 AI Analysis Service

```typescript
class SeoAiService {
  // LLM-powered SEO analysis
  generateRecommendations(auditData: AuditData): Promise<Recommendation[]>
  suggestKeywords(seedKeyword: string, context: string): Promise<Keyword[]>
  analyzeContent(content: string, targetKeyword: string): Promise<ContentAnalysis>
  generateReportSummary(data: ReportData): Promise<string>
}
```

#### 7.5.4 PDF Service

```typescript
class PdfReportService {
  // PDF generation using puppeteer-core
  generateReport(type: ReportType, data: ReportData, branding: Branding): Promise<Buffer>
  uploadReport(buffer: Buffer): Promise<string>  // Returns S3 URL
}
```

### 7.6 Technology Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| **Web Crawling** | Browserbase + Puppeteer | Reliable headless browser, JS rendering |
| **SERP API** | DataForSEO / SerpAPI | Accurate ranking data, multi-location |
| **AI/LLM** | Claude + GPT-4 | High-quality recommendations |
| **PDF Generation** | Puppeteer + React-PDF | Customizable, professional output |
| **Object Storage** | S3 / Cloudflare R2 | Cost-effective report storage |
| **Event Streaming** | Redis Streams | Heatmap event ingestion |
| **Database** | PostgreSQL + Drizzle | Relational data, type safety |
| **Queue** | BullMQ + Redis | Reliable job processing |

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Dependency | Component | Impact |
|------------|-----------|--------|
| User Authentication | `schema-auth.ts` | User identity for projects |
| Credit System | `schema-credits.ts` | Usage billing and limits |
| Notification System | `schema-alerts.ts` | Ranking alerts |
| Email Service | `email.service.ts` | Report delivery |
| Storage Service | S3/R2 integration | Report file storage |

### 8.2 External Dependencies

| Dependency | Version | Purpose | Risk Level |
|------------|---------|---------|------------|
| Browserbase | SDK v2.x | Web crawling | Medium |
| Puppeteer | ^22.x | Browser automation | Low |
| DataForSEO API | v3 | SERP rankings | Medium |
| Anthropic SDK | ^0.20.x | AI analysis | Low |
| OpenAI SDK | ^4.x | AI fallback | Low |
| @react-pdf/renderer | ^3.x | PDF generation | Low |
| AWS S3 SDK | ^3.x | File storage | Low |
| Zod | ^3.x | Input validation | Low |

### 8.3 Infrastructure Dependencies

| Dependency | Purpose | Fallback |
|------------|---------|----------|
| PostgreSQL | Primary data store | None (required) |
| Redis | Queue, caching, events | Degraded mode |
| S3/R2 | Report storage | Local storage temp |
| Browserbase | Web crawling | Self-hosted Puppeteer |
| SERP API | Ranking data | Alternative provider |

### 8.4 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BROWSERBASE_API_KEY` | Yes | Browserbase API key |
| `BROWSERBASE_PROJECT_ID` | Yes | Browserbase project |
| `SERP_API_KEY` | Yes | SERP API key |
| `SERP_API_PROVIDER` | No | Provider (default: dataforseo) |
| `S3_BUCKET_REPORTS` | Yes | S3 bucket for reports |
| `S3_ACCESS_KEY` | Yes | S3 access key |
| `S3_SECRET_KEY` | Yes | S3 secret key |
| `S3_REGION` | No | S3 region (default: us-east-1) |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key |
| `OPENAI_API_KEY` | No | OpenAI fallback key |

---

## 9. Out of Scope

### 9.1 Explicitly Excluded

| Item | Reason | Future Phase |
|------|--------|--------------|
| Site Speed Optimization Tools | Complexity, separate feature | v3.0 |
| Content Generation | Separate AI writing feature | v2.5 |
| Link Building Outreach | CRM-like complexity | v3.0 |
| White-Label Platform | Enterprise feature | v3.0 |
| API Access for SEO Data | Enterprise feature | v2.5 |
| Team Collaboration | Multi-user complexity | v2.5 |
| Google Search Console Integration | OAuth complexity | v2.5 |
| Google Analytics Integration | OAuth complexity | v2.5 |
| Bing Webmaster Tools Integration | OAuth complexity | v2.5 |
| Schema Markup Generator | Separate tool | v3.0 |

### 9.2 Deferred Features

| Feature | Priority | Target Release |
|---------|----------|----------------|
| Session Recordings | P2 | v2.2 |
| Competitor Monitoring | P2 | v2.3 |
| Content Optimization Suggestions | P2 | v2.3 |
| Local SEO Features | P2 | v2.5 |
| International SEO | P3 | v3.0 |
| Enterprise SSO | P3 | v3.0 |
| Custom Integrations | P3 | v3.0 |

### 9.3 Assumptions

1. Users provide valid URLs for analysis
2. Target websites are publicly accessible
3. Users have rights to analyze their domains
4. SERP API maintains reasonable accuracy
5. Browserbase maintains availability
6. Users understand SEO terminology basics

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **R1**: Browserbase rate limits | Medium | High | Request pooling, caching, fallback to self-hosted |
| **R2**: SERP API inaccuracy | Medium | Medium | Cross-validation, manual spot checks |
| **R3**: Crawl failures on complex sites | High | Medium | Retry logic, JS timeout handling, user notification |
| **R4**: Heatmap script blocking | Medium | Medium | Lightweight script, CDN delivery, documentation |
| **R5**: AI recommendation quality | Medium | Medium | Prompt engineering, human review, feedback loop |
| **R6**: PDF generation failures | Low | Medium | Retry, simplified fallback template |
| **R7**: Storage costs escalation | Medium | Medium | Expiry policies, compression, tiered storage |

### 10.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **R8**: Low feature adoption | Medium | High | User onboarding, templates, documentation |
| **R9**: Competitor tool superiority | Medium | Medium | Focus on AI differentiation, pricing |
| **R10**: Support burden | Medium | Medium | Self-service docs, troubleshooting guides |
| **R11**: Credit pricing misalignment | Medium | Medium | Usage analytics, pricing adjustments |
| **R12**: Legal issues (crawling) | Low | High | Terms of service, robots.txt respect |

### 10.3 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **R13**: Third-party API changes | Medium | High | Abstraction layer, multiple providers |
| **R14**: Database growth | High | Medium | Partitioning, archival, data lifecycle |
| **R15**: Worker queue backup | Medium | Medium | Monitoring, auto-scaling, prioritization |
| **R16**: Report delivery failures | Low | Medium | Retry queue, alternative delivery |

### 10.4 Risk Matrix

```
Impact      Critical |     R12    |
            High     |  R1        |     R7, R8, R13
            Medium   |            |     R2, R3, R4, R5, R6, R9, R10, R11, R14, R15, R16
            Low      |            |
                     +-----------+-----------------
                        Low         Medium    High
                            Probability
```

---

## 11. Milestones & Timeline

### 11.1 Phase 1: Foundation (Weeks 1-3)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M1.1** | Database schema design | Migration scripts, type definitions | Backend |
| **M1.2** | Project management API | CRUD for projects, domain verification | Backend |
| **M1.3** | Browserbase integration | Service wrapper, session management | Backend |
| **M1.4** | Basic crawl worker | Page fetching, data extraction | Backend |
| **M1.5** | Credit system integration | Usage tracking, balance checks | Backend |
| **M1.6** | Unit tests | 80% coverage for core | QA |

### 11.2 Phase 2: SEO Analysis (Weeks 4-6)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M2.1** | Technical SEO audit | 50+ check implementations | Backend |
| **M2.2** | Performance analysis | Core Web Vitals, speed metrics | Backend |
| **M2.3** | AI integration | Recommendation generation | AI Team |
| **M2.4** | Score calculation | Weighted scoring algorithm | Backend |
| **M2.5** | Audit UI | Audit results dashboard | Frontend |
| **M2.6** | Integration tests | E2E audit flow | QA |

### 11.3 Phase 3: Keyword & Rankings (Weeks 7-9)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M3.1** | Keyword research API | LLM-powered suggestions | Backend |
| **M3.2** | SERP API integration | Ranking data collection | Backend |
| **M3.3** | Ranking worker | Scheduled ranking checks | Backend |
| **M3.4** | Historical data storage | Time-series rankings | Backend |
| **M3.5** | Keyword/ranking UI | Research and tracking views | Frontend |
| **M3.6** | Alert system | Ranking change notifications | Backend |

### 11.4 Phase 4: Backlinks & Heatmaps (Weeks 10-12)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M4.1** | Backlink API integration | Link discovery, metrics | Backend |
| **M4.2** | Toxic link detection | ML-based toxicity scoring | AI Team |
| **M4.3** | Heatmap tracking script | Lightweight event collection | Frontend |
| **M4.4** | Event aggregation | Heatmap data processing | Backend |
| **M4.5** | Visualization components | Click/scroll heatmaps | Frontend |
| **M4.6** | Integration tests | Full feature testing | QA |

### 11.5 Phase 5: Reports & Scheduling (Weeks 13-14)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M5.1** | PDF generation service | Report templates, branding | Backend |
| **M5.2** | Report customization | Section selection, branding UI | Frontend |
| **M5.3** | Scheduling system | Cron-based report generation | Backend |
| **M5.4** | Email delivery | Report distribution | Backend |
| **M5.5** | Storage integration | S3/R2 file management | Backend |

### 11.6 Phase 6: Polish & Launch (Weeks 15-16)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M6.1** | Performance optimization | Query optimization, caching | Backend |
| **M6.2** | Security audit | Penetration testing | Security |
| **M6.3** | Documentation | User guides, API docs | Tech Writer |
| **M6.4** | Load testing | Stress testing at scale | QA |
| **M6.5** | Beta release | Limited user rollout | Product |
| **M6.6** | GA release | Full production launch | Product |

### 11.7 Gantt Chart

```
Week:        1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16
Phase 1:     ████████████
Phase 2:              ████████████
Phase 3:                       ████████████
Phase 4:                                ████████████
Phase 5:                                         ████████
Phase 6:                                               ████████
```

---

## 12. Acceptance Criteria

### 12.1 Website SEO Analysis

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-01** | User can initiate SEO audit for any public URL | E2E test |
| **AC-02** | Audit checks 50+ technical SEO factors | Unit test |
| **AC-03** | Audit completes within 60 seconds for single page | Performance test |
| **AC-04** | AI generates prioritized recommendations | Integration test |
| **AC-05** | SEO score calculated using weighted algorithm | Unit test |
| **AC-06** | Issues include severity and fix instructions | Manual verification |
| **AC-07** | 1 credit deducted per analysis | Database verification |
| **AC-08** | Failed audits refund credits | Integration test |

### 12.2 Keyword Research

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-09** | Keyword research returns 100+ suggestions | Integration test |
| **AC-10** | Each keyword includes volume, difficulty, CPC | API test |
| **AC-11** | Trend data shows directional movement | Unit test |
| **AC-12** | Search intent classified accurately | Manual sample |
| **AC-13** | SERP features identified correctly | Integration test |
| **AC-14** | Keywords can be saved to lists | E2E test |
| **AC-15** | Keyword lists can be exported (CSV) | E2E test |
| **AC-16** | 1 credit deducted per research query | Database verification |

### 12.3 Ranking Tracking

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-17** | Rankings checked for Google and Bing | Integration test |
| **AC-18** | Location-based tracking works correctly | Manual verification |
| **AC-19** | Rankings update daily automatically | Cron verification |
| **AC-20** | Historical data retained for 12 months | Database verification |
| **AC-21** | Position changes calculated correctly | Unit test |
| **AC-22** | Featured snippet status tracked | Integration test |
| **AC-23** | Ranking alerts trigger on threshold breach | E2E test |
| **AC-24** | 1 credit per keyword per manual check | Database verification |

### 12.4 Backlink Analysis

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-25** | Backlinks discovered and cataloged | Integration test |
| **AC-26** | Domain authority calculated for sources | Unit test |
| **AC-27** | Toxic links identified with reasons | Integration test |
| **AC-28** | Anchor text distribution analyzed | Unit test |
| **AC-29** | New/lost backlinks tracked over time | E2E test |
| **AC-30** | Backlink data exportable (CSV) | E2E test |
| **AC-31** | 1 credit deducted per analysis | Database verification |

### 12.5 Heatmap Analytics

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-32** | Tracking script generated for each project | API test |
| **AC-33** | Script collects clicks without performance impact | Performance test |
| **AC-34** | Scroll depth tracked in 25% increments | Unit test |
| **AC-35** | Click heatmap visualizes density correctly | Visual verification |
| **AC-36** | Data aggregated within 24 hours | Cron verification |
| **AC-37** | Device filtering works (desktop/mobile) | E2E test |
| **AC-38** | 1 credit per session analysis | Database verification |

### 12.6 PDF Reports

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-39** | PDF generated within 30 seconds | Performance test |
| **AC-40** | Report includes all selected sections | Manual verification |
| **AC-41** | Custom branding (logo, colors) applied | Visual verification |
| **AC-42** | Executive summary generated by AI | Integration test |
| **AC-43** | Charts and visualizations render correctly | Visual verification |
| **AC-44** | Report downloadable via secure URL | E2E test |
| **AC-45** | 2 credits deducted per PDF | Database verification |

### 12.7 Scheduled Reports

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-46** | Daily/weekly/monthly schedules configurable | E2E test |
| **AC-47** | Reports generated at scheduled time | Cron verification |
| **AC-48** | Reports emailed to configured recipients | Integration test |
| **AC-49** | Schedules can be paused/resumed | E2E test |
| **AC-50** | Failed deliveries retried up to 3 times | Integration test |
| **AC-51** | Schedule history logged | Database verification |

### 12.8 Security & Performance

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-52** | All endpoints require authentication | Security test |
| **AC-53** | Users only access their own data | Security test |
| **AC-54** | Domain verification prevents unauthorized analysis | E2E test |
| **AC-55** | Rate limiting prevents abuse | Load test |
| **AC-56** | API responses < 500ms P95 | Performance test |
| **AC-57** | System handles 50 concurrent crawls | Load test |
| **AC-58** | Reports expire after 7 days | Database verification |

---

## Appendix A: API Reference

### A.1 Start Audit Request

```typescript
interface StartAuditInput {
  projectId: number;
  url: string;
  options?: {
    crawlDepth?: number;        // 1-5, default: 1
    maxPages?: number;          // 1-500, default: 1
    includeSubdomains?: boolean; // default: false
    followRobots?: boolean;     // default: true
    mobileAnalysis?: boolean;   // default: true
  };
}

interface StartAuditOutput {
  auditId: number;
  status: "pending" | "processing";
  estimatedTime: number;        // seconds
  creditsUsed: number;
}
```

### A.2 Keyword Research Request

```typescript
interface KeywordResearchInput {
  seedKeyword: string;
  options?: {
    location?: string;          // Country code (US, UK, etc.)
    language?: string;          // Language code (en, es, etc.)
    limit?: number;             // 10-500, default: 100
    includeQuestions?: boolean; // default: true
    includeLongTail?: boolean;  // default: true
  };
}

interface KeywordData {
  keyword: string;
  searchVolume: number;
  difficulty: number;           // 0-100
  cpc: number;
  competition: "low" | "medium" | "high";
  trend: "rising" | "stable" | "declining";
  intent: "informational" | "commercial" | "transactional" | "navigational";
  serpFeatures: string[];
}
```

### A.3 Generate Report Request

```typescript
interface GenerateReportInput {
  projectId: number;
  type: "audit" | "keywords" | "rankings" | "backlinks" | "heatmap" | "executive";
  dateRange: {
    start: string;              // ISO 8601
    end: string;                // ISO 8601
  };
  sections?: string[];          // Optional section selection
  branding?: {
    logo?: string;              // Base64 or URL
    primaryColor?: string;      // Hex color
    secondaryColor?: string;    // Hex color
    companyName?: string;
    contactInfo?: string;
    hideBottleneckBranding?: boolean;
  };
}

interface GenerateReportOutput {
  reportId: number;
  status: "generating";
  estimatedTime: number;
  creditsUsed: number;
}
```

---

## Appendix B: Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `SEO_PROJECT_NOT_FOUND` | 404 | Project ID does not exist |
| `SEO_DOMAIN_NOT_VERIFIED` | 403 | Domain ownership not verified |
| `SEO_AUDIT_FAILED` | 500 | Audit processing failed |
| `SEO_URL_INVALID` | 400 | URL format invalid or unreachable |
| `SEO_URL_BLOCKED` | 403 | URL blocked by robots.txt |
| `SEO_INSUFFICIENT_CREDITS` | 402 | Insufficient credit balance |
| `SEO_RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `SEO_CRAWL_TIMEOUT` | 408 | Crawl operation timed out |
| `SEO_REPORT_GENERATION_FAILED` | 500 | PDF generation failed |
| `SEO_SCHEDULE_INVALID` | 400 | Invalid schedule configuration |
| `SEO_KEYWORD_LIMIT_EXCEEDED` | 400 | Too many keywords in request |
| `SEO_BACKLINK_API_ERROR` | 502 | Backlink API unavailable |

---

## Appendix C: SEO Audit Checks

### Technical SEO (30 Checks)

1. Title tag presence
2. Title tag length (50-60 chars)
3. Meta description presence
4. Meta description length (150-160 chars)
5. H1 tag presence
6. H1 tag uniqueness
7. Heading hierarchy (H1-H6)
8. Canonical tag presence
9. Canonical tag validity
10. Robots meta tag
11. XML sitemap presence
12. XML sitemap validity
13. Robots.txt presence
14. Robots.txt validity
15. HTTPS implementation
16. HTTP to HTTPS redirect
17. WWW redirect consistency
18. URL structure (clean URLs)
19. URL length (<100 chars)
20. Internal link structure
21. Broken internal links
22. Redirect chains
23. 404 error pages
24. Pagination implementation
25. Hreflang tags (international)
26. Open Graph tags
27. Twitter Card tags
28. Favicon presence
29. Language declaration
30. Character encoding

### Content SEO (15 Checks)

31. Word count (>300)
32. Keyword in title
33. Keyword in H1
34. Keyword in content
35. Keyword density (1-3%)
36. LSI keywords presence
37. Content uniqueness
38. Duplicate content
39. Thin content detection
40. Content freshness
41. Readability score
42. Image alt text
43. Image filename optimization
44. Video content optimization
45. Internal linking quality

### Performance (10 Checks)

46. Page load time
47. Largest Contentful Paint (LCP)
48. First Input Delay (FID)
49. Cumulative Layout Shift (CLS)
50. Time to First Byte (TTFB)
51. Render-blocking resources
52. Image optimization
53. CSS minification
54. JavaScript minification
55. Browser caching

### Mobile (8 Checks)

56. Mobile viewport tag
57. Mobile-friendly design
58. Touch element spacing
59. Font size legibility
60. Content width
61. Mobile page speed
62. AMP implementation
63. Mobile usability issues

### Security (7 Checks)

64. HTTPS certificate validity
65. Mixed content warnings
66. Security headers (CSP, HSTS)
67. X-Frame-Options
68. X-Content-Type-Options
69. Referrer-Policy
70. Permissions-Policy

---

## Appendix D: Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Engineering Team | Initial PRD creation |

---

## Document Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Manager | | | |
| Engineering Lead | | | |
| Security Lead | | | |
| QA Lead | | | |
| Design Lead | | | |
