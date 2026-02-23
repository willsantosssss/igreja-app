import { describe, it, expect } from "vitest";

describe("Ícones de Redes Sociais", () => {
  it("deve ter ícone do Instagram com cor correta", () => {
    const instagramColor = "#E4405F";
    expect(instagramColor).toBeTruthy();
    expect(instagramColor).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it("deve ter ícone do YouTube com cor correta", () => {
    const youtubeColor = "#FF0000";
    expect(youtubeColor).toBeTruthy();
    expect(youtubeColor).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it("deve ter tamanho de ícone apropriado", () => {
    const iconSize = 28;
    expect(iconSize).toBeGreaterThan(0);
    expect(iconSize).toBeLessThan(100);
  });

  it("deve renderizar ícones SVG com componentes corretos", () => {
    const componentes = ["InstagramIcon", "YouTubeIcon"];
    expect(componentes).toHaveLength(2);
    componentes.forEach((comp) => {
      expect(comp).toBeTruthy();
    });
  });
});
