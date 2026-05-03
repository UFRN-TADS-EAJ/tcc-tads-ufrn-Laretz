import { describe, it, expect } from "vitest";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";
import { BuscarUsuarioUseCase } from "@/use-cases/users/buscar-usuario";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

describe("BuscarUsuarioUseCase", () => {
  it("deve retornar usuário por id", async () => {
    const repo = new InMemoryUsersRepository();
    const created = await repo.create({
      nome: "João Silva",
      email: "joao@exemplo.com",
      senha: "hash",
      role: "PROFESSOR",
    });

    const sut = new BuscarUsuarioUseCase(repo);
    const { usuario } = await sut.execute({ id: created.id });
    expect(usuario.email).toBe("joao@exemplo.com");
    expect(usuario.nome).toBe("João Silva");
  });

  it("deve falhar quando usuário não existe", async () => {
    const repo = new InMemoryUsersRepository();
    const sut = new BuscarUsuarioUseCase(repo);
    await expect(sut.execute({ id: "inexistente" })).rejects.toBeInstanceOf(
      RecursoNaoEncontradoError
    );
  });
});