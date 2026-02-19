import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { appRouter } from "../server/routers";
import { sdk } from "../server/_core/sdk";
import type { TrpcContext } from "../server/_core/context";
import { getDb } from "../server/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

type CookieCall = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

function createContext(): { ctx: TrpcContext; setCookies: CookieCall[] } {
  const setCookies: CookieCall[] = [];
  
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      hostname: "test.manus.computer",
    } as any as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: () => {},
    } as any as TrpcContext["res"],
    sdk,
  };
  
  return { ctx, setCookies };
}

describe("auth.signup and auth.login with session", () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "TestPassword123";
  const testName = "Test User";

  beforeEach(async () => {
    // Cleanup: delete test user if exists
    try {
      const db = await getDb();
      if (db) {
        const existingUsers = await db.select().from(users).where(eq(users.email, testEmail));
        if (existingUsers && existingUsers.length > 0) {
          await db.delete(users).where(eq(users.email, testEmail));
        }
      }
    } catch (error) {
      // User doesn't exist, that's fine
    }
  });

  afterEach(async () => {
    // Cleanup: delete test user
    try {
      const db = await getDb();
      if (db) {
        await db.delete(users).where(eq(users.email, testEmail));
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it("should create session cookie on signup", async () => {
    const { ctx, setCookies } = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.signup({
      email: testEmail,
      password: testPassword,
      name: testName,
    });

    // Verify signup result
    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("userId");
    expect(result).toHaveProperty("email", testEmail);
    expect(result).toHaveProperty("name", testName);

    // Verify session cookie was set
    expect(setCookies).toHaveLength(1);
    const sessionCookie = setCookies[0];
    expect(sessionCookie?.name).toBe("session");
    expect(sessionCookie?.value).toBeTruthy();
    expect(sessionCookie?.options).toMatchObject({
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: true,
    });
  });

  it("should create session cookie on login", async () => {
    // First, create a user via signup
    const { ctx: signupCtx } = createContext();
    const signupCaller = appRouter.createCaller(signupCtx);
    
    await signupCaller.auth.signup({
      email: testEmail,
      password: testPassword,
      name: testName,
    });

    // Now login with the same credentials
    const { ctx: loginCtx, setCookies: loginCookies } = createContext();
    const loginCaller = appRouter.createCaller(loginCtx);

    const result = await loginCaller.auth.login({
      email: testEmail,
      password: testPassword,
    });

    // Verify login result
    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("userId");
    expect(result).toHaveProperty("email", testEmail);

    // Verify session cookie was set
    expect(loginCookies).toHaveLength(1);
    const sessionCookie = loginCookies[0];
    expect(sessionCookie?.name).toBe("session");
    expect(sessionCookie?.value).toBeTruthy();
    expect(sessionCookie?.options).toMatchObject({
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: true,
    });
  });

  it("should reject invalid credentials on login", async () => {
    // First, create a user via signup
    const { ctx: signupCtx } = createContext();
    const signupCaller = appRouter.createCaller(signupCtx);
    
    await signupCaller.auth.signup({
      email: testEmail,
      password: testPassword,
      name: testName,
    });

    // Try to login with wrong password
    const { ctx: loginCtx } = createContext();
    const loginCaller = appRouter.createCaller(loginCtx);

    try {
      await loginCaller.auth.login({
        email: testEmail,
        password: "WrongPassword",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Invalid");
    }
  });

  it("should reject signup with duplicate email", async () => {
    const { ctx: signupCtx1 } = createContext();
    const signupCaller1 = appRouter.createCaller(signupCtx1);
    
    // First signup should succeed
    await signupCaller1.auth.signup({
      email: testEmail,
      password: testPassword,
      name: testName,
    });

    // Second signup with same email should fail
    const { ctx: signupCtx2 } = createContext();
    const signupCaller2 = appRouter.createCaller(signupCtx2);

    try {
      await signupCaller2.auth.signup({
        email: testEmail,
        password: testPassword,
        name: testName,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("already registered");
    }
  });
});
