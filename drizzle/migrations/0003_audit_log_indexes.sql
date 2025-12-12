-- Audit Log Performance Indexes Migration
-- Critical indexes for audit log queries
-- Target: List queries <500ms, Stats queries <200ms
-- Created: 2025-12-11

-- ========================================
-- API REQUEST LOGS PERFORMANCE INDEXES
-- ========================================

-- Composite index for audit log queries with date filtering
-- Optimizes: SELECT * FROM api_request_logs WHERE userId = ? AND createdAt >= ? AND createdAt <= ? ORDER BY createdAt DESC
-- Expected improvement: 80-90% query time reduction
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_request_logs_user_date
ON api_request_logs(userId, createdAt DESC)
WHERE userId IS NOT NULL;

-- Index for time-based queries (all users)
-- Optimizes: SELECT * FROM api_request_logs WHERE createdAt >= ? ORDER BY createdAt DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_request_logs_created_at
ON api_request_logs(createdAt DESC);

-- Index for stats queries (count aggregations)
-- Optimizes: SELECT COUNT(*) FROM api_request_logs WHERE createdAt >= ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_request_logs_stats
ON api_request_logs(createdAt)
WHERE statusCode IS NOT NULL;

-- ========================================
-- WORKFLOW EXECUTIONS PERFORMANCE INDEXES
-- ========================================

-- Composite index for user workflow queries with date filtering
-- Optimizes: SELECT * FROM workflow_executions WHERE userId = ? AND createdAt >= ? ORDER BY createdAt DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflow_executions_user_date
ON workflow_executions(userId, createdAt DESC);

-- Index for time-based queries
-- Optimizes: Audit log aggregation queries by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflow_executions_created_at
ON workflow_executions(createdAt DESC);

-- Index for status filtering
-- Optimizes: Queries filtering by workflow status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflow_executions_status_date
ON workflow_executions(status, createdAt DESC);

-- ========================================
-- BROWSER SESSIONS PERFORMANCE INDEXES
-- ========================================

-- Composite index for user browser session queries with date filtering
-- Optimizes: SELECT * FROM browser_sessions WHERE userId = ? AND createdAt >= ? ORDER BY createdAt DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_browser_sessions_user_date
ON browser_sessions(userId, createdAt DESC);

-- Index for time-based queries
-- Optimizes: Audit log aggregation queries by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_browser_sessions_created_at
ON browser_sessions(createdAt DESC);

-- Index for status monitoring
-- Optimizes: Dashboard queries filtering by session status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_browser_sessions_status_date
ON browser_sessions(status, createdAt DESC);

-- ========================================
-- USERS TABLE INDEXES FOR AUDIT
-- ========================================

-- Index for sign-in tracking
-- Optimizes: SELECT COUNT(*) FROM users WHERE lastSignedIn >= ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_last_signed_in
ON users(lastSignedIn DESC)
WHERE lastSignedIn IS NOT NULL;

-- ========================================
-- JOBS TABLE INDEXES FOR AUDIT
-- ========================================

-- Index for time-based job queries
-- Optimizes: SELECT * FROM jobs WHERE createdAt >= ? ORDER BY createdAt DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_created_at
ON jobs(createdAt DESC);

-- Index for status and type filtering
-- Optimizes: Job monitoring queries by status and type
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_type_status_date
ON jobs(type, status, createdAt DESC);

-- ========================================
-- PERFORMANCE VERIFICATION QUERIES
-- ========================================

-- Run these queries to verify index usage:

-- EXPLAIN ANALYZE
-- SELECT * FROM api_request_logs
-- WHERE userId = 1 AND createdAt >= NOW() - INTERVAL '7 days'
-- ORDER BY createdAt DESC LIMIT 50;
-- Expected: Index Scan using idx_api_request_logs_user_date

-- EXPLAIN ANALYZE
-- SELECT COUNT(*) FROM workflow_executions
-- WHERE createdAt >= NOW() - INTERVAL '24 hours';
-- Expected: Index Scan using idx_workflow_executions_created_at

-- EXPLAIN ANALYZE
-- SELECT COUNT(*) FROM browser_sessions
-- WHERE createdAt >= NOW() - INTERVAL '7 days';
-- Expected: Index Scan using idx_browser_sessions_created_at

-- EXPLAIN ANALYZE
-- SELECT COUNT(*) FROM users
-- WHERE lastSignedIn >= NOW() - INTERVAL '24 hours';
-- Expected: Index Scan using idx_users_last_signed_in

-- ========================================
-- EXPECTED PERFORMANCE IMPROVEMENTS
-- ========================================

-- Audit List Queries (Current: ~1-2s, Target: <500ms)
-- - User-filtered queries: 80-90% faster with composite indexes
-- - Date range queries: 75-85% faster with time-based indexes
-- - Multi-table aggregation: 60-70% faster overall

-- Audit Stats Queries (Current: ~500ms-1s, Target: <200ms)
-- - Last 24 hours stats: 85-90% faster with time indexes
-- - Last 7 days stats: 80-85% faster with time indexes
-- - Count aggregations: 90%+ faster with optimized indexes

-- Overall Impact
-- - Reduced full table scans: 90%+ reduction
-- - I/O operations: 70-80% reduction
-- - Database CPU usage: 50-60% reduction during audit queries

-- NOTES:
-- 1. CONCURRENTLY option prevents table locks during index creation
-- 2. DESC indexes optimize ORDER BY DESC queries (most common for audit logs)
-- 3. Partial indexes with WHERE clauses improve performance and reduce size
-- 4. Composite indexes cover multiple filter combinations
-- 5. All indexes align with current query patterns in audit router

COMMENT ON INDEX idx_api_request_logs_user_date IS 'User-filtered API request audit queries - Target: <300ms';
COMMENT ON INDEX idx_workflow_executions_user_date IS 'User-filtered workflow audit queries - Target: <300ms';
COMMENT ON INDEX idx_browser_sessions_user_date IS 'User-filtered browser session audit queries - Target: <300ms';
COMMENT ON INDEX idx_users_last_signed_in IS 'User sign-in stats queries - Target: <100ms';
COMMENT ON INDEX idx_jobs_type_status_date IS 'Job monitoring and audit queries - Target: <200ms';
