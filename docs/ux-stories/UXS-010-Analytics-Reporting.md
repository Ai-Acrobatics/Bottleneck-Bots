# UXS-010: Analytics & Reporting Feature - User Experience Stories

**Document Version:** 1.0
**Created:** 2026-01-11
**Feature Area:** Analytics & Reporting
**Total Stories:** 10

---

## Table of Contents

1. [UXS-010-01: Executive Dashboard KPI Viewing](#uxs-010-01-executive-dashboard-kpi-viewing)
2. [UXS-010-02: PDF Report Generation and Export](#uxs-010-02-pdf-report-generation-and-export)
3. [UXS-010-03: Custom Report Building with Drag-and-Drop](#uxs-010-03-custom-report-building-with-drag-and-drop)
4. [UXS-010-04: Sub-Account Performance Comparison](#uxs-010-04-sub-account-performance-comparison)
5. [UXS-010-05: Cost Tracking and Budget Monitoring](#uxs-010-05-cost-tracking-and-budget-monitoring)
6. [UXS-010-06: Conversion Tracking and Attribution](#uxs-010-06-conversion-tracking-and-attribution)
7. [UXS-010-07: Real-Time Metrics Refresh](#uxs-010-07-real-time-metrics-refresh)
8. [UXS-010-08: Scheduled Report Delivery](#uxs-010-08-scheduled-report-delivery)
9. [UXS-010-09: Data Visualization and Chart Customization](#uxs-010-09-data-visualization-and-chart-customization)
10. [UXS-010-10: Analytics Data Export and Integration](#uxs-010-10-analytics-data-export-and-integration)

---

## UXS-010-01: Executive Dashboard KPI Viewing

### Story ID
UXS-010-01

### Title
Executive Dashboard KPI Viewing

### Persona
**Sarah Chen** - Chief Marketing Officer at a mid-size digital marketing agency. She manages 15 client accounts and needs to quickly assess overall performance without diving into granular details. She typically reviews dashboards during morning standup meetings and weekly executive reviews.

### Scenario
Sarah arrives at the office Monday morning and needs to prepare for the 9:00 AM leadership meeting. She has 10 minutes to review the weekend performance across all client accounts to identify any critical issues or notable wins. She needs high-level KPIs that tell the story without requiring deep analysis.

### User Goal
Quickly view aggregated key performance indicators across all managed accounts to assess overall business health and identify accounts requiring immediate attention.

### Preconditions
- User is authenticated with agency-level access
- At least 3 active sub-accounts exist with connected data sources
- Data has been synced within the last 24 hours
- User has permission to view executive dashboard

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | User navigates to Bottleneck-Bots and logs in | Dashboard loads with last viewed configuration within 2 seconds |
| 2 | User clicks on "Executive Dashboard" in the main navigation | Executive dashboard displays with aggregated KPI cards loading progressively |
| 3 | User views the KPI summary cards at the top of the dashboard | System displays: Total Spend, Total Conversions, Overall ROAS, Cost Per Acquisition, and Trend Indicators (up/down arrows with percentage changes) |
| 4 | User hovers over a KPI card | Tooltip appears showing comparison to previous period (WoW, MoM) and breakdown by top 3 accounts |
| 5 | User clicks on "Accounts Requiring Attention" widget | System expands to show accounts with performance anomalies (>20% deviation from target) |
| 6 | User selects date range picker and chooses "Last 7 Days" | All KPIs refresh to reflect the selected date range within 1 second |
| 7 | User clicks on a specific underperforming account | System navigates to that account's detailed dashboard |
| 8 | User clicks "Back to Executive View" breadcrumb | Returns to executive dashboard with previous state preserved |

### Expected Outcomes
- All KPIs display accurate, aggregated data within 3 seconds of page load
- Performance trends are immediately visible through visual indicators
- Accounts with issues are prominently highlighted
- Date range changes are reflected instantly across all widgets
- Navigation between views preserves context

### Acceptance Criteria

```gherkin
Given Sarah is logged in with agency-level access
When she navigates to the Executive Dashboard
Then she should see the following KPI cards within 3 seconds:
  | KPI Name             | Data Type | Trend Indicator |
  | Total Ad Spend       | Currency  | Yes             |
  | Total Conversions    | Number    | Yes             |
  | Overall ROAS         | Ratio     | Yes             |
  | Avg. Cost Per Acq.   | Currency  | Yes             |
  | Active Campaigns     | Number    | No              |

Given the Executive Dashboard is loaded
When Sarah hovers over any KPI card
Then a tooltip should appear within 200ms showing:
  - Comparison to previous period
  - Percentage change
  - Top 3 contributing accounts

Given accounts exist with performance below target
When the "Accounts Requiring Attention" widget loads
Then it should display all accounts with >20% negative deviation
And each account should show the specific metric causing the alert

Given Sarah is viewing the Executive Dashboard
When she changes the date range to any valid range
Then all KPIs should update within 1 second
And the selected date range should persist during the session
```

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| No data available for selected date range | Display "No data available for this period" message with suggestion to adjust date range |
| Single sub-account in the system | Dashboard functions normally but comparative widgets are hidden |
| Data sync in progress | Show "Syncing..." indicator with estimated completion time; display last available data |
| User has access to only some accounts | KPIs aggregate only accessible accounts; hidden accounts are not reflected |
| Network timeout during load | Show cached data (if available) with "Last updated: [timestamp]" and retry button |
| All accounts performing above target | "Accounts Requiring Attention" widget shows "All accounts on track" success message |

### Test Data Requirements

```yaml
test_accounts:
  - name: "Acme Corp"
    spend: 15000.00
    conversions: 450
    roas: 3.2
    status: "healthy"

  - name: "TechStart Inc"
    spend: 8500.00
    conversions: 120
    roas: 1.8
    status: "underperforming"
    deviation: -25%

  - name: "Global Retail"
    spend: 42000.00
    conversions: 1200
    roas: 4.1
    status: "healthy"

  - name: "Local Services"
    spend: 3200.00
    conversions: 45
    roas: 0.9
    status: "critical"
    deviation: -45%

date_ranges:
  - last_7_days
  - last_30_days
  - this_month
  - last_month
  - custom_range
```

### Priority
**P0** - Critical for daily operations and executive visibility

---

## UXS-010-02: PDF Report Generation and Export

### Story ID
UXS-010-02

### Title
PDF Report Generation and Export

### Persona
**Marcus Thompson** - Senior Account Manager responsible for 5 enterprise clients. He needs to deliver polished, branded performance reports to clients on a monthly basis. Clients expect professional presentations they can share with their own stakeholders.

### Scenario
Marcus has a client meeting tomorrow with Stellar Brands, a key account. He needs to generate a comprehensive monthly performance report that includes all relevant metrics, visualizations, and insights. The report must be branded with the client's logo and formatted for executive presentation.

### User Goal
Generate a professional, branded PDF report containing selected metrics, charts, and insights that can be shared with external stakeholders.

### Preconditions
- User has account manager or higher access level
- Target account has at least 30 days of historical data
- Client branding assets (logo, colors) have been uploaded to account settings
- PDF generation service is operational

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | User navigates to the Stellar Brands account dashboard | Account dashboard loads with current performance data |
| 2 | User clicks "Reports" in the account navigation menu | Reports section opens showing available report templates |
| 3 | User selects "Monthly Performance Report" template | Template preview appears with customization options panel |
| 4 | User sets date range to "Previous Month" | Preview updates to show data for the selected period |
| 5 | User toggles on/off specific sections (Executive Summary, Campaign Breakdown, Recommendations) | Preview dynamically updates to reflect section visibility |
| 6 | User clicks "Branding Options" and verifies client logo is displayed | Branding panel shows uploaded logo, primary/secondary colors |
| 7 | User enters a custom cover page title: "November 2025 Performance Review" | Cover page preview updates with the custom title |
| 8 | User clicks "Generate PDF" button | System displays "Generating report..." progress indicator |
| 9 | System completes generation | Download dialog appears with filename "StellarBrands_Monthly_Nov2025.pdf" |
| 10 | User clicks "Download" | PDF downloads to user's device |
| 11 | User optionally clicks "Email to Client" | Email composition modal opens with pre-filled recipient and attachment |

### Expected Outcomes
- PDF generates within 30 seconds for reports up to 20 pages
- Document includes all selected sections with accurate data
- Branding is consistently applied throughout the document
- Charts and visualizations are high-resolution and print-ready
- File size is optimized (< 10MB for standard reports)
- Report is accessible (proper heading structure, alt text for images)

### Acceptance Criteria

```gherkin
Given Marcus is on a client account dashboard
When he clicks "Reports" and selects "Monthly Performance Report"
Then he should see a preview of the report template
And customization options should be visible in a side panel

Given Marcus has selected a report template
When he adjusts the date range to "Previous Month"
Then the preview should update within 2 seconds
And all metrics should reflect the selected date range

Given Marcus has configured report options
When he clicks "Generate PDF"
Then a progress indicator should appear
And the PDF should be ready for download within 30 seconds
And the generated filename should follow the pattern: {AccountName}_{ReportType}_{Period}.pdf

Given the PDF has been generated
When Marcus downloads and opens the document
Then it should contain:
  | Section              | Content                                      |
  | Cover Page           | Client logo, report title, date range        |
  | Executive Summary    | Key metrics, period comparison, highlights   |
  | Campaign Performance | Individual campaign metrics and charts       |
  | Channel Breakdown    | Performance by marketing channel             |
  | Recommendations      | AI-generated optimization suggestions        |
  | Appendix             | Detailed data tables                         |

Given the PDF has been generated
When Marcus clicks "Email to Client"
Then an email modal should appear
And the client's primary contact email should be pre-filled
And the PDF should be attached automatically
```

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| No branding assets uploaded | Use default Bottleneck-Bots branding with message prompting brand setup |
| Report data exceeds 50 pages | Warn user and offer to split into multiple documents or summarize |
| PDF generation fails | Display error message with retry option and alternative export formats (Excel) |
| User navigates away during generation | Continue generation in background; notify when complete |
| Report contains no data for selected period | Generate report with "No activity during this period" placeholders |
| Special characters in account name | Sanitize filename to remove invalid characters |

### Test Data Requirements

```yaml
report_templates:
  - name: "Monthly Performance Report"
    sections:
      - executive_summary
      - campaign_performance
      - channel_breakdown
      - recommendations
      - appendix

  - name: "Executive Summary"
    sections:
      - key_metrics
      - trend_analysis
      - action_items

branding_assets:
  client_logo: "stellar_brands_logo.png"
  primary_color: "#1E3A8A"
  secondary_color: "#60A5FA"
  font_family: "Inter"

sample_data:
  period: "November 2025"
  total_spend: 125000.00
  total_impressions: 4500000
  total_clicks: 85000
  total_conversions: 2150
  campaigns: 12
  channels:
    - google_ads: 45%
    - meta_ads: 35%
    - linkedin_ads: 15%
    - programmatic: 5%
```

### Priority
**P0** - Essential for client deliverables and agency operations

---

## UXS-010-03: Custom Report Building with Drag-and-Drop

### Story ID
UXS-010-03

### Title
Custom Report Building with Drag-and-Drop Interface

### Persona
**Emily Rodriguez** - Marketing Analytics Lead who needs to create specialized reports for different stakeholder groups. She requires flexibility to combine metrics in unique ways that standard templates don't support. She has intermediate technical skills and appreciates visual interfaces.

### Scenario
Emily needs to create a custom cross-channel attribution report for the CFO that combines data from Google Ads, Meta Ads, and the CRM. The CFO wants to see revenue attribution by marketing touchpoint with cost efficiency metrics. No existing template matches these exact requirements.

### User Goal
Build a custom report by selecting and arranging specific metrics, visualizations, and data sources using an intuitive drag-and-drop interface.

### Preconditions
- User has report builder access (Pro tier or above)
- Multiple data sources are connected and synced
- User has viewed at least one standard report (familiarity baseline)
- Report builder workspace is initialized

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | User navigates to Reports > Custom Report Builder | Report builder interface loads with blank canvas and component library |
| 2 | User clicks "Create New Report" and enters title "CFO Attribution Analysis" | New report workspace opens with title displayed at top |
| 3 | User views the left panel showing available components: Metrics, Charts, Tables, Text Blocks, Filters | Component library displays categorized, searchable components |
| 4 | User drags "Revenue by Channel" chart from library to canvas | Chart placeholder appears on canvas with configuration panel opening |
| 5 | User configures chart: selects channels (Google, Meta, LinkedIn), date range (Q4 2025) | Chart populates with real data; preview updates in real-time |
| 6 | User drags a "Key Metrics Row" component above the chart | Metrics row placeholder appears; user adds ROAS, CPA, Total Revenue |
| 7 | User drags "Attribution Model Comparison" table below the chart | Table component added; user selects First-Touch, Last-Touch, Linear models |
| 8 | User clicks on chart and drags corner to resize | Chart resizes smoothly; other components reflow automatically |
| 9 | User drags "Text Block" component and adds executive insight notes | Rich text editor opens; user types analysis commentary |
| 10 | User clicks "Preview" button | Full-screen preview displays report as it will appear in PDF |
| 11 | User clicks "Save Template" | Save dialog appears with options for naming and categorizing |
| 12 | User saves as "CFO Attribution Template" with tag "Executive" | Confirmation toast appears; template now available in library |

### Expected Outcomes
- Canvas responds fluidly to drag-and-drop interactions (< 100ms latency)
- Components snap to grid and align automatically
- Real data populates as components are configured
- Layout automatically adapts to different page sizes
- Saved templates are reusable across accounts
- Undo/redo functionality works reliably

### Acceptance Criteria

```gherkin
Given Emily is in the Custom Report Builder
When she views the component library
Then she should see the following categories:
  | Category    | Component Types                              |
  | Metrics     | Single Metric, Metric Row, Metric Comparison |
  | Charts      | Line, Bar, Pie, Funnel, Scatter, Heatmap    |
  | Tables      | Data Table, Pivot Table, Comparison Table    |
  | Text        | Header, Paragraph, Callout Box               |
  | Layout      | Section Divider, Spacer, Page Break          |

Given Emily is building a report
When she drags a component from the library to the canvas
Then the component should snap to the nearest grid position
And a configuration panel should open automatically
And the canvas should show drop zones for valid placements

Given Emily has placed a chart component
When she opens the configuration panel
Then she should be able to:
  - Select data sources
  - Choose metrics to display
  - Set date range filters
  - Customize colors and labels
  - Toggle legend visibility

Given Emily has built a complete report
When she clicks "Save Template"
Then she should be prompted for:
  - Template name (required)
  - Description (optional)
  - Category tags (optional)
  - Access permissions (private, team, agency)

Given Emily saves a template
When she navigates to Reports > Templates
Then her saved template should appear in the list
And she should be able to apply it to any account
```

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| User drags component to invalid location | Visual indicator shows invalid placement; component returns to library on drop |
| Canvas becomes cluttered with many components | Zoom controls and mini-map navigation appear for large reports |
| User attempts to add conflicting data sources | Warning modal explains incompatibility with option to proceed or cancel |
| Browser crashes during editing | Auto-save every 30 seconds; recovery prompt on next session |
| Component data fails to load | Show error state within component with retry option; other components unaffected |
| User has no permission to certain data sources | Those sources appear grayed out with tooltip explaining access requirements |

### Test Data Requirements

```yaml
component_library:
  metrics:
    - single_metric
    - metric_row
    - metric_comparison
    - sparkline_metric
  charts:
    - line_chart
    - bar_chart
    - stacked_bar
    - pie_chart
    - donut_chart
    - funnel_chart
  tables:
    - data_table
    - pivot_table
    - comparison_table

test_data_sources:
  - google_ads
  - meta_ads
  - linkedin_ads
  - hubspot_crm
  - google_analytics

canvas_configurations:
  - letter_portrait
  - letter_landscape
  - a4_portrait
  - custom_dimensions
```

### Priority
**P1** - Important for power users and custom reporting needs

---

## UXS-010-04: Sub-Account Performance Comparison

### Story ID
UXS-010-04

### Title
Sub-Account Performance Comparison

### Persona
**David Park** - Agency Operations Director overseeing a portfolio of 25 client accounts. He needs to benchmark accounts against each other to identify best practices and accounts needing intervention. He reports to the CEO on overall agency performance.

### Scenario
David is preparing for the quarterly business review and needs to compare performance across all agency accounts. He wants to identify top performers to recognize the account management team and spot underperformers for resource reallocation. He needs side-by-side comparisons with normalized metrics.

### User Goal
Compare performance metrics across multiple sub-accounts simultaneously to identify trends, outliers, and opportunities for optimization or resource reallocation.

### Preconditions
- User has agency-level admin access
- At least 5 active sub-accounts exist
- All accounts have consistent data for the comparison period
- User has viewed individual account dashboards previously

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | User navigates to Analytics > Account Comparison | Comparison tool interface loads with account selection panel |
| 2 | User clicks "Select Accounts" and chooses 8 accounts from the list | Selected accounts appear in the comparison workspace as cards |
| 3 | User selects comparison date range: "Q4 2025" | All account cards update to show Q4 2025 data |
| 4 | User chooses primary metric for comparison: "ROAS" | Accounts are sorted by ROAS; ranking indicators appear (1st, 2nd, etc.) |
| 5 | User clicks "Add Comparison Metric" and selects "CPA" and "Conversion Rate" | Additional metric columns appear in the comparison table |
| 6 | User toggles "Normalize by Spend" option | Metrics are recalculated as percentages relative to ad spend |
| 7 | User hovers over lowest-performing account | Detailed tooltip shows contributing factors and trend data |
| 8 | User clicks "View as Chart" to see visual comparison | Bar chart visualization appears with all accounts side-by-side |
| 9 | User clicks "Export Comparison" and selects Excel format | Excel file downloads with comparison data and formatting |
| 10 | User clicks "Save Comparison" for future reference | Comparison is saved with name "Q4 2025 Agency Review" |

### Expected Outcomes
- Up to 20 accounts can be compared simultaneously
- Metrics are consistent and comparable across accounts
- Visual indicators clearly highlight top and bottom performers
- Normalized metrics enable fair comparison across different budget sizes
- Export maintains formatting and sorting preferences

### Acceptance Criteria

```gherkin
Given David is on the Account Comparison page
When he selects multiple accounts for comparison
Then the accounts should appear in a comparison grid
And each account should display:
  - Account name and status
  - Primary metric value and trend
  - Secondary metrics in columns
  - Visual ranking indicator

Given David has selected accounts for comparison
When he chooses a primary sort metric
Then the accounts should be reordered by that metric
And ranking badges should update (1st, 2nd, 3rd, etc.)
And performance tiers should be indicated (Top 25%, Middle 50%, Bottom 25%)

Given David is viewing account comparisons
When he enables "Normalize by Spend"
Then all metrics should be displayed as per-dollar values
And the sort order should update accordingly
And a tooltip should explain the normalization method

Given David wants to visualize the comparison
When he clicks "View as Chart"
Then a grouped bar chart should display
And each account should be represented by a distinct color
And a legend should identify each account
And the chart should be interactive (hover for details)

Given David has a comparison configured
When he clicks "Export Comparison"
Then he should be able to choose format (Excel, CSV, PDF)
And the export should include all visible metrics
And formatting and sorting should be preserved
```

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Accounts have vastly different spend levels ($500 vs $500,000) | Normalization option prominently suggested; raw comparison available with warning |
| Some accounts missing data for comparison period | Show "Incomplete data" indicator; allow inclusion with asterisk |
| User selects more than 20 accounts | Display warning about comparison clarity; allow but recommend fewer |
| Accounts use different currencies | Convert to user's default currency with exchange rate notation |
| One account significantly skews averages | Outlier detection highlights the account; option to exclude from averages |
| No common metrics across selected accounts | Show only metrics available for all accounts; list unavailable metrics |

### Test Data Requirements

```yaml
comparison_accounts:
  - name: "Alpha Tech"
    spend: 45000
    conversions: 890
    roas: 4.2
    cpa: 50.56

  - name: "Beta Brands"
    spend: 120000
    conversions: 2100
    roas: 3.8
    cpa: 57.14

  - name: "Gamma Services"
    spend: 15000
    conversions: 180
    roas: 2.1
    cpa: 83.33

  - name: "Delta Retail"
    spend: 250000
    conversions: 5500
    roas: 5.1
    cpa: 45.45

  - name: "Epsilon Media"
    spend: 8000
    conversions: 45
    roas: 1.2
    cpa: 177.78

comparison_metrics:
  - roas
  - cpa
  - conversion_rate
  - ctr
  - cpm
  - total_spend
  - total_conversions
```

### Priority
**P0** - Critical for agency management and resource allocation

---

## UXS-010-05: Cost Tracking and Budget Monitoring

### Story ID
UXS-010-05

### Title
Cost Tracking and Budget Monitoring

### Persona
**Jennifer Walsh** - Finance Director who oversees marketing budgets across the organization. She needs to track actual spend against planned budgets, forecast end-of-period spending, and receive alerts when budgets are at risk. She is not a marketing expert but understands financial metrics.

### Scenario
Jennifer is monitoring Q1 budgets mid-quarter and needs to identify any campaigns or accounts that are overspending or underspending their allocated budgets. She wants to see pacing data to ensure budgets are being utilized appropriately without exceeding limits.

### User Goal
Track real-time advertising spend against budgets, view pacing forecasts, and receive proactive alerts when spending deviates from planned allocations.

### Preconditions
- User has finance or admin access level
- Budgets have been configured for accounts and campaigns
- Cost data is syncing from advertising platforms
- Budget period has started (at least 7 days of spend data)

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | User navigates to Analytics > Budget Monitoring | Budget dashboard loads with overview of all configured budgets |
| 2 | User views the budget health summary cards | Cards display: Total Budget, Total Spent, Remaining, Days Left, Projected Overage/Underage |
| 3 | User examines the budget pacing chart showing daily spend vs target | Chart shows actual spend line vs target pace line with variance shading |
| 4 | User scrolls to see account-level budget breakdown | Table shows each account with budget, spent, remaining, pacing status (On Track, Ahead, Behind) |
| 5 | User clicks on an account marked "At Risk - Ahead" | Detailed view shows daily spend, contributing campaigns, and forecast |
| 6 | User clicks "Set Alert" for this account | Alert configuration modal opens with threshold options |
| 7 | User configures alert: "Notify me when spend exceeds 90% of budget" | Alert is saved; confirmation shows active alert indicator |
| 8 | User navigates to "Budget Forecasting" tab | Forecast shows projected end-of-period spend based on current pace |
| 9 | User adjusts forecast assumptions (slowdown 20% in week 4) | Forecast recalculates and displays revised projection |
| 10 | User exports budget report for finance meeting | PDF/Excel export generated with budget vs actual data |

### Expected Outcomes
- Real-time spend data with maximum 4-hour latency
- Accurate pacing calculations based on budget period
- Forecasts update as more data becomes available
- Alerts trigger notifications via email and in-app
- Export provides finance-ready formatting

### Acceptance Criteria

```gherkin
Given Jennifer is on the Budget Monitoring dashboard
When the page loads
Then she should see budget health summary cards showing:
  | Metric             | Format     |
  | Total Budget       | Currency   |
  | Total Spent        | Currency   |
  | Remaining          | Currency   |
  | Days Remaining     | Number     |
  | Projected Variance | Currency   |

Given Jennifer is viewing budget pacing
When she examines the pacing chart
Then it should display:
  - Daily target spend line (straight line from period start to budget)
  - Actual cumulative spend line
  - Variance shading (green for under, red for over)
  - Projected trajectory (dashed line)

Given an account is pacing ahead of budget
When Jennifer views the account-level breakdown
Then the account should show:
  - "At Risk" or "Ahead" status badge
  - Percentage ahead of pace
  - Projected overspend amount
  - Days until budget exhaustion at current pace

Given Jennifer wants to set a budget alert
When she configures the alert thresholds
Then she should be able to set:
  - Percentage of budget threshold (e.g., 80%, 90%, 100%)
  - Notification channels (email, in-app, Slack)
  - Alert frequency (once, daily digest)

Given Jennifer adjusts forecast assumptions
When she modifies spending projections
Then the forecast should recalculate within 1 second
And the revised projection should be clearly labeled as "Adjusted Forecast"
And she should be able to save scenario for comparison
```

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Budget period has not started yet | Show budget amount with "Starts in X days" message; no pacing data |
| Spend exceeds budget | Show negative remaining with prominent warning; continue tracking |
| No budget configured for account | Account appears in list as "No budget set" with option to configure |
| Multiple currencies across accounts | Convert to user's currency; show original currency in tooltip |
| Irregular spending patterns (weekends off) | Smart pacing algorithm accounts for historical patterns |
| Budget changed mid-period | Calculate pacing from change date; show historical split |

### Test Data Requirements

```yaml
budget_configurations:
  - account: "Enterprise Client A"
    monthly_budget: 50000.00
    current_spend: 28500.00
    days_elapsed: 15
    days_remaining: 16
    pace_status: "ahead"
    projected_end: 58700.00

  - account: "SMB Client B"
    monthly_budget: 8000.00
    current_spend: 3200.00
    days_elapsed: 15
    days_remaining: 16
    pace_status: "behind"
    projected_end: 6400.00

  - account: "Growth Client C"
    monthly_budget: 25000.00
    current_spend: 12450.00
    days_elapsed: 15
    days_remaining: 16
    pace_status: "on_track"
    projected_end: 24900.00

alert_thresholds:
  - percentage: 80
  - percentage: 90
  - percentage: 100
  - percentage: 110
```

### Priority
**P0** - Critical for financial oversight and budget control

---

## UXS-010-06: Conversion Tracking and Attribution

### Story ID
UXS-010-06

### Title
Conversion Tracking and Attribution

### Persona
**Alex Rivera** - Performance Marketing Manager who needs to understand which marketing touchpoints drive conversions. Alex must justify marketing spend to stakeholders by demonstrating clear ROI and optimize campaigns based on true performance. They work with multi-channel campaigns across a complex customer journey.

### Scenario
Alex is analyzing the conversion path for the latest product launch campaign that ran across Google, Meta, LinkedIn, and email. They need to understand how each channel contributed to the 500 conversions recorded and determine the most effective attribution model for future budget allocation.

### User Goal
Analyze conversion attribution across multiple touchpoints and marketing channels to understand true campaign performance and optimize budget allocation.

### Preconditions
- Conversion tracking is properly configured with pixel/tag
- UTM parameters are consistently applied across channels
- At least 100 conversions have been recorded
- Attribution window is set (default: 30 days)
- User has analyst or higher access level

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | User navigates to Analytics > Attribution | Attribution dashboard loads with default last-touch model |
| 2 | User selects the product launch campaign from the campaign filter | Dashboard filters to show only conversions attributed to that campaign |
| 3 | User views the conversion path visualization | Sankey diagram shows user journeys from first touch to conversion |
| 4 | User switches attribution model to "Linear" using the model selector | All metrics recalculate; attribution shifts across channels |
| 5 | User compares Last-Touch vs Linear vs Time-Decay in comparison view | Side-by-side comparison shows how credit differs by model |
| 6 | User clicks on "Google Ads" channel in the visualization | Detailed breakdown shows specific campaigns, ad groups, and keywords |
| 7 | User enables "Multi-touch journey" view | Customer journeys display showing sequence of touchpoints |
| 8 | User filters to journeys with 3+ touchpoints | View updates to show only complex, multi-touch paths |
| 9 | User examines average time-to-conversion metric | Dashboard shows average days from first touch to conversion |
| 10 | User exports attribution data for presentation | CSV/Excel export with full attribution breakdown by model |

### Expected Outcomes
- Clear visualization of conversion paths and attribution
- Multiple attribution models available for comparison
- Channel and campaign-level attribution breakdown
- Path length and time-to-conversion insights
- Exportable data for external analysis

### Acceptance Criteria

```gherkin
Given Alex is on the Attribution dashboard
When the page loads
Then they should see the following attribution models available:
  | Model          | Description                                        |
  | Last-Touch     | 100% credit to final touchpoint                   |
  | First-Touch    | 100% credit to first touchpoint                   |
  | Linear         | Equal credit across all touchpoints               |
  | Time-Decay     | More credit to touchpoints closer to conversion   |
  | Position-Based | 40% first, 40% last, 20% middle                  |
  | Data-Driven    | AI-calculated based on conversion patterns        |

Given Alex has selected a campaign
When they view the conversion path visualization
Then they should see:
  - Sankey diagram showing flow from channels to conversions
  - Node sizes proportional to traffic/conversion volume
  - Interactive hover showing exact numbers
  - Ability to drill down into each channel

Given Alex compares multiple attribution models
When they view the comparison table
Then it should display:
  - Each channel as a row
  - Each model as a column
  - Attributed conversions under each model
  - Percentage change indicators between models

Given Alex is analyzing multi-touch journeys
When they view the path analysis
Then they should see:
  - Top converting paths (e.g., "Email > Google > Direct > Convert")
  - Average touchpoints before conversion
  - Average days from first touch to conversion
  - Path conversion rate
```

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Conversion has only one touchpoint | Appears as single-touch; all models attribute 100% to that touch |
| User converts, then converts again | Each conversion tracked separately with its own path |
| Touchpoint data is incomplete (missing UTMs) | Show as "Direct / Unknown" with option to investigate |
| Attribution window exceeded | Conversions outside window show "No attributed touchpoints" |
| Data-driven model has insufficient data | Fallback to position-based with message explaining requirement |
| Cross-device journey detected | Show "Cross-device" indicator if identity resolution is configured |

### Test Data Requirements

```yaml
conversion_paths:
  - path: ["Meta Ads", "Google Ads", "Email", "Direct"]
    conversions: 45
    avg_days: 12

  - path: ["Google Ads", "Direct"]
    conversions: 120
    avg_days: 3

  - path: ["LinkedIn Ads", "Email", "Google Ads", "Direct"]
    conversions: 28
    avg_days: 21

  - path: ["Direct"]
    conversions: 85
    avg_days: 1

attribution_by_model:
  google_ads:
    last_touch: 180
    first_touch: 120
    linear: 145
    time_decay: 165
    position_based: 140

  meta_ads:
    last_touch: 95
    first_touch: 150
    linear: 125
    time_decay: 110
    position_based: 130

  email:
    last_touch: 45
    first_touch: 30
    linear: 85
    time_decay: 55
    position_based: 65
```

### Priority
**P0** - Critical for demonstrating marketing ROI and optimization

---

## UXS-010-07: Real-Time Metrics Refresh

### Story ID
UXS-010-07

### Title
Real-Time Metrics Refresh

### Persona
**Chris Martinez** - Paid Media Specialist running time-sensitive campaigns including flash sales and product launches. Chris needs to monitor campaigns in real-time to make immediate optimizations and catch issues before they waste budget. They manage high-volume campaigns where minutes matter.

### Scenario
Chris is monitoring a 24-hour flash sale campaign with a $15,000 budget. The campaign launched 2 hours ago and they need to see real-time performance data to decide whether to increase budget or adjust targeting. Any lag in data could result in missed opportunities or wasted spend.

### User Goal
View advertising metrics with minimal latency to enable real-time campaign monitoring and rapid optimization decisions during time-sensitive campaigns.

### Preconditions
- Campaign is active with live traffic
- Real-time data connection is established with advertising platforms
- User has campaign management access
- WebSocket connection is supported by browser

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | User navigates to the flash sale campaign dashboard | Dashboard loads with "Real-time mode" indicator visible |
| 2 | User clicks "Enable Real-Time Refresh" toggle | Toggle activates; "Live" indicator pulses; metrics begin updating |
| 3 | User observes metrics updating automatically | Key metrics update every 30 seconds without page refresh |
| 4 | User sees a spike in CPC | Metric card highlights briefly to indicate significant change |
| 5 | User clicks on the CPC metric for details | Drill-down shows CPC by hour, audience segment, and placement |
| 6 | User adds specific metrics to "Watch List" | Selected metrics move to a persistent top bar for quick viewing |
| 7 | User sets a real-time alert: "Notify if ROAS drops below 2.0" | Alert configured; will trigger in-app notification if threshold crossed |
| 8 | Alert triggers due to ROAS drop | Toast notification appears with ROAS value and link to details |
| 9 | User pauses auto-refresh to analyze data | Refresh pauses; "Paused" indicator shows; resume button available |
| 10 | User clicks "Resume" to continue monitoring | Real-time refresh resumes; data catches up to current state |

### Expected Outcomes
- Metrics update within 60 seconds of actual platform data
- Visual indicators show when data is updating
- Significant changes are highlighted automatically
- Custom alert thresholds trigger immediate notifications
- System remains performant during extended monitoring sessions

### Acceptance Criteria

```gherkin
Given Chris is on an active campaign dashboard
When they enable real-time refresh
Then they should see:
  - "Live" indicator with pulsing animation
  - Last updated timestamp
  - Countdown to next refresh
  - Connection status indicator

Given real-time refresh is enabled
When the refresh interval elapses (every 30 seconds)
Then the following metrics should update automatically:
  | Metric        | Update Behavior                      |
  | Spend         | Increments smoothly                  |
  | Impressions   | Increments with animation            |
  | Clicks        | Increments with animation            |
  | CTR           | Recalculates                         |
  | Conversions   | Increments with highlight on change  |
  | ROAS          | Recalculates with highlight          |

Given a metric value changes significantly (>10% change)
When the update occurs
Then the metric card should:
  - Highlight briefly (1-2 seconds)
  - Show direction indicator (up/down arrow)
  - Display change amount

Given Chris has configured a real-time alert
When the threshold is crossed
Then they should receive:
  - In-app toast notification within 5 seconds
  - Sound notification (if enabled)
  - Email notification (if configured)
And the notification should include:
  - Metric name and current value
  - Threshold that was crossed
  - Link to campaign details

Given Chris pauses the real-time refresh
When they click "Resume"
Then the system should:
  - Fetch all data changes since pause
  - Display catchup summary (e.g., "12 updates while paused")
  - Resume normal refresh interval
```

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Network connection lost | Show "Connection lost" warning; retry automatically; use cached data |
| Platform API rate limited | Extend refresh interval; show "Reduced refresh rate" message |
| Browser tab in background | Reduce refresh frequency to conserve resources; catch up on focus |
| Multiple campaigns refreshing | Aggregate requests to avoid overload; prioritize user's current view |
| Stale data detected (timestamps don't match) | Show warning icon; provide manual refresh option |
| Very high traffic campaign (millions of impressions) | Use delta updates; aggregate for display; raw data available on drill-down |

### Test Data Requirements

```yaml
realtime_campaign:
  name: "Flash Sale - 24hr"
  status: "active"
  budget: 15000.00
  start_time: "2025-11-15T00:00:00Z"
  end_time: "2025-11-16T00:00:00Z"

metrics_stream:
  - timestamp: "2025-11-15T02:00:00Z"
    spend: 1250.00
    impressions: 125000
    clicks: 2850
    conversions: 42

  - timestamp: "2025-11-15T02:00:30Z"
    spend: 1262.50
    impressions: 126250
    clicks: 2878
    conversions: 43

alert_thresholds:
  - metric: "roas"
    condition: "less_than"
    value: 2.0

  - metric: "cpc"
    condition: "greater_than"
    value: 1.50
```

### Priority
**P1** - Important for time-sensitive campaign management

---

## UXS-010-08: Scheduled Report Delivery

### Story ID
UXS-010-08

### Title
Scheduled Report Delivery

### Persona
**Michelle Thompson** - Client Success Manager who manages ongoing reporting relationships with 8 key accounts. She needs to ensure clients receive consistent, timely reports without manual effort. She travels frequently and cannot always generate reports manually.

### Scenario
Michelle wants to set up automated weekly performance reports for her clients. Each client should receive a customized report every Monday morning with the previous week's performance data. She needs to configure this once and have it run reliably without intervention.

### User Goal
Configure automated report generation and delivery on a recurring schedule to ensure clients receive consistent, timely performance updates.

### Preconditions
- User has report scheduling permissions (Pro tier or above)
- Report templates exist for scheduling
- Client contact emails are configured
- Email delivery service is connected and verified

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | User navigates to Reports > Scheduled Reports | Scheduled reports management page loads showing existing schedules |
| 2 | User clicks "Create New Schedule" | Schedule configuration wizard opens |
| 3 | User selects report template: "Weekly Performance Summary" | Template selected; preview shows sample report |
| 4 | User chooses accounts: selects 3 clients from dropdown | Accounts added; system confirms data access |
| 5 | User configures frequency: "Weekly" on "Monday" at "8:00 AM" | Schedule preview shows next 4 delivery dates |
| 6 | User selects timezone: "America/New_York" | Delivery times adjust to selected timezone |
| 7 | User enters recipient emails: "client@company.com, cfo@company.com" | Email addresses validated; checkmarks appear |
| 8 | User configures email subject: "[AccountName] Weekly Performance - [DateRange]" | Preview shows interpolated subject line example |
| 9 | User adds optional email body message | Rich text editor opens for custom message |
| 10 | User enables "Send me a copy" option | User's email added to CC list |
| 11 | User clicks "Save and Activate" | Schedule saved; confirmation shows next delivery date |
| 12 | User views the schedule in the management list | New schedule appears with status "Active" and next run date |

### Expected Outcomes
- Reports generate and deliver at scheduled times reliably
- Each account receives its own customized report
- Email subject and body support dynamic placeholders
- Failed deliveries trigger retry and notification
- Schedule history tracks all deliveries and statuses

### Acceptance Criteria

```gherkin
Given Michelle is creating a scheduled report
When she configures the schedule
Then she should be able to select:
  | Option          | Values                                           |
  | Frequency       | Daily, Weekly, Bi-weekly, Monthly                |
  | Day(s)          | Specific days of week or month                   |
  | Time            | Hour selection in 30-min increments              |
  | Timezone        | Full timezone list                               |

Given Michelle has configured a schedule
When she adds recipient emails
Then the system should:
  - Validate email format
  - Allow multiple recipients (comma or semicolon separated)
  - Support CC and BCC options
  - Remember previously used recipient emails

Given Michelle uses dynamic placeholders in subject/body
When the report is generated
Then placeholders should be replaced:
  | Placeholder      | Replaced With                    |
  | [AccountName]    | Actual account name              |
  | [DateRange]      | Report period (e.g., "Jan 1-7")  |
  | [ReportName]     | Template name                    |
  | [DeliveryDate]   | Actual delivery date             |

Given a scheduled report is active
When the scheduled time arrives
Then the system should:
  - Generate the report with current data
  - Attach as PDF to email
  - Send to all configured recipients
  - Log the delivery in schedule history
  - Update "Last Delivered" timestamp

Given a scheduled delivery fails
When the failure is detected
Then the system should:
  - Retry up to 3 times over 2 hours
  - Notify the schedule owner after final failure
  - Log the failure reason in history
  - Maintain schedule for next occurrence
```

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Report has no data for the period | Generate report with "No data available" message; still deliver |
| Recipient email bounces | Mark recipient as invalid; continue to other recipients; notify owner |
| Schedule time falls during maintenance | Queue for delivery immediately after maintenance window |
| Daylight saving time change | Adjust delivery time to maintain consistency (e.g., 8 AM stays 8 AM) |
| Account is deactivated after schedule created | Skip account; include note in delivery; notify schedule owner |
| Multiple schedules for same account same time | Consolidate into single email with multiple report attachments |

### Test Data Requirements

```yaml
schedule_configurations:
  - name: "Weekly Client Reports"
    template: "Weekly Performance Summary"
    frequency: "weekly"
    day: "monday"
    time: "08:00"
    timezone: "America/New_York"
    accounts:
      - "Stellar Brands"
      - "TechCorp Inc"
      - "Growth Partners"
    recipients:
      - to: "client@stellarbrands.com"
      - cc: "michelle@agency.com"
    subject: "[AccountName] Weekly Performance - [DateRange]"
    status: "active"

  - name: "Monthly Executive Summary"
    template: "Executive Summary"
    frequency: "monthly"
    day: "1"
    time: "09:00"
    timezone: "UTC"
    accounts:
      - "Enterprise Account"
    recipients:
      - to: "cfo@enterprise.com"
      - to: "cmo@enterprise.com"
      - bcc: "records@agency.com"
    status: "active"

delivery_history:
  - schedule_id: "sched_001"
    delivery_date: "2025-11-11"
    status: "delivered"
    recipients_success: 3
    recipients_failed: 0

  - schedule_id: "sched_001"
    delivery_date: "2025-11-04"
    status: "partial_failure"
    recipients_success: 2
    recipients_failed: 1
    failure_reason: "Email bounced: invalid@fake.com"
```

### Priority
**P1** - Important for automated client communication

---

## UXS-010-09: Data Visualization and Chart Customization

### Story ID
UXS-010-09

### Title
Data Visualization and Chart Customization

### Persona
**Lisa Chen** - Marketing Analyst who creates presentations for internal stakeholders. She needs to build compelling visualizations that tell a clear story. Standard charts often don't convey the narrative effectively, so she requires extensive customization options.

### Scenario
Lisa is preparing a quarterly business review presentation and needs to create custom visualizations that highlight campaign performance trends. She wants to customize colors to match brand guidelines, add annotations for key events, and create combination charts that show multiple metrics together.

### User Goal
Create customized data visualizations with full control over styling, annotations, and chart types to effectively communicate performance insights.

### Preconditions
- User has analyst or higher access level
- Data for the desired period is available
- User is in a chart editing context (dashboard, report builder, or standalone)
- Charting library is loaded and functional

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | User clicks "Create Visualization" from the analytics menu | Chart creation wizard opens with type selection |
| 2 | User selects "Combination Chart" from available types | Combination chart template loads with configuration panel |
| 3 | User selects data source: "Campaign Performance - Q4 2025" | Data loads; available metrics appear in the field selector |
| 4 | User drags "Spend" to left Y-axis and "Conversions" to right Y-axis | Dual-axis chart appears with both metrics plotted |
| 5 | User changes "Spend" visualization to "Bar" and "Conversions" to "Line" | Chart updates to show bars for spend, line for conversions |
| 6 | User opens color panel and selects brand colors (#1E3A8A for spend, #10B981 for conversions) | Chart colors update immediately |
| 7 | User clicks "Add Annotation" and marks November 15: "Black Friday Sale" | Vertical annotation line appears with label |
| 8 | User enables data labels for the line chart | Conversion values appear at each data point |
| 9 | User customizes legend position to "Bottom" with horizontal layout | Legend moves below chart with horizontal arrangement |
| 10 | User adjusts chart title, axis labels, and adds a subtitle | Text elements update; preview reflects changes |
| 11 | User clicks "Save to Dashboard" | Chart is added to selected dashboard with all customizations |

### Expected Outcomes
- Full control over chart appearance and styling
- Annotations help contextualize data with business events
- Combination charts effectively show metric relationships
- Customizations persist when saved and shared
- Charts are responsive and work at different sizes

### Acceptance Criteria

```gherkin
Given Lisa is creating a visualization
When she selects chart type
Then she should see the following options:
  | Category      | Chart Types                                    |
  | Comparison    | Bar, Column, Grouped Bar, Stacked Bar         |
  | Trend         | Line, Area, Stacked Area, Step                |
  | Distribution  | Pie, Donut, Treemap                           |
  | Relationship  | Scatter, Bubble                               |
  | Combination   | Dual-axis, Combo                              |
  | Advanced      | Funnel, Gauge, Heatmap, Sankey                |

Given Lisa is customizing chart appearance
When she opens the styling panel
Then she should be able to configure:
  - Colors (individual series, palette, or custom hex)
  - Line styles (solid, dashed, dotted)
  - Point markers (circle, square, triangle, none)
  - Bar/column width
  - Axis formatting (min, max, intervals, format)
  - Grid lines (on/off, color, style)

Given Lisa wants to add annotations
When she clicks "Add Annotation"
Then she should be able to:
  - Add vertical line at specific date/point
  - Add horizontal threshold line at value
  - Add text annotation at any position
  - Customize annotation color and style
  - Link annotation to specific data event

Given Lisa has customized a chart
When she saves the visualization
Then all customizations should persist including:
  - Colors and styling
  - Annotations
  - Axis configuration
  - Legend position
  - Data label settings
And the chart should render identically when loaded again
```

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Data series have very different scales | Suggest dual-axis; provide automatic scale adjustment |
| Too many data points for readable labels | Auto-hide labels; show on hover; offer aggregation |
| Color choices have poor contrast | Accessibility warning; suggest alternative colors |
| Chart resized to very small dimension | Graceful degradation; hide non-essential elements; maintain readability |
| Null or missing data points | Show gap in line chart; skip bar; indicate missing data |
| User attempts unsupported combination | Show error message explaining incompatibility |

### Test Data Requirements

```yaml
visualization_data:
  period: "Q4 2025"
  granularity: "daily"
  metrics:
    - name: "Spend"
      type: "currency"
      values: [1200, 1350, 1180, ...]  # 92 days

    - name: "Conversions"
      type: "integer"
      values: [45, 52, 38, ...]

    - name: "ROAS"
      type: "decimal"
      values: [3.2, 3.8, 2.9, ...]

annotations:
  - date: "2025-11-15"
    label: "Black Friday Sale"
    type: "vertical_line"

  - date: "2025-11-29"
    label: "Cyber Monday"
    type: "vertical_line"

  - value: 3.0
    label: "ROAS Target"
    type: "horizontal_line"

chart_configurations:
  - type: "combo"
    series:
      - metric: "Spend"
        chart_type: "bar"
        axis: "left"
        color: "#1E3A8A"
      - metric: "Conversions"
        chart_type: "line"
        axis: "right"
        color: "#10B981"
```

### Priority
**P1** - Important for data storytelling and presentations

---

## UXS-010-10: Analytics Data Export and Integration

### Story ID
UXS-010-10

### Title
Analytics Data Export and Integration

### Persona
**Robert Kim** - Business Intelligence Developer who needs to pull data from Bottleneck-Bots into the company's data warehouse for deeper analysis. He integrates multiple data sources and builds custom dashboards in Tableau. He requires programmatic access and bulk data export capabilities.

### Scenario
Robert is building a comprehensive marketing analytics solution in Snowflake that combines data from Bottleneck-Bots with CRM and sales data. He needs to set up automated data exports that feed the warehouse daily and also requires API access for real-time data pulls.

### User Goal
Export analytics data in bulk and integrate with external systems through automated exports and API access for comprehensive cross-platform analysis.

### Preconditions
- User has admin or developer access level
- API access is enabled for the organization
- Export/integration features are included in subscription tier
- Destination system (warehouse, BI tool) is prepared to receive data

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | User navigates to Settings > Integrations & Exports | Integration hub loads with available options |
| 2 | User clicks on "API Access" section | API configuration panel shows current API keys and documentation links |
| 3 | User clicks "Generate New API Key" | Modal appears with scope selection options |
| 4 | User configures key: Read-only, Analytics scope, expiration 1 year | Key generated; displayed once with copy button and security warning |
| 5 | User downloads API documentation (OpenAPI/Swagger format) | Documentation file downloads; includes endpoints, schemas, examples |
| 6 | User navigates to "Automated Exports" section | Export configuration list shows existing schedules |
| 7 | User clicks "New Export Schedule" | Export configuration wizard opens |
| 8 | User selects data type: "Campaign Performance Metrics" | Available fields for export appear in selectable list |
| 9 | User selects fields: Date, Campaign, Spend, Impressions, Clicks, Conversions | Selected fields highlighted; preview table shows sample data |
| 10 | User configures destination: "Amazon S3" with bucket URL and credentials | Connection tested; success confirmation displayed |
| 11 | User sets schedule: Daily at 2:00 AM UTC | Schedule saved; first run scheduled for next occurrence |
| 12 | User enables "Include incremental updates only" option | System confirms delta-only export configuration |

### Expected Outcomes
- API provides programmatic access to all analytics data
- Bulk exports support common formats (CSV, JSON, Parquet)
- Automated exports run reliably on schedule
- Multiple destination types supported (S3, GCS, SFTP, webhooks)
- Data integrity is maintained across all export methods

### Acceptance Criteria

```gherkin
Given Robert is configuring API access
When he generates a new API key
Then he should be able to configure:
  | Setting        | Options                                   |
  | Permissions    | Read-only, Read-write                     |
  | Scope          | All, Analytics, Campaigns, Reports        |
  | Expiration     | 30 days, 90 days, 1 year, Never          |
  | IP Whitelist   | Optional IP restrictions                  |

Given Robert has an API key
When he accesses the API documentation
Then it should include:
  - Full endpoint reference
  - Authentication examples
  - Request/response schemas
  - Rate limiting information
  - Code examples (Python, JavaScript, cURL)

Given Robert is configuring an automated export
When he selects data types
Then he should see available options:
  | Data Type               | Available Granularities    |
  | Campaign Performance    | Daily, Weekly, Monthly     |
  | Ad Performance          | Daily, Hourly              |
  | Conversion Data         | Event-level, Daily         |
  | Budget & Spend          | Daily, Monthly             |
  | Attribution Data        | Event-level                |

Given Robert configures a destination
When he enters credentials and tests connection
Then the system should:
  - Validate credentials format
  - Attempt test connection
  - Write sample file to confirm access
  - Report success or detailed error

Given an export schedule is active
When the scheduled time occurs
Then the system should:
  - Generate data file in configured format
  - Upload to destination
  - Log success/failure with details
  - Retry on transient failures (up to 3 times)
  - Send notification to configured email on failure
```

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| API rate limit exceeded | Return 429 status with retry-after header; log for monitoring |
| Export file exceeds size limit (>5GB) | Split into multiple files with sequence numbers; include manifest |
| Destination credentials expire | Mark export as failed; notify owner; pause schedule until fixed |
| Schema change in source data | Include schema version in export; notify of breaking changes |
| Concurrent export requests for same data | Queue requests; return job ID for status polling |
| Historical backfill requested (large date range) | Process in chunks; provide job progress updates |

### Test Data Requirements

```yaml
api_endpoints:
  - path: "/v1/campaigns"
    method: "GET"
    parameters:
      - account_id (required)
      - start_date
      - end_date
      - fields
      - page_size
      - cursor
    response_format: "JSON"

  - path: "/v1/metrics/daily"
    method: "GET"
    parameters:
      - account_id (required)
      - campaign_ids
      - start_date (required)
      - end_date (required)
    response_format: "JSON"

export_destinations:
  - type: "amazon_s3"
    config:
      bucket: "client-data-exports"
      prefix: "bottleneck-bots/"
      region: "us-east-1"

  - type: "google_cloud_storage"
    config:
      bucket: "analytics-data"
      prefix: "exports/"

  - type: "sftp"
    config:
      host: "sftp.company.com"
      port: 22
      path: "/imports/marketing/"

  - type: "webhook"
    config:
      url: "https://api.company.com/data-ingestion"
      auth_type: "bearer"

sample_export_data:
  format: "csv"
  fields:
    - date
    - account_id
    - campaign_id
    - campaign_name
    - spend
    - impressions
    - clicks
    - conversions
  row_count: 10000
  file_size: "2.5MB"
```

### Priority
**P2** - Important for enterprise data integration needs

---

## Summary

| Story ID | Title | Priority | Primary Persona |
|----------|-------|----------|-----------------|
| UXS-010-01 | Executive Dashboard KPI Viewing | P0 | CMO / Executive |
| UXS-010-02 | PDF Report Generation and Export | P0 | Account Manager |
| UXS-010-03 | Custom Report Building with Drag-and-Drop | P1 | Analytics Lead |
| UXS-010-04 | Sub-Account Performance Comparison | P0 | Operations Director |
| UXS-010-05 | Cost Tracking and Budget Monitoring | P0 | Finance Director |
| UXS-010-06 | Conversion Tracking and Attribution | P0 | Performance Manager |
| UXS-010-07 | Real-Time Metrics Refresh | P1 | Paid Media Specialist |
| UXS-010-08 | Scheduled Report Delivery | P1 | Client Success Manager |
| UXS-010-09 | Data Visualization and Chart Customization | P1 | Marketing Analyst |
| UXS-010-10 | Analytics Data Export and Integration | P2 | BI Developer |

---

## Testing Notes

### Test Environment Requirements
- Multiple test accounts with varying data volumes
- Configured branding assets for report testing
- Active campaigns for real-time testing
- Email delivery sandbox for schedule testing
- API testing environment with rate limiting disabled

### Recommended Test Execution Order
1. UXS-010-01 (Executive Dashboard) - Foundation for all analytics
2. UXS-010-05 (Budget Monitoring) - Financial controls
3. UXS-010-06 (Attribution) - Core analytics functionality
4. UXS-010-04 (Account Comparison) - Multi-account features
5. UXS-010-02 (PDF Reports) - Export capabilities
6. UXS-010-08 (Scheduled Delivery) - Automation
7. UXS-010-07 (Real-Time Refresh) - Live monitoring
8. UXS-010-03 (Custom Reports) - Advanced features
9. UXS-010-09 (Visualizations) - Customization
10. UXS-010-10 (Data Export) - Integration features

---

*Document maintained by QA Team. Last review: 2026-01-11*
