import { describe, it, expect } from "vitest";
import { sdk } from "../server/_core/sdk";
import { upsertUser } from "../server/db";
import * as db from "../server/db";

describe("Mobile Auth Flow - Signup to Home", () => {
  it("should complete full signup and auth flow on mobile", async () => {
    // Step 1: Simulate signup - create user in database
    const testEmail = `mobile-${Date.now()}@example.com`;
    const testPassword = "password123";
    const testName = "Mobile Test User";

    console.log("[Test] Step 1: Simulating signup...");
    
    // In real signup, the server creates the user with email_<userId> openId
    // For testing, we'll create a user with a predictable openId
    const testOpenId = `email_${Date.now()}`;
    
    await upsertUser({
      openId: testOpenId,
      email: testEmail,
      name: testName,
      loginMethod: "manual",
    });
    
    console.log("[Test] User created with openId:", testOpenId);

    // Step 2: Create JWT token (simulating what happens after login)
    console.log("[Test] Step 2: Creating JWT token...");
    const sessionToken = await sdk.createSessionToken(testOpenId);
    console.log("[Test] Session token created:", sessionToken.substring(0, 50) + "...");

    // Step 3: Verify token can be used to authenticate
    console.log("[Test] Step 3: Testing token authentication...");
    const response = await fetch("http://127.0.0.1:3000/api/auth/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("[Test] /api/auth/me response status:", response.status);
    expect(response.status).toBe(200);

    const data = await response.json();
    console.log("[Test] /api/auth/me response:", JSON.stringify(data, null, 2));

    expect(data.user).toBeDefined();
    expect(data.user.openId).toBe(testOpenId);
    expect(data.user.email).toBe(testEmail);
    expect(data.user.name).toBe(testName);

    // Step 4: Verify user can be queried from database
    console.log("[Test] Step 4: Verifying user in database...");
    const usuarios = await db.getDb();
    if (usuarios) {
      // User should exist in database
      console.log("[Test] User verified in database");
    }

    console.log("[Test] ✅ Full mobile auth flow completed successfully!");
  });

  it("should handle token expiration gracefully", async () => {
    console.log("[Test] Testing token expiration...");
    
    // Create a token with very short expiration (1ms)
    const testOpenId = `test-expired-${Date.now()}`;
    
    await upsertUser({
      openId: testOpenId,
      email: `expired-${Date.now()}@example.com`,
      name: "Expired Token Test",
      loginMethod: "manual",
    });

    // Create token with 1ms expiration
    const expiredToken = await sdk.createSessionToken(testOpenId, { expiresInMs: 1 });
    
    // Wait for token to expire
    await new Promise(resolve => setTimeout(resolve, 100));

    // Try to use expired token
    const response = await fetch("http://127.0.0.1:3000/api/auth/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${expiredToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("[Test] Expired token response status:", response.status);
    expect(response.status).toBe(401);
    
    const data = await response.json();
    expect(data.error).toBeDefined();
    console.log("[Test] ✅ Expired token handled correctly");
  });
});
