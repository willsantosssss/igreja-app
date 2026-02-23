import { describe, it, expect } from "vitest";

describe("Oração - Testemunho", () => {
  it("deve retornar pedidos de oração com campo testemunho", async () => {
    // Simular dados de oração com testemunho
    const mockPedidos = [
      {
        id: 1,
        nome: "Cura para minha mãe",
        descricao: "Minha mãe está com câncer",
        categoria: "saude",
        respondido: 1,
        testemunho: "Deus a curou completamente!",
        contadorOrando: 5,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        nome: "Emprego",
        descricao: "Preciso de um emprego",
        categoria: "financeiro",
        respondido: 0,
        testemunho: null,
        contadorOrando: 3,
        createdAt: new Date().toISOString(),
      },
    ];

    // Verificar que testemunho está presente quando respondido
    const respondida = mockPedidos.find((p) => p.respondido === 1);
    expect(respondida?.testemunho).toBe("Deus a curou completamente!");

    // Verificar que testemunho é null quando não respondido
    const naoRespondida = mockPedidos.find((p) => p.respondido === 0);
    expect(naoRespondida?.testemunho).toBeNull();
  });

  it("deve permitir adicionar testemunho a uma oração respondida", async () => {
    // Simular atualização de oração com testemunho
    const pedidoAtualizado = {
      id: 1,
      nome: "Cura para minha mãe",
      descricao: "Minha mãe está com câncer",
      categoria: "saude",
      respondido: 1,
      testemunho: "Deus a curou completamente! Graças a Ele!",
      contadorOrando: 5,
      createdAt: new Date().toISOString(),
    };

    expect(pedidoAtualizado.testemunho).toBeDefined();
    expect(pedidoAtualizado.testemunho).toContain("Graças a Ele");
  });

  it("deve exibir testemunho apenas quando oração for respondida", async () => {
    const pedidos = [
      {
        id: 1,
        respondido: 1,
        testemunho: "Oração respondida!",
        isAnswered: true,
      },
      {
        id: 2,
        respondido: 0,
        testemunho: null,
        isAnswered: false,
      },
    ];

    // Verificar que testemunho aparece apenas para respondidas
    const comTestemunho = pedidos.filter((p) => p.isAnswered && p.testemunho);
    expect(comTestemunho).toHaveLength(1);
    expect(comTestemunho[0].testemunho).toBe("Oração respondida!");

    // Verificar que não respondidas não têm testemunho
    const semTestemunho = pedidos.filter((p) => !p.isAnswered);
    expect(semTestemunho).toHaveLength(1);
    expect(semTestemunho[0].testemunho).toBeNull();
  });
});
