# Authentication & Cookie Configuration

## Overview

This document describes the session/cookie configuration for the GHL Agency AI application, including production deployment considerations and troubleshooting.

## Cookie Configuration

### Session Cookie Settings

The session cookie (`app_session_id`) is configured in `/server/_core/cookies.ts`:

| Setting | Value | Description |
|---------|-------|-------------|
| `httpOnly` | `true` | Prevents JavaScript access (XSS protection) |
| `path` | `/` | Cookie available site-wide |
| `sameSite` | `lax` | Allows cookies on top-level navigations (OAuth redirects) |
| `secure` | Dynamic | `true` on Vercel/HTTPS, `false` on localhost |
| `domain` | Not set | Browser uses current domain |
| `maxAge` | 1 year | Cookie expiration |

### Why `sameSite: "lax"` (not `"none"` or `"strict"`)?

- **`"strict"`**: Would break OAuth redirects (cookie not sent after redirect from Google)
- **`"none"`**: Requires third-party cookie support, blocked by some browsers
- **`"lax"`**: Best compatibility - cookies sent on same-site requests AND top-level navigations

## Authentication Flow

### Google OAuth Flow

1. User clicks "Login with Google" -> `/api/oauth/google`
2. Redirects to Google consent screen
3. Google redirects back to `/api/oauth/google/callback`
4. Server exchanges code for tokens
5. Server creates JWT session token
6. Server sets `app_session_id` cookie with session token
7. Redirects to `/` (dashboard)

### Session Verification

On each authenticated request:
1. tRPC context extracts `cookie` header from request
2. SDK parses cookies using `cookie.parse()`
3. JWT token is verified using HS256 algorithm
4. User is looked up in database by `openId` or `googleId`

## Production Deployment (Vercel)

### Environment Variables Required

```
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_REDIRECT_URI=https://www.ghlagencyai.com/api/oauth/google/callback
COOKIE_SECRET=<random-32-character-string>
DATABASE_URL=<supabase-postgres-connection-string>
```

### Cookie Domain Considerations

- **Don't set explicit domain** - Let browser determine from current URL
- Works across both `ghl-agency-ai.vercel.app` and `www.ghlagencyai.com`
- Each domain stores its own cookies independently

### Debug Auth Issues

Set environment variable `DEBUG_AUTH=1` on Vercel to enable detailed auth logging:
- Logs cookie header presence
- Logs session verification results
- Logs user lookup results

## Common Issues & Solutions

### Issue: Cookie not sent to API after login

**Symptoms:**
- Login succeeds (redirects to dashboard)
- `auth.me` returns `null`
- Browser DevTools shows cookie was set

**Causes & Solutions:**

1. **HTTPS mismatch**
   - Ensure `secure: true` for production
   - Check `x-forwarded-proto` header handling

2. **SameSite blocking**
   - Verify `sameSite: "lax"` is set
   - Check if request is cross-origin

3. **Domain mismatch**
   - Don't set explicit domain
   - Verify same domain for login and API calls

4. **Path mismatch**
   - Ensure `path: "/"` is set
   - Cookie should be available site-wide

### Issue: Session expires unexpectedly

**Causes:**
- `maxAge` not set correctly
- Cookie cleared by logout
- JWT expiration reached

**Debug:**
```javascript
// In browser console
document.cookie.split(';').find(c => c.includes('app_session_id'))
```

### Issue: Different sessions on different domains

**Expected Behavior:**
- `ghl-agency-ai.vercel.app` and `www.ghlagencyai.com` have separate sessions
- This is normal because cookies are domain-scoped

**If sharing is needed:**
- Would require setting `domain: ".ghlagencyai.com"`
- Only works for subdomain sharing, not across different TLDs

## Files Reference

| File | Purpose |
|------|---------|
| `server/_core/cookies.ts` | Cookie configuration function |
| `server/_core/sdk.ts` | Session token creation & verification |
| `server/_core/context.ts` | tRPC context with auth |
| `server/_core/google-auth.ts` | Google OAuth routes |
| `server/_core/email-auth.ts` | Email/password auth routes |
| `shared/const.ts` | Cookie name & expiration constants |

## Changelog

### 2025-12-11
- Added comprehensive auth debugging
- Documented cookie configuration for production
- Added `DEBUG_AUTH` environment variable support
- Improved logging in context creation and Google auth callback

---

*Last updated: 2025-12-11*
*Maintainer: AI-generated documentation*
