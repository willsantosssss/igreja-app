/**
 * Este arquivo contém exemplos de como adicionar logs em todas as funções do painel admin
 * Copie os padrões abaixo para adicionar logs em suas funções
 */

import { logger } from "./logger";
import { TRPCError } from "@trpc/server";

// ============ EVENTOS ============
export const eventosWithLogs = {
  listEvents: async (db: any) => {
    try {
      logger.info("eventos", "Listando eventos");
      const result = await db.getEventos();
      logger.info("eventos", "Eventos listados com sucesso", { count: result?.length || 0 });
      return result;
    } catch (error: any) {
      logger.error("eventos", "Erro ao listar eventos", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
  },

  createEvent: async (db: any, input: any, userId?: number) => {
    try {
      logger.info("eventos", "Criando novo evento", { titulo: input.titulo, userId });
      const result = await db.createEvento(input);
      logger.info("eventos", "Evento criado com sucesso", { id: result?.id, titulo: input.titulo });
      return result;
    } catch (error: any) {
      logger.error("eventos", "Erro ao criar evento", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
  },

  updateEvent: async (db: any, id: number, data: any, userId?: number) => {
    try {
      logger.info("eventos", "Atualizando evento", { id, userId, fields: Object.keys(data) });
      const result = await db.updateEvento(id, data);
      logger.info("eventos", "Evento atualizado com sucesso", { id });
      return result;
    } catch (error: any) {
      logger.error("eventos", "Erro ao atualizar evento", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
  },

  deleteEvent: async (db: any, id: number, userId?: number) => {
    try {
      logger.info("eventos", "Deletando evento", { id, userId });
      const result = await db.deleteEvento(id);
      logger.info("eventos", "Evento deletado com sucesso", { id });
      return result;
    } catch (error: any) {
      logger.error("eventos", "Erro ao deletar evento", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
  },
};

// ============ CÉLULAS ============
export const celulasWithLogs = {
  listCelulas: async (db: any) => {
    try {
      logger.info("celulas", "Listando células");
      const result = await db.getCelulas();
      logger.info("celulas", "Células listadas com sucesso", { count: result?.length || 0 });
      return result;
    } catch (error: any) {
      logger.error("celulas", "Erro ao listar células", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
  },

  createCelula: async (db: any, input: any, userId?: number) => {
    try {
      logger.info("celulas", "Criando nova célula", { nome: input.nome, lider: input.lider, userId });
      const result = await db.createCelula(input);
      logger.info("celulas", "Célula criada com sucesso", { id: result?.id, nome: input.nome });
      return result;
    } catch (error: any) {
      logger.error("celulas", "Erro ao criar célula", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
  },

  updateCelula: async (db: any, id: number, data: any, userId?: number) => {
    try {
      logger.info("celulas", "Atualizando célula", { id, userId, fields: Object.keys(data) });
      const result = await db.updateCelula(id, data);
      logger.info("celulas", "Célula atualizada com sucesso", { id });
      return result;
    } catch (error: any) {
      logger.error("celulas", "Erro ao atualizar célula", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
  },

  deleteCelula: async (db: any, id: number, userId?: number) => {
    try {
      logger.info("celulas", "Deletando célula", { id, userId });
      const result = await db.deleteCelula(id);
      logger.info("celulas", "Célula deletada com sucesso", { id });
      return result;
    } catch (error: any) {
      logger.error("celulas", "Erro ao deletar célula", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
  },
};

// ============ CONTRIBUIÇÕES ============
export const contribuicoesWithLogs = {
  getDadosContribuicao: async (db: any) => {
    try {
      logger.info("contribuicao", "Obtendo dados de contribuição");
      const result = await db.getDadosContribuicao();
      logger.info("contribuicao", "Dados de contribuição obtidos com sucesso");
      return result;
    } catch (error: any) {
      logger.error("contribuicao", "Erro ao obter dados de contribuição", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
  },

  updateDadosContribuicao: async (db: any, id: number, data: any, userId?: number) => {
    try {
      logger.info("contribuicao", "Atualizando dados de contribuição", { id, userId, fields: Object.keys(data) });
      const result = await db.updateDadosContribuicao(id, data);
      logger.info("contribuicao", "Dados de contribuição atualizados com sucesso", { id });
      return result;
    } catch (error: any) {
      logger.error("contribuicao", "Erro ao atualizar dados de contribuição", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
  },
};

// ============ AVISOS IMPORTANTES ============
export const avisosWithLogs = {
  getAviso: async (db: any) => {
    try {
      logger.info("avisos", "Obtendo aviso importante");
      const result = await db.getAvisoImportante();
      logger.info("avisos", "Aviso importante obtido com sucesso");
      return result;
    } catch (error: any) {
      logger.error("avisos", "Erro ao obter aviso importante", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
  },

  saveAviso: async (db: any, input: any, userId?: number) => {
    try {
      logger.info("avisos", "Salvando aviso importante", { titulo: input.titulo, userId });
      const result = await db.saveAvisoImportante(input);
      logger.info("avisos", "Aviso importante salvo com sucesso", { titulo: input.titulo });
      return result;
    } catch (error: any) {
      logger.error("avisos", "Erro ao salvar aviso importante", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
  },

  desativarAviso: async (db: any, userId?: number) => {
    try {
      logger.info("avisos", "Desativando aviso importante", { userId });
      const result = await db.desativarAvisoImportante();
      logger.info("avisos", "Aviso importante desativado com sucesso");
      return result;
    } catch (error: any) {
      logger.error("avisos", "Erro ao desativar aviso importante", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
  },
};

// ============ CONTATOS IGREJA ============
export const contatosWithLogs = {
  getContatos: async (db: any) => {
    try {
      logger.info("contatos", "Obtendo contatos da igreja");
      const contatos = await db.getContatosIgreja();
      logger.info("contatos", "Contatos da igreja obtidos com sucesso");
      return contatos?.[0] || null;
    } catch (error: any) {
      logger.error("contatos", "Erro ao obter contatos da igreja", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
  },

  updateContatos: async (db: any, input: any, userId?: number) => {
    try {
      logger.info("contatos", "Atualizando contatos da igreja", { userId, fields: Object.keys(input) });
      const result = await db.createContatoIgreja(input);
      logger.info("contatos", "Contatos da igreja atualizados com sucesso");
      return result;
    } catch (error: any) {
      logger.error("contatos", "Erro ao atualizar contatos da igreja", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
  },
};

// ============ ANEXOS ============
export const anexosWithLogs = {
  listAnexos: async (db: any) => {
    try {
      logger.info("anexos", "Listando anexos");
      const result = await db.getAnexos();
      logger.info("anexos", "Anexos listados com sucesso", { count: result?.length || 0 });
      return result;
    } catch (error: any) {
      logger.error("anexos", "Erro ao listar anexos", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
  },

  createAnexo: async (db: any, input: any, userId?: number) => {
    try {
      logger.info("anexos", "Criando novo anexo", { nomeArquivo: input.nomeArquivo, userId });
      const result = await db.createAnexo(input);
      logger.info("anexos", "Anexo criado com sucesso", { id: result?.id, nomeArquivo: input.nomeArquivo });
      return result;
    } catch (error: any) {
      logger.error("anexos", "Erro ao criar anexo", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
  },

  updateAnexo: async (db: any, id: number, data: any, userId?: number) => {
    try {
      logger.info("anexos", "Atualizando anexo", { id, userId, fields: Object.keys(data) });
      const result = await db.updateAnexo(id, data);
      logger.info("anexos", "Anexo atualizado com sucesso", { id });
      return result;
    } catch (error: any) {
      logger.error("anexos", "Erro ao atualizar anexo", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
  },

  deleteAnexo: async (db: any, id: number, userId?: number) => {
    try {
      logger.info("anexos", "Deletando anexo", { id, userId });
      const result = await db.deleteAnexo(id);
      logger.info("anexos", "Anexo deletado com sucesso", { id });
      return result;
    } catch (error: any) {
      logger.error("anexos", "Erro ao deletar anexo", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
  },
};
