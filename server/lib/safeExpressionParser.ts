/**
 * Safe Expression Parser
 *
 * A secure alternative to eval() for evaluating boolean expressions.
 * Supports comparison operators, logical operators, and property access
 * without the security risks of eval() or Function constructor.
 *
 * Supported features:
 * - Comparison: ==, ===, !=, !==, <, >, <=, >=
 * - Logical: &&, ||, !
 * - Literals: true, false, numbers, strings
 * - Variables: from context object
 * - Property access: user.name, data.items.length
 * - Parentheses: for grouping expressions
 *
 * Security: NO eval(), NO Function(), NO arbitrary code execution
 */

// Token types for lexical analysis
enum TokenType {
  // Literals
  TRUE = "TRUE",
  FALSE = "FALSE",
  NUMBER = "NUMBER",
  STRING = "STRING",

  // Identifiers and property access
  IDENTIFIER = "IDENTIFIER",
  DOT = "DOT",

  // Comparison operators
  EQ = "EQ", // ==
  STRICT_EQ = "STRICT_EQ", // ===
  NEQ = "NEQ", // !=
  STRICT_NEQ = "STRICT_NEQ", // !==
  LT = "LT", // <
  LTE = "LTE", // <=
  GT = "GT", // >
  GTE = "GTE", // >=

  // Logical operators
  AND = "AND", // &&
  OR = "OR", // ||
  NOT = "NOT", // !

  // Grouping
  LPAREN = "LPAREN",
  RPAREN = "RPAREN",

  // End of input
  EOF = "EOF",
}

interface Token {
  type: TokenType;
  value: any;
  position: number;
}

export interface ExpressionResult {
  success: boolean;
  result: boolean;
  error?: string;
}

/**
 * Tokenize the input expression into a stream of tokens
 */
function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let position = 0;
  const input = expression.trim();

  // Security check: reject unsafe keywords
  const unsafePatterns = [
    /\b(eval|Function|constructor|__proto__|require|import|process|global|globalThis)\b/i,
    /\(.*\)/g, // Reject function calls in identifiers
  ];

  while (position < input.length) {
    // Skip whitespace
    if (/\s/.test(input[position])) {
      position++;
      continue;
    }

    // Check for three-character operators FIRST (before two-character)
    const threeChar = input.substring(position, position + 3);

    if (threeChar === "===") {
      tokens.push({ type: TokenType.STRICT_EQ, value: "===", position });
      position += 3;
      continue;
    }

    if (threeChar === "!==") {
      tokens.push({ type: TokenType.STRICT_NEQ, value: "!==", position });
      position += 3;
      continue;
    }

    // Check for two-character operators
    const twoChar = input.substring(position, position + 2);

    if (twoChar === "==") {
      tokens.push({ type: TokenType.EQ, value: "==", position });
      position += 2;
      continue;
    }

    if (twoChar === "!=") {
      tokens.push({ type: TokenType.NEQ, value: "!=", position });
      position += 2;
      continue;
    }

    if (twoChar === "<=") {
      tokens.push({ type: TokenType.LTE, value: "<=", position });
      position += 2;
      continue;
    }

    if (twoChar === ">=") {
      tokens.push({ type: TokenType.GTE, value: ">=", position });
      position += 2;
      continue;
    }

    if (twoChar === "&&") {
      tokens.push({ type: TokenType.AND, value: "&&", position });
      position += 2;
      continue;
    }

    if (twoChar === "||") {
      tokens.push({ type: TokenType.OR, value: "||", position });
      position += 2;
      continue;
    }

    // Single character operators
    const char = input[position];

    if (char === "<") {
      tokens.push({ type: TokenType.LT, value: "<", position });
      position++;
      continue;
    }

    if (char === ">") {
      tokens.push({ type: TokenType.GT, value: ">", position });
      position++;
      continue;
    }

    if (char === "!") {
      tokens.push({ type: TokenType.NOT, value: "!", position });
      position++;
      continue;
    }

    if (char === "(") {
      tokens.push({ type: TokenType.LPAREN, value: "(", position });
      position++;
      continue;
    }

    if (char === ")") {
      tokens.push({ type: TokenType.RPAREN, value: ")", position });
      position++;
      continue;
    }

    if (char === ".") {
      tokens.push({ type: TokenType.DOT, value: ".", position });
      position++;
      continue;
    }

    // String literals (double or single quotes)
    if (char === '"' || char === "'") {
      const quote = char;
      let value = "";
      position++; // Skip opening quote

      while (position < input.length && input[position] !== quote) {
        value += input[position];
        position++;
      }

      if (position >= input.length) {
        throw new Error(`Unterminated string at position ${position}`);
      }

      position++; // Skip closing quote
      tokens.push({ type: TokenType.STRING, value, position });
      continue;
    }

    // Numbers (including decimals and negatives)
    if (/[0-9]/.test(char) || (char === "-" && /[0-9]/.test(input[position + 1]))) {
      let value = "";

      if (char === "-") {
        value += char;
        position++;
      }

      while (position < input.length && /[0-9.]/.test(input[position])) {
        value += input[position];
        position++;
      }

      tokens.push({ type: TokenType.NUMBER, value: parseFloat(value), position });
      continue;
    }

    // Identifiers (variables) and keywords (true, false)
    if (/[a-zA-Z_]/.test(char)) {
      let value = "";

      while (position < input.length && /[a-zA-Z0-9_]/.test(input[position])) {
        value += input[position];
        position++;
      }

      // Security check: reject unsafe identifiers
      for (const pattern of unsafePatterns) {
        if (pattern.test(value)) {
          throw new Error(
            `unsafe identifier detected: "${value}". Function calls and dangerous keywords are not allowed.`
          );
        }
      }

      // Check if this is a function call (identifier followed by '(')
      // Skip whitespace to check for '('
      let lookAhead = position;
      while (lookAhead < input.length && /\s/.test(input[lookAhead])) {
        lookAhead++;
      }
      if (lookAhead < input.length && input[lookAhead] === "(") {
        throw new Error(
          `unsafe function call detected: "${value}()". Function calls are not allowed.`
        );
      }

      // Check for boolean keywords
      if (value === "true") {
        tokens.push({ type: TokenType.TRUE, value: true, position });
      } else if (value === "false") {
        tokens.push({ type: TokenType.FALSE, value: false, position });
      } else {
        tokens.push({ type: TokenType.IDENTIFIER, value, position });
      }
      continue;
    }

    // Unknown character
    throw new Error(`Unexpected character '${char}' at position ${position}`);
  }

  tokens.push({ type: TokenType.EOF, value: null, position });
  return tokens;
}

/**
 * Recursive descent parser for expressions
 */
class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  /**
   * Parse the full expression
   */
  parse(): any {
    return this.parseOrExpression();
  }

  /**
   * Parse OR expression (lowest precedence)
   * or_expr := and_expr ( '||' and_expr )*
   */
  private parseOrExpression(): any {
    let left = this.parseAndExpression();

    while (this.match(TokenType.OR)) {
      const right = this.parseAndExpression();
      left = { type: "or", left, right };
    }

    return left;
  }

  /**
   * Parse AND expression
   * and_expr := comparison ( '&&' comparison )*
   */
  private parseAndExpression(): any {
    let left = this.parseComparisonExpression();

    while (this.match(TokenType.AND)) {
      const right = this.parseComparisonExpression();
      left = { type: "and", left, right };
    }

    return left;
  }

  /**
   * Parse comparison expression
   * comparison := unary ( ( '==' | '===' | '!=' | '!==' | '<' | '<=' | '>' | '>=' ) unary )?
   */
  private parseComparisonExpression(): any {
    let left = this.parseUnaryExpression();

    if (
      this.check(TokenType.EQ) ||
      this.check(TokenType.STRICT_EQ) ||
      this.check(TokenType.NEQ) ||
      this.check(TokenType.STRICT_NEQ) ||
      this.check(TokenType.LT) ||
      this.check(TokenType.LTE) ||
      this.check(TokenType.GT) ||
      this.check(TokenType.GTE)
    ) {
      const operator = this.advance();
      const right = this.parseUnaryExpression();
      return { type: "comparison", operator: operator.type, left, right };
    }

    return left;
  }

  /**
   * Parse unary expression (NOT)
   * unary := '!' unary | primary
   */
  private parseUnaryExpression(): any {
    if (this.match(TokenType.NOT)) {
      const operand = this.parseUnaryExpression();
      return { type: "not", operand };
    }

    return this.parsePrimaryExpression();
  }

  /**
   * Parse primary expression (literals, identifiers, grouped expressions)
   * primary := TRUE | FALSE | NUMBER | STRING | identifier | '(' or_expr ')'
   */
  private parsePrimaryExpression(): any {
    // Boolean literals
    if (this.match(TokenType.TRUE)) {
      return { type: "literal", value: true };
    }

    if (this.match(TokenType.FALSE)) {
      return { type: "literal", value: false };
    }

    // Number literals
    if (this.match(TokenType.NUMBER)) {
      return { type: "literal", value: this.previous().value };
    }

    // String literals
    if (this.match(TokenType.STRING)) {
      return { type: "literal", value: this.previous().value };
    }

    // Identifiers (with property access)
    if (this.match(TokenType.IDENTIFIER)) {
      const identifierToken = this.previous();
      const path = [identifierToken.value];

      // Handle property access (e.g., user.name.first)
      while (this.match(TokenType.DOT)) {
        if (!this.check(TokenType.IDENTIFIER)) {
          throw new Error("Expected property name after '.'");
        }
        this.advance();
        path.push(this.previous().value);
      }

      return { type: "identifier", path };
    }

    // Grouped expressions
    if (this.match(TokenType.LPAREN)) {
      const expr = this.parseOrExpression();
      if (!this.match(TokenType.RPAREN)) {
        throw new Error("Expected ')' after expression");
      }
      return expr;
    }

    const token = this.peek();
    throw new Error(`Unexpected token: ${token.type} at position ${token.position}`);
  }

  // Helper methods
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }
}

/**
 * Evaluate the parsed AST
 */
function evaluateAST(node: any, context: Record<string, unknown>): any {
  switch (node.type) {
    case "literal":
      return node.value;

    case "identifier": {
      // Resolve variable from context using property path
      let value: any = context;
      for (const prop of node.path) {
        if (value === null || value === undefined) {
          return undefined;
        }
        value = value[prop];
      }
      return value;
    }

    case "not": {
      const operand = evaluateAST(node.operand, context);
      return !operand;
    }

    case "and": {
      const left = evaluateAST(node.left, context);
      if (!left) return false; // Short-circuit
      const right = evaluateAST(node.right, context);
      return left && right;
    }

    case "or": {
      const left = evaluateAST(node.left, context);
      if (left) return true; // Short-circuit
      const right = evaluateAST(node.right, context);
      return left || right;
    }

    case "comparison": {
      const left = evaluateAST(node.left, context);
      const right = evaluateAST(node.right, context);

      switch (node.operator) {
        case TokenType.EQ:
          return left == right;
        case TokenType.STRICT_EQ:
          return left === right;
        case TokenType.NEQ:
          return left != right;
        case TokenType.STRICT_NEQ:
          return left !== right;
        case TokenType.LT:
          return left < right;
        case TokenType.LTE:
          return left <= right;
        case TokenType.GT:
          return left > right;
        case TokenType.GTE:
          return left >= right;
        default:
          throw new Error(`Unknown comparison operator: ${node.operator}`);
      }
    }

    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

/**
 * Safely evaluate a boolean expression
 *
 * @param expression - The expression string to evaluate
 * @param context - Object containing variables referenced in the expression
 * @returns Result object with success flag, boolean result, and optional error
 */
export function evaluateExpression(
  expression: string,
  context: Record<string, unknown>
): ExpressionResult {
  try {
    // Validate input
    const trimmed = expression.trim();
    if (!trimmed) {
      return {
        success: false,
        result: false,
        error: "Expression cannot be empty",
      };
    }

    // Tokenize
    const tokens = tokenize(trimmed);

    // Parse
    const parser = new Parser(tokens);
    const ast = parser.parse();

    // Evaluate
    const result = evaluateAST(ast, context);

    // Convert to boolean
    return {
      success: true,
      result: Boolean(result),
    };
  } catch (error) {
    return {
      success: false,
      result: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
