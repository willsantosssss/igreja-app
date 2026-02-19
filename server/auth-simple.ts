import crypto from "crypto";
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
  const result = await db.insert(users).values({
    email,
    passwordHash,
    name,
    loginMethod: "email",
    openId: `email_${Date.now()}`,
    lastSignedIn: new Date(),
  });

  return { success: true, userId: (result as any).insertId };
}

export async function loginUser(email: string, password: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const userResult = await db.select().from(users).where(eq(users.email, email));
  if (userResult.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = userResult[0];
  const passwordHash = hashPassword(password);

  if (user.passwordHash !== passwordHash) {
    throw new Error("Invalid email or password");
  }

  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

  return { success: true, userId: user.id, email: user.email, name: user.name };
}
