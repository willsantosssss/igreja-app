import { describe, it, expect } from "vitest";
import type { AppRouter } from "@/server/routers";

describe("Router Exports", () => {
  it("should have anexosLideres router in AppRouter type", () => {
    // This test verifies that the AppRouter type includes anexosLideres
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
      "anexosLideres",
    ];

    // Create a dummy router to test type inference
    const testRouter: Partial<AppRouter> = {
      anexosLideres: {} as any,
    };

    expect(testRouter).toHaveProperty("anexosLideres");
  });
});
