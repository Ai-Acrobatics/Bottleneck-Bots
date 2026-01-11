# User Experience Stories - Features 1-5

## Bottleneck-Bots QA Validation Document

**Document Version:** 1.0
**Last Updated:** 2026-01-11
**Status:** Ready for QA Testing

---

# Feature 1: AI Agent Orchestration

## UX-AI-001: Natural Language Task Execution - Simple Command

**Title:** User executes a simple task using natural language

**User Persona:** Developer (Sarah) - Intermediate technical user who wants to automate browser tasks without writing code

**Preconditions:**
- User is logged into Bottleneck-Bots dashboard
- At least one AI model is configured (Gemini, Claude, or OpenAI)
- User has valid API credentials stored

**User Journey:**
1. Sarah navigates to the Agent Control panel
2. She clicks on the "New Task" button
3. In the natural language input field, she types: "Go to GitHub and star the repository ruvnet/claude-flow"
4. She selects her preferred AI model from the dropdown (e.g., Gemini 3 Pro)
5. She clicks "Execute Task"
6. The system displays a real-time streaming view of the agent's actions
7. She observes the agent navigating to GitHub, logging in if needed, and starring the repository
8. Upon completion, she sees a success notification with execution summary

**Expected Behavior:**
- Input field accepts natural language with no syntax requirements
- Model selection dropdown shows only configured/available models
- Execute button is disabled until valid input is provided
- Real-time streaming shows each step as it happens
- Agent thinking viewer displays the AI's reasoning process
- Completion notification includes execution time and steps taken

**Success Criteria:**
- Task completes within 60 seconds
- Repository is successfully starred (verifiable on GitHub)
- No error messages displayed
- Execution log shows all steps performed
- Session is automatically saved for future reference

**Edge Cases:**
- User enters empty or whitespace-only input (show validation error)
- Selected model API is temporarily unavailable (show retry option)
- GitHub requires 2FA during task (agent should pause and notify user)
- Network timeout during execution (show reconnection attempt)
- User clicks execute multiple times rapidly (debounce clicks, prevent duplicate tasks)

**Test Data Requirements:**
- Valid GitHub account credentials
- Repository URL: github.com/ruvnet/claude-flow
- API keys for at least one AI model

---

## UX-AI-002: Multi-Model Task Comparison

**Title:** User compares task execution across different AI models

**User Persona:** Tech Lead (Marcus) - Evaluating which AI model performs best for his team's use cases

**Preconditions:**
- Multiple AI models configured (Gemini, Claude, and OpenAI)
- User has "Compare Models" feature enabled
- Sufficient API credits for all models

**User Journey:**
1. Marcus opens the Agent Control panel
2. He clicks "Advanced Options" to expand settings
3. He enables "Multi-Model Comparison" toggle
4. He selects all three available models: Gemini 3 Pro, Claude Opus 4.5, GPT-4o
5. He enters task: "Navigate to news.ycombinator.com and extract the top 5 headlines"
6. He clicks "Execute Comparison"
7. The system runs the task on all three models simultaneously (or sequentially based on settings)
8. Results display in a comparison table showing execution time, accuracy, and token usage
9. Marcus reviews the detailed breakdown for each model's approach

**Expected Behavior:**
- Comparison mode clearly indicates additional API costs
- All models execute the same task independently
- Results table shows side-by-side metrics
- Each model's execution can be expanded for detailed view
- Token usage and estimated cost displayed per model

**Success Criteria:**
- All three models complete the task
- Comparison table accurately reflects performance metrics
- Results are exportable (CSV/JSON)
- User can designate a "winner" for future default selection

**Edge Cases:**
- One model fails while others succeed (show partial results)
- Model rate limits are hit mid-comparison (queue and retry)
- User cancels comparison mid-execution (show completed results only)
- Network issues cause one model to timeout (mark as failed, continue others)

**Test Data Requirements:**
- API keys for Gemini, Claude, and OpenAI
- Target URL: news.ycombinator.com
- Expected output format for headline extraction

---

## UX-AI-003: Session Management with Live View

**Title:** User monitors and manages multiple active sessions

**User Persona:** Operations Manager (Lisa) - Oversees multiple automated tasks running concurrently

**Preconditions:**
- User has at least 3 active or recent sessions
- Live view feature is enabled in account settings
- User has permission to view and manage sessions

**User Journey:**
1. Lisa navigates to the Sessions Dashboard
2. She sees a grid view of all active sessions with live thumbnails
3. She clicks on Session #1 to expand the live view
4. The live view shows real-time browser activity with 1-second refresh
5. She notices Session #2 is stuck, so she clicks on it
6. She uses the "Pause" button to halt the session
7. She reviews the session log to identify the issue
8. She either "Resume" with corrections or "Terminate" the session
9. She returns to the grid view to monitor remaining sessions

**Expected Behavior:**
- Grid view shows session status indicators (Running, Paused, Completed, Failed)
- Live view updates at configurable intervals (1s, 5s, 10s)
- Pause/Resume/Terminate controls are immediately responsive
- Session logs are searchable and filterable
- Notifications appear for session state changes

**Success Criteria:**
- All active sessions visible in grid within 2 seconds of page load
- Live view latency under 2 seconds
- Pause command halts session within 3 seconds
- Session state persists across page refreshes
- Terminated sessions move to history with full logs preserved

**Edge Cases:**
- More than 20 active sessions (pagination or scrolling)
- Live view for session on slow connection (reduce refresh rate)
- Session terminates unexpectedly (show error state with reason)
- User lacks permission to terminate specific session (disable button)
- Browser tab goes to background (reduce live view updates)

**Test Data Requirements:**
- At least 5 concurrent session capabilities
- Sample tasks of varying duration (30s, 2min, 5min)
- Sessions in different states for testing

---

## UX-AI-004: Real-Time Streaming via SSE

**Title:** User observes task execution through Server-Sent Events stream

**User Persona:** Developer (Alex) - Wants to debug and understand agent behavior in real-time

**Preconditions:**
- User has initiated a task execution
- SSE connection is established
- Developer tools or debug mode is enabled

**User Journey:**
1. Alex starts a complex task: "Search for 'machine learning courses' on Coursera, filter by free courses, and extract the first 10 course names and ratings"
2. The task begins and the SSE stream connects
3. Alex sees the streaming panel populate with real-time events
4. Events appear with timestamps: navigation, page loads, AI decisions, actions taken
5. Alex hovers over an event to see detailed payload
6. He clicks an event to freeze the stream and inspect it
7. He clicks "Resume Stream" to continue watching
8. When complete, the full event stream is available for download

**Expected Behavior:**
- SSE connection establishes within 1 second
- Events stream with sub-second latency
- Event types are color-coded (navigation=blue, action=green, decision=yellow, error=red)
- Hovering shows truncated payload, clicking shows full payload
- Stream can be paused without losing events
- Auto-scroll follows new events unless user has scrolled up

**Success Criteria:**
- No events are lost during normal operation
- Stream reconnects automatically if connection drops
- Events are chronologically ordered
- Export includes all event data in structured format
- Stream persists for tasks up to 30 minutes

**Edge Cases:**
- SSE connection drops mid-stream (auto-reconnect with backoff)
- High-frequency events (>10/second) throttle display without losing data
- Browser memory constraints with long streams (implement virtualized scrolling)
- User refreshes page during stream (reconnect to active stream)
- Task completes while user is scrolled up (notification of completion)

**Test Data Requirements:**
- Complex multi-step task
- Target URL: coursera.org
- Expected event types: navigate, observe, act, extract, complete

---

## UX-AI-005: Agent Thinking Viewer

**Title:** User explores AI reasoning through the thinking viewer

**User Persona:** AI Researcher (Jordan) - Interested in understanding how the AI approaches tasks

**Preconditions:**
- User has enabled "Show AI Thinking" in preferences
- A task has been executed or is in progress
- The AI model supports reasoning/thinking output

**User Journey:**
1. Jordan initiates a task: "Find the cheapest flight from NYC to LAX next Friday"
2. She expands the "Agent Thinking" panel on the right side
3. As the agent works, she sees its reasoning process displayed
4. The thinking viewer shows: "Analyzing task... Need to identify flight search sites... Considering Kayak, Google Flights, Expedia..."
5. She sees decision points highlighted: "Choosing Google Flights because it aggregates multiple sources"
6. She watches the agent's internal state as it navigates and compares prices
7. Upon completion, she can replay the thinking timeline
8. She exports the thinking log for research purposes

**Expected Behavior:**
- Thinking panel updates in real-time synchronized with actions
- Decision points are visually distinct from observations
- Confidence scores displayed for major decisions (if available)
- Timeline scrubber allows navigation through thinking history
- Thinking log is structured and searchable

**Success Criteria:**
- Thinking updates appear within 500ms of corresponding action
- All major decisions include reasoning text
- Export produces valid JSON with timestamps
- Replay mode accurately synchronizes thinking with action history
- User can annotate specific thinking moments

**Edge Cases:**
- AI model doesn't support thinking output (show "Thinking not available for this model")
- Very long thinking chains (collapse intermediate steps)
- Multiple concurrent decision branches (show tree view)
- Thinking contains sensitive information (redaction options)
- User disables thinking mid-task (stop updates but preserve history)

**Test Data Requirements:**
- Task requiring multiple decision points
- AI model with thinking/reasoning capability
- Expected decision points to verify

---

## UX-AI-006: Task Cancellation Mid-Execution

**Title:** User cancels a running task before completion

**User Persona:** Product Manager (Rachel) - Realizes she made an error in task specification

**Preconditions:**
- A task is currently executing
- Cancel functionality is enabled
- User has permission to cancel tasks

**User Journey:**
1. Rachel starts a task: "Delete all spam emails from my inbox"
2. She immediately realizes she forgot to specify "only from the last week"
3. She clicks the prominent "Cancel Task" button (red, top-right)
4. A confirmation dialog appears: "Are you sure you want to cancel this task? Actions already taken cannot be undone."
5. She clicks "Yes, Cancel Task"
6. The system immediately stops the agent
7. She sees a summary: "Task cancelled. 3 emails deleted before cancellation."
8. She reviews the execution log to see exactly what was deleted
9. She starts a new, correctly specified task

**Expected Behavior:**
- Cancel button is always visible during execution
- Confirmation dialog prevents accidental cancellation
- Cancellation halts agent within 2 seconds
- Partial execution summary is provided
- Full log of actions taken is preserved
- System cleans up any held resources

**Success Criteria:**
- Task stops within 2 seconds of confirmation
- Actions taken before cancellation are accurately logged
- No orphaned browser sessions remain
- User can immediately start new task
- Cancelled tasks appear in history with "Cancelled" status

**Edge Cases:**
- Task is between actions when cancel is clicked (wait for current action to complete)
- Network issues prevent cancel signal delivery (retry with timeout)
- Task has already completed when cancel is processed (show "Already completed")
- Multiple cancel clicks (ignore subsequent clicks)
- Task is in "waiting for user input" state (cancel immediately)

**Test Data Requirements:**
- Test email account with expendable test emails
- Task that takes at least 30 seconds to complete
- Cancellation at various execution stages

---

## UX-AI-007: Error Recovery and Retry

**Title:** User handles and recovers from task execution errors

**User Persona:** QA Engineer (Tom) - Testing system resilience

**Preconditions:**
- User has a task that may encounter errors
- Retry functionality is enabled
- Error notifications are configured

**User Journey:**
1. Tom starts a task: "Log into app.example.com and export the monthly report"
2. The agent encounters a login page that has changed layout
3. An error notification appears: "Unable to locate login button. Page structure may have changed."
4. Tom sees three options: "Retry", "Retry with Hints", "Cancel"
5. He clicks "Retry with Hints"
6. A dialog appears where he can provide guidance: "The login button is now a blue button with text 'Sign In' at the top right"
7. He submits the hint
8. The agent retries with the additional context
9. The task completes successfully
10. The hint is optionally saved for future similar tasks

**Expected Behavior:**
- Error notifications are non-blocking but prominent
- Error details are expandable for technical users
- Retry options are contextually appropriate
- Hints are processed and incorporated into agent context
- Successful hints can be saved as automation rules

**Success Criteria:**
- Error detected within 5 seconds of occurrence
- Retry initiates within 1 second of user action
- Hints successfully modify agent behavior
- Saved hints apply to future similar errors
- Error logs include full context for debugging

**Edge Cases:**
- Multiple errors in sequence (aggregate or show sequentially)
- Error during retry (offer "Retry again" or escalate)
- Invalid hint provided (agent reports if hint doesn't help)
- Maximum retry limit reached (force cancel with explanation)
- Transient error that resolves on retry (auto-retry option)

**Test Data Requirements:**
- Test site with intentionally changed layout
- Login credentials for test account
- Multiple error scenarios to test

---

## UX-AI-008: Task Queue Management

**Title:** User manages a queue of pending tasks

**User Persona:** Automation Specialist (Nina) - Managing batch operations

**Preconditions:**
- User has multiple tasks to execute
- Queue feature is enabled
- System has concurrent execution limits

**User Journey:**
1. Nina navigates to the Task Queue panel
2. She clicks "Add to Queue" multiple times, creating 5 tasks
3. She sees tasks listed with "Pending" status
4. She drags tasks to reorder priority
5. She selects task #3 and clicks "Move to Top"
6. She enables "Auto-execute queue" toggle
7. Tasks begin executing based on system capacity
8. She monitors progress via the queue dashboard
9. She pauses the queue temporarily, then resumes
10. Upon queue completion, she reviews the batch results

**Expected Behavior:**
- Queue displays all pending tasks with order numbers
- Drag-and-drop reordering is smooth and immediate
- Auto-execute respects system concurrent limits
- Pause halts new task starts but doesn't interrupt running tasks
- Batch results summarize successes, failures, and skipped tasks

**Success Criteria:**
- Queue supports at least 50 pending tasks
- Reordering persists correctly
- Running tasks are not affected by queue pause
- Batch report is generated within 30 seconds of completion
- Failed tasks can be retried individually or in batch

**Edge Cases:**
- Queue exceeds 100 tasks (pagination or warning)
- Task in queue becomes invalid (detect and mark on execution)
- System resources exhausted (pause queue, notify user)
- User adds tasks while queue is processing (add to end unless prioritized)
- Duplicate task detection (warn user, offer to skip)

**Test Data Requirements:**
- 10+ sample tasks of varying complexity
- Tasks that will succeed and fail
- Concurrent execution limit configuration

---

## UX-AI-009: API Key Management for Models

**Title:** User adds and manages AI model API keys

**User Persona:** Team Administrator (Carlos) - Setting up organization-wide AI access

**Preconditions:**
- User has admin permissions
- User has API keys for various AI providers
- Settings/Configuration area is accessible

**User Journey:**
1. Carlos navigates to Settings > AI Models
2. He sees the current configured models with masked API keys
3. He clicks "Add New Model"
4. He selects "Claude" from the provider dropdown
5. He enters the API key and optional display name: "Claude Opus 4.5 - Production"
6. He clicks "Validate Key"
7. The system tests the key and confirms: "Valid - 100K tokens remaining"
8. He saves the configuration
9. He sets this model as the organization default
10. He configures usage limits and alerts

**Expected Behavior:**
- API keys are masked after entry (show only last 4 characters)
- Validation checks key validity before saving
- Quota/usage information displayed when available
- Organization defaults are clearly indicated
- Usage limits trigger notifications, not hard blocks

**Success Criteria:**
- Key validation completes within 5 seconds
- Invalid keys show clear error messages
- Keys are stored encrypted at rest
- Usage tracking updates within 1 minute of use
- Alert notifications trigger at configured thresholds

**Edge Cases:**
- Invalid or expired API key (detailed error message)
- Rate-limited API during validation (retry or defer)
- Key with insufficient permissions (warn but allow save)
- Duplicate key entry (detect and prevent)
- Provider API is down during validation (allow save with warning)

**Test Data Requirements:**
- Valid API keys for Gemini, Claude, OpenAI
- Invalid/expired test keys
- Keys with various permission levels

---

## UX-AI-010: Historical Task Execution Review

**Title:** User reviews past task executions for debugging

**User Persona:** Support Engineer (Maria) - Investigating a reported issue

**Preconditions:**
- Task history is enabled and retained
- At least 10 historical tasks exist
- User has permission to view task history

**User Journey:**
1. Maria navigates to History > Task Executions
2. She uses filters: Date range (last 7 days), Status (Failed), Model (Claude)
3. The filtered list shows 3 matching tasks
4. She clicks on task "Invoice Processing - Failed"
5. The detail view shows: execution timeline, screenshots, logs, thinking viewer
6. She scrubs through the timeline to find the failure point
7. She examines the screenshot at failure: login page timeout
8. She views the error logs with stack trace
9. She exports the full execution record as a diagnostic package
10. She creates a bug report with attached diagnostics

**Expected Behavior:**
- Filters are combinable and results update in real-time
- History loads progressively (not all at once)
- Detail view recreates execution experience
- Timeline scrubbing shows corresponding screenshots
- Export includes all relevant data in organized format

**Success Criteria:**
- History search returns results within 2 seconds
- Filter combinations work correctly
- All execution data is preserved and accessible
- Export produces complete diagnostic package
- Privacy-sensitive data can be redacted before export

**Edge Cases:**
- Very old tasks (retention policy warning)
- Tasks with corrupted data (partial display with warning)
- Extremely long tasks (summarized view with expansion)
- Large screenshots (lazy loading and compression)
- Concurrent access to same historical task (read-only mode)

**Test Data Requirements:**
- 30+ historical tasks with varied outcomes
- Tasks with screenshots, logs, and thinking data
- Tasks from various time periods

---

# Feature 2: Browser Automation Control

## UX-BA-001: Starting a New Browserbase Session

**Title:** User initiates a new browser automation session

**User Persona:** QA Tester (Mike) - Needs to run automated tests on a web application

**Preconditions:**
- Browserbase credentials are configured
- Stagehand integration is enabled
- User has session credits available

**User Journey:**
1. Mike navigates to the Browser Automation panel
2. He clicks "New Session"
3. A configuration modal appears with options:
   - Browser type (Chromium default)
   - Viewport size (1920x1080)
   - Enable live view (checked)
   - Enable recording (checked)
4. He clicks "Start Session"
5. A new browser session spins up (loading indicator shows progress)
6. The live view panel shows the browser in its initial state (blank page)
7. He sees session info: ID, status (Active), start time, resource usage
8. He's ready to send commands to the browser

**Expected Behavior:**
- Session starts within 10 seconds
- Live view connects automatically when enabled
- Session ID is unique and displayed prominently
- Resource usage updates every 5 seconds
- Session timeout warning at 4 minutes (if 5 min limit)

**Success Criteria:**
- Session is active and responsive
- Live view shows browser state accurately
- Recording captures all session activity
- Session info is accurate and updating
- User can immediately begin automation

**Edge Cases:**
- Browserbase service is unavailable (clear error with retry option)
- Session limit reached (show upgrade prompt or queue option)
- Live view connection fails (offer reconnect, session continues)
- User starts session then navigates away (session persists, warn on return)
- Browser crashes on startup (auto-retry once, then error)

**Test Data Requirements:**
- Valid Browserbase credentials
- Various viewport sizes to test
- Network conditions to simulate

---

## UX-BA-002: AI-Powered Act Command

**Title:** User executes an action using natural language

**User Persona:** Marketing Analyst (Emma) - Automating social media posting

**Preconditions:**
- Active browser session exists
- Browser is on target page (e.g., Twitter/X dashboard)
- User is logged into the target site

**User Journey:**
1. Emma has a session on twitter.com/compose/tweet
2. In the command input, she types: "Type 'Check out our new product launch!' and click the Post button"
3. She selects action type: "act" from dropdown
4. She clicks "Execute"
5. The AI interprets the command and translates it to actions
6. She watches live as text is typed into the compose box
7. The agent identifies and clicks the Post button
8. She sees confirmation: "Action completed - Tweet posted successfully"
9. The live view shows the posted tweet

**Expected Behavior:**
- Natural language is parsed correctly
- Typing appears character by character in live view
- Button click is visually indicated (highlight before click)
- Success confirmation includes what was done
- Action is logged with timestamp

**Success Criteria:**
- Text is typed accurately (no typos or missed characters)
- Correct button is identified and clicked
- Tweet actually posts (verifiable on Twitter)
- Execution time under 10 seconds
- Full action logged for replay

**Edge Cases:**
- Ambiguous button (multiple "Post" buttons - agent asks for clarification)
- Element not found (retry with alternative selectors)
- Page changed during action (detect and re-observe)
- Rate limiting by target site (pause and notify user)
- Input contains special characters (handle escaping)

**Test Data Requirements:**
- Test Twitter/X account
- Various tweet content including special characters
- Multiple button scenarios for testing

---

## UX-BA-003: AI-Powered Observe Command

**Title:** User extracts information from page using observe

**User Persona:** Data Analyst (David) - Gathering pricing data from competitor sites

**Preconditions:**
- Active browser session on target page
- Page has loaded completely
- Observe action is selected

**User Journey:**
1. David's session is on competitor's pricing page
2. He types: "Observe and list all pricing tiers with their names and monthly costs"
3. He selects action type: "observe"
4. He clicks "Execute"
5. The AI analyzes the page structure
6. The thinking viewer shows: "Identifying pricing table... Found 3 tiers: Basic, Pro, Enterprise"
7. Results are displayed in structured format:
   - Basic: $9/month
   - Pro: $29/month
   - Enterprise: $99/month
8. David exports results as JSON
9. He saves the observation as a reusable template

**Expected Behavior:**
- Page is analyzed without modifying it
- Results are structured and formatted
- Confidence score shown for extracted data
- Export available in multiple formats
- Template saving captures the observation pattern

**Success Criteria:**
- All requested data is extracted accurately
- Data matches what's visible on page
- Export produces valid, structured data
- Template is reusable on similar pages
- No side effects on the page

**Edge Cases:**
- Dynamic content (wait for content to load)
- Paginated data (option to observe all pages)
- Data in images (OCR or report limitation)
- Ambiguous data formats (present alternatives)
- Very large dataset (streaming or chunked results)

**Test Data Requirements:**
- Pages with structured data (pricing, tables)
- Pages with varying layouts
- Expected extraction results for validation

---

## UX-BA-004: Screenshot Capture

**Title:** User captures screenshot of current browser state

**User Persona:** Bug Reporter (Jake) - Documenting issues for development team

**Preconditions:**
- Active browser session exists
- Browser is displaying content
- Screenshot storage is available

**User Journey:**
1. Jake is testing a web application
2. He encounters a visual bug on the page
3. He clicks the "Capture Screenshot" button (camera icon)
4. A modal shows screenshot preview with options:
   - Full page or visible viewport
   - Include cursor position
   - Add annotation
5. He selects "Full page" and adds an arrow annotation pointing to the bug
6. He clicks "Save"
7. Screenshot is saved with metadata (URL, timestamp, session ID)
8. He copies the shareable link
9. He pastes link in bug report

**Expected Behavior:**
- Screenshot captures current browser state accurately
- Full page option scrolls and stitches automatically
- Annotations are saved as overlay
- Metadata is automatically attached
- Shareable link works for team members

**Success Criteria:**
- Screenshot matches what user sees
- Full page capture includes all content
- Annotations are clear and persistent
- Link works for authorized users
- Screenshot is stored for retention period

**Edge Cases:**
- Very long page (memory-efficient stitching)
- Page with infinite scroll (capture visible + warning)
- Dynamic content changes during capture (freeze state)
- Large file size (compress with quality option)
- Session ends before save (recover from cache)

**Test Data Requirements:**
- Pages of various lengths
- Pages with dynamic content
- Various annotation types to test

---

## UX-BA-005: Multi-Tab Management

**Title:** User manages multiple browser tabs in single session

**User Persona:** Researcher (Sophie) - Comparing information across multiple sources

**Preconditions:**
- Active browser session exists
- Multi-tab feature is enabled
- User has opened multiple tabs

**User Journey:**
1. Sophie is researching product reviews
2. She types command: "Open new tab and go to amazon.com/product/reviews"
3. A new tab opens and navigates to the URL
4. She sees tab bar showing: Tab 1 (current site), Tab 2 (Amazon)
5. She opens two more tabs for other review sites
6. She uses tab selector to switch between tabs
7. She executes observe commands on each tab
8. She arranges results side-by-side for comparison
9. She closes tabs she no longer needs
10. She exports consolidated results from all tabs

**Expected Behavior:**
- Tab bar shows all open tabs with favicons/titles
- Tab switching is instantaneous visually
- Commands execute on active tab only
- Tab state is preserved when not active
- Consolidated results maintain source attribution

**Success Criteria:**
- Up to 10 tabs can be managed
- Tab switching completes in under 1 second
- Commands correctly target active tab
- Memory usage remains stable with multiple tabs
- Tab close properly cleans up resources

**Edge Cases:**
- Too many tabs (limit and notify, or warn about performance)
- Tab crashes (isolate crash, recover other tabs)
- Pop-up blocked (show blocked pop-up indicator)
- Tab attempts redirect (intercept and confirm)
- Duplicate tabs detected (warn user)

**Test Data Requirements:**
- Multiple URLs to open
- Various tab states to test
- Memory monitoring for performance

---

## UX-BA-006: Self-Healing Automation Recovery

**Title:** System automatically recovers from failed element selection

**User Persona:** Automation Developer (Chris) - Running established automation scripts

**Preconditions:**
- Automation workflow is running
- Target website has changed layout
- Self-healing is enabled in settings

**User Journey:**
1. Chris's daily automation script runs at 8 AM
2. The script attempts to click "Submit Order" button
3. The button has been redesigned (new class, new position)
4. Self-healing activates: "Primary selector failed. Attempting recovery..."
5. The system tries alternative strategies:
   - Text matching: Found button with text "Submit Order"
   - Visual matching: Found similar button in expected area
6. Alternative selector succeeds
7. Automation continues without interruption
8. Chris receives notification: "Self-healing activated - 1 element recovered"
9. He reviews the healing report with suggested selector updates
10. He updates his script with the new recommended selectors

**Expected Behavior:**
- Self-healing attempts multiple strategies
- Recovery is logged with details
- Automation continues if recovery succeeds
- Notification sent for healed elements
- Recommendations provided for permanent fixes

**Success Criteria:**
- Recovery rate > 80% for common layout changes
- Recovery adds < 5 seconds to execution
- Notification is timely and informative
- Recommendations are accurate and usable
- No false positives (healing when not needed)

**Edge Cases:**
- Multiple elements fail (prioritize and heal sequentially)
- Healing finds wrong element (confidence threshold check)
- Healing strategies all fail (fallback to error handling)
- Page completely redesigned (too many failures, abort with report)
- Healed selector is now ambiguous (pick most likely, log uncertainty)

**Test Data Requirements:**
- Selectors that will break
- Pages with layout variations
- Expected recovery behaviors

---

## UX-BA-007: Session Recording and Playback

**Title:** User records session and replays for training

**User Persona:** Training Manager (Alice) - Creating onboarding materials

**Preconditions:**
- Active session with recording enabled
- User has performed actions to record
- Playback system is available

**User Journey:**
1. Alice starts a session with "Enable Recording" checked
2. She navigates through a complex workflow manually
3. She performs: login, navigation, form filling, submission
4. Recording indicator shows: "Recording - 5:32"
5. She clicks "Stop Recording"
6. She's prompted to name and describe the recording: "New Employee Onboarding - CRM Access"
7. Recording is saved and appears in her library
8. She opens the recording and clicks "Play"
9. She watches the playback with controls (pause, speed, seek)
10. She exports as video for training materials

**Expected Behavior:**
- Recording captures all actions with timing
- Playback is smooth and accurate
- Controls work like standard video player
- Export produces high-quality video
- Recordings are searchable by name/description

**Success Criteria:**
- Recording captures 100% of actions
- Playback timing matches original
- Video export is clear and usable
- Recordings persist until explicitly deleted
- Playback works on different devices

**Edge Cases:**
- Very long recording (chunked storage, streaming playback)
- Recording during errors (include error in recording)
- Browser crash during recording (recover what was captured)
- Simultaneous recordings (support multiple or queue)
- Playback of outdated recording (warn about potential differences)

**Test Data Requirements:**
- Workflow to record (5-10 minutes)
- Various action types
- Video quality specifications

---

## UX-BA-008: Custom Viewport and Device Emulation

**Title:** User tests automation on different device viewports

**User Persona:** Mobile Developer (Ryan) - Testing responsive automation

**Preconditions:**
- Session creation modal is open
- Device presets are configured
- User understands viewport concepts

**User Journey:**
1. Ryan opens "New Session" modal
2. He clicks on "Device Emulation" section
3. He sees preset options: Desktop, Tablet, Mobile iPhone 15, Mobile Android
4. He selects "Mobile iPhone 15"
5. Settings auto-populate: 393x852, touch enabled, mobile user agent
6. He optionally adjusts settings manually
7. He starts the session
8. The live view shows a mobile-sized viewport
9. He runs his mobile-specific automation
10. He switches to Tablet to test that viewport

**Expected Behavior:**
- Presets accurately reflect real devices
- User agent is set correctly for device
- Touch events are simulated for touch devices
- Live view scales appropriately
- Viewport can be changed mid-session

**Success Criteria:**
- Viewport matches selected device exactly
- Responsive sites render as expected
- Touch actions work on touch-emulated devices
- User agent is respected by target sites
- Viewport changes take effect immediately

**Edge Cases:**
- Custom viewport values out of range (validate and warn)
- Site doesn't support selected viewport (show as-is, no error)
- Viewport change breaks current page state (warn user)
- Touch emulation fails (fallback to click)
- Very large viewport (may exceed session limits)

**Test Data Requirements:**
- Responsive website for testing
- Device specifications for validation
- Touch-specific interactions to test

---

## UX-BA-009: Browserbase Live View Connection

**Title:** User enables and monitors live view during session

**User Persona:** Manager (Patricia) - Overseeing automation work

**Preconditions:**
- Session is active
- Live view is supported and enabled
- Network connection is stable

**User Journey:**
1. Patricia opens an active session's detail page
2. She clicks "Open Live View" button
3. A new panel opens showing real-time browser view
4. She sees the browser updating as actions occur
5. She uses zoom controls to adjust view size (50%, 100%, 150%)
6. She clicks "Picture-in-Picture" to pop out the view
7. The live view continues in a separate floating window
8. She monitors while working on other tasks
9. She clicks the PiP window to return to full view
10. She closes live view when monitoring is complete

**Expected Behavior:**
- Live view connects within 2 seconds
- Frame rate is adequate for monitoring (5-10 fps minimum)
- Zoom works smoothly
- Picture-in-Picture mode is persistent
- Closing live view doesn't affect session

**Success Criteria:**
- Connection is stable for session duration
- Visual quality is sufficient to read text
- Latency is under 3 seconds
- PiP works across browser tabs
- Resources are released on close

**Edge Cases:**
- High network latency (reduce quality, show indicator)
- Live view connection drops (auto-reconnect)
- Multiple users viewing same session (all receive feed)
- Session ends while live view open (show "Session Ended")
- Browser zoom conflicts with live view zoom (handle separately)

**Test Data Requirements:**
- Active session with ongoing activity
- Various network conditions
- Multiple simultaneous viewers

---

## UX-BA-010: Session Timeout and Cleanup

**Title:** User handles session timeout gracefully

**User Persona:** Developer (Kevin) - Working on long-running automation

**Preconditions:**
- Session has been running for extended period
- Session timeout is configured (e.g., 30 minutes)
- User is aware of timeout limits

**User Journey:**
1. Kevin starts a session at 9:00 AM
2. He works on automation for 25 minutes
3. A warning notification appears: "Session will timeout in 5 minutes. Extend?"
4. He clicks "Extend Session" (extends by 15 minutes)
5. He continues working
6. At 9:40, he forgets to extend again
7. At 9:45, timeout warning appears again
8. He's away from computer, session times out at 9:50
9. He returns and sees: "Session ended - Timeout. Your work has been saved."
10. He reviews the session log and can resume with a new session

**Expected Behavior:**
- Warning appears with configurable lead time (5-10 min default)
- Extension is one-click process
- Timeout actually ends session (no zombie sessions)
- Work is saved/logged before timeout
- Clear message explains what happened

**Success Criteria:**
- Warnings are timely and noticeable
- Extension works immediately
- Session data is preserved on timeout
- Cleanup releases all resources
- User can start new session immediately after

**Edge Cases:**
- User extends right at timeout moment (handle race condition)
- Network issue prevents extension (queue extension request)
- Session in middle of action at timeout (complete action, then timeout)
- Maximum extensions reached (enforced limit with message)
- Timeout during unattended scheduled task (special handling)

**Test Data Requirements:**
- Sessions with various timeout configurations
- Actions in progress at timeout
- Extension scenarios

---

# Feature 3: Workflow Automation

## UX-WF-001: Creating a Multi-Step Workflow

**Title:** User creates a new automation workflow from scratch

**User Persona:** Operations Manager (Diana) - Building a daily report automation

**Preconditions:**
- User has access to Workflow Builder
- Target sites are accessible
- User understands the manual process

**User Journey:**
1. Diana clicks "Create New Workflow"
2. She enters workflow name: "Daily Sales Report Extraction"
3. She adds Step 1: Navigate
   - URL: https://crm.company.com/reports
4. She adds Step 2: Act
   - Action: "Click on 'Daily Sales' report link"
5. She adds Step 3: Wait
   - Wait type: Element visible
   - Selector: "table.sales-data"
6. She adds Step 4: Extract
   - Target: "table.sales-data"
   - Format: JSON
7. She adds Step 5: Act
   - Action: "Click Export CSV button"
8. She reviews the workflow in visual editor
9. She saves and names the workflow
10. She runs a test execution

**Expected Behavior:**
- Step types are clearly explained
- Each step has contextual configuration options
- Visual editor shows step flow clearly
- Validation occurs before save
- Test execution provides detailed feedback

**Success Criteria:**
- Workflow saves successfully
- Test execution completes all steps
- Extracted data matches expected format
- Errors are clearly identified
- Workflow is reusable

**Edge Cases:**
- Invalid step configuration (highlight error, prevent save)
- Missing required fields (inline validation)
- Duplicate workflow name (suggest alternative)
- Test fails on specific step (show which step and why)
- Very complex workflow (>20 steps) (pagination or scroll)

**Test Data Requirements:**
- Sample CRM with test data
- Expected report structure
- Various step type configurations

---

## UX-WF-002: Configuring Step Types

**Title:** User configures various step types in workflow

**User Persona:** Automation Engineer (Steve) - Building complex conditional workflow

**Preconditions:**
- Workflow editor is open
- User is adding/editing steps
- All step types are available

**User Journey:**
1. Steve adds a Navigate step to start
2. He adds an Observe step to check page state
3. He adds a Condition step:
   - Condition: "If element with text 'Login Required' exists"
   - True path: Branch to login steps
   - False path: Continue to main workflow
4. He adds a Loop step:
   - Loop type: For each element matching ".item-row"
   - Max iterations: 100
5. He adds Extract step inside the loop
6. He adds Wait step with custom timeout: 5000ms
7. He adds Act step with error handling: Retry 3 times
8. He configures step dependencies and ordering
9. He validates the workflow logic
10. He saves and tests with sample data

**Expected Behavior:**
- Each step type has unique configuration UI
- Condition branches are visually clear
- Loops show contained steps grouped
- Dependencies are automatically managed
- Validation catches logical errors

**Success Criteria:**
- All step types function correctly
- Conditions evaluate properly
- Loops execute correct number of times
- Wait times are accurate
- Error handling works as configured

**Edge Cases:**
- Infinite loop protection (max iteration limit)
- Condition always true/false (warning for likely bugs)
- Nested conditions (clear visual representation)
- Loop within loop (supported with limit)
- Empty condition branch (allowed but warned)

**Test Data Requirements:**
- Pages with conditions to test
- Lists for loop testing
- Timeout scenarios

---

## UX-WF-003: Manual Trigger Execution

**Title:** User manually triggers workflow execution

**User Persona:** Sales Rep (Monica) - Running workflow on-demand

**Preconditions:**
- Workflow exists and is valid
- User has permission to execute
- Target systems are available

**User Journey:**
1. Monica navigates to "My Workflows"
2. She finds "Lead Enrichment Workflow"
3. She clicks the "Run" button (play icon)
4. A dialog appears for runtime parameters:
   - Lead ID: [input field]
   - Output format: [dropdown: JSON, CSV, Email]
5. She enters Lead ID: "LD-12345"
6. She selects "Email" as output format
7. She clicks "Execute"
8. Execution starts and she sees real-time progress
9. Each step shows status: Pending -> Running -> Completed
10. Upon completion, she receives email with results

**Expected Behavior:**
- Run button is prominent and accessible
- Parameters are clearly labeled with help text
- Execution progress is real-time
- Each step status is visible
- Results delivered as configured

**Success Criteria:**
- Execution starts within 3 seconds
- Parameters are correctly applied
- All steps complete successfully
- Email is received within 1 minute of completion
- Execution appears in history

**Edge Cases:**
- Required parameter not provided (validation error)
- Invalid parameter value (type checking)
- Workflow modified since last run (version warning)
- Execution quota exceeded (clear message)
- Email delivery fails (retry and notify)

**Test Data Requirements:**
- Workflow with runtime parameters
- Valid test Lead IDs
- Email addresses for delivery testing

---

## UX-WF-004: Scheduled Trigger Configuration

**Title:** User schedules workflow to run automatically

**User Persona:** Data Analyst (Frank) - Setting up daily data collection

**Preconditions:**
- Workflow is created and tested
- Scheduler feature is available
- User understands scheduling concepts

**User Journey:**
1. Frank opens workflow "Competitor Price Monitor"
2. He clicks "Triggers" tab
3. He clicks "Add Trigger" and selects "Schedule"
4. He configures:
   - Frequency: Daily
   - Time: 6:00 AM
   - Timezone: EST
   - Days: Weekdays only (Mon-Fri)
5. He enables "Skip if previous still running"
6. He configures notification: Email on completion/failure
7. He clicks "Save Schedule"
8. He sees the next scheduled run: "Tomorrow, 6:00 AM EST"
9. He can view scheduled runs in a calendar view
10. He can pause/resume the schedule anytime

**Expected Behavior:**
- Schedule options are intuitive
- Timezone conversion is handled correctly
- Next run time is calculated and displayed
- Calendar shows all scheduled workflows
- Pause/resume is immediate

**Success Criteria:**
- Workflow runs at scheduled time (+/- 1 minute)
- Timezone is respected correctly
- Day filters work (weekdays only)
- Notifications are sent as configured
- Schedule persists across system restarts

**Edge Cases:**
- Daylight saving time transitions (handle correctly)
- Schedule in past time for today (run tomorrow)
- Overlapping schedules (queue or warn)
- System downtime during scheduled run (run on recovery?)
- Very frequent schedule (rate limiting)

**Test Data Requirements:**
- Various schedule configurations
- Multiple timezone scenarios
- Notification testing setup

---

## UX-WF-005: Webhook Trigger Setup

**Title:** User configures webhook to trigger workflow externally

**User Persona:** Integration Developer (Ivan) - Connecting external system

**Preconditions:**
- Workflow is ready for external triggering
- Webhook feature is enabled
- User can configure external system

**User Journey:**
1. Ivan opens workflow "CRM Data Sync"
2. He clicks "Triggers" tab
3. He clicks "Add Trigger" and selects "Webhook"
4. The system generates a unique webhook URL
5. He copies the URL: `https://api.bottleneck-bots.com/webhook/abc123...`
6. He configures authentication:
   - Method: API Key header
   - Header name: X-API-Key
   - Key: [auto-generated, copyable]
7. He reviews the expected payload format (JSON)
8. He adds parameter mapping: `payload.customer_id` -> workflow `customerId`
9. He saves the webhook configuration
10. He tests by sending a curl request

**Expected Behavior:**
- Webhook URL is unique and secure
- Authentication options are flexible
- Payload format is documented
- Parameter mapping is intuitive
- Test option validates end-to-end

**Success Criteria:**
- Webhook triggers workflow within 5 seconds
- Authentication rejects invalid requests
- Parameters map correctly
- Response includes execution ID
- Failed triggers are logged

**Edge Cases:**
- Invalid payload format (reject with clear error)
- Missing required parameters (configurable: reject or default)
- High volume webhooks (rate limiting)
- Webhook URL rotation (version support)
- Circular webhook triggers (detection and prevention)

**Test Data Requirements:**
- Sample payloads for testing
- Invalid payload scenarios
- External system for integration testing

---

## UX-WF-006: Event-Based Trigger Configuration

**Title:** User triggers workflow based on system events

**User Persona:** DevOps Engineer (Wendy) - Automating incident response

**Preconditions:**
- Event sources are configured
- Workflow is designed for event handling
- Event monitoring is active

**User Journey:**
1. Wendy opens workflow "Incident Response Automation"
2. She clicks "Triggers" tab
3. She clicks "Add Trigger" and selects "Event"
4. She browses available event sources:
   - Email received (specific sender)
   - File uploaded
   - Workflow completed
   - API endpoint hit
5. She selects "Email received"
6. She configures:
   - From address: alerts@monitoring.com
   - Subject contains: "CRITICAL"
7. She maps email fields to workflow parameters
8. She sets debounce: "1 per 5 minutes max"
9. She saves and activates the trigger
10. She tests by sending a matching email

**Expected Behavior:**
- Event sources are clearly categorized
- Configuration is event-type specific
- Debounce prevents trigger storms
- Field mapping is flexible
- Test simulates real event

**Success Criteria:**
- Events trigger workflow correctly
- Filtering works as configured
- Debounce limits rapid triggers
- Event data is accessible in workflow
- Missed events are logged

**Edge Cases:**
- Event during system maintenance (queue events)
- Event source goes offline (notification)
- Malformed event data (reject or best-effort)
- Extremely high event volume (circuit breaker)
- Event arrives during workflow execution (queue or parallel)

**Test Data Requirements:**
- Sample events of various types
- Edge case event data
- High-volume event simulation

---

## UX-WF-007: Error Handling Configuration

**Title:** User configures error handling for workflow steps

**User Persona:** Reliability Engineer (Oscar) - Making workflows resilient

**Preconditions:**
- Workflow exists with multiple steps
- Error scenarios are understood
- Retry logic options are available

**User Journey:**
1. Oscar opens workflow "Data Import Pipeline"
2. He clicks on Step 4: "API Call to External Service"
3. He expands "Error Handling" section
4. He configures:
   - On error: Retry
   - Retry count: 3
   - Retry delay: 5 seconds (exponential backoff: checked)
   - On retry exhausted: Go to step "Error Notification"
5. He adds a fallback step: "Log Error and Skip"
6. He configures timeout: 30 seconds
7. He adds global error handler for workflow:
   - Catch unhandled errors
   - Send notification
   - Mark workflow as failed
8. He saves the configuration
9. He runs a test that triggers an error
10. He verifies retry behavior and notification

**Expected Behavior:**
- Error handling is step-level and workflow-level
- Retry with backoff is smooth
- Fallback paths are visually clear
- Timeouts are enforced
- Notifications are timely

**Success Criteria:**
- Retries occur as configured
- Exponential backoff timing is correct
- Fallback steps execute on failure
- Timeouts trigger at correct time
- Error details are captured in logs

**Edge Cases:**
- Error in error handler (prevent infinite loop)
- Timeout during retry (count as failed attempt)
- Network error vs. logic error (different handling options)
- Partial completion before error (rollback options)
- Concurrent errors (handle each independently)

**Test Data Requirements:**
- Endpoints that fail predictably
- Timeout scenarios
- Various error types

---

## UX-WF-008: Workflow Versioning and History

**Title:** User manages workflow versions and rollback

**User Persona:** Team Lead (Vicky) - Managing workflow changes

**Preconditions:**
- Workflow has been edited multiple times
- Version history is enabled
- User has edit permissions

**User Journey:**
1. Vicky opens workflow "Customer Onboarding"
2. She clicks "Version History" tab
3. She sees list of versions:
   - v5 (current) - "Added email verification step" - 1 hour ago
   - v4 - "Updated selectors for new UI" - 2 days ago
   - v3 - "Initial production release" - 1 week ago
4. She clicks on v4 to view differences
5. A diff view shows changes between v4 and v5
6. She notices v5 has a bug, decides to rollback
7. She clicks "Rollback to v4"
8. Confirmation dialog warns: "Current version will be replaced"
9. She confirms, v4 becomes active (as v6)
10. She verifies the workflow and adds a fix

**Expected Behavior:**
- Version list is chronological
- Each version has description and metadata
- Diff view clearly shows changes
- Rollback creates new version (doesn't delete history)
- Active version is clearly marked

**Success Criteria:**
- All versions are accessible
- Diff is accurate and readable
- Rollback works correctly
- Version numbers are sequential
- History is preserved indefinitely (or per retention policy)

**Edge Cases:**
- Very many versions (pagination, search)
- Rollback to version with now-invalid references (validation)
- Concurrent edits by multiple users (conflict resolution)
- Rollback while workflow is running (queue rollback)
- Deleted step in old version (restore completely)

**Test Data Requirements:**
- Workflow with 10+ versions
- Versions with various change types
- Conflict scenarios

---

## UX-WF-009: Workflow Templates and Sharing

**Title:** User creates workflow from template and shares

**User Persona:** Consultant (Nancy) - Setting up client automations

**Preconditions:**
- Template library is available
- User can create and share workflows
- Team/organization is configured

**User Journey:**
1. Nancy clicks "Create from Template"
2. She browses template categories: Sales, Marketing, Operations, HR
3. She selects "Sales" category
4. She finds template: "Lead Capture to CRM"
5. She previews the template: 6 steps, 2 parameters
6. She clicks "Use Template"
7. The workflow is created with template steps
8. She customizes: Updates CRM URL, adds company-specific fields
9. She saves as "ClientX Lead Capture"
10. She clicks "Share" and adds her client team members with view/edit permissions

**Expected Behavior:**
- Templates are categorized and searchable
- Preview shows structure without creating
- Created workflow is editable copy
- Sharing permissions are granular
- Shared users can access immediately

**Success Criteria:**
- Template creates functional workflow
- Customizations are saved correctly
- Sharing notification reaches recipients
- Permissions are enforced correctly
- Usage tracking shows template popularity

**Edge Cases:**
- Template has outdated steps (warning on use)
- Sharing to user outside organization (configurable)
- Shared user lacks required integrations (show requirements)
- Template creator updates original (option to sync)
- User without edit access tries to modify (clear error)

**Test Data Requirements:**
- Multiple templates across categories
- Team members for sharing tests
- Various permission levels

---

## UX-WF-010: Workflow Execution Monitoring

**Title:** User monitors workflow execution in real-time

**User Persona:** Support Specialist (Gina) - Troubleshooting client issue

**Preconditions:**
- Workflow is currently executing
- Monitoring dashboard is available
- User has view permissions

**User Journey:**
1. Gina opens "Active Executions" dashboard
2. She sees list of running workflows with status indicators
3. She clicks on "Customer Invoice Processing - Run #1234"
4. She sees execution detail view:
   - Progress: Step 5 of 8
   - Current step: "Extract Invoice Data"
   - Runtime: 2:34
   - Resource usage: Browser session active
5. She expands step 5 to see live output
6. She notices step is taking longer than expected
7. She checks the live view panel to see browser state
8. She sees the page is loading slowly
9. She can choose to "Skip Step" or "Pause Execution"
10. She waits, step completes, execution continues

**Expected Behavior:**
- Dashboard shows all active executions
- Progress updates in real-time
- Step detail is expandable
- Intervention controls are available
- Live view syncs with current step

**Success Criteria:**
- Status updates within 2 seconds
- All step data is visible
- Interventions work as expected
- Multiple executions are distinguishable
- Performance is acceptable with many executions

**Edge Cases:**
- Step hangs indefinitely (timeout indicator, intervention prompt)
- Browser connection lost (show disconnected state)
- User without intervention permission (hide controls)
- Execution ends while viewing (show final state)
- Dashboard refresh while viewing (preserve position)

**Test Data Requirements:**
- Long-running workflows
- Workflows with various step types
- Failure scenarios

---

# Feature 4: Autonomous Agent System

## UX-AA-001: Initiating Autonomous Task

**Title:** User initiates a complex task for autonomous execution

**User Persona:** Business Owner (Paul) - Delegating complex research task

**Preconditions:**
- User has autonomous agent access
- Claude function calling is enabled
- User understands autonomous mode

**User Journey:**
1. Paul opens "Autonomous Agent" panel
2. He types task: "Research top 10 competitors in the CRM market, compile their pricing, features, and recent news. Create a summary report."
3. He reviews the AI's task plan:
   - Step 1: Identify CRM market competitors
   - Step 2: Research pricing for each
   - Step 3: Extract key features
   - Step 4: Find recent news articles
   - Step 5: Compile and format report
4. He adjusts plan: Adds "Include customer review sentiment"
5. He sets permission level: "Moderate" (can browse, but confirm before downloads)
6. He sets time limit: 2 hours
7. He clicks "Start Autonomous Execution"
8. He receives updates via notification as agent progresses
9. Agent completes and requests approval for final report
10. Paul reviews and approves the output

**Expected Behavior:**
- Task is analyzed and plan is proposed
- User can modify the plan
- Permission levels are enforced
- Time limit is respected
- Progress updates are informative

**Success Criteria:**
- Plan is sensible for the task
- Modifications are incorporated
- Permissions prevent unauthorized actions
- Execution completes within time limit
- Report quality is high

**Edge Cases:**
- Task is too vague (agent asks clarifying questions)
- Plan has too many steps (warn about time/cost)
- Agent gets stuck (escalate to user)
- Time limit reached (save progress, offer continuation)
- Conflicting instructions (ask for clarification)

**Test Data Requirements:**
- Complex multi-step task descriptions
- Time limit scenarios
- Permission boundary tests

---

## UX-AA-002: Task Status Tracking

**Title:** User tracks autonomous task progress

**User Persona:** Manager (Heather) - Monitoring delegated tasks

**Preconditions:**
- Autonomous task is in progress
- User has access to task dashboard
- Notifications are configured

**User Journey:**
1. Heather opens "My Tasks" dashboard
2. She sees task "Competitor Analysis" with status "In Progress (67%)"
3. She clicks to expand task details
4. She sees breakdown:
   - Step 1: Completed (Found 12 competitors)
   - Step 2: Completed (Pricing collected for 10)
   - Step 3: In Progress (Features analysis - 7 of 12 complete)
   - Step 4: Pending
   - Step 5: Pending
5. She sees estimated completion: 45 minutes
6. She clicks "View Live Activity" to see current action
7. She sends a message to agent: "Prioritize the top 5 competitors"
8. Agent acknowledges and adjusts approach
9. She returns to her work, receives completion notification later
10. She reviews the final output

**Expected Behavior:**
- Status percentage reflects actual progress
- Step breakdown is accurate
- Estimated completion updates dynamically
- User messages reach agent promptly
- Agent adapts to user input

**Success Criteria:**
- Progress tracking is accurate
- Estimates are reasonably close to actual
- Agent communication is responsive
- Adjustments are incorporated
- Completion notification is timely

**Edge Cases:**
- Agent encounters unexpected complexity (update estimate)
- User message during critical action (queue until safe point)
- Estimate is very wrong (explain why)
- Progress regresses (e.g., data was invalid) (show and explain)
- Multiple users tracking same task (all see same status)

**Test Data Requirements:**
- Tasks with measurable steps
- Varying complexity tasks
- Communication scenarios

---

## UX-AA-003: Agent-to-User Communication

**Title:** Agent proactively communicates with user

**User Persona:** Marketing Director (Quinn) - Receiving agent updates

**Preconditions:**
- Autonomous task is running
- User has notification preferences set
- Agent has encountered a situation requiring communication

**User Journey:**
1. Quinn assigned task: "Create social media content calendar for Q2"
2. She receives notification: "Agent has a question"
3. She opens the task detail
4. Agent message: "I've drafted content for LinkedIn and Twitter. Should I also include Instagram and TikTok?"
5. She responds: "Yes, include Instagram. Skip TikTok."
6. Agent acknowledges: "Understood. Proceeding with LinkedIn, Twitter, and Instagram."
7. Later, she receives: "Alert: The marketing trends API returned unusual data. Please verify: [link]"
8. She checks the link and responds: "Data looks incorrect. Use last month's trends instead."
9. Agent adjusts and continues
10. Final notification: "Task complete. Summary: 36 content pieces across 3 platforms."

**Expected Behavior:**
- Notifications appear promptly
- Messages are clear and actionable
- Response is acknowledged
- Alerts are distinguished from questions
- Final summary is informative

**Success Criteria:**
- Notifications appear within 30 seconds
- Messages provide context for decision
- Responses are incorporated correctly
- Agent doesn't proceed prematurely on required responses
- Communication log is preserved

**Edge Cases:**
- User doesn't respond (wait with timeout, then default or pause)
- Multiple questions simultaneously (prioritize or batch)
- Conflicting responses (clarify)
- User responds after agent moved on (apply if still relevant)
- Communication channel unavailable (retry, log, proceed cautiously)

**Test Data Requirements:**
- Tasks that require user input
- Various question scenarios
- Timeout testing

---

## UX-AA-004: Permission Level Configuration

**Title:** User configures agent permission boundaries

**User Persona:** IT Administrator (Roger) - Setting security constraints

**Preconditions:**
- User has admin access
- Permission configuration is available
- Default permissions are set

**User Journey:**
1. Roger opens "Agent Permissions" settings
2. He sees permission levels: Restricted, Moderate, Standard, Elevated
3. He clicks to configure "Moderate" level
4. He sees granular permissions:
   - Web Browsing: Allowed
   - Downloads: Ask First
   - Form Submissions: Allowed (non-financial)
   - API Calls: Allowed (approved endpoints only)
   - Email Sending: Blocked
5. He adds a custom rule: "Block access to competitor domains"
6. He saves the configuration
7. He sets "Moderate" as default for Marketing team
8. He tests by initiating a task that would hit a blocked domain
9. Agent properly stops and requests permission
10. He approves the configuration for production use

**Expected Behavior:**
- Permission levels are clearly explained
- Granular controls are comprehensive
- Custom rules are flexible
- Team/role assignment works
- Test mode validates configuration

**Success Criteria:**
- Permissions are enforced correctly
- Blocked actions trigger appropriate response
- Ask First prompts user correctly
- Custom rules work as configured
- Audit log captures permission checks

**Edge Cases:**
- Permission required mid-action (pause, ask, resume)
- Conflicting permissions (most restrictive wins)
- Permission change during task (apply to new actions only)
- Unknown action type (default to most restrictive)
- Permission bypass attempted (log and block)

**Test Data Requirements:**
- Various permission configurations
- Actions that test each permission type
- Custom rule scenarios

---

## UX-AA-005: Learning from Executions

**Title:** Agent learns from past executions to improve

**User Persona:** Data Scientist (Uma) - Improving automation accuracy

**Preconditions:**
- Multiple similar tasks have been executed
- Learning feature is enabled
- Feedback has been provided

**User Journey:**
1. Uma opens "Agent Learning" dashboard
2. She sees learning metrics:
   - Tasks executed: 234
   - Success rate: 87%
   - Average improvement: 12% over baseline
3. She clicks "Review Learning Data"
4. She sees categories: Selectors, Timing, Patterns, Errors
5. She expands "Selectors" - agent has learned 45 selector alternatives
6. She sees example: Original selector failed, learned alternative works 95% of time
7. She approves the learned alternative for production use
8. She rejects a learning that seems incorrect
9. She trains a new pattern manually: "When login page appears, use SSO option"
10. She monitors improvement in subsequent executions

**Expected Behavior:**
- Learning is automatic from executions
- Metrics are clear and meaningful
- Review shows specific learnings
- Approval/rejection affects future behavior
- Manual training is incorporated

**Success Criteria:**
- Success rate improves over time
- Learned patterns are accurate
- Approval process is clear
- Rejected patterns are not used
- Manual training is applied immediately

**Edge Cases:**
- Learning from failed executions (learn what not to do)
- Contradictory learnings (present for resolution)
- Overfitting to specific site (generalization controls)
- Learning causes regression (rollback mechanism)
- Site changes invalidate learning (detect and flag)

**Test Data Requirements:**
- History of similar tasks
- Feedback data
- Known learning scenarios

---

## UX-AA-006: Task Breakdown and Subtask Management

**Title:** User manages complex task broken into subtasks

**User Persona:** Project Manager (Victor) - Overseeing multi-phase project

**Preconditions:**
- Complex task has been initiated
- Agent has created subtask breakdown
- User has subtask management access

**User Journey:**
1. Victor assigns task: "Migrate customer data from old CRM to new CRM"
2. Agent creates breakdown:
   - Subtask 1: Analyze old CRM data structure
   - Subtask 2: Map fields to new CRM schema
   - Subtask 3: Export data from old CRM
   - Subtask 4: Transform data format
   - Subtask 5: Import to new CRM
   - Subtask 6: Validate imported data
3. Victor reviews and reorders: Moves validation to run after each import batch
4. He assigns priority: Subtask 3 is highest (access may be revoked soon)
5. He sets parallelization: Subtasks 3 & 4 can run concurrently
6. He monitors subtask progress individually
7. Subtask 5 fails on some records - he reviews and fixes mapping
8. He re-runs Subtask 5 for failed records only
9. All subtasks complete successfully
10. He marks parent task as complete

**Expected Behavior:**
- Breakdown is sensible and comprehensive
- Reordering updates execution plan
- Priority affects execution order
- Parallel tasks run concurrently
- Partial failures allow targeted retry

**Success Criteria:**
- Subtasks cover full scope
- Dependencies are respected
- Parallel execution improves speed
- Partial retry works correctly
- Parent task reflects subtask status

**Edge Cases:**
- Subtask added after start (inject into plan)
- Circular dependency detected (prevent and warn)
- Subtask takes much longer than expected (impact on dependent tasks)
- User wants to skip subtask (allow with confirmation)
- All subtasks complete but parent task has additional work (detect and surface)

**Test Data Requirements:**
- Complex tasks requiring breakdown
- Parallel execution scenarios
- Dependency scenarios

---

## UX-AA-007: Agent Approval Workflow

**Title:** Agent pauses for user approval at critical points

**User Persona:** Finance Manager (Wendy) - Approving financial actions

**Preconditions:**
- Task involves actions requiring approval
- Approval workflow is configured
- User is available to approve

**User Journey:**
1. Wendy assigned task: "Process monthly vendor invoices"
2. Agent works through invoices, categorizing and preparing payments
3. Agent reaches approval point: "Ready to submit 23 payments totaling $45,678.90"
4. Wendy receives approval request with summary
5. She reviews the payment list:
   - Vendor, Amount, Invoice #, Category
   - She can click each for details
6. She notices one payment looks unusual - opens details
7. She removes that payment from the batch
8. She approves remaining 22 payments
9. Agent proceeds with approved payments
10. Agent flags the removed payment for manual review

**Expected Behavior:**
- Approval points are clearly defined
- Summary provides enough info to decide
- Details are accessible
- Modifications are supported
- Approval triggers continuation

**Success Criteria:**
- Approval pauses execution correctly
- Summary is accurate and complete
- Modifications are applied
- Approved actions execute successfully
- Rejected items are handled properly

**Edge Cases:**
- Approver is unavailable (timeout, escalation path)
- Approval partially granted (handle mixed decision)
- Data changes while awaiting approval (refresh and re-approve)
- Multiple approvers required (workflow routing)
- Approval accidentally duplicated (idempotent handling)

**Test Data Requirements:**
- Tasks with approval points
- Various approval scenarios
- Partial approval cases

---

## UX-AA-008: Autonomous Agent Termination

**Title:** User terminates runaway autonomous agent

**User Persona:** Security Officer (Xavier) - Emergency agent shutdown

**Preconditions:**
- Autonomous agent is running
- Agent appears to be malfunctioning
- User has termination authority

**User Journey:**
1. Xavier receives alert: "Agent 'Market Research' executing unusual number of requests"
2. He opens the agent's live view
3. He sees the agent is stuck in a loop, repeatedly loading same page
4. He clicks "Emergency Stop" button (prominent, red)
5. Confirmation appears: "This will immediately terminate the agent and may leave partial work"
6. He confirms
7. Agent terminates within 3 seconds
8. He sees termination report:
   - Reason: Manual emergency stop
   - Resources released: Browser session, API connections
   - Partial work: Data collected up to step 7
9. He reviews logs to understand what went wrong
10. He creates incident report for development team

**Expected Behavior:**
- Emergency stop is always accessible
- Termination is immediate (< 5 seconds)
- Resources are properly released
- Partial work is preserved if possible
- Incident logging is automatic

**Success Criteria:**
- Termination completes quickly
- No zombie processes remain
- Partial work is accessible
- Logs capture the issue
- System is stable after termination

**Edge Cases:**
- Agent in middle of write operation (attempt clean rollback)
- Network issue prevents stop signal (local timeout)
- Multiple agents need termination (bulk stop)
- Agent already completing (race condition handling)
- Termination fails (escalated kill, logging)

**Test Data Requirements:**
- Runaway agent scenarios
- Various agent states for termination
- Resource cleanup verification

---

## UX-AA-009: Multi-Agent Coordination

**Title:** User coordinates multiple agents on related tasks

**User Persona:** Operations Lead (Yolanda) - Managing parallel research

**Preconditions:**
- Multiple agents are available
- Tasks are related but independent
- Coordination features are enabled

**User Journey:**
1. Yolanda needs to research 5 markets: US, UK, Germany, Japan, Australia
2. She creates a parent task: "Multi-market competitor analysis"
3. She assigns 5 sub-agents, one per market
4. She configures coordination:
   - Shared resources: Common company list
   - Conflict resolution: Latest update wins
   - Synchronization: After each company completed
5. She starts all agents simultaneously
6. She monitors from coordination dashboard:
   - Agent 1 (US): 45% complete
   - Agent 2 (UK): 60% complete
   - Agent 3 (Germany): 30% complete
   - etc.
7. She sees consolidated findings updating in real-time
8. Agent 3 encounters issue - she redistributes some work to Agent 2
9. All agents complete - results are merged
10. She reviews unified report

**Expected Behavior:**
- Agents run in parallel efficiently
- Coordination rules are followed
- Dashboard shows all agent statuses
- Work redistribution is smooth
- Results are properly merged

**Success Criteria:**
- Parallel execution reduces total time
- No duplicate work occurs
- Conflicts are resolved correctly
- Redistribution maintains continuity
- Merged results are complete and consistent

**Edge Cases:**
- Agent crashes (reassign work to others)
- Coordination deadlock (detect and break)
- Resource contention (queue with priority)
- Conflicting results (flag for human review)
- One agent much slower (don't block others)

**Test Data Requirements:**
- Parallelizable task sets
- Coordination scenarios
- Conflict situations

---

## UX-AA-010: Agent Memory and Context

**Title:** Agent uses memory for context across sessions

**User Persona:** Researcher (Zoe) - Continuing long-term project

**Preconditions:**
- Previous related tasks have been completed
- Memory feature is enabled
- Context is relevant to new task

**User Journey:**
1. Zoe returns to her ongoing research project
2. She starts new task: "Continue competitor analysis with latest Q4 data"
3. Agent responds: "I see previous research from October. Found: 12 competitors, 45 data points. Continuing from there."
4. She confirms: "Yes, update existing analysis"
5. Agent loads previous context and begins update
6. She checks memory panel: Shows what agent remembers
7. Agent references previous finding: "Company X previously ranked #3, now moved to #2"
8. She corrects a memory: "Actually, Company Y was acquired. Remove from list."
9. Agent updates memory and adjusts analysis
10. Final output builds on previous work seamlessly

**Expected Behavior:**
- Memory is automatically loaded for related tasks
- Agent clearly states what it remembers
- User can view and edit memory
- Corrections are incorporated
- Context improves response quality

**Success Criteria:**
- Relevant memory is retrieved accurately
- Memory usage is transparent to user
- Corrections persist for future use
- Context continuity is maintained
- Memory doesn't cause confusion

**Edge Cases:**
- Memory is outdated (verify before using)
- Contradictory memories (ask for clarification)
- Memory privacy boundaries (respect task ownership)
- Memory storage limit (prioritize recent/important)
- Memory corruption (detect and recover)

**Test Data Requirements:**
- Tasks with memory dependencies
- Memory correction scenarios
- Long-term context chains

---

# Feature 5: Email Integration

## UX-EM-001: Gmail OAuth Connection

**Title:** User connects Gmail account via OAuth

**User Persona:** Sales Rep (Aaron) - Setting up email integration

**Preconditions:**
- User has a Gmail account
- Gmail API is enabled in Bottleneck-Bots
- User is logged into Bottleneck-Bots

**User Journey:**
1. Aaron opens Settings > Integrations > Email
2. He clicks "Connect Gmail"
3. A Google OAuth popup appears
4. He selects his Gmail account: aaron@company.com
5. He reviews permissions: Read, Send, Modify (as compose drafts)
6. He clicks "Allow"
7. Popup closes and he sees: "Gmail connected successfully"
8. He sees account details: Email, sync status, last synced
9. He configures sync options: Inbox, Sent, specific labels
10. Initial sync begins: "Syncing last 30 days of email..."

**Expected Behavior:**
- OAuth flow is smooth and standard
- Permissions are clearly explained
- Connection is confirmed immediately
- Sync options are configurable
- Initial sync shows progress

**Success Criteria:**
- Connection completes within 30 seconds
- Token is stored securely
- Sync options are respected
- Initial sync completes without errors
- Email is accessible in application

**Edge Cases:**
- User denies permissions (clear error, option to retry)
- OAuth popup blocked (detection and instructions)
- Account already connected (update token, confirm)
- Corporate Google account with restrictions (helpful error)
- Token expires (auto-refresh or prompt re-auth)

**Test Data Requirements:**
- Test Gmail accounts
- Accounts with various restrictions
- Token expiration scenarios

---

## UX-EM-002: Outlook OAuth Connection

**Title:** User connects Outlook/Microsoft 365 account

**User Persona:** Enterprise User (Beth) - Connecting corporate email

**Preconditions:**
- User has Microsoft 365 account
- Organization allows OAuth apps
- User is logged into Bottleneck-Bots

**User Journey:**
1. Beth opens Settings > Integrations > Email
2. She clicks "Connect Outlook"
3. Microsoft login popup appears
4. She enters her work credentials
5. She completes MFA (authenticator app)
6. She reviews and accepts permissions
7. Admin consent may be required - she's informed if so
8. Connection is established
9. She configures folders to sync: Inbox, Sent Items, key folders
10. Sync begins with progress indicator

**Expected Behavior:**
- Microsoft OAuth flow is handled correctly
- MFA is supported
- Admin consent is explained if needed
- Folder selection matches Outlook structure
- Sync respects enterprise settings

**Success Criteria:**
- MFA completes without issues
- Connection persists after MFA
- Enterprise folders are visible
- Sync completes for selected folders
- Calendar/contacts are not inadvertently accessed

**Edge Cases:**
- Admin consent required (clear explanation, admin contact)
- MFA times out (retry option)
- Shared mailbox access (optional configuration)
- On-premises Exchange (may not be supported)
- Conditional access policy blocks (informative error)

**Test Data Requirements:**
- Microsoft 365 test accounts
- Accounts with MFA
- Enterprise policies

---

## UX-EM-003: AI Sentiment Analysis on Emails

**Title:** User uses AI to analyze email sentiment

**User Persona:** Customer Success Manager (Carol) - Prioritizing customer emails

**Preconditions:**
- Email account is connected and synced
- AI analysis feature is enabled
- Emails are available for analysis

**User Journey:**
1. Carol opens Email Dashboard
2. She clicks "Analyze Sentiment" button
3. She configures: Analyze inbox from last 7 days
4. Analysis begins: "Analyzing 156 emails..."
5. Progress bar shows completion
6. Results display in sorted list:
   - Urgent/Negative: 12 emails (red highlight)
   - Neutral: 98 emails
   - Positive: 46 emails
7. She expands "Urgent/Negative" category
8. She sees emails with sentiment scores and key phrases highlighted
9. She clicks an email to see full analysis:
   - Sentiment score: -0.8
   - Key concerns: "disappointed", "urgent", "cancel"
   - Recommended priority: High
10. She creates a task from the email analysis

**Expected Behavior:**
- Analysis covers selected timeframe
- Progress is visible and accurate
- Sentiment categories are clear
- Key phrases are highlighted
- Recommendations are actionable

**Success Criteria:**
- Analysis completes within 2 min for 200 emails
- Sentiment categorization is accurate (>85%)
- Key phrases capture important terms
- Sorting prioritizes correctly
- Integration with task creation works

**Edge Cases:**
- Very long email thread (analyze latest or full?)
- Non-English emails (detect and handle)
- Sarcasm/irony detection (known limitation, flag uncertainty)
- Empty or attachment-only emails (skip or note)
- Analysis fails mid-process (resume capability)

**Test Data Requirements:**
- Emails with various sentiments
- Long email threads
- Non-English emails

---

## UX-EM-004: Draft Response Generation

**Title:** User generates AI-powered email response

**User Persona:** Account Executive (Derek) - Responding to sales inquiries

**Preconditions:**
- Email account is connected
- User is viewing an email
- Draft generation is enabled

**User Journey:**
1. Derek opens a sales inquiry email
2. He clicks "Generate Response" button
3. A modal appears with options:
   - Tone: Professional (default), Friendly, Formal
   - Response type: Answer questions, Provide information, Schedule meeting
   - Additional context: [text field]
4. He selects "Friendly" tone and "Answer questions"
5. He adds context: "We have availability next week. Price is $500/month"
6. He clicks "Generate"
7. AI creates draft: Preview appears
8. He reviews and edits: Changes one sentence
9. He clicks "Save as Draft" or "Send Now"
10. Draft is saved to his email client's drafts folder

**Expected Behavior:**
- Options are clear and relevant
- Generation is fast (< 10 seconds)
- Draft matches selected tone
- Preview is editable
- Save/Send works correctly

**Success Criteria:**
- Generated response is relevant and professional
- Tone matches selection
- Context is incorporated
- Draft appears in email client
- User's edits are preserved

**Edge Cases:**
- Very long original email (summarize and respond)
- Multiple questions to answer (address all)
- Inappropriate/spam email (detect and warn)
- Generation fails (retry or explain)
- Email in different language (translate or match language)

**Test Data Requirements:**
- Various email types
- Different tone requirements
- Multi-question emails

---

## UX-EM-005: Email Scheduling

**Title:** User schedules email to send at future time

**User Persona:** Marketing Coordinator (Elena) - Timing campaign emails

**Preconditions:**
- Email account is connected with send permissions
- User has composed an email
- Scheduling feature is available

**User Journey:**
1. Elena composes an email in the draft editor
2. Instead of "Send", she clicks "Schedule Send"
3. A scheduling modal appears:
   - Suggested times: "Tomorrow 9 AM", "Monday 8 AM"
   - Custom date/time picker
   - Timezone selector (defaults to her TZ)
4. She selects "Monday 8 AM EST"
5. She sees preview: "Email will be sent Monday, Jan 13, 2026 at 8:00 AM EST"
6. She clicks "Schedule"
7. Confirmation: "Email scheduled successfully"
8. Email appears in "Scheduled" folder with countdown
9. She can view, edit, or cancel before send time
10. On Monday 8 AM, email sends automatically

**Expected Behavior:**
- Suggested times are intelligent (business hours)
- Timezone handling is accurate
- Preview is clear and correct
- Scheduled emails are manageable
- Sending occurs at exact time

**Success Criteria:**
- Email sends within 1 minute of scheduled time
- Timezone conversion is correct
- Edit/cancel works up until send time
- Notification on send (optional)
- Failed send is reported

**Edge Cases:**
- Scheduled time is in past (reject or send immediately)
- System downtime at send time (send when back online)
- Email becomes invalid (draft reference deleted)
- Recipient email bounces (handle as normal bounce)
- User cancels after sent (too late, inform user)

**Test Data Requirements:**
- Various scheduling scenarios
- Timezone edge cases
- System downtime simulation

---

## UX-EM-006: 2FA Code Extraction

**Title:** User extracts 2FA codes from emails for automation

**User Persona:** QA Tester (Frank) - Automating login tests

**Preconditions:**
- Email account is connected
- 2FA code extraction is enabled
- Email containing 2FA code has arrived

**User Journey:**
1. Frank's automation needs to log into a test site
2. Site sends 2FA code to registered email
3. Automation triggers 2FA code extraction
4. System scans recent emails for 2FA patterns
5. Email found: Subject "Your verification code"
6. System extracts code: "847291"
7. Code is returned to automation workflow
8. Workflow enters code and completes login
9. Used code email is optionally archived/deleted
10. Extraction is logged for audit

**Expected Behavior:**
- Scanning is fast (< 5 seconds)
- Pattern matching finds 2FA codes reliably
- Code is extracted accurately
- Return to automation is seamless
- Cleanup is configurable

**Success Criteria:**
- Code extraction accuracy > 99%
- Extraction completes within 10 seconds of email arrival
- Code is passed to automation correctly
- Audit trail is maintained
- No false positives

**Edge Cases:**
- Multiple 2FA emails (use most recent)
- Code expires before extraction (fail fast, trigger new code)
- Unusual code format (pattern library)
- Code in image/attachment (OCR if enabled)
- Email delayed (retry with timeout)

**Test Data Requirements:**
- 2FA emails from various services
- Different code formats
- Delayed email scenarios

---

## UX-EM-007: Email Filtering and Search

**Title:** User searches and filters emails with AI assistance

**User Persona:** Support Manager (Grace) - Finding specific customer emails

**Preconditions:**
- Emails are synced
- Search/filter features are available
- User knows what they're looking for

**User Journey:**
1. Grace opens Email Dashboard
2. She uses the search bar: "customer complaint about billing from last month"
3. AI interprets the query and searches
4. Results appear with relevance scores
5. She applies additional filters:
   - Date: Last 30 days
   - Sender contains: customer domain
   - Has attachment: No
6. Results narrow to 23 emails
7. She sorts by date (newest first)
8. She clicks on an email to preview
9. She bulk selects 5 relevant emails
10. She creates a support ticket from selected emails

**Expected Behavior:**
- Natural language search works
- Filters are combinable
- Results update in real-time
- Preview is fast
- Bulk actions are available

**Success Criteria:**
- Search results are relevant (>90% precision)
- Filters work correctly
- Results load within 3 seconds
- Preview renders properly
- Bulk actions complete successfully

**Edge Cases:**
- No results found (suggest alternatives)
- Very many results (pagination/optimization)
- Ambiguous query (ask for clarification)
- Deleted emails in results (exclude or mark)
- Search index out of date (trigger resync)

**Test Data Requirements:**
- Large email dataset
- Various search queries
- Filter combinations

---

## UX-EM-008: Email Thread Management

**Title:** User manages email conversation thread

**User Persona:** Account Manager (Henry) - Tracking customer conversation

**Preconditions:**
- Email thread exists with multiple messages
- Thread view is available
- User has thread management permissions

**User Journey:**
1. Henry opens an email that's part of a thread
2. System displays full thread (12 messages)
3. He sees thread timeline with sender indicators
4. He expands/collapses individual messages
5. He sees AI summary at top: "Discussion about contract renewal. Customer requested 10% discount. Last action: waiting for our response."
6. He clicks "Reply to Thread"
7. His reply maintains thread context
8. He uses "Add Note" to add internal-only comment
9. He assigns the thread to colleague for follow-up
10. Thread is tracked in their shared workspace

**Expected Behavior:**
- Thread reconstruction is complete
- Timeline is accurate
- AI summary captures key points
- Reply maintains threading
- Internal notes are separate

**Success Criteria:**
- All thread messages are included
- Order is correct (chronological or reverse)
- Summary is accurate and helpful
- Reply threads correctly in recipients' clients
- Notes are visible only to team

**Edge Cases:**
- Very long thread (summarize older, show recent)
- Thread split/merged (handle gracefully)
- External participant added mid-thread (show entry point)
- Reply vs. Reply-All handling (user choice)
- Thread with attachments (aggregate or per-message)

**Test Data Requirements:**
- Email threads of various lengths
- Threads with multiple participants
- Complex thread structures

---

## UX-EM-009: Email Template Management

**Title:** User creates and uses email templates

**User Persona:** Sales Rep (Ian) - Using consistent messaging

**Preconditions:**
- User has email access
- Template feature is enabled
- User wants to save time on repetitive emails

**User Journey:**
1. Ian opens Template Manager
2. He clicks "Create Template"
3. He enters:
   - Name: "Initial Outreach"
   - Category: Sales
   - Subject: "Introducing {Company} Solutions"
   - Body: "Hi {FirstName}, I noticed {CompanyName} is..."
4. He saves the template
5. Later, composing an email, he clicks "Insert Template"
6. He selects "Initial Outreach"
7. Template populates with placeholder markers
8. He fills in placeholders: {FirstName}=Sarah, {CompanyName}=Acme
9. Template variables are replaced
10. He sends the personalized email

**Expected Behavior:**
- Templates are organized by category
- Variables are clearly marked
- Insertion is quick
- Variables auto-complete if known
- Sent email looks natural

**Success Criteria:**
- Templates save correctly
- Variables are replaced accurately
- No placeholder text remains in sent email
- Templates are searchable
- Usage tracking available

**Edge Cases:**
- Variable not filled in (warn before send)
- HTML formatting in template (preserve correctly)
- Template with attachments (include or link)
- Duplicate template name (append number or reject)
- Template too long (warn about length)

**Test Data Requirements:**
- Various template formats
- Complex variable scenarios
- Attachment templates

---

## UX-EM-010: Email Analytics Dashboard

**Title:** User reviews email engagement analytics

**User Persona:** Sales Director (Julia) - Analyzing team email performance

**Preconditions:**
- Email tracking is enabled
- Emails have been sent with tracking
- Analytics have been processed

**User Journey:**
1. Julia opens Email Analytics dashboard
2. She sees overview metrics:
   - Emails sent (last 30 days): 1,247
   - Open rate: 34%
   - Response rate: 12%
   - Average response time: 4.2 hours
3. She filters by team member to compare
4. She sees individual performance:
   - Ian: 42% open rate, 18% response rate
   - Karen: 28% open rate, 8% response rate
5. She drills into Ian's best-performing emails
6. She identifies patterns: Certain subject lines work better
7. She views time-of-day analysis
8. She exports report for team meeting
9. She sets up weekly analytics email
10. She uses insights to coach team

**Expected Behavior:**
- Metrics are accurate and current
- Filtering is flexible
- Drill-down is available
- Patterns are surfaced
- Export is comprehensive

**Success Criteria:**
- Data accuracy (verified with samples)
- Real-time updates (< 1 hour delay)
- Export includes all requested data
- Scheduled reports work reliably
- Privacy is maintained (no recipient tracking abuse)

**Edge Cases:**
- Low email volume (insufficient data warning)
- Tracking blocked by recipient (note in data)
- Multiple opens by same person (dedupe option)
- Internal vs. external recipients (separate tracking)
- Data retention limits (historical data availability)

**Test Data Requirements:**
- Large volume of tracked emails
- Various engagement patterns
- Team comparison data

---

# Appendix: Test Data Summary

## Required Test Accounts
- Gmail test accounts (3-5)
- Microsoft 365 test accounts (2-3)
- GitHub test account
- Twitter/X test account
- Various SaaS tool accounts for automation testing

## Required Test Environments
- Browserbase session access
- Stagehand integration
- AI model API keys (Gemini, Claude, OpenAI)
- Webhook testing endpoints
- Email sending/receiving capability

## Sample Data Needed
- Email datasets with various sentiments
- Web pages with structured data
- Login credentials for test sites
- Sample workflows of varying complexity
- 2FA-enabled test accounts

---

*Document prepared for QA Validation. Last updated: 2026-01-11*
