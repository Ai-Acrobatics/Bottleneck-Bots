# pnpm Workspace Configuration

## Overview

The Bottleneck-Bots monorepo is now configured with pnpm workspaces for efficient package management and dependency sharing across multiple packages.

## Workspace Structure

```
bottleneck-bots/
├── pnpm-workspace.yaml          # Workspace configuration
├── package.json                 # Root package with shared dependencies
├── server/                      # Backend application
│   └── package.json            # @bottleneck-bots/server
├── client/                      # Frontend application
│   └── package.json            # @bottleneck-bots/client
├── shared/                      # Shared utilities and types
│   ├── package.json            # @bottleneck-bots/shared
│   └── _core/index.ts          # Main export file
└── stubs/                       # Development stubs
    └── pino-pretty/
```

## Workspace Packages

### @bottleneck-bots/server
- **Location**: `/root/Bottleneck-Bots/server`
- **Type**: Private package
- **Dependencies**: `@bottleneck-bots/shared` (workspace:*)
- **Exports**: API, auth, services, workers, workflows

### @bottleneck-bots/client
- **Location**: `/root/Bottleneck-Bots/client`
- **Type**: Private package
- **Dependencies**: `@bottleneck-bots/shared` (workspace:*)
- **Purpose**: Frontend React application

### @bottleneck-bots/shared
- **Location**: `/root/Bottleneck-Bots/shared`
- **Type**: Private package
- **Exports**:
  - `./const` - Shared constants
  - `./types` - TypeScript type definitions
  - `./errors` - Error classes

## Workspace Protocol

Internal dependencies use the `workspace:*` protocol, which:
- Links packages during development (no copy, instant updates)
- Ensures type safety across packages
- Simplifies dependency management

Example in `server/package.json`:
```json
{
  "dependencies": {
    "@bottleneck-bots/shared": "workspace:*"
  }
}
```

## Verification

### Install Dependencies
```bash
pnpm install
```

### List Workspace Packages
```bash
pnpm -r list --depth 0
```

### Verify Workspace Links
```bash
pnpm list @bottleneck-bots/shared
```

## Package Manager

- **Version**: pnpm@10.4.1
- **Configuration**: See `packageManager` field in root `package.json`
- **Lock File**: `pnpm-lock.yaml`

## Scripts

All workspace packages can run commands in parallel:

```bash
# Run command in all workspaces
pnpm -r <command>

# Run command in specific workspace
pnpm --filter @bottleneck-bots/server <command>

# Run from root
pnpm dev          # Start development server
pnpm build        # Build all packages
pnpm test         # Run tests
```

## Benefits

1. **Shared Dependencies**: Common packages installed once at root
2. **Type Safety**: TypeScript types shared across packages
3. **Fast Installation**: pnpm's efficient node_modules structure
4. **Workspace Protocol**: Instant updates across linked packages
5. **Monorepo Support**: Simplified multi-package development

## Next Steps

- **BB-002**: Set up path aliases for cleaner imports
- **BB-005**: Integrate Claude-Flow MCP tools (now unblocked)

## Completed Tasks

- [x] Created `pnpm-workspace.yaml` with package definitions
- [x] Set up `@bottleneck-bots/server` package
- [x] Set up `@bottleneck-bots/client` package
- [x] Set up `@bottleneck-bots/shared` package
- [x] Configured workspace dependencies with `workspace:*` protocol
- [x] Verified installation with `pnpm install`
- [x] Confirmed workspace linking works correctly

---

**Status**: ✅ Completed (BB-001)
**Owner**: Tyler-TypeScript
**Completed**: 2025-12-23T20:55:00Z
