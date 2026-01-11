# PRD-026: Health & Monitoring

**Document Version:** 1.0
**Status:** Draft
**Author:** Development Team
**Last Updated:** January 11, 2026
**Feature Location:** `server/api/routers/health.ts`, `server/lib/circuitBreaker.ts`

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

---

## 1. Executive Summary

### 1.1 Overview

The Health & Monitoring feature provides comprehensive system observability for Bottleneck-Bots, including real-time health checks, circuit breaker management, service availability monitoring, performance metrics, and infrastructure readiness probes. This feature enables operations teams, developers, and administrators to proactively monitor system health, detect service degradation, and respond to incidents before they impact users.

### 1.2 Key Components

| Component | Description | Location |
|-----------|-------------|----------|
| **System Health Checks** | Overall system health status aggregating all service states | `server/api/routers/health.ts` |
| **Circuit Breaker Management** | State management for protecting against cascading failures | `server/lib/circuitBreaker.ts` |
| **Service Availability** | Per-service availability tracking with degraded/unavailable states | `server/api/routers/health.ts` |
| **Database Health** | PostgreSQL/Supabase connectivity and configuration verification | `server/api/routers/health.ts` |
| **Browserbase Health** | Browser automation service health and configuration | `server/api/routers/health.ts` |
| **Kubernetes Probes** | Liveness and readiness endpoints for container orchestration | `server/api/routers/health.ts` |
| **Performance Metrics** | Aggregate metrics including request counts, failure rates, and success rates | `server/api/routers/health.ts` |

### 1.3 Monitored Services

Based on the implementation:

- **Vapi** - Voice AI service
- **Apify** - Web scraping service
- **Browserbase** - Browser automation service
- **OpenAI** - AI/LLM service
- **Anthropic** - AI/LLM service
- **Gmail** - Email integration
- **Outlook** - Email integration

### 1.4 Circuit Breaker Pattern

The system implements the circuit breaker pattern with three states:
- **CLOSED**: Normal operation, requests pass through
- **OPEN**: Service failing, requests fail immediately to prevent cascade
- **HALF-OPEN**: Testing recovery, allowing limited requests through

### 1.5 Target Users

- DevOps Engineers managing infrastructure
- Site Reliability Engineers (SREs) monitoring uptime
- System Administrators troubleshooting issues
- Developers debugging service failures
- Platform Administrators managing the system
- Monitoring Systems (Kubernetes, Docker, Prometheus)

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Cascading Failures**: Without circuit breakers, a failing external service can overwhelm the entire system with timeouts and retries
2. **Silent Service Degradation**: Services can fail or degrade without immediate visibility, causing user-facing issues
3. **Manual Recovery**: When services fail, manual intervention is required to detect and recover
4. **No Unified Health View**: Scattered health indicators across different services make troubleshooting difficult
5. **Container Orchestration Gaps**: Kubernetes/Docker need proper liveness and readiness probes for auto-scaling and recovery
6. **Missing Performance Baselines**: No aggregate metrics to understand normal vs abnormal system behavior

### 2.2 User Pain Points

| Pain Point | Impact | User Type |
|------------|--------|-----------|
| "I don't know if the system is healthy" | Delayed incident response | DevOps Engineers |
| "One failing API is bringing down everything" | System-wide outages | SREs |
| "I can't tell which service is causing issues" | Extended troubleshooting time | Developers |
| "Kubernetes keeps restarting healthy pods" | Unnecessary service disruption | DevOps Engineers |
| "I have no metrics to show service health trends" | Unable to predict or prevent issues | Platform Administrators |
| "Manual restarts are the only way to recover from failures" | High operational burden | System Administrators |

### 2.3 Business Impact

| Problem | Impact | Cost |
|---------|--------|------|
| Cascading failures causing outages | 100% user impact during incidents | $10K+ per hour of downtime |
| Slow incident detection | MTTR (Mean Time To Recover) > 30 minutes | Customer churn, SLA violations |
| No auto-recovery mechanisms | Manual intervention required 24/7 | On-call engineer costs |
| Improper K8s probe configuration | Pod restarts, service instability | 10-15% capacity loss |
| Missing health dashboards | Reactive instead of proactive operations | Preventable incidents |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal ID | Description | Priority | Target |
|---------|-------------|----------|--------|
| **G1** | Provide real-time system health visibility | P0 | < 5 second detection |
| **G2** | Implement circuit breaker protection for all external services | P0 | 100% service coverage |
| **G3** | Enable automatic service recovery through half-open state testing | P0 | 95%+ auto-recovery rate |
| **G4** | Support Kubernetes liveness/readiness probes | P0 | 100% container compatibility |
| **G5** | Expose aggregate metrics for monitoring dashboards | P1 | All key metrics available |
| **G6** | Provide granular per-service health information | P1 | Individual service insights |

### 3.2 Success Metrics (KPIs)

#### System Reliability Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Overall system availability | >= 99.9% | Uptime monitoring |
| Circuit breaker activation accuracy | >= 99% | True positive rate |
| Auto-recovery success rate | >= 95% | Half-open to closed transitions |
| Cascading failure prevention | 100% | Zero cascade incidents |

#### Performance Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Health check latency (P95) | < 100ms | Server-side measurement |
| Metrics endpoint latency (P95) | < 200ms | Server-side measurement |
| Liveness probe response | < 50ms | Kubernetes probe timing |
| Readiness probe response | < 100ms | Kubernetes probe timing |

#### Operational Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| MTTR (Mean Time To Recover) | < 5 minutes | Incident tracking |
| False positive rate for circuit breakers | < 1% | Breaker state analysis |
| Manual intervention required | < 5% of incidents | Operations logs |
| Health dashboard accuracy | 100% | Data validation |

#### Observability Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Metric data freshness | < 10 seconds | Timestamp analysis |
| Service coverage | 100% | Registered breakers / Services |
| Alert correlation accuracy | >= 95% | Incident analysis |
| Dashboard load time | < 1 second | Client-side measurement |

---

## 4. User Stories & Personas

### 4.1 Personas

#### Persona 1: DevOps Engineer (Derek)
- **Role:** Infrastructure and deployment specialist
- **Goals:** Maintain system uptime, configure monitoring, manage deployments
- **Pain Points:** Lack of visibility into service health, manual recovery processes
- **Technical Level:** High

#### Persona 2: Site Reliability Engineer (Sarah)
- **Role:** Reliability and incident response lead
- **Goals:** Minimize MTTR, prevent cascading failures, establish SLOs
- **Pain Points:** Delayed incident detection, no auto-recovery, missing metrics
- **Technical Level:** High

#### Persona 3: Backend Developer (Ben)
- **Role:** API and service developer
- **Goals:** Debug service issues, understand failure patterns, test integrations
- **Pain Points:** Can't identify which service is failing, no circuit breaker visibility
- **Technical Level:** High

#### Persona 4: Platform Administrator (Paula)
- **Role:** Platform management and user support
- **Goals:** Monitor system health, provide status updates, manage incidents
- **Pain Points:** No unified health dashboard, can't explain outages to users
- **Technical Level:** Medium

### 4.2 User Stories

#### System Health Monitoring

##### US-001: View Overall System Health
**As a** DevOps engineer
**I want to** view the overall health status of the system
**So that** I can quickly determine if action is needed

**Acceptance Criteria:**
- Single endpoint returns aggregate health status
- Health status is binary (healthy/unhealthy)
- All circuit breaker states included in response
- Timestamp indicates when health was checked
- Response time under 100ms

##### US-002: Check Individual Service Health
**As a** backend developer
**I want to** check the health of a specific service
**So that** I can debug issues with that integration

**Acceptance Criteria:**
- Query by service name (vapi, apify, browserbase, openai, anthropic, gmail, outlook)
- Returns circuit breaker state (closed/open/half-open)
- Includes failure rate and recent failure count
- Shows if service exists in registry
- Returns 404-equivalent if service not found

##### US-003: View Service Availability Summary
**As a** platform administrator
**I want to** see which services are available, unavailable, or degraded
**So that** I can communicate status to users

**Acceptance Criteria:**
- Lists services by status category (available, unavailable, degraded)
- Calculates overall availability percentage
- Updates in real-time as states change
- Clear mapping: closed=available, open=unavailable, half-open=degraded

#### Circuit Breaker Management

##### US-004: View Circuit Breaker States
**As an** SRE
**I want to** view detailed circuit breaker states for all services
**So that** I can understand failure patterns

**Acceptance Criteria:**
- Lists all registered circuit breakers
- Shows current state, failure count, success count
- Includes last failure and success timestamps
- Shows total request, failure, and success counts
- Historical data preserved across state transitions

##### US-005: Reset Individual Circuit Breaker
**As a** DevOps engineer
**I want to** manually reset a specific circuit breaker
**So that** I can force recovery after fixing an issue

**Acceptance Criteria:**
- Admin-only procedure (requires authentication)
- Specify service name to reset
- Circuit breaker moves to closed state
- Failure counts reset
- Success confirmation message returned
- Audit log entry created

##### US-006: Reset All Circuit Breakers
**As an** SRE responding to an incident
**I want to** reset all circuit breakers at once
**So that** I can quickly recover the system after a major outage

**Acceptance Criteria:**
- Admin-only procedure
- Resets all registered circuit breakers
- All breakers move to closed state
- Warning displayed before action
- Success message lists all reset breakers

#### Kubernetes Integration

##### US-007: Liveness Probe
**As** Kubernetes
**I want** a liveness endpoint
**So that** I can detect when pods are dead and restart them

**Acceptance Criteria:**
- Endpoint always returns 200 if server is running
- Response includes timestamp
- Response time under 50ms
- No authentication required
- No external dependencies checked

##### US-008: Readiness Probe
**As** Kubernetes
**I want** a readiness endpoint
**So that** I can know when pods are ready to receive traffic

**Acceptance Criteria:**
- Returns ready=true only if no critical services are unavailable
- Lists unavailable services when not ready
- Response includes reasons for non-readiness
- Response time under 100ms
- No authentication required

#### Performance Metrics

##### US-009: View Aggregate Metrics
**As a** monitoring system (Prometheus/Grafana)
**I want** to query aggregate metrics
**So that** I can build dashboards and alerts

**Acceptance Criteria:**
- Total requests across all services
- Total failures and successes
- Overall failure and success rates
- Per-service breakdown
- Health summary included
- Timestamp for data freshness

##### US-010: View Database Health
**As a** DevOps engineer
**I want to** check database connectivity
**So that** I can troubleshoot data layer issues

**Acceptance Criteria:**
- Tests Drizzle ORM connection
- Tests Supabase client connection
- Returns configuration status
- Returns connection status
- Clear error messages on failure

##### US-011: View Browserbase Health
**As a** developer debugging browser automation
**I want to** check Browserbase service health
**So that** I can verify browser automation is working

**Acceptance Criteria:**
- Tests Browserbase configuration
- Tests API connectivity
- Returns project ID if configured
- Lists errors if unhealthy
- Includes initialization status

---

## 5. Functional Requirements

### 5.1 System Health Checks

#### FR-001: Overall System Health

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Aggregate health from all circuit breakers | P0 |
| FR-001.2 | Return healthy=true only if ALL circuits are healthy | P0 |
| FR-001.3 | Include timestamp of health check | P0 |
| FR-001.4 | Return individual circuit states | P0 |
| FR-001.5 | Response time under 100ms | P0 |

#### FR-002: Service-Specific Health

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Query health by service name | P0 |
| FR-002.2 | Return circuit breaker state | P0 |
| FR-002.3 | Return health metrics (failure rate, etc.) | P0 |
| FR-002.4 | Indicate if service exists in registry | P0 |
| FR-002.5 | Support services: vapi, apify, browserbase, openai, anthropic, gmail, outlook | P0 |

#### FR-003: Service Availability

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Categorize services as available/unavailable/degraded | P0 |
| FR-003.2 | Map closed state to available | P0 |
| FR-003.3 | Map open state to unavailable | P0 |
| FR-003.4 | Map half-open state to degraded | P0 |
| FR-003.5 | Calculate availability percentage | P0 |
| FR-003.6 | Count total monitored services | P1 |

### 5.2 Circuit Breaker Management

#### FR-004: Circuit Breaker States

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Track state (closed/open/half-open) | P0 |
| FR-004.2 | Track failure count in monitoring window | P0 |
| FR-004.3 | Track success count in half-open state | P0 |
| FR-004.4 | Track last failure timestamp | P0 |
| FR-004.5 | Track last success timestamp | P0 |
| FR-004.6 | Track total request count | P0 |
| FR-004.7 | Track total failure count | P0 |
| FR-004.8 | Track total success count | P0 |

#### FR-005: Circuit Breaker Transitions

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Transition to OPEN after failureThreshold failures | P0 |
| FR-005.2 | Transition to HALF-OPEN after resetTimeoutMs | P0 |
| FR-005.3 | Transition to CLOSED after successThreshold successes in half-open | P0 |
| FR-005.4 | Transition to OPEN immediately on failure in half-open | P0 |
| FR-005.5 | Fire onStateChange callback on transitions | P1 |
| FR-005.6 | Fire state-specific callbacks (onOpen, onHalfOpen, onClose) | P1 |

#### FR-006: Circuit Breaker Administration

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | Reset individual circuit breaker (admin only) | P0 |
| FR-006.2 | Reset all circuit breakers (admin only) | P0 |
| FR-006.3 | Validate service name exists | P0 |
| FR-006.4 | Return success/error messages | P0 |
| FR-006.5 | Log reset actions | P1 |

### 5.3 Kubernetes Probes

#### FR-007: Liveness Probe

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | Return 200 OK if server is running | P0 |
| FR-007.2 | Include timestamp in response | P0 |
| FR-007.3 | No authentication required | P0 |
| FR-007.4 | No external dependency checks | P0 |
| FR-007.5 | Response time under 50ms | P0 |

#### FR-008: Readiness Probe

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | Check for critical services in OPEN state | P0 |
| FR-008.2 | Return ready=true if no services OPEN | P0 |
| FR-008.3 | Return ready=false if any service OPEN | P0 |
| FR-008.4 | List unavailable services | P0 |
| FR-008.5 | Include reasons for non-readiness | P0 |
| FR-008.6 | No authentication required | P0 |

### 5.4 Performance Metrics

#### FR-009: Aggregate Metrics

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009.1 | Calculate total requests across all services | P0 |
| FR-009.2 | Calculate total failures and successes | P0 |
| FR-009.3 | Calculate overall failure rate | P0 |
| FR-009.4 | Calculate overall success rate | P0 |
| FR-009.5 | Include per-service state breakdown | P0 |
| FR-009.6 | Include health summary | P0 |
| FR-009.7 | Include data timestamp | P0 |

#### FR-010: Database Health

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-010.1 | Test Drizzle ORM connection | P0 |
| FR-010.2 | Test Supabase client connection | P0 |
| FR-010.3 | Return configuration status | P0 |
| FR-010.4 | Return connection status | P0 |
| FR-010.5 | Return healthy=true if either connection works | P0 |
| FR-010.6 | Include error messages on failure | P0 |

#### FR-011: Browserbase Health

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-011.1 | Check Browserbase configuration | P0 |
| FR-011.2 | Test Browserbase API connectivity | P1 |
| FR-011.3 | Return initialized status | P0 |
| FR-011.4 | Return project ID if configured | P0 |
| FR-011.5 | List configuration errors | P0 |

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-001 | System health endpoint latency (P95) | < 100ms | P0 |
| NFR-002 | Liveness probe latency (P95) | < 50ms | P0 |
| NFR-003 | Readiness probe latency (P95) | < 100ms | P0 |
| NFR-004 | Metrics endpoint latency (P95) | < 200ms | P0 |
| NFR-005 | Circuit breaker state query latency | < 10ms | P0 |
| NFR-006 | Database health check latency | < 500ms | P1 |
| NFR-007 | Browserbase health check latency | < 1000ms | P1 |

### 6.2 Scalability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-008 | Concurrent health check requests | 1000+ per second | P0 |
| NFR-009 | Circuit breakers per service | Unlimited | P0 |
| NFR-010 | Failure timestamp retention | Last 100 failures per breaker | P1 |
| NFR-011 | Metrics aggregation efficiency | O(n) where n = services | P0 |

### 6.3 Reliability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-012 | Health API availability | 99.99% | P0 |
| NFR-013 | Circuit breaker state consistency | 100% | P0 |
| NFR-014 | State transition accuracy | 100% | P0 |
| NFR-015 | Probe endpoint availability | 99.99% | P0 |
| NFR-016 | Auto-recovery success rate | >= 95% | P0 |

### 6.4 Security Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-017 | Circuit reset endpoints require admin authentication | P0 |
| NFR-018 | Health endpoints publicly accessible (no auth) | P0 |
| NFR-019 | Metrics endpoints publicly accessible (no auth) | P0 |
| NFR-020 | No sensitive data in health responses | P0 |
| NFR-021 | Rate limiting on health endpoints | P1 |

### 6.5 Observability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-022 | Structured logging for state transitions | P0 |
| NFR-023 | Console output for circuit state changes | P0 |
| NFR-024 | Timestamp accuracy (sub-second) | P0 |
| NFR-025 | Prometheus-compatible metrics format | P1 |
| NFR-026 | Error context in failure logs | P0 |

### 6.6 Compatibility Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-027 | Kubernetes liveness probe compatible | P0 |
| NFR-028 | Kubernetes readiness probe compatible | P0 |
| NFR-029 | Docker health check compatible | P0 |
| NFR-030 | Prometheus scrape compatible | P1 |
| NFR-031 | Standard HTTP health check format | P0 |

---

## 7. Technical Architecture

### 7.1 System Overview

```
+-------------------------------------------------------------------+
|                     External Monitoring Systems                     |
|  (Kubernetes, Prometheus, Grafana, DataDog, PagerDuty)            |
+-------------------------------------------------------------------+
                               |
                               | HTTP GET/POST
                               v
+-------------------------------------------------------------------+
|                        Health Router                                |
|  +-------------------+  +--------------------+  +-----------------+ |
|  | Health Endpoints  |  | Circuit Management |  | Probe Endpoints | |
|  | - getSystemHealth |  | - getCircuitStates |  | - liveness      | |
|  | - getServiceHealth|  | - resetCircuit     |  | - readiness     | |
|  | - getAvailability |  | - resetAllCircuits |  |                 | |
|  +-------------------+  +--------------------+  +-----------------+ |
|                                                                     |
|  +-------------------+  +--------------------+  +-----------------+ |
|  | Database Health   |  | Browserbase Health |  | Metrics         | |
|  | - getDatabaseHealth| - getBrowserbaseHealth| - getMetrics    | |
|  | - testConnections |  | - getBrowserbaseConfig|                 | |
|  +-------------------+  +--------------------+  +-----------------+ |
+-------------------------------------------------------------------+
                               |
        +----------------------+----------------------+
        |                      |                      |
        v                      v                      v
+---------------+    +------------------+    +------------------+
| Circuit       |    | Database         |    | Browserbase      |
| Breaker       |    | Services         |    | SDK              |
| Registry      |    |                  |    |                  |
| - vapi        |    | - Drizzle ORM    |    | - healthCheck()  |
| - apify       |    | - Supabase       |    | - getConfig()    |
| - browserbase |    |   Client         |    |                  |
| - openai      |    |                  |    |                  |
| - anthropic   |    |                  |    |                  |
| - gmail       |    |                  |    |                  |
| - outlook     |    |                  |    |                  |
+---------------+    +------------------+    +------------------+
        |
        v
+-------------------------------------------------------------------+
|                    External Services                                |
|  +--------+ +-------+ +------------+ +--------+ +---------+       |
|  |  Vapi  | | Apify | | Browserbase| | OpenAI | | Anthropic|      |
|  +--------+ +-------+ +------------+ +--------+ +---------+       |
|  +--------+ +---------+                                           |
|  | Gmail  | | Outlook |                                           |
|  +--------+ +---------+                                           |
+-------------------------------------------------------------------+
```

### 7.2 Component Details

#### 7.2.1 Circuit Breaker

**Responsibilities:**
- Protect services from cascading failures
- Track failure/success counts
- Manage state transitions
- Provide health metrics

**Configuration Options:**
```typescript
interface CircuitBreakerOptions {
  failureThreshold: number;    // Failures before opening
  resetTimeoutMs: number;      // Time before half-open
  monitoringWindowMs: number;  // Window for counting failures
  successThreshold?: number;   // Successes to close (default: 1)
  onStateChange?: (oldState, newState) => void;
  onOpen?: () => void;
  onHalfOpen?: () => void;
  onClose?: () => void;
}
```

**Pre-configured Services:**
```typescript
const circuitBreakers = {
  vapi: { failureThreshold: 5, resetTimeoutMs: 60000, successThreshold: 2 },
  apify: { failureThreshold: 3, resetTimeoutMs: 30000, successThreshold: 2 },
  browserbase: { failureThreshold: 5, resetTimeoutMs: 60000, successThreshold: 2 },
  openai: { failureThreshold: 10, resetTimeoutMs: 120000, successThreshold: 3 },
  anthropic: { failureThreshold: 10, resetTimeoutMs: 120000, successThreshold: 3 },
  gmail: { failureThreshold: 5, resetTimeoutMs: 60000, successThreshold: 2 },
  outlook: { failureThreshold: 5, resetTimeoutMs: 60000, successThreshold: 2 },
};
```

#### 7.2.2 Circuit Breaker Registry

**Responsibilities:**
- Maintain map of all circuit breakers
- Provide aggregate health status
- Enable bulk operations (reset all)
- Support dynamic registration

**Key Methods:**
```typescript
class CircuitBreakerRegistry {
  register(name: string, options: CircuitBreakerOptions): CircuitBreaker;
  get(name: string): CircuitBreaker | undefined;
  getOrCreate(name: string, options: CircuitBreakerOptions): CircuitBreaker;
  getAll(): Map<string, CircuitBreaker>;
  getAllHealth(): Record<string, CircuitHealth>;
  resetAll(): void;
}
```

#### 7.2.3 Health Router

**Responsibilities:**
- Expose health check endpoints via tRPC
- Aggregate circuit breaker states
- Provide Kubernetes probe endpoints
- Query database and service health

### 7.3 State Machine Diagram

```
                    +------------+
                    |   CLOSED   |
                    | (Healthy)  |
                    +------------+
                          |
                          | failures >= failureThreshold
                          | within monitoringWindowMs
                          v
                    +------------+
                    |   OPEN     |
                    | (Failing)  |
                    +------------+
                          |
                          | time >= resetTimeoutMs
                          v
                    +------------+
          +-------->| HALF-OPEN  |<--------+
          |         | (Testing)  |         |
          |         +------------+         |
          |               |                |
          | failure       | successes >= successThreshold
          |               v                |
          |         +------------+         |
          +---------|   CLOSED   |---------+
                    | (Healthy)  |
                    +------------+
```

### 7.4 Data Flow Diagrams

#### 7.4.1 Health Check Flow

```
Client              Health Router           Circuit Registry
  |                      |                        |
  |--- GET /health ----->|                        |
  |                      |--- getAllHealth() ---->|
  |                      |<-- health map ---------|
  |                      |                        |
  |                      |--- aggregate health    |
  |                      |    (all healthy?)      |
  |                      |                        |
  |<-- { healthy, timestamp, circuits } ----------|
```

#### 7.4.2 Circuit Breaker Execution Flow

```
Service Code          Circuit Breaker              External API
     |                      |                           |
     |--- execute(fn) ----->|                           |
     |                      |--- check state            |
     |                      |                           |
     |  [if OPEN and not timeout]                       |
     |<-- CircuitBreakerError                           |
     |                      |                           |
     |  [if OPEN and timeout passed]                    |
     |                      |--- move to HALF-OPEN      |
     |                      |                           |
     |  [if CLOSED or HALF-OPEN]                        |
     |                      |--- call fn() ------------>|
     |                      |<-- response/error --------|
     |                      |                           |
     |                      |--- onSuccess() or         |
     |                      |    onFailure()            |
     |                      |                           |
     |<-- result/error -----|                           |
```

#### 7.4.3 Kubernetes Probe Flow

```
Kubernetes              Health Router           Circuit Registry
    |                        |                        |
    |--- GET /liveness ----->|                        |
    |<-- { status: 'ok' } ---|                        |
    |                        |                        |
    |--- GET /readiness ---->|                        |
    |                        |--- getAllHealth() ---->|
    |                        |<-- health map ---------|
    |                        |                        |
    |                        |--- filter OPEN states  |
    |                        |                        |
    |<-- { ready, unavailableServices } --------------|
```

### 7.5 Failure Handling

| Failure Type | Detection | Response | Recovery |
|--------------|-----------|----------|----------|
| Service timeout | Threshold exceeded | Open circuit | Auto half-open after timeout |
| Service error | Exception caught | Increment failure count | Auto-close after successes |
| Database down | Connection test fails | Return unhealthy | Manual intervention |
| Browserbase down | Health check fails | Return unhealthy | Check configuration |
| Circuit open | State check | Fast fail | Wait for half-open |

---

## 8. API Specifications

### 8.1 Health Check Endpoints

#### health.getSystemHealth

**Description:** Get overall system health status

**Request:** None (public procedure)

**Response:**
```typescript
{
  healthy: boolean;
  timestamp: string;  // ISO 8601
  circuits: Record<string, {
    healthy: boolean;
    state: 'closed' | 'open' | 'half-open';
    failureRate: number;
    recentFailures: number;
    totalRequests: number;
  }>;
}
```

#### health.getServiceHealth

**Description:** Get health status for a specific service

**Request:**
```typescript
{
  serviceName: 'vapi' | 'apify' | 'browserbase' | 'openai' | 'anthropic' | 'gmail' | 'outlook';
}
```

**Response:**
```typescript
{
  exists: boolean;
  serviceName: string;
  state?: {
    state: 'closed' | 'open' | 'half-open';
    failures: number;
    successes: number;
    lastFailureTime: number | null;
    lastSuccessTime: number | null;
    totalRequests: number;
    totalFailures: number;
    totalSuccesses: number;
  };
  health?: {
    healthy: boolean;
    state: 'closed' | 'open' | 'half-open';
    failureRate: number;
    recentFailures: number;
    totalRequests: number;
  };
}
```

#### health.getServiceAvailability

**Description:** Get service availability summary

**Request:** None

**Response:**
```typescript
{
  available: string[];
  unavailable: string[];
  degraded: string[];
  totalServices: number;
  availabilityPercentage: number;
}
```

### 8.2 Circuit Breaker Endpoints

#### health.getCircuitStates

**Description:** Get detailed circuit breaker states for all services

**Request:** None

**Response:**
```typescript
Record<string, {
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
}>
```

#### health.resetCircuit

**Description:** Reset a specific circuit breaker (admin only)

**Request:**
```typescript
{
  serviceName: 'vapi' | 'apify' | 'browserbase' | 'openai' | 'anthropic' | 'gmail' | 'outlook';
}
```

**Response:**
```typescript
{
  success: boolean;
  serviceName: string;
  message: string;
}
```

**Errors:**
- `Circuit breaker '{serviceName}' not found`

#### health.resetAllCircuits

**Description:** Reset all circuit breakers (admin only)

**Request:** None

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

### 8.3 Kubernetes Probe Endpoints

#### health.liveness

**Description:** Liveness probe for Kubernetes/Docker

**Request:** None

**Response:**
```typescript
{
  status: 'ok';
  timestamp: string;  // ISO 8601
}
```

#### health.readiness

**Description:** Readiness probe for Kubernetes/Docker

**Request:** None

**Response:**
```typescript
{
  ready: boolean;
  timestamp: string;  // ISO 8601
  unavailableServices: string[];
  reasons: string[];
}
```

### 8.4 Metrics Endpoints

#### health.getMetrics

**Description:** Get comprehensive metrics for monitoring dashboards

**Request:** None

**Response:**
```typescript
{
  timestamp: string;  // ISO 8601
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
  overallFailureRate: number;
  overallSuccessRate: number;
  services: Record<string, CircuitBreakerState>;
  healthSummary: Record<string, CircuitHealth>;
}
```

### 8.5 Database Health Endpoints

#### health.getDatabaseHealth

**Description:** Check database connectivity

**Request:** None

**Response:**
```typescript
{
  healthy: boolean;
  timestamp: string;
  drizzle: {
    connected: boolean;
    error?: string;
  };
  supabase: {
    connected: boolean;
    configured: boolean;
    error?: string;
  };
  error?: string;
}
```

### 8.6 Browserbase Health Endpoints

#### health.getBrowserbaseHealth

**Description:** Check Browserbase service health

**Request:** None

**Response:**
```typescript
{
  healthy: boolean;
  status: 'healthy' | 'degraded' | 'error';
  details: {
    configured: boolean;
    initialized: boolean;
    canConnect: boolean;
    projectId: string | null;
    errors: string[];
  };
}
```

#### health.getBrowserbaseConfig

**Description:** Get Browserbase configuration status

**Request:** None

**Response:**
```typescript
{
  isConfigured: boolean;
  projectId?: string;
  errors: string[];
}
```

---

## 9. Data Models

### 9.1 Circuit Breaker State

```typescript
interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failures: number;              // Current failure count
  successes: number;             // Successes in half-open
  lastFailureTime: number | null; // Unix timestamp ms
  lastSuccessTime: number | null; // Unix timestamp ms
  totalRequests: number;         // Lifetime request count
  totalFailures: number;         // Lifetime failure count
  totalSuccesses: number;        // Lifetime success count
}
```

### 9.2 Circuit Breaker Health

```typescript
interface CircuitHealth {
  healthy: boolean;
  state: 'closed' | 'open' | 'half-open';
  failureRate: number;           // 0-1, lifetime
  recentFailures: number;        // In monitoring window
  totalRequests: number;
}
```

### 9.3 Circuit Breaker Options

```typescript
interface CircuitBreakerOptions {
  failureThreshold: number;      // Required
  resetTimeoutMs: number;        // Required
  monitoringWindowMs: number;    // Required
  successThreshold?: number;     // Default: 1
  onStateChange?: (oldState: CircuitState, newState: CircuitState) => void;
  onOpen?: () => void;
  onHalfOpen?: () => void;
  onClose?: () => void;
}
```

### 9.4 System Health Response

```typescript
interface SystemHealth {
  healthy: boolean;
  timestamp: string;             // ISO 8601
  circuits: Record<string, CircuitHealth>;
}
```

### 9.5 Service Availability Response

```typescript
interface ServiceAvailability {
  available: string[];
  unavailable: string[];
  degraded: string[];
  totalServices: number;
  availabilityPercentage: number;  // 0-100
}
```

### 9.6 Metrics Response

```typescript
interface HealthMetrics {
  timestamp: string;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
  overallFailureRate: number;    // 0-1
  overallSuccessRate: number;    // 0-1
  services: Record<string, CircuitBreakerState>;
  healthSummary: Record<string, CircuitHealth>;
}
```

### 9.7 Database Health Response

```typescript
interface DatabaseHealth {
  healthy: boolean;
  timestamp: string;
  drizzle: {
    connected: boolean;
    error?: string;
  };
  supabase: {
    connected: boolean;
    configured: boolean;
    error?: string;
  };
  error?: string;
}
```

---

## 10. UI/UX Requirements

### 10.1 Health Dashboard

#### 10.1.1 System Status Overview
- Overall system health indicator (green/yellow/red)
- Total availability percentage
- Service count summary (available/degraded/unavailable)
- Last updated timestamp with auto-refresh

#### 10.1.2 Service Health Grid
- Card for each monitored service
- Status indicator per service
- Circuit state display (closed/open/half-open)
- Failure rate visualization
- Recent failures count
- Quick actions (reset circuit)

#### 10.1.3 Circuit Breaker Detail Panel
- Expandable detail view per service
- State transition history
- Failure/success timeline
- Total request statistics
- Configuration display

### 10.2 Metrics Dashboard

#### 10.2.1 Aggregate Metrics Cards
- Total requests counter
- Total failures counter
- Total successes counter
- Overall success rate gauge

#### 10.2.2 Service Breakdown Table
| Column | Description |
|--------|-------------|
| Service Name | Name with status icon |
| State | Current circuit state |
| Total Requests | Lifetime count |
| Failure Rate | Percentage with trend |
| Last Failure | Timestamp or "Never" |
| Last Success | Timestamp or "Never" |
| Actions | Reset button |

#### 10.2.3 Trend Charts
- Request volume over time
- Failure rate over time
- Service availability over time
- Circuit state changes timeline

### 10.3 Admin Controls

#### 10.3.1 Circuit Breaker Management
- Reset individual circuit button
- Reset all circuits button (with confirmation)
- Admin-only visibility
- Action audit log

#### 10.3.2 Service Configuration View
- View circuit breaker configuration per service
- Display thresholds and timeouts
- Read-only (configuration in code)

### 10.4 Alert Integration

#### 10.4.1 Real-time Notifications
- Circuit OPEN notification
- Service degraded warning
- Recovery notification (circuit CLOSED)
- Database health alerts

#### 10.4.2 Alert Configuration
- Enable/disable per alert type
- Notification channels (email, Slack, webhook)
- Alert thresholds (optional future enhancement)

---

## 11. Dependencies & Integrations

### 11.1 Internal Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| tRPC Core | `server/_core/trpc.ts` | API router with auth middleware |
| Circuit Breaker | `server/lib/circuitBreaker.ts` | Circuit breaker pattern implementation |
| Browserbase SDK | `server/_core/browserbaseSDK.ts` | Browser automation health |
| Database | `server/db/index.ts` | Drizzle ORM connection |
| Supabase Service | `server/services/supabase.service.ts` | Supabase client |

### 11.2 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| zod | ^3.x | Input validation schemas |
| @trpc/server | ^11.x | API framework |
| drizzle-orm | ^0.30.x | Database ORM |

### 11.3 External Services (Monitored)

| Service | Purpose | Circuit Breaker Config |
|---------|---------|------------------------|
| Vapi | Voice AI | 5 failures, 60s reset |
| Apify | Web scraping | 3 failures, 30s reset |
| Browserbase | Browser automation | 5 failures, 60s reset |
| OpenAI | AI/LLM | 10 failures, 120s reset |
| Anthropic | AI/LLM | 10 failures, 120s reset |
| Gmail | Email | 5 failures, 60s reset |
| Outlook | Email | 5 failures, 60s reset |

### 11.4 Integration Points

| System | Integration Type | Purpose |
|--------|------------------|---------|
| Kubernetes | HTTP probes | Container health |
| Docker | Health check | Container status |
| Prometheus | Metrics scrape | Monitoring |
| Grafana | Dashboard | Visualization |
| PagerDuty | Webhook | Alerting |
| DataDog | Agent | APM |

### 11.5 Environment Variables

```bash
# Database
DATABASE_URL=                # PostgreSQL connection string

# Supabase (optional)
SUPABASE_URL=
SUPABASE_ANON_KEY=

# Browserbase (for health check)
BROWSERBASE_API_KEY=
BROWSERBASE_PROJECT_ID=
```

### 11.6 Related PRDs

| PRD | Relationship |
|-----|--------------|
| PRD-001 AI Agent Orchestration | Uses OpenAI/Anthropic circuit breakers |
| PRD-002 Browser Automation | Uses Browserbase health checks |
| PRD-005 Email Integration | Uses Gmail/Outlook circuit breakers |
| PRD-006 Voice Agent | Uses Vapi circuit breaker |
| PRD-023 Settings Configuration | Health affects configuration visibility |

---

## 12. Release Criteria

### 12.1 Pre-Release Checklist

#### Functional Testing

- [ ] All circuit breaker states transition correctly
- [ ] System health aggregates all services accurately
- [ ] Service-specific health returns correct data
- [ ] Availability categorization is accurate
- [ ] Liveness probe always returns 200
- [ ] Readiness probe fails when services are OPEN
- [ ] Circuit reset (individual) works for all services
- [ ] Circuit reset (all) resets all breakers
- [ ] Database health check returns accurate status
- [ ] Browserbase health check works

#### Security Testing

- [ ] Reset endpoints require admin authentication
- [ ] Public endpoints return no sensitive data
- [ ] Rate limiting prevents probe abuse
- [ ] No credential exposure in responses

#### Performance Testing

- [ ] Health endpoint < 100ms P95
- [ ] Liveness < 50ms P95
- [ ] Readiness < 100ms P95
- [ ] Metrics < 200ms P95
- [ ] 1000+ concurrent probe requests handled

#### Integration Testing

- [ ] Kubernetes liveness probe integration works
- [ ] Kubernetes readiness probe integration works
- [ ] Docker health check works
- [ ] Prometheus metrics scrape works
- [ ] Circuit breakers activate correctly on service failures

### 12.2 Go-Live Criteria

| Criterion | Target | Verification |
|-----------|--------|--------------|
| Critical bugs | 0 | Bug tracker |
| High-priority bugs | 0 | Bug tracker |
| Test coverage | >= 80% | Coverage report |
| Documentation | Complete | Review |
| Kubernetes compatibility | Verified | Integration tests |
| Load testing | Passed | Performance report |

### 12.3 Feature Flags

| Flag | Default | Description |
|------|---------|-------------|
| `health.circuitBreakers.enabled` | true | Enable circuit breaker protection |
| `health.probes.enabled` | true | Enable K8s probes |
| `health.metrics.enabled` | true | Enable metrics endpoint |
| `health.database.enabled` | true | Enable database health checks |
| `health.browserbase.enabled` | true | Enable Browserbase health checks |

### 12.4 Rollout Plan

| Phase | Scope | Criteria |
|-------|-------|----------|
| Phase 1 | Internal testing | All tests pass |
| Phase 2 | Staging environment | K8s integration verified |
| Phase 3 | Production (canary) | < 0.1% error rate |
| Phase 4 | Production (full) | Full monitoring active |

### 12.5 Post-Release Monitoring

| Metric | Alert Threshold | Response Time |
|--------|-----------------|---------------|
| Health endpoint errors | > 0.1% | Immediate |
| Probe latency P95 | > 100ms | 15 minutes |
| False positive circuit opens | > 1% | 1 hour |
| Auto-recovery failures | > 5% | 30 minutes |
| Missed service failures | Any | Immediate |

### 12.6 Rollback Plan

| Trigger | Action |
|---------|--------|
| Health endpoint unavailable | Revert deployment |
| K8s probe failures | Revert to previous probes |
| Circuit breakers not activating | Investigate, increase thresholds |
| False positives causing outages | Disable circuit breakers |

---

## Appendix A: Circuit Breaker Configurations

### A.1 Default Configurations

| Service | Failure Threshold | Reset Timeout | Monitoring Window | Success Threshold |
|---------|-------------------|---------------|-------------------|-------------------|
| Vapi | 5 | 60,000ms | 60,000ms | 2 |
| Apify | 3 | 30,000ms | 30,000ms | 2 |
| Browserbase | 5 | 60,000ms | 60,000ms | 2 |
| OpenAI | 10 | 120,000ms | 120,000ms | 3 |
| Anthropic | 10 | 120,000ms | 120,000ms | 3 |
| Gmail | 5 | 60,000ms | 60,000ms | 2 |
| Outlook | 5 | 60,000ms | 60,000ms | 2 |

### A.2 Configuration Rationale

- **Vapi/Gmail/Outlook**: Medium tolerance (5 failures), 1-minute recovery - balanced for transient failures
- **Apify**: Lower tolerance (3 failures), 30-second recovery - web scraping can fail frequently
- **OpenAI/Anthropic**: Higher tolerance (10 failures), 2-minute recovery - critical services, avoid premature opens

---

## Appendix B: Kubernetes Probe Configuration

### B.1 Example Pod Specification

```yaml
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: bottleneck-bots
    image: bottleneck-bots:latest
    livenessProbe:
      httpGet:
        path: /api/trpc/health.liveness
        port: 3000
      initialDelaySeconds: 10
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 3
    readinessProbe:
      httpGet:
        path: /api/trpc/health.readiness
        port: 3000
      initialDelaySeconds: 5
      periodSeconds: 5
      timeoutSeconds: 10
      failureThreshold: 3
```

### B.2 Probe Behavior

| Probe | Purpose | Failure Action |
|-------|---------|----------------|
| Liveness | Is the container alive? | Restart container |
| Readiness | Is the container ready for traffic? | Remove from load balancer |

---

## Appendix C: Metrics Format

### C.1 Prometheus-Compatible Format (Future)

```
# HELP bottleneck_circuit_state Circuit breaker state (0=closed, 1=half-open, 2=open)
# TYPE bottleneck_circuit_state gauge
bottleneck_circuit_state{service="vapi"} 0
bottleneck_circuit_state{service="openai"} 0

# HELP bottleneck_total_requests Total requests through circuit breaker
# TYPE bottleneck_total_requests counter
bottleneck_total_requests{service="vapi"} 1234
bottleneck_total_requests{service="openai"} 5678

# HELP bottleneck_failure_rate Current failure rate (0-1)
# TYPE bottleneck_failure_rate gauge
bottleneck_failure_rate{service="vapi"} 0.01
bottleneck_failure_rate{service="openai"} 0.005
```

---

## Appendix D: Glossary

| Term | Definition |
|------|------------|
| **Circuit Breaker** | Pattern that stops requests to failing services to prevent cascade |
| **CLOSED** | Normal state, requests pass through |
| **OPEN** | Failing state, requests fail immediately |
| **HALF-OPEN** | Testing state, limited requests allowed |
| **Liveness Probe** | K8s probe to detect dead containers |
| **Readiness Probe** | K8s probe to detect containers not ready for traffic |
| **MTTR** | Mean Time To Recovery |
| **SLO** | Service Level Objective |
| **SRE** | Site Reliability Engineering |
| **Cascading Failure** | When one service failure causes other services to fail |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Development Team | Initial PRD creation |

---

**Document Status:** Ready for Review
**Next Review:** 2026-01-18
**Stakeholders:** Engineering, DevOps, SRE, Platform Team
