-- Migration: Enable pgvector extension for RAG embeddings
-- Required for AI browser automation knowledge base

-- Enable pgvector extension (required for vector similarity search)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector indexes for semantic search performance
-- These use IVFFlat algorithm which is efficient for most use cases

-- Index for page knowledge embeddings
CREATE INDEX IF NOT EXISTS rag_page_knowledge_embedding_idx
ON rag_page_knowledge
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for element selector embeddings
CREATE INDEX IF NOT EXISTS rag_element_selectors_embedding_idx
ON rag_element_selectors
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for action sequence embeddings
CREATE INDEX IF NOT EXISTS rag_action_sequences_embedding_idx
ON rag_action_sequences
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for error pattern embeddings
CREATE INDEX IF NOT EXISTS rag_error_patterns_embedding_idx
ON rag_error_patterns
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for support document embeddings
CREATE INDEX IF NOT EXISTS rag_support_documents_embedding_idx
ON rag_support_documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS rag_element_selectors_website_reliability_idx
ON rag_element_selectors (website_id, reliability_score DESC);

CREATE INDEX IF NOT EXISTS rag_action_sequences_website_task_idx
ON rag_action_sequences (website_id, task_type, success_rate DESC);

CREATE INDEX IF NOT EXISTS rag_error_patterns_website_type_idx
ON rag_error_patterns (website_id, error_type);

-- Index for execution logs time-series queries
CREATE INDEX IF NOT EXISTS rag_execution_logs_session_time_idx
ON rag_execution_logs (session_id, created_at DESC);
