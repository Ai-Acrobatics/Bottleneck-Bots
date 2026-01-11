# UX Stories: Multi-Tenant Architecture

**Document ID**: UXS-005
**Feature**: Multi-Tenant Architecture
**Version**: 1.0
**Last Updated**: 2026-01-11
**Status**: Draft

---

## Overview

This document contains comprehensive User Experience Stories for testing and validating the Multi-Tenant Architecture feature of Bottleneck-Bots. The multi-tenant system enables agencies to manage multiple client sub-accounts with proper data isolation, permission hierarchies, white-label branding, and resource management.

### Related Documents
- PRD: `/docs/prd/marketing/11-multi-tenant.md`
- Authentication Architecture: `/docs/Authentication-Architecture.md`
- User Flows: `/docs/USER_FLOWS.md`
- Permissions Reference: `/docs/PERMISSIONS_QUICK_REFERENCE.md`

---

## UXS-005-01: Sub-Account Creation and Provisioning

### Story ID
UXS-005-01

### Title
Agency Admin Creates New Client Sub-Account

### Persona
**Sarah Chen** - Agency Owner/Super Admin
- 35 years old, runs a digital marketing agency with 12 clients
- Tech-savvy but time-constrained
- Needs to quickly onboard new clients with minimal friction
- Values automation and streamlined workflows

### Scenario
Sarah has just signed a new client, "Coastal Realty Group", for marketing automation services. She needs to create a dedicated sub-account for this client within the Bottleneck-Bots platform, provision their resources, and set up initial access for the client's marketing manager.

### User Goal
Create a fully provisioned sub-account for a new client with proper resource allocation, branding configuration, and initial user access within 10 minutes.

### Preconditions
- Sarah is logged in as Agency Super Admin
- Sarah's agency has an active subscription with available sub-account slots
- Sarah has the client's business information ready (name, domain, contact details)
- The agency has not exceeded its maximum sub-account limit

### Step-by-Step User Journey

**Step 1**: Navigate to Sub-Account Management
- Sarah clicks "Sub-Accounts" in the main navigation sidebar
- **Expected Response**: System displays the Sub-Account Management dashboard showing:
  - List of existing sub-accounts with status indicators
  - "Create Sub-Account" button prominently displayed
  - Usage summary (X of Y sub-accounts used)
  - Search/filter options for existing accounts

**Step 2**: Initiate Sub-Account Creation
- Sarah clicks the "Create Sub-Account" button
- **Expected Response**: System opens a multi-step creation wizard with progress indicator showing 5 steps:
  1. Basic Information
  2. Resource Allocation
  3. Branding Setup
  4. User Access
  5. Review & Create

**Step 3**: Enter Basic Information
- Sarah fills in:
  - Company Name: "Coastal Realty Group"
  - Subdomain/Slug: "coastal-realty"
  - Industry: "Real Estate"
  - Primary Contact Email: "mark@coastalrealty.com"
  - Timezone: "America/Los_Angeles"
- **Expected Response**:
  - Real-time validation of subdomain availability
  - Green checkmark when subdomain is available
  - Auto-suggestion if subdomain is taken
  - "Next" button becomes active when all required fields are valid

**Step 4**: Configure Resource Allocation
- Sarah selects resource tier for the client:
  - Browser Sessions: 3 concurrent (from dropdown)
  - Monthly Credits: 5,000 (slider or input)
  - Storage: 10 GB
  - API Rate Limit: Standard
- **Expected Response**:
  - Visual indicators showing resource allocation against agency limits
  - Warning if allocation exceeds available agency resources
  - Cost impact preview (if applicable)
  - Recommendation based on selected industry

**Step 5**: Configure White-Label Branding (Optional)
- Sarah uploads:
  - Client Logo (PNG/SVG)
  - Primary Brand Color: #1E88E5
  - Secondary Color: #FFA726
- She enables "Hide Bottleneck-Bots branding"
- **Expected Response**:
  - Live preview panel showing how the client's dashboard will appear
  - Image validation (size, format, dimensions)
  - Color contrast accessibility check
  - Option to skip and configure later

**Step 6**: Set Up Initial User Access
- Sarah adds the client admin:
  - Name: "Mark Johnson"
  - Email: "mark@coastalrealty.com"
  - Role: "Client Admin"
- **Expected Response**:
  - Email validation
  - Role permission summary displayed
  - Option to add additional users
  - Toggle for "Send welcome email immediately"

**Step 7**: Review and Create
- Sarah reviews all configured settings in a summary view
- Clicks "Create Sub-Account"
- **Expected Response**:
  - Loading indicator with status messages:
    - "Creating account..."
    - "Provisioning resources..."
    - "Setting up database..."
    - "Sending invitation email..."
  - Success confirmation with:
    - Sub-account URL
    - Quick actions (Go to account, Add another, Return to list)
  - Email confirmation sent to Sarah

### Expected Outcomes
- New sub-account "Coastal Realty Group" appears in the sub-account list
- Mark Johnson receives a welcome email with login instructions
- Sub-account is fully provisioned with allocated resources
- Data isolation is established (separate database schema/tenant ID)
- Audit log records the creation event with Sarah as the actor
- Agency resource usage is updated to reflect new allocation

### Acceptance Criteria

```gherkin
Given Sarah is logged in as Agency Super Admin
And the agency has available sub-account capacity
When Sarah completes the sub-account creation wizard with valid information
Then a new sub-account is created within 30 seconds
And the sub-account appears in the management dashboard
And the invited user receives a welcome email within 2 minutes
And the audit log contains a record of the creation event
And agency resource usage is correctly updated

Given Sarah enters a subdomain that already exists
When she tabs out of the subdomain field
Then the system displays "Subdomain unavailable" error
And suggests alternative available subdomains

Given Sarah attempts to allocate more resources than available
When she exceeds the agency's remaining browser session allocation
Then the system displays a warning message
And prevents proceeding until allocation is reduced
```

### Edge Cases

1. **Subdomain Collision**
   - User enters an existing subdomain
   - System suggests alternatives (e.g., "coastal-realty-1", "coastalrealty")
   - User can accept suggestion or enter new value

2. **Resource Exhaustion**
   - Agency has used all sub-account slots
   - System displays upgrade prompt with pricing
   - Prevents creation until capacity is added

3. **Duplicate Email**
   - User email already exists in another sub-account
   - System offers: "Add as cross-tenant user" or "Use different email"

4. **Network Interruption During Creation**
   - Creation process is interrupted mid-way
   - System implements transaction rollback
   - Partial resources are cleaned up
   - User can retry without duplicate data

5. **Invalid Logo Upload**
   - File too large (>5MB) or wrong format
   - System shows specific error with requirements
   - Suggests compression or conversion tools

### Test Data Requirements

```json
{
  "valid_sub_account": {
    "company_name": "Coastal Realty Group",
    "subdomain": "coastal-realty",
    "industry": "Real Estate",
    "contact_email": "mark@coastalrealty.com",
    "timezone": "America/Los_Angeles",
    "resources": {
      "browser_sessions": 3,
      "monthly_credits": 5000,
      "storage_gb": 10
    }
  },
  "test_users": [
    {
      "name": "Mark Johnson",
      "email": "mark@coastalrealty.com",
      "role": "client_admin"
    }
  ],
  "branding_assets": {
    "logo_url": "test-assets/coastal-realty-logo.png",
    "primary_color": "#1E88E5",
    "secondary_color": "#FFA726"
  }
}
```

### Priority
**P0** - Critical path for multi-tenant functionality

---

## UXS-005-02: Agency Onboarding New Client

### Story ID
UXS-005-02

### Title
Complete Client Onboarding with GHL Integration

### Persona
**David Martinez** - Agency Account Manager
- 28 years old, manages client relationships for the agency
- Handles 6-8 active client accounts
- Needs to efficiently onboard clients with their existing GHL credentials
- Focused on client success and quick time-to-value

### Scenario
David is onboarding a new client, "Peak Performance Coaching", who already has an existing GoHighLevel account. David needs to guide them through connecting their GHL credentials, setting up their brand assets, and configuring initial automation preferences.

### User Goal
Complete full client onboarding with GHL integration, brand setup, and initial preferences within a single guided session of 15-20 minutes.

### Preconditions
- Client sub-account "Peak Performance Coaching" has been created
- David is logged in with Agency Manager role
- David has access to the client's sub-account
- Client (Lisa, the business owner) is available on a video call to provide GHL credentials

### Step-by-Step User Journey

**Step 1**: Access Client Onboarding Dashboard
- David navigates to the client's sub-account
- Clicks "Complete Onboarding" button on the incomplete setup banner
- **Expected Response**: System displays the Onboarding Wizard with checklist:
  - [ ] GHL Connection
  - [ ] Brand Setup
  - [ ] Preferences
  - [ ] Knowledge Base (optional)
  - [ ] Test Automation

**Step 2**: Connect GHL Account
- David clicks "Connect GHL" step
- Client Lisa provides her GHL login credentials
- David enters the credentials in the secure form
- **Expected Response**:
  - Credentials are encrypted client-side before transmission
  - System displays "Verifying connection..." with spinner
  - On success: Green checkmark, GHL account name displayed
  - Option to store in 1Password Connect (agency-level security)

**Step 3**: Verify GHL Access
- System automatically tests the connection
- **Expected Response**:
  - Shows which GHL features are accessible:
    - Contacts: Access verified
    - Funnels: Access verified
    - Workflows: Access verified
    - Calendars: Access verified
  - Any missing permissions are highlighted with resolution steps

**Step 4**: Configure Brand Assets
- David uploads or enters:
  - Company Logo
  - Brand Colors (primary, secondary, accent)
  - Font preference (from dropdown)
  - Brand voice description: "Professional yet approachable, empowering"
  - Sample marketing copy (optional)
- **Expected Response**:
  - Live preview of how automations will reflect brand
  - AI-generated brand voice examples based on description
  - Validation of color accessibility

**Step 5**: Set Automation Preferences
- David configures client preferences:
  - Default response speed: "Within 5 minutes"
  - Automation approval: "Auto-approve simple tasks"
  - Notification preferences: Email + In-app
  - Business hours: Mon-Fri, 9 AM - 6 PM PST
- **Expected Response**:
  - Clear explanations for each setting
  - Recommendations based on industry
  - Warning for potentially risky settings (e.g., auto-approve all)

**Step 6**: Optional Knowledge Base Setup
- David has option to upload:
  - Service descriptions
  - FAQ documents
  - Previous marketing materials
  - Competitor analysis
- **Expected Response**:
  - File upload with progress indicator
  - Document processing status
  - Estimated time for vectorization
  - "Skip for now" option with reminder to complete later

**Step 7**: Run Test Automation
- David initiates a simple test: "Create a sample thank you email"
- **Expected Response**:
  - Agent executes with real-time thinking visualization
  - Uses configured brand voice and colors
  - Shows GHL integration in action
  - Generates sample email with brand styling

**Step 8**: Complete Onboarding
- David reviews the summary of completed setup
- Clicks "Complete Onboarding"
- **Expected Response**:
  - Celebratory success message
  - Summary emailed to client
  - Dashboard unlocks all features
  - First-use tooltips enabled for client

### Expected Outcomes
- Client account is fully connected to GHL
- Brand assets are stored and indexed for agent use
- Preferences are saved and will govern automation behavior
- Client dashboard shows 100% onboarding completion
- Audit log captures all onboarding steps
- Client receives welcome/summary email

### Acceptance Criteria

```gherkin
Given David is onboarding a client sub-account
And he has the client's GHL credentials
When he completes all required onboarding steps
Then the GHL connection is verified and stored securely
And brand assets are processed and available for automations
And the onboarding status shows 100% complete
And the client receives a confirmation email

Given invalid GHL credentials are entered
When the system attempts to verify the connection
Then an appropriate error message is displayed
And the credentials are not stored
And suggested troubleshooting steps are provided

Given the client wants to skip optional steps
When David clicks "Skip for now" on Knowledge Base
Then the step is marked as incomplete but not blocking
And a reminder is scheduled for later completion
```

### Edge Cases

1. **GHL Two-Factor Authentication**
   - Client has 2FA enabled on GHL
   - System prompts for verification code
   - Handles time-sensitive code expiration gracefully

2. **GHL Account with Limited Permissions**
   - Some GHL features are restricted
   - System shows partial access warning
   - Lists which automations will be limited

3. **Large Knowledge Base Upload**
   - Files exceed 50MB total
   - System queues processing with notification when complete
   - Allows continued onboarding while processing

4. **Session Timeout During Onboarding**
   - User session expires mid-process
   - Progress is saved
   - User can resume from last completed step

5. **GHL Credential Update Required**
   - GHL password changed after initial setup
   - System detects invalid credentials on next use
   - Prompts for re-authentication without losing other settings

### Test Data Requirements

```json
{
  "ghl_test_account": {
    "email": "test-client@peakcoaching.com",
    "location_id": "loc_test_123456",
    "api_key": "ghl_test_api_key_xxxxx"
  },
  "brand_assets": {
    "logo": "test-assets/peak-coaching-logo.svg",
    "colors": {
      "primary": "#FF6B35",
      "secondary": "#4ECDC4",
      "accent": "#2C3E50"
    },
    "voice_description": "Professional yet approachable, empowering"
  },
  "preferences": {
    "response_speed": "within_5_minutes",
    "auto_approve": "simple_tasks",
    "business_hours": {
      "days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
      "start": "09:00",
      "end": "18:00",
      "timezone": "America/Los_Angeles"
    }
  }
}
```

### Priority
**P0** - Essential for client activation

---

## UXS-005-03: Tenant Data Isolation Verification

### Story ID
UXS-005-03

### Title
Verify Complete Data Isolation Between Tenants

### Persona
**Alex Kim** - Security Auditor / QA Engineer
- 32 years old, responsible for security and compliance testing
- Needs to verify that multi-tenant data isolation is bulletproof
- Documents findings for SOC 2 compliance
- Uses both UI and API testing approaches

### Scenario
Alex is conducting a security audit to verify that data from one tenant (Client A - "Sunrise Dental") cannot be accessed, viewed, or modified by another tenant (Client B - "Metro Law Group"). This includes testing database isolation, API boundaries, file storage separation, and session management.

### User Goal
Verify complete data isolation between tenants with zero data leakage, and document findings for compliance certification.

### Preconditions
- Two test sub-accounts exist: "Sunrise Dental" and "Metro Law Group"
- Both accounts have sample data (contacts, automations, files)
- Alex has test user accounts for both tenants
- Alex has administrative access for audit purposes
- API testing tools (Postman, curl) are available

### Step-by-Step User Journey

**Step 1**: Set Up Test Environment
- Alex logs into "Sunrise Dental" as test user (dental_user@test.com)
- Creates identifiable test data:
  - Contact: "John Dental Test" with phone "555-DENTAL"
  - Automation: "Dental Appointment Reminder"
  - File: "dental_patient_list.csv"
- **Expected Response**: All data created successfully with tenant_id = sunrise_dental

**Step 2**: Attempt Cross-Tenant Data Access via UI
- Alex logs out and logs into "Metro Law Group" as different user (law_user@test.com)
- Searches for "Dental" in contacts
- Searches for "Dental" in automations
- Browses file storage
- **Expected Response**:
  - No results returned for "Dental" searches
  - File storage only shows Metro Law Group files
  - No indication that Sunrise Dental data exists

**Step 3**: Attempt Cross-Tenant API Access
- Alex extracts the contact ID from Sunrise Dental (contact_id_dental_123)
- Using Metro Law Group session token, attempts:
  - GET /api/contacts/contact_id_dental_123
  - PUT /api/contacts/contact_id_dental_123
  - DELETE /api/contacts/contact_id_dental_123
- **Expected Response**:
  - All requests return 404 (Not Found) or 403 (Forbidden)
  - No data from Sunrise Dental is returned
  - Attempts are logged in security audit log

**Step 4**: Verify Database-Level Isolation
- Alex (with admin access) runs database queries:
  - Query contacts table filtered by Metro Law tenant_id
  - Verify Sunrise Dental records are not in result set
  - Check row-level security policies are active
- **Expected Response**:
  - RLS policies prevent cross-tenant queries
  - Database logs show blocked access attempts
  - Tenant_id is enforced on all tables

**Step 5**: Test File Storage Isolation
- Alex attempts to access Sunrise Dental file using Metro Law Group context:
  - Direct S3/storage URL manipulation
  - API request with wrong tenant context
  - Browser DevTools to modify file request headers
- **Expected Response**:
  - Signed URLs are tenant-scoped and fail for wrong tenant
  - API rejects requests with mismatched tenant_id
  - No files from other tenants are accessible

**Step 6**: Session and Token Isolation
- Alex captures JWT token from Metro Law Group session
- Attempts to use token with Sunrise Dental subdomain/API
- Tests token manipulation (changing tenant_id claim)
- **Expected Response**:
  - Token is validated against request context
  - Tampered tokens are rejected with 401
  - Session cookies are domain-scoped

**Step 7**: Verify Audit Trail
- Alex reviews security audit logs for all test attempts
- **Expected Response**:
  - All cross-tenant access attempts are logged
  - Logs include: timestamp, user, action, target, result
  - Alerts triggered for suspicious patterns

**Step 8**: Document Findings
- Alex generates isolation verification report
- **Expected Response**:
  - System provides exportable security report
  - All test cases documented with pass/fail
  - Recommendations for any identified issues

### Expected Outcomes
- Zero data leakage between tenants confirmed
- All API boundaries properly enforced
- Database RLS policies functioning correctly
- File storage isolation verified
- Session management prevents cross-tenant access
- Complete audit trail of security testing

### Acceptance Criteria

```gherkin
Given User A is authenticated to Tenant A
And data exists in Tenant B
When User A attempts to access Tenant B data via UI
Then no Tenant B data is visible or accessible
And the attempt is logged in the audit system

Given User A has a valid session token for Tenant A
When User A makes API requests targeting Tenant B resources
Then all requests return 404 or 403 status codes
And no Tenant B data is included in responses
And the blocked attempts are logged

Given User A attempts to manipulate JWT claims
When the modified token is used in an API request
Then the request is rejected with 401 Unauthorized
And the tampering attempt is logged as a security event

Given an auditor needs to verify data isolation
When they generate a security isolation report
Then the report includes all test cases with results
And any failures are clearly highlighted
```

### Edge Cases

1. **Shared Resource References**
   - Global template referenced by multiple tenants
   - Template data is read-only and contains no tenant data
   - Tenant-specific customizations are isolated

2. **Cached Data Leakage**
   - Redis/cache contains data from multiple tenants
   - Cache keys are prefixed with tenant_id
   - Cache invalidation is tenant-scoped

3. **Search Index Isolation**
   - Elasticsearch/search indexes are tenant-filtered
   - Search queries cannot return cross-tenant results
   - Index permissions verified

4. **Backup and Restore Isolation**
   - Tenant backup only includes their data
   - Restore cannot overwrite other tenant data
   - Point-in-time recovery is tenant-scoped

5. **Agency Admin Cross-Tenant View**
   - Agency admin can view all their sub-accounts
   - View access is logged as admin action
   - Admin cannot modify without switching context

### Test Data Requirements

```json
{
  "tenant_a": {
    "name": "Sunrise Dental",
    "tenant_id": "tenant_sunrise_dental",
    "test_contact": {
      "id": "contact_dental_123",
      "name": "John Dental Test",
      "phone": "555-DENTAL",
      "email": "john@sunrisedental.test"
    },
    "test_automation": {
      "id": "auto_dental_456",
      "name": "Dental Appointment Reminder"
    },
    "test_file": {
      "name": "dental_patient_list.csv",
      "path": "sunrise_dental/files/dental_patient_list.csv"
    }
  },
  "tenant_b": {
    "name": "Metro Law Group",
    "tenant_id": "tenant_metro_law",
    "test_user": {
      "email": "law_user@test.com"
    }
  },
  "api_endpoints_to_test": [
    "GET /api/contacts/{id}",
    "PUT /api/contacts/{id}",
    "DELETE /api/contacts/{id}",
    "GET /api/automations/{id}",
    "GET /api/files/{path}"
  ]
}
```

### Priority
**P0** - Critical security requirement

---

## UXS-005-04: Permission Hierarchy Management

### Story ID
UXS-005-04

### Title
Configure and Test Multi-Level Permission Hierarchy

### Persona
**Rachel Torres** - Agency Operations Director
- 40 years old, oversees agency operations and team structure
- Manages 25 team members across multiple departments
- Needs to set up appropriate access levels for different roles
- Concerned about least-privilege access and security

### Scenario
Rachel needs to configure the permission hierarchy for her agency, ensuring that Platform Admins have full access, Agency Managers can manage all clients but not system settings, and Client Users can only access their own sub-account with appropriate limitations.

### User Goal
Establish a clear, secure permission hierarchy (Admin > Agency > Client) that enforces appropriate access levels across all platform features.

### Preconditions
- Rachel is logged in as Platform Super Admin
- Agency structure exists with multiple sub-accounts
- Test users exist at each permission level
- Rachel has documented the desired permission matrix

### Step-by-Step User Journey

**Step 1**: Access Permission Management
- Rachel navigates to Settings > Permissions & Roles
- **Expected Response**: System displays:
  - Role hierarchy visualization (tree/diagram)
  - List of predefined roles with permission summaries
  - Custom role creation option
  - User-to-role assignment interface

**Step 2**: Review Default Role Hierarchy
- Rachel examines the default roles:
  - Platform Super Admin (Level 1)
  - Agency Admin (Level 2)
  - Agency Manager (Level 3)
  - Client Admin (Level 4)
  - Client User (Level 5)
- **Expected Response**:
  - Each role shows inherited vs. explicit permissions
  - Visual hierarchy tree with expand/collapse
  - Permission comparison tool available

**Step 3**: Customize Agency Manager Role
- Rachel modifies Agency Manager permissions:
  - Enable: Manage all sub-accounts
  - Enable: View billing summaries
  - Disable: Modify agency-level settings
  - Disable: Delete sub-accounts
  - Enable: Export client reports
- **Expected Response**:
  - Permission toggles with confirmation for sensitive changes
  - Impact preview showing affected users
  - Warning for permissions that exceed current role
  - "Save Changes" requires confirmation

**Step 4**: Create Custom Client Role
- Rachel creates "Client Viewer" role:
  - Based on: Client User
  - Permissions: View-only access
  - Remove: Edit automations
  - Remove: Delete contacts
  - Add: View analytics
- **Expected Response**:
  - Role creation wizard
  - Inheritance from base role shown
  - Conflict detection if permissions are incompatible
  - Role appears in hierarchy under Client Admin

**Step 5**: Assign Roles to Users
- Rachel assigns roles to team members:
  - Tom: Agency Manager
  - Sarah: Agency Admin
  - Client Mark: Client Admin (for Coastal Realty)
  - Client Intern: Client Viewer (for Coastal Realty)
- **Expected Response**:
  - User search/selection interface
  - Role assignment dropdown with scope selector
  - Immediate effect or scheduled activation option
  - Notification sent to affected users

**Step 6**: Test Permission Boundaries
- Rachel uses "Test Permissions" feature:
  - Selects "Agency Manager" role
  - System shows simulated view of accessible features
  - Grayed out items show restricted features
- **Expected Response**:
  - Accurate simulation of role's access
  - List of blocked actions with explanations
  - Option to switch to any role for testing

**Step 7**: Configure Permission Inheritance
- Rachel sets inheritance rules:
  - Agency-level permissions cascade to sub-accounts
  - Client-level permissions are scoped to their account
  - Cross-tenant permissions require explicit grant
- **Expected Response**:
  - Inheritance diagram updates
  - Validation prevents circular dependencies
  - Clear indication of where permissions originate

**Step 8**: Verify Implementation
- Rachel logs in as Tom (Agency Manager) to verify:
  - Can access all sub-accounts
  - Cannot access system settings
  - Cannot delete sub-accounts
- **Expected Response**:
  - Navigation reflects available permissions
  - Restricted actions show "No Permission" message
  - Audit log records Rachel's impersonation

### Expected Outcomes
- Clear role hierarchy is established
- Custom roles function correctly
- Permission inheritance works as configured
- Restricted actions are properly blocked
- All role changes are logged
- Users are notified of role changes

### Acceptance Criteria

```gherkin
Given Rachel has Platform Super Admin role
When she modifies Agency Manager permissions
Then the changes apply immediately to all Agency Manager users
And affected users see updated navigation/access
And changes are recorded in the audit log

Given a user has Agency Manager role
When they attempt to access system settings
Then access is denied with appropriate message
And the blocked attempt is logged

Given Rachel creates a custom Client Viewer role
When she assigns it to a user
Then the user has only view permissions
And cannot edit or delete any resources
And actions are correctly limited in UI and API

Given role inheritance is configured
When a parent role permission changes
Then child roles inherit the change appropriately
And explicit overrides are preserved
```

### Edge Cases

1. **Role Deletion with Active Users**
   - Cannot delete role while users are assigned
   - Must reassign users first
   - Option to bulk reassign to another role

2. **Circular Permission Dependencies**
   - System prevents creating circular inheritance
   - Clear error message with explanation
   - Suggests valid configuration

3. **Permission Escalation Attempt**
   - User cannot assign role higher than their own
   - Agency Manager cannot create Agency Admin
   - System blocks with permission error

4. **Conflicting Permissions**
   - Explicit deny overrides inherited allow
   - Clear indication of effective permissions
   - Conflict resolution UI available

5. **Cross-Tenant Role Assignment**
   - Agency can assign roles across their sub-accounts
   - Client cannot assign roles in other sub-accounts
   - Clear scope boundaries

### Test Data Requirements

```json
{
  "roles": [
    {
      "name": "Platform Super Admin",
      "level": 1,
      "permissions": ["*"]
    },
    {
      "name": "Agency Admin",
      "level": 2,
      "permissions": ["agency.*", "subaccount.*"]
    },
    {
      "name": "Agency Manager",
      "level": 3,
      "permissions": ["subaccount.view", "subaccount.edit", "reports.*"]
    },
    {
      "name": "Client Admin",
      "level": 4,
      "scope": "own_tenant",
      "permissions": ["tenant.*"]
    },
    {
      "name": "Client Viewer",
      "level": 5,
      "scope": "own_tenant",
      "permissions": ["tenant.view"]
    }
  ],
  "test_users": [
    {"name": "Tom", "role": "Agency Manager"},
    {"name": "Sarah", "role": "Agency Admin"},
    {"name": "Mark", "role": "Client Admin", "tenant": "coastal_realty"},
    {"name": "Intern", "role": "Client Viewer", "tenant": "coastal_realty"}
  ],
  "permission_tests": [
    {"role": "Agency Manager", "action": "delete_subaccount", "expected": "denied"},
    {"role": "Client Admin", "action": "view_other_tenant", "expected": "denied"},
    {"role": "Client Viewer", "action": "edit_automation", "expected": "denied"}
  ]
}
```

### Priority
**P0** - Core security and access control

---

## UXS-005-05: White-Label Branding Configuration

### Story ID
UXS-005-05

### Title
Configure Complete White-Label Branding for Client Portal

### Persona
**Jennifer Walsh** - Agency Brand Manager
- 31 years old, manages brand consistency across client accounts
- Expert in visual design and brand guidelines
- Needs to customize each client's experience
- Values pixel-perfect implementation and brand fidelity

### Scenario
Jennifer is setting up white-label branding for a premium client, "Apex Financial Advisors", who wants the platform to appear as their own proprietary tool. This includes custom logo, colors, fonts, email templates, and complete removal of Bottleneck-Bots branding.

### User Goal
Configure comprehensive white-label branding so the client sees only their brand identity with no third-party branding visible.

### Preconditions
- Jennifer has Agency Manager role with branding permissions
- "Apex Financial Advisors" sub-account exists
- Client has provided complete brand guidelines (logo, colors, fonts)
- Agency plan includes white-label feature
- Brand assets are prepared in correct formats

### Step-by-Step User Journey

**Step 1**: Access White-Label Settings
- Jennifer navigates to Sub-Account > Apex Financial > Settings > Branding
- **Expected Response**: White-label configuration dashboard with sections:
  - Logo & Identity
  - Color Scheme
  - Typography
  - Email Templates
  - Portal Customization
  - Preview Mode

**Step 2**: Configure Logo and Identity
- Jennifer uploads:
  - Primary Logo (for header): apex-logo-dark.svg
  - Light Logo (for dark backgrounds): apex-logo-light.svg
  - Favicon: apex-favicon.ico
  - App Icon (for mobile): apex-icon-192.png
- **Expected Response**:
  - Image validation (format, size, dimensions)
  - Automatic generation of required sizes
  - Preview in header position
  - Dark/light mode logo switching demo

**Step 3**: Set Color Scheme
- Jennifer configures colors:
  - Primary: #1B365D (Navy Blue)
  - Secondary: #C4A962 (Gold)
  - Accent: #4A90A4 (Teal)
  - Background: #FFFFFF
  - Text Primary: #333333
  - Text Secondary: #666666
  - Success: #28A745
  - Warning: #FFC107
  - Error: #DC3545
- **Expected Response**:
  - Color picker with hex/RGB input
  - Live preview panel updating in real-time
  - Accessibility contrast checker
  - Auto-generate complementary shades
  - Save as color palette for reuse

**Step 4**: Configure Typography
- Jennifer selects fonts:
  - Headings: "Playfair Display" (Google Font)
  - Body: "Open Sans" (Google Font)
  - Monospace: "Source Code Pro"
- Sets font sizes and weights
- **Expected Response**:
  - Font preview with sample text
  - Font loading verification
  - Fallback font configuration
  - Mobile typography scaling preview

**Step 5**: Customize Email Templates
- Jennifer modifies email templates:
  - Welcome Email: Custom header with Apex logo
  - Notification Emails: Brand colors and footer
  - Report Emails: Professional Apex styling
- **Expected Response**:
  - WYSIWYG email editor
  - Dynamic variable insertion ({{client_name}}, etc.)
  - Send test email option
  - Mobile email preview
  - Spam score check

**Step 6**: Configure Portal Customization
- Jennifer customizes:
  - Login page background image
  - Custom login message: "Welcome to Apex Advisor Portal"
  - Powered-by text: Hidden
  - Support email: support@apexfinancial.com
  - Custom footer links: Privacy Policy, Terms
- **Expected Response**:
  - Login page preview
  - Full portal preview in new tab
  - Mobile view preview
  - All Bottleneck-Bots references removed

**Step 7**: Configure Custom Domain (Optional)
- Jennifer sets up custom domain:
  - Domain: portal.apexfinancial.com
  - SSL certificate auto-provisioned
- **Expected Response**:
  - DNS configuration instructions
  - Domain verification status
  - SSL certificate status
  - Redirect configuration options

**Step 8**: Preview and Publish
- Jennifer uses comprehensive preview:
  - Desktop view
  - Tablet view
  - Mobile view
  - Dark mode (if enabled)
  - Print view (for reports)
- Clicks "Publish Branding"
- **Expected Response**:
  - Publishing progress indicator
  - Cache clearing notification
  - Success confirmation
  - Client notification option

### Expected Outcomes
- Client portal displays only Apex Financial branding
- All emails sent use custom branding
- No Bottleneck-Bots branding is visible anywhere
- Custom domain works with SSL
- Branding is consistent across all devices
- Changes are logged in audit trail

### Acceptance Criteria

```gherkin
Given Jennifer has branding permissions for a sub-account
When she uploads custom logos and saves
Then the logos appear in the correct positions
And old logos are replaced immediately
And fallback to default works if upload fails

Given custom colors are configured
When a client logs into their portal
Then all UI elements use the custom colors
And contrast ratios meet WCAG AA standards
And dark mode uses appropriate variations

Given email templates are customized
When the system sends an email to the client
Then the email uses custom branding
And no Bottleneck-Bots branding appears
And the email passes spam filters

Given custom domain is configured
When a user visits portal.apexfinancial.com
Then they see the white-labeled portal
And SSL certificate is valid
And no Bottleneck-Bots URLs are visible
```

### Edge Cases

1. **Missing Logo Variant**
   - Only dark logo uploaded
   - System auto-inverts for light version
   - Warning shown about potential quality issues

2. **Color Accessibility Failure**
   - Primary/background contrast too low
   - System shows WCAG warning
   - Suggests accessible alternatives
   - Allows override with acknowledgment

3. **Custom Font Loading Failure**
   - Google Font unavailable
   - System falls back to system fonts
   - Notification sent to admin
   - Caches font for offline availability

4. **Domain Verification Timeout**
   - DNS propagation takes too long
   - System provides status checking tool
   - Email notification when verified
   - Fallback to subdomain maintained

5. **Email Deliverability Issues**
   - Custom domain affects email deliverability
   - System checks SPF/DKIM/DMARC
   - Warns about missing records
   - Provides configuration guidance

### Test Data Requirements

```json
{
  "brand_assets": {
    "logos": {
      "primary_dark": "test-assets/apex-logo-dark.svg",
      "primary_light": "test-assets/apex-logo-light.svg",
      "favicon": "test-assets/apex-favicon.ico",
      "app_icon": "test-assets/apex-icon-192.png"
    },
    "colors": {
      "primary": "#1B365D",
      "secondary": "#C4A962",
      "accent": "#4A90A4",
      "background": "#FFFFFF",
      "text_primary": "#333333",
      "text_secondary": "#666666"
    },
    "typography": {
      "heading_font": "Playfair Display",
      "body_font": "Open Sans",
      "monospace_font": "Source Code Pro"
    }
  },
  "custom_domain": {
    "domain": "portal.apexfinancial.com",
    "dns_records": {
      "cname": "custom.bottleneckbots.com",
      "txt_verification": "bb-verify=abc123"
    }
  },
  "email_templates": {
    "welcome": {
      "subject": "Welcome to Apex Advisor Portal",
      "from_name": "Apex Financial Advisors"
    }
  }
}
```

### Priority
**P1** - Important for premium agency clients

---

## UXS-005-06: Cross-Tenant Analytics for Agency Owners

### Story ID
UXS-005-06

### Title
View Aggregated Analytics Across All Client Sub-Accounts

### Persona
**Michael Chen** - Agency CEO
- 45 years old, oversees agency performance and growth
- Needs high-level visibility across all clients
- Makes strategic decisions based on aggregate data
- Values actionable insights and trend analysis

### Scenario
Michael wants to view consolidated analytics across all 15 of his agency's client sub-accounts to understand overall performance, identify top performers, spot struggling clients, and make resource allocation decisions.

### User Goal
Access aggregated analytics dashboard showing performance metrics, trends, and comparisons across all managed sub-accounts in a single view.

### Preconditions
- Michael is logged in as Agency Super Admin
- Agency has 15 active sub-accounts with varying activity levels
- Historical data exists (at least 30 days)
- All sub-accounts have automations running

### Step-by-Step User Journey

**Step 1**: Access Agency Analytics Dashboard
- Michael clicks "Agency Analytics" from main navigation
- **Expected Response**: Dashboard loads showing:
  - Executive summary cards (total executions, success rate, active users)
  - Date range selector (default: last 30 days)
  - Quick filters (industry, status, performance tier)
  - Export options

**Step 2**: Review Executive Summary
- Michael views high-level metrics:
  - Total Automation Executions: 12,450
  - Overall Success Rate: 94.7%
  - Active Sub-Accounts: 15/15
  - Total Users Across Accounts: 47
  - Credits Consumed: 85,000 / 150,000
- **Expected Response**:
  - Metrics with trend indicators (up/down arrows)
  - Comparison to previous period
  - Click-through to detailed breakdowns

**Step 3**: View Client Performance Comparison
- Michael examines the comparison table:
  - Ranked list of all sub-accounts
  - Columns: Account Name, Executions, Success Rate, Credits Used, Last Active
  - Sortable by any column
- **Expected Response**:
  - Color-coded performance indicators (green/yellow/red)
  - Mini sparkline charts showing trends
  - Click row to drill into individual account
  - Export table to CSV

**Step 4**: Analyze Usage Trends
- Michael views the usage trend chart:
  - Time series showing daily/weekly executions
  - Overlay with success/failure breakdown
  - Comparison toggle for period-over-period
- **Expected Response**:
  - Interactive chart with hover tooltips
  - Zoom and pan for date ranges
  - Anomaly detection highlighting
  - Download chart as image

**Step 5**: Identify At-Risk Accounts
- Michael reviews the "Attention Required" section:
  - Accounts with declining activity
  - Accounts with high failure rates
  - Accounts approaching resource limits
- **Expected Response**:
  - Prioritized list with severity indicators
  - One-click actions (Contact, View Details, Adjust Limits)
  - Historical context for each alert

**Step 6**: Review Resource Utilization
- Michael examines resource distribution:
  - Credit allocation vs. usage per account
  - Browser session utilization
  - Storage consumption
- **Expected Response**:
  - Visual allocation chart (treemap or bar chart)
  - Utilization percentages
  - Recommendations for reallocation
  - Projections for resource exhaustion

**Step 7**: Generate Custom Report
- Michael creates a monthly performance report:
  - Selects metrics to include
  - Chooses visualization types
  - Adds custom notes/annotations
  - Sets delivery schedule (monthly email)
- **Expected Response**:
  - Report builder interface
  - Preview before saving
  - Schedule configuration
  - PDF/Excel export options

**Step 8**: Drill Down to Individual Account
- Michael clicks on "Coastal Realty Group" for details
- **Expected Response**:
  - Seamless navigation to account-specific analytics
  - Breadcrumb navigation back to aggregate view
  - Context preserved (date range, filters)

### Expected Outcomes
- Michael has complete visibility across all sub-accounts
- Performance trends and anomalies are clearly visible
- At-risk accounts are easily identified
- Resource utilization is optimized based on insights
- Regular reports are automated

### Acceptance Criteria

```gherkin
Given Michael is logged in as Agency Super Admin
When he accesses the Agency Analytics dashboard
Then he sees aggregated data from all sub-accounts
And data is accurate and current (max 1 hour delay)
And no individual client data leaks to other views

Given the analytics dashboard is displayed
When Michael sorts the comparison table by success rate
Then sub-accounts are correctly ordered
And visual indicators match the sorted order

Given Michael creates a scheduled report
When the schedule triggers (monthly)
Then the report is generated with current data
And delivered to specified email addresses
And contains only data Michael has permission to see

Given a sub-account has declining activity
When Michael views the "Attention Required" section
Then the account is listed with appropriate severity
And actionable recommendations are provided
```

### Edge Cases

1. **New Sub-Account with No Data**
   - Recently created account has no history
   - Shows "Insufficient data" instead of misleading metrics
   - Excluded from comparisons until baseline established

2. **Date Range Exceeds Data Retention**
   - User selects date range beyond retained data
   - System shows available range only
   - Message explains data retention policy

3. **Large Number of Sub-Accounts**
   - Agency has 100+ sub-accounts
   - Pagination and virtualization for performance
   - Filter/search to find specific accounts

4. **Real-Time vs. Batch Data**
   - Some metrics are real-time, others batch-processed
   - Clear indication of data freshness
   - "Last updated" timestamps displayed

5. **Permission-Filtered View**
   - User with limited permissions sees subset
   - Analytics only include permitted accounts
   - No indication of hidden data

### Test Data Requirements

```json
{
  "agency": {
    "id": "agency_chen_marketing",
    "total_subaccounts": 15,
    "total_users": 47
  },
  "date_range": {
    "start": "2025-12-11",
    "end": "2026-01-11",
    "comparison_start": "2025-11-11",
    "comparison_end": "2025-12-11"
  },
  "subaccounts": [
    {
      "name": "Coastal Realty Group",
      "executions": 1250,
      "success_rate": 96.5,
      "credits_used": 8500,
      "last_active": "2026-01-11T10:30:00Z"
    },
    {
      "name": "Peak Performance Coaching",
      "executions": 890,
      "success_rate": 92.1,
      "credits_used": 6200,
      "last_active": "2026-01-10T15:45:00Z"
    }
  ],
  "alerts": [
    {
      "account": "Metro Law Group",
      "type": "declining_activity",
      "severity": "medium",
      "message": "50% decrease in executions over 14 days"
    }
  ]
}
```

### Priority
**P1** - Important for agency management

---

## UXS-005-07: Audit Log Viewing Per Tenant

### Story ID
UXS-005-07

### Title
View and Analyze Tenant-Specific Audit Logs

### Persona
**Diana Roberts** - Compliance Officer
- 38 years old, responsible for regulatory compliance
- Needs to track all user actions for audit purposes
- Creates compliance reports for clients
- Values detailed, searchable, exportable logs

### Scenario
Diana needs to review audit logs for a specific client, "Healthcare Plus Clinic", to generate a compliance report showing all user actions, data access events, and system changes over the past quarter. This is required for their HIPAA compliance documentation.

### User Goal
Access comprehensive, filterable audit logs for a specific tenant with the ability to search, analyze, and export for compliance reporting.

### Preconditions
- Diana has Agency Admin or Compliance Officer role
- "Healthcare Plus Clinic" sub-account exists with 90 days of activity
- Audit logging is enabled and collecting all events
- Diana has audit log viewing permissions

### Step-by-Step User Journey

**Step 1**: Navigate to Audit Logs
- Diana goes to Healthcare Plus Clinic > Settings > Audit Logs
- **Expected Response**: Audit log viewer loads with:
  - Recent events list (paginated)
  - Filter panel (date, user, action type, resource)
  - Search bar
  - Export button
  - Log summary statistics

**Step 2**: Set Date Range Filter
- Diana selects: October 1, 2025 - December 31, 2025
- **Expected Response**:
  - Date picker with presets (Last 7 days, Last 30 days, Last quarter, Custom)
  - Calendar interface for custom range
  - Event count updates dynamically
  - Loading indicator for large datasets

**Step 3**: Filter by Event Category
- Diana filters by categories:
  - Authentication events (login, logout, failed attempts)
  - Data access events (view, export)
  - Modification events (create, update, delete)
  - Admin events (settings changes, user management)
- **Expected Response**:
  - Multi-select filter with checkboxes
  - Event count per category shown
  - Applied filters visible as tags
  - Clear all filters option

**Step 4**: Search for Specific Events
- Diana searches: "patient data export"
- **Expected Response**:
  - Full-text search across event descriptions
  - Highlighted matches in results
  - Relevance-sorted results
  - Option to search specific fields only

**Step 5**: Review Event Details
- Diana clicks on a specific event:
  - Event ID: audit_789xyz
  - Timestamp: 2025-11-15T14:32:17Z
  - User: nurse_amy@healthcareplus.com
  - Action: data_export
  - Resource: patient_contacts
  - Details: Exported 150 patient records to CSV
  - IP Address: 192.168.1.45
  - User Agent: Chrome/Windows
- **Expected Response**:
  - Event detail modal/side panel
  - Complete metadata display
  - Related events link (same session)
  - Copy event ID option

**Step 6**: View User Activity Timeline
- Diana clicks on a user to see their activity
- **Expected Response**:
  - Timeline view of user's actions
  - Session grouping
  - Geographic location of access
  - Device/browser information
  - Unusual activity highlighting

**Step 7**: Generate Compliance Report
- Diana creates a compliance report:
  - Select report template: HIPAA Access Log
  - Date range: Q4 2025
  - Include: All data access events
  - Format: PDF with digital signature
- **Expected Response**:
  - Report generation progress
  - Preview before download
  - Digital signature/hash for integrity
  - Storage of generated report

**Step 8**: Export Raw Logs
- Diana exports filtered logs:
  - Format: CSV or JSON
  - Fields: All or selected
  - Encryption: Optional password protection
- **Expected Response**:
  - Export format selection
  - Field selection interface
  - Download progress for large exports
  - Confirmation with row count

### Expected Outcomes
- Complete audit trail is accessible for the tenant
- Filters and search enable efficient log analysis
- Compliance reports meet regulatory requirements
- Export functionality supports various formats
- All log viewing actions are themselves logged

### Acceptance Criteria

```gherkin
Given Diana has audit log access for Healthcare Plus Clinic
When she applies date and category filters
Then only matching events are displayed
And pagination works correctly with filters applied
And export includes only filtered results

Given Diana views an audit event detail
When she clicks on the event
Then all metadata is displayed completely
And sensitive data is appropriately masked
And related events are linkable

Given Diana generates a HIPAA compliance report
When the report is generated
Then it includes all required access events
And is formatted according to HIPAA requirements
And includes integrity verification (hash/signature)

Given Diana searches for "patient data export"
When results are returned
Then all relevant events are included
And search terms are highlighted
And no unrelated events appear
```

### Edge Cases

1. **High Volume Log Period**
   - Selected range has millions of events
   - Server-side pagination and filtering
   - Async export with email notification

2. **Deleted User Audit Events**
   - User was deleted but audit events remain
   - Shows "Deleted User (user_id)" instead of name
   - Full event details preserved

3. **Sensitive Data in Logs**
   - PII appears in event details
   - Appropriate masking applied (email: j***@example.com)
   - Full data available with explicit permission

4. **Cross-Tenant Admin Actions**
   - Agency admin action on this tenant
   - Clearly marked as "Agency Admin Action"
   - Includes agency admin identity

5. **System-Generated Events**
   - Automated actions (scheduled jobs, integrations)
   - Identified as "System" actor
   - Full execution context available

### Test Data Requirements

```json
{
  "tenant": {
    "id": "tenant_healthcare_plus",
    "name": "Healthcare Plus Clinic"
  },
  "date_range": {
    "start": "2025-10-01T00:00:00Z",
    "end": "2025-12-31T23:59:59Z"
  },
  "event_categories": [
    "authentication",
    "data_access",
    "data_modification",
    "admin_action",
    "system_event"
  ],
  "sample_events": [
    {
      "id": "audit_789xyz",
      "timestamp": "2025-11-15T14:32:17Z",
      "user_email": "nurse_amy@healthcareplus.com",
      "action": "data_export",
      "resource_type": "patient_contacts",
      "details": "Exported 150 patient records to CSV",
      "ip_address": "192.168.1.45",
      "user_agent": "Mozilla/5.0 Chrome/119.0"
    },
    {
      "id": "audit_abc123",
      "timestamp": "2025-11-15T09:00:05Z",
      "user_email": "nurse_amy@healthcareplus.com",
      "action": "login",
      "resource_type": "session",
      "details": "Successful login via email/password",
      "ip_address": "192.168.1.45"
    }
  ],
  "compliance_templates": [
    "HIPAA Access Log",
    "SOC 2 Activity Report",
    "GDPR Data Access Report",
    "Custom Audit Report"
  ]
}
```

### Priority
**P1** - Required for compliance-conscious clients

---

## UXS-005-08: Sub-Account Resource Limits and Usage

### Story ID
UXS-005-08

### Title
Monitor and Manage Sub-Account Resource Allocation

### Persona
**Kevin Park** - Agency Operations Manager
- 34 years old, manages operational efficiency for the agency
- Responsible for resource allocation across clients
- Needs to prevent service disruptions from resource exhaustion
- Balances cost efficiency with client needs

### Scenario
Kevin needs to monitor resource usage across all sub-accounts, identify accounts approaching limits, adjust allocations to prevent service interruptions, and optimize resource distribution based on actual usage patterns.

### User Goal
Effectively monitor, manage, and optimize resource allocation across all sub-accounts to ensure service continuity while maximizing efficiency.

### Preconditions
- Kevin has Agency Operations Manager role
- Agency has 20 sub-accounts with varying resource needs
- Some accounts are approaching resource limits
- Historical usage data is available (60+ days)

### Step-by-Step User Journey

**Step 1**: Access Resource Management Dashboard
- Kevin navigates to Agency > Resource Management
- **Expected Response**: Dashboard displays:
  - Agency-wide resource summary
  - Per-resource allocation overview (credits, browsers, storage)
  - Accounts sorted by utilization (highest first)
  - Alert banner for accounts near limits

**Step 2**: Review Agency Resource Pool
- Kevin examines total available resources:
  - Monthly Credits: 150,000 (85,000 allocated, 65,000 unallocated)
  - Browser Sessions: 50 (42 allocated, 8 unallocated)
  - Storage: 500 GB (320 GB allocated, 180 GB unallocated)
- **Expected Response**:
  - Visual gauge/progress bars for each resource
  - Trend indicators (increasing/decreasing allocation)
  - Quick actions to purchase additional resources

**Step 3**: Identify Accounts Near Limits
- Kevin reviews accounts at risk:
  - "Fitness First Gym": 95% credit usage (warning)
  - "Green Energy Co": 88% storage usage (caution)
  - "Quick Loans Inc": 78% browser sessions (normal)
- **Expected Response**:
  - Color-coded status indicators
  - Days until projected exhaustion
  - Usage velocity trend
  - One-click to view details or adjust

**Step 4**: View Detailed Account Usage
- Kevin drills into "Fitness First Gym":
  - Current Month Credits: 9,500 / 10,000 (95%)
  - Daily Burn Rate: 350 credits
  - Projected Exhaustion: 1.4 days
  - Usage by Automation Type breakdown
- **Expected Response**:
  - Detailed usage charts (daily/weekly/monthly)
  - Top consuming automations list
  - Historical comparison (this month vs. last)
  - Recommendations for optimization

**Step 5**: Adjust Resource Allocation
- Kevin increases "Fitness First Gym" credits:
  - Current: 10,000 / month
  - New: 15,000 / month
  - Source: Unallocated pool (or transfer from another account)
- **Expected Response**:
  - Immediate vs. next billing cycle toggle
  - Impact preview on agency pool
  - Cost implications (if any)
  - Confirmation with audit log entry

**Step 6**: Set Up Resource Alerts
- Kevin configures alerts for the account:
  - Email when reaching 80% usage
  - In-app notification at 90%
  - Auto-pause automations at 100% (optional)
  - Weekly usage summary email
- **Expected Response**:
  - Alert threshold configuration interface
  - Recipient selection (account users, agency, both)
  - Test alert option
  - Alert history view

**Step 7**: Transfer Resources Between Accounts
- Kevin transfers unused credits from "Quiet Cafe" to "Fitness First":
  - From: Quiet Cafe (2,000 unused credits)
  - To: Fitness First Gym
  - Amount: 2,000 credits
- **Expected Response**:
  - Transfer wizard with validation
  - Preview of both accounts post-transfer
  - Notification to both account admins
  - Transfer recorded in audit log

**Step 8**: Generate Resource Utilization Report
- Kevin creates a monthly resource report:
  - Summary of all accounts
  - Utilization efficiency scores
  - Cost per automation type
  - Recommendations for optimization
- **Expected Response**:
  - Report generation with progress
  - PDF/Excel export options
  - Scheduled delivery option
  - Historical report archive

### Expected Outcomes
- Clear visibility into resource utilization
- Proactive alerts prevent service interruptions
- Efficient resource distribution across accounts
- Transfer capabilities enable flexibility
- Reporting supports operational decisions

### Acceptance Criteria

```gherkin
Given Kevin has resource management permissions
When he views the Resource Management dashboard
Then he sees accurate utilization for all sub-accounts
And accounts near limits are prominently displayed
And resource pool availability is correctly calculated

Given an account is at 95% credit usage
When Kevin increases the allocation
Then the change takes effect immediately (or as configured)
And the agency pool is correctly reduced
And both Kevin and the account receive confirmation

Given Kevin sets up an 80% usage alert
When an account reaches 80% usage
Then the configured recipients receive notifications
And the alert is logged in the audit system

Given Kevin transfers resources between accounts
When the transfer is completed
Then source account allocation is reduced
And target account allocation is increased
And the total agency pool remains unchanged
```

### Edge Cases

1. **Insufficient Agency Pool**
   - Attempt to allocate more than available
   - System blocks with clear message
   - Option to purchase additional resources

2. **Immediate vs. Prorated Allocation**
   - Mid-cycle allocation increase
   - Clear explanation of prorated amounts
   - Option for immediate full allocation

3. **Over-Utilization Grace Period**
   - Account exceeds limit before alert
   - Grace period prevents immediate service disruption
   - Urgent notification sent
   - Auto-escalation after grace period

4. **Resource Return on Account Downgrade**
   - Account allocation reduced
   - Unused resources return to pool
   - In-use resources grandfathered until cycle end

5. **Concurrent Allocation Requests**
   - Two admins try to allocate same resources
   - Optimistic locking prevents over-allocation
   - Second request fails with clear message

### Test Data Requirements

```json
{
  "agency_resources": {
    "credits": {
      "total": 150000,
      "allocated": 85000,
      "available": 65000
    },
    "browser_sessions": {
      "total": 50,
      "allocated": 42,
      "available": 8
    },
    "storage_gb": {
      "total": 500,
      "allocated": 320,
      "available": 180
    }
  },
  "subaccounts": [
    {
      "name": "Fitness First Gym",
      "credits_allocated": 10000,
      "credits_used": 9500,
      "daily_burn_rate": 350,
      "status": "warning"
    },
    {
      "name": "Green Energy Co",
      "storage_allocated_gb": 50,
      "storage_used_gb": 44,
      "status": "caution"
    },
    {
      "name": "Quiet Cafe",
      "credits_allocated": 5000,
      "credits_used": 3000,
      "status": "normal"
    }
  ],
  "alert_thresholds": [
    {"level": "info", "percentage": 70},
    {"level": "warning", "percentage": 80},
    {"level": "critical", "percentage": 90},
    {"level": "exhausted", "percentage": 100}
  ]
}
```

### Priority
**P0** - Critical for service continuity

---

## UXS-005-09: Multi-Tenant User Impersonation

### Story ID
UXS-005-09

### Title
Agency Admin Impersonates Client User for Support

### Persona
**Chris Anderson** - Agency Support Lead
- 29 years old, leads the client support team
- Needs to troubleshoot client issues efficiently
- Must see exactly what clients see
- Values quick resolution without extensive back-and-forth

### Scenario
Chris receives a support ticket from a client user at "Mountain View Dentistry" who reports they cannot see their automation history. Chris needs to impersonate the user to diagnose the issue from their perspective, identify the problem, and resolve it.

### User Goal
Safely impersonate a client user to diagnose and resolve their reported issue while maintaining security and audit compliance.

### Preconditions
- Chris has Agency Support role with impersonation permission
- "Mountain View Dentistry" is an agency sub-account
- The affected user (dental_assistant@mvdentistry.com) has reported an issue
- Impersonation is enabled for the agency account

### Step-by-Step User Journey

**Step 1**: Access Impersonation Feature
- Chris navigates to Mountain View Dentistry > Users
- Finds user "dental_assistant@mvdentistry.com"
- Clicks "Impersonate User" button
- **Expected Response**:
  - Confirmation dialog explaining impersonation
  - Reason/ticket field (required)
  - Duration selection (15 min, 30 min, 1 hour)
  - Terms acknowledgment checkbox

**Step 2**: Initiate Impersonation
- Chris enters:
  - Reason: "Support ticket #4521 - Cannot view automation history"
  - Duration: 30 minutes
  - Acknowledges: "I understand all actions will be logged"
- Clicks "Start Impersonation"
- **Expected Response**:
  - Loading indicator
  - Session created with impersonation context
  - Clear visual indicator that impersonation is active
  - Timer showing remaining duration

**Step 3**: View Platform as Client User
- Chris now sees the platform exactly as the client user sees it
- **Expected Response**:
  - Prominent banner: "Impersonating: dental_assistant@mvdentistry.com"
  - Red/orange border around viewport
  - Limited navigation (only what user has access to)
  - "End Impersonation" button always visible

**Step 4**: Diagnose the Issue
- Chris navigates to Automation History
- Sees the issue: "You do not have permission to view automation history"
- **Expected Response**:
  - Same error message user reported
  - Chris can see the exact user experience
  - Can navigate through the platform to understand context

**Step 5**: End Impersonation
- Chris clicks "End Impersonation"
- **Expected Response**:
  - Returns to Chris's normal admin view
  - Impersonation session logged
  - Summary shown: Duration, pages visited, actions taken
  - Option to add resolution notes

**Step 6**: Resolve the Issue
- Chris identifies the issue: User role missing "view_automation_history" permission
- Fixes by updating user's role permissions
- **Expected Response**:
  - Permission update successful
  - User notified of fix (optional)
  - Support ticket can be updated with resolution

**Step 7**: Verify Resolution
- Chris impersonates again to verify fix
- Now sees automation history correctly
- **Expected Response**:
  - Automation history displays
  - Issue confirmed resolved
  - Second impersonation session logged

**Step 8**: Document Impersonation Session
- Chris views the impersonation audit log
- **Expected Response**:
  - Complete record of both sessions
  - Pages visited during impersonation
  - Actions taken (view-only in this case)
  - Timestamps and duration
  - Reason and resolution notes

### Expected Outcomes
- Issue diagnosed quickly without client involvement
- Security maintained through logging and time limits
- Clear visual indicators prevent confusion
- Complete audit trail for compliance
- Resolution verified before ticket closure

### Acceptance Criteria

```gherkin
Given Chris has impersonation permission
When he initiates impersonation with valid reason
Then he sees the platform exactly as the target user
And a prominent visual indicator shows impersonation is active
And all navigation and actions are logged

Given impersonation is active
When Chris attempts a destructive action (delete, etc.)
Then the action is blocked with warning
And the attempt is logged
And option to perform as admin (end impersonation first) is shown

Given impersonation session has a 30-minute limit
When 30 minutes elapse
Then impersonation automatically ends
And Chris is returned to admin view
And notification shows session expired

Given impersonation session ends
When Chris reviews the session log
Then complete audit trail is available
And pages visited and actions taken are listed
And the log is immutable
```

### Edge Cases

1. **User Currently Active**
   - Target user is currently logged in
   - Warning shown but impersonation allowed
   - User's session not affected
   - Both sessions logged separately

2. **Impersonating User with Higher Privileges**
   - Target user has permissions Chris doesn't have
   - Those elevated permissions are NOT inherited
   - Chris sees only intersection of permissions
   - Clear indication of limited impersonation

3. **Destructive Action Attempt**
   - Chris accidentally tries to delete data
   - Action blocked with explanation
   - Must end impersonation and perform as admin
   - Attempt logged as blocked

4. **Session Timeout During Impersonation**
   - Chris's main session times out
   - Impersonation ends automatically
   - Incomplete session logged
   - Must re-authenticate to continue

5. **Multiple Concurrent Impersonations**
   - Prevented by system
   - Must end current before starting new
   - Clear error message explaining policy

### Test Data Requirements

```json
{
  "impersonator": {
    "name": "Chris Anderson",
    "email": "chris@agency.com",
    "role": "agency_support",
    "has_impersonation_permission": true
  },
  "target_user": {
    "name": "Dental Assistant",
    "email": "dental_assistant@mvdentistry.com",
    "tenant": "mountain_view_dentistry",
    "role": "client_user",
    "missing_permission": "view_automation_history"
  },
  "impersonation_session": {
    "reason": "Support ticket #4521 - Cannot view automation history",
    "duration_minutes": 30,
    "pages_to_visit": [
      "/dashboard",
      "/automations",
      "/automations/history"
    ]
  },
  "support_ticket": {
    "id": "4521",
    "subject": "Cannot view automation history",
    "reported_by": "dental_assistant@mvdentistry.com"
  }
}
```

### Priority
**P1** - Important for support efficiency

---

## UXS-005-10: Tenant Suspension and Reactivation

### Story ID
UXS-005-10

### Title
Suspend and Reactivate Client Sub-Account

### Persona
**Amanda Foster** - Agency Finance Director
- 42 years old, manages agency financial operations
- Handles payment issues and account status
- Needs to suspend accounts for non-payment
- Must be able to reactivate after payment received

### Scenario
Amanda needs to suspend "Quick Loans Inc" sub-account due to 60 days of non-payment, then reactivate it after the client resolves their billing issue. The suspension must prevent access while preserving all data.

### User Goal
Suspend a sub-account to prevent access while preserving data, then reactivate it when appropriate, with clear communication throughout.

### Preconditions
- Amanda has Agency Admin role with account management permissions
- "Quick Loans Inc" sub-account exists with active users
- Account has unpaid invoices for 60+ days
- Communication templates are configured

### Step-by-Step User Journey

**Step 1**: Navigate to Account Management
- Amanda goes to Sub-Accounts > Quick Loans Inc > Account Status
- **Expected Response**: Account management page showing:
  - Current status: Active
  - Account health indicators
  - Billing status: Overdue (60 days)
  - User count: 5 active users
  - Last activity timestamp

**Step 2**: Initiate Account Suspension
- Amanda clicks "Suspend Account"
- **Expected Response**: Suspension dialog with:
  - Reason selection (Non-payment, Violation, Request, Other)
  - Effective date (Immediate or scheduled)
  - Notification options (Users, Admin only, None)
  - Data retention confirmation
  - Grace period option (hours to finalize work)

**Step 3**: Configure Suspension Details
- Amanda selects:
  - Reason: "Non-payment - 60 days overdue"
  - Effective: 24 hours (grace period)
  - Notify: All users
  - Custom message: "Account suspended due to overdue payment. Please contact billing."
- **Expected Response**:
  - Preview of notification email
  - Summary of suspension impact
  - Confirmation checkbox for irreversible actions
  - "Confirm Suspension" button

**Step 4**: Confirm Suspension
- Amanda confirms the suspension
- **Expected Response**:
  - Success message with effective time
  - Notification sent to all account users
  - Audit log entry created
  - Account status changed to "Pending Suspension"
  - Countdown to suspension shown

**Step 5**: Verify Suspended State (After Grace Period)
- Amanda checks account status after 24 hours
- **Expected Response**:
  - Status: Suspended
  - All users cannot log in (see suspension message)
  - Automations are paused
  - Data is preserved but inaccessible
  - API access returns 403 with suspension message

**Step 6**: Receive Payment and Initiate Reactivation
- Amanda receives notification that payment is received
- Navigates to suspended account
- Clicks "Reactivate Account"
- **Expected Response**: Reactivation dialog with:
  - Reason for reactivation
  - Effective date (Immediate or scheduled)
  - Notification options
  - Data integrity verification status

**Step 7**: Confirm Reactivation
- Amanda selects:
  - Reason: "Payment received"
  - Effective: Immediate
  - Notify: All users
  - Custom message: "Account reactivated. Thank you for your payment."
- Confirms reactivation
- **Expected Response**:
  - Account status: Active
  - All users can log in immediately
  - Paused automations resume
  - Notification sent to users
  - Audit log updated

**Step 8**: Verify Reactivated State
- Amanda verifies account is fully operational
- **Expected Response**:
  - All features accessible
  - Data intact
  - Automation history preserved
  - Users report successful access

### Expected Outcomes
- Account properly suspended with preserved data
- Users clearly notified of suspension and reactivation
- Grace period allows orderly suspension
- All data intact after reactivation
- Complete audit trail maintained

### Acceptance Criteria

```gherkin
Given Amanda has account management permission
When she suspends an account with 24-hour grace period
Then the account status changes to "Pending Suspension"
And users receive notification with grace period warning
And account becomes fully suspended after 24 hours

Given an account is suspended
When a user attempts to log in
Then they see a suspension message
And they cannot access any account features
And API requests return 403 Forbidden

Given a suspended account
When Amanda reactivates it
Then users can immediately log in
And all data is accessible
And paused automations resume
And users are notified of reactivation

Given an account has been suspended and reactivated
When reviewing audit logs
Then complete suspension and reactivation history is visible
And reasons and actors are documented
```

### Edge Cases

1. **Active Automation During Suspension**
   - Automation is running when suspension takes effect
   - Current execution completes
   - No new executions start
   - Partial results preserved

2. **Scheduled Suspension During Off-Hours**
   - Suspension scheduled for midnight
   - System executes automatically
   - Notifications sent despite off-hours
   - Dashboard shows scheduled status

3. **Immediate Suspension Request**
   - No grace period selected
   - Warning about active sessions
   - Immediate logout of all users
   - In-progress work may be lost

4. **Suspension During API Integration**
   - Third-party integration fails with suspension
   - Integration receives clear error message
   - Webhook notifications paused
   - Integration guide for handling suspension

5. **Partial Reactivation Request**
   - Client wants limited access during payment dispute
   - Read-only mode option available
   - Clear limitations communicated
   - Full reactivation after resolution

### Test Data Requirements

```json
{
  "subaccount": {
    "id": "tenant_quick_loans",
    "name": "Quick Loans Inc",
    "status": "active",
    "users": [
      {"email": "admin@quickloans.com", "role": "client_admin"},
      {"email": "user1@quickloans.com", "role": "client_user"},
      {"email": "user2@quickloans.com", "role": "client_user"}
    ],
    "billing": {
      "status": "overdue",
      "days_overdue": 60,
      "amount_due": 2997.00
    }
  },
  "suspension_config": {
    "reason": "Non-payment - 60 days overdue",
    "grace_period_hours": 24,
    "notify_users": true,
    "custom_message": "Account suspended due to overdue payment."
  },
  "reactivation_config": {
    "reason": "Payment received",
    "effective": "immediate",
    "notify_users": true,
    "custom_message": "Account reactivated. Thank you for your payment."
  },
  "expected_states": {
    "pending_suspension": {
      "user_login": "allowed with warning",
      "automations": "running",
      "api_access": "allowed"
    },
    "suspended": {
      "user_login": "blocked",
      "automations": "paused",
      "api_access": "403 forbidden"
    },
    "active": {
      "user_login": "allowed",
      "automations": "running",
      "api_access": "allowed"
    }
  }
}
```

### Priority
**P0** - Critical for account lifecycle management

---

## Summary

| Story ID | Title | Persona | Priority |
|----------|-------|---------|----------|
| UXS-005-01 | Sub-Account Creation and Provisioning | Sarah Chen (Agency Owner) | P0 |
| UXS-005-02 | Agency Onboarding New Client | David Martinez (Account Manager) | P0 |
| UXS-005-03 | Tenant Data Isolation Verification | Alex Kim (Security Auditor) | P0 |
| UXS-005-04 | Permission Hierarchy Management | Rachel Torres (Operations Director) | P0 |
| UXS-005-05 | White-Label Branding Configuration | Jennifer Walsh (Brand Manager) | P1 |
| UXS-005-06 | Cross-Tenant Analytics for Agency Owners | Michael Chen (Agency CEO) | P1 |
| UXS-005-07 | Audit Log Viewing Per Tenant | Diana Roberts (Compliance Officer) | P1 |
| UXS-005-08 | Sub-Account Resource Limits and Usage | Kevin Park (Operations Manager) | P0 |
| UXS-005-09 | Multi-Tenant User Impersonation | Chris Anderson (Support Lead) | P1 |
| UXS-005-10 | Tenant Suspension and Reactivation | Amanda Foster (Finance Director) | P0 |

---

## Test Coverage Matrix

| Feature Area | Stories | Priority Coverage |
|--------------|---------|-------------------|
| Account Lifecycle | UXS-005-01, UXS-005-02, UXS-005-10 | P0: 3 |
| Security & Isolation | UXS-005-03, UXS-005-04 | P0: 2 |
| Resource Management | UXS-005-08 | P0: 1 |
| Analytics & Reporting | UXS-005-06, UXS-005-07 | P1: 2 |
| Customization | UXS-005-05 | P1: 1 |
| Support Operations | UXS-005-09 | P1: 1 |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | QA Team | Initial document creation |

---

## Appendix: Glossary

- **Tenant**: A single client organization/sub-account in the multi-tenant system
- **Sub-Account**: A client workspace managed by an agency
- **RLS**: Row-Level Security - Database security feature ensuring data isolation
- **White-Label**: Custom branding that removes/replaces the platform's default branding
- **Impersonation**: Temporarily viewing the platform as another user for support purposes
- **Grace Period**: Time allowed before a suspension takes full effect
