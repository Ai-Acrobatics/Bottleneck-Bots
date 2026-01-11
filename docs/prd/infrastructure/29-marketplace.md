# PRD: Marketplace

## Overview
A community-driven marketplace for browsing, sharing, and installing workflow templates and automation components. Users can discover pre-built solutions, share their creations with the community, install templates with one click, and provide ratings and reviews to help others find quality automations.

## Problem Statement
Users often build similar workflows from scratch, duplicating effort across the community. They lack a centralized place to discover proven automation solutions, share their expertise, or learn from others' implementations. Without a marketplace, the platform misses opportunities for community engagement, user-generated content, and faster time-to-value for new users.

## Goals & Objectives
- **Primary Goals**
  - Create a vibrant ecosystem of shareable workflow templates
  - Enable users to monetize their automation expertise
  - Accelerate user success through proven templates
  - Build community engagement and knowledge sharing

- **Success Metrics**
  - 1000+ marketplace templates within 6 months
  - 50%+ users installing at least one template
  - Average template rating > 4.0 stars
  - 10%+ users contributing templates

## User Stories
- As a user, I want to browse workflow templates so that I can find solutions without building from scratch
- As an expert user, I want to share my workflows so that I can help others and gain recognition
- As a user, I want to read reviews before installing so that I can choose quality templates
- As a creator, I want to see how many people use my templates so that I can measure my impact
- As a user, I want to customize installed templates so that they fit my specific needs

## Functional Requirements

### Must Have (P0)
- **Template Browsing**
  - Category-based navigation
  - Search with filters (category, rating, popularity)
  - Template detail pages
  - Preview workflow structure
  - Installation requirements display
  - Compatibility checking

- **Template Installation**
  - One-click install to workspace
  - Dependency resolution
  - Configuration wizard for required inputs
  - Credential mapping for integrations
  - Installation success/failure feedback
  - Installed templates tracking

- **Template Sharing**
  - Publish workflow as template
  - Template metadata (name, description, category)
  - Screenshot/preview upload
  - Version management
  - Public/unlisted/private visibility
  - Required configuration documentation

- **Ratings & Reviews**
  - 5-star rating system
  - Written reviews with character limit
  - Review moderation
  - Helpful/unhelpful voting
  - Creator response to reviews
  - Rating aggregation and display

### Should Have (P1)
- **Creator Profiles**
  - Public creator profile page
  - Published templates listing
  - Total installs and ratings
  - Creator bio and links
  - Follow creators
  - Creator badges (verified, top contributor)

- **Template Analytics**
  - View counts
  - Install counts
  - Active usage tracking
  - Geographic distribution
  - Version adoption rates
  - Revenue tracking (for paid templates)

- **Collections & Curation**
  - Staff picks
  - Category collections
  - "Templates like this"
  - Trending templates
  - New arrivals
  - User-created collections

- **Template Updates**
  - Version release notes
  - Update notifications for installers
  - Automatic vs manual updates
  - Changelog display
  - Breaking change warnings

### Nice to Have (P2)
- **Monetization**
  - Paid templates
  - Subscription-based templates
  - Revenue sharing with creators
  - Payment processing
  - Refund handling

- **Community Features**
  - Template discussions
  - Feature requests for templates
  - Forks and derivatives
  - Collaboration on templates

- **Enterprise Features**
  - Private organizational marketplace
  - Template approval workflows
  - Organization-wide template deployment
  - License management

## Non-Functional Requirements

### Performance
- Search results < 500ms
- Template detail page < 1 second
- Installation initiation < 2 seconds
- Smooth infinite scroll browsing

### Security
- Template code scanning for malicious content
- Creator verification process
- Review spam prevention
- Secure credential handling during install
- Template sandboxing during preview

### Scalability
- Support 100,000+ templates
- Handle installation spikes
- CDN for template assets
- Efficient search indexing

### Reliability
- 99.9% marketplace availability
- Transaction reliability for paid templates
- Rollback capability for failed installations
- Template backup before overwriting

## Technical Requirements

### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                      Marketplace                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 Marketplace UI                       │   │
│  │  Browse │ Search │ Detail │ Install │ Publish │ Rate │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │   Template    │  │  Installation │  │    Rating     │  │
│  │   Service     │  │    Service    │  │   Service     │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │    Search     │  │   Analytics   │  │   Creator     │  │
│  │    Engine     │  │    Service    │  │   Service     │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │  PostgreSQL   │  │ Elasticsearch │  │      S3       │  │
│  │  (Templates)  │  │   (Search)    │  │   (Assets)    │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Dependencies
- Elasticsearch for template search
- S3 for template assets and screenshots
- PostgreSQL for template metadata
- Redis for caching popular templates
- Payment processor (for paid templates)

### APIs
```typescript
// Template Browsing
GET  /api/v1/marketplace/templates
  ?category=&search=&sort=&page=&limit=
GET  /api/v1/marketplace/templates/:id
GET  /api/v1/marketplace/templates/:id/versions
GET  /api/v1/marketplace/templates/:id/reviews

// Template Installation
POST /api/v1/marketplace/templates/:id/install
{
  configuration: Record<string, any>;
  credentialMappings: Record<string, string>;
}
GET  /api/v1/marketplace/installed

// Template Publishing
POST   /api/v1/marketplace/templates
PUT    /api/v1/marketplace/templates/:id
DELETE /api/v1/marketplace/templates/:id
POST   /api/v1/marketplace/templates/:id/versions
PUT    /api/v1/marketplace/templates/:id/visibility

// Ratings & Reviews
POST   /api/v1/marketplace/templates/:id/reviews
PUT    /api/v1/marketplace/templates/:id/reviews/:reviewId
DELETE /api/v1/marketplace/templates/:id/reviews/:reviewId
POST   /api/v1/marketplace/reviews/:reviewId/helpful

// Creator Profile
GET  /api/v1/marketplace/creators/:id
GET  /api/v1/marketplace/creators/:id/templates
POST /api/v1/marketplace/creators/:id/follow

// Collections
GET /api/v1/marketplace/collections
GET /api/v1/marketplace/collections/:id
GET /api/v1/marketplace/trending
GET /api/v1/marketplace/staff-picks
```

### Data Models
```typescript
interface MarketplaceTemplate {
  id: string;
  creatorId: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string; // markdown
  category: string;
  subcategory: string;
  tags: string[];

  // Media
  iconUrl: string;
  screenshotUrls: string[];
  demoVideoUrl: string | null;

  // Versioning
  currentVersion: string;
  versions: TemplateVersion[];

  // Metrics
  installCount: number;
  viewCount: number;
  averageRating: number;
  reviewCount: number;

  // Configuration
  requiredIntegrations: string[];
  requiredCredentials: string[];
  configurationSchema: JSONSchema;

  // Visibility
  visibility: 'public' | 'unlisted' | 'private';
  status: 'draft' | 'pending_review' | 'published' | 'suspended';

  // Pricing (future)
  pricing: 'free' | 'paid' | 'subscription';
  price: number | null;

  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

interface TemplateVersion {
  id: string;
  templateId: string;
  version: string; // semver
  releaseNotes: string;
  workflowDefinition: WorkflowDefinition;
  breaking: boolean;
  createdAt: Date;
}

interface TemplateReview {
  id: string;
  templateId: string;
  userId: string;
  rating: number; // 1-5
  title: string;
  body: string;
  helpfulCount: number;
  creatorResponse: string | null;
  creatorRespondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface InstalledTemplate {
  id: string;
  userId: string;
  templateId: string;
  templateVersion: string;
  workflowId: string;
  configuration: Record<string, any>;
  autoUpdate: boolean;
  installedAt: Date;
  updatedAt: Date;
}

interface CreatorProfile {
  userId: string;
  displayName: string;
  bio: string;
  websiteUrl: string | null;
  socialLinks: Record<string, string>;
  verified: boolean;
  badges: string[];
  totalInstalls: number;
  templateCount: number;
  followerCount: number;
  createdAt: Date;
}

interface MarketplaceCollection {
  id: string;
  name: string;
  description: string;
  type: 'staff_picks' | 'category' | 'user' | 'trending';
  curatorId: string | null;
  templateIds: string[];
  coverImageUrl: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Template Categories
```typescript
const categories = [
  {
    id: 'lead-generation',
    name: 'Lead Generation',
    subcategories: ['form-capture', 'landing-pages', 'lead-magnets', 'webinars']
  },
  {
    id: 'lead-nurturing',
    name: 'Lead Nurturing',
    subcategories: ['email-sequences', 'sms-campaigns', 'drip-campaigns']
  },
  {
    id: 'sales-automation',
    name: 'Sales Automation',
    subcategories: ['pipeline-management', 'follow-ups', 'proposals', 'booking']
  },
  {
    id: 'customer-service',
    name: 'Customer Service',
    subcategories: ['support-tickets', 'feedback', 'onboarding']
  },
  {
    id: 'operations',
    name: 'Operations',
    subcategories: ['reporting', 'notifications', 'data-sync', 'cleanup']
  },
  {
    id: 'integrations',
    name: 'Integrations',
    subcategories: ['crm', 'email', 'calendar', 'payments', 'social']
  }
];
```

### Search Configuration
```typescript
const searchConfig = {
  indices: {
    templates: {
      mappings: {
        name: { type: 'text', boost: 3 },
        description: { type: 'text', boost: 2 },
        tags: { type: 'keyword' },
        category: { type: 'keyword' },
        creator: { type: 'keyword' },
        installCount: { type: 'integer' },
        averageRating: { type: 'float' }
      }
    }
  },
  scoring: {
    popularityWeight: 0.3,
    ratingWeight: 0.2,
    relevanceWeight: 0.4,
    recencyWeight: 0.1
  }
};
```

## Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Total Templates | 1000+ | Count of published templates |
| Install Rate | 50%+ | Users who install at least one template |
| Average Rating | > 4.0 | Mean template rating |
| Creator Participation | 10%+ | Users who publish templates |
| Template Retention | > 80% | Installed templates still active after 30 days |
| Search Success | > 70% | Searches resulting in template detail view |

## Dependencies
- Workflow template export/import system
- Search infrastructure (Elasticsearch)
- Asset storage (S3)
- Review moderation tools
- Payment processing (future)

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Low quality templates | High - Poor user experience | Review process, ratings, curation |
| Malicious template content | Critical - Security breach | Code scanning, sandboxing, creator verification |
| Review manipulation | Medium - Trust issues | Review verification, spam detection |
| Template compatibility issues | Medium - Failed installations | Version checking, dependency validation |
| Creator abandonment | Medium - Outdated templates | Activity tracking, deprecation policies |
| Marketplace abuse | Medium - Spam/scams | Reporting system, moderation team |
