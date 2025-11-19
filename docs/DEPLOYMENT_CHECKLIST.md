# Deployment & Testing Checklist

## ✅ Git Push Status: COMPLETE

**Commit:** `feat: Complete AI Browser Automation & Quiz System Integration`
**Files Changed:** 24 files, 7,870 insertions(+), 33 deletions(-)
**Repository:** https://github.com/Julianb233/ghl-agency-ai
**Branch:** main
**Status:** Pushed successfully

---

## 🚀 Deployment Steps

### 1. Automatic Deployment (If using Vercel/similar)

If your repository is connected to Vercel or another auto-deployment service:

```bash
# Check deployment status
gh deployment list

# Or visit your Vercel dashboard
open https://vercel.com/dashboard
```

**What to look for:**
- ✅ Build status: Success
- ✅ Deployment URL active
- ✅ Environment variables set
- ✅ Database connection successful

### 2. Manual Deployment

If deploying manually:

```bash
# 1. Build the application
pnpm build

# 2. Run database migrations on production database
DATABASE_URL=your_production_db_url pnpm db:push

# 3. Start the production server
pnpm start
```

---

## 🔍 Pre-Deployment Checks

### ✅ Environment Variables (Production)

Verify these are set in your production environment:

```env
# Browserbase (Required)
BROWSERBASE_API_KEY=bb_live_xxxxxxxxxxxxxxxxxxxxxx
BROWSERBASE_PROJECT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# AI Model (Required - Choose one)
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# OR
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# OR
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Database (Required)
DATABASE_URL=postgresql://...

# Optional but recommended
NODE_ENV=production
VERCEL=1
```

### ✅ Database Schema

Check that all 8 new tables exist:

```sql
-- Connect to production database
psql $DATABASE_URL

-- Verify tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'browserSessions',
  'automationWorkflows',
  'workflowExecutions',
  'extractedData',
  'userPreferences',
  'quizzes',
  'quizQuestions',
  'quizAttempts'
);

-- Expected: 8 rows
```

---

## 🧪 End-to-End Testing Plan

### Test 1: Backend Health Check

```bash
# Check if server is running
curl https://your-domain.com/health

# Expected: 200 OK
```

### Test 2: tRPC Router Availability

```bash
# Check tRPC meta endpoint
curl https://your-domain.com/api/trpc/ai.chat

# Expected: JSON response (not 404)
```

### Test 3: AI Chat Endpoint

```bash
# Test basic AI automation
curl -X POST https://your-domain.com/api/trpc/ai.chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Navigate to google.com"}],
    "startUrl": "https://google.com"
  }'

# Expected: JSON with sessionId, sessionUrl
```

### Test 4: Database Persistence

```bash
# After Test 3, check database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"browserSessions\";"

# Expected: At least 1 row
```

### Test 5: Session Replay Endpoint

```bash
# Get session from Test 3 and fetch replay
curl https://your-domain.com/api/trpc/ai.getSessionReplay?sessionId=session_xxx

# Expected: JSON with replay data
```

### Test 6: Quiz System

```bash
# Create a quiz
curl -X POST https://your-domain.com/api/trpc/quiz.createQuiz \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Quiz",
    "passingScore": 70,
    "isPublished": true
  }'

# Expected: JSON with quiz.id
```

### Test 7: Workflows

```bash
# Create a workflow
curl -X POST https://your-domain.com/api/trpc/workflows.create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Workflow",
    "steps": [
      {"type": "navigate", "config": {"url": "https://example.com"}}
    ]
  }'

# Expected: JSON with workflow.id
```

---

## 🎨 Frontend Testing

### Test 1: Dashboard Loads

1. Open browser to `https://your-domain.com`
2. Verify no console errors
3. Check that Dashboard renders correctly

### Test 2: AI Browser Button Exists

1. Look for Globe icon in navigation rail
2. Button should be visible and clickable
3. Hover should show tooltip

### Test 3: AIBrowserPanel Renders

1. Click AI Browser button
2. Verify 4 tabs appear: Execute, Observe, Extract, Sessions
3. Check all form inputs are present
4. Verify buttons are enabled (except when disabled by validation)

### Test 4: Execute Tab Works

1. Fill in:
   - **Start URL**: `https://example.com`
   - **Instruction**: `Click the "More information" link`
2. Click **Execute Action**
3. Watch for:
   - Loading spinner appears
   - Result appears in JSON viewer below
   - No errors in console

### Test 5: Observe Tab Works

1. Fill in:
   - **Page URL**: `https://example.com`
   - **Instruction**: `Find all links on the page`
2. Click **Observe Page**
3. Watch for:
   - Loading spinner
   - List of actions appears in result
   - No errors

### Test 6: Extract Tab Works

1. Fill in:
   - **Page URL**: `https://example.com`
   - **Data Type**: Contact Information
   - **Instruction**: `Extract contact information`
2. Click **Extract Data**
3. Watch for:
   - Loading spinner
   - Extracted data appears in JSON viewer
   - No errors

### Test 7: Sessions Tab Works

1. Enter a session ID from previous test
2. Click **Load**
3. Verify session replay player appears (if available)
4. Click **Refresh Active Sessions**
5. Verify sessions list appears

---

## ⚠️ Error Monitoring

### Check Application Logs

```bash
# If using Vercel
vercel logs

# If using custom server
pm2 logs
# or
journalctl -u your-app-name -f
```

### Common Errors to Look For:

**1. "BROWSERBASE_API_KEY is not defined"**
- Fix: Add environment variable in production
- Location: Vercel dashboard > Settings > Environment Variables

**2. "Database connection failed"**
- Fix: Verify DATABASE_URL is correct
- Check database is accessible from production server

**3. "browserSessions table does not exist"**
- Fix: Run database migration
- Command: `DATABASE_URL=your_prod_url pnpm db:push`

**4. "No AI model API key configured"**
- Fix: Add one of: GOOGLE_GENERATIVE_AI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY

**5. "Module not found: @browserbasehq/stagehand"**
- Fix: Ensure package is in dependencies (not devDependencies)
- Run: `pnpm add @browserbasehq/stagehand`

**6. "PLACEHOLDER: Get userId from auth context"**
- This is expected! Not an error
- These are intentional placeholders for auth integration
- Will not affect functionality (uses placeholder userId = 1)

---

## 🔒 Security Checks

### ✅ API Keys Not Exposed

```bash
# Check that .env is in .gitignore
cat .gitignore | grep .env

# Verify no secrets in git history
git log --all --oneline --decorate --graph | head -20

# Check no secrets in code
grep -r "BROWSERBASE_API_KEY.*=" . --exclude-dir=node_modules --exclude-dir=.git
# Expected: Only references in .env files and documentation
```

### ✅ Database Security

- Verify production database has SSL enabled
- Check database user has minimal required permissions
- Confirm no public database access

### ✅ Rate Limiting

Consider adding rate limiting for AI endpoints:

```typescript
// server/api/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many AI requests, please try again later'
});
```

---

## 📊 Performance Monitoring

### Metrics to Track:

1. **API Response Times**
   - `/api/trpc/ai.*` endpoints
   - Target: < 5s for simple actions
   - Target: < 30s for complex workflows

2. **Database Query Performance**
   - Monitor slow queries
   - Index common lookups (sessionId, userId)

3. **AI Token Usage**
   - Track tokens per endpoint
   - Monitor costs daily
   - Set up billing alerts

4. **Session Storage**
   - Monitor browserSessions table size
   - Implement cleanup for old sessions (30+ days)

5. **Error Rates**
   - Track 4xx and 5xx responses
   - Set up alerts for error spikes

---

## ✅ Post-Deployment Validation

### Checklist

- [ ] All environment variables set in production
- [ ] Database migrations applied successfully
- [ ] All 8 new tables exist in production database
- [ ] Backend API health check returns 200
- [ ] AI chat endpoint responds successfully
- [ ] Quiz creation endpoint works
- [ ] Workflow creation endpoint works
- [ ] Frontend Dashboard loads without errors
- [ ] AI Browser button visible in navigation
- [ ] All 4 tabs in AIBrowserPanel render correctly
- [ ] Execute tab successfully creates Browserbase session
- [ ] No console errors in browser
- [ ] Session data persists to database
- [ ] Application logs show no critical errors
- [ ] API response times acceptable (<5s for simple actions)
- [ ] Cost monitoring configured for AI usage

---

## 🎉 Success Criteria

Your deployment is successful if:

1. ✅ All backend endpoints respond without errors
2. ✅ Database contains session records after automation
3. ✅ Frontend UI loads and renders all components
4. ✅ Execute tab successfully runs browser automation
5. ✅ No critical errors in logs
6. ✅ Sessions persist to database correctly
7. ✅ Quiz system creates and stores quizzes
8. ✅ Workflows can be created and executed

---

## 🆘 Rollback Plan

If critical errors occur:

```bash
# 1. Revert to previous commit
git revert HEAD
git push origin main

# 2. Or force push previous version
git reset --hard HEAD~1
git push --force origin main

# 3. Revert database migrations
# (Only if migrations caused issues)
DATABASE_URL=your_prod_url pnpm db:rollback
```

---

## 📝 Test Results Log

### Date: [FILL IN]
### Tester: [FILL IN]
### Environment: [Production/Staging]

| Test | Status | Notes |
|------|--------|-------|
| Backend Health Check | ⏳ | |
| AI Chat Endpoint | ⏳ | |
| Database Persistence | ⏳ | |
| Session Replay | ⏳ | |
| Quiz System | ⏳ | |
| Workflows | ⏳ | |
| Dashboard Loads | ⏳ | |
| AI Browser Button | ⏳ | |
| Execute Tab | ⏳ | |
| Observe Tab | ⏳ | |
| Extract Tab | ⏳ | |
| Sessions Tab | ⏳ | |

Legend: ✅ Pass | ❌ Fail | ⏳ Not Tested Yet

---

## 🔗 Useful Links

- **GitHub Repository**: https://github.com/Julianb233/ghl-agency-ai
- **Documentation**: `/docs` folder
- **Browserbase Dashboard**: https://www.browserbase.com/dashboard
- **Deployment Platform**: [Your Vercel/etc URL]

---

## 💡 Next Steps After Successful Deployment

1. Monitor application for 24-48 hours
2. Check error logs daily
3. Review AI token usage and costs
4. Implement authentication (replace PLACEHOLDER comments)
5. Set up automated testing
6. Configure monitoring and alerts
7. Document any production-specific configuration
8. Train team on new features

---

**Deployment Status**: 🎯 READY FOR TESTING

Once all tests pass, mark this deployment as SUCCESSFUL and celebrate! 🎉
