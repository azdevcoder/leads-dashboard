import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("configuração de publicação", () => {
  it("mantém os assets da aplicação full-stack na raiz do domínio", () => {
    const source = readFileSync(new URL("./vite.config.ts", import.meta.url), "utf8");

    expect(source).toContain('base: "/",');
    expect(source).not.toContain('base: process.env.NODE_ENV === "production" ? "/leads-dashboard/" : "/",');
  });
});
