# PRD-016: Training & Onboarding System

**Document Version:** 1.0
**Status:** Draft
**Author:** Development Team
**Last Updated:** January 11, 2026
**Feature Location:** `client/src/pages/Training.tsx`, `client/src/pages/QuizBuilder.tsx`, `client/src/config/tours/`, `client/src/components/OnboardingFlow.tsx`

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

The Training & Onboarding System is a comprehensive learning platform integrated into Bottleneck-Bots that enables users to rapidly understand platform capabilities, achieve proficiency in key workflows, and continuously improve their skills through interactive tutorials, guided tours, knowledge assessments, and hands-on component exploration.

### 1.2 Key Components

| Component | File Location | Size | Purpose |
|-----------|---------------|------|---------|
| **Training Module** | `client/src/pages/Training.tsx` | ~530 lines | Document upload for AI agent training with RAG integration |
| **Tour System** | `client/src/config/tours/` | 10 tour configs | Guided walkthroughs for all major platform features |
| **Quiz Builder** | `client/src/pages/QuizBuilder.tsx` | ~395 lines | Create and manage knowledge assessment quizzes |
| **Quiz Results** | `client/src/pages/QuizResults.tsx` | ~207 lines | Track and display learning progress and scores |
| **Component Showcase** | `client/src/pages/ComponentShowcase.tsx` | 57KB | Full UI component library demonstration |
| **Onboarding Flow** | `client/src/components/OnboardingFlow.tsx` | ~615 lines | Multi-step user onboarding wizard |
| **Client Onboarding Workflow** | `n8n-workflows/3-client-onboarding.json` | n8n workflow | Automated backend client provisioning |
| **Settings Page** | `client/src/pages/Settings.tsx` | 54KB | User preferences and configuration |
| **User Guide** | `docs/AGENT_DASHBOARD_USER_GUIDE.md` | ~850 lines | Comprehensive documentation |

### 1.3 Business Value

- **Reduced Time-to-Value**: New users achieve first success within 5 minutes
- **Lower Support Burden**: Self-service learning reduces support tickets by 40%
- **Improved Retention**: Properly onboarded users have 3x higher retention
- **Team Enablement**: Managers can assess and track team competency
- **Scalable Training**: Automated onboarding supports unlimited user growth

### 1.4 Target Users

| Persona | Description | Primary Needs |
|---------|-------------|---------------|
| **New User** | First-time platform visitor | Quick orientation, immediate value |
| **Agency Owner** | Business decision-maker | Staff training, competency verification |
| **Marketing Specialist** | Day-to-day power user | Feature mastery, workflow efficiency |
| **Administrator** | System configuration owner | Team management, settings configuration |
| **Client (Sub-Account)** | End customer of agency | Platform basics, self-service guidance |

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Steep Learning Curve**: Complex platform with AI agents, browser automation, and CRM integrations overwhelms new users
2. **High Onboarding Drop-off**: 60% of new users abandon before completing setup without guided assistance
3. **Inconsistent Knowledge**: Team members have varying proficiency levels with no standardized assessment
4. **Support Ticket Volume**: Repetitive "how-to" questions consume support resources
5. **Feature Discovery**: Users remain unaware of capabilities that could benefit their workflows
6. **Training Document Chaos**: Business knowledge scattered across documents without AI accessibility

### 2.2 User Pain Points

| Pain Point | User Quote | Impact |
|------------|------------|--------|
| Overwhelmed First Impression | "I don't know where to start - there are so many features" | 45% first-day bounce rate |
| Undiscovered Features | "I didn't know the platform could do that!" | 30% feature underutilization |
| Knowledge Retention | "I watched the demo but forgot how to do it" | Repeated support requests |
| Team Skill Gaps | "Some team members are much slower than others" | Productivity inconsistency |
| AI Training Difficulty | "How do I teach the AI about our business?" | Poor agent performance |

### 2.3 Business Impact

| Problem | Quantified Impact |
|---------|-------------------|
| Onboarding abandonment | $15,000/month in lost conversions |
| Support tickets for basic questions | 120 hours/month support time |
| Feature underutilization | 35% lower customer lifetime value |
| Training time for new employees | 8 hours average per employee |
| Knowledge transfer on staff turnover | 40 hours lost per departure |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Description | Priority |
|------|-------------|----------|
| **G1** | Reduce onboarding completion time to under 5 minutes | P0 |
| **G2** | Achieve 80%+ onboarding completion rate | P0 |
| **G3** | Enable self-service feature learning via interactive tours | P0 |
| **G4** | Provide measurable skill assessment through quizzes | P1 |
| **G5** | Support AI agent training with business documents | P1 |
| **G6** | Reduce "how-to" support tickets by 40% | P1 |
| **G7** | Enable team competency tracking for managers | P2 |

### 3.2 Success Metrics (KPIs)

#### Onboarding Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Onboarding Completion Rate | >= 80% | Users completing all steps / Total signups |
| Time to First Success | < 5 minutes | Time from signup to first task completion |
| GHL Integration Rate | >= 60% | Users connecting GHL during onboarding |
| Onboarding Drop-off Rate | < 20% | Abandonment at each step tracked |
| First-Week Retention | >= 70% | Users returning within 7 days of signup |

#### Tour System Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Tour Start Rate | >= 50% | Users starting at least one tour |
| Tour Completion Rate | >= 75% | Started tours completed |
| Feature Adoption After Tour | >= 40% | Feature usage within 24h of tour |
| Tour Satisfaction Score | >= 4.0/5 | Post-tour rating widget |

#### Quiz System Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Quiz Creation by Admins | >= 5/month | New quizzes created |
| Quiz Completion Rate | >= 70% | Quizzes started vs completed |
| Average Quiz Score | >= 75% | Mean score across all attempts |
| Retake Rate | < 30% | Second attempts needed to pass |
| Time per Quiz | < 10 minutes | Average completion time |

#### Training Document Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Documents Uploaded | >= 10/account | Average documents per agency |
| RAG Query Success | >= 85% | Agent uses uploaded context correctly |
| Document Categories Used | >= 3 | Different category types utilized |
| Chunk Generation Rate | >= 50 chunks/doc | Average embeddings per document |

#### Support Impact Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| How-To Ticket Reduction | >= 40% | Pre/post implementation comparison |
| Self-Service Resolution | >= 60% | Issues resolved without human support |
| Knowledge Base Searches | >= 500/month | Searches using uploaded training docs |

---

## 4. User Stories & Personas

### 4.1 Persona Definitions

#### Persona 1: New Agency Owner - "Sarah"

| Attribute | Details |
|-----------|---------|
| **Role** | Marketing Agency Owner |
| **Technical Level** | Intermediate |
| **Goal** | Get her team trained and productive quickly |
| **Frustration** | Previous tools required weeks of training |
| **Key Need** | Self-service onboarding that doesn't require her involvement |

#### Persona 2: Marketing Specialist - "Marcus"

| Attribute | Details |
|-----------|---------|
| **Role** | Day-to-day Platform User |
| **Technical Level** | Basic to Intermediate |
| **Goal** | Master platform features to do his job efficiently |
| **Frustration** | Forgetting how to do tasks between uses |
| **Key Need** | Quick refresher tours and searchable help |

#### Persona 3: Agency Administrator - "Alex"

| Attribute | Details |
|-----------|---------|
| **Role** | System Admin / Team Lead |
| **Technical Level** | Advanced |
| **Goal** | Ensure team competency and track progress |
| **Frustration** | No visibility into team skill levels |
| **Key Need** | Quiz results, progress tracking, certification |

#### Persona 4: New Client (Sub-Account) - "Client Emma"

| Attribute | Details |
|-----------|---------|
| **Role** | Agency Client using white-labeled platform |
| **Technical Level** | Basic |
| **Goal** | Understand what the platform can do for her business |
| **Frustration** | Doesn't want to bother the agency with basic questions |
| **Key Need** | Simple, self-service orientation |

### 4.2 Core User Stories

#### US-001: New User Onboarding
**As a** new user signing up for the first time
**I want to** be guided through initial setup step-by-step
**So that** I can quickly configure my account and understand the platform

**Acceptance Criteria:**
- Onboarding flow appears immediately after first login
- 5-step wizard: Account > Business > Goals > Integration > Complete
- Each step has clear instructions and validation
- Skip option available for optional steps (GHL API key)
- Progress indicator shows current step and remaining
- Summary shown before final submission
- Conversion tracking fires on completion

#### US-002: Feature Tour Completion
**As a** user learning a new feature
**I want to** take an interactive guided tour
**So that** I understand how to use the feature effectively

**Acceptance Criteria:**
- Tours available for: Welcome, Workflows, Scheduled Tasks, Browser Sessions, Quizzes, Credits, Settings
- Tour steps highlight target elements with spotlight effect
- Step content explains purpose and usage
- Navigation buttons: Next, Previous, Skip Tour
- Progress indicator shows step X of Y
- Tours can be restarted from Help menu
- Tour completion is tracked per user

#### US-003: Quiz Assessment Creation
**As an** administrator
**I want to** create knowledge assessment quizzes
**So that** I can verify team members understand platform features

**Acceptance Criteria:**
- Quiz form includes: Title, Description, Category, Difficulty, Time Limit, Passing Score, Attempts Allowed
- Question types: Multiple Choice, True/False, Short Answer, Essay
- Each question has: Text, Options (if applicable), Correct Answer, Points, Hint, Explanation
- Preview mode to review quiz before publishing
- Save as Draft or Publish options
- Validation ensures complete quiz configuration

#### US-004: Quiz Taking and Results
**As a** team member
**I want to** take assigned quizzes and see my results
**So that** I can demonstrate and improve my knowledge

**Acceptance Criteria:**
- Quiz displays timer (if time limit set)
- Questions presented one at a time or all at once (configurable)
- Answers can be changed before submission
- Results show: Score, Percentage, Pass/Fail, Time Spent
- Question breakdown shows correct/incorrect with explanations
- Retake option available (within attempts limit)
- Results stored for manager visibility

#### US-005: AI Agent Training Documents
**As an** agency owner
**I want to** upload business documents to train the AI agent
**So that** it understands my business context when executing tasks

**Acceptance Criteria:**
- Drag-and-drop file upload for PDF, DOCX, TXT, MD files
- URL ingestion for web documentation
- Category selection: Training Docs, SOPs, Business Docs, Technical, General
- Platform tagging: General, GoHighLevel, HubSpot, Salesforce
- File size limit: 10MB per file
- Processing status with chunk count display
- Document list with delete capability
- RAG integration enables agent context retrieval

#### US-006: Component Discovery
**As a** developer or power user
**I want to** explore all available UI components
**So that** I understand the platform's capabilities and design patterns

**Acceptance Criteria:**
- Component Showcase page displays all UI components
- Components organized by category (Forms, Feedback, Navigation, etc.)
- Interactive examples with working state
- Code patterns visible where helpful
- Theme toggle to preview light/dark modes
- AI ChatBox demo included

#### US-007: Onboarding Progress Tracking
**As an** administrator
**I want to** see which users completed onboarding
**So that** I can follow up with those who dropped off

**Acceptance Criteria:**
- Onboarding data stored in database
- Admin can view completion status per user
- Conversion events tracked for analytics
- n8n workflow provisions client resources automatically

### 4.3 Advanced User Stories

#### US-008: Quiz Results Analytics
**As an** administrator
**I want to** see aggregate quiz performance across my team
**So that** I can identify knowledge gaps requiring additional training

**Acceptance Criteria:**
- Dashboard shows average scores by quiz
- Trend charts for score improvement over time
- Lowest-scoring questions highlighted
- Individual user progress reports
- Export capability for HR/compliance

#### US-009: Contextual Help Triggers
**As a** user encountering a complex feature
**I want** help to appear when I seem stuck
**So that** I can get assistance without searching

**Acceptance Criteria:**
- Feature tips appear on first visit to key pages
- "Learn More" prompts link to relevant tours
- Idle detection triggers help suggestions (configurable)
- Help menu accessible from all pages

#### US-010: Multi-Language Tour Support
**As a** non-English speaking user
**I want to** view tours in my preferred language
**So that** I can understand the content clearly

**Acceptance Criteria:**
- Tour content supports i18n
- Language selection persists in user preferences
- Fallback to English for untranslated content
- RTL language support for Arabic/Hebrew

---

## 5. Functional Requirements

### 5.1 Onboarding Flow

#### FR-001: Multi-Step Wizard
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Display 5-step onboarding wizard on first login | P0 |
| FR-001.2 | Step 1: Collect Full Name, Company Name, Phone Number | P0 |
| FR-001.3 | Step 2: Collect Industry, Monthly Revenue, Employee Count, Website URL | P0 |
| FR-001.4 | Step 3: Collect Goals selection (multi-select checkboxes) | P0 |
| FR-001.5 | Step 4: Optional GoHighLevel API Key input | P1 |
| FR-001.6 | Step 5: Summary review and launch confirmation | P0 |
| FR-001.7 | Progress indicator shows step completion | P0 |
| FR-001.8 | Back navigation available to previous steps | P0 |
| FR-001.9 | Skip option for Step 4 (GHL integration) | P1 |

#### FR-002: Validation & Storage
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Real-time validation for Full Name (min 2 chars) | P0 |
| FR-002.2 | Real-time validation for Company Name (min 2 chars) | P0 |
| FR-002.3 | Phone number format validation (10+ digits) | P0 |
| FR-002.4 | Website URL format validation with auto https:// prefix | P1 |
| FR-002.5 | Required field indicators with error messages | P0 |
| FR-002.6 | Submit onboarding data via tRPC mutation | P0 |
| FR-002.7 | Track conversion event on completion | P0 |
| FR-002.8 | Display loading state during submission | P0 |

### 5.2 Tour System

#### FR-003: Tour Configuration
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Support multiple tour definitions (Welcome, Workflows, etc.) | P0 |
| FR-003.2 | Each tour has: id, name, description, icon, estimatedTime, steps[] | P0 |
| FR-003.3 | Each step has: target selector, title, content, placement | P0 |
| FR-003.4 | Target elements specified via data-tour attributes | P0 |
| FR-003.5 | Placement options: top, bottom, left, right, center | P0 |

#### FR-004: Tour Execution
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Highlight target element with spotlight overlay | P0 |
| FR-004.2 | Position tooltip relative to target element | P0 |
| FR-004.3 | Show step counter (e.g., "Step 2 of 5") | P0 |
| FR-004.4 | Next/Previous navigation buttons | P0 |
| FR-004.5 | Skip Tour option to exit early | P0 |
| FR-004.6 | Scroll element into view if not visible | P1 |
| FR-004.7 | Handle dynamic elements with retry logic | P1 |

#### FR-005: Tour Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Track tour completion status per user | P1 |
| FR-005.2 | Show available tours in Help menu | P0 |
| FR-005.3 | Auto-trigger Welcome tour for new users | P1 |
| FR-005.4 | Feature tips link to relevant tours | P1 |
| FR-005.5 | Export getTourById utility function | P0 |

### 5.3 Quiz System

#### FR-006: Quiz Creation
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | Quiz form with Title (required, min 3 chars) | P0 |
| FR-006.2 | Description textarea (optional) | P0 |
| FR-006.3 | Category dropdown: General, Technical, Business, Marketing, Sales, Customer Service, Product | P0 |
| FR-006.4 | Difficulty: Easy, Medium, Hard | P0 |
| FR-006.5 | Time Limit in minutes (optional) | P1 |
| FR-006.6 | Passing Score percentage (default 70%) | P0 |
| FR-006.7 | Attempts Allowed (optional, null = unlimited) | P1 |

#### FR-007: Question Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | Question types: multiple_choice, true_false, short_answer, essay | P0 |
| FR-007.2 | Question text (required, min 10 chars) | P0 |
| FR-007.3 | Options array for multiple choice (min 2 options) | P0 |
| FR-007.4 | Correct answer field (required except essay) | P0 |
| FR-007.5 | Points per question (default 1) | P0 |
| FR-007.6 | Optional hint for test-takers | P1 |
| FR-007.7 | Optional explanation shown after submission | P1 |
| FR-007.8 | Question reordering via order field | P1 |
| FR-007.9 | Add/Remove question buttons | P0 |

#### FR-008: Quiz Publishing
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | Save as Draft option (isPublished: false) | P0 |
| FR-008.2 | Publish Quiz option (isPublished: true) | P0 |
| FR-008.3 | Validation before publish (min 1 question) | P0 |
| FR-008.4 | Edit published quizzes | P0 |
| FR-008.5 | Delete quiz confirmation dialog | P0 |

#### FR-009: Quiz Taking
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009.1 | Display quiz title, description, metadata | P0 |
| FR-009.2 | Timer countdown if timeLimit set | P1 |
| FR-009.3 | Question navigation/progress indicator | P0 |
| FR-009.4 | Answer input per question type | P0 |
| FR-009.5 | Submit answers button | P0 |
| FR-009.6 | Auto-submit on timer expiration | P1 |
| FR-009.7 | Confirm submission dialog | P0 |

#### FR-010: Quiz Results
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-010.1 | Results Card: Score, Total Points, Percentage, Pass/Fail | P0 |
| FR-010.2 | Passing threshold based on quiz passingScore | P0 |
| FR-010.3 | Time spent calculation | P1 |
| FR-010.4 | Question breakdown table with correct/incorrect indicators | P0 |
| FR-010.5 | Show explanations for incorrect answers | P1 |
| FR-010.6 | Retake button (if attempts remain) | P0 |
| FR-010.7 | Link to all attempts history | P1 |
| FR-010.8 | Instructor feedback field (for manual grading) | P2 |

### 5.4 Training Document System

#### FR-011: Document Upload
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-011.1 | Drag-and-drop upload zone | P0 |
| FR-011.2 | Click-to-browse file selection | P0 |
| FR-011.3 | Supported types: PDF, DOCX, TXT, MD, HTML | P0 |
| FR-011.4 | File size limit: 10MB per file | P0 |
| FR-011.5 | Multi-file upload support | P1 |
| FR-011.6 | Category selection dropdown | P0 |
| FR-011.7 | Platform selection dropdown | P0 |
| FR-011.8 | Upload progress indicator | P0 |
| FR-011.9 | Base64 encoding before API submission | P0 |

#### FR-012: URL Ingestion
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-012.1 | URL input field with validation | P0 |
| FR-012.2 | Import button triggers ingestion | P0 |
| FR-012.3 | Category and platform applied to ingested content | P0 |
| FR-012.4 | Loading state during ingestion | P0 |
| FR-012.5 | Error handling for invalid/unreachable URLs | P0 |

#### FR-013: Document Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-013.1 | List all uploaded documents in table | P0 |
| FR-013.2 | Display: Title, Category, Platform, Chunk Count, Date Added | P0 |
| FR-013.3 | Delete document with confirmation dialog | P0 |
| FR-013.4 | Refresh button to reload list | P0 |
| FR-013.5 | Empty state message when no documents | P0 |

#### FR-014: RAG Integration
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-014.1 | Documents chunked and embedded on upload | P0 |
| FR-014.2 | Chunk count displayed per document | P0 |
| FR-014.3 | Agent queries can retrieve relevant chunks | P0 |
| FR-014.4 | Category filtering for targeted retrieval | P1 |
| FR-014.5 | Platform filtering for CRM-specific context | P1 |

### 5.5 Component Showcase

#### FR-015: Component Display
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-015.1 | Display all shadcn/ui components | P1 |
| FR-015.2 | Interactive examples for each component | P1 |
| FR-015.3 | Theme toggle (light/dark) preview | P1 |
| FR-015.4 | AI ChatBox demonstration | P1 |
| FR-015.5 | Organized sections by component type | P1 |

### 5.6 Settings Integration

#### FR-016: Preferences
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-016.1 | Theme setting: Light, Dark, System | P0 |
| FR-016.2 | Email notification toggles | P0 |
| FR-016.3 | In-app notification toggles | P0 |
| FR-016.4 | Timezone selection | P1 |
| FR-016.5 | Default browser preference | P1 |

#### FR-017: API Key Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-017.1 | Add/Edit API keys (OpenAI, Browserbase, GHL, Custom) | P0 |
| FR-017.2 | Test API key validity | P0 |
| FR-017.3 | Masked display of stored keys | P0 |
| FR-017.4 | Delete keys with confirmation | P0 |

#### FR-018: OAuth Integrations
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-018.1 | Connect Google, Gmail, Outlook, Facebook, Instagram, LinkedIn | P1 |
| FR-018.2 | OAuth popup flow (not redirect) | P1 |
| FR-018.3 | Disconnect integrations | P1 |
| FR-018.4 | Display connection status and last sync | P1 |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001 | Onboarding wizard load time | < 1 second |
| NFR-002 | Tour step transition | < 200ms |
| NFR-003 | Quiz submission processing | < 2 seconds |
| NFR-004 | Document upload (10MB file) | < 30 seconds |
| NFR-005 | Component Showcase initial load | < 3 seconds |
| NFR-006 | Settings page load | < 1.5 seconds |

### 6.2 Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-007 | Onboarding completion data persistence | 99.9% |
| NFR-008 | Quiz attempt data integrity | 100% |
| NFR-009 | Tour state recovery on page reload | 95% |
| NFR-010 | Document upload success rate | >= 98% |

### 6.3 Scalability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-011 | Concurrent onboarding users | >= 1,000 |
| NFR-012 | Documents per account | >= 100 |
| NFR-013 | Quizzes per account | >= 50 |
| NFR-014 | Quiz attempts per user | >= 1,000 |
| NFR-015 | Total chunks in RAG system | >= 100,000 |

### 6.4 Security

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-016 | API keys encrypted with AES-256 | P0 |
| NFR-017 | GHL credentials stored in 1Password via n8n | P0 |
| NFR-018 | User data isolated by account/tenant | P0 |
| NFR-019 | CSRF protection on all mutations | P0 |
| NFR-020 | Rate limiting on upload endpoints | P1 |

### 6.5 Accessibility

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-021 | WCAG 2.1 AA compliance | P1 |
| NFR-022 | Keyboard navigation for onboarding | P0 |
| NFR-023 | Screen reader support for tours | P1 |
| NFR-024 | Color contrast ratios >= 4.5:1 | P1 |
| NFR-025 | Focus indicators visible | P0 |
| NFR-026 | ARIA labels on form inputs | P0 |

### 6.6 Usability

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-027 | Mobile-responsive onboarding | P0 |
| NFR-028 | Touch-friendly tour controls | P1 |
| NFR-029 | Clear error messages with recovery actions | P0 |
| NFR-030 | Consistent button placement (back left, next right) | P0 |

---

## 7. Technical Architecture

### 7.1 System Overview

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  React Frontend  |---->|  tRPC API Layer  |---->|  PostgreSQL DB   |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
        |                        |                        |
        v                        v                        v
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  Tour Store      |     |  RAG Embeddings  |     |  1Password       |
|  (Zustand)       |     |  (Vector DB)     |     |  (Credentials)   |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
                                 |
                                 v
                         +------------------+
                         |                  |
                         |  n8n Workflows   |
                         |  (Automation)    |
                         |                  |
                         +------------------+
```

### 7.2 Frontend Architecture

#### Component Structure

```
client/src/
├── pages/
│   ├── Training.tsx           # Document upload & management
│   ├── Quizzes.tsx            # Quiz listing
│   ├── QuizBuilder.tsx        # Quiz creation/editing
│   ├── QuizTake.tsx           # Quiz taking interface
│   ├── QuizResults.tsx        # Results display
│   ├── Settings.tsx           # User preferences
│   └── ComponentShowcase.tsx  # UI component library
│
├── components/
│   ├── OnboardingFlow.tsx     # Multi-step wizard
│   ├── quiz/
│   │   ├── QuizCard.tsx       # Quiz preview card
│   │   ├── QuizForm.tsx       # Quiz metadata form
│   │   ├── QuestionEditor.tsx # Question creation
│   │   ├── QuizTimer.tsx      # Countdown timer
│   │   └── ResultsCard.tsx    # Score display
│   │
│   └── tour/
│       ├── TourProvider.tsx   # Tour context
│       ├── TourStep.tsx       # Step tooltip
│       ├── TourOverlay.tsx    # Spotlight effect
│       └── FeatureTip.tsx     # Contextual hints
│
├── config/
│   └── tours/
│       ├── index.ts           # Tour registry
│       ├── welcomeTour.ts     # Welcome tour steps
│       ├── workflowTour.ts    # Workflow tour
│       ├── browserSessionsTour.ts
│       ├── scheduledTasksTour.ts
│       ├── quizzesTour.ts
│       ├── creditsTour.ts
│       ├── settingsTour.ts
│       └── leadsTour.ts
│
├── stores/
│   └── tourStore.ts           # Tour state (Zustand)
│
└── hooks/
    └── useQuiz.ts             # Quiz CRUD operations
```

### 7.3 Backend Architecture

#### tRPC Routers

```typescript
// server/api/routers/
├── onboarding.ts    // Onboarding submission
├── rag.ts           // Document upload, ingestion, listing
├── quiz.ts          // Quiz CRUD, attempts, results
└── settings.ts      // Preferences, API keys, integrations
```

#### Database Tables

```sql
-- Onboarding Data
onboarding_submissions (
  id, user_id, full_name, company_name, phone_number,
  industry, monthly_revenue, employee_count, website_url,
  goals, other_goal, ghl_api_key, created_at
)

-- Training Documents
rag_sources (
  id, user_id, title, source_type, source_url, category,
  platform, content_hash, chunk_count, is_active, created_at
)

rag_chunks (
  id, source_id, content, embedding, chunk_index,
  metadata, created_at
)

-- Quizzes
quizzes (
  id, user_id, title, description, category, difficulty,
  time_limit, passing_score, attempts_allowed, is_published,
  created_at, updated_at
)

questions (
  id, quiz_id, question_text, question_type, options,
  correct_answer, points, order, hint, explanation
)

quiz_attempts (
  id, quiz_id, user_id, answers, score, percentage,
  passed, time_spent, feedback, started_at, completed_at
)

-- Settings
api_keys (
  id, user_id, service, name, key_encrypted, status,
  last_tested, created_at
)

oauth_integrations (
  id, user_id, provider, access_token_encrypted,
  refresh_token_encrypted, scopes, connected_at, last_synced
)

user_preferences (
  user_id, default_browser, email_notifications,
  in_app_notifications, timezone, theme
)
```

### 7.4 n8n Workflow Architecture

#### Client Onboarding Workflow (3-client-onboarding.json)

```
Webhook: POST /onboard-client
    │
    ▼
Create Client in PostgreSQL
    │
    ▼
Store Credentials in 1Password
    │
    ▼
Create Browserbase Context
    │
    ▼
Respond Success (clientId, message)
```

**Workflow Nodes:**

| Node | Type | Purpose |
|------|------|---------|
| Webhook - New Client | n8n-nodes-base.webhook | Receive onboarding data |
| Create Client in Database | n8n-nodes-base.postgres | Insert client record |
| Store Credentials in 1Password | HTTP Request | Secure credential storage |
| Create Browserbase Context | HTTP Request | Provision browser context |
| Respond Success | respondToWebhook | Return success response |

---

## 8. API Specifications

### 8.1 Onboarding API

#### POST /api/trpc/onboarding.submit

**Request:**
```typescript
{
  fullName: string;           // min 2 chars
  companyName: string;        // min 2 chars
  phoneNumber: string;        // 10+ digits
  industry: "marketing-agency" | "real-estate" | "healthcare" | "ecommerce" | "saas" | "other";
  monthlyRevenue: "0-10k" | "10k-50k" | "50k-100k" | "100k-500k" | "500k+";
  employeeCount: "just-me" | "2-5" | "6-20" | "21-50" | "50+";
  websiteUrl?: string;        // optional, validated URL
  goals: string[];            // array of goal IDs
  otherGoal?: string;         // free text if 'other' selected
  ghlApiKey?: string;         // optional API key
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  onboardingId: number;
}
```

### 8.2 RAG API

#### POST /api/trpc/rag.uploadDocument

**Request:**
```typescript
{
  fileContent: string;        // base64 encoded
  filename: string;
  mimeType: string;
  category: "training" | "sop" | "business" | "technical" | "general";
  platform: "general" | "ghl" | "hubspot" | "salesforce";
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  sourceId: number;
  chunkCount: number;
}
```

#### POST /api/trpc/rag.ingestUrl

**Request:**
```typescript
{
  url: string;                // valid URL
  category: string;
  platform: string;
}
```

#### GET /api/trpc/rag.listSources

**Request:**
```typescript
{
  limit?: number;             // default 50
  isActive?: boolean;
}
```

**Response:**
```typescript
{
  sources: Array<{
    id: number;
    title: string;
    category: string;
    platform: string;
    chunkCount: number;
    createdAt: Date;
  }>;
  count: number;
}
```

#### DELETE /api/trpc/rag.deleteSource

**Request:**
```typescript
{
  sourceId: number;
}
```

### 8.3 Quiz API

#### POST /api/trpc/quiz.create

**Request:**
```typescript
{
  title: string;              // min 3 chars
  description?: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit?: number;         // minutes
  passingScore: number;       // percentage
  attemptsAllowed?: number;
  isPublished: boolean;
}
```

**Response:**
```typescript
{
  quiz: {
    id: number;
    title: string;
    // ... other fields
  };
}
```

#### POST /api/trpc/quiz.addQuestion

**Request:**
```typescript
{
  quizId: number;
  questionText: string;       // min 10 chars
  questionType: "multiple_choice" | "true_false" | "short_answer" | "essay";
  options?: string[];         // for multiple_choice
  correctAnswer: any;
  points: number;
  order: number;
  hint?: string;
  explanation?: string;
}
```

#### POST /api/trpc/quiz.submitAttempt

**Request:**
```typescript
{
  quizId: number;
  answers: Array<{
    questionId: number;
    answer: any;
  }>;
  timeSpent: number;          // seconds
}
```

**Response:**
```typescript
{
  attempt: {
    id: number;
    score: number;
    percentage: number;
    passed: boolean;
    timeSpent: number;
  };
}
```

#### GET /api/trpc/quiz.getResults

**Request:**
```typescript
{
  quizId: number;
  attemptId: number;
}
```

### 8.4 Settings API

#### GET /api/trpc/settings.getPreferences

**Response:**
```typescript
{
  defaultBrowser: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  timezone: string;
  theme: "light" | "dark" | "system";
}
```

#### POST /api/trpc/settings.saveApiKey

**Request:**
```typescript
{
  service: "OpenAI" | "Browserbase" | "GoHighLevel" | "Custom";
  name: string;
  key: string;
}
```

#### POST /api/trpc/settings.testApiKey

**Request:**
```typescript
{
  id: string;
}
```

**Response:**
```typescript
{
  isValid: boolean;
  message: string;
}
```

---

## 9. Data Models

### 9.1 Onboarding Data Model

```typescript
interface OnboardingSubmission {
  id: number;
  userId: number;
  fullName: string;
  companyName: string;
  phoneNumber: string;
  industry: IndustryType;
  monthlyRevenue: RevenueRange;
  employeeCount: EmployeeRange;
  websiteUrl: string | null;
  goals: string[];
  otherGoal: string | null;
  ghlApiKey: string | null;  // encrypted
  createdAt: Date;
}

type IndustryType =
  | "marketing-agency"
  | "real-estate"
  | "healthcare"
  | "ecommerce"
  | "saas"
  | "other";

type RevenueRange =
  | "0-10k"
  | "10k-50k"
  | "50k-100k"
  | "100k-500k"
  | "500k+";

type EmployeeRange =
  | "just-me"
  | "2-5"
  | "6-20"
  | "21-50"
  | "50+";
```

### 9.2 Tour Data Model

```typescript
interface Tour {
  id: string;
  name: string;
  description: string;
  icon?: string;
  estimatedTime: string;
  steps: TourStep[];
}

interface TourStep {
  id?: string;
  target: string;           // CSS selector or data-tour attribute
  title: string;
  content: string;
  placement: "top" | "bottom" | "left" | "right" | "center";
}
```

### 9.3 Quiz Data Model

```typescript
interface Quiz {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  category: QuizCategory;
  difficulty: Difficulty;
  timeLimit: number | null;
  passingScore: number;
  attemptsAllowed: number | null;
  isPublished: boolean;
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}

interface Question {
  id: number;
  quizId: number;
  questionText: string;
  questionType: QuestionType;
  options: string[] | null;     // JSON array for multiple_choice
  correctAnswer: any;           // JSON value
  points: number;
  order: number;
  hint: string | null;
  explanation: string | null;
}

interface QuizAttempt {
  id: number;
  quizId: number;
  userId: number;
  answers: AnswerRecord[];      // JSON array
  score: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;            // seconds
  feedback: string | null;
  startedAt: Date;
  completedAt: Date;
}

interface AnswerRecord {
  questionId: number;
  answer: any;
}

type QuizCategory =
  | "general"
  | "technical"
  | "business"
  | "marketing"
  | "sales"
  | "customer-service"
  | "product";

type Difficulty = "easy" | "medium" | "hard";

type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "essay";
```

### 9.4 Training Document Data Model

```typescript
interface RAGSource {
  id: number;
  userId: number;
  title: string;
  sourceType: "file" | "url";
  sourceUrl: string | null;
  category: DocumentCategory;
  platform: Platform;
  contentHash: string;
  chunkCount: number;
  isActive: boolean;
  createdAt: Date;
}

interface RAGChunk {
  id: number;
  sourceId: number;
  content: string;
  embedding: number[];          // vector
  chunkIndex: number;
  metadata: Record<string, any>;
  createdAt: Date;
}

type DocumentCategory =
  | "training"
  | "sop"
  | "business"
  | "technical"
  | "general";

type Platform =
  | "general"
  | "ghl"
  | "hubspot"
  | "salesforce";
```

### 9.5 Settings Data Model

```typescript
interface ApiKey {
  id: string;
  userId: number;
  service: ApiKeyService;
  name: string;
  keyEncrypted: string;
  status: ApiKeyStatus;
  lastTested: Date | null;
  createdAt: Date;
}

interface OAuthIntegration {
  id: string;
  userId: number;
  provider: IntegrationProvider;
  accessTokenEncrypted: string;
  refreshTokenEncrypted: string;
  scopes: string[];
  connectedAt: Date;
  lastSynced: Date | null;
}

interface UserPreferences {
  userId: number;
  defaultBrowser: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  timezone: string;
  theme: "light" | "dark" | "system";
}

type ApiKeyService = "OpenAI" | "Browserbase" | "GoHighLevel" | "Custom";
type ApiKeyStatus = "valid" | "invalid" | "untested";
type IntegrationProvider =
  | "Google"
  | "Gmail"
  | "Outlook"
  | "Facebook"
  | "Instagram"
  | "LinkedIn";
```

---

## 10. UI/UX Requirements

### 10.1 Onboarding Flow Design

#### Visual Design

| Element | Specification |
|---------|--------------|
| Background | Light gradient: emerald-100 via slate-50 to white |
| Card | GlassPane with blur effect, shadow-2xl |
| Step Indicator | Circular badges with connecting lines |
| Progress Colors | Completed: emerald-600, Current: emerald-600, Pending: slate-200 |
| Animation | slide-in-right for step transitions |

#### Layout

| Element | Specification |
|---------|--------------|
| Container | Max-width 2xl, centered |
| Card Padding | p-12 |
| Minimum Height | 500px |
| Form Spacing | space-y-6 |
| Input Style | bg-white/50 border rounded-xl py-4 |

#### Step Content

| Step | Title | Fields |
|------|-------|--------|
| 1 | About You | Full Name, Company Name, Phone Number |
| 2 | About Your Business | Industry, Revenue, Employees, Website |
| 3 | Your Goals | Checkbox list with 6 predefined + Other |
| 4 | Connect GoHighLevel | API Key input (optional) |
| 5 | Ready to Launch | Summary + animated status display |

### 10.2 Tour System Design

#### Spotlight Overlay

| Element | Specification |
|---------|--------------|
| Overlay Color | bg-black/50 |
| Spotlight | Cutout around target element with padding |
| Z-Index | Tour overlay: 9999, Tooltip: 10000 |

#### Tooltip Design

| Element | Specification |
|---------|--------------|
| Background | Card with shadow-lg |
| Max Width | 350px |
| Title | Font-bold text-lg |
| Content | text-muted-foreground |
| Buttons | Primary (Next), Ghost (Skip), Outline (Previous) |
| Progress | "Step X of Y" text-sm |

#### Animations

| Animation | Duration | Easing |
|-----------|----------|--------|
| Tooltip appear | 200ms | ease-out |
| Spotlight transition | 300ms | ease-in-out |
| Step change | 250ms | ease |

### 10.3 Quiz System Design

#### Quiz Card

| Element | Specification |
|---------|--------------|
| Layout | Card with hover shadow effect |
| Title | text-lg font-semibold truncate |
| Description | text-sm text-muted line-clamp-2 |
| Badges | Category, Difficulty, Draft/Published |
| Actions | Take, Edit, Delete icons |

#### Quiz Builder

| Element | Specification |
|---------|--------------|
| Header | Sticky with blur backdrop |
| Question Cards | Collapsible, draggable order |
| Options | Dynamic add/remove buttons |
| Correct Answer | Radio/checkbox highlight |
| Save Bar | Sticky bottom with Save Draft + Publish |

#### Results Display

| Element | Specification |
|---------|--------------|
| Results Card | Large center display |
| Score | text-4xl font-bold |
| Pass/Fail | Green checkmark / Red X icon |
| Breakdown | Table with question-by-question details |
| Explanations | Collapsible per question |

### 10.4 Training Module Design

#### Upload Zone

| Element | Specification |
|---------|--------------|
| Border | border-2 border-dashed |
| Drag State | border-emerald-500 bg-emerald-50 |
| Hover State | border-emerald-400 |
| Icon | Upload lucide icon, w-10 h-10 |
| Text | Clear instructions with file type list |

#### Document Table

| Element | Specification |
|---------|--------------|
| Columns | Title, Category, Platform, Chunks, Date, Actions |
| Badges | Category (secondary), Platform (outline), Chunks (emerald) |
| Delete | Red hover state with confirmation dialog |

### 10.5 Component Showcase Design

| Section | Components |
|---------|------------|
| Forms | Input, Textarea, Select, Checkbox, Radio, Switch, Slider |
| Feedback | Alert, Badge, Progress, Toast, Skeleton |
| Overlays | Dialog, Drawer, Sheet, Popover, Tooltip |
| Navigation | Tabs, Accordion, Breadcrumb, Pagination |
| Data Display | Table, Card, Avatar, Calendar |
| AI | AIChatBox with demo messages |

### 10.6 Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | < 640px | Single column, stacked forms |
| Tablet | 640-1024px | Two column grids |
| Desktop | > 1024px | Full three-column layouts |

### 10.7 Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Keyboard Navigation | Tab through all interactive elements |
| Focus Indicators | ring-2 ring-emerald-500/20 |
| ARIA Labels | All form inputs and buttons |
| Error Announcements | role="alert" on validation errors |
| Screen Reader | aria-describedby for hints |
| Color Contrast | 4.5:1 minimum ratio |

---

## 11. Dependencies & Integrations

### 11.1 Frontend Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Framework |
| Wouter | 3.x | Routing |
| Zustand | 4.x | Tour state management |
| Lucide React | 0.x | Icons |
| shadcn/ui | latest | UI components |
| Sonner | 1.x | Toast notifications |
| date-fns | 3.x | Date formatting |
| @tanstack/react-query | 5.x | Data fetching (via tRPC) |

### 11.2 Backend Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| tRPC | 10.x | Type-safe API |
| Drizzle ORM | 0.x | Database ORM |
| PostgreSQL | 15.x | Primary database |
| Zod | 3.x | Validation |

### 11.3 External Integrations

| Integration | Purpose | Required |
|-------------|---------|----------|
| 1Password Connect | Credential storage | Optional |
| Browserbase | Browser context provisioning | Optional |
| GoHighLevel API | CRM integration | Optional |
| Google OAuth | Authentication/Integration | Optional |
| Vector Database | RAG embeddings | Required |

### 11.4 n8n Workflow Dependencies

| Workflow | Nodes Used | Credentials Required |
|----------|------------|---------------------|
| 3-client-onboarding | Webhook, Postgres, HTTP Request, Respond | PostgreSQL, 1Password Token, Browserbase API |

---

## 12. Release Criteria

### 12.1 Alpha Release (Internal Testing)

| Criteria | Requirement |
|----------|-------------|
| Onboarding Flow | All 5 steps functional |
| Welcome Tour | Complete and tested |
| Quiz CRUD | Create, Read, Update, Delete working |
| Document Upload | PDF and TXT supported |
| Unit Tests | > 60% coverage |
| Accessibility | Keyboard navigation working |

### 12.2 Beta Release (Limited Users)

| Criteria | Requirement |
|----------|-------------|
| All Tours | 7+ tours complete and tested |
| Quiz Taking | Full flow with results |
| Document Types | All file types supported |
| URL Ingestion | Functional |
| Integration Tests | > 70% coverage |
| Performance | All NFRs met |
| Mobile Responsive | All features usable |

### 12.3 Production Release

| Criteria | Requirement |
|----------|-------------|
| Feature Complete | All P0 and P1 requirements |
| Test Coverage | > 80% |
| Documentation | User guide complete |
| Analytics | All KPIs tracked |
| Security Audit | Passed |
| Load Testing | 1000 concurrent users |
| Accessibility Audit | WCAG 2.1 AA compliant |

### 12.4 Acceptance Testing Checklist

#### Onboarding Flow

- [ ] New user sees onboarding on first login
- [ ] All form validations trigger correctly
- [ ] Progress indicator updates per step
- [ ] Back navigation preserves data
- [ ] Skip works for optional steps
- [ ] Summary shows all entered data
- [ ] Submission creates database record
- [ ] Conversion event fires
- [ ] User redirected to dashboard after completion

#### Tour System

- [ ] Tours accessible from Help menu
- [ ] Spotlight highlights correct element
- [ ] Tooltip positions correctly
- [ ] Next/Previous navigation works
- [ ] Skip Tour ends tour early
- [ ] Tour completion tracked
- [ ] Dynamic elements handled

#### Quiz System

- [ ] Quiz creation saves to database
- [ ] All question types work
- [ ] Time limit enforces auto-submit
- [ ] Results calculate correctly
- [ ] Pass/Fail determined by passing score
- [ ] Retake respects attempt limit
- [ ] Essay questions marked as "Manual grading"

#### Training Documents

- [ ] File upload works for all types
- [ ] URL ingestion fetches content
- [ ] Chunks generated correctly
- [ ] RAG retrieval returns relevant content
- [ ] Delete removes source and chunks
- [ ] Category/Platform filtering works

---

## 13. Risks & Mitigations

### 13.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Tour elements not found (dynamic content) | Tour breaks | Medium | Implement retry logic with fallback to center placement |
| Large document upload timeout | Upload fails | Medium | Implement chunked upload with resume capability |
| Vector DB scaling issues | RAG latency | Low | Use HNSW indexing, implement caching |
| Quiz answer data corruption | Invalid results | Low | JSON schema validation, transaction rollback |
| OAuth token expiration | Integration disconnects | Medium | Implement refresh token rotation |

### 13.2 User Experience Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Onboarding too long | High drop-off | Medium | A/B test shorter variants, add skip options |
| Tours annoying power users | Negative sentiment | Low | Add "Don't show again" option, remember preferences |
| Quiz difficulty mismatch | Discouragement | Medium | Provide difficulty-based filtering, hints |
| Document processing opaque | User confusion | Low | Add detailed progress indicators |

### 13.3 Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low tour adoption | Features underutilized | Medium | Smart triggers based on user behavior |
| Quiz creation too complex | Low quiz creation | Low | Provide quiz templates, AI-assisted generation |
| Poor RAG quality | Bad agent responses | Medium | Quality feedback loop, manual review option |

### 13.4 Security Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| API key exposure in client | Credential leak | Low | Keys never sent to client, masked display |
| Document content injection | XSS/malware | Low | Sanitize content, sandbox rendering |
| Quiz answer manipulation | Cheating | Medium | Server-side validation, time tracking |

---

## 14. Future Considerations

### 14.1 Phase 2 Enhancements

| Feature | Description | Priority |
|---------|-------------|----------|
| **AI Quiz Generator** | Generate quizzes from uploaded documents | P1 |
| **Learning Paths** | Structured course sequences | P2 |
| **Certifications** | Completion certificates with verification | P2 |
| **Video Tutorials** | Embedded video content in tours | P2 |
| **Multi-language Tours** | i18n support for tour content | P2 |
| **Quiz Analytics Dashboard** | Aggregate reporting for admins | P1 |
| **Document OCR** | Image/scanned PDF text extraction | P2 |
| **Team Progress Tracking** | Manager visibility into team learning | P1 |

### 14.2 Integration Roadmap

| Integration | Timeline | Purpose |
|-------------|----------|---------|
| Intercom | Q2 2026 | Contextual help widgets |
| LMS Exports | Q3 2026 | SCORM/xAPI compliance |
| Slack | Q2 2026 | Quiz notifications |
| HubSpot | Q3 2026 | Training completion tracking |

### 14.3 Scalability Considerations

| Consideration | Approach |
|---------------|----------|
| Multi-tenant tour customization | White-label tour content per account |
| Enterprise quiz management | Bulk import, role-based access |
| Document storage limits | Tiered storage with archival |
| Real-time collaboration | Live quiz taking, shared tours |

### 14.4 AI Enhancement Opportunities

| Opportunity | Description |
|-------------|-------------|
| Adaptive Learning | AI adjusts difficulty based on performance |
| Smart Recommendations | Suggest tours based on usage patterns |
| Automated Grading | AI-assisted essay evaluation |
| Knowledge Gap Detection | Identify areas needing more training |
| Personalized Onboarding | Dynamic steps based on user profile |

---

## Appendix A: Tour Configuration Reference

### Available Tours

| Tour ID | Name | Steps | Target Pages |
|---------|------|-------|--------------|
| welcome | Welcome Tour | 4 | Dashboard |
| ai-assistant | AI Assistant | 3 | AI Chat |
| workflow | Workflow Builder | 5 | Workflows |
| scheduled-tasks | Scheduled Tasks | 4 | Scheduler |
| browser-sessions | Browser Sessions | 5 | Sessions |
| quizzes | Quiz Builder | 8 | Quizzes |
| credits | Credits & Usage | 4 | Credits |
| settings | Settings | 3 | Settings |

### Tour Step Placement Guide

```typescript
// Target selector patterns
'[data-tour="feature-name"]'     // Primary pattern
'.component-class'                // Fallback
'#element-id'                     // Specific elements

// Placement options
'top'     // Tooltip above element
'bottom'  // Tooltip below element
'left'    // Tooltip to left
'right'   // Tooltip to right
'center'  // Centered modal (no element)
```

---

## Appendix B: Quiz Question Templates

### Multiple Choice Template

```typescript
{
  questionText: "What is the primary purpose of browser automation?",
  questionType: "multiple_choice",
  options: [
    "Manual data entry",
    "Automated web interactions",
    "Email sending",
    "File storage"
  ],
  correctAnswer: "Automated web interactions",
  points: 1,
  hint: "Think about what 'automation' means",
  explanation: "Browser automation enables programmatic control of web browsers for testing, scraping, and workflow automation."
}
```

### True/False Template

```typescript
{
  questionText: "RAG systems can use uploaded documents to enhance AI responses.",
  questionType: "true_false",
  correctAnswer: true,
  points: 1,
  explanation: "Retrieval-Augmented Generation (RAG) retrieves relevant document chunks to provide context for AI responses."
}
```

### Short Answer Template

```typescript
{
  questionText: "What file format is commonly used for training documents?",
  questionType: "short_answer",
  correctAnswer: "PDF",
  points: 2,
  hint: "It's a widely used document format"
}
```

---

## Appendix C: Document Categories Reference

| Category | Description | Use Cases |
|----------|-------------|-----------|
| training | Training materials for team education | Onboarding docs, how-to guides |
| sop | Standard Operating Procedures | Process documentation |
| business | Business-specific information | Company info, client details |
| technical | Technical documentation | API docs, architecture specs |
| general | General reference materials | FAQs, knowledge base |

| Platform | Description | When to Use |
|----------|-------------|-------------|
| general | Platform-agnostic content | Universal documentation |
| ghl | GoHighLevel-specific | GHL workflows, integrations |
| hubspot | HubSpot-specific | HubSpot configurations |
| salesforce | Salesforce-specific | Salesforce integrations |

---

**Document Approval:**

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Tech Lead | | | |
| UX Lead | | | |
| QA Lead | | | |

---

*End of PRD-016: Training & Onboarding System*
