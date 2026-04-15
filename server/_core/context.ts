import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  sdk: typeof sdk;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    console.log('[Context] createContext called');
    console.log('[Context] Request path:', opts.req.path);
    console.log('[Context] Request method:', opts.req.method);
    console.log('[Context] About to call authenticateRequest...');
    user = await sdk.authenticateRequest(opts.req);
    console.log('[Context] authenticateRequest returned successfully');
    console.log('[Context] User authenticated:', user?.email, 'ID:', user?.id);
  } catch (error) {
    // Authentication is optional for public procedures.
    // Only log if there was an actual authentication attempt (Authorization header or session cookie present)
    const hasAuthHeader = opts.req.headers.authorization || opts.req.headers.Authorization;
    const hasCookie = opts.req.headers.cookie;
    if (hasAuthHeader || hasCookie) {
      console.log('[Context] Authentication failed:', error instanceof Error ? error.message : String(error));
      console.log('[Context] Error stack:', error instanceof Error ? error.stack : '');
    }
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    sdk,
  };
}
