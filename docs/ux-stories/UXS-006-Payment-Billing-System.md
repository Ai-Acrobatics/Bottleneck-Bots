# UX Stories: Payment & Billing System

**Document ID:** UXS-006
**Feature:** Payment & Billing System
**Version:** 1.0
**Last Updated:** January 11, 2026
**Author:** QA Testing Team

---

## Overview

This document contains comprehensive User Experience Stories for the Bottleneck-Bots Payment & Billing System. These stories are designed to support testing and validation of all payment, subscription, and billing functionality including Stripe integration, credit management, and invoice handling.

### Subscription Tiers Reference

| Tier | Monthly Price | Workflows | Executions | API Credits | Team Members |
|------|--------------|-----------|------------|-------------|--------------|
| Starter | $49/mo | 5 | 500 | 10,000 | 2 |
| Growth | $149/mo | 25 | 5,000 | 100,000 | 10 |
| Enterprise | Custom | Unlimited | Custom | Custom | Unlimited |

### Credit Types

- **Enrichment Credits**: Used for lead enrichment operations
- **Calling Credits**: Used for voice calling features
- **Scraping Credits**: Used for browser automation and data extraction

---

## UXS-006-01: Subscription Tier Selection and Purchase

### Story ID
UXS-006-01

### Title
New User Completes Subscription Tier Selection and Initial Purchase

### Persona
**Sarah Chen** - Marketing Agency Owner, 42 years old. Runs a small digital marketing agency with 8 employees. She has just completed the free trial and is ready to commit to a paid subscription. She values clear pricing, predictable costs, and the ability to scale as her agency grows.

### Scenario
Sarah has been using Bottleneck-Bots during a 14-day free trial. Her trial is expiring in 2 days, and she has received an email reminder. She wants to select the Growth tier because her agency manages 25+ client accounts and needs the additional workflow capacity. She prefers monthly billing to start but wants to understand the annual discount option.

### User Goal
Select and purchase the Growth subscription tier with monthly billing, successfully completing payment through Stripe Checkout.

### Preconditions
1. User has an active account with email verified
2. User has completed the free trial onboarding
3. User is logged into the platform
4. User has a valid payment method ready (credit card)
5. Stripe integration is active and configured
6. User's account status is "trialing" or "trial_expired"

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | Sarah clicks on "Upgrade" button in the trial expiration banner | System displays the Subscription Plans page with all three tiers prominently displayed |
| 2 | Sarah reviews the plan comparison table | System shows feature comparison matrix with Starter, Growth, and Enterprise tiers side by side, with her current usage metrics highlighted |
| 3 | Sarah hovers over the Growth tier card | System highlights the Growth tier card and shows "Most Popular" badge if applicable |
| 4 | Sarah clicks "View Annual Pricing" toggle | System recalculates and displays annual pricing with 20% discount ($1,432/year vs $1,788/year), showing monthly equivalent ($119/mo) |
| 5 | Sarah toggles back to "Monthly" billing | System reverts to monthly pricing display ($149/mo) |
| 6 | Sarah clicks "Select Growth Plan" button | System displays plan confirmation modal showing: plan name, price, billing cycle, included features, and "Proceed to Payment" button |
| 7 | Sarah reviews the confirmation and clicks "Proceed to Payment" | System redirects to Stripe Checkout page with pre-filled plan details |
| 8 | Sarah enters payment card details (4242 4242 4242 4242, any future expiry, any CVC) | Stripe validates card format in real-time with visual checkmarks |
| 9 | Sarah enters billing address information | Stripe auto-completes address where possible |
| 10 | Sarah clicks "Subscribe" button | Stripe processes payment and shows loading indicator (max 3 seconds) |
| 11 | Payment succeeds | System redirects to success page showing: confirmation message, subscription details, next billing date, and "Go to Dashboard" button |
| 12 | Sarah clicks "Go to Dashboard" | System redirects to main dashboard with updated subscription status in header and a welcome modal for Growth tier |

### Expected Outcomes
1. User successfully subscribes to Growth tier
2. Stripe subscription is created with status "active"
3. User record updated with new plan_id and subscription status
4. Credit balances initialized: 100,000 API credits allocated
5. Execution limit set to 5,000/month
6. Team member limit increased to 10
7. Confirmation email sent with invoice PDF attached
8. First invoice generated and available in billing section
9. Next billing date correctly calculated (30 days from now)
10. User can immediately access Growth tier features

### Acceptance Criteria

```gherkin
Given I am a user with an active trial account
And I am on the Subscription Plans page
When I select the Growth tier with monthly billing
And I complete the Stripe Checkout process with valid payment details
Then my subscription status should be "active"
And my plan should be "Growth"
And I should receive 100,000 API credits
And I should see a confirmation page with my subscription details
And I should receive a confirmation email within 5 minutes
And my dashboard should reflect the new subscription tier

Given I am viewing the subscription plans page
When I toggle between monthly and annual billing
Then the prices should update to reflect the 20% annual discount
And the savings amount should be clearly displayed

Given I am on the Stripe Checkout page
When I enter invalid card details
Then I should see a clear error message explaining the issue
And I should be able to correct my payment information
And the form should not submit until valid

Given I have successfully subscribed
When I navigate to Settings > Billing
Then I should see my current plan details
And I should see my next billing date
And I should see my credit balance initialized correctly
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|------------------|
| User navigates away during Stripe Checkout | No subscription created, user returned to plans page with session preserved |
| Payment card is declined | Stripe shows decline message, user can try different card, no subscription created |
| User's trial expired mid-checkout | Checkout still completes, subscription activates immediately |
| Network timeout during payment | Stripe shows retry option, idempotency key prevents duplicate charges |
| User already has active subscription | "Select Plan" button changes to "Change Plan" with upgrade/downgrade flow |
| Stripe webhook fails | System implements retry logic, manual fulfillment endpoint available |
| User closes browser after payment but before redirect | Webhook ensures subscription is still created, user sees active subscription on next login |

### Test Data Requirements

| Data Type | Test Values |
|-----------|-------------|
| Test Credit Card (Success) | 4242 4242 4242 4242, any future date, any CVC |
| Test Credit Card (Decline) | 4000 0000 0000 0002 |
| Test Credit Card (Requires Auth) | 4000 0025 0000 3155 |
| Test Email | sarah.chen+test@bottleneckbots.com |
| Growth Plan Stripe Price ID | price_growth_monthly_test |
| Test Customer ID | cus_test_sarah_chen |

### Priority
**P0** - Critical path for monetization

---

## UXS-006-02: Credit Pack Purchase Flow

### Story ID
UXS-006-02

### Title
User Purchases Additional Credit Pack When Running Low on Credits

### Persona
**Marcus Johnson** - Real Estate Broker, 38 years old. Active Growth tier subscriber who runs high-volume lead enrichment campaigns. He frequently uses more credits than his plan includes and needs to purchase execution packs to continue operations without interruption.

### Scenario
Marcus is running a large lead enrichment campaign for a new real estate development. He has used 85,000 of his 100,000 monthly API credits and needs to enrich another 30,000 leads before the end of the month. He wants to purchase an additional credit pack to complete his campaign without waiting for the monthly reset.

### User Goal
Purchase a 20,000 execution credit pack to supplement his existing credits and continue lead enrichment operations.

### Preconditions
1. User has active Growth subscription
2. User has used 85% of monthly credits (85,000/100,000)
3. User has valid payment method on file
4. Credit packs are enabled for user's subscription tier
5. User is logged into the platform

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | Marcus sees low credit warning banner on dashboard: "You have 15,000 credits remaining" | System displays prominent but non-intrusive banner with "Buy More Credits" CTA |
| 2 | Marcus clicks "Buy More Credits" | System navigates to Credit Marketplace page showing available credit packs |
| 3 | Marcus reviews credit pack options | System displays three pack options: 1,000 ($29), 5,000 ($99 - 20% off), 20,000 ($299 - 40% off) with savings highlighted |
| 4 | Marcus selects the 20,000 credit pack | System highlights selected pack and shows "Add to Cart" button |
| 5 | Marcus clicks "Add to Cart" | System shows cart summary: 20,000 credits, $299, with "Checkout" button |
| 6 | Marcus clicks "Checkout" | System presents payment confirmation with saved payment method shown |
| 7 | Marcus confirms using saved card ending in 4242 | System shows "Confirm Purchase" button with total amount |
| 8 | Marcus clicks "Confirm Purchase" | System processes payment via Stripe (max 3 seconds) |
| 9 | Payment succeeds | System shows success modal: "20,000 credits added to your account!" |
| 10 | Marcus clicks "Continue" | System returns to dashboard with updated credit balance: 35,000 credits |
| 11 | Marcus checks credit transaction history | System shows new transaction: "+20,000 credits (Purchase)" with timestamp |

### Expected Outcomes
1. Credit pack purchase completes successfully
2. 20,000 credits added to user's balance immediately
3. New balance reflects: 15,000 (existing) + 20,000 (purchased) = 35,000 credits
4. Credit transaction logged with type "purchase"
5. Payment receipt email sent to user
6. Invoice generated in billing section
7. Add-on credits marked with expiration date (end of billing period)
8. Usage tracking continues normally with combined credit pool

### Acceptance Criteria

```gherkin
Given I am a Growth tier subscriber with 15,000 remaining credits
And I am on the Credit Marketplace page
When I select the 20,000 credit pack ($299)
And I confirm purchase with my saved payment method
Then my credit balance should increase to 35,000 immediately
And I should see a success confirmation message
And a credit transaction should be logged as "purchase"
And I should receive a receipt email within 5 minutes

Given I have purchased an add-on credit pack
When I view my credit balance details
Then I should see the add-on credits distinguished from subscription credits
And I should see the expiration date for add-on credits

Given I am viewing credit pack options
When I compare the pack prices
Then I should see the per-credit cost for each pack
And I should see the percentage savings for bulk packs
And the best value pack should be highlighted

Given I do not have a saved payment method
When I attempt to purchase a credit pack
Then I should be prompted to enter payment details
And I should have the option to save the card for future purchases
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|------------------|
| User purchases multiple packs in quick succession | Each purchase processed and credits added, no duplicate charges |
| User has no saved payment method | Redirect to Stripe Checkout with pack details pre-filled |
| Saved payment method expired | Prompt to update payment method before purchase |
| User attempts to purchase with zero balance | Purchase proceeds (credits are additive, not replacement) |
| Credit pack purchase during peak usage | Queue purchase, confirm when processed, credits added retroactively |
| User cancels during checkout | No charge, return to marketplace, cart preserved |
| User at maximum credit cap (if applicable) | Show warning, allow purchase with explanation of cap |

### Test Data Requirements

| Data Type | Test Values |
|-----------|-------------|
| Initial Credit Balance | 15,000 |
| Pack Options | 1,000 ($29), 5,000 ($99), 20,000 ($299) |
| Test User ID | marcus_johnson_test_001 |
| Saved Payment Method | pm_card_visa ending 4242 |
| Stripe Payment Intent | pi_test_credit_pack_001 |

### Priority
**P0** - Critical for revenue and user retention

---

## UXS-006-03: Usage Tracking and Cost Monitoring

### Story ID
UXS-006-03

### Title
User Monitors Real-Time Usage and Cost Across Multiple Credit Types

### Persona
**Jennifer Walsh** - Agency Operations Manager, 35 years old. Manages budgets and operations for a mid-size marketing agency on the Enterprise tier. She needs to track usage across all team members, monitor costs, and forecast future spending to stay within budget.

### Scenario
Jennifer needs to prepare a monthly usage report for her CFO. She wants to see detailed breakdowns of how credits are being used across different operations (enrichment, calling, scraping), which team members are consuming the most resources, and project future costs based on current trends.

### User Goal
Access comprehensive usage analytics, understand cost allocation by operation type and team member, and export data for financial reporting.

### Preconditions
1. User has Enterprise subscription with admin permissions
2. Multiple team members have been using the platform for 3+ weeks
3. Various credit types have been consumed (enrichment, calling, scraping)
4. User has access to Usage Analytics section
5. Historical usage data exists in the system

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | Jennifer navigates to Settings > Usage & Billing | System displays Usage Dashboard with summary cards showing current period usage |
| 2 | Jennifer views the overview cards | System shows: Total Credits Used (45,230/100,000), Days Remaining (12), Projected Overage (None), Cost This Period ($2,340) |
| 3 | Jennifer clicks on "Credit Breakdown" tab | System displays pie chart showing usage by credit type: Enrichment (60%), Calling (25%), Scraping (15%) |
| 4 | Jennifer selects date range "Last 30 Days" | System updates all charts and metrics for the selected period |
| 5 | Jennifer clicks on "Usage by Team Member" | System shows bar chart with top 10 users by credit consumption, with drill-down capability |
| 6 | Jennifer clicks on specific team member (John Smith - 12,450 credits) | System expands to show John's usage breakdown by operation type and day |
| 7 | Jennifer clicks on "Cost Analysis" tab | System displays cost breakdown: per-operation costs, daily spend chart, projected monthly total |
| 8 | Jennifer hovers over a specific day on the daily spend chart | System shows tooltip: date, total credits used, cost, top operations that day |
| 9 | Jennifer clicks "Export Report" | System shows export options: CSV, PDF, or Excel format |
| 10 | Jennifer selects "PDF" and clicks "Generate" | System generates comprehensive PDF report (max 10 seconds) |
| 11 | Jennifer downloads the PDF | System downloads file: "Usage_Report_Dec2025.pdf" |
| 12 | Jennifer clicks "Set Budget Alert" | System shows budget alert configuration modal |
| 13 | Jennifer sets alert at 80% and 95% of monthly budget | System saves alert preferences and confirms setup |

### Expected Outcomes
1. User views accurate real-time usage metrics
2. Usage breakdown by credit type is displayed correctly
3. Team member usage attribution is accurate
4. Cost calculations reflect actual credit costs
5. Historical data is available for trend analysis
6. Export functionality generates complete reports
7. Budget alerts are configured and saved
8. All data refreshes in near real-time (< 60 seconds lag)

### Acceptance Criteria

```gherkin
Given I am an admin user on the Enterprise tier
And my team has consumed credits in the current billing period
When I navigate to the Usage Dashboard
Then I should see accurate total credits used vs allocated
And I should see remaining days in billing period
And I should see projected usage at current rate

Given I am viewing the Credit Breakdown tab
When I view the usage by credit type chart
Then the percentages should sum to 100%
And clicking a segment should show detailed breakdown

Given I am viewing the Usage by Team Member section
When I click on a specific team member
Then I should see their individual usage breakdown
And the breakdown should match the total shown in the list

Given I want to export a usage report
When I select PDF format and click Generate
Then a PDF should be generated within 10 seconds
And the PDF should contain all visible metrics and charts
And the file should be downloadable

Given I set a budget alert at 80%
When my team reaches 80% of monthly credit allocation
Then I should receive an email notification
And I should see an in-app notification
And the dashboard should highlight the alert status
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|------------------|
| No usage data for selected period | Show empty state with message "No usage data for selected period" |
| Team member removed mid-period | Usage attributed to "Former Member" with user ID reference |
| Usage data still processing | Show "Data updating..." indicator, display last available data |
| Very high usage (millions of credits) | Numbers formatted appropriately (e.g., 1.2M credits) |
| Export times out | Show error with retry option, offer email delivery alternative |
| Budget alert threshold already exceeded | Show current status as "Exceeded" with overage amount |
| Multiple users viewing same dashboard | All see consistent data, no conflicts |

### Test Data Requirements

| Data Type | Test Values |
|-----------|-------------|
| Total Credits Allocated | 100,000 |
| Credits Used | 45,230 |
| Team Member Count | 15 |
| Date Range | Last 30 days |
| Credit Type Distribution | Enrichment: 60%, Calling: 25%, Scraping: 15% |
| Test Admin User | jennifer_walsh_test_admin |
| Sample Team Members | John Smith, Jane Doe, Mike Brown (with varying usage) |

### Priority
**P1** - Important for enterprise customers and financial management

---

## UXS-006-04: Invoice Viewing and Download

### Story ID
UXS-006-04

### Title
User Accesses and Downloads Historical Invoices for Expense Reporting

### Persona
**David Park** - Finance Director, 48 years old. Responsible for processing expenses and maintaining financial records for his company. He needs to access invoices monthly for accounting purposes and occasionally needs to pull historical invoices for audits.

### Scenario
David needs to download the last 6 months of invoices to submit to his accounting department for quarterly reconciliation. He also needs to verify that a specific invoice from 3 months ago matches a charge on the company credit card statement.

### User Goal
Access invoice history, view invoice details, download individual and bulk invoices in PDF format.

### Preconditions
1. User has billing admin permissions
2. Account has 6+ months of billing history
3. Multiple invoices exist (subscription + add-on purchases)
4. User is logged into the platform
5. Stripe invoices are synced to the platform

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | David navigates to Settings > Billing > Invoices | System displays Invoice History page with sortable table of all invoices |
| 2 | David views the invoice list | System shows columns: Invoice #, Date, Description, Amount, Status, Actions |
| 3 | David clicks "Filter" and selects last 6 months | System filters table to show only invoices from specified date range |
| 4 | David identifies invoice #INV-2025-1089 that needs verification | Invoice row shows: Oct 15, 2025, "Growth Plan - Monthly", $149.00, Paid |
| 5 | David clicks "View" on invoice #INV-2025-1089 | System opens invoice detail modal showing full invoice information |
| 6 | David reviews invoice details | System displays: company details, billing address, line items, subtotal, tax, total, payment method used, payment date |
| 7 | David clicks "Download PDF" | System downloads invoice PDF: "Invoice_INV-2025-1089.pdf" |
| 8 | David returns to invoice list and clicks "Select All" checkbox | System selects all visible invoices (6 invoices) |
| 9 | David clicks "Download Selected" | System shows "Preparing bulk download..." (max 15 seconds) |
| 10 | Bulk download completes | System downloads ZIP file: "Invoices_Jul-Dec_2025.zip" containing 6 PDFs |
| 11 | David clicks on invoice with status "Payment Failed" | System shows invoice with warning banner and "Update Payment Method" CTA |
| 12 | David clicks "Email Invoice" on a specific invoice | System sends invoice PDF to registered billing email within 2 minutes |

### Expected Outcomes
1. All invoices are displayed in chronological order (newest first)
2. Invoice filtering by date range works correctly
3. Individual invoice details match Stripe records exactly
4. PDF downloads are properly formatted with all required information
5. Bulk download creates valid ZIP with all selected invoices
6. Failed invoice status is clearly indicated with resolution path
7. Email delivery of invoices works reliably

### Acceptance Criteria

```gherkin
Given I am a user with billing admin permissions
And I have invoices in the system
When I navigate to the Invoice History page
Then I should see all my invoices listed
And invoices should be sorted by date (newest first)
And each invoice should show number, date, description, amount, and status

Given I am viewing the invoice list
When I filter by date range "Last 6 months"
Then only invoices within that range should be displayed
And the filter selection should be visible

Given I click "View" on a specific invoice
When the invoice detail modal opens
Then I should see complete invoice information
And all line items should be itemized
And tax calculations should be displayed if applicable

Given I select multiple invoices
When I click "Download Selected"
Then a ZIP file should be downloaded
And the ZIP should contain individual PDF files for each invoice
And each PDF should be properly named

Given an invoice has "Payment Failed" status
When I view that invoice
Then I should see a clear warning indicator
And I should see an option to update payment method
And I should see the failure reason if available
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|------------------|
| Invoice PDF generation fails | Show error with retry option, offer to email when ready |
| Stripe invoice not yet synced | Show "Processing" status, auto-refresh when available |
| Very large invoice history (100+ invoices) | Implement pagination (25 per page), maintain filter state |
| Invoice with multiple line items | All items displayed, subtotals shown for each category |
| Refund appears on invoice | Show as negative line item with clear "Refund" label |
| International user (different tax rules) | Display appropriate tax labels (VAT, GST, etc.) |
| Invoice for $0 (promotional credit) | Display invoice normally with $0 total |

### Test Data Requirements

| Data Type | Test Values |
|-----------|-------------|
| Invoice Count | 12 (6 months of monthly billing + add-ons) |
| Invoice Statuses | Paid (10), Payment Failed (1), Processing (1) |
| Date Range | July 2025 - December 2025 |
| Invoice Amounts | $49, $149, $299 (subscription variants + add-ons) |
| Test Invoice ID | INV-2025-1089 |
| Stripe Invoice Prefix | in_test_ |

### Priority
**P1** - Required for business compliance and financial management

---

## UXS-006-05: Payment Method Management

### Story ID
UXS-006-05

### Title
User Updates Primary Payment Method and Adds Backup Card

### Persona
**Michelle Torres** - Small Business Owner, 34 years old. Her company credit card was recently compromised, and she received a replacement card with new details. She needs to update her payment method before the next billing cycle and wants to add a backup payment method for redundancy.

### Scenario
Michelle received a fraud alert and her credit card was replaced. Her monthly subscription billing is due in 5 days. She needs to update her payment method urgently and wants to add her business debit card as a backup to prevent any service interruptions.

### User Goal
Replace the compromised primary payment method and add a secondary backup payment method for billing redundancy.

### Preconditions
1. User has active subscription with existing payment method
2. Existing payment method is flagged or about to expire
3. User has admin or billing permissions
4. User has new valid credit card details
5. User has backup debit card available

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | Michelle sees banner: "Payment method requires attention - billing in 5 days" | System displays prominent but non-intrusive warning banner |
| 2 | Michelle clicks "Update Payment Method" | System navigates to Payment Methods page |
| 3 | Michelle views current payment methods | System shows current card (Visa ending 1234) with warning icon and status "Card compromised - please update" |
| 4 | Michelle clicks "Add New Payment Method" | System opens Stripe Elements embedded form for card entry |
| 5 | Michelle enters new card details (new Visa ending 5678) | Stripe validates card in real-time, shows card brand icon |
| 6 | Michelle clicks "Add Card" | System adds card to Stripe customer and displays in list |
| 7 | Michelle clicks "Set as Primary" on the new card | System updates default payment method, shows confirmation |
| 8 | Michelle clicks "Add Backup Payment Method" | System shows option to add additional payment method |
| 9 | Michelle enters debit card details (Mastercard ending 9012) | Stripe validates card, shows debit card indicator |
| 10 | Michelle clicks "Add as Backup" | System adds card as secondary payment method |
| 11 | Michelle clicks "Remove" on the old compromised card | System shows confirmation modal: "Remove Visa ending 1234?" |
| 12 | Michelle confirms removal | System removes old card, shows success message |
| 13 | Michelle reviews updated payment methods | System shows: Primary (Visa 5678), Backup (Mastercard 9012) |

### Expected Outcomes
1. New primary payment method is set and will be charged on next billing
2. Backup payment method is stored for automatic retry on failures
3. Old compromised card is removed from account
4. Stripe customer object updated with new default
5. Confirmation email sent with payment method change notification
6. Warning banner removed from dashboard
7. Next billing will use new primary payment method

### Acceptance Criteria

```gherkin
Given I am a user with billing permissions
And I have an existing payment method on file
When I add a new payment method
Then the new card should appear in my payment methods list
And I should be able to set it as primary

Given I have added a new payment method
When I click "Set as Primary"
Then the new card should become my default payment method
And the previous primary should become a backup (if kept)
And I should see a confirmation message

Given I want to remove a payment method
When I click "Remove" and confirm
Then the payment method should be removed from my account
And it should no longer appear in my list
And I should not be able to remove my only payment method

Given I have set up a backup payment method
When my primary payment fails
Then the system should automatically retry with the backup method
And I should be notified of the backup charge

Given my payment method has issues
When I log into the platform
Then I should see a prominent but non-intrusive warning
And the warning should link directly to payment method management
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|------------------|
| User tries to remove only payment method | Block removal, show message "Add another payment method first" |
| Card validation fails (invalid number) | Show specific error from Stripe, do not save |
| User adds expired card | Stripe rejects, show "Card is expired" message |
| Network error during card save | Show retry option, do not leave incomplete state |
| User adds duplicate card number | Allow (Stripe handles), show as separate entry |
| Stripe Elements fails to load | Show fallback manual entry form or redirect to Stripe portal |
| Primary payment set to card that expires this month | Show warning "Card expires soon" with suggestion to update |

### Test Data Requirements

| Data Type | Test Values |
|-----------|-------------|
| Old Card (to remove) | 4242 4242 4242 1234 (simulated compromised) |
| New Primary Card | 4242 4242 4242 5678 |
| Backup Card (Debit) | 5555 5555 5555 9012 |
| Card Type Testing | Visa, Mastercard, Amex (4000 0000 0000 0077) |
| Declined Card Test | 4000 0000 0000 0002 |
| Test Customer ID | cus_test_michelle_torres |

### Priority
**P0** - Critical for preventing churn due to payment failures

---

## UXS-006-06: Subscription Upgrade and Downgrade

### Story ID
UXS-006-06

### Title
User Upgrades from Starter to Growth Tier Mid-Billing Cycle

### Persona
**Ryan Martinez** - Startup Founder, 29 years old. His company has been growing rapidly and the Starter tier limitations are becoming a bottleneck. He needs to upgrade to Growth tier immediately to access more workflows and team member slots for three new hires.

### Scenario
Ryan is on day 15 of his monthly billing cycle on the Starter tier ($49/month). His team has grown from 2 to 5 people, and they've hit the 5-workflow limit. He needs to upgrade to Growth tier ($149/month) to unlock 25 workflows and 10 team member slots.

### User Goal
Upgrade from Starter to Growth tier with clear understanding of prorated charges and immediate access to upgraded features.

### Preconditions
1. User has active Starter subscription
2. User is mid-billing cycle (day 15 of 30)
3. User has valid payment method on file
4. User has hit plan limits (workflows or team members)
5. Growth tier is available for upgrade

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | Ryan tries to create 6th workflow and sees limit message | System shows modal: "You've reached your workflow limit. Upgrade to Growth for 25 workflows." with "Upgrade Now" button |
| 2 | Ryan clicks "Upgrade Now" | System navigates to Plan Change page with current vs Growth comparison |
| 3 | Ryan reviews plan comparison | System highlights differences: 5 vs 25 workflows, 2 vs 10 team members, 500 vs 5,000 executions, 10K vs 100K credits |
| 4 | Ryan clicks "Upgrade to Growth" | System shows proration preview modal |
| 5 | Ryan reviews proration details | System shows: "Today's charge: $50.00 (prorated Growth for remaining 15 days)", "Next billing date stays: Jan 20", "Next full charge: $149.00" |
| 6 | Ryan clicks "Confirm Upgrade" | System processes payment for prorated amount |
| 7 | Payment succeeds | System shows success: "Welcome to Growth! Your new features are active now." |
| 8 | Ryan returns to dashboard | System shows updated plan badge "Growth" in header, limits updated |
| 9 | Ryan creates new workflow | System allows creation (now has 5/25 workflows) |
| 10 | Ryan navigates to Team Settings | System shows 2/10 team members with option to invite more |
| 11 | Ryan checks email | System has sent confirmation with upgrade details and prorated invoice |

### Expected Outcomes
1. User successfully upgraded from Starter to Growth
2. Prorated charge processed correctly ($50 for 15 days of Growth)
3. Plan features activate immediately
4. Workflow limit increased to 25
5. Team member limit increased to 10
6. Credit allocation increased (prorated for remaining days)
7. Next billing date unchanged
8. Next billing amount will be $149 (full Growth)
9. Confirmation email sent with prorated invoice

### Acceptance Criteria

```gherkin
Given I am a Starter subscriber on day 15 of 30
When I initiate an upgrade to Growth tier
Then I should see a clear proration preview
And the prorated amount should be approximately $50 (15/30 * $100 difference)
And my billing date should remain unchanged

Given I confirm the upgrade
When payment is processed successfully
Then my plan should change to Growth immediately
And my feature limits should update to Growth tier levels
And I should receive a confirmation email with invoice

Given I have upgraded mid-cycle
When I view my next invoice preview
Then it should show the full Growth price ($149)
And the billing date should be the original date

Given I want to downgrade from Growth to Starter
When I initiate a downgrade
Then I should be warned about feature limitations
And the downgrade should take effect at end of billing cycle
And I should not receive a prorated refund

Given I have more team members than Starter allows
When I attempt to downgrade
Then I should see a warning about required team member removal
And I should not be able to complete downgrade until compliant
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|------------------|
| Downgrade with usage exceeding lower tier | Block downgrade, show what needs to be reduced first |
| Upgrade on last day of billing cycle | Minimal proration, next billing at new rate |
| Upgrade payment fails | Show error, do not change plan, offer retry |
| Multiple plan changes in same cycle | Calculate cumulative proration correctly |
| User on annual plan wants to upgrade | Option to upgrade with annual pricing or switch to monthly |
| Enterprise downgrade to Growth/Starter | Require contacting sales, not self-service |
| Upgrade during free trial | Convert trial to paid Growth, start billing immediately |

### Test Data Requirements

| Data Type | Test Values |
|-----------|-------------|
| Current Plan | Starter ($49/month) |
| Target Plan | Growth ($149/month) |
| Days in Cycle | 30 |
| Current Day | 15 |
| Prorated Amount | $50.00 (calculated) |
| Test User | ryan_martinez_test_001 |
| Stripe Subscription ID | sub_test_starter_001 |

### Priority
**P0** - Critical for revenue growth and customer satisfaction

---

## UXS-006-07: Low Credit Balance Warnings

### Story ID
UXS-006-07

### Title
User Receives and Responds to Progressive Low Credit Balance Warnings

### Persona
**Amanda Foster** - Marketing Manager, 31 years old. Uses Bottleneck-Bots for automated lead enrichment campaigns. She manages multiple campaigns and needs timely warnings when credits are running low to avoid campaign interruptions.

### Scenario
Amanda has launched a large lead enrichment campaign that is consuming credits faster than usual. She needs to be alerted at key thresholds (75%, 90%, 100%) so she can decide whether to slow down the campaign or purchase additional credits before running out.

### User Goal
Receive timely, actionable notifications at 75%, 90%, and 100% credit usage thresholds with clear options to address the situation.

### Preconditions
1. User has active subscription with credit allocation
2. User has credit usage in progress
3. Notification preferences allow email and in-app alerts
4. User is approaching 75% credit usage

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | Amanda's credit usage reaches 75% (75,000/100,000) | System triggers 75% alert |
| 2 | Amanda sees in-app notification | System shows toast: "Credit Alert: 25,000 credits remaining (25%)" with dismiss and "View Details" options |
| 3 | Amanda receives email | System sends email: "Credit Balance Alert - 25% Remaining" with usage chart and "Buy Credits" CTA |
| 4 | Amanda dismisses notification, continues working | System logs acknowledgment, schedules 90% alert |
| 5 | Amanda's usage reaches 90% (90,000/100,000) | System triggers 90% alert (higher urgency) |
| 6 | Amanda sees dashboard warning banner | System shows persistent yellow banner: "Warning: Only 10,000 credits remaining. Operations may pause soon." |
| 7 | Amanda clicks "View Details" | System shows usage breakdown and trend chart showing projected depletion |
| 8 | Amanda sees projection | System shows: "At current rate, credits will be depleted in approximately 2 hours" |
| 9 | Amanda clicks "Buy Credits" | System navigates to Credit Marketplace with urgency messaging |
| 10 | Usage reaches 100% (100,000/100,000) | System triggers critical alert |
| 11 | Amanda sees critical warning | System shows modal: "Credits Depleted - Operations Paused" with "Buy Now" button |
| 12 | Amanda purchases 20,000 credit pack | System processes purchase and immediately resumes paused operations |
| 13 | Amanda returns to campaign | System shows active campaign status, credits now at 20,000 |

### Expected Outcomes
1. 75% alert delivered via email and in-app notification
2. 90% alert includes persistent banner and urgency messaging
3. 100% alert pauses operations and shows blocking modal
4. All alerts include clear path to purchase more credits
5. Usage projections are reasonably accurate
6. Operations resume automatically after credit purchase
7. Alert history is logged for user reference

### Acceptance Criteria

```gherkin
Given I have used 75% of my monthly credits
When the 75% threshold is reached
Then I should receive an in-app notification
And I should receive an email alert
And the notification should show remaining credits
And the notification should include a link to buy more credits

Given I have used 90% of my monthly credits
When the 90% threshold is reached
Then I should see a persistent warning banner on the dashboard
And the banner should show projected depletion time
And I should receive a higher-urgency email alert

Given I have used 100% of my monthly credits
When operations attempt to use more credits
Then operations should be paused
And I should see a blocking modal
And the modal should explain the situation and offer to buy credits

Given I purchase credits after hitting 100%
When the purchase completes
Then paused operations should resume automatically
And I should see my new credit balance
And I should receive confirmation of resumed operations

Given I want to customize my alert thresholds
When I go to notification settings
Then I should be able to adjust threshold percentages
And I should be able to enable/disable specific alert types
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|------------------|
| User disabled email notifications | Still send in-app alerts, respect preference |
| Usage jumps from 70% to 95% in single operation | Trigger both 75% and 90% alerts in sequence |
| User already acknowledged 75% alert | Don't repeat 75% alert, proceed to 90% |
| Credits renewed (new billing cycle) while at 90% | Clear all alerts, reset thresholds |
| User purchases credits just before 100% | Cancel pending 100% alert, update remaining |
| Very rapid credit consumption (DDoS-like) | Rate limit alerts to prevent spam, show consolidated view |
| User has unlimited credits (Enterprise) | No usage alerts needed, skip all thresholds |

### Test Data Requirements

| Data Type | Test Values |
|-----------|-------------|
| Total Credits | 100,000 |
| 75% Threshold | 75,000 used / 25,000 remaining |
| 90% Threshold | 90,000 used / 10,000 remaining |
| 100% Threshold | 100,000 used / 0 remaining |
| Test User | amanda_foster_test_001 |
| Test Email | amanda.foster+alerts@bottleneckbots.com |
| Consumption Rate | 5,000 credits/hour (for projections) |

### Priority
**P0** - Critical for preventing service interruption and driving add-on purchases

---

## UXS-006-08: Billing Dispute and Refund Process

### Story ID
UXS-006-08

### Title
User Initiates Billing Dispute and Receives Partial Refund

### Persona
**Thomas Anderson** - IT Director, 45 years old. Manages software subscriptions for his department. He noticed an unexpected charge on his latest invoice and believes credits were deducted incorrectly during a system outage that affected his workflows.

### Scenario
Thomas received his monthly invoice showing additional charges for credit overages. However, he believes the overage was caused by a platform issue where failed API calls were still being counted against his credits. He wants to dispute the charges and request a refund for the incorrectly billed amount.

### User Goal
File a billing dispute with supporting evidence, receive acknowledgment, and obtain a fair resolution (partial refund or credit).

### Preconditions
1. User has active subscription with recent charges
2. User has transaction history showing disputed charges
3. User has identified specific transactions to dispute
4. Support system is available for dispute handling
5. User has billing admin permissions

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | Thomas navigates to Settings > Billing > Invoices | System shows Invoice History with most recent invoice highlighted |
| 2 | Thomas clicks on latest invoice (#INV-2025-1245, $178.00) | System opens invoice detail showing base subscription ($149) + overage ($29) |
| 3 | Thomas clicks "Dispute Charge" button | System opens Billing Dispute form |
| 4 | Thomas selects dispute type: "Incorrect charge" | System shows relevant form fields for this dispute type |
| 5 | Thomas selects the $29 overage line item to dispute | System highlights selected charge, enables description field |
| 6 | Thomas enters description: "Credits deducted during Jan 5 outage" | System captures description with character count |
| 7 | Thomas attaches screenshot of error messages from Jan 5 | System uploads and attaches file (max 10MB, jpg/png/pdf) |
| 8 | Thomas clicks "Submit Dispute" | System creates dispute ticket and shows confirmation |
| 9 | System shows confirmation | Display: "Dispute #DSP-2025-0892 submitted. Expected response within 2 business days." |
| 10 | Thomas receives email confirmation | Email includes dispute ID, summary, and expected timeline |
| 11 | (2 days later) Thomas receives resolution email | Email: "Your dispute has been reviewed. We're issuing a $29 credit to your account." |
| 12 | Thomas logs in and checks credit balance | System shows $29 credit added with note "Dispute resolution - DSP-2025-0892" |
| 13 | Thomas navigates to Disputes section | System shows dispute history with status "Resolved - Credit Issued" |

### Expected Outcomes
1. Dispute submitted successfully with all provided information
2. Confirmation email sent with dispute reference number
3. Support team reviews dispute within stated timeframe
4. Resolution communicated clearly (approved/denied with explanation)
5. If approved: refund processed or credit issued
6. Transaction history updated to reflect dispute resolution
7. Future invoice shows credit or adjustment if applicable

### Acceptance Criteria

```gherkin
Given I am viewing an invoice with charges I want to dispute
When I click "Dispute Charge"
Then I should see a dispute form
And I should be able to select specific line items
And I should be able to provide a description and attach evidence

Given I submit a valid dispute
When the submission is processed
Then I should receive a confirmation with a dispute reference number
And I should receive an email confirmation
And the dispute should appear in my Disputes section with "Under Review" status

Given my dispute has been approved
When the resolution is processed
Then I should receive notification of the resolution
And if a credit is issued, it should appear in my credit balance
And the dispute status should update to "Resolved"

Given my dispute was denied
When I view the resolution
Then I should see a clear explanation for the denial
And I should have an option to escalate or provide additional information

Given I want to track my dispute status
When I navigate to the Disputes section
Then I should see all my disputes with current status
And I should see dates for submission, updates, and resolution
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|------------------|
| Dispute amount exceeds total invoice | Allow dispute, cap at invoice amount |
| User disputes already-refunded charge | Show message "This charge has already been refunded" |
| Multiple disputes on same invoice | Allow, track separately, may be consolidated by support |
| Dispute file upload fails | Show error, allow retry, don't block submission |
| Dispute submitted on weekend | Acknowledge receipt, set response time from next business day |
| Escalation requested after denial | Route to senior support with full history |
| Chargeback initiated externally | Flag account, prioritize resolution to avoid chargeback fees |
| User requests refund to different method | Explain refunds go to original payment method or as credit |

### Test Data Requirements

| Data Type | Test Values |
|-----------|-------------|
| Invoice ID | INV-2025-1245 |
| Invoice Total | $178.00 |
| Disputed Amount | $29.00 (overage charge) |
| Dispute Type | "Incorrect charge" |
| Dispute Reason | Platform outage on Jan 5 |
| Test User | thomas_anderson_test_admin |
| Expected Resolution | Credit issued |
| Dispute Reference | DSP-2025-0892 |

### Priority
**P1** - Important for customer trust and chargeback prevention

---

## UXS-006-09: Annual Billing Conversion

### Story ID
UXS-006-09

### Title
Monthly Subscriber Converts to Annual Billing for Discount

### Persona
**Lisa Chen** - Operations Director, 39 years old. Has been using Bottleneck-Bots on the Growth tier for 8 months and is confident in the platform's value. She wants to optimize costs by switching to annual billing to take advantage of the 20% discount.

### Scenario
Lisa has been paying $149/month for the Growth tier ($1,788/year). She received a promotional email highlighting the annual billing option at $1,432/year (20% savings of $356). She wants to switch to annual billing on her next renewal date.

### User Goal
Convert from monthly to annual billing cycle to save 20% on subscription costs, with clear understanding of the commitment and timing.

### Preconditions
1. User has active monthly subscription (Growth tier)
2. User has been subscribed for 3+ months (eligible for annual)
3. Annual billing option is available for user's tier
4. User has valid payment method with sufficient credit/limit
5. User is approaching renewal date

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | Lisa receives email: "Save 20% with Annual Billing" | Email shows savings calculation and "Switch to Annual" CTA |
| 2 | Lisa clicks "Switch to Annual" in email | System opens Plan Management page with annual toggle highlighted |
| 3 | Lisa reviews annual pricing | System shows: Monthly ($149/mo = $1,788/yr) vs Annual ($119/mo = $1,432/yr), Savings: $356/yr |
| 4 | Lisa clicks "Switch to Annual Billing" | System shows conversion options modal |
| 5 | Lisa reviews options | System shows: "Option A: Convert now (pay prorated annual)", "Option B: Convert at next renewal (continue monthly until then)" |
| 6 | Lisa selects "Convert at next renewal" | System shows confirmation with next renewal date (Jan 20) |
| 7 | Lisa clicks "Confirm Annual Conversion" | System schedules billing change for next renewal |
| 8 | System shows confirmation | Display: "You'll switch to annual billing on Jan 20. Your next charge will be $1,432 for 12 months." |
| 9 | Lisa receives confirmation email | Email includes: conversion date, annual amount, savings summary, cancellation terms |
| 10 | (On Jan 20) System processes annual charge | $1,432 charged, subscription extended for 12 months |
| 11 | Lisa receives invoice | Invoice shows: "Growth Plan - Annual" $1,432.00 |
| 12 | Lisa checks subscription status | System shows: "Growth - Annual", Next renewal: Jan 20, 2027 |

### Expected Outcomes
1. Monthly to annual conversion scheduled successfully
2. Billing cycle changes on next renewal date
3. Annual amount charged ($1,432)
4. Subscription period extended to 12 months
5. Savings of $356 compared to monthly billing
6. Confirmation emails sent at scheduling and conversion
7. Invoice reflects annual billing amount
8. Next renewal date set to 12 months out

### Acceptance Criteria

```gherkin
Given I am a monthly subscriber eligible for annual billing
When I view the Plan Management page
Then I should see both monthly and annual pricing options
And the annual savings should be clearly displayed (20%, $356/year)

Given I choose to convert to annual at next renewal
When I confirm the conversion
Then my billing should remain monthly until the scheduled date
And I should receive confirmation of the scheduled change
And I should be able to cancel the scheduled change before it occurs

Given my annual conversion is scheduled
When the renewal date arrives
Then the annual amount should be charged ($1,432)
And my subscription period should extend 12 months
And my invoice should reflect annual billing

Given I want to convert immediately
When I select "Convert now"
Then I should see a prorated calculation for the remainder of my current period
And the annual period should start immediately
And I should not be double-charged

Given I am on annual billing and want to cancel
When I initiate cancellation
Then I should be informed that refunds are prorated (if applicable)
And I should see my access end date
And I should have the option to continue until period end
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|------------------|
| User tries to cancel annual after 2 months | Show prorated refund calculation, require confirmation |
| Payment fails on annual conversion date | Retry with backup method, revert to monthly if all fail |
| User upgrades tier while on annual | Prorate the tier difference for remaining annual period |
| User on annual wants to downgrade | Allow at annual renewal, no mid-year downgrade |
| Annual payment exceeds card limit | Offer split payment option or different payment method |
| Conversion scheduled but user cancels subscription | Cancel takes precedence, no annual charge |
| Price increase announced before conversion | Honor quoted price for scheduled conversion |

### Test Data Requirements

| Data Type | Test Values |
|-----------|-------------|
| Current Plan | Growth Monthly ($149/mo) |
| Annual Price | $1,432/year ($119/mo equivalent) |
| Savings | $356/year (20%) |
| Current Renewal Date | January 20, 2026 |
| Test User | lisa_chen_test_001 |
| Stripe Price IDs | price_growth_monthly, price_growth_annual |

### Priority
**P1** - Important for improving LTV and reducing churn

---

## UXS-006-10: Failed Payment Recovery

### Story ID
UXS-006-10

### Title
User Recovers from Failed Payment and Prevents Service Interruption

### Persona
**Kevin O'Brien** - Agency Owner, 41 years old. Runs a busy marketing agency and his corporate card unexpectedly declined due to a spending limit reset. He needs to quickly resolve the payment issue before his subscription is suspended.

### Scenario
Kevin's monthly subscription payment failed because his corporate card hit its monthly spending limit (reset happens on the 15th, but billing was on the 14th). He received a payment failure notification and has 7 days to resolve before his account is suspended.

### User Goal
Successfully recover from a failed payment by updating payment method or retrying, preventing any service interruption for his team.

### Preconditions
1. User has active subscription with recent payment failure
2. Payment failure occurred within dunning period (0-7 days)
3. User's account is in "past_due" status
4. User has access to alternate payment method
5. Dunning email sequence has been initiated

### Step-by-Step User Journey

| Step | User Action | Expected System Response |
|------|-------------|-------------------------|
| 1 | Kevin receives email: "Payment Failed - Action Required" | Email shows: failure reason, account status, days until suspension, "Fix Payment" CTA |
| 2 | Kevin logs into the platform | System shows red banner: "Payment failed. Update your payment method to prevent service interruption in 6 days." |
| 3 | Kevin clicks "Update Payment Method" | System navigates to Payment Recovery page |
| 4 | Kevin sees payment status | System shows: "Last payment attempt: Failed (Card declined - insufficient funds)", "Amount due: $149.00", "Days remaining: 6" |
| 5 | Kevin clicks "Try Again" with existing card | System attempts to charge existing card |
| 6 | Payment fails again | System shows: "Payment still failing. Please update your payment method." |
| 7 | Kevin clicks "Add New Payment Method" | System opens Stripe Elements form |
| 8 | Kevin enters personal card details | Stripe validates card successfully |
| 9 | Kevin clicks "Save and Pay Now" | System adds card, sets as primary, attempts payment |
| 10 | Payment succeeds | System shows success: "Payment successful! Your subscription is now active." |
| 11 | Kevin sees updated status | System shows green confirmation, banner removed, account status "active" |
| 12 | Kevin receives confirmation email | Email: "Payment received - Your subscription is active" with receipt |

### Expected Outcomes
1. User successfully recovers from failed payment
2. Account status returns to "active"
3. Outstanding amount collected ($149)
4. New payment method saved and set as primary
5. Dunning sequence stopped
6. Service continues without interruption
7. Confirmation email sent with receipt
8. Payment failure logged in transaction history

### Acceptance Criteria

```gherkin
Given my payment has failed
When I log into the platform
Then I should see a prominent notification about the failure
And I should see how many days until service interruption
And I should have a clear path to resolve the issue

Given I am on the Payment Recovery page
When I retry payment with my existing card
Then the system should attempt the charge
And if it fails again, I should see the failure reason
And I should be prompted to add a different payment method

Given I add a new payment method on the Recovery page
When I click "Save and Pay Now"
Then the new card should be saved
And payment should be attempted immediately
And if successful, my account should return to active status

Given I do not resolve payment within 7 days
When the grace period expires
Then my account should be suspended (not deleted)
And I should still be able to log in and fix payment
And my data should be preserved for 30 days

Given I resolve payment after suspension
When payment is successful
Then my account should be reactivated immediately
And all my data and settings should be intact
And I should receive confirmation of reactivation
```

### Edge Cases

| Edge Case | Expected Behavior |
|-----------|------------------|
| Multiple payment methods, all failing | Offer manual entry option, suggest contacting bank |
| User on day 7, payment processing | Extend grace period by 24 hours while processing |
| Payment fails due to 3D Secure requirement | Redirect to 3DS authentication flow |
| User ignores all dunning emails | Final warning on day 6, suspension on day 8 |
| Account suspended, user wants refund | No refund for failed payment period, can reactivate |
| International card with currency issues | Show any currency conversion details, offer alternative |
| Payment succeeds but webhook fails | Manual reconciliation, show pending status, resolve within 1 hour |

### Test Data Requirements

| Data Type | Test Values |
|-----------|-------------|
| Initial Card (Failing) | 4000 0000 0000 0341 (decline after auth) |
| Recovery Card (Success) | 4242 4242 4242 4242 |
| Amount Due | $149.00 |
| Dunning Period | 7 days |
| Test User | kevin_obrien_test_001 |
| Account Status Sequence | active -> past_due -> suspended |
| Stripe Subscription Status | past_due |

### Priority
**P0** - Critical for revenue recovery and reducing involuntary churn

---

## Summary

This document contains 10 comprehensive UX stories for the Bottleneck-Bots Payment & Billing System:

| Story ID | Title | Priority |
|----------|-------|----------|
| UXS-006-01 | Subscription Tier Selection and Purchase | P0 |
| UXS-006-02 | Credit Pack Purchase Flow | P0 |
| UXS-006-03 | Usage Tracking and Cost Monitoring | P1 |
| UXS-006-04 | Invoice Viewing and Download | P1 |
| UXS-006-05 | Payment Method Management | P0 |
| UXS-006-06 | Subscription Upgrade and Downgrade | P0 |
| UXS-006-07 | Low Credit Balance Warnings | P0 |
| UXS-006-08 | Billing Dispute and Refund Process | P1 |
| UXS-006-09 | Annual Billing Conversion | P1 |
| UXS-006-10 | Failed Payment Recovery | P0 |

### Test Coverage Summary

- **P0 Stories:** 6 (Critical business flows)
- **P1 Stories:** 4 (Important functionality)
- **Total User Journeys:** 120+ steps
- **Total Acceptance Criteria:** 60+ scenarios
- **Edge Cases Documented:** 70+ scenarios

### Integration Points

These stories integrate with:
- Stripe Payment Processing
- Stripe Billing Portal
- Credit System (credit.service.ts)
- Marketplace Router
- Stripe Webhook Router
- Email Notification System
- Redis Cache (for credit balances)

### Related Documents

- `/docs/CREDIT_SYSTEM_IMPLEMENTATION.md`
- `/docs/Pricing-Strategy.md`
- `/docs/prd/marketing/12-subscription-billing.md`
- `/docs/USER_FLOWS.md`
