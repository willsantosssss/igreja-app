import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createRelatorio, getRelatorios, deleteRelatorio } from "../server/db";

describe("createRelatorio with SQL", () => {
  let reportId: number;

  beforeAll(() => {
    // Ensure DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = "mysql://root:password@localhost:3306/igreja";
    }
  });

  it("should create a relatorio with SQL query", async () => {
    const data = {
      liderId: 1,
      celula: "Célula Centro",
      tipo: "semanal",
      periodo: "2026-02-19",
      presentes: 15,
      novosVisitantes: 2,
      conversoes: 1,
      observacoes: "Reunião produtiva",
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

  it("should verify relatorio was created in database", async () => {
    if (reportId === 0) {
      console.log("⏭️  Pulando teste - relatório não foi criado");
      return;
    }

    try {
      const relatorios = await getRelatorios();
      const created = relatorios.find((r) => r.id === reportId);
      expect(created).toBeDefined();
      expect(created?.presentes).toBe(15);
      expect(created?.novosVisitantes).toBe(2);
      console.log("✅ Relatório verificado no banco de dados");
    } catch (error) {
      console.error("❌ Erro ao verificar relatório:", error);
      throw error;
    }
  });

  it("should handle null observacoes", async () => {
    const data = {
      liderId: 1,
      celula: "Célula Centro",
      tipo: "semanal",
      periodo: "2026-02-19",
      presentes: 10,
      novosVisitantes: 0,
      conversoes: 0,
      observacoes: null as any,
    };

    try {
      const id = await createRelatorio(data);
      expect(id).toBeGreaterThan(0);
      console.log("✅ Relatório com observacoes=null criado com ID:", id);
    } catch (error) {
      console.error("❌ Erro ao criar relatório com observacoes=null:", error);
      throw error;
    }
  });

  afterAll(async () => {
    // Cleanup - delete created reports
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
