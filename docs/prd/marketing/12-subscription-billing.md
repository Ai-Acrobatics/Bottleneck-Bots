# PRD: Subscription & Billing System

## Overview
A comprehensive subscription and billing system for Bottleneck-Bots that supports tiered pricing plans (Starter, Growth, Enterprise), credit-based API usage, execution pack add-ons, and seamless Stripe integration for payment processing and usage tracking.

## Problem Statement
Bottleneck-Bots needs a monetization infrastructure that can:
- Offer flexible pricing tiers to serve different customer segments
- Implement a credit-based system for granular API usage billing
- Provide add-on options for customers who need additional capacity
- Handle complex billing scenarios (upgrades, downgrades, prorations)
- Track and report usage accurately for billing and analytics
- Scale with business growth while maintaining accurate revenue attribution

## Goals & Objectives
- **Primary Goals**
  - Launch three subscription tiers with differentiated feature sets
  - Implement credit-based metering for API and automation usage
  - Enable self-service subscription management
  - Integrate Stripe for payment processing and subscription management

- **Success Metrics**
  - 95% payment success rate on first attempt
  - < 2% involuntary churn due to payment failures
  - 90% of billing inquiries resolved without support
  - < 1 minute for usage data to reflect in billing system
  - Zero billing discrepancies over $10

## User Stories
- As a **new user**, I want to start with a free trial so that I can evaluate the platform
- As a **growing business**, I want to upgrade my plan so that I get more features and capacity
- As a **power user**, I want to purchase additional execution packs so that I don't hit limits
- As an **admin**, I want to view our usage and billing history so that I can manage costs
- As a **finance team member**, I want downloadable invoices so that I can process expenses
- As an **enterprise customer**, I want custom pricing so that it fits my organization's needs

## Functional Requirements

### Must Have (P0)
- **Subscription Tiers**
  | Feature | Starter ($49/mo) | Growth ($149/mo) | Enterprise (Custom) |
  |---------|------------------|------------------|---------------------|
  | Workflows | 5 | 25 | Unlimited |
  | Monthly Executions | 500 | 5,000 | Custom |
  | API Credits | 10,000 | 100,000 | Custom |
  | Team Members | 2 | 10 | Unlimited |
  | Priority Support | - | Email | Dedicated |
  | Custom Integrations | - | - | Yes |

- **Credit System**
  - Credit allocation based on subscription tier
  - Per-action credit costs (API calls, browser actions, AI operations)
  - Real-time credit balance tracking
  - Automatic alerts at 75%, 90%, and 100% usage

- **Execution Pack Add-ons**
  - 1,000 executions: $29
  - 5,000 executions: $99 (20% discount)
  - 20,000 executions: $299 (40% discount)
  - Add-ons valid for billing period, non-rollover

- **Stripe Integration**
  - Subscription creation and management
  - Card payment processing
  - Invoice generation and delivery
  - Webhook handling for payment events
  - Customer portal for self-service

- **Usage Tracking**
  - Real-time usage metering
  - Daily usage aggregation
  - Monthly usage reports
  - Usage breakdown by workflow/action type

### Should Have (P1)
- Annual billing option with 20% discount
- Multiple payment methods (ACH, wire transfer for enterprise)
- Subscription pause functionality
- Referral program with credit rewards
- Usage forecasting and recommendations
- Automated dunning for failed payments

### Nice to Have (P2)
- Cryptocurrency payment option
- Prepaid credit purchasing
- Usage-based dynamic pricing
- White-label billing for agencies
- Multi-currency support

## Non-Functional Requirements

### Performance
- Payment processing within 3 seconds
- Usage data updated within 60 seconds
- Billing calculations accurate to millisecond precision
- Support for 100,000+ subscriptions

### Security
- PCI-DSS compliance via Stripe
- No storage of raw payment credentials
- Encrypted billing data at rest
- Audit trail for all billing operations

### Scalability
- Event-driven usage processing
- Horizontal scaling for high-volume periods
- Graceful handling of Stripe rate limits

## Technical Requirements

### Architecture
```
┌────────────────────────────────────────────────────────────────┐
│                      Billing Service                            │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Subscription │  │    Credit    │  │   Invoice            │  │
│  │   Manager    │  │   Manager    │  │   Generator          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │    Usage     │  │   Payment    │  │   Stripe Webhook     │  │
│  │   Tracker    │  │  Processor   │  │     Handler          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│                          Stripe API                             │
└────────────────────────────────────────────────────────────────┘
```

### Dependencies
- **Stripe**: Payment processing, subscriptions, invoicing
- **PostgreSQL**: Subscription and usage data storage
- **Redis**: Usage counters and caching
- **TimescaleDB**: Time-series usage data
- **Background Workers**: Usage aggregation jobs

### APIs
- `POST /subscriptions` - Create subscription
- `GET /subscriptions/current` - Get current subscription
- `PUT /subscriptions` - Update subscription (upgrade/downgrade)
- `DELETE /subscriptions` - Cancel subscription
- `POST /subscriptions/addons` - Purchase add-on pack
- `GET /usage/current` - Get current period usage
- `GET /usage/history` - Get historical usage
- `GET /credits/balance` - Get credit balance
- `GET /invoices` - List invoices
- `GET /invoices/{id}` - Get invoice details
- `POST /billing/portal` - Get Stripe customer portal URL

### Database Schema
```sql
-- Subscription Plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  stripe_price_id VARCHAR(100) NOT NULL,
  monthly_price DECIMAL(10,2) NOT NULL,
  annual_price DECIMAL(10,2),
  features JSONB NOT NULL,
  limits JSONB NOT NULL, -- {workflows, executions, credits, team_members}
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  plan_id UUID REFERENCES subscription_plans(id),
  stripe_subscription_id VARCHAR(100) UNIQUE,
  stripe_customer_id VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL, -- active, past_due, canceled, trialing
  billing_period VARCHAR(10) NOT NULL, -- monthly, annual
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  trial_end TIMESTAMP,
  canceled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Credit Balances
CREATE TABLE credit_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) UNIQUE,
  total_credits BIGINT NOT NULL DEFAULT 0,
  used_credits BIGINT NOT NULL DEFAULT 0,
  rollover_credits BIGINT DEFAULT 0,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Credit Transactions
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  amount BIGINT NOT NULL, -- positive for additions, negative for usage
  balance_after BIGINT NOT NULL,
  transaction_type VARCHAR(30) NOT NULL, -- allocation, usage, addon, refund
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Execution Pack Purchases
CREATE TABLE addon_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  pack_type VARCHAR(20) NOT NULL, -- exec_1000, exec_5000, exec_20000
  quantity INTEGER DEFAULT 1,
  credits_added BIGINT NOT NULL,
  price_paid DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id VARCHAR(100),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usage Records (TimescaleDB hypertable)
CREATE TABLE usage_records (
  id UUID DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  resource_type VARCHAR(50) NOT NULL, -- api_call, browser_action, ai_operation
  resource_id UUID,
  credits_used INTEGER NOT NULL,
  metadata JSONB,
  recorded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, recorded_at)
);
SELECT create_hypertable('usage_records', 'recorded_at');

-- Invoices (cached from Stripe)
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  stripe_invoice_id VARCHAR(100) UNIQUE NOT NULL,
  amount_due DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2),
  status VARCHAR(20) NOT NULL,
  invoice_pdf_url TEXT,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Credit Cost Matrix
```yaml
credit_costs:
  api_calls:
    standard: 1
    with_ai: 10
  browser_actions:
    navigate: 2
    click: 1
    input: 1
    screenshot: 3
    extract: 5
  ai_operations:
    text_generation: 10
    image_analysis: 25
    document_processing: 50
  workflow_execution:
    base_cost: 5
    per_step: 1
```

## Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Payment Success Rate | > 95% | Stripe dashboard |
| Revenue Recognition Accuracy | 100% | Financial audit |
| Upgrade Conversion Rate | > 15% of Starter | Product analytics |
| Churn Rate (Voluntary) | < 5% monthly | Subscription analytics |
| Churn Rate (Involuntary) | < 2% monthly | Payment failure tracking |
| Time to Invoice | < 24 hours | Billing system logs |

## Dependencies
- Stripe account with Billing enabled
- Stripe webhook endpoint configuration
- Tax calculation service (Stripe Tax or external)
- Email service for invoice delivery
- Background job processing system

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Stripe outage | Critical - Cannot process payments | Implement retry logic, queue payments, communicate with customers |
| Usage metering drift | High - Incorrect billing | Real-time validation, daily reconciliation jobs, customer audit tools |
| Proration complexity | Medium - Customer confusion | Clear upgrade/downgrade policies, preview pricing before changes |
| Credit system gaming | Medium - Revenue loss | Rate limiting, usage pattern monitoring, terms of service enforcement |
| Failed payment cascade | High - Revenue loss | Smart retry logic, dunning emails, grace periods, payment method update prompts |
| Currency fluctuation | Medium - Revenue variance | Price in USD, consider local pricing for key markets |
