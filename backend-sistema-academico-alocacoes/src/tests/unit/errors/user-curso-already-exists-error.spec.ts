import { describe, it, expect } from "vitest";
import { UserCursoAlreadyExistsError } from "@/use-cases/errors/user-curso-already-exists-error";

describe("Erros — UserCursoAlreadyExistsError", () => {
  it("deve instanciar com mensagem padrão", () => {
    const e = new UserCursoAlreadyExistsError();
    expect(e).toBeInstanceOf(Error);
    expect(typeof e.message).toBe("string");
  });
});