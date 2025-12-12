# Workflows Router - Comprehensive Test Suite Documentation

## Overview

A complete unit test suite for the TRPC workflows router at `/root/github-repos/ghl-agency-ai/server/api/routers/workflows.ts`.

**File Location:** `/root/github-repos/ghl-agency-ai/server/api/routers/workflows.test.ts`

**Statistics:**
- Total Lines: 2,055
- Total Test Cases: 117
- Test Suites: 14
- Using: Vitest + TypeScript

## Test Structure

### 1. Create Endpoint Tests (10 tests)
Tests for the `create` mutation that creates new workflows.

**Scenarios:**
- ✅ Create workflow with valid input (name, description, steps, trigger, geolocation)
- ✅ Reject missing required name field
- ✅ Reject invalid name length (>255 chars)
- ✅ Reject workflow with empty steps array
- ✅ Reject workflow with >50 steps
- ✅ Validate step configuration by type
- ✅ Reject invalid description length (>1000 chars)
- ✅ Accept optional geolocation parameter
- ✅ Handle database initialization errors
- ✅ Handle database constraint violations

**Key Validations:**
- Name: required, 1-255 chars
- Description: optional, max 1000 chars
- Steps: required, 1-50 steps
- Trigger: manual|scheduled|webhook|event (default: manual)
- Geolocation: optional (city, state, country)

### 2. List Endpoint Tests (9 tests)
Tests for the `list` query that retrieves user workflows with pagination and filtering.

**Scenarios:**
- ✅ List workflows with default pagination (limit=50, offset=0)
- ✅ List with custom pagination parameters
- ✅ Filter by active status (isActive=true)
- ✅ Filter by archived status (isActive=false)
- ✅ Return empty list when no workflows found
- ✅ Calculate step count for each workflow
- ✅ Enforce pagination limits (max 100)
- ✅ Handle database errors
- ✅ Isolation by userId (user sees only their workflows)

**Features:**
- Pagination: limit (1-100, default 50), offset (default 0)
- Status filtering: active|archived|paused
- Step count calculation
- Ordering by createdAt descending

### 3. Get Endpoint Tests (5 tests)
Tests for the `get` query that retrieves a single workflow by ID.

**Scenarios:**
- ✅ Retrieve workflow by ID with full configuration
- ✅ Throw NOT_FOUND for non-existent workflow
- ✅ Reject invalid workflow ID (<=0)
- ✅ Enforce user ownership verification
- ✅ Handle database errors

**Security:**
- Only return workflows owned by authenticated user
- Verify userId matches context user

### 4. Update Endpoint Tests (9 tests)
Tests for the `update` mutation that modifies workflow metadata and steps.

**Scenarios:**
- ✅ Update workflow name
- ✅ Update workflow description
- ✅ Update workflow status (active|paused|archived)
- ✅ Update workflow steps array
- ✅ Throw NOT_FOUND for non-existent workflow
- ✅ Validate name length on update (1-255 chars)
- ✅ Reject invalid trigger type
- ✅ Set updatedAt timestamp
- ✅ Handle database update errors

**Updateable Fields:**
- name: string (1-255 chars)
- description: string (optional, max 1000)
- trigger: enum (manual|scheduled|webhook|event)
- status: enum (active|paused|archived)
- steps: WorkflowStep[] (1-50 steps)

### 5. Delete Endpoint Tests (5 tests)
Tests for the `delete` mutation that soft-deletes workflows.

**Scenarios:**
- ✅ Soft delete workflow (sets isActive=false)
- ✅ Throw NOT_FOUND for non-existent workflow
- ✅ Reject invalid workflow ID
- ✅ Enforce user ownership (only delete own workflows)
- ✅ Handle database errors

**Implementation:**
- Soft delete by setting isActive=false
- Updates updatedAt timestamp
- Retains workflow data in database

### 6. Execute Endpoint Tests (6 tests)
Tests for the `execute` mutation that runs workflows in the browser.

**Scenarios:**
- ✅ Execute workflow successfully
- ✅ Pass geolocation to execution service
- ✅ Pass variables to execution service
- ✅ Reject invalid workflow ID
- ✅ Handle execution service errors
- ✅ Return execution ID and step results

**Input Parameters:**
- workflowId: positive integer
- geolocation: optional { city, state, country }
- variables: optional record<string, any>

**Response:**
- executionId: number
- workflowId: number
- status: execution status
- stepResults: array of step execution results
- output: workflow output data

### 7. GetExecutions Endpoint Tests (7 tests)
Tests for the `getExecutions` query that retrieves execution history.

**Scenarios:**
- ✅ Get execution history with pagination
- ✅ Filter executions by status
- ✅ Handle pagination parameters (limit, offset)
- ✅ Throw NOT_FOUND for non-existent workflow
- ✅ Reject invalid status filter
- ✅ Enforce pagination limits (max 100)
- ✅ Order executions by startedAt descending

**Filtering:**
- workflowId: required
- status: optional (pending|running|completed|failed|cancelled)
- limit: 1-100 (default 20)
- offset: >= 0 (default 0)

### 8. GetExecution Endpoint Tests (5 tests)
Tests for the `getExecution` query that retrieves a single execution.

**Scenarios:**
- ✅ Get single execution by ID
- ✅ Throw NOT_FOUND for non-existent execution
- ✅ Verify execution ownership (userId check)
- ✅ Reject invalid execution ID
- ✅ Handle service errors

**Security:**
- Only return executions owned by authenticated user
- Verify userId matches context user

### 9. CancelExecution Endpoint Tests (6 tests)
Tests for the `cancelExecution` mutation that stops running executions.

**Scenarios:**
- ✅ Cancel running execution
- ✅ Throw NOT_FOUND for non-existent execution
- ✅ Enforce user ownership (only cancel own executions)
- ✅ Call execution service cancel method
- ✅ Reject invalid execution ID
- ✅ Handle service errors

**Implementation:**
- Calls workflowExecution.cancelExecution service
- Updates execution status to cancelled
- Returns success confirmation

### 10. TestRun Endpoint Tests (10 tests)
Tests for the `testRun` mutation that tests workflows without persistence.

**Scenarios:**
- ✅ Execute test run without saving to database
- ✅ Pass variables to test execution
- ✅ Pass geolocation to test execution
- ✅ Support stepByStep execution mode
- ✅ Reject empty steps array
- ✅ Reject >50 steps
- ✅ Validate step configuration
- ✅ Handle test execution errors
- ✅ Return step results array
- ✅ Return error details on failure

**Input Parameters:**
- steps: WorkflowStep[] (1-50 steps, required)
- variables: optional record<string, any>
- geolocation: optional { city, state, country }
- stepByStep: boolean (default false)

**Response:**
- success: boolean
- status: execution status
- stepResults: array of step results
- output: execution output
- error: error details if failed

### 11. Authorization Tests (2 tests)
Tests for authentication and user isolation.

**Scenarios:**
- ✅ Only authenticated users can access endpoints
- ✅ Users isolated by userId (no cross-user access)

**Security Features:**
- All endpoints use protectedProcedure (require auth)
- All queries/mutations enforce userId from context
- Database queries filtered by userId

### 12. Input Validation Tests (7 tests)
Tests for comprehensive input validation.

**Workflow Step Validation:**
- ✅ Validate navigate step config (URL format)
- ✅ Validate wait step duration (max 60000ms)
- ✅ Accept valid extract schema types (contactInfo|productInfo|custom)
- ✅ Validate API call step method (GET|POST|PUT|DELETE|PATCH)
- ✅ Validate notification type (info|success|warning|error)

**Pagination Validation:**
- ✅ Reject negative offset
- ✅ Reject zero or negative limit

### 13. Edge Cases Tests (5 tests)
Tests for unusual scenarios and boundary conditions.

**Scenarios:**
- ✅ Handle workflow with null steps array
- ✅ Handle empty geolocation object
- ✅ Handle concurrent create requests
- ✅ Handle special characters in names
- ✅ Handle maximum 50-step workflows efficiently

### 14. Database Error Handling Tests (3 tests)
Tests for database failure scenarios.

**Scenarios:**
- ✅ Handle connection timeout
- ✅ Handle constraint violations
- ✅ Handle transaction rollbacks

## Workflow Step Types

All step types supported in tests:

1. **navigate**: Navigate to URL
   - Config: { url: string }

2. **act**: Perform action
   - Config: { instruction: string }

3. **observe**: Observe page state
   - Config: { observeInstruction: string }

4. **extract**: Extract data
   - Config: { extractInstruction: string, schemaType?: "contactInfo"|"productInfo"|"custom" }

5. **wait**: Wait for condition
   - Config: { waitMs?: number (0-60000), selector?: string }

6. **condition**: Conditional logic
   - Config: { condition: string }

7. **loop**: Iterate over items
   - Config: { items?: any[] }

8. **apiCall**: Make API request
   - Config: { method: "GET"|"POST"|"PUT"|"DELETE"|"PATCH", headers?: object, body?: any, saveAs?: string }

9. **notification**: Send notification
   - Config: { message: string, type: "info"|"success"|"warning"|"error" }

## Mock Utilities Used

### Test Helpers
- `createMockContext()`: Creates authenticated user context
- `createMockError()`: Creates test error objects
- `createTestDb()`: Creates chainable database mock

### Test Data Factories
- `createMockWorkflow()`: Generates test workflow object
- `createMockWorkflowExecution()`: Generates execution object
- `createValidWorkflowInput()`: Generates valid create input

## Running the Tests

### Run all tests
```bash
npm test
```

### Run workflows router tests only
```bash
npm test -- workflows.test.ts
```

### Run with coverage
```bash
npm test -- --coverage workflows.test.ts
```

### Watch mode
```bash
npm test -- --watch workflows.test.ts
```

## Test Patterns Applied

### TDD Approach
- Tests written in given-when-then style
- Clear assertion messages
- Minimal test dependencies

### Mock Strategy
- Database mocked with chainable query builder
- Service methods mocked as needed
- Environment variables controlled

### Error Testing
- Positive cases (happy path)
- Negative cases (validation failures)
- Error handling (exceptions)
- Edge cases (boundary conditions)

### Authorization Testing
- Authentication required (protectedProcedure)
- User isolation (userId filtering)
- Ownership verification (userId comparison)

## Coverage Summary

### Endpoints Covered: 10/10 (100%)
- [x] create (10 tests)
- [x] list (9 tests)
- [x] get (5 tests)
- [x] update (9 tests)
- [x] delete (5 tests)
- [x] execute (6 tests)
- [x] getExecutions (7 tests)
- [x] getExecution (5 tests)
- [x] cancelExecution (6 tests)
- [x] testRun (10 tests)

### Test Categories: 14 Suites
- [x] CRUD Operations (create, list, get, update, delete)
- [x] Execution Management (execute, getExecutions, getExecution, cancelExecution)
- [x] Test Runs (testRun)
- [x] Authorization (user isolation, ownership)
- [x] Input Validation (fields, enums, step configs)
- [x] Edge Cases (special chars, nulls, concurrency)
- [x] Database Errors (timeouts, constraints, rollbacks)

## Key Testing Principles

1. **Isolation**: Each test is independent and can run in any order
2. **Clarity**: Test names clearly describe what is being tested
3. **Coverage**: Both happy paths and error cases covered
4. **Maintainability**: Uses helper functions to reduce duplication
5. **Performance**: Uses mocks to avoid expensive operations
6. **Security**: Authorization and user isolation verified
7. **Validation**: Input validation for all data types

## Integration Points Tested

### Database (Drizzle ORM)
- ✅ Query builder mocking
- ✅ Insert, select, update, delete operations
- ✅ Error handling
- ✅ Pagination

### Workflow Execution Service
- ✅ executeWorkflow() calls
- ✅ getExecutionStatus() calls
- ✅ cancelExecution() calls
- ✅ testExecuteWorkflow() calls

### TRPC Context
- ✅ User authentication
- ✅ User ID extraction
- ✅ Protected procedures

## Files Generated

- `/root/github-repos/ghl-agency-ai/server/api/routers/workflows.test.ts` - Main test file (2,055 lines)
- `/root/github-repos/ghl-agency-ai/server/api/routers/WORKFLOWS_TEST_DOCUMENTATION.md` - This documentation

## Notes for Developers

### Adding New Tests
1. Follow existing test structure (describe/it pattern)
2. Use helper functions for mock creation
3. Clear test names describing the scenario
4. Include both positive and negative cases
5. Test error messages match expectations

### Updating Tests
1. When modifying router endpoints, update corresponding tests
2. When adding new fields, add validation tests
3. When changing error codes, update error assertions
4. Keep test names descriptive and accurate

### Common Patterns
```typescript
// Test creation with valid input
it("should create with valid input", async () => {
  const db = createTestDb({ insertResponse: [mockData] });
  const caller = router.createCaller(mockCtx);
  const result = await caller.create(validInput);
  expect(result).toBeDefined();
});

// Test not found error
it("should throw NOT_FOUND", async () => {
  const db = createTestDb({ selectResponse: [] });
  const caller = router.createCaller(mockCtx);
  await expect(caller.get({ id: 999 })).rejects.toThrow("not found");
});

// Test authorization
it("should enforce user isolation", async () => {
  // db returns empty (user 2's workflow not visible to user 1)
  const db = createTestDb({ selectResponse: [] });
  const caller = router.createCaller(user1Context);
  await expect(caller.get({ id: 2 })).rejects.toThrow();
});
```

## Related Files

- **Router Implementation:** `/root/github-repos/ghl-agency-ai/server/api/routers/workflows.ts`
- **Test Helpers:** `/root/github-repos/ghl-agency-ai/client/src/__tests__/helpers/test-helpers.ts`
- **Test Database Mock:** `/root/github-repos/ghl-agency-ai/client/src/__tests__/helpers/test-db.ts`
- **Workflow Execution Service:** `/root/github-repos/ghl-agency-ai/server/services/workflowExecution.service.ts`
- **Database Schema:** `/root/github-repos/ghl-agency-ai/drizzle/schema.ts`

## Future Enhancements

- [ ] Performance benchmarking tests
- [ ] Load testing for large step arrays
- [ ] Integration tests with actual database
- [ ] E2E tests with browser execution
- [ ] Snapshot tests for complex responses
- [ ] Mutation testing for test quality validation
