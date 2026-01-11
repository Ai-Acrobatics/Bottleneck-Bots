# PRD-11: Lead Enrichment System

**Product Requirements Document**

| Field | Value |
|-------|-------|
| **Document ID** | PRD-11 |
| **Feature Name** | Lead Enrichment System |
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

The Lead Enrichment System enables Bottleneck-Bots users to upload CSV files containing lead lists, enrich them with comprehensive contact and company data via the Apify API, and manage enriched leads for outreach campaigns. This feature includes a credit-based usage model, batch processing capabilities, individual on-demand enrichment, status tracking, and export functionality. The system integrates with the existing subscription model for credit allocation and usage tracking.

### 1.2 Background

Agency owners and sales teams frequently work with lead lists obtained from various sources (trade shows, purchased lists, web scraping, LinkedIn exports, etc.). These lists often contain minimal information (name, email, company name) and require enrichment with additional data points (phone numbers, job titles, company size, social profiles, etc.) to enable effective outreach.

Currently, users must manually enrich leads using third-party services, then re-import the data. This workflow is fragmented, time-consuming, and prone to data synchronization issues. By integrating lead enrichment directly into Bottleneck-Bots, users can maintain a unified workflow from lead import to AI-powered outreach.

### 1.3 Key Capabilities

- **CSV File Upload**: Import lead lists via CSV with flexible column mapping
- **Batch Enrichment**: Enrich hundreds of leads simultaneously via Apify API
- **Credit System**: Track and manage enrichment credits tied to subscription tiers
- **Lead List Management**: Organize leads into named lists with tagging and filtering
- **Individual Enrichment**: On-demand enrichment of single leads
- **Status Tracking**: Real-time visibility into enrichment progress and results
- **Export Functionality**: Download enriched data in multiple formats
- **Enrichment History**: Complete audit trail of all enrichment operations

### 1.4 Target Users

- **Agency Owners**: Enriching client lead lists for outreach campaigns
- **Sales Teams**: Qualifying and prioritizing prospect lists
- **Marketing Teams**: Building targeted campaign audiences
- **Business Development**: Researching potential partnership opportunities
- **Recruiters**: Enriching candidate information for outreach

---

## 2. Problem Statement

### 2.1 Current Pain Points

| Pain Point | Impact | Affected Users |
|------------|--------|----------------|
| **Manual Enrichment Process** | Hours spent copying data between platforms | All users with lead lists |
| **Data Quality Issues** | Inconsistent data formats from multiple enrichment sources | Sales and marketing teams |
| **No Credit Visibility** | Unable to track enrichment costs and usage | Finance, agency owners |
| **Fragmented Workflow** | Context switching between lead import, enrichment, and outreach | All users |
| **No Bulk Processing** | Enriching leads one-by-one is prohibitively slow | Users with large lists |
| **Export Complexity** | Difficulty merging enriched data with original lead information | Data-focused users |
| **No Enrichment History** | Cannot track which leads were enriched when | Compliance, auditing |

### 2.2 User Needs

1. **Agency Owners** need to quickly enrich client lead lists without leaving the platform
2. **Sales Teams** need verified contact information to improve outreach conversion rates
3. **Marketing Teams** need company firmographic data for segmentation
4. **Finance Teams** need visibility into enrichment credit usage and costs
5. **Operations** need the ability to schedule and monitor batch enrichment jobs

### 2.3 Business Drivers

- **Increased Platform Stickiness**: Lead enrichment creates dependency on the platform
- **Revenue Opportunity**: Credit-based model creates recurring revenue beyond subscriptions
- **Competitive Differentiation**: Integrated enrichment is a premium feature competitors lack
- **Workflow Efficiency**: 70-80% reduction in time spent on lead preparation
- **Data Quality**: Centralized enrichment ensures consistent data standards

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Description | Target |
|------|-------------|--------|
| **G1** | Enable CSV-based lead list import with intelligent column mapping | <2 minutes per import |
| **G2** | Provide reliable batch enrichment via Apify API | 99% success rate |
| **G3** | Implement transparent credit tracking and usage alerts | 100% accuracy |
| **G4** | Support multiple export formats for enriched data | 3+ formats (CSV, JSON, Excel) |
| **G5** | Deliver real-time enrichment status tracking | Updates every 5 seconds |
| **G6** | Achieve high enrichment match rate | >70% match rate |

### 3.2 Success Metrics

#### 3.2.1 Quantitative Metrics

| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| **Lead Import Time** | N/A | <30 seconds for 1000 leads | Performance monitoring |
| **Enrichment Success Rate** | N/A | >99% job completion | Job status tracking |
| **Match Rate** | N/A | >70% of leads enriched | Enrichment logs |
| **Credit Accuracy** | N/A | 100% accurate tracking | Reconciliation audits |
| **Feature Adoption** | 0% | 60% of active users | Analytics |
| **Enriched Leads per Month** | 0 | 100,000+ | Database queries |
| **Export Completion Rate** | N/A | >99.9% | Export job monitoring |

#### 3.2.2 Qualitative Metrics

- User satisfaction with enrichment quality and accuracy
- Ease of CSV import and column mapping experience
- Clarity of credit usage and remaining balance display
- Overall workflow efficiency improvement feedback

### 3.3 Key Performance Indicators (KPIs)

1. **Daily Enrichment Volume**: Total leads enriched per day across all users
2. **Credit Utilization Rate**: Percentage of allocated credits used per billing period
3. **Average Enrichment Time**: Time from job submission to completion
4. **Export Success Rate**: Percentage of successful export operations
5. **Repeat Usage Rate**: Users who enrich leads more than once per week
6. **Upsell Conversion**: Users who purchase additional credit packs

---

## 4. User Stories

### 4.1 Lead List Management Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-01 | Agency Owner | As an agency owner, I want to upload a CSV file containing leads so that I can enrich them in bulk | P0 |
| US-02 | Agency Owner | As an agency owner, I want to map CSV columns to lead fields so that data imports correctly regardless of source format | P0 |
| US-03 | Agency Owner | As an agency owner, I want to create named lead lists so that I can organize leads by campaign or client | P0 |
| US-04 | Agency Owner | As an agency owner, I want to view all my lead lists with summary statistics so that I can track my data | P1 |
| US-05 | Agency Owner | As an agency owner, I want to delete lead lists I no longer need so that I can keep my workspace clean | P1 |
| US-06 | Agency Owner | As an agency owner, I want to merge multiple lead lists so that I can consolidate data sources | P2 |

### 4.2 Batch Enrichment Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-07 | Agency Owner | As an agency owner, I want to enrich an entire lead list with one click so that I can save time | P0 |
| US-08 | Agency Owner | As an agency owner, I want to see estimated credit cost before enrichment so that I can budget accordingly | P0 |
| US-09 | Agency Owner | As an agency owner, I want to choose which data points to enrich so that I only pay for what I need | P1 |
| US-10 | Sales Rep | As a sales rep, I want to enrich only leads that have not been enriched before so that I do not waste credits | P0 |
| US-11 | Agency Owner | As an agency owner, I want to schedule enrichment jobs for off-peak hours so that I can optimize API costs | P2 |
| US-12 | Agency Owner | As an agency owner, I want to set enrichment priority levels so that important leads are processed first | P2 |

### 4.3 Individual Enrichment Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-13 | Sales Rep | As a sales rep, I want to enrich a single lead on-demand so that I can quickly get information for an immediate call | P0 |
| US-14 | Sales Rep | As a sales rep, I want to see enrichment results in real-time so that I know when data is ready | P0 |
| US-15 | Agency Owner | As an agency owner, I want to manually add leads for enrichment without uploading a file | P1 |
| US-16 | Sales Rep | As a sales rep, I want to re-enrich a lead to get updated information | P2 |

### 4.4 Credit Management Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-17 | Agency Owner | As an agency owner, I want to see my current credit balance so that I can plan enrichment activities | P0 |
| US-18 | Agency Owner | As an agency owner, I want to receive alerts when credits are running low so that I can replenish them | P0 |
| US-19 | Agency Owner | As an agency owner, I want to purchase additional credit packs so that I can continue enriching leads | P0 |
| US-20 | Finance | As a finance manager, I want to view credit usage history so that I can track costs | P1 |
| US-21 | Agency Owner | As an agency owner, I want credits to roll over unused to the next month | P2 |
| US-22 | Admin | As an admin, I want to allocate credits to sub-accounts so that I can control spending | P1 |

### 4.5 Status Tracking Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-23 | Agency Owner | As an agency owner, I want to see enrichment job progress in real-time so that I know when it will complete | P0 |
| US-24 | Agency Owner | As an agency owner, I want to see which leads were successfully enriched vs. failed so that I can take action on failures | P0 |
| US-25 | Agency Owner | As an agency owner, I want to cancel an in-progress enrichment job if needed | P1 |
| US-26 | Agency Owner | As an agency owner, I want to retry failed enrichments automatically | P1 |
| US-27 | Agency Owner | As an agency owner, I want to receive notifications when enrichment jobs complete | P2 |

### 4.6 Export Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-28 | Agency Owner | As an agency owner, I want to export enriched leads to CSV so that I can use them in other tools | P0 |
| US-29 | Agency Owner | As an agency owner, I want to choose which fields to include in exports so that I only get relevant data | P1 |
| US-30 | Agency Owner | As an agency owner, I want to export to Excel format with proper formatting | P1 |
| US-31 | Developer | As a developer, I want to export leads as JSON for API integrations | P2 |
| US-32 | Agency Owner | As an agency owner, I want to schedule recurring exports to cloud storage | P3 |

---

## 5. Functional Requirements

### 5.1 CSV Upload & Import

#### FR-01: File Upload
- **Description**: Users can upload CSV files up to 50MB containing lead data
- **Input**: CSV file, list name, optional tags
- **Output**: Created lead list with parsed records
- **Business Rules**:
  - Maximum file size: 50MB
  - Maximum leads per file: 10,000
  - Supported encodings: UTF-8, UTF-16, ISO-8859-1
  - Duplicate detection by email address within same list

#### FR-02: Column Mapping
- **Description**: Intelligent column mapping with auto-detection and manual override
- **Supported Fields**:
  | Field | Required | Description |
  |-------|----------|-------------|
  | `email` | Yes | Primary identifier for enrichment |
  | `firstName` | No | Contact first name |
  | `lastName` | No | Contact last name |
  | `companyName` | No | Company/organization name |
  | `phone` | No | Phone number |
  | `jobTitle` | No | Current job title |
  | `linkedInUrl` | No | LinkedIn profile URL |
  | `website` | No | Company website |
  | `location` | No | Geographic location |
  | `customField1-5` | No | User-defined custom fields |

#### FR-03: Import Validation
- **Description**: Validate imported data before creating lead records
- **Validations**:
  - Email format validation (RFC 5322)
  - Phone number format normalization
  - URL format validation
  - Duplicate detection and handling options (skip, update, create new)
  - Required field presence check

### 5.2 Lead List Management

#### FR-04: List Operations
- **Create**: Create named lead lists with optional description and tags
- **List**: View all lead lists with pagination and filtering
- **Get**: Retrieve single list with all leads
- **Update**: Modify list name, description, tags
- **Delete**: Soft-delete list and associated leads
- **Merge**: Combine multiple lists into one
- **Duplicate**: Create copy of existing list

#### FR-05: Lead Operations
- **Add**: Add individual leads to a list
- **Update**: Modify lead information
- **Delete**: Remove lead from list
- **Move**: Move lead between lists
- **Bulk Select**: Select multiple leads for batch operations

#### FR-06: Search & Filtering
- **Full-text Search**: Search across all lead fields
- **Field Filters**: Filter by any lead or enriched field
- **Enrichment Status Filter**: Pending, enriched, failed, not enriched
- **Date Filters**: Created date, enriched date, updated date
- **Tag Filters**: Filter by assigned tags

### 5.3 Batch Enrichment

#### FR-07: Enrichment Job Creation
- **Description**: Create batch enrichment jobs for lead lists
- **Input**: Lead list ID, enrichment options, priority level
- **Output**: Job ID with status tracking URL
- **Options**:
  | Option | Description | Default |
  |--------|-------------|---------|
  | `skipEnriched` | Skip leads already enriched | true |
  | `skipRecent` | Skip leads enriched within N days | 30 days |
  | `maxLeads` | Maximum leads to process | All |
  | `enrichmentLevel` | Basic, Standard, Premium | Standard |
  | `priority` | Low, Normal, High | Normal |

#### FR-08: Apify API Integration
- **Description**: Integration with Apify data enrichment actors
- **Enrichment Data Points**:
  | Category | Data Points |
  |----------|-------------|
  | **Contact** | Full name, phone numbers (direct, mobile, work), verified email, social profiles |
  | **Professional** | Job title, seniority level, department, LinkedIn profile, tenure |
  | **Company** | Company name, domain, industry, employee count, revenue range, location |
  | **Social** | LinkedIn, Twitter, Facebook, GitHub profiles |
  | **Technographics** | Technology stack, tools used |

#### FR-09: Job Processing
- **Queue Management**: Jobs processed via BullMQ worker queue
- **Concurrency**: Up to 5 concurrent API requests per job
- **Rate Limiting**: Respect Apify API rate limits (100 requests/minute)
- **Batching**: Process leads in batches of 50
- **Progress Tracking**: Update job progress after each batch

#### FR-10: Error Handling
- **Retry Logic**: Up to 3 retries per lead with exponential backoff
- **Partial Failure**: Continue processing even if individual leads fail
- **Error Classification**: API error, rate limit, invalid data, not found
- **Dead Letter Queue**: Store permanently failed leads for manual review

### 5.4 Individual Enrichment

#### FR-11: On-Demand Enrichment
- **Description**: Enrich single leads immediately without batch job
- **Input**: Lead ID or email address
- **Output**: Enriched lead data in real-time
- **SLA**: Complete within 10 seconds for single lead
- **Credit Cost**: 1 credit per successful enrichment

#### FR-12: Quick Enrichment
- **Description**: Enrich lead directly from search or view
- **Trigger**: "Enrich" button on lead card/row
- **Feedback**: Real-time status updates and data population

### 5.5 Credit System

#### FR-13: Credit Allocation
- **Description**: Credits allocated based on subscription tier
- **Tiers**:
  | Tier | Monthly Credits | Rollover | Bonus Credits |
  |------|-----------------|----------|---------------|
  | Starter | 100 | No | None |
  | Growth | 500 | 25% | 50 on signup |
  | Professional | 2,000 | 50% | 200 on signup |
  | Enterprise | 10,000 | 100% | Custom |

#### FR-14: Credit Consumption
- **Enrichment Types**:
  | Type | Credits |
  |------|---------|
  | Basic (email verification only) | 0.5 |
  | Standard (contact + company) | 1.0 |
  | Premium (full enrichment) | 2.0 |
  | Failed enrichment | 0 |
  | Duplicate skip | 0 |

#### FR-15: Credit Tracking
- **Real-time Balance**: Always-current credit balance display
- **Usage History**: Detailed log of all credit transactions
- **Alerts**: Configurable low-balance alerts (25%, 10%, 0%)
- **Forecasting**: Estimated depletion date based on usage patterns

#### FR-16: Credit Packs
- **Description**: Purchase additional credits outside subscription
- **Packs**:
  | Pack | Credits | Price | Valid For |
  |------|---------|-------|-----------|
  | Starter Pack | 100 | $10 | 90 days |
  | Growth Pack | 500 | $40 | 90 days |
  | Pro Pack | 2,000 | $120 | 180 days |
  | Enterprise Pack | 10,000 | $500 | 365 days |

### 5.6 Status Tracking

#### FR-17: Job Status
- **States**:
  | Status | Description |
  |--------|-------------|
  | `pending` | Job created, waiting to start |
  | `processing` | Actively enriching leads |
  | `paused` | Temporarily paused (rate limit, user action) |
  | `completed` | All leads processed |
  | `failed` | Job failed with unrecoverable error |
  | `cancelled` | User cancelled job |

#### FR-18: Progress Metrics
- **Total Leads**: Count of leads in job
- **Processed**: Count of leads attempted
- **Successful**: Count of successfully enriched leads
- **Failed**: Count of failed enrichments
- **Skipped**: Count of skipped leads (already enriched, invalid)
- **Percentage**: Overall progress percentage
- **ETA**: Estimated time to completion

#### FR-19: Lead-Level Status
- **Individual Tracking**: Status per lead within job
- **Error Details**: Specific error message for failed leads
- **Enrichment Timestamp**: When lead was enriched
- **Data Quality Score**: Confidence score for enriched data

### 5.7 Export Functionality

#### FR-20: Export Formats
- **CSV**: Standard comma-separated values
- **Excel**: .xlsx with formatted headers and data types
- **JSON**: Structured JSON for API consumers
- **Google Sheets**: Direct export to Google Sheets (future)

#### FR-21: Export Options
- **Field Selection**: Choose which fields to include
- **Enriched Only**: Export only successfully enriched leads
- **Include Original**: Include original import data alongside enriched data
- **Date Range**: Filter by enrichment date
- **Custom Filename**: User-defined export filename

#### FR-22: Export Delivery
- **Immediate Download**: Small exports (<1000 leads) download immediately
- **Background Job**: Large exports processed in background
- **Email Delivery**: Option to email download link when ready
- **Cloud Storage**: Export directly to S3, GCS, or Dropbox (future)

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| **NFR-01**: CSV upload processing | <30 seconds for 10,000 leads | End-to-end timing |
| **NFR-02**: Single lead enrichment | <10 seconds | API response time |
| **NFR-03**: Batch enrichment throughput | 1,000 leads/hour | Job completion metrics |
| **NFR-04**: Dashboard load time | <2 seconds | Page load metrics |
| **NFR-05**: Export generation | <60 seconds for 10,000 leads | Export job timing |
| **NFR-06**: Real-time status updates | Every 5 seconds | WebSocket/polling interval |

### 6.2 Scalability

| Requirement | Target | Approach |
|-------------|--------|----------|
| **NFR-07**: Concurrent users | 1,000 simultaneous | Horizontal scaling |
| **NFR-08**: Leads per account | 1,000,000 | Database partitioning |
| **NFR-09**: Concurrent enrichment jobs | 100 per instance | Worker pool scaling |
| **NFR-10**: Daily enrichment volume | 500,000 leads | Queue-based processing |
| **NFR-11**: API request capacity | 10,000 requests/minute | Load balancer, caching |

### 6.3 Reliability

| Requirement | Target | Implementation |
|-------------|--------|----------------|
| **NFR-12**: Enrichment job completion | 99.5% | Retry logic, monitoring |
| **NFR-13**: Data durability | 99.999% | Database backups, replication |
| **NFR-14**: API availability | 99.9% | Multi-AZ deployment |
| **NFR-15**: Credit accuracy | 100% | Transactional operations |
| **NFR-16**: Export reliability | 99.9% | Job queue, retries |

### 6.4 Security

| Requirement | Description | Implementation |
|-------------|-------------|----------------|
| **NFR-17**: Data encryption at rest | All lead data encrypted | AES-256 |
| **NFR-18**: Data encryption in transit | All API calls encrypted | TLS 1.3 |
| **NFR-19**: API key security | Apify keys encrypted | Vault/environment variables |
| **NFR-20**: Access control | User isolation for lead data | Row-level security |
| **NFR-21**: PII handling | GDPR/CCPA compliance | Data minimization, consent |
| **NFR-22**: Audit logging | All operations logged | Immutable audit trail |

### 6.5 Compliance

| Requirement | Description |
|-------------|-------------|
| **NFR-23**: GDPR compliance | Right to deletion, export, consent tracking |
| **NFR-24**: CCPA compliance | Consumer data rights support |
| **NFR-25**: Data retention | Configurable retention policies |
| **NFR-26**: Terms acceptance | Users must accept enrichment terms of service |

### 6.6 Observability

| Requirement | Target | Tools |
|-------------|--------|-------|
| **NFR-27**: Structured logging | All operations logged | Pino/Winston |
| **NFR-28**: Metrics collection | Key metrics exported | Prometheus/Datadog |
| **NFR-29**: Distributed tracing | End-to-end trace IDs | OpenTelemetry |
| **NFR-30**: Alerting | <5 min detection time | PagerDuty/Slack |
| **NFR-31**: Dashboard | Real-time system health | Grafana |

---

## 7. Technical Architecture

### 7.1 System Components

```
+-------------------+     +-------------------+     +---------------------+
|   Frontend (UI)   |     |   tRPC Router     |     |   Lead Enrichment   |
|   React/Next.js   | --> |   API Gateway     | --> |   Router            |
+-------------------+     +-------------------+     +---------------------+
        |                                                    |
        |                  +--------------------------------+
        |                  |                |               |
        v                  v                v               v
+---------------+  +---------------+  +-------------+  +----------------+
|   File Upload |  | Lead Service  |  | Credit Svc  |  | Enrichment Svc |
|   (Multer/S3) |  |               |  |             |  | (Apify Client) |
+---------------+  +---------------+  +-------------+  +----------------+
        |                  |                |               |
        +------------------+----------------+---------------+
                                    |
                                    v
                          +-------------------+
                          |   PostgreSQL      |
                          |   (Drizzle ORM)   |
                          +-------------------+
                                    |
        +---------------------------+---------------------------+
        |                           |                           |
        v                           v                           v
+---------------+          +----------------+          +-----------------+
|   BullMQ      |          |   Redis        |          |   S3/CloudStore |
|   Workers     |          |   Cache/Queue  |          |   File Storage  |
+---------------+          +----------------+          +-----------------+
        |
        v
+-------------------+
|   Apify API       |
|   (Enrichment)    |
+-------------------+
```

### 7.2 Database Schema

#### 7.2.1 lead_lists Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| userId | INTEGER | Reference to users table |
| name | VARCHAR(255) | List name |
| description | TEXT | Optional description |
| tags | JSONB | Array of tags |
| totalLeads | INTEGER | Count of leads in list |
| enrichedLeads | INTEGER | Count of enriched leads |
| source | VARCHAR(50) | Import source (csv, manual, api) |
| metadata | JSONB | Additional metadata |
| isArchived | BOOLEAN | Soft delete flag |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

#### 7.2.2 leads Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| userId | INTEGER | Reference to users table |
| listId | INTEGER | Reference to lead_lists |
| email | VARCHAR(320) | Lead email (indexed) |
| firstName | VARCHAR(100) | First name |
| lastName | VARCHAR(100) | Last name |
| companyName | VARCHAR(255) | Company name |
| phone | VARCHAR(50) | Phone number |
| jobTitle | VARCHAR(255) | Job title |
| linkedInUrl | VARCHAR(500) | LinkedIn profile URL |
| website | VARCHAR(500) | Company website |
| location | VARCHAR(255) | Location |
| customFields | JSONB | Custom field values |
| originalData | JSONB | Original import data |
| enrichmentStatus | VARCHAR(20) | pending/enriched/failed/skipped |
| enrichedAt | TIMESTAMP | When enriched |
| enrichmentJobId | INTEGER | Reference to enrichment_jobs |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

#### 7.2.3 enriched_data Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| leadId | INTEGER | Reference to leads (unique) |
| verifiedEmail | VARCHAR(320) | Verified email address |
| emailStatus | VARCHAR(20) | valid/invalid/catch-all/unknown |
| phoneNumbers | JSONB | Array of phone numbers with types |
| socialProfiles | JSONB | LinkedIn, Twitter, etc. |
| professionalInfo | JSONB | Title, seniority, department |
| companyInfo | JSONB | Size, revenue, industry, location |
| technographics | JSONB | Tech stack information |
| dataSource | VARCHAR(50) | Enrichment source identifier |
| confidenceScore | DECIMAL(3,2) | Data confidence 0.00-1.00 |
| rawResponse | JSONB | Complete API response |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

#### 7.2.4 enrichment_jobs Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| userId | INTEGER | Reference to users table |
| listId | INTEGER | Reference to lead_lists |
| jobType | VARCHAR(20) | batch/individual |
| status | VARCHAR(20) | pending/processing/completed/failed/cancelled |
| priority | VARCHAR(10) | low/normal/high |
| enrichmentLevel | VARCHAR(20) | basic/standard/premium |
| options | JSONB | Job configuration options |
| totalLeads | INTEGER | Total leads in job |
| processedLeads | INTEGER | Leads attempted |
| successfulLeads | INTEGER | Successfully enriched |
| failedLeads | INTEGER | Failed enrichments |
| skippedLeads | INTEGER | Skipped (already enriched, invalid) |
| creditsUsed | DECIMAL(10,2) | Credits consumed |
| estimatedCredits | DECIMAL(10,2) | Estimated credits before start |
| startedAt | TIMESTAMP | Job start time |
| completedAt | TIMESTAMP | Job completion time |
| error | TEXT | Error message if failed |
| bullmqJobId | VARCHAR(255) | BullMQ job reference |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

#### 7.2.5 enrichment_credits Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| userId | INTEGER | Reference to users table |
| subscriptionId | INTEGER | Reference to subscriptions |
| creditType | VARCHAR(20) | subscription/pack/bonus/rollover |
| creditsAllocated | DECIMAL(10,2) | Credits given |
| creditsUsed | DECIMAL(10,2) | Credits consumed |
| creditsRemaining | DECIMAL(10,2) | Current balance |
| expiresAt | TIMESTAMP | Expiration date |
| periodStart | TIMESTAMP | Billing period start |
| periodEnd | TIMESTAMP | Billing period end |
| packId | INTEGER | Reference to credit pack if purchased |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

#### 7.2.6 credit_transactions Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| userId | INTEGER | Reference to users table |
| creditAccountId | INTEGER | Reference to enrichment_credits |
| transactionType | VARCHAR(20) | debit/credit/refund/adjustment |
| amount | DECIMAL(10,2) | Transaction amount |
| balanceAfter | DECIMAL(10,2) | Balance after transaction |
| description | VARCHAR(255) | Transaction description |
| referenceType | VARCHAR(50) | enrichment_job/pack_purchase/subscription/manual |
| referenceId | INTEGER | Reference to source record |
| metadata | JSONB | Additional details |
| createdAt | TIMESTAMP | Creation timestamp |

#### 7.2.7 enrichment_credit_packs Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| slug | VARCHAR(50) | Unique pack identifier |
| name | VARCHAR(100) | Display name |
| description | TEXT | Pack description |
| creditCount | INTEGER | Credits included |
| priceCents | INTEGER | Price in cents |
| validForDays | INTEGER | Validity period |
| isActive | BOOLEAN | Available for purchase |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### 7.3 API Endpoints (tRPC Router)

#### 7.3.1 Lead List Endpoints

| Procedure | Type | Description |
|-----------|------|-------------|
| `leadEnrichment.createList` | Mutation | Create new lead list |
| `leadEnrichment.getLists` | Query | Get all user's lead lists |
| `leadEnrichment.getList` | Query | Get single list with leads |
| `leadEnrichment.updateList` | Mutation | Update list metadata |
| `leadEnrichment.deleteList` | Mutation | Soft delete list |
| `leadEnrichment.mergeLists` | Mutation | Merge multiple lists |

#### 7.3.2 Lead Endpoints

| Procedure | Type | Description |
|-----------|------|-------------|
| `leadEnrichment.importCsv` | Mutation | Import leads from CSV |
| `leadEnrichment.addLead` | Mutation | Add single lead |
| `leadEnrichment.updateLead` | Mutation | Update lead data |
| `leadEnrichment.deleteLead` | Mutation | Remove lead |
| `leadEnrichment.getLeads` | Query | Get leads with filtering |
| `leadEnrichment.searchLeads` | Query | Full-text search |
| `leadEnrichment.moveLead` | Mutation | Move lead between lists |

#### 7.3.3 Enrichment Endpoints

| Procedure | Type | Description |
|-----------|------|-------------|
| `leadEnrichment.createJob` | Mutation | Create batch enrichment job |
| `leadEnrichment.enrichSingle` | Mutation | Enrich single lead |
| `leadEnrichment.getJob` | Query | Get job status and progress |
| `leadEnrichment.getJobs` | Query | List enrichment jobs |
| `leadEnrichment.cancelJob` | Mutation | Cancel in-progress job |
| `leadEnrichment.retryFailed` | Mutation | Retry failed leads in job |
| `leadEnrichment.getEnrichedData` | Query | Get enrichment results |

#### 7.3.4 Credit Endpoints

| Procedure | Type | Description |
|-----------|------|-------------|
| `leadEnrichment.getCredits` | Query | Get credit balance and usage |
| `leadEnrichment.getCreditHistory` | Query | Get transaction history |
| `leadEnrichment.getCreditPacks` | Query | Get available credit packs |
| `leadEnrichment.purchasePack` | Mutation | Purchase credit pack |
| `leadEnrichment.estimateCost` | Query | Estimate credits for job |

#### 7.3.5 Export Endpoints

| Procedure | Type | Description |
|-----------|------|-------------|
| `leadEnrichment.exportLeads` | Mutation | Create export job |
| `leadEnrichment.getExport` | Query | Get export status/download |
| `leadEnrichment.getExports` | Query | List export history |

### 7.4 Background Workers

#### 7.4.1 Enrichment Worker

| Job Type | Description |
|----------|-------------|
| `LEAD_ENRICHMENT_BATCH` | Process batch enrichment job |
| `LEAD_ENRICHMENT_SINGLE` | Process single lead enrichment |
| `ENRICHMENT_RETRY` | Retry failed enrichments |

**Worker Configuration:**
- Concurrency: 10 jobs
- Rate Limit: 5 jobs/second
- Queue: "lead-enrichment"
- Retry: 3 attempts with exponential backoff

#### 7.4.2 Export Worker

| Job Type | Description |
|----------|-------------|
| `LEAD_EXPORT` | Generate export file |
| `EXPORT_CLEANUP` | Remove expired export files |

**Worker Configuration:**
- Concurrency: 5 jobs
- Queue: "lead-export"
- File TTL: 24 hours

### 7.5 Apify Integration

#### 7.5.1 API Client Configuration

```typescript
interface ApifyConfig {
  apiKey: string;
  actorId: string; // Data enrichment actor
  timeout: number; // 30 seconds
  retries: number; // 3
  rateLimit: number; // 100 requests/minute
}
```

#### 7.5.2 Request Format

```typescript
interface EnrichmentRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  linkedInUrl?: string;
  enrichmentLevel: 'basic' | 'standard' | 'premium';
}
```

#### 7.5.3 Response Mapping

| Apify Field | Internal Field | Data Type |
|-------------|----------------|-----------|
| `person.email` | `verifiedEmail` | string |
| `person.phone_numbers` | `phoneNumbers` | array |
| `person.linkedin_url` | `socialProfiles.linkedin` | string |
| `person.title` | `professionalInfo.jobTitle` | string |
| `company.name` | `companyInfo.name` | string |
| `company.size` | `companyInfo.employeeCount` | string |
| `company.industry` | `companyInfo.industry` | string |
| `confidence` | `confidenceScore` | number |

### 7.6 Technology Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| **API Framework** | tRPC + Express | Type-safe APIs, existing stack |
| **Database** | PostgreSQL + Drizzle | Relational data, strong typing |
| **Queue** | BullMQ + Redis | Job processing, rate limiting |
| **File Storage** | S3/CloudStorage | Scalable file storage |
| **CSV Parsing** | Papa Parse | Robust CSV handling |
| **Enrichment API** | Apify | Comprehensive data enrichment |
| **Export** | ExcelJS | Excel file generation |

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Dependency | Component | Impact |
|------------|-----------|--------|
| User Authentication | `schema-auth.ts` | User identity for leads |
| Subscription System | `schema-subscriptions.ts` | Credit allocation by tier |
| File Upload | `multer` middleware | CSV file handling |
| Queue System | BullMQ infrastructure | Job processing |
| Notification System | `schema-alerts.ts` | Low credit alerts |

### 8.2 External Dependencies

| Dependency | Version | Purpose | Risk Level |
|------------|---------|---------|------------|
| Apify SDK | ^3.x | Data enrichment API | Medium |
| Papa Parse | ^5.x | CSV parsing | Low |
| ExcelJS | ^4.x | Excel export | Low |
| nanoid | ^5.x | Unique ID generation | Low |
| zod | ^3.x | Input validation | Low |
| date-fns | ^3.x | Date manipulation | Low |

### 8.3 Infrastructure Dependencies

| Dependency | Purpose | Fallback |
|------------|---------|----------|
| PostgreSQL | Primary data store | None (required) |
| Redis | Queue, caching | In-memory fallback |
| S3/CloudStorage | File storage | Local storage (dev) |
| Apify API | Enrichment service | Graceful degradation |

### 8.4 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `APIFY_API_KEY` | Apify API authentication | Yes |
| `APIFY_ACTOR_ID` | Enrichment actor identifier | Yes |
| `S3_BUCKET_LEADS` | S3 bucket for lead files | Yes |
| `S3_ACCESS_KEY` | S3 access credentials | Yes |
| `S3_SECRET_KEY` | S3 secret credentials | Yes |
| `ENRICHMENT_RATE_LIMIT` | Requests per minute | No (default: 100) |
| `EXPORT_FILE_TTL` | Export file lifetime hours | No (default: 24) |

---

## 9. Out of Scope

### 9.1 Explicitly Excluded

| Item | Reason | Future Phase |
|------|--------|--------------|
| **Real-time Enrichment Webhooks** | Complexity, polling sufficient | v2.5 |
| **Multiple Enrichment Providers** | Focus on Apify first | v3.0 |
| **Lead Scoring** | Separate feature scope | v2.3 |
| **CRM Integration** | Separate PRD required | v2.5 |
| **Email Verification (standalone)** | Bundled with enrichment | v2.2 |
| **Phone Verification (standalone)** | Bundled with enrichment | v2.2 |
| **Lead Deduplication Across Lists** | Complex matching logic | v2.5 |
| **Scheduled Recurring Enrichment** | Nice-to-have | v3.0 |
| **White-label Export Branding** | Enterprise feature | v3.0 |

### 9.2 Deferred Features

| Feature | Priority | Target Release |
|---------|----------|----------------|
| Google Sheets Export | P2 | v2.2 |
| Zapier Integration | P2 | v2.3 |
| Enrichment Templates | P3 | v2.5 |
| Team Credit Sharing | P2 | v2.3 |
| API Access for Enrichment | P2 | v2.3 |
| Custom Enrichment Fields | P3 | v3.0 |

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **R1**: Apify API rate limiting | High | High | Implement queue throttling, backoff strategies |
| **R2**: Apify API outages | Low | High | Circuit breaker pattern, retry with exponential backoff |
| **R3**: Large file upload failures | Medium | Medium | Chunked upload, resume capability, file size limits |
| **R4**: CSV parsing edge cases | Medium | Medium | Robust parsing library, encoding detection, validation |
| **R5**: Credit calculation errors | Low | Critical | Transactional operations, reconciliation jobs, auditing |
| **R6**: Export file storage costs | Medium | Medium | TTL policies, file size limits, storage monitoring |

### 10.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **R7**: Low enrichment match rate | Medium | High | Set clear expectations, show match rate stats, alternative providers |
| **R8**: Credit pricing too high | Medium | Medium | Market analysis, competitive pricing, volume discounts |
| **R9**: Data quality complaints | Medium | High | Confidence scores, refund policy for failed enrichments |
| **R10**: GDPR/Privacy concerns | Medium | High | Clear consent flow, data processing agreements, DPA |

### 10.3 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **R11**: Apify cost overruns | Medium | High | Usage monitoring, alerts, budget limits |
| **R12**: Worker failures | Medium | Medium | Dead-letter queues, monitoring, auto-restart |
| **R13**: Storage growth | High | Medium | Retention policies, archival, compression |
| **R14**: Support burden | Medium | Medium | Self-service documentation, FAQ, in-app help |

### 10.4 Risk Matrix

```
Impact      Critical |     R5     |
            High     |            |     R1, R2, R7, R9, R11
            Medium   |            |     R3, R4, R8, R10, R12, R13, R14
            Low      |            |     R6
                     +-----------+-----------------
                        Low         Medium    High
                            Probability
```

---

## 11. Milestones & Timeline

### 11.1 Phase 1: Foundation (Weeks 1-2)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M1.1** | Database schema design and migration | Schema files, migration scripts | Backend |
| **M1.2** | Lead list CRUD operations | tRPC router, service layer | Backend |
| **M1.3** | CSV upload and parsing | File upload endpoint, parser | Backend |
| **M1.4** | Column mapping UI | React component, auto-detection | Frontend |
| **M1.5** | Unit tests for core operations | 80% coverage | QA |

**Exit Criteria**:
- [ ] Lead lists can be created, updated, deleted
- [ ] CSV files can be uploaded and parsed
- [ ] Column mapping works for common formats
- [ ] Leads stored in database correctly

### 11.2 Phase 2: Apify Integration (Weeks 3-4)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M2.1** | Apify client implementation | API client, error handling | Backend |
| **M2.2** | Single lead enrichment | Endpoint, service method | Backend |
| **M2.3** | Batch enrichment job system | BullMQ worker, job queue | Backend |
| **M2.4** | Enrichment status tracking | Real-time updates, UI | Full Stack |
| **M2.5** | Integration tests | Apify mock, E2E tests | QA |

**Exit Criteria**:
- [ ] Single leads can be enriched on-demand
- [ ] Batch jobs process leads successfully
- [ ] Status updates display in real-time
- [ ] Error handling covers all failure cases

### 11.3 Phase 3: Credit System (Weeks 5-6)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M3.1** | Credit schema and allocation | Database tables, tier integration | Backend |
| **M3.2** | Credit tracking and consumption | Transaction logging, balance updates | Backend |
| **M3.3** | Credit pack purchasing | Stripe integration, pack management | Backend |
| **M3.4** | Credit dashboard UI | Balance display, usage charts | Frontend |
| **M3.5** | Low credit alerts | Notification triggers, email alerts | Full Stack |

**Exit Criteria**:
- [ ] Credits allocated based on subscription tier
- [ ] Credits consumed accurately per enrichment
- [ ] Credit packs can be purchased
- [ ] Low balance alerts trigger correctly

### 11.4 Phase 4: Export & Polish (Weeks 7-8)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M4.1** | Export to CSV/Excel | Export service, file generation | Backend |
| **M4.2** | Export options and filtering | Field selection, date filters | Full Stack |
| **M4.3** | Performance optimization | Query optimization, caching | Backend |
| **M4.4** | UI/UX polish | Error states, loading states, responsiveness | Frontend |
| **M4.5** | Documentation | API docs, user guide | Tech Writer |

**Exit Criteria**:
- [ ] Exports work for all supported formats
- [ ] Large exports complete within SLA
- [ ] UI provides clear feedback for all states
- [ ] Documentation is complete

### 11.5 Phase 5: Testing & Launch (Weeks 9-10)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M5.1** | Load testing | Performance benchmarks, bottleneck fixes | DevOps |
| **M5.2** | Security audit | Vulnerability assessment, fixes | Security |
| **M5.3** | Beta testing | User feedback, bug fixes | Product |
| **M5.4** | Production deployment | Infrastructure, monitoring | DevOps |
| **M5.5** | Launch monitoring | Dashboards, alerts, on-call | All |

**Exit Criteria**:
- [ ] Performance meets SLA requirements
- [ ] No critical security vulnerabilities
- [ ] Beta users approve for launch
- [ ] Monitoring and alerting in place

### 11.6 Gantt Chart

```
Week:        1    2    3    4    5    6    7    8    9    10
Phase 1:     ████████
Phase 2:               ████████
Phase 3:                         ████████
Phase 4:                                   ████████
Phase 5:                                             ████████
```

**Total Duration**: 10 weeks
**Buffer**: 1 week built into phases 4-5

---

## 12. Acceptance Criteria

### 12.1 Lead List Management

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-01** | Users can create lead lists with name, description, and tags | E2E test |
| **AC-02** | CSV files up to 50MB can be uploaded successfully | Load test |
| **AC-03** | Column mapping auto-detects common header names | Unit test |
| **AC-04** | Manual column mapping allows any CSV format | E2E test |
| **AC-05** | Duplicate leads within same list are detected | Unit test |
| **AC-06** | Lead lists can be updated, archived, and deleted | E2E test |
| **AC-07** | Leads can be searched and filtered by any field | E2E test |

### 12.2 Batch Enrichment

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-08** | Batch enrichment jobs can be created for lead lists | E2E test |
| **AC-09** | Job shows estimated credit cost before starting | Unit test |
| **AC-10** | Job progress updates in real-time (every 5 seconds) | Integration test |
| **AC-11** | Successfully enriched leads show updated data | E2E test |
| **AC-12** | Failed enrichments are logged with error details | Log verification |
| **AC-13** | Jobs can be cancelled while in progress | E2E test |
| **AC-14** | Retry mechanism handles transient failures | Integration test |
| **AC-15** | Completed jobs show summary statistics | E2E test |

### 12.3 Individual Enrichment

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-16** | Single lead enrichment completes within 10 seconds | Performance test |
| **AC-17** | Enrichment button available on lead detail view | UI test |
| **AC-18** | Enriched data displays immediately after completion | E2E test |
| **AC-19** | Failed individual enrichment shows error message | E2E test |

### 12.4 Credit System

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-20** | Credit balance displays accurately in dashboard | E2E test |
| **AC-21** | Credits deducted correctly per enrichment type | Unit test |
| **AC-22** | Failed enrichments do not consume credits | Unit test |
| **AC-23** | Credit transaction history is complete and accurate | Database verification |
| **AC-24** | Credit packs can be purchased and credits added | E2E test |
| **AC-25** | Low credit alerts trigger at configured thresholds | Integration test |
| **AC-26** | Credit rollover works according to tier rules | Unit test |

### 12.5 Export Functionality

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-27** | Leads can be exported to CSV format | E2E test |
| **AC-28** | Leads can be exported to Excel format | E2E test |
| **AC-29** | Export field selection filters output correctly | Unit test |
| **AC-30** | Large exports (10,000+ leads) complete successfully | Load test |
| **AC-31** | Export download links work for 24 hours | Integration test |
| **AC-32** | Export includes both original and enriched data | Unit test |

### 12.6 Performance & Reliability

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-33** | CSV upload processes 10,000 leads in <30 seconds | Performance test |
| **AC-34** | Batch enrichment achieves 1,000 leads/hour throughput | Load test |
| **AC-35** | API endpoints respond within 500ms (P95) | APM metrics |
| **AC-36** | System handles 100 concurrent enrichment jobs | Load test |
| **AC-37** | No data loss occurs during job failures | Chaos test |

### 12.7 Security & Compliance

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-38** | Lead data is isolated per user (no cross-user access) | Security test |
| **AC-39** | API keys are encrypted in storage | Security audit |
| **AC-40** | All operations are logged for audit trail | Log verification |
| **AC-41** | PII handling complies with GDPR requirements | Compliance review |
| **AC-42** | Data deletion requests remove all lead data | E2E test |

---

## Appendix A: API Reference

### A.1 Create Lead List

```typescript
interface CreateListInput {
  name: string; // 1-255 chars
  description?: string;
  tags?: string[];
}

interface CreateListOutput {
  id: number;
  name: string;
  createdAt: Date;
}
```

### A.2 Import CSV

```typescript
interface ImportCsvInput {
  listId: number;
  file: File; // Max 50MB
  columnMapping: Record<string, string>;
  duplicateHandling: 'skip' | 'update' | 'create';
}

interface ImportCsvOutput {
  imported: number;
  duplicates: number;
  errors: Array<{ row: number; error: string }>;
}
```

### A.3 Create Enrichment Job

```typescript
interface CreateJobInput {
  listId: number;
  options: {
    skipEnriched?: boolean; // default: true
    skipRecent?: number; // days, default: 30
    maxLeads?: number;
    enrichmentLevel?: 'basic' | 'standard' | 'premium';
    priority?: 'low' | 'normal' | 'high';
  };
}

interface CreateJobOutput {
  jobId: number;
  estimatedCredits: number;
  estimatedDuration: number; // seconds
  totalLeads: number;
}
```

### A.4 Get Job Status

```typescript
interface JobStatus {
  id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: {
    total: number;
    processed: number;
    successful: number;
    failed: number;
    skipped: number;
    percentage: number;
  };
  creditsUsed: number;
  startedAt?: Date;
  completedAt?: Date;
  eta?: number; // seconds remaining
}
```

### A.5 Export Leads

```typescript
interface ExportLeadsInput {
  listId: number;
  format: 'csv' | 'excel' | 'json';
  options: {
    fields?: string[];
    enrichedOnly?: boolean;
    includeOriginal?: boolean;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
}

interface ExportLeadsOutput {
  exportId: number;
  status: 'pending' | 'processing' | 'ready' | 'expired';
  downloadUrl?: string;
  expiresAt?: Date;
}
```

---

## Appendix B: Enrichment Data Schema

### B.1 Standard Enrichment Response

```typescript
interface EnrichedData {
  verifiedEmail: string | null;
  emailStatus: 'valid' | 'invalid' | 'catch-all' | 'unknown';

  phoneNumbers: Array<{
    number: string;
    type: 'mobile' | 'work' | 'direct' | 'main';
    verified: boolean;
  }>;

  socialProfiles: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    github?: string;
  };

  professionalInfo: {
    jobTitle?: string;
    seniorityLevel?: 'entry' | 'mid' | 'senior' | 'executive' | 'c-suite';
    department?: string;
    tenure?: number; // months
  };

  companyInfo: {
    name?: string;
    domain?: string;
    industry?: string;
    employeeCount?: string; // range like "51-200"
    revenueRange?: string; // range like "$10M-$50M"
    location?: {
      city?: string;
      state?: string;
      country?: string;
    };
    linkedinUrl?: string;
    founded?: number; // year
  };

  technographics?: {
    technologies: string[];
    categories: string[];
  };

  confidenceScore: number; // 0.00-1.00
  enrichedAt: Date;
  dataSource: string;
}
```

---

## Appendix C: Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `LIST_NOT_FOUND` | 404 | Lead list does not exist or not accessible |
| `LEAD_NOT_FOUND` | 404 | Lead does not exist or not accessible |
| `JOB_NOT_FOUND` | 404 | Enrichment job does not exist |
| `INSUFFICIENT_CREDITS` | 402 | Not enough credits for operation |
| `FILE_TOO_LARGE` | 413 | CSV file exceeds 50MB limit |
| `INVALID_CSV` | 400 | CSV parsing failed |
| `INVALID_COLUMN_MAPPING` | 400 | Column mapping is invalid |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `ENRICHMENT_FAILED` | 502 | Apify API returned error |
| `JOB_ALREADY_CANCELLED` | 400 | Cannot cancel completed/cancelled job |
| `EXPORT_EXPIRED` | 410 | Export file has expired |
| `DUPLICATE_LIST_NAME` | 409 | List name already exists for user |

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
| Finance | | | |
