import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { COOKIE_NAME } from "@shared/const";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // Debug: Log cookie header presence for auth troubleshooting
  const cookieHeader = opts.req.headers.cookie;
  const hasCookie = cookieHeader?.includes(COOKIE_NAME);

  if (process.env.NODE_ENV !== "production" || process.env.DEBUG_AUTH === "1") {
    console.log("[Context] Creating context:", {
      path: opts.req.path,
      hasCookieHeader: !!cookieHeader,
      hasSessionCookie: hasCookie,
      cookieHeaderLength: cookieHeader?.length || 0,
    });
  }

  try {
    user = await sdk.authenticateRequest(opts.req);
    if (process.env.NODE_ENV !== "production" || process.env.DEBUG_AUTH === "1") {
      console.log("[Context] User authenticated:", { userId: user?.id, email: user?.email });
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    if (process.env.NODE_ENV !== "production" || process.env.DEBUG_AUTH === "1") {
      console.log("[Context] Auth failed (expected for public routes):", String(error));
    }
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
