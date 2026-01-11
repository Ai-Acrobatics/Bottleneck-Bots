# PRD: Onboarding Flow

## Overview
A comprehensive onboarding system guiding new users through profile collection, business information setup, GoHighLevel API key configuration, email connection, and initial workflow creation. This flow transforms new registrations into active, engaged users with fully configured accounts.

## Problem Statement
New users face a complex setup process involving multiple integrations, configurations, and concepts unique to Bottleneck-Bots. Without guided onboarding, users may abandon the platform before experiencing its value, misconfigure critical integrations, or fail to understand core features. A structured onboarding flow ensures users complete essential setup steps and reach their "aha moment" quickly.

## Goals & Objectives
- **Primary Goals**
  - Guide users through all essential configuration steps
  - Minimize time-to-value for new users
  - Ensure critical integrations are properly configured
  - Educate users on platform capabilities

- **Success Metrics**
  - > 80% onboarding completion rate
  - < 10 minutes average onboarding time
  - > 90% GHL connection rate during onboarding
  - > 70% first workflow creation during onboarding

## User Stories
- As a new user, I want a guided setup so that I can configure my account correctly
- As a business owner, I want to connect my GHL account easily so that I can start automating
- As a user, I want to understand what Bottleneck-Bots can do so that I can use it effectively
- As a user, I want to skip steps I'm not ready for so that I can explore at my own pace
- As a returning user, I want to resume onboarding where I left off so that I don't repeat steps

## Functional Requirements

### Must Have (P0)
- **Step 1: Welcome & Profile Collection**
  - Welcome message with value proposition
  - Display name input
  - Avatar upload (optional)
  - Timezone selection (auto-detected)
  - Industry/use case selection
  - Progress indicator

- **Step 2: Business Information**
  - Business name
  - Business type (agency/solo/enterprise)
  - Team size selection
  - Primary use case (lead gen/nurturing/operations)
  - Expected automation volume
  - Goals and objectives (multi-select)

- **Step 3: GoHighLevel API Setup**
  - GHL integration explanation
  - Step-by-step API key instructions (with screenshots)
  - API key input field
  - Real-time validation with GHL
  - Location/subaccount selection (if multiple)
  - Skip option with reminder scheduling
  - Error handling with troubleshooting tips

- **Step 4: Email Connection**
  - Email integration benefits explanation
  - Provider selection (Gmail, Outlook, IMAP)
  - OAuth flow for supported providers
  - IMAP configuration for other providers
  - Connection verification
  - Skip option with reminder

- **Step 5: Initial Workflow Creation**
  - Template gallery presentation
  - Template preview and explanation
  - Template selection
  - Basic customization wizard
  - Workflow activation toggle
  - Manual creation option

- **Onboarding Progress Tracking**
  - Persistent progress state
  - Resume from any step
  - Skip step with consequences explained
  - Step completion timestamps
  - Onboarding analytics events

### Should Have (P1)
- **Interactive Tutorials**
  - Workflow editor walkthrough
  - Action library tour
  - Trigger configuration demo
  - Testing workflow demonstration

- **Personalization**
  - Industry-specific template recommendations
  - Use case-specific guidance
  - Custom onboarding paths by user type
  - Personalized success metrics

- **Assistance**
  - Contextual help tooltips
  - Video tutorials per step
  - Live chat support integration
  - FAQ accordion
  - Troubleshooting guides

- **Gamification**
  - Onboarding progress rewards
  - Completion celebration
  - Achievement badges
  - Quick start checklist

### Nice to Have (P2)
- **Advanced Onboarding**
  - Team member invitation step
  - Billing setup for paid plans
  - Custom integration requests
  - Concierge onboarding for enterprise

- **Onboarding Optimization**
  - A/B testing different flows
  - Drop-off analysis
  - Personalized re-engagement
  - Onboarding feedback collection

## Non-Functional Requirements

### Performance
- Page transitions < 500ms
- API validation < 3 seconds
- Template loading < 2 seconds
- Auto-save on every step

### Security
- API keys encrypted immediately
- OAuth tokens secured
- No sensitive data in URLs
- Session security during onboarding

### Scalability
- Support concurrent onboardings
- Template caching
- Lazy loading for assets
- CDN for images/videos

### Reliability
- Resume from any point after crash
- Offline-capable for form steps
- Graceful handling of API failures
- Fallback options for failed integrations

## Technical Requirements

### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Onboarding System                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 Onboarding UI                        │   │
│  │  Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Done  │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │  Onboarding   │  │  Integration  │  │   Template    │  │
│  │    State      │  │   Validator   │  │   Selector    │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │     GHL       │  │    Email      │  │   Workflow    │  │
│  │  Connector    │  │  Connector    │  │   Creator     │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │  PostgreSQL   │  │    Redis      │  │   Analytics   │  │
│  │   (State)     │  │   (Cache)     │  │   (Events)    │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Dependencies
- GoHighLevel API client
- Email OAuth providers (Google, Microsoft)
- Workflow template service
- Analytics tracking service
- Image upload service

### APIs
```typescript
// Onboarding State
GET  /api/v1/onboarding/status
PUT  /api/v1/onboarding/step/:step
POST /api/v1/onboarding/complete
POST /api/v1/onboarding/skip/:step

// Profile Step
PUT /api/v1/onboarding/profile
{
  displayName: string;
  avatarUrl?: string;
  timezone: string;
  industry: string;
}

// Business Step
PUT /api/v1/onboarding/business
{
  businessName: string;
  businessType: 'agency' | 'solo' | 'enterprise';
  teamSize: string;
  primaryUseCase: string;
  goals: string[];
}

// GHL Connection
POST /api/v1/onboarding/ghl/validate
{
  apiKey: string;
}
POST /api/v1/onboarding/ghl/connect
{
  apiKey: string;
  locationId: string;
}

// Email Connection
GET  /api/v1/onboarding/email/providers
POST /api/v1/onboarding/email/oauth/:provider
POST /api/v1/onboarding/email/imap
{
  host: string;
  port: number;
  username: string;
  password: string;
}

// Workflow Creation
GET  /api/v1/onboarding/templates
GET  /api/v1/onboarding/templates/:id
POST /api/v1/onboarding/templates/:id/create
POST /api/v1/onboarding/workflows/custom
```

### Data Models
```typescript
interface OnboardingState {
  userId: string;
  currentStep: number;
  completedSteps: number[];
  skippedSteps: number[];
  stepData: Record<number, StepData>;
  startedAt: Date;
  completedAt: Date | null;
  lastActivityAt: Date;
  source: string; // utm_source or referrer
  abTestVariant: string | null;
}

interface StepData {
  step: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  data: Record<string, any>;
  startedAt: Date | null;
  completedAt: Date | null;
  timeSpent: number; // seconds
}

interface OnboardingStep {
  step: number;
  name: string;
  title: string;
  description: string;
  required: boolean;
  estimatedTime: number; // seconds
  prerequisiteSteps: number[];
}

interface OnboardingTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  industries: string[];
  useCases: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedSetupTime: number; // minutes
  previewImage: string;
  steps: TemplateStep[];
  popularity: number;
}

interface OnboardingAnalyticsEvent {
  userId: string;
  event: string;
  step: number;
  timestamp: Date;
  metadata: Record<string, any>;
  sessionId: string;
}
```

### Onboarding Steps Configuration
```typescript
const onboardingSteps: OnboardingStep[] = [
  {
    step: 1,
    name: 'profile',
    title: 'Tell us about yourself',
    description: 'Help us personalize your experience',
    required: true,
    estimatedTime: 60,
    prerequisiteSteps: []
  },
  {
    step: 2,
    name: 'business',
    title: 'Your business details',
    description: 'Help us recommend the right automations',
    required: true,
    estimatedTime: 90,
    prerequisiteSteps: [1]
  },
  {
    step: 3,
    name: 'ghl',
    title: 'Connect GoHighLevel',
    description: 'Power your CRM automations',
    required: false,
    estimatedTime: 180,
    prerequisiteSteps: [2]
  },
  {
    step: 4,
    name: 'email',
    title: 'Connect your email',
    description: 'Enable email-triggered automations',
    required: false,
    estimatedTime: 120,
    prerequisiteSteps: [2]
  },
  {
    step: 5,
    name: 'workflow',
    title: 'Create your first workflow',
    description: 'Experience the power of automation',
    required: false,
    estimatedTime: 300,
    prerequisiteSteps: [2]
  }
];
```

### Re-engagement Triggers
```typescript
const reEngagementRules = [
  {
    trigger: 'skipped_ghl',
    delay: '24h',
    action: 'send_email',
    template: 'ghl_setup_reminder'
  },
  {
    trigger: 'abandoned_step_3',
    delay: '1h',
    action: 'send_email',
    template: 'continue_setup'
  },
  {
    trigger: 'completed_no_workflow',
    delay: '48h',
    action: 'send_email',
    template: 'first_workflow_guide'
  },
  {
    trigger: 'workflow_not_activated',
    delay: '24h',
    action: 'in_app_notification',
    template: 'activate_workflow_reminder'
  }
];
```

## Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Completion Rate | > 80% | Users who complete all required steps |
| Average Time | < 10 min | Time from start to completion |
| GHL Connection Rate | > 90% | Users who connect GHL during onboarding |
| Email Connection Rate | > 70% | Users who connect email during onboarding |
| First Workflow Rate | > 70% | Users who create workflow during onboarding |
| 7-Day Retention | > 60% | Users active 7 days after onboarding |

## Dependencies
- User authentication system
- GoHighLevel API integration
- Email OAuth providers
- Workflow template library
- Analytics tracking system
- Email notification service

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| High abandonment rate | Critical - Lost users | Progress saving, skip options, simplified steps |
| GHL API validation failures | High - Integration blocked | Detailed error messages, support escalation |
| OAuth provider issues | Medium - Email not connected | Fallback to IMAP, clear instructions |
| Template overwhelm | Medium - Decision paralysis | Curated recommendations, filtering |
| Mobile experience issues | Medium - Mobile abandonment | Responsive design, mobile-first testing |
| Slow API responses | Medium - Poor UX | Loading states, optimistic UI, caching |
