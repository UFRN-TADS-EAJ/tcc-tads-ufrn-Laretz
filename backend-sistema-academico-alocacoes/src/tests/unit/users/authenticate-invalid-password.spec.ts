import { describe, it, expect } from "vitest";
import { AuthenticateUseCase } from "@/use-cases/users/authenticate";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";
import { hash } from "bcryptjs";
import { CredenciaisInvalidas } from "@/use-cases/errors/credenciais-invalidas";

describe("AuthenticateUseCase — senha inválida", () => {
  it("deve lançar erro quando a senha não confere", async () => {
    const repo = new InMemoryUsersRepository();
    const senhaHash = await hash("correta", 6);
    await repo.create({ nome: "A", email: "a@ex.com", senha: senhaHash, role: "PROFESSOR" } as any);
    const sut = new AuthenticateUseCase(repo);

    await expect(() => sut.execute({ email: "a@ex.com", senha: "errada" })).rejects.toBeInstanceOf(CredenciaisInvalidas);
  });
});