/**
 * Schemas de validação com Zod
 * Centralize todas as validações de entrada aqui
 */

import { z } from 'zod';

// ============================================================================
// ESCOLA DE CRESCIMENTO
// ============================================================================

export const inscricaoEscolaCrescimentoSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome não pode ter mais de 255 caracteres')
    .trim(),
  celula: z
    .string()
    .min(1, 'Célula é obrigatória')
    .max(255, 'Célula não pode ter mais de 255 caracteres')
    .trim(),
  curso: z
    .enum(['Conecte', 'Lidere 1', 'Lidere 2', 'Avance'], {
      errorMap: () => ({ message: 'Curso inválido. Escolha entre: Conecte, Lidere 1, Lidere 2, Avance' })
    }),
  userId: z.number().optional(),
});

export type InscricaoEscolaCrescimento = z.infer<typeof inscricaoEscolaCrescimentoSchema>;

// ============================================================================
// EVENTOS
// ============================================================================

export const criarEventoSchema = z.object({
  titulo: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(255, 'Título não pode ter mais de 255 caracteres')
    .trim(),
  descricao: z
    .string()
    .max(2000, 'Descrição não pode ter mais de 2000 caracteres')
    .optional()
    .default(''),
  data: z
    .string()
    .min(1, 'Data é obrigatória')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  horario: z
    .string()
    .min(1, 'Horário é obrigatório')
    .regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM'),
  local: z
    .string()
    .min(1, 'Local é obrigatório')
    .max(255, 'Local não pode ter mais de 255 caracteres')
    .trim(),
  tipo: z
    .string()
    .min(1, 'Tipo é obrigatório')
    .max(100, 'Tipo não pode ter mais de 100 caracteres')
    .trim(),
  requireInscricao: z.number().default(0),
});

export type CriarEvento = z.infer<typeof criarEventoSchema>;

// ============================================================================
// AUTENTICAÇÃO
// ============================================================================

export const signupSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email não pode ter mais de 255 caracteres')
    .toLowerCase(),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(128, 'Senha não pode ter mais de 128 caracteres'),
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome não pode ter mais de 255 caracteres')
    .trim(),
});

export type Signup = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'Senha é obrigatória'),
});

export type Login = z.infer<typeof loginSchema>;

// ============================================================================
// CÉLULAS
// ============================================================================

export const criarCelulaSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome não pode ter mais de 255 caracteres')
    .trim(),
  lider: z
    .string()
    .min(1, 'Líder é obrigatório')
    .max(255, 'Líder não pode ter mais de 255 caracteres')
    .trim(),
  dia: z
    .string()
    .min(1, 'Dia é obrigatório')
    .max(50, 'Dia não pode ter mais de 50 caracteres')
    .trim(),
  horario: z
    .string()
    .min(1, 'Horário é obrigatório')
    .regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM'),
  local: z
    .string()
    .min(1, 'Local é obrigatório')
    .max(255, 'Local não pode ter mais de 255 caracteres')
    .trim(),
});

export type CriarCelula = z.infer<typeof criarCelulaSchema>;

// ============================================================================
// NOTÍCIAS
// ============================================================================

export const criarNoticiaSchema = z.object({
  titulo: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(255, 'Título não pode ter mais de 255 caracteres')
    .trim(),
  conteudo: z
    .string()
    .min(1, 'Conteúdo é obrigatório')
    .max(10000, 'Conteúdo não pode ter mais de 10000 caracteres'),
  data: z
    .string()
    .min(1, 'Data é obrigatória')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  imagemUrl: z
    .string()
    .url('URL da imagem inválida')
    .optional(),
  destaque: z.number().default(0),
});

export type CriarNoticia = z.infer<typeof criarNoticiaSchema>;

// ============================================================================
// HELPER: Validar e retornar erros formatados
// ============================================================================

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Formatar erros do Zod
  const errors: Record<string, string> = {};
  result.error.errors.forEach((error) => {
    const path = error.path.join('.');
    errors[path] = error.message;
  });
  
  return { success: false, errors };
}
