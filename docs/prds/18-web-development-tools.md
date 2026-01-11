# PRD-18: Web Development Tools

**Product Requirements Document**

| Field | Value |
|-------|-------|
| **Document ID** | PRD-18 |
| **Feature Name** | Web Development Tools |
| **Version** | 1.0 |
| **Status** | Draft |
| **Author** | Engineering Team |
| **Created** | 2026-01-11 |
| **Last Updated** | 2026-01-11 |
| **Priority** | High |
| **Target Release** | v2.3 |
| **Feature Location** | `server/api/routers/webdev.ts` |

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

### 1.1 Executive Summary

The Web Development Tools feature provides a comprehensive integrated development environment (IDE) within Bottleneck-Bots, enabling users to create, manage, and deploy web applications directly from the platform. The system includes a website builder with AI-powered code generation, multi-framework scaffolding (React, Vue, Next.js, static), real-time development servers with hot module replacement (HMR), version control through checkpoints, template management, and seamless deployment orchestration via Vercel integration. This feature transforms Bottleneck-Bots from an automation platform into a full-stack development solution for agencies and businesses.

### 1.2 Background

Digital agencies and businesses increasingly need rapid web development capabilities to:
- Create client landing pages and microsites quickly
- Build custom internal tools and dashboards
- Prototype and deploy MVPs for new ideas
- Maintain multiple client websites with consistent quality

Current challenges include:
- Fragmented tooling requiring expertise across multiple platforms
- High barrier to entry for non-technical team members
- Slow development cycles due to context switching
- Lack of AI-assisted code generation in traditional IDEs
- Complex deployment pipelines requiring DevOps knowledge
- No integration between automation workflows and web development

The Web Development Tools feature addresses these challenges by providing:
1. Unified project management with in-browser development
2. AI-powered code generation using Claude
3. Multi-framework support with instant scaffolding
4. Integrated dev servers with live preview
5. One-click deployment to production
6. Version control via checkpoints for safe experimentation

### 1.3 Key Capabilities

- **Project Management**: Create, list, update, and delete web development projects with full lifecycle management
- **Multi-Framework Support**: Scaffold projects using React, Vue, Next.js, or static HTML/CSS/JS
- **File Operations**: Read, write, list, and organize project files with tree-view visualization
- **Dev Server Management**: Start, stop, and monitor Vite development servers with HMR support
- **AI Code Generation**: Generate components, pages, and complete features using Claude AI
- **Template Management**: Apply pre-built templates (auth pages, dashboards, landing pages)
- **Version Control**: Save checkpoints, list history, and rollback to previous versions
- **Deployment Orchestration**: Build, deploy, and manage deployments via Vercel integration
- **Custom Domains**: Configure and manage custom domains for deployed projects
- **Environment Variables**: Secure management of deployment configuration

### 1.4 Target Users

- **Agency Owners**: Rapidly building client websites and landing pages
- **Marketing Teams**: Creating campaign-specific microsites without developer involvement
- **Product Managers**: Prototyping features and creating MVPs for validation
- **Automation Engineers**: Building custom dashboards to visualize automation results
- **Developers**: Accelerating development with AI-assisted code generation
- **Business Owners**: Creating internal tools and customer-facing applications

---

## 2. Problem Statement

### 2.1 Current Pain Points

| Pain Point | Impact | Affected Users |
|------------|--------|----------------|
| **Fragmented Development Workflow** | Context switching between multiple tools wastes time | All users |
| **High Technical Barrier** | Non-developers cannot create web applications | Marketing, PMs |
| **Slow Prototyping** | Manual setup for each new project delays development | Agencies, Developers |
| **Complex Deployment** | DevOps expertise required for production deployment | All users |
| **No AI Assistance** | Manual coding for all features without intelligent help | Developers |
| **Version Control Complexity** | Git expertise required for safe experimentation | Non-technical users |
| **Template Management** | No centralized system for reusable components | Agencies |
| **Environment Configuration** | Manual environment variable management across environments | DevOps |

### 2.2 User Needs

1. **Agency Owners** need to quickly spin up client websites without hiring additional developers
2. **Marketing Teams** need to create landing pages for campaigns without waiting for development resources
3. **Product Managers** need to prototype and validate ideas before committing development resources
4. **Automation Engineers** need to build custom UIs for automation workflows and dashboards
5. **Developers** need AI assistance to accelerate coding and reduce boilerplate
6. **Business Owners** need self-service website creation with professional results

### 2.3 Business Drivers

- **Revenue Growth**: Premium feature for agencies willing to pay for integrated development
- **User Retention**: Comprehensive tooling creates platform stickiness
- **Competitive Advantage**: AI-powered development differentiates from traditional website builders
- **Efficiency Gains**: 10x faster development compared to traditional workflows
- **Market Expansion**: Opens new market segment of non-technical website creators
- **Platform Integration**: Synergy with existing automation and AI agent capabilities

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Description | Target |
|------|-------------|--------|
| **G1** | Enable project creation with automatic scaffolding | <10 seconds per project |
| **G2** | Provide seamless AI code generation | >90% code quality satisfaction |
| **G3** | Support multi-framework development | 4 frameworks (React, Vue, Next.js, static) |
| **G4** | Enable real-time development with hot reload | <500ms HMR response |
| **G5** | Provide one-click deployment | <5 minutes to production |
| **G6** | Ensure reliable version control | 100% checkpoint integrity |

### 3.2 Success Metrics

#### 3.2.1 Quantitative Metrics

| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| **Project Creation Time** | N/A | <10 seconds | End-to-end timing |
| **Dev Server Start Time** | N/A | <5 seconds | Server boot timing |
| **HMR Response Time** | N/A | <500ms | File change to reload |
| **AI Generation Quality** | N/A | >90% acceptance rate | User feedback |
| **Deployment Success Rate** | N/A | >99% | Deployment monitoring |
| **Feature Adoption** | 0% | 60% of active users | Analytics |
| **Projects Created/User** | 0 | 5+ avg | Database metrics |
| **User Satisfaction** | N/A | >4.5/5 | NPS surveys |

#### 3.2.2 Qualitative Metrics

- User satisfaction with development workflow
- Perceived quality of AI-generated code
- Ease of deployment process
- Template usefulness and coverage
- Version control reliability

### 3.3 Key Performance Indicators (KPIs)

1. **Daily Active Projects**: Number of projects with dev server activity
2. **Code Generation Requests**: Volume of AI generation calls per day
3. **Deployment Frequency**: Deployments per project per week
4. **Checkpoint Usage**: Average checkpoints per project
5. **Template Adoption**: Most popular templates by usage
6. **Time to First Deployment**: Average time from project creation to live deployment

---

## 4. User Stories

### 4.1 Project Management Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-01 | Agency Owner | As an agency owner, I want to create a new React project so that I can build a client website | P0 |
| US-02 | Developer | As a developer, I want to list all my projects so that I can manage multiple client sites | P0 |
| US-03 | Agency Owner | As an agency owner, I want to view project details including all files so that I understand the project state | P0 |
| US-04 | Developer | As a developer, I want to delete projects I no longer need so that I can keep my workspace clean | P0 |
| US-05 | Product Manager | As a product manager, I want to choose from multiple tech stacks so that I can pick the right tool for each project | P1 |
| US-06 | Agency Owner | As an agency owner, I want project features (auth, stripe, database) scaffolded automatically | P1 |

### 4.2 File Operations Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-07 | Developer | As a developer, I want to read file contents so that I can view and edit code | P0 |
| US-08 | Developer | As a developer, I want to write file contents so that I can save my code changes | P0 |
| US-09 | Developer | As a developer, I want to list all files in a tree structure so that I can navigate the project | P0 |
| US-10 | Developer | As a developer, I want file writes to trigger hot reload so that I see changes immediately | P0 |
| US-11 | Agency Owner | As an agency owner, I want to create directories to organize project files | P1 |
| US-12 | Developer | As a developer, I want to delete files that are no longer needed | P1 |

### 4.3 Dev Server Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-13 | Developer | As a developer, I want to start a dev server so that I can preview my project | P0 |
| US-14 | Developer | As a developer, I want to stop the dev server so that I can free resources | P0 |
| US-15 | Developer | As a developer, I want to check dev server status so that I know if it's running | P0 |
| US-16 | Developer | As a developer, I want to configure dev server port so that I can avoid conflicts | P1 |
| US-17 | Developer | As a developer, I want hot module replacement so that I see changes without full reload | P1 |
| US-18 | Agency Owner | As an agency owner, I want a preview URL so that I can share progress with clients | P1 |

### 4.4 AI Code Generation Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-19 | Developer | As a developer, I want to generate code from natural language prompts | P0 |
| US-20 | Developer | As a developer, I want AI to modify existing files based on instructions | P0 |
| US-21 | Agency Owner | As an agency owner, I want generated code to match my project's tech stack | P0 |
| US-22 | Developer | As a developer, I want to see what dependencies are needed for generated code | P1 |
| US-23 | Developer | As a developer, I want to choose whether to auto-apply generated code | P1 |
| US-24 | Agency Owner | As an agency owner, I want AI to generate complete features with multiple files | P2 |

### 4.5 Template Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-25 | Agency Owner | As an agency owner, I want to apply pre-built templates to speed up development | P1 |
| US-26 | Developer | As a developer, I want an auth page template so that I can quickly add login functionality | P1 |
| US-27 | Developer | As a developer, I want a dashboard template so that I can create admin interfaces | P1 |
| US-28 | Marketing Team | As a marketer, I want a landing page template so that I can create campaign pages | P1 |
| US-29 | Agency Owner | As an agency owner, I want to create custom templates from existing projects | P2 |
| US-30 | Agency Owner | As an agency owner, I want to share templates across my team | P2 |

### 4.6 Version Control Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-31 | Developer | As a developer, I want to save checkpoints so that I can preserve working states | P0 |
| US-32 | Developer | As a developer, I want to list all checkpoints so that I can see my project history | P0 |
| US-33 | Developer | As a developer, I want to rollback to a previous checkpoint so that I can undo changes | P0 |
| US-34 | Developer | As a developer, I want checkpoint descriptions so that I know what each version contains | P1 |
| US-35 | Agency Owner | As an agency owner, I want the dev server to restart after rollback | P1 |
| US-36 | Developer | As a developer, I want to compare checkpoints to see what changed | P2 |

### 4.7 Deployment Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-37 | Agency Owner | As an agency owner, I want to deploy my project to production with one click | P0 |
| US-38 | Agency Owner | As an agency owner, I want to see deployment status and progress | P0 |
| US-39 | Agency Owner | As an agency owner, I want to list all deployments for a project | P0 |
| US-40 | Agency Owner | As an agency owner, I want to rollback to a previous deployment | P1 |
| US-41 | Agency Owner | As an agency owner, I want to add custom domains to my deployments | P1 |
| US-42 | DevOps | As a DevOps engineer, I want to set environment variables for deployments | P1 |
| US-43 | Agency Owner | As an agency owner, I want to view deployment build logs | P1 |
| US-44 | Agency Owner | As an agency owner, I want deployment analytics and metrics | P2 |

---

## 5. Functional Requirements

### 5.1 Project Management

#### FR-01: Create Project
- **Description**: Create a new webdev project with automatic scaffolding
- **Input**: Project name, tech stack, description, features configuration
- **Output**: Project ID, scaffolded file structure, status
- **Business Rules**:
  - Project name: 1-255 characters
  - Tech stack: react, vue, static, nextjs
  - Features: server, database, auth, stripe (optional)
  - Scaffolding is automatic by default (can be disabled)
  - User ownership is enforced

#### FR-02: List Projects
- **Description**: Retrieve all projects for the authenticated user
- **Output**: Array of project summaries with metadata
- **Fields Returned**:
  | Field | Type | Description |
  |-------|------|-------------|
  | `id` | number | Project identifier |
  | `name` | string | Project name |
  | `techStack` | string | Framework used |
  | `description` | string | Project description |
  | `features` | object | Enabled features |
  | `status` | string | Project status |
  | `devServerPort` | number | Running dev server port |
  | `previewUrl` | string | Preview URL if available |
  | `deploymentUrl` | string | Production URL if deployed |
  | `fileCount` | number | Number of files |
  | `createdAt` | Date | Creation timestamp |

#### FR-03: Get Project
- **Description**: Retrieve full project details including all files
- **Input**: Project ID
- **Output**: Complete project with files and server status
- **Authorization**: User must own the project

#### FR-04: Delete Project
- **Description**: Soft delete a project and optionally stop dev server
- **Input**: Project ID, stopServer flag (default: true)
- **Business Rules**:
  - Dev server is automatically stopped if running
  - Soft delete sets status to "deleted"
  - Files are preserved for recovery

### 5.2 File Operations

#### FR-05: Read File
- **Description**: Read contents of a project file
- **Input**: Project ID, file path
- **Output**: File path and content
- **Business Rules**:
  - Path traversal prevention (no "..")
  - Cannot read directories
  - File must exist in project

#### FR-06: Write File
- **Description**: Create or update a file in the project
- **Input**: Project ID, file path, content, triggerReload flag
- **Output**: Success status and file path
- **Business Rules**:
  - Path traversal prevention
  - Auto-create parent directories
  - Trigger HMR if dev server running (configurable)
  - Files sorted alphabetically after write

#### FR-07: List Files
- **Description**: List all project files as flat list and tree structure
- **Input**: Project ID
- **Output**: File array and tree representation
- **Tree Structure**:
  ```typescript
  {
    "src": {
      type: "directory",
      children: {
        "App.tsx": { type: "file", path: "src/App.tsx" }
      }
    }
  }
  ```

### 5.3 Dev Server Management

#### FR-08: Start Dev Server
- **Description**: Start Vite development server for a project
- **Input**: Project ID, port (optional, 3000-9999)
- **Output**: Server info (port, URL, status, startedAt)
- **Business Rules**:
  - Verify project ownership before starting
  - Auto-assign port if not specified
  - Update project with server info
  - Support HMR for supported frameworks

#### FR-09: Stop Dev Server
- **Description**: Stop running development server
- **Input**: Project ID
- **Output**: Success status
- **Business Rules**:
  - Clear dev server info from project
  - Graceful shutdown

#### FR-10: Get Dev Server Status
- **Description**: Check status of development server
- **Input**: Project ID
- **Output**: Server status details
- **Status Fields**:
  | Field | Type | Description |
  |-------|------|-------------|
  | `running` | boolean | Is server running |
  | `status` | string | stopped, starting, running, error |
  | `port` | number | Server port |
  | `url` | string | Access URL |
  | `pid` | number | Process ID |
  | `startedAt` | Date | Start timestamp |
  | `errorMessage` | string | Error details if failed |

### 5.4 AI Code Generation

#### FR-11: Generate Code
- **Description**: Generate code using Claude AI based on natural language prompts
- **Input**: Project ID, prompt, targetFile (optional), applyChanges flag
- **Output**: Generated files with explanations and dependencies
- **Options**:
  | Option | Default | Description |
  |--------|---------|-------------|
  | `prompt` | required | Natural language instruction (1-5000 chars) |
  | `targetFile` | null | Specific file to modify |
  | `applyChanges` | true | Auto-apply generated code to project |
- **Generation Types**:
  - New component generation (no targetFile)
  - File modification (with targetFile)
- **Output Structure**:
  ```typescript
  {
    files: Array<{
      path: string;
      content: string;
      action: 'create' | 'update' | 'delete';
    }>;
    explanation: string;
    dependencies: string[];
  }
  ```
- **Business Rules**:
  - Context includes project tech stack and existing files
  - Trigger HMR after applying changes if server running
  - Handle file creation, updates, and deletions

### 5.5 Template Management

#### FR-12: Apply Template
- **Description**: Apply pre-built template to a project
- **Input**: Project ID, template name
- **Available Templates**:
  | Template | Description | Files Created |
  |----------|-------------|---------------|
  | `auth-page` | Login form component | LoginForm.tsx |
  | `dashboard` | Admin dashboard layout | Dashboard.tsx |
  | `landing-page` | Marketing landing page | LandingPage.tsx |
- **Business Rules**:
  - Merge template files with existing files
  - Preserve existing files (overwrite matching paths)
  - Sort files after merge

### 5.6 Version Control (Checkpoints)

#### FR-13: Save Checkpoint
- **Description**: Create a snapshot of current project state
- **Input**: Project ID, description (optional, max 500 chars)
- **Output**: Version number and description
- **Business Rules**:
  - Version auto-incremented
  - Full file snapshot stored
  - Timestamp recorded

#### FR-14: List Checkpoints
- **Description**: Retrieve all checkpoints for a project
- **Input**: Project ID
- **Output**: Array of checkpoint summaries
- **Fields**:
  | Field | Type | Description |
  |-------|------|-------------|
  | `version` | number | Version number |
  | `description` | string | Checkpoint description |
  | `createdAt` | Date | Creation timestamp |

#### FR-15: Rollback Checkpoint
- **Description**: Restore project to a previous checkpoint
- **Input**: Project ID, version number, restartServer flag
- **Business Rules**:
  - Replace current files with checkpoint snapshot
  - Optionally restart dev server after rollback
  - Version must exist

### 5.7 Deployment Orchestration

#### FR-16: Deploy Project
- **Description**: Build and deploy project to Vercel
- **Input**: Project ID, project name, files, environment variables, custom domain
- **Output**: Deployment info and build statistics
- **Process**:
  1. Validate project ownership
  2. Build project via build service
  3. Deploy to Vercel
  4. Return deployment URL and stats
- **Build Stats**:
  | Stat | Description |
  |------|-------------|
  | `fileCount` | Number of files deployed |
  | `totalSize` | Total build size |
  | `duration` | Build time |

#### FR-17: Get Deployment Status
- **Description**: Retrieve current status of a deployment
- **Input**: Deployment ID
- **Output**: Deployment status and URL

#### FR-18: List Deployments
- **Description**: Retrieve deployment history for a project
- **Input**: Project ID
- **Output**: Array of deployments with status

#### FR-19: Rollback Deployment
- **Description**: Revert to a previous deployment
- **Input**: Deployment ID
- **Business Rules**:
  - Previous deployment must exist
  - Triggers immediate rollback on Vercel

#### FR-20: Custom Domain Management
- **Description**: Add or remove custom domains
- **Operations**:
  | Operation | Input | Description |
  |-----------|-------|-------------|
  | `addDomain` | projectId, domain | Associate domain with project |
  | `removeDomain` | projectId, domain | Remove domain association |
- **DNS Configuration**: Users configure DNS externally

#### FR-21: Environment Variables
- **Description**: Set environment variables for deployments
- **Input**: Project ID, variables object
- **Business Rules**:
  - Secure handling of sensitive variables
  - Warning logged for sensitive key patterns (API_KEY, SECRET, PASSWORD, TOKEN)

#### FR-22: Deployment Monitoring
- **Description**: Retrieve deployment logs and analytics
- **Operations**:
  | Operation | Description |
  |-----------|-------------|
  | `getBuildLogs` | Retrieve build output logs |
  | `getStorageInfo` | Get storage bucket details |
  | `getAnalytics` | Get deployment statistics |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| **NFR-01**: Project creation with scaffolding | <10 seconds | End-to-end timing |
| **NFR-02**: Dev server startup | <5 seconds | Time to ready |
| **NFR-03**: Hot module replacement | <500ms | File change to update |
| **NFR-04**: File operations | <100ms | Read/write latency |
| **NFR-05**: AI code generation | <30 seconds | Request to response |
| **NFR-06**: Deployment initiation | <10 seconds | Request to building |
| **NFR-07**: Checkpoint save | <2 seconds | Snapshot complete |
| **NFR-08**: Checkpoint rollback | <5 seconds | Restore complete |

### 6.2 Scalability

| Requirement | Target | Approach |
|-------------|--------|----------|
| **NFR-09**: Projects per user | 100 | Database indexing |
| **NFR-10**: Files per project | 1,000 | Efficient JSON storage |
| **NFR-11**: Checkpoints per project | 50 | Storage optimization |
| **NFR-12**: Concurrent dev servers | 10 per user | Resource pooling |
| **NFR-13**: Deployments per project | 100 | History retention policy |
| **NFR-14**: Concurrent users | 1,000 | Horizontal scaling |

### 6.3 Reliability

| Requirement | Target | Implementation |
|-------------|--------|----------------|
| **NFR-15**: File operation success | 99.9% | Transaction handling |
| **NFR-16**: Dev server availability | 99% | Health checks, auto-restart |
| **NFR-17**: Deployment success | 99% | Retry logic, validation |
| **NFR-18**: Checkpoint integrity | 100% | Atomic snapshots |
| **NFR-19**: Data durability | 99.999% | Database backups |
| **NFR-20**: Zero data loss | 100% | Transactional operations |

### 6.4 Security

| Requirement | Description | Implementation |
|-------------|-------------|----------------|
| **NFR-21**: User data isolation | Projects isolated per user | Row-level security |
| **NFR-22**: Protected endpoints | All mutations require auth | protectedProcedure |
| **NFR-23**: Path traversal prevention | No ".." in file paths | Input validation |
| **NFR-24**: File type validation | Only code files allowed | Extension whitelist |
| **NFR-25**: Environment variable security | Sensitive vars encrypted | Secure storage |
| **NFR-26**: Dev server isolation | Sandboxed execution | Container isolation |
| **NFR-27**: Deployment credentials | API keys secured | Environment variables |

### 6.5 Observability

| Requirement | Target | Tools |
|-------------|--------|-------|
| **NFR-28**: Structured logging | All operations logged | Pino |
| **NFR-29**: Error tracking | Errors captured with context | Sentry |
| **NFR-30**: Performance metrics | Latency, throughput tracked | Prometheus |
| **NFR-31**: Dev server monitoring | Health, resource usage | Custom metrics |
| **NFR-32**: Deployment tracking | Build, deploy status | Vercel webhooks |

### 6.6 Maintainability

| Requirement | Description | Implementation |
|-------------|-------------|----------------|
| **NFR-33**: TypeScript strict mode | Type safety enforced | tsconfig strict |
| **NFR-34**: Test coverage | >80% coverage | Jest/Vitest |
| **NFR-35**: API documentation | All endpoints documented | TSDoc comments |
| **NFR-36**: Service separation | Business logic in services | Service layer pattern |
| **NFR-37**: Schema validation | Zod schemas for all inputs | Input/output validation |

---

## 7. Technical Architecture

### 7.1 System Components

```
+-------------------+     +-------------------+     +---------------------+
|   Frontend (UI)   |     |   tRPC Router     |     |   Webdev Router     |
|   React/Next.js   | --> |   API Gateway     | --> |   (webdev.ts)       |
+-------------------+     +-------------------+     +---------------------+
        |                                                    |
        |                  +--------------------------------+
        |                  |                |               |
        v                  v                v               v
+---------------+  +------------------+  +--------------+  +----------------+
| Monaco Editor |  | Webdev Project   |  | Dev Server   |  | Code Generator |
|   (Frontend)  |  | Service          |  | Manager      |  | Service        |
+---------------+  +------------------+  +--------------+  +----------------+
        |                  |                    |                  |
        +------------------+--------------------+------------------+
                                    |
                                    v
                          +-------------------+
                          |   PostgreSQL      |
                          |   (Drizzle ORM)   |
                          +-------------------+
                                    |
        +---------------------------+---------------------------+
        |                                                       |
        v                                                       v
+---------------+                                      +-----------------+
| generated     |                                      | Vercel Deploy   |
| _projects     |                                      | Service         |
+---------------+                                      +-----------------+
        |                                                       |
        v                                                       v
+---------------+                                      +-----------------+
| Vite Dev      |                                      | Vercel          |
| Server        |                                      | Platform        |
+---------------+                                      +-----------------+
```

### 7.2 Database Schema

#### 7.2.1 generated_projects Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| userId | INTEGER | Reference to users table |
| executionId | INTEGER | Optional execution reference |
| name | VARCHAR(255) | Project name |
| description | TEXT | Project description |
| techStack | VARCHAR(20) | react, vue, nextjs, static |
| features | JSONB | Enabled features configuration |
| filesSnapshot | JSONB | Array of file objects |
| status | VARCHAR(20) | active, deleted, archived |
| devServerPort | INTEGER | Running dev server port |
| previewUrl | VARCHAR(500) | Preview URL |
| deploymentUrl | VARCHAR(500) | Production URL |
| createdAt | TIMESTAMP | Creation timestamp |

#### 7.2.2 ProjectFile Interface

```typescript
interface ProjectFile {
  path: string;      // Relative file path
  content: string;   // File content
  isDirectory?: boolean;
}
```

#### 7.2.3 ProjectCheckpoint Interface

```typescript
interface ProjectCheckpoint {
  version: number;
  description: string;
  filesSnapshot: ProjectFile[];
  createdAt: Date;
}
```

### 7.3 API Endpoints (tRPC Router)

#### 7.3.1 Project Management Endpoints

| Procedure | Type | Description | Auth |
|-----------|------|-------------|------|
| `webdev.createProject` | Mutation | Create project with scaffolding | Protected |
| `webdev.listProjects` | Query | List user's projects | Protected |
| `webdev.getProject` | Query | Get project details | Protected |
| `webdev.deleteProject` | Mutation | Soft delete project | Protected |

#### 7.3.2 File Operation Endpoints

| Procedure | Type | Description | Auth |
|-----------|------|-------------|------|
| `webdev.readFile` | Query | Read file content | Protected |
| `webdev.writeFile` | Mutation | Write/create file | Protected |
| `webdev.listFiles` | Query | List files with tree | Protected |

#### 7.3.3 Dev Server Endpoints

| Procedure | Type | Description | Auth |
|-----------|------|-------------|------|
| `webdev.startDevServer` | Mutation | Start Vite server | Protected |
| `webdev.stopDevServer` | Mutation | Stop dev server | Protected |
| `webdev.getDevServerStatus` | Query | Get server status | Protected |

#### 7.3.4 Code Generation Endpoints

| Procedure | Type | Description | Auth |
|-----------|------|-------------|------|
| `webdev.generateCode` | Mutation | AI code generation | Protected |

#### 7.3.5 Version Control Endpoints

| Procedure | Type | Description | Auth |
|-----------|------|-------------|------|
| `webdev.saveCheckpoint` | Mutation | Create checkpoint | Protected |
| `webdev.listCheckpoints` | Query | List all checkpoints | Protected |
| `webdev.rollbackCheckpoint` | Mutation | Restore checkpoint | Protected |

#### 7.3.6 Deployment Endpoints

| Procedure | Type | Description | Auth |
|-----------|------|-------------|------|
| `deployment.deploy` | Mutation | Deploy to Vercel | Protected |
| `deployment.getStatus` | Query | Get deployment status | Protected |
| `deployment.listDeployments` | Query | List deployment history | Protected |
| `deployment.rollback` | Mutation | Rollback deployment | Protected |
| `deployment.addDomain` | Mutation | Add custom domain | Protected |
| `deployment.removeDomain` | Mutation | Remove custom domain | Protected |
| `deployment.setEnvVariables` | Mutation | Set environment vars | Protected |
| `deployment.getBuildLogs` | Query | Get build logs | Protected |
| `deployment.getStorageInfo` | Query | Get storage info | Protected |
| `deployment.getAnalytics` | Query | Get deployment stats | Protected |

### 7.4 Service Layer

#### 7.4.1 WebdevProjectService (`webdev-project.service.ts`)

| Method | Description |
|--------|-------------|
| `createProject()` | Create new project record |
| `getProject()` | Get project by ID with auth check |
| `listProjects()` | List user's projects |
| `updateProject()` | Update project metadata |
| `deleteProject()` | Soft delete project |
| `getFiles()` | Get project files |
| `readFile()` | Read specific file |
| `writeFile()` | Write/create file |
| `deleteFile()` | Delete file from project |
| `createDirectory()` | Create directory |
| `scaffoldProject()` | Generate initial files |
| `applyTemplate()` | Apply template to project |
| `createCheckpoint()` | Save version snapshot |
| `listCheckpoints()` | Get checkpoint history |
| `restoreCheckpoint()` | Rollback to version |

#### 7.4.2 DevServerManager (`dev-server.service.ts`)

| Method | Description |
|--------|-------------|
| `startServer()` | Start Vite dev server |
| `stopServer()` | Stop running server |
| `getStatus()` | Get server status |
| `triggerReload()` | Trigger HMR |
| `restartServer()` | Restart server |

#### 7.4.3 CodeGeneratorService (`code-generator.service.ts`)

| Method | Description |
|--------|-------------|
| `generateComponent()` | Generate new component |
| `modifyFile()` | Modify existing file |
| `generateFullProject()` | Generate complete project |
| `generatePage()` | Generate page with components |
| `analyzeProject()` | Analyze project structure |

#### 7.4.4 VercelDeployService (`vercel-deploy.service.ts`)

| Method | Description |
|--------|-------------|
| `deploy()` | Deploy to Vercel |
| `getDeploymentStatus()` | Get deployment status |
| `listDeployments()` | List deployment history |
| `rollback()` | Rollback to deployment |
| `addCustomDomain()` | Add domain |
| `removeCustomDomain()` | Remove domain |
| `setEnvVariables()` | Configure environment |

#### 7.4.5 BuildService (`build.service.ts`)

| Method | Description |
|--------|-------------|
| `buildProject()` | Build project files |
| `getBuildLogs()` | Get build logs |
| `getBuildStats()` | Get build statistics |

### 7.5 Data Flow

#### Project Creation Flow
```
1. User creates project with tech stack selection
                    |
2. Validate input (name, tech stack, features)
                    |
3. Create project record in database
                    |
4. If scaffold=true, generate framework files
                    |
5. Store files in filesSnapshot JSONB column
                    |
6. Return project ID and metadata
```

#### AI Code Generation Flow
```
1. User provides natural language prompt
                    |
2. Load project context (tech stack, existing files)
                    |
3. Call Claude API with structured prompt
                    |
4. Parse generated code and file actions
                    |
5. If applyChanges=true, write files to project
                    |
6. If dev server running, trigger HMR
                    |
7. Return generated files and explanation
```

#### Deployment Flow
```
1. User initiates deployment
                    |
2. Validate project ownership
                    |
3. Run build service on project files
                    |
4. If build fails, return errors
                    |
5. Upload build artifacts to Vercel
                    |
6. Configure environment and domains
                    |
7. Return deployment URL and status
                    |
8. Poll for deployment completion
```

### 7.6 Technology Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| **API Framework** | tRPC + Express | Type-safe APIs, existing stack |
| **Database** | PostgreSQL + Drizzle | JSONB for file storage |
| **Dev Server** | Vite | Fast HMR, multi-framework support |
| **Frontend Frameworks** | React, Vue, Next.js | Popular framework coverage |
| **AI Generation** | Claude (Anthropic) | High-quality code generation |
| **Deployment** | Vercel | Seamless deployment platform |
| **Storage** | S3 (assets) | Scalable asset storage |
| **Validation** | Zod | Runtime type validation |

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Dependency | Component | Impact |
|------------|-----------|--------|
| User Authentication | `schema-auth.ts` | User identity for projects |
| Database Connection | `server/db/index.ts` | Drizzle ORM connection |
| tRPC Core | `server/_core/trpc.ts` | API router framework |
| Agent Schema | `drizzle/schema-agent.ts` | generatedProjects table |

### 8.2 External Dependencies

| Dependency | Version | Purpose | Risk Level |
|------------|---------|---------|------------|
| vite | ^5.x | Development server | Low |
| @vitejs/plugin-react | ^4.x | React HMR support | Low |
| @vitejs/plugin-vue | ^5.x | Vue HMR support | Low |
| zod | ^3.x | Input validation | Low |
| drizzle-orm | ^0.30.x | Database ORM | Low |
| @anthropic-ai/sdk | ^0.x | AI code generation | Medium |
| vercel | API | Deployment platform | Medium |

### 8.3 Infrastructure Dependencies

| Dependency | Purpose | Fallback |
|------------|---------|----------|
| PostgreSQL | Primary data store | None (required) |
| Node.js 18+ | Runtime | None (required) |
| Vercel | Deployment | Netlify, AWS |
| Claude API | Code generation | OpenAI GPT-4 |
| S3/R2 | Asset storage | Local storage |

### 8.4 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection | Yes |
| `ANTHROPIC_API_KEY` | Claude API for code gen | Yes |
| `VERCEL_TOKEN` | Vercel deployment API | Yes |
| `VERCEL_TEAM_ID` | Vercel team identifier | No |
| `AWS_ACCESS_KEY_ID` | S3 asset storage | No |
| `AWS_SECRET_ACCESS_KEY` | S3 credentials | No |
| `AWS_S3_BUCKET` | Asset bucket name | No |
| `DEV_SERVER_BASE_PORT` | Starting port for dev servers | No (default: 3000) |
| `MAX_DEV_SERVERS` | Maximum concurrent servers | No (default: 10) |

---

## 9. Out of Scope

### 9.1 Explicitly Excluded

| Item | Reason | Future Phase |
|------|--------|--------------|
| **Real-time Collaboration** | Complex implementation | v3.0 |
| **Git Integration** | Checkpoints provide simpler versioning | v3.0 |
| **Backend Server Generation** | Focus on frontend first | v2.5 |
| **Database Management** | Requires additional infrastructure | v2.5 |
| **Mobile App Frameworks** | Different toolchain required | Separate PRD |
| **CI/CD Pipeline Builder** | Vercel handles deployment | v3.0 |
| **Custom Domain SSL** | Handled by Vercel | N/A |
| **Multi-user Projects** | Single owner model initially | v3.0 |
| **Code Linting/Formatting** | Future enhancement | v2.5 |
| **Testing Framework** | Focus on development first | v2.5 |

### 9.2 Deferred Features

| Feature | Priority | Target Release |
|---------|----------|----------------|
| Custom Template Creation | P2 | v2.4 |
| Team Template Sharing | P3 | v2.5 |
| Checkpoint Comparison | P2 | v2.4 |
| Build Optimization | P2 | v2.5 |
| Preview Deployments | P2 | v2.4 |
| Branch Deployments | P3 | v3.0 |
| Performance Monitoring | P2 | v2.5 |
| A/B Testing Integration | P3 | v3.0 |

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **R1**: Dev server resource exhaustion | Medium | High | Connection limits, auto-shutdown idle servers |
| **R2**: AI code generation quality | Medium | Medium | Human review option, iterative refinement |
| **R3**: Large project file handling | Medium | Medium | File size limits, lazy loading |
| **R4**: Vercel API rate limits | Low | Medium | Queuing, exponential backoff |
| **R5**: HMR reliability issues | Medium | Medium | Fallback to full reload |
| **R6**: Checkpoint storage growth | High | Medium | Retention limits, compression |

### 10.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **R7**: Low user adoption | Medium | High | Onboarding flows, templates, tutorials |
| **R8**: AI generation costs | Medium | Medium | Usage limits, caching common patterns |
| **R9**: Vercel dependency | Medium | Medium | Abstract deployment interface |
| **R10**: Competition from no-code tools | Medium | Medium | AI differentiation, developer focus |

### 10.3 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **R11**: Dev server isolation failures | Low | High | Container sandboxing, process limits |
| **R12**: Data loss from failed checkpoints | Low | High | Atomic operations, validation |
| **R13**: Deployment failures | Medium | Medium | Retry logic, rollback capability |
| **R14**: Support burden | Medium | Medium | Self-service docs, in-app help |

### 10.4 Risk Matrix

```
Impact      Critical |            |
            High     |     R1     |     R7
            Medium   |            |     R2, R3, R4, R5, R6, R8, R9, R10, R13, R14
            Low      |            |     R11, R12
                     +-----------+-----------------
                        Low         Medium    High
                            Probability
```

---

## 11. Milestones & Timeline

### 11.1 Phase 1: Foundation (Weeks 1-2)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M1.1** | Database schema and migrations | schema-agent.ts updates | Backend |
| **M1.2** | Project CRUD operations | Create, list, get, delete | Backend |
| **M1.3** | File operations | Read, write, list, tree | Backend |
| **M1.4** | Framework scaffolding | React, Vue, Next.js, static | Backend |
| **M1.5** | Unit tests | 80% coverage for core | QA |

**Exit Criteria**:
- [ ] Projects can be created with scaffolding
- [ ] Files can be read/written
- [ ] All four frameworks scaffold correctly
- [ ] Database schema deployed

### 11.2 Phase 2: Dev Server (Weeks 3-4)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M2.1** | Dev server manager | Start, stop, status | Backend |
| **M2.2** | Vite integration | HMR, port management | Backend |
| **M2.3** | Preview URLs | Accessible preview links | Backend |
| **M2.4** | Auto-reload on write | File change triggers HMR | Backend |
| **M2.5** | Integration tests | Dev server E2E tests | QA |

**Exit Criteria**:
- [ ] Dev servers start and stop reliably
- [ ] HMR works for all frameworks
- [ ] Preview URLs are accessible
- [ ] File writes trigger updates

### 11.3 Phase 3: AI Code Generation (Weeks 5-6)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M3.1** | Claude integration | API client, prompts | Backend |
| **M3.2** | Component generation | New component creation | Backend |
| **M3.3** | File modification | Edit existing files | Backend |
| **M3.4** | Context building | Project-aware prompts | Backend |
| **M3.5** | Quality testing | Generation accuracy tests | QA |

**Exit Criteria**:
- [ ] AI generates valid code for all frameworks
- [ ] File modifications preserve existing code
- [ ] Context includes project structure
- [ ] >90% generation success rate

### 11.4 Phase 4: Version Control & Templates (Weeks 7-8)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M4.1** | Checkpoint system | Save, list, rollback | Backend |
| **M4.2** | Template management | Apply templates | Backend |
| **M4.3** | Auth template | Login/signup components | Frontend |
| **M4.4** | Dashboard template | Admin layout | Frontend |
| **M4.5** | Landing template | Marketing page | Frontend |

**Exit Criteria**:
- [ ] Checkpoints save and restore correctly
- [ ] All templates apply without errors
- [ ] Templates work with all frameworks
- [ ] Rollback restarts dev server

### 11.5 Phase 5: Deployment (Weeks 9-10)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M5.1** | Vercel integration | Deploy, status, rollback | Backend |
| **M5.2** | Build service | Project compilation | Backend |
| **M5.3** | Custom domains | Add, remove domains | Backend |
| **M5.4** | Environment variables | Secure config | Backend |
| **M5.5** | Deployment UI | Deploy controls | Frontend |

**Exit Criteria**:
- [ ] Projects deploy to Vercel successfully
- [ ] Deployment status updates in real-time
- [ ] Custom domains can be configured
- [ ] Environment variables are secure

### 11.6 Phase 6: Polish & Launch (Weeks 11-12)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M6.1** | Load testing | Performance benchmarks | DevOps |
| **M6.2** | Security audit | Vulnerability assessment | Security |
| **M6.3** | Frontend UI | Complete webdev interface | Frontend |
| **M6.4** | Documentation | User guide, API docs | Tech Writer |
| **M6.5** | Beta testing | User feedback | Product |

**Exit Criteria**:
- [ ] Performance meets SLA requirements
- [ ] No critical security vulnerabilities
- [ ] UI is complete and polished
- [ ] Documentation is comprehensive

### 11.7 Gantt Chart

```
Week:        1    2    3    4    5    6    7    8    9    10   11   12
Phase 1:     ████████
Phase 2:               ████████
Phase 3:                         ████████
Phase 4:                                   ████████
Phase 5:                                             ████████
Phase 6:                                                       ████████
```

**Total Duration**: 12 weeks
**Buffer**: 1 week built into phase 6

---

## 12. Acceptance Criteria

### 12.1 Project Management

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-01** | Projects can be created with any supported tech stack | E2E test |
| **AC-02** | Projects list shows all user projects with correct metadata | E2E test |
| **AC-03** | Project details include all files and server status | E2E test |
| **AC-04** | Deleted projects stop dev server and set status to "deleted" | E2E test |
| **AC-05** | Scaffolding generates correct files for each framework | Unit test |
| **AC-06** | Project creation completes in <10 seconds | Performance test |

### 12.2 File Operations

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-07** | Files can be read with correct content | E2E test |
| **AC-08** | Files can be written and content persists | E2E test |
| **AC-09** | File list returns correct tree structure | Unit test |
| **AC-10** | Path traversal attempts are blocked | Security test |
| **AC-11** | Parent directories are auto-created | Unit test |
| **AC-12** | File operations complete in <100ms | Performance test |

### 12.3 Dev Server

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-13** | Dev server starts and provides accessible URL | E2E test |
| **AC-14** | Dev server stops cleanly | E2E test |
| **AC-15** | Status correctly reports running/stopped state | E2E test |
| **AC-16** | Custom port configuration works | Unit test |
| **AC-17** | HMR updates within 500ms of file change | Performance test |
| **AC-18** | Dev server starts in <5 seconds | Performance test |

### 12.4 AI Code Generation

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-19** | Generated code is syntactically valid | Unit test |
| **AC-20** | Generated code matches project tech stack | E2E test |
| **AC-21** | File modifications preserve unrelated code | Unit test |
| **AC-22** | Dependencies are correctly identified | Unit test |
| **AC-23** | applyChanges=false returns code without writing | E2E test |
| **AC-24** | Generation completes in <30 seconds | Performance test |

### 12.5 Templates

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-25** | Templates apply without overwriting unrelated files | Unit test |
| **AC-26** | Auth template creates functional login component | E2E test |
| **AC-27** | Dashboard template creates admin layout | E2E test |
| **AC-28** | Landing template creates marketing page | E2E test |
| **AC-29** | Templates work with all supported frameworks | E2E test |

### 12.6 Version Control

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-30** | Checkpoints save complete file state | Unit test |
| **AC-31** | Checkpoint list shows all versions with descriptions | E2E test |
| **AC-32** | Rollback restores exact file state | E2E test |
| **AC-33** | Rollback restarts dev server when configured | E2E test |
| **AC-34** | Checkpoints auto-increment version numbers | Unit test |
| **AC-35** | Checkpoint operations complete in <5 seconds | Performance test |

### 12.7 Deployment

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-36** | Projects deploy to Vercel with accessible URL | E2E test |
| **AC-37** | Deployment status reflects actual state | E2E test |
| **AC-38** | Deployment history lists all deployments | E2E test |
| **AC-39** | Rollback restores previous deployment | E2E test |
| **AC-40** | Custom domains can be added and removed | E2E test |
| **AC-41** | Environment variables are securely stored | Security test |
| **AC-42** | Build logs are accessible | E2E test |
| **AC-43** | Deployment completes in <5 minutes | Performance test |

### 12.8 Security & Performance

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-44** | All endpoints require authentication | Security test |
| **AC-45** | Users cannot access other users' projects | Security test |
| **AC-46** | File path validation prevents traversal | Security test |
| **AC-47** | Sensitive env vars are not exposed in logs | Security audit |
| **AC-48** | System handles 100 concurrent dev servers | Load test |
| **AC-49** | All operations are logged for audit | Log verification |
| **AC-50** | Error messages do not expose internals | Security test |

---

## Appendix A: API Reference

### A.1 Create Project

```typescript
interface CreateProjectInput {
  name: string;              // 1-255 characters
  techStack: 'react' | 'vue' | 'static' | 'nextjs';
  description?: string;
  features?: {
    server?: boolean;
    database?: boolean;
    auth?: boolean;
    stripe?: boolean;
  };
  scaffold?: boolean;        // default: true
}

interface CreateProjectOutput {
  success: boolean;
  project: {
    id: number;
    name: string;
    techStack: string;
    description: string;
    features: object;
    status: string;
    createdAt: Date;
  };
}
```

### A.2 Generate Code

```typescript
interface GenerateCodeInput {
  projectId: number;
  prompt: string;            // 1-5000 characters
  targetFile?: string;       // specific file to modify
  applyChanges?: boolean;    // default: true
}

interface GenerateCodeOutput {
  success: boolean;
  generated: {
    files: Array<{
      path: string;
      content: string;
      action: 'create' | 'update' | 'delete';
    }>;
    explanation: string;
    dependencies: string[];
  };
  applied: boolean;
}
```

### A.3 Deploy

```typescript
interface DeployInput {
  projectId: number;
  projectName: string;
  files: Array<{
    path: string;
    content: string;
  }>;
  environment?: Record<string, string>;
  customDomain?: string;
}

interface DeployOutput {
  success: boolean;
  deployment: {
    id: string;
    url: string;
    status: string;
    createdAt: Date;
  };
  buildStats: {
    fileCount: number;
    totalSize: number;
    duration: number;
  };
}
```

### A.4 Checkpoint Operations

```typescript
interface SaveCheckpointInput {
  projectId: number;
  description?: string;      // max 500 characters
}

interface RollbackCheckpointInput {
  projectId: number;
  version: number;
  restartServer?: boolean;   // default: true
}

interface CheckpointOutput {
  version: number;
  description: string;
  createdAt: Date;
}
```

---

## Appendix B: Supported Tech Stacks

### B.1 Framework Details

| Framework | Dependencies | Build Tool | HMR Support |
|-----------|--------------|------------|-------------|
| **React** | react, react-dom | Vite | Yes |
| **Vue** | vue | Vite | Yes |
| **Next.js** | next, react, react-dom | Next.js | Yes |
| **Static** | None | Vite (preview) | Yes |

### B.2 Scaffolded Files by Framework

| Framework | Files Created |
|-----------|---------------|
| **React** | package.json, tsconfig.json, vite.config.ts, index.html, src/main.tsx, src/App.tsx, src/App.css, src/index.css, .gitignore, README.md |
| **Vue** | package.json, index.html, src/main.ts, src/App.vue |
| **Next.js** | package.json, app/page.tsx, app/layout.tsx |
| **Static** | index.html, styles.css, script.js |

---

## Appendix C: Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `PROJECT_NOT_FOUND` | 404 | Project does not exist |
| `FILE_NOT_FOUND` | 404 | File does not exist in project |
| `CHECKPOINT_NOT_FOUND` | 404 | Checkpoint version not found |
| `INVALID_FILE_PATH` | 400 | Path contains invalid characters |
| `PATH_TRAVERSAL` | 400 | Path contains ".." |
| `FILE_IS_DIRECTORY` | 400 | Cannot read directory as file |
| `SERVER_ALREADY_RUNNING` | 400 | Dev server already started |
| `SERVER_NOT_RUNNING` | 400 | Dev server not started |
| `BUILD_FAILED` | 500 | Project build failed |
| `DEPLOYMENT_FAILED` | 500 | Vercel deployment failed |
| `GENERATION_FAILED` | 500 | AI code generation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | User does not own project |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Appendix D: Template Specifications

### D.1 Auth Page Template

```typescript
// LoginForm.tsx - Generated content
- Email input with validation
- Password input with show/hide toggle
- Submit button with loading state
- Form submission handler
- Basic styling with Tailwind classes
```

### D.2 Dashboard Template

```typescript
// Dashboard.tsx - Generated content
- Sidebar navigation
- Main content area
- Stats cards (Users, Revenue, Projects)
- Responsive layout
- Dark mode support
```

### D.3 Landing Page Template

```typescript
// LandingPage.tsx - Generated content
- Hero section with CTA
- Features grid
- Footer
- Responsive design
- Modern styling
```

---

## Appendix E: Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Engineering Team | Initial PRD creation |

---

## Document Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Manager | | | |
| Engineering Lead | | | |
| Security Lead | | | |
| QA Lead | | | |
