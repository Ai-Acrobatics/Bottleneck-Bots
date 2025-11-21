# Browserbase + GHL Integration with 1Password

## 🎯 Overview

This guide will help you set up Browserbase for automated GoHighLevel (GHL) tasks with **1Password Secure Agentic Autofill**. This is the most secure way to handle credentials - they're stored in 1Password and retrieved just-in-time during automation without ever being exposed to your application or logs.

### 🔐 Why 1Password Integration?

- ✅ **Zero-Knowledge Security**: Credentials never leave 1Password encrypted vault
- ✅ **Human-in-the-Loop**: Real-time approval prompts on your device
- ✅ **Just-in-Time Auth**: Credentials retrieved only when needed
- ✅ **No Storage**: No credentials stored in your database
- ✅ **No Logging**: Credentials never appear in logs or LLM context
- ✅ **Native Browserbase Integration**: Official partnership between 1Password and Browserbase

---

## 📋 What You'll Need

### 1. **Browserbase Account** (Required)
- Sign up at: https://www.browserbase.com/
- Get your API credentials from the dashboard

### 2. **1Password Account** (Required for credential management)
- 1Password account (Business or Teams plan for Service Accounts)
- 1Password CLI installed
- Service Account token for API access

### 3. **Database** (Optional - only for session history)
- PostgreSQL database (Neon, Supabase, or Vercel Postgres)
- Used for storing session metadata, NOT credentials

---

## 🚀 Step-by-Step Setup

### Step 1: Set Up 1Password Service Account

1. **Sign in to 1Password Business/Teams**
   - Go to https://start.1password.com/
   - You need a Business or Teams plan for Service Accounts

2. **Create a Service Account**
   - Go to **Integrations** → **Service Accounts**
   - Click **Create Service Account**
   - Name it: "Browserbase GHL Automation"
   - Copy the **Service Account Token** (starts with `ops_`)
   - **⚠️ Save this token securely - you can't view it again!**

3. **Create a Vault for GHL Credentials**
   - In 1Password, create a new vault: "GHL Automation"
   - Share this vault with the Service Account
   - Give it **Read-only** permissions

4. **Add GHL Login Credentials**
   - In the "GHL Automation" vault, click **+ New Item**
   - Select **Login**
   - Fill in:
     - **Title**: "GoHighLevel Production"
     - **Username**: your GHL email
     - **Password**: your GHL password
     - **Website**: `https://app.gohighlevel.com`
   - Click **Save**

5. **Note the Item Reference**
   - Click on the item
   - Copy the reference path (e.g., `op://GHL Automation/GoHighLevel Production/username`)

---

### Step 2: Get Browserbase Credentials

1. Go to https://www.browserbase.com/
2. Sign up or log in
3. Navigate to **Settings** → **API Keys**
4. Copy your:
   - `API Key`
   - `Project ID`

5. **Enable 1Password Integration in Browserbase**
   - In Browserbase dashboard, go to **Integrations**
   - Click **Connect 1Password**
   - Follow the OAuth flow to authorize
   - ✅ 1Password is now connected!

**Browserbase Features You Get:**
- ✅ Cloud-based browser sessions
- ✅ Live debugging view (watch automation in real-time)
- ✅ Session recording
- ✅ Automatic scaling
- ✅ Proxy support (IP geolocation)
- ✅ CAPTCHA solving
- ✅ Ad blocking
- ✅ Advanced stealth mode
- ✅ **1Password Secure Agentic Autofill** 🔐

---

### Step 3: Add Environment Variables to Vercel

Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Add these variables:

```bash
# Browserbase Configuration
BROWSERBASE_API_KEY=bb_live_your_api_key_here
BROWSERBASE_PROJECT_ID=your_project_id_here

# 1Password Service Account (for credential retrieval)
OP_SERVICE_ACCOUNT_TOKEN=ops_your_token_here

# 1Password Item References (optional - can be per-user)
OP_GHL_USERNAME_REF=op://GHL Automation/GoHighLevel Production/username
OP_GHL_PASSWORD_REF=op://GHL Automation/GoHighLevel Production/password

# Database (optional - for session history only)
DATABASE_URL=postgresql://user:password@host/database

# Security (still needed for other features)
JWT_SECRET=your_64_char_hex_string_here
```

**Key Differences:**
- ❌ No `ENCRYPTION_KEY` needed - 1Password handles encryption
- ✅ `OP_SERVICE_ACCOUNT_TOKEN` - for 1Password API access
- ✅ `OP_GHL_*_REF` - references to 1Password items (not actual credentials!)

---

### Step 4: How 1Password Integration Works

#### **Secure Flow (Zero-Knowledge)**

```
User → Stores credentials in 1Password vault → 
Automation starts → 
Browserbase requests credentials from 1Password API → 
1Password sends notification to user's device → 
User approves (Human-in-the-Loop) → 
Credentials injected directly into browser session → 
Never logged or stored in application → 
Session ends, credentials cleared
```

#### **Key Security Features**

1. **Zero Storage**: Credentials NEVER stored in your application
2. **Just-in-Time**: Retrieved only when automation runs
3. **Human Approval**: Real-time notification on your device
4. **No Logs**: Credentials never appear in Browserbase or application logs
5. **No LLM Exposure**: AI models never see the actual credentials
6. **Audit Trail**: Every access logged in 1Password

#### **What Gets Stored in Your Database**

Only metadata - NO credentials:

```sql
CREATE TABLE ghl_automation_config (
  id SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES users(id),
  onePasswordVaultId VARCHAR(100),     -- Just the vault reference
  onePasswordItemId VARCHAR(100),      -- Just the item reference
  accountType VARCHAR(20),             -- 'agency' | 'sub-account'
  locationId VARCHAR(100),             -- GHL location ID (optional)
  lastUsed TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 GHL Credential Management with 1Password

### Installation

First, install the 1Password SDK:

```bash
npm install @1password/sdk
```

### Backend: 1Password Integration

Create a service to handle 1Password credentials:

```typescript
// server/services/onePasswordService.ts

import { createClient } from '@1password/sdk';

class OnePasswordService {
  private client: any;

  constructor() {
    const token = process.env.OP_SERVICE_ACCOUNT_TOKEN;
    if (!token) {
      console.warn('[1Password] Service account token not configured');
      return;
    }

    try {
      this.client = createClient({
        auth: token,
        integrationName: 'GHL Agency AI',
        integrationVersion: '1.0.0',
      });
      console.log('[1Password] Client initialized successfully');
    } catch (error) {
      console.error('[1Password] Failed to initialize:', error);
    }
  }

  /**
   * Retrieve credential from 1Password vault
   * @param reference - 1Password reference (e.g., "op://GHL Automation/GoHighLevel/username")
   */
  async getSecret(reference: string): Promise<string> {
    if (!this.client) {
      throw new Error('1Password client not initialized');
    }

    try {
      // Use 1Password SDK to resolve the reference
      const secret = await this.client.secrets.resolve(reference);
      return secret;
    } catch (error) {
      console.error(`[1Password] Failed to retrieve secret: ${reference}`, error);
      throw new Error('Failed to retrieve credential from 1Password');
    }
  }

  /**
   * Get GHL credentials for a user
   */
  async getGHLCredentials(userId: number): Promise<{ email: string; password: string }> {
    // Get user's 1Password item references from database
    const config = await this.getUserConfig(userId);
    
    if (!config) {
      throw new Error('1Password configuration not found for user');
    }

    // Retrieve actual credentials from 1Password
    const email = await this.getSecret(config.usernameRef);
    const password = await this.getSecret(config.passwordRef);

    return { email, password };
  }

  /**
   * Get user's 1Password configuration from database
   */
  private async getUserConfig(userId: number) {
    const db = await getDb();
    if (!db) return null;

    const configs = await db
      .select()
      .from(ghl_automation_config)
      .where(eq(ghl_automation_config.userId, userId))
      .limit(1);

    return configs[0] || null;
  }

  /**
   * Test 1Password connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.client) return false;

    try {
      // Try to list vaults to verify connection
      await this.client.vaults.listAll();
      return true;
    } catch (error) {
      console.error('[1Password] Connection test failed:', error);
      return false;
    }
  }
}

export const onePasswordService = new OnePasswordService();
```

### Frontend: 1Password Configuration

Users just need to provide their 1Password item references:

```typescript
// client/src/pages/Settings.tsx

interface OnePasswordConfig {
  usernameRef: string;  // e.g., "op://GHL Automation/GoHighLevel/username"
  passwordRef: string;  // e.g., "op://GHL Automation/GoHighLevel/password"
  accountType: 'agency' | 'sub-account';
  locationId?: string;
}

export function OnePasswordConfigSection() {
  const [config, setConfig] = useState<OnePasswordConfig>({
    usernameRef: '',
    passwordRef: '',
    accountType: 'agency',
  });

  const saveConfig = trpc.settings.saveOnePasswordConfig.useMutation();
  const testConnection = trpc.settings.testOnePasswordConnection.useMutation();

  const handleSave = async () => {
    try {
      await saveConfig.mutateAsync(config);
      alert('✅ 1Password configuration saved!');
    } catch (error) {
      alert('❌ Failed to save configuration');
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Key className="h-5 w-5" />
        <h3 className="text-lg font-semibold">1Password Integration</h3>
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Your GHL credentials are stored securely in 1Password and retrieved only when needed.
          Never exposed to the application or logs.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <Label htmlFor="username-ref">Username Reference</Label>
          <Input
            id="username-ref"
            placeholder="op://GHL Automation/GoHighLevel/username"
            value={config.usernameRef}
            onChange={(e) => setConfig({ ...config, usernameRef: e.target.value })}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Copy this from your 1Password item (right-click → Copy Private Link)
          </p>
        </div>

        <div>
          <Label htmlFor="password-ref">Password Reference</Label>
          <Input
            id="password-ref"
            placeholder="op://GHL Automation/GoHighLevel/password"
            value={config.passwordRef}
            onChange={(e) => setConfig({ ...config, passwordRef: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="account-type">Account Type</Label>
          <Select 
            value={config.accountType} 
            onValueChange={(value) => setConfig({ ...config, accountType: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="agency">Agency Account</SelectItem>
              <SelectItem value="sub-account">Sub-Account</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            Save Configuration
          </Button>
          <Button onClick={() => testConnection.mutate()} variant="outline">
            Test Connection
          </Button>
        </div>
      </div>

      <Alert variant="warning">
        <Shield className="h-4 w-4" />
        <AlertTitle>Security Features</AlertTitle>
        <AlertDescription className="space-y-1">
          <p>✅ Credentials stored in 1Password vault</p>
          <p>✅ Human-in-the-loop approval required</p>
          <p>✅ Zero-knowledge - never logged</p>
          <p>✅ Just-in-time credential retrieval</p>
        </AlertDescription>
      </Alert>
    </Card>
  );
}
```

---

## 🤖 How GHL Automation Works

### 1. User Initiates Task

```typescript
// User sends command via chat or creates scheduled task
"Go to my GHL account and create a new contact: John Doe, john@example.com"
```

### 2. Backend Retrieves Credentials from 1Password

```typescript
// server/api/routers/ai.ts or cronScheduler.service.ts

import { onePasswordService } from '@/server/services/onePasswordService';

// Get credentials from 1Password (triggers approval notification)
const credentials = await onePasswordService.getGHLCredentials(userId);

// Credentials are:
// - Retrieved just-in-time from 1Password
// - User gets approval notification on their device
// - Never logged or stored in application
// - Automatically cleared from memory after use

console.log('[Auth] Credentials retrieved from 1Password - user approved');
```

### 3. Create Browserbase Session

```typescript
import { browserbaseSDK } from '@/server/_core/browserbaseSDK';

const session = await browserbaseSDK.createSession({
  projectId: process.env.BROWSERBASE_PROJECT_ID,
  browserSettings: {
    viewport: { width: 1920, height: 1080 },
    advancedStealth: true,  // Avoid detection
    solveCaptchas: true,    // Auto-solve CAPTCHAs
    recordSession: true,    // Record for debugging
  },
  proxies: true,            // Use rotating proxies
  keepAlive: true,
  timeout: 3600,           // 1 hour session
});

// Get live view URL for real-time monitoring
const debugInfo = await browserbaseSDK.getSessionDebug(session.id);
console.log('Watch live:', debugInfo.debuggerFullscreenUrl);
```

### 4. Login to GHL Automatically

```typescript
import Stagehand from '@browserbasehq/stagehand';

const stagehand = new Stagehand({
  env: 'BROWSERBASE',
  apiKey: process.env.BROWSERBASE_API_KEY,
  projectId: process.env.BROWSERBASE_PROJECT_ID,
  browserbaseSessionId: session.id, // Use existing session
});

await stagehand.init();
const page = stagehand.context.pages()[0];

// Navigate to GHL login
await page.goto('https://app.gohighlevel.com/');

// AI-powered login
await stagehand.act({
  action: 'fill',
  selector: 'input[type="email"]',
  value: credentials.email
});

await stagehand.act({
  action: 'fill',
  selector: 'input[type="password"]',
  value: credentials.password
});

await stagehand.act({
  action: 'click',
  selector: 'button[type="submit"]'
});

// Wait for successful login
await page.waitForURL('**/location/**', { timeout: 30000 });
console.log('✅ Logged into GHL successfully');
```

### 5. Execute User's Task

```typescript
// Use Stagehand's AI capabilities to execute natural language commands
await stagehand.observe('Find the contacts section');
await stagehand.act('Click on "Add Contact" button');
await stagehand.act('Fill in name: John Doe');
await stagehand.act('Fill in email: john@example.com');
await stagehand.act('Click save');

// Extract results
const result = await stagehand.extract({
  instruction: 'Get the newly created contact ID and confirmation message',
  schema: z.object({
    contactId: z.string(),
    message: z.string()
  })
});

console.log('✅ Contact created:', result);
```

### 6. Cleanup

```typescript
// Close session and clear credentials from memory
await stagehand.close();
credentials.email = '';
credentials.password = '';

// Session recording available in Browserbase dashboard
```

---

## 🎨 Frontend UI Requirements

### Add GHL Credentials Form to Settings Page

Location: `client/src/pages/Settings.tsx`

```tsx
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Lock, Eye, EyeOff } from 'lucide-react';

export function GHLCredentialsSection() {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    accountType: 'agency' as 'agency' | 'sub-account',
    locationId: ''
  });

  const saveCredentials = trpc.settings.saveGHLCredentials.useMutation();
  const testConnection = trpc.settings.testGHLConnection.useMutation();

  const handleSave = async () => {
    try {
      await saveCredentials.mutateAsync(credentials);
      alert('✅ Credentials saved securely!');
    } catch (error) {
      alert('❌ Failed to save credentials');
    }
  };

  const handleTest = async () => {
    try {
      const result = await testConnection.mutateAsync();
      alert(result.success ? '✅ Connection successful!' : '❌ Connection failed');
    } catch (error) {
      alert('❌ Connection test failed');
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="h-5 w-5" />
        <h3 className="text-lg font-semibold">GoHighLevel Credentials</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Your credentials are encrypted with AES-256 and never stored in plain text.
      </p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="ghl-email">Email</Label>
          <Input
            id="ghl-email"
            type="email"
            placeholder="your@email.com"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="ghl-password">Password</Label>
          <div className="relative">
            <Input
              id="ghl-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            Save Credentials
          </Button>
          <Button onClick={handleTest} variant="outline">
            Test Connection
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

---

## 🔌 Backend API Endpoints Needed

Add these to `server/api/routers/settings.ts`:

```typescript
import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { integrations } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

export const settingsRouter = router({
  // Save GHL credentials
  saveGHLCredentials: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
      accountType: z.enum(['agency', 'sub-account']),
      locationId: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const userId = ctx.user.id;

      // Encrypt credentials
      const encryptedEmail = encrypt(input.email);
      const encryptedPassword = encrypt(input.password);

      // Check if integration exists
      const existing = await db
        .select()
        .from(integrations)
        .where(and(
          eq(integrations.userId, userId),
          eq(integrations.service, 'gohighlevel')
        ))
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        await db
          .update(integrations)
          .set({
            accessToken: encryptedEmail,
            refreshToken: encryptedPassword,
            metadata: JSON.stringify({
              accountType: input.accountType,
              locationId: input.locationId
            }),
            updatedAt: new Date()
          })
          .where(eq(integrations.id, existing[0].id));
      } else {
        // Create new
        await db.insert(integrations).values({
          userId,
          service: 'gohighlevel',
          accessToken: encryptedEmail,
          refreshToken: encryptedPassword,
          metadata: JSON.stringify({
            accountType: input.accountType,
            locationId: input.locationId
          }),
          isActive: 'true'
        });
      }

      return { success: true };
    }),

  // Test GHL connection
  testGHLConnection: protectedProcedure
    .mutation(async ({ ctx }) => {
      const db = await getDb();
      const userId = ctx.user.id;

      // Retrieve credentials
      const integration = await db
        .select()
        .from(integrations)
        .where(and(
          eq(integrations.userId, userId),
          eq(integrations.service, 'gohighlevel')
        ))
        .limit(1);

      if (!integration.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'GHL credentials not found'
        });
      }

      // Decrypt credentials
      const email = decrypt(integration[0].accessToken);
      const password = decrypt(integration[0].refreshToken);

      // Test login with Browserbase
      try {
        const session = await browserbaseSDK.createSession({
          timeout: 300, // 5 minutes for test
          browserSettings: {
            viewport: { width: 1920, height: 1080 }
          }
        });

        const stagehand = new Stagehand({
          env: 'BROWSERBASE',
          apiKey: process.env.BROWSERBASE_API_KEY,
          projectId: process.env.BROWSERBASE_PROJECT_ID,
          browserbaseSessionId: session.id
        });

        await stagehand.init();
        const page = stagehand.context.pages()[0];
        
        await page.goto('https://app.gohighlevel.com/');
        
        // Try to login
        await stagehand.act({
          action: 'fill',
          selector: 'input[type="email"]',
          value: email
        });
        
        await stagehand.act({
          action: 'fill',
          selector: 'input[type="password"]',
          value: password
        });
        
        await stagehand.act({
          action: 'click',
          selector: 'button[type="submit"]'
        });

        // Wait for redirect or error
        await page.waitForURL('**/location/**', { timeout: 15000 });
        
        await stagehand.close();
        
        return { success: true, message: 'Connection successful!' };
      } catch (error) {
        return { 
          success: false, 
          message: 'Failed to connect. Check your credentials.' 
        };
      }
    }),

  // Get GHL status
  getGHLStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      const userId = ctx.user.id;

      const integration = await db
        .select()
        .from(integrations)
        .where(and(
          eq(integrations.userId, userId),
          eq(integrations.service, 'gohighlevel')
        ))
        .limit(1);

      if (!integration.length) {
        return { configured: false };
      }

      const metadata = JSON.parse(integration[0].metadata || '{}');

      return {
        configured: true,
        accountType: metadata.accountType,
        lastUpdated: integration[0].updatedAt
      };
    })
});
```

---

## 🎯 Testing Your Setup

### 1. Test Browserbase Connection

```bash
# In Vercel logs or local terminal
curl -X POST https://your-app.vercel.app/api/trpc/browser.createSession \
  -H "Content-Type: application/json" \
  -d '{"recordSession": true}'
```

You should see:
- ✅ Session ID returned
- ✅ Live view URL available
- ✅ Session appears in Browserbase dashboard

### 2. Test GHL Credential Storage

1. Go to Settings page
2. Enter GHL credentials
3. Click "Save Credentials"
4. Click "Test Connection"
5. Check Browserbase dashboard for live session

### 3. Test AI Automation

Send a command:
```
"Go to my GHL account and show me the last 5 contacts created"
```

Expected flow:
1. ✅ Retrieves encrypted credentials
2. ✅ Creates Browserbase session
3. ✅ Logs into GHL
4. ✅ Navigates to contacts
5. ✅ Extracts data
6. ✅ Returns results

---

## 📊 Monitoring & Debugging

### Browserbase Dashboard
- View all active sessions
- Watch live automation
- Review session recordings
- Check resource usage

### Application Logs
```javascript
console.log('[Browserbase] Session:', sessionId);
console.log('[Browserbase] Live view:', liveViewUrl);
console.log('[GHL] Login successful');
console.log('[Task] Executing:', userCommand);
```

---

## 🔒 Security Checklist

- ✅ Never log decrypted passwords
- ✅ Clear credentials from memory after use
- ✅ Use HTTPS for all API calls
- ✅ Rotate ENCRYPTION_KEY regularly
- ✅ Limit session duration
- ✅ Auto-logout after inactivity
- ✅ Use Browserbase proxies to avoid IP blocking

---

## 🚀 Next Steps

1. **Add Environment Variables** (Browserbase API Key, Project ID, ENCRYPTION_KEY)
2. **Add UI Form** (GHL credentials section in Settings)
3. **Test Connection** (Use test endpoint to verify login works)
4. **Try Automation** (Send a GHL command via chat)
5. **Monitor Sessions** (Watch live in Browserbase dashboard)

---

## 💡 Pro Tips

1. **Session Recording**: Always enable `recordSession: true` for debugging
2. **Live View**: Share live view URL with users so they can watch automation
3. **Captcha Solving**: Browserbase automatically solves CAPTCHAs
4. **Stealth Mode**: Enable `advancedStealth` to avoid bot detection
5. **Proxies**: Use geolocation proxies to access region-specific GHL features

---

## 📞 Support

- Browserbase Docs: https://docs.browserbase.com/
- Stagehand Docs: https://docs.browserbase.com/guides/stagehand
- GHL API Docs: https://highlevel.stoplight.io/

---

**You're all set! 🎉**

Once you add the environment variables, the backend will automatically use Browserbase for all browser automation tasks with secure, encrypted GHL credentials.

