import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, celulas, inscricoesBatismo, usuariosCadastrados, pedidosOracao, InsertCelula, InsertInscricaoBatismo, InsertUsuarioCadastrado, InsertPedidoOracao } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ CELULAS ============

export async function getCelulas() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(celulas);
}

export async function getCelulaById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(celulas).where(eq(celulas.id, id));
  return result[0] || null;
}

export async function createCelula(data: InsertCelula) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(celulas).values(data);
  return (result as any).insertId;
}

export async function updateCelula(id: number, data: Partial<InsertCelula>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(celulas).set(data).where(eq(celulas.id, id));
}

export async function deleteCelula(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(celulas).where(eq(celulas.id, id));
}

// ============ INSCRICOES DE BATISMO ============

export async function getInscricoesBatismo() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inscricoesBatismo).orderBy(desc(inscricoesBatismo.createdAt));
}

export async function getInscricoesBatismoPendentes() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(inscricoesBatismo)
    .where(eq(inscricoesBatismo.status, "pendente"))
    .orderBy(desc(inscricoesBatismo.createdAt));
}

export async function createInscricaoBatismo(data: InsertInscricaoBatismo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(inscricoesBatismo).values(data);
  return (result as any).insertId;
}

export async function updateInscricaoBatismo(id: number, data: Partial<InsertInscricaoBatismo>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(inscricoesBatismo).set(data).where(eq(inscricoesBatismo.id, id));
}

export async function deleteInscricaoBatismo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(inscricoesBatismo).where(eq(inscricoesBatismo.id, id));
}

// ============ USUARIOS CADASTRADOS ============

export async function getUsuariosCadastrados() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(usuariosCadastrados);
}

export async function getUsuarioCadastradoByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(usuariosCadastrados)
    .where(eq(usuariosCadastrados.userId, userId));
  return result[0] || null;
}

export async function getAniversariantesMes(mes: number) {
  const db = await getDb();
  if (!db) return [];
  const usuarios = await db.select().from(usuariosCadastrados);
  return usuarios.filter((u) => {
    const [, m] = u.dataNascimento.split("-");
    return parseInt(m) === mes;
  });
}

export async function getMembrosPorCelula(celula: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(usuariosCadastrados)
    .where(eq(usuariosCadastrados.celula, celula));
}

export async function createUsuarioCadastrado(data: InsertUsuarioCadastrado) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(usuariosCadastrados).values(data);
  return (result as any).insertId;
}

export async function updateUsuarioCadastrado(id: number, data: Partial<InsertUsuarioCadastrado>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(usuariosCadastrados).set(data).where(eq(usuariosCadastrados.id, id));
}

// ============ PEDIDOS DE ORACAO ============

export async function getPedidosOracao() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pedidosOracao).orderBy(desc(pedidosOracao.createdAt));
}

export async function getPedidoOracaoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(pedidosOracao).where(eq(pedidosOracao.id, id));
  return result[0] || null;
}

export async function createPedidoOracao(data: InsertPedidoOracao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(pedidosOracao).values(data);
  return (result as any).insertId;
}

export async function updatePedidoOracao(id: number, data: Partial<InsertPedidoOracao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(pedidosOracao).set(data).where(eq(pedidosOracao.id, id));
}

export async function deletePedidoOracao(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(pedidosOracao).where(eq(pedidosOracao.id, id));
}

export async function incrementarContadorOracao(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const pedido = await getPedidoOracaoById(id);
  if (!pedido) throw new Error("Pedido de oração não encontrado");
  await updatePedidoOracao(id, {
    contadorOrando: (pedido.contadorOrando || 0) + 1,
  });
}
