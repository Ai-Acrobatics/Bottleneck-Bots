# Variable Substitution Function - Test Suite Index

This directory contains comprehensive tests for the `substituteVariables` function used throughout the workflow execution service.

## Quick Links

### Documentation
- [Executive Summary](../../SUBSTITUTE_VARIABLES_TEST_README.md) - High-level overview and quick start
- [Full Documentation](./VARIABLE_SUBSTITUTION_TEST_DOCUMENTATION.md) - Detailed test descriptions and specifications
- [Quick Reference](./TEST_SUMMARY.md) - Quick lookup guide with examples

### Tests
- [Test File](./variableSubstitution.test.ts) - 91 comprehensive unit tests

## Test Quick Stats

```
Total Tests:    91
Pass Rate:      100%
Duration:       ~46ms
Framework:      Vitest
Coverage:       100% (pure function)
```

## Test Categories

| # | Category | Tests | Key Areas |
|---|----------|-------|-----------|
| 1 | String Substitution | 26 | Basic replacement, multiple vars, missing vars |
| 2 | Object Substitution | 18 | Simple, nested, deep nesting, mixed types |
| 3 | Array Substitution | 20 | String arrays, object arrays, nested arrays |
| 4 | Edge Cases | 26 | Null, undefined, primitives, type conversion |
| 5 | Security | 16 | Special chars, malformed patterns, XSS, case sensitivity |
| 6 | Integration | 5 | Real-world URLs, APIs, workflows |
| 7 | Performance | 4 | Large strings, many vars, large arrays |
| 8 | Regression | 5 | Known workflow patterns |

## Running Tests

```bash
# Run all tests
npm test -- server/services/variableSubstitution.test.ts

# Run with verbose output
npm test -- server/services/variableSubstitution.test.ts --reporter=verbose

# Run in watch mode
npm test -- --watch server/services/variableSubstitution.test.ts
```

## Function Overview

```typescript
export function substituteVariables(
  value: unknown,
  variables: Record<string, unknown>
): unknown
```

Replaces `{{variableName}}` patterns with values from the variables map, recursively processing objects and arrays.

### Examples

**Simple**:
```typescript
substituteVariables("Hello {{name}}", { name: "John" })
// "Hello John"
```

**Nested**:
```typescript
substituteVariables(
  { user: { name: "{{name}}" } },
  { name: "John" }
)
// { user: { name: "John" } }
```

**Array**:
```typescript
substituteVariables(
  ["{{item}}", "{{item}}"],
  { item: "value" }
)
// ["value", "value"]
```

## Key Features

- Pure function (no side effects)
- Recursive processing for objects/arrays
- Type-preserving for primitives
- Safe (no code evaluation)
- Efficient (O(n) complexity)
- XSS-safe (string-based only)

## Variable Name Rules

**Valid** (word characters only):
- `{{name}}`
- `{{firstName}}`
- `{{var_123}}`

**Invalid** (special characters not supported):
- `{{user-name}}` - hyphens
- `{{user name}}` - spaces
- `{{obj.prop}}` - dots
- `{{user@email}}` - special chars

## Using These Tests

### For Development
1. Run tests to verify changes: `npm test`
2. Add new tests for new features (TDD)
3. Use tests as documentation

### For Code Review
1. Review test coverage in the test file
2. Check for security test coverage
3. Verify edge cases handled

### For Maintenance
1. Run tests before refactoring
2. All tests should pass before commit
3. Add regression tests for bugs

## Integration Points

The `substituteVariables` function is used in:

- **Navigation Steps**: URL generation with variables
- **Act/Observe/Extract Steps**: Instruction templating
- **API Call Steps**: URL, header, and body substitution
- **Conditional Steps**: Expression evaluation
- **Wait Steps**: Selector generation

## Source Code

- **Implementation**: `workflowExecution.service.ts` (lines 93-110)
- **Exported**: Yes (for testing and external use)
- **Type**: Pure function (no dependencies)

## Notes

- Tests define the specification through examples
- All 91 tests must pass before commits
- Tests are self-documenting
- Safe to modify function if tests pass
- Add tests for any new use cases

---

For detailed information, see the linked documentation files.
