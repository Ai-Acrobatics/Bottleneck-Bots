# GHL Agency AI - Authentication Guide

**Complete guide for authenticating with the GHL Agency AI API and managing user accounts**

## Table of Contents

1. [Overview](#overview)
2. [API Key Authentication](#api-key-authentication)
3. [OAuth 2.0 Authentication](#oauth-20-authentication)
4. [Email/Password Authentication](#emailpassword-authentication)
5. [Session Management](#session-management)
6. [Security Best Practices](#security-best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Overview

GHL Agency AI supports multiple authentication methods to suit different use cases:

| Method | Use Case | Security Level |
|--------|----------|-----------------|
| **API Keys** | Server-to-server, integrations | High |
| **OAuth 2.0** | Third-party applications, user consent | Very High |
| **Email/Password** | User accounts, web dashboards | High |
| **Session Cookies** | Web browsers, interactive apps | High |

### Authentication Flow Diagram

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ├─────────────────────────┬──────────────────────┬─────────────────┐
       │                         │                      │                 │
       v                         v                      v                 v
  ┌─────────┐            ┌────────────┐          ┌──────────┐      ┌──────────┐
  │ API Key │            │   OAuth    │          │ Email/   │      │ Session  │
  │         │            │   2.0      │          │ Password │      │ Cookie   │
  │ Bearer  │            │            │          │          │      │          │
  │ Token   │            │ Code Grant │          │ Username │      │ HTTP Only│
  └────┬────┘            └────┬───────┘          │ Password │      │ Cookie   │
       │                      │                  └────┬─────┘      └────┬─────┘
       │                      │                       │                 │
       └──────────────────────┴───────────────────────┴─────────────────┘
                              │
                              v
                    ┌──────────────────┐
                    │   Authenticated  │
                    │     Request      │
                    └──────────────────┘
```

---

## API Key Authentication

### What are API Keys?

API Keys are long, random strings that authenticate your application to the GHL Agency AI API. They're used for:

- Server-to-server communication
- External integrations
- Automated workflows
- Machine-to-machine authentication

### API Key Format

All GHL API keys follow this format:

```
ghl_<32-character-random-string>
```

**Example:**
```
ghl_a7f3c1d8e9b2g4h6j8k0l2m4n6p8r0s2
```

### Creating an API Key

#### Method 1: Using the Dashboard

1. Go to Settings → API Keys
2. Click "Create New Key"
3. Enter a name and description
4. Select required scopes
5. Set rate limits (optional)
6. Click "Create"
7. Copy the key (you won't see it again)

#### Method 2: Using tRPC

```typescript
import { trpc } from '@/lib/trpc-client';

// Create an API key
const result = await trpc.apiKeys.create.mutate({
  name: "My Integration",
  description: "For external integrations",
  scopes: [
    "tasks:read",
    "tasks:write",
    "tasks:execute",
  ],
  expiresInDays: 90, // Optional: key expires in 90 days
  rateLimitPerMinute: 100,
  rateLimitPerHour: 1000,
  rateLimitPerDay: 10000,
});

// Save the key securely
const apiKey = result.key.apiKey; // ghl_xxxxxxxxxxxx
console.log("API Key:", apiKey);

// This will be displayed only once!
// Make sure to save it immediately
```

### Using API Keys

#### In HTTP Requests

Include your API key in the `Authorization` header:

```http
GET /api/v1/tasks HTTP/1.1
Authorization: Bearer ghl_your_api_key_here
```

#### Using cURL

```bash
curl -X GET https://api.ghl-agency.ai/api/v1/tasks \
  -H "Authorization: Bearer ghl_your_api_key_here"
```

#### Using JavaScript/Fetch

```javascript
const apiKey = 'ghl_your_api_key_here';

const response = await fetch('https://api.ghl-agency.ai/api/v1/tasks', {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
```

#### Using Environment Variables

```bash
# .env file
GHL_API_KEY=ghl_your_api_key_here
```

```javascript
// Load from environment
const apiKey = process.env.GHL_API_KEY;

// Use in requests
const headers = {
  'Authorization': `Bearer ${apiKey}`,
};
```

### API Key Scopes

API keys can be restricted to specific operations using scopes:

| Scope | Permission |
|-------|-----------|
| `*` | Full access to all endpoints |
| `tasks:read` | Read tasks and execution history |
| `tasks:write` | Create, update, and delete tasks |
| `tasks:execute` | Trigger task execution |
| `executions:read` | Read execution details and logs |
| `templates:read` | Browse and use templates |

#### Scope Examples

```typescript
// Read-only API key
const readOnlyKey = await trpc.apiKeys.create.mutate({
  name: "Read-Only Key",
  scopes: ["tasks:read", "executions:read"],
});

// Write-only API key
const writeKey = await trpc.apiKeys.create.mutate({
  name: "Write Key",
  scopes: ["tasks:write"],
});

// Full access API key
const fullAccessKey = await trpc.apiKeys.create.mutate({
  name: "Admin Key",
  scopes: ["*"],
});
```

### Managing API Keys

#### List API Keys

```typescript
const keys = await trpc.apiKeys.list.query({
  page: 1,
  limit: 20,
});

console.log(keys.data);
```

#### Update API Key

```typescript
await trpc.apiKeys.update.mutate({
  id: keyId,
  name: "Updated Key Name",
  scopes: ["tasks:read"],
  rateLimitPerMinute: 50,
});
```

#### Revoke API Key

```typescript
await trpc.apiKeys.revoke.mutate({
  id: keyId,
});
```

#### Get Key Usage Statistics

```typescript
const stats = await trpc.apiKeys.getUsage.query({
  id: keyId,
  period: "7d", // last 7 days
});

console.log(stats);
// {
//   requests: 1250,
//   errors: 5,
//   rateLimitErrors: 0,
//   averageResponseTime: 245
// }
```

### API Key Security

#### Best Practices

1. **Never hardcode keys**
   ```javascript
   // ❌ Bad
   const apiKey = 'ghl_abc123...';

   // ✅ Good
   const apiKey = process.env.GHL_API_KEY;
   ```

2. **Use environment variables**
   ```bash
   # .env (add to .gitignore)
   GHL_API_KEY=ghl_your_key_here
   ```

3. **Rotate keys regularly**
   - Generate new keys every 90 days
   - Revoke old keys after migration
   - Use expiration dates when possible

4. **Use minimal scopes**
   - Grant only necessary permissions
   - Create separate keys for different purposes
   - Example: separate keys for reading and writing

5. **Monitor key usage**
   ```typescript
   // Set up alerts for unusual activity
   async function monitorKeyUsage() {
     const stats = await trpc.apiKeys.getUsage.query({ id: keyId });

     if (stats.rateLimitErrors > 100) {
       console.warn('⚠️ High rate limit errors detected!');
       // Send alert
     }
   }
   ```

6. **Revoke unused keys**
   ```typescript
   // Clean up old keys
   const keys = await trpc.apiKeys.list.query({});
   for (const key of keys.data) {
     if (!key.lastUsedAt || isOlderThan90Days(key.lastUsedAt)) {
       await trpc.apiKeys.revoke.mutate({ id: key.id });
     }
   }
   ```

---

## OAuth 2.0 Authentication

### What is OAuth 2.0?

OAuth 2.0 is an authorization framework that allows users to grant third-party applications access to their GHL account without sharing passwords.

**Use cases:**
- Third-party integrations
- Browser-based applications
- User authentication with consent
- Delegated access

### OAuth 2.0 Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Click "Login with GHL"
       │
       v
┌──────────────────┐
│  Your App        │
│ (Client App)     │
└────────┬─────────┘
         │
         │ 2. Redirect to GHL
         │    /oauth/authorize
         v
    ┌──────────────────┐
    │  GHL OAuth       │
    │  Authorization   │
    │  Server          │
    └────────┬─────────┘
             │
             │ 3. Show consent screen
             │
             v
         ┌───────┐
         │ User  │
         │grants │
         │access │
         └───┬───┘
             │
             │ 4. Redirect back with code
             │    /callback?code=xxx
             v
     ┌──────────────────┐
     │  Your App        │
     │  Backend         │
     └────────┬─────────┘
              │
              │ 5. Exchange code for token
              │    POST /oauth/token
              v
         ┌──────────────────┐
         │  GHL OAuth       │
         │  Authorization   │
         │  Server          │
         │  (Returns token) │
         └────────┬─────────┘
                  │
                  │ 6. Return access token
                  │
                  v
         ┌──────────────────┐
         │  Your App        │
         │  (Has token)     │
         │  Can API calls   │
         └──────────────────┘
```

### Implementing OAuth

#### Step 1: Register Your Application

1. Go to Dashboard → OAuth Applications
2. Click "Create Application"
3. Enter application details:
   - App Name
   - Redirect URI (e.g., `https://yourapp.com/auth/callback`)
   - Description
   - Logo URL
4. Save Client ID and Client Secret

#### Step 2: Request Authorization

Direct users to the authorization URL:

```typescript
const authorizeUrl = new URL('https://api.ghl-agency.ai/oauth/authorize');
authorizeUrl.searchParams.append('client_id', CLIENT_ID);
authorizeUrl.searchParams.append('redirect_uri', REDIRECT_URI);
authorizeUrl.searchParams.append('response_type', 'code');
authorizeUrl.searchParams.append('scope', 'tasks:read tasks:write');
authorizeUrl.searchParams.append('state', generateRandomState());

// Redirect user
window.location.href = authorizeUrl.toString();
```

#### Step 3: Handle Callback

```typescript
// /auth/callback route
export async function handleOAuthCallback(req: Request) {
  const { code, state } = req.query;

  // Verify state to prevent CSRF attacks
  if (!verifyState(state)) {
    throw new Error('Invalid state parameter');
  }

  // Exchange code for token
  const tokenResponse = await fetch('https://api.ghl-agency.ai/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const { access_token, refresh_token, expires_in } = await tokenResponse.json();

  // Store tokens securely
  await storeTokens(userId, access_token, refresh_token);

  // Redirect to dashboard
  return redirect('/dashboard');
}
```

#### Step 4: Make Authenticated Requests

```typescript
async function makeAuthenticatedRequest(accessToken: string) {
  const response = await fetch('https://api.ghl-agency.ai/api/v1/tasks', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.json();
}
```

### Token Refresh

Access tokens expire, but you can use refresh tokens to get new ones:

```typescript
async function refreshAccessToken(refreshToken: string) {
  const response = await fetch('https://api.ghl-agency.ai/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  const { access_token, refresh_token: newRefreshToken } =
    await response.json();

  // Store new tokens
  await storeTokens(userId, access_token, newRefreshToken);

  return access_token;
}
```

### OAuth Scopes

| Scope | Permission |
|-------|-----------|
| `tasks:read` | Read tasks |
| `tasks:write` | Create/update tasks |
| `tasks:execute` | Execute tasks |
| `executions:read` | Read execution history |
| `templates:read` | Browse templates |
| `user:profile` | Read user profile |

---

## Email/Password Authentication

### User Registration

#### Frontend Registration Form

```typescript
// components/SignupForm.tsx
import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const signup = trpc.auth.signup.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signup.mutateAsync({
        email,
        password,
        name,
      });

      if (result.success) {
        // Redirect to dashboard
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name"
        required
      />

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  );
}
```

#### Backend Registration Endpoint

```typescript
// server/api/routers/auth.ts
import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getDb } from '../db';
import { users } from '../../../drizzle/schema';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export const authRouter = router({
  signup: publicProcedure.input(signupSchema).mutation(async ({ input }) => {
    const db = getDb();

    // Check if user exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (existing.length > 0) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 12);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: input.email,
        password: hashedPassword,
        name: input.name,
        loginMethod: 'email',
      })
      .returning();

    return {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    };
  }),
});
```

### User Login

#### Frontend Login Form

```typescript
// components/LoginForm.tsx
import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = trpc.auth.login.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login.mutateAsync({
        email,
        password,
      });

      if (result.success) {
        // Session cookie automatically set
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
}
```

#### Backend Login Endpoint

```typescript
// server/api/routers/auth.ts
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRouter.login = publicProcedure
  .input(loginSchema)
  .mutation(async ({ input, ctx }) => {
    const db = getDb();

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isValid = await bcrypt.compare(input.password, user.password!);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Set session cookie
    ctx.res.setHeader(
      'Set-Cookie',
      serialize('session', user.id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      })
    );

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  });
```

### Password Reset

#### Request Password Reset

```typescript
// Frontend
const resetRequest = await trpc.auth.requestPasswordReset.mutate({
  email: 'user@example.com',
});

// Backend
authRouter.requestPasswordReset = publicProcedure
  .input(z.object({ email: z.string().email() }))
  .mutation(async ({ input }) => {
    const db = getDb();

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (!user) {
      // Don't reveal if email exists (security best practice)
      return { success: true };
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(token, 12);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token
    await db
      .insert(passwordResetTokens)
      .values({
        userId: user.id,
        token: hashedToken,
        expiresAt,
      });

    // Send email with reset link
    await sendPasswordResetEmail(user.email, token);

    return { success: true };
  });
```

#### Reset Password

```typescript
// Frontend
const reset = await trpc.auth.resetPassword.mutate({
  token: urlParams.get('token'),
  newPassword: 'NewPassword123!',
});

// Backend
authRouter.resetPassword = publicProcedure
  .input(
    z.object({
      token: z.string(),
      newPassword: z.string().min(8),
    })
  )
  .mutation(async ({ input }) => {
    const db = getDb();

    // Find token
    const [tokenRecord] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, input.token))
      .limit(1);

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(input.newPassword, 12);

    // Update user password
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, tokenRecord.userId));

    // Delete token
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.id, tokenRecord.id));

    return { success: true };
  });
```

---

## Session Management

### Session Cookies

Sessions are managed via HTTP-only cookies:

```typescript
// Cookie configuration
const cookieOptions = {
  httpOnly: true, // Cannot be accessed from JavaScript
  secure: true, // HTTPS only
  sameSite: 'lax', // CSRF protection
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/',
};
```

### Checking Session Status

```typescript
// Frontend
const session = await trpc.auth.getSession.query();

if (!session) {
  // User not logged in
  redirect('/login');
}

// Logged in user
console.log(session.user);
```

### Logout

```typescript
// Frontend
const logout = await trpc.auth.logout.mutate();
window.location.href = '/login';

// Backend
authRouter.logout = protectedProcedure.mutation(async ({ ctx }) => {
  // Clear session cookie
  ctx.res.setHeader('Set-Cookie', serialize('session', '', { maxAge: 0 }));
  return { success: true };
});
```

### Session Timeout

Configure session timeout duration:

```typescript
// 24 hours (default)
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

// Extend session on activity
function extendSession(ctx: any) {
  ctx.res.setHeader(
    'Set-Cookie',
    serialize('session', ctx.userId, {
      ...cookieOptions,
      maxAge: SESSION_DURATION_MS,
    })
  );
}
```

---

## Security Best Practices

### Password Requirements

Enforce strong passwords:

```typescript
function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### Rate Limiting

Protect against brute force attacks:

```typescript
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

async function checkRateLimit(email: string) {
  const now = Date.now();
  const attempts = loginAttempts.get(email);

  if (!attempts || now > attempts.resetAt) {
    loginAttempts.set(email, { count: 0, resetAt: now + 60 * 60 * 1000 });
    return true;
  }

  if (attempts.count >= 5) {
    throw new Error('Too many login attempts. Please try again later.');
  }

  loginAttempts.set(email, { count: attempts.count + 1, resetAt: attempts.resetAt });
  return true;
}
```

### Email Verification

Require users to verify their email:

```typescript
authRouter.sendVerificationEmail = publicProcedure
  .input(z.object({ email: z.string().email() }))
  .mutation(async ({ input }) => {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(token, 12);

    // Store verification token
    await db
      .insert(emailVerificationTokens)
      .values({
        userEmail: input.email,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours
      });

    // Send verification email
    await sendVerificationEmail(input.email, token);

    return { success: true };
  });

authRouter.verifyEmail = publicProcedure
  .input(z.object({ token: z.string() }))
  .mutation(async ({ input }) => {
    // Verify token and mark email as verified
    return { success: true };
  });
```

### Two-Factor Authentication (Optional)

```typescript
authRouter.enable2FA = protectedProcedure.mutation(async ({ ctx }) => {
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `GHL Agency AI (${ctx.user.email})`,
  });

  // Return QR code for user to scan
  return {
    secret: secret.base32,
    qrCode: QRCode.toDataURL(secret.otpauth_url),
  };
});

authRouter.verify2FA = protectedProcedure
  .input(z.object({ code: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const verified = speakeasy.totp.verify({
      secret: ctx.user.twoFactorSecret,
      encoding: 'base32',
      token: input.code,
    });

    if (!verified) {
      throw new Error('Invalid 2FA code');
    }

    return { success: true };
  });
```

---

## Troubleshooting

### Issue: "Invalid Credentials"

**Symptoms:**
- Login fails with "Invalid email or password"
- Account creation fails

**Solutions:**
1. Verify email is correct
2. Check password meets requirements
3. Ensure no spaces in email
4. Try password reset if forgotten
5. Check if account is suspended

### Issue: "Session Expired"

**Symptoms:**
- Redirected to login after inactivity
- Need to log in again

**Solutions:**
1. This is expected after 24 hours
2. Check browser cookies are enabled
3. Clear browser cache and cookies
4. Try in private/incognito mode
5. Check server time sync

### Issue: "OAuth Code Exchange Failed"

**Symptoms:**
- OAuth callback shows error
- "Invalid authorization code"

**Solutions:**
1. Verify Client ID and Secret are correct
2. Check Redirect URI matches registration
3. Ensure authorization code hasn't expired
4. Verify request headers are correct
5. Check server logs for details

### Issue: "Password Reset Token Invalid"

**Symptoms:**
- Password reset link shows error
- "Invalid or expired token"

**Solutions:**
1. Request new password reset email
2. Check email link hasn't been modified
3. Verify link clicked within 24 hours
4. Check for JavaScript errors in browser console
5. Try different browser or device

---

## Security Checklist

Before deploying authentication:

- [ ] API keys stored in environment variables
- [ ] Session cookies are HTTP-only and secure
- [ ] Passwords hashed with bcrypt (12 rounds)
- [ ] Rate limiting on login attempts
- [ ] Email verification required
- [ ] Password reset token expiration (24 hours)
- [ ] HTTPS enforced in production
- [ ] CSRF protection enabled
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS protection enabled
- [ ] Regular security audits scheduled
- [ ] Monitoring of suspicious activity
- [ ] Incident response plan documented

---

## Additional Resources

- **OpenID Connect**: https://openid.net/connect/
- **OAuth 2.0 Spec**: https://tools.ietf.org/html/rfc6749
- **OWASP Authentication**: https://owasp.org/www-community/Authentication
- **Password Best Practices**: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

---

**Last Updated:** 2025-01-19
**Version:** 1.0.0
