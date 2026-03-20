import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getInscricoesEventosPagas } from "../server/db";

describe("Inscrições Pagas", () => {
  it("deve retornar um array de inscrições", async () => {
    const inscricoes = await getInscricoesEventosPagas();
    expect(Array.isArray(inscricoes)).toBe(true);
  });

  it("cada inscrição deve ter os campos obrigatórios", async () => {
    const inscricoes = await getInscricoesEventosPagas();
    
    if (inscricoes.length > 0) {
      const inscricao = inscricoes[0];
      expect(inscricao).toHaveProperty("id");
      expect(inscricao).toHaveProperty("nome");
      expect(inscricao).toHaveProperty("telefone");
      expect(inscricao).toHaveProperty("statusPagamento");
      expect(inscricao).toHaveProperty("eventoTitulo");
    }
  });

  it("statusPagamento deve ser 'pago' ou 'nao-pago'", async () => {
    const inscricoes = await getInscricoesEventosPagas();
    
    inscricoes.forEach((inscricao: any) => {
      expect(["pago", "nao-pago"]).toContain(inscricao.statusPagamento);
    });
  });
});
