# Sentry Alert Playbooks

## Overview

This document provides step-by-step response procedures for critical production alerts from Sentry.

---

## 1. High Error Rate (>10 errors/min)

**Alert Trigger:** More than 10 errors per minute for 1+ minutes

### Immediate Actions (5 minutes)
1. **Check Sentry dashboard** for error distribution
   - Which endpoints/components are failing?
   - Is it a single user or widespread?
   - What's the error message pattern?

2. **Check deployment timeline**
   - Was there a recent deploy? (Check Vercel dashboard)
   - If yes, and started immediately after: **Consider rollback**

3. **Check external dependencies**
   - Database status (Neon dashboard)
   - Redis status (Upstash dashboard)
   - Stripe API status
   - Third-party API health

### Response Actions (15 minutes)
- **If deployment-related:** Rollback to previous version
  ```bash
  # Via Vercel dashboard or CLI
  vercel rollback [deployment-url]
  ```

- **If database-related:** Check connection pool
  ```bash
  # Monitor active connections
  SELECT count(*) FROM pg_stat_activity;
  ```

- **If API-related:** Enable rate limiting or circuit breaker
  ```typescript
  // Temporarily disable problematic integration
  process.env.DISABLE_[SERVICE] = 'true'
  ```

### Follow-up (1 hour)
- Root cause analysis in Sentry
- Create GitHub issue with reproduction steps
- Update error handling/retry logic
- Add integration tests

---

## 2. API 500 Errors (>5 in 5 min)

**Alert Trigger:** 5+ internal server errors in 5 minutes

### Immediate Actions
1. **Identify failing endpoint**
   ```
   Sentry → Issues → Filter by status_code:500
   ```

2. **Check server logs**
   ```bash
   vercel logs [deployment-url] --follow
   ```

3. **Reproduce locally** (if possible)
   - Copy request headers/body from Sentry
   - Test in dev environment

### Common Causes & Fixes

#### Database Connection Pool Exhausted
```typescript
// Check pool status
db.pool.totalCount
db.pool.idleCount
db.pool.waitingCount

// Temporary fix: Increase pool size
DATABASE_URL=postgresql://...?pool_timeout=30&max_pool_size=20
```

#### Unhandled Promise Rejection
```typescript
// Add try-catch to async routes
app.post('/api/route', async (req, res) => {
  try {
    await riskyOperation();
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Internal error' });
  }
});
```

#### Out of Memory
```bash
# Check Vercel function memory
vercel logs --meta

# If OOM: Increase function memory in vercel.json
{
  "functions": {
    "api/**": {
      "memory": 3008
    }
  }
}
```

---

## 3. Database Connection Failures

**Alert Trigger:** Any database connection error

### Immediate Actions
1. **Check Neon dashboard** for service status
2. **Verify connection string** is correct
3. **Test connection** from Vercel deployment
   ```bash
   curl https://[app-url]/api/health/db
   ```

### Recovery Steps

#### Connection Pool Leak
```typescript
// Ensure connections are released
try {
  const result = await db.query('...');
  return result;
} finally {
  // Connection auto-released by pool
}
```

#### SSL Certificate Issues
```typescript
// Update connection string
DATABASE_URL=postgresql://...?sslmode=require&ssl=true
```

#### Neon Project Suspended
- Check billing status in Neon dashboard
- Upgrade plan if free tier limit exceeded
- Contact Neon support for critical issues

---

## 4. Unhandled Promise Rejections

**Alert Trigger:** 3+ unhandled rejections in 10 minutes

### Diagnosis
1. **Check async/await patterns**
   ```typescript
   // ❌ Missing await
   async function bad() {
     riskyOperation(); // No await!
   }

   // ✅ Proper await
   async function good() {
     await riskyOperation();
   }
   ```

2. **Add global handler** (temporary)
   ```typescript
   // server/index.ts
   process.on('unhandledRejection', (reason, promise) => {
     console.error('Unhandled Rejection:', reason);
     Sentry.captureException(reason);
   });
   ```

### Prevention
- Enable TypeScript strict mode
- Add ESLint rule: `no-floating-promises`
- Use `void` for fire-and-forget operations

---

## 5. Memory Leak Detection

**Alert Trigger:** Heap usage > 90%

### Immediate Actions
1. **Restart affected instances**
   - Vercel auto-restarts on errors
   - Monitor if leak persists

2. **Check recent changes**
   - New caching logic?
   - Event listeners not removed?
   - Large data structures in memory?

### Memory Profiling
```bash
# Local profiling
NODE_OPTIONS="--heapsnapshot-signal=SIGUSR2" npm start

# Trigger snapshot
kill -SIGUSR2 [pid]

# Analyze with Chrome DevTools
```

### Common Causes
- **Event listener leaks**
  ```typescript
  // Always remove listeners
  useEffect(() => {
    const handler = () => {};
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  ```

- **Cache not expiring**
  ```typescript
  // Add TTL to cache entries
  cache.set(key, value, { ttl: 3600 });
  ```

- **Global state accumulation**
  ```typescript
  // Clear old data periodically
  setInterval(() => {
    cleanupOldSessions();
  }, 3600000);
  ```

---

## 6. Slow API Response (P95 > 2s)

**Alert Trigger:** P95 latency exceeds 2000ms

### Performance Diagnosis
1. **Identify slow endpoint**
   - Sentry Performance → Transactions
   - Sort by P95 duration

2. **Check database queries**
   ```sql
   -- Find slow queries
   SELECT query, mean_exec_time
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

3. **Add database indexes**
   ```sql
   -- Example: Index on frequently queried columns
   CREATE INDEX idx_bots_user_id ON bots(user_id);
   CREATE INDEX idx_executions_status ON executions(status, created_at);
   ```

### Quick Wins
- **Enable response compression**
  ```typescript
  import compression from 'compression';
  app.use(compression());
  ```

- **Add caching headers**
  ```typescript
  res.setHeader('Cache-Control', 'public, max-age=300');
  ```

- **Paginate large responses**
  ```typescript
  const limit = Math.min(req.query.limit || 50, 100);
  const offset = req.query.offset || 0;
  ```

---

## 7. User Session Errors (3+ errors/session)

**Alert Trigger:** Single user experiencing 3+ errors in one session

### Investigation
1. **Watch session replay** in Sentry
2. **Check user environment**
   - Browser version
   - Device type
   - Network conditions

3. **Look for patterns**
   - Specific feature causing issues?
   - Client-side state corruption?

### Common Fixes
- **Add client-side error recovery**
  ```typescript
  function useErrorRecovery() {
    const [error, setError] = useState(null);

    const reset = () => {
      setError(null);
      window.location.reload();
    };

    return { error, reset };
  }
  ```

- **Improve loading states**
  ```typescript
  if (isLoading) return <Spinner />;
  if (error) return <ErrorFallback />;
  return <Content />;
  ```

---

## Escalation Matrix

| Severity | Response Time | Escalate To | Notification Channel |
|----------|--------------|-------------|---------------------|
| Critical | 5 minutes | Engineering lead | PagerDuty + Slack |
| High | 15 minutes | On-call engineer | Slack #critical-alerts |
| Medium | 1 hour | Team channel | Slack #alerts |
| Low | Next business day | GitHub issue | Email digest |

## Post-Incident Checklist

After resolving any critical alert:

1. ✅ **Document timeline** in incident log
2. ✅ **Root cause analysis** in GitHub issue
3. ✅ **Add tests** to prevent regression
4. ✅ **Update monitoring** (thresholds, alerts)
5. ✅ **Share learnings** in team meeting
6. ✅ **Improve error handling** in affected code
7. ✅ **Update this playbook** if needed

## Additional Resources

- [Sentry Dashboard](https://sentry.io/organizations/[org]/projects/bottleneck-bots/)
- [Vercel Dashboard](https://vercel.com/[team]/bottleneck-bots)
- [Neon Dashboard](https://console.neon.tech/)
- [Upstash Dashboard](https://console.upstash.com/)
- [Incident Log Template](./INCIDENT_LOG_TEMPLATE.md)
