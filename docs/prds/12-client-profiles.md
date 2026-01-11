# PRD-012: Client Profiles & Context

## Product Requirements Document

### Overview
| Field | Value |
|-------|-------|
| **PRD ID** | PRD-012 |
| **Feature Name** | Client Profiles & Context |
| **Category** | Core Data Management |
| **Priority** | P0 - Critical |
| **Status** | Active |
| **Owner** | Platform Team |
| **Location** | server/api/routers/clientProfiles.ts |

---

## 1. Executive Summary

The Client Profiles & Context feature provides multi-client management capabilities for agency users of Bottleneck-Bots. This feature enables agencies to manage multiple client accounts, each with distinct brand voices, business goals, SEO configurations, and digital assets. Client profiles serve as the foundational context layer that AI agents and automation workflows use to deliver personalized, brand-consistent operations across all platform features.

This system is critical for agency workflows where a single user manages multiple businesses, each requiring unique messaging, branding, and strategic objectives. All AI-powered features (content generation, email composition, voice agents, SEO optimization) reference client profiles to maintain brand consistency and goal alignment.

---

## 2. Problem Statement

### Current Challenges
Agencies managing multiple clients face significant challenges:

1. **Context Switching Overhead**: Without centralized client profiles, users must manually provide brand context for every AI interaction, leading to inconsistent outputs and wasted time.

2. **Brand Inconsistency**: AI agents operating without brand voice context produce generic content that fails to match client expectations or brand guidelines.

3. **Scattered Configuration**: SEO settings, business goals, and asset libraries stored across multiple systems create fragmentation and synchronization issues.

4. **Integration Complexity**: Third-party platform integrations (like GHL subaccounts) require manual ID mapping for each operation without centralized profile storage.

5. **Scalability Barriers**: Agencies cannot efficiently scale client management without a unified profile system that provides context to all platform features.

### Impact
- 40-60% of AI regeneration requests stem from off-brand initial outputs
- Average 15 minutes per session spent re-establishing client context
- 30% higher error rate in multi-client operations due to context confusion
- Limited agency scalability without centralized client management

---

## 3. Goals & Objectives

### Primary Goals
1. Enable multi-client management within a single agency account
2. Provide persistent brand voice and goal context for AI operations
3. Centralize SEO configuration per client
4. Manage digital assets with contextual tagging
5. Support third-party integration mappings (GHL, etc.)
6. Ensure soft-delete data retention with active/inactive status

### Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Client Profile Adoption | > 90% of agency users | Active profiles per user |
| AI Output Brand Accuracy | > 85% first-pass approval | User feedback/regeneration rate |
| Context Setup Time | < 2 minutes per client | Time-to-first-automation |
| Asset Retrieval Efficiency | < 500ms | API response time |
| Profile Completeness | > 70% fields populated | Data quality audit |
| User Satisfaction | > 4.2/5 rating | In-app surveys |

### Non-Goals (Out of Scope)
- Real-time collaboration between multiple agency users on same profile
- Client self-service portal access
- White-label client-facing dashboards
- Automated brand voice extraction from existing content (Phase 2)
- Multi-language brand voice variants (Phase 2)

---

## 4. User Stories

### US-001: Create Client Profile
**As an** agency user
**I want to** create a new client profile with brand information
**So that** AI agents have consistent context for all client operations

**Acceptance Criteria:**
- [ ] Create profile with required name field
- [ ] Add optional brand voice description (free-form text)
- [ ] Set primary business goal
- [ ] Configure website URL
- [ ] Link GHL subaccount (optional)
- [ ] Profile created with isActive = true
- [ ] Profile appears in client list immediately
- [ ] Audit trail records creation with timestamp

### US-002: Configure SEO Settings
**As an** agency user
**I want to** configure SEO settings for each client
**So that** SEO automation tools use correct metadata

**Acceptance Criteria:**
- [ ] Set site title for client website
- [ ] Set meta description
- [ ] Add keyword array (comma-separated input)
- [ ] Configure robots.txt content
- [ ] SEO config persisted as structured JSON
- [ ] Validate URL format for website field
- [ ] Preview generated meta tags

### US-003: Manage Digital Assets
**As an** agency user
**I want to** upload and organize client assets (logos, images)
**So that** automation workflows can use appropriate branded materials

**Acceptance Criteria:**
- [ ] Upload multiple image files per client
- [ ] Automatic image optimization on upload
- [ ] Assign context tags (HERO, TEAM, TESTIMONIAL, PRODUCT, LOGO, UNKNOWN)
- [ ] Set alt text for accessibility
- [ ] View asset status (uploading, optimizing, ready)
- [ ] Delete/remove assets
- [ ] Retrieve assets by context tag

### US-004: Switch Active Client
**As an** agency user
**I want to** quickly switch between client contexts
**So that** all platform features operate under the correct brand context

**Acceptance Criteria:**
- [ ] View list of all active client profiles
- [ ] Select client to set as current context
- [ ] Visual indicator of active client in UI header
- [ ] All AI operations use selected client's brand voice
- [ ] Context switch persists across page navigation
- [ ] Context switch takes < 200ms

### US-005: Archive Client Profile
**As an** agency user
**I want to** archive inactive clients without losing data
**So that** I can maintain clean workspace while preserving history

**Acceptance Criteria:**
- [ ] Soft-delete sets isActive = false
- [ ] Archived clients hidden from default list
- [ ] Option to view archived clients
- [ ] Restore archived client to active status
- [ ] Archived client data remains intact
- [ ] Prevent selection of archived client as active context

### US-006: Edit Client Profile
**As an** agency user
**I want to** update client information as their brand evolves
**So that** AI context stays current with client needs

**Acceptance Criteria:**
- [ ] Edit all profile fields inline
- [ ] Update timestamp recorded on save
- [ ] Optimistic UI update with rollback on error
- [ ] Validation matches creation requirements
- [ ] Changes reflected immediately in AI context
- [ ] Change history logged for audit

---

## 5. Functional Requirements

### FR-001: Profile CRUD Operations
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-001.1 | Create client profile with name (required) | P0 | Implemented |
| FR-001.2 | Store brand voice description | P0 | Implemented |
| FR-001.3 | Store primary goal text | P0 | Implemented |
| FR-001.4 | Store website URL | P1 | Implemented |
| FR-001.5 | Link GHL subaccount name and ID | P1 | Implemented |
| FR-001.6 | Update all profile fields | P0 | Implemented |
| FR-001.7 | Soft delete (isActive = false) | P0 | Implemented |
| FR-001.8 | List active profiles for user | P0 | Implemented |
| FR-001.9 | Get single profile by ID | P0 | Implemented |
| FR-001.10 | Enforce user ownership on all operations | P0 | Implemented |

### FR-002: SEO Configuration
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-002.1 | Store site title | P1 | Implemented |
| FR-002.2 | Store meta description | P1 | Implemented |
| FR-002.3 | Store keywords array | P1 | Implemented |
| FR-002.4 | Store robots.txt content | P2 | Implemented |
| FR-002.5 | Validate SEO config structure | P1 | Implemented |
| FR-002.6 | Expose SEO config to automation tools | P1 | Pending |

### FR-003: Asset Management
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-003.1 | Store asset metadata array | P1 | Implemented |
| FR-003.2 | Track asset original and optimized names | P1 | Implemented |
| FR-003.3 | Store asset URL (CDN/S3) | P1 | Implemented |
| FR-003.4 | Store alt text per asset | P1 | Implemented |
| FR-003.5 | Assign context tag (enum) | P1 | Implemented |
| FR-003.6 | Track upload/optimization status | P1 | Implemented |
| FR-003.7 | Asset upload endpoint | P1 | Pending |
| FR-003.8 | Asset deletion endpoint | P1 | Pending |
| FR-003.9 | Query assets by context tag | P2 | Pending |

### FR-004: Context Integration
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-004.1 | Provide profile to AI agent prompts | P0 | Pending |
| FR-004.2 | Include brand voice in content generation | P0 | Pending |
| FR-004.3 | Inject SEO config into SEO tools | P1 | Pending |
| FR-004.4 | Make assets available to content tools | P1 | Pending |
| FR-004.5 | Pass primary goal to strategic AI features | P1 | Pending |

### FR-005: Data Validation
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-005.1 | Validate name is non-empty | P0 | Implemented |
| FR-005.2 | Validate ID is positive integer | P0 | Implemented |
| FR-005.3 | Validate SEO config schema | P1 | Implemented |
| FR-005.4 | Validate asset array schema | P1 | Implemented |
| FR-005.5 | Validate context tag enum values | P1 | Implemented |

---

## 6. Data Models

### ClientProfile (Database Schema)
```typescript
interface ClientProfile {
  id: number;                    // Auto-increment primary key
  userId: number;                // Foreign key to users table
  name: string;                  // Client/business name (required)
  subaccountName: string | null; // GHL subaccount display name
  subaccountId: string | null;   // GHL subaccount identifier
  brandVoice: string | null;     // Brand voice description
  primaryGoal: string | null;    // Primary business objective
  website: string | null;        // Client website URL
  seoConfig: SEOConfig | null;   // Structured SEO configuration
  assets: Asset[] | null;        // Array of digital assets
  isActive: boolean;             // Soft delete flag (default: true)
  createdAt: Date;               // Record creation timestamp
  updatedAt: Date;               // Last modification timestamp
}
```

### SEOConfig
```typescript
interface SEOConfig {
  siteTitle: string;             // Website title tag
  metaDescription: string;       // Meta description content
  keywords: string[];            // Target keywords array
  robotsTxt: string;             // robots.txt file content
}
```

### Asset
```typescript
interface Asset {
  id: string;                    // Unique asset identifier
  originalName: string;          // Original upload filename
  optimizedName: string;         // Processed filename
  url: string;                   // CDN/S3 asset URL
  altText: string;               // Accessibility alt text
  contextTag: AssetContextTag;   // Usage context category
  status: AssetStatus;           // Processing status
}

type AssetContextTag =
  | 'HERO'          // Hero/banner images
  | 'TEAM'          // Team member photos
  | 'TESTIMONIAL'   // Customer testimonial images
  | 'PRODUCT'       // Product images
  | 'LOGO'          // Brand logos
  | 'UNKNOWN';      // Uncategorized

type AssetStatus =
  | 'uploading'     // Upload in progress
  | 'optimizing'    // Image optimization running
  | 'ready';        // Available for use
```

### API Input Schemas
```typescript
// Create Profile Input
interface CreateClientProfileInput {
  name: string;                  // Required: min 1 character
  subaccountName?: string;
  subaccountId?: string;
  brandVoice?: string;
  primaryGoal?: string;
  website?: string;
  seoConfig?: SEOConfig;
  assets?: Asset[];
}

// Update Profile Input
interface UpdateClientProfileInput extends CreateClientProfileInput {
  id: number;                    // Required: positive integer
  isActive?: boolean;
}
```

### Database Relations
```
users (1) ──────< (many) client_profiles
  │
  └── id ──────── userId (FK)
```

---

## 7. API Endpoints

### tRPC Router: clientProfiles

| Procedure | Type | Input | Output | Auth | Description |
|-----------|------|-------|--------|------|-------------|
| `list` | Query | none | `{ success: boolean, data: ClientProfile[] }` | Protected | List all active profiles for user |
| `get` | Query | `{ id: number }` | `{ success: boolean, data: ClientProfile }` | Protected | Get single profile by ID |
| `create` | Mutation | `CreateClientProfileInput` | `{ success: boolean, message: string, data: ClientProfile }` | Protected | Create new profile |
| `update` | Mutation | `UpdateClientProfileInput` | `{ success: boolean, message: string, data: ClientProfile }` | Protected | Update existing profile |
| `delete` | Mutation | `{ id: number }` | `{ success: boolean, message: string }` | Protected | Soft-delete profile |

### Planned Endpoints (Phase 2)

| Procedure | Type | Description |
|-----------|------|-------------|
| `listArchived` | Query | List soft-deleted profiles |
| `restore` | Mutation | Restore archived profile |
| `uploadAsset` | Mutation | Upload and process asset |
| `deleteAsset` | Mutation | Remove asset from profile |
| `getBySubaccountId` | Query | Lookup profile by GHL ID |
| `duplicate` | Mutation | Clone profile as template |

---

## 8. UI/UX Specifications

### Client Profiles Dashboard

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Client Profiles                        [+ New Client]       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Acme Corp       │  │ TechStart Inc   │  │ Green Living │ │
│  │ ──────────────  │  │ ──────────────  │  │ ────────────  │ │
│  │ Professional,   │  │ Innovative,     │  │ Eco-friendly, │ │
│  │ Authoritative   │  │ Approachable    │  │ Passionate   │ │
│  │                 │  │                 │  │              │ │
│  │ Lead Gen        │  │ Brand Awareness │  │ E-commerce   │ │
│  │ ────────────── │  │ ────────────── │  │ ───────────  │ │
│  │ [Edit] [Delete] │  │ [Edit] [Delete] │  │ [Edit] [Del] │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Profile Edit Form
```
┌─────────────────────────────────────────────────────────────┐
│  Edit Client Profile                              [X Close] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CLIENT INFORMATION                                         │
│  ─────────────────                                          │
│  Client Name *        [________________________]            │
│  Website              [________________________]            │
│                                                             │
│  BRAND CONTEXT                                              │
│  ────────────                                               │
│  Brand Voice          [________________________]            │
│                       [________________________]            │
│                       Describe tone, personality, style     │
│                                                             │
│  Primary Goal         [________________________]            │
│                       Main business objective               │
│                                                             │
│  INTEGRATIONS                                               │
│  ────────────                                               │
│  GHL Subaccount       [____________] ID [____________]      │
│                                                             │
│  SEO CONFIGURATION                                          │
│  ─────────────────                                          │
│  Site Title           [________________________]            │
│  Meta Description     [________________________]            │
│  Keywords             [tag1] [tag2] [tag3] [+]              │
│  Robots.txt           [________________________]            │
│                                                             │
│  DIGITAL ASSETS                                             │
│  ──────────────                                             │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────────────────┐               │
│  │Logo │ │Hero │ │Team │ │   [+ Upload]    │               │
│  │ .png│ │.jpg │ │.jpg │ │                 │               │
│  └─────┘ └─────┘ └─────┘ └─────────────────┘               │
│                                                             │
│                              [Cancel]  [Save Changes]       │
└─────────────────────────────────────────────────────────────┘
```

#### Active Client Indicator (Global Header)
```
┌─────────────────────────────────────────────────────────────┐
│  🤖 Bottleneck-Bots    │ Active: [Acme Corp ▼] │  Settings │
└─────────────────────────────────────────────────────────────┘
```

### Interaction Patterns

1. **Inline Editing**: Click-to-edit fields for quick updates
2. **Autosave Draft**: Save progress without requiring submit
3. **Keyboard Navigation**: Tab through form fields, Enter to save
4. **Drag-and-Drop Assets**: Reorder and organize asset gallery
5. **Context Preservation**: Remember last selected client across sessions

### Error States

| State | UI Treatment |
|-------|--------------|
| Empty name | Red border, inline error message |
| Invalid URL | Warning icon with tooltip |
| Upload failure | Toast notification with retry option |
| Save failure | Modal with error details |
| Profile not found | Redirect to list with toast |

---

## 9. Technical Architecture

### Component Hierarchy
```
ClientProfilesPage
├── ClientProfileList
│   ├── ClientProfileCard (map)
│   │   ├── ProfileAvatar
│   │   ├── ProfileSummary
│   │   └── ProfileActions
│   └── EmptyState
├── ClientProfileModal
│   ├── ProfileInfoSection
│   ├── BrandContextSection
│   ├── IntegrationsSection
│   ├── SEOConfigSection
│   └── AssetsSection
│       ├── AssetUploader
│       └── AssetGrid
│           └── AssetCard
└── ActiveClientSelector (Global)
```

### State Management
```typescript
// Zustand store for client context
interface ClientProfileStore {
  profiles: ClientProfile[];
  activeProfileId: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setActiveProfile: (id: number) => void;
  fetchProfiles: () => Promise<void>;
  createProfile: (input: CreateClientProfileInput) => Promise<void>;
  updateProfile: (input: UpdateClientProfileInput) => Promise<void>;
  deleteProfile: (id: number) => Promise<void>;
}
```

### Context Provider Pattern
```typescript
// ClientContext for AI integration
interface ClientContext {
  profile: ClientProfile | null;
  getBrandPromptPrefix: () => string;
  getSEOContext: () => SEOConfig | null;
  getAssetsByTag: (tag: AssetContextTag) => Asset[];
}

// Usage in AI features
const { profile, getBrandPromptPrefix } = useClientContext();
const systemPrompt = `${getBrandPromptPrefix()}\n${basePrompt}`;
```

### Data Flow
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   React     │────▶│   tRPC      │────▶│   Drizzle   │
│ Components  │     │   Router    │     │     ORM     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Zustand   │     │   Zod       │     │ PostgreSQL  │
│    Store    │     │ Validation  │     │  Database   │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐
│   Client    │──────▶ AI Agents, Content Gen, SEO Tools
│   Context   │
└─────────────┘
```

### Database Indexes
```sql
-- Recommended indexes for performance
CREATE INDEX idx_client_profiles_user_id ON client_profiles(userId);
CREATE INDEX idx_client_profiles_active ON client_profiles(isActive);
CREATE INDEX idx_client_profiles_user_active ON client_profiles(userId, isActive);
CREATE INDEX idx_client_profiles_subaccount ON client_profiles(subaccountId) WHERE subaccountId IS NOT NULL;
```

---

## 10. Security Considerations

### Authorization Rules
| Operation | Authorization Check |
|-----------|---------------------|
| List | Only return profiles where userId = ctx.user.id |
| Get | Verify profile.userId = ctx.user.id |
| Create | Assign userId from ctx.user.id (not from input) |
| Update | Verify existing profile.userId = ctx.user.id |
| Delete | Verify existing profile.userId = ctx.user.id |

### Data Protection
- **Ownership Enforcement**: All queries filter by authenticated userId
- **No Cross-User Access**: Profile IDs alone cannot retrieve other users' data
- **Soft Delete**: Data retained for compliance and recovery
- **Input Sanitization**: Zod schemas validate all input before processing
- **SQL Injection Prevention**: Drizzle ORM with parameterized queries

### Sensitive Data Handling
| Field | Sensitivity | Protection |
|-------|-------------|------------|
| subaccountId | Medium | Encrypted at rest |
| accessTokens | High | Not stored in profile (separate integrations table) |
| assets.url | Low | CDN-signed URLs with expiration |
| brandVoice | Low | Standard encryption |

### Audit Requirements
```typescript
// Logging implemented in router
console.log(`[ClientProfiles] Created profile for user ${ctx.user.id}:`, {
  profileId: newProfile.id,
  name: input.name,
});

console.log(`[ClientProfiles] Updated profile ${input.id} for user ${ctx.user.id}`);

console.log(`[ClientProfiles] Deleted profile ${input.id} for user ${ctx.user.id}`);
```

### Rate Limiting (Recommended)
| Operation | Limit |
|-----------|-------|
| Create | 10/hour per user |
| Update | 60/hour per user |
| List | 100/minute per user |
| Asset Upload | 50/hour per user |

---

## 11. Dependencies

### Internal Dependencies
| Dependency | Purpose | Status |
|------------|---------|--------|
| User Authentication | Protect endpoints, provide userId | Implemented |
| Database (PostgreSQL) | Persistent storage | Implemented |
| Drizzle ORM | Type-safe database operations | Implemented |
| tRPC | Type-safe API layer | Implemented |
| Zod | Runtime schema validation | Implemented |

### External Dependencies
| Dependency | Purpose | Status |
|------------|---------|--------|
| GoHighLevel API | Subaccount synchronization | Planned |
| AWS S3 / Cloudflare R2 | Asset storage | Planned |
| Image Optimization Service | Asset processing | Planned |

### Feature Dependencies (Other PRDs)
| Feature | Dependency Type | PRD Reference |
|---------|-----------------|---------------|
| AI Agent System | Consumer | PRD-005 |
| Content Generation | Consumer | TBD |
| SEO Automation | Consumer | TBD |
| Email Integration | Consumer | PRD-005 (Email) |
| Voice Agents | Consumer | PRD-006 |

---

## 12. Risks & Mitigations

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Large asset arrays causing slow queries | Medium | Medium | Implement pagination, lazy loading, consider separate assets table |
| JSON field schema drift | Medium | Low | Version seoConfig/assets schemas, migration strategy |
| GHL integration rate limits | High | Medium | Implement caching, background sync |
| Asset storage costs scaling | Low | Medium | Implement cleanup policies, compression |

### Product Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low profile completeness | Medium | High | Guided onboarding, smart defaults, progress indicators |
| Brand voice inconsistency | Medium | Medium | Provide templates, examples, AI-assisted suggestions |
| Context switch confusion | Low | Medium | Prominent active client indicator, confirmation prompts |
| Data loss on delete | Low | High | Soft delete (implemented), recovery endpoint |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Agencies outgrowing profile limits | Low | Low | Implement tier-based limits when needed |
| Compliance requirements (GDPR) | Medium | High | Data export, hard delete on request, audit logging |
| Integration partner API changes | Medium | Medium | Abstract integration layer, version handling |

---

## Appendix

### A. Brand Voice Examples

| Industry | Example Brand Voice |
|----------|---------------------|
| Legal | "Professional, authoritative, trustworthy. Avoid casual language. Use precise legal terminology when appropriate." |
| Healthcare | "Compassionate, informative, reassuring. Balance expertise with accessibility. Avoid medical jargon in patient-facing content." |
| E-commerce | "Friendly, enthusiastic, urgent. Highlight value propositions. Use action-oriented language." |
| Tech Startup | "Innovative, approachable, confident. Balance technical accuracy with accessibility. Embrace modern, conversational tone." |
| Real Estate | "Sophisticated, local-expert, warm. Emphasize lifestyle benefits. Use descriptive, aspirational language." |

### B. SEO Configuration Examples

```json
{
  "siteTitle": "Acme Corp | Leading Business Solutions Since 1985",
  "metaDescription": "Acme Corp provides enterprise-grade business solutions for modern companies. Trusted by 10,000+ businesses worldwide.",
  "keywords": ["business solutions", "enterprise software", "acme corp", "business automation"],
  "robotsTxt": "User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://acmecorp.com/sitemap.xml"
}
```

### C. Asset Context Tag Usage

| Tag | Use Case | Example |
|-----|----------|---------|
| LOGO | Header, footer, email signatures | company-logo-primary.svg |
| HERO | Landing page banners, featured images | homepage-hero-2024.jpg |
| TEAM | About page, team section | ceo-headshot.jpg |
| TESTIMONIAL | Review sections, case studies | customer-smith-photo.jpg |
| PRODUCT | Product pages, catalogs | widget-pro-main.png |
| UNKNOWN | Uncategorized uploads | misc-image-001.jpg |

### D. Implementation Checklist

#### Phase 1 (Current - MVP)
- [x] Database schema design
- [x] tRPC router implementation
- [x] Zod validation schemas
- [x] CRUD operations with ownership verification
- [x] Soft delete functionality
- [ ] Frontend profile list view
- [ ] Frontend create/edit modal
- [ ] Active client selector component

#### Phase 2 (Enhancement)
- [ ] Asset upload endpoint with S3 integration
- [ ] Image optimization pipeline
- [ ] GHL subaccount sync
- [ ] Profile templates/duplication
- [ ] Archived profiles view and restore
- [ ] Bulk operations (export, import)

#### Phase 3 (AI Integration)
- [ ] ClientContext provider for AI features
- [ ] Brand voice injection in prompts
- [ ] SEO config integration with SEO tools
- [ ] Asset selection in content generation
- [ ] Goal-aware AI recommendations

### E. API Response Examples

#### List Profiles
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 42,
      "name": "Acme Corp",
      "subaccountName": "Acme GHL",
      "subaccountId": "ghl_abc123",
      "brandVoice": "Professional, authoritative, trustworthy",
      "primaryGoal": "Increase qualified lead generation by 30%",
      "website": "https://acmecorp.com",
      "seoConfig": { ... },
      "assets": [ ... ],
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:22:00Z"
    }
  ]
}
```

#### Error Response
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Client profile not found"
  }
}
```

### F. Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2024-01-11 | 1.0 | Initial PRD creation |

---

**Document Owner**: Platform Team
**Last Updated**: 2024-01-11
**Review Schedule**: Monthly or upon significant feature changes
