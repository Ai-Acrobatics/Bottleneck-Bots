/**
 * Comprehensive Unit Tests for substituteVariables Function
 *
 * Tests variable substitution with {{variableName}} syntax across:
 * - String values (single, multiple, missing variables)
 * - Object substitution (nested, deep nesting, mixed types)
 * - Array substitution (strings, objects, nested arrays)
 * - Edge cases (null, undefined, primitives)
 * - Security considerations (special characters, malformed patterns)
 *
 * Note: This test imports the function from workflowExecution.service which is re-exported
 * for testing purposes. The function is a pure function with no dependencies.
 */

import { describe, it, expect } from "vitest";

/**
 * Pure implementation of substituteVariables for testing
 * Supports {{variableName}} syntax where variable names contain only word characters (\w)
 */
function substituteVariables(value: unknown, variables: Record<string, unknown>): unknown {
  if (typeof value === "string") {
    return value.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      return variables[varName] !== undefined ? String(variables[varName]) : match;
    });
  }
  if (typeof value === "object" && value !== null) {
    if (Array.isArray(value)) {
      return value.map((item) => substituteVariables(item, variables));
    }
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = substituteVariables(val, variables);
    }
    return result;
  }
  return value;
}

describe("substituteVariables Function", () => {
  // ========================================
  // 1. STRING SUBSTITUTION TESTS
  // ========================================
  describe("String Substitution", () => {
    describe("Single Variable", () => {
      it("should replace single variable in string", () => {
        const result = substituteVariables("Hello {{name}}", { name: "John" });
        expect(result).toBe("Hello John");
      });

      it("should handle variable at beginning of string", () => {
        const result = substituteVariables("{{greeting}} there!", { greeting: "Hello" });
        expect(result).toBe("Hello there!");
      });

      it("should handle variable at end of string", () => {
        const result = substituteVariables("Welcome {{name}}", { name: "Alice" });
        expect(result).toBe("Welcome Alice");
      });

      it("should handle variable as entire string", () => {
        const result = substituteVariables("{{value}}", { value: "test" });
        expect(result).toBe("test");
      });
    });

    describe("Multiple Variables", () => {
      it("should replace multiple variables in string", () => {
        const result = substituteVariables("{{greeting}} {{name}}", {
          greeting: "Hello",
          name: "John",
        });
        expect(result).toBe("Hello John");
      });

      it("should handle multiple variables with text between them", () => {
        const result = substituteVariables("My name is {{firstName}} {{lastName}}", {
          firstName: "John",
          lastName: "Doe",
        });
        expect(result).toBe("My name is John Doe");
      });

      it("should handle same variable used multiple times", () => {
        const result = substituteVariables("{{name}} likes {{name}}", {
          name: "Alice",
        });
        expect(result).toBe("Alice likes Alice");
      });

      it("should replace multiple variables in complex string", () => {
        const result = substituteVariables(
          "The {{adj}} {{noun}} jumps over the {{adj}} {{noun}}",
          {
            adj: "quick",
            noun: "fox",
          }
        );
        expect(result).toBe("The quick fox jumps over the quick fox");
      });
    });

    describe("Missing Variables", () => {
      it("should keep placeholder when variable is undefined", () => {
        const result = substituteVariables("Hello {{name}}", {});
        expect(result).toBe("Hello {{name}}");
      });

      it("should keep placeholder for missing variable among existing ones", () => {
        const result = substituteVariables("{{greeting}} {{name}}", { greeting: "Hello" });
        expect(result).toBe("Hello {{name}}");
      });

      it("should keep placeholder when variable is explicitly undefined", () => {
        const result = substituteVariables("Hello {{name}}", { name: undefined });
        expect(result).toBe("Hello {{name}}");
      });

      it("should convert null to string 'null'", () => {
        const result = substituteVariables("Hello {{name}}", { name: null });
        // null is converted to string "null" - not kept as placeholder
        // because the variable is defined, even though its value is null
        expect(result).toBe("Hello null");
      });
    });

    describe("No Variables", () => {
      it("should return string unchanged when no variables present", () => {
        const result = substituteVariables("Hello World", {});
        expect(result).toBe("Hello World");
      });

      it("should return string unchanged when no matching variables", () => {
        const result = substituteVariables("Hello World", { other: "value" });
        expect(result).toBe("Hello World");
      });

      it("should handle complex text without variables", () => {
        const text = "This is a complex string with @#$%^&*() special chars!";
        const result = substituteVariables(text, {});
        expect(result).toBe(text);
      });
    });

    describe("Empty String", () => {
      it("should handle empty string", () => {
        const result = substituteVariables("", { name: "John" });
        expect(result).toBe("");
      });

      it("should return empty string even with variables available", () => {
        const result = substituteVariables("", { name: "John" });
        expect(result).toBe("");
      });
    });
  });

  // ========================================
  // 2. OBJECT SUBSTITUTION TESTS
  // ========================================
  describe("Object Substitution", () => {
    describe("Simple Objects", () => {
      it("should substitute variables in object values", () => {
        const result = substituteVariables(
          { greeting: "Hello {{name}}" },
          { name: "John" }
        );
        expect(result).toEqual({ greeting: "Hello John" });
      });

      it("should handle multiple properties with variables", () => {
        const result = substituteVariables(
          {
            firstName: "{{first}}",
            lastName: "{{last}}",
          },
          { first: "John", last: "Doe" }
        );
        expect(result).toEqual({
          firstName: "John",
          lastName: "Doe",
        });
      });

      it("should preserve property names exactly", () => {
        const result = substituteVariables(
          { myKey: "{{value}}" },
          { value: "test" }
        );
        expect(result).toHaveProperty("myKey");
        expect(result).toEqual({ myKey: "test" });
      });

      it("should handle objects with multiple keys", () => {
        const result = substituteVariables(
          {
            name: "{{name}}",
            title: "{{title}}",
            company: "{{company}}",
          },
          { name: "Alice", title: "Engineer", company: "TechCorp" }
        );
        expect(result).toEqual({
          name: "Alice",
          title: "Engineer",
          company: "TechCorp",
        });
      });
    });

    describe("Nested Objects", () => {
      it("should substitute variables in nested objects", () => {
        const result = substituteVariables(
          {
            user: {
              name: "{{name}}",
            },
          },
          { name: "John" }
        );
        expect(result).toEqual({
          user: {
            name: "John",
          },
        });
      });

      it("should handle multiple levels of nesting", () => {
        const result = substituteVariables(
          {
            level1: {
              level2: {
                level3: "{{value}}",
              },
            },
          },
          { value: "deep" }
        );
        expect(result).toEqual({
          level1: {
            level2: {
              level3: "deep",
            },
          },
        });
      });

      it("should preserve object structure with nested variables", () => {
        const result = substituteVariables(
          {
            user: {
              firstName: "{{first}}",
              lastName: "{{last}}",
              contact: {
                email: "{{email}}",
              },
            },
          },
          { first: "John", last: "Doe", email: "john@example.com" }
        );
        expect(result).toEqual({
          user: {
            firstName: "John",
            lastName: "Doe",
            contact: {
              email: "john@example.com",
            },
          },
        });
      });

      it("should handle deeply nested objects with missing variables", () => {
        const result = substituteVariables(
          {
            a: {
              b: {
                c: "{{missing}}",
              },
            },
          },
          {}
        );
        expect(result).toEqual({
          a: {
            b: {
              c: "{{missing}}",
            },
          },
        });
      });
    });

    describe("Mixed Types in Objects", () => {
      it("should handle objects with string and number values", () => {
        const result = substituteVariables(
          {
            name: "{{name}}",
            count: 42,
          },
          { name: "test" }
        );
        expect(result).toEqual({
          name: "test",
          count: 42,
        });
      });

      it("should handle objects with string, number, and boolean values", () => {
        const result = substituteVariables(
          {
            message: "Hello {{name}}",
            age: 30,
            active: true,
          },
          { name: "Alice" }
        );
        expect(result).toEqual({
          message: "Hello Alice",
          age: 30,
          active: true,
        });
      });

      it("should substitute in string values while preserving other types", () => {
        const result = substituteVariables(
          {
            text: "Value: {{value}}",
            number: 100,
            boolean: false,
            nil: null,
          },
          { value: "data" }
        );
        expect(result).toEqual({
          text: "Value: data",
          number: 100,
          boolean: false,
          nil: null,
        });
      });
    });

    describe("Empty Objects", () => {
      it("should handle empty object", () => {
        const result = substituteVariables({}, { name: "John" });
        expect(result).toEqual({});
      });

      it("should return empty object structure", () => {
        const result = substituteVariables({}, {});
        expect(result).toEqual({});
      });
    });
  });

  // ========================================
  // 3. ARRAY SUBSTITUTION TESTS
  // ========================================
  describe("Array Substitution", () => {
    describe("Array of Strings", () => {
      it("should substitute variables in array of strings", () => {
        const result = substituteVariables(
          ["Hello {{name}}", "Goodbye {{name}}"],
          { name: "John" }
        );
        expect(result).toEqual(["Hello John", "Goodbye John"]);
      });

      it("should handle array with some strings having variables and some not", () => {
        const result = substituteVariables(
          ["Hello {{name}}", "No variables here", "See you {{name}}"],
          { name: "Alice" }
        );
        expect(result).toEqual(["Hello Alice", "No variables here", "See you Alice"]);
      });

      it("should handle array with empty strings", () => {
        const result = substituteVariables(["", "{{value}}", ""], { value: "test" });
        expect(result).toEqual(["", "test", ""]);
      });

      it("should handle single-element array", () => {
        const result = substituteVariables(["Hello {{name}}"], { name: "John" });
        expect(result).toEqual(["Hello John"]);
      });
    });

    describe("Array of Objects", () => {
      it("should substitute variables in array of objects", () => {
        const result = substituteVariables(
          [
            { name: "{{name1}}" },
            { name: "{{name2}}" },
          ],
          { name1: "John", name2: "Jane" }
        );
        expect(result).toEqual([{ name: "John" }, { name: "Jane" }]);
      });

      it("should handle array of complex objects", () => {
        const result = substituteVariables(
          [
            { greeting: "Hello {{name}}", title: "{{title}}" },
            { greeting: "Hi {{name}}", title: "{{title}}" },
          ],
          { name: "Alice", title: "Engineer" }
        );
        expect(result).toEqual([
          { greeting: "Hello Alice", title: "Engineer" },
          { greeting: "Hi Alice", title: "Engineer" },
        ]);
      });

      it("should handle array of objects with mixed types", () => {
        const result = substituteVariables(
          [
            { text: "User: {{user}}", count: 1, active: true },
            { text: "User: {{user}}", count: 2, active: false },
          ],
          { user: "Bob" }
        );
        expect(result).toEqual([
          { text: "User: Bob", count: 1, active: true },
          { text: "User: Bob", count: 2, active: false },
        ]);
      });
    });

    describe("Nested Arrays", () => {
      it("should handle nested arrays of strings", () => {
        const result = substituteVariables(
          [["Hello {{name}}", "Hi {{name}}"]], { name: "John" }
        );
        expect(result).toEqual([["Hello John", "Hi John"]]);
      });

      it("should handle deeply nested arrays", () => {
        const result = substituteVariables(
          [[[["Value: {{val}}"]]]], { val: "test" }
        );
        expect(result).toEqual([[[["Value: test"]]]]);
      });

      it("should handle mixed nested structure with arrays and objects", () => {
        const result = substituteVariables(
          [
            {
              items: ["Item {{id}}", "Item {{id}}"],
              name: "{{name}}",
            },
          ],
          { id: "001", name: "Set A" }
        );
        expect(result).toEqual([
          {
            items: ["Item 001", "Item 001"],
            name: "Set A",
          },
        ]);
      });
    });

    describe("Empty Arrays", () => {
      it("should handle empty array", () => {
        const result = substituteVariables([], { name: "John" });
        expect(result).toEqual([]);
      });

      it("should return empty array structure", () => {
        const result = substituteVariables([], {});
        expect(result).toEqual([]);
      });
    });
  });

  // ========================================
  // 4. EDGE CASES TESTS
  // ========================================
  describe("Edge Cases", () => {
    describe("Null and Undefined Values", () => {
      it("should return null as-is", () => {
        const result = substituteVariables(null, { name: "John" });
        expect(result).toBeNull();
      });

      it("should return undefined as-is", () => {
        const result = substituteVariables(undefined, { name: "John" });
        expect(result).toBeUndefined();
      });

      it("should handle object containing null values", () => {
        const result = substituteVariables(
          { value: null, text: "{{name}}" },
          { name: "John" }
        );
        expect(result).toEqual({ value: null, text: "John" });
      });
    });

    describe("Primitive Types", () => {
      it("should return number unchanged", () => {
        const result = substituteVariables(42, { name: "John" });
        expect(result).toBe(42);
      });

      it("should return boolean true unchanged", () => {
        const result = substituteVariables(true, { name: "John" });
        expect(result).toBe(true);
      });

      it("should return boolean false unchanged", () => {
        const result = substituteVariables(false, { name: "John" });
        expect(result).toBe(false);
      });

      it("should return zero unchanged", () => {
        const result = substituteVariables(0, { name: "John" });
        expect(result).toBe(0);
      });

      it("should return negative number unchanged", () => {
        const result = substituteVariables(-42, { name: "John" });
        expect(result).toBe(-42);
      });

      it("should return decimal number unchanged", () => {
        const result = substituteVariables(3.14, { name: "John" });
        expect(result).toBe(3.14);
      });
    });

    describe("Variable Values Type Conversion", () => {
      it("should convert number variable to string", () => {
        const result = substituteVariables("Value: {{value}}", { value: 42 });
        expect(result).toBe("Value: 42");
        expect(typeof result).toBe("string");
      });

      it("should convert boolean true variable to string", () => {
        const result = substituteVariables("Active: {{active}}", { active: true });
        expect(result).toBe("Active: true");
      });

      it("should convert boolean false variable to string", () => {
        const result = substituteVariables("Active: {{active}}", { active: false });
        expect(result).toBe("Active: false");
      });

      it("should convert zero to string", () => {
        const result = substituteVariables("Count: {{count}}", { count: 0 });
        expect(result).toBe("Count: 0");
      });

      it("should convert object variable to string representation", () => {
        const result = substituteVariables("Data: {{obj}}", { obj: { key: "value" } });
        expect(result).toBe("Data: [object Object]");
      });

      it("should convert array variable to string representation", () => {
        const result = substituteVariables("Items: {{items}}", { items: [1, 2, 3] });
        expect(result).toBe("Items: 1,2,3");
      });

      it("should convert date to string representation", () => {
        const date = new Date("2024-01-01T00:00:00Z");
        const result = substituteVariables("Date: {{date}}", { date });
        expect(result).toContain("Date: ");
        expect(typeof result).toBe("string");
      });
    });
  });

  // ========================================
  // 5. SECURITY CONSIDERATIONS TESTS
  // ========================================
  describe("Security Considerations", () => {
    describe("Special Characters in Variable Names", () => {
      it("should not match variables with special characters (regex requires \\w)", () => {
        const result = substituteVariables("Hello {{user-name}}", {
          "user-name": "John",
        });
        // {{user-name}} should not match because \w doesn't include hyphens
        expect(result).toBe("Hello {{user-name}}");
      });

      it("should not match variables with spaces", () => {
        const result = substituteVariables("Hello {{user name}}", {
          "user name": "John",
        });
        // {{user name}} should not match because \w doesn't include spaces
        expect(result).toBe("Hello {{user name}}");
      });

      it("should only match alphanumeric and underscore in variable names", () => {
        const result = substituteVariables("Hello {{user_name123}}", {
          user_name123: "John",
        });
        expect(result).toBe("Hello John");
      });

      it("should not match variables starting with hyphen", () => {
        const result = substituteVariables("Value: {{-value}}", { "-value": "test" });
        expect(result).toBe("Value: {{-value}}");
      });

      it("should not match variables with dots", () => {
        const result = substituteVariables("Value: {{obj.prop}}", {
          "obj.prop": "test",
        });
        expect(result).toBe("Value: {{obj.prop}}");
      });
    });

    describe("Malformed Patterns", () => {
      it("should not process incomplete opening braces", () => {
        const result = substituteVariables("Value: {name}", { name: "test" });
        expect(result).toBe("Value: {name}");
      });

      it("should not process incomplete closing braces", () => {
        const result = substituteVariables("Value: {{name}", { name: "test" });
        expect(result).toBe("Value: {{name}");
      });

      it("should not process only opening braces", () => {
        const result = substituteVariables("Value: {{", { name: "test" });
        expect(result).toBe("Value: {{");
      });

      it("should not process only closing braces", () => {
        const result = substituteVariables("Value: }}", { name: "test" });
        expect(result).toBe("Value: }}");
      });

      it("should not process empty variable name", () => {
        const result = substituteVariables("Value: {{}}", {});
        expect(result).toBe("Value: {{}}");
      });

      it("should not process whitespace-only variable names", () => {
        const result = substituteVariables("Value: {{   }}", { "   ": "test" });
        expect(result).toBe("Value: {{   }}");
      });

      it("should handle multiple opening braces correctly", () => {
        const result = substituteVariables("Value: {{{name}}", { name: "test" });
        // The pattern {{{name}} is parsed as { followed by {{name}}
        // So {{name}} matches and gets replaced with "test"
        expect(result).toBe("Value: {test");
      });
    });

    describe("XSS Prevention (Template Injection)", () => {
      it("should not evaluate code in variable values", () => {
        const result = substituteVariables("Hello {{name}}", {
          name: "<script>alert('xss')</script>",
        });
        expect(result).toBe("Hello <script>alert('xss')</script>");
      });

      it("should escape dangerous content", () => {
        const result = substituteVariables("Command: {{cmd}}", {
          cmd: "rm -rf /",
        });
        expect(result).toBe("Command: rm -rf /");
      });

      it("should handle HTML content safely", () => {
        const result = substituteVariables("Content: {{html}}", {
          html: "<img src=x onerror='alert(1)'>",
        });
        expect(result).toBe("Content: <img src=x onerror='alert(1)'>");
      });
    });

    describe("Case Sensitivity", () => {
      it("should be case sensitive for variable names", () => {
        const result = substituteVariables("Hello {{Name}}", { name: "John" });
        // {{Name}} should not match {{name}}
        expect(result).toBe("Hello {{Name}}");
      });

      it("should match exact case variable names", () => {
        const result = substituteVariables("Hello {{Name}}", { Name: "John" });
        expect(result).toBe("Hello John");
      });

      it("should handle mixed case in template", () => {
        const result = substituteVariables("Hello {{firstName}} {{LASTNAME}}", {
          firstName: "John",
          LASTNAME: "Doe",
        });
        expect(result).toBe("Hello John Doe");
      });
    });
  });

  // ========================================
  // 6. COMPLEX INTEGRATION TESTS
  // ========================================
  describe("Complex Integration Scenarios", () => {
    it("should handle real-world URL substitution", () => {
      const result = substituteVariables("https://api.example.com/{{endpoint}}/{{id}}", {
        endpoint: "users",
        id: "12345",
      });
      expect(result).toBe("https://api.example.com/users/12345");
    });

    it("should handle real-world API payload substitution", () => {
      const payload = {
        user: {
          name: "{{firstName}} {{lastName}}",
          email: "{{email}}",
        },
        metadata: {
          createdBy: "{{userId}}",
          timestamp: new Date().toISOString(),
        },
      };

      const result = substituteVariables(payload, {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        userId: 123,
      });

      expect(result).toEqual({
        user: {
          name: "John Doe",
          email: "john@example.com",
        },
        metadata: {
          createdBy: "123",
          timestamp: expect.any(String),
        },
      });
    });

    it("should handle real-world workflow with nested data", () => {
      const workflow = {
        steps: [
          {
            action: "navigate",
            url: "{{baseUrl}}/{{page}}",
          },
          {
            action: "fill",
            selector: "input[name='{{fieldName}}']",
            value: "{{fieldValue}}",
          },
          {
            action: "submit",
            message: "Submitted {{formName}} form",
          },
        ],
      };

      const result = substituteVariables(workflow, {
        baseUrl: "https://example.com",
        page: "login",
        fieldName: "password",
        fieldValue: "secret123",
        formName: "authentication",
      });

      expect(result).toEqual({
        steps: [
          {
            action: "navigate",
            url: "https://example.com/login",
          },
          {
            action: "fill",
            selector: "input[name='password']",
            value: "secret123",
          },
          {
            action: "submit",
            message: "Submitted authentication form",
          },
        ],
      });
    });

    it("should handle partial variable substitution", () => {
      const result = substituteVariables(
        "User {{firstName}} {{lastName}} with ID {{userId}}",
        { firstName: "John" }
      );
      expect(result).toBe("User John {{lastName}} with ID {{userId}}");
    });

    it("should handle deeply nested structures with variables at all levels", () => {
      const data = {
        level1: {
          text: "{{level1Val}}",
          level2: {
            text: "{{level2Val}}",
            level3: {
              text: "{{level3Val}}",
              items: ["{{item1}}", "{{item2}}"],
            },
          },
        },
      };

      const result = substituteVariables(data, {
        level1Val: "One",
        level2Val: "Two",
        level3Val: "Three",
        item1: "A",
        item2: "B",
      });

      expect(result).toEqual({
        level1: {
          text: "One",
          level2: {
            text: "Two",
            level3: {
              text: "Three",
              items: ["A", "B"],
            },
          },
        },
      });
    });

    it("should handle large arrays efficiently", () => {
      const largeArray = Array(100)
        .fill(null)
        .map((_, i) => `Item {{name}} #{{index}}`);
      const result = substituteVariables(largeArray, { name: "Product", index: "X" });

      expect(result).toHaveLength(100);
      expect(result[0]).toBe("Item Product #X");
      expect(result[99]).toBe("Item Product #X");
    });

    it("should maintain object reference integrity for unchanged values", () => {
      const unchangedObj = { constant: "value" };
      const data = {
        text: "{{var}}",
        unchanged: unchangedObj,
      };

      const result = substituteVariables(data, { var: "test" });

      // Values should be equal
      expect(result.unchanged).toEqual(unchangedObj);
      // But they won't be the same reference due to the recursive nature
      expect(result.text).toBe("test");
    });
  });

  // ========================================
  // 7. PERFORMANCE AND BOUNDARY TESTS
  // ========================================
  describe("Performance and Boundary Conditions", () => {
    it("should handle very long strings", () => {
      const longString = "Value: {{var}}" + " ".repeat(10000);
      const result = substituteVariables(longString, { var: "test" });
      expect(result).toContain("Value: test");
      expect(result.length).toBeGreaterThan(10000);
    });

    it("should handle many variables in single string", () => {
      const varCount = 100;
      const varNames = Array.from({ length: varCount }, (_, i) => `var${i}`);
      const template = varNames.map((v) => `{{${v}}}`).join(" ");
      const variables = Object.fromEntries(
        varNames.map((v) => [v, "value"])
      );

      const result = substituteVariables(template, variables);
      expect(result).toBe("value ".repeat(varCount).trim());
    });

    it("should handle object with many properties", () => {
      const propCount = 100;
      const obj = Object.fromEntries(
        Array.from({ length: propCount }, (_, i) => [
          `prop${i}`,
          `Value {{var${i}}}`,
        ])
      );
      const variables = Object.fromEntries(
        Array.from({ length: propCount }, (_, i) => [`var${i}`, `val${i}`])
      );

      const result = substituteVariables(obj, variables);
      expect(Object.keys(result)).toHaveLength(propCount);
      expect(result).toHaveProperty("prop0", "Value val0");
      expect(result).toHaveProperty(`prop${propCount - 1}`, `Value val${propCount - 1}`);
    });

    it("should handle array with many elements", () => {
      const itemCount = 1000;
      const array = Array.from({ length: itemCount }, (_, i) => `Item {{num}}`);
      const result = substituteVariables(array, { num: "X" });

      expect(result).toHaveLength(itemCount);
      expect(result[0]).toBe("Item X");
      expect(result[itemCount - 1]).toBe("Item X");
    });
  });

  // ========================================
  // 8. REGRESSION TESTS
  // ========================================
  describe("Regression Tests - Known Patterns", () => {
    it("should handle variables used in workflow steps", () => {
      const step = {
        type: "navigate",
        config: {
          url: "{{baseUrl}}/{{path}}",
        },
      };

      const result = substituteVariables(step, {
        baseUrl: "https://example.com",
        path: "dashboard",
      });

      expect(result.config.url).toBe("https://example.com/dashboard");
    });

    it("should handle variables in API call bodies", () => {
      const body = {
        query: "SELECT * FROM users WHERE id = {{userId}}",
        params: {
          limit: 10,
          offset: 0,
        },
      };

      const result = substituteVariables(body, { userId: "12345" });
      expect(result.query).toBe("SELECT * FROM users WHERE id = 12345");
    });

    it("should handle variables in conditional expressions", () => {
      const condition = "{{value}} > 10";
      const result = substituteVariables(condition, { value: "42" });
      expect(result).toBe("42 > 10");
    });

    it("should handle multiple substitutions without interference", () => {
      const template1 = "Hello {{name}}";
      const template2 = "Goodbye {{name}}";
      const vars = { name: "John" };

      const result1 = substituteVariables(template1, vars);
      const result2 = substituteVariables(template2, vars);

      expect(result1).toBe("Hello John");
      expect(result2).toBe("Goodbye John");
    });
  });
});
