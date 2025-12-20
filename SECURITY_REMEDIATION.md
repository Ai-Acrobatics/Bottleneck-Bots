# Security Remediation Plan
## GHL Agency AI - Critical Authentication Fixes

**Created:** December 20, 2025
**Priority:** HIGH
**Status:** Pending Implementation

---

## Executive Summary

Multiple tRPC routers are using `publicProcedure` with hardcoded `userId = 1` instead of `protectedProcedure` with authenticated user context. This creates a **critical security vulnerability** where:

1. Any unauthenticated user can access these endpoints
2. All actions are performed as user ID 1 regardless of who makes the request
3. Data isolation between users is completely bypassed

---

## Affected Routers

### Priority 1 (CRITICAL - Financial/Communication Impact)

| Router | File | Impact |
|--------|------|--------|
| aiCalling | `server/api/routers/aiCalling.ts` | Phone calls made as user 1 |
| credits | `server/api/routers/credits.ts` | Credit purchases/balances exposed |
| email | `server/api/routers/email.ts` | Email access for user 1 |

### Priority 2 (HIGH - Data Exposure)

| Router | File | Impact |
|--------|------|--------|
| leadEnrichment | `server/api/routers/leadEnrichment.ts` | Lead data exposed |
| marketplace | `server/api/routers/marketplace.ts` | Marketplace actions as user 1 |

---

## Remediation Steps

### Step 1: Change Procedure Type

**Before:**
```typescript
import { router, publicProcedure } from "../../_core/trpc";

// ...

someEndpoint: publicProcedure.mutation(async ({ input }) => {
  // PLACEHOLDER: Replace with actual userId from auth context
  const userId = 1;
  // ...
})
```

**After:**
```typescript
import { router, protectedProcedure } from "../../_core/trpc";

// ...

someEndpoint: protectedProcedure.mutation(async ({ input, ctx }) => {
  const userId = ctx.user.id;
  // ...
})
```

### Step 2: Endpoints to Fix

#### aiCalling.ts (12 endpoints)
- [ ] `createCampaign` (line 101)
- [ ] `listCampaigns` (line 166)
- [ ] `getCampaign` (line 216)
- [ ] `updateCampaign` (line 249)
- [ ] `deleteCampaign` (line 304)
- [ ] `activateCampaign` (line 357)
- [ ] `makeCall` (line 399)
- [ ] `listCalls` (line 559)
- [ ] `getCall` (line 623)
- [ ] `updateCall` (line 656)
- [ ] `deleteCall` (line 701)
- [ ] `importContacts` (line 791)

#### credits.ts (6 endpoints)
- [ ] `getBalances` (line 87)
- [ ] `getBalance` (line 114)
- [ ] `purchaseCredits` (line 262)
- [ ] `getTransactionHistory` (line 351)
- [ ] `getUsageStats` (line 411)
- [ ] `getUsageByType` (line 478)

#### email.ts (10+ endpoints)
- All endpoints need conversion

#### leadEnrichment.ts (15+ endpoints)
- All endpoints need conversion

#### marketplace.ts
- [ ] `installTemplate` (line 106)

---

## Testing Requirements

Before deploying fixes:

1. **Unit Tests**
   - Verify endpoints reject unauthenticated requests
   - Verify correct userId is extracted from context

2. **Integration Tests**
   - Test with valid JWT tokens
   - Test with invalid/expired tokens
   - Verify data isolation between users

3. **Manual Testing**
   - Verify existing functionality works
   - Verify UI handles 401 responses

---

## Implementation Timeline

| Phase | Tasks | Priority |
|-------|-------|----------|
| Phase 1 | Fix aiCalling router | CRITICAL |
| Phase 2 | Fix credits router | HIGH |
| Phase 3 | Fix email router | HIGH |
| Phase 4 | Fix leadEnrichment router | MEDIUM |
| Phase 5 | Fix marketplace router | MEDIUM |

---

## Immediate Mitigation

If full fix cannot be deployed immediately:

1. Add rate limiting to affected endpoints
2. Add IP-based access controls
3. Monitor for suspicious activity
4. Consider temporarily disabling affected endpoints

---

## Code Templates

### Pattern for Protected Endpoints

```typescript
import { z } from "zod";
import { router, protectedProcedure } from "../../_core/trpc";
import { TRPCError } from "@trpc/server";

export const exampleRouter = router({
  exampleEndpoint: protectedProcedure
    .input(z.object({ /* ... */ }))
    .mutation(async ({ input, ctx }) => {
      // ctx.user is guaranteed to exist by protectedProcedure
      const userId = ctx.user.id;

      // Use userId for all database operations
      const result = await db
        .select()
        .from(someTable)
        .where(eq(someTable.userId, userId));

      return result;
    }),
});
```

---

## Verification Checklist

After remediation:

- [ ] All affected endpoints return 401 without auth
- [ ] All affected endpoints work with valid auth
- [ ] User A cannot access User B's data
- [ ] Audit logs show correct userId
- [ ] No regression in existing functionality
- [ ] Frontend handles auth errors gracefully

---

## References

- `server/_core/trpc.ts` - Procedure definitions
- `server/_core/context.ts` - Context creation
- `server/api/routers/sop.ts` - Example of correct implementation

---

**Owner:** Backend Team
**Review:** Security Team
**Timeline:** ASAP
