import { describe, it, expect } from "vitest";
import { AtualizarUsuarioUseCase } from "@/use-cases/users/atualizar-usuario";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

describe("AtualizarUsuarioUseCase — usuário inexistente", () => {
  it("deve lançar erro quando o usuário não existir", async () => {
    const repo = new InMemoryUsersRepository();
    const sut = new AtualizarUsuarioUseCase(repo);

    await expect(() => sut.execute({ id: "nao-existe" })).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });
});