/**
 * RAG Embeddings Service
 *
 * Generates vector embeddings for website knowledge, action sequences,
 * and support documents using OpenAI's embedding API.
 *
 * Used for semantic search to find relevant knowledge for browser automation.
 */

import OpenAI from "openai";

// Validate API key at module load
if (!process.env.OPENAI_API_KEY) {
  console.warn("[RAG Embeddings] OPENAI_API_KEY not set - embedding functions will fail");
}

// Initialize OpenAI client (lazy to allow startup without key for non-RAG features)
let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is required for RAG embeddings. Please set it in your .env file.");
  }
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

// Embedding model configuration
const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;
const MAX_TOKENS = 8191; // Model limit

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error("Cannot generate embedding for empty text");
  }

  // Truncate if too long (rough estimate: 1 token H 4 chars)
  const maxChars = MAX_TOKENS * 4;
  const truncatedText = text.length > maxChars ? text.slice(0, maxChars) : text;

  try {
    const openai = getOpenAI();
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: truncatedText,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("[RAG Embeddings] Failed to generate embedding:", error);
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts (batch processing)
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (!texts || texts.length === 0) {
    return [];
  }

  // Filter out empty texts and truncate
  const maxChars = MAX_TOKENS * 4;
  const processedTexts = texts
    .filter((t) => t && t.trim().length > 0)
    .map((t) => (t.length > maxChars ? t.slice(0, maxChars) : t));

  if (processedTexts.length === 0) {
    return [];
  }

  try {
    const openai = getOpenAI();
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: processedTexts,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    return response.data.map((d) => d.embedding);
  } catch (error) {
    console.error("[RAG Embeddings] Failed to generate batch embeddings:", error);
    throw error;
  }
}

/**
 * Generate embedding for page knowledge
 * Combines page information into a searchable text
 */
export function createPageKnowledgeText(page: {
  pageName?: string;
  pageType?: string;
  description?: string;
  urlPattern?: string;
  knownElements?: any[];
}): string {
  const parts = [
    page.pageName && `Page: ${page.pageName}`,
    page.pageType && `Type: ${page.pageType}`,
    page.description && `Description: ${page.description}`,
    page.urlPattern && `URL Pattern: ${page.urlPattern}`,
    page.knownElements &&
      `Elements: ${page.knownElements.map((e: any) => e.description || e.selector).join(", ")}`,
  ].filter(Boolean);

  return parts.join("\n");
}

/**
 * Generate embedding for element selector
 */
export function createElementSelectorText(element: {
  elementName: string;
  elementType?: string;
  description?: string;
  primarySelector?: string;
  ariaLabel?: string;
}): string {
  const parts = [
    `Element: ${element.elementName}`,
    element.elementType && `Type: ${element.elementType}`,
    element.description && `Description: ${element.description}`,
    element.ariaLabel && `Aria Label: ${element.ariaLabel}`,
    element.primarySelector && `Selector: ${element.primarySelector}`,
  ].filter(Boolean);

  return parts.join("\n");
}

/**
 * Generate embedding for action sequence
 */
export function createActionSequenceText(sequence: {
  name: string;
  description?: string;
  taskType?: string;
  triggerInstruction?: string;
  steps?: any[];
  expectedOutcome?: string;
}): string {
  const parts = [
    `Task: ${sequence.name}`,
    sequence.taskType && `Type: ${sequence.taskType}`,
    sequence.description && `Description: ${sequence.description}`,
    sequence.triggerInstruction && `Trigger: ${sequence.triggerInstruction}`,
    sequence.expectedOutcome && `Expected Outcome: ${sequence.expectedOutcome}`,
    sequence.steps &&
      `Steps: ${sequence.steps.map((s: any) => s.action || s.description).join(" -> ")}`,
  ].filter(Boolean);

  return parts.join("\n");
}

/**
 * Generate embedding for error pattern
 */
export function createErrorPatternText(error: {
  errorType: string;
  errorPattern?: string;
  description?: string;
  recoveryStrategy?: string;
  recoverySteps?: any[];
}): string {
  const parts = [
    `Error Type: ${error.errorType}`,
    error.errorPattern && `Pattern: ${error.errorPattern}`,
    error.description && `Description: ${error.description}`,
    error.recoveryStrategy && `Recovery Strategy: ${error.recoveryStrategy}`,
    error.recoverySteps &&
      `Recovery Steps: ${error.recoverySteps.map((s: any) => s.action || s.description).join(" -> ")}`,
  ].filter(Boolean);

  return parts.join("\n");
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Embedding dimensions must match");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}

/**
 * Find top-k similar items from a list of embeddings
 */
export function findTopK<T extends { embedding: number[] }>(
  queryEmbedding: number[],
  items: T[],
  k: number = 5
): (T & { similarity: number })[] {
  const scored = items.map((item) => ({
    ...item,
    similarity: cosineSimilarity(queryEmbedding, item.embedding),
  }));

  return scored.sort((a, b) => b.similarity - a.similarity).slice(0, k);
}

/**
 * Chunk text for embedding (for long documents)
 */
export function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] {
  if (text.length <= chunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    // Try to break at sentence or paragraph boundary
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf(".", end);
      const lastNewline = text.lastIndexOf("\n", end);
      const breakPoint = Math.max(lastPeriod, lastNewline);

      if (breakPoint > start + chunkSize / 2) {
        end = breakPoint + 1;
      }
    }

    chunks.push(text.slice(start, end).trim());
    start = end - overlap;
  }

  return chunks.filter((c) => c.length > 0);
}

export { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL };
