# PRD-022: Cost & Credit Management

## Product Requirements Document

### Overview
| Field | Value |
|-------|-------|
| **PRD ID** | PRD-022 |
| **Feature Name** | Cost & Credit Management |
| **Category** | System & Analytics |
| **Priority** | P0 - Critical |
| **Status** | Active |
| **Owner** | Finance Team |

---

## 1. Executive Summary

The Cost & Credit Management system handles the credit-based usage model for platform features. It includes credit purchasing via Stripe integration, per-operation deductions, subscription tier tracking, usage analytics, and per-sub-account cost attribution.

## 2. Problem Statement

Platform operations have varying costs that need to be tracked and billed. Users need visibility into credit usage. Sub-accounts require isolated cost tracking. Credit purchases must be seamless and secure.

## 3. Goals & Objectives

### Primary Goals
- Enable seamless credit purchasing
- Track accurate per-operation costs
- Provide usage transparency
- Support sub-account billing

### Success Metrics
| Metric | Target |
|--------|--------|
| Billing Accuracy | 100% |
| Payment Success Rate | > 99% |
| Credit Deduction Speed | < 100ms |
| Usage Report Accuracy | 100% |

## 4. Functional Requirements

### FR-001: Credit System
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Credit balance tracking | P0 |
| FR-001.2 | Credit purchasing | P0 |
| FR-001.3 | Credit deduction | P0 |
| FR-001.4 | Low balance alerts | P1 |
| FR-001.5 | Auto-recharge | P2 |

### FR-002: Pricing & Tiers
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Subscription tier management | P0 |
| FR-002.2 | Tier-based pricing | P0 |
| FR-002.3 | Tier upgrades/downgrades | P0 |
| FR-002.4 | Volume discounts | P2 |

### FR-003: Cost Tracking
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Per-operation cost logging | P0 |
| FR-003.2 | Sub-account attribution | P0 |
| FR-003.3 | Usage reports | P0 |
| FR-003.4 | Cost forecasting | P2 |

### FR-004: Stripe Integration
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Payment processing | P0 |
| FR-004.2 | Subscription management | P0 |
| FR-004.3 | Invoice generation | P1 |
| FR-004.4 | Webhook handling | P0 |

## 5. Data Models

### Credit Account
```typescript
interface CreditAccount {
  id: string;
  userId: string;
  balance: number;
  tier: SubscriptionTier;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  autoRecharge: boolean;
  autoRechargeThreshold?: number;
  autoRechargeAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Credit Transaction
```typescript
interface CreditTransaction {
  id: string;
  accountId: string;
  type: 'purchase' | 'deduction' | 'refund' | 'bonus';
  amount: number;
  balance: number;
  description: string;
  operationType?: string;
  subAccountId?: string;
  stripePaymentId?: string;
  createdAt: Date;
}
```

### Subscription Tier
```typescript
interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  creditMultiplier: number;
  features: string[];
  limits: TierLimits;
}
```

## 6. Credit Costs

| Operation | Credits |
|-----------|---------|
| Browser Session (per minute) | 1 |
| AI Agent Execution | 5-20 |
| Lead Enrichment | 1 |
| Voice Call (per minute) | 2 |
| Email Send | 0.1 |
| SEO Audit | 10 |

## 7. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/credits/balance` | Get balance |
| POST | `/api/credits/purchase` | Purchase credits |
| GET | `/api/credits/transactions` | List transactions |
| GET | `/api/credits/usage` | Usage summary |
| POST | `/api/subscriptions` | Create subscription |
| PUT | `/api/subscriptions/:id` | Update subscription |
| GET | `/api/billing/invoices` | Get invoices |

## 8. Subscription Tiers

| Tier | Monthly | Credits | Multiplier |
|------|---------|---------|------------|
| Free | $0 | 100 | 1.0x |
| Starter | $29 | 1,000 | 1.1x |
| Pro | $99 | 5,000 | 1.2x |
| Enterprise | Custom | Unlimited | 1.5x |

---

## Appendix

### A. Changelog
| Date | Version | Changes |
|------|---------|---------|
| 2024-01-11 | 1.0 | Initial PRD creation |
