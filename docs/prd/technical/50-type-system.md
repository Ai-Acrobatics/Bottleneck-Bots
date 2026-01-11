# PRD: Type System

## Overview
Implement a comprehensive TypeScript type system providing end-to-end type safety across the entire Bottleneck-Bots stack. This includes full TypeScript implementation, tRPC for API type inference, Zod for runtime validation with type generation, and seamless type propagation from database schema to frontend components.

## Problem Statement
JavaScript applications suffer from runtime type errors that could be caught at compile time. Without a robust type system:
- API contract violations are discovered only at runtime
- Database queries return `any` types with no safety
- Refactoring is risky without type-checked call sites
- Developer productivity decreases from lack of autocomplete
- Bugs slip through that TypeScript would catch
- Documentation becomes stale as types drift from implementation

## Goals & Objectives
- **Primary Goals**
  - Achieve 100% TypeScript coverage across all code
  - Implement end-to-end type safety from database to UI
  - Use Zod for runtime validation with inferred types
  - Enable tRPC for fully typed API calls
  - Eliminate `any` types except where explicitly necessary

- **Success Metrics**
  - Zero `any` types in application code (strict mode)
  - 100% TypeScript file coverage
  - Zero runtime type errors in production
  - < 30 second type-check time for full codebase

## User Stories
- As a developer, I want type errors at compile time so that I catch bugs before deployment
- As a developer, I want autocomplete suggestions so that I can code faster with fewer errors
- As a developer, I want API response types so that I know exactly what data I'm working with
- As a developer, I want form validation types so that they stay in sync with API schemas
- As a developer, I want database types so that queries are safe and predictable
- As a team lead, I want strict TypeScript so that code quality is enforced automatically

## Functional Requirements

### Must Have (P0)
- **Strict TypeScript Config**: Enable all strict mode flags
- **Zod Schemas**: Runtime validation schemas for all API inputs/outputs
- **Type Inference**: Derive TypeScript types from Zod schemas
- **tRPC Integration**: Fully typed API procedures with inferred types
- **Database Types**: Type inference from Drizzle ORM schemas
- **React Component Types**: Proper typing for props, state, and refs
- **Type Exports**: Centralized type definitions for shared types
- **No Implicit Any**: Forbid implicit any types throughout codebase

### Should Have (P1)
- **Branded Types**: Distinct types for IDs (UserId, BotId) to prevent mixing
- **Utility Types**: Common utility types (DeepPartial, Prettify, etc.)
- **Discriminated Unions**: Type-safe handling of variant types
- **Generic Components**: Reusable generic component patterns
- **Type Guards**: Runtime type checking with type narrowing
- **Module Augmentation**: Extend third-party library types
- **Path Aliases**: Clean imports with TypeScript path aliases

### Nice to Have (P2)
- **Type Documentation**: TSDoc comments for complex types
- **Type Testing**: Compile-time type assertions
- **API Type Generation**: Generate OpenAPI from tRPC for external consumers
- **GraphQL Types**: Type generation if GraphQL is added
- **State Machine Types**: XState or similar typed state machines
- **Validation Error Types**: Typed validation error responses

## Non-Functional Requirements

### Performance
- Type-check time: < 30 seconds for full codebase
- Incremental type-check: < 5 seconds on file save
- IDE responsiveness: < 500ms for autocomplete
- No runtime overhead from type system

### Developer Experience
- Full autocomplete in all supported IDEs
- Inline type errors with clear messages
- Go-to-definition for all custom types
- Hover documentation for typed APIs

### Maintainability
- Types colocated with implementation
- Shared types in dedicated modules
- Clear type naming conventions
- Minimal type duplication

## Technical Requirements

### Architecture
```
/src/types/
  ├── index.ts                    # Barrel export of all shared types
  ├── common.ts                   # Common utility types
  ├── branded.ts                  # Branded/nominal types
  ├── api.ts                      # API-related types
  ├── database.ts                 # Re-exported database types
  └── guards.ts                   # Type guard functions

/src/schemas/
  ├── index.ts                    # Barrel export of all schemas
  ├── common.schema.ts            # Shared validation patterns
  ├── user.schema.ts              # User-related schemas
  ├── bot.schema.ts               # Bot-related schemas
  ├── workflow.schema.ts          # Workflow-related schemas
  ├── auth.schema.ts              # Authentication schemas
  └── settings.schema.ts          # Settings schemas

tsconfig.json                     # Strict TypeScript configuration
```

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    // Strict Type Checking
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,

    // Additional Checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,

    // Module Resolution
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,

    // Path Aliases
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/types": ["./src/types"],
      "@/schemas": ["./src/schemas"],
      "@/db": ["./src/db"],
      "@/lib/*": ["./src/lib/*"]
    },

    // Output
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "incremental": true,

    // Build
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*", "*.ts", "*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

### Zod Schema Patterns
```typescript
// src/schemas/bot.schema.ts
import { z } from 'zod';

// Base schemas for reuse
const botConfigSchema = z.object({
  timeout: z.number().min(0).max(300).default(30),
  retries: z.number().min(0).max(10).default(3),
  concurrency: z.number().min(1).max(10).default(1),
  environment: z.record(z.string()).optional(),
});

const scheduleSchema = z.enum(['hourly', 'daily', 'weekly', 'monthly', 'custom']);

// Create bot input schema
export const createBotSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500).optional(),
  schedule: scheduleSchema.optional(),
  config: botConfigSchema,
  isActive: z.boolean().default(true),
});

// Update bot input schema (partial of create)
export const updateBotSchema = createBotSchema.partial();

// Bot query params
export const listBotsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'createdAt', 'lastRunAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Type inference from schemas
export type CreateBotInput = z.infer<typeof createBotSchema>;
export type UpdateBotInput = z.infer<typeof updateBotSchema>;
export type ListBotsQuery = z.infer<typeof listBotsQuerySchema>;
export type BotConfig = z.infer<typeof botConfigSchema>;
export type Schedule = z.infer<typeof scheduleSchema>;
```

### tRPC Type Integration
```typescript
// src/server/api/routers/bots.ts
import { router, protectedProcedure } from '../trpc';
import { createBotSchema, updateBotSchema, listBotsQuerySchema } from '@/schemas/bot.schema';
import { z } from 'zod';

export const botsRouter = router({
  list: protectedProcedure
    .input(listBotsQuerySchema)
    .query(async ({ input, ctx }) => {
      // input is fully typed as ListBotsQuery
      const bots = await ctx.db.query.bots.findMany({
        where: eq(bots.organizationId, ctx.session.organizationId),
        limit: input.pageSize,
        offset: (input.page - 1) * input.pageSize,
      });
      // Return type is inferred
      return { data: bots, pagination: { ... } };
    }),

  create: protectedProcedure
    .input(createBotSchema)
    .mutation(async ({ input, ctx }) => {
      // input is fully typed as CreateBotInput
      const [bot] = await ctx.db.insert(bots)
        .values({
          ...input,
          organizationId: ctx.session.organizationId,
          createdById: ctx.session.userId,
        })
        .returning();
      return bot; // Return type is Bot
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: updateBotSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      // ...
    }),
});

// Client-side usage with full type inference
// const { data } = api.bots.list.useQuery({ page: 1 });
// data is typed as { data: Bot[], pagination: Pagination }
```

### Branded/Nominal Types
```typescript
// src/types/branded.ts

// Create branded type factory
declare const __brand: unique symbol;
type Brand<T, B> = T & { [__brand]: B };

// Branded ID types - prevents mixing IDs
export type UserId = Brand<string, 'UserId'>;
export type OrganizationId = Brand<string, 'OrganizationId'>;
export type BotId = Brand<string, 'BotId'>;
export type WorkflowId = Brand<string, 'WorkflowId'>;

// Brand constructors
export const UserId = (id: string): UserId => id as UserId;
export const OrganizationId = (id: string): OrganizationId => id as OrganizationId;
export const BotId = (id: string): BotId => id as BotId;

// Usage prevents mixing ID types
function getBot(botId: BotId): Promise<Bot> { ... }
function getUser(userId: UserId): Promise<User> { ... }

// This would be a compile error:
// getBot(userId); // Type 'UserId' is not assignable to 'BotId'
```

### Utility Types
```typescript
// src/types/common.ts

// Make type more readable in IDE
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// Deep partial for nested objects
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Make specific keys required
export type RequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Make specific keys optional
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Exclude null and undefined
export type NonNullableFields<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

// Extract successful response type from tRPC procedure
export type InferProcedureOutput<T> = T extends {
  _def: { _output_out: infer O };
} ? O : never;

// Array element type
export type ArrayElement<T> = T extends readonly (infer E)[] ? E : never;
```

### Type Guards
```typescript
// src/types/guards.ts

// Check if value is defined
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

// Check if error is specific type
export function isTRPCError(error: unknown): error is TRPCError {
  return error instanceof TRPCError;
}

// Check if object has property
export function hasProperty<K extends PropertyKey>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return typeof obj === 'object' && obj !== null && key in obj;
}

// Exhaustive check for discriminated unions
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

// Usage with discriminated unions
type BotStatus = { status: 'idle' } | { status: 'running', progress: number } | { status: 'error', message: string };

function renderStatus(bot: BotStatus) {
  switch (bot.status) {
    case 'idle':
      return 'Idle';
    case 'running':
      return `Running: ${bot.progress}%`;
    case 'error':
      return `Error: ${bot.message}`;
    default:
      return assertNever(bot); // Compile error if case missed
  }
}
```

### Database Type Integration
```typescript
// src/types/database.ts
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { bots, users, organizations, workflows } from '@/db/schema';

// Re-export inferred database types
export type Bot = InferSelectModel<typeof bots>;
export type NewBot = InferInsertModel<typeof bots>;

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Organization = InferSelectModel<typeof organizations>;
export type Workflow = InferSelectModel<typeof workflows>;

// With relations (from query results)
export type BotWithRuns = Bot & {
  runs: BotRun[];
  createdBy: Pick<User, 'id' | 'name' | 'email'>;
};

// Partial types for updates
export type BotUpdate = Partial<Omit<NewBot, 'id' | 'createdAt' | 'createdById'>>;
```

### Dependencies
- `typescript` (v5.x) - TypeScript compiler
- `zod` - Runtime validation with type inference
- `@trpc/server` + `@trpc/client` - Type-safe API layer
- `drizzle-orm` - Type-safe database ORM
- `@types/*` - Type definitions for libraries

### ESLint TypeScript Rules
```javascript
// .eslintrc.js (TypeScript rules)
{
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/consistent-type-exports': 'error',
  },
}
```

## Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| TypeScript coverage | 100% files | File extension audit |
| Explicit `any` usage | Zero in app code | ESLint rule |
| Type-check time | < 30 seconds | CI metrics |
| Runtime type errors | Zero in production | Error tracking |
| Type accuracy | Zero false positives | Bug reports |

## Dependencies
- ESLint with TypeScript plugin
- IDE with TypeScript support (VS Code)
- CI/CD with type-check step
- tRPC and Zod for validation

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Type-check slows CI/CD | Medium - Slower deploys | Incremental builds; type-check caching; parallelization |
| Third-party library types incomplete | Medium - Type gaps | Module augmentation; wrapper types; contribute upstream |
| Over-complex type definitions | Medium - Maintenance burden | Type testing; documentation; simplicity guidelines |
| Learning curve for team | Medium - Slow onboarding | TypeScript training; documented patterns; code review |
| Type system vs runtime mismatch | High - False safety | Zod validation at boundaries; integration tests |
| IDE performance with large project | Low - Dev friction | tsconfig excludes; project references; incremental mode |
