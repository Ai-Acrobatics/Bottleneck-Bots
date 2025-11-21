-- RAG System Migration
-- Requires PostgreSQL with pgvector extension

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Documentation sources table
CREATE TABLE IF NOT EXISTS documentation_sources (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    "sourceUrl" TEXT,
    "sourceType" VARCHAR(30) DEFAULT 'markdown',
    content TEXT NOT NULL,
    metadata JSONB,
    version VARCHAR(20),
    "isActive" BOOLEAN DEFAULT true NOT NULL,
    "uploadedBy" INTEGER REFERENCES users(id),
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for documentation_sources
CREATE INDEX IF NOT EXISTS platform_idx ON documentation_sources(platform);
CREATE INDEX IF NOT EXISTS category_idx ON documentation_sources(category);
CREATE INDEX IF NOT EXISTS active_idx ON documentation_sources("isActive");

-- Documentation chunks table with vector embeddings
CREATE TABLE IF NOT EXISTS documentation_chunks (
    id SERIAL PRIMARY KEY,
    "sourceId" INTEGER REFERENCES documentation_sources(id) ON DELETE CASCADE NOT NULL,
    platform VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    content TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL,
    embedding vector(1536), -- OpenAI text-embedding-3-small dimensions
    metadata JSONB,
    keywords JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for documentation_chunks
CREATE INDEX IF NOT EXISTS source_id_idx ON documentation_chunks("sourceId");
CREATE INDEX IF NOT EXISTS platform_category_idx ON documentation_chunks(platform, category);

-- HNSW index for vector similarity search (cosine distance)
-- This is the key index for fast semantic search
CREATE INDEX IF NOT EXISTS embedding_idx ON documentation_chunks
    USING hnsw (embedding vector_cosine_ops);

-- Alternatively, use IVFFlat index (comment out HNSW above if using this)
-- CREATE INDEX IF NOT EXISTS embedding_idx ON documentation_chunks
--     USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Platform keywords table
CREATE TABLE IF NOT EXISTS platform_keywords (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,
    keyword VARCHAR(100) NOT NULL,
    "keywordType" VARCHAR(30) NOT NULL, -- url_pattern, domain, keyword, dns_record_type
    priority INTEGER DEFAULT 1 NOT NULL,
    "isActive" BOOLEAN DEFAULT true NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    UNIQUE(platform, keyword, "keywordType")
);

-- Indexes for platform_keywords
CREATE INDEX IF NOT EXISTS platform_keywords_platform_idx ON platform_keywords(platform);
CREATE INDEX IF NOT EXISTS platform_keywords_keyword_idx ON platform_keywords(keyword);
CREATE INDEX IF NOT EXISTS platform_keywords_type_idx ON platform_keywords("keywordType");

-- RAG query logs table
CREATE TABLE IF NOT EXISTS rag_query_logs (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id),
    query TEXT NOT NULL,
    "detectedPlatforms" JSONB,
    "retrievedChunkIds" JSONB,
    "topSimilarityScore" NUMERIC,
    "averageSimilarityScore" NUMERIC,
    "retrievalTimeMs" INTEGER,
    "chunkCount" INTEGER NOT NULL,
    "wasHelpful" BOOLEAN,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for rag_query_logs
CREATE INDEX IF NOT EXISTS rag_user_id_idx ON rag_query_logs("userId");
CREATE INDEX IF NOT EXISTS rag_created_at_idx ON rag_query_logs("createdAt");

-- System prompt templates table
CREATE TABLE IF NOT EXISTS system_prompt_templates (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,
    name TEXT NOT NULL,
    template TEXT NOT NULL,
    description TEXT,
    "isDefault" BOOLEAN DEFAULT false NOT NULL,
    "isActive" BOOLEAN DEFAULT true NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for system_prompt_templates
CREATE INDEX IF NOT EXISTS prompt_platform_idx ON system_prompt_templates(platform);
CREATE INDEX IF NOT EXISTS prompt_default_idx ON system_prompt_templates(platform, "isDefault");

-- Insert default system prompt templates
INSERT INTO system_prompt_templates (platform, name, template, description, "isDefault", "isActive")
VALUES
(
    'ghl',
    'GHL Default System Prompt',
    'You are an expert assistant for GoHighLevel (GHL) CRM and marketing automation platform.

Use the following documentation to provide accurate answers:

{{DOCUMENTATION}}

Guidelines:
- Provide step-by-step instructions for GHL features
- Include API endpoints and webhook configurations when relevant
- Explain workflow automation and pipeline management clearly
- Always cite the documentation source when quoting specific information',
    'Default system prompt for GoHighLevel platform',
    true,
    true
),
(
    'dns',
    'DNS Expert System Prompt',
    'You are a DNS (Domain Name System) expert specializing in DNS records, configuration, and troubleshooting.

Use the following documentation about DNS records and management:

{{DOCUMENTATION}}

Your expertise includes:
- DNS record types (A, AAAA, CNAME, MX, TXT, NS, SOA, SRV, CAA, PTR)
- DNS propagation and TTL (Time To Live)
- DNS lookup tools (dig, nslookup, host)
- DNS troubleshooting and debugging
- DNS security (DNSSEC, SPF, DKIM, DMARC)

Guidelines:
- Always explain the purpose and impact of DNS changes
- Provide expected propagation times (typically 24-48 hours, but can be faster)
- Include verification steps using DNS lookup tools
- Warn about potential issues (e.g., MX record priorities, CNAME limitations)
- Cite documentation sources when providing specific configurations',
    'System prompt for DNS-related queries',
    true,
    true
),
(
    'domain',
    'Domain Management System Prompt',
    'You are a domain management expert specializing in domain registration, transfers, and configuration.

Use the following documentation:

{{DOCUMENTATION}}

Your expertise includes:
- Domain registration and renewal
- Domain transfers (EPP/auth codes, transfer locks)
- WHOIS privacy and domain privacy
- Domain forwarding and redirects
- Subdomain configuration
- Domain expiration and grace periods

Guidelines:
- Explain domain transfer processes clearly with timelines
- Always mention domain lock status when discussing transfers
- Provide registrar-specific instructions when relevant
- Explain EPP/auth code requirements
- Warn about domain expiration and renewal deadlines',
    'System prompt for domain management tasks',
    true,
    true
),
(
    'stagehand',
    'Stagehand Browser Automation Prompt',
    'You are an expert in Stagehand browser automation library for AI-powered web interactions.

Use the following documentation:

{{DOCUMENTATION}}

Your expertise includes:
- Stagehand act(), observe(), extract() methods
- Browser automation best practices
- Selector strategies and element interaction
- Error handling and retry logic
- Integration with Browserbase

Guidelines:
- Provide code examples for Stagehand methods
- Explain when to use act() vs observe() vs extract()
- Include error handling patterns
- Mention Browserbase session management
- Cite API documentation when relevant',
    'System prompt for Stagehand automation',
    true,
    true
);

-- Comments for documentation
COMMENT ON TABLE documentation_sources IS 'Stores original documentation files before chunking';
COMMENT ON TABLE documentation_chunks IS 'Stores chunked documentation with vector embeddings for semantic search';
COMMENT ON TABLE platform_keywords IS 'Platform detection keywords for automatic platform identification';
COMMENT ON TABLE rag_query_logs IS 'Logs RAG queries for analytics and improvement';
COMMENT ON TABLE system_prompt_templates IS 'Pre-defined system prompt templates for different platforms';

COMMENT ON COLUMN documentation_chunks.embedding IS 'OpenAI text-embedding-3-small vector (1536 dimensions)';
COMMENT ON INDEX embedding_idx IS 'HNSW index for fast cosine similarity search on embeddings';
