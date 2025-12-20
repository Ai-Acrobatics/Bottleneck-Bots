# GoHighLevel Automation Tutorials

**Version**: 1.0
**Last Updated**: December 2025
**Difficulty**: Beginner to Advanced

---

## Table of Contents

1. [Introduction](#introduction)
2. [Tutorial 1: Creating Your First Contact](#tutorial-1-creating-your-first-contact)
3. [Tutorial 2: Building an Email Campaign](#tutorial-2-building-an-email-campaign)
4. [Tutorial 3: Setting Up Automated Workflows](#tutorial-3-setting-up-automated-workflows)
5. [Tutorial 4: Creating Funnel Pages](#tutorial-4-creating-funnel-pages)
6. [Tutorial 5: Managing Appointments and Calendar](#tutorial-5-managing-appointments-and-calendar)
7. [Tutorial 6: Bulk Contact Import](#tutorial-6-bulk-contact-import)
8. [Tutorial 7: SMS Campaign Automation](#tutorial-7-sms-campaign-automation)
9. [Tutorial 8: Custom Field Management](#tutorial-8-custom-field-management)
10. [Tutorial 9: Integration with Webhooks](#tutorial-9-integration-with-webhooks)
11. [Tutorial 10: Advanced Multi-Step Automation](#tutorial-10-advanced-multi-step-automation)
12. [Best Practices](#best-practices)
13. [Troubleshooting](#troubleshooting)

---

## Introduction

This tutorial series teaches you how to automate GoHighLevel (GHL) operations using Bottleneck Bots' AI-powered agents. Each tutorial is designed to be completed in 10-30 minutes and builds on concepts from previous tutorials.

### Prerequisites

Before starting these tutorials:

1. **Active Bottleneck Bots subscription** (any tier)
2. **GoHighLevel account** with appropriate permissions
3. **GHL integration configured**:
   - Navigate to Settings → OAuth Integrations
   - Click "Connect" on GoHighLevel
   - Approve all requested permissions
4. **Basic familiarity** with the Agent Dashboard (see [Agent Dashboard User Guide](/root/github-repos/active/ghl-agency-ai/docs/AGENT_DASHBOARD_USER_GUIDE.md))

### What You'll Learn

By completing these tutorials, you'll be able to:
- Automate contact management and data entry
- Create and deploy marketing campaigns
- Build automated workflows and funnels
- Manage calendars and appointments
- Integrate GHL with external systems
- Handle complex multi-step business processes

### Tutorial Format

Each tutorial follows this structure:
- **Objective**: What you'll accomplish
- **Time Estimate**: Expected completion time
- **Difficulty**: Beginner, Intermediate, or Advanced
- **Step-by-Step Instructions**: Detailed walkthrough
- **Task Template**: Copy-paste task description
- **Expected Output**: What success looks like
- **Common Issues**: Troubleshooting tips
- **Next Steps**: How to build on this tutorial

---

## Tutorial 1: Creating Your First Contact

**Objective**: Automate the creation of a contact in GoHighLevel

**Time Estimate**: 5-10 minutes

**Difficulty**: Beginner

**What You'll Learn**:
- How to navigate GHL's Contacts section
- Fill contact forms with agent automation
- Verify successful contact creation

### Prerequisites

- GHL account with access to Contacts
- At least 1 available execution in your subscription

### Step-by-Step Instructions

#### Step 1: Access the Agent Dashboard

1. Log in to Bottleneck Bots
2. Navigate to **Agent Dashboard**
3. Ensure you're on the "New Task" tab

#### Step 2: Enter the Task

Copy and paste this task description into the Task Input field:

```
Navigate to GoHighLevel Contacts and create a new contact with the following details:
- First Name: Sarah
- Last Name: Johnson
- Email: sarah.johnson@example.com
- Phone: (555) 123-4567
- Tags: "Tutorial", "New Lead"
- Source: Website
```

#### Step 3: Execute the Task

1. Click the **"Execute"** button
2. Watch the status change from "Planning" to "Executing"
3. Monitor the Agent Thinking panel for decision steps

#### Step 4: Monitor Execution

You'll see the agent:

1. **Navigate to GHL**: Opens app.gohighlevel.com
2. **Find Contacts**: Locates and clicks Contacts menu
3. **Open Form**: Clicks "Add Contact" button
4. **Fill Details**: Enters each field:
   - First Name field → Types "Sarah"
   - Last Name field → Types "Johnson"
   - Email field → Types "sarah.johnson@example.com"
   - Phone field → Types "(555) 123-4567"
5. **Add Tags**: Clicks tag selector, adds "Tutorial" and "New Lead"
6. **Select Source**: Chooses "Website" from source dropdown
7. **Save Contact**: Clicks "Save" button

**Expected Duration**: 1-2 minutes

#### Step 5: Verify Success

When execution completes:

1. **Check Status**: Should show "Completed" with green checkmark
2. **Review Logs**: Look for confirmation message:
   ```
   ✅ SUCCESS: Contact created successfully (ID: con_abc123)
   ```
3. **View Screenshot**: Browser preview shows confirmation message
4. **Manual Verification** (Optional):
   - Log into GHL manually
   - Navigate to Contacts
   - Search for "Sarah Johnson"
   - Verify all details match

### Expected Output

**Success Indicators**:
- Status: Completed
- Duration: ~1-2 minutes
- Log message: "Contact created successfully"
- Screenshot shows GHL contact detail page

**Execution Log Example**:
```
[14:30:01] 🔵 Starting execution for contact creation
[14:30:03] ✅ Browser session created
[14:30:05] 💻 Navigating to app.gohighlevel.com
[14:30:10] ✅ Logged into GoHighLevel
[14:30:12] 🔵 Clicking Contacts menu
[14:30:15] ✅ Contacts page loaded
[14:30:17] 🔵 Clicking Add Contact button
[14:30:20] ✅ Contact form opened
[14:30:22] 🔵 Filling First Name: Sarah
[14:30:24] 🔵 Filling Last Name: Johnson
[14:30:26] 🔵 Filling Email: sarah.johnson@example.com
[14:30:28] 🔵 Filling Phone: (555) 123-4567
[14:30:32] 🔵 Adding tags: Tutorial, New Lead
[14:30:35] 🔵 Selecting source: Website
[14:30:37] 🔵 Clicking Save button
[14:30:40] ✅ Contact created successfully (ID: con_abc123)
```

### Common Issues

**Issue: "Could not find Contacts menu"**
- **Cause**: GHL UI layout changed or slow to load
- **Solution**: Add "Wait for page to fully load" to task description

**Issue: "Email already exists"**
- **Cause**: Contact with that email already in GHL
- **Solution**: Use a different email address or add timestamp:
  ```
  Email: sarah.johnson+test1@example.com
  ```

**Issue: "Tag not found"**
- **Cause**: Tag doesn't exist in your GHL account
- **Solution**: Create tag manually first or remove tags from task

### Next Steps

**Build on This Tutorial**:
1. Try creating multiple contacts in one task (Tutorial 6)
2. Add custom fields to contacts (Tutorial 8)
3. Automate contact assignment to workflows (Tutorial 3)

**Customize the Task**:
- Replace details with real lead information
- Add more fields (Address, Birthday, etc.)
- Include custom field values

---

## Tutorial 2: Building an Email Campaign

**Objective**: Create a multi-email campaign in GoHighLevel

**Time Estimate**: 15-20 minutes

**Difficulty**: Intermediate

**What You'll Learn**:
- Navigate GHL's Marketing section
- Create email campaigns with multiple messages
- Configure campaign settings and triggers

### Prerequisites

- Completed Tutorial 1 (basic navigation)
- GHL account with Marketing access
- Email templates configured in GHL (optional)

### Step-by-Step Instructions

#### Step 1: Prepare Campaign Details

Before starting, decide on:
- Campaign name: "Welcome Series"
- Number of emails: 3
- Email subjects and content
- Sending schedule

#### Step 2: Enter the Task

```
Navigate to GoHighLevel Marketing and create a new email campaign with these specifications:

Campaign Name: Welcome Series
Campaign Type: Nurture Campaign
Trigger: Tag added - "New Lead"

Email 1:
- Subject: Welcome to [Your Company]!
- Send: Immediately when tag is added
- Content: Use template "Welcome Email V2" or create simple welcome message

Email 2:
- Subject: Here's What You Can Expect
- Send: 2 days after Email 1
- Content: Describe your services and benefits

Email 3:
- Subject: Let's Get Started - Book Your Free Consultation
- Send: 5 days after Email 2
- Content: Include calendar booking link and CTA

After creating all emails, activate the campaign.
```

#### Step 3: Execute and Monitor

1. Click **"Execute"**
2. This task will take longer (5-10 minutes)
3. Watch for each email creation step
4. Verify campaign activation at the end

#### Step 4: Execution Breakdown

The agent will:

1. **Navigate to Marketing** (~15 seconds)
   - Clicks Marketing menu
   - Selects Campaigns submenu

2. **Create Campaign** (~30 seconds)
   - Clicks "New Campaign" button
   - Selects "Email Campaign" type
   - Enters campaign name "Welcome Series"
   - Sets trigger to "Tag added: New Lead"

3. **Create Email 1** (~2 minutes)
   - Clicks "Add Email" button
   - Enters subject line
   - Selects template or enters content
   - Sets timing: "Immediately"
   - Saves email

4. **Create Email 2** (~2 minutes)
   - Clicks "Add Email" button
   - Enters subject line
   - Enters or selects content
   - Sets timing: "2 days after previous"
   - Saves email

5. **Create Email 3** (~2 minutes)
   - Clicks "Add Email" button
   - Enters subject line
   - Enters or selects content
   - Sets timing: "5 days after previous"
   - Saves email

6. **Activate Campaign** (~15 seconds)
   - Clicks "Activate" button
   - Confirms activation

**Total Expected Duration**: 7-10 minutes

### Expected Output

**Success Indicators**:
- Campaign created and visible in Marketing → Campaigns
- All 3 emails configured with correct timing
- Campaign status: "Active"
- Trigger configured correctly

**Verification Steps**:
1. Log into GHL manually
2. Navigate to Marketing → Campaigns
3. Find "Welcome Series"
4. Click to view details
5. Verify all emails present with correct:
   - Subject lines
   - Content
   - Timing/delays
   - Trigger condition

### Advanced Customization

**Add Conditional Logic**:
```
Modify Email 3 to only send if Email 2 was opened:
- Add condition: "Email 2 open rate > 0"
- Alternative path: Send reminder email after 7 days if not opened
```

**Personalization**:
```
Include these merge fields in email content:
- {{contact.first_name}} in greeting
- {{contact.company_name}} in body
- {{user.calendar_link}} for booking CTA
```

**A/B Testing**:
```
Create two versions of Email 1:
- Version A: Subject "Welcome to [Company]!"
- Version B: Subject "You're In! Here's What's Next"
Split traffic 50/50 and track open rates
```

### Common Issues

**Issue: "Template not found"**
- **Solution**: Create email templates in GHL first, or use plain text content

**Issue: "Campaign won't activate"**
- **Cause**: Missing required fields (from address, reply-to)
- **Solution**: Add to task description:
  ```
  Set From Name: "Your Company"
  Set From Email: noreply@yourcompany.com
  Set Reply-To: support@yourcompany.com
  ```

**Issue: "Timing not set correctly"**
- **Cause**: GHL's delay interface can be complex
- **Solution**: Be explicit in task:
  ```
  Email 2 timing: Wait 2 days, then send at 10:00 AM local time
  ```

### Next Steps

1. Create SMS campaigns (Tutorial 7)
2. Build workflow automation around campaigns (Tutorial 3)
3. Track campaign performance with custom reports
4. Set up webhook notifications for campaign events (Tutorial 9)

---

## Tutorial 3: Setting Up Automated Workflows

**Objective**: Create a lead nurture workflow with multiple automation steps

**Time Estimate**: 20-30 minutes

**Difficulty**: Intermediate to Advanced

**What You'll Learn**:
- Create workflows in GHL
- Add triggers and actions
- Configure conditional logic
- Test workflow execution

### Prerequisites

- Completed Tutorials 1 and 2
- GHL account with Workflows access
- Understanding of if/then logic

### Workflow Overview

We'll create a "New Lead Nurture" workflow that:
1. Triggers when a new contact is tagged "New Lead"
2. Adds contact to "Welcome Series" email campaign
3. Waits 7 days
4. Checks if contact opened any emails
5. If yes: Tag as "Engaged" and notify sales team
6. If no: Send SMS reminder

### Step-by-Step Instructions

#### Step 1: Enter the Task

```
Navigate to GoHighLevel Workflows and create a new workflow:

Workflow Name: New Lead Nurture
Trigger: Contact tagged with "New Lead"

Actions:
1. Add contact to campaign "Welcome Series"
2. Wait 7 days
3. IF Email open rate > 0 THEN:
   a. Add tag "Engaged Lead"
   b. Create task for sales team: "Contact engaged lead [contact name]"
   c. Send internal notification to sales@company.com
4. ELSE (if no emails opened):
   a. Send SMS: "Hi {{contact.first_name}}, just checking in! Did you get my emails? Reply with any questions."
   b. Wait 2 days
   c. If still no engagement, add tag "Cold Lead"

Save and activate the workflow.
```

#### Step 2: Monitor Execution

This is a complex task that will take 10-15 minutes:

**Phase 1: Workflow Creation** (2 min)
- Navigate to Workflows
- Create new workflow
- Set name and trigger

**Phase 2: Add Actions** (8 min)
- Add campaign enrollment action
- Add wait step (7 days)
- Add conditional branch
- Configure "Engaged" path
- Configure "Not Engaged" path

**Phase 3: Testing & Activation** (2 min)
- Test workflow with sample contact
- Activate workflow

#### Step 3: Detailed Execution Flow

Watch the agent:

1. **Open Workflows**:
   ```
   💻 Navigating to Workflows section
   ✅ Workflows page loaded
   ```

2. **Create Workflow**:
   ```
   🔵 Clicking "New Workflow" button
   🔵 Entering workflow name: New Lead Nurture
   🔵 Setting trigger: Tag added "New Lead"
   ✅ Trigger configured
   ```

3. **Add First Action**:
   ```
   🔵 Clicking "Add Action" button
   🔵 Selecting "Add to Campaign"
   🔵 Choosing campaign: Welcome Series
   ✅ Action added
   ```

4. **Add Wait Step**:
   ```
   🔵 Adding "Wait" action
   🔵 Setting duration: 7 days
   ✅ Wait step configured
   ```

5. **Add Conditional**:
   ```
   🔵 Adding "IF/ELSE" branch
   🔵 Condition: Email opened > 0
   ✅ Conditional created
   ```

6. **Configure "Yes" Path**:
   ```
   🔵 In "Yes" branch, adding tag: Engaged Lead
   🔵 Adding "Create Task" action for sales team
   🔵 Adding "Send Email" notification
   ✅ Engaged path complete
   ```

7. **Configure "No" Path**:
   ```
   🔵 In "No" branch, adding SMS action
   🔵 Entering SMS content
   🔵 Adding wait: 2 days
   🔵 Adding tag: Cold Lead
   ✅ Not engaged path complete
   ```

8. **Activate**:
   ```
   🔵 Clicking "Save" button
   🔵 Clicking "Activate" button
   ✅ Workflow activated successfully
   ```

### Expected Output

**Workflow Structure**:
```
Trigger: Tag "New Lead" added
│
├─ Action 1: Add to "Welcome Series" campaign
│
├─ Action 2: Wait 7 days
│
├─ Conditional: Email opened?
   │
   ├─ YES Path:
   │  ├─ Add tag "Engaged Lead"
   │  ├─ Create task for sales
   │  └─ Notify sales team
   │
   └─ NO Path:
      ├─ Send SMS reminder
      ├─ Wait 2 days
      └─ Add tag "Cold Lead"

Status: Active
```

### Testing the Workflow

#### Manual Test

1. Create a test contact manually
2. Add "New Lead" tag
3. Watch Workflows → Active Workflows
4. Verify contact enters workflow

#### Automated Test

```
Create a test task for the agent:

"Test the New Lead Nurture workflow:
1. Create a test contact named 'Test User' with email test@example.com
2. Add tag 'New Lead' to trigger workflow
3. Navigate to Workflows → Active Workflows
4. Verify test contact appears in workflow
5. Screenshot the workflow execution status"
```

### Advanced Variations

**Add Lead Scoring**:
```
After the conditional branch, add:
- If engaged: Add 10 points to lead score
- If not engaged: Subtract 5 points
- If score > 50: Assign to high-priority sales rep
```

**Multi-Channel Engagement**:
```
In the "No" path, try multiple channels:
1. Send SMS (day 7)
2. If no response, send WhatsApp (day 9)
3. If no response, send LinkedIn message (day 11)
4. Final email (day 14)
```

**Trigger Variations**:
```
Create variations of this workflow for different triggers:
- Trigger: Form submission on website
- Trigger: Contact created via API
- Trigger: Contact replied to SMS
```

### Common Issues

**Issue: "Workflow won't save"**
- **Cause**: Missing required configuration
- **Solution**: Ensure all actions have required fields filled
- **Agent should**: Auto-detect missing fields and fill with defaults

**Issue: "Conditional not working"**
- **Cause**: Incorrect condition syntax
- **Solution**: Use GHL's condition builder, not free-text
- **Task update**: "Use the visual condition builder to check if email open count is greater than 0"

**Issue: "Test contact not entering workflow"**
- **Cause**: Workflow not activated or trigger misconfigured
- **Solution**: Verify workflow status is "Active" and trigger matches exactly

### Next Steps

1. Create appointment booking workflow (Tutorial 5)
2. Build webhook-triggered workflows (Tutorial 9)
3. Combine workflows with funnels (Tutorial 4)
4. Set up workflow analytics and optimization

---

## Tutorial 4: Creating Funnel Pages

**Objective**: Build a simple lead capture funnel with landing page and thank you page

**Time Estimate**: 25-35 minutes

**Difficulty**: Advanced

**What You'll Learn**:
- Create funnels in GHL
- Design landing pages
- Configure forms and submissions
- Set up redirect flows

### Prerequisites

- Completed Tutorial 3 (workflows)
- Understanding of landing page concepts
- GHL account with Funnels access

### Funnel Overview

We'll create a "Lead Magnet Funnel" with:
1. **Landing Page**: Offer free guide download
2. **Form**: Capture name and email
3. **Thank You Page**: Deliver download link
4. **Workflow Integration**: Add to nurture sequence

### Step-by-Step Instructions

#### Step 1: Enter the Task

```
Navigate to GoHighLevel Funnels and create a new funnel:

Funnel Name: Lead Magnet - Free Marketing Guide
Funnel Type: Lead Capture

Page 1 - Landing Page:
- Template: Use "Simple Lead Capture" template or create blank
- Headline: "Download Your Free Marketing Guide"
- Subheadline: "Learn 10 proven strategies to grow your business"
- Form Fields:
  * First Name (required)
  * Email (required)
  * Phone (optional)
- CTA Button: "Get My Free Guide"
- Button Color: #4CAF50 (green)
- Background: White with hero image

Page 2 - Thank You Page:
- Headline: "Check Your Email!"
- Message: "Your free guide is on its way to [email]. Check your inbox in the next few minutes."
- Additional CTA: "Schedule a Free Consultation" linking to calendar

Funnel Settings:
- Domain: Use GHL subdomain or custom domain if configured
- Tracking: Enable Facebook Pixel and Google Analytics
- Form Submission Action:
  * Add contact to CRM
  * Tag with "Lead Magnet - Marketing Guide"
  * Add to "Welcome Series" campaign
  * Send email with download link
  * Redirect to Thank You page

Save and publish the funnel.
```

#### Step 2: Execution Phases

This complex task takes 15-25 minutes:

**Phase 1: Funnel Setup** (3 min)
**Phase 2: Landing Page Design** (8 min)
**Phase 3: Thank You Page** (4 min)
**Phase 4: Integration & Publishing** (5 min)

#### Step 3: Detailed Execution Steps

**Phase 1: Funnel Setup**

```
🔵 Navigating to Funnels section
✅ Funnels page loaded
🔵 Clicking "New Funnel" button
🔵 Selecting "Lead Capture" funnel type
🔵 Entering funnel name: Lead Magnet - Free Marketing Guide
✅ Funnel created
```

**Phase 2: Landing Page Design**

```
🔵 Adding new page to funnel
🔵 Selecting "Simple Lead Capture" template
✅ Template loaded in editor
🔵 Editing headline element
🔵 Changing text to: "Download Your Free Marketing Guide"
✅ Headline updated
🔵 Editing subheadline
🔵 Changing text to: "Learn 10 proven strategies..."
✅ Subheadline updated
🔵 Locating form element
🔵 Configuring form fields:
   - First Name field added
   - Email field added
   - Phone field added (optional)
✅ Form configured
🔵 Editing CTA button
🔵 Changing button text: "Get My Free Guide"
🔵 Changing button color: #4CAF50
✅ Button styled
🔵 Saving landing page
✅ Landing page complete
```

**Phase 3: Thank You Page**

```
🔵 Adding second page to funnel
🔵 Selecting blank template
🔵 Adding headline: "Check Your Email!"
🔵 Adding body text with email merge field
🔵 Adding secondary CTA button
🔵 Linking button to calendar URL
✅ Thank you page complete
```

**Phase 4: Integration & Publishing**

```
🔵 Opening funnel settings
🔵 Configuring domain settings
🔵 Enabling tracking pixels
🔵 Configuring form submission actions:
   - Add contact to CRM
   - Apply tag
   - Add to campaign
   - Send email
   - Redirect to thank you page
✅ Integrations configured
🔵 Clicking "Publish" button
✅ Funnel published successfully
🔵 Copying funnel URL
```

### Expected Output

**Funnel Structure**:
```
Funnel: Lead Magnet - Free Marketing Guide
│
├─ Page 1: Landing Page (index.html)
│  │
│  ├─ Headline: Download Your Free Marketing Guide
│  ├─ Subheadline: Learn 10 proven strategies...
│  ├─ Form:
│  │  ├─ First Name (required)
│  │  ├─ Email (required)
│  │  └─ Phone (optional)
│  └─ CTA: "Get My Free Guide" (green button)
│
└─ Page 2: Thank You Page (thank-you.html)
   │
   ├─ Headline: Check Your Email!
   ├─ Message: Your guide is on its way...
   └─ CTA: "Schedule a Free Consultation"

Status: Published
URL: https://your-domain.ghlpages.com/lead-magnet
```

### Testing the Funnel

#### Manual Test

1. **Visit Funnel URL**:
   ```
   Open: https://your-domain.ghlpages.com/lead-magnet
   ```

2. **Fill Form**:
   - Enter test name: "Test User"
   - Enter test email: "test@example.com"
   - Click "Get My Free Guide"

3. **Verify Redirect**:
   - Should land on thank you page
   - Email should display in message

4. **Check CRM**:
   - Contact "Test User" created
   - Tagged "Lead Magnet - Marketing Guide"
   - Added to "Welcome Series" campaign

#### Automated Test

```
Create agent task to test funnel:

"Test the Lead Magnet funnel:
1. Navigate to the published funnel URL
2. Fill out the form with:
   - First Name: Agent Test
   - Email: agent.test@example.com
   - Phone: (555) 999-8888
3. Submit the form
4. Verify redirect to thank you page
5. Navigate to GHL Contacts
6. Search for 'Agent Test'
7. Verify contact was created with correct tags
8. Take screenshots of each step"
```

### Advanced Customizations

**Multi-Step Form**:
```
Instead of single page, create multi-step:

Page 1: Headline + Email only
Page 2: Name + Phone
Page 3: Additional qualification questions
Page 4: Thank you + download

Benefits: Higher conversion, more data collection
```

**Dynamic Content**:
```
Add conditional content based on traffic source:

If source = Facebook:
  - Show Facebook-specific testimonials
  - Adjust messaging for social traffic

If source = Google Ads:
  - Show search-focused content
  - Emphasize urgency
```

**Exit Intent Popup**:
```
Add to funnel settings:

- Detect when user about to leave
- Show popup: "Wait! Get 20% off if you sign up now"
- Alternative offer to capture lead before exit
```

### Common Issues

**Issue: "Page won't save"**
- **Cause**: Invalid HTML or form configuration
- **Solution**: Agent should validate form has submit action configured

**Issue: "Form submissions not creating contacts"**
- **Cause**: Form action not connected to CRM
- **Solution**: Re-verify form settings → Actions → "Create Contact"

**Issue: "CSS/styling not applied"**
- **Cause**: Theme conflict or invalid CSS
- **Solution**: Use template's built-in styling options instead of custom CSS

**Issue: "Redirect not working"**
- **Cause**: Thank you page URL incorrect
- **Solution**: Use relative URL (/thank-you) instead of absolute

### Next Steps

1. Add A/B testing to optimize conversion (create variant pages)
2. Integrate with Facebook/Google Ads for traffic
3. Set up retargeting pixel for visitors who didn't convert
4. Create upsell funnel for post-download engagement

---

## Tutorial 5: Managing Appointments and Calendar

**Objective**: Set up automated appointment booking with calendar integration

**Time Estimate**: 15-20 minutes

**Difficulty**: Intermediate

**What You'll Learn**:
- Configure GHL calendar settings
- Create appointment types
- Set up availability rules
- Automate confirmation and reminder emails

### Step-by-Step Instructions

#### Step 1: Enter the Task

```
Navigate to GoHighLevel Calendar and configure appointment booking:

Calendar Name: Sales Consultations

Appointment Types:
1. Discovery Call (30 minutes)
   - Description: "Free 30-minute consultation to discuss your needs"
   - Duration: 30 minutes
   - Buffer before: 15 minutes
   - Buffer after: 10 minutes

2. Strategy Session (60 minutes)
   - Description: "In-depth strategy session for qualified leads"
   - Duration: 60 minutes
   - Buffer before: 15 minutes
   - Buffer after: 15 minutes
   - Requires: Tag "Qualified Lead"

Availability:
- Monday to Friday: 9:00 AM - 5:00 PM
- Timezone: Eastern Time (ET)
- Exclude: Weekends and holidays
- Maximum: 5 appointments per day

Confirmation Settings:
- Send confirmation email immediately
- Send reminder 24 hours before
- Send reminder 1 hour before
- Include: Calendar invite (ICS file)
- Include: Zoom/Meet link if virtual

Form Fields:
- Name (required)
- Email (required)
- Phone (required)
- Company Name (optional)
- What would you like to discuss? (textarea, required)

Post-Booking Actions:
- Add contact to CRM if doesn't exist
- Tag with "Booked Appointment"
- Create task for sales rep: "Prepare for meeting with [name]"
- Send internal notification to sales@company.com

Save and publish the calendar.
```

#### Step 2: Monitor Execution

Expected duration: 10-15 minutes

The agent will:
1. Navigate to Calendar settings
2. Create new calendar
3. Configure each appointment type
4. Set availability rules
5. Configure notifications
6. Set up form fields
7. Configure post-booking actions
8. Publish calendar

#### Step 3: Verify Calendar

**Check Calendar Settings**:
```
Agent task for verification:

"Verify the Sales Consultations calendar:
1. Navigate to Calendar → Sales Consultations
2. Check both appointment types exist
3. Verify availability shows Monday-Friday 9am-5pm
4. Test booking: Try to book a Discovery Call
5. Confirm email arrives
6. Screenshot calendar booking page"
```

### Expected Output

**Calendar Configuration**:
- Two appointment types visible
- Booking page shows available time slots
- Form includes all specified fields
- Confirmation emails configured

**Booking Flow**:
1. Client visits booking page
2. Selects appointment type
3. Chooses available time slot
4. Fills form
5. Submits booking
6. Receives confirmation email
7. Contact created in CRM with tag

### Integration with Workflows

**Create Follow-Up Workflow**:
```
After completing calendar setup, create this workflow:

"Create a workflow for appointment follow-up:

Trigger: Contact tagged 'Booked Appointment'

Actions:
1. Wait until 1 day before appointment
2. Send reminder SMS: 'Looking forward to our call tomorrow at [time]!'
3. Wait until 1 hour after scheduled appointment time
4. Check if appointment was marked 'Completed'
5. IF completed:
   a. Send thank you email
   b. Tag 'Attended Appointment'
   c. Add to 'Post-Call Nurture' campaign
6. IF not completed (no-show):
   a. Tag 'No Show'
   b. Send re-booking email
   c. Create task for sales: 'Follow up with no-show'
"
```

### Common Issues

**Issue: "No available time slots showing"**
- **Cause**: Availability hours not configured correctly
- **Solution**: Verify timezone matches your business hours

**Issue: "Confirmation emails not sending"**
- **Cause**: Email template not configured
- **Solution**: Set up email templates in Settings → Email Templates first

**Issue: "Calendar conflicts not detected"**
- **Cause**: Google Calendar integration not connected
- **Solution**: Connect Google Calendar in Settings → Integrations

### Next Steps

1. Integrate with Zoom/Google Meet for virtual appointments
2. Set up group calendar for multiple team members
3. Create different calendars for different services
4. Add payment collection at booking time

---

## Tutorial 6: Bulk Contact Import

**Objective**: Import and process large contact lists into GoHighLevel

**Time Estimate**: 20-30 minutes

**Difficulty**: Intermediate

**What You'll Learn**:
- Prepare CSV files for import
- Map fields correctly
- Handle duplicate contacts
- Add tags and assign campaigns in bulk

### Prerequisites

- CSV file with contact data ready
- Understanding of CSV format
- Completed Tutorial 1 (basic contact creation)

### Step-by-Step Instructions

#### Step 1: Prepare Your CSV

**Sample CSV Structure**:
```csv
first_name,last_name,email,phone,company,source,tags
John,Doe,john@example.com,(555) 123-4567,Acme Inc,Website,"New Lead, Import Q4 2025"
Jane,Smith,jane@example.com,(555) 987-6543,Beta Corp,Referral,"New Lead, VIP"
Bob,Johnson,bob@example.com,(555) 456-7890,Gamma LLC,Trade Show,"New Lead, Event"
```

**CSV Requirements**:
- UTF-8 encoding
- Comma-separated values
- Headers in first row
- Email required (unique identifier)

#### Step 2: Upload CSV to Accessible Location

**Option A**: Upload to Google Drive/Dropbox and get shareable link
**Option B**: Upload to your server
**Option C**: Include CSV content directly in task (for small lists < 50 contacts)

#### Step 3: Enter the Task

```
Import contacts from CSV into GoHighLevel:

CSV Data (or provide link to file):
[Paste CSV content or provide URL]

Field Mapping:
- first_name → First Name
- last_name → Last Name
- email → Email
- phone → Phone
- company → Company Name (custom field)
- source → Source
- tags → Tags (comma-separated)

Import Settings:
- Skip duplicates: No (update existing contacts if email matches)
- Tag all imports with: "Import Q4 2025"
- Add all contacts to campaign: "Welcome Series"
- Create task for sales team: "Review new imports"

After import, provide summary:
- Total contacts in CSV
- Successfully imported
- Updated (duplicates)
- Failed (with error reasons)
```

#### Step 4: Monitor Import Process

The agent will:

1. **Parse CSV** (1 min):
   ```
   🔵 Reading CSV file
   ✅ Found 50 contacts to import
   🔵 Validating email addresses
   ✅ All emails valid
   ```

2. **Navigate to Import** (30 sec):
   ```
   🔵 Opening Contacts → Import
   ✅ Import page loaded
   ```

3. **Upload & Map** (2 min):
   ```
   🔵 Uploading CSV file
   ✅ File uploaded successfully
   🔵 Mapping fields:
      - first_name → First Name ✓
      - last_name → Last Name ✓
      - email → Email ✓
      - phone → Phone ✓
   ✅ Field mapping complete
   ```

4. **Configure Settings** (1 min):
   ```
   🔵 Setting import options
   🔵 Duplicate handling: Update existing
   🔵 Adding tag: Import Q4 2025
   🔵 Adding to campaign: Welcome Series
   ✅ Settings configured
   ```

5. **Execute Import** (5-15 min depending on size):
   ```
   🔵 Starting import...
   🔵 Importing contacts (1/50)
   🔵 Importing contacts (10/50)
   🔵 Importing contacts (25/50)
   🔵 Importing contacts (50/50)
   ✅ Import complete
   ```

6. **Generate Summary** (1 min):
   ```
   📊 Import Summary:
   Total in CSV: 50
   Successfully imported: 45
   Updated (existing): 3
   Failed: 2

   Failed contacts:
   - Row 23: Invalid phone format
   - Row 47: Missing required field (email)
   ```

### Expected Output

**Import Summary**:
```
Import Completed Successfully

Total Contacts: 50
New Contacts Created: 45
Existing Contacts Updated: 3
Failed Imports: 2

All contacts tagged with: "Import Q4 2025"
All contacts added to: "Welcome Series" campaign

Failed Contacts (see details for manual review):
1. Row 23: John Invalid - Phone format incorrect
2. Row 47: Missing Email - Email field required

Import ID: imp_abc123
Duration: 8m 32s
```

**Verification**:
- Navigate to Contacts → View Filters → Tag "Import Q4 2025"
- Should show 48 contacts (45 new + 3 updated)

### Advanced Import Scenarios

**Conditional Campaign Assignment**:
```
Instead of adding all to one campaign, segment by source:

Import contacts with these rules:
- If source = "Website" → Add to "Web Lead Nurture"
- If source = "Referral" → Add to "Referral Follow-Up"
- If source = "Trade Show" → Add to "Event Follow-Up"
```

**Custom Field Mapping**:
```
CSV includes custom fields:

CSV Columns:
- industry → Custom Field: Industry
- budget → Custom Field: Estimated Budget
- timeline → Custom Field: Purchase Timeline
- decision_maker → Custom Field: Decision Maker

Ensure these custom fields exist in GHL before import
```

**Lead Scoring on Import**:
```
Assign initial lead score based on data:

If industry = "Technology" → +10 points
If budget > "$10,000" → +15 points
If timeline = "Immediate" → +20 points
If source = "Referral" → +5 points

Final score determines initial campaign
```

### Common Issues

**Issue: "Invalid email format"**
- **Cause**: Email addresses not properly formatted
- **Solution**: Clean CSV before import:
  ```python
  import re
  def validate_email(email):
      return re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email)
  ```

**Issue: "Phone format not accepted"**
- **Cause**: GHL expects specific phone format
- **Solution**: Standardize to E.164 format: +1 (555) 123-4567

**Issue: "Custom fields not found"**
- **Cause**: Custom fields don't exist in GHL
- **Solution**: Create custom fields first:
  ```
  "Before importing, create these custom fields in GHL:
  - Company Name (text)
  - Industry (dropdown: Tech, Healthcare, Retail, Other)
  - Budget (currency)
  - Timeline (dropdown: Immediate, 1-3 months, 3-6 months)"
  ```

**Issue: "Import timeout for large lists"**
- **Cause**: CSV has 1000+ contacts
- **Solution**: Split into batches of 500:
  ```
  "Import contacts in batches:
  Batch 1: Rows 1-500
  Batch 2: Rows 501-1000
  Batch 3: Rows 1001-1500"
  ```

### Next Steps

1. Set up automated imports via API/Zapier
2. Create data cleaning workflows
3. Implement lead enrichment with external data sources
4. Build duplicate detection and merging processes

---

## Tutorial 7: SMS Campaign Automation

**Objective**: Create and deploy an SMS marketing campaign

**Time Estimate**: 15-20 minutes

**Difficulty**: Intermediate

**What You'll Learn**:
- Set up SMS messaging in GHL
- Create SMS campaigns
- Schedule message sequences
- Track engagement and replies

### Prerequisites

- GHL account with SMS enabled
- SMS credits purchased
- Contacts with valid phone numbers

### Step-by-Step Instructions

#### Step 1: Enter the Task

```
Create an SMS campaign in GoHighLevel:

Campaign Name: Summer Sale Promotion
Target Audience: Contacts tagged "Customer" AND "Interested in Services"

Message Sequence:

Message 1 (Send immediately):
"Hi {{contact.first_name}}! 🌞 Our Summer Sale is here! Save 30% on all services this week only. Interested? Reply YES for details!"

Message 2 (Send 2 days later, only if no reply to Message 1):
"Hey {{contact.first_name}}, just a reminder about our Summer Sale ending soon! Don't miss 30% off. Questions? Just reply!"

Message 3 (Send 1 day before sale ends, only to those who replied YES):
"{{contact.first_name}}, last day for 30% off! Ready to get started? Book here: {{user.calendar_link}}"

Settings:
- Sending Hours: 10 AM - 8 PM (recipient's local time)
- Days: Monday - Saturday (no Sunday texts)
- Compliance: Include "Reply STOP to unsubscribe" in first message
- Auto-respond to STOP: Remove from campaign and tag "Unsubscribed SMS"

Track:
- Delivery rate
- Reply rate
- Conversion rate (booked appointments)

Activate campaign immediately.
```

#### Step 2: Monitor Setup

Expected duration: 10-12 minutes

**Setup Phases**:

1. **Navigate to SMS** (30 sec):
   ```
   🔵 Opening Marketing → SMS Campaigns
   ✅ SMS page loaded
   ```

2. **Create Campaign** (2 min):
   ```
   🔵 Clicking "New SMS Campaign"
   🔵 Entering campaign name: Summer Sale Promotion
   🔵 Setting target audience filters:
      - Tag contains "Customer"
      - AND Tag contains "Interested in Services"
   ✅ Audience configured (142 contacts)
   ```

3. **Create Messages** (6 min):
   ```
   🔵 Adding Message 1
   🔵 Entering message text with merge fields
   🔵 Setting send time: Immediately on campaign start
   ✅ Message 1 created

   🔵 Adding Message 2
   🔵 Setting condition: Send only if no reply to Message 1
   🔵 Setting delay: 2 days after Message 1
   ✅ Message 2 created

   🔵 Adding Message 3
   🔵 Setting condition: Send only if replied YES to Message 1
   🔵 Setting delay: 1 day before sale end date
   ✅ Message 3 created
   ```

4. **Configure Settings** (2 min):
   ```
   🔵 Setting sending hours: 10 AM - 8 PM
   🔵 Setting sending days: Mon-Sat
   🔵 Adding compliance footer
   🔵 Setting up auto-responses:
      - STOP → Unsubscribe + tag "Unsubscribed SMS"
   ✅ Settings configured
   ```

5. **Activate** (30 sec):
   ```
   🔵 Reviewing campaign summary
   🔵 Clicking "Activate Campaign"
   ✅ Campaign activated - Message 1 queued for 142 contacts
   ```

### Expected Output

**Campaign Summary**:
```
SMS Campaign: Summer Sale Promotion
Status: Active

Target Audience: 142 contacts
- Tag: Customer
- Tag: Interested in Services

Message Sequence:
├─ Message 1: "Hi {{first_name}}! 🌞 Our Summer Sale..."
│  Send: Immediately (142 recipients)
│
├─ Message 2: "Hey {{first_name}}, just a reminder..."
│  Send: 2 days later (conditional on no reply)
│
└─ Message 3: "{{first_name}}, last day for 30%..."
   Send: 1 day before end (conditional on YES reply)

Settings:
- Send window: 10 AM - 8 PM local time
- Send days: Mon-Sat
- Compliance: STOP to unsubscribe included
- Auto-respond: STOP configured

Est. Credits: 142-426 (depending on engagement)
Est. Cost: $7.10-$21.30 (at $0.05/SMS)
```

### Tracking Results

**Monitor Campaign Performance**:

```
Create agent task to check results:

"Check SMS campaign performance for Summer Sale Promotion:
1. Navigate to Marketing → SMS Campaigns
2. Open 'Summer Sale Promotion' campaign
3. Generate report showing:
   - Total messages sent
   - Delivery rate
   - Reply rate
   - STOP requests
   - Conversions (appointments booked)
4. Export report to CSV
5. Screenshot the results dashboard"
```

**Expected Metrics**:
- Delivery Rate: 95-98%
- Reply Rate: 10-20%
- YES replies: 30-50% of repliers
- Conversions: 5-10% of YES replies

### Advanced SMS Strategies

**Two-Way Conversation Flow**:
```
Set up conversational SMS with AI:

"Create SMS campaign with AI-powered responses:

Message 1: 'Hi! We have a special offer for you. Reply YES to learn more!'

If reply = YES:
  → Auto-respond: 'Great! Which service interests you?
     A) Service 1
     B) Service 2
     C) Service 3'

If reply contains A, B, or C:
  → Send details about selected service
  → Follow up with: 'Want to book a call? Reply BOOK'

If reply = BOOK:
  → Send calendar link
  → Create high-priority task for sales team

If reply = anything else:
  → Tag 'Needs Human Response'
  → Notify sales team to take over conversation"
```

**Drip Campaign**:
```
Long-term nurture via SMS:

Day 1: Welcome message
Day 3: Share helpful tip
Day 7: Customer success story
Day 14: Limited time offer
Day 21: Ask for feedback
Day 30: Exclusive VIP invitation

Each message personalized based on:
- Industry
- Past interactions
- Engagement level
```

**Segmented Messaging**:
```
Send different messages to different segments:

Segment 1: New Customers (tagged within 30 days)
Message: "Welcome! Here's a special new customer discount..."

Segment 2: Repeat Customers
Message: "Thanks for being a loyal customer! VIP offer just for you..."

Segment 3: Lapsed Customers (no purchase in 90+ days)
Message: "We miss you! Come back with this exclusive 40% off..."
```

### Compliance & Best Practices

**TCPA Compliance**:
- Only text contacts who opted in
- Include clear opt-out instructions
- Honor STOP requests immediately
- Keep records of consent

**Timing Best Practices**:
- Avoid early morning (before 9 AM)
- Avoid late evening (after 9 PM)
- Consider recipient's timezone
- No texts on major holidays

**Message Content Guidelines**:
- Keep under 160 characters when possible
- Use clear, concise language
- Include ONE clear call-to-action
- Add emojis sparingly (1-2 max)
- Always personalize with merge fields

### Common Issues

**Issue: "Messages not sending"**
- **Cause**: Insufficient SMS credits
- **Solution**: Purchase credits in Settings → SMS Settings

**Issue: "High unsubscribe rate"**
- **Cause**: Too frequent messaging or irrelevant content
- **Solution**: Reduce frequency, improve targeting, enhance personalization

**Issue: "Low reply rate"**
- **Cause**: Weak call-to-action or poor timing
- **Solution**:
  - Use stronger CTA: "Reply YES" instead of "Let us know"
  - Test different send times
  - A/B test message variations

**Issue: "Merge fields not populating"**
- **Cause**: Contact missing required field data
- **Solution**: Add default fallback:
  ```
  "Hi {{contact.first_name|default:there}}!"
  Results in: "Hi there!" if first name missing
  ```

### Next Steps

1. Integrate SMS with email campaigns for multi-channel approach
2. Set up SMS-triggered workflows
3. Implement A/B testing for message optimization
4. Create SMS templates library for quick deployment

---

## Tutorial 8: Custom Field Management

**Objective**: Create and manage custom fields for advanced contact segmentation

**Time Estimate**: 15-20 minutes

**Difficulty**: Intermediate

**What You'll Learn**:
- Create custom fields in GHL
- Set field types and options
- Update contacts with custom data
- Use custom fields for segmentation

### Step-by-Step Instructions

#### Step 1: Enter the Task

```
Configure custom fields in GoHighLevel for enhanced contact data:

Custom Fields to Create:

1. Field: Industry
   Type: Dropdown
   Options: Technology, Healthcare, Real Estate, E-commerce, Retail, Professional Services, Other
   Required: No
   Show on forms: Yes

2. Field: Company Size
   Type: Dropdown
   Options: 1-10, 11-50, 51-200, 201-500, 500+
   Required: No

3. Field: Annual Revenue
   Type: Dropdown
   Options: Under $100K, $100K-$500K, $500K-$1M, $1M-$5M, $5M+, Prefer not to say
   Required: No

4. Field: Lead Score
   Type: Number
   Min: 0
   Max: 100
   Default: 0
   Required: No
   Show on forms: No

5. Field: Last Contact Date
   Type: Date
   Required: No
   Show on forms: No

6. Field: Preferred Contact Method
   Type: Radio Buttons
   Options: Email, Phone, SMS, Video Call
   Required: No
   Show on forms: Yes

7. Field: Special Requirements
   Type: Text Area
   Max Length: 500 characters
   Required: No
   Show on forms: Yes

After creating all fields, update 5 test contacts with sample data to verify fields work correctly.
```

#### Step 2: Monitor Creation

Expected duration: 12-15 minutes

**Phase 1: Navigate to Custom Fields** (1 min):
```
🔵 Opening Settings → Custom Fields
✅ Custom Fields page loaded
```

**Phase 2: Create Each Field** (10 min):
```
🔵 Creating field 1: Industry
🔵 Setting type: Dropdown
🔵 Adding options: Technology, Healthcare...
✅ Industry field created

🔵 Creating field 2: Company Size
[...similar steps...]
✅ Company Size field created

[Repeats for all 7 fields]
```

**Phase 3: Test with Sample Data** (3 min):
```
🔵 Navigating to Contacts
🔵 Opening test contact 1
🔵 Filling custom fields:
   - Industry: Technology
   - Company Size: 11-50
   - Annual Revenue: $500K-$1M
   - Lead Score: 75
   - Preferred Contact: Email
✅ Contact 1 updated

[Repeats for 5 contacts]
```

### Expected Output

**Custom Fields Created**:
```
Custom Field Configuration Complete

Total Fields Created: 7

1. Industry (Dropdown)
   - 7 options available
   - Visible on forms

2. Company Size (Dropdown)
   - 5 options available
   - Hidden on forms

3. Annual Revenue (Dropdown)
   - 6 options available
   - Hidden on forms

4. Lead Score (Number)
   - Range: 0-100
   - Default: 0
   - Hidden on forms

5. Last Contact Date (Date)
   - Format: MM/DD/YYYY
   - Hidden on forms

6. Preferred Contact Method (Radio)
   - 4 options available
   - Visible on forms

7. Special Requirements (Text Area)
   - Max 500 characters
   - Visible on forms

Test Contacts Updated: 5
All fields functioning correctly
```

### Using Custom Fields for Segmentation

**Create Smart Lists**:
```
Create agent task:

"Create smart lists based on custom fields:

List 1: High-Value Tech Leads
Filters:
- Industry = Technology
- Annual Revenue > $1M
- Lead Score > 70

List 2: Small Business Healthcare
Filters:
- Industry = Healthcare
- Company Size = 1-10 OR 11-50
- Lead Score > 50

List 3: Urgent Follow-Ups
Filters:
- Last Contact Date > 30 days ago
- Lead Score > 60
- Preferred Contact Method = Phone OR Video Call

Save each smart list and tag contacts for easy access."
```

**Create Workflows with Custom Fields**:
```
Workflow: Industry-Specific Nurture

Trigger: Contact created or updated
Condition: Industry field is populated

Actions:
IF Industry = "Technology":
  → Add to "Tech Industry Newsletter"
  → Assign to tech specialist sales rep
  → Send tech-focused welcome email

ELSE IF Industry = "Healthcare":
  → Add to "Healthcare Solutions Newsletter"
  → Assign to healthcare specialist
  → Send HIPAA compliance guide

ELSE IF Industry = "Real Estate":
  → Add to "Real Estate Pros Newsletter"
  → Assign to real estate specialist
  → Send MLS integration guide

ELSE:
  → Add to "General Newsletter"
  → Assign to general sales queue
```

### Advanced Custom Field Uses

**Dynamic Pricing**:
```
Use Annual Revenue to show dynamic pricing:

Form submission → Check Annual Revenue field

If Revenue < $100K:
  → Show Starter Plan ($99/mo)
  → Quote: $500 setup fee

If Revenue $100K-$500K:
  → Show Growth Plan ($299/mo)
  → Quote: $1,500 setup fee

If Revenue $500K-$1M:
  → Show Professional Plan ($699/mo)
  → Quote: $3,000 setup fee

If Revenue > $1M:
  → Show Enterprise Plan (custom)
  → Schedule strategy call
```

**Lead Scoring Automation**:
```
Create workflow to auto-calculate lead score:

Trigger: Contact created or custom field updated

Actions:
1. Start with base score: 0

2. Add points based on Industry:
   - Technology: +15
   - Healthcare: +12
   - Real Estate: +10
   - Other: +5

3. Add points based on Company Size:
   - 1-10: +5
   - 11-50: +10
   - 51-200: +15
   - 201-500: +20
   - 500+: +25

4. Add points based on Annual Revenue:
   - Under $100K: +5
   - $100K-$500K: +10
   - $500K-$1M: +15
   - $1M-$5M: +20
   - $5M+: +25

5. Update "Lead Score" custom field with calculated total

6. If Lead Score > 70:
   → Tag "Hot Lead"
   → Create high-priority task for sales
   → Send notification to sales manager
```

**Personalized Communication**:
```
Use custom fields in email/SMS templates:

Email Template: Personalized Offer

Subject: {{contact.industry}} Solutions Tailored for {{contact.company_size}} Companies

Body:
Hi {{contact.first_name}},

I noticed you're in the {{contact.industry}} industry with a team of {{contact.company_size}} people. Companies like yours typically struggle with [industry-specific challenge].

Based on your revenue range ({{contact.annual_revenue}}), I'd recommend our [appropriate plan] which includes:
- [Feature 1 relevant to industry]
- [Feature 2 relevant to company size]
- [Feature 3 relevant to revenue]

Since you prefer contact via {{contact.preferred_contact_method}}, [appropriate CTA based on preference]:

If Email: "Reply to this email with questions"
If Phone: "Call me at (555) 123-4567"
If SMS: "Text me at (555) 123-4567"
If Video: "Book a video call: [calendar link]"

{{contact.special_requirements ? "I also noted your special requirements: " + contact.special_requirements : ""}}

Looking forward to connecting!
```

### Common Issues

**Issue: "Custom field not showing on forms"**
- **Cause**: "Show on forms" setting disabled
- **Solution**: Edit field → Enable "Show on forms"

**Issue: "Dropdown options not saving"**
- **Cause**: Special characters in options
- **Solution**: Remove special characters, use only letters, numbers, spaces

**Issue: "Number field accepting invalid values"**
- **Cause**: Min/Max not set
- **Solution**: Set validation rules: Min: 0, Max: 100

**Issue: "Date field format issues"**
- **Cause**: Different format expected
- **Solution**: Use MM/DD/YYYY format consistently

### Next Steps

1. Create conditional forms based on custom field values
2. Build custom reports using custom fields
3. Integrate custom fields with external CRMs via API
4. Create custom field audit workflow to keep data clean

---

## Tutorial 9: Integration with Webhooks

**Objective**: Set up webhooks to trigger external automations from GHL events

**Time Estimate**: 20-25 minutes

**Difficulty**: Advanced

**What You'll Learn**:
- Create webhooks in GHL
- Configure webhook triggers
- Handle webhook payloads
- Test webhook delivery

### Prerequisites

- Understanding of webhooks concept
- Endpoint URL ready to receive webhooks (use webhook.site for testing)
- Completed previous tutorials for context

### Step-by-Step Instructions

#### Step 1: Set Up Test Endpoint

For testing, we'll use webhook.site (free service):

1. Visit https://webhook.site
2. Copy your unique URL (e.g., https://webhook.site/abc-123-def)

#### Step 2: Enter the Task

```
Configure webhooks in GoHighLevel to trigger external automations:

Webhook 1: New Contact Created
- Name: New Contact to CRM Sync
- Trigger: Contact Created
- Webhook URL: https://webhook.site/your-unique-url
- Method: POST
- Headers:
  * Content-Type: application/json
  * Authorization: Bearer sk_test_your_api_key_here
- Payload:
  {
    "event": "contact.created",
    "contact_id": "{{contact.id}}",
    "first_name": "{{contact.first_name}}",
    "last_name": "{{contact.last_name}}",
    "email": "{{contact.email}}",
    "phone": "{{contact.phone}}",
    "tags": "{{contact.tags}}",
    "created_at": "{{contact.created_at}}"
  }

Webhook 2: Appointment Booked
- Name: Appointment Notification
- Trigger: Appointment Created
- Webhook URL: https://webhook.site/your-unique-url
- Method: POST
- Payload:
  {
    "event": "appointment.booked",
    "appointment_id": "{{appointment.id}}",
    "contact_name": "{{contact.full_name}}",
    "contact_email": "{{contact.email}}",
    "appointment_type": "{{appointment.type}}",
    "scheduled_time": "{{appointment.start_time}}",
    "calendar_link": "{{appointment.calendar_link}}"
  }

Webhook 3: Form Submission
- Name: Lead Form to Slack
- Trigger: Form Submitted
- Form: "Contact Us Form"
- Webhook URL: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
- Method: POST
- Payload:
  {
    "text": "New Lead: {{contact.first_name}} {{contact.last_name}} ({{contact.email}}) submitted {{form.name}}"
  }

Test each webhook after creation by triggering the event manually.
```

#### Step 3: Monitor Setup

Expected duration: 15-20 minutes

**Phase 1: Navigate to Webhooks** (1 min):
```
🔵 Opening Settings → Integrations → Webhooks
✅ Webhooks page loaded
```

**Phase 2: Create Webhooks** (12 min):
```
🔵 Creating Webhook 1: New Contact to CRM Sync
🔵 Setting trigger: Contact Created
🔵 Entering webhook URL
🔵 Configuring headers
🔵 Setting up JSON payload with merge fields
✅ Webhook 1 created

[Repeats for Webhooks 2 and 3]
```

**Phase 3: Test Webhooks** (5 min):
```
🔵 Testing Webhook 1:
   - Creating test contact
   - Verifying webhook fires
   - Checking payload at webhook.site
✅ Webhook 1 test successful

[Repeats for other webhooks]
```

### Expected Output

**Webhook Configuration**:
```
3 Webhooks Configured Successfully

Webhook 1: New Contact to CRM Sync
- Trigger: Contact Created
- URL: https://webhook.site/abc-123
- Status: Active
- Test Result: Success (200 OK)

Webhook 2: Appointment Notification
- Trigger: Appointment Created
- URL: https://webhook.site/abc-123
- Status: Active
- Test Result: Success (200 OK)

Webhook 3: Lead Form to Slack
- Trigger: Form Submitted (Contact Us Form)
- URL: https://hooks.slack.com/...
- Status: Active
- Test Result: Success (200 OK)
```

**Sample Webhook Payload Received**:
```json
{
  "event": "contact.created",
  "contact_id": "con_abc123",
  "first_name": "Test",
  "last_name": "User",
  "email": "test@example.com",
  "phone": "(555) 123-4567",
  "tags": "New Lead, Test",
  "created_at": "2025-12-20T14:30:00Z"
}
```

### Real-World Use Cases

**Use Case 1: Sync to External CRM**

Configure webhook to send new GHL contacts to Salesforce/HubSpot:

```
Webhook: GHL to Salesforce Sync
Trigger: Contact Created or Updated
URL: https://api.salesforce.com/webhooks/ghl-contacts
Headers:
  Authorization: Bearer {{salesforce_api_token}}
Payload: [Contact data in Salesforce format]
```

**Use Case 2: Slack Notifications**

Real-time alerts to Slack when important events happen:

```
Webhook: High-Value Lead Alert
Trigger: Contact Created
Condition: Lead Score > 80
URL: https://hooks.slack.com/services/YOUR/WEBHOOK
Payload:
{
  "channel": "#sales",
  "username": "GHL Bot",
  "icon_emoji": ":fire:",
  "text": "🔥 Hot Lead Alert!",
  "attachments": [{
    "color": "good",
    "fields": [
      {"title": "Name", "value": "{{contact.full_name}}", "short": true},
      {"title": "Email", "value": "{{contact.email}}", "short": true},
      {"title": "Lead Score", "value": "{{contact.lead_score}}", "short": true},
      {"title": "Industry", "value": "{{contact.industry}}", "short": true}
    ]
  }]
}
```

**Use Case 3: Google Sheets Logging**

Log all appointments to Google Sheets for reporting:

```
Webhook: Appointments to Google Sheets
Trigger: Appointment Created
URL: https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
Method: POST
Payload:
{
  "date": "{{appointment.start_time}}",
  "contact": "{{contact.full_name}}",
  "email": "{{contact.email}}",
  "type": "{{appointment.type}}",
  "duration": "{{appointment.duration}}",
  "status": "{{appointment.status}}"
}
```

**Use Case 4: Zapier/Make.com Integration**

Trigger complex automation workflows:

```
Webhook: New Lead to Zapier
Trigger: Contact Created
URL: https://hooks.zapier.com/hooks/catch/12345/abcdef/
Payload: [All contact data]

Zapier Workflow:
1. Receive webhook from GHL
2. Enrich data with Clearbit
3. Add to Airtable database
4. Create task in Asana
5. Send personalized email via SendGrid
6. Log to Google Analytics
```

### Security Best Practices

**Webhook Security Checklist**:

1. **Use HTTPS Only**:
   - Never use HTTP (unencrypted)
   - Verify SSL certificates

2. **Implement Authentication**:
   ```
   Headers:
     Authorization: Bearer sk_live_xxxxxxxxxx
     X-API-Key: your_secret_key_here
   ```

3. **Verify Webhook Signatures**:
   - GHL signs webhooks with HMAC
   - Verify signature on receiving end

4. **IP Whitelist** (if possible):
   - Only accept webhooks from GHL IP ranges

5. **Validate Payload**:
   ```javascript
   // Example: Validate received webhook
   function validateWebhook(payload) {
     if (!payload.event || !payload.contact_id) {
       return false;
     }
     return true;
   }
   ```

### Testing and Debugging

**Test Webhook Delivery**:

```
Create manual test:

1. Trigger the event in GHL (e.g., create contact)
2. Check webhook.site for received payload
3. Verify all merge fields populated correctly
4. Check response status (should be 200-299)
5. Review any error messages
```

**Common Response Codes**:
- `200 OK`: Success
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid payload
- `401 Unauthorized`: Authentication failed
- `404 Not Found`: Endpoint doesn't exist
- `500 Server Error`: Receiving server error

**Debugging Failed Webhooks**:

```
GHL provides webhook logs:

1. Navigate to Settings → Webhooks
2. Click on webhook name
3. View "Recent Deliveries"
4. Check status codes and error messages
5. Review request/response details
```

### Common Issues

**Issue: "Webhook not firing"**
- **Cause**: Trigger condition not met or webhook inactive
- **Solution**:
  - Verify webhook status is "Active"
  - Check trigger matches event exactly
  - Test with manual event

**Issue: "Merge fields showing as {{contact.name}}"**
- **Cause**: Incorrect merge field syntax
- **Solution**: Use exact GHL merge field names:
  ```
  ✅ {{contact.first_name}}
  ❌ {{firstName}}
  ❌ {{contact.firstname}}
  ```

**Issue: "Receiving endpoint returns 401"**
- **Cause**: Missing or invalid authentication
- **Solution**: Add correct auth headers:
  ```
  Authorization: Bearer YOUR_API_KEY
  ```

**Issue: "Webhook timing out"**
- **Cause**: Receiving endpoint taking > 30 seconds to respond
- **Solution**: Receiving endpoint should:
  - Return 200 immediately
  - Process webhook asynchronously in background

### Next Steps

1. Build custom webhook receiver with signature verification
2. Create bidirectional sync (GHL ← → External CRM)
3. Implement webhook retry logic for failed deliveries
4. Set up webhook monitoring and alerting

---

## Tutorial 10: Advanced Multi-Step Automation

**Objective**: Combine everything learned into a comprehensive automation workflow

**Time Estimate**: 45-60 minutes

**Difficulty**: Advanced

**What You'll Learn**:
- Orchestrate complex multi-system automations
- Combine contacts, campaigns, workflows, funnels, and webhooks
- Build end-to-end business process automation
- Monitor and optimize automation performance

### Scenario

Build a complete "Lead to Customer" automation that:
1. Captures leads from a funnel
2. Scores and segments leads
3. Nurtures via multi-channel campaigns
4. Books sales appointments
5. Notifies sales team
6. Tracks conversion to customer

### Step-by-Step Instructions

This tutorial combines all previous tutorials into one comprehensive automation.

#### Step 1: Create the Funnel (Tutorial 4)

```
Create lead capture funnel:

Funnel Name: "Free Marketing Audit"
Landing Page: Offer free marketing audit
Form Fields:
- First Name
- Last Name
- Email
- Phone
- Company Name
- Website URL
- Annual Revenue (custom field)
- Industry (custom field)
- Biggest Marketing Challenge (textarea)

Thank You Page: Confirm submission and set expectations
```

#### Step 2: Set Up Custom Fields (Tutorial 8)

```
Ensure these custom fields exist:
- Industry (dropdown)
- Annual Revenue (dropdown)
- Lead Score (number, 0-100)
- Lead Stage (dropdown: New, Qualified, Appointment Scheduled, Customer)
- Last Contacted (date)
- Marketing Challenge (textarea)
```

#### Step 3: Create Lead Scoring Workflow (Tutorial 3)

```
Workflow: Auto Lead Scoring

Trigger: Contact created from "Free Marketing Audit" funnel

Actions:
1. Initialize Lead Score to 0
2. Add points based on Annual Revenue:
   - Under $100K: +5
   - $100K-$500K: +10
   - $500K-$1M: +15
   - $1M+: +20

3. Add points based on Industry:
   - Technology: +15
   - Healthcare: +12
   - Professional Services: +10
   - Other: +5

4. Add points for form completion:
   - Phone provided: +10
   - Website provided: +10
   - Marketing Challenge filled: +15

5. Update Lead Score custom field with total

6. Set Lead Stage:
   - If Score > 70: "Qualified"
   - If Score 40-70: "Warm"
   - If Score < 40: "Cold"

7. Tag based on score:
   - Score > 70: Add tag "Hot Lead"
   - Score 40-70: Add tag "Warm Lead"
   - Score < 40: Add tag "Cold Lead"
```

#### Step 4: Create Multi-Channel Nurture Campaign

**For Hot Leads (Score > 70)**:

```
Campaign: Hot Lead Fast Track

Day 0 (Immediately):
- EMAIL: "Thanks for requesting your audit! Here's what's next..."
- SMS: "Hi {{first_name}}! Got your audit request. Preparing your custom report now. Expect email within 24h."

Day 1:
- EMAIL: Send detailed marketing audit report (personalized with their website/industry)
- Create task for sales: "Review hot lead {{contact.full_name}} - Score: {{contact.lead_score}}"

Day 2:
- SMS: "{{first_name}}, did you get a chance to review your audit? I'd love to walk you through it. Reply YES to schedule!"
- If reply = YES: Send calendar link

Day 3 (if no appointment booked):
- PHONE CALL: Create task for sales rep to call directly
- EMAIL: "Personal invitation for strategy call"

Day 5 (if still no appointment):
- EMAIL: Case study relevant to their industry
- Final CTA: Calendar link
```

**For Warm Leads (Score 40-70)**:

```
Campaign: Warm Lead Nurture

Day 0:
- EMAIL: Welcome email with audit report

Day 3:
- EMAIL: Educational content about their marketing challenge

Day 7:
- SMS: Quick check-in
- EMAIL: Customer success story from their industry

Day 14:
- EMAIL: Special offer (limited time discount)

Day 21:
- EMAIL: Final nurture email with calendar link
```

**For Cold Leads (Score < 40)**:

```
Campaign: Cold Lead Long Nurture

Weekly Email Sequence:
Week 1: Educational tip
Week 2: Case study
Week 3: Webinar invitation
Week 4: Tool/resource
Week 6: Re-engagement offer
Week 8: Last attempt - special offer
```

#### Step 5: Appointment Booking Automation (Tutorial 5)

```
Calendar: Strategy Call

Triggered by:
- Direct booking from funnel
- Reply "YES" to SMS
- Click calendar link in email

Appointment Types:
1. 30-min Discovery Call (for warm/cold leads)
2. 60-min Strategy Session (for hot leads)

Pre-Appointment Workflow:
Trigger: Appointment booked

Actions:
1. Update Lead Stage to "Appointment Scheduled"
2. Add 20 points to Lead Score
3. Send confirmation email with:
   - Calendar invite
   - Zoom link
   - Pre-call questionnaire
4. Send reminder 24 hours before:
   - Email reminder
   - SMS reminder
5. Send reminder 1 hour before:
   - SMS only: "Looking forward to our call in 1 hour!"
6. Create task for sales rep:
   - "Prepare for call with {{contact.full_name}}"
   - Include: Lead score, industry, marketing challenge
   - Due: 2 hours before appointment
```

#### Step 6: Post-Appointment Workflow

```
Workflow: Post-Call Follow-Up

Trigger: Appointment status changed to "Completed"

Actions:
1. Wait 1 hour after appointment end time

2. Send thank you email:
   - Recap discussion
   - Attached proposal (if applicable)
   - Next steps

3. Create follow-up task:
   - If interested: "Send proposal to {{contact.full_name}}"
   - If not interested: "Send resources to {{contact.full_name}}"

4. Wait 2 days

5. Check for response:
   - If replied: Tag "Engaged - Follow Up"
   - If no reply: Send gentle nudge email

6. Wait 5 days

7. Final follow-up:
   - If still no response: Tag "Cold - Unresponsive"
   - Move to long-term nurture
```

#### Step 7: Conversion Tracking

```
Workflow: New Customer Onboarding

Trigger: Contact tagged "Customer"

Actions:
1. Update Lead Stage to "Customer"
2. Set Lead Score to 100
3. Remove from all nurture campaigns
4. Add to "Customer Onboarding" campaign
5. Create onboarding tasks:
   - "Send welcome package"
   - "Schedule kickoff call"
   - "Set up accounts and access"
6. Send internal notification:
   - To: sales@company.com
   - Subject: "New Customer: {{contact.full_name}}"
   - Body: Include all lead details and score
7. Update custom field "Customer Since" to today's date
```

#### Step 8: Webhook Integrations (Tutorial 9)

```
Webhook 1: New Lead to Slack
Trigger: Form submitted on "Free Marketing Audit" funnel
URL: Slack webhook URL
Payload: Alert sales team of new lead with score

Webhook 2: Hot Lead to CRM
Trigger: Contact tagged "Hot Lead"
URL: External CRM API endpoint
Payload: Sync high-value leads to sales CRM

Webhook 3: Appointment Booked to Google Calendar
Trigger: Appointment created
URL: Google Calendar API
Payload: Create calendar event for sales rep

Webhook 4: Customer Conversion to Analytics
Trigger: Contact tagged "Customer"
URL: Google Analytics measurement protocol
Payload: Track conversion event
```

#### Step 9: Reporting Dashboard

```
Create custom reports to track:

1. Funnel Conversion Metrics:
   - Visitors → Form Submissions (%)
   - Form Submissions → Qualified Leads (%)
   - Qualified Leads → Appointments (%)
   - Appointments → Customers (%)

2. Lead Source Performance:
   - Leads by source (Website, Referral, Ads, etc.)
   - Conversion rate by source
   - Average lead score by source

3. Campaign Performance:
   - Email open rates by campaign
   - SMS reply rates
   - Campaign attribution to conversions

4. Lead Scoring Effectiveness:
   - Average score of converted customers
   - Score distribution of current leads
   - Score change over time

5. Sales Team Performance:
   - Appointments per rep
   - Conversion rate per rep
   - Average time to conversion
```

### Expected End-to-End Flow

```
1. Prospect visits funnel → Fills form
   ↓
2. Contact created in GHL with custom fields
   ↓
3. Lead scoring workflow runs → Assigns score and tags
   ↓
4. Based on score, added to appropriate nurture campaign
   ↓
5. Multi-channel nurture (email + SMS) begins
   ↓
6. If engaged, calendar link sent
   ↓
7. Appointment booked → Confirmation + reminders sent
   ↓
8. Pre-call prep task created for sales rep
   ↓
9. Appointment happens (marked complete in GHL)
   ↓
10. Post-call follow-up workflow triggers
    ↓
11. If converted → Customer onboarding begins
    ↓
12. All events logged to external systems via webhooks
    ↓
13. Reports update with latest conversion data
```

### Execution Task for Agent

```
Build the complete "Lead to Customer" automation system:

Create in this order:
1. Custom fields for tracking
2. Lead capture funnel with form
3. Lead scoring workflow
4. Three nurture campaigns (Hot, Warm, Cold)
5. Appointment booking calendar
6. Pre-appointment workflow
7. Post-appointment workflow
8. Customer conversion workflow
9. Four webhooks for external integrations
10. Custom reports dashboard

After building, test the entire flow:
- Submit test lead through funnel
- Verify lead score calculated correctly
- Check appropriate campaign assignment
- Book test appointment
- Mark appointment as complete
- Verify all workflows triggered
- Check webhooks fired correctly
- Review reports showing test data

Provide summary of:
- Total workflows created
- Total campaigns created
- Test results for each step
- Any errors encountered
- Performance metrics
```

### Expected Output

```
Complete Automation System Created

Components:
├─ 7 Custom Fields
├─ 1 Funnel (2 pages)
├─ 9 Workflows
│  ├─ Lead Scoring
│  ├─ Hot Lead Nurture
│  ├─ Warm Lead Nurture
│  ├─ Cold Lead Nurture
│  ├─ Pre-Appointment
│  ├─ Post-Appointment
│  ├─ Customer Conversion
│  ├─ SMS Auto-Responder
│  └─ Score Decay (30 days)
├─ 3 Email Campaigns
├─ 2 SMS Campaigns
├─ 1 Calendar Setup
├─ 4 Webhooks
└─ 5 Custom Reports

Test Results:
✅ Funnel submission → Contact created
✅ Lead score calculated: 75 (Hot Lead)
✅ Added to Hot Lead campaign
✅ Email 1 sent successfully
✅ SMS 1 sent successfully
✅ Replied YES to SMS
✅ Calendar link sent
✅ Appointment booked
✅ Confirmation sent
✅ Reminders scheduled
✅ Appointment marked complete
✅ Follow-up workflow triggered
✅ All webhooks fired (4/4)
✅ Reports updated with test data

Performance Metrics:
- Total execution time: 47 minutes
- Workflows active: 9
- Campaigns active: 5
- Webhooks configured: 4
- Test lead score: 75
- Test conversion: Success

System Status: Fully Operational ✅
```

### Monitoring and Optimization

**Weekly Review Checklist**:

1. Check workflow performance:
   - Execution counts
   - Error rates
   - Average completion time

2. Review campaign metrics:
   - Open rates
   - Click rates
   - Conversion rates

3. Analyze lead scoring:
   - Average scores by source
   - Score distribution
   - Score correlation with conversion

4. Webhook health check:
   - Delivery success rate
   - Response times
   - Error logs

5. Optimize based on data:
   - A/B test email subject lines
   - Adjust lead score weights
   - Modify nurture timing
   - Update campaign content

### Common Issues

**Issue: "Workflow loops infinitely"**
- **Cause**: Workflow updates field that triggers itself
- **Solution**: Add condition "Only if first time" or use different trigger

**Issue: "Some contacts not entering workflows"**
- **Cause**: Trigger condition too specific
- **Solution**: Review trigger criteria, check for typos in tags/fields

**Issue: "Webhooks failing intermittently"**
- **Cause**: Receiving endpoint unreliable
- **Solution**: Implement retry logic, monitor endpoint uptime

**Issue: "Lead scores not calculating"**
- **Cause**: Custom fields not populated
- **Solution**: Ensure form maps to custom fields correctly

### Next Steps

1. Add AI-powered lead qualification
2. Implement predictive lead scoring with machine learning
3. Create A/B testing framework for campaigns
4. Build attribution modeling across channels
5. Develop custom analytics dashboard

---

## Best Practices

### General Automation Best Practices

**1. Start Simple, Then Scale**
- Begin with basic automations
- Test thoroughly before adding complexity
- Build one component at a time
- Gradually connect systems

**2. Always Test Before Activating**
- Use test contacts
- Verify all fields populate correctly
- Check timing and delays
- Test all conditional branches

**3. Monitor and Iterate**
- Review performance weekly
- A/B test variations
- Optimize based on data
- Remove or improve underperforming components

**4. Document Your Automations**
- Keep flowcharts of complex workflows
- Note dependencies between systems
- Document custom field purposes
- Maintain changelog of updates

**5. Handle Errors Gracefully**
- Plan for missing data (use default values)
- Add fallback paths in conditionals
- Monitor error logs regularly
- Set up alerts for critical failures

### Task Description Best Practices

**Be Explicit**:
```
❌ "Create a contact"
✅ "Navigate to Contacts, click Add Contact, fill in Name field with 'John Smith', Email with 'john@example.com', and click Save"
```

**Include Context**:
```
❌ "Update the campaign"
✅ "Navigate to Marketing → Campaigns → 'Welcome Series', edit Email 2, change subject line to 'Here's What You Can Expect', and save"
```

**Specify Expected Outcomes**:
```
✅ "After saving, verify the campaign shows status 'Active' and Email 2 displays the new subject line"
```

### Performance Optimization

**Reduce Execution Time**:
- Pre-configure credentials
- Use specific selectors when possible
- Minimize unnecessary navigation
- Batch similar operations

**Improve Success Rates**:
- Provide detailed task descriptions
- Use templates for proven patterns
- Give feedback on executions
- Keep GHL integration connected

**Manage Costs**:
- Combine related tasks
- Use templates to reduce planning time
- Monitor execution usage
- Optimize timing of scheduled tasks

---

## Troubleshooting

### Quick Troubleshooting Guide

**Problem**: Task fails immediately
- **Check**: API keys configured
- **Check**: GHL integration connected
- **Check**: Task description has minimum detail

**Problem**: Agent can't find elements
- **Solution**: Use natural language descriptions
- **Solution**: Wait for page load in task description
- **Solution**: Enable self-healing (automatic)

**Problem**: Workflows not triggering
- **Check**: Workflow status is "Active"
- **Check**: Trigger condition matches exactly
- **Check**: Contact meets all criteria

**Problem**: Webhooks not firing
- **Check**: Webhook status is "Active"
- **Check**: Trigger event matches
- **Check**: Test with manual trigger

**Problem**: Low success rate
- **Solution**: Improve task descriptions
- **Solution**: Use templates
- **Solution**: Provide feedback on failed tasks
- **Solution**: Break complex tasks into smaller steps

For detailed troubleshooting, see [TROUBLESHOOTING.md](/root/github-repos/active/ghl-agency-ai/docs/TROUBLESHOOTING.md)

---

## Additional Resources

- **User Guide**: [USER_GUIDE.md](/root/github-repos/active/ghl-agency-ai/docs/USER_GUIDE.md)
- **Agent Dashboard Guide**: [AGENT_DASHBOARD_USER_GUIDE.md](/root/github-repos/active/ghl-agency-ai/docs/AGENT_DASHBOARD_USER_GUIDE.md)
- **API Documentation**: [API_REFERENCE.md](/root/github-repos/active/ghl-agency-ai/docs/API_REFERENCE.md)
- **Video Tutorials**: Coming soon
- **Community Forum**: Coming soon

---

**Happy Automating!**

For support: support@bottleneckbots.com
Documentation: https://docs.bottleneckbots.com
