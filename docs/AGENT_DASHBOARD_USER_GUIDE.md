# Agent Dashboard - User Guide

**Version**: 1.0
**Last Updated**: December 2025
**Difficulty**: Beginner to Intermediate

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Dashboard Overview](#dashboard-overview)
4. [Creating Your First Task](#creating-your-first-task)
5. [Using Task Templates](#using-task-templates)
6. [Monitoring Execution](#monitoring-execution)
7. [Understanding Agent Thinking](#understanding-agent-thinking)
8. [Live Browser Preview](#live-browser-preview)
9. [Execution History](#execution-history)
10. [Best Practices](#best-practices)
11. [Common Issues](#common-issues)

---

## Introduction

The Agent Dashboard is your command center for AI-powered automation. It provides a real-time interface to create, monitor, and manage intelligent agent tasks that can automate complex workflows across GoHighLevel and other platforms.

### What Can Agents Do?

- Automate GoHighLevel workflows, campaigns, and client management
- Fill out forms and submit data across multiple websites
- Extract information from web pages
- Create and modify marketing campaigns
- Manage client profiles and communications
- Execute multi-step business processes

### Key Features

- **Real-Time Monitoring**: Watch agents work with live updates
- **Browser Preview**: See exactly what the agent sees
- **Execution History**: Review past tasks and learn from patterns
- **Task Templates**: Quick-start common automation tasks
- **Intelligent Thinking**: Transparent AI decision-making process

---

## Getting Started

### Prerequisites

Before using the Agent Dashboard:

1. **Active Account**: You must be logged in with a valid subscription
2. **API Keys Configured**: Ensure required integrations are set up:
   - Browserbase API key (for browser automation)
   - AI model API key (OpenAI, Anthropic, or Gemini)
   - GoHighLevel credentials (if automating GHL)

3. **Subscription Limits**: Check your plan's execution limits:
   - Starter: 500 executions/month
   - Growth: 2,000 executions/month
   - Professional: 10,000 executions/month
   - Enterprise: Unlimited

### Accessing the Dashboard

1. Log in to Bottleneck Bots
2. Click **"Agent Dashboard"** in the main navigation
3. Or navigate directly to `/dashboard/agent`

---

## Dashboard Overview

The Agent Dashboard is divided into three main sections:

### Left Panel: Task Input & Current Execution

**Purpose**: Create new tasks and monitor active executions

**Components**:
- **Task Input Field**: Enter task descriptions in natural language
- **Current Execution Card**: Shows real-time progress of running tasks
- **Control Buttons**: Pause, resume, or cancel executions

### Center Panel: Agent Thinking & Execution Steps

**Purpose**: Understand how the agent is reasoning and acting

**Components**:
- **Thinking Viewer**: AI's step-by-step decision process
- **Action Log**: Detailed record of each action taken
- **Status Indicators**: Visual feedback on execution state

### Right Panel: Browser Preview & Templates

**Purpose**: Visual confirmation and quick task creation

**Components**:
- **Live Browser View**: Real-time screenshot of agent's browser
- **Task Templates**: Pre-configured common automation tasks
- **Template Gallery**: Browse and select from 20+ templates

### Top Stats Bar

**Quick Metrics** (Visible at top of dashboard):
- **Active Tasks**: Currently running executions
- **Total Executions**: Lifetime task count
- **Success Rate**: Percentage of completed vs. failed tasks
- **Avg Duration**: Mean execution time across all tasks

---

## Creating Your First Task

### Step 1: Enter Task Description

In the **Task Input** field, describe what you want the agent to do in clear, natural language.

**Examples of Good Task Descriptions**:

```
Create a new contact in GoHighLevel with name "John Smith"
and email "john@example.com"
```

```
Navigate to the GHL campaigns page and create a new email
campaign called "Welcome Series" with 3 emails
```

```
Extract all contact names and email addresses from the
contacts page and save them to a CSV file
```

**Tips for Writing Effective Tasks**:
- Be specific about the desired outcome
- Include all necessary details (names, emails, URLs)
- Break complex tasks into smaller steps if needed
- Mention if you need data saved or exported

### Step 2: Submit the Task

Click the **"Execute"** button or press `Enter` to start the task.

**What Happens Next**:
1. System validates your subscription has available executions
2. Agent begins **Planning** phase (usually 5-15 seconds)
3. Agent transitions to **Executing** phase
4. Real-time updates appear in the dashboard

### Step 3: Monitor Progress

Watch the **Current Execution Card** for:

| Status | Icon | Meaning | Typical Duration |
|--------|------|---------|------------------|
| **Planning** | Brain (animated) | AI is creating execution plan | 5-15 seconds |
| **Executing** | Loader (spinning) | Agent performing actions | 30s - 10 minutes |
| **Completed** | Green checkmark | Task finished successfully | N/A |
| **Failed** | Red X | Task encountered error | N/A |

### Step 4: Review Results

When execution completes:

1. **Success**: Green checkmark appears with completion message
2. **Output**: Any data extracted or files created will be shown
3. **Screenshots**: Browser screenshots captured during execution
4. **Logs**: Full execution log available for review

---

## Using Task Templates

Templates provide quick-start configurations for common automation tasks.

### Accessing Templates

1. Click the **"Templates"** tab in the right panel
2. Or click the **Sparkles icon** (⭐) next to the Task Input field

### Available Template Categories

**GoHighLevel Automation**:
- Create Contact
- Update Contact Details
- Create Email Campaign
- Set Up Workflow
- Create Funnel Page
- Schedule Appointment

**Data Extraction**:
- Extract Contact List
- Scrape Product Prices
- Monitor Competitor Website
- Extract Social Media Metrics

**Form Automation**:
- Submit Lead Form
- Fill Survey
- Complete Registration
- Submit Job Application

### Using a Template

**Step 1**: Browse templates and click on your desired template

**Step 2**: Template populates Task Input with pre-configured description

**Step 3**: Customize the template:
```
Template: "Create a contact in GoHighLevel with {{name}} and {{email}}"

Your Custom Task:
"Create a contact in GoHighLevel with Alice Johnson and alice@startup.com"
```

**Step 4**: Click **"Execute"** to run the task

### Creating Custom Templates

**For Advanced Users**:

1. Navigate to Settings → Task Templates
2. Click **"Create Template"**
3. Define template structure:
   - **Name**: Descriptive template name
   - **Description**: Task description with placeholders `{{variable}}`
   - **Category**: Organize by category
   - **Variables**: List of required fields
4. Save template for future use

---

## Monitoring Execution

### Real-Time Progress Tracking

The dashboard provides multiple indicators of execution progress:

#### Progress Bar

Located at the top of the Current Execution Card:
- Fills from left to right as task progresses
- Shows percentage completed (e.g., "Step 3/7 - 42%")
- Color-coded:
  - Blue: In progress
  - Green: Completed
  - Red: Failed

#### Status Badge

Displays current execution state with color and icon:
- **Planning** (Blue + Brain icon): AI generating strategy
- **Executing** (Amber + Loader): Agent performing actions
- **Completed** (Green + Check): Task finished successfully
- **Failed** (Red + X): Execution encountered error
- **Paused** (Purple + Pause): User-paused execution

#### Log Stream

Real-time log entries appear in chronological order:

```
[14:32:01] 🔵 INFO: Starting execution for task #1234
[14:32:03] 🔵 INFO: Opening browser session
[14:32:05] ✅ SUCCESS: Browser session created (session_abc123)
[14:32:07] 💻 SYSTEM: Navigating to app.gohighlevel.com
[14:32:12] ✅ SUCCESS: Page loaded successfully
[14:32:15] 🔵 INFO: Clicking "Contacts" navigation item
[14:32:17] ⚠️  WARNING: Element selector changed, using AI fallback
[14:32:20] ✅ SUCCESS: Navigated to contacts page
```

**Log Icons**:
- 🔵 **INFO**: General status updates
- ✅ **SUCCESS**: Successful operations
- ⚠️ **WARNING**: Non-critical issues (agent auto-recovered)
- ❌ **ERROR**: Critical failures
- 💻 **SYSTEM**: Internal operations

### Pausing and Resuming

**To Pause Execution**:
1. Click **"Pause"** button in Current Execution Card
2. Agent completes current action and pauses
3. State is saved - no progress lost

**When to Pause**:
- Review intermediate results before continuing
- Verify agent is on correct path
- Make manual adjustments before next step
- Temporarily free up execution slot

**To Resume**:
1. Click **"Resume"** button
2. Agent continues from exact pause point
3. No re-execution of completed steps

### Canceling Execution

**To Cancel**:
1. Click **"Terminate"** button
2. Confirmation dialog appears: "Are you sure?"
3. Click **"Terminate"** to confirm

**When to Cancel**:
- Agent is stuck or looping
- Task was configured incorrectly
- Unexpected behavior detected
- No longer need results

**After Cancellation**:
- Partial results available in logs
- Screenshots captured up to cancellation point
- Execution marked as "Cancelled" in history
- Browser session automatically closed

---

## Understanding Agent Thinking

The **Agent Thinking Viewer** provides transparency into the AI's decision-making process.

### Thinking Steps

Each thinking step shows:

**Step Number**: Sequential order (1, 2, 3...)

**Timestamp**: When the thought occurred

**Thought Content**: What the agent is considering

**Confidence Level**: AI's certainty (Low, Medium, High)

### Example Thinking Process

```
Step 1 - 14:30:05 [High Confidence]
"I need to create a contact in GoHighLevel. First, I'll navigate
to the Contacts section."

Step 2 - 14:30:12 [High Confidence]
"I'm on the Contacts page. I'll click the 'Add Contact' button
to open the contact creation form."

Step 3 - 14:30:18 [Medium Confidence]
"The form has opened. I need to fill in these fields:
- Full Name: John Smith
- Email: john@example.com
I'll start by clicking the name field."

Step 4 - 14:30:25 [High Confidence]
"Name field is focused. I'll type 'John Smith'."

Step 5 - 14:30:30 [Low Confidence]
"I see the email field below the name field. It looks like the
selector I expected, but the page layout seems slightly different.
I'll use AI vision to locate it accurately."
```

### Confidence Levels Explained

**High Confidence** (Green badge):
- Agent knows exactly what to do
- Clear path forward
- Expected page elements found
- Previous successful pattern recognized

**Medium Confidence** (Amber badge):
- Agent has a plan but uncertain about details
- Page layout slightly different than expected
- Multiple possible approaches
- May need to try alternative selectors

**Low Confidence** (Red badge):
- Agent uncertain about next step
- Unexpected page state
- Element not found with expected selector
- Will attempt AI vision fallback

**Why Confidence Matters**:
- **High**: Task progressing smoothly
- **Medium**: Watch for potential slowdowns
- **Low**: May need manual intervention or retry

### Reasoning Chains

For complex tasks, the agent builds **reasoning chains**:

```
Goal: Create a welcome email campaign
├─ Sub-goal 1: Navigate to Campaigns page
│  ├─ Action: Click "Marketing" menu
│  └─ Action: Click "Campaigns" submenu
├─ Sub-goal 2: Create new campaign
│  ├─ Action: Click "New Campaign" button
│  └─ Action: Select "Email Campaign" type
├─ Sub-goal 3: Configure campaign settings
│  ├─ Action: Enter campaign name
│  ├─ Action: Set sender information
│  └─ Action: Choose template
└─ Sub-goal 4: Save campaign
   └─ Action: Click "Save" button
```

This hierarchical view helps you understand:
- What the agent plans to do
- Why each step is necessary
- How steps relate to the overall goal

---

## Live Browser Preview

The **Live Browser View** shows exactly what the agent sees in real-time.

### Preview Features

**Screenshot Updates**:
- Auto-refreshes every 2-3 seconds during execution
- Shows current page state
- Highlights elements being interacted with (red outline)

**Action Indicators**:
- **Red Box**: Element about to be clicked
- **Blue Box**: Text field being filled
- **Green Box**: Successfully interacted element
- **Yellow Highlight**: Element located by AI vision

**Page Information**:
Displayed below the screenshot:
- **Current URL**: `https://app.gohighlevel.com/contacts`
- **Page Title**: "Contacts - GoHighLevel"
- **Browser Size**: 1920x1080

### Interaction Options

**Fullscreen Mode**:
1. Click **"Fullscreen"** button in top-right
2. Preview expands to fill screen
3. Press `Esc` to exit fullscreen

**Download Screenshot**:
1. Click **"Download"** icon
2. Current screenshot saves as PNG
3. Filename: `agent-screenshot-[timestamp].png`

**View Recording** (After Execution):
1. Click **"View Recording"** button
2. Full session video opens in modal
3. Playback controls: play, pause, skip, speed control (0.5x, 1x, 2x)

### When Preview is Unavailable

During the **Planning** phase:
- Preview shows "Planning..." placeholder
- No browser session active yet
- Agent is generating execution strategy

If browser session fails:
- Preview shows "Browser Unavailable" message
- Check logs for connection errors
- Verify Browserbase API key is configured

---

## Execution History

The **Execution History** panel provides access to all past task executions.

### Accessing History

**From Dashboard**:
1. Scroll down to **"Recent Executions"** section
2. Shows last 10 executions by default

**Full History View**:
1. Click **"View All Executions"** button
2. Or navigate to `/dashboard/terminal`
3. See paginated list of all executions

### History Table Columns

| Column | Description | Example |
|--------|-------------|---------|
| **ID** | Unique execution identifier | `exec_abc123` |
| **Task** | Task description (truncated) | "Create contact in GHL..." |
| **Status** | Final execution state | Completed, Failed, Cancelled |
| **Duration** | Total execution time | 1m 23s |
| **Started** | Timestamp of start | 2 hours ago |
| **Actions** | View details, replay, delete | Icons |

### Filtering and Sorting

**Status Filter**:
- All Executions
- Completed Only
- Failed Only
- Cancelled
- Currently Running

**Time Range**:
- Last 24 Hours
- Last 7 Days
- Last 30 Days
- Custom Date Range (date picker)

**Sort Options**:
- Newest First (default)
- Oldest First
- Longest Duration
- Shortest Duration
- Status (alphabetical)

**Search**:
- Type in search box to filter by task description
- Searches across all fields
- Real-time filtering as you type

### Viewing Execution Details

Click any execution to open detailed view:

**Header Information**:
- Execution ID and status badge
- Start and end timestamps
- Total duration (HH:MM:SS)
- User who initiated task

**Execution Timeline**:
Each step shows:
- Step number and timestamp
- Action description
- Success or failure indicator
- Duration of that step
- Output or error message

**Screenshots Gallery**:
- Thumbnail grid of all captured screenshots
- Click to enlarge
- Download individual or all screenshots
- Annotations show what was clicked/typed

**Browser Recording**:
- Full session video (if available)
- Click "Play Recording" to watch
- Video player with controls
- Jump to specific timestamps

**Logs**:
- Complete log stream
- Filter by log level (Info, Success, Warning, Error)
- Search within logs
- Download logs as .txt file

### Rerunning Failed Executions

If an execution failed:

1. Click the failed execution in history
2. Review error details:
   - Error message
   - Failing step highlighted
   - Suggested fixes
3. Click **"Retry"** button
4. Modify task description if needed
5. Click **"Execute"** to rerun

**Modifications for Retry**:
Common fixes for failures:
- Add more context to task description
- Specify element selectors explicitly
- Break into smaller sub-tasks
- Update credentials if authentication failed

---

## Best Practices

### Writing Effective Task Descriptions

**Be Specific**:
```
❌ Bad: "Update the contact"
✅ Good: "Update contact John Smith's phone number to (555) 123-4567"
```

**Include All Details**:
```
❌ Bad: "Create a campaign"
✅ Good: "Create an email campaign named 'Summer Sale 2025'
         with subject line 'Save 30% This Week'"
```

**Use Natural Language**:
```
❌ Bad: "click.contacts.button.add.then.type.name.field.john"
✅ Good: "Navigate to Contacts, click Add Contact,
         and enter 'John Smith' as the name"
```

**Break Down Complex Tasks**:
Instead of:
```
"Set up a complete funnel with 5 pages, email sequence,
SMS follow-ups, and webhook integrations"
```

Break into:
```
Task 1: "Create funnel named 'Lead Magnet Funnel' with
         landing page"
Task 2: "Add thank you page to Lead Magnet Funnel"
Task 3: "Create 5-email welcome sequence for funnel"
...
```

### Optimizing Execution Time

**Pre-configure Credentials**:
- Store GHL API keys in settings
- Connect OAuth integrations beforehand
- Reduces authentication time during execution

**Use Specific Selectors** (Advanced):
```
Instead of: "Find the submit button and click it"
Better: "Click the button with data-testid='submit-form'"
```

**Batch Similar Tasks**:
Create multiple contacts in one task:
```
"Create 3 contacts:
1. Name: Alice, Email: alice@example.com
2. Name: Bob, Email: bob@example.com
3. Name: Charlie, Email: charlie@example.com"
```

### Monitoring and Troubleshooting

**Watch the First Few Steps**:
- Verify agent is on correct path
- Catch navigation errors early
- Pause and adjust if needed

**Check Confidence Levels**:
- Multiple low-confidence steps = potential issue
- Consider pausing and reviewing

**Review Logs Regularly**:
- Warnings may indicate future failures
- System messages show what agent is trying
- Error messages provide specific fix guidance

**Save Successful Patterns**:
- After successful execution, rate it highly (thumbs up)
- Agent learns from successful patterns
- Similar future tasks complete faster

### Managing Subscription Limits

**Track Usage**:
- Monitor execution count in dashboard
- Set up limit warnings (Settings → Notifications)
- Plan high-volume tasks early in billing cycle

**Optimize Task Design**:
- Combine related tasks when possible
- Use templates to reduce planning time
- Delete or archive old executions to reduce clutter

**Purchase Execution Packs**:
- If nearing limit, buy one-time execution packs
- Cheaper than upgrading subscription
- Available in 500, 1000, 2500, or 10,000 packs

---

## Common Issues

### Issue: "Task Stuck in Planning Phase"

**Symptoms**:
- Status shows "Planning" for > 2 minutes
- No progress updates
- Log shows no new entries

**Causes**:
- AI model API rate limit exceeded
- Invalid or expired API key
- Network connectivity issue

**Solutions**:
1. **Check API Key**:
   - Settings → API Keys → OpenAI/Anthropic → "Test"
   - Update key if invalid
2. **Wait for Rate Limit Reset**:
   - Wait 60 seconds
   - Or upgrade AI provider account
3. **Terminate and Retry**:
   - Click "Terminate"
   - Wait 30 seconds
   - Retry with same task description

### Issue: "Agent Can't Find Element"

**Symptoms**:
```
Error: Could not find element matching selector: button.submit
```

**Causes**:
- Element selector changed (site update)
- Dynamic content not loaded yet
- Element inside iframe

**Solutions**:
1. **Use Natural Language**:
   ```
   Instead of: "Click button.submit"
   Try: "Click the submit button at the bottom of the form"
   ```
2. **Enable Self-Healing** (automatic in most cases):
   - Agent automatically adapts to page changes
3. **Wait for Page Load**:
   - Add "Wait for page to fully load" to task description
4. **Specify Element Details**:
   ```
   "Click the blue 'Submit' button with text 'Save Changes'"
   ```

### Issue: "Browser Session Timeout"

**Symptoms**:
```
Error: Session session_abc123 not found or has expired
```

**Causes**:
- Task exceeded 60-minute session limit
- Session manually closed
- Browserbase infrastructure issue

**Solutions**:
1. **Break Into Smaller Tasks**:
   - Split long tasks into sub-tasks
   - Each runs in separate session
2. **Retry Task**:
   - Sessions can't be recovered once expired
   - Create new execution with same task
3. **Upgrade Plan**:
   - Higher plans have longer session durations

### Issue: "Execution Failed: Permission Denied"

**Symptoms**:
```
Error: Permission denied: Cannot access GoHighLevel data
```

**Causes**:
- GHL credentials not configured
- OAuth token expired
- Insufficient GHL permissions

**Solutions**:
1. **Check GHL Integration**:
   - Settings → OAuth Integrations → GoHighLevel
   - Reconnect if showing "Disconnected"
2. **Verify Permissions**:
   - Log into GoHighLevel
   - Check account has necessary permissions
   - Contact GHL admin if restricted
3. **Refresh Credentials**:
   - Settings → API Keys → GoHighLevel
   - Update API key if changed

### Issue: "High Failure Rate"

**Symptoms**:
- Multiple executions failing
- Success rate < 70%

**Causes**:
- Vague task descriptions
- Site structure changes
- Insufficient training data

**Solutions**:
1. **Improve Task Descriptions**:
   - Add more context and detail
   - Use examples from successful executions
2. **Provide Feedback**:
   - Rate failed executions with thumbs down
   - Describe what went wrong in feedback form
   - Agent learns from feedback
3. **Retrain Agent**:
   - Settings → Agent Training → "Retrain"
   - Focus on specific task category
4. **Use Templates**:
   - Pre-tested templates have higher success rates

---

## Next Steps

Now that you understand the Agent Dashboard:

1. **Try a Simple Task**:
   - Use a template to create your first automation
   - Monitor execution and review results

2. **Explore Advanced Features**:
   - Read the [GHL Automation Tutorials](/root/github-repos/active/ghl-agency-ai/docs/GHL_AUTOMATION_TUTORIALS.md)
   - Learn about Swarm Coordination for complex tasks

3. **Optimize Performance**:
   - Review execution history for patterns
   - Provide feedback to improve agent learning
   - Create custom templates for frequent tasks

4. **Get Help**:
   - Troubleshooting: [TROUBLESHOOTING.md](/root/github-repos/active/ghl-agency-ai/docs/TROUBLESHOOTING.md)
   - Full User Guide: [USER_GUIDE.md](/root/github-repos/active/ghl-agency-ai/docs/USER_GUIDE.md)
   - Support: Settings → Support → Create Ticket

---

## Additional Resources

- **Video Tutorials**: Dashboard walkthrough and examples
- **API Documentation**: For advanced programmatic access
- **Community Forum**: Share use cases and get help
- **Weekly Tips**: Subscribe to newsletter for best practices

---

**Happy Automating!**

For support: support@bottleneckbots.com
Documentation: https://docs.bottleneckbots.com
