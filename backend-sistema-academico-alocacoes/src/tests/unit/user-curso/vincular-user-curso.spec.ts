import { expect, describe, it, beforeEach } from "vitest";
import { VincularUserCursoUseCase } from "@/use-cases/user-curso/vincular-user-curso";
import { InMemoryUserCursoRepository } from "@/repositories/in-memory/in-memory-user-curso-repository";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";
import { InMemoryCursosRepository } from "@/repositories/in-memory/in-memory-cursos-repository";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";
import { hash } from "bcryptjs";

let userCursoRepository: InMemoryUserCursoRepository;
let usersRepository: InMemoryUsersRepository;
let cursosRepository: InMemoryCursosRepository;
let sut: VincularUserCursoUseCase;

describe("Vincular User Curso Use Case", () => {
  beforeEach(() => {
    userCursoRepository = new InMemoryUserCursoRepository();
    usersRepository = new InMemoryUsersRepository();
    cursosRepository = new InMemoryCursosRepository();
    sut = new VincularUserCursoUseCase(
      userCursoRepository,
      usersRepository,
      cursosRepository
    );
  });

  it("deve ser possível vincular um usuário a um curso", async () => {
    const user = await usersRepository.create({
      nome: "Professor Teste",
      email: "professor@teste.com",
      senha: await hash("123456", 6),
      role: "PROFESSOR",
    });

    const curso = await cursosRepository.create({
      codigo: "SI",
      nome: "Sistemas de Informação",
      turno: "NOTURNO",
      duracao_semestres: 8,
    });

    const { userCurso } = await sut.execute({
      id_user: user.id,
      id_curso: curso.id,
    });

    expect(userCurso.id).toEqual(expect.any(String));
    expect(userCurso.id_user).toEqual(user.id);
    expect(userCurso.id_curso).toEqual(curso.id);
    expect(userCurso.ativo).toBe(true);
  });

  it("não deve ser possível vincular um usuário inexistente", async () => {
    const curso = await cursosRepository.create({
      codigo: "SI",
      nome: "Sistemas de Informação",
      turno: "NOTURNO",
      duracao_semestres: 8,
    });

    await expect(() =>
      sut.execute({
        id_user: "user-inexistente",
        id_curso: curso.id,
      })
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });

  it("não deve ser possível vincular a um curso inexistente", async () => {
    const user = await usersRepository.create({
      nome: "Professor Teste",
      email: "professor@teste.com",
      senha: await hash("123456", 6),
      role: "PROFESSOR",
    });

    await expect(() =>
      sut.execute({
        id_user: user.id,
        id_curso: "curso-inexistente",
      })
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });
});