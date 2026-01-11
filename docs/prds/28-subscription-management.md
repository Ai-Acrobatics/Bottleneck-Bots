# PRD-028: Subscription Management System

**Document Version:** 1.0
**Status:** Draft
**Author:** Development Team
**Last Updated:** January 11, 2026
**Feature Location:** `server/api/routers/subscription.ts`, `server/services/subscription.service.ts`, `drizzle/schema-subscriptions.ts`

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

The Subscription Management System provides comprehensive tier-based pricing, usage-based billing, and feature gating for the Bottleneck Bots platform. It enables agencies to select appropriate subscription tiers based on their automation needs, track usage against limits, and scale their subscriptions as their business grows.

### 1.1 Feature Summary

- **Tier-Based Pricing**: Four distinct subscription tiers (Starter, Growth, Professional, Enterprise) with escalating capabilities
- **Flexible Payment Frequencies**: Weekly, monthly, 6-month, and annual billing options with associated premiums/discounts
- **Usage-Based Limits**: Monthly execution caps, agent slot limits, and concurrent agent restrictions
- **Feature Gating**: Tier-specific feature access (swarm coordination, priority support, custom agents, etc.)
- **Execution Packs**: One-time purchase bundles for additional executions (Boost, Power, Unlimited Month)
- **Agent Add-Ons**: Recurring subscriptions for additional agent slots (+5, +10 agent packs)
- **Usage Tracking**: Real-time monitoring and historical reporting of resource consumption
- **Stripe Integration**: Secure payment processing and subscription lifecycle management
- **Upgrade/Downgrade Workflows**: Seamless tier transitions with proration support

### 1.2 Pricing Structure

| Tier | Monthly Price | Setup Fee | Max Agents | Concurrent | Executions/Mo | GHL Accounts |
|------|---------------|-----------|------------|------------|---------------|--------------|
| Starter | $997 | $497 | 5 | 2 | 200 | 1 |
| Growth | $1,697 | $997 | 10 | 4 | 500 | 5 |
| Professional | $3,197 | $1,997 | 25 | 10 | 1,250 | 20 |
| Enterprise | $4,997 | $2,997 | 50 | 20 | 3,000 | Unlimited |

### 1.3 Payment Frequency Modifiers

| Frequency | Modifier | Billing Cycle |
|-----------|----------|---------------|
| Weekly | +15% premium | 7 days |
| Monthly | Standard | 30 days |
| 6-Month | -5% discount | 180 days |
| Annual | -10% discount | 365 days |

### 1.4 Target Users

- Agency Owners making purchasing decisions
- Finance/Billing Administrators managing payments
- Operations Managers monitoring usage
- Platform Administrators managing subscriptions
- Account Managers advising on tier selection

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Unpredictable Revenue**: Without structured pricing, revenue forecasting and business planning is unreliable
2. **Resource Abuse**: No limits allow heavy users to consume disproportionate platform resources
3. **Feature Fragmentation**: All users access all features regardless of payment level
4. **Manual Billing**: Without automated subscription management, billing operations require manual intervention
5. **Scaling Friction**: Users cannot easily adjust their subscriptions as needs change
6. **Usage Blindness**: No visibility into consumption patterns for users or administrators

### 2.2 User Pain Points

- "I don't know which tier is right for my agency's needs"
- "I want to pay annually for a discount but cannot do so"
- "I hit my execution limit mid-month and cannot complete critical workflows"
- "Upgrading my plan requires contacting support and waiting"
- "I have no visibility into how many executions I've used this month"
- "My team grew but I cannot add more agent slots without upgrading tiers"

### 2.3 Business Impact

| Problem | Impact |
|---------|--------|
| No tier structure | 40% revenue leakage from power users on flat pricing |
| Manual billing | 20 hours/week spent on billing administration |
| No usage limits | Infrastructure costs 3x higher than revenue supports |
| Feature access without payment | 60% of users access premium features without paying |
| No upgrade path | 35% churn when users need more capacity |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Description | Priority |
|------|-------------|----------|
| **G1** | Implement tier-based pricing with clear feature differentiation | P0 |
| **G2** | Enable self-service subscription management (create, upgrade, downgrade) | P0 |
| **G3** | Enforce usage limits with graceful degradation and upsell opportunities | P0 |
| **G4** | Provide real-time usage visibility and historical reporting | P1 |
| **G5** | Integrate Stripe for secure, automated payment processing | P1 |
| **G6** | Support multiple payment frequencies with appropriate pricing | P1 |

### 3.2 Success Metrics (KPIs)

#### Revenue Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Monthly Recurring Revenue (MRR) | Track growth | Sum of active subscription values |
| Average Revenue Per User (ARPU) | >= $1,500/mo | MRR / Active subscribers |
| Upgrade Conversion Rate | >= 25% | Upgrades / Eligible users at limit |
| Churn Rate | < 5% monthly | Cancellations / Active subscribers |
| Annual Commitment Rate | >= 40% | Annual subs / Total subscribers |

#### Usage Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Limit Hit Rate | < 20% | Users hitting limits / Total users |
| Pack Purchase Rate | >= 15% | Pack purchases / Users at limit |
| Average Utilization | 60-80% | Avg executions used / Limit |
| Overage Rate | < 5% | Users exceeding limits / Total |

#### Operational Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Self-Service Rate | >= 95% | Self-service actions / Total |
| Payment Success Rate | >= 98% | Successful payments / Attempts |
| Subscription API Latency (P95) | < 200ms | Server-side response time |
| Billing Error Rate | < 0.1% | Failed billings / Total billings |

#### User Experience Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Time to First Subscription | < 5 minutes | Signup to active subscription |
| Upgrade Time | < 2 minutes | Upgrade initiation to completion |
| Usage Dashboard Load Time | < 1 second | Page load to data rendered |
| NPS (Billing Experience) | >= 50 | Survey responses |

---

## 4. User Stories

### 4.1 Core User Stories

#### US-001: View Available Subscription Tiers
**As a** prospective customer
**I want to** view all available subscription tiers with pricing and features
**So that** I can select the most appropriate plan for my agency

**Acceptance Criteria:**
- All four tiers are displayed with pricing
- Features and limits are clearly listed per tier
- Popular tier is highlighted (Growth)
- Payment frequency options show adjusted pricing
- Comparison view enables side-by-side evaluation

#### US-002: Create New Subscription
**As a** new user
**I want to** subscribe to a tier with my preferred payment frequency
**So that** I can start using the platform's automation features

**Acceptance Criteria:**
- User can select any active tier
- User can choose weekly, monthly, 6-month, or annual billing
- Setup fee is collected on first payment
- Payment method is validated before subscription creation
- Subscription is active immediately upon successful payment
- Confirmation email is sent with subscription details

#### US-003: View Current Subscription Status
**As a** subscriber
**I want to** view my current subscription details and usage
**So that** I can monitor my consumption and plan accordingly

**Acceptance Criteria:**
- Current tier and pricing is displayed
- Payment frequency and next billing date shown
- Executions used vs. limit with visual progress bar
- Agents used vs. limit with breakdown
- Active add-ons and packs listed
- Days remaining in billing period displayed

#### US-004: Upgrade Subscription Tier
**As a** subscriber hitting limits
**I want to** upgrade to a higher tier
**So that** I can access more executions, agents, and features

**Acceptance Criteria:**
- User can initiate upgrade from dashboard
- Tier comparison shows current vs. new tier benefits
- Prorated pricing is calculated and displayed
- Payment method is charged for difference
- New limits apply immediately upon upgrade
- Confirmation is provided with new tier details

#### US-005: Downgrade Subscription Tier
**As a** subscriber with reduced needs
**I want to** downgrade to a lower tier
**So that** I can reduce costs while maintaining essential functionality

**Acceptance Criteria:**
- User can initiate downgrade from settings
- Warning shown if current usage exceeds new tier limits
- Downgrade takes effect at end of current billing period
- Credit is provided for unused portion (if applicable)
- User is notified of features that will be lost
- Confirmation required before processing

### 4.2 Usage Management User Stories

#### US-006: Check Execution Limits Before Task
**As an** automation user
**I want** the system to verify I have executions available
**So that** I know upfront if my task can run

**Acceptance Criteria:**
- Limit check returns allowed/denied status
- If denied, reason is provided (limit reached, subscription expired, etc.)
- Suggested action is included (upgrade, buy pack, wait)
- Check completes in under 100ms

#### US-007: Purchase Execution Pack
**As a** subscriber who hit their monthly limit
**I want to** purchase additional executions
**So that** I can complete urgent automation tasks

**Acceptance Criteria:**
- Available packs are displayed with pricing (Boost $49, Power $129, Unlimited $299)
- User can purchase pack with existing payment method
- Executions are added immediately upon successful payment
- Pack expiration is shown (end of billing period or 30 days)
- Receipt is provided

#### US-008: Add Agent Slots via Add-On
**As a** subscriber needing more concurrent agents
**I want to** purchase additional agent slots
**So that** I can run more complex automation workflows

**Acceptance Criteria:**
- Add-on options displayed (+5 for $197/mo, +10 for $347/mo)
- User can add multiple quantities up to max per user
- Add-on is added to recurring billing
- Agent slots available immediately
- Add-on appears in subscription details

#### US-009: View Usage History
**As an** agency owner
**I want to** view historical usage data
**So that** I can analyze consumption patterns and optimize my subscription

**Acceptance Criteria:**
- Past 6-12 billing periods available
- Executions used vs. limit per period
- Additional purchases shown (packs, add-ons)
- Overage charges displayed if applicable
- Export capability (CSV/PDF)

#### US-010: Cancel Subscription
**As a** subscriber
**I want to** cancel my subscription
**So that** I am not charged after my current billing period

**Acceptance Criteria:**
- User can initiate cancellation from settings
- Cancel at period end option is default (not immediate)
- Cancellation reason is collected
- Confirmation required with clear end date
- Access continues until period end
- Re-activation option available before period end

### 4.3 Administrative User Stories

#### US-011: Manage Subscription Tiers (Admin)
**As an** administrator
**I want to** configure subscription tiers and pricing
**So that** I can adjust offerings as the business evolves

**Acceptance Criteria:**
- Admin can modify tier pricing
- Admin can enable/disable tiers
- Admin can modify feature flags per tier
- Admin can adjust execution/agent limits
- Changes apply to new subscriptions (existing grandfathered)

#### US-012: Seed Default Subscription Data (Admin)
**As an** administrator setting up a new environment
**I want to** seed default subscription tiers, packs, and add-ons
**So that** the platform is ready for subscribers

**Acceptance Criteria:**
- Seed creates all four default tiers
- Seed creates default execution packs (Boost, Power, Unlimited)
- Seed creates default agent add-ons (+5, +10)
- Seed is idempotent (does not duplicate if run twice)
- Admin-only access enforced

---

## 5. Functional Requirements

### 5.1 Tier Management

#### FR-001: Tier Configuration
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Store tier definitions with slug, name, and description | P0 |
| FR-001.2 | Store pricing in cents (monthlyPriceCents, setupFeeCents) | P0 |
| FR-001.3 | Configure payment frequency modifiers (weeklyPremiumPercent, sixMonthDiscountPercent, annualDiscountPercent) | P0 |
| FR-001.4 | Define agent limits (maxAgents, maxConcurrentAgents) | P0 |
| FR-001.5 | Define execution limits (monthlyExecutionLimit, maxExecutionDurationMinutes) | P0 |
| FR-001.6 | Define GHL account limits (maxGhlAccounts, null for unlimited) | P1 |
| FR-001.7 | Store feature flags as JSONB (swarmAccess, prioritySupport, customAgents, etc.) | P0 |
| FR-001.8 | Store allowed strategies as JSONB array | P0 |
| FR-001.9 | Track tier display order (sortOrder) and active status | P0 |
| FR-001.10 | Mark tier as popular for UI highlighting | P1 |

#### FR-002: Tier Retrieval
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Retrieve all active tiers ordered by sortOrder | P0 |
| FR-002.2 | Retrieve single tier by slug | P0 |
| FR-002.3 | Return pricing in dollars (converted from cents) | P0 |
| FR-002.4 | Include discount percentages for each frequency | P0 |
| FR-002.5 | Public endpoint (no auth required) for pricing page | P0 |

### 5.2 Subscription Lifecycle

#### FR-003: Subscription Creation
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Accept tierSlug, paymentFrequency, and optional stripePaymentMethodId | P0 |
| FR-003.2 | Validate tier exists and is active | P0 |
| FR-003.3 | Prevent duplicate subscriptions (one per user) | P0 |
| FR-003.4 | Calculate period end based on payment frequency | P0 |
| FR-003.5 | Store Stripe customer and subscription IDs | P1 |
| FR-003.6 | Initialize usage counters to zero | P0 |
| FR-003.7 | Set subscription status to "active" | P0 |
| FR-003.8 | Return subscription ID on success | P0 |

#### FR-004: Subscription Retrieval
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Retrieve current subscription for authenticated user | P0 |
| FR-004.2 | Include tier details (name, slug, price) | P0 |
| FR-004.3 | Include subscription status and payment frequency | P0 |
| FR-004.4 | Include billing period dates (start, end) | P0 |
| FR-004.5 | Include cancelAtPeriodEnd flag | P0 |
| FR-004.6 | Calculate and return effective limits (base + add-ons) | P0 |
| FR-004.7 | Calculate and return current usage stats | P0 |
| FR-004.8 | Include active execution packs with remaining counts | P1 |
| FR-004.9 | Include active agent add-ons with quantities | P1 |
| FR-004.10 | Calculate days remaining in billing period | P1 |

#### FR-005: Tier Updates (Upgrade/Downgrade)
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Accept newTierSlug for tier change | P0 |
| FR-005.2 | Validate new tier exists | P0 |
| FR-005.3 | Update subscription tier reference | P0 |
| FR-005.4 | Return updated subscription details | P0 |
| FR-005.5 | Handle proration calculations (future: Stripe integration) | P2 |
| FR-005.6 | Log tier change for audit purposes | P1 |

#### FR-006: Subscription Cancellation
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | Set cancelAtPeriodEnd flag | P0 |
| FR-006.2 | Record cancellationReason | P1 |
| FR-006.3 | Record cancelledAt timestamp | P0 |
| FR-006.4 | Maintain access until currentPeriodEnd | P0 |
| FR-006.5 | Allow reactivation before period end | P1 |

### 5.3 Usage Tracking & Limits

#### FR-007: Limit Checking
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | Check execution limits before task execution | P0 |
| FR-007.2 | Check agent limits before spawning agents | P0 |
| FR-007.3 | Check strategy access before swarm creation | P0 |
| FR-007.4 | Return allowed/denied with reason | P0 |
| FR-007.5 | Include currentUsage and limit in response | P0 |
| FR-007.6 | Suggest action when denied (upgrade, buy_pack, wait) | P0 |
| FR-007.7 | Verify subscription is active status | P0 |
| FR-007.8 | Verify within billing period | P0 |

#### FR-008: Usage Increment
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | Increment executionsUsedThisPeriod on task completion | P0 |
| FR-008.2 | Track agentsSpawnedThisPeriod | P1 |
| FR-008.3 | Decrement from additional packs first, then base allocation | P1 |
| FR-008.4 | Update pack executionsRemaining when applicable | P1 |

#### FR-009: Usage History
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009.1 | Retrieve usage history with pagination (limit parameter) | P1 |
| FR-009.2 | Include period start/end dates | P1 |
| FR-009.3 | Include tier name for each period | P1 |
| FR-009.4 | Include execution limit vs. used | P1 |
| FR-009.5 | Calculate percent used | P1 |
| FR-009.6 | Include additional purchases and overages | P1 |

#### FR-010: Period Reset
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-010.1 | Archive current period usage to subscriptionUsageRecords | P1 |
| FR-010.2 | Reset executionsUsedThisPeriod to zero | P0 |
| FR-010.3 | Reset agentsSpawnedThisPeriod to zero | P0 |
| FR-010.4 | Reset additionalExecutions to zero | P0 |
| FR-010.5 | Update currentPeriodStart and currentPeriodEnd | P0 |
| FR-010.6 | Expire packs past their expiresAt date | P1 |

### 5.4 Execution Packs

#### FR-011: Pack Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-011.1 | Define packs with slug, name, description | P1 |
| FR-011.2 | Define executionCount (null for unlimited) | P1 |
| FR-011.3 | Define validForDays (null for until period end) | P1 |
| FR-011.4 | Define pricing in cents | P1 |
| FR-011.5 | Define maxPerMonth purchase limit | P1 |
| FR-011.6 | Retrieve active packs ordered by sortOrder | P1 |

#### FR-012: Pack Purchase
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-012.1 | Validate user has active subscription | P1 |
| FR-012.2 | Validate pack exists and is active | P1 |
| FR-012.3 | Calculate expiration date | P1 |
| FR-012.4 | Create userExecutionPacks record | P1 |
| FR-012.5 | Update subscription additionalExecutions | P1 |
| FR-012.6 | Store Stripe payment intent ID | P1 |
| FR-012.7 | Return purchase details with executionsAdded | P1 |

### 5.5 Agent Add-Ons

#### FR-013: Add-On Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-013.1 | Define add-ons with slug, name, description | P1 |
| FR-013.2 | Define additionalAgents count | P1 |
| FR-013.3 | Define monthlyPriceCents | P1 |
| FR-013.4 | Define maxPerUser limit | P1 |
| FR-013.5 | Retrieve active add-ons ordered by sortOrder | P1 |

#### FR-014: Add-On Purchase
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-014.1 | Validate user has active subscription | P1 |
| FR-014.2 | Validate add-on exists and is active | P1 |
| FR-014.3 | Validate quantity within maxPerUser | P1 |
| FR-014.4 | Create userAgentAddOns record | P1 |
| FR-014.5 | Store Stripe subscription item ID | P2 |
| FR-014.6 | Add to recurring billing | P2 |

### 5.6 Feature Gating

#### FR-015: Feature Access Control
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-015.1 | Check if feature is enabled for user's tier | P0 |
| FR-015.2 | Return boolean for feature access | P0 |
| FR-015.3 | Support features: swarmAccess, prioritySupport, customAgents, apiAccess, webhooks, dedicatedSupport, customIntegrations, sla | P0 |

#### FR-016: Strategy Access Control
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-016.1 | Validate strategy is in tier's allowedStrategies | P0 |
| FR-016.2 | Default strategies: ["auto"] for Starter, ["auto", "research"] for Growth, etc. | P0 |
| FR-016.3 | Return upgrade prompt if strategy not allowed | P0 |

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-001 | Tier listing API response time | < 100ms | P0 |
| NFR-002 | Subscription retrieval response time | < 150ms | P0 |
| NFR-003 | Limit check response time | < 50ms | P0 |
| NFR-004 | Usage increment latency | < 100ms | P0 |
| NFR-005 | Pack/add-on purchase completion | < 3 seconds | P1 |
| NFR-006 | Usage history query (6 months) | < 200ms | P1 |
| NFR-007 | Concurrent subscription operations | 100 ops/second | P1 |

### 6.2 Scalability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-008 | Active subscriptions supported | 100,000+ | P1 |
| NFR-009 | Usage records per user | 24 months history | P1 |
| NFR-010 | Database connection pooling | 50 connections | P0 |
| NFR-011 | Horizontal scaling | Stateless service design | P1 |

### 6.3 Reliability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-012 | Subscription service uptime | 99.9% | P0 |
| NFR-013 | Payment processing availability | 99.95% | P0 |
| NFR-014 | Usage data durability | 99.99% | P0 |
| NFR-015 | Billing accuracy | 100% | P0 |
| NFR-016 | Automatic retry for failed limit increments | 3 attempts | P0 |

### 6.4 Security Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-017 | Subscription endpoints require authentication (protectedProcedure) | P0 |
| NFR-018 | Admin endpoints require admin role | P0 |
| NFR-019 | User can only access own subscription data | P0 |
| NFR-020 | Stripe API keys stored in environment variables only | P0 |
| NFR-021 | Payment card data never stored (Stripe handles) | P0 |
| NFR-022 | Pricing stored in cents to prevent floating point errors | P0 |
| NFR-023 | Input validation via Zod schemas | P0 |
| NFR-024 | Audit logging for subscription changes | P1 |

### 6.5 Observability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-025 | Log all subscription create/update/cancel operations | P0 |
| NFR-026 | Log all limit check failures with context | P0 |
| NFR-027 | Track usage increment operations | P1 |
| NFR-028 | Alert on payment failures | P1 |
| NFR-029 | Dashboard for subscription metrics (MRR, churn, etc.) | P2 |

### 6.6 Maintainability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-030 | Singleton pattern for SubscriptionService | P0 |
| NFR-031 | TypeScript strict mode for all code | P0 |
| NFR-032 | Zod schema validation for all inputs | P0 |
| NFR-033 | Documented API endpoints | P1 |
| NFR-034 | Unit test coverage >= 80% | P1 |
| NFR-035 | Integration tests for Stripe webhooks | P1 |

---

## 7. Technical Architecture

### 7.1 System Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           Client Application                              │
│  (React/Next.js Frontend - Pricing Page, Dashboard, Settings)           │
└─────────────────────────────────────┬────────────────────────────────────┘
                                      │ tRPC
                                      ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     API Layer (tRPC Subscription Router)                  │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                     subscriptionRouter                              │  │
│  │                                                                      │  │
│  │  Public Endpoints:              Protected Endpoints:                 │  │
│  │  - getTiers                     - getMySubscription                 │  │
│  │                                 - create                             │  │
│  │                                 - updateTier                         │  │
│  │                                 - checkLimit                         │  │
│  │                                 - purchasePack                       │  │
│  │                                 - getExecutionPacks                  │  │
│  │                                 - getAgentAddOns                     │  │
│  │                                 - getUsageHistory                    │  │
│  │                                                                      │  │
│  │  Admin Endpoints:                                                    │  │
│  │  - seedDefaults                                                      │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                        SubscriptionService                                │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  Core Methods:                  Limit Methods:                       │  │
│  │  - seedDefaults()               - canExecuteTask()                  │  │
│  │  - getTiers()                   - canSpawnAgent()                   │  │
│  │  - getTierBySlug()              - canUseStrategy()                  │  │
│  │  - getUserSubscription()        - hasFeature()                      │  │
│  │  - createSubscription()                                              │  │
│  │  - updateTier()                 Usage Methods:                       │  │
│  │                                 - incrementExecutionUsage()          │  │
│  │  Pack/Add-On Methods:           - resetMonthlyUsage()               │  │
│  │  - getExecutionPacks()                                               │  │
│  │  - purchaseExecutionPack()                                           │  │
│  │  - getAgentAddOns()                                                  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────┬────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────┐
        ▼                             ▼                         ▼
┌───────────────┐           ┌───────────────────┐      ┌───────────────────┐
│   Database    │           │      Stripe       │      │  Other Services   │
│  (Drizzle)    │           │   (Payment API)   │      │                   │
│               │           │                   │      │ - Agent Service   │
│ Tables:       │           │ - Customers       │      │ - Task Service    │
│ - subscription_│           │ - Subscriptions   │      │ - Swarm Service   │
│   tiers       │           │ - PaymentIntents  │      │                   │
│ - user_       │           │ - Webhooks        │      │ (For limit checks)│
│   subscriptions│           │                   │      │                   │
│ - execution_  │           │                   │      │                   │
│   packs       │           │                   │      │                   │
│ - user_       │           │                   │      │                   │
│   execution_  │           │                   │      │                   │
│   packs       │           │                   │      │                   │
│ - agent_      │           │                   │      │                   │
│   add_ons     │           │                   │      │                   │
│ - user_agent_ │           │                   │      │                   │
│   add_ons     │           │                   │      │                   │
│ - subscription_│           │                   │      │                   │
│   usage_records│           │                   │      │                   │
└───────────────┘           └───────────────────┘      └───────────────────┘
```

### 7.2 Database Schema

```sql
-- Subscription Tiers
CREATE TABLE subscription_tiers (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  monthlyPriceCents INTEGER NOT NULL,
  setupFeeCents INTEGER NOT NULL DEFAULT 0,
  weeklyPremiumPercent INTEGER NOT NULL DEFAULT 15,
  sixMonthDiscountPercent INTEGER NOT NULL DEFAULT 5,
  annualDiscountPercent INTEGER NOT NULL DEFAULT 10,
  maxAgents INTEGER NOT NULL,
  maxConcurrentAgents INTEGER NOT NULL,
  monthlyExecutionLimit INTEGER NOT NULL,
  maxExecutionDurationMinutes INTEGER NOT NULL DEFAULT 60,
  maxGhlAccounts INTEGER,
  features JSONB NOT NULL DEFAULT '{}',
  allowedStrategies JSONB NOT NULL DEFAULT '["auto"]',
  sortOrder INTEGER NOT NULL DEFAULT 0,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  isPopular BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User Subscriptions
CREATE TABLE user_subscriptions (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  tierId INTEGER NOT NULL REFERENCES subscription_tiers(id),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  paymentFrequency VARCHAR(20) NOT NULL DEFAULT 'monthly',
  currentPeriodStart TIMESTAMP NOT NULL,
  currentPeriodEnd TIMESTAMP NOT NULL,
  cancelAtPeriodEnd BOOLEAN NOT NULL DEFAULT FALSE,
  stripeCustomerId VARCHAR(255),
  stripeSubscriptionId VARCHAR(255),
  executionsUsedThisPeriod INTEGER NOT NULL DEFAULT 0,
  agentsSpawnedThisPeriod INTEGER NOT NULL DEFAULT 0,
  additionalAgentSlots INTEGER NOT NULL DEFAULT 0,
  additionalExecutions INTEGER NOT NULL DEFAULT 0,
  trialEndsAt TIMESTAMP,
  cancelledAt TIMESTAMP,
  cancellationReason TEXT,
  metadata JSONB,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Execution Packs
CREATE TABLE execution_packs (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  executionCount INTEGER,
  validForDays INTEGER,
  priceCents INTEGER NOT NULL,
  minTierId INTEGER REFERENCES subscription_tiers(id),
  maxPerMonth INTEGER,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User Execution Packs
CREATE TABLE user_execution_packs (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  packId INTEGER NOT NULL REFERENCES execution_packs(id),
  executionsIncluded INTEGER,
  executionsRemaining INTEGER,
  purchasedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  expiresAt TIMESTAMP,
  pricePaidCents INTEGER NOT NULL,
  stripePaymentIntentId VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  metadata JSONB
);

-- Agent Add-Ons
CREATE TABLE agent_add_ons (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  additionalAgents INTEGER NOT NULL,
  monthlyPriceCents INTEGER NOT NULL,
  minTierId INTEGER REFERENCES subscription_tiers(id),
  maxPerUser INTEGER,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User Agent Add-Ons
CREATE TABLE user_agent_add_ons (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addOnId INTEGER NOT NULL REFERENCES agent_add_ons(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  stripeSubscriptionItemId VARCHAR(255),
  startedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  cancelledAt TIMESTAMP,
  metadata JSONB
);

-- Usage Records
CREATE TABLE subscription_usage_records (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  periodStart TIMESTAMP NOT NULL,
  periodEnd TIMESTAMP NOT NULL,
  tierId INTEGER NOT NULL REFERENCES subscription_tiers(id),
  executionLimit INTEGER NOT NULL,
  agentLimit INTEGER NOT NULL,
  executionsUsed INTEGER NOT NULL DEFAULT 0,
  peakConcurrentAgents INTEGER NOT NULL DEFAULT 0,
  additionalExecutionsPurchased INTEGER NOT NULL DEFAULT 0,
  additionalExecutionsUsed INTEGER NOT NULL DEFAULT 0,
  overageExecutions INTEGER NOT NULL DEFAULT 0,
  overageChargedCents INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 7.3 Data Flow

#### Subscription Creation Flow
```
1. User selects tier and payment frequency on pricing page
                    ▼
2. Frontend calls subscription.create mutation
                    ▼
3. Router validates input (Zod schema)
                    ▼
4. Service checks no existing subscription
                    ▼
5. Service retrieves tier by slug
                    ▼
6. Service calculates period end based on frequency
                    ▼
7. (Future) Stripe creates customer and subscription
                    ▼
8. Database inserts userSubscription record
                    ▼
9. Response returns subscriptionId
                    ▼
10. Frontend redirects to dashboard
```

#### Limit Check Flow
```
1. Task execution initiated
                    ▼
2. Agent service calls subscription.checkLimit
                    ▼
3. Service retrieves user subscription
                    ▼
4. Validates subscription status is "active"
                    ▼
5. Validates within billing period
                    ▼
6. Calculates total limit (base + additional)
                    ▼
7. Compares usage to limit
                    ▼
8. Returns allowed/denied with reason
                    ▼
9. If denied, includes suggestedAction
                    ▼
10. Agent service proceeds or rejects task
```

### 7.4 API Endpoint Reference

| Endpoint | Method | Auth | Input Schema | Response |
|----------|--------|------|--------------|----------|
| `subscription.getTiers` | query | Public | - | { tiers: Tier[] } |
| `subscription.getMySubscription` | query | Protected | - | { subscription, tier, limits, usage } |
| `subscription.create` | mutation | Protected | { tierSlug, paymentFrequency, stripePaymentMethodId? } | { subscriptionId } |
| `subscription.updateTier` | mutation | Protected | { newTierSlug } | { subscriptionId, newTier } |
| `subscription.checkLimit` | query | Protected | { type, value? } | { allowed, reason?, suggestedAction? } |
| `subscription.getExecutionPacks` | query | Protected | - | { packs: Pack[] } |
| `subscription.purchasePack` | mutation | Protected | { packSlug, stripePaymentIntentId? } | { purchaseId, executionsAdded } |
| `subscription.getAgentAddOns` | query | Protected | - | { addOns: AddOn[] } |
| `subscription.getUsageHistory` | query | Protected | { limit } | { history: UsageRecord[] } |
| `subscription.seedDefaults` | mutation | Admin | - | { success } |

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| tRPC Core | `server/_core/trpc.ts` | API router framework |
| Database | `server/db/index.ts` | Drizzle ORM connection |
| User Schema | `drizzle/schema.ts` | User table reference |
| Subscription Schema | `drizzle/schema-subscriptions.ts` | All subscription tables |
| Agent Service | `server/services/agentOrchestrator.service.ts` | Limit checks on task execution |
| Swarm Service | `server/services/swarm/` | Strategy limit checks |

### 8.2 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| @trpc/server | ^11.x | API framework |
| zod | ^3.x | Schema validation |
| drizzle-orm | ^0.30.x | Database ORM |
| stripe | ^14.x | Payment processing (future) |

### 8.3 External Services

| Service | Purpose | Required |
|---------|---------|----------|
| PostgreSQL | Data persistence | Yes |
| Stripe | Payment processing | Yes (Phase 2) |
| Email Provider | Subscription notifications | Yes |

### 8.4 Environment Variables

```bash
# Database
DATABASE_URL=           # PostgreSQL connection string

# Stripe (Phase 2)
STRIPE_SECRET_KEY=      # Stripe API secret key
STRIPE_WEBHOOK_SECRET=  # Webhook endpoint secret
STRIPE_PUBLISHABLE_KEY= # Client-side key

# Pricing Configuration (optional overrides)
DEFAULT_TRIAL_DAYS=     # Trial period length (default: 0)
```

---

## 9. Out of Scope

### 9.1 Excluded from Current Release

| Item | Reason | Future Consideration |
|------|--------|---------------------|
| Full Stripe Integration | Complexity; MVP uses manual/invoice billing | v1.5 |
| Proration Calculations | Requires Stripe integration | v1.5 |
| Coupon/Discount Codes | Lower priority feature | v2.0 |
| Referral Credits | Requires user tracking system | v2.0 |
| Usage-Based Overage Billing | Need to validate pricing model | v2.0 |
| Self-Service Cancellation | Require exit interview first | v1.5 |
| Multi-Currency Support | US-only initially | v3.0 |
| Tax Calculation | Use Stripe Tax | v1.5 |
| Invoice PDF Generation | Use Stripe Invoices | v1.5 |
| Subscription Pause | Complex state management | v2.0 |

### 9.2 Technical Limitations

| Limitation | Description | Workaround |
|------------|-------------|------------|
| Single subscription per user | One active subscription allowed | Multi-tenant model uses sub-accounts |
| No concurrent limit enforcement | Track max agents, not real-time concurrency | Phase 2: Add real-time tracking |
| Manual period reset | Requires cron job to reset periods | Build background job system |
| No webhook retry | Stripe webhooks not yet implemented | Manual intervention |

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Limit check latency impacts UX | Medium | Medium | Cache subscription data, optimize queries |
| Usage counter race conditions | Medium | Medium | Use database transactions, atomic updates |
| Stripe integration complexity | Medium | High | Phase integration, extensive testing |
| Database connection exhaustion | Low | High | Connection pooling, query optimization |
| Period reset failures | Low | High | Automated monitoring, manual recovery tools |

### 10.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Pricing not competitive | Medium | High | Market research, A/B testing |
| High churn on limit hits | Medium | High | Proactive notifications, easy pack purchase |
| Billing disputes | Low | Medium | Clear invoicing, audit trail |
| Free tier abuse | Low | Medium | No free tier; trial with payment method |

### 10.3 Security Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Payment data exposure | Low | Critical | Never store card data; use Stripe |
| Subscription manipulation | Low | High | Server-side validation, audit logging |
| Usage counter tampering | Low | Medium | Database-only tracking, no client trust |
| Privilege escalation | Low | High | Role-based access, tier verification |

### 10.4 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Failed billing notifications | Medium | Medium | Multiple notification channels |
| Tier migration data loss | Low | Medium | Backup before migrations, rollback plan |
| Incorrect limit calculations | Low | High | Unit tests, integration tests |
| Support ticket volume | Medium | Medium | Self-service tools, clear documentation |

---

## 11. Milestones & Timeline

### 11.1 Phase 1: Core Subscription Infrastructure (Weeks 1-3)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M1.1 | Database schema implementation | Week 1 |
| M1.2 | SubscriptionService core methods | Week 1 |
| M1.3 | Tier management API (getTiers, getTierBySlug) | Week 2 |
| M1.4 | Subscription CRUD API (create, get, update) | Week 2 |
| M1.5 | Seed default tiers, packs, add-ons | Week 3 |
| M1.6 | Unit tests for all service methods | Week 3 |

**Exit Criteria:**
- [ ] All database tables created with correct relationships
- [ ] Subscription service singleton operational
- [ ] API endpoints return correct data
- [ ] Default data seeded successfully
- [ ] 80% unit test coverage

### 11.2 Phase 2: Usage Tracking & Limits (Weeks 4-6)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M2.1 | Limit check methods (execution, agent, strategy) | Week 4 |
| M2.2 | Usage increment and tracking | Week 4 |
| M2.3 | Feature gating (hasFeature) | Week 5 |
| M2.4 | Usage history retrieval | Week 5 |
| M2.5 | Integration with Agent/Task services | Week 6 |
| M2.6 | Integration tests for limit enforcement | Week 6 |

**Exit Criteria:**
- [ ] Limit checks execute in < 50ms
- [ ] Usage counters increment correctly
- [ ] Feature flags gate access properly
- [ ] History displays up to 6 months
- [ ] Agent service respects limits

### 11.3 Phase 3: Packs & Add-Ons (Weeks 7-9)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M3.1 | Execution pack retrieval and purchase | Week 7 |
| M3.2 | Agent add-on retrieval | Week 8 |
| M3.3 | Pack expiration and cleanup | Week 8 |
| M3.4 | Additional executions from packs | Week 9 |
| M3.5 | UI for pack/add-on purchase | Week 9 |

**Exit Criteria:**
- [ ] Packs purchasable and applied immediately
- [ ] Pack executions counted correctly
- [ ] Expired packs cleaned up
- [ ] Add-ons increase agent limit

### 11.4 Phase 4: Stripe Integration (Weeks 10-14)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M4.1 | Stripe customer creation | Week 10 |
| M4.2 | Stripe subscription management | Week 11 |
| M4.3 | Webhook handler for payment events | Week 12 |
| M4.4 | Proration for tier changes | Week 13 |
| M4.5 | Automatic renewal processing | Week 14 |

**Exit Criteria:**
- [ ] Customers created in Stripe
- [ ] Subscriptions sync with Stripe
- [ ] Webhooks handle payment success/failure
- [ ] Tier changes prorate correctly

### 11.5 Phase 5: Billing Period Management (Weeks 15-16)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M5.1 | Period reset background job | Week 15 |
| M5.2 | Usage archiving to history table | Week 15 |
| M5.3 | Overdue payment handling | Week 16 |
| M5.4 | Monitoring and alerting | Week 16 |

**Exit Criteria:**
- [ ] Periods reset automatically
- [ ] Usage history preserved
- [ ] Overdue accounts handled gracefully
- [ ] Alerts fire on billing failures

---

## 12. Acceptance Criteria

### 12.1 Feature-Level Acceptance

#### AC-001: Tier Viewing
- [ ] All four tiers displayed on pricing page
- [ ] Prices shown for all payment frequencies
- [ ] Features and limits clearly listed
- [ ] Popular tier visually highlighted
- [ ] Page loads in < 1 second

#### AC-002: Subscription Creation
- [ ] User can select tier and frequency
- [ ] Subscription created immediately on payment
- [ ] Confirmation email sent
- [ ] Dashboard shows active subscription
- [ ] Usage counters start at zero

#### AC-003: Subscription Status View
- [ ] Current tier and price displayed
- [ ] Billing period dates shown
- [ ] Usage progress bar accurate
- [ ] Days remaining calculated correctly
- [ ] Active packs and add-ons listed

#### AC-004: Tier Upgrade
- [ ] User can upgrade from dashboard
- [ ] New limits apply immediately
- [ ] Confirmation message displayed
- [ ] Audit log records change

#### AC-005: Limit Enforcement
- [ ] Execution limit checked before each task
- [ ] Clear error message when limit reached
- [ ] Suggested action (upgrade/pack) provided
- [ ] Task blocked when over limit

#### AC-006: Pack Purchase
- [ ] Available packs displayed with pricing
- [ ] Purchase completes in < 3 seconds
- [ ] Executions added immediately
- [ ] Pack appears in subscription details
- [ ] Expiration date shown

#### AC-007: Usage History
- [ ] Past 6 billing periods retrievable
- [ ] Executions used vs limit shown
- [ ] Percentage calculated correctly
- [ ] Data matches actual usage

### 12.2 Integration Acceptance

- [ ] Agent service checks limits before execution
- [ ] Swarm service respects strategy limits
- [ ] Task execution increments usage counter
- [ ] Feature flags gate UI elements
- [ ] All endpoints respond within SLA

### 12.3 Quality Acceptance

- [ ] Unit test coverage >= 80%
- [ ] Integration tests for all API endpoints
- [ ] No P0/P1 bugs in production
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Documentation complete

---

## Appendix A: Default Tier Configuration

### Starter Tier ($997/month)
```json
{
  "slug": "starter",
  "name": "Starter",
  "description": "Perfect for small agencies and solopreneurs",
  "monthlyPriceCents": 99700,
  "setupFeeCents": 49700,
  "maxAgents": 5,
  "maxConcurrentAgents": 2,
  "monthlyExecutionLimit": 200,
  "maxExecutionDurationMinutes": 30,
  "maxGhlAccounts": 1,
  "features": {
    "swarmAccess": false,
    "prioritySupport": false,
    "customAgents": false,
    "apiAccess": true,
    "webhooks": true
  },
  "allowedStrategies": ["auto"]
}
```

### Growth Tier ($1,697/month)
```json
{
  "slug": "growth",
  "name": "Growth",
  "description": "For growing agencies scaling their operations",
  "monthlyPriceCents": 169700,
  "setupFeeCents": 99700,
  "maxAgents": 10,
  "maxConcurrentAgents": 4,
  "monthlyExecutionLimit": 500,
  "maxExecutionDurationMinutes": 45,
  "maxGhlAccounts": 5,
  "features": {
    "swarmAccess": true,
    "prioritySupport": false,
    "customAgents": false,
    "apiAccess": true,
    "webhooks": true
  },
  "allowedStrategies": ["auto", "research"],
  "isPopular": true
}
```

### Professional Tier ($3,197/month)
```json
{
  "slug": "professional",
  "name": "Professional",
  "description": "Full automation suite for established agencies",
  "monthlyPriceCents": 319700,
  "setupFeeCents": 199700,
  "maxAgents": 25,
  "maxConcurrentAgents": 10,
  "monthlyExecutionLimit": 1250,
  "maxExecutionDurationMinutes": 60,
  "maxGhlAccounts": 20,
  "features": {
    "swarmAccess": true,
    "prioritySupport": true,
    "customAgents": true,
    "apiAccess": true,
    "webhooks": true
  },
  "allowedStrategies": ["auto", "research", "development", "analysis"]
}
```

### Enterprise Tier ($4,997/month)
```json
{
  "slug": "enterprise",
  "name": "Enterprise",
  "description": "White-glove service for large agencies",
  "monthlyPriceCents": 499700,
  "setupFeeCents": 299700,
  "maxAgents": 50,
  "maxConcurrentAgents": 20,
  "monthlyExecutionLimit": 3000,
  "maxExecutionDurationMinutes": 120,
  "maxGhlAccounts": null,
  "features": {
    "swarmAccess": true,
    "prioritySupport": true,
    "customAgents": true,
    "apiAccess": true,
    "webhooks": true,
    "dedicatedSupport": true,
    "customIntegrations": true,
    "sla": true
  },
  "allowedStrategies": ["auto", "research", "development", "analysis", "deployment"]
}
```

---

## Appendix B: Default Execution Packs

| Pack | Price | Executions | Validity |
|------|-------|------------|----------|
| Boost | $49 | 100 | Until period end |
| Power | $129 | 300 | Until period end |
| Unlimited Month | $299 | Unlimited | 30 days |

---

## Appendix C: Default Agent Add-Ons

| Add-On | Monthly Price | Additional Agents | Max Per User |
|--------|---------------|-------------------|--------------|
| +5 Agent Slots | $197 | 5 | 4 |
| +10 Agent Slots | $347 | 10 | 2 |

---

## Appendix D: Glossary

| Term | Definition |
|------|------------|
| **Billing Period** | Time span covered by a single payment (weekly, monthly, 6-month, annual) |
| **Execution** | A single AI agent task run to completion |
| **Execution Pack** | One-time purchase bundle of additional executions |
| **Agent Add-On** | Recurring subscription for additional agent slots |
| **GHL Account** | GoHighLevel integration connection |
| **Swarm** | Multi-agent coordination for complex objectives |
| **Strategy** | Swarm execution mode (auto, research, development, analysis, deployment) |
| **Proration** | Adjusting charges when changing plans mid-period |
| **Overage** | Usage beyond subscription limits |
| **MRR** | Monthly Recurring Revenue |
| **ARPU** | Average Revenue Per User |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Development Team | Initial PRD creation |

---

**Document Status:** Ready for Review
**Next Review:** 2026-01-18
**Stakeholders:** Engineering, Product, Finance, Customer Success
