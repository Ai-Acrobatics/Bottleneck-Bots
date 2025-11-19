# Deployment Guide for GHL Agency AI

## Prerequisites
- Node.js 20+ installed
- pnpm package manager
- GitHub account with repository access
- Vercel account (free tier works)

## Local Development

### 1. Install Dependencies
```bash
npx pnpm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values:
- `VITE_APP_ID`: Your application ID
- `VITE_APP_TITLE`: Application title (default: "GHL Agency AI")
- `VITE_APP_LOGO`: Path to your logo (default: "/logo.png")
- `JWT_SECRET`: A secure random string for JWT signing
- `DATABASE_URL`: Your database connection string (MySQL)
- `OAUTH_SERVER_URL`: OAuth server URL (if using)
- `OWNER_OPEN_ID`: Owner's OpenID (if using)
- `BUILT_IN_FORGE_API_URL`: Forge API URL (optional)
- `BUILT_IN_FORGE_API_KEY`: Forge API key (optional)
- `VITE_ANALYTICS_ENDPOINT`: Analytics endpoint (optional)
- `VITE_ANALYTICS_WEBSITE_ID`: Analytics website ID (optional)

### 3. Run Development Server
```bash
npx pnpm run dev
```

The application will be available at `http://localhost:3000`

### 4. Build for Production
```bash
npx pnpm run build
```

### 5. Run Production Build Locally
```bash
npx pnpm run start
```

## Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `Julianb233/ghl-agency-ai`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Other**
   - Root Directory: `./` (leave as default)
   - Build Command: `pnpm run build`
   - Output Directory: `dist/public`
   - Install Command: `pnpm install`

4. **Add Environment Variables**
   In the Vercel project settings, add all environment variables from your `.env` file:
   - Go to "Settings" → "Environment Variables"
   - Add each variable from `.env.example` with appropriate values
   - Make sure to add them for all environments (Production, Preview, Development)

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - You'll get a production URL like `https://ghl-agency-ai.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

Follow the prompts to configure your deployment.

4. **Add Environment Variables**
```bash
vercel env add VITE_APP_ID
vercel env add JWT_SECRET
vercel env add DATABASE_URL
# ... add all other environment variables
```

5. **Deploy to Production**
```bash
vercel --prod
```

## Post-Deployment

### 1. Verify Deployment
- Visit your Vercel deployment URL
- Check that the application loads correctly
- Test key functionality

### 2. Set Up Custom Domain (Optional)
- In Vercel Dashboard → Settings → Domains
- Add your custom domain
- Follow DNS configuration instructions

### 3. Configure Database
- Ensure your database is accessible from Vercel's servers
- Update `DATABASE_URL` in Vercel environment variables if needed
- Run database migrations if required:
```bash
npx pnpm run db:push
```

### 4. Monitor Deployment
- Check Vercel logs for any errors
- Set up error monitoring (Sentry, LogRocket, etc.)
- Configure analytics if using

## Continuous Deployment

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every pull request

To disable auto-deployment:
- Go to Project Settings → Git
- Configure deployment settings

## Troubleshooting

### Build Fails
1. Check Vercel build logs
2. Verify all environment variables are set
3. Ensure `pnpm-lock.yaml` is committed
4. Try building locally: `npx pnpm run build`

### Runtime Errors
1. Check Vercel function logs
2. Verify database connection
3. Check environment variables are correct
4. Ensure all required services are accessible

### Environment Variables Not Working
1. Make sure variables are added in Vercel dashboard
2. Redeploy after adding new variables
3. Check variable names match exactly (case-sensitive)

## Security Checklist

- [ ] All sensitive data is in environment variables
- [ ] `.env` file is in `.gitignore`
- [ ] JWT_SECRET is a strong random string
- [ ] Database credentials are secure
- [ ] API keys are not exposed in client code
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled (if applicable)

## Performance Optimization

- [ ] Enable Vercel Edge Network
- [ ] Configure caching headers
- [ ] Optimize images and assets
- [ ] Enable compression
- [ ] Monitor Core Web Vitals

## Support

For issues or questions:
- Check Vercel documentation: https://vercel.com/docs
- Review application logs in Vercel dashboard
- Check GitHub repository issues
