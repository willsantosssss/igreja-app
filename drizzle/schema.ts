import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: text("passwordHash"),
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
  respondido: int("respondido").default(0).notNull(), // 0 = ativo, 1 = respondido
  testemunho: text("testemunho"), // Testemunho de como Deus respondeu (opcional)
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

// Aniversariantes table
export const aniversariantes = mysqlTable("aniversariantes", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  dataNascimento: varchar("dataNascimento", { length: 10 }).notNull(), // Formato: DD/MM/YYYY
  celula: varchar("celula", { length: 255 }),
  telefone: varchar("telefone", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Aniversariante = typeof aniversariantes.$inferSelect;
export type InsertAniversariante = typeof aniversariantes.$inferInsert;

// Contribuições table
export const contribuicoes = mysqlTable("contribuicoes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  valor: varchar("valor", { length: 20 }).notNull(), // Formato: "R$ 100,00"
  tipo: varchar("tipo", { length: 50 }).notNull(), // dizimo, oferta, missoes
  data: varchar("data", { length: 50 }).notNull(),
  comprovanteUrl: varchar("comprovanteUrl", { length: 500 }),
  status: mysqlEnum("status", ["pendente", "confirmado", "rejeitado"]).default("pendente").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contribuicao = typeof contribuicoes.$inferSelect;
export type InsertContribuicao = typeof contribuicoes.$inferInsert;

// Inscrições em Eventos table
export const inscricoesEventos = mysqlTable("inscricoesEventos", {
  id: int("id").autoincrement().primaryKey(),
  eventoId: int("eventoId").notNull(),
  userId: int("userId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  celula: varchar("celula", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["confirmado", "cancelado"]).default("confirmado").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InscricaoEvento = typeof inscricoesEventos.$inferSelect;
export type InsertInscricaoEvento = typeof inscricoesEventos.$inferInsert;

// Líderes table
export const lideres = mysqlTable("lideres", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  celula: varchar("celula", { length: 255 }).notNull(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }),
  ativo: int("ativo").default(1).notNull(), // 1 = ativo, 0 = inativo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lider = typeof lideres.$inferSelect;
export type InsertLider = typeof lideres.$inferInsert;

// Relatórios table
export const relatorios = mysqlTable("relatorios", {
  id: int("id").autoincrement().primaryKey(),
  liderId: int("liderId").notNull(),
  celula: varchar("celula", { length: 255 }).notNull(),
  tipo: varchar("tipo", { length: 50 }).notNull(), // semanal, mensal, trimestral
  periodo: varchar("periodo", { length: 100 }).notNull(), // Ex: "Janeiro 2026"
  presentes: int("presentes").notNull(),
  novosVisitantes: int("novosVisitantes").default(0).notNull(),
  conversoes: int("conversoes").default(0).notNull(),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Relatorio = typeof relatorios.$inferSelect;
export type InsertRelatorio = typeof relatorios.$inferInsert;

// Dados de Contribuição table (configurações gerais de PIX e banco)
export const dadosContribuicao = mysqlTable("dadosContribuicao", {
  id: int("id").autoincrement().primaryKey(),
  pixKey: varchar("pixKey", { length: 255 }).notNull(),
  pixType: mysqlEnum("pixType", ["email", "cpf", "cnpj", "telefone", "aleatoria"]).notNull(),
  bank: varchar("bank", { length: 255 }).notNull(),
  agency: varchar("agency", { length: 50 }).notNull(),
  account: varchar("account", { length: 50 }).notNull(),
  cnpj: varchar("cnpj", { length: 50 }).notNull(),
  titular: varchar("titular", { length: 255 }).notNull(),
  mensagemMotivacional: text("mensagemMotivacional").notNull(),
  versiculoRef: varchar("versiculoRef", { length: 255 }).notNull(),
  mensagemAgradecimento: text("mensagemAgradecimento").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DadosContribuicao = typeof dadosContribuicao.$inferSelect;
export type InsertDadosContribuicao = typeof dadosContribuicao.$inferInsert;

// Inscrições Escola de Crescimento table
export const inscricoesEscolaCrescimento = mysqlTable("inscricoesEscolaCrescimento", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  celula: varchar("celula", { length: 255 }).notNull(),
  curso: mysqlEnum("curso", ["Conecte", "Lidere 1", "Lidere 2", "Avance"]).notNull(),
  userId: int("userId"),
  status: mysqlEnum("status", ["confirmado", "cancelado"]).default("confirmado").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InscricaoEscolaCrescimento = typeof inscricoesEscolaCrescimento.$inferSelect;
export type InsertInscricaoEscolaCrescimento = typeof inscricoesEscolaCrescimento.$inferInsert;

// Configuração da Escola de Crescimento
export const configEscolaCrescimento = mysqlTable("configEscolaCrescimento", {
  id: int("id").autoincrement().primaryKey(),
  dataInicio: varchar("dataInicio", { length: 10 }).notNull(), // Formato: DD/MM/YYYY
  descricaoConecte: text("descricaoConecte").notNull(),
  descricaoLidere1: text("descricaoLidere1").notNull(),
  descricaoLidere2: text("descricaoLidere2").notNull(),
  descricaoAvance: text("descricaoAvance").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConfigEscolaCrescimento = typeof configEscolaCrescimento.$inferSelect;
export type InsertConfigEscolaCrescimento = typeof configEscolaCrescimento.$inferInsert;
