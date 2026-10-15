import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Home — identidade visual 2IEQROO", () => {
  const source = readFileSync(resolve(process.cwd(), "app/(tabs)/index.tsx"), "utf8");

  it("usa a logo oficial e fundo preto", () => {
    expect(source).toContain("logo-2ieq.png");
    expect(source).toContain('backgroundColor: "#000000"');
  });

  it("mantém os cards aprovados com ações de navegação", () => {
    for (const title of ["Devocional do Dia", "Próximo Evento", "Notícias", "Células", "Aniversariantes", "Oração", "Contribuir"]) {
      expect(source).toContain(`title=\"${title}\"`);
    }
    expect(source).toContain('router.push("/devocional")');
    expect(source).toContain('router.push("/agenda")');
    expect(source).toContain('router.push("/oracao")');
  });

  it("não reintroduz os títulos de agrupamento removidos", () => {
    expect(source).not.toContain("Acesso da Igreja");
    expect(source).not.toContain("Vida Espiritual");
    expect(source).not.toContain("Comunidade");
  });
});
