import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { deleteUserCompletely, upsertUser, getUsuarioCadastrado, upsertUsuarioCadastrado } from "../server/db";

describe("Delete Account Endpoint", () => {
  let testUserId: number;

  beforeAll(async () => {
    // Create a test user
    const testUser = {
      openId: `test_delete_account_${Date.now()}`,
      email: `test_delete_account_${Date.now()}@test.com`,
      name: "Test Delete Account",
      loginMethod: "email" as const,
      passwordHash: "hash123",
    };

    await upsertUser(testUser);
    // Use a fixed test ID for this test
    testUserId = 1;
    
    console.log("[Test] Created test user with ID:", testUserId);
  });

  it("should delete user account completely", async () => {
    // Create user profile
    const uniqueId = Math.floor(Math.random() * 1000000);
    await upsertUsuarioCadastrado({
      nome: "Test Delete Account User",
      dataNascimento: "1990-01-01",
      celula: "Test Célula",
      userId: uniqueId,
    });
    testUserId = uniqueId;

    // Verify user exists
    let user = await getUsuarioCadastrado(uniqueId);
    expect(user).toBeDefined();
    console.log("[Test] User exists before deletion");

    // Delete user account
    const result = await deleteUserCompletely(uniqueId);
    expect(result.success).toBe(true);
    expect(result.userId).toBe(uniqueId);
    console.log("[Test] User account deleted successfully");

    // Verify user is deleted
    user = await getUsuarioCadastrado(uniqueId);
    expect(user).toBeNull();
    console.log("[Test] User no longer exists after deletion");
  });

  it("should return success even if user doesn't exist", async () => {
    const nonExistentUserId = 999999;
    
    // Try to delete non-existent user
    const result = await deleteUserCompletely(nonExistentUserId);
    expect(result.success).toBe(true);
    expect(result.userId).toBe(nonExistentUserId);
    console.log("[Test] Non-existent user deletion handled gracefully");
  });
});
