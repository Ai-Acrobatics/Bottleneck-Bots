# User Experience Stories: GoHighLevel Automation

**Document ID**: UXS-002
**Feature Area**: GoHighLevel (GHL) Automation
**Version**: 1.0
**Created**: January 2026
**Last Updated**: January 2026
**Status**: Active
**Author**: QA Engineering Team

---

## Document Purpose

This document contains comprehensive User Experience (UX) Stories for validating the GoHighLevel automation capabilities within Bottleneck-Bots. Each story represents a complete user journey and serves as the foundation for acceptance testing, QA validation, and continuous quality assurance.

---

## Table of Contents

1. [UXS-002-01: Contact Creation via Natural Language](#uxs-002-01-contact-creation-via-natural-language)
2. [UXS-002-02: Automated Workflow Building](#uxs-002-02-automated-workflow-building)
3. [UXS-002-03: Funnel Creation and Configuration](#uxs-002-03-funnel-creation-and-configuration)
4. [UXS-002-04: Email Campaign Launch](#uxs-002-04-email-campaign-launch)
5. [UXS-002-05: SMS Campaign Automation](#uxs-002-05-sms-campaign-automation)
6. [UXS-002-06: Pipeline and Deal Management](#uxs-002-06-pipeline-and-deal-management)
7. [UXS-002-07: Form Creation and Integration](#uxs-002-07-form-creation-and-integration)
8. [UXS-002-08: Bulk Contact Import and Batch Processing](#uxs-002-08-bulk-contact-import-and-batch-processing)
9. [UXS-002-09: GHL Authentication and Session Management](#uxs-002-09-ghl-authentication-and-session-management)
10. [UXS-002-10: Multi-Step Workflow Orchestration](#uxs-002-10-multi-step-workflow-orchestration)

---

## UXS-002-01: Contact Creation via Natural Language

### Story ID
`UXS-002-01`

### Title
Creating and Managing Contacts Through Conversational AI Commands

### Persona
**Marketing Agency Owner - "Sarah"**
- 42 years old, runs a boutique marketing agency with 5 team members
- Manages 15-20 client accounts simultaneously
- Has moderate technical skills but prefers efficiency over manual data entry
- Time-constrained, often works from mobile devices
- Uses GHL daily for client contact management

### Scenario
Sarah just finished a networking event where she collected 8 new lead business cards. She needs to quickly add these contacts to GoHighLevel with proper tagging and source attribution. Rather than manually navigating through GHL's interface for each contact, she wants to use Bottleneck-Bots' natural language interface to streamline the process.

### User Goal
Add multiple new contacts to GoHighLevel quickly using plain English commands, with automatic field population, tagging, and proper source tracking, without navigating through multiple screens manually.

### Preconditions
1. User has an active Bottleneck-Bots subscription (Growth tier or higher)
2. GHL OAuth integration is successfully connected and authorized
3. User has valid GHL credentials with "Contacts" module access
4. The target GHL location is selected and accessible
5. Browser agent is available with sufficient execution credits
6. Required tags exist in GHL or user has permission to create new tags

### Step-by-Step User Journey

| Step | User Action | System Response | Expected UI State |
|------|-------------|-----------------|-------------------|
| 1 | User navigates to Agent Dashboard | Dashboard loads with "New Task" tab active | Task input field visible, execution status shows "Ready" |
| 2 | User types: "Add a new contact to GHL: John Smith, john.smith@techcorp.com, (555) 234-5678, tag him as 'Networking Event' and 'Qualified Lead', source is 'Business Card'" | System displays task parsing indicator | Thinking panel shows "Analyzing task requirements..." |
| 3 | System parses natural language input | Agent displays interpreted task breakdown | Shows: "Creating contact: John Smith, Email: john.smith@techcorp.com, Phone: (555) 234-5678, Tags: Networking Event, Qualified Lead, Source: Business Card" |
| 4 | User clicks "Execute" button | Browser session initiates | Status changes to "Planning", browser preview shows loading |
| 5 | Agent navigates to GHL Contacts | Browser shows GHL login/contacts page | Execution log: "Navigating to app.gohighlevel.com" |
| 6 | Agent clicks "Add Contact" button | Contact form opens in GHL | Browser preview shows empty contact form |
| 7 | Agent fills First Name field | "John" typed into field | Execution log: "Filling First Name: John" |
| 8 | Agent fills Last Name field | "Smith" typed into field | Execution log: "Filling Last Name: Smith" |
| 9 | Agent fills Email field | Email address entered | Execution log: "Filling Email: john.smith@techcorp.com" |
| 10 | Agent fills Phone field | Phone number entered | Execution log: "Filling Phone: (555) 234-5678" |
| 11 | Agent adds tags | Tags selected/created | Execution log: "Adding tags: Networking Event, Qualified Lead" |
| 12 | Agent selects source | Source dropdown populated | Execution log: "Setting source: Business Card" |
| 13 | Agent clicks Save | Contact saved in GHL | Browser shows contact detail page |
| 14 | Task completes | Success confirmation displayed | Status: "Completed", shows contact ID, green checkmark |

### Expected Outcomes
1. Contact "John Smith" successfully created in GHL with all specified fields
2. Both tags ("Networking Event", "Qualified Lead") attached to contact
3. Source correctly set to "Business Card"
4. Contact appears in GHL contact list and is searchable
5. Execution log shows complete audit trail
6. Task execution time under 2 minutes
7. User credits decremented appropriately

### Acceptance Criteria

```gherkin
Feature: Contact Creation via Natural Language

  Scenario: Successfully create a contact with full details
    Given I am logged into Bottleneck-Bots with an active subscription
    And my GHL integration is connected and authorized
    And I have at least 1 execution credit available
    When I enter the task "Add a new contact to GHL: John Smith, john.smith@techcorp.com, (555) 234-5678, tag him as 'Networking Event' and 'Qualified Lead', source is 'Business Card'"
    And I click the Execute button
    Then the agent should navigate to GHL Contacts
    And the agent should fill all contact fields correctly
    And the agent should add both specified tags
    And the agent should set the source to "Business Card"
    And the contact should be saved successfully
    And I should see a completion message with the contact ID
    And the execution should complete within 120 seconds

  Scenario: Create contact with minimal information
    Given I am logged into Bottleneck-Bots
    And my GHL integration is connected
    When I enter "Create contact: jane@example.com"
    And I execute the task
    Then the contact should be created with email only
    And first name should be derived or left blank
    And the task should complete successfully

  Scenario: Handle existing contact email conflict
    Given a contact with email "john.smith@techcorp.com" already exists in GHL
    When I attempt to create a contact with the same email
    Then the agent should detect the duplicate
    And display an appropriate warning message
    And offer to update the existing contact instead
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Email already exists in GHL | Agent detects duplicate, offers to update existing or abort |
| Tag does not exist | Agent creates new tag if user has permission, otherwise reports error |
| Invalid phone format | Agent normalizes phone format or reports validation error |
| GHL session timeout during operation | Agent re-authenticates and resumes task |
| Network interruption | Agent retries with exponential backoff, max 3 attempts |
| Special characters in name | Agent properly escapes special characters |
| Missing required field in user input | Agent prompts user for missing information before execution |
| Rate limiting by GHL | Agent implements wait and retry logic |

### Test Data Requirements

```json
{
  "validContacts": [
    {
      "firstName": "John",
      "lastName": "Smith",
      "email": "john.smith@techcorp.com",
      "phone": "(555) 234-5678",
      "tags": ["Networking Event", "Qualified Lead"],
      "source": "Business Card"
    },
    {
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane.doe@startup.io",
      "phone": "+1-555-987-6543",
      "tags": ["Cold Outreach"],
      "source": "Website"
    }
  ],
  "edgeCaseEmails": [
    "test+special@example.com",
    "name.with.dots@domain.co.uk",
    "UPPERCASE@EMAIL.COM"
  ],
  "specialCharacterNames": [
    "O'Brien",
    "Mary-Jane",
    "Jose Luis Garcia-Martinez"
  ],
  "invalidInputs": [
    "notanemail",
    "555-CALL-NOW",
    ""
  ]
}
```

### Priority
**P0** - Critical path functionality; core feature for MVP

---

## UXS-002-02: Automated Workflow Building

### Story ID
`UXS-002-02`

### Title
Creating Automated Workflows with Triggers and Actions via Natural Language

### Persona
**Digital Marketing Manager - "Marcus"**
- 35 years old, works at a mid-size real estate agency
- Responsible for lead nurturing and follow-up automation
- Comfortable with marketing automation concepts but not coding
- Spends 3-4 hours weekly manually setting up workflows in GHL
- Wants to reduce workflow creation time by 75%

### Scenario
Marcus needs to create a lead nurturing workflow for new real estate inquiries. When a contact is tagged as "New Inquiry", the workflow should: (1) wait 5 minutes, (2) send a welcome email, (3) wait 24 hours, (4) send a follow-up SMS, (5) create a task for the assigned agent to call. He wants to describe this in plain English rather than clicking through GHL's workflow builder.

### User Goal
Create a complete multi-step automation workflow in GHL by describing the desired automation flow in natural language, with the AI agent handling all the complex configuration steps.

### Preconditions
1. User has Bottleneck-Bots subscription with workflow automation access
2. GHL integration connected with Workflow/Automation permissions
3. Email and SMS templates exist in GHL (or will be created inline)
4. User has admin-level access to GHL location
5. The tag "New Inquiry" exists in GHL
6. SMS sending is enabled and compliant in the GHL account

### Step-by-Step User Journey

| Step | User Action | System Response | Expected UI State |
|------|-------------|-----------------|-------------------|
| 1 | User opens Agent Dashboard | Dashboard ready | Task input active |
| 2 | User types: "Create a workflow called 'New Lead Nurture' that triggers when a contact gets the 'New Inquiry' tag. First wait 5 minutes, then send the 'Welcome Email' template, wait 24 hours, send an SMS saying 'Hi {{first_name}}, thanks for your inquiry! Our team will call you soon.', then create a task for the contact owner to 'Call new lead'" | Task analyzed | Planning indicator shows multi-step workflow detection |
| 3 | Agent shows workflow plan | Visual workflow preview | Shows: Trigger -> Wait -> Email -> Wait -> SMS -> Task |
| 4 | User confirms "Execute" | Browser automation begins | Status: "Creating workflow" |
| 5 | Agent navigates to Automations > Workflows | GHL Workflows page loads | Browser shows workflow list |
| 6 | Agent clicks "Create Workflow" | Workflow builder opens | New blank workflow canvas |
| 7 | Agent names workflow | "New Lead Nurture" entered | Workflow header shows name |
| 8 | Agent configures trigger | Tag trigger selected | Trigger set to "Contact Tag Added: New Inquiry" |
| 9 | Agent adds Wait step (5 min) | Wait action added | First step shows 5-minute delay |
| 10 | Agent adds Send Email action | Email action configured | "Welcome Email" template selected |
| 11 | Agent adds Wait step (24 hours) | Second wait added | Shows 24-hour delay |
| 12 | Agent adds Send SMS action | SMS action added | Message template with merge field configured |
| 13 | Agent adds Create Task action | Task action configured | Task "Call new lead" for contact owner |
| 14 | Agent activates workflow | Workflow goes live | Status shows "Active" |
| 15 | Task completes | Success summary displayed | Workflow ID shown, all steps confirmed |

### Expected Outcomes
1. Workflow "New Lead Nurture" created and active in GHL
2. Trigger correctly configured for "New Inquiry" tag addition
3. All 5 steps (2 waits, 1 email, 1 SMS, 1 task) properly sequenced
4. Email step linked to existing "Welcome Email" template
5. SMS contains proper merge field for personalization
6. Task assigned to contact owner with correct description
7. Workflow appears in GHL automation list
8. Execution completes within 3 minutes

### Acceptance Criteria

```gherkin
Feature: Automated Workflow Building

  Scenario: Create multi-step nurture workflow
    Given I am authenticated with workflow permissions in GHL
    And the "Welcome Email" template exists
    And the "New Inquiry" tag exists
    When I describe a 5-step workflow with waits, email, SMS, and task
    And I execute the automation
    Then a new workflow should be created in GHL
    And the workflow should have exactly 5 steps
    And each step should be correctly configured
    And the workflow should be set to "Active" status
    And I should receive confirmation with the workflow ID

  Scenario: Handle missing email template
    Given the specified email template does not exist
    When I try to create a workflow referencing that template
    Then the agent should notify me the template is missing
    And offer to create a new template or select an existing one

  Scenario: Validate SMS compliance
    Given SMS is not enabled for the GHL location
    When I try to create a workflow with SMS actions
    Then the agent should detect the SMS capability issue
    And suggest alternative actions or skip the SMS step
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Email template not found | Agent searches for similar templates, prompts user to select or create |
| Trigger tag doesn't exist | Agent creates tag or prompts for correct tag name |
| Workflow name already exists | Agent appends unique identifier or prompts for new name |
| Too many workflow steps (GHL limit) | Agent warns about limit, suggests splitting workflow |
| Invalid wait duration format | Agent normalizes (e.g., "a day" to 24 hours) |
| SMS without opt-in compliance | Agent adds compliance check step or warns user |
| Complex conditional logic requested | Agent breaks down into simpler If/Else branches |

### Test Data Requirements

```json
{
  "workflowTemplates": [
    {
      "name": "New Lead Nurture",
      "trigger": "tag_added",
      "triggerValue": "New Inquiry",
      "steps": [
        {"type": "wait", "duration": "5 minutes"},
        {"type": "email", "template": "Welcome Email"},
        {"type": "wait", "duration": "24 hours"},
        {"type": "sms", "message": "Hi {{first_name}}, thanks for your inquiry!"},
        {"type": "task", "description": "Call new lead", "assignTo": "contact_owner"}
      ]
    }
  ],
  "existingTemplates": ["Welcome Email", "Follow Up", "Thank You"],
  "existingTags": ["New Inquiry", "Qualified", "Hot Lead", "Cold"],
  "invalidDurations": ["tomorrow", "next week", "asap", "-5 minutes"]
}
```

### Priority
**P0** - Core automation feature; primary value proposition

---

## UXS-002-03: Funnel Creation and Configuration

### Story ID
`UXS-002-03`

### Title
Building Multi-Page Sales Funnels Through AI-Assisted Automation

### Persona
**Freelance Marketing Consultant - "Elena"**
- 29 years old, specializes in lead generation for coaches and consultants
- Manages funnel creation for 8-10 clients per month
- Expert in marketing strategy but finds funnel building tedious
- Values speed and consistency across client projects
- Typically spends 4-6 hours per funnel setup

### Scenario
Elena needs to create a webinar registration funnel for a coaching client. The funnel requires: (1) Landing page with webinar details and registration form, (2) Thank you page with calendar add link, (3) Webinar replay page. She wants to specify the structure and content, and have the AI agent build it in GHL.

### User Goal
Create a complete multi-page funnel in GHL by describing the funnel structure, page types, and key content elements, reducing funnel creation time from hours to minutes.

### Preconditions
1. User has Bottleneck-Bots subscription with funnel creation access
2. GHL integration connected with Sites/Funnels permissions
3. User has GHL sub-account with funnel builder access
4. Domain or subdomain configured in GHL for funnel hosting
5. Webinar platform integration (optional) for calendar links
6. Basic content/copy available for pages

### Step-by-Step User Journey

| Step | User Action | System Response | Expected UI State |
|------|-------------|-----------------|-------------------|
| 1 | User enters task: "Create a webinar funnel called 'Coaching Mastery Webinar' with 3 pages: (1) Registration landing page with headline 'Transform Your Coaching Business in 90 Days', subheadline 'Free Live Training - Limited Spots', registration form with name, email, phone, and a big red 'Reserve My Spot' button. (2) Thank you page with headline 'You're Registered!' and calendar download button. (3) Replay page with embedded video placeholder and CTA to book a call." | Task parsed and analyzed | Shows funnel structure preview with 3 pages |
| 2 | User reviews funnel plan | Visual page layout shown | Page thumbnails: Landing, Thank You, Replay |
| 3 | User clicks "Execute" | Browser automation starts | Status: "Building funnel" |
| 4 | Agent navigates to Sites > Funnels | GHL funnels page loads | Funnel list visible |
| 5 | Agent clicks "Create Funnel" | Funnel creation dialog opens | Template selection screen |
| 6 | Agent selects "Start from Scratch" | Blank funnel created | Funnel builder opens |
| 7 | Agent names funnel | "Coaching Mastery Webinar" entered | Funnel name saved |
| 8 | Agent adds landing page | Page editor opens | Blank page canvas |
| 9 | Agent adds headline section | Headline component added | "Transform Your Coaching Business in 90 Days" |
| 10 | Agent adds subheadline | Subheadline added | "Free Live Training - Limited Spots" |
| 11 | Agent adds form | Form with 3 fields created | Name, Email, Phone fields |
| 12 | Agent adds CTA button | Red button added | "Reserve My Spot" button styled |
| 13 | Agent saves and creates Thank You page | Second page created | Thank You page structure |
| 14 | Agent configures Thank You page | Content added | "You're Registered!" headline, calendar button |
| 15 | Agent creates Replay page | Third page created | Video placeholder, CTA button |
| 16 | Agent publishes funnel | Funnel goes live | Published URL generated |
| 17 | Task completes | Success with funnel URL | Shows live funnel link |

### Expected Outcomes
1. Funnel "Coaching Mastery Webinar" created with 3 pages
2. Landing page contains all specified elements with correct styling
3. Registration form captures name, email, and phone
4. Form submission triggers workflow (if configured)
5. Thank you page displays confirmation content
6. Replay page includes video section and CTA
7. All pages are mobile-responsive
8. Funnel is published and accessible via URL
9. Creation time under 5 minutes

### Acceptance Criteria

```gherkin
Feature: Funnel Creation and Configuration

  Scenario: Create webinar registration funnel
    Given I am authenticated with funnel creation permissions
    And I have a valid domain configured in GHL
    When I describe a 3-page webinar funnel with specific content
    And I execute the funnel creation task
    Then a new funnel should be created in GHL
    And the funnel should contain exactly 3 pages
    And the landing page should have the specified headline and form
    And the thank you page should have confirmation content
    And the replay page should have video placeholder and CTA
    And the funnel should be published with a live URL

  Scenario: Create funnel from template
    Given I request "Create a funnel using the Real Estate template"
    When I execute the task
    Then the agent should navigate to template selection
    And select the Real Estate template
    And customize it according to my specifications

  Scenario: Handle form submission workflow
    Given I specify "when someone registers, add them to the Webinar Registered tag"
    When the funnel is created
    Then the form should be configured to trigger a workflow
    And the workflow should add the specified tag
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| No domain configured | Agent warns user and provides setup instructions |
| Template not found | Agent suggests similar templates or creates from scratch |
| Page editor iframe issues | Agent uses alternative navigation methods |
| Image upload requested | Agent uses stock images or placeholder, notes for user |
| Custom CSS/JS requested | Agent adds to page settings if permissions allow |
| Funnel name already exists | Agent appends unique suffix |
| GHL page builder version mismatch | Agent adapts to available builder version |
| Form field limit exceeded | Agent prioritizes essential fields, notifies user |

### Test Data Requirements

```json
{
  "funnelSpecs": [
    {
      "name": "Coaching Mastery Webinar",
      "type": "webinar_registration",
      "pages": [
        {
          "type": "landing",
          "headline": "Transform Your Coaching Business in 90 Days",
          "subheadline": "Free Live Training - Limited Spots",
          "form": {
            "fields": ["name", "email", "phone"],
            "buttonText": "Reserve My Spot",
            "buttonColor": "#FF0000"
          }
        },
        {
          "type": "thank_you",
          "headline": "You're Registered!",
          "elements": ["calendar_button"]
        },
        {
          "type": "replay",
          "elements": ["video_embed", "cta_button"]
        }
      ]
    }
  ],
  "templates": ["Real Estate", "Coaching", "Agency", "E-commerce"],
  "domains": ["funnels.clientdomain.com", "offers.agencysite.com"]
}
```

### Priority
**P1** - High-value feature; significant time savings for users

---

## UXS-002-04: Email Campaign Launch

### Story ID
`UXS-002-04`

### Title
Creating and Launching Email Campaigns via Conversational Commands

### Persona
**Small Business Owner - "David"**
- 45 years old, owns a local fitness studio with 500+ members
- Limited marketing experience, relies on templates and guidance
- Sends monthly newsletters and promotional emails
- Prefers simple, guided processes over complex interfaces
- Values deliverability and professional appearance

### Scenario
David wants to send a promotional email campaign announcing a new class schedule and early bird pricing. He has a list of active members tagged as "Active Member" in GHL. He wants to describe the email and have the AI handle template selection, personalization, and sending.

### User Goal
Create and send a targeted email campaign by describing the email content, audience, and timing in natural language, without manually navigating through email builder interfaces.

### Preconditions
1. User has Bottleneck-Bots subscription with email campaign access
2. GHL integration connected with Marketing/Email permissions
3. Sender email and domain verified in GHL
4. Recipient list exists (contacts tagged as "Active Member")
5. Email sending limits not exceeded
6. Unsubscribe handling configured in GHL

### Step-by-Step User Journey

| Step | User Action | System Response | Expected UI State |
|------|-------------|-----------------|-------------------|
| 1 | User enters: "Send an email campaign to all contacts tagged 'Active Member'. Subject: 'New Classes Starting Next Week! Early Bird Special Inside'. Email body: 'Hi {{first_name}}, We're excited to announce our new class schedule starting Monday! Sign up by Friday to get 20% off your first month. See you in the studio! - Team FitLife'. Send it now." | Task analyzed | Shows email preview with personalization |
| 2 | Agent displays campaign preview | Email draft shown | Subject, body, audience count displayed |
| 3 | User confirms sending | Browser automation begins | Status: "Creating campaign" |
| 4 | Agent navigates to Marketing > Email | GHL email marketing page loads | Campaign list visible |
| 5 | Agent clicks "Create Campaign" | Campaign builder opens | Template selection |
| 6 | Agent selects simple template | Template applied | Basic layout ready |
| 7 | Agent enters subject line | Subject populated | "New Classes Starting Next Week!" |
| 8 | Agent enters email body | Content added | Body with merge field |
| 9 | Agent configures sender info | From name/email set | Studio name and verified email |
| 10 | Agent selects recipients | Audience configured | "Active Member" tag selected |
| 11 | Agent shows recipient count | Count displayed | e.g., "487 recipients" |
| 12 | Agent initiates send | Campaign queued | Sending status shown |
| 13 | Task completes | Success with stats | "Campaign sent to 487 contacts" |

### Expected Outcomes
1. Email campaign created with correct subject and body
2. Personalization ({{first_name}}) properly configured
3. Audience correctly filtered by "Active Member" tag
4. Campaign sent immediately as requested
5. Delivery metrics begin populating
6. Unsubscribe link automatically included
7. Campaign appears in sent campaigns list
8. Execution completes within 2 minutes (excluding actual email delivery)

### Acceptance Criteria

```gherkin
Feature: Email Campaign Launch

  Scenario: Send immediate email campaign to tagged contacts
    Given I am authenticated with email marketing permissions
    And there are 487 contacts tagged "Active Member"
    And my sender email is verified
    When I describe an email campaign with subject, body, and audience
    And I request immediate sending
    Then the campaign should be created in GHL
    And the subject and body should match my description
    And personalization merge fields should work correctly
    And the campaign should be sent to all matching contacts
    And I should receive confirmation with recipient count

  Scenario: Schedule email for future sending
    Given I describe an email campaign
    And I specify "send this Tuesday at 9am"
    When I execute the task
    Then the campaign should be scheduled for the specified time
    And I should see the scheduled send time in confirmation

  Scenario: Handle empty audience
    Given I specify an audience tag that has no contacts
    When I try to send the campaign
    Then the agent should warn me about empty audience
    And prevent sending to avoid wasted execution
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Audience tag has 0 contacts | Agent warns user, aborts campaign |
| Sender email not verified | Agent alerts user, provides verification steps |
| Daily sending limit reached | Agent informs of limit, suggests scheduling |
| Merge field has missing data | Agent uses fallback (e.g., "there" instead of first name) |
| HTML formatting requested | Agent applies formatting within template constraints |
| Attachment requested | Agent informs of GHL limitations, suggests link instead |
| Scheduling time in past | Agent adjusts to immediate send or next valid time |
| Campaign name conflicts | Agent appends timestamp to name |

### Test Data Requirements

```json
{
  "emailCampaigns": [
    {
      "name": "New Classes Announcement",
      "subject": "New Classes Starting Next Week! Early Bird Special Inside",
      "body": "Hi {{first_name}}, We're excited to announce our new class schedule...",
      "audience": {"tag": "Active Member"},
      "sendTime": "immediate",
      "sender": {
        "name": "Team FitLife",
        "email": "studio@fitlife.com"
      }
    }
  ],
  "audienceTags": ["Active Member", "VIP Member", "Trial User", "Inactive"],
  "audienceCounts": {
    "Active Member": 487,
    "VIP Member": 52,
    "Trial User": 128,
    "Inactive": 234
  },
  "templates": ["Simple Text", "Newsletter", "Promotional", "Announcement"]
}
```

### Priority
**P0** - Core marketing automation feature

---

## UXS-002-05: SMS Campaign Automation

### Story ID
`UXS-002-05`

### Title
Launching Targeted SMS Campaigns with Compliance Handling

### Persona
**Medical Spa Manager - "Lisa"**
- 38 years old, manages a high-end medical spa
- Uses SMS for appointment reminders and flash sales
- Very conscious of compliance (TCPA, opt-in requirements)
- Has ~2,000 contacts with SMS consent
- Values high open rates and immediate engagement

### Scenario
Lisa wants to send a flash sale SMS to clients who have booked appointments in the last 90 days. The message needs to be short, compelling, and include an opt-out instruction. She wants to target "Recent Clients" tag and send immediately.

### User Goal
Create and send a compliant SMS campaign to a targeted audience segment, with proper opt-out handling and character count optimization.

### Preconditions
1. User has Bottleneck-Bots subscription with SMS campaign access
2. GHL integration connected with SMS/Marketing permissions
3. Phone number(s) registered and SMS-enabled in GHL
4. Recipients have SMS opt-in consent recorded
5. Contacts exist with "Recent Clients" tag
6. SMS sending credits available in GHL

### Step-by-Step User Journey

| Step | User Action | System Response | Expected UI State |
|------|-------------|-----------------|-------------------|
| 1 | User enters: "Send an SMS to everyone tagged 'Recent Clients' with message: '{{first_name}}, flash sale TODAY! 25% off all skincare treatments. Book now: [booking link]. Reply STOP to opt out.' Send immediately." | Task analyzed | SMS preview with character count |
| 2 | Agent shows message preview | Character count, segment count | "143 characters (1 segment)" |
| 3 | Agent displays audience info | Recipient count shown | "Sending to 847 contacts" |
| 4 | User confirms send | Browser automation starts | Status: "Creating SMS campaign" |
| 5 | Agent navigates to Marketing > SMS | GHL SMS page loads | SMS campaign list |
| 6 | Agent clicks "Create Campaign" | SMS composer opens | Message input visible |
| 7 | Agent enters message | Text populated | Message with merge field |
| 8 | Agent verifies opt-out included | Compliance check passed | "STOP" instruction detected |
| 9 | Agent selects sender phone | Phone number chosen | Registered number selected |
| 10 | Agent configures audience | Tag filter applied | "Recent Clients" selected |
| 11 | Agent initiates send | Campaign queued | Sending in progress |
| 12 | Task completes | Success summary | "SMS sent to 847 contacts" |

### Expected Outcomes
1. SMS campaign created and sent to tagged audience
2. Message under 160 characters (or appropriate segmentation noted)
3. Opt-out instruction included (STOP)
4. Personalization ({{first_name}}) works correctly
5. Compliant sender phone number used
6. Delivery started immediately
7. Campaign logged in SMS campaign history
8. Execution completes within 1 minute

### Acceptance Criteria

```gherkin
Feature: SMS Campaign Automation

  Scenario: Send compliant SMS campaign to tagged contacts
    Given I am authenticated with SMS permissions
    And I have 847 contacts tagged "Recent Clients" with SMS consent
    And my SMS phone number is registered
    When I describe an SMS message with opt-out instruction
    And I request immediate sending
    Then the campaign should be created in GHL
    And the message should include "STOP" opt-out text
    And the campaign should send to all consented contacts
    And I should receive confirmation with send count

  Scenario: Warn about missing opt-out instruction
    Given I describe an SMS without opt-out instruction
    When I try to create the campaign
    Then the agent should warn about compliance requirements
    And suggest adding "Reply STOP to opt out"
    And pause for confirmation before proceeding

  Scenario: Handle message length over 160 characters
    Given my message is 180 characters
    When I preview the campaign
    Then I should see "2 segments" warning
    And be informed of potential cost implications
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| No opt-out instruction in message | Agent warns and suggests adding one |
| Message exceeds 160 characters | Agent shows segment count, warns of cost |
| No SMS-enabled phone number | Agent alerts user to configure phone |
| Contacts without SMS consent | Agent filters to consented contacts only |
| Link in message (short vs long) | Agent uses short link or warns about length |
| Special characters affecting encoding | Agent warns if message will use more segments |
| Time zone considerations | Agent notes delivery time for recipients |
| Reply handling not configured | Agent suggests setting up reply automation |

### Test Data Requirements

```json
{
  "smsCampaigns": [
    {
      "name": "Flash Sale SMS",
      "message": "{{first_name}}, flash sale TODAY! 25% off all skincare treatments. Book now: [link]. Reply STOP to opt out.",
      "audience": {"tag": "Recent Clients"},
      "sendTime": "immediate",
      "senderPhone": "+1-555-SPA-1234"
    }
  ],
  "characterLimits": {
    "singleSegment": 160,
    "withMergeField": 140,
    "unicode": 70
  },
  "complianceKeywords": ["STOP", "OPTOUT", "UNSUBSCRIBE", "CANCEL"],
  "audienceCounts": {
    "Recent Clients": 847,
    "VIP Clients": 156,
    "New Leads": 423
  }
}
```

### Priority
**P1** - Important marketing channel with compliance requirements

---

## UXS-002-06: Pipeline and Deal Management

### Story ID
`UXS-002-06`

### Title
Creating Sales Pipelines and Managing Opportunities via Natural Language

### Persona
**Sales Director - "Michael"**
- 48 years old, manages a B2B software sales team
- Tracks deals through multi-stage sales process
- Needs visibility into pipeline value and stage progression
- Spends significant time updating deal stages manually
- Values forecasting and reporting capabilities

### Scenario
Michael needs to set up a new sales pipeline for enterprise deals and then create several opportunities from recent demo calls. The pipeline should have stages: Qualified Lead, Discovery Call, Proposal Sent, Negotiation, Closed Won, Closed Lost. He wants to create the pipeline and add 3 initial opportunities.

### User Goal
Create a complete sales pipeline with custom stages, then add and manage opportunities through natural language commands, enabling faster pipeline management.

### Preconditions
1. User has Bottleneck-Bots subscription with CRM/Pipeline access
2. GHL integration connected with Opportunities permissions
3. Contacts exist for opportunity assignment
4. User has permission to create pipelines in GHL
5. Currency and deal value format configured

### Step-by-Step User Journey

| Step | User Action | System Response | Expected UI State |
|------|-------------|-----------------|-------------------|
| 1 | User enters: "Create a pipeline called 'Enterprise Deals' with stages: Qualified Lead, Discovery Call, Proposal Sent, Negotiation, Closed Won, Closed Lost" | Task analyzed | Pipeline structure preview |
| 2 | User confirms pipeline creation | Browser automation begins | Status: "Creating pipeline" |
| 3 | Agent navigates to Opportunities | GHL opportunities page | Pipeline list visible |
| 4 | Agent clicks "Create Pipeline" | Pipeline dialog opens | Stage configuration |
| 5 | Agent enters pipeline name | "Enterprise Deals" entered | Name saved |
| 6 | Agent adds all 6 stages | Stages created in order | All stages visible |
| 7 | Agent saves pipeline | Pipeline created | Success confirmation |
| 8 | User continues: "Add opportunity 'Acme Corp Deal' for contact john@acme.com, value $50,000, stage 'Discovery Call' in the Enterprise Deals pipeline" | Task analyzed | Opportunity preview shown |
| 9 | Agent navigates to create opportunity | Opportunity form opens | Empty form |
| 10 | Agent fills opportunity details | All fields populated | Name, value, stage, contact |
| 11 | Agent saves opportunity | Opportunity created | Shows in pipeline view |
| 12 | Task completes | Success summary | Pipeline and opportunity confirmed |

### Expected Outcomes
1. Pipeline "Enterprise Deals" created with 6 stages in correct order
2. Stages arranged: Qualified Lead -> Discovery Call -> Proposal Sent -> Negotiation -> Closed Won -> Closed Lost
3. Opportunity "Acme Corp Deal" created and linked to contact
4. Opportunity value shows $50,000
5. Opportunity placed in "Discovery Call" stage
6. Pipeline visible in GHL opportunities module
7. Opportunity appears on pipeline board
8. Execution completes within 3 minutes

### Acceptance Criteria

```gherkin
Feature: Pipeline and Deal Management

  Scenario: Create sales pipeline with custom stages
    Given I am authenticated with pipeline creation permissions
    When I describe a pipeline with 6 stages
    And I execute the creation task
    Then a new pipeline should be created in GHL
    And all 6 stages should be present in correct order
    And the pipeline should appear in the opportunities module

  Scenario: Create opportunity in specific pipeline stage
    Given the "Enterprise Deals" pipeline exists
    And a contact with email john@acme.com exists
    When I describe an opportunity with contact, value, and stage
    Then the opportunity should be created
    And linked to the correct contact
    And placed in the specified stage
    And show the correct monetary value

  Scenario: Move opportunity between stages
    Given an opportunity exists in "Discovery Call" stage
    When I say "Move Acme Corp Deal to Proposal Sent stage"
    Then the opportunity should move to the new stage
    And the stage change should be logged
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Pipeline name already exists | Agent appends suffix or prompts for new name |
| Stage name too long | Agent truncates or suggests shorter name |
| Contact not found for opportunity | Agent searches for similar contacts, prompts user |
| Invalid deal value format | Agent normalizes ($50k -> $50,000) |
| Closed Won/Lost stages missing | Agent warns these are recommended |
| Opportunity without contact | Agent creates opportunity unassigned, warns user |
| Currency mismatch | Agent uses account default currency |
| Stage doesn't exist in pipeline | Agent adds stage or prompts for correction |

### Test Data Requirements

```json
{
  "pipelines": [
    {
      "name": "Enterprise Deals",
      "stages": [
        "Qualified Lead",
        "Discovery Call",
        "Proposal Sent",
        "Negotiation",
        "Closed Won",
        "Closed Lost"
      ]
    }
  ],
  "opportunities": [
    {
      "name": "Acme Corp Deal",
      "contactEmail": "john@acme.com",
      "value": 50000,
      "currency": "USD",
      "stage": "Discovery Call",
      "pipeline": "Enterprise Deals"
    },
    {
      "name": "TechStart Partnership",
      "contactEmail": "sarah@techstart.io",
      "value": 25000,
      "stage": "Proposal Sent"
    }
  ],
  "contacts": [
    {"email": "john@acme.com", "name": "John Adams"},
    {"email": "sarah@techstart.io", "name": "Sarah Chen"}
  ]
}
```

### Priority
**P1** - Essential for sales-focused users

---

## UXS-002-07: Form Creation and Integration

### Story ID
`UXS-002-07`

### Title
Building Custom Forms with Workflow Integration

### Persona
**Events Coordinator - "Rachel"**
- 32 years old, organizes corporate events and conferences
- Needs custom registration forms for each event
- Requires data capture with conditional logic
- Wants automatic follow-up workflows triggered by submissions
- Manages 20+ events per year

### Scenario
Rachel needs to create a conference registration form that captures: name, email, company, job title, dietary restrictions (dropdown), session preferences (checkboxes), and special accommodations (textarea). The form should trigger a confirmation email workflow and add registrants to a "Conference 2026" tag.

### User Goal
Create a custom form with multiple field types and configure automatic workflow triggers upon submission, all through natural language description.

### Preconditions
1. User has Bottleneck-Bots subscription with form creation access
2. GHL integration connected with Forms/Sites permissions
3. Confirmation email template exists (or will be created)
4. Workflow permissions available for trigger configuration
5. Target landing page or embed location identified

### Step-by-Step User Journey

| Step | User Action | System Response | Expected UI State |
|------|-------------|-----------------|-------------------|
| 1 | User enters: "Create a form called 'Tech Conference 2026 Registration' with fields: Full Name (required text), Email (required email), Company (text), Job Title (text), Dietary Restrictions (dropdown: None, Vegetarian, Vegan, Gluten-Free, Other), Session Preferences (checkboxes: AI Workshop, Cloud Computing, Cybersecurity, DevOps), Special Accommodations (textarea, optional). When submitted, add tag 'Conference 2026' and trigger workflow 'Conference Welcome Email'." | Task analyzed | Form structure preview with 7 fields |
| 2 | Agent displays form preview | Field list shown | All fields and types visible |
| 3 | User confirms creation | Browser automation begins | Status: "Creating form" |
| 4 | Agent navigates to Forms | GHL forms page | Form list |
| 5 | Agent clicks "Create Form" | Form builder opens | Empty form canvas |
| 6 | Agent names form | "Tech Conference 2026 Registration" | Name saved |
| 7 | Agent adds Full Name field | Text field added, required | First field visible |
| 8 | Agent adds Email field | Email field added, required | Email validation enabled |
| 9 | Agent adds Company field | Text field added | Optional field |
| 10 | Agent adds Job Title field | Text field added | Optional field |
| 11 | Agent adds Dietary dropdown | Dropdown with 5 options | Options configured |
| 12 | Agent adds Session checkboxes | Checkbox group with 4 options | Multi-select enabled |
| 13 | Agent adds Accommodations textarea | Textarea added, optional | Long-form input |
| 14 | Agent configures submission actions | Tag and workflow triggers set | Actions confirmed |
| 15 | Agent saves form | Form published | Form URL generated |
| 16 | Task completes | Success with form link | Embed code available |

### Expected Outcomes
1. Form "Tech Conference 2026 Registration" created with 7 fields
2. Required fields (Name, Email) properly validated
3. Dropdown contains all 5 dietary options
4. Checkbox group contains all 4 session options
5. Submission adds "Conference 2026" tag to contact
6. Submission triggers "Conference Welcome Email" workflow
7. Form generates embed code and direct link
8. Form is mobile-responsive
9. Execution completes within 2 minutes

### Acceptance Criteria

```gherkin
Feature: Form Creation and Integration

  Scenario: Create multi-field registration form
    Given I am authenticated with form creation permissions
    When I describe a form with 7 fields of various types
    And I specify required fields
    And I configure submission triggers
    Then the form should be created in GHL
    And all fields should match specified types
    And required fields should have validation
    And submission should trigger specified tag and workflow

  Scenario: Test form submission workflow integration
    Given a form with workflow trigger exists
    When a test submission is made
    Then the contact should be created or updated
    And the specified tag should be added
    And the workflow should be triggered

  Scenario: Handle conditional form logic
    Given I describe a form with conditional fields
    Like "Show 'Other' text field only if Dietary Restrictions = Other"
    Then the form should have conditional visibility rules
    And the hidden fields should not show until triggered
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Workflow doesn't exist | Agent warns and offers to create or skip trigger |
| Duplicate form name | Agent appends unique identifier |
| Too many fields (GHL limit) | Agent warns about limits, prioritizes fields |
| Invalid field type requested | Agent maps to closest available type |
| Custom validation rules needed | Agent applies standard validation, notes limitations |
| File upload field requested | Agent adds if supported, warns of size limits |
| Conditional logic too complex | Agent simplifies or suggests alternative approach |
| CAPTCHA requested | Agent enables if available in GHL settings |

### Test Data Requirements

```json
{
  "forms": [
    {
      "name": "Tech Conference 2026 Registration",
      "fields": [
        {"name": "Full Name", "type": "text", "required": true},
        {"name": "Email", "type": "email", "required": true},
        {"name": "Company", "type": "text", "required": false},
        {"name": "Job Title", "type": "text", "required": false},
        {
          "name": "Dietary Restrictions",
          "type": "dropdown",
          "options": ["None", "Vegetarian", "Vegan", "Gluten-Free", "Other"]
        },
        {
          "name": "Session Preferences",
          "type": "checkbox",
          "options": ["AI Workshop", "Cloud Computing", "Cybersecurity", "DevOps"]
        },
        {"name": "Special Accommodations", "type": "textarea", "required": false}
      ],
      "onSubmit": {
        "addTag": "Conference 2026",
        "triggerWorkflow": "Conference Welcome Email"
      }
    }
  ],
  "fieldTypes": ["text", "email", "phone", "textarea", "dropdown", "checkbox", "radio", "date", "file"],
  "workflows": ["Conference Welcome Email", "Lead Follow Up", "Appointment Confirmation"]
}
```

### Priority
**P1** - Core data capture functionality

---

## UXS-002-08: Bulk Contact Import and Batch Processing

### Story ID
`UXS-002-08`

### Title
Importing and Processing Large Contact Lists with Intelligent Mapping

### Persona
**CRM Administrator - "Kevin"**
- 40 years old, manages data operations for a marketing agency
- Handles regular client data migrations and imports
- Deals with CSV files from various sources with inconsistent formats
- Needs to process 1,000-50,000 contacts efficiently
- Values data accuracy and deduplication

### Scenario
Kevin received a CSV file with 5,000 contacts from a client's old CRM system. The columns are named differently than GHL fields (e.g., "First" instead of "First Name", "EmailAddress" instead of "Email"). He needs to import these contacts with proper field mapping, tag them as "Q1 Migration", and avoid creating duplicates.

### User Goal
Import a large CSV file of contacts with intelligent column mapping, duplicate handling, tagging, and progress tracking, minimizing manual data cleanup.

### Preconditions
1. User has Bottleneck-Bots subscription with bulk operations access
2. GHL integration connected with Contacts import permissions
3. CSV file accessible and properly formatted
4. Sufficient GHL contact capacity
5. Import does not exceed daily/monthly limits
6. File size under GHL maximum (typically 25MB)

### Step-by-Step User Journey

| Step | User Action | System Response | Expected UI State |
|------|-------------|-----------------|-------------------|
| 1 | User enters: "Import contacts from the CSV file at [path/URL]. Map 'First' to First Name, 'Last' to Last Name, 'EmailAddress' to Email, 'Phone Number' to Phone, 'Org' to Company. Tag all imported contacts as 'Q1 Migration'. Skip duplicates based on email." | Task analyzed | Shows mapping preview |
| 2 | Agent displays column mapping | Mapping table shown | Source -> Destination columns |
| 3 | Agent shows import preview | First 5 rows sampled | Data validation check |
| 4 | User confirms import | Browser automation begins | Status: "Importing contacts" |
| 5 | Agent navigates to Contacts | GHL contacts page | Contacts list |
| 6 | Agent clicks "Import" | Import dialog opens | File upload screen |
| 7 | Agent uploads CSV | File processed | Column headers detected |
| 8 | Agent applies column mapping | Mapping configured | All columns matched |
| 9 | Agent enables duplicate checking | Dedup by email enabled | Skip duplicates option |
| 10 | Agent adds tag to import | "Q1 Migration" selected | Tag will apply to all |
| 11 | Agent starts import | Processing begins | Progress indicator |
| 12 | Progress updates shown | Import progressing | "Processed 1,000 of 5,000" |
| 13 | Import completes | Summary displayed | Success/error counts |
| 14 | Task completes | Final report | "4,847 imported, 153 duplicates skipped" |

### Expected Outcomes
1. CSV file successfully uploaded and processed
2. All column mappings correctly applied
3. Duplicate contacts identified and skipped
4. "Q1 Migration" tag applied to all imported contacts
5. Import summary shows success/error breakdown
6. No data corruption or field mismatches
7. Contacts searchable immediately after import
8. Processing time reasonable for file size (under 10 minutes for 5,000)

### Acceptance Criteria

```gherkin
Feature: Bulk Contact Import and Batch Processing

  Scenario: Import CSV with custom column mapping
    Given I have a CSV file with 5,000 contacts
    And the columns are named differently than GHL fields
    When I describe the import with specific column mappings
    And I enable duplicate checking by email
    And I specify a tag for all imports
    Then all contacts should be imported with correct field mapping
    And duplicates should be skipped
    And the specified tag should be applied to all new contacts
    And I should receive a summary with success/error counts

  Scenario: Handle import with errors
    Given a CSV has 100 rows with invalid email formats
    When the import processes
    Then valid contacts should be imported
    And invalid rows should be logged with error details
    And the summary should clearly show error count

  Scenario: Large file import with progress tracking
    Given a CSV with 25,000 contacts
    When I start the import
    Then I should see progress updates
    And the import should complete without timeout
    And I should receive periodic status updates
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Column name not recognized | Agent suggests best match, prompts user |
| Empty required fields in CSV | Agent skips row, logs error |
| Invalid email format | Agent skips or flags row |
| Duplicate within same file | Agent imports first occurrence only |
| File too large | Agent chunks import or warns about size |
| Special characters in data | Agent handles encoding properly |
| Mixed date formats | Agent normalizes dates or flags inconsistencies |
| Network timeout during upload | Agent retries or resumes import |
| Phone number format variations | Agent normalizes to consistent format |

### Test Data Requirements

```json
{
  "csvFiles": [
    {
      "name": "q1_migration.csv",
      "rowCount": 5000,
      "columns": ["First", "Last", "EmailAddress", "Phone Number", "Org"],
      "mapping": {
        "First": "firstName",
        "Last": "lastName",
        "EmailAddress": "email",
        "Phone Number": "phone",
        "Org": "company"
      }
    }
  ],
  "columnVariations": {
    "firstName": ["First", "FirstName", "first_name", "F_Name", "Name"],
    "email": ["EmailAddress", "Email", "email_addr", "E-mail", "Contact Email"]
  },
  "duplicateScenarios": {
    "exact_email": 153,
    "similar_names": 47,
    "phone_matches": 89
  },
  "invalidData": {
    "bad_emails": ["notanemail", "missing@", "@nodomain"],
    "bad_phones": ["abc123", "555-CALL", ""]
  }
}
```

### Priority
**P0** - Critical for data migration and onboarding workflows

---

## UXS-002-09: GHL Authentication and Session Management

### Story ID
`UXS-002-09`

### Title
Secure GHL Connection, Authentication, and Session Persistence

### Persona
**Agency Operations Manager - "Patricia"**
- 55 years old, oversees agency's tool integrations
- Manages GHL access for multiple team members
- Security-conscious, concerned about credential safety
- Needs reliable connections without frequent re-authentication
- Manages multiple GHL sub-accounts

### Scenario
Patricia is setting up Bottleneck-Bots for her agency. She needs to connect their GHL account securely using OAuth, ensure the connection persists across sessions, and be able to switch between multiple client sub-accounts without re-authenticating each time.

### User Goal
Establish and maintain a secure, persistent connection to GHL that supports multiple sub-accounts and doesn't require frequent re-authentication while maintaining security best practices.

### Preconditions
1. User has Bottleneck-Bots subscription (any tier)
2. GHL agency account with OAuth application configured
3. Valid GHL credentials with appropriate permissions
4. User has admin-level access to GHL
5. Browser cookies/storage not blocked
6. Network connectivity to GHL OAuth endpoints

### Step-by-Step User Journey

| Step | User Action | System Response | Expected UI State |
|------|-------------|-----------------|-------------------|
| 1 | User navigates to Settings > Integrations | Settings page loads | Integration list visible |
| 2 | User clicks "Connect GoHighLevel" | OAuth flow initiates | GHL login page opens |
| 3 | User enters GHL credentials | GHL validates login | 2FA prompt (if enabled) |
| 4 | User completes 2FA (if required) | Authentication proceeds | Permission request screen |
| 5 | User reviews requested permissions | Permissions displayed | List of access scopes |
| 6 | User clicks "Authorize" | OAuth tokens exchanged | Redirect back to app |
| 7 | System confirms connection | Success message | "GHL Connected" status |
| 8 | System fetches sub-accounts | Account list populated | Sub-account selector |
| 9 | User selects primary sub-account | Account set as default | Selected account shown |
| 10 | User tests connection | Health check runs | "Connection Healthy" |
| 11 | Session persists | Token refreshed automatically | No re-auth needed |
| 12 | User switches sub-account | Account context changes | New account active |

### Expected Outcomes
1. OAuth 2.0 connection established with GHL
2. Access and refresh tokens securely stored
3. All requested permissions granted
4. Sub-account list populated automatically
5. Default sub-account selected and active
6. Connection persists across browser sessions
7. Automatic token refresh works transparently
8. Sub-account switching works without re-authentication
9. Connection status visible in dashboard

### Acceptance Criteria

```gherkin
Feature: GHL Authentication and Session Management

  Scenario: Complete OAuth connection flow
    Given I am on the Integrations settings page
    And I have valid GHL credentials
    When I initiate the GHL connection
    And I complete the OAuth authorization
    Then my GHL account should be connected
    And I should see a success confirmation
    And my sub-accounts should be listed

  Scenario: Maintain persistent session
    Given I have an active GHL connection
    When I close and reopen my browser
    And I return to Bottleneck-Bots
    Then my GHL connection should still be active
    And I should not need to re-authenticate

  Scenario: Handle token expiration gracefully
    Given my GHL access token has expired
    When I attempt a GHL operation
    Then the system should automatically refresh the token
    And the operation should complete successfully
    And I should not be interrupted

  Scenario: Switch between sub-accounts
    Given I have access to multiple GHL sub-accounts
    When I select a different sub-account
    Then the context should switch immediately
    And subsequent operations should use the new account
    And I should see the new account name in the header
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| OAuth flow cancelled | User returned to integrations page, no partial connection |
| Invalid GHL credentials | Clear error message, retry option |
| 2FA timeout | Session preserved, 2FA re-prompted |
| Token refresh fails | User notified, manual re-auth option |
| GHL API down | Connection status shows warning, retry later |
| Permission changes in GHL | User notified of required re-authorization |
| Multiple browser tabs | Session synchronized across tabs |
| Sub-account access revoked | User notified, removed from list |
| Rate limiting | Graceful handling with retry after delay |

### Test Data Requirements

```json
{
  "oauthScopes": [
    "contacts.readonly",
    "contacts.write",
    "workflows.readonly",
    "workflows.write",
    "campaigns.readonly",
    "campaigns.write",
    "opportunities.readonly",
    "opportunities.write",
    "calendars.readonly",
    "calendars.write"
  ],
  "subAccounts": [
    {"id": "loc_abc123", "name": "Client A - Real Estate"},
    {"id": "loc_def456", "name": "Client B - Medical Spa"},
    {"id": "loc_ghi789", "name": "Client C - Fitness Studio"}
  ],
  "tokenLifetimes": {
    "accessToken": "1 hour",
    "refreshToken": "30 days"
  },
  "errorScenarios": [
    {"code": "invalid_grant", "message": "Refresh token expired"},
    {"code": "access_denied", "message": "User revoked access"},
    {"code": "rate_limited", "message": "Too many requests"}
  ]
}
```

### Priority
**P0** - Foundation for all GHL automation features

---

## UXS-002-10: Multi-Step Workflow Orchestration

### Story ID
`UXS-002-10`

### Title
Complex Multi-Component Automation Spanning Multiple GHL Modules

### Persona
**Marketing Automation Specialist - "Alex"**
- 30 years old, expert in marketing automation
- Designs complex customer journeys
- Works with multiple GHL modules daily
- Needs to orchestrate sophisticated sequences
- Values reliability and proper error handling

### Scenario
Alex needs to set up a complete new client onboarding sequence that spans multiple GHL modules: (1) Create a pipeline for tracking onboarding progress, (2) Create a form for initial client questionnaire, (3) Create a 5-step onboarding workflow triggered by form submission, (4) Create email templates for each stage, (5) Set up an appointment calendar for kickoff calls. All components should be interconnected.

### User Goal
Execute a comprehensive automation setup that creates and connects multiple GHL components in a single orchestrated operation, ensuring all pieces work together seamlessly.

### Preconditions
1. User has Bottleneck-Bots subscription with full automation access
2. GHL integration connected with all required permissions
3. User has admin access to all GHL modules
4. Email domain verified for templates
5. Calendar functionality enabled
6. Sufficient execution credits for multi-step operation

### Step-by-Step User Journey

| Step | User Action | System Response | Expected UI State |
|------|-------------|-----------------|-------------------|
| 1 | User enters comprehensive task: "Set up complete new client onboarding system: 1) Create pipeline 'Client Onboarding' with stages: Questionnaire Submitted, Kickoff Scheduled, Kickoff Complete, Setup In Progress, Onboarding Complete. 2) Create form 'New Client Questionnaire' with fields: Company Name, Industry, Goals (textarea), Team Size (dropdown: 1-5, 6-20, 21-50, 51+). 3) Create workflow triggered by form submission that: adds tag 'Onboarding Started', sends welcome email, creates opportunity in the pipeline, waits 1 day, sends kickoff scheduling email. 4) Create email templates: 'Welcome to [Company]' and 'Schedule Your Kickoff Call'. 5) Create calendar 'Onboarding Kickoff Calls' with 60-min slots, Mon-Fri 9am-5pm." | Complex task parsed | Multi-component plan displayed |
| 2 | Agent shows execution plan | Dependency graph shown | 5 major components listed |
| 3 | Agent estimates time | "~8-10 minutes" shown | Component order displayed |
| 4 | User confirms execution | Browser automation begins | Status: "Orchestrating setup" |
| 5 | Agent creates pipeline | Pipeline with 5 stages | First component complete |
| 6 | Agent creates form | Form with 4 fields | Second component complete |
| 7 | Agent creates email templates | 2 templates created | Third component complete |
| 8 | Agent creates workflow | 5-step workflow active | Fourth component complete |
| 9 | Agent creates calendar | Calendar with settings | Fifth component complete |
| 10 | Agent verifies connections | All components linked | Integration confirmed |
| 11 | Task completes | Comprehensive summary | All components listed with IDs |

### Expected Outcomes
1. Pipeline "Client Onboarding" created with 5 stages
2. Form "New Client Questionnaire" with 4 fields, linked to workflow
3. Two email templates created and available
4. Workflow with 5 steps triggered by form submission
5. Calendar with 60-minute slots, Mon-Fri availability
6. All components reference each other correctly
7. Form submission creates opportunity in pipeline
8. Workflow uses correct email templates
9. Complete execution under 10 minutes
10. Audit log shows all created components

### Acceptance Criteria

```gherkin
Feature: Multi-Step Workflow Orchestration

  Scenario: Create interconnected onboarding system
    Given I am authenticated with full GHL permissions
    When I describe a 5-component onboarding system
    And I execute the orchestrated setup
    Then all 5 components should be created successfully
    And the pipeline should have exactly 5 stages
    And the form should have 4 fields with proper types
    And the workflow should trigger on form submission
    And the email templates should be available for workflow
    And the calendar should have correct availability
    And all components should be properly linked

  Scenario: Handle partial failure with rollback
    Given a multi-component task is executing
    When one component fails (e.g., calendar creation)
    Then previous successful components should remain
    And the failure should be clearly reported
    And I should have option to retry failed component

  Scenario: Resume interrupted orchestration
    Given a multi-component task was interrupted
    When I return to the dashboard
    Then I should see the partial completion status
    And I should be able to resume from the failed step
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Circular dependency detected | Agent reorders operations to resolve |
| Component creation fails mid-sequence | Previous components preserved, failure reported |
| Resource name conflict | Agent uses unique suffix, continues |
| Permission denied on one module | Skips that component, completes others, reports |
| Session timeout during long operation | Auto-resume from last checkpoint |
| GHL rate limiting | Implements delays between operations |
| Template reference not found | Creates referenced templates first |
| Workflow complexity exceeds limits | Splits into multiple linked workflows |

### Test Data Requirements

```json
{
  "orchestrationTasks": [
    {
      "name": "Client Onboarding System",
      "components": [
        {
          "type": "pipeline",
          "name": "Client Onboarding",
          "stages": ["Questionnaire Submitted", "Kickoff Scheduled", "Kickoff Complete", "Setup In Progress", "Onboarding Complete"]
        },
        {
          "type": "form",
          "name": "New Client Questionnaire",
          "fields": [
            {"name": "Company Name", "type": "text"},
            {"name": "Industry", "type": "text"},
            {"name": "Goals", "type": "textarea"},
            {"name": "Team Size", "type": "dropdown", "options": ["1-5", "6-20", "21-50", "51+"]}
          ]
        },
        {
          "type": "workflow",
          "name": "New Client Onboarding",
          "trigger": "form_submitted",
          "steps": 5
        },
        {
          "type": "email_template",
          "names": ["Welcome to [Company]", "Schedule Your Kickoff Call"]
        },
        {
          "type": "calendar",
          "name": "Onboarding Kickoff Calls",
          "duration": 60,
          "availability": "Mon-Fri 9am-5pm"
        }
      ],
      "dependencies": {
        "workflow": ["form", "email_template", "pipeline"],
        "form": []
      }
    }
  ],
  "checkpoints": [
    "pipeline_created",
    "form_created",
    "templates_created",
    "workflow_created",
    "calendar_created",
    "all_linked"
  ]
}
```

### Priority
**P1** - Advanced feature for power users; differentiating capability

---

## Appendix A: Test Coverage Matrix

| Story ID | Unit Tests | Integration Tests | E2E Tests | Manual QA |
|----------|------------|-------------------|-----------|-----------|
| UXS-002-01 | Yes | Yes | Yes | Yes |
| UXS-002-02 | Yes | Yes | Yes | Yes |
| UXS-002-03 | Yes | Yes | Yes | Yes |
| UXS-002-04 | Yes | Yes | Yes | Yes |
| UXS-002-05 | Yes | Yes | Yes | Yes |
| UXS-002-06 | Yes | Yes | Yes | Yes |
| UXS-002-07 | Yes | Yes | Yes | Yes |
| UXS-002-08 | Yes | Yes | Yes | Yes |
| UXS-002-09 | Yes | Yes | Yes | Yes |
| UXS-002-10 | Yes | Yes | Yes | Yes |

## Appendix B: Related Documentation

- [GHL Complete Functions Reference](/docs/GHL-Complete-Functions-Reference.md)
- [GHL Automation Tutorials](/docs/GHL_AUTOMATION_TUTORIALS.md)
- [User Flows](/docs/USER_FLOWS.md)
- [Agent Dashboard User Guide](/docs/AGENT_DASHBOARD_USER_GUIDE.md)
- [Authentication Architecture](/docs/Authentication-Architecture.md)

## Appendix C: Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | QA Engineering Team | Initial document creation |

---

**Document End**
