# Settings Router Documentation

Comprehensive tRPC API router for user settings, OAuth integrations, and webhooks.

## Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [API Keys Management](#api-keys-management)
3. [OAuth Integrations](#oauth-integrations)
4. [Webhook Management](#webhook-management)
5. [User Preferences](#user-preferences)
6. [Security Considerations](#security-considerations)
7. [Usage Examples](#usage-examples)

---

## Setup & Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
# ========================================
# ENCRYPTION (REQUIRED)
# ========================================
# Generate with: openssl rand -hex 32
ENCRYPTION_KEY=your_32_byte_hex_encryption_key_here

# ========================================
# OAUTH - GOOGLE
# ========================================
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/oauth/callback/google

# ========================================
# OAUTH - GMAIL
# ========================================
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REDIRECT_URI=http://localhost:3000/api/oauth/callback/gmail

# ========================================
# OAUTH - OUTLOOK
# ========================================
OUTLOOK_CLIENT_ID=your_outlook_client_id
OUTLOOK_CLIENT_SECRET=your_outlook_client_secret
OUTLOOK_REDIRECT_URI=http://localhost:3000/api/oauth/callback/outlook

# ========================================
# OAUTH - FACEBOOK
# ========================================
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/oauth/callback/facebook

# ========================================
# OAUTH - INSTAGRAM
# ========================================
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/oauth/callback/instagram

# ========================================
# OAUTH - LINKEDIN
# ========================================
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/oauth/callback/linkedin
```

### Generate Encryption Key

```bash
openssl rand -hex 32
```

---

## API Keys Management

### List API Keys

Get all configured API keys (returns masked keys for security).

```typescript
const { apiKeys } = await trpc.settings.listApiKeys.query();

// Response:
// {
//   apiKeys: [
//     {
//       service: "openai",
//       maskedKey: "sk-p...xyz",
//       isConfigured: true,
//       createdAt: "2025-01-15T10:00:00Z"
//     }
//   ]
// }
```

### Save API Key

Store an encrypted API key.

```typescript
const result = await trpc.settings.saveApiKey.mutate({
  service: "openai",
  apiKey: "sk-proj-abc123...",
  label: "Production OpenAI Key", // Optional
});

// Response:
// {
//   success: true,
//   message: "API key for openai saved successfully",
//   service: "openai"
// }
```

**Supported Services:**
- `openai`
- `browserbase`
- `anthropic`
- `google`
- `stripe`
- `twilio`
- `sendgrid`
- `custom`

### Delete API Key

```typescript
await trpc.settings.deleteApiKey.mutate({
  service: "openai",
});
```

### Test API Key

Validate that an API key works correctly.

```typescript
const result = await trpc.settings.testApiKey.mutate({
  service: "openai",
});

// Response:
// {
//   success: true,
//   message: "API key for openai is valid",
//   isValid: true
// }
```

**PLACEHOLDER:** Service-specific validation needs to be implemented in the router. Example:

```typescript
// In settings.ts, testApiKey mutation:
if (input.service === "openai") {
  const response = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) throw new Error("Invalid API key");
}
```

---

## OAuth Integrations

### List Integrations

Get all connected OAuth integrations.

```typescript
const { integrations } = await trpc.settings.listIntegrations.query();

// Response:
// {
//   integrations: [
//     {
//       id: 1,
//       service: "gmail",
//       isActive: "true",
//       expiresAt: "2025-02-15T10:00:00Z",
//       isExpired: false,
//       createdAt: "2025-01-15T10:00:00Z"
//     }
//   ]
// }
```

### Initiate OAuth Flow

Start OAuth authorization flow.

```typescript
const { authorizationUrl, state, codeVerifier } =
  await trpc.settings.initiateOAuth.mutate({
    provider: "gmail",
  });

// Redirect user to authorizationUrl
// Store state and codeVerifier in session/cache for callback validation
```

**Supported Providers:**
- `google` - Google OAuth (basic profile)
- `gmail` - Gmail API access
- `outlook` - Microsoft Outlook/Office 365
- `facebook` - Facebook Graph API
- `instagram` - Instagram Basic Display API
- `linkedin` - LinkedIn API

### Handle OAuth Callback

Process OAuth callback and exchange code for tokens.

```typescript
// After user authorizes and is redirected back with ?code=xxx&state=xxx
const result = await trpc.settings.handleOAuthCallback.mutate({
  provider: "gmail",
  code: searchParams.get("code"),
  state: searchParams.get("state"),
  codeVerifier: sessionStorage.getItem("codeVerifier"),
});

// Response:
// {
//   success: true,
//   message: "gmail connected successfully",
//   provider: "gmail",
//   expiresAt: "2025-02-15T10:00:00Z"
// }
```

**PLACEHOLDER:** State validation is currently not implemented. In production:

```typescript
// Before initiating OAuth, store in Redis/session:
await redis.setex(`oauth:${state}`, 600, JSON.stringify({
  userId: ctx.user.id,
  codeVerifier,
  provider
}));

// In handleOAuthCallback, validate:
const storedData = await redis.get(`oauth:${input.state}`);
if (!storedData || storedData.userId !== ctx.user.id) {
  throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid state" });
}
```

### Refresh OAuth Token

Refresh expired access token using refresh token.

```typescript
const result = await trpc.settings.refreshOAuthToken.mutate({
  integrationId: 1,
});

// Response:
// {
//   success: true,
//   message: "Token refreshed successfully",
//   expiresAt: "2025-02-15T10:00:00Z"
// }
```

### Disconnect Integration

Revoke and remove OAuth integration.

```typescript
await trpc.settings.disconnectIntegration.mutate({
  integrationId: 1,
});

// Response:
// {
//   success: true,
//   message: "gmail disconnected successfully"
// }
```

**PLACEHOLDER:** Token revocation with provider needs implementation:

```typescript
// Example for Google:
const accessToken = decrypt(integration.accessToken);
await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
  method: "POST"
});
```

### Test Integration

Test if OAuth connection is still valid.

```typescript
const result = await trpc.settings.testIntegration.mutate({
  integrationId: 1,
});

// Response:
// {
//   success: true,
//   message: "Integration is working correctly",
//   isValid: true,
//   isExpired: false
// }
```

---

## Webhook Management

### List Webhooks

Get all webhooks with plan limit information.

```typescript
const { webhooks, planLimits, canCreateMore } =
  await trpc.settings.listWebhooks.query();

// Response:
// {
//   webhooks: [
//     {
//       id: "uuid-1",
//       name: "Quiz Completion Notifications",
//       url: "https://api.example.com/webhooks/quiz-complete",
//       events: ["quiz.completed"],
//       secret: "whsec_abc123...",
//       isActive: true,
//       createdAt: "2025-01-15T10:00:00Z",
//       deliveryCount: 42
//     }
//   ],
//   planLimits: {
//     maxWebhooks: 10,
//     webhooksUsed: 1
//   },
//   canCreateMore: true
// }
```

**PLACEHOLDER:** Plan limits are currently hardcoded. Implement based on user subscription:

```typescript
// Query user's subscription plan
const subscription = await db.query.subscriptions.findFirst({
  where: eq(subscriptions.userId, ctx.user.id)
});

const planLimits = {
  maxWebhooks: subscription.plan === "free" ? 3
    : subscription.plan === "pro" ? 10
    : 999, // enterprise
};
```

### Create Webhook

Create a new webhook with automatic secret generation.

```typescript
const { webhook } = await trpc.settings.createWebhook.mutate({
  name: "Quiz Completion Notifications",
  url: "https://api.example.com/webhooks/quiz-complete",
  events: ["quiz.completed", "quiz.started"],
  description: "Send notifications when quizzes are completed",
  isActive: true,
});

// Response includes signing secret
// {
//   success: true,
//   webhook: {
//     id: "uuid-1",
//     secret: "whsec_abc123..."
//     // ... other fields
//   }
// }
```

**Webhook Events:**
- `quiz.completed` - User completes a quiz
- `workflow.executed` - Workflow execution finishes
- `task.completed` - Scheduled task completes
- `lead.created` - New lead is created
- `integration.connected` - OAuth integration connected
- `integration.disconnected` - OAuth integration disconnected
- `all` - Subscribe to all events

### Update Webhook

```typescript
await trpc.settings.updateWebhook.mutate({
  id: "uuid-1",
  name: "Updated Webhook Name",
  events: ["quiz.completed", "workflow.executed"],
  isActive: false, // Pause webhook
});
```

### Delete Webhook

```typescript
await trpc.settings.deleteWebhook.mutate({
  id: "uuid-1",
});
```

### Test Webhook

Send a test payload to verify webhook endpoint.

```typescript
const result = await trpc.settings.testWebhook.mutate({
  id: "uuid-1",
});

// Response:
// {
//   success: true,
//   statusCode: 200,
//   message: "Test webhook delivered successfully",
//   responseBody: "{\"received\":true}"
// }
```

**Test Payload Format:**

```json
{
  "event": "webhook.test",
  "timestamp": "2025-01-15T10:00:00Z",
  "data": {
    "message": "This is a test webhook delivery",
    "userId": 1,
    "webhookId": "uuid-1"
  }
}
```

**Headers:**
- `Content-Type: application/json`
- `X-Webhook-Signature: <hmac-sha256-signature>`
- `X-Webhook-ID: <webhook-id>`

### Get Webhook Logs

View webhook delivery history and status.

```typescript
const { logs, total } = await trpc.settings.getWebhookLogs.query({
  webhookId: "uuid-1",
  limit: 50,
  offset: 0,
});
```

**PLACEHOLDER:** Webhook logging needs to be implemented with dedicated table.

### Regenerate Webhook Secret

Generate a new signing secret for webhook.

```typescript
const { secret } = await trpc.settings.regenerateSecret.mutate({
  id: "uuid-1",
});

// Response:
// {
//   success: true,
//   secret: "whsec_new_secret_here",
//   message: "Webhook secret regenerated successfully"
// }
```

### Verify Webhook Signature (Server-side)

When receiving webhook on your endpoint:

```typescript
import crypto from "crypto";

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// In your webhook endpoint:
app.post("/api/webhooks/quiz-complete", (req, res) => {
  const signature = req.headers["x-webhook-signature"];
  const payload = JSON.stringify(req.body);
  const secret = "whsec_your_secret_here";

  if (!verifyWebhookSignature(payload, signature, secret)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  // Process webhook payload
  console.log("Event:", req.body.event);
  console.log("Data:", req.body.data);

  res.json({ received: true });
});
```

---

## User Preferences

### Get Preferences

Retrieve all user preferences and defaults.

```typescript
const preferences = await trpc.settings.getPreferences.query();

// Response:
// {
//   theme: "dark",
//   notifications: {
//     email: true,
//     browser: true,
//     workflow: false
//   },
//   defaultBrowserConfig: {
//     headless: true,
//     viewport: { width: 1920, height: 1080 }
//   },
//   defaultWorkflowSettings: {
//     timeout: 300,
//     retryOnFailure: true
//   }
// }
```

### Update Preferences

```typescript
await trpc.settings.updatePreferences.mutate({
  theme: "dark",
  notifications: {
    email: true,
    browser: true,
    workflow: false,
  },
  defaultBrowserConfig: {
    headless: true,
    viewport: { width: 1920, height: 1080 },
  },
});
```

### Reset to Defaults

```typescript
await trpc.settings.resetToDefaults.mutate();

// Resets to:
// - theme: "light"
// - notifications: all enabled
// - defaultBrowserConfig: null
// - defaultWorkflowSettings: null
```

---

## Security Considerations

### Encryption

All sensitive data (API keys, OAuth tokens) is encrypted using **AES-256-GCM**:

- **Algorithm:** `aes-256-gcm`
- **Key Length:** 32 bytes (256 bits)
- **IV Length:** 16 bytes (randomly generated per encryption)
- **Authentication:** GCM mode provides authenticated encryption

**Format:** `iv:authTag:encryptedData` (all hex-encoded)

### OAuth Security

- **CSRF Protection:** OAuth state parameter (32-byte random hex)
- **PKCE:** Code verifier and challenge for authorization code flow
- **Token Storage:** Encrypted access/refresh tokens in database
- **Scope Limitation:** Minimum required scopes per provider

### Webhook Security

- **HMAC Signatures:** SHA-256 HMAC signatures on all webhook payloads
- **Signature Verification:** Timing-safe comparison to prevent timing attacks
- **Secret Generation:** Cryptographically secure random secrets
- **Header Validation:** Validate `X-Webhook-Signature` header

---

## Usage Examples

### Complete OAuth Integration Flow

```typescript
// 1. User clicks "Connect Gmail"
const handleConnectGmail = async () => {
  const { authorizationUrl, state, codeVerifier } =
    await trpc.settings.initiateOAuth.mutate({ provider: "gmail" });

  // Store for callback validation
  sessionStorage.setItem("oauth_state", state);
  sessionStorage.setItem("oauth_codeVerifier", codeVerifier);

  // Redirect to authorization page
  window.location.href = authorizationUrl;
};

// 2. User authorizes and is redirected to callback
const handleOAuthCallback = async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");

  // Validate state
  const storedState = sessionStorage.getItem("oauth_state");
  if (state !== storedState) {
    throw new Error("Invalid state - possible CSRF attack");
  }

  const codeVerifier = sessionStorage.getItem("oauth_codeVerifier");

  // Complete OAuth flow
  const result = await trpc.settings.handleOAuthCallback.mutate({
    provider: "gmail",
    code,
    state,
    codeVerifier,
  });

  // Clean up session storage
  sessionStorage.removeItem("oauth_state");
  sessionStorage.removeItem("oauth_codeVerifier");

  // Redirect to settings page
  router.push("/settings?oauth=success");
};

// 3. Auto-refresh expired tokens
const useAutoRefreshToken = (integrationId: number) => {
  useEffect(() => {
    const checkAndRefresh = async () => {
      const { integrations } = await trpc.settings.listIntegrations.query();
      const integration = integrations.find(i => i.id === integrationId);

      if (integration?.isExpired) {
        await trpc.settings.refreshOAuthToken.mutate({ integrationId });
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkAndRefresh, 5 * 60 * 1000);
    checkAndRefresh(); // Initial check

    return () => clearInterval(interval);
  }, [integrationId]);
};
```

### Settings Dashboard Component

```typescript
const SettingsDashboard = () => {
  const { data: apiKeys } = trpc.settings.listApiKeys.useQuery();
  const { data: integrations } = trpc.settings.listIntegrations.useQuery();
  const { data: webhooks } = trpc.settings.listWebhooks.useQuery();
  const { data: preferences } = trpc.settings.getPreferences.useQuery();

  const saveApiKey = trpc.settings.saveApiKey.useMutation();
  const updatePreferences = trpc.settings.updatePreferences.useMutation();

  return (
    <div>
      <h1>Settings</h1>

      {/* API Keys Section */}
      <section>
        <h2>API Keys</h2>
        {apiKeys?.apiKeys.map(key => (
          <div key={key.service}>
            <span>{key.service}: {key.maskedKey}</span>
          </div>
        ))}
      </section>

      {/* OAuth Integrations */}
      <section>
        <h2>Connected Accounts</h2>
        {integrations?.integrations.map(integration => (
          <div key={integration.id}>
            <span>{integration.service}</span>
            {integration.isExpired && <Badge>Expired</Badge>}
          </div>
        ))}
      </section>

      {/* Webhooks */}
      <section>
        <h2>Webhooks</h2>
        <p>{webhooks?.webhooks.length} / {webhooks?.planLimits.maxWebhooks}</p>
        {webhooks?.webhooks.map(webhook => (
          <div key={webhook.id}>
            <span>{webhook.name}</span>
            <code>{webhook.url}</code>
          </div>
        ))}
      </section>

      {/* Preferences */}
      <section>
        <h2>Preferences</h2>
        <ThemeSelector value={preferences?.theme} />
        <NotificationSettings value={preferences?.notifications} />
      </section>
    </div>
  );
};
```

---

## TODOs & Placeholders

The following items are marked as **PLACEHOLDER** and need implementation:

### API Keys
- [ ] Implement service-specific API key validation in `testApiKey`
- [ ] Add support for API key rotation/versioning
- [ ] Add API key usage tracking

### OAuth
- [ ] Implement state parameter validation with Redis/session storage
- [ ] Add token revocation with OAuth providers
- [ ] Implement provider-specific connection testing
- [ ] Add support for custom OAuth providers
- [ ] Implement automatic token refresh background job

### Webhooks
- [ ] Create dedicated `webhooks` database table
- [ ] Create dedicated `webhook_logs` database table
- [ ] Implement webhook delivery queue system (Bull, BullMQ)
- [ ] Add webhook retry logic with exponential backoff
- [ ] Implement webhook delivery logging
- [ ] Add webhook event triggering system
- [ ] Integrate with user subscription/plan system for limits
- [ ] Add webhook rate limiting per endpoint

### Security
- [ ] Move OAuth state/verifier storage to Redis
- [ ] Add rate limiting for sensitive endpoints
- [ ] Implement API key usage quotas
- [ ] Add audit logging for settings changes
- [ ] Add 2FA for sensitive operations

### General
- [ ] Add comprehensive error tracking
- [ ] Add metrics and monitoring
- [ ] Create admin panel for webhook/integration monitoring
- [ ] Add webhook payload transformation/mapping
- [ ] Implement webhook batch delivery option

---

## Related Files

- **Router:** `/server/api/routers/settings.ts`
- **Schema:** `/drizzle/schema.ts` (userPreferences, integrations tables)
- **Root Router:** `/server/routers.ts`
- **Quiz Integration:** `/server/api/routers/quiz.ts`

---

## Support

For questions or issues, contact the development team or open an issue in the project repository.
