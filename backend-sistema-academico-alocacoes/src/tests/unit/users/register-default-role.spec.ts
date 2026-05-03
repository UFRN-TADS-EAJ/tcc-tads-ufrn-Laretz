import { describe, it, expect } from "vitest";
import { RegisterUseCase } from "@/use-cases/users/register";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";

describe("RegisterUseCase — papel padrão quando role undefined", () => {
  it("deve criar usuário com role padrão PROFISSOR quando não informado", async () => {
    const repo = new InMemoryUsersRepository();
    const sut = new RegisterUseCase(repo as any);
    const { user } = await sut.execute({ nome: "A", email: "a@ex.com", senha: "h", role: undefined } as any);
    expect(user.role).toBe("PROFESSOR");
  });
});