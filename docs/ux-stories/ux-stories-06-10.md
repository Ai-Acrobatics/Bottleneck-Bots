# User Experience Stories: Features 6-10

## Document Information

| Field | Value |
|-------|-------|
| **Document Version** | 1.0 |
| **Status** | Ready for QA |
| **Author** | Development Team |
| **Created** | 2026-01-11 |
| **Last Updated** | 2026-01-11 |
| **Purpose** | Testing and Validation |

---

## Table of Contents

1. [Feature 6: Voice Agent](#feature-6-voice-agent)
2. [Feature 7: Webhooks Management](#feature-7-webhooks-management)
3. [Feature 8: SEO Management & Audits](#feature-8-seo-management--audits)
4. [Feature 9: Ad Manager](#feature-9-ad-manager)
5. [Feature 10: Analytics Dashboard](#feature-10-analytics-dashboard)

---

# Feature 6: Voice Agent

## Overview
AI-powered outbound phone calling capabilities through Vapi.ai telephony integration, enabling automated call campaigns with recording, transcription, and success rate tracking.

---

### UX-VOICE-001: Create New Call Campaign

**Title**: Agency Owner Creates Call Campaign with Custom Script

**User Persona**: Sarah, Sales Manager at a digital marketing agency managing 15 client accounts

**Preconditions**:
- User is authenticated and logged into the platform
- User has at least 50 credits in their account
- User has an existing lead list with at least 10 leads containing phone numbers
- Vapi.ai integration is configured in the system

**User Journey**:
1. User navigates to "Voice Agent" from the main navigation menu
2. User clicks "Create New Campaign" button
3. System displays campaign creation form with fields:
   - Campaign name (required)
   - Description (optional)
   - Script/prompt (required, with character counter)
   - Lead list selector (dropdown)
4. User enters campaign name: "Q1 Outreach - Enterprise Leads"
5. User writes custom AI script with greeting, value proposition, and closing
6. User selects lead list "Enterprise Prospects - January 2026"
7. User expands "Advanced Settings" to configure:
   - Voice type: Female
   - Speed: 1.0x
   - Language: en-US
   - Max call duration: 300 seconds
   - Enable recording: Yes
   - Enable transcription: Yes
   - Voicemail detection: Yes
8. User clicks "Create Campaign" button
9. System validates inputs and creates campaign in "draft" status
10. User is redirected to campaign detail page with confirmation message

**Expected Behavior**:
- Form validation prevents submission without required fields
- Character limits enforced for script (max 5000 characters)
- Lead list dropdown only shows lists with phone numbers
- Campaign is created in "draft" status
- Campaign appears in campaigns list immediately
- Credit balance is NOT deducted until calls are made

**Success Criteria**:
- [ ] Campaign created successfully in database
- [ ] Campaign status is "draft"
- [ ] All settings saved correctly
- [ ] User redirected to campaign detail page
- [ ] Success toast notification displayed
- [ ] Campaign visible in campaigns list
- [ ] API response time < 500ms

**Edge Cases**:
- Empty lead list selected (no leads with phone numbers) - show warning
- Script contains profanity or prohibited content - AI moderation warning
- User loses connection during submission - form data preserved
- Duplicate campaign name - allow with unique ID suffix
- Maximum campaigns limit reached (if applicable) - show upgrade prompt

**Test Data Requirements**:
- Lead list with 50+ leads, 80% with valid phone numbers
- Lead list with 0 phone numbers (for edge case testing)
- Script samples: short (50 chars), medium (500 chars), maximum (5000 chars)
- Various voice/language combinations

---

### UX-VOICE-002: Start Campaign and Monitor Calls

**Title**: User Starts Campaign and Monitors Real-Time Call Progress

**User Persona**: Mike, Lead Generation Specialist running daily outreach campaigns

**Preconditions**:
- User has a campaign in "draft" status
- Campaign has an associated lead list with 100 leads
- User has 150 credits available
- System job queue is operational

**User Journey**:
1. User navigates to campaign detail page for "Q1 Outreach Campaign"
2. User reviews campaign summary showing:
   - 100 leads ready to call
   - Estimated credit cost: 100 credits
   - Estimated completion time: 2-3 hours
3. User clicks "Start Campaign" button
4. System displays confirmation modal:
   - "This will queue 100 calls and deduct credits as calls are made"
   - "Are you sure you want to start this campaign?"
5. User clicks "Confirm Start"
6. System begins queuing calls, updates status to "running"
7. Dashboard updates in real-time showing:
   - Calls queued: 100
   - Calls in progress: 3 (concurrent limit)
   - Calls completed: 0
   - Calls answered: 0
   - Success rate: --%
8. User watches as calls complete and metrics update
9. After 10 calls complete, user sees:
   - Calls completed: 10
   - Calls answered: 4
   - Success rate: 40%
   - Total duration: 8 minutes
10. User can click on individual calls to see details

**Expected Behavior**:
- Campaign status changes from "draft" to "running"
- Calls are queued respecting rate limits (5/second, 3 concurrent)
- Real-time updates via SSE or polling (every 5 seconds)
- Credit deduction occurs per call attempt
- Failed calls are retried automatically (up to 2 attempts)
- Leads without phone numbers are skipped with warning count

**Success Criteria**:
- [ ] Campaign status transitions correctly
- [ ] Calls queued within 10 seconds for 1000 leads
- [ ] Real-time metrics update every 5 seconds
- [ ] Concurrent call limit (3) is enforced
- [ ] Rate limit (5/second) is enforced
- [ ] Credits deducted correctly per call
- [ ] No calls made to leads without phone numbers

**Edge Cases**:
- Insufficient credits mid-campaign - pause and notify user
- Vapi.ai service becomes unavailable - circuit breaker activates, queue pauses
- User closes browser - campaign continues in background
- Network timeout during call initiation - automatic retry
- All leads have invalid phone numbers - campaign completes with 0 calls made

**Test Data Requirements**:
- Campaign with 10, 100, and 1000 leads
- Leads with various phone number formats (E.164, local, international)
- Leads with missing/invalid phone numbers
- Various credit balances (exact amount, excess, insufficient)

---

### UX-VOICE-003: Access Call Recordings and Transcripts

**Title**: User Reviews Call Recording and AI-Generated Transcript

**User Persona**: Jessica, Quality Assurance Manager reviewing call quality

**Preconditions**:
- User has a completed campaign with recorded calls
- At least 5 calls have recordings and transcriptions available
- Recordings are stored and accessible via Vapi.ai

**User Journey**:
1. User navigates to campaign "Q1 Outreach Campaign"
2. User clicks on "Calls" tab to view call history
3. User sees table with columns:
   - Lead name/phone number
   - Status (completed, failed, no answer, voicemail)
   - Outcome (interested, not_interested, callback, etc.)
   - Duration
   - Recording icon
   - Transcript icon
4. User clicks on a completed call with "interested" outcome
5. System displays call detail modal with:
   - Call summary
   - Outcome selection (editable)
   - Notes field
   - Recording player with controls
   - Full transcript text
6. User plays recording using embedded audio player
7. User reads transcript and highlights key phrases
8. User updates outcome to "callback" and adds note: "Follow up Friday 3pm"
9. User closes modal

**Expected Behavior**:
- Recordings play directly in browser (no download required)
- Transcripts are searchable within the page
- Playback controls: play/pause, seek, speed adjustment, volume
- Transcript timestamps allow jumping to specific points
- Changes to outcome/notes save automatically
- Recording URLs remain valid for at least 30 days

**Success Criteria**:
- [ ] Recording loads and plays within 3 seconds
- [ ] Transcript displays with proper formatting
- [ ] Audio player has full playback controls
- [ ] Outcome updates save successfully
- [ ] Notes persist after page refresh
- [ ] Search functionality finds text in transcript
- [ ] Download option available for recordings

**Edge Cases**:
- Recording failed to save - show "Recording unavailable" message
- Transcription pending - show loading indicator with ETA
- Long transcript (10+ minutes) - paginate or virtualize display
- Non-English call - transcript may be less accurate, show confidence score
- User navigates away during playback - playback stops gracefully

**Test Data Requirements**:
- Recordings of various lengths: 30 seconds, 2 minutes, 5 minutes
- Transcripts with various quality levels
- Calls with multiple outcomes
- Calls with and without notes

---

### UX-VOICE-004: View Campaign Analytics and Success Rates

**Title**: Manager Analyzes Campaign Performance and ROI

**User Persona**: David, Marketing Director evaluating campaign effectiveness

**Preconditions**:
- User has 3 completed campaigns with varying success rates
- Campaigns have at least 50 calls each
- All calls have outcome data recorded

**User Journey**:
1. User navigates to "Voice Agent" dashboard
2. User views overview cards showing:
   - Total campaigns: 3
   - Total calls made: 450
   - Overall success rate: 35%
   - Total credits used: 450
3. User clicks on specific campaign "Q1 Outreach - Enterprise"
4. User views detailed analytics:
   - Calls made: 150
   - Calls answered: 62 (41.3%)
   - Successful calls: 45 (30%)
   - Failed calls: 8 (5.3%)
   - Timeouts: 2 (1.3%)
   - Total duration: 4.5 hours
   - Credits used: 150
   - Cost per successful call: 3.33 credits
5. User views outcome breakdown pie chart:
   - Interested: 45 (30%)
   - Not interested: 35 (23%)
   - Callback requested: 15 (10%)
   - Voicemail: 25 (17%)
   - No answer: 28 (19%)
   - Hung up: 2 (1%)
6. User exports data to CSV for further analysis
7. User compares campaign to previous campaigns using trend chart

**Expected Behavior**:
- All metrics calculated accurately in real-time
- Charts render within 2 seconds
- Export generates complete CSV with all call data
- Filtering by date range, outcome, or status works correctly
- Comparison view shows side-by-side metrics

**Success Criteria**:
- [ ] All statistics match database records exactly
- [ ] Success rate calculated correctly
- [ ] Charts render without errors
- [ ] CSV export contains all relevant columns
- [ ] Data refreshes when campaign status changes
- [ ] Historical trends display correctly
- [ ] Export completes within 10 seconds for 1000 calls

**Edge Cases**:
- Campaign with 0 calls - show "No data yet" message
- Campaign still running - show live updating metrics
- Extremely high call volume (10,000+) - paginate data, aggregate stats
- Export fails - show retry option with error message
- Missing outcome data - show "uncategorized" bucket

**Test Data Requirements**:
- Campaigns with various sizes: 10, 100, 1000 calls
- Campaigns with different success rates: 10%, 50%, 90%
- Campaigns with missing data points
- Historical data spanning 6+ months

---

### UX-VOICE-005: Schedule Calls for Optimal Times

**Title**: User Schedules Campaign for Business Hours in Target Timezone

**User Persona**: Lisa, Remote Sales Rep managing calls across time zones

**Preconditions**:
- User has a campaign in draft status
- Lead list contains leads in multiple time zones
- User has configured their local timezone in settings

**User Journey**:
1. User navigates to campaign "West Coast Prospects"
2. User clicks "Schedule" instead of "Start Now"
3. System displays scheduling options:
   - Start date and time picker
   - Time zone selector (defaults to lead's timezone or user's)
   - Calling hours restriction: 9 AM - 6 PM
   - Days of week: Monday-Friday only
4. User sets:
   - Start date: January 15, 2026
   - Start time: 9:00 AM PST
   - Calling window: 9 AM - 5 PM only
   - Skip weekends: Yes
5. User clicks "Schedule Campaign"
6. System validates schedule and shows confirmation:
   - "Campaign will start in 4 days"
   - "Calls will be made Monday-Friday, 9 AM - 5 PM PST"
   - "Estimated completion: January 17, 2026"
7. User confirms scheduling
8. Campaign status changes to "scheduled"
9. User can see countdown timer on campaign card

**Expected Behavior**:
- Time zone handling respects both user and lead time zones
- Calling hours restriction prevents calls outside business hours
- Weekend skipping pauses campaign on Saturday/Sunday
- Schedule can be modified or cancelled before start
- Email/notification sent when campaign begins

**Success Criteria**:
- [ ] Schedule created with correct start time
- [ ] Time zone conversion accurate
- [ ] Calling hours enforced correctly
- [ ] Weekend calls properly skipped
- [ ] Campaign starts automatically at scheduled time
- [ ] User receives notification when campaign starts
- [ ] Schedule can be edited or cancelled

**Edge Cases**:
- Schedule set in the past - show error, require future date
- Lead list spans multiple time zones - respect each lead's local time
- Daylight saving time transition during campaign - handle correctly
- Server restarts during scheduled wait - resume queue on startup
- All calling hours pass without completing - resume next business day

**Test Data Requirements**:
- Leads in various time zones: EST, PST, UTC, GMT+5
- Test dates around DST transitions
- Various calling hour configurations
- Weekend and holiday dates

---

### UX-VOICE-006: Handle Insufficient Credits During Campaign

**Title**: Campaign Pauses Due to Low Credit Balance

**User Persona**: New user Tom with limited credits running first campaign

**Preconditions**:
- User has 20 credits remaining
- Campaign has 50 leads to call
- Campaign is in "running" status with 15 calls already made

**User Journey**:
1. Campaign is running, 15 calls completed (15 credits used)
2. User has 5 credits remaining
3. System queues next batch of calls
4. After 5 more calls, credits reach 0
5. System automatically pauses campaign
6. User receives email notification: "Campaign paused - insufficient credits"
7. User sees banner on dashboard: "Campaign paused due to low credits"
8. User clicks "Add Credits" button
9. User purchases 100 credits
10. User returns to campaign and clicks "Resume Campaign"
11. System resumes calling remaining 30 leads
12. Campaign completes successfully

**Expected Behavior**:
- Campaign pauses gracefully when credits depleted
- Calls in progress complete (not interrupted)
- Clear notification sent to user
- Campaign status changes to "paused" with reason
- Resume button appears once credits added
- No calls are lost or duplicated

**Success Criteria**:
- [ ] Campaign pauses at exactly 0 credits
- [ ] Active calls complete before pause
- [ ] Email notification sent within 1 minute
- [ ] Dashboard shows clear pause reason
- [ ] Purchase flow works seamlessly
- [ ] Resume continues from correct position
- [ ] No duplicate calls after resume

**Edge Cases**:
- User adds exactly the needed credits - campaign should complete
- Multiple campaigns running simultaneously - pause all or just affected?
- Credit refund for failed call that depleted balance - auto-resume
- User's payment method fails - maintain pause, show payment error
- Credits added by admin - verify auto-resume or notification

**Test Data Requirements**:
- Various starting credit balances: 5, 10, 25, 50
- Campaign sizes matching and exceeding credit balances
- Multiple concurrent campaigns
- Various payment methods

---

### UX-VOICE-007: Pause and Resume Active Campaign

**Title**: User Manually Pauses Campaign to Review Initial Results

**User Persona**: Quality-conscious manager Alex who wants to review early calls

**Preconditions**:
- Campaign "New Product Launch" is actively running
- 25 of 100 calls have been completed
- User notices success rate is lower than expected (15%)

**User Journey**:
1. User views campaign dashboard, sees 15% success rate
2. User clicks "Pause Campaign" button
3. System displays confirmation: "This will pause all pending calls. Calls in progress will complete."
4. User confirms pause
5. 3 calls in progress complete (28 total completed)
6. Campaign status changes to "paused"
7. User reviews recordings of unsuccessful calls
8. User identifies script issue and edits the script
9. User clicks "Resume Campaign"
10. System shows confirmation: "Resume with updated script?"
11. User confirms, campaign continues with remaining 72 leads
12. Success rate improves to 35% with new script

**Expected Behavior**:
- Pause command processed within 5 seconds
- In-progress calls complete normally
- Queued calls are held, not cancelled
- Script can be edited while paused
- Resume uses updated script for remaining calls
- Statistics continue from pause point

**Success Criteria**:
- [ ] Pause command stops queue within 5 seconds
- [ ] In-progress calls complete successfully
- [ ] Paused status reflected in UI immediately
- [ ] Script editable during pause
- [ ] Resume continues from correct position
- [ ] Updated script applied to remaining calls
- [ ] Statistics are continuous, not reset

**Edge Cases**:
- Pause clicked multiple times - idempotent operation
- Resume clicked immediately after pause - no duplicate calls
- Long pause (24+ hours) - campaign should resume normally
- System restart during pause - maintain paused state
- All calls complete right as pause clicked - status becomes "completed"

**Test Data Requirements**:
- Campaign with 100+ leads
- Scripts of various lengths
- Test pause at different completion percentages: 10%, 50%, 90%

---

### UX-VOICE-008: Make Single Ad-Hoc Call

**Title**: User Makes Quick Test Call Before Launching Campaign

**User Persona**: Developer Daniel testing Vapi.ai integration

**Preconditions**:
- User has at least 1 credit
- User has Vapi.ai configured
- User wants to test script without creating full campaign

**User Journey**:
1. User clicks "Quick Call" button on Voice Agent dashboard
2. System displays quick call form:
   - Phone number (required)
   - Script/prompt (required)
   - Voice settings (optional, defaults shown)
3. User enters:
   - Phone number: +1-555-123-4567
   - Script: "Hello, this is a test call from Bottleneck Bots..."
   - Voice: Default female
4. User clicks "Make Call"
5. System validates phone number format
6. System initiates call immediately
7. User sees call status: "Calling..."
8. Call connects, user sees: "Connected"
9. Call completes, user sees: "Completed - 45 seconds"
10. User can play recording and read transcript
11. 1 credit deducted from balance

**Expected Behavior**:
- Phone number validated for E.164 format
- Call initiates within 5 seconds
- Real-time status updates during call
- Recording and transcript available after completion
- Single credit deducted regardless of duration
- Call not associated with any campaign

**Success Criteria**:
- [ ] Phone validation catches invalid numbers
- [ ] Call initiates within 5 seconds
- [ ] Status updates in real-time
- [ ] Recording available within 60 seconds of completion
- [ ] Transcript generated successfully
- [ ] Credit deducted correctly
- [ ] Call appears in call history

**Edge Cases**:
- Invalid phone format - show format error with example
- Phone number unreachable - mark as failed, still deduct credit
- Very long call (10+ minutes) - enforce max duration limit
- Script contains invalid characters - sanitize or reject
- Concurrent quick calls - allow up to 3 simultaneous

**Test Data Requirements**:
- Valid phone numbers in various formats
- Invalid phone numbers
- Scripts of various lengths
- Test numbers that always answer/busy/no answer

---

### UX-VOICE-009: Delete Campaign with Associated Data

**Title**: User Deletes Old Campaign and All Associated Call Records

**User Persona**: Organized user Maria cleaning up completed campaigns

**Preconditions**:
- User has 5 completed campaigns
- Oldest campaign "Q3 2025 Outreach" is 6 months old
- Campaign has 500 calls with recordings and transcripts

**User Journey**:
1. User navigates to "Voice Agent" and views campaigns list
2. User finds "Q3 2025 Outreach" and clicks options menu (...)
3. User selects "Delete Campaign"
4. System displays warning modal:
   - "Delete 'Q3 2025 Outreach'?"
   - "This will permanently delete:"
   - "- 500 call records"
   - "- 450 recordings"
   - "- 485 transcripts"
   - "This action cannot be undone."
5. User types campaign name to confirm: "Q3 2025 Outreach"
6. User clicks "Delete Permanently"
7. System deletes campaign and all associated data
8. User sees success message: "Campaign deleted successfully"
9. Campaign removed from list

**Expected Behavior**:
- Confirmation requires typing campaign name
- Deletion is permanent (no soft delete for old campaigns)
- All associated calls, recordings, transcripts deleted
- Recording files removed from storage
- Database records cascade deleted
- Credits are NOT refunded for old campaigns

**Success Criteria**:
- [ ] Confirmation modal shows accurate data counts
- [ ] Type-to-confirm works correctly
- [ ] Campaign deleted from database
- [ ] All associated calls deleted
- [ ] Recording files deleted from storage
- [ ] Action completes within 30 seconds
- [ ] Success message displayed

**Edge Cases**:
- Attempting to delete active/running campaign - block deletion
- Very large campaign (10,000+ calls) - show progress indicator
- Deletion fails midway - rollback or show partial deletion warning
- Concurrent access during deletion - handle race condition
- Storage deletion fails - log error but complete database deletion

**Test Data Requirements**:
- Campaigns of various sizes: 10, 100, 1000, 10000 calls
- Campaigns in various statuses: draft, completed, cancelled
- Campaigns with and without recordings

---

### UX-VOICE-010: Credit Balance Warning and Auto-Pause

**Title**: User Receives Low Credit Warning Before Campaign Starts

**User Persona**: Budget-conscious user Kelly monitoring usage

**Preconditions**:
- User has 25 credits remaining
- User attempts to start campaign with 100 leads
- System has credit warning threshold set at 10 credits

**User Journey**:
1. User navigates to campaign with 100 leads
2. User clicks "Start Campaign"
3. System displays warning modal:
   - "Insufficient credits for full campaign"
   - "Campaign requires: 100 credits"
   - "Your balance: 25 credits"
   - "Options:"
   - [Add Credits] [Start Anyway (25 calls)] [Cancel]
4. User clicks "Start Anyway"
5. System starts campaign with warning: "Campaign will pause after 25 calls"
6. Campaign runs, user receives notification at 20 credits: "Low credit warning"
7. Campaign pauses at 0 credits
8. User adds 100 credits
9. User resumes campaign
10. Campaign completes remaining 75 calls

**Expected Behavior**:
- Pre-start warning shows accurate credit requirements
- User can choose to start partial campaign
- Warning notification sent before complete depletion
- Auto-pause occurs at 0 credits
- Easy path to add credits from warning
- Resume function works seamlessly

**Success Criteria**:
- [ ] Pre-start calculation accurate
- [ ] Warning modal shows all options
- [ ] Partial start works correctly
- [ ] Low credit notification sent at threshold
- [ ] Auto-pause activates at 0 credits
- [ ] Resume continues correctly
- [ ] Credit purchase flow integrated

**Edge Cases**:
- Credits added while warning modal is open - update count live
- Campaign size equals exact credit balance - start without warning
- User has negative credit balance (admin override) - block campaign start
- Credit price changes during campaign - use locked-in rate
- Multiple campaigns queued - prioritize running ones

**Test Data Requirements**:
- Various credit balances: 0, 10, 25, 50, 100, 1000
- Campaign sizes of various multiples of credit balance
- Admin-applied credit adjustments

---

# Feature 7: Webhooks Management

## Overview
Multi-channel communication endpoints enabling SMS, Email, and Custom Webhook integration with AI-powered bot conversations, rate limiting, and secure authentication.

---

### UX-WEBHOOK-001: Create SMS Webhook Channel

**Title**: Agency Owner Configures Twilio SMS Channel for Client Communication

**User Persona**: Agency owner Marcus setting up SMS-based task creation

**Preconditions**:
- User is authenticated with active subscription
- User has fewer than 3 existing webhook channels
- User has Twilio account credentials ready
- Twilio account is active with phone number

**User Journey**:
1. User navigates to "Webhooks" from main navigation
2. User clicks "Add Channel" button
3. System displays channel type selector:
   - SMS (Twilio)
   - Email
   - Custom Webhook
4. User selects "SMS (Twilio)"
5. System displays SMS configuration form:
   - Channel name (required)
   - Twilio Account SID (required)
   - Twilio Auth Token (required, masked input)
   - Twilio Phone Number (required)
   - Messaging Service SID (optional)
6. User enters credentials and channel name "Client SMS Line"
7. User clicks "Verify Credentials"
8. System tests Twilio API connection
9. System shows green checkmark: "Credentials verified"
10. User clicks "Create Channel"
11. System creates channel and displays:
    - Inbound webhook URL
    - Webhook token (for Twilio webhook configuration)
    - HMAC secret key (64 hex characters)
12. User copies webhook URL to configure in Twilio console

**Expected Behavior**:
- Twilio credentials validated before saving
- Auth token stored encrypted at rest
- Webhook URL generated with unique token
- HMAC secret auto-generated
- Channel set as primary if first webhook
- Rate limits set to defaults (30/min, 200/hour)

**Success Criteria**:
- [ ] Twilio credentials validation works
- [ ] Auth token encrypted in database
- [ ] Unique webhook URL generated
- [ ] HMAC secret is 64 hex characters
- [ ] Channel appears in webhooks list
- [ ] Webhook URL format correct: /api/webhooks/inbound/{token}
- [ ] Copy buttons work for all credentials

**Edge Cases**:
- Invalid Twilio credentials - show specific error message
- Twilio account suspended - show appropriate warning
- Phone number not owned by account - show configuration help
- Network timeout during verification - allow retry
- Maximum 3 channels reached - show upgrade or delete option

**Test Data Requirements**:
- Valid Twilio test credentials
- Invalid Twilio credentials
- Twilio account with multiple phone numbers
- Edge case phone number formats

---

### UX-WEBHOOK-002: Configure Email Webhook Channel

**Title**: User Sets Up Email Channel for Task Forwarding

**User Persona**: Operations manager Priya who receives tasks via email

**Preconditions**:
- User has active subscription
- User has fewer than 3 webhook channels
- SMTP server credentials available

**User Journey**:
1. User navigates to Webhooks and clicks "Add Channel"
2. User selects "Email" channel type
3. System displays email configuration form:
   - Channel name (required)
   - Inbound email address (auto-generated unique address)
   - Forwarding enabled toggle
   - SMTP configuration section:
     - SMTP Host
     - SMTP Port (25, 465, 587)
     - SMTP Username
     - SMTP Password
     - From Address
     - Reply-To Address (optional)
4. User enters channel name "Task Inbox"
5. User views auto-generated email: tasks-abc123@bottleneck-bots.io
6. User enables forwarding and configures SMTP for replies
7. User clicks "Test Configuration"
8. System sends test email to user's registered email
9. User confirms receipt and clicks "Create Channel"
10. System creates channel and displays configuration summary

**Expected Behavior**:
- Unique inbound email address generated
- SMTP credentials validated before saving
- Test email sent and receipt confirmed
- Email provider-specific warnings shown (Gmail, Outlook)
- Channel activated immediately after creation

**Success Criteria**:
- [ ] Unique email address generated
- [ ] SMTP test email delivered successfully
- [ ] Credentials encrypted in database
- [ ] Channel active and receiving emails
- [ ] Inbound emails parsed correctly
- [ ] Reply functionality works

**Edge Cases**:
- SMTP authentication fails - show specific error
- Email address already in use - generate new unique address
- Port blocked by firewall - suggest alternative ports
- SSL/TLS configuration mismatch - provide troubleshooting
- Test email goes to spam - include spam folder check reminder

**Test Data Requirements**:
- Valid SMTP credentials (Gmail, Outlook, SendGrid)
- Invalid SMTP credentials
- Various port configurations
- Test emails with attachments

---

### UX-WEBHOOK-003: Create Custom Webhook with HMAC Authentication

**Title**: Developer Configures Secure Webhook for Zapier Integration

**User Persona**: Technical lead Alex integrating with external automation

**Preconditions**:
- User has development experience
- User has fewer than 3 webhook channels
- User plans to integrate with Zapier/Make/n8n

**User Journey**:
1. User navigates to Webhooks and clicks "Add Channel"
2. User selects "Custom Webhook" type
3. System displays custom webhook form:
   - Channel name (required)
   - Authentication type dropdown:
     - None
     - Bearer Token
     - API Key
     - HMAC Signature
   - Custom settings based on auth type
4. User selects "HMAC Signature" authentication
5. System displays HMAC configuration:
   - HMAC Secret Key (auto-generated, regeneratable)
   - Signature header name: X-Webhook-Signature
   - Hash algorithm: SHA-256
6. User enters channel name "Zapier Integration"
7. User views auto-generated HMAC secret
8. User configures outbound webhook settings:
   - Outbound URL (for notifications)
   - HTTP method (POST/PUT)
   - Custom headers (JSON format)
9. User clicks "Create Channel"
10. System creates channel and displays:
    - Inbound webhook URL
    - HMAC secret (copy button)
    - Signature verification code sample (Node.js, Python)

**Expected Behavior**:
- HMAC secret is cryptographically random (64 hex chars)
- Code samples are accurate and ready to use
- Outbound webhook URL validated
- Test payload option available
- Documentation links provided

**Success Criteria**:
- [ ] HMAC secret generated correctly
- [ ] Signature verification works with sample code
- [ ] Inbound URL accepts authenticated requests
- [ ] Unauthenticated requests rejected with 401
- [ ] Code samples execute correctly
- [ ] Outbound webhook delivers payloads

**Edge Cases**:
- Invalid outbound URL format - show validation error
- HMAC secret copied before save - warn about unsaved changes
- Authentication type changed mid-configuration - reset dependent fields
- Very long custom headers - enforce size limit
- Outbound webhook unreachable - show warning but allow save

**Test Data Requirements**:
- Valid outbound webhook URLs (webhook.site, requestbin)
- Invalid URL formats
- Sample payloads for each event type
- HMAC signature verification test vectors

---

### UX-WEBHOOK-004: Receive and Route Inbound SMS Message

**Title**: Agency Owner Receives SMS Task and Bot Creates Task

**User Persona**: Agency owner Raj who texts tasks to his AI assistant

**Preconditions**:
- User has active SMS webhook channel configured
- Twilio webhook pointing to inbound URL
- Bot conversation settings configured
- Auto-create tasks enabled

**User Journey**:
1. User sends SMS from phone: "Create task: Review client proposal by Friday"
2. Twilio delivers message to webhook endpoint
3. System validates webhook token and rate limit
4. System parses SMS content:
   - Sender: +1-555-123-4567
   - Content: "Create task: Review client proposal by Friday"
5. System matches sender to existing conversation or creates new
6. AI analyzes message:
   - Intent: Task creation
   - Title: "Review client proposal"
   - Deadline: Friday (next occurrence)
   - Priority: Medium (default)
7. System creates agency task in database
8. AI generates response: "Got it! Created task 'Review client proposal' due Friday, January 17th. Anything else?"
9. System sends SMS response via Twilio
10. User receives confirmation SMS on phone
11. Task appears in Agency Task Board

**Expected Behavior**:
- Message received within 2 seconds
- Intent detection accurate for task commands
- Deadline parsed correctly relative to current date
- Task created with correct fields
- Response sent within 5 seconds
- Conversation context maintained for follow-ups

**Success Criteria**:
- [ ] SMS received and logged
- [ ] Sender matched to conversation
- [ ] AI intent detection correct
- [ ] Task created in database
- [ ] Response SMS delivered
- [ ] Task visible in task board
- [ ] Response time < 10 seconds end-to-end

**Edge Cases**:
- Unknown sender - create new conversation, ask for identification
- Ambiguous message - ask for clarification
- Rate limit exceeded - queue message, respond with delay notice
- Invalid phone format in webhook - log error, don't crash
- Twilio webhook retry - idempotent handling (don't duplicate)
- Very long message (1600+ chars) - truncate or split

**Test Data Requirements**:
- Various task creation phrases
- Messages with dates in different formats
- Multi-message conversations
- Messages from new vs returning senders

---

### UX-WEBHOOK-005: Handle Rate-Limited Requests

**Title**: System Enforces Rate Limits on High-Volume Webhook

**User Persona**: Developer testing webhook integration with load test

**Preconditions**:
- Webhook channel configured with 30/min, 200/hour limits
- Developer has test script sending rapid requests
- Channel is active and receiving messages

**User Journey**:
1. Developer sends 30 requests in first minute
2. All 30 requests accepted (status 200)
3. Developer sends 31st request within same minute
4. System returns 429 status with response:
   ```json
   {
     "error": "RATE_LIMIT_MINUTE",
     "message": "Per-minute rate limit exceeded",
     "retryAfter": 45
   }
   ```
5. Response includes headers:
   - X-RateLimit-Limit: 30
   - X-RateLimit-Remaining: 0
   - X-RateLimit-Reset: 1736618400
   - Retry-After: 45
6. Developer waits 45 seconds and retries
7. Request succeeds
8. Developer views rate limit stats in dashboard:
   - Requests this minute: 1/30
   - Requests this hour: 31/200
9. Developer adjusts test script to respect limits

**Expected Behavior**:
- Exact rate limit enforcement (no off-by-one)
- Clear error response with retry guidance
- Standard rate limit headers included
- Dashboard shows real-time usage
- Limits reset on schedule (minute/hour boundaries)
- Burst handling for legitimate traffic patterns

**Success Criteria**:
- [ ] Rate limits enforced exactly at threshold
- [ ] 429 response includes all required fields
- [ ] Rate limit headers present and accurate
- [ ] Retry-After calculated correctly
- [ ] Dashboard shows live usage
- [ ] Limits configurable per channel

**Edge Cases**:
- Requests at exact second boundary - consistent behavior
- Clock skew between servers - use centralized time
- Limit set to 0 - effectively disable channel
- Change limit while at capacity - apply immediately
- Multiple requests in single millisecond - all counted

**Test Data Requirements**:
- Load test scripts at various rates
- Boundary condition tests (29, 30, 31 requests)
- Long-running tests spanning hour boundaries
- Concurrent requests from multiple sources

---

### UX-WEBHOOK-006: Test Outbound Webhook Delivery

**Title**: User Tests Outbound Webhook Before Going Live

**User Persona**: Developer ensuring integration works correctly

**Preconditions**:
- Custom webhook channel configured with outbound URL
- Outbound URL is accessible (e.g., webhook.site)
- Test payload ready

**User Journey**:
1. User navigates to webhook channel settings
2. User clicks "Test Webhook" button
3. System displays test configuration:
   - Event type selector (message.received, task.created, etc.)
   - Payload preview (editable JSON)
4. User selects "task.created" event
5. System shows sample payload:
   ```json
   {
     "event": "task.created",
     "timestamp": "2026-01-11T10:30:00Z",
     "webhookId": 123,
     "data": {
       "taskId": 456,
       "title": "Test Task",
       "priority": "high"
     }
   }
   ```
6. User clicks "Send Test"
7. System sends test payload to outbound URL
8. System displays result:
   - Status: 200 OK
   - Response time: 145ms
   - Response body (truncated if large)
9. User can see request in webhook.site dashboard
10. User marks test as successful

**Expected Behavior**:
- Test uses same code path as real webhooks
- HMAC signature included if configured
- Timeout after 30 seconds
- Response captured and displayed
- Test logged in webhook history
- No side effects (task not actually created)

**Success Criteria**:
- [ ] Test payload matches production format
- [ ] HMAC signature valid
- [ ] Request delivered to URL
- [ ] Response displayed accurately
- [ ] Test logged in history
- [ ] Retry button available on failure

**Edge Cases**:
- Outbound URL times out - show timeout error with retry
- URL returns non-2xx - show response and suggest fixes
- SSL certificate error - show specific SSL error
- Very large response body - truncate with "View full" option
- URL redirects - follow redirects, show final URL

**Test Data Requirements**:
- Various event types with sample payloads
- Outbound URLs with different response characteristics
- URLs requiring authentication
- URLs with SSL issues (for testing error handling)

---

### UX-WEBHOOK-007: Regenerate Webhook Token for Security

**Title**: User Rotates Webhook Token After Security Concern

**User Persona**: Security-conscious admin after suspected token leak

**Preconditions**:
- User has active webhook channel
- Webhook has been in use for 3 months
- User suspects token may have been exposed

**User Journey**:
1. User navigates to webhook channel settings
2. User clicks "Security" tab
3. User sees current token info:
   - Token: wh_abc123...xyz (partially masked)
   - Created: October 2025
   - Last used: 2 minutes ago
4. User clicks "Regenerate Token"
5. System displays warning:
   - "Regenerating will invalidate the current token immediately"
   - "All systems using the old URL will receive 404 errors"
   - "You will need to update all integrations"
6. User confirms by typing "REGENERATE"
7. System generates new token
8. System displays new webhook URL
9. Old token immediately invalidated
10. User copies new URL and updates Twilio/Zapier configuration

**Expected Behavior**:
- Confirmation required to prevent accidents
- Token invalidated immediately (not delayed)
- New token uses same format
- Webhook history preserved
- Old requests receive 404 (not 401)
- Audit log entry created

**Success Criteria**:
- [ ] Confirmation dialog prevents accidents
- [ ] New token generated immediately
- [ ] Old token returns 404
- [ ] New URL format matches old format
- [ ] History preserved under new token
- [ ] Audit log records regeneration

**Edge Cases**:
- Regenerate during active request - complete in-flight, new token after
- Regenerate twice rapidly - each creates new token
- Channel still receiving requests after regenerate - all fail with 404
- User copies old URL after regenerate - show it's invalid

**Test Data Requirements**:
- Active webhooks receiving traffic
- Integration tests verifying old token failure
- Timing tests for immediate invalidation

---

### UX-WEBHOOK-008: View Bot Conversation History

**Title**: User Reviews AI Conversation to Understand Context

**User Persona**: Support manager reviewing customer interaction

**Preconditions**:
- Webhook channel has active conversations
- At least 10 messages exchanged in one conversation
- Bot has created tasks from the conversation

**User Journey**:
1. User navigates to Webhooks dashboard
2. User clicks on "Conversations" tab
3. User sees list of conversations:
   - Sender identifier (phone/email)
   - Last message preview
   - Message count
   - Status (active, paused, resolved)
   - Last activity timestamp
4. User clicks on conversation with +1-555-123-4567
5. System displays conversation thread:
   - Messages in chronological order
   - Inbound (user) vs outbound (bot) differentiated
   - Timestamps for each message
   - Task creation events inline
   - AI analysis insights (intent, entities)
6. User scrolls through 10-message history
7. User sees context summary: "Client inquiring about project status, created 2 follow-up tasks"
8. User can expand AI analysis for each message

**Expected Behavior**:
- Conversations paginated (50 per page)
- Messages load quickly (< 1 second)
- Visual distinction between inbound/outbound
- Context summary auto-generated
- Links to created tasks functional
- Search within conversation available

**Success Criteria**:
- [ ] Conversation list loads within 1 second
- [ ] Messages display in correct order
- [ ] Inbound/outbound visually distinct
- [ ] Context summary accurate
- [ ] Task links work correctly
- [ ] Search finds message content

**Edge Cases**:
- Very long conversation (100+ messages) - virtualized scrolling
- Messages with attachments - show attachment indicators
- Conversation from deleted webhook - show historical data
- Unicode/emoji in messages - render correctly
- Very long individual message - truncate with expand option

**Test Data Requirements**:
- Conversations of various lengths
- Conversations with task creation events
- Conversations with various statuses
- Messages with special characters

---

### UX-WEBHOOK-009: Configure Bot Conversation Settings

**Title**: User Customizes AI Bot Personality and Behavior

**User Persona**: Brand-conscious agency owner customizing AI responses

**Preconditions**:
- User has at least one webhook channel
- User wants AI responses to match brand voice
- Bot conversation feature enabled

**User Journey**:
1. User navigates to webhook channel settings
2. User clicks "Bot Configuration" tab
3. System displays bot settings:
   - Personality profile: [Professional] [Friendly] [Concise]
   - Auto-create tasks: [Toggle]
   - Require confirmation: [Toggle]
   - Response language: [Dropdown]
   - Custom instructions: [Text area]
4. User selects "Friendly" personality
5. User enables "Auto-create tasks"
6. User enables "Require confirmation for high-priority tasks"
7. User adds custom instruction: "Always address the user as 'Hi there!' and sign off with 'Cheers, BB'"
8. User clicks "Save Configuration"
9. System applies changes to future conversations
10. User tests with SMS: "Create urgent task: Call client"
11. Bot responds: "Hi there! Got it - I'd like to create an urgent task 'Call client'. Should I go ahead? Cheers, BB"

**Expected Behavior**:
- Personality affects tone of all responses
- Auto-create toggle controls task creation behavior
- Confirmation required for specified conditions
- Custom instructions integrated into AI prompts
- Changes apply to new messages (not retroactive)
- Settings saved per channel

**Success Criteria**:
- [ ] Personality changes reflected in responses
- [ ] Auto-create toggle works correctly
- [ ] Confirmation flow triggers appropriately
- [ ] Custom instructions followed by AI
- [ ] Settings persist after save
- [ ] Different settings per channel

**Edge Cases**:
- Conflicting custom instructions - AI handles gracefully
- Very long custom instructions (5000+ chars) - enforce limit
- Custom instructions override safety - system prompts take precedence
- Change settings during active conversation - apply to next message
- Reset to defaults - confirmation required

**Test Data Requirements**:
- Messages testing each personality type
- High/medium/low priority task requests
- Messages in different languages
- Edge case custom instructions

---

### UX-WEBHOOK-010: Delete Webhook Channel

**Title**: User Removes Unused Webhook Channel

**User Persona**: User cleaning up deprecated integration

**Preconditions**:
- User has 3 webhook channels
- One channel "Old Zapier" hasn't been used in 30 days
- Channel has 500+ historical messages

**User Journey**:
1. User navigates to Webhooks dashboard
2. User clicks options menu (...) on "Old Zapier" channel
3. User selects "Delete Channel"
4. System displays deletion warning:
   - "Delete 'Old Zapier'?"
   - "This will permanently delete:"
   - "- 523 inbound messages"
   - "- 12 bot conversations"
   - "- Webhook URL will become invalid"
   - "If this is your primary channel, another will be promoted"
5. User types channel name "Old Zapier" to confirm
6. User clicks "Delete Permanently"
7. System soft-deletes channel (sets inactive)
8. User sees success message
9. Second channel is auto-promoted to primary
10. Channel removed from list

**Expected Behavior**:
- Type-to-confirm prevents accidents
- Soft delete preserves data for recovery period
- Primary channel auto-promoted if deleted
- Webhook URL returns 404 immediately
- Audit log entry created
- Recovery possible within 30 days (admin)

**Success Criteria**:
- [ ] Confirmation requires exact name match
- [ ] Channel marked inactive in database
- [ ] Webhook URL returns 404
- [ ] Primary auto-promoted
- [ ] Channel removed from list
- [ ] Messages preserved for recovery

**Edge Cases**:
- Delete only channel - no primary promotion needed
- Delete primary while others exist - auto-promote oldest
- Active conversations during delete - complete, then disable
- Deletion fails midway - rollback to active state
- Rapid create/delete cycles - handle race conditions

**Test Data Requirements**:
- Channels with various message counts
- Primary and non-primary channels
- Channels with active conversations

---

# Feature 8: SEO Management & Audits

## Overview
Comprehensive SEO analysis platform with AI-powered insights, keyword research, ranking tracking, backlink analysis, heatmap analytics, and automated PDF report generation.

---

### UX-SEO-001: Run Website SEO Audit

**Title**: SEO Specialist Performs Comprehensive Website Analysis

**User Persona**: SEO specialist Nina analyzing new client website

**Preconditions**:
- User has active subscription with 10+ credits
- Target website is publicly accessible
- Browserbase integration configured

**User Journey**:
1. User navigates to "SEO Management" from navigation
2. User clicks "New Audit" button
3. System displays audit configuration:
   - URL to audit (required)
   - Crawl depth: 1-5 pages
   - Include subdomains toggle
   - Mobile analysis toggle
4. User enters URL: https://example-client.com
5. User sets crawl depth to 3, enables mobile analysis
6. User clicks "Start Audit"
7. System validates URL accessibility
8. System displays progress:
   - "Crawling page 1 of 15..."
   - "Analyzing technical SEO..."
   - "Generating AI insights..."
9. Audit completes in 45 seconds
10. System displays comprehensive results:
    - Overall SEO Score: 72/100
    - Technical SEO: 85/100
    - Content: 68/100
    - Performance: 75/100
    - Mobile: 82/100
    - Security: 60/100
11. User views 50+ audit checks with pass/fail indicators
12. User sees AI-generated prioritized recommendations

**Expected Behavior**:
- URL validated before crawl starts
- Progress updates in real-time
- Crawl respects robots.txt by default
- 50+ checks performed across categories
- AI generates actionable recommendations
- Results cached for quick re-access
- 1 credit deducted upon completion

**Success Criteria**:
- [ ] URL validation catches invalid URLs
- [ ] Audit completes within 60 seconds for single page
- [ ] All 50+ checks executed
- [ ] Score calculated using weighted algorithm
- [ ] AI recommendations relevant and actionable
- [ ] Results accessible for 30+ days
- [ ] Credit deducted correctly

**Edge Cases**:
- Website blocks crawling - show partial results with warning
- JavaScript-heavy site - Browserbase renders correctly
- Very slow website - timeout after 60 seconds per page
- SSL certificate issues - warn but continue if possible
- Website returns 500 errors - report error, partial analysis
- Non-HTML content (PDF, image) - skip with note

**Test Data Requirements**:
- Websites with various SEO scores
- Websites with different tech stacks
- Websites with crawl restrictions
- Mobile-unfriendly websites
- Sites with security issues

---

### UX-SEO-002: Conduct Keyword Research

**Title**: Content Marketer Discovers High-Value Keywords

**User Persona**: Content marketer Jordan planning Q1 content strategy

**Preconditions**:
- User has active subscription
- User has industry/niche context
- 1 credit available

**User Journey**:
1. User navigates to SEO > Keyword Research
2. User enters seed keyword: "digital marketing automation"
3. User configures options:
   - Location: United States
   - Language: English
   - Include questions: Yes
   - Include long-tail: Yes
4. User clicks "Research Keywords"
5. System processes request (3-5 seconds)
6. System displays 100+ keyword suggestions:
   - Keyword phrase
   - Monthly search volume
   - Keyword difficulty (0-100)
   - CPC ($)
   - Competition level
   - Trend direction
   - Search intent
7. User sorts by search volume (highest first)
8. User filters by difficulty < 50
9. User sees 35 keywords matching criteria
10. User selects 10 keywords and clicks "Save to List"
11. User creates new list "Q1 Content Keywords"
12. Keywords saved with all metrics

**Expected Behavior**:
- 100+ relevant suggestions returned
- All metrics populated for each keyword
- Filtering and sorting work correctly
- Lists support unlimited keywords
- Export to CSV available
- 1 credit deducted per research query

**Success Criteria**:
- [ ] 100+ suggestions returned
- [ ] All metrics present and accurate
- [ ] Filter/sort functions work
- [ ] Keywords saveable to lists
- [ ] CSV export includes all columns
- [ ] Response time < 5 seconds

**Edge Cases**:
- Very niche keyword with low data - show available data, note limited
- Keyword in foreign language - detect and suggest location change
- Offensive keyword - filter from results
- No results found - suggest alternative keywords
- API rate limit - queue request, show estimated wait

**Test Data Requirements**:
- Seed keywords with varying popularity
- Industry-specific keywords
- Long-tail keywords
- Branded keywords

---

### UX-SEO-003: Track Keyword Rankings

**Title**: SEO Manager Monitors Client Keyword Positions

**User Persona**: SEO agency manager Elena tracking multiple clients

**Preconditions**:
- User has SEO project with domain verified
- User has keyword list ready
- User has sufficient credits for tracking

**User Journey**:
1. User navigates to SEO project "Client XYZ"
2. User clicks "Ranking Tracker" tab
3. User clicks "Add Keywords to Track"
4. User selects keywords from saved list (15 keywords)
5. User configures tracking:
   - Search engines: Google, Bing
   - Locations: United States, United Kingdom
   - Devices: Desktop, Mobile
6. User clicks "Start Tracking"
7. System initializes tracking, checks initial rankings
8. User views ranking dashboard:
   - Keyword table with current positions
   - Position changes (arrows up/down)
   - Featured snippet indicators
   - SERP features present
9. User clicks on specific keyword to see:
   - Historical ranking chart (30 days)
   - Ranking URL
   - Competitor positions (top 10)
10. User sets up alert: "Notify if position drops >5"

**Expected Behavior**:
- Rankings checked daily automatically
- Position changes calculated vs previous check
- Historical data retained 12 months
- Alerts trigger on threshold breach
- Data grouped by location/device
- 1 credit per keyword per manual check

**Success Criteria**:
- [ ] Rankings fetched within 3 seconds per keyword
- [ ] Daily automatic updates work
- [ ] Historical chart displays correctly
- [ ] Alerts trigger appropriately
- [ ] Location-based tracking accurate
- [ ] Mobile vs desktop tracked separately

**Edge Cases**:
- Keyword not ranking in top 100 - show "Not ranked"
- Domain has multiple ranking pages - show primary, note others
- SERP layout changes - adapt parsing
- Search engine returns captcha - retry with backoff
- New keyword takes 24h for first data - show "Pending"

**Test Data Requirements**:
- Keywords at various ranking positions
- Keywords with featured snippets
- Keywords with local pack results
- Multi-location tracking scenarios

---

### UX-SEO-004: Analyze Backlink Profile

**Title**: Link Builder Identifies Toxic Backlinks

**User Persona**: Link building specialist Carlos auditing client backlinks

**Preconditions**:
- User has SEO project created
- Domain added to project
- 1 credit available for analysis

**User Journey**:
1. User navigates to SEO project > Backlinks
2. User clicks "Run Backlink Analysis"
3. System starts analysis (10-30 seconds)
4. User views backlink dashboard:
   - Total backlinks: 1,245
   - Referring domains: 342
   - Domain Authority: 45
   - Domain Trust: 38
5. User sees backlink table:
   - Source URL
   - Target URL
   - Anchor text
   - Link type (dofollow/nofollow)
   - Domain Authority
   - Toxicity Score
6. User filters by Toxicity Score > 70
7. System shows 23 potentially toxic links
8. User expands toxic link to see reasons:
   - Spammy anchor text pattern
   - Low-quality source domain
   - Part of link network
9. User exports toxic links for disavow file
10. User views anchor text distribution pie chart

**Expected Behavior**:
- Backlink discovery comprehensive
- Toxicity scoring accurate (90%+ accuracy)
- Export formats Google-compatible
- Anchor text analysis clear
- New vs lost links tracked
- 1 credit per analysis

**Success Criteria**:
- [ ] Backlinks discovered accurately
- [ ] Toxicity detection 90%+ accurate
- [ ] Disavow export works correctly
- [ ] Anchor distribution calculated
- [ ] Historical comparison available
- [ ] Analysis completes < 30 seconds

**Edge Cases**:
- Domain with 100,000+ backlinks - paginate, show summary
- All backlinks toxic - prioritized recommendations
- No backlinks found - show link building suggestions
- Backlink API unavailable - show cached data, retry
- Newly acquired domain - note limited history

**Test Data Requirements**:
- Domains with various backlink profiles
- Known toxic backlink examples
- Clean link profiles
- Large backlink profiles (10,000+)

---

### UX-SEO-005: View Heatmap Analytics

**Title**: UX Designer Analyzes User Behavior on Landing Page

**User Persona**: UX designer Maya optimizing conversion rates

**Preconditions**:
- User has heatmap tracking script installed on website
- At least 1000 sessions recorded
- 7+ days of data available

**User Journey**:
1. User navigates to SEO > Heatmaps
2. User selects website and page: "/pricing"
3. User configures view:
   - Date range: Last 7 days
   - Device type: Desktop
   - Heatmap type: Clicks
4. System loads aggregated heatmap data
5. User views click heatmap overlay on page screenshot
6. User sees:
   - Hot spots (red) on CTA buttons
   - Warm areas on pricing tiers
   - Cold spots on footer
   - Dead clicks on non-interactive elements
7. User switches to Scroll depth view
8. User sees:
   - Average scroll depth: 68%
   - Fold line indicator
   - Color gradient showing visibility
9. User identifies 40% of users don't scroll past pricing table
10. User exports findings as PNG

**Expected Behavior**:
- Heatmap renders accurately over page screenshot
- Color coding intuitive (red=hot, blue=cold)
- Scroll depth shows percentage bands
- Device filtering accurate
- Data aggregates within 24 hours
- Export generates high-resolution image

**Success Criteria**:
- [ ] Heatmap renders within 5 seconds
- [ ] Click positions accurate to 5px
- [ ] Scroll depth percentages correct
- [ ] Device filtering works
- [ ] Export generates quality image
- [ ] Data privacy maintained (no PII)

**Edge Cases**:
- Very few sessions (< 100) - show "Insufficient data" warning
- Responsive page layout - show per-breakpoint view
- Page layout changed since recording - version matching
- Very long page (5000px+) - scrollable heatmap view
- Tracking script blocked by ad blockers - show coverage %

**Test Data Requirements**:
- Pages with high click activity
- Pages with low engagement
- Various page lengths
- Mobile vs desktop comparisons

---

### UX-SEO-006: Generate Branded PDF Report

**Title**: Agency Owner Creates White-Label Client Report

**User Persona**: Agency owner Derek preparing monthly client report

**Preconditions**:
- User has completed SEO audit within last 30 days
- User has ranking data for at least 15 keywords
- User has custom branding configured
- 2 credits available

**User Journey**:
1. User navigates to SEO > Reports
2. User clicks "Generate New Report"
3. User selects report type: "Monthly SEO Report"
4. User configures report:
   - Date range: December 2025
   - Include sections:
     - Executive Summary
     - SEO Audit Results
     - Ranking Changes
     - Backlink Analysis
     - Recommendations
   - Exclude: Heatmaps (no data)
5. User configures branding:
   - Upload logo (PNG, 400x100)
   - Primary color: #2563EB
   - Company name: "Digital Growth Agency"
   - Hide Bottleneck-Bots branding: Yes
6. User clicks "Generate Report"
7. System processes report (15-25 seconds):
   - "Compiling data..."
   - "Generating charts..."
   - "Applying branding..."
   - "Finalizing PDF..."
8. Report ready for download
9. User previews 12-page PDF
10. User clicks "Download" to save PDF
11. 2 credits deducted

**Expected Behavior**:
- Report includes selected sections only
- Branding applied throughout
- Charts render correctly in PDF
- Executive summary AI-generated
- Download link valid for 7 days
- PDF < 10MB in size

**Success Criteria**:
- [ ] Report generates within 30 seconds
- [ ] All selected sections included
- [ ] Branding applied correctly
- [ ] Charts readable at print quality
- [ ] PDF opens in standard readers
- [ ] File size reasonable (< 10MB)

**Edge Cases**:
- No data for selected section - omit with note
- Very large report (50+ pages) - generation may take longer
- Logo wrong aspect ratio - scale appropriately
- Color conflicts with charts - adjust chart colors
- Generation fails - retry button, refund credits

**Test Data Requirements**:
- Various logo sizes and formats
- Color schemes with contrast issues
- Reports with varying data volumes
- All section combinations

---

### UX-SEO-007: Schedule Automated Weekly Reports

**Title**: Agency Manager Sets Up Automatic Client Reporting

**User Persona**: Agency account manager Lisa automating monthly reports

**Preconditions**:
- User has SEO project with ongoing data
- User has client email addresses
- User has report template configured

**User Journey**:
1. User navigates to SEO > Report Schedules
2. User clicks "Create Schedule"
3. User configures schedule:
   - Report type: Monthly SEO Summary
   - Frequency: Monthly
   - Day of month: 1st
   - Time: 9:00 AM
   - Timezone: EST
4. User configures content:
   - Date range: Previous month
   - Sections: All
   - Branding: Custom (previous template)
5. User adds recipients:
   - client@example.com
   - manager@example.com
6. User clicks "Create Schedule"
7. System displays schedule summary:
   - Next run: February 1, 2026, 9:00 AM EST
   - Recipients: 2
8. User activates schedule
9. On February 1st, system:
   - Generates report automatically
   - Emails to both recipients
   - Logs delivery status
10. User views delivery confirmation in schedule history

**Expected Behavior**:
- Schedule executes reliably on time
- Reports generated fresh with current data
- Email delivery to all recipients
- Retry on failed delivery (3 attempts)
- Schedule can be paused/resumed
- Manual trigger available

**Success Criteria**:
- [ ] Schedule created successfully
- [ ] Next run calculated correctly
- [ ] Report generates on schedule
- [ ] Email delivered to all recipients
- [ ] Schedule history logged
- [ ] Pause/resume works

**Edge Cases**:
- Email delivery fails - retry, notify user
- No data for period - generate empty report with note
- Recipient unsubscribes - remove from list, notify user
- Schedule time falls on holiday - execute anyway
- Timezone daylight saving changes - adjust correctly

**Test Data Requirements**:
- Various frequency settings
- Multiple recipient configurations
- Timezone edge cases
- Delivery failure scenarios

---

### UX-SEO-008: Compare SEO Audits Over Time

**Title**: SEO Specialist Tracks Improvement After Changes

**User Persona**: SEO specialist testing optimization impact

**Preconditions**:
- User has run audits on same URL at different times
- At least 2 audits available for comparison
- Audits from different dates (e.g., 30 days apart)

**User Journey**:
1. User navigates to SEO project audit history
2. User selects baseline audit: "December 1, 2025"
3. User selects comparison audit: "January 10, 2026"
4. User clicks "Compare Audits"
5. System generates comparison view:
   - Side-by-side scores
   - Score changes (with direction indicators)
   - Check-by-check comparison
6. User views summary:
   - Overall score: 65 -> 78 (+13 points)
   - Technical: 70 -> 85 (+15 points)
   - Performance: 55 -> 72 (+17 points)
   - Content: 68 -> 75 (+7 points)
7. User expands category to see individual checks:
   - Title tag: Fail -> Pass
   - Meta description: Fail -> Pass
   - Image alt text: Warn -> Pass
8. User sees visual comparison chart
9. User exports comparison as PDF

**Expected Behavior**:
- Audits compared check-by-check
- Changes clearly highlighted
- Improvement/regression indicators
- Same checks compared (version matching)
- Visual charts for trends
- Export available

**Success Criteria**:
- [ ] Comparison loads within 3 seconds
- [ ] All checks aligned correctly
- [ ] Score changes calculated accurately
- [ ] Visual indicators clear
- [ ] Export includes comparison data
- [ ] Historical trends visible

**Edge Cases**:
- Audit versions incompatible - note and skip changed checks
- One audit has errors - show partial comparison
- Scores identical - highlight maintained status
- Very different page structures - note structural changes
- Missing checks in one audit - show as "N/A"

**Test Data Requirements**:
- Audit pairs with improvements
- Audit pairs with regressions
- Audit pairs with mixed changes
- Audits from different URL paths

---

### UX-SEO-009: Install Heatmap Tracking Script

**Title**: Webmaster Adds Heatmap Tracking to Client Website

**User Persona**: Web developer Sam implementing analytics tracking

**Preconditions**:
- User has SEO project created
- User has access to website code
- Website supports JavaScript

**User Journey**:
1. User navigates to SEO project > Heatmaps
2. User clicks "Get Tracking Script"
3. System displays tracking script:
   ```html
   <script src="https://cdn.bottleneck-bots.io/heatmap.js"
           data-project-id="abc123"
           async></script>
   ```
4. User copies script
5. User opens website code and pastes before </body>
6. User deploys website update
7. User returns to Bottleneck-Bots
8. User clicks "Verify Installation"
9. System checks for script presence
10. System confirms: "Tracking active, first session recorded"
11. User sees real-time visitor count incrementing

**Expected Behavior**:
- Script is lightweight (< 5KB gzipped)
- Non-blocking async load
- First session appears within minutes
- GDPR consent integration available
- Performance impact minimal
- Verification confirms working installation

**Success Criteria**:
- [ ] Script copies correctly
- [ ] Script loads without errors
- [ ] First session recorded within 5 minutes
- [ ] Page load impact < 50ms
- [ ] Verification detects script
- [ ] Consent mode available

**Edge Cases**:
- Script blocked by CSP - provide CSP directive
- Script blocked by ad blocker - show coverage estimate
- Wrong project ID - verification fails with clear error
- Double installation - deduplicate events
- Single-page app - track route changes

**Test Data Requirements**:
- Various website platforms
- Sites with strict CSP
- Single-page applications
- High-traffic websites

---

### UX-SEO-010: Verify Domain Ownership

**Title**: User Proves Domain Ownership for Full Analysis Access

**User Persona**: Website owner Chris enabling advanced features

**Preconditions**:
- User has SEO project with domain added
- User has DNS or file upload access to domain
- Domain not yet verified

**User Journey**:
1. User navigates to SEO project settings
2. User sees "Domain not verified" warning
3. User clicks "Verify Domain"
4. System offers verification methods:
   - DNS TXT record (recommended)
   - HTML file upload
   - Meta tag
5. User selects DNS TXT record
6. System provides record:
   - Type: TXT
   - Host: @
   - Value: bottleneck-verify=abc123xyz
7. User adds record to DNS (via registrar)
8. User clicks "Check Verification"
9. System performs DNS lookup
10. System confirms: "Domain verified!"
11. User sees green verified badge on project
12. Advanced features unlocked:
    - Full site crawl (500 pages)
    - Competitor analysis
    - Heatmap tracking

**Expected Behavior**:
- Multiple verification options provided
- Clear instructions for each method
- Verification completes within 1 minute
- DNS propagation note included
- Verified status persists
- Badge visible on project

**Success Criteria**:
- [ ] Verification code unique per domain
- [ ] DNS lookup succeeds
- [ ] Status updates to verified
- [ ] Advanced features unlocked
- [ ] Verification persistent
- [ ] Re-verification not required

**Edge Cases**:
- DNS not propagated yet - suggest 24h wait, retry option
- Wrong TXT record value - show expected vs found
- Domain expired - show warning
- CNAME instead of TXT - provide alternative
- Multiple subdomains - require separate verification or wildcard

**Test Data Requirements**:
- Domains with various registrars
- DNS propagation delay scenarios
- Expired domain scenarios
- Subdomain verification

---

# Feature 9: Ad Manager

## Overview
AI-powered Meta Ads analysis and optimization using GPT-4 Vision for screenshot analysis, performance metrics extraction, recommendation generation, and ad copy variation creation.

---

### UX-AD-001: Analyze Ad Screenshot with AI

**Title**: Performance Marketer Uploads Ad Screenshot for AI Analysis

**User Persona**: Digital marketer Kate analyzing underperforming ad

**Preconditions**:
- User has active subscription
- User has screenshot of Meta ad with visible metrics
- OpenAI API configured in system

**User Journey**:
1. User navigates to "Ad Manager" from navigation
2. User clicks "Analyze Screenshot"
3. System displays upload interface:
   - URL input field
   - Supported formats: PNG, JPG, WEBP
   - Example screenshot shown
4. User enters screenshot URL (hosted on Imgur)
5. User optionally enters Meta Ad ID for linking
6. User clicks "Analyze"
7. System displays progress:
   - "Validating image..."
   - "Sending to GPT-4 Vision..."
   - "Extracting metrics..."
   - "Generating insights..."
8. Analysis completes in 8 seconds
9. System displays results:
   - Extracted Metrics:
     - Impressions: 45,230
     - Clicks: 892
     - CTR: 1.97%
     - CPC: $0.82
     - Spend: $731.44
     - Conversions: 23
     - ROAS: 2.4x
   - Insights (5 bullet points)
   - Suggestions (5 improvement ideas)
   - Sentiment: Neutral
   - Confidence: 0.92
10. User saves analysis for reference

**Expected Behavior**:
- Image validated before processing
- Metrics extracted from visible data
- Missing metrics shown as null
- AI generates contextual insights
- Confidence reflects extraction quality
- Analysis stored in database

**Success Criteria**:
- [ ] Screenshot validation works
- [ ] Analysis completes < 15 seconds
- [ ] Metrics extracted accurately (85%+)
- [ ] Insights are relevant
- [ ] Suggestions are actionable
- [ ] Results saved to history

**Edge Cases**:
- Low resolution screenshot - warn user, attempt analysis
- Metrics partially visible - extract what's visible
- Non-Meta ad screenshot - analysis may be less accurate
- Screenshot of mobile view - handle different layout
- No metrics visible - report qualitative analysis only
- API timeout - retry with exponential backoff

**Test Data Requirements**:
- High-quality Meta Ads screenshots
- Low-resolution screenshots
- Screenshots with partial metrics
- Non-advertising screenshots
- Various Meta Ads layouts

---

### UX-AD-002: Generate AI-Powered Recommendations

**Title**: Media Buyer Gets Optimization Recommendations

**User Persona**: Media buyer Frank seeking performance improvements

**Preconditions**:
- User has analyzed ad or has manual metrics
- Ad has measurable performance data
- At least 1000 impressions for meaningful recommendations

**User Journey**:
1. User navigates to Ad Manager
2. User clicks on previous analysis or "New Recommendations"
3. User inputs/confirms metrics:
   - CTR: 1.2%
   - CPC: $1.50
   - ROAS: 1.8x
   - Current audience: Broad
4. User optionally adds ad content:
   - Current headline
   - Primary text
   - Target audience description
5. User clicks "Generate Recommendations"
6. System processes request (5-8 seconds)
7. System displays 7 recommendations:
   - Copy: "Shorten headline for mobile"
   - Targeting: "Narrow to lookalike audiences"
   - Budget: "Increase daily budget by 20%"
   - Creative: "Test video format"
   - Schedule: "Shift budget to 7-9 PM"
   - (2 more recommendations)
8. Each recommendation shows:
   - Priority: High/Medium/Low
   - Expected impact
   - Actionable flag
9. User marks 3 recommendations as "Apply Later"

**Expected Behavior**:
- Recommendations based on actual metrics
- Prioritization reflects impact potential
- Mix of quick wins and strategic changes
- Recommendations specific, not generic
- Status tracking available
- Recommendations saved per ad

**Success Criteria**:
- [ ] 5-7 recommendations generated
- [ ] Recommendations categorized correctly
- [ ] Priority assigned appropriately
- [ ] Expected impact provided
- [ ] Recommendations saveable
- [ ] Status tracking works

**Edge Cases**:
- Perfect metrics (CTR 5%+, ROAS 10x) - maintenance recommendations
- Very poor metrics - prioritize fundamentals
- Missing metric data - recommend based on available
- Conflicting recommendations - note trade-offs
- Recommendation already implemented - detect and skip

**Test Data Requirements**:
- Metrics representing various performance levels
- Ad content samples
- Different audience configurations
- Historical recommendation data

---

### UX-AD-003: Generate Ad Copy Variations

**Title**: Creative Director Creates A/B Test Variations

**User Persona**: Creative director Mia testing new angles

**Preconditions**:
- User has existing ad copy
- User knows target audience
- User wants 5 variations for testing

**User Journey**:
1. User navigates to Ad Manager > Copy Generator
2. User enters current ad copy:
   - Headline: "Get 50% Off Today Only"
   - Primary text: "Don't miss our biggest sale..."
   - Description: "Free shipping on orders $50+"
3. User configures generation:
   - Target audience: "Young professionals, 25-35"
   - Tone: "Urgent but not pushy"
   - Objective: "Website conversions"
   - Number of variations: 5
4. User clicks "Generate Variations"
5. System processes (10-15 seconds)
6. System displays 5 variations:
   - Variation 1 (Urgency angle):
     - Headline: "24 Hours Left: 50% Off"
     - Primary text: "The clock is ticking..."
     - Reasoning: "Creates time pressure..."
   - Variation 2 (Social proof angle):
     - Headline: "Join 10,000 Happy Customers"
     - Primary text: "See why everyone's talking..."
   - (3 more variations)
7. User reviews each variation
8. User selects 3 favorites and saves to campaign

**Expected Behavior**:
- Each variation uses distinct approach
- Character limits respected (40/150/30)
- Reasoning explains strategic angle
- Brand voice maintained
- No prohibited content generated
- Variations saved for future reference

**Success Criteria**:
- [ ] Requested number generated
- [ ] Character limits enforced
- [ ] Variations are distinct
- [ ] Reasoning provided
- [ ] Tone matches request
- [ ] Saved to user's library

**Edge Cases**:
- Very short original copy - expand appropriately
- Original copy has errors - improve in variations
- Restricted product category - extra compliance check
- Request for 10 variations - handle at limit
- Same variation generated twice - regenerate different

**Test Data Requirements**:
- Various ad copy styles
- Different tones and objectives
- Character limit edge cases
- Compliance-sensitive products

---

### UX-AD-004: Connect Meta Ads Account via OAuth

**Title**: Agency Owner Connects Client's Meta Ads Account

**User Persona**: Agency owner Tyler managing multiple client accounts

**Preconditions**:
- User has Meta Business Suite access
- Client has authorized agency access
- OAuth flow configured in system

**User Journey**:
1. User navigates to Ad Manager > Integrations
2. User clicks "Connect Meta Ads"
3. System redirects to Facebook OAuth
4. User logs in to Facebook (if not already)
5. User selects business account to connect
6. User reviews permissions:
   - Read ads data
   - Read insights
   - Manage ads (optional)
7. User clicks "Allow"
8. System receives OAuth tokens
9. System stores tokens securely
10. User redirected back with success message
11. User sees connected accounts:
    - "Tyler's Agency" (connected)
    - 5 ad accounts accessible
12. User can now view campaign data

**Expected Behavior**:
- OAuth uses secure flow
- Tokens stored encrypted
- Multiple accounts supported
- Token refresh automatic
- Disconnect option available
- Permissions clearly stated

**Success Criteria**:
- [ ] OAuth flow completes
- [ ] Tokens stored encrypted
- [ ] Ad accounts listed correctly
- [ ] Campaign data accessible
- [ ] Token refresh works
- [ ] Disconnect works

**Edge Cases**:
- User denies permissions - show error, retry option
- Token expires during session - auto-refresh
- Account deauthorized externally - show reconnect prompt
- Multiple business accounts - let user select
- API rate limited - show friendly error

**Test Data Requirements**:
- Valid Meta OAuth credentials
- Multiple business accounts
- Various permission levels
- Token expiration scenarios

---

### UX-AD-005: View Campaign Performance from Meta API

**Title**: Analyst Reviews Real-Time Campaign Metrics

**User Persona**: Performance analyst Jake monitoring campaigns

**Preconditions**:
- User has connected Meta Ads account
- At least 3 active campaigns
- Last 7 days of performance data

**User Journey**:
1. User navigates to Ad Manager > Campaigns
2. User selects connected ad account
3. System fetches campaign list from Meta API
4. User views campaign table:
   - Campaign name
   - Status (Active/Paused)
   - Objective
   - Budget
   - Spend
   - Results
5. User clicks on specific campaign
6. System shows campaign details:
   - 5 ad sets
   - Performance metrics
   - Date range selector
7. User drills down to ad set level
8. User views individual ads
9. User selects specific ad
10. User views full metrics:
    - Impressions: 125,000
    - Clicks: 3,200
    - CTR: 2.56%
    - CPC: $0.58
    - Conversions: 89
    - ROAS: 3.2x
11. User exports data to CSV

**Expected Behavior**:
- Data fetched in real-time from Meta API
- Hierarchy: Account > Campaign > Ad Set > Ad
- All relevant metrics displayed
- Date range filtering available
- Export includes all columns
- Data refreshes on demand

**Success Criteria**:
- [ ] Campaigns list loads < 5 seconds
- [ ] All metrics accurate
- [ ] Drill-down navigation works
- [ ] Date range filter works
- [ ] Export generates correctly
- [ ] Refresh updates data

**Edge Cases**:
- No campaigns exist - show empty state with create prompt
- API returns partial data - show available, note missing
- Very large account (1000+ campaigns) - paginate
- Campaign deleted externally - remove from view
- Metrics delayed in Meta - show last update timestamp

**Test Data Requirements**:
- Accounts with various campaign counts
- Campaigns in different statuses
- Various date ranges
- Edge case metric values

---

### UX-AD-006: Apply Recommendation via Browser Automation

**Title**: Marketer Applies Ad Copy Change Automatically

**User Persona**: Time-strapped marketer Eve automating changes

**Preconditions**:
- User has accepted recommendation
- Meta Ads Manager login available
- Browserbase session quota available

**User Journey**:
1. User views recommendation: "Update headline"
2. User clicks "Apply Automatically"
3. System displays automation preview:
   - Target ad: "Summer Sale Ad"
   - Change: Headline "Get 50% Off" -> "Limited Time: 50% Off"
4. User clicks "Start Automation"
5. System creates Browserbase session
6. User sees live preview (optional):
   - Browser navigating to Ads Manager
   - Logging in (if needed)
   - Finding target ad
   - Opening edit mode
   - Updating headline
   - Saving changes
7. Automation completes in 45 seconds
8. System shows success:
   - "Headline updated successfully"
   - Session recording available
   - Debug URL for review
9. User clicks to view session recording

**Expected Behavior**:
- Session created within 10 seconds
- Automation navigates correctly
- Changes applied accurately
- Recording saved for audit
- Failure captured with details
- Recommendation status updated

**Success Criteria**:
- [ ] Session creates successfully
- [ ] Navigation to correct ad
- [ ] Changes applied correctly
- [ ] Recording captured
- [ ] Status logged in history
- [ ] Automation completes < 60 seconds

**Edge Cases**:
- Login required - pause for manual login or use saved credentials
- Ad not found - show error with search help
- Meta UI changed - attempt adaptation or fail gracefully
- Network timeout - retry automatically
- Ad in "In Review" status - show warning, allow override
- Session quota exceeded - show upgrade option

**Test Data Requirements**:
- Test Meta Ads account with editable ads
- Ads in various states
- Different change types (headline, text, description)
- Session with login required

---

### UX-AD-007: Review Automation History

**Title**: Account Manager Audits All Automated Changes

**User Persona**: Account manager Beth reviewing team activity

**Preconditions**:
- Team has performed 20+ automations
- Automations span multiple campaigns
- Mix of successful and failed automations

**User Journey**:
1. User navigates to Ad Manager > Automation History
2. User views history table:
   - Timestamp
   - User who triggered
   - Ad affected
   - Action type
   - Status (success/failed)
   - Duration
3. User filters by date: "Last 30 days"
4. User filters by status: "Failed"
5. User sees 3 failed automations
6. User clicks on failed automation
7. System displays details:
   - Error: "Element not found: headline input"
   - Screenshot at failure point
   - Session recording link
   - Debug URL
8. User watches session recording
9. User identifies UI change in Meta caused failure
10. User notes to update automation script

**Expected Behavior**:
- Complete audit trail
- Filtering by multiple criteria
- Session recordings accessible
- Error details helpful
- Debug URLs valid for 24 hours
- Export available

**Success Criteria**:
- [ ] History displays all automations
- [ ] Filtering works correctly
- [ ] Failed automation details shown
- [ ] Session recordings play
- [ ] Debug URLs work
- [ ] Export includes all data

**Edge Cases**:
- Very long history (1000+ entries) - paginate
- Session recording expired - show "Recording unavailable"
- Debug URL expired - show expiration message
- User who triggered no longer exists - show "Unknown user"
- Automation from before feature update - show legacy format

**Test Data Requirements**:
- Successful automation records
- Failed automation records
- Various action types
- Different users' automations

---

### UX-AD-008: Analyze Ad Performance Trends

**Title**: Strategist Reviews Weekly Performance Patterns

**User Persona**: Senior strategist observing trends

**Preconditions**:
- User has 30+ days of ad data
- Multiple analyses performed
- Trend data available

**User Journey**:
1. User navigates to Ad Manager > Performance Trends
2. User selects ad account and date range (30 days)
3. System displays trend dashboard:
   - CTR trend line
   - CPC trend line
   - ROAS trend line
   - Daily spend bar chart
4. User hovers over data points for details
5. User notices CTR dropped 15% week 3
6. User clicks to drill into that week
7. System shows:
   - Ad-level breakdown
   - Correlation with spend changes
   - External factors (competition, seasonality)
8. User identifies creative fatigue
9. User schedules new creative test

**Expected Behavior**:
- Trends calculated from historical data
- Interactive charts
- Drill-down capability
- Annotations for significant events
- Comparison to benchmarks
- Export charts as images

**Success Criteria**:
- [ ] Trend lines render correctly
- [ ] Data points accurate
- [ ] Drill-down works
- [ ] Charts are interactive
- [ ] Export generates images
- [ ] Performance remains fast

**Edge Cases**:
- Insufficient data (< 7 days) - show minimum data message
- Gap in data collection - interpolate or show gap
- Extremely volatile data - smooth option available
- Date range spans account change - note in chart
- No data for selected period - show empty state

**Test Data Requirements**:
- 30+ days of performance data
- Various performance patterns
- Data with gaps
- Multi-campaign scenarios

---

### UX-AD-009: Compare Ad Variations Performance

**Title**: Creative Team Evaluates A/B Test Results

**User Persona**: Creative lead comparing test variations

**Preconditions**:
- User has generated copy variations
- Variations deployed to Meta Ads
- 7+ days of performance data

**User Journey**:
1. User navigates to Ad Manager > Variation Tracking
2. User selects copy generation batch from January
3. User links Meta ad IDs to each variation:
   - Variation 1 -> Ad ID 12345
   - Variation 2 -> Ad ID 12346
   - (etc.)
4. User clicks "Sync Performance"
5. System fetches metrics from Meta API
6. User views comparison table:
   - Variation | CTR | CPC | ROAS | Spend | Status
   - Var 1     | 2.1%| $0.85| 2.8x | $500 | Testing
   - Var 2     | 3.4%| $0.52| 4.2x | $750 | Winner
   - Var 3     | 1.8%| $0.92| 2.1x | $400 | Paused
7. User sees Variation 2 highlighted as winner
8. User marks Variation 2 as "Scale"
9. System recommends pausing underperformers

**Expected Behavior**:
- Variations linkable to Meta ads
- Performance synced automatically
- Winner detection based on ROAS
- Statistical significance noted
- Recommendations provided
- Status tracking available

**Success Criteria**:
- [ ] Variation linking works
- [ ] Metrics sync correctly
- [ ] Winner identified accurately
- [ ] Significance calculated
- [ ] Recommendations relevant
- [ ] Status updates persist

**Edge Cases**:
- Variation not deployed - show "Not deployed" status
- Insufficient data for significance - note in UI
- Winner changes over time - track history
- Multiple winners (similar performance) - note tie
- Ad paused externally - reflect status

**Test Data Requirements**:
- Multiple variation batches
- Variations at different performance levels
- Statistical edge cases
- Time-series performance data

---

### UX-AD-010: Handle API Errors Gracefully

**Title**: User Experiences and Recovers from Meta API Error

**User Persona**: Regular user encountering technical issue

**Preconditions**:
- User has connected Meta account
- Meta API experiencing intermittent issues
- User attempting to load campaign data

**User Journey**:
1. User navigates to Ad Manager > Campaigns
2. User clicks on ad account
3. System attempts to fetch data from Meta API
4. API returns 503 Service Unavailable
5. System displays user-friendly error:
   - "Unable to load campaign data"
   - "Meta's API is temporarily unavailable"
   - "This usually resolves within a few minutes"
   - [Retry] [View Cached Data]
6. User clicks "View Cached Data"
7. System shows data from last successful fetch (2 hours ago)
8. User continues working with cached data
9. User clicks "Retry" after 5 minutes
10. API responds, fresh data loaded
11. User sees "Data refreshed" confirmation

**Expected Behavior**:
- Error messages human-readable
- Technical details hidden but accessible
- Cached data available as fallback
- Retry mechanism built-in
- Status updates when resolved
- No data loss during errors

**Success Criteria**:
- [ ] Error message is friendly
- [ ] Cached data accessible
- [ ] Retry button works
- [ ] Fresh data loads when available
- [ ] Error logged for debugging
- [ ] User workflow continues

**Edge Cases**:
- No cached data available - show helpful empty state
- Extended outage (hours) - periodic check, notification
- Partial API failure - show available data
- Token expired during error - prompt reconnect
- Rate limit exceeded - show wait time

**Test Data Requirements**:
- Simulated API error responses
- Cached data from various ages
- Various error types
- Recovery scenarios

---

# Feature 10: Analytics Dashboard

## Overview
Comprehensive real-time analytics for automation execution statistics, performance metrics, cost analysis, and usage insights with intelligent 5-minute TTL caching.

---

### UX-ANALYTICS-001: View Execution Statistics Overview

**Title**: Agency Owner Reviews Weekly Automation Performance

**User Persona**: Agency owner viewing operational health

**Preconditions**:
- User has scheduled browser tasks
- At least 100 executions in past week
- Dashboard loads for first time today

**User Journey**:
1. User logs into Bottleneck-Bots
2. User navigates to "Analytics" from main navigation
3. Dashboard loads with time period selector defaulted to "Week"
4. User views summary cards:
   - Total Executions: 1,234
   - Success Rate: 94.5%
   - Failed: 68
   - Avg Duration: 45s
5. User sees week-over-week comparison:
   - +12% executions
   - +2.1% success rate
   - -15% failures
6. User views execution trend chart
7. User notices dip on Wednesday
8. User clicks on Wednesday bar for details
9. System shows that day's breakdown
10. User identifies maintenance window caused drop

**Expected Behavior**:
- Dashboard loads within 2 seconds
- Metrics calculated accurately
- Charts render smoothly
- Comparisons show direction
- Drill-down available
- Data cached for 5 minutes

**Success Criteria**:
- [ ] Dashboard loads < 2 seconds
- [ ] All metrics display correctly
- [ ] Time period selector works
- [ ] Charts render without errors
- [ ] Comparisons accurate
- [ ] Cache indicator shows status

**Edge Cases**:
- No executions yet - show onboarding guidance
- All executions failed - highlight issues prominently
- Very high volume (100,000+) - aggregated view
- Mixed time zones - consistent timezone handling
- Cache stale - show refresh option

**Test Data Requirements**:
- Various execution counts
- Different success rates
- Edge case scenarios (0%, 100%)
- Time zone variations

---

### UX-ANALYTICS-002: Analyze Individual Task Performance

**Title**: Automation Engineer Debugs Failing Task

**User Persona**: Engineer investigating task with high failure rate

**Preconditions**:
- User has 20+ scheduled tasks
- One task has 40% failure rate
- Task has run 50+ times

**User Journey**:
1. User navigates to Analytics dashboard
2. User clicks "Task Performance" tab
3. User searches for "Daily Report Generator"
4. User selects task from dropdown
5. System displays task-specific metrics:
   - Execution Stats:
     - Total: 156
     - Success: 94 (60%)
     - Failed: 62 (40%)
   - Duration Stats:
     - Average: 48s
     - Median: 35s
     - Min: 22s
     - Max: 180s (3 minutes)
   - Current Status:
     - Active: Yes
     - Last run: 2 hours ago (failed)
     - Next run: 4 hours
     - Consecutive failures: 5
6. User views recent executions table
7. User clicks on failed execution
8. System shows error details:
   - Error: "Timeout waiting for element"
   - Duration: 180s (hit max)
   - Steps completed: 3 of 5
9. User identifies pattern in failures
10. User adjusts task configuration

**Expected Behavior**:
- Task metrics specific to selection
- Duration breakdown informative
- Failure patterns visible
- Error messages helpful
- Recent executions accessible
- Current status accurate

**Success Criteria**:
- [ ] Task selection works
- [ ] Metrics accurate for task
- [ ] Duration stats calculated correctly
- [ ] Error messages display
- [ ] Execution history shows
- [ ] Steps progress visible

**Edge Cases**:
- Task never succeeded - show "No successful runs" message
- Task never ran - show "Awaiting first execution"
- Task deleted - show "Task not found"
- Very old task - historical data available
- Task currently running - show live status

**Test Data Requirements**:
- Tasks with various success rates
- Tasks with varying durations
- Tasks with different error types
- New vs established tasks

---

### UX-ANALYTICS-003: Track Usage Patterns Over Time

**Title**: Operations Manager Identifies Peak Usage Hours

**User Persona**: Operations manager planning capacity

**Preconditions**:
- User has 30+ days of execution data
- Significant usage variation exists
- User needs to plan infrastructure

**User Journey**:
1. User navigates to Analytics > Usage
2. User selects time period: "Month"
3. User selects grouping: "Hour"
4. System displays usage chart:
   - X-axis: Hour of day (0-23)
   - Y-axis: Average executions
5. User sees clear peaks at 9 AM and 2 PM
6. User switches grouping to "Day"
7. Chart updates to show daily patterns
8. User sees Monday highest, Sunday lowest
9. User exports data to CSV
10. User shares with DevOps for capacity planning

**Expected Behavior**:
- Usage patterns clearly visible
- Grouping options work correctly
- Chart updates smoothly
- Export includes all data
- Patterns match reality
- Cached data shown first

**Success Criteria**:
- [ ] Chart displays correctly
- [ ] Grouping works (hour/day/week/month)
- [ ] Period filtering works
- [ ] Export generates valid CSV
- [ ] Data matches database
- [ ] Update within 5 minutes of change

**Edge Cases**:
- No data for selected period - show empty chart
- Single data point - don't show misleading trend
- Extreme outliers - option to exclude
- Time zone changes (DST) - handle gracefully
- Very sparse data - interpolation option

**Test Data Requirements**:
- Data across all hours
- Data across all days of week
- Seasonal patterns
- Outlier data points

---

### UX-ANALYTICS-004: Review Browser Session Costs

**Title**: Finance Manager Analyzes Automation Costs

**User Persona**: Finance person tracking expenses

**Preconditions**:
- User has cost tracking enabled
- Browserbase sessions have occurred
- At least 30 days of cost data

**User Journey**:
1. User navigates to Analytics > Costs
2. User selects time period: "Month"
3. System displays cost breakdown:
   - Total Executions: 5,230
   - Total Duration: 12.5 hours
   - Estimated Total Cost: $42.50
   - Cost per Execution: $0.008
4. User views cost breakdown:
   - Session costs (base): $26.15
   - Duration costs: $16.35
5. User reads methodology notes:
   - "Estimated based on $0.01 per session + $0.005 per minute"
   - "Actual costs may vary based on plan"
6. User views cost trend chart
7. User notices spike in Week 3
8. User drills down to identify high-duration tasks
9. User identifies optimization opportunity
10. User exports cost report

**Expected Behavior**:
- Costs calculated accurately
- Breakdown clear and detailed
- Methodology transparent
- Trends visible over time
- Drill-down available
- Export includes all data

**Success Criteria**:
- [ ] Cost calculation accurate
- [ ] Breakdown adds to total
- [ ] Methodology notes present
- [ ] Trend chart displays
- [ ] Export works
- [ ] Currency displayed correctly

**Edge Cases**:
- Zero executions - show $0.00
- Extremely high costs - highlight for attention
- Cost rate changed mid-period - note in breakdown
- No duration data - estimate based on average
- Free tier executions - show $0.00 with note

**Test Data Requirements**:
- Various execution counts
- Different duration distributions
- Cost rate change scenarios
- Free tier vs paid scenarios

---

### UX-ANALYTICS-005: Monitor Performance Trends

**Title**: DevOps Engineer Spots Performance Degradation

**User Persona**: DevOps engineer monitoring system health

**Preconditions**:
- User has 90 days of performance data
- System has experienced gradual slowdown
- User monitors proactively

**User Journey**:
1. User navigates to Analytics > Performance
2. User selects time period: "Quarter"
3. User selects metrics: Duration, Success Rate
4. System displays trend chart:
   - Daily data points for 90 days
   - Blue line: Average duration
   - Green line: Success rate
5. User notices duration increasing over time:
   - Month 1 average: 35s
   - Month 2 average: 42s
   - Month 3 average: 55s
6. User filters to specific task
7. Pattern more pronounced for one task
8. User identifies browser memory leak pattern
9. User schedules investigation
10. User sets up alert for duration > 60s

**Expected Behavior**:
- Trends clearly visible
- Multiple metrics overlaid
- Anomalies highlighted
- Task filtering works
- Historical comparison available
- Alerts configurable

**Success Criteria**:
- [ ] Trend lines render correctly
- [ ] Multiple metrics display
- [ ] Filtering works
- [ ] Anomaly detection works
- [ ] Historical data available
- [ ] Performance remains good

**Edge Cases**:
- No trend (flat line) - show stability message
- Extreme volatility - smoothing option
- Missing data days - handle gaps
- Very long tasks (hours) - different scale
- Sudden drop to zero - highlight as anomaly

**Test Data Requirements**:
- Gradual degradation pattern
- Sudden changes
- Stable performance
- Recovery patterns

---

### UX-ANALYTICS-006: View Real-Time Execution Status

**Title**: User Monitors Live Task Executions

**User Persona**: User watching critical task run

**Preconditions**:
- User has tasks running right now
- Real-time updates enabled
- SSE/WebSocket connected

**User Journey**:
1. User navigates to Analytics dashboard
2. User sees "Live Status" indicator
3. Dashboard shows:
   - Currently Running: 3 tasks
   - Queued: 5 tasks
   - Last completed: 30 seconds ago
4. User watches as running task completes
5. Status updates without refresh:
   - Running: 2 (was 3)
   - Last completed: Just now
6. New task starts
7. User sees notification: "Task 'Email Sync' started"
8. User clicks to view live progress
9. Task shows step-by-step progress:
   - Step 1/5: Navigate to inbox ✓
   - Step 2/5: Filter unread ✓
   - Step 3/5: Process emails... (current)
10. Task completes, success reflected

**Expected Behavior**:
- Updates within 1 second
- No page refresh required
- Smooth animations
- Accurate step progress
- Connection indicator visible
- Graceful degradation if disconnected

**Success Criteria**:
- [ ] Real-time updates work
- [ ] Running count accurate
- [ ] Transitions animated
- [ ] Step progress displays
- [ ] Connection status shown
- [ ] Fallback to polling works

**Edge Cases**:
- Connection lost - show warning, attempt reconnect
- Task fails during watch - show failure immediately
- Many concurrent tasks (50+) - summarized view
- Browser tab backgrounded - resume on focus
- Very fast task (< 1 second) - still visible briefly

**Test Data Requirements**:
- Concurrent running tasks
- Various task durations
- Connection failure scenarios
- High-volume execution periods

---

### UX-ANALYTICS-007: Check Cache Performance

**Title**: Technical User Reviews Cache Health

**User Persona**: Technical admin checking system performance

**Preconditions**:
- Cache service configured (Redis or memory)
- User has accessed analytics recently
- Cache has hit and miss data

**User Journey**:
1. User navigates to Analytics > System Status
2. User views cache statistics:
   - Status: Healthy (green indicator)
   - Availability: 99.99%
   - Latency: 12ms average
   - Reconnection attempts: 0
3. User sees cache health check result:
   - Last check: 2 minutes ago
   - Result: Passed
4. User views cache hit rate:
   - Overall: 82%
   - By endpoint:
     - Execution stats: 95%
     - Task metrics: 78%
     - Usage stats: 88%
5. User refreshes to verify real-time
6. User sees no issues

**Expected Behavior**:
- Cache status clearly displayed
- Health check results recent
- Hit rates by endpoint
- Latency metrics available
- Alerts for unhealthy cache
- No sensitive data exposed

**Success Criteria**:
- [ ] Status displays correctly
- [ ] Health check runs
- [ ] Hit rates calculated
- [ ] Latency shown
- [ ] Unhealthy state displays warning
- [ ] Refresh updates data

**Edge Cases**:
- Cache unavailable - show "Degraded" status
- High latency - show warning threshold
- Reconnecting - show status and progress
- Cache full - show capacity warning
- No cache configured - show "Disabled" status

**Test Data Requirements**:
- Healthy cache scenarios
- Degraded cache scenarios
- Cache unavailable scenarios
- Various hit rate patterns

---

### UX-ANALYTICS-008: Compare Period-Over-Period Performance

**Title**: Manager Compares This Week to Last Week

**User Persona**: Manager presenting improvement metrics

**Preconditions**:
- User has 2+ weeks of data
- Significant changes occurred
- User preparing for review meeting

**User Journey**:
1. User navigates to Analytics
2. User clicks "Compare Periods"
3. User selects:
   - Current period: This week
   - Comparison period: Last week
4. System displays side-by-side:
   | Metric          | Last Week | This Week | Change |
   |-----------------|-----------|-----------|--------|
   | Executions      | 980       | 1,234     | +25.9% |
   | Success Rate    | 91.2%     | 94.5%     | +3.3%  |
   | Avg Duration    | 52s       | 45s       | -13.5% |
   | Failed          | 86        | 68        | -20.9% |
5. User sees improvement indicators (green arrows)
6. User views comparison chart overlaying both periods
7. User identifies Friday as big improvement day
8. User exports comparison report
9. User presents at team meeting

**Expected Behavior**:
- Periods aligned correctly
- Changes calculated accurately
- Direction indicators clear
- Charts overlay cleanly
- Export includes comparison
- Negative changes show red

**Success Criteria**:
- [ ] Period selection works
- [ ] Calculations accurate
- [ ] Indicators correct
- [ ] Chart overlay works
- [ ] Export includes both periods
- [ ] Visual distinction clear

**Edge Cases**:
- Insufficient data in comparison period - show partial
- Periods of different lengths - normalize per-day
- Zero base value (division issue) - handle gracefully
- Same values (no change) - show "No change"
- Dramatic change (1000%+) - display clearly

**Test Data Requirements**:
- Improvement scenarios
- Decline scenarios
- No change scenarios
- Partial data scenarios

---

### UX-ANALYTICS-009: Export Analytics Data

**Title**: Analyst Exports Data for External Reporting

**User Persona**: Business analyst creating custom reports

**Preconditions**:
- User has substantial data
- User needs data in specific format
- External tool requires CSV

**User Journey**:
1. User navigates to Analytics
2. User configures desired view:
   - Period: Last 30 days
   - Grouping: Daily
   - Metrics: All
3. User clicks "Export" button
4. System displays export options:
   - Format: CSV / JSON / PDF
   - Include: All columns / Selected
   - Date range: Confirm
5. User selects CSV, all columns
6. User clicks "Generate Export"
7. System processes export:
   - "Preparing data..."
   - "Generating file..."
8. Download starts automatically
9. User opens CSV in Excel
10. All data present and formatted

**Expected Behavior**:
- Export options clear
- Generation quick (< 10 seconds)
- File downloads automatically
- Data matches dashboard
- Format clean and usable
- Large exports handled

**Success Criteria**:
- [ ] Format options work
- [ ] Export generates quickly
- [ ] Download starts automatically
- [ ] Data accurate and complete
- [ ] CSV opens in Excel
- [ ] Large exports succeed

**Edge Cases**:
- Very large export (100,000 rows) - progress indicator, async
- No data to export - show "No data" message
- Export fails - retry option
- Special characters in data - properly escaped
- Date formatting - ISO 8601

**Test Data Requirements**:
- Various data volumes
- Special character handling
- Different date formats
- All metric combinations

---

### UX-ANALYTICS-010: Configure Dashboard Preferences

**Title**: User Customizes Default Analytics View

**User Persona**: Power user optimizing workflow

**Preconditions**:
- User has used analytics extensively
- User prefers specific view
- Dashboard supports customization

**User Journey**:
1. User navigates to Analytics
2. User clicks settings gear icon
3. User sees preferences panel:
   - Default time period: [Dropdown]
   - Default grouping: [Dropdown]
   - Auto-refresh interval: [Dropdown]
   - Theme: [Light/Dark/System]
   - Favorite metrics: [Checkboxes]
4. User configures:
   - Default period: Month
   - Grouping: Weekly
   - Auto-refresh: 5 minutes
   - Theme: Dark
   - Favorites: Success rate, Avg duration
5. User clicks "Save Preferences"
6. System saves preferences
7. User navigates away and returns
8. Dashboard loads with saved preferences
9. Only favorite metrics prominently displayed
10. Auto-refresh updates every 5 minutes

**Expected Behavior**:
- Preferences persist across sessions
- All options work correctly
- Theme applies immediately
- Auto-refresh reliable
- Favorites highlighted
- Reset option available

**Success Criteria**:
- [ ] Preferences save successfully
- [ ] Persist across sessions
- [ ] Theme changes immediately
- [ ] Auto-refresh works
- [ ] Favorites display correctly
- [ ] Reset to defaults works

**Edge Cases**:
- Conflicting preferences - validate and warn
- Invalid refresh interval - enforce minimum
- Too many favorites - limit or scroll
- Theme system changes - respond dynamically
- Preferences corrupt - reset to defaults

**Test Data Requirements**:
- Various preference combinations
- Theme testing across devices
- Refresh interval testing
- Browser storage scenarios

---

## Appendix A: Test Data Generation Guidelines

### Voice Agent Test Data
- Generate lead lists with 10, 100, 1000 records
- Include phone numbers in various formats
- Include leads without phone numbers (5-10%)
- Create campaigns in all status states

### Webhooks Test Data
- Configure test Twilio account with sandbox
- Set up test SMTP server (Mailhog/Mailtrap)
- Create webhook.site endpoints for testing
- Generate HMAC signature test vectors

### SEO Test Data
- Use test domains with known SEO profiles
- Create mock SERP API responses
- Generate keyword lists with various metrics
- Prepare sample heatmap event data

### Ad Manager Test Data
- Create Meta test ad account
- Upload sample ad screenshots (various quality)
- Prepare ad copy samples
- Generate mock performance metrics

### Analytics Test Data
- Generate execution history for 30-90 days
- Create various success/failure distributions
- Include edge case durations
- Simulate concurrent executions

---

## Appendix B: Accessibility Testing Checklist

All UX stories should be validated against:
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] Focus states visible
- [ ] Error messages accessible
- [ ] Loading states announced
- [ ] Charts have text alternatives
- [ ] Forms have proper labels

---

## Appendix C: Performance Testing Requirements

| Feature | Load Time Target | Concurrent Users |
|---------|------------------|------------------|
| Voice Agent Dashboard | < 2s | 100 |
| Webhooks List | < 1s | 200 |
| SEO Audit | < 60s | 50 |
| Ad Analysis | < 15s | 100 |
| Analytics Dashboard | < 2s | 500 |

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Development Team | Initial UX stories creation |
