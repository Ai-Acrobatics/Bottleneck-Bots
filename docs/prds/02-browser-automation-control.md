# PRD-02: Browser Automation Control

**Feature**: Browser Automation Control via Browserbase + Stagehand
**Status**: Implementation Complete
**Priority**: Critical
**Owner**: Engineering Team
**Last Updated**: 2026-01-11

---

## 1. Overview

The Browser Automation Control feature provides comprehensive remote browser automation capabilities through Browserbase infrastructure and Stagehand AI. This system enables users to create managed browser sessions, execute AI-powered actions, extract structured data, capture screenshots, record sessions, and manage multi-tab workflows - all via a secure, API-driven interface.

The feature is implemented primarily in `server/api/routers/browser.ts` with supporting services for SDK integration, context isolation, and multi-agent coordination.

### Key Integration Points

| Component | Purpose |
|-----------|---------|
| Browserbase SDK | Cloud browser infrastructure, session management, recording |
| Stagehand AI | AI-powered element detection, action execution, data extraction |
| tRPC Router | Type-safe API endpoints for client applications |
| WebSocket Service | Real-time event broadcasting to connected clients |
| Session Metrics Service | Usage tracking, cost calculation, performance monitoring |
| Context Isolation Service | Multi-tenant security, encrypted storage persistence |
| Browser Agent Bridge | Swarm integration for multi-agent coordination |

---

## 2. Problem Statement

### Current Challenges

1. **Manual Web Automation Complexity**: Traditional automation requires maintaining selectors, handling dynamic content, and managing browser state manually
2. **Scalability Limitations**: Local browser automation doesn't scale across distributed teams or cloud infrastructure
3. **Anti-Bot Detection**: Standard automation tools are easily detected and blocked by modern websites
4. **Data Extraction Fragility**: Schema-less extraction produces inconsistent results; page changes break scrapers
5. **Multi-Tenant Isolation**: Shared browser contexts risk data leakage between clients
6. **Performance Bottlenecks**: Sequential LLM calls for each action create significant latency
7. **Session State Management**: Maintaining authentication and context across automation runs is error-prone

### Impact Without Solution

- Manual data entry consuming 40+ hours per week per team
- Failed automations requiring human intervention 35% of the time
- Security concerns preventing adoption of browser automation
- Slow execution times (30+ seconds per action) limiting throughput

---

## 3. Goals & Success Metrics

### Primary Goals

1. Provide reliable, AI-powered browser automation that adapts to page changes
2. Enable secure multi-tenant browser session management
3. Achieve 10-100x performance improvement through caching and optimization
4. Support complex multi-page and multi-tab workflows
5. Deliver real-time visibility into automation execution

### Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Session Creation Success Rate | > 99.5% | Browserbase API success/failure ratio |
| Action Execution Accuracy | > 95% | Stagehand act() success rate |
| Data Extraction Validity | > 98% | Schema validation pass rate |
| Batch Action Speed Improvement | 2-3x | Timing comparison vs sequential calls |
| Cached Workflow Speedup | 10-100x | Repeat execution timing |
| Self-Healing Success Rate | > 90% | Recovery rate on page changes |
| CAPTCHA Solve Rate | > 85% | Browserbase solveCaptchas metric |
| P95 Session Latency | < 5s | Session creation to ready state |
| Multi-Tab Operation Success | > 98% | Tab management operation success |
| Cost per 1000 Operations | < $5 | Browserbase billing / operation count |

---

## 4. User Stories

### Session Management

**US-4.1**: As a user, I want to create a browser session with custom viewport and geolocation so that I can automate region-specific websites.

**US-4.2**: As a user, I want sessions to automatically block ads and solve CAPTCHAs so that automation runs uninterrupted.

**US-4.3**: As a user, I want to access a live debug view of my session so that I can monitor automation in real-time.

**US-4.4**: As a user, I want session recordings with rrweb playback so that I can review and debug automation runs.

### AI-Powered Actions

**US-4.5**: As a user, I want to execute actions using natural language instructions so that I don't need to write selectors.

**US-4.6**: As a user, I want the system to observe available actions on a page so that I can understand what interactions are possible.

**US-4.7**: As a user, I want batch actions to execute 2-3x faster using the observe+act pattern so that complex workflows complete quickly.

**US-4.8**: As a user, I want self-healing automation that adapts to minor page changes so that my workflows don't break.

### Data Extraction

**US-4.9**: As a user, I want to extract structured data with schema validation (contact info, product info, tables) so that extracted data is consistent.

**US-4.10**: As a user, I want to save extracted data to the database with tags so that I can organize and retrieve it later.

**US-4.11**: As a user, I want to target specific elements with CSS/XPath selectors to narrow extraction scope.

### Multi-Page Workflows

**US-4.12**: As a user, I want to open, switch between, and close browser tabs so that I can automate multi-page workflows.

**US-4.13**: As a user, I want to execute actions on specific pages by index so that I can control multi-tab automation.

**US-4.14**: As a user, I want deep locator support with iframe traversal so that I can automate embedded content.

### File Handling

**US-4.15**: As a user, I want to upload files to input elements so that I can automate form submissions with attachments.

**US-4.16**: As a user, I want to track downloaded files from sessions so that I can retrieve automation outputs.

### Performance & Optimization

**US-4.17**: As a user, I want DOM optimization (remove videos, iframes, animations) so that AI processing is 20-40% faster.

**US-4.18**: As a user, I want action caching for 10-100x faster repeat workflows so that routine automations are instantaneous.

**US-4.19**: As a user, I want to view operation history and metrics so that I can identify performance bottlenecks.

### Agent Execution

**US-4.20**: As a user, I want autonomous agent execution with configurable max steps so that complex tasks complete without manual intervention.

**US-4.21**: As a user, I want Computer Use Agent (CUA) mode for advanced scenarios so that I can automate visual-only interfaces.

---

## 5. Functional Requirements

### 5.1 Session Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.1.1 | Create sessions with configurable viewport (320x240 to 3840x2160) | P0 |
| FR-5.1.2 | Support geolocation configuration (city, state, country) via proxies | P0 |
| FR-5.1.3 | Enable/disable ad blocking per session | P0 |
| FR-5.1.4 | Enable/disable CAPTCHA solving per session | P0 |
| FR-5.1.5 | Configure session timeout (60s to 7200s) | P0 |
| FR-5.1.6 | Keep-alive sessions for reuse across operations | P0 |
| FR-5.1.7 | Enable session recording for playback | P1 |
| FR-5.1.8 | Advanced stealth mode for anti-detection | P1 |
| FR-5.1.9 | Return debug URL for live session view | P0 |
| FR-5.1.10 | Return WebSocket URL for real-time events | P1 |
| FR-5.1.11 | Store session metadata in database | P0 |
| FR-5.1.12 | Track session start/end for metrics | P0 |
| FR-5.1.13 | Graceful session termination | P0 |
| FR-5.1.14 | Bulk terminate multiple sessions | P2 |
| FR-5.1.15 | Bulk delete sessions with extracted data cleanup | P2 |

### 5.2 Navigation & Actions

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.2.1 | Navigate to URL with configurable wait conditions (load, DOMContentLoaded, networkidle) | P0 |
| FR-5.2.2 | Click elements via CSS selector with fallback to AI instruction | P0 |
| FR-5.2.3 | Type text into inputs with optional delay and clear-first | P0 |
| FR-5.2.4 | Scroll to position (top, bottom, coordinates) with smooth option | P1 |
| FR-5.2.5 | AI-powered act() for natural language instructions | P0 |
| FR-5.2.6 | Observe page to discover available actions | P0 |
| FR-5.2.7 | Batch actions using observe+act pattern (2-3x faster) | P0 |
| FR-5.2.8 | Fast act with reduced timeout for simple operations | P1 |
| FR-5.2.9 | Fast navigate with DOMContentLoaded default and optional DOM optimization | P1 |
| FR-5.2.10 | Verify action preconditions before execution | P1 |
| FR-5.2.11 | Verify action success after execution | P1 |

### 5.3 Data Extraction

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.3.1 | Extract data with natural language instruction | P0 |
| FR-5.3.2 | Support predefined schemas: contactInfo, productInfo, tableData, links | P0 |
| FR-5.3.3 | Custom schema extraction without predefined type | P1 |
| FR-5.3.4 | Narrow extraction scope with CSS/XPath selector | P1 |
| FR-5.3.5 | Save extracted data to database with schema type | P0 |
| FR-5.3.6 | Tag extracted data for organization | P2 |
| FR-5.3.7 | Extract from specific page in multi-tab session | P1 |

### 5.4 Screenshots & Recording

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.4.1 | Capture full-page screenshots | P0 |
| FR-5.4.2 | Capture element-specific screenshots via selector | P1 |
| FR-5.4.3 | Configure screenshot quality (0-100) | P2 |
| FR-5.4.4 | Return screenshot as base64 data URL | P0 |
| FR-5.4.5 | Retrieve session recording URL | P0 |
| FR-5.4.6 | Session recording with rrweb format for playback | P1 |

### 5.5 Multi-Tab Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.5.1 | Open new tabs with optional URL | P0 |
| FR-5.5.2 | Open tabs in background without switching | P1 |
| FR-5.5.3 | List all tabs with URL and title | P0 |
| FR-5.5.4 | Switch to specific tab by ID | P0 |
| FR-5.5.5 | Close specific tab by ID | P0 |
| FR-5.5.6 | Act on specific page by index | P0 |
| FR-5.5.7 | Observe on specific page by index | P0 |
| FR-5.5.8 | Extract from specific page by index | P0 |

### 5.6 Deep Locator (Iframe Traversal)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.6.1 | Support >> hop notation for iframe traversal | P1 |
| FR-5.6.2 | Deep locator actions: click, fill, type, hover, highlight | P1 |
| FR-5.6.3 | Deep locator queries: getText, getHtml, isVisible, isChecked, inputValue | P1 |
| FR-5.6.4 | Count elements via deep locator | P2 |
| FR-5.6.5 | Get element centroid coordinates | P2 |
| FR-5.6.6 | Select elements by index (nth) or first() | P2 |

### 5.7 File Handling

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.7.1 | Upload files to file input elements | P1 |
| FR-5.7.2 | List downloads for a session | P1 |
| FR-5.7.3 | Track download completion status | P2 |

### 5.8 DOM Optimization

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.8.1 | Remove video elements for faster processing | P1 |
| FR-5.8.2 | Remove iframes for faster processing | P1 |
| FR-5.8.3 | Disable CSS animations and transitions | P1 |
| FR-5.8.4 | Remove hidden elements | P2 |
| FR-5.8.5 | Auto-optimize DOM after navigation (optional) | P2 |

### 5.9 Caching & Self-Healing

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.9.1 | Configure cache directory for action caching | P1 |
| FR-5.9.2 | Achieve 10-100x speedup on cached workflows | P1 |
| FR-5.9.3 | Self-healing mode for minor page changes | P1 |
| FR-5.9.4 | Clear cache by directory | P2 |
| FR-5.9.5 | Clear cache older than N days | P2 |
| FR-5.9.6 | List available caches with age information | P2 |

### 5.10 Agent Execution

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.10.1 | Autonomous agent execution with natural language instruction | P1 |
| FR-5.10.2 | Configurable max steps (1-100) | P1 |
| FR-5.10.3 | Custom system prompt for agent | P2 |
| FR-5.10.4 | Model selection (Gemini, Claude, etc.) | P1 |
| FR-5.10.5 | Computer Use Agent (CUA) mode | P2 |
| FR-5.10.6 | MCP integration URLs for extended capabilities | P3 |

### 5.11 Metrics & Monitoring

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.11.1 | Track operation type, timing, and metadata | P0 |
| FR-5.11.2 | Calculate session cost | P1 |
| FR-5.11.3 | Get operation history from Stagehand | P1 |
| FR-5.11.4 | Identify slowest operations | P2 |
| FR-5.11.5 | Success/failure counts per session | P1 |
| FR-5.11.6 | Broadcast events via WebSocket | P0 |

### 5.12 Context Isolation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.12.1 | Per-client browser context isolation | P0 |
| FR-5.12.2 | Encrypted storage persistence (cookies, localStorage) | P0 |
| FR-5.12.3 | Context lifecycle management (30-day TTL) | P1 |
| FR-5.12.4 | Session sandboxing within context | P0 |
| FR-5.12.5 | Automatic cleanup of inactive contexts | P2 |
| FR-5.12.6 | Security audit logging for context operations | P1 |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-6.1.1 | Session creation latency | < 5 seconds P95 |
| NFR-6.1.2 | Navigation latency (DOMContentLoaded) | < 3 seconds P95 |
| NFR-6.1.3 | AI action execution latency | < 10 seconds P95 |
| NFR-6.1.4 | Data extraction latency | < 15 seconds P95 |
| NFR-6.1.5 | Screenshot capture latency | < 2 seconds P95 |
| NFR-6.1.6 | Batch action overhead per item | < 500ms |
| NFR-6.1.7 | Concurrent sessions per user | Up to 10 |
| NFR-6.1.8 | Max session duration | 2 hours |

### 6.2 Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-6.2.1 | Browserbase API uptime | 99.9% |
| NFR-6.2.2 | Session recovery on failure | Automatic retry with backoff |
| NFR-6.2.3 | Circuit breaker activation | After 5 consecutive failures |
| NFR-6.2.4 | Graceful degradation | Fallback to selector-based actions |
| NFR-6.2.5 | Data extraction retry | Up to 3 attempts |

### 6.3 Security

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-6.3.1 | Authentication | All endpoints require valid session token |
| NFR-6.3.2 | Authorization | Users can only access their own sessions |
| NFR-6.3.3 | Context isolation | Clients cannot access other clients' data |
| NFR-6.3.4 | Storage encryption | AES-256-GCM for persisted context storage |
| NFR-6.3.5 | Credential handling | Never log actual typed text |
| NFR-6.3.6 | Cache path sanitization | Prevent directory traversal attacks |
| NFR-6.3.7 | Audit logging | All context operations logged |

### 6.4 Scalability

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-6.4.1 | Horizontal scaling | Stateless session management via Browserbase |
| NFR-6.4.2 | Session pooling | Reuse sessions across operations |
| NFR-6.4.3 | Bulk operations | Handle up to 50 sessions in single request |
| NFR-6.4.4 | Multi-agent coordination | Parallel execution with concurrency limits |

### 6.5 Observability

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-6.5.1 | Structured logging | All operations logged with session context |
| NFR-6.5.2 | Metrics collection | Session, operation, and cost metrics tracked |
| NFR-6.5.3 | Real-time events | WebSocket broadcasting for UI updates |
| NFR-6.5.4 | Error reporting | Detailed error messages with stack traces |

---

## 7. Technical Architecture

### 7.1 System Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Client Application                          │
│  (React UI, CLI, External API Consumers)                                │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │ tRPC / WebSocket
┌─────────────────────────────────▼───────────────────────────────────────┐
│                           API Layer (server/api)                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  browserRouter (browser.ts)                                       │   │
│  │  - Session CRUD, Navigation, Actions, Extraction, Screenshots    │   │
│  │  - Multi-tab, Deep Locator, Agent, Cache management              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────┐
│                          Service Layer (server/services)                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │ Stagehand       │  │ Session Metrics │  │ WebSocket Service       │  │
│  │ Instance Mgmt   │  │ Service         │  │ (Real-time events)      │  │
│  └────────┬────────┘  └────────┬────────┘  └────────────┬────────────┘  │
│           │                    │                        │               │
│  ┌────────▼────────┐  ┌────────▼────────┐  ┌────────────▼────────────┐  │
│  │ Context         │  │ Browser Agent   │  │ Agent Orchestrator      │  │
│  │ Isolation       │  │ Bridge (Swarm)  │  │ (Multi-agent tasks)     │  │
│  └────────┬────────┘  └────────┬────────┘  └────────────┬────────────┘  │
└───────────┼────────────────────┼────────────────────────┼───────────────┘
            │                    │                        │
┌───────────▼────────────────────▼────────────────────────▼───────────────┐
│                           Core Layer (server/_core)                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  browserbaseSDK.ts                                                │   │
│  │  - Session create, debug, recording, logs, terminate             │   │
│  │  - Retry logic, circuit breaker, health checks                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │ HTTPS / WSS
┌─────────────────────────────────▼───────────────────────────────────────┐
│                        External Services                                 │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────┐   │
│  │  Browserbase Infrastructure │  │  AI Model APIs                   │   │
│  │  - Cloud browsers           │  │  - Gemini (default)              │   │
│  │  - Recording                │  │  - Claude                        │   │
│  │  - Geolocation proxies      │  │  - Custom models                 │   │
│  └─────────────────────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Data Flow

```
1. Session Creation:
   Client → browserRouter.createSession
         → browserbaseSDK.createSession
         → Browserbase API
         → Store in DB
         → Track metrics
         → WebSocket broadcast

2. AI Action Execution:
   Client → browserRouter.act
         → getStagehandInstance (get/create)
         → stagehand.act(instruction)
         → AI inference
         → Browser action
         → Track operation
         → WebSocket broadcast

3. Batch Actions (Optimized):
   Client → browserRouter.batchActions
         → stagehand.observe (1 LLM call)
         → Loop: stagehand.act(element) (no LLM)
         → Track timing
         → WebSocket broadcast

4. Data Extraction:
   Client → browserRouter.extractData
         → stagehand.extract(instruction, schema)
         → AI extraction
         → Validate schema
         → Save to DB
         → WebSocket broadcast
```

### 7.3 Database Schema

```sql
-- Browser Sessions Table
CREATE TABLE browser_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  session_id VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  project_id VARCHAR(255),
  debug_url TEXT,
  url TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  expires_at TIMESTAMP
);

-- Extracted Data Table
CREATE TABLE extracted_data (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES browser_sessions(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  url TEXT NOT NULL,
  data_type VARCHAR(50),
  selector TEXT,
  data JSONB NOT NULL,
  metadata JSONB,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Browser Contexts Table (Multi-tenant Isolation)
CREATE TABLE browser_contexts (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  context_id VARCHAR(255) NOT NULL UNIQUE,
  isolation_level VARCHAR(20) DEFAULT 'strict',
  is_active BOOLEAN DEFAULT TRUE,
  active_session_count INTEGER DEFAULT 0,
  encrypted_storage TEXT,
  storage_iv VARCHAR(64),
  storage_auth_tag VARCHAR(64),
  last_used_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 7.4 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `createSession` | mutation | Create new browser session |
| `navigateTo` | mutation | Navigate to URL |
| `clickElement` | mutation | Click element (selector or AI) |
| `typeText` | mutation | Type into input field |
| `scrollTo` | mutation | Scroll to position |
| `extractData` | mutation | AI-powered data extraction |
| `takeScreenshot` | mutation | Capture screenshot |
| `act` | mutation | AI action with instruction |
| `observe` | mutation | Discover available actions |
| `batchActions` | mutation | Optimized observe+act pattern |
| `optimizeDOM` | mutation | Remove heavy elements |
| `getHistory` | query | Get operation history |
| `fastAct` | mutation | Quick action with reduced timeout |
| `fastNavigate` | mutation | Quick navigation with optimizations |
| `getDebugUrl` | query | Get live view URL |
| `getRecording` | query | Get recording URL |
| `closeSession` | mutation | Gracefully close session |
| `deleteSession` | mutation | Delete session and data |
| `bulkTerminate` | mutation | Terminate multiple sessions |
| `bulkDelete` | mutation | Delete multiple sessions |
| `listSessions` | query | List user's sessions |
| `getSessionExtractedData` | query | Get extracted data for session |
| `getSessionMetrics` | query | Get metrics and cost |
| `newPage` | mutation | Open new tab |
| `listPages` | query | List all tabs |
| `actOnPage` | mutation | Act on specific tab |
| `observeOnPage` | mutation | Observe on specific tab |
| `extractFromPage` | mutation | Extract from specific tab |
| `agentExecute` | mutation | Autonomous agent execution |
| `deepLocatorAction` | mutation | Action with iframe traversal |
| `deepLocatorCount` | query | Count elements with deep locator |
| `deepLocatorCentroid` | query | Get element coordinates |
| `clearCache` | mutation | Clear action cache |
| `listCaches` | query | List available caches |
| `openTab` | mutation | Open new browser tab |
| `switchTab` | mutation | Switch to tab |
| `closeTab` | mutation | Close tab |
| `listTabsInSession` | query | List tabs in session |
| `uploadFile` | mutation | Upload file to input |
| `getDownloads` | query | List session downloads |
| `verifyAction` | query | Verify action preconditions |
| `verifySuccess` | query | Verify action success |
| `inspectElement` | query | Get element details |
| `getPageStructure` | query | Get page structure |

---

## 8. Dependencies

### 8.1 External Services

| Service | Purpose | Criticality |
|---------|---------|-------------|
| Browserbase | Cloud browser infrastructure | Critical |
| Stagehand | AI-powered browser automation | Critical |
| AI Model Provider (Gemini/Claude) | LLM inference for actions | Critical |
| PostgreSQL | Session and data persistence | Critical |

### 8.2 NPM Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `@browserbasehq/sdk` | Latest | Browserbase API client |
| `@browserbasehq/stagehand` | Latest | AI automation framework |
| `zod` | ^3.x | Schema validation |
| `@trpc/server` | ^10.x | Type-safe API |
| `drizzle-orm` | ^0.x | Database ORM |

### 8.3 Internal Dependencies

| Module | Purpose |
|--------|---------|
| `server/_core/trpc` | tRPC router configuration |
| `server/db` | Database connection |
| `server/services/sessionMetrics.service` | Usage tracking |
| `server/services/websocket.service` | Real-time events |
| `drizzle/schema` | Database schema types |

### 8.4 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BROWSERBASE_API_KEY` | Yes | Browserbase authentication |
| `BROWSERBASE_PROJECT_ID` | Yes | Browserbase project identifier |
| `BROWSERBASE_REGION` | No | Default: us-west-2 |
| `STAGEHAND_MODEL` | No | AI model (default: google/gemini-2.0-flash) |
| `AI_MODEL` | No | Fallback AI model configuration |
| `CREDENTIAL_ENCRYPTION_KEY` | Yes* | 64-char hex for context storage |

---

## 9. Out of Scope

The following capabilities are explicitly excluded from this feature:

1. **Local Browser Automation**: All automation runs via Browserbase cloud infrastructure
2. **Browser Extension Support**: Not supporting custom browser extensions
3. **Desktop Application Automation**: Web browsers only, no native app support
4. **Video Capture**: Session recording is via Browserbase rrweb, not video
5. **Real-time Collaboration**: No multi-user session sharing
6. **Custom Browser Profiles**: Using Browserbase-managed profiles only
7. **Offline Mode**: Requires network connectivity to Browserbase
8. **PDF Generation**: Screenshot capture only, no PDF export
9. **Email Automation**: Web-based email clients only, no SMTP integration
10. **Mobile Emulation**: Desktop viewport only, no mobile-specific automation

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Browserbase API outage | Critical | Low | Circuit breaker pattern, graceful degradation |
| AI model rate limiting | High | Medium | Request queuing, model fallback, caching |
| Website structure changes | Medium | High | Self-healing mode, monitoring, alerts |
| Session timeout mid-operation | Medium | Medium | Keep-alive, session recovery, longer timeouts |
| Memory pressure from long sessions | Medium | Low | DOM optimization, session cleanup |

### 10.2 Security Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Cross-client data leakage | Critical | Low | Context isolation, encryption, audit logging |
| Credential exposure in logs | High | Medium | Never log typed text, redaction |
| Cache poisoning | Medium | Low | Path sanitization, cache validation |
| Session hijacking | Critical | Low | User-scoped sessions, token validation |

### 10.3 Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Browserbase pricing increases | High | Low | Usage monitoring, cost alerts, optimization |
| Website blocking automation | Medium | High | Advanced stealth mode, proxy rotation |
| CAPTCHA solve failures | Medium | Medium | Manual fallback queue, alternative providers |

---

## 11. Milestones & Timeline

### Phase 1: Core Infrastructure (Completed)

- [x] Browserbase SDK integration with retry logic and circuit breaker
- [x] Session creation with viewport, geolocation, and recording
- [x] Basic navigation and element interactions
- [x] Screenshot capture and session debugging
- [x] tRPC router implementation

### Phase 2: AI-Powered Automation (Completed)

- [x] Stagehand integration with instance management
- [x] AI action execution (act)
- [x] Page observation (observe)
- [x] Data extraction with schema validation
- [x] Batch actions with observe+act optimization

### Phase 3: Advanced Features (Completed)

- [x] Multi-tab management (open, switch, close, list)
- [x] Multi-page operations (act, observe, extract on specific pages)
- [x] Deep locator with iframe traversal
- [x] DOM optimization for performance
- [x] Fast navigation and action variants
- [x] Agent execution with CUA mode

### Phase 4: Enterprise Features (Completed)

- [x] Context isolation for multi-tenant security
- [x] Encrypted storage persistence
- [x] Action caching for 10-100x speedup
- [x] Self-healing mode
- [x] Bulk operations (terminate, delete)
- [x] File upload/download handling

### Phase 5: Swarm Integration (Completed)

- [x] Browser Agent Bridge for multi-agent coordination
- [x] Task distribution with GHL operation routing
- [x] Parallel, sequential, and pipeline execution modes
- [x] Result aggregation strategies
- [x] Bulk GHL operations

### Phase 6: Monitoring & Optimization (Current)

- [ ] Enhanced operation history analytics
- [ ] Cost prediction and budgeting
- [ ] Performance benchmarking dashboard
- [ ] Automated cache management
- [ ] Usage quota enforcement

---

## 12. Acceptance Criteria

### AC-12.1 Session Management

- [ ] User can create session with custom viewport (1920x1080) in < 5 seconds
- [ ] Session includes working debug URL for live view
- [ ] Session recording is accessible after completion
- [ ] Sessions are automatically cleaned up after timeout
- [ ] Bulk terminate operates on up to 50 sessions

### AC-12.2 Navigation & Actions

- [ ] Navigate to any URL with configurable wait conditions
- [ ] AI act() successfully executes 95% of natural language instructions
- [ ] Batch actions are 2x faster than sequential for 5+ actions
- [ ] Click/type fallback from selector to AI works seamlessly

### AC-12.3 Data Extraction

- [ ] Extract contact info matches predefined schema
- [ ] Extract product info matches predefined schema
- [ ] Extract table data returns array of records
- [ ] Extracted data persists to database with session reference
- [ ] Selector-scoped extraction reduces result size

### AC-12.4 Multi-Tab Workflows

- [ ] Open new tab with URL in background
- [ ] Switch between tabs by ID
- [ ] Close tab without affecting other tabs
- [ ] Act/observe/extract target correct page by index

### AC-12.5 Performance Optimization

- [ ] DOM optimization removes videos and iframes
- [ ] Cached workflows execute 10x faster on repeat
- [ ] Self-healing mode recovers from minor selector changes
- [ ] Fast navigate completes in < 3 seconds

### AC-12.6 Security & Isolation

- [ ] Users cannot access other users' sessions
- [ ] Client contexts are isolated per clientId
- [ ] Storage is encrypted with AES-256-GCM
- [ ] Audit log captures all context operations

### AC-12.7 Agent Execution

- [ ] Agent completes multi-step task within max steps
- [ ] Agent execution returns result message
- [ ] CUA mode works for visual-only interfaces

### AC-12.8 Real-time Events

- [ ] WebSocket broadcasts session creation
- [ ] WebSocket broadcasts action execution
- [ ] WebSocket broadcasts data extraction
- [ ] WebSocket broadcasts session closure

---

## Appendix A: Validation Schemas

```typescript
// Session Creation
const createSessionSchema = z.object({
  geolocation: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  browserSettings: z.object({
    viewport: z.object({
      width: z.number().int().min(320).max(3840).default(1920),
      height: z.number().int().min(240).max(2160).default(1080),
    }).optional(),
    blockAds: z.boolean().default(true),
    solveCaptchas: z.boolean().default(true),
    advancedStealth: z.boolean().default(false),
  }).optional(),
  recordSession: z.boolean().default(true),
  keepAlive: z.boolean().default(true),
  timeout: z.number().int().min(60).max(7200).default(3600),
  cacheDir: z.string().optional(),
  selfHeal: z.boolean().default(false),
});

// Data Extraction Schemas
const contactInfoSchema = z.object({
  contactInfo: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    name: z.string().optional(),
    company: z.string().optional(),
  }),
});

const productInfoSchema = z.object({
  productInfo: z.object({
    name: z.string().optional(),
    price: z.string().optional(),
    description: z.string().optional(),
    availability: z.string().optional(),
    images: z.array(z.string()).optional(),
    rating: z.string().optional(),
    reviews: z.number().optional(),
  }),
});
```

---

## Appendix B: WebSocket Event Types

| Event | Payload |
|-------|---------|
| `browser:session:created` | `{ sessionId, debugUrl, status }` |
| `browser:navigation` | `{ sessionId, url, timestamp }` |
| `browser:action` | `{ sessionId, action, selector, method, timestamp }` |
| `browser:data:extracted` | `{ sessionId, url, dataType, recordId, timestamp }` |
| `browser:screenshot:captured` | `{ sessionId, size, timestamp }` |
| `browser:batch:completed` | `{ sessionId, instruction, results, timing, timestamp }` |
| `browser:page:created` | `{ sessionId, pageIndex, url, timestamp }` |
| `browser:agent:completed` | `{ sessionId, instruction, message, durationMs, timestamp }` |
| `browser:deepLocator:action` | `{ sessionId, selector, action, result, timestamp }` |
| `browser:cache:cleared` | `{ cacheDir, timestamp }` |
| `browser:session:closed` | `{ sessionId, timestamp }` |
| `browser:session:deleted` | `{ sessionId, timestamp }` |
| `browser:sessions:bulk-terminated` | `{ results, timestamp }` |
| `browser:sessions:bulk-deleted` | `{ results, timestamp }` |

---

## Appendix C: Error Codes

| Code | Description |
|------|-------------|
| `INTERNAL_SERVER_ERROR` | Generic server error |
| `BAD_REQUEST` | Invalid input parameters |
| `NOT_INITIALIZED` | Browserbase SDK not initialized |
| `MISSING_PROJECT_ID` | Project ID not configured |
| `MISSING_SESSION_ID` | Session ID required but not provided |
| `CREATE_SESSION_ERROR` | Failed to create Browserbase session |
| `GET_DEBUG_ERROR` | Failed to retrieve debug URL |
| `GET_RECORDING_ERROR` | Failed to retrieve recording |
| `TERMINATE_SESSION_ERROR` | Failed to terminate session |
| `INIT_ERROR` | SDK initialization failed |
