import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { signupUser, loginUser } from "./auth-simple";
import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";
import { Readable } from "stream";
import { finished } from "stream/promises";
import fetch from "node-fetch";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Garantir que o diretório de uploads existe
fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(console.error);

const COOKIE_NAME = "session";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    signup: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        try {
          const result = await signupUser(input.email, input.password, input.name);
          
          // Create session token using SDK
          const openId = `email_${result.userId}`; // Use email-based openId for manual login
          const sessionToken = await ctx.sdk.createSessionToken(openId, { name: result.name || result.email || "" });
          
          // Set session cookie
          const cookieOptions = getSessionCookieOptions(ctx.req);
          console.log("[Signup] Setting cookie with options:", {
            domain: cookieOptions.domain,
            path: cookieOptions.path,
            sameSite: cookieOptions.sameSite,
            secure: cookieOptions.secure,
            httpOnly: cookieOptions.httpOnly,
            hostname: ctx.req.hostname,
            protocol: ctx.req.protocol,
          });
          ctx.res.cookie(COOKIE_NAME, sessionToken, {
            ...cookieOptions,
            maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
          });
          console.log("[Signup] Cookie set successfully");
          
          return { success: true, userId: result.userId, email: result.email, name: result.name, openId, sessionToken };
        } catch (error: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Signup failed",
          });
        }
      }),
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const result = await loginUser(input.email, input.password);
          
          // Create session token using SDK
          const openId = `email_${result.userId}`; // Use email-based openId for manual login
          const sessionToken = await ctx.sdk.createSessionToken(openId, { name: result.name || result.email || "" });
          
          // Set session cookie
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, {
            ...cookieOptions,
            maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
          });
          
          return { success: true, userId: result.userId, email: result.email, name: result.name, openId, sessionToken };
        } catch (error: any) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: error.message || "Invalid credentials",
          });
        }
      }),
  }),

  // Celulas
  celulas: router({
    list: publicProcedure.query(() => db.getCelulas()),
    getById: publicProcedure.input(z.number()).query(({ input }) => db.getCelulaById(input)),
    create: publicProcedure
      .input(z.object({
        nome: z.string().min(1),
        lider: z.string().min(1),
        telefone: z.string().min(1),
        endereco: z.string().min(1),
        latitude: z.string().min(1),
        longitude: z.string().min(1),
        diaReuniao: z.string().min(1),
        horario: z.string().min(1),
      }))
      .mutation(({ input }) => db.createCelula(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nome: z.string().optional(),
          lider: z.string().optional(),
          telefone: z.string().optional(),
          endereco: z.string().optional(),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
          diaReuniao: z.string().optional(),
          horario: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateCelula(input.id, input.data)),
    delete: publicProcedure
      .input(z.number())
      .mutation(({ input }) => db.deleteCelula(input)),
  }),

  // Inscricoes de Batismo
  batismo: router({
    list: publicProcedure.query(() => db.getInscricoesBatismo()),
    listPendentes: protectedProcedure.query(() => db.getInscricoesBatismoPendentes()),
    create: publicProcedure
      .input(z.object({
        nome: z.string().min(1),
        dataNascimento: z.string().min(1),
        celula: z.string().min(1),
        telefone: z.string().min(1),
        motivacao: z.string().min(1),
      }))
      .mutation(({ input }) => db.createInscricaoBatismo({ ...input, status: "pendente" })),
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pendente", "aprovado", "rejeitado"]),
      }))
      .mutation(({ input }) => db.updateInscricaoBatismo(input.id, { status: input.status, dataProcessamento: new Date() })),
    delete: protectedProcedure
      .input(z.number())
      .mutation(({ input }) => db.deleteInscricaoBatismo(input)),
  }),

  // Usuarios Cadastrados
  usuarios: router({
    list: publicProcedure.query(() => db.getAllUsuariosCadastrados()),
    getByUserId: protectedProcedure.query(({ ctx }) => db.getUsuarioCadastrado(ctx.user.id)),
    getAniversariantes: publicProcedure
      .input(z.number())
      .query(({ input }) => db.getAniversariantesMes(input)),
    getMembrosPorCelula: publicProcedure
      .input(z.string())
      .query(({ input }) => db.getMembrosPorCelula(input)),
    create: protectedProcedure
      .input(z.object({
        nome: z.string().min(1),
        dataNascimento: z.string().optional(),
        celula: z.string().min(1),
      }))
      .mutation(({ ctx, input }) => db.upsertUsuarioCadastrado({ ...input, userId: ctx.user.id })),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nome: z.string().optional(),
          dataNascimento: z.string().optional(),
          celula: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.upsertUsuarioCadastrado({ ...input.data, userId: input.id })),
    getMeuPerfil: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      return db.getUsuarioCadastrado(ctx.user.id);
    }),
    updateMeuPerfil: protectedProcedure
      .input(z.object({
        nome: z.string().min(1),
        dataNascimento: z.string().optional(),
        celula: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Not authenticated");
        return db.upsertUsuarioCadastrado({ ...input, userId: ctx.user.id });
      }),
    deleteUser: protectedProcedure
      .input(z.number())
      .mutation(async ({ input: userId, ctx }) => {
        // Permitir deleção para usuários autenticados (painel admin web já tem autenticação por senha)
        return db.deleteUserCompletely(userId);
      }),
    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input: usuarioId, ctx }) => {
        // Permitir delecao para usuarios autenticados (painel admin web ja tem autenticacao por senha)
        return db.deleteUserCompletely(usuarioId);
      }),
    deleteAccount: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
        // Deletar a conta do usuario autenticado
        return db.deleteUserCompletely(ctx.user.id);
      }),
    get: protectedProcedure
      .input(z.number())
      .query(({ input }) => db.getUsuarioCadastrado(input)),
  }),

  // Pedidos de Oracao
  oracao: router({
    list: publicProcedure.query(() => db.getPedidosOracao()),
    getById: publicProcedure
      .input(z.number())
      .query(({ input }) => db.getPedidoOracaoById(input)),
    create: publicProcedure
      .input(z.object({
        nome: z.string().min(1),
        descricao: z.string().min(1),
        categoria: z.string().min(1),
      }))
      .mutation(({ input }) => db.createPedidoOracao({ ...input, contadorOrando: 0 })),
    incrementarContador: publicProcedure
      .input(z.number())
      .mutation(({ input }) => db.incrementarContadorOracao(input)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nome: z.string().optional(),
          descricao: z.string().optional(),
          categoria: z.string().optional(),
          respondido: z.number().optional(),
          testemunho: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updatePedidoOracao(input.id, input.data)),
    delete: protectedProcedure
      .input(z.number())
      .mutation(({ input }) => db.deletePedidoOracao(input)),
  }),

  // Anotações de Devocional
  anotacoesDevocional: router({
    listByUser: protectedProcedure
      .query(({ ctx }) => {
        if (!ctx.user?.id) throw new Error("User not authenticated");
        return db.getAnotacoesDevocionalByUserId(ctx.user.id);
      }),
    getByCapitulo: protectedProcedure
      .input(z.object({
        livro: z.string().min(1),
        capitulo: z.number().min(1),
      }))
      .query(({ ctx, input }) => {
        if (!ctx.user?.id) throw new Error("User not authenticated");
        return db.getAnotacaoDevocionalByCapitulo(ctx.user.id, input.livro, input.capitulo);
      }),
    create: protectedProcedure
      .input(z.object({
        livro: z.string().min(1),
        capitulo: z.number().min(1),
        texto: z.string().min(1),
      }))
      .mutation(({ ctx, input }) => {
        if (!ctx.user?.id) throw new Error("User not authenticated");
        return db.createAnotacaoDevocional({
          userId: ctx.user.id,
          livro: input.livro,
          capitulo: input.capitulo,
          texto: input.texto,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        texto: z.string().min(1),
      }))
      .mutation(({ ctx, input }) => {
        if (!ctx.user?.id) throw new Error("User not authenticated");
        return db.updateAnotacaoDevocional(input.id, { texto: input.texto });
      }),
    delete: protectedProcedure
      .input(z.number())
      .mutation(({ ctx, input }) => {
        if (!ctx.user?.id) throw new Error("User not authenticated");
        return db.deleteAnotacaoDevocional(input);
      }),
    deleteByCapitulo: protectedProcedure
      .input(z.object({
        livro: z.string().min(1),
        capitulo: z.number().min(1),
      }))
      .mutation(({ ctx, input }) => {
        if (!ctx.user?.id) throw new Error("User not authenticated");
        return db.deleteAnotacoesDevocionalByCapitulo(ctx.user.id, input.livro, input.capitulo);
      }),
  }),

  // Eventos
  eventos: router({
    list: publicProcedure.query(() => db.getEventos()),
    getById: publicProcedure.input(z.number()).query(({ input }) => db.getEventoById(input)),
    create: publicProcedure
      .input(z.object({
        titulo: z.string().min(1),
        descricao: z.string().min(1),
        data: z.string().min(1),
        horario: z.string().min(1),
        local: z.string().min(1),
        tipo: z.string().min(1),
        requireInscricao: z.number().default(0),
      }))
      .mutation(({ input, ctx }) => {
        return db.createEvento(input);
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          titulo: z.string().optional(),
          descricao: z.string().optional(),
          data: z.string().optional(),
          horario: z.string().optional(),
          local: z.string().optional(),
          tipo: z.string().optional(),
        }),
      }))
      .mutation(({ input, ctx }) => {
        return db.updateEvento(input.id, input.data);
      }),
    delete: publicProcedure.input(z.number()).mutation(({ input, ctx }) => {
      return db.deleteEvento(input);
    }),
  }),

  // Notícias
  noticias: router({
    list: publicProcedure.query(() => db.getNoticias()),
    getById: publicProcedure.input(z.number()).query(({ input }) => db.getNoticiaById(input)),
    create: protectedProcedure
      .input(z.object({
        titulo: z.string().min(1),
        conteudo: z.string().min(1),
        data: z.string().min(1),
        imagemUrl: z.string().optional(),
        destaque: z.number().default(0),
      }))
      .mutation(({ input }) => db.createNoticia(input)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          titulo: z.string().optional(),
          conteudo: z.string().optional(),
          data: z.string().optional(),
          imagemUrl: z.string().optional(),
          destaque: z.number().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateNoticia(input.id, input.data)),
    delete: protectedProcedure.input(z.number()).mutation(({ input }) => db.deleteNoticia(input)),
  }),

  // Aviso Importante
  avisoImportante: router({
    get: publicProcedure.query(() => db.getAvisoImportante()),
    create: protectedProcedure
      .input(z.object({
        titulo: z.string().min(1),
        mensagem: z.string().min(1),
        ativo: z.number().default(1),
        dataExpiracao: z.string().optional(),
      }))
      .mutation(({ input }) => db.createAvisoImportante(input)),
    save: protectedProcedure
      .input(z.object({
        titulo: z.string().min(1),
        mensagem: z.string().min(1),
        ativo: z.number().default(1),
        dataExpiracao: z.string().optional(),
      }))
      .mutation(({ input }) => db.saveAvisoImportante(input)),
    desativar: protectedProcedure.mutation(() => db.desativarAvisoImportante()),
  }),

  // Contatos Igreja
  contatosIgreja: router({
    get: publicProcedure.query(async () => {
      const contatos = await db.getContatosIgreja();
      return contatos?.[0] || null;
    }),
    update: protectedProcedure
      .input(z.object({
        telefone: z.string().min(1),
        whatsapp: z.string().min(1),
        email: z.string().email(),
      }))
      .mutation(({ input }) => db.createContatoIgreja(input)),
  }),

  // Líderes
  lideres: router({
    list: publicProcedure.query(() => db.getLideres()),
    getById: publicProcedure.input(z.number()).query(({ input }) => db.getLiderById(input)),
    getByUserId: publicProcedure.input(z.number()).query(({ input }) => db.getLiderByUserId(input)),
    getByCelula: publicProcedure.input(z.string()).query(({ input }) => db.getLiderByCelula(input)),
    create: publicProcedure
      .input(z.object({
        userId: z.number(),
        nome: z.string().min(1),
        celula: z.string().min(1),
        telefone: z.string().min(1),
        email: z.string().email().optional(),
        ativo: z.number().default(1),
      }))
      .mutation(({ input }) => db.createLider(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nome: z.string().optional(),
          celula: z.string().optional(),
          telefone: z.string().optional(),
          email: z.string().optional(),
          ativo: z.number().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateLider(input.id, input.data)),
    delete: publicProcedure.input(z.number()).mutation(({ input }) => db.deleteLider(input)),
    updatePassword: publicProcedure
      .input(z.object({
        liderId: z.number(),
        senhaAtual: z.string().min(1),
        novaSenha: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        const lider = await db.getLiderById(input.liderId);
        if (!lider) throw new Error('Lider nao encontrado');
        const user = await db.getUserById(lider.userId);
        if (!user) throw new Error('Usuario nao encontrado');
        if (user.passwordHash !== input.senhaAtual) {
          throw new Error('Senha atual incorreta');
        }
        await db.updateUser(user.id, { passwordHash: input.novaSenha });
        return { success: true, message: 'Senha alterada com sucesso' };
      }),
  }),

  // Relatórios
  relatorios: router({
    list: publicProcedure.query(() => db.getRelatorios()),
    getByLiderId: publicProcedure.input(z.number()).query(({ input }) => db.getRelatoriosByLiderId(input)),
    getByLiderIdWithFilters: publicProcedure
      .input(z.object({
        liderId: z.number(),
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
        tipo: z.string().optional(),
        limite: z.number().optional(),
      }))
      .query(({ input }) => db.getRelatoriosByLiderIdWithFilters(input.liderId, {
        dataInicio: input.dataInicio,
        dataFim: input.dataFim,
        tipo: input.tipo,
        limite: input.limite,
      })),
    getByCelula: publicProcedure.input(z.string()).query(({ input }) => db.getRelatoriosByCelula(input)),
    create: publicProcedure
      .input(z.object({
        liderId: z.number(),
        celula: z.string().min(1),
        tipo: z.string().min(1),
        periodo: z.string().min(1),
        presentes: z.number(),
        novosVisitantes: z.number().default(0),
        conversoes: z.number().default(0),
        observacoes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createRelatorio(input)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          presentes: z.number().optional(),
          novosVisitantes: z.number().optional(),
          conversoes: z.number().optional(),
          observacoes: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateRelatorio(input.id, input.data)),
    delete: protectedProcedure.input(z.number()).mutation(({ input }) => db.deleteRelatorio(input)),
  }),

  // Dados de Contribuição
  contribuicao: router({
    get: publicProcedure.query(() => db.getDadosContribuicao()),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          pixKey: z.string().optional(),
          pixType: z.enum(["email", "cpf", "cnpj", "telefone", "aleatoria"]).optional(),
          bank: z.string().optional(),
          agency: z.string().optional(),
          account: z.string().optional(),
          cnpj: z.string().optional(),
          titular: z.string().optional(),
          mensagemMotivacional: z.string().optional(),
          versiculoRef: z.string().optional(),
          mensagemAgradecimento: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateDadosContribuicao(input.id, input.data)),
  }),

  // Inscrições em Eventos
  inscricoesEventos: router({
    list: publicProcedure.query(() => db.getInscricoesEventos()),
    getByEvento: publicProcedure.input(z.number()).query(({ input }) => db.getInscricoesEventosByEventoId(input)),
    create: publicProcedure
      .input(z.object({
        eventoId: z.number(),
        nome: z.string().min(1),
        telefone: z.string().min(1),
        celula: z.string().min(1),
        userId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Usar userId do contexto se disponível, caso contrário usar o fornecido
        const userId = ctx.user?.id || input.userId || 0;
        return db.createInscricaoEvento({
          eventoId: input.eventoId,
          nome: input.nome,
          telefone: input.telefone,
          celula: input.celula,
          userId,
          status: 'confirmado',
        });
      }),
    delete: protectedProcedure.input(z.number()).mutation(({ input }) => db.deleteInscricaoEvento(input)),
  }),
  escolaCrescimento: router({
    list: publicProcedure.query(() => db.getInscricoesEscolaCrescimento()),
    create: publicProcedure
      .input(z.object({
        nome: z.string().min(1),
        celula: z.string().min(1),
        curso: z.enum(["Conecte", "Lidere 1", "Lidere 2", "Avance"]),
        userId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id || input.userId || 0; // Use 0 as default if no userId
        return db.createInscricaoEscolaCrescimento({
          nome: input.nome,
          celula: input.celula,
          curso: input.curso,
          userId,
          status: 'confirmado',
        });
      }),
    delete: protectedProcedure.input(z.number()).mutation(({ input }) => db.deleteInscricaoEscolaCrescimento(input)),
    getConfig: publicProcedure.query(() => db.getConfigEscolaCrescimento()),
    updateConfig: protectedProcedure
      .input(z.object({
        dataInicio: z.string().optional(),
        descricaoConecte: z.string().optional(),
        descricaoLidere1: z.string().optional(),
        descricaoLidere2: z.string().optional(),
        descricaoAvance: z.string().optional(),
      }))
      .mutation(({ input }) => db.updateConfigEscolaCrescimento(input)),
   }),
  
  // Anexos Líderes
  anexosLideres: router({
    list: publicProcedure.query(() => db.getAnexosLideres()),
    getById: publicProcedure.input(z.number()).query(({ input }) => db.getAnexoLiderById(input)),
    create: protectedProcedure
      .input(z.object({
        titulo: z.string().min(1),
        descricao: z.string().optional(),
        arquivoBase64: z.string().min(1),
        nomeArquivo: z.string().min(1),
        tipo: z.string().min(1),
        ativo: z.number().default(1),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const hash = crypto.randomBytes(8).toString('hex');
          const nomeArquivoLocal = `${hash}-${input.nomeArquivo}`;
          const caminhoArquivo = path.join(UPLOAD_DIR, nomeArquivoLocal);
          const buffer = Buffer.from(input.arquivoBase64, 'base64');
          await fs.writeFile(caminhoArquivo, buffer);
          const stats = await fs.stat(caminhoArquivo);
          const arquivoUrl = `/uploads/${nomeArquivoLocal}`;
          return db.createAnexoLider({
            titulo: input.titulo,
            descricao: input.descricao,
            arquivoUrl,
            nomeArquivo: input.nomeArquivo,
            tamanhoArquivo: stats.size,
            tipo: input.tipo,
            ativo: input.ativo,
          });
        } catch (error: any) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Erro ao fazer upload: ${error.message}`,
          });
        }
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        titulo: z.string().optional(),
        descricao: z.string().optional(),
        arquivoUrl: z.string().url().optional(),
        tipo: z.string().optional(),
        ativo: z.number().optional(),
      }))
      .mutation(({ input, ctx }) => {
        return db.updateAnexoLider(input.id, input);
      }),
    delete: protectedProcedure.input(z.number()).mutation(({ input, ctx }) => {
      return db.deleteAnexoLider(input);
    }),
    toggleVisibility: protectedProcedure
      .input(z.object({ id: z.number(), ativo: z.number() }))
      .mutation(({ input, ctx }) => {
        return db.toggleAnexoLiderVisibility(input.id, input.ativo);
      }),
  }),
});
export type AppRouter = typeof appRouter;
