-- Migration: Add vector embedding support for documentation_chunks
-- This ensures the embedding column and index exist for RAG functionality

-- The embedding column was already added in 0001_rag_system.sql,
-- but this migration ensures the index exists for optimal performance

-- Create HNSW index for vector similarity search if it doesn't exist
-- HNSW is more accurate than IVFFlat but requires more memory
CREATE INDEX IF NOT EXISTS documentation_chunks_embedding_hnsw_idx
ON documentation_chunks
USING hnsw (embedding vector_cosine_ops);

-- Alternative: IVFFlat index (faster build, slightly less accurate)
-- Uncomment the line below and comment out the HNSW index above if you prefer IVFFlat
-- CREATE INDEX IF NOT EXISTS documentation_chunks_embedding_ivfflat_idx
-- ON documentation_chunks
-- USING ivfflat (embedding vector_cosine_ops)
-- WITH (lists = 100);

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS documentation_chunks_source_platform_idx
ON documentation_chunks(source_id, platform);

CREATE INDEX IF NOT EXISTS documentation_chunks_category_idx
ON documentation_chunks(category);
