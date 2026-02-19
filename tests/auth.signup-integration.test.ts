import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "../server/db";
import axios from "axios";
import { signupUser } from "../server/auth-simple";

describe("Signup Integration", () => {
  const baseURL = `http://localhost:3000`;

  it("should signup, create token, and authenticate with Bearer token", async () => {
    const email = `signup-test-${Date.now()}@example.com`;
    const name = "Signup Test User";
    const password = "TestPassword123";

    // 1. Signup
    console.log("[Test] Starting signup...");
    const signupResponse = await axios.post(`${baseURL}/api/trpc/auth.signup`, {
      json: { email, name, password },
    });

    console.log("[Test] Signup response:", JSON.stringify(signupResponse.data, null, 2));
    const signupResult = signupResponse.data.result?.data?.json || signupResponse.data.result?.data;
    console.log("[Test] Signup result:", signupResult);
    expect(signupResult?.success).toBe(true);
    expect(signupResult?.sessionToken).toBeDefined();

    const token = signupResult?.sessionToken;
    if (!token) throw new Error("No session token received");
    console.log("[Test] Token received:", token.substring(0, 50) + "...");

    // 2. Verify user was created in DB
    console.log("[Test] Verifying user in DB...");
    const user = await db.getUserByOpenId(`email_${signupResult?.userId}`);
    expect(user).toBeDefined();
    expect(user?.name).toBe(name);
    console.log("[Test] User found in DB:", user?.email);

    // 3. Authenticate with Bearer token
    console.log("[Test] Authenticating with Bearer token...");
    const authResponse = await axios.get(`${baseURL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("[Test] Auth response:", authResponse.data);
    expect(authResponse.status).toBe(200);
    expect(authResponse.data.user).toBeDefined();
    expect(authResponse.data.user.email).toBe(email);
    console.log("[Test] Authentication successful with user:", authResponse.data.user.email);
  });
});
