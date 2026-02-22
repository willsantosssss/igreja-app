import { describe, it, expect, beforeAll } from "vitest";
import * as db from "../server/db";

describe("Histórico de Relatórios - Teste Completo", () => {
  let liderId: number;

  beforeAll(async () => {
    console.log("\n=== SETUP: Criando dados de teste ===");
    
    // Criar líder
    const lider = await db.createLider({
      nome: "Pr. Teste Histórico",
      celula: "Célula Teste Histórico",
      telefone: "64999999999",
      email: "teste@historico.com",
      ativo: 1,
      userId: 0,
    });
    
    liderId = lider.id;
    console.log(`✅ Líder criado: ID ${liderId}`);

    // Criar 10 relatórios com datas variadas
    for (let i = 0; i < 10; i++) {
      const dataAtras = new Date();
      dataAtras.setDate(dataAtras.getDate() - i * 7); // Cada um com 7 dias de diferença
      
      const periodo = dataAtras.toISOString().split('T')[0];
      
      await db.createRelatorio({
        liderId,
        celula: "Célula Teste Histórico",
        tipo: "semanal",
        periodo,
        presentes: 20 + i,
        novosVisitantes: 3 + (i % 3),
        conversoes: i % 2,
        observacoes: `Relatório de teste ${i + 1}`,
      });
    }
    
    console.log(`✅ 10 relatórios criados`);
  });

  it("deve listar todos os relatórios sem filtro", async () => {
    console.log("\n=== TESTE 1: Listar todos os relatórios ===");
    
    const relatorios = await db.getRelatoriosByLiderIdWithFilters(liderId, {
      limite: 100,
    });

    console.log(`✅ ${relatorios.length} relatórios encontrados`);
    expect(relatorios.length).toBeGreaterThanOrEqual(10);
    
    relatorios.forEach((r: any, i) => {
      console.log(`  [${i + 1}] ${r.periodo}: ${r.presentes} presentes, ${r.novosVisitantes} visitantes`);
    });
  });

  it("deve filtrar relatórios do último mês", async () => {
    console.log("\n=== TESTE 2: Filtrar últimos 30 dias ===");
    
    const hoje = new Date();
    const mesAtras = new Date();
    mesAtras.setDate(mesAtras.getDate() - 30);
    
    const dataInicio = mesAtras.toISOString().split('T')[0];
    const dataFim = hoje.toISOString().split('T')[0];

    const relatorios = await db.getRelatoriosByLiderIdWithFilters(liderId, {
      dataInicio,
      dataFim,
      limite: 100,
    });

    console.log(`✅ ${relatorios.length} relatórios nos últimos 30 dias`);
    expect(relatorios.length).toBeGreaterThan(0);
  });

  it("deve calcular estatísticas corretamente", async () => {
    console.log("\n=== TESTE 3: Calcular estatísticas ===");
    
    const relatorios = await db.getRelatoriosByLiderIdWithFilters(liderId, {
      limite: 100,
    });

    const totalPresentes = relatorios.reduce((sum: number, r: any) => sum + r.presentes, 0);
    const totalVisitantes = relatorios.reduce((sum: number, r: any) => sum + r.novosVisitantes, 0);
    const mediaPresenca = totalPresentes / relatorios.length;
    const mediaVisitantes = totalVisitantes / relatorios.length;

    console.log(`✅ Estatísticas calculadas:`);
    console.log(`  Total de presentes: ${totalPresentes}`);
    console.log(`  Total de visitantes: ${totalVisitantes}`);
    console.log(`  Média de presença: ${mediaPresenca.toFixed(1)}`);
    console.log(`  Média de visitantes: ${mediaVisitantes.toFixed(1)}`);

    expect(totalPresentes).toBeGreaterThan(0);
    expect(mediaPresenca).toBeGreaterThan(0);
  });

  it("deve ordenar relatórios por data (mais recentes primeiro)", async () => {
    console.log("\n=== TESTE 4: Verificar ordenação ===");
    
    const relatorios = await db.getRelatoriosByLiderIdWithFilters(liderId, {
      limite: 100,
    });

    // Verificar se está em ordem decrescente
    for (let i = 0; i < relatorios.length - 1; i++) {
      const dataAtual = new Date(relatorios[i].periodo);
      const proxima = new Date(relatorios[i + 1].periodo);
      expect(dataAtual.getTime()).toBeGreaterThanOrEqual(proxima.getTime());
    }

    console.log(`✅ Relatórios ordenados corretamente (mais recentes primeiro)`);
    console.log(`  Primeiro: ${relatorios[0].periodo}`);
    console.log(`  Último: ${relatorios[relatorios.length - 1].periodo}`);
  });

  it("deve respeitar limite de resultados", async () => {
    console.log("\n=== TESTE 5: Respeitar limite ===");
    
    const relatorios = await db.getRelatoriosByLiderIdWithFilters(liderId, {
      limite: 5,
    });

    console.log(`✅ Limite de 5 respeitado: ${relatorios.length} resultados`);
    expect(relatorios.length).toBeLessThanOrEqual(5);
  });
});
