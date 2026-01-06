// Set environment variables before any imports
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "test-key";
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "test-key";
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "0".repeat(64);

import { describe, expect, it, vi } from "vitest";
import { COOKIE_NAME } from "../shared/const";

// Mock the Stagehand module to prevent buffer-equal-constant-time import issues
vi.mock("@browserbasehq/stagehand", () => ({
  Stagehand: vi.fn(),
}));

// Mock Anthropic to prevent API key requirement
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({ content: [{ text: "test" }] }),
    },
  })),
}));

// Mock code generator service
vi.mock("./services/code-generator.service", () => ({
  codeGeneratorService: {
    generateCode: vi.fn(),
    validateCode: vi.fn(),
  },
  getCodeGeneratorService: vi.fn(),
}));

// Import appRouter after mocking
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      hostname: "localhost",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      secure: true,
      sameSite: "none",
      httpOnly: true,
      path: "/",
    });
  });
});
