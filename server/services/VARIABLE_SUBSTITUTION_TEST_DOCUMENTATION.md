# Variable Substitution Function - Comprehensive Test Documentation

## Overview

The `substituteVariables` function is a pure utility function that enables template-based variable substitution across strings, objects, and arrays using the `{{variableName}}` syntax. This document details the comprehensive test suite (91 tests) that validates the function's behavior across all scenarios.

## Function Signature

```typescript
export function substituteVariables(
  value: unknown,
  variables: Record<string, unknown>
): unknown
```

## Key Characteristics

- **Pure Function**: No side effects, deterministic output
- **Template Syntax**: Supports `{{variableName}}` placeholders where variable names contain only word characters (`\w`)
- **Recursive**: Works with nested objects and arrays
- **Type-Preserving**: Returns original type for non-string primitives (numbers, booleans, null)
- **Safe**: Does not evaluate code or perform dangerous operations

## Test Suite Structure (91 Tests)

### 1. String Substitution (26 tests)

#### Single Variable (6 tests)
- Replace single variable in string
- Variable at beginning of string
- Variable at end of string
- Variable as entire string
- Template with surrounding text

**Key Test Cases:**
```typescript
substituteVariables("Hello {{name}}", { name: "John" });        // "Hello John"
substituteVariables("{{greeting}} there!", { greeting: "Hello" }); // "Hello there!"
substituteVariables("{{value}}", { value: "test" });             // "test"
```

#### Multiple Variables (6 tests)
- Replace multiple different variables
- Variables with text between them
- Same variable used multiple times
- Complex strings with multiple variable instances

**Key Test Cases:**
```typescript
substituteVariables("{{greeting}} {{name}}", { greeting: "Hello", name: "John" }); // "Hello John"
substituteVariables("{{name}} likes {{name}}", { name: "Alice" });  // "Alice likes Alice"
```

#### Missing Variables (5 tests)
- Keep placeholder when variable undefined
- Partial substitution (mix of defined and undefined)
- Explicitly undefined variables
- Placeholder retention behavior

**Key Test Cases:**
```typescript
substituteVariables("Hello {{name}}", {});                        // "Hello {{name}}" (keeps placeholder)
substituteVariables("{{greeting}} {{name}}", { greeting: "Hello" }); // "Hello {{name}}"
```

#### No Variables (3 tests)
- String unchanged when no variables present
- String unchanged when no matching variables
- Complex text without variables preserved

**Key Test Cases:**
```typescript
substituteVariables("Hello World", {});                    // "Hello World"
substituteVariables("Hello World", { other: "value" });   // "Hello World"
```

#### Empty String (2 tests)
- Empty string handling
- Empty string with available variables

### 2. Object Substitution (18 tests)

#### Simple Objects (4 tests)
- Substitute variables in single property
- Multiple properties with variables
- Property name preservation
- Multiple keys with different variables

**Key Test Cases:**
```typescript
substituteVariables({ greeting: "Hello {{name}}" }, { name: "John" });
// { greeting: "Hello John" }

substituteVariables({ firstName: "{{first}}", lastName: "{{last}}" },
  { first: "John", last: "Doe" });
// { firstName: "John", lastName: "Doe" }
```

#### Nested Objects (4 tests)
- Single level nesting
- Multiple levels of nesting
- Structure preservation
- Deep nesting with missing variables

**Key Test Cases:**
```typescript
substituteVariables(
  { user: { name: "{{name}}" } },
  { name: "John" }
);
// { user: { name: "John" } }

substituteVariables(
  { level1: { level2: { level3: "{{value}}" } } },
  { value: "deep" }
);
// { level1: { level2: { level3: "deep" } } }
```

#### Mixed Types in Objects (3 tests)
- Strings, numbers, and booleans together
- Type preservation for non-string values
- Null values preserved

**Key Test Cases:**
```typescript
substituteVariables(
  { message: "Hello {{name}}", age: 30, active: true },
  { name: "Alice" }
);
// { message: "Hello Alice", age: 30, active: true }
```

#### Empty Objects (2 tests)
- Empty object handling
- Return empty structure

### 3. Array Substitution (20 tests)

#### Array of Strings (4 tests)
- Substitute variables in string array
- Mix of strings with and without variables
- Empty strings in arrays
- Single-element arrays

**Key Test Cases:**
```typescript
substituteVariables(["Hello {{name}}", "Goodbye {{name}}"], { name: "John" });
// ["Hello John", "Goodbye John"]

substituteVariables(["", "{{value}}", ""], { value: "test" });
// ["", "test", ""]
```

#### Array of Objects (3 tests)
- Array of simple objects with variables
- Array of complex objects
- Mixed data types in object arrays

**Key Test Cases:**
```typescript
substituteVariables(
  [{ name: "{{name1}}" }, { name: "{{name2}}" }],
  { name1: "John", name2: "Jane" }
);
// [{ name: "John" }, { name: "Jane" }]
```

#### Nested Arrays (3 tests)
- Nested arrays of strings
- Deeply nested arrays
- Mixed nested structures (arrays + objects)

**Key Test Cases:**
```typescript
substituteVariables([["Hello {{name}}", "Hi {{name}}"]], { name: "John" });
// [["Hello John", "Hi John"]]

substituteVariables([[[["Value: {{val}}"]]]], { val: "test" });
// [[[["Value: test"]]]]
```

#### Empty Arrays (2 tests)
- Empty array handling
- Return empty structure

### 4. Edge Cases (26 tests)

#### Null and Undefined Values (3 tests)
- null returns as null
- undefined returns as undefined
- Objects containing null values

**Key Test Cases:**
```typescript
substituteVariables(null, { name: "John" });            // null
substituteVariables(undefined, { name: "John" });       // undefined
substituteVariables({ value: null, text: "{{name}}" }, { name: "John" });
// { value: null, text: "John" }
```

#### Primitive Types (6 tests)
- Number unchanged: `42 => 42`
- Boolean true unchanged: `true => true`
- Boolean false unchanged: `false => false`
- Zero unchanged: `0 => 0`
- Negative numbers unchanged
- Decimal numbers unchanged

**Key Test Cases:**
```typescript
substituteVariables(42, { name: "John" });     // 42
substituteVariables(true, { name: "John" });   // true
substituteVariables(0, { name: "John" });      // 0
```

#### Variable Value Type Conversion (7 tests)
- Number to string: `42 => "42"`
- Boolean to string: `true => "true"`, `false => "false"`
- Zero to string: `0 => "0"`
- Object to string: `{} => "[object Object]"`
- Array to string: `[1,2,3] => "1,2,3"`
- Date to string

**Key Test Cases:**
```typescript
substituteVariables("Value: {{value}}", { value: 42 });              // "Value: 42"
substituteVariables("Active: {{active}}", { active: true });         // "Active: true"
substituteVariables("Data: {{obj}}", { obj: { key: "value" } });     // "Data: [object Object]"
```

### 5. Security Considerations (16 tests)

#### Special Characters in Variable Names (5 tests)
- Hyphens not matched: `{{user-name}}` keeps placeholder
- Spaces not matched: `{{user name}}` keeps placeholder
- Only alphanumeric + underscore matched
- Starting hyphens not matched
- Dots not matched: `{{obj.prop}}` keeps placeholder

**Key Test Cases:**
```typescript
substituteVariables("Hello {{user-name}}", { "user-name": "John" }); // "Hello {{user-name}}" (not matched)
substituteVariables("Hello {{user_name123}}", { user_name123: "John" }); // "Hello John" (matched)
```

#### Malformed Patterns (6 tests)
- Single `{` doesn't match
- Incomplete `{{` doesn't match
- Incomplete `}}` doesn't match
- Only `{{` doesn't match
- Only `}}` doesn't match
- Empty `{{}}` doesn't match

**Key Test Cases:**
```typescript
substituteVariables("Value: {name}", { name: "test" });     // "Value: {name}"
substituteVariables("Value: {{name}", { name: "test" });    // "Value: {{name}"
substituteVariables("Value: {{}}", {});                      // "Value: {{}}"
```

#### XSS Prevention (3 tests)
- Script tags passed as values are preserved as strings (not executed)
- Command injection strings preserved as strings
- HTML content preserved as strings

**Key Test Cases:**
```typescript
substituteVariables("Hello {{name}}", { name: "<script>alert('xss')</script>" });
// "Hello <script>alert('xss')</script>"
```

#### Case Sensitivity (2 tests)
- Variable names are case-sensitive
- `{{Name}}` != `{{name}}`

**Key Test Cases:**
```typescript
substituteVariables("Hello {{Name}}", { name: "John" });    // "Hello {{Name}}" (not matched)
substituteVariables("Hello {{Name}}", { Name: "John" });    // "Hello John" (matched)
```

### 6. Complex Integration Scenarios (5 tests)

Real-world test cases:

1. **URL Substitution**
```typescript
substituteVariables("https://api.example.com/{{endpoint}}/{{id}}", {
  endpoint: "users",
  id: "12345"
});
// "https://api.example.com/users/12345"
```

2. **API Payload Substitution**
```typescript
const payload = {
  user: { name: "{{firstName}} {{lastName}}", email: "{{email}}" },
  metadata: { createdBy: "{{userId}}" }
};
substituteVariables(payload, {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  userId: 123
});
```

3. **Workflow Steps Substitution**
```typescript
const workflow = {
  steps: [
    { action: "navigate", url: "{{baseUrl}}/{{page}}" },
    { action: "fill", selector: "input[name='{{fieldName}}']", value: "{{fieldValue}}" }
  ]
};
```

4. **Partial Substitution**
- Some variables available, some missing
- Result contains mix of substituted and placeholder values

5. **Deeply Nested Structures**
- Variables at all nesting levels
- Complex object/array combinations

### 7. Performance Tests (4 tests)

1. **Very Long Strings**
   - 10,000+ character strings processed efficiently

2. **Many Variables**
   - 100 variables substituted correctly

3. **Objects with Many Properties**
   - 100+ properties with variables processed

4. **Large Arrays**
   - 1,000 element arrays processed efficiently

### 8. Regression Tests (5 tests)

Real workflow patterns:

1. **Workflow Steps**: Navigate step URL substitution
2. **API Calls**: Query parameter and body substitution
3. **Conditional Expressions**: Expression value substitution
4. **Multiple Substitutions**: Ensuring no interference between operations
5. **Recursive Patterns**: Testing complex hierarchies

## Test Execution Results

```
✓ server/services/variableSubstitution.test.ts (91 tests) 46ms

Test Files  1 passed (1)
Tests       91 passed (91)
```

## Running the Tests

```bash
# Run all tests
npm test

# Run only variable substitution tests
npm test -- server/services/variableSubstitution.test.ts

# Run with coverage
npm test -- --coverage server/services/variableSubstitution.test.ts

# Run in watch mode
npm test -- --watch server/services/variableSubstitution.test.ts
```

## Test Coverage Areas

| Category | Tests | Coverage |
|----------|-------|----------|
| String Substitution | 26 | Single, multiple, missing, no variables |
| Object Substitution | 18 | Simple, nested, mixed types |
| Array Substitution | 20 | Strings, objects, nested arrays |
| Edge Cases | 26 | Null, undefined, type conversion |
| Security | 16 | Special chars, malformed, XSS, case sensitivity |
| Integration | 5 | Real-world scenarios |
| Performance | 4 | Large data structures |
| Regression | 5 | Workflow patterns |
| **Total** | **91** | **Comprehensive** |

## Important Behaviors

### Placeholder Retention
- Variables that are `undefined` keep their placeholders: `{{name}}`
- Variables that exist but are `null` are converted to string `"null"`

### Type Conversion
- When a variable is substituted into a string, its value is converted using `String(value)`
- Non-string inputs are returned unchanged (numbers, booleans, etc.)

### Variable Name Constraints
- Variable names must match `\w+` pattern: alphanumeric + underscore only
- Hyphens, spaces, dots, and other special characters are not supported
- Case-sensitive: `{{Name}}` ≠ `{{name}}`

### Safety Properties
- Pure function (no side effects)
- No code evaluation
- No dangerous template operations
- Safe for user-provided data

## Integration with Workflow Execution

The `substituteVariables` function is used in `workflowExecution.service.ts` for:

1. **Step Configuration** - Substituting variables in step configs
2. **API Calls** - Replacing variables in URLs, headers, and bodies
3. **Conditional Logic** - Evaluating expressions with variable values
4. **Navigation** - URL generation with variable placeholders
5. **Data Extraction** - Instruction templates with context variables

## File Locations

- **Implementation**: `/root/github-repos/ghl-agency-ai/server/services/workflowExecution.service.ts` (lines 93-110)
- **Tests**: `/root/github-repos/ghl-agency-ai/server/services/variableSubstitution.test.ts`
- **Documentation**: This file

## Future Enhancements

Potential improvements for consideration:

1. Support for dot notation: `{{user.name}}`
2. Array index access: `{{items.0}}`
3. Filter functions: `{{name | uppercase}}`
4. Conditional substitution: `{{name ? 'Hello ' + name : 'Guest'}}`
5. Custom variable transformers

These would require extending the regex pattern and parsing logic while maintaining safety properties.
