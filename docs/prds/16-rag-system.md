# PRD-16: RAG (Retrieval-Augmented Generation) System

**Product Requirements Document**

| Field | Value |
|-------|-------|
| **Document ID** | PRD-16 |
| **Feature Name** | RAG (Retrieval-Augmented Generation) System |
| **Version** | 1.0 |
| **Status** | Draft |
| **Author** | Engineering Team |
| **Created** | 2026-01-11 |
| **Last Updated** | 2026-01-11 |
| **Priority** | High |
| **Target Release** | v2.2 |
| **Feature Location** | `server/api/routers/rag.ts` |

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

The RAG (Retrieval-Augmented Generation) System enables Bottleneck-Bots to provide context-aware, accurate AI agent responses by dynamically retrieving relevant documentation and knowledge during task execution. The system supports document upload and processing, vector embedding generation, semantic search, and intelligent context injection for AI prompts. This feature transforms the platform from generic AI automation to domain-specific, knowledge-grounded automation that understands user-specific platforms, workflows, and documentation.

### 1.2 Background

AI agents powered by large language models (LLMs) have inherent limitations in domain-specific knowledge. While models like GPT-4 and Claude have broad general knowledge, they lack:
- Up-to-date information about specific platforms (e.g., GoHighLevel updates)
- User-specific documentation and SOPs
- Industry-specific terminology and workflows
- Company policies and brand guidelines

Currently, users must manually provide context in every prompt, leading to:
- Repetitive prompt engineering
- Inconsistent AI responses
- Longer task completion times
- Higher error rates due to lack of context

The RAG system addresses these limitations by:
1. Allowing users to upload documentation once
2. Automatically chunking and embedding documents
3. Retrieving relevant context for each AI query
4. Injecting documentation context into system prompts

### 1.3 Key Capabilities

- **Document Upload & Processing**: Import documents in PDF, DOCX, TXT, HTML, and Markdown formats
- **Intelligent Chunking**: Automatically split documents into semantically meaningful chunks with configurable overlap
- **Vector Embedding**: Generate high-dimensional vector embeddings for semantic search
- **Semantic Retrieval**: Find relevant documentation based on query similarity, not just keyword matching
- **Platform Detection**: Automatically identify relevant platforms (GoHighLevel, Stripe, etc.) from user queries
- **Context-Aware Prompting**: Build AI system prompts with dynamically retrieved documentation
- **URL Ingestion**: Crawl and ingest web documentation directly from URLs
- **Source Management**: Organize, update, and manage documentation sources

### 1.4 Target Users

- **Agency Owners**: Uploading client onboarding documentation, SOPs, and brand guidelines
- **Automation Engineers**: Importing platform documentation for accurate task execution
- **Marketing Teams**: Providing campaign guidelines and content templates
- **Customer Success**: Adding support documentation for AI-assisted responses
- **System Administrators**: Managing platform-wide knowledge bases

---

## 2. Problem Statement

### 2.1 Current Pain Points

| Pain Point | Impact | Affected Users |
|------------|--------|----------------|
| **Context Repetition** | Users must re-explain platform details in every prompt | All users |
| **Outdated AI Knowledge** | LLMs lack knowledge of recent platform updates | Automation engineers |
| **Generic Responses** | AI provides generic advice instead of platform-specific guidance | All users |
| **Inconsistent Results** | Same query yields different results due to context variations | Quality teams |
| **No Brand Awareness** | AI cannot follow company-specific guidelines without explicit instruction | Marketing teams |
| **Manual Documentation Lookup** | Users must manually search docs to provide context | Support teams |
| **Platform Confusion** | AI confuses similar features across different platforms | Multi-platform users |

### 2.2 User Needs

1. **Agency Owners** need AI agents that understand their clients' specific requirements and brand guidelines
2. **Automation Engineers** need accurate, up-to-date platform documentation integrated into agent responses
3. **Marketing Teams** need AI that follows company style guides and content policies
4. **Support Teams** need AI that can reference internal knowledge bases and SOPs
5. **System Administrators** need centralized documentation management with version control

### 2.3 Business Drivers

- **Improved AI Accuracy**: Contextual grounding reduces hallucinations by 60-80%
- **Reduced Support Costs**: Self-service documentation reduces manual support burden
- **Faster Task Completion**: Pre-loaded context eliminates repetitive prompt engineering
- **Competitive Differentiation**: Enterprise-grade knowledge management is a premium feature
- **Platform Stickiness**: Uploaded documentation creates switching costs
- **Scalability**: Single documentation upload serves unlimited AI interactions

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Description | Target |
|------|-------------|--------|
| **G1** | Enable document upload with automatic processing and embedding | <60 seconds per document |
| **G2** | Provide semantic search with high relevance accuracy | >85% relevance score |
| **G3** | Automatically inject relevant context into AI prompts | <500ms retrieval latency |
| **G4** | Support multi-format document ingestion | 5+ formats (PDF, DOCX, TXT, HTML, MD) |
| **G5** | Enable platform-aware documentation retrieval | 90% platform detection accuracy |
| **G6** | Reduce AI hallucinations through grounded responses | 70% reduction |

### 3.2 Success Metrics

#### 3.2.1 Quantitative Metrics

| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| **Document Processing Time** | N/A | <30 seconds for 100 pages | Performance monitoring |
| **Retrieval Latency (P95)** | N/A | <500ms | API response timing |
| **Semantic Search Relevance** | N/A | >85% precision@5 | Human evaluation |
| **Platform Detection Accuracy** | N/A | >90% | Automated testing |
| **Document Format Support** | 0 | 5+ formats | Feature coverage |
| **Chunk Quality Score** | N/A | >0.8 coherence | Embedding evaluation |
| **Feature Adoption** | 0% | 70% of active users | Analytics |
| **AI Response Accuracy** | N/A | 30% improvement | User feedback |

#### 3.2.2 Qualitative Metrics

- User satisfaction with document upload experience
- Perceived relevance of retrieved documentation
- Improvement in AI response quality and accuracy
- Ease of documentation management and organization

### 3.3 Key Performance Indicators (KPIs)

1. **Daily Document Uploads**: Volume of documents ingested per day
2. **Retrieval Hit Rate**: Percentage of queries with relevant documents found
3. **Context Utilization**: How often retrieved context is used by AI
4. **Source Freshness**: Average age of documentation sources
5. **User Engagement**: Time spent in documentation management UI
6. **Error Reduction**: Decrease in AI task failures due to missing context

---

## 4. User Stories

### 4.1 Document Upload Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-01 | Agency Owner | As an agency owner, I want to upload PDF documents so that AI agents can reference my SOPs | P0 |
| US-02 | Agency Owner | As an agency owner, I want to upload DOCX files so that AI can access my client guidelines | P0 |
| US-03 | Automation Engineer | As an automation engineer, I want to paste markdown content so that I can add quick documentation | P0 |
| US-04 | Agency Owner | As an agency owner, I want to see upload progress so that I know when processing completes | P0 |
| US-05 | Agency Owner | As an agency owner, I want to upload multiple documents at once to save time | P1 |
| US-06 | Agency Owner | As an agency owner, I want to categorize documents by platform and category | P1 |

### 4.2 URL Ingestion Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-07 | Automation Engineer | As an automation engineer, I want to ingest documentation from URLs so that I can import web docs | P0 |
| US-08 | Automation Engineer | As an automation engineer, I want to automatically detect the platform from URLs | P1 |
| US-09 | Agency Owner | As an agency owner, I want to periodically refresh URL-based documentation | P2 |
| US-10 | Automation Engineer | As an automation engineer, I want to crawl multiple pages from a documentation site | P2 |

### 4.3 Semantic Search Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-11 | User | As a user, I want AI to automatically find relevant documentation for my queries | P0 |
| US-12 | User | As a user, I want to filter searches by platform and category | P0 |
| US-13 | User | As a user, I want to see which documents were used to generate AI responses | P1 |
| US-14 | User | As a user, I want to manually search my documentation for specific information | P1 |
| US-15 | User | As a user, I want to configure minimum similarity thresholds for relevance | P2 |

### 4.4 Context Building Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-16 | User | As a user, I want AI prompts to automatically include relevant documentation context | P0 |
| US-17 | Automation Engineer | As an automation engineer, I want to customize how much context is included | P1 |
| US-18 | User | As a user, I want to see the context that was injected into AI prompts | P1 |
| US-19 | Automation Engineer | As an automation engineer, I want to create custom prompt templates with RAG placeholders | P2 |
| US-20 | User | As a user, I want AI to include relevant examples from documentation | P2 |

### 4.5 Source Management Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-21 | Agency Owner | As an agency owner, I want to view all my documentation sources | P0 |
| US-22 | Agency Owner | As an agency owner, I want to update existing documentation | P0 |
| US-23 | Agency Owner | As an agency owner, I want to delete outdated documentation | P0 |
| US-24 | Agency Owner | As an agency owner, I want to toggle sources active/inactive without deleting | P1 |
| US-25 | Agency Owner | As an agency owner, I want to see chunk counts and token usage per source | P1 |
| US-26 | Agency Owner | As an agency owner, I want to version my documentation sources | P2 |

### 4.6 Platform Detection Stories

| ID | Role | Story | Priority |
|----|------|-------|----------|
| US-27 | User | As a user, I want the system to auto-detect which platform my query relates to | P0 |
| US-28 | Automation Engineer | As an automation engineer, I want to seed platform-specific keywords | P1 |
| US-29 | User | As a user, I want to see detected platforms before AI responds | P1 |
| US-30 | Automation Engineer | As an automation engineer, I want to map custom keywords to platforms | P2 |

---

## 5. Functional Requirements

### 5.1 Document Upload & Processing

#### FR-01: File Upload
- **Description**: Users can upload document files for processing and embedding
- **Input**: File (base64 encoded), filename, MIME type, metadata
- **Output**: Source ID, chunk count, total tokens, processing metadata
- **Business Rules**:
  - Maximum file size: 10MB
  - Supported formats: PDF, DOCX, TXT, HTML, Markdown
  - Supported encodings: UTF-8, UTF-16, ISO-8859-1
  - Minimum content length: 10 characters
  - File validation before processing

#### FR-02: Content Ingestion
- **Description**: Direct text content ingestion without file upload
- **Input**: Content string, platform, category, title, source URL (optional)
- **Output**: Source ID, chunk count, total tokens
- **Fields**:
  | Field | Required | Validation |
  |-------|----------|------------|
  | `content` | Yes | Min 10 characters |
  | `platform` | Yes | Max 50 characters |
  | `category` | Yes | Max 50 characters |
  | `title` | Yes | Min 1 character |
  | `sourceUrl` | No | Valid URL format |
  | `sourceType` | No | markdown, html, pdf, docx |
  | `version` | No | String identifier |

#### FR-03: Intelligent Chunking
- **Description**: Automatically split documents into semantically coherent chunks
- **Options**:
  | Option | Default | Range | Description |
  |--------|---------|-------|-------------|
  | `maxTokens` | 500 | 100-2000 | Maximum tokens per chunk |
  | `overlapTokens` | 50 | 0-500 | Overlap between adjacent chunks |
- **Chunking Strategy**:
  - Respect paragraph boundaries
  - Preserve code blocks intact
  - Maintain list item coherence
  - Split on sentence boundaries when possible

#### FR-04: Document Parsing
- **Description**: Extract text content from various document formats
- **Supported Formats**:
  | Format | MIME Types | Extraction Method |
  |--------|------------|-------------------|
  | PDF | application/pdf | PDF.js / pdf-parse |
  | DOCX | application/vnd.openxmlformats-officedocument.wordprocessingml.document | mammoth |
  | TXT | text/plain | Direct read |
  | HTML | text/html | DOM parsing, text extraction |
  | Markdown | text/markdown | Direct read with metadata |
- **Metadata Extraction**: Title, word count, format, character count

### 5.2 Vector Embedding & Storage

#### FR-05: Embedding Generation
- **Description**: Generate vector embeddings for document chunks
- **Configuration**:
  | Setting | Value |
  |---------|-------|
  | Embedding Model | OpenAI text-embedding-ada-002 or equivalent |
  | Vector Dimensions | 1536 |
  | Batch Size | 100 chunks |
- **Process**:
  1. Chunk document content
  2. Generate embeddings for each chunk
  3. Store embeddings with chunk metadata
  4. Index for similarity search

#### FR-06: Vector Storage
- **Description**: Store and index embeddings for efficient retrieval
- **Storage Schema**:
  | Field | Type | Description |
  |-------|------|-------------|
  | `id` | SERIAL | Primary key |
  | `sourceId` | INTEGER | Foreign key to documentation_sources |
  | `chunkIndex` | INTEGER | Order within source |
  | `content` | TEXT | Chunk text content |
  | `embedding` | VECTOR(1536) | Vector embedding |
  | `tokenCount` | INTEGER | Token count for chunk |
  | `metadata` | JSONB | Additional chunk metadata |

### 5.3 Semantic Retrieval

#### FR-07: Similarity Search
- **Description**: Retrieve relevant chunks based on query similarity
- **Input**: Query string, retrieval options
- **Output**: Array of relevant chunks with similarity scores
- **Options**:
  | Option | Default | Description |
  |--------|---------|-------------|
  | `topK` | 5 | Maximum chunks to return (1-20) |
  | `minSimilarity` | 0.7 | Minimum cosine similarity (0-1) |
  | `platforms` | [] | Filter by platform names |
  | `categories` | [] | Filter by category names |

#### FR-08: Context Building
- **Description**: Build comprehensive context from relevant chunks
- **Input**: Query string, retrieval options
- **Output**: Formatted context string for AI prompts
- **Features**:
  - Deduplicate overlapping content
  - Order by relevance score
  - Respect token limits
  - Include source attribution

### 5.4 System Prompt Building

#### FR-09: RAG-Enhanced Prompts
- **Description**: Automatically build AI system prompts with relevant documentation
- **Input**: User prompt, platform (optional), custom template (optional)
- **Output**: Complete system prompt with documentation context
- **Options**:
  | Option | Default | Description |
  |--------|---------|-------------|
  | `platform` | auto-detect | Target platform for filtering |
  | `customTemplate` | null | Custom prompt template |
  | `maxDocumentationTokens` | 2000 | Max tokens for documentation (100-10000) |
  | `includeExamples` | false | Include code/workflow examples |

#### FR-10: Platform Detection
- **Description**: Automatically detect relevant platforms from user queries
- **Input**: User prompt, URL (optional), context (optional)
- **Output**: Detected platforms, primary platform, DNS/domain flags
- **Detection Methods**:
  - Keyword matching (platform-specific terms)
  - URL pattern recognition
  - Context analysis
  - Historical user patterns

### 5.5 Source Management

#### FR-11: Source CRUD Operations
- **Description**: Create, read, update, and delete documentation sources
- **Operations**:
  | Operation | Endpoint | Description |
  |-----------|----------|-------------|
  | Create | `ingestDocument`, `uploadDocument`, `ingestUrl` | Add new source |
  | Read | `listSources`, `getSource` | Retrieve sources |
  | Update | `updateSource` | Modify source metadata |
  | Delete | `deleteSource` | Remove source and chunks |

#### FR-12: Source Listing & Filtering
- **Description**: List and filter documentation sources
- **Filters**:
  | Filter | Type | Description |
  |--------|------|-------------|
  | `platform` | string | Filter by platform |
  | `category` | string | Filter by category |
  | `isActive` | boolean | Filter by active status |
- **Pagination**: limit (1-100), offset

#### FR-13: Source Details
- **Description**: Retrieve detailed source information with chunks
- **Output**:
  - Source metadata (title, platform, category, version)
  - All chunks with content and token counts
  - Creation and update timestamps
  - Source URL if available

### 5.6 URL Ingestion

#### FR-14: URL Crawling
- **Description**: Crawl and ingest documentation from web URLs
- **Input**: URL, platform (optional), category (optional), title (optional)
- **Output**: Source ID, chunk count, total tokens
- **Features**:
  - Automatic content extraction
  - HTML to text conversion
  - Platform auto-detection from URL
  - Category inference from URL path

#### FR-15: Platform Keyword Seeding
- **Description**: Seed platform-specific keywords for detection
- **Admin Operation**: Run once during initial setup
- **Platforms Supported**:
  | Platform | Keywords Examples |
  |----------|-------------------|
  | GoHighLevel | gohighlevel, highlevel, ghl, funnels, pipelines |
  | Stripe | stripe, payments, subscriptions, invoices |
  | Zapier | zapier, zaps, automation, triggers |
  | Salesforce | salesforce, apex, sobject, force.com |
  | HubSpot | hubspot, workflows, deals, contacts |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| **NFR-01**: Document upload processing | <30 seconds for 100 pages | End-to-end timing |
| **NFR-02**: Embedding generation | <5 seconds per chunk | API response time |
| **NFR-03**: Semantic search latency (P95) | <500ms | API monitoring |
| **NFR-04**: Context building | <1 second | Response timing |
| **NFR-05**: Source listing | <200ms | API response |
| **NFR-06**: Platform detection | <100ms | Inline timing |

### 6.2 Scalability

| Requirement | Target | Approach |
|-------------|--------|----------|
| **NFR-07**: Documents per user | 10,000 | Database indexing |
| **NFR-08**: Chunks per source | 1,000 | Efficient storage |
| **NFR-09**: Total vector storage | 100M vectors | Vector database scaling |
| **NFR-10**: Concurrent queries | 100/second | Connection pooling |
| **NFR-11**: Embedding batch size | 1000 chunks | Async processing |

### 6.3 Reliability

| Requirement | Target | Implementation |
|-------------|--------|----------------|
| **NFR-12**: Document processing success | 99% | Retry logic, validation |
| **NFR-13**: Embedding generation reliability | 99.9% | Fallback providers |
| **NFR-14**: Search availability | 99.95% | Caching, redundancy |
| **NFR-15**: Data durability | 99.999% | Backups, replication |
| **NFR-16**: Zero data loss on failures | 100% | Transactional operations |

### 6.4 Security

| Requirement | Description | Implementation |
|-------------|-------------|----------------|
| **NFR-17**: User data isolation | Documents isolated per user | Row-level security |
| **NFR-18**: Protected endpoints | Authentication required for mutations | protectedProcedure |
| **NFR-19**: Input validation | All inputs validated via Zod schemas | Schema validation |
| **NFR-20**: Content sanitization | Uploaded content sanitized | HTML/XSS filtering |
| **NFR-21**: API key protection | Embedding API keys secured | Environment variables |
| **NFR-22**: File type validation | Only allowed MIME types accepted | Magic byte checking |

### 6.5 Observability

| Requirement | Target | Tools |
|-------------|--------|-------|
| **NFR-23**: Structured logging | All operations logged with context | Pino/Winston |
| **NFR-24**: Error tracking | Errors captured with stack traces | Sentry |
| **NFR-25**: Performance metrics | Latency, throughput tracked | Prometheus/Datadog |
| **NFR-26**: Usage analytics | Document uploads, queries tracked | Analytics |
| **NFR-27**: Alerting | <5 min detection for degradation | PagerDuty |

### 6.6 Maintainability

| Requirement | Description | Implementation |
|-------------|-------------|----------------|
| **NFR-28**: TypeScript strict mode | Type safety enforced | tsconfig strict |
| **NFR-29**: Test coverage | >80% coverage | Jest/Vitest |
| **NFR-30**: API documentation | All endpoints documented | TSDoc comments |
| **NFR-31**: Service separation | Business logic in services | ragService, platformDetectionService |
| **NFR-32**: Schema validation | Zod schemas for all inputs | Input/output validation |

---

## 7. Technical Architecture

### 7.1 System Components

```
+-------------------+     +-------------------+     +---------------------+
|   Frontend (UI)   |     |   tRPC Router     |     |     RAG Router      |
|   React/Next.js   | --> |   API Gateway     | --> |   (rag.ts)          |
+-------------------+     +-------------------+     +---------------------+
        |                                                    |
        |                  +--------------------------------+
        |                  |                |               |
        v                  v                v               v
+---------------+  +---------------+  +-------------+  +----------------+
|   File Upload |  | RAG Service   |  | Platform    |  | Document       |
|   (Base64)    |  |               |  | Detection   |  | Parser Service |
+---------------+  +---------------+  | Service     |  +----------------+
        |                  |          +-------------+          |
        +------------------+----------------+------------------+
                                    |
                                    v
                          +-------------------+
                          |   PostgreSQL      |
                          |   (Drizzle ORM)   |
                          +-------------------+
                                    |
        +---------------------------+---------------------------+
        |                           |                           |
        v                           v                           v
+---------------+          +----------------+          +-----------------+
| documentation |          | documentation  |          | platform        |
| _sources      |          | _chunks        |          | _keywords       |
+---------------+          +----------------+          +-----------------+
        |
        v
+-------------------+
| Vector Index      |
| (pgvector)        |
+-------------------+
        |
        v
+-------------------+
| Embedding API     |
| (OpenAI/Voyage)   |
+-------------------+
```

### 7.2 Database Schema

#### 7.2.1 documentation_sources Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| userId | INTEGER | Reference to users table |
| platform | VARCHAR(50) | Platform identifier |
| category | VARCHAR(50) | Category identifier |
| title | VARCHAR(500) | Document title |
| content | TEXT | Full document content |
| sourceUrl | VARCHAR(2000) | Original source URL |
| sourceType | VARCHAR(20) | markdown, html, pdf, docx |
| version | VARCHAR(50) | Version identifier |
| isActive | BOOLEAN | Active status (default: true) |
| metadata | JSONB | Additional metadata |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

#### 7.2.2 documentation_chunks Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| sourceId | INTEGER | Foreign key to documentation_sources |
| chunkIndex | INTEGER | Order within source document |
| content | TEXT | Chunk text content |
| embedding | VECTOR(1536) | Vector embedding |
| tokenCount | INTEGER | Token count for chunk |
| metadata | JSONB | Chunk-specific metadata |
| createdAt | TIMESTAMP | Creation timestamp |

#### 7.2.3 platform_keywords Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| platform | VARCHAR(50) | Platform identifier |
| keyword | VARCHAR(100) | Detection keyword |
| weight | DECIMAL(3,2) | Keyword weight (0-1) |
| category | VARCHAR(50) | Keyword category |
| createdAt | TIMESTAMP | Creation timestamp |

### 7.3 API Endpoints (tRPC Router)

#### 7.3.1 Document Ingestion Endpoints

| Procedure | Type | Description | Auth |
|-----------|------|-------------|------|
| `rag.ingestDocument` | Mutation | Ingest text content directly | Protected |
| `rag.uploadDocument` | Mutation | Upload and process file | Protected |
| `rag.ingestUrl` | Mutation | Crawl and ingest from URL | Protected |

#### 7.3.2 Retrieval Endpoints

| Procedure | Type | Description | Auth |
|-----------|------|-------------|------|
| `rag.retrieve` | Query | Retrieve relevant chunks | Public |
| `rag.searchSimilar` | Query | Search similar documents | Public |
| `rag.buildContext` | Query | Build context from chunks | Public |
| `rag.buildSystemPrompt` | Mutation | Build RAG-enhanced prompt | Public |

#### 7.3.3 Source Management Endpoints

| Procedure | Type | Description | Auth |
|-----------|------|-------------|------|
| `rag.listSources` | Query | List documentation sources | Protected |
| `rag.getSource` | Query | Get source with chunks | Protected |
| `rag.updateSource` | Mutation | Update source metadata | Protected |
| `rag.deleteSource` | Mutation | Delete source and chunks | Protected |

#### 7.3.4 Platform Detection Endpoints

| Procedure | Type | Description | Auth |
|-----------|------|-------------|------|
| `rag.detectPlatforms` | Mutation | Detect platforms from prompt | Public |
| `rag.seedPlatformKeywords` | Mutation | Seed platform keywords | Protected |

### 7.4 Service Layer

#### 7.4.1 RAG Service (`rag.service.ts`)

| Method | Description |
|--------|-------------|
| `ingest()` | Process and store document with chunks |
| `retrieve()` | Semantic search for relevant chunks |
| `buildSystemPrompt()` | Create RAG-enhanced AI prompt |
| `buildContext()` | Compile context from chunks |
| `deleteSource()` | Remove source and associated chunks |
| `updateSource()` | Update source metadata and re-chunk if needed |
| `ingestUrl()` | Crawl URL and ingest content |

#### 7.4.2 Document Parser Service (`document-parser.service.ts`)

| Method | Description |
|--------|-------------|
| `parse()` | Parse document from buffer |
| `parsePdf()` | Extract text from PDF |
| `parseDocx()` | Extract text from DOCX |
| `parseHtml()` | Extract text from HTML |
| `parseMarkdown()` | Process markdown content |
| `detectFormat()` | Detect document format from MIME/extension |

#### 7.4.3 Platform Detection Service (`platformDetection.service.ts`)

| Method | Description |
|--------|-------------|
| `detect()` | Detect platforms from user input |
| `seedPlatformKeywords()` | Initialize platform keywords |
| `matchKeywords()` | Match query against platform keywords |
| `parseUrl()` | Extract platform from URL patterns |

### 7.5 Data Flow

#### Document Upload Flow
```
1. User uploads document (base64 encoded)
                    |
2. Validate file size (<10MB), format, and content
                    |
3. Parse document via documentParserService
                    |
4. Extract text content and metadata
                    |
5. Create documentation_source record
                    |
6. Chunk content with configured overlap
                    |
7. Generate embeddings for each chunk (batch)
                    |
8. Store chunks with embeddings in documentation_chunks
                    |
9. Return sourceId, chunkCount, totalTokens
```

#### Retrieval Flow
```
1. User query received
                    |
2. Generate embedding for query
                    |
3. Vector similarity search against chunks
                    |
4. Apply filters (platform, category, minSimilarity)
                    |
5. Rank results by similarity score
                    |
6. Return top-K chunks with scores
```

#### System Prompt Building Flow
```
1. User prompt received
                    |
2. Detect relevant platforms from prompt
                    |
3. Retrieve relevant documentation chunks
                    |
4. Build context from chunks (respecting token limit)
                    |
5. Inject context into system prompt template
                    |
6. Return complete system prompt with metadata
```

### 7.6 Technology Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| **API Framework** | tRPC + Express | Type-safe APIs, existing stack |
| **Database** | PostgreSQL + Drizzle | Relational data, strong typing |
| **Vector Storage** | pgvector extension | Integrated vector search |
| **Embedding API** | OpenAI / Voyage AI | High-quality embeddings |
| **PDF Parsing** | pdf-parse | Reliable PDF extraction |
| **DOCX Parsing** | mammoth | Word document support |
| **Validation** | Zod | Runtime type validation |
| **Chunking** | Custom implementation | Semantic-aware splitting |

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Dependency | Component | Impact |
|------------|-----------|--------|
| User Authentication | `schema-auth.ts` | User identity for sources |
| Database Connection | `server/db/index.ts` | Drizzle ORM connection |
| tRPC Core | `server/_core/trpc.ts` | API router framework |
| Schema RAG | `drizzle/schema-rag.ts` | RAG-specific tables |

### 8.2 External Dependencies

| Dependency | Version | Purpose | Risk Level |
|------------|---------|---------|------------|
| pdf-parse | ^1.x | PDF text extraction | Low |
| mammoth | ^1.x | DOCX text extraction | Low |
| openai | ^4.x | Embedding generation | Medium |
| zod | ^3.x | Input validation | Low |
| drizzle-orm | ^0.30.x | Database ORM | Low |
| pgvector | PostgreSQL extension | Vector similarity search | Medium |

### 8.3 Infrastructure Dependencies

| Dependency | Purpose | Fallback |
|------------|---------|----------|
| PostgreSQL | Primary data store | None (required) |
| pgvector | Vector similarity search | External vector DB |
| OpenAI API | Embedding generation | Voyage AI, Cohere |

### 8.4 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API for embeddings | Yes |
| `DATABASE_URL` | PostgreSQL connection | Yes |
| `RAG_CHUNK_SIZE` | Default chunk size | No (default: 500) |
| `RAG_CHUNK_OVERLAP` | Default overlap | No (default: 50) |
| `RAG_MAX_TOKENS` | Max documentation tokens | No (default: 2000) |
| `RAG_MIN_SIMILARITY` | Default similarity threshold | No (default: 0.7) |

---

## 9. Out of Scope

### 9.1 Explicitly Excluded

| Item | Reason | Future Phase |
|------|--------|--------------|
| **Multi-Language Support** | Complexity, focus on English first | v3.0 |
| **Real-Time Document Sync** | External integrations required | v3.0 |
| **OCR for Scanned Documents** | Specialized infrastructure | v2.5 |
| **Audio/Video Transcription** | Different feature scope | Separate PRD |
| **Collaborative Document Editing** | Out of core scope | v3.0 |
| **Document Version Comparison** | Nice-to-have feature | v2.5 |
| **Custom Embedding Models** | Complexity | v3.0 |
| **Fine-Tuned Retrieval** | Requires training data | v3.0 |
| **Document Access Control** | User-level only in v1 | v2.5 |

### 9.2 Deferred Features

| Feature | Priority | Target Release |
|---------|----------|----------------|
| Batch URL Crawling | P2 | v2.3 |
| Documentation Templates | P3 | v2.5 |
| Custom Chunking Strategies | P2 | v2.4 |
| Embedding Model Selection | P2 | v2.5 |
| Cross-User Knowledge Sharing | P3 | v3.0 |
| Document Analytics | P2 | v2.4 |
| API Access for External RAG | P2 | v2.4 |

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **R1**: Embedding API rate limits | Medium | High | Implement queuing, batch processing, exponential backoff |
| **R2**: Embedding API outages | Low | High | Fallback to alternative providers (Voyage, Cohere) |
| **R3**: Large document processing failures | Medium | Medium | Chunked processing, progress tracking, resume capability |
| **R4**: Vector search performance degradation | Medium | Medium | Index optimization, query caching, pagination |
| **R5**: PDF parsing edge cases | Medium | Medium | Multiple parser fallbacks, error handling |
| **R6**: Chunk quality issues | Medium | Medium | Configurable chunking, quality metrics |

### 10.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **R7**: Low retrieval relevance | Medium | High | Continuous evaluation, user feedback, tuning |
| **R8**: Embedding costs | Medium | Medium | Usage monitoring, tier-based limits, caching |
| **R9**: User adoption challenges | Medium | Medium | Onboarding flows, documentation, templates |
| **R10**: Storage costs scaling | Medium | Medium | Retention policies, compression, archival |

### 10.3 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **R11**: Database growth | High | Medium | Partitioning, archival, cleanup jobs |
| **R12**: Query latency degradation | Medium | Medium | Index optimization, caching, monitoring |
| **R13**: Support burden | Medium | Medium | Self-service documentation, in-app help |
| **R14**: Data quality issues | Medium | Medium | Validation, user feedback mechanisms |

### 10.4 Risk Matrix

```
Impact      Critical |     R2     |
            High     |            |     R1, R7
            Medium   |            |     R3, R4, R5, R6, R8, R9, R10, R11, R12, R13, R14
            Low      |            |
                     +-----------+-----------------
                        Low         Medium    High
                            Probability
```

---

## 11. Milestones & Timeline

### 11.1 Phase 1: Foundation (Weeks 1-2)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M1.1** | Database schema design | schema-rag.ts, migrations | Backend |
| **M1.2** | Document parser service | PDF, DOCX, TXT, HTML, MD support | Backend |
| **M1.3** | Basic RAG router | Ingest, retrieve endpoints | Backend |
| **M1.4** | Chunking implementation | Configurable semantic chunking | Backend |
| **M1.5** | Unit tests | 80% coverage for core services | QA |

**Exit Criteria**:
- [ ] Documents can be uploaded and parsed
- [ ] Content is chunked correctly
- [ ] Database schema supports all operations
- [ ] Basic CRUD operations work

### 11.2 Phase 2: Embedding & Search (Weeks 3-4)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M2.1** | Embedding integration | OpenAI embedding client | Backend |
| **M2.2** | Vector storage | pgvector integration | Backend |
| **M2.3** | Similarity search | retrieve, searchSimilar endpoints | Backend |
| **M2.4** | Filtering support | Platform, category, similarity filters | Backend |
| **M2.5** | Integration tests | Embedding, search E2E tests | QA |

**Exit Criteria**:
- [ ] Embeddings generated for all chunks
- [ ] Vector similarity search returns relevant results
- [ ] Filtering works correctly
- [ ] Search latency <500ms

### 11.3 Phase 3: Context Building (Weeks 5-6)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M3.1** | Platform detection | Detection service, keyword seeding | Backend |
| **M3.2** | Context building | buildContext, buildSystemPrompt | Backend |
| **M3.3** | Prompt templates | Configurable templates | Backend |
| **M3.4** | AI integration | Integration with ai.ts router | Full Stack |
| **M3.5** | Performance testing | Latency benchmarks | DevOps |

**Exit Criteria**:
- [ ] Platform detection >90% accuracy
- [ ] Context building respects token limits
- [ ] System prompts include relevant documentation
- [ ] AI responses improved with context

### 11.4 Phase 4: Management & Polish (Weeks 7-8)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M4.1** | Source management | List, update, delete operations | Backend |
| **M4.2** | URL ingestion | ingestUrl endpoint | Backend |
| **M4.3** | Upload UI | Document upload interface | Frontend |
| **M4.4** | Source browser | Source listing and management UI | Frontend |
| **M4.5** | Documentation | API docs, user guide | Tech Writer |

**Exit Criteria**:
- [ ] Full CRUD operations for sources
- [ ] URL ingestion works reliably
- [ ] UI allows document management
- [ ] Documentation is complete

### 11.5 Phase 5: Testing & Launch (Weeks 9-10)

| Milestone | Description | Deliverables | Owner |
|-----------|-------------|--------------|-------|
| **M5.1** | Load testing | Performance benchmarks | DevOps |
| **M5.2** | Security audit | Vulnerability assessment | Security |
| **M5.3** | Beta testing | User feedback collection | Product |
| **M5.4** | Production deployment | Infrastructure, monitoring | DevOps |
| **M5.5** | Launch monitoring | Dashboards, alerts | All |

**Exit Criteria**:
- [ ] Performance meets SLA requirements
- [ ] No critical security vulnerabilities
- [ ] Beta users approve for launch
- [ ] Monitoring and alerting in place

### 11.6 Gantt Chart

```
Week:        1    2    3    4    5    6    7    8    9    10
Phase 1:     ████████
Phase 2:               ████████
Phase 3:                         ████████
Phase 4:                                   ████████
Phase 5:                                             ████████
```

**Total Duration**: 10 weeks
**Buffer**: 1 week built into phases 4-5

---

## 12. Acceptance Criteria

### 12.1 Document Upload & Processing

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-01** | PDF files up to 10MB can be uploaded and parsed | E2E test |
| **AC-02** | DOCX files are correctly converted to text | E2E test |
| **AC-03** | HTML content is extracted without tags | Unit test |
| **AC-04** | Markdown is processed with metadata extraction | Unit test |
| **AC-05** | TXT files are handled with encoding detection | Unit test |
| **AC-06** | Unsupported formats return clear error messages | E2E test |
| **AC-07** | Documents are chunked with configurable size and overlap | Unit test |
| **AC-08** | Processing completes in <60 seconds for standard documents | Performance test |

### 12.2 Vector Embedding & Search

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-09** | Embeddings are generated for all chunks | Integration test |
| **AC-10** | Similarity search returns relevant results | Human evaluation |
| **AC-11** | Search results can be filtered by platform | E2E test |
| **AC-12** | Search results can be filtered by category | E2E test |
| **AC-13** | Minimum similarity threshold is respected | Unit test |
| **AC-14** | Top-K results are returned correctly | Unit test |
| **AC-15** | Search latency is <500ms (P95) | Performance test |

### 12.3 Context Building & Prompts

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-16** | Platform detection achieves >90% accuracy | Automated testing |
| **AC-17** | buildSystemPrompt includes relevant documentation | E2E test |
| **AC-18** | Token limits are respected in context building | Unit test |
| **AC-19** | Retrieved chunks are included in response metadata | E2E test |
| **AC-20** | Custom templates can be provided | E2E test |
| **AC-21** | Examples can be optionally included | E2E test |

### 12.4 Source Management

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-22** | Sources can be listed with pagination | E2E test |
| **AC-23** | Sources can be filtered by platform, category, status | E2E test |
| **AC-24** | Source details include all chunks | E2E test |
| **AC-25** | Sources can be updated (title, content, status) | E2E test |
| **AC-26** | Deleted sources remove all associated chunks | E2E test |
| **AC-27** | Source versioning is tracked | Unit test |
| **AC-28** | Chunk counts and token usage are accurate | Unit test |

### 12.5 URL Ingestion

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-29** | Valid URLs are crawled and content extracted | E2E test |
| **AC-30** | Platform is auto-detected from URL when possible | Unit test |
| **AC-31** | Invalid URLs return appropriate error | E2E test |
| **AC-32** | HTML content is properly converted to text | Unit test |

### 12.6 Performance & Reliability

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-33** | Document processing handles 100-page PDFs | Load test |
| **AC-34** | Embedding generation is resilient to API errors | Integration test |
| **AC-35** | Vector search handles 100K+ chunks efficiently | Performance test |
| **AC-36** | API endpoints respond within SLA | APM metrics |
| **AC-37** | No data loss occurs during processing failures | Chaos test |

### 12.7 Security & Compliance

| ID | Criteria | Verification |
|----|----------|--------------|
| **AC-38** | Documents are isolated per user | Security test |
| **AC-39** | Protected endpoints require authentication | E2E test |
| **AC-40** | Input validation prevents injection attacks | Security audit |
| **AC-41** | File uploads are validated for type and size | E2E test |
| **AC-42** | All operations are logged for audit | Log verification |

---

## Appendix A: API Reference

### A.1 Ingest Document

```typescript
interface IngestDocumentInput {
  platform: string; // Max 50 chars
  category: string; // Max 50 chars
  title: string;
  content: string; // Min 10 chars
  sourceUrl?: string; // Valid URL
  sourceType?: 'markdown' | 'html' | 'pdf' | 'docx';
  version?: string;
  maxTokens?: number; // 100-2000
  overlapTokens?: number; // 0-500
}

interface IngestDocumentOutput {
  success: boolean;
  sourceId: number;
  chunkCount: number;
  totalTokens: number;
  message: string;
}
```

### A.2 Upload Document

```typescript
interface UploadDocumentInput {
  fileContent: string; // Base64 encoded
  filename: string;
  mimeType?: string;
  platform?: string; // Default: 'general'
  category?: string; // Default: 'training'
  title?: string;
  maxTokens?: number;
  overlapTokens?: number;
}

interface UploadDocumentOutput {
  success: boolean;
  sourceId: number;
  chunkCount: number;
  totalTokens: number;
  metadata: {
    title?: string;
    wordCount: number;
    format: string;
  };
  message: string;
}
```

### A.3 Retrieve Documents

```typescript
interface RetrieveInput {
  query: string;
  topK?: number; // 1-20
  platforms?: string[];
  categories?: string[];
  minSimilarity?: number; // 0-1
}

interface RetrieveOutput {
  success: boolean;
  chunks: Array<{
    id: number;
    sourceId: number;
    content: string;
    similarity: number;
    metadata: object;
  }>;
  count: number;
}
```

### A.4 Build System Prompt

```typescript
interface BuildSystemPromptInput {
  userPrompt: string;
  platform?: string;
  customTemplate?: string;
  maxDocumentationTokens?: number; // 100-10000
  includeExamples?: boolean;
}

interface BuildSystemPromptOutput {
  success: boolean;
  systemPrompt: string;
  retrievedChunks: Array<{
    content: string;
    sourceId: number;
    similarity: number;
  }>;
  detectedPlatforms: string[];
  chunkCount: number;
}
```

### A.5 List Sources

```typescript
interface ListSourcesInput {
  platform?: string;
  category?: string;
  isActive?: boolean;
  limit?: number; // 1-100
  offset?: number;
}

interface ListSourcesOutput {
  success: boolean;
  sources: Array<{
    id: number;
    platform: string;
    category: string;
    title: string;
    sourceUrl?: string;
    version?: string;
    isActive: boolean;
    chunkCount: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
  count: number;
}
```

---

## Appendix B: Supported Document Formats

### B.1 Format Details

| Format | Extensions | MIME Types | Max Size | Notes |
|--------|------------|------------|----------|-------|
| PDF | .pdf | application/pdf | 10MB | Text-based PDFs only (no OCR) |
| DOCX | .docx | application/vnd.openxmlformats-officedocument.wordprocessingml.document | 10MB | Modern Word format only |
| TXT | .txt | text/plain | 10MB | UTF-8, UTF-16, ISO-8859-1 |
| HTML | .html, .htm | text/html | 10MB | Tags stripped, text extracted |
| Markdown | .md, .markdown | text/markdown | 10MB | Processed as-is |

### B.2 Parsing Considerations

- **PDF**: Tables may not preserve formatting; images are ignored
- **DOCX**: Basic formatting preserved; embedded objects ignored
- **HTML**: Scripts and styles removed; semantic structure preserved
- **Markdown**: Code blocks preserved; frontmatter extracted as metadata

---

## Appendix C: Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `SOURCE_NOT_FOUND` | 404 | Documentation source does not exist |
| `CHUNK_NOT_FOUND` | 404 | Chunk does not exist |
| `INVALID_FILE_TYPE` | 400 | Unsupported document format |
| `FILE_TOO_LARGE` | 413 | File exceeds 10MB limit |
| `CONTENT_TOO_SHORT` | 400 | Content less than 10 characters |
| `EMBEDDING_FAILED` | 502 | Embedding API error |
| `PARSE_FAILED` | 400 | Document parsing error |
| `INVALID_URL` | 400 | URL format invalid or inaccessible |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Appendix D: Platform Keywords

### D.1 Supported Platforms

| Platform | Example Keywords |
|----------|------------------|
| GoHighLevel | gohighlevel, highlevel, ghl, funnels, pipelines, workflows, forms, calendars |
| Stripe | stripe, payments, subscriptions, invoices, checkout, webhooks |
| Zapier | zapier, zaps, automation, triggers, actions, multi-step |
| Salesforce | salesforce, apex, sobject, force.com, lightning, flows |
| HubSpot | hubspot, workflows, deals, contacts, marketing, automation |
| Shopify | shopify, e-commerce, products, orders, inventory |
| WordPress | wordpress, wp, plugins, themes, gutenberg |
| Notion | notion, databases, pages, blocks, workspace |

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
