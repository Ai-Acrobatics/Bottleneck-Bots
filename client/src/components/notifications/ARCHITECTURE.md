# Notification System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Application                              │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              NotificationProvider (Context)                 │ │
│  │                                                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │ │
│  │  │ Notification │  │   Settings   │  │   localStorage  │ │ │
│  │  │    State     │←→│   Management │←→│   Persistence   │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘ │ │
│  │         ↕                  ↕                                │ │
│  │  ┌──────────────┐  ┌──────────────┐                       │ │
│  │  │ SSE/Agent    │  │    Sonner    │                       │ │
│  │  │ Integration  │  │   Toasts     │                       │ │
│  │  └──────────────┘  └──────────────┘                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↕                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Consumer Components                        │ │
│  │                                                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │ │
│  │  │Notification  │  │ useNotifica- │  │  Any Component   │ │ │
│  │  │   Center     │  │   tions Hook │  │  using the hook  │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↕                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Notification Sounds Utility                    │ │
│  │           (Web Audio API - Singleton)                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Component Relationships

### 1. NotificationProvider

**Purpose**: Central state management for notifications

**Responsibilities**:
- Maintains notification state (array of notifications)
- Manages settings (sound, grouping, max count)
- Handles localStorage persistence
- Integrates with agent store logs
- Triggers toast notifications
- Orchestrates sound playback

**Data Flow**:
```
Agent Store Logs → NotificationProvider → State Update → Toast + Sound
                                        ↓
                                   localStorage
```

### 2. NotificationCenter

**Purpose**: UI for viewing and managing notifications

**Responsibilities**:
- Display bell icon with badge count
- Render notification list in dialog
- Provide notification management actions
- Show settings panel
- Handle user interactions

**User Interactions**:
```
Click Bell → Open Dialog → View Notifications
                        ↓
          Click Notification → Mark as Read
          Click X → Remove Notification
          Click Settings → Toggle Preferences
          Click Mark All → Mark All Read
          Click Clear All → Remove All
```

### 3. useNotifications Hook

**Purpose**: Type-safe access to notification context

**Provides**:
```typescript
{
  notifications,      // Read notification list
  unreadCount,        // Get unread count
  settings,           // Get current settings
  addNotification,    // Create notification
  markAsRead,         // Mark single as read
  markAllAsRead,      // Mark all as read
  removeNotification, // Delete notification
  clearAll,           // Clear all
  updateSettings      // Update preferences
}
```

### 4. Notification Sounds

**Purpose**: Generate audio feedback for notifications

**Sound Types**:
```
success      → Two-tone ascending (C5 → E5)
error        → Two-tone descending (G4 → D4)
warning      → Single triangle wave (A4)
info         → Short sine wave (C5)
agent-update → Triple beep (D5, D5, D5)
```

## Data Flow Diagrams

### Adding a Notification

```
Component
   ↓
useNotifications.addNotification()
   ↓
NotificationProvider.addNotification()
   ↓
┌─ Check for grouping
│  ├─ Similar notification exists? → Increment group count
│  └─ No match → Create new notification
   ↓
Update state (add to notifications array)
   ↓
┌─ Persist to localStorage (unread only)
├─ Show toast (Sonner)
└─ Play sound (if enabled)
   ↓
State change triggers re-render
   ↓
NotificationCenter updates badge count
```

### SSE Integration Flow

```
Agent executes action
   ↓
Agent Store receives log entry
   ↓
useAgentStore.addLog()
   ↓
NotificationProvider useEffect watches logs
   ↓
New log detected
   ↓
┌─ Map log level → notification type
├─ Filter (only important logs)
└─ Extract message and detail
   ↓
addNotification() internally
   ↓
Notification appears in UI
```

### Reading Notifications

```
User clicks NotificationCenter bell
   ↓
Dialog opens with notification list
   ↓
User clicks a notification
   ↓
markAsRead(id)
   ↓
Update notification.read = true
   ↓
State update
   ↓
┌─ Badge count decrements
├─ Notification appears dimmed
└─ Unread list updated in localStorage
```

## State Management

### Notification State Structure

```typescript
{
  notifications: [
    {
      id: "abc123",                    // nanoid
      type: "success",                  // Notification type
      title: "Task completed",          // Main message
      message: "Details...",            // Optional detail
      timestamp: 1234567890,            // Unix timestamp
      read: false,                      // Read status
      grouped: true,                    // Is grouped?
      groupCount: 3,                    // Count in group
      metadata: {                       // Custom data
        taskId: "task-456",
        sessionId: "session-789"
      }
    },
    // ... more notifications
  ],
  settings: {
    soundEnabled: true,                 // Sound on/off
    groupSimilar: true,                 // Grouping on/off
    maxNotifications: 100,              // Storage limit
    autoMarkReadDelay: 5000             // Future feature
  }
}
```

### localStorage Schema

**Key**: `ghl-notifications`
**Value**: Array of unread Notification objects (JSON)

**Key**: `ghl-notification-settings`
**Value**: NotificationSettings object (JSON)

## Event Timeline

```
Time 0:00 → User loads page
         ├─ NotificationProvider mounts
         ├─ Loads notifications from localStorage
         ├─ Loads settings from localStorage
         └─ Subscribes to agent store logs

Time 0:05 → Agent starts task
         ├─ Agent store adds log
         ├─ NotificationProvider detects new log
         ├─ Creates "agent-update" notification
         ├─ Shows toast
         └─ Plays sound

Time 0:10 → User clicks notification bell
         └─ Dialog opens with 1 unread notification

Time 0:12 → User clicks notification
         ├─ Marks as read
         ├─ Badge count → 0
         └─ Updates localStorage

Time 0:15 → Agent completes task
         ├─ Agent store adds "success" log
         ├─ NotificationProvider creates notification
         ├─ Shows success toast
         └─ Plays success sound

Time 0:20 → User refreshes page
         ├─ NotificationProvider loads from localStorage
         └─ Shows 1 unread notification (task completed)
```

## Performance Optimizations

1. **State Updates**: Only update affected notifications
2. **localStorage**: Only store unread notifications
3. **Grouping**: Reduces duplicate notifications
4. **Max Limit**: Prevents unbounded growth
5. **Lazy Audio**: AudioContext created only when needed
6. **Memoization**: React.memo on NotificationItem (future)
7. **Virtualization**: Not needed (max 100 items)

## Accessibility Architecture

```
NotificationCenter (button)
  ├─ aria-label: "Notifications (X unread)"
  ├─ Keyboard: Enter/Space to open
  └─ Focus indicator

Dialog
  ├─ role="dialog"
  ├─ aria-labelledby="dialog-title"
  ├─ Escape to close
  └─ Focus trap active

Notification List
  ├─ role="region"
  ├─ aria-label="Notification list"
  ├─ aria-live="polite"
  └─ aria-relevant="additions removals"

Notification Item
  ├─ role="button"
  ├─ tabindex="0"
  ├─ Keyboard: Enter/Space to mark read
  └─ Screen reader: Announces content

Badge
  └─ aria-label: "X unread notifications"
```

## Extension Points

### Adding New Notification Types

1. Add type to `NotificationType` in `types/notifications.ts`
2. Add icon mapping in `NotificationCenter.tsx`
3. Add color mapping in `NotificationCenter.tsx`
4. Add sound method in `notificationSounds.ts`
5. Add case in sound play switch

### Custom Notification Templates

```typescript
interface CustomNotification extends Notification {
  template: 'task' | 'message' | 'alert';
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}
```

### Rich Notifications

```typescript
interface RichNotification extends Notification {
  image?: string;
  video?: string;
  component?: React.ComponentType;
}
```

## Testing Strategy

```
Unit Tests
  ├─ NotificationProvider
  │  ├─ State management (add, read, remove, clear)
  │  ├─ Settings management
  │  ├─ localStorage persistence
  │  └─ Grouping logic
  ├─ NotificationCenter
  │  ├─ Rendering
  │  ├─ User interactions
  │  └─ Accessibility
  ├─ useNotifications
  │  ├─ Hook behavior
  │  └─ Context access
  └─ notificationSounds
     ├─ Sound generation
     └─ Enable/disable

Integration Tests (Future)
  ├─ SSE → Notification flow
  ├─ Toast → Sound coordination
  └─ Persistence → Restore flow

E2E Tests (Future)
  ├─ Complete user journey
  └─ Cross-browser testing
```

## Security Considerations

1. **XSS Protection**: All user content escaped by React
2. **localStorage Size**: Limited to 100 notifications
3. **JSON Parsing**: Try-catch for localStorage parsing
4. **No Sensitive Data**: Don't store secrets in notifications
5. **CSRF**: N/A (no server mutations)

## Browser Compatibility Matrix

| Feature              | Chrome | Firefox | Safari | Edge  |
|---------------------|--------|---------|--------|-------|
| Core Notifications  | ✅     | ✅      | ✅     | ✅    |
| localStorage        | ✅     | ✅      | ✅     | ✅    |
| Web Audio API       | ✅     | ✅      | ⚠️*    | ✅    |
| Dialog              | ✅     | ✅      | ✅     | ✅    |
| ARIA                | ✅     | ✅      | ✅     | ✅    |

\* Safari requires user interaction before AudioContext works

## Future Architecture Enhancements

1. **Push Notifications**: Add service worker layer
2. **Notification Queue**: Priority-based queueing
3. **Analytics**: Track notification engagement
4. **A/B Testing**: Different notification strategies
5. **i18n**: Multi-language support
6. **Themes**: Custom notification styling
7. **Plugins**: Extensible notification types
