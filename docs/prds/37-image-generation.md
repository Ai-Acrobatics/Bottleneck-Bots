# PRD-037: Image Generation System

## Product Requirements Document

### Overview
| Field | Value |
|-------|-------|
| **PRD ID** | PRD-037 |
| **Feature Name** | AI Image Generation System |
| **Category** | AI & Content Creation |
| **Priority** | P1 - High |
| **Status** | Active |
| **Owner** | AI Team |
| **Version** | 1.0 |
| **Created** | 2025-01-11 |
| **Updated** | 2025-01-11 |

---

## 1. Executive Summary

The Image Generation System enables AI-powered image creation and editing capabilities within the Bottleneck Bots platform. Users can generate original images from text prompts, edit existing images with natural language instructions, and manage their generated image library. The system integrates with the internal Forge API ImageService and automatically stores generated images in cloud storage (S3) for retrieval and reuse.

This feature empowers marketing agencies and businesses to create visual content on-demand for social media, advertisements, client presentations, and web projects without requiring external design tools or specialized skills.

---

## 2. Problem Statement

### Current Challenges
- **Content Creation Bottleneck**: Marketing teams spend significant time and resources on visual content creation, often waiting for designers or using expensive stock images.
- **Design Tool Complexity**: Traditional design software requires specialized training and skills that many team members lack.
- **Cost Inefficiency**: Stock image subscriptions and custom design work represent recurring costs that scale with content needs.
- **Workflow Fragmentation**: Users must leave the platform to create images, disrupting automation workflows and reducing efficiency.
- **Iteration Delays**: Getting revisions on visual content involves back-and-forth communication, slowing campaign launches.

### Target Users
- Marketing agency teams creating client content
- Social media managers needing on-demand visuals
- Business owners without design resources
- Automation workflows requiring dynamic image generation

---

## 3. Goals & Objectives

### Primary Goals
- Enable text-to-image generation with natural language prompts
- Support image editing and modification of existing images
- Provide seamless storage and retrieval of generated images
- Integrate with existing automation workflows and agents

### Secondary Goals
- Maintain high-quality output suitable for professional use
- Minimize generation time for responsive user experience
- Track usage for cost management and analytics
- Support multiple output formats and resolutions

### Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Generation Success Rate | > 95% | Successful generations / total requests |
| Average Generation Time | < 15 seconds | Time from request to image URL |
| User Satisfaction Score | > 4.2/5 | Post-generation feedback rating |
| Workflow Integration Rate | > 60% | Images generated via automation vs manual |
| Cost per Generation | Track baseline | Monitor and optimize over time |
| Storage Utilization | < 80% quota | Active monitoring of storage usage |

---

## 4. User Stories

### US-001: Text-to-Image Generation
**As a** marketing team member
**I want to** generate images from text descriptions
**So that** I can quickly create visual content without design skills

**Acceptance Criteria:**
- [ ] Submit natural language prompt describing desired image
- [ ] Receive generated image within 15 seconds
- [ ] View generated image in preview before saving
- [ ] Access image URL for immediate use
- [ ] Image stored automatically in user's library

### US-002: Image Editing with AI
**As a** content creator
**I want to** modify existing images using text instructions
**So that** I can iterate on designs without starting over

**Acceptance Criteria:**
- [ ] Upload or select existing image for editing
- [ ] Provide natural language edit instructions
- [ ] Receive modified image preserving original context
- [ ] Compare original and edited versions side-by-side
- [ ] Save edited version as new image (non-destructive)

### US-003: Image Library Management
**As a** user
**I want to** browse and manage my generated images
**So that** I can find and reuse previous generations

**Acceptance Criteria:**
- [ ] View gallery of all generated images
- [ ] Filter images by date, prompt keywords, or tags
- [ ] Download images in various formats
- [ ] Delete unwanted images to free storage
- [ ] Copy image URLs for external use

### US-004: Workflow Integration
**As an** automation engineer
**I want to** generate images within automated workflows
**So that** dynamic visual content is created programmatically

**Acceptance Criteria:**
- [ ] Call image generation from workflow actions
- [ ] Pass dynamic prompt variables from workflow context
- [ ] Receive image URL in workflow response
- [ ] Use generated image in subsequent workflow steps
- [ ] Handle generation errors gracefully in workflow

### US-005: Prompt Templates
**As a** frequent user
**I want to** save and reuse effective prompts
**So that** I can maintain consistent visual styles

**Acceptance Criteria:**
- [ ] Save current prompt as template
- [ ] Browse library of prompt templates
- [ ] Apply template with variable substitution
- [ ] Share templates within team/sub-account
- [ ] Edit and update existing templates

### US-006: Generation History
**As a** user
**I want to** view my generation history
**So that** I can track usage and recreate previous results

**Acceptance Criteria:**
- [ ] View chronological list of all generations
- [ ] See original prompt for each generation
- [ ] Re-run previous generation with same settings
- [ ] Export history for reporting
- [ ] Filter by success/failure status

---

## 5. Functional Requirements

### FR-001: Image Generation Core
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-001.1 | Accept text prompt for image generation | P0 | Required |
| FR-001.2 | Validate prompt length (max 4000 characters) | P0 | Required |
| FR-001.3 | Call Forge API ImageService for generation | P0 | Required |
| FR-001.4 | Handle base64 response and decode to buffer | P0 | Required |
| FR-001.5 | Store generated image in S3 storage | P0 | Required |
| FR-001.6 | Return accessible image URL | P0 | Required |
| FR-001.7 | Support negative prompts for exclusions | P1 | Planned |
| FR-001.8 | Support style presets (photorealistic, artistic, etc.) | P1 | Planned |

### FR-002: Image Editing
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-002.1 | Accept original image(s) for editing | P0 | Required |
| FR-002.2 | Support image URL input | P0 | Required |
| FR-002.3 | Support base64 encoded image input | P0 | Required |
| FR-002.4 | Apply edit instructions via prompt | P0 | Required |
| FR-002.5 | Preserve aspect ratio by default | P1 | Planned |
| FR-002.6 | Support inpainting (partial edits) | P2 | Future |
| FR-002.7 | Support outpainting (image extension) | P2 | Future |

### FR-003: Storage Management
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-003.1 | Auto-generate unique filename with timestamp | P0 | Required |
| FR-003.2 | Store in user-specific directory path | P1 | Planned |
| FR-003.3 | Support PNG output format | P0 | Required |
| FR-003.4 | Support JPEG output format | P1 | Planned |
| FR-003.5 | Support WebP output format | P2 | Future |
| FR-003.6 | Generate presigned URLs for access | P0 | Required |
| FR-003.7 | Set appropriate cache headers | P1 | Planned |
| FR-003.8 | Implement storage quota per user | P1 | Planned |

### FR-004: Error Handling
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-004.1 | Validate API credentials before request | P0 | Required |
| FR-004.2 | Handle API timeout gracefully | P0 | Required |
| FR-004.3 | Return meaningful error messages | P0 | Required |
| FR-004.4 | Implement retry logic for transient failures | P1 | Planned |
| FR-004.5 | Log generation attempts and outcomes | P0 | Required |
| FR-004.6 | Alert on high failure rates | P1 | Planned |

### FR-005: API Integration
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-005.1 | Expose tRPC endpoint for generation | P0 | Required |
| FR-005.2 | Authenticate requests via user session | P0 | Required |
| FR-005.3 | Rate limit requests per user | P0 | Required |
| FR-005.4 | Track usage for billing/credits | P0 | Required |
| FR-005.5 | Support batch generation requests | P2 | Future |

### FR-006: Model & Provider Support
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-006.1 | Support internal Forge ImageService | P0 | Required |
| FR-006.2 | Abstract provider interface for extensibility | P1 | Planned |
| FR-006.3 | Add OpenAI DALL-E provider | P2 | Future |
| FR-006.4 | Add Stable Diffusion provider | P2 | Future |
| FR-006.5 | Add Midjourney API provider | P3 | Future |
| FR-006.6 | User-configurable default provider | P2 | Future |

---

## 6. Data Models

### Image Generation Request
```typescript
interface GenerateImageOptions {
  /** Text prompt describing the desired image */
  prompt: string;

  /** Original images for editing (optional) */
  originalImages?: Array<{
    /** URL of the original image */
    url?: string;
    /** Base64-encoded image data */
    b64Json?: string;
    /** MIME type of the image (e.g., 'image/jpeg', 'image/png') */
    mimeType?: string;
  }>;

  /** Style preset (optional) */
  style?: ImageStyle;

  /** Negative prompt - what to avoid (optional) */
  negativePrompt?: string;

  /** Output dimensions (optional) */
  dimensions?: ImageDimensions;

  /** Number of images to generate (optional, default: 1) */
  count?: number;
}

type ImageStyle =
  | 'photorealistic'
  | 'artistic'
  | 'illustration'
  | 'cartoon'
  | 'abstract'
  | 'minimalist'
  | 'vintage'
  | 'modern';

interface ImageDimensions {
  width: number;
  height: number;
}
```

### Image Generation Response
```typescript
interface GenerateImageResponse {
  /** Public URL of the generated image */
  url?: string;

  /** Error message if generation failed */
  error?: string;
}

interface GenerateImageResult {
  /** Unique identifier for this generation */
  id: string;

  /** User who requested the generation */
  userId: string;

  /** Original prompt text */
  prompt: string;

  /** Generated image URL */
  url: string;

  /** Storage key in S3 */
  storageKey: string;

  /** MIME type of the generated image */
  mimeType: string;

  /** Image dimensions */
  width: number;
  height: number;

  /** File size in bytes */
  sizeBytes: number;

  /** Provider used for generation */
  provider: string;

  /** Model used for generation */
  model?: string;

  /** Generation duration in milliseconds */
  durationMs: number;

  /** Credits consumed */
  creditsUsed: number;

  /** Whether this was an edit operation */
  isEdit: boolean;

  /** Original image URLs if this was an edit */
  originalImageUrls?: string[];

  /** Timestamp of generation */
  createdAt: Date;
}
```

### Image Library Entry
```typescript
interface ImageLibraryEntry {
  /** Unique identifier */
  id: string;

  /** User who owns this image */
  userId: string;

  /** Sub-account ID if applicable */
  subAccountId?: string;

  /** Image URL */
  url: string;

  /** Storage key */
  storageKey: string;

  /** Original generation prompt */
  prompt: string;

  /** User-defined tags */
  tags: string[];

  /** User-defined title */
  title?: string;

  /** User-defined description */
  description?: string;

  /** Image metadata */
  metadata: {
    width: number;
    height: number;
    mimeType: string;
    sizeBytes: number;
    provider: string;
    model?: string;
  };

  /** Favorite flag */
  isFavorite: boolean;

  /** Soft delete flag */
  isDeleted: boolean;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}
```

### Prompt Template
```typescript
interface PromptTemplate {
  /** Unique identifier */
  id: string;

  /** User who created the template */
  userId: string;

  /** Template name */
  name: string;

  /** Template description */
  description?: string;

  /** Prompt text with {{variable}} placeholders */
  promptTemplate: string;

  /** Variable definitions */
  variables: Array<{
    name: string;
    description?: string;
    defaultValue?: string;
    required: boolean;
  }>;

  /** Style preset to apply */
  style?: ImageStyle;

  /** Category for organization */
  category?: string;

  /** Whether template is shared */
  isShared: boolean;

  /** Usage count */
  usageCount: number;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}
```

### Generation Usage Record
```typescript
interface ImageGenerationUsage {
  /** Unique identifier */
  id: string;

  /** User ID */
  userId: string;

  /** Sub-account ID if applicable */
  subAccountId?: string;

  /** Generation result ID */
  generationId: string;

  /** Provider used */
  provider: string;

  /** Model used */
  model?: string;

  /** Credits consumed */
  creditsUsed: number;

  /** Cost in cents (for tracking) */
  costCents?: number;

  /** Request timestamp */
  requestedAt: Date;

  /** Completion timestamp */
  completedAt?: Date;

  /** Success flag */
  success: boolean;

  /** Error message if failed */
  errorMessage?: string;
}
```

---

## 7. Database Schema

### Drizzle Schema Definition
```typescript
import { pgTable, text, timestamp, boolean, integer, jsonb, uuid } from 'drizzle-orm/pg-core';

export const generatedImages = pgTable('generated_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  subAccountId: text('sub_account_id'),
  url: text('url').notNull(),
  storageKey: text('storage_key').notNull(),
  prompt: text('prompt').notNull(),
  tags: text('tags').array().default([]),
  title: text('title'),
  description: text('description'),
  metadata: jsonb('metadata').notNull().$type<{
    width: number;
    height: number;
    mimeType: string;
    sizeBytes: number;
    provider: string;
    model?: string;
  }>(),
  isFavorite: boolean('is_favorite').default(false),
  isDeleted: boolean('is_deleted').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const promptTemplates = pgTable('prompt_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  promptTemplate: text('prompt_template').notNull(),
  variables: jsonb('variables').notNull().$type<Array<{
    name: string;
    description?: string;
    defaultValue?: string;
    required: boolean;
  }>>(),
  style: text('style'),
  category: text('category'),
  isShared: boolean('is_shared').default(false),
  usageCount: integer('usage_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const imageGenerationUsage = pgTable('image_generation_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  subAccountId: text('sub_account_id'),
  generationId: uuid('generation_id'),
  provider: text('provider').notNull(),
  model: text('model'),
  creditsUsed: integer('credits_used').notNull(),
  costCents: integer('cost_cents'),
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  success: boolean('success').notNull(),
  errorMessage: text('error_message'),
});
```

---

## 8. API Endpoints

### tRPC Router Definition
```typescript
// Location: server/routers/imageGeneration.ts

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const imageGenerationRouter = router({
  // Generate a new image from prompt
  generate: protectedProcedure
    .input(z.object({
      prompt: z.string().min(1).max(4000),
      originalImages: z.array(z.object({
        url: z.string().url().optional(),
        b64Json: z.string().optional(),
        mimeType: z.string().optional(),
      })).optional(),
      style: z.enum([
        'photorealistic', 'artistic', 'illustration',
        'cartoon', 'abstract', 'minimalist', 'vintage', 'modern'
      ]).optional(),
      negativePrompt: z.string().max(1000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Implementation
    }),

  // Get generation by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Implementation
    }),

  // List user's generated images
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().uuid().optional(),
      tags: z.array(z.string()).optional(),
      search: z.string().optional(),
      favoritesOnly: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Implementation
    }),

  // Update image metadata
  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      title: z.string().max(200).optional(),
      description: z.string().max(1000).optional(),
      tags: z.array(z.string().max(50)).max(20).optional(),
      isFavorite: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Implementation
    }),

  // Delete image (soft delete)
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Implementation
    }),

  // Permanently delete image
  permanentDelete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Implementation
    }),

  // Get usage statistics
  getUsageStats: protectedProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Implementation
    }),
});

// Prompt Templates Router
export const promptTemplateRouter = router({
  // Create new template
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
      promptTemplate: z.string().min(1).max(4000),
      variables: z.array(z.object({
        name: z.string(),
        description: z.string().optional(),
        defaultValue: z.string().optional(),
        required: z.boolean(),
      })),
      style: z.string().optional(),
      category: z.string().max(50).optional(),
      isShared: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      // Implementation
    }),

  // List templates
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().uuid().optional(),
      category: z.string().optional(),
      includeShared: z.boolean().default(true),
    }))
    .query(async ({ ctx, input }) => {
      // Implementation
    }),

  // Update template
  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(1).max(100).optional(),
      description: z.string().max(500).optional(),
      promptTemplate: z.string().min(1).max(4000).optional(),
      variables: z.array(z.object({
        name: z.string(),
        description: z.string().optional(),
        defaultValue: z.string().optional(),
        required: z.boolean(),
      })).optional(),
      style: z.string().optional(),
      category: z.string().max(50).optional(),
      isShared: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Implementation
    }),

  // Delete template
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Implementation
    }),

  // Apply template with variables
  apply: protectedProcedure
    .input(z.object({
      templateId: z.string().uuid(),
      variables: z.record(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      // Implementation - returns generated prompt
    }),
});
```

### REST API Summary
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/trpc/imageGeneration.generate` | Generate new image from prompt |
| GET | `/api/trpc/imageGeneration.getById` | Get image by ID |
| GET | `/api/trpc/imageGeneration.list` | List user's images with pagination |
| POST | `/api/trpc/imageGeneration.update` | Update image metadata |
| POST | `/api/trpc/imageGeneration.delete` | Soft delete image |
| POST | `/api/trpc/imageGeneration.permanentDelete` | Permanently delete image |
| GET | `/api/trpc/imageGeneration.getUsageStats` | Get usage statistics |
| POST | `/api/trpc/promptTemplate.create` | Create prompt template |
| GET | `/api/trpc/promptTemplate.list` | List prompt templates |
| POST | `/api/trpc/promptTemplate.update` | Update prompt template |
| POST | `/api/trpc/promptTemplate.delete` | Delete prompt template |
| POST | `/api/trpc/promptTemplate.apply` | Apply template with variables |

---

## 9. Technical Architecture

### System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Prompt    │  │   Image     │  │      Template           │  │
│  │   Input     │  │   Gallery   │  │      Manager            │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│         │                │                      │                │
│         └────────────────┴──────────────────────┘                │
│                          │                                       │
│                    tRPC Client                                   │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Backend (Node.js)                           │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    tRPC Router Layer                       │  │
│  │  ┌──────────────────┐  ┌────────────────────────────────┐  │  │
│  │  │ imageGeneration  │  │      promptTemplate            │  │  │
│  │  │     Router       │  │         Router                 │  │  │
│  │  └────────┬─────────┘  └──────────────┬─────────────────┘  │  │
│  └───────────┼───────────────────────────┼────────────────────┘  │
│              │                           │                       │
│  ┌───────────┴───────────────────────────┴────────────────────┐  │
│  │                    Service Layer                           │  │
│  │  ┌──────────────────┐  ┌─────────────────────────────────┐ │  │
│  │  │  ImageGeneration │  │         TemplateService         │ │  │
│  │  │     Service      │  │                                 │ │  │
│  │  └────────┬─────────┘  └─────────────────────────────────┘ │  │
│  └───────────┼────────────────────────────────────────────────┘  │
│              │                                                   │
│  ┌───────────┴────────────────────────────────────────────────┐  │
│  │                   Core Layer                               │  │
│  │  ┌──────────────────┐  ┌─────────────────────────────────┐ │  │
│  │  │ imageGeneration  │  │        storage.ts               │ │  │
│  │  │      .ts         │  │   (storagePut, storageGet)      │ │  │
│  │  └────────┬─────────┘  └────────────────┬────────────────┘ │  │
│  └───────────┼─────────────────────────────┼──────────────────┘  │
└──────────────┼─────────────────────────────┼──────────────────────┘
               │                             │
               ▼                             ▼
┌──────────────────────────┐    ┌──────────────────────────────────┐
│     Forge API            │    │          S3 Storage              │
│   ImageService           │    │    (via Storage Proxy)           │
│                          │    │                                  │
│  POST images.v1.         │    │  ┌────────────────────────────┐  │
│  ImageService/           │    │  │ generated/                 │  │
│  GenerateImage           │    │  │   {timestamp}.png          │  │
│                          │    │  │   {timestamp}.png          │  │
│  Response:               │    │  │   ...                      │  │
│  { image: {              │    │  └────────────────────────────┘  │
│      b64Json: "...",     │    │                                  │
│      mimeType: "..."     │    │                                  │
│    }                     │    │                                  │
│  }                       │    │                                  │
└──────────────────────────┘    └──────────────────────────────────┘
```

### Data Flow Diagram
```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Submit prompt
     ▼
┌─────────────────┐
│  Frontend UI    │
│  (Prompt Form)  │
└────────┬────────┘
         │ 2. tRPC mutation
         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend Server                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  3. Validate prompt & auth                              │ │
│  │  4. Check rate limits & credits                         │ │
│  │  5. Log generation request                              │ │
│  └────────────────────────┬───────────────────────────────┘ │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────────┐ │
│  │  6. Call Forge API ImageService                        │ │
│  │     POST /images.v1.ImageService/GenerateImage         │ │
│  │     Headers: Authorization: Bearer {forgeApiKey}       │ │
│  │     Body: { prompt, original_images }                  │ │
│  └────────────────────────┬───────────────────────────────┘ │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────────┐ │
│  │  7. Receive base64 image response                      │ │
│  │  8. Decode base64 to Buffer                            │ │
│  │  9. Upload to S3 via storagePut()                      │ │
│  │     Path: generated/{timestamp}.png                    │ │
│  └────────────────────────┬───────────────────────────────┘ │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────────┐ │
│  │  10. Save metadata to database                         │ │
│  │  11. Log usage record                                  │ │
│  │  12. Deduct credits                                    │ │
│  └────────────────────────┬───────────────────────────────┘ │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            │ 13. Return image URL
                            ▼
                    ┌─────────────────┐
                    │  Frontend UI    │
                    │  (Image Result) │
                    └────────┬────────┘
                             │ 14. Display image
                             ▼
                    ┌─────────────────┐
                    │     User        │
                    └─────────────────┘
```

### Component Structure
```
server/
├── _core/
│   ├── imageGeneration.ts     # Core generation function (existing)
│   └── env.ts                 # Environment configuration (existing)
├── storage.ts                 # S3 storage helpers (existing)
├── routers/
│   └── imageGeneration.ts     # tRPC router (to implement)
├── services/
│   └── imageGenerationService.ts  # Business logic (to implement)
└── db/
    └── schema/
        └── imageGeneration.ts # Drizzle schema (to implement)

app/
├── routes/
│   └── image-generation/
│       ├── _layout.tsx
│       ├── index.tsx          # Main generation page
│       ├── gallery.tsx        # Image library view
│       └── templates.tsx      # Prompt templates view
├── components/
│   └── image-generation/
│       ├── PromptInput.tsx
│       ├── ImagePreview.tsx
│       ├── ImageGallery.tsx
│       ├── TemplateSelector.tsx
│       └── UsageStats.tsx
└── hooks/
    └── useImageGeneration.ts  # tRPC hooks wrapper
```

---

## 10. Dependencies

### Internal Dependencies
| Dependency | Purpose | Location |
|------------|---------|----------|
| Environment Config | API credentials (FORGE_API_URL, FORGE_API_KEY) | `server/_core/env.ts` |
| Storage Module | S3 upload/download helpers | `server/storage.ts` |
| tRPC Router | API endpoint infrastructure | `server/trpc.ts` |
| Drizzle ORM | Database operations | `server/db/` |
| User Authentication | Session management | `server/auth/` |
| Credit System | Usage tracking and billing | PRD-029 |

### External Dependencies
| Dependency | Purpose | Documentation |
|------------|---------|---------------|
| Forge API ImageService | AI image generation backend | Internal API |
| AWS S3 (via proxy) | Generated image storage | AWS S3 Docs |
| Zod | Input validation | https://zod.dev |
| React Query (via tRPC) | Client-side data fetching | https://tanstack.com/query |

### Related PRDs
| PRD ID | Feature | Relationship |
|--------|---------|--------------|
| PRD-005 | Autonomous Agent System | Agents can call image generation as a tool |
| PRD-020 | Tools Execution Engine | Image generation as an available tool |
| PRD-022 | Cost & Credit Management | Credit deduction for generations |
| PRD-027 | RAG System | Images can be indexed and searched |
| PRD-002 | Workflow Automation | Image generation as workflow action |

---

## 11. Risks & Mitigations

### Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Forge API downtime | High | Low | Implement circuit breaker, queue failed requests for retry |
| High generation latency | Medium | Medium | Set user expectations, implement progress indicators |
| Storage quota exceeded | Medium | Low | Monitor usage, implement quotas per user, cleanup old images |
| API rate limiting | Medium | Medium | Implement client-side throttling, queue requests |
| Base64 decoding failures | Low | Low | Validate response format, handle gracefully |

### Business Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| High API costs | High | Medium | Implement credit system, usage limits, cost monitoring |
| Content policy violations | High | Low | Add content filtering, flag inappropriate prompts |
| Copyright concerns | Medium | Medium | Add disclaimer, educate users on usage rights |
| Low adoption rate | Medium | Medium | User onboarding, templates, workflow integration |

### Security Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| API key exposure | Critical | Low | Environment variables, secret management |
| Unauthorized access to images | High | Low | Proper access control, signed URLs with expiration |
| Prompt injection attacks | Medium | Low | Input sanitization, prompt length limits |
| Data exfiltration via prompts | Medium | Low | Monitor unusual patterns, rate limiting |

---

## 12. Appendix

### A. Configuration Requirements

#### Environment Variables
```bash
# Required for image generation
BUILT_IN_FORGE_API_URL=https://api.forge.example.com/
BUILT_IN_FORGE_API_KEY=your-api-key-here

# Storage configuration (existing)
# Uses same Forge API for storage proxy
```

#### Rate Limits (Recommended)
| Plan | Requests/Hour | Requests/Day | Max Concurrent |
|------|---------------|--------------|----------------|
| Free | 10 | 50 | 1 |
| Basic | 50 | 500 | 2 |
| Pro | 200 | 2000 | 5 |
| Enterprise | Unlimited | Unlimited | 10 |

### B. Credit Costs (Recommended)
| Operation | Credits |
|-----------|---------|
| Basic generation (512x512) | 1 |
| HD generation (1024x1024) | 2 |
| Image edit | 2 |
| Batch generation (per image) | 1 |

### C. Example Prompts

#### Marketing Content
```
"Professional product photo of a sleek smartphone on a marble surface
with soft studio lighting, minimalist background, high-end advertising style"
```

#### Social Media
```
"Vibrant Instagram-style flat lay of a coffee cup, notebook, and
succulent plant on a wooden desk, warm natural lighting, lifestyle aesthetic"
```

#### Business Graphics
```
"Clean corporate infographic background in blue and white,
abstract geometric shapes, modern professional design"
```

### D. Error Codes
| Code | Message | Resolution |
|------|---------|------------|
| IMG_001 | API credentials not configured | Set FORGE environment variables |
| IMG_002 | Generation request failed | Check API status, retry |
| IMG_003 | Invalid prompt | Review prompt guidelines |
| IMG_004 | Storage upload failed | Check storage configuration |
| IMG_005 | Rate limit exceeded | Wait and retry, upgrade plan |
| IMG_006 | Insufficient credits | Purchase credits or wait for reset |
| IMG_007 | Image too large for editing | Resize image before editing |

### E. Future Enhancements Roadmap
| Phase | Feature | Target |
|-------|---------|--------|
| Phase 1 | Core generation & storage | Q1 2025 |
| Phase 2 | Image editing, templates | Q2 2025 |
| Phase 3 | Multiple providers (DALL-E, SD) | Q3 2025 |
| Phase 4 | Advanced features (inpainting, upscaling) | Q4 2025 |
| Phase 5 | AI-powered prompt suggestions | Q1 2026 |

### F. Changelog
| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-11 | 1.0 | Initial PRD creation | AI Team |

---

*Document generated for Bottleneck Bots platform*
*PRD ID: PRD-037*
*Category: AI & Content Creation*
