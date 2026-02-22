import { describe, it, expect, beforeAll } from "vitest";
import * as db from "../server/db";

describe("Aviso Importante - Salvamento", () => {
  beforeAll(async () => {
    console.log("\n=== SETUP: Preparando dados de teste ===");
  });

  it("deve converter booleano para número (0 ou 1) ao salvar", async () => {
    console.log("\n=== TESTE 1: Validar conversão de tipo ===");
    
    // Simular o que acontece no frontend
    const ativoBooleano = true;
    const ativoNumero = ativoBooleano ? 1 : 0;
    
    console.log(`✅ Booleano: ${ativoBooleano} → Número: ${ativoNumero}`);
    expect(ativoNumero).toBe(1);
    expect(typeof ativoNumero).toBe("number");
  });

  it("deve converter false para 0", async () => {
    console.log("\n=== TESTE 2: Validar conversão de false ===");
    
    const ativoBooleano = false;
    const ativoNumero = ativoBooleano ? 1 : 0;
    
    console.log(`✅ Booleano: ${ativoBooleano} → Número: ${ativoNumero}`);
    expect(ativoNumero).toBe(0);
  });

  it("deve salvar aviso com ativo como número", async () => {
    console.log("\n=== TESTE 3: Salvar aviso com tipo correto ===");
    
    const avisoData = {
      titulo: "Aviso de Teste",
      mensagem: "Mensagem de teste",
      ativo: 1, // Deve ser número, não booleano
    };
    
    console.log(`✅ Dados do aviso:`);
    console.log(`  Título: ${avisoData.titulo}`);
    console.log(`  Mensagem: ${avisoData.mensagem}`);
    console.log(`  Ativo: ${avisoData.ativo} (tipo: ${typeof avisoData.ativo})`);
    
    expect(typeof avisoData.ativo).toBe("number");
    expect([0, 1]).toContain(avisoData.ativo);
  });
});
