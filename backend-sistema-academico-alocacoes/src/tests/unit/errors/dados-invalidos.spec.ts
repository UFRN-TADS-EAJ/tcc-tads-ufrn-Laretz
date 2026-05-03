import { describe, it, expect } from "vitest";
import { DadosInvalidosError } from "@/use-cases/errors/dados-invalidos";

describe("Erros — DadosInvalidosError", () => {
  it("deve instanciar com mensagem padrão", () => {
    const e = new DadosInvalidosError();
    expect(e).toBeInstanceOf(Error);
    expect(typeof e.message).toBe("string");
  });
});