import { describe, it, expect, beforeAll } from "vitest";
import * as db from "../server/db";

describe("Aviso Importante - Sincronização Corrigida", () => {
  beforeAll(async () => {
    console.log("\n=== SETUP: Preparando dados de teste ===");
  });

  it("deve retornar aviso mais recente e ativo", async () => {
    console.log("\n=== TESTE 1: Retornar aviso mais recente ===");
    
    // Criar primeiro aviso
    await db.saveAvisoImportante({
      titulo: "Aviso 1",
      mensagem: "Mensagem 1",
      ativo: 1,
    });
    
    // Criar segundo aviso (deve desativar o primeiro)
    await db.saveAvisoImportante({
      titulo: "Aviso 2",
      mensagem: "Mensagem 2",
      ativo: 1,
    });
    
    // Buscar aviso ativo
    const aviso = await db.getAvisoImportante();
    
    console.log(`✅ Aviso retornado: ${aviso?.titulo}`);
    expect(aviso?.titulo).toBe("Aviso 2");
    expect(aviso?.ativo).toBe(1);
  });

  it("deve desativar avisos antigos ao salvar novo", async () => {
    console.log("\n=== TESTE 2: Desativar avisos antigos ===");
    
    // Buscar todos os avisos
    const avisos = await db.getAvisosImportantes();
    const ativos = avisos.filter((a: any) => a.ativo === 1);
    
    console.log(`✅ Total de avisos: ${avisos.length}`);
    console.log(`✅ Avisos ativos: ${ativos.length}`);
    
    // Deve haver apenas 1 aviso ativo
    expect(ativos.length).toBe(1);
  });

  it("deve retornar null quando não há avisos ativos", async () => {
    console.log("\n=== TESTE 3: Retornar null sem avisos ativos ===");
    
    // Desativar todos
    await db.desativarAvisoImportante();
    
    // Buscar aviso
    const aviso = await db.getAvisoImportante();
    
    console.log(`✅ Aviso quando nenhum ativo: ${aviso}`);
    expect(aviso).toBeNull();
  });
});
