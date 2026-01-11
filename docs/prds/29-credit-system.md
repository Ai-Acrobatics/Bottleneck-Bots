# PRD-029: Credit System

**Document Version:** 1.0
**Status:** Draft
**Author:** Development Team
**Last Updated:** January 11, 2026
**Feature Location:** `server/api/routers/credits.ts`, `server/services/credit.service.ts`

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

The Credit System provides a comprehensive, usage-based billing mechanism for Bottleneck-Bots platform services. It manages credit allocation, consumption tracking, package purchasing, and balance enforcement across three primary credit types: Enrichment, Calling, and Scraping.

### 1.1 Feature Summary

- **Multi-Type Credit Management**: Separate credit pools for enrichment, calling, and scraping operations
- **Credit Allocation Per Subscription**: Automatic credit grants based on subscription tier
- **Per-Action Credit Deduction**: Real-time credit consumption for SEO, enrichment, and automation actions
- **Transaction Tracking**: Complete audit trail of all credit movements (purchases, usage, refunds, adjustments)
- **Insufficient Balance Prevention**: Pre-execution balance checks with graceful handling
- **Credit Reset Schedules**: Periodic credit refresh aligned with billing cycles
- **Usage Analytics**: Comprehensive reporting on credit consumption patterns
- **Stripe Integration**: Secure payment processing for credit package purchases
- **Admin Controls**: Manual credit adjustments and package management

### 1.2 Target Users

| User Type | Description | Primary Use Cases |
|-----------|-------------|-------------------|
| **Agency Owners** | Primary account holders purchasing credits | Credit purchases, usage monitoring, budget planning |
| **Team Members** | Agency staff consuming credits | SEO operations, lead enrichment, AI calling |
| **Administrators** | Platform operators | Credit adjustments, package management, refund processing |
| **Finance Teams** | Billing and accounting staff | Transaction reporting, cost analysis |

### 1.3 Credit Types

| Credit Type | Purpose | Typical Actions |
|-------------|---------|-----------------|
| **Enrichment** | Lead data enhancement | LinkedIn enrichment, company lookup, contact verification |
| **Calling** | AI voice operations | Outbound calls, voicemail drops, call campaigns |
| **Scraping** | Web data extraction | Browser automation, page scraping, data harvesting |

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Unpredictable Costs**: Agencies struggle to predict and control automation costs without clear usage tracking
2. **No Usage Visibility**: Users lack real-time insight into their credit consumption patterns
3. **Overspending Risk**: No safeguards prevent operations from proceeding without sufficient credits
4. **Manual Billing Complexity**: Without credits, billing requires complex per-action invoicing
5. **Inflexible Pricing**: All-you-can-eat models lead to unprofitable power users
6. **No Top-Up Options**: Users cannot purchase additional credits when limits are reached

### 2.2 User Pain Points

- "I don't know how much budget I have left for lead enrichment this month"
- "My team ran expensive operations that exceeded our plan limits"
- "I need to buy more credits immediately but have to wait for next billing cycle"
- "I cannot see which specific operations consumed my credits"
- "There's no way to set spending limits for my team members"
- "Refund processing for failed operations takes too long"

### 2.3 Business Impact

| Problem | Impact |
|---------|--------|
| Cost unpredictability | 35% of users express budget concerns in surveys |
| No usage controls | 15% of users exceed intended spending |
| Billing complexity | 20+ hours/month manual invoicing work |
| User churn | 25% cancellation rate cites cost concerns |
| Revenue leakage | Unlimited plans lose ~$500/user/month on power users |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Description | Priority |
|------|-------------|----------|
| **G1** | Implement transparent usage-based billing with real-time tracking | P0 |
| **G2** | Prevent service execution without sufficient credits | P0 |
| **G3** | Enable self-service credit purchasing with Stripe | P0 |
| **G4** | Provide comprehensive transaction history and analytics | P1 |
| **G5** | Support subscription-based credit allocation and resets | P1 |
| **G6** | Enable admin credit management and adjustments | P1 |
| **G7** | Implement credit-based rate limiting and quotas | P2 |

### 3.2 Success Metrics (KPIs)

#### Transaction Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Credit Purchase Conversion | >= 30% | Users who purchase additional credits |
| Transaction Processing Time | < 2 seconds | Time from request to balance update |
| Webhook Processing Success | >= 99.5% | Stripe webhooks successfully processed |
| Balance Accuracy | 100% | Audited balance vs. calculated balance |

#### User Experience Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Credit Usage Visibility Score | >= 4.5/5 | User satisfaction survey |
| Top-Up Completion Rate | >= 85% | Started vs. completed purchases |
| Time to Credit Availability | < 30 seconds | Payment to credit access |
| Dashboard Engagement | >= 70% | Users viewing credit balance weekly |

#### Business Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Revenue Per User | >= 15% increase | Average revenue per active user |
| Credit Utilization Rate | >= 75% | Credits used vs. credits purchased |
| Support Ticket Reduction | >= 40% | Billing-related support tickets |
| User Retention | >= 10% improvement | Monthly retention rate |

#### System Performance Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Balance Check Latency (P95) | < 50ms | Server-side response time |
| Credit Deduction Latency (P95) | < 100ms | Time for deduction operation |
| Database Transaction Success | >= 99.99% | Successful atomic operations |
| Cache Hit Rate | >= 90% | Balance lookups served from cache |

---

## 4. User Stories

### 4.1 Core User Stories

#### US-001: View Credit Balance
**As an** agency owner
**I want to** see my current credit balance for each credit type
**So that** I can monitor my remaining capacity and plan accordingly

**Acceptance Criteria:**
- Display current balance for enrichment, calling, and scraping credits
- Show total purchased and total used credits lifetime
- Update balance in real-time after transactions
- Accessible from main dashboard and dedicated credits page

#### US-002: Purchase Credit Package
**As an** agency owner
**I want to** purchase additional credits through a secure checkout
**So that** I can continue operations when credits run low

**Acceptance Criteria:**
- View available credit packages with clear pricing
- Select package and proceed to Stripe checkout
- Credits added to account within 30 seconds of payment
- Receive email confirmation with transaction details
- Transaction recorded in history

#### US-003: Check Balance Before Action
**As a** system process
**I want to** verify sufficient credits before executing an action
**So that** users don't experience failures mid-operation

**Acceptance Criteria:**
- Balance check completes in < 50ms
- Return clear insufficient balance error with shortfall amount
- Suggest relevant credit packages when balance is low
- Block action execution if credits insufficient
- Log all balance check attempts

#### US-004: View Transaction History
**As an** agency owner
**I want to** see a complete history of credit transactions
**So that** I can understand my spending patterns and verify charges

**Acceptance Criteria:**
- List all transactions with date, type, amount, and balance after
- Filter by credit type and transaction type
- Pagination for large transaction volumes
- Export capability for accounting purposes
- Link transactions to source operations where applicable

#### US-005: Automatic Credit Deduction
**As a** system process
**I want to** automatically deduct credits when actions complete
**So that** usage is accurately tracked without manual intervention

**Acceptance Criteria:**
- Deduction occurs atomically with action completion
- Record reference to source action (lead ID, call ID, etc.)
- Update user balance in real-time
- Invalidate any cached balance values
- Handle concurrent deductions safely

### 4.2 Advanced User Stories

#### US-006: Subscription Credit Allocation
**As an** agency owner with a subscription
**I want to** receive monthly credit allocation based on my tier
**So that** I have a predictable credit budget each billing period

**Acceptance Criteria:**
- Credits allocated at start of billing period
- Amount based on subscription tier
- Unused credits handled per policy (expire/rollover)
- Notification sent when credits allocated
- Visible in transaction history as allocation type

#### US-007: Credit Usage Analytics
**As an** agency owner
**I want to** see analytics on my credit usage patterns
**So that** I can optimize operations and budget appropriately

**Acceptance Criteria:**
- Daily/weekly/monthly usage breakdown
- Usage by credit type with charts
- Average daily consumption calculated
- Projected depletion date based on current rate
- Comparison to previous periods

#### US-008: Admin Credit Adjustment
**As an** administrator
**I want to** manually adjust user credits (add or remove)
**So that** I can handle refunds, compensations, and corrections

**Acceptance Criteria:**
- Add positive or negative adjustments
- Require reason/description for audit trail
- Record adjustment with admin user ID
- Support all credit types
- Notification sent to affected user

#### US-009: Insufficient Balance Notification
**As an** agency owner
**I want to** receive alerts when credits fall below threshold
**So that** I can purchase more credits before operations are blocked

**Acceptance Criteria:**
- Configurable low balance threshold per credit type
- Email notification when threshold crossed
- In-app notification with quick purchase link
- Daily digest option vs. immediate alerts
- Threshold can be set as percentage or absolute value

#### US-010: Credit Refund Processing
**As an** administrator
**I want to** refund credits for failed or cancelled operations
**So that** users are not charged for unsuccessful actions

**Acceptance Criteria:**
- Refund linked to original transaction
- Prevent duplicate refunds for same transaction
- Restore credits to user balance
- Record refund reason and metadata
- Support partial refunds where applicable

#### US-011: Credit Package Management
**As an** administrator
**I want to** create and manage credit packages
**So that** I can offer different purchasing options to users

**Acceptance Criteria:**
- Create packages with name, credit amount, price, type
- Set packages as active or inactive
- Control display order on purchase page
- Edit existing package details
- Archive packages without deleting history

#### US-012: Credit Reset on Billing Cycle
**As a** system process
**I want to** reset or refresh credits on subscription renewal
**So that** users receive their allocated credits each billing period

**Acceptance Criteria:**
- Trigger reset at billing period start
- Handle rollover credits per subscription policy
- Create transaction record for reset operation
- Notify user of new credit allocation
- Handle prorated scenarios for mid-cycle changes

---

## 5. Functional Requirements

### 5.1 Credit Balance Management

#### FR-001: Balance Operations
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Maintain separate credit balances per user per credit type (enrichment, calling, scraping) | P0 |
| FR-001.2 | Support balance retrieval with 60-second cache TTL for performance | P0 |
| FR-001.3 | Track lifetime totals: totalPurchased and totalUsed per credit type | P0 |
| FR-001.4 | Auto-initialize credit record with zero balance for new credit types | P1 |
| FR-001.5 | Support balance queries for all credit types in single request | P0 |

#### FR-002: Balance Checks
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Provide checkBalance method returning boolean with cached balance lookup | P0 |
| FR-002.2 | Return detailed response: hasSufficient, balance, required, shortfall | P0 |
| FR-002.3 | Cache invalidation on any balance-modifying operation | P0 |
| FR-002.4 | Support concurrent balance check requests without race conditions | P1 |

### 5.2 Credit Transactions

#### FR-003: Credit Addition (Purchase, Allocation, Adjustment)
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Add credits atomically within database transaction | P0 |
| FR-003.2 | Validate amount is positive for additions | P0 |
| FR-003.3 | Update totalPurchased for purchase-type transactions | P0 |
| FR-003.4 | Record transaction with: amount, type, description, metadata, balanceAfter | P0 |
| FR-003.5 | Support transaction types: purchase, usage, refund, adjustment | P0 |
| FR-003.6 | Invalidate cache immediately after successful addition | P0 |

#### FR-004: Credit Deduction (Usage)
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Deduct credits atomically within database transaction | P0 |
| FR-004.2 | Verify sufficient balance before deduction | P0 |
| FR-004.3 | Throw clear error with required vs. available amounts on insufficient balance | P0 |
| FR-004.4 | Update totalUsed counter on successful deduction | P0 |
| FR-004.5 | Record negative amount in transaction for deductions | P0 |
| FR-004.6 | Support referenceId and referenceType for linking to source operations | P1 |
| FR-004.7 | Invalidate cache immediately after successful deduction | P0 |

#### FR-005: Credit Refunds
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Refund by transaction ID | P0 |
| FR-005.2 | Validate original transaction exists and is refundable (usage or purchase) | P0 |
| FR-005.3 | Prevent duplicate refunds for same transaction | P0 |
| FR-005.4 | Record refund with reference to original transaction in metadata | P0 |
| FR-005.5 | Support partial refunds with specific amount | P2 |

#### FR-006: Transaction History
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | Query transaction history by userId with pagination (limit, offset) | P0 |
| FR-006.2 | Filter transactions by creditType | P0 |
| FR-006.3 | Order transactions by createdAt descending (newest first) | P0 |
| FR-006.4 | Return total count for pagination UI | P0 |
| FR-006.5 | Include all transaction fields: id, type, amount, balanceAfter, description, metadata | P0 |

### 5.3 Credit Packages

#### FR-007: Package Retrieval
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | List all active packages ordered by sortOrder | P0 |
| FR-007.2 | Filter packages by creditType | P0 |
| FR-007.3 | Include package details: name, description, creditAmount, price, type | P0 |
| FR-007.4 | Public endpoint for pricing page (no auth required) | P0 |
| FR-007.5 | Support filtering active vs. inactive packages | P1 |

#### FR-008: Package Management (Admin)
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | Create new packages with all required fields | P0 |
| FR-008.2 | Update existing package properties | P0 |
| FR-008.3 | Toggle package isActive status | P0 |
| FR-008.4 | Set package sortOrder for display ordering | P1 |
| FR-008.5 | Store arbitrary metadata in JSONB field | P2 |

### 5.4 Purchase Flow

#### FR-009: Stripe Checkout Integration
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009.1 | Create Stripe Checkout session for package purchase | P0 |
| FR-009.2 | Validate package exists and is active before checkout | P0 |
| FR-009.3 | Include metadata: userId, packageId, creditType, creditAmount | P0 |
| FR-009.4 | Support configurable successUrl and cancelUrl | P0 |
| FR-009.5 | Return checkoutUrl and sessionId to client | P0 |

#### FR-010: Webhook Processing
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-010.1 | Handle checkout.session.completed event | P0 |
| FR-010.2 | Extract metadata and fulfill credits | P0 |
| FR-010.3 | Handle charge.refunded event for Stripe refunds | P1 |
| FR-010.4 | Log all webhook events with details | P0 |
| FR-010.5 | Implement webhook signature verification | P0 |
| FR-010.6 | Provide manual fulfillment endpoint for recovery | P1 |

### 5.5 Usage Statistics

#### FR-011: Analytics Queries
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-011.1 | Calculate totalUsed, totalPurchased, balance for date range | P0 |
| FR-011.2 | Compute average daily usage within date range | P0 |
| FR-011.3 | Count transactions within date range | P0 |
| FR-011.4 | Support filtering by creditType | P0 |
| FR-011.5 | Support custom date ranges (startDate, endDate) | P1 |

### 5.6 Admin Operations

#### FR-012: Credit Adjustments
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-012.1 | Support positive adjustments (credit grants) | P0 |
| FR-012.2 | Support negative adjustments (credit removals) | P0 |
| FR-012.3 | Require description for all adjustments | P0 |
| FR-012.4 | Store optional metadata for audit context | P1 |
| FR-012.5 | Return new balance after adjustment | P0 |
| FR-012.6 | Restrict to admin role only | P0 |

### 5.7 Subscription Integration

#### FR-013: Credit Allocation
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-013.1 | Define credit allocation per subscription tier | P1 |
| FR-013.2 | Auto-allocate credits on subscription creation | P1 |
| FR-013.3 | Allocate credits on billing period renewal | P1 |
| FR-013.4 | Handle tier upgrades with prorated allocations | P2 |
| FR-013.5 | Handle tier downgrades with policy-based adjustments | P2 |

#### FR-014: Credit Reset
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-014.1 | Reset credits at billing period start | P1 |
| FR-014.2 | Support rollover credits per tier policy | P2 |
| FR-014.3 | Record reset transaction in history | P1 |
| FR-014.4 | Notify user of credit refresh | P2 |

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-001 | Balance check response time (P95) | < 50ms | P0 |
| NFR-002 | Credit deduction operation time (P95) | < 100ms | P0 |
| NFR-003 | Transaction history query time (P95) | < 200ms | P0 |
| NFR-004 | Stripe checkout creation time | < 3 seconds | P0 |
| NFR-005 | Webhook processing time | < 5 seconds | P0 |
| NFR-006 | Cache hit rate for balance lookups | >= 90% | P1 |
| NFR-007 | Concurrent transaction handling | 1000 tx/second | P1 |

### 6.2 Scalability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-008 | Users supported per database instance | 100,000+ | P1 |
| NFR-009 | Transactions per user per month | 10,000+ | P1 |
| NFR-010 | Horizontal scaling for credit service | Stateless design | P1 |
| NFR-011 | Database connection pooling | Max 50 per instance | P0 |

### 6.3 Reliability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-012 | Balance operation atomicity | 100% (ACID) | P0 |
| NFR-013 | System uptime | 99.9% | P0 |
| NFR-014 | Webhook delivery success | >= 99.5% | P0 |
| NFR-015 | Data durability | 99.99% | P0 |
| NFR-016 | Zero negative balances | 100% prevention | P0 |

### 6.4 Security Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-017 | All credit operations require authentication (protectedProcedure) | P0 |
| NFR-018 | Admin operations restricted to admin role (adminProcedure) | P0 |
| NFR-019 | User can only access own credit data (userId validation) | P0 |
| NFR-020 | Stripe webhook signature verification in production | P0 |
| NFR-021 | API keys stored in environment variables only | P0 |
| NFR-022 | PCI compliance for payment handling (via Stripe) | P0 |
| NFR-023 | All inputs validated via Zod schemas | P0 |
| NFR-024 | SQL injection prevention via parameterized queries (Drizzle) | P0 |

### 6.5 Observability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-025 | Log all credit transactions with context | P0 |
| NFR-026 | Log Stripe webhook events | P0 |
| NFR-027 | Alert on failed webhook processing | P1 |
| NFR-028 | Monitor balance discrepancies | P1 |
| NFR-029 | Track purchase conversion funnel | P2 |
| NFR-030 | Dashboard for credit system health | P2 |

### 6.6 Maintainability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-031 | TypeScript strict mode with full type coverage | P0 |
| NFR-032 | Zod schema validation for all API inputs | P0 |
| NFR-033 | Unit test coverage >= 80% | P1 |
| NFR-034 | Integration tests for all credit operations | P1 |
| NFR-035 | Modular service architecture (CreditService class) | P0 |
| NFR-036 | Comprehensive JSDoc documentation | P1 |

---

## 7. Technical Architecture

### 7.1 System Overview

```
+-------------------------------------------------------------------+
|                        Client Application                          |
|  (React Frontend with tRPC Client)                                 |
+----------------------------------+--------------------------------+
                                   | tRPC
                                   v
+-------------------------------------------------------------------+
|                     API Layer (tRPC Routers)                       |
|  +-----------------+  +-------------------+  +------------------+  |
|  | creditsRouter   |  | marketplaceRouter |  | stripeWebhook    |  |
|  | - getBalances   |  | - getProducts     |  | - handleWebhook  |  |
|  | - getBalance    |  | - createCheckout  |  | - fulfillSession |  |
|  | - purchaseCredits|  | - verifyCheckout  |  |                  |  |
|  | - checkBalance  |  |                   |  |                  |  |
|  | - getHistory    |  |                   |  |                  |  |
|  | - getUsageStats |  |                   |  |                  |  |
|  | - createPackage |  |                   |  |                  |  |
|  | - adjustCredits |  |                   |  |                  |  |
|  +-----------------+  +-------------------+  +------------------+  |
+----------------------------------+--------------------------------+
                                   |
                                   v
+-------------------------------------------------------------------+
|                      Service Layer                                 |
|  +-------------------------------------------------------------+  |
|  |                     CreditService                            |  |
|  |  - getAllBalances()      - getTransactionHistory()          |  |
|  |  - getBalance()          - getUsageStats()                  |  |
|  |  - checkBalance()        - refundCredits()                  |  |
|  |  - addCredits()          - adjustCredits()                  |  |
|  |  - deductCredits()                                          |  |
|  +-------------------------------------------------------------+  |
|                              |                                    |
|         +--------------------+--------------------+               |
|         v                                         v               |
|  +------------------+                    +------------------+     |
|  |  Cache Service   |                    |  Stripe SDK      |     |
|  |  (Redis/Memory)  |                    |  Payment Gateway |     |
|  +------------------+                    +------------------+     |
+----------------------------------+--------------------------------+
                                   |
                                   v
+-------------------------------------------------------------------+
|                      Database Layer (Drizzle ORM)                  |
|  +----------------+  +-------------------+  +------------------+  |
|  | user_credits   |  | credit_packages   |  | credit_transactions| |
|  | - userId       |  | - id              |  | - id               | |
|  | - creditType   |  | - name            |  | - userId           | |
|  | - balance      |  | - creditAmount    |  | - creditType       | |
|  | - totalPurchased| | - price           |  | - transactionType  | |
|  | - totalUsed    |  | - creditType      |  | - amount           | |
|  +----------------+  | - isActive        |  | - balanceAfter     | |
|                      +-------------------+  | - metadata         | |
|                                             +------------------+  |
+-------------------------------------------------------------------+
```

### 7.2 Component Details

#### 7.2.1 Credits Router (`credits.ts`)

Primary API interface for credit operations.

**Public Procedures:**
- `getBalances`: Returns all credit type balances for authenticated user
- `getBalance`: Returns specific credit type balance
- `getPackages`: Lists available credit packages (public access)
- `purchaseCredits`: Process package purchase (placeholder for direct payment)
- `createCheckoutSession`: Create Stripe Checkout session
- `getTransactionHistory`: Paginated transaction list
- `getUsageStats`: Aggregated usage statistics
- `checkBalance`: Verify sufficient credits for operation

**Admin Procedures:**
- `createPackage`: Create new credit package
- `updatePackage`: Modify existing package
- `adjustCredits`: Manual credit adjustment

#### 7.2.2 Credit Service (`credit.service.ts`)

Core business logic for credit management.

**Key Methods:**

```typescript
class CreditService {
  // Balance operations
  async getAllBalances(userId: number): Promise<Record<CreditType, CreditBalance>>;
  async getBalance(userId: number, creditType: CreditType): Promise<number>;
  async checkBalance(userId: number, creditType: CreditType, required: number): Promise<boolean>;

  // Credit modifications
  async addCredits(userId, amount, creditType, description, transactionType, metadata?): Promise<void>;
  async deductCredits(userId, amount, creditType, description, referenceId?, referenceType?, metadata?): Promise<void>;
  async refundCredits(transactionId: number): Promise<void>;
  async adjustCredits(userId, amount, creditType, description, metadata?): Promise<void>;

  // History & analytics
  async getTransactionHistory(userId, creditType?, limit?, offset?): Promise<CreditTransaction[]>;
  async getUsageStats(userId, creditType, startDate?, endDate?): Promise<UsageStats>;
}
```

**Key Features:**
- Database transactions for atomicity
- 60-second cache TTL for balance lookups
- Automatic cache invalidation on modifications
- Comprehensive error handling with descriptive messages

#### 7.2.3 Database Schema

```sql
-- User credit balances
CREATE TABLE user_credits (
  id SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES users(id) NOT NULL,
  creditType VARCHAR(50) NOT NULL,  -- enrichment, calling, scraping
  balance INTEGER DEFAULT 0 NOT NULL,
  totalPurchased INTEGER DEFAULT 0 NOT NULL,
  totalUsed INTEGER DEFAULT 0 NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW() NOT NULL,
  updatedAt TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(userId, creditType)
);

-- Available credit packages
CREATE TABLE credit_packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  creditAmount INTEGER NOT NULL,
  price INTEGER NOT NULL,  -- cents
  creditType VARCHAR(50) NOT NULL,
  isActive BOOLEAN DEFAULT TRUE NOT NULL,
  sortOrder INTEGER DEFAULT 0 NOT NULL,
  metadata JSONB,
  createdAt TIMESTAMP DEFAULT NOW() NOT NULL,
  updatedAt TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Transaction history
CREATE TABLE credit_transactions (
  id SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES users(id) NOT NULL,
  creditType VARCHAR(50) NOT NULL,
  transactionType VARCHAR(50) NOT NULL,  -- purchase, usage, refund, adjustment
  amount INTEGER NOT NULL,  -- positive or negative
  balanceAfter INTEGER NOT NULL,
  description TEXT NOT NULL,
  referenceId VARCHAR(255),
  referenceType VARCHAR(50),
  metadata JSONB,
  createdAt TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_user_credits_user ON user_credits(userId);
CREATE INDEX idx_user_credits_type ON user_credits(userId, creditType);
CREATE INDEX idx_transactions_user ON credit_transactions(userId);
CREATE INDEX idx_transactions_user_type ON credit_transactions(userId, creditType);
CREATE INDEX idx_transactions_created ON credit_transactions(createdAt DESC);
```

### 7.3 Data Flow

#### Purchase Flow
```
1. User selects package on pricing page
                    |
2. Client calls createCheckoutSession(packageId)
                    |
3. Router validates package exists and is active
                    |
4. Stripe Checkout session created with metadata
                    |
5. Return checkoutUrl to client
                    |
6. Client redirects to Stripe Checkout
                    |
7. User completes payment
                    |
8. Stripe sends checkout.session.completed webhook
                    |
9. Webhook handler extracts metadata
                    |
10. CreditService.addCredits() called
                    |
11. Database transaction: update balance, create transaction record
                    |
12. Cache invalidated
                    |
13. User redirected to success page with updated balance
```

#### Deduction Flow
```
1. Service calls checkBalance(userId, type, required)
                    |
2. Balance retrieved from cache (hit) or database (miss)
                    |
3. If insufficient: return false with shortfall
                    |
4. If sufficient: proceed with deductCredits()
                    |
5. Database transaction:
   - Verify balance (double-check)
   - Deduct from balance
   - Increment totalUsed
   - Create transaction record
                    |
6. Cache invalidated
                    |
7. Return success to calling service
```

### 7.4 Caching Strategy

| Data | Cache Key Pattern | TTL | Invalidation |
|------|-------------------|-----|--------------|
| Balance | `user_credits:{userId}:{creditType}` | 60s | On any modification |
| Packages | `credit_packages:active` | 300s | On package update |
| History | Not cached | - | - |

### 7.5 API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `credits.getBalances` | query | user | Get all credit balances |
| `credits.getBalance` | query | user | Get specific credit type balance |
| `credits.getPackages` | query | public | List available packages |
| `credits.purchaseCredits` | mutation | user | Direct purchase (placeholder) |
| `credits.createCheckoutSession` | mutation | user | Create Stripe Checkout |
| `credits.getTransactionHistory` | query | user | Get transaction history |
| `credits.getUsageStats` | query | user | Get usage statistics |
| `credits.checkBalance` | query | user | Verify sufficient credits |
| `credits.createPackage` | mutation | admin | Create new package |
| `credits.updatePackage` | mutation | admin | Update package |
| `credits.adjustCredits` | mutation | admin | Manual credit adjustment |

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| tRPC Core | `server/_core/trpc.ts` | API router framework, auth procedures |
| Database | `server/db/index.ts` | Drizzle ORM connection |
| Cache Service | `server/services/cache.service.ts` | Balance caching |
| Cache Keys | `server/lib/cacheKeys.ts` | Cache key patterns |
| Schema | `drizzle/schema-lead-enrichment.ts` | Credit table definitions |
| Users Schema | `drizzle/schema.ts` | User table reference |

### 8.2 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| stripe | ^14.x | Payment processing SDK |
| @trpc/server | ^11.x | API framework |
| zod | ^3.x | Schema validation |
| drizzle-orm | ^0.30.x | Database ORM |

### 8.3 External Services

| Service | Purpose | Required |
|---------|---------|----------|
| Stripe | Payment processing, checkout, webhooks | Yes |
| PostgreSQL | Data persistence | Yes |
| Redis | Balance caching (optional) | Recommended |

### 8.4 Environment Variables

```bash
# Required for payment processing
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
FRONTEND_URL=https://app.bottleneck-bots.com
DATABASE_URL=postgresql://...

# Optional
REDIS_URL=redis://...  # For distributed caching
```

---

## 9. Out of Scope

### 9.1 Excluded from Current Release

| Item | Reason | Future Consideration |
|------|--------|---------------------|
| Multi-currency support | Complexity, limited demand | v2.0 |
| Credit gifting between users | Low priority | v2.0 |
| Credit expiration dates | Complexity | v1.5 |
| Team credit pools | Requires team management | v2.0 |
| Spending limits per user | Complex authorization | v1.5 |
| Real-time spending alerts | WebSocket infrastructure | v1.5 |
| Mobile payment methods | Platform-specific | v2.0 |
| Cryptocurrency payments | Regulatory complexity | v3.0 |
| Automatic top-up | User concerns about auto-charge | v1.5 |
| Credit trading/marketplace | Complex regulatory | v3.0 |

### 9.2 Technical Limitations

| Limitation | Description | Workaround |
|------------|-------------|------------|
| Single currency | USD only | Convert prices client-side |
| No prorated refunds | Full refund or none | Manual admin adjustment |
| Synchronous webhooks | No retry queue | Monitor Stripe dashboard |
| Cache single-instance | In-memory only | Use Redis for distributed |
| No credit freeze | Cannot pause credits | Admin sets to zero |

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Race condition on deductions | Medium | High | Database transactions with row locking |
| Cache inconsistency | Medium | Medium | Immediate invalidation, short TTL |
| Stripe webhook failures | Low | High | Retry mechanism, manual fulfillment endpoint |
| Database connection exhaustion | Low | High | Connection pooling, max limits |
| Balance going negative | Low | Critical | Double-check in transaction, atomic operations |

### 10.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Users disputing charges | Medium | Medium | Clear transaction history, email receipts |
| Credit fraud attempts | Low | High | Rate limiting, suspicious activity detection |
| Price changes confusion | Low | Medium | Clear communication, grandfather existing |
| Competitor underpricing | Medium | Medium | Value differentiation, flexible packages |

### 10.3 Security Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Payment data exposure | Low | Critical | Stripe handles all card data (PCI compliant) |
| Unauthorized adjustments | Low | High | Admin-only procedures, audit logging |
| Webhook spoofing | Low | High | Signature verification in production |
| SQL injection | Very Low | Critical | Parameterized queries via Drizzle ORM |

### 10.4 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Stripe API outage | Low | High | Graceful degradation, cache last-known balances |
| Database unavailability | Low | Critical | Replicated database, failover |
| Support volume increase | Medium | Medium | Self-service transaction history, clear errors |

---

## 11. Milestones & Timeline

### 11.1 Phase 1: Core Credit System (Weeks 1-3)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M1.1 | Database schema and migrations | Week 1 |
| M1.2 | CreditService with balance operations | Week 1 |
| M1.3 | Credit addition and deduction logic | Week 2 |
| M1.4 | Transaction recording and history | Week 2 |
| M1.5 | Credits router with basic endpoints | Week 3 |
| M1.6 | Balance caching implementation | Week 3 |

**Exit Criteria:**
- [ ] Credits can be added and deducted programmatically
- [ ] Transaction history is queryable
- [ ] Balance checks work with caching
- [ ] All operations are atomic

### 11.2 Phase 2: Payment Integration (Weeks 4-5)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M2.1 | Credit package management (CRUD) | Week 4 |
| M2.2 | Stripe Checkout integration | Week 4 |
| M2.3 | Webhook handler for payments | Week 5 |
| M2.4 | Manual fulfillment endpoint | Week 5 |

**Exit Criteria:**
- [ ] Users can purchase credits via Stripe
- [ ] Webhooks process successfully
- [ ] Credits appear immediately after payment
- [ ] Admin can create/manage packages

### 11.3 Phase 3: Admin & Analytics (Weeks 6-7)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M3.1 | Admin credit adjustment functionality | Week 6 |
| M3.2 | Refund processing | Week 6 |
| M3.3 | Usage statistics and analytics | Week 7 |
| M3.4 | Admin dashboard integration | Week 7 |

**Exit Criteria:**
- [ ] Admins can adjust credits with audit trail
- [ ] Refunds restore credits correctly
- [ ] Usage analytics are accurate
- [ ] Admin UI for credit management

### 11.4 Phase 4: Service Integration (Weeks 8-10)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M4.1 | Lead enrichment credit integration | Week 8 |
| M4.2 | AI calling credit integration | Week 9 |
| M4.3 | Scraping/browser credit integration | Week 9 |
| M4.4 | SEO operations credit integration | Week 10 |

**Exit Criteria:**
- [ ] All billable operations check and deduct credits
- [ ] Insufficient balance blocks operations gracefully
- [ ] Credits are correctly consumed per action
- [ ] Transaction references link to source operations

### 11.5 Phase 5: Subscription Integration (Weeks 11-12)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M5.1 | Tier-based credit allocation | Week 11 |
| M5.2 | Billing cycle reset logic | Week 11 |
| M5.3 | Low balance notifications | Week 12 |
| M5.4 | Credit forecasting and projections | Week 12 |

**Exit Criteria:**
- [ ] Credits allocate on subscription start
- [ ] Credits reset on billing cycle
- [ ] Users receive low balance alerts
- [ ] Usage projections are available

---

## 12. Acceptance Criteria

### 12.1 Feature-Level Acceptance

#### AC-001: Credit Balance Management
- [ ] User can view current balance for each credit type
- [ ] Balance updates immediately after transactions
- [ ] Lifetime totals (purchased, used) are accurate
- [ ] Balance never goes negative under any circumstances

#### AC-002: Credit Purchase Flow
- [ ] User can browse available credit packages
- [ ] Checkout redirects to Stripe successfully
- [ ] Credits appear within 30 seconds of payment
- [ ] Transaction recorded with Stripe reference
- [ ] Email confirmation sent after purchase

#### AC-003: Credit Consumption
- [ ] Balance check completes in < 50ms
- [ ] Insufficient balance returns clear error
- [ ] Deduction occurs atomically
- [ ] Transaction links to source operation
- [ ] Cache invalidates immediately

#### AC-004: Transaction History
- [ ] All transactions appear in history
- [ ] Filtering by credit type works
- [ ] Pagination handles large volumes
- [ ] Export capability functions correctly
- [ ] Metadata is preserved and queryable

#### AC-005: Admin Operations
- [ ] Admin can create new packages
- [ ] Admin can adjust credits (positive and negative)
- [ ] Adjustments require description
- [ ] Refunds prevent duplicate processing
- [ ] All admin actions are logged

#### AC-006: Analytics
- [ ] Usage stats calculate correctly
- [ ] Date range filtering works
- [ ] Average daily usage is accurate
- [ ] Transaction counts match actual

### 12.2 Integration Acceptance

- [ ] Credits router responds within SLA (P95 < 100ms)
- [ ] All endpoints require appropriate authentication
- [ ] Database operations use connection pooling
- [ ] Error responses include actionable messages
- [ ] Webhook signature verification enabled in production

### 12.3 Quality Acceptance

- [ ] Unit test coverage >= 80%
- [ ] Integration tests for all credit operations
- [ ] No critical security vulnerabilities
- [ ] Performance benchmarks meet targets
- [ ] Documentation is complete

### 12.4 User Acceptance

- [ ] Credit balance visible on dashboard
- [ ] Purchase flow completes in < 2 minutes
- [ ] Transaction history is understandable
- [ ] Low balance warnings trigger appropriately
- [ ] Error messages are user-friendly

---

## Appendix A: API Reference

### A.1 Input Schemas

```typescript
// Credit type enum
const creditTypeEnum = z.enum(["enrichment", "calling", "scraping"]);

// Transaction type enum
const transactionTypeEnum = z.enum(["purchase", "usage", "refund", "adjustment"]);

// Create package (admin)
const createPackageSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  creditAmount: z.number().int().positive(),
  price: z.number().int().positive(), // cents
  creditType: creditTypeEnum,
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Adjust credits (admin)
const adjustCreditsSchema = z.object({
  userId: z.number().int(),
  amount: z.number().int(), // positive or negative
  creditType: creditTypeEnum,
  description: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Transaction history
const transactionHistorySchema = z.object({
  creditType: creditTypeEnum.optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0),
});

// Check balance
const checkBalanceSchema = z.object({
  creditType: creditTypeEnum,
  required: z.number().int().positive(),
});

// Create checkout session
const createCheckoutSessionSchema = z.object({
  packageId: z.number().int(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});
```

### A.2 Response Types

```typescript
interface CreditBalance {
  balance: number;
  totalPurchased: number;
  totalUsed: number;
}

interface CreditTransaction {
  id: number;
  userId: number;
  creditType: CreditType;
  transactionType: TransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

interface UsageStats {
  totalUsed: number;
  totalPurchased: number;
  balance: number;
  averageDaily: number;
  transactions: number;
}

interface CheckBalanceResult {
  hasSufficient: boolean;
  balance: number;
  required: number;
  shortfall: number;
}
```

---

## Appendix B: Credit Consumption Matrix

| Service | Action | Credit Type | Credits Per Action |
|---------|--------|-------------|-------------------|
| Lead Enrichment | LinkedIn lookup | enrichment | 1 |
| Lead Enrichment | Company enrichment | enrichment | 2 |
| Lead Enrichment | Full profile enrichment | enrichment | 5 |
| AI Calling | Outbound call (per minute) | calling | 1 |
| AI Calling | Voicemail drop | calling | 2 |
| AI Calling | Call campaign start | calling | 10 |
| Browser Automation | Simple navigation | scraping | 1 |
| Browser Automation | Form submission | scraping | 2 |
| Browser Automation | Data extraction | scraping | 3 |
| SEO Tools | Keyword analysis | scraping | 2 |
| SEO Tools | Competitor analysis | scraping | 5 |
| SEO Tools | Full site audit | scraping | 20 |

---

## Appendix C: Subscription Tier Credit Allocation

| Tier | Monthly Enrichment | Monthly Calling | Monthly Scraping |
|------|-------------------|-----------------|------------------|
| Starter | 100 | 50 | 200 |
| Growth | 500 | 200 | 1,000 |
| Professional | 2,000 | 800 | 5,000 |
| Enterprise | 10,000 | 4,000 | 25,000 |

---

## Appendix D: Glossary

| Term | Definition |
|------|------------|
| **Credit** | A unit of currency within the platform representing usage quota |
| **Credit Type** | Category of credits: enrichment, calling, or scraping |
| **Transaction** | A recorded change to credit balance (purchase, usage, refund, adjustment) |
| **Package** | A purchasable bundle of credits at a fixed price |
| **Balance** | Current available credits for a specific credit type |
| **Shortfall** | The difference between required and available credits |
| **Allocation** | Credits granted as part of subscription tier benefits |
| **Reset** | Restoration of credits at billing period start |
| **Rollover** | Unused credits carried to next billing period |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Development Team | Initial PRD creation |

---

**Document Status:** Ready for Review
**Next Review:** 2026-01-18
**Stakeholders:** Engineering, Product, Finance, Customer Success
