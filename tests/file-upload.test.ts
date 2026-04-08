import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "fs";
import * as path from "path";
import FormData from "form-data";

const API_BASE_URL = "http://localhost:3000";

describe("File Upload API", () => {
  let testFilePath: string;

  beforeAll(() => {
    // Create a test PDF file
    testFilePath = path.join(__dirname, "test-document.pdf");
    const pdfContent = Buffer.from("%PDF-1.4\n%test pdf content\n");
    fs.writeFileSync(testFilePath, pdfContent);
  });

  afterAll(() => {
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  it("should upload a file and return a URL", async () => {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(testFilePath), "test-document.pdf");

    const response = await globalThis.fetch(`${API_BASE_URL}/api/upload`, {
      method: "POST",
      body: formData as any,
      headers: formData.getHeaders?.() || {},
    });

    expect(response.status).toBe(200);
    const data = (await response.json()) as any;
    expect(data.url).toBeDefined();
    expect(typeof data.url).toBe("string");
    expect(data.url.length).toBeGreaterThan(0);
    expect(data.fileName).toBe("test-document.pdf");
  });

  it("should reject upload without file", async () => {
    const formData = new FormData();

    const response = await globalThis.fetch(`${API_BASE_URL}/api/upload`, {
      method: "POST",
      body: formData as any,
      headers: formData.getHeaders?.() || {},
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as any;
    expect(data.error).toBeDefined();
  });

  it("should handle various file types", async () => {
    const fileTypes = [
      { name: "test.pdf", content: "%PDF-1.4\n" },
      { name: "test.txt", content: "Hello World" },
      { name: "test.jpg", content: Buffer.from([0xff, 0xd8, 0xff, 0xe0]) },
    ];

    for (const fileType of fileTypes) {
      const testPath = path.join(__dirname, fileType.name);
      fs.writeFileSync(testPath, fileType.content);

      try {
        const formData = new FormData();
        formData.append("file", fs.createReadStream(testPath), fileType.name);

        const response = await globalThis.fetch(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          body: formData as any,
          headers: formData.getHeaders?.() || {},
        });

        expect(response.status).toBe(200);
        const data = (await response.json()) as any;
        expect(data.url).toBeDefined();
        expect(data.fileName).toBe(fileType.name);
      } finally {
        if (fs.existsSync(testPath)) {
          fs.unlinkSync(testPath);
        }
      }
    }
  });
});
