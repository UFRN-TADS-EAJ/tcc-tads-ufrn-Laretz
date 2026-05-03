import { expect, describe, it, beforeEach } from "vitest";
import { DesvincularUserCursoUseCase } from "@/use-cases/user-curso/desvincular-user-curso";
import { InMemoryUserCursoRepository } from "@/repositories/in-memory/in-memory-user-curso-repository";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

let userCursoRepository: InMemoryUserCursoRepository;
let sut: DesvincularUserCursoUseCase;

describe("Desvincular User Curso Use Case", () => {
  beforeEach(() => {
    userCursoRepository = new InMemoryUserCursoRepository();
    sut = new DesvincularUserCursoUseCase(userCursoRepository);
  });

  it("deve ser possível desvincular um usuário de um curso", async () => {
    const userCurso = await userCursoRepository.create({
      user: { connect: { id: "user-id" } },
      curso: { connect: { id: "curso-id" } },
      ativo: true,
    });

    await sut.execute({
      id_user: "user-id",
      id_curso: "curso-id",
    });

    const userCursoAtualizado = await userCursoRepository.findByUserAndCurso(
      "user-id",
      "curso-id"
    );

    expect(userCursoAtualizado?.ativo).toBe(false);
  });

  it("não deve ser possível desvincular um vínculo inexistente", async () => {
    await expect(() =>
      sut.execute({
        id_user: "user-inexistente",
        id_curso: "curso-inexistente",
      })
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });

  it("não deve ser possível desvincular um vínculo já inativo", async () => {
    await userCursoRepository.create({
      user: { connect: { id: "user-id" } },
      curso: { connect: { id: "curso-id" } },
      ativo: false,
    });

    await expect(() =>
      sut.execute({
        id_user: "user-id",
        id_curso: "curso-id",
      })
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });
});