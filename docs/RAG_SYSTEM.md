# RAG (Retrieval-Augmented Generation) System

## Overview

The RAG system provides intelligent document retrieval and context augmentation for AI responses. It enables the AI to answer questions accurately by referencing ingested documentation, API specs, and knowledge base articles.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         RAG System                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Document   │───▶│   Chunking   │───▶│  Embedding   │      │
│  │  Ingestion   │    │   Engine     │    │  Generation  │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                                         │              │
│         ▼                                         ▼              │
│  ┌──────────────────────────────────────────────────────┐      │
│  │           PostgreSQL + pgvector                      │      │
│  │                                                      │      │
│  │  • documentation_sources    (metadata)              │      │
│  │  • documentation_chunks     (text + embeddings)     │      │
│  │  • platform_keywords        (auto-detection)        │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Vector     │───▶│   Context    │───▶│   System     │      │
│  │   Search     │    │   Building   │    │   Prompt     │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                   │              │
└───────────────────────────────────────────────────┼──────────────┘
                                                    ▼
                                           ┌──────────────┐
                                           │  AI Chat     │
                                           │  (Claude/    │
                                           │   Gemini)    │
                                           └──────────────┘
```

## Key Features

### 1. Document Management

#### Ingest Documents
- **Direct Content**: Upload markdown, HTML, or plain text
- **URL Crawling**: Automatically fetch and process web pages
- **Deduplication**: Content hashing prevents duplicate ingestion
- **Versioning**: Track documentation versions

#### Supported Formats
- Markdown (`.md`)
- HTML (web pages)
- Plain text (`.txt`)
- Future: PDF, DOCX

### 2. Intelligent Chunking

Documents are split into optimal chunks for embedding:

```typescript
function chunkDocument(content: string, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  for (let i = 0; i < content.length; i += chunkSize - overlap) {
    chunks.push(content.slice(i, i + chunkSize));
  }
  return chunks;
}
```

**Default Settings:**
- Chunk Size: 1000 characters
- Overlap: 200 characters (maintains context between chunks)
- Smart Splitting: Prefers sentence/paragraph boundaries

### 3. Vector Embeddings

Uses OpenAI's `text-embedding-3-small` model:
- **Dimensions**: 1536
- **Cost-effective**: $0.02 per 1M tokens
- **High-quality**: Optimized for semantic search

### 4. Vector Search

Powered by PostgreSQL's `pgvector` extension:

```sql
-- HNSW Index for fast similarity search
CREATE INDEX documentation_chunks_embedding_hnsw_idx
ON documentation_chunks
USING hnsw (embedding vector_cosine_ops);
```

**Search Query:**
```sql
SELECT content, 1 - (embedding <=> query_vector) as similarity
FROM documentation_chunks
WHERE 1 - (embedding <=> query_vector) >= 0.7
ORDER BY embedding <=> query_vector
LIMIT 5;
```

### 5. Platform Detection

Automatically detects relevant platforms from queries:

```typescript
const platforms = await ragService.detectPlatforms(
  "How do I create a contact in GoHighLevel?"
);
// Returns: ["gohighlevel"]
```

## API Endpoints

### tRPC Endpoints

All endpoints are available via tRPC at `/api/trpc/rag.*`

#### Document Ingestion

```typescript
// Ingest from text
const result = await trpc.rag.ingestDocument.mutate({
  platform: "gohighlevel",
  category: "api",
  title: "Contact API",
  content: "# Contact API...",
  maxTokens: 1000,
  overlapTokens: 200,
});

// Ingest from URL
const result = await trpc.rag.ingestUrl.mutate({
  url: "https://docs.example.com/api",
  platform: "gohighlevel",
  category: "api",
});
```

#### Search & Retrieval

```typescript
// Search similar documents
const result = await trpc.rag.searchSimilar.query({
  query: "How do I create a contact?",
  topK: 5,
  platforms: ["gohighlevel"],
  minSimilarity: 0.7,
});

// Build context
const context = await trpc.rag.buildContext.query({
  query: "DNS configuration",
  topK: 10,
  platforms: ["cloudflare"],
});

// Build system prompt
const prompt = await trpc.rag.buildSystemPrompt.mutate({
  userPrompt: "How do I update DNS?",
  platform: "cloudflare",
  maxDocumentationTokens: 4000,
});
```

#### Source Management

```typescript
// List sources
const sources = await trpc.rag.listSources.query({
  platform: "gohighlevel",
  category: "api",
});

// Get source details
const source = await trpc.rag.getSource.query({
  sourceId: 1,
});

// Update source
await trpc.rag.updateSource.mutate({
  sourceId: 1,
  content: "Updated content...",
  version: "v2",
});

// Delete source
await trpc.rag.deleteSource.mutate({
  sourceId: 1,
});
```

## Integration with AI Chat

### Automatic Context Augmentation

The RAG system can automatically augment AI prompts with relevant documentation:

```typescript
// In ai.router.ts - chat endpoint
const userMessage = "How do I create a contact in GoHighLevel?";

// Build RAG context
const ragResult = await ragService.buildSystemPrompt(userMessage, {
  maxDocumentationTokens: 3000,
});

// Send to AI with augmented context
const messages = [
  {
    role: "system",
    content: ragResult.systemPrompt, // Contains relevant documentation
  },
  {
    role: "user",
    content: userMessage,
  },
];

// AI now has access to relevant documentation
const aiResponse = await anthropic.messages.create({
  model: "claude-3-7-sonnet-latest",
  messages,
});
```

### Custom Templates

Create specialized prompts for different use cases:

```typescript
const customTemplate = `You are a technical support assistant.

**User Question:** {user_prompt}

**Relevant Documentation:**
{context}

**Guidelines:**
- Provide step-by-step instructions
- Include code examples when applicable
- Link to official documentation
- Clarify if information is incomplete`;

const result = await ragService.buildSystemPrompt(userQuestion, {
  customTemplate,
  maxDocumentationTokens: 5000,
});
```

## Database Schema

### documentation_sources

Stores top-level documentation metadata:

```sql
CREATE TABLE documentation_sources (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  platform VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_hash VARCHAR(64), -- For deduplication
  source_url TEXT,
  source_type VARCHAR(50),
  version VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  tags JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### documentation_chunks

Stores chunked content with vector embeddings:

```sql
CREATE TABLE documentation_chunks (
  id SERIAL PRIMARY KEY,
  source_id INTEGER REFERENCES documentation_sources(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  token_count INTEGER NOT NULL,
  embedding vector(1536), -- pgvector column
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- HNSW index for fast vector similarity search
CREATE INDEX documentation_chunks_embedding_hnsw_idx
ON documentation_chunks
USING hnsw (embedding vector_cosine_ops);
```

### platform_keywords

Enables automatic platform detection:

```sql
CREATE TABLE platform_keywords (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(50) NOT NULL,
  keyword VARCHAR(255) NOT NULL,
  weight INTEGER DEFAULT 1,
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Environment Variables

Required environment variables:

```env
# OpenAI API Key (for embeddings)
OPENAI_API_KEY=sk-...

# Database URL (must support pgvector extension)
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

## Setup & Migration

### 1. Enable pgvector Extension

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Run Migrations

```bash
npm run db:migrate
```

Migrations:
- `0001_rag_system.sql` - Create tables
- `0002_enable_pgvector.sql` - Enable vector extension
- `0003_documentation_chunks_embedding.sql` - Add embedding indexes

### 3. Seed Platform Keywords (Optional)

```typescript
await trpc.rag.seedPlatformKeywords.mutate();
```

## Usage Examples

### Example 1: Ingest GoHighLevel API Docs

```typescript
import { ragService } from "@/server/services/rag.service";

const result = await ragService.ingest({
  platform: "gohighlevel",
  category: "api",
  title: "Contacts API",
  content: `
    # Contacts API

    ## Create Contact
    POST /api/v1/contacts

    Request:
    {
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }

    Response:
    {
      "id": "contact_123",
      "email": "user@example.com",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  `,
  sourceUrl: "https://highlevel.stoplight.io/docs/integrations",
  userId: 1,
});

console.log(`Ingested ${result.chunkCount} chunks`);
```

### Example 2: Search for Relevant Docs

```typescript
const chunks = await ragService.retrieve(
  "How do I create a contact?",
  {
    topK: 5,
    platforms: ["gohighlevel"],
    minSimilarity: 0.7,
  }
);

chunks.forEach((chunk) => {
  console.log(`Similarity: ${(chunk.similarity * 100).toFixed(1)}%`);
  console.log(chunk.content);
});
```

### Example 3: Build AI System Prompt

```typescript
const result = await ragService.buildSystemPrompt(
  "How do I update a contact's email address?",
  {
    platform: "gohighlevel",
    maxDocumentationTokens: 3000,
  }
);

// Use in AI chat
const aiResponse = await anthropic.messages.create({
  model: "claude-3-7-sonnet-latest",
  messages: [
    { role: "system", content: result.systemPrompt },
    { role: "user", content: "How do I update a contact's email?" },
  ],
});
```

## Performance Optimization

### Indexing Strategy

**HNSW (Hierarchical Navigable Small World)**
- More accurate search results
- Higher memory usage
- Slower index build
- **Recommended for production**

**IVFFlat (Inverted File with Flat Compression)**
- Faster index build
- Lower memory usage
- Slightly less accurate
- **Recommended for development**

### Query Optimization

```typescript
// Good: Specific platform filter
const chunks = await ragService.retrieve(query, {
  platforms: ["gohighlevel"],
  topK: 5,
});

// Better: Also filter by category
const chunks = await ragService.retrieve(query, {
  platforms: ["gohighlevel"],
  categories: ["api"],
  topK: 5,
});

// Best: Set minimum similarity threshold
const chunks = await ragService.retrieve(query, {
  platforms: ["gohighlevel"],
  categories: ["api"],
  topK: 5,
  minSimilarity: 0.7, // Only return highly relevant results
});
```

### Batch Processing

```typescript
// Ingest multiple documents efficiently
const documents = [doc1, doc2, doc3];

for (const doc of documents) {
  await ragService.ingest(doc);
}
```

## Monitoring & Analytics

Track RAG performance:

```typescript
// Log queries for analysis
const chunks = await ragService.retrieve(query, options);

console.log({
  query,
  chunksFound: chunks.length,
  avgSimilarity: chunks.reduce((sum, c) => sum + (c.similarity || 0), 0) / chunks.length,
  platforms: [...new Set(chunks.map(c => c.metadata?.platform))],
});
```

## Troubleshooting

### Issue: No results found

**Solution:**
- Check if documents are ingested: `await ragService.listSources()`
- Lower `minSimilarity` threshold
- Verify platform keywords are seeded
- Check if embeddings were generated

### Issue: Slow vector search

**Solution:**
- Ensure pgvector indexes exist
- Use platform/category filters
- Reduce `topK` parameter
- Consider IVFFlat instead of HNSW

### Issue: Embeddings not generated

**Solution:**
- Verify `OPENAI_API_KEY` is set
- Check OpenAI API quota
- Review error logs for API failures

## Best Practices

1. **Chunk Size**: Use 500-1000 characters for API docs, 1000-2000 for long-form content
2. **Overlap**: 20% overlap (200 chars for 1000 char chunks) maintains context
3. **Platform Tags**: Always specify platform for better filtering
4. **Deduplication**: Let content hashing prevent duplicate ingestion
5. **Versioning**: Update `version` field when documentation changes
6. **Context Limits**: Keep `maxDocumentationTokens` under 4000 to avoid overwhelming AI

## Future Enhancements

- [ ] PDF document support
- [ ] DOCX document support
- [ ] Automatic documentation refresh (webhooks)
- [ ] Multi-language embeddings
- [ ] Hybrid search (vector + keyword)
- [ ] Query analytics dashboard
- [ ] A/B testing for different chunk sizes
- [ ] Automatic relevance feedback

## References

- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings)
- [RAG Best Practices](https://www.pinecone.io/learn/retrieval-augmented-generation/)
