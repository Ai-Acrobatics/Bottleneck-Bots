# Browserbase Integration Guide

## Overview

This application integrates Browserbase for AI-powered browser automation with session management, geo-location support, and session replay capabilities.

## Features Implemented

### 1. **Session Management** (`server/_core/browserbase.ts`)
- Create browser sessions with optional geo-location
- Track active sessions
- Retrieve session recordings
- Close sessions properly

### 2. **Enhanced AI Router** (`server/api/routers/ai.ts`)
- Execute browser actions with AI agent (Stagehand)
- Support for geo-location proxies
- Session tracking and replay retrieval
- Session logs for debugging

### 3. **Session Replay Player** (`client/src/components/SessionReplayPlayer.tsx`)
- React component for displaying session replays
- Uses rrweb-player for DOM reconstruction
- Playback controls and timeline navigation
- Alternative iframe integration

## Installation Steps

### 1. Install Required Packages

```bash
# Install browserbase SDK (Python SDK shown in docs, Node.js equivalent needed)
pnpm add browserbase

# Install rrweb player for frontend
pnpm add rrweb-player rrweb
```

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
BROWSERBASE_API_KEY=your_api_key_here
BROWSERBASE_PROJECT_ID=your_project_id_here
```

### 3. Update Browserbase Service

Once the `browserbase` package is installed, uncomment the PLACEHOLDER sections in:
- `server/_core/browserbase.ts`

Replace mock implementations with actual Browserbase SDK calls.

## API Endpoints

### 1. Execute AI Browser Action (`chat`)

```typescript
// Client-side usage
const result = await trpc.ai.chat.mutate({
  messages: [
    { role: 'user', content: 'Search for React tutorials on Google' }
  ],
  geolocation: {
    city: 'NEW_YORK',
    state: 'NY',
    country: 'US'
  },
  startUrl: 'https://google.com',
  modelName: 'google/gemini-2.0-flash' // Optional, defaults to gemini-2.0-flash
});

// Returns:
// {
//   success: boolean,
//   message: string,
//   sessionId: string,
//   sessionUrl: string,
//   prompt: string
// }
```

### 2. Observe Page Actions (`observePage`)

Get an array of actionable steps without executing them:

```typescript
const result = await trpc.ai.observePage.mutate({
  url: 'https://sflib1.sfpl.org/selfreg',
  instruction: 'fill out all fields on the page with dummy data',
  geolocation: {
    city: 'NEW_YORK',
    state: 'NY',
    country: 'US'
  }
});

// Returns:
// {
//   success: true,
//   actions: string[], // Array of action descriptions
//   sessionId: string,
//   sessionUrl: string,
//   instruction: string
// }
```

### 3. Execute Multiple Actions (`executeActions`)

Observe and execute actions in sequence (form filling, multi-step workflows):

```typescript
const result = await trpc.ai.executeActions.mutate({
  url: 'https://example.com/form',
  instruction: 'fill out the registration form with test data'
});

// Returns:
// {
//   success: true,
//   executedActions: string[], // Array of executed actions
//   actionCount: number,
//   sessionId: string,
//   sessionUrl: string
// }
```

### 4. Extract Structured Data (`extractData`)

Extract type-safe data using Zod schemas:

```typescript
// Extract contact information
const result = await trpc.ai.extractData.mutate({
  url: 'https://example.com/contact',
  instruction: 'get the contact information of the company',
  schemaType: 'contactInfo'
});

// Returns:
// {
//   success: true,
//   data: {
//     contactInfo: {
//       email: 'contact@example.com',
//       phone: '+1-234-567-8900',
//       address: '123 Main St'
//     }
//   },
//   sessionId: string,
//   sessionUrl: string
// }

// Extract product information
const productData = await trpc.ai.extractData.mutate({
  url: 'https://shop.example.com/product/123',
  instruction: 'get the product details',
  schemaType: 'productInfo'
});

// Returns product name, price, description, availability
```

### Get Session Replay

```typescript
const replay = await trpc.ai.getSessionReplay.query({
  sessionId: 'session_123456'
});

// Returns:
// {
//   sessionId: string,
//   events: rrwebEvent[],
//   recordingUrl: string,
//   status: string
// }
```

### List Active Sessions

```typescript
const sessions = await trpc.ai.listSessions.query();

// Returns:
// {
//   sessions: Array<{
//     id: string,
//     url: string,
//     status: string,
//     createdAt: Date
//   }>
// }
```

### Get Session Logs

```typescript
const logs = await trpc.ai.getSessionLogs.query({
  sessionId: 'session_123456'
});
```

## Frontend Integration

### Using the Session Replay Player

```tsx
import { SessionReplayPlayer } from '@/components/SessionReplayPlayer';

function MyComponent() {
  const { data } = trpc.ai.getSessionReplay.useQuery({
    sessionId: 'session_123456'
  });

  return (
    <SessionReplayPlayer
      sessionId={data.sessionId}
      events={data.events}
      width={1024}
      height={576}
      autoPlay={false}
      skipInactive={true}
      showController={true}
    />
  );
}
```

### Using iframe Integration

```tsx
import { SessionReplayIframe } from '@/components/SessionReplayPlayer';

function MyComponent() {
  return <SessionReplayIframe sessionId="session_123456" />;
}
```

## Geo-Location Support

### Available Locations

The Browserbase proxy supports geo-location for various cities. Example usage:

```typescript
const session = await browserbaseService.createSessionWithGeoLocation({
  city: 'NEW_YORK',
  state: 'NY',
  country: 'US'
});
```

### Common Locations

- **New York**: `{ city: 'NEW_YORK', state: 'NY', country: 'US' }`
- **Los Angeles**: `{ city: 'LOS_ANGELES', state: 'CA', country: 'US' }`
- **London**: `{ city: 'LONDON', country: 'GB' }`
- **Tokyo**: `{ city: 'TOKYO', country: 'JP' }`

Refer to Browserbase documentation for full list of supported locations.

## Session Live View

### Overview

Browserbase Session Live View enables real-time monitoring of browser sessions as they execute. This allows you to watch automation in progress and monitor user interactions without waiting for session completion and replay processing.

### Getting Live View URLs via API

```typescript
// Get live view URL after creating a session
const session = await browserbaseService.createSession();

// Live view URL is available immediately
const liveViewUrl = session.liveViewUrl;
// Format: https://live.browserbase.com/sessions/{sessionId}

// Share the live view URL
console.log(`Watch session at: ${liveViewUrl}`);
```

### Using the SessionLiveView Component

```tsx
import { SessionLiveView } from '@/components/SessionLiveView';

function SessionMonitor() {
  const { data: session } = trpc.ai.getSession.useQuery({
    sessionId: 'session_123456'
  });

  return (
    <SessionLiveView
      sessionId={session.id}
      liveViewUrl={session.liveViewUrl}
      width={1024}
      height={576}
      readOnly={false}
      mode="read-write" // or "read-only"
    />
  );
}
```

### Multi-Tab Support

Session Live View supports multi-tab workflows:

```typescript
const session = await browserbaseService.createSessionWithGeoLocation({
  city: 'NEW_YORK',
  state: 'NY',
  country: 'US',
  multitabEnabled: true // Enable multi-tab support
});

// Switch between tabs in the live view UI
// Tabs are displayed in the top navigation of the live view
```

### Read-Only vs Read/Write Modes

**Read-Only Mode** (default):
- Monitor sessions without interaction
- Useful for supervision and debugging
- No network overhead from user input

```typescript
<SessionLiveView
  sessionId={sessionId}
  liveViewUrl={liveViewUrl}
  mode="read-only"
/>
```

**Read/Write Mode**:
- Control mouse and keyboard input during session
- Override or guide automation in progress
- Requires interactive permissions

```typescript
<SessionLiveView
  sessionId={sessionId}
  liveViewUrl={liveViewUrl}
  mode="read-write"
  interactive={true}
/>
```

### API for Live View Control

```typescript
// Check session status
const status = await trpc.ai.getSessionStatus.query({
  sessionId: 'session_123456'
});

// Returns:
// {
//   sessionId: string,
//   status: 'active' | 'closing' | 'closed',
//   liveViewUrl: string,
//   tabCount: number,
//   currentTabId: string
// }
```

## Session Replay Details

### How It Works

1. Session recordings use **rrweb** (record and replay web) technology
2. DOM changes are captured as events, not video
3. Replays typically become available **~30 seconds after session closure**
4. Network requests, responses, and timing information are included
5. Multi-tab sessions require aggregate replay processing

### Embedding the SessionReplayPlayer Component

Wait at least 30 seconds after session closure before requesting the replay:

```typescript
async function displaySessionReplay(sessionId: string) {
  // Wait for recording to be processed
  await new Promise(resolve => setTimeout(resolve, 30000));

  // Fetch replay data
  const replay = await trpc.ai.getSessionReplay.query({
    sessionId: sessionId
  });

  if (!replay.events || replay.events.length === 0) {
    console.warn('Recording not yet available, retry in 10 seconds');
    return;
  }

  return replay;
}
```

### Using SessionReplayPlayer in Your UI

```tsx
import { SessionReplayPlayer } from '@/components/SessionReplayPlayer';
import { useEffect, useState } from 'react';

export function ReplayViewer({ sessionId }: { sessionId: string }) {
  const [isReady, setIsReady] = useState(false);

  const { data: replay, isLoading } = trpc.ai.getSessionReplay.useQuery(
    { sessionId },
    {
      // Retry after 30 seconds to allow processing
      retry: true,
      retryDelay: (attemptIndex) => (attemptIndex === 0 ? 30000 : 10000)
    }
  );

  return (
    <div className="session-replay">
      {isLoading && <p>Processing recording...</p>}

      {replay?.events && replay.events.length > 0 && (
        <SessionReplayPlayer
          sessionId={replay.sessionId}
          events={replay.events}
          width={1024}
          height={576}
          autoPlay={false}
          skipInactive={true}
          showController={true}
        />
      )}

      {!isLoading && (!replay?.events || replay.events.length === 0) && (
        <p>Recording not available for this session</p>
      )}
    </div>
  );
}
```

### Player Controls

The rrweb player supports:
- **Play/Pause**: Control playback
- **Timeline scrubbing**: Jump to any point in the session
- **Skip inactive periods**: Automatically skip long idle times
- **Playback speed**: Adjust replay speed

### Event Listeners

```typescript
player.addEventListener('play', () => console.log('Started'));
player.addEventListener('pause', () => console.log('Paused'));
player.addEventListener('finish', () => console.log('Finished'));

// Navigate timeline
player.goto(5000); // Jump to 5 seconds
const currentTime = player.getCurrentTime();

// Clean up
player.destroy();
```

## Logging Configuration

### Stagehand Logging Levels

Stagehand AI agent provides three logging verbosity levels to control output detail:

#### Verbose Level 0 (Minimal)
```typescript
const result = await trpc.ai.chat.mutate({
  messages: [...],
  verbose: 0 // Only critical errors and final results
});

// Output: Minimal logging, fastest performance
// Use for: Production, performance-critical operations
```

#### Verbose Level 1 (Standard)
```typescript
const result = await trpc.ai.chat.mutate({
  messages: [...],
  verbose: 1 // Standard debugging information
});

// Output: Action summaries, major decisions, errors
// Use for: Development, standard troubleshooting
```

#### Verbose Level 2 (Detailed)
```typescript
const result = await trpc.ai.chat.mutate({
  messages: [...],
  verbose: 2 // Comprehensive logging with all details
});

// Output: All interactions, DOM analysis, decision logic
// Use for: Deep debugging, performance analysis, edge cases
```

### Production Configuration

For production environments, disable Pino logging to reduce overhead:

```typescript
// Server-side configuration
const stagehandConfig = {
  disablePino: true,  // Disable Pino logger
  verbose: 0,         // Minimal logging
  headless: true,     // Run in headless mode
  recordSession: true // Enable session recording for replay
};

const result = await stagehand.act({
  action: 'Chat',
  input: { messages: [...] },
  ...stagehandConfig
});
```

### Integrating Logs with the Dashboard

Session logs are automatically captured and can be retrieved via the API:

```typescript
// Retrieve session logs
const logs = await trpc.ai.getSessionLogs.query({
  sessionId: 'session_123456'
});

// Logs include:
// - timestamps
// - action descriptions
// - AI reasoning
// - error messages
// - network events
```

### Displaying Logs in the Dashboard

```tsx
import { SessionLogsViewer } from '@/components/SessionLogsViewer';

function DashboardPage({ sessionId }: { sessionId: string }) {
  const { data: logs } = trpc.ai.getSessionLogs.useQuery({
    sessionId
  });

  return (
    <div className="dashboard">
      <SessionLogsViewer
        logs={logs}
        verboseLevel={1}
        searchable={true}
        downloadable={true}
        maxLines={1000}
      />
    </div>
  );
}
```

### Log Filtering and Analysis

```typescript
// Filter logs by level
const errorLogs = logs.filter(log => log.level === 'error');
const actionLogs = logs.filter(log => log.type === 'action');

// Group logs by timestamp
const logsByTime = logs.reduce((acc, log) => {
  const time = new Date(log.timestamp).toISOString();
  if (!acc[time]) acc[time] = [];
  acc[time].push(log);
  return acc;
}, {} as Record<string, typeof logs>);

// Export logs for analysis
export function downloadSessionLogs(logs: any[], sessionId: string) {
  const csv = logs.map(log => ({
    timestamp: log.timestamp,
    level: log.level,
    message: log.message,
    type: log.type
  }));

  const csvString = [
    Object.keys(csv[0]).join(','),
    ...csv.map(row => Object.values(row).join(','))
  ].join('\n');

  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `session-${sessionId}-logs.csv`;
  a.click();
}
```

### Best Practices for Logging

1. **Use verbose: 0 in production** to minimize overhead and storage
2. **Store session logs with recordings** for complete audit trails
3. **Implement log retention policies** to manage storage costs
4. **Monitor log volumes** for unexpected increases
5. **Use structured logging format** for easier analysis and alerting
6. **Disable Pino (disablePino: true)** in production for better performance
7. **Sample logs in high-volume scenarios** to reduce resource consumption

## Limitations & Best Practices

### Single-Tab Only
- Session replays are designed for **single-tab workflows**
- Multi-tab recordings may produce unreliable results
- For multi-tab needs, use Browserbase Live View instead

### Site Restrictions
Some sites disable recordings:
- Opentable
- Salesforce platforms
- Sites with strict CSP policies

### Geo-Location Considerations
- Geo checks show current IP, not session IP
- May affect location-based features during replay

### Best Practices

1. **Always close sessions** when done to ensure recordings are finalized
2. **Wait 30+ seconds** after session closure before requesting replay
3. **Handle errors gracefully** - not all sessions may have recordings
4. **Monitor session limits** - check Browserbase plan quotas
5. **Use single-tab workflows** for reliable replays

## Troubleshooting

### Replay Not Available
- Wait 30+ seconds after session closes
- Check if site allows recordings
- Verify session completed successfully

### Empty Events Array
- Session may still be processing
- Check session status via Browserbase dashboard
- Verify API credentials are correct

### Player Not Rendering
- Ensure rrweb-player is installed
- Check console for initialization errors
- Verify events array is not empty

## Example: Complete Workflow

```typescript
// 1. Execute browser action with geo-location
const result = await trpc.ai.chat.mutate({
  messages: [
    { role: 'user', content: 'Find cheapest flight to Tokyo' }
  ],
  geolocation: {
    city: 'NEW_YORK',
    state: 'NY',
    country: 'US'
  },
  startUrl: 'https://google.com/flights'
});

// 2. Wait for recording to be ready
await new Promise(resolve => setTimeout(resolve, 35000));

// 3. Retrieve session replay
const replay = await trpc.ai.getSessionReplay.query({
  sessionId: result.sessionId
});

// 4. Display in UI
<SessionReplayPlayer
  sessionId={replay.sessionId}
  events={replay.events}
/>
```

## Resources

- [Browserbase Documentation](https://docs.browserbase.com)
- [Session Replay Guide](https://docs.browserbase.com/features/session-replay)
- [rrweb Documentation](https://www.rrweb.io/)
- [Stagehand Documentation](https://github.com/browserbasehq/stagehand)

## Next Steps

After installing packages:

1. Remove PLACEHOLDER comments from `server/_core/browserbase.ts`
2. Implement actual Browserbase SDK calls
3. Test session creation and replay retrieval
4. Integrate SessionReplayPlayer in your UI
5. Add error handling and retry logic
6. Monitor session usage and costs
