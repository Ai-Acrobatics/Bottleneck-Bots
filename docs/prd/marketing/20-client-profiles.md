# PRD: Client Profile Management

## Overview
A comprehensive client profile management system for Bottleneck-Bots that centralizes client business information, brand voice configurations, GoHighLevel (GHL) subaccount linking, and activity tracking. This system enables personalized automation experiences and streamlined agency operations.

## Problem Statement
Agencies managing multiple clients need centralized client intelligence:
- Client information is scattered across multiple systems
- Brand voice settings vary by client and need consistent application
- GHL subaccount connections require reliable management
- Client activity and automation performance needs tracking
- Onboarding new clients is time-consuming and error-prone

## Goals & Objectives
- **Primary Goals**
  - Centralize all client information in one accessible location
  - Enable per-client brand voice and automation configuration
  - Streamline GHL subaccount integration and management
  - Track client activity and engagement with automations

- **Success Metrics**
  - 50% reduction in client onboarding time
  - 100% of active clients with complete profiles
  - 95% GHL sync reliability
  - 30% improvement in client satisfaction scores

## User Stories
- As an **agency owner**, I want to manage all client profiles so that I have centralized visibility
- As an **account manager**, I want to configure client-specific brand voice so that automations match their identity
- As an **operations manager**, I want to link GHL subaccounts so that data flows seamlessly
- As a **client success manager**, I want to track client activity so that I can identify issues early
- As an **admin**, I want to onboard new clients quickly so that they get value faster
- As a **client**, I want my automations to reflect my brand so that communications are consistent

## Functional Requirements

### Must Have (P0)
- **Client Business Information**
  - Company details (name, industry, size, location)
  - Contact information (primary, billing, technical)
  - Business classification and tags
  - Custom fields for industry-specific data
  - Client status (prospect, active, churned)
  - Contract and subscription details

- **Brand Voice Configuration**
  - Per-client brand voice profiles
  - Tone and style settings
  - Approved messaging templates
  - Logo and brand assets
  - Communication preferences
  - Industry-specific terminology

- **GHL Subaccount Linking**
  - OAuth-based subaccount connection
  - Credential management and refresh
  - Sync status monitoring
  - Multi-subaccount support per client
  - Data mapping configuration
  - Error handling and reconnection

- **Activity Tracking**
  - Automation execution logs per client
  - Usage statistics and trends
  - Communication history
  - Event timeline
  - Performance metrics
  - Alert and issue tracking

### Should Have (P1)
- Client portal for self-service profile updates
- Bulk client import/export
- Client health scoring
- Automated data enrichment
- White-label branding options
- Client-facing dashboards

### Nice to Have (P2)
- CRM integrations (Salesforce, HubSpot)
- Client satisfaction surveys
- Revenue attribution per client
- Predictive churn analysis
- AI-powered client insights
- Mobile client management app

## Non-Functional Requirements

### Performance
- Profile load time < 500ms
- GHL sync latency < 30 seconds
- Activity log queries < 1 second
- Support 10,000+ client profiles per agency

### Security
- Client data isolation
- Role-based access to client data
- Encrypted credential storage
- Audit logging for all access
- GDPR/CCPA compliance features

### Reliability
- 99.9% availability for profile service
- GHL connection resilience
- Data backup and recovery

## Technical Requirements

### Architecture
```
┌────────────────────────────────────────────────────────────────┐
│                  Client Profile Management                      │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Client     │  │  Brand       │  │   GHL                │  │
│  │   Registry   │  │  Voice       │  │   Connector          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Activity    │  │   Asset      │  │   Analytics          │  │
│  │  Tracker     │  │   Manager    │  │   Engine             │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│       PostgreSQL       │       S3/R2      │      Redis         │
└────────────────────────────────────────────────────────────────┘
```

### Dependencies
- **PostgreSQL**: Client data storage
- **Redis**: Caching and real-time updates
- **Object Storage**: Brand assets and documents
- **GHL API**: Subaccount integration
- **Background Workers**: Sync and analytics jobs

### APIs
- `POST /clients` - Create client profile
- `GET /clients` - List clients
- `GET /clients/{id}` - Get client details
- `PUT /clients/{id}` - Update client profile
- `DELETE /clients/{id}` - Archive client
- `GET /clients/{id}/brand-voice` - Get brand voice settings
- `PUT /clients/{id}/brand-voice` - Update brand voice
- `POST /clients/{id}/ghl/connect` - Connect GHL subaccount
- `GET /clients/{id}/ghl/status` - Get GHL connection status
- `POST /clients/{id}/ghl/sync` - Trigger manual sync
- `GET /clients/{id}/activity` - Get activity log
- `GET /clients/{id}/metrics` - Get client metrics
- `POST /clients/{id}/assets` - Upload brand asset
- `GET /clients/export` - Export client data

### Database Schema
```sql
-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),

  -- Basic Information
  company_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  industry VARCHAR(100),
  company_size VARCHAR(30), -- 1-10, 11-50, 51-200, 201-500, 500+
  website VARCHAR(255),

  -- Classification
  client_type VARCHAR(30) DEFAULT 'standard', -- prospect, standard, premium, enterprise
  status VARCHAR(20) DEFAULT 'active', -- prospect, active, paused, churned
  tags VARCHAR(50)[],

  -- Location
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state_province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(2), -- ISO 2-letter code
  timezone VARCHAR(50),

  -- Contract
  contract_start_date DATE,
  contract_end_date DATE,
  monthly_value DECIMAL(10,2),
  billing_cycle VARCHAR(20), -- monthly, quarterly, annual

  -- Custom Data
  custom_fields JSONB DEFAULT '{}',
  notes TEXT,

  -- Metadata
  created_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Client Contacts
CREATE TABLE client_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  contact_type VARCHAR(30) NOT NULL, -- primary, billing, technical, marketing
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  title VARCHAR(100),
  is_primary BOOLEAN DEFAULT FALSE,
  preferences JSONB DEFAULT '{}', -- communication preferences
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Brand Voice Configurations
CREATE TABLE client_brand_voice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE UNIQUE,

  -- Tone Settings
  formality_level INTEGER CHECK (formality_level BETWEEN 0 AND 100), -- 0=casual, 100=formal
  friendliness_level INTEGER CHECK (friendliness_level BETWEEN 0 AND 100),
  enthusiasm_level INTEGER CHECK (enthusiasm_level BETWEEN 0 AND 100),

  -- Style Guidelines
  use_emojis BOOLEAN DEFAULT FALSE,
  emoji_style VARCHAR(20), -- none, minimal, moderate, expressive
  sentence_length VARCHAR(20) DEFAULT 'medium', -- short, medium, long, varied
  use_contractions BOOLEAN DEFAULT TRUE,
  first_person VARCHAR(20) DEFAULT 'we', -- we, I, company_name

  -- Vocabulary
  preferred_terms JSONB DEFAULT '[]',
  avoided_terms JSONB DEFAULT '[]',
  industry_terms JSONB DEFAULT '[]',
  competitor_mentions VARCHAR(30) DEFAULT 'avoid', -- avoid, neutral, compare

  -- Templates
  greeting_template TEXT,
  closing_template TEXT,
  common_responses JSONB DEFAULT '{}',

  -- Examples
  example_messages JSONB DEFAULT '[]', -- [{context, good_example, bad_example}]

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Brand Assets
CREATE TABLE client_brand_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  asset_type VARCHAR(30) NOT NULL, -- logo, icon, banner, font, color_palette
  asset_name VARCHAR(100) NOT NULL,
  file_path TEXT NOT NULL,
  file_type VARCHAR(20),
  file_size INTEGER,
  metadata JSONB DEFAULT '{}', -- dimensions, colors, usage guidelines
  is_primary BOOLEAN DEFAULT FALSE,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- GHL Subaccount Connections
CREATE TABLE client_ghl_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  subaccount_id VARCHAR(100) NOT NULL,
  subaccount_name VARCHAR(255),
  location_id VARCHAR(100),

  -- OAuth Credentials (encrypted)
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  token_expires_at TIMESTAMP NOT NULL,
  scopes TEXT[],

  -- Sync Configuration
  sync_enabled BOOLEAN DEFAULT TRUE,
  sync_contacts BOOLEAN DEFAULT TRUE,
  sync_conversations BOOLEAN DEFAULT TRUE,
  sync_opportunities BOOLEAN DEFAULT TRUE,
  sync_frequency VARCHAR(20) DEFAULT 'realtime', -- realtime, hourly, daily

  -- Status
  connection_status VARCHAR(20) DEFAULT 'active', -- pending, active, error, disconnected
  last_sync_at TIMESTAMP,
  last_sync_status VARCHAR(20),
  last_error TEXT,
  error_count INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(client_id, subaccount_id)
);

-- GHL Sync Logs
CREATE TABLE ghl_sync_logs (
  id UUID DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL,
  client_id UUID NOT NULL,
  sync_type VARCHAR(30) NOT NULL, -- contacts, conversations, opportunities, full
  sync_direction VARCHAR(10) NOT NULL, -- inbound, outbound, bidirectional
  status VARCHAR(20) NOT NULL, -- started, completed, partial, failed
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_details JSONB,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
);
SELECT create_hypertable('ghl_sync_logs', 'created_at');

-- Client Activity
CREATE TABLE client_activity (
  id UUID DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  organization_id UUID NOT NULL,

  -- Activity Details
  activity_type VARCHAR(50) NOT NULL,
  -- workflow_execution, message_sent, message_received,
  -- contact_created, opportunity_updated, meeting_scheduled, etc.
  activity_source VARCHAR(30), -- automation, manual, ghl_sync, api

  -- References
  reference_type VARCHAR(50), -- workflow, contact, opportunity, conversation
  reference_id UUID,

  -- Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',

  -- Actor
  performed_by UUID REFERENCES users(id),
  automation_id UUID,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
);
SELECT create_hypertable('client_activity', 'created_at');

-- Client Metrics (aggregated)
CREATE TABLE client_metrics (
  id UUID DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  metric_name VARCHAR(50) NOT NULL,
  -- workflow_executions, messages_sent, contacts_synced,
  -- response_rate, avg_response_time, sentiment_score
  metric_value DECIMAL(15,4) NOT NULL,
  metric_period VARCHAR(10) NOT NULL, -- daily, weekly, monthly
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  comparison_value DECIMAL(15,4), -- previous period value
  change_percentage DECIMAL(5,2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
);
SELECT create_hypertable('client_metrics', 'created_at');

-- Client Health Scores
CREATE TABLE client_health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  engagement_score INTEGER CHECK (engagement_score BETWEEN 0 AND 100),
  usage_score INTEGER CHECK (usage_score BETWEEN 0 AND 100),
  performance_score INTEGER CHECK (performance_score BETWEEN 0 AND 100),
  risk_level VARCHAR(20), -- low, medium, high
  risk_factors JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  calculated_at TIMESTAMP DEFAULT NOW()
);
```

### GHL Integration Flow
```yaml
ghl_integration:
  connection_flow:
    1. User initiates connection from client profile
    2. Redirect to GHL OAuth authorization
    3. User grants permissions for subaccount
    4. Callback receives auth code
    5. Exchange for access/refresh tokens
    6. Store encrypted tokens
    7. Initial sync triggered

  sync_operations:
    contacts:
      direction: bidirectional
      frequency: realtime (webhook) + hourly full
      mapping:
        ghl_contact -> client_contact
        custom_fields: configurable

    conversations:
      direction: inbound only
      frequency: realtime (webhook)
      storage: activity log + raw storage

    opportunities:
      direction: bidirectional
      frequency: realtime (webhook) + daily full
      status_mapping: configurable

  error_handling:
    token_refresh:
      trigger: 401 response or token_expires_at approaching
      retry: 3 attempts with exponential backoff
      fallback: mark connection as error, notify admin

    sync_failure:
      retry: 3 attempts per record
      batch_failures: continue with next batch
      logging: detailed error capture
      alerting: threshold-based notifications
```

### Activity Types
```yaml
activity_types:
  automation:
    - workflow_execution_started
    - workflow_execution_completed
    - workflow_execution_failed
    - message_sent
    - message_delivered
    - message_opened
    - message_clicked

  ghl_sync:
    - contact_synced
    - conversation_received
    - opportunity_created
    - opportunity_updated
    - appointment_scheduled

  manual:
    - note_added
    - status_changed
    - profile_updated
    - document_uploaded
    - meeting_logged

  system:
    - connection_established
    - connection_error
    - health_score_updated
    - alert_triggered
```

## Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Client Onboarding Time | < 15 minutes | Onboarding funnel tracking |
| Profile Completeness | > 95% | Data quality audit |
| GHL Sync Reliability | > 95% | Sync success rate |
| Profile Load Time | < 500ms | Performance monitoring |
| Client Satisfaction | > 4.5/5 | Client surveys |
| Activity Data Freshness | < 1 minute | Sync latency tracking |

## Dependencies
- GHL API access and OAuth app registration
- Secure credential storage (Vault or KMS)
- Object storage for brand assets
- Background job processing
- Analytics and reporting infrastructure

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| GHL API changes | High - Broken integrations | Version monitoring, abstraction layer, quick adaptation |
| Token expiration failures | Medium - Sync interruption | Proactive refresh, fallback handling, alerts |
| Data privacy concerns | High - Compliance issues | Encryption, access controls, audit logs, retention policies |
| Profile data inconsistency | Medium - Wrong personalization | Validation rules, sync verification, conflict resolution |
| Large client portfolio scaling | Medium - Performance degradation | Pagination, caching, database optimization |
| Client churn without cleanup | Low - Data bloat | Archival policies, soft delete, cleanup jobs |
