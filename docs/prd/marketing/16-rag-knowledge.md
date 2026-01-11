# PRD: RAG Knowledge System

## Overview
A Retrieval-Augmented Generation (RAG) knowledge system that enables Bottleneck-Bots to leverage custom documents and data for context-aware AI responses. The system provides document management, vector embedding generation, semantic search capabilities, and intelligent knowledge base creation for enhanced automation accuracy.

## Problem Statement
AI-powered automations require accurate, context-specific knowledge:
- Generic LLMs lack domain-specific knowledge
- Users need to incorporate their own documentation, SOPs, and data
- Real-time information retrieval improves response accuracy
- Knowledge must be organized and searchable
- Context windows are limited; retrieval enables larger knowledge bases

## Goals & Objectives
- **Primary Goals**
  - Enable upload and management of knowledge documents
  - Generate and index vector embeddings for semantic search
  - Create organized knowledge bases for different use cases
  - Integrate retrieved context into AI workflows

- **Success Metrics**
  - 85% relevance score for retrieved documents
  - < 500ms retrieval latency
  - 95% document processing success rate
  - 40% improvement in AI response accuracy with RAG

## User Stories
- As a **user**, I want to upload my company documents so that bots can reference them
- As a **knowledge manager**, I want to organize documents into collections so that I can manage different domains
- As a **workflow builder**, I want to query the knowledge base so that my bots give accurate answers
- As an **admin**, I want to see usage analytics so that I can optimize our knowledge base
- As a **user**, I want automatic chunking so that I don't need to manually split documents
- As an **enterprise user**, I want access controls so that sensitive documents are protected

## Functional Requirements

### Must Have (P0)
- **Document Management**
  - Upload multiple file formats (PDF, DOCX, TXT, MD, HTML)
  - Document metadata extraction
  - Version tracking for documents
  - Folder/collection organization
  - Bulk upload and management

- **Vector Embedding & Indexing**
  - Automatic text extraction from documents
  - Intelligent document chunking (semantic, paragraph, fixed-size)
  - Embedding generation (OpenAI, Cohere, local models)
  - Vector index management (HNSW, IVF)
  - Incremental updates for modified documents

- **Semantic Search**
  - Natural language queries
  - Configurable similarity thresholds
  - Hybrid search (vector + keyword)
  - Metadata filtering
  - Result ranking and scoring

- **Knowledge Base Creation**
  - Named knowledge bases with descriptions
  - Source document linking
  - Knowledge base versioning
  - Cross-collection querying
  - Access control per knowledge base

- **Context-Aware AI Integration**
  - Automatic context injection
  - Source citation in responses
  - Relevance scoring display
  - Context window optimization
  - Fallback to general knowledge

### Should Have (P1)
- Web page crawling and indexing
- API endpoint for external data ingestion
- Automatic re-indexing on document updates
- Query analytics and optimization suggestions
- Document summarization
- Multi-language support

### Nice to Have (P2)
- Image and diagram understanding (multi-modal)
- Audio/video transcription and indexing
- Knowledge graph generation
- Collaborative editing of knowledge
- AI-powered document categorization
- Question-answer pair extraction

## Non-Functional Requirements

### Performance
- Document processing: < 30 seconds for standard documents
- Embedding generation: < 2 seconds per chunk
- Search latency: < 500ms (p95)
- Support for 1M+ vectors per knowledge base

### Accuracy
- Embedding quality: validated against benchmarks
- Chunk coherence: no mid-sentence splits
- Retrieval relevance: > 85% measured by user feedback

### Scalability
- Horizontal scaling for embedding generation
- Distributed vector index
- Efficient storage for large document collections

## Technical Requirements

### Architecture
```
┌────────────────────────────────────────────────────────────────┐
│                    RAG Knowledge Service                        │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Document    │  │   Chunking   │  │   Embedding          │  │
│  │  Processor   │  │   Engine     │  │   Generator          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Vector     │  │   Search     │  │   Context            │  │
│  │   Index      │  │   Engine     │  │   Builder            │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│    PostgreSQL + pgvector    │    Object Storage    │   Cache   │
└────────────────────────────────────────────────────────────────┘
```

### Dependencies
- **PostgreSQL + pgvector**: Vector storage and similarity search
- **OpenAI/Cohere API**: Embedding generation
- **Object Storage (S3/R2)**: Document file storage
- **Redis**: Search caching and rate limiting
- **Background Workers**: Async document processing

### APIs
- `POST /knowledge/documents` - Upload document
- `GET /knowledge/documents` - List documents
- `GET /knowledge/documents/{id}` - Get document details
- `DELETE /knowledge/documents/{id}` - Delete document
- `POST /knowledge/documents/{id}/reprocess` - Reprocess document
- `POST /knowledge/bases` - Create knowledge base
- `GET /knowledge/bases` - List knowledge bases
- `PUT /knowledge/bases/{id}` - Update knowledge base
- `DELETE /knowledge/bases/{id}` - Delete knowledge base
- `POST /knowledge/bases/{id}/documents` - Add documents to base
- `POST /knowledge/search` - Semantic search
- `POST /knowledge/query` - Query with context (for AI integration)
- `GET /knowledge/analytics` - Usage and performance analytics

### Database Schema
```sql
-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  uploaded_by UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  file_type VARCHAR(20) NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL, -- S3/R2 path
  content_hash VARCHAR(64), -- SHA-256 for deduplication
  extracted_text TEXT,
  word_count INTEGER,
  page_count INTEGER,
  metadata JSONB DEFAULT '{}',
  processing_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  processing_error TEXT,
  version INTEGER DEFAULT 1,
  parent_document_id UUID REFERENCES documents(id), -- for versioning
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Document Chunks
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  start_position INTEGER, -- character position in original
  end_position INTEGER,
  metadata JSONB DEFAULT '{}', -- page number, section, etc.
  embedding vector(1536), -- OpenAI ada-002 dimension
  embedding_model VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(document_id, chunk_index)
);

-- Create vector index
CREATE INDEX ON document_chunks USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Knowledge Bases
CREATE TABLE knowledge_bases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  created_by UUID REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  embedding_model VARCHAR(50) DEFAULT 'text-embedding-ada-002',
  chunk_strategy VARCHAR(30) DEFAULT 'semantic', -- semantic, paragraph, fixed
  chunk_size INTEGER DEFAULT 512,
  chunk_overlap INTEGER DEFAULT 50,
  is_public BOOLEAN DEFAULT FALSE,
  document_count INTEGER DEFAULT 0,
  chunk_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge Base Documents (many-to-many)
CREATE TABLE knowledge_base_documents (
  knowledge_base_id UUID REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (knowledge_base_id, document_id)
);

-- Knowledge Base Access Control
CREATE TABLE knowledge_base_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_base_id UUID REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  team_id UUID,
  permission VARCHAR(20) NOT NULL, -- read, write, admin
  granted_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Search Queries (for analytics)
CREATE TABLE search_queries (
  id UUID DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  knowledge_base_id UUID,
  user_id UUID,
  query_text TEXT NOT NULL,
  query_embedding vector(1536),
  result_count INTEGER,
  top_result_score FLOAT,
  results_used INTEGER, -- how many results were actually used
  feedback_score INTEGER, -- 1-5 rating if provided
  latency_ms INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
);
SELECT create_hypertable('search_queries', 'created_at');

-- Chunking Configurations
CREATE TABLE chunking_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  strategy VARCHAR(30) NOT NULL,
  max_chunk_size INTEGER DEFAULT 512,
  min_chunk_size INTEGER DEFAULT 100,
  overlap INTEGER DEFAULT 50,
  separators TEXT[] DEFAULT ARRAY['\n\n', '\n', '. ', ' '],
  preserve_formatting BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Chunking Strategies
```yaml
strategies:
  semantic:
    description: "Split on semantic boundaries (paragraphs, sections)"
    params:
      max_size: 512
      min_size: 100
      separators: ["\n\n", "\n", ". "]
      preserve_headers: true

  fixed:
    description: "Fixed-size chunks with overlap"
    params:
      chunk_size: 500
      overlap: 50

  paragraph:
    description: "Split on paragraph boundaries"
    params:
      max_size: 1000
      combine_small: true
      min_paragraph_size: 50

  sentence:
    description: "Split on sentence boundaries"
    params:
      sentences_per_chunk: 5
      overlap_sentences: 1
```

### Embedding Models
```yaml
models:
  text-embedding-ada-002:
    provider: openai
    dimensions: 1536
    max_tokens: 8191
    cost_per_1k: 0.0001

  text-embedding-3-small:
    provider: openai
    dimensions: 1536
    max_tokens: 8191
    cost_per_1k: 0.00002

  text-embedding-3-large:
    provider: openai
    dimensions: 3072
    max_tokens: 8191
    cost_per_1k: 0.00013

  embed-multilingual-v3.0:
    provider: cohere
    dimensions: 1024
    max_tokens: 512
    cost_per_1k: 0.0001
```

## Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Document Processing Success | > 95% | Processing logs |
| Retrieval Relevance (MRR@10) | > 0.85 | User feedback sampling |
| Search Latency (p95) | < 500ms | Performance monitoring |
| AI Accuracy Improvement | > 40% | A/B testing |
| Knowledge Base Adoption | > 60% of active orgs | Product analytics |
| Document Indexing Time | < 30s (standard) | Processing metrics |

## Dependencies
- Vector database (pgvector or dedicated solution)
- Embedding API access (OpenAI, Cohere)
- Object storage for documents
- Background job processing
- Text extraction libraries (Apache Tika, pdf-parse)

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Embedding API costs | Medium - Operational expense | Caching, batch processing, model selection |
| Document parsing failures | Medium - Incomplete knowledge | Multiple parser fallbacks, manual review queue |
| Vector index performance | Medium - Slow search | Index optimization, sharding, caching |
| Sensitive data exposure | High - Security/compliance | Access controls, encryption, audit logging |
| Chunk quality issues | Medium - Poor retrieval | Multiple strategies, quality validation, user feedback |
| Storage costs | Medium - Scaling expense | Compression, tiered storage, retention policies |
