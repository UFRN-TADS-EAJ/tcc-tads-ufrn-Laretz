import { describe, it, expect } from "vitest";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";
import { ExcluirUsuarioUseCase } from "@/use-cases/users/excluir-usuario";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

describe("ExcluirUsuarioUseCase", () => {
  it("deve excluir usuário existente", async () => {
    const repo = new InMemoryUsersRepository();
    const created = await repo.create({
      nome: "Zé",
      email: "ze@ex.com",
      senha: "hash",
      role: "PROFESSOR",
    });

    const sut = new ExcluirUsuarioUseCase(repo);
    await sut.execute({ id: created.id });

    const find = await repo.findById(created.id);
    expect(find).toBeNull();
  });

  it("deve falhar ao excluir id inexistente", async () => {
    const repo = new InMemoryUsersRepository();
    const sut = new ExcluirUsuarioUseCase(repo);
    await expect(sut.execute({ id: "inexistente" })).rejects.toBeInstanceOf(
      RecursoNaoEncontradoError
    );
  });
});