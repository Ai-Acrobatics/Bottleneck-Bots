# PRD: Asset Manager

## Overview
A comprehensive asset management system for uploading, organizing, and serving images, files, and media assets. The system integrates with S3 for storage, provides asset categorization and tagging, generates optimized URLs for delivery, and supports various file types needed for workflow automation and marketing operations.

## Problem Statement
Users need a centralized location to manage media assets used across their workflows, campaigns, and communications. Currently, assets are scattered across different services, URLs break when files move, and there's no way to organize or search uploaded content. Users need reliable asset hosting with proper organization, optimization, and easy integration into their automations.

## Goals & Objectives
- **Primary Goals**
  - Provide reliable, fast asset storage and delivery
  - Enable intuitive asset organization and discovery
  - Generate optimized URLs for various use cases
  - Support all common file types for automation needs

- **Success Metrics**
  - < 200ms asset upload initiation
  - 99.99% asset availability
  - < 100ms CDN delivery time
  - Zero broken asset URLs

## User Stories
- As a user, I want to upload images so that I can use them in my email campaigns
- As a user, I want to organize assets into folders so that I can find them easily
- As a user, I want to copy asset URLs so that I can use them anywhere
- As a user, I want to resize images on-the-fly so that I don't need editing software
- As a user, I want to search my assets so that I can quickly find what I need

## Functional Requirements

### Must Have (P0)
- **File Upload**
  - Drag-and-drop upload interface
  - Multi-file upload support
  - Progress indicator for uploads
  - File type validation
  - File size limits (configurable by plan)
  - Duplicate detection
  - Upload from URL
  - Bulk upload via zip

- **S3 Integration**
  - Direct upload to S3 (presigned URLs)
  - Multi-region storage support
  - Automatic backup/redundancy
  - Lifecycle policies for old assets
  - Cross-origin resource sharing (CORS)

- **Asset Categorization**
  - Folder/directory structure
  - Tags and labels
  - Favorites/starred assets
  - Recent uploads view
  - Asset metadata (name, description)
  - Automatic categorization by file type

- **URL Generation**
  - Permanent public URLs
  - Signed URLs (time-limited)
  - CDN-optimized URLs
  - Custom domain support
  - URL shortening
  - QR code generation

- **Supported File Types**
  - Images: JPEG, PNG, GIF, WebP, SVG
  - Documents: PDF, DOCX, XLSX
  - Media: MP4, MP3, WAV
  - Archives: ZIP (for download)
  - Other: CSV, JSON, TXT

### Should Have (P1)
- **Image Optimization**
  - Automatic compression on upload
  - On-the-fly resizing
  - Format conversion (WebP)
  - Thumbnail generation
  - Responsive image variants
  - Quality adjustment

- **Asset Search**
  - Full-text search on metadata
  - Filter by file type
  - Filter by date range
  - Filter by size
  - Sort options (name, date, size)
  - Saved search queries

- **Asset Management**
  - Rename assets
  - Move between folders
  - Bulk operations (delete, move, tag)
  - Usage tracking (where asset is used)
  - Version history
  - Restore deleted assets (30-day trash)

- **Integration Features**
  - Asset picker component for workflows
  - Embed code generation
  - Social media optimized URLs
  - Email-safe image URLs
  - API for programmatic access

### Nice to Have (P2)
- **Advanced Features**
  - AI-powered auto-tagging
  - Image similarity search
  - Background removal
  - Basic image editing (crop, rotate)
  - Video thumbnail extraction
  - PDF preview generation

- **Collaboration**
  - Shared team folders
  - Asset permissions
  - Asset comments
  - Approval workflows

- **Analytics**
  - View/download counts
  - Bandwidth usage
  - Popular assets report
  - Geographic distribution

## Non-Functional Requirements

### Performance
- Upload initiation < 200ms
- CDN delivery < 100ms globally
- Thumbnail generation < 2 seconds
- Search results < 500ms

### Security
- Encrypted storage (AES-256)
- Encrypted transfer (TLS 1.3)
- Signed URL expiration
- Access control per asset
- Malware scanning on upload
- Content-Type validation

### Scalability
- Support 100GB+ per user
- Handle concurrent uploads
- Global CDN distribution
- Auto-scaling storage

### Reliability
- 99.99% asset availability
- Multi-region redundancy
- Automatic failover
- Zero data loss guarantee

## Technical Requirements

### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Asset Manager                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Asset Manager UI                    │   │
│  │  Upload │ Browse │ Search │ Organize │ Settings     │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │    Upload     │  │     Asset     │  │   Transform   │  │
│  │   Service     │  │    Service    │  │    Service    │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │    Search     │  │      URL      │  │   Analytics   │  │
│  │   Service     │  │   Generator   │  │    Service    │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │      S3       │  │  CloudFront   │  │  PostgreSQL   │  │
│  │   (Storage)   │  │    (CDN)      │  │  (Metadata)   │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Dependencies
- AWS S3 for object storage
- CloudFront or Cloudflare CDN
- Sharp for image processing
- PostgreSQL for metadata
- Elasticsearch for search (optional)
- Lambda/Workers for transformations

### APIs
```typescript
// Upload
POST /api/v1/assets/upload/presigned
{
  filename: string;
  contentType: string;
  size: number;
  folderId?: string;
}

POST /api/v1/assets/upload/url
{
  sourceUrl: string;
  folderId?: string;
}

POST /api/v1/assets/upload/complete
{
  uploadId: string;
  metadata?: AssetMetadata;
}

// Asset Management
GET    /api/v1/assets?folder=&type=&search=&page=&limit=
GET    /api/v1/assets/:id
PUT    /api/v1/assets/:id
DELETE /api/v1/assets/:id
POST   /api/v1/assets/:id/move
POST   /api/v1/assets/bulk

// Folders
GET    /api/v1/assets/folders
POST   /api/v1/assets/folders
PUT    /api/v1/assets/folders/:id
DELETE /api/v1/assets/folders/:id

// URL Generation
GET /api/v1/assets/:id/url
  ?expires=&width=&height=&format=&quality=
POST /api/v1/assets/:id/signed-url
{
  expiresIn: number; // seconds
  transforms?: TransformOptions;
}

// Search
GET /api/v1/assets/search
  ?q=&type=&tags=&dateFrom=&dateTo=&minSize=&maxSize=

// Analytics
GET /api/v1/assets/:id/analytics
GET /api/v1/assets/analytics/summary
```

### Data Models
```typescript
interface Asset {
  id: string;
  userId: string;
  folderId: string | null;

  // File info
  filename: string;
  originalFilename: string;
  contentType: string;
  size: number; // bytes

  // Storage
  s3Key: string;
  s3Bucket: string;
  region: string;

  // URLs
  publicUrl: string;
  cdnUrl: string;

  // Metadata
  title: string | null;
  description: string | null;
  tags: string[];
  alt: string | null; // for images

  // Image-specific
  width: number | null;
  height: number | null;
  format: string | null;

  // Variants
  thumbnailUrl: string | null;
  variants: AssetVariant[];

  // Status
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  processingError: string | null;

  // Analytics
  viewCount: number;
  downloadCount: number;
  lastAccessedAt: Date | null;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface AssetFolder {
  id: string;
  userId: string;
  parentId: string | null;
  name: string;
  path: string; // /folder1/subfolder
  assetCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface AssetVariant {
  id: string;
  assetId: string;
  type: 'thumbnail' | 'preview' | 'optimized' | 'custom';
  width: number;
  height: number;
  format: string;
  size: number;
  url: string;
  createdAt: Date;
}

interface AssetUpload {
  id: string;
  userId: string;
  filename: string;
  contentType: string;
  size: number;
  uploadUrl: string;
  s3Key: string;
  status: 'pending' | 'completed' | 'expired' | 'failed';
  expiresAt: Date;
  createdAt: Date;
}

interface AssetUsage {
  id: string;
  assetId: string;
  resourceType: 'workflow' | 'email' | 'template' | 'campaign';
  resourceId: string;
  createdAt: Date;
}
```

### Image Transform Options
```typescript
interface TransformOptions {
  // Resize
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';

  // Format
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  quality?: number; // 1-100

  // Effects
  blur?: number;
  sharpen?: boolean;
  grayscale?: boolean;

  // Crop
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  // Rotation
  rotate?: number; // degrees
  flip?: boolean;
  flop?: boolean;
}

// URL generation with transforms
// /assets/abc123/image.jpg?w=400&h=300&fit=cover&f=webp&q=80
```

### Storage Limits by Plan
```typescript
const storageLimits = {
  free: {
    totalStorage: 1 * 1024 * 1024 * 1024, // 1 GB
    maxFileSize: 10 * 1024 * 1024, // 10 MB
    monthlyBandwidth: 10 * 1024 * 1024 * 1024, // 10 GB
    maxUploadsPerDay: 50
  },
  starter: {
    totalStorage: 10 * 1024 * 1024 * 1024, // 10 GB
    maxFileSize: 50 * 1024 * 1024, // 50 MB
    monthlyBandwidth: 100 * 1024 * 1024 * 1024, // 100 GB
    maxUploadsPerDay: 500
  },
  professional: {
    totalStorage: 100 * 1024 * 1024 * 1024, // 100 GB
    maxFileSize: 200 * 1024 * 1024, // 200 MB
    monthlyBandwidth: 1024 * 1024 * 1024 * 1024, // 1 TB
    maxUploadsPerDay: -1 // unlimited
  },
  enterprise: {
    totalStorage: -1, // unlimited
    maxFileSize: 1024 * 1024 * 1024, // 1 GB
    monthlyBandwidth: -1, // unlimited
    maxUploadsPerDay: -1 // unlimited
  }
};
```

### CDN Configuration
```typescript
const cdnConfig = {
  provider: 'cloudfront', // or 'cloudflare'

  // Cache settings
  defaultTtl: 86400, // 1 day
  maxTtl: 31536000, // 1 year

  // Headers
  cacheControl: 'public, max-age=31536000, immutable',

  // Security
  signedUrls: {
    enabled: true,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
    privateKey: process.env.CLOUDFRONT_PRIVATE_KEY
  },

  // Image optimization (Cloudflare)
  imageOptimization: {
    enabled: true,
    polish: 'lossy',
    webp: true,
    avif: true
  },

  // Geographic restrictions
  geoRestriction: {
    enabled: false,
    type: 'whitelist',
    locations: []
  }
};
```

## Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Upload Success Rate | 99.9% | Successful uploads / Total attempts |
| CDN Delivery Time | < 100ms | Average global response time |
| Asset Availability | 99.99% | Uptime of asset delivery |
| Search Response Time | < 500ms | Average search query time |
| Storage Efficiency | 50%+ | Compression ratio achieved |
| Zero Broken URLs | 100% | Valid URLs / Total URLs generated |

## Dependencies
- AWS S3 or compatible object storage
- CDN provider (CloudFront/Cloudflare)
- Image processing library (Sharp)
- Malware scanning service
- PostgreSQL for metadata
- Redis for caching

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Storage costs spiral | High - Budget overrun | Usage limits by plan, cleanup policies, compression |
| Malicious file uploads | Critical - Security breach | File type validation, malware scanning, sandboxing |
| CDN cache invalidation delays | Medium - Stale content | Cache busting, versioned URLs, purge API |
| S3 outage | High - Assets unavailable | Multi-region replication, CDN caching, failover |
| Bandwidth abuse | High - Cost overrun | Rate limiting, bandwidth caps, hotlink protection |
| Broken URL migration | High - Lost references | Permanent URLs, redirects, usage tracking |
