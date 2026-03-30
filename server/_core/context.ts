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
    user = await sdk.authenticateRequest(opts.req);
    console.log('[Context] User authenticated:', user?.email);
  } catch (error) {
    // Authentication is optional for public procedures.
    console.log('[Context] Authentication failed:', error instanceof Error ? error.message : String(error));
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    sdk,
  };
}
