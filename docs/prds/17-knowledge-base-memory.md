# PRD-017: Knowledge Base & Memory System

**Document Version:** 1.0
**Status:** Draft
**Author:** Development Team
**Last Updated:** January 11, 2026
**Feature Location:** `server/api/routers/knowledge.ts`, `server/api/routers/memory.ts`, `server/api/routers/knowledgeManagement.ts`, `server/services/knowledge.service.ts`, `server/services/memory/`

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

The Knowledge Base & Memory System provides persistent, intelligent storage and retrieval mechanisms for AI agents within Bottleneck-Bots. This feature enables agents to learn from past interactions, recall relevant context, share knowledge across sessions, and continuously improve their task execution through pattern recognition and adaptive learning.

### 1.1 Feature Summary

- **Knowledge Article Management**: CRUD operations for workflow knowledge, brand voice configurations, process documentation, and technical references
- **Multi-Tenant Knowledge Organization**: Client-specific and user-specific knowledge isolation with hierarchical access controls
- **Memory Persistence Across Sessions**: Long-term storage of agent context, reasoning patterns, and execution states
- **Vector Database Integration**: Semantic search capabilities for intelligent knowledge retrieval (RAG-like patterns)
- **Context Recall for AI Agents**: Session-aware memory that provides relevant context during task execution
- **Knowledge Sharing Between Agents**: Cross-agent knowledge propagation for swarm coordination and collaborative learning
- **Automated Memory Maintenance**: Scheduled cleanup, consolidation, and performance optimization

### 1.2 Target Users

| User Type | Primary Use Cases |
|-----------|-------------------|
| Marketing Agencies | Store client brand voices, campaign patterns, content templates |
| Business Process Owners | Document workflows, capture process knowledge, standardize operations |
| AI Agent Developers | Train agents with domain-specific knowledge, optimize reasoning patterns |
| Operations Teams | Maintain error recovery strategies, selector mappings, action patterns |
| Client Account Managers | Manage client contexts, personas, and business intelligence |

### 1.3 Knowledge Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Workflow** | Process and automation patterns | GHL workflow creation, contact management sequences |
| **Brand Voice** | Client communication guidelines | Tone, vocabulary, examples, industry context |
| **Preference** | User and agent configuration | Execution speed, approval settings, default behaviors |
| **Process** | Business operation documentation | SOP procedures, compliance requirements, escalation paths |
| **Technical** | System integration details | Selectors, API endpoints, authentication patterns |

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Memory Loss Across Sessions**: AI agents start fresh each session, losing valuable context from previous interactions
2. **Repetitive Learning Curve**: Agents must re-learn client preferences, workflows, and patterns repeatedly
3. **Knowledge Silos**: Valuable insights from successful task executions are not captured or shared
4. **Inconsistent Brand Communication**: Without stored brand voice, agents produce inconsistent messaging
5. **No Institutional Memory**: Organizations cannot accumulate and leverage collective automation knowledge
6. **Error Pattern Blindness**: Agents repeatedly encounter the same errors without learning recovery strategies
7. **Selector Fragility**: UI element selectors break frequently without versioning or fallback strategies

### 2.2 User Pain Points

- "My AI agent forgot everything we discussed yesterday about our brand voice"
- "The agent keeps making the same mistakes because it doesn't remember previous corrections"
- "I have to re-explain our business context every single session"
- "When one agent learns a better approach, the others don't benefit"
- "We can't track what knowledge the AI has accumulated about our operations"
- "Element selectors keep breaking, and the agent has no fallbacks"

### 2.3 Business Impact

| Problem | Impact |
|---------|--------|
| Session memory loss | 35% increase in setup time per task |
| Repeated corrections | 45% user frustration leading to churn |
| Knowledge silos | $50K+ annual cost in redundant training |
| Inconsistent brand voice | 60% content requiring manual revision |
| No error learning | 40% repeated automation failures |
| Selector failures | 25% task abandonment rate |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Description | Priority |
|------|-------------|----------|
| **G1** | Enable persistent knowledge storage with multi-tenant isolation | P0 |
| **G2** | Provide session-aware memory for context continuity | P0 |
| **G3** | Implement intelligent knowledge retrieval (semantic search) | P1 |
| **G4** | Support brand voice and client context management | P1 |
| **G5** | Enable cross-agent knowledge sharing for swarm coordination | P1 |
| **G6** | Automate memory maintenance and optimization | P2 |
| **G7** | Track and improve reasoning pattern effectiveness | P2 |

### 3.2 Success Metrics (KPIs)

#### Knowledge Management Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Knowledge Retrieval Accuracy | >= 90% | Relevant knowledge returned / Total retrievals |
| Entry Usage Rate | >= 70% | Entries used in tasks / Total active entries |
| Suggestion Approval Rate | >= 60% | Approved suggestions / Total suggestions |
| Knowledge Coverage | >= 80% | Task types with patterns / Total task types |

#### Memory System Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Context Recall Latency (P95) | < 100ms | Time to retrieve session context |
| Memory Hit Rate | >= 85% | Cache hits / Total retrievals |
| Pattern Reuse Rate | >= 75% | Tasks using existing patterns / Total tasks |
| Reasoning Pattern Success | >= 80% | Successful pattern applications / Total uses |

#### System Performance Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Storage Efficiency | < 1MB per user | Average storage per active user |
| Cleanup Efficiency | >= 95% | Expired entries cleaned / Total expired |
| Consolidation Rate | >= 90% | Duplicates merged / Total duplicates |
| API Response Time (P95) | < 200ms | Server-side latency |

#### Business Impact Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Setup Time Reduction | 50% decrease | Task setup time with vs without memory |
| First-Time Success Rate | >= 85% | Tasks succeeding without retry |
| User Correction Rate | 60% decrease | Corrections needed per 100 tasks |
| Brand Consistency Score | >= 90% | Content matching brand voice / Total content |

---

## 4. User Stories

### 4.1 Knowledge Entry Management

#### US-001: Create Knowledge Entry
**As a** business process owner
**I want to** create knowledge entries for our standard workflows
**So that** AI agents can execute tasks consistently

**Acceptance Criteria:**
- User can create entries with category (workflow, brand_voice, preference, process, technical)
- Content supports up to 50,000 characters
- Confidence score can be set (0-1)
- Examples can be attached as structured data
- Entry is immediately available for retrieval

#### US-002: Edit Knowledge with Version History
**As a** knowledge administrator
**I want to** edit entries while maintaining full change history
**So that** I can track modifications and revert if needed

**Acceptance Criteria:**
- All edits create history snapshots
- Previous and new content captured in history
- Reason for edit can be documented
- User can view complete edit history
- Reversion to any previous version supported

#### US-003: Search Knowledge Base
**As an** agency team member
**I want to** search across all knowledge entries
**So that** I can find relevant information quickly

**Acceptance Criteria:**
- Full-text search across context and content fields
- Filter by category, confidence, active status
- Sort by creation date, usage count, or confidence
- Pagination with configurable limits
- Results include relevance indicators

#### US-004: Review AI-Generated Suggestions
**As a** knowledge curator
**I want to** review and approve AI-generated knowledge suggestions
**So that** the knowledge base grows from agent learnings

**Acceptance Criteria:**
- Suggestions queued with pending status
- Source context shows where suggestion originated
- Similar existing entries flagged
- Options to approve, reject, or merge with existing
- Approved suggestions create new entries automatically

### 4.2 Brand Voice & Client Context

#### US-005: Configure Brand Voice
**As a** client account manager
**I want to** define brand voice configurations for each client
**So that** AI-generated content matches their communication style

**Acceptance Criteria:**
- Define tone descriptors (e.g., professional, friendly, authoritative)
- Specify preferred vocabulary words
- List words to avoid
- Provide good/bad examples by content type
- Set industry and target audience context

#### US-006: Generate Brand-Aware Content
**As a** marketing specialist
**I want** the AI to automatically apply brand voice when generating content
**So that** output is consistent with client guidelines

**Acceptance Criteria:**
- Brand prompt generated from stored configuration
- All content types (email, SMS, social, funnel) supported
- Examples influence generation appropriately
- Vocabulary preferences applied consistently
- Avoid-words are excluded from output

#### US-007: Manage Client Business Context
**As an** account strategist
**I want to** store comprehensive client business information
**So that** AI agents understand client context during task execution

**Acceptance Criteria:**
- Store business type, industry, target market
- Define products and services offered
- Capture key values and USPs
- List competitors for awareness
- Define customer personas with demographics, pain points, goals

### 4.3 Memory System

#### US-008: Store Session Context
**As an** AI agent
**I want to** persist context during task execution
**So that** I can maintain continuity and recover from interruptions

**Acceptance Criteria:**
- Context stored with session ID association
- Multiple context entries per session supported
- TTL (time-to-live) configurable per entry
- Context retrievable by key within session
- Automatic expiration of stale entries

#### US-009: Retrieve Relevant Context
**As an** AI agent starting a task
**I want to** retrieve relevant context from memory
**So that** I can continue where previous sessions left off

**Acceptance Criteria:**
- Retrieve all context for a session
- Filter by namespace, domain, or tags
- Minimum confidence threshold filtering
- Results include metadata for decision-making
- Caching for frequently accessed context

#### US-010: Store Reasoning Patterns
**As an** AI agent completing a task
**I want to** store successful reasoning patterns
**So that** similar future tasks can leverage proven approaches

**Acceptance Criteria:**
- Pattern stored with input, result, and context
- Confidence score assigned based on success
- Domain and tags for categorization
- Similar pattern detection on storage
- Usage tracking for pattern effectiveness

#### US-011: Find Similar Reasoning
**As an** AI agent planning a task
**I want to** find similar reasoning patterns from memory
**So that** I can apply proven strategies to new situations

**Acceptance Criteria:**
- Pattern matching by content similarity
- Filter by domain and minimum confidence
- Limit results with relevance scoring
- Include usage statistics in results
- Update usage when pattern is applied

### 4.4 Action Patterns & Element Selectors

#### US-012: Store Action Patterns
**As a** browser automation agent
**I want to** store successful action sequences
**So that** similar tasks execute faster and more reliably

**Acceptance Criteria:**
- Store task type, name, and page URL
- Capture ordered steps with action details
- Track success/failure counts
- Record last execution timestamp
- Support pattern updates on execution

#### US-013: Manage Element Selectors
**As a** browser automation agent
**I want to** maintain versioned element selectors with fallbacks
**So that** UI changes don't break automation

**Acceptance Criteria:**
- Store primary selector for each element
- Maintain ordered fallback selectors
- Track success rate per selector
- Record total attempts and last verification
- Promote successful fallbacks automatically

#### US-014: Track Error Recovery Patterns
**As a** browser automation agent
**I want to** learn from error recovery successes
**So that** future errors are handled more effectively

**Acceptance Criteria:**
- Record error type, message, and context
- Store recovery strategies with success rates
- Track occurrence and resolution counts
- Suggest strategies based on historical success
- Update strategy effectiveness on use

### 4.5 Feedback & Learning

#### US-015: Submit Knowledge Feedback
**As a** system user
**I want to** provide feedback on knowledge entries
**So that** the knowledge base quality improves over time

**Acceptance Criteria:**
- Feedback types: helpful, outdated, incorrect, unclear, incomplete
- Optional comment for detailed feedback
- Suggested correction can be provided
- Execution context captured automatically
- Feedback tracked with pending/reviewed status

#### US-016: Resolve Feedback and Improve Entries
**As a** knowledge administrator
**I want to** review and resolve user feedback
**So that** knowledge entries remain accurate and useful

**Acceptance Criteria:**
- List feedback by entry, type, or status
- Resolution notes required for closing
- Option to update entry based on feedback
- Feedback status updated to reviewed/applied
- Metrics show feedback resolution rates

### 4.6 Maintenance & Analytics

#### US-017: Trigger Memory Cleanup
**As a** system administrator
**I want to** manually trigger memory cleanup
**So that** I can maintain system performance

**Acceptance Criteria:**
- Clean expired memory entries
- Remove low-performance reasoning patterns
- Configurable thresholds for cleanup
- Return counts of cleaned entries
- No impact on active sessions

#### US-018: Monitor Memory System Health
**As a** system administrator
**I want to** view memory system statistics
**So that** I can ensure optimal performance

**Acceptance Criteria:**
- Total entries and reasoning patterns count
- Average confidence score
- Cache hit rate
- Cleanup statistics
- Real-time health status

#### US-019: View Knowledge Analytics
**As a** business analyst
**I want to** see knowledge usage statistics
**So that** I can understand knowledge base effectiveness

**Acceptance Criteria:**
- Top entries by usage count
- Category breakdown with totals
- Quality metrics (confidence, feedback distribution)
- Suggestion approval rates
- Historical trends

---

## 5. Functional Requirements

### 5.1 Knowledge Entry Management

#### FR-001: Entry CRUD Operations
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Create knowledge entries with category, context, content, examples | P0 |
| FR-001.2 | Support confidence scores from 0.0 to 1.0 | P0 |
| FR-001.3 | Content field supports up to 50,000 characters | P0 |
| FR-001.4 | Context field supports up to 5,000 characters | P0 |
| FR-001.5 | Soft delete with isActive flag preservation | P0 |
| FR-001.6 | Restore deleted entries with history tracking | P1 |

#### FR-002: Edit History
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Capture previous and new content on every edit | P0 |
| FR-002.2 | Store complete snapshots for version comparison | P0 |
| FR-002.3 | Record change type (created, updated, deleted, restored) | P0 |
| FR-002.4 | Support optional reason for edit | P1 |
| FR-002.5 | Enable reversion to any historical version | P1 |
| FR-002.6 | Paginated history retrieval (default: 20 entries) | P1 |

#### FR-003: Search & Filtering
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Full-text search in context and content fields (ILIKE) | P0 |
| FR-003.2 | Filter by category enum | P0 |
| FR-003.3 | Filter by isActive status | P0 |
| FR-003.4 | Filter by minimum confidence threshold | P1 |
| FR-003.5 | Sort by createdAt, usageCount, confidence, category | P0 |
| FR-003.6 | Pagination with configurable limit (max: 100) | P0 |

### 5.2 Suggestions System

#### FR-004: Suggestion Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Create suggestions with category, context, suggestedContent | P1 |
| FR-004.2 | Track source type (conversation, task_execution, feedback, observation) | P1 |
| FR-004.3 | Store source context for traceability | P1 |
| FR-004.4 | Detect similar existing entries on creation | P1 |
| FR-004.5 | Support suggestion statuses: pending, approved, rejected, merged | P1 |
| FR-004.6 | Record reviewer, review timestamp, and notes | P1 |

#### FR-005: Suggestion Workflow
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Approve suggestion: create new knowledge entry | P1 |
| FR-005.2 | Allow content modification before approval | P1 |
| FR-005.3 | Reject suggestion with required reason | P1 |
| FR-005.4 | Merge suggestion into existing entry | P1 |
| FR-005.5 | Link approved suggestions to created entries | P1 |

### 5.3 Feedback System

#### FR-006: Feedback Collection
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | Accept feedback types: helpful, outdated, incorrect, unclear, incomplete | P1 |
| FR-006.2 | Support optional comment (max: 5,000 characters) | P1 |
| FR-006.3 | Support suggested correction (max: 50,000 characters) | P1 |
| FR-006.4 | Capture execution context automatically | P1 |
| FR-006.5 | Track feedback status: pending, reviewed, applied, dismissed | P1 |

#### FR-007: Feedback Resolution
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | Resolve feedback with required resolution notes | P1 |
| FR-007.2 | Record resolver and resolution timestamp | P1 |
| FR-007.3 | Aggregate feedback counts per entry | P1 |
| FR-007.4 | Filter feedback by entry, type, status | P1 |

### 5.4 Brand Voice

#### FR-008: Brand Voice Configuration
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | Store tone descriptors as string array | P1 |
| FR-008.2 | Store vocabulary preferences as string array | P1 |
| FR-008.3 | Store avoid-words as string array | P1 |
| FR-008.4 | Store examples by content type (email, sms, social, funnel, general) | P1 |
| FR-008.5 | Store industry and target audience context | P1 |
| FR-008.6 | One brand voice per client with upsert behavior | P1 |

#### FR-009: Brand Prompt Generation
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009.1 | Generate prompt with tone instructions | P1 |
| FR-009.2 | Include vocabulary suggestions (top 10) | P1 |
| FR-009.3 | Include avoid-words in prompt | P1 |
| FR-009.4 | Include relevant example for content type | P1 |
| FR-009.5 | Include industry and audience context when available | P1 |

### 5.5 Client Context

#### FR-010: Client Context Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-010.1 | Store business type and industry | P1 |
| FR-010.2 | Store target market description | P1 |
| FR-010.3 | Store products and services arrays | P1 |
| FR-010.4 | Store key values and USPs | P1 |
| FR-010.5 | Store competitor list | P1 |
| FR-010.6 | Store customer personas with demographics, pain points, goals | P1 |
| FR-010.7 | Support custom fields as JSONB | P2 |

#### FR-011: Context Prompt Generation
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-011.1 | Generate prompt with business overview | P1 |
| FR-011.2 | Include products/services if present | P1 |
| FR-011.3 | Include USPs in prompt | P1 |
| FR-011.4 | Include formatted customer personas | P1 |

### 5.6 Memory System

#### FR-012: Memory Entry Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-012.1 | Store memory entries with session ID and key | P0 |
| FR-012.2 | Support any JSON-serializable value | P0 |
| FR-012.3 | Associate entries with agent ID and user ID | P0 |
| FR-012.4 | Support metadata with type, domain, namespace, confidence, tags | P0 |
| FR-012.5 | Support TTL (time-to-live) for automatic expiration | P1 |
| FR-012.6 | Support vector embeddings for semantic search | P2 |

#### FR-013: Context Operations
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-013.1 | Store context as key-value pairs per session | P0 |
| FR-013.2 | Retrieve complete context for session | P0 |
| FR-013.3 | Retrieve single context value by key | P0 |
| FR-013.4 | Update existing context with merge behavior | P0 |
| FR-013.5 | Delete context by session (all) or key (specific) | P0 |

#### FR-014: Memory Search
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-014.1 | Search by session ID, agent ID, user ID | P0 |
| FR-014.2 | Filter by namespace, domain, tags | P1 |
| FR-014.3 | Filter by memory type (context, reasoning, knowledge, state) | P1 |
| FR-014.4 | Filter by minimum confidence | P1 |
| FR-014.5 | Support pagination with limit and offset | P0 |
| FR-014.6 | Option to include/exclude expired entries | P1 |

### 5.7 Reasoning Patterns

#### FR-015: Pattern Storage
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-015.1 | Store pattern content (input/situation) | P1 |
| FR-015.2 | Store pattern result (outcome/approach) | P1 |
| FR-015.3 | Store context of pattern discovery | P1 |
| FR-015.4 | Assign confidence score (0-1) | P1 |
| FR-015.5 | Categorize by domain and tags | P1 |

#### FR-016: Pattern Retrieval
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-016.1 | Find patterns by content similarity | P1 |
| FR-016.2 | Filter by domain and minimum confidence | P1 |
| FR-016.3 | Return patterns with relevance scoring | P1 |
| FR-016.4 | Limit results with configurable maximum | P1 |
| FR-016.5 | Include usage statistics in results | P1 |

#### FR-017: Pattern Analytics
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-017.1 | Track usage count per pattern | P1 |
| FR-017.2 | Track success/failure rate | P1 |
| FR-017.3 | Update statistics on pattern application | P1 |
| FR-017.4 | Retrieve top-performing patterns | P1 |

### 5.8 Action Patterns

#### FR-018: Action Pattern Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-018.1 | Store patterns by task type (unique identifier) | P1 |
| FR-018.2 | Store task name and page URL | P1 |
| FR-018.3 | Store ordered steps with action details | P1 |
| FR-018.4 | Track success and failure counts | P1 |
| FR-018.5 | Record last execution timestamp | P1 |
| FR-018.6 | Calculate and sort by success rate | P1 |

#### FR-019: Action Steps
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-019.1 | Support action types: navigate, click, type, extract, wait, screenshot, scroll | P1 |
| FR-019.2 | Store step order for sequencing | P1 |
| FR-019.3 | Store selector and instruction per step | P1 |
| FR-019.4 | Support value, waitFor, timeout parameters | P1 |
| FR-019.5 | Support custom metadata per step | P2 |

### 5.9 Element Selectors

#### FR-020: Selector Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-020.1 | Store selectors by page path and element name | P1 |
| FR-020.2 | Store primary selector | P1 |
| FR-020.3 | Store ordered fallback selectors | P1 |
| FR-020.4 | Track success rate (exponential moving average) | P1 |
| FR-020.5 | Track total attempts | P1 |
| FR-020.6 | Store screenshot reference for verification | P2 |

#### FR-021: Selector Usage Tracking
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-021.1 | Record selector used on each attempt | P1 |
| FR-021.2 | Update success rate on each use | P1 |
| FR-021.3 | Promote successful fallbacks automatically | P1 |
| FR-021.4 | Merge fallbacks from new selector saves | P1 |

### 5.10 Error Patterns

#### FR-022: Error Recording
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-022.1 | Record error type and message | P1 |
| FR-022.2 | Store error context | P1 |
| FR-022.3 | Initialize with default recovery strategies | P1 |
| FR-022.4 | Track occurrence and resolution counts | P1 |
| FR-022.5 | Record last occurrence timestamp | P1 |

#### FR-023: Recovery Strategies
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-023.1 | Support strategies: wait_and_retry, refresh_page, fallback_selector, skip, escalate | P1 |
| FR-023.2 | Track success rate per strategy | P1 |
| FR-023.3 | Track attempt count per strategy | P1 |
| FR-023.4 | Support strategy parameters (retries, delays) | P1 |
| FR-023.5 | Return strategies sorted by success rate | P1 |

### 5.11 Memory Maintenance

#### FR-024: Cleanup Operations
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-024.1 | Clean expired memory entries by TTL | P1 |
| FR-024.2 | Clean low-performance reasoning patterns | P1 |
| FR-024.3 | Configurable minimum success rate threshold | P1 |
| FR-024.4 | Configurable minimum usage count before evaluation | P1 |
| FR-024.5 | Return counts of cleaned entries | P1 |

#### FR-025: Consolidation Operations
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-025.1 | Identify duplicate entries by key | P1 |
| FR-025.2 | Keep most recent entry per key | P1 |
| FR-025.3 | Merge metadata from consolidated entries | P1 |
| FR-025.4 | Track consolidation provenance | P1 |
| FR-025.5 | Return count of consolidated entries | P1 |

#### FR-026: Scheduled Maintenance
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-026.1 | Configurable cleanup interval (default: 6 hours) | P1 |
| FR-026.2 | Configurable consolidation interval (default: 24 hours) | P1 |
| FR-026.3 | Support immediate execution option | P1 |
| FR-026.4 | Start/stop scheduler via API | P1 |
| FR-026.5 | Track maintenance statistics | P1 |

### 5.12 Analytics

#### FR-027: Usage Analytics
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-027.1 | Get top entries by usage count | P1 |
| FR-027.2 | Get entry breakdown by category | P1 |
| FR-027.3 | Calculate total usage per category | P1 |
| FR-027.4 | Include inactive entries optionally | P1 |

#### FR-028: Quality Metrics
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-028.1 | Calculate average confidence score | P1 |
| FR-028.2 | Aggregate feedback by type | P1 |
| FR-028.3 | Track suggestion approval rates | P1 |
| FR-028.4 | Calculate pattern success rates | P1 |

#### FR-029: System Statistics
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-029.1 | Count total patterns, selectors, errors | P0 |
| FR-029.2 | Count total feedback and brand voices | P0 |
| FR-029.3 | Count total client contexts | P0 |
| FR-029.4 | Calculate average success rates | P1 |
| FR-029.5 | Calculate error resolution rate | P1 |

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-001 | Knowledge retrieval latency (P95) | < 100ms | P0 |
| NFR-002 | Memory search latency (P95) | < 150ms | P0 |
| NFR-003 | Context store/retrieve latency (P95) | < 50ms | P0 |
| NFR-004 | Bulk entry listing (100 items) | < 200ms | P1 |
| NFR-005 | Pattern similarity search | < 300ms | P1 |
| NFR-006 | Edit history retrieval | < 100ms | P1 |
| NFR-007 | LRU cache hit rate | >= 85% | P1 |

### 6.2 Scalability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-008 | Knowledge entries per user | Up to 10,000 | P0 |
| NFR-009 | Memory entries per session | Up to 1,000 | P0 |
| NFR-010 | Concurrent memory operations | 500 ops/second | P1 |
| NFR-011 | LRU cache sizes | Configurable (200-500 entries) | P1 |
| NFR-012 | Database connection pooling | Max 50 connections | P1 |
| NFR-013 | Horizontal scaling support | Stateless service design | P2 |

### 6.3 Reliability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-014 | Data durability | 99.99% (PostgreSQL replication) | P0 |
| NFR-015 | Service availability | 99.9% | P0 |
| NFR-016 | Cache consistency | Eventual (TTL-based) | P1 |
| NFR-017 | Graceful degradation | Work without cache | P1 |
| NFR-018 | Scheduler reliability | Auto-recovery on failure | P1 |

### 6.4 Security Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-019 | User data isolation (userId in all queries) | P0 |
| NFR-020 | Authentication required (protectedProcedure) | P0 |
| NFR-021 | Input validation (Zod schemas) | P0 |
| NFR-022 | SQL injection prevention (parameterized queries) | P0 |
| NFR-023 | Content size limits enforced | P0 |
| NFR-024 | Audit logging for sensitive operations | P1 |
| NFR-025 | Rate limiting on write operations | P1 |

### 6.5 Multi-Tenancy Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-026 | Complete data isolation per user | P0 |
| NFR-027 | Client-scoped knowledge (clientId) | P1 |
| NFR-028 | Session-scoped memory (sessionId) | P0 |
| NFR-029 | Agent-scoped context (agentId) | P1 |
| NFR-030 | No cross-tenant data leakage | P0 |

### 6.6 Observability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-031 | Structured logging for all operations | P0 |
| NFR-032 | Error tracking with context | P0 |
| NFR-033 | Performance metrics collection | P1 |
| NFR-034 | Health check endpoints | P0 |
| NFR-035 | Cleanup job monitoring | P1 |

---

## 7. Technical Architecture

### 7.1 System Overview

```
+------------------------------------------------------------------+
|                         Client Application                         |
|  (React/Next.js Frontend with tRPC Client)                        |
+--------------------------------+---------------------------------+
                                 | tRPC
                                 v
+------------------------------------------------------------------+
|                       API Layer (tRPC Routers)                     |
|                                                                    |
|  +-----------------+  +-------------------+  +------------------+  |
|  | knowledgeRouter |  | knowledgeManage-  |  |   memoryRouter   |  |
|  |                 |  | mentRouter        |  |                  |  |
|  | - getPattern    |  | - createEntry     |  | - create         |  |
|  | - savePattern   |  | - updateEntry     |  | - getBySession   |  |
|  | - getSelector   |  | - deleteEntry     |  | - search         |  |
|  | - recordError   |  | - suggestions     |  | - storeReasoning |  |
|  | - brandVoice    |  | - feedback        |  | - cleanup        |  |
|  | - clientContext |  | - analytics       |  | - stats          |  |
|  +-----------------+  +-------------------+  +------------------+  |
|                                                                    |
+---------------------------+--------------------------------------+
                            |
        +-------------------+-------------------+
        v                   v                   v
+---------------+  +------------------+  +------------------+
| Knowledge     |  | Memory System    |  | Cleanup          |
| Service       |  |                  |  | Scheduler        |
|               |  | - AgentMemory    |  |                  |
| - Singleton   |  | - ReasoningBank  |  | - Periodic jobs  |
| - LRU Caches  |  | - Session store  |  | - BullMQ queue   |
| - DB queries  |  | - Pattern match  |  | - Consolidation  |
+-------+-------+  +--------+---------+  +--------+---------+
        |                   |                     |
        +-------------------+---------------------+
                            |
                            v
+------------------------------------------------------------------+
|                      Database Layer (Drizzle ORM)                  |
|                                                                    |
|  +------------------+  +-------------------+  +------------------+ |
|  | schema-knowledge |  | schema-memory     |  | schema-sop       | |
|  |                  |  |                   |  |                  | |
|  | - actionPatterns |  | - userMemory      |  | - editHistory    | |
|  | - elementSelect- |  | - executionCheck- |  | - suggestions    | |
|  |   ors            |  |   points          |  | - feedback       | |
|  | - errorPatterns  |  | - taskSuccess-    |  |                  | |
|  | - agentFeedback  |  |   Patterns        |  |                  | |
|  | - brandVoices    |  | - userFeedback    |  |                  | |
|  | - clientContexts |  | - workflowPatt-   |  |                  | |
|  |                  |  |   erns            |  |                  | |
|  +------------------+  +-------------------+  +------------------+ |
|                                                                    |
+------------------------------------------------------------------+
                            |
                            v
+------------------------------------------------------------------+
|                         PostgreSQL                                 |
+------------------------------------------------------------------+
```

### 7.2 Database Schema

#### 7.2.1 Knowledge Tables (`schema-knowledge.ts`)

```sql
-- Action Patterns
CREATE TABLE action_patterns (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  task_type VARCHAR(255) NOT NULL,
  task_name TEXT NOT NULL,
  page_url TEXT,
  steps JSONB NOT NULL DEFAULT '[]',
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  last_executed TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX action_patterns_task_type_idx ON action_patterns(task_type);
CREATE INDEX action_patterns_user_id_idx ON action_patterns(user_id);

-- Element Selectors
CREATE TABLE element_selectors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  page_path VARCHAR(500) NOT NULL,
  element_name VARCHAR(255) NOT NULL,
  primary_selector TEXT NOT NULL,
  fallback_selectors JSONB NOT NULL DEFAULT '[]',
  success_rate REAL NOT NULL DEFAULT 1.0,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  last_verified TIMESTAMP,
  screenshot_ref TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX element_selectors_page_path_idx ON element_selectors(page_path);
CREATE INDEX element_selectors_element_name_idx ON element_selectors(element_name);

-- Error Patterns
CREATE TABLE error_patterns (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  error_type VARCHAR(255) NOT NULL,
  error_message TEXT,
  context TEXT,
  recovery_strategies JSONB NOT NULL DEFAULT '[]',
  occurrence_count INTEGER NOT NULL DEFAULT 0,
  resolved_count INTEGER NOT NULL DEFAULT 0,
  last_occurred TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX error_patterns_error_type_idx ON error_patterns(error_type);

-- Agent Feedback
CREATE TABLE agent_feedback (
  id SERIAL PRIMARY KEY,
  execution_id INTEGER,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback_type VARCHAR(50) NOT NULL,
  comment TEXT,
  task_type VARCHAR(255),
  actions_taken JSONB DEFAULT '[]',
  corrections TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX agent_feedback_user_id_idx ON agent_feedback(user_id);
CREATE INDEX agent_feedback_rating_idx ON agent_feedback(rating);

-- Brand Voices
CREATE TABLE brand_voices (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  tone JSONB NOT NULL DEFAULT '[]',
  vocabulary JSONB NOT NULL DEFAULT '[]',
  avoid_words JSONB NOT NULL DEFAULT '[]',
  examples JSONB NOT NULL DEFAULT '[]',
  industry VARCHAR(100),
  target_audience TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX brand_voices_client_id_idx ON brand_voices(client_id);

-- Client Contexts
CREATE TABLE client_contexts (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  user_id INTEGER REFERENCES users(id),
  business_type VARCHAR(255) NOT NULL,
  industry VARCHAR(255) NOT NULL,
  target_market TEXT,
  products JSONB NOT NULL DEFAULT '[]',
  services JSONB NOT NULL DEFAULT '[]',
  key_values JSONB NOT NULL DEFAULT '[]',
  competitors JSONB NOT NULL DEFAULT '[]',
  unique_selling_points JSONB NOT NULL DEFAULT '[]',
  customer_personas JSONB NOT NULL DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX client_contexts_client_id_idx ON client_contexts(client_id);
CREATE INDEX client_contexts_industry_idx ON client_contexts(industry);
```

#### 7.2.2 Memory Tables (`schema-memory.ts`)

```sql
-- User Memory
CREATE TABLE user_memory (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  preferences JSONB NOT NULL DEFAULT '{}',
  task_history JSONB NOT NULL DEFAULT '[]',
  learned_patterns JSONB NOT NULL DEFAULT '{}',
  user_corrections JSONB NOT NULL DEFAULT '[]',
  stats JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_accessed_at TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX user_memory_user_id_idx ON user_memory(user_id);

-- Execution Checkpoints
CREATE TABLE execution_checkpoints (
  id SERIAL PRIMARY KEY,
  checkpoint_id VARCHAR(255) NOT NULL UNIQUE,
  execution_id INTEGER NOT NULL,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  phase_id INTEGER,
  phase_name TEXT,
  step_index INTEGER DEFAULT 0 NOT NULL,
  completed_steps JSONB NOT NULL DEFAULT '[]',
  completed_phases JSONB NOT NULL DEFAULT '[]',
  partial_results JSONB NOT NULL DEFAULT '{}',
  extracted_data JSONB NOT NULL DEFAULT '{}',
  session_state JSONB,
  browser_context JSONB,
  error_info JSONB,
  checkpoint_reason VARCHAR(100),
  can_resume BOOLEAN DEFAULT true NOT NULL,
  resume_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP
);
CREATE INDEX execution_checkpoint_id_idx ON execution_checkpoints(checkpoint_id);
CREATE INDEX execution_checkpoint_execution_id_idx ON execution_checkpoints(execution_id);
CREATE INDEX execution_checkpoint_expires_at_idx ON execution_checkpoints(expires_at);

-- Task Success Patterns
CREATE TABLE task_success_patterns (
  id SERIAL PRIMARY KEY,
  pattern_id VARCHAR(255) NOT NULL UNIQUE,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  task_type VARCHAR(100) NOT NULL,
  task_name TEXT,
  successful_approach JSONB NOT NULL,
  selectors JSONB DEFAULT '{}',
  workflow JSONB DEFAULT '[]',
  context_conditions JSONB DEFAULT '{}',
  required_state JSONB DEFAULT '{}',
  avg_execution_time REAL,
  success_rate REAL DEFAULT 1.0 NOT NULL,
  usage_count INTEGER DEFAULT 1 NOT NULL,
  confidence REAL DEFAULT 0.8 NOT NULL,
  adaptations JSONB DEFAULT '[]',
  reasoning_pattern_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_used_at TIMESTAMP
);
CREATE INDEX task_success_task_type_idx ON task_success_patterns(task_type);
CREATE INDEX task_success_confidence_idx ON task_success_patterns(confidence);

-- Workflow Patterns
CREATE TABLE workflow_patterns (
  id SERIAL PRIMARY KEY,
  pattern_id VARCHAR(255) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category VARCHAR(100),
  pattern JSONB NOT NULL,
  variables JSONB DEFAULT '[]',
  conditions JSONB DEFAULT '{}',
  user_id INTEGER REFERENCES users(id),
  is_public BOOLEAN DEFAULT false NOT NULL,
  is_system_pattern BOOLEAN DEFAULT false NOT NULL,
  usage_count INTEGER DEFAULT 0 NOT NULL,
  success_rate REAL DEFAULT 1.0 NOT NULL,
  avg_execution_time REAL,
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_used_at TIMESTAMP
);
CREATE INDEX workflow_pattern_category_idx ON workflow_patterns(category);
CREATE INDEX workflow_pattern_public_idx ON workflow_patterns(is_public);
```

### 7.3 Service Architecture

#### 7.3.1 Knowledge Service (`knowledge.service.ts`)

```typescript
class KnowledgeService {
  // Singleton pattern
  private static instance: KnowledgeService;

  // LRU Caches for performance
  private patternCache = new LRUCache<string, ActionPattern>(200);
  private selectorCache = new LRUCache<string, ElementSelector>(500);
  private errorCache = new LRUCache<string, ErrorPattern>(200);
  private brandVoiceCache = new LRUCache<number, BrandVoice>(100);
  private clientContextCache = new LRUCache<number, ClientContext>(100);

  // Core Operations
  getActionPattern(taskType: string): Promise<ActionPattern | undefined>
  saveActionPattern(pattern: ActionPattern): Promise<void>
  recordPatternExecution(taskType: string, success: boolean): Promise<void>

  getSelector(pagePath: string, elementName: string): Promise<ElementSelector | undefined>
  saveSelector(selector: ElementSelector): Promise<void>
  recordSelectorUsage(pagePath, elementName, selectorUsed, success): Promise<void>

  recordError(errorType, errorMessage, context): Promise<RecoveryStrategy[]>
  recordRecoverySuccess(errorType, context, strategy): Promise<void>

  getBrandVoice(clientId: number): Promise<BrandVoice | undefined>
  saveBrandVoice(voice: BrandVoice): Promise<void>
  generateBrandPrompt(clientId: number, contentType: string): Promise<string>

  getClientContext(clientId: number): Promise<ClientContext | undefined>
  saveClientContext(context: ClientContext): Promise<void>
  generateContextPrompt(clientId: number): Promise<string>

  getSystemStats(): Promise<SystemStats>
  getPatternRecommendations(taskDescription, clientId?): Promise<PatternRecommendation[]>
}
```

#### 7.3.2 Memory System (`server/services/memory/`)

```typescript
interface MemorySystem {
  // Context Operations
  storeContext(sessionId, context, options): Promise<void>
  retrieveContext(sessionId): Promise<Record<string, any> | undefined>
  retrieveContextValue(sessionId, key): Promise<any>
  updateContext(sessionId, context, options): Promise<void>
  deleteContext(sessionId, key?): Promise<void>

  // Reasoning Patterns
  storeReasoning(pattern, result, options): Promise<string>
  findSimilarReasoning(pattern, options): Promise<ReasoningPattern[]>
  updateReasoningUsage(patternId, success): Promise<void>
  getTopReasoningPatterns(limit): Promise<ReasoningPattern[]>

  // Search and Query
  searchMemory(query: MemoryQuery): Promise<MemoryEntry[]>
  getSessionMemories(sessionId, options): Promise<MemoryEntry[]>

  // Maintenance
  cleanup(options): Promise<CleanupResult>
  clearCaches(): void
  getStats(sessionId?, domain?): Promise<MemoryStats>
}
```

#### 7.3.3 Cleanup Scheduler (`memoryCleanup.scheduler.ts`)

```typescript
class MemoryCleanupSchedulerService {
  // Configuration
  cleanupIntervalMs: number = 6 * 60 * 60 * 1000;  // 6 hours
  consolidateIntervalMs: number = 24 * 60 * 60 * 1000;  // 24 hours

  // Operations
  start(options): void
  stop(): void
  runCleanup(options): Promise<CleanupResult>
  runConsolidation(options): Promise<ConsolidationResult>
  getStats(): MemoryCleanupStats

  // Queue Integration
  queueMemoryCleanup(options): Promise<Job | CleanupResult>
  queueMemoryConsolidation(options): Promise<Job | ConsolidationResult>
}
```

### 7.4 Caching Strategy

| Cache | Max Size | TTL | Eviction |
|-------|----------|-----|----------|
| Pattern Cache | 200 | None | LRU |
| Selector Cache | 500 | None | LRU |
| Error Cache | 200 | None | LRU |
| Brand Voice Cache | 100 | None | LRU |
| Client Context Cache | 100 | None | LRU |

### 7.5 Data Flow

#### Knowledge Retrieval Flow
```
1. Router receives request (e.g., getPattern)
                    |
2. Service checks LRU cache
                    |
   +--------+-------+-------+--------+
   | HIT    |               | MISS   |
   v        |               v        |
3. Return  |       4. Query database |
   cached  |                         |
   data    |       5. Transform result
           |                         |
           |       6. Store in cache |
           |                         |
           +----------+   +----------+
                      |   |
                      v   v
              7. Return to client
```

#### Memory Storage Flow
```
1. Agent calls storeContext(sessionId, key, value)
                    |
2. Validate input (Zod schema)
                    |
3. Generate entry ID
                    |
4. Check for existing entry by key
                    |
   +--------+-------+-------+--------+
   | EXISTS |               | NEW    |
   v        |               v        |
5. Update  |       6. Insert entry   |
   entry   |                         |
           |                         |
           +----------+   +----------+
                      |   |
                      v   v
              7. Update cache
                      |
              8. Return entry ID
```

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| tRPC Core | `server/_core/trpc.ts` | API router framework |
| Database | `server/db/index.ts` | Drizzle ORM connection |
| Queue System | `server/_core/queue.ts` | BullMQ job processing |
| Users Schema | `drizzle/schema.ts` | User foreign key references |
| Agent Schema | `drizzle/schema-agent.ts` | Knowledge entries table |
| SOP Schema | `drizzle/schema-sop.ts` | Edit history, suggestions, feedback |
| Knowledge Schema | `drizzle/schema-knowledge.ts` | Patterns, selectors, brand, context |
| Memory Schema | `drizzle/schema-memory.ts` | Memory, checkpoints, patterns |

### 8.2 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| drizzle-orm | ^0.30.x | Database ORM |
| @trpc/server | ^11.x | API framework |
| zod | ^3.x | Schema validation |
| bullmq | ^5.x | Job queue (cleanup jobs) |
| uuid | ^9.x | Unique ID generation |

### 8.3 External Services

| Service | Purpose | Required |
|---------|---------|----------|
| PostgreSQL | Data persistence | Yes |
| Redis | Job queue (optional) | No (graceful fallback) |

### 8.4 Environment Variables

```bash
# Required
DATABASE_URL=              # PostgreSQL connection string

# Optional (for job queue)
REDIS_URL=                 # Redis connection for BullMQ
```

---

## 9. Out of Scope

### 9.1 Excluded from Current Release

| Item | Reason | Future Consideration |
|------|--------|---------------------|
| Vector embeddings for semantic search | Complexity, infrastructure cost | v2.0 |
| Real-time knowledge sync | WebSocket infrastructure | v2.0 |
| Knowledge import/export | Feature prioritization | v1.5 |
| Multi-language support | Internationalization scope | v2.0 |
| Knowledge versioning with branches | Git-like complexity | v3.0 |
| External knowledge source integration | API scope | v2.0 |
| Knowledge sharing between users | Authorization complexity | v2.0 |
| Full-text search with ranking | PostgreSQL FTS setup | v1.5 |
| Knowledge recommendation engine | ML infrastructure | v3.0 |
| Visual knowledge editor | Frontend scope | Separate PRD |

### 9.2 Technical Limitations

| Limitation | Description | Workaround |
|------------|-------------|------------|
| No real-time sync | Changes require refresh | Polling or manual refresh |
| Text-based similarity | No vector embeddings | Keyword-based matching |
| Single user ownership | No sharing | Duplicate entries per user |
| In-process cleanup | No distributed workers | BullMQ queue support |
| Cache consistency | Eventually consistent | TTL-based invalidation |

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Cache memory exhaustion | Medium | Medium | LRU eviction with configurable sizes |
| Database query performance | Medium | High | Proper indexing, query optimization |
| Cleanup job failures | Low | Medium | Retry logic, manual trigger option |
| Data corruption | Low | Critical | Transaction support, soft deletes |
| Concurrent modification | Medium | Medium | Optimistic locking patterns |

### 10.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low knowledge adoption | Medium | High | Automatic learning from agent tasks |
| Stale knowledge | High | Medium | Feedback system, confidence decay |
| Knowledge quality issues | Medium | High | Review workflow, suggestions system |
| Storage costs | Medium | Low | Cleanup automation, entry limits |

### 10.3 Security Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data leakage between users | Low | Critical | UserId validation on all queries |
| Knowledge injection | Low | Medium | Input validation, size limits |
| Unauthorized access | Low | High | protectedProcedure requirement |

### 10.4 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Cleanup impacts performance | Medium | Medium | Off-peak scheduling |
| Database growth | High | Medium | Retention policies, archival |
| Cache invalidation issues | Medium | Low | Clear cache option, TTL |

---

## 11. Milestones & Timeline

### 11.1 Phase 1: Core Knowledge System (Weeks 1-4)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M1.1 | Knowledge entry CRUD operations | Week 1 |
| M1.2 | Edit history tracking | Week 2 |
| M1.3 | Search and filtering | Week 3 |
| M1.4 | Knowledge router integration | Week 4 |

**Exit Criteria:**
- [ ] Users can create, read, update, delete knowledge entries
- [ ] All edits tracked in history with snapshots
- [ ] Full-text search returns relevant results
- [ ] API endpoints functional with authentication

### 11.2 Phase 2: Brand Voice & Client Context (Weeks 5-8)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M2.1 | Brand voice management | Week 5 |
| M2.2 | Brand prompt generation | Week 6 |
| M2.3 | Client context management | Week 7 |
| M2.4 | Context prompt generation | Week 8 |

**Exit Criteria:**
- [ ] Brand voices configurable per client
- [ ] Prompts generated correctly from brand data
- [ ] Client context stored with personas
- [ ] Context prompts include all relevant fields

### 11.3 Phase 3: Action Patterns & Selectors (Weeks 9-12)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M3.1 | Action pattern storage | Week 9 |
| M3.2 | Pattern execution tracking | Week 10 |
| M3.3 | Element selector management | Week 11 |
| M3.4 | Error pattern tracking | Week 12 |

**Exit Criteria:**
- [ ] Action patterns saved and retrieved by task type
- [ ] Success/failure metrics tracked accurately
- [ ] Selectors with fallbacks function correctly
- [ ] Error recovery strategies improve over time

### 11.4 Phase 4: Memory System (Weeks 13-16)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M4.1 | Session context storage | Week 13 |
| M4.2 | Memory search and retrieval | Week 14 |
| M4.3 | Reasoning pattern storage | Week 15 |
| M4.4 | Pattern similarity matching | Week 16 |

**Exit Criteria:**
- [ ] Context persists across agent calls within session
- [ ] Memory searchable by multiple criteria
- [ ] Reasoning patterns stored with confidence
- [ ] Similar patterns retrieved effectively

### 11.5 Phase 5: Suggestions, Feedback & Maintenance (Weeks 17-20)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M5.1 | Suggestion workflow | Week 17 |
| M5.2 | Feedback collection and resolution | Week 18 |
| M5.3 | Cleanup scheduler | Week 19 |
| M5.4 | Analytics and statistics | Week 20 |

**Exit Criteria:**
- [ ] AI suggestions reviewed and processed
- [ ] User feedback improves knowledge quality
- [ ] Automated cleanup maintains performance
- [ ] Analytics provide actionable insights

---

## 12. Acceptance Criteria

### 12.1 Feature-Level Acceptance

#### AC-001: Knowledge Entry Management
- [ ] Create entry with all fields (category, context, content, examples, confidence)
- [ ] Update entry creates history snapshot
- [ ] Delete soft-deletes and can be restored
- [ ] Search returns relevant entries within 200ms
- [ ] Pagination works correctly with total count

#### AC-002: Edit History
- [ ] Every edit creates history record
- [ ] History shows previous and new values
- [ ] Revert restores entry to historical state
- [ ] History retrievable with pagination

#### AC-003: Suggestions System
- [ ] Suggestions created with source tracking
- [ ] Similar entries detected on creation
- [ ] Approve creates knowledge entry
- [ ] Reject records reason
- [ ] Merge combines with existing entry

#### AC-004: Feedback System
- [ ] Feedback submitted with type and optional comment
- [ ] Resolution requires notes
- [ ] Feedback counts aggregated per entry
- [ ] Status transitions work correctly

#### AC-005: Brand Voice
- [ ] Tone, vocabulary, avoid-words stored as arrays
- [ ] Examples stored by content type
- [ ] One voice per client (upsert behavior)
- [ ] Prompt generation includes all components
- [ ] Industry and audience context included

#### AC-006: Client Context
- [ ] All business fields stored correctly
- [ ] Customer personas with nested data
- [ ] Custom fields support arbitrary data
- [ ] Context prompt formatted correctly

#### AC-007: Memory Storage
- [ ] Context stored with session association
- [ ] Values retrievable by session and key
- [ ] Update merges with existing context
- [ ] Delete removes by session or key
- [ ] TTL expiration functions correctly

#### AC-008: Reasoning Patterns
- [ ] Patterns stored with confidence scores
- [ ] Similar patterns found by content
- [ ] Usage statistics tracked accurately
- [ ] Top patterns retrievable by performance

#### AC-009: Action Patterns
- [ ] Patterns stored by unique task type
- [ ] Steps ordered correctly
- [ ] Execution updates success/failure counts
- [ ] Last executed timestamp updated

#### AC-010: Element Selectors
- [ ] Selectors stored by page path and name
- [ ] Fallbacks maintained and merged
- [ ] Usage updates success rate (EMA)
- [ ] Successful fallbacks promoted

#### AC-011: Error Patterns
- [ ] Errors recorded with recovery strategies
- [ ] Occurrence count incremented
- [ ] Recovery success updates strategy rates
- [ ] Strategies returned sorted by success rate

#### AC-012: Cleanup & Maintenance
- [ ] Expired entries cleaned correctly
- [ ] Low-performance patterns removed
- [ ] Scheduler starts/stops via API
- [ ] Statistics tracked accurately

#### AC-013: Analytics
- [ ] Top entries by usage accurate
- [ ] Category breakdown correct
- [ ] Quality metrics calculated properly
- [ ] System stats complete

### 12.2 Integration Acceptance

- [ ] All endpoints require authentication (protectedProcedure)
- [ ] User data isolation enforced (userId in all queries)
- [ ] Input validation on all endpoints (Zod schemas)
- [ ] API response times within SLA (P95 < 200ms)
- [ ] Error responses include actionable messages

### 12.3 Quality Acceptance

- [ ] Unit test coverage >= 80%
- [ ] Integration tests for all routers
- [ ] No critical security vulnerabilities
- [ ] Performance benchmarks met
- [ ] Documentation complete for all APIs

---

## Appendix A: API Reference

### A.1 Knowledge Router Endpoints

| Endpoint | Method | Input | Response |
|----------|--------|-------|----------|
| `knowledge.getPattern` | query | `{ taskType }` | `{ success, pattern }` |
| `knowledge.listPatterns` | query | - | `{ success, patterns, total }` |
| `knowledge.getTopPatterns` | query | `{ limit? }` | `{ success, patterns }` |
| `knowledge.savePattern` | mutation | `ActionPattern` | `{ success, message }` |
| `knowledge.recordPatternExecution` | mutation | `{ taskType, success }` | `{ success, message }` |
| `knowledge.deletePattern` | mutation | `{ taskType }` | `{ success, message }` |
| `knowledge.getSelector` | query | `{ pagePath, elementName }` | `{ success, selector }` |
| `knowledge.saveSelector` | mutation | `ElementSelector` | `{ success, message }` |
| `knowledge.recordSelectorUsage` | mutation | `{ pagePath, elementName, selectorUsed, success }` | `{ success, message }` |
| `knowledge.recordError` | mutation | `{ errorType, errorMessage, context }` | `{ success, recoveryStrategies }` |
| `knowledge.recordRecoverySuccess` | mutation | `{ errorType, context, strategyUsed }` | `{ success, message }` |
| `knowledge.getErrorStats` | query | - | `{ success, stats }` |
| `knowledge.submitFeedback` | mutation | `AgentFeedback` | `{ success, message }` |
| `knowledge.getFeedback` | query | `{ userId?, taskType?, rating?, limit? }` | `{ success, feedback, total }` |
| `knowledge.getFeedbackStats` | query | - | `{ success, stats }` |
| `knowledge.getBrandVoice` | query | `{ clientId }` | `{ success, brandVoice }` |
| `knowledge.listBrandVoices` | query | - | `{ success, brandVoices, total }` |
| `knowledge.saveBrandVoice` | mutation | `BrandVoice` | `{ success, message }` |
| `knowledge.generateBrandPrompt` | query | `{ clientId, contentType }` | `{ success, prompt }` |
| `knowledge.getClientContext` | query | `{ clientId }` | `{ success, context }` |
| `knowledge.listClientContexts` | query | - | `{ success, contexts, total }` |
| `knowledge.saveClientContext` | mutation | `ClientContext` | `{ success, message }` |
| `knowledge.generateContextPrompt` | query | `{ clientId }` | `{ success, prompt }` |
| `knowledge.getSystemStats` | query | - | `{ success, stats }` |
| `knowledge.getRecommendations` | query | `{ taskDescription, clientId? }` | `{ success, recommendations }` |
| `knowledge.health` | query | - | `{ success, healthy, stats }` |

### A.2 Knowledge Management Router Endpoints

| Endpoint | Method | Input | Response |
|----------|--------|-------|----------|
| `knowledgeManagement.createEntry` | mutation | `CreateEntry` | `{ success, entry }` |
| `knowledgeManagement.getEntries` | query | `ListEntries` | `{ entries, total, limit, offset }` |
| `knowledgeManagement.getEntryById` | query | `{ id }` | `{ entry, editHistory, feedbackSummary }` |
| `knowledgeManagement.updateEntry` | mutation | `UpdateEntry` | `{ success, entry }` |
| `knowledgeManagement.deleteEntry` | mutation | `{ id, reason? }` | `{ success, id }` |
| `knowledgeManagement.restoreEntry` | mutation | `{ id, reason? }` | `{ success, id }` |
| `knowledgeManagement.getEditHistory` | query | `{ knowledgeEntryId, limit?, offset? }` | `{ history, total }` |
| `knowledgeManagement.revertToVersion` | mutation | `{ knowledgeEntryId, historyId, reason? }` | `{ success, entry }` |
| `knowledgeManagement.createSuggestion` | mutation | `CreateSuggestion` | `{ success, suggestion, hasSimilar, similarEntries }` |
| `knowledgeManagement.getSuggestions` | query | `ListSuggestions` | `{ suggestions, total }` |
| `knowledgeManagement.approveSuggestion` | mutation | `{ suggestionId, reviewNotes?, modifyContent? }` | `{ success, entry, suggestionId }` |
| `knowledgeManagement.rejectSuggestion` | mutation | `{ suggestionId, reviewNotes }` | `{ success, suggestionId }` |
| `knowledgeManagement.mergeSuggestion` | mutation | `{ suggestionId, targetKnowledgeEntryId, reviewNotes? }` | `{ success, entry, suggestionId }` |
| `knowledgeManagement.submitFeedback` | mutation | `SubmitFeedback` | `{ success, feedback }` |
| `knowledgeManagement.getFeedback` | query | `GetFeedback` | `{ feedback, total }` |
| `knowledgeManagement.resolveFeedback` | mutation | `{ feedbackId, resolution }` | `{ success, feedbackId }` |
| `knowledgeManagement.getUsageStats` | query | `{ category?, limit? }` | `{ topEntries }` |
| `knowledgeManagement.getCategoryBreakdown` | query | `{ includeInactive? }` | `{ breakdown }` |
| `knowledgeManagement.getQualityMetrics` | query | `{ category? }` | `{ entries, feedback, suggestions }` |
| `knowledgeManagement.incrementUsage` | mutation | `{ id }` | `{ success, id, newCount }` |

### A.3 Memory Router Endpoints

| Endpoint | Method | Input | Response |
|----------|--------|-------|----------|
| `memory.create` | mutation | `CreateMemory` | `{ success, entryId, message }` |
| `memory.getBySession` | query | `{ sessionId, limit?, offset? }` | `{ success, entries, total }` |
| `memory.getByKey` | query | `{ sessionId, key }` | `{ success, value }` |
| `memory.search` | query | `QueryMemory` | `{ success, entries, total }` |
| `memory.update` | mutation | `UpdateMemory` | `{ success, message }` |
| `memory.delete` | mutation | `{ sessionId, key? }` | `{ success, message }` |
| `memory.storeContext` | mutation | `SessionContext` | `{ success, message }` |
| `memory.getContext` | query | `{ sessionId }` | `{ success, context }` |
| `memory.updateContext` | mutation | `SessionContext` | `{ success, message }` |
| `memory.storeReasoning` | mutation | `ReasoningPattern` | `{ success, patternId, message }` |
| `memory.searchReasoning` | query | `SearchReasoning` | `{ success, patterns, total }` |
| `memory.updateReasoningUsage` | mutation | `{ patternId, success }` | `{ success, message }` |
| `memory.getTopReasoning` | query | `{ limit? }` | `{ success, patterns }` |
| `memory.consolidate` | mutation | `{ sessionId?, agentId?, threshold? }` | `{ success, consolidatedCount, message }` |
| `memory.cleanup` | mutation | `CleanupOptions` | `{ success, expiredCleaned, lowPerformanceCleaned, message }` |
| `memory.clearCaches` | mutation | - | `{ success, message }` |
| `memory.getStats` | query | `{ sessionId?, domain? }` | `{ success, stats }` |
| `memory.getUsageBreakdown` | query | `{ sessionId?, agentId? }` | `{ success, breakdown, total }` |
| `memory.health` | query | - | `{ success, healthy, stats }` |
| `memory.triggerCleanup` | mutation | `CleanupOptions` | `{ success, expiredCleaned, lowPerformanceCleaned, message }` |
| `memory.triggerConsolidation` | mutation | `ConsolidateOptions` | `{ success, consolidatedCount, message }` |
| `memory.getCleanupStats` | query | - | `{ success, stats }` |
| `memory.startCleanupScheduler` | mutation | `SchedulerOptions` | `{ success, message }` |
| `memory.stopCleanupScheduler` | mutation | - | `{ success, message }` |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Action Pattern** | A stored sequence of browser automation steps for a specific task type |
| **Brand Voice** | Configuration defining a client's communication style, tone, and vocabulary |
| **Client Context** | Business information about a client including products, services, and personas |
| **Confidence Score** | A value (0-1) indicating reliability or certainty of knowledge |
| **Edit History** | Audit trail of changes made to knowledge entries |
| **Element Selector** | CSS/XPath selector for identifying UI elements with fallback alternatives |
| **Error Pattern** | Recorded error occurrences with associated recovery strategies |
| **Knowledge Entry** | A unit of stored information in the knowledge base |
| **LRU Cache** | Least Recently Used cache for frequently accessed data |
| **Memory Entry** | Session-scoped data stored for agent context continuity |
| **Reasoning Pattern** | A learned approach or strategy that can be reused for similar situations |
| **Recovery Strategy** | An approach for handling specific types of errors |
| **Suggestion** | AI-generated knowledge proposal awaiting human review |
| **TTL** | Time-To-Live, duration before automatic expiration |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Development Team | Initial PRD creation |

---

**Document Status:** Ready for Review
**Next Review:** 2026-01-18
**Stakeholders:** Engineering, Product, AI/ML Team
