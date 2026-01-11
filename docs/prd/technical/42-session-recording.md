# PRD: Session Recording & Replay

## Overview
Implement browser session recording and replay functionality using RRWeb to capture user interactions, enabling support teams to understand user issues, product teams to analyze behavior patterns, and developers to reproduce bugs. The system records DOM mutations, user events, and network activity for faithful session reconstruction.

## Problem Statement
Understanding user behavior and debugging issues from support tickets is challenging without seeing exactly what the user experienced. Text descriptions of problems are often incomplete or inaccurate. Bottleneck-Bots needs session recording to:
- Reduce time-to-resolution for support tickets
- Provide UX insights through behavioral analysis
- Enable accurate bug reproduction
- Support compliance and audit requirements

## Goals & Objectives
- **Primary Goals**
  - Record complete browser sessions with minimal performance impact (< 3% CPU overhead)
  - Provide pixel-perfect session replay with full interactivity reconstruction
  - Implement privacy controls to mask sensitive data during recording
  - Enable efficient storage and retrieval of session recordings
  - Integrate with support ticketing and bug tracking workflows

- **Success Metrics**
  - 90% of support tickets include session replay links
  - 50% reduction in bug reproduction time
  - < 100KB average compressed recording size per minute
  - 99.9% recording accuracy (visual fidelity)

## User Stories
- As a support agent, I want to watch a user's session so that I can understand exactly what problem they encountered
- As a product manager, I want to analyze user behavior patterns so that I can identify UX improvements
- As a developer, I want to replay a bug report session so that I can reproduce issues in my local environment
- As a user, I want my sensitive data masked so that my privacy is protected during recordings
- As a compliance officer, I want session recordings for auditing so that I can verify system usage
- As an admin, I want to configure recording rules so that I can control what gets captured

## Functional Requirements

### Must Have (P0)
- **Session Recording**: Capture DOM mutations, mouse movements, clicks, scrolls, and form inputs
- **Replay Player**: Full-featured player with play, pause, seek, and playback speed controls
- **Privacy Masking**: Automatic masking of password fields, credit card inputs, and configurable sensitive selectors
- **Session Metadata**: Capture browser info, viewport size, URL history, timestamps
- **Recording Controls**: Start/stop recording, exclude specific pages/components
- **Session List**: Searchable, filterable list of recorded sessions
- **Session Linking**: Associate recordings with user accounts and support tickets

### Should Have (P1)
- **Network Capture**: Record XHR/Fetch requests and responses (masked as needed)
- **Console Logging**: Capture console.log, error, and warn messages
- **Custom Events**: API to inject custom events into recording timeline
- **Session Tagging**: Add tags and notes to sessions for categorization
- **Export/Download**: Export recordings for offline viewing or sharing
- **Heatmaps**: Generate click and scroll heatmaps from aggregate session data

### Nice to Have (P2)
- **Rage Click Detection**: Automatically flag sessions with frustrated user behavior
- **AI Summarization**: Generate text summaries of session activity
- **A/B Test Integration**: Tag sessions with experiment variants
- **Mobile Recording**: Support for React Native mobile recordings
- **Co-Browsing**: Live session viewing for real-time support

## Non-Functional Requirements

### Performance
- Recording overhead: < 3% CPU, < 10MB memory increase
- Replay playback: 60fps smooth rendering
- Recording file size: < 100KB/minute compressed
- Session list load time: < 500ms for 1000 sessions

### Security
- End-to-end encryption for recording data in transit and at rest
- Automatic PII detection and masking
- Role-based access to session recordings
- Session data retention policies with automatic deletion
- Audit log for recording access

### Scalability
- Support 10,000+ concurrent recording users
- Store 1M+ sessions with efficient querying
- Handle sessions up to 2 hours in length
- CDN distribution for replay assets

### Privacy & Compliance
- GDPR compliance with data subject access rights
- CCPA compliance for California users
- Configurable consent mechanisms
- Data residency options (US, EU storage)

## Technical Requirements

### Architecture
```
/src/features/session-recording/
  ├── recorder/
  │   ├── rrweb-config.ts        # RRWeb configuration
  │   ├── privacy-rules.ts        # Data masking rules
  │   ├── session-manager.ts      # Start/stop/segment logic
  │   └── event-processor.ts      # Event filtering & batching
  ├── player/
  │   ├── replay-player.tsx       # Main player component
  │   ├── player-controls.tsx     # Playback controls
  │   ├── timeline.tsx            # Event timeline scrubber
  │   └── event-inspector.tsx     # Event detail viewer
  ├── storage/
  │   ├── compression.ts          # Recording compression
  │   ├── upload-manager.ts       # Chunked upload handling
  │   └── cdn-provider.ts         # CDN integration
  ├── api/
  │   ├── sessions.router.ts      # Session CRUD endpoints
  │   └── sessions.schema.ts      # Zod validation schemas
  └── components/
      ├── session-list.tsx        # Session browser
      ├── session-card.tsx        # Session preview card
      └── recording-badge.tsx     # Recording indicator
```

### Database Schema
```typescript
// sessions table
{
  id: uuid,
  userId: uuid,
  organizationId: uuid,
  startedAt: timestamp,
  endedAt: timestamp,
  duration: integer, // seconds
  browserInfo: jsonb,
  viewportSize: jsonb,
  pageViews: integer,
  eventCount: integer,
  storageUrl: text,
  storageSizeBytes: integer,
  tags: text[],
  metadata: jsonb,
  status: enum('recording', 'processing', 'ready', 'failed'),
  createdAt: timestamp,
  updatedAt: timestamp
}

// session_events table (for searchable events)
{
  id: uuid,
  sessionId: uuid,
  eventType: text,
  timestamp: timestamp,
  data: jsonb,
  searchableText: text
}
```

### Dependencies
- `rrweb` (v2.x) - Core recording and replay library
- `rrweb-player` - Replay player component
- `pako` - Compression for recording data
- `@uppy/core` - Chunked file upload
- AWS S3 / Cloudflare R2 - Recording storage
- Cloudflare CDN - Replay asset delivery

### APIs & Integrations
```typescript
// Recording API
interface SessionRecordingAPI {
  startRecording(options: RecordingOptions): void;
  stopRecording(): Promise<SessionId>;
  pauseRecording(): void;
  resumeRecording(): void;
  addCustomEvent(event: CustomEvent): void;
  setPrivacyLevel(level: 'strict' | 'balanced' | 'minimal'): void;
}

// Replay API
interface SessionReplayAPI {
  loadSession(sessionId: string): Promise<SessionData>;
  play(): void;
  pause(): void;
  seek(timestamp: number): void;
  setSpeed(multiplier: number): void;
  getEventAtTime(timestamp: number): RecordedEvent;
}
```

### Integration Points
- Support ticket system: Embed replay links
- Error tracking (Sentry): Attach session IDs to error reports
- Analytics: Export session data for behavior analysis
- User management: Filter sessions by user/organization

## Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Recording overhead | < 3% CPU | Performance profiling |
| Storage efficiency | < 100KB/min | Average file size monitoring |
| Replay accuracy | 99.9% visual fidelity | Automated visual testing |
| Support ticket resolution | 50% faster | Resolution time tracking |
| Session attachment rate | 90% of tickets | Ticket analysis |

## Dependencies
- Cloud storage infrastructure (S3/R2)
- CDN configuration
- Database schema migrations
- User authentication system
- Organization/tenant system

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance degradation on low-end devices | High - User experience | Adaptive recording quality; CPU monitoring with auto-pause |
| PII leakage in recordings | Critical - Privacy/legal | Multi-layer masking; automated PII detection; regular audits |
| Storage costs escalate | Medium - Budget | Compression optimization; tiered retention policies; usage quotas |
| RRWeb library breaking changes | Medium - Feature stability | Pin versions; maintain fork if needed; automated regression tests |
| Large sessions fail to upload | Medium - Data loss | Chunked uploads; retry logic; local caching |
| Replay performance on complex sessions | Medium - Usability | Virtual scrolling in player; lazy event loading; caching |
