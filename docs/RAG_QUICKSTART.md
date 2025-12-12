# RAG System - Quick Start Guide

## Prerequisites

1. **OpenAI API Key**: Required for embeddings
2. **PostgreSQL with pgvector**: Database with vector extension enabled
3. **Node.js**: Version 18 or higher

## Setup (5 minutes)

### Step 1: Configure Environment Variables

Add to your `.env` file:

```env
# OpenAI API Key (for embeddings)
OPENAI_API_KEY=sk-proj-your-key-here

# Database URL (must support pgvector)
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

### Step 2: Run Database Migrations

```bash
# Run all migrations (including pgvector setup)
npm run db:migrate

# Or manually run the SQL migrations
psql $DATABASE_URL < drizzle/migrations/0001_rag_system.sql
psql $DATABASE_URL < drizzle/migrations/0002_enable_pgvector.sql
psql $DATABASE_URL < drizzle/migrations/0003_documentation_chunks_embedding.sql
```

### Step 3: Verify Setup

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# Verify pgvector extension
psql $DATABASE_URL -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

## Basic Usage

### 1. Ingest Your First Document

```typescript
import { ragService } from "@/server/services/rag.service";

// Ingest a document
const result = await ragService.ingest({
  platform: "gohighlevel",
  category: "api",
  title: "Contact API Documentation",
  content: `
    # Contact API

    Create, update, and manage contacts in GoHighLevel.

    ## Create Contact
    POST /api/v1/contacts

    Required fields:
    - email: string
    - firstName: string (optional)
    - lastName: string (optional)

    Example:
    {
      "email": "user@example.com",
      "firstName": "John"
    }
  `,
  userId: 1, // Your user ID
});

console.log(result);
// Output: { sourceId: 1, chunkCount: 2, totalTokens: 120 }
```

### 2. Ingest from a URL

```typescript
// Automatically crawl and ingest a webpage
const result = await ragService.ingestUrl(
  "https://developers.cloudflare.com/dns/",
  1, // userId
  {
    platform: "cloudflare",
    category: "dns",
  }
);

console.log(`Ingested ${result.chunkCount} chunks from URL`);
```

### 3. Search Documentation

```typescript
// Find relevant documentation chunks
const chunks = await ragService.retrieve(
  "How do I create a contact?",
  {
    topK: 5,
    platforms: ["gohighlevel"],
    minSimilarity: 0.7,
  }
);

chunks.forEach((chunk, i) => {
  console.log(`[${i + 1}] ${(chunk.similarity! * 100).toFixed(1)}% match`);
  console.log(chunk.content);
  console.log("---");
});
```

### 4. Build AI Context

```typescript
// Build context for AI responses
const result = await ragService.buildSystemPrompt(
  "How do I update a contact's email?",
  {
    platform: "gohighlevel",
    maxDocumentationTokens: 3000,
  }
);

console.log("System Prompt:");
console.log(result.systemPrompt);

console.log("\nDetected Platforms:", result.detectedPlatforms);
console.log("Retrieved Chunks:", result.retrievedChunks.length);
```

## API Usage (via tRPC)

### Frontend Integration

```typescript
import { trpc } from "@/lib/trpc";

// In your React component
function DocumentManager() {
  const [url, setUrl] = useState("");

  // Ingest URL
  const ingestMutation = trpc.rag.ingestUrl.useMutation();

  const handleIngest = async () => {
    try {
      const result = await ingestMutation.mutateAsync({
        url: url,
        platform: "gohighlevel",
        category: "api",
      });

      alert(`Success! Ingested ${result.chunkCount} chunks`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter documentation URL"
      />
      <button onClick={handleIngest}>Ingest</button>
    </div>
  );
}

// Search documentation
function DocumentSearch() {
  const [query, setQuery] = useState("");

  const { data } = trpc.rag.searchSimilar.useQuery(
    {
      query: query,
      topK: 5,
      platforms: ["gohighlevel"],
    },
    {
      enabled: query.length > 3,
    }
  );

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search documentation..."
      />

      {data?.chunks.map((chunk) => (
        <div key={chunk.id}>
          <strong>Similarity: {(chunk.similarity! * 100).toFixed(1)}%</strong>
          <p>{chunk.content.substring(0, 200)}...</p>
        </div>
      ))}
    </div>
  );
}

// List sources
function SourceList() {
  const { data } = trpc.rag.listSources.useQuery({
    platform: "gohighlevel",
  });

  const deleteMutation = trpc.rag.deleteSource.useMutation();

  const handleDelete = async (sourceId: number) => {
    if (confirm("Delete this source?")) {
      await deleteMutation.mutateAsync({ sourceId });
    }
  };

  return (
    <div>
      <h2>Documentation Sources</h2>
      {data?.sources.map((source) => (
        <div key={source.id}>
          <h3>{source.title}</h3>
          <p>Platform: {source.platform} | Category: {source.category}</p>
          <button onClick={() => handleDelete(source.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

## Common Recipes

### Recipe 1: Bulk Ingest Documentation

```typescript
const docs = [
  {
    title: "Contacts API",
    url: "https://example.com/docs/contacts",
  },
  {
    title: "Campaigns API",
    url: "https://example.com/docs/campaigns",
  },
  {
    title: "Workflows API",
    url: "https://example.com/docs/workflows",
  },
];

for (const doc of docs) {
  const result = await ragService.ingestUrl(doc.url, userId, {
    platform: "gohighlevel",
    category: "api",
    title: doc.title,
  });

  console.log(`✓ ${doc.title}: ${result.chunkCount} chunks`);
}
```

### Recipe 2: Update Existing Documentation

```typescript
// Get source ID
const sources = await ragService.listSources({
  platform: "gohighlevel",
});

const contactsDoc = sources.find(s => s.title === "Contacts API");

// Update with new content
await ragService.updateSource(contactsDoc.id, {
  content: "# Updated Contacts API\n\n...",
  version: "v2",
});

console.log("Documentation updated and re-embedded");
```

### Recipe 3: Multi-Platform Search

```typescript
const query = "How do I configure DNS records?";

const chunks = await ragService.retrieve(query, {
  topK: 10,
  platforms: ["cloudflare", "godaddy", "namecheap"],
  minSimilarity: 0.6,
});

// Group by platform
const byPlatform = chunks.reduce((acc, chunk) => {
  const platform = chunk.metadata?.platform || "unknown";
  if (!acc[platform]) acc[platform] = [];
  acc[platform].push(chunk);
  return acc;
}, {} as Record<string, typeof chunks>);

console.log("Results by platform:");
Object.entries(byPlatform).forEach(([platform, chunks]) => {
  console.log(`${platform}: ${chunks.length} results`);
});
```

### Recipe 4: Custom AI Assistant

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function askAssistant(question: string) {
  // Build RAG context
  const ragResult = await ragService.buildSystemPrompt(question, {
    maxDocumentationTokens: 4000,
  });

  // Ask Claude with documentation context
  const response = await anthropic.messages.create({
    model: "claude-3-7-sonnet-latest",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: ragResult.systemPrompt,
      },
    ],
  });

  return response.content[0].text;
}

// Usage
const answer = await askAssistant(
  "How do I create a webhook in GoHighLevel?"
);
console.log(answer);
```

## Testing

### Manual Testing

```bash
# Start development server
npm run dev

# In another terminal, run the examples
ts-node server/examples/rag-integration-example.ts
```

### Test Queries

Try these queries to test your RAG system:

```typescript
const testQueries = [
  "How do I create a contact?",
  "What are the required fields for contacts?",
  "How do I update DNS records?",
  "What is the authentication method?",
  "How do I handle webhooks?",
];

for (const query of testQueries) {
  const chunks = await ragService.retrieve(query, { topK: 3 });
  console.log(`\nQuery: ${query}`);
  console.log(`Results: ${chunks.length}`);

  if (chunks.length > 0) {
    console.log(`Best match: ${(chunks[0].similarity! * 100).toFixed(1)}%`);
  }
}
```

## Troubleshooting

### Issue: "OPENAI_API_KEY is not set"

```bash
# Add to .env
echo "OPENAI_API_KEY=sk-proj-your-key" >> .env

# Restart server
npm run dev
```

### Issue: "pgvector extension not found"

```bash
# Connect to database
psql $DATABASE_URL

# Enable extension
CREATE EXTENSION IF NOT EXISTS vector;

# Verify
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### Issue: "No chunks found"

```typescript
// Check if documents exist
const sources = await ragService.listSources();
console.log(`Total sources: ${sources.length}`);

// Check if embeddings exist
const db = await getDb();
const chunks = await db.execute(sql`
  SELECT COUNT(*) as count
  FROM documentation_chunks
  WHERE embedding IS NOT NULL
`);
console.log(`Chunks with embeddings: ${chunks.rows[0].count}`);
```

### Issue: Slow searches

```bash
# Check if indexes exist
psql $DATABASE_URL -c "
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'documentation_chunks';
"

# If missing, create HNSW index
psql $DATABASE_URL -c "
CREATE INDEX IF NOT EXISTS documentation_chunks_embedding_hnsw_idx
ON documentation_chunks
USING hnsw (embedding vector_cosine_ops);
"
```

## Next Steps

1. **Read the full documentation**: See [RAG_SYSTEM.md](./RAG_SYSTEM.md)
2. **Explore examples**: Check [rag-integration-example.ts](../server/examples/rag-integration-example.ts)
3. **Integrate with AI chat**: See AI router integration examples
4. **Monitor performance**: Add logging and analytics
5. **Customize**: Create custom templates and chunking strategies

## Support

- Documentation: `/docs/RAG_SYSTEM.md`
- Examples: `/server/examples/rag-integration-example.ts`
- Schema: `/drizzle/schema-rag.ts`
- Service: `/server/services/rag.service.ts`
- API: `/server/api/routers/rag.ts`
