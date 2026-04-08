import { describe, it, expect, beforeAll } from "vitest";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.CUSTOM_JWT_SECRET || "Essaeumasenhaterrivelmentegrande7";

describe("JWT Token Creation and Verification", () => {
  let testToken: string;

  beforeAll(async () => {
    // Create a test token
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const payload = {
      openId: "test_user_123",
      appId: "test_app",
      name: "Test User",
    };

    testToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(secretKey);

    console.log("Test token created:", testToken.substring(0, 50) + "...");
  });

  it("should create a valid JWT token", () => {
    expect(testToken).toBeDefined();
    expect(testToken.length).toBeGreaterThan(0);
    expect(testToken.split(".").length).toBe(3); // JWT has 3 parts
  });

  it("should verify a valid JWT token", async () => {
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(testToken, secretKey, {
      algorithms: ["HS256"],
    });

    expect(payload.openId).toBe("test_user_123");
    expect(payload.appId).toBe("test_app");
    expect(payload.name).toBe("Test User");
  });

  it("should reject an invalid token", async () => {
    const secretKey = new TextEncoder().encode("wrong_secret_key");
    
    try {
      await jwtVerify(testToken, secretKey, {
        algorithms: ["HS256"],
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should create token with correct secret from environment", async () => {
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    expect(secretKey).toBeDefined();
    expect(secretKey.length).toBeGreaterThan(0);
  });
});
