import { describe, it, expect } from "vitest";

describe("LiderId Validation", () => {
  it("should convert string timestamp to valid integer", () => {
    // Simular ID antigo do AsyncStorage (timestamp)
    const oldId = "1707123456789"; // Timestamp em ms
    const convertedId = parseInt(oldId, 10);
    
    console.log("Old ID (timestamp):", oldId);
    console.log("Converted ID:", convertedId);
    console.log("Is valid int:", !isNaN(convertedId) && convertedId > 0);
    
    // Isso vai dar um número muito grande (fora do range de int)
    expect(convertedId).toBeGreaterThan(0);
    expect(convertedId).toBeGreaterThan(2147483647); // Max int32
  });

  it("should handle valid small integer IDs from database", () => {
    // ID real do banco de dados
    const dbId = "1"; // ID pequeno do banco
    const convertedId = parseInt(dbId, 10);
    
    console.log("DB ID:", dbId);
    console.log("Converted ID:", convertedId);
    
    expect(convertedId).toBe(1);
    expect(convertedId).toBeLessThan(2147483647); // Max int32
  });

  it("should reject invalid IDs", () => {
    const invalidIds = ["abc", "", "null", "-1", "0"];
    
    invalidIds.forEach(id => {
      const converted = parseInt(id, 10);
      const isValid = !isNaN(converted) && converted > 0;
      
      console.log(`ID: "${id}" -> ${converted} -> Valid: ${isValid}`);
      expect(isValid).toBe(false);
    });
  });

  it("should identify timestamp vs database ID", () => {
    const timestampId = "1707123456789"; // 13 dígitos
    const dbId = "42"; // 2 dígitos
    
    const isTimestamp = timestampId.length > 10;
    const isDbId = dbId.length <= 10;
    
    console.log("Timestamp ID length:", timestampId.length, "-> Is timestamp:", isTimestamp);
    console.log("DB ID length:", dbId.length, "-> Is DB ID:", isDbId);
    
    expect(isTimestamp).toBe(true);
    expect(isDbId).toBe(true);
  });

  it("should validate liderId before sending to database", () => {
    const testCases = [
      { input: "1", expected: 1, valid: true },
      { input: "42", expected: 42, valid: true },
      { input: "999", expected: 999, valid: true },
      { input: "1707123456789", expected: 1707123456789, valid: false }, // Too large
      { input: "abc", expected: NaN, valid: false },
      { input: "", expected: NaN, valid: false },
      { input: "0", expected: 0, valid: false },
      { input: "-1", expected: -1, valid: false },
    ];

    testCases.forEach(({ input, expected, valid }) => {
      const converted = parseInt(input, 10);
      const isValid = !isNaN(converted) && converted > 0 && converted < 2147483647;
      
      console.log(`Input: "${input}" -> ${converted} -> Valid: ${isValid}`);
      
      if (valid) {
        expect(converted).toBe(expected);
        expect(isValid).toBe(true);
      } else {
        expect(isValid).toBe(false);
      }
    });
  });
});
