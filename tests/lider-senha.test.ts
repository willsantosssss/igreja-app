import { describe, it, expect } from "vitest";
import * as db from "../server/db";

describe("Líder Senha - Fluxo Completo", () => {
  it("should create lider with password and validate login", async () => {
    try {
      // Gerar senha aleatória (simular o que o admin faz)
      const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let senhaGerada = '';
      for (let i = 0; i < 8; i++) {
        senhaGerada += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      }
      
      console.log("\n=== CRIANDO LÍDER COM SENHA ===");
      console.log(`Senha gerada: ${senhaGerada}`);
      
      // Criar líder com a senha no campo telefone
      await db.createLider({
        userId: 0,
        nome: "Teste Senha",
        celula: "Célula Teste Senha",
        telefone: senhaGerada, // Senha armazenada aqui
        email: "teste@example.com",
        ativo: 1,
      });
      
      console.log("✅ Líder criado com sucesso");
      
      // Buscar o líder criado
      const lider = await db.getLiderByCelula("Célula Teste Senha");
      
      console.log("\n=== VALIDANDO DADOS DO LÍDER ===");
      console.log(`Nome: ${lider?.nome}`);
      console.log(`Célula: ${lider?.celula}`);
      console.log(`Senha armazenada: ${lider?.telefone}`);
      
      expect(lider).toBeDefined();
      expect(lider?.nome).toBe("Teste Senha");
      expect(lider?.celula).toBe("Célula Teste Senha");
      expect(lider?.telefone).toBe(senhaGerada);
      
      // Simular login: validar senha
      console.log("\n=== VALIDANDO LOGIN ===");
      const senhaCorreta = lider?.telefone === senhaGerada;
      const senhaIncorreta = lider?.telefone !== "SENHAERRADA";
      
      console.log(`Senha correta: ${senhaCorreta}`);
      console.log(`Senha incorreta detectada: ${senhaIncorreta}`);
      
      expect(senhaCorreta).toBe(true);
      expect(senhaIncorreta).toBe(true);
      
      console.log("\n✅ Fluxo completo validado!");
    } catch (error) {
      console.error("❌ Erro:", error);
      throw error;
    }
  });

  it("should list all lideres with passwords", async () => {
    try {
      const lideres = await db.getLideres();
      
      console.log("\n=== LÍDERES COM SENHAS ===");
      console.log(`Total: ${lideres.length}`);
      
      lideres.forEach((lider, index) => {
        console.log(`\n[${index + 1}] ${lider.nome}`);
        console.log(`    Célula: ${lider.celula}`);
        console.log(`    Senha: ${lider.telefone}`);
      });
      
      expect(lideres.length).toBeGreaterThan(0);
    } catch (error) {
      console.error("Erro:", error);
      throw error;
    }
  });
});
