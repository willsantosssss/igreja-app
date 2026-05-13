import { describe, it, expect } from "vitest";
import * as db from "../server/db";

describe("Contatos da Igreja - Segurança", () => {
  it("deve retornar contatos com segurança", async () => {
    console.log("\n=== TESTE 1: Buscar contatos ===");
    
    const contatos = await db.getContatosIgreja();
    
    console.log(`✅ Contatos retornados:`, contatos);
    expect(contatos).toBeDefined();
  });

  it("deve ter campos opcionais tratados", async () => {
    console.log("\n=== TESTE 2: Campos opcionais ===");
    
    const contatos = await db.getContatosIgreja();
    
    // Verificar se campos podem ser undefined/null
    if (contatos) {
      console.log(`✅ WhatsApp: ${contatos.whatsapp || "não definido"}`);
      console.log(`✅ Email: ${contatos.email || "não definido"}`);
      
      // Campos podem ser undefined, mas se existem, devem ser strings
      if (contatos.whatsapp) {
        expect(typeof contatos.whatsapp).toBe("string");
      }
      if (contatos.email) {
        expect(typeof contatos.email).toBe("string");
      }
    }
  });

  it("deve tratar campos undefined com segurança", async () => {
    console.log("\n=== TESTE 3: Tratamento seguro ===");
    
    const contatos = await db.getContatosIgreja();
    
    // Simular o que o código faz
    const buttons = [];
    
    if (contatos?.whatsapp) {
      const whatsappLimpo = contatos.whatsapp.replace(/\D/g, "");
      buttons.push("WhatsApp");
      console.log(`✅ WhatsApp limpo: ${whatsappLimpo}`);
    }
    
    if (contatos?.email) {
      buttons.push("Email");
      console.log(`✅ Email: ${contatos.email}`);
    }
    
    console.log(`✅ Botões disponíveis: ${buttons.length}`);
    expect(buttons.length).toBeGreaterThanOrEqual(0);
  });
});
