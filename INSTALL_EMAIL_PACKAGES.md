# Email Integration - Package Installation

## Required NPM Packages

To complete the email integration implementation, you need to install the following packages:

```bash
npm install googleapis google-auth-library @microsoft/microsoft-graph-client @anthropic-ai/sdk openai
```

## Package Details

### Gmail Integration
- **googleapis** (^142.0.0): Google APIs client library for Node.js
- **google-auth-library** (^9.15.0): Google authentication library (included with googleapis)

### Outlook Integration
- **@microsoft/microsoft-graph-client** (^3.0.7): Microsoft Graph API client

### AI Providers
- **@anthropic-ai/sdk** (^0.32.1): Anthropic's Claude API client for sentiment analysis and draft generation
- **openai** (^4.77.0): OpenAI API client (alternative/additional AI provider)

## Installation Commands

### Install All at Once
```bash
npm install googleapis google-auth-library @microsoft/microsoft-graph-client @anthropic-ai/sdk openai
```

### Install Separately (if needed)

**For Gmail only:**
```bash
npm install googleapis google-auth-library
```

**For Outlook only:**
```bash
npm install @microsoft/microsoft-graph-client
```

**For AI features with Claude:**
```bash
npm install @anthropic-ai/sdk
```

**For AI features with OpenAI:**
```bash
npm install openai
```

## Verification

After installation, verify the packages are installed:

```bash
npm list googleapis google-auth-library @microsoft/microsoft-graph-client @anthropic-ai/sdk openai
```

Expected output should show the installed versions without any errors.

## TypeScript Types

All packages come with built-in TypeScript definitions, so no additional @types packages are needed.

## Next Steps

After installing the packages:

1. Configure environment variables (see `.env.example`)
2. Set up OAuth credentials for Gmail and/or Outlook
3. Generate an encryption key for token storage
4. Run database migrations: `npm run db:push`
5. Start the workers: `npm run dev:workers`
6. Test the OAuth flow

See `EMAIL_INTEGRATION_README.md` for complete setup and usage instructions.
