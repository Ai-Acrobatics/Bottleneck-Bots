# Vercel Deployment Guide

## Required Environment Variables

Configure these in your Vercel project settings (Settings → Environment Variables):

### Essential Variables

```bash
# OAuth Configuration (REQUIRED)
VITE_OAUTH_PORTAL_URL=https://your-oauth-portal.com
VITE_APP_ID=your-app-id

# Database Configuration (REQUIRED)
DATABASE_URL=postgresql://user:password@host:port/database

# Playwright (REQUIRED for Vercel)
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Node Environment
NODE_ENV=production
```

### Optional Variables

```bash
# Google Maps Integration
VITE_FRONTEND_FORGE_API_KEY=your-google-maps-api-key
VITE_FRONTEND_FORGE_API_URL=https://forge.butterfly-effect.dev

# Analytics
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=

# App Branding
VITE_APP_TITLE=GHL Agency AI
VITE_APP_LOGO=
```

## Deployment Configuration

The project is configured to deploy on Vercel with:

- **Build Command**: `pnpm run build`
- **Node Version**: 22.x (specified in package.json)
- **Serverless Function**: `api/index.ts`
- **Max Duration**: 60 seconds

## Vercel Project Settings

1. **Framework Preset**: None (custom configuration)
2. **Build & Development Settings**:
   - Build Command: `pnpm run build`
   - Output Directory: `dist/public`
   - Install Command: `pnpm install`

3. **Root Directory**: `.` (project root)

## Troubleshooting

### "Failed to construct URL" Error
- **Cause**: Missing `VITE_OAUTH_PORTAL_URL` or `VITE_APP_ID` environment variables
- **Solution**: Add these variables in Vercel project settings

### 404 Errors
- **Cause**: Incorrect routing or missing build output
- **Solution**: Ensure `vercel.json` is properly configured and build succeeds

### TypeScript Errors During Build
- **Cause**: Missing type packages or outdated dependencies
- **Solution**: Run `pnpm install` and ensure all `@types/*` packages are in dependencies

## Post-Deployment

After successful deployment:

1. Verify the app loads at your Vercel URL
2. Test OAuth login flow (requires valid OAuth credentials)
3. Check Vercel function logs for any runtime errors
4. Configure custom domain if needed

## Local Development

To run locally:

```bash
pnpm install
pnpm dev
```

Make sure to create a `.env` file with the required environment variables.

