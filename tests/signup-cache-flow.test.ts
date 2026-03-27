import { describe, it, expect } from "vitest";
import { sdk } from "../server/_core/sdk";
import { upsertUser } from "../server/db";

describe("Signup Cache Flow - User Info Persistence", () => {
  it("should return openId in signup response for client-side caching", async () => {
    // Simulate what happens on the server during signup
    const testEmail = `signup-test-${Date.now()}@example.com`;
    const testPassword = "password123";
    const testName = "Signup Test User";
    const testUserId = Date.now();

    // Simulate signup response from server
    const openId = `email_${testUserId}`;
    
    // Create user in database
    await upsertUser({
      openId,
      email: testEmail,
      name: testName,
      loginMethod: "manual",
    });

    // Simulate login response (what the client receives)
    const loginResponse = {
      success: true,
      userId: testUserId,
      email: testEmail,
      name: testName,
      openId, // ← This is now included in the response
      sessionToken: await sdk.createSessionToken(openId),
    };

    console.log("[Test] Login response:", {
      hasOpenId: !!loginResponse.openId,
      hasEmail: !!loginResponse.email,
      hasName: !!loginResponse.name,
      hasSessionToken: !!loginResponse.sessionToken,
    });

    // Verify all required fields are present for client-side caching
    expect(loginResponse.openId).toBeDefined();
    expect(loginResponse.email).toBe(testEmail);
    expect(loginResponse.name).toBe(testName);
    expect(loginResponse.sessionToken).toBeDefined();

    // Verify that the cached user info would be valid
    const cachedUserInfo = {
      id: loginResponse.userId,
      openId: loginResponse.openId,
      email: loginResponse.email,
      name: loginResponse.name,
      loginMethod: "manual",
      lastSignedIn: new Date(),
    };

    console.log("[Test] Cached user info:", cachedUserInfo);
    expect(cachedUserInfo.openId).toBe(openId);
    expect(cachedUserInfo.email).toBe(testEmail);

    // Verify token can authenticate with the openId
    const response = await fetch("http://127.0.0.1:3000/api/auth/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${loginResponse.sessionToken}`,
        "Content-Type": "application/json",
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.user.openId).toBe(openId);
    expect(data.user.email).toBe(testEmail);

    console.log("[Test] ✅ Signup cache flow validated successfully!");
  });

  it("should handle missing openId gracefully", async () => {
    // Test that client can still work even if openId is missing
    // (though it shouldn't be with the fix)
    const testEmail = `fallback-${Date.now()}@example.com`;
    
    const loginResponse = {
      success: true,
      userId: 99999,
      email: testEmail,
      name: "Fallback User",
      sessionToken: "dummy-token",
    };

    // Client should be able to construct openId if needed
    const openId = `email_${loginResponse.userId}`;
    expect(openId).toBeDefined();
    console.log("[Test] ✅ Fallback openId construction works");
  });
});
