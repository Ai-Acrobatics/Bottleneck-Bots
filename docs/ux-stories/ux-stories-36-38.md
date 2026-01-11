# User Experience Stories: Features 36-38

**Document Version:** 1.0
**Status:** Ready for QA Testing
**Created:** 2026-01-11
**Last Updated:** 2026-01-11

This document contains detailed User Experience (UX) stories for testing and validation of Bottleneck-Bots features 36-38: Background Jobs, Image Generation, and GoHighLevel Integration. Each story is designed to be actionable for QA testing with specific test data requirements and edge cases.

---

## Table of Contents

1. [Feature 36: Background Jobs](#feature-36-background-jobs)
2. [Feature 37: Image Generation](#feature-37-image-generation)
3. [Feature 38: GoHighLevel Integration](#feature-38-gohighlevel-integration)

---

# Feature 36: Background Jobs

## Overview
The Background Jobs system enables asynchronous processing of time-intensive operations including email synchronization, email draft generation, voice call scheduling, and scheduled task execution. The system implements robust retry mechanisms with exponential backoff and comprehensive job status tracking.

---

### UX-36-001: Email Sync Job - Initial Mailbox Synchronization

| Field | Value |
|-------|-------|
| **Story ID** | UX-36-001 |
| **Title** | User initiates initial email mailbox synchronization |
| **User Persona** | Agency Owner (Sarah, managing 5 client accounts, connecting Gmail for the first time) |

**Preconditions:**
- User is authenticated and logged in
- User has connected their Gmail account via OAuth
- User has granted necessary email permissions (read, modify)
- Background jobs service is operational

**User Journey:**
1. User navigates to Email Integration settings
2. User clicks "Sync Mailbox" button on newly connected Gmail account
3. System displays confirmation modal: "This will sync your last 30 days of emails. This may take several minutes."
4. User confirms by clicking "Start Sync"
5. Button changes to "Syncing..." with spinner
6. Progress indicator appears: "Syncing emails: 0 of ~2,500 estimated"
7. User navigates away to dashboard
8. Notification badge appears on Email icon showing sync in progress
9. After 5 minutes, user clicks notification: "Email sync complete: 2,347 emails imported"
10. User opens email inbox to verify emails are accessible

**Expected Behavior:**
- Sync initiates within 2 seconds of confirmation
- Progress updates every 10 seconds minimum
- User can navigate away without interrupting sync
- Notification appears upon completion or failure
- Duplicate emails are detected and skipped
- Email threads are properly linked

**Success Criteria:**
- [ ] Initial sync completes within 10 minutes for 5,000 emails
- [ ] Progress indicator shows realistic estimates
- [ ] Sync continues when user navigates away
- [ ] Completion notification appears within 30 seconds of finish
- [ ] All emails are accessible in the inbox view
- [ ] Email threads maintain proper threading
- [ ] Attachments are indexed but not downloaded until opened

**Edge Cases:**
1. OAuth token expires mid-sync (pause, request re-auth, resume)
2. User has 50,000+ emails (show warning, offer date range filter)
3. Mailbox contains emails with 50MB+ attachments (skip attachment, flag for manual download)
4. Network interruption during sync (retry with exponential backoff)
5. User initiates second sync while first is running (queue or reject with message)
6. Gmail API rate limit hit (pause, backoff, resume automatically)
7. User revokes OAuth permission mid-sync (fail gracefully with clear message)

**Test Data Requirements:**
- Gmail account with 2,000-5,000 emails
- Gmail account with 50,000+ emails (stress test)
- Emails with various attachment sizes (1MB, 10MB, 50MB)
- Email threads with 20+ replies
- Emails in multiple folders/labels
- Emails with embedded images

---

### UX-36-002: Email Sync Job - Incremental Synchronization

| Field | Value |
|-------|-------|
| **Story ID** | UX-36-002 |
| **Title** | System performs automatic incremental email sync |
| **User Persona** | Sales Manager (Mike, checks email dashboard multiple times daily) |

**Preconditions:**
- User has completed initial email sync
- Incremental sync is enabled (default: every 5 minutes)
- User has received 15 new emails since last sync

**User Journey:**
1. Mike opens the Email Dashboard at 9:00 AM
2. Last sync timestamp shows "Last synced: 8:57 AM"
3. System automatically triggers incremental sync
4. Subtle indicator appears: small spinner next to "Last synced"
5. After 8 seconds, 15 new emails appear at top of inbox
6. "Last synced: 9:00 AM" updates
7. No disruptive notification (sync is seamless)
8. Mike continues working, sync happens again at 9:05 AM automatically

**Expected Behavior:**
- Incremental sync takes < 30 seconds for 100 new emails
- New emails appear without full page refresh
- Sync is non-blocking and does not interrupt user actions
- Deleted emails on server are reflected locally
- Read/unread status syncs bidirectionally

**Success Criteria:**
- [ ] Incremental sync completes in < 30 seconds
- [ ] New emails appear in correct chronological position
- [ ] No duplicate emails created
- [ ] Sync interval is configurable (1, 5, 15, 30 minutes)
- [ ] Sync pauses when user is composing an email (to prevent focus loss)
- [ ] Failed syncs retry automatically with backoff

**Edge Cases:**
1. User receives 500+ emails between syncs (batch processing)
2. Email is deleted on server between syncs (mark as deleted locally)
3. Email is moved to trash on server (sync folder move)
4. User is offline when sync triggers (queue until online)
5. Sync conflicts with user action (defer sync until action complete)
6. Server returns different email count than expected (reconciliation)

**Test Data Requirements:**
- Active email account receiving 5-10 emails per minute (test throughput)
- Emails being moved between folders during sync
- Emails being deleted during sync
- Account with sync set to 1-minute intervals

---

### UX-36-003: Email Draft Job - AI-Powered Draft Generation

| Field | Value |
|-------|-------|
| **Story ID** | UX-36-003 |
| **Title** | User requests AI-generated email draft via background job |
| **User Persona** | Marketing Coordinator (Lisa, creating outreach emails for 50 leads) |

**Preconditions:**
- User has AI model configured (Claude or GPT-4)
- User has a lead list with 50 contacts
- Email template includes personalization variables
- Sufficient API credits for generation

**User Journey:**
1. Lisa selects 50 leads from her list
2. She clicks "Generate Drafts" button
3. Template selection modal opens
4. She selects "Cold Outreach - Software Demo" template
5. Preview shows template with {{firstName}}, {{company}}, {{painPoint}} variables
6. She clicks "Generate 50 Drafts"
7. System shows: "Draft generation queued. You'll be notified when complete."
8. Job status widget appears in sidebar: "Generating drafts: 0/50"
9. Lisa continues other work
10. Progress updates: "12/50", "28/50", "45/50"
11. Notification: "Draft generation complete: 48 successful, 2 failed"
12. Lisa clicks notification, sees draft inbox with generated emails
13. She reviews drafts, edits as needed, and queues for sending

**Expected Behavior:**
- Each draft is uniquely personalized
- Failed drafts show specific error (missing variable, AI error, etc.)
- Drafts are saveable and editable
- Generation respects API rate limits
- Progress is persisted if user refreshes page

**Success Criteria:**
- [ ] 50 drafts generated in < 5 minutes
- [ ] Each draft contains correctly substituted variables
- [ ] AI generates contextually appropriate content
- [ ] Failed drafts are clearly marked with reason
- [ ] Drafts can be individually reviewed and edited
- [ ] Drafts support "Regenerate" action
- [ ] Generation history shows all batch operations

**Edge Cases:**
1. Lead missing required variable (generate with placeholder, flag for review)
2. AI returns inappropriate content (content filter catches and flags)
3. API rate limit hit mid-batch (pause, backoff, continue)
4. User cancels mid-generation (complete in-progress, stop queue)
5. Template has syntax error (fail job with clear error message)
6. Duplicate leads in selection (skip duplicates, note in summary)
7. Credit balance runs out mid-batch (pause, notify, allow purchase and resume)

**Test Data Requirements:**
- 50 leads with complete profile data
- 10 leads with missing required fields
- Lead with special characters in name
- Email template with 5+ personalization variables
- Template with invalid variable syntax
- Account with limited credits (< 50)

---

### UX-36-004: Voice Call Job - Scheduled Outbound Calls

| Field | Value |
|-------|-------|
| **Story ID** | UX-36-004 |
| **Title** | User schedules batch of outbound AI voice calls |
| **User Persona** | Sales Director (James, scheduling 20 follow-up calls for his team) |

**Preconditions:**
- User has Vapi.ai voice integration configured
- User has a list of 20 leads with valid phone numbers
- Voice script template is selected
- Calling hours are configured (9 AM - 5 PM recipient's timezone)

**User Journey:**
1. James selects 20 leads from the "Hot Prospects" list
2. He clicks "Schedule Voice Calls"
3. Scheduling modal opens with options
4. He selects voice script: "Follow-Up Demo Request"
5. He sets scheduling: "Spread over 2 hours, starting now"
6. He enables "Respect timezone" (calls during recipient's business hours)
7. He clicks "Schedule Calls"
8. System validates phone numbers: "18 valid, 2 invalid"
9. He proceeds with 18 valid numbers
10. Dashboard shows: "18 calls scheduled, starting in 2 minutes"
11. First call initiates, James can monitor in real-time
12. Call status updates: "Connected", "In Progress", "Completed"
13. After 2 hours, summary: "15 completed, 2 voicemail, 1 no answer"
14. James reviews call recordings and transcripts

**Expected Behavior:**
- Calls are distributed to avoid overwhelming recipients
- Timezone detection works for US/international numbers
- Call status updates in real-time via SSE
- Recordings are automatically saved and transcribed
- Failed calls are automatically retried (configurable)

**Success Criteria:**
- [ ] Phone number validation is accurate
- [ ] Calls initiate at scheduled times (+/- 30 seconds)
- [ ] Real-time status updates appear within 2 seconds
- [ ] Recordings are available within 1 minute of call end
- [ ] Transcripts are generated within 5 minutes
- [ ] Voicemail detection works correctly
- [ ] Call outcomes are logged with duration and result

**Edge Cases:**
1. Recipient's phone is busy (retry in 15 minutes)
2. Call goes to voicemail (leave AI voicemail if enabled)
3. Recipient requests callback (log and create follow-up task)
4. Call exceeds max duration (end call with closing script)
5. Vapi API is down (queue calls, retry when available)
6. User cancels scheduled calls (cancel pending, cannot cancel in-progress)
7. Recipient is in Do Not Call list (skip with compliance note)
8. International call fails due to carrier restriction (log error, notify)

**Test Data Requirements:**
- 20 leads with valid US phone numbers
- 5 leads with international numbers
- 2 leads with invalid phone formats
- Voice script with dynamic content
- Account with Vapi.ai test credentials
- Leads in different US timezones

---

### UX-36-005: Scheduled Task Execution - Cron Job Management

| Field | Value |
|-------|-------|
| **Story ID** | UX-36-005 |
| **Title** | User creates and monitors scheduled automation task |
| **User Persona** | Operations Manager (Rachel, setting up daily report generation) |

**Preconditions:**
- User has created an automation workflow
- User has permissions to create scheduled tasks
- System cron service is operational

**User Journey:**
1. Rachel opens the Workflow Automation page
2. She selects her "Daily Lead Report" workflow
3. She clicks "Schedule" button
4. Scheduling modal opens with cron expression builder
5. She selects: "Daily at 6:00 AM"
6. Visual preview shows: "Next 5 runs: Jan 12, 13, 14, 15, 16 at 6:00 AM EST"
7. She enables "Email results to team"
8. She clicks "Create Schedule"
9. Scheduled task appears in "Scheduled Tasks" list
10. Next day at 6:00 AM, task executes
11. Rachel receives email with execution summary and attached report
12. She checks task history: "Completed in 45 seconds"

**Expected Behavior:**
- Cron expression builder prevents invalid expressions
- Visual preview accurately shows future execution times
- Timezone handling is consistent
- Task executes within 1 minute of scheduled time
- Execution history is retained for 90 days
- Failed tasks can be manually retried

**Success Criteria:**
- [ ] Schedule creation completes in < 2 seconds
- [ ] Visual preview shows next 5 accurate execution times
- [ ] Task executes within +/- 60 seconds of scheduled time
- [ ] Execution results are emailed within 5 minutes
- [ ] Task history shows execution time, duration, and status
- [ ] User can pause/resume schedules
- [ ] User can edit schedule without recreating

**Edge Cases:**
1. Daylight saving time transition (adjust execution time correctly)
2. Task execution takes longer than schedule interval (skip or queue next)
3. System was down during scheduled time (run immediately on recovery)
4. User deletes workflow that schedule references (disable schedule, notify)
5. Schedule set for past time (execute immediately or reject with error)
6. Overlapping schedules for same workflow (warn user)
7. Maximum concurrent task limit reached (queue with priority)

**Test Data Requirements:**
- Workflow that runs for 10 seconds
- Workflow that runs for 5 minutes
- Schedules across DST transition dates
- Schedule set to run every minute (stress test)
- Schedule with complex cron expression (every Monday at 9 AM)

---

### UX-36-006: Retry with Exponential Backoff

| Field | Value |
|-------|-------|
| **Story ID** | UX-36-006 |
| **Title** | User observes automatic retry behavior on failed job |
| **User Persona** | Technical User (Dev, debugging integration issues) |

**Preconditions:**
- User has triggered a background job
- External API is temporarily unavailable (503 error)
- Retry settings: Max 5 attempts, exponential backoff enabled

**User Journey:**
1. Dev initiates an email sync job
2. Job status shows: "In Progress"
3. After 10 seconds, status changes to: "Retrying (1/5) - External API unavailable"
4. Retry countdown shows: "Next attempt in 30 seconds"
5. Dev clicks job to see details
6. Detail view shows:
   - Attempt 1: Failed at 9:00:00 - 503 Service Unavailable
   - Attempt 2: Scheduled for 9:00:30
7. Second attempt fails
8. Status: "Retrying (2/5) - Next attempt in 60 seconds"
9. Third attempt succeeds
10. Status: "Completed - 3 attempts required"
11. Job detail shows full retry history

**Expected Behavior:**
- Backoff intervals: 30s, 60s, 120s, 240s, 480s (exponential)
- Each retry attempt is logged with timestamp and error
- User can manually retry or cancel during backoff
- Notifications are sent on first failure and final failure
- Successful retry is treated as success (not flagged as error)

**Success Criteria:**
- [ ] Retry intervals follow exponential backoff pattern
- [ ] Each attempt is logged with full error details
- [ ] User can cancel job during backoff period
- [ ] User can force immediate retry
- [ ] Final failure sends notification with all attempt details
- [ ] Retry count and max attempts are visible
- [ ] Job does not retry on non-retryable errors (4xx)

**Edge Cases:**
1. Error is non-retryable (400, 401, 404) - fail immediately
2. Error is retryable but job times out - respect timeout over retries
3. System restarts during backoff - resume backoff schedule
4. User changes retry settings mid-job - apply to future jobs only
5. All retry attempts fail - mark as permanently failed, require manual intervention
6. Network returns partial success - handle idempotently

**Test Data Requirements:**
- Mock API returning 503 for first 2 requests, then 200
- Mock API returning 400 (should not retry)
- Mock API with 30-second latency (timeout test)
- Job with retry limit set to 1
- Job with retry limit set to 10

---

### UX-36-007: Job Status Tracking Dashboard

| Field | Value |
|-------|-------|
| **Story ID** | UX-36-007 |
| **Title** | User monitors all background jobs from central dashboard |
| **User Persona** | Agency Owner (Sarah, overseeing team's automated operations) |

**Preconditions:**
- Multiple background jobs are running/queued/completed
- User has access to jobs dashboard
- Jobs span multiple types (email, voice, scheduled)

**User Journey:**
1. Sarah opens the Background Jobs dashboard
2. Dashboard shows summary: "3 Active, 5 Queued, 127 Completed (24h)"
3. Active jobs section shows real-time progress for each:
   - Email Sync: 45% complete
   - Draft Generation: 12/50 drafts
   - Voice Calls: 8/20 scheduled calls completed
4. She clicks on Email Sync to expand details
5. Expanded view shows: progress bar, ETA, recent activity log
6. She filters by "Voice" job type
7. Voice jobs list shows scheduled, in-progress, and completed calls
8. She clicks "Completed" tab
9. Completed jobs show execution time, result, and "View Details" link
10. She exports job history to CSV

**Expected Behavior:**
- Dashboard updates in real-time without refresh
- Jobs are filterable by type, status, date range
- Progress percentages are accurate
- Completed jobs show clear success/failure status
- Export includes all job metadata

**Success Criteria:**
- [ ] Dashboard loads in < 2 seconds with 1000+ jobs
- [ ] Real-time updates appear within 3 seconds
- [ ] Filters apply instantly (< 500ms)
- [ ] Job details expand smoothly
- [ ] Export generates in < 30 seconds for 10,000 jobs
- [ ] Search finds jobs by ID, type, or content
- [ ] Pagination handles large job counts

**Edge Cases:**
1. 10,000+ jobs in last 24h (virtual scrolling, pagination)
2. Job status changes while user is viewing (update in-place)
3. Network disconnection (show stale data indicator)
4. Job deleted while user is viewing (show "Job not found")
5. Filter returns 0 results (show "No jobs match filters")
6. User lacks permission to view certain job types (hide or indicate)

**Test Data Requirements:**
- 100 jobs of each type (email, voice, scheduled)
- Jobs in all states (queued, active, completed, failed)
- Jobs spanning 7 days of history
- Jobs with various durations (1s to 30min)
- Account with restricted job visibility

---

### UX-36-008: Job Priority and Queue Management

| Field | Value |
|-------|-------|
| **Story ID** | UX-36-008 |
| **Title** | User manages job priorities and queue order |
| **User Persona** | Power User (Alex, needing to prioritize urgent email sync) |

**Preconditions:**
- Multiple jobs are queued
- User has job management permissions
- Queue shows 5 pending jobs

**User Journey:**
1. Alex has queued 5 jobs for processing
2. Queue shows order: Job A, B, C, D, E (oldest first)
3. Job E becomes urgent (client waiting)
4. Alex clicks "Boost Priority" on Job E
5. Queue reorders: Job E, A, B, C, D
6. Progress indicator shows Job E starting next
7. Alex also needs to pause Job B
8. He clicks "Pause" on Job B
9. Job B moves to "Paused" section
10. When ready, Alex resumes Job B
11. Job B returns to queue (maintains relative position)

**Expected Behavior:**
- Priority boost moves job to front of its type queue
- Pausing removes job from active queue
- Resuming returns job to appropriate queue position
- In-progress jobs cannot be reordered (only cancelled)
- Priority changes are logged for audit

**Success Criteria:**
- [ ] Priority change takes effect in < 2 seconds
- [ ] Queue order updates in real-time
- [ ] Paused jobs retain their state
- [ ] Resuming works correctly
- [ ] Priority changes are audit logged
- [ ] User can set default priority for job types
- [ ] High-priority jobs preempt lower-priority

**Edge Cases:**
1. Boost priority on already highest priority job (no-op with message)
2. Pause job that has dependencies (warn about downstream effects)
3. Queue is empty except for paused jobs (show "All jobs paused")
4. User boosts multiple jobs simultaneously (process in click order)
5. System resource limit reached (queue respects limit regardless of priority)
6. Admin overrides user priority settings (audit log shows override)

**Test Data Requirements:**
- 10 jobs across 3 priority levels
- Job with dependencies on other jobs
- Jobs of different types in same queue
- Account with limited concurrent job slots

---

### UX-36-009: Job Notifications and Alerts

| Field | Value |
|-------|-------|
| **Story ID** | UX-36-009 |
| **Title** | User receives notifications for job status changes |
| **User Persona** | Manager (Lisa, wants to be notified of important job events) |

**Preconditions:**
- User has notification preferences configured
- Jobs are running in background
- Multiple notification channels enabled (in-app, email, Slack)

**User Journey:**
1. Lisa configures job notifications in Settings
2. She enables: "Notify on completion" for email sync jobs
3. She enables: "Notify on failure" for all job types
4. She sets email as default channel, Slack for failures only
5. She initiates an email sync (500 emails)
6. She closes the browser and works elsewhere
7. 5 minutes later, sync completes
8. She receives email: "Email sync complete: 498 emails synced, 2 failed"
9. Later, a scheduled task fails
10. She receives Slack message: "ALERT: Daily Report task failed - API timeout"
11. She clicks Slack link, opens job detail page with error info

**Expected Behavior:**
- Notifications respect user preferences
- Different job types can have different notification rules
- Notification includes actionable link
- Failure notifications include error summary
- Notifications are batched to prevent spam

**Success Criteria:**
- [ ] Notifications delivered within 60 seconds of event
- [ ] Channel routing follows user preferences
- [ ] Notification includes job ID, status, summary
- [ ] Links in notifications work correctly
- [ ] Batch notifications combine multiple events
- [ ] User can mute notifications temporarily
- [ ] Critical failures bypass mute settings

**Edge Cases:**
1. User has all notifications disabled (no notifications sent)
2. Email delivery fails (retry, log failure)
3. Slack integration is disconnected (fallback to email)
4. 50 jobs complete simultaneously (batch into single notification)
5. User changes preferences mid-job (apply to future events only)
6. Notification service is down (queue for later delivery)

**Test Data Requirements:**
- User with email notifications enabled
- User with Slack integration configured
- Job that fails with retryable error
- Job that fails with permanent error
- 20 jobs completing within 1 minute (batch test)

---

### UX-36-010: Job Failure Recovery and Manual Intervention

| Field | Value |
|-------|-------|
| **Story ID** | UX-36-010 |
| **Title** | User recovers from permanently failed job |
| **User Persona** | Technical Support (Tom, helping customer with failed job) |

**Preconditions:**
- Job has exhausted all retry attempts
- Job status is "Permanently Failed"
- Error logs are available

**User Journey:**
1. Tom receives ticket: "My email sync has been stuck for 2 hours"
2. He opens customer's job dashboard
3. He finds job in "Failed" status with 5/5 retries exhausted
4. He clicks job to see error details
5. Error log shows: "OAuth token expired, refresh token invalid"
6. He identifies the issue: customer needs to re-authenticate
7. He clicks "Mark as Requires Action" with note
8. Customer receives notification with Tom's note
9. Customer re-authenticates their Gmail account
10. Tom clicks "Retry Job" on the failed job
11. Job resumes from last checkpoint (not from beginning)
12. Job completes successfully

**Expected Behavior:**
- Failed jobs retain all context and progress
- Error logs are detailed and searchable
- Support staff can add notes visible to customer
- Retry preserves partial progress when possible
- Resolution actions are logged

**Success Criteria:**
- [ ] Error details include timestamp, error code, message, stack trace
- [ ] "Retry" button is available for recoverable failures
- [ ] Partial progress is preserved on retry
- [ ] Notes system works for support-customer communication
- [ ] Audit log shows all interventions
- [ ] Job can be archived if permanently unrecoverable

**Edge Cases:**
1. Retry after underlying issue is not fixed (same failure again)
2. Job data has been modified since failure (conflict resolution)
3. User's subscription expired since job started (handle gracefully)
4. Original job request payload is corrupted (show recovery options)
5. Support marks wrong job as resolved (undo capability)
6. Job is too old to retry (data retention policy expired)

**Test Data Requirements:**
- Failed job with OAuth error
- Failed job with rate limit error
- Failed job with data validation error
- Job with partial progress saved
- Job older than retention period

---

# Feature 37: Image Generation

## Overview
The Image Generation system provides AI-powered image creation capabilities using DALL-E 3, Stable Diffusion, and Midjourney APIs. Users can generate images from text prompts with support for custom parameters, model selection, and comprehensive image storage and retrieval.

---

### UX-37-001: Basic Image Generation from Prompt

| Field | Value |
|-------|-------|
| **Story ID** | UX-37-001 |
| **Title** | User generates an image from a text prompt |
| **User Persona** | Marketing Specialist (Emma, creating social media visuals) |

**Preconditions:**
- User is authenticated with active subscription
- At least one image generation API is configured
- User has available image generation credits

**User Journey:**
1. Emma navigates to the Image Generation page
2. She sees a text input field with placeholder "Describe the image you want to create..."
3. She types: "A professional business team collaborating in a modern office, natural lighting, 4K quality"
4. Below the input, generation options appear:
   - Model: DALL-E 3 (selected), Stable Diffusion XL, Midjourney v6
   - Size: 1024x1024 (selected), 1024x1792, 1792x1024
   - Style: Natural (selected), Vivid
5. She clicks "Generate Image"
6. Button changes to "Generating..." with animated progress
7. After 15 seconds, generated image appears
8. Image displays with options: Download, Regenerate, Edit, Save to Library
9. Emma clicks "Save to Library" and adds tags: "team", "office", "professional"
10. Image appears in her Image Library

**Expected Behavior:**
- Prompt input accepts up to 4000 characters
- Model selection shows estimated generation time
- Generation status shows progress (initializing, generating, finalizing)
- Generated image is high quality matching specified size
- Original prompt is saved with image metadata

**Success Criteria:**
- [ ] Image generates within 30 seconds for DALL-E 3
- [ ] Image matches prompt description accurately
- [ ] Image quality meets specified resolution
- [ ] Download provides original quality file
- [ ] Image metadata includes prompt, model, timestamp
- [ ] Regenerate creates a new variation
- [ ] Save to Library completes in < 2 seconds

**Edge Cases:**
1. Prompt contains content policy violation (reject with explanation)
2. Prompt is empty or too short (show validation error)
3. API timeout during generation (retry automatically)
4. Generated image flagged by safety filter (offer regenerate)
5. User has no credits remaining (show purchase option)
6. Network disconnection during generation (resume or retry)
7. User navigates away during generation (continue in background)

**Test Data Requirements:**
- Valid prompts of various lengths (10 chars to 4000 chars)
- Prompts containing various subjects (people, objects, landscapes)
- Prompts with specific style requirements
- Prompt that triggers content filter
- Account with 1 credit remaining

---

### UX-37-002: Advanced Prompt Engineering with Parameters

| Field | Value |
|-------|-------|
| **Story ID** | UX-37-002 |
| **Title** | User utilizes advanced prompt parameters for precise generation |
| **User Persona** | Graphic Designer (Carlos, creating brand-specific imagery) |

**Preconditions:**
- User has experience with image generation
- Advanced options are enabled in settings
- User needs precise control over output

**User Journey:**
1. Carlos opens Image Generation and clicks "Advanced Mode"
2. Interface expands to show additional options:
   - Negative prompt: "low quality, blurry, text, watermark"
   - Seed: [input field] or "Random"
   - CFG Scale: slider 1-20 (default 7)
   - Steps: slider 20-100 (default 50)
   - Sampler: dropdown (Euler, DPM++, DDIM)
3. He enters prompt: "Luxury watch product photography, studio lighting, black background"
4. He enters negative prompt: "cheap, plastic, blurry, distorted"
5. He sets seed to "42" for reproducibility
6. He adjusts CFG scale to 12 for stronger prompt adherence
7. He clicks "Generate"
8. Image generates with specified parameters
9. He likes the result but wants variation: clicks "Generate Variation"
10. System uses same seed + small random offset for similar-but-different output
11. He saves both images with parameters for future reference

**Expected Behavior:**
- Advanced options persist per session
- Seed provides reproducible results
- Parameter changes show preview of expected effect
- Negative prompts effectively reduce unwanted elements
- Generation history includes all parameters

**Success Criteria:**
- [ ] Same seed produces identical results (with same prompt)
- [ ] CFG scale noticeably affects prompt adherence
- [ ] Negative prompts reduce specified elements
- [ ] All parameters are saved with image metadata
- [ ] Parameters can be copied to new generation
- [ ] "Generate Variation" creates related but distinct image
- [ ] Advanced options are collapsible

**Edge Cases:**
1. Invalid seed value (show error, suggest valid format)
2. Conflicting prompt and negative prompt (generate, note potential conflict)
3. Extreme CFG values (warn about quality impact)
4. Very high step count (warn about generation time)
5. Sampler incompatible with model (show compatible options only)
6. User copies parameters from incompatible model (adapt or warn)

**Test Data Requirements:**
- Specific seed value for reproducibility testing
- Various CFG scale values (1, 7, 15, 20)
- Various step counts (20, 50, 100)
- Complex negative prompts
- Parameter sets from different models

---

### UX-37-003: Multi-Model Selection and Comparison

| Field | Value |
|-------|-------|
| **Story ID** | UX-37-003 |
| **Title** | User compares outputs from different AI models |
| **User Persona** | Creative Director (Diana, evaluating which model fits brand best) |

**Preconditions:**
- Multiple image generation models are configured
- User has credits for all models
- Comparison feature is enabled

**User Journey:**
1. Diana enters prompt: "Minimalist logo for tech startup, clean lines, blue gradient"
2. She clicks "Compare Models" button
3. Modal shows available models with checkboxes:
   - [ ] DALL-E 3 (~20 seconds, 1 credit)
   - [ ] Stable Diffusion XL (~15 seconds, 0.5 credits)
   - [ ] Midjourney v6 (~45 seconds, 1.5 credits)
4. She selects all three models
5. Total cost shown: "3 credits"
6. She clicks "Generate All"
7. Progress shows: "Generating 0/3..."
8. As each completes, image appears in comparison grid
9. All three images display side-by-side
10. She hovers over each to see generation details
11. She votes "Best" on DALL-E version
12. System logs preference for analytics
13. She downloads all three as ZIP file

**Expected Behavior:**
- Models generate in parallel for speed
- Comparison grid shows images at same size
- Each image shows which model created it
- Voting is optional but encouraged
- Failed generations don't block others

**Success Criteria:**
- [ ] Parallel generation completes efficiently
- [ ] All images display at consistent size for comparison
- [ ] Model attribution is clear
- [ ] Individual images can be regenerated
- [ ] Comparison can be saved/shared
- [ ] ZIP download includes all images and metadata
- [ ] Voting data is captured for analytics

**Edge Cases:**
1. One model fails, others succeed (show partial results)
2. User selects models that don't support chosen size (adapt or warn)
3. Insufficient credits for all selected models (show which are affordable)
4. Network timeout on one model (retry independently)
5. Models return significantly different sizes (normalize for display)
6. Prompt exceeds character limit for one model (truncate with notice)

**Test Data Requirements:**
- API credentials for DALL-E, Stable Diffusion, Midjourney
- Account with credits for all models
- Account with limited credits (can afford 1 model only)
- Prompt at various lengths

---

### UX-37-004: Image Library Management

| Field | Value |
|-------|-------|
| **Story ID** | UX-37-004 |
| **Title** | User organizes and retrieves generated images from library |
| **User Persona** | Social Media Manager (Fiona, managing large image collection) |

**Preconditions:**
- User has generated 500+ images over time
- Images have various tags and metadata
- Library view is open

**User Journey:**
1. Fiona opens Image Library
2. Grid displays recent 50 images with infinite scroll
3. She uses search: "team meeting"
4. Results filter to 23 images matching prompt or tags
5. She clicks "Filter" to refine:
   - Model: All / DALL-E 3 / Stable Diffusion / Midjourney
   - Date: Last 7 days / 30 days / All time
   - Size: All / Square / Portrait / Landscape
6. She filters to DALL-E 3 images from last 30 days
7. 8 images match
8. She selects 3 images for bulk action
9. She clicks "Add to Collection" and creates "Q1 Campaign"
10. Images are added to collection
11. She opens Q1 Campaign collection
12. Collection shows 3 images with shared tags

**Expected Behavior:**
- Library loads quickly with lazy loading
- Search includes prompt text and tags
- Filters combine (AND logic)
- Collections organize images without moving/copying
- Bulk actions work on selected images

**Success Criteria:**
- [ ] Library loads 50 images in < 1 second
- [ ] Search results appear in < 500ms
- [ ] Filters apply instantly
- [ ] Collections support unlimited images
- [ ] Bulk download creates ZIP efficiently
- [ ] Image deletion moves to trash (30-day recovery)
- [ ] Sort options: newest, oldest, most used

**Edge Cases:**
1. Search returns 0 results (show "No images found" with suggestions)
2. User deletes image in active collection (remove from collection)
3. Collection deleted with images (images remain, only collection removed)
4. Bulk select all (page or entire library?)
5. Storage limit reached (warn before generation, offer cleanup)
6. Image file is corrupted in storage (show placeholder, offer re-download)

**Test Data Requirements:**
- 500+ images with varied prompts and tags
- Images from all three models
- Images across 90-day timespan
- Collection with 50 images
- Corrupted/missing image file

---

### UX-37-005: Image Editing and Variations

| Field | Value |
|-------|-------|
| **Story ID** | UX-37-005 |
| **Title** | User edits existing image with AI assistance |
| **User Persona** | Content Creator (Greg, refining generated images) |

**Preconditions:**
- User has generated an image
- Edit mode is available for the model
- Image is in user's library

**User Journey:**
1. Greg opens an image from his library
2. Image shows person in office, but background is distracting
3. He clicks "Edit Image"
4. Image opens in edit mode with tools:
   - Inpaint: brush to select area for regeneration
   - Outpaint: extend image in any direction
   - Upscale: 2x or 4x resolution enhancement
   - Adjust: brightness, contrast, saturation
5. He selects "Inpaint" tool
6. He brushes over the distracting background
7. He types edit prompt: "clean, minimal white office background"
8. He clicks "Apply"
9. Selected area regenerates while preserving the person
10. He's satisfied and clicks "Save as New"
11. New image saved, original preserved

**Expected Behavior:**
- Edit tools work on all supported image formats
- Inpaint respects boundaries accurately
- Outpaint generates coherent extensions
- Upscale maintains quality
- Multiple edits can be made before saving
- Undo/redo available for edit history

**Success Criteria:**
- [ ] Inpaint area regenerates seamlessly
- [ ] Outpaint extends image coherently
- [ ] Upscale improves resolution noticeably
- [ ] Edits complete within 20 seconds
- [ ] Original image is never modified
- [ ] Edit history shows all changes
- [ ] Multiple edits can be undone

**Edge Cases:**
1. Inpaint area is entire image (suggest regenerate instead)
2. Outpaint extends beyond maximum size (warn about limit)
3. Upscale on already large image (warn about file size)
4. Model doesn't support inpaint (hide option or show alternative)
5. Edit conflict with original content (show warning)
6. Browser memory limit during large edit (optimize or warn)

**Test Data Requirements:**
- Various image sizes (512x512 to 2048x2048)
- Images with complex backgrounds
- Images with simple backgrounds
- Images at maximum size (edge case for upscale)
- Image from model without edit support

---

### UX-37-006: Batch Image Generation

| Field | Value |
|-------|-------|
| **Story ID** | UX-37-006 |
| **Title** | User generates multiple images from single prompt |
| **User Persona** | E-commerce Manager (Helen, generating product variations) |

**Preconditions:**
- User needs multiple variations of same concept
- Batch generation is enabled
- User has sufficient credits

**User Journey:**
1. Helen enters prompt: "Modern minimalist product packaging mockup, white box, neutral background"
2. Instead of single generate, she clicks "Batch Generate"
3. Options appear:
   - Number of images: dropdown (2, 4, 8, 16)
   - Variation amount: slider (Low, Medium, High)
   - Model: same model for all / mix models
4. She selects 8 images, medium variation, DALL-E 3 only
5. Cost estimate: "8 credits"
6. She clicks "Generate Batch"
7. Progress: "Generating 0/8..."
8. Images appear as they complete, filling a 2x4 grid
9. After all complete, she reviews all 8
10. She favorites 3, discards 2, keeps 3 as is
11. Favorited images move to "Favorites" folder

**Expected Behavior:**
- Batch images generate with varied seeds
- Images display as they complete (not all at once)
- Failed images in batch can be retried individually
- Batch history shows all images together
- Favorites/discard actions update library

**Success Criteria:**
- [ ] 8 images generate in under 3 minutes
- [ ] Each image is noticeably different
- [ ] Progress updates for each completion
- [ ] Individual image actions work within batch view
- [ ] Batch can be saved as collection
- [ ] Failed images show retry option
- [ ] Batch appears in generation history

**Edge Cases:**
1. 3 of 8 images fail (complete successful ones, offer retry)
2. User cancels mid-batch (complete in-progress, stop remaining)
3. Credit limit reached mid-batch (generate what's possible, notify)
4. Network timeout on batch request (retry entire batch)
5. User requested 16 but model supports max 4 per request (queue multiple requests)
6. Batch images have safety filter triggers (generate rest, flag filtered)

**Test Data Requirements:**
- Credit balance for exact batch size
- Credit balance for less than batch size
- Prompt that generates consistent results
- Prompt that generates highly varied results
- Model with batch size limitations

---

### UX-37-007: Image Storage and CDN Delivery

| Field | Value |
|-------|-------|
| **Story ID** | UX-37-007 |
| **Title** | User accesses and shares generated images via CDN |
| **User Persona** | Web Developer (Ian, integrating generated images into website) |

**Preconditions:**
- User has generated images in library
- CDN integration is configured
- Images are stored in cloud storage

**User Journey:**
1. Ian opens his Image Library
2. He selects an image for his website
3. He clicks "Get Link"
4. Modal shows sharing options:
   - Original size URL (2.5 MB)
   - Optimized URL (450 KB, WebP)
   - Thumbnail URL (50 KB, 300px)
   - Custom size URL builder
5. He selects "Optimized URL"
6. URL is generated: cdn.bottleneck-bots.io/img/abc123.webp
7. He clicks "Copy"
8. URL is copied to clipboard
9. He tests URL in browser: image loads in 200ms
10. He uses custom size: 800x600
11. New URL generated with size parameter
12. He sets link expiration: 30 days (default: never)

**Expected Behavior:**
- CDN URLs load faster than direct storage
- Multiple sizes available without regeneration
- URLs can be set to expire or be permanent
- Access analytics track image views
- Hotlink protection available

**Success Criteria:**
- [ ] CDN URL loads in < 500ms globally
- [ ] Image formats include PNG, JPEG, WebP
- [ ] Custom sizes generate on-the-fly
- [ ] Expired URLs return 404/410
- [ ] Usage analytics show view counts
- [ ] Hotlink protection can be enabled
- [ ] Bandwidth usage is tracked

**Edge Cases:**
1. CDN is temporarily unavailable (fallback to direct storage)
2. Image deleted but URL shared (return 404 with grace period)
3. High traffic to single image (CDN scales automatically)
4. Custom size exceeds original (return original with warning header)
5. Unsupported format requested (return default format)
6. Hotlink from blocked domain (return placeholder or 403)

**Test Data Requirements:**
- Large image file (5MB+)
- Various image formats
- CDN URL with expiration set
- High-traffic simulation
- URL from deleted image

---

### UX-37-008: Template-Based Generation

| Field | Value |
|-------|-------|
| **Story ID** | UX-37-008 |
| **Title** | User generates images using saved templates |
| **User Persona** | Brand Manager (Julia, maintaining visual consistency) |

**Preconditions:**
- User has created brand templates
- Templates include style guidelines
- Team members share templates

**User Journey:**
1. Julia opens Image Generation
2. Instead of writing prompt from scratch, she clicks "Templates"
3. Template library shows:
   - Brand Templates (created by her): 5 templates
   - Team Templates: 12 templates
   - Community Templates: 100+ templates
4. She selects "Brand - Social Media Post"
5. Template loads with preset:
   - Style: "Modern, clean, brand colors (blue #0066CC, white)"
   - Negative: "cluttered, busy, off-brand colors"
   - Model: DALL-E 3
   - Size: 1080x1080
6. She fills variable: "[Subject]" with "Summer sale announcement"
7. Full prompt preview shows: "Modern, clean social media post about Summer sale announcement, brand colors blue #0066CC and white, professional"
8. She clicks "Generate"
9. Image generates matching brand guidelines
10. She saves template usage to track consistency

**Expected Behavior:**
- Templates save full generation configuration
- Variables allow customization without losing style
- Templates can be shared with team or public
- Template usage is tracked for analytics
- Templates can be version-controlled

**Success Criteria:**
- [ ] Templates load all settings instantly
- [ ] Variables are clearly marked [like this]
- [ ] Preview shows final prompt before generation
- [ ] Team templates are accessible to all team members
- [ ] Template edit doesn't affect previous generations
- [ ] Templates can be duplicated and modified
- [ ] Usage analytics show template popularity

**Edge Cases:**
1. Template references unavailable model (suggest alternative)
2. Variable is left empty (warn or use default)
3. Team member deletes shared template (notify users)
4. Template prompt exceeds character limit after variable fill (truncate with warning)
5. Community template contains inappropriate content (report mechanism)
6. Template version conflicts (show version history)

**Test Data Requirements:**
- 5 brand templates with variables
- Template using each supported model
- Template with 3+ variables
- Template at prompt character limit
- Shared team template

---

### UX-37-009: Generation History and Analytics

| Field | Value |
|-------|-------|
| **Story ID** | UX-37-009 |
| **Title** | User reviews generation history and usage analytics |
| **User Persona** | Finance Manager (Kevin, tracking AI spend) |

**Preconditions:**
- User has generated images over 30+ days
- Analytics dashboard is accessible
- Cost tracking is enabled

**User Journey:**
1. Kevin opens Image Generation Analytics
2. Dashboard shows:
   - Total generations this month: 450
   - Total credits used: 523
   - Most used model: DALL-E 3 (78%)
   - Average generation time: 18 seconds
3. He clicks "Cost Breakdown"
4. Chart shows daily spend over last 30 days
5. He notices spike on Jan 5th
6. He clicks that day to drill down
7. Detail shows: 45 generations by Sarah for "Q1 Campaign"
8. He clicks "Export Report"
9. CSV downloads with all generation data
10. He sets up weekly email report

**Expected Behavior:**
- Analytics update in real-time
- Drill-down available to individual generation level
- Reports can be filtered by user, model, date
- Cost calculations are accurate
- Export includes all metadata

**Success Criteria:**
- [ ] Analytics dashboard loads in < 2 seconds
- [ ] Charts render smoothly
- [ ] Drill-down shows generation details
- [ ] Export handles 10,000+ generations
- [ ] Weekly reports deliver on schedule
- [ ] Cost calculations match actual charges
- [ ] User-level breakdown available for teams

**Edge Cases:**
1. No generations in selected period (show empty state with message)
2. Export of very large dataset (background job with notification)
3. Analytics include deleted images (show with "deleted" flag)
4. Multi-currency pricing (convert to account currency)
5. Team member leaves (retain historical data)
6. Date range spans multiple pricing periods (accurate calculations)

**Test Data Requirements:**
- 500 generations over 30 days
- Generations from multiple team members
- Various models and sizes used
- Generation with deleted image
- Data spanning price change

---

### UX-37-010: Integration with Workflows and Automation

| Field | Value |
|-------|-------|
| **Story ID** | UX-37-010 |
| **Title** | User triggers image generation from automated workflow |
| **User Persona** | Automation Specialist (Laura, building marketing workflows) |

**Preconditions:**
- User has workflow builder access
- Image generation is available as workflow action
- Workflow triggers are configured

**User Journey:**
1. Laura opens Workflow Builder
2. She creates new workflow: "Auto-generate blog header images"
3. Trigger: "New blog post published"
4. Action 1: "Extract blog title" (from trigger data)
5. Action 2: "Generate Image" - she configures:
   - Prompt template: "Professional blog header image about [title], modern design, 1200x630"
   - Model: DALL-E 3
   - Save to: Blog Images collection
6. Action 3: "Send to review queue" with generated image
7. She saves and enables workflow
8. New blog post is published: "10 Tips for Remote Work"
9. Workflow triggers automatically
10. Image generates: "Professional blog header image about 10 Tips for Remote Work, modern design, 1200x630"
11. Image appears in review queue with blog post reference
12. Laura approves, image is attached to blog post

**Expected Behavior:**
- Workflow variables substitute correctly in prompts
- Generated images are tagged with workflow source
- Failed generations trigger workflow error handling
- Rate limits are respected across workflows
- Workflow history shows generation details

**Success Criteria:**
- [ ] Workflow triggers image generation correctly
- [ ] Variable substitution works in prompt
- [ ] Generated image is saved to specified collection
- [ ] Workflow continues after successful generation
- [ ] Failed generation triggers error path
- [ ] Rate limiting prevents runaway generation
- [ ] Audit log shows workflow-triggered generations

**Edge Cases:**
1. Trigger fires rapidly (queue and rate limit generations)
2. Variable contains special characters (sanitize for prompt)
3. Generated image fails safety filter (trigger error path)
4. Workflow disabled mid-execution (complete current, stop future)
5. Collection doesn't exist (create or use default)
6. Credit limit reached during workflow (pause workflow, notify)

**Test Data Requirements:**
- Workflow with image generation action
- Various trigger types (webhook, schedule, database)
- Trigger data with special characters
- High-frequency trigger simulation
- Workflow with error handling configured

---

# Feature 38: GoHighLevel Integration

## Overview
The GoHighLevel (GHL) Integration provides seamless connectivity with the GHL CRM platform, enabling contact management, pipeline automation, lead capture, and workflow synchronization. The integration supports multi-tenant isolation for agencies managing multiple GHL sub-accounts.

---

### UX-38-001: GHL API Connection Setup

| Field | Value |
|-------|-------|
| **Story ID** | UX-38-001 |
| **Title** | User connects GoHighLevel account via OAuth |
| **User Persona** | Agency Owner (Marcus, connecting agency GHL account) |

**Preconditions:**
- User has a GoHighLevel account
- User has admin access to GHL
- OAuth integration is available

**User Journey:**
1. Marcus navigates to Integrations page
2. He finds GoHighLevel in available integrations
3. He clicks "Connect GoHighLevel"
4. System explains: "You'll be redirected to GoHighLevel to authorize access"
5. He clicks "Authorize"
6. Redirect to GHL OAuth screen
7. GHL shows requested permissions:
   - Read/write contacts
   - Read/write opportunities
   - Read/write campaigns
   - Read/write workflows
8. Marcus clicks "Allow"
9. Redirect back to Bottleneck-Bots
10. Success message: "GoHighLevel connected successfully"
11. Account shows as connected with sync status
12. Marcus selects which sub-accounts to sync

**Expected Behavior:**
- OAuth flow completes without errors
- Token is securely stored
- Permissions are clearly listed before authorization
- Sub-account selection is available post-connection
- Connection status shows real-time sync state

**Success Criteria:**
- [ ] OAuth flow completes in < 30 seconds
- [ ] Token is encrypted at rest
- [ ] All requested permissions are functional
- [ ] Sub-account list populates automatically
- [ ] Connection test shows success/failure clearly
- [ ] Disconnection option is available
- [ ] Re-authorization handles token refresh

**Edge Cases:**
1. User denies permission on GHL (return with error message)
2. OAuth token expires (auto-refresh or prompt re-auth)
3. GHL account is suspended (show appropriate error)
4. User has no sub-accounts (show message, continue with main account)
5. Network error during OAuth (retry with clear message)
6. User already has GHL connected (show "Update Connection" option)
7. Multiple GHL accounts (allow connecting multiple)

**Test Data Requirements:**
- GHL account with admin access
- GHL account with limited permissions
- GHL account with 10+ sub-accounts
- GHL account with no sub-accounts
- Test OAuth credentials

---

### UX-38-002: Contact Synchronization - Initial Sync

| Field | Value |
|-------|-------|
| **Story ID** | UX-38-002 |
| **Title** | User performs initial contact sync from GHL |
| **User Persona** | Agency Manager (Nancy, importing client contacts) |

**Preconditions:**
- GHL account is connected
- GHL account has 5,000 contacts
- Sync settings are configured

**User Journey:**
1. Nancy opens GHL Integration settings
2. She sees Sync Status: "Not yet synced"
3. She clicks "Sync Contacts"
4. Modal shows sync options:
   - Sync direction: GHL to BB / BB to GHL / Bidirectional
   - Include: All contacts / Tagged only
   - Conflict resolution: GHL wins / BB wins / Most recent wins
5. She selects: Bidirectional, All contacts, Most recent wins
6. She clicks "Start Sync"
7. Progress: "Syncing contacts: 0/5,000"
8. Progress updates: 500... 1,500... 3,000...
9. Sync completes: "5,000 contacts synced, 0 conflicts"
10. Nancy verifies contacts in Contact Management
11. Contact records show GHL source icon

**Expected Behavior:**
- Sync respects rate limits
- Duplicate contacts are merged intelligently
- All contact fields are mapped correctly
- Sync progress is accurate
- Sync can be cancelled mid-progress

**Success Criteria:**
- [ ] 5,000 contacts sync in < 10 minutes
- [ ] All standard fields map correctly
- [ ] Custom fields are preserved
- [ ] Duplicates are detected by email
- [ ] Sync direction is respected
- [ ] Conflict resolution works as configured
- [ ] Sync history is logged

**Edge Cases:**
1. Contact has no email (use phone as alternate identifier)
2. Contact exists in both with different data (apply conflict resolution)
3. GHL rate limit hit (pause, backoff, resume)
4. Contact has invalid data (skip with error log)
5. Sync interrupted by network (resume from checkpoint)
6. User cancels sync (sync completed portion only)
7. Contact deleted in GHL during sync (mark for reconciliation)

**Test Data Requirements:**
- GHL account with 5,000 contacts
- Contacts with all field types populated
- Contacts with custom fields
- Duplicate contacts (same email)
- Contacts with missing required fields

---

### UX-38-003: Pipeline and Opportunity Management

| Field | Value |
|-------|-------|
| **Story ID** | UX-38-003 |
| **Title** | User manages GHL opportunities from Bottleneck-Bots |
| **User Persona** | Sales Rep (Oliver, working deals through pipeline) |

**Preconditions:**
- GHL sync is complete
- User has pipeline access
- Opportunities exist in GHL

**User Journey:**
1. Oliver opens the Pipeline view
2. Kanban board shows GHL pipeline stages:
   - New Lead | Contacted | Qualified | Proposal | Closed Won | Closed Lost
3. He sees opportunity card: "Acme Corp - Website Redesign - $15,000"
4. He drags card from "Contacted" to "Qualified"
5. System syncs stage change to GHL
6. Toast: "Stage updated in GoHighLevel"
7. He clicks the card to open detail view
8. Detail shows: contact info, deal value, notes, activity history
9. He adds note: "Spoke with decision maker, budget approved"
10. Note syncs to GHL immediately
11. He changes deal value to $18,000
12. Change syncs to GHL

**Expected Behavior:**
- Pipeline stages match GHL configuration
- Drag-and-drop updates both systems
- Changes sync within 5 seconds
- Activity history shows all interactions
- Deal values update in real-time

**Success Criteria:**
- [ ] Pipeline stages sync from GHL
- [ ] Stage changes sync bidirectionally
- [ ] Notes sync within 5 seconds
- [ ] Deal value changes are reflected
- [ ] Activity history is complete
- [ ] Custom fields are editable
- [ ] Sync status indicator shows success/failure

**Edge Cases:**
1. Stage deleted in GHL (show mapping error, require reconfiguration)
2. Opportunity deleted in GHL while editing (show conflict notice)
3. Simultaneous edits in both systems (last write wins with notification)
4. Deal value format mismatch (normalize to standard format)
5. Note with special characters (sanitize for GHL API)
6. Pipeline has 50+ opportunities (pagination/virtual scroll)

**Test Data Requirements:**
- GHL pipeline with 6 stages
- 20+ opportunities across stages
- Opportunity with detailed activity history
- Recently modified opportunity
- Custom pipeline fields

---

### UX-38-004: Lead Capture Form Integration

| Field | Value |
|-------|-------|
| **Story ID** | UX-38-004 |
| **Title** | User captures leads from website form and syncs to GHL |
| **User Persona** | Marketing Coordinator (Pam, managing lead capture) |

**Preconditions:**
- GHL integration is active
- Lead capture form is embedded on website
- Form-to-GHL mapping is configured

**User Journey:**
1. Pam opens Lead Capture settings
2. She creates new form: "Website Demo Request"
3. Form builder shows available fields
4. She adds: First Name, Last Name, Email, Phone, Company, Message
5. She maps each field to GHL contact fields
6. She sets: "Create new opportunity" on submission
7. She configures opportunity: Pipeline "Sales", Stage "New Lead", Value "$5,000"
8. She clicks "Generate Embed Code"
9. Code is copied and embedded on website
10. Visitor fills out form and submits
11. Within 3 seconds, new contact appears in BB and GHL
12. Opportunity is created in GHL pipeline
13. Pam receives notification: "New lead: John from TechCorp"

**Expected Behavior:**
- Form submissions create contacts in both systems
- Field mapping is respected
- Opportunity is created with correct details
- Notifications are instant
- Form handles validation errors

**Success Criteria:**
- [ ] Form submission creates contact in < 5 seconds
- [ ] All mapped fields populate correctly
- [ ] Opportunity is created with correct pipeline/stage
- [ ] Duplicate detection works (existing email)
- [ ] Validation errors show on form
- [ ] Anti-spam protection is active
- [ ] Submission analytics are tracked

**Edge Cases:**
1. Email already exists in GHL (update contact, don't duplicate)
2. Required field missing (show validation error on form)
3. GHL API is down during submission (queue for retry)
4. Form submitted with bot/spam (honeypot detection)
5. Mapped GHL field no longer exists (log error, continue with available fields)
6. Very long message field (truncate to GHL limit with full in BB)

**Test Data Requirements:**
- Form with all field types
- Existing contact email (duplicate test)
- Form submission with missing fields
- Spam submission pattern
- High-volume submission test (50 in 1 minute)

---

### UX-38-005: Workflow Trigger Integration

| Field | Value |
|-------|-------|
| **Story ID** | UX-38-005 |
| **Title** | User triggers GHL workflow from Bottleneck-Bots event |
| **User Persona** | Automation Specialist (Quinn, connecting systems) |

**Preconditions:**
- GHL workflow exists: "New Lead Nurture Sequence"
- Bottleneck-Bots workflow can trigger external systems
- Integration supports workflow triggers

**User Journey:**
1. Quinn opens Workflow Builder in Bottleneck-Bots
2. She creates workflow: "Lead Score Threshold Alert"
3. Trigger: "Lead score reaches 80+"
4. Action 1: "Update contact tag" - adds "Hot Lead"
5. Action 2: "Trigger GHL Workflow"
6. She configures GHL action:
   - Select workflow: "New Lead Nurture Sequence"
   - Contact: {{contact.email}}
   - Additional data: Lead score, timestamp
7. She saves and enables workflow
8. Lead "Jane Doe" reaches score 80
9. Bottleneck-Bots workflow triggers
10. GHL workflow starts for Jane Doe
11. Jane receives first email from GHL sequence
12. Activity logs show cross-system trigger

**Expected Behavior:**
- Available GHL workflows populate dynamically
- Contact is matched in GHL before trigger
- Workflow passes contextual data
- Trigger status is logged in both systems
- Failed triggers retry automatically

**Success Criteria:**
- [ ] GHL workflow list is current
- [ ] Trigger fires within 5 seconds
- [ ] Contact is correctly identified in GHL
- [ ] Additional data passes through
- [ ] Trigger success/failure is logged
- [ ] Failed triggers show in error log
- [ ] Rate limits are respected

**Edge Cases:**
1. GHL workflow is disabled (log error, don't fail BB workflow)
2. Contact not found in GHL (create contact, then trigger)
3. GHL workflow has changed structure (handle gracefully)
4. Rapid triggers for same contact (debounce or queue)
5. GHL workflow trigger fails (retry with backoff)
6. Workflow passes data GHL workflow doesn't use (ignore unused)

**Test Data Requirements:**
- GHL workflow: "New Lead Nurture Sequence"
- Contact that exists in both systems
- Contact that exists only in BB
- Workflow with complex trigger conditions
- High-frequency trigger scenario

---

### UX-38-006: Multi-Tenant Sub-Account Management

| Field | Value |
|-------|-------|
| **Story ID** | UX-38-006 |
| **Title** | Agency user manages multiple client GHL sub-accounts |
| **User Persona** | Agency Director (Rachel, managing 25 client accounts) |

**Preconditions:**
- User is on Agency plan
- GHL agency account is connected
- 25 sub-accounts are available

**User Journey:**
1. Rachel opens GHL Integration dashboard
2. Dashboard shows: "25 Sub-Accounts Connected"
3. Sub-account list displays with status:
   - Client A: Active, 1,234 contacts, Last sync: 5 min ago
   - Client B: Active, 567 contacts, Last sync: 2 min ago
   - Client C: Paused, 890 contacts, Last sync: 3 days ago
4. She clicks on Client A to manage
5. Client A settings page opens with isolated view
6. All contacts, pipelines, workflows are scoped to Client A
7. She makes changes to Client A settings
8. She switches to Client B using dropdown
9. Client B data loads, Client A data is no longer visible
10. She enables sync for Client C
11. Sync begins for Client C only

**Expected Behavior:**
- Each sub-account is completely isolated
- Switching accounts clears previous account's data
- Actions are scoped to selected sub-account
- Sync can be managed per sub-account
- Agency-level view shows all accounts

**Success Criteria:**
- [ ] Sub-account list loads in < 2 seconds
- [ ] Account switching is instant
- [ ] Data isolation is complete (no cross-account leakage)
- [ ] Per-account sync controls work
- [ ] Agency dashboard shows aggregate metrics
- [ ] Bulk actions available for multiple accounts
- [ ] Sub-account addition/removal is seamless

**Edge Cases:**
1. Sub-account access revoked in GHL (show error, remove from list)
2. New sub-account added in GHL (auto-detect or manual refresh)
3. Sub-account data exceeds limits (show warning, upgrade prompt)
4. Switching accounts during active operation (complete or cancel)
5. Sub-account has different GHL plan features (adapt available actions)
6. Agency account disconnected (all sub-accounts disconnected)

**Test Data Requirements:**
- GHL agency account with 25 sub-accounts
- Sub-accounts with varying data volumes
- Sub-account with limited permissions
- Recently added sub-account
- Sub-account with pending sync

---

### UX-38-007: Contact Tag and List Synchronization

| Field | Value |
|-------|-------|
| **Story ID** | UX-38-007 |
| **Title** | User syncs contact tags and lists between systems |
| **User Persona** | Marketing Manager (Steve, segmenting audiences) |

**Preconditions:**
- GHL contacts are synced
- Tags exist in both systems
- Lists/segments need synchronization

**User Journey:**
1. Steve opens Contact Tags management
2. Left panel shows BB tags, right panel shows GHL tags
3. Mapping interface shows:
   - Auto-matched: 15 tags (same name in both)
   - BB only: 5 tags
   - GHL only: 8 tags
4. He clicks "Create in GHL" for BB-only tags
5. System creates 5 tags in GHL
6. He maps GHL "Prospect" to BB "Lead" (different names, same meaning)
7. He saves tag mapping
8. He opens Lists synchronization
9. He syncs GHL "Newsletter Subscribers" list
10. BB shows new list with 2,340 contacts
11. He sets bidirectional sync for this list
12. Adding contact to BB list adds them to GHL list

**Expected Behavior:**
- Tag mapping is flexible (1:1, many:1, new creation)
- List sync respects membership changes
- Changes propagate within 5 minutes
- Tag colors/icons sync where supported
- Unmapped tags preserve original system

**Success Criteria:**
- [ ] Auto-match detects identical tag names
- [ ] Custom mapping is saved and respected
- [ ] New tags sync within 5 minutes
- [ ] List membership syncs bidirectionally
- [ ] Large lists (10,000+) sync efficiently
- [ ] Tag deletion handling is clear
- [ ] Mapping changes apply retroactively (optional)

**Edge Cases:**
1. Tag renamed in GHL (update mapping or create duplicate)
2. List deleted in GHL (remove mapping, keep BB list)
3. Contact in multiple mapped tags (all tags apply)
4. Circular mapping (prevent or warn)
5. Tag with special characters (sanitize for API)
6. GHL tag limit reached (warn before creating new)

**Test Data Requirements:**
- 20 tags in each system with some overlap
- List with 5,000 contacts
- Tags with special characters
- Contact with 10+ tags
- Recently modified tag

---

### UX-38-008: Campaign and Email Sync

| Field | Value |
|-------|-------|
| **Story ID** | UX-38-008 |
| **Title** | User syncs email campaigns between systems |
| **User Persona** | Email Marketing Specialist (Tracy, coordinating campaigns) |

**Preconditions:**
- GHL email campaigns exist
- Email integration is active
- Campaign sync is enabled

**User Journey:**
1. Tracy opens Campaign management
2. She sees campaigns from both systems:
   - BB Campaigns: 3
   - GHL Campaigns: 12
   - Synced: 2
3. She clicks "Import from GHL"
4. Campaign list shows GHL campaigns with stats:
   - "January Newsletter" - 5,000 sent, 22% open rate
   - "Product Launch" - 2,500 sent, 35% open rate
5. She selects "Product Launch" to import
6. Campaign imports with full history:
   - Email templates
   - Send history
   - Engagement metrics
7. She can now reference this campaign in BB workflows
8. She creates new campaign in BB: "February Newsletter"
9. She enables "Sync to GHL"
10. Campaign appears in GHL with BB as source

**Expected Behavior:**
- Campaigns import with full metadata
- Email templates are viewable (not editable from import)
- Metrics sync periodically
- New campaigns can sync to GHL
- Campaign status syncs (draft, active, completed)

**Success Criteria:**
- [ ] Campaign list loads from both systems
- [ ] Import includes all campaign data
- [ ] Metrics are accurate and current
- [ ] Bidirectional campaign sync works
- [ ] Template content is preserved
- [ ] Engagement data updates hourly
- [ ] Campaign triggers are functional

**Edge Cases:**
1. Campaign has unsupported email features (note in import)
2. Large campaign history (paginate metrics)
3. Campaign deleted in source (mark as orphaned)
4. Metric discrepancy between systems (show both with note)
5. Campaign in draft state (sync draft changes)
6. Circular sync (BB to GHL to BB) - prevent duplication

**Test Data Requirements:**
- GHL campaign with full history
- Campaign with complex email template
- Campaign with 10,000+ recipients
- Draft campaign
- Recently completed campaign

---

### UX-38-009: Appointment and Calendar Integration

| Field | Value |
|-------|-------|
| **Story ID** | UX-38-009 |
| **Title** | User syncs appointments from GHL calendars |
| **User Persona** | Sales Coordinator (Uma, managing team schedules) |

**Preconditions:**
- GHL calendar is configured
- Appointments exist in GHL
- Calendar sync is enabled

**User Journey:**
1. Uma opens Calendar Integration
2. She connects GHL calendar: "Sales Team Appointments"
3. Sync begins: "Importing 156 appointments..."
4. Appointments appear on BB calendar view
5. Each appointment shows:
   - Contact name and info
   - Appointment type
   - Duration
   - Notes
   - GHL link
6. She clicks an appointment
7. Detail view shows full information with quick actions
8. She reschedules appointment
9. Change syncs to GHL calendar
10. Contact receives automatic reschedule notification from GHL
11. New appointment booked in GHL appears in BB within 5 minutes

**Expected Behavior:**
- Appointments sync bidirectionally
- Reschedules update both systems
- Cancellations sync with notifications
- Recurring appointments handled correctly
- Timezone conversions are accurate

**Success Criteria:**
- [ ] Appointments sync within 5 minutes
- [ ] All appointment fields are captured
- [ ] Reschedule syncs immediately
- [ ] Cancellation syncs immediately
- [ ] Recurring patterns are preserved
- [ ] Timezone handling is correct
- [ ] Conflict detection works

**Edge Cases:**
1. Appointment time conflict (show warning, allow override)
2. Recurring appointment modification (modify series or instance)
3. Appointment with no linked contact (create or log)
4. Past appointments (import for history, don't trigger reminders)
5. Cancelled appointment (show as cancelled, not deleted)
6. Very long appointment notes (truncate with "show more")

**Test Data Requirements:**
- 50 appointments across next 30 days
- Recurring weekly appointment
- Appointment with detailed notes
- Appointment linked to contact
- Cancelled appointment

---

### UX-38-010: Data Isolation and Security

| Field | Value |
|-------|-------|
| **Story ID** | UX-38-010 |
| **Title** | System maintains strict data isolation between tenants |
| **User Persona** | Compliance Officer (Victor, ensuring data security) |

**Preconditions:**
- Multiple tenants use GHL integration
- Each tenant has their own GHL account
- Security audit is required

**User Journey:**
1. Victor opens Security & Compliance settings
2. He reviews GHL Integration security settings
3. Dashboard shows:
   - Encryption: AES-256 at rest, TLS 1.3 in transit
   - Token storage: Encrypted, separate per tenant
   - Access logs: Enabled, 90-day retention
4. He clicks "Data Isolation Audit"
5. Audit runs and reports:
   - Tenant isolation: PASS
   - Cross-tenant queries: BLOCKED
   - API scope verification: PASS
6. He reviews access logs for GHL integration
7. Logs show all API calls with tenant ID, timestamp, action
8. He tests cross-tenant access (should fail)
9. Test confirms: "Access denied - tenant mismatch"
10. He generates compliance report
11. PDF report shows all security measures and audit results

**Expected Behavior:**
- Each tenant's GHL data is completely isolated
- API tokens cannot access other tenants' data
- All access is logged with tenant context
- Cross-tenant access attempts are blocked and logged
- Compliance reports are automatically generated

**Success Criteria:**
- [ ] No cross-tenant data access is possible
- [ ] All API calls are logged with tenant ID
- [ ] Token encryption meets industry standards
- [ ] Access logs are queryable
- [ ] Compliance report is comprehensive
- [ ] Failed access attempts are flagged
- [ ] Data deletion respects tenant boundaries

**Edge Cases:**
1. Tenant migrates GHL account (re-authorize with new tokens)
2. Token compromised (immediate revocation capability)
3. Tenant requests data export (export own data only)
4. Tenant requests data deletion (complete removal)
5. System admin accessing tenant data (requires explicit permission, logged)
6. API returns data for wrong tenant (critical error, immediate investigation)

**Test Data Requirements:**
- Two separate tenant accounts
- GHL data in each tenant
- Admin account with multi-tenant access
- Simulated cross-tenant access attempt
- Compliance audit checklist

---

## Appendix

### A. Test Environment Requirements

| Requirement | Details |
|-------------|---------|
| GoHighLevel Account | Agency account with 10+ sub-accounts |
| Test Email Accounts | 5 Gmail accounts with OAuth configured |
| Vapi.ai Account | Test credentials with available minutes |
| Image Generation APIs | DALL-E 3, Stable Diffusion, Midjourney access |
| Database | Test database with 100,000+ records |
| Background Job Queue | Redis or equivalent queue system |
| CDN | Configured for image delivery |

### B. Persona Reference

| Persona | Role | Technical Level | Primary Use Cases |
|---------|------|-----------------|-------------------|
| Sarah | Agency Owner | Intermediate | Email sync, job monitoring |
| Mike | Sales Manager | Basic | Incremental sync, cost tracking |
| Lisa | Marketing Coordinator | Intermediate | Draft generation, campaigns |
| James | Sales Director | Intermediate | Voice calls, pipeline |
| Rachel | Operations Manager | Basic | Scheduled tasks |
| Dev | Technical User | Advanced | Debugging, retry behavior |
| Emma | Marketing Specialist | Intermediate | Image generation |
| Carlos | Graphic Designer | Advanced | Advanced prompts |
| Diana | Creative Director | Intermediate | Model comparison |
| Marcus | Agency Owner | Intermediate | GHL setup |
| Nancy | Agency Manager | Intermediate | Contact sync |
| Oliver | Sales Rep | Basic | Pipeline management |

### C. Error Code Reference

| Code | Category | Description | User Action |
|------|----------|-------------|-------------|
| BGJ-001 | Background Job | Job timeout exceeded | Retry or contact support |
| BGJ-002 | Background Job | Insufficient credits | Purchase credits |
| BGJ-003 | Background Job | API rate limit | Wait and retry |
| IMG-001 | Image Generation | Content policy violation | Modify prompt |
| IMG-002 | Image Generation | Generation timeout | Retry |
| IMG-003 | Image Generation | Invalid parameters | Check settings |
| GHL-001 | GHL Integration | OAuth token expired | Re-authorize |
| GHL-002 | GHL Integration | Sub-account not found | Verify account |
| GHL-003 | GHL Integration | Sync conflict | Review and resolve |

---

**Document End**

*This document is maintained by the QA and Product teams. For updates or corrections, contact the documentation owner.*
