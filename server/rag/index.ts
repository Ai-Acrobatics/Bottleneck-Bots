/**
 * RAG (Retrieval-Augmented Generation) Module
 *
 * Provides knowledge base capabilities for the AI browser automation agent.
 *
 * Features:
 * - Website knowledge storage (pages, elements, selectors)
 * - Action sequence patterns (proven automation steps)
 * - Error recovery strategies
 * - Support document search
 * - Learning from execution history
 *
 * Usage:
 * ```typescript
 * import { getAutomationContext, formatContextForPrompt } from '@/server/rag';
 *
 * // Get relevant knowledge for a task
 * const context = await getAutomationContext('https://app.gohighlevel.com/contacts', 'find contact by email');
 *
 * // Format for LLM prompt
 * const contextText = formatContextForPrompt(context);
 * ```
 */

// Schema exports
export {
  websites,
  pageKnowledge,
  elementSelectors,
  actionSequences,
  errorPatterns,
  executionLogs,
  supportDocuments,
  type Website,
  type NewWebsite,
  type PageKnowledge,
  type NewPageKnowledge,
  type ElementSelector,
  type NewElementSelector,
  type ActionSequence,
  type NewActionSequence,
  type ErrorPattern,
  type NewErrorPattern,
  type ExecutionLog,
  type NewExecutionLog,
  type SupportDocument,
  type NewSupportDocument,
} from "./schema";

// Embedding exports
export {
  generateEmbedding,
  generateEmbeddings,
  createPageKnowledgeText,
  createElementSelectorText,
  createActionSequenceText,
  createErrorPatternText,
  cosineSimilarity,
  findTopK,
  chunkText,
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL,
} from "./embeddings";

// Retrieval exports
export {
  getWebsiteByDomain,
  getOrCreateWebsite,
  findPagesForUrl,
  searchPages,
  findSelectorsForElement,
  getSelectorByName,
  updateSelectorReliability,
  findActionSequences,
  getActionSequenceByType,
  findErrorRecovery,
  getErrorPatternByType,
  searchSupportDocs,
  getAutomationContext,
  formatContextForPrompt,
  logExecution,
  type BrowserAutomationContext,
} from "./retrieval";
