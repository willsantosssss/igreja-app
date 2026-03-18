import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, celulas, inscricoesBatismo, usuariosCadastrados, pedidosOracao, anotacoesDevocional,
  eventos, noticias, avisoImportante, contatosIgreja, lideres, relatorios, dadosContribuicao,
  contribuicoes, inscricoesEventos, inscricoesEscolaCrescimento, anexos, documentoslideres,
  InsertCelula, InsertInscricaoBatismo, InsertUsuarioCadastrado, InsertPedidoOracao, InsertAnotacaoDevocional,
  InsertEvento, InsertNoticia, InsertAvisoImportante, InsertContatoIgreja, InsertLider, InsertRelatorio, InsertDadosContribuicao, InsertInscricaoEvento, InsertInscricaoEscolaCrescimento, InsertAnexo, InsertDocumentoLider
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { eq, desc } from "drizzle-orm";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const url = process.env.DATABASE_URL;
      console.log("[Database] Connecting to:", url.replace(/:[^@]*@/, ":***@"));
      const connection = await mysql.createConnection({
        uri: url,
        ssl: {
          rejectUnauthorized: false,
        },
        enableKeepAlive: true,
      });
      _db = drizzle(connection);
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
      if (user[field] !== undefined) {
        values[field] = user[field];
        updateSet[field] = user[field];
      }
    };

    assignNullable("name");
    assignNullable("email");
    assignNullable("loginMethod");

    const existing = await db.select().from(users).where(eq(users.openId, user.openId));

    if (existing.length > 0) {
      if (Object.keys(updateSet).length > 0) {
        await db.update(users).set(updateSet).where(eq(users.openId, user.openId));
      }
    } else {
      await db.insert(users).values(values);
    }
  } catch (error) {
    console.error("[Database] Error upserting user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.openId, openId));
  return result[0] || null;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.id, id));
  return result[0] || null;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.email, email));
  return result[0] || null;
}

// ==================== USUÁRIOS CADASTRADOS ====================

export async function upsertUsuarioCadastrado(data: InsertUsuarioCadastrado) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(usuariosCadastrados)
    .where(eq(usuariosCadastrados.userId, data.userId!));

  if (existing.length > 0) {
    await db
      .update(usuariosCadastrados)
      .set(data)
      .where(eq(usuariosCadastrados.userId, data.userId!));
  } else {
    await db.insert(usuariosCadastrados).values(data);
  }
}

export async function getUsuarioCadastrado(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(usuariosCadastrados)
    .where(eq(usuariosCadastrados.userId, userId));
  return result[0] || null;
}

export async function getAllUsuariosCadastrados() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(usuariosCadastrados);
}

// ==================== CÉLULAS ====================

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
  await db.insert(celulas).values(data);
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

// ==================== INSCRIÇÕES BATISMO ====================

export async function getInscricoesBatismo() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inscricoesBatismo);
}

export async function getInscricoesBatismoPendentes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inscricoesBatismo).where(eq(inscricoesBatismo.status, "pendente"));
}

export async function createInscricaoBatismo(data: InsertInscricaoBatismo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(inscricoesBatismo).values(data);
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

// ==================== PEDIDOS DE ORAÇÃO ====================

export async function getPedidosOracao() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pedidosOracao);
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
  await db.insert(pedidosOracao).values(data);
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

// ==================== ANOTAÇÕES DEVOCIONAL ====================

export async function getAnotacoesDevocional(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(anotacoesDevocional)
    .where(eq(anotacoesDevocional.userId, userId));
}

export async function getAnotacoesDevocionalByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(anotacoesDevocional)
    .where(eq(anotacoesDevocional.userId, userId));
}

export async function getAnotacaoDevocionalByCapitulo(userId: number, livro: string, capitulo: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(anotacoesDevocional)
    .where(
      eq(anotacoesDevocional.userId, userId) &&
      eq(anotacoesDevocional.livro, livro) &&
      eq(anotacoesDevocional.capitulo, capitulo)
    );
  return result[0] || null;
}

export async function createAnotacaoDevocional(data: InsertAnotacaoDevocional) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(anotacoesDevocional).values(data);
}

export async function updateAnotacaoDevocional(
  id: number,
  data: Partial<InsertAnotacaoDevocional>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(anotacoesDevocional)
    .set(data)
    .where(eq(anotacoesDevocional.id, id));
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
      eq(anotacoesDevocional.userId, userId) &&
      eq(anotacoesDevocional.livro, livro) &&
      eq(anotacoesDevocional.capitulo, capitulo)
    );
}

// ==================== EVENTOS ====================

export async function getEventos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(eventos);
}

export async function getEventoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(eventos).where(eq(eventos.id, id));
  return result[0] || null;
}

export async function getEventosEspeciais() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(eventos).where(eq(eventos.especial, true));
}

export async function createEvento(data: InsertEvento) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(eventos).values(data);
}

export async function updateEvento(id: number, data: Partial<InsertEvento>) {
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
  return db.select().from(noticias);
}

export async function getNoticiaById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(noticias).where(eq(noticias.id, id));
  return result[0] || null;
}

export async function createNoticia(data: InsertNoticia) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(noticias).values(data);
}

export async function updateNoticia(id: number, data: Partial<InsertNoticia>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(noticias).set(data).where(eq(noticias.id, id));
}

export async function deleteNoticia(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(noticias).where(eq(noticias.id, id));
}

// ==================== AVISOS IMPORTANTES ====================

export async function getAvisosImportantes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(avisoImportante);
}

export async function getAvisoImportante() {
  const db = await getDb();
  if (!db) return null;
  // Retornar o aviso mais recente e ativo
  const result = await db
    .select()
    .from(avisoImportante)
    .where(eq(avisoImportante.ativo, 1))
    .orderBy(desc(avisoImportante.updatedAt))
    .limit(1);
  return result[0] || null;
}

export async function createAvisoImportante(data: InsertAvisoImportante) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(avisoImportante).values(data);
}

export async function updateAvisoImportante(
  id: number,
  data: Partial<InsertAvisoImportante>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(avisoImportante).set(data).where(eq(avisoImportante.id, id));
}

export async function deleteAvisoImportante(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(avisoImportante).where(eq(avisoImportante.id, id));
}

export async function desativarAvisoImportante() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Desativar todos os avisos
  await db.update(avisoImportante).set({ ativo: 0 });
}

export async function saveAvisoImportante(data: InsertAvisoImportante) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Desativar todos os avisos antigos
  await db.update(avisoImportante).set({ ativo: 0 });
  // Criar novo aviso com ativo=1
  return await db.insert(avisoImportante).values({
    ...data,
    ativo: 1,
  });
}

// ==================== CONTATOS IGREJA ====================

export async function getContatosIgreja() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contatosIgreja);
}

export async function createContatoIgreja(data: InsertContatoIgreja) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(contatosIgreja).values(data);
}

export async function updateContatoIgreja(id: number, data: Partial<InsertContatoIgreja>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contatosIgreja).set(data).where(eq(contatosIgreja.id, id));
}

export async function deleteContatoIgreja(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(contatosIgreja).where(eq(contatosIgreja.id, id));
}

// ==================== LÍDERES ====================

export async function getLideres() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lideres);
}

export async function getLiderByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(lideres).where(eq(lideres.userId, userId));
  return result[0] || null;
}

export async function getLiderByCelula(celula: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(lideres).where(eq(lideres.celula, celula));
  return result[0] || null;
}

export async function getLiderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(lideres).where(eq(lideres.id, id));
  return result[0] || null;
}

export async function createLider(data: InsertLider) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(lideres).values(data);
  // Buscar o líder criado para retornar com ID
  const lider = await db.select().from(lideres).where(eq(lideres.celula, data.celula)).limit(1);
  return lider[0];
}

export async function updateLider(id: number, data: Partial<InsertLider>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(lideres).set(data).where(eq(lideres.id, id));
}

export async function deleteLider(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(lideres).where(eq(lideres.id, id));
}

// ==================== RELATÓRIOS ====================

export async function getRelatorios() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(relatorios);
}

export async function getRelatoriosByCelula(celula: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(relatorios).where(eq(relatorios.celula, celula));
}

export async function getRelatoriosByLiderId(liderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(relatorios).where(eq(relatorios.liderId, liderId));
}

export async function getRelatoriosByLiderIdWithFilters(
  liderId: number,
  filtro?: { dataInicio?: string; dataFim?: string; tipo?: string; limite?: number }
) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    // Primeiro, buscar a célula do líder
    const liderData = await db.select().from(lideres).where(eq(lideres.id, liderId));
    if (!liderData || liderData.length === 0) {
      console.warn("[Database] Líder não encontrado:", liderId);
      return [];
    }
    
    const celulaDolider = liderData[0].celula;
    
    // Filtrar relatórios apenas da célula do líder
    let query = db.select().from(relatorios).where(eq(relatorios.celula, celulaDolider));
    
    if (filtro?.dataInicio) {
      query = query.where((col) => col.periodo >= filtro.dataInicio);
    }
    if (filtro?.dataFim) {
      query = query.where((col) => col.periodo <= filtro.dataFim);
    }
    if (filtro?.tipo) {
      query = query.where(eq(relatorios.tipo, filtro.tipo));
    }
    
    query = query.orderBy(desc(relatorios.periodo));
    
    if (filtro?.limite && filtro.limite > 0) {
      query = query.limit(filtro.limite);
    }
    
    const result = await query;
    return result;
  } catch (error) {
    console.error("[Database] Error fetching relatorios with filters:", error);
    return [];
  }
}

export async function createRelatorio(data: Omit<InsertRelatorio, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const result = await db.insert(relatorios).values(data);
    return result;
  } catch (error) {
    console.error('[Database] Error creating relatorio:', error);
    throw error;
  }
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

export async function updateDadosContribuicao(data: Partial<InsertDadosContribuicao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(dadosContribuicao).limit(1);
  if (existing.length > 0) {
    await db.update(dadosContribuicao).set(data);
  } else {
    await db.insert(dadosContribuicao).values(data as InsertDadosContribuicao);
  }
}

// ==================== CONTRIBUIÇÕES ====================

export async function getContribuicoes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contribuicoes);
}

export async function getContribuicoesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contribuicoes).where(eq(contribuicoes.userId, userId));
}

export async function createContribuicao(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(contribuicoes).values(data);
}

export async function deleteContribuicao(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(contribuicoes).where(eq(contribuicoes.id, id));
}

// ==================== INSCRIÇÕES EVENTOS ====================

export async function getInscricoesEventos() {
  const db = await getDb();
  if (!db) return [];
  const inscricoes = await db.select().from(inscricoesEventos);
  // Retornar dados conforme esperado pela tela
  return inscricoes.map(i => ({
    id: i.id,
    eventoId: i.eventoId,
    nome: i.nome,
    celula: i.celula,
    telefone: i.telefone,
    status: i.status,
    userId: i.userId,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
  }));
}

export async function getInscricoesEventosByEventoId(eventoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inscricoesEventos).where(eq(inscricoesEventos.eventoId, eventoId));
}

export async function createInscricaoEvento(data: InsertInscricaoEvento) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(inscricoesEventos).values(data);
  return data;
}

export async function deleteInscricaoEvento(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(inscricoesEventos).where(eq(inscricoesEventos.id, id));
}

// ==================== ESCOLA DE CRESCIMENTO ====================

export async function getInscricoesEscolaCrescimento() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inscricoesEscolaCrescimento);
}

export async function createInscricaoEscolaCrescimento(data: InsertInscricaoEscolaCrescimento) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(inscricoesEscolaCrescimento).values(data);
  return data;
}

export async function deleteInscricaoEscolaCrescimento(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(inscricoesEscolaCrescimento).where(eq(inscricoesEscolaCrescimento.id, id));
}

// ==================== ANIVERSARIANTES ====================

export async function getAniversariantes() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(usuariosCadastrados);
  return result.filter((u) => u.dataNascimento);
}

export async function getAniversariantesMes(mes: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(usuariosCadastrados);
  return result.filter((u) => {
    if (!u.dataNascimento) return false;
    const [, month] = u.dataNascimento.split('-');
    return parseInt(month) === mes;
  });
}

// ==================== DELETAR USUÁRIO COMPLETAMENTE ====================

export async function deleteUserCompletely(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(anotacoesDevocional).where(eq(anotacoesDevocional.userId, userId));
  await db.delete(contribuicoes).where(eq(contribuicoes.userId, userId));
  await db.delete(inscricoesEventos).where(eq(inscricoesEventos.userId, userId));
  await db.delete(lideres).where(eq(lideres.userId, userId));
  await db.delete(usuariosCadastrados).where(eq(usuariosCadastrados.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
}


// ==================== USUÁRIOS CADASTRADOS ====================

export async function getUsuariosCadastrados() {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db.select().from(usuariosCadastrados);
    return result;
  } catch (error) {
    console.error("[Database] Error fetching usuarios cadastrados:", error);
    return [];
  }
}

export async function getMembrosPorCelula(celula: string) {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db.select().from(usuariosCadastrados).where(eq(usuariosCadastrados.celula, celula));
    return result;
  } catch (error) {
    console.error("[Database] Error fetching membros por celula:", error);
    return [];
  }
}

// ==================== ORAÇÃO - INCREMENTAR CONTADOR ====================

export async function incrementarContadorOracao(pedidoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    // Buscar pedido atual
    const pedido = await db.select().from(pedidosOracao).where(eq(pedidosOracao.id, pedidoId));
    if (!pedido || pedido.length === 0) throw new Error("Pedido not found");
    
    // Incrementar contador
    const novoContador = (pedido[0].contadorOrando || 0) + 1;
    await db.update(pedidosOracao)
      .set({ contadorOrando: novoContador })
      .where(eq(pedidosOracao.id, pedidoId));
    
    return { success: true, novoContador };
  } catch (error) {
    console.error("[Database] Error incrementing oracao counter:", error);
    throw error;
  }
}

// ==================== CONFIG ESCOLA DE CRESCIMENTO ====================

export async function getConfigEscolaCrescimento() {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(configEscolaCrescimento).limit(1);
    if (result.length === 0) {
      // Criar configuração padrão se não existir
      const defaultConfig = {
        dataInicio: "10/03/2026",
        descricaoConecte: "Principios elementares da fé.",
        descricaoLidere1: "Uma vida com propósitos.",
        descricaoLidere2: "Tornando-se um cristão apaixonado e contagiante.",
        descricaoAvance: "Kriptonita: Como destruir o que rouba a sua força.",
      };
      await db.insert(configEscolaCrescimento).values(defaultConfig);
      return defaultConfig;
    }
    return result[0];
  } catch (error) {
    console.error("[Database] Error fetching config escola crescimento:", error);
    return null;
  }
}

export async function updateConfigEscolaCrescimento(data: Partial<InsertConfigEscolaCrescimento>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const config = await getConfigEscolaCrescimento();
    if (!config) {
      // Criar nova configuração
      return await db.insert(configEscolaCrescimento).values(data as InsertConfigEscolaCrescimento);
    }
    // Atualizar configuração existente
    await db.update(configEscolaCrescimento).set(data).limit(1);
    return await getConfigEscolaCrescimento();
  } catch (error) {
    console.error("[Database] Error updating config escola crescimento:", error);
    throw error;
  }
}

// ==================== ANEXOS LÍDERES ====================

export async function getDocumentosLideres() {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] Database not available for getDocumentosLideres");
      return [];
    }
    const result = await db.select().from(documentoslideres).where(eq(documentoslideres.ativo, 1));
    return result || [];
  } catch (error) {
    console.error("[Database] Error in getDocumentosLideres:", error);
    throw error;
  }
}

export async function getDocumentoLiderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(documentoslideres).where(eq(documentoslideres.id, id));
  return result[0] || null;
}

export async function createDocumentoLider(data: InsertDocumentoLider) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(documentoslideres).values(data);
  // Retornar o documento que foi inserido
  const inserted = await db.select().from(documentoslideres).orderBy(desc(documentoslideres.id)).limit(1);
  return inserted[0];
}

export async function updateDocumentoLider(id: number, data: Partial<InsertDocumentoLider>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(documentoslideres).set(data).where(eq(documentoslideres.id, id));
}

export async function deleteDocumentoLider(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(documentoslideres).where(eq(documentoslideres.id, id));
}

export async function toggleDocumentoLiderVisibility(id: number, ativo: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(documentoslideres).set({ ativo }).where(eq(documentoslideres.id, id));
}
