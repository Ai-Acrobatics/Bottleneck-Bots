# PRD: Lead Enrichment & Management

## Overview
The Lead Enrichment & Management system provides comprehensive lead handling capabilities within Bottleneck-Bots. It enables users to create lead lists, import data from CSV files, perform bulk enrichment using Apify and AI, discover contact information (LinkedIn, email, phone), score and qualify leads, and integrate seamlessly with CRM systems.

## Problem Statement
Lead generation and management is fragmented and manual:
- Lead data is often incomplete, missing emails or phone numbers
- Manual research for each lead is time-consuming
- Lead qualification is subjective and inconsistent
- Data lives in spreadsheets disconnected from workflows
- CRM updates are manual and error-prone
- Bulk operations require technical expertise

## Goals & Objectives

### Primary Goals
- Centralize lead management with list creation and organization
- Enable bulk CSV import with intelligent field mapping
- Automate lead enrichment with multiple data sources
- Provide consistent lead scoring and qualification
- Seamlessly sync with popular CRM platforms

### Success Metrics
- Enrichment success rate: >85%
- Email discovery rate: >70%
- Phone discovery rate: >50%
- Lead scoring accuracy: >80%
- CRM sync reliability: >99%
- Processing speed: 100 leads/minute

## User Stories

### Sales Manager
- As a sales manager, I want to import my lead lists from CSV so that I can centralize my lead data
- As a sales manager, I want leads automatically scored so that my team prioritizes the best opportunities

### Sales Rep
- As a sales rep, I want missing emails and phones filled in automatically so that I can reach more prospects
- As a sales rep, I want LinkedIn profiles linked to leads so that I can research before outreach

### Marketing Manager
- As a marketing manager, I want to enrich leads with company data so that I can segment my campaigns
- As a marketing manager, I want leads synced to our CRM so that sales has accurate data

### Agency Owner
- As an agency owner, I want to enrich client lead lists in bulk so that I can deliver complete data
- As an agency owner, I want to track enrichment credits so that I can manage costs

## Functional Requirements

### Must Have (P0)

1. **Lead List Management**
   - Create and name lead lists
   - List organization with folders/tags
   - Duplicate detection and merging
   - List sharing with team members
   - List archiving and deletion
   - Search and filter within lists
   - Bulk selection and actions

2. **CSV Import**
   - File upload with progress tracking
   - Automatic column detection
   - Intelligent field mapping suggestions
   - Custom field mapping UI
   - Data validation and error reporting
   - Large file support (100k+ rows)
   - Import history and undo

3. **Lead Enrichment Engine**
   - Multi-source enrichment pipeline
   - Apify actor integration (Apollo, LinkedIn, etc.)
   - AI-powered web search enrichment
   - Enrichment job queuing
   - Progress tracking and ETA
   - Credit usage tracking
   - Enrichment source attribution

4. **Contact Discovery**
   - **Email Lookup**
     - Pattern-based discovery
     - Email verification (MX check)
     - Catch-all detection
     - Confidence scoring
   - **Phone Lookup**
     - Direct dial discovery
     - Mobile vs landline classification
     - Phone validation
     - DNC list checking
   - **LinkedIn Lookup**
     - Profile URL discovery
     - Profile data extraction
     - Connection degree detection
     - Profile image capture

5. **Lead Scoring & Qualification**
   - Configurable scoring criteria
   - Score components:
     - Data completeness
     - Company fit (size, industry)
     - Engagement signals
     - Recency of data
   - Qualification stages (MQL, SQL, etc.)
   - Score history tracking
   - Automatic stage progression

6. **CRM Integration**
   - Supported CRMs: Salesforce, HubSpot, GoHighLevel, Pipedrive
   - Two-way sync configuration
   - Field mapping customization
   - Sync scheduling
   - Conflict resolution rules
   - Sync history and logs
   - Error handling and retry

### Should Have (P1)

1. **Company Enrichment**
   - Company name lookup
   - Website discovery
   - Industry classification
   - Company size estimation
   - Revenue data (where available)
   - Technology stack detection
   - Social profiles

2. **Data Validation**
   - Email format validation
   - Phone format normalization
   - Address standardization
   - Name parsing and formatting
   - Company name normalization
   - Duplicate detection across lists

3. **Enrichment Templates**
   - Pre-configured enrichment flows
   - Template customization
   - Template sharing
   - Cost estimation per template

### Nice to Have (P2)

1. **AI-Powered Features**
   - Lead fit prediction
   - Best time to contact
   - Personalization suggestions
   - Similar lead discovery
   - Buyer intent signals

2. **Advanced Segmentation**
   - Dynamic segments
   - Segment-based enrichment
   - Segment analytics
   - Cross-segment comparison

3. **Lead Activity Tracking**
   - Email open tracking
   - Website visit tracking
   - Social engagement
   - Call disposition

## Non-Functional Requirements

### Performance
- CSV import: 100k rows in <5 minutes
- Single lead enrichment: <10 seconds
- Bulk enrichment: 100 leads/minute
- Search response: <500ms
- CRM sync latency: <5 minutes
- Dashboard load: <2 seconds

### Security
- PII encryption at rest
- Access control by list
- Audit logging for exports
- GDPR data export/deletion
- CCPA compliance
- Data retention policies

### Scalability
- 1M+ leads per account
- 100+ concurrent enrichment jobs
- Distributed processing
- Horizontal scaling
- Rate limit management

### Reliability
- 99.9% availability
- Enrichment job recovery
- CRM sync retry logic
- Data consistency checks
- Backup and restore

## Technical Requirements

### Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Lead UI       │────▶│  Lead API        │────▶│  PostgreSQL     │
│   (React)       │◀────│  (Next.js)       │◀────│  (Leads/Lists)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │  Apify     │   │  AI Search │   │  Email     │
       │  Actors    │   │  (Gemini)  │   │  Verify    │
       └────────────┘   └────────────┘   └────────────┘
              │                │                │
              ▼                ▼                ▼
       ┌────────────────────────────────────────────┐
       │         Enrichment Orchestrator            │
       │  - Job queue (BullMQ)                      │
       │  - Source routing                          │
       │  - Result aggregation                      │
       └────────────────────────────────────────────┘
              │                                │
              ▼                                ▼
       ┌────────────┐                   ┌────────────┐
       │  Scoring   │                   │  CRM Sync  │
       │  Engine    │                   │  Service   │
       └────────────┘                   └────────────┘
```

### Dependencies
- **Enrichment Sources**
  - Apify platform (actors for LinkedIn, Apollo, etc.)
  - Google Gemini API (AI-powered search)
  - ZeroBounce/NeverBounce (email verification)
  - Twilio Lookup (phone validation)

- **CRM Integrations**
  - Salesforce REST API
  - HubSpot API
  - GoHighLevel API
  - Pipedrive API

- **Processing**
  - BullMQ (job queue)
  - Redis (caching)
  - Papa Parse (CSV parsing)

### API Specifications

#### Create Lead List
```typescript
POST /api/leads/lists
Request:
{
  name: string;
  description?: string;
  folder?: string;
  tags?: string[];
  settings?: {
    deduplication: 'email' | 'phone' | 'both';
    defaultScoring?: ScoringConfig;
  };
}
Response:
{
  listId: string;
  name: string;
  leadCount: 0;
  createdAt: string;
}
```

#### Import CSV
```typescript
POST /api/leads/lists/{listId}/import
Request (multipart/form-data):
{
  file: File;
  mapping: {
    [csvColumn: string]: string; // maps to lead field
  };
  options?: {
    skipDuplicates: boolean;
    updateExisting: boolean;
    enrichAfterImport: boolean;
  };
}
Response:
{
  importId: string;
  status: 'processing';
  totalRows: number;
  estimatedTime: number;
}
```

#### Get Import Status
```typescript
GET /api/leads/imports/{importId}
Response:
{
  importId: string;
  status: 'processing' | 'completed' | 'failed';
  progress: {
    processed: number;
    total: number;
    percentage: number;
  };
  results: {
    imported: number;
    updated: number;
    skipped: number;
    errors: number;
  };
  errors?: ImportError[];
  completedAt?: string;
}
```

#### Enrich Leads
```typescript
POST /api/leads/enrich
Request:
{
  leadIds: string[];
  sources: ('linkedin' | 'email' | 'phone' | 'company' | 'all')[];
  options?: {
    overwriteExisting: boolean;
    priority: 'low' | 'normal' | 'high';
    notifyOnComplete: boolean;
  };
}
Response:
{
  jobId: string;
  status: 'queued';
  leadsQueued: number;
  estimatedCredits: number;
  estimatedTime: number;
}
```

#### Get Enrichment Results
```typescript
GET /api/leads/enrich/{jobId}
Response:
{
  jobId: string;
  status: 'processing' | 'completed' | 'partial';
  progress: {
    processed: number;
    total: number;
    percentage: number;
  };
  results: {
    enriched: number;
    noDataFound: number;
    failed: number;
  };
  breakdown: {
    email: { found: number; verified: number };
    phone: { found: number; mobile: number };
    linkedin: { found: number };
    company: { found: number };
  };
  creditsUsed: number;
  completedAt?: string;
}
```

#### Score Leads
```typescript
POST /api/leads/score
Request:
{
  leadIds: string[];
  config?: {
    weights: {
      dataCompleteness: number;
      companyFit: number;
      engagement: number;
      recency: number;
    };
    thresholds: {
      mql: number;
      sql: number;
    };
  };
}
Response:
{
  scored: number;
  distribution: {
    hot: number;
    warm: number;
    cold: number;
  };
  averageScore: number;
}
```

#### Sync to CRM
```typescript
POST /api/leads/crm/sync
Request:
{
  listId: string;
  crmId: string;
  options: {
    direction: 'push' | 'pull' | 'bidirectional';
    createNew: boolean;
    updateExisting: boolean;
    fieldMapping: {
      [leadField: string]: string; // maps to CRM field
    };
    filters?: LeadFilter[];
  };
}
Response:
{
  syncId: string;
  status: 'syncing';
  leadsToSync: number;
}
```

## Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Enrichment Success Rate | >85% | Enriched / Attempted |
| Email Discovery Rate | >70% | Emails found / Total leads |
| Phone Discovery Rate | >50% | Phones found / Total leads |
| Lead Scoring Accuracy | >80% | Validated predictions |
| CRM Sync Reliability | >99% | Successful syncs / Total |
| Processing Speed | 100/min | Leads enriched per minute |
| Import Speed | 100k in 5min | CSV processing time |

## Dependencies

### Internal Dependencies
- AI orchestration (for AI-powered enrichment)
- Browser automation (for LinkedIn scraping)
- Storage service (for CSV files)
- Notification service (for job completion)

### External Dependencies
- Apify platform and actors
- Email verification service
- Phone validation service
- CRM APIs (Salesforce, HubSpot, etc.)

### Blocking Dependencies
- Apify account and credits
- CRM API access tokens
- Email verification account

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| LinkedIn rate limiting | High | High | Distributed scraping, delays, proxy rotation |
| Apify actor failures | Medium | Medium | Multiple actors, fallback sources, retry logic |
| Inaccurate enrichment data | High | Medium | Multi-source verification, confidence scoring |
| CRM API rate limits | Medium | Medium | Batching, queue management, retry with backoff |
| High enrichment costs | High | High | Cost estimation, usage quotas, source optimization |
| Data privacy violations | Critical | Low | Consent management, GDPR compliance, audit logs |
| Large CSV import failures | Medium | Medium | Chunked processing, resume capability, validation |

## Timeline & Milestones

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: List Management | 2 weeks | CRUD, organization, search |
| Phase 2: CSV Import | 2 weeks | Upload, mapping, validation |
| Phase 3: Enrichment Engine | 4 weeks | Multi-source pipeline, job queue |
| Phase 4: Contact Discovery | 3 weeks | Email, phone, LinkedIn lookup |
| Phase 5: Lead Scoring | 2 weeks | Scoring config, automation |
| Phase 6: CRM Integration | 3 weeks | Salesforce, HubSpot, GHL sync |
| Phase 7: Testing | 2 weeks | Integration testing, accuracy validation |

## Open Questions
1. Should we support custom enrichment sources beyond Apify?
2. What is the enrichment credit pricing model?
3. How do we handle lead ownership in multi-user accounts?
4. Should we support webhook notifications for enrichment updates?
5. How long do we retain enrichment job data?
