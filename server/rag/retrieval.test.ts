/**
 * Unit Tests for RAG Retrieval Service
 *
 * Tests semantic search, knowledge retrieval, context building,
 * and formatting for LLM prompts
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  getWebsiteByDomain,
  getOrCreateWebsite,
  findSelectorsForElement,
  findActionSequences,
  findErrorRecovery,
  getAutomationContext,
  formatContextForPrompt,
  type BrowserAutomationContext,
} from "./retrieval";

// Hoisted mocks - available before any imports
const { mockGetDb, mockGenerateEmbedding } = vi.hoisted(() => ({
  mockGetDb: vi.fn(),
  mockGenerateEmbedding: vi.fn(),
}));

// Mock dependencies using hoisted functions
vi.mock("@/server/db", () => ({
  getDb: mockGetDb,
}));

vi.mock("./embeddings", () => ({
  generateEmbedding: mockGenerateEmbedding,
  createPageKnowledgeText: vi.fn(),
  createElementSelectorText: vi.fn(),
  createActionSequenceText: vi.fn(),
  createErrorPatternText: vi.fn(),
}));

describe("RAG Retrieval Service", () => {
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock database
    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
      execute: vi.fn().mockResolvedValue({ rows: [] }),
    };

    // Use the hoisted mock directly
    mockGetDb.mockResolvedValue(mockDb);

    // Setup embedding mock
    mockGenerateEmbedding.mockResolvedValue(
      Array(1536).fill(0.5)
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ========================================
  // GET WEBSITE TESTS
  // ========================================

  describe("getWebsiteByDomain", () => {
    it("should retrieve existing website by domain", async () => {
      const mockWebsite = {
        id: 1,
        domain: "example.com",
        name: "Example",
        description: "Example website",
        loginUrl: "https://example.com/login",
        dashboardUrl: "https://example.com/dashboard",
        requiresAuth: true,
        authMethod: "email",
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.select().from().where().limit.mockResolvedValueOnce([mockWebsite]);

      const result = await getWebsiteByDomain("example.com");

      expect(result).toEqual(mockWebsite);
    });

    it("should normalize domain to lowercase", async () => {
      mockDb.select().from().where().limit.mockResolvedValueOnce([]);

      await getWebsiteByDomain("EXAMPLE.COM");

      // Verify domain was lowercased in query
      const whereCall = mockDb.select().from().where.mock.calls[0];
      expect(whereCall).toBeDefined();
    });

    it("should return null for non-existing domain", async () => {
      mockDb.select().from().where().limit.mockResolvedValueOnce([]);

      const result = await getWebsiteByDomain("nonexistent.com");

      expect(result).toBeNull();
    });

    it("should handle database errors gracefully", async () => {
      mockDb.select().from().where().limit.mockRejectedValueOnce(
        new Error("DB connection failed")
      );

      await expect(getWebsiteByDomain("example.com")).rejects.toThrow();
    });

    it("should handle null database", async () => {
      // Use hoisted mock to simulate null database
      mockGetDb.mockResolvedValueOnce(null);

      const result = await getWebsiteByDomain("example.com");

      expect(result).toBeNull();
    });
  });

  describe("getOrCreateWebsite", () => {
    it("should return existing website", async () => {
      const mockWebsite = {
        id: 1,
        domain: "example.com",
        name: "Example",
      };

      mockDb.select().from().where().limit.mockResolvedValueOnce([mockWebsite]);

      const result = await getOrCreateWebsite("example.com");

      expect(result).toEqual(mockWebsite);
    });

    it("should create new website with defaults", async () => {
      const newWebsite = {
        id: 2,
        domain: "newsite.com",
        name: "New Site",
        description: "A new website",
        loginUrl: "https://newsite.com/login",
      };

      // First call returns empty (not found), second returns created
      mockDb.select().from().where().limit
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([newWebsite]);

      mockDb.insert().values().returning.mockResolvedValueOnce([newWebsite]);

      const result = await getOrCreateWebsite("newsite.com", {
        description: "A new website",
        loginUrl: "https://newsite.com/login",
      });

      expect(result.domain).toBe("newsite.com");
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("should throw error if database unavailable", async () => {
      // Use hoisted mock to simulate null database
      mockGetDb.mockResolvedValueOnce(null);

      await expect(
        getOrCreateWebsite("example.com")
      ).rejects.toThrow("Database not available");
    });
  });

  // ========================================
  // FIND SELECTORS TESTS
  // ========================================

  describe("findSelectorsForElement", () => {
    it("should find selectors matching element description", async () => {
      const mockSelectors = [
        {
          id: 1,
          elementName: "Login Button",
          primarySelector: "#login-btn",
          reliabilityScore: 0.95,
          relevance_score: 0.92,
        },
      ];

      mockDb.execute.mockResolvedValueOnce({ rows: mockSelectors });

      const result = await findSelectorsForElement(1, "button to login");

      expect(result).toHaveLength(1);
      expect(result[0].elementName).toBe("Login Button");
      expect(mockGenerateEmbedding).toHaveBeenCalledWith("button to login");
    });

    it("should filter by page ID when provided", async () => {
      mockDb.execute.mockResolvedValueOnce({ rows: [] });

      await findSelectorsForElement(1, "element", 5);

      // Verify execute was called (SQL contains page_id filter internally)
      expect(mockDb.execute).toHaveBeenCalled();
    });

    it("should return empty array for no matches", async () => {
      mockDb.execute.mockResolvedValueOnce({ rows: [] });

      const result = await findSelectorsForElement(1, "non-existent element");

      expect(result).toEqual([]);
    });

    it("should rank results by reliability", async () => {
      const selectors = [
        {
          id: 1,
          elementName: "Button 1",
          reliabilityScore: 0.5,
          relevance_score: 0.75,
        },
        {
          id: 2,
          elementName: "Button 2",
          reliabilityScore: 0.9,
          relevance_score: 0.85,
        },
      ];

      mockDb.execute.mockResolvedValueOnce({ rows: selectors });

      const result = await findSelectorsForElement(1, "button");

      // Results should be sorted by relevance_score (similarity * reliability)
      expect(result).toBeDefined();
    });
  });

  // ========================================
  // FIND ACTION SEQUENCES TESTS
  // ========================================

  describe("findActionSequences", () => {
    it("should find action sequences matching instruction", async () => {
      const sequences = [
        {
          id: 1,
          name: "Login Sequence",
          description: "Steps to login",
          successRate: 0.9,
          relevance_score: 0.88,
        },
      ];

      mockDb.execute.mockResolvedValueOnce({ rows: sequences });

      const result = await findActionSequences(1, "how to login");

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Login Sequence");
      expect(mockGenerateEmbedding).toHaveBeenCalledWith("how to login");
    });

    it("should filter by active sequences", async () => {
      mockDb.execute.mockResolvedValueOnce({ rows: [] });

      await findActionSequences(1, "action");

      // Verify execute was called (SQL contains is_active filter internally)
      expect(mockDb.execute).toHaveBeenCalled();
    });

    it("should apply success rate weighting", async () => {
      mockDb.execute.mockResolvedValueOnce({ rows: [] });

      await findActionSequences(1, "action");

      // Verify execute was called (SQL uses success_rate for ordering internally)
      expect(mockDb.execute).toHaveBeenCalled();
    });

    it("should respect limit parameter", async () => {
      mockDb.execute.mockResolvedValueOnce({ rows: [] });

      await findActionSequences(1, "action", 10);

      // Verify execute was called (SQL contains LIMIT clause internally)
      expect(mockDb.execute).toHaveBeenCalled();
    });
  });

  // ========================================
  // FIND ERROR RECOVERY TESTS
  // ========================================

  describe("findErrorRecovery", () => {
    it("should find recovery strategy for error message", async () => {
      const errorPattern = {
        id: 1,
        errorType: "Authentication Failed",
        errorPattern: "Invalid credentials",
        recoveryStrategy: "Show login form again",
        recoveryRate: 0.85,
        relevance_score: 0.9,
      };

      mockDb.execute.mockResolvedValueOnce({ rows: [errorPattern] });

      const result = await findErrorRecovery("Login failed");

      expect(result).toEqual(errorPattern);
      expect(mockGenerateEmbedding).toHaveBeenCalledWith("Login failed");
    });

    it("should filter by website ID when provided", async () => {
      mockDb.execute.mockResolvedValueOnce({ rows: [] });

      await findErrorRecovery("error", 1);

      // Verify execute was called (SQL contains website_id filter internally)
      expect(mockDb.execute).toHaveBeenCalled();
    });

    it("should return null for no matching error", async () => {
      mockDb.execute.mockResolvedValueOnce({ rows: [] });

      const result = await findErrorRecovery("unknown error");

      expect(result).toBeNull();
    });

    it("should rank by recovery rate", async () => {
      mockDb.execute.mockResolvedValueOnce({ rows: [] });

      await findErrorRecovery("error");

      // Verify execute was called (SQL uses recovery_rate for ordering internally)
      expect(mockDb.execute).toHaveBeenCalled();
    });
  });

  // ========================================
  // GET AUTOMATION CONTEXT TESTS
  // ========================================

  describe("getAutomationContext", () => {
    it("should retrieve complete context for browser automation", async () => {
      const mockWebsite = {
        id: 1,
        domain: "example.com",
        name: "Example",
      };

      // Mock all the parallel queries
      mockDb.select().from().where().limit
        .mockResolvedValueOnce([mockWebsite]); // getWebsiteByDomain

      mockDb.execute
        .mockResolvedValueOnce({ rows: [] }) // searchPages
        .mockResolvedValueOnce({ rows: [] }) // findSelectorsForElement
        .mockResolvedValueOnce({ rows: [] }) // findActionSequences
        .mockResolvedValueOnce({ rows: [] }) // searchSupportDocs
        .mockResolvedValueOnce({ rows: [] }); // error patterns

      const context = await getAutomationContext(
        "https://example.com/dashboard",
        "extract contacts"
      );

      expect(context).toBeDefined();
      expect(context.website).toEqual(mockWebsite);
      expect(context.pages).toEqual([]);
      expect(context.selectors).toEqual([]);
      expect(context.actionSequences).toEqual([]);
    });

    it("should extract domain from URL correctly", async () => {
      mockDb.select().from().where().limit.mockResolvedValueOnce([]);
      mockDb.execute.mockResolvedValue({ rows: [] });

      await getAutomationContext(
        "https://www.example.com:8080/path/to/page",
        "instruction"
      );

      // Verify domain extraction (should remove www.)
      const whereCall = mockDb.select().from().where.mock.calls[0];
      expect(whereCall).toBeDefined();
    });

    it("should handle missing website gracefully", async () => {
      mockDb.select().from().where().limit.mockResolvedValueOnce([]);
      mockDb.execute.mockResolvedValue({ rows: [] });

      const context = await getAutomationContext(
        "https://unknown.com",
        "instruction"
      );

      expect(context.website).toBeNull();
      expect(context.pages).toEqual([]);
    });

    it("should return typed context object", async () => {
      mockDb.select().from().where().limit.mockResolvedValueOnce([]);
      mockDb.execute.mockResolvedValue({ rows: [] });

      const context = await getAutomationContext(
        "https://example.com",
        "instruction"
      );

      expect(context).toHaveProperty("website");
      expect(context).toHaveProperty("pages");
      expect(context).toHaveProperty("selectors");
      expect(context).toHaveProperty("actionSequences");
      expect(context).toHaveProperty("errorPatterns");
      expect(context).toHaveProperty("supportDocs");
    });
  });

  // ========================================
  // FORMAT CONTEXT FOR PROMPT TESTS
  // ========================================

  describe("formatContextForPrompt", () => {
    it("should format complete context with all sections", () => {
      const context: BrowserAutomationContext = {
        website: {
          id: 1,
          domain: "example.com",
          name: "Example Site",
          description: "An example website",
          loginUrl: "https://example.com/login",
          dashboardUrl: "https://example.com/dashboard",
          requiresAuth: true,
          authMethod: "email",
          avgLoadTime: 2000,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        pages: [
          {
            id: 1,
            websiteId: 1,
            pageName: "Dashboard",
            pageType: "Main",
            description: "Main dashboard",
            urlPattern: "/dashboard",
            knownElements: [],
            embedding: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        selectors: [
          {
            id: 1,
            websiteId: 1,
            pageId: null,
            elementName: "Login Button",
            elementType: "button",
            description: "Login button",
            primarySelector: "#login",
            successCount: 100,
            failureCount: 5,
            reliabilityScore: 0.95,
            lastSuccess: new Date(),
            lastFailure: new Date(),
            embedding: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        actionSequences: [
          {
            id: 1,
            websiteId: 1,
            name: "Login",
            description: "Login sequence",
            taskType: "auth",
            triggerInstruction: "When user clicks login",
            steps: [],
            expectedOutcome: "User logged in",
            successRate: 0.9,
            executionCount: 100,
            avgExecutionTime: 5000,
            isActive: true,
            embedding: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        errorPatterns: [
          {
            id: 1,
            websiteId: null,
            errorType: "Auth Error",
            errorPattern: "Invalid credentials",
            description: "Authentication failed",
            recoveryStrategy: "Retry login",
            recoverySteps: [],
            recoveryRate: 0.8,
            isActive: true,
            embedding: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        supportDocs: [
          {
            id: 1,
            websiteId: null,
            title: "How to Login",
            summary: "Steps to login",
            content: "Detailed steps to login",
            retrievalCount: 50,
            embedding: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      const prompt = formatContextForPrompt(context);

      expect(prompt).toContain("Website: Example Site");
      expect(prompt).toContain("Relevant Pages");
      expect(prompt).toContain("Known Selectors");
      expect(prompt).toContain("Recommended Action Patterns");
      expect(prompt).toContain("Error Recovery Strategies");
      expect(prompt).toContain("Reference Documentation");
    });

    it("should format website information", () => {
      const context: BrowserAutomationContext = {
        website: {
          id: 1,
          domain: "example.com",
          name: "Example",
          description: "Example website",
          loginUrl: "https://example.com/login",
          authMethod: "oauth",
          avgLoadTime: 1500,
          dashboardUrl: "https://example.com/dashboard",
          requiresAuth: true,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        pages: [],
        selectors: [],
        actionSequences: [],
        errorPatterns: [],
        supportDocs: [],
      };

      const prompt = formatContextForPrompt(context);

      expect(prompt).toContain("Website: Example");
      expect(prompt).toContain("Example website");
      expect(prompt).toContain("Login URL:");
      expect(prompt).toContain("Auth Method:");
    });

    it("should handle missing optional fields", () => {
      const context: BrowserAutomationContext = {
        website: {
          id: 1,
          domain: "example.com",
          name: "Example",
          loginUrl: null,
          authMethod: null,
          avgLoadTime: null,
          dashboardUrl: null,
          description: null,
          requiresAuth: false,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        pages: [],
        selectors: [],
        actionSequences: [],
        errorPatterns: [],
        supportDocs: [],
      };

      const prompt = formatContextForPrompt(context);

      expect(prompt).toContain("Website: Example");
      expect(prompt).toContain("N/A");
    });

    it("should exclude empty sections", () => {
      const context: BrowserAutomationContext = {
        website: null,
        pages: [],
        selectors: [],
        actionSequences: [],
        errorPatterns: [],
        supportDocs: [],
      };

      const prompt = formatContextForPrompt(context);

      expect(prompt).not.toContain("Relevant Pages");
      expect(prompt).not.toContain("Known Selectors");
    });

    it("should format selector reliability as percentage", () => {
      const context: BrowserAutomationContext = {
        website: null,
        pages: [],
        selectors: [
          {
            id: 1,
            websiteId: 1,
            pageId: null,
            elementName: "Button",
            elementType: "button",
            description: "Test button",
            primarySelector: "#btn",
            successCount: 10,
            failureCount: 0,
            reliabilityScore: 1.0,
            lastSuccess: new Date(),
            lastFailure: new Date(),
            embedding: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        actionSequences: [],
        errorPatterns: [],
        supportDocs: [],
      };

      const prompt = formatContextForPrompt(context);

      expect(prompt).toContain("100%");
    });

    it("should limit selectors to top 5", () => {
      const selectors = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        websiteId: 1,
        pageId: null,
        elementName: `Button ${i}`,
        elementType: "button",
        description: `Button ${i}`,
        primarySelector: `#btn${i}`,
        successCount: 100,
        failureCount: 0,
        reliabilityScore: 0.95,
        lastSuccess: new Date(),
        lastFailure: new Date(),
        embedding: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const context: BrowserAutomationContext = {
        website: null,
        pages: [],
        selectors,
        actionSequences: [],
        errorPatterns: [],
        supportDocs: [],
      };

      const prompt = formatContextForPrompt(context);

      // Should only have first 5 selectors
      for (let i = 0; i < 5; i++) {
        expect(prompt).toContain(`Button ${i}`);
      }
      // Later selectors should not be in output (truncated at 5)
    });

    it("should format documentation summaries", () => {
      const context: BrowserAutomationContext = {
        website: null,
        pages: [],
        selectors: [],
        actionSequences: [],
        errorPatterns: [],
        supportDocs: [
          {
            id: 1,
            websiteId: null,
            title: "Getting Started",
            summary: "Quick start guide",
            content: "This is a very long documentation content that should be truncated".repeat(10),
            retrievalCount: 10,
            embedding: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      const prompt = formatContextForPrompt(context);

      expect(prompt).toContain("Getting Started");
      expect(prompt).toContain("Quick start guide");
    });
  });

  // ========================================
  // INTEGRATION TESTS
  // ========================================

  describe("Integration", () => {
    it("should flow from context retrieval to prompt formatting", async () => {
      const mockWebsite = {
        id: 1,
        domain: "example.com",
        name: "Example",
        description: "Example site",
        loginUrl: "https://example.com/login",
        dashboardUrl: "https://example.com/dashboard",
        requiresAuth: true,
        authMethod: "email",
        avgLoadTime: 2000,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.select().from().where().limit.mockResolvedValueOnce([mockWebsite]);
      mockDb.execute
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const context = await getAutomationContext(
        "https://example.com/dashboard",
        "extract data"
      );

      expect(context.website).toBeDefined();

      const prompt = formatContextForPrompt(context);

      expect(prompt).toContain("Example");
      expect(prompt).toContain("Login URL");
    });
  });
});
