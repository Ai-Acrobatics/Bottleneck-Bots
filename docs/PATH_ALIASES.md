# TypeScript Path Aliases Configuration

This document explains the TypeScript path alias configuration across the Bottleneck-Bots monorepo.

## Overview

Path aliases provide cleaner import statements and better code organization across the monorepo workspaces:
- `@bottleneck-bots/server`
- `@bottleneck-bots/client`
- `@bottleneck-bots/shared`

## Configuration Structure

### Root Configuration (`/tsconfig.json`)

The root `tsconfig.json` defines base path mappings that apply across all workspaces:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      // Client aliases
      "@/*": ["./client/src/*"],

      // Shared package aliases
      "@shared": ["./shared/_core/index.ts"],
      "@shared/*": ["./shared/*"],
      "@shared/const": ["./shared/const.ts"],
      "@shared/types": ["./shared/types.ts"],

      // Server package aliases
      "@server": ["./server/_core/index.ts"],
      "@server/*": ["./server/*"],
      "@server/api/*": ["./server/api/*"],
      "@server/auth/*": ["./server/auth/*"],
      "@server/lib/*": ["./server/lib/*"],
      "@server/services/*": ["./server/services/*"],

      // Workspace package aliases
      "@bottleneck-bots/shared": ["./shared/_core/index.ts"],
      "@bottleneck-bots/server": ["./server/_core/index.ts"],
      "@bottleneck-bots/client": ["./client/src/main.tsx"]
    }
  }
}
```

### Workspace Configurations

Each workspace extends the root configuration and adds workspace-specific mappings:

#### Server (`/server/tsconfig.json`)

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "baseUrl": "..",
    "paths": {
      "@/*": ["./server/*"],
      "@server/*": ["./server/*"],
      "@api/*": ["./server/api/*"],
      "@auth/*": ["./server/auth/*"],
      "@lib/*": ["./server/lib/*"],
      "@services/*": ["./server/services/*"],
      "@shared": ["./shared/_core/index.ts"],
      "@bottleneck-bots/shared": ["./shared/_core/index.ts"]
    }
  }
}
```

#### Client (`/client/tsconfig.json`)

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "baseUrl": "..",
    "paths": {
      "@/*": ["./client/src/*"],
      "@components/*": ["./client/src/components/*"],
      "@hooks/*": ["./client/src/hooks/*"],
      "@lib/*": ["./client/src/lib/*"],
      "@shared": ["./shared/_core/index.ts"],
      "@bottleneck-bots/shared": ["./shared/_core/index.ts"]
    }
  }
}
```

#### Shared (`/shared/tsconfig.json`)

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "baseUrl": "..",
    "paths": {
      "@/*": ["./shared/*"],
      "@shared/*": ["./shared/*"],
      "@shared/const": ["./shared/const.ts"],
      "@shared/types": ["./shared/types.ts"]
    }
  }
}
```

## Usage Examples

### Importing from Shared Package

**Before (relative paths):**
```typescript
import { HttpError } from '../../../shared/_core/errors';
import { COOKIE_NAME } from '../../../shared/const';
```

**After (with aliases):**
```typescript
import { HttpError } from '@shared';
import { COOKIE_NAME } from '@shared/const';

// Or using workspace package name
import { HttpError } from '@bottleneck-bots/shared';
```

### Server Imports

**Before:**
```typescript
import { aiCallingRouter } from '../../api/routers/aiCalling';
import { authMiddleware } from '../../auth/middleware';
```

**After:**
```typescript
import { aiCallingRouter } from '@server/api/routers/aiCalling';
import { authMiddleware } from '@server/auth/middleware';
```

### Client Imports

**Before:**
```typescript
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../hooks/useAuth';
```

**After:**
```typescript
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
```

## Path Alias Reference

| Alias | Points To | Usage |
|-------|-----------|-------|
| `@/*` | Client src directory | Client UI components and pages |
| `@components/*` | Client components | React components |
| `@hooks/*` | Client hooks | React hooks |
| `@lib/*` | Library code | Utility functions (context-dependent) |
| `@server/*` | Server directory | Server-side code |
| `@api/*` | Server API routes | API endpoints and routers |
| `@auth/*` | Server auth | Authentication logic |
| `@services/*` | Server services | Business logic services |
| `@shared` | Shared package main | Shared types and utilities |
| `@shared/*` | Shared package | Any shared file |
| `@shared/const` | Shared constants | Application constants |
| `@shared/types` | Shared types | TypeScript types |
| `@bottleneck-bots/shared` | Shared package | Workspace package reference |
| `@bottleneck-bots/server` | Server package | Workspace package reference |
| `@bottleneck-bots/client` | Client package | Workspace package reference |

## Workspace Dependencies

The path aliases work seamlessly with pnpm workspace dependencies defined in `package.json`:

```json
{
  "dependencies": {
    "@bottleneck-bots/shared": "workspace:*"
  }
}
```

## Benefits

1. **Cleaner Imports**: No more `../../../` chains
2. **Refactoring Safety**: Moving files doesn't break imports
3. **Better IDE Support**: IntelliSense works better with aliases
4. **Monorepo Awareness**: Easy cross-workspace imports
5. **Consistent Patterns**: Same import style across the codebase

## IDE Configuration

### VS Code

Path aliases should work automatically with VS Code. If you experience issues:

1. Reload the window: `Cmd+Shift+P` → "Reload Window"
2. Restart TypeScript server: `Cmd+Shift+P` → "TypeScript: Restart TS Server"

### WebStorm/IntelliJ

Path aliases are automatically detected from `tsconfig.json`. Mark directories as:
- `client/src` → Sources Root
- `server` → Sources Root
- `shared` → Sources Root

## Troubleshooting

### Import not found

1. Check if the path alias is defined in the workspace's `tsconfig.json`
2. Verify `baseUrl` is set correctly (should be `..` for workspace configs)
3. Ensure the file exists at the target location
4. Restart TypeScript server

### Module resolution errors

1. Verify pnpm workspace dependencies are installed: `pnpm install`
2. Check that the workspace package has correct exports in `package.json`
3. Ensure `moduleResolution` is set to `"bundler"` or `"node16"`

### Cross-workspace imports failing

1. Make sure the target workspace's `tsconfig.json` includes necessary files
2. Check that `composite: true` is set in workspace configs
3. Verify shared files (like `drizzle/**/*.ts`) are included in both workspaces

## Related Files

- `/tsconfig.json` - Root TypeScript configuration
- `/pnpm-workspace.yaml` - pnpm workspace configuration
- `/server/tsconfig.json` - Server workspace config
- `/client/tsconfig.json` - Client workspace config
- `/shared/tsconfig.json` - Shared workspace config
- `/server/package.json` - Server workspace dependencies
- `/client/package.json` - Client workspace dependencies
- `/shared/package.json` - Shared workspace dependencies

## Migration Guide

To migrate existing imports to use path aliases:

1. **Identify the import pattern:**
   - Server imports: Use `@server/*`
   - Client imports: Use `@/*`
   - Shared imports: Use `@shared` or `@bottleneck-bots/shared`

2. **Replace relative paths:**
   ```typescript
   // Before
   import { db } from '../../../server/db';

   // After
   import { db } from '@server/db';
   ```

3. **Use your IDE's refactoring tools:**
   - VS Code: Use "Organize Imports" command
   - WebStorm: Use "Optimize Imports"

4. **Run TypeScript compiler to verify:**
   ```bash
   npx tsc --noEmit
   ```

## Best Practices

1. **Prefer workspace package names** (`@bottleneck-bots/*`) for cross-package imports
2. **Use short aliases** (`@/*`) for same-package imports
3. **Be consistent** with alias usage across the codebase
4. **Update imports** when moving files to maintain consistency
5. **Document custom aliases** if adding new path mappings

---

**Task:** BB-002 - Set up path aliases
**Status:** Completed
**Date:** 2025-12-23
