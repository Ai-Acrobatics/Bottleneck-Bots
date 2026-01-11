# UXS-008: Lead Management System - User Experience Stories

**Document Version:** 1.0
**Last Updated:** 2026-01-11
**Feature:** Lead Management System
**Category:** Lead Management
**Status:** Active

---

## Table of Contents

1. [UXS-008-01: Bulk Lead Upload via CSV](#uxs-008-01-bulk-lead-upload-via-csv)
2. [UXS-008-02: Lead Enrichment with Apify Integration](#uxs-008-02-lead-enrichment-with-apify-integration)
3. [UXS-008-03: Lead List Filtering and Search](#uxs-008-03-lead-list-filtering-and-search)
4. [UXS-008-04: Individual Lead Detail Viewing](#uxs-008-04-individual-lead-detail-viewing)
5. [UXS-008-05: Lead Scoring and Qualification](#uxs-008-05-lead-scoring-and-qualification)
6. [UXS-008-06: Export Leads to CSV/JSON](#uxs-008-06-export-leads-to-csvjson)
7. [UXS-008-07: Tag Management and Bulk Tagging](#uxs-008-07-tag-management-and-bulk-tagging)
8. [UXS-008-08: Lead List Creation and Organization](#uxs-008-08-lead-list-creation-and-organization)
9. [UXS-008-09: Batch Lead Enrichment with Credit Management](#uxs-008-09-batch-lead-enrichment-with-credit-management)
10. [UXS-008-10: Lead Import Column Mapping](#uxs-008-10-lead-import-column-mapping)

---

## UXS-008-01: Bulk Lead Upload via CSV

### Story ID
UXS-008-01

### Title
Bulk Lead Upload via CSV File

### Persona
**Sarah - Sales Operations Manager**
Sarah manages a team of 8 SDRs at a B2B SaaS company. She regularly receives lead lists from trade shows, webinars, and purchased databases. She needs to quickly import these leads into the system so her team can begin outreach. Sarah is comfortable with spreadsheets and expects a straightforward upload process with clear feedback.

### Scenario
Sarah has just returned from a trade show with a CSV file containing 500 leads collected from booth visitors. The file includes columns for first name, last name, email, company, and job title. She needs to import these leads before the morning standup so her team can begin follow-up calls. The file was exported from the trade show's lead capture app and has non-standard column names like "Contact Email" and "Organization".

### User Goal
Successfully import a CSV file of 500 leads into a new lead list, mapping the CSV columns to the appropriate system fields, and have the leads available for team access within 5 minutes.

### Preconditions
- User is logged in with appropriate permissions (Admin or Sales Manager role)
- User has an active subscription with lead upload capability
- CSV file is properly formatted (UTF-8 encoding, comma-delimited)
- File size is under 10MB limit
- User has sufficient storage quota for the import

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|------------|-------------------------|
| 1 | Navigates to "Leads" section from main navigation | System displays Lead Lists dashboard with existing lists and "Upload Leads" button prominently displayed |
| 2 | Clicks "Upload Leads" or "New Lead List" button | System opens upload dialog/modal with drag-and-drop zone and file browser option |
| 3 | Drags CSV file onto drop zone OR clicks "Browse" and selects file | System shows file name, size (e.g., "tradeshow_leads.csv - 245 KB"), and upload progress bar |
| 4 | Waits for file processing | Progress bar fills to 100%, system displays "Processing file..." then shows column mapping interface |
| 5 | Reviews auto-detected column mappings | System displays mapping table showing: Source columns (e.g., "Contact Email") mapped to Target fields (e.g., "Email") with auto-detection applied. Email field shows green checkmark as required field |
| 6 | Adjusts any incorrect mappings using dropdowns | Dropdown shows standard fields (First Name, Last Name, Email*, Phone, Company, Job Title, Skip) with visual indicator for already-mapped fields |
| 7 | Enters list name (e.g., "Trade Show Q1 2026") and optional description | Text input accepts name, character counter shows limit (100 chars). Description field is optional |
| 8 | Clicks "Import Leads" button | System validates mappings, shows confirmation dialog: "Import 500 leads into 'Trade Show Q1 2026'?" |
| 9 | Confirms import | System shows import progress: "Importing... 127/500 leads" with estimated time remaining |
| 10 | Views completion notification | System displays success message: "Successfully imported 498 leads. 2 leads skipped (duplicate emails)." with link to view list |
| 11 | Clicks "View Lead List" | System navigates to the new lead list detail page showing all imported leads in table format |

### Expected Outcomes
- New lead list created with user-specified name
- All valid leads imported with correct field mappings
- Duplicate leads identified and handled (skipped or merged based on settings)
- Import activity logged in system audit trail
- User receives confirmation with import statistics
- Lead list is immediately accessible to authorized team members
- Original CSV preserved for reference if needed

### Acceptance Criteria

```gherkin
Scenario: Successful CSV upload with standard columns
  Given I am logged in as a user with lead upload permissions
  And I have a valid CSV file with email, first_name, last_name columns
  When I navigate to the Lead Lists page
  And I click the "Upload Leads" button
  And I drag and drop my CSV file onto the upload zone
  Then I should see the file name and size displayed
  And the upload progress should show completion
  And I should see the column mapping interface with auto-detected mappings

Scenario: Column mapping validation
  Given I have uploaded a CSV file successfully
  And I am on the column mapping screen
  When the email column is not mapped to any field
  Then I should see an error message "Email field is required"
  And the "Import Leads" button should be disabled

Scenario: Import completion with duplicates
  Given I have mapped all required columns correctly
  And my CSV contains 100 leads where 5 have duplicate emails
  When I click "Import Leads" and confirm the import
  Then I should see a progress indicator during import
  And upon completion I should see "Successfully imported 95 leads. 5 leads skipped (duplicate emails)"
  And I should be able to view the imported leads in the list
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Empty CSV file | Display error: "The uploaded file is empty. Please select a file with lead data." |
| CSV with only headers, no data rows | Display error: "No leads found in file. Please ensure your CSV contains data rows." |
| File exceeds 10MB limit | Display error before upload: "File size exceeds 10MB limit. Please reduce file size or split into multiple uploads." |
| Invalid file format (.xlsx, .pdf) | Display error: "Invalid file format. Please upload a CSV file." |
| CSV with missing email column | Column mapping shows warning, Import button disabled until email is mapped |
| Malformed CSV (inconsistent columns) | Display error: "CSV format error on row X. Please check file formatting." |
| Network interruption during upload | Display error with retry option: "Upload interrupted. Click to retry." Resume capability if possible |
| Special characters in data (unicode) | Properly handle UTF-8 encoding, preserve special characters |
| Very long field values (>500 chars) | Truncate with warning: "Some values were truncated to fit field limits" |
| Duplicate file upload (same leads) | Detect duplicates based on email, offer options: Skip, Update, Create duplicate |

### Test Data Requirements

**Sample CSV File: `test_leads_valid.csv`**
```csv
first_name,last_name,email,company,job_title,phone
John,Smith,john.smith@acmecorp.com,Acme Corporation,VP Sales,+1-555-0101
Jane,Doe,jane.doe@techstart.io,TechStart Inc,CEO,+1-555-0102
Robert,Johnson,robert.j@globaltech.com,GlobalTech,Director of Engineering,
Emily,Williams,emily.w@innovate.co,Innovate LLC,Product Manager,+1-555-0104
Michael,Brown,michael.brown@enterprise.com,Enterprise Solutions,Account Executive,+1-555-0105
```

**Sample CSV File: `test_leads_nonstandard_columns.csv`**
```csv
Contact Email,First,Last,Organization,Title
test1@example.com,Alice,Anderson,TestCo,Manager
test2@example.com,Bob,Baker,SampleOrg,Director
```

**Sample CSV File: `test_leads_duplicates.csv`**
```csv
email,name
dup@test.com,First Entry
dup@test.com,Duplicate Entry
unique@test.com,Unique Entry
```

### Priority
**P0 - Critical**

Core functionality required for lead management. Blocking for all downstream lead operations including enrichment, campaigns, and exports.

---

## UXS-008-02: Lead Enrichment with Apify Integration

### Story ID
UXS-008-02

### Title
Lead Enrichment with Apify Integration

### Persona
**Marcus - Business Development Representative**
Marcus is a BDR who needs to research prospects before outreach. He receives basic lead information but needs additional context like company size, industry, and LinkedIn profiles to personalize his messages. He has a daily quota of 50 leads to enrich and expects the process to be automated and credit-efficient.

### Scenario
Marcus has a list of 75 leads from a recent webinar signup. He has basic information (name, email, company) but needs enriched data including LinkedIn URLs, job titles, company size, and industry classification. He has 200 enrichment credits remaining this month and needs to prioritize which leads to enrich based on cost-effectiveness.

### User Goal
Enrich leads with comprehensive professional data from Apify integration, maximizing data quality while managing credit consumption, and complete enrichment within his daily workflow timeline.

### Preconditions
- User has access to lead enrichment feature
- Organization has enrichment credits available (minimum 1 per lead)
- Apify integration is properly configured at organization level
- Target leads have at least email address populated
- Network connectivity to Apify services

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|------------|-------------------------|
| 1 | Navigates to a lead list detail page | System displays lead table with status column showing "Pending" for un-enriched leads |
| 2 | Reviews credit balance in header/sidebar | Credit widget displays: "Credits: 200 remaining" with link to purchase more |
| 3 | Selects leads to enrich using checkboxes | System updates selection counter: "15 leads selected" and enables bulk actions |
| 4 | Clicks "Enrich Selected" button | System displays enrichment preview modal: "Enrich 15 leads? Estimated cost: 15 credits" |
| 5 | Reviews enrichment preview with field list | Modal shows fields to be enriched: LinkedIn, Job Title, Company Size, Industry, Phone |
| 6 | Confirms enrichment by clicking "Start Enrichment" | System initiates enrichment, shows progress: "Enriching leads... 0/15 complete" |
| 7 | Monitors real-time progress | Progress bar updates every few seconds, individual lead statuses change from "Pending" to "Processing" |
| 8 | Views enrichment completion | Progress shows "15/15 complete", notification: "Enrichment complete. 13 succeeded, 2 failed" |
| 9 | Reviews enriched leads | Lead table updates with enriched data visible in new columns (Job Title, LinkedIn link) |
| 10 | Clicks on enriched lead to view full details | Lead detail modal shows original data + enriched data side-by-side with confidence score |
| 11 | Retries failed enrichment for specific leads | "Retry" button available for failed leads, system re-attempts enrichment |

### Expected Outcomes
- Selected leads enriched with additional data fields
- Enrichment status updated (enriched/failed) per lead
- Credits deducted only for successful enrichments
- Enrichment history logged with timestamps
- Failed enrichments identified with reason codes
- Real-time progress visibility during batch enrichment
- Data source attribution recorded for compliance

### Acceptance Criteria

```gherkin
Scenario: Successful single lead enrichment
  Given I am viewing a lead list with pending leads
  And I have at least 1 enrichment credit available
  When I click the "Enrich" action for a single lead
  Then the lead status should change to "Processing"
  And after completion the status should show "Enriched"
  And the enriched data fields should be populated
  And my credit balance should decrease by 1

Scenario: Batch enrichment with credit preview
  Given I have selected 25 leads for enrichment
  And I have 30 credits available
  When I click "Enrich Selected"
  Then I should see a preview showing "Estimated cost: 25 credits"
  And I should see remaining balance after: "5 credits"
  And I should be able to confirm or cancel the operation

Scenario: Enrichment with insufficient credits
  Given I have selected 50 leads for enrichment
  And I have only 20 credits available
  When I click "Enrich Selected"
  Then I should see a warning: "Insufficient credits. You can enrich 20 of 50 selected leads."
  And I should see options to: "Enrich 20 leads" or "Purchase more credits" or "Cancel"

Scenario: Enrichment failure handling
  Given I have initiated enrichment for 10 leads
  When 2 leads fail enrichment due to invalid email format
  Then those leads should show status "Failed" with reason "Invalid email"
  And no credits should be deducted for failed leads
  And I should see a retry option for failed leads
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Lead with invalid/malformed email | Skip enrichment, mark as "Failed - Invalid email", no credit charge |
| Lead already enriched within 30 days | Prompt: "This lead was enriched recently. Re-enrich anyway? (Uses 1 credit)" |
| Apify API timeout (>30 seconds) | Retry automatically up to 3 times, then mark as "Failed - Timeout" |
| Apify API rate limit reached | Queue remaining leads, display: "Rate limit reached. Remaining leads queued." |
| No data found for lead | Mark as "Enriched - No additional data found", charge 0.5 credits |
| Partial data found | Mark as "Enriched - Partial", display which fields were/weren't found |
| Zero credits available | Disable enrichment buttons, show: "No credits available. Purchase credits to continue." |
| Network disconnection during batch | Pause enrichment, preserve progress, allow resume when reconnected |
| Concurrent enrichment by multiple users | Queue system handles, show position: "Queued (position 3)" |
| Enrichment data conflicts with existing | Show diff view, allow user to choose: Keep existing / Use enriched / Merge |

### Test Data Requirements

**Leads for Enrichment Testing:**
```json
[
  {
    "email": "valid.ceo@fortune500.com",
    "firstName": "Valid",
    "lastName": "Lead",
    "company": "Fortune 500 Company"
  },
  {
    "email": "no.linkedin@smallbiz.com",
    "firstName": "NoLinkedIn",
    "lastName": "Person",
    "company": "Small Business LLC"
  },
  {
    "email": "invalid@@@email",
    "firstName": "Invalid",
    "lastName": "Email",
    "company": "Test Corp"
  },
  {
    "email": "timeout.test@slowserver.com",
    "firstName": "Timeout",
    "lastName": "Test",
    "company": "Slow Response Inc"
  }
]
```

**Expected Enrichment Response:**
```json
{
  "success": true,
  "data": {
    "linkedIn": "https://linkedin.com/in/valid-lead",
    "jobTitle": "Chief Executive Officer",
    "companySize": "10,000+ employees",
    "industry": "Technology",
    "phone": "+1-555-0199",
    "confidence": 0.95
  },
  "creditsUsed": 1,
  "dataSource": "apify-linkedin-enrichment"
}
```

### Priority
**P0 - Critical**

Core value proposition of the lead management system. Required for lead qualification and personalized outreach.

---

## UXS-008-03: Lead List Filtering and Search

### Story ID
UXS-008-03

### Title
Lead List Filtering and Search

### Persona
**Diana - Sales Development Team Lead**
Diana manages daily operations for her SDR team and needs to segment leads for different campaign types. She frequently creates filtered views to assign leads to specific team members based on criteria like company size, industry, or enrichment status. She expects powerful filtering with the ability to save filter presets.

### Scenario
Diana is preparing lead assignments for her team's Monday morning push. She needs to find all enriched leads from technology companies with 100+ employees that haven't been contacted yet. She then wants to save this filter for future use and share it with her team.

### User Goal
Efficiently filter and search through lead lists using multiple criteria, find specific leads quickly, save commonly-used filters, and segment leads for targeted campaigns.

### Preconditions
- User is viewing a lead list with multiple leads
- Lead list contains enriched and non-enriched leads
- User has read access to the lead list
- Filter/search UI components are loaded

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|------------|-------------------------|
| 1 | Opens lead list detail page | System displays lead table with filter bar above, search input visible |
| 2 | Clicks on search input field | Input field focuses, placeholder shows: "Search by name, email, company..." |
| 3 | Types "tech" in search field | Table filters in real-time to show leads with "tech" in any searchable field |
| 4 | Clicks "Add Filter" button | Filter dropdown appears with available filter categories: Status, Industry, Company Size, Tags, etc. |
| 5 | Selects "Status" filter | Sub-menu shows options: Pending, Enriched, Failed with checkboxes |
| 6 | Checks "Enriched" status | Table updates to show only enriched leads, filter chip appears: "Status: Enriched" |
| 7 | Adds another filter: "Industry = Technology" | Filter combines with AND logic, chip added: "Industry: Technology" |
| 8 | Adds filter: "Company Size >= 100" | Numeric filter with comparison operators, table shows matching leads |
| 9 | Reviews filtered results | Header shows: "Showing 47 of 500 leads" with active filters displayed as chips |
| 10 | Clicks "Save Filter" button | Modal prompts for filter name and optional sharing settings |
| 11 | Names filter "Tech Enterprise Leads" and saves | Filter saved to sidebar, confirmation: "Filter saved successfully" |
| 12 | Later selects saved filter from sidebar | All filter criteria re-applied instantly, same results displayed |

### Expected Outcomes
- Real-time filtering as criteria are applied
- Search across multiple fields (name, email, company, etc.)
- Multiple filters combinable with AND/OR logic
- Filter chips visible and removable individually
- Result count updates dynamically
- Saved filters accessible from sidebar
- Shared filters visible to team members
- Sort and filter states preserved during navigation

### Acceptance Criteria

```gherkin
Scenario: Real-time search across lead fields
  Given I am viewing a lead list with 100 leads
  When I type "john" in the search input
  Then the table should update within 300ms
  And only leads with "john" in name, email, or company should display
  And the result count should update to show matches

Scenario: Multiple filter combination
  Given I have a lead list with various industries and statuses
  When I add filter "Status = Enriched"
  And I add filter "Industry = Technology"
  Then only leads matching BOTH criteria should display
  And I should see filter chips for each active filter
  And I should be able to remove individual filters

Scenario: Save and recall filter preset
  Given I have applied multiple filters to a lead list
  When I click "Save Filter" and enter name "My Custom Filter"
  Then the filter should be saved to my saved filters list
  And when I navigate away and return
  And I select "My Custom Filter" from saved filters
  Then all the same filter criteria should be re-applied

Scenario: Clear all filters
  Given I have multiple active filters applied
  When I click "Clear All Filters"
  Then all filter criteria should be removed
  And the full lead list should be displayed
  And the search input should be cleared
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Search with special characters | Escape special regex characters, treat as literal search |
| Filter resulting in zero leads | Display: "No leads match your filters" with suggestion to modify criteria |
| Very long filter combinations | Filter bar scrolls horizontally, "X more filters" indicator if needed |
| Invalid filter value (e.g., negative company size) | Validation error, prevent filter application |
| Filter on non-enriched field (e.g., industry on pending lead) | Exclude leads without that field, or show "N/A" option |
| Saved filter references deleted field/tag | Show warning, allow edit or deletion of saved filter |
| Concurrent filter edit by another user | Live sync or warn of conflicts on shared filters |
| Performance with 10,000+ leads | Implement pagination, debounce search, server-side filtering |
| Mobile/narrow viewport | Filter chips collapse into dropdown, search remains visible |
| Filter by date range (created, enriched date) | Date picker component, support relative dates (Last 7 days, etc.) |

### Test Data Requirements

**Lead List for Filter Testing:**
```json
{
  "listName": "Filter Test List",
  "leads": [
    {"id": 1, "firstName": "John", "lastName": "Tech", "company": "TechCorp", "industry": "Technology", "companySize": 500, "status": "enriched"},
    {"id": 2, "firstName": "Jane", "lastName": "Doe", "company": "HealthFirst", "industry": "Healthcare", "companySize": 1000, "status": "enriched"},
    {"id": 3, "firstName": "Bob", "lastName": "Smith", "company": "TechStart", "industry": "Technology", "companySize": 50, "status": "pending"},
    {"id": 4, "firstName": "Alice", "lastName": "Johnson", "company": "FinanceMax", "industry": "Finance", "companySize": 200, "status": "failed"},
    {"id": 5, "firstName": "Charlie", "lastName": "Brown", "company": "RetailGiant", "industry": "Retail", "companySize": 5000, "status": "enriched"}
  ]
}
```

**Saved Filter Configuration:**
```json
{
  "filterName": "Tech Enterprise Leads",
  "criteria": [
    {"field": "status", "operator": "equals", "value": "enriched"},
    {"field": "industry", "operator": "equals", "value": "Technology"},
    {"field": "companySize", "operator": "gte", "value": 100}
  ],
  "shared": true,
  "createdBy": "user_123"
}
```

### Priority
**P1 - High**

Essential for lead management efficiency. Required for targeted campaigns and lead distribution.

---

## UXS-008-04: Individual Lead Detail Viewing

### Story ID
UXS-008-04

### Title
Individual Lead Detail Viewing

### Persona
**Alex - Account Executive**
Alex is preparing for a call with a prospect and needs to quickly review all available information about the lead. He expects a clean, organized view of original and enriched data, activity history, and quick actions for updating or reaching out to the lead.

### Scenario
Alex has a sales call in 15 minutes with a lead from the "Q1 Enterprise Campaign" list. He needs to review the lead's company information, previous interactions, enriched data like LinkedIn profile and job title, and prepare relevant talking points. He also wants to add notes after the call.

### User Goal
View comprehensive lead information in a single, well-organized interface, understand the lead's background and engagement history, and update lead data as needed.

### Preconditions
- Lead exists in the system with basic information
- User has read access to the lead record
- Lead detail modal/page components are loaded
- Some leads have enriched data, some are pending

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|------------|-------------------------|
| 1 | From lead list, clicks on a lead row or "View Details" action | System opens lead detail modal/drawer with loading skeleton |
| 2 | Views lead header section | Header shows: Full name, company, job title (if enriched), status badge, and quick action buttons |
| 3 | Reviews "Original Data" section | Card displays imported fields: Email, Phone, Company, Job Title (from CSV) with clear labels |
| 4 | Reviews "Enriched Data" section | Card displays Apify data: LinkedIn (clickable link), Company Size, Industry, Confidence Score (progress bar) |
| 5 | Scrolls to "Activity Timeline" section | Timeline shows: Import date, enrichment date, any outreach events, notes with timestamps |
| 6 | Clicks LinkedIn profile link | New tab opens to lead's LinkedIn profile |
| 7 | Clicks "Add Note" button | Text area expands, user can type note and save |
| 8 | Types note: "Interested in Q2 implementation" and saves | Note added to activity timeline with timestamp, confirmation shown |
| 9 | Clicks "Edit Lead" button | Form mode enables, fields become editable |
| 10 | Updates job title and saves | Lead record updated, success message, timeline shows "Lead updated" event |
| 11 | Clicks "Enrich" button (if lead is pending) | Enrichment initiated, status changes to "Processing", updates when complete |
| 12 | Closes modal | Returns to lead list with any updated data reflected |

### Expected Outcomes
- All lead data visible in organized sections
- Original vs. enriched data clearly distinguished
- Activity history visible with timestamps
- Quick actions available (Edit, Enrich, Delete, Call, Email)
- Notes can be added and viewed
- External links (LinkedIn, website) open in new tabs
- Lead status clearly indicated with visual badge
- Confidence score displayed for enriched data

### Acceptance Criteria

```gherkin
Scenario: View enriched lead details
  Given a lead with status "Enriched" exists in the list
  When I click on the lead row or "View Details" action
  Then I should see the lead detail modal open
  And I should see the Original Data section with imported fields
  And I should see the Enriched Data section with LinkedIn, Job Title, Company Size, Industry
  And I should see a Confidence Score displayed as a percentage

Scenario: View pending lead details
  Given a lead with status "Pending" exists in the list
  When I view the lead details
  Then I should see the Original Data section populated
  And the Enriched Data section should show "No enriched data available"
  And I should see an "Enrich" button to initiate enrichment

Scenario: Add note to lead
  Given I am viewing a lead's detail page
  When I click "Add Note"
  And I enter text "Follow up next week"
  And I click "Save Note"
  Then the note should appear in the Activity Timeline
  And the note should show my name and current timestamp

Scenario: Edit lead information
  Given I am viewing a lead's detail page
  When I click "Edit Lead"
  Then the form fields should become editable
  When I change the job title to "Senior Director"
  And I click "Save Changes"
  Then the lead should be updated with the new job title
  And the Activity Timeline should show an "Updated" event
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Lead with no enriched data | Show "Not yet enriched" with prominent Enrich button |
| Lead with partial enrichment (some fields missing) | Show available fields, display "N/A" or "Not found" for missing |
| Very long notes (>5000 characters) | Text area has character limit, show warning at 4500 chars |
| Lead with many activity entries (100+) | Paginate activity timeline, load more on scroll |
| Invalid LinkedIn URL in enriched data | Display as text, show "Link unavailable" tooltip |
| Lead deleted by another user while viewing | Show error toast, redirect to list with message |
| Concurrent edit by another user | Show warning: "This lead was modified. Refresh to see changes?" |
| Lead detail page direct URL access | Support deep linking, load lead directly if user has access |
| Mobile viewport | Stack sections vertically, full-width cards |
| Failed enrichment lead | Show "Enrichment Failed" status, error reason, retry button |

### Test Data Requirements

**Enriched Lead Record:**
```json
{
  "id": "lead_001",
  "firstName": "Jennifer",
  "lastName": "Martinez",
  "email": "j.martinez@enterprise.com",
  "phone": "+1-555-0123",
  "company": "Enterprise Solutions Inc",
  "jobTitle": "VP of Operations",
  "status": "enriched",
  "originalData": {
    "importedAt": "2026-01-05T10:30:00Z",
    "source": "TradeShow_CSV",
    "rawFields": {
      "email": "j.martinez@enterprise.com",
      "first_name": "Jennifer",
      "last_name": "Martinez",
      "company": "Enterprise Solutions Inc"
    }
  },
  "enrichedData": {
    "linkedIn": "https://linkedin.com/in/jennifermartinez",
    "jobTitle": "VP of Operations",
    "companySize": "1000-5000 employees",
    "industry": "Information Technology",
    "location": "San Francisco, CA",
    "confidence": 0.92,
    "enrichedAt": "2026-01-05T10:35:00Z"
  },
  "activityTimeline": [
    {"type": "imported", "timestamp": "2026-01-05T10:30:00Z", "details": "Imported from TradeShow_CSV"},
    {"type": "enriched", "timestamp": "2026-01-05T10:35:00Z", "details": "Enrichment completed"},
    {"type": "note", "timestamp": "2026-01-08T14:20:00Z", "user": "Alex Smith", "content": "Discussed Q2 roadmap"}
  ]
}
```

### Priority
**P1 - High**

Essential for sales workflow. Users need detailed lead information for effective outreach and follow-up.

---

## UXS-008-05: Lead Scoring and Qualification

### Story ID
UXS-008-05

### Title
Lead Scoring and Qualification

### Persona
**Rachel - Revenue Operations Manager**
Rachel is responsible for lead qualification criteria and ensuring sales reps prioritize the right leads. She configures lead scoring rules based on firmographic data, engagement signals, and data completeness. She wants leads automatically scored and qualified so reps can focus on high-value opportunities.

### Scenario
Rachel needs to set up a lead scoring model for the new quarter. Leads should receive points based on: company size (larger = more points), industry match (target industries get bonus), enrichment completeness (more data = higher score), and engagement activity. She wants to define thresholds for MQL (Marketing Qualified Lead) and SQL (Sales Qualified Lead) status.

### User Goal
Configure lead scoring rules that automatically calculate scores for each lead, set qualification thresholds, and enable reps to prioritize leads by score.

### Preconditions
- User has admin or RevOps permissions
- Lead scoring feature is enabled for the organization
- Lead data includes enriched fields for scoring
- Scoring engine is properly configured

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|------------|-------------------------|
| 1 | Navigates to Settings > Lead Scoring | System displays lead scoring configuration page with current rules |
| 2 | Reviews existing scoring rules | Table shows rules: Field, Condition, Points (e.g., "Company Size >= 500: +15 points") |
| 3 | Clicks "Add Scoring Rule" | Modal opens with fields: Select Field, Condition Type, Value, Points |
| 4 | Creates rule: Industry = Technology, +20 points | Rule added to list, preview shows affected leads count |
| 5 | Creates rule: Enrichment Status = Enriched, +10 points | Rule added, system shows: "This rule affects 340 leads" |
| 6 | Creates rule: Company Size >= 100, +10 points | Numeric condition applied |
| 7 | Sets qualification thresholds: MQL >= 30, SQL >= 60 | Threshold inputs saved, visual indicator shows score ranges |
| 8 | Clicks "Apply Scoring" or saves configuration | System recalculates scores for all leads, shows progress |
| 9 | Views lead list with scoring enabled | New "Score" column visible, leads show numeric scores with color coding |
| 10 | Sorts lead list by score descending | Highest scored leads appear first |
| 11 | Filters to show only SQLs | Filter applied: "Score >= 60", qualified leads displayed |
| 12 | Views individual lead with score breakdown | Lead detail shows total score + contribution from each rule |

### Expected Outcomes
- Scoring rules configurable through UI
- Automatic score calculation on lead import/update
- Score visible on lead list and detail views
- Qualification status (MQL/SQL) assigned based on thresholds
- Score breakdown visible per lead
- Historical scoring preserved (score at time of qualification)
- Scoring rule changes apply to existing leads (recalculation)

### Acceptance Criteria

```gherkin
Scenario: Create lead scoring rule
  Given I am on the Lead Scoring settings page
  When I click "Add Scoring Rule"
  And I select field "Industry"
  And I set condition "equals" "Technology"
  And I set points to 20
  And I save the rule
  Then the rule should appear in the scoring rules list
  And I should see a preview of how many leads are affected

Scenario: Automatic score calculation on enrichment
  Given a scoring rule exists: "Enriched = +10 points"
  When a lead is enriched successfully
  Then the lead's score should increase by 10 points
  And the lead list should reflect the updated score

Scenario: MQL qualification threshold
  Given MQL threshold is set to 30 points
  And a lead currently has 25 points
  When the lead is enriched and gains 10 points from the enrichment rule
  Then the lead's total score should be 35
  And the lead's qualification status should change to "MQL"
  And a "Qualified as MQL" event should appear in the activity timeline

Scenario: View score breakdown on lead detail
  Given a lead has a total score of 55 points
  When I view the lead's detail page
  Then I should see the total score displayed
  And I should see a breakdown showing: "Industry: +20, Company Size: +15, Enriched: +10, Email Valid: +10"
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Lead missing scored field (e.g., no industry) | Skip that rule, don't penalize, show "N/A" in breakdown |
| Negative points rule (penalize bad data) | Allow negative values, score can go below zero |
| Score exceeds 100 (no cap) | Allow unbounded scores, ensure UI handles large numbers |
| Multiple rules on same field | All matching rules apply, cumulative points |
| Rule deleted after leads scored | Recalculate scores, leads may lose points |
| Threshold changed after qualification | Don't retroactively change qualified leads, apply to new leads |
| Circular rule dependency | Validate rules, prevent infinite loops |
| Bulk lead import with scoring | Calculate scores as part of import pipeline |
| Score changes trigger workflow | Support webhook/automation on qualification events |
| Custom scoring formula (advanced) | Support formula builder for complex calculations |

### Test Data Requirements

**Scoring Rule Configuration:**
```json
{
  "scoringRules": [
    {"id": "rule_1", "field": "industry", "operator": "equals", "value": "Technology", "points": 20},
    {"id": "rule_2", "field": "companySize", "operator": "gte", "value": 500, "points": 15},
    {"id": "rule_3", "field": "companySize", "operator": "gte", "value": 100, "points": 10},
    {"id": "rule_4", "field": "enrichmentStatus", "operator": "equals", "value": "enriched", "points": 10},
    {"id": "rule_5", "field": "email", "operator": "isValid", "value": true, "points": 5}
  ],
  "thresholds": {
    "mql": 30,
    "sql": 60
  }
}
```

**Lead with Score Breakdown:**
```json
{
  "leadId": "lead_001",
  "totalScore": 55,
  "qualificationStatus": "MQL",
  "scoreBreakdown": [
    {"ruleId": "rule_1", "ruleName": "Industry = Technology", "points": 20},
    {"ruleId": "rule_2", "ruleName": "Company Size >= 500", "points": 15},
    {"ruleId": "rule_3", "ruleName": "Company Size >= 100", "points": 10},
    {"ruleId": "rule_4", "ruleName": "Enriched", "points": 10}
  ],
  "qualifiedAt": "2026-01-10T15:45:00Z",
  "lastScoreUpdate": "2026-01-10T15:45:00Z"
}
```

### Priority
**P1 - High**

Critical for lead prioritization and sales efficiency. Enables data-driven lead routing and follow-up.

---

## UXS-008-06: Export Leads to CSV/JSON

### Story ID
UXS-008-06

### Title
Export Leads to CSV/JSON

### Persona
**Tom - Marketing Operations Specialist**
Tom frequently needs to export lead data for external tools (email platforms, advertising audiences, analytics dashboards). He exports leads in various formats based on the destination system requirements. He expects flexible export options including field selection and format customization.

### Scenario
Tom needs to export all enriched leads from the "Q4 Campaign" list to upload as a custom audience in his email marketing platform. The platform accepts CSV with specific column headers. He wants to export only enriched leads with specific fields: email, first name, last name, company, and job title.

### User Goal
Export filtered leads in the desired format (CSV or JSON) with customizable field selection, maintaining data integrity and formatting for external system compatibility.

### Preconditions
- User has export permissions for the lead list
- Lead list contains at least one lead
- Browser supports file downloads
- No export rate limits exceeded

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|------------|-------------------------|
| 1 | From lead list detail page, clicks "Export" button | Export modal opens with format and options |
| 2 | Reviews export options | Modal shows: Format (CSV/JSON), Fields to include (checkboxes), Filter options |
| 3 | Selects "CSV" format | CSV-specific options appear: delimiter, encoding, include headers |
| 4 | Checks filter "Only enriched leads" | Preview updates: "Will export 145 of 500 leads" |
| 5 | Selects fields: Email, First Name, Last Name, Company, Job Title | Field list updates with selected fields checked |
| 6 | Optionally renames column headers | Custom header inputs appear: "Email" -> "email_address", etc. |
| 7 | Clicks "Preview Export" (optional) | Modal shows first 5 rows of export data in table format |
| 8 | Clicks "Download Export" button | System generates file, download begins automatically |
| 9 | Receives download complete notification | Browser download completes, file saved to default download location |
| 10 | Opens exported file to verify | CSV contains correct headers and data matching selections |

### Expected Outcomes
- File downloaded in selected format (CSV or JSON)
- Only selected fields included in export
- Filters applied (e.g., only enriched leads)
- Column headers match expected format
- Data properly escaped/formatted for the format
- Large exports handled without timeout
- Export logged in activity/audit trail

### Acceptance Criteria

```gherkin
Scenario: Export all leads as CSV
  Given I am viewing a lead list with 100 leads
  When I click "Export"
  And I select format "CSV"
  And I select all fields
  And I click "Download Export"
  Then a CSV file should download
  And the file should contain 100 data rows plus header row
  And all selected fields should be present as columns

Scenario: Export filtered leads as JSON
  Given I am viewing a lead list with 100 leads (50 enriched, 50 pending)
  When I click "Export"
  And I select format "JSON"
  And I check "Only enriched leads"
  And I click "Download Export"
  Then a JSON file should download
  And the file should contain an array of 50 lead objects
  And each object should have the selected field properties

Scenario: Export with custom column headers
  Given I am exporting leads as CSV
  When I select the email field
  And I rename the header from "email" to "primary_email"
  And I complete the export
  Then the CSV header row should show "primary_email" instead of "email"
  And the data in that column should be the email values

Scenario: Export large lead list (5000+ leads)
  Given a lead list with 5000 leads
  When I initiate an export
  Then I should see a progress indicator
  And the export should complete within 60 seconds
  And I should receive a download or link to the exported file
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Export with no leads (empty after filter) | Show message: "No leads match export criteria" with option to adjust |
| Very large export (50,000+ leads) | Background processing with email notification when ready |
| Special characters in data (commas, quotes) | Proper CSV escaping: wrap in quotes, escape internal quotes |
| Unicode characters | UTF-8 encoding, preserve international characters |
| Empty field values | Export as empty string (CSV) or null (JSON) |
| Nested enriched data (JSON) | Flatten for CSV, preserve structure for JSON export |
| Export interrupted (browser closed) | Resume option or restart, no partial corrupt files |
| Column header with special characters | Sanitize or warn user, prevent invalid headers |
| Export rate limit (e.g., 10 exports/hour) | Show limit warning: "5 exports remaining this hour" |
| Export with PII considerations | Optional: hash emails, mask phone numbers for privacy |

### Test Data Requirements

**Lead List for Export:**
```json
{
  "listId": "list_001",
  "listName": "Q4 Campaign",
  "leads": [
    {"id": "1", "email": "john@test.com", "firstName": "John", "lastName": "Doe", "company": "TestCo", "jobTitle": "Manager", "status": "enriched"},
    {"id": "2", "email": "jane@test.com", "firstName": "Jane", "lastName": "Smith", "company": "Sample Inc", "jobTitle": "Director", "status": "enriched"},
    {"id": "3", "email": "bob@test.com", "firstName": "Bob", "lastName": "Johnson", "company": "Demo LLC", "jobTitle": null, "status": "pending"}
  ]
}
```

**Expected CSV Output:**
```csv
email,firstName,lastName,company,jobTitle
john@test.com,John,Doe,TestCo,Manager
jane@test.com,Jane,Smith,Sample Inc,Director
```

**Expected JSON Output:**
```json
[
  {"email": "john@test.com", "firstName": "John", "lastName": "Doe", "company": "TestCo", "jobTitle": "Manager"},
  {"email": "jane@test.com", "firstName": "Jane", "lastName": "Smith", "company": "Sample Inc", "jobTitle": "Director"}
]
```

### Priority
**P1 - High**

Essential for integration with external systems. Required for marketing automation, audience building, and reporting.

---

## UXS-008-07: Tag Management and Bulk Tagging

### Story ID
UXS-008-07

### Title
Tag Management and Bulk Tagging

### Persona
**Michelle - Sales Manager**
Michelle organizes leads using tags for different campaigns, sales stages, and team assignments. She needs to quickly apply tags to groups of leads and create new tags on the fly. Tags help her team filter and segment leads for targeted outreach.

### Scenario
Michelle has just imported 200 leads from a partner referral and needs to tag them all as "Partner Referral" and "Q1 2026". She also wants to tag the first 50 leads (highest priority based on company size) as "High Priority" for immediate follow-up. Later, she'll need to filter by these tags for reporting.

### User Goal
Efficiently manage tags (create, edit, delete), apply tags to individual or multiple leads, and filter leads by tags for organization and reporting.

### Preconditions
- User has lead edit permissions
- Tagging feature is enabled
- Lead list is accessible
- Tags can be created by users with appropriate permissions

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|------------|-------------------------|
| 1 | Navigates to lead list detail page | Lead table displays with Tags column (may show tag badges) |
| 2 | Selects 200 leads using "Select All" checkbox | Selection indicator shows: "200 leads selected", bulk action bar appears |
| 3 | Clicks "Add Tags" from bulk action menu | Tag selection dropdown opens with existing tags + "Create new tag" option |
| 4 | Types "Partner Referral" (new tag) | Autocomplete shows no match, "Create 'Partner Referral' tag" option appears |
| 5 | Clicks "Create 'Partner Referral' tag" | New tag created with default color, added to selection |
| 6 | Adds existing tag "Q1 2026" from list | Both tags shown in selection |
| 7 | Clicks "Apply Tags" | Progress indicator: "Tagging 200 leads...", completion: "Tags applied to 200 leads" |
| 8 | Clears selection and sorts by company size | Lead table sorted, Michelle identifies top 50 |
| 9 | Selects top 50 leads | Selection indicator: "50 leads selected" |
| 10 | Applies "High Priority" tag (new or existing) | Tag applied, leads now show 3 tags each |
| 11 | Uses filter to show only "High Priority" leads | Filter applied, 50 leads displayed |
| 12 | Navigates to Tag Management page | View all tags with usage counts, edit colors, rename, delete |

### Expected Outcomes
- Tags created and applied in bulk efficiently
- Tags visible on lead list and detail views
- Filter by tag functionality working
- Tag colors customizable for visual organization
- Tag usage statistics available
- Bulk remove tags supported
- Tags searchable and autocomplete-enabled

### Acceptance Criteria

```gherkin
Scenario: Create and apply new tag to selected leads
  Given I have selected 50 leads from the lead list
  When I click "Add Tags" from bulk actions
  And I type "New Campaign" in the tag input
  And I click "Create 'New Campaign' tag"
  And I click "Apply Tags"
  Then a new tag "New Campaign" should be created
  And all 50 selected leads should have the tag applied
  And the tag should appear in the Tags column for each lead

Scenario: Apply multiple existing tags in bulk
  Given tags "Priority" and "West Region" exist
  And I have selected 25 leads
  When I click "Add Tags"
  And I select both "Priority" and "West Region"
  And I click "Apply Tags"
  Then both tags should be applied to all 25 leads
  And I should see confirmation: "2 tags applied to 25 leads"

Scenario: Remove tags from leads in bulk
  Given I have 30 leads tagged with "Old Campaign"
  And I have selected those 30 leads
  When I click "Remove Tags" from bulk actions
  And I select "Old Campaign"
  And I confirm removal
  Then the tag should be removed from all 30 leads
  And the leads should no longer show that tag

Scenario: Filter lead list by tag
  Given leads have various tags applied
  When I add filter "Tag = High Priority"
  Then only leads with the "High Priority" tag should display
  And the filter chip should show "Tag: High Priority"
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Duplicate tag name (case insensitive) | Prevent creation: "Tag 'Priority' already exists" |
| Tag name with special characters | Allow alphanumeric, spaces, hyphens; sanitize others |
| Very long tag name (>50 chars) | Limit to 50 characters, show warning |
| Delete tag in use by leads | Confirm: "This tag is used by 45 leads. Remove tag from all leads?" |
| Apply tag to lead that already has it | No duplicate, no error, idempotent operation |
| Tag color conflict (same color) | Allow, but show warning if too similar |
| Bulk tag 10,000+ leads | Background processing, progress indicator, notify when complete |
| Tag search with partial match | Autocomplete shows partial matches: "Pri" -> "Priority", "Private" |
| Merge duplicate tags | Allow rename/merge: "Merge 'high priority' into 'High Priority'?" |
| Tag permissions (some users can't create) | Hide create option, show only existing tags |

### Test Data Requirements

**Tag Definitions:**
```json
{
  "tags": [
    {"id": "tag_001", "name": "High Priority", "color": "#FF5733", "usageCount": 125},
    {"id": "tag_002", "name": "Q1 2026", "color": "#33A1FF", "usageCount": 450},
    {"id": "tag_003", "name": "Partner Referral", "color": "#28A745", "usageCount": 200},
    {"id": "tag_004", "name": "West Region", "color": "#9B59B6", "usageCount": 89},
    {"id": "tag_005", "name": "Needs Follow-up", "color": "#F39C12", "usageCount": 67}
  ]
}
```

**Lead with Tags:**
```json
{
  "leadId": "lead_001",
  "tags": ["tag_001", "tag_002", "tag_003"],
  "displayTags": [
    {"name": "High Priority", "color": "#FF5733"},
    {"name": "Q1 2026", "color": "#33A1FF"},
    {"name": "Partner Referral", "color": "#28A745"}
  ]
}
```

### Priority
**P1 - High**

Important for lead organization and segmentation. Enables efficient campaign management and team coordination.

---

## UXS-008-08: Lead List Creation and Organization

### Story ID
UXS-008-08

### Title
Lead List Creation and Organization

### Persona
**Kevin - Director of Sales Development**
Kevin oversees multiple SDR teams and campaigns. He needs to organize leads into logical lists for different purposes: by campaign source, territory, product line, or team assignment. He wants a clear folder/list structure to manage thousands of leads across various initiatives.

### Scenario
Kevin is launching a new product and needs to create a dedicated lead list structure. He wants to create a parent folder "Product X Launch" containing sub-lists for different regions (North, South, East, West). He'll import leads into each regional list and track progress separately while viewing aggregate metrics at the folder level.

### User Goal
Create, organize, rename, and archive lead lists in a hierarchical structure that supports multiple campaigns and teams with clear visibility into list metrics.

### Preconditions
- User has permissions to create and manage lead lists
- Lead management dashboard is accessible
- File/folder organization feature is enabled
- No naming conflicts with existing lists

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|------------|-------------------------|
| 1 | Navigates to Lead Lists dashboard | Dashboard shows existing lists as cards/grid with metrics (total, enriched, status) |
| 2 | Clicks "New Folder" button | Folder creation modal opens |
| 3 | Names folder "Product X Launch" and adds description | Folder created, appears in list view with folder icon |
| 4 | Opens folder by clicking on it | Folder view shows empty state: "No lists yet. Create a list or import leads." |
| 5 | Clicks "Create List" within folder | List creation modal opens with folder pre-selected |
| 6 | Names list "North Region", adds description | List created within folder, card appears with 0 leads |
| 7 | Repeats to create South, East, West region lists | 4 lists now visible within folder |
| 8 | Navigates back to main dashboard | Folder shows summary: "4 lists, 0 total leads" |
| 9 | Opens North Region list and uploads CSV | Leads imported, list card updates with count |
| 10 | Views folder-level metrics | Aggregate metrics show: total leads across all lists, enriched count, etc. |
| 11 | Renames a list via action menu | Edit name modal, list renamed, reflected immediately |
| 12 | Archives an old list | List moved to "Archived" section, hidden from main view |

### Expected Outcomes
- Hierarchical folder/list structure supported
- Lists organized within folders for campaigns
- Metrics aggregated at folder level
- Lists can be moved between folders
- Archive functionality hides old lists
- Search across all lists working
- Bulk operations on lists (archive, delete, move)
- List metadata (description, created date) visible

### Acceptance Criteria

```gherkin
Scenario: Create new lead list
  Given I am on the Lead Lists dashboard
  When I click "Create List"
  And I enter name "Q1 Webinar Attendees"
  And I enter description "Leads from January webinar"
  And I click "Create"
  Then a new empty lead list should be created
  And I should see it in the dashboard with 0 leads count
  And the creation timestamp should be displayed

Scenario: Create folder and organize lists
  Given I am on the Lead Lists dashboard
  When I click "New Folder"
  And I name it "2026 Campaigns"
  And I create lists within that folder
  Then the folder should contain those lists
  And navigating to the folder should show only its lists
  And the folder card should show aggregate metrics

Scenario: Move list between folders
  Given a list "Old Campaign" exists in folder "2025"
  And a folder "Archive" exists
  When I select "Move" from the list's action menu
  And I select destination folder "Archive"
  And I confirm the move
  Then the list should appear in the "Archive" folder
  And it should no longer appear in "2025" folder

Scenario: Archive and restore list
  Given a lead list "Outdated List" exists
  When I select "Archive" from the list's action menu
  Then the list should be moved to the Archived section
  And it should not appear in the main dashboard view
  When I navigate to "Archived" and select "Restore"
  Then the list should reappear in the main dashboard
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Duplicate list name | Warn: "A list with this name exists. Continue anyway?" |
| Nested folders (folder in folder) | Support 2-3 levels of nesting, clear breadcrumb navigation |
| Delete folder with lists inside | Confirm: "Delete folder and all 5 lists inside? This cannot be undone." |
| Very long list/folder name | Limit to 100 chars, truncate with ellipsis in UI |
| Move list to same folder | No change, no error message |
| Empty folder | Show empty state with suggested actions |
| Search for list by name | Global search finds lists across all folders |
| Bulk archive multiple lists | Multi-select lists, archive all at once |
| List with active campaigns | Warn: "This list is used by 2 active campaigns. Archive anyway?" |
| Restore archived list to deleted folder | Restore to root level, notify user |

### Test Data Requirements

**Folder Structure:**
```json
{
  "folders": [
    {
      "id": "folder_001",
      "name": "Product X Launch",
      "description": "All leads for Product X launch campaign",
      "lists": [
        {"id": "list_001", "name": "North Region", "totalLeads": 250, "enrichedLeads": 180},
        {"id": "list_002", "name": "South Region", "totalLeads": 320, "enrichedLeads": 290},
        {"id": "list_003", "name": "East Region", "totalLeads": 180, "enrichedLeads": 150},
        {"id": "list_004", "name": "West Region", "totalLeads": 410, "enrichedLeads": 380}
      ],
      "aggregateMetrics": {
        "totalLeads": 1160,
        "enrichedLeads": 1000,
        "enrichmentRate": "86%"
      }
    }
  ]
}
```

**List Card Display:**
```json
{
  "listId": "list_001",
  "name": "North Region",
  "description": "Enterprise leads from northern territories",
  "totalLeads": 250,
  "enrichedLeads": 180,
  "failedLeads": 5,
  "pendingLeads": 65,
  "creditsUsed": 180,
  "status": "active",
  "createdAt": "2026-01-10T09:00:00Z",
  "lastUpdated": "2026-01-11T14:30:00Z"
}
```

### Priority
**P1 - High**

Foundational for lead organization. Required before leads can be imported or managed effectively.

---

## UXS-008-09: Batch Lead Enrichment with Credit Management

### Story ID
UXS-008-09

### Title
Batch Lead Enrichment with Credit Management

### Persona
**Linda - Sales Operations Analyst**
Linda manages the lead enrichment budget for her organization. She monitors credit usage, allocates credits across teams, and ensures enrichment spend stays within budget. She needs visibility into credit consumption and the ability to control batch enrichment costs.

### Scenario
Linda needs to enrich the entire "Enterprise Accounts" list of 500 leads before the sales team's quarterly planning meeting. She has 600 credits available but wants to preview the cost and ensure there's enough buffer for other teams. She also wants to see estimated credit usage before committing.

### User Goal
Enrich leads in batch with full visibility into credit costs, monitor credit balance, and manage enrichment spend effectively across the organization.

### Preconditions
- Organization has enrichment credits available
- User has permissions to enrich leads and view credit balance
- Lead list contains un-enriched leads
- Enrichment service (Apify) is available

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|------------|-------------------------|
| 1 | Navigates to Credit Balance widget in sidebar/header | Widget shows: "Credits: 600 available" with usage meter |
| 2 | Opens "Enterprise Accounts" lead list | List shows 500 leads, 0 enriched, 500 pending |
| 3 | Clicks "Enrich All" button | Enrichment preview modal opens |
| 4 | Reviews credit cost preview | Modal shows: "Estimated cost: 500 credits. After enrichment: 100 credits remaining" |
| 5 | Views breakdown of enrichment options | Options: Full enrichment (1 credit/lead), Basic enrichment (0.5 credits/lead) |
| 6 | Selects "Full enrichment" | Cost updates based on selection |
| 7 | Notices option to set enrichment limit | Checkbox: "Limit enrichment to X leads" with input field |
| 8 | Enables limit and sets to 400 leads | Preview updates: "Estimated cost: 400 credits. 100 leads will remain pending." |
| 9 | Clicks "Start Enrichment" | Confirmation: "Enrich 400 leads for 400 credits?" |
| 10 | Confirms enrichment | Progress bar appears: "Enriching... 0/400 complete" |
| 11 | Monitors real-time progress | Progress updates every few seconds, credit balance decreases as leads complete |
| 12 | Views completion summary | Modal shows: "Enrichment complete. 392 succeeded, 8 failed. Credits used: 392. Remaining: 208" |

### Expected Outcomes
- Credit cost preview before enrichment starts
- Real-time credit balance updates during enrichment
- Enrichment limit option to control spend
- Credits only deducted for successful enrichments
- Failed enrichments don't consume credits
- Credit usage history logged
- Low balance warnings displayed

### Acceptance Criteria

```gherkin
Scenario: Preview enrichment credit cost
  Given I have 500 un-enriched leads
  And I have 600 credits available
  When I click "Enrich All"
  Then I should see estimated cost: 500 credits
  And I should see remaining balance after: 100 credits
  And I should be able to cancel without spending credits

Scenario: Enrichment with credit limit
  Given I have 500 leads to enrich
  And I have 300 credits available
  When I click "Enrich All"
  Then I should see a warning: "Insufficient credits for all leads"
  And I should see option to "Enrich 300 leads (all available credits)"
  When I confirm enrichment
  Then 300 leads should be enriched
  And 200 leads should remain pending

Scenario: Credit refund for failed enrichment
  Given I initiate enrichment for 100 leads at 1 credit each
  When 5 leads fail enrichment due to invalid data
  Then my credit balance should decrease by 95 (not 100)
  And I should see: "95 credits used. 5 leads failed (no charge)"

Scenario: Low credit balance warning
  Given my organization has 50 credits remaining
  And my low balance threshold is set to 100 credits
  When I view the credit widget
  Then I should see a warning indicator
  And I should see a message: "Low credits - consider purchasing more"
  And there should be a link to purchase additional credits
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Zero credits available | Disable enrichment, show: "No credits available. Purchase credits to enrich leads." |
| Credits expire mid-enrichment | Complete in-progress, notify: "X credits expired. Enrichment paused." |
| Concurrent enrichment depletes credits | Queue system, fair allocation, notify when credits exhausted |
| Partial credit refund (0.5 for partial data) | Support fractional refunds, show in usage history |
| Credit purchase during enrichment | Credits added immediately, enrichment can continue |
| Organization credit limit reached | Stop enrichment, notify admins, show upgrade options |
| Enrichment price change | Grandfathered pricing for in-progress batch, new price for new batches |
| Bulk enrichment timeout | Resume capability, preserve progress, notify user |
| Credit usage reporting by user | Admin dashboard shows credits used per user/team |
| Monthly credit reset | Clear notification, usage counter reset, preserve purchase credits |

### Test Data Requirements

**Credit Account State:**
```json
{
  "organizationId": "org_001",
  "creditBalance": {
    "available": 600,
    "used": 1400,
    "total": 2000
  },
  "usageHistory": [
    {"date": "2026-01-10", "action": "enrichment", "credits": 150, "leadListId": "list_001"},
    {"date": "2026-01-09", "action": "enrichment", "credits": 200, "leadListId": "list_002"},
    {"date": "2026-01-08", "action": "purchase", "credits": 500, "paymentId": "pay_001"}
  ],
  "settings": {
    "lowBalanceThreshold": 100,
    "emailNotifications": true,
    "dailyLimit": null
  }
}
```

**Enrichment Cost Preview:**
```json
{
  "listId": "list_001",
  "totalLeads": 500,
  "pendingLeads": 500,
  "enrichmentOptions": {
    "full": {"costPerLead": 1.0, "totalCost": 500, "fields": ["linkedin", "jobTitle", "companySize", "industry", "phone"]},
    "basic": {"costPerLead": 0.5, "totalCost": 250, "fields": ["linkedin", "jobTitle"]}
  },
  "currentBalance": 600,
  "projectedBalance": {
    "full": 100,
    "basic": 350
  }
}
```

### Priority
**P0 - Critical**

Core monetization and resource management. Required for sustainable platform usage and cost control.

---

## UXS-008-10: Lead Import Column Mapping

### Story ID
UXS-008-10

### Title
Lead Import Column Mapping

### Persona
**Nancy - Marketing Coordinator**
Nancy frequently imports leads from various sources including trade shows, webinars, and third-party lead providers. Each source has different column naming conventions. She needs an intuitive mapping interface that correctly matches source columns to system fields, with smart auto-detection and easy manual overrides.

### Scenario
Nancy received a lead list from a trade show vendor. The CSV has unusual column names like "CONT_EMAIL", "FIRST_NM", "LAST_NM", "ORG_NAME", and "POSITION". She needs to map these to the standard system fields so leads are imported correctly. She also wants to save this mapping template for future imports from the same vendor.

### User Goal
Accurately map non-standard CSV columns to system fields using auto-detection with manual override capabilities, and save mapping templates for recurring import sources.

### Preconditions
- User is in the CSV upload flow after file selection
- CSV file has been parsed successfully
- Column headers are extracted from file
- Mapping interface is displayed

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|------------|-------------------------|
| 1 | Uploads CSV file from trade show vendor | File processed, column mapping interface displayed |
| 2 | Views auto-detected mappings | System shows: "CONT_EMAIL" -> "Email" (auto-detected), "FIRST_NM" -> No match (requires mapping) |
| 3 | Reviews email mapping (correctly detected) | Green checkmark, email field shows as required field satisfied |
| 4 | Clicks dropdown for "FIRST_NM" column | Dropdown shows available fields: First Name, Last Name, Email, Phone, Company, Job Title, Skip |
| 5 | Selects "First Name" | Mapping saved, preview updates to show sample data |
| 6 | Maps "LAST_NM" to "Last Name" | Mapping saved |
| 7 | Maps "ORG_NAME" to "Company" | Mapping saved |
| 8 | Maps "POSITION" to "Job Title" | Mapping saved |
| 9 | Views mapping preview with sample data | Table shows first 5 rows with mapped columns and sample values |
| 10 | Clicks "Save Template" button | Modal asks for template name: "Trade Show Vendor XYZ" |
| 11 | Saves template | Template saved, confirmation shown |
| 12 | Proceeds with import | Leads imported using current mapping |
| 13 | Future import: selects saved template | All mappings auto-applied from saved template |

### Expected Outcomes
- Auto-detection correctly identifies common column patterns
- Manual override available for all columns
- Required fields (email) clearly indicated
- Sample data preview shows mapping results
- Mapping templates can be saved and reused
- Templates can be shared across team
- Invalid mappings flagged before import
- Duplicate mappings prevented (two columns to same field)

### Acceptance Criteria

```gherkin
Scenario: Auto-detect standard column names
  Given I upload a CSV with columns "email", "first_name", "last_name", "company"
  When the mapping interface loads
  Then "email" should be auto-mapped to "Email"
  And "first_name" should be auto-mapped to "First Name"
  And "last_name" should be auto-mapped to "Last Name"
  And "company" should be auto-mapped to "Company"
  And all mappings should show green status indicators

Scenario: Manual mapping for non-standard columns
  Given I upload a CSV with column "CONT_EMAIL"
  And auto-detection does not recognize it
  When I select "Email" from the mapping dropdown for "CONT_EMAIL"
  Then the column should be mapped to "Email"
  And the required field indicator should turn green

Scenario: Save and apply mapping template
  Given I have completed a column mapping
  When I click "Save Template"
  And I name it "Vendor ABC Format"
  Then the template should be saved
  When I upload another CSV from the same vendor
  And I select "Vendor ABC Format" template
  Then all previously saved mappings should be auto-applied

Scenario: Prevent duplicate field mapping
  Given I have mapped "column_a" to "Email"
  When I try to map "column_b" to "Email"
  Then I should see a warning: "Email is already mapped to column_a"
  And I should be asked to either skip column_b or replace the existing mapping
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| CSV with no recognizable columns | Show all as unmapped, guide user to map manually, require email |
| Column name matches multiple fields (e.g., "name") | Show as ambiguous, prompt user to choose (First Name or Last Name?) |
| Extra columns not needed | Option to "Skip" column, excluded from import |
| Template doesn't match new file columns | Warning: "3 columns in template not found in file. Review mappings." |
| Required field (email) missing from CSV | Block import, show error: "Email column is required" |
| CSV has duplicate column names | Show warning, append numbers to differentiate |
| Very long column names (100+ chars) | Truncate in display with tooltip for full name |
| Special characters in column names | Display as-is, sanitize for internal use |
| Template with deleted/renamed fields | Flag deprecated mappings, prompt for update |
| Case sensitivity (Email vs EMAIL vs email) | Auto-detect regardless of case, normalize internally |

### Test Data Requirements

**Non-Standard CSV Columns:**
```csv
CONT_EMAIL,FIRST_NM,LAST_NM,ORG_NAME,POSITION,MOBILE_PH
john@example.com,John,Doe,Acme Corp,VP Sales,555-0101
jane@example.com,Jane,Smith,TechStart,CEO,555-0102
```

**Mapping Template:**
```json
{
  "templateId": "template_001",
  "templateName": "Trade Show Vendor XYZ",
  "createdBy": "user_123",
  "mappings": [
    {"sourceColumn": "CONT_EMAIL", "targetField": "email"},
    {"sourceColumn": "FIRST_NM", "targetField": "firstName"},
    {"sourceColumn": "LAST_NM", "targetField": "lastName"},
    {"sourceColumn": "ORG_NAME", "targetField": "company"},
    {"sourceColumn": "POSITION", "targetField": "jobTitle"},
    {"sourceColumn": "MOBILE_PH", "targetField": "phone"}
  ],
  "shared": true,
  "lastUsed": "2026-01-10T15:30:00Z"
}
```

**Auto-Detection Patterns:**
```json
{
  "patterns": {
    "email": ["email", "e-mail", "email_address", "contact_email", "primary_email"],
    "firstName": ["first_name", "firstname", "first", "given_name", "fname"],
    "lastName": ["last_name", "lastname", "last", "surname", "family_name", "lname"],
    "company": ["company", "company_name", "organization", "org", "employer"],
    "jobTitle": ["title", "job_title", "position", "role", "job_role"],
    "phone": ["phone", "phone_number", "mobile", "tel", "telephone", "cell"]
  }
}
```

### Priority
**P0 - Critical**

Gateway for all lead data entry. Poor mapping leads to data quality issues affecting all downstream operations.

---

## Summary Matrix

| Story ID | Title | Priority | Primary Persona |
|----------|-------|----------|-----------------|
| UXS-008-01 | Bulk Lead Upload via CSV | P0 | Sales Ops Manager |
| UXS-008-02 | Lead Enrichment with Apify | P0 | BDR |
| UXS-008-03 | Lead List Filtering and Search | P1 | Sales Team Lead |
| UXS-008-04 | Individual Lead Detail Viewing | P1 | Account Executive |
| UXS-008-05 | Lead Scoring and Qualification | P1 | RevOps Manager |
| UXS-008-06 | Export Leads to CSV/JSON | P1 | Marketing Ops |
| UXS-008-07 | Tag Management and Bulk Tagging | P1 | Sales Manager |
| UXS-008-08 | Lead List Creation and Organization | P1 | Director of Sales Dev |
| UXS-008-09 | Batch Enrichment with Credit Mgmt | P0 | Sales Ops Analyst |
| UXS-008-10 | Lead Import Column Mapping | P0 | Marketing Coordinator |

---

## Test Environment Setup

### Required Test Data
1. Sample CSV files in various formats (standard, non-standard, malformed)
2. Mock Apify API responses (success, failure, timeout scenarios)
3. Pre-populated lead lists with mixed enrichment states
4. Tag library with sample tags
5. User accounts with different permission levels
6. Credit balances in various states (full, low, zero)

### Integration Points to Test
1. File upload service
2. CSV parsing library (Papa Parse)
3. Apify enrichment API
4. Credit management system
5. Search and filter engine
6. Export generation
7. Real-time progress updates

### Browser/Device Coverage
- Chrome (latest), Firefox (latest), Safari (latest), Edge (latest)
- Desktop (1920x1080, 1366x768)
- Tablet (iPad Pro, iPad Mini)
- Mobile (iPhone 14, Pixel 7)

---

*Document maintained by QA Team. Last reviewed: 2026-01-11*
