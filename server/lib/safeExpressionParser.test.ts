/**
 * Safe Expression Parser Tests
 *
 * TDD approach: These tests are written FIRST to define the expected behavior
 * of the safe expression parser that will replace unsafe eval() usage.
 */

import { describe, it, expect } from "vitest";
import { evaluateExpression } from "./safeExpressionParser";

describe("SafeExpressionParser", () => {
  describe("Boolean Literals", () => {
    it("should evaluate true literal", () => {
      const result = evaluateExpression("true", {});
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it("should evaluate false literal", () => {
      const result = evaluateExpression("false", {});
      expect(result.success).toBe(true);
      expect(result.result).toBe(false);
    });
  });

  describe("Number Literals", () => {
    it("should evaluate integer literals", () => {
      const result = evaluateExpression("42", {});
      expect(result.success).toBe(true);
      expect(result.result).toBe(true); // Non-zero is truthy
    });

    it("should evaluate zero as falsy", () => {
      const result = evaluateExpression("0", {});
      expect(result.success).toBe(true);
      expect(result.result).toBe(false);
    });

    it("should evaluate negative numbers", () => {
      const result = evaluateExpression("-5", {});
      expect(result.success).toBe(true);
      expect(result.result).toBe(true); // Non-zero is truthy
    });

    it("should evaluate decimal numbers", () => {
      const result = evaluateExpression("3.14", {});
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });
  });

  describe("String Literals", () => {
    it("should evaluate double-quoted strings", () => {
      const result = evaluateExpression('"hello"', {});
      expect(result.success).toBe(true);
      expect(result.result).toBe(true); // Non-empty string is truthy
    });

    it("should evaluate single-quoted strings", () => {
      const result = evaluateExpression("'hello'", {});
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it("should evaluate empty string as falsy", () => {
      const result = evaluateExpression('""', {});
      expect(result.success).toBe(true);
      expect(result.result).toBe(false);
    });

    it("should handle strings with spaces", () => {
      const result = evaluateExpression('"hello world"', {});
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });
  });

  describe("Variable Access", () => {
    it("should access simple variables", () => {
      const result = evaluateExpression("userName", { userName: "John" });
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it("should handle undefined variables as falsy", () => {
      const result = evaluateExpression("missingVar", {});
      expect(result.success).toBe(true);
      expect(result.result).toBe(false);
    });

    it("should handle null variables as falsy", () => {
      const result = evaluateExpression("nullVar", { nullVar: null });
      expect(result.success).toBe(true);
      expect(result.result).toBe(false);
    });

    it("should handle boolean variable values", () => {
      const result = evaluateExpression("isActive", { isActive: true });
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });
  });

  describe("Property Access", () => {
    it("should access nested properties", () => {
      const result = evaluateExpression("user.name", { user: { name: "Alice" } });
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it("should access deeply nested properties", () => {
      const result = evaluateExpression("data.items.length", {
        data: { items: { length: 5 } },
      });
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it("should handle missing nested properties gracefully", () => {
      const result = evaluateExpression("user.missing.prop", { user: {} });
      expect(result.success).toBe(true);
      expect(result.result).toBe(false);
    });

    it("should access array length property", () => {
      const result = evaluateExpression("items.length", { items: [1, 2, 3] });
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });
  });

  describe("Comparison Operators", () => {
    describe("Equality (==)", () => {
      it("should compare numbers with ==", () => {
        const result = evaluateExpression("count == 5", { count: 5 });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it("should return false for non-equal values", () => {
        const result = evaluateExpression("count == 10", { count: 5 });
        expect(result.success).toBe(true);
        expect(result.result).toBe(false);
      });

      it("should compare strings with ==", () => {
        const result = evaluateExpression('status == "active"', { status: "active" });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it("should perform type coercion with ==", () => {
        const result = evaluateExpression('count == "5"', { count: 5 });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });
    });

    describe("Strict Equality (===)", () => {
      it("should compare with type checking", () => {
        const result = evaluateExpression("count === 5", { count: 5 });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it("should reject type-different values", () => {
        const result = evaluateExpression('count === "5"', { count: 5 });
        expect(result.success).toBe(true);
        expect(result.result).toBe(false);
      });

      it("should compare booleans strictly", () => {
        const result = evaluateExpression("isActive === true", { isActive: true });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });
    });

    describe("Inequality (!=)", () => {
      it("should detect inequality", () => {
        const result = evaluateExpression("count != 10", { count: 5 });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it("should return false for equal values", () => {
        const result = evaluateExpression("count != 5", { count: 5 });
        expect(result.success).toBe(true);
        expect(result.result).toBe(false);
      });
    });

    describe("Strict Inequality (!==)", () => {
      it("should detect type difference", () => {
        const result = evaluateExpression('count !== "5"', { count: 5 });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it("should return false for strictly equal values", () => {
        const result = evaluateExpression("count !== 5", { count: 5 });
        expect(result.success).toBe(true);
        expect(result.result).toBe(false);
      });
    });

    describe("Greater Than (>)", () => {
      it("should compare numbers with >", () => {
        const result = evaluateExpression("count > 3", { count: 5 });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it("should return false when not greater", () => {
        const result = evaluateExpression("count > 10", { count: 5 });
        expect(result.success).toBe(true);
        expect(result.result).toBe(false);
      });

      it("should return false for equal values", () => {
        const result = evaluateExpression("count > 5", { count: 5 });
        expect(result.success).toBe(true);
        expect(result.result).toBe(false);
      });
    });

    describe("Greater Than or Equal (>=)", () => {
      it("should return true for greater value", () => {
        const result = evaluateExpression("count >= 3", { count: 5 });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it("should return true for equal value", () => {
        const result = evaluateExpression("count >= 5", { count: 5 });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it("should return false for smaller value", () => {
        const result = evaluateExpression("count >= 10", { count: 5 });
        expect(result.success).toBe(true);
        expect(result.result).toBe(false);
      });
    });

    describe("Less Than (<)", () => {
      it("should compare numbers with <", () => {
        const result = evaluateExpression("count < 10", { count: 5 });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it("should return false when not less", () => {
        const result = evaluateExpression("count < 3", { count: 5 });
        expect(result.success).toBe(true);
        expect(result.result).toBe(false);
      });
    });

    describe("Less Than or Equal (<=)", () => {
      it("should return true for smaller value", () => {
        const result = evaluateExpression("count <= 10", { count: 5 });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it("should return true for equal value", () => {
        const result = evaluateExpression("count <= 5", { count: 5 });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });
    });
  });

  describe("Logical Operators", () => {
    describe("AND (&&)", () => {
      it("should return true when both operands are true", () => {
        const result = evaluateExpression("isActive && hasPermission", {
          isActive: true,
          hasPermission: true,
        });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it("should return false when first operand is false", () => {
        const result = evaluateExpression("isActive && hasPermission", {
          isActive: false,
          hasPermission: true,
        });
        expect(result.success).toBe(true);
        expect(result.result).toBe(false);
      });

      it("should return false when second operand is false", () => {
        const result = evaluateExpression("isActive && hasPermission", {
          isActive: true,
          hasPermission: false,
        });
        expect(result.success).toBe(true);
        expect(result.result).toBe(false);
      });

      it("should chain multiple AND operations", () => {
        const result = evaluateExpression("a && b && c", {
          a: true,
          b: true,
          c: true,
        });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it("should combine AND with comparisons", () => {
        const result = evaluateExpression("count > 5 && isActive", {
          count: 10,
          isActive: true,
        });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });
    });

    describe("OR (||)", () => {
      it("should return true when first operand is true", () => {
        const result = evaluateExpression("isActive || hasBackup", {
          isActive: true,
          hasBackup: false,
        });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it("should return true when second operand is true", () => {
        const result = evaluateExpression("isActive || hasBackup", {
          isActive: false,
          hasBackup: true,
        });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it("should return false when both operands are false", () => {
        const result = evaluateExpression("isActive || hasBackup", {
          isActive: false,
          hasBackup: false,
        });
        expect(result.success).toBe(true);
        expect(result.result).toBe(false);
      });

      it("should chain multiple OR operations", () => {
        const result = evaluateExpression("a || b || c", {
          a: false,
          b: false,
          c: true,
        });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });
    });

    describe("NOT (!)", () => {
      it("should negate true to false", () => {
        const result = evaluateExpression("!isActive", { isActive: true });
        expect(result.success).toBe(true);
        expect(result.result).toBe(false);
      });

      it("should negate false to true", () => {
        const result = evaluateExpression("!isActive", { isActive: false });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it("should negate comparison results", () => {
        const result = evaluateExpression("!(count > 10)", { count: 5 });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it("should handle double negation", () => {
        const result = evaluateExpression("!!value", { value: "hello" });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });
    });

    describe("Combined Logical Operations", () => {
      it("should handle AND and OR together", () => {
        const result = evaluateExpression("isActive && hasPermission || isAdmin", {
          isActive: false,
          hasPermission: true,
          isAdmin: true,
        });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it("should respect AND precedence over OR", () => {
        const result = evaluateExpression("a || b && c", {
          a: false,
          b: true,
          c: true,
        });
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });
    });
  });

  describe("Parentheses Grouping", () => {
    it("should respect parentheses for grouping", () => {
      const result = evaluateExpression("(a || b) && c", {
        a: false,
        b: true,
        c: true,
      });
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it("should handle nested parentheses", () => {
      const result = evaluateExpression("((a && b) || (c && d))", {
        a: false,
        b: true,
        c: true,
        d: true,
      });
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it("should handle parentheses with comparisons", () => {
      const result = evaluateExpression("(count > 5) && (status === 'active')", {
        count: 10,
        status: "active",
      });
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it("should handle complex nested expressions", () => {
      const result = evaluateExpression(
        "((count >= 10 && isActive) || (count < 5 && isAdmin))",
        { count: 15, isActive: true, isAdmin: false }
      );
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });
  });

  describe("Complex Real-World Scenarios", () => {
    it("should evaluate workflow condition with multiple checks", () => {
      const result = evaluateExpression(
        'user.role === "admin" && user.isActive && user.permissions.length > 0',
        {
          user: {
            role: "admin",
            isActive: true,
            permissions: ["read", "write"],
          },
        }
      );
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it("should evaluate data extraction condition", () => {
      const result = evaluateExpression(
        '(data.items.length > 0) && (data.status === "complete")',
        {
          data: {
            items: [1, 2, 3],
            status: "complete",
          },
        }
      );
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it("should evaluate API response validation", () => {
      const result = evaluateExpression(
        'response.status === 200 && response.data !== null',
        {
          response: {
            status: 200,
            data: { result: "success" },
          },
        }
      );
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it("should handle permission check with fallback", () => {
      const result = evaluateExpression(
        '(user.isAdmin || user.role === "moderator") && !user.isBanned',
        {
          user: {
            isAdmin: false,
            role: "moderator",
            isBanned: false,
          },
        }
      );
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should return error for malformed expressions", () => {
      const result = evaluateExpression("count >", { count: 5 });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should return error for unmatched parentheses", () => {
      const result = evaluateExpression("(count > 5", { count: 10 });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should return error for invalid operators", () => {
      const result = evaluateExpression("count ++ 5", { count: 5 });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should return error for empty expression", () => {
      const result = evaluateExpression("", {});
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should return error for whitespace-only expression", () => {
      const result = evaluateExpression("   ", {});
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle expressions with extra whitespace", () => {
      const result = evaluateExpression("  count   >   5  ", { count: 10 });
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it("should handle variables with underscores", () => {
      const result = evaluateExpression("user_name !== null", { user_name: "Alice" });
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it("should handle variables with numbers", () => {
      const result = evaluateExpression("item123 > 0", { item123: 5 });
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it("should handle camelCase variables", () => {
      const result = evaluateExpression("isActiveUser", { isActiveUser: true });
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it("should handle PascalCase variables", () => {
      const result = evaluateExpression("UserCount > 0", { UserCount: 10 });
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });
  });

  describe("Security - Code Injection Prevention", () => {
    it("should reject function calls", () => {
      const result = evaluateExpression("alert('xss')", {});
      expect(result.success).toBe(false);
      expect(result.error).toContain("unsafe");
    });

    it("should reject constructor access", () => {
      const result = evaluateExpression("constructor.constructor('return process')()", {});
      expect(result.success).toBe(false);
      expect(result.error).toContain("unsafe");
    });

    it("should reject __proto__ access", () => {
      const result = evaluateExpression("__proto__.polluted", {});
      expect(result.success).toBe(false);
      expect(result.error).toContain("unsafe");
    });

    it("should reject eval keyword", () => {
      const result = evaluateExpression("eval('malicious code')", {});
      expect(result.success).toBe(false);
      expect(result.error).toContain("unsafe");
    });

    it("should reject Function constructor", () => {
      const result = evaluateExpression("Function('return 1')()", {});
      expect(result.success).toBe(false);
      expect(result.error).toContain("unsafe");
    });

    it("should reject require/import", () => {
      const result = evaluateExpression("require('fs')", {});
      expect(result.success).toBe(false);
      expect(result.error).toContain("unsafe");
    });

    it("should reject process access", () => {
      const result = evaluateExpression("process.env", {});
      expect(result.success).toBe(false);
      expect(result.error).toContain("unsafe");
    });
  });
});
