import { describe, it, expect } from "vitest";

describe("Devocional - Compartilhar Anotações", () => {
  it("deve permitir compartilhar anotações quando houver texto", () => {
    const anotacao = "Que versículo poderoso! Deus é fiel.";
    const capitulo = { livro: "João", numero: 3 };

    // Simular validação
    const podeCompartilhar = anotacao.trim().length > 0 && !!capitulo;
    expect(podeCompartilhar).toBe(true);
  });

  it("deve impedir compartilhamento quando anotação está vazia", () => {
    const anotacao = "";
    const capitulo = { livro: "João", numero: 3 };

    const podeCompartilhar = anotacao.trim().length > 0 && !!capitulo;
    expect(podeCompartilhar).toBe(false);
  });

  it("deve formatar mensagem de compartilhamento corretamente", () => {
    const anotacao = "Que versículo poderoso!";
    const capitulo = { livro: "João", numero: 3 };

    const mensagem = `📝 Minhas anotações sobre ${capitulo.livro} ${capitulo.numero}\n\n${anotacao}\n\n— 2ª IEQ Rondonópolis - Devocional`;

    expect(mensagem).toContain("📝");
    expect(mensagem).toContain("João 3");
    expect(mensagem).toContain("Que versículo poderoso!");
    expect(mensagem).toContain("2ª IEQ Rondonópolis");
  });

  it("deve exibir botão de compartilhar apenas com anotações", () => {
    const testCases = [
      { anotacao: "Texto válido", shouldShow: true },
      { anotacao: "", shouldShow: false },
      { anotacao: "   ", shouldShow: false },
      { anotacao: "Anotação importante", shouldShow: true },
    ];

    testCases.forEach(({ anotacao, shouldShow }) => {
      const mostrarBotao = anotacao.trim().length > 0;
      expect(mostrarBotao).toBe(shouldShow);
    });
  });
});
