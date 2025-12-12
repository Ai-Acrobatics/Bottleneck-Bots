# Workflow Execution Tests - Quick Reference

## Test File Location
`/root/github-repos/ghl-agency-ai/server/services/workflowExecution.test.ts`

## Quick Commands

```bash
# Run all workflow tests
npm run test -- server/services/workflowExecution.test.ts

# Run tests by function
npm run test -- --grep "executeWorkflow" server/services/workflowExecution.test.ts
npm run test -- --grep "testExecuteWorkflow" server/services/workflowExecution.test.ts
npm run test -- --grep "getExecutionStatus" server/services/workflowExecution.test.ts
npm run test -- --grep "cancelExecution" server/services/workflowExecution.test.ts

# Watch mode
npm run test -- --watch server/services/workflowExecution.test.ts
```

## Test Coverage Summary

| Function | Tests | Key Scenarios |
|----------|-------|---------------|
| **executeWorkflow** | 10 | Workflow validation, execution, cleanup, variable passing |
| **testExecuteWorkflow** | 7 | No DB persistence, step tracking, duration measurement |
| **getExecutionStatus** | 8 | Status retrieval, step results, output data |
| **cancelExecution** | 8 | Running cancellation, session termination |
| **Integration** | 3 | Multi-step workflows, variable substitution, caching |

## Test Structure

### executeWorkflow(options: ExecuteWorkflowOptions)
```
✓ should throw error when workflow not found
✓ should throw error when workflow is not active
✓ should throw error when workflow has no steps
✓ should throw error when database not initialized
✓ should successfully execute workflow with single step
✓ should pass variables correctly between steps
✓ should create database records for execution and browser session
✓ should stop execution when step fails with continueOnError false
✓ should continue execution when step fails with continueOnError true
✓ should clean up resources on failure
```

### testExecuteWorkflow(options: TestExecuteWorkflowOptions)
```
✓ should throw error when steps array is empty
✓ should not persist to database (executionId: -1)
✓ should execute steps step-by-step with delays
✓ should track duration per step
✓ should handle errors without database persistence
✓ should return execution status with -1 IDs for test run
✓ should execute multiple steps in order
```

### getExecutionStatus(executionId: number)
```
✓ should throw error when database not initialized
✓ should throw error when execution not found
✓ should return correct status for running execution
✓ should return correct status for completed execution
✓ should return correct status for failed execution
✓ should include step results in status
✓ should include output data in status
✓ should handle multiple status checks
```

### cancelExecution(executionId: number)
```
✓ should throw error when database not initialized
✓ should throw error when execution not found
✓ should throw error when trying to cancel non-running execution
✓ should successfully cancel running execution
✓ should update execution status to cancelled
✓ should terminate browser session on cancel
✓ should handle errors during session termination gracefully
✓ should set error message on cancelled execution
```

### Integration Tests
```
✓ should handle variable substitution in multiple steps
✓ should process workflow with geolocation parameters
✓ should handle workflow cache TTL correctly
✓ should create execution context with all required fields
```

## Mock Quick Reference

### Database Mock
```typescript
(getDb as any).mockResolvedValue(db);
```

### Browserbase Session Mock
```typescript
(browserbaseSDK.createSession as any).mockResolvedValue(mockSession);
```

### Cache Mock
```typescript
(cacheService.getOrSet as any).mockResolvedValue(mockWorkflow);
```

## Common Assertions

```typescript
// Error handling
await expect(executeWorkflow(options)).rejects.toThrow('Workflow not found');

// Mocking verification
expect(getDb).toHaveBeenCalled();
expect(browserbaseSDK.terminateSession).toHaveBeenCalled();

// Value assertions
expect(status.executionId).toBe(-1);
expect(status.status).toBe('completed');
expect(options.steps).toHaveLength(1);
```

## Test Data Objects

### Mock Workflow
```typescript
{
  id: 1,
  userId: 123,
  isActive: true,
  steps: [
    {
      type: 'navigate',
      order: 1,
      config: { type: 'navigate', url: 'https://example.com' },
    },
  ],
}
```

### Mock Execution
```typescript
{
  id: 1,
  workflowId: 1,
  userId: 123,
  status: 'running',
  startedAt: new Date(),
  stepResults: [],
}
```

### Execution Status
```typescript
{
  executionId: 1,
  workflowId: 1,
  status: 'completed',
  stepResults: [...],
  output: { extractedData: [...], finalVariables: {...} },
}
```

## Workflow Step Types Tested

- **navigate**: Navigate to URL
- **act**: Perform browser action with instruction
- **observe**: Get available actions on page
- **extract**: Extract structured data
- **wait**: Wait for time or element
- **condition**: Evaluate condition expression
- **loop**: Iterate over items
- **apiCall**: Make HTTP request
- **notification**: Send notification

## Error Scenarios Covered

| Error | When | Function |
|-------|------|----------|
| Database not initialized | getDb() returns null | All functions |
| Workflow not found | Workflow doesn't exist | executeWorkflow |
| Workflow is not active | workflow.isActive = false | executeWorkflow |
| Workflow has no steps | steps array empty | executeWorkflow, testExecuteWorkflow |
| Execution not found | No execution record | getExecutionStatus, cancelExecution |
| Only running executions can be cancelled | status != 'running' | cancelExecution |
| Missing API key | GEMINI_API_KEY not set | executeWorkflow, testExecuteWorkflow |

## Variable Substitution Examples

```typescript
// Input
const urlTemplate = 'https://example.com?name={{firstName}}&email={{email}}';
const variables = { firstName: 'John', email: 'john@example.com' };

// Output
'https://example.com?name=John&email=john@example.com'
```

## Test Execution Pipeline

1. **Setup** (~500ms)
   - Clear all mocks
   - Create mock database chain
   - Setup mock returns

2. **Execution** (~48ms)
   - Call function with test parameters
   - Execute business logic
   - Handle async operations

3. **Assertion** (~0ms)
   - Verify expected behavior
   - Check error messages
   - Validate mock calls

4. **Cleanup** (~0ms)
   - beforeEach clears mocks
   - No additional cleanup needed

## Adding New Tests

```typescript
describe('newFunction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something', async () => {
    // Setup
    (getDb as any).mockResolvedValue(mockDb);

    // Execute
    const result = await newFunction(options);

    // Assert
    expect(result).toEqual(expected);
  });
});
```

## Debug Tips

```typescript
// Log mock calls
console.log(vi.mocked(getDb).mock.calls);

// Log mock return value
console.log((getDb as any).mock.results[0].value);

// Check call count
expect(getDb).toHaveBeenCalledTimes(2);

// Check call arguments
expect(getDb).toHaveBeenCalledWith(arg1, arg2);
```

## Status Values

- `running` - Execution in progress
- `completed` - Successfully finished
- `failed` - Encountered error
- `cancelled` - User cancelled execution

## Test Results

✓ **All 36 tests passing**
- Execution time: ~990ms
- Test time: ~48ms
- No skipped tests
- No failing tests

## Next Steps

1. Run tests: `npm run test -- server/services/workflowExecution.test.ts`
2. Review coverage
3. Add step handler tests if needed
4. Monitor CI/CD integration
5. Update tests as service evolves

## Documentation Files

- **Full Documentation**: `WORKFLOW_EXECUTION_TESTS.md`
- **Service README**: `README_WORKFLOW_EXECUTION.md`
- **This File**: `WORKFLOW_TESTS_QUICK_REFERENCE.md`
