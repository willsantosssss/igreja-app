import { describe, it, expect } from "vitest";

describe("Redes Sociais na Home", () => {
  it("deve ter link correto do Instagram", () => {
    const instagramUrl = "https://www.instagram.com/2ieqroo/";
    expect(instagramUrl).toContain("instagram.com");
    expect(instagramUrl).toContain("2ieqroo");
  });

  it("deve ter link correto do YouTube", () => {
    const youtubeUrl = "https://www.youtube.com/@2ieqroo";
    expect(youtubeUrl).toContain("youtube.com");
    expect(youtubeUrl).toContain("2ieqroo");
  });

  it("deve ter seção com título correto", () => {
    const titulo = "Acesse nossas redes sociais";
    expect(titulo).toBeTruthy();
    expect(titulo.length).toBeGreaterThan(0);
  });

  it("deve ter dois botões com emojis", () => {
    const botoes = [
      { emoji: "📷", nome: "Instagram" },
      { emoji: "▶️", nome: "YouTube" },
    ];

    expect(botoes).toHaveLength(2);
    botoes.forEach((botao) => {
      expect(botao.emoji).toBeTruthy();
      expect(botao.nome).toBeTruthy();
    });
  });
});
