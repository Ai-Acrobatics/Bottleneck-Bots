# E2E Test Priority List - Ranked by Launch Impact

**Status:** Ready for implementation
**Total Missing Tests:** 186 tests
**Estimated Implementation Time:** 100-120 hours
**Launch Readiness:** 40 critical tests (Phase 1) needed before go-live

---

## CRITICAL PRIORITY - LAUNCH BLOCKER

### P1.1: Email/Password Authentication (Est. 12 hours | 8 tests)

**Why:** Users cannot access platform without working auth
**Risk Level:** CRITICAL
**Tests Needed:**
- [ ] Register with valid email/password → account created
- [ ] Register with duplicate email → error shown
- [ ] Register with weak password → validation error
- [ ] Login with correct credentials → redirected to dashboard
- [ ] Login with wrong password → error message
- [ ] Logout → session cleared, redirected to login
- [ ] Session persists after page reload
- [ ] Concurrent login creates new session

**Test File:** `tests/e2e/auth/email-password-auth.spec.ts`

**Dependencies:** Database user table, authentication middleware

---

### P1.2: Google OAuth Flow (Est. 10 hours | 6 tests)

**Why:** Primary auth method for target users
**Risk Level:** CRITICAL
**Tests Needed:**
- [ ] Google login button visible on login page
- [ ] Click Google button → OAuth consent screen
- [ ] Accept OAuth permissions → redirected to dashboard
- [ ] New user via OAuth → account auto-created
- [ ] Existing user via OAuth → logs in successfully
- [ ] OAuth error handling → graceful fallback

**Test File:** `tests/e2e/auth/google-oauth.spec.ts`

**Dependencies:** Google OAuth credentials, OAuth provider setup

---

### P1.3: Password Reset Flow (Est. 8 hours | 5 tests)

**Why:** Users will forget passwords; blocking support cost
**Risk Level:** CRITICAL
**Tests Needed:**
- [ ] Forgot password form submits email
- [ ] Reset email sent (check email service)
- [ ] Click reset link → password form appears
- [ ] Update password → login with new password succeeds
- [ ] Expired reset link → error shown

**Test File:** `tests/e2e/auth/password-reset.spec.ts`

**Dependencies:** Email service, reset token generation

---

### P1.4: Stripe Checkout Flow (Est. 14 hours | 8 tests)

**Why:** Revenue stream; payment failures = lost customers
**Risk Level:** CRITICAL
**Tests Needed:**
- [ ] Pricing page displays all plans
- [ ] Select plan → checkout modal opens
- [ ] Fill Stripe test card → payment processes
- [ ] Payment success → subscription created
- [ ] Redirect to success page with confirmation
- [ ] Invoice generated and sent
- [ ] User subscription status shows in dashboard
- [ ] Payment failure → clear error message

**Test File:** `tests/e2e/payments/stripe-checkout.spec.ts`

**Dependencies:** Stripe test keys, webhook setup, email service

---

### P1.5: Agent Creation & Execution (Est. 16 hours | 10 tests)

**Why:** Core product value; if agents don't work, no product
**Risk Level:** CRITICAL
**Tests Needed:**
- [ ] Create agent with valid config → agent appears in list
- [ ] Agent config validation → rejects invalid inputs
- [ ] Create task for agent → task stored in database
- [ ] Execute task → agent receives execution request
- [ ] Task progress updates in UI (SSE connection)
- [ ] Task completion → result stored and displayed
- [ ] Task failure → error logged and shown
- [ ] Cancel running task → task stops
- [ ] Retrieve task history → shows all completed tasks
- [ ] Monitor real-time events via SSE → events received

**Test File:** `tests/e2e/agents/agent-core-execution.spec.ts`

**Dependencies:** Agent service, database, SSE infrastructure

---

### P1.6: Unauthenticated Access Protection (Est. 6 hours | 4 tests)

**Why:** Security baseline; prevent unauthorized access
**Risk Level:** CRITICAL
**Tests Needed:**
- [ ] Unauthenticated user accessing /dashboard → redirected to /login
- [ ] Unauthenticated user accessing /agents → redirected to /login
- [ ] API call without token → 401 Unauthorized
- [ ] API call with invalid token → 401 Unauthorized

**Test File:** `tests/e2e/auth/unauthenticated-access.spec.ts`

**Dependencies:** Auth middleware, routing guards

---

## PHASE 1 SUBTOTAL: 40 tests | 66 hours

---

## HIGH PRIORITY - FEATURE COMPLETE

### P2.1: Browser Session Management (Est. 14 hours | 8 tests)

**Why:** Automation backbone; no sessions = no automation
**Risk Level:** HIGH
**Tests Needed:**
- [ ] Create Browserbase session → session initialized
- [ ] Connect to session → page loads successfully
- [ ] Take screenshot → image saved
- [ ] Multiple concurrent sessions → isolated properly
- [ ] Session timeout → graceful cleanup
- [ ] Recover from session failure → reconnect successful
- [ ] Session cleanup → resources released
- [ ] Handle network disconnection → auto-reconnect

**Test File:** `tests/e2e/browser/browser-sessions.spec.ts`

**Dependencies:** Browserbase SDK, session pool manager

---

### P2.2: Stagehand AI Automation (Est. 12 hours | 7 tests)

**Why:** AI actions drive GHL automation
**Risk Level:** HIGH
**Tests Needed:**
- [ ] Execute AI action → locates element and acts
- [ ] Fill form field with AI → value entered correctly
- [ ] Click button via AI → action triggered
- [ ] Extract text from page → text returned accurately
- [ ] Select dropdown option → option selected
- [ ] Handle dynamic elements → finds elements after load
- [ ] Error recovery → retries failed actions

**Test File:** `tests/e2e/browser/stagehand-automation.spec.ts`

**Dependencies:** Stagehand SDK, browser sessions

---

### P2.3: Advanced Agent Features (Est. 12 hours | 8 tests)

**Why:** Agent memory and tools needed for most workflows
**Risk Level:** HIGH
**Tests Needed:**
- [ ] Store context in agent memory → retrieved in next task
- [ ] Retrieve tools list → shows all available tools
- [ ] Execute tool from agent → tool output returned
- [ ] Tool timeout → timeout error handled
- [ ] Tool error → error logged and shown
- [ ] Memory persistence across sessions → context survives reload
- [ ] Clear memory → context removed
- [ ] Multiple agents share memory namespace → proper isolation

**Test File:** `tests/e2e/agents/agent-advanced-features.spec.ts`

**Dependencies:** Agent memory service, tools registry

---

### P2.4: Subscription Management (Est. 11 hours | 6 tests)

**Why:** Retention and upsell features; business critical
**Risk Level:** HIGH
**Tests Needed:**
- [ ] View current subscription → displays correct plan
- [ ] Upgrade plan → new plan applied, invoiced
- [ ] Downgrade plan → plan changed, prorated
- [ ] Cancel subscription → subscription ends, reason captured
- [ ] View billing history → shows all invoices
- [ ] Download invoice → PDF downloads correctly

**Test File:** `tests/e2e/payments/subscription-management.spec.ts`

**Dependencies:** Stripe API, payment processor

---

### P2.5: Dashboard Navigation & UX (Est. 10 hours | 6 tests)

**Why:** Dashboard is main user interface
**Risk Level:** HIGH
**Tests Needed:**
- [ ] Sidebar navigation → links work, pages load
- [ ] Agent list displays → shows all agents with status
- [ ] Click agent → agent detail page opens
- [ ] Add agent button → creates new agent
- [ ] Search agents → filters results
- [ ] Sort agent list → sorts by column

**Test File:** `tests/e2e/dashboard/dashboard-flows.spec.ts`

**Dependencies:** Dashboard components, API endpoints

---

### P2.6: API Key Management (Est. 10 hours | 7 tests)

**Why:** Required for programmatic access and integrations
**Risk Level:** HIGH
**Tests Needed:**
- [ ] Generate new API key → key displayed once
- [ ] Copy key to clipboard → key copied
- [ ] Name API key → name saved
- [ ] List API keys → shows all keys
- [ ] Edit key name → name updated
- [ ] Revoke key → key disabled
- [ ] Use revoked key → rejected with 401

**Test File:** `tests/e2e/api-keys/api-key-management.spec.ts`

**Dependencies:** API key service, database

---

## PHASE 2 SUBTOTAL: 42 tests | 79 hours

---

## MEDIUM PRIORITY - FEATURE ROBUSTNESS

### P3.1: GHL Workflow Execution (Est. 10 hours | 7 tests)

**Why:** 48 GHL functions are value proposition
**Risk Level:** MEDIUM
**Tests Needed:**
- [ ] Execute workflow creation task → workflow created in GHL
- [ ] Execute funnel automation → funnel populated
- [ ] Execute campaign task → campaign scheduled
- [ ] Execute contact task → contact updated
- [ ] Workflow with client context → uses brand voice
- [ ] Workflow with assets → applies assets correctly
- [ ] Workflow error → error handled gracefully

**Test File:** `tests/e2e/ghl/workflow-execution.spec.ts`

**Dependencies:** GHL API integration, Browserbase sessions

---

### P3.2: Multi-Tenant Data Isolation (Est. 8 hours | 5 tests)

**Why:** Data security; prevent cross-tenant data leaks
**Risk Level:** MEDIUM
**Tests Needed:**
- [ ] User A cannot see User B's agents → data isolation verified
- [ ] User A API key → only accesses their data
- [ ] User A memory namespace → isolated from others
- [ ] Admin features → hidden from regular users
- [ ] User quotas → enforced per user/tenant

**Test File:** `tests/e2e/security/multi-tenant-isolation.spec.ts`

**Dependencies:** Multi-tenant service, auth middleware

---

### P3.3: Error Handling & Recovery (Est. 8 hours | 6 tests)

**Why:** Production stability; users expect graceful failures
**Risk Level:** MEDIUM
**Tests Needed:**
- [ ] Network timeout → retry with backoff
- [ ] Invalid input → validation error shown
- [ ] Server error (5xx) → user-friendly message
- [ ] Payment failure → clear reason shown, retry option
- [ ] Task failure → error logged, user notified
- [ ] Session loss → auto-reconnect attempted

**Test File:** `tests/e2e/error-handling/error-recovery.spec.ts`

**Dependencies:** Error handling middleware, retry logic

---

### P3.4: Performance Baselines (Est. 6 hours | 4 tests)

**Why:** Slow app = high abandonment
**Risk Level:** MEDIUM
**Tests Needed:**
- [ ] Dashboard loads < 3 seconds
- [ ] Agent list response < 500ms
- [ ] Task execution starts < 1 second
- [ ] 100 concurrent tasks → system handles load

**Test File:** `tests/e2e/performance/performance-baselines.spec.ts`

**Dependencies:** Performance monitoring, load testing tools

---

### P3.5: Email Delivery (Est. 6 hours | 3 tests)

**Why:** Critical notifications; users need email confirmations
**Risk Level:** MEDIUM
**Tests Needed:**
- [ ] Signup email sent → user receives verification link
- [ ] Password reset email → link works and allows reset
- [ ] Invoice email → user receives invoice after payment

**Test File:** `tests/e2e/integrations/email-delivery.spec.ts`

**Dependencies:** Email service provider, email interceptor

---

## PHASE 3 SUBTOTAL: 25 tests | 38 hours

---

## ONGOING PRIORITY - CONTINUOUS IMPROVEMENT

### P4.1: Accessibility Testing (Est. 8 hours | 4 tests)

**Why:** Legal requirement (ADA); expand market reach
**Risk Level:** LOW (but legally important)
**Tests Needed:**
- [ ] Keyboard navigation → all features accessible via keyboard
- [ ] ARIA labels → screen reader compatible
- [ ] Color contrast → WCAG AA compliance
- [ ] Focus indicators → visible and logical

**Test File:** `tests/e2e/accessibility/a11y-compliance.spec.ts`

**Dependencies:** axe-core, accessibility testing libraries

---

### P4.2: Mobile Responsiveness (Est. 10 hours | 5 tests)

**Why:** Mobile-first design required
**Risk Level:** LOW (but important for UX)
**Tests Needed:**
- [ ] Dashboard responsive on mobile → layout adapts
- [ ] Forms usable on mobile → inputs accessible
- [ ] Touch interactions → buttons clickable
- [ ] Viewport scaling → text readable
- [ ] Landscape/portrait → layout adapts both ways

**Test File:** `tests/e2e/mobile/mobile-responsiveness.spec.ts`

**Dependencies:** Mobile device emulation

---

### P4.3: Cross-Browser Testing (Est. 12 hours | 6 tests)

**Why:** Support Chrome, Firefox, Safari, Edge
**Risk Level:** LOW
**Tests Needed:**
- [ ] Chrome → all features work
- [ ] Firefox → all features work
- [ ] Safari → all features work
- [ ] Edge → all features work
- [ ] Mobile Chrome → responsive
- [ ] Mobile Safari → responsive

**Test File:** `tests/e2e/cross-browser/cross-browser.spec.ts`

**Dependencies:** Multi-browser Playwright setup

---

## PHASE 4 SUBTOTAL: 15 tests | 30 hours

---

## SUMMARY BY TIMELINE

| Phase | Category | Tests | Hours | Deadline |
|-------|----------|-------|-------|----------|
| **1** | **Critical Features** | **40** | **66** | **Week of Launch** |
| 1.1 | Email/Password Auth | 8 | 12 | Day 1 |
| 1.2 | Google OAuth | 6 | 10 | Day 2 |
| 1.3 | Password Reset | 5 | 8 | Day 3 |
| 1.4 | Stripe Checkout | 8 | 14 | Day 4 |
| 1.5 | Agent Execution | 10 | 16 | Day 5 |
| 1.6 | Auth Protection | 4 | 6 | Day 6 |
| **2** | **Feature Complete** | **42** | **79** | **+2 weeks** |
| 2.1 | Browser Sessions | 8 | 14 | Week 2 |
| 2.2 | Stagehand AI | 7 | 12 | Week 2 |
| 2.3 | Agent Advanced | 8 | 12 | Week 3 |
| 2.4 | Subscriptions | 6 | 11 | Week 3 |
| 2.5 | Dashboard UX | 6 | 10 | Week 3 |
| 2.6 | API Keys | 7 | 10 | Week 4 |
| **3** | **Robustness** | **25** | **38** | **+4 weeks** |
| 3.1 | GHL Workflows | 7 | 10 | Week 5 |
| 3.2 | Multi-Tenant | 5 | 8 | Week 5 |
| 3.3 | Error Handling | 6 | 8 | Week 6 |
| 3.4 | Performance | 4 | 6 | Week 6 |
| 3.5 | Email Delivery | 3 | 6 | Week 7 |
| **4** | **Continuous** | **15** | **30** | **Ongoing** |
| 4.1 | Accessibility | 4 | 8 | Month 2 |
| 4.2 | Mobile | 5 | 10 | Month 2 |
| 4.3 | Cross-Browser | 6 | 12 | Month 3 |

---

## Test Implementation Guide

### For Each Test:

1. **Setup**
   ```typescript
   test.beforeEach(async ({ page }) => {
     await loginAsTestUser(page);
     // Navigate or prepare state
   });
   ```

2. **Action**
   ```typescript
   // Perform user action
   await page.click('[data-testid="submit-button"]');
   ```

3. **Assertion**
   ```typescript
   // Verify result
   await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
   ```

4. **Cleanup**
   ```typescript
   test.afterEach(async ({ page }) => {
     await page.context().clearCookies();
   });
   ```

---

## Critical Success Factors

### Must Have Before Launch
- [ ] All Phase 1 tests passing (40 tests)
- [ ] No flaky tests
- [ ] CI integration working
- [ ] All auth paths tested
- [ ] All payment flows tested
- [ ] Core agent execution working

### Should Have Before Launch
- [ ] 80% of Phase 2 tests passing
- [ ] Dashboard navigation tested
- [ ] API keys working

### Nice to Have Before Launch
- [ ] Error scenarios covered
- [ ] Some GHL workflows tested

---

## Team Assignment

### Tessa (Lead QA Engineer)
- [ ] Create test infrastructure and utilities
- [ ] Implement Phase 1 authentication tests (12 hours)
- [ ] Implement Phase 1 payment tests (14 hours)
- [ ] Code review all E2E tests

### Junior QA/Developer
- [ ] Implement Phase 1 OAuth (10 hours)
- [ ] Implement Phase 1 password reset (8 hours)
- [ ] Implement Phase 1 auth protection (6 hours)

### Backend Developer
- [ ] Ensure API endpoints fully tested
- [ ] Add missing test utilities
- [ ] Fix bugs found by tests

### DevOps Engineer
- [ ] Setup CI/CD integration
- [ ] Configure test environment
- [ ] Setup test reporting

---

## Success Metrics

- [ ] 90%+ tests passing before launch
- [ ] 0 flaky tests
- [ ] Average test duration < 5 seconds
- [ ] All critical user flows covered
- [ ] Production incidents from untested flows: 0

---

**Next Step:** Start implementing P1.1 (Email/Password Auth) immediately
**Estimated Start Date:** December 29, 2025
**Estimated Completion of Phase 1:** January 3-4, 2026

