# PRD-022: MCP Integration

**Document Version:** 1.0
**Status:** Draft
**Author:** Development Team
**Last Updated:** January 11, 2026
**Feature Location:** `server/api/routers/mcp.ts`, `server/mcp/`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Stories](#4-user-stories)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Technical Architecture](#7-technical-architecture)
8. [Dependencies](#8-dependencies)
9. [Out of Scope](#9-out-of-scope)
10. [Risks & Mitigations](#10-risks--mitigations)
11. [Milestones & Timeline](#11-milestones--timeline)
12. [Acceptance Criteria](#12-acceptance-criteria)

---

## 1. Overview

The MCP (Model Context Protocol) Integration feature provides a standardized protocol layer for AI model communication, tool execution, and resource management within Bottleneck-Bots. This implementation enables AI agents to access a unified toolkit for file operations, shell commands, web requests, and database queries through a secure, extensible protocol server.

### 1.1 Feature Summary

- **Protocol Server**: JSON-RPC 2.0 compliant MCP server implementation with multi-transport support
- **Tool Registry**: Centralized tool registration, discovery, and execution management
- **Built-in Tool Categories**: File operations, shell commands, web requests, and database queries
- **Transport Layer**: Support for HTTP and stdio transports for flexible integration
- **Session Management**: Multi-session support with authentication and capability negotiation
- **Metrics & Monitoring**: Real-time performance metrics and health monitoring
- **tRPC API Integration**: Full exposure of MCP functionality via tRPC endpoints

### 1.2 Target Users

- AI Agent Developers building autonomous systems
- Integration Engineers connecting external AI services
- DevOps Teams managing tool execution pipelines
- Platform Administrators monitoring system health
- Backend Developers extending tool capabilities

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Fragmented Tool Access**: AI agents require consistent interfaces to diverse system capabilities (files, shell, web, database)
2. **No Standardized Protocol**: Lack of a unified communication protocol for AI-to-system interactions
3. **Security Concerns**: Uncontrolled access to system resources poses security risks
4. **Limited Observability**: No centralized metrics for tool execution and performance tracking
5. **Session Isolation**: Need for isolated sessions to prevent cross-contamination of agent contexts
6. **Extensibility Barriers**: Difficult to add new tools without modifying core systems

### 2.2 User Pain Points

- "I need a standard way for my AI agents to execute system commands safely"
- "There's no unified interface for file operations across different agent implementations"
- "I can't track which tools are being used and how often"
- "Adding new capabilities requires significant code changes"
- "Sessions don't maintain state properly between requests"
- "Security policies are inconsistent across different tool types"

### 2.3 Business Impact

| Problem | Impact |
|---------|--------|
| Fragmented tool access | 50% development time increase for new integrations |
| No protocol standardization | Incompatible AI agent implementations |
| Security vulnerabilities | Potential data breaches and system compromise |
| Limited observability | Difficult debugging, increased MTTR |
| Extensibility barriers | Slower feature velocity, technical debt |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Description | Priority |
|------|-------------|----------|
| **G1** | Implement MCP 2024.11.5 compliant protocol server | P0 |
| **G2** | Provide secure tool execution with whitelisting and sandboxing | P0 |
| **G3** | Enable real-time metrics and health monitoring | P1 |
| **G4** | Support extensible tool registration and discovery | P1 |
| **G5** | Expose full MCP functionality via tRPC API | P0 |

### 3.2 Success Metrics (KPIs)

#### Protocol Compliance Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| MCP Protocol Compliance | 100% | Automated protocol test suite |
| JSON-RPC 2.0 Compliance | 100% | Schema validation tests |
| Tool Registration Success | 100% | Registry validation |

#### Performance Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Tool Execution Latency (P95) | < 100ms | Internal metrics |
| Request Processing Time (P95) | < 50ms | Transport layer metrics |
| Session Creation Time | < 10ms | Server metrics |
| Concurrent Sessions | >= 100 | Load testing |

#### Reliability Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Tool Execution Success Rate | >= 99% | Registry metrics |
| Server Uptime | >= 99.9% | Health checks |
| Error Recovery Rate | >= 95% | Error handling tests |

#### Security Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Command Whitelist Compliance | 100% | Security audit |
| SQL Injection Prevention | 100% | Security testing |
| Input Validation Coverage | 100% | Code analysis |

---

## 4. User Stories

### 4.1 Core User Stories

#### US-001: Tool Discovery
**As an** AI agent developer
**I want to** discover available MCP tools programmatically
**So that** I can determine which capabilities are available for my agent

**Acceptance Criteria:**
- API returns complete list of registered tools
- Each tool includes name, description, and input schema
- Tool count is included in response
- Response time is < 100ms

#### US-002: Tool Execution via API
**As a** platform user
**I want to** execute MCP tools through the tRPC API
**So that** I can leverage system capabilities from my application

**Acceptance Criteria:**
- Tool name and arguments are accepted via API
- Execution results are returned with success status
- Error messages are clear and actionable
- Tool name format is validated (category/name)

#### US-003: File Operations
**As an** automation engineer
**I want to** perform file operations (read, write, list, delete) via MCP
**So that** I can manage files programmatically

**Acceptance Criteria:**
- Read files with configurable encoding (utf-8, base64, hex)
- Write files with automatic directory creation
- List directory contents with recursive option
- Delete files and directories safely
- File metadata (size, dates) is returned

#### US-004: Secure Shell Execution
**As a** DevOps engineer
**I want to** execute shell commands through a sandboxed interface
**So that** I can automate system tasks safely

**Acceptance Criteria:**
- Commands are validated against whitelist
- Dangerous patterns are blocked
- Timeout prevents runaway processes
- stdout, stderr, and exit code are captured
- Custom working directory is supported

#### US-005: Web Requests
**As an** integration developer
**I want to** make HTTP requests through MCP
**So that** I can interact with external APIs

**Acceptance Criteria:**
- Support GET, POST, PUT, DELETE, PATCH methods
- Custom headers can be specified
- Request timeout is configurable
- Response includes status, headers, and body
- HTML text extraction is available

#### US-006: Database Queries
**As a** data analyst
**I want to** execute read-only database queries via MCP
**So that** I can retrieve data programmatically

**Acceptance Criteria:**
- Only SELECT queries are allowed
- Query parameters prevent SQL injection
- Result limit is enforced
- Table and schema listing is available
- Execution time is tracked

### 4.2 Advanced User Stories

#### US-007: Server Health Monitoring
**As a** platform administrator
**I want to** monitor MCP server health and metrics
**So that** I can ensure system reliability

**Acceptance Criteria:**
- Health status endpoint returns server state
- Metrics include request counts, success rates, response times
- Active session count is tracked
- Tool invocation counts are available
- Last reset timestamp is provided

#### US-008: Session Management
**As an** AI agent
**I want to** establish and maintain MCP sessions
**So that** I can perform authenticated multi-request workflows

**Acceptance Criteria:**
- Session is created on initialize request
- Session ID is unique and tracked
- Client info and capabilities are stored
- Session activity timestamp is updated
- Session can be terminated cleanly

#### US-009: Custom Tool Registration
**As a** platform developer
**I want to** register custom tools with the MCP server
**So that** I can extend system capabilities

**Acceptance Criteria:**
- Tools require name, description, schema, and handler
- Name must follow category/name format
- Tool events are emitted on registration
- Duplicate registration is prevented
- Tool can be unregistered dynamically

#### US-010: Multi-Transport Support
**As an** integration architect
**I want to** connect via different transport protocols
**So that** I can integrate MCP in various environments

**Acceptance Criteria:**
- HTTP transport handles web requests
- Stdio transport handles CLI integration
- Transport health status is available
- Request handler can be attached to any transport

---

## 5. Functional Requirements

### 5.1 MCP Protocol Server

#### FR-001: Protocol Implementation
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Implement JSON-RPC 2.0 request/response format | P0 |
| FR-001.2 | Support MCP protocol version 2024.11.5 | P0 |
| FR-001.3 | Handle initialize, ping, tools/list, tools/call methods | P0 |
| FR-001.4 | Return proper MCP error codes (-32700 to -32001) | P0 |
| FR-001.5 | Track request metrics (total, successful, failed) | P1 |

#### FR-002: Server Capabilities
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Advertise tools.listChanged capability | P0 |
| FR-002.2 | Support logging at info level | P1 |
| FR-002.3 | Return server info (name, version) on initialize | P0 |
| FR-002.4 | Provide instruction string for connected clients | P1 |

### 5.2 Session Management

#### FR-003: Session Lifecycle
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Create session on initialize request | P0 |
| FR-003.2 | Generate unique session ID with timestamp | P0 |
| FR-003.3 | Store client info and protocol version | P0 |
| FR-003.4 | Track session creation and last activity timestamps | P0 |
| FR-003.5 | Support session timeout configuration | P1 |
| FR-003.6 | Support maximum session limits | P2 |

#### FR-004: Session Validation
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Require session initialization before tool calls | P0 |
| FR-004.2 | Return SERVER_NOT_INITIALIZED error for uninit requests | P0 |
| FR-004.3 | Update lastActivity on each request | P1 |

### 5.3 Tool Registry

#### FR-005: Tool Registration
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Register tools with name, description, schema, handler | P0 |
| FR-005.2 | Validate tool name format (category/name) | P0 |
| FR-005.3 | Prevent duplicate tool registration | P0 |
| FR-005.4 | Support optional tool metadata (version, tags, permissions) | P1 |
| FR-005.5 | Emit toolRegistered event on registration | P1 |

#### FR-006: Tool Discovery
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | List all registered tools with schemas | P0 |
| FR-006.2 | Filter tools by category | P1 |
| FR-006.3 | Return tool count in responses | P0 |
| FR-006.4 | Get individual tool by name | P1 |

#### FR-007: Tool Execution
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | Execute tool handler with validated input | P0 |
| FR-007.2 | Track execution metrics (invocations, time, success) | P0 |
| FR-007.3 | Emit toolExecuted event with results | P1 |
| FR-007.4 | Handle execution errors gracefully | P0 |
| FR-007.5 | Validate input against tool schema | P0 |

### 5.4 File Tools

#### FR-008: File Read
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | Read file contents with path parameter | P0 |
| FR-008.2 | Support utf-8, base64, hex encodings | P0 |
| FR-008.3 | Return file content, size, and encoding | P0 |
| FR-008.4 | Handle file not found errors | P0 |

#### FR-009: File Write
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009.1 | Write content to specified file path | P0 |
| FR-009.2 | Create parent directories automatically | P0 |
| FR-009.3 | Support encoding selection | P0 |
| FR-009.4 | Return file metadata after write | P0 |

#### FR-010: Directory Operations
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-010.1 | List directory contents with file metadata | P0 |
| FR-010.2 | Support recursive listing | P0 |
| FR-010.3 | Filter hidden files optionally | P1 |
| FR-010.4 | Return file type (file/directory) | P0 |

#### FR-011: File Deletion
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-011.1 | Delete files by path | P0 |
| FR-011.2 | Support recursive directory deletion | P0 |
| FR-011.3 | Confirm deletion in response | P0 |

### 5.5 Shell Tools

#### FR-012: Command Execution
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-012.1 | Execute whitelisted shell commands | P0 |
| FR-012.2 | Support custom working directory | P0 |
| FR-012.3 | Configure execution timeout (default: 30s) | P0 |
| FR-012.4 | Pass additional environment variables | P1 |
| FR-012.5 | Capture stdout, stderr, exit code | P0 |
| FR-012.6 | Track execution time | P0 |

#### FR-013: Command Security
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-013.1 | Whitelist allowed commands (ls, pwd, echo, cat, grep, find, wc, sort, uniq, head, tail, git, npm, node, pnpm, yarn) | P0 |
| FR-013.2 | Block dangerous patterns (rm -rf, sudo, chmod, chown, kill, pkill) | P0 |
| FR-013.3 | Block command chaining (;, &&, ||) | P0 |
| FR-013.4 | Block background execution (&) | P0 |
| FR-013.5 | Block device writes (>/dev/) | P0 |

### 5.6 Web Tools

#### FR-014: HTTP Requests
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-014.1 | Support GET, POST, PUT, DELETE, PATCH methods | P0 |
| FR-014.2 | Accept custom headers | P0 |
| FR-014.3 | Support request body for POST/PUT/PATCH | P0 |
| FR-014.4 | Configure request timeout | P0 |
| FR-014.5 | Return status code, headers, body, execution time | P0 |
| FR-014.6 | Include User-Agent header (GHL-Agency-AI-MCP/1.0) | P0 |

#### FR-015: Web Page Fetching
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-015.1 | Fetch webpage content by URL | P0 |
| FR-015.2 | Extract text from HTML (remove scripts, styles, tags) | P1 |
| FR-015.3 | Return content type and size | P0 |

### 5.7 Database Tools

#### FR-016: Query Execution
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-016.1 | Execute parameterized SELECT queries only | P0 |
| FR-016.2 | Enforce result limit (default: 100 rows) | P0 |
| FR-016.3 | Prevent multiple statements | P0 |
| FR-016.4 | Return rows, row count, execution time | P0 |

#### FR-017: Schema Discovery
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-017.1 | List all tables in specified schema | P0 |
| FR-017.2 | Get column details for specific table | P0 |
| FR-017.3 | Default to public schema | P0 |
| FR-017.4 | Return column types, nullability, defaults | P0 |

### 5.8 tRPC API Integration

#### FR-018: API Endpoints
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-018.1 | status: Get server health and metrics | P0 |
| FR-018.2 | listTools: List all available tools | P0 |
| FR-018.3 | executeTool: Execute tool by name with arguments | P0 |
| FR-018.4 | file.read/write/list: Direct file operations | P0 |
| FR-018.5 | shell.execute: Direct shell command execution | P0 |
| FR-018.6 | web.request/fetch: Direct HTTP operations | P0 |
| FR-018.7 | database.query/tables/schema: Direct database operations | P0 |

#### FR-019: API Security
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-019.1 | All endpoints require authentication (protectedProcedure) | P0 |
| FR-019.2 | Validate inputs with Zod schemas | P0 |
| FR-019.3 | Return TRPCError with appropriate codes | P0 |

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-001 | Tool execution latency (P95) | < 100ms | P0 |
| NFR-002 | Request processing overhead | < 10ms | P0 |
| NFR-003 | Tool listing response time | < 50ms | P1 |
| NFR-004 | Concurrent session capacity | >= 100 | P1 |
| NFR-005 | Maximum buffer size for shell output | 10MB | P1 |
| NFR-006 | Database query connection pool | Via shared pool | P0 |

### 6.2 Scalability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-007 | Tool registry capacity | 1000+ tools | P1 |
| NFR-008 | Session storage | In-memory Map | P1 |
| NFR-009 | Metric tracking | Per-tool granularity | P1 |
| NFR-010 | Transport modularity | Plugin architecture | P2 |

### 6.3 Reliability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-011 | Server availability | 99.9% uptime | P0 |
| NFR-012 | Error recovery | Graceful degradation | P0 |
| NFR-013 | Session persistence | Across requests | P0 |
| NFR-014 | Tool registration idempotency | No duplicate errors | P1 |

### 6.4 Security Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-015 | All tRPC endpoints require authentication | P0 |
| NFR-016 | Shell commands validated against whitelist | P0 |
| NFR-017 | Database queries restricted to SELECT | P0 |
| NFR-018 | Input validation on all tool parameters | P0 |
| NFR-019 | No sensitive data in error messages | P0 |
| NFR-020 | Command injection prevention | P0 |
| NFR-021 | SQL injection prevention via parameterization | P0 |
| NFR-022 | Path traversal prevention for file operations | P1 |

### 6.5 Observability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-023 | Request/response logging with IDs | P0 |
| NFR-024 | Tool execution metrics (count, time, success) | P0 |
| NFR-025 | Server health status endpoint | P0 |
| NFR-026 | Error tracking with context | P0 |
| NFR-027 | Event emission for tool lifecycle | P1 |

### 6.6 Maintainability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-028 | TypeScript strict mode | P0 |
| NFR-029 | Modular tool organization (tools directory) | P0 |
| NFR-030 | Clear separation of concerns (transport, registry, server) | P0 |
| NFR-031 | Extensible tool registration interface | P0 |
| NFR-032 | Comprehensive error types | P0 |

---

## 7. Technical Architecture

### 7.1 System Overview

```
+------------------------------------------------------------------+
|                        Client Applications                         |
|     (AI Agents, Web UI, CLI Tools, External Services)             |
+--------------------------------+----------------------------------+
                                 |
                                 | tRPC / JSON-RPC
                                 v
+------------------------------------------------------------------+
|                       tRPC Router Layer                           |
|  +-----------+  +----------+  +--------+  +-----------+           |
|  | mcp.status|  |listTools |  |executeTool|  |file.*  |          |
|  +-----------+  +----------+  +--------+  +-----------+           |
|  +-----------+  +----------+  +---------------+                   |
|  | shell.*   |  | web.*    |  | database.*    |                   |
|  +-----------+  +----------+  +---------------+                   |
+--------------------------------+----------------------------------+
                                 |
                                 v
+------------------------------------------------------------------+
|                         MCP Server Core                           |
|  +--------------------+  +--------------------+                   |
|  |   MCPServer        |  |   ToolRegistry     |                   |
|  |  - handleRequest() |  |  - register()      |                   |
|  |  - handleInitialize|  |  - executeTool()   |                   |
|  |  - handleToolCall()|  |  - listTools()     |                   |
|  |  - getMetrics()    |  |  - getMetrics()    |                   |
|  +--------------------+  +--------------------+                   |
|                                                                   |
|  +--------------------+  +--------------------+                   |
|  |   Session Manager  |  |   Error Handler    |                   |
|  |  - create/destroy  |  |  - MCPError        |                   |
|  |  - validation      |  |  - MethodNotFound  |                   |
|  |  - tracking        |  |  - InvalidParams   |                   |
|  +--------------------+  +--------------------+                   |
+--------------------------------+----------------------------------+
                                 |
                                 v
+------------------------------------------------------------------+
|                       Transport Layer                             |
|  +--------------------+  +--------------------+                   |
|  |   HttpTransport    |  |   StdioTransport   |                   |
|  |  - HTTP requests   |  |  - stdin/stdout    |                   |
|  |  - REST-style      |  |  - CLI integration |                   |
|  +--------------------+  +--------------------+                   |
+------------------------------------------------------------------+
                                 |
                                 v
+------------------------------------------------------------------+
|                        Tool Categories                            |
|  +----------+  +----------+  +----------+  +----------+          |
|  | file/*   |  | shell/*  |  | web/*    |  |database/*|          |
|  |  - read  |  |  -execute|  |  -request|  |  - query |          |
|  |  - write |  |          |  |  - fetch |  |  - tables|          |
|  |  - list  |  |          |  |          |  |  - schema|          |
|  |  - delete|  |          |  |          |  |          |          |
|  +----------+  +----------+  +----------+  +----------+          |
+------------------------------------------------------------------+
                                 |
                                 v
+------------------------------------------------------------------+
|                     External Systems                              |
|  +-------------+  +-------------+  +-------------+               |
|  | File System |  | Shell/OS    |  | PostgreSQL  |               |
|  +-------------+  +-------------+  +-------------+               |
|  +-------------+                                                  |
|  | HTTP APIs   |                                                  |
|  +-------------+                                                  |
+------------------------------------------------------------------+
```

### 7.2 Component Details

#### 7.2.1 MCPServer (`server.ts`)
The core protocol server handling all MCP operations.

**Key Responsibilities:**
- Protocol version negotiation (2024.11.5)
- Session management and validation
- Request routing (initialize, tools/list, tools/call, ping)
- Metrics collection and reporting
- Error handling and response formatting

**Server Capabilities:**
```typescript
serverCapabilities: MCPCapabilities = {
  logging: { level: 'info' },
  tools: { listChanged: true },
  resources: { listChanged: false, subscribe: false },
  prompts: { listChanged: false },
}
```

**Built-in Tools:**
- `system/info`: System information (platform, arch, uptime)
- `system/health`: Server health status
- `system/tools`: List all available tools

#### 7.2.2 ToolRegistry (`registry.ts`)
Manages tool registration, discovery, and execution.

**Key Features:**
- Tool validation (name format, schema, handler)
- Category-based organization
- Execution metrics per tool
- Event emission for tool lifecycle
- Input validation against schemas

**Metrics Tracked:**
```typescript
interface ToolExecutionMetrics {
  totalInvocations: number;
  successfulInvocations: number;
  failedInvocations: number;
  averageExecutionTime: number;
  lastInvoked?: Date;
}
```

#### 7.2.3 Transport Layer (`transport.ts`)
Pluggable transport implementations for protocol communication.

**HttpTransport:**
- Integrates with Express/Next.js server
- REST-style request handling
- Health status reporting

**StdioTransport:**
- Line-delimited JSON-RPC messages
- stdin reading with buffering
- stdout response writing
- CLI tool integration

#### 7.2.4 Tool Categories

**File Tools (`tools/file.ts`):**
- `file/read`: Read file contents
- `file/write`: Write content to files
- `file/list`: List directory contents
- `file/delete`: Delete files/directories

**Shell Tools (`tools/shell.ts`):**
- `shell/execute`: Execute sandboxed commands
- Whitelist: ls, pwd, echo, cat, grep, find, wc, sort, uniq, head, tail, git, npm, node, pnpm, yarn
- Blocked patterns: rm -rf, sudo, chmod, chown, kill, pkill, command chaining

**Web Tools (`tools/web.ts`):**
- `web/request`: HTTP requests with full control
- `web/fetch`: Webpage fetching with text extraction

**Database Tools (`tools/database.ts`):**
- `database/query`: Read-only SELECT queries
- `database/tables`: List tables in schema
- `database/schema`: Get table column details

### 7.3 Data Flow

#### Tool Execution Flow
```
1. Client sends tRPC request to mcp.executeTool
                    |
2. Router validates input (Zod schema)
                    |
3. Router gets MCP server singleton
                    |
4. Server retrieves tool registry
                    |
5. Registry validates tool exists
                    |
6. Registry validates input against tool schema
                    |
7. Registry executes tool handler
                    |
8. Handler performs operation (file/shell/web/db)
                    |
9. Registry updates execution metrics
                    |
10. Registry emits toolExecuted event
                    |
11. Result returned through chain to client
```

### 7.4 Type Definitions

#### Core Protocol Types
```typescript
interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: unknown;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: MCPError;
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (input: unknown, context?: MCPContext) => Promise<unknown>;
}

interface MCPSession {
  id: string;
  transport: 'stdio' | 'http' | 'websocket';
  isInitialized: boolean;
  clientInfo?: MCPClientInfo;
  protocolVersion?: MCPProtocolVersion;
  capabilities?: MCPCapabilities;
  createdAt: Date;
  lastActivity: Date;
  isAuthenticated?: boolean;
}
```

#### Configuration Types
```typescript
interface MCPConfig {
  transport: 'stdio' | 'http' | 'websocket';
  host?: string;
  port?: number;
  tlsEnabled?: boolean;
  enableMetrics?: boolean;
  auth?: {
    enabled: boolean;
    method: 'token' | 'jwt' | 'oauth';
    secretKey?: string;
  };
  loadBalancer?: {
    enabled: boolean;
    maxRequestsPerSecond?: number;
    maxConcurrentRequests?: number;
  };
  sessionTimeout?: number;
  maxSessions?: number;
}
```

### 7.5 Error Handling

```typescript
enum MCPErrorCode {
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  SERVER_NOT_INITIALIZED = -32002,
  UNKNOWN_ERROR_CODE = -32001,
}

// Error Classes
class MCPError extends Error { code: number; details?: unknown }
class MCPMethodNotFoundError extends MCPError { /* -32601 */ }
class MCPInvalidParamsError extends MCPError { /* -32602 */ }
class MCPNotInitializedError extends MCPError { /* -32002 */ }
class MCPParseError extends MCPError { /* -32700 */ }
```

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| tRPC Core | `server/_core/trpc.ts` | API router framework |
| Database Pool | `server/db/index.ts` | PostgreSQL connection pool |
| Environment Config | Process env | Configuration values |

### 8.2 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| @trpc/server | ^11.x | API framework |
| zod | ^3.x | Schema validation |
| axios | ^1.x | HTTP client for web tools |
| child_process | Node.js built-in | Shell execution |
| fs/promises | Node.js built-in | File operations |
| events | Node.js built-in | Event emission |

### 8.3 Environment Variables

```bash
# MCP Server Configuration
MCP_HOST=0.0.0.0              # Server bind address
MCP_PORT=3001                 # Server port
MCP_TRANSPORT=http            # Transport type

# Database (required for database tools)
DATABASE_URL=                 # PostgreSQL connection string
```

---

## 9. Out of Scope

### 9.1 Excluded from Current Release

| Item | Reason | Future Consideration |
|------|--------|---------------------|
| WebSocket transport | Lower priority transport | v1.5 |
| Resource subscriptions | Protocol feature not needed | v2.0 |
| Prompt templates | Protocol feature not needed | v2.0 |
| OAuth authentication | Basic auth sufficient | v1.5 |
| Tool versioning | Single version initially | v1.5 |
| Rate limiting | Platform-level handling | v1.5 |
| Audit logging to database | Basic console logging first | v1.5 |
| Custom tool plugins | Extension mechanism | v2.0 |
| Tool sandboxing (Docker) | OS-level sandboxing later | v2.0 |
| Multi-tenant tool isolation | Single-tenant first | v2.0 |

### 9.2 Technical Limitations

| Limitation | Description | Workaround |
|------------|-------------|------------|
| Shell whitelist | Only specific commands allowed | Add commands to whitelist |
| Database queries | SELECT only | Use direct DB access for writes |
| Session storage | In-memory only | Redis for distributed sessions |
| File paths | No traversal prevention | Implement path normalization |
| HTTP proxy | No proxy support | Add proxy configuration |

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Command injection | Low | Critical | Strict whitelist, pattern blocking |
| SQL injection | Low | Critical | Parameterized queries, SELECT only |
| Path traversal | Medium | High | Normalize paths, restrict directories |
| Memory exhaustion (sessions) | Medium | Medium | Session limits, TTL |
| Shell timeout bypass | Low | Medium | Process kill on timeout |

### 10.2 Security Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Unauthorized tool access | Low | High | tRPC authentication required |
| Sensitive data exposure | Medium | High | Error message sanitization |
| API key leakage | Low | Critical | Environment variables only |
| Session hijacking | Low | High | Session validation per request |

### 10.3 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Tool registration conflicts | Medium | Low | Duplicate prevention |
| Metrics overflow | Low | Low | Periodic reset capability |
| Transport failure | Low | Medium | Health monitoring, restart |
| Database pool exhaustion | Medium | High | Shared pool, connection limits |

### 10.4 Integration Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Protocol version mismatch | Low | Medium | Version negotiation |
| Schema validation failures | Medium | Low | Clear error messages |
| Tool discovery issues | Low | Low | Comprehensive tool listing |

---

## 11. Milestones & Timeline

### 11.1 Phase 1: Core Infrastructure (Weeks 1-2)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M1.1 | MCP types and error definitions | Week 1 |
| M1.2 | Transport layer (HTTP, stdio) | Week 1 |
| M1.3 | Tool registry implementation | Week 2 |
| M1.4 | MCP server core | Week 2 |

**Exit Criteria:**
- [ ] JSON-RPC 2.0 request/response working
- [ ] Tools can be registered and listed
- [ ] Session management functional
- [ ] Basic metrics collection active

### 11.2 Phase 2: Built-in Tools (Weeks 3-4)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M2.1 | File tools (read, write, list, delete) | Week 3 |
| M2.2 | Shell tools with security | Week 3 |
| M2.3 | Web tools (request, fetch) | Week 4 |
| M2.4 | Database tools (query, tables, schema) | Week 4 |

**Exit Criteria:**
- [ ] All file operations work correctly
- [ ] Shell commands execute safely
- [ ] HTTP requests complete successfully
- [ ] Database queries return results

### 11.3 Phase 3: tRPC Integration (Weeks 5-6)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M3.1 | MCP router setup | Week 5 |
| M3.2 | Status and tool listing endpoints | Week 5 |
| M3.3 | Direct tool endpoints (file, shell, web, db) | Week 6 |
| M3.4 | Execute tool generic endpoint | Week 6 |

**Exit Criteria:**
- [ ] All endpoints return correct responses
- [ ] Authentication enforced on all endpoints
- [ ] Error handling consistent
- [ ] Input validation working

### 11.4 Phase 4: Testing & Hardening (Weeks 7-8)

| Milestone | Deliverables | Target Date |
|-----------|--------------|-------------|
| M4.1 | Unit tests for all components | Week 7 |
| M4.2 | Security testing (injection, traversal) | Week 7 |
| M4.3 | Performance testing | Week 8 |
| M4.4 | Documentation and examples | Week 8 |

**Exit Criteria:**
- [ ] Test coverage >= 80%
- [ ] No critical security vulnerabilities
- [ ] Performance targets met
- [ ] API documentation complete

---

## 12. Acceptance Criteria

### 12.1 Feature-Level Acceptance

#### AC-001: Protocol Compliance
- [ ] JSON-RPC 2.0 requests are parsed correctly
- [ ] Responses include required fields (jsonrpc, id, result/error)
- [ ] MCP protocol version 2024.11.5 is supported
- [ ] Error codes match MCP specification

#### AC-002: Tool Registry
- [ ] Tools register with name, description, schema, handler
- [ ] Duplicate registration is prevented
- [ ] Tool listing returns all registered tools
- [ ] Tool execution validates input against schema
- [ ] Execution metrics are tracked accurately

#### AC-003: Session Management
- [ ] Sessions are created on initialize request
- [ ] Uninitialized sessions cannot execute tools
- [ ] Session IDs are unique
- [ ] Session activity is tracked

#### AC-004: File Operations
- [ ] Files are read with correct encoding
- [ ] Files are written with directory creation
- [ ] Directories are listed recursively
- [ ] Files and directories are deleted safely

#### AC-005: Shell Execution
- [ ] Whitelisted commands execute successfully
- [ ] Blocked commands are rejected
- [ ] Timeouts are enforced
- [ ] stdout/stderr/exitCode are captured

#### AC-006: Web Operations
- [ ] HTTP methods (GET, POST, PUT, DELETE, PATCH) work
- [ ] Custom headers are sent
- [ ] Response includes status, headers, body
- [ ] Text extraction from HTML works

#### AC-007: Database Operations
- [ ] SELECT queries execute successfully
- [ ] Non-SELECT queries are rejected
- [ ] Query parameters prevent injection
- [ ] Table and schema listing works

#### AC-008: tRPC API
- [ ] All endpoints require authentication
- [ ] Input validation prevents invalid data
- [ ] Errors are returned as TRPCError
- [ ] Response format is consistent

### 12.2 Integration Acceptance

- [ ] MCP server starts with application
- [ ] Singleton pattern prevents multiple instances
- [ ] Health status reflects actual server state
- [ ] Metrics are accurate across requests

### 12.3 Quality Acceptance

- [ ] Unit test coverage >= 80%
- [ ] No critical security vulnerabilities
- [ ] Performance targets met (P95 < 100ms for tool execution)
- [ ] TypeScript strict mode passes
- [ ] Documentation is complete

---

## Appendix A: API Reference

### A.1 MCP Router Endpoints

| Endpoint | Method | Input Schema | Response |
|----------|--------|--------------|----------|
| `mcp.status` | query | - | HealthStatus |
| `mcp.listTools` | query | - | ToolList |
| `mcp.executeTool` | mutation | { name: string, arguments?: object } | ExecutionResult |
| `mcp.file.read` | query | { path: string, encoding?: string } | FileContent |
| `mcp.file.write` | mutation | { path: string, content: string, ... } | FileMetadata |
| `mcp.file.list` | query | { path: string, recursive?: boolean, ... } | DirectoryListing |
| `mcp.shell.execute` | mutation | { command: string, cwd?: string, ... } | ShellResult |
| `mcp.web.request` | mutation | { url: string, method?: string, ... } | HttpResponse |
| `mcp.web.fetch` | query | { url: string, extractText?: boolean, ... } | PageContent |
| `mcp.database.query` | mutation | { query: string, params?: array, ... } | QueryResult |
| `mcp.database.tables` | query | { schema?: string } | TableList |
| `mcp.database.schema` | query | { table: string, schema?: string } | TableSchema |

### A.2 MCP Protocol Methods

| Method | Description | Request Params | Response |
|--------|-------------|----------------|----------|
| `initialize` | Initialize session | MCPInitializeParams | MCPInitializeResult |
| `ping` | Health check | - | { status: 'pong' } |
| `tools/list` | List tools | - | { tools: MCPTool[] } |
| `tools/call` | Execute tool | { name: string, arguments: object } | ToolCallResponse |

---

## Appendix B: Tool Schemas

### B.1 File Tools

```typescript
// file/read
{
  path: string;           // Required
  encoding?: 'utf-8' | 'base64' | 'hex';
}

// file/write
{
  path: string;           // Required
  content: string;        // Required
  encoding?: 'utf-8' | 'base64' | 'hex';
  createDirectories?: boolean;
}

// file/list
{
  path: string;           // Required
  recursive?: boolean;
  includeHidden?: boolean;
}

// file/delete
{
  path: string;           // Required
  recursive?: boolean;
}
```

### B.2 Shell Tools

```typescript
// shell/execute
{
  command: string;        // Required, must be whitelisted
  cwd?: string;
  timeout?: number;       // Default: 30000ms
  env?: Record<string, string>;
}
```

### B.3 Web Tools

```typescript
// web/request
{
  url: string;            // Required
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;       // Default: 30000ms
}

// web/fetch
{
  url: string;            // Required
  extractText?: boolean;  // Default: true
  timeout?: number;       // Default: 30000ms
}
```

### B.4 Database Tools

```typescript
// database/query
{
  query: string;          // Required, SELECT only
  params?: unknown[];
  limit?: number;         // Default: 100
}

// database/tables
{
  schema?: string;        // Default: 'public'
}

// database/schema
{
  table: string;          // Required
  schema?: string;        // Default: 'public'
}
```

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **JSON-RPC 2.0** | Lightweight remote procedure call protocol using JSON |
| **MCP** | Model Context Protocol - standardized AI model communication protocol |
| **Tool** | A callable function with defined schema and handler |
| **Transport** | Communication layer (HTTP, stdio, WebSocket) |
| **Registry** | Centralized tool management system |
| **Session** | An authenticated client connection with state |
| **Whitelist** | List of allowed commands for security |
| **Sandboxing** | Isolated execution environment |
| **tRPC** | TypeScript RPC framework for type-safe APIs |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Development Team | Initial PRD creation |

---

**Document Status:** Ready for Review
**Next Review:** 2026-01-18
**Stakeholders:** Engineering, Platform, Security
