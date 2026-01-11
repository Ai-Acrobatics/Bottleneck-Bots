# PRD: Custom Tours & Onboarding

## Overview
Implement an interactive product tour and onboarding system that guides new users through Bottleneck-Bots features. This includes step-by-step walkthroughs, feature highlight overlays, contextual tooltips, and persistent progress tracking to ensure users successfully adopt the platform.

## Problem Statement
Complex SaaS applications suffer from high abandonment rates when users cannot quickly understand value or navigate features. Without proper onboarding:
- 70% of trial users never complete key activation steps
- Support tickets increase from confused users
- Feature discovery is poor for both new and existing users
- User activation and retention rates decline
- Premium features go unused, reducing upgrade conversion

## Goals & Objectives
- **Primary Goals**
  - Reduce time-to-first-value by guiding users through initial setup
  - Increase feature adoption through contextual discovery
  - Provide self-service learning paths that reduce support burden
  - Create re-entrant tours that users can replay anytime
  - Track onboarding progress to identify and address drop-off points

- **Success Metrics**
  - 80% tour completion rate for new users
  - 50% reduction in "getting started" support tickets
  - 30% increase in feature adoption metrics
  - Time-to-first-bot-creation < 10 minutes for new users

## User Stories
- As a new user, I want a guided tour so that I can quickly understand how to use the platform
- As a user, I want to skip tours I don't need so that I'm not forced through irrelevant content
- As a user discovering a new feature, I want a quick tutorial so that I can learn without leaving context
- As a user, I want to replay tours so that I can refresh my memory on features
- As a product manager, I want to track tour completion so that I can optimize the onboarding flow
- As an admin, I want to create custom tours so that I can onboard users to our specific workflows
- As a developer, I want to add tour steps to new features so that discoverability is built-in

## Functional Requirements

### Must Have (P0)
- **Welcome Tour**: Initial product tour triggered on first login
- **Step-by-Step Guidance**: Sequential steps with spotlight highlighting
- **Tooltip Positioning**: Smart positioning that avoids viewport edges
- **Progress Indicator**: Visual step progress (e.g., "Step 2 of 5")
- **Skip/Exit Controls**: Allow users to skip or exit tours at any point
- **Tour Persistence**: Remember completed tours per user
- **Responsive Design**: Tours work on desktop and mobile viewports
- **Keyboard Navigation**: Navigate tours with arrow keys, Enter, Escape

### Should Have (P1)
- **Feature Spotlights**: Single-step highlights for new features
- **Contextual Tours**: Different tours based on user role or page
- **Interactive Steps**: Steps that require user action to proceed
- **Tour Branching**: Conditional paths based on user choices
- **Re-entry Points**: Resume interrupted tours
- **Tour Analytics**: Track step views, completions, and drop-offs
- **Custom Tour Builder**: Admin UI to create/modify tours without code
- **Video Embeds**: Support for embedded video tutorials in steps

### Nice to Have (P2)
- **AI-Guided Tours**: Personalized tour paths based on user behavior
- **Gamification**: Badges/rewards for completing onboarding milestones
- **In-App Announcements**: Modal announcements for major updates
- **Checklists**: Onboarding checklist widget showing progress
- **Hotspots**: Pulsing indicators for undiscovered features
- **Tour Templates**: Pre-built tour templates for common flows
- **A/B Testing**: Test different tour variations

## Non-Functional Requirements

### Performance
- Tour overlay renders < 100ms
- No layout shift when spotlights appear
- Smooth transitions between steps (60fps)
- Minimal bundle size impact (< 20KB gzipped)

### Accessibility
- Screen reader announcements for each step
- Keyboard-navigable tour controls
- Focus management between steps
- Sufficient color contrast in overlays
- Pause/resume for users who need more time

### Scalability
- Support 50+ distinct tours
- Handle tours with 20+ steps efficiently
- Analytics scale to millions of tour events

## Technical Requirements

### Architecture
```
/src/features/tours/
  ├── components/
  │   ├── tour-provider.tsx        # Context provider for tour state
  │   ├── tour-step.tsx            # Individual step component
  │   ├── tour-spotlight.tsx       # Highlighted area overlay
  │   ├── tour-tooltip.tsx         # Step content tooltip
  │   ├── tour-progress.tsx        # Progress indicator
  │   ├── tour-controls.tsx        # Navigation buttons
  │   └── tour-overlay.tsx         # Background dimming
  ├── hooks/
  │   ├── use-tour.ts              # Tour control hook
  │   ├── use-tour-step.ts         # Step-level logic
  │   └── use-spotlight.ts         # Element highlighting
  ├── tours/
  │   ├── welcome-tour.ts          # Welcome tour definition
  │   ├── bot-creation-tour.ts     # Bot creation guide
  │   ├── workflow-tour.ts         # Workflow builder guide
  │   └── index.ts                 # Tour registry
  ├── lib/
  │   ├── tour-engine.ts           # Core tour logic
  │   ├── positioning.ts           # Tooltip placement
  │   └── analytics.ts             # Tour event tracking
  └── api/
      └── tour-progress.router.ts  # Progress persistence
```

### Tour Definition Schema
```typescript
// Tour configuration
interface Tour {
  id: string;
  name: string;
  description?: string;
  version: number;
  triggerConditions: TriggerCondition[];
  steps: TourStep[];
  onComplete?: () => void;
}

interface TourStep {
  id: string;
  target: string;           // CSS selector for highlight element
  title: string;
  content: string | React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  spotlightPadding?: number;
  spotlightRadius?: number;
  interactive?: boolean;    // Wait for user action
  requiredAction?: {
    type: 'click' | 'input' | 'navigate';
    target: string;
    value?: string;
  };
  beforeStep?: () => Promise<void>;
  afterStep?: () => Promise<void>;
  skipCondition?: () => boolean;
}

interface TriggerCondition {
  type: 'first-visit' | 'route' | 'feature-flag' | 'custom';
  route?: string;
  flagKey?: string;
  check?: () => boolean;
}

// Example tour definition
const welcomeTour: Tour = {
  id: 'welcome-tour',
  name: 'Welcome to Bottleneck-Bots',
  version: 1,
  triggerConditions: [
    { type: 'first-visit' },
    { type: 'route', route: '/dashboard' }
  ],
  steps: [
    {
      id: 'welcome',
      target: '[data-tour="dashboard"]',
      title: 'Welcome!',
      content: 'This is your dashboard where you can see all your bots and activity.',
      placement: 'bottom',
    },
    {
      id: 'create-bot',
      target: '[data-tour="create-bot-button"]',
      title: 'Create Your First Bot',
      content: 'Click here to create a new automation bot.',
      interactive: true,
      requiredAction: {
        type: 'click',
        target: '[data-tour="create-bot-button"]',
      },
    },
    {
      id: 'bot-form',
      target: '[data-tour="bot-name-input"]',
      title: 'Name Your Bot',
      content: 'Give your bot a descriptive name.',
      placement: 'right',
    },
  ],
};
```

### Tour Provider Component
```typescript
// Tour context provider
interface TourContextValue {
  activeTour: Tour | null;
  currentStepIndex: number;
  startTour: (tourId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  goToStep: (stepIndex: number) => void;
  isTourActive: boolean;
  progress: number; // 0-100
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const { data: completedTours, mutate: saveProgress } =
    api.tours.getProgress.useQuery();

  // Auto-trigger tours based on conditions
  useEffect(() => {
    const eligibleTour = tours.find((tour) =>
      !completedTours?.includes(tour.id) &&
      tour.triggerConditions.every(evaluateCondition)
    );
    if (eligibleTour) {
      setActiveTour(eligibleTour);
    }
  }, [pathname, completedTours]);

  // ... tour control methods

  return (
    <TourContext.Provider value={contextValue}>
      {children}
      {activeTour && (
        <TourOverlay
          tour={activeTour}
          currentStep={currentStepIndex}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTour}
        />
      )}
    </TourContext.Provider>
  );
}
```

### Database Schema
```typescript
// tour_progress table
{
  id: uuid,
  userId: uuid,
  tourId: text,
  tourVersion: integer,
  status: enum('in_progress', 'completed', 'skipped'),
  currentStepIndex: integer,
  startedAt: timestamp,
  completedAt: timestamp | null,
  metadata: jsonb  // Custom data, time spent per step, etc.
}

// tour_analytics table
{
  id: uuid,
  userId: uuid,
  tourId: text,
  stepId: text,
  event: enum('view', 'complete', 'skip', 'interaction'),
  timestamp: timestamp,
  metadata: jsonb
}
```

### Dependencies
- `@floating-ui/react` - Smart tooltip positioning
- `framer-motion` - Smooth step transitions
- Custom spotlight implementation (CSS-based)
- No heavy tour library dependencies (build lightweight)

### APIs & Integrations
```typescript
// Tour control hook
const { startTour, nextStep, skipTour, currentStep } = useTour();

// Start tour programmatically
<Button onClick={() => startTour('workflow-tour')}>
  Learn Workflows
</Button>

// Trigger from feature launch
useEffect(() => {
  if (isNewFeature && !hasSeenFeatureTour) {
    startTour('new-feature-spotlight');
  }
}, [isNewFeature]);

// Analytics integration
const trackTourEvent = (tourId: string, stepId: string, event: string) => {
  analytics.track('tour_step', { tourId, stepId, event });
};
```

## Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Tour completion rate | 80% | Tour progress tracking |
| Support ticket reduction | 50% for onboarding | Support analytics |
| Feature adoption | 30% increase | Feature usage analytics |
| Time-to-first-value | < 10 min | User journey tracking |
| Tour satisfaction | > 4/5 stars | Post-tour survey |

## Dependencies
- User authentication and session
- Feature flag system for tour targeting
- Analytics infrastructure
- Database for progress persistence

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Tours become outdated after UI changes | High - Broken experience | Selector stability; version tours; automated testing |
| Tours annoy returning users | Medium - Negative UX | Proper completion tracking; easy dismissal; don't repeat |
| Tour blocks critical workflows | High - User frustration | Skip always available; non-blocking design |
| Performance impact from overlays | Medium - Slow UI | Lazy load tour code; efficient DOM operations |
| Mobile viewport issues | Medium - Broken on mobile | Responsive positioning; mobile-specific step content |
| Spotlight misses target element | Medium - Confusing UX | Fallback to no spotlight; element visibility checks |
