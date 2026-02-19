import { describe, it, expect } from "vitest";
import { sdk } from "../server/_core/sdk";
import { upsertUser } from "../server/db";

describe("Auth /api/auth/me endpoint debug", () => {
  it("should create a valid token and test /api/auth/me", async () => {
    // Create a test user
    const testEmail = `debug-${Date.now()}@example.com`;
    const testOpenId = `test-${Date.now()}`;

    // Insert user into database
    await upsertUser({
      openId: testOpenId,
      email: testEmail,
      name: "Debug User",
      loginMethod: "manual",
    });

    // Create a valid JWT token
    const token = await sdk.createSessionToken(testOpenId);
    console.log("[Test] Created token:", token);

    // Make request to /api/auth/me
    const response = await fetch("http://127.0.0.1:3000/api/auth/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("[Test] Response status:", response.status);
    const data = await response.json();
    console.log("[Test] Response data:", JSON.stringify(data, null, 2));

    expect(response.status).toBe(200);
    expect(data.user).toBeDefined();
    expect(data.user.openId).toBe(testOpenId);
  });
});
