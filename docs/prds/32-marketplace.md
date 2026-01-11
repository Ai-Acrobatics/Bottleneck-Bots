# PRD-032: Marketplace

## Product Requirements Document

### Overview
| Field | Value |
|-------|-------|
| **PRD ID** | PRD-032 |
| **Feature Name** | Template & Workflow Marketplace |
| **Category** | Integrations |
| **Priority** | P1 - High |
| **Status** | Active |
| **Owner** | Platform Team |
| **API Location** | `server/api/routers/marketplace.ts` |
| **Created** | January 2026 |
| **Last Updated** | January 2026 |

---

## 1. Overview

The Marketplace is a comprehensive platform for discovering, sharing, purchasing, and installing automation templates and workflows within the Bottleneck-Bots ecosystem. It enables a vibrant community where users can monetize their automation expertise while others benefit from pre-built solutions. The marketplace supports free and paid content, community ratings and reviews, download tracking, and a revenue-sharing model that incentivizes high-quality contributions.

### Key Capabilities

- **Template Discovery**: Browse, search, and filter templates by category, rating, price, and use case
- **Community Contributions**: Allow users to publish their workflows and templates for others to use
- **Rating & Review System**: Enable community feedback through ratings, reviews, and verified purchase badges
- **Download & Installation Tracking**: Monitor template popularity, installation counts, and usage analytics
- **Revenue Sharing**: Split revenue between publishers (70%) and platform (30%) for paid content
- **Version Management**: Support template versioning with update notifications and rollback capabilities
- **Quality Assurance**: Review process for submissions with automated and manual quality checks

### Integration Points

| System | Integration |
|--------|-------------|
| **Stripe** | Payment processing for purchases and publisher payouts |
| **Workflows Router** | Import/export workflow definitions |
| **Templates Router** | Template execution and instantiation |
| **Credit System** | Credit-based purchases and subscription bundles |
| **User Profiles** | Publisher profiles and purchase history |
| **Analytics** | Usage tracking and marketplace metrics |

---

## 2. Problem Statement

### Current Challenges

Organizations and individuals face significant challenges in automation:

1. **Reinventing the Wheel**: Users build similar automations independently, wasting time on solved problems
2. **Knowledge Silos**: Successful automation patterns remain isolated within individual accounts
3. **No Monetization Path**: Power users cannot earn revenue from their automation expertise
4. **Discovery Difficulty**: No centralized way to find proven, tested automation solutions
5. **Quality Uncertainty**: Downloaded templates from external sources may be unreliable or insecure
6. **Update Fragmentation**: No mechanism to receive updates when templates improve

### Target Users

| User Type | Needs |
|-----------|-------|
| **Template Consumers** | Find pre-built solutions, reduce development time, learn from experts |
| **Template Publishers** | Monetize expertise, build reputation, share solutions at scale |
| **Agency Owners** | Provide value-added templates to clients, white-label solutions |
| **Enterprise Teams** | Access vetted, secure templates with compliance guarantees |
| **New Users** | Quick-start with proven templates instead of building from scratch |

### Competitive Analysis

| Feature | Zapier | Make.com | n8n | **Bottleneck-Bots** |
|---------|--------|----------|-----|---------------------|
| Template Marketplace | Yes | Yes | Community | **Yes** |
| Revenue Sharing | No | No | No | **70/30** |
| Rating System | Limited | Limited | Yes | **Full** |
| Version Control | No | No | Git | **Built-in** |
| Private Templates | Enterprise | No | Self-host | **Yes** |
| AI-Generated | No | No | No | **Planned** |

---

## 3. Goals & Success Metrics

### Primary Goals

| ID | Goal | Priority | Timeline |
|----|------|----------|----------|
| **G1** | Launch marketplace with 100+ quality templates | P0 | Month 3 |
| **G2** | Achieve 1,000+ template installations | P0 | Month 6 |
| **G3** | Enable 50+ publishers earning revenue | P1 | Month 9 |
| **G4** | Reach $10,000 monthly GMV (Gross Merchandise Value) | P1 | Month 12 |
| **G5** | Maintain 4.2+ average template rating | P1 | Ongoing |

### Success Metrics (KPIs)

#### Template Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Total Templates Published | 500+ in 12 months | Database count |
| Template Installation Rate | 20%+ of browsers install 1+ | Event tracking |
| Average Rating | >= 4.2/5 | Review aggregation |
| Rating Participation | 10%+ of installations rate | Review count / Installs |

#### Revenue Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Gross Merchandise Value (GMV) | $50,000 in year 1 | Stripe transactions |
| Publisher Payouts | $35,000 in year 1 | 70% of GMV |
| Paid Template Conversion | 15%+ | Purchases / Views |
| Average Template Price | $15-30 | Price analytics |

#### Engagement Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Daily Active Browsers | 500+ | Session tracking |
| Search Queries | 1,000+ monthly | Search logs |
| Template Page Views | 10,000+ monthly | Analytics |
| Publisher Applications | 100+ in 6 months | Application count |

#### Quality Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Template Approval Rate | 80%+ | Submissions / Approvals |
| Review Response Time | < 48 hours | Timestamp tracking |
| Reported Issues | < 2% of templates | Issue tracker |
| Template Update Frequency | Monthly for active | Version tracking |

### OKRs

**Objective 1**: Build a thriving marketplace ecosystem
- KR1: 500+ published templates within 12 months
- KR2: 100+ active publishers with at least 1 template
- KR3: 5,000+ template installations
- KR4: NPS score >= 50 for marketplace users

**Objective 2**: Generate meaningful revenue for publishers
- KR1: $50,000+ total GMV in year 1
- KR2: 20+ publishers earning > $500/month
- KR3: < 3% refund rate on paid templates
- KR4: 90%+ publisher satisfaction with payout process

**Objective 3**: Ensure high-quality marketplace content
- KR1: Average template rating >= 4.2/5
- KR2: < 1% of templates flagged for policy violations
- KR3: 100% of templates pass automated security scan
- KR4: < 24 hour average issue resolution time

---

## 4. User Stories

### Epic 1: Template Discovery

#### US-001: Browse Marketplace
**As a** user
**I want to** browse available templates in the marketplace
**So that** I can discover automation solutions for my needs

**Acceptance Criteria:**
- [ ] Display grid/list view of published templates
- [ ] Show template thumbnail, name, description preview, rating, price
- [ ] Filter by category (Browser Automation, Data Extraction, Monitoring, etc.)
- [ ] Filter by price (Free, Under $10, $10-25, $25-50, $50+)
- [ ] Sort by: Popular, New, Rating, Price (Low/High)
- [ ] Paginate results (20 per page default)
- [ ] Show installation count and recency

**Technical Notes:**
- Endpoint: `GET /api/trpc/marketplace.listTemplates`
- Cache for 5 minutes, invalidate on new publication

---

#### US-002: Search Templates
**As a** user
**I want to** search templates by keyword
**So that** I can quickly find relevant solutions

**Acceptance Criteria:**
- [ ] Full-text search on title, description, tags
- [ ] Autocomplete suggestions from popular searches
- [ ] Search filters combinable with browse filters
- [ ] Highlight matching terms in results
- [ ] Track search queries for analytics
- [ ] Show "No results" with suggestions

**Technical Notes:**
- Implement using PostgreSQL full-text search
- Index: title (weight A), description (weight B), tags (weight C)

---

#### US-003: View Template Details
**As a** user
**I want to** view detailed information about a template
**So that** I can decide if it meets my needs

**Acceptance Criteria:**
- [ ] Full description with markdown support
- [ ] Screenshot gallery (up to 5 images)
- [ ] Video demo embed (YouTube/Vimeo)
- [ ] Workflow step overview (sanitized, no secrets)
- [ ] Required inputs and outputs specification
- [ ] Compatibility requirements (e.g., API keys needed)
- [ ] Version history with changelog
- [ ] Publisher profile and other templates
- [ ] Average rating and review count
- [ ] Installation count and last updated date

---

### Epic 2: Ratings & Reviews

#### US-004: Rate Template
**As a** user who installed a template
**I want to** rate my experience
**So that** others can benefit from my feedback

**Acceptance Criteria:**
- [ ] 1-5 star rating (required)
- [ ] Optional written review (10-1000 characters)
- [ ] Must have installed template to rate
- [ ] One rating per user per template (can update)
- [ ] Rating timestamp displayed
- [ ] Verified purchase badge for paid templates

**Technical Notes:**
- Endpoint: `POST /api/trpc/marketplace.rateTemplate`
- Rate limiting: 10 reviews per user per day

---

#### US-005: View Reviews
**As a** user
**I want to** read reviews from other users
**So that** I can make informed decisions

**Acceptance Criteria:**
- [ ] Display reviews sorted by: Most recent, Most helpful, Rating
- [ ] Show rating breakdown (5-star histogram)
- [ ] Filter reviews by rating level
- [ ] Show verified purchase badge
- [ ] Display review date and user name (or anonymous)
- [ ] Mark reviews as helpful (upvote)
- [ ] Report inappropriate reviews

---

#### US-006: Publisher Response to Reviews
**As a** template publisher
**I want to** respond to reviews
**So that** I can address feedback and support users

**Acceptance Criteria:**
- [ ] Add one response per review
- [ ] Response marked with publisher badge
- [ ] Edit response within 24 hours
- [ ] Notification to reviewer when response posted
- [ ] Response character limit: 500

---

### Epic 3: Template Installation

#### US-007: Install Free Template
**As a** user
**I want to** install a free template
**So that** I can use it in my workflows

**Acceptance Criteria:**
- [ ] One-click installation for free templates
- [ ] Template copied to user's workspace
- [ ] Guided configuration for required inputs
- [ ] Success confirmation with "Run Now" option
- [ ] Template appears in user's workflow list
- [ ] Installation count incremented

**Technical Notes:**
- Endpoint: `POST /api/trpc/marketplace.installTemplate`
- Clone workflow definition, link to original for updates

---

#### US-008: Purchase Paid Template
**As a** user
**I want to** purchase a paid template
**So that** I can access premium automation solutions

**Acceptance Criteria:**
- [ ] Display price clearly before purchase
- [ ] Stripe Checkout integration for payment
- [ ] Support credit card and PayPal (via Stripe)
- [ ] Option to use platform credits
- [ ] Purchase confirmation email
- [ ] Automatic installation after payment
- [ ] 14-day refund policy displayed
- [ ] Receipt downloadable

**Technical Notes:**
- Endpoint: `POST /api/trpc/marketplace.createCheckout`
- Store purchase record with Stripe session ID

---

#### US-009: Template Updates
**As a** user who installed a template
**I want to** receive updates when the publisher improves it
**So that** I benefit from bug fixes and enhancements

**Acceptance Criteria:**
- [ ] Notification when update available
- [ ] View changelog before updating
- [ ] One-click update installation
- [ ] Option to skip update
- [ ] Rollback to previous version if needed
- [ ] Preserve user customizations when possible

---

### Epic 4: Template Publishing

#### US-010: Become a Publisher
**As a** power user
**I want to** apply to become a marketplace publisher
**So that** I can share and monetize my templates

**Acceptance Criteria:**
- [ ] Application form with:
  - [ ] Publisher name and bio
  - [ ] Portfolio/experience description
  - [ ] Payout information (Stripe Connect)
  - [ ] Agreement to publisher terms
- [ ] Review process (manual within 48 hours)
- [ ] Approval/rejection notification with reason
- [ ] Publisher dashboard access upon approval

**Technical Notes:**
- Stripe Connect Standard accounts for payouts
- KYC requirements handled by Stripe

---

#### US-011: Submit Template
**As a** publisher
**I want to** submit a template for marketplace listing
**So that** others can discover and use my work

**Acceptance Criteria:**
- [ ] Export existing workflow as template
- [ ] Add marketplace metadata:
  - [ ] Title (5-100 characters)
  - [ ] Description (50-5000 characters, markdown)
  - [ ] Category (select from list)
  - [ ] Tags (up to 10)
  - [ ] Screenshots (1-5 required)
  - [ ] Demo video URL (optional)
  - [ ] Pricing (free, one-time, or subscription)
  - [ ] Input/output specification
  - [ ] Compatibility notes
- [ ] Preview how template will appear
- [ ] Submit for review
- [ ] Track submission status

**Technical Notes:**
- Endpoint: `POST /api/trpc/marketplace.submitTemplate`
- Workflow sanitized to remove secrets/credentials

---

#### US-012: Template Review Process
**As a** platform administrator
**I want to** review submitted templates
**So that** marketplace quality is maintained

**Acceptance Criteria:**
- [ ] Automated checks:
  - [ ] Security scan for malicious code
  - [ ] Credential leak detection
  - [ ] Policy compliance check
  - [ ] Workflow validity test
- [ ] Manual review queue
- [ ] Approve, reject, or request changes
- [ ] Rejection requires reason
- [ ] Publisher notification on status change
- [ ] SLA: 48-hour review turnaround

---

#### US-013: Manage Published Templates
**As a** publisher
**I want to** manage my published templates
**So that** I can keep them updated and monitor performance

**Acceptance Criteria:**
- [ ] View all published templates
- [ ] See analytics per template (views, installs, revenue)
- [ ] Update template content and metadata
- [ ] Version management with changelog
- [ ] Unpublish/archive templates
- [ ] View and respond to reviews
- [ ] Track earnings and pending payouts

---

### Epic 5: Revenue & Payouts

#### US-014: Set Template Pricing
**As a** publisher
**I want to** set pricing for my templates
**So that** I can earn revenue from my work

**Acceptance Criteria:**
- [ ] Free option
- [ ] One-time purchase ($1 - $499)
- [ ] Monthly subscription ($1 - $99/month)
- [ ] Platform takes 30% commission (publisher keeps 70%)
- [ ] Price displayed in user's currency
- [ ] Price change effective for new purchases

---

#### US-015: Track Earnings
**As a** publisher
**I want to** track my marketplace earnings
**So that** I understand my revenue performance

**Acceptance Criteria:**
- [ ] Dashboard showing:
  - [ ] Total earnings (lifetime, month, week)
  - [ ] Pending payouts
  - [ ] Revenue per template
  - [ ] Sales trends over time
  - [ ] Top-performing templates
  - [ ] Conversion rates (views to purchases)
- [ ] Export earnings report (CSV)

---

#### US-016: Receive Payouts
**As a** publisher
**I want to** receive my earnings
**So that** I am compensated for my work

**Acceptance Criteria:**
- [ ] Automatic monthly payouts via Stripe Connect
- [ ] Minimum payout threshold: $25
- [ ] Payout schedule: 1st of each month
- [ ] Payout notification email
- [ ] Payout history in dashboard
- [ ] Tax document generation (1099 for US publishers)

**Technical Notes:**
- Stripe Connect handles payouts and tax reporting
- Platform retains 30% commission

---

### Epic 6: Administration

#### US-017: Marketplace Analytics
**As an** administrator
**I want to** view marketplace-wide analytics
**So that** I can monitor platform health and growth

**Acceptance Criteria:**
- [ ] Total templates, publishers, installations
- [ ] Revenue (GMV, platform revenue, publisher payouts)
- [ ] Top templates by installs and revenue
- [ ] New submissions pipeline
- [ ] Review queue status
- [ ] Flagged content reports
- [ ] Search query analytics

---

#### US-018: Content Moderation
**As an** administrator
**I want to** moderate marketplace content
**So that** the platform remains safe and high-quality

**Acceptance Criteria:**
- [ ] Review reported templates
- [ ] Review reported reviews
- [ ] Suspend/ban publishers for violations
- [ ] Remove violating content
- [ ] Issue warnings to publishers
- [ ] Appeal process for publishers

---

## 5. Functional Requirements

### FR-001: Template Catalog

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-001.1 | Store template metadata (title, description, category, tags) | P0 | Planned |
| FR-001.2 | Support template versioning with semantic versioning | P1 | Planned |
| FR-001.3 | Store template workflow definition (JSON) | P0 | Planned |
| FR-001.4 | Support up to 5 screenshots per template | P0 | Planned |
| FR-001.5 | Store video demo URL (YouTube, Vimeo) | P1 | Planned |
| FR-001.6 | Track installation count per template | P0 | Planned |
| FR-001.7 | Calculate and cache average rating | P0 | Planned |
| FR-001.8 | Support template categories (predefined list) | P0 | Planned |
| FR-001.9 | Support custom tags (up to 10 per template) | P1 | Planned |
| FR-001.10 | Template status: draft, pending_review, published, archived, rejected | P0 | Planned |

### FR-002: Search & Discovery

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-002.1 | Full-text search on title, description, tags | P0 | Planned |
| FR-002.2 | Filter by category | P0 | Planned |
| FR-002.3 | Filter by price range (free, $1-10, $10-25, $25-50, $50+) | P0 | Planned |
| FR-002.4 | Filter by rating (4+, 3+, 2+, any) | P1 | Planned |
| FR-002.5 | Sort by: popular, new, rating, price | P0 | Planned |
| FR-002.6 | Pagination (20 items per page default) | P0 | Planned |
| FR-002.7 | Search suggestions/autocomplete | P2 | Planned |
| FR-002.8 | Related templates recommendation | P2 | Planned |
| FR-002.9 | Recently viewed templates | P2 | Planned |
| FR-002.10 | Personalized recommendations based on history | P3 | Future |

### FR-003: Ratings & Reviews

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-003.1 | 1-5 star rating system | P0 | Planned |
| FR-003.2 | Written review (10-1000 characters) | P0 | Planned |
| FR-003.3 | One review per user per template | P0 | Planned |
| FR-003.4 | Verified purchase badge for paid templates | P0 | Planned |
| FR-003.5 | Review helpfulness voting | P1 | Planned |
| FR-003.6 | Publisher response to reviews | P1 | Planned |
| FR-003.7 | Report inappropriate reviews | P1 | Planned |
| FR-003.8 | Rating breakdown histogram | P1 | Planned |
| FR-003.9 | Review moderation queue | P1 | Planned |
| FR-003.10 | Anonymous review option | P2 | Planned |

### FR-004: Installation & Downloads

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-004.1 | One-click installation for free templates | P0 | Planned |
| FR-004.2 | Stripe Checkout for paid templates | P0 | Implemented |
| FR-004.3 | Credit-based purchase option | P1 | Planned |
| FR-004.4 | Clone workflow to user's account | P0 | Planned |
| FR-004.5 | Track installation history per user | P0 | Planned |
| FR-004.6 | Update notification system | P1 | Planned |
| FR-004.7 | One-click update installation | P1 | Planned |
| FR-004.8 | Version rollback capability | P2 | Planned |
| FR-004.9 | Preserve user customizations on update | P2 | Planned |
| FR-004.10 | Installation analytics (source, timing) | P1 | Planned |

### FR-005: Publisher Management

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-005.1 | Publisher application workflow | P0 | Planned |
| FR-005.2 | Publisher profile (name, bio, avatar) | P0 | Planned |
| FR-005.3 | Stripe Connect integration for payouts | P0 | Planned |
| FR-005.4 | Template submission workflow | P0 | Planned |
| FR-005.5 | Automated security scanning | P0 | Planned |
| FR-005.6 | Manual review queue | P0 | Planned |
| FR-005.7 | Publisher dashboard with analytics | P1 | Planned |
| FR-005.8 | Earnings tracking and export | P1 | Planned |
| FR-005.9 | Monthly automatic payouts | P1 | Planned |
| FR-005.10 | Publisher tier system (Bronze, Silver, Gold) | P2 | Future |

### FR-006: Revenue & Transactions

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-006.1 | Free template support | P0 | Planned |
| FR-006.2 | One-time purchase pricing ($1-499) | P0 | Planned |
| FR-006.3 | Subscription pricing ($1-99/month) | P2 | Future |
| FR-006.4 | 70/30 revenue split (publisher/platform) | P0 | Planned |
| FR-006.5 | Stripe payment processing | P0 | Implemented |
| FR-006.6 | Credit package purchases | P0 | Implemented |
| FR-006.7 | Refund processing (14-day policy) | P1 | Planned |
| FR-006.8 | Tax calculation (Stripe Tax) | P1 | Planned |
| FR-006.9 | Multi-currency support | P2 | Planned |
| FR-006.10 | Purchase receipt generation | P1 | Planned |

---

## 6. Non-Functional Requirements

### Performance

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-001 | Template list load time (P95) | < 500ms | P0 |
| NFR-002 | Search query response (P95) | < 300ms | P0 |
| NFR-003 | Template detail page load | < 800ms | P0 |
| NFR-004 | Installation process | < 5 seconds | P0 |
| NFR-005 | Checkout redirect | < 3 seconds | P0 |
| NFR-006 | Concurrent marketplace users | 1,000+ | P1 |

### Scalability

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-007 | Total templates supported | 50,000+ | P1 |
| NFR-008 | Total reviews supported | 500,000+ | P1 |
| NFR-009 | Daily installations | 10,000+ | P1 |
| NFR-010 | Concurrent transactions | 100+ | P1 |
| NFR-011 | CDN for static assets (images, screenshots) | Required | P0 |

### Reliability

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-012 | Marketplace availability | >= 99.9% | P0 |
| NFR-013 | Payment processing success | >= 99.5% | P0 |
| NFR-014 | Payout reliability | 100% | P0 |
| NFR-015 | Data backup frequency | Every 6 hours | P0 |
| NFR-016 | Recovery time objective (RTO) | < 4 hours | P1 |

### Security

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-017 | Automated security scan for all submissions | P0 |
| NFR-018 | Credential/secret detection in templates | P0 |
| NFR-019 | PCI DSS compliance via Stripe | P0 |
| NFR-020 | Publisher identity verification (KYC via Stripe) | P0 |
| NFR-021 | HTTPS for all marketplace pages | P0 |
| NFR-022 | Rate limiting on all public endpoints | P0 |
| NFR-023 | Input sanitization for reviews/descriptions | P0 |
| NFR-024 | XSS prevention in markdown rendering | P0 |

### Compliance

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-025 | GDPR: User data export capability | P1 |
| NFR-026 | GDPR: Right to deletion | P1 |
| NFR-027 | Tax reporting (1099 for US publishers) | P1 |
| NFR-028 | DMCA takedown process | P1 |
| NFR-029 | Terms of service acknowledgment | P0 |
| NFR-030 | Age verification (18+) for publishers | P0 |

---

## 7. Technical Architecture

### System Diagram

```
+------------------------------------------------------------------+
|                         Marketplace System                         |
+------------------------------------------------------------------+
|                                                                    |
|  +--------------------+  +--------------------+  +---------------+ |
|  |    Frontend UI     |  |   Admin Portal    |  | Publisher     | |
|  |   (React/Next.js)  |  |   (Admin UI)      |  | Dashboard     | |
|  +--------+-----------+  +--------+-----------+  +-------+-------+ |
|           |                       |                      |         |
|           v                       v                      v         |
|  +----------------------------------------------------------+     |
|  |                      API Layer (tRPC)                     |     |
|  |  +-------------+  +---------------+  +------------------+ |     |
|  |  | marketplace |  | marketplace.  |  | marketplace.     | |     |
|  |  | .listItems  |  | submitTemplate|  | publisherDashbd  | |     |
|  |  | .getDetails |  | .rateTemplate |  | .getEarnings     | |     |
|  |  | .install    |  | .getReviews   |  | .requestPayout   | |     |
|  |  | .checkout   |  | .reportContent|  | .analytics       | |     |
|  |  +-------------+  +---------------+  +------------------+ |     |
|  +----------------------------------------------------------+     |
|                              |                                     |
|         +--------------------+--------------------+                |
|         v                    v                    v                |
|  +-------------+     +---------------+     +----------------+      |
|  | Template    |     | Review        |     | Transaction    |      |
|  | Service     |     | Service       |     | Service        |      |
|  |             |     |               |     |                |      |
|  | - CRUD      |     | - Ratings     |     | - Checkout     |      |
|  | - Search    |     | - Reviews     |     | - Refunds      |      |
|  | - Version   |     | - Moderation  |     | - Payouts      |      |
|  | - Install   |     | - Aggregation |     | - Revenue      |      |
|  +------+------+     +-------+-------+     +--------+-------+      |
|         |                    |                      |              |
|         +--------------------+----------------------+              |
|                              |                                     |
|                              v                                     |
|  +----------------------------------------------------------+     |
|  |                     Data Layer                            |     |
|  |  +------------------+  +------------------+  +-----------+|     |
|  |  | marketplace_     |  | marketplace_     |  | marketplace||     |
|  |  | templates        |  | reviews          |  | _purchases ||     |
|  |  +------------------+  +------------------+  +-----------+|     |
|  |  +------------------+  +------------------+  +-----------+|     |
|  |  | marketplace_     |  | marketplace_     |  | publisher_ ||     |
|  |  | installations    |  | publishers       |  | payouts    ||     |
|  |  +------------------+  +------------------+  +-----------+|     |
|  +----------------------------------------------------------+     |
|                              |                                     |
|                              v                                     |
|  +----------------------------------------------------------+     |
|  |                   PostgreSQL (Supabase)                    |     |
|  +----------------------------------------------------------+     |
|                              |                                     |
+------------------------------+-------------------------------------+
                               |
       +-----------------------+-----------------------+
       v                       v                       v
+-------------+         +-------------+         +--------------+
|   Stripe    |         |   Supabase  |         |   CDN        |
|  Payments   |         |   Storage   |         | (Cloudflare) |
|             |         |             |         |              |
| - Checkout  |         | - Images    |         | - Screenshots|
| - Connect   |         | - Assets    |         | - Thumbnails |
| - Webhooks  |         | - Downloads |         | - Cache      |
+-------------+         +-------------+         +--------------+
```

### Data Flow: Template Purchase

```
User clicks "Buy Template"
            |
            v
+------------------------+
| Create Stripe Checkout |
| Session with metadata  |
| - userId               |
| - templateId           |
| - publisherId          |
| - price                |
+------------------------+
            |
            v
+------------------------+
| Redirect to Stripe     |
| Checkout Page          |
+------------------------+
            |
            v
+------------------------+
| User completes payment |
+------------------------+
            |
            v
+------------------------+
| Stripe sends webhook   |
| checkout.session.      |
| completed              |
+------------------------+
            |
            v
+------------------------+
| Webhook handler:       |
| 1. Verify signature    |
| 2. Create purchase     |
|    record              |
| 3. Calculate splits:   |
|    - Publisher: 70%    |
|    - Platform: 30%     |
| 4. Install template    |
|    to user workspace   |
| 5. Send confirmation   |
|    email               |
| 6. Update analytics    |
+------------------------+
            |
            v
+------------------------+
| Stripe Connect:        |
| Transfer 70% to        |
| publisher account      |
| (monthly payout)       |
+------------------------+
```

### Security Flow: Template Submission

```
Publisher submits template
            |
            v
+------------------------+
| Step 1: Validation     |
| - Schema validation    |
| - Size limits          |
| - Required fields      |
+------------------------+
            |
            v
+------------------------+
| Step 2: Sanitization   |
| - Remove API keys      |
| - Strip credentials    |
| - Sanitize URLs        |
| - Clean environment    |
|   variables            |
+------------------------+
            |
            v
+------------------------+
| Step 3: Security Scan  |
| - Malicious code       |
|   detection            |
| - Suspicious patterns  |
| - External URL check   |
| - Resource usage       |
|   estimation           |
+------------------------+
            |
            +--------+--------+
            |                 |
         PASS              FAIL
            |                 |
            v                 v
+------------------+  +------------------+
| Step 4: Manual   |  | Reject with      |
| Review Queue     |  | security reason  |
| - Quality check  |  +------------------+
| - Policy check   |
| - Test execution |
+------------------+
            |
            +--------+--------+
            |                 |
       APPROVE            REJECT
            |                 |
            v                 v
+------------------+  +------------------+
| Publish template |  | Return to        |
| to marketplace   |  | publisher with   |
+------------------+  | feedback         |
                      +------------------+
```

---

## 8. Data Models

### Marketplace Template

```typescript
interface MarketplaceTemplate {
  id: number;                          // Primary key
  publisherId: number;                 // FK to marketplace_publishers
  workflowId: number;                  // FK to automation_workflows (source)

  // Core metadata
  title: string;                       // 5-100 characters
  slug: string;                        // URL-friendly identifier
  description: string;                 // 50-5000 characters, markdown
  shortDescription: string;            // 50-200 characters for cards

  // Categorization
  category: TemplateCategory;          // Browser Automation, Data Extraction, etc.
  tags: string[];                      // Up to 10 custom tags

  // Media
  thumbnailUrl: string;                // Main thumbnail image
  screenshots: string[];               // 1-5 screenshot URLs
  demoVideoUrl?: string;               // YouTube/Vimeo URL

  // Pricing
  pricingType: 'free' | 'one_time' | 'subscription';
  priceInCents?: number;               // null for free
  subscriptionPeriod?: 'monthly' | 'yearly';

  // Workflow definition
  workflowDefinition: WorkflowDefinition; // Sanitized JSON
  inputSchema: JSONSchema;              // Required inputs
  outputSchema: JSONSchema;             // Expected outputs
  requirements: string[];               // e.g., "Google API Key required"

  // Versioning
  version: string;                     // Semantic versioning (1.0.0)
  changelog?: string;                  // Markdown changelog
  minPlatformVersion?: string;         // Minimum platform compatibility

  // Stats (denormalized for performance)
  installCount: number;                // Total installations
  averageRating: number;               // 0.0 - 5.0
  ratingCount: number;                 // Number of ratings

  // Status
  status: TemplateStatus;
  publishedAt?: Date;
  featuredAt?: Date;                   // If featured

  // Audit
  createdAt: Date;
  updatedAt: Date;
}

type TemplateCategory =
  | 'browser_automation'
  | 'data_extraction'
  | 'monitoring'
  | 'integration'
  | 'reporting'
  | 'marketing'
  | 'sales'
  | 'customer_support'
  | 'productivity'
  | 'other';

type TemplateStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'archived'
  | 'rejected'
  | 'suspended';
```

### Marketplace Publisher

```typescript
interface MarketplacePublisher {
  id: number;                          // Primary key
  userId: number;                      // FK to users

  // Profile
  displayName: string;                 // 2-50 characters
  slug: string;                        // URL-friendly identifier
  bio: string;                         // Up to 500 characters
  avatarUrl?: string;                  // Profile image
  websiteUrl?: string;                 // Publisher website

  // Stripe Connect
  stripeAccountId: string;             // Stripe Connect account ID
  stripeAccountStatus: 'pending' | 'active' | 'restricted';
  payoutsEnabled: boolean;

  // Stats (denormalized)
  templateCount: number;               // Published templates
  totalInstalls: number;               // Total installations
  totalEarnings: number;               // Lifetime earnings in cents
  averageRating: number;               // Average across all templates

  // Status
  status: PublisherStatus;
  tier: 'bronze' | 'silver' | 'gold';  // Based on performance
  verifiedAt?: Date;

  // Audit
  createdAt: Date;
  updatedAt: Date;
}

type PublisherStatus =
  | 'pending_review'
  | 'active'
  | 'suspended'
  | 'banned';
```

### Marketplace Review

```typescript
interface MarketplaceReview {
  id: number;                          // Primary key
  templateId: number;                  // FK to marketplace_templates
  userId: number;                      // FK to users
  purchaseId?: number;                 // FK to marketplace_purchases (null if free)

  // Review content
  rating: number;                      // 1-5
  title?: string;                      // Optional title (5-100 chars)
  content?: string;                    // Review text (10-1000 chars)

  // Publisher response
  publisherResponse?: string;          // Up to 500 chars
  publisherRespondedAt?: Date;

  // Moderation
  isVerifiedPurchase: boolean;
  helpfulCount: number;                // Upvotes
  reportCount: number;                 // Times reported
  isHidden: boolean;                   // Hidden by moderation

  // Audit
  createdAt: Date;
  updatedAt: Date;
}
```

### Marketplace Purchase

```typescript
interface MarketplacePurchase {
  id: number;                          // Primary key
  templateId: number;                  // FK to marketplace_templates
  userId: number;                      // FK to users
  publisherId: number;                 // FK to marketplace_publishers

  // Transaction
  stripeSessionId: string;             // Stripe Checkout session
  stripePaymentIntentId?: string;      // Payment intent ID
  amount: number;                      // Total in cents
  currency: string;                    // e.g., 'usd'

  // Revenue split
  publisherAmount: number;             // 70% in cents
  platformAmount: number;              // 30% in cents

  // Status
  status: PurchaseStatus;
  refundedAt?: Date;
  refundReason?: string;

  // Installation
  installedAt?: Date;
  installationId?: number;             // FK to marketplace_installations

  // Audit
  createdAt: Date;
  updatedAt: Date;
}

type PurchaseStatus =
  | 'pending'
  | 'completed'
  | 'refunded'
  | 'disputed'
  | 'failed';
```

### Marketplace Installation

```typescript
interface MarketplaceInstallation {
  id: number;                          // Primary key
  templateId: number;                  // FK to marketplace_templates
  userId: number;                      // FK to users
  purchaseId?: number;                 // FK to marketplace_purchases (null if free)

  // Installed workflow
  workflowId: number;                  // FK to automation_workflows (user's copy)
  installedVersion: string;            // Version at install time
  currentVersion: string;              // Current version (after updates)

  // Update tracking
  updateAvailable: boolean;
  lastUpdateCheck: Date;

  // Status
  status: 'active' | 'uninstalled' | 'disabled';

  // Audit
  installedAt: Date;
  updatedAt: Date;
  uninstalledAt?: Date;
}
```

### Publisher Payout

```typescript
interface PublisherPayout {
  id: number;                          // Primary key
  publisherId: number;                 // FK to marketplace_publishers

  // Payout details
  amount: number;                      // Amount in cents
  currency: string;                    // e.g., 'usd'
  periodStart: Date;                   // Earnings period start
  periodEnd: Date;                     // Earnings period end

  // Stripe
  stripeTransferId?: string;           // Stripe Transfer ID
  stripePayoutId?: string;             // Stripe Payout ID

  // Status
  status: PayoutStatus;
  processedAt?: Date;
  failureReason?: string;

  // Audit
  createdAt: Date;
  updatedAt: Date;
}

type PayoutStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';
```

---

## 9. API Endpoints

### tRPC Router Procedures

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `marketplace.getProducts` | Query | Public | Get credit packages and products |
| `marketplace.listTemplates` | Query | Public | Browse templates with filters |
| `marketplace.searchTemplates` | Query | Public | Full-text search |
| `marketplace.getTemplateDetails` | Query | Public | Get single template details |
| `marketplace.getTemplateReviews` | Query | Public | Get reviews for template |
| `marketplace.createCheckout` | Mutation | Protected | Create Stripe checkout session |
| `marketplace.verifyCheckout` | Query | Public | Verify checkout completion |
| `marketplace.installTemplate` | Mutation | Protected | Install free template |
| `marketplace.rateTemplate` | Mutation | Protected | Submit rating/review |
| `marketplace.reportContent` | Mutation | Protected | Report template or review |
| `marketplace.getUserInstallations` | Query | Protected | List user's installations |
| `marketplace.updateInstallation` | Mutation | Protected | Update to new version |
| `marketplace.uninstall` | Mutation | Protected | Remove installation |

### Publisher Endpoints

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `marketplace.applyPublisher` | Mutation | Protected | Submit publisher application |
| `marketplace.getPublisherProfile` | Query | Protected | Get own publisher profile |
| `marketplace.updatePublisherProfile` | Mutation | Protected | Update profile info |
| `marketplace.submitTemplate` | Mutation | Protected | Submit new template |
| `marketplace.updateTemplate` | Mutation | Protected | Update existing template |
| `marketplace.getPublisherTemplates` | Query | Protected | List own templates |
| `marketplace.getPublisherAnalytics` | Query | Protected | View analytics |
| `marketplace.getEarnings` | Query | Protected | View earnings summary |
| `marketplace.respondToReview` | Mutation | Protected | Respond to a review |

### Admin Endpoints

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `marketplace.admin.getSubmissions` | Query | Admin | Review queue |
| `marketplace.admin.approveTemplate` | Mutation | Admin | Approve submission |
| `marketplace.admin.rejectTemplate` | Mutation | Admin | Reject submission |
| `marketplace.admin.suspendTemplate` | Mutation | Admin | Suspend published template |
| `marketplace.admin.getReportedContent` | Query | Admin | View reports |
| `marketplace.admin.resolveReport` | Mutation | Admin | Handle report |
| `marketplace.admin.suspendPublisher` | Mutation | Admin | Suspend publisher |
| `marketplace.admin.getAnalytics` | Query | Admin | Platform analytics |

### Request/Response Examples

#### List Templates

**Request:**
```typescript
// marketplace.listTemplates
{
  category?: "browser_automation",
  priceRange?: { min: 0, max: 2500 },  // in cents
  minRating?: 4,
  sortBy?: "popular" | "new" | "rating" | "price_asc" | "price_desc",
  page?: 1,
  limit?: 20
}
```

**Response:**
```typescript
{
  templates: [
    {
      id: 123,
      title: "LinkedIn Lead Scraper Pro",
      shortDescription: "Extract leads from LinkedIn search results...",
      thumbnailUrl: "https://cdn.example.com/templates/123/thumb.png",
      category: "data_extraction",
      pricingType: "one_time",
      priceInCents: 2900,
      averageRating: 4.7,
      ratingCount: 142,
      installCount: 1823,
      publisher: {
        id: 45,
        displayName: "AutomationPro",
        avatarUrl: "https://cdn.example.com/publishers/45/avatar.png"
      }
    },
    // ...more templates
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 156,
    pages: 8
  }
}
```

#### Submit Rating

**Request:**
```typescript
// marketplace.rateTemplate
{
  templateId: 123,
  rating: 5,
  title: "Exactly what I needed!",
  content: "This template saved me hours of work. The extraction is accurate and the setup was straightforward. Highly recommended for anyone doing lead generation."
}
```

**Response:**
```typescript
{
  success: true,
  review: {
    id: 456,
    rating: 5,
    title: "Exactly what I needed!",
    content: "This template saved me hours...",
    isVerifiedPurchase: true,
    createdAt: "2026-01-11T14:30:00Z"
  },
  updatedTemplateRating: 4.71
}
```

---

## 10. UI/UX Specifications

### Marketplace Browse Page

```
+------------------------------------------------------------------+
|  Marketplace                                    [Search...   ] Q  |
+------------------------------------------------------------------+
|                                                                    |
|  [All] [Browser] [Data] [Monitor] [Integration] [Marketing] ...  |
|                                                                    |
|  Filters:                                                Sort: [Popular v]|
|  [v] Free    [ ] Under $10    [ ] $10-25    [ ] $25+             |
|  [ ] 4+ Stars    [ ] 3+ Stars                                     |
|                                                                    |
|  +-------------------+  +-------------------+  +-------------------+|
|  |  [Screenshot]     |  |  [Screenshot]     |  |  [Screenshot]     ||
|  |                   |  |                   |  |                   ||
|  |  LinkedIn Lead    |  |  Price Monitor    |  |  CRM Sync Pro     ||
|  |  Scraper Pro      |  |                   |  |                   ||
|  |                   |  |  Track competitor |  |  Auto-sync leads  ||
|  |  Extract leads    |  |  prices daily     |  |  to HubSpot       ||
|  |  from LinkedIn    |  |                   |  |                   ||
|  |                   |  |  ****- (4.2)      |  |  ***** (4.9)      ||
|  |  ***** (4.7)      |  |  328 installs     |  |  2.1K installs    ||
|  |  1.8K installs    |  |                   |  |                   ||
|  |                   |  |  FREE             |  |  $49              ||
|  |  $29              |  |  [Install]        |  |  [Buy Now]        ||
|  |  [View Details]   |  |  [View Details]   |  |  [View Details]   ||
|  +-------------------+  +-------------------+  +-------------------+|
|                                                                    |
|  [1] [2] [3] ... [8]  Next >                                      |
|                                                                    |
+------------------------------------------------------------------+
```

### Template Detail Page

```
+------------------------------------------------------------------+
|  < Back to Marketplace                                             |
+------------------------------------------------------------------+
|                                                                    |
|  +-------------------------+  +--------------------------------+  |
|  |                         |  |  LinkedIn Lead Scraper Pro      |  |
|  |    [Main Screenshot]    |  |                                 |  |
|  |                         |  |  by AutomationPro  [Verified]   |  |
|  |                         |  |                                 |  |
|  +-------------------------+  |  ***** 4.7 (142 reviews)        |  |
|  |[1]||[2]||[3]||[4]||[5] |  |  1,823 installations            |  |
|  +-------------------------+  |                                 |  |
|                               |  $29.00  one-time               |  |
|                               |                                 |  |
|                               |  +---------------------------+  |  |
|                               |  |      [Buy Now]            |  |  |
|                               |  +---------------------------+  |  |
|                               |                                 |  |
|                               |  v 2.1.0 | Updated 3 days ago   |  |
|                               +--------------------------------+  |
|                                                                    |
|  [Description] [Requirements] [Reviews] [Changelog] [Publisher]   |
|  ----------------------------------------------------------------  |
|                                                                    |
|  ## Description                                                    |
|                                                                    |
|  Extract targeted leads from LinkedIn search results with this    |
|  powerful automation template. Simply provide your search         |
|  criteria and let the bot collect:                                |
|                                                                    |
|  - Full names and job titles                                      |
|  - Company names and industries                                   |
|  - Profile URLs for follow-up                                     |
|  - Location information                                           |
|                                                                    |
|  **Features:**                                                    |
|  - Pagination handling (up to 100 pages)                          |
|  - Smart rate limiting to avoid detection                         |
|  - Export to CSV, JSON, or Google Sheets                          |
|  - Detailed execution logs                                        |
|                                                                    |
|  [Watch Demo Video]                                               |
|                                                                    |
+------------------------------------------------------------------+
```

### Reviews Section

```
+------------------------------------------------------------------+
|  Reviews (142)                                                     |
+------------------------------------------------------------------+
|                                                                    |
|  +------------------------+   Rating Breakdown                     |
|  |  ***** 4.7 average     |   5 stars ========== 89 (63%)         |
|  |  142 reviews           |   4 stars ====       31 (22%)         |
|  +------------------------+   3 stars ==         14 (10%)         |
|                               2 stars            5 (4%)           |
|  Sort by: [Most Recent v]     1 stars            3 (2%)           |
|                                                                    |
|  ----------------------------------------------------------------  |
|                                                                    |
|  ***** "Exactly what I needed!"                    Verified        |
|  by John D. - January 10, 2026                                    |
|                                                                    |
|  This template saved me hours of work. The extraction is accurate |
|  and the setup was straightforward. Highly recommended for anyone |
|  doing lead generation.                                           |
|                                                                    |
|  Was this helpful? [Yes 12] [No 0]  |  [Report]                   |
|                                                                    |
|    +-- Publisher Response (AutomationPro):                        |
|    |   Thank you John! Glad it's working well for you. Let me    |
|    |   know if you need any help with the advanced features.     |
|    +--------------------------------------------------------------+
|                                                                    |
|  ----------------------------------------------------------------  |
|                                                                    |
|  **** "Great but needs better docs"                Verified        |
|  by Sarah M. - January 8, 2026                                    |
|                                                                    |
|  The template works well but I struggled with the initial setup.  |
|  Would appreciate more detailed documentation or a video tutorial.|
|                                                                    |
|  Was this helpful? [Yes 8] [No 1]  |  [Report]                    |
|                                                                    |
|  [Load More Reviews]                                              |
|                                                                    |
+------------------------------------------------------------------+
```

### Publisher Dashboard

```
+------------------------------------------------------------------+
|  Publisher Dashboard                            [+ Submit Template]|
+------------------------------------------------------------------+
|                                                                    |
|  +------------+  +------------+  +------------+  +------------+    |
|  |   $1,247   |  |    892     |  |    4.6     |  |     3      |   |
|  |  Earnings  |  |  Installs  |  |  Avg Rating |  | Templates  |   |
|  |  This Month |  | This Month |  |            |  |            |   |
|  +------------+  +------------+  +------------+  +------------+    |
|                                                                    |
|  Earnings Trend                                                    |
|  +--------------------------------------------------------------+  |
|  |    $1.5K |                                          ___      |  |
|  |    $1.0K |                              ___    ___/   \     |  |
|  |    $0.5K |              ___    ___   __/   \__/         \    |  |
|  |       $0 |___  ___  __/   \__/   \_/                         |  |
|  |         Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct     |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  My Templates                                                      |
|  +--------------------------------------------------------------+  |
|  | Template               | Status    | Installs | Rating | Rev  ||
|  |------------------------|-----------|----------|--------|------||
|  | LinkedIn Lead Scraper  | Published |    1,823 |   4.7  |$1,847||
|  | Price Monitor Bot      | Published |      328 |   4.2  |  $0  ||
|  | CRM Sync Pro           | In Review |        - |      - |    - ||
|  +--------------------------------------------------------------+  |
|                                                                    |
|  Recent Reviews                                    [View All]      |
|  +--------------------------------------------------------------+  |
|  | ***** John D. - "Exactly what I needed!"       [Respond]      ||
|  | **** Sarah M. - "Great but needs better docs"  [Respond]      ||
|  | ***** Mike T. - "Best scraper I've used"       Responded      ||
|  +--------------------------------------------------------------+  |
|                                                                    |
+------------------------------------------------------------------+
```

---

## 11. Dependencies

### Internal Dependencies

| Component | Purpose | Integration Point |
|-----------|---------|-------------------|
| User Authentication | Identity verification | `ctx.user.id` in protected procedures |
| Workflows Router | Workflow import/export | Clone workflow definitions |
| Templates Router | Template execution | Execute installed templates |
| Credit System | Credit-based purchases | Deduct credits on purchase |
| Subscription Service | Plan limits | Publisher tier benefits |
| Analytics Module | Usage tracking | Installation and revenue metrics |
| Email Service | Notifications | Purchase confirmations, payouts |

### External Dependencies

| Service | Purpose | Version/Notes |
|---------|---------|---------------|
| PostgreSQL (Supabase) | Primary database | 15.x |
| Stripe | Payment processing | v14.x, Connect for payouts |
| Stripe Connect | Publisher payouts | Standard accounts |
| Supabase Storage | Screenshot/media hosting | Via Supabase |
| Cloudflare CDN | Asset delivery | For images, thumbnails |
| tRPC | API framework | 11.x |
| Zod | Schema validation | 3.x |
| Drizzle ORM | Database queries | Latest |

### Environment Variables

```bash
# Required for Marketplace
STRIPE_SECRET_KEY=               # Stripe API key
STRIPE_WEBHOOK_SECRET=           # Stripe webhook signing
STRIPE_CONNECT_PLATFORM_ID=      # Platform account ID

# Storage
SUPABASE_URL=                    # Supabase project URL
SUPABASE_SERVICE_KEY=            # Service role key for storage

# CDN (optional, improves performance)
CDN_URL=                         # CDN base URL for assets

# Feature Flags
MARKETPLACE_ENABLED=true         # Enable/disable marketplace
PUBLISHER_APPLICATIONS_OPEN=true # Accept new publishers
```

---

## 12. Out of Scope

The following items are explicitly excluded from this initial release:

### Not Included in v1.0

| Item | Reason | Future Version |
|------|--------|----------------|
| **AI-generated templates** | Requires additional AI infrastructure | v2.0 |
| **Template bundles** | Complexity of bundle pricing and licensing | v1.5 |
| **White-label marketplace** | Enterprise feature requiring customization | v2.0 |
| **Affiliate/referral program** | Needs separate tracking and payout system | v1.5 |
| **Template subscriptions** | Monthly recurring adds complexity | v1.5 |
| **Private/enterprise templates** | Requires access control infrastructure | v2.0 |
| **Template A/B testing** | Publisher-level feature, lower priority | v2.0 |
| **Multi-language support** | Internationalization not in initial scope | v2.0 |
| **Physical goods/services** | Digital templates only | Never |
| **Custom commission rates** | Uniform 70/30 split for simplicity | v2.0 |

### Technical Exclusions

| Item | Reason |
|------|--------|
| GraphQL API | tRPC provides type-safety, no need for GraphQL |
| Real-time auction/bidding | Templates use fixed pricing |
| Cryptocurrency payments | Stripe-only for v1.0 |
| On-premise deployment | Cloud-only marketplace |

---

## 13. Risks & Mitigations

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Malicious template submissions** | Medium | Critical | Automated security scanning, manual review, sandboxed execution |
| **Payment processing failures** | Low | High | Stripe webhooks with retry, idempotent operations |
| **Credential leakage in templates** | Medium | Critical | Automated credential detection, strict sanitization |
| **Database performance at scale** | Medium | Medium | Caching, read replicas, denormalized stats |
| **CDN/storage failures** | Low | Medium | Fallback URLs, multi-region storage |
| **Version compatibility issues** | Medium | Medium | Minimum version requirements, compatibility testing |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Low publisher adoption** | Medium | High | Publisher incentive program, featured placements |
| **Low-quality template submissions** | High | Medium | Strict review process, quality guidelines, ratings |
| **Fraudulent purchases/chargebacks** | Low | Medium | Stripe Radar fraud detection, purchase limits |
| **Copyright/IP disputes** | Low | High | DMCA process, clear terms of service |
| **Price race to bottom** | Medium | Medium | Quality tiers, featured placements, minimum prices |
| **Publisher payout disputes** | Low | Medium | Clear revenue tracking, Stripe Connect transparency |

### Legal/Compliance Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **GDPR data handling** | Low | High | Data export capability, deletion workflow |
| **Tax compliance (sales tax)** | Medium | Medium | Stripe Tax for automatic calculation |
| **Publisher tax reporting** | Medium | Medium | Stripe Connect handles 1099s |
| **Terms of service violations** | Medium | Medium | Clear ToS, moderation tools, suspension capability |

### Contingency Plans

1. **Security Incident in Template**
   - Immediately suspend template
   - Notify all users who installed
   - Issue automatic refunds if needed
   - Conduct post-mortem and improve scanning

2. **Payment System Outage**
   - Display maintenance message
   - Queue purchase intents
   - Process when restored
   - Extend any time-sensitive offers

3. **Publisher Fraud Detection**
   - Freeze publisher account
   - Hold pending payouts
   - Investigate transactions
   - Reverse fraudulent purchases

---

## 14. Milestones & Timeline

### Phase 1: Foundation (Weeks 1-4)

| Milestone | Deliverables | Owner | Status |
|-----------|--------------|-------|--------|
| **M1.1** Database Schema | All marketplace tables created | Backend | Planned |
| **M1.2** Template CRUD | Create, read, update, delete templates | Backend | Planned |
| **M1.3** Browse/Search UI | Template listing and search | Frontend | Planned |
| **M1.4** Template Detail Page | Full template view with media | Frontend | Planned |
| **M1.5** Stripe Integration | Checkout sessions (existing enhanced) | Backend | Partial |

**Exit Criteria:**
- [ ] Users can browse and view template details
- [ ] Search returns relevant results
- [ ] Database supports all planned entities

### Phase 2: Purchases & Ratings (Weeks 5-8)

| Milestone | Deliverables | Owner | Status |
|-----------|--------------|-------|--------|
| **M2.1** Free Installation | One-click install for free templates | Backend | Planned |
| **M2.2** Paid Purchase Flow | End-to-end purchase and install | Backend | Planned |
| **M2.3** Rating System | Submit and display ratings/reviews | Backend | Planned |
| **M2.4** Review UI | Rating submission and display | Frontend | Planned |
| **M2.5** User Installations | My installations page | Frontend | Planned |

**Exit Criteria:**
- [ ] Users can purchase and install templates
- [ ] Rating submission works end-to-end
- [ ] Users can view their installation history

### Phase 3: Publisher System (Weeks 9-12)

| Milestone | Deliverables | Owner | Status |
|-----------|--------------|-------|--------|
| **M3.1** Publisher Application | Application and approval workflow | Backend | Planned |
| **M3.2** Stripe Connect | Publisher onboarding and accounts | Backend | Planned |
| **M3.3** Template Submission | Submit workflow as template | Backend | Planned |
| **M3.4** Review Queue | Admin review interface | Admin | Planned |
| **M3.5** Publisher Dashboard | Publisher analytics and management | Frontend | Planned |

**Exit Criteria:**
- [ ] Publishers can apply and get approved
- [ ] Templates can be submitted and reviewed
- [ ] Publisher dashboard shows analytics

### Phase 4: Revenue & Polish (Weeks 13-16)

| Milestone | Deliverables | Owner | Status |
|-----------|--------------|-------|--------|
| **M4.1** Revenue Tracking | Earnings calculation and display | Backend | Planned |
| **M4.2** Payout System | Monthly automatic payouts | Backend | Planned |
| **M4.3** Template Updates | Version management and updates | Backend | Planned |
| **M4.4** Admin Analytics | Platform-wide marketplace analytics | Admin | Planned |
| **M4.5** Content Moderation | Report and moderation tools | Backend | Planned |
| **M4.6** Performance & Launch | Optimization and launch | All | Planned |

**Exit Criteria:**
- [ ] Publishers receive payouts correctly
- [ ] Template updates notify users
- [ ] Admin has full visibility into platform
- [ ] Performance meets all NFRs

---

## 15. Acceptance Criteria

### Functional Acceptance

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-001 | User can browse templates with category/price/rating filters | P0 |
| AC-002 | User can search templates and see relevant results | P0 |
| AC-003 | User can view full template details including screenshots | P0 |
| AC-004 | User can install free templates with one click | P0 |
| AC-005 | User can purchase paid templates via Stripe | P0 |
| AC-006 | User can rate and review installed templates | P0 |
| AC-007 | User can view and manage their installations | P0 |
| AC-008 | User can update installed templates to new versions | P1 |
| AC-009 | Publisher can apply and get approved | P0 |
| AC-010 | Publisher can submit templates for review | P0 |
| AC-011 | Publisher can view earnings and analytics | P1 |
| AC-012 | Publisher can respond to reviews | P1 |
| AC-013 | Publisher receives automated payouts | P1 |
| AC-014 | Admin can review and approve/reject submissions | P0 |
| AC-015 | Admin can moderate content and publishers | P1 |
| AC-016 | Admin can view platform analytics | P1 |

### Performance Acceptance

| ID | Criterion | Target |
|----|-----------|--------|
| AC-P01 | Template list loads in < 500ms (P95) | Required |
| AC-P02 | Search results return in < 300ms (P95) | Required |
| AC-P03 | Template installation completes in < 5s | Required |
| AC-P04 | Checkout redirect in < 3s | Required |
| AC-P05 | Marketplace uptime >= 99.9% | Required |

### Security Acceptance

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-S01 | All template submissions pass automated security scan | P0 |
| AC-S02 | No credentials exposed in published templates | P0 |
| AC-S03 | Stripe handles all payment card data (PCI compliance) | P0 |
| AC-S04 | Publisher identity verified via Stripe Connect KYC | P0 |
| AC-S05 | HMAC signature verification on Stripe webhooks | P0 |

---

## Appendix A: Database Schema (SQL)

```sql
-- Marketplace Publishers
CREATE TABLE marketplace_publishers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
  display_name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  website_url TEXT,
  stripe_account_id VARCHAR(100),
  stripe_account_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payouts_enabled BOOLEAN NOT NULL DEFAULT false,
  template_count INTEGER NOT NULL DEFAULT 0,
  total_installs INTEGER NOT NULL DEFAULT 0,
  total_earnings INTEGER NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending_review',
  tier VARCHAR(20) NOT NULL DEFAULT 'bronze',
  verified_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Marketplace Templates
CREATE TABLE marketplace_templates (
  id SERIAL PRIMARY KEY,
  publisher_id INTEGER NOT NULL REFERENCES marketplace_publishers(id),
  workflow_id INTEGER NOT NULL REFERENCES automation_workflows(id),
  title VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  short_description VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  thumbnail_url TEXT NOT NULL,
  screenshots TEXT[] NOT NULL DEFAULT '{}',
  demo_video_url TEXT,
  pricing_type VARCHAR(20) NOT NULL DEFAULT 'free',
  price_in_cents INTEGER,
  subscription_period VARCHAR(20),
  workflow_definition JSONB NOT NULL,
  input_schema JSONB,
  output_schema JSONB,
  requirements TEXT[] NOT NULL DEFAULT '{}',
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  changelog TEXT,
  min_platform_version VARCHAR(20),
  install_count INTEGER NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP,
  featured_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Marketplace Reviews
CREATE TABLE marketplace_reviews (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES marketplace_templates(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  purchase_id INTEGER REFERENCES marketplace_purchases(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(100),
  content TEXT,
  publisher_response TEXT,
  publisher_responded_at TIMESTAMP,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  report_count INTEGER NOT NULL DEFAULT 0,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- Marketplace Purchases
CREATE TABLE marketplace_purchases (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES marketplace_templates(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  publisher_id INTEGER NOT NULL REFERENCES marketplace_publishers(id),
  stripe_session_id VARCHAR(100) NOT NULL UNIQUE,
  stripe_payment_intent_id VARCHAR(100),
  amount INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'usd',
  publisher_amount INTEGER NOT NULL,
  platform_amount INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  refunded_at TIMESTAMP,
  refund_reason TEXT,
  installed_at TIMESTAMP,
  installation_id INTEGER REFERENCES marketplace_installations(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Marketplace Installations
CREATE TABLE marketplace_installations (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES marketplace_templates(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  purchase_id INTEGER REFERENCES marketplace_purchases(id),
  workflow_id INTEGER NOT NULL REFERENCES automation_workflows(id),
  installed_version VARCHAR(20) NOT NULL,
  current_version VARCHAR(20) NOT NULL,
  update_available BOOLEAN NOT NULL DEFAULT false,
  last_update_check TIMESTAMP NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  installed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  uninstalled_at TIMESTAMP
);

-- Publisher Payouts
CREATE TABLE publisher_payouts (
  id SERIAL PRIMARY KEY,
  publisher_id INTEGER NOT NULL REFERENCES marketplace_publishers(id),
  amount INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'usd',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  stripe_transfer_id VARCHAR(100),
  stripe_payout_id VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  processed_at TIMESTAMP,
  failure_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_templates_category ON marketplace_templates(category);
CREATE INDEX idx_templates_status ON marketplace_templates(status);
CREATE INDEX idx_templates_publisher ON marketplace_templates(publisher_id);
CREATE INDEX idx_templates_search ON marketplace_templates USING GIN(to_tsvector('english', title || ' ' || description || ' ' || array_to_string(tags, ' ')));
CREATE INDEX idx_reviews_template ON marketplace_reviews(template_id);
CREATE INDEX idx_reviews_user ON marketplace_reviews(user_id);
CREATE INDEX idx_purchases_user ON marketplace_purchases(user_id);
CREATE INDEX idx_purchases_template ON marketplace_purchases(template_id);
CREATE INDEX idx_installations_user ON marketplace_installations(user_id);
CREATE INDEX idx_payouts_publisher ON publisher_payouts(publisher_id);
CREATE INDEX idx_payouts_status ON publisher_payouts(status);
```

---

## Appendix B: Template Categories

| Category ID | Display Name | Description |
|-------------|--------------|-------------|
| `browser_automation` | Browser Automation | General browser automation tasks |
| `data_extraction` | Data Extraction | Scraping and data collection |
| `monitoring` | Monitoring | Website and content monitoring |
| `integration` | Integration | Connect multiple services |
| `reporting` | Reporting | Generate reports and analytics |
| `marketing` | Marketing | Marketing automation tasks |
| `sales` | Sales | Sales and lead generation |
| `customer_support` | Customer Support | Support and ticketing automation |
| `productivity` | Productivity | Personal and team productivity |
| `social_media` | Social Media | Social media management |
| `ecommerce` | E-commerce | Online store automation |
| `other` | Other | Uncategorized templates |

---

## Appendix C: Related PRDs

| PRD | Relationship |
|-----|--------------|
| PRD-002: Workflow Automation | Source of template workflow definitions |
| PRD-015: Developer API & Marketplace | Overlaps on marketplace payments |
| PRD-022: Cost & Credit Management | Credit-based purchases |
| PRD-028: Subscription Management | Publisher tier benefits |
| PRD-038: Notification System | Purchase and payout notifications |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | Platform Team | Initial PRD creation |

---

**Document Status:** Ready for Review
**Next Review:** February 2026
**Stakeholders:** Engineering, Product, Finance, Legal, Developer Experience
