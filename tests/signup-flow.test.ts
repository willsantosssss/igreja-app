import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { signupUser, loginUser } from "../server/auth-simple";
import { getDb } from "../server/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Signup Flow Test", () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "password123";
  const testName = "Test User";
  let userId: number;

  it("should create a new user via signupUser", async () => {
    const result = await signupUser(testEmail, testPassword, testName);
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.userId).toBeDefined();
    expect(result.email).toBe(testEmail);
    expect(result.name).toBe(testName);
    
    userId = result.userId;
  });

  it("should verify user exists in database", async () => {
    const db = await getDb();
    expect(db).toBeDefined();
    
    const userResult = await db!.select().from(users).where(eq(users.email, testEmail));
    
    expect(userResult).toBeDefined();
    expect(userResult.length).toBe(1);
    expect(userResult[0].email).toBe(testEmail);
    expect(userResult[0].name).toBe(testName);
  });

  it("should login with the created user", async () => {
    const result = await loginUser(testEmail, testPassword);
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.userId).toBe(userId);
    expect(result.email).toBe(testEmail);
  });

  it("should reject duplicate email signup", async () => {
    try {
      await signupUser(testEmail, "anotherPassword", "Another User");
      expect.fail("Should have thrown an error for duplicate email");
    } catch (error: any) {
      expect(error.message).toContain("Email already registered");
    }
  });

  it("should reject login with wrong password", async () => {
    try {
      await loginUser(testEmail, "wrongPassword");
      expect.fail("Should have thrown an error for wrong password");
    } catch (error: any) {
      expect(error.message).toContain("Invalid email or password");
    }
  });

  afterAll(async () => {
    // Cleanup: delete test user
    const db = await getDb();
    if (db) {
      await db.delete(users).where(eq(users.email, testEmail));
    }
  });
});
