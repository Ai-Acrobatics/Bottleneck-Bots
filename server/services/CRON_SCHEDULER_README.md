# Cron Scheduler Service Documentation

## Overview

The Cron Scheduler Service provides comprehensive scheduling capabilities for browser automation tasks using cron expressions. It includes validation, parsing, human-readable descriptions, and automatic task execution.

## Components

### 1. CronSchedulerService (`cronScheduler.service.ts`)

Core service for cron expression handling.

#### Features

- **Validation**: Validate cron expressions before use
- **Parsing**: Parse cron expressions into component fields
- **Description**: Convert cron expressions to human-readable text
- **Next Run Time**: Calculate when a task will next execute
- **Schedule Types**: Convert simple schedules (daily, weekly, monthly) to cron
- **Timezone Support**: Handle different timezones correctly
- **Edge Cases**: Handle DST transitions and impossible dates

#### API Methods

##### `validateCronExpression(expression: string): CronValidationResult`

Validates a cron expression.

```typescript
const result = cronSchedulerService.validateCronExpression("0 12 * * *");
if (result.valid) {
  console.log("Valid expression");
} else {
  console.log("Invalid:", result.error);
}
```

##### `parseCronExpression(expression: string): ParsedCronExpression | null`

Parses a cron expression into its component fields.

```typescript
const parsed = cronSchedulerService.parseCronExpression("0 12 * * 1");
// Returns: { minute: "0", hour: "12", dayOfMonth: "*", month: "*", dayOfWeek: "1" }
```

##### `describeCronExpression(expression: string): string`

Generates human-readable description using cronstrue.

```typescript
const description = cronSchedulerService.describeCronExpression("0 12 * * *");
// Returns: "At 12:00"
```

##### `getNextRunTime(expression: string, timezone: string = "UTC"): Date | null`

Calculates the next run time for a cron expression.

```typescript
const nextRun = cronSchedulerService.getNextRunTime("0 12 * * *", "America/New_York");
console.log("Next run:", nextRun);
```

##### `getNextNRunTimes(expression: string, count: number, timezone: string = "UTC"): Date[]`

Gets the next N run times.

```typescript
const runTimes = cronSchedulerService.getNextNRunTimes("0 12 * * *", 5, "UTC");
// Returns array of 5 upcoming execution times
```

##### `scheduleTypeToCron(type: ScheduleType, config?: ScheduleConfig): string`

Converts UI schedule types to cron expressions.

```typescript
// Daily at 9:30 AM
const dailyCron = cronSchedulerService.scheduleTypeToCron("daily", {
  hour: 9,
  minute: 30
});
// Returns: "30 9 * * *"

// Weekly on Monday at 10:00 AM
const weeklyCron = cronSchedulerService.scheduleTypeToCron("weekly", {
  hour: 10,
  minute: 0,
  dayOfWeek: 1
});
// Returns: "0 10 * * 1"

// Monthly on the 15th at 8:00 AM
const monthlyCron = cronSchedulerService.scheduleTypeToCron("monthly", {
  hour: 8,
  minute: 0,
  dayOfMonth: 15
});
// Returns: "0 8 15 * *"
```

##### `isTimeToRun(expression: string, lastRun: Date | null, timezone: string = "UTC"): boolean`

Checks if a task should run now based on its schedule and last run time.

```typescript
const lastRun = new Date("2024-01-01T12:00:00Z");
const shouldRun = cronSchedulerService.isTimeToRun("0 12 * * *", lastRun, "UTC");
```

##### `getScheduleDescription(type: ScheduleType, config?: ScheduleConfig): string`

Gets human-readable schedule description from schedule type.

```typescript
const description = cronSchedulerService.getScheduleDescription("weekly", {
  hour: 10,
  minute: 0,
  dayOfWeek: 1
});
// Returns: "Every Monday at 10:00"
```

##### `willEverRun(expression: string, timezone: string = "UTC"): boolean`

Checks if a cron expression will ever trigger (e.g., Feb 31st won't).

```typescript
const valid = cronSchedulerService.willEverRun("0 0 31 2 *", "UTC");
// Returns: false (Feb 31st doesn't exist)
```

##### `getTimeUntilNextRun(expression: string, timezone: string = "UTC"): number | null`

Gets milliseconds until next run.

```typescript
const msUntilRun = cronSchedulerService.getTimeUntilNextRun("0 12 * * *", "UTC");
console.log("Task runs in", msUntilRun / 1000 / 60, "minutes");
```

### 2. SchedulerRunnerService (`schedulerRunner.service.ts`)

Service that polls for and executes scheduled tasks.

#### Features

- **Automatic Polling**: Checks for due tasks every minute (configurable)
- **Task Execution**: Executes browser automation and API tasks
- **Retry Logic**: Automatically retries failed tasks
- **Notifications**: Sends notifications on success/failure
- **Statistics**: Tracks execution metrics
- **Graceful Shutdown**: Stops cleanly on server shutdown

#### API Methods

##### `start(checkIntervalMs: number = 60000): void`

Starts the scheduler runner.

```typescript
// Start with default 60-second interval
schedulerRunnerService.start();

// Start with custom interval (30 seconds)
schedulerRunnerService.start(30000);
```

##### `stop(): void`

Stops the scheduler runner.

```typescript
schedulerRunnerService.stop();
```

##### `getStats(): SchedulerStats`

Gets execution statistics.

```typescript
const stats = schedulerRunnerService.getStats();
console.log("Tasks run:", stats.tasksRun);
console.log("Success rate:", stats.successCount / stats.tasksRun);
```

##### `resetStats(): void`

Resets statistics.

```typescript
schedulerRunnerService.resetStats();
```

##### `isSchedulerRunning(): boolean`

Checks if scheduler is running.

```typescript
if (schedulerRunnerService.isSchedulerRunning()) {
  console.log("Scheduler is active");
}
```

##### `updateCheckInterval(intervalMs: number): void`

Updates the check interval.

```typescript
// Change to check every 30 seconds
schedulerRunnerService.updateCheckInterval(30000);
```

## Cron Expression Format

Standard 5-field cron format:

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-6, Sunday=0)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

### Special Characters

- `*` - Any value
- `,` - Value list (e.g., `1,3,5`)
- `-` - Range (e.g., `1-5`)
- `/` - Step values (e.g., `*/15` = every 15 minutes)

### Common Examples

```
0 0 * * *       # Daily at midnight
0 12 * * *      # Daily at noon
0 9 * * 1       # Every Monday at 9am
0 0 1 * *       # First day of month at midnight
*/15 * * * *    # Every 15 minutes
0 9-17 * * 1-5  # Weekdays 9am-5pm (hourly)
0 0 * * 0       # Every Sunday at midnight
```

## Integration

### Server Startup

The scheduler is automatically initialized when the server starts:

```typescript
// In server/_core/index.ts
async function initializeScheduledTasks() {
  // Get all active tasks
  const tasks = await db.select().from(scheduledBrowserTasks);

  // Update next run times
  for (const task of tasks) {
    const nextRun = cronSchedulerService.getNextRunTime(
      task.cronExpression,
      task.timezone
    );
    // Update database...
  }

  // Start scheduler
  schedulerRunnerService.start();
}
```

### Environment Variables

```bash
# Check interval in milliseconds (default: 60000 = 1 minute)
SCHEDULER_CHECK_INTERVAL=60000
```

## Database Schema

### scheduledBrowserTasks

```typescript
{
  id: number;
  userId: number;
  name: string;
  description?: string;

  // Automation config
  automationType: string; // chat, observe, extract, workflow, custom
  automationConfig: object;

  // Schedule config
  scheduleType: string; // daily, weekly, monthly, cron, once
  cronExpression: string;
  timezone: string;

  // Execution tracking
  status: string; // active, paused, failed, completed, archived
  nextRun?: Date;
  lastRun?: Date;
  lastRunStatus?: string;
  lastRunError?: string;
  lastRunDuration?: number;

  // Statistics
  executionCount: number;
  successCount: number;
  failureCount: number;
  averageDuration: number;

  // Retry config
  retryOnFailure: boolean;
  maxRetries: number;
  retryDelay: number; // seconds

  // Notifications
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
  notificationChannels?: object[];
}
```

### scheduledTaskExecutions

```typescript
{
  id: number;
  taskId: number;

  // Execution details
  status: string; // queued, running, success, failed, timeout, cancelled
  triggerType: string; // scheduled, manual, retry
  attemptNumber: number;

  // Timing
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;

  // Results
  output?: object;
  error?: string;
  logs?: object;

  // Browser session
  sessionId?: string;
  debugUrl?: string;
  recordingUrl?: string;
}
```

## Usage Examples

### Creating a Scheduled Task

```typescript
import { cronSchedulerService } from "./services/cronScheduler.service";

// Create a daily task
const cronExpression = cronSchedulerService.scheduleTypeToCron("daily", {
  hour: 9,
  minute: 30
});

// Validate the expression
const validation = cronSchedulerService.validateCronExpression(cronExpression);
if (!validation.valid) {
  throw new Error(validation.error);
}

// Get human-readable description
const description = cronSchedulerService.describeCronExpression(cronExpression);
console.log("Schedule:", description); // "At 09:30"

// Calculate next run time
const nextRun = cronSchedulerService.getNextRunTime(cronExpression, "America/New_York");
console.log("Next run:", nextRun);

// Insert into database
await db.insert(scheduledBrowserTasks).values({
  userId: 1,
  name: "Daily Report",
  automationType: "browser_automation",
  automationConfig: {
    steps: [
      { type: "navigate", url: "https://example.com/dashboard" },
      { type: "extract", instruction: "Extract the daily metrics" },
    ]
  },
  scheduleType: "daily",
  cronExpression,
  timezone: "America/New_York",
  status: "active",
  nextRun,
  // ... other fields
});
```

### Checking Task Status

```typescript
// Get scheduler statistics
const stats = schedulerRunnerService.getStats();
console.log(`
  Total tasks: ${stats.totalTasks}
  Tasks run: ${stats.tasksRun}
  Success rate: ${(stats.successCount / stats.tasksRun * 100).toFixed(2)}%
  Last check: ${stats.lastCheckTime.toISOString()}
`);

// Check if a specific task should run
const task = await db.select().from(scheduledBrowserTasks).where(...);
const shouldRun = cronSchedulerService.isTimeToRun(
  task.cronExpression,
  task.lastRun,
  task.timezone
);
```

### Preview Next Executions

```typescript
// Show user when their task will run next
const upcomingRuns = cronSchedulerService.getNextNRunTimes(
  task.cronExpression,
  5,
  task.timezone
);

console.log("Upcoming executions:");
upcomingRuns.forEach((runTime, index) => {
  console.log(`  ${index + 1}. ${runTime.toLocaleString()}`);
});
```

## Error Handling

### Invalid Cron Expressions

```typescript
const result = cronSchedulerService.validateCronExpression(userInput);
if (!result.valid) {
  return {
    error: `Invalid cron expression: ${result.error}`,
    suggestion: "Try '0 9 * * *' for daily at 9am"
  };
}
```

### Impossible Dates

```typescript
// Check if expression will ever run
if (!cronSchedulerService.willEverRun(expression, timezone)) {
  return {
    error: "This schedule will never occur (e.g., Feb 31st)",
    suggestion: "Please review your schedule configuration"
  };
}
```

### Timezone Handling

```typescript
try {
  const nextRun = cronSchedulerService.getNextRunTime(
    expression,
    userTimezone
  );

  if (!nextRun) {
    throw new Error("Could not calculate next run time");
  }

  // Convert to user's local time for display
  const localTime = nextRun.toLocaleString('en-US', {
    timeZone: userTimezone,
    dateStyle: 'full',
    timeStyle: 'long'
  });

} catch (error) {
  console.error("Error calculating next run:", error);
}
```

## Testing

Run the test suite:

```bash
npm test server/services/cronScheduler.service.test.ts
```

The test file includes comprehensive tests for:
- Expression validation
- Parsing and describing expressions
- Next run time calculations
- Schedule type conversions
- Timezone handling
- Edge cases (DST, impossible dates, etc.)

## Best Practices

1. **Always Validate**: Validate cron expressions before storing them
2. **Use Timezones**: Always specify timezone for user-facing schedules
3. **Preview Schedules**: Show users when their tasks will run
4. **Handle Failures**: Implement retry logic and notifications
5. **Monitor Performance**: Track execution statistics
6. **Test Edge Cases**: Test with DST transitions and various timezones
7. **Graceful Shutdown**: Ensure scheduler stops cleanly

## Troubleshooting

### Tasks Not Running

1. Check if scheduler is running: `schedulerRunnerService.isSchedulerRunning()`
2. Verify task status is "active"
3. Check nextRun time is in the past
4. Review task.lastRunError for error messages
5. Check server logs for execution errors

### Incorrect Timezones

1. Verify timezone string is valid IANA timezone (e.g., "America/New_York")
2. Use `getNextRunTime()` with correct timezone
3. Test with different timezones to verify behavior
4. Consider DST transitions in calculations

### Performance Issues

1. Reduce check interval if too frequent
2. Limit concurrent executions
3. Use job queue (BullMQ) for heavy workloads
4. Monitor database performance
5. Archive completed tasks regularly

## Future Enhancements

- [ ] Add job queue integration (BullMQ)
- [ ] Implement task dependencies
- [ ] Add scheduling conflicts detection
- [ ] Support for calendar-based schedules
- [ ] Advanced retry strategies (exponential backoff)
- [ ] Task execution history visualization
- [ ] Schedule templates and presets
- [ ] Multi-region scheduling
- [ ] Cost estimation based on schedule
- [ ] A/B testing for scheduled tasks
