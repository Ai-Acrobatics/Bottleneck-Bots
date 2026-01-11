# PRD: Knowledge Management

## Overview
A comprehensive knowledge management system for Bottleneck-Bots that centralizes brand voice guidelines, client context, action pattern libraries, CSS selector databases, and user feedback. This system enables consistent, personalized, and continuously improving automation workflows.

## Problem Statement
Effective automation requires deep contextual knowledge:
- Brand voice must be consistent across all automated communications
- Client-specific context improves personalization and accuracy
- Successful action patterns should be reusable and shareable
- CSS selectors for web automation require maintenance and versioning
- User feedback loops are essential for continuous improvement

## Goals & Objectives
- **Primary Goals**
  - Centralize all operational knowledge for automation
  - Enable brand-consistent automated communications
  - Build reusable action pattern libraries
  - Maintain reliable selector databases
  - Collect and act on user feedback

- **Success Metrics**
  - 90% brand voice consistency score
  - 50% reduction in selector failures
  - 70% action pattern reuse rate
  - 80% user feedback response rate

## User Stories
- As a **marketer**, I want to store brand voice guidelines so that all automated messages match our tone
- As a **account manager**, I want to save client context so that bots personalize interactions
- As a **automation developer**, I want to save successful action patterns so that I can reuse them
- As a **QA engineer**, I want to manage selectors so that I can fix broken automations quickly
- As a **product manager**, I want to collect feedback so that we can improve our workflows
- As a **team lead**, I want to share knowledge across the team so that everyone benefits

## Functional Requirements

### Must Have (P0)
- **Brand Voice Storage**
  - Define tone, style, and personality parameters
  - Create message templates with variable substitution
  - Store example phrases and responses
  - Version control for brand guidelines
  - Organization-level and client-level overrides

- **Client Context Management**
  - Client profile with business information
  - Industry and domain classification
  - Communication preferences
  - Historical interaction summary
  - Custom fields for specific needs

- **Action Pattern Library**
  - Named, reusable action sequences
  - Parameter templates for customization
  - Success rate tracking
  - Version history and rollback
  - Sharing across workflows

- **Selector Database**
  - CSS and XPath selector storage
  - Site-specific selector collections
  - Selector health monitoring
  - Alternative selector chains
  - Automatic selector suggestions

- **Feedback Collection**
  - In-workflow feedback prompts
  - Rating and comment collection
  - Feedback categorization
  - Trend analysis
  - Integration with improvement workflows

### Should Have (P1)
- AI-powered brand voice validation
- Automatic client context enrichment
- Pattern recommendation engine
- Selector self-healing system
- Feedback-driven auto-improvement
- Knowledge sharing across organizations (templates)

### Nice to Have (P2)
- Natural language brand voice definition
- Client sentiment analysis
- Pattern performance benchmarking
- Visual selector builder
- Feedback to feature pipeline
- Community pattern marketplace

## Non-Functional Requirements

### Performance
- Knowledge retrieval < 100ms
- Selector lookup < 50ms
- Pattern execution overhead < 5%
- Support 100,000+ selectors per organization

### Reliability
- 99.9% availability for knowledge services
- Data consistency across replicas
- Backup and recovery capabilities

### Usability
- Intuitive knowledge organization
- Easy pattern creation from existing workflows
- Clear feedback collection flows

## Technical Requirements

### Architecture
```
┌────────────────────────────────────────────────────────────────┐
│                  Knowledge Management Service                   │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Brand       │  │   Client     │  │   Pattern            │  │
│  │  Voice       │  │   Context    │  │   Library            │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Selector    │  │   Feedback   │  │   Knowledge          │  │
│  │  Database    │  │   Engine     │  │   Search             │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│       PostgreSQL         │        Redis        │    Search     │
└────────────────────────────────────────────────────────────────┘
```

### Dependencies
- **PostgreSQL**: Knowledge data storage
- **Redis**: Caching and real-time updates
- **Elasticsearch** (optional): Full-text search
- **Background Workers**: Feedback processing
- **AI Services**: Brand voice validation

### APIs
- `POST /knowledge/brand-voice` - Create brand voice profile
- `GET /knowledge/brand-voice` - Get brand voice settings
- `PUT /knowledge/brand-voice/{id}` - Update brand voice
- `POST /knowledge/brand-voice/validate` - Validate text against brand voice
- `POST /knowledge/clients` - Create client context
- `GET /knowledge/clients` - List client contexts
- `GET /knowledge/clients/{id}` - Get client details
- `PUT /knowledge/clients/{id}` - Update client context
- `POST /knowledge/patterns` - Create action pattern
- `GET /knowledge/patterns` - List patterns
- `POST /knowledge/patterns/{id}/execute` - Execute pattern
- `POST /knowledge/selectors` - Add selector
- `GET /knowledge/selectors` - List selectors
- `POST /knowledge/selectors/check` - Check selector health
- `POST /knowledge/feedback` - Submit feedback
- `GET /knowledge/feedback/trends` - Get feedback trends

### Database Schema
```sql
-- Brand Voice Profiles
CREATE TABLE brand_voice_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  client_id UUID REFERENCES clients(id), -- null for org-wide
  name VARCHAR(100) NOT NULL,
  description TEXT,
  tone JSONB NOT NULL, -- {formality: 0-100, friendliness: 0-100, enthusiasm: 0-100}
  style_guidelines TEXT[],
  vocabulary JSONB DEFAULT '{}', -- {preferred: [], avoided: [], industry_terms: []}
  example_messages JSONB DEFAULT '[]', -- [{context, message}]
  templates JSONB DEFAULT '{}', -- {greeting: "", closing: "", ...}
  do_not_use TEXT[], -- phrases/words to avoid
  is_default BOOLEAN DEFAULT FALSE,
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Brand Voice History (versioning)
CREATE TABLE brand_voice_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_voice_id UUID REFERENCES brand_voice_profiles(id),
  version INTEGER NOT NULL,
  changes JSONB NOT NULL,
  changed_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Client Contexts
CREATE TABLE client_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  client_id UUID REFERENCES clients(id) UNIQUE,
  business_info JSONB DEFAULT '{}', -- {industry, size, revenue, location}
  domain_info JSONB DEFAULT '{}', -- {website, social, key_products}
  communication_prefs JSONB DEFAULT '{}', -- {channel, frequency, time_zone}
  relationship_summary TEXT,
  key_contacts JSONB DEFAULT '[]', -- [{name, role, preferences}]
  interaction_history JSONB DEFAULT '{}', -- {last_contact, total_interactions, sentiment}
  custom_fields JSONB DEFAULT '{}',
  tags VARCHAR(50)[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Action Patterns
CREATE TABLE action_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- navigation, form_fill, data_extraction, etc.
  pattern_type VARCHAR(30) NOT NULL, -- sequence, conditional, loop
  actions JSONB NOT NULL, -- [{action_type, selector, params, conditions}]
  parameters JSONB DEFAULT '[]', -- [{name, type, default, required}]
  preconditions JSONB DEFAULT '[]', -- conditions that must be true
  error_handling JSONB DEFAULT '{}', -- retry, fallback, continue strategies
  success_rate DECIMAL(5,2) DEFAULT 100.00,
  execution_count INTEGER DEFAULT 0,
  avg_execution_time_ms INTEGER,
  version INTEGER DEFAULT 1,
  parent_pattern_id UUID REFERENCES action_patterns(id),
  is_public BOOLEAN DEFAULT FALSE, -- shareable with other orgs
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pattern Executions (for tracking success)
CREATE TABLE pattern_executions (
  id UUID DEFAULT gen_random_uuid(),
  pattern_id UUID NOT NULL,
  workflow_execution_id UUID,
  parameters_used JSONB,
  status VARCHAR(20) NOT NULL, -- success, partial, failed
  duration_ms INTEGER,
  error_details JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
);
SELECT create_hypertable('pattern_executions', 'created_at');

-- Selector Database
CREATE TABLE selectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  site_domain VARCHAR(255) NOT NULL,
  element_name VARCHAR(100) NOT NULL, -- human-readable name
  element_type VARCHAR(30), -- button, input, link, container, etc.
  primary_selector TEXT NOT NULL,
  selector_type VARCHAR(10) DEFAULT 'css', -- css, xpath
  fallback_selectors TEXT[], -- alternatives if primary fails
  validation_text TEXT, -- expected text content for validation
  attributes JSONB DEFAULT '{}', -- additional identifying attributes
  last_validated_at TIMESTAMP,
  validation_status VARCHAR(20) DEFAULT 'unknown', -- valid, invalid, changed
  failure_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, site_domain, element_name)
);

-- Selector Validation History
CREATE TABLE selector_validations (
  id UUID DEFAULT gen_random_uuid(),
  selector_id UUID NOT NULL,
  validation_status VARCHAR(20) NOT NULL,
  found_element BOOLEAN,
  matched_text BOOLEAN,
  screenshot_path TEXT,
  suggested_alternatives TEXT[],
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
);
SELECT create_hypertable('selector_validations', 'created_at');

-- Feedback
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  workflow_id UUID REFERENCES workflows(id),
  execution_id UUID,
  feedback_type VARCHAR(30) NOT NULL, -- rating, comment, issue, suggestion
  category VARCHAR(50), -- accuracy, speed, ui, feature_request, bug
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  context JSONB, -- step_id, action, screenshot
  status VARCHAR(20) DEFAULT 'new', -- new, reviewed, actioned, closed
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  action_taken TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Feedback Tags
CREATE TABLE feedback_tags (
  feedback_id UUID REFERENCES feedback(id) ON DELETE CASCADE,
  tag VARCHAR(50) NOT NULL,
  PRIMARY KEY (feedback_id, tag)
);
```

### Brand Voice Configuration
```yaml
brand_voice_example:
  name: "Professional Tech Company"
  tone:
    formality: 75  # 0=casual, 100=formal
    friendliness: 60
    enthusiasm: 50
    confidence: 80

  style:
    sentence_length: "medium"  # short, medium, long, varied
    use_contractions: true
    use_emojis: false
    first_person: "we"  # we, I, company name

  vocabulary:
    preferred:
      - "solution"
      - "partnership"
      - "innovative"
    avoided:
      - "cheap"
      - "problem"
      - "unfortunately"
    industry_terms:
      - "API"
      - "integration"
      - "automation"

  templates:
    greeting: "Hi {{name}},"
    closing: "Best regards,\nThe {{company}} Team"
    acknowledgment: "Thank you for reaching out."
```

## Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Brand Voice Consistency | > 90% | AI validation scoring |
| Selector Success Rate | > 95% | Execution logs |
| Pattern Reuse Rate | > 70% | Usage analytics |
| Feedback Response Rate | > 80% | Feedback tracking |
| Knowledge Retrieval Time | < 100ms | Performance monitoring |
| Client Context Coverage | > 85% of clients | Data completeness audit |

## Dependencies
- AI service for brand voice validation
- Web scraping infrastructure for selector validation
- Background job processing
- Search indexing service
- Analytics pipeline

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Stale selectors | High - Broken automations | Automated validation, health monitoring, alerts |
| Brand voice drift | Medium - Inconsistent messaging | Regular audits, AI validation, version control |
| Pattern complexity | Medium - Maintenance burden | Modular design, clear documentation, testing |
| Feedback overload | Low - Analysis paralysis | Categorization, prioritization, automated insights |
| Knowledge silos | Medium - Reduced efficiency | Sharing mechanisms, cross-team visibility |
| Client data accuracy | Medium - Wrong personalization | Validation rules, enrichment, regular updates |
