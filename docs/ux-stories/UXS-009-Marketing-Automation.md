# UXS-009: Marketing Automation User Experience Stories

**Module**: Marketing Automation
**Version**: 1.0
**Last Updated**: January 11, 2026
**Author**: QA Team
**Status**: Ready for Testing

---

## Table of Contents

1. [UXS-009-01: AI-Powered Campaign Creation](#uxs-009-01-ai-powered-campaign-creation)
2. [UXS-009-02: Email Sequence Setup and Management](#uxs-009-02-email-sequence-setup-and-management)
3. [UXS-009-03: SMS Campaign with Twilio Integration](#uxs-009-03-sms-campaign-with-twilio-integration)
4. [UXS-009-04: Meta Ads Creation and Optimization](#uxs-009-04-meta-ads-creation-and-optimization)
5. [UXS-009-05: Campaign Performance Analytics](#uxs-009-05-campaign-performance-analytics)
6. [UXS-009-06: AI Image Generation for Campaigns](#uxs-009-06-ai-image-generation-for-campaigns)
7. [UXS-009-07: SEO Keyword Tracking](#uxs-009-07-seo-keyword-tracking)
8. [UXS-009-08: A/B Testing Campaign Variations](#uxs-009-08-ab-testing-campaign-variations)
9. [UXS-009-09: Multi-Channel Campaign Orchestration](#uxs-009-09-multi-channel-campaign-orchestration)
10. [UXS-009-10: Campaign Template Library Management](#uxs-009-10-campaign-template-library-management)

---

## UXS-009-01: AI-Powered Campaign Creation

### Story ID
`UXS-009-01`

### Title
AI-Powered Marketing Campaign Creation from Natural Language Input

### Persona
**Sarah Chen** - Marketing Agency Owner
- Age: 38
- Role: Founder of a boutique digital marketing agency
- Technical Proficiency: Intermediate
- Primary Goal: Create client campaigns quickly without deep technical knowledge
- Pain Points: Spending too much time on campaign setup, keeping up with platform changes

### Scenario
Sarah has just onboarded a new real estate client who needs a complete lead generation campaign. The client wants to attract first-time homebuyers in the Austin, Texas area. Sarah needs to create a comprehensive campaign including landing pages, email sequences, and social media ads without spending hours on manual setup.

### User Goal
Create a complete, multi-channel marketing campaign using AI assistance within 15 minutes by simply describing the campaign objectives in natural language.

### Preconditions
- User is authenticated and has an active subscription (Growth tier or higher)
- GHL credentials are connected and verified
- OpenAI API key is configured for AI features
- User has at least 10 AI credits available
- Brand voice and preferences are configured in the knowledge base

### Step-by-Step User Journey

| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | Navigate to Marketing > Campaigns | Display campaigns dashboard with "Create Campaign" CTA | Main navigation, campaign list view |
| 2 | Click "Create with AI" button | Open AI campaign creation wizard modal | Floating modal with gradient accent |
| 3 | Enter campaign description: "Create a lead generation campaign for first-time homebuyers in Austin, TX. Focus on affordable starter homes under $400K. Target millennials and Gen Z." | Display thinking animation, show parsed objectives | Text area with character counter, AI processing indicator |
| 4 | Review AI-parsed objectives and audience segments | Display structured breakdown: Target Audience, Campaign Goals, Suggested Channels, Budget Recommendations | Expandable accordion sections |
| 5 | Adjust target demographics slider (age 25-40) | Recalculate and update audience size estimate (est. 45,000 reach) | Interactive slider with real-time preview |
| 6 | Select channels: Email, Meta Ads, Landing Page | Enable channel-specific configuration tabs | Checkbox cards with channel icons |
| 7 | Click "Generate Campaign Assets" | Show progress bar for each asset type being generated | Multi-step progress indicator |
| 8 | Review generated landing page copy and design | Display preview with edit capabilities | Side-by-side editor/preview |
| 9 | Review 5-email welcome sequence | Display email timeline with subject lines and preview | Email sequence timeline visualization |
| 10 | Review 3 Meta ad variations | Show ad mockups with headline/body/CTA | Card grid with ad previews |
| 11 | Click "Launch Campaign" | Confirm deployment, show scheduling options | Confirmation modal with calendar picker |
| 12 | Confirm and schedule for next Monday 9 AM | Create all assets in GHL, schedule activation | Success animation with campaign summary |

### Expected Outcomes
- Complete campaign created with landing page, email sequence, and ad creatives
- All assets deployed to GHL sub-account
- Campaign scheduled for specified launch date
- AI credits deducted appropriately (5 credits)
- Campaign appears in dashboard with "Scheduled" status
- Notification sent confirming campaign creation

### Acceptance Criteria

```gherkin
Feature: AI-Powered Campaign Creation

  Scenario: Successfully create campaign from natural language input
    Given I am logged in as a user with Growth subscription
    And I have 10 or more AI credits
    And my GHL credentials are connected
    When I navigate to the campaign creation wizard
    And I enter "Create a lead generation campaign for first-time homebuyers in Austin, TX"
    Then the AI should parse my input within 5 seconds
    And display structured campaign objectives
    And show recommended channels and budget

  Scenario: Generate campaign assets for selected channels
    Given I have configured campaign objectives
    And I have selected Email, Meta Ads, and Landing Page channels
    When I click "Generate Campaign Assets"
    Then the system should generate a landing page with relevant copy
    And generate 5 email sequence messages
    And generate 3 Meta ad variations
    And display generation progress for each asset type

  Scenario: Deploy campaign to GHL
    Given I have reviewed and approved all generated assets
    When I click "Launch Campaign"
    And select a schedule date of next Monday at 9 AM
    Then all assets should be created in the connected GHL account
    And the campaign should be set to activate at the scheduled time
    And I should receive a confirmation notification
    And my AI credits should be reduced by 5
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| User has insufficient AI credits | Display upgrade prompt with credit pricing |
| GHL connection expired | Show reconnection flow before proceeding |
| AI generation fails mid-process | Save progress, offer retry or manual completion |
| User closes wizard mid-generation | Prompt with "Save as draft?" confirmation |
| Natural language input too vague | Request additional details with guided questions |
| Generated content exceeds character limits | Auto-truncate with edit suggestion |
| Network timeout during deployment | Queue deployment with retry, notify when complete |

### Test Data Requirements

```json
{
  "testUser": {
    "email": "sarah.chen@testmarketing.com",
    "subscription": "growth",
    "aiCredits": 25,
    "ghlConnected": true
  },
  "campaignInput": {
    "description": "Create a lead generation campaign for first-time homebuyers in Austin, TX. Focus on affordable starter homes under $400K. Target millennials and Gen Z.",
    "targetAudience": {
      "ageRange": [25, 40],
      "location": "Austin, TX",
      "interests": ["real estate", "home buying", "mortgages"]
    },
    "channels": ["email", "meta_ads", "landing_page"],
    "budget": 2500
  },
  "expectedOutputs": {
    "landingPage": {
      "headline": "Find Your First Home in Austin",
      "sections": ["hero", "features", "testimonials", "cta"]
    },
    "emailSequence": {
      "count": 5,
      "subjects": ["Welcome", "Top Neighborhoods", "Financing Tips", "Schedule Tour", "Final Offer"]
    },
    "metaAds": {
      "count": 3,
      "formats": ["single_image", "carousel", "video"]
    }
  }
}
```

### Priority
**P0** - Critical path for core product value proposition

---

## UXS-009-02: Email Sequence Setup and Management

### Story ID
`UXS-009-02`

### Title
Email Sequence Creation, Scheduling, and Performance Management

### Persona
**Michael Torres** - Real Estate Agency Marketing Manager
- Age: 32
- Role: In-house marketing manager for a 15-agent real estate brokerage
- Technical Proficiency: Advanced
- Primary Goal: Nurture leads through automated email sequences
- Pain Points: Low open rates, managing multiple sequences, personalizing at scale

### Scenario
Michael needs to create a 7-email nurture sequence for leads who downloaded a "Home Buying Guide" from the agency's website. He wants to segment based on lead source and personalize content based on the property type they're interested in (single-family, condo, townhouse).

### User Goal
Set up a complete email nurture sequence with conditional logic, personalization tokens, and A/B testing of subject lines.

### Preconditions
- User is authenticated with Professional subscription
- GHL email integration is active
- At least one lead segment exists ("Guide Download Leads")
- Email templates are available in the template library
- SPF/DKIM properly configured for sending domain

### Step-by-Step User Journey

| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | Navigate to Marketing > Email Sequences | Display sequence list with active/paused status | Data table with filters |
| 2 | Click "New Sequence" | Open sequence builder with template options | Full-page editor view |
| 3 | Name sequence: "Home Buyer Guide Nurture" | Validate name uniqueness, save draft | Inline text input with validation |
| 4 | Select trigger: "Tag Added = guide_download" | Configure trigger conditions | Dropdown with tag autocomplete |
| 5 | Add first email: "Welcome + Guide Confirmation" | Open email editor with drag-drop builder | Visual email builder |
| 6 | Insert personalization: {{first_name}}, {{property_type}} | Validate tokens against CRM fields | Token picker sidebar |
| 7 | Set delay: "Immediately after trigger" | Configure timing rules | Time picker with relative options |
| 8 | Add conditional split: "Property Type" | Create branching logic paths | Visual flow diagram |
| 9 | Configure 3 branches: Single-Family, Condo, Townhouse | Set content variations per branch | Tab interface for each branch |
| 10 | Add 6 more emails with 2-day delays | Duplicate and modify for sequence | Clone email function |
| 11 | Configure A/B test for Email 1 subject line | Create variant with 50/50 split | A/B test configuration panel |
| 12 | Set sequence goals: "Meeting Booked" tag | Define conversion tracking | Goal selector dropdown |
| 13 | Preview sequence flow | Display visual sequence diagram | Interactive flowchart |
| 14 | Click "Activate Sequence" | Validate all emails, confirm activation | Validation checklist modal |
| 15 | Confirm activation | Sequence goes live, appears in active list | Success toast with quick stats |

### Expected Outcomes
- 7-email sequence created with conditional branching
- A/B test configured for first email
- Sequence activated and monitoring leads with matching trigger
- Conversion goal tracking enabled
- Sequence visible in dashboard with real-time stats

### Acceptance Criteria

```gherkin
Feature: Email Sequence Setup and Management

  Scenario: Create email sequence with personalization
    Given I am on the email sequence builder
    When I create a new sequence named "Home Buyer Guide Nurture"
    And I add 7 emails with personalization tokens
    And I set delays of 2 days between emails
    Then the sequence should save successfully
    And all personalization tokens should be validated

  Scenario: Configure conditional branching
    Given I have created an email sequence
    When I add a conditional split based on "property_type" field
    And I configure content for Single-Family, Condo, and Townhouse branches
    Then each lead should receive branch-specific content
    And the visual flowchart should show all branches

  Scenario: Set up A/B testing for subject lines
    Given I have created email 1 in the sequence
    When I enable A/B testing
    And I create variant B with alternative subject line
    And I set 50/50 traffic split
    Then both variants should be saved
    And the system should randomly assign leads to variants

  Scenario: Activate and monitor sequence
    Given I have completed sequence setup
    When I click "Activate Sequence"
    Then the system should validate all emails have content
    And validate all personalization tokens exist
    And confirm sequence activation
    And begin enrolling matching leads
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Personalization token not found in CRM | Highlight invalid token, suggest alternatives |
| Lead matches multiple sequences | Show priority picker, apply highest priority |
| Email fails spam check | Display spam score, suggest improvements |
| Sequence has circular reference | Block save, explain the conflict |
| Lead unsubscribes mid-sequence | Immediately stop sequence, mark as unsubscribed |
| A/B test has no winner after 7 days | Auto-select based on open rate, notify user |
| Email exceeds 102KB size limit | Warn about clipping in Gmail |

### Test Data Requirements

```json
{
  "testUser": {
    "email": "michael.torres@testbrokerage.com",
    "subscription": "professional",
    "ghlEmailIntegration": true
  },
  "sequenceData": {
    "name": "Home Buyer Guide Nurture",
    "trigger": {
      "type": "tag_added",
      "tag": "guide_download"
    },
    "emails": [
      {
        "order": 1,
        "subject": "Your Home Buying Guide is Ready!",
        "subjectVariantB": "Welcome! Here's Your Free Guide",
        "delay": "immediate",
        "personalization": ["first_name", "property_type"]
      }
    ],
    "conditionalBranches": [
      {"property_type": "single_family", "contentVariation": "sfh_content"},
      {"property_type": "condo", "contentVariation": "condo_content"},
      {"property_type": "townhouse", "contentVariation": "th_content"}
    ],
    "goal": {
      "type": "tag_added",
      "tag": "meeting_booked"
    }
  },
  "testLeads": [
    {"email": "lead1@test.com", "firstName": "John", "propertyType": "single_family"},
    {"email": "lead2@test.com", "firstName": "Jane", "propertyType": "condo"},
    {"email": "lead3@test.com", "firstName": "Bob", "propertyType": "townhouse"}
  ]
}
```

### Priority
**P0** - Core feature for marketing automation

---

## UXS-009-03: SMS Campaign with Twilio Integration

### Story ID
`UXS-009-03`

### Title
SMS Marketing Campaign Creation with Twilio and Compliance Management

### Persona
**Jessica Kim** - Dental Practice Marketing Coordinator
- Age: 28
- Role: Marketing coordinator for a multi-location dental practice
- Technical Proficiency: Intermediate
- Primary Goal: Send appointment reminders and promotional SMS campaigns
- Pain Points: Compliance concerns, managing opt-outs, character limits

### Scenario
Jessica wants to send a promotional SMS campaign for teeth whitening services to patients who haven't visited in 6+ months. She needs to ensure TCPA compliance, manage opt-outs, and track campaign performance.

### User Goal
Create and send a compliant SMS campaign to a segmented audience with proper consent management and performance tracking.

### Preconditions
- User is authenticated with Growth subscription or higher
- Twilio account is connected and verified
- Toll-free number verified for SMS sending
- SMS consent field exists in CRM
- A2P 10DLC registration completed (US)

### Step-by-Step User Journey

| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | Navigate to Marketing > SMS Campaigns | Display SMS campaign dashboard | Campaign list with status badges |
| 2 | Click "Create SMS Campaign" | Open SMS campaign wizard | Step-by-step wizard modal |
| 3 | Name campaign: "Whitening Promo - Q1 2026" | Save campaign name, show compliance checklist | Text input with character validation |
| 4 | Select audience: "Patients - No Visit 6+ Months" | Display audience size and consent status | Audience selector with preview |
| 5 | System filters for SMS consent | Show filtered count: 847 of 1,234 have SMS consent | Warning banner if consent missing |
| 6 | Write message: "Hi {{first_name}}! Your smile deserves some love. Get 20% off teeth whitening this month at Bright Dental. Book: {{booking_link}} Reply STOP to opt out" | Character count: 156/160, segment count: 1 | Rich text editor with counter |
| 7 | Preview with sample data | Show personalized preview for 3 sample recipients | Preview cards with actual names |
| 8 | Add merge field: {{location_name}} | Validate field exists, update preview | Field picker dropdown |
| 9 | Set send time: "Tomorrow 10:30 AM" | Validate against quiet hours (8 AM - 9 PM) | Calendar with time picker |
| 10 | Enable link tracking | Generate short link, update character count | Toggle switch with link preview |
| 11 | Review compliance checklist | Display TCPA requirements, confirm all met | Interactive checklist |
| 12 | Click "Schedule Campaign" | Validate message, confirm send details | Confirmation modal with summary |
| 13 | Confirm scheduling | Campaign queued, confirmation displayed | Success message with campaign ID |

### Expected Outcomes
- SMS campaign created and scheduled for specified time
- Only consented recipients included (847 recipients)
- Compliance checklist completed and logged
- Link tracking enabled with shortened URLs
- Campaign appears in scheduled list with countdown
- Estimated cost displayed ($42.35 based on Twilio pricing)

### Acceptance Criteria

```gherkin
Feature: SMS Campaign with Twilio Integration

  Scenario: Create compliant SMS campaign
    Given I am on the SMS campaign creation wizard
    And I have connected Twilio account
    When I select audience "Patients - No Visit 6+ Months"
    Then only recipients with SMS consent should be included
    And the filtered count should be displayed

  Scenario: Validate message content
    Given I am composing SMS message
    When I enter message text with personalization tokens
    Then the character count should update in real-time
    And segment count should be calculated
    And message preview should show personalized content

  Scenario: Enforce quiet hours
    Given I am scheduling SMS campaign
    When I select send time of 6:00 AM
    Then the system should display quiet hours warning
    And suggest earliest allowed time (8:00 AM)

  Scenario: Handle opt-out responses
    Given an SMS campaign is active
    When a recipient replies "STOP"
    Then the recipient should be immediately opted out
    And confirmation message should be sent: "You have been unsubscribed"
    And CRM should be updated to remove SMS consent

  Scenario: Track link clicks
    Given I have enabled link tracking
    When a recipient clicks the shortened link
    Then click should be recorded with timestamp
    And recipient should be redirected to original URL
    And campaign analytics should update
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Message exceeds 160 characters | Show segment count, warn about multi-part message cost |
| Recipient has invalid phone format | Exclude from campaign, add to error report |
| Twilio rate limit reached | Queue remaining messages, notify when complete |
| Recipient in different timezone | Apply quiet hours based on recipient timezone |
| Duplicate phone numbers in list | Deduplicate, send only once per phone |
| Toll-free number verification pending | Block sending, show verification status |
| Opt-out keyword misspelled | Still process opt-out (STOP, Stop, stop, STPO) |

### Test Data Requirements

```json
{
  "testUser": {
    "email": "jessica.kim@brightdental.com",
    "subscription": "growth",
    "twilioConnected": true,
    "twilioPhoneNumber": "+1234567890"
  },
  "campaignData": {
    "name": "Whitening Promo - Q1 2026",
    "audience": {
      "segmentId": "no_visit_6months",
      "totalCount": 1234,
      "consentedCount": 847
    },
    "message": "Hi {{first_name}}! Your smile deserves some love. Get 20% off teeth whitening this month at Bright Dental. Book: {{booking_link}} Reply STOP to opt out",
    "sendTime": "2026-01-12T10:30:00-06:00",
    "trackLinks": true
  },
  "testRecipients": [
    {"phone": "+15551234567", "firstName": "Alice", "smsConsent": true},
    {"phone": "+15559876543", "firstName": "Bob", "smsConsent": true},
    {"phone": "+15555555555", "firstName": "Charlie", "smsConsent": false}
  ],
  "expectedCost": {
    "perMessage": 0.05,
    "totalMessages": 847,
    "estimatedTotal": 42.35
  }
}
```

### Priority
**P1** - Important for multi-channel marketing

---

## UXS-009-04: Meta Ads Creation and Optimization

### Story ID
`UXS-009-04`

### Title
Meta Ads Campaign Creation with AI-Powered Optimization

### Persona
**David Martinez** - E-commerce Marketing Director
- Age: 41
- Role: Marketing director for a home goods e-commerce brand
- Technical Proficiency: Advanced
- Primary Goal: Maximize ROAS on Meta advertising spend
- Pain Points: Ad fatigue, creative testing at scale, attribution complexity

### Scenario
David needs to launch a Meta ads campaign for a new product line launch. He wants to use AI to generate ad variations, analyze performance, and receive optimization recommendations.

### User Goal
Create, launch, and optimize a Meta ads campaign with AI-generated creatives and performance recommendations.

### Preconditions
- User is authenticated with Professional subscription
- Meta Ads account connected via OAuth
- Pixel installed and tracking events
- Product catalog synced
- OpenAI API key configured for AI features

### Step-by-Step User Journey

| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | Navigate to Ads > Meta Ads Manager | Display connected ad accounts and campaigns | Dashboard with account selector |
| 2 | Click "Create Campaign" | Open campaign creation wizard | Multi-step form wizard |
| 3 | Select objective: "Sales - Catalog Sales" | Configure conversion event options | Objective cards with descriptions |
| 4 | Connect product catalog | Display synced products, select product set | Product catalog browser |
| 5 | Configure audience: Age 25-54, Interests: Home Decor | Show estimated audience size (2.4M - 2.8M) | Audience builder with size meter |
| 6 | Set budget: $150/day | Calculate estimated results (reach, clicks, conversions) | Budget slider with projections |
| 7 | Click "Generate Ad Creatives with AI" | Open AI creative generation modal | AI generation interface |
| 8 | Enter product description and brand voice | Generate 5 ad copy variations per format | Text input with tone selector |
| 9 | Upload product images | AI generates ad mockups for each format | Image uploader with AI enhancement |
| 10 | Review generated ads (Single Image, Carousel, Collection) | Display previews across all placements | Placement preview gallery |
| 11 | Select 3 best performing ad variations | Enable A/B testing between selected | Checkbox selection with comparison |
| 12 | Configure placement: Automatic (recommended) | Show placement breakdown by estimated performance | Placement optimizer suggestions |
| 13 | Set schedule: Start immediately, run for 14 days | Display campaign timeline with budget pacing | Date range picker with calendar |
| 14 | Review campaign summary | Display all settings, estimated metrics, total spend | Summary card with edit links |
| 15 | Click "Publish Campaign" | Submit to Meta for review, show estimated approval time | Publish button with progress |
| 16 | Campaign approved and live | Display real-time performance metrics | Live status indicator |

### Expected Outcomes
- Campaign created with 3 ad variations across multiple formats
- A/B testing enabled with automatic budget optimization
- Campaign submitted and approved by Meta
- Real-time performance tracking enabled
- AI recommendations engine monitoring campaign

### Acceptance Criteria

```gherkin
Feature: Meta Ads Creation and Optimization

  Scenario: Connect Meta Ads account
    Given I am on the Meta Ads Manager page
    When I click "Connect Account"
    Then I should be redirected to Meta OAuth
    And upon authorization, my ad accounts should be synced
    And campaign data should be imported

  Scenario: Generate AI ad creatives
    Given I am creating a new campaign
    When I click "Generate Ad Creatives with AI"
    And I enter product description and upload images
    Then the AI should generate 5 copy variations
    And create mockups for Single Image, Carousel, and Collection formats
    And display previews for all placements

  Scenario: Configure A/B testing
    Given I have selected 3 ad variations
    When I enable A/B testing
    Then budget should be split equally between variations
    And performance metrics should be tracked separately
    And winner should be identified based on ROAS

  Scenario: Receive AI optimization recommendations
    Given my campaign has been running for 48 hours
    When I view campaign analytics
    Then I should see AI-generated recommendations
    And recommendations should include specific actions
    And estimated impact should be displayed
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Meta account has no payment method | Display warning, link to Meta billing settings |
| Ad rejected by Meta policy review | Show rejection reason, suggest modifications |
| Product catalog out of sync | Trigger catalog resync, delay campaign if needed |
| Daily budget below minimum ($1) | Show minimum budget warning |
| Image aspect ratio incorrect | Auto-crop with manual adjustment option |
| Audience too narrow (<1000) | Expand suggestion with lookalike option |
| Campaign overspending | Alert user, suggest budget cap adjustment |

### Test Data Requirements

```json
{
  "testUser": {
    "email": "david.martinez@homegoods.com",
    "subscription": "professional",
    "metaConnected": true,
    "metaAdAccountId": "act_1234567890"
  },
  "campaignData": {
    "name": "Spring Collection Launch 2026",
    "objective": "CATALOG_SALES",
    "productCatalog": {
      "id": "cat_987654321",
      "productCount": 45
    },
    "audience": {
      "ageMin": 25,
      "ageMax": 54,
      "interests": ["home_decor", "interior_design", "furniture"],
      "locations": ["US"]
    },
    "budget": {
      "type": "daily",
      "amount": 150
    },
    "schedule": {
      "startDate": "2026-01-13",
      "endDate": "2026-01-27"
    }
  },
  "generatedCreatives": [
    {"format": "single_image", "headline": "Transform Your Space", "primaryText": "Discover our new spring collection..."},
    {"format": "carousel", "cards": 5, "theme": "room_by_room"},
    {"format": "collection", "coverImage": "lifestyle_shot.jpg"}
  ]
}
```

### Priority
**P0** - Critical revenue driver

---

## UXS-009-05: Campaign Performance Analytics

### Story ID
`UXS-009-05`

### Title
Cross-Channel Campaign Performance Analytics and Reporting

### Persona
**Lisa Thompson** - Agency Account Director
- Age: 45
- Role: Account director managing 12 client accounts
- Technical Proficiency: Intermediate
- Primary Goal: Report on campaign performance to clients with actionable insights
- Pain Points: Data scattered across platforms, time-consuming report creation

### Scenario
Lisa needs to prepare a monthly performance report for a key client that includes data from email campaigns, SMS, Meta ads, and SEO. She wants to show ROI, compare against previous period, and highlight AI-powered insights.

### User Goal
Generate a comprehensive cross-channel performance report with automated insights and exportable formats for client presentation.

### Preconditions
- User is authenticated with Professional subscription
- Client sub-account has campaigns across email, SMS, Meta ads, and SEO
- At least 30 days of historical data available
- Google Analytics integration active
- Client branding configured

### Step-by-Step User Journey

| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | Navigate to Analytics > Reports | Display report dashboard with templates | Report template gallery |
| 2 | Click "Create Report" | Open report builder wizard | Full-page report builder |
| 3 | Select client: "Acme Real Estate" | Load client-specific data sources | Client dropdown with search |
| 4 | Select date range: "December 2025" | Load performance data for period | Date range picker |
| 5 | Enable comparison: "vs November 2025" | Calculate period-over-period changes | Comparison toggle |
| 6 | Select channels: Email, SMS, Meta Ads, SEO | Add channel-specific sections | Channel checkbox grid |
| 7 | Choose metrics: Impressions, Clicks, Conversions, Revenue, ROAS | Configure metric cards | Metric selector with drag-drop |
| 8 | Click "Generate Insights with AI" | Analyze data, generate narrative insights | AI insight generator |
| 9 | Review AI-generated executive summary | Display 3-paragraph narrative with key findings | Rich text editor for customization |
| 10 | Add custom annotation: "Black Friday impact" | Insert note on specific date in timeline | Annotation tool on charts |
| 11 | Configure branding: Upload client logo, select colors | Apply branding to report template | Branding customization panel |
| 12 | Preview report | Display full report preview in new tab | Preview button with print view |
| 13 | Export as PDF and PowerPoint | Generate files, offer download | Export dropdown with format options |
| 14 | Schedule monthly auto-send to client | Configure recurring email with report attached | Scheduling modal |
| 15 | Click "Save and Send" | Email report to client, save to report library | Confirmation with delivery status |

### Expected Outcomes
- Comprehensive report generated with all selected channels
- AI insights highlighting key performance drivers
- Period-over-period comparison with trend indicators
- Client branding applied throughout report
- PDF and PowerPoint exports generated
- Monthly auto-send configured

### Acceptance Criteria

```gherkin
Feature: Campaign Performance Analytics

  Scenario: Generate cross-channel performance report
    Given I am on the report builder
    When I select client "Acme Real Estate"
    And I select date range "December 2025"
    And I select channels Email, SMS, Meta Ads, SEO
    Then the report should aggregate data from all channels
    And display unified metrics dashboard

  Scenario: AI-generated insights
    Given I have configured report parameters
    When I click "Generate Insights with AI"
    Then an executive summary should be generated
    And key performance drivers should be identified
    And recommendations should be included

  Scenario: Period-over-period comparison
    Given I have selected "December 2025" as date range
    When I enable comparison with "November 2025"
    Then all metrics should show change percentage
    And trend arrows should indicate direction
    And comparison charts should overlay both periods

  Scenario: Export report in multiple formats
    Given I have completed report configuration
    When I click Export and select PDF
    Then a branded PDF should be generated
    And all charts should render correctly
    And file should download automatically

  Scenario: Schedule recurring reports
    Given I have created a report
    When I configure monthly auto-send
    Then the report should regenerate automatically each month
    And be emailed to specified recipients
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| No data for selected period | Display empty state with suggested date range |
| One channel has no campaigns | Show channel section with "No campaigns" message |
| AI insight generation fails | Fall back to template-based insights |
| Export file size exceeds limit | Compress images, offer chunked download |
| Client logo upload fails | Use text-based branding as fallback |
| Email delivery bounces | Alert user, log in delivery report |
| Comparison period has different campaign mix | Annotate incomparable metrics |

### Test Data Requirements

```json
{
  "testUser": {
    "email": "lisa.thompson@agencyname.com",
    "subscription": "professional"
  },
  "clientData": {
    "name": "Acme Real Estate",
    "subAccountId": "sub_acme_123",
    "branding": {
      "logo": "https://cdn.example.com/acme-logo.png",
      "primaryColor": "#1E40AF",
      "secondaryColor": "#64748B"
    }
  },
  "reportConfig": {
    "dateRange": {
      "start": "2025-12-01",
      "end": "2025-12-31"
    },
    "comparisonPeriod": {
      "start": "2025-11-01",
      "end": "2025-11-30"
    },
    "channels": ["email", "sms", "meta_ads", "seo"],
    "metrics": ["impressions", "clicks", "conversions", "revenue", "roas"]
  },
  "expectedMetrics": {
    "email": {
      "sent": 45000,
      "opened": 18000,
      "clicked": 2700,
      "openRate": 40,
      "ctr": 6
    },
    "metaAds": {
      "impressions": 1250000,
      "clicks": 18750,
      "conversions": 375,
      "spend": 4500,
      "roas": 4.2
    }
  }
}
```

### Priority
**P1** - Important for client retention and reporting

---

## UXS-009-06: AI Image Generation for Campaigns

### Story ID
`UXS-009-06`

### Title
AI-Powered Image Generation for Marketing Campaign Creatives

### Persona
**Ryan O'Brien** - Startup Marketing Manager
- Age: 29
- Role: Solo marketing manager for a SaaS startup
- Technical Proficiency: Intermediate
- Primary Goal: Create professional marketing visuals without a design team
- Pain Points: Limited design resources, stock photo costs, brand consistency

### Scenario
Ryan needs to create social media ads and email headers for a product launch but doesn't have a design team. He wants to use AI to generate on-brand visuals that match his company's aesthetic.

### User Goal
Generate custom marketing images using AI that align with brand guidelines and can be used across multiple marketing channels.

### Preconditions
- User is authenticated with Growth subscription or higher
- OpenAI DALL-E or Midjourney integration configured
- Brand guidelines uploaded (colors, style preferences)
- At least 10 AI image credits available

### Step-by-Step User Journey

| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | Navigate to Assets > AI Image Studio | Display image generation interface | Creative studio layout |
| 2 | Click "New Generation" | Open image creation modal | Modal with generation options |
| 3 | Enter prompt: "Modern minimalist workspace with laptop showing analytics dashboard, soft natural lighting, premium feel" | Display prompt optimization suggestions | Text input with AI suggestions |
| 4 | Select style preset: "Corporate Professional" | Apply style modifiers to prompt | Style preset cards |
| 5 | Select aspect ratios: 1:1 (Social), 16:9 (Email header), 9:16 (Stories) | Queue multi-format generation | Aspect ratio selector |
| 6 | Apply brand colors: Primary #2563EB, Accent #10B981 | Add color guidance to generation | Color picker with brand palette |
| 7 | Click "Generate Images" | Show progress bar, generate 4 variations per format | Generation progress indicator |
| 8 | Review 12 generated images (4 per format) | Display in grid with zoom capability | Image gallery grid |
| 9 | Select favorite from each format | Mark selections for further editing | Selection checkboxes |
| 10 | Click "Enhance" on selected image | Apply AI upscaling and refinement | Enhancement options panel |
| 11 | Add text overlay: "Launch in 3 Days" | Open text editor with font options | Text overlay tool |
| 12 | Adjust positioning and font | Real-time preview of changes | Drag-and-drop text positioning |
| 13 | Download all formats | Package images in organized ZIP file | Download button with format picker |
| 14 | Save to Asset Library | Store with tags and usage tracking | Library save confirmation |

### Expected Outcomes
- 12 AI-generated images (4 variations x 3 formats)
- Brand-consistent visuals matching style preferences
- Enhanced high-resolution exports
- Text overlays applied where needed
- Assets saved to library for future use
- AI credits deducted (3 credits for 12 images)

### Acceptance Criteria

```gherkin
Feature: AI Image Generation for Campaigns

  Scenario: Generate images from text prompt
    Given I am on the AI Image Studio
    When I enter a descriptive prompt
    And select style preset "Corporate Professional"
    Then the system should generate 4 image variations
    And images should reflect the prompt and style

  Scenario: Generate multiple aspect ratios
    Given I have entered an image prompt
    When I select aspect ratios 1:1, 16:9, and 9:16
    Then images should be generated in all selected formats
    And each format should have 4 variations

  Scenario: Apply brand colors
    Given I have brand colors configured
    When I enable "Apply Brand Colors" option
    Then generated images should incorporate primary and accent colors
    And color consistency should be maintained across variations

  Scenario: Enhance and upscale image
    Given I have selected an image
    When I click "Enhance"
    Then the image should be upscaled to higher resolution
    And quality should be improved without artifacts

  Scenario: Add text overlay
    Given I have a generated image
    When I add text "Launch in 3 Days"
    And position it in the center
    Then the text should appear on the image
    And be editable with font, size, and color options
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Prompt triggers content filter | Display policy warning, suggest modifications |
| Generation times out | Retry automatically, notify if persistent |
| User has insufficient credits | Show credit purchase prompt |
| Generated image has artifacts | Flag for regeneration, offer free retry |
| Text overlaps with image focal point | Suggest alternative positioning |
| Downloaded ZIP corrupted | Retry download, offer individual file downloads |
| Brand colors conflict with image content | Suggest complementary colors |

### Test Data Requirements

```json
{
  "testUser": {
    "email": "ryan.obrien@startupsaas.com",
    "subscription": "growth",
    "aiImageCredits": 25
  },
  "generationRequest": {
    "prompt": "Modern minimalist workspace with laptop showing analytics dashboard, soft natural lighting, premium feel",
    "stylePreset": "corporate_professional",
    "aspectRatios": ["1:1", "16:9", "9:16"],
    "brandColors": {
      "primary": "#2563EB",
      "accent": "#10B981"
    },
    "variationsPerFormat": 4
  },
  "textOverlay": {
    "text": "Launch in 3 Days",
    "font": "Inter Bold",
    "size": 48,
    "color": "#FFFFFF",
    "position": "center"
  },
  "expectedOutput": {
    "totalImages": 12,
    "creditsUsed": 3,
    "formats": {
      "1x1": {"width": 1080, "height": 1080},
      "16x9": {"width": 1920, "height": 1080},
      "9x16": {"width": 1080, "height": 1920}
    }
  }
}
```

### Priority
**P1** - Enhances creative capabilities

---

## UXS-009-07: SEO Keyword Tracking

### Story ID
`UXS-009-07`

### Title
SEO Keyword Rank Tracking and Performance Monitoring

### Persona
**Amanda Foster** - SEO Consultant
- Age: 35
- Role: Independent SEO consultant managing multiple client websites
- Technical Proficiency: Advanced
- Primary Goal: Track keyword rankings and demonstrate SEO progress to clients
- Pain Points: Manual rank checking, historical data gaps, competitor movements

### Scenario
Amanda needs to set up comprehensive keyword tracking for a new client's website, monitor daily rank changes, and receive alerts when important keywords move significantly.

### User Goal
Configure keyword tracking for multiple search engines and locations, monitor rank changes, and receive automated alerts for significant movements.

### Preconditions
- User is authenticated with Professional subscription
- Client website verified in system
- Google Search Console connected (optional but recommended)
- At least 100 keyword tracking slots available

### Step-by-Step User Journey

| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | Navigate to SEO > Keyword Tracker | Display keyword tracking dashboard | Dashboard with tracking overview |
| 2 | Click "Add Website" | Open website configuration modal | Modal with URL input |
| 3 | Enter URL: "www.clientwebsite.com" | Verify domain ownership, import GSC data | URL validation with GSC sync |
| 4 | Import keywords from Google Search Console | Display top 50 ranking keywords from GSC | Keyword import wizard |
| 5 | Manually add priority keywords | Text area for bulk keyword entry | Textarea with line count |
| 6 | Configure search engines: Google US, Google UK, Bing US | Set engine and location combinations | Multi-select with location picker |
| 7 | Enable daily rank checking | Configure check schedule (6 AM daily) | Frequency dropdown |
| 8 | Set up competitor tracking | Add 3 competitor domains | Competitor input fields |
| 9 | Configure rank change alerts: +/- 5 positions | Set threshold for email notifications | Alert threshold slider |
| 10 | Click "Start Tracking" | Begin initial rank check, show progress | Progress bar with keyword count |
| 11 | Review initial rankings table | Display keywords with current position | Data table with sorting |
| 12 | View position distribution chart | Show keywords by rank bucket (1-3, 4-10, 11-20, etc.) | Pie chart visualization |
| 13 | Set up weekly email digest | Configure report recipients and day | Email scheduling options |
| 14 | Save configuration | Confirm setup, show next check time | Success confirmation |

### Expected Outcomes
- 75 keywords tracked across 3 search engine/location combinations
- Daily automated rank checking enabled
- 3 competitors tracked for comparison
- Alerts configured for significant rank changes
- Initial rankings captured and displayed
- Weekly digest scheduled for client

### Acceptance Criteria

```gherkin
Feature: SEO Keyword Tracking

  Scenario: Add website for tracking
    Given I am on the keyword tracker
    When I click "Add Website"
    And enter "www.clientwebsite.com"
    Then the domain should be verified
    And option to import from GSC should appear

  Scenario: Import keywords from Google Search Console
    Given I have connected GSC
    When I click "Import from GSC"
    Then top ranking keywords should be imported
    And current positions should be displayed

  Scenario: Track keywords across multiple locations
    Given I have added keywords
    When I configure Google US, Google UK, and Bing US
    Then rankings should be checked for each location
    And results should be displayed separately

  Scenario: Receive rank change alerts
    Given I have configured +/- 5 position alerts
    When a tracked keyword moves 7 positions
    Then I should receive an email alert
    And the change should be highlighted in the dashboard

  Scenario: Compare against competitors
    Given I have added competitor domains
    When I view keyword rankings
    Then competitor positions should be displayed
    And ranking gaps should be calculated
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Keyword not found in search results | Show "Not Ranked" with "-" position |
| Rate limit from search engine | Queue checks, retry with backoff |
| Competitor domain redirects | Follow redirect, update domain if permanent |
| Keyword has local pack results | Distinguish between organic and local positions |
| Featured snippet detected | Flag keyword with snippet indicator |
| GSC import has 1000+ keywords | Paginate import, allow selection |
| Duplicate keywords in import | Deduplicate automatically |

### Test Data Requirements

```json
{
  "testUser": {
    "email": "amanda.foster@seoconsulting.com",
    "subscription": "professional",
    "keywordSlots": 500
  },
  "websiteConfig": {
    "domain": "www.clientwebsite.com",
    "gscConnected": true,
    "searchEngines": [
      {"engine": "google", "location": "United States"},
      {"engine": "google", "location": "United Kingdom"},
      {"engine": "bing", "location": "United States"}
    ],
    "competitors": [
      "www.competitor1.com",
      "www.competitor2.com",
      "www.competitor3.com"
    ],
    "checkSchedule": "daily_6am",
    "alertThreshold": 5
  },
  "keywords": [
    {"keyword": "best seo tools", "initialPosition": 12},
    {"keyword": "seo audit service", "initialPosition": 8},
    {"keyword": "keyword research software", "initialPosition": 23},
    {"keyword": "backlink analysis tool", "initialPosition": null}
  ],
  "expectedOutput": {
    "totalKeywords": 75,
    "trackedLocations": 3,
    "totalChecks": 225,
    "alertsEnabled": true
  }
}
```

### Priority
**P1** - Core SEO functionality

---

## UXS-009-08: A/B Testing Campaign Variations

### Story ID
`UXS-009-08`

### Title
A/B Testing Setup and Statistical Analysis for Campaign Optimization

### Persona
**Kevin Zhang** - Growth Marketing Lead
- Age: 33
- Role: Growth lead at a mid-size B2B SaaS company
- Technical Proficiency: Advanced
- Primary Goal: Make data-driven decisions on marketing creative and copy
- Pain Points: Low sample sizes, inconclusive tests, test pollution

### Scenario
Kevin wants to A/B test landing page variations for a product demo signup campaign. He needs to set up a statistically valid test, monitor results, and receive automated recommendations when a winner is identified.

### User Goal
Create and manage A/B tests with proper statistical methodology, automated winner detection, and actionable insights.

### Preconditions
- User is authenticated with Professional subscription
- Landing page builder available
- Sufficient traffic for testing (>500 visitors/day)
- Conversion tracking properly configured
- Previous campaign performance data available

### Step-by-Step User Journey

| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | Navigate to Campaigns > A/B Testing | Display A/B test dashboard | Test list with status indicators |
| 2 | Click "Create New Test" | Open test configuration wizard | Multi-step test wizard |
| 3 | Name test: "Demo CTA Copy Test - Q1" | Save test name, generate test ID | Text input with auto-slug |
| 4 | Select test type: "Landing Page Copy" | Show relevant variation options | Test type cards |
| 5 | Select original page (Control) | Load page preview | Page selector with preview |
| 6 | Create Variant A: Change CTA from "Request Demo" to "See It In Action" | Clone page, apply variation | Inline page editor |
| 7 | Create Variant B: Change headline from "Streamline Your Workflow" to "Save 10 Hours Every Week" | Clone page, apply variation | Inline page editor |
| 8 | Configure traffic split: 33% Control, 33% A, 33% B | Validate traffic allocation totals 100% | Percentage sliders |
| 9 | Set primary goal: "Demo Signup" (conversion event) | Configure conversion tracking | Goal selector |
| 10 | Set secondary metrics: Bounce rate, Time on page | Add supplementary tracking | Metric multi-select |
| 11 | Configure statistical significance: 95% confidence | Set analysis parameters | Confidence level dropdown |
| 12 | Enable MDE (Minimum Detectable Effect): 10% | Calculate required sample size | MDE input with calculator |
| 13 | System calculates: Need 3,800 visitors per variant | Display test duration estimate (8 days) | Sample size display |
| 14 | Set test end condition: Reach significance OR 14 days max | Configure termination rules | End condition toggles |
| 15 | Click "Launch Test" | Start test, begin splitting traffic | Launch confirmation |
| 16 | Monitor test progress | Display real-time conversion data | Live results dashboard |
| 17 | Receive winner notification | Email alert with statistical proof | Notification banner |
| 18 | Click "Apply Winner" | Redirect all traffic to winning variant | One-click winner application |

### Expected Outcomes
- A/B test created with 3 variations (Control, A, B)
- Traffic evenly split between variations
- Conversion tracking active with real-time updates
- Statistical analysis running continuously
- Winner identified when 95% confidence reached
- Winning variant automatically applied

### Acceptance Criteria

```gherkin
Feature: A/B Testing Campaign Variations

  Scenario: Create multi-variant A/B test
    Given I am on the A/B testing wizard
    When I create Control, Variant A, and Variant B
    And configure 33%/33%/33% traffic split
    Then all three variations should be active
    And traffic should be distributed evenly

  Scenario: Calculate required sample size
    Given I have set 95% confidence level
    And 10% minimum detectable effect
    When the system calculates sample size
    Then it should display visitors needed per variant
    And estimate test duration based on traffic

  Scenario: Monitor test in real-time
    Given a test is running
    When I view the test dashboard
    Then I should see live conversion rates
    And confidence interval visualizations
    And projected winner if trends continue

  Scenario: Detect statistical significance
    Given a test has sufficient sample size
    When one variant reaches 95% confidence
    Then the system should declare a winner
    And send notification to test owner
    And recommend next actions

  Scenario: Apply winning variant
    Given a winner has been declared
    When I click "Apply Winner"
    Then all traffic should redirect to winner
    And other variants should be archived
    And test should be marked complete
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Traffic too low for significance | Extend test duration, suggest traffic boost |
| Two variants statistically tied | Recommend secondary metric comparison |
| Test reaches time limit without winner | Declare inconclusive, suggest follow-up |
| Conversion tracking breaks mid-test | Alert user, pause test, preserve data |
| Sample ratio mismatch (SRM) detected | Flag potential data quality issue |
| Winning variant has negative secondary metrics | Warn before applying winner |
| External factor affects results (holiday) | Flag anomaly period in analysis |

### Test Data Requirements

```json
{
  "testUser": {
    "email": "kevin.zhang@saascompany.com",
    "subscription": "professional"
  },
  "testConfig": {
    "name": "Demo CTA Copy Test - Q1",
    "testType": "landing_page_copy",
    "variations": [
      {"id": "control", "name": "Original", "allocation": 33},
      {"id": "variant_a", "name": "See It In Action CTA", "allocation": 33},
      {"id": "variant_b", "name": "10 Hours Headline", "allocation": 34}
    ],
    "primaryGoal": {
      "event": "demo_signup",
      "type": "conversion"
    },
    "secondaryMetrics": ["bounce_rate", "time_on_page"],
    "statisticalConfig": {
      "confidenceLevel": 0.95,
      "minimumDetectableEffect": 0.10,
      "requiredSamplePerVariant": 3800
    },
    "endConditions": {
      "reachSignificance": true,
      "maxDuration": 14
    }
  },
  "expectedResults": {
    "testDurationDays": 8,
    "totalSampleNeeded": 11400,
    "dailyTrafficRequired": 1425
  }
}
```

### Priority
**P1** - Critical for optimization-focused users

---

## UXS-009-09: Multi-Channel Campaign Orchestration

### Story ID
`UXS-009-09`

### Title
Orchestrated Multi-Channel Campaign with Automated Triggers and Sequencing

### Persona
**Patricia Nguyen** - VP of Marketing
- Age: 48
- Role: VP Marketing at a mid-market financial services firm
- Technical Proficiency: Intermediate
- Primary Goal: Coordinate complex campaigns across all channels
- Pain Points: Siloed channel management, timing coordination, attribution

### Scenario
Patricia is launching a major product announcement that requires coordinated messaging across email, SMS, social media, paid ads, and webinars. She needs all channels to work together with proper timing and sequencing.

### User Goal
Create and manage a multi-channel campaign with automated orchestration, unified timing, and cross-channel analytics.

### Preconditions
- User is authenticated with Enterprise subscription
- All channel integrations active (email, SMS, Meta, Google Ads)
- Webinar platform integrated (Zoom/GoToWebinar)
- CRM synced with all contact segments
- Budget approved and allocated across channels

### Step-by-Step User Journey

| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | Navigate to Campaigns > Campaign Orchestrator | Display orchestration canvas | Visual campaign builder |
| 2 | Click "Create Orchestrated Campaign" | Open campaign creation flow | Multi-step wizard |
| 3 | Name: "Q1 Product Launch - Investment Platform 2.0" | Initialize campaign container | Text input with campaign type |
| 4 | Set campaign dates: Jan 15 - Feb 15, 2026 | Create campaign timeline | Date range picker |
| 5 | Add Phase 1: "Teaser" (Jan 15-21) | Create phase container | Phase card on timeline |
| 6 | Add teaser email to Phase 1 | Configure email touchpoint | Email block on canvas |
| 7 | Add social media posts (3) to Phase 1 | Schedule posts across platforms | Social block with platform selector |
| 8 | Add Phase 2: "Announcement" (Jan 22) | Create launch day phase | Phase card on timeline |
| 9 | Configure launch day sequence: Email 8 AM > Social 9 AM > SMS 10 AM > Ads 11 AM | Set precise timing with dependencies | Sequence connector lines |
| 10 | Add webinar registration campaign | Link to Zoom webinar, create registration flow | Webinar integration block |
| 11 | Add Phase 3: "Nurture" (Jan 23 - Feb 15) | Create follow-up phase | Phase card on timeline |
| 12 | Configure behavior-triggered emails | Set conditional paths based on engagement | Condition blocks with logic |
| 13 | Set cross-channel suppression rules | Prevent over-messaging (max 3 touches/week) | Suppression settings panel |
| 14 | Configure budget allocation per channel | Set spend limits and pacing | Budget allocation sliders |
| 15 | Add unified conversion tracking | Configure attribution window (7-day) | Attribution settings |
| 16 | Preview campaign flow | Display visual timeline with all touchpoints | Interactive timeline preview |
| 17 | Validate campaign | Check for conflicts, missing assets, budget issues | Validation checklist |
| 18 | Click "Activate Campaign" | Start Phase 1 on specified date | Activation confirmation |

### Expected Outcomes
- Complete multi-phase campaign created with 3 distinct phases
- 15+ touchpoints coordinated across 5 channels
- Automated triggers and dependencies configured
- Cross-channel suppression preventing over-messaging
- Budget pacing and allocation set
- Campaign validation passed

### Acceptance Criteria

```gherkin
Feature: Multi-Channel Campaign Orchestration

  Scenario: Create phased campaign timeline
    Given I am on the campaign orchestrator
    When I create phases "Teaser", "Announcement", and "Nurture"
    And assign date ranges to each phase
    Then all phases should appear on the timeline
    And dependencies should be respected

  Scenario: Configure cross-channel timing
    Given I have created Phase 2 "Announcement"
    When I add Email at 8 AM, Social at 9 AM, SMS at 10 AM
    Then each touchpoint should have precise scheduling
    And execution order should be enforced

  Scenario: Set up behavioral triggers
    Given a contact receives the announcement email
    When they click the webinar registration link
    Then they should be added to webinar nurture sequence
    And removed from general nurture sequence

  Scenario: Enforce suppression rules
    Given I have set max 3 touches per week
    When a contact has received 3 messages this week
    Then additional messages should be held
    And delivered next week

  Scenario: Track unified attribution
    Given the campaign is running
    When a conversion occurs
    Then all touchpoints should be recorded
    And attribution should be calculated across channels
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Channel integration fails mid-campaign | Alert user, continue other channels |
| Budget exhausted before campaign end | Pause paid channels, prioritize owned media |
| Contact unsubscribes from one channel | Respect preference, continue other channels |
| Time zone confusion for global campaign | Display in user's timezone, send in recipient's |
| Webinar capacity reached | Trigger waitlist automation |
| Conflicting suppression rules | Apply most restrictive rule |
| Phase dependency not met | Delay subsequent phase, notify user |

### Test Data Requirements

```json
{
  "testUser": {
    "email": "patricia.nguyen@finservices.com",
    "subscription": "enterprise"
  },
  "campaignConfig": {
    "name": "Q1 Product Launch - Investment Platform 2.0",
    "dateRange": {
      "start": "2026-01-15",
      "end": "2026-02-15"
    },
    "phases": [
      {
        "name": "Teaser",
        "dateRange": {"start": "2026-01-15", "end": "2026-01-21"},
        "touchpoints": [
          {"channel": "email", "count": 2},
          {"channel": "social", "count": 3}
        ]
      },
      {
        "name": "Announcement",
        "dateRange": {"start": "2026-01-22", "end": "2026-01-22"},
        "touchpoints": [
          {"channel": "email", "time": "08:00"},
          {"channel": "social", "time": "09:00"},
          {"channel": "sms", "time": "10:00"},
          {"channel": "paid_ads", "time": "11:00"}
        ]
      },
      {
        "name": "Nurture",
        "dateRange": {"start": "2026-01-23", "end": "2026-02-15"},
        "touchpoints": [
          {"channel": "email", "count": 8, "trigger": "behavior"},
          {"channel": "webinar", "count": 1}
        ]
      }
    ],
    "budget": {
      "total": 50000,
      "allocation": {
        "email": 0,
        "sms": 2500,
        "meta_ads": 25000,
        "google_ads": 20000,
        "webinar": 2500
      }
    },
    "suppression": {
      "maxTouchesPerWeek": 3,
      "channelCooldown": {"email": 24, "sms": 72}
    }
  }
}
```

### Priority
**P0** - Core enterprise feature

---

## UXS-009-10: Campaign Template Library Management

### Story ID
`UXS-009-10`

### Title
Campaign Template Creation, Sharing, and Marketplace Integration

### Persona
**Carlos Rodriguez** - Agency Operations Director
- Age: 42
- Role: Operations director at a full-service marketing agency
- Technical Proficiency: Intermediate
- Primary Goal: Standardize campaign delivery across team members
- Pain Points: Inconsistent deliverables, onboarding new team members, version control

### Scenario
Carlos wants to create a library of proven campaign templates that his team can use as starting points. He also wants to sell his most successful templates in the marketplace.

### User Goal
Create, organize, and share campaign templates within the organization and optionally publish to the marketplace for monetization.

### Preconditions
- User is authenticated with Enterprise subscription
- At least one completed successful campaign
- Team members have appropriate access levels
- Marketplace seller account approved (for publishing)

### Step-by-Step User Journey

| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | Navigate to Marketing > Template Library | Display organization's template collection | Template gallery grid |
| 2 | Click "Create from Campaign" | Show list of completed campaigns | Campaign selector modal |
| 3 | Select "Real Estate Lead Gen - Q4 2025" (high performer) | Clone campaign structure, remove client data | Campaign preview |
| 4 | Name template: "Real Estate Lead Generation Starter" | Create template entry | Template metadata form |
| 5 | Add description and use case | Provide documentation for users | Rich text editor |
| 6 | Tag with categories: "Real Estate", "Lead Gen", "B2C" | Apply taxonomy for filtering | Tag selector |
| 7 | Mark customizable elements | Highlight sections users should modify | Element annotation tool |
| 8 | Set usage guidelines | Document best practices | Guidelines editor |
| 9 | Add performance benchmarks | Include expected metrics range | Benchmark input fields |
| 10 | Set access: "All Team Members" | Configure sharing permissions | Permission selector |
| 11 | Click "Save to Library" | Template appears in library | Success confirmation |
| 12 | Click "Publish to Marketplace" | Open marketplace listing form | Marketplace wizard |
| 13 | Set price: $197 one-time | Configure pricing and licensing | Pricing configuration |
| 14 | Add preview screenshots | Upload visual previews | Image uploader |
| 15 | Submit for review | Enter marketplace review queue | Submission confirmation |
| 16 | Template approved and listed | Available for purchase in marketplace | Marketplace notification |

### Expected Outcomes
- Template created from successful campaign
- All client-specific data removed
- Template available to team members
- Usage guidelines and benchmarks documented
- Template published to marketplace after approval
- Revenue tracking enabled for marketplace sales

### Acceptance Criteria

```gherkin
Feature: Campaign Template Library Management

  Scenario: Create template from existing campaign
    Given I have a completed campaign
    When I click "Create from Campaign"
    And select the campaign to templatize
    Then a new template should be created
    And client-specific data should be scrubbed
    And structure should be preserved

  Scenario: Add template documentation
    Given I am editing a template
    When I add description, use cases, and guidelines
    And mark customizable elements
    Then documentation should be saved with template
    And visible to template users

  Scenario: Share template with team
    Given I have created a template
    When I set access to "All Team Members"
    Then all team members should see the template
    And be able to create campaigns from it

  Scenario: Publish template to marketplace
    Given I have a complete template
    When I click "Publish to Marketplace"
    And set price and upload previews
    Then template should enter review queue
    And notification should be sent upon approval

  Scenario: Use template to create campaign
    Given I am creating a new campaign
    When I select "Start from Template"
    And choose "Real Estate Lead Generation Starter"
    Then a new campaign should be created with template structure
    And customizable elements should be highlighted
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Template contains expired integrations | Flag during creation, require update |
| Team member lacks channel access | Hide unavailable template components |
| Marketplace listing rejected | Provide rejection reason, allow revision |
| Template has PII in sample data | Auto-detect and flag for review |
| User modifies shared template | Create personal fork, preserve original |
| Template version update needed | Notify users, offer upgrade path |
| Marketplace template refund requested | Process per policy, revoke access |

### Test Data Requirements

```json
{
  "testUser": {
    "email": "carlos.rodriguez@fullagency.com",
    "subscription": "enterprise",
    "marketplaceSeller": true
  },
  "sourceCampaign": {
    "id": "camp_realEstate_q4_2025",
    "name": "Real Estate Lead Gen - Q4 2025",
    "performance": {
      "leads": 847,
      "conversion_rate": 4.2,
      "cost_per_lead": 23.50,
      "roas": 5.8
    },
    "channels": ["email", "meta_ads", "landing_page"]
  },
  "templateConfig": {
    "name": "Real Estate Lead Generation Starter",
    "description": "Proven lead generation campaign template for real estate agencies...",
    "categories": ["real_estate", "lead_gen", "b2c"],
    "customizableElements": [
      "branding.logo",
      "content.headlines",
      "audience.targeting",
      "budget.allocation"
    ],
    "benchmarks": {
      "expectedLeads": "500-1000 per month",
      "expectedCPL": "$20-$35",
      "expectedROAS": "4x-6x"
    },
    "access": "all_team",
    "marketplace": {
      "price": 197,
      "license": "single_use",
      "preview_images": 5
    }
  }
}
```

### Priority
**P2** - Enhancement for agency workflows

---

## Appendix A: Common Test Data Patterns

### User Personas

| Persona | Subscription | AI Credits | Channels Enabled |
|---------|--------------|------------|------------------|
| Starter User | Starter | 5 | Email only |
| Growth User | Growth | 25 | Email, SMS |
| Professional User | Professional | 100 | All channels |
| Enterprise User | Enterprise | Unlimited | All + API access |

### Campaign States

| State | Description | Valid Transitions |
|-------|-------------|-------------------|
| Draft | Campaign being created | Scheduled, Archived |
| Scheduled | Awaiting start date | Active, Paused, Archived |
| Active | Currently running | Paused, Completed |
| Paused | Temporarily stopped | Active, Archived |
| Completed | Finished running | Archived |
| Archived | Historical record | None |

### Integration States

| Integration | Connected | Not Connected | Error State |
|-------------|-----------|---------------|-------------|
| GHL | OAuth token valid | No token | Token expired |
| Meta Ads | Account linked | Account not linked | Permissions revoked |
| Twilio | Number verified | No number | A2P pending |
| GSC | Property verified | No property | Verification failed |

---

## Appendix B: Priority Matrix

| Priority | Definition | SLA Target |
|----------|------------|------------|
| P0 | Critical path - blocks core functionality | 24 hours |
| P1 | Important - affects user experience significantly | 72 hours |
| P2 | Enhancement - improves workflow efficiency | 1 week |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | QA Team | Initial creation with 10 UX stories |

---

## Related Documents

- `/docs/META_ADS_INTEGRATION.md` - Meta Ads API reference
- `/docs/SEO_MODULE.md` - SEO module documentation
- `/docs/USER_FLOWS.md` - User flow diagrams
- `/docs/GHL-Complete-Functions-Reference.md` - GHL function library
