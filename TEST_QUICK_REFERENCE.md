# Test Suite Quick Reference

## Files Created

| File | Tests | Coverage |
|------|-------|----------|
| `server/rag/embeddings.test.ts` | 48 | Embedding generation, text chunking, similarity, formatting |
| `server/rag/retrieval.test.ts` | 41 | Website retrieval, semantic search, context building, formatting |
| `server/workflows/ghl/login.test.ts` | 40 | Authentication, 2FA, login state, error handling |
| `server/workflows/ghl/extract.test.ts` | 48 | Data extraction, navigation, multiple data types |
| `server/api/rest/routes/webhooks.test.ts` | 51 | API validation, handlers, logging, callbacks |

**Total: 228+ test cases**

## Quick Start

```bash
# Run all tests
npm run test

# Run specific test file
npm run test server/rag/embeddings.test.ts

# Watch mode
npm run test -- --watch

# With coverage
npm run test -- --coverage
```

## Test Organization

### 1. RAG Embeddings (`embeddings.test.ts`)

**Functions Tested:**
- `generateEmbedding()` - Single embedding generation
- `generateEmbeddings()` - Batch embedding generation
- `chunkText()` - Text chunking with overlap
- `cosineSimilarity()` - Vector similarity calculation
- `findTopK()` - Top-K similarity search
- `createPageKnowledgeText()` - Knowledge formatting
- `createElementSelectorText()` - Selector formatting
- `createActionSequenceText()` - Sequence formatting
- `createErrorPatternText()` - Error pattern formatting

**Key Test Scenarios:**
- Valid input handling
- Empty/whitespace input rejection
- Text truncation for oversized input
- Batch processing with filtering
- Mathematical accuracy of similarity
- Chunking at boundaries
- Missing optional field handling

---

### 2. RAG Retrieval (`retrieval.test.ts`)

**Functions Tested:**
- `getWebsiteByDomain()` - Website lookup
- `getOrCreateWebsite()` - Website creation with defaults
- `findSelectorsForElement()` - Semantic selector search
- `findActionSequences()` - Action sequence search
- `findErrorRecovery()` - Error pattern recovery
- `getAutomationContext()` - Complete context building
- `formatContextForPrompt()` - Prompt formatting

**Key Test Scenarios:**
- Database query execution
- Domain normalization
- Semantic search with embeddings
- Ranking by relevance/reliability/success rate
- Missing data handling
- Parallel query execution
- Context to prompt formatting
- Section generation and filtering

---

### 3. GHL Login (`login.test.ts`)

**Functions Tested:**
- `ghlLogin()` - Authentication workflow
- `isGHLLoggedIn()` - Login state detection
- `ghlLogout()` - Logout workflow

**Key Test Scenarios:**
- Valid credential handling
- 2FA requirement detection
- 2FA code submission
- Multiple login page redirects
- Dashboard/location/launchpad URL detection
- Error extraction from page
- Already logged in detection
- Session state checking
- Logout flow

**Schema Validation:**
- Email format
- Password requirement
- 2FA code length (6 digits)
- Location ID optional

---

### 4. GHL Extract (`extract.test.ts`)

**Functions Tested:**
- `extractContacts()` - Contact data extraction
- `extractWorkflows()` - Workflow extraction
- `extractPipelines()` - Pipeline data extraction
- `extractDashboardMetrics()` - Metrics extraction
- `extractContactDetails()` - Contact profile extraction
- `extractCampaignStats()` - Campaign statistics

**Key Test Scenarios:**
- Navigation to correct pages
- Search filter application
- Data parsing and validation
- Multiple data types (strings, numbers, percentages)
- Error handling with graceful degradation
- Missing data handling
- Sequential operations
- Navigation optimization

---

### 5. Webhooks API (`webhooks.test.ts`)

**Endpoints Tested:**
- `POST /api/v1/webhooks/automation` - Main webhook handler
- `GET /api/v1/webhooks/health` - Health check

**Validation:**
- Webhook secret authentication (header/query param)
- Payload schema validation
- Task type validation
- Required field validation
- Timeout range validation
- Email format validation
- URL format validation

**Task Handlers:**
- `ghl-login` - Login task
- `ghl-extract-contacts` - Contact extraction
- `ghl-extract-workflows` - Workflow extraction
- `ghl-extract-pipelines` - Pipeline extraction
- `ghl-extract-dashboard` - Dashboard metrics
- `browser-navigate` - URL navigation
- `browser-act` - Browser actions
- `browser-extract` - Data extraction
- `custom` - Custom action sequences

**Key Test Scenarios:**
- Authentication validation
- Payload validation
- Task-specific handler execution
- Database logging (success/failure)
- Callback notifications
- Error handling and cleanup
- Response formatting

---

## Mock Strategy

### Environment Variables
```typescript
process.env.WEBHOOK_SECRET = "test-secret";
process.env.OPENAI_API_KEY = "test-key";
process.env.BROWSERBASE_API_KEY = "test-key";
```

### Mocked Modules
1. **OpenAI** - Embedding generation
2. **Stagehand** - Browser automation
3. **Database** - All queries and operations
4. **Fetch/HTTP** - Callback notifications

### Mock Setup Pattern
```typescript
beforeEach(() => {
  vi.clearAllMocks();
  // Setup specific mock state
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

---

## Test Patterns

### 1. Schema Validation Testing
```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const result = schema.safeParse(data);
expect(result.success).toBe(true);
```

### 2. Database Query Testing
```typescript
mockDb.execute.mockResolvedValue({ rows: [] });
const result = await findSelectorsForElement(1, "element");
expect(mockDb.execute).toHaveBeenCalled();
```

### 3. Error Handling Testing
```typescript
mockStagehand.act.mockRejectedValue(new Error("Failed"));
const result = await extractContacts(mockStagehand);
expect(result).toEqual([]);
```

### 4. Mock Response Testing
```typescript
mockStagehand.extract.mockResolvedValue({
  contacts: [{ name: "John" }]
});
const result = await extractContacts(mockStagehand);
expect(result[0].name).toBe("John");
```

---

## Common Assertions

### String/Number Assertions
```typescript
expect(result).toBe(expected);
expect(result).toContain(substring);
expect(result).toHaveLength(count);
```

### Array Assertions
```typescript
expect(array).toHaveLength(3);
expect(array[0]).toEqual(item);
expect(array.every(item => item.valid)).toBe(true);
```

### Function/Mock Assertions
```typescript
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(param);
expect(mockFn).toHaveBeenCalledTimes(count);
```

### Error/Promise Assertions
```typescript
await expect(fn()).rejects.toThrow("error");
expect(result).resolves.toBe(value);
```

### Object Property Assertions
```typescript
expect(obj).toHaveProperty("key");
expect(obj).toEqual(expected);
expect(obj).toMatchObject(partial);
```

---

## Running Specific Test Categories

```bash
# All embeddings tests
npm run test server/rag/embeddings.test.ts

# All retrieval tests
npm run test server/rag/retrieval.test.ts

# All login tests
npm run test server/workflows/ghl/login.test.ts

# All extraction tests
npm run test server/workflows/ghl/extract.test.ts

# All webhook tests
npm run test server/api/rest/routes/webhooks.test.ts

# Run with specific pattern
npm run test -- --grep "should login successfully"
```

---

## Debugging Tests

### Enable Verbose Output
```bash
npm run test -- --reporter=verbose
```

### Run Single Test
```bash
npm run test -- --grep "specific test name"
```

### Debug with Node Inspector
```bash
node --inspect-brk ./node_modules/vitest/vitest.mjs
```

### Print Mock Calls
```typescript
console.log(mockFn.mock.calls);
console.log(mockFn.mock.results);
```

---

## Test Data Examples

### Contact Object
```typescript
{
  name: "John Doe",
  email: "john@example.com",
  phone: "555-1234",
  tags: ["vip", "active"],
  customFields: { field1: "value1" }
}
```

### Workflow Object
```typescript
{
  name: "Welcome Email",
  status: "active",
  triggerType: "new_contact",
  stepsCount: 5
}
```

### Pipeline Object
```typescript
{
  name: "Sales Pipeline",
  stages: [
    { name: "Lead", count: 45 },
    { name: "Qualified", count: 12 }
  ]
}
```

### Login Credentials
```typescript
{
  email: "user@example.com",
  password: "SecurePassword123",
  locationId: "loc-123", // optional
  twoFactorCode: "123456" // optional
}
```

### Webhook Payload
```typescript
{
  clientId: "client-123",
  taskType: "ghl-login",
  taskData: {
    email: "user@example.com",
    password: "password123"
  },
  callbackUrl: "https://example.com/webhook",
  priority: "normal",
  timeout: 300000
}
```

---

## Coverage Goals

- **Line Coverage**: 95%+
- **Branch Coverage**: 90%+
- **Function Coverage**: 100%
- **Statement Coverage**: 95%+

---

## Continuous Integration

Tests are designed to:
- Run without external dependencies
- Complete in < 5 minutes
- Provide clear failure messages
- Work in parallel
- Support headless environments

---

## Adding New Tests

### Template for New Test Suite
```typescript
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

describe("New Feature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should do something", async () => {
    // Arrange
    const input = "test";

    // Act
    const result = await function(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

---

## Troubleshooting

### Mock Not Working
- Check mock path matches import path
- Ensure mock is defined before imports
- Clear mocks in beforeEach

### Test Timeout
- Increase timeout: `it("test", async () => {...}, 10000)`
- Check for unresolved promises
- Mock slow operations

### Assertion Failures
- Check mock return values
- Verify test data accuracy
- Check for async/await issues

### Database Errors
- Ensure getDb is mocked
- Check mock.execute returns proper structure
- Verify query parameters

---

## Best Practices

1. **One assertion focus** - Each test should verify one behavior
2. **Clear test names** - Describe what is being tested
3. **Independent tests** - No test should depend on another
4. **Mock externals** - Don't make real network/database calls
5. **Error scenarios** - Always test happy and sad paths
6. **Realistic data** - Use data that matches real usage
7. **Comment code** - Explain non-obvious test logic
8. **Keep fast** - All tests should run in seconds

---

## Resources

- Vitest Docs: https://vitest.dev
- Testing Library: https://testing-library.com
- Zod Validation: https://zod.dev
- Mocking Guide: https://vitest.dev/guide/mocking.html
