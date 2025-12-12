/**
 * RAG Integration Examples
 *
 * This file demonstrates how to integrate RAG (Retrieval-Augmented Generation)
 * with the AI chat system to provide context-aware responses.
 */

import { ragService } from "../services/rag.service";

/**
 * Example 1: Basic Document Ingestion
 *
 * How to ingest a document into the RAG system
 */
export async function exampleIngestDocument() {
  const result = await ragService.ingest({
    platform: "gohighlevel",
    category: "api",
    title: "GoHighLevel API Documentation",
    content: `
      # GoHighLevel API

      ## Authentication
      All API requests require authentication using an API key.
      Include the API key in the Authorization header:

      Authorization: Bearer YOUR_API_KEY

      ## Contacts API

      ### Create Contact
      POST /api/v1/contacts

      Body:
      {
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890"
      }

      ### Get Contact
      GET /api/v1/contacts/:id

      ### Update Contact
      PUT /api/v1/contacts/:id

      ### Delete Contact
      DELETE /api/v1/contacts/:id
    `,
    sourceUrl: "https://highlevel.stoplight.io/docs/integrations",
    sourceType: "markdown",
    version: "v1",
    userId: 1, // System user
    chunkingOptions: {
      maxTokens: 500, // Smaller chunks for API documentation
      overlapTokens: 50,
    },
  });

  console.log("Ingestion result:", result);
  // Output: { sourceId: 1, chunkCount: 3, totalTokens: 450 }
}

/**
 * Example 2: Ingest from URL
 *
 * How to crawl and ingest a webpage
 */
export async function exampleIngestUrl() {
  const result = await ragService.ingestUrl(
    "https://developers.cloudflare.com/dns/",
    1, // userId
    {
      platform: "cloudflare",
      category: "dns",
      title: "Cloudflare DNS Documentation",
    }
  );

  console.log("URL ingestion result:", result);
}

/**
 * Example 3: Search Similar Documents
 *
 * How to find relevant documentation chunks
 */
export async function exampleSearchDocuments() {
  const query = "How do I create a contact in GoHighLevel?";

  const chunks = await ragService.retrieve(query, {
    topK: 5,
    platforms: ["gohighlevel"],
    categories: ["api"],
    minSimilarity: 0.7,
  });

  console.log(`Found ${chunks.length} relevant chunks:`);
  chunks.forEach((chunk, index) => {
    console.log(`\n[${index + 1}] Similarity: ${(chunk.similarity! * 100).toFixed(1)}%`);
    console.log(chunk.content.substring(0, 200) + "...");
  });
}

/**
 * Example 4: Build Context for AI
 *
 * How to build enriched context from documentation
 */
export async function exampleBuildContext() {
  const userQuery = "How do I add a contact to GoHighLevel using the API?";

  const context = await ragService.buildContext(userQuery, {
    topK: 3,
    platforms: ["gohighlevel"],
  });

  console.log("Built context:");
  console.log(context);
}

/**
 * Example 5: Build System Prompt with RAG
 *
 * How to create an AI system prompt augmented with relevant documentation
 */
export async function exampleBuildSystemPrompt() {
  const userPrompt = "I need to create a new contact in GoHighLevel. What's the API endpoint and what fields are required?";

  const result = await ragService.buildSystemPrompt(userPrompt, {
    platform: "gohighlevel", // Optional: specify platform
    maxDocumentationTokens: 2000, // Limit context size
    includeExamples: true,
  });

  console.log("\n=== System Prompt ===");
  console.log(result.systemPrompt);
  console.log("\n=== Detected Platforms ===");
  console.log(result.detectedPlatforms);
  console.log("\n=== Retrieved Chunks ===");
  console.log(`${result.retrievedChunks.length} chunks used for context`);
}

/**
 * Example 6: Integration with AI Chat
 *
 * How to integrate RAG with the AI router chat endpoint
 */
export async function exampleIntegrateWithAIChat() {
  // This would typically be done in the AI router
  const userMessage = "How do I update a DNS record in Cloudflare?";

  // Step 1: Build RAG-augmented system prompt
  const ragResult = await ragService.buildSystemPrompt(userMessage, {
    maxDocumentationTokens: 3000,
  });

  // Step 2: Use the augmented system prompt in AI chat
  const messages = [
    {
      role: "system" as const,
      content: ragResult.systemPrompt,
    },
    {
      role: "user" as const,
      content: userMessage,
    },
  ];

  // Step 3: Send to AI (this would use Anthropic/OpenAI API)
  console.log("Messages to send to AI:");
  console.log(JSON.stringify(messages, null, 2));

  // The AI will now have access to relevant documentation context
  // and can provide accurate, documentation-based answers
}

/**
 * Example 7: Update Documentation Source
 *
 * How to update existing documentation when it changes
 */
export async function exampleUpdateSource() {
  const sourceId = 1; // ID of the documentation source

  await ragService.updateSource(sourceId, {
    content: `
      # GoHighLevel API - Updated

      ## Authentication
      All API requests require authentication using an API key.
      Include the API key in the Authorization header:

      Authorization: Bearer YOUR_API_KEY

      ## Contacts API v2

      ### Create Contact (NEW)
      POST /api/v2/contacts

      Body:
      {
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890",
        "tags": ["new", "imported"] // NEW: Tags support
      }
    `,
    version: "v2",
  });

  console.log("Source updated and re-embedded");
}

/**
 * Example 8: List All Sources
 *
 * How to view all ingested documentation
 */
export async function exampleListSources() {
  const sources = await ragService.listSources({
    platform: "gohighlevel",
  });

  console.log(`Found ${sources.length} sources:`);
  sources.forEach((source) => {
    console.log(`\n- [${source.id}] ${source.title}`);
    console.log(`  Platform: ${source.platform} | Category: ${source.category}`);
    console.log(`  Version: ${source.version || "N/A"}`);
    console.log(`  Active: ${source.isActive}`);
  });
}

/**
 * Example 9: Delete Source
 *
 * How to remove outdated documentation
 */
export async function exampleDeleteSource() {
  const sourceId = 1;

  await ragService.deleteSource(sourceId);

  console.log(`Source ${sourceId} deleted successfully`);
}

/**
 * Example 10: Multi-Platform Context
 *
 * How to retrieve context from multiple platforms
 */
export async function exampleMultiPlatformContext() {
  const query = "How do I set up DNS records for my domain?";

  const chunks = await ragService.retrieve(query, {
    topK: 10,
    platforms: ["cloudflare", "godaddy", "namecheap"], // Multiple platforms
    minSimilarity: 0.6,
  });

  // Group chunks by platform
  const byPlatform = chunks.reduce((acc, chunk) => {
    const platform = chunk.metadata?.platform || "unknown";
    if (!acc[platform]) acc[platform] = [];
    acc[platform].push(chunk);
    return acc;
  }, {} as Record<string, typeof chunks>);

  console.log("Results by platform:");
  Object.entries(byPlatform).forEach(([platform, platformChunks]) => {
    console.log(`\n${platform}: ${platformChunks.length} chunks`);
  });
}

/**
 * Example 11: Custom Template for System Prompt
 *
 * How to use a custom template for specialized use cases
 */
export async function exampleCustomTemplate() {
  const customTemplate = `You are a GoHighLevel API expert assistant.

**Task:** Answer the user's API question using ONLY the official documentation provided below.

**User Question:**
{user_prompt}

**Official GoHighLevel API Documentation:**
{context}

**Response Guidelines:**
1. Provide exact API endpoints with HTTP methods
2. Show request/response examples in JSON format
3. List required vs optional fields
4. Include authentication requirements
5. Mention any rate limits or restrictions
6. If the documentation doesn't cover the question, say "This is not documented in the official API docs"

**Your Answer:**`;

  const result = await ragService.buildSystemPrompt(
    "How do I bulk import contacts?",
    {
      platform: "gohighlevel",
      customTemplate: customTemplate,
      maxDocumentationTokens: 4000,
    }
  );

  console.log(result.systemPrompt);
}

// Run examples
if (require.main === module) {
  (async () => {
    console.log("Running RAG Integration Examples...\n");

    try {
      console.log("\n=== Example 1: Ingest Document ===");
      await exampleIngestDocument();

      console.log("\n=== Example 3: Search Documents ===");
      await exampleSearchDocuments();

      console.log("\n=== Example 5: Build System Prompt ===");
      await exampleBuildSystemPrompt();

      console.log("\n=== Example 8: List Sources ===");
      await exampleListSources();
    } catch (error) {
      console.error("Error running examples:", error);
    }
  })();
}
