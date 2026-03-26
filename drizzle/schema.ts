import { 
  mysqlTable, 
  mysqlEnum,
  int, 
  text, 
  timestamp, 
  varchar,
  boolean
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */

// Enums for MySQL
const roleEnum = mysqlEnum("role", ["user", "admin"]);
const statusBatismoEnum = mysqlEnum("status_batismo", ["pendente", "aprovado", "rejeitado"]);
const statusContribuicaoEnum = mysqlEnum("status_contribuicao", ["pendente", "confirmado", "rejeitado"]);
const statusInscricaoEnum = mysqlEnum("status_inscricao", ["confirmado", "cancelado"]);
const pixTypeEnum = mysqlEnum("pixType", ["email", "cpf", "cnpj", "telefone", "aleatoria"]);

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  password: text("password"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum.default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Celulas table
export const celulas = mysqlTable("celulas", {
  id: int("id").primaryKey().autoincrement(),
  nome: varchar("nome", { length: 255 }).notNull(),
  lider: varchar("lider", { length: 255 }).notNull(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  endereco: varchar("endereco", { length: 255 }).notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  diaReuniao: varchar("diaReuniao", { length: 50 }).notNull(),
  horario: varchar("horario", { length: 10 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Celula = typeof celulas.$inferSelect;
export type InsertCelula = typeof celulas.$inferInsert;

// Inscricoes de Batismo table
export const inscricoesBatismo = mysqlTable("inscricoesBatismo", {
  id: int("id").primaryKey().autoincrement(),
  nome: varchar("nome", { length: 255 }).notNull(),
  dataNascimento: varchar("dataNascimento", { length: 10 }).notNull(),
  celula: varchar("celula", { length: 255 }).notNull(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  motivacao: text("motivacao").notNull(),
  status: statusBatismoEnum.default("pendente").notNull(),
  dataProcessamento: timestamp("dataProcessamento"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type InscricaoBatismo = typeof inscricoesBatismo.$inferSelect;
export type InsertInscricaoBatismo = typeof inscricoesBatismo.$inferInsert;

// Usuarios Cadastrados (Membros) table
export const usuariosCadastrados = mysqlTable("usuariosCadastrados", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  dataNascimento: varchar("dataNascimento", { length: 10 }),
  celula: varchar("celula", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UsuarioCadastrado = typeof usuariosCadastrados.$inferSelect;
export type InsertUsuarioCadastrado = typeof usuariosCadastrados.$inferInsert;

// Pedidos de Oracao table
export const pedidosOracao = mysqlTable("pedidosOracao", {
  id: int("id").primaryKey().autoincrement(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao").notNull(),
  categoria: varchar("categoria", { length: 50 }).notNull(),
  contadorOrando: int("contadorOrando").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  respondido: int("respondido").default(0).notNull(),
  testemunho: text("testemunho"),
});

export type PedidoOracao = typeof pedidosOracao.$inferSelect;
export type InsertPedidoOracao = typeof pedidosOracao.$inferInsert;

// Anotações de Devocional table
export const anotacoesDevocional = mysqlTable("anotacoesDevocional", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  livro: varchar("livro", { length: 100 }).notNull(),
  capitulo: int("capitulo").notNull(),
  texto: text("texto").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AnotacaoDevocional = typeof anotacoesDevocional.$inferSelect;
export type InsertAnotacaoDevocional = typeof anotacoesDevocional.$inferInsert;

// Eventos table
export const eventos = mysqlTable("eventos", {
  id: int("id").primaryKey().autoincrement(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao").notNull(),
  data: varchar("data", { length: 50 }).notNull(),
  horario: varchar("horario", { length: 20 }).notNull(),
  local: varchar("local", { length: 255 }).notNull(),
  tipo: varchar("tipo", { length: 50 }).notNull(),
  requireInscricao: int("requireInscricao").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Evento = typeof eventos.$inferSelect;
export type InsertEvento = typeof eventos.$inferInsert;

// Noticias table
export const noticias = mysqlTable("noticias", {
  id: int("id").primaryKey().autoincrement(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  conteudo: text("conteudo"),
  data: varchar("data", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Noticia = typeof noticias.$inferSelect;
export type InsertNoticia = typeof noticias.$inferInsert;

// Aviso Importante table
export const avisoImportante = mysqlTable("avisoImportante", {
  id: int("id").primaryKey().autoincrement(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem").notNull(),
  ativo: int("ativo").default(1).notNull(),
  dataExpiracao: varchar("dataExpiracao", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AvisoImportante = typeof avisoImportante.$inferSelect;
export type InsertAvisoImportante = typeof avisoImportante.$inferInsert;

// Contatos Igreja table
export const contatosIgreja = mysqlTable("contatosIgreja", {
  id: int("id").primaryKey().autoincrement(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ContatoIgreja = typeof contatosIgreja.$inferSelect;
export type InsertContatoIgreja = typeof contatosIgreja.$inferInsert;

// Aniversariantes table
export const aniversariantes = mysqlTable("aniversariantes", {
  id: int("id").primaryKey().autoincrement(),
  nome: varchar("nome", { length: 255 }).notNull(),
  dataNascimento: varchar("dataNascimento", { length: 10 }).notNull(), // Formato: DD/MM/YYYY
  celula: varchar("celula", { length: 255 }),
  telefone: varchar("telefone", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Aniversariante = typeof aniversariantes.$inferSelect;
export type InsertAniversariante = typeof aniversariantes.$inferInsert;

// Contribuições table
export const contribuicoes = mysqlTable("contribuicoes", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  valor: varchar("valor", { length: 20 }).notNull(), // Formato: "R$ 100,00"
  tipo: varchar("tipo", { length: 50 }).notNull(), // dizimo, oferta, missoes
  data: varchar("data", { length: 50 }).notNull(),
  comprovanteUrl: varchar("comprovanteUrl", { length: 500 }),
  status: statusContribuicaoEnum.default("pendente").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Contribuicao = typeof contribuicoes.$inferSelect;
export type InsertContribuicao = typeof contribuicoes.$inferInsert;

// Inscrições em Eventos table
export const inscricoesEventos = mysqlTable("inscricoesEventos", {
  id: int("id").primaryKey().autoincrement(),
  eventoId: int("eventoId").notNull(),
  userId: int("userId"),
  nome: varchar("nomeInscrito", { length: 255 }).notNull(),
  email: varchar("emailInscrito", { length: 255 }),
  telefone: varchar("telefoneinscrito", { length: 20 }),
  celula: varchar("celulaInscrito", { length: 100 }),
  dataInscricao: timestamp("dataInscricao").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type InscricaoEvento = typeof inscricoesEventos.$inferSelect;
export type InsertInscricaoEvento = typeof inscricoesEventos.$inferInsert;

// Líderes table
export const lideres = mysqlTable("lideres", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  celula: varchar("celula", { length: 255 }).notNull(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }),
  ativo: int("ativo").default(1).notNull(), // 1 = ativo, 0 = inativo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Lider = typeof lideres.$inferSelect;
export type InsertLider = typeof lideres.$inferInsert;

// Relatórios table
export const relatorios = mysqlTable("relatorios", {
  id: int("id").primaryKey().autoincrement(),
  liderId: int("liderId").notNull(),
  celula: varchar("celula", { length: 255 }).notNull(),
  tipo: varchar("tipo", { length: 50 }).notNull(), // semanal, mensal, trimestral
  periodo: varchar("periodo", { length: 100 }).notNull(), // Ex: "Janeiro 2026"
  presentes: int("presentes").notNull(),
  novosVisitantes: int("novosVisitantes").default(0).notNull(),
  conversoes: int("conversoes").default(0).notNull(),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Relatorio = typeof relatorios.$inferSelect;
export type InsertRelatorio = typeof relatorios.$inferInsert;

// Dados de Contribuição table (configurações gerais de PIX e banco)
export const dadosContribuicao = mysqlTable("dadosContribuicao", {
  id: int("id").primaryKey().autoincrement(),
  pixKey: varchar("pixKey", { length: 255 }).notNull(),
  pixType: pixTypeEnum.notNull(),
  bank: varchar("bank", { length: 255 }).notNull(),
  agency: varchar("agency", { length: 50 }).notNull(),
  account: varchar("account", { length: 50 }).notNull(),
  cnpj: varchar("cnpj", { length: 50 }).notNull(),
  titular: varchar("titular", { length: 255 }).notNull(),
  mensagemMotivacional: text("mensagemMotivacional").notNull(),
  versiculoRef: varchar("versiculoRef", { length: 255 }).notNull(),
  mensagemAgradecimento: text("mensagemAgradecimento").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type DadosContribuicao = typeof dadosContribuicao.$inferSelect;
export type InsertDadosContribuicao = typeof dadosContribuicao.$inferInsert;

// Inscrições em Escola de Crescimento table
export const inscricoesEscolaCrescimento = mysqlTable("inscricoesEscolaCrescimento", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId"),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  celula: varchar("celula", { length: 100 }),
  curso: varchar("curso", { length: 100 }),
  status: varchar("status", { length: 50 }).default("confirmado"),
  dataInscricao: timestamp("dataInscricao").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type InscricaoEscolaCrescimento = typeof inscricoesEscolaCrescimento.$inferSelect;
export type InsertInscricaoEscolaCrescimento = typeof inscricoesEscolaCrescimento.$inferInsert;

// Pagamentos de Eventos table
export const pagamentosEventos = mysqlTable("pagamentosEventos", {
  id: int("id").primaryKey().autoincrement(),
  inscricaoId: int("inscricaoId").notNull(),
  valor: varchar("valor", { length: 20 }).notNull(),
  metodo: varchar("metodo", { length: 50 }).notNull(), // pix, dinheiro, cartao
  status: varchar("status", { length: 50 }).default("pendente").notNull(),
  comprovante: varchar("comprovante", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PagamentoEvento = typeof pagamentosEventos.$inferSelect;
export type InsertPagamentoEvento = typeof pagamentosEventos.$inferInsert;

// Anexos table
export const anexos = mysqlTable("anexos", {
  id: int("id").primaryKey().autoincrement(),
  relatorioId: int("relatorioId").notNull(),
  nomeArquivo: varchar("nomeArquivo", { length: 255 }).notNull(),
  urlArquivo: varchar("urlArquivo", { length: 500 }).notNull(),
  tipo: varchar("tipo", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Anexo = typeof anexos.$inferSelect;
export type InsertAnexo = typeof anexos.$inferInsert;

// Anexos Líderes table
export const anexosLideres = mysqlTable("anexosLideres", {
  id: int("id").primaryKey().autoincrement(),
  liderId: int("liderId").notNull(),
  nomeArquivo: varchar("nomeArquivo", { length: 255 }).notNull(),
  urlArquivo: varchar("urlArquivo", { length: 500 }).notNull(),
  tipo: varchar("tipo", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AnexoLider = typeof anexosLideres.$inferSelect;
export type InsertAnexoLider = typeof anexosLideres.$inferInsert;
