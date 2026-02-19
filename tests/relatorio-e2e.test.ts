import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createRelatorio, getRelatorios, getRelatoriosByLiderId, deleteRelatorio } from "../server/db";

describe("Relatório E2E - Envio e Recuperação", () => {
  let reportId: number;
  const liderId = 1;
  const celula = "Célula Centro";

  beforeAll(() => {
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = "mysql://root:password@localhost:3306/igreja";
    }
  });

  it("should create a relatorio with all required fields", async () => {
    const data = {
      liderId,
      celula,
      tipo: "semanal",
      periodo: "2026-02-19",
      presentes: 20,
      novosVisitantes: 3,
      conversoes: 1,
      observacoes: "Reunião com oração especial",
    };

    try {
      reportId = await createRelatorio(data);
      expect(reportId).toBeGreaterThan(0);
      console.log("✅ Relatório criado com ID:", reportId);
    } catch (error) {
      console.error("❌ Erro ao criar relatório:", error);
      throw error;
    }
  });

  it("should retrieve relatorio by ID from database", async () => {
    if (reportId === 0) {
      console.log("⏭️  Pulando teste - relatório não foi criado");
      return;
    }

    try {
      const relatorios = await getRelatorios();
      const found = relatorios.find((r) => r.id === reportId);
      
      expect(found).toBeDefined();
      expect(found?.liderId).toBe(liderId);
      expect(found?.celula).toBe(celula);
      expect(found?.presentes).toBe(20);
      expect(found?.novosVisitantes).toBe(3);
      expect(found?.conversoes).toBe(1);
      expect(found?.observacoes).toBe("Reunião com oração especial");
      
      console.log("✅ Relatório recuperado com sucesso");
    } catch (error) {
      console.error("❌ Erro ao recuperar relatório:", error);
      throw error;
    }
  });

  it("should retrieve relatorios by liderId", async () => {
    try {
      const relatorios = await getRelatoriosByLiderId(liderId);
      expect(relatorios).toBeDefined();
      expect(Array.isArray(relatorios)).toBe(true);
      
      if (reportId > 0) {
        const found = relatorios.find((r) => r.id === reportId);
        expect(found).toBeDefined();
      }
      
      console.log(`✅ Recuperados ${relatorios.length} relatórios do líder ${liderId}`);
    } catch (error) {
      console.error("❌ Erro ao recuperar relatórios por liderId:", error);
      throw error;
    }
  });

  it("should handle optional observacoes field", async () => {
    const data = {
      liderId,
      celula,
      tipo: "semanal",
      periodo: "2026-02-19",
      presentes: 15,
      novosVisitantes: 1,
      conversoes: 0,
      observacoes: undefined as any,
    };

    try {
      const id = await createRelatorio(data);
      expect(id).toBeGreaterThan(0);
      
      const relatorios = await getRelatorios();
      const found = relatorios.find((r) => r.id === id);
      expect(found).toBeDefined();
      expect(found?.observacoes).toBeNull();
      
      console.log("✅ Relatório com observacoes=undefined criado com sucesso");
      
      // Cleanup
      await deleteRelatorio(id);
    } catch (error) {
      console.error("❌ Erro ao criar relatório com observacoes=undefined:", error);
      throw error;
    }
  });

  afterAll(async () => {
    if (reportId > 0) {
      try {
        await deleteRelatorio(reportId);
        console.log("🧹 Limpeza: Relatório deletado");
      } catch (error) {
        console.warn("⚠️  Não foi possível deletar relatório:", error);
      }
    }
  });
});
