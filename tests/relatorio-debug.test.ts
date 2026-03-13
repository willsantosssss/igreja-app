import { describe, it, expect, beforeAll } from "vitest";
import * as db from "../server/db";

describe("Relatório Debug - Fluxo Completo", () => {
  beforeAll(() => {
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = "mysql://root:password@localhost:3306/igreja";
    }
  });

  it("should list all lideres in database", async () => {
    try {
      const lideres = await db.getLideres();
      console.log("\n=== LÍDERES NO BANCO ===");
      console.log(`Total de líderes: ${lideres.length}`);
      
      lideres.forEach((lider, index) => {
        console.log(`\n[${index + 1}] Líder:`);
        console.log(`  ID: ${lider.id} (tipo: ${typeof lider.id})`);
        console.log(`  Nome: ${lider.nome}`);
        console.log(`  Célula: ${lider.celula}`);
        console.log(`  UserId: ${lider.userId}`);
      });
      
      expect(lideres.length).toBeGreaterThan(0);
    } catch (error) {
      console.error("Erro ao listar líderes:", error);
      throw error;
    }
  });

  it("should create a test relatorio with first lider", async () => {
    try {
      const lideres = await db.getLideres();
      
      if (lideres.length === 0) {
        console.log("⏭️  Nenhum líder encontrado, pulando teste");
        return;
      }
      
      const primeiroLider = lideres[0];
      console.log("\n=== CRIANDO RELATÓRIO ===");
      console.log(`Usando líder: ${primeiroLider.nome} (ID: ${primeiroLider.id})`);
      
      const relatorioId = await db.createRelatorio({
        liderId: primeiroLider.id,
        celula: primeiroLider.celula,
        tipo: "semanal",
        periodo: "2026-02-19",
        presentes: 25,
        novosVisitantes: 3,
        conversoes: 1,
        observacoes: "Teste de debug",
      });
      
      console.log(`✅ Relatório criado com ID: ${relatorioId}`);
      expect(relatorioId).toBeGreaterThan(0);
      
      // Verificar se foi salvo
      const relatorios = await db.getRelatorios();
      const criado = relatorios.find(r => (r as any).id === relatorioId);
      
      console.log(`\n=== VERIFICAÇÃO ===`);
      console.log(`Relatório encontrado: ${criado ? "SIM" : "NÃO"}`);
      
      if (criado) {
        console.log(`  ID: ${criado.id}`);
        console.log(`  LiderId: ${criado.liderId}`);
        console.log(`  Célula: ${criado.celula}`);
        console.log(`  Presentes: ${criado.presentes}`);
      }
      
      expect(criado).toBeDefined();
    } catch (error) {
      console.error("\n❌ Erro ao criar relatório:", error);
      if (error instanceof Error) {
        console.error("Mensagem:", error.message);
        console.error("Stack:", error.stack);
      }
      throw error;
    }
  });

  it("should test with different liderIds", async () => {
    try {
      console.log("\n=== TESTANDO DIFERENTES LIDERIDS ===");
      
      const testIds = [1, 2, 3, 42, 999];
      
      for (const testId of testIds) {
        try {
          console.log(`\nTestando liderId: ${testId}`);
          
          const relatorioId = await db.createRelatorio({
            liderId: testId,
            celula: "Célula Teste",
            tipo: "semanal",
            periodo: "2026-02-19",
            presentes: 10,
            novosVisitantes: 1,
            conversoes: 0,
            observacoes: `Teste com ID ${testId}`,
          });
          
          console.log(`  ✅ Sucesso! Relatório ID: ${relatorioId}`);
        } catch (error) {
          console.log(`  ❌ Erro: ${error instanceof Error ? error.message : "Desconhecido"}`);
        }
      }
    } catch (error) {
      console.error("Erro geral:", error);
    }
  });
});
