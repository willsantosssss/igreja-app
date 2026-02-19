import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

const COOKIE_NAME = "session";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Celulas
  celulas: router({
    list: publicProcedure.query(() => db.getCelulas()),
    getById: publicProcedure.input(z.number()).query(({ input }) => db.getCelulaById(input)),
    create: protectedProcedure
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
    update: protectedProcedure
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
    delete: protectedProcedure
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
    list: publicProcedure.query(() => db.getUsuariosCadastrados()),
    getByUserId: protectedProcedure.query(({ ctx }) => db.getUsuarioCadastradoByUserId(ctx.user.id)),
    getAniversariantes: publicProcedure
      .input(z.number())
      .query(({ input }) => db.getAniversariantesMes(input)),
    getMembrosPorCelula: publicProcedure
      .input(z.string())
      .query(({ input }) => db.getMembrosPorCelula(input)),
    create: protectedProcedure
      .input(z.object({
        nome: z.string().min(1),
        dataNascimento: z.string().min(1),
        celula: z.string().min(1),
      }))
      .mutation(({ ctx, input }) => db.createUsuarioCadastrado({ ...input, userId: ctx.user.id })),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nome: z.string().optional(),
          dataNascimento: z.string().optional(),
          celula: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateUsuarioCadastrado(input.id, input.data)),
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
    create: protectedProcedure
      .input(z.object({
        titulo: z.string().min(1),
        descricao: z.string().min(1),
        data: z.string().min(1),
        horario: z.string().min(1),
        local: z.string().min(1),
        tipo: z.string().min(1),
        requireInscricao: z.number().default(0),
      }))
      .mutation(({ input }) => db.createEvento(input)),
    update: protectedProcedure
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
      .mutation(({ input }) => db.updateEvento(input.id, input.data)),
    delete: protectedProcedure.input(z.number()).mutation(({ input }) => db.deleteEvento(input)),
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
    desativar: protectedProcedure.mutation(() => db.desativarAvisoImportante()),
  }),

  // Contatos Igreja
  contatosIgreja: router({
    get: publicProcedure.query(() => db.getContatosIgreja()),
    update: protectedProcedure
      .input(z.object({
        telefone: z.string().min(1),
        whatsapp: z.string().min(1),
        email: z.string().email(),
      }))
      .mutation(({ input }) => db.updateContatosIgreja(input)),
  }),
});

export type AppRouter = typeof appRouter;
