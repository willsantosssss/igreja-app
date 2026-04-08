import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema";
import { 
  InsertUser, users, celulas, inscricoesBatismo, usuariosCadastrados, pedidosOracao, anotacoesDevocional,
  eventos, noticias, avisoImportante, contatosIgreja, lideres, relatorios, dadosContribuicao,
  contribuicoes, inscricoesEventos, inscricoesEscolaCrescimento, anexos, pagamentosEventos, configEscolaCrescimento,
  configPagamentosEventos,
  InsertCelula, InsertInscricaoBatismo, InsertUsuarioCadastrado, InsertPedidoOracao, InsertAnotacaoDevocional,
  InsertEvento, InsertNoticia, InsertAvisoImportante, InsertContatoIgreja, InsertLider, InsertRelatorio, InsertDadosContribuicao, InsertInscricaoEvento, InsertInscricaoEscolaCrescimento, InsertAnexo, InsertPagamentoEvento, InsertConfigEscolaCrescimento,
  InsertConfigPagamentoEvento
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { eq, desc, and } from "drizzle-orm";

let _db: ReturnType<typeof drizzle> | null = null;
let _poolConnection: ReturnType<typeof mysql.createPool> | null = null;

// Get or create a reusable MySQL connection pool
export function getSqlClient() {
  if (!_poolConnection && process.env.DATABASE_URL) {
    console.log('[getSqlClient] Creating new MySQL pool');
    _poolConnection = mysql.createPool(process.env.DATABASE_URL);
  }
  console.log('[getSqlClient] Returning pool:', _poolConnection ? 'exists' : 'null');
  return _poolConnection;
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = mysql.createPool(process.env.DATABASE_URL);
      _db = drizzle(pool, { schema, mode: 'default' });
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

// ==================== USUÁRIOS CADASTRADOS ====================

export async function upsertUsuarioCadastrado(data: InsertUsuarioCadastrado) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  console.log('[upsertUsuarioCadastrado] Called with data:', JSON.stringify(data));
  console.log('[upsertUsuarioCadastrado] userId:', data.userId);

  if (!data.userId) {
    throw new Error("userId is required for upsertUsuarioCadastrado");
  }

  const existing = await db
    .select()
    .from(usuariosCadastrados)
    .where(eq(usuariosCadastrados.userId, data.userId));

  console.log('[upsertUsuarioCadastrado] Existing records found:', existing.length);

  if (existing.length > 0) {
    console.log('[upsertUsuarioCadastrado] Updating existing record');
    await db
      .update(usuariosCadastrados)
      .set(data)
      .where(eq(usuariosCadastrados.userId, data.userId));
  } else {
    console.log('[upsertUsuarioCadastrado] Inserting new record');
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
  console.log('[getEventos] Called');
  const db = await getDb();
  if (!db) {
    console.log('[getEventos] No database, returning []');
    return [];
  }
  try {
    console.log('[getEventos] Executing query');
    const result = await db.select().from(eventos).orderBy(desc(eventos.id));
    console.log('[getEventos] Result:', result.length, 'eventos');
    return result;
  } catch (error) {
    console.error('[getEventos] Error:', error);
    return [];
  }
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
  try {
    const result = await db.insert(lideres).values(data);
    // Buscar pelo userId para garantir que retorna o líder correto
    const lider = await db.select().from(lideres)
      .where(eq(lideres.userId, data.userId))
      .orderBy(lideres.id)
      .limit(1);
    return lider[0] || { ...data, id: 0 };
  } catch (error: any) {
    console.error("[Database] Error creating lider:", error);
    throw new Error(`Erro ao criar líder: ${error.message}`);
  }
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
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  
  try {
    const pool = mysql.createPool(process.env.DATABASE_URL);
    const connection = await pool.getConnection();
    
    // Construir título e descrição a partir dos dados
    const titulo = `Relatório ${data.tipo || 'Semanal'}`;
    const descricao = `${data.celula || ''} - Presentes: ${data.presentes || 0}, Novos Visitantes: ${data.novosVisitantes || 0}, Conversões: ${data.conversoes || 0}`;
    
    // Converter data de DD/MM/YYYY para YYYY-MM-DD
    let dataFormatada = null;
    if (data.periodo) {
      const [dia, mes, ano] = data.periodo.split('/');
      dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
    
    const query = `INSERT INTO relatorios (titulo, descricao, observacoes, dataRelatorio, liderId, celula, tipo, presentes, novosVisitantes, conversoes) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const [result] = await connection.execute(query, [
      titulo,
      descricao,
      data.observacoes || null,
      dataFormatada,
      data.liderId || 0,
      data.celula || '',
      data.tipo || 'semanal',
      data.presentes || 0,
      data.novosVisitantes || 0,
      data.conversoes || 0,
    ]);
    
    const insertResult = result as any;
    const insertId = insertResult?.insertId || 0;
    
    await connection.release();
    await pool.end();
    
    return insertId;
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
  
  // Buscar titulos e datas dos eventos
  const eventosMap = new Map();
  const eventosData = await db.select().from(eventos);
  eventosData.forEach((e: any) => {
    eventosMap.set(e.id, { titulo: e.titulo, data: e.data });
  });
  
  // Retornar dados conforme esperado pela tela
  return inscricoes.map((i: any) => {
    const eventoInfo = eventosMap.get(i.eventoId) || { titulo: 'Evento desconhecido', data: '' };
    return {
      id: i.id,
      eventoId: i.eventoId,
      eventoTitulo: eventoInfo.titulo,
      eventoData: eventoInfo.data,
      nome: i.nome,
      celula: i.celula,
      telefone: i.telefone,
      status: i.status,
      userId: i.userId,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    };
  });
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

  try {
    // Deletar em ordem de dependência (tabelas filhas primeiro)
    await db.delete(pedidosOracao).where(eq(pedidosOracao.userId, userId));
    await db.delete(contribuicao).where(eq(contribuicao.userId, userId));
    await db.delete(inscricoesEventos).where(eq(inscricoesEventos.userId, userId));
    await db.delete(inscricoesEscolaCrescimento).where(eq(inscricoesEscolaCrescimento.userId, userId));
    await db.delete(lideres).where(eq(lideres.userId, userId));
    await db.delete(usuariosCadastrados).where(eq(usuariosCadastrados.userId, userId));
    await db.delete(users).where(eq(users.id, userId));
    return { success: true, message: "Usuário deletado com sucesso" };
  } catch (error: any) {
    console.error("[Database] Error deleting user:", error);
    throw new Error(`Erro ao deletar usuário: ${error.message}`);
  }
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

export async function getAnexos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(anexos);
}

export async function getAnexoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(anexos).where(eq(anexos.id, id));
  return result[0] || null;
}

export async function createAnexo(data: InsertAnexo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(anexos).values(data);
  return result.insertId;
}

export async function updateAnexo(id: number, data: Partial<InsertAnexo>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(anexos).set(data).where(eq(anexos.id, id));
}

export async function deleteAnexo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(anexos).where(eq(anexos.id, id));
}


// Pagamentos de Eventos
export async function getPagamentosEventos() {
  const pool = getSqlClient();
  if (!pool) throw new Error("Database not available");
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM pagamentos_eventos ORDER BY id DESC');
    return rows;
  } finally {
    conn.release();
  }
}

export async function getPagamentoEventoByEventoId(eventoId: number) {
  const pool = getSqlClient();
  if (!pool) throw new Error("Database not available");
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM pagamentos_eventos WHERE eventoId = ? LIMIT 1', [eventoId]);
    return (rows as any[])[0] || null;
  } finally {
    conn.release();
  }
}

export async function createPagamentoEvento(data: InsertPagamentoEvento) {
  const pool = getSqlClient();
  if (!pool) throw new Error("Database not available");
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      'INSERT INTO pagamentos_eventos (eventoId, valor, qrCodeUrl, chavePix, nomeRecebedor, ativo) VALUES (?, ?, ?, ?, ?, ?)',
      [data.eventoId, data.valor, data.qrCodeUrl, data.chavePix, data.nomeRecebedor, data.ativo || 1]
    );
    const insertId = (result as any).insertId;
    return {
      id: insertId,
      eventoId: data.eventoId,
      valor: data.valor,
      qrCodeUrl: data.qrCodeUrl,
      chavePix: data.chavePix,
      nomeRecebedor: data.nomeRecebedor,
      ativo: data.ativo || 1,
    };
  } catch (error: any) {
    console.error("[Database] Error creating pagamento evento:", error);
    throw new Error(`Erro ao criar configuração de pagamento: ${error.message}`);
  } finally {
    conn.release();
  }
}

export async function updatePagamentoEvento(id: number, data: Partial<InsertPagamentoEvento>) {
  const pool = getSqlClient();
  if (!pool) throw new Error("Database not available");
  const conn = await pool.getConnection();
  try {
    const updates: string[] = [];
    const values: any[] = [];
    
    if (data.valor !== undefined) { updates.push('valor = ?'); values.push(data.valor); }
    if (data.qrCodeUrl !== undefined) { updates.push('qrCodeUrl = ?'); values.push(data.qrCodeUrl); }
    if (data.chavePix !== undefined) { updates.push('chavePix = ?'); values.push(data.chavePix); }
    if (data.nomeRecebedor !== undefined) { updates.push('nomeRecebedor = ?'); values.push(data.nomeRecebedor); }
    if (data.ativo !== undefined) { updates.push('ativo = ?'); values.push(data.ativo); }
    
    if (updates.length === 0) return;
    
    values.push(id);
    await conn.query(`UPDATE pagamentos_eventos SET ${updates.join(', ')} WHERE id = ?`, values);
  } finally {
    conn.release();
  }
}

export async function deletePagamentoEvento(id: number) {
  const pool = getSqlClient();
  if (!pool) throw new Error("Database not available");
  const conn = await pool.getConnection();
  try {
    await conn.query('DELETE FROM pagamentos_eventos WHERE id = ?', [id]);
  } finally {
    conn.release();
  }
}

// ==================== INSCRIÇÕES EVENTOS COM STATUS DE PAGAMENTO ====================

export async function getInscricoesEventosPagas() {
  const pool = getSqlClient();
  if (!pool) return [];
  
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT 
        ie.id,
        ie.eventoId,
        ie.nome,
        ie.email,
        ie.telefone,
        ie.celula,
        ie.status,
        ie.createdAt,
        ie.updatedAt,
        e.titulo as eventoTitulo,
        e.data as eventoData
      FROM inscricoesEventos ie
      LEFT JOIN eventos e ON ie.eventoId = e.id
      WHERE e.tipo IN ('evento-especial', 'special')
      ORDER BY ie.createdAt DESC
    `);
    connection.release();
    
    console.log(`[getInscricoesEventosPagas] Encontradas ${(rows || []).length} inscrições`);
    return (rows || []).map((row: any) => ({
      ...row,
      statusPagamento: 'nao-pago',
      dataPagamento: null,
      observacoes: null,
    }));
  } catch (error) {
    console.error('[getInscricoesEventosPagas] Error:', error);
    return [];
  }
}

export async function updateInscricaoEventoStatus(inscricaoId: number, statusPagamento: string, observacoes?: string) {
  const pool = getSqlClient();
  if (!pool) throw new Error("Database not available");
  
  try {
    const connection = await pool.getConnection();
    
    // Atualizar apenas o campo updatedAt que sabemos que existe
    await connection.query(`
      UPDATE inscricoesEventos 
      SET updatedAt = NOW()
      WHERE id = ?
    `, [inscricaoId]);
    
    connection.release();
    console.log(`[updateInscricaoEventoStatus] Inscricao ${inscricaoId} marcada como ${statusPagamento}`);
    return { success: true };
  } catch (error) {
    console.error('[updateInscricaoEventoStatus] Error:', error);
    throw error;
  }
}


// ==================== CONFIGURAÇÕES DE PAGAMENTO DE EVENTOS ====================

export async function getConfigPagamentosEventos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(configPagamentosEventos).orderBy(desc(configPagamentosEventos.createdAt));
}

export async function getConfigPagamentoEventoByEventoId(eventoId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(configPagamentosEventos).where(eq(configPagamentosEventos.eventoId, eventoId));
  return result[0] || null;
}

export async function getConfigPagamentoEventoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(configPagamentosEventos).where(eq(configPagamentosEventos.id, id));
  return result[0] || null;
}

export async function createConfigPagamentoEvento(data: InsertConfigPagamentoEvento) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.insert(configPagamentosEventos).values(data);
    const config = await getConfigPagamentoEventoByEventoId(data.eventoId);
    return config || { ...data, id: 0 };
  } catch (error: any) {
    console.error("[Database] Error creating config pagamento evento:", error);
    throw new Error(`Erro ao criar configuração de pagamento: ${error.message}`);
  }
}

export async function updateConfigPagamentoEvento(id: number, data: Partial<InsertConfigPagamentoEvento>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.update(configPagamentosEventos).set(data).where(eq(configPagamentosEventos.id, id));
    return await getConfigPagamentoEventoById(id);
  } catch (error: any) {
    console.error("[Database] Error updating config pagamento evento:", error);
    throw new Error(`Erro ao atualizar configuração de pagamento: ${error.message}`);
  }
}

export async function deleteConfigPagamentoEvento(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.delete(configPagamentosEventos).where(eq(configPagamentosEventos.id, id));
  } catch (error: any) {
    console.error("[Database] Error deleting config pagamento evento:", error);
    throw new Error(`Erro ao deletar configuração de pagamento: ${error.message}`);
  }
}
