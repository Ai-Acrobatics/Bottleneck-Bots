# PRD-015: Developer API & Marketplace

**Document Version:** 1.0
**Status:** Draft
**Author:** Development Team
**Last Updated:** January 11, 2026
**Feature Location:** `server/api/routers/apiKeys.ts`, `server/api/routers/marketplace.ts`, `server/api/rest/`, `server/mcp/`, `server/services/code-generator.service.ts`, `server/services/webhook.service.ts`, `server/services/template-loader.service.ts`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Stories & Personas](#4-user-stories--personas)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Technical Architecture](#7-technical-architecture)
8. [API Specifications](#8-api-specifications)
9. [Data Models](#9-data-models)
10. [UI/UX Requirements](#10-uiux-requirements)
11. [Dependencies & Integrations](#11-dependencies--integrations)
12. [Release Criteria](#12-release-criteria)
13. [Risks & Mitigations](#13-risks--mitigations)
14. [Future Considerations](#14-future-considerations)

---

## 1. Executive Summary

### 1.1 Overview

The Developer API & Marketplace feature transforms Bottleneck-Bots from a standalone automation platform into an extensible ecosystem. This feature enables developers to programmatically interact with the platform through type-safe APIs, extend functionality via Model Context Protocol (MCP) tools, share and monetize workflows through a marketplace, and generate automation scripts in multiple programming languages.

### 1.2 Feature Components

| Component | Description | Implementation |
|-----------|-------------|----------------|
| **API Keys Management** | Secure API key generation, rotation, and scope-based access control | `apiKeys.ts` |
| **tRPC API** | 45+ type-safe procedures with automatic TypeScript generation | `server/api/routers/*.ts` |
| **REST API** | Legacy-compatible REST endpoints with OpenAPI documentation | `server/api/rest/` |
| **MCP Tools** | Model Context Protocol integration for AI agent extensibility | `server/mcp/tools/` |
| **Marketplace** | Browse, install, and publish community workflows/templates | `marketplace.ts` |
| **Template System** | Pre-built workflow templates with variable substitution | `template-loader.service.ts` |
| **Code Generator** | AI-powered generation of JavaScript/Python automation scripts | `code-generator.service.ts` |
| **Webhook System** | Inbound/outbound webhook handling with retry logic | `webhooks.ts`, `webhook.service.ts` |

### 1.3 Target Users

- **API Developers**: Engineers building integrations with Bottleneck-Bots
- **Automation Architects**: Power users creating complex multi-system workflows
- **Marketplace Publishers**: Developers monetizing automation templates
- **AI Agent Builders**: Teams extending the platform with MCP tools
- **No-Code Users**: Business users leveraging pre-built templates

### 1.4 Business Value

- **Revenue Expansion**: Marketplace fees (15-30% commission on template sales)
- **Platform Stickiness**: API integrations create switching costs
- **Community Growth**: User-generated content expands platform capabilities
- **Developer Adoption**: Type-safe APIs attract technical users
- **Reduced Support**: Self-service documentation and code generation

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **No Programmatic Access**: Users cannot integrate Bottleneck-Bots into existing toolchains
2. **Limited Extensibility**: Platform capabilities are fixed; users cannot add custom tools
3. **Knowledge Silos**: Successful automation patterns are not shared across users
4. **Manual Script Writing**: Users must manually write integration code
5. **Webhook Complexity**: No built-in support for event-driven automation
6. **Template Discovery**: Pre-built workflows are not discoverable or installable

### 2.2 User Pain Points

| Persona | Pain Point | Impact |
|---------|------------|--------|
| API Developer | "I need to trigger automations from my CI/CD pipeline but there's no API" | Manual intervention required |
| Agency Owner | "I built a great workflow but can't share it with my clients" | Lost revenue opportunity |
| Enterprise User | "I need audit logs for all API access for compliance" | Security/compliance gaps |
| AI Engineer | "I want to add custom tools that my agents can use" | Limited AI capabilities |
| Business Analyst | "I spend hours writing Python scripts to extract data" | Time waste on repetitive coding |

### 2.3 Competitive Gap Analysis

| Competitor | API Access | Marketplace | MCP Support | Code Gen |
|------------|-----------|-------------|-------------|----------|
| Zapier | Limited | Yes | No | No |
| Make.com | REST | Yes | No | No |
| n8n | Full | Community | No | No |
| **Bottleneck-Bots** | **tRPC + REST** | **Yes** | **Yes** | **Yes** |

### 2.4 Business Impact

| Problem | Quantified Impact |
|---------|-------------------|
| No API access | 40% of enterprise leads require API; lost deals |
| No marketplace | $0 additional revenue from community content |
| Manual scripting | 10+ hours/week per power user on integration code |
| Limited extensibility | 25% churn from users needing custom capabilities |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| ID | Goal | Priority | Success Indicator |
|----|------|----------|-------------------|
| **G1** | Enable programmatic access to all platform features | P0 | 100% feature coverage via API |
| **G2** | Create a thriving marketplace for automation templates | P1 | 500+ templates within 12 months |
| **G3** | Provide AI-powered code generation in JS/Python | P1 | 80% code generation success rate |
| **G4** | Support MCP tool extensibility for AI agents | P1 | 20+ community MCP tools |
| **G5** | Implement production-grade webhook infrastructure | P0 | 99.9% webhook delivery rate |

### 3.2 Success Metrics (KPIs)

#### API Adoption Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| API Keys Created | 1,000+ in 6 months | Database count |
| Daily API Requests | 100,000+ | Request logs |
| API Error Rate | < 0.1% | Error tracking |
| Avg Response Time (P95) | < 200ms | Performance monitoring |

#### Marketplace Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Templates Published | 500+ in 12 months | Marketplace count |
| Template Installations | 10,000+ | Install events |
| Publisher Revenue | $50,000+ in year 1 | Payment processing |
| User Ratings Average | >= 4.2/5 | Review system |

#### Developer Experience Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Documentation Coverage | 100% of endpoints | Documentation audit |
| SDK Downloads (npm) | 5,000+ | npm stats |
| Code Generation Usage | 500+ generations/month | Service metrics |
| Developer NPS | >= 50 | Survey |

#### Webhook Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Delivery Success Rate | >= 99.9% | Webhook logs |
| Average Delivery Time | < 5 seconds | Performance logs |
| Retry Success Rate | >= 70% | Retry metrics |
| Webhook Uptime | >= 99.95% | Monitoring |

---

## 4. User Stories & Personas

### 4.1 Persona: API Developer (Alex)

**Background**: Senior engineer at a SaaS company, needs to integrate Bottleneck-Bots into their product.

#### US-001: API Key Management
**As** Alex the API Developer
**I want to** generate and manage API keys with specific scopes
**So that** I can securely integrate Bottleneck-Bots into my application

**Acceptance Criteria:**
- Generate API keys with format `ghl_<32-char-random-string>`
- Select scopes: `tasks:read`, `tasks:write`, `tasks:execute`, `executions:read`, `templates:read`, `*`
- Set expiration (1-365 days) and rate limits (per minute/hour/day)
- View usage statistics per API key
- Rotate keys without downtime
- Revoke compromised keys immediately

#### US-002: Type-Safe API Access
**As** Alex the API Developer
**I want to** use a type-safe API with TypeScript support
**So that** I can catch integration errors at compile time

**Acceptance Criteria:**
- tRPC client auto-generates TypeScript types
- Full IntelliSense support in VS Code
- Request/response validation via Zod schemas
- OpenAPI specification for REST endpoints

#### US-003: Rate Limiting Understanding
**As** Alex the API Developer
**I want to** understand and monitor my rate limits
**So that** I can design my integration to avoid throttling

**Acceptance Criteria:**
- Rate limit headers in every response (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`)
- 429 responses include `Retry-After` header
- Rate limit dashboard in developer portal
- Configurable limits per API key (100/1000/10000 per min/hour/day)

### 4.2 Persona: Marketplace Publisher (Maya)

**Background**: Automation consultant who builds workflows for clients, wants to monetize expertise.

#### US-004: Template Publishing
**As** Maya the Publisher
**I want to** publish my automation templates to the marketplace
**So that** I can earn revenue from my expertise

**Acceptance Criteria:**
- Export workflow as shareable template
- Set pricing: free, one-time purchase, or subscription
- Add description, screenshots, and documentation
- Define required inputs and configuration variables
- Version control for template updates
- Revenue split: 70% publisher / 30% platform

#### US-005: Template Analytics
**As** Maya the Publisher
**I want to** track how my templates perform
**So that** I can improve them and maximize revenue

**Acceptance Criteria:**
- View installation count and trends
- See ratings and reviews
- Track revenue and payouts
- Analyze user drop-off points
- A/B test template descriptions

### 4.3 Persona: AI Engineer (Jordan)

**Background**: ML engineer building AI agents, needs to extend agent capabilities with custom tools.

#### US-006: MCP Tool Registration
**As** Jordan the AI Engineer
**I want to** register custom MCP tools
**So that** AI agents can use my specialized capabilities

**Acceptance Criteria:**
- Define tool with JSON Schema input specification
- Implement handler function for tool execution
- Set tool metadata (name, description, category, version)
- Test tool in sandbox environment
- Publish to MCP tool registry
- Monitor tool usage and performance

#### US-007: Database Query Tool
**As** Jordan the AI Engineer
**I want** AI agents to query the database safely
**So that** they can retrieve contextual information

**Acceptance Criteria:**
- Execute read-only SELECT queries
- Automatic LIMIT enforcement (max 100 rows)
- Query parameterization to prevent injection
- Query execution time logging
- Table/schema introspection tools

### 4.4 Persona: Business Analyst (Sam)

**Background**: Non-technical user who needs to automate data extraction without coding.

#### US-008: Code Generation
**As** Sam the Business Analyst
**I want** AI to generate automation scripts for me
**So that** I can automate tasks without learning to code

**Acceptance Criteria:**
- Describe automation in natural language
- Generate JavaScript or Python code
- Include comments explaining each step
- List required dependencies
- Provide copy-paste ready code
- Support component, page, and full project generation

#### US-009: Template Installation
**As** Sam the Business Analyst
**I want to** browse and install pre-built templates
**So that** I can automate common tasks immediately

**Acceptance Criteria:**
- Search templates by category, keywords, rating
- Preview template capabilities before install
- One-click installation to my workspace
- Guided configuration of template variables
- Support for React, Next.js, and static templates

### 4.5 Persona: DevOps Engineer (Casey)

**Background**: Manages CI/CD pipelines, needs to integrate automation into deployment workflows.

#### US-010: Webhook Integration
**As** Casey the DevOps Engineer
**I want to** receive webhook notifications for automation events
**So that** I can trigger downstream processes

**Acceptance Criteria:**
- Configure outbound webhooks for events (task.completed, task.failed, etc.)
- HMAC-SHA256 signature verification
- Automatic retry with exponential backoff (1m, 5m, 15m, 1h, 4h)
- Webhook delivery logs with request/response details
- Test webhook connectivity from dashboard
- Support for custom headers and authentication

#### US-011: Inbound Webhook Triggers
**As** Casey the DevOps Engineer
**I want to** trigger automations via inbound webhooks
**So that** external systems can start workflows

**Acceptance Criteria:**
- Unique webhook URL per automation
- Support POST with JSON payload
- Payload validation against schema
- Rate limiting per webhook endpoint
- Support for SMS (Twilio), Email, and custom webhooks

---

## 5. Functional Requirements

### 5.1 API Keys Management

#### FR-001: Key Generation
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Generate cryptographically secure keys: `ghl_<base64url-24-bytes>` | P0 |
| FR-001.2 | Hash keys with SHA-256 before storage | P0 |
| FR-001.3 | Store only key prefix (first 12 chars) for identification | P0 |
| FR-001.4 | Return full key only once at creation time | P0 |
| FR-001.5 | Limit users to 5 active API keys | P1 |

#### FR-002: Key Scopes
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Support scopes: `*`, `tasks:read`, `tasks:write`, `tasks:execute`, `executions:read`, `templates:read` | P0 |
| FR-002.2 | Validate scope requirements on each API request | P0 |
| FR-002.3 | Return 403 Forbidden when scope insufficient | P0 |
| FR-002.4 | Allow multiple scopes per key | P0 |

#### FR-003: Rate Limiting
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Configure per-key limits: per minute (max 1000), per hour (max 10000), per day (max 100000) | P0 |
| FR-003.2 | Default limits: 100/min, 1000/hour, 10000/day | P0 |
| FR-003.3 | Track request counts in Redis/memory | P0 |
| FR-003.4 | Return rate limit headers on every response | P0 |
| FR-003.5 | Return 429 with Retry-After when exceeded | P0 |

#### FR-004: Key Lifecycle
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Support key expiration (1-365 days, or never) | P1 |
| FR-004.2 | Soft delete (revoke) with `revokedAt` timestamp | P0 |
| FR-004.3 | Track `lastUsedAt` and `totalRequests` per key | P0 |
| FR-004.4 | Query usage statistics for configurable date range (up to 90 days) | P1 |

### 5.2 tRPC API

#### FR-005: Router Coverage
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Expose 45+ procedures across domain routers | P0 |
| FR-005.2 | Support queries (read) and mutations (write) | P0 |
| FR-005.3 | Require authentication via `protectedProcedure` | P0 |
| FR-005.4 | Validate all inputs with Zod schemas | P0 |

#### FR-006: Type Safety
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | Generate TypeScript types from Zod schemas | P0 |
| FR-006.2 | Export router type for client inference | P0 |
| FR-006.3 | Support end-to-end type safety with tRPC client | P0 |

### 5.3 REST API

#### FR-007: Endpoint Structure
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | Version prefix: `/api/v1/` | P0 |
| FR-007.2 | Resource endpoints: `/tasks`, `/executions`, `/templates`, `/webhooks` | P0 |
| FR-007.3 | Health endpoint: `GET /api/v1/health` (unauthenticated) | P0 |
| FR-007.4 | Info endpoint: `GET /api/v1` (unauthenticated) | P0 |

#### FR-008: Authentication
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | Bearer token authentication: `Authorization: Bearer ghl_xxx` | P0 |
| FR-008.2 | Validate API key hash against database | P0 |
| FR-008.3 | Check key expiration and revocation status | P0 |
| FR-008.4 | Verify scope permissions for endpoint | P0 |

#### FR-009: Response Format
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009.1 | Success: `{ data: {...}, message?: string }` | P0 |
| FR-009.2 | Error: `{ error: string, message: string, code: string, details?: [...], timestamp, path, requestId }` | P0 |
| FR-009.3 | Pagination: `{ data: [...], pagination: { page, limit, total, pages } }` | P0 |

#### FR-010: Security Middleware
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-010.1 | Helmet security headers (CSP, HSTS, X-Frame-Options) | P0 |
| FR-010.2 | Request ID generation for tracing | P0 |
| FR-010.3 | CORS configuration for allowed origins | P0 |
| FR-010.4 | Request body size limit (10MB) | P0 |
| FR-010.5 | Global rate limiting before authentication | P0 |

### 5.4 MCP Tools

#### FR-011: Tool Categories
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-011.1 | File tools: `file/read`, `file/write`, `file/list`, `file/delete` | P0 |
| FR-011.2 | Shell tools: `shell/execute` (sandboxed whitelist) | P1 |
| FR-011.3 | Web tools: `web/request`, `web/fetch` | P1 |
| FR-011.4 | Database tools: `database/query`, `database/tables`, `database/schema` | P1 |

#### FR-012: Tool Security
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-012.1 | Shell command whitelist: `ls`, `pwd`, `echo`, `cat`, `grep`, `find`, `git`, `npm`, `node` | P0 |
| FR-012.2 | Block dangerous patterns: `rm -rf`, `sudo`, `chmod`, command chaining | P0 |
| FR-012.3 | Database: SELECT only, no multi-statement, auto LIMIT | P0 |
| FR-012.4 | HTTP: User-Agent identification, timeout enforcement | P1 |

#### FR-013: Tool Registration
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-013.1 | Define tool with JSON Schema input specification | P0 |
| FR-013.2 | Register handler function for execution | P0 |
| FR-013.3 | Set metadata: name, category, description, version, tags | P0 |
| FR-013.4 | Support HTTP and stdio transports | P1 |

### 5.5 Marketplace

#### FR-014: Product Catalog
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-014.1 | List credit packages with pricing from database | P0 |
| FR-014.2 | Group packages by credit type (tokens, executions, etc.) | P0 |
| FR-014.3 | Display price in USD (converted from cents) | P0 |
| FR-014.4 | Support active/inactive package status | P0 |

#### FR-015: Checkout Flow
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-015.1 | Create Stripe checkout session for package purchase | P0 |
| FR-015.2 | Store userId, packageId, creditType, creditAmount in session metadata | P0 |
| FR-015.3 | Redirect to success/cancel URLs | P0 |
| FR-015.4 | Verify checkout session status via Stripe API | P0 |

#### FR-016: Subscription Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-016.1 | Query active subscription status | P1 |
| FR-016.2 | Cancel subscription with reason tracking | P1 |
| FR-016.3 | Handle Stripe webhook events for subscription updates | P1 |

### 5.6 Template System

#### FR-017: Template Discovery
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-017.1 | List available template types from filesystem | P0 |
| FR-017.2 | Support templates: `react-ts`, `nextjs`, `static` | P0 |
| FR-017.3 | Return template metadata: name, description, file count | P0 |

#### FR-018: Template Processing
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-018.1 | Load all files from template directory recursively | P0 |
| FR-018.2 | Apply variable substitution: `{{PROJECT_NAME}}`, `{{PORT}}`, custom | P0 |
| FR-018.3 | Support arbitrary template variables | P1 |

#### FR-019: Project Generation
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-019.1 | Write processed template files to destination directory | P0 |
| FR-019.2 | Create parent directories as needed | P0 |
| FR-019.3 | Preserve file structure from template | P0 |

### 5.7 Code Generator

#### FR-020: Generation Types
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-020.1 | Generate React components from natural language | P0 |
| FR-020.2 | Generate complete pages with routing and state | P1 |
| FR-020.3 | Modify existing files based on instructions | P1 |
| FR-020.4 | Generate full-stack project structure | P2 |
| FR-020.5 | Analyze existing project and provide insights | P1 |

#### FR-021: Code Quality
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-021.1 | Use React 19 with functional components and hooks | P0 |
| FR-021.2 | TypeScript with strict type checking | P0 |
| FR-021.3 | Tailwind CSS for styling | P0 |
| FR-021.4 | Named exports (not default) | P0 |
| FR-021.5 | Error handling and loading states | P1 |
| FR-021.6 | Accessibility best practices | P1 |

#### FR-022: AI Integration
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-022.1 | Use Anthropic Claude (claude-3-opus) for generation | P0 |
| FR-022.2 | Structured JSON output with validation | P0 |
| FR-022.3 | Support streaming for large responses | P1 |
| FR-022.4 | Extract and list external dependencies | P0 |

### 5.8 Webhook System

#### FR-023: Outbound Webhooks
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-023.1 | Send webhook with event, timestamp, and payload | P0 |
| FR-023.2 | Generate HMAC-SHA256 signature with secret key | P0 |
| FR-023.3 | Include headers: `X-Webhook-Event`, `X-Webhook-ID`, `X-Webhook-Signature` | P0 |
| FR-023.4 | 30-second timeout per request | P0 |
| FR-023.5 | Log request/response details in database | P0 |

#### FR-024: Retry Mechanism
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-024.1 | Automatic retry on failure with exponential backoff | P0 |
| FR-024.2 | Delays: 1m, 5m, 15m, 1h, 4h | P0 |
| FR-024.3 | Maximum 5 retry attempts | P0 |
| FR-024.4 | Track `attempts`, `nextRetryAt`, `status` per delivery | P0 |
| FR-024.5 | Mark as `permanently_failed` after max retries | P0 |
| FR-024.6 | Support manual retry of failed webhooks | P1 |

#### FR-025: Webhook Statistics
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-025.1 | Calculate success rate, average/median response time | P0 |
| FR-025.2 | Event type breakdown | P0 |
| FR-025.3 | Status breakdown (success, failed, retrying, permanently_failed) | P0 |
| FR-025.4 | Top 10 recent error messages | P1 |

#### FR-026: Inbound Webhooks
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-026.1 | Unique webhook URL per user: `/api/webhooks/inbound/{token}` | P0 |
| FR-026.2 | Support channel types: SMS, Email, Custom Webhook | P0 |
| FR-026.3 | HMAC signature verification for inbound requests | P0 |
| FR-026.4 | Rate limiting per webhook (configurable per minute/hour) | P0 |
| FR-026.5 | Maximum 3 webhooks per user | P1 |
| FR-026.6 | Webhook verification flow with code | P1 |

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-001 | API response time (P95) | < 200ms | P0 |
| NFR-002 | API response time (P99) | < 500ms | P0 |
| NFR-003 | Webhook delivery time | < 5 seconds | P0 |
| NFR-004 | Code generation time | < 30 seconds | P1 |
| NFR-005 | Concurrent API connections | 10,000+ | P1 |
| NFR-006 | Database query time (P95) | < 50ms | P0 |
| NFR-007 | MCP tool execution time | < 30 seconds | P1 |

### 6.2 Scalability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-008 | Daily API requests | 10,000,000+ | P1 |
| NFR-009 | Concurrent webhook deliveries | 1,000+ | P1 |
| NFR-010 | API key storage | 100,000+ keys | P1 |
| NFR-011 | Webhook log retention | 90 days | P1 |
| NFR-012 | Horizontal scaling | Auto-scale on load | P2 |

### 6.3 Reliability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-013 | API availability | >= 99.9% | P0 |
| NFR-014 | Webhook delivery success | >= 99.9% | P0 |
| NFR-015 | Data durability | 99.99% | P0 |
| NFR-016 | Failover time | < 30 seconds | P1 |
| NFR-017 | Zero-downtime deployments | Yes | P1 |

### 6.4 Security Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-018 | API keys hashed with SHA-256 | P0 |
| NFR-019 | TLS 1.3 for all API traffic | P0 |
| NFR-020 | HMAC-SHA256 webhook signatures | P0 |
| NFR-021 | SQL injection prevention (parameterized queries) | P0 |
| NFR-022 | XSS prevention in API responses | P0 |
| NFR-023 | Rate limiting on all endpoints | P0 |
| NFR-024 | Audit logging for key operations | P1 |
| NFR-025 | Helmet security headers | P0 |
| NFR-026 | CORS configuration | P0 |
| NFR-027 | Shell command whitelist enforcement | P0 |

### 6.5 Compliance Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-028 | GDPR: Data export capability | P1 |
| NFR-029 | GDPR: Right to deletion | P1 |
| NFR-030 | SOC 2: Audit trail | P2 |
| NFR-031 | PCI DSS: No storage of payment card data (Stripe handles) | P0 |

### 6.6 Documentation Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-032 | API Developer Guide (comprehensive) | P0 |
| NFR-033 | OpenAPI 3.0 specification | P0 |
| NFR-034 | Code examples in JavaScript, Python, Go, cURL | P0 |
| NFR-035 | Interactive API explorer | P1 |
| NFR-036 | Changelog for API versions | P1 |

---

## 7. Technical Architecture

### 7.1 System Overview

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              Client Applications                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │ React Frontend │  │ External Apps  │  │ CI/CD Pipelines│  │ AI Agents      │  │
│  │ (tRPC Client)  │  │ (REST Client)  │  │ (Webhooks)     │  │ (MCP Tools)    │  │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘  │
└──────────┼───────────────────┼───────────────────┼───────────────────┼───────────┘
           │ tRPC               │ REST              │ HTTP POST         │ MCP
           ▼                    ▼                   ▼                   ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              API Gateway Layer                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                        Express.js Application                                │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │ │
│  │  │   Helmet    │  │    CORS     │  │ Rate Limit  │  │  Request Logging    │ │ │
│  │  │  Security   │  │  Handler    │  │ Middleware  │  │  & Tracing          │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────┬───────────────────────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   tRPC Router   │      │   REST Router   │      │   MCP Server    │
│                 │      │   (/api/v1)     │      │   (Port 3001)   │
│ - apiKeys       │      │                 │      │                 │
│ - marketplace   │      │ - /tasks        │      │ - File Tools    │
│ - webhooks      │      │ - /executions   │      │ - Shell Tools   │
│ - templates     │      │ - /templates    │      │ - Web Tools     │
│ - 45+ routers   │      │ - /webhooks     │      │ - DB Tools      │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Auth Service   │      │ Webhook Service │      │ Code Generator  │
│                 │      │                 │      │                 │
│ - Key Validation│      │ - Delivery      │      │ - Claude API    │
│ - Scope Check   │      │ - Retry Queue   │      │ - Streaming     │
│ - Rate Limiting │      │ - Statistics    │      │ - Validation    │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              Data Layer                                            │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────────┐   │
│  │     PostgreSQL      │  │       Redis         │  │    File Storage         │   │
│  │   (Drizzle ORM)     │  │  (Rate Limiting)    │  │  (Templates)            │   │
│  │                     │  │                     │  │                         │   │
│  │ - api_keys          │  │ - Request counts    │  │ - react-ts/             │   │
│  │ - api_request_logs  │  │ - Session cache     │  │ - nextjs/               │   │
│  │ - webhook_logs      │  │                     │  │ - static/               │   │
│  │ - credit_packages   │  │                     │  │                         │   │
│  │ - user_webhooks     │  │                     │  │                         │   │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                          External Services                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                   │
│  │     Stripe      │  │   Anthropic     │  │   Twilio        │                   │
│  │   (Payments)    │  │   (AI/Claude)   │  │   (SMS)         │                   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Component Details

#### 7.2.1 API Keys Router (`apiKeys.ts`)

**Responsibilities:**
- Generate cryptographically secure API keys
- Hash and store keys securely
- Validate keys on requests
- Track usage statistics

**Key Functions:**
```typescript
generateApiKey(): string          // ghl_<base64url-24-bytes>
hashApiKey(key: string): string   // SHA-256 hash
getKeyPrefix(key: string): string // First 12 characters
maskApiKey(prefix: string): string // prefix...
```

**Procedures:**
- `list`: Get all user's API keys (masked)
- `create`: Generate new key with scopes and limits
- `update`: Modify key settings
- `revoke`: Soft delete (set `revokedAt`)
- `getUsageStats`: Query request logs for date range

#### 7.2.2 REST API Layer (`rest/index.ts`)

**Middleware Stack:**
1. Helmet (security headers)
2. Request ID generation
3. CORS handling
4. JSON body parsing (10MB limit)
5. Request logging
6. Performance monitoring
7. Global rate limiting
8. API key authentication
9. Scope verification
10. Error handling

**Route Structure:**
```
/api/v1/
├── /health              (GET, public)
├── /                    (GET, public, API info)
├── /tasks               (CRUD + execute)
├── /executions          (CRUD + logs)
├── /templates           (list, get, use)
└── /webhooks            (inbound receivers)
```

#### 7.2.3 MCP Server (`mcp/server.ts`)

**Architecture:**
- Singleton server instance
- Tool registry with metadata
- HTTP transport (port 3001)
- Optional TLS support

**Tool Categories:**
| Category | Tools | Security |
|----------|-------|----------|
| File | read, write, list, delete | Path validation |
| Shell | execute | Command whitelist |
| Web | request, fetch | Timeout limits |
| Database | query, tables, schema | SELECT only, parameterized |

#### 7.2.4 Webhook Service (`webhook.service.ts`)

**Delivery Flow:**
```
1. Prepare payload with event, timestamp, data
2. Generate HMAC-SHA256 signature (if secret)
3. Create log entry (status: pending)
4. Send HTTP POST with timeout
5. Update log with response/error
6. Schedule retry if failed
```

**Retry Configuration:**
```typescript
RETRY_CONFIG = {
  MAX_RETRIES: 5,
  BACKOFF_DELAYS: [1m, 5m, 15m, 1h, 4h],
  TIMEOUT: 30000ms
}
```

#### 7.2.5 Code Generator Service (`code-generator.service.ts`)

**Generation Pipeline:**
1. Build system prompt with project context
2. Construct code generation prompt
3. Call Claude API (claude-3-opus)
4. Parse JSON response
5. Validate file structure
6. Extract dependencies
7. Return generated code

**Output Schema:**
```typescript
interface GeneratedCode {
  files: Array<{
    path: string;
    content: string;
    action: 'create' | 'update' | 'delete';
  }>;
  explanation: string;
  dependencies?: string[];
}
```

### 7.3 Data Flow Diagrams

#### API Key Validation Flow
```
Request with Authorization: Bearer ghl_xxx
                │
                ▼
┌─────────────────────────────────┐
│ Extract key from Authorization  │
│ header (Bearer token)           │
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│ Hash key with SHA-256           │
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│ Query database for hash match   │
│ WHERE keyHash = hashed_value    │
└─────────────────┬───────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
    Not Found            Found
        │                   │
        ▼                   ▼
┌─────────────┐   ┌─────────────────────┐
│ 401 Invalid │   │ Check isActive      │
│ API Key     │   │ Check expiration    │
└─────────────┘   │ Check revocation    │
                  └──────────┬──────────┘
                             │
                   ┌─────────┴─────────┐
                   │                   │
               Invalid              Valid
                   │                   │
                   ▼                   ▼
          ┌─────────────┐   ┌─────────────────────┐
          │ 401 Expired │   │ Check rate limits   │
          │ or Revoked  │   │ (minute/hour/day)   │
          └─────────────┘   └──────────┬──────────┘
                                       │
                             ┌─────────┴─────────┐
                             │                   │
                         Exceeded             Within
                             │                   │
                             ▼                   ▼
                    ┌─────────────┐   ┌─────────────────────┐
                    │ 429 Rate    │   │ Verify scope for    │
                    │ Limited     │   │ requested endpoint  │
                    └─────────────┘   └──────────┬──────────┘
                                                 │
                                       ┌─────────┴─────────┐
                                       │                   │
                                 Insufficient          Sufficient
                                       │                   │
                                       ▼                   ▼
                              ┌─────────────┐   ┌─────────────────┐
                              │ 403 Scope   │   │ ✓ Allow Request │
                              │ Forbidden   │   │ Update lastUsed │
                              └─────────────┘   │ Increment count │
                                                └─────────────────┘
```

#### Webhook Delivery Flow
```
Event Triggered (e.g., task.completed)
                │
                ▼
┌─────────────────────────────────┐
│ Build payload:                  │
│ { event, timestamp, data }      │
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│ Generate HMAC-SHA256 signature  │
│ using webhook secret key        │
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│ Create webhook_log entry        │
│ status: 'pending', attempts: 1  │
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│ HTTP POST to webhook URL        │
│ Headers: X-Webhook-Signature    │
│ Timeout: 30 seconds             │
└─────────────────┬───────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
    Success              Failure
    (2xx)               (4xx/5xx/timeout)
        │                   │
        ▼                   ▼
┌─────────────┐   ┌─────────────────────┐
│ Update log: │   │ Update log:         │
│ status:     │   │ status: 'failed'    │
│ 'success'   │   │ error: message      │
│ completedAt │   │ nextRetryAt:        │
└─────────────┘   │ now + backoff[n]    │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Retry Worker picks  │
                  │ up at nextRetryAt   │
                  │ (max 5 attempts)    │
                  └──────────┬──────────┘
                             │
                   ┌─────────┴─────────┐
                   │                   │
               Success           Max Retries
                   │                   │
                   ▼                   ▼
          ┌─────────────┐   ┌─────────────────┐
          │ status:     │   │ status:         │
          │ 'success'   │   │ 'permanently_   │
          └─────────────┘   │  failed'        │
                            └─────────────────┘
```

---

## 8. API Specifications

### 8.1 API Key Endpoints (tRPC)

#### apiKeys.list
```typescript
// Query: Get all API keys for authenticated user
Input: void
Output: {
  keys: Array<{
    id: number;
    name: string;
    keyPrefix: string;      // First 12 chars
    maskedKey: string;      // "ghl_abc12345..."
    description?: string;
    scopes: string[];
    isActive: boolean;
    lastUsedAt?: Date;
    totalRequests: number;
    rateLimitPerMinute: number;
    rateLimitPerHour: number;
    rateLimitPerDay: number;
    expiresAt?: Date;
    isExpired: boolean;
    createdAt: Date;
  }>
}
```

#### apiKeys.create
```typescript
// Mutation: Create new API key
Input: {
  name: string;           // 1-100 chars
  description?: string;
  scopes: Array<"*" | "tasks:read" | "tasks:write" | "tasks:execute" | "executions:read" | "templates:read">;
  expiresInDays?: number; // 1-365
  rateLimitPerMinute?: number;  // 1-1000, default 100
  rateLimitPerHour?: number;    // 1-10000, default 1000
  rateLimitPerDay?: number;     // 1-100000, default 10000
}
Output: {
  success: true;
  message: string;
  key: {
    id: number;
    name: string;
    apiKey: string;       // ONLY returned at creation
    keyPrefix: string;
    scopes: string[];
    expiresAt?: Date;
  };
  warning: "Save this key now - you won't be able to see it again!";
}
```

#### apiKeys.update
```typescript
// Mutation: Update API key
Input: {
  id: number;
  name?: string;
  description?: string;
  scopes?: string[];
  isActive?: boolean;
  rateLimitPerMinute?: number;
  rateLimitPerHour?: number;
  rateLimitPerDay?: number;
}
Output: {
  success: true;
  message: string;
  key: { id, name, keyPrefix, scopes, isActive };
}
```

#### apiKeys.revoke
```typescript
// Mutation: Revoke (soft delete) API key
Input: { id: number }
Output: { success: true, message: string }
```

#### apiKeys.getUsageStats
```typescript
// Query: Get usage statistics
Input: {
  id: number;
  days?: number;  // 1-90, default 30
}
Output: {
  stats: {
    totalRequests: number;
    successRequests: number;
    errorRequests: number;
    successRate: number;      // Percentage
    lastUsedAt?: Date;
    endpoints: Array<{
      endpoint: string;
      count: number;
      errors: number;
    }>;
  }
}
```

### 8.2 REST API Endpoints

#### GET /api/v1/health
```yaml
Description: Health check endpoint (no authentication)
Response 200:
  {
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2026-01-11T12:00:00Z"
  }
```

#### GET /api/v1
```yaml
Description: API information (no authentication)
Response 200:
  {
    "name": "GHL Agency AI API",
    "version": "1.0.0",
    "description": "Production-ready REST API for browser automation",
    "documentation": "/api/docs",
    "endpoints": { ... },
    "authentication": {
      "type": "Bearer Token",
      "header": "Authorization",
      "format": "Bearer ghl_..."
    },
    "rateLimit": {
      "default": "100 requests per minute",
      "authenticated": "Based on API key plan"
    }
  }
```

#### GET /api/v1/tasks
```yaml
Description: List all tasks
Authentication: Required
Scopes: tasks:read
Query Parameters:
  - page (int, default 1)
  - limit (int, default 20, max 100)
  - status (string): active|paused|failed|completed|archived
  - automationType (string): chat|observe|extract|workflow|custom
Response 200:
  {
    "data": [...tasks],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
```

#### POST /api/v1/tasks
```yaml
Description: Create new task
Authentication: Required
Scopes: tasks:write
Request Body:
  {
    "name": "string",
    "description": "string",
    "automationType": "observe",
    "automationConfig": { "url": "string", "instruction": "string" },
    "scheduleType": "daily",
    "cronExpression": "0 9 * * *",
    "timezone": "America/New_York"
  }
Response 201:
  {
    "data": { ...task },
    "message": "Task created successfully"
  }
```

#### POST /api/v1/tasks/{id}/execute
```yaml
Description: Execute task immediately
Authentication: Required
Scopes: tasks:execute
Response 202:
  {
    "data": {
      "id": 456,
      "taskId": 123,
      "status": "queued",
      "triggerType": "manual"
    },
    "message": "Task execution queued"
  }
```

### 8.3 Webhook Endpoints

#### POST /api/webhooks/inbound/{token}
```yaml
Description: Receive inbound webhook
Authentication: HMAC signature (X-Webhook-Signature header)
Headers:
  - X-Webhook-Signature: HMAC-SHA256(payload, secret)
Request Body: JSON payload (varies by source)
Response 200:
  { "received": true, "messageId": "msg_xxx" }
Response 401:
  { "error": "Invalid signature" }
Response 429:
  { "error": "Rate limit exceeded" }
```

### 8.4 MCP Tool Schemas

#### file/read
```json
{
  "name": "file/read",
  "description": "Read contents of a file",
  "inputSchema": {
    "type": "object",
    "properties": {
      "path": { "type": "string", "description": "Path to file" },
      "encoding": { "type": "string", "enum": ["utf-8", "base64", "hex"], "default": "utf-8" }
    },
    "required": ["path"]
  }
}
```

#### database/query
```json
{
  "name": "database/query",
  "description": "Execute a read-only database query",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "SQL query (SELECT only)" },
      "params": { "type": "array", "description": "Query parameters" },
      "limit": { "type": "number", "default": 100 }
    },
    "required": ["query"]
  }
}
```

#### shell/execute
```json
{
  "name": "shell/execute",
  "description": "Execute a sandboxed shell command",
  "inputSchema": {
    "type": "object",
    "properties": {
      "command": { "type": "string", "description": "Shell command" },
      "cwd": { "type": "string", "description": "Working directory" },
      "timeout": { "type": "number", "default": 30000 },
      "env": { "type": "object", "description": "Environment variables" }
    },
    "required": ["command"]
  }
}
```

---

## 9. Data Models

### 9.1 API Keys Schema

```sql
CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  key_hash VARCHAR(64) NOT NULL UNIQUE,    -- SHA-256 hash
  key_prefix VARCHAR(12) NOT NULL,          -- First 12 chars for identification
  scopes JSONB NOT NULL DEFAULT '["*"]',   -- Array of scope strings
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMP,
  total_requests INTEGER NOT NULL DEFAULT 0,
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 100,
  rate_limit_per_hour INTEGER NOT NULL DEFAULT 1000,
  rate_limit_per_day INTEGER NOT NULL DEFAULT 10000,
  expires_at TIMESTAMP,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active) WHERE is_active = true;
```

### 9.2 API Request Logs Schema

```sql
CREATE TABLE api_request_logs (
  id SERIAL PRIMARY KEY,
  api_key_id INTEGER REFERENCES api_keys(id),
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  request_headers JSONB,
  request_body JSONB,
  response_body JSONB,
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_request_logs_api_key_id ON api_request_logs(api_key_id);
CREATE INDEX idx_api_request_logs_created_at ON api_request_logs(created_at);
CREATE INDEX idx_api_request_logs_endpoint ON api_request_logs(endpoint);
```

### 9.3 Webhook Logs Schema

```sql
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id VARCHAR(255) NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  event VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  method VARCHAR(10) NOT NULL DEFAULT 'POST',
  request_headers JSONB,
  request_body JSONB,
  response_status INTEGER,
  response_body TEXT,
  response_time INTEGER,              -- milliseconds
  status VARCHAR(50) NOT NULL,        -- pending, success, failed, retrying, permanently_failed
  error TEXT,
  error_code VARCHAR(50),
  attempts INTEGER NOT NULL DEFAULT 1,
  next_retry_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_user_id ON webhook_logs(user_id);
CREATE INDEX idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX idx_webhook_logs_next_retry ON webhook_logs(next_retry_at) WHERE status = 'failed';
```

### 9.4 User Webhooks Schema

```sql
CREATE TABLE user_webhooks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  webhook_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  webhook_url TEXT,
  channel_type VARCHAR(50) NOT NULL,   -- sms, email, custom_webhook
  channel_name VARCHAR(100) NOT NULL,
  channel_order INTEGER NOT NULL,
  provider_config JSONB,               -- Encrypted provider credentials
  outbound_enabled BOOLEAN NOT NULL DEFAULT true,
  outbound_config JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_code VARCHAR(10),
  verified_at TIMESTAMP,
  secret_key VARCHAR(64),              -- HMAC signing key
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 30,
  rate_limit_per_hour INTEGER NOT NULL DEFAULT 200,
  total_messages_received INTEGER NOT NULL DEFAULT 0,
  total_messages_sent INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMP,
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_webhooks_user_id ON user_webhooks(user_id);
CREATE INDEX idx_user_webhooks_token ON user_webhooks(webhook_token);
CREATE INDEX idx_user_webhooks_active ON user_webhooks(is_active) WHERE is_active = true;
```

### 9.5 Credit Packages Schema

```sql
CREATE TABLE credit_packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  credit_type VARCHAR(50) NOT NULL,    -- tokens, executions, storage, etc.
  credit_amount INTEGER NOT NULL,
  price INTEGER NOT NULL,              -- Price in cents (USD)
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_packages_active ON credit_packages(is_active) WHERE is_active = true;
CREATE INDEX idx_credit_packages_type ON credit_packages(credit_type);
```

### 9.6 Drizzle ORM Type Definitions

```typescript
// api_keys table
export const apiKeys = pgTable('api_keys', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  keyHash: varchar('key_hash', { length: 64 }).notNull().unique(),
  keyPrefix: varchar('key_prefix', { length: 12 }).notNull(),
  scopes: jsonb('scopes').notNull().default(['*']),
  isActive: boolean('is_active').notNull().default(true),
  lastUsedAt: timestamp('last_used_at'),
  totalRequests: integer('total_requests').notNull().default(0),
  rateLimitPerMinute: integer('rate_limit_per_minute').notNull().default(100),
  rateLimitPerHour: integer('rate_limit_per_hour').notNull().default(1000),
  rateLimitPerDay: integer('rate_limit_per_day').notNull().default(10000),
  expiresAt: timestamp('expires_at'),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;
```

---

## 10. UI/UX Requirements

### 10.1 Developer Portal Dashboard

#### 10.1.1 API Keys Management Page

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  API Keys                                    [+ Create New Key] │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Production Key                              Active   ●   │  │
│  │  ghl_abc12345...                                          │  │
│  │  Scopes: tasks:read, tasks:write, tasks:execute           │  │
│  │  Last used: 2 hours ago · 15,432 requests                 │  │
│  │  Rate limit: 100/min · 1000/hr · 10000/day                │  │
│  │                                                           │  │
│  │  [View Stats]  [Edit]  [Rotate]  [Revoke]                │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Development Key                             Active   ●   │  │
│  │  ghl_xyz98765...                                          │  │
│  │  Scopes: *                                                │  │
│  │  Last used: Never · 0 requests                            │  │
│  │  Expires: 2026-02-11 (30 days)                            │  │
│  │                                                           │  │
│  │  [View Stats]  [Edit]  [Rotate]  [Revoke]                │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Create Key Modal:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Create API Key                                         [X]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Name *                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Production Integration                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Description                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ CI/CD pipeline automation                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Scopes *                                                       │
│  [x] tasks:read      [x] tasks:write      [x] tasks:execute    │
│  [x] executions:read [ ] templates:read   [ ] * (all)          │
│                                                                 │
│  Expiration                                                     │
│  ○ Never expires                                                │
│  ● Expires after: [30] days                                     │
│                                                                 │
│  Rate Limits                                                    │
│  Per minute: [100]   Per hour: [1000]   Per day: [10000]       │
│                                                                 │
│                              [Cancel]    [Create Key]           │
└─────────────────────────────────────────────────────────────────┘
```

**Key Created Success Modal:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ✓ API Key Created                                      [X]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ⚠️ Copy this key now - you won't be able to see it again!     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ghl_a7f3d8e2c1b9k4m6n8p0q2r5t7w9y1                      │ 📋│
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Store this key securely. We recommend:                         │
│  • Environment variables (.env)                                 │
│  • Secret management service (Vault, AWS Secrets Manager)       │
│  • Never commit to version control                              │
│                                                                 │
│                                           [I've Saved the Key]  │
└─────────────────────────────────────────────────────────────────┘
```

#### 10.1.2 Usage Statistics Page

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  API Usage Statistics                    [30 days ▼]            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   15,432    │  │    99.2%    │  │   142 ms    │             │
│  │   Requests  │  │ Success Rate│  │ Avg Latency │             │
│  │   +12% ↑    │  │   +0.5% ↑   │  │   -8% ↓     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  Requests Over Time                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │     ▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆▅▄▃                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Endpoint Breakdown                                             │
│  ┌────────────────────────────────┬───────┬───────┬─────────┐  │
│  │ Endpoint                       │ Count │ Errors│ Avg Time│  │
│  ├────────────────────────────────┼───────┼───────┼─────────┤  │
│  │ POST /api/v1/tasks/{id}/execute│ 8,234 │   42  │  245ms  │  │
│  │ GET /api/v1/tasks              │ 4,521 │   12  │   85ms  │  │
│  │ GET /api/v1/executions/{id}    │ 2,677 │    8  │   92ms  │  │
│  └────────────────────────────────┴───────┴───────┴─────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Marketplace UI

#### 10.2.1 Template Browser

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Marketplace                                                    │
│                                                                 │
│  [🔍 Search templates...]          [All Categories ▼] [Sort ▼] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Categories: [All] [Browser Automation] [Data Extraction]       │
│              [Monitoring] [Integration] [Reporting]             │
│                                                                 │
│  ┌───────────────────┐  ┌───────────────────┐  ┌─────────────┐ │
│  │ 📦               │  │ 📦               │  │ 📦          │ │
│  │ Website Monitor  │  │ Lead Scraper Pro │  │ CRM Sync    │ │
│  │                  │  │                  │  │             │ │
│  │ Monitor sites    │  │ Extract leads    │  │ Auto-sync   │ │
│  │ for changes      │  │ from LinkedIn    │  │ contacts    │ │
│  │                  │  │                  │  │             │ │
│  │ ★★★★☆ (4.2)     │  │ ★★★★★ (4.8)     │  │ ★★★★☆ (4.1)│ │
│  │ 1.2K installs    │  │ 3.4K installs    │  │ 890 installs│ │
│  │                  │  │                  │  │             │ │
│  │ FREE            │  │ $29             │  │ $49/mo      │ │
│  │ [Install]       │  │ [Buy Now]       │  │ [Subscribe] │ │
│  └───────────────────┘  └───────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 10.3 Webhook Management UI

#### 10.3.1 Webhook Configuration

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Webhooks                                [+ Create Webhook]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  SMS Channel - Twilio                      ✓ Verified      │  │
│  │                                                           │  │
│  │  Inbound URL: /api/webhooks/inbound/abc-123-def           │  │
│  │  Phone: +1 (555) 123-4567                                 │  │
│  │                                                           │  │
│  │  Messages: 1,234 received · 987 sent                      │  │
│  │  Rate limit: 30/min · 200/hr                              │  │
│  │                                                           │  │
│  │  [Test]  [View Logs]  [Edit]  [Delete]                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Custom Webhook - n8n                      ○ Unverified   │  │
│  │                                                           │  │
│  │  Inbound URL: /api/webhooks/inbound/xyz-789-uvw           │  │
│  │  Outbound: https://n8n.example.com/webhook/abc            │  │
│  │                                                           │  │
│  │  Messages: 0 received · 0 sent                            │  │
│  │  [Verify Now]  [Test]  [Edit]  [Delete]                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  You can create up to 3 webhooks. (2/3 used)                   │
└─────────────────────────────────────────────────────────────────┘
```

### 10.4 Code Generator UI

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Code Generator                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Generation Type:  ○ Component  ● Page  ○ Full Project         │
│                                                                 │
│  Describe what you want to build:                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Create a user dashboard page that shows:                 │   │
│  │ - Summary cards with key metrics (total tasks, success  │   │
│  │   rate, recent activity)                                 │   │
│  │ - A line chart showing task executions over time         │   │
│  │ - A table of recent tasks with status and actions        │   │
│  │ - Dark mode toggle in the header                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Tech Stack: [React 19 + TypeScript ▼]                         │
│                                                                 │
│                                        [Generate Code]          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Generated Files:                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ pages/Dashboard.tsx                             [Copy]   │   │
│  │ ─────────────────────────────────────────────────────── │   │
│  │ import { useState, useEffect } from 'react';             │   │
│  │ import { MetricCard } from '../components/MetricCard';   │   │
│  │ import { TaskChart } from '../components/TaskChart';     │   │
│  │ ...                                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Dependencies to install:                                       │
│  npm install recharts @headlessui/react                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. Dependencies & Integrations

### 11.1 Internal Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| tRPC Core | `server/_core/trpc.ts` | API router framework |
| Database | `server/db/index.ts` | Drizzle ORM connection |
| Authentication | `server/_core/auth.ts` | User session management |
| Drizzle Schema | `drizzle/schema.ts` | Database type definitions |
| Subscription Service | `server/services/subscription.service.ts` | Plan limits |

### 11.2 External Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@trpc/server` | ^11.x | Type-safe API framework |
| `zod` | ^3.x | Schema validation |
| `drizzle-orm` | ^0.30.x | Database ORM |
| `express` | ^4.x | REST API server |
| `helmet` | ^7.x | Security headers |
| `stripe` | ^14.x | Payment processing |
| `@anthropic-ai/sdk` | ^0.x | Claude AI for code generation |
| `axios` | ^1.x | HTTP client for web tools |
| `nanoid` | ^5.x | ID generation |

### 11.3 External Services

| Service | Purpose | Required |
|---------|---------|----------|
| PostgreSQL | Primary database | Yes |
| Redis | Rate limiting, caching | Recommended |
| Stripe | Payment processing for marketplace | Yes (for marketplace) |
| Anthropic Claude | AI code generation | Yes (for code gen) |
| Twilio | SMS webhook support | Optional |

### 11.4 Environment Variables

```bash
# Required
DATABASE_URL=                    # PostgreSQL connection
STRIPE_SECRET_KEY=              # Stripe API key
STRIPE_WEBHOOK_SECRET=          # Stripe webhook signing

# Required for Code Generation
ANTHROPIC_API_KEY=              # Claude API key

# MCP Server (optional)
MCP_HOST=0.0.0.0               # MCP server host
MCP_PORT=3001                  # MCP server port

# Optional Integrations
TWILIO_ACCOUNT_SID=            # Twilio SMS
TWILIO_AUTH_TOKEN=             # Twilio auth
REDIS_URL=                     # Redis for rate limiting
```

---

## 12. Release Criteria

### 12.1 Phase 1: Core API (MVP)

**Target: Week 4**

| Criterion | Requirement | Status |
|-----------|-------------|--------|
| API Keys CRUD | All CRUD operations functional | [ ] |
| Key Authentication | Bearer token auth working | [ ] |
| Rate Limiting | Per-key limits enforced | [ ] |
| REST Endpoints | /tasks, /executions, /templates | [ ] |
| Documentation | API Developer Guide complete | [ ] |
| Unit Tests | 80% coverage on auth/keys | [ ] |

**Exit Criteria:**
- [ ] Developer can create API key and make authenticated requests
- [ ] Rate limits are enforced and return 429 correctly
- [ ] OpenAPI spec generated and accurate
- [ ] No critical security vulnerabilities

### 12.2 Phase 2: Webhooks & MCP

**Target: Week 8**

| Criterion | Requirement | Status |
|-----------|-------------|--------|
| Outbound Webhooks | Delivery with retry working | [ ] |
| Inbound Webhooks | Receive and process webhooks | [ ] |
| HMAC Verification | Signature validation working | [ ] |
| MCP Server | HTTP transport operational | [ ] |
| MCP Tools | File, Shell, Web, DB tools | [ ] |
| Webhook UI | Configuration interface | [ ] |

**Exit Criteria:**
- [ ] Webhooks delivered with 99.9% success rate
- [ ] MCP tools execute safely with security constraints
- [ ] Webhook logs queryable with filtering
- [ ] Integration tests for all webhook flows

### 12.3 Phase 3: Marketplace & Code Gen

**Target: Week 12**

| Criterion | Requirement | Status |
|-----------|-------------|--------|
| Credit Packages | Purchase flow via Stripe | [ ] |
| Checkout | Create and verify sessions | [ ] |
| Template System | Load and apply templates | [ ] |
| Code Generator | Component/page generation | [ ] |
| Marketplace UI | Browse and install templates | [ ] |
| Publisher Portal | Submit and manage templates | [ ] |

**Exit Criteria:**
- [ ] User can purchase credit package via Stripe
- [ ] Templates install with variable substitution
- [ ] Code generation produces valid TypeScript/React
- [ ] E2E tests for purchase flow

### 12.4 Quality Gates

| Gate | Requirement |
|------|-------------|
| Unit Test Coverage | >= 80% |
| Integration Test Coverage | >= 70% |
| API Response Time (P95) | < 200ms |
| Security Scan | No critical/high vulnerabilities |
| Documentation | 100% endpoint coverage |
| Accessibility | WCAG 2.1 AA compliance |
| Performance | 1000 concurrent users without degradation |

---

## 13. Risks & Mitigations

### 13.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| API key leakage | Medium | Critical | Hash storage, short-lived keys, audit logging |
| Webhook delivery failures | Medium | High | Retry mechanism, dead letter queue |
| MCP tool abuse | Medium | High | Command whitelist, sandboxing, rate limits |
| Code generation quality | High | Medium | Validation, user feedback, iterative prompts |
| Stripe integration issues | Low | High | Webhook verification, idempotency keys |
| Database connection exhaustion | Medium | High | Connection pooling, query optimization |

### 13.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low API adoption | Medium | High | Documentation quality, SDK development |
| Marketplace spam/low quality | High | Medium | Review process, ratings, moderation |
| Stripe fee impact on margins | Low | Medium | Pricing strategy, volume discounts |
| Competitor API parity | Medium | Medium | Feature differentiation, DX focus |

### 13.3 Security Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| API key compromise | Low | Critical | Rotation capability, breach notification |
| Webhook URL enumeration | Low | Medium | Rate limiting, HMAC required |
| SQL injection via MCP | Low | Critical | SELECT only, parameterized queries |
| Shell command injection | Low | Critical | Whitelist, pattern blocking |
| XSS in generated code | Medium | Medium | Output sanitization, CSP |

### 13.4 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| API version conflicts | Medium | Medium | Semantic versioning, deprecation policy |
| Webhook log storage growth | High | Low | 90-day retention, archival |
| Claude API costs | High | Medium | Token monitoring, caching, model tiers |
| Rate limit configuration errors | Medium | Medium | Validation, defaults, monitoring |

---

## 14. Future Considerations

### 14.1 Version 2.0 Roadmap

| Feature | Description | Priority |
|---------|-------------|----------|
| GraphQL API | Alternative to REST for complex queries | P2 |
| SDK Libraries | Official JS/Python/Go SDKs | P1 |
| API Versioning | /api/v2 with breaking changes | P1 |
| Webhook Subscriptions | Subscribe to specific events | P2 |
| OAuth 2.0 | Alternative to API keys | P2 |
| Custom MCP Tools | User-defined tool registration | P1 |

### 14.2 Marketplace Expansion

| Feature | Description | Priority |
|---------|-------------|----------|
| Subscription Templates | Monthly recurring revenue for publishers | P1 |
| Template Bundles | Package multiple templates | P2 |
| Private Templates | Enterprise-only templates | P2 |
| Template Analytics | Publisher dashboard | P1 |
| Affiliate Program | Revenue sharing for referrals | P3 |

### 14.3 AI-Powered Enhancements

| Feature | Description | Priority |
|---------|-------------|----------|
| Natural Language API | Query API via natural language | P2 |
| Auto-generated SDKs | AI-generated client libraries | P3 |
| Smart Debugging | AI-powered error diagnosis | P2 |
| Code Refactoring | AI suggestions for improvements | P2 |
| Template Generation | AI creates templates from description | P2 |

### 14.4 Enterprise Features

| Feature | Description | Priority |
|---------|-------------|----------|
| SSO Integration | SAML/OIDC authentication | P1 |
| Audit Logs Export | Compliance reporting | P1 |
| IP Allowlisting | Restrict API access by IP | P2 |
| Custom Rate Limits | Enterprise-specific limits | P2 |
| SLA Guarantees | 99.99% uptime commitment | P1 |
| Dedicated Support | Priority support channel | P1 |

### 14.5 Technical Debt

| Item | Description | Priority |
|------|-------------|----------|
| Test Coverage | Increase to 90%+ | P1 |
| API Monitoring | APM integration | P1 |
| Caching Layer | Redis for frequent queries | P2 |
| Documentation Site | Dedicated docs portal | P1 |
| API Playground | Interactive testing tool | P2 |

---

## Appendix A: API Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_API_KEY` | 401 | API key is invalid or malformed |
| `EXPIRED_API_KEY` | 401 | API key has expired |
| `REVOKED_API_KEY` | 401 | API key has been revoked |
| `INSUFFICIENT_SCOPE` | 403 | API key lacks required scope |
| `RATE_LIMIT_MINUTE_EXCEEDED` | 429 | Per-minute rate limit exceeded |
| `RATE_LIMIT_HOUR_EXCEEDED` | 429 | Per-hour rate limit exceeded |
| `RATE_LIMIT_DAY_EXCEEDED` | 429 | Per-day rate limit exceeded |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource does not exist |
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `INTERNAL_ERROR` | 500 | Internal server error |

---

## Appendix B: Webhook Event Types

| Event | Description | Payload |
|-------|-------------|---------|
| `task.created` | New task created | `{ taskId, name, type }` |
| `task.updated` | Task configuration changed | `{ taskId, changes }` |
| `task.deleted` | Task deleted | `{ taskId }` |
| `execution.started` | Execution began | `{ executionId, taskId }` |
| `execution.completed` | Execution succeeded | `{ executionId, output }` |
| `execution.failed` | Execution failed | `{ executionId, error }` |
| `webhook.received` | Inbound webhook received | `{ webhookId, payload }` |
| `credits.purchased` | Credit package purchased | `{ packageId, amount }` |
| `credits.low` | Credits below threshold | `{ remaining, threshold }` |

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **API Key** | Cryptographic token for authenticating API requests |
| **Bearer Token** | Authentication scheme using `Authorization: Bearer <token>` |
| **HMAC** | Hash-based Message Authentication Code for webhook verification |
| **MCP** | Model Context Protocol - standard for AI tool extensibility |
| **Rate Limiting** | Restricting request frequency to prevent abuse |
| **Scope** | Permission level assigned to an API key |
| **tRPC** | TypeScript RPC framework for type-safe APIs |
| **Webhook** | HTTP callback for event-driven notifications |
| **Zod** | TypeScript-first schema validation library |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Development Team | Initial PRD creation |

---

**Document Status:** Ready for Review
**Next Review:** 2026-01-18
**Stakeholders:** Engineering, Product, Developer Experience, Security
