import { describe, it, expect } from "vitest";
import * as db from "../server/db";

describe("Histórico de Relatórios - Filtros e Busca", () => {
  it("should create multiple relatorios for testing filters", async () => {
    try {
      console.log("\n=== CRIANDO RELATÓRIOS PARA TESTE ===");
      
      // Criar 5 relatórios em datas diferentes
      const hoje = new Date();
      const datas = [
        new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
        new Date(hoje.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 dias atrás
        new Date(hoje.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 dias atrás
        new Date(hoje.getTime() - 5 * 24 * 60 * 60 * 1000),  // 5 dias atrás
        hoje, // hoje
      ];

      for (let i = 0; i < datas.length; i++) {
        const data = datas[i].toISOString().split('T')[0];
        await db.createRelatorio({
          liderId: 1,
          celula: "Célula Teste Histórico",
          tipo: "Reunião",
          periodo: data,
          presentes: 15 + i * 2,
          novosVisitantes: 2 + i,
          conversoes: i,
          observacoes: `Relatório de teste ${i + 1}`,
        });
        console.log(`✅ Relatório ${i + 1} criado: ${data}`);
      }

      console.log("\n✅ 5 relatórios criados com sucesso");
    } catch (error) {
      console.error("❌ Erro:", error);
      throw error;
    }
  });

  it("should fetch all relatorios without filters", async () => {
    try {
      console.log("\n=== BUSCANDO TODOS OS RELATÓRIOS ===");
      
      const relatorios = await db.getRelatoriosByLiderIdWithFilters(1);
      
      console.log(`Total de relatórios: ${relatorios.length}`);
      relatorios.forEach((r: any, i) => {
        console.log(`[${i + 1}] ${r.periodo} - ${r.presentes} presentes, ${r.novosVisitantes} visitantes`);
      });
      
      expect(relatorios.length).toBeGreaterThanOrEqual(5);
    } catch (error) {
      console.error("Erro:", error);
      throw error;
    }
  });

  it("should filter relatorios by date range (last 15 days)", async () => {
    try {
      console.log("\n=== FILTRANDO ÚLTIMOS 15 DIAS ===");
      
      const hoje = new Date();
      const quinzeDiasAtras = new Date(hoje.getTime() - 15 * 24 * 60 * 60 * 1000);
      
      const dataInicio = quinzeDiasAtras.toISOString().split('T')[0];
      const dataFim = hoje.toISOString().split('T')[0];
      
      console.log(`Período: ${dataInicio} a ${dataFim}`);
      
      const relatorios = await db.getRelatoriosByLiderIdWithFilters(1, {
        dataInicio,
        dataFim,
      });
      
      console.log(`Relatórios encontrados: ${relatorios.length}`);
      relatorios.forEach((r: any, i) => {
        console.log(`[${i + 1}] ${r.periodo} - ${r.presentes} presentes`);
      });
      
      expect(relatorios.length).toBeGreaterThan(0);
      relatorios.forEach((r: any) => {
        const data = new Date(r.periodo);
        expect(data.getTime()).toBeGreaterThanOrEqual(quinzeDiasAtras.getTime());
        expect(data.getTime()).toBeLessThanOrEqual(hoje.getTime());
      });
    } catch (error) {
      console.error("Erro:", error);
      throw error;
    }
  });

  it("should filter relatorios by type", async () => {
    try {
      console.log("\n=== FILTRANDO POR TIPO ===");
      
      const relatorios = await db.getRelatoriosByLiderIdWithFilters(1, {
        tipo: "Reunião",
      });
      
      console.log(`Relatórios do tipo "Reunião": ${relatorios.length}`);
      relatorios.forEach((r: any, i) => {
        console.log(`[${i + 1}] ${r.periodo} - Tipo: ${r.tipo}`);
      });
      
      expect(relatorios.length).toBeGreaterThan(0);
      relatorios.forEach((r: any) => {
        expect(r.tipo).toBe("Reunião");
      });
    } catch (error) {
      console.error("Erro:", error);
      throw error;
    }
  });

  it("should calculate statistics from relatorios", async () => {
    try {
      console.log("\n=== CALCULANDO ESTATÍSTICAS ===");
      
      const relatorios = await db.getRelatoriosByLiderIdWithFilters(1);
      
      if (relatorios.length === 0) {
        console.log("Nenhum relatório encontrado");
        return;
      }

      const totalPresentes = relatorios.reduce((acc: number, r: any) => acc + r.presentes, 0);
      const totalVisitantes = relatorios.reduce((acc: number, r: any) => acc + r.novosVisitantes, 0);
      const totalConversoes = relatorios.reduce((acc: number, r: any) => acc + r.conversoes, 0);
      
      const mediaPresentes = Math.round(totalPresentes / relatorios.length);
      const mediaVisitantes = Math.round(totalVisitantes / relatorios.length);
      
      console.log(`Total de relatórios: ${relatorios.length}`);
      console.log(`Total de presentes: ${totalPresentes}`);
      console.log(`Média de presentes: ${mediaPresentes}`);
      console.log(`Total de visitantes: ${totalVisitantes}`);
      console.log(`Média de visitantes: ${mediaVisitantes}`);
      console.log(`Total de conversões: ${totalConversoes}`);
      
      expect(mediaPresentes).toBeGreaterThan(0);
      expect(mediaVisitantes).toBeGreaterThanOrEqual(0);
    } catch (error) {
      console.error("Erro:", error);
      throw error;
    }
  });

  it("should order relatorios by date descending", async () => {
    try {
      console.log("\n=== VERIFICANDO ORDENAÇÃO POR DATA ===");
      
      const relatorios = await db.getRelatoriosByLiderIdWithFilters(1);
      
      console.log("Relatórios ordenados por data (mais recente primeiro):");
      relatorios.forEach((r: any, i) => {
        console.log(`[${i + 1}] ${r.periodo}`);
      });
      
      // Verificar se está ordenado por data descendente
      for (let i = 0; i < relatorios.length - 1; i++) {
        const data1 = new Date(relatorios[i].periodo).getTime();
        const data2 = new Date(relatorios[i + 1].periodo).getTime();
        expect(data1).toBeGreaterThanOrEqual(data2);
      }
      
      console.log("✅ Ordenação verificada com sucesso");
    } catch (error) {
      console.error("Erro:", error);
      throw error;
    }
  });

  it("should limit results", async () => {
    try {
      console.log("\n=== TESTANDO LIMITE DE RESULTADOS ===");
      
      const relatorios = await db.getRelatoriosByLiderIdWithFilters(1, {
        limite: 3,
      });
      
      console.log(`Limite de 3 resultados: ${relatorios.length} encontrados`);
      
      expect(relatorios.length).toBeLessThanOrEqual(3);
    } catch (error) {
      console.error("Erro:", error);
      throw error;
    }
  });
});
