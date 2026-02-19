import { describe, it, expect } from "vitest";
import { 
  getUsuariosCadastrados, 
  getCelulas,
  getEventos,
  getNoticias,
  getPedidosOracao,
  getAvisoImportante,
  getLideres,
  getRelatorios,
  getDadosContribuicao
} from "../server/db";

describe("Admin Endpoints", () => {
  it("should fetch usuarios list", async () => {
    const usuarios = await getUsuariosCadastrados();
    expect(Array.isArray(usuarios)).toBe(true);
    console.log("[Test] ✅ usuarios.list endpoint works");
  });

  it("should fetch celulas list", async () => {
    const celulas = await getCelulas();
    expect(Array.isArray(celulas)).toBe(true);
    console.log("[Test] ✅ celulas.list endpoint works");
  });

  it("should fetch eventos list", async () => {
    const eventos = await getEventos();
    expect(Array.isArray(eventos)).toBe(true);
    console.log("[Test] ✅ eventos.list endpoint works");
  });

  it("should fetch noticias list", async () => {
    const noticias = await getNoticias();
    expect(Array.isArray(noticias)).toBe(true);
    console.log("[Test] ✅ noticias.list endpoint works");
  });

  it("should fetch pedidos de oracao list", async () => {
    const pedidos = await getPedidosOracao();
    expect(Array.isArray(pedidos)).toBe(true);
    console.log("[Test] ✅ oracao.list endpoint works");
  });

  it("should fetch aviso importante", async () => {
    const aviso = await getAvisoImportante();
    // Can be null or an object
    expect(aviso === null || typeof aviso === "object").toBe(true);
    console.log("[Test] ✅ avisoImportante.get endpoint works");
  });

  it("should fetch lideres list", async () => {
    const lideres = await getLideres();
    expect(Array.isArray(lideres)).toBe(true);
    console.log("[Test] ✅ lideres.list endpoint works");
  });

  it("should fetch relatorios list", async () => {
    const relatorios = await getRelatorios();
    expect(Array.isArray(relatorios)).toBe(true);
    console.log("[Test] ✅ relatorios.list endpoint works");
  });

  it("should fetch contribuicao data", async () => {
    const contribuicao = await getDadosContribuicao();
    // Can be null or an object
    expect(contribuicao === null || typeof contribuicao === "object").toBe(true);
    console.log("[Test] ✅ contribuicao.get endpoint works");
  });

  it("should have all admin endpoints available", async () => {
    const results = {
      usuarios: await getUsuariosCadastrados(),
      celulas: await getCelulas(),
      eventos: await getEventos(),
      noticias: await getNoticias(),
      pedidos: await getPedidosOracao(),
      aviso: await getAvisoImportante(),
      lideres: await getLideres(),
      relatorios: await getRelatorios(),
      contribuicao: await getDadosContribuicao(),
    };

    Object.entries(results).forEach(([name, data]) => {
      expect(data !== undefined).toBe(true);
      console.log(`[Test] ✅ ${name} endpoint is available`);
    });

    console.log("[Test] ✅ All admin endpoints are working!");
  });
});
