# UXS-015: Developer API & Marketplace - User Experience Stories

**Document Version:** 1.0
**Created:** 2026-01-11
**Feature Area:** Developer API & Marketplace
**Total Stories:** 10

---

## Table of Contents

1. [UXS-015-01: API Key Generation and Management](#uxs-015-01-api-key-generation-and-management)
2. [UXS-015-02: API Documentation Browsing](#uxs-015-02-api-documentation-browsing)
3. [UXS-015-03: Webhook Configuration and Testing](#uxs-015-03-webhook-configuration-and-testing)
4. [UXS-015-04: Marketplace Template Browsing](#uxs-015-04-marketplace-template-browsing)
5. [UXS-015-05: Template Installation and Customization](#uxs-015-05-template-installation-and-customization)
6. [UXS-015-06: Code Snippet Generation](#uxs-015-06-code-snippet-generation)
7. [UXS-015-07: API Usage Monitoring](#uxs-015-07-api-usage-monitoring)
8. [UXS-015-08: Publishing to Marketplace](#uxs-015-08-publishing-to-marketplace)
9. [UXS-015-09: Webhook Event History and Debugging](#uxs-015-09-webhook-event-history-and-debugging)
10. [UXS-015-10: API Rate Limiting and Quota Management](#uxs-015-10-api-rate-limiting-and-quota-management)

---

## UXS-015-01: API Key Generation and Management

### Story ID
UXS-015-01

### Title
API Key Generation and Management

### Persona
**Dr. Michael Chen** - Lead Developer at a SaaS company that builds custom integrations. He needs to programmatically access Bottleneck-Bots to automate client workflows. He manages API credentials for multiple projects and requires secure, auditable key management with granular permission controls.

### Scenario
Michael is building a custom integration between his company's CRM platform and Bottleneck-Bots. He needs to generate a new API key with specific scopes (read contacts, trigger automations) for the production environment. He also needs to set up key rotation policies and ensure the key has an appropriate expiration date for compliance purposes.

### User Goal
Generate and manage API keys with appropriate scopes, expiration policies, and security controls to enable secure programmatic access to the Bottleneck-Bots platform.

### Preconditions
- User is authenticated with developer or admin access level
- User's subscription tier includes API access (Pro tier or above)
- API access has been enabled for the organization
- User has access to the Developer Settings section

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | User navigates to Settings > Developer > API Keys | API Keys management page loads showing existing keys (if any) |
| 2 | User clicks "Generate New API Key" button | Key creation wizard opens with configuration options |
| 3 | User enters key name: "CRM Integration - Production" | Name field accepts input with character counter |
| 4 | User selects key type: "Server-side" (vs "Client-side") | Additional security options appear based on type selection |
| 5 | User configures scopes by checking permissions: "contacts:read", "automations:execute", "webhooks:manage" | Scope descriptions show inline; dependency warnings appear if needed |
| 6 | User sets expiration: "1 year" from dropdown | Expiration date calculates and displays (Jan 11, 2027) |
| 7 | User optionally adds IP allowlist: "192.168.1.0/24, 10.0.0.5" | IP addresses validated; format errors shown inline |
| 8 | User clicks "Generate Key" | System generates key with loading indicator |
| 9 | Key is displayed in modal: "bb_live_abc123..." with copy button | Key shown once with warning: "This key will not be shown again" |
| 10 | User copies key and clicks "I've saved this key" | Modal closes; new key appears in list with masked value |
| 11 | User views key in list with status "Active", scopes, and last used info | Key card shows: name, partial key, scopes, created date, last used |

### Expected Outcomes
- API key is generated with cryptographically secure random value
- Key is stored securely with only a hash retained after initial display
- Scopes are enforced at runtime for all API requests
- Key appears in management list with relevant metadata
- Audit log records key creation with user identity

### Acceptance Criteria

```gherkin
Given Michael is on the API Keys management page
When he clicks "Generate New API Key"
Then a key creation wizard should appear with the following options:
  | Field           | Options/Constraints                           |
  | Key Name        | Required, 3-100 characters                    |
  | Key Type        | Server-side, Client-side                      |
  | Scopes          | Multi-select from available permissions       |
  | Expiration      | 30 days, 90 days, 1 year, Never, Custom       |
  | IP Allowlist    | Optional, comma-separated CIDR or IPs         |

Given Michael has configured key settings
When he clicks "Generate Key"
Then the system should:
  - Generate a unique key with prefix "bb_live_" (production) or "bb_test_" (sandbox)
  - Display the full key exactly once
  - Require acknowledgment before hiding the key
  - Store only a secure hash of the key

Given Michael has generated multiple API keys
When he views the API Keys list
Then each key should display:
  - Key name
  - Masked key value (showing last 4 characters)
  - Active/Revoked status
  - Scope badges
  - Created timestamp
  - Last used timestamp
  - Expiration date

Given an API key exists
When Michael clicks "Revoke" on the key
Then a confirmation modal should appear
And upon confirmation, the key should be immediately invalidated
And the key should show "Revoked" status with revocation timestamp
```

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| User attempts to generate key without selecting any scopes | Validation error: "At least one scope must be selected" |
| User enters invalid IP in allowlist (e.g., "999.999.999.999") | Inline validation error with correct format example |
| User tries to copy key after closing the modal | Error: "Key can only be viewed once. Generate a new key if needed." |
| Key reaches expiration date | Key automatically invalidated; notification sent 7 days prior |
| User attempts to exceed maximum key limit (10 per account) | Error: "Maximum API keys reached. Revoke an existing key to create a new one." |
| User navigates away during key generation | Generation continues; key shown when user returns (if within session) |

### Test Data Requirements

```yaml
api_key_configurations:
  - name: "Test Integration - Development"
    type: "server_side"
    scopes: ["contacts:read", "contacts:write"]
    expiration: "90_days"
    ip_allowlist: []

  - name: "Production CRM Sync"
    type: "server_side"
    scopes: ["contacts:read", "automations:execute", "webhooks:manage"]
    expiration: "1_year"
    ip_allowlist: ["10.0.0.0/8"]

  - name: "Client Widget"
    type: "client_side"
    scopes: ["public:read"]
    expiration: "never"
    ip_allowlist: []

available_scopes:
  - scope: "contacts:read"
    description: "Read contact information"
  - scope: "contacts:write"
    description: "Create and update contacts"
  - scope: "automations:read"
    description: "View automation configurations"
  - scope: "automations:execute"
    description: "Trigger automation executions"
  - scope: "webhooks:manage"
    description: "Create and manage webhooks"
  - scope: "analytics:read"
    description: "Access analytics and reports"
  - scope: "public:read"
    description: "Read-only public data (client-side safe)"

test_scenarios:
  - existing_keys: 0
  - existing_keys: 5
  - existing_keys: 10 (max limit)
```

### Priority
**P0** - Critical for developer integrations and API access

---

## UXS-015-02: API Documentation Browsing

### Story ID
UXS-015-02

### Title
API Documentation Browsing and Interactive Explorer

### Persona
**Sarah Martinez** - Full-stack Developer at a digital marketing agency. She's new to the Bottleneck-Bots API and needs to understand available endpoints, authentication methods, and request/response formats. She prefers interactive documentation where she can test API calls directly.

### Scenario
Sarah has been assigned to build an integration that syncs lead data from Bottleneck-Bots to their internal dashboard. She needs to explore the API documentation to understand the contacts endpoints, authentication requirements, and how to handle pagination. She wants to make test calls directly from the documentation to verify her understanding.

### User Goal
Browse comprehensive API documentation with interactive examples, test endpoints directly, and understand authentication, rate limits, and best practices.

### Preconditions
- User is authenticated (for interactive features)
- API documentation portal is accessible
- User has at least one API key generated (for testing)

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | User navigates to Developer > API Documentation | Documentation portal loads with navigation sidebar |
| 2 | User views the Getting Started section | Overview displays: authentication, base URL, response formats |
| 3 | User clicks on "Authentication" in sidebar | Authentication section shows API key header format and examples |
| 4 | User navigates to "Endpoints" > "Contacts" | Contacts API section expands showing available endpoints |
| 5 | User clicks on "GET /api/v1/contacts" endpoint | Endpoint detail panel opens with parameters, response schema |
| 6 | User reviews query parameters: limit, offset, search, filters | Parameters table shows types, required/optional, descriptions |
| 7 | User clicks "Try It" button to test endpoint | Interactive console opens with pre-filled request |
| 8 | User selects API key from dropdown for authentication | Key is applied; masked value shown for security |
| 9 | User modifies parameters: limit=10, search="john" | Request preview updates in real-time |
| 10 | User clicks "Send Request" | Request executes; response displays with status, headers, body |
| 11 | User copies response or request as cURL command | Code snippet copied to clipboard |
| 12 | User clicks "View Code Samples" tab | Code examples shown in Python, JavaScript, cURL, PHP |

### Expected Outcomes
- Documentation is comprehensive and up-to-date with current API
- Interactive explorer allows testing without leaving documentation
- Code samples are accurate and copy-pasteable
- Authentication is clearly explained with examples
- Rate limits and best practices are documented

### Acceptance Criteria

```gherkin
Given Sarah is on the API Documentation page
When she views the navigation sidebar
Then she should see organized sections:
  | Section          | Contents                                        |
  | Getting Started  | Overview, Authentication, Base URLs, Versioning |
  | Endpoints        | Contacts, Automations, Tasks, Webhooks, etc.    |
  | Guides           | Pagination, Error Handling, Webhooks            |
  | SDKs             | JavaScript, Python, PHP libraries               |
  | Changelog        | Version history and breaking changes            |

Given Sarah is viewing an endpoint
When she examines the endpoint documentation
Then she should see:
  - HTTP method and path (e.g., GET /api/v1/contacts)
  - Description of the endpoint's purpose
  - Authentication requirements
  - Request parameters table (query, path, body)
  - Response schema with field descriptions
  - Example request and response
  - Error codes specific to this endpoint

Given Sarah clicks "Try It" on an endpoint
When the interactive console opens
Then she should be able to:
  - Select an API key from her available keys
  - Input all required and optional parameters
  - See the request preview update in real-time
  - Send the request and view the response
  - Copy the request as cURL, JavaScript, or Python

Given Sarah sends a test request
When the response is received
Then the console should display:
  - HTTP status code with color indicator (green=2xx, red=4xx/5xx)
  - Response headers (expandable)
  - Response body with syntax highlighting
  - Response time in milliseconds
  - Option to format/beautify JSON response
```

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| User has no API keys for testing | Show message: "Generate an API key to test endpoints" with link |
| API request fails due to invalid key | Display error response with helpful troubleshooting message |
| Request times out (>30 seconds) | Show timeout error with retry option |
| Endpoint requires specific scopes user's key lacks | Warning before sending: "Your key may lack required scopes" |
| Documentation page accessed without authentication | Read-only mode; "Try It" disabled with login prompt |
| User searches for non-existent endpoint | Search results show "No endpoints found" with suggestions |

### Test Data Requirements

```yaml
documentation_structure:
  sections:
    - getting_started:
        - overview
        - authentication
        - base_urls
        - versioning
        - rate_limits
    - endpoints:
        - contacts
        - automations
        - tasks
        - webhooks
        - analytics
    - guides:
        - pagination
        - error_handling
        - webhooks
        - best_practices

sample_endpoints:
  - method: "GET"
    path: "/api/v1/contacts"
    description: "List all contacts with optional filtering"
    parameters:
      - name: "limit"
        type: "integer"
        required: false
        default: 20
        description: "Number of results per page (max 100)"
      - name: "offset"
        type: "integer"
        required: false
        default: 0
        description: "Pagination offset"
      - name: "search"
        type: "string"
        required: false
        description: "Search contacts by name or email"

  - method: "POST"
    path: "/api/v1/automations/{id}/execute"
    description: "Trigger an automation execution"
    parameters:
      - name: "id"
        in: "path"
        type: "string"
        required: true
        description: "Automation ID"
      - name: "input"
        in: "body"
        type: "object"
        required: false
        description: "Input data for the automation"

code_samples:
  languages: ["curl", "javascript", "python", "php", "ruby"]
```

### Priority
**P0** - Critical for developer onboarding and API adoption

---

## UXS-015-03: Webhook Configuration and Testing

### Story ID
UXS-015-03

### Title
Webhook Configuration and Testing

### Persona
**James Wilson** - Backend Engineer responsible for building event-driven integrations. He needs to configure webhooks to receive real-time notifications when specific events occur in Bottleneck-Bots (e.g., automation completed, contact updated). He requires the ability to test webhooks before deploying to production.

### Scenario
James is setting up a webhook to notify his company's internal system whenever an automation completes. He needs to configure the webhook URL, select which events to subscribe to, set up authentication (secret header), and test the webhook to ensure his endpoint receives and processes events correctly.

### User Goal
Configure webhooks with specific event subscriptions, secure authentication, and verify correct delivery through testing tools before deploying to production.

### Preconditions
- User is authenticated with developer access
- User's subscription includes webhook functionality
- User has a target endpoint URL ready to receive webhooks
- User is on the Developer > Webhooks page

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | User navigates to Developer > Webhooks | Webhooks management page loads showing existing webhooks |
| 2 | User clicks "Create Webhook" button | Webhook creation form opens |
| 3 | User enters endpoint URL: "https://api.mycompany.com/webhooks/bb" | URL validated for format and HTTPS requirement |
| 4 | User enters webhook name: "Automation Complete Handler" | Name field accepts input |
| 5 | User selects events to subscribe to from checklist | Events grouped by category: Automations, Contacts, Tasks |
| 6 | User checks: "automation.completed", "automation.failed" | Selected events highlighted with descriptions |
| 7 | User expands "Security Settings" section | Security options appear |
| 8 | User enters secret key for HMAC signature: "my-webhook-secret" | Secret masked; signature algorithm shown (HMAC-SHA256) |
| 9 | User optionally adds custom headers: "X-Custom-App: bottleneck-bots" | Custom headers table allows key-value pairs |
| 10 | User clicks "Create Webhook" | Webhook created; success message displayed |
| 11 | User clicks "Test Webhook" button on new webhook | Test modal opens with sample payload selector |
| 12 | User selects "automation.completed" event for testing | Sample payload pre-populated based on event type |
| 13 | User clicks "Send Test Event" | Test request sent to endpoint |
| 14 | System displays test result: "200 OK - Delivered successfully" | Response details shown: status, latency, response body preview |

### Expected Outcomes
- Webhook is created with specified configuration
- Events are correctly subscribed and filtered
- HMAC signature is computed and sent with each webhook
- Test functionality verifies endpoint connectivity
- Webhook appears in management list with status

### Acceptance Criteria

```gherkin
Given James is creating a new webhook
When he configures the webhook settings
Then he should be able to specify:
  | Setting          | Description                                    |
  | Endpoint URL     | HTTPS URL to receive webhook events            |
  | Name             | Friendly name for identification               |
  | Events           | Multi-select from available event types        |
  | Secret           | Shared secret for HMAC signature verification  |
  | Custom Headers   | Optional key-value headers to include          |
  | Retry Policy     | Max retries and backoff strategy               |

Given James has selected events
When he views the event list
Then events should be organized by category:
  | Category     | Events                                          |
  | Automations  | automation.started, automation.completed, automation.failed |
  | Contacts     | contact.created, contact.updated, contact.deleted |
  | Tasks        | task.created, task.completed, task.failed       |
  | Leads        | lead.enriched, lead.exported                    |

Given James tests a webhook
When he clicks "Send Test Event"
Then the system should:
  - Send a properly formatted webhook payload
  - Include HMAC signature header (X-Signature-256)
  - Include custom headers if configured
  - Display response status code
  - Show response latency
  - Display response body (truncated if large)
  - Indicate success or failure with actionable error info

Given a webhook is created
When events occur that match subscription
Then the webhook should:
  - Receive POST request within 5 seconds
  - Include event type in header (X-Event-Type)
  - Include delivery ID for idempotency (X-Delivery-ID)
  - Include timestamp (X-Timestamp)
  - Include HMAC signature if secret configured
  - Retry on failure according to retry policy
```

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Endpoint URL uses HTTP instead of HTTPS | Validation error: "Webhook URLs must use HTTPS for security" |
| User enters invalid URL format | Inline validation error with correct format example |
| Test webhook endpoint is unreachable | Error displayed: "Connection failed. Verify URL is accessible." |
| Test returns non-2xx status code | Warning: "Endpoint returned [status]. Verify endpoint logic." |
| Secret key is too short (< 16 chars) | Warning: "Consider using a longer secret for better security" |
| Maximum webhook limit reached (20) | Error: "Maximum webhooks reached. Delete unused webhooks." |

### Test Data Requirements

```yaml
webhook_configurations:
  - name: "Automation Complete Handler"
    url: "https://api.example.com/webhooks/automation"
    events: ["automation.completed", "automation.failed"]
    secret: "test-secret-key-123456"
    custom_headers:
      X-Source: "bottleneck-bots"
    retry_policy:
      max_retries: 3
      backoff: "exponential"

  - name: "Contact Sync Webhook"
    url: "https://api.example.com/webhooks/contacts"
    events: ["contact.created", "contact.updated", "contact.deleted"]
    secret: "contact-webhook-secret"
    custom_headers: {}

available_events:
  automations:
    - event: "automation.started"
      description: "Fired when an automation begins execution"
    - event: "automation.completed"
      description: "Fired when an automation completes successfully"
    - event: "automation.failed"
      description: "Fired when an automation fails"
  contacts:
    - event: "contact.created"
      description: "Fired when a new contact is created"
    - event: "contact.updated"
      description: "Fired when contact information is updated"
    - event: "contact.deleted"
      description: "Fired when a contact is deleted"

test_payloads:
  automation.completed:
    event: "automation.completed"
    timestamp: "2026-01-11T10:30:00Z"
    data:
      automation_id: "auto_123abc"
      automation_name: "Daily Report Generator"
      execution_id: "exec_456def"
      duration_ms: 45000
      status: "completed"
      output:
        records_processed: 150
```

### Priority
**P0** - Critical for event-driven integrations

---

## UXS-015-04: Marketplace Template Browsing

### Story ID
UXS-015-04

### Title
Marketplace Template Browsing and Discovery

### Persona
**Amanda Torres** - Marketing Operations Manager at a mid-size agency. She's looking for pre-built automation templates to accelerate her team's workflow setup. She doesn't have deep technical skills but can customize templates for her specific needs. She values templates with good reviews and documentation.

### Scenario
Amanda wants to find an automation template for lead nurturing sequences. She browses the marketplace to discover available templates, compare features, read reviews, and evaluate whether a template meets her requirements before installing it.

### User Goal
Discover, evaluate, and compare automation templates in the marketplace to find solutions that match business requirements without building from scratch.

### Preconditions
- User is authenticated with any subscription tier
- Marketplace is accessible
- Templates exist in various categories
- User is on the Marketplace page

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | User navigates to Marketplace from main navigation | Marketplace homepage loads with featured templates and categories |
| 2 | User views featured section showing "Editor's Picks" and "Most Popular" | Carousel displays top templates with thumbnails and ratings |
| 3 | User clicks on "Categories" and selects "Lead Generation" | Category page loads with filtered templates |
| 4 | User applies additional filter: "Rating 4+ stars" | List updates showing 12 matching templates |
| 5 | User applies sort: "Most Installs" | Templates reorder by popularity |
| 6 | User clicks on template card: "Lead Nurturing Pro" | Template detail page opens |
| 7 | User views template overview: description, screenshots, video demo | Rich media content displays in organized sections |
| 8 | User scrolls to see: Creator info, version history, requirements | Creator badge shows "Verified Partner" status |
| 9 | User reads reviews section: 4.7 stars from 230 reviews | Reviews sorted by helpfulness with filter options |
| 10 | User expands "What's Included" section | List shows: automations, workflows, email templates |
| 11 | User views "Requirements" section | Dependencies shown: GHL integration, Pro tier |
| 12 | User clicks "Preview Demo" button | Interactive preview or walkthrough opens in modal |
| 13 | User adds template to "Wishlist" for later | Heart icon fills; template saved to wishlist |

### Expected Outcomes
- Marketplace displays diverse templates organized by category
- Search and filtering enable efficient discovery
- Template details provide comprehensive evaluation information
- Reviews and ratings help quality assessment
- Preview functionality allows evaluation before installation

### Acceptance Criteria

```gherkin
Given Amanda is on the Marketplace homepage
When the page loads
Then she should see:
  | Section              | Content                                    |
  | Featured Banner      | Promotional content or new releases        |
  | Editor's Picks       | Curated high-quality templates             |
  | Most Popular         | Top templates by install count             |
  | Categories           | Visual category grid with icons            |
  | Recent Additions     | Newly published templates                  |
  | Search Bar           | Prominent search with autocomplete         |

Given Amanda is browsing templates
When she applies filters
Then she should be able to filter by:
  - Category (Lead Generation, Reporting, etc.)
  - Rating (4+ stars, 3+ stars)
  - Price (Free, Paid, Subscription)
  - Creator type (Official, Verified Partner, Community)
  - Compatibility (GHL, Meta Ads, etc.)

Given Amanda views a template detail page
When the page loads
Then she should see:
  - Template name and tagline
  - Creator name with verification badge
  - Average rating and review count
  - Install count
  - Price (Free or amount)
  - Screenshots/video gallery
  - Full description with features
  - What's included (components list)
  - Requirements and compatibility
  - Version history
  - Reviews section
  - Related templates

Given Amanda reads reviews
When she views the reviews section
Then she should be able to:
  - See overall rating breakdown (5-star distribution)
  - Filter reviews by rating
  - Sort by helpfulness, recent, or rating
  - Mark reviews as helpful
  - Report inappropriate reviews
```

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Search returns no results | Show "No templates found" with suggestions and browse categories link |
| Template has no reviews yet | Display "Be the first to review" prompt with star rating |
| Template is incompatible with user's tier | Show compatibility warning but allow viewing details |
| Template requires integration user hasn't connected | Requirements section highlights missing integration |
| Template has been deprecated | Show "Deprecated" badge with link to replacement |
| User has already installed the template | Show "Installed" badge instead of Install button |

### Test Data Requirements

```yaml
marketplace_categories:
  - name: "Lead Generation"
    icon: "users"
    template_count: 45
  - name: "Reporting & Analytics"
    icon: "chart"
    template_count: 32
  - name: "Email Marketing"
    icon: "mail"
    template_count: 28
  - name: "Social Media"
    icon: "share"
    template_count: 21
  - name: "CRM Integration"
    icon: "database"
    template_count: 19
  - name: "Data Extraction"
    icon: "download"
    template_count: 15

sample_templates:
  - name: "Lead Nurturing Pro"
    category: "Lead Generation"
    creator: "Bottleneck Official"
    verified: true
    rating: 4.7
    reviews: 230
    installs: 5420
    price: "free"
    description: "Comprehensive lead nurturing automation with multi-touch sequences"
    includes:
      - "5 email templates"
      - "3 automation workflows"
      - "Lead scoring model"
      - "Dashboard template"
    requirements:
      - "Pro tier or above"
      - "GHL integration"

  - name: "Social Media Report Generator"
    category: "Reporting & Analytics"
    creator: "MarketingPro Agency"
    verified: true
    rating: 4.3
    reviews: 87
    installs: 1250
    price: 29.99
    description: "Automated weekly social media performance reports"

filter_options:
  ratings: [4, 3, 2, 1]
  prices: ["free", "under_25", "25_to_50", "over_50"]
  creator_types: ["official", "verified_partner", "community"]
```

### Priority
**P1** - Important for template discovery and marketplace engagement

---

## UXS-015-05: Template Installation and Customization

### Story ID
UXS-015-05

### Title
Template Installation and Customization

### Persona
**David Kim** - Digital Marketing Specialist who found a lead nurturing template in the marketplace. He needs to install it into his workspace, customize it for his specific client, and configure the required integrations. He has moderate technical skills and can follow setup guides.

### Scenario
David has selected "Lead Nurturing Pro" template and wants to install it. The template requires GHL integration and includes customizable email templates. He needs to complete the installation wizard, connect required integrations, customize template variables, and verify the installation works correctly.

### User Goal
Install a marketplace template into the workspace, complete required configuration, customize template elements for specific use case, and verify successful installation.

### Preconditions
- User has selected a template from the marketplace
- User's subscription tier meets template requirements
- User has necessary integrations available (or can set them up)
- User is on the template detail page

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | User clicks "Install Template" button on template page | Installation wizard opens with step indicator |
| 2 | Step 1 - Requirements Check: System verifies prerequisites | Checklist shows: Subscription tier (Pass), GHL Integration (Needs Setup) |
| 3 | User clicks "Connect GHL" for missing integration | OAuth flow opens in modal; user authenticates |
| 4 | User returns after GHL connection | Checklist updates: GHL Integration (Pass) |
| 5 | User clicks "Continue" to Step 2 - Customization | Template customization form appears |
| 6 | User enters client-specific values: Company Name, Industry, Target Audience | Form fields pre-filled with placeholders; user replaces |
| 7 | User customizes email templates: edits subject lines, body content | Rich text editor opens for each email template |
| 8 | User uploads client logo for email templates | Image uploader accepts file; preview updates |
| 9 | User clicks "Continue" to Step 3 - Configuration | Configuration options for automations appear |
| 10 | User sets schedule: "Send sequence starting Monday 9 AM EST" | Schedule selector with timezone dropdown |
| 11 | User maps data fields: "Contact Email" -> GHL email field | Field mapping interface with dropdowns |
| 12 | User clicks "Continue" to Step 4 - Review | Summary of all configurations displayed |
| 13 | User reviews installation summary and clicks "Complete Installation" | Progress bar shows installation steps |
| 14 | Installation completes successfully | Success screen with "View Template" and "Test Automation" buttons |

### Expected Outcomes
- Template components installed into user's workspace
- Required integrations connected and configured
- Custom values applied to template elements
- Template ready for use or testing
- Original template remains unchanged (user has their own copy)

### Acceptance Criteria

```gherkin
Given David clicks "Install Template"
When the installation wizard opens
Then Step 1 should verify:
  - Subscription tier compatibility
  - Required integrations status
  - Storage/resource availability
  - Conflicting template detection

Given David is on the customization step
When he views customizable fields
Then he should be able to modify:
  | Element Type      | Customization Options                      |
  | Variables         | Company name, industry, custom text        |
  | Email Templates   | Subject, body, images, links               |
  | Automation Flows  | Trigger conditions, delays, actions        |
  | Schedules         | Time, timezone, frequency                  |
  | Data Mappings     | Field mappings to integrations             |

Given David completes the installation wizard
When installation finishes
Then the system should:
  - Create copies of all template components
  - Apply custom values to the copies
  - Register automations in user's workspace
  - Not modify the original marketplace template
  - Generate unique IDs for installed components

Given the template is installed
When David views his workspace
Then he should see:
  - New automations from template in "Automations" section
  - New email templates in "Templates" section
  - Installation metadata showing source template
  - "Customize" option to modify post-installation
```

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| User cancels installation mid-wizard | Prompt to save progress; allow resume later |
| Required integration OAuth fails | Show error with retry option; don't block wizard |
| Template update available after installation | Notification offering to review changes and update |
| Installation conflicts with existing automation names | Auto-suffix with number or prompt for rename |
| Template requires paid add-on user doesn't have | Show pricing and purchase option inline |
| Installation fails partway through | Rollback partial installation; show error details |

### Test Data Requirements

```yaml
installation_scenarios:
  - template: "Lead Nurturing Pro"
    tier_required: "pro"
    integrations_required: ["ghl"]
    customizable_fields:
      - field: "company_name"
        type: "text"
        default: "{{Company Name}}"
      - field: "target_audience"
        type: "dropdown"
        options: ["B2B", "B2C", "Both"]
      - field: "logo"
        type: "image"
        max_size: "2MB"
    email_templates:
      - name: "Welcome Email"
        customizable: ["subject", "body", "hero_image"]
      - name: "Follow-up 1"
        customizable: ["subject", "body"]
    automations:
      - name: "Lead Nurture Sequence"
        triggers: ["contact.created"]
        configurable: ["delay_between_emails", "max_emails"]

integration_oauth_flows:
  - integration: "ghl"
    oauth_url: "https://marketplace.gohighlevel.com/oauth/..."
    scopes: ["contacts.read", "contacts.write", "campaigns.read"]

conflict_scenarios:
  - existing_automation: "Lead Nurture v1"
    template_automation: "Lead Nurture Sequence"
    resolution: "rename_with_suffix"
```

### Priority
**P0** - Critical for marketplace value and template adoption

---

## UXS-015-06: Code Snippet Generation

### Story ID
UXS-015-06

### Title
Code Snippet Generation for API Integration

### Persona
**Elena Rodriguez** - Junior Developer implementing her first Bottleneck-Bots integration. She understands programming basics but isn't familiar with the specific API. She needs ready-to-use code snippets that she can copy, paste, and modify for her application.

### Scenario
Elena is building a Node.js application that needs to fetch contacts from Bottleneck-Bots and trigger an automation. She wants to generate code snippets in JavaScript that handle authentication, make the API calls, and properly handle errors. She also needs to see how to verify webhook signatures.

### User Goal
Generate accurate, production-ready code snippets in preferred programming language that demonstrate API usage patterns for common integration scenarios.

### Preconditions
- User is viewing API documentation or has selected an endpoint
- User has an API key available (for personalized snippets)
- Code generator tool is accessible
- User has selected or can select a programming language

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | User navigates to Developer > Code Generator | Code generator interface loads with options |
| 2 | User selects programming language: "JavaScript (Node.js)" | Interface adjusts to show JS-specific options |
| 3 | User selects use case: "Fetch Contacts with Pagination" | Code template selection appears |
| 4 | User configures options: include error handling, include types | Checkboxes toggle code generation settings |
| 5 | User optionally selects their API key for personalization | Key dropdown shows available keys (masked) |
| 6 | User clicks "Generate Code" | Code snippet generates in preview panel |
| 7 | User views generated code with syntax highlighting | Code displays with line numbers; key placeholder or actual key |
| 8 | User clicks "Copy Code" button | Code copied to clipboard; toast confirmation |
| 9 | User clicks "Download as File" | File downloads: "bottleneck-contacts.js" |
| 10 | User toggles "Show cURL equivalent" | cURL command displays below for comparison |
| 11 | User selects different language: "Python" | Code regenerates in Python syntax |
| 12 | User browses other snippets: "Webhook Signature Verification" | New snippet with HMAC verification code |

### Expected Outcomes
- Code snippets are accurate and functional
- Multiple languages supported with idiomatic code
- Error handling and best practices included
- Code is customizable based on user preferences
- Snippets can be copied or downloaded easily

### Acceptance Criteria

```gherkin
Given Elena is using the code generator
When she selects a programming language
Then she should see options for:
  | Language          | Version/Framework                    |
  | JavaScript        | Node.js, Browser, TypeScript         |
  | Python            | Python 3.x, with requests/httpx      |
  | PHP               | PHP 7.4+, with Guzzle                |
  | Ruby              | Ruby 2.7+, with Faraday              |
  | cURL              | Command line                         |
  | Go                | Go 1.18+                             |

Given Elena has selected a use case
When she views available snippets
Then she should see organized templates:
  | Category           | Snippets                                      |
  | Authentication     | API key setup, OAuth flow                     |
  | Contacts           | List, create, update, delete, search          |
  | Automations        | List, execute, get status                     |
  | Webhooks           | Signature verification, payload parsing       |
  | Error Handling     | Retry logic, error categorization             |

Given Elena generates a code snippet
When the code displays
Then it should include:
  - Clear comments explaining each section
  - Proper authentication header setup
  - Error handling for common cases (401, 429, 500)
  - Type definitions (if TypeScript selected)
  - Environment variable placeholders for secrets
  - Example response handling

Given Elena wants personalized code
When she selects her API key
Then the snippet should:
  - Use the actual key (with warning about security)
  - OR use a placeholder with comment to replace
  - Include the correct base URL for her environment
```

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| User has no API keys | Show placeholder with instructions to generate key |
| Selected language doesn't support certain feature | Show alternative approach or limitation note |
| Snippet requires SDK not installed | Include installation instructions (npm install, pip install) |
| User requests snippet for deprecated endpoint | Show deprecation warning with migration path |
| Generated code exceeds typical file size | Offer to split into multiple files/modules |
| User wants snippet for undocumented use case | Show "Custom Request" builder interface |

### Test Data Requirements

```yaml
code_templates:
  javascript_node:
    list_contacts:
      name: "List Contacts with Pagination"
      description: "Fetch all contacts with cursor-based pagination"
      code: |
        const axios = require('axios');

        const API_KEY = process.env.BOTTLENECK_API_KEY;
        const BASE_URL = 'https://api.bottleneck-bots.com/v1';

        async function listContacts(limit = 20) {
          const contacts = [];
          let cursor = null;

          do {
            const response = await axios.get(`${BASE_URL}/contacts`, {
              headers: { 'Authorization': `Bearer ${API_KEY}` },
              params: { limit, cursor }
            });

            contacts.push(...response.data.data);
            cursor = response.data.meta.next_cursor;
          } while (cursor);

          return contacts;
        }

    webhook_verification:
      name: "Webhook Signature Verification"
      description: "Verify HMAC signature on incoming webhooks"
      code: |
        const crypto = require('crypto');

        function verifyWebhookSignature(payload, signature, secret) {
          const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(payload))
            .digest('hex');

          return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(`sha256=${expectedSignature}`)
          );
        }

supported_languages:
  - id: "javascript_node"
    name: "JavaScript (Node.js)"
    extensions: [".js", ".mjs"]
    package_manager: "npm"
  - id: "typescript"
    name: "TypeScript"
    extensions: [".ts"]
    package_manager: "npm"
  - id: "python"
    name: "Python"
    extensions: [".py"]
    package_manager: "pip"
  - id: "php"
    name: "PHP"
    extensions: [".php"]
    package_manager: "composer"
```

### Priority
**P1** - Important for developer experience and integration speed

---

## UXS-015-07: API Usage Monitoring

### Story ID
UXS-015-07

### Title
API Usage Monitoring and Analytics

### Persona
**Robert Chang** - Technical Lead managing multiple integrations using the Bottleneck-Bots API. He needs to monitor API usage across different API keys, track rate limit consumption, identify usage patterns, and ensure integrations stay within quotas. He also needs to investigate failed requests when issues arise.

### Scenario
Robert receives an alert that one of his integrations is approaching rate limits. He needs to investigate which API key is making the most requests, understand the request patterns, identify any failing requests, and potentially adjust the integration to reduce API calls.

### User Goal
Monitor API usage metrics, track rate limit consumption, analyze request patterns, investigate errors, and optimize API usage to stay within quotas.

### Preconditions
- User has active API keys with recent usage
- API analytics are being collected
- User has access to Developer dashboard
- Usage data is available for the requested time range

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | User navigates to Developer > API Usage | API Usage dashboard loads with overview metrics |
| 2 | User views summary cards: Total Requests, Success Rate, Avg Latency | Cards show current period stats with trend indicators |
| 3 | User examines rate limit gauge: "750/1000 requests/hour (75%)" | Visual gauge with color indicator (green/yellow/red) |
| 4 | User views requests over time chart | Line chart shows request volume by hour/day |
| 5 | User filters by API key: "CRM Integration Key" | All metrics filter to selected key's usage |
| 6 | User examines endpoint breakdown table | Table shows requests per endpoint with latency percentiles |
| 7 | User identifies high-traffic endpoint: "GET /contacts" (450 calls/hr) | Row highlighted; click expands details |
| 8 | User clicks on endpoint for detailed analysis | Modal shows request pattern, common parameters, error rates |
| 9 | User navigates to "Errors" tab | Error log shows failed requests with status codes |
| 10 | User filters errors by status: "429 Too Many Requests" | List shows all rate-limited requests with timestamps |
| 11 | User expands error entry to see full request details | Request details: headers, params, response body |
| 12 | User exports usage report for team review | CSV/PDF export generated with selected metrics |

### Expected Outcomes
- Comprehensive visibility into API usage patterns
- Rate limit status clearly visible
- Error analysis capabilities for troubleshooting
- Usage filterable by key, endpoint, and time range
- Exportable reports for stakeholder review

### Acceptance Criteria

```gherkin
Given Robert is on the API Usage dashboard
When the page loads
Then he should see summary metrics:
  | Metric              | Display                                |
  | Total Requests      | Count for selected period              |
  | Success Rate        | Percentage with trend arrow            |
  | Error Rate          | Percentage with trend arrow            |
  | Avg Response Time   | Milliseconds with trend                |
  | Rate Limit Status   | Current usage / limit with gauge       |

Given Robert is viewing usage data
When he applies filters
Then he should be able to filter by:
  - API Key (single or multiple select)
  - Date range (preset: today, 7d, 30d, custom)
  - Endpoint (single or multiple select)
  - HTTP Method (GET, POST, PUT, DELETE)
  - Status Code range (2xx, 4xx, 5xx)

Given Robert views the requests chart
When data is displayed
Then the chart should:
  - Show request volume over time
  - Allow granularity selection (minute, hour, day)
  - Overlay success/error ratio
  - Show rate limit threshold line
  - Support zoom and pan

Given Robert views the endpoint breakdown
When the table loads
Then each endpoint should show:
  | Column              | Data                                   |
  | Endpoint            | Path and method                        |
  | Request Count       | Total for period                       |
  | Success Rate        | Percentage                             |
  | Avg Latency         | P50, P95, P99 percentiles              |
  | Last Called         | Timestamp                              |

Given Robert investigates an error
When he expands an error entry
Then he should see:
  - Full request URL and method
  - Request headers (sensitive data masked)
  - Request body (if applicable)
  - Response status and headers
  - Response body (error message)
  - Timestamp and duration
  - API key used (masked)
```

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| No API usage in selected period | Show "No data available" with suggestion to adjust date range |
| Rate limit exceeded | Show alert banner with time until reset |
| Very high request volume (millions) | Aggregate data for performance; offer detailed export |
| Multiple keys with same endpoint | Show combined and per-key breakdown options |
| Usage spike anomaly detected | Highlight spike on chart with annotation |
| Real-time data delay (up to 5 min) | Show "Data updated as of [timestamp]" indicator |

### Test Data Requirements

```yaml
api_usage_data:
  summary:
    total_requests: 45000
    success_count: 44100
    error_count: 900
    success_rate: 98.0
    avg_latency_ms: 125
    p95_latency_ms: 350
    p99_latency_ms: 780

  rate_limits:
    hourly:
      limit: 1000
      used: 750
      reset_in_seconds: 1800
    daily:
      limit: 20000
      used: 15000
      reset_in_seconds: 28800

  endpoint_breakdown:
    - endpoint: "GET /api/v1/contacts"
      method: "GET"
      requests: 12500
      success_rate: 99.2
      avg_latency_ms: 85
      p95_latency_ms: 200

    - endpoint: "POST /api/v1/automations/{id}/execute"
      method: "POST"
      requests: 3200
      success_rate: 94.5
      avg_latency_ms: 450
      p95_latency_ms: 1200

  errors:
    - timestamp: "2026-01-11T10:30:00Z"
      endpoint: "GET /api/v1/contacts"
      status_code: 429
      error_message: "Rate limit exceeded"
      api_key: "bb_live_****cdef"

    - timestamp: "2026-01-11T10:25:00Z"
      endpoint: "POST /api/v1/automations/123/execute"
      status_code: 400
      error_message: "Invalid automation ID"
      api_key: "bb_live_****abcd"

time_ranges:
  - "today"
  - "yesterday"
  - "last_7_days"
  - "last_30_days"
  - "this_month"
  - "custom"
```

### Priority
**P0** - Critical for API health monitoring and troubleshooting

---

## UXS-015-08: Publishing to Marketplace

### Story ID
UXS-015-08

### Title
Publishing Templates to Marketplace

### Persona
**Marcus Thompson** - Senior Automation Consultant who has built successful automation templates for clients. He wants to share his templates with the broader community and potentially earn revenue. He needs to prepare his template for publication, submit it for review, and manage the listing after approval.

### Scenario
Marcus has created a sophisticated lead scoring automation that his clients love. He wants to publish it to the Bottleneck-Bots marketplace. He needs to prepare documentation, set pricing, submit for review, respond to any feedback, and eventually manage ratings and updates after publication.

### User Goal
Prepare, submit, and manage marketplace template listings including documentation, pricing, submission for review, and post-publication updates.

### Preconditions
- User has a complete, tested template ready for publication
- User has a verified developer account (email verified, profile complete)
- User has accepted marketplace publisher terms
- Template meets minimum requirements (documentation, testing)

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | User navigates to Developer > Publish to Marketplace | Publisher dashboard loads showing existing listings and "New Listing" button |
| 2 | User clicks "Create New Listing" | Publication wizard opens with step indicator |
| 3 | Step 1 - Select Template: User chooses "Lead Scoring Pro" from their templates | Template loaded; components listed for review |
| 4 | User reviews included components and confirms selection | Checklist shows: 3 automations, 2 data models, 5 email templates |
| 5 | Step 2 - Listing Details: User enters title, tagline, description | Rich text editor for description with formatting |
| 6 | User selects category: "Lead Generation" and tags: "lead scoring", "B2B" | Category dropdown and tag input with suggestions |
| 7 | User uploads screenshots (min 3) and optional video demo | Media uploader with preview; video URL field |
| 8 | Step 3 - Documentation: User writes setup guide and usage instructions | Markdown editor with preview; required sections highlighted |
| 9 | User documents requirements: "Pro tier, GHL integration" | Structured requirements input form |
| 10 | Step 4 - Pricing: User selects "Paid" and enters price: $49.00 | Price input with marketplace fee calculation shown |
| 11 | User reviews revenue split: "$49 price - $14.70 fee = $34.30 revenue" | Fee breakdown displayed; payout terms linked |
| 12 | Step 5 - Review & Submit: User reviews all information | Summary displayed; validation errors if any |
| 13 | User clicks "Submit for Review" | Submission confirmed; status shows "Under Review" |
| 14 | Email notification received: "Submission received - review in 3-5 business days" | Email with submission details and timeline |
| 15 | Review feedback received requesting documentation update | Notification with specific feedback items |
| 16 | User updates documentation and resubmits | Status returns to "Under Review" |
| 17 | Template approved; user receives notification | Listing goes live; appears in marketplace |

### Expected Outcomes
- Template successfully submitted for marketplace review
- Documentation meets marketplace quality standards
- Pricing and revenue terms clearly understood
- Review feedback addressed appropriately
- Template published and discoverable in marketplace

### Acceptance Criteria

```gherkin
Given Marcus is creating a marketplace listing
When he completes the listing details
Then he should provide:
  | Field              | Requirements                                   |
  | Title              | 5-100 characters, unique                       |
  | Tagline            | 10-150 characters                              |
  | Description        | 100-5000 characters, rich text                 |
  | Category           | Single primary category                        |
  | Tags               | 1-10 tags                                      |
  | Screenshots        | 3-10 images, min 1200x800px                    |
  | Video (optional)   | YouTube/Vimeo URL                              |

Given Marcus is writing documentation
When he views the documentation editor
Then he should see required sections:
  - Overview (what the template does)
  - Requirements (tier, integrations, prerequisites)
  - Installation Guide (step-by-step)
  - Configuration (customization options)
  - Usage Instructions (how to use after install)
  - FAQ (common questions)
  - Support (how to get help)

Given Marcus sets pricing
When he enters a price
Then the system should display:
  - Entered price
  - Marketplace fee (30%)
  - Creator revenue (70%)
  - Minimum price ($4.99 if paid)
  - Option for "Free" listing

Given Marcus submits for review
When the submission is processed
Then the system should:
  - Validate all required fields are complete
  - Check media meets quality requirements
  - Scan for prohibited content
  - Generate preview link for internal review
  - Send confirmation email with timeline
  - Set status to "Under Review"

Given a listing is under review
When reviewers provide feedback
Then Marcus should:
  - Receive notification with specific items
  - Be able to view feedback in publisher dashboard
  - Have ability to update and resubmit
  - See review history and status changes
```

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Template contains sensitive/credentials | Validation error: "Remove sensitive data before publishing" |
| Title already exists in marketplace | Error: "Title already in use. Please choose a different title." |
| Screenshots below minimum quality | Warning with requirements; block submission |
| Price set below minimum ($4.99) | Validation: "Minimum price for paid listings is $4.99" |
| Submission rejected after multiple reviews | Provide escalation path; clear rejection reasons |
| Template update breaks existing installations | Require version compatibility notes; notify existing users |

### Test Data Requirements

```yaml
listing_requirements:
  media:
    screenshots:
      min_count: 3
      max_count: 10
      min_dimensions: "1200x800"
      formats: ["png", "jpg", "webp"]
    video:
      platforms: ["youtube", "vimeo"]
      optional: true

  documentation:
    required_sections:
      - overview
      - requirements
      - installation
      - configuration
      - usage
    optional_sections:
      - faq
      - support
      - changelog

  pricing:
    free: true
    paid:
      min_price: 4.99
      max_price: 999.99
      fee_percentage: 30
      payout_schedule: "monthly"

review_process:
  steps:
    - automated_checks:
        - malware_scan
        - content_policy
        - metadata_validation
    - manual_review:
        - quality_assessment
        - documentation_review
        - functionality_test
  timeline: "3-5 business days"
  statuses:
    - draft
    - submitted
    - under_review
    - changes_requested
    - approved
    - published
    - rejected

sample_listings:
  - title: "Lead Scoring Pro"
    tagline: "Intelligent lead scoring with customizable criteria"
    category: "Lead Generation"
    tags: ["lead scoring", "B2B", "sales automation"]
    price: 49.00
    screenshots: ["screenshot1.png", "screenshot2.png", "screenshot3.png"]
    status: "published"
```

### Priority
**P1** - Important for marketplace ecosystem growth

---

## UXS-015-09: Webhook Event History and Debugging

### Story ID
UXS-015-09

### Title
Webhook Event History and Debugging

### Persona
**Lisa Park** - Integration Engineer troubleshooting webhook delivery issues. A client reports they're not receiving some webhook events, and Lisa needs to investigate the delivery history, examine payloads, retry failed deliveries, and identify the root cause of failures.

### Scenario
Lisa receives a support ticket saying that automation.completed webhooks are inconsistently delivered. She needs to access the webhook delivery history, filter for the specific event type, examine failed deliveries, understand the failure reasons, and potentially retry failed webhook calls.

### User Goal
Review webhook delivery history, diagnose delivery failures, examine request/response details, and retry failed webhooks to ensure reliable event delivery.

### Preconditions
- User has configured webhooks with active subscriptions
- Webhook events have been generated (both successful and failed)
- User has access to Developer > Webhooks section
- Historical data is retained (30 days minimum)

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | User navigates to Developer > Webhooks > "Automation Handler" | Webhook detail page loads with delivery history tab |
| 2 | User clicks on "Delivery History" tab | History table loads with recent deliveries |
| 3 | User views delivery list: timestamp, event type, status, latency | Table shows entries with status badges (Success, Failed, Pending) |
| 4 | User filters by status: "Failed" | List shows 12 failed deliveries |
| 5 | User filters by event type: "automation.completed" | List narrows to 8 matching failures |
| 6 | User filters by date range: "Last 24 hours" | List shows 3 recent failures |
| 7 | User clicks on a failed delivery to expand details | Delivery detail panel opens |
| 8 | User views request details: headers, payload sent | Full request information displayed |
| 9 | User views response details: status 500, response body | Response shows endpoint error message |
| 10 | User clicks "View Full Payload" to see complete JSON | Modal shows formatted JSON with copy option |
| 11 | User clicks "Retry" button on the failed delivery | Confirmation: "Retry this webhook delivery?" |
| 12 | User confirms retry | Webhook re-sent; new delivery entry created |
| 13 | Retry succeeds; user sees updated status | Original entry shows "Retried -> Success" link |
| 14 | User clicks "Bulk Retry" to retry all filtered failures | Progress indicator; all 3 failures retried |

### Expected Outcomes
- Complete visibility into webhook delivery history
- Detailed request/response information for debugging
- Ability to filter and search delivery records
- Manual retry capability for failed deliveries
- Clear understanding of failure reasons

### Acceptance Criteria

```gherkin
Given Lisa is viewing webhook delivery history
When the history loads
Then each delivery entry should show:
  | Column         | Data                                          |
  | Timestamp      | ISO timestamp with relative time              |
  | Event Type     | e.g., "automation.completed"                  |
  | Status         | Success (2xx), Failed (4xx/5xx), Pending      |
  | Latency        | Response time in milliseconds                 |
  | Attempts       | Number of delivery attempts                   |
  | Delivery ID    | Unique identifier for the delivery            |

Given Lisa expands a delivery entry
When the detail panel opens
Then she should see:
  - Request section:
    - HTTP method and URL
    - Headers (including signature)
    - Payload (formatted JSON)
    - Timestamp sent
  - Response section:
    - Status code and status text
    - Response headers
    - Response body
    - Time to first byte
  - Retry section:
    - Retry count and timestamps
    - Each attempt's result

Given Lisa wants to filter delivery history
When she uses filter options
Then she should be able to filter by:
  - Date range (preset and custom)
  - Event type (multi-select)
  - Status (Success, Failed, Pending)
  - Delivery ID (search)

Given Lisa identifies a failed delivery
When she clicks "Retry"
Then the system should:
  - Re-send the exact original payload
  - Include current signature (recalculated)
  - Create new delivery entry linked to original
  - Update original entry with retry status
  - Respect rate limits for the endpoint

Given Lisa wants to retry multiple failures
When she selects multiple entries and clicks "Bulk Retry"
Then the system should:
  - Queue all selected for retry
  - Process retries with rate limiting
  - Show progress indicator
  - Report success/failure count on completion
```

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Delivery history exceeds retention period (30 days) | Show "Historical data older than 30 days is not available" |
| Retry on permanently failing endpoint (3 consecutive 500s) | Warning: "Endpoint may be experiencing issues. Retry anyway?" |
| Webhook endpoint changed after original delivery | Info: "Current endpoint differs from original. Use current?" |
| Delivery pending (in retry backoff) | Show "Pending retry at [time]" with cancel option |
| Original payload contains sensitive data | Mask sensitive fields; offer admin-only full view |
| High volume of failures (>100 in period) | Paginate results; offer CSV export |

### Test Data Requirements

```yaml
delivery_history:
  successful:
    - delivery_id: "del_001"
      timestamp: "2026-01-11T10:00:00Z"
      event_type: "automation.completed"
      status: 200
      latency_ms: 145
      attempts: 1

  failed:
    - delivery_id: "del_002"
      timestamp: "2026-01-11T09:30:00Z"
      event_type: "automation.completed"
      status: 500
      latency_ms: 2500
      attempts: 3
      error: "Internal Server Error"
      response_body: '{"error": "Database connection failed"}'

    - delivery_id: "del_003"
      timestamp: "2026-01-11T09:00:00Z"
      event_type: "contact.updated"
      status: 408
      latency_ms: 30000
      attempts: 3
      error: "Request Timeout"

  pending:
    - delivery_id: "del_004"
      timestamp: "2026-01-11T10:15:00Z"
      event_type: "task.created"
      status: null
      next_retry: "2026-01-11T10:20:00Z"
      attempts: 1

sample_payloads:
  automation.completed:
    event: "automation.completed"
    timestamp: "2026-01-11T10:00:00Z"
    delivery_id: "del_001"
    data:
      automation_id: "auto_123"
      automation_name: "Daily Lead Score Update"
      execution_id: "exec_456"
      status: "completed"
      duration_ms: 32000
      results:
        leads_processed: 150
        leads_updated: 142

retry_policies:
  max_retries: 3
  backoff_strategy: "exponential"
  initial_delay_seconds: 60
  max_delay_seconds: 3600
```

### Priority
**P1** - Important for integration reliability and support

---

## UXS-015-10: API Rate Limiting and Quota Management

### Story ID
UXS-015-10

### Title
API Rate Limiting and Quota Management

### Persona
**Kevin Nguyen** - DevOps Engineer responsible for ensuring API integrations operate within rate limits. He needs to understand the rate limiting policies, monitor current consumption against limits, configure alerts for quota thresholds, and request quota increases when needed.

### Scenario
Kevin's team has built an integration that syncs data every 5 minutes, but they're occasionally hitting rate limits during peak hours. He needs to understand the rate limiting structure, optimize API calls, set up proactive alerts, and potentially request a quota increase to handle growth.

### User Goal
Understand rate limiting policies, monitor quota consumption in real-time, configure alerts for approaching limits, and manage quota through increases or optimization.

### Preconditions
- User has active API keys with usage
- Rate limiting is enforced on the account
- User has access to Developer settings
- Quota management is available for the subscription tier

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | User navigates to Developer > Rate Limits & Quotas | Rate limits dashboard loads with current status |
| 2 | User views rate limit overview showing current vs limit | Cards show: 750/1000 requests/hour, 15000/20000 requests/day |
| 3 | User examines rate limit by endpoint breakdown | Table shows limits per endpoint category (Contacts, Automations, etc.) |
| 4 | User clicks on "Contacts" endpoint category | Detailed view shows: GET 300/500, POST 80/200, etc. |
| 5 | User views rate limit policy documentation | Expandable section explains: limits, reset periods, headers |
| 6 | User navigates to "Alerts" tab | Alert configuration panel opens |
| 7 | User creates alert: "Notify when hourly limit reaches 80%" | Alert saved with email and Slack notification options |
| 8 | User creates alert: "Notify when daily limit reaches 90%" | Second alert saved |
| 9 | User navigates to "Request Increase" section | Quota increase request form displays |
| 10 | User fills out request: current usage, expected growth, use case | Form validates; estimated approval time shown |
| 11 | User submits quota increase request | Confirmation: "Request submitted. Response within 2 business days." |
| 12 | User receives approval email with new limits | New limits reflected in dashboard |

### Expected Outcomes
- Clear understanding of rate limiting policies
- Real-time visibility into quota consumption
- Proactive alerting before limits are hit
- Process for requesting quota increases
- Optimization recommendations based on usage patterns

### Acceptance Criteria

```gherkin
Given Kevin is on the Rate Limits dashboard
When the page loads
Then he should see:
  | Limit Type        | Display                                      |
  | Requests/Second   | Current rate vs burst limit                  |
  | Requests/Minute   | Current vs limit with progress bar           |
  | Requests/Hour     | Current vs limit with time until reset       |
  | Requests/Day      | Current vs limit with time until reset       |
  | Monthly Quota     | Usage vs allocated quota                     |

Given Kevin views endpoint-specific limits
When he examines the breakdown
Then he should see limits by:
  - Endpoint category (Contacts, Automations, Tasks)
  - HTTP method (GET, POST, PUT, DELETE)
  - Specific endpoint (if custom limits apply)
  - Special limits (bulk operations, exports)

Given Kevin configures rate limit alerts
When he creates an alert
Then he should specify:
  | Setting           | Options                                      |
  | Limit Type        | Hourly, Daily, Monthly                       |
  | Threshold         | Percentage (50%, 75%, 80%, 90%, custom)      |
  | Notification      | Email, Slack, Webhook                        |
  | Frequency         | Once per period, Every time crossed          |

Given Kevin requests a quota increase
When he fills out the request form
Then he should provide:
  - Current usage patterns
  - Expected growth percentage
  - Use case description
  - Requested new limits
  - Business justification

Given an API request is rate limited
When the response is returned
Then it should include:
  - HTTP 429 status code
  - X-RateLimit-Limit header (total limit)
  - X-RateLimit-Remaining header (remaining)
  - X-RateLimit-Reset header (reset timestamp)
  - Retry-After header (seconds to wait)
  - Error body with explanation and documentation link
```

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Multiple keys sharing organization quota | Show combined usage; breakdown by key available |
| Rate limit reset occurs during page view | Real-time update or manual refresh indicator |
| All allocated quota consumed | Dashboard shows emergency contact and upgrade options |
| Quota increase request denied | Notification with reasons and alternatives |
| Burst limit hit but not sustained limit | Show burst separately; explain difference |
| Rate limit headers missing from some responses | Documentation notes which endpoints include headers |

### Test Data Requirements

```yaml
rate_limits_configuration:
  tiers:
    starter:
      requests_per_second: 5
      requests_per_minute: 100
      requests_per_hour: 500
      requests_per_day: 5000
      monthly_quota: 100000

    pro:
      requests_per_second: 20
      requests_per_minute: 500
      requests_per_hour: 1000
      requests_per_day: 20000
      monthly_quota: 500000

    enterprise:
      requests_per_second: 100
      requests_per_minute: 2000
      requests_per_hour: 5000
      requests_per_day: 100000
      monthly_quota: null  # unlimited

  endpoint_limits:
    contacts:
      get: 500/hour
      post: 200/hour
      put: 200/hour
      delete: 100/hour
      bulk: 10/hour
    automations:
      get: 300/hour
      execute: 100/hour
    exports:
      create: 10/hour

current_usage:
  hourly:
    limit: 1000
    used: 750
    reset_at: "2026-01-11T11:00:00Z"
  daily:
    limit: 20000
    used: 15000
    reset_at: "2026-01-12T00:00:00Z"
  monthly:
    quota: 500000
    used: 350000
    period_end: "2026-01-31"

alert_configurations:
  - name: "Hourly 80% Warning"
    limit_type: "hourly"
    threshold: 80
    channels: ["email", "slack"]
    frequency: "once_per_period"

  - name: "Daily 90% Critical"
    limit_type: "daily"
    threshold: 90
    channels: ["email", "slack", "pagerduty"]
    frequency: "every_crossing"

quota_increase_request:
  fields:
    - current_usage_description
    - expected_growth_percentage
    - use_case
    - requested_limits
    - business_justification
  sla: "2 business days"
  approval_required: true
```

### Priority
**P0** - Critical for API reliability and capacity planning

---

## Summary

| Story ID | Title | Priority | Primary Persona |
|----------|-------|----------|-----------------|
| UXS-015-01 | API Key Generation and Management | P0 | Lead Developer |
| UXS-015-02 | API Documentation Browsing | P0 | Full-stack Developer |
| UXS-015-03 | Webhook Configuration and Testing | P0 | Backend Engineer |
| UXS-015-04 | Marketplace Template Browsing | P1 | Marketing Operations Manager |
| UXS-015-05 | Template Installation and Customization | P0 | Digital Marketing Specialist |
| UXS-015-06 | Code Snippet Generation | P1 | Junior Developer |
| UXS-015-07 | API Usage Monitoring | P0 | Technical Lead |
| UXS-015-08 | Publishing to Marketplace | P1 | Automation Consultant |
| UXS-015-09 | Webhook Event History and Debugging | P1 | Integration Engineer |
| UXS-015-10 | API Rate Limiting and Quota Management | P0 | DevOps Engineer |

---

## Testing Notes

### Test Environment Requirements
- Sandbox API environment with isolated data
- Mock webhook endpoints for testing delivery
- Test marketplace with sample templates
- API keys with various scope configurations
- Rate limiting that can be artificially triggered
- Historical data for usage analytics testing

### Recommended Test Execution Order
1. UXS-015-01 (API Keys) - Foundation for all API access
2. UXS-015-02 (Documentation) - Developer onboarding
3. UXS-015-03 (Webhooks) - Event-driven integrations
4. UXS-015-10 (Rate Limits) - API reliability
5. UXS-015-07 (Usage Monitoring) - Operational visibility
6. UXS-015-06 (Code Snippets) - Developer productivity
7. UXS-015-04 (Marketplace Browse) - Template discovery
8. UXS-015-05 (Template Install) - Template adoption
9. UXS-015-09 (Webhook Debugging) - Support scenarios
10. UXS-015-08 (Publishing) - Marketplace ecosystem

### Test Data Preparation
- Generate API keys with various scopes and expirations
- Create webhooks with different event subscriptions
- Populate usage data for analytics testing
- Prepare marketplace templates in different categories
- Set up mock endpoints for webhook delivery testing

---

*Document maintained by QA Team. Last review: 2026-01-11*
