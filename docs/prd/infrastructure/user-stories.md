# User Experience Stories: Infrastructure & Admin Features

This document contains detailed user experience stories for Bottleneck-Bots infrastructure and administrative features (21-30). Each story includes acceptance criteria for testing and validation.

---

## Feature 21: GoHighLevel Integration

### Story 21.1: Initial GHL API Connection
**As a** business owner
**I want to** connect my GoHighLevel account via API key
**So that** Bottleneck-Bots can automate my GHL workflows

**Acceptance Criteria:**
- [ ] Given I am on the integrations page, when I click "Connect GoHighLevel", then I see an API key input form
- [ ] Given I enter a valid API key, when I click "Connect", then the system validates the key against GHL API
- [ ] Given the API key is valid, when validation completes, then I see a success message and my GHL account details
- [ ] Given the API key is invalid, when validation fails, then I see a specific error message explaining the issue
- [ ] Given I am connected, when I view the integrations page, then I see my GHL connection status as "Active"

**Test Scenarios:**
1. Happy path: User enters valid API key and successfully connects to GHL
2. Edge case: User enters API key with trailing whitespace (should be trimmed)
3. Error case: User enters expired or revoked API key

**Priority:** P0
**Estimated Complexity:** Medium

---

### Story 21.2: Create GHL Contact from Workflow
**As a** marketing manager
**I want to** automatically create contacts in GHL when leads come in
**So that** new leads are immediately added to my CRM without manual entry

**Acceptance Criteria:**
- [ ] Given I have a connected GHL account, when I add a "Create Contact" action in workflow builder, then I can map fields to GHL contact properties
- [ ] Given I configure contact creation, when I map email, name, and phone fields, then these are marked as required
- [ ] Given a workflow executes, when the Create Contact action runs, then a new contact appears in my GHL account
- [ ] Given a contact already exists with the same email, when creation runs, then the system updates the existing contact instead
- [ ] Given contact creation fails, when I view execution logs, then I see the specific GHL API error message

**Test Scenarios:**
1. Happy path: New contact created successfully with all mapped fields
2. Edge case: Contact with same email exists - should update instead of duplicate
3. Error case: GHL API rate limit exceeded - should queue for retry

**Priority:** P0
**Estimated Complexity:** Medium

---

### Story 21.3: Manage GHL Funnels
**As a** digital marketer
**I want to** view and manage my GHL funnels from within Bottleneck-Bots
**So that** I can coordinate funnel actions with my automated workflows

**Acceptance Criteria:**
- [ ] Given I am connected to GHL, when I navigate to funnels section, then I see a list of all my GHL funnels
- [ ] Given I view funnel list, when I click on a funnel, then I see its pages and conversion stats
- [ ] Given I have a workflow, when I add a "Redirect to Funnel" action, then I can select from my available funnels
- [ ] Given funnel data changes in GHL, when I refresh the list, then I see updated funnel information
- [ ] Given I have many funnels, when I use search, then I can filter funnels by name

**Test Scenarios:**
1. Happy path: User views list of 10 funnels and selects one for workflow
2. Edge case: User has 100+ funnels - pagination should work correctly
3. Error case: GHL API timeout - should show cached data with refresh option

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 21.4: Run GHL Marketing Campaigns
**As a** marketing automation specialist
**I want to** trigger GHL campaigns from Bottleneck-Bots workflows
**So that** I can orchestrate multi-channel marketing sequences

**Acceptance Criteria:**
- [ ] Given I am in workflow builder, when I add "Trigger Campaign" action, then I see a list of my GHL campaigns
- [ ] Given I select a campaign, when I configure the action, then I can specify which contact to add
- [ ] Given workflow runs, when campaign trigger executes, then the contact is added to the campaign in GHL
- [ ] Given I need conditional campaigns, when I use workflow conditions, then different contacts can be added to different campaigns
- [ ] Given campaign trigger fails, when I view logs, then I see detailed error information

**Test Scenarios:**
1. Happy path: Contact successfully added to campaign and receives first message
2. Edge case: Contact is already in the campaign - should handle gracefully
3. Error case: Campaign was deleted in GHL - should log error and continue workflow

**Priority:** P0
**Estimated Complexity:** Medium

---

### Story 21.5: Manage GHL Subaccounts
**As an** agency owner
**I want to** manage multiple GHL subaccounts from Bottleneck-Bots
**So that** I can automate workflows across all my client accounts

**Acceptance Criteria:**
- [ ] Given I have an agency GHL account, when I connect, then I see all my subaccounts listed
- [ ] Given I view subaccounts, when I click on one, then I can see its contacts, funnels, and campaigns
- [ ] Given I build a workflow, when I select actions, then I can choose which subaccount to target
- [ ] Given I have templates, when I deploy to subaccount, then the workflow is created for that specific account
- [ ] Given a subaccount is added in GHL, when I sync, then it appears in my Bottleneck-Bots list

**Test Scenarios:**
1. Happy path: Agency with 5 subaccounts views and manages each one
2. Edge case: Subaccount permissions restricted - should show only accessible features
3. Error case: Subaccount deleted in GHL - should show as "Unavailable"

**Priority:** P1
**Estimated Complexity:** High

---

### Story 21.6: Pipeline Management
**As a** sales manager
**I want to** move contacts through GHL pipeline stages via workflows
**So that** deal progression is automated based on customer actions

**Acceptance Criteria:**
- [ ] Given I am connected to GHL, when I view pipelines, then I see all my pipeline stages
- [ ] Given I add "Move Pipeline Stage" action, when I configure it, then I can select pipeline and target stage
- [ ] Given a workflow runs, when the action executes, then the contact's opportunity moves to the specified stage
- [ ] Given I need to create opportunities, when I use "Create Opportunity" action, then a new opportunity is added to pipeline
- [ ] Given stage movement fails, when I view logs, then I see why (e.g., contact not in pipeline)

**Test Scenarios:**
1. Happy path: Contact moves from "Lead" to "Qualified" stage successfully
2. Edge case: Contact has multiple opportunities - should specify which one to move
3. Error case: Target stage doesn't exist - should log error with stage name

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 21.7: Appointment Scheduling Integration
**As a** service provider
**I want to** book GHL appointments through Bottleneck-Bots workflows
**So that** qualified leads automatically get scheduled for consultations

**Acceptance Criteria:**
- [ ] Given I have GHL calendars, when I add "Book Appointment" action, then I see available calendars
- [ ] Given I configure appointment booking, when I set date/time logic, then I can use dynamic values from workflow
- [ ] Given workflow runs, when appointment is booked, then it appears in my GHL calendar
- [ ] Given time slot is taken, when booking attempts, then workflow handles conflict gracefully
- [ ] Given appointment is created, when contact receives confirmation, then they get GHL notification

**Test Scenarios:**
1. Happy path: Appointment booked for next available slot
2. Edge case: All slots full for requested day - should try next available day
3. Error case: Calendar integration disabled in GHL - should show helpful error

**Priority:** P1
**Estimated Complexity:** High

---

### Story 21.8: GHL Webhook Reception
**As a** automation specialist
**I want to** receive webhooks from GHL to trigger workflows
**So that** Bottleneck-Bots responds instantly to GHL events

**Acceptance Criteria:**
- [ ] Given I create a GHL trigger, when I configure it, then I receive a unique webhook URL
- [ ] Given I paste URL in GHL, when a GHL event occurs, then Bottleneck-Bots receives the webhook
- [ ] Given webhook arrives, when event matches trigger conditions, then the workflow starts
- [ ] Given multiple workflows use GHL triggers, when event occurs, then correct workflow(s) activate
- [ ] Given webhook payload is received, when workflow runs, then I can access all GHL event data

**Test Scenarios:**
1. Happy path: New contact in GHL triggers welcome email workflow
2. Edge case: Same event triggers multiple workflows - all should run
3. Error case: Malformed webhook payload - should log and skip without crashing

**Priority:** P0
**Estimated Complexity:** Medium

---

### Story 21.9: GHL Custom Field Mapping
**As a** CRM administrator
**I want to** map custom GHL fields to workflow variables
**So that** I can use and update custom data in my automations

**Acceptance Criteria:**
- [ ] Given I have custom fields in GHL, when I configure contact actions, then custom fields appear as options
- [ ] Given I map a custom field, when workflow runs, then the custom field value is read/written correctly
- [ ] Given custom field is a dropdown, when I set value, then I see the available options
- [ ] Given custom field is required, when I don't provide value, then validation warns me
- [ ] Given custom field names contain special characters, when displayed, then they render correctly

**Test Scenarios:**
1. Happy path: Custom "Lead Source" field mapped and populated correctly
2. Edge case: Custom field with 50+ dropdown options - should be searchable
3. Error case: Custom field deleted in GHL - should show warning during workflow edit

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 21.10: GHL Connection Health Monitoring
**As a** system administrator
**I want to** monitor the health of my GHL API connection
**So that** I can proactively address integration issues

**Acceptance Criteria:**
- [ ] Given I have a GHL connection, when I view integration settings, then I see connection health status
- [ ] Given API calls are being made, when I view stats, then I see request count and error rate
- [ ] Given rate limits are approaching, when threshold is reached, then I receive a warning notification
- [ ] Given connection fails, when system detects issue, then I receive an alert with troubleshooting steps
- [ ] Given I need to reconnect, when I click "Reconnect", then I can enter a new API key

**Test Scenarios:**
1. Happy path: Connection healthy with 99.9% success rate displayed
2. Edge case: Rate limit at 80% - should show yellow warning indicator
3. Error case: API key revoked - should show red status with reconnect prompt

**Priority:** P1
**Estimated Complexity:** Low

---

## Feature 22: Async Task Queue System

### Story 22.1: View Queued Jobs Dashboard
**As a** workflow administrator
**I want to** see all jobs currently in the queue
**So that** I can monitor system load and job status

**Acceptance Criteria:**
- [ ] Given I navigate to job queue, when the page loads, then I see a list of pending jobs
- [ ] Given jobs are in queue, when I view the list, then I see job type, status, and wait time
- [ ] Given many jobs exist, when I scroll or paginate, then I can view all jobs efficiently
- [ ] Given I need specific jobs, when I filter by type or status, then the list updates accordingly
- [ ] Given queue status changes, when I'm viewing the page, then updates appear in real-time

**Test Scenarios:**
1. Happy path: User views 50 pending jobs with accurate status
2. Edge case: 10,000+ jobs in queue - pagination and performance maintained
3. Error case: Queue service temporarily unavailable - show cached data with warning

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 22.2: Monitor Job Progress in Real-Time
**As a** operations manager
**I want to** see real-time progress of running jobs
**So that** I can understand processing status and estimate completion

**Acceptance Criteria:**
- [ ] Given a job is processing, when I view its details, then I see a progress indicator
- [ ] Given job has multiple steps, when steps complete, then progress updates automatically
- [ ] Given I view job details, when I click on a step, then I see detailed logs for that step
- [ ] Given processing is taking long, when I view job, then I see elapsed time and estimated remaining
- [ ] Given multiple jobs are running, when I view dashboard, then I see aggregate progress stats

**Test Scenarios:**
1. Happy path: 5-step job shows 60% complete after 3 steps finish
2. Edge case: Job step taking 10x longer than average - should update estimate
3. Error case: Job stuck on step - should show warning after timeout threshold

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 22.3: Retry Failed Jobs
**As a** system operator
**I want to** retry jobs that have failed
**So that** temporary failures don't cause permanent workflow failures

**Acceptance Criteria:**
- [ ] Given a job has failed, when I view it, then I see a "Retry" button
- [ ] Given I click retry, when the job restarts, then it attempts from the failed step
- [ ] Given I want to retry multiple jobs, when I select them, then I can bulk retry
- [ ] Given retry is initiated, when job runs again, then I see the new attempt in history
- [ ] Given job fails again, when I view history, then I see all retry attempts with details

**Test Scenarios:**
1. Happy path: Failed API call job retried and succeeds on second attempt
2. Edge case: Job failed due to invalid data - retry should fail with same error
3. Error case: Too many retries (>5) - should prevent further retries with override option

**Priority:** P0
**Estimated Complexity:** Medium

---

### Story 22.4: Cancel Pending or Running Jobs
**As a** workflow owner
**I want to** cancel jobs that are no longer needed
**So that** I don't waste resources on obsolete tasks

**Acceptance Criteria:**
- [ ] Given a job is pending, when I click "Cancel", then the job is removed from queue
- [ ] Given a job is running, when I click "Cancel", then the job stops gracefully
- [ ] Given I want to cancel multiple jobs, when I select them, then I can bulk cancel
- [ ] Given job is canceled, when I view history, then it shows as "Canceled" with timestamp
- [ ] Given job has downstream dependencies, when I cancel, then I'm warned about affected jobs

**Test Scenarios:**
1. Happy path: Pending job canceled instantly and removed from queue
2. Edge case: Running job canceled mid-step - should complete current atomic operation
3. Error case: Job cannot be canceled (already completing) - should show informative message

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 22.5: View Complete Job History
**As an** auditor
**I want to** view historical job executions with full details
**So that** I can analyze patterns and troubleshoot past issues

**Acceptance Criteria:**
- [ ] Given I navigate to job history, when page loads, then I see completed jobs sorted by date
- [ ] Given I want to find specific jobs, when I search/filter, then I can query by date, type, status
- [ ] Given I click on a historical job, when details load, then I see full execution log
- [ ] Given I need to export data, when I click export, then I can download job history as CSV
- [ ] Given retention policy applies, when I view old jobs, then I see data within retention window

**Test Scenarios:**
1. Happy path: View last 30 days of job history with filtering by workflow
2. Edge case: Search returns 50,000+ results - should paginate efficiently
3. Error case: Job logs corrupted - should show partial data with warning

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 22.6: Configure Job Priority
**As a** workflow designer
**I want to** set priority levels for different jobs
**So that** critical workflows execute before less important ones

**Acceptance Criteria:**
- [ ] Given I create a workflow, when I configure settings, then I can set job priority (Low/Medium/High/Critical)
- [ ] Given jobs are queued, when processor picks next job, then higher priority jobs run first
- [ ] Given I view queue, when sorted by priority, then critical jobs appear at top
- [ ] Given all priorities equal, when jobs queued, then FIFO order is maintained
- [ ] Given priority is changed, when job is pending, then its queue position updates

**Test Scenarios:**
1. Happy path: Critical job jumps ahead of 100 medium priority jobs
2. Edge case: All jobs are critical - should fall back to FIFO
3. Error case: Priority changed while job processing - should not affect current run

**Priority:** P2
**Estimated Complexity:** Low

---

### Story 22.7: View Job Dependencies
**As a** workflow architect
**I want to** see dependencies between jobs
**So that** I understand job execution order and potential bottlenecks

**Acceptance Criteria:**
- [ ] Given a job has dependencies, when I view it, then I see dependent jobs listed
- [ ] Given I view job graph, when rendered, then I see visual dependency tree
- [ ] Given a dependency fails, when I view dependent job, then it shows "Blocked" status
- [ ] Given dependency is resolved, when I retry blocked job, then it can proceed
- [ ] Given circular dependency exists, when detected, then system prevents it with error

**Test Scenarios:**
1. Happy path: Job C waits for Jobs A and B to complete successfully
2. Edge case: 10-level deep dependency chain - should visualize correctly
3. Error case: Circular dependency detected during workflow save - should show clear error

**Priority:** P2
**Estimated Complexity:** High

---

### Story 22.8: Dead Letter Queue Management
**As a** system administrator
**I want to** manage jobs that have permanently failed
**So that** I can investigate and recover from systematic issues

**Acceptance Criteria:**
- [ ] Given jobs exceed max retries, when moved to DLQ, then I see them in a separate queue
- [ ] Given I view DLQ, when I examine a job, then I see full error history and payload
- [ ] Given I identify the fix, when I click "Requeue", then job returns to main queue
- [ ] Given job is unrecoverable, when I click "Discard", then it's removed with audit log
- [ ] Given DLQ grows large, when threshold exceeded, then I receive an alert

**Test Scenarios:**
1. Happy path: DLQ job requeued after external service restored
2. Edge case: Job payload too large to display - should show truncated with download option
3. Error case: DLQ job references deleted workflow - should show warning with options

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 22.9: Job Scheduling and Delays
**As a** marketing manager
**I want to** schedule jobs to run at specific times
**So that** I can time automations for optimal engagement

**Acceptance Criteria:**
- [ ] Given I configure a workflow, when I add a delay, then job pauses for specified duration
- [ ] Given I set a specific run time, when scheduling, then job executes at that time
- [ ] Given I view scheduled jobs, when I look at queue, then I see "Scheduled" status with run time
- [ ] Given scheduled time passes, when job activates, then it moves to processing queue
- [ ] Given I need to reschedule, when I edit scheduled job, then run time updates

**Test Scenarios:**
1. Happy path: Job scheduled for 9 AM tomorrow runs at exactly 9:00 AM
2. Edge case: Scheduled time is in a different timezone than user - should clarify timezone
3. Error case: System down at scheduled time - should run immediately when restored

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 22.10: Queue Performance Metrics
**As a** DevOps engineer
**I want to** monitor queue performance metrics
**So that** I can optimize system capacity and identify bottlenecks

**Acceptance Criteria:**
- [ ] Given I view queue metrics, when page loads, then I see throughput, latency, and error rates
- [ ] Given metrics are historical, when I select time range, then graphs update accordingly
- [ ] Given I need alerts, when I configure thresholds, then I'm notified when exceeded
- [ ] Given I compare periods, when I select two ranges, then I see comparative analysis
- [ ] Given I need to export, when I click export, then I receive metrics as CSV/JSON

**Test Scenarios:**
1. Happy path: Dashboard shows 1000 jobs/hour throughput with 50ms avg latency
2. Edge case: Metrics during traffic spike - should capture peak values accurately
3. Error case: Metrics collection fails - should show last known values with warning

**Priority:** P2
**Estimated Complexity:** Medium

---

## Feature 23: Admin Dashboard

### Story 23.1: View Audit Logs
**As a** security administrator
**I want to** view all system audit logs
**So that** I can track user actions and investigate security events

**Acceptance Criteria:**
- [ ] Given I am an admin, when I navigate to audit logs, then I see chronological list of events
- [ ] Given I view an event, when I click on it, then I see full details including user, action, and timestamp
- [ ] Given I need to filter, when I select criteria, then logs filter by user, action type, or date range
- [ ] Given I search logs, when I enter a query, then matching events are highlighted
- [ ] Given I need to export, when I click export, then I can download logs as CSV or JSON

**Test Scenarios:**
1. Happy path: Admin views last 24 hours of login attempts across all users
2. Edge case: 1 million log entries - search and pagination remain performant
3. Error case: Log storage at capacity - should show warning and continue logging most critical events

**Priority:** P0
**Estimated Complexity:** Medium

---

### Story 23.2: Manage Feature Flags
**As a** product manager
**I want to** enable or disable features for specific users or groups
**So that** I can roll out features gradually and test with subsets

**Acceptance Criteria:**
- [ ] Given I view feature flags, when page loads, then I see all flags with current status
- [ ] Given I toggle a flag, when I save, then the feature is enabled/disabled immediately
- [ ] Given I need targeting, when I configure a flag, then I can target by user, plan, or percentage
- [ ] Given flag affects users, when I change it, then affected users see change on next request
- [ ] Given I need history, when I view flag details, then I see change history with who/when

**Test Scenarios:**
1. Happy path: Enable "New Dashboard" for 10% of Pro users
2. Edge case: Flag with complex targeting rules - should evaluate correctly
3. Error case: Flag toggle fails - should not leave system in inconsistent state

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 23.3: Configure System Settings
**As a** system administrator
**I want to** configure global system settings
**So that** I can customize platform behavior for our organization

**Acceptance Criteria:**
- [ ] Given I navigate to settings, when page loads, then I see categorized configuration options
- [ ] Given I change a setting, when I save, then the change takes effect immediately or after specified delay
- [ ] Given settings are sensitive, when I change them, then I must confirm with my password
- [ ] Given I make a mistake, when I click reset, then settings revert to last saved state
- [ ] Given settings change, when I view history, then I see what changed and when

**Test Scenarios:**
1. Happy path: Admin changes session timeout from 30 to 60 minutes
2. Edge case: Setting change requires system restart - should show warning and schedule
3. Error case: Invalid setting value - should show validation error before save

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 23.4: Handle Support Tickets
**As a** customer support agent
**I want to** view and respond to user support tickets
**So that** I can help users resolve their issues

**Acceptance Criteria:**
- [ ] Given I view support queue, when page loads, then I see open tickets sorted by priority and age
- [ ] Given I open a ticket, when I view it, then I see user's issue, history, and context
- [ ] Given I respond to a ticket, when I send reply, then user is notified via email
- [ ] Given I resolve a ticket, when I close it, then user receives resolution notification
- [ ] Given I need to escalate, when I click escalate, then ticket moves to higher tier with notes

**Test Scenarios:**
1. Happy path: Agent responds to ticket and resolves in single interaction
2. Edge case: Ticket has 50+ messages - should load efficiently with pagination
3. Error case: Email notification fails - should show warning and allow manual resend

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 23.5: Create System Announcements
**As a** operations manager
**I want to** create announcements that all users see
**So that** I can communicate maintenance, updates, or important notices

**Acceptance Criteria:**
- [ ] Given I create an announcement, when I set content and dates, then announcement is scheduled
- [ ] Given announcement is active, when users log in, then they see the announcement banner
- [ ] Given users dismiss announcement, when they mark as read, then it doesn't show again for them
- [ ] Given I need urgency, when I set severity level, then banner color reflects importance
- [ ] Given I schedule ahead, when start time arrives, then announcement automatically activates

**Test Scenarios:**
1. Happy path: Schedule maintenance notice 3 days in advance, all users see it
2. Edge case: Multiple active announcements - should stack with most urgent on top
3. Error case: Announcement with broken HTML - should sanitize and display safely

**Priority:** P2
**Estimated Complexity:** Low

---

### Story 23.6: Monitor Security Events
**As a** security officer
**I want to** monitor and respond to security events
**So that** I can protect the platform and user data from threats

**Acceptance Criteria:**
- [ ] Given I view security dashboard, when page loads, then I see real-time security metrics
- [ ] Given suspicious activity occurs, when detected, then I receive an immediate alert
- [ ] Given I investigate an event, when I drill down, then I see IP, user agent, and action timeline
- [ ] Given I need to take action, when I block an IP or disable a user, then it takes effect immediately
- [ ] Given I want trends, when I view analytics, then I see security event patterns over time

**Test Scenarios:**
1. Happy path: Admin sees and investigates failed login spike from single IP
2. Edge case: DDoS-like traffic pattern - should not overwhelm event logging
3. Error case: Security event detection fails - should fail open with alerts

**Priority:** P0
**Estimated Complexity:** High

---

### Story 23.7: User Management
**As an** admin
**I want to** manage user accounts
**So that** I can control access and help users with account issues

**Acceptance Criteria:**
- [ ] Given I search for a user, when I enter email or name, then I see matching accounts
- [ ] Given I view a user, when I click on them, then I see full account details and activity
- [ ] Given user is locked out, when I click unlock, then they can log in again
- [ ] Given I need to disable, when I deactivate account, then user cannot access system
- [ ] Given I impersonate user, when I click "View as User", then I see their dashboard (read-only)

**Test Scenarios:**
1. Happy path: Admin finds user by email and resets their MFA
2. Edge case: User has complex name with special characters - search should handle
3. Error case: Deactivation fails mid-process - should rollback to previous state

**Priority:** P0
**Estimated Complexity:** Medium

---

### Story 23.8: System Health Monitoring
**As a** platform administrator
**I want to** monitor overall system health
**So that** I can identify and address issues before they affect users

**Acceptance Criteria:**
- [ ] Given I view health dashboard, when page loads, then I see status of all system components
- [ ] Given a component degrades, when threshold exceeded, then status changes color
- [ ] Given I click on a component, when details load, then I see metrics and recent events
- [ ] Given I need history, when I select time range, then I see uptime and incidents
- [ ] Given system is down, when I check status page, then I see accurate current status

**Test Scenarios:**
1. Happy path: All systems green with 99.99% uptime displayed
2. Edge case: Database slightly slow - should show yellow warning, not red
3. Error case: Monitoring itself fails - should show "Unknown" rather than false "Healthy"

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 23.9: Billing and Subscription Management
**As a** billing administrator
**I want to** manage user subscriptions and billing
**So that** I can handle payment issues and subscription changes

**Acceptance Criteria:**
- [ ] Given I view billing dashboard, when page loads, then I see revenue metrics and trends
- [ ] Given I search for subscription, when I find it, then I can view payment history
- [ ] Given payment failed, when I view it, then I see failure reason and can retry
- [ ] Given I need to refund, when I process refund, then it reflects in Stripe and user account
- [ ] Given I upgrade/downgrade user, when I change plan, then pro-ration is calculated

**Test Scenarios:**
1. Happy path: Admin processes refund for billing error, user notified automatically
2. Edge case: User on legacy plan no longer offered - should maintain but show warning
3. Error case: Stripe API unavailable - should show cached data with retry option

**Priority:** P1
**Estimated Complexity:** High

---

### Story 23.10: Admin Role Management
**As a** super admin
**I want to** manage admin roles and permissions
**So that** I can control what different admins can access

**Acceptance Criteria:**
- [ ] Given I view admin roles, when page loads, then I see all roles with their permissions
- [ ] Given I create a role, when I select permissions, then new role is available for assignment
- [ ] Given I assign role to user, when I save, then user gains those permissions immediately
- [ ] Given I modify a role, when I change permissions, then all users with that role are updated
- [ ] Given I view audit log, when filtering by admin, then I see actions taken by that admin

**Test Scenarios:**
1. Happy path: Create "Support Agent" role with ticket access only
2. Edge case: Remove permission from role currently in use - should warn about impact
3. Error case: Last super admin tries to remove own super admin role - should prevent

**Priority:** P1
**Estimated Complexity:** Medium

---

## Feature 24: API Key Management

### Story 24.1: Generate New API Key
**As a** developer
**I want to** generate a new API key
**So that** I can integrate Bottleneck-Bots with my applications

**Acceptance Criteria:**
- [ ] Given I am on API settings, when I click "Generate New Key", then I see a key generation form
- [ ] Given I provide a key name, when I click create, then a new API key is generated
- [ ] Given key is generated, when displayed, then I see full key only once (for copying)
- [ ] Given I copy the key, when I navigate away, then key is masked and cannot be retrieved
- [ ] Given I have multiple keys, when I view list, then I see all keys with their metadata

**Test Scenarios:**
1. Happy path: Developer generates key named "Production App" and copies it
2. Edge case: User navigates away without copying - should warn first
3. Error case: Key generation fails - should show error and not create partial key

**Priority:** P0
**Estimated Complexity:** Medium

---

### Story 24.2: Set API Rate Limits
**As an** API administrator
**I want to** set rate limits for API keys
**So that** I can prevent abuse and ensure fair usage

**Acceptance Criteria:**
- [ ] Given I edit an API key, when I view settings, then I see rate limit configuration
- [ ] Given I set rate limits, when I specify requests per minute/hour, then limits are saved
- [ ] Given rate limit is exceeded, when API call is made, then 429 response is returned
- [ ] Given I view key stats, when I check usage, then I see how close to limits
- [ ] Given I need custom limits, when I set per-endpoint limits, then they apply specifically

**Test Scenarios:**
1. Happy path: Set 100 requests/minute limit, 101st request returns 429
2. Edge case: Rate limit window boundary - should reset correctly at new window
3. Error case: Rate limit database unavailable - should fail open with logging

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 24.3: Define API Key Permissions/Scopes
**As a** security administrator
**I want to** restrict what each API key can do
**So that** I can implement least-privilege access

**Acceptance Criteria:**
- [ ] Given I create an API key, when I configure it, then I see a list of available scopes
- [ ] Given I select scopes, when I save, then key can only access those endpoints
- [ ] Given key tries unauthorized action, when request made, then 403 Forbidden returned
- [ ] Given I view key, when I check details, then I see assigned scopes clearly
- [ ] Given I need to modify, when I edit scopes, then changes apply to future requests

**Test Scenarios:**
1. Happy path: Key with "read:workflows" scope can GET but not POST workflows
2. Edge case: Scope removed while request in-flight - should complete or deny consistently
3. Error case: Invalid scope specified - should reject during key creation

**Priority:** P0
**Estimated Complexity:** Medium

---

### Story 24.4: Revoke API Keys
**As a** security administrator
**I want to** revoke API keys that are compromised or no longer needed
**So that** I can prevent unauthorized access

**Acceptance Criteria:**
- [ ] Given I view an API key, when I click "Revoke", then I see confirmation dialog
- [ ] Given I confirm revocation, when completed, then key immediately stops working
- [ ] Given key is revoked, when request made with it, then 401 Unauthorized returned
- [ ] Given I view revoked keys, when I check history, then I see revoked keys with timestamps
- [ ] Given I revoked accidentally, when key is fresh, then I see option to regenerate

**Test Scenarios:**
1. Happy path: Revoke leaked key, all subsequent requests fail immediately
2. Edge case: Revoke key with active long-running request - should complete or terminate
3. Error case: Revocation fails to propagate - should retry and alert admin

**Priority:** P0
**Estimated Complexity:** Low

---

### Story 24.5: View API Key Usage Statistics
**As a** developer
**I want to** see how my API keys are being used
**So that** I can monitor and optimize my integrations

**Acceptance Criteria:**
- [ ] Given I view API key details, when I click usage tab, then I see usage statistics
- [ ] Given I select time range, when I apply filter, then stats update for that period
- [ ] Given I view requests, when I check graphs, then I see requests over time
- [ ] Given I need breakdown, when I view by endpoint, then I see usage per endpoint
- [ ] Given I need to export, when I click export, then I receive usage data as CSV

**Test Scenarios:**
1. Happy path: View last 7 days showing 10,000 requests across 5 endpoints
2. Edge case: Key with zero usage - should show empty state, not error
3. Error case: Analytics data delayed - should show warning with last available data

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 24.6: API Key Expiration Management
**As a** security administrator
**I want to** set expiration dates for API keys
**So that** credentials don't remain valid indefinitely

**Acceptance Criteria:**
- [ ] Given I create an API key, when I configure it, then I can set optional expiration date
- [ ] Given key has expiration, when date passes, then key automatically stops working
- [ ] Given key is nearing expiration, when 7 days remain, then owner receives notification
- [ ] Given I extend expiration, when I edit key, then I can set new expiration date
- [ ] Given key is expired, when I view it, then I see "Expired" status clearly

**Test Scenarios:**
1. Happy path: Key expires at midnight, requests after that time fail with 401
2. Edge case: Key expires during active session - should fail next request gracefully
3. Error case: Expiration job fails to run - should have backup check on each request

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 24.7: IP Allowlisting for API Keys
**As a** security administrator
**I want to** restrict API keys to specific IP addresses
**So that** keys only work from authorized systems

**Acceptance Criteria:**
- [ ] Given I edit an API key, when I view security settings, then I see IP allowlist option
- [ ] Given I add IPs to allowlist, when I save, then only those IPs can use the key
- [ ] Given request comes from non-listed IP, when processed, then 403 Forbidden returned
- [ ] Given I use CIDR notation, when I specify range, then all IPs in range are allowed
- [ ] Given allowlist is empty, when key is used, then all IPs are allowed (default)

**Test Scenarios:**
1. Happy path: Key restricted to office IP, works from office, fails from home
2. Edge case: IPv6 address - should support both IPv4 and IPv6 formats
3. Error case: Load balancer changing client IP - should use X-Forwarded-For correctly

**Priority:** P2
**Estimated Complexity:** Medium

---

### Story 24.8: API Key Rotation
**As a** security administrator
**I want to** rotate API keys without service interruption
**So that** I can maintain security without downtime

**Acceptance Criteria:**
- [ ] Given I want to rotate, when I click "Rotate Key", then new key is generated
- [ ] Given rotation initiated, when grace period active, then both old and new keys work
- [ ] Given grace period ends, when time passes, then old key is automatically revoked
- [ ] Given I configure rotation, when I set grace period, then duration is customizable
- [ ] Given rotation completes, when I check, then only new key is active

**Test Scenarios:**
1. Happy path: Rotate with 24-hour grace period, both keys work during transition
2. Edge case: Cancel rotation during grace period - should keep original key active
3. Error case: New key fails to generate - should not affect existing key

**Priority:** P2
**Estimated Complexity:** Medium

---

### Story 24.9: API Key Environment Labels
**As a** developer
**I want to** label API keys by environment (dev/staging/production)
**So that** I can organize and manage keys clearly

**Acceptance Criteria:**
- [ ] Given I create an API key, when I configure it, then I can select environment label
- [ ] Given keys have labels, when I view list, then I can filter by environment
- [ ] Given I view dashboard, when I check keys, then environment is visually distinct
- [ ] Given production key is accessed, when I make changes, then I see additional warning
- [ ] Given I have many keys, when I search, then I can search by environment

**Test Scenarios:**
1. Happy path: Label 3 keys as dev, staging, production with different colors
2. Edge case: Change environment label on existing key - should log change
3. Error case: Production key rate limit lowered - should require confirmation

**Priority:** P2
**Estimated Complexity:** Low

---

### Story 24.10: API Key Webhook Notifications
**As a** DevOps engineer
**I want to** receive webhooks about API key events
**So that** I can integrate key management with my security systems

**Acceptance Criteria:**
- [ ] Given I configure webhooks, when I set URL, then events are sent to that endpoint
- [ ] Given key event occurs, when webhook fires, then payload includes event details
- [ ] Given I select events, when I choose types, then only those events trigger webhooks
- [ ] Given webhook fails, when delivery retried, then exponential backoff applies
- [ ] Given I view webhook logs, when I check history, then I see all deliveries and status

**Test Scenarios:**
1. Happy path: Key revoked triggers webhook to Slack integration
2. Edge case: Webhook endpoint slow - should not block key operations
3. Error case: Webhook returns 500 - should retry 3 times then log failure

**Priority:** P2
**Estimated Complexity:** Medium

---

## Feature 25: Analytics & Reporting

### Story 25.1: View Workflow Execution Statistics
**As a** business analyst
**I want to** see how many times each workflow executes
**So that** I can understand automation adoption and performance

**Acceptance Criteria:**
- [ ] Given I view analytics, when I select execution stats, then I see executions per workflow
- [ ] Given I select time range, when I apply filter, then data updates for that period
- [ ] Given I view trends, when I check graph, then I see execution count over time
- [ ] Given I compare workflows, when I select multiple, then I see side-by-side comparison
- [ ] Given I need details, when I click a workflow, then I see success/failure breakdown

**Test Scenarios:**
1. Happy path: View last 30 days showing 5,000 executions across 10 workflows
2. Edge case: Workflow with zero executions - should appear with 0 count
3. Error case: Analytics service down - should show cached data with warning

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 25.2: Analyze Workflow Performance Metrics
**As a** operations manager
**I want to** see workflow performance metrics
**So that** I can identify bottlenecks and optimization opportunities

**Acceptance Criteria:**
- [ ] Given I view performance, when I select a workflow, then I see avg execution time
- [ ] Given I view breakdown, when I check steps, then I see time spent per step
- [ ] Given I identify slow steps, when I click on one, then I see detailed timing logs
- [ ] Given I compare periods, when I select two ranges, then I see performance changes
- [ ] Given I set thresholds, when exceeded, then slow workflows are flagged

**Test Scenarios:**
1. Happy path: Identify "Send Email" step taking 80% of workflow time
2. Edge case: Workflow with variable execution time - show min/max/avg/p95
3. Error case: Performance data missing for some executions - show partial data

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 25.3: Track User Activity Analytics
**As a** product manager
**I want to** see how users interact with the platform
**So that** I can understand engagement and improve UX

**Acceptance Criteria:**
- [ ] Given I view user analytics, when page loads, then I see active users over time
- [ ] Given I view engagement, when I check metrics, then I see session duration and page views
- [ ] Given I need segmentation, when I filter by user type, then data updates accordingly
- [ ] Given I view feature usage, when I check adoption, then I see feature engagement rates
- [ ] Given I export data, when I click export, then I receive analytics as CSV

**Test Scenarios:**
1. Happy path: View daily active users trending up 15% month-over-month
2. Edge case: User with ad blocker - should track via server-side events
3. Error case: Analytics cookies disabled - should gracefully degrade

**Priority:** P2
**Estimated Complexity:** Medium

---

### Story 25.4: View Cost Analytics
**As a** finance manager
**I want to** see cost breakdown for platform usage
**So that** I can manage and forecast expenses

**Acceptance Criteria:**
- [ ] Given I view cost analytics, when page loads, then I see total spend and breakdown
- [ ] Given I view by category, when I check breakdown, then I see costs by workflow/AI/API
- [ ] Given I compare months, when I select range, then I see cost trends over time
- [ ] Given I set budget, when threshold approached, then I receive alert
- [ ] Given I forecast costs, when I view projection, then I see estimated future spend

**Test Scenarios:**
1. Happy path: View $500/month spend with 60% on AI, 30% on executions, 10% on storage
2. Edge case: Spike in costs mid-month - should alert and show cause
3. Error case: Billing data delayed - should show last known with estimated current

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 25.5: Export Reports
**As a** business analyst
**I want to** export analytics reports in various formats
**So that** I can share insights and perform offline analysis

**Acceptance Criteria:**
- [ ] Given I view any report, when I click export, then I see format options
- [ ] Given I select CSV, when I export, then I receive properly formatted CSV file
- [ ] Given I select PDF, when I export, then I receive formatted PDF report
- [ ] Given I schedule exports, when I set recurring, then reports are emailed automatically
- [ ] Given I need custom reports, when I configure, then I can select specific metrics

**Test Scenarios:**
1. Happy path: Export monthly execution report as PDF for stakeholder meeting
2. Edge case: Large report with 100,000+ rows - should handle or warn about limits
3. Error case: PDF generation fails - should offer CSV as fallback

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 25.6: Create Custom Dashboards
**As a** power user
**I want to** create custom analytics dashboards
**So that** I can monitor the metrics that matter most to me

**Acceptance Criteria:**
- [ ] Given I want a custom dashboard, when I click create, then I see widget selection
- [ ] Given I add widgets, when I drag and drop, then layout is customizable
- [ ] Given I configure widget, when I set data source, then widget displays that data
- [ ] Given I save dashboard, when I return later, then my configuration is preserved
- [ ] Given I share dashboard, when I send link, then recipients can view (not edit)

**Test Scenarios:**
1. Happy path: Create "Executive Summary" dashboard with 4 key metrics
2. Edge case: Widget with slow data source - should load independently
3. Error case: Widget configuration invalid - should show error in that widget only

**Priority:** P2
**Estimated Complexity:** High

---

### Story 25.7: Set Up Automated Alerts
**As an** operations manager
**I want to** receive alerts when metrics exceed thresholds
**So that** I can respond quickly to issues

**Acceptance Criteria:**
- [ ] Given I configure alerts, when I set metric and threshold, then alert is created
- [ ] Given threshold exceeded, when condition met, then I receive notification
- [ ] Given I set notification channel, when alert triggers, then it goes to that channel
- [ ] Given I view alert history, when I check logs, then I see past triggers and status
- [ ] Given I snooze alert, when I set duration, then alert pauses for that time

**Test Scenarios:**
1. Happy path: Alert when error rate exceeds 5%, receive Slack notification
2. Edge case: Alert threshold hit then immediately recovered - should still notify
3. Error case: Notification channel unavailable - should retry and log failure

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 25.8: View Funnel Analysis
**As a** marketing analyst
**I want to** analyze conversion funnels
**So that** I can optimize user journeys

**Acceptance Criteria:**
- [ ] Given I create a funnel, when I define steps, then funnel is saved
- [ ] Given funnel is active, when I view analysis, then I see conversion rates per step
- [ ] Given I view drop-offs, when I check each step, then I see where users leave
- [ ] Given I compare funnels, when I select multiple, then I see comparative view
- [ ] Given I segment funnel, when I filter by user attributes, then data updates

**Test Scenarios:**
1. Happy path: Signup funnel showing 60% drop-off at payment step
2. Edge case: User completes funnel over multiple sessions - should track correctly
3. Error case: Funnel step event not firing - should show warning for missing data

**Priority:** P2
**Estimated Complexity:** High

---

### Story 25.9: Real-Time Analytics
**As an** operations manager
**I want to** see live analytics as events happen
**So that** I can monitor current activity and respond immediately

**Acceptance Criteria:**
- [ ] Given I view real-time, when I open dashboard, then I see live event stream
- [ ] Given events occur, when they're processed, then they appear within seconds
- [ ] Given I filter live view, when I set criteria, then only matching events show
- [ ] Given I view active users, when I check count, then number updates in real-time
- [ ] Given I need to pause, when I click pause, then stream stops for review

**Test Scenarios:**
1. Happy path: See workflow executions appearing live with <3 second delay
2. Edge case: High volume (100+ events/second) - should aggregate or sample
3. Error case: WebSocket disconnects - should reconnect automatically

**Priority:** P2
**Estimated Complexity:** High

---

### Story 25.10: Analytics Data Retention Management
**As a** compliance officer
**I want to** manage analytics data retention
**So that** I can comply with data retention policies

**Acceptance Criteria:**
- [ ] Given I configure retention, when I set period, then data older than period is deleted
- [ ] Given retention runs, when deletion occurs, then I receive confirmation
- [ ] Given I need to keep data, when I set exception, then specific data is preserved
- [ ] Given I export before deletion, when I schedule export, then data is saved first
- [ ] Given I audit retention, when I check logs, then I see what was deleted and when

**Test Scenarios:**
1. Happy path: Set 90-day retention, data from 91+ days ago deleted nightly
2. Edge case: Data referenced by active reports - should warn before deletion
3. Error case: Deletion job fails - should retry and alert admin

**Priority:** P2
**Estimated Complexity:** Medium

---

## Feature 26: Authentication System

### Story 26.1: Email/Password Login
**As a** registered user
**I want to** log in with my email and password
**So that** I can access my Bottleneck-Bots account

**Acceptance Criteria:**
- [ ] Given I am on the login page, when I enter valid credentials, then I am logged in
- [ ] Given I enter invalid credentials, when I click login, then I see error message
- [ ] Given I check "Remember me", when I login, then session lasts 30 days
- [ ] Given session expires, when I return to site, then I am redirected to login
- [ ] Given I login successfully, when dashboard loads, then I see my workflows

**Test Scenarios:**
1. Happy path: Enter correct email/password, redirected to dashboard
2. Edge case: Email with unusual TLD (.museum, .company) - should accept
3. Error case: Password field left empty - should show validation error

**Priority:** P0
**Estimated Complexity:** Medium

---

### Story 26.2: Google OAuth Login
**As a** user
**I want to** log in with my Google account
**So that** I can access the platform without creating a new password

**Acceptance Criteria:**
- [ ] Given I am on login page, when I click "Login with Google", then OAuth flow starts
- [ ] Given I authorize in Google, when I return, then I am logged into Bottleneck-Bots
- [ ] Given I'm new user, when I complete OAuth, then account is created automatically
- [ ] Given I'm existing user, when I OAuth, then my accounts are linked
- [ ] Given OAuth fails, when I return, then I see friendly error message

**Test Scenarios:**
1. Happy path: New user signs up via Google, account created with Google email
2. Edge case: User has account with same email - should link accounts
3. Error case: User cancels OAuth flow - should return to login page gracefully

**Priority:** P0
**Estimated Complexity:** Medium

---

### Story 26.3: Password Reset
**As a** user who forgot their password
**I want to** reset my password via email
**So that** I can regain access to my account

**Acceptance Criteria:**
- [ ] Given I click "Forgot Password", when I enter email, then reset link is sent
- [ ] Given I click reset link, when I open it, then I see password reset form
- [ ] Given I enter new password, when I submit, then password is changed
- [ ] Given reset link is expired, when I click it, then I see helpful error message
- [ ] Given password is reset, when I try old password, then login fails

**Test Scenarios:**
1. Happy path: Request reset, receive email within 1 minute, set new password
2. Edge case: Request reset for email that doesn't exist - should show same message (security)
3. Error case: Reset link used twice - should fail on second use

**Priority:** P0
**Estimated Complexity:** Medium

---

### Story 26.4: Email Verification
**As a** new user
**I want to** verify my email address
**So that** I can confirm my account and receive notifications

**Acceptance Criteria:**
- [ ] Given I register, when account is created, then verification email is sent
- [ ] Given I click verification link, when I open it, then my email is verified
- [ ] Given I haven't verified, when I try certain actions, then I'm prompted to verify
- [ ] Given link expired, when I click resend, then new verification email is sent
- [ ] Given I'm verified, when I log in, then no verification prompts appear

**Test Scenarios:**
1. Happy path: New user verifies email within 5 minutes of registration
2. Edge case: Verification link expired after 24 hours - resend works
3. Error case: Email delivery fails - should be able to resend

**Priority:** P0
**Estimated Complexity:** Low

---

### Story 26.5: Failed Login Handling
**As a** security system
**I want to** handle failed login attempts properly
**So that** accounts are protected from brute force attacks

**Acceptance Criteria:**
- [ ] Given 3 failed attempts, when I try again, then I see CAPTCHA challenge
- [ ] Given 5 failed attempts, when I try again, then account is temporarily locked
- [ ] Given account is locked, when I wait 15 minutes, then I can try again
- [ ] Given I'm locked out, when I reset password, then lock is cleared
- [ ] Given suspicious activity, when detected, then user is notified via email

**Test Scenarios:**
1. Happy path: 2 failed attempts then success - no lockout
2. Edge case: Failed attempts from different IPs - should still count towards limit
3. Error case: Lockout mechanism fails - should fail secure (lock rather than allow)

**Priority:** P0
**Estimated Complexity:** Medium

---

### Story 26.6: Multi-Factor Authentication
**As a** security-conscious user
**I want to** enable MFA on my account
**So that** my account has an additional layer of protection

**Acceptance Criteria:**
- [ ] Given I go to security settings, when I enable MFA, then I see setup instructions
- [ ] Given I scan QR code, when I enter verification code, then MFA is enabled
- [ ] Given MFA is enabled, when I login, then I'm prompted for code
- [ ] Given I enter wrong code, when I submit, then I see error and can retry
- [ ] Given I lose device, when I use backup code, then I can access account

**Test Scenarios:**
1. Happy path: Enable TOTP MFA, login successfully with code from authenticator app
2. Edge case: Clock skew on device - should accept codes +/- 30 seconds
3. Error case: All backup codes used - should provide account recovery path

**Priority:** P1
**Estimated Complexity:** High

---

### Story 26.7: Session Management
**As a** user
**I want to** manage my active sessions
**So that** I can see where I'm logged in and logout remotely

**Acceptance Criteria:**
- [ ] Given I go to sessions, when page loads, then I see all active sessions
- [ ] Given I view a session, when I check details, then I see device, location, last activity
- [ ] Given I want to logout, when I click "End Session", then that session is terminated
- [ ] Given I want to logout everywhere, when I click "End All", then all sessions end
- [ ] Given a session ends, when user tries to act, then they're redirected to login

**Test Scenarios:**
1. Happy path: View 3 sessions, end one, 2 remain active
2. Edge case: Current session in list - should not be able to end without logging out
3. Error case: Session termination fails - should retry and show status

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 26.8: Password Requirements Enforcement
**As a** security system
**I want to** enforce strong password requirements
**So that** user accounts are protected with secure passwords

**Acceptance Criteria:**
- [ ] Given I set a password, when it's too short, then I see length requirement error
- [ ] Given I set a password, when it lacks complexity, then I see complexity requirements
- [ ] Given I use a common password, when I submit, then it's rejected
- [ ] Given I reuse an old password, when I try to set it, then it's rejected
- [ ] Given I meet all requirements, when I submit, then password is accepted

**Test Scenarios:**
1. Happy path: Password with 12+ chars, upper, lower, number, symbol accepted
2. Edge case: Password that's technically complex but is known breach password - rejected
3. Error case: Password check service unavailable - should allow with warning

**Priority:** P0
**Estimated Complexity:** Medium

---

### Story 26.9: Account Lockout and Recovery
**As a** locked-out user
**I want to** recover my account through verification
**So that** I can regain access after security lockout

**Acceptance Criteria:**
- [ ] Given my account is locked, when I visit login, then I see lockout message
- [ ] Given I click "Unlock Account", when I verify email, then I receive unlock link
- [ ] Given I click unlock link, when I reset password, then account is unlocked
- [ ] Given account is unlocked, when I login, then I'm prompted to review security
- [ ] Given suspicious lock, when I contact support, then manual review is available

**Test Scenarios:**
1. Happy path: Account locked, user verifies identity, unlocked within 5 minutes
2. Edge case: Email access also compromised - support path available
3. Error case: Unlock link expired - can request new one

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 26.10: Login Activity Notifications
**As a** security-conscious user
**I want to** receive notifications about login activity
**So that** I'm aware of access to my account

**Acceptance Criteria:**
- [ ] Given I login from new device, when login succeeds, then I receive email notification
- [ ] Given I login from new location, when login succeeds, then I receive email notification
- [ ] Given notification settings, when I configure, then I can enable/disable login alerts
- [ ] Given suspicious login, when detected, then notification includes "Not you?" link
- [ ] Given I click "Not you?", when I confirm, then all sessions are terminated

**Test Scenarios:**
1. Happy path: Login from new laptop, receive email with device/location details
2. Edge case: VPN changes location frequently - should not spam with notifications
3. Error case: Email notification fails to send - should log but not block login

**Priority:** P1
**Estimated Complexity:** Medium

---

## Feature 27: User Settings & Preferences

### Story 27.1: Update Profile Information
**As a** user
**I want to** update my profile information
**So that** my account details are current and accurate

**Acceptance Criteria:**
- [ ] Given I go to profile settings, when page loads, then I see current profile info
- [ ] Given I edit my name, when I save, then name is updated across the platform
- [ ] Given I change my email, when I submit, then verification email is sent to new address
- [ ] Given I upload avatar, when I save, then avatar appears in header and comments
- [ ] Given I leave required field empty, when I save, then validation error appears

**Test Scenarios:**
1. Happy path: Update name from "John" to "Jonathan", see change reflected immediately
2. Edge case: Name with unicode characters - should save and display correctly
3. Error case: Upload avatar larger than 5MB - should show size limit error

**Priority:** P1
**Estimated Complexity:** Low

---

### Story 27.2: Change Theme Settings
**As a** user
**I want to** switch between light and dark themes
**So that** I can use the interface comfortably in different environments

**Acceptance Criteria:**
- [ ] Given I go to appearance settings, when I see theme options, then I can select light/dark/system
- [ ] Given I select dark theme, when I apply, then interface immediately switches
- [ ] Given I select "System", when my OS changes theme, then app follows
- [ ] Given I'm on dark theme, when I view workflows, then they're styled appropriately
- [ ] Given I change theme, when I login again, then preference is remembered

**Test Scenarios:**
1. Happy path: Switch to dark theme, all pages render correctly in dark mode
2. Edge case: System theme changes while app is open - should respond
3. Error case: Theme CSS fails to load - should fall back to light theme

**Priority:** P2
**Estimated Complexity:** Low

---

### Story 27.3: Configure Notification Preferences
**As a** user
**I want to** configure my notification preferences
**So that** I only receive the alerts I care about

**Acceptance Criteria:**
- [ ] Given I go to notification settings, when page loads, then I see all notification types
- [ ] Given I toggle a notification, when I save, then that notification is enabled/disabled
- [ ] Given I set email frequency, when I choose digest, then I get bundled notifications
- [ ] Given I enable push notifications, when event occurs, then I get browser push
- [ ] Given I disable all notifications, when I confirm, then I receive no notifications

**Test Scenarios:**
1. Happy path: Disable marketing emails, still receive security alerts
2. Edge case: Daily digest at 9 AM - should respect user's timezone
3. Error case: Push notification permission denied - should show how to enable

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 27.4: Set Default Workflow Settings
**As a** power user
**I want to** set default settings for new workflows
**So that** I don't have to configure the same options repeatedly

**Acceptance Criteria:**
- [ ] Given I go to workflow defaults, when page loads, then I see configurable defaults
- [ ] Given I set error handling default, when I create workflow, then it uses my default
- [ ] Given I set default retry count, when workflow fails, then it retries that many times
- [ ] Given I set default timeout, when actions run, then they timeout per my setting
- [ ] Given I change defaults, when I create new workflow, then new defaults apply

**Test Scenarios:**
1. Happy path: Set 3 retries as default, new workflows have 3 retries configured
2. Edge case: Override default in specific workflow - should take precedence
3. Error case: Invalid default value - should show validation error

**Priority:** P2
**Estimated Complexity:** Low

---

### Story 27.5: Manage Connected Accounts
**As a** user
**I want to** manage third-party accounts connected to my profile
**So that** I can control which services have access

**Acceptance Criteria:**
- [ ] Given I go to connected accounts, when page loads, then I see linked services
- [ ] Given I want to connect Google, when I click connect, then OAuth flow starts
- [ ] Given service is connected, when I click disconnect, then access is revoked
- [ ] Given I view connected account, when I check details, then I see permissions granted
- [ ] Given I connect an account, when I return, then status shows as connected

**Test Scenarios:**
1. Happy path: Connect Google account, see it listed with granted permissions
2. Edge case: Revoke access externally (in Google) - should reflect in Bottleneck-Bots
3. Error case: OAuth flow interrupted - should handle gracefully

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 27.6: Timezone and Locale Settings
**As an** international user
**I want to** set my timezone and language preferences
**So that** dates and content are shown in my local context

**Acceptance Criteria:**
- [ ] Given I go to regional settings, when page loads, then I see timezone dropdown
- [ ] Given I select timezone, when I save, then all dates show in that timezone
- [ ] Given I select language, when I save, then interface language changes
- [ ] Given workflow schedules, when I view times, then they're in my timezone
- [ ] Given I change locale, when I view numbers, then formatting matches locale

**Test Scenarios:**
1. Happy path: Set timezone to Tokyo, scheduled workflow at 9 AM shows JST
2. Edge case: DST transition - should handle spring forward/fall back
3. Error case: Selected language not fully translated - should fall back gracefully

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 27.7: Data Export Request
**As a** user
**I want to** request an export of all my data
**So that** I can have a copy or move to another service

**Acceptance Criteria:**
- [ ] Given I go to privacy settings, when I click "Export Data", then export is initiated
- [ ] Given export is processing, when I check status, then I see progress indicator
- [ ] Given export is complete, when I'm notified, then I can download a zip file
- [ ] Given export file, when I open it, then it contains all my workflows, settings, history
- [ ] Given I request export, when I check, then rate limiting prevents abuse

**Test Scenarios:**
1. Happy path: Request export, receive download link within 24 hours
2. Edge case: Large account with 1000+ workflows - should still complete
3. Error case: Export fails mid-process - should restart from checkpoint

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 27.8: Account Deletion Request
**As a** user
**I want to** request deletion of my account
**So that** I can remove my data from the platform

**Acceptance Criteria:**
- [ ] Given I go to privacy settings, when I click "Delete Account", then I see warning
- [ ] Given I confirm deletion, when I enter password, then deletion is scheduled
- [ ] Given deletion is scheduled, when 7 days pass, then account is permanently deleted
- [ ] Given grace period, when I login and cancel, then account is restored
- [ ] Given account is deleted, when data is purged, then I receive confirmation email

**Test Scenarios:**
1. Happy path: Request deletion, cancel within 7 days, account restored
2. Edge case: User has active subscription - should handle cancellation
3. Error case: Deletion fails due to legal hold - should inform user

**Priority:** P1
**Estimated Complexity:** High

---

### Story 27.9: Keyboard Shortcuts Preferences
**As a** power user
**I want to** customize keyboard shortcuts
**So that** I can work faster with my preferred key bindings

**Acceptance Criteria:**
- [ ] Given I go to keyboard settings, when page loads, then I see all shortcuts
- [ ] Given I want to change a shortcut, when I click and press keys, then new shortcut is set
- [ ] Given I set custom shortcut, when I use it, then the action is triggered
- [ ] Given shortcuts conflict, when I set duplicate, then I'm warned
- [ ] Given I want defaults, when I click "Reset", then shortcuts return to defaults

**Test Scenarios:**
1. Happy path: Change "Save Workflow" from Cmd+S to Cmd+Shift+S
2. Edge case: Shortcut uses function keys - should work if not system reserved
3. Error case: Shortcut already used by browser - should warn user

**Priority:** P2
**Estimated Complexity:** Medium

---

### Story 27.10: Accessibility Preferences
**As a** user with accessibility needs
**I want to** configure accessibility options
**So that** I can use the platform comfortably

**Acceptance Criteria:**
- [ ] Given I go to accessibility settings, when page loads, then I see available options
- [ ] Given I enable high contrast, when I apply, then colors meet WCAG AAA
- [ ] Given I enable reduced motion, when applied, then animations are minimized
- [ ] Given I increase font size, when applied, then text scales appropriately
- [ ] Given I use screen reader, when navigating, then all elements are properly labeled

**Test Scenarios:**
1. Happy path: Enable high contrast mode, all text is clearly readable
2. Edge case: Font size at maximum - layout should not break
3. Error case: Accessibility stylesheet fails to load - should fail gracefully

**Priority:** P1
**Estimated Complexity:** Medium

---

## Feature 28: Onboarding Flow

### Story 28.1: Complete Profile Setup
**As a** new user
**I want to** complete my profile during onboarding
**So that** my account is properly configured from the start

**Acceptance Criteria:**
- [ ] Given I just registered, when dashboard loads, then onboarding modal appears
- [ ] Given I'm in onboarding, when I enter my name, then it's saved to my profile
- [ ] Given I upload avatar, when I proceed, then avatar is visible in header
- [ ] Given I skip optional fields, when I continue, then I can proceed anyway
- [ ] Given I complete profile, when I continue, then I move to next onboarding step

**Test Scenarios:**
1. Happy path: New user completes full profile in under 2 minutes
2. Edge case: User refreshes during onboarding - should resume where left off
3. Error case: Avatar upload fails - should allow retry or skip

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 28.2: Enter Business Information
**As a** new business user
**I want to** provide my business details
**So that** the platform can customize my experience

**Acceptance Criteria:**
- [ ] Given I'm in onboarding, when I reach business step, then I see business form
- [ ] Given I enter company name, when I proceed, then it's saved to my account
- [ ] Given I select industry, when I choose option, then relevant templates are highlighted later
- [ ] Given I select company size, when I proceed, then appropriate plan is suggested
- [ ] Given I'm not a business, when I click "Personal use", then I skip business fields

**Test Scenarios:**
1. Happy path: Enter "Acme Corp", select "Marketing", proceed
2. Edge case: Very long company name - should handle gracefully
3. Error case: Form validation fails - should highlight specific fields

**Priority:** P1
**Estimated Complexity:** Low

---

### Story 28.3: Connect GHL API During Onboarding
**As a** new GHL user
**I want to** connect my GoHighLevel account during setup
**So that** I can immediately start using GHL integrations

**Acceptance Criteria:**
- [ ] Given I'm in onboarding, when I reach integrations step, then GHL is prominently featured
- [ ] Given I click "Connect GHL", when I enter API key, then connection is validated
- [ ] Given connection succeeds, when I proceed, then I see my GHL data summary
- [ ] Given I don't have GHL, when I click "Skip", then I can proceed without connecting
- [ ] Given connection fails, when error occurs, then I see helpful troubleshooting tips

**Test Scenarios:**
1. Happy path: Paste valid API key, see "Connected" status with account details
2. Edge case: API key with extra whitespace - should trim and validate
3. Error case: Invalid API key - show specific error with link to GHL docs

**Priority:** P0
**Estimated Complexity:** Medium

---

### Story 28.4: Set Up Email Integration
**As a** new user
**I want to** connect my email during onboarding
**So that** I can send emails from workflows

**Acceptance Criteria:**
- [ ] Given I'm in onboarding, when I reach email step, then I see email setup options
- [ ] Given I choose built-in, when I configure, then I'm ready to send via platform
- [ ] Given I choose SMTP, when I enter settings, then connection is tested
- [ ] Given test email succeeds, when I proceed, then email is ready for workflows
- [ ] Given I skip email, when I proceed, then I'm warned about limited functionality

**Test Scenarios:**
1. Happy path: Connect Gmail via OAuth, send test email successfully
2. Edge case: Custom SMTP with unusual port - should support non-standard configs
3. Error case: SMTP credentials wrong - show specific error (auth vs connection)

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 28.5: Create First Workflow with Guide
**As a** new user
**I want to** create my first workflow with guided assistance
**So that** I learn how to use the platform effectively

**Acceptance Criteria:**
- [ ] Given I'm in final onboarding step, when I click "Create First Workflow", then guided mode starts
- [ ] Given guided mode is active, when I add first action, then tooltip explains it
- [ ] Given I complete each step, when I proceed, then next guidance appears
- [ ] Given I create trigger and action, when I test, then step-by-step success feedback shown
- [ ] Given I complete workflow, when I save, then celebratory message and next steps shown

**Test Scenarios:**
1. Happy path: Create "Welcome Email" workflow with 3-step guide in under 5 minutes
2. Edge case: User already knows the platform - should allow skipping guide
3. Error case: Guided workflow fails to test - should show helpful recovery steps

**Priority:** P1
**Estimated Complexity:** High

---

### Story 28.6: Select Starter Templates
**As a** new user
**I want to** browse and install starter templates
**So that** I can quickly get value from the platform

**Acceptance Criteria:**
- [ ] Given I'm in onboarding, when I reach templates step, then I see recommended templates
- [ ] Given I select a template, when I click "Use Template", then it's installed
- [ ] Given template requires integration, when I view it, then prerequisites are listed
- [ ] Given I install multiple, when I proceed, then all selected templates are created
- [ ] Given I skip templates, when I proceed, then I can access marketplace later

**Test Scenarios:**
1. Happy path: Install "Lead Capture" and "Welcome Sequence" templates
2. Edge case: Template requires GHL but user skipped connection - should warn
3. Error case: Template installation fails - should show error and retry option

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 28.7: Learn Platform Basics Tour
**As a** new user
**I want to** take an interactive tour of key features
**So that** I understand how to navigate the platform

**Acceptance Criteria:**
- [ ] Given I'm in onboarding, when tour starts, then I see first highlight
- [ ] Given I view a feature, when I click next, then next feature is highlighted
- [ ] Given tour is active, when I click outside highlight, then I can still interact
- [ ] Given I complete tour, when finished, then I see completion checkmark
- [ ] Given I want to exit, when I click "Skip Tour", then I can exit at any point

**Test Scenarios:**
1. Happy path: Complete 8-step tour covering main navigation and features
2. Edge case: User resizes window during tour - highlights should reposition
3. Error case: Tour target element not found - should skip that step gracefully

**Priority:** P2
**Estimated Complexity:** Medium

---

### Story 28.8: Set Initial Goals
**As a** new user
**I want to** specify my goals for using the platform
**So that** my experience is personalized

**Acceptance Criteria:**
- [ ] Given I'm in onboarding, when I reach goals step, then I see goal options
- [ ] Given I select goals, when I click options, then they're highlighted
- [ ] Given I select "Save Time", when I proceed, then automation templates are recommended
- [ ] Given I select "Increase Sales", when I proceed, then marketing templates are recommended
- [ ] Given I select multiple goals, when I proceed, then diverse templates are shown

**Test Scenarios:**
1. Happy path: Select "Automate Lead Follow-up", see relevant templates
2. Edge case: All goals selected - should show balanced recommendations
3. Error case: No goals selected - should allow proceeding with default recommendations

**Priority:** P2
**Estimated Complexity:** Low

---

### Story 28.9: Invite Team Members
**As a** team admin
**I want to** invite team members during onboarding
**So that** my team can collaborate from day one

**Acceptance Criteria:**
- [ ] Given I'm in onboarding, when I reach team step, then I see invite form
- [ ] Given I enter emails, when I click invite, then invitations are sent
- [ ] Given invite is sent, when teammate clicks link, then they can join my team
- [ ] Given I'm on free plan, when I try to invite, then I see upgrade prompt
- [ ] Given I skip invites, when I proceed, then I can invite later from settings

**Test Scenarios:**
1. Happy path: Invite 3 team members, all receive emails within 1 minute
2. Edge case: Invite email that's already a user - should handle gracefully
3. Error case: Email delivery fails - should show which invites failed

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 28.10: Onboarding Progress and Skip
**As a** new user
**I want to** see my onboarding progress and skip if needed
**So that** I understand how far along I am and can move faster if I wish

**Acceptance Criteria:**
- [ ] Given I'm in onboarding, when I view header, then I see progress indicator
- [ ] Given progress indicator, when I view it, then current step is highlighted
- [ ] Given I click "Skip Onboarding", when I confirm, then I go directly to dashboard
- [ ] Given I skipped, when I go to help, then I can access onboarding again
- [ ] Given I complete all steps, when finished, then progress shows 100% complete

**Test Scenarios:**
1. Happy path: Complete 5 of 7 steps, progress bar shows ~70%
2. Edge case: Skip onboarding then restart - should resume from beginning
3. Error case: Progress fails to save - should not block user from proceeding

**Priority:** P1
**Estimated Complexity:** Low

---

## Feature 29: Marketplace

### Story 29.1: Browse Template Marketplace
**As a** user
**I want to** browse available workflow templates
**So that** I can find pre-built solutions for my needs

**Acceptance Criteria:**
- [ ] Given I navigate to marketplace, when page loads, then I see template grid
- [ ] Given templates are displayed, when I view them, then I see name, description, and rating
- [ ] Given I want to filter, when I select category, then only matching templates show
- [ ] Given I search, when I enter keywords, then relevant templates are displayed
- [ ] Given I sort by popularity, when I apply sort, then most-installed appear first

**Test Scenarios:**
1. Happy path: Browse marketing category, find 20+ templates
2. Edge case: Category with 500+ templates - pagination works correctly
3. Error case: Marketplace API slow - should show loading state

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 29.2: View Template Details
**As a** user
**I want to** see detailed information about a template
**So that** I can decide if it meets my needs

**Acceptance Criteria:**
- [ ] Given I click on a template, when detail page loads, then I see full description
- [ ] Given I view details, when I scroll, then I see workflow preview/diagram
- [ ] Given I check requirements, when I view them, then I see needed integrations
- [ ] Given I read reviews, when I scroll to reviews, then I see ratings and comments
- [ ] Given I view creator, when I check, then I see publisher info and other templates

**Test Scenarios:**
1. Happy path: View "Lead Nurture Sequence" with 4.8 rating and 50 reviews
2. Edge case: Template with no reviews yet - should show "No reviews" gracefully
3. Error case: Template preview image fails to load - should show placeholder

**Priority:** P1
**Estimated Complexity:** Low

---

### Story 29.3: Install Template to Account
**As a** user
**I want to** install a marketplace template
**So that** I can use it in my workflows

**Acceptance Criteria:**
- [ ] Given I'm on template detail, when I click "Install", then installation starts
- [ ] Given template has prerequisites, when I lack them, then I see what's needed
- [ ] Given installation completes, when I'm notified, then I can view the workflow
- [ ] Given template is already installed, when I view it, then button shows "Installed"
- [ ] Given I install, when complete, then workflow appears in my workflows list

**Test Scenarios:**
1. Happy path: Install free template, appears in my workflows in under 5 seconds
2. Edge case: Template requires Pro plan - should show upgrade prompt
3. Error case: Installation fails - should show error and retry option

**Priority:** P0
**Estimated Complexity:** Medium

---

### Story 29.4: Rate and Review Templates
**As a** user who installed a template
**I want to** rate and review it
**So that** I can help others make decisions

**Acceptance Criteria:**
- [ ] Given I installed a template, when I visit it, then I see "Rate This Template"
- [ ] Given I click to rate, when I select stars, then my rating is recorded
- [ ] Given I write review, when I submit, then review appears on template page
- [ ] Given I want to update, when I edit review, then changes are saved
- [ ] Given I haven't installed, when I try to review, then I'm told I need to install first

**Test Scenarios:**
1. Happy path: Rate 5 stars, write "Great template!", see it on page
2. Edge case: Change rating from 4 to 5 stars - should update aggregate correctly
3. Error case: Review contains inappropriate content - should be moderated

**Priority:** P2
**Estimated Complexity:** Medium

---

### Story 29.5: Share Own Templates
**As a** workflow creator
**I want to** publish my workflows to the marketplace
**So that** others can benefit from my work

**Acceptance Criteria:**
- [ ] Given I have a workflow, when I click "Share to Marketplace", then I see publish form
- [ ] Given I fill form, when I provide description and tags, then submission is created
- [ ] Given I submit, when moderation completes, then template appears in marketplace
- [ ] Given template is published, when users install, then I see installation count
- [ ] Given I update workflow, when I sync, then marketplace version is updated

**Test Scenarios:**
1. Happy path: Publish template, approved within 24 hours, appears in marketplace
2. Edge case: Template contains sensitive variables - should warn about what's shared
3. Error case: Template rejected by moderation - should receive feedback on why

**Priority:** P2
**Estimated Complexity:** High

---

### Story 29.6: Manage Installed Templates
**As a** user
**I want to** see and manage templates I've installed
**So that** I can keep track of what I'm using

**Acceptance Criteria:**
- [ ] Given I go to installed templates, when page loads, then I see list of my installations
- [ ] Given I view installed template, when I check, then I see if updates are available
- [ ] Given update is available, when I click update, then workflow is updated
- [ ] Given I want to uninstall, when I click uninstall, then template is removed
- [ ] Given I uninstall, when confirmed, then I'm warned workflow will be deleted

**Test Scenarios:**
1. Happy path: View 5 installed templates, 1 has available update
2. Edge case: Update changes workflow significantly - should show changelog
3. Error case: Update fails - should keep old version intact

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 29.7: Filter by Integration Requirements
**As a** user
**I want to** filter templates by required integrations
**So that** I find templates compatible with my setup

**Acceptance Criteria:**
- [ ] Given I'm in marketplace, when I click filters, then I see integration filter
- [ ] Given I select "GoHighLevel", when I apply, then only GHL templates show
- [ ] Given I select multiple integrations, when applied, then templates matching any show
- [ ] Given I have connected integrations, when I filter "My Integrations", then compatible show
- [ ] Given no matches, when filter applied, then I see empty state with suggestions

**Test Scenarios:**
1. Happy path: Filter for GHL templates, see 50+ results
2. Edge case: Filter for rare integration - may show few or no results
3. Error case: User's integration list fails to load - should allow manual selection

**Priority:** P2
**Estimated Complexity:** Low

---

### Story 29.8: Premium Templates and Purchases
**As a** user
**I want to** purchase premium templates
**So that** I can access advanced pre-built solutions

**Acceptance Criteria:**
- [ ] Given I view premium template, when I see price, then purchase button is available
- [ ] Given I click purchase, when I enter payment, then transaction processes
- [ ] Given purchase completes, when confirmed, then template is added to my account
- [ ] Given I purchased, when I view template, then it shows "Purchased"
- [ ] Given I have questions, when I view details, then I see refund policy

**Test Scenarios:**
1. Happy path: Purchase $29 template with card, installed immediately
2. Edge case: Card declined - should show helpful message and retry option
3. Error case: Purchase succeeds but installation fails - should have support path

**Priority:** P2
**Estimated Complexity:** High

---

### Story 29.9: Template Collections and Bundles
**As a** user
**I want to** discover curated template collections
**So that** I can get started with comprehensive solutions

**Acceptance Criteria:**
- [ ] Given I'm in marketplace, when I view collections, then I see curated bundles
- [ ] Given I click collection, when detail loads, then I see all included templates
- [ ] Given collection has discount, when I purchase bundle, then I save vs. individual
- [ ] Given I install collection, when complete, then all templates are installed
- [ ] Given some templates need upgrades, when I view, then requirements are clear

**Test Scenarios:**
1. Happy path: Install "Starter Pack" collection with 5 templates
2. Edge case: Already own some templates in bundle - price should reflect
3. Error case: One template in bundle fails to install - should install others

**Priority:** P2
**Estimated Complexity:** Medium

---

### Story 29.10: Template Version History
**As a** user
**I want to** see template version history and changelogs
**So that** I understand what changed between updates

**Acceptance Criteria:**
- [ ] Given I view installed template, when I check versions, then I see version history
- [ ] Given I view version, when I click it, then I see changelog for that version
- [ ] Given I'm on older version, when update available, then I can see what will change
- [ ] Given I need old version, when I check, then I can see if rollback is possible
- [ ] Given breaking change, when I view changelog, then it's clearly marked

**Test Scenarios:**
1. Happy path: View v2.0 changelog showing "Added email step, improved performance"
2. Edge case: Version history very long - should paginate or collapse
3. Error case: Changelog missing for a version - should show "No notes available"

**Priority:** P2
**Estimated Complexity:** Low

---

## Feature 30: Asset Manager

### Story 30.1: Upload Images
**As a** user
**I want to** upload images to my asset library
**So that** I can use them in emails and workflows

**Acceptance Criteria:**
- [ ] Given I'm in asset manager, when I click upload, then file picker opens
- [ ] Given I select images, when I click open, then upload starts
- [ ] Given upload is processing, when I watch, then I see progress indicator
- [ ] Given upload completes, when finished, then image appears in library
- [ ] Given I upload invalid file, when rejected, then I see helpful error message

**Test Scenarios:**
1. Happy path: Upload 5MB JPG, appears in library within 10 seconds
2. Edge case: Upload animated GIF - should preserve animation
3. Error case: Upload 20MB file (over limit) - should show clear size limit

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 30.2: Organize Assets in Folders
**As a** user with many assets
**I want to** organize assets into folders
**So that** I can find what I need quickly

**Acceptance Criteria:**
- [ ] Given I'm in asset manager, when I click "New Folder", then folder is created
- [ ] Given I have folders, when I drag assets, then they move to target folder
- [ ] Given I'm in a folder, when I view contents, then only that folder's assets show
- [ ] Given I create nested folders, when I navigate, then breadcrumb shows path
- [ ] Given I delete folder, when confirmed, then assets move to parent or trash

**Test Scenarios:**
1. Happy path: Create "Campaign 2024" folder, move 10 images into it
2. Edge case: Folder name with special characters - should handle appropriately
3. Error case: Try to move folder into itself - should prevent with error

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 30.3: Get Asset URLs for Use
**As a** user
**I want to** copy asset URLs for use in workflows
**So that** I can reference images in emails and content

**Acceptance Criteria:**
- [ ] Given I view an asset, when I click "Copy URL", then URL is copied to clipboard
- [ ] Given URL is copied, when I paste it, then correct URL is pasted
- [ ] Given I use URL in workflow, when workflow runs, then image loads correctly
- [ ] Given I'm in workflow builder, when I insert image, then I can browse assets
- [ ] Given I select asset, when I insert, then URL is automatically added

**Test Scenarios:**
1. Happy path: Copy URL, paste in email template, image displays correctly
2. Edge case: Asset renamed - URL should still work (or redirect)
3. Error case: Asset deleted after URL copied - should handle gracefully in workflow

**Priority:** P0
**Estimated Complexity:** Low

---

### Story 30.4: Delete Assets
**As a** user
**I want to** delete assets I no longer need
**So that** I can keep my library organized and stay within limits

**Acceptance Criteria:**
- [ ] Given I select assets, when I click delete, then confirmation appears
- [ ] Given I confirm, when deletion completes, then assets are removed
- [ ] Given asset is in use, when I try to delete, then I'm warned about dependencies
- [ ] Given I force delete used asset, when confirmed, then workflows show broken image
- [ ] Given I select multiple, when I delete, then all selected are removed

**Test Scenarios:**
1. Happy path: Delete unused image, removed from library immediately
2. Edge case: Asset used in 10 workflows - should list all uses in warning
3. Error case: Deletion fails - should show error and keep asset

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 30.5: Bulk Upload Operations
**As a** user with many assets
**I want to** upload multiple files at once
**So that** I can efficiently add many assets

**Acceptance Criteria:**
- [ ] Given I click upload, when I select multiple files, then all are queued
- [ ] Given files are queued, when I view progress, then I see status of each
- [ ] Given one file fails, when others succeed, then failed one is highlighted
- [ ] Given I drag folder, when I drop, then all files in folder are uploaded
- [ ] Given upload completes, when done, then I see summary of results

**Test Scenarios:**
1. Happy path: Select 20 images, all upload successfully
2. Edge case: 100 files selected - should queue and process efficiently
3. Error case: 5 of 20 files too large - should upload 15, report 5 failures

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 30.6: Image Optimization
**As a** user
**I want to** have my images automatically optimized
**So that** they load quickly in emails without manual work

**Acceptance Criteria:**
- [ ] Given I upload an image, when processed, then it's optimized for web
- [ ] Given I view optimized image, when I check, then quality is acceptable
- [ ] Given I need original, when I download, then I can get unoptimized version
- [ ] Given I configure settings, when I set quality level, then optimization adjusts
- [ ] Given image is optimized, when I view size, then I see reduction percentage

**Test Scenarios:**
1. Happy path: Upload 3MB image, optimized to 500KB without visible quality loss
2. Edge case: Already optimized image - should not degrade further
3. Error case: Optimization service fails - should keep original, warn user

**Priority:** P2
**Estimated Complexity:** Medium

---

### Story 30.7: Asset Search
**As a** user with many assets
**I want to** search my asset library
**So that** I can find specific images quickly

**Acceptance Criteria:**
- [ ] Given I'm in asset manager, when I type in search, then results filter live
- [ ] Given I search by filename, when I enter term, then matching files show
- [ ] Given I have tags, when I search by tag, then tagged assets show
- [ ] Given no results, when I search, then I see helpful empty state
- [ ] Given I clear search, when I delete text, then all assets show again

**Test Scenarios:**
1. Happy path: Search "logo", find 3 logo variants
2. Edge case: Search term matches folder name - should show folder contents
3. Error case: Search with special regex characters - should escape properly

**Priority:** P1
**Estimated Complexity:** Low

---

### Story 30.8: Asset Tagging
**As a** user
**I want to** tag my assets with keywords
**So that** I can organize and find them more easily

**Acceptance Criteria:**
- [ ] Given I view an asset, when I click "Add Tag", then tag input appears
- [ ] Given I enter tag, when I press enter, then tag is added to asset
- [ ] Given I have existing tags, when I type, then autocomplete suggests
- [ ] Given I click a tag, when viewing assets, then I see all assets with that tag
- [ ] Given I remove a tag, when I click X on tag, then it's removed from asset

**Test Scenarios:**
1. Happy path: Add "hero", "homepage", "2024" tags to banner image
2. Edge case: Tag with spaces or special characters - should handle or restrict
3. Error case: Try to add duplicate tag - should prevent silently

**Priority:** P2
**Estimated Complexity:** Low

---

### Story 30.9: Asset Usage Tracking
**As a** user
**I want to** see where my assets are being used
**So that** I can understand dependencies before modifying

**Acceptance Criteria:**
- [ ] Given I view an asset, when I click "Usage", then I see where it's used
- [ ] Given I see usage list, when I view entries, then I see workflow/email names
- [ ] Given I click usage entry, when I navigate, then I go to that location
- [ ] Given asset is unused, when I check usage, then it shows "Not in use"
- [ ] Given asset is heavily used, when I view, then pagination handles many uses

**Test Scenarios:**
1. Happy path: Logo used in 15 emails - see all listed with links
2. Edge case: Asset used in deleted workflow - should not appear
3. Error case: Usage data stale - should refresh on request

**Priority:** P1
**Estimated Complexity:** Medium

---

### Story 30.10: Asset Storage Quota Management
**As a** user
**I want to** see my storage usage and limits
**So that** I can manage my assets within my plan

**Acceptance Criteria:**
- [ ] Given I'm in asset manager, when I view quota, then I see used vs. available
- [ ] Given I'm near limit, when I upload, then I see warning about remaining space
- [ ] Given I exceed limit, when I try upload, then I see upgrade prompt
- [ ] Given I delete assets, when I check quota, then available space increases
- [ ] Given I want more space, when I click upgrade, then I see plan options

**Test Scenarios:**
1. Happy path: Using 800MB of 1GB, usage bar shows 80% with warning at 90%
2. Edge case: Exactly at limit - should prevent new uploads with clear message
3. Error case: Quota calculation wrong - should have way to refresh/recalculate

**Priority:** P1
**Estimated Complexity:** Medium

---

# Appendix: Story Priority Matrix

## P0 - Critical Path (Must Have for MVP)

| Feature | Stories |
|---------|---------|
| GoHighLevel Integration | 21.1, 21.2, 21.4, 21.8 |
| Async Task Queue | 22.3 |
| Admin Dashboard | 23.1, 23.6, 23.7 |
| API Key Management | 24.1, 24.3, 24.4 |
| Authentication | 26.1, 26.2, 26.3, 26.4, 26.5, 26.8 |
| Marketplace | 29.3 |
| Asset Manager | 30.3 |

## P1 - High Priority (Important for Launch)

| Feature | Stories |
|---------|---------|
| GoHighLevel Integration | 21.3, 21.5, 21.6, 21.7, 21.9, 21.10 |
| Async Task Queue | 22.1, 22.2, 22.4, 22.5, 22.8, 22.9 |
| Admin Dashboard | 23.2, 23.3, 23.4, 23.8, 23.9, 23.10 |
| API Key Management | 24.2, 24.5, 24.6 |
| Analytics & Reporting | 25.1, 25.2, 25.4, 25.5, 25.7 |
| Authentication | 26.6, 26.7, 26.9, 26.10 |
| User Settings | 27.3, 27.5, 27.6, 27.7, 27.8, 27.10 |
| Onboarding | 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.9, 28.10 |
| Marketplace | 29.1, 29.2, 29.6 |
| Asset Manager | 30.1, 30.2, 30.4, 30.5, 30.7, 30.9, 30.10 |

## P2 - Medium Priority (Post-Launch Enhancements)

| Feature | Stories |
|---------|---------|
| Async Task Queue | 22.6, 22.7, 22.10 |
| Admin Dashboard | 23.5 |
| API Key Management | 24.7, 24.8, 24.9, 24.10 |
| Analytics & Reporting | 25.3, 25.6, 25.8, 25.9, 25.10 |
| User Settings | 27.1, 27.2, 27.4, 27.9 |
| Onboarding | 28.7, 28.8 |
| Marketplace | 29.4, 29.5, 29.7, 29.8, 29.9, 29.10 |
| Asset Manager | 30.6, 30.8 |

---

# Summary Statistics

- **Total Features:** 10
- **Total User Stories:** 100
- **P0 Stories:** 22
- **P1 Stories:** 56
- **P2 Stories:** 22

Each story includes complete acceptance criteria with Given/When/Then format, three test scenarios (happy path, edge case, error case), priority designation, and complexity estimate for accurate sprint planning.
