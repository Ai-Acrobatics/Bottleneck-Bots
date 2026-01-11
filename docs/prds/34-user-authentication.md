# PRD-034: User Authentication

**Document Version:** 1.0
**Status:** Draft
**Author:** Development Team
**Last Updated:** January 11, 2026
**Feature Location:** `server/_core/oauth.ts`, `server/_core/email-auth.ts`, `server/_core/google-auth.ts`, `server/auth/email-password.ts`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Stories](#4-user-stories)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Technical Architecture](#7-technical-architecture)
8. [Data Models](#8-data-models)
9. [API Endpoints](#9-api-endpoints)
10. [Dependencies](#10-dependencies)
11. [Risks & Mitigations](#11-risks--mitigations)
12. [Milestones & Timeline](#12-milestones--timeline)

---

## 1. Overview

### 1.1 Executive Summary

The User Authentication feature provides a comprehensive, secure, and flexible authentication system for the Bottleneck-Bots platform. It supports multiple authentication methods including OAuth 2.0 (Google and Manus), email/password authentication with bcryptjs hashing, JWT-based session management, and cookie-based session persistence. The system is designed to handle account lifecycle management including registration, login, password reset, email verification, and account suspension.

### 1.2 Key Components

| Component | Description | Location |
|-----------|-------------|----------|
| **OAuth 2.0 (Manus)** | Primary OAuth provider for Manus platform integration | `server/_core/oauth.ts` |
| **OAuth 2.0 (Google)** | Google Sign-In integration for user convenience | `server/_core/google-auth.ts` |
| **Email/Password Auth** | Traditional credential-based authentication | `server/_core/email-auth.ts` |
| **Password Management** | Password hashing, reset, and validation | `server/auth/email-password.ts` |
| **Session Management** | JWT token creation and verification | `server/_core/sdk.ts` |
| **Cookie Handling** | Secure session cookie configuration | `server/_core/cookies.ts` |
| **Auth Schema** | Database tables for auth tokens and attempts | `drizzle/schema-auth.ts` |

### 1.3 Authentication Methods Supported

| Method | Status | Provider | Use Case |
|--------|--------|----------|----------|
| **Google OAuth 2.0** | Production | Google | Primary social login |
| **Manus OAuth 2.0** | Production | Manus Platform | Platform-specific integration |
| **Email/Password** | Production | Internal | Traditional authentication |
| **API Keys** | Production | Internal | Programmatic access (see PRD-024) |

### 1.4 Security Highlights

- **Password Hashing**: bcryptjs with configurable cost factor (12 rounds)
- **JWT Sessions**: HS256-signed tokens with configurable expiration
- **Secure Cookies**: HttpOnly, SameSite, Secure flags with environment-aware configuration
- **Timing-Safe Comparison**: Protection against timing attacks in password verification
- **Rate Limiting**: Login attempt tracking with configurable thresholds
- **Token Hashing**: Password reset and email verification tokens are bcrypt-hashed before storage
- **Account Suspension**: Built-in support for suspending compromised or malicious accounts

### 1.5 Target Users

- **End Users**: Customers accessing the Bottleneck-Bots platform
- **Agency Administrators**: Managing team access and permissions
- **Developers**: Integrating with the platform via API keys
- **Security Teams**: Monitoring and responding to authentication events

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Multiple Authentication Vectors**: Need to support diverse user bases with different authentication preferences (social login vs. traditional)
2. **Security Compliance**: Must meet enterprise security standards while maintaining user convenience
3. **Session Management Complexity**: Handling sessions across multiple devices and authentication methods
4. **Password Security**: Balancing security (strong hashing) with performance
5. **Account Recovery**: Providing secure password reset without enabling account takeover
6. **Abuse Prevention**: Preventing brute-force attacks while not impacting legitimate users

### 2.2 User Pain Points

| Pain Point | Impact | User Type |
|------------|--------|-----------|
| "I want to use my Google account to sign in" | Friction from creating new credentials | End Users |
| "I forgot my password and can't access my account" | Lost access, support burden | End Users |
| "I need to know who is logging into our agency accounts" | Security visibility gap | Agency Admins |
| "Our contractor's account was compromised" | Security incident response | Security Teams |
| "Authentication is slow and impacts UX" | User abandonment | All Users |
| "I need to integrate without sharing my login" | Security risk from credential sharing | Developers |

### 2.3 Business Impact

| Problem | Impact | Cost |
|---------|--------|------|
| Credential compromise | Data breach, compliance violations | $100K - $5M per incident |
| Poor login UX | User abandonment, lost revenue | 20-40% conversion loss |
| Account lockouts | Support overhead, user frustration | $15-50 per support ticket |
| Session hijacking | Unauthorized access, data exposure | Variable, up to $500K |
| Compliance failures | Regulatory fines, lost enterprise deals | $50K - $2M |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal ID | Description | Priority | Target |
|---------|-------------|----------|--------|
| **G1** | Provide secure, standards-compliant authentication | P0 | OWASP compliance |
| **G2** | Support multiple authentication methods seamlessly | P0 | 3+ methods |
| **G3** | Ensure responsive authentication performance | P0 | < 500ms login |
| **G4** | Enable account security features (2FA, suspension) | P1 | Available for all users |
| **G5** | Provide comprehensive audit logging | P1 | 100% auth events logged |
| **G6** | Support secure password recovery | P0 | Self-service recovery |

### 3.2 Success Metrics (KPIs)

#### Security Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Successful authentication rate | >= 95% | Successful logins / Total attempts |
| Brute force attacks blocked | 100% | Rate-limited requests / Attack attempts |
| Password reset completion rate | >= 80% | Completed resets / Initiated resets |
| Session hijacking incidents | 0 | Security incident reports |
| Credential stuffing prevention | 100% | Blocked attacks / Detected attempts |

#### Performance Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Login latency | < 500ms P95 | Server-side measurement |
| OAuth callback latency | < 1000ms P95 | End-to-end timing |
| Session verification latency | < 50ms P95 | Middleware timing |
| Password hash time | < 300ms | bcrypt computation |
| Token validation latency | < 10ms P95 | JWT verification timing |

#### User Experience Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Login success rate (first attempt) | >= 85% | First attempt success / Total users |
| OAuth login adoption | >= 60% | OAuth logins / Total logins |
| Password reset request rate | < 5% | Reset requests / Active users |
| Account lockout rate | < 1% | Locked accounts / Active users |

#### Operational Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Authentication availability | 99.99% | Uptime monitoring |
| Failed login logging | 100% | Logged failures / Total failures |
| Session invalidation latency | < 1 second | Revocation to rejection time |
| Password policy compliance | 100% | Compliant passwords / Total passwords |

---

## 4. User Stories

### 4.1 Personas

#### Persona 1: New User (Nancy)
- **Role:** First-time visitor exploring Bottleneck-Bots
- **Goals:** Quick signup, minimal friction, familiar authentication options
- **Pain Points:** Long registration forms, unfamiliar authentication providers
- **Technical Level:** Low to Medium

#### Persona 2: Returning User (Robert)
- **Role:** Existing customer accessing the platform
- **Goals:** Fast login, remembered sessions, easy password recovery
- **Pain Points:** Forgotten passwords, session expiration, device switching
- **Technical Level:** Medium

#### Persona 3: Agency Administrator (Alice)
- **Role:** Team lead managing multiple user accounts
- **Goals:** Security oversight, user management, access control
- **Pain Points:** No visibility into login activity, can't suspend compromised accounts
- **Technical Level:** Medium to High

#### Persona 4: Security Engineer (Sam)
- **Role:** Security professional ensuring platform security
- **Goals:** Audit logging, incident response, compliance verification
- **Pain Points:** Incomplete logs, slow revocation, weak password policies
- **Technical Level:** High

### 4.2 User Stories

#### Registration & Signup

##### US-001: Email/Password Registration
**As a** new user
**I want to** create an account using my email and password
**So that** I can access the platform without using social login

**Acceptance Criteria:**
- Email validation required (format check)
- Password minimum 8 characters
- Duplicate email check with clear error message
- Account created with `loginMethod: "email"`
- Session automatically established after signup
- Success redirects to dashboard/onboarding

##### US-002: Google OAuth Signup
**As a** new user
**I want to** sign up using my Google account
**So that** I can quickly create an account without remembering another password

**Acceptance Criteria:**
- Google Sign-In button on login/signup page
- Redirect to Google OAuth consent screen
- Account created with Google ID, email, and name
- `loginMethod: "google"` set correctly
- Session established via cookie
- Handle existing email conflict gracefully

##### US-003: Manus OAuth Signup
**As a** Manus platform user
**I want to** sign up using my Manus credentials
**So that** I can leverage my existing platform identity

**Acceptance Criteria:**
- Manus OAuth flow initiated correctly
- Account created with Manus openId
- `loginMethod: "manus"` set correctly
- User info synced from Manus (name, email)
- Session established via cookie

#### Login

##### US-004: Email/Password Login
**As a** returning user
**I want to** log in using my email and password
**So that** I can access my account

**Acceptance Criteria:**
- Email and password fields required
- Invalid credentials return generic error (no email enumeration)
- Successful login updates `lastSignedIn` timestamp
- Session cookie set with appropriate security flags
- Legacy SHA-256 passwords upgraded to bcrypt on successful login
- Suspended accounts blocked with appropriate message

##### US-005: Google OAuth Login
**As a** returning Google user
**I want to** log in using my Google account
**So that** I can quickly access my account

**Acceptance Criteria:**
- Single-click Google login
- Existing account matched by Google ID
- New session created
- `lastSignedIn` updated
- Handle account not found gracefully

##### US-006: Session Persistence
**As a** user
**I want to** remain logged in across browser sessions
**So that** I don't have to log in every time I visit

**Acceptance Criteria:**
- Session cookie with 1-year expiration
- HttpOnly flag for XSS protection
- Secure flag on HTTPS connections
- SameSite=None for cross-origin requests (when secure)
- Session verification on protected routes

#### Password Management

##### US-007: Password Reset Request
**As a** user who forgot my password
**I want to** request a password reset
**So that** I can regain access to my account

**Acceptance Criteria:**
- Password reset form with email input
- Success message regardless of email existence (prevent enumeration)
- Reset token generated with 24-hour expiration
- Token hashed before database storage
- Reset link logged in development, emailed in production
- Multiple requests invalidate previous tokens (future enhancement)

##### US-008: Password Reset Completion
**As a** user with a reset link
**I want to** set a new password
**So that** I can access my account again

**Acceptance Criteria:**
- Token validation before showing password form
- Password strength validation (8+ chars, mixed case, numbers, special chars)
- Token marked as used after successful reset
- Expired/invalid tokens rejected with clear message
- User redirected to login after successful reset

##### US-009: Token Verification
**As a** user clicking a reset link
**I want to** know if my token is valid before entering a new password
**So that** I don't waste time on an expired link

**Acceptance Criteria:**
- Token verification endpoint
- Returns validity status and expiration
- Invalid tokens return appropriate error
- Endpoint accessible without authentication

#### Account Security

##### US-010: Login Attempt Tracking
**As a** security-conscious platform
**I want to** track login attempts
**So that** I can detect and prevent brute-force attacks

**Acceptance Criteria:**
- All login attempts logged (success and failure)
- IP address and user agent captured
- Failure reason recorded (invalid_password, user_not_found, rate_limited, account_suspended)
- Rate limiting after 5 failed attempts per hour
- Rate limit applies per email + IP combination

##### US-011: Account Suspension
**As an** administrator responding to a security incident
**I want to** suspend a user account
**So that** I can prevent unauthorized access

**Acceptance Criteria:**
- `suspendedAt` timestamp set on user record
- `suspensionReason` text field for documentation
- Suspended accounts blocked from login
- Clear error message for suspended users
- Existing sessions remain valid (immediate invalidation is future enhancement)

##### US-012: Session Verification
**As a** protected API endpoint
**I want to** verify the user's session
**So that** only authenticated users can access protected resources

**Acceptance Criteria:**
- Session cookie extracted from request
- JWT signature verified with secret
- Expiration checked
- User record loaded from database
- `ForbiddenError` thrown for invalid sessions
- Support for email, Google, and Manus session types

---

## 5. Functional Requirements

### 5.1 Email/Password Authentication

#### FR-001: User Registration

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Validate email format using regex pattern | P0 |
| FR-001.2 | Require minimum 8 character password | P0 |
| FR-001.3 | Check for existing user with same email | P0 |
| FR-001.4 | Hash password using bcryptjs with 12 rounds | P0 |
| FR-001.5 | Create user record with `loginMethod: "email"` | P0 |
| FR-001.6 | Generate session token using JWT | P0 |
| FR-001.7 | Set session cookie with security flags | P0 |
| FR-001.8 | Return user info (id, email, name, onboardingCompleted) | P0 |

#### FR-002: User Login

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Validate email and password presence | P0 |
| FR-002.2 | Query user by email | P0 |
| FR-002.3 | Verify password is set for email users | P0 |
| FR-002.4 | Compare password using bcrypt (or legacy SHA-256) | P0 |
| FR-002.5 | Upgrade legacy SHA-256 hashes to bcrypt on success | P1 |
| FR-002.6 | Check account suspension status | P0 |
| FR-002.7 | Update `lastSignedIn` timestamp | P0 |
| FR-002.8 | Generate and set session token | P0 |
| FR-002.9 | Return user info on success | P0 |
| FR-002.10 | Return generic error on failure (no enumeration) | P0 |

#### FR-003: Password Reset

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Generate cryptographically secure reset token | P0 |
| FR-003.2 | Hash token with bcrypt before storage | P0 |
| FR-003.3 | Set 24-hour expiration on reset tokens | P0 |
| FR-003.4 | Store token in `password_reset_tokens` table | P0 |
| FR-003.5 | Validate password strength on reset | P0 |
| FR-003.6 | Mark token as used after successful reset | P0 |
| FR-003.7 | Iterate through valid tokens for hash comparison | P0 |
| FR-003.8 | Update user password with new bcrypt hash | P0 |

### 5.2 OAuth 2.0 Authentication

#### FR-004: Google OAuth

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Redirect to Google OAuth authorization URL | P0 |
| FR-004.2 | Include required scopes: openid, email, profile | P0 |
| FR-004.3 | Exchange authorization code for access token | P0 |
| FR-004.4 | Fetch user info from Google userinfo endpoint | P0 |
| FR-004.5 | Upsert user with googleId, email, name | P0 |
| FR-004.6 | Create session token for Google user | P0 |
| FR-004.7 | Set session cookie and redirect to dashboard | P0 |
| FR-004.8 | Handle OAuth errors with redirect to login | P0 |

#### FR-005: Manus OAuth

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Exchange code for token via Manus OAuth server | P0 |
| FR-005.2 | Fetch user info using access token | P0 |
| FR-005.3 | Extract openId from user response | P0 |
| FR-005.4 | Upsert user with openId, email, name, loginMethod | P0 |
| FR-005.5 | Create session token using SDK | P0 |
| FR-005.6 | Set session cookie and redirect | P0 |

### 5.3 Session Management

#### FR-006: Session Token Creation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | Create JWT with openId, appId, name claims | P0 |
| FR-006.2 | Sign token with HS256 algorithm | P0 |
| FR-006.3 | Set expiration based on configuration (default 1 year) | P0 |
| FR-006.4 | Use environment-configured secret for signing | P0 |

#### FR-007: Session Token Verification

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | Extract token from session cookie | P0 |
| FR-007.2 | Verify JWT signature | P0 |
| FR-007.3 | Validate expiration time | P0 |
| FR-007.4 | Extract and validate payload claims | P0 |
| FR-007.5 | Load user from database by openId, googleId, or email_id | P0 |
| FR-007.6 | Sync user from OAuth server if not in database (Manus only) | P1 |

#### FR-008: Cookie Configuration

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | Set HttpOnly flag to prevent XSS | P0 |
| FR-008.2 | Set Secure flag on HTTPS connections | P0 |
| FR-008.3 | Set SameSite=None when secure, SameSite=Lax otherwise | P0 |
| FR-008.4 | Set path to "/" for site-wide access | P0 |
| FR-008.5 | Set maxAge to ONE_YEAR_MS | P0 |

### 5.4 Security Features

#### FR-009: Login Attempt Tracking

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009.1 | Log all login attempts to `login_attempts` table | P0 |
| FR-009.2 | Capture email, IP address, user agent | P0 |
| FR-009.3 | Record success/failure and failure reason | P0 |
| FR-009.4 | Query recent attempts for rate limiting | P0 |
| FR-009.5 | Block after 5 failed attempts per hour per email+IP | P0 |

#### FR-010: Password Validation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-010.1 | Minimum 8 characters | P0 |
| FR-010.2 | At least one uppercase letter | P1 |
| FR-010.3 | At least one lowercase letter | P1 |
| FR-010.4 | At least one number | P1 |
| FR-010.5 | At least one special character | P1 |
| FR-010.6 | Return detailed validation errors | P0 |

---

## 6. Non-Functional Requirements

### 6.1 Security Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001 | Passwords must be hashed with bcryptjs (12 rounds) | 100% compliance |
| NFR-002 | Session tokens must be signed with HS256 | 100% compliance |
| NFR-003 | Reset tokens must be hashed before storage | 100% compliance |
| NFR-004 | Timing-safe comparison for password verification | 100% compliance |
| NFR-005 | No plaintext password storage or logging | 0 violations |
| NFR-006 | Session cookies must have HttpOnly flag | 100% compliance |
| NFR-007 | Secure flag on HTTPS connections | 100% compliance |
| NFR-008 | Generic error messages (no user enumeration) | 100% compliance |

### 6.2 Performance Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-009 | Email/password login latency | < 500ms P95 |
| NFR-010 | OAuth callback processing | < 1000ms P95 |
| NFR-011 | Session verification | < 50ms P95 |
| NFR-012 | Password hash computation | < 300ms |
| NFR-013 | Token validation | < 10ms P95 |
| NFR-014 | Database user lookup | < 50ms P95 |

### 6.3 Reliability Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-015 | Authentication service availability | 99.99% uptime |
| NFR-016 | Session validation availability | 99.99% uptime |
| NFR-017 | Data consistency for user records | 100% ACID compliance |
| NFR-018 | Password reset token reliability | 100% delivery (when email configured) |

### 6.4 Scalability Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-019 | Support concurrent authentications | 1000+ per second |
| NFR-020 | Login attempt log retention | 90 days |
| NFR-021 | Password reset token retention | Until used or expired |
| NFR-022 | Horizontal scaling capability | Stateless design |

### 6.5 Compliance Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-023 | OWASP Authentication Best Practices | Full compliance |
| NFR-024 | SOC 2 Type II audit readiness | Pass audit |
| NFR-025 | GDPR data handling | Full compliance |
| NFR-026 | PCI-DSS (if payment data involved) | Full compliance |

---

## 7. Technical Architecture

### 7.1 System Architecture

```
+------------------+     +------------------+     +------------------+
|   Client App     |     |   Express App    |     |   OAuth Providers|
|   (React)        |---->|   (Node.js)      |---->|   Google/Manus   |
+------------------+     +------------------+     +------------------+
        |                        |                        |
        v                        v                        v
+------------------+     +------------------+     +------------------+
|   Auth Pages     |     |   Auth Routes    |     |   Token Exchange |
|   Login/Signup   |     |   /api/auth/*    |     |   User Info      |
|   Reset Password |     |   /api/oauth/*   |     +------------------+
+------------------+     +------------------+
                                 |
                                 v
                         +------------------+
                         |   SDK Server     |
                         |   Session Mgmt   |
                         |   JWT Handling   |
                         +------------------+
                                 |
                                 v
                         +------------------+
                         |   PostgreSQL     |
                         |   users          |
                         |   login_attempts |
                         |   reset_tokens   |
                         +------------------+
```

### 7.2 Authentication Flow Diagrams

#### Email/Password Login Flow

```
1. User submits email + password
2. Server validates input presence
3. Server queries user by email
4. Server checks account suspension
5. Server verifies password (bcrypt)
6. If legacy hash: upgrade to bcrypt
7. Server updates lastSignedIn
8. Server creates JWT session token
9. Server sets session cookie
10. Server returns user info
```

#### OAuth Login Flow (Google)

```
1. User clicks "Sign in with Google"
2. Server redirects to Google OAuth URL
3. User authenticates with Google
4. Google redirects to callback with code
5. Server exchanges code for access token
6. Server fetches user info from Google
7. Server upserts user record
8. Server creates JWT session token
9. Server sets session cookie
10. Server redirects to dashboard
```

#### Password Reset Flow

```
1. User requests password reset
2. Server generates secure token
3. Server hashes token with bcrypt
4. Server stores hashed token with expiration
5. Server returns success (regardless of email existence)
6. User clicks reset link
7. Server validates token (iterates through valid tokens)
8. Server validates new password strength
9. Server hashes new password
10. Server updates user password
11. Server marks token as used
12. Server redirects to login
```

### 7.3 Security Architecture

#### Password Hashing

```typescript
// Configuration
const BCRYPT_ROUNDS = 12; // Cost factor

// Hash password
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

// Verify password (supports legacy migration)
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // Check if bcrypt hash ($2a$, $2b$, $2y$)
  if (storedHash.startsWith('$2')) {
    return bcrypt.compare(password, storedHash);
  }

  // Legacy SHA-256: "hash:salt" format
  const [hash, salt] = storedHash.split(':');
  const computedHash = createHash('sha256')
    .update(password + salt)
    .digest('hex');

  // Timing-safe comparison
  return timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash));
}
```

#### JWT Session Token

```typescript
// Create session token
async function signSession(payload: SessionPayload): Promise<string> {
  const secretKey = new TextEncoder().encode(ENV.cookieSecret);
  const expirationSeconds = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);

  return new SignJWT({
    openId: payload.openId,
    appId: payload.appId,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
}

// Verify session token
async function verifySession(cookieValue: string): Promise<SessionPayload | null> {
  const secretKey = new TextEncoder().encode(ENV.cookieSecret);
  const { payload } = await jwtVerify(cookieValue, secretKey, {
    algorithms: ["HS256"],
  });

  // Validate required claims
  if (!payload.openId || !payload.appId || !payload.name) {
    return null;
  }

  return payload as SessionPayload;
}
```

#### Cookie Security

```typescript
function getSessionCookieOptions(req: Request): CookieOptions {
  const isSecure = req.protocol === "https" ||
    req.headers["x-forwarded-proto"]?.includes("https");

  return {
    httpOnly: true,           // Prevent XSS access
    path: "/",                // Site-wide
    sameSite: isSecure ? "none" : "lax",  // CSRF protection
    secure: isSecure,         // HTTPS only when available
    maxAge: ONE_YEAR_MS,      // Session duration
  };
}
```

---

## 8. Data Models

### 8.1 Users Table

```typescript
interface User {
  id: number;                    // Primary key (auto-increment)
  openId: string | null;         // Manus OAuth identifier (unique)
  googleId: string | null;       // Google OAuth identifier (unique)
  password: string | null;       // bcrypt hash (for email auth)
  name: string | null;           // Display name
  email: string;                 // Email address (required, unique)
  loginMethod: string;           // 'email' | 'google' | 'manus'
  role: string;                  // 'user' | 'admin' (default: 'user')
  onboardingCompleted: boolean;  // Has completed onboarding
  suspendedAt: Date | null;      // Account suspension timestamp
  suspensionReason: string | null; // Reason for suspension
  createdAt: Date;               // Account creation timestamp
  updatedAt: Date;               // Last update timestamp
  lastSignedIn: Date;            // Last successful login
}
```

### 8.2 Password Reset Tokens Table

```typescript
interface PasswordResetToken {
  id: number;                    // Primary key
  userId: number;                // Foreign key to users
  token: string;                 // bcrypt-hashed token
  expiresAt: Date;               // Token expiration timestamp
  usedAt: Date | null;           // When token was used (null if unused)
  createdAt: Date;               // Token creation timestamp
}
```

### 8.3 Email Verification Tokens Table

```typescript
interface EmailVerificationToken {
  id: number;                    // Primary key
  userId: number;                // Foreign key to users
  token: string;                 // bcrypt-hashed token
  expiresAt: Date;               // Token expiration timestamp
  verifiedAt: Date | null;       // When email was verified (null if unverified)
  createdAt: Date;               // Token creation timestamp
}
```

### 8.4 Login Attempts Table

```typescript
interface LoginAttempt {
  id: number;                    // Primary key
  email: string;                 // Attempted email
  ipAddress: string;             // Client IP (IPv4 or IPv6)
  userAgent: string | null;      // Client user agent
  success: boolean;              // Whether login succeeded
  failureReason: string | null;  // Reason for failure (if applicable)
  attemptedAt: Date;             // Attempt timestamp
}
```

### 8.5 Session Payload

```typescript
interface SessionPayload {
  openId: string;                // User identifier (varies by auth method)
  appId: string;                 // Application/provider identifier
  name: string;                  // User display name
  exp?: number;                  // JWT expiration timestamp
}
```

---

## 9. API Endpoints

### 9.1 Email/Password Authentication

#### POST /api/auth/signup
Create a new account with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "name": "John Doe"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "isNewUser": true,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "onboardingCompleted": false
  }
}
```

**Error Responses:**
- 400: Email and password are required
- 400: Password must be at least 8 characters
- 409: An account with this email already exists
- 500: Failed to create account

---

#### POST /api/auth/login
Authenticate with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "onboardingCompleted": true
  }
}
```

**Error Responses:**
- 400: Email and password are required
- 401: Invalid email or password
- 401: This account has no password set
- 500: Login failed

---

#### POST /api/auth/forgot-password
Request a password reset link.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If an account exists with this email, you will receive password reset instructions."
}
```

**Development Response (includes reset link):**
```json
{
  "success": true,
  "message": "If an account exists with this email, you will receive password reset instructions.",
  "resetLink": "http://localhost:5000/reset-password?token=abc123...",
  "expiresAt": "2026-01-12T10:30:00.000Z"
}
```

---

#### POST /api/auth/reset-password
Reset password using a valid token.

**Request Body:**
```json
{
  "token": "abc123...",
  "password": "NewSecureP@ss456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now login with your new password."
}
```

**Error Responses:**
- 400: Token and new password are required
- 400: Password must be at least 8 characters
- 400: Invalid or expired reset token
- 500: Failed to reset password

---

#### GET /api/auth/verify-reset-token
Verify that a reset token is valid.

**Query Parameters:**
- `token`: The reset token to verify

**Success Response (200):**
```json
{
  "valid": true,
  "expiresAt": "2026-01-12T10:30:00.000Z"
}
```

**Error Responses:**
- 400: Token is required
- 400: Invalid or expired token
- 500: Failed to verify token

---

### 9.2 Google OAuth

#### GET /api/oauth/google
Initiate Google OAuth flow.

**Response:** 302 Redirect to Google OAuth authorization URL

---

#### GET /api/oauth/google/callback
Handle Google OAuth callback.

**Query Parameters:**
- `code`: Authorization code from Google
- `error`: Error code (if authorization failed)

**Success Response:** 302 Redirect to / (dashboard)

**Error Response:** 302 Redirect to /login?error=google_auth_failed

---

#### GET /api/oauth/google/config
Get Google OAuth configuration status (debugging).

**Response (200):**
```json
{
  "clientId": "123456789.apps.googleusercontent.com",
  "redirectUri": "https://app.example.com/api/oauth/google/callback",
  "clientSecretSet": true,
  "databaseUrlSet": true,
  "databaseUrlLength": 125
}
```

---

### 9.3 Manus OAuth

#### GET /api/oauth/callback
Handle Manus OAuth callback.

**Query Parameters:**
- `code`: Authorization code from Manus
- `state`: OAuth state (base64-encoded redirect URI)

**Success Response:** 302 Redirect to /

**Error Responses:**
- 400: code and state are required
- 400: openId missing from user info
- 500: OAuth callback failed

---

### 9.4 Session Management

#### GET /api/auth/debug
Check authentication service status (debugging).

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-01-11T15:30:00.000Z",
  "vercel": false,
  "databaseUrl": "set"
}
```

---

## 10. Dependencies

### 10.1 Internal Dependencies

| Dependency | Purpose | Location |
|------------|---------|----------|
| Database Service | User storage, token storage | `server/db/index.ts` |
| Environment Config | OAuth credentials, secrets | `server/_core/env.ts` |
| Shared Constants | Cookie name, expiration times | `shared/const.ts` |
| Error Handling | ForbiddenError for auth failures | `shared/_core/errors.ts` |
| Drizzle Schema | Table definitions | `drizzle/schema.ts`, `drizzle/schema-auth.ts` |

### 10.2 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `bcryptjs` | ^3.0.0 | Password hashing |
| `jose` | ^5.0.0 | JWT signing and verification |
| `axios` | ^1.6.0 | HTTP client for OAuth |
| `cookie` | ^1.0.0 | Cookie parsing |
| `express` | ^4.18.0 | HTTP server framework |
| `crypto` | Node.js built-in | Secure random generation, SHA-256 |
| `drizzle-orm` | ^0.29.0 | Database ORM |

### 10.3 OAuth Provider Dependencies

| Provider | Configuration Required |
|----------|----------------------|
| Google | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` |
| Manus | `OAUTH_SERVER_URL`, `APP_ID`, `COOKIE_SECRET` |

### 10.4 Infrastructure Dependencies

| Component | Purpose | Requirement |
|-----------|---------|-------------|
| PostgreSQL | Data storage | v14+ |
| Node.js | Runtime environment | v18+ |
| HTTPS | Secure cookie transmission | Required for production |

### 10.5 Related Features

| Feature | Relationship | PRD Reference |
|---------|--------------|---------------|
| API Key Management | Alternative authentication for APIs | PRD-024 |
| Admin Dashboard | User management, suspension | PRD-025 |
| Settings & Preferences | Account settings, password change | PRD-023 |
| Audit Logging | Authentication event logging | PRD-012 |

---

## 11. Risks & Mitigations

### 11.1 Security Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Password database breach | Low | Critical | bcrypt hashing, salt per password, high cost factor |
| Session hijacking | Low | High | HttpOnly cookies, Secure flag, short-lived tokens (future) |
| Brute force attacks | Medium | Medium | Rate limiting, account lockout, login attempt logging |
| OAuth token theft | Low | High | Short-lived access tokens, secure redirect URIs |
| Credential stuffing | Medium | High | Rate limiting, breach detection (future), 2FA (future) |
| XSS token extraction | Low | High | HttpOnly cookies, Content-Security-Policy |

### 11.2 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| OAuth provider downtime | Low | Medium | Graceful degradation, email/password fallback |
| JWT secret compromise | Very Low | Critical | Secret rotation capability, environment isolation |
| Database performance under load | Low | Medium | Connection pooling, query optimization, indexing |
| Legacy password migration issues | Low | Low | Dual-format support, automatic upgrade |

### 11.3 Operational Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| User lockout from rate limiting | Medium | Medium | Clear error messages, admin override capability |
| Password reset email delivery failure | Medium | Medium | Logging, retry mechanism, alternative recovery (future) |
| OAuth configuration errors | Low | Medium | Configuration validation, health check endpoint |
| Session cookie compatibility | Low | Low | Environment-aware cookie settings, testing |

### 11.4 Compliance Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| GDPR consent requirements | Medium | High | Consent collection, data retention policies |
| Password storage compliance | Low | High | Industry-standard bcrypt, regular audits |
| Audit trail gaps | Medium | Medium | Comprehensive logging, log retention |
| Cross-border data transfer | Medium | Medium | Regional compliance, data localization |

---

## 12. Milestones & Timeline

### 12.1 Phase 1: Core Authentication (Weeks 1-2) - COMPLETED

| Milestone | Deliverable | Status |
|-----------|-------------|--------|
| M1.1 | User schema with authentication fields | Completed |
| M1.2 | Email/password registration endpoint | Completed |
| M1.3 | Email/password login endpoint | Completed |
| M1.4 | bcrypt password hashing | Completed |
| M1.5 | JWT session token creation | Completed |
| M1.6 | Session cookie handling | Completed |

### 12.2 Phase 2: OAuth Integration (Weeks 3-4) - COMPLETED

| Milestone | Deliverable | Status |
|-----------|-------------|--------|
| M2.1 | Google OAuth flow | Completed |
| M2.2 | Manus OAuth flow | Completed |
| M2.3 | User upsert on OAuth login | Completed |
| M2.4 | Multi-provider session handling | Completed |

### 12.3 Phase 3: Password Recovery (Weeks 5-6) - COMPLETED

| Milestone | Deliverable | Status |
|-----------|-------------|--------|
| M3.1 | Password reset token generation | Completed |
| M3.2 | Token hashing and storage | Completed |
| M3.3 | Password reset endpoint | Completed |
| M3.4 | Token verification endpoint | Completed |
| M3.5 | Password strength validation | Completed |

### 12.4 Phase 4: Security Enhancements (Weeks 7-8) - COMPLETED

| Milestone | Deliverable | Status |
|-----------|-------------|--------|
| M4.1 | Login attempt tracking | Completed |
| M4.2 | Rate limiting implementation | Completed |
| M4.3 | Account suspension support | Completed |
| M4.4 | Legacy password migration | Completed |
| M4.5 | Timing-safe comparison | Completed |

### 12.5 Phase 5: Polish & Documentation (Weeks 9-10) - IN PROGRESS

| Milestone | Deliverable | Status |
|-----------|-------------|--------|
| M5.1 | Error message standardization | In Progress |
| M5.2 | Comprehensive logging | In Progress |
| M5.3 | API documentation | In Progress |
| M5.4 | Security audit | Pending |
| M5.5 | Performance testing | Pending |

### 12.6 Future Enhancements (Backlog)

| Enhancement | Priority | Description |
|-------------|----------|-------------|
| Two-Factor Authentication (2FA) | P1 | TOTP-based second factor |
| Magic Link Login | P2 | Passwordless email login |
| Social Login Expansion | P2 | Apple, Microsoft, GitHub |
| Refresh Token Rotation | P1 | Short-lived access tokens with refresh |
| Session Management UI | P1 | View and revoke active sessions |
| Breach Detection | P2 | Check passwords against known breaches |
| WebAuthn/Passkeys | P2 | Passwordless authentication |
| SSO/SAML | P1 | Enterprise single sign-on |
| IP-based Anomaly Detection | P2 | Detect suspicious login patterns |

---

## Acceptance Criteria

### AC-001: Email/Password Registration
- [x] User can register with valid email and password
- [x] Password hashed with bcrypt before storage
- [x] Duplicate email rejected with clear error
- [x] Session established automatically after signup
- [x] User info returned in response

### AC-002: Email/Password Login
- [x] User can login with correct credentials
- [x] Invalid credentials return generic error
- [x] Suspended accounts blocked from login
- [x] Session cookie set with security flags
- [x] lastSignedIn timestamp updated

### AC-003: Google OAuth
- [x] User can initiate Google login
- [x] Authorization code exchanged for token
- [x] User info fetched from Google
- [x] Account created/updated in database
- [x] Session established and redirect to dashboard

### AC-004: Manus OAuth
- [x] User can login via Manus OAuth
- [x] Account synced from Manus platform
- [x] Session established with Manus identity

### AC-005: Password Reset
- [x] User can request password reset
- [x] Reset token generated and hashed
- [x] Token expires after 24 hours
- [x] Password can be reset with valid token
- [x] Token marked as used after reset

### AC-006: Security
- [x] Passwords never stored in plaintext
- [x] HttpOnly flag on session cookies
- [x] Rate limiting on login attempts
- [x] Login attempts logged for audit
- [x] Generic error messages (no enumeration)

### AC-007: Session Management
- [x] JWT session tokens created correctly
- [x] Tokens verified on protected routes
- [x] Expired tokens rejected
- [x] Multiple auth methods supported

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 11, 2026 | Development Team | Initial comprehensive PRD |

---

## Appendix A: Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `COOKIE_SECRET` | Yes | Secret for JWT signing (min 32 chars) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `APP_ID` | Yes | Application identifier for OAuth |
| `OAUTH_SERVER_URL` | For Manus | Manus OAuth server URL |
| `GOOGLE_CLIENT_ID` | For Google | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | For Google | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | For Google | Google OAuth callback URL |
| `APP_URL` | Yes | Application base URL (for reset links) |
| `NODE_ENV` | Yes | Environment (development/production) |

---

## Appendix B: Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Email or password incorrect |
| `ACCOUNT_SUSPENDED` | 401 | Account has been suspended |
| `NO_PASSWORD_SET` | 401 | OAuth account attempting password login |
| `EMAIL_EXISTS` | 409 | Email already registered |
| `INVALID_TOKEN` | 400 | Reset token invalid or expired |
| `PASSWORD_TOO_WEAK` | 400 | Password doesn't meet requirements |
| `RATE_LIMITED` | 429 | Too many login attempts |
| `SESSION_EXPIRED` | 401 | JWT session has expired |
| `SESSION_INVALID` | 403 | Session cookie invalid or missing |
| `USER_NOT_FOUND` | 403 | User not found in database |
| `OAUTH_ERROR` | 500 | OAuth provider error |

---

## Appendix C: Security Best Practices

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*...)

### Session Security
- HttpOnly cookies prevent JavaScript access
- Secure flag ensures HTTPS-only transmission
- SameSite attribute provides CSRF protection
- JWT expiration limits exposure window

### Rate Limiting
- 5 failed attempts per hour per email+IP
- Clear lockout after time window
- Logged for security monitoring

### Token Security
- Reset tokens hashed with bcrypt
- 24-hour expiration
- Single use (marked as used after reset)
- No token reuse possible
