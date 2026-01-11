# PRD-033: Onboarding Flows

## Product Requirements Document

### Overview
| Field | Value |
|-------|-------|
| **PRD ID** | PRD-033 |
| **Feature Name** | Onboarding Flows |
| **Category** | User Experience & Engagement |
| **Priority** | P0 - Critical |
| **Status** | Active |
| **Owner** | Product & Growth Team |
| **Core API Location** | `server/_core/onboarding.ts` |
| **Router Location** | `server/api/routers/onboarding.ts` |

---

## 1. Executive Summary

The Onboarding Flows system is a comprehensive user onboarding platform that guides new users through progressive setup wizards, interactive tutorials, and feature discovery experiences. The system collects essential business information for customer segmentation and upselling opportunities, validates third-party integrations (GoHighLevel API), manages brand asset uploads, and initializes user preferences. It serves as the critical first touchpoint for user activation and long-term retention.

### Key Capabilities
- **Progressive User Onboarding**: Multi-step guided setup with intelligent progression and validation
- **Interactive Tutorials**: Context-aware feature walkthroughs with tooltips and highlights
- **Feature Discovery**: Progressive disclosure of platform capabilities based on user goals
- **Guided Setup Wizard**: Step-by-step configuration with real-time validation
- **Initial Configuration**: Business profile setup, brand assets, and integration initialization
- **API Key Validation**: Real-time validation of GoHighLevel and other third-party API keys
- **Brand Asset Management**: Logo and brand guidelines upload to S3 with optimized storage
- **Customer Segmentation**: Industry, revenue, and goal-based user categorization

---

## 2. Problem Statement

### Current Challenges

New users face significant barriers to successful platform adoption:

1. **Overwhelming Feature Set**: Users exposed to all features simultaneously without guidance leads to confusion and abandonment
2. **Missing Context**: Platform lacks understanding of user business context, preventing personalized recommendations
3. **Integration Friction**: Manual API key entry without validation causes setup failures and support tickets
4. **Incomplete Profiles**: Users skip profile setup, limiting personalization and upselling opportunities
5. **Time to Value**: Extended time from signup to first successful automation reduces activation rates
6. **Retention Drop-off**: 60% of users who don't complete onboarding churn within 7 days
7. **Support Burden**: High volume of "how do I get started" support requests

### Target Users

| User Type | Needs |
|-----------|-------|
| **Marketing Agency Owners** | Quick setup of client management, automation templates, brand voice configuration |
| **Solo Entrepreneurs** | Simplified onboarding, pre-built templates, minimal configuration |
| **Enterprise Teams** | Multi-user setup, role-based permissions, compliance requirements |
| **Technical Users** | API integration, webhook setup, developer-focused onboarding track |
| **Non-Technical Users** | Visual tutorials, step-by-step guides, contextual help |

---

## 3. Goals & Objectives

### Primary Goals

1. **Maximize Activation Rate**: Guide 90%+ of signups to first successful automation
2. **Collect Business Intelligence**: Gather complete profile data for 95% of users
3. **Reduce Time to Value**: First automation within 5 minutes of signup
4. **Enable Personalization**: Segment users for targeted recommendations and upselling
5. **Minimize Support Load**: Reduce onboarding-related support tickets by 70%

### Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Onboarding Completion Rate | > 85% | Completed / Started |
| Time to Complete Onboarding | < 5 minutes | Average duration |
| Profile Completeness Score | > 90% | Required fields filled |
| First Automation Rate | > 75% | Users with automation within 24h |
| Support Ticket Reduction | 70% decrease | Pre/post comparison |
| 7-Day Retention (Onboarded) | > 80% | Active users day 7 |
| GHL Integration Success | > 95% | Valid API keys |
| NPS Score (Onboarding) | > 60 | Post-onboarding survey |

### OKRs

**Objective 1**: Deliver world-class onboarding experience
- KR1: 90% of users complete full onboarding flow within first session
- KR2: Average onboarding time under 4 minutes
- KR3: Onboarding NPS score of 70+

**Objective 2**: Maximize business intelligence collection
- KR1: 100% capture rate for industry and company size
- KR2: 80% of users connect at least one integration during onboarding
- KR3: 60% of users upload brand assets

**Objective 3**: Drive feature adoption through discovery
- KR1: 50% of users interact with 3+ features in first week
- KR2: Tutorial completion rate of 70%+
- KR3: Feature discovery reduces support tickets by 50%

---

## 4. User Stories

### Epic 1: Progressive Onboarding Flow

#### US-001: Start Onboarding Journey
**As a** new user
**I want to** be guided through initial setup immediately after signup
**So that** I can start using the platform quickly and effectively

**Acceptance Criteria:**
- [ ] Automatically detect first-time users after authentication
- [ ] Display welcome screen with personalized greeting
- [ ] Show progress indicator for onboarding steps
- [ ] Allow skipping with "complete later" option
- [ ] Resume from last completed step on return visit
- [ ] Track onboarding start event for analytics
- [ ] Support mobile-responsive onboarding flow

**Technical Notes:**
- Endpoint: `GET /api/onboarding` (status check)
- Check `user.onboardingCompleted` flag
- Store progress in `userProfiles` table

---

#### US-002: Collect Business Information
**As a** new user
**I want to** provide my business details during setup
**So that** the platform can personalize my experience

**Acceptance Criteria:**
- [ ] Collect full name (required)
- [ ] Collect company name (required)
- [ ] Collect phone number (required)
- [ ] Select industry from predefined list
- [ ] Select monthly revenue range
- [ ] Select employee count range
- [ ] Enter website URL (optional, validated format)
- [ ] Select business goals (multi-select)
- [ ] Allow custom "other" goal entry
- [ ] Real-time validation of all fields
- [ ] Save progress automatically

**Technical Notes:**
- Endpoint: `POST /api/trpc/onboarding.submit`
- Validation via Zod schema `onboardingDataSchema`
- Industry options: marketing-agency, real-estate, healthcare, ecommerce, saas, other

---

#### US-003: Goal Selection
**As a** new user
**I want to** select my primary business goals
**So that** the platform recommends relevant features and templates

**Acceptance Criteria:**
- [ ] Display goal options with icons and descriptions
- [ ] Allow multi-select (minimum 1 required)
- [ ] Provide "other" option with text input
- [ ] Show how goals connect to platform features
- [ ] Update recommendations based on selections
- [ ] Store goals for segmentation and personalization

**Goal Options:**
```
- Lead generation and management
- Marketing automation
- Client communication
- Social media management
- Content creation
- Analytics and reporting
- Website development
- AI assistance
- Other (custom input)
```

---

#### US-004: Validate GoHighLevel API Key
**As a** user with a GoHighLevel account
**I want to** connect my GHL account during onboarding
**So that** I can use GHL-powered features immediately

**Acceptance Criteria:**
- [ ] Display GHL integration step (optional)
- [ ] Provide instructions for obtaining API key
- [ ] Real-time validation against GHL API
- [ ] Show success/failure status with specific error messages
- [ ] Encrypt API key before storage (AES-256-GCM)
- [ ] Allow skipping to configure later in settings
- [ ] Display connected GHL location/account name on success

**Technical Notes:**
- Endpoint: `POST /api/trpc/onboarding.validateGHLApiKey`
- Uses `apiKeyValidationService.validateGohighlevel()`
- Encryption format: `iv:authTag:encryptedData`

---

### Epic 2: Brand Asset Configuration

#### US-005: Upload Company Logo
**As a** user
**I want to** upload my company logo during onboarding
**So that** my brand is represented in generated content

**Acceptance Criteria:**
- [ ] Support common image formats (PNG, JPG, SVG, WebP)
- [ ] Display preview before upload
- [ ] Validate file size (max 5MB)
- [ ] Validate image dimensions (min 100x100, max 2000x2000)
- [ ] Upload to S3 with user-specific path
- [ ] Return optimized URL for display
- [ ] Associate with user's client profile

**Technical Notes:**
- Endpoint: `POST /api/trpc/onboarding.uploadBrandAssets`
- S3 path: `users/{userId}/brand/logo/{timestamp}-{filename}`
- Base64 encoding for upload

---

#### US-006: Upload Brand Guidelines
**As a** user
**I want to** upload brand guidelines documents
**So that** AI-generated content matches my brand voice

**Acceptance Criteria:**
- [ ] Support multiple file uploads (up to 5 files)
- [ ] Accept PDF, DOC, DOCX, TXT formats
- [ ] Display upload progress
- [ ] Validate file sizes (max 10MB per file)
- [ ] Store with contextual metadata
- [ ] Enable RAG integration for brand context
- [ ] Show uploaded files with delete option

---

#### US-007: Configure Brand Voice
**As a** user
**I want to** define my brand voice in text
**So that** AI outputs match my communication style

**Acceptance Criteria:**
- [ ] Text area for brand voice description
- [ ] AI-powered suggestions based on website analysis
- [ ] Character limit guidance (500-2000 chars recommended)
- [ ] Example brand voices for reference
- [ ] Save to client profile
- [ ] Preview how brand voice affects AI output

**Technical Notes:**
- Endpoint: `POST /api/trpc/onboarding.saveBrandVoice`
- Creates client profile if not exists
- Stores in `clientProfiles.brandVoice`

---

### Epic 3: Integration Initialization

#### US-008: Select Integrations
**As a** user
**I want to** choose which integrations to set up
**So that** I can connect my existing tools

**Acceptance Criteria:**
- [ ] Display available integrations with logos
- [ ] Show integration categories (CRM, Email, Social, Analytics)
- [ ] Allow multi-select for future setup
- [ ] Create placeholder records for selected integrations
- [ ] Show "coming soon" for planned integrations
- [ ] Prioritize popular integrations

**Available Integrations:**
```
- GoHighLevel (CRM)
- Google (Calendar, Drive, Gmail)
- Slack (Communication)
- Stripe (Payments)
- Meta/Facebook (Ads)
- Google Analytics
- Zapier (Automation)
- n8n (Workflow)
```

**Technical Notes:**
- Endpoint: `POST /api/trpc/onboarding.initializeIntegrations`
- Creates records in `integrations` table with status: `pending_setup`

---

#### US-009: OAuth Connection Flow
**As a** user
**I want to** connect integrations via OAuth during onboarding
**So that** I don't have to manually enter credentials

**Acceptance Criteria:**
- [ ] Display OAuth button for supported services
- [ ] Redirect to provider authorization page
- [ ] Handle OAuth callback securely
- [ ] Store tokens encrypted
- [ ] Show connection status
- [ ] Handle authorization errors gracefully

---

### Epic 4: Interactive Tutorials

#### US-010: Feature Tour
**As a** new user
**I want to** receive a guided tour of key features
**So that** I understand platform capabilities

**Acceptance Criteria:**
- [ ] Trigger tour after onboarding completion
- [ ] Highlight UI elements with tooltips
- [ ] Progress through steps sequentially
- [ ] Allow "Skip Tour" at any point
- [ ] Track tour completion for analytics
- [ ] Offer to replay tour from settings

**Tour Steps:**
1. Dashboard overview
2. Creating your first automation
3. Managing agents
4. Viewing analytics
5. Accessing settings

---

#### US-011: Contextual Help Tooltips
**As a** user navigating the platform
**I want to** see contextual help for complex features
**So that** I can learn while doing

**Acceptance Criteria:**
- [ ] Display tooltip on first visit to each feature
- [ ] Show relevant documentation links
- [ ] Allow "Don't show again" dismissal
- [ ] Track which tips have been shown
- [ ] Progressive disclosure based on user level

---

#### US-012: Interactive Walkthroughs
**As a** user learning a new feature
**I want to** follow step-by-step interactive guides
**So that** I can complete tasks successfully

**Acceptance Criteria:**
- [ ] Guided step-by-step instructions
- [ ] Highlight active elements
- [ ] Validate step completion before advancing
- [ ] Allow restart from any step
- [ ] Provide task completion celebration
- [ ] Suggest next learning topic

---

### Epic 5: Onboarding Analytics & Administration

#### US-013: Track Onboarding Progress
**As a** product manager
**I want to** monitor onboarding funnel metrics
**So that** I can optimize the onboarding flow

**Acceptance Criteria:**
- [ ] Track step-by-step completion rates
- [ ] Measure time per step
- [ ] Identify drop-off points
- [ ] Segment by user attributes
- [ ] Export analytics reports

---

#### US-014: A/B Test Onboarding Variations
**As a** growth team member
**I want to** test different onboarding flows
**So that** we can optimize conversion rates

**Acceptance Criteria:**
- [ ] Support multiple onboarding variants
- [ ] Assign users to variants deterministically
- [ ] Track metrics per variant
- [ ] Statistical significance calculator
- [ ] Winner promotion workflow

---

#### US-015: Admin Onboarding Management
**As an** administrator
**I want to** view and manage user onboarding status
**So that** I can assist users who need help

**Acceptance Criteria:**
- [ ] View all users' onboarding status
- [ ] Filter by completion status, date, user segment
- [ ] Reset user onboarding to trigger re-flow
- [ ] View detailed profile data
- [ ] Send reminder notifications

---

## 5. Functional Requirements

### FR-001: Onboarding Flow Management

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-001.1 | Detect first-time users and trigger onboarding | P0 | Implemented |
| FR-001.2 | Track onboarding completion status per user | P0 | Implemented |
| FR-001.3 | Store progress and allow resume | P0 | Implemented |
| FR-001.4 | Support skip and complete later | P1 | Implemented |
| FR-001.5 | Multiple onboarding tracks by user type | P2 | Planned |
| FR-001.6 | Conditional steps based on selections | P1 | Planned |
| FR-001.7 | Onboarding progress persistence | P0 | Implemented |

### FR-002: Business Profile Collection

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-002.1 | Collect full name | P0 | Implemented |
| FR-002.2 | Collect company name | P0 | Implemented |
| FR-002.3 | Collect phone number | P0 | Implemented |
| FR-002.4 | Industry selection (enum) | P0 | Implemented |
| FR-002.5 | Monthly revenue range | P1 | Implemented |
| FR-002.6 | Employee count range | P1 | Implemented |
| FR-002.7 | Website URL (validated) | P1 | Implemented |
| FR-002.8 | Goals selection (multi) | P0 | Implemented |
| FR-002.9 | Custom goal entry | P1 | Implemented |
| FR-002.10 | Profile update capability | P1 | Implemented |

### FR-003: Integration Setup

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-003.1 | GHL API key validation | P0 | Implemented |
| FR-003.2 | API key encryption (AES-256-GCM) | P0 | Implemented |
| FR-003.3 | Integration selection | P1 | Implemented |
| FR-003.4 | OAuth flow support | P1 | Planned |
| FR-003.5 | Integration status tracking | P1 | Implemented |
| FR-003.6 | Integration placeholder creation | P1 | Implemented |
| FR-003.7 | Retry failed connections | P2 | Planned |

### FR-004: Brand Asset Management

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-004.1 | Logo upload to S3 | P1 | Implemented |
| FR-004.2 | Brand guidelines upload | P2 | Implemented |
| FR-004.3 | Brand voice configuration | P1 | Implemented |
| FR-004.4 | Client profile association | P1 | Implemented |
| FR-004.5 | Asset metadata tagging | P2 | Implemented |
| FR-004.6 | Image format validation | P1 | Implemented |
| FR-004.7 | File size validation | P1 | Implemented |

### FR-005: Interactive Tutorials

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-005.1 | Feature tour system | P1 | Planned |
| FR-005.2 | Contextual tooltips | P1 | Planned |
| FR-005.3 | Step-by-step walkthroughs | P2 | Planned |
| FR-005.4 | Tour progress tracking | P2 | Planned |
| FR-005.5 | Tour replay capability | P2 | Planned |
| FR-005.6 | Mobile-responsive tutorials | P2 | Planned |

### FR-006: Feature Discovery

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-006.1 | Goal-based feature recommendations | P1 | Planned |
| FR-006.2 | Progressive feature unlocking | P2 | Planned |
| FR-006.3 | Usage-based suggestions | P2 | Planned |
| FR-006.4 | Template recommendations | P1 | Planned |
| FR-006.5 | Learning path generation | P2 | Planned |

---

## 6. Non-Functional Requirements

### Performance

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| Onboarding page load time | < 1 second | First contentful paint |
| Form submission response | < 500ms | API response time |
| API key validation | < 3 seconds | GHL API call + response |
| Asset upload (logo) | < 5 seconds | S3 upload + URL return |
| Database operations | < 100ms | Query profiling |
| Step transition | < 200ms | Client-side render |

### Scalability

- Support 10,000+ concurrent onboarding sessions
- Handle 1,000+ asset uploads per hour
- Scale API key validation to 100 requests/second
- Maintain performance under 5x normal load

### Reliability

| Requirement | Target |
|-------------|--------|
| System uptime | 99.9% |
| Data durability | 99.99% |
| Progress data persistence | Zero loss |
| Upload success rate | > 99% |
| API validation availability | 99.5% |

### Security

- All API endpoints require authentication
- API keys encrypted with AES-256-GCM
- Secure token storage for OAuth
- Rate limiting on submission endpoints (10 req/min)
- CSRF protection on all mutations
- Audit logging for all data modifications
- PII handling compliance (GDPR, CCPA)
- Secure file upload validation (type, size, content)

### Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation throughout flow
- Screen reader compatibility
- Aria labels on all form elements
- High contrast mode support
- Focus indicators visible
- Error messages accessible

---

## 7. Technical Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Onboarding Flows System                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     Frontend Layer                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │   │
│  │  │  Onboarding │  │  Feature    │  │  Interactive        │   │   │
│  │  │   Wizard    │  │  Tour       │  │   Tutorials         │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │   │
│  │  │  Profile    │  │  Brand      │  │  Integration        │   │   │
│  │  │   Form      │  │  Assets     │  │   Connector         │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    API Layer (tRPC + Express)                 │   │
│  │  ┌─────────────────────────────┐  ┌────────────────────────┐ │   │
│  │  │   tRPC Router               │  │   Express Router       │ │   │
│  │  │   (/api/trpc/onboarding)    │  │   (/api/onboarding)    │ │   │
│  │  │   • submit                  │  │   • GET status         │ │   │
│  │  │   • validateGHLApiKey       │  │   • POST data          │ │   │
│  │  │   • getProfile              │  │                        │ │   │
│  │  │   • getStatus               │  │                        │ │   │
│  │  │   • uploadBrandAssets       │  │                        │ │   │
│  │  │   • saveBrandVoice          │  │                        │ │   │
│  │  │   • initializeIntegrations  │  │                        │ │   │
│  │  └─────────────────────────────┘  └────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   Service Layer                               │   │
│  │  ┌───────────────┐  ┌──────────────┐  ┌──────────────────┐   │   │
│  │  │  Encryption   │  │  API Key     │  │  S3 Storage      │   │   │
│  │  │  Service      │  │  Validation  │  │  Service         │   │   │
│  │  │  (AES-256)    │  │  Service     │  │                  │   │   │
│  │  └───────────────┘  └──────────────┘  └──────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Data Layer (Drizzle ORM)                   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │   │
│  │  │   users     │  │userProfiles │  │  clientProfiles     │   │   │
│  │  │   table     │  │   table     │  │     table           │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │                    integrations table                   │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │           PostgreSQL (Supabase) + AWS S3                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Onboarding Flow State Machine

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   SIGNUP    │────▶│  WELCOME    │────▶│  PROFILE    │
│  DETECTED   │     │   SCREEN    │     │   STEP      │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┘
                    ▼
        ┌───────────────────────┐
        │    GOALS SELECTION    │
        └───────────┬───────────┘
                    │
        ┌───────────┴───────────┐
        │   INTEGRATION STEP    │
        │   (Optional GHL API)  │
        └───────────┬───────────┘
                    │
        ┌───────────┴───────────┐
        │   BRAND ASSETS STEP   │
        │   (Logo, Voice)       │
        └───────────┬───────────┘
                    │
        ┌───────────┴───────────┐
        │   INTEGRATION SELECT  │
        │   (Future Setup)      │
        └───────────┬───────────┘
                    │
        ┌───────────┴───────────┐
        │     COMPLETION        │
        │   (Mark Complete)     │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │     FEATURE TOUR      │
        │    (Interactive)      │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │      DASHBOARD        │
        │   (Main Application)  │
        └───────────────────────┘
```

### API Key Encryption Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│  Validate   │────▶│  GHL API    │
│   Input     │     │   Format    │     │   Test      │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                          ┌────────────────────┴──────────┐
                          │                               │
                          ▼                               ▼
                   ┌─────────────┐                ┌─────────────┐
                   │   SUCCESS   │                │   FAILURE   │
                   └──────┬──────┘                └──────┬──────┘
                          │                               │
                          ▼                               ▼
                   ┌─────────────┐                ┌─────────────┐
                   │  Generate   │                │   Return    │
                   │     IV      │                │   Error     │
                   └──────┬──────┘                └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │  Encrypt    │
                   │  AES-256    │
                   └──────┬──────┘
                          │
                          ▼
                   ┌─────────────┐
                   │  Format     │
                   │  iv:tag:enc │
                   └──────┬──────┘
                          │
                          ▼
                   ┌─────────────┐
                   │  Store in   │
                   │  Database   │
                   └─────────────┘
```

---

## 8. Data Models

### User Profile Entity

```typescript
interface UserProfile {
  id: number;                              // Primary key
  userId: number;                          // Foreign key to users
  companyName: string;                     // Required company name
  phone: string | null;                    // Phone number
  industry: IndustryType | null;           // Industry enum
  monthlyRevenue: RevenueRange | null;     // Revenue range enum
  employeeCount: EmployeeRange | null;     // Employee count enum
  website: string | null;                  // Website URL
  goals: string;                           // JSON array of goals
  ghlApiKey: string | null;                // Encrypted GHL API key
  createdAt: Date;                         // Record creation timestamp
  updatedAt: Date;                         // Last modification timestamp
}

type IndustryType =
  | 'marketing-agency'
  | 'real-estate'
  | 'healthcare'
  | 'ecommerce'
  | 'saas'
  | 'other';

type RevenueRange =
  | '0-10k'
  | '10k-50k'
  | '50k-100k'
  | '100k-500k'
  | '500k+';

type EmployeeRange =
  | 'just-me'
  | '2-5'
  | '6-20'
  | '21-50'
  | '50+';
```

### Onboarding Data Schema (Zod)

```typescript
const onboardingDataSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  companyName: z.string().min(1, "Company name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  industry: z.enum([
    "marketing-agency",
    "real-estate",
    "healthcare",
    "ecommerce",
    "saas",
    "other",
  ]),
  monthlyRevenue: z.enum([
    "0-10k",
    "10k-50k",
    "50k-100k",
    "100k-500k",
    "500k+",
  ]),
  employeeCount: z.enum([
    "just-me",
    "2-5",
    "6-20",
    "21-50",
    "50+",
  ]),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  goals: z.array(z.string()).min(1, "At least one goal is required"),
  otherGoal: z.string().optional(),
  ghlApiKey: z.string().optional().or(z.literal("")),
});
```

### Client Profile (Brand Assets)

```typescript
interface ClientProfile {
  id: number;                              // Primary key
  userId: number;                          // Foreign key to users
  name: string;                            // Profile/company name
  brandVoice: string | null;               // Brand voice description
  assets: string | null;                   // JSON array of asset objects
  isActive: boolean;                       // Active profile flag
  createdAt: Date;                         // Record creation timestamp
  updatedAt: Date;                         // Last modification timestamp
}

interface BrandAsset {
  id: string;                              // UUID
  originalName: string;                    // Original filename
  optimizedName: string;                   // Processed filename
  url: string;                             // S3 URL
  altText: string;                         // Accessibility text
  contextTag: AssetContextTag;             // Asset type
  status: 'uploading' | 'optimizing' | 'ready';
}

type AssetContextTag =
  | 'LOGO'
  | 'HERO'
  | 'TEAM'
  | 'TESTIMONIAL'
  | 'PRODUCT'
  | 'UNKNOWN';
```

### Integration Entity

```typescript
interface Integration {
  id: number;                              // Primary key
  userId: number;                          // Foreign key to users
  service: string;                         // Integration service name
  isActive: string;                        // "true" or "false"
  metadata: string | null;                 // JSON metadata
  createdAt: Date;                         // Record creation timestamp
  updatedAt: Date;                         // Last modification timestamp
}

interface IntegrationMetadata {
  status: 'pending_setup' | 'connected' | 'error';
  addedDuringOnboarding: boolean;
  addedAt: string;                         // ISO timestamp
  connectionDetails?: Record<string, any>;
  errorMessage?: string;
}
```

### Onboarding Progress (Future)

```typescript
interface OnboardingProgress {
  id: number;                              // Primary key
  userId: number;                          // Foreign key to users
  currentStep: OnboardingStep;             // Current step enum
  completedSteps: OnboardingStep[];        // Completed steps array
  stepData: Record<string, any>;           // Step-specific data
  variant: string | null;                  // A/B test variant
  startedAt: Date;                         // When onboarding started
  completedAt: Date | null;                // When completed (if done)
  abandonedAt: Date | null;                // When abandoned (if dropped)
  createdAt: Date;                         // Record creation timestamp
  updatedAt: Date;                         // Last modification timestamp
}

type OnboardingStep =
  | 'welcome'
  | 'profile'
  | 'goals'
  | 'integration'
  | 'brand_assets'
  | 'integrations_select'
  | 'completion'
  | 'tour';
```

---

## 9. API Endpoints

### tRPC Router Procedures

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `onboarding.submit` | Mutation | Protected | Submit onboarding data |
| `onboarding.validateGHLApiKey` | Mutation | Protected | Validate GHL API key |
| `onboarding.getProfile` | Query | Protected | Get user profile data |
| `onboarding.getStatus` | Query | Protected | Get onboarding status |
| `onboarding.uploadBrandAssets` | Mutation | Protected | Upload brand assets |
| `onboarding.saveBrandVoice` | Mutation | Protected | Save brand voice config |
| `onboarding.initializeIntegrations` | Mutation | Protected | Initialize integrations |

### Express Router Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/onboarding` | GET | Required | Get onboarding status |
| `/api/onboarding` | POST | Required | Submit onboarding data |

### Request/Response Examples

#### Submit Onboarding Data

**Request:**
```typescript
{
  fullName: "John Smith",
  companyName: "Acme Marketing Agency",
  phoneNumber: "+1-555-123-4567",
  industry: "marketing-agency",
  monthlyRevenue: "50k-100k",
  employeeCount: "6-20",
  websiteUrl: "https://acme-marketing.com",
  goals: ["lead-generation", "marketing-automation", "ai-assistance"],
  otherGoal: "",
  ghlApiKey: "ghl_api_key_xxxxx"
}
```

**Response:**
```typescript
{
  success: true,
  message: "Onboarding completed successfully",
  data: {
    companyName: "Acme Marketing Agency",
    industry: "marketing-agency"
  }
}
```

#### Validate GHL API Key

**Request:**
```typescript
{
  apiKey: "ghl_api_key_xxxxx"
}
```

**Response (Success):**
```typescript
{
  success: true,
  message: "API key validated successfully",
  details: {
    locationId: "loc_xxxxx",
    locationName: "Acme Agency",
    timezone: "America/New_York"
  }
}
```

**Response (Failure):**
```typescript
{
  success: false,
  message: "Invalid API key. Please check your key and try again."
}
```

#### Upload Brand Assets

**Request:**
```typescript
{
  logoBase64: "iVBORw0KGgoAAAANSUhEUgAA...",
  logoMimeType: "image/png",
  logoFileName: "acme-logo.png",
  guidelinesBase64: [
    {
      data: "JVBERi0xLjQKJeLjz9...",
      mimeType: "application/pdf",
      fileName: "brand-guidelines.pdf"
    }
  ]
}
```

**Response:**
```typescript
{
  success: true,
  message: "Uploaded 2 brand asset(s)",
  assets: [
    {
      id: "uuid-xxxxx",
      originalName: "acme-logo.png",
      optimizedName: "acme-logo.png",
      url: "https://s3.amazonaws.com/bucket/users/123/brand/logo/acme-logo.png",
      altText: "Company Logo",
      contextTag: "LOGO",
      status: "ready"
    },
    {
      id: "uuid-yyyyy",
      originalName: "brand-guidelines.pdf",
      optimizedName: "brand-guidelines.pdf",
      url: "https://s3.amazonaws.com/bucket/users/123/brand/guidelines/brand-guidelines.pdf",
      altText: "Brand Guideline: brand-guidelines.pdf",
      contextTag: "UNKNOWN",
      status: "ready"
    }
  ]
}
```

#### Save Brand Voice

**Request:**
```typescript
{
  brandVoice: "Professional yet approachable. We speak with authority but remain friendly. Use short sentences. Avoid jargon. Focus on outcomes and benefits.",
  companyName: "Acme Marketing Agency",
  assets: [
    {
      id: "uuid-xxxxx",
      originalName: "acme-logo.png",
      url: "https://s3.amazonaws.com/...",
      // ... other asset fields
    }
  ]
}
```

**Response:**
```typescript
{
  success: true,
  message: "Brand voice saved successfully"
}
```

#### Initialize Integrations

**Request:**
```typescript
{
  integrations: ["gohighlevel", "google", "slack", "stripe"]
}
```

**Response:**
```typescript
{
  success: true,
  message: "Initialized 4 integration(s)",
  integrations: ["gohighlevel", "google", "slack", "stripe"]
}
```

---

## 10. User Interface Specifications

### Onboarding Wizard Interface

```
┌─────────────────────────────────────────────────────────────────┐
│                    Welcome to Bottleneck Bots                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Progress: ●───●───○───○───○  Step 2 of 5                      │
│            Profile  Goals  API  Brand  Done                     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Tell us about your business                           │   │
│  │                                                         │   │
│  │  Full Name *                                           │   │
│  │  [John Smith                                    ]       │   │
│  │                                                         │   │
│  │  Company Name *                                        │   │
│  │  [Acme Marketing Agency                         ]       │   │
│  │                                                         │   │
│  │  Phone Number *                                        │   │
│  │  [+1-555-123-4567                               ]       │   │
│  │                                                         │   │
│  │  Industry *                                            │   │
│  │  [Marketing Agency                          ▼]          │   │
│  │                                                         │   │
│  │  Monthly Revenue                                       │   │
│  │  [○ $0-10K] [● $10K-50K] [○ $50K-100K] [○ $100K+]      │   │
│  │                                                         │   │
│  │  Team Size                                             │   │
│  │  [○ Just me] [○ 2-5] [● 6-20] [○ 21-50] [○ 50+]        │   │
│  │                                                         │   │
│  │  Website (optional)                                    │   │
│  │  [https://acme-marketing.com                   ]       │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Skip for now]                              [Continue →]       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Goals Selection Interface

```
┌─────────────────────────────────────────────────────────────────┐
│                    What are your goals?                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Progress: ●───●───●───○───○  Step 3 of 5                      │
│                                                                 │
│  Select all that apply (choose at least 1):                    │
│                                                                 │
│  ┌────────────────────────┐  ┌────────────────────────┐        │
│  │ [✓] Lead Generation    │  │ [✓] Marketing          │        │
│  │     🎯                 │  │     Automation 🤖      │        │
│  │     Find and qualify   │  │     Automate campaigns │        │
│  │     new leads          │  │     and follow-ups     │        │
│  └────────────────────────┘  └────────────────────────┘        │
│                                                                 │
│  ┌────────────────────────┐  ┌────────────────────────┐        │
│  │ [ ] Client             │  │ [ ] Social Media       │        │
│  │     Communication 💬   │  │     Management 📱      │        │
│  │     Improve client     │  │     Schedule and       │        │
│  │     interactions       │  │     manage posts       │        │
│  └────────────────────────┘  └────────────────────────┘        │
│                                                                 │
│  ┌────────────────────────┐  ┌────────────────────────┐        │
│  │ [✓] AI Assistance      │  │ [ ] Analytics          │        │
│  │     🧠                 │  │     📊                 │        │
│  │     Get AI-powered     │  │     Track and measure  │        │
│  │     help               │  │     results            │        │
│  └────────────────────────┘  └────────────────────────┘        │
│                                                                 │
│  Other goal:                                                    │
│  [                                                     ]        │
│                                                                 │
│  [← Back]                                [Continue →]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### API Integration Interface

```
┌─────────────────────────────────────────────────────────────────┐
│                    Connect Your Tools                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Progress: ●───●───●───●───○  Step 4 of 5                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🔗 GoHighLevel Integration                     [SETUP] │   │
│  │                                                         │   │
│  │  Connect your GHL account to sync contacts,            │   │
│  │  opportunities, and automations.                       │   │
│  │                                                         │   │
│  │  API Key                                               │   │
│  │  [ghl_api_xxxxxxxxxxxxxxxxxxxxxx           ] [Validate]│   │
│  │                                                         │   │
│  │  Status: ✓ Connected to "Acme Agency"                  │   │
│  │                                                         │   │
│  │  [How to find your API key →]                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Other integrations (set up later):                            │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │ [✓] Google │  │ [ ] Slack  │  │ [✓] Stripe │               │
│  │    📧      │  │     💬     │  │     💳     │               │
│  └────────────┘  └────────────┘  └────────────┘               │
│                                                                 │
│  [← Back]          [Skip]                    [Continue →]       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Brand Assets Interface

```
┌─────────────────────────────────────────────────────────────────┐
│                    Set Up Your Brand                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Progress: ●───●───●───●───●  Step 5 of 5                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Company Logo                                           │   │
│  │                                                         │   │
│  │       ┌────────────────────┐                           │   │
│  │       │                    │                           │   │
│  │       │    [ACME LOGO]     │    ✓ Uploaded             │   │
│  │       │                    │                           │   │
│  │       └────────────────────┘                           │   │
│  │                                                         │   │
│  │  [Replace Logo]                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Brand Voice                                            │   │
│  │                                                         │   │
│  │  Describe how your brand communicates:                 │   │
│  │  ┌───────────────────────────────────────────────────┐ │   │
│  │  │ Professional yet approachable. We speak with      │ │   │
│  │  │ authority but remain friendly. Use short          │ │   │
│  │  │ sentences. Avoid jargon. Focus on outcomes...     │ │   │
│  │  └───────────────────────────────────────────────────┘ │   │
│  │                                                         │   │
│  │  [✨ Generate from website]                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Brand Guidelines (optional)                            │   │
│  │                                                         │   │
│  │  📄 brand-guidelines.pdf      [✓ Uploaded]    [✕]      │   │
│  │                                                         │   │
│  │  [+ Add more files]                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [← Back]                              [Complete Setup →]       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Completion Screen

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                         🎉                                      │
│                                                                 │
│              You're all set, John!                             │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Here's what we've set up for you:                             │
│                                                                 │
│    ✓ Business profile created                                  │
│    ✓ GoHighLevel connected                                     │
│    ✓ Brand assets uploaded                                     │
│    ✓ 3 integrations queued for setup                          │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Recommended next steps based on your goals:                   │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 1. Create your first lead generation automation      [→]  │ │
│  │ 2. Set up your AI voice agent                        [→]  │ │
│  │ 3. Import contacts from GoHighLevel                  [→]  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Take a Feature Tour]        [Go to Dashboard]                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. Dependencies

### Internal Dependencies

| Component | Purpose | Integration Point |
|-----------|---------|-------------------|
| User Authentication | Identity verification | `ctx.user.id` in protected procedures |
| Database (Drizzle) | Data persistence | Schema tables, ORM queries |
| S3 Storage Service | Asset uploads | `s3StorageService.uploadFile()` |
| API Key Validation | GHL key validation | `apiKeyValidationService.validateGohighlevel()` |
| Client Profiles | Brand storage | `clientProfiles` table |
| Notification System | Onboarding emails | Welcome email triggers |
| Analytics Module | Progress tracking | Event logging |

### External Dependencies

| Service | Purpose | Version |
|---------|---------|---------|
| PostgreSQL (Supabase) | Primary database | 15.x |
| tRPC | API framework | 11.x |
| Zod | Schema validation | 3.x |
| Drizzle ORM | Database queries | Latest |
| AWS S3 | Asset storage | Latest |
| GoHighLevel API | Integration validation | v2 |
| crypto (Node.js) | Encryption | Built-in |

### Integration Points

```typescript
// Integration with Notification System
interface OnboardingNotificationEvents {
  'onboarding.started': { userId: number; timestamp: Date };
  'onboarding.step_completed': { userId: number; step: string; timestamp: Date };
  'onboarding.completed': { userId: number; profile: UserProfile };
  'onboarding.abandoned': { userId: number; lastStep: string; timestamp: Date };
}

// Integration with Analytics
interface OnboardingAnalyticsData {
  userId: number;
  completionRate: number;
  timeToComplete: number;
  stepsCompleted: string[];
  dropOffStep: string | null;
  variant: string | null;
  industry: string | null;
  goals: string[];
}

// Integration with Feature Discovery
interface FeatureRecommendation {
  userId: number;
  goals: string[];
  recommendedFeatures: string[];
  recommendedTemplates: string[];
  learningPath: string[];
}
```

---

## 12. Risks & Mitigations

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| GHL API validation failure/timeout | Medium | Medium | Implement retry logic, graceful fallback, allow skip |
| S3 upload failures | Low | Medium | Client-side retry, fallback to local storage temporarily |
| Encryption key rotation issues | Low | High | Key versioning, migration scripts, backward compatibility |
| Data loss during onboarding | Low | High | Auto-save progress, local storage backup |
| Browser compatibility issues | Low | Medium | Progressive enhancement, fallback flows |
| Mobile responsiveness gaps | Medium | Medium | Mobile-first design, extensive testing |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low completion rates | Medium | High | A/B testing, analytics monitoring, flow optimization |
| Incomplete data collection | Medium | Medium | Progressive disclosure, required field validation |
| Integration friction | Medium | High | Simplified OAuth, clear instructions, skip options |
| User confusion | Medium | Medium | Contextual help, tooltips, clear progress indicators |
| Privacy concerns | Low | High | Clear data usage disclosure, GDPR compliance |
| Competitive feature gaps | Medium | Medium | Regular feature audits, user feedback loops |

### Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Support ticket spike during launch | High | Medium | Proactive documentation, chatbot, FAQ |
| Onboarding version conflicts | Low | Medium | Feature flags, staged rollouts |
| Analytics data integrity | Low | Medium | Validation rules, data quality monitoring |
| A/B test pollution | Medium | Low | Strict variant assignment, exclusion rules |

### Contingency Plans

1. **Onboarding System Failure**
   - Display simplified form with minimal fields
   - Queue data for later processing
   - Manual admin override to mark complete
   - Email notification with setup link

2. **GHL API Unavailable**
   - Allow skip with reminder to configure later
   - Store API key locally for later validation
   - Display warning with expected timeline
   - Trigger validation job when API recovers

3. **S3 Upload Failure**
   - Retry with exponential backoff
   - Store in temporary local storage
   - Queue for background upload
   - Display partial success status

4. **High Drop-off Rate Detected**
   - Trigger A/B test with simplified flow
   - Enable skip options for problematic steps
   - Deploy contextual help enhancements
   - Schedule user research sessions

---

## Appendix

### A. Encryption Implementation Details

```typescript
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encryptedData
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(":");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, "hex"),
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
```

### B. Goal to Feature Mapping

| Goal | Recommended Features |
|------|---------------------|
| Lead Generation | Lead Enrichment, AI Voice Calling, Forms |
| Marketing Automation | Workflow Builder, Email Integration, Scheduler |
| Client Communication | Email AI, Voice Agent, Notifications |
| Social Media Management | Content Calendar, Analytics, Templates |
| Content Creation | AI Content, Brand Voice, RAG System |
| Analytics & Reporting | Dashboard, Reports, KPIs |
| Website Development | Webdev Tools, Deployment, SEO |
| AI Assistance | AI Agents, Swarm, Memory System |

### C. Onboarding Analytics Events

| Event | Properties | Trigger |
|-------|------------|---------|
| `onboarding_started` | userId, timestamp, source | Welcome screen view |
| `onboarding_step_view` | userId, step, timestamp | Step rendered |
| `onboarding_step_complete` | userId, step, duration, data | Step submitted |
| `onboarding_skip` | userId, step, timestamp | Skip clicked |
| `onboarding_error` | userId, step, error, timestamp | Validation/API error |
| `onboarding_complete` | userId, duration, steps, profile | Final submit |
| `onboarding_abandoned` | userId, lastStep, duration | Session timeout/exit |
| `api_key_validated` | userId, service, success | API validation |
| `asset_uploaded` | userId, type, size, success | Asset upload |
| `tour_started` | userId, timestamp | Tour initiated |
| `tour_completed` | userId, duration, steps | Tour finished |

### D. API Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | User not authenticated |
| `FORBIDDEN` | 403 | User lacks permission |
| `BAD_REQUEST` | 400 | Invalid input data |
| `VALIDATION_FAILED` | 400 | Schema validation error |
| `API_KEY_INVALID` | 400 | GHL API key validation failed |
| `UPLOAD_FAILED` | 500 | S3 upload error |
| `ENCRYPTION_FAILED` | 500 | Encryption error |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

### E. Feature Roadmap

| Phase | Features | Timeline |
|-------|----------|----------|
| **Phase 1** (Current) | Core onboarding flow, profile collection, GHL validation | Complete |
| **Phase 2** | Brand assets, brand voice, integration selection | Complete |
| **Phase 3** | Interactive tutorials, feature tour, contextual help | Q2 2025 |
| **Phase 4** | A/B testing, analytics dashboard, admin tools | Q3 2025 |
| **Phase 5** | AI-powered onboarding, adaptive flows, personalization | Q4 2025 |

### F. Related PRDs

- PRD-032: User Authentication
- PRD-014: Client Profile System
- PRD-030: Integration Hub
- PRD-038: Notification System
- PRD-021: Analytics & Reporting

### G. Changelog

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-11 | 1.0 | Initial PRD creation with 12 comprehensive sections | Product Team |

---

*Document Version: 1.0*
*Last Updated: January 2025*
*Status: Active Development*
