# Task Execution System - Setup Checklist

## Prerequisites

- [ ] Database is running and migrated
- [ ] Environment variables are configured
- [ ] Browserbase account is set up (for browser automation tasks)
- [ ] GoHighLevel API access (optional, for ghl_action tasks)

## Configuration Steps

### 1. Environment Variables

Update your `.env` file with the following:

```bash
# Required for browser automation tasks
BROWSERBASE_API_KEY=your_browserbase_api_key
BROWSERBASE_PROJECT_ID=your_browserbase_project_id
BROWSERBASE_REGION=us-west-2

# AI Model for Stagehand (browser automation)
STAGEHAND_MODEL=google/gemini-2.0-flash
# or
AI_MODEL=google/gemini-2.0-flash

# Required AI API keys
GEMINI_API_KEY=your_gemini_api_key
# or
OPENAI_API_KEY=your_openai_api_key
# or
ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional: GoHighLevel integration
GHL_API_KEY=your_gohighlevel_api_key
GHL_LOCATION_ID=your_default_location_id
```

### 2. Database Schema

Ensure these tables exist (should be from migrations):
- [ ] `agency_tasks` - Main task storage
- [ ] `task_executions` - Execution history
- [ ] `user_webhooks` - Webhook configurations
- [ ] `outbound_messages` - Notification queue
- [ ] `inbound_messages` - Incoming messages
- [ ] `bot_conversations` - Conversation context

### 3. Verify Dependencies

```bash
npm install
```

Key dependencies that should be installed:
- [ ] `@browserbasehq/stagehand` - Browser automation
- [ ] `drizzle-orm` - Database ORM
- [ ] `@trpc/server` - API framework
- [ ] AI SDK (Google AI, OpenAI, or Anthropic)

### 4. Build and Test

```bash
# Build the project
npm run build

# Start the development server
npm run dev
```

## Testing Each Task Type

### Browser Automation
- [ ] Create a simple navigation task
- [ ] Verify Browserbase session is created
- [ ] Check execution record has `browserSessionId` and `debugUrl`
- [ ] Confirm screenshots are captured

### API Call
- [ ] Test with public API (e.g., JSONPlaceholder)
- [ ] Verify authentication headers are sent
- [ ] Check timeout handling
- [ ] Verify response data is stored in `output`

### GoHighLevel Action
- [ ] Set GHL_API_KEY environment variable
- [ ] Create test contact
- [ ] Verify contact appears in GHL
- [ ] Test SMS sending (optional)

### Notification
- [ ] Create notification task
- [ ] Verify outbound message is created
- [ ] Check `deliveryStatus` is "pending"
- [ ] Confirm webhook is configured

### Reminder
- [ ] Create reminder with future date
- [ ] Verify scheduled outbound message
- [ ] Check `scheduledFor` timestamp

### Data Extraction
- [ ] Extract data from public website
- [ ] Verify extracted data in task result
- [ ] Check execution output structure

### Report Generation
- [ ] Generate task summary report
- [ ] Verify report data accuracy
- [ ] Test notification delivery (optional)

## Execution Flows

### Automatic Execution
- [ ] Create task with `executionType: "automatic"`
- [ ] Verify task executes immediately
- [ ] Check status changes: pending → in_progress → completed

### Manual Execution
- [ ] Create task with `executionType: "manual_trigger"`
- [ ] Verify task stays in pending
- [ ] Call execute endpoint
- [ ] Confirm execution starts

### Human Review Workflow
- [ ] Create task with `requiresHumanReview: true`
- [ ] Verify task stays pending
- [ ] Approve via API
- [ ] Confirm auto-execution after approval

### Scheduled Execution
- [ ] Create task with `scheduledFor` in future
- [ ] Verify task doesn't execute immediately
- [ ] Run `processPendingTasks()`
- [ ] Confirm execution at scheduled time

## Error Handling

- [ ] Test task with invalid configuration
- [ ] Verify validation error is returned
- [ ] Create failing API call
- [ ] Confirm retry logic (up to 3 attempts)
- [ ] Check error tracking in database

## Monitoring & Observability

### Check Logs
- [ ] Verify `[TaskExecution]` logs appear
- [ ] Confirm task lifecycle is logged
- [ ] Check error messages are descriptive

### Database Records
- [ ] Verify task status updates correctly
- [ ] Check execution records are created
- [ ] Confirm timestamps are accurate
- [ ] Validate result data is stored

### Execution History
- [ ] View executions via API
- [ ] Check attempt numbers
- [ ] Verify duration is calculated
- [ ] Confirm error details are captured

## API Endpoints

Test all TRPC endpoints:

- [ ] `agencyTasks.create` - Create task
- [ ] `agencyTasks.list` - List tasks with filters
- [ ] `agencyTasks.get` - Get single task with executions
- [ ] `agencyTasks.update` - Update task
- [ ] `agencyTasks.delete` - Cancel task
- [ ] `agencyTasks.execute` - Manual execution
- [ ] `agencyTasks.approve` - Approve for execution
- [ ] `agencyTasks.reject` - Reject task
- [ ] `agencyTasks.getStats` - Get statistics
- [ ] `agencyTasks.getExecutions` - Get execution history

## Production Readiness

### Security
- [ ] API keys stored in environment variables
- [ ] Webhook authentication enabled
- [ ] Human review for sensitive operations
- [ ] Input validation on all configs

### Performance
- [ ] Async execution doesn't block API
- [ ] Database queries are optimized
- [ ] Proper indexes exist on tables
- [ ] Timeouts configured appropriately

### Reliability
- [ ] Retry logic working
- [ ] Error handling comprehensive
- [ ] Execution history tracked
- [ ] Notifications sent on failure

### Scalability
- [ ] Tasks can be queued
- [ ] Batch processing available
- [ ] Rate limiting considered
- [ ] Database can handle volume

## Next Steps

After completing the checklist:

1. **Set up scheduled processor**: Create cron job to run `processPendingTasks()`
2. **Configure webhooks**: Set up inbound webhook handlers
3. **Monitor production**: Set up logging and alerting
4. **Create task templates**: Build common task configurations
5. **Document custom tasks**: Add organization-specific task types
6. **Train users**: Create guides for creating and managing tasks

## Common Issues & Solutions

### Issue: Task not executing automatically
- Check `executionType` is "automatic"
- Verify `assignedToBot` is true
- Ensure `requiresHumanReview` is false
- Confirm no `scheduledFor` date is set

### Issue: Browser automation failing
- Verify BROWSERBASE_API_KEY is set
- Check BROWSERBASE_PROJECT_ID is correct
- Ensure AI model API key is configured
- Review browser session logs

### Issue: GHL actions not working
- Confirm GHL_API_KEY is valid
- Check API endpoint URLs
- Verify contact IDs exist
- Review GHL API response

### Issue: Executions not appearing in history
- Check database connection
- Verify taskExecutions table exists
- Ensure execution record creation isn't failing
- Review error logs

## Support

For issues or questions:
1. Check the documentation: `TASK_EXECUTION.md`
2. Review examples: `examples/task-execution-examples.ts`
3. Check execution logs for errors
4. Verify database schema is up to date
5. Test with simple tasks first before complex workflows
