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
        }),
      }))
      .mutation(({ input }) => db.updatePedidoOracao(input.id, input.data)),
    delete: protectedProcedure
      .input(z.number())
      .mutation(({ input }) => db.deletePedidoOracao(input)),
  }),
});

export type AppRouter = typeof appRouter;
