# PRD: User Settings & Preferences

## Overview
A comprehensive user settings and preferences system enabling profile management, theme customization, notification preferences, and default configurations. This system allows users to personalize their Bottleneck-Bots experience and configure default behaviors across the platform.

## Problem Statement
Users need centralized control over their account settings, interface preferences, notification behaviors, and default configurations. Without a unified settings system, users cannot customize their experience, leading to friction and reduced productivity. The platform must provide intuitive controls while ensuring preferences sync across devices and sessions.

## Goals & Objectives
- **Primary Goals**
  - Provide comprehensive profile management capabilities
  - Enable full interface and experience customization
  - Deliver granular notification control
  - Support default workflow and action configurations

- **Success Metrics**
  - < 200ms settings load time
  - 100% settings sync across devices
  - 80%+ user engagement with settings
  - < 0.1% settings-related support tickets

## User Stories
- As a user, I want to update my profile information so that my account reflects accurate details
- As a user, I want to choose between dark and light themes so that I can work comfortably
- As a user, I want to control which notifications I receive so that I'm not overwhelmed
- As a user, I want to set default values for workflows so that I don't repeat configurations
- As a team member, I want timezone settings so that scheduled actions run at correct times

## Functional Requirements

### Must Have (P0)
- **Profile Management**
  - Edit display name
  - Upload and crop avatar image
  - Update email (with verification)
  - Change password
  - Timezone selection
  - Language/locale preference
  - View account creation date
  - Account ID display

- **Theme Preferences**
  - Light/dark/system theme toggle
  - Theme persistence across sessions
  - Real-time theme switching
  - High contrast mode option
  - Font size adjustment

- **Notification Preferences**
  - Email notification toggles by category
  - In-app notification toggles
  - Push notification preferences
  - Notification frequency (immediate/digest)
  - Quiet hours configuration
  - Per-workflow notification overrides

- **Default Configurations**
  - Default workflow trigger settings
  - Default action configurations
  - Default retry policies
  - Default timeout values
  - Template preferences
  - Editor preferences

### Should Have (P1)
- **Security Settings**
  - Two-factor authentication setup
  - Active sessions management
  - Login history view
  - API key management link
  - Connected applications
  - Security recommendations

- **Privacy Settings**
  - Activity visibility (team visibility)
  - Profile visibility
  - Analytics opt-out
  - Data export request
  - Account deletion request

- **Team Preferences** (for team members)
  - Team-specific display name
  - Role visibility
  - Team notification settings
  - Availability status

- **Accessibility Settings**
  - Screen reader optimizations
  - Keyboard navigation preferences
  - Reduce motion toggle
  - Color blindness modes
  - Focus indicators

### Nice to Have (P2)
- **Advanced Customization**
  - Custom CSS injection
  - Dashboard widget preferences
  - Sidebar layout customization
  - Keyboard shortcut customization

- **Integration Settings**
  - Per-integration configuration
  - Integration-specific credentials
  - Sync preferences

## Non-Functional Requirements

### Performance
- Settings load < 200ms
- Settings save < 500ms
- Instant theme switching
- Real-time settings sync

### Security
- Password change requires current password
- Email change requires verification
- Sensitive settings audit logged
- Settings encryption for sensitive data

### Scalability
- Efficient settings storage
- Minimal database queries
- CDN for avatar delivery
- Settings caching

### Reliability
- Settings persistence guaranteed
- Offline settings changes queued
- Conflict resolution for concurrent changes
- Settings backup and restore

## Technical Requirements

### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                 User Settings System                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Settings UI                         │   │
│  │  Profile │ Theme │ Notifications │ Defaults │ Privacy│   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │   Settings    │  │   Settings    │  │   Settings    │  │
│  │     API       │  │    Cache      │  │     Sync      │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │  PostgreSQL   │  │     Redis     │  │      S3       │  │
│  │  (Settings)   │  │   (Cache)     │  │   (Avatars)   │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Dependencies
- PostgreSQL for settings storage
- Redis for settings caching
- S3 for avatar storage
- Image processing library (sharp)
- WebSocket for real-time sync

### APIs
```typescript
// Profile
GET    /api/v1/settings/profile
PUT    /api/v1/settings/profile
POST   /api/v1/settings/profile/avatar
DELETE /api/v1/settings/profile/avatar
PUT    /api/v1/settings/profile/email
PUT    /api/v1/settings/profile/password

// Theme & Appearance
GET  /api/v1/settings/appearance
PUT  /api/v1/settings/appearance

// Notifications
GET  /api/v1/settings/notifications
PUT  /api/v1/settings/notifications
PUT  /api/v1/settings/notifications/workflows/:id

// Defaults
GET  /api/v1/settings/defaults
PUT  /api/v1/settings/defaults
GET  /api/v1/settings/defaults/workflows
PUT  /api/v1/settings/defaults/workflows

// Privacy
GET  /api/v1/settings/privacy
PUT  /api/v1/settings/privacy
POST /api/v1/settings/privacy/export
POST /api/v1/settings/privacy/delete-request

// Security
GET  /api/v1/settings/security
GET  /api/v1/settings/security/sessions
DELETE /api/v1/settings/security/sessions/:id
GET  /api/v1/settings/security/login-history

// All Settings (bulk)
GET  /api/v1/settings
PUT  /api/v1/settings
```

### Data Models
```typescript
interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  timezone: string; // IANA timezone
  locale: string; // e.g., 'en-US'
  bio: string | null;
  jobTitle: string | null;
  company: string | null;
  updatedAt: Date;
}

interface AppearanceSettings {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  reduceMotion: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  sidebarCollapsed: boolean;
  updatedAt: Date;
}

interface NotificationSettings {
  userId: string;

  // Email notifications
  emailWorkflowSuccess: boolean;
  emailWorkflowFailure: boolean;
  emailWeeklyDigest: boolean;
  emailSecurityAlerts: boolean;
  emailProductUpdates: boolean;
  emailMarketingEmails: boolean;

  // In-app notifications
  inAppWorkflowSuccess: boolean;
  inAppWorkflowFailure: boolean;
  inAppMentions: boolean;
  inAppSystemAlerts: boolean;

  // Push notifications
  pushEnabled: boolean;
  pushWorkflowFailure: boolean;
  pushMentions: boolean;

  // Timing
  digestFrequency: 'daily' | 'weekly' | 'never';
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm
  quietHoursEnd: string; // HH:mm
  quietHoursTimezone: string;

  // Per-workflow overrides
  workflowOverrides: Record<string, WorkflowNotificationOverride>;

  updatedAt: Date;
}

interface WorkflowNotificationOverride {
  workflowId: string;
  emailOnSuccess: boolean | null; // null = use default
  emailOnFailure: boolean | null;
  inAppOnSuccess: boolean | null;
  inAppOnFailure: boolean | null;
}

interface DefaultSettings {
  userId: string;

  // Workflow defaults
  defaultTriggerType: string;
  defaultRetryAttempts: number;
  defaultRetryDelay: number; // seconds
  defaultTimeout: number; // seconds
  defaultLogLevel: 'debug' | 'info' | 'warn' | 'error';

  // Action defaults
  actionDefaults: Record<string, Record<string, any>>;

  // Editor preferences
  editorTheme: string;
  editorAutoSave: boolean;
  editorAutoSaveInterval: number; // seconds
  editorShowMinimap: boolean;
  editorWordWrap: boolean;
  editorTabSize: number;

  updatedAt: Date;
}

interface PrivacySettings {
  userId: string;
  profileVisibility: 'public' | 'team' | 'private';
  activityVisibility: 'public' | 'team' | 'private';
  showOnlineStatus: boolean;
  analyticsOptOut: boolean;
  marketingOptOut: boolean;
  updatedAt: Date;
}

interface AccessibilitySettings {
  userId: string;
  screenReaderOptimized: boolean;
  keyboardNavigationHints: boolean;
  focusIndicators: 'default' | 'enhanced';
  reduceTransparency: boolean;
  prefersReducedMotion: boolean;
  updatedAt: Date;
}
```

### Settings Categories and Defaults
```typescript
const defaultSettings = {
  appearance: {
    theme: 'system',
    highContrast: false,
    fontSize: 'medium',
    reduceMotion: false,
    colorBlindMode: 'none',
    sidebarCollapsed: false
  },
  notifications: {
    emailWorkflowSuccess: false,
    emailWorkflowFailure: true,
    emailWeeklyDigest: true,
    emailSecurityAlerts: true,
    emailProductUpdates: true,
    emailMarketingEmails: false,
    inAppWorkflowSuccess: true,
    inAppWorkflowFailure: true,
    inAppMentions: true,
    inAppSystemAlerts: true,
    pushEnabled: false,
    pushWorkflowFailure: true,
    pushMentions: true,
    digestFrequency: 'weekly',
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00'
  },
  defaults: {
    defaultRetryAttempts: 3,
    defaultRetryDelay: 60,
    defaultTimeout: 300,
    defaultLogLevel: 'info',
    editorTheme: 'vs-dark',
    editorAutoSave: true,
    editorAutoSaveInterval: 30,
    editorShowMinimap: true,
    editorWordWrap: true,
    editorTabSize: 2
  },
  privacy: {
    profileVisibility: 'team',
    activityVisibility: 'team',
    showOnlineStatus: true,
    analyticsOptOut: false,
    marketingOptOut: false
  }
};
```

## Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Settings Load Time | < 200ms | Time to fetch user settings |
| Settings Save Time | < 500ms | Time to persist settings change |
| Settings Sync Success | 100% | Cross-device sync reliability |
| Settings Engagement | 80%+ | Users who customize settings |
| Support Tickets | < 0.1% | Settings-related ticket rate |
| Theme Adoption | 40%+ | Users using non-default theme |

## Dependencies
- Image processing service
- S3 or CDN for avatar storage
- Real-time sync infrastructure
- Email service for verification
- User authentication system

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Settings not syncing | Medium - Inconsistent experience | Real-time sync, conflict resolution |
| Avatar upload abuse | Low - Storage costs | Size limits, rate limiting, moderation |
| Email change hijacking | High - Account takeover | Current password + email verification |
| Settings data corruption | Medium - User frustration | Validation, backups, reset to defaults |
| Privacy settings bypass | High - Data exposure | Server-side enforcement, audit logging |
| Performance regression | Medium - Slow UX | Caching, lazy loading, optimistic updates |
