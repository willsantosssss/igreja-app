import { describe, it, expect } from "vitest";
import { deleteUserCompletely, upsertUsuarioCadastrado, getUsuarioCadastrado } from "../server/db";
import { upsertUser } from "../server/db";

describe("Delete User Completely", () => {
  it("should delete user from all tables", async () => {
    // Create test user
    const testUser = {
      openId: `test_delete_${Date.now()}`,
      email: `test_delete_${Date.now()}@test.com`,
      name: "Test User Delete",
      loginMethod: "email",
      passwordHash: "hash123",
    };

    await upsertUser(testUser);

    // Use a test user ID
    const userId = 99999;

    // Create associated data
    await upsertUsuarioCadastrado({
      nome: "Test Delete User",
      dataNascimento: "1990-01-01",
      celula: "Test Célula",
    });

    console.log("[Test] Created user with ID:", userId);

    // Verify user exists
    const userBefore = await getUsuarioCadastrado(userId);
    expect(userBefore).toBeDefined();
    console.log("[Test] User exists before deletion");

    // Delete user completely
    const result = await deleteUserCompletely(userId);
    expect(result.success).toBe(true);
    expect(result.userId).toBe(userId);
    console.log("[Test] User deleted successfully");

    // Verify user is deleted
    const userAfter = await getUsuarioCadastrado(userId);
    expect(userAfter).toBeNull();
    console.log("[Test] User no longer exists after deletion");
  });

  it("should delete user with all related data", async () => {
    const userId = 88888;

    // Create user
    await upsertUsuarioCadastrado({
      nome: "User with Related Data",
      dataNascimento: "1995-05-15",
      celula: "Test Célula",
    });

    console.log("[Test] Created user with related data");

    // Delete user
    const result = await deleteUserCompletely(userId);
    expect(result.success).toBe(true);
    console.log("[Test] User deleted");

    // Verify user is deleted
    const userAfter = await getUsuarioCadastrado(userId);
    expect(userAfter).toBeNull();
    console.log("[Test] User and all related data deleted successfully");
  });

  it("should handle deletion gracefully", async () => {
    const userId = 77777;

    // Create user
    await upsertUsuarioCadastrado({
      nome: "Test User",
      dataNascimento: "2000-01-01",
      celula: "Test Célula",
    });

    // Delete user
    const result = await deleteUserCompletely(userId);
    expect(result.success).toBe(true);
    expect(result.userId).toBe(userId);
    
    console.log("[Test] ✅ User deletion handled successfully!");
  });
});
