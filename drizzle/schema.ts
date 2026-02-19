import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Celulas table
export const celulas = mysqlTable("celulas", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  lider: varchar("lider", { length: 255 }).notNull(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  endereco: varchar("endereco", { length: 255 }).notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  diaReuniao: varchar("diaReuniao", { length: 50 }).notNull(),
  horario: varchar("horario", { length: 10 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Celula = typeof celulas.$inferSelect;
export type InsertCelula = typeof celulas.$inferInsert;

// Inscricoes de Batismo table
export const inscricoesBatismo = mysqlTable("inscricoesBatismo", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  dataNascimento: varchar("dataNascimento", { length: 10 }).notNull(),
  celula: varchar("celula", { length: 255 }).notNull(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  motivacao: text("motivacao").notNull(),
  status: mysqlEnum("status", ["pendente", "aprovado", "rejeitado"]).default("pendente").notNull(),
  dataProcessamento: timestamp("dataProcessamento"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InscricaoBatismo = typeof inscricoesBatismo.$inferSelect;
export type InsertInscricaoBatismo = typeof inscricoesBatismo.$inferInsert;

// Usuarios Cadastrados (Membros) table
export const usuariosCadastrados = mysqlTable("usuariosCadastrados", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  dataNascimento: varchar("dataNascimento", { length: 10 }).notNull(),
  celula: varchar("celula", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UsuarioCadastrado = typeof usuariosCadastrados.$inferSelect;
export type InsertUsuarioCadastrado = typeof usuariosCadastrados.$inferInsert;

// Pedidos de Oracao table
export const pedidosOracao = mysqlTable("pedidosOracao", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao").notNull(),
  categoria: varchar("categoria", { length: 50 }).notNull(),
  contadorOrando: int("contadorOrando").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PedidoOracao = typeof pedidosOracao.$inferSelect;
export type InsertPedidoOracao = typeof pedidosOracao.$inferInsert;

// Anotações de Devocional table
export const anotacoesDevocional = mysqlTable("anotacoesDevocional", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  livro: varchar("livro", { length: 100 }).notNull(),
  capitulo: int("capitulo").notNull(),
  texto: text("texto").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnotacaoDevocional = typeof anotacoesDevocional.$inferSelect;
export type InsertAnotacaoDevocional = typeof anotacoesDevocional.$inferInsert;

// Eventos table
export const eventos = mysqlTable("eventos", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao").notNull(),
  data: varchar("data", { length: 50 }).notNull(),
  horario: varchar("horario", { length: 20 }).notNull(),
  local: varchar("local", { length: 255 }).notNull(),
  tipo: varchar("tipo", { length: 50 }).notNull(),
  requireInscricao: int("requireInscricao").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Evento = typeof eventos.$inferSelect;
export type InsertEvento = typeof eventos.$inferInsert;

// Noticias table
export const noticias = mysqlTable("noticias", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  conteudo: text("conteudo").notNull(),
  data: varchar("data", { length: 50 }).notNull(),
  imagemUrl: varchar("imagemUrl", { length: 500 }),
  destaque: int("destaque").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Noticia = typeof noticias.$inferSelect;
export type InsertNoticia = typeof noticias.$inferInsert;

// Aviso Importante table
export const avisoImportante = mysqlTable("avisoImportante", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem").notNull(),
  ativo: int("ativo").default(1).notNull(),
  dataExpiracao: varchar("dataExpiracao", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AvisoImportante = typeof avisoImportante.$inferSelect;
export type InsertAvisoImportante = typeof avisoImportante.$inferInsert;

// Contatos Igreja table
export const contatosIgreja = mysqlTable("contatosIgreja", {
  id: int("id").autoincrement().primaryKey(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContatoIgreja = typeof contatosIgreja.$inferSelect;
export type InsertContatoIgreja = typeof contatosIgreja.$inferInsert;
