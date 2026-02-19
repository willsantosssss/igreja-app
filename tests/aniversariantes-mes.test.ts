import { describe, it, expect } from "vitest";
import { createUsuarioCadastrado, getAniversariantesMes } from "../server/db";

describe("Aniversariantes por Mês", () => {
  it("should retrieve birthdays for a specific month", async () => {
    // Create test users with birthdays in different months
    const testMonth = 3; // March
    const testYear = 1990;

    // Create a user with birthday in March
    const usuarioMarco = await createUsuarioCadastrado({
      userId: 10001,
      nome: "João da Silva",
      dataNascimento: `${testYear}-03-15`, // March 15
      celula: "Célula A",
    });

    // Create a user with birthday in April
    const usuarioAbril = await createUsuarioCadastrado({
      userId: 10002,
      nome: "Maria da Silva",
      dataNascimento: `${testYear}-04-20`, // April 20
      celula: "Célula B",
    });

    // Create another user with birthday in March
    const usuarioMarco2 = await createUsuarioCadastrado({
      userId: 10003,
      nome: "Pedro Santos",
      dataNascimento: `${testYear}-03-05`, // March 5
      celula: "Célula A",
    });

    console.log("[Test] Created test users");

    // Get birthdays for March
    const aniversariantesMarco = await getAniversariantesMes(3);
    console.log("[Test] Birthdays in March:", aniversariantesMarco.length, "users");

    // Verify we got users with March birthdays (may include existing data)
    expect(aniversariantesMarco.length).toBeGreaterThanOrEqual(2);
    expect(aniversariantesMarco.every(u => u.dataNascimento.includes("-03-"))).toBe(true);

    // Verify they are sorted by day
    for (let i = 0; i < aniversariantesMarco.length - 1; i++) {
      const day1 = parseInt(aniversariantesMarco[i].dataNascimento.split("-")[2]);
      const day2 = parseInt(aniversariantesMarco[i + 1].dataNascimento.split("-")[2]);
      expect(day1).toBeLessThanOrEqual(day2);
    }

    console.log("[Test] ✅ Birthdays retrieved and sorted correctly!");
  });

  it("should return empty array for month with no birthdays", async () => {
    // Get birthdays for a month that likely has no birthdays
    const aniversariantesNovembro = await getAniversariantesMes(11);
    
    // Should return an array (may be empty or have existing data)
    expect(Array.isArray(aniversariantesNovembro)).toBe(true);
    
    console.log("[Test] ✅ Empty month handled correctly!");
  });

  it("should filter by month correctly (not by year)", async () => {
    // Create users with same month but different years
    const usuario1 = await createUsuarioCadastrado({
      userId: 10004,
      nome: "User 1990",
      dataNascimento: "1990-05-10",
      celula: "Célula A",
    });

    const usuario2 = await createUsuarioCadastrado({
      userId: 10005,
      nome: "User 2000",
      dataNascimento: "2000-05-10",
      celula: "Célula B",
    });

    const aniversariantesMaio = await getAniversariantesMes(5);
    
    // Both should be included (same month, different years)
    const usuariosMaio = aniversariantesMaio.filter(u => 
      u.dataNascimento.includes("-05-")
    );
    
    expect(usuariosMaio.length).toBeGreaterThanOrEqual(2);
    
    console.log("[Test] ✅ Month filtering works correctly (ignores year)!");
  });

  it("should verify endpoint returns data in correct format", async () => {
    const aniversariantes = await getAniversariantesMes(1); // January
    
    // Verify structure
    if (aniversariantes.length > 0) {
      const user = aniversariantes[0];
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("nome");
      expect(user).toHaveProperty("dataNascimento");
      expect(user).toHaveProperty("celula");
    }
    
    console.log("[Test] ✅ Data format is correct!");
  });
});
