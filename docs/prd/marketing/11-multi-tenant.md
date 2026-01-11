# PRD: Multi-Tenant Architecture

## Overview
A comprehensive multi-tenant system enabling secure user authentication, session management, and role-based access control for the Bottleneck-Bots platform. This architecture supports multiple authentication methods, granular permissions, and account lifecycle management.

## Problem Statement
Bottleneck-Bots requires a scalable authentication and authorization system that can:
- Support multiple organizations and users on a shared infrastructure
- Provide flexible authentication options (OAuth, email/password, social login)
- Enforce role-based permissions across different platform features
- Manage user accounts throughout their lifecycle (creation, suspension, deletion)
- Maintain data isolation between tenants while enabling platform-wide administration

## Goals & Objectives
- **Primary Goals**
  - Implement secure, scalable multi-tenant authentication
  - Enable multiple authentication providers (OAuth 2.0, Google, email/password)
  - Create granular role-based access control (RBAC) system
  - Provide administrative tools for user and account management

- **Success Metrics**
  - 99.9% authentication uptime
  - < 200ms authentication response time
  - Zero cross-tenant data leaks
  - Support for 10,000+ concurrent users per tenant
  - < 5 minute account provisioning time

## User Stories
- As a **new user**, I want to sign up with my Google account so that I can quickly access the platform
- As a **returning user**, I want to log in with email/password so that I can access my account securely
- As an **admin**, I want to assign roles to team members so that they have appropriate permissions
- As a **super admin**, I want to suspend problematic accounts so that I can protect the platform
- As a **user**, I want to manage my profile and security settings so that I maintain control of my account
- As an **organization owner**, I want to invite team members so that we can collaborate on automations

## Functional Requirements

### Must Have (P0)
- **Authentication Methods**
  - Email/password registration and login with email verification
  - OAuth 2.0 integration with Google
  - Password reset functionality with secure token generation
  - Multi-factor authentication (MFA) support

- **Session Management**
  - JWT-based session tokens with configurable expiration
  - Refresh token rotation for extended sessions
  - Secure token storage and transmission
  - Session invalidation on logout and password change

- **Role-Based Access Control**
  - Predefined roles: Super Admin, Organization Admin, Manager, Member, Viewer
  - Permission sets for each role covering all platform features
  - Role inheritance and permission cascading
  - API-level permission enforcement

- **Account Management**
  - User suspension and reactivation by admins
  - Account deletion with data retention policies
  - Organization-level user management
  - Audit logging for all account actions

### Should Have (P1)
- OAuth integration with Microsoft/Azure AD
- Single Sign-On (SSO) for enterprise customers
- Custom role creation with granular permission selection
- IP-based access restrictions
- Session management dashboard (view/revoke active sessions)

### Nice to Have (P2)
- Passwordless authentication (magic links)
- Biometric authentication support
- SAML 2.0 integration
- Hardware security key support (WebAuthn)
- Federated identity across multiple organizations

## Non-Functional Requirements

### Performance
- Authentication requests processed within 200ms (p95)
- Token validation within 10ms
- Support 1000 concurrent login attempts
- Graceful degradation under load

### Security
- All passwords hashed using bcrypt (cost factor 12+)
- JWT tokens signed with RS256 algorithm
- HTTPS-only communication
- Rate limiting on authentication endpoints (10 attempts/minute)
- OWASP Top 10 compliance
- Regular security audits and penetration testing

### Scalability
- Horizontal scaling for authentication services
- Stateless session management for load balancing
- Database sharding by tenant ID
- Caching layer for permission checks

## Technical Requirements

### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway / Load Balancer               │
├─────────────────────────────────────────────────────────────┤
│                     Authentication Service                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ OAuth2/OIDC │  │   JWT Auth  │  │  Session Manager    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    Authorization Service                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ RBAC Engine │  │ Permission  │  │  Policy Evaluator   │  │
│  │             │  │   Cache     │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      Data Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Users DB   │  │  Roles DB   │  │  Audit Log DB       │  │
│  │ (Postgres)  │  │ (Postgres)  │  │  (TimescaleDB)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Dependencies
- **Supabase Auth**: Primary authentication provider
- **PostgreSQL**: User and role data storage
- **Redis**: Session and permission caching
- **Google OAuth**: Social login integration
- **SendGrid/Resend**: Transactional emails (verification, password reset)

### APIs
- `POST /auth/register` - User registration
- `POST /auth/login` - Email/password login
- `POST /auth/oauth/{provider}` - OAuth authentication
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - Session termination
- `POST /auth/password/reset` - Password reset request
- `PUT /auth/password` - Password update
- `GET /users` - List users (admin)
- `PUT /users/{id}/suspend` - Suspend user (admin)
- `PUT /users/{id}/roles` - Update user roles (admin)

### Database Schema
```sql
-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  organization_id UUID REFERENCES organizations(id),
  status VARCHAR(20) DEFAULT 'active', -- active, suspended, deleted
  email_verified BOOLEAN DEFAULT FALSE,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Roles
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id),
  role_id UUID REFERENCES roles(id),
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  token_hash VARCHAR(255) NOT NULL,
  refresh_token_hash VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Log
CREATE TABLE auth_audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Authentication Success Rate | > 99.5% | Monitoring dashboard |
| Average Login Time | < 200ms | APM tracking |
| MFA Adoption Rate | > 40% | User analytics |
| Failed Login Attempts | < 1% legitimate users | Security logs |
| Account Provisioning Time | < 5 minutes | Onboarding funnel |
| Cross-Tenant Data Isolation | 100% | Penetration testing |

## Dependencies
- Supabase project setup and configuration
- Google Cloud Console OAuth credentials
- Email service provider integration
- Redis cluster for production caching
- Monitoring and alerting infrastructure

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| OAuth provider outage | High - Users cannot login | Implement multiple auth methods, graceful fallback to email/password |
| JWT secret compromise | Critical - All sessions vulnerable | Use RSA keys, implement key rotation, monitor for unusual activity |
| Cross-tenant data leak | Critical - Trust violation | Strict tenant isolation at database and API levels, regular security audits |
| Session hijacking | High - Account compromise | Secure token storage, session binding to IP/device, short token expiry |
| Brute force attacks | Medium - Service degradation | Rate limiting, CAPTCHA, account lockout policies |
| User data breach | Critical - Legal and trust issues | Encryption at rest, minimal data collection, regular security training |
