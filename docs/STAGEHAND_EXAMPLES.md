# Stagehand with Browserbase - Usage Examples

## Overview

This document contains practical examples of using Stagehand with Browserbase for AI-powered browser automation. These examples are based on real Browserbase sessions and demonstrate the key capabilities integrated into this application.

## Session Details

- **Session ID**: `70a57111-1ece-4bb6-adb8-7e1224dacc0d`
- **Live View**: `bb_live_hUMSzjMBUikuusBWG3wBy0MGzWQ`
- **Model**: `google/gemini-2.0-flash` or `google/gemini-2.0-flash-exp`

## Core Stagehand Methods

### 1. **`page.observe()`** - Get Actionable Steps

Returns an array of actions that can be executed on a page without executing them.

```typescript
const stagehand = new Stagehand({
  modelName: "google/gemini-2.0-flash"
});
await stagehand.init();
const page = stagehand.page;

await page.goto("https://sflib1.sfpl.org/selfreg");

// Get actions without executing
const actions = await page.observe("fill out all fields on the page with dummy data");

console.log(actions);
// Returns: Array of action descriptions like:
// [
//   "Fill in 'First Name' field with 'John'",
//   "Fill in 'Last Name' field with 'Doe'",
//   "Select 'United States' from Country dropdown",
//   ...
// ]
```

### 2. **`page.act()`** - Execute Actions

Execute individual actions or iterate through observed actions:

```typescript
// Execute each observed action
for (const action of actions) {
  await page.act(action);
}

// Or execute a single action directly
await page.act("Click the submit button");
```

### 3. **`page.extract()`** - Extract Structured Data

Extract type-safe data using Zod schemas:

```typescript
import { z } from "zod";

// Extract contact information
const { contactInfo: { email, phone } } = await page.extract({
  instruction: "get the contact information of the library",
  schema: z.object({
    contactInfo: z.object({
      email: z.string(),
      phone: z.string()
    })
  })
});

console.log(`Email: ${email}`);
console.log(`Phone: ${phone}`);
```

## Complete Example: Form Filling with Data Extraction

```typescript
const stagehand = new Stagehand({
  modelName: "google/gemini-2.0-flash"
});

await stagehand.init();
const page = stagehand.page;

// 1. Open the registration page
await page.goto("https://sflib1.sfpl.org/selfreg");

// 2. Get actions needed to fill the form
const actions = await page.observe("fill out all fields on the page with dummy data");

// 3. Execute each action
for (const action of actions) {
  await page.act(action);
}

// 4. Extract contact information
const { contactInfo } = await page.extract({
  instruction: "get the contact information of the library",
  schema: z.object({
    contactInfo: z.object({
      email: z.string(),
      phone: z.string()
    })
  })
});

console.log(`Extracted contact information!
Email: ${contactInfo.email}
Phone: ${contactInfo.phone}`);
```

## Multi-Tab Workflows

**Note**: Multi-tab replays may be unreliable. Use Browserbase Live View for monitoring.

```typescript
const stagehand = new Stagehand({
  modelName: "google/gemini-2.0-flash-exp",
});
await stagehand.init();
const page = stagehand.page;

// 1. Open first tab (Hacker News)
await page.goto("https://news.ycombinator.com");

// 2. Open a second tab
const context = page.context();
const pageTwo = await context.newPage();

// 3. Navigate second tab (GitHub Trending)
await pageTwo.goto("https://github.com/trending");

// 4. Switch between tabs using Live View
console.log("Use the tabs menu at the top of the live view panel to switch to 'Tab 2'");

// Perform actions on each tab as needed
```

## AdBlocker Support

Enable AdBlocker for cleaner sessions:

```typescript
// Configure session with AdBlocker
// In Browserbase UI: Customize → Enable "Enable AdBlocker"

await page.goto("https://news.ycombinator.com");
// Page loads without ads
```

## API Integration Examples

### Example 1: Observe Page Actions

```typescript
// Via API
const result = await trpc.ai.observePage.mutate({
  url: 'https://sflib1.sfpl.org/selfreg',
  instruction: 'fill out all fields on the page with dummy data',
  modelName: 'google/gemini-2.0-flash'
});

console.log(result.actions);
// Array of action steps to execute
```

### Example 2: Execute Actions

```typescript
const result = await trpc.ai.executeActions.mutate({
  url: 'https://example.com/form',
  instruction: 'fill out the registration form with test data',
  geolocation: {
    city: 'NEW_YORK',
    state: 'NY',
    country: 'US'
  }
});

console.log(`Executed ${result.actionCount} actions`);
console.log(`Session: ${result.sessionUrl}`);
```

### Example 3: Extract Contact Information

```typescript
const result = await trpc.ai.extractData.mutate({
  url: 'https://sflib1.sfpl.org',
  instruction: 'get the contact information of the library',
  schemaType: 'contactInfo'
});

console.log(result.data.contactInfo);
// { email: '...', phone: '...', address: '...' }
```

### Example 4: Multi-Tab Workflow

```typescript
const result = await trpc.ai.multiTabWorkflow.mutate({
  tabs: [
    {
      url: 'https://news.ycombinator.com',
      instruction: 'get the top 5 trending stories'
    },
    {
      url: 'https://github.com/trending',
      instruction: 'get the top 3 trending repositories'
    }
  ],
  modelName: 'google/gemini-2.0-flash-exp'
});

console.log(`Opened ${result.tabCount} tabs`);
console.log(result.tabs);
```

## Session Replay Integration

After executing any workflow, retrieve the session replay:

```typescript
// Wait for recording to be ready (~30 seconds after session closure)
await new Promise(resolve => setTimeout(resolve, 35000));

// Get session replay
const replay = await trpc.ai.getSessionReplay.query({
  sessionId: result.sessionId
});

// Display in UI using SessionReplayPlayer component
<SessionReplayPlayer
  sessionId={replay.sessionId}
  events={replay.events}
  width={1024}
  height={576}
/>
```

## Best Practices

### 1. Model Selection
- **`google/gemini-2.0-flash`**: Fast, good for simple tasks
- **`google/gemini-2.0-flash-exp`**: Experimental, better for complex workflows

### 2. Geo-Location
Always specify geo-location for location-specific tasks:

```typescript
geolocation: {
  city: 'NEW_YORK',
  state: 'NY',
  country: 'US'
}
```

### 3. Action Execution
Use `observe()` first to preview actions before executing:

```typescript
// Preview actions
const actions = await page.observe(instruction);
console.log('Actions to be executed:', actions);

// Then execute
for (const action of actions) {
  await page.act(action);
}
```

### 4. Data Extraction
Always use typed schemas for extraction:

```typescript
// Good - Type-safe extraction
const result = await page.extract({
  instruction: "get contact info",
  schema: z.object({
    contactInfo: z.object({
      email: z.string().email(),
      phone: z.string()
    })
  })
});

// Bad - Untyped extraction
const result = await page.extract({
  instruction: "get contact info",
  schema: z.record(z.any())
});
```

### 5. Session Management
Always close sessions properly:

```typescript
try {
  await stagehand.init();
  // ... your automation logic
} finally {
  await stagehand.close();
}
```

## Troubleshooting

### Issue: Actions Not Executing
- Check if instruction is clear and specific
- Use `observe()` first to see what actions are detected
- Ensure page has fully loaded before executing actions

### Issue: Extraction Returns Empty Data
- Verify the data exists on the page
- Make instruction more specific
- Check schema matches expected data structure

### Issue: Multi-Tab Replay Not Working
- This is expected behavior - multi-tab replays are unreliable
- Use Browserbase Live View to monitor sessions in real-time
- Consider using screenshots instead for multi-tab workflows

### Issue: Session Timeout
- Increase timeout in Stagehand configuration
- Break complex workflows into smaller steps
- Use session keep-alive if needed

## Advanced Patterns

### Pattern 1: Retry Logic

```typescript
async function executeWithRetry(action: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await page.act(action);
      if (result.success) return result;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### Pattern 2: Conditional Workflows

```typescript
const actions = await page.observe("check if user is logged in");

if (actions.includes("login")) {
  // User not logged in, perform login
  await page.act("click login button");
  await page.act("fill in credentials");
  await page.act("submit login form");
}
```

### Pattern 3: Data Aggregation

```typescript
const tabs = [
  'https://site1.com',
  'https://site2.com',
  'https://site3.com'
];

const allData = [];

for (const url of tabs) {
  await page.goto(url);
  const data = await page.extract({
    instruction: "get product pricing",
    schema: productSchema
  });
  allData.push(data);
}

console.log('Aggregated data from all sites:', allData);
```

## Using Context7 MCP with Stagehand Agents

Context7 provides up-to-date library documentation that can be integrated with Stagehand agents for better code generation.

### Setting Up Context7 Integration

```typescript
// Create an agent with Context7 MCP integration
const agent = stagehand.agent({
  integrations: ['https://mcp.context7.com/mcp'],
  systemPrompt: `You have access to the Context7 tool for up-to-date library documentation.
  Always use Context7 when you need current API documentation or code examples.`,
});

// Execute task with Context7 support
await agent.execute({
  instruction: 'Build a Next.js middleware that checks for JWT in cookies. use context7',
  maxSteps: 20,
});
```

### Via API with Context7

```typescript
// Example: Extract data using Context7 for current documentation
const result = await trpc.ai.extractData.mutate({
  url: 'https://docs.library.com',
  instruction: 'Extract the API usage examples. use library /library/docs for context7',
  schemaType: 'custom'
});
```

### Adding Rules for Auto-Invocation

Add this to your `CLAUDE.md` or project rules:

```markdown
Always use context7 when I need code generation, setup or configuration steps, or
library/API documentation. This means you should automatically use the Context7 MCP
tools to resolve library id and get library docs without me having to explicitly ask.
```

## Resources

- [Stagehand Documentation](https://docs.stagehand.dev/)
- [Browserbase Documentation](https://docs.browserbase.com)
- [Session Replay Guide](https://docs.browserbase.com/features/session-replay)
- [Context7 Documentation](https://context7.com)
- [Stagehand Slack Community](https://www.stagehand.dev/slack)

## Need Help?

- Check the Browserbase Live View during session execution
- Enable verbose logging: `verbose: 1` in Stagehand config
- Review session logs via API: `trpc.ai.getSessionLogs.query({ sessionId })`
- Use Context7 for up-to-date library documentation: `use context7` in prompts
- Contact support via Browserbase widget (bottom right corner)
