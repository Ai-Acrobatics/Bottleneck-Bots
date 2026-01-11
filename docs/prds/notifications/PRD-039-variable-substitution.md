# PRD-039: Variable Substitution

## Product Requirements Document

### Overview
| Field | Value |
|-------|-------|
| **PRD ID** | PRD-039 |
| **Feature Name** | Variable Substitution |
| **Category** | Specialized Features |
| **Priority** | P1 - High |
| **Status** | Active |
| **Owner** | Platform Team |

---

## 1. Executive Summary

The Variable Substitution system enables dynamic variable interpolation in workflows, variable mapping and transformation, environment variable support, and runtime variable evaluation. It allows workflows to use dynamic data throughout execution.

## 2. Problem Statement

Static workflows can't adapt to dynamic data. Users need to pass data between steps. Environment-specific values require configuration. Complex data transformations need expression support.

## 3. Goals & Objectives

### Primary Goals
- Enable dynamic data in workflows
- Support data transformation
- Provide environment-aware variables
- Ensure secure variable handling

### Success Metrics
| Metric | Target |
|--------|--------|
| Substitution Accuracy | 100% |
| Evaluation Speed | < 10ms |
| Security Compliance | 100% |
| User Adoption | > 80% |

## 4. Functional Requirements

### FR-001: Variable Types
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Workflow variables | P0 |
| FR-001.2 | Step output references | P0 |
| FR-001.3 | Environment variables | P0 |
| FR-001.4 | System variables | P1 |
| FR-001.5 | User-defined variables | P1 |

### FR-002: Substitution
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Template syntax {{var}} | P0 |
| FR-002.2 | Nested object access | P0 |
| FR-002.3 | Array indexing | P1 |
| FR-002.4 | Default values | P1 |

### FR-003: Transformation
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | String functions | P1 |
| FR-003.2 | Number functions | P1 |
| FR-003.3 | Date functions | P2 |
| FR-003.4 | JSON functions | P1 |

### FR-004: Security
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Secret masking | P0 |
| FR-004.2 | Sandboxed evaluation | P0 |
| FR-004.3 | Injection prevention | P0 |

## 5. Variable Syntax

### Basic Substitution
```
{{variable}}
{{step1.output.data}}
{{env.API_KEY}}
```

### With Default
```
{{variable|default:"fallback"}}
```

### With Transform
```
{{name|upper}}
{{price|multiply:1.1|round:2}}
```

## 6. Data Models

### Variable Definition
```typescript
interface VariableDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  source: 'input' | 'step' | 'env' | 'system' | 'custom';
  defaultValue?: any;
  isSecret?: boolean;
}
```

### Variable Context
```typescript
interface VariableContext {
  workflow: Record<string, any>;
  steps: Record<string, any>;
  env: Record<string, any>;
  system: SystemVariables;
  custom: Record<string, any>;
}
```

### System Variables
```typescript
interface SystemVariables {
  timestamp: Date;
  executionId: string;
  workflowId: string;
  userId: string;
  environment: string;
}
```

## 7. Transform Functions

| Function | Example | Result |
|----------|---------|--------|
| upper | `{{name\|upper}}` | "JOHN" |
| lower | `{{name\|lower}}` | "john" |
| trim | `{{text\|trim}}` | "hello" |
| length | `{{arr\|length}}` | 5 |
| first | `{{arr\|first}}` | item[0] |
| last | `{{arr\|last}}` | item[n] |
| join | `{{arr\|join:","}}` | "a,b,c" |
| round | `{{num\|round:2}}` | 3.14 |

## 8. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/variables/evaluate` | Evaluate expression |
| GET | `/api/variables/system` | List system variables |
| POST | `/api/variables/validate` | Validate expression |

---

## Appendix

### A. Changelog
| Date | Version | Changes |
|------|---------|---------|
| 2024-01-11 | 1.0 | Initial PRD creation |
