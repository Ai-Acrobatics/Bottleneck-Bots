# Cron Scheduler - Quick Reference Guide

## Installation

```bash
pnpm install
# or
npm install
```

This installs:
- `cron-parser@^4.9.0`
- `cronstrue@^2.51.0`

## Import

```typescript
import { cronSchedulerService } from './services/cronScheduler.service';
import { schedulerRunnerService } from './services/schedulerRunner.service';
```

## Common Cron Expressions

```typescript
// Every minute
"* * * * *"

// Every 15 minutes
"*/15 * * * *"

// Every hour at minute 0
"0 * * * *"

// Daily at midnight
"0 0 * * *"

// Daily at 9:30 AM
"30 9 * * *"

// Every Monday at 9 AM
"0 9 * * 1"

// Every weekday at 9 AM
"0 9 * * 1-5"

// First day of month at midnight
"0 0 1 * *"

// Every Sunday at midnight
"0 0 * * 0"

// Business hours (9-5, Mon-Fri, every hour)
"0 9-17 * * 1-5"
```

## Quick API Reference

### Validate Expression

```typescript
const result = cronSchedulerService.validateCronExpression("0 9 * * *");
// { valid: true } or { valid: false, error: "..." }
```

### Convert Schedule Type

```typescript
// Daily
cronSchedulerService.scheduleTypeToCron("daily", { hour: 9, minute: 30 });
// Returns: "30 9 * * *"

// Weekly (Monday)
cronSchedulerService.scheduleTypeToCron("weekly", { hour: 10, minute: 0, dayOfWeek: 1 });
// Returns: "0 10 * * 1"

// Monthly (15th)
cronSchedulerService.scheduleTypeToCron("monthly", { hour: 8, minute: 0, dayOfMonth: 15 });
// Returns: "0 8 15 * *"
```

### Get Human-Readable Description

```typescript
cronSchedulerService.describeCronExpression("0 9 * * 1");
// Returns: "At 09:00, only on Monday"
```

### Calculate Next Run Time

```typescript
const nextRun = cronSchedulerService.getNextRunTime("0 9 * * *", "America/New_York");
// Returns: Date object
```

### Get Multiple Run Times

```typescript
const runTimes = cronSchedulerService.getNextNRunTimes("0 9 * * 1-5", 5, "UTC");
// Returns: Array of 5 Date objects
```

### Check If Should Run

```typescript
const shouldRun = cronSchedulerService.isTimeToRun(
  "0 9 * * *",
  lastRunDate,
  "UTC"
);
// Returns: boolean
```

### Scheduler Control

```typescript
// Start scheduler (checks every 60 seconds by default)
schedulerRunnerService.start();

// Start with custom interval (30 seconds)
schedulerRunnerService.start(30000);

// Stop scheduler
schedulerRunnerService.stop();

// Check if running
const isRunning = schedulerRunnerService.isSchedulerRunning();

// Get statistics
const stats = schedulerRunnerService.getStats();
/*
{
  totalTasks: 10,
  activeTasks: 2,
  tasksRun: 100,
  successCount: 95,
  failureCount: 5,
  lastCheckTime: Date
}
*/

// Reset statistics
schedulerRunnerService.resetStats();

// Update check interval
schedulerRunnerService.updateCheckInterval(45000);
```

## Common Patterns

### Create Scheduled Task

```typescript
// 1. Convert schedule to cron
const cronExpression = cronSchedulerService.scheduleTypeToCron("daily", {
  hour: 9,
  minute: 30
});

// 2. Validate
const validation = cronSchedulerService.validateCronExpression(cronExpression);
if (!validation.valid) {
  throw new Error(`Invalid schedule: ${validation.error}`);
}

// 3. Calculate next run
const nextRun = cronSchedulerService.getNextRunTime(
  cronExpression,
  "America/New_York"
);

// 4. Get description for UI
const description = cronSchedulerService.describeCronExpression(cronExpression);

// 5. Save to database
await db.insert(scheduledBrowserTasks).values({
  name: "Daily Report",
  cronExpression,
  timezone: "America/New_York",
  nextRun,
  status: "active",
  automationType: "browser_automation",
  automationConfig: { /* ... */ },
  // ... other fields
});
```

### Show Preview to User

```typescript
// Get next 5 execution times
const upcomingRuns = cronSchedulerService.getNextNRunTimes(
  task.cronExpression,
  5,
  task.timezone
);

// Format for display
const preview = upcomingRuns.map((date, i) => ({
  number: i + 1,
  date: date.toLocaleDateString(),
  time: date.toLocaleTimeString(),
  full: date.toLocaleString('en-US', {
    timeZone: task.timezone,
    dateStyle: 'full',
    timeStyle: 'short'
  })
}));
```

### Monitor Task Health

```typescript
// Get task statistics
const task = await db
  .select()
  .from(scheduledBrowserTasks)
  .where(eq(scheduledBrowserTasks.id, taskId));

const successRate = (task.successCount / task.executionCount) * 100;

if (successRate < 80) {
  // Alert: Task has high failure rate
  console.warn(`Task ${task.name} has ${successRate.toFixed(1)}% success rate`);
}

// Check if next run is calculated
if (!task.nextRun) {
  console.error(`Task ${task.name} has no next run time scheduled`);
}

// Verify expression will run
const willRun = cronSchedulerService.willEverRun(task.cronExpression, task.timezone);
if (!willRun) {
  console.error(`Task ${task.name} has impossible schedule`);
}
```

### Manual Task Trigger

```typescript
// Create manual execution
await db.insert(scheduledTaskExecutions).values({
  taskId: task.id,
  status: "queued",
  triggerType: "manual",
  attemptNumber: 1,
});

// The scheduler will pick it up on next check
// Or execute immediately:
// await schedulerRunnerService.executeTask(task.id, executionId);
```

## Timezone Examples

```typescript
// Common timezones
const timezones = {
  utc: "UTC",
  est: "America/New_York",
  cst: "America/Chicago",
  mst: "America/Denver",
  pst: "America/Los_Angeles",
  london: "Europe/London",
  paris: "Europe/Paris",
  tokyo: "Asia/Tokyo",
};

// Calculate for different timezones
const expression = "0 9 * * *"; // 9 AM
Object.entries(timezones).forEach(([name, tz]) => {
  const nextRun = cronSchedulerService.getNextRunTime(expression, tz);
  console.log(`${name}: ${nextRun?.toLocaleString()}`);
});
```

## Error Handling

```typescript
// Validate before using
const validation = cronSchedulerService.validateCronExpression(userInput);
if (!validation.valid) {
  return {
    error: `Invalid cron expression: ${validation.error}`,
    suggestions: [
      "Daily at 9am: 0 9 * * *",
      "Every Monday at 10am: 0 10 * * 1",
      "First of month: 0 0 1 * *"
    ]
  };
}

// Check if expression will ever run
if (!cronSchedulerService.willEverRun(expression, timezone)) {
  return {
    error: "This schedule will never occur",
    example: "Feb 31st doesn't exist"
  };
}

// Handle calculation errors
const nextRun = cronSchedulerService.getNextRunTime(expression, timezone);
if (!nextRun) {
  return {
    error: "Could not calculate next run time",
    check: "Verify expression and timezone"
  };
}
```

## Testing Expressions

```typescript
// Test an expression
const expression = "0 9 * * 1-5"; // Weekdays at 9am

// 1. Validate
console.log("Valid:", cronSchedulerService.validateCronExpression(expression));

// 2. Describe
console.log("Description:", cronSchedulerService.describeCronExpression(expression));

// 3. Next 3 runs
const next3 = cronSchedulerService.getNextNRunTimes(expression, 3, "UTC");
console.log("Next 3 runs:");
next3.forEach((date, i) => {
  console.log(`  ${i + 1}. ${date.toLocaleString()} (${date.toLocaleDateString('en-US', { weekday: 'long' })})`);
});

// 4. Time until next run
const msUntil = cronSchedulerService.getTimeUntilNextRun(expression, "UTC");
console.log(`Next run in: ${Math.round(msUntil! / 1000 / 60)} minutes`);
```

## Debugging

```typescript
// Check scheduler status
console.log("Scheduler running:", schedulerRunnerService.isSchedulerRunning());
console.log("Stats:", schedulerRunnerService.getStats());

// Check specific task
const task = await db.select().from(scheduledBrowserTasks).where(...);
console.log({
  name: task.name,
  status: task.status,
  lastRun: task.lastRun,
  lastRunStatus: task.lastRunStatus,
  nextRun: task.nextRun,
  executionCount: task.executionCount,
  successRate: (task.successCount / task.executionCount * 100).toFixed(2) + '%'
});

// Check recent executions
const executions = await db
  .select()
  .from(scheduledTaskExecutions)
  .where(eq(scheduledTaskExecutions.taskId, taskId))
  .orderBy(desc(scheduledTaskExecutions.createdAt))
  .limit(10);

executions.forEach(exec => {
  console.log(`${exec.status}: ${exec.error || 'OK'} (${exec.duration}ms)`);
});
```

## Environment Variables

```bash
# .env
SCHEDULER_CHECK_INTERVAL=60000  # Check every 60 seconds (1 minute)
```

## Day of Week Reference

```
0 = Sunday
1 = Monday
2 = Tuesday
3 = Wednesday
4 = Thursday
5 = Friday
6 = Saturday
```

## Cron Expression Format

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-6)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

Special characters:
- `*` = any value
- `,` = list (e.g., 1,3,5)
- `-` = range (e.g., 1-5)
- `/` = step (e.g., */15 = every 15)

## Files Reference

- `/server/services/cronScheduler.service.ts` - Core cron handling
- `/server/services/schedulerRunner.service.ts` - Task execution
- `/server/services/cronScheduler.service.test.ts` - Test suite
- `/server/services/CRON_SCHEDULER_README.md` - Full documentation
- `/server/services/IMPLEMENTATION_SUMMARY.md` - Implementation details
- `/server/services/QUICK_REFERENCE.md` - This file
- `/server/_core/index.ts` - Server integration

## Support

For detailed documentation, see:
- `CRON_SCHEDULER_README.md` - Complete usage guide
- `IMPLEMENTATION_SUMMARY.md` - Architecture and design decisions
- `cronScheduler.service.test.ts` - Usage examples in tests
