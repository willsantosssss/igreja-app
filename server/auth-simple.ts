import * as crypto from "crypto";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { getDb } from "./db";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function signupUser(email: string, password: string, name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existingUser = await db.select().from(users).where(eq(users.email, email));
  if (existingUser.length > 0) {
    throw new Error("Email already registered");
  }

  const passwordHash = hashPassword(password);
  try {
    // Insert user with all required fields
    const result = await db.insert(users).values({
      email,
      password: passwordHash,
      name,
      loginMethod: "email",
      role: "user",
    });
    
    // Fetch the created user to get the ID
    const createdUser = await db.select().from(users).where(eq(users.email, email));
    const userId = createdUser[0]?.id;
    
    // Update openId to match the token format (email_${userId})
    if (userId) {
      const openId = `email_${userId}`;
      await db.update(users).set({ openId }).where(eq(users.id, userId));
    }
    
    return { success: true, userId, email, name };
  } catch (error: any) {
    console.error("[Auth] Signup error:", error);
    throw new Error(error.message || "Failed to create user");
  }
}

export async function loginUser(email: string, password: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let userResult;
  try {
    userResult = await db.select().from(users).where(eq(users.email, email));
  } catch (error: any) {
    console.error("[Auth] Login query error:", error);
    throw error;
  }
  
  if (userResult.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = userResult[0];
  const passwordHash = hashPassword(password);

  if (user.password !== passwordHash) {
    throw new Error("Invalid email or password");
  }

  // Ensure openId is set for email/password users
  if (!user.openId) {
    const openId = `email_${user.id}`;
    await db.update(users).set({ openId }).where(eq(users.id, user.id));
  }

  return { success: true, userId: user.id, email: user.email, name: user.name };
}

export async function resetUserPassword(email: string, newPassword: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const userResult = await db.select().from(users).where(eq(users.email, email));
  if (userResult.length === 0) {
    throw new Error("User not found");
  }

  const user = userResult[0];
  const passwordHash = hashPassword(newPassword);

  try {
    await db.update(users).set({ password: passwordHash }).where(eq(users.id, user.id));
    return { success: true, userId: user.id, email: user.email, message: "Password reset successfully" };
  } catch (error: any) {
    console.error("[Auth] Reset password error:", error);
    throw new Error(error.message || "Failed to reset password");
  }
}
