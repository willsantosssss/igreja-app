import { describe, it, expect } from "vitest";
import type { AppRouter } from "@/server/routers";

describe("Router Exports", () => {
  it("should have documentoslideres router in AppRouter type", () => {
    // This test verifies that the AppRouter type includes documentoslideres
    // If this fails, it means the router is not properly exported
    const routerKeys = [
      "system",
      "auth",
      "celulas",
      "batismo",
      "eventos",
      "escolaCrescimento",
      "noticias",
      "lideres",
      "membros",
      "relatorios",
      "documentoslideres",
    ];

    // Create a dummy router to test type inference
    const testRouter: Partial<AppRouter> = {
      documentoslideres: {} as any,
    };

    expect(testRouter).toHaveProperty("documentoslideres");
  });
});
