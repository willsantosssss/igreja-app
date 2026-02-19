import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { 
  InsertUser, users, celulas, inscricoesBatismo, usuariosCadastrados, pedidosOracao, anotacoesDevocional,
  eventos, noticias, avisoImportante, contatosIgreja, lideres, relatorios, dadosContribuicao,
  InsertCelula, InsertInscricaoBatismo, InsertUsuarioCadastrado, InsertPedidoOracao, InsertAnotacaoDevocional,
  InsertEvento, InsertNoticia, InsertAvisoImportante, InsertContatoIgreja, InsertLider, InsertRelatorio, InsertDadosContribuicao
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = mysql.createPool(process.env.DATABASE_URL) as any;
      _db = drizzle(pool);
      console.log("[Database] Connected successfully");
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
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

    const result = await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });

    // Criar registro em usuariosCadastrados se for primeiro login
    const userRecord = await getUserByOpenId(user.openId);
    if (userRecord) {
      const existingCadastro = await getUsuarioCadastradoByUserId(userRecord.id);
      if (!existingCadastro && user.name) {
        // Criar registro básico que admin pode completar depois
        await db.insert(usuariosCadastrados).values({
          userId: userRecord.id,
          nome: user.name,
          dataNascimento: '2000-01-01', // Data padrão - admin pode atualizar
          celula: '', // Admin pode atribuir célula depois
        });
        console.log(`[Database] Created usuariosCadastrado for user ${userRecord.id}`);
      }
    }
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

// ============ ANOTAÇÕES DE DEVOCIONAL ============

export async function getAnotacoesDevocionalByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(anotacoesDevocional)
    .where(eq(anotacoesDevocional.userId, userId))
    .orderBy(desc(anotacoesDevocional.updatedAt));
}

export async function getAnotacaoDevocionalByCapitulo(userId: number, livro: string, capitulo: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(anotacoesDevocional)
    .where(
      and(
        eq(anotacoesDevocional.userId, userId),
        eq(anotacoesDevocional.livro, livro),
        eq(anotacoesDevocional.capitulo, capitulo)
      )
    );
}

export async function createAnotacaoDevocional(data: InsertAnotacaoDevocional) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(anotacoesDevocional).values(data);
  return (result as any).insertId;
}

export async function updateAnotacaoDevocional(id: number, data: Partial<InsertAnotacaoDevocional>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(anotacoesDevocional).set(data).where(eq(anotacoesDevocional.id, id));
}

export async function deleteAnotacaoDevocional(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(anotacoesDevocional).where(eq(anotacoesDevocional.id, id));
}

export async function deleteAnotacoesDevocionalByCapitulo(userId: number, livro: string, capitulo: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(anotacoesDevocional)
    .where(
      and(
        eq(anotacoesDevocional.userId, userId),
        eq(anotacoesDevocional.livro, livro),
        eq(anotacoesDevocional.capitulo, capitulo)
      )
    );
}

// ==================== EVENTOS ====================

export async function getEventos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(eventos).orderBy(desc(eventos.data));
}

export async function getEventoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(eventos).where(eq(eventos.id, id)).limit(1);
  return result[0] || null;
}

export async function createEvento(data: Omit<InsertEvento, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(eventos).values(data);
  return (result as any).insertId;
}

export async function updateEvento(id: number, data: Partial<Omit<InsertEvento, 'id' | 'createdAt' | 'updatedAt'>>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(eventos).set(data).where(eq(eventos.id, id));
}

export async function deleteEvento(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(eventos).where(eq(eventos.id, id));
}

// ==================== NOTÍCIAS ====================

export async function getNoticias() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(noticias).orderBy(desc(noticias.createdAt));
}

export async function getNoticiaById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(noticias).where(eq(noticias.id, id)).limit(1);
  return result[0] || null;
}

export async function createNoticia(data: Omit<InsertNoticia, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(noticias).values(data);
  return (result as any).insertId;
}

export async function updateNoticia(id: number, data: Partial<Omit<InsertNoticia, 'id' | 'createdAt' | 'updatedAt'>>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(noticias).set(data).where(eq(noticias.id, id));
}

export async function deleteNoticia(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(noticias).where(eq(noticias.id, id));
}

// ==================== AVISO IMPORTANTE ====================

export async function getAvisoImportante() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(avisoImportante).where(eq(avisoImportante.ativo, 1)).limit(1);
  return result[0] || null;
}

export async function createAvisoImportante(data: Omit<InsertAvisoImportante, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Desativar avisos anteriores
  await db.update(avisoImportante).set({ ativo: 0 });
  // Criar novo aviso
  const result = await db.insert(avisoImportante).values(data);
  return (result as any).insertId;
}

export async function desativarAvisoImportante() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(avisoImportante).set({ ativo: 0 });
}

// ==================== CONTATOS IGREJA ====================

export async function getContatosIgreja() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(contatosIgreja).limit(1);
  return result[0] || null;
}

export async function updateContatosIgreja(data: Omit<InsertContatoIgreja, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getContatosIgreja();
  if (existing) {
    await db.update(contatosIgreja).set(data).where(eq(contatosIgreja.id, existing.id));
  } else {
    await db.insert(contatosIgreja).values(data);
  }
}

// ==================== LÍDERES ====================

export async function getLideres() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lideres).where(eq(lideres.ativo, 1));
}

export async function getLiderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(lideres).where(eq(lideres.id, id)).limit(1);
  return result[0] || null;
}

export async function getLiderByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(lideres).where(eq(lideres.userId, userId)).limit(1);
  return result[0] || null;
}

export async function createLider(data: Omit<InsertLider, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(lideres).values(data);
  return (result as any).insertId;
}

export async function updateLider(id: number, data: Partial<InsertLider>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(lideres).set(data).where(eq(lideres.id, id));
}

export async function deleteLider(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(lideres).set({ ativo: 0 }).where(eq(lideres.id, id));
}

// ==================== RELATÓRIOS ====================

export async function getRelatorios() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(relatorios);
}

export async function getRelatoriosByLiderId(liderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(relatorios).where(eq(relatorios.liderId, liderId));
}

export async function getRelatoriosByCelula(celula: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(relatorios).where(eq(relatorios.celula, celula));
}

export async function createRelatorio(data: Omit<InsertRelatorio, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(relatorios).values(data);
  return (result as any).insertId;
}

export async function updateRelatorio(id: number, data: Partial<InsertRelatorio>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(relatorios).set(data).where(eq(relatorios.id, id));
}

export async function deleteRelatorio(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(relatorios).where(eq(relatorios.id, id));
}

// ==================== DADOS DE CONTRIBUIÇÃO ====================

export async function getDadosContribuicao() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(dadosContribuicao).limit(1);
  return result[0] || null;
}

export async function createDadosContribuicao(data: Omit<InsertDadosContribuicao, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(dadosContribuicao).values(data);
  return (result as any).insertId;
}

export async function updateDadosContribuicao(id: number, data: Partial<InsertDadosContribuicao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(dadosContribuicao).set(data).where(eq(dadosContribuicao.id, id));
}
