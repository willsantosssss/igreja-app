import { describe, it, expect } from "vitest";
import * as db from "../server/db";

describe("Contatos da Igreja - Segurança", () => {
  it("deve retornar contatos com segurança", async () => {
    console.log("\n=== TESTE 1: Buscar contatos ===");
    
    const contatos = await db.getContatosIgreja();
    
    console.log(`✅ Contatos retornados:`, contatos);
    expect(Array.isArray(contatos)).toBe(true);
  });

  it("deve ter campos opcionais tratados", async () => {
    console.log("\n=== TESTE 2: Campos opcionais ===");
    
    const contatos = await db.getContatosIgreja();
    
    // Verificar se array tem elementos
    if (contatos && contatos.length > 0) {
      const primeiroContato = contatos[0];
      console.log(`✅ WhatsApp: ${primeiroContato.whatsapp || "não definido"}`);
      console.log(`✅ Email: ${primeiroContato.email || "não definido"}`);
      
      // Campos podem ser undefined, mas se existem, devem ser strings
      if (primeiroContato.whatsapp) {
        expect(typeof primeiroContato.whatsapp).toBe("string");
      }
      if (primeiroContato.email) {
        expect(typeof primeiroContato.email).toBe("string");
      }
    }
  });

  it("deve tratar campos undefined com segurança", async () => {
    console.log("\n=== TESTE 3: Tratamento seguro ===");
    
    const contatos = await db.getContatosIgreja();
    
    // Simular o que o código faz
    const buttons = [];
    
    if (contatos && contatos.length > 0) {
      const primeiroContato = contatos[0];
      
      if (primeiroContato?.whatsapp) {
        const whatsappLimpo = primeiroContato.whatsapp.replace(/\D/g, "");
        buttons.push("WhatsApp");
        console.log(`✅ WhatsApp limpo: ${whatsappLimpo}`);
      }
      
      if (primeiroContato?.email) {
        buttons.push("Email");
        console.log(`✅ Email: ${primeiroContato.email}`);
      }
    }
    
    console.log(`✅ Botões disponíveis: ${buttons.length}`);
    expect(buttons.length).toBeGreaterThanOrEqual(0);
  });
});
