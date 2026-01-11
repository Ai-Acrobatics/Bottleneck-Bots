# User Experience Stories: Features 11-15

**Document Version:** 1.0
**Status:** Ready for QA Testing
**Created:** 2026-01-11
**Last Updated:** 2026-01-11

This document contains detailed User Experience (UX) stories for testing and validation of Bottleneck-Bots features 11-15. Each story is designed to be actionable for QA testing with specific test data requirements and edge cases.

---

## Table of Contents

1. [Feature 11: Lead Enrichment](#feature-11-lead-enrichment)
2. [Feature 12: Client Profiles & Context](#feature-12-client-profiles--context)
3. [Feature 13: Sub-Accounts](#feature-13-sub-accounts)
4. [Feature 14: Scheduled Tasks (Cron)](#feature-14-scheduled-tasks-cron)
5. [Feature 15: Agency Tasks](#feature-15-agency-tasks)

---

# Feature 11: Lead Enrichment

## Overview
The Lead Enrichment System enables users to upload CSV files containing lead lists, enrich them with comprehensive contact and company data via the Apify API, and manage enriched leads for outreach campaigns.

---

### UX-11-001: CSV File Upload - Basic Flow

| Field | Value |
|-------|-------|
| **Story ID** | UX-11-001 |
| **Title** | User uploads a CSV file containing lead data |
| **User Persona** | Agency Owner (Sarah, manages 5 client accounts, uploads 2-3 lead lists weekly) |

**Preconditions:**
- User is authenticated and logged in
- User has an active subscription with available credits
- User is on the Lead Enrichment page

**User Journey:**
1. User clicks "Upload CSV" button
2. File browser opens, user selects a CSV file (leads.csv, 500 rows)
3. System shows upload progress bar
4. Upon completion, column mapping modal appears
5. System auto-detects common column headers (Email, First Name, Company)
6. User reviews mappings, adjusts "Company Name" column that was not auto-detected
7. User clicks "Import" button
8. System validates data and shows import summary
9. New lead list appears in the lists panel

**Expected Behavior:**
- Upload progress displays in real-time (percentage complete)
- Auto-detection correctly maps at least 70% of standard headers
- Validation errors shown inline with row numbers
- Import completes in under 30 seconds for 500 leads
- List card shows total leads count and "0% enriched" status

**Success Criteria:**
- [ ] File upload accepts CSV files up to 50MB
- [ ] Progress bar updates every 1-2 seconds
- [ ] Column mapping modal displays within 2 seconds of upload completion
- [ ] Auto-detection works for: email, firstName, lastName, companyName, phone, linkedInUrl
- [ ] Duplicate detection shows count before import
- [ ] Import confirmation shows: imported count, duplicates skipped, validation errors

**Edge Cases:**
1. File contains special characters in names (accents, emojis)
2. File uses semicolon delimiter instead of comma
3. File has empty rows interspersed with data
4. Column headers are in different cases (EMAIL vs email vs Email)
5. File contains 10,000 rows (max limit test)
6. File is exactly 50MB (boundary test)
7. Upload is interrupted mid-stream (network disconnect)

**Test Data Requirements:**
- CSV file with 500 valid leads (standard columns)
- CSV file with 100 leads and special characters
- CSV file with semicolon delimiters
- CSV file with duplicate emails (10% duplicate rate)
- CSV file with missing required email column
- CSV file at 50MB boundary size
- CSV file exceeding 50MB (should fail)

---

### UX-11-002: Batch Enrichment - Credit Estimation

| Field | Value |
|-------|-------|
| **Story ID** | UX-11-002 |
| **Title** | User views credit estimate before batch enrichment |
| **User Persona** | Sales Manager (Mike, budget-conscious, needs to track costs) |

**Preconditions:**
- User has an uploaded lead list with 200 leads
- 50 leads have already been enriched (should be skipped)
- User has 300 credits available
- User is viewing the lead list detail page

**User Journey:**
1. User clicks "Enrich List" button
2. Enrichment options modal opens
3. User sees: "150 leads to enrich (50 previously enriched will be skipped)"
4. User selects "Standard" enrichment level (1 credit each)
5. System displays: "Estimated cost: 150 credits"
6. User sees current balance: "300 credits available"
7. User reviews enrichment data points included at Standard level
8. User clicks "Start Enrichment"
9. System deducts credits and begins processing

**Expected Behavior:**
- Credit estimate updates in real-time when options change
- Previously enriched leads count is accurate
- Credit balance warning appears if estimate exceeds balance
- Breakdown shows: Basic (0.5 credits), Standard (1.0 credits), Premium (2.0 credits)

**Success Criteria:**
- [ ] Skip count accurately reflects leads enriched within last 30 days
- [ ] Credit estimate matches actual deduction (within 5%)
- [ ] Enrichment level descriptions are clear and visible
- [ ] Balance warning appears when estimate > available credits
- [ ] "Insufficient credits" prevents job start with purchase link

**Edge Cases:**
1. User has exactly enough credits (boundary)
2. User has 1 credit less than needed
3. All leads in list are already enriched
4. Enrichment level is changed mid-selection
5. User has subscription credits and pack credits (which depletes first?)
6. User's credits expire during enrichment job

**Test Data Requirements:**
- Lead list with 200 leads (50 enriched, 150 pending)
- User account with exactly 150 credits
- User account with 149 credits
- User account with mixed credit sources (subscription + pack)
- Lead list where all 100 leads are enriched

---

### UX-11-003: Real-Time Enrichment Progress

| Field | Value |
|-------|-------|
| **Story ID** | UX-11-003 |
| **Title** | User monitors batch enrichment job progress |
| **User Persona** | Marketing Coordinator (Lisa, running enrichment during meeting prep) |

**Preconditions:**
- User has started a batch enrichment job for 500 leads
- Job is currently processing
- User is on the enrichment jobs page

**User Journey:**
1. User sees job card with status "Processing"
2. Progress bar shows 45% complete (225/500)
3. Live counter updates every 5 seconds: "227... 229... 231..."
4. User sees breakdown: Successful: 200, Failed: 25, Skipped: 6
5. ETA displays: "Approximately 12 minutes remaining"
6. User clicks job to expand details
7. Detailed view shows recent enrichment results scrolling in real-time
8. User navigates away, returns 5 minutes later
9. Progress has continued, now at 78%
10. Job completes, notification appears, status changes to "Completed"

**Expected Behavior:**
- Progress updates without page refresh (polling or WebSocket)
- ETA recalculates based on current throughput
- Failed leads show error category (not found, rate limited, etc.)
- Completion triggers in-app notification
- Job persists correctly if user navigates away

**Success Criteria:**
- [ ] Progress updates every 5 seconds
- [ ] ETA accuracy within 20% of actual completion time
- [ ] Failed/skipped counts are accurate
- [ ] Job continues processing when user leaves page
- [ ] Completion notification appears within 10 seconds of finish

**Edge Cases:**
1. Browser is closed during processing (job continues)
2. User opens same job view in two tabs
3. Apify API rate limiting causes temporary pause
4. Network connectivity lost for 30 seconds
5. Job takes longer than estimated (ETA recalculates)
6. User cancels job mid-progress

**Test Data Requirements:**
- Active enrichment job at various progress stages
- Job that encounters rate limiting
- Job with high failure rate (>20%)
- Long-running job (1000+ leads)

---

### UX-11-004: Individual Lead Enrichment

| Field | Value |
|-------|-------|
| **Story ID** | UX-11-004 |
| **Title** | User enriches a single lead on-demand |
| **User Persona** | Sales Rep (Tom, needs quick info before a call) |

**Preconditions:**
- User is viewing a lead detail page
- Lead has basic info (email, name) but not enriched
- User has at least 1 credit available

**User Journey:**
1. User views lead card showing: Email, Name, Company (from CSV)
2. User clicks "Enrich Now" button
3. Button changes to loading spinner with "Enriching..."
4. After 5 seconds, enriched data populates inline
5. New fields appear: Phone numbers, LinkedIn URL, Job Title, Company Size
6. Confidence score badge shows "87% confidence"
7. Credit balance decreases by 1 (visible in header)
8. "Last enriched: Just now" timestamp appears

**Expected Behavior:**
- Enrichment completes within 10 seconds
- Data populates without page refresh
- Partial data is shown if some fields unavailable
- Credit deduction happens only on success
- Enrichment history is logged

**Success Criteria:**
- [ ] Single lead enrichment completes in <10 seconds
- [ ] New data fields animate into view
- [ ] Confidence score is displayed
- [ ] Credit deduction reflected immediately
- [ ] "Enrich Now" button disabled for already-enriched leads (shows "Re-enrich")

**Edge Cases:**
1. Lead cannot be found in enrichment database
2. Enrichment returns partial data (email valid, no phone)
3. User has exactly 1 credit (successful)
4. User has 0 credits (should fail gracefully)
5. Concurrent enrichment requests on same lead
6. Network timeout during enrichment

**Test Data Requirements:**
- Lead with valid, enrichable email
- Lead with email that returns no results
- Lead with partial match data
- User account with 1 credit
- User account with 0 credits

---

### UX-11-005: Credit Balance and Low Credit Alerts

| Field | Value |
|-------|-------|
| **Story ID** | UX-11-005 |
| **Title** | User receives low credit balance alerts |
| **User Persona** | Agency Owner (Sarah, needs to maintain enrichment capacity) |

**Preconditions:**
- User's subscription includes 500 monthly credits
- User has used 450 credits (90% consumed)
- User has configured low balance alerts at 25% and 10%

**User Journey:**
1. User performs enrichment that brings balance to 49 credits (crossing 10% threshold)
2. In-app notification appears: "Low Credit Balance: 49 credits remaining"
3. Email alert is sent simultaneously
4. User clicks notification, goes to credit management page
5. Page shows: Current balance, usage history chart, renewal date
6. "Purchase Credits" button is prominently displayed
7. User views available credit packs with pricing
8. User selects "Growth Pack" (500 credits, $40)
9. Stripe checkout opens, user completes purchase
10. Credits added immediately, balance shows 549

**Expected Behavior:**
- Alerts trigger at exact threshold crossings
- Multiple alert channels work simultaneously
- Credit packs purchase flow is seamless
- Credits are added immediately upon successful payment
- Transaction logged in credit history

**Success Criteria:**
- [ ] Alert triggers within 60 seconds of threshold crossing
- [ ] Email contains: current balance, account name, purchase link
- [ ] Credit packs display correct pricing
- [ ] Stripe checkout pre-fills user email
- [ ] Credits available within 5 seconds of payment
- [ ] Purchase appears in transaction history immediately

**Edge Cases:**
1. User crosses both 25% and 10% thresholds in single operation
2. Payment fails mid-checkout
3. Duplicate purchase attempts
4. User has pending credit pack that hasn't been applied
5. Credit rollover occurs on billing date during low balance

**Test Data Requirements:**
- User account at exactly 25% credits
- User account at exactly 10% credits
- Test Stripe payment credentials
- Failed payment simulation
- User with existing pending credit purchase

---

### UX-11-006: Export Enriched Leads

| Field | Value |
|-------|-------|
| **Story ID** | UX-11-006 |
| **Title** | User exports enriched leads to CSV |
| **User Persona** | Data Analyst (Kevin, needs data in spreadsheet format) |

**Preconditions:**
- User has a lead list with 1,000 leads (800 enriched)
- User is on the lead list detail page
- User wants to export for use in external CRM

**User Journey:**
1. User clicks "Export" button
2. Export options modal opens
3. User selects format: CSV (default), also sees Excel, JSON options
4. User toggles "Enriched leads only" (default: on)
5. User sees preview: "800 leads will be exported"
6. User selects fields to include via checkboxes
7. Default fields pre-selected: Email, Name, Company, Phone, LinkedIn
8. User adds: Job Title, Company Size, Industry
9. User clicks "Generate Export"
10. Progress shows for large export
11. Download starts automatically (or link provided)
12. Filename: "acme-leads-enriched-2026-01-11.csv"

**Expected Behavior:**
- Field selection updates preview count (if filtering changes)
- Large exports (>1000) show progress
- Download link valid for 24 hours
- Export includes both original and enriched data
- UTF-8 encoding preserves special characters

**Success Criteria:**
- [ ] Export completes in <60 seconds for 10,000 leads
- [ ] Downloaded file opens correctly in Excel
- [ ] All selected fields are included
- [ ] Special characters (accents, symbols) preserved
- [ ] Enriched-only filter works correctly
- [ ] Download link works for 24 hours

**Edge Cases:**
1. Export 10,000 leads (max size, background job)
2. Export with all available fields selected
3. Export to Excel format with formatting
4. Network interruption during download
5. User requests export while previous export still generating
6. Export includes leads with null/empty enriched fields

**Test Data Requirements:**
- Lead list with 1,000 leads (mixed enriched/not enriched)
- Lead list with 10,000 leads
- Leads with special characters in all fields
- Leads with partially enriched data
- Previously generated export links (test 24-hour expiry)

---

### UX-11-007: Enrichment Job Cancellation

| Field | Value |
|-------|-------|
| **Story ID** | UX-11-007 |
| **Title** | User cancels an in-progress enrichment job |
| **User Persona** | Operations Manager (Rachel, needs to stop incorrect job) |

**Preconditions:**
- User started enrichment on wrong lead list
- Job is 20% complete (100/500 leads processed)
- 80 leads successfully enriched, 20 failed

**User Journey:**
1. User realizes wrong list selected
2. User clicks "Cancel Job" button on job card
3. Confirmation modal: "Cancel enrichment? 100 leads processed, 400 remaining. Credits for processed leads are non-refundable."
4. User clicks "Yes, Cancel"
5. Job status changes to "Cancelling..."
6. Within 10 seconds, status shows "Cancelled"
7. Summary shows: 80 enriched, 20 failed, 400 not processed
8. Credits charged: 80 (only successful enrichments)
9. User can export the 80 enriched leads

**Expected Behavior:**
- Cancellation stops new API calls immediately
- In-flight API calls may complete (up to 5 more leads)
- Credits only charged for successful enrichments
- Partially completed job data is preserved
- User can start new job on same list

**Success Criteria:**
- [ ] Cancel button is visible during processing
- [ ] Confirmation shows accurate counts
- [ ] Job stops within 10 seconds of confirmation
- [ ] Credits are correctly calculated
- [ ] Data from completed enrichments is saved
- [ ] List can be re-enriched starting new job

**Edge Cases:**
1. Cancel when job is 99% complete
2. Cancel immediately after starting (0% complete)
3. Cancel during rate-limiting pause
4. Multiple rapid cancel clicks
5. Cancel with network issues

**Test Data Requirements:**
- Active job at various progress levels
- Job in rate-limited state
- Job with high failure rate

---

### UX-11-008: Lead List Management

| Field | Value |
|-------|-------|
| **Story ID** | UX-11-008 |
| **Title** | User organizes leads into named lists with tags |
| **User Persona** | Account Manager (Jenny, manages leads for multiple campaigns) |

**Preconditions:**
- User has imported leads from multiple sources
- User wants to organize by campaign
- User has 5 existing lead lists

**User Journey:**
1. User views lead list dashboard showing 5 lists
2. User clicks "Create New List"
3. User enters: Name "Q1 Trade Show Leads", Description "Leads from CES 2026"
4. User adds tags: "tradeshow", "Q1-2026", "high-value"
5. User clicks "Create"
6. Empty list is created, user sees "Add leads" prompt
7. User clicks "Import CSV" for this list
8. After import, list shows 200 leads
9. User returns to dashboard, sees new list with 200 leads count
10. User filters lists by tag "tradeshow", sees 2 matching lists

**Expected Behavior:**
- List creation is instant
- Tags are autocompleted from existing tags
- Dashboard sorting options work (by name, date, lead count)
- Tag filtering is multi-select
- List deletion prompts for confirmation

**Success Criteria:**
- [ ] List name accepts 1-255 characters
- [ ] Tags support alphanumeric and hyphen only
- [ ] Dashboard loads in <2 seconds with 50 lists
- [ ] Search filters lists in real-time
- [ ] Deleted lists can be recovered (soft delete)
- [ ] List merge combines leads and deduplicates

**Edge Cases:**
1. Create list with duplicate name
2. Create list with very long name (255 chars)
3. Add 50 tags to a single list
4. Delete list with active enrichment job
5. Merge lists with overlapping leads

**Test Data Requirements:**
- 50 lead lists with varying sizes
- Lists with similar names
- Lists with many tags
- List with active enrichment job

---

### UX-11-009: Retry Failed Enrichments

| Field | Value |
|-------|-------|
| **Story ID** | UX-11-009 |
| **Title** | User retries enrichment for failed leads |
| **User Persona** | Marketing Ops (Derek, ensures data completeness) |

**Preconditions:**
- Completed enrichment job with 50 failed leads (out of 500)
- Failures were due to rate limiting and temporary API issues
- User is viewing completed job details

**User Journey:**
1. User sees job summary: 450 successful, 50 failed
2. User clicks "View Failed" to see failed leads
3. List shows failed leads with error reasons
4. Error categories: "Rate Limited: 30", "Not Found: 15", "API Error: 5"
5. User clicks "Retry Failed"
6. System shows: "Retry 50 leads? Estimated cost: 50 credits"
7. User confirms, new retry job starts
8. Retry job completes: 35 successful (rate limit resolved), 15 still not found
9. User accepts 15 as permanently unrecoverable

**Expected Behavior:**
- Failed leads categorized by error type
- Retry only attempts previously failed leads
- "Not Found" leads can be excluded from retry
- Successful retries update original lead records
- Credit cost for retry is clear

**Success Criteria:**
- [ ] Failed leads are grouped by error type
- [ ] Retry job only processes selected failed leads
- [ ] Rate limit errors recover on retry
- [ ] "Not Found" can be marked as permanent failure
- [ ] Credits charged only for successful retries
- [ ] Retry history linked to original job

**Edge Cases:**
1. All failed leads are "Not Found" (retry pointless)
2. Retry during ongoing API outage
3. Partial retry (select specific failed leads)
4. Multiple retry attempts on same leads
5. Retry when credits are insufficient

**Test Data Requirements:**
- Completed job with mixed failure types
- Leads that will succeed on retry
- Leads that will fail again
- Account with insufficient credits for retry

---

### UX-11-010: Enrichment History and Audit Trail

| Field | Value |
|-------|-------|
| **Story ID** | UX-11-010 |
| **Title** | User reviews enrichment history for compliance |
| **User Persona** | Compliance Officer (Patricia, needs audit trail for GDPR) |

**Preconditions:**
- User's account has 90 days of enrichment history
- Multiple enrichment jobs run across several lists
- User needs to generate compliance report

**User Journey:**
1. User navigates to "Enrichment History" from settings
2. User sees list of all enrichment jobs, sorted by date
3. User filters by date range: Last 30 days
4. User sees: 15 jobs, 3,500 leads enriched, 3,200 credits used
5. User clicks on specific job for details
6. Job detail shows: timestamp, lead count, credit cost, user who initiated
7. User exports history as CSV for compliance records
8. Export includes: job ID, timestamp, lead count, credit cost, list name
9. User can drill into individual lead enrichment timestamps

**Expected Behavior:**
- History shows all enrichment operations
- Filtering by date range works accurately
- Job details include initiating user
- Export maintains complete audit trail
- Individual lead enrichment timestamps available

**Success Criteria:**
- [ ] History retains 90+ days of data
- [ ] Date range filter is accurate
- [ ] Export includes all required audit fields
- [ ] User identity recorded for each operation
- [ ] Cannot delete or modify historical records
- [ ] Pagination works for large history (100+ jobs)

**Edge Cases:**
1. Export history spanning 1 year
2. Filter by specific list name
3. View history for deleted lists
4. History for multiple team members (if applicable)
5. Timezone handling in timestamps

**Test Data Requirements:**
- 90 days of enrichment history
- Jobs from multiple users
- Jobs on lists that were later deleted
- Large history (500+ jobs)

---

# Feature 12: Client Profiles & Context

## Overview
The Client Profiles & Context feature provides multi-client management capabilities for agency users, enabling management of brand voices, SEO configurations, and digital assets per client.

---

### UX-12-001: Create New Client Profile

| Field | Value |
|-------|-------|
| **Story ID** | UX-12-001 |
| **Title** | User creates a new client profile with brand information |
| **User Persona** | Agency Owner (Carlos, onboarding a new client) |

**Preconditions:**
- User is authenticated
- User is on the Client Profiles dashboard
- User has gathered client brand information

**User Journey:**
1. User clicks "+ New Client" button
2. Create profile modal opens
3. User enters required field: Client Name "TechStart Inc"
4. User adds optional fields:
   - Brand Voice: "Innovative, approachable, confident. Balance technical accuracy with accessibility."
   - Primary Goal: "Increase qualified demo requests by 50%"
   - Website: "https://techstart.io"
5. User expands "GHL Integration" section
6. User enters GHL Subaccount Name: "TechStart GHL"
7. User enters GHL Subaccount ID: "ghl_ts_12345"
8. User clicks "Create Profile"
9. Success toast: "Client profile created successfully"
10. New client appears in profile list with active status

**Expected Behavior:**
- Form validates in real-time
- Website URL format validated
- GHL fields are optional
- Profile created with isActive = true
- Profile appears immediately in list
- Audit log records creation

**Success Criteria:**
- [ ] Name field is required (min 1 char)
- [ ] Brand voice accepts up to 2000 characters
- [ ] Website URL is validated for format
- [ ] Profile creation takes <2 seconds
- [ ] New profile appears at top of list
- [ ] Created timestamp is accurate

**Edge Cases:**
1. Create profile with only required name
2. Create profile with all fields populated
3. Duplicate client name (should allow)
4. Very long brand voice description (2000 chars)
5. Invalid website URL format
6. Special characters in client name

**Test Data Requirements:**
- Various client names (short, long, special chars)
- Valid and invalid website URLs
- GHL subaccount credentials (test)
- Brand voice examples of varying lengths

---

### UX-12-002: Configure SEO Settings

| Field | Value |
|-------|-------|
| **Story ID** | UX-12-002 |
| **Title** | User configures SEO settings for a client |
| **User Persona** | SEO Specialist (Amanda, setting up client SEO automation) |

**Preconditions:**
- User has created a client profile
- User is editing the profile's SEO section
- Client has provided SEO requirements

**User Journey:**
1. User opens client profile "Acme Corp"
2. User navigates to "SEO Configuration" tab
3. User enters Site Title: "Acme Corp | Enterprise Solutions Since 1985"
4. User enters Meta Description: "Acme Corp provides enterprise-grade business solutions..."
5. User adds keywords using tag input: "enterprise software", "business automation", "acme corp"
6. User enters robots.txt content in text area
7. User clicks "Preview" to see generated meta tags
8. Preview modal shows how meta tags will appear in search results
9. User clicks "Save SEO Config"
10. Success message confirms save

**Expected Behavior:**
- Keywords accept comma-separated input
- Meta description has character count (160 char recommendation)
- Site title shows length warning if too long
- Preview renders actual meta tag HTML
- Save updates profile without page reload

**Success Criteria:**
- [ ] Site title accepts up to 70 characters (with warning)
- [ ] Meta description shows char count, warns at 160
- [ ] Keywords can be added/removed individually
- [ ] Robots.txt preserves formatting
- [ ] Preview accurately represents search appearance
- [ ] SEO config persists correctly as JSON

**Edge Cases:**
1. Very long site title (>70 chars)
2. Meta description with special characters
3. 50 keywords added
4. Robots.txt with complex rules
5. Empty SEO config (all fields blank)
6. Invalid robots.txt syntax

**Test Data Requirements:**
- Site titles of various lengths
- Meta descriptions with special chars
- Large keyword sets
- Valid and invalid robots.txt examples
- Client profile without SEO config

---

### UX-12-003: Upload and Manage Digital Assets

| Field | Value |
|-------|-------|
| **Story ID** | UX-12-003 |
| **Title** | User uploads and organizes client brand assets |
| **User Persona** | Design Coordinator (Maya, managing client logos and images) |

**Preconditions:**
- User is viewing a client profile
- User has client image files ready
- User is on the "Digital Assets" tab

**User Journey:**
1. User clicks "Upload Assets" button
2. File picker opens, user selects 3 files: logo.png, hero.jpg, team.jpg
3. Upload progress shows for each file
4. System processes images (optimization)
5. Assets appear in grid with status: "Optimizing..."
6. After 5 seconds, status changes to "Ready"
7. User clicks on logo.png asset card
8. Asset detail modal opens
9. User sets Context Tag: "LOGO" (dropdown)
10. User enters Alt Text: "Acme Corp primary logo"
11. User saves asset details
12. Asset card now shows "LOGO" badge

**Expected Behavior:**
- Multiple file upload supported
- Image optimization reduces file size
- Progress visible for each file
- Context tags from enum: HERO, TEAM, TESTIMONIAL, PRODUCT, LOGO, UNKNOWN
- Alt text supports accessibility
- Optimized and original URLs stored

**Success Criteria:**
- [ ] Supports PNG, JPG, GIF, SVG formats
- [ ] Maximum file size: 10MB per image
- [ ] Optimization reduces file size by 30%+
- [ ] Upload progress accurate for each file
- [ ] Context tags update immediately
- [ ] Assets searchable by tag

**Edge Cases:**
1. Upload very large image (10MB boundary)
2. Upload unsupported format (PDF, PSD)
3. Upload image that fails optimization
4. Delete asset that's referenced in content
5. Upload duplicate filename
6. Slow upload (large file, slow connection)

**Test Data Requirements:**
- Images of various formats and sizes
- Image at exactly 10MB
- Unsupported file format
- Images with transparency (PNG)
- Very wide/tall images (aspect ratios)

---

### UX-12-004: Switch Active Client Context

| Field | Value |
|-------|-------|
| **Story ID** | UX-12-004 |
| **Title** | User switches between client contexts for AI operations |
| **User Persona** | Content Writer (Jordan, creating content for multiple clients) |

**Preconditions:**
- User manages 5 client profiles
- User has "Acme Corp" as current active client
- User needs to switch to "TechStart Inc"

**User Journey:**
1. User sees global header: "Active: Acme Corp" with dropdown arrow
2. User clicks dropdown
3. List shows all 5 active clients alphabetically
4. Most recent 3 clients shown at top in "Recent" section
5. User clicks "TechStart Inc"
6. Dropdown closes, header updates: "Active: TechStart Inc"
7. Visual indicator flashes briefly to confirm change
8. User navigates to Content Generation
9. Generated content uses TechStart's brand voice
10. User switches tabs, returns - context persists

**Expected Behavior:**
- Client switch is instant (<200ms)
- Context persists across navigation
- Context persists across browser refresh
- AI operations use active client's brand voice
- Archived clients not shown in dropdown

**Success Criteria:**
- [ ] Switch completes in <200ms
- [ ] Header updates immediately
- [ ] Context persists in session storage
- [ ] AI prompts include brand voice prefix
- [ ] SEO tools use active client's config
- [ ] Assets filter to active client

**Edge Cases:**
1. Switch with unsaved work in current context
2. Active client is archived by another user
3. 50 client profiles (dropdown performance)
4. Switch during AI generation in progress
5. Session expires during switch

**Test Data Requirements:**
- Account with 5 active clients
- Account with 50 clients (performance test)
- Archived client that was previously active
- Client with complete vs minimal profile

---

### UX-12-005: Archive and Restore Client Profile

| Field | Value |
|-------|-------|
| **Story ID** | UX-12-005 |
| **Title** | User archives inactive client and later restores |
| **User Persona** | Agency Owner (Carlos, managing client lifecycle) |

**Preconditions:**
- User has a client "Old Client LLC" that is no longer active
- Client has associated data (assets, SEO config)
- Client is not currently the active context

**User Journey:**
1. User navigates to client profile "Old Client LLC"
2. User clicks "Archive Client" button
3. Confirmation modal: "Archive this client? The profile will be hidden but data preserved."
4. User confirms archive
5. Profile disappears from active list
6. User toggles "Show Archived" filter
7. "Old Client LLC" appears with "Archived" badge
8. 3 months later, client returns
9. User finds archived profile, clicks "Restore"
10. Profile returns to active list with all data intact

**Expected Behavior:**
- Archive is soft delete (isActive = false)
- Archived profiles hidden by default
- Filter reveals archived profiles
- All data preserved during archive
- Restore reinstates active status
- Cannot select archived client as active context

**Success Criteria:**
- [ ] Archive confirmation prevents accidents
- [ ] Archived profiles hidden from main list
- [ ] "Show Archived" filter works
- [ ] All data preserved (assets, SEO, etc.)
- [ ] Restore returns profile to active
- [ ] Archived client cannot be set as active

**Edge Cases:**
1. Archive currently active client (block or switch first)
2. Archive only remaining client
3. Archive client with active AI jobs
4. Restore client with duplicate name (now active)
5. Bulk archive multiple clients

**Test Data Requirements:**
- Active client with full data
- Archived client for restore testing
- Client currently set as active context
- Account with only one client

---

### UX-12-006: Edit Client Profile Inline

| Field | Value |
|-------|-------|
| **Story ID** | UX-12-006 |
| **Title** | User updates client information as brand evolves |
| **User Persona** | Account Manager (Rebecca, keeping client info current) |

**Preconditions:**
- User has an existing client profile "Acme Corp"
- Client has rebranded with new messaging
- User is viewing the profile detail page

**User Journey:**
1. User opens "Acme Corp" profile
2. User clicks on Brand Voice field (shows edit icon on hover)
3. Field transforms into editable text area
4. User updates brand voice description
5. User presses Tab to move to next field
6. Previous field saves automatically (autosave indicator)
7. User updates Primary Goal field similarly
8. User notices "Unsaved changes" indicator
9. User clicks "Save All Changes" button
10. Success toast: "Profile updated successfully"
11. Updated timestamp shows "Last modified: Just now"

**Expected Behavior:**
- Inline editing feels natural (click to edit)
- Autosave prevents data loss
- Save indicator shows pending/saved status
- All fields can be updated except ID
- Changes reflected immediately in AI context

**Success Criteria:**
- [ ] Click-to-edit on all editable fields
- [ ] Autosave triggers after 2 seconds of inactivity
- [ ] Save indicator shows status
- [ ] Validation runs before save
- [ ] Updated timestamp reflects change
- [ ] Optimistic UI updates with rollback on error

**Edge Cases:**
1. Edit cancelled (click away without change)
2. Network error during autosave
3. Concurrent edit by another session
4. Edit field to empty/null value
5. Very rapid edits (debounce handling)

**Test Data Requirements:**
- Client profile with all fields populated
- Simulated network latency
- Concurrent browser sessions

---

### UX-12-007: Brand Voice in AI Content Generation

| Field | Value |
|-------|-------|
| **Story ID** | UX-12-007 |
| **Title** | AI content generation uses client brand voice |
| **User Persona** | Content Marketer (Nina, generating branded content) |

**Preconditions:**
- User has set "Acme Corp" as active client
- Acme Corp has detailed brand voice configured
- User is on Content Generation page

**User Journey:**
1. User navigates to Content Generation
2. Header shows active client: "Acme Corp"
3. User enters prompt: "Write a blog post about productivity"
4. User clicks "Generate"
5. Loading indicator shows AI working
6. Generated content appears in editor
7. Content clearly reflects Acme Corp's "Professional, authoritative" voice
8. Content avoids casual language (per brand voice)
9. User switches to "TechStart Inc" (innovative, approachable)
10. User regenerates same prompt
11. New content reflects TechStart's conversational tone

**Expected Behavior:**
- Brand voice injected into AI system prompt
- Generated content audibly different between clients
- Primary goal influences content direction
- SEO keywords can be incorporated
- Brand voice shown in generation interface

**Success Criteria:**
- [ ] Brand voice visible during generation
- [ ] Generated content matches brand tone
- [ ] Different clients produce different content
- [ ] Primary goal influences content themes
- [ ] User can override brand context if needed

**Edge Cases:**
1. Client has no brand voice configured
2. Brand voice contradicts prompt
3. Generate content without active client
4. Very long brand voice (token limits)
5. Brand voice contains special instructions

**Test Data Requirements:**
- Two clients with distinctly different brand voices
- Client with minimal brand voice
- Client with no brand voice
- Complex prompts with various topics

---

# Feature 13: Sub-Accounts

## Overview
The Sub-Accounts Management System enables seamless integration between Bottleneck-Bots and GoHighLevel sub-accounts with team member management and permission hierarchy.

---

### UX-13-001: Create New GHL Sub-Account

| Field | Value |
|-------|-------|
| **Story ID** | UX-13-001 |
| **Title** | User creates a new GHL sub-account from Bottleneck-Bots |
| **User Persona** | Agency Owner (Marcus, onboarding a new client) |

**Preconditions:**
- User has GHL agency credentials connected
- User has subscription with sub-account creation enabled
- User has client information ready

**User Journey:**
1. User navigates to Sub-Accounts page
2. User clicks "Create Sub-Account"
3. Creation wizard opens with step-by-step form
4. Step 1: Business Information
   - Business Name: "Downtown Fitness"
   - Email: "info@downtownfitness.com"
   - Phone: "+1-555-0123"
   - Timezone: "America/New_York"
5. User clicks Next
6. Step 2: Address (optional)
   - Street, City, State, Postal Code filled
7. User clicks Next
8. Step 3: Branding (optional)
   - User uploads logo
   - Selects primary color: #FF5733
9. User clicks Next
10. Step 4: Review & Confirm
   - Cost estimate shown: "~$0.35"
   - Estimated time: "15-20 minutes"
11. User clicks "Create Sub-Account"
12. Progress screen shows: "Creating sub-account..."
13. Real-time steps display: "Logging into GHL... Navigating to sub-accounts... Filling business details..."
14. After 18 minutes, success: "Sub-account created successfully"
15. New sub-account appears in list, linked to client profile

**Expected Behavior:**
- Wizard guides through all required information
- Cost estimate shown before starting
- Real-time progress updates during creation
- Browser automation handles GHL interaction
- Sub-account ID stored and linked

**Success Criteria:**
- [ ] All business fields validated
- [ ] Cost estimate accurate within 10%
- [ ] Progress updates every 30 seconds
- [ ] Creation completes within 30 minutes
- [ ] Sub-account visible in GHL portal
- [ ] Linked to Bottleneck-Bots client profile

**Edge Cases:**
1. GHL session expires during creation
2. Business name already exists in GHL
3. Invalid email format rejected by GHL
4. Logo upload fails
5. Creation interrupted (network, browser close)
6. GHL UI changes (automation failure)

**Test Data Requirements:**
- Valid business information
- Various timezone selections
- Logo images of different sizes
- Duplicate business name test
- Invalid email formats

---

### UX-13-002: Link Existing Sub-Account

| Field | Value |
|-------|-------|
| **Story ID** | UX-13-002 |
| **Title** | User links existing GHL sub-account to client profile |
| **User Persona** | Agency Admin (Tanya, migrating existing clients) |

**Preconditions:**
- User has existing GHL sub-accounts not linked
- User has corresponding client profiles in Bottleneck-Bots
- User is on Sub-Accounts page

**User Journey:**
1. User clicks "Link Existing Sub-Account"
2. System fetches list of unlinked sub-accounts from GHL
3. List displays: Business Name, Email, Creation Date
4. User searches for "Downtown Fitness"
5. Matching sub-account appears
6. User clicks "Link" button next to it
7. Modal: "Link to which client profile?"
8. User selects "Downtown Fitness" client profile
9. User clicks "Confirm Link"
10. Success: "Sub-account linked successfully"
11. Sub-account now shows in linked accounts list

**Expected Behavior:**
- Fetches sub-accounts via GHL browser automation
- Shows only unlinked sub-accounts
- Search filters list in real-time
- Link updates both sub-account and client profile
- Sync happens after linking

**Success Criteria:**
- [ ] Unlinked sub-accounts fetched within 30 seconds
- [ ] Search filters by name and email
- [ ] Link operation updates database
- [ ] Already-linked accounts hidden from list
- [ ] Audit log records linking operation

**Edge Cases:**
1. No unlinked sub-accounts available
2. Sub-account deleted in GHL after fetch
3. Client profile already has linked sub-account
4. GHL fetch fails/times out
5. Link to archived client profile

**Test Data Requirements:**
- GHL account with multiple sub-accounts
- Mix of linked and unlinked sub-accounts
- Corresponding client profiles
- Archived client profiles

---

### UX-13-003: Team Member Management

| Field | Value |
|-------|-------|
| **Story ID** | UX-13-003 |
| **Title** | User invites team member to sub-account |
| **User Persona** | Agency Owner (Marcus, delegating client access) |

**Preconditions:**
- User has a linked sub-account "Downtown Fitness"
- User wants to add VA to manage this client
- VA has email address ready

**User Journey:**
1. User opens sub-account "Downtown Fitness"
2. User navigates to "Team Members" tab
3. User clicks "Invite Team Member"
4. User enters:
   - Email: va@agency.com
   - First Name: Sarah
   - Last Name: Johnson
   - Role: "User" (not admin)
5. User clicks "Send Invitation"
6. Success: "Invitation sent to va@agency.com"
7. Pending invitation appears in team list
8. VA receives email with invitation link
9. VA clicks link, creates account/logs in
10. VA appears in team list with "Active" status
11. VA can now access this sub-account

**Expected Behavior:**
- Invitation email sent immediately
- Pending status shown until accepted
- Role determines access level
- VA sees only invited sub-accounts
- Audit log tracks invitation

**Success Criteria:**
- [ ] Email sent within 60 seconds
- [ ] Invitation link valid for 7 days
- [ ] Pending status visible in list
- [ ] Role correctly applied on acceptance
- [ ] Multi-sub-account invitation supported

**Edge Cases:**
1. Email already has account (link to existing)
2. Invitation resent before expiry
3. Invitation expires (7 days)
4. Invalid email format
5. Invite to archived sub-account
6. Self-invitation (should fail)

**Test Data Requirements:**
- Valid email addresses for testing
- Existing user accounts
- Expired invitation links
- Sub-accounts with existing team members

---

### UX-13-004: Permission Hierarchy Enforcement

| Field | Value |
|-------|-------|
| **Story ID** | UX-13-004 |
| **Title** | System enforces permission inheritance |
| **User Persona** | Admin (Tanya, configuring access controls) |

**Preconditions:**
- Agency has defined permission templates
- Sub-accounts have assigned templates
- Team members have role-based access

**User Journey:**
1. Admin views permission template "Standard User"
2. Template includes: read contacts, create campaigns, no delete
3. Admin assigns template to sub-account "Downtown Fitness"
4. Team member Sarah (User role) assigned to Downtown Fitness
5. Sarah logs in, accesses Downtown Fitness
6. Sarah can view contacts (allowed)
7. Sarah can create campaign (allowed)
8. Sarah tries to delete contact - action blocked
9. Error message: "Permission denied: Delete contacts not allowed"
10. Admin reviews permission audit log
11. Log shows: "Sarah attempted delete on contacts - denied"

**Expected Behavior:**
- Templates define permission ceiling
- User permissions cannot exceed sub-account level
- Sub-account permissions cannot exceed agency level
- Denied actions logged in audit
- Clear error messages on denial

**Success Criteria:**
- [ ] Permission templates can be created
- [ ] Templates can be assigned to sub-accounts
- [ ] User permissions enforced at runtime
- [ ] Denied actions logged with context
- [ ] Permission changes take effect immediately

**Edge Cases:**
1. User has multiple sub-accounts with different templates
2. Template updated while user is active
3. Admin removes permission user is currently using
4. Circular template inheritance (should prevent)
5. User assigned higher permission than template allows

**Test Data Requirements:**
- Multiple permission templates
- Users with different role levels
- Sub-accounts with assigned templates
- Actions that span permission boundaries

---

### UX-13-005: Resource Quota and Usage Tracking

| Field | Value |
|-------|-------|
| **Story ID** | UX-13-005 |
| **Title** | Admin monitors resource usage per sub-account |
| **User Persona** | Admin (Tanya, managing costs across clients) |

**Preconditions:**
- Multiple sub-accounts with active usage
- Resource quotas defined per account
- Admin dashboard available

**User Journey:**
1. Admin opens "Resource Management" dashboard
2. Dashboard shows all sub-accounts with usage bars
3. "Downtown Fitness" shows: 80% of browser sessions used
4. Admin clicks on "Downtown Fitness" for details
5. Detail view shows:
   - API calls: 450/500 today
   - Browser sessions: 40/50 today
   - Agent executions: 15/20 today
   - Storage: 2.5GB/5GB
6. Usage trend chart shows past 7 days
7. Admin sets alert: "Notify at 90% usage"
8. Admin adjusts quota: Browser sessions 50 -> 75/day
9. Quota update takes effect immediately

**Expected Behavior:**
- Real-time usage display
- Usage updates every minute
- Quotas enforced at runtime
- Alerts triggered at thresholds
- Historical data retained 90 days

**Success Criteria:**
- [ ] Usage visible for all sub-accounts
- [ ] Percentage calculations accurate
- [ ] Alert thresholds configurable
- [ ] Quota changes take effect immediately
- [ ] Historical trend charts load in <2 seconds

**Edge Cases:**
1. Sub-account hits 100% quota
2. Quota changed mid-operation
3. Multiple resources hit limits simultaneously
4. Usage data delayed/missing
5. Timezone affects daily reset

**Test Data Requirements:**
- Sub-accounts with various usage levels
- Historical usage data (7+ days)
- Accounts at quota boundaries
- Alert configurations

---

### UX-13-006: Sub-Account Metrics and Observability

| Field | Value |
|-------|-------|
| **Story ID** | UX-13-006 |
| **Title** | User views operation metrics and cost tracking |
| **User Persona** | Finance Manager (David, tracking automation costs) |

**Preconditions:**
- Sub-account operations have been running
- Metrics collection is active
- User has access to metrics dashboard

**User Journey:**
1. User opens "Metrics" from sub-accounts page
2. Dashboard shows summary:
   - Total operations: 150
   - Success rate: 92%
   - Total cost: $45.67
   - Average duration: 20 minutes
3. User filters by operation type: "Create"
4. Shows 100 create operations, 95% success
5. User clicks on failed operation for details
6. Detail shows: timestamp, error message, cost
7. User exports metrics as CSV for reporting
8. User views anomaly alerts: "Unusual failure spike detected"
9. User drills into anomaly for investigation

**Expected Behavior:**
- Real-time metrics aggregation
- Filtering by type, status, date
- Cost attribution accurate to penny
- Anomaly detection for unusual patterns
- Export for external reporting

**Success Criteria:**
- [ ] Metrics dashboard loads in <2 seconds
- [ ] Filters update results immediately
- [ ] Cost estimates match actual costs
- [ ] Anomalies detected within 5 minutes
- [ ] Prometheus export format correct

**Edge Cases:**
1. No operations in selected period
2. Extremely long operation (outlier)
3. Cost calculation with credits and cash
4. Anomaly false positive
5. Large data export (10,000 operations)

**Test Data Requirements:**
- Operation history (various outcomes)
- Cost data with different rates
- Anomaly-triggering patterns
- Large datasets for export testing

---

# Feature 14: Scheduled Tasks (Cron)

## Overview
The Scheduled Tasks feature enables users to create, manage, and execute recurring browser automation tasks using cron expressions with timezone support.

---

### UX-14-001: Create Daily Scheduled Task

| Field | Value |
|-------|-------|
| **Story ID** | UX-14-001 |
| **Title** | User schedules a daily browser automation task |
| **User Persona** | Marketing Analyst (Priya, monitoring competitor pricing) |

**Preconditions:**
- User is authenticated with active subscription
- User has defined automation configuration
- User is on Scheduled Tasks page

**User Journey:**
1. User clicks "Create Scheduled Task"
2. Task creation form opens
3. User enters:
   - Name: "Daily Competitor Price Check"
   - Description: "Extract competitor pricing from 3 websites"
4. User selects Schedule Type: "Daily"
5. Time picker appears, user selects: 6:00 AM
6. User selects Timezone: "America/Chicago"
7. User expands Automation Config:
   - URL: "https://competitor.com/pricing"
   - Action Type: "extract"
   - Extraction Schema defined
8. User reviews "Next 5 runs" preview
9. User enables "Notify on failure"
10. User clicks "Create Task"
11. Success: "Task scheduled successfully"
12. Task appears in list with next run time displayed

**Expected Behavior:**
- Schedule type changes available options
- Timezone dropdown shows common zones first
- Next runs preview updates in real-time
- Cron expression auto-generated
- Human-readable description shown

**Success Criteria:**
- [ ] Schedule type options: daily, weekly, monthly, cron, once
- [ ] Time picker in 15-minute increments
- [ ] Timezone search/filter works
- [ ] Next 5 runs accurately calculated
- [ ] Human-readable schedule description accurate
- [ ] Task created with correct nextRun timestamp

**Edge Cases:**
1. Schedule for time that already passed today
2. Timezone with DST transition
3. Daily at midnight (edge case)
4. Invalid automation URL
5. Very long task name (255 chars)
6. Duplicate task name (allowed)

**Test Data Requirements:**
- Various timezone selections
- Times near DST transitions
- Valid and invalid URLs
- Automation configs of various complexity

---

### UX-14-002: Configure Complex Cron Expression

| Field | Value |
|-------|-------|
| **Story ID** | UX-14-002 |
| **Title** | Power user configures custom cron expression |
| **User Persona** | DevOps Engineer (Raj, setting up complex schedules) |

**Preconditions:**
- User understands cron syntax
- User needs non-standard schedule
- User is creating scheduled task

**User Journey:**
1. User creates new scheduled task
2. User selects Schedule Type: "Custom (Cron)"
3. Cron input field appears with example: "* * * * *"
4. User enters: "0 9 * * 1-5" (weekdays at 9 AM)
5. Real-time validation shows: "Valid expression"
6. Human-readable shows: "At 09:00, Monday through Friday"
7. User modifies to: "*/15 * * * *" (every 15 minutes)
8. Description updates: "Every 15 minutes"
9. User enters invalid: "60 * * * *"
10. Error shows: "Invalid minute value: 60 (must be 0-59)"
11. User corrects and sees next 5 runs
12. User saves task successfully

**Expected Behavior:**
- Cron validation in real-time
- Human-readable description updates
- Clear error messages for invalid syntax
- Support for ranges, lists, steps
- Preview shows timezone-adjusted times

**Success Criteria:**
- [ ] 5-field cron expression support
- [ ] Real-time validation feedback
- [ ] Human-readable description for all valid expressions
- [ ] Clear error messages for syntax errors
- [ ] Wildcards, ranges (1-5), lists (1,3,5), steps (*/5) supported
- [ ] Next runs preview accurate

**Edge Cases:**
1. Expression with all wildcards
2. Expression that never matches (invalid month/day combo)
3. Very frequent schedule (every minute)
4. Expression with L, W, # operators (not supported - error)
5. Empty expression
6. Expression with leading/trailing spaces

**Test Data Requirements:**
- Various valid cron expressions
- Invalid expressions with different errors
- Edge case expressions
- Performance test with complex expressions

---

### UX-14-003: Timezone-Aware Scheduling

| Field | Value |
|-------|-------|
| **Story ID** | UX-14-003 |
| **Title** | User schedules task in specific timezone |
| **User Persona** | Agency Manager (Lisa, managing global clients) |

**Preconditions:**
- User is in PST timezone
- Client is in EST timezone
- Task should run at 9 AM EST

**User Journey:**
1. User creates scheduled task
2. User enters task details
3. User selects daily at 9:00 AM
4. User searches timezone: "Eastern"
5. Options show: America/New_York, America/Detroit, etc.
6. User selects "America/New_York"
7. Preview shows:
   - "Next run: Jan 12, 2026 9:00 AM EST"
   - "Your local time: Jan 12, 2026 6:00 AM PST"
8. User saves task
9. Task executes at 9:00 AM EST correctly
10. Execution history shows correct times

**Expected Behavior:**
- All IANA timezones available
- User's local time shown for reference
- DST transitions handled correctly
- Execution times consistent with timezone
- History shows execution in task's timezone

**Success Criteria:**
- [ ] Timezone search works
- [ ] Local time conversion shown
- [ ] DST transitions handled (spring forward, fall back)
- [ ] Task executes at correct local time
- [ ] History displays timezone-correct times

**Edge Cases:**
1. Timezone without DST (Arizona, Hawaii)
2. DST transition day (task scheduled during "lost" hour)
3. Timezone changed after task creation
4. UTC+14 and UTC-12 timezones
5. User's browser timezone vs task timezone

**Test Data Requirements:**
- Tasks in various timezones
- Tasks near DST transitions
- Timezone change scenarios
- Edge timezones (UTC+14, etc.)

---

### UX-14-004: Pause and Resume Scheduled Task

| Field | Value |
|-------|-------|
| **Story ID** | UX-14-004 |
| **Title** | User pauses task during maintenance window |
| **User Persona** | Operations (James, managing system maintenance) |

**Preconditions:**
- User has active scheduled task
- Maintenance window scheduled
- Task runs hourly

**User Journey:**
1. User views scheduled task "Hourly Health Check"
2. Next run shows: "In 25 minutes"
3. User clicks "Pause" button
4. Confirmation: "Pause task? It will not run until resumed."
5. User confirms
6. Status changes to "Paused"
7. Next run shows: "-"
8. 25 minutes pass, task does not execute
9. Maintenance completes after 2 hours
10. User clicks "Resume"
11. Next run recalculates: "In 35 minutes" (next interval)
12. Task executes on schedule, status "Active"

**Expected Behavior:**
- Pause immediately stops scheduling
- Paused tasks don't execute
- Resume recalculates from current time
- Missed runs are NOT executed (no catch-up)
- Status clearly indicates paused state

**Success Criteria:**
- [ ] Pause takes effect immediately
- [ ] Paused tasks show clear indicator
- [ ] Resume recalculates next run
- [ ] No catch-up execution for missed runs
- [ ] History shows no executions while paused

**Edge Cases:**
1. Pause task that's currently running
2. Pause immediately after task starts
3. Resume at exact cron interval time
4. Pause/resume rapidly multiple times
5. Pause while in retry mode

**Test Data Requirements:**
- Active hourly task
- Task in various states
- Rapid state change scenarios

---

### UX-14-005: Monitor Execution Progress

| Field | Value |
|-------|-------|
| **Story ID** | UX-14-005 |
| **Title** | User monitors scheduled task execution in real-time |
| **User Persona** | QA Engineer (Emma, monitoring test automation) |

**Preconditions:**
- Scheduled task has just started execution
- User is on task detail page
- Task performs multi-step browser automation

**User Journey:**
1. User sees task status: "Running"
2. Current execution panel shows:
   - Started: 2 minutes ago
   - Status: "In Progress"
   - Step: "Logging in (Step 2/5)"
3. Progress updates in real-time
4. User sees: "Navigating to dashboard (Step 3/5)"
5. Live log entries stream in
6. Execution completes successfully
7. Duration shows: "4 minutes 32 seconds"
8. Output shows extracted data
9. Recording link available for playback
10. Task status returns to "Active"
11. Next run time displayed

**Expected Behavior:**
- Real-time status updates (polling/SSE)
- Step progress visible
- Live log streaming
- Completion updates immediately
- Recording available for review

**Success Criteria:**
- [ ] Status updates every 5 seconds
- [ ] Step progress accurate
- [ ] Logs stream in real-time
- [ ] Duration calculated correctly
- [ ] Browser recording accessible
- [ ] Output/result displayed properly

**Edge Cases:**
1. Execution takes longer than expected
2. Execution fails mid-stream
3. User navigates away and returns
4. Multiple executions queued
5. Browser session terminates unexpectedly

**Test Data Requirements:**
- Multi-step automation tasks
- Tasks of various durations
- Tasks that fail at different stages
- Recording playback files

---

### UX-14-006: Error Notifications and Retry

| Field | Value |
|-------|-------|
| **Story ID** | UX-14-006 |
| **Title** | User receives notification on task failure and retry |
| **User Persona** | Data Analyst (Kevin, relying on automated data collection) |

**Preconditions:**
- Task configured with retry enabled
- Task has email + Slack notifications configured
- Website being scraped has temporary outage

**User Journey:**
1. Scheduled task starts execution
2. Execution fails: "Target element not found"
3. System logs failure, increments attempt count
4. Retry scheduled in 60 seconds (configured delay)
5. User receives Slack notification:
   - "Task 'Daily Report' failed (attempt 1/3)"
   - Error: "Target element not found"
   - "Retrying in 60 seconds"
6. Retry attempt 2 starts, also fails
7. Email notification sent for attempt 2
8. Retry attempt 3 starts, succeeds (website recovered)
9. Final notification: "Task 'Daily Report' succeeded after 3 attempts"
10. Execution history shows all attempts

**Expected Behavior:**
- Retry happens automatically
- Notifications sent per attempt (or configurable)
- Successful retry clears failure state
- All attempts logged in history
- Retry delay respected

**Success Criteria:**
- [ ] Retry attempts match configuration
- [ ] Retry delay accurate
- [ ] Notifications delivered within 60 seconds
- [ ] Success after retry notified
- [ ] All attempts visible in history
- [ ] Max retries prevents infinite loop

**Edge Cases:**
1. All retry attempts fail
2. Retry delay set to 0 (immediate)
3. Max retries set to 0 (no retry)
4. Network failure during retry
5. Notification channel fails

**Test Data Requirements:**
- Tasks with retry configured
- Website that fails then recovers
- Various notification channels
- Retry configurations (0, 1, 10)

---

### UX-14-007: Execution History and Statistics

| Field | Value |
|-------|-------|
| **Story ID** | UX-14-007 |
| **Title** | User reviews task execution history and performance |
| **User Persona** | Operations Manager (Rachel, reviewing automation health) |

**Preconditions:**
- Task has been running daily for 30 days
- Mix of successful and failed executions
- User is on task detail page

**User Journey:**
1. User opens task "Daily Report Generator"
2. Statistics panel shows:
   - Total Executions: 30
   - Success Rate: 93%
   - Average Duration: 4m 12s
   - Last Run: Success (5 hours ago)
3. User scrolls to execution history
4. Paginated list shows last 20 executions
5. User filters by "Failed" status
6. Shows 2 failed executions
7. User clicks on failed execution
8. Detail shows: error message, logs, screenshots
9. User exports history for monthly report
10. CSV includes all execution metadata

**Expected Behavior:**
- Statistics accurate and real-time
- History paginated for performance
- Filters work correctly
- Execution details comprehensive
- Export includes all fields

**Success Criteria:**
- [ ] Statistics update after each execution
- [ ] Success rate calculated correctly
- [ ] Average duration accurate
- [ ] History loads in <1 second
- [ ] Filter by status works
- [ ] Export includes all metadata

**Edge Cases:**
1. Task with 0 executions
2. Task with 1000+ executions
3. All executions successful
4. All executions failed
5. Very long execution logs

**Test Data Requirements:**
- Task with 30+ days of history
- Mix of success/failure results
- Tasks with large execution counts
- Executions with verbose logs

---

### UX-14-008: Manual Task Execution

| Field | Value |
|-------|-------|
| **Story ID** | UX-14-008 |
| **Title** | User manually triggers scheduled task for testing |
| **User Persona** | Developer (Alex, testing automation changes) |

**Preconditions:**
- User has scheduled task configured
- User wants to test before next scheduled run
- Task is not currently running

**User Journey:**
1. User opens scheduled task
2. User clicks "Run Now" button
3. Confirmation: "Run task immediately? This won't affect the scheduled next run."
4. User confirms
5. Execution starts immediately
6. Status shows: "Running (Manual)"
7. User watches progress
8. Execution completes in 3 minutes
9. Result shows in execution history
10. Execution record shows triggerType: "manual"
11. Next scheduled run unchanged
12. User iterates: makes automation changes, runs manually again

**Expected Behavior:**
- Manual run starts within 2 seconds
- Clearly marked as manual in history
- Doesn't affect scheduled timing
- Uses current automation config
- All normal execution tracking applies

**Success Criteria:**
- [ ] Manual run starts immediately
- [ ] Confirmation prevents accidents
- [ ] triggerType shows "manual"
- [ ] Scheduled nextRun unchanged
- [ ] Can run while another manual run active? (policy)
- [ ] Manual runs count in statistics

**Edge Cases:**
1. Manual run while scheduled run about to start
2. Manual run on paused task
3. Manual run on archived task (should block)
4. Rapid manual runs (rate limiting)
5. Manual run during maintenance

**Test Data Requirements:**
- Various task states
- Tasks near scheduled run time
- Rate limiting test scenarios

---

### UX-14-009: View Upcoming Scheduled Executions

| Field | Value |
|-------|-------|
| **Story ID** | UX-14-009 |
| **Title** | User views upcoming task executions across all tasks |
| **User Persona** | Ops Manager (Rachel, planning capacity) |

**Preconditions:**
- User has 15 scheduled tasks
- Tasks have various schedules
- User wants to see next 24 hours

**User Journey:**
1. User navigates to "Upcoming Executions"
2. Dashboard shows timeline view
3. Filter: Next 24 hours (default)
4. Shows 8 tasks scheduled in next 24 hours
5. Timeline visualization shows distribution
6. User changes filter to: Next 7 days
7. Shows 35 scheduled executions
8. User clicks on specific execution
9. Task details shown in sidebar
10. User identifies potential conflict (3 tasks at same time)
11. User adjusts one task's schedule to spread load

**Expected Behavior:**
- All active tasks included
- Accurate time calculations
- Visual timeline helpful
- Filter options: 1h, 6h, 24h, 48h, 7d
- Shows task names and scheduled times

**Success Criteria:**
- [ ] Query includes all active tasks
- [ ] Correct timezone handling
- [ ] Sorted by next run time
- [ ] Pagination for large results
- [ ] Filter by time window works
- [ ] Timeline visualization loads <2 seconds

**Edge Cases:**
1. No tasks scheduled in window
2. 100 tasks in 1-hour window
3. Tasks in different timezones
4. Paused tasks excluded
5. One-time tasks that have completed

**Test Data Requirements:**
- Many tasks with various schedules
- Tasks in different timezones
- Dense scheduling periods
- Sparse scheduling periods

---

### UX-14-010: Delete/Archive Scheduled Task

| Field | Value |
|-------|-------|
| **Story ID** | UX-14-010 |
| **Title** | User archives obsolete scheduled task |
| **User Persona** | Agency Owner (Marcus, cleaning up old automations) |

**Preconditions:**
- User has task that is no longer needed
- Task has 6 months of execution history
- User wants to preserve history

**User Journey:**
1. User opens scheduled task "Old Campaign Monitor"
2. User clicks "Delete" button
3. Modal shows: "Delete scheduled task?"
4. Options: "Archive (preserve history)" vs "Delete permanently"
5. User selects "Archive"
6. Confirmation: "Task will stop running and be archived."
7. User confirms
8. Task disappears from active list
9. User toggles "Show Archived"
10. Archived task appears with history intact
11. User can view past executions
12. User can restore if needed

**Expected Behavior:**
- Archive is soft delete
- Archived tasks don't execute
- History preserved
- Restore returns to active
- Permanent delete removes all data

**Success Criteria:**
- [ ] Archive sets status to "archived"
- [ ] Archived hidden from active list
- [ ] Execution history preserved
- [ ] Restore returns task to active
- [ ] Permanent delete is irreversible

**Edge Cases:**
1. Delete task currently running
2. Delete task with scheduled run in 1 minute
3. Archive then restore
4. Permanent delete confirmation
5. Delete all tasks

**Test Data Requirements:**
- Tasks with various history lengths
- Currently running tasks
- Recently created tasks
- Archived tasks for restore testing

---

# Feature 15: Agency Tasks

## Overview
The Agency Tasks feature provides a comprehensive task management system for creating, assigning, tracking, and executing automation tasks from multiple sources.

---

### UX-15-001: Create Manual Task

| Field | Value |
|-------|-------|
| **Story ID** | UX-15-001 |
| **Title** | User creates a task manually with all details |
| **User Persona** | Agency Owner (Sofia, tracking client work) |

**Preconditions:**
- User is authenticated
- User is on Agency Tasks page
- User has client request to track

**User Journey:**
1. User clicks "Create Task" button
2. Task creation form opens
3. User enters:
   - Title: "Update Facebook Ads for Downtown Fitness"
   - Description: "Client wants new ad copy for January promotion"
   - Task Type: "browser_automation"
   - Priority: "High"
   - Urgency: "Soon"
4. User expands Advanced Options:
   - Deadline: January 15, 2026
   - Tags: "facebook", "ads", "downtown-fitness"
5. User toggles "Requires Human Review" ON
6. User clicks "Create Task"
7. Success: "Task created successfully"
8. Task appears at top of task list
9. Status shows: "Pending" (awaiting review)

**Expected Behavior:**
- All fields validate in real-time
- Task type determines available configs
- Priority affects queue position
- Human review flag prevents auto-execution
- Task immediately visible in list

**Success Criteria:**
- [ ] Title required (1-500 chars)
- [ ] Task types from predefined list
- [ ] Priority levels: low, medium, high, critical
- [ ] Deadline date picker works
- [ ] Tags accept free-form input
- [ ] Task created with "pending" status

**Edge Cases:**
1. Create task with only required fields
2. Very long description (5000 chars)
3. Deadline in the past (warning)
4. 50 tags added
5. Special characters in title

**Test Data Requirements:**
- Various task types
- Different priority/urgency combinations
- Deadline scenarios
- Tag variations

---

### UX-15-002: List and Filter Tasks

| Field | Value |
|-------|-------|
| **Story ID** | UX-15-002 |
| **Title** | User filters and searches task list |
| **User Persona** | Operations Manager (Rachel, prioritizing work) |

**Preconditions:**
- User has 200 tasks in various states
- User needs to find urgent pending tasks
- User is on Agency Tasks page

**User Journey:**
1. User views task list (showing 50 tasks)
2. User clicks "Status" filter
3. Selects: "Pending", "Queued"
4. List updates to show 35 matching tasks
5. User adds "Priority" filter: "High", "Critical"
6. List shows 8 high-priority pending/queued tasks
7. User types in search box: "facebook"
8. List shows 3 tasks matching "facebook"
9. User sorts by "Deadline" ascending
10. User clicks on task to view details
11. User clears filters to see all tasks

**Expected Behavior:**
- Filters combine with AND logic
- Search is real-time (debounced)
- Sort persists during filtering
- Pagination maintained
- Total count updates with filters

**Success Criteria:**
- [ ] Multi-status filter works
- [ ] Priority filter works
- [ ] Search filters title and description
- [ ] Sort options: created, updated, priority, deadline
- [ ] Pagination shows 50 per page
- [ ] Total count accurate

**Edge Cases:**
1. Filter returns 0 results
2. Filter all statuses (no filter effect)
3. Search with special characters
4. Sort by null deadline field
5. Rapid filter changes

**Test Data Requirements:**
- 200+ tasks in various states
- Tasks with and without deadlines
- Tasks with various tags
- Tasks with special characters in title

---

### UX-15-003: Approve Task for Execution

| Field | Value |
|-------|-------|
| **Story ID** | UX-15-003 |
| **Title** | User approves task requiring human review |
| **User Persona** | Agency Owner (Sofia, quality control) |

**Preconditions:**
- Task was created with "Requires Human Review" enabled
- Task is in "Pending" status
- User has approval authority

**User Journey:**
1. User sees notification: "3 tasks awaiting review"
2. User clicks notification, filters to review-required tasks
3. User opens task: "Update Facebook Ads"
4. User reviews task details and automation config
5. User clicks "Approve" button
6. Modal: "Approve task for execution?"
7. User adds notes: "Verified ad copy with client"
8. User clicks "Confirm Approval"
9. Success: "Task approved and queued for execution"
10. Task status changes to "Queued"
11. Review badge disappears
12. Task begins execution (if assignedToBot is true)

**Expected Behavior:**
- Only review-required tasks show approve button
- Approval changes status to queued
- Notes are stored with approval
- Auto-execution triggers after approval
- Reviewer identity recorded

**Success Criteria:**
- [ ] Approve button only for review-required tasks
- [ ] Approval notes optional but stored
- [ ] Status changes to "queued"
- [ ] humanReviewedBy set to approving user
- [ ] humanReviewedAt timestamp set
- [ ] Auto-execution triggers if conditions met

**Edge Cases:**
1. Approve already-approved task (should fail)
2. Approve task in progress (should fail)
3. Approve with very long notes
4. Concurrent approval attempts
5. Approve then immediately cancel

**Test Data Requirements:**
- Tasks requiring review in various states
- Tasks already approved
- Edge case tasks

---

### UX-15-004: Reject Task with Reason

| Field | Value |
|-------|-------|
| **Story ID** | UX-15-004 |
| **Title** | User rejects inappropriate task |
| **User Persona** | Agency Owner (Sofia, preventing mistakes) |

**Preconditions:**
- Task was created via webhook
- Task content is incorrect/inappropriate
- User is reviewing pending tasks

**User Journey:**
1. User opens pending task from webhook
2. Task title: "Send $10,000 to Nigerian Prince"
3. User recognizes this as spam/scam
4. User clicks "Reject" button
5. Modal: "Reject task? Reason required."
6. User enters: "Spam message, not a legitimate client request"
7. User clicks "Confirm Rejection"
8. Success: "Task rejected"
9. Task status changes to "Cancelled"
10. Task shows: "Rejected: Spam message..."
11. Task removed from active queue
12. History preserved for audit

**Expected Behavior:**
- Rejection requires reason (1-1000 chars)
- Status set to cancelled
- Reason stored in statusReason
- Task does not execute
- Audit trail maintained

**Success Criteria:**
- [ ] Reason is required
- [ ] Status changes to "cancelled"
- [ ] statusReason prefixed with "Rejected: "
- [ ] humanReviewedBy/At set
- [ ] Task hidden from active lists
- [ ] History shows rejection details

**Edge Cases:**
1. Reject with minimum reason (1 char)
2. Reject with maximum reason (1000 chars)
3. Reject task that started execution
4. Empty reason (should fail validation)
5. Reject already rejected task

**Test Data Requirements:**
- Tasks from various sources
- Tasks in various states
- Edge case content

---

### UX-15-005: View Task Execution in Progress

| Field | Value |
|-------|-------|
| **Story ID** | UX-15-005 |
| **Title** | User monitors task execution real-time |
| **User Persona** | VA (Jordan, monitoring automated work) |

**Preconditions:**
- Task has started execution
- Browser automation is in progress
- User is viewing task details

**User Journey:**
1. User opens task with status "In Progress"
2. Execution panel shows:
   - Started: 2 minutes ago
   - Status: "Running"
   - Step: "3 of 7 completed"
   - Current: "Filling form fields"
3. Live log shows recent actions
4. Progress bar fills as steps complete
5. After 5 minutes, step 6 starts
6. Screenshot preview shows current browser state
7. Execution completes successfully
8. Status changes to "Completed"
9. Result summary displayed
10. Recording link available

**Expected Behavior:**
- Real-time status updates
- Step progress visible
- Screenshots available during execution
- Completion updates immediately
- Recording playback available

**Success Criteria:**
- [ ] Status updates every 5 seconds
- [ ] Step counter accurate
- [ ] Current step description shown
- [ ] Live logs stream
- [ ] Duration tracked correctly
- [ ] Recording URL accessible

**Edge Cases:**
1. Very long execution (>30 minutes)
2. Execution fails mid-stream
3. Browser disconnects
4. User leaves and returns
5. Multiple tasks executing

**Test Data Requirements:**
- Multi-step automation tasks
- Tasks of various durations
- Failure scenarios
- Concurrent executions

---

### UX-15-006: Manual Task Execution

| Field | Value |
|-------|-------|
| **Story ID** | UX-15-006 |
| **Title** | User manually triggers task execution |
| **User Persona** | Power User (Alex, testing before deploy) |

**Preconditions:**
- Task is in pending or queued status
- Task does not require human review (or already approved)
- User wants to run immediately

**User Journey:**
1. User opens task "Daily Data Extraction"
2. Task status: "Pending" (scheduled for later)
3. User clicks "Execute Now"
4. Confirmation: "Run this task immediately?"
5. User confirms
6. Task starts execution
7. Status changes to "In Progress"
8. User monitors execution
9. Execution completes successfully
10. Execution record shows triggeredBy: "manual"
11. User can run again if needed

**Expected Behavior:**
- Execute Now available for eligible tasks
- Confirmation prevents accidents
- Starts immediately (within 2 seconds)
- Execution tracked separately
- Can execute multiple times

**Success Criteria:**
- [ ] Execute button on eligible tasks only
- [ ] Blocked for in_progress tasks
- [ ] Blocked for tasks requiring review
- [ ] Execution starts immediately
- [ ] triggeredBy shows "manual"
- [ ] Task status updated correctly

**Edge Cases:**
1. Execute task in progress (should fail)
2. Execute completed task (allowed? configurable)
3. Execute failed task (retry)
4. Rapid execute clicks
5. Execute task with dependencies

**Test Data Requirements:**
- Tasks in various states
- Tasks with/without review requirements
- Failed tasks for retry

---

### UX-15-007: View Task Queue

| Field | Value |
|-------|-------|
| **Story ID** | UX-15-007 |
| **Title** | User views current task queue status |
| **User Persona** | Ops Manager (Rachel, capacity planning) |

**Preconditions:**
- Multiple tasks in various queue states
- Some tasks running, others waiting
- User needs queue visibility

**User Journey:**
1. User navigates to "Task Queue" view
2. Dashboard shows:
   - Running: 3 tasks
   - Pending: 12 tasks
   - Scheduled: 5 tasks (future)
3. Running tasks panel shows active executions
4. Pending queue shows priority-ordered list
5. User sees queue position for each pending task
6. "Data Extraction" is position 4 of 12
7. User clicks on running task for live view
8. User can reorder pending tasks (drag-drop)
9. Scheduled tasks show next run time
10. Real-time updates as tasks complete

**Expected Behavior:**
- Running tasks shown with progress
- Pending ordered by priority, then created
- Queue position calculated
- Scheduled shows future tasks only
- Real-time updates

**Success Criteria:**
- [ ] Running count accurate
- [ ] Pending count accurate
- [ ] Scheduled count accurate
- [ ] Priority sorting correct
- [ ] Queue position shown
- [ ] Real-time updates work

**Edge Cases:**
1. No tasks in queue
2. 100 pending tasks
3. Task completes while viewing
4. New task added while viewing
5. Priority changed while in queue

**Test Data Requirements:**
- Tasks in all queue states
- Various priority levels
- Scheduled future tasks
- High-volume queue

---

### UX-15-008: Task Statistics Dashboard

| Field | Value |
|-------|-------|
| **Story ID** | UX-15-008 |
| **Title** | User reviews aggregate task statistics |
| **User Persona** | Agency Owner (Sofia, reviewing automation ROI) |

**Preconditions:**
- User has been using tasks for 30 days
- Significant task volume
- User wants performance overview

**User Journey:**
1. User opens "Task Statistics" dashboard
2. Summary cards show:
   - Total Tasks: 450
   - Pending: 12
   - In Progress: 3
   - Completed: 400
   - Failed: 35
3. Priority breakdown chart shows distribution
4. "Pending Human Review" count: 5
5. "Overdue Tasks" count: 2 (past deadline, not complete)
6. "Scheduled Today" count: 8
7. Success rate trend chart: Last 30 days
8. Average completion time: 4 minutes
9. User exports report for stakeholders

**Expected Behavior:**
- All metrics real-time accurate
- Charts load quickly
- Counts match filtered list views
- Overdue calculation correct
- Export includes all metrics

**Success Criteria:**
- [ ] Status counts match database
- [ ] Priority breakdown accurate
- [ ] Overdue calculation: deadline < now AND status NOT in [completed, cancelled]
- [ ] Today = current date in user's timezone
- [ ] Charts render <2 seconds
- [ ] Export produces valid CSV/PDF

**Edge Cases:**
1. Zero tasks (empty state)
2. All tasks in one status
3. No deadlines set
4. Timezone edge (midnight)
5. Very large task count (10,000)

**Test Data Requirements:**
- Tasks across all statuses
- Tasks with/without deadlines
- Overdue tasks
- Various date ranges

---

### UX-15-009: Task Dependencies

| Field | Value |
|-------|-------|
| **Story ID** | UX-15-009 |
| **Title** | User creates task with dependencies |
| **User Persona** | Workflow Designer (Kim, sequencing multi-step process) |

**Preconditions:**
- User has multi-step workflow
- Steps must execute in order
- User is creating tasks

**User Journey:**
1. User creates Task A: "Extract Product Data"
2. Task A created successfully
3. User creates Task B: "Transform Data"
4. In Task B creation, user selects "Depends On"
5. User searches and selects Task A
6. Task B shows dependency badge
7. Task B status: "Pending (Waiting on Task A)"
8. Task A executes and completes
9. Task B automatically becomes "Queued"
10. Task B executes using Task A's output
11. Dependency chain visible in task detail

**Expected Behavior:**
- Dependencies searchable by name
- Blocked tasks show what they're waiting on
- Completion triggers dependent tasks
- Failure of dependency blocks dependent
- Circular dependencies prevented

**Success Criteria:**
- [ ] Dependency selection works
- [ ] blockedBy field set correctly
- [ ] Dependent task auto-queues on completion
- [ ] Failure propagates to dependent tasks
- [ ] Circular dependency detection (future)
- [ ] Dependency visualization available

**Edge Cases:**
1. Dependency on completed task (proceeds immediately)
2. Dependency on failed task
3. Dependency on cancelled task
4. Multiple dependencies
5. Dependency chain 5 levels deep

**Test Data Requirements:**
- Tasks with dependencies
- Dependency chains
- Failed dependency scenarios
- Various task states

---

### UX-15-010: Bulk Task Operations

| Field | Value |
|-------|-------|
| **Story ID** | UX-15-010 |
| **Title** | User performs bulk status update on tasks |
| **User Persona** | Ops Manager (Rachel, mass task management) |

**Preconditions:**
- User has multiple tasks needing same action
- User wants to bulk cancel stale tasks
- User is on filtered task list

**User Journey:**
1. User filters tasks: Status = "Pending", Created > 7 days ago
2. List shows 25 stale pending tasks
3. User clicks "Select All" checkbox
4. 25 tasks selected (checkboxes shown)
5. User clicks "Bulk Actions" button
6. Options: Cancel, Change Priority, Add Tag
7. User selects "Cancel"
8. Modal: "Cancel 25 tasks? Reason (optional):"
9. User enters: "Cleaning up stale tasks"
10. User clicks "Apply"
11. Progress: "Cancelling... 15/25"
12. Complete: "25 tasks cancelled successfully"
13. Tasks disappear from filtered view

**Expected Behavior:**
- Select all respects current filter
- Bulk action applies to all selected
- Progress shown for large operations
- Errors reported per-task if any
- Success/failure summary provided

**Success Criteria:**
- [ ] Select all/none works
- [ ] Individual selection works
- [ ] Bulk cancel sets status correctly
- [ ] Bulk priority change works
- [ ] Progress shown for large batches
- [ ] Errors don't stop entire batch

**Edge Cases:**
1. Bulk action on 500 tasks
2. Some selected tasks changed by another user
3. Bulk action includes ineligible tasks
4. Network failure mid-batch
5. Bulk action mixed success/failure

**Test Data Requirements:**
- Large number of tasks for bulk selection
- Tasks in different states
- Concurrent modification scenarios

---

## Test Execution Guidelines

### Priority Order for Testing
1. **P0 - Critical Path**: UX stories with core functionality (create, execute, complete)
2. **P1 - Primary Flows**: Standard user journeys (filter, monitor, review)
3. **P2 - Edge Cases**: Boundary conditions and error scenarios
4. **P3 - Performance**: Load testing and responsiveness

### Test Environment Requirements
- Staging environment with realistic data volume
- Test accounts with various permission levels
- Mock API services for external integrations (Apify, GHL)
- Browser recording capability for issue documentation

### Reporting Format
Each tested UX story should document:
- Pass/Fail status for each success criterion
- Actual behavior vs expected behavior for failures
- Screenshots/recordings for visual issues
- Performance metrics where applicable
- Severity classification for defects

---

**Document Version History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Development Team | Initial creation |
