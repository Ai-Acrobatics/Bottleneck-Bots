# Bottleneck Bots - Product Requirements Documents

## Comprehensive PRD Index and Navigation Guide

**Document Version:** 1.0
**Last Updated:** 2026-01-11
**Total PRDs:** 38
**Status:** Active Development

---

## 1. Project Overview

Bottleneck Bots is an AI-powered automation platform that enables businesses to automate browser-based tasks, manage intelligent agents, orchestrate multi-step workflows, and scale operations without extensive coding. The platform combines cloud browser infrastructure (Browserbase), AI-powered interactions (Stagehand), and autonomous agent capabilities (Claude AI) to deliver a comprehensive automation solution.

### Core Value Propositions

| Value | Description |
|-------|-------------|
| **Browser Automation** | Cloud-based browser sessions with AI-powered element interaction |
| **Autonomous Agents** | Natural language task delegation with Claude AI |
| **Workflow Orchestration** | Visual builder for multi-step automated processes |
| **Lead Management** | Bulk enrichment and AI voice calling for sales teams |
| **Developer Tools** | In-browser IDE with AI code generation |
| **Enterprise Ready** | Multi-tenant architecture with comprehensive security |

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Tailwind CSS 4, tRPC |
| Backend | Node.js, Express, tRPC 11 |
| Database | Drizzle ORM, Supabase PostgreSQL |
| Automation | Browserbase, Stagehand |
| AI Models | Claude (Anthropic), Google Gemini, OpenAI |
| Payments | Stripe |
| Voice | Vapi.ai |
| Workflow | n8n |

---

## 2. PRD Numbering Scheme

PRDs follow a consistent numbering format: `PRD-XXX` where `XXX` is a three-digit sequential number.

### Number Ranges by Category

| Range | Category | Description |
|-------|----------|-------------|
| 001-004 | Core Automation | Browser sessions, workflows, scheduling, task distribution |
| 005-008 | AI Agents | Autonomous agents, swarm coordination, memory, learning |
| 009-010 | Lead Management | Lead enrichment, AI voice calling |
| 011 | Email Communication | Email integration and AI drafting |
| 012-013 | Digital Marketing | SEO analysis, Meta Ads management |
| 014-015 | Client Management | Client profiles, sub-accounts |
| 016 | Assessment | Quiz and training system |
| 017-020 | Developer Tools | Webdev IDE, deployment, MCP, tool execution |
| 021-026 | System & Analytics | Analytics, billing, health, admin, security, settings |
| 027-028 | Data & Knowledge | RAG system, knowledge management |
| 029-031 | Integrations | Webhooks, integration hub, marketplace |
| 032-033 | Auth & Security | User authentication, agent permissions |
| 034-035 | Real-Time Communication | SSE, WebSocket support |
| 036-037 | Monitoring | Session debugging, execution viewer |
| 038 | Notifications | Multi-channel notification system |

---

## 3. Complete PRD Directory

### Directory Structure

```
docs/prds/
├── README.md                    # This file
├── INDEX.md                     # Quick reference index
├── core-automation/             # Browser automation, workflows, scheduling
├── ai-agents/                   # Autonomous agents, swarms, memory, learning
├── lead-management/             # Lead enrichment, AI voice calling
├── email-communication/         # Email integration and AI drafting
├── digital-marketing/           # SEO, Meta Ads management
├── client-management/           # Client profiles, sub-accounts
├── assessment/                  # Quiz and training system
├── developer/                   # Webdev, deployment, MCP, tools
├── system-analytics/            # Analytics, billing, health, admin
├── data-knowledge/              # RAG, knowledge management
├── integrations/                # Webhooks, integration hub, marketplace
├── auth-security/               # Authentication, agent permissions
├── real-time/                   # SSE, WebSocket communication
├── monitoring/                  # Session debugging, execution viewer
└── notifications/               # Notifications system
```

---

## 4. PRD Master Table

### Core Automation (4 PRDs)

| PRD | Feature Name | File Path | Status | Priority |
|-----|--------------|-----------|--------|----------|
| PRD-001 | Browser Automation Engine | [core-automation/PRD-001-browser-automation-engine.md](core-automation/PRD-001-browser-automation-engine.md) | Approved | P0 - Critical |
| PRD-002 | Workflow Automation | [core-automation/PRD-002-workflow-automation.md](core-automation/PRD-002-workflow-automation.md) | Approved | P0 - Critical |
| PRD-003 | Scheduled Task Management | [core-automation/PRD-003-scheduled-task-management.md](core-automation/PRD-003-scheduled-task-management.md) | Approved | P1 - High |
| PRD-004 | Task Distribution & Orchestration | [core-automation/PRD-004-task-distribution-orchestration.md](core-automation/PRD-004-task-distribution-orchestration.md) | Approved | P1 - High |

### AI & Intelligent Agents (4 PRDs)

| PRD | Feature Name | File Path | Status | Priority |
|-----|--------------|-----------|--------|----------|
| PRD-005 | Autonomous Agent System | [ai-agents/PRD-005-autonomous-agent-system.md](ai-agents/PRD-005-autonomous-agent-system.md) | Approved | P0 - Critical |
| PRD-006 | Swarm Coordination | [ai-agents/PRD-006-swarm-coordination.md](ai-agents/PRD-006-swarm-coordination.md) | Approved | P1 - High |
| PRD-007 | Agent Memory System | [ai-agents/PRD-007-agent-memory-system.md](ai-agents/PRD-007-agent-memory-system.md) | Approved | P1 - High |
| PRD-008 | Agent Learning & Training | [ai-agents/PRD-008-agent-learning-training.md](ai-agents/PRD-008-agent-learning-training.md) | Review | P2 - Medium |

### Lead Management (2 PRDs)

| PRD | Feature Name | File Path | Status | Priority |
|-----|--------------|-----------|--------|----------|
| PRD-009 | Lead Enrichment System | [lead-management/PRD-009-lead-enrichment-system.md](lead-management/PRD-009-lead-enrichment-system.md) | Approved | P1 - High |
| PRD-010 | AI Voice Calling | [lead-management/PRD-010-ai-voice-calling.md](lead-management/PRD-010-ai-voice-calling.md) | Approved | P1 - High |

### Email Communication (1 PRD)

| PRD | Feature Name | File Path | Status | Priority |
|-----|--------------|-----------|--------|----------|
| PRD-011 | Email Integration | [email-communication/PRD-011-email-integration.md](email-communication/PRD-011-email-integration.md) | Approved | P1 - High |

### Digital Marketing (2 PRDs)

| PRD | Feature Name | File Path | Status | Priority |
|-----|--------------|-----------|--------|----------|
| PRD-012 | SEO & Website Analysis | [digital-marketing/PRD-012-seo-website-analysis.md](digital-marketing/PRD-012-seo-website-analysis.md) | Approved | P1 - High |
| PRD-013 | Meta Ads Management | [digital-marketing/PRD-013-meta-ads-management.md](digital-marketing/PRD-013-meta-ads-management.md) | Review | P2 - Medium |

### Client Management (2 PRDs)

| PRD | Feature Name | File Path | Status | Priority |
|-----|--------------|-----------|--------|----------|
| PRD-014 | Client Profile System | [client-management/PRD-014-client-profile-system.md](client-management/PRD-014-client-profile-system.md) | Approved | P1 - High |
| PRD-015 | Sub-Account Management | [client-management/PRD-015-sub-account-management.md](client-management/PRD-015-sub-account-management.md) | Approved | P1 - High |

### Assessment & Training (1 PRD)

| PRD | Feature Name | File Path | Status | Priority |
|-----|--------------|-----------|--------|----------|
| PRD-016 | Quiz System | [assessment/PRD-016-quiz-system.md](assessment/PRD-016-quiz-system.md) | Review | P2 - Medium |

### Developer & Technical (4 PRDs)

| PRD | Feature Name | File Path | Status | Priority |
|-----|--------------|-----------|--------|----------|
| PRD-017 | Webdev Project Management | [developer/PRD-017-webdev-project-management.md](developer/PRD-017-webdev-project-management.md) | Approved | P1 - High |
| PRD-018 | Deployment Management | [developer/PRD-018-deployment-management.md](developer/PRD-018-deployment-management.md) | Review | P2 - Medium |
| PRD-019 | MCP Integration | [developer/PRD-019-mcp-integration.md](developer/PRD-019-mcp-integration.md) | Approved | P1 - High |
| PRD-020 | Tools Execution Engine | [developer/PRD-020-tools-execution-engine.md](developer/PRD-020-tools-execution-engine.md) | Approved | P0 - Critical |

### System & Analytics (6 PRDs)

| PRD | Feature Name | File Path | Status | Priority |
|-----|--------------|-----------|--------|----------|
| PRD-021 | Analytics & Reporting | [system-analytics/PRD-021-analytics-reporting.md](system-analytics/PRD-021-analytics-reporting.md) | Approved | P1 - High |
| PRD-022 | Cost & Credit Management | [system-analytics/PRD-022-cost-credit-management.md](system-analytics/PRD-022-cost-credit-management.md) | Approved | P0 - Critical |
| PRD-023 | Health Monitoring & Alerts | [system-analytics/PRD-023-health-monitoring-alerts.md](system-analytics/PRD-023-health-monitoring-alerts.md) | Approved | P0 - Critical |
| PRD-024 | Admin Dashboard | [system-analytics/PRD-024-admin-dashboard.md](system-analytics/PRD-024-admin-dashboard.md) | Approved | P1 - High |
| PRD-025 | API Keys & Security | [system-analytics/PRD-025-api-keys-security.md](system-analytics/PRD-025-api-keys-security.md) | Approved | P0 - Critical |
| PRD-026 | Settings & Preferences | [system-analytics/PRD-026-settings-preferences.md](system-analytics/PRD-026-settings-preferences.md) | Approved | P1 - High |

### Data & Knowledge (2 PRDs)

| PRD | Feature Name | File Path | Status | Priority |
|-----|--------------|-----------|--------|----------|
| PRD-027 | RAG System | [data-knowledge/PRD-027-rag-system.md](data-knowledge/PRD-027-rag-system.md) | Approved | P1 - High |
| PRD-028 | Knowledge Management | [data-knowledge/PRD-028-knowledge-management.md](data-knowledge/PRD-028-knowledge-management.md) | Approved | P1 - High |

### Integrations & Webhooks (3 PRDs)

| PRD | Feature Name | File Path | Status | Priority |
|-----|--------------|-----------|--------|----------|
| PRD-029 | Webhook System | [integrations/PRD-029-webhook-system.md](integrations/PRD-029-webhook-system.md) | Approved | P1 - High |
| PRD-030 | Integration Hub | [integrations/PRD-030-integration-hub.md](integrations/PRD-030-integration-hub.md) | Approved | P1 - High |
| PRD-031 | Marketplace | [integrations/PRD-031-marketplace.md](integrations/PRD-031-marketplace.md) | Review | P2 - Medium |

### Authentication & Security (2 PRDs)

| PRD | Feature Name | File Path | Status | Priority |
|-----|--------------|-----------|--------|----------|
| PRD-032 | User Authentication | [auth-security/PRD-032-user-authentication.md](auth-security/PRD-032-user-authentication.md) | Approved | P0 - Critical |
| PRD-033 | Agent Permissions | [auth-security/PRD-033-agent-permissions.md](auth-security/PRD-033-agent-permissions.md) | Approved | P0 - Critical |

### Real-Time Communication (2 PRDs)

| PRD | Feature Name | File Path | Status | Priority |
|-----|--------------|-----------|--------|----------|
| PRD-034 | Server-Sent Events | [real-time/PRD-034-server-sent-events.md](real-time/PRD-034-server-sent-events.md) | Approved | P1 - High |
| PRD-035 | WebSocket Support | [real-time/PRD-035-websocket-support.md](real-time/PRD-035-websocket-support.md) | Approved | P1 - High |

### Monitoring & Troubleshooting (2 PRDs)

| PRD | Feature Name | File Path | Status | Priority |
|-----|--------------|-----------|--------|----------|
| PRD-036 | Browser Session Debugging | [monitoring/PRD-036-browser-session-debugging.md](monitoring/PRD-036-browser-session-debugging.md) | Approved | P1 - High |
| PRD-037 | Execution Viewer | [monitoring/PRD-037-execution-viewer.md](monitoring/PRD-037-execution-viewer.md) | Approved | P1 - High |

### Notifications (1 PRD)

| PRD | Feature Name | File Path | Status | Priority |
|-----|--------------|-----------|--------|----------|
| PRD-038 | Notification System | [notifications/PRD-038-notification-system.md](notifications/PRD-038-notification-system.md) | Approved | P1 - High |

---

## 5. Priority Distribution Summary

| Priority | Count | Percentage | Description |
|----------|-------|------------|-------------|
| **P0 - Critical** | 8 | 21% | Core platform functionality, must-have for MVP |
| **P1 - High** | 24 | 63% | Important features for production release |
| **P2 - Medium** | 6 | 16% | Enhanced features for future iterations |

### P0 Critical Path Features

These features are required for minimum viable product:

1. **PRD-001** - Browser Automation Engine (foundation)
2. **PRD-002** - Workflow Automation (core value prop)
3. **PRD-005** - Autonomous Agent System (AI capability)
4. **PRD-020** - Tools Execution Engine (agent tools)
5. **PRD-022** - Cost & Credit Management (billing)
6. **PRD-023** - Health Monitoring & Alerts (operations)
7. **PRD-025** - API Keys & Security (security)
8. **PRD-032** - User Authentication (access control)

---

## 6. PRD Template Reference

Each PRD follows a standardized structure to ensure consistency and completeness.

### Standard PRD Structure

```markdown
# PRD-XXX: Feature Name

## Product Requirements Document

### Overview
| Field | Value |
|-------|-------|
| **PRD ID** | PRD-XXX |
| **Feature Name** | Name |
| **Category** | Category |
| **Priority** | P0/P1/P2 |
| **Status** | Draft/Review/Approved |
| **Owner** | Team |

## 1. Executive Summary
[Brief feature overview]

## 2. Problem Statement
[What problem this solves]

## 3. Goals & Objectives
### Primary Goals
- [Goal list]

### Success Metrics
| Metric | Target |
|--------|--------|
| [Metric] | [Target] |

## 4. User Stories
### US-XXX: Story Title
**As a** [role]
**I want to** [action]
**So that** [benefit]

**Acceptance Criteria:**
- [ ] Criteria 1
- [ ] Criteria 2

## 5. Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-XXX.X | Requirement | P0/P1/P2 |

## 6. Non-Functional Requirements
[Performance, scalability, reliability, security]

## 7. Technical Architecture
[System diagrams, component relationships]

## 8. API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| [METHOD] | [path] | [description] |

## 9. Data Models
[TypeScript interfaces]

## 10. Dependencies
| Dependency | Purpose | Version |
|------------|---------|---------|
| [Name] | [Purpose] | [Version] |

## 11. Risks & Mitigations
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|

## 12. Release Criteria
[Alpha, Beta, GA milestones]

## Appendix
### A. Related PRDs
### B. Changelog
| Date | Version | Changes |
|------|---------|---------|
```

---

## 7. How to Use These PRDs for Development

### For Developers

1. **Start with Related PRDs**: Check the cross-references section to understand dependencies
2. **Review Data Models**: TypeScript interfaces define the contract between frontend and backend
3. **Follow API Specifications**: Endpoint definitions ensure consistent implementation
4. **Check Acceptance Criteria**: User story criteria define "done" for each feature
5. **Reference Functional Requirements**: FR table provides granular implementation guidance

### For QA Engineers

1. **Map to UX Stories**: Each PRD has corresponding UX stories for test scenarios
2. **Use Success Metrics**: Quantitative targets help define test coverage
3. **Review Edge Cases**: User story edge cases inform negative testing
4. **Track Acceptance Criteria**: Checkbox items become test cases

### For Product Managers

1. **Monitor Status**: Draft -> Review -> Approved workflow
2. **Track Priority**: P0 features block release, P2 can slip
3. **Review Dependencies**: Cross-references show implementation order
4. **Update Changelog**: Version changes in appendix

### Development Workflow

```
1. Read PRD thoroughly
2. Review related PRDs (dependencies)
3. Check UX Stories for user scenarios
4. Implement data models first
5. Build API endpoints
6. Create UI components
7. Write tests against acceptance criteria
8. Validate success metrics
```

---

## 8. Cross-References Between Related PRDs

### Core Dependencies Graph

```
PRD-001 (Browser Engine)
    └── PRD-002 (Workflow Automation)
    └── PRD-005 (Autonomous Agents)
            └── PRD-006 (Swarm Coordination)
            └── PRD-007 (Agent Memory)
            └── PRD-008 (Agent Learning)
    └── PRD-036 (Session Debugging)
    └── PRD-037 (Execution Viewer)

PRD-020 (Tools Engine)
    └── PRD-005 (Autonomous Agents)
    └── PRD-019 (MCP Integration)

PRD-032 (Authentication)
    └── PRD-033 (Agent Permissions)
    └── PRD-025 (API Keys)
    └── PRD-014 (Client Profiles)
            └── PRD-015 (Sub-Accounts)
```

### Detailed Cross-References

| PRD | Depends On | Required By |
|-----|------------|-------------|
| PRD-001 | PRD-025, PRD-032 | PRD-002, PRD-005, PRD-036, PRD-037 |
| PRD-002 | PRD-001, PRD-020 | PRD-003, PRD-004 |
| PRD-003 | PRD-002 | PRD-004 |
| PRD-005 | PRD-001, PRD-020, PRD-033 | PRD-006, PRD-007, PRD-008 |
| PRD-006 | PRD-005, PRD-007 | PRD-008 |
| PRD-007 | PRD-005 | PRD-006, PRD-008, PRD-027 |
| PRD-009 | PRD-022 | PRD-010, PRD-011 |
| PRD-010 | PRD-009, PRD-005 | PRD-011 |
| PRD-011 | PRD-009, PRD-038 | - |
| PRD-014 | PRD-032 | PRD-015, PRD-009 |
| PRD-015 | PRD-014, PRD-033 | - |
| PRD-017 | PRD-020 | PRD-018, PRD-019 |
| PRD-020 | PRD-025 | PRD-005, PRD-017, PRD-019 |
| PRD-021 | PRD-023 | PRD-024 |
| PRD-022 | PRD-032 | PRD-009, PRD-010 |
| PRD-027 | PRD-007, PRD-028 | PRD-005 |
| PRD-029 | PRD-025 | PRD-030, PRD-038 |
| PRD-030 | PRD-029 | PRD-031 |
| PRD-032 | - | PRD-014, PRD-022, PRD-025, PRD-033 |
| PRD-033 | PRD-032 | PRD-005, PRD-015 |
| PRD-034 | PRD-035 | PRD-036, PRD-037, PRD-038 |
| PRD-038 | PRD-029, PRD-034 | PRD-011 |

### Feature Clusters

| Cluster | PRDs | Description |
|---------|------|-------------|
| **Browser Automation** | 001, 002, 003, 004 | Core automation engine and workflow execution |
| **AI Agents** | 005, 006, 007, 008 | Autonomous agent capabilities and coordination |
| **Sales & Marketing** | 009, 010, 011, 012, 013 | Lead management and digital marketing |
| **Client Management** | 014, 015 | Multi-tenant client and sub-account handling |
| **Developer Experience** | 017, 018, 019, 020 | In-browser development tools |
| **Platform Operations** | 021, 022, 023, 024, 025, 026 | Admin, billing, monitoring, settings |
| **Intelligence Layer** | 027, 028 | RAG and knowledge management |
| **Connectivity** | 029, 030, 031 | Webhooks, integrations, marketplace |
| **Security** | 032, 033 | Authentication and authorization |
| **Real-Time** | 034, 035 | Event streaming and WebSocket |
| **Observability** | 036, 037 | Debugging and execution monitoring |
| **Communication** | 038 | Notification delivery |

---

## 9. UX Stories Reference

User Experience Stories provide detailed user journeys, test scenarios, and edge cases for each feature. They are organized by PRD number.

### UX Stories Location

```
docs/ux-stories/
├── ux-stories-01-05.md    # PRD-001 through PRD-005
├── ux-stories-06-10.md    # PRD-006 through PRD-010
├── ux-stories-11-15.md    # PRD-011 through PRD-015
├── ux-stories-16-20.md    # PRD-016 through PRD-020
├── ux-stories-21-25.md    # PRD-021 through PRD-025
├── ux-stories-26-30.md    # PRD-026 through PRD-030
├── ux-stories-31-35.md    # PRD-031 through PRD-035
└── ux-stories-36-38.md    # PRD-036 through PRD-038
```

### UX Story Structure

Each UX story includes:

| Section | Purpose |
|---------|---------|
| **Title** | Specific user action being tested |
| **User Persona** | Who is performing the action |
| **Preconditions** | Required system state |
| **User Journey** | Step-by-step interaction flow |
| **Expected Behavior** | What should happen |
| **Success Criteria** | Measurable outcomes |
| **Edge Cases** | Error scenarios and boundary conditions |
| **Test Data Requirements** | Data needed for testing |

### PRD to UX Story Mapping

| PRD Range | UX Stories File | Features Covered |
|-----------|-----------------|------------------|
| PRD-001 to PRD-005 | [ux-stories-01-05.md](../ux-stories/ux-stories-01-05.md) | Browser Engine, Workflows, Scheduling, Agents |
| PRD-006 to PRD-010 | [ux-stories-06-10.md](../ux-stories/ux-stories-06-10.md) | Swarm, Memory, Learning, Leads, Voice |
| PRD-011 to PRD-015 | [ux-stories-11-15.md](../ux-stories/ux-stories-11-15.md) | Email, SEO, Ads, Clients, Sub-Accounts |
| PRD-016 to PRD-020 | [ux-stories-16-20.md](../ux-stories/ux-stories-16-20.md) | Quiz, Webdev, Deployment, MCP, Tools |
| PRD-021 to PRD-025 | [ux-stories-21-25.md](../ux-stories/ux-stories-21-25.md) | Analytics, Billing, Health, Admin, API Keys |
| PRD-026 to PRD-030 | [ux-stories-26-30.md](../ux-stories/ux-stories-26-30.md) | Settings, RAG, Knowledge, Webhooks, Integrations |
| PRD-031 to PRD-035 | [ux-stories-31-35.md](../ux-stories/ux-stories-31-35.md) | Marketplace, Auth, Permissions, SSE, WebSocket |
| PRD-036 to PRD-038 | [ux-stories-36-38.md](../ux-stories/ux-stories-36-38.md) | Debugging, Execution Viewer, Notifications |

---

## 10. Status Definitions

| Status | Definition | Next Step |
|--------|------------|-----------|
| **Draft** | Initial creation, incomplete | Complete all sections, internal review |
| **Review** | Complete, awaiting stakeholder approval | Address feedback, finalize requirements |
| **Approved** | Signed off, ready for development | Begin implementation |
| **In Progress** | Active development underway | Track against milestones |
| **Complete** | Feature shipped and verified | Move to maintenance |
| **Deprecated** | No longer active | Archive or remove |

---

## 11. Contributing to PRDs

### Making Updates

1. **Version Increment**: Update version in changelog (e.g., 1.0 -> 1.1)
2. **Date Update**: Set `updatedAt` to current date
3. **Changelog Entry**: Add row describing changes
4. **Cross-Reference Check**: Update related PRD references if needed
5. **Status Update**: Change status if appropriate (Draft -> Review -> Approved)

### Review Process

1. Create PR with PRD changes
2. Tag relevant stakeholders
3. Address feedback in PR comments
4. Merge after approval
5. Update INDEX.md if structure changes

### Quality Checklist

- [ ] All sections complete
- [ ] Data models include TypeScript interfaces
- [ ] API endpoints follow REST conventions
- [ ] User stories have acceptance criteria
- [ ] Functional requirements have priority levels
- [ ] Dependencies documented
- [ ] Risks identified with mitigations
- [ ] Cross-references accurate

---

## 12. Quick Reference

### Find PRDs by Topic

| Topic | Relevant PRDs |
|-------|--------------|
| Browser Automation | PRD-001, PRD-036, PRD-037 |
| Workflows | PRD-002, PRD-003, PRD-004 |
| AI Agents | PRD-005, PRD-006, PRD-007, PRD-008 |
| Lead Management | PRD-009, PRD-010, PRD-011 |
| Marketing | PRD-012, PRD-013 |
| Client Management | PRD-014, PRD-015 |
| Development Tools | PRD-017, PRD-018, PRD-019, PRD-020 |
| Admin & Billing | PRD-021, PRD-022, PRD-023, PRD-024 |
| Security | PRD-025, PRD-032, PRD-033 |
| Data & Knowledge | PRD-027, PRD-028 |
| Integrations | PRD-029, PRD-030, PRD-031 |
| Real-Time | PRD-034, PRD-035 |
| Notifications | PRD-038 |

### PRD Count by Category

| Category | Count |
|----------|-------|
| Core Automation | 4 |
| AI Agents | 4 |
| Lead Management | 2 |
| Email Communication | 1 |
| Digital Marketing | 2 |
| Client Management | 2 |
| Assessment | 1 |
| Developer Tools | 4 |
| System & Analytics | 6 |
| Data & Knowledge | 2 |
| Integrations | 3 |
| Auth & Security | 2 |
| Real-Time | 2 |
| Monitoring | 2 |
| Notifications | 1 |
| **Total** | **38** |

---

## Support & Resources

- **Documentation**: [/docs](/docs)
- **UX Stories**: [/docs/ux-stories](/docs/ux-stories)
- **API Reference**: [/docs/api](/docs/api)
- **Architecture Diagrams**: [/docs/architecture](/docs/architecture)

---

*Generated: 2026-01-11*
*Bottleneck Bots PRD Documentation*
