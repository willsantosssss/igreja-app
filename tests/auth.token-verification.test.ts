import { describe, it, expect, beforeAll } from "vitest";
import { sdk } from "../server/_core/sdk";
import { ENV } from "../server/_core/env";

describe("JWT Token Verification", () => {

  it("should create a valid JWT token", async () => {
    const openId = "email_test123";
    const token = await sdk.createSessionToken(openId, { name: "Test User" });
    
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3); // JWT has 3 parts
    console.log("Token created:", token.substring(0, 50) + "...");
  });

  it("should verify a valid JWT token", async () => {
    const openId = "email_test123";
    const name = "Test User";
    const token = await sdk.createSessionToken(openId, { name });
    
    const session = await sdk.verifySession(token);
    
    expect(session).toBeDefined();
    expect(session?.openId).toBe(openId);
    expect(session?.name).toBe(name);
    expect(session?.appId).toBe(ENV.appId);
    console.log("Token verified successfully:", session);
  });

  it("should reject an invalid JWT token", async () => {
    const invalidToken = "invalid.token.here";
    const session = await sdk.verifySession(invalidToken);
    
    expect(session).toBeNull();
  });

  it("should reject a token with missing fields", async () => {
    // Create a token manually without the required fields
    const secretKey = new TextEncoder().encode(ENV.cookieSecret);
    const { SignJWT } = await import("jose");
    
    const token = await new SignJWT({
      openId: "test",
      // Missing appId and name
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(Math.floor(Date.now() / 1000) + 3600)
      .sign(secretKey);
    
    const session = await sdk.verifySession(token);
    expect(session).toBeNull();
  });
});
